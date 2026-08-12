# -*- coding: utf-8 -*-
"""Signed Manifest and artifact client for an OSS-compatible HTTP endpoint."""

from __future__ import annotations

import hashlib
import json
import os
import shutil
from pathlib import Path
from urllib.parse import urljoin, urlparse

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
        try:
            pointer = response.json()
        except ValueError:
            pointer = None
        pointer_fields = {
            "schema_version",
            "target",
            "release_id",
            "manifest_url",
            "manifest_size",
            "manifest_sha256",
            "manifest_signature",
            "signature",
        }
        if (
            isinstance(pointer, dict)
            and pointer.get("schema_version") == 1
            and pointer_fields.issubset(pointer)
        ):
            return self._fetch_signed_pointer(url, pointer)
        signature_response = self.client.get(_https_url(signature_url or f"{url}.sig"))
        signature_response.raise_for_status()
        manifest_path, signature_path = self._stage_manifest(response.content, signature_response.content)
        return self.updater.load_manifest(manifest_path, signature_path)

    def _fetch_signed_pointer(self, pointer_url: str, pointer: dict) -> dict:
        signature = pointer.get("signature")
        payload = dict(pointer)
        payload.pop("signature", None)
        if not isinstance(signature, str) or not signature:
            raise ComponentUpdateError("component pointer signature is required")
        _verify_pointer_signature(payload, signature, self.updater.public_key_b64)
        if payload.get("target") != self.updater.target:
            raise ComponentUpdateError("component pointer target mismatch")
        if not isinstance(payload.get("release_id"), str) or not payload["release_id"]:
            raise ComponentUpdateError("component pointer release id is invalid")
        if not isinstance(payload.get("manifest_url"), str) or not payload["manifest_url"]:
            raise ComponentUpdateError("component pointer manifest URL is invalid")
        manifest_url = _https_url(urljoin(pointer_url, str(payload["manifest_url"])))
        manifest_response = self.client.get(manifest_url, headers={"Cache-Control": "no-cache"})
        manifest_response.raise_for_status()
        if type(payload.get("manifest_size")) is not int or len(manifest_response.content) != payload["manifest_size"]:
            raise ComponentUpdateError("component manifest size mismatch")
        if _sha256_bytes(manifest_response.content).lower() != str(payload.get("manifest_sha256", "")).lower():
            raise ComponentUpdateError("component manifest sha256 mismatch")
        signature_url = _https_url(f"{manifest_url}.sig")
        signature_response = self.client.get(signature_url, headers={"Cache-Control": "no-cache"})
        signature_response.raise_for_status()
        if signature_response.text.strip() != str(payload.get("manifest_signature", "")).strip():
            raise ComponentUpdateError("component manifest signature does not match pointer")
        manifest_path, signature_path = self._stage_manifest(manifest_response.content, signature_response.content)
        return self.updater.load_manifest(manifest_path, signature_path)

    def _stage_manifest(self, manifest: bytes, signature: bytes) -> tuple[Path, Path]:
        self.cache_root.mkdir(parents=True, exist_ok=True)
        # Keep each verified JSON/signature pair in its own immutable cache
        # directory.  A crash or concurrent fetch can therefore never leave
        # the shared ``manifest.json`` and ``manifest.json.sig`` mixed.
        digest = _sha256_bytes(manifest)
        manifests_root = self.cache_root / "manifests"
        manifests_root.mkdir(parents=True, exist_ok=True)
        staged = manifests_root / digest
        if not staged.is_dir():
            temporary = manifests_root / f".{digest}.{os.getpid()}.tmp"
            try:
                temporary.mkdir(parents=True, exist_ok=False)
                (temporary / "manifest.json").write_bytes(manifest)
                (temporary / "manifest.json.sig").write_bytes(signature)
                os.replace(temporary, staged)
            except FileExistsError:
                shutil.rmtree(temporary, ignore_errors=True)
            except Exception:
                shutil.rmtree(temporary, ignore_errors=True)
                raise
        manifest_path = staged / "manifest.json"
        signature_path = staged / "manifest.json.sig"
        return manifest_path, signature_path

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


def _sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def _verify_pointer_signature(payload: dict, signature: str, public_key_b64: str) -> None:
    from .update import _verify_signature

    _verify_signature(
        json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        .encode("utf-8")
        + b"\n",
        signature,
        public_key_b64,
    )
