# -*- coding: utf-8 -*-
"""Directory lifecycle, notification, policy and shared-refresh regressions."""

# pylint: disable=protected-access

import asyncio
from unittest.mock import AsyncMock, Mock
from types import SimpleNamespace

import pytest
from mcp.types import ServerNotification, ToolListChangedNotification

from plugins.protocol.mcp.connection import MCPConnection
from plugins.protocol.mcp.mcp_stateful_client import HttpStatefulClient
from qwenpaw.plugins.testing import PluginTestHost
from qwenpaw.drivers.manager import DriverManager


def tool(name):
    return dict(name=name, description=name, inputSchema={})


def handler():
    context = SimpleNamespace(
        logger=Mock(),
        source_id="docs",
        workspace_id="test",
        subprocess_environment=AsyncMock(return_value={}),
    )
    source = SimpleNamespace(
        source_id="docs",
        endpoint={"transport": "stdio", "command": "test"},
    )
    owner = MCPConnection(
        context,
        source,
        SimpleNamespace(resolve=AsyncMock(return_value={})),
    )
    owner._client = SimpleNamespace(close=AsyncMock())
    return owner


REQUEST = SimpleNamespace(check_cancelled=lambda: None)


async def test_warm_catalog_returns_during_refresh_and_retains_after_failure():
    owner = handler()
    gate, started = asyncio.Event(), asyncio.Event()
    calls = 0

    async def discover():
        nonlocal calls
        calls += 1
        if calls == 1:
            return [tool("old")]
        started.set()
        await gate.wait()
        raise RuntimeError("offline")

    owner._client.list_tools = discover
    assert (await owner.discover(REQUEST))[0].name == "old"
    owner._refresh_after = 0
    assert (await asyncio.wait_for(owner.discover(REQUEST), 0.2))[
        0
    ].name == "old"
    await started.wait()
    for _ in range(5):
        assert (await owner.discover(REQUEST))[0].name == "old"
    assert calls == 2
    gate.set()
    with pytest.raises(RuntimeError, match="offline"):
        await owner._catalog_refresh
    assert (await owner.discover(REQUEST))[0].name == "old"
    await owner.close()


async def test_cold_discovery_is_shared_and_chat_cancellation_is_isolated():
    owner, gate, started = handler(), asyncio.Event(), asyncio.Event()
    calls = 0

    async def discover():
        nonlocal calls
        calls += 1
        started.set()
        await gate.wait()
        return [tool("ready")]

    owner._client.list_tools = discover
    first = asyncio.create_task(owner.discover(REQUEST))
    second = asyncio.create_task(owner.discover(REQUEST))
    await started.wait()
    first.cancel()
    with pytest.raises(asyncio.CancelledError):
        await first
    gate.set()
    assert (await second)[0].name == "ready"
    assert calls == 1
    await owner.close()


async def test_config_change_discards_refresh_and_revokes_execution(tmp_path):
    from tests.integration.test_mcp_plugin import local_peer, PLUGIN

    async with local_peer(tmp_path / "peer", "stdio") as endpoint:
        async with PluginTestHost(tmp_path / "host") as host:
            await host.load(PLUGIN)
            source = dict(
                name="docs",
                protocol="mcp",
                endpoint=endpoint,
                policy={"default_effect": "allow"},
            )
            await host.open_driver(source)
            assert all(
                tool["enabled"]
                for tool in await host.list_driver_capabilities("docs")
            )
            source["config"] = {"tools": ["echo"]}
            await host.open_driver(source)
            rows = await host.list_driver_capabilities("docs")
            assert {row["name"]: row["enabled"] for row in rows} == {
                "echo": True,
                "process_info": False,
            }
            from qwenpaw.plugins import SDKError

            with pytest.raises(SDKError):
                await host.call_driver("docs", "process_info", {})


