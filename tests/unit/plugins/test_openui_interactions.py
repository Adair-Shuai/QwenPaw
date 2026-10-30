# -*- coding: utf-8 -*-
"""Real HTTP routes, durable SQLite and scoped Agent tool integration."""

from __future__ import annotations

import importlib.util
import asyncio
import json
import sqlite3
import sys
from pathlib import Path
from types import SimpleNamespace

import httpx
import pytest
from fastapi import FastAPI
from agentscope.message import ToolCallBlock
from agentscope.state import AgentState
from agentscope.tool import FunctionTool, Toolkit

from qwenpaw.app.chats.manager import ChatManager
from qwenpaw.app.chats.repo.json_repo import JsonChatRepository

PLUGIN_DIR = (
    Path(__file__).resolve().parents[3] / "plugins/bundle/qwenpaw-openui"
)


@pytest.fixture(name="module", scope="module")
def module_fixture():
    spec = importlib.util.spec_from_file_location(
        "openui_interaction_test_plugin",
        PLUGIN_DIR / "plugin.py",
        submodule_search_locations=[str(PLUGIN_DIR)],
    )
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture(name="environment")
async def environment_fixture(tmp_path, monkeypatch, module):
    from qwenpaw.app import agent_context

    workspaces = {}
    for agent in ("alpha", "beta"):
        chat_manager = ChatManager(
            repo=JsonChatRepository(tmp_path / f"{agent}.json"),
        )
        for session in ("session-1", "session-2"):
            await chat_manager.get_or_create_chat(
                session,
                "user",
                channel="console",
            )
        await chat_manager.get_or_create_chat(
            "child",
            "user",
            channel="console",
            source="subagent",
            parent_session_id="session-1",
            root_session_id="session-1",
        )
        await chat_manager.get_or_create_chat(
            "scheduled",
            "user",
            channel="console",
            source="cron",
        )
        workspaces[agent] = SimpleNamespace(
            agent_id=agent,
            chat_manager=chat_manager,
        )

    async def get_agent(agent_id):
        return workspaces.get(agent_id)

    monkeypatch.setattr(
        agent_context,
        "load_config",
        lambda: SimpleNamespace(
            agents=SimpleNamespace(
                active_agent="alpha",
                profiles={
                    name: SimpleNamespace(enabled=True) for name in workspaces
                },
            ),
        ),
    )
    service = module.InteractionService(
        module.InteractionStore(tmp_path / "requests.sqlite3"),
    )
    app = FastAPI()
    app.state.multi_agent_manager = SimpleNamespace(get_agent=get_agent)
    app.include_router(
        module.build_router(service),
        prefix="/api/openui/interactions",
    )
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://test/api/openui/interactions",
        follow_redirects=True,
        headers={"X-Agent-Id": "alpha"},
    ) as client:
        yield SimpleNamespace(
            client=client,
            service=service,
            workspaces=workspaces,
        )


def context(environment, **overrides):
    values = {
        "agent_id": "alpha",
        "session_id": "session-1",
        "root_session_id": "session-1",
        "workspace": environment.workspaces["alpha"],
        "request": SimpleNamespace(
            channel="console",
            user_id="user",
            request_context={
                "ui_capabilities": {
                    "openui": "v1",
                    "openui_interactions": "v1",
                },
            },
        ),
    }
    values.update(overrides)
    return SimpleNamespace(**values)


def form():
    return {
        "kind": "form",
        "title": "确认参数",
        "description": "核对后计算",
        "fields": [
            {
                "name": "pressure",
                "label": "压力",
                "type": "number",
                "required": True,
                "minimum": 0,
                "maximum": 10,
                "default": 0,
                "unit": "MPa",
            },
            {
                "name": "enabled",
                "label": "使用校正",
                "type": "boolean",
                "required": True,
                "default": False,
            },
            {
                "name": "method",
                "label": "方法",
                "type": "select",
                "required": True,
                "options": [
                    {"label": "甲", "value": "a"},
                    {"label": "乙", "value": "b"},
                ],
            },
        ],
        "preview": [{"label": "来源", "value": "已上传资料"}],
    }


async def invoke(module, service, ctx, definition=None):
    tool = module.build_tool(service)
    middleware = module.InteractionMiddleware(ctx)
    toolkit = Toolkit(tools=[FunctionTool(tool)])

    async def next_handler(tool_call):
        async for event in toolkit.call_tool(tool_call, AgentState()):
            yield event

    events = [
        event
        async for event in middleware.on_acting(
            None,
            {
                "tool_call": ToolCallBlock(
                    type="tool_call",
                    id="call-1",
                    name="request_user_input",
                    input=json.dumps(definition or form()),
                ),
            },
            next_handler,
        )
    ]
    return json.loads(events[0].content[0].text)


