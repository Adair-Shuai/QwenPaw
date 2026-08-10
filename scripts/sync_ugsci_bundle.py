#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Synchronize the canonical UGSci plugin into the Python package mirror.

The editable source lives in ``plugins/bundle/ugsci``.  The
``src/qwenpaw/plugins_bundle/ugsci`` directory is a packaging mirror and
must not be edited independently.
"""

from __future__ import annotations

import argparse
import hashlib
import shutil
from pathlib import Path

# Markdown sources and developer documentation stay only in the canonical
# plugin tree. Generated offline documentation under ``static/docs`` is
# runtime package data and must be mirrored into wheels and desktop bundles.
EXCLUDED_PARTS = {"node_modules", "__pycache__"}
EXCLUDED_NAMES = {".DS_Store"}
EXCLUDED_SUFFIXES = {".pyc", ".pyo"}


def _repo_root() -> Path:
    return Path(__file__).resolve().parent.parent


def _is_included(relative_path: Path) -> bool:
    return (
        (not relative_path.parts or relative_path.parts[0] != "docs")
        and not EXCLUDED_PARTS.intersection(relative_path.parts)
        and relative_path.name not in EXCLUDED_NAMES
        and relative_path.suffix not in EXCLUDED_SUFFIXES
    )


def _source_files(source: Path) -> list[Path]:
    return sorted(
        path
        for path in source.rglob("*")
        if path.is_file() and _is_included(path.relative_to(source))
    )


def _destination_files(destination: Path) -> list[Path]:
    """Return every mirror file, including files excluded from the source.

    The destination is generated package data and must not retain independent
    docs, caches, or build trees. Scanning it without source exclusions makes
    those files visible as obsolete and preserves the single-source invariant.
    """
    return sorted(path for path in destination.rglob("*") if path.is_file())


def _digest(path: Path) -> str:
    hasher = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def find_drift(source: Path, destination: Path) -> list[str]:
    """Return files missing, different, or obsolete in the mirror."""
    drift: list[str] = []
    source_files = _source_files(source)
    source_relatives = {
        source_file.relative_to(source) for source_file in source_files
    }
    for source_file in source_files:
        relative = source_file.relative_to(source)
        destination_file = destination / relative
        if not destination_file.is_file():
            drift.append(f"missing: {relative}")
        elif _digest(source_file) != _digest(destination_file):
            drift.append(f"different: {relative}")
    if destination.is_dir():
        for destination_file in _destination_files(destination):
            relative = destination_file.relative_to(destination)
            if relative not in source_relatives:
                drift.append(f"obsolete: {relative}")
    return drift


def sync(source: Path, destination: Path) -> tuple[int, int]:
    """Make the packaging mirror exactly match canonical included files."""
    copied = 0
    removed = 0
    source_files = _source_files(source)
    source_relatives = {
        source_file.relative_to(source) for source_file in source_files
    }
    if destination.is_dir():
        for destination_file in _destination_files(destination):
            relative = destination_file.relative_to(destination)
            if relative not in source_relatives:
                destination_file.unlink()
                removed += 1
    for source_file in source_files:
        relative = source_file.relative_to(source)
        destination_file = destination / relative
        destination_file.parent.mkdir(parents=True, exist_ok=True)
        if destination_file.is_file() and _digest(source_file) == _digest(
            destination_file,
        ):
            continue
        shutil.copy2(source_file, destination_file)
        copied += 1
    for directory in sorted(
        (path for path in destination.rglob("*") if path.is_dir()),
        reverse=True,
    ):
        try:
            directory.rmdir()
        except OSError:
            pass
    return copied, removed


def _generated_bundle_targets(root: Path) -> list[Path]:
    """Return repository-managed copies of the compiled UGSci UI bundle."""
    return [
        root / "plugins" / "bundle" / "ugsci" / "static" / "index.js",
        root
        / "src"
        / "qwenpaw"
        / "plugins_bundle"
        / "ugsci"
        / "ui"
        / "dist"
        / "index.js",
        root
        / "src"
        / "qwenpaw"
        / "plugins_bundle"
        / "ugsci"
        / "static"
        / "index.js",
        root / "console" / "public" / "ugsci_plugin" / "index.js",
        root / ".qwenpaw" / "plugins" / "ugsci" / "static" / "index.js",
    ]


def _generated_viewer_targets(root: Path) -> list[Path]:
    """Return package/runtime copies of the lazy UGSci Viewer bundle."""
    return [
        root
        / "src"
        / "qwenpaw"
        / "plugins_bundle"
        / "ugsci"
        / "ui"
        / "dist"
        / "viewer-runtime.js",
    ]


def sync_generated_bundle(root: Path, source: Path) -> int:
    """Copy the compiled UI bundle to repository-managed serving paths."""
    compiled = source / "ui" / "dist" / "index.js"
    if not compiled.is_file():
        raise FileNotFoundError(
            "UGSci UI bundle is missing; run npm run build in "
            "plugins/bundle/ugsci/ui",
        )
    viewer = source / "ui" / "dist" / "viewer-runtime.js"
    if not viewer.is_file():
        raise FileNotFoundError(
            "UGSci Viewer bundle is missing; run npm run build in "
            "plugins/bundle/ugsci/ui",
        )
    copied = 0
    for target in _generated_bundle_targets(root):
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.is_file() and _digest(compiled) == _digest(target):
            continue
        shutil.copy2(compiled, target)
        copied += 1
    for target in _generated_viewer_targets(root):
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.is_file() and _digest(viewer) == _digest(target):
            continue
        shutil.copy2(viewer, target)
        copied += 1
    return copied


def find_generated_bundle_drift(root: Path, source: Path) -> list[str]:
    """Return generated serving copies that differ from the UI build."""
    compiled = source / "ui" / "dist" / "index.js"
    if not compiled.is_file():
        return ["missing: plugins/bundle/ugsci/ui/dist/index.js"]
    drift: list[str] = []
    for target in _generated_bundle_targets(root):
        if not target.is_file():
            drift.append(
                f"missing generated bundle: {target.relative_to(root)}",
            )
        elif _digest(compiled) != _digest(target):
            drift.append(
                f"different generated bundle: {target.relative_to(root)}",
            )
    viewer = source / "ui" / "dist" / "viewer-runtime.js"
    if not viewer.is_file():
        drift.append("missing: plugins/bundle/ugsci/ui/dist/viewer-runtime.js")
        return drift
    for target in _generated_viewer_targets(root):
        if not target.is_file():
            drift.append(
                f"missing generated viewer bundle: {target.relative_to(root)}",
            )
        elif _digest(viewer) != _digest(target):
            drift.append(
                f"different generated viewer bundle: {target.relative_to(root)}",
            )
    return drift


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument(
        "--check",
        action="store_true",
        help="Report mirror drift without changing files.",
    )
    mode.add_argument(
        "--sync",
        action="store_true",
        help="Copy canonical files into the packaging mirror.",
    )
    args = parser.parse_args()

    root = _repo_root()
    source = root / "plugins" / "bundle" / "ugsci"
    destination = root / "src" / "qwenpaw" / "plugins_bundle" / "ugsci"

    if not source.is_dir():
        parser.error(f"canonical source directory not found: {source}")

    if args.sync:
        generated = sync_generated_bundle(root, source)
        copied, removed = sync(source, destination)
        print(
            f"[ugsci-sync] copied {copied} source file(s) and "
            f"{generated} generated bundle(s); removed "
            f"{removed} obsolete mirror file(s)",
        )

    drift = find_drift(source, destination)
    drift.extend(find_generated_bundle_drift(root, source))
    if drift:
        print("[ugsci-sync] packaging mirror is out of date:")
        for item in drift:
            print(f"  - {item}")
        print("Run: python scripts/sync_ugsci_bundle.py --sync")
        return 1

    print("[ugsci-sync] packaging mirror matches canonical source")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
