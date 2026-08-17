# -*- coding: utf-8 -*-
"""Prune and checksum a Windows portable tree with extended-length paths."""

from __future__ import annotations

import argparse
import hashlib
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


def _stream_chunks(stream):
    while True:
        chunk = stream.read(1024 * 1024)
        if not chunk:
            return
        yield chunk


def prepare(  # pylint: disable=too-many-branches
    root: Path,
    manifest: Path,
) -> None:
    native_root = _filesystem_path(root.resolve(strict=True))
    native_manifest = _filesystem_path(manifest.resolve(strict=False))
    walk_errors: list[OSError] = []
    files: list[tuple[str, str]] = []
    bytecode: list[str] = []
    caches: list[str] = []
    for current, directories, names in os.walk(
        native_root,
        topdown=True,
        onerror=walk_errors.append,
    ):
        directories.sort()
        names.sort()
        retained: list[str] = []
        for directory in directories:
            if directory == "__pycache__":
                caches.append(os.path.join(current, directory))
            else:
                retained.append(directory)
        directories[:] = retained
        for name in names:
            source = os.path.join(current, name)
            if source == native_manifest:
                continue
            if name.lower().endswith((".pyc", ".pyo")):
                bytecode.append(source)
                continue
            relative = os.path.relpath(source, native_root).replace(
                os.sep,
                "/",
            )
            files.append((relative, source))
    if walk_errors:
        raise walk_errors[0]
    for source in bytecode:
        os.unlink(source)
    for directory in sorted(caches, key=len, reverse=True):
        if os.path.isdir(directory):
            shutil.rmtree(directory)
    lines: list[str] = []
    for relative, source in sorted(files):
        digest = hashlib.sha256()
        with open(source, "rb") as stream:
            for chunk in _stream_chunks(stream):
                digest.update(chunk)
        lines.append(f"{digest.hexdigest()}  {relative}\n")
    os.makedirs(os.path.dirname(native_manifest), exist_ok=True)
    with open(native_manifest, "w", encoding="ascii", newline="\n") as output:
        output.writelines(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    args = parser.parse_args()
    prepare(args.root, args.manifest)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
