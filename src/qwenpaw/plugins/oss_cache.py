# -*- coding: utf-8 -*-
"""Persistent stale-if-offline cache for official UGSci market resources."""

from __future__ import annotations

import asyncio
import hashlib
import json
import mimetypes
import time
from pathlib import Path
from typing import Any

import httpx

from ..constant import WORKING_DIR

OSS_BASE_URL = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com"
OSS_FRESH_SECONDS = 6 * 60 * 60
OSS_TIMEOUT_SECONDS = 10
_CACHE_ROOT = Path(WORKING_DIR) / "cache" / "oss-market"
_LOCKS: dict[str, asyncio.Lock] = {}
_PREWARM_CONCURRENCY = 6


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
    """Return content, content type and cache state for one OSS resource."""
    clean_path = resource_path.lstrip("/")
    if not clean_path or ".." in Path(clean_path).parts:
        raise ValueError("invalid OSS resource path")
    lock = _LOCKS.setdefault(clean_path, asyncio.Lock())
    async with lock:
        cached = await asyncio.to_thread(_read_cached, clean_path)
        if cached and not force:
            age = time.time() - float(cached[1].get("fetched_at", 0))
            if age < OSS_FRESH_SECONDS:
                content_type = cached[1].get("content_type") or (
                    mimetypes.guess_type(clean_path)[0]
                    or "application/octet-stream"
                )
                return cached[0], str(content_type), "fresh"

        request_headers: dict[str, str] = {}
        if cached:
            if cached[1].get("etag"):
                request_headers["If-None-Match"] = str(cached[1]["etag"])
            if cached[1].get("last_modified"):
                request_headers["If-Modified-Since"] = str(
                    cached[1]["last_modified"],
                )
        try:
            async with httpx.AsyncClient(
                timeout=OSS_TIMEOUT_SECONDS,
            ) as client:
                response = await client.get(
                    f"{OSS_BASE_URL}/{clean_path}",
                    headers=request_headers,
                )
            if response.status_code == 304 and cached:
                metadata = dict(cached[1])
                metadata["fetched_at"] = time.time()
                await asyncio.to_thread(
                    _write_cached,
                    clean_path,
                    cached[0],
                    metadata,
                )
                return (
                    cached[0],
                    str(
                        metadata.get(
                            "content_type",
                            "application/octet-stream",
                        ),
                    ),
                    "revalidated",
                )
            response.raise_for_status()
            content_type = response.headers.get("content-type", "").split(
                ";",
                1,
            )[0]
            content_type = content_type or mimetypes.guess_type(clean_path)[0]
            content_type = content_type or "application/octet-stream"
            metadata = {
                "content_type": content_type,
                "etag": response.headers.get("etag"),
                "last_modified": response.headers.get("last-modified"),
            }
            await asyncio.to_thread(
                _write_cached,
                clean_path,
                response.content,
                metadata,
            )
            return response.content, content_type, "network"
        except Exception:
            if cached:
                content_type = cached[1].get("content_type") or (
                    mimetypes.guess_type(clean_path)[0]
                    or "application/octet-stream"
                )
                return cached[0], str(content_type), "stale"
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
