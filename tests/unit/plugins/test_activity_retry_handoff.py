# -*- coding: utf-8 -*-
"""Deterministic lifecycle handoff tests for late cleanup waiters."""

import asyncio

import pytest

from qwenpaw.plugins.activity import PluginActivity, PluginBusyError


@pytest.mark.usefixtures("short_interrupt_timeout")
async def test_mutation_wakes_cleanup_registered_after_interruption_starts():
    activity = PluginActivity("late-cleanup")
    started = asyncio.Event()
    cancelled = asyncio.Event()
    publish = asyncio.Event()

    async def request():
        with activity.invocation():
            started.set()
            try:
                await asyncio.Future()
            except asyncio.CancelledError:
                cancelled.set()
                await publish.wait()
                await activity.retry_cleanup()

    async def publish_after_cancellation():
        await cancelled.wait()
        await asyncio.sleep(0)
        publish.set()

    task = asyncio.create_task(request())
    publisher = asyncio.create_task(publish_after_cancellation())
    try:
        await started.wait()
        async with activity.mutation(interrupt_tasks=True):
            assert task.done()
        await publisher
    finally:
        publish.set()
        task.cancel()
        publisher.cancel()
        await asyncio.gather(task, publisher, return_exceptions=True)


@pytest.mark.usefixtures("short_interrupt_timeout")
async def test_one_mutation_retries_a_refusing_cleanup_only_once():
    activity = PluginActivity("refusing-cleanup")
    ready = asyncio.Event()
    attempts = []

    async def request():
        with activity.invocation():
            ready.set()
            for attempt in range(2):
                await activity.retry_cleanup()
                attempts.append(attempt)

    task = asyncio.create_task(request())
    try:
        await ready.wait()
        with pytest.raises(PluginBusyError):
            async with activity.mutation(interrupt_tasks=True):
                pytest.fail("A refusing cleanup must keep replacement blocked")
        assert attempts == [0]
        assert not task.done()
        with pytest.raises(PluginBusyError):
            with activity.invocation():
                pytest.fail("A timed-out cleanup must not admit new work")
        async with activity.mutation(interrupt_tasks=True):
            assert task.done()
        assert attempts == [0, 1]
    finally:
        task.cancel()
        await asyncio.gather(task, return_exceptions=True)


@pytest.mark.usefixtures("short_interrupt_timeout")
async def test_mutation_releases_invocation_before_host_task_finishes():
    activity = PluginActivity("host-continuation")
    entered = asyncio.Event()
    host_finish = asyncio.Event()
    exited = asyncio.Event()

    async def request():
        with activity.invocation():
            entered.set()
            try:
                await asyncio.Future()
            except asyncio.CancelledError:
                pass
        exited.set()
        await host_finish.wait()

    task = asyncio.create_task(request())
    try:
        await entered.wait()
        async with activity.mutation(interrupt_tasks=True):
            assert exited.is_set()
            assert not task.done()
            assert not activity.tasks
        assert not activity.blocked
    finally:
        host_finish.set()
        task.cancel()
        await asyncio.gather(task, return_exceptions=True)
