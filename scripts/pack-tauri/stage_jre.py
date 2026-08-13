#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Stage an Eclipse Temurin JRE for the Tauri desktop bundle.

Downloads a pre-built Java Runtime Environment (JRE) 21 from the Adoptium
API for the current platform / architecture and extracts it to
``<dest>/java``.  The NeqSim MCP Server (a Quarkus fat-jar) requires
Java 21+; the JRE is used to launch it as a stdio MCP server subprocess.

Usage:
    python scripts/pack-tauri/stage_jre.py --dest binaries/java-runtime
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import platform
import shutil
import tarfile
import tempfile
import time
import urllib.error
import urllib.request
import zipfile
from pathlib import Path

from runtime_staging import atomic_install_tree

ADOPTIUM_API_BASE = "https://api.adoptium.net/v3"
DEFAULT_JAVA_VERSION = "21"
HTTP_ATTEMPTS = 4
HTTP_TIMEOUT_SECONDS = 120
RETRYABLE_HTTP_STATUS = {408, 429, 500, 502, 503, 504}


def _target() -> tuple[str, str]:
    """Return (adoptium_os, adoptium_arch) for the current machine."""
    system = platform.system()
    machine = platform.machine().lower()
    arch = {
        "amd64": "x64",
        "x86_64": "x64",
        "arm64": "aarch64",
        "aarch64": "aarch64",
    }.get(machine)
    if arch is None:
        raise SystemExit(f"unsupported machine architecture: {machine!r}")
    if system == "Windows":
        return "windows", arch
    if system == "Darwin":
        return "mac", arch
    if system == "Linux":
        return "linux", arch
    raise SystemExit(f"unsupported platform: {system!r}")


def _java_exe(dest: Path) -> Path:
    """Return the path to the java executable inside *dest*."""
    if platform.system() == "Windows":
        # Windows archive extracts to a sub-directory; the exe is at
        # bin/java.exe relative to the JDK root.
        for candidate in dest.rglob("bin/java.exe"):
            return candidate
        return dest / "bin" / "java.exe"
    # macOS / Linux: the archive contains a top-level jdk-XX.jdk/Contents/
    # (macOS) or jdk-XX/ (Linux) directory.  Find the java binary.
    for candidate in dest.rglob("bin/java"):
        if candidate.is_file():
            return candidate
    return dest / "bin" / "java"


def _http_get(url: str) -> bytes:
    request = urllib.request.Request(url)
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if token:
        request.add_header("Authorization", f"Bearer {token}")
    request.add_header("User-Agent", "qwenpaw-build")
    for attempt in range(1, HTTP_ATTEMPTS + 1):
        try:
            with urllib.request.urlopen(
                request,
                timeout=HTTP_TIMEOUT_SECONDS,
            ) as resp:
                return resp.read()
        except urllib.error.HTTPError as exc:
            if (
                exc.code not in RETRYABLE_HTTP_STATUS
                or attempt == HTTP_ATTEMPTS
            ):
                raise
            wait = 2 ** (attempt - 1)
            print(
                f"HTTP {exc.code} fetching {url}; "
                f"retrying in {wait}s ({attempt}/{HTTP_ATTEMPTS})",
            )
        except OSError as exc:
            if attempt == HTTP_ATTEMPTS:
                raise
            wait = 2 ** (attempt - 1)
            print(
                f"{type(exc).__name__} fetching {url}: {exc}; "
                f"retrying in {wait}s ({attempt}/{HTTP_ATTEMPTS})",
            )
        time.sleep(wait)
    raise RuntimeError(f"failed to fetch {url}")


def _verify_sha256(data: bytes, expected: str) -> None:
    expected = expected.strip().lower()
    if len(expected) != 64 or any(
        c not in "0123456789abcdef" for c in expected
    ):
        raise SystemExit(
            "JRE SHA-256 must be a 64-character hexadecimal digest",
        )
    actual = hashlib.sha256(data).hexdigest()
    if actual != expected:
        raise SystemExit(
            f"JRE SHA-256 mismatch: expected {expected}, got {actual}",
        )