@pytest.mark.asyncio
async def test_tool_http_draft_restart_submit_and_delivery(
    environment,
    module,
):
    env = environment
    result = await invoke(module, env.service, context(env))
    assert result["ok"] and "End this turn" in result["instruction"]
    request = result["request"]
    assert request["values"] == {"pressure": 0, "enabled": False}
    assert (
        request["agent_id"] == "alpha" and request["session_id"] == "session-1"
    )
    listed = await env.client.get("", params={"session_id": "session-1"})
    assert listed.status_code == 200
    assert listed.json()["requests"] == [request]
    path = f"/{request['id']}"
    draft = await env.client.put(
        path + "/draft",
        json={
            "session_id": "session-1",
            "expected_revision": 1,
            "values": {"pressure": 0, "enabled": False},
        },
    )
    assert draft.status_code == 200
    assert draft.json()["revision"] == 2
    restarted = module.InteractionStore(env.service.store.path)
    assert restarted.get(request["id"], "alpha", "session-1") == draft.json()
    body = {
        "session_id": "session-1",
        "expected_revision": 2,
        "values": {"pressure": 0, "enabled": False, "method": "a"},
    }
    submit = await env.client.post(path + "/submit", json=body)
    assert submit.status_code == 200
    answer = submit.json()
    assert answer["request"]["answer"] == body["values"]
    assert answer["request"]["revision"] == 3
    assert answer["request"]["delivery_status"] == "pending"
    assert (
        '"value": 0' in answer["continuation"]
        and '"value": false' in answer["continuation"]
    )
    assert (
        "MPa" in answer["continuation"]
        and request["id"] in answer["continuation"]
    )
    retry = await env.client.post(path + "/submit", json=body)
    assert retry.json() == answer
    queued = await env.client.post(
        path + "/queued",
        json={"session_id": "session-1"},
    )
    assert queued.json()["delivery_status"] == "queued"
    assert queued.json()["revision"] == 3
    recovered = await env.client.get(path, params={"session_id": "session-1"})
    assert recovered.json()["continuation"] == answer["continuation"]
    changed = {**body, "values": {**body["values"], "method": "b"}}
    assert (
        await env.client.post(path + "/submit", json=changed)
    ).status_code == 409
    assert (
        await env.client.put(path + "/draft", json=body)
    ).status_code == 409
    assert (
        await env.client.post(
            path + "/cancel",
            json={
                "session_id": "session-1",
                "expected_revision": 3,
            },
        )
    ).status_code == 409


@pytest.mark.asyncio
async def test_http_owner_scope_and_persisted_session_validation(
    environment,
    module,
):
    env = environment
    request = (await invoke(module, env.service, context(env)))["request"]
    path = f"/{request['id']}"
    for headers, session in [
        ({"X-Agent-Id": "beta"}, "session-1"),
        ({}, "session-2"),
    ]:
        assert (
            await env.client.get(
                path,
                params={"session_id": session},
                headers=headers,
            )
        ).status_code == 404
        assert (
            await env.client.get(
                "",
                params={"session_id": session},
                headers=headers,
            )
        ).json() == {"requests": []}
        for operation in ("submit", "cancel", "queued"):
            body = {"session_id": session}
            if operation != "queued":
                body["expected_revision"] = 1
            if operation == "submit":
                body["values"] = {
                    "pressure": 0,
                    "enabled": False,
                    "method": "a",
                }
            assert (
                await env.client.post(
                    path + "/" + operation,
                    json=body,
                    headers=headers,
                )
            ).status_code == 404
    for session in ("missing", "child", "scheduled"):
        assert (
            await env.client.get("", params={"session_id": session})
        ).status_code == 404
        assert (
            await env.client.post("/demo", json={"session_id": session})
        ).status_code == 404
    assert (
        await env.client.get(
            "",
            params={"session_id": "session-1"},
            headers={"X-Agent-Id": "missing"},
        )
    ).status_code == 404


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "invalid",
    [
        {"pressure": -1, "enabled": False, "method": "a"},
        {"pressure": 11, "enabled": False, "method": "a"},
        {"pressure": True, "enabled": False, "method": "a"},
        {"pressure": "0", "enabled": False, "method": "a"},
        {"pressure": 0, "enabled": "false", "method": "a"},
        {"pressure": 0, "enabled": False, "method": "missing"},
        {"pressure": 0, "enabled": False, "unexpected": "a"},
        {"pressure": None, "enabled": False, "method": "a"},
    ],
)
async def test_http_rejects_invalid_answers_without_mutation(
    environment,
    module,
    invalid,
):
    env = environment
    request = (await invoke(module, env.service, context(env)))["request"]
    path = f"/{request['id']}"
    result = await env.client.post(
        path + "/submit",
        json={
            "session_id": "session-1",
            "expected_revision": 1,
            "values": invalid,
        },
    )
    assert result.status_code == 422
    assert (
        await env.client.get(path, params={"session_id": "session-1"})
    ).json() == request


