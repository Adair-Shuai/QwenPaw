# -*- coding: utf-8 -*-
"""Build and verify the Windows portable installer ZIP."""

from __future__ import annotations

import argparse
import os
import zipfile
from pathlib import Path, PurePosixPath


def _manifest_entries(root: Path) -> set[str]:
    manifest = root / "checksums.sha256"
    entries: set[str] = set()
    for raw_line in manifest.read_text(encoding="ascii").splitlines():
        if not raw_line.strip():
            continue
        digest, separator, relative = raw_line.partition("  ")
        if len(digest) != 64 or not separator or not relative:
            raise ValueError("invalid checksum manifest entry")
        normalized = PurePosixPath(relative).as_posix()
        if (
            normalized.startswith("/")
            or ".." in PurePosixPath(normalized).parts
        ):
            raise ValueError(f"unsafe checksum manifest entry: {relative}")
        if normalized in entries:
            raise ValueError(f"duplicate checksum manifest entry: {relative}")
        entries.add(normalized)
    return entries


def _filesystem_path(path: Path) -> str:
    """Return a native path that keeps deep Windows package trees accessible."""
    native = os.path.abspath(os.fspath(path))
    if os.name != "nt" or native.startswith("\\\\?\\"):
        return native
    if native.startswith("\\\\"):
        return "\\\\?\\UNC\\" + native[2:]
    return "\\\\?\\" + native


def _archive_files(root: Path) -> list[tuple[str, str]]:
    native_root = _filesystem_path(root)
    files: list[tuple[str, str]] = []
    walk_errors: list[OSError] = []
    for current, directories, names in os.walk(
        native_root,
        onerror=walk_errors.append,
    ):
        directories.sort()
        names.sort()
        for name in names:
            source = os.path.join(current, name)
            if not os.path.isfile(source):
                continue
            relative = os.path.relpath(source, native_root).replace(
                os.sep,
                "/",
            )
            files.append((source, relative))
    if walk_errors:
        raise walk_errors[0]
    return files


def build_archive(root: Path, destination: Path) -> None:
    """Create *destination* and prove that every checksummed file is present."""
    root = root.resolve(strict=True)
    destination = destination.resolve(strict=False)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.unlink(missing_ok=True)

    expected = _manifest_entries(root)
    expected.add("checksums.sha256")
    files = _archive_files(root)
    actual = {relative for _, relative in files}
    if actual != expected:
        missing = sorted(expected - actual)
        extra = sorted(actual - expected)
        raise ValueError(
            f"portable source/manifest mismatch; missing={missing[:5]} "
            f"extra={extra[:5]}",
        )

    with zipfile.ZipFile(
        destination,
        "w",
        compression=zipfile.ZIP_DEFLATED,
        compresslevel=9,
        allowZip64=True,
    ) as archive:
        for source, relative in files:
            archive.write(source, relative)

    with zipfile.ZipFile(destination) as archive:
        archived = {
            item.filename for item in archive.infolist() if not item.is_dir()
        }
        if archived != expected:
            missing = sorted(expected - archived)
            extra = sorted(archived - expected)
            raise ValueError(
                f"portable ZIP verification failed; missing={missing[:5]} "
                f"extra={extra[:5]}",
            )
        bad_member = archive.testzip()
        if bad_member is not None:
            raise ValueError(
                f"portable ZIP CRC verification failed: {bad_member}",
            )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    build_archive(args.root, args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
