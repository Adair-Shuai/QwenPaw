#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Stage a Node.js runtime for the Tauri desktop bundle."""

from __future__ import annotations

import argparse
import hashlib
import os
import platform
import shutil
import tarfile
import tempfile
import urllib.request
import zipfile
from pathlib import Path

from runtime_staging import atomic_install_tree

DEFAULT_NODE_VERSION = "v22.20.0"
NODE_DIST_URL = "https://nodejs.org/dist"
_DEVELOPMENT_DIRS = ("include", "share")
_DEVELOPMENT_FILES = ("CHANGELOG.md", "README.md")


def _target() -> tuple[str, str, str]:
    system = platform.system()
    machine = platform.machine().lower()
    arch = {
        "amd64": "x64",
        "x86_64": "x64",
        "arm64": "arm64",
        "aarch64": "arm64",
    }.get(machine)
    if arch is None:
        raise SystemExit(f"unsupported machine architecture: {machine!r}")
    if system == "Windows":
        return "win", arch, "zip"
    if system == "Darwin":
        return "darwin", arch, "tar.xz"
    if system == "Linux":
        return "linux", arch, "tar.xz"
    raise SystemExit(f"unsupported platform: {system!r}")


def _node_exe(dest: Path) -> Path:
    if platform.system() == "Windows":
        return dest / "node.exe"
    return dest / "bin" / "node"


def _npx_exe(dest: Path) -> Path:
    if platform.system() == "Windows":
        return dest / "npx.cmd"
    return dest / "bin" / "npx"


def _http_get(url: str) -> bytes:
    request = urllib.request.Request(url)
    request.add_header("User-Agent", "qwenpaw-build")
    with urllib.request.urlopen(request, timeout=120) as response:
        return response.read()


def _verify_sha256(data: bytes, expected: str) -> None:
    expected = expected.strip().lower()
    if len(expected) != 64 or any(
        c not in "0123456789abcdef" for c in expected
    ):
        raise SystemExit(
            "Node runtime SHA-256 must be a 64-character hexadecimal digest",
        )
    actual = hashlib.sha256(data).hexdigest()
    if actual != expected:
        raise SystemExit(
            f"Node runtime SHA-256 mismatch: expected {expected}, got {actual}",
        )


def _official_sha256(url: str, archive_name: str) -> str:
    sums = _http_get(f"{url.rsplit('/', 1)[0]}/SHASUMS256.txt").decode("utf-8")
    for line in sums.splitlines():
        digest, _, name = line.partition("  ")
        if name.strip() == archive_name:
            return digest.strip()
    raise SystemExit(f"Node archive checksum not found for {archive_name}")


def _extract(archive: Path, suffix: str, workdir: Path) -> Path:
    if suffix == "zip":
        with zipfile.ZipFile(archive) as zip_file:
            infos = zip_file.infolist()
            names = [info.filename for info in infos]
            if len(names) != len(set(names)):
                raise SystemExit("duplicate Node ZIP members are not allowed")
            root = workdir.resolve()
            for info in infos:
                _validate_archive_member(info.filename, root)
                mode = (info.external_attr >> 16) & 0o170000
                if mode in {0o120000, 0o060000, 0o020000}:
                    raise SystemExit(
                        f"unsafe ZIP link/device member: {info.filename}",
                    )
            for info in infos:
                target = (root / info.filename).resolve()
                _validate_archive_member(info.filename, root)
                if info.is_dir():
                    target.mkdir(parents=True, exist_ok=True)
                    continue
                target.parent.mkdir(parents=True, exist_ok=True)
                with zip_file.open(info) as source, target.open("wb") as dest:
                    shutil.copyfileobj(source, dest)
                target.chmod((info.external_attr >> 16) & 0o777 or 0o644)
    else:
        with tarfile.open(archive, "r:xz") as tar:
            _extract_tar_safely(tar, workdir)

    roots = [
        path
        for path in workdir.iterdir()
        if path.is_dir() and path.name.startswith("node-")
    ]
    if len(roots) != 1:
        raise SystemExit("failed to locate extracted Node.js directory")
    return roots[0]


def _validate_archive_member(name: str, root: Path) -> None:
    target = (root / name).resolve()
    try:
        target.relative_to(root)
    except ValueError:
        raise SystemExit(f"archive member escapes target: {name}") from None


