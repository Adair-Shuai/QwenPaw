# -*- coding: utf-8 -*-
"""Shared helpers for deterministic component artifacts.

This module intentionally has no runtime imports from QwenPaw.  The existing
desktop updater and plugin loader therefore remain completely unchanged while
release tooling can evolve independently.
"""

from __future__ import annotations

import hashlib
import json
import stat
from pathlib import Path, PurePosixPath
from typing import Any, Iterator

from packaging.version import InvalidVersion, Version

DEFAULT_PRESERVE_PATHS = ("engines",)
_PRESERVED_NAMES = frozenset(
    {
        *DEFAULT_PRESERVE_PATHS,
        ".uninstalled",
        ".bundle_hash",
        ".bundle_revision",
        ".bundle_complete",
    },
)


def safe_relative_path(value: str) -> str:
    """Validate and normalize an archive-relative POSIX path."""
    if "\\" in value or "\x00" in value:
        raise ValueError(f"unsafe relative path: {value!r}")
    path = PurePosixPath(value)
    if not value or path.is_absolute() or ".." in path.parts:
        raise ValueError(f"unsafe relative path: {value!r}")
    normalized = path.as_posix()
    if normalized in {"", "."} or normalized.startswith("/"):
        raise ValueError(f"unsafe relative path: {value!r}")
    return normalized


def iter_files(
    root: Path,
    preserve_paths: tuple[str, ...] = DEFAULT_PRESERVE_PATHS,
) -> Iterator[tuple[str, Path]]:
    """Yield regular files below *root* in deterministic path order."""
    root = root.resolve()
    if not root.is_dir():
        raise ValueError(f"component root is not a directory: {root}")
    entries: list[tuple[str, Path]] = []
    for path in root.rglob("*"):
        if path.is_symlink():
            raise ValueError(
                f"symlinks are not allowed in component trees: {path}",
            )
        if not path.is_file():
            continue
        if path.stat().st_nlink > 1:
            raise ValueError(
                f"hard links are not allowed in component trees: {path}",
            )
        relative = safe_relative_path(path.relative_to(root).as_posix())
        if (
            relative in _PRESERVED_NAMES
            or PurePosixPath(relative).parts[0] in preserve_paths
            or relative
            in {
                ".uninstalled",
                ".bundle_hash",
                ".bundle_revision",
                ".bundle_complete",
            }
        ):
            continue
        entries.append((relative, path))
    yield from sorted(entries, key=lambda item: item[0])


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def file_inventory(
    root: Path,
    preserve_paths: tuple[str, ...] = DEFAULT_PRESERVE_PATHS,
) -> dict[str, dict[str, Any]]:
    """Return a deterministic path -> size/hash inventory."""
    return {
        relative: {
            "size": path.stat().st_size,
            "sha256": sha256_file(path),
            "mode": stat.S_IMODE(path.stat().st_mode),
        }
        for relative, path in iter_files(root, preserve_paths)
    }


def canonical_json(data: Any) -> bytes:
    return (
        json.dumps(
            data,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        )
        + "\n"
    ).encode("utf-8")


def read_plugin_metadata(root: Path) -> tuple[str, str]:
    """Read plugin id/version when a component is a plugin directory."""
    manifest_path = root / "plugin.json"
    if not manifest_path.is_file():
        return root.name, "0.0.0"
    data = json.loads(manifest_path.read_text(encoding="utf-8-sig"))
    if not isinstance(data, dict):
        raise ValueError(
            f"plugin.json must contain an object: {manifest_path}",
        )
    component_id = data.get("id", root.name)
    version = data.get("version", "0.0.0")
    if not isinstance(component_id, str) or not component_id.strip():
        raise ValueError(f"invalid plugin id: {manifest_path}")
    if any(
        char in component_id for char in ("/", "\\", "\x00")
    ) or component_id in {".", ".."}:
        raise ValueError(f"unsafe plugin id: {component_id!r}")
    if not isinstance(version, str) or not version.strip():
        raise ValueError(f"invalid plugin version: {manifest_path}")
    try:
        Version(version)
    except InvalidVersion as exc:
        raise ValueError(f"invalid plugin version: {version!r}") from exc
    return component_id.strip(), version.strip()
