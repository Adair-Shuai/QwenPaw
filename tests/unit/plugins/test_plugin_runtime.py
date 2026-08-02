# -*- coding: utf-8 -*-
"""Plugin callback execution regressions."""

import asyncio
import threading

import pytest

from qwenpaw.plugins.runtime import invoke_plugin_callback


@pytest.mark.asyncio
async def test_sync_plugin_callback_runs_off_event_loop_thread() -> None:
    event_loop_thread = threading.get_ident()

    callback_thread = await invoke_plugin_callback(threading.get_ident)

    assert callback_thread != event_loop_thread


@pytest.mark.asyncio
async def test_sync_plugin_callback_may_return_awaitable() -> None:
    async def _result() -> str:
        await asyncio.sleep(0)
        return "ready"

    assert await invoke_plugin_callback(_result) == "ready"
