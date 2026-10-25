# -*- coding: utf-8 -*-
"""Bound slow market sources without losing results or provider custody."""

import asyncio
from dataclasses import dataclass
from typing import Awaitable, Callable

import pytest

from qwenpaw.market import service
from qwenpaw.market.providers import base as provider_contract
from qwenpaw.market.registry import MarketProviderBusyError, MarketRegistry
from qwenpaw.market.schema import MarketResult


@dataclass
class Provider:
    key: str
    search_call: Callable[[], Awaitable[tuple[list[MarketResult], bool, int]]]
    label: str = "Test source"
    supports_browse: bool = True

    def available(self):
        return True, None

    async def search(self, _query, _limit, _page):
        return await self.search_call()

    def matches_url(self, _url):
        return False

    async def fetch_bundle(self, _url, _version):
        raise NotImplementedError("This test only searches")


@pytest.fixture(name="registry")
def _registry(monkeypatch):
    registry = MarketRegistry()
    monkeypatch.setattr(service, "market_registry", registry)
    monkeypatch.setattr(provider_contract, "MARKET_SEARCH_TIMEOUT_S", 0.01)
    return registry


async def test_search_deadline_keeps_fast_results_and_reports_slow_source(
    registry,
):
    cancelled = asyncio.Event()
    item = MarketResult(
        source="fast",
        slug="ready",
        name="Ready",
        description=None,
        source_url="https://example.invalid/ready",
        version=None,
        author=None,
        icon_url=None,
    )

    async def fast():
        return [item], True, 3

    async def slow():
        try:
            await asyncio.Event().wait()
        finally:
            cancelled.set()

    registry.register("fast-owner", Provider("fast", fast))
    registry.register("slow-owner", Provider("slow", slow))
    task = asyncio.create_task(
        service.search_market("", {"fast": 1, "slow": 1}),
    )
    try:
        await asyncio.wait_for(cancelled.wait(), 2)
        results, errors, pages = await asyncio.wait_for(task, 2)
    finally:
        task.cancel()
        await asyncio.gather(task, return_exceptions=True)
    assert results == [item]
    assert pages == {"fast": (True, 3)}
    assert len(errors) == 1
    assert errors[0].provider == "slow"
    assert "timed out" in errors[0].message.lower()
    registry.unregister_owner("slow-owner")


async def test_search_deadline_retains_owner_until_cancelled_source_cleans_up(
    registry,
):
    cleaning = asyncio.Event()
    release = asyncio.Event()

    async def slow():
        try:
            await asyncio.Event().wait()
        finally:
            cleaning.set()
            await release.wait()

    registry.register("slow-owner", Provider("slow", slow))
    task = asyncio.create_task(service.search_market("", {"slow": 1}))
    try:
        await asyncio.wait_for(cleaning.wait(), 2)
        assert not task.done()
        with pytest.raises(MarketProviderBusyError):
            registry.begin_unload("slow-owner")
    finally:
        release.set()
        if not cleaning.is_set():
            task.cancel()
        await asyncio.gather(task, return_exceptions=True)
    results, errors, pages = task.result()
    assert results == []
    assert pages == {}
    assert [error.provider for error in errors] == ["slow"]
    registry.unregister_owner("slow-owner")


async def test_search_external_cancellation_propagates_and_releases_owner(
    registry,
    monkeypatch,
):
    # Keep the provider deadline separate from caller cancellation here.
    monkeypatch.setattr(provider_contract, "MARKET_SEARCH_TIMEOUT_S", 60.0)
    entered = asyncio.Event()
    stopped = asyncio.Event()

    async def slow():
        try:
            entered.set()
            await asyncio.Event().wait()
        finally:
            stopped.set()

    registry.register("slow-owner", Provider("slow", slow))
    task = asyncio.create_task(service.search_market("", {"slow": 1}))
    try:
        await asyncio.wait_for(entered.wait(), 2)
        task.cancel()
        with pytest.raises(asyncio.CancelledError):
            await task
    finally:
        task.cancel()
        await asyncio.gather(task, return_exceptions=True)
    assert stopped.is_set()
    registry.unregister_owner("slow-owner")
