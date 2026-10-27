#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Renew signed metadata without changing the selected release or its artifacts."""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
import subprocess
import tempfile
from urllib.parse import urlparse

from check_component_pointer_promotion import _load_verified, _private_key
from component_common import atomic_write_bytes, canonical_json


def renew(
    pointer_path,
    output,
    *,
    private_key_b64,
    target,
    manifest,
    history,
    now=None,
):
    private = _private_key(private_key_b64)
    pointer = _load_verified(pointer_path, private, target)
    for name, path in (("manifest", manifest), ("history", history)):
        data = path.read_bytes()
        if (
            len(data) != pointer[f"{name}_size"]
            or hashlib.sha256(data).hexdigest() != pointer[f"{name}_sha256"]
        ):
            raise ValueError(f"{name} does not match signed pointer")
        private.public_key().verify(
            base64.b64decode(pointer[f"{name}_signature"], validate=True),
            data,
        )
        if json.loads(data).get("target") != target:
            raise ValueError(f"{name} target mismatch")
    now = now or datetime.now(timezone.utc)
    pointer.pop("signature")
    pointer["published_at"] = now.isoformat().replace("+00:00", "Z")
    pointer["expires_at"] = (
        (now + timedelta(days=30)).isoformat().replace("+00:00", "Z")
    )
    pointer["signature"] = base64.b64encode(
        private.sign(canonical_json(pointer)),
    ).decode("ascii")
    atomic_write_bytes(output, canonical_json(pointer))


def renew_oss(bucket: str, target: str) -> None:
    """Run under the shared OSS publication lock; verify references before signing."""

    def copy(source, destination, *flags):
        subprocess.run(
            ["ossutil", "cp", str(source), str(destination), *flags],
            check=True,
        )

    with tempfile.TemporaryDirectory(prefix="component-renew-") as directory:
        root = Path(directory)
        uri = (
            f"oss://{bucket}/metadata/components/stable/{target}.current.json"
        )
        current = root / "current.json"
        copy(uri, current)
        key = os.environ["COMPONENT_SIGNING_PRIVATE_KEY"]
        pointer = _load_verified(current, _private_key(key), target)
        paths = {}
        for name in ("manifest", "history"):
            url = urlparse(pointer[f"{name}_url"])
            prefix = f"/metadata/components/stable/{target}-"
            if (
                url.scheme != "https"
                or not url.hostname
                or url.query
                or url.fragment
                or not url.path.startswith(prefix)
                or ".." in url.path
                or "/" in url.path[len(prefix) :]
            ):
                raise ValueError(f"unsafe {name} reference")
            paths[name] = root / f"{name}.json"
            copy(f"oss://{bucket}{url.path}", paths[name])
        renewed = root / "renewed.json"
        renew(
            current,
            renewed,
            private_key_b64=key,
            target=target,
            manifest=paths["manifest"],
            history=paths["history"],
        )
        # Also guard against a writer outside the shared workflow concurrency group.
        check = root / "check.json"
        copy(uri, check)
        if check.read_bytes() != current.read_bytes():
            raise ValueError("live component pointer changed during renewal")
        copy(
            renewed,
            uri,
            "--force",
            "--acl",
            "public-read",
            "--meta",
            "Cache-Control:public, max-age=0, must-revalidate",
        )
        copy(uri, check, "--force")
        if check.read_bytes() != renewed.read_bytes():
            raise ValueError("renewed component pointer readback mismatch")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bucket", required=True)
    parser.add_argument(
        "--target",
        choices=("windows-x86_64", "macos-aarch64"),
        required=True,
    )
    args = parser.parse_args()
    renew_oss(args.bucket, args.target)
