# -*- coding: utf-8 -*-
"""TaskTracker releases stream custody before host completion callbacks."""

import asyncio

from qwenpaw.app.task_tracker import TaskTracker
from qwenpaw.plugins.activity import PluginActivity


async def test_tracker_closes_suspended_source_before_host_completion():
    tracker = TaskTracker()
    activity = PluginActivity("broadcast-custody")
    entered = asyncio.Event()
    broadcast = asyncio.Event()
    yielded = asyncio.Event()
    closed = asyncio.Event()
    finishing = asyncio.Event()
    finish = asyncio.Event()

    async def source():
        with activity.invocation():
            entered.set()
            try:
                await broadcast.wait()
                yielded.set()
                yield "data: owned\n\n"
            finally:
                closed.set()

    async def host_finished(_key, _time):
        finishing.set()
        await finish.wait()

    stream = source()
    await tracker.attach_or_start(
        "run",
        None,
        lambda _payload: stream,
        on_finished=host_finished,
    )
    producer = (await tracker.snapshot_active_tasks())["run"]
    held = False
    try:
        await entered.wait()
        # Keep the source suspended at yield while the producer waits to
        # broadcast. Cancellation must close it before host persistence.
        await tracker.lock.acquire()
        held = True
        broadcast.set()
        await yielded.wait()
        await asyncio.sleep(0)
        producer.cancel()
        await finishing.wait()
        assert closed.is_set()
        assert not activity.tasks
        assert not producer.done()
        async with activity.mutation(interrupt_tasks=True):
            assert not activity.tasks
        assert not activity.blocked
    finally:
        if held:
            tracker.lock.release()
        finish.set()
        await asyncio.gather(producer, return_exceptions=True)
        await stream.aclose()


async def test_tracker_accepts_async_iterator_without_aclose():
    class Source:
        def __init__(self):
            self.messages = iter(("data: first\n\n", "data: second\n\n"))

        def __aiter__(self):
            return self

        async def __anext__(self):
            try:
                return next(self.messages)
            except StopIteration as exc:
                raise StopAsyncIteration from exc

    tracker = TaskTracker()
    completions = []

    async def host_finished(key, _time):
        completions.append(key)

    queue, started = await tracker.attach_or_start(
        "plain",
        None,
        lambda _payload: Source(),
        on_finished=host_finished,
    )
    assert started
    events = [
        event async for event in tracker.stream_from_queue(queue, "plain")
    ]
    assert events == ["data: first\n\n", "data: second\n\n"]
    assert completions == ["plain"]
    assert await tracker.get_status("plain") == "idle"