@pytest.mark.asyncio
async def test_revision_conflict_cancel_and_pending_queue(environment, module):
    env = environment
    request = (await invoke(module, env.service, context(env)))["request"]
    path = f"/{request['id']}"
    assert (
        await env.client.post(
            path + "/queued",
            json={"session_id": "session-1"},
        )
    ).status_code == 409
    for method, suffix, body in [
        ("put", "/draft", {"values": {}}),
        (
            "post",
            "/submit",
            {"values": {"pressure": 0, "enabled": False, "method": "a"}},
        ),
        ("post", "/cancel", {}),
    ]:
        result = await getattr(env.client, method)(
            path + suffix,
            json={
                "session_id": "session-1",
                "expected_revision": 9,
                **body,
            },
        )
        assert result.status_code == 409
    body = {"session_id": "session-1", "expected_revision": 1}
    cancelled = await env.client.post(path + "/cancel", json=body)
    assert cancelled.json()["status"] == "cancelled"
    assert (
        await env.client.post(path + "/cancel", json=body)
    ).json() == cancelled.json()
    assert (
        await env.client.post(
            path + "/submit",
            json={
                **body,
                "values": {"pressure": 0, "enabled": False, "method": "a"},
            },
        )
    ).status_code == 409


@pytest.mark.asyncio
@pytest.mark.parametrize("actions", [("draft", "draft"), ("submit", "cancel")])
async def test_concurrent_http_writers_commit_one_revision_and_survive_restart(
    environment,
    module,
    actions,
):
    env = environment
    record = (await invoke(module, env.service, context(env)))["request"]
    path = f"/{record['id']}"

    async def write(action, pressure):
        body = {"session_id": "session-1", "expected_revision": 1}
        if action != "cancel":
            body["values"] = {
                "pressure": pressure,
                "enabled": False,
                "method": "a",
            }
        method = env.client.put if action == "draft" else env.client.post
        return await method(path + "/" + action, json=body)

    results = await asyncio.gather(write(actions[0], 1), write(actions[1], 2))
    assert sorted(item.status_code for item in results) == [200, 409]
    winner = next(item.json() for item in results if item.status_code == 200)
    winner = winner.get("request", winner)
    assert winner["revision"] == 2
    persisted = (
        await env.client.get(path, params={"session_id": "session-1"})
    ).json()
    assert persisted == winner
    reopened = module.InteractionStore(env.service.store.path)
    assert reopened.get(record["id"], "alpha", "session-1") == winner
    assert reopened.list("beta", "session-1") == []


@pytest.mark.asyncio
async def test_concurrent_identical_submissions_and_receipts_are_idempotent(
    environment,
    module,
):
    env = environment
    record = (await invoke(module, env.service, context(env)))["request"]
    path = f"/{record['id']}"
    body = {
        "session_id": "session-1",
        "expected_revision": 1,
        "values": {"pressure": 0, "enabled": False, "method": "a"},
    }
    first, second = await asyncio.gather(
        env.client.post(path + "/submit", json=body),
        env.client.post(path + "/submit", json=body),
    )
    assert first.status_code == second.status_code == 200
    assert first.json() == second.json()
    accepted = first.json()["request"]
    assert accepted["revision"] == 2
    assert accepted["answer"] == body["values"]
    a, b = await asyncio.gather(
        *(
            env.client.post(path + "/queued", json={"session_id": "session-1"})
            for _ in range(2)
        ),
    )
    assert a.status_code == b.status_code == 200
    assert a.json() == b.json()
    assert a.json()["delivery_status"] == "queued"
    assert a.json()["revision"] == 2
    assert a.json()["continuation"] == first.json()["continuation"]
    reopened = module.InteractionStore(env.service.store.path)
    assert reopened.list("alpha", "session-1") == [a.json()]


