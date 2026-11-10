# -*- coding: utf-8 -*-
# Exercise the real internal stop handler through its owning runtime.
# pylint: disable=protected-access
"""Real HTTP/SQLite/session/AgentScope lifecycle steering regressions."""

from __future__ import annotations

import asyncio
import json
from types import SimpleNamespace

import httpx
import pytest
from agentscope.agent import ReActConfig
from agentscope.formatter import OpenAIChatFormatter
from agentscope.message import Msg, TextBlock, ToolCallBlock, ToolResultState
from agentscope.model import ChatModelBase
from agentscope.model._model_response import ChatResponse
from agentscope.tool import FunctionTool, ToolChunk, Toolkit
from fastapi import FastAPI

from qwenpaw.agents.react_agent import QwenPawAgent
from qwenpaw.app.chats import api
from qwenpaw.app.chats.models import ChatSpec
from qwenpaw.app.chats.session import SafeJSONSession
from qwenpaw.app.steering import (
    CURRENT_STEERING,
    SteeringController,
    SteeringStore,
)
from qwenpaw.app.task_tracker import TaskTracker
from qwenpaw.config.config import AgentProfileConfig
from qwenpaw.hooks.session import SessionSaveHook
from qwenpaw.loop.gates import StopAction, StopHandlerResult
from qwenpaw.runtime.hooks import HookRegistry
from qwenpaw.runtime.runtime import Runtime
from qwenpaw.runtime.slash_command_registry import (
    CommandSpec,
    SlashCommandRegistry,
)
from qwenpaw.schemas import AgentRequest


class Model(ChatModelBase):
    """A deterministic model, with an observable in-flight request."""

    def __init__(self, tool=False):
        super().__init__(
            credential=None,
            model="synthetic",
            stream=False,
            parameters=ChatModelBase.Parameters(),
            context_size=32768,
        )
        self.started = asyncio.Event()
        self.release = asyncio.Event()
        self.inputs = []
        self.tool = tool
        self.formatter = OpenAIChatFormatter()

    async def count_tokens(self, *_args, **_kwargs):
        return 10

    async def __call__(self, *, messages, **_kwargs):
        self.inputs.append([msg.model_dump() for msg in messages])
        if len(self.inputs) == 1:
            self.started.set()
            await self.release.wait()
        content = (
            [ToolCallBlock(id="call1", name="slow_tool", input="{}")]
            if self.tool and len(self.inputs) == 1
            else [TextBlock(text=f"answer {len(self.inputs)}")]
        )
        return ChatResponse(content=content, is_last=True)


async def _workspace(tmp_path):
    tracker = TaskTracker()
    chat = ChatSpec(
        id="chat1",
        session_id="session1",
        user_id="user1",
        channel="console",
    )

    async def get_chat(chat_id):
        return chat if chat_id == chat.id else None

    registry = HookRegistry()
    registry.register(SessionSaveHook())
    ws = SimpleNamespace(
        agent_id="agent1",
        workspace_dir=tmp_path,
        task_tracker=tracker,
        session=SafeJSONSession(str(tmp_path / "sessions")),
        chat_manager=SimpleNamespace(get_chat=get_chat),
        plugins=SimpleNamespace(
            hook_registry=registry,
            modes=[],
            slash_command_registry=SlashCommandRegistry(),
        ),
    )
    app = FastAPI()
    app.include_router(api.router)
    app.dependency_overrides[api.get_workspace] = lambda: ws
    return ws, chat, app


async def _start(ws, chat, model, monkeypatch, *, toolkit=None, max_iters=6):
    agent = QwenPawAgent(
        name="Test",
        model=model,
        system_prompt="",
        toolkit=toolkit or Toolkit(tools=[]),
        react_config=ReActConfig(max_iters=max_iters),
        middlewares=[],
        agent_config=AgentProfileConfig(
            id="agent1",
            name="Test",
            language="en-US",
        ),
    )

    async def build(_builder, _ctx):
        return agent

    async def no_files(**_kwargs):
        return None

    monkeypatch.setattr("qwenpaw.runtime.runtime.AgentBuilder.build", build)
    monkeypatch.setattr(
        "qwenpaw.turn_files.lifecycle.begin_turn_files",
        no_files,
    )
    controller = SteeringController(ws, chat)
    request = AgentRequest(
        session_id=chat.session_id,
        user_id=chat.user_id,
        channel=chat.channel,
        input=[
            {
                "role": "user",
                "type": "message",
                "content": [{"type": "text", "text": "original"}],
            },
        ],
    )
    observed_controllers = []
    events = []

    async def stream(_payload):
        observed_controllers.append(CURRENT_STEERING.get())
        async for event in Runtime(workspace=ws, app_services=None).run(
            request,
        ):
            data = event.model_dump(mode="json")
            events.append(data)
            yield "data: " + json.dumps(data) + "\n\n"

    queue, new = await ws.task_tracker.attach_or_start(
        chat.id,
        None,
        stream,
        steering=controller,
    )
    assert new
    await asyncio.wait_for(model.started.wait(), 3)
    assert observed_controllers == [controller]
    return agent, controller, queue, events


