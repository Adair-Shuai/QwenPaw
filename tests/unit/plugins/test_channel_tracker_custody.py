# -*- coding: utf-8 -*-
"""A tracker must retain its generation until terminal callbacks finish."""

import asyncio
import json

from qwenpaw.app.channels.base import BaseChannel
from qwenpaw.plugins.testing import PluginTestHost

from .test_sdk_channel_routing_contract import CHANNEL, incoming, setup


async def test_unload_keeps_tracker_generation_live_through_terminal_delivery(
    tmp_path,
    monkeypatch,
):
    stream_finished = asyncio.Event()
    interrupted = asyncio.Event()
    release = asyncio.Event()
    original = getattr(BaseChannel, "_stream_with_tracker")

    async def hold_after_model(channel, payload):
        stream = original(channel, payload)
        try:
            async for event in stream:
                yield event
        finally:
            await stream.aclose()
            stream_finished.set()
            cancelled = False
            while not release.is_set():
                try:
                    await release.wait()
                except asyncio.CancelledError:
                    cancelled = True
                    interrupted.set()
            if cancelled:
                raise asyncio.CancelledError

    monkeypatch.setattr(BaseChannel, "_stream_with_tracker", hold_after_model)
    root = tmp_path / "host"
    async with PluginTestHost(root) as host:
        await setup(host, tmp_path)
        await host.receive_channel(CHANNEL, incoming("complete", "custody"))
        await asyncio.wait_for(stream_finished.wait(), 5)
        unload = asyncio.create_task(
            host.unload("extension-contract", interrupt_tasks=True),
        )
        try:
            await asyncio.wait_for(interrupted.wait(), 5)
            snapshot = host.resource_snapshot("extension-contract")
            assert snapshot["state"] == "active"
            assert snapshot["active_calls"] > 0
            assert not unload.done()
        finally:
            release.set()
            report = await asyncio.wait_for(unload, 5)
        assert report.clean
        assert report.quiescent
        events = json.loads(
            (root / "plugin-data/extension-contract/events.json").read_text(
                encoding="utf-8",
            ),
        )
        assert [(event["phase"], event["status"]) for event in events] == [
            ("start", "running"),
            ("end", "cancelled"),
        ]
        host.assert_quiescent("extension-contract")
