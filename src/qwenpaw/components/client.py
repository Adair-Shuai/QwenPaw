# -*- coding: utf-8 -*-
"""Signed Manifest and artifact client for an OSS-compatible HTTP endpoint."""

from __future__ import annotations

import hashlib
import json
import os
import shutil
import threading
import logging
import time
import uuid
import warnings
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse

import httpx
from packaging.version import InvalidVersion, Version

from .update import ComponentUpdateError, ComponentUpdater

logger = logging.getLogger(__name__)
_LEGACY_WARNING_EMITTED = False
_CACHE_MAX_MANIFESTS = 8
_CACHE_MAX_ARTIFACTS = 12
_CACHE_MAX_ARTIFACT_BYTES = 4 * 1024 * 1024 * 1024
_ORPHAN_PART_SECONDS = 7 * 24 * 60 * 60
_ORPHAN_TMP_SECONDS = 24 * 60 * 60
_DEFAULT_LEGACY_UNTIL_CORE = "2.2.0"


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
        configured_hosts = os.environ.get("QWENPAW_COMPONENT_ALLOWED_HOSTS", "")
        self.allowed_hosts = {item.strip().lower() for item in configured_hosts.split(",") if item.strip()}
        self._download_lock = threading.RLock()

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
        pointer_only = {"release_id", "manifest_url", "manifest_sha256", "manifest_signature", "signature"}
        if isinstance(pointer, dict) and pointer_only & set(pointer):
            raise ComponentUpdateError("malformed component pointer")
        legacy_setting = os.environ.get("QWENPAW_COMPONENT_ALLOW_LEGACY_MANIFEST", "").strip().lower()
        legacy_until = os.environ.get("QWENPAW_COMPONENT_LEGACY_UNTIL_CORE", _DEFAULT_LEGACY_UNTIL_CORE).strip()
        try:
            before_cutoff = Version(self.updater.core_version) < Version(legacy_until)
        except InvalidVersion as exc:
            raise ComponentUpdateError("invalid legacy manifest compatibility cutoff") from exc
        legacy_allowed = before_cutoff and legacy_setting not in {"0", "false", "no"}
        if not legacy_allowed:
            raise ComponentUpdateError("legacy component manifests are disabled")
        global _LEGACY_WARNING_EMITTED
        if not _LEGACY_WARNING_EMITTED:
            _LEGACY_WARNING_EMITTED = True
            logger.warning("Legacy component manifest endpoint is deprecated for host %s and disabled by default at Core %s; migrate to a signed *.current.json pointer", urlparse(url).hostname, legacy_until)
            warnings.warn("Legacy component manifest endpoints are deprecated", DeprecationWarning, stacklevel=2)
        resolved_signature_url = _https_url(signature_url or f"{url}.sig")
        signature_host = urlparse(resolved_signature_url).hostname.lower()
        manifest_host = urlparse(url).hostname.lower()
        if signature_host != manifest_host and signature_host not in self.allowed_hosts:
            raise ComponentUpdateError("legacy component signature host is not allowlisted")
        signature_response = self.client.get(resolved_signature_url)
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
        manifest_host = urlparse(manifest_url).hostname.lower()
        pointer_host = urlparse(pointer_url).hostname.lower()
        if manifest_host != pointer_host and manifest_host not in self.allowed_hosts:
            raise ComponentUpdateError("component manifest host is not allowlisted")
        if "published_at" in payload or "expires_at" in payload:
            for field in ("published_at", "expires_at"):
                if not isinstance(payload.get(field), str):
                    raise ComponentUpdateError(f"component pointer {field} is invalid")
            try:
                expires_at = datetime.fromisoformat(payload["expires_at"].replace("Z", "+00:00"))
            except ValueError as exc:
                raise ComponentUpdateError("component pointer expiry is invalid") from exc
            if expires_at <= datetime.now(timezone.utc):
                raise ComponentUpdateError("component pointer has expired")
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
        valid_cached = (
            staged.is_dir()
            and not staged.is_symlink()
            and (staged / "manifest.json").is_file()
            and (staged / "manifest.json.sig").is_file()
            and _sha256_file(staged / "manifest.json") == digest
            and (staged / "manifest.json.sig").read_bytes() == signature
        )
        if not valid_cached:
            if staged.exists() or staged.is_symlink():
                if staged.is_symlink():
                    staged.unlink()
                else:
                    shutil.rmtree(staged)
            temporary = manifests_root / f".{digest}.{os.getpid()}.{uuid.uuid4().hex}.tmp"
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
        os.utime(staged, None)
        self._prune_cache(protected={staged})
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
        artifact_root = self.cache_root / "artifacts" / sha256.lower()
        artifact_root.mkdir(parents=True, exist_ok=True)
        final = artifact_root / name
        partial = final.with_name(final.name + ".part")
        lease = artifact_root / ".download.lock"
        with self._download_lock:
            if final.is_file() and not final.is_symlink() and final.stat().st_size == size and _sha256_file(final).lower() == sha256.lower():
                os.utime(artifact_root, None)
                self._prune_cache(protected={artifact_root})
                return final
            if final.exists() or final.is_symlink():
                final.unlink(missing_ok=True)
            try:
                lease.mkdir()
            except FileExistsError as exc:
                raise ComponentUpdateError("artifact cache download is already in progress") from exc
            try:
                return self._download_artifact_locked(url, sha256, size, final, partial)
            finally:
                shutil.rmtree(lease, ignore_errors=True)

    def _download_artifact_locked(self, url: str, sha256: str, size: int, final: Path, partial: Path) -> Path:
        if partial.is_symlink() or final.is_symlink():
            raise ComponentUpdateError("artifact cache paths may not be symlinks")
        existing = partial.stat().st_size if partial.is_file() else 0
        if existing > size:
            partial.unlink(missing_ok=True)
            existing = 0
        headers = {"Range": f"bytes={existing}-"} if existing else {}
        with self.client.stream("GET", url, headers=headers) as response:
            status = response.status_code
            content_range = response.headers.get("Content-Range", "")
            valid_range = not existing or (status == 206 and content_range.startswith(f"bytes {existing}-"))
            if valid_range and status != 200:
                response.raise_for_status()
                _stream_to_file(response, partial, append=bool(existing))
            elif valid_range and status == 200 and not existing:
                response.raise_for_status()
                _stream_to_file(response, partial, append=False)
            else:
                response.close()
                partial.unlink(missing_ok=True)
                with self.client.stream("GET", url) as retry:
                    retry.raise_for_status()
                    _stream_to_file(retry, partial, append=False)
        if partial.stat().st_size != size:
            raise ComponentUpdateError("downloaded artifact size mismatch")
        digest = _sha256_file(partial)
        if digest.lower() != sha256.lower():
            partial.unlink(missing_ok=True)
            raise ComponentUpdateError("downloaded artifact sha256 mismatch")
        os.replace(partial, final)
        os.utime(final.parent, None)
        self._prune_cache(protected={final.parent})
        return final

    def _prune_cache(self, *, protected: set[Path]) -> None:
        """Best-effort bounded LRU cleanup; cache failures never fail updates."""
        now = time.time()
        try:
            for path in self.cache_root.rglob("*"):
                if path in protected or path.is_symlink():
                    continue
                age = now - path.stat().st_mtime
                if path.is_file() and path.name.endswith(".part") and age > _ORPHAN_PART_SECONDS:
                    path.unlink(missing_ok=True)
                elif path.name.startswith(".") and path.name.endswith(".tmp") and age > _ORPHAN_TMP_SECONDS:
                    if path.is_dir():
                        shutil.rmtree(path)
                    else:
                        path.unlink(missing_ok=True)
                elif path.name == ".download.lock" and path.is_dir() and age > _ORPHAN_TMP_SECONDS:
                    shutil.rmtree(path)
            manifests = self.cache_root / "manifests"
            manifest_dirs = sorted(
                (p for p in manifests.iterdir() if p.is_dir() and not p.is_symlink() and p not in protected),
                key=lambda p: (p.stat().st_mtime, p.name), reverse=True,
            ) if manifests.is_dir() else []
            for expired in manifest_dirs[_CACHE_MAX_MANIFESTS:]:
                shutil.rmtree(expired)
            artifacts = self.cache_root / "artifacts"
            artifact_dirs = sorted(
                (
                    p for p in artifacts.iterdir()
                    if p.is_dir() and not p.is_symlink() and p not in protected
                    and not any(item.name.endswith(".part") or item.name == ".download.lock" for item in p.iterdir())
                ),
                key=lambda p: (p.stat().st_mtime, p.name), reverse=True,
            ) if artifacts.is_dir() else []
            sizes = {p: sum(item.stat().st_size for item in p.rglob("*") if item.is_file()) for p in artifact_dirs}
            total = sum(sizes.values())
            retained = artifact_dirs[:_CACHE_MAX_ARTIFACTS]
            for expired in artifact_dirs[_CACHE_MAX_ARTIFACTS:]:
                total -= sizes[expired]
                shutil.rmtree(expired)
            while total > _CACHE_MAX_ARTIFACT_BYTES and retained:
                expired = retained.pop()
                total -= sizes[expired]
                shutil.rmtree(expired)
            for root in (artifacts, manifests):
                if root.is_dir():
                    for child in root.iterdir():
                        if child.is_dir() and not child.is_symlink() and not any(child.iterdir()):
                            child.rmdir()
        except OSError:
            logger.warning("Component cache cleanup failed", exc_info=True)

    def record_failure(self, component: str, exc: Exception) -> None:
        try:
            diagnostics = self.cache_root / "diagnostics"
            diagnostics.mkdir(parents=True, exist_ok=True)
            payload = {
                "component": component,
                "error_type": type(exc).__name__,
                "error": str(exc),
                "recorded_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            }
            _atomic_write(
                diagnostics / "latest-failure.json",
                (json.dumps(payload, ensure_ascii=False, sort_keys=True) + "\n").encode("utf-8"),
            )
        except OSError:
            logger.warning("Failed to record component update diagnostics", exc_info=True)


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
