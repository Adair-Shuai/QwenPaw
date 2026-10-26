# -*- coding: utf-8 -*-
"""Persistent stale-while-revalidate cache for official market resources."""

from __future__ import annotations

import asyncio
import hashlib
import json
import time
from pathlib import Path
from typing import Any

import httpx

from ..constant import WORKING_DIR

OSS_BASE_URL = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com"
OSS_FRESH_SECONDS = 6 * 60 * 60
OSS_MANIFEST_FRESH_SECONDS = 60
OSS_TIMEOUT_SECONDS = 10
_CACHE_ROOT = Path(WORKING_DIR) / "cache" / "oss-market"
_REFRESH_TASKS: dict[str, asyncio.Task[tuple[bytes, str, str]]] = {}
_RETRY_AFTER: dict[str, float] = {}
_OFFLINE_RETRY_SECONDS = 15
_PREWARM_CONCURRENCY = 6
_RESOURCE_CONTENT_TYPES = {
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".md": "text/markdown",
    ".txt": "text/plain",
    ".yaml": "application/yaml",
    ".yml": "application/yaml",
    ".zip": "application/zip",
}


def _collect_icon_paths(value: Any, output: set[str]) -> None:
    """Collect cacheable icon references from a manifest tree."""
    if isinstance(value, dict):
        for key, child in value.items():
            if (
                key in {"icon_url", "icon_path"}
                and isinstance(child, str)
                and child.lower()
                .split("?", 1)[0]
                .endswith(
                    (".png", ".jpg", ".jpeg", ".svg", ".webp"),
                )
            ):
                output.add(child.lstrip("/"))
            else:
                _collect_icon_paths(child, output)
    elif isinstance(value, list):
        for child in value:
            _collect_icon_paths(child, output)


def _paths(resource_path: str) -> tuple[Path, Path]:
    digest = hashlib.sha256(resource_path.encode("utf-8")).hexdigest()
    return _CACHE_ROOT / f"{digest}.data", _CACHE_ROOT / f"{digest}.json"


def _read_cached(resource_path: str) -> tuple[bytes, dict[str, Any]] | None:
    data_path, meta_path = _paths(resource_path)
    try:
        metadata = json.loads(meta_path.read_text(encoding="utf-8"))
        if metadata.get("path") != resource_path:
            return None
        return data_path.read_bytes(), metadata
    except (OSError, ValueError, TypeError):
        return None