async def _drain(ws, chat, queue):
    async def drain():
        async for _ in ws.task_tracker.stream_from_queue(queue, chat.id):
            pass

    await asyncio.wait_for(drain(), 4)


async def test_final_model_input_steers_same_run_without_interrupt(
    tmp_path,
    monkeypatch,
):
    ws, chat, app = await _workspace(tmp_path)
    model = Model()
    agent, controller, queue, events = await _start(
        ws,
        chat,
        model,
        monkeypatch,
    )
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        state = (await client.get("/chats/chat1/steering")).json()
        assert (
            state["supported"] and state["active_run_id"] == controller.run_id
        )
        payload = {
            "expected_run_id": controller.run_id,
            "request_id": "guide1",
            "text": "Check data first",
        }
        receipt = (
            await client.post("/chats/chat1/steer", json=payload)
        ).json()
        assert receipt["status"] == "pending"
        assert not model.release.is_set() and len(model.inputs) == 1
        assert (
            await client.post("/chats/chat1/steer", json=payload)
        ).json() == receipt
        model.release.set()
        await _drain(ws, chat, queue)
        assert len(model.inputs) == 2
        assert any(
            msg["role"] == "user"
            and any(
                block.get("text") == "Check data first"
                for block in msg["content"]
            )
            for msg in model.inputs[1]
        )
        receipt = (await client.get("/chats/chat1/steering/guide1")).json()
        assert receipt["status"] == "applied"
        assert (
            await client.post("/chats/chat1/steer", json=payload)
        ).json() == receipt
        state = (await client.get("/chats/chat1/steering")).json()
        assert state["active_run_id"] is None and not state["supported"]
    persisted = await ws.session.get_session_state_dict(
        chat.session_id,
        chat.user_id,
        chat.channel,
    )
    context = persisted["agent"]["state"]["context"]
    guides = [msg for msg in context if msg["id"] == "steering_guide1"]
    assert (
        len(guides) == 1
        and guides[0]["metadata"]["qwenpaw_steering"]["run_id"]
        == controller.run_id
    )
    response_ids = {
        evt["id"] for evt in events if evt.get("object") == "response"
    }
    assert len(response_ids) == 1
    assert not agent.state.get_unfinished_tool_calls(agent.name)


async def test_tool_completes_before_guidance_reaches_next_model(
    tmp_path,
    monkeypatch,
):
    ws, chat, _app = await _workspace(tmp_path)
    tool_started, tool_release = asyncio.Event(), asyncio.Event()
    completed = []

    async def slow_tool():
        """Synthetic slow tool."""
        tool_started.set()
        await tool_release.wait()
        completed.append(True)
        return ToolChunk(
            content=[TextBlock(text="tool completed")],
            state=ToolResultState.SUCCESS,
        )

    model = Model(tool=True)
    _agent, controller, queue, _events = await _start(
        ws,
        chat,
        model,
        monkeypatch,
        toolkit=Toolkit(tools=[FunctionTool(slow_tool)]),
    )
    model.release.set()
    await asyncio.wait_for(tool_started.wait(), 3)
    await controller.submit(
        controller.run_id,
        "guide-tool",
        "Use the tool result",
    )
    assert controller.store.get(chat.id, "guide-tool")["status"] == "pending"
    assert not completed and len(model.inputs) == 1
    tool_release.set()
    await _drain(ws, chat, queue)
    assert completed == [True] and len(model.inputs) == 2
    assert any(
        any(
            block.get("text") == "Use the tool result"
            for block in msg["content"]
        )
        for msg in model.inputs[1]
    )
    assert controller.store.get(chat.id, "guide-tool")["status"] == "applied"


