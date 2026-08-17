# -*- coding: utf-8 -*-
"""Safely extract a ZIP using extended-length Windows output paths."""

from __future__ import annotations

import argparse
import os
import shutil
import stat
import zipfile
from pathlib import Path, PurePosixPath


def _filesystem_path(path: Path) -> str:
    native = os.path.abspath(os.fspath(path))
    if os.name != "nt" or native.startswith("\\\\?\\"):
        return native
    if native.startswith("\\\\"):
        return "\\\\?\\UNC\\" + native[2:]
    return "\\\\?\\" + native


def _relative(value: str) -> PurePosixPath:
    normalized = value.replace("\\", "/")
    path = PurePosixPath(normalized)
    if (
        not normalized
        or "\x00" in normalized
        or path.is_absolute()
        or ".." in path.parts
        or any(":" in part for part in path.parts)
    ):
        raise ValueError(f"unsafe ZIP member: {value!r}")
    return path


def extract(archive_path: Path, destination: Path) -> None:
    destination_io = _filesystem_path(destination.resolve(strict=False))
    os.makedirs(destination_io, exist_ok=True)
    with zipfile.ZipFile(archive_path) as archive:
        infos = archive.infolist()
        names = [info.filename for info in infos]
        if len(names) != len(set(names)):
            raise ValueError("ZIP contains duplicate members")
        for info in infos:
            relative = _relative(info.filename)
            mode = (info.external_attr >> 16) & 0o170000
            if mode == stat.S_IFLNK:
                raise ValueError(f"ZIP links are not allowed: {info.filename}")
            target = os.path.join(destination_io, *relative.parts)
            if info.is_dir():
                os.makedirs(target, exist_ok=True)
                continue
            os.makedirs(os.path.dirname(target), exist_ok=True)
            with archive.open(info) as source, open(target, "xb") as output:
                shutil.copyfileobj(source, output, length=1024 * 1024)
        bad_member = archive.testzip()
        if bad_member is not None:
            raise ValueError(f"ZIP CRC verification failed: {bad_member}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--archive", type=Path, required=True)
    parser.add_argument("--destination", type=Path, required=True)
    args = parser.parse_args()
    extract(args.archive, args.destination)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