def _write_cached(
    resource_path: str,
    content: bytes,
    metadata: dict[str, Any],
) -> None:
    data_path, meta_path = _paths(resource_path)
    _CACHE_ROOT.mkdir(parents=True, exist_ok=True)
    data_tmp = data_path.with_suffix(".data.tmp")
    meta_tmp = meta_path.with_suffix(".json.tmp")
    data_tmp.write_bytes(content)
    meta_tmp.write_text(
        json.dumps(
            {"path": resource_path, "fetched_at": time.time(), **metadata},
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    data_tmp.replace(data_path)
    meta_tmp.replace(meta_path)


async def fetch_oss_resource(
    resource_path: str,
    *,
    force: bool = False,
) -> tuple[bytes, str, str]:
    """Return cached bytes immediately while sharing one background refresh.

    Explicit refreshes wait for upstream validation. A browser leaving the
    page must not cancel the shared download or make another reader wait for
    a stale resource that is already present on disk.
    """
    clean_path = resource_path.lstrip("/")
    if not clean_path or ".." in Path(clean_path).parts:
        raise ValueError("invalid OSS resource path")
    cached = await asyncio.to_thread(_read_cached, clean_path)
    if cached and not force:
        age = time.time() - float(cached[1].get("fetched_at", 0))
        freshness = (
            OSS_MANIFEST_FRESH_SECONDS
            if clean_path.endswith("manifest.json")
            else OSS_FRESH_SECONDS
        )
        if age < freshness:
            return cached[0], _content_type(clean_path, cached[1]), "fresh"
        if time.monotonic() >= _RETRY_AFTER.get(clean_path, 0):
            _refresh_task(clean_path, cached)
        return cached[0], _content_type(clean_path, cached[1]), "stale"

    return await asyncio.shield(_refresh_task(clean_path, cached))


def _content_type(resource_path: str, metadata: dict[str, Any]) -> str:
    # mimetypes' first guess scans the Windows registry synchronously; these
    # are the market's known asset types and are enough for old cache entries.
    return str(
        metadata.get("content_type")
        or _RESOURCE_CONTENT_TYPES.get(Path(resource_path).suffix.lower())
        or "application/octet-stream",
    )


def _refresh_task(
    clean_path: str,
    cached: tuple[bytes, dict[str, Any]] | None,
) -> asyncio.Task[tuple[bytes, str, str]]:
    task = _REFRESH_TASKS.get(clean_path)
    loop = asyncio.get_running_loop()
    if task is not None and not task.done() and task.get_loop() is loop:
        return task
    task = asyncio.create_task(_refresh_resource(clean_path, cached))
    _REFRESH_TASKS[clean_path] = task

    def _finished(done: asyncio.Task) -> None:
        if _REFRESH_TASKS.get(clean_path) is done:
            _REFRESH_TASKS.pop(clean_path, None)
        # Background misses have no awaiting caller; retrieve their exception
        # without hiding it from explicit-refresh and cold-start callers.
        if not done.cancelled():
            done.exception()

    task.add_done_callback(_finished)
    return task


async def _refresh_resource(
    clean_path: str,
    cached: tuple[bytes, dict[str, Any]] | None,
) -> tuple[bytes, str, str]:
    request_headers: dict[str, str] = {}
    if cached:
        if cached[1].get("etag"):
            request_headers["If-None-Match"] = str(cached[1]["etag"])
        if cached[1].get("last_modified"):
            request_headers["If-Modified-Since"] = str(
                cached[1]["last_modified"],
            )
    try:
        # Loading the system certificate store can block on Windows.
        # Keep client setup off the event loop alongside disk cache I/O.
        client = await asyncio.to_thread(
            httpx.AsyncClient,
            timeout=OSS_TIMEOUT_SECONDS,
        )
        async with client:
            response = await client.get(
                f"{OSS_BASE_URL}/{clean_path}",
                headers=request_headers,
            )
        if response.status_code == 304 and cached:
            metadata = dict(cached[1])
            metadata["fetched_at"] = time.time()
            await asyncio.to_thread(
                _write_cached, clean_path, cached[0], metadata,
            )
            _RETRY_AFTER.pop(clean_path, None)
            return cached[0], _content_type(clean_path, metadata), "revalidated"
        response.raise_for_status()
        if clean_path.endswith("manifest.json"):
            # A gateway error can arrive with HTTP 200. Never replace the
            # usable offline catalog with an HTML error or truncated JSON.
            manifest = json.loads(response.content)
            if not isinstance(manifest, (dict, list)):
                raise ValueError("invalid OSS manifest")
        content_type = response.headers.get("content-type", "").split(";", 1)[0]
        content_type = content_type or _content_type(clean_path, {})
        metadata = {
            "content_type": content_type,
            "etag": response.headers.get("etag"),
            "last_modified": response.headers.get("last-modified"),
        }
        await asyncio.to_thread(
            _write_cached, clean_path, response.content, metadata,
        )
        _RETRY_AFTER.pop(clean_path, None)
        return response.content, content_type, "network"
    except Exception:
        if cached:
            _RETRY_AFTER[clean_path] = (
                time.monotonic() + _OFFLINE_RETRY_SECONDS
            )
            return cached[0], _content_type(clean_path, cached[1]), "stale"
        raise


async def prewarm_oss_market() -> dict[str, int]:
    """Warm official manifests and referenced icons before first paint."""
    manifests = (
        "skills/manifest.json",
        "mcp/manifest.json",
        "agents/manifest.json",
    )

    async def _fetch_bounded(paths: list[str] | tuple[str, ...]):
        semaphore = asyncio.Semaphore(_PREWARM_CONCURRENCY)

        async def _fetch(path: str):
            async with semaphore:
                return await fetch_oss_resource(path)

        return await asyncio.gather(
            *(_fetch(path) for path in paths),
            return_exceptions=True,
        )

    results = await _fetch_bounded(manifests)
    icon_paths: set[str] = set()
    for result in results:
        if isinstance(result, Exception):
            continue
        try:
            payload = json.loads(result[0])
        except (ValueError, TypeError):
            continue

        _collect_icon_paths(payload, icon_paths)

    icon_results = await _fetch_bounded(sorted(icon_paths)[:60])
    return {
        "manifests": sum(not isinstance(item, Exception) for item in results),
        "icons": sum(not isinstance(item, Exception) for item in icon_results),
    }


__all__ = ["fetch_oss_resource", "prewarm_oss_market"]