@pytest.mark.asyncio
async def test_sqlite_write_failure_preserves_draft_and_allows_http_retry(
    environment,
    module,
):
    env = environment
    record = (await invoke(module, env.service, context(env)))["request"]
    path = f"/{record['id']}"
    body = {
        "session_id": "session-1",
        "expected_revision": 1,
        "values": {"pressure": 3, "enabled": False, "method": "a"},
    }
    with env.service.store.connection(write=True) as connection:
        connection.execute(
            "CREATE TRIGGER reject_write BEFORE UPDATE ON interactions "
            "BEGIN SELECT RAISE(ABORT, 'simulated disk failure'); END",
        )
    with pytest.raises(sqlite3.IntegrityError, match="simulated disk failure"):
        await env.client.post(path + "/submit", json=body)
    assert (
        await env.client.get(path, params={"session_id": "session-1"})
    ).json() == record
    reopened = module.InteractionStore(env.service.store.path)
    assert reopened.get(record["id"], "alpha", "session-1") == record
    with reopened.connection(write=True) as connection:
        connection.execute("DROP TRIGGER reject_write")
    retried = await env.client.post(path + "/submit", json=body)
    assert retried.status_code == 200
    assert retried.json()["request"]["revision"] == 2
    assert retried.json()["request"]["answer"] == body["values"]


@pytest.mark.asyncio
async def test_demo_is_explicit_and_uses_the_same_real_lifecycle(environment):
    client = environment.client
    assert (
        await client.get("", params={"session_id": "session-1"})
    ).json() == {"requests": []}
    demo = await client.post("/demo", json={"session_id": "session-1"})
    assert demo.status_code == 200
    request = demo.json()
    assert request["title"] == "计算参数确认（示例）"
    result = await client.post(
        f"/{request['id']}/submit",
        json={
            "session_id": "session-1",
            "expected_revision": 1,
            "values": {"length": 0, "width": 5, "height": 2, "mode": "volume"},
        },
    )
    assert result.status_code == 200
    assert "计算长方体" in result.json()["continuation"]
    assert '"value": 0' in result.json()["continuation"]


@pytest.mark.asyncio
async def test_tool_scope_does_not_leak_outside_real_middleware_iteration(
    environment,
    module,
):
    tool = module.build_tool(environment.service)
    assert (
        json.loads((await tool(**form())).content[0].text)["error"]
        == "unsupported_context"
    )
    assert (await invoke(module, environment.service, context(environment)))[
        "ok"
    ]
    assert (
        json.loads((await tool(**form())).content[0].text)["error"]
        == "unsupported_context"
    )
    args = form()
    args["agent_id"] = "beta"
    with pytest.raises(TypeError):
        await tool(**args)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "change",
    ["channel", "capability", "source", "child", "user", "workspace"],
)
async def test_tool_rejects_unsupported_or_spoofed_context(
    environment,
    module,
    change,
):
    ctx = context(environment)
    if change == "channel":
        ctx.request.channel = "telegram"
    elif change == "capability":
        ctx.request.request_context["ui_capabilities"].pop(
            "openui_interactions",
        )
    elif change == "source":
        ctx.request.request_context["source"] = "heartbeat"
    elif change == "child":
        ctx.root_session_id = "parent"
    elif change == "user":
        ctx.request.user_id = "someone-else"
    elif change == "workspace":
        ctx.workspace = environment.workspaces["beta"]
    assert not (await invoke(module, environment.service, ctx))["ok"]
    assert environment.service.store.list("alpha", "session-1") == []


@pytest.mark.asyncio
async def test_cleared_draft_missing_defaults_and_optional_submission(
    environment,
    module,
):
    env = environment
    definition = form()
    definition["fields"] += [
        {"name": "note", "label": "备注", "type": "string", "default": None},
        {"name": "optional_number", "label": "可选值", "type": "number"},
    ]
    request = (await invoke(module, env.service, context(env), definition))[
        "request"
    ]
    assert "note" not in request["values"]
    path = f"/{request['id']}"
    empty = {"pressure": "", "enabled": "", "method": "", "note": None}
    draft = await env.client.put(
        path + "/draft",
        json={
            "session_id": "session-1",
            "expected_revision": 1,
            "values": empty,
        },
    )
    assert draft.status_code == 200
    assert draft.json()["values"] == {
        "pressure": "",
        "enabled": "",
        "method": "",
    }
    missing = await env.client.post(
        path + "/submit",
        json={
            "session_id": "session-1",
            "expected_revision": 2,
            "values": empty,
        },
    )
    assert missing.status_code == 422
    assert "required" in missing.json()["detail"]
    submitted = await env.client.post(
        path + "/submit",
        json={
            "session_id": "session-1",
            "expected_revision": 2,
            "values": {
                "pressure": 0,
                "enabled": False,
                "method": "b",
                "note": None,
                "optional_number": "",
            },
        },
    )
    assert submitted.status_code == 200
    assert submitted.json()["request"]["answer"] == {
        "pressure": 0,
        "enabled": False,
        "method": "b",
    }


