#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Transfer desktop component trees without losing modes or dotfiles."""

from __future__ import annotations

import argparse
import os
import shutil
import tarfile
import tempfile
from pathlib import Path, PurePosixPath


MAX_MEMBERS = 200_000
MAX_TOTAL_BYTES = 8 * 1024**3
MAX_MEMBER_BYTES = 2 * 1024**3


def _safe_name(value: str) -> PurePosixPath:
    path = PurePosixPath(value)
    unsafe = any(
        (
            not value,
            value.startswith("/"),
            "\\" in value,
            "\x00" in value,
            path.is_absolute(),
            ".." in path.parts,
        ),
    )
    if unsafe:
        raise ValueError(f"unsafe desktop component archive path: {value!r}")
    return path


def pack(source: Path, output: Path) -> None:
    source = source.resolve()
    if not source.is_dir() or source.name != "binaries":
        raise ValueError(
            "desktop component source must be a binaries directory",
        )
    output.parent.mkdir(parents=True, exist_ok=True)
    epoch = int(os.environ.get("SOURCE_DATE_EPOCH", "0") or "0")
    temporary = output.with_name(f".{output.name}.tmp")

    for directory, directory_names, file_names in os.walk(
        source,
        followlinks=False,
    ):
        current = Path(directory)
        for name in directory_names:
            candidate = current / name
            if candidate.is_symlink():
                raise ValueError(
                    "desktop component source contains a directory symlink: "
                    f"{candidate.relative_to(source)}",
                )
        for name in file_names:
            candidate = current / name
            if not candidate.is_symlink():
                continue
            try:
                target = candidate.resolve(strict=True)
                target.relative_to(source)
            except (FileNotFoundError, RuntimeError, ValueError) as error:
                raise ValueError(
                    "desktop component source contains an unsafe file symlink: "
                    f"{candidate.relative_to(source)}",
                ) from error
            if not target.is_file():
                raise ValueError(
                    "desktop component file symlink target is not a regular file: "
                    f"{candidate.relative_to(source)}",
                )

    def normalize(info: tarfile.TarInfo) -> tarfile.TarInfo:
        if info.issym() or info.islnk() or info.isdev() or info.isfifo():
            raise ValueError(
                f"desktop component source contains an unsafe link/device: {info.name}",
            )
        _safe_name(info.name)
        info.uid = 0
        info.gid = 0
        info.uname = ""
        info.gname = ""
        info.mtime = epoch
        return info

    try:
        # Official macOS Node distributions contain internal executable
        # symlinks (for example bin/corepack). Materialize those targets as
        # regular archive members so extraction can keep rejecting every
        # symlink/hardlink while retaining a functional runtime.
        with tarfile.open(
            temporary,
            "w",
            format=tarfile.PAX_FORMAT,
            dereference=True,
        ) as archive:
            archive.add(
                source,
                arcname="binaries",
                recursive=True,
                filter=normalize,
            )
        os.replace(temporary, output)
    finally:
        temporary.unlink(missing_ok=True)


def extract(archive_path: Path, output: Path) -> None:
    archive_path = archive_path.resolve()
    output = output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = Path(
        tempfile.mkdtemp(prefix=f".{output.name}-", dir=str(output.parent)),
    )
    try:
        with tarfile.open(archive_path, "r:") as archive:
            members = archive.getmembers()
            if len(members) > MAX_MEMBERS:
                raise ValueError(
                    "desktop component archive has too many members",
                )
            total = 0
            for member in members:
                relative = _safe_name(member.name)
                if not relative.parts or relative.parts[0] != "binaries":
                    raise ValueError(
                        "desktop component archive root must be binaries",
                    )
                if (
                    member.issym()
                    or member.islnk()
                    or member.isdev()
                    or member.isfifo()
                ):
                    raise ValueError(
                        "desktop component archive contains a link/device",
                    )
                if member.isfile():
                    if member.size > MAX_MEMBER_BYTES:
                        raise ValueError(
                            "desktop component archive member is too large",
                        )
                    total += member.size
                    if total > MAX_TOTAL_BYTES:
                        raise ValueError(
                            "desktop component archive is too large",
                        )
                target = (temporary / Path(*relative.parts)).resolve()
                target.relative_to(temporary.resolve())
                if member.isdir():
                    target.mkdir(parents=True, exist_ok=True)
                    target.chmod(member.mode & 0o7777)
                    continue
                if not member.isfile():
                    raise ValueError(
                        "desktop component archive member is unsupported",
                    )
                target.parent.mkdir(parents=True, exist_ok=True)
                source = archive.extractfile(member)
                if source is None:
                    raise ValueError(
                        "desktop component archive member is unreadable",
                    )
                with source, target.open("wb") as destination:
                    shutil.copyfileobj(source, destination, length=1024 * 1024)
                target.chmod(member.mode & 0o7777)
        if output.exists():
            shutil.rmtree(output)
        temporary.replace(output)
    finally:
        shutil.rmtree(temporary, ignore_errors=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)
    pack_parser = subparsers.add_parser("pack")
    pack_parser.add_argument("--source", type=Path, required=True)
    pack_parser.add_argument("--output", type=Path, required=True)
    extract_parser = subparsers.add_parser("extract")
    extract_parser.add_argument("--archive", type=Path, required=True)
    extract_parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    if args.command == "pack":
        pack(args.source, args.output)
    else:
        extract(args.archive, args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