async def test_background_prefetch_notification_and_shutdown(monkeypatch):
    class Client:
        calls = 0

        def __init__(self, **kwargs):
            # pylint: disable=unused-argument
            self.callback = None

        def set_tools_changed_callback(self, callback):
            self.callback = callback

        async def connect(self):
            return None

        async def list_tools(self):
            self.calls += 1
            return [tool(f"version_{self.calls}")]

        async def close(self, **kwargs):
            # pylint: disable=unused-argument
            return None

    monkeypatch.setattr(
        "plugins.protocol.mcp.connection.StdIOStatefulClient",
        Client,
    )
    owner = handler()
    await owner.open()
    try:
        # The prefetch runs independently of a chat's list_capabilities call.
        for _ in range(200):
            if owner._capability_cache is not None:
                break
            await asyncio.sleep(0.005)
        assert owner._capability_cache[0].name == "version_1"
        owner._client.callback()
        for _ in range(200):
            if owner._capability_cache[0].name == "version_2":
                break
            await asyncio.sleep(0.005)
        assert owner._capability_cache[0].name == "version_2"
        maintenance = owner._maintenance
    finally:
        await owner.close()
    assert maintenance.done()
    assert owner._capability_cache is None
    assert not await owner.discover(REQUEST)


async def test_stateful_notifications_reach_directory_owner():
    client = HttpStatefulClient(
        "docs",
        "streamable_http",
        "http://localhost",
        logger=Mock(),
    )
    calls = []
    client.set_tools_changed_callback(lambda: calls.append(True))
    await client._handle_server_message(
        ServerNotification(
            ToolListChangedNotification(
                method="notifications/tools/list_changed",
            ),
        ),
    )
    assert calls == [True]


@pytest.mark.parametrize("repeats", [False, True])
async def test_stateful_catalog_pagination_is_complete_and_bounded(repeats):
    client = HttpStatefulClient(
        "docs",
        "streamable_http",
        "http://localhost",
        logger=Mock(),
    )

    class Session:
        async def list_tools(self, cursor=None):
            return SimpleNamespace(
                tools=[tool("second" if cursor else "first")],
                nextCursor="next" if cursor is None or repeats else None,
            )

    client.session = Session()
    client.is_connected = True
    client._session_closed = asyncio.Event()
    if repeats:
        with pytest.raises(RuntimeError, match="pagination"):
            await client.list_tools()
        assert client._cached_tools is None
    else:
        assert [item["name"] for item in await client.list_tools()] == [
            "first",
            "second",
        ]


async def test_shutdown_cancels_inflight_directory_refresh():
    owner, started = handler(), asyncio.Event()

    async def discover():
        started.set()
        await asyncio.Event().wait()

    owner._client.list_tools = discover
    pending = asyncio.create_task(owner.discover(REQUEST))
    await started.wait()
    task = owner._catalog_refresh
    await owner.close()
    with pytest.raises(asyncio.CancelledError):
        await pending
    assert task.cancelled()


async def test_manager_bounds_background_discovery_across_servers(tmp_path):
    owners = [handler() for _ in range(10)]
    gate, filled = asyncio.Event(), asyncio.Event()
    active = maximum = 0

    async def discover():
        nonlocal active, maximum
        active += 1
        maximum = max(maximum, active)
        if active == 8:
            filled.set()
        try:
            await gate.wait()
            return [tool("ready")]
        finally:
            active -= 1

    for owner in owners:
        owner._client.list_tools = discover
    pending = asyncio.gather(*(owner.discover(REQUEST) for owner in owners))
    try:
        await asyncio.wait_for(filled.wait(), 1)
        assert maximum == 8
    finally:
        gate.set()
        await pending
        await asyncio.gather(*(owner.close() for owner in owners))
    assert maximum == 8


async def test_concurrent_discovery_preserves_partial_results(
    tmp_path,
):
    manager = DriverManager(tmp_path, None)
    entered, release = asyncio.Event(), asyncio.Event()
    count = 0

    class Handler:
        def __init__(self, name):
            self.name = name
            self.protocol = "mcp"

        async def list_capabilities(self, **kwargs):
            # pylint: disable=unused-argument
            nonlocal count
            count += 1
            if count == 2:
                entered.set()
            await release.wait()
            if self.name == "broken":
                raise RuntimeError("offline")
            return [SimpleNamespace(capability_id="ok", kind="tool")]

    manager._handlers = {name: Handler(name) for name in ("ready", "broken")}
    pending = asyncio.create_task(manager.list_capabilities(kind="tool"))
    try:
        await asyncio.wait_for(entered.wait(), 1)
    finally:
        release.set()
    assert [item.capability_id for item in await pending] == ["ok"]
