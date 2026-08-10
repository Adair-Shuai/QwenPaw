#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Remove build-only files from a PyInstaller desktop bundle.

PyInstaller can pick up frontend workspaces that happen to be present in an
editable checkout.  Those files are never needed by the frozen backend, but
they can add hundreds of megabytes to the Tauri installer.  Keep this cleanup
in one platform-neutral helper so Windows and macOS produce the same runtime
shape.
"""

from __future__ import annotations

import argparse
import os
import shutil
from pathlib import Path


_REMOVED_DIR_NAMES = frozenset(
    {
        ".git",
        ".mypy_cache",
        ".pytest_cache",
        ".ruff_cache",
        "__pycache__",
        "node_modules",
    },
)
_REMOVED_FILE_NAMES = frozenset({".DS_Store"})


def _size(path: Path) -> int:
    if path.is_symlink():
        return path.lstat().st_size
    if path.is_file():
        return path.stat().st_size
    if path.is_dir():
        return sum(_size(child) for child in path.iterdir())
    return 0


def _is_build_bundle(path: Path) -> bool:
    return (
        path.is_dir()
        and (path / "_internal").is_dir()
        and any(
            (path / executable).is_file()
            for executable in ("qwenpaw-backend", "qwenpaw-backend.exe")
        )
    )


def prune_bundle(bundle: Path, *, dry_run: bool = False) -> int:
    """Delete build-only trees and return the number of removed bytes."""
    bundle = bundle.resolve()
    if not _is_build_bundle(bundle):
        raise ValueError(
            "Refusing to prune a directory that is not a PyInstaller backend: "
            f"{bundle}",
        )

    removed_bytes = 0
    for current, directories, files in os.walk(bundle, topdown=True):
        current_path = Path(current)
        kept_directories: list[str] = []
        for name in directories:
            candidate = current_path / name
            if name in _REMOVED_DIR_NAMES:
                removed_bytes += _size(candidate)
                if not dry_run:
                    shutil.rmtree(candidate)
                continue
            kept_directories.append(name)
        directories[:] = kept_directories

        for name in files:
            candidate = current_path / name
            if name in _REMOVED_FILE_NAMES:
                removed_bytes += _size(candidate)
                if not dry_run:
                    candidate.unlink(missing_ok=True)

    if not dry_run and any(bundle.rglob("node_modules")):
        raise RuntimeError(f"node_modules remained in pruned bundle: {bundle}")
    return removed_bytes


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("bundle", type=Path)
    parser.add_argument(
        "--max-size-mb",
        type=float,
        default=None,
        help="Fail when the cleaned bundle exceeds this size.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Report what would be removed without changing files.",
    )
    args = parser.parse_args()
    bundle = args.bundle.resolve()
    try:
        removed = prune_bundle(bundle, dry_run=args.dry_run)
    except (OSError, RuntimeError, ValueError) as exc:
        parser.error(str(exc))
    current_size = _size(bundle)
    clean_size = current_size if not args.dry_run else current_size - removed
    size_mb = clean_size / (1024 * 1024)
    action = "Would remove" if args.dry_run else "Removed"
    print(f"{action} {removed / (1024 * 1024):.1f} MiB of build-only files")
    print(f"Expected clean PyInstaller bundle size: {size_mb:.1f} MiB")
    if args.max_size_mb is not None and size_mb > args.max_size_mb:
        parser.error(
            f"bundle size {size_mb:.1f} MiB exceeds the {args.max_size_mb:.1f} MiB limit",
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