async def test_cancel_returns_pending_and_stale_input_never_reaches_next_run(
    tmp_path,
    monkeypatch,
):
    ws, chat, app = await _workspace(tmp_path)
    model = Model()
    _agent, controller, queue, _events = await _start(
        ws,
        chat,
        model,
        monkeypatch,
    )
    await controller.submit(
        controller.run_id,
        "cancelled",
        "Keep this instruction",
    )
    await ws.task_tracker.request_stop(chat.id)
    await _drain(ws, chat, queue)
    assert controller.store.get(chat.id, "cancelled")["status"] == "returned"
    replacement = Model()
    _agent2, new_controller, queue2, _events2 = await _start(
        ws,
        chat,
        replacement,
        monkeypatch,
    )
    assert new_controller.run_id != controller.run_id
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        stale = await client.post(
            "/chats/chat1/steer",
            json={
                "expected_run_id": controller.run_id,
                "request_id": "stale",
                "text": "wrong run",
            },
        )
        assert stale.status_code == 409
    replacement.release.set()
    await _drain(ws, chat, queue2)
    assert len(replacement.inputs) == 1
    assert not any(
        any(
            block.get("text") == "Keep this instruction"
            for block in msg["content"]
        )
        for msg in replacement.inputs[0]
    )


async def test_receipts_survive_restart_and_recover_checkpoint_before_ack(
    tmp_path,
    monkeypatch,
):
    ws, chat, _app = await _workspace(tmp_path)
    model = Model()
    _agent, controller, queue, _events = await _start(
        ws,
        chat,
        model,
        monkeypatch,
    )
    await controller.submit(controller.run_id, "durable", "Persist once")
    assert await controller.consume()
    # Reproduce an interrupted acknowledgement after the real session write.
    conn = controller.store._connect()  # pylint: disable=protected-access
    with conn:
        conn.execute(
            "UPDATE steering SET status='pending' WHERE request_id='durable'",
        )
    conn.close()
    controller.store.accept(chat.id, "old-run", "orphan", "Never consumed")
    restarted, _chat, app = await _workspace(tmp_path)
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        receipts = (await client.get("/chats/chat1/steering")).json()[
            "receipts"
        ]
        assert {item["request_id"]: item["status"] for item in receipts} == {
            "durable": "applied",
            "orphan": "returned",
        }
    assert restarted.task_tracker is not ws.task_tracker
    model.release.set()
    await _drain(ws, chat, queue)


async def test_http_rejects_invalid_controls_conflicts_and_cross_chat_access(
    tmp_path,
    monkeypatch,
):
    ws, chat, app = await _workspace(tmp_path)
    model = Model()
    _agent, controller, queue, _events = await _start(
        ws,
        chat,
        model,
        monkeypatch,
    )
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        payload = {
            "expected_run_id": controller.run_id,
            "request_id": "id1",
            "text": "legitimate",
        }
        assert (
            await client.post("/chats/chat1/steer", json=payload)
        ).status_code == 200
        assert (
            await client.post(
                "/chats/chat1/steer",
                json={**payload, "text": "changed"},
            )
        ).status_code == 409
        assert (
            await client.post(
                "/chats/chat1/steer",
                json={**payload, "request_id": "id2", "model": "other"},
            )
        ).status_code == 422
        for invalid in (" ", "/stop", "x" * 32001):
            assert (
                await client.post(
                    "/chats/chat1/steer",
                    json={**payload, "text": invalid},
                )
            ).status_code == 422
        assert (await client.get("/chats/other/steering")).status_code == 404
        assert (
            await client.get("/chats/chat1/steering/missing")
        ).status_code == 404
    other_agent = SteeringStore(controller.store.path, "other-agent")
    assert other_agent.get(chat.id, "id1") is None
    assert controller.store.get("different-chat", "id1") is None
    model.release.set()
    await _drain(ws, chat, queue)


async def test_iteration_budget_returns_guidance_without_extending_execution(
    tmp_path,
    monkeypatch,
):
    ws, chat, _app = await _workspace(tmp_path)
    model = Model()
    _agent, controller, queue, _events = await _start(
        ws,
        chat,
        model,
        monkeypatch,
        max_iters=0,
    )
    await controller.submit(controller.run_id, "limited", "Do more")
    model.release.set()
    await _drain(ws, chat, queue)
    assert len(model.inputs) == 1
    assert controller.store.get(chat.id, "limited")["status"] == "returned"


