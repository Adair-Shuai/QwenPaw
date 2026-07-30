#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Synchronize canonical FlowForge package sources into the plugin bundle."""

from __future__ import annotations

import argparse
import hashlib
import shutil
from pathlib import Path

EXCLUDED_PARTS = {"node_modules", "__pycache__"}
EXCLUDED_NAMES = {".DS_Store"}
EXCLUDED_SUFFIXES = {".pyc", ".pyo"}


def included(path: Path, root: Path) -> bool:
    relative = path.relative_to(root)
    return (
        path.is_file()
        and not EXCLUDED_PARTS.intersection(relative.parts)
        and path.name not in EXCLUDED_NAMES
        and path.suffix not in EXCLUDED_SUFFIXES
    )


def files(root: Path) -> dict[Path, Path]:
    return {
        path.relative_to(root): path
        for path in root.rglob("*")
        if included(path, root)
    }


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def drift(source: Path, destination: Path) -> list[str]:
    source_files = files(source)
    destination_files = files(destination) if destination.is_dir() else {}
    result = []
    for relative, source_file in source_files.items():
        destination_file = destination_files.get(relative)
        if destination_file is None:
            result.append(f"missing: {relative}")
        elif digest(source_file) != digest(destination_file):
            result.append(f"different: {relative}")
    for relative in destination_files.keys() - source_files.keys():
        result.append(f"obsolete: {relative}")
    return sorted(result)


def sync(source: Path, destination: Path) -> tuple[int, int]:
    source_files = files(source)
    destination_files = files(destination) if destination.is_dir() else {}
    copied = 0
    removed = 0
    for relative in destination_files.keys() - source_files.keys():
        destination_files[relative].unlink()
        removed += 1
    for relative, source_file in source_files.items():
        target = destination / relative
        if target.is_file() and digest(source_file) == digest(target):
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source_file, target)
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


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--sync", action="store_true")
    args = parser.parse_args()

    root = Path(__file__).resolve().parent.parent
    source = root / "src" / "qwenpaw" / "plugins_bundle" / "flowforge"
    destination = root / "plugins" / "bundle" / "flowforge"
    if args.sync:
        copied, removed = sync(source, destination)
        print(f"[flowforge-sync] copied {copied}; removed {removed}")
    differences = drift(source, destination)
    if differences:
        print("[flowforge-sync] bundle drift detected:")
        for difference in differences:
            print(f"  - {difference}")
        return 1
    print("[flowforge-sync] canonical source and plugin bundle match")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
