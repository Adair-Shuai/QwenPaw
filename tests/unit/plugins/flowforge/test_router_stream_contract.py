# -*- coding: utf-8 -*-
"""Real FlowForge runs through the mounted HTTP and WebSocket router."""

import asyncio
import importlib
import json
import time
from contextlib import suppress
from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient


class _Socket:
    """ASGI transport only; FastAPI and Starlette handle the actual socket."""

    def __init__(self, app):
        self.app = app
        self.incoming = asyncio.Queue()
        self.outgoing = asyncio.Queue()
        self.task = None

    async def open(self):
        scope = {
            "type": "websocket",
            "asgi": {"version": "3.0"},
            "http_version": "1.1",
            "scheme": "ws",
            "path": "/ws",
            "raw_path": b"/ws",
            "root_path": "",
            "query_string": b"",
            "headers": [],
            "client": ("testclient", 123),
            "server": ("testserver", 80),
            "subprotocols": [],
        }
        await self.incoming.put({"type": "websocket.connect"})
        self.task = asyncio.create_task(
            self.app(scope, self.incoming.get, self.outgoing.put),
        )
        assert (await self.frame())["type"] == "websocket.accept"
        return self

    async def send(self, payload):
        await self.incoming.put(
            {
                "type": "websocket.receive",
                "text": json.dumps(payload),
            },
        )

    async def frame(self):
        pending = asyncio.create_task(self.outgoing.get())
        try:
            done, _ = await asyncio.wait(
                (pending, self.task),
                timeout=3,
                return_when=asyncio.FIRST_COMPLETED,
            )
            if pending in done:
                return pending.result()
            if self.task in done:
                self.task.result()
                raise AssertionError("Socket ended before the expected frame")
            raise AssertionError("Socket did not deliver a frame within 3s")
        finally:
            if not pending.done():
                pending.cancel()
                with suppress(asyncio.CancelledError):
                    await pending

    async def receive(self):
        frame = await self.frame()
        assert frame["type"] == "websocket.send", frame
        return json.loads(frame["text"])

    async def until(self, kind):
        messages = []
        for _ in range(100):
            message = await self.receive()
            messages.append(message)
            if message.get("type") == kind:
                return messages
        raise AssertionError(f"No {kind} frame in 100 messages")

    async def close(self):
        await self.incoming.put({"type": "websocket.disconnect", "code": 1000})
        await asyncio.wait_for(self.task, timeout=3)


def _wait(handle):
    deadline = time.monotonic() + 5
    while not handle.is_done and time.monotonic() < deadline:
        time.sleep(0.01)
    assert handle.is_done, handle.to_dict()
    return handle


@pytest.fixture(
    name="environment",
    params=["plugins.bundle", "qwenpaw.plugins_bundle"],
)
def load_environment(request, tmp_path):
    prefix = request.param + ".flowforge"
    router = importlib.import_module(prefix + ".router")
    service_module = importlib.import_module(prefix + ".service")
    progress = importlib.import_module(prefix + ".engine.progress")
    services = []

    def create(name):
        service = service_module.WorkflowService(flows_dir=tmp_path / name)
        services.append(service)
        app = FastAPI()
        app.include_router(router.build_router(service))
        return service, app

    yield SimpleNamespace(create=create, progress=progress)
    for service in services:
        for record in service.list_runs():
            handle = service.get_run(record["run_id"])
            if handle is not None and not handle.is_done:
                service.cancel_run(handle.run_id)
                _wait(handle)
        service.__del__()


def _run(service, *, wait=False):
    flow = {
        "id": "stream-contract",
        "nodes": {
            "result": {
                "class_type": "WaitNode" if wait else "OutputNode",
                "inputs": {"seconds": 30}
                if wait
                else {"value": "actual result"},
            },
        },
        "outputs": ["result"],
    }
    service.save_flow(flow["id"], flow)
    return service.start_run(flow["id"], {})


def _observe_handlers(monkeypatch, handle):
    added, removed = [], []
    add = handle.progress.add_handler
    remove = handle.progress.remove_handler

    def add_handler(handler):
        added.append(handler)
        add(handler)

    def remove_handler(handler):
        removed.append(handler)
        remove(handler)

    monkeypatch.setattr(handle.progress, "add_handler", add_handler)
    monkeypatch.setattr(handle.progress, "remove_handler", remove_handler)
    return added, removed


@pytest.mark.asyncio
async def test_socket_live_handle_replays_history_and_finishes(environment):
    service, app = environment.create("completed")
    handle = _wait(_run(service))
    expected = [event.to_dict() for event in handle.progress.history()]
    socket = await _Socket(app).open()
    try:
        await socket.send({"type": "subscribe", "run_id": handle.run_id})
        messages = await socket.until("run_finished")
        assert messages[:-1] == expected
        assert messages[-1] == {
            "type": "run_finished",
            "run_id": handle.run_id,
            "status": "completed",
        }
    finally:
        await socket.close()