@pytest.mark.parametrize("pending_gate", [False, True])
async def test_gate_termination_returns_guidance_without_bypassing_stop(
    tmp_path,
    monkeypatch,
    pending_gate,
):
    ws, chat, _app = await _workspace(tmp_path)
    model = Model(tool=pending_gate)
    started, release = asyncio.Event(), asyncio.Event()

    async def slow_tool():
        """Synthetic boundary tool."""
        started.set()
        await release.wait()
        return ToolChunk(
            content=[TextBlock(text="done")],
            state=ToolResultState.SUCCESS,
        )

    agent, controller, queue, _events = await _start(
        ws,
        chat,
        model,
        monkeypatch,
        toolkit=Toolkit(tools=[FunctionTool(slow_tool)]),
    )
    stop = StopHandlerResult(
        action=StopAction.TERMINATE,
        reason="Explicit safety boundary",
    )
    if pending_gate:
        model.release.set()
        await asyncio.wait_for(started.wait(), 3)
        agent._gate_pending_stop = stop  # pylint: disable=protected-access
    else:

        async def stop_handler(_final):
            return stop

        agent._run_stop_handlers = (
            stop_handler  # pylint: disable=protected-access
        )
    await controller.submit(controller.run_id, "stopped", "Continue anyway")
    release.set()
    model.release.set()
    await _drain(ws, chat, queue)
    assert len(model.inputs) == 1
    assert controller.store.get(chat.id, "stopped")["status"] == "returned"


async def test_final_persistence_is_running_but_no_longer_accepts_guidance(
    tmp_path,
    monkeypatch,
):
    ws, chat, app = await _workspace(tmp_path)
    save_started, save_release = asyncio.Event(), asyncio.Event()
    real_save = ws.session.save_session_state

    async def delayed_save(**kwargs):
        save_started.set()
        await save_release.wait()
        await real_save(**kwargs)

    ws.session.save_session_state = delayed_save
    model = Model()
    _agent, controller, queue, _events = await _start(
        ws,
        chat,
        model,
        monkeypatch,
    )
    model.release.set()
    await asyncio.wait_for(save_started.wait(), 3)
    assert await ws.task_tracker.get_status(chat.id) == "running"
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        state = (await client.get("/chats/chat1/steering")).json()
        assert (
            state["active_run_id"] == controller.run_id
            and not state["supported"]
        )
        response = await client.post(
            "/chats/chat1/steer",
            json={
                "expected_run_id": controller.run_id,
                "request_id": "late",
                "text": "Too late",
            },
        )
        assert response.status_code == 409
        assert (
            await client.get("/chats/chat1/steering/late")
        ).status_code == 404
    save_release.set()
    await _drain(ws, chat, queue)


async def test_unsupported_harness_does_not_claim_or_simulate_steering(
    tmp_path,
):
    ws, chat, app = await _workspace(tmp_path)
    started, release = asyncio.Event(), asyncio.Event()

    async def stream(_payload):
        started.set()
        await release.wait()
        yield "data: done\n\n"

    queue, _new = await ws.task_tracker.attach_or_start(chat.id, None, stream)
    await started.wait()
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        state = (await client.get("/chats/chat1/steering")).json()
        assert state["active_run_id"] and not state["supported"]
        response = await client.post(
            "/chats/chat1/steer",
            json={
                "expected_run_id": state["active_run_id"],
                "request_id": "unsupported",
                "text": "Must stay queued",
            },
        )
        assert response.status_code == 409
        assert await ws.task_tracker.get_status(chat.id) == "running"
    release.set()
    await _drain(ws, chat, queue)


async def test_recovery_guard_cannot_return_input_of_a_newer_execution(
    tmp_path,
    monkeypatch,
):
    ws, chat, app = await _workspace(tmp_path)
    read_started, read_release = asyncio.Event(), asyncio.Event()
    real_read = ws.session.get_session_state_dict
    first_read = True

    async def delayed_read(*args, **kwargs):
        nonlocal first_read
        if first_read:
            first_read = False
            read_started.set()
            await read_release.wait()
        return await real_read(*args, **kwargs)

    ws.session.get_session_state_dict = delayed_read
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        old_read = asyncio.create_task(client.get("/chats/chat1/steering"))
        await asyncio.wait_for(read_started.wait(), 3)
        model = Model()
        new_run = asyncio.create_task(_start(ws, chat, model, monkeypatch))
        # Recovery owns the lifecycle lock; a new run cannot yet accept input.
        await asyncio.sleep(0)
        assert not new_run.done() and not model.started.is_set()
        read_release.set()
        assert (await old_read).status_code == 200
        _agent, controller, queue, _events = await new_run
        await controller.submit(controller.run_id, "new-run", "Correct run")
        state = (await client.get("/chats/chat1/steering")).json()
        receipt = next(
            item
            for item in state["receipts"]
            if item["request_id"] == "new-run"
        )
        assert (
            receipt["status"] == "pending"
            and receipt["run_id"] == controller.run_id
        )
        model.release.set()
        await _drain(ws, chat, queue)


