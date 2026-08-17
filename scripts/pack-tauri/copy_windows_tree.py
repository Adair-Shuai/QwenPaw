# -*- coding: utf-8 -*-
"""Copy a directory tree without Windows MAX_PATH truncation."""

from __future__ import annotations

import argparse
import os
import shutil
from pathlib import Path


def _filesystem_path(path: Path) -> str:
    native = os.path.abspath(os.fspath(path))
    if os.name != "nt" or native.startswith("\\\\?\\"):
        return native
    if native.startswith("\\\\"):
        return "\\\\?\\UNC\\" + native[2:]
    return "\\\\?\\" + native


def remove_tree(path: Path, *, ignore_errors: bool = False) -> None:
    """Remove a tree through an extended-length Windows path."""
    value = _filesystem_path(path.resolve(strict=False))
    if not os.path.isdir(value):
        return
    try:
        shutil.rmtree(value)
    except OSError:
        if not ignore_errors:
            raise


def copy_tree(source: Path, destination: Path) -> None:
    source = source.resolve(strict=True)
    if not source.is_dir():
        raise ValueError(f"copy source is not a directory: {source}")
    destination = destination.resolve(strict=False)
    try:
        destination.relative_to(source)
    except ValueError:
        pass
    else:
        raise ValueError("copy destination may not be inside source")
    source_io = _filesystem_path(source)
    destination_io = _filesystem_path(destination)
    os.makedirs(destination_io, exist_ok=True)
    errors: list[OSError] = []
    for current, directories, names in os.walk(
        source_io,
        topdown=True,
        followlinks=False,
        onerror=errors.append,
    ):
        directories.sort()
        names.sort()
        relative_dir = os.path.relpath(current, source_io)
        target_dir = (
            destination_io
            if relative_dir == "."
            else os.path.join(destination_io, relative_dir)
        )
        os.makedirs(target_dir, exist_ok=True)
        for directory in directories:
            candidate = os.path.join(current, directory)
            if os.path.islink(candidate):
                raise ValueError(
                    f"directory links are not supported: {candidate}",
                )
        for name in names:
            candidate = os.path.join(current, name)
            if os.path.islink(candidate):
                raise ValueError(f"file links are not supported: {candidate}")
            shutil.copy2(candidate, os.path.join(target_dir, name))
    if errors:
        raise errors[0]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--destination", type=Path, required=True)
    args = parser.parse_args()
    copy_tree(args.source, args.destination)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