def _resolve_download_url(
    java_version: str,
    expected_release: str = "",
) -> tuple[str, str, str]:
    """Query the Adoptium API for the latest JRE download URL.

    Returns (download_url, version_label).
    """
    os_name, arch = _target()
    url = (
        f"{ADOPTIUM_API_BASE}/binary/latest/{java_version}/ga/"
        f"{os_name}/{arch}/jre/hotspot/normal/eclipse"
        f"?project=jdk"
    )
    print(f"Querying Adoptium API: {url}")
    # The binary endpoint redirects to the actual download, so we follow
    # redirects via urlopen.  But first query the assets API to get the
    # version label for the marker file.
    meta_url = (
        f"{ADOPTIUM_API_BASE}/assets/feature_releases/{java_version}/ga"
        f"?architecture={arch}&heap_size=normal&image_type=jre"
        f"&os={os_name}&project=jdk&vendor=eclipse"
    )
    meta = json.loads(_http_get(meta_url).decode("utf-8"))
    if not isinstance(meta, list) or not meta or not isinstance(meta[0], dict):
        raise SystemExit("Adoptium release metadata is empty or invalid")
    release_name = str(meta[0].get("release_name") or "")
    if not release_name:
        raise SystemExit("Adoptium release metadata has no release_name")
    if expected_release and release_name != expected_release:
        raise SystemExit(
            f"Adoptium release drifted: expected {expected_release}, got {release_name}",
        )
    binaries = meta[0].get("binaries") or []
    package = (binaries[0].get("package") or {}) if binaries else {}
    checksum = str(package.get("checksum") or "")
    return url, release_name, checksum


def _resolve_sha256(
    value: str,
    discovered: str,
    os_name: str,
    arch: str,
    release_name: str,
) -> str:
    override = value.strip()
    if override:
        return override
    if discovered.strip():
        return discovered.strip()
    raise SystemExit(
        "JRE SHA-256 is required; set --sha256 or QWENPAW_JRE_SHA256 for the pinned "
        f"{release_name}-{os_name}-{arch} archive",
    )


def _extract(archive: Path, workdir: Path) -> Path:
    """Extract *archive* into *workdir* and return the JDK root directory."""
    # pylint: disable=too-many-branches,too-many-statements
    if archive.suffix == ".zip":
        with zipfile.ZipFile(archive) as zip_file:
            infos = zip_file.infolist()
            names = [info.filename for info in infos]
            if len(names) != len(set(names)):
                raise SystemExit("duplicate JRE ZIP members are not allowed")
            root = workdir.resolve()
            for info in infos:
                _validate_member(info.filename, root)
                mode = (info.external_attr >> 16) & 0o170000
                if mode in {0o120000, 0o060000, 0o020000}:
                    raise SystemExit(
                        f"unsafe JRE ZIP link/device member: {info.filename}",
                    )
            for info in infos:
                target = (root / info.filename).resolve()
                _validate_member(info.filename, root)
                if info.is_dir():
                    target.mkdir(parents=True, exist_ok=True)
                else:
                    target.parent.mkdir(parents=True, exist_ok=True)
                    with (
                        zip_file.open(info) as source,
                        target.open(
                            "wb",
                        ) as dest,
                    ):
                        shutil.copyfileobj(source, dest)
                    target.chmod((info.external_attr >> 16) & 0o777 or 0o644)
    else:
        with tarfile.open(archive, "r:gz") as tar:
            members = tar.getmembers()
            root = workdir.resolve()
            for member in members:
                _validate_member(member.name, root)
                if not (member.isdir() or member.isfile() or member.issym()):
                    raise SystemExit(
                        f"unsafe JRE tar member type: {member.name}",
                    )
            for member in members:
                target = (root / member.name).resolve()
                try:
                    target.relative_to(root)
                except ValueError:
                    raise SystemExit(
                        f"JRE member resolves outside target: {member.name}",
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
                            f"JRE tar symlink escapes target: {member.name}",
                        ) from None
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.symlink_to(member.linkname)
                    continue
                target.parent.mkdir(parents=True, exist_ok=True)
                source = tar.extractfile(member)
                if source is None:
                    raise SystemExit(
                        f"cannot read JRE tar member: {member.name}",
                    )
                with source, target.open("wb") as dest:
                    shutil.copyfileobj(source, dest)
                target.chmod(member.mode & 0o777 or 0o644)

    # Find the top-level extracted directory.
    dirs = [p for p in workdir.iterdir() if p.is_dir()]
    if len(dirs) == 1:
        return dirs[0]
    # On macOS the tarball contains a .jdk bundle directory.
    jdk_dirs = [d for d in dirs if "jdk" in d.name.lower()]
    if jdk_dirs:
        return jdk_dirs[0]
    if dirs:
        return dirs[0]
    raise SystemExit("failed to locate extracted JRE directory")


