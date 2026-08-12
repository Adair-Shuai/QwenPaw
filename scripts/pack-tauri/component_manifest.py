# -*- coding: utf-8 -*-
"""Validation helpers for the standalone component manifest format."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from packaging.version import InvalidVersion, Version

from component_common import (
    file_inventory,
    safe_relative_path,
    read_plugin_metadata,
)

_SHA256 = re.compile(r"^[0-9a-f]{64}$", re.IGNORECASE)


def _version(value: Any, field: str) -> Version:
    try:
        return Version(str(value))
    except InvalidVersion as exc:
        raise ValueError(f"invalid {field}: {value!r}") from exc


def validate_manifest(
    manifest: dict[str, Any],
    *,
    component_root: Path | None = None,
    expected_target: str | None = None,
    core_version: str | None = None,
) -> dict[str, Any]:
    """Validate a manifest and optionally compare it with a local tree.

    This is deliberately read-only: it does not download, activate, or alter
    any plugin directory. Callers can use it as a preflight gate before the
    existing bundled-plugin transaction runs.
    """
    # pylint: disable=too-many-branches,too-many-statements
    if not isinstance(manifest, dict) or manifest.get("schema_version") != 1:
        raise ValueError("unsupported component manifest schema")
    for field in (
        "product",
        "channel",
        "target",
        "core_min_version",
        "components",
    ):
        if not manifest.get(field):
            raise ValueError(f"manifest missing {field}")
    target = str(manifest["target"])
    if expected_target is not None and target != expected_target:
        raise ValueError(
            f"manifest target {target!r} does not match {expected_target!r}",
        )
    if core_version is not None and _version(
        core_version,
        "core_version",
    ) < _version(
        manifest["core_min_version"],
        "core_min_version",
    ):
        raise ValueError("core version is below manifest minimum")
    components = manifest["components"]
    if not isinstance(components, dict) or not components:
        raise ValueError("manifest components must be a non-empty object")
    if component_root is not None and len(components) != 1:
        raise ValueError(
            "component_root validation requires exactly one component",
        )

    for component_id, component in components.items():
        if not isinstance(component_id, str) or not component_id.strip():
            raise ValueError("component id must be a non-empty string")
        if component_id in {".", ".."} or any(
            char in component_id for char in ("/", "\\", "\x00")
        ):
            raise ValueError(f"unsafe component id: {component_id!r}")
        if not isinstance(component, dict):
            raise ValueError(f"component {component_id!r} must be an object")
        _version(component.get("version"), f"{component_id}.version")
        if component.get("kind", "directory") != "directory":
            raise ValueError(f"unsupported component kind for {component_id}")
        files = component.get("files")
        if not isinstance(files, dict):
            raise ValueError(
                f"component {component_id!r} files must be an object",
            )
        seen: set[str] = set()
        for relative, metadata in files.items():
            normalized = safe_relative_path(str(relative))
            if normalized != relative or normalized in seen:
                raise ValueError(
                    f"invalid or duplicate component path: {relative!r}",
                )
            seen.add(normalized)
            if (
                not isinstance(metadata, dict)
                or type(metadata.get("size")) is not int
                or metadata["size"] < 0
            ):
                raise ValueError(
                    f"invalid metadata for {component_id}/{relative}",
                )
            digest = metadata.get("sha256")
            if not isinstance(digest, str) or not _SHA256.fullmatch(digest):
                raise ValueError(
                    f"invalid sha256 for {component_id}/{relative}",
                )
            mode = metadata.get("mode")
            if type(mode) is not int or not 0 <= mode <= 0o7777:
                raise ValueError(f"invalid mode for {component_id}/{relative}")
        full = component.get("full")
        if full is not None:
            if not isinstance(full, dict) or not full.get("url"):
                raise ValueError(f"invalid full artifact for {component_id}")
            if type(full.get("size")) is not int or full["size"] < 0:
                raise ValueError(
                    f"invalid full artifact size for {component_id}",
                )
            if not isinstance(
                full.get("sha256"),
                str,
            ) or not _SHA256.fullmatch(full["sha256"]):
                raise ValueError(
                    f"invalid full artifact sha256 for {component_id}",
                )
            if (
                not isinstance(full.get("signature"), str)
                or not full["signature"].strip()
            ):
                raise ValueError(
                    f"invalid full artifact signature for {component_id}",
                )
        deltas = component.get("deltas", [])
        if not isinstance(deltas, list):
            raise ValueError(f"invalid deltas for {component_id}")
        for delta in deltas:
            if not isinstance(delta, dict) or not all(
                delta.get(key)
                for key in ("from", "url", "sha256", "signature")
            ):
                raise ValueError(f"invalid delta metadata for {component_id}")
            _version(delta["from"], f"{component_id}.delta.from")
            if (
                type(delta.get("size")) is not int
                or delta["size"] < 0
                or not _SHA256.fullmatch(str(delta["sha256"]))
            ):
                raise ValueError(f"invalid delta size/hash for {component_id}")
        min_core = component.get("min_core_version")
        if min_core is not None:
            _version(min_core, f"{component_id}.min_core_version")
            if core_version is not None and _version(
                core_version,
                "core_version",
            ) < _version(min_core, f"{component_id}.min_core_version"):
                raise ValueError(
                    f"core version is below {component_id} minimum",
                )

    if component_root is not None:
        component_id, local_version = read_plugin_metadata(component_root)
        component = components.get(component_id)
        if component is None:
            raise ValueError(
                f"local component {component_id!r} missing from manifest",
            )
        if _version(local_version, "local component version") != _version(
            component["version"],
            "component version",
        ):
            raise ValueError("local component version does not match manifest")
        if (
            file_inventory(
                component_root,
                tuple(component.get("preserve") or ("engines",)),
            )
            != component["files"]
        ):
            raise ValueError(
                "local component file inventory does not match manifest",
            )
    return manifest