@pytest.mark.asyncio
async def test_concurrent_agent_tool_contexts_and_exception_cleanup(
    environment,
    module,
):
    env = environment
    alpha = context(env)
    beta = context(env, agent_id="beta", workspace=env.workspaces["beta"])
    results = await asyncio.gather(
        invoke(module, env.service, alpha),
        invoke(module, env.service, beta),
    )
    assert [item["request"]["agent_id"] for item in results] == [
        "alpha",
        "beta",
    ]
    middleware = module.InteractionMiddleware(alpha)

    async def broken(**_kwargs):
        yield None
        raise RuntimeError("tool failed")

    with pytest.raises(RuntimeError, match="tool failed"):
        async for _ in middleware.on_acting(
            None,
            {"tool_call": {"name": "request_user_input"}},
            broken,
        ):
            pass
    result = await module.build_tool(env.service)(**form())
    assert json.loads(result.content[0].text)["error"] == "unsupported_context"


def test_plugin_registers_scoped_tool_and_surfaces_registration_errors(
    module,
):
    factories, routers, registered = [], [], []
    api = SimpleNamespace(
        register_middleware=factories.append,
        register_http_router=lambda router, **kwargs: routers.append(
            (router, kwargs),
        ),
        register_tool=lambda **kwargs: registered.append(kwargs),
    )
    module.OpenUIPlugin().register(api)
    assert len(factories) == 2
    assert routers[0][1]["prefix"] == "/openui/interactions"
    assert registered[0]["tool_name"] == "request_user_input"
    assert registered[0]["allowed_channels"] == ("console",)
    assert registered[0]["enabled"] is True
    available = registered[0]["availability_check"]
    capable = {
        "channel": "console",
        "session_id": "s",
        "root_session_id": "s",
        "ui_capabilities": {"openui_interactions": "v1"},
    }
    assert available(capable)
    assert not available({**capable, "root_session_id": "parent"})
    assert not available({**capable, "ui_capabilities": {"openui": "v1"}})
    assert not available({**capable, "channel": "cli"})

    def fail(**_kwargs):
        raise RuntimeError("registration failed")

    api.register_tool = fail
    with pytest.raises(RuntimeError, match="registration failed"):
        module.OpenUIPlugin().register(api)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "mutation",
    ["duplicates", "unknown_type", "bad_default", "extra_identity"],
)
async def test_tool_rejects_bad_schema_without_persistence(
    environment,
    module,
    mutation,
):
    definition = form()
    if mutation == "duplicates":
        definition["fields"].append(definition["fields"][0])
    elif mutation == "unknown_type":
        definition["fields"][0]["type"] = "javascript"
    elif mutation == "bad_default":
        definition["fields"][0]["default"] = False
    elif mutation == "extra_identity":
        definition["fields"][0]["agent_id"] = "beta"
    assert not (
        await invoke(
            module,
            environment.service,
            context(environment),
            definition,
        )
    )["ok"]
    assert environment.service.store.list("alpha", "session-1") == []


@pytest.mark.asyncio
@pytest.mark.parametrize("value", [float("nan"), float("inf"), 10**500])
async def test_nonfinite_or_overflow_numbers_are_rejected(
    environment,
    module,
    value,
):
    env = environment
    request = (await invoke(module, env.service, context(env)))["request"]
    body = {
        "session_id": "session-1",
        "expected_revision": 1,
        "values": {"pressure": value, "enabled": False, "method": "a"},
    }
    result = await env.client.post(
        f"/{request['id']}/submit",
        content=json.dumps(body),
        headers={"Content-Type": "application/json"},
    )
    assert result.status_code == 422
    recovered = env.service.store.get(request["id"], "alpha", "session-1")
    assert recovered == request
