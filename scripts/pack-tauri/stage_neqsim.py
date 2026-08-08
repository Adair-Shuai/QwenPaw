#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Stage the NeqSim MCP Server fat-jar for the Tauri desktop bundle.

Downloads the ``neqsim-mcp-server-<version>-runner.jar`` from the NeqSim
GitHub releases and places it into ``<dest>/neqsim-mcp-server.jar``.

This fat-jar is a self-contained Quarkus application that exposes the
NeqSim thermodynamic / process simulation engine through the Model Context
Protocol (MCP).  It is launched as a stdio MCP server subprocess by the
bundled JRE — no JPype1 or JNI embedding is required.

Usage:
    python scripts/pack-tauri/stage_neqsim.py --dest binaries/neqsim
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

GITHUB_API_URL = "https://api.github.com/repos/equinor/neqsim/releases/latest"
GITHUB_DOWNLOAD_BASE = "https://github.com/equinor/neqsim/releases/download"
DEFAULT_VERSION = "3.17.0"
HTTP_ATTEMPTS = 4
HTTP_TIMEOUT_SECONDS = 180  # the JAR is ~82 MB
RETRYABLE_HTTP_STATUS = {408, 429, 500, 502, 503, 504}
JAR_NAME = "neqsim-mcp-server.jar"
SHA256_NAME = "neqsim-mcp-server.jar.sha256"


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


def _resolve_release(version: str) -> tuple[str, str, str]:
    """Return (jar_url, sha256_url, version_label) for the given version."""
    # If version is "latest", query the API; otherwise construct the URL.
    if version.lower() == "latest":
        print(f"Querying GitHub API: {GITHUB_API_URL}")
        data = json.loads(_http_get(GITHUB_API_URL).decode("utf-8"))
        tag = data.get("tag_name", "")
        version = tag.lstrip("v") if tag else version
        base = f"{GITHUB_DOWNLOAD_BASE}/{tag}" if tag else GITHUB_DOWNLOAD_BASE
    else:
        tag = f"v{version}" if not version.startswith("v") else version
        base = f"{GITHUB_DOWNLOAD_BASE}/{tag}"

    jar_name = f"neqsim-mcp-server-{version}-runner.jar"
    jar_url = f"{base}/{jar_name}"
    sha_url = f"{base}/{jar_name}.sha256"
    return jar_url, sha_url, version


def _verify_sha256(jar_data: bytes, sha_url: str) -> bool:
    """Download the published SHA-256 and compare.  Best-effort: returns
    False if the checksum file cannot be fetched."""
    try:
        sha_text = _http_get(sha_url).decode("utf-8").strip()
        # The file may contain just the hash or "hash  filename".
        expected = sha_text.split()[0].lower()
        actual = hashlib.sha256(jar_data).hexdigest()
        if expected != actual:
            print(
                f"SHA-256 mismatch: expected {expected}, got {actual}",
                file=sys.stderr,
            )
            return False
        return True
    except Exception:
        print(
            "WARNING: could not verify SHA-256 (checksum unavailable); "
            "proceeding without verification",
            file=sys.stderr,
        )
        return True  # non-fatal


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dest",
        required=True,
        help="Target directory for the NeqSim JAR",
    )
    parser.add_argument(
        "--version",
        default=os.environ.get("QWENPAW_NEQSIM_VERSION", DEFAULT_VERSION),
        help=f"NeqSim version (default: {DEFAULT_VERSION})",
    )
    args = parser.parse_args()

    version = args.version
    dest = Path(args.dest).resolve()
    dest.mkdir(parents=True, exist_ok=True)

    jar_path = dest / JAR_NAME
    marker = dest / ".neqsim-version"

    jar_url, sha_url, resolved_version = _resolve_release(version)
    marker_value = resolved_version

    if (
        jar_path.is_file()
        and marker.is_file()
        and marker.read_text(encoding="utf-8").strip() == marker_value
    ):
        print(f"neqsim-mcp-server already staged ({marker_value}); skipping")
        return

    print(f"Staging NeqSim MCP Server {resolved_version}...")
    print(f"Downloading {jar_url}")

    jar_data = _http_get(jar_url)
    print(f"Downloaded {len(jar_data) / 1048576:.2f} MB")

    if not _verify_sha256(jar_data, sha_url):
        raise SystemExit(
            "SHA-256 verification failed — refusing to stage untrusted JAR",
        )

    jar_path.write_bytes(jar_data)
    marker.write_text(marker_value, encoding="utf-8")
    print(f"Staged neqsim-mcp-server at {jar_path}")


if __name__ == "__main__":
    main()
