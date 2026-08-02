# -*- coding: utf-8 -*-
# pylint: disable=protected-access
"""Tests for the persistent official-market cache."""

from __future__ import annotations

import asyncio
import json

from qwenpaw.plugins import oss_cache


def test_fresh_market_cache_avoids_network(monkeypatch, tmp_path) -> None:
    monkeypatch.setattr(oss_cache, "_CACHE_ROOT", tmp_path)
    oss_cache._LOCKS.clear()  # pylint: disable=protected-access
    oss_cache._write_cached(  # pylint: disable=protected-access
        "skills/manifest.json",
        b'{"skills": []}',
        {"content_type": "application/json", "etag": "test"},
    )

    class _NoNetwork:
        def __init__(self, *args, **kwargs) -> None:
            raise AssertionError("fresh cache unexpectedly accessed network")

    monkeypatch.setattr(oss_cache.httpx, "AsyncClient", _NoNetwork)
    content, content_type, state = asyncio.run(
        oss_cache.fetch_oss_resource("skills/manifest.json"),
    )

    assert content == b'{"skills": []}'
    assert content_type == "application/json"
    assert state == "fresh"


def test_manifest_icon_collection_is_bounded_to_icon_fields() -> None:
    paths: set[str] = set()
    oss_cache._collect_icon_paths(  # pylint: disable=protected-access
        {
            "servers": [
                {"icon_url": "/mcp/icons/files.svg"},
                {"icon_path": "agents/icons/research.png"},
                {"instructions": "ignore/not-an-icon.png"},
            ],
        },
        paths,
    )

    assert paths == {
        "mcp/icons/files.svg",
        "agents/icons/research.png",
    }


def test_market_prewarm_limits_parallel_downloads(monkeypatch) -> None:
    active = 0
    maximum = 0

    async def _fake_fetch(path: str):
        nonlocal active, maximum
        active += 1
        maximum = max(maximum, active)
        await asyncio.sleep(0.005)
        active -= 1
        if path.endswith("manifest.json"):
            content = json.dumps(
                {
                    "items": [
                        {"icon_url": f"icons/{index}.png"}
                        for index in range(20)
                    ],
                },
            ).encode()
            return content, "application/json", "network"
        return b"image", "image/png", "network"

    monkeypatch.setattr(oss_cache, "fetch_oss_resource", _fake_fetch)
    result = asyncio.run(oss_cache.prewarm_oss_market())

    assert result == {"manifests": 3, "icons": 20}
    assert (
        maximum <= oss_cache._PREWARM_CONCURRENCY
    )  # pylint: disable=protected-access
