# -*- coding: utf-8 -*-
"""Fetch an optional runtime without changing the desktop's active components.
"""

from __future__ import annotations

import os
import shutil
from pathlib import Path
from typing import Callable
from urllib.parse import urlparse

import httpx

from ... import distribution
from ...__version__ import __version__
from ...components.client import ComponentClient
from ...components.service import DIRECTORY_COMPONENT_IDS
from ...components.update import (
    ComponentUpdater,
    ComponentUpdatePlan,
    detect_target,
)


def stage_cloud_runtime(
    staging: Path,
    cache: Path,
    report: Callable[[str, int], None],
) -> bool:
    """Use signed full packages, including on machines with no install record.

    Only an unavailable metadata endpoint falls back to the upstream installer.
    Signature, compatibility, inventory and artifact failures remain fatal.
    The ordinary desktop protocol/host guards are deliberately retained.
    """
    target = detect_target()
    url = os.environ.get(
        "QWENPAW_COMPONENT_MANIFEST_URL",
        f"{distribution.COMPONENT_BASE_URL}/metadata/components/stable/"
        f"{target}.current.json",
    )
    updater = ComponentUpdater(
        public_key_b64=os.environ.get(
            "QWENPAW_COMPONENT_PUBLIC_KEY",
            distribution.COMPONENT_PUBLIC_KEY,
        ),
        # The signed desktop manifest also contains other runtime directories.
        # Parse their metadata under the same policy as the desktop updater;
        # only the two explicit components below may be downloaded/extracted.
        managed_components=set(DIRECTORY_COMPONENT_IDS),
        directory_components=set(DIRECTORY_COMPONENT_IDS),
        core_version=os.environ.get("QWENPAW_DESKTOP_VERSION") or __version__,
        target=target,
    )
    client = ComponentClient(
        updater,
        cache,
        default_allowed_host=urlparse(url).hostname,
    )
    try:
        report("正在检查 UGSci 运行环境下载源", 5)
        try:
            manifest = client.fetch_manifest(url)
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code not in {404, 502, 503, 504}:
                raise
            return False
        except (httpx.ConnectError, httpx.TimeoutException):
            return False
        entries = manifest["components"]
        if not {"java-runtime", "neqsim"} <= entries.keys():
            raise RuntimeError("下载源未提供完整的 NeqSim 运行环境")
        # Extract independently: both packages contain component.json.
        for component, progress in (("java-runtime", 15), ("neqsim", 55)):
            entry = entries[component]
            artifact = entry["full"]
            report(f"正在下载并校验 {component}", progress)
            archive = client.download_artifact(
                artifact["url"],
                sha256=artifact["sha256"],
                size=artifact["size"],
                name=f"{component}.zip",
            )
            plan = ComponentUpdatePlan(
                component=component,
                from_version=None,
                target_version=entry["version"],
                artifact_kind="full",
                artifact_url=artifact["url"],
                artifact_sha256=artifact["sha256"],
                artifact_signature=artifact["signature"],
                preserve_paths=(),
            )
            destination = staging / (
                "java" if component == "java-runtime" else "neqsim"
            )
            updater.prepare_full(
                plan,
                archive,
                destination,
                expected_files=entry["files"],
            )
        # Preserve the upstream version marker and notices, rather than
        # labelling an arbitrary cloud JAR with the version we expect.
        for item in (staging / "neqsim").iterdir():
            shutil.move(str(item), staging / item.name)
        (staging / "neqsim").rmdir()
        return True
    finally:
        client.close()