def _extract_tar_safely(tar: tarfile.TarFile, workdir: Path) -> None:
    root = workdir.resolve()
    members = tar.getmembers()
    for member in members:
        _validate_archive_member(member.name, root)
        if not (
            member.isdir()
            or member.isfile()
            or member.issym()
            or member.islnk()
        ):
            raise SystemExit(f"unsafe tar member type: {member.name}")
    for member in members:
        target = (root / member.name).resolve()
        try:
            target.relative_to(root)
        except ValueError:
            raise SystemExit(
                f"tar member resolves outside target: {member.name}",
            ) from None
        if member.isdir():
            target.mkdir(parents=True, exist_ok=True)
            continue
        if member.issym():
            link_target = (target.parent / member.linkname).resolve()
            try:
                link_target.relative_to(root)
            except ValueError:
                raise SystemExit(
                    f"tar symlink escapes target: {member.name}",
                ) from None
            target.parent.mkdir(parents=True, exist_ok=True)
            target.symlink_to(member.linkname)
            continue
        if member.islnk():
            link_target = (target.parent / member.linkname).resolve()
            try:
                link_target.relative_to(root)
            except ValueError:
                raise SystemExit(
                    f"tar hardlink escapes target: {member.name}",
                ) from None
            if not link_target.is_file():
                raise SystemExit(
                    f"tar hardlink target is missing: {member.name}",
                )
        target.parent.mkdir(parents=True, exist_ok=True)
        source = tar.extractfile(member)
        if source is None:
            raise SystemExit(f"cannot read tar member: {member.name}")
        with source, target.open("wb") as dest:
            shutil.copyfileobj(source, dest)
        target.chmod(member.mode & 0o777 or 0o644)


def prune_runtime(dest: Path) -> int:
    """Remove Node development files that are not needed to run npm/npx."""
    removed = 0
    for name in _DEVELOPMENT_DIRS:
        path = dest / name
        if path.is_dir():
            removed += sum(
                item.stat().st_size
                for item in path.rglob("*")
                if item.is_file()
            )
            shutil.rmtree(path)
    for name in _DEVELOPMENT_FILES:
        path = dest / name
        if path.is_file():
            removed += path.stat().st_size
            path.unlink()
    return removed


def main() -> None:
    # pylint: disable=too-many-statements
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dest", required=True)
    parser.add_argument(
        "--node-version",
        default=os.environ.get("QWENPAW_NODE_VERSION", DEFAULT_NODE_VERSION),
    )
    parser.add_argument(
        "--sha256",
        default=os.environ.get("QWENPAW_NODE_SHA256", ""),
        help="Expected SHA-256 for the exact Node archive (required for production builds)",
    )
    args = parser.parse_args()

    version = args.node_version
    platform_name, arch, suffix = _target()
    target = f"{platform_name}-{arch}"
    dest = Path(args.dest).resolve()
    marker = dest / ".node-runtime-version"
    archive_name = f"node-{version}-{target}.{suffix}"
    url = f"{NODE_DIST_URL}/{version}/{archive_name}"
    production_hashes = os.environ.get(
        "QWENPAW_REQUIRE_RUNTIME_HASHES",
        "",
    ).lower() in {"1", "true", "yes"}
    if production_hashes and not args.sha256:
        raise SystemExit("production build requires QWENPAW_NODE_SHA256")
    expected_sha256 = args.sha256 or _official_sha256(url, archive_name)
    marker_value = f"{version}-{target}-{expected_sha256}"

    if (
        _node_exe(dest).is_file()
        and _npx_exe(dest).is_file()
        and marker.is_file()
        and marker.read_text(encoding="utf-8").strip() == marker_value
    ):
        removed = prune_runtime(dest)
        if removed:
            print(
                f"Pruned {removed / (1024 * 1024):.1f} MiB from node-runtime",
            )
        print(f"node-runtime already staged ({version}-{target}); skipping")
        return

    print(f"Staging Node.js {version} for {target}...")
    print(f"Downloading {url}")

    with tempfile.TemporaryDirectory() as tmp:
        tmpdir = Path(tmp)
        archive = tmpdir / archive_name
        archive_bytes = _http_get(url)
        _verify_sha256(archive_bytes, expected_sha256)
        archive.write_bytes(archive_bytes)
        extracted = _extract(archive, suffix, tmpdir)

        staged_dest = tmpdir / "staged-node-runtime"
        staged_dest.mkdir(parents=True, exist_ok=True)
        for item in extracted.iterdir():
            shutil.move(str(item), staged_dest / item.name)

        if not (
            staged_dest
            / ("node.exe" if platform.system() == "Windows" else "bin/node")
        ).is_file():
            raise SystemExit("staging failed: node executable missing")
        atomic_install_tree(staged_dest, dest)

    if not _node_exe(dest).is_file() or not _npx_exe(dest).is_file():
        raise SystemExit("staging failed: node or npx missing")
    removed = prune_runtime(dest)
    print(f"Pruned {removed / (1024 * 1024):.1f} MiB from node-runtime")
    marker.write_text(marker_value, encoding="utf-8")
    print(f"Staged node-runtime at {dest}")


if __name__ == "__main__":
    main()
