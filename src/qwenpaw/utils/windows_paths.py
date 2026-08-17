# -*- coding: utf-8 -*-
"""Filesystem operations that remain usable beyond Windows MAX_PATH."""

from __future__ import annotations

import os
import shutil
import stat
import zipfile
from pathlib import Path, PurePosixPath


def io_path(path: Path | str) -> str:
    value = os.path.abspath(os.fspath(path))
    if os.name != "nt" or value.startswith("\\\\?\\"):
        return value
    if value.startswith("\\\\"):
        return "\\\\?\\UNC\\" + value[2:]
    return "\\\\?\\" + value


def remove_tree(path: Path | str, *, ignore_errors: bool = False) -> None:
    value = io_path(path)
    if not os.path.isdir(value):
        return

    def remove_readonly(func, name, _exc_info):
        try:
            os.chmod(name, stat.S_IWRITE | stat.S_IREAD)
        except OSError:
            if ignore_errors:
                return
        try:
            func(name)
        except OSError:
            if not ignore_errors:
                raise

    # Python 3.11 has no ``onexc`` parameter; keep ``onerror`` until the
    # desktop runtime baseline moves to 3.12.
    shutil.rmtree(  # pylint: disable=deprecated-argument
        value,
        ignore_errors=ignore_errors,
        onerror=remove_readonly,
    )


def copy_tree(source: Path | str, destination: Path | str) -> None:
    source_io = io_path(source)
    destination_io = io_path(destination)
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
        for directory in directories:
            if os.path.islink(os.path.join(current, directory)):
                raise ValueError("directory links are not supported")
        relative = os.path.relpath(current, source_io)
        target_dir = (
            destination_io
            if relative == "."
            else os.path.join(destination_io, relative)
        )
        os.makedirs(target_dir, exist_ok=True)
        for name in names:
            source_file = os.path.join(current, name)
            if os.path.islink(source_file):
                raise ValueError("file links are not supported")
            shutil.copy2(source_file, os.path.join(target_dir, name))
    if errors:
        raise errors[0]


def extract_zip(zip_path: Path | str, destination: Path | str) -> None:
    destination_io = io_path(destination)
    os.makedirs(destination_io, exist_ok=True)
    with zipfile.ZipFile(zip_path) as archive:
        infos = archive.infolist()
        names = [info.filename for info in infos]
        if len(names) != len(set(names)):
            raise ValueError("archive contains duplicate members")
        for info in infos:
            normalized = info.filename.replace("\\", "/")
            relative = PurePosixPath(normalized)
            mode = (info.external_attr >> 16) & 0o170000
            unsafe_path = (
                not normalized
                or "\x00" in normalized
                or relative.is_absolute()
                or ".." in relative.parts
                or any(":" in part for part in relative.parts)
            )
            if unsafe_path or mode == stat.S_IFLNK:
                raise ValueError(f"unsafe archive member: {info.filename}")
            target = os.path.join(destination_io, *relative.parts)
            if info.is_dir():
                os.makedirs(target, exist_ok=True)
                continue
            os.makedirs(os.path.dirname(target), exist_ok=True)
            with archive.open(info) as source, open(target, "xb") as output:
                shutil.copyfileobj(source, output, length=1024 * 1024)