def _validate_member(name: str, root: Path) -> None:
    target = (root / name).resolve()
    try:
        target.relative_to(root)
    except ValueError:
        raise SystemExit(f"archive member escapes target: {name}") from None


def _is_staged(dest: Path, marker: Path, marker_value: str) -> bool:
    return (
        _java_exe(dest).is_file()
        and marker.is_file()
        and marker.read_text(encoding="utf-8").strip() == marker_value
    )


def _prune_regenerable_runtime_files(root: Path, os_name: str) -> None:
    """Remove VM caches that are unnecessary and troublesome to package."""
    if os_name != "windows":
        return
    for cache in root.glob("bin/server/classes*.jsa"):
        if cache.is_file():
            cache.unlink()


def main() -> None:
    # pylint: disable=too-many-statements
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dest",
        required=True,
        help="Target directory for the JRE",
    )
    parser.add_argument(
        "--sha256",
        default=os.environ.get("QWENPAW_JRE_SHA256", ""),
        help="Expected SHA-256 for the exact JRE archive (required for production builds)",
    )
    parser.add_argument(
        "--java-version",
        default=os.environ.get("QWENPAW_JAVA_VERSION", DEFAULT_JAVA_VERSION),
        help=f"Java major version (default: {DEFAULT_JAVA_VERSION})",
    )
    parser.add_argument(
        "--java-release",
        default=os.environ.get("QWENPAW_JAVA_RELEASE", ""),
        help="Pinned Adoptium release_name (required for production builds)",
    )
    args = parser.parse_args()

    java_version = args.java_version
    dest = Path(args.dest).resolve()
    marker = dest / ".java-runtime-version"

    if (
        os.environ.get("QWENPAW_REQUIRE_RUNTIME_HASHES", "").lower()
        in {"1", "true", "yes"}
        and not args.java_release
    ):
        raise SystemExit("production build requires QWENPAW_JAVA_RELEASE")
    download_url, release_name, discovered_sha256 = _resolve_download_url(
        java_version,
        args.java_release,
    )
    os_name, arch = _target()
    expected_sha256 = _resolve_sha256(
        args.sha256,
        discovered_sha256,
        os_name,
        arch,
        release_name,
    )
    if (
        os.environ.get("QWENPAW_REQUIRE_RUNTIME_HASHES", "").lower()
        in {"1", "true", "yes"}
        and not args.sha256
    ):
        raise SystemExit("production build requires QWENPAW_JRE_SHA256")
    marker_value = f"{release_name}-{os_name}-{arch}-{expected_sha256.lower()}"

    if _is_staged(dest, marker, marker_value):
        print(f"java-runtime already staged ({marker_value}); skipping")
        return

    print(
        f"Staging Eclipse Temurin JRE {java_version} for {os_name}-{arch}...",
    )
    print(f"Downloading {download_url}")

    with tempfile.TemporaryDirectory() as tmp:
        tmpdir = Path(tmp)
        # Determine the file extension from the platform.
        suffix = ".zip" if os_name == "windows" else ".tar.gz"
        archive = tmpdir / f"jre{suffix}"
        archive_bytes = _http_get(download_url)
        _verify_sha256(archive_bytes, args.sha256 or expected_sha256)
        archive.write_bytes(archive_bytes)
        extracted = _extract(archive, tmpdir)

        staged_dest = tmpdir / "staged-java-runtime"
        staged_dest.mkdir(parents=True, exist_ok=True)
        # Move the contents of the extracted JDK root into dest.
        for item in extracted.iterdir():
            shutil.move(str(item), str(staged_dest / item.name))
        if not _java_exe(staged_dest).is_file():
            raise SystemExit("staging failed: java executable missing")
        _prune_regenerable_runtime_files(staged_dest, os_name)
        atomic_install_tree(staged_dest, dest)

    java_exe = _java_exe(dest)
    if not java_exe.is_file():
        raise SystemExit(
            f"staging failed: java executable missing at {java_exe}",
        )
    marker.write_text(marker_value, encoding="utf-8")
    print(f"Staged java-runtime at {dest}")
    print(f"  java binary: {java_exe}")


if __name__ == "__main__":
    main()
