#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Synchronize the canonical Run Center plugin into the package mirror."""

from __future__ import annotations

import argparse
import hashlib
import shutil
from pathlib import Path

EXCLUDED_PARTS = {"node_modules", "__pycache__"}
EXCLUDED_NAMES = {".DS_Store"}
EXCLUDED_SUFFIXES = {".pyc", ".pyo"}


def _repo_root() -> Path:
    return Path(__file__).resolve().parent.parent


def _included(path: Path) -> bool:
    return (
        not EXCLUDED_PARTS.intersection(path.parts)
        and path.name not in EXCLUDED_NAMES
        and path.suffix not in EXCLUDED_SUFFIXES
    )


def _files(root: Path) -> list[Path]:
    return sorted(
        path
        for path in root.rglob("*")
        if path.is_file() and _included(path.relative_to(root))
    )


def _all_files(root: Path) -> list[Path]:
    return sorted(path for path in root.rglob("*") if path.is_file())


def _digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def find_drift(source: Path, destination: Path) -> list[str]:
    source_files = _files(source)
    source_rel = {path.relative_to(source) for path in source_files}
    drift: list[str] = []
    for path in source_files:
        relative = path.relative_to(source)
        target = destination / relative
        if not target.is_file():
            drift.append(f"missing: {relative.as_posix()}")
        elif _digest(path) != _digest(target):
            drift.append(f"different: {relative.as_posix()}")
    for path in _all_files(destination) if destination.is_dir() else []:
        relative = path.relative_to(destination)
        if relative not in source_rel or not _included(relative):
            drift.append(f"obsolete: {relative.as_posix()}")
    return drift


def sync(source: Path, destination: Path) -> tuple[int, int]:
    source_files = _files(source)
    source_rel = {path.relative_to(source) for path in source_files}
    copied = removed = 0
    if destination.is_dir():
        for path in _all_files(destination):
            relative = path.relative_to(destination)
            if relative not in source_rel or not _included(relative):
                path.unlink()
                removed += 1
    for path in source_files:
        relative = path.relative_to(source)
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.is_file() and _digest(path) == _digest(target):
            continue
        shutil.copy2(path, target)
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
    root = _repo_root()
    source = root / "plugins" / "bundle" / "qwenpaw-run-center"
    destination = (
        root / "src" / "qwenpaw" / "plugins_bundle" / "qwenpaw-run-center"
    )
    if args.sync:
        copied, removed = sync(source, destination)
        print(
            f"[run-center-sync] copied {copied} file(s); removed {removed} obsolete file(s)"
        )
    drift = find_drift(source, destination)
    if drift:
        print("[run-center-sync] package mirror is out of date:")
        for item in drift:
            print(f"  - {item}")
        return 1
    print("[run-center-sync] package mirror matches canonical source")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