async def test_checkpoint_failure_returns_input_and_does_not_call_model_again(
    tmp_path,
    monkeypatch,
):
    ws, chat, _app = await _workspace(tmp_path)
    model = Model()
    _agent, controller, queue, _events = await _start(
        ws,
        chat,
        model,
        monkeypatch,
    )
    real_save = ws.session.save_session_state
    attempts = 0

    async def failed_first_save(**kwargs):
        nonlocal attempts
        attempts += 1
        if attempts == 1:
            raise OSError("synthetic full disk")
        await real_save(**kwargs)

    ws.session.save_session_state = failed_first_save
    await controller.submit(controller.run_id, "not-saved", "Do not lose me")
    model.release.set()
    await _drain(ws, chat, queue)
    assert len(model.inputs) == 1
    assert controller.store.get(chat.id, "not-saved")["status"] == "returned"
    state = await ws.session.get_session_state_dict(
        chat.session_id,
        chat.user_id,
        chat.channel,
    )
    assert not any(
        msg["id"] == "steering_not-saved"
        for msg in state["agent"]["state"]["context"]
    )


async def test_concurrent_duplicate_inputs_preserve_fifo_once(
    tmp_path,
    monkeypatch,
):
    ws, chat, _app = await _workspace(tmp_path)
    model = Model()
    _agent, controller, queue, _events = await _start(
        ws,
        chat,
        model,
        monkeypatch,
    )
    first = await asyncio.gather(
        *(
            controller.submit(controller.run_id, "first", "First supplement")
            for _ in range(5)
        ),
    )
    assert all(receipt == first[0] for receipt in first)
    await controller.submit(controller.run_id, "second", "Second supplement")
    model.release.set()
    await _drain(ws, chat, queue)
    users = [msg for msg in model.inputs[1] if msg["role"] == "user"]
    supplements = [
        msg for msg in users if msg["metadata"].get("qwenpaw_steering")
    ]
    assert [msg["id"] for msg in supplements] == [
        "steering_first",
        "steering_second",
    ]
    assert all(
        item["status"] == "applied" for item in controller.store.list(chat.id)
    )


async def test_nested_runtime_cannot_close_or_rebind_parent_steering(
    tmp_path,
    monkeypatch,
):
    ws, chat, _app = await _workspace(tmp_path)
    model = Model()
    agent, controller, queue, _events = await _start(
        ws,
        chat,
        model,
        monkeypatch,
    )

    async def command(_ctx, _args):
        return Msg(
            name="Test",
            role="assistant",
            content=[TextBlock(text="child command")],
        )

    ws.plugins.slash_command_registry.register(
        CommandSpec(name="nested-test", handler=command),
    )
    nested = AgentRequest(
        session_id="child-session",
        user_id="other-user",
        channel="console",
        input=[
            {
                "role": "user",
                "type": "message",
                "content": [{"type": "text", "text": "/nested-test"}],
            },
        ],
    )
    token = CURRENT_STEERING.set(controller)
    try:
        output = [
            event
            async for event in Runtime(workspace=ws, app_services=None).run(
                nested,
            )
        ]
    finally:
        CURRENT_STEERING.reset(token)
    assert output and controller.accepting and controller.agent is agent
    assert not controller.bind(
        SimpleNamespace(
            workspace=ws,
            request=nested,
            agent=SimpleNamespace(),
            agent_id="agent1",
            session_id=nested.session_id,
        ),
    )
    assert controller.agent is agent and controller.accepting
    await controller.submit(
        controller.run_id,
        "parent-only",
        "Still reach parent",
    )
    model.release.set()
    await _drain(ws, chat, queue)
    assert controller.store.get(chat.id, "parent-only")["status"] == "applied"
