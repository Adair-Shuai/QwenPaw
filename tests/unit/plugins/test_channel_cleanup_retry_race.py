# -*- coding: utf-8 -*-
"""Late consumer close must not interrupt an admitted cleanup retry."""

import asyncio

import pytest

from qwenpaw.app import task_tracker
from qwenpaw.app.task_tracker import _broadcast_stream
from qwenpaw.plugins.custody import stop_task
from qwenpaw.plugins.resources import ResourceScope
from qwenpaw.plugins.testing import PluginTestHost

from .test_sdk_context_bridge import (
    test_runtime_owner_retries_failed_provider_scope_via_public_reload as _run,
)


@pytest.fixture(name="late_consumer_close")
def schedule_late_consumer_close(monkeypatch):
    """Hold real stream close until provider release has already succeeded."""
    refused = asyncio.Event()
    paused = asyncio.Event()
    released = asyncio.Event()
    closing = asyncio.Event()
    original_close = ResourceScope.close
    original_reload = PluginTestHost.reload
    held_scope = False

    async def close(scope):
        nonlocal held_scope
        retained = (
            scope.owner.plugin_id == "runtime-cleanup-provider"
            and "retained model cleanup" in scope.snapshot()["resources"]
        )
        try:
            await original_close(scope)
        except Exception:
            if retained:
                refused.set()
            raise
        if retained and not held_scope:
            held_scope = True
            released.set()
            await closing.wait()

    async def broadcast(tracker_ref, run, stream):
        async def events():
            try:
                async for event in stream:
                    yield event
                    if refused.is_set() and not paused.is_set():
                        paused.set()
                        await asyncio.Future()
            finally:
                if paused.is_set():
                    await released.wait()
                    closing.set()
                await stream.aclose()

        return await _broadcast_stream(tracker_ref, run, events())

    async def reload(host, plugin_id, *args, **kwargs):
        if plugin_id == "runtime-cleanup-caller":
            await asyncio.wait_for(paused.wait(), timeout=2)
        return await original_reload(host, plugin_id, *args, **kwargs)

    monkeypatch.setattr(ResourceScope, "close", close)
    monkeypatch.setattr(task_tracker, "_broadcast_stream", broadcast)
    monkeypatch.setattr(PluginTestHost, "reload", reload)
    try:
        yield
    finally:
        released.set()
        closing.set()


@pytest.mark.usefixtures("short_interrupt_timeout", "late_consumer_close")
async def test_channel_reload_does_not_recancel_draining_producer(
    tmp_path,
    monkeypatch,
):
    # Run ALL public app/channel retry assertions through the actual channel.
    # Only the handoff scheduling above is controlled; no lifecycle is mocked.
    await _run(tmp_path, "channel", monkeypatch)


@pytest.mark.usefixtures("short_stream_stop_timeout")
async def test_observing_draining_task_retains_stop_deadline():
    started = asyncio.Event()
    release = asyncio.Event()

    async def work():
        started.set()
        await release.wait()

    hosted = asyncio.create_task(work())
    try:
        await started.wait()
        with pytest.raises(TimeoutError, match="did not stop"):
            await stop_task(hosted, "draining", cancel=False)
        assert not hosted.done()
        assert hosted.cancelling() == 0
    finally:
        release.set()
        await hosted


async def test_observing_draining_task_propagates_parent_cancellation():
    started = asyncio.Event()
    release = asyncio.Event()

    async def work():
        started.set()
        await release.wait()

    hosted = asyncio.create_task(work())
    stopper = None
    try:
        await started.wait()
        stopper = asyncio.create_task(
            stop_task(hosted, "draining", cancel=False),
        )
        await asyncio.sleep(0)
        stopper.cancel()
        with pytest.raises(asyncio.CancelledError):
            await stopper
        assert not hosted.done()
        assert hosted.cancelling() == 0
    finally:
        release.set()
        await hosted
        if stopper is not None:
            await asyncio.gather(stopper, return_exceptions=True)
