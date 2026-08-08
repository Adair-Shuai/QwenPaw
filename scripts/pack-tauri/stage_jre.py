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


def _resolve_download_url(java_version: str) -> tuple[str, str]:
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
    try:
        meta = json.loads(_http_get(meta_url).decode("utf-8"))
        release_name = meta[0]["release_name"]
    except Exception:
        release_name = f"jdk-{java_version}"
    return url, release_name


def _extract(archive: Path, workdir: Path) -> Path:
    """Extract *archive* into *workdir* and return the JDK root directory."""
    if archive.suffix == ".zip":
        with zipfile.ZipFile(archive) as zip_file:
            zip_file.extractall(workdir)
    else:
        with tarfile.open(archive, "r:gz") as tar:
            try:
                tar.extractall(workdir, filter="data")
            except TypeError:
                tar.extractall(workdir)

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


def _is_staged(dest: Path, marker: Path, marker_value: str) -> bool:
    return (
        _java_exe(dest).is_file()
        and marker.is_file()
        and marker.read_text(encoding="utf-8").strip() == marker_value
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dest",
        required=True,
        help="Target directory for the JRE",
    )
    parser.add_argument(
        "--java-version",
        default=os.environ.get("QWENPAW_JAVA_VERSION", DEFAULT_JAVA_VERSION),
        help=f"Java major version (default: {DEFAULT_JAVA_VERSION})",
    )
    args = parser.parse_args()

    java_version = args.java_version
    dest = Path(args.dest).resolve()
    marker = dest / ".java-runtime-version"

    download_url, release_name = _resolve_download_url(java_version)
    os_name, arch = _target()
    marker_value = f"{release_name}-{os_name}-{arch}"

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
        archive.write_bytes(_http_get(download_url))
        extracted = _extract(archive, tmpdir)

        if dest.exists():
            shutil.rmtree(dest)
        dest.mkdir(parents=True, exist_ok=True)
        # Move the contents of the extracted JDK root into dest.
        for item in extracted.iterdir():
            shutil.move(str(item), str(dest / item.name))

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
