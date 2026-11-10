# -*- coding: utf-8 -*-
# Exercise actual cancellation persistence on the owning runtime.
# pylint: disable=protected-access
"""History edit policies through real session hooks and atomic disk storage."""

from copy import deepcopy
from types import SimpleNamespace
import asyncio

import httpx
import pytest
from fastapi import FastAPI

from qwenpaw.app.chats.session import SafeJSONSession
from qwenpaw.app.routers import console
from qwenpaw.app.steering import SteeringController
from qwenpaw.app.task_tracker import TaskTracker
from qwenpaw.hooks.session.session_hook import SessionLoadHook, SessionSaveHook
from qwenpaw.hooks.session.signals import SESSION_SAVE_SUCCEEDED_KEY
from qwenpaw.runtime._state_utils import StateProxy
from qwenpaw.runtime.console_turn_state import (
    CLIENT_ID,
    EDIT_RESEND,
    STEERING,
    prepare_console_edit_resend,
)
from qwenpaw.runtime.runtime import Runtime

pytestmark = [pytest.mark.unit, pytest.mark.p1]


def _history():
    return {
        "state": {
            "context": [
                {"id": "before", "role": "user", "content": "before"},
                {"id": "before-answer", "role": "assistant", "content": "ok"},
                {
                    "id": "original",
                    "role": "user",
                    "content": "same question",
                    "metadata": {CLIENT_ID: "original-client"},
                },
                {"id": "answer", "role": "assistant", "content": "old answer"},
                {
                    "id": "later",
                    "role": "user",
                    "content": "same question",
                    "metadata": {CLIENT_ID: "later-client"},
                },
                {
                    "id": "later-answer",
                    "role": "assistant",
                    "content": "later answer",
                },
            ],
        },
        "scroll": {"summary": "old response summary"},
        "mode_state": {"mission": {"active": False}},
    }


def _request(keep=False, target=None):
    return SimpleNamespace(
        channel="console",
        user_id="user",
        input=[],
        request_context={
            EDIT_RESEND: {
                "keep_original": keep,
                "target": target or {"client_message_id": "original-client"},
            },
        },
    )


async def _setup(tmp_path, keep=False):
    session = SafeJSONSession(str(tmp_path / "sessions"))
    proxy = StateProxy()
    proxy.data = _history()
    await session.save_session_state("session", "user", "console", agent=proxy)
    ws = SimpleNamespace(
        session=session,
        agent_id="agent",
        workspace_dir=tmp_path,
        task_tracker=TaskTracker(),
    )
    ctx = SimpleNamespace(
        request=_request(keep),
        workspace=ws,
        session_id="session",
        agent_id="agent",
        session_state=None,
        mode_state={},
        extras={},
        agent=None,
        error=None,
    )
    return session, ctx


@pytest.mark.parametrize("keep", [False, True])
async def test_edit_resend_commits_selected_history_policy_and_survives_reopen(
    tmp_path,
    keep,
):
    session, ctx = await _setup(tmp_path, keep)
    original = await session.get_session_state_dict(
        "session",
        "user",
        "console",
    )
    await SessionLoadHook().run(ctx)
    expected_prefix = _history()["state"]["context"][: 2 if not keep else 6]
    assert ctx.session_state["state"]["context"] == expected_prefix
    assert ("scroll" in ctx.session_state) is keep
    assert (
        await session.get_session_state_dict("session", "user", "console")
        == original
    )
    replacement = {
        "id": "new",
        "role": "user",
        "content": "revised",
        "metadata": {CLIENT_ID: "new-client"},
    }
    ctx.request.input = [SimpleNamespace(metadata=replacement["metadata"])]
    proxy = StateProxy()
    proxy.data = deepcopy(ctx.session_state)
    proxy.data["state"]["context"] += [
        replacement,
        {
            "id": "new-answer",
            "role": "assistant",
            "content": "new answer",
        },
    ]
    ctx.agent = proxy
    await SessionSaveHook().run(ctx)
    reopened = SafeJSONSession(str(tmp_path / "sessions"))
    result = (
        await reopened.get_session_state_dict("session", "user", "console")
    )["agent"]
    assert result["state"]["context"][:-2] == expected_prefix
    assert (
        result["state"]["context"][-2]["metadata"]["qwenpaw_turn_state"][
            "status"
        ]
        == "completed"
    )
    assert result["state"]["context"][-1]["content"] == "new answer"
    assert ctx.extras[SESSION_SAVE_SUCCEEDED_KEY] is True
    assert result["mode_state"] == _history()["mode_state"]


@pytest.mark.parametrize(
    "error",
    [asyncio.CancelledError(), RuntimeError("model failed")],
)
async def test_edit_resend_failure_and_cancel_leave_original_disk_history(
    tmp_path,
    error,
):
    session, ctx = await _setup(tmp_path)
    original = await session.get_session_state_dict(
        "session",
        "user",
        "console",
    )
    await SessionLoadHook().run(ctx)
    proxy = StateProxy()
    proxy.data = ctx.session_state
    ctx.agent, ctx.error = proxy, error
    await Runtime(
        workspace=ctx.workspace,
        app_services=None,
    )._try_save_on_cancel(ctx)
    assert (
        await session.get_session_state_dict("session", "user", "console")
        == original
    )


