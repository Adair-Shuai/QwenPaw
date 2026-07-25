#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Stage the OfficeCLI binary for the Tauri desktop bundle.

Downloads the correct pre-built ``officecli`` executable from the
OfficeCLI GitHub releases for the current platform / architecture and
places it into ``<dest>/officecli`` (or ``officecli.exe`` on Windows).

The resulting directory is listed in ``tauri.conf.json`` under
``bundle.resources`` so Tauri ships it inside the final .app / .exe.

Usage:
    python scripts/pack-tauri/stage_officecli.py --dest binaries/officecli
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import platform
import shutil
import stat
import sys
import tempfile
import urllib.request
from pathlib import Path

DEFAULT_OFFICECLI_VERSION = "v1.0.141"
GITHUB_API_URL = (
    "https://api.github.com/repos/iOfficeAI/OfficeCLI/releases/latest"
)
GITHUB_DOWNLOAD_BASE = (
    "https://github.com/iOfficeAI/OfficeCLI/releases/download"
)


def _target() -> tuple[str, str]:
    """Return (platform_name, arch) for the current machine."""
    system = platform.system()
    machine = platform.machine().lower()
    arch = {
        "amd64": "x64",
        "x86_64": "x64",
        "arm64": "arm64",
        "aarch64": "arm64",
    }.get(machine, machine)

    if system == "Windows":
        return "win", arch
    if system == "Darwin":
        return "mac", arch
    if system == "Linux":
        return "linux", arch
    raise SystemExit(f"unsupported platform: {system!r}")


def _binary_name(platform_name: str) -> str:
    """Return the executable filename for the given platform."""
    if platform_name == "win":
        return "officecli.exe"
    return "officecli"


def _release_asset_name(platform_name: str, arch: str) -> str:
    """Return the asset filename on GitHub releases."""
    if platform_name == "win":
        return f"officecli-win-{arch}.exe"
    return f"officecli-{platform_name}-{arch}"


def _resolve_version(explicit: str | None) -> str:
    """Resolve the OfficeCLI version to download.

    Priority:
    1. Explicit --version flag
    2. QWENPAW_OFFICECLI_VERSION env var
    3. Latest release tag from GitHub API
    4. DEFAULT_OFFICECLI_VERSION fallback
    """
    if explicit:
        return explicit
    env_ver = os.environ.get("QWENPAW_OFFICECLI_VERSION")
    if env_ver:
        return env_ver
    try:
        request = urllib.request.Request(GITHUB_API_URL)
        request.add_header("User-Agent", "qwenpaw-build")
        request.add_header("Accept", "application/vnd.github+json")
        with urllib.request.urlopen(request, timeout=30) as response:
            data = json.loads(response.read())
        tag = data.get("tag_name", "")
        if tag:
            return tag
    except Exception as exc:
        print(
            f"  [WARN] failed to query latest OfficeCLI release: {exc}",
            file=sys.stderr,
        )
    return DEFAULT_OFFICECLI_VERSION


def _sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def _http_download(url: str, dest: Path) -> None:
    """Download *url* to *dest* with a progress indicator."""
    request = urllib.request.Request(url)
    request.add_header("User-Agent", "qwenpaw-build")
    with urllib.request.urlopen(request, timeout=300) as response:
        total = int(response.headers.get("Content-Length", 0))
        downloaded = 0
        with open(dest, "wb") as f:
            while True:
                chunk = response.read(65536)
                if not chunk:
                    break
                f.write(chunk)
                downloaded += len(chunk)
                if total > 0:
                    pct = downloaded * 100 // total
                    sys.stdout.write(
                        f"\r  downloading... {pct}% "
                        f"({downloaded // 1024}KB / {total // 1024}KB)",
                    )
                    sys.stdout.flush()
        if total > 0:
            sys.stdout.write("\n")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dest",
        required=True,
        help="Destination directory for the officecli binary",
    )
    parser.add_argument(
        "--version",
        default=None,
        help="OfficeCLI version tag (e.g. v1.0.141). "
        "Defaults to env QWENPAW_OFFICECLI_VERSION or latest release.",
    )
    args = parser.parse_args()

    platform_name, arch = _target()
    binary_name = _binary_name(platform_name)
    asset_name = _release_asset_name(platform_name, arch)
    version = _resolve_version(args.version)
    dest = Path(args.dest).resolve()

    # Version marker for incremental skip
    marker = dest / ".officecli-version"
    expected_marker = f"{version}-{platform_name}-{arch}"

    binary_path = dest / binary_name
    if (
        binary_path.is_file()
        and marker.is_file()
        and marker.read_text(encoding="utf-8").strip() == expected_marker
    ):
        print(f"officecli already staged ({expected_marker}); skipping")
        return

    url = f"{GITHUB_DOWNLOAD_BASE}/{version}/{asset_name}"
    print(f"Staging OfficeCLI {version} for {platform_name}-{arch}...")
    print(f"  URL: {url}")

    dest.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp:
        tmpdir = Path(tmp)
        downloaded = tmpdir / asset_name
        _http_download(url, downloaded)

        # Verify download is not empty / error page
        if downloaded.stat().st_size < 1_000_000:
            # A real binary is >30MB; if smaller, it's likely an error page
            content = downloaded.read_text(errors="replace")[:500]
            raise SystemExit(
                f"Downloaded file is too small ({downloaded.stat().st_size} "
                f"bytes). Possible error page:\n{content}",
            )

        # Copy to final destination with correct name
        shutil.copy2(downloaded, binary_path)

        # Ensure executable on Unix
        if platform_name != "win":
            st = binary_path.stat()
            binary_path.chmod(
                st.st_mode | stat.S_IEXEC | stat.S_IXGRP | stat.S_IXOTH,
            )

    # Quick sanity check — verify the binary runs
    try:
        import subprocess

        result = subprocess.run(
            [str(binary_path), "--version"],
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )
        if result.returncode == 0:
            ver_output = (result.stdout or result.stderr).strip()
            print(f"  Verified: {ver_output}")
        else:
            print(
                f"  [WARN] officecli --version returned exit code "
                f"{result.returncode}",
                file=sys.stderr,
            )
    except Exception as exc:
        print(
            f"  [WARN] could not verify officecli binary: {exc}",
            file=sys.stderr,
        )

    marker.write_text(expected_marker, encoding="utf-8")
    print(f"Staged officecli at {dest / binary_name}")


if __name__ == "__main__":
    main()
