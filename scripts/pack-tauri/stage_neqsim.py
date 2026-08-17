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
import re
import sys
import tempfile
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
_SHA256_PATTERN = re.compile(r"^[0-9a-f]{64}$")


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


def _normalize_sha256(value: str, label: str) -> str:
    digest = value.strip().split()[0].lower() if value.strip() else ""
    if not _SHA256_PATTERN.fullmatch(digest):
        raise SystemExit(f"invalid SHA-256 for {label}: {value!r}")
    return digest


def _published_sha256(sha_url: str, *, required: bool) -> str:
    """Return the release checksum, optionally failing closed."""
    try:
        return _normalize_sha256(
            _http_get(sha_url).decode("utf-8"),
            "published NeqSim checksum",
        )
    except Exception as exc:
        if required:
            raise SystemExit(
                "production build could not obtain the published NeqSim "
                f"checksum: {exc}",
            ) from exc
        print(
            "WARNING: could not verify SHA-256 (checksum unavailable); "
            "proceeding without verification",
            file=sys.stderr,
        )
        return ""


def _verify_sha256(jar_data: bytes, expected: str) -> str:
    """Verify bytes against a fixed digest and return the actual digest."""
    actual = hashlib.sha256(jar_data).hexdigest()
    if expected and expected != actual:
        raise SystemExit(
            f"SHA-256 mismatch: expected {expected}, got {actual}",
        )
    return actual


def _atomic_write(path: Path, data: bytes) -> None:
    """Write a build artifact atomically, even under concurrent builds."""
    with tempfile.NamedTemporaryFile(
        dir=path.parent,
        prefix=f".{path.name}.",
        suffix=".tmp",
        delete=False,
    ) as stream:
        stream.write(data)
        stream.flush()
        os.fsync(stream.fileno())
        temporary = Path(stream.name)
    try:
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def _atomic_write_text(path: Path, value: str) -> None:
    _atomic_write(path, value.encode("utf-8"))


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
    parser.add_argument(
        "--sha256",
        default=os.environ.get("QWENPAW_NEQSIM_SHA256", ""),
        help="Pinned NeqSim JAR SHA-256 (required for production builds)",
    )
    args = parser.parse_args()

    version = args.version
    dest = Path(args.dest).resolve()
    dest.mkdir(parents=True, exist_ok=True)

    jar_path = dest / JAR_NAME
    marker = dest / ".neqsim-version"
    sha_marker = dest / SHA256_NAME

    production_hashes = os.environ.get(
        "QWENPAW_REQUIRE_RUNTIME_HASHES",
        "",
    ).lower() in {"1", "true", "yes"}
    fixed_sha256 = (
        _normalize_sha256(args.sha256, "QWENPAW_NEQSIM_SHA256")
        if args.sha256
        else ""
    )
    if production_hashes and not fixed_sha256:
        raise SystemExit(
            "production build requires QWENPAW_NEQSIM_SHA256",
        )

    jar_url, sha_url, resolved_version = _resolve_release(version)
    marker_value = resolved_version

    if (
        jar_path.is_file()
        and marker.is_file()
        and marker.read_text(encoding="utf-8").strip() == marker_value
    ):
        cached_expected = fixed_sha256
        if not cached_expected and sha_marker.is_file():
            cached_expected = _normalize_sha256(
                sha_marker.read_text(encoding="utf-8"),
                "cached NeqSim checksum",
            )
        if not cached_expected:
            cached_expected = _published_sha256(
                sha_url,
                required=production_hashes,
            )
        cached_actual = _verify_sha256(jar_path.read_bytes(), cached_expected)
        if cached_expected:
            _atomic_write_text(sha_marker, cached_actual)
            print(
                f"neqsim-mcp-server already staged ({marker_value}); "
                "checksum verified",
            )
            return
        print(
            "WARNING: cached NeqSim JAR has no trusted checksum; "
            "refreshing it",
            file=sys.stderr,
        )

    print(f"Staging NeqSim MCP Server {resolved_version}...")
    print(f"Downloading {jar_url}")

    jar_data = _http_get(jar_url)
    print(f"Downloaded {len(jar_data) / 1048576:.2f} MB")

    expected_sha256 = fixed_sha256 or _published_sha256(
        sha_url,
        required=production_hashes,
    )
    actual_sha256 = _verify_sha256(jar_data, expected_sha256)

    _atomic_write(jar_path, jar_data)
    _atomic_write_text(marker, marker_value)
    _atomic_write_text(sha_marker, actual_sha256)
    print(f"Staged neqsim-mcp-server at {jar_path}")


if __name__ == "__main__":
    main()