async def test_edit_resend_write_failure_preserves_original(
    tmp_path,
    monkeypatch,
):
    session, ctx = await _setup(tmp_path)
    original = await session.get_session_state_dict(
        "session",
        "user",
        "console",
    )
    await SessionLoadHook().run(ctx)
    proxy = StateProxy()
    proxy.data = ctx.session_state
    ctx.agent = proxy

    async def fail_write(*_args, **_kwargs):
        raise OSError("disk full")

    monkeypatch.setattr(
        "qwenpaw.app.chats.session.write_json_atomic_async",
        fail_write,
    )
    with pytest.raises(OSError, match="disk full"):
        await SessionSaveHook().run(ctx)
    assert ctx.extras[SESSION_SAVE_SUCCEEDED_KEY] is False
    assert (
        await session.get_session_state_dict("session", "user", "console")
        == original
    )


@pytest.mark.parametrize(
    "target",
    [{"message_id": "original"}, {"client_message_id": "original-client"}],
)
def test_edit_resend_rewinds_selected_older_turn_by_durable_identity(target):
    data = _history()
    prepare_console_edit_resend(data, _request(target=target))
    assert [msg["id"] for msg in data["state"]["context"]] == [
        "before",
        "before-answer",
    ]
    assert "scroll" not in data


@pytest.mark.parametrize(
    "edit",
    [
        None,
        {},
        {"keep_original": "false"},
        {"keep_original": 0},
        {"keep_original": False},
        {"keep_original": False, "target": {"message_id": "missing"}},
        {"keep_original": False, "target": {"message_id": "answer"}},
        {"keep_original": False, "target": {"message_id": " "}},
        {"keep_original": False, "target": {"text": "same question"}},
        {
            "keep_original": False,
            "target": {
                "message_id": "original",
                "client_message_id": "later-client",
            },
        },
    ],
)
def test_edit_resend_rejects_invalid_or_unscoped_targets_without_mutation(
    edit,
):
    data = _history()
    original = deepcopy(data)
    request = _request()
    request.request_context[EDIT_RESEND] = edit
    with pytest.raises(ValueError):
        prepare_console_edit_resend(data, request)
    assert data == original


def test_edit_resend_rejects_steering_supplements_and_ambiguous_receipts():
    data = _history()
    data["state"]["context"][2]["metadata"][STEERING] = {
        "request_id": "r",
        "run_id": "run",
    }
    original = deepcopy(data)
    with pytest.raises(ValueError):
        prepare_console_edit_resend(data, _request())
    assert data == original
    data = _history()
    data["state"]["context"][4]["metadata"][CLIENT_ID] = "original-client"
    original = deepcopy(data)
    with pytest.raises(ValueError):
        prepare_console_edit_resend(data, _request())
    assert data == original


async def test_edit_resend_missing_session_and_other_user_cannot_rewind(
    tmp_path,
):
    session, ctx = await _setup(tmp_path)
    original = await session.get_session_state_dict(
        "session",
        "user",
        "console",
    )
    ctx.request.user_id = "other-user"
    with pytest.raises(ValueError):
        await SessionLoadHook().run(ctx)
    assert (
        await session.get_session_state_dict("session", "user", "console")
        == original
    )


async def test_edit_resend_cannot_checkpoint_a_replacement_through_steering(
    tmp_path,
):
    _session, ctx = await _setup(tmp_path)
    chat = SimpleNamespace(
        id="chat",
        session_id="session",
        user_id="user",
        channel="console",
    )
    controller = SteeringController(ctx.workspace, chat)
    assert controller.bind(ctx) is False
    assert controller.accepting is False


async def test_edit_resend_http_rejects_backend_without_history_replacement(
    tmp_path,
    monkeypatch,
):
    del tmp_path  # Preserve the callback or fixture contract.

    async def get_channel(_name):
        return SimpleNamespace()

    async def get_workspace(*_args, **_kwargs):
        return SimpleNamespace(
            config=SimpleNamespace(backend="codex"),
            channel_manager=SimpleNamespace(get_channel=get_channel),
        )

    monkeypatch.setattr(console, "get_agent_for_request", get_workspace)
    app = FastAPI()
    app.include_router(console.router)
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.post(
            "/console/chat",
            json={
                "session_id": "session",
                "user_id": "user",
                "channel": "console",
                "input": [
                    {
                        "role": "user",
                        "content": [{"type": "text", "text": "revised"}],
                    },
                ],
                "request_context": _request().request_context,
            },
        )
    assert response.status_code == 400
    assert "keep the original" in response.json()["detail"]