@pytest.mark.asyncio
async def test_socket_forwards_thread_progress_and_detaches(
    environment,
    monkeypatch,
):
    service, app = environment.create("thread")
    handle = _run(service, wait=True)
    added, removed = _observe_handlers(monkeypatch, handle)
    socket = await _Socket(app).open()
    try:
        await socket.send({"type": "subscribe", "run_id": handle.run_id})
        await socket.send({"type": "ping"})
        await socket.until("pong")
        event = environment.progress.ProgressEvent(
            type="thread_marker",
            prompt_id=handle.run_id,
            data={"zero": 0, "text": "工作流"},
        )
        await asyncio.to_thread(handle.progress.emit, event)
        messages = await socket.until("thread_marker")
        assert messages[-1] == event.to_dict()
    finally:
        await socket.close()
    assert len(added) == len(removed) == 1
    assert added[0] is removed[0]


@pytest.mark.asyncio
async def test_socket_resubscription_releases_each_handler(
    environment,
    monkeypatch,
):
    service, app = environment.create("switch")
    first = _run(service, wait=True)
    second = _run(service, wait=True)
    first_added, first_removed = _observe_handlers(monkeypatch, first)
    second_added, second_removed = _observe_handlers(monkeypatch, second)
    socket = await _Socket(app).open()
    try:
        for handle in (first, second):
            await socket.send({"type": "subscribe", "run_id": handle.run_id})
            await socket.send({"type": "ping"})
            await socket.until("pong")
        assert first_added == first_removed
        first.progress.emit(
            environment.progress.ProgressEvent(
                type="stale_marker",
                prompt_id=first.run_id,
            ),
        )
        second.progress.emit(
            environment.progress.ProgressEvent(
                type="current_marker",
                prompt_id=second.run_id,
            ),
        )
        messages = await socket.until("current_marker")
        assert not any(m["type"] == "stale_marker" for m in messages)
    finally:
        await socket.close()
    assert len(first_added) == len(first_removed) == 1
    assert len(second_added) == len(second_removed) == 1
    assert first_added[0] is first_removed[0]
    assert second_added[0] is second_removed[0]


@pytest.mark.asyncio
async def test_socket_missing_run_keeps_ping_available(environment):
    _, app = environment.create("missing")
    socket = await _Socket(app).open()
    try:
        await socket.send({"type": "subscribe", "run_id": "not-found"})
        assert await socket.receive() == {
            "type": "error",
            "error": "run 'not-found' not found",
        }
        await socket.send({"type": "ping"})
        assert await socket.receive() == {"type": "pong"}
    finally:
        await socket.close()


@pytest.mark.asyncio
async def test_socket_persisted_replay_retains_all_events(environment):
    service, _ = environment.create("persisted")
    handle = _wait(_run(service))
    restarted, app = environment.create("persisted")
    record = restarted.get_run_record(handle.run_id)
    assert restarted.get_run(handle.run_id) is None
    socket = await _Socket(app).open()
    try:
        await socket.send({"type": "subscribe", "run_id": handle.run_id})
        messages = await socket.until("run_finished")
        assert messages[:-1] == record["events"]
        assert messages[-1]["status"] == record["status"] == "completed"
    finally:
        await socket.close()


@pytest.mark.asyncio
async def test_socket_history_boundary_delivers_each_event_once(
    environment,
    monkeypatch,
):
    service, app = environment.create("history-boundary")
    handle = _wait(_run(service))
    history = handle.progress.history
    marker = environment.progress.ProgressEvent(
        type="boundary_marker",
        prompt_id=handle.run_id,
    )
    emitted = False

    def history_at_boundary():
        nonlocal emitted
        if not emitted:
            emitted = True
            # Emit through the real registry after handler attachment but
            # before the public history snapshot. Both paths see the event.
            handle.progress.emit(marker)
        return history()

    monkeypatch.setattr(handle.progress, "history", history_at_boundary)
    socket = await _Socket(app).open()
    try:
        await socket.send({"type": "subscribe", "run_id": handle.run_id})
        messages = await socket.until("run_finished")
        assert messages[:-1] == [event.to_dict() for event in history()]
        assert sum(m["type"] == "boundary_marker" for m in messages) == 1
    finally:
        await socket.close()


@pytest.mark.asyncio
async def test_socket_cancel_drains_events_before_terminal(environment):
    service, app = environment.create("cancel")
    handle = _run(service, wait=True)
    socket = await _Socket(app).open()
    try:
        await socket.send({"type": "subscribe", "run_id": handle.run_id})
        await socket.send({"type": "ping"})
        initial = await socket.until("pong")
        assert service.cancel_run(handle.run_id)
        await asyncio.to_thread(_wait, handle)
        final = await socket.until("run_finished")
        events = [m for m in initial if m["type"] != "pong"] + final[:-1]
        assert events == [
            event.to_dict() for event in handle.progress.history()
        ]
        assert final[-1] == {
            "type": "run_finished",
            "run_id": handle.run_id,
            "status": "cancelled",
        }
    finally:
        await socket.close()


def test_router_sse_and_missing_run_http_contract(environment):
    service, app = environment.create("http")
    handle = _wait(_run(service))
    with TestClient(app) as client:
        for suffix in ("", "/events"):
            response = client.get("/runs/not-found" + suffix)
            assert response.status_code == 404
            assert response.json() == {"detail": "run 'not-found' not found"}
        response = client.get(f"/runs/{handle.run_id}/events")
        assert response.status_code == 200
        assert response.headers["content-type"].startswith("text/event-stream")
        actual = [
            json.loads(frame.removeprefix("data: "))
            for frame in response.text.strip().split("\n\n")
        ]
        assert actual == [
            event.to_dict() for event in handle.progress.history()
        ]
