# -*- coding: utf-8 -*-
# pylint: disable=protected-access
"""Tests for the persistent official-market cache."""

from __future__ import annotations

import asyncio
import json

import httpx
import pytest

from qwenpaw.plugins import oss_cache


@pytest.fixture(autouse=True)
def isolate_refresh_tasks(monkeypatch):
    monkeypatch.setattr(oss_cache, "_REFRESH_TASKS", {})
    monkeypatch.setattr(oss_cache, "_RETRY_AFTER", {})


@pytest.mark.parametrize("offline", [False, True])
def test_market_manifest_revalidates_after_one_minute_and_keeps_offline_copy(
    monkeypatch,
    tmp_path,
    offline,
):
    monkeypatch.setattr(oss_cache, "_CACHE_ROOT", tmp_path)
    oss_cache._write_cached(
        "mcp/manifest.json",
        b'{"servers": ["old"]}',
        {"content_type": "application/json", "fetched_at": 0},
    )
    calls = []

    class Client:
        def __init__(self, **_kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            pass

        async def get(self, url, **_kwargs):
            calls.append(url)
            if offline:
                raise httpx.ConnectError("offline")
            return httpx.Response(
                200,
                content=b'{"servers": ["new"]}',
                headers={"content-type": "application/json"},
                request=httpx.Request("GET", url),
            )

    monkeypatch.setattr(oss_cache.httpx, "AsyncClient", Client)

    async def read_then_revalidate():
        initial, _, state = await oss_cache.fetch_oss_resource(
            "mcp/manifest.json",
        )
        assert json.loads(initial)["servers"] == ["old"]
        assert state == "stale"
        result = await oss_cache._REFRESH_TASKS["mcp/manifest.json"]
        return result

    result, _, state = asyncio.run(read_then_revalidate())
    assert len(calls) == 1
    assert state == ("stale" if offline else "network")
    assert json.loads(result)["servers"] == (["old"] if offline else ["new"])


def test_fresh_market_cache_avoids_network(monkeypatch, tmp_path) -> None:
    monkeypatch.setattr(oss_cache, "_CACHE_ROOT", tmp_path)
    oss_cache._write_cached(  # pylint: disable=protected-access
        "skills/manifest.json",
        b'{"skills": []}',
        {"content_type": "application/json", "etag": "test"},
    )

    class _NoNetwork:
        def __init__(self, *_args, **_kwargs) -> None:
            raise AssertionError("fresh cache unexpectedly accessed network")

    monkeypatch.setattr(oss_cache.httpx, "AsyncClient", _NoNetwork)
    content, content_type, state = asyncio.run(
        oss_cache.fetch_oss_resource("skills/manifest.json"),
    )

    assert content == b'{"skills": []}'
    assert content_type == "application/json"
    assert state == "fresh"


def test_stale_market_returns_before_network_and_refreshes_share_one_download(
    monkeypatch,
    tmp_path,
):
    monkeypatch.setattr(oss_cache, "_CACHE_ROOT", tmp_path)
    oss_cache._write_cached(
        "agents/manifest.json",
        b'{"agents":["old"]}',
        {"fetched_at": 0},
    )
    calls = []

    async def exercise():
        started = asyncio.Event()
        release = asyncio.Event()

        class Client:
            def __init__(self, **_kwargs):
                pass

            async def __aenter__(self):
                return self

            async def __aexit__(self, *_args):
                pass

            async def get(self, url, **_kwargs):
                calls.append(url)
                started.set()
                await release.wait()
                return httpx.Response(
                    200,
                    content=b'{"agents":["new"]}',
                    request=httpx.Request("GET", url),
                )

        monkeypatch.setattr(oss_cache.httpx, "AsyncClient", Client)
        # A network response cannot complete until this test releases it.
        initial = await asyncio.wait_for(
            oss_cache.fetch_oss_resource("agents/manifest.json"),
            1,
        )
        assert initial[2] == "stale"
        await asyncio.wait_for(started.wait(), 1)
        again = await asyncio.wait_for(
            oss_cache.fetch_oss_resource("agents/manifest.json"),
            1,
        )
        assert again[0] == initial[0]
        forced = asyncio.create_task(
            oss_cache.fetch_oss_resource("agents/manifest.json", force=True),
        )
        # An abandoned browser must not abort a download shared by refresh.
        abandoned = asyncio.create_task(
            oss_cache.fetch_oss_resource("agents/manifest.json", force=True),
        )
        await asyncio.sleep(0.02)
        abandoned.cancel()
        with pytest.raises(asyncio.CancelledError):
            await abandoned
        assert not forced.done()
        assert len(calls) == 1
        release.set()
        updated = await forced
        assert json.loads(updated[0])["agents"] == ["new"]
        assert (await oss_cache.fetch_oss_resource("agents/manifest.json"))[
            2
        ] == "fresh"
        assert len(calls) == 1

    asyncio.run(exercise())


def test_cold_market_requests_share_one_download(monkeypatch, tmp_path):
    monkeypatch.setattr(oss_cache, "_CACHE_ROOT", tmp_path)
    calls = []

    class Client:
        def __init__(self, **_kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            pass

        async def get(self, url, **_kwargs):
            calls.append(url)
            await asyncio.sleep(0.05)
            return httpx.Response(
                200,
                content=b'{"skills":[]}',
                request=httpx.Request("GET", url),
            )

    monkeypatch.setattr(oss_cache.httpx, "AsyncClient", Client)

    async def exercise():
        results = await asyncio.gather(
            *(
                oss_cache.fetch_oss_resource("skills/manifest.json")
                for _ in range(8)
            ),
        )
        assert all(result[0] == b'{"skills":[]}' for result in results)

    asyncio.run(exercise())
    assert len(calls) == 1


def test_conditional_refresh_and_offline_retry_preserve_cache(
    monkeypatch,
    tmp_path,
):
    monkeypatch.setattr(oss_cache, "_CACHE_ROOT", tmp_path)
    oss_cache._write_cached(
        "mcp/manifest.json",
        b'{"servers":[]}',
        {"fetched_at": 0, "etag": '"catalog-v1"'},
    )
    calls = []
    offline = True

    class Client:
        def __init__(self, **_kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            pass

        async def get(self, url, **kwargs):
            calls.append(kwargs["headers"])
            if offline:
                raise httpx.ConnectError("offline")
            return httpx.Response(304, request=httpx.Request("GET", url))

    monkeypatch.setattr(oss_cache.httpx, "AsyncClient", Client)

    async def exercise():
        nonlocal offline
        assert (
            await oss_cache.fetch_oss_resource("mcp/manifest.json", force=True)
        )[2] == "stale"
        assert (await oss_cache.fetch_oss_resource("mcp/manifest.json"))[
            2
        ] == "stale"
        await asyncio.sleep(0)
        assert len(calls) == 1
        offline = False
        result = await oss_cache.fetch_oss_resource(
            "mcp/manifest.json",
            force=True,
        )
        assert result[2] == "revalidated"
        assert result[0] == b'{"servers":[]}'
        assert (await oss_cache.fetch_oss_resource("mcp/manifest.json"))[
            2
        ] == "fresh"

    asyncio.run(exercise())
    assert calls == [{"If-None-Match": '"catalog-v1"'}] * 2


def test_invalid_upstream_manifest_does_not_replace_offline_catalog(
    monkeypatch,
    tmp_path,
):
    monkeypatch.setattr(oss_cache, "_CACHE_ROOT", tmp_path)
    oss_cache._write_cached(
        "skills/manifest.json",
        b'{"skills":[]}',
        {"fetched_at": 0},
    )

    class Client:
        def __init__(self, **_kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            pass

        async def get(self, url, **_kwargs):
            return httpx.Response(
                200,
                content=b"<html>gateway unavailable</html>",
                request=httpx.Request("GET", url),
            )

    monkeypatch.setattr(oss_cache.httpx, "AsyncClient", Client)
    result = asyncio.run(
        oss_cache.fetch_oss_resource("skills/manifest.json", force=True),
    )
    assert result[0] == b'{"skills":[]}'
    assert result[2] == "stale"
    assert (
        oss_cache._read_cached("skills/manifest.json")[0] == b'{"skills":[]}'
    )


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
