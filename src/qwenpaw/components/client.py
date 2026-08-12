# -*- coding: utf-8 -*-
"""Signed Manifest and artifact client for an OSS-compatible HTTP endpoint."""

from __future__ import annotations

import hashlib
import os
from pathlib import Path
from urllib.parse import urlparse

import httpx

from .update import ComponentUpdateError, ComponentUpdater


def _https_url(value: str) -> str:
    parsed = urlparse(value)
    if parsed.scheme not in {"https", "http"} or not parsed.netloc:
        raise ComponentUpdateError(f"unsupported component URL: {value!r}")
    if parsed.scheme == "http" and parsed.hostname not in {"127.0.0.1", "localhost", "::1"}:
        raise ComponentUpdateError("component downloads require HTTPS")
    return value


class ComponentClient:
    """Download signed component metadata/artifacts with resumable caching."""

    def __init__(self, updater: ComponentUpdater, cache_root: Path, *, client: httpx.Client | None = None):
        self.updater = updater
        self.cache_root = cache_root.resolve()
        self.client = client or httpx.Client(timeout=httpx.Timeout(30.0, read=120.0), follow_redirects=False)

    def close(self) -> None:
        self.client.close()

    def fetch_manifest(self, url: str, signature_url: str | None = None) -> dict:
        url = _https_url(url)
        response = self.client.get(url, headers={"Cache-Control": "no-cache"})
        response.raise_for_status()
        signature_response = self.client.get(_https_url(signature_url or f"{url}.sig"))
        signature_response.raise_for_status()
        self.cache_root.mkdir(parents=True, exist_ok=True)
        manifest_path = self.cache_root / "manifest.json"
        signature_path = self.cache_root / "manifest.json.sig"
        _atomic_write(manifest_path, response.content)
        _atomic_write(signature_path, signature_response.content)
        return self.updater.load_manifest(manifest_path, signature_path)

    def download_artifact(self, url: str, *, sha256: str, size: int, name: str) -> Path:
        url = _https_url(url)
        if type(size) is not int or size < 0:
            raise ComponentUpdateError("invalid artifact size")
        if len(sha256) != 64 or any(char not in "0123456789abcdefABCDEF" for char in sha256):
            raise ComponentUpdateError("invalid artifact sha256")
        self.cache_root.mkdir(parents=True, exist_ok=True)
        if not name or Path(name).name != name or name in {".", ".."}:
            raise ComponentUpdateError("invalid artifact cache name")
        final = self.cache_root / name
        partial = final.with_name(final.name + ".part")
        existing = partial.stat().st_size if partial.is_file() else 0
        headers = {"Range": f"bytes={existing}-"} if existing else {}
        with self.client.stream("GET", url, headers=headers) as response:
            if existing and response.status_code == 200:
                existing = 0
                partial.unlink(missing_ok=True)
                response.close()
                with self.client.stream("GET", url) as retry:
                    retry.raise_for_status()
                    _stream_to_file(retry, partial, append=False)
            else:
                response.raise_for_status()
                _stream_to_file(response, partial, append=bool(existing))
        if partial.stat().st_size != size:
            raise ComponentUpdateError("downloaded artifact size mismatch")
        digest = _sha256_file(partial)
        if digest.lower() != sha256.lower():
            partial.unlink(missing_ok=True)
            raise ComponentUpdateError("downloaded artifact sha256 mismatch")
        os.replace(partial, final)
        return final


def _stream_to_file(response: httpx.Response, path: Path, *, append: bool) -> None:
    mode = "ab" if append else "wb"
    with path.open(mode) as stream:
        for chunk in response.iter_bytes(1024 * 1024):
            if chunk:
                stream.write(chunk)


def _atomic_write(path: Path, payload: bytes) -> None:
    temporary = path.with_name(f".{path.name}.tmp")
    temporary.write_bytes(payload)
    os.replace(temporary, path)


def _sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()
