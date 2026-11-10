# -*- coding: utf-8 -*-
# Fixtures retain public pytest names; assertions inspect real agent evidence.
# pylint: disable=protected-access,redefined-outer-name
"""Context evidence through real AgentScope calls, session files and HTTP."""

from __future__ import annotations

import asyncio
import json
from copy import deepcopy
from types import SimpleNamespace
from unittest.mock import AsyncMock

import httpx
import pytest
from agentscope.agent import ReActConfig
from agentscope.message import (
    Msg,
    TextBlock,
    ToolCallBlock,
    ToolResultBlock,
    DataBlock,
    URLSource,
    HintBlock,
)
from agentscope.tool import Toolkit
from fastapi import FastAPI

from qwenpaw.agents.context_inspection import (
    MAX_CONTENT,
    MAX_SOURCES,
    MAX_TOTAL_CONTENT,
    collect_sources,
    inspection_view,
)
from qwenpaw.agents.middlewares import MemoryMiddleware
from qwenpaw.agents.react_agent import QwenPawAgent
from qwenpaw.app import auth
from qwenpaw.app.chats import api
from qwenpaw.app.chats.models import ChatSpec
from qwenpaw.app.chats.session import SafeJSONSession
from qwenpaw.config.config import AgentProfileConfig, AgentProfileRef
from qwenpaw.constant import (
    AUTO_MEMORY_SEARCH_BLOCK_IDS_KEY,
    EXTERNAL_USER_QUERY_MESSAGE_TAG,
    QWENPAW_MESSAGE_TAG_KEY,
)
from qwenpaw.runtime._state_utils import StateProxy
from qwenpaw.runtime.builder import AgentBuilder

pytestmark = [pytest.mark.unit, pytest.mark.p1]


class RecordingModel:
    context_size = 32000
    model = "synthetic"

    def __init__(self):
        self.calls = []

    async def __call__(self, **kwargs):
        self.calls.append(kwargs)
        await asyncio.sleep(0)
        return "synthetic-result"


class Memory:
    async def auto_memory_search(self, *_args, **_kwargs):
        hint = HintBlock(hint="verified memory text", source="memory_search")
        return {
            "messages": [
                Msg(
                    name="memory",
                    content=[hint],
                    role="assistant",
                    metadata={AUTO_MEMORY_SEARCH_BLOCK_IDS_KEY: [hint.id]},
                ),
            ],
        }


def make_agent(prompt="system rules", middlewares=None):
    model = RecordingModel()
    agent = QwenPawAgent(
        name="test",
        model=model,
        system_prompt=prompt,
        toolkit=Toolkit(tools=[]),
        react_config=ReActConfig(),
        middlewares=middlewares or [],
        agent_config=SimpleNamespace(language="en"),
    )
    user = Msg(
        name="user",
        content=[TextBlock(type="text", text="question")],
        role="user",
        metadata={QWENPAW_MESSAGE_TAG_KEY: EXTERNAL_USER_QUERY_MESSAGE_TAG},
    )
    agent.state.context = [user]
    agent.state.session_id = "session"
    return agent, model, user


# Retain the stable protected regression case name.
# pylint: disable-next=line-too-long
async def test_actual_model_call_captures_transient_memory_and_persists_frozen_rules(  # noqa: E501
    tmp_path,
):
    rules = tmp_path / "AGENTS.md"
    rules.write_text("old verified rules", encoding="utf-8")
    ctx = SimpleNamespace(
        workspace_dir=tmp_path,
        agent_id="a",
        session_id="session",
        workspace=None,
        request=SimpleNamespace(
            user_id="u",
            channel="console",
            request_context={},
        ),
        extras={},
    )
    prompt = AgentBuilder().build_prompt(
        ctx,
        AgentProfileConfig(
            id="a",
            name="A",
            system_prompt_files=["AGENTS.md"],
        ),
    )
    agent, model, user = make_agent(
        prompt,
        [MemoryMiddleware(memory_manager=Memory())],
    )
    agent._context_inspection_prompt_sources = ctx.extras[
        "context_inspection_prompt_sources"
    ]
    inputs = [
        Msg(
            name="system",
            content=[TextBlock(type="text", text=prompt)],
            role="system",
        ),
        user,
    ]
    assert (
        await agent._call_model(inputs, [{"name": "tool"}])
        == "synthetic-result"
    )
    assert len(model.calls) == 1
    assert len(inputs) == 2  # Transient injection did not mutate caller input.
    assert "verified memory text" in str(model.calls[0]["messages"])
    assert all(
        "verified memory text" not in str(m) for m in agent.state.context
    )
    session = SafeJSONSession(str(tmp_path / "sessions"))
    await session.save_session_state("session", "u", "console", agent=agent)
    rules.write_text("changed after request", encoding="utf-8")
    reopened = SafeJSONSession(str(tmp_path / "sessions"))
    persisted = await reopened.get_session_state_dict(
        "session",
        "u",
        "console",
    )
    result = inspection_view(persisted["agent"])
    assert result["snapshot"]["basis"] == "model_request"
    assert result["snapshot"]["message_count"] == len(
        model.calls[0]["messages"],
    )
    assert result["snapshot"]["tool_count"] == 1
    assert any(
        s["kind"] == "memory" and s["content"] == "verified memory text"
        for s in result["sources"]
    )
    rule = next(s for s in result["sources"] if s["label"] == "AGENTS.md")
    assert rule["content"] == "# AGENTS.md\n\nold verified rules"
    assert "changed after request" not in json.dumps(result)
    system = next(s for s in result["sources"] if s["label"] == "system")
    assert system["content"] == prompt[:MAX_CONTENT]
    assert system["truncated"] is (len(prompt) > MAX_CONTENT)
    expected_limitations = ["provider_payload_not_recorded"]
    if len(prompt) > MAX_CONTENT:
        expected_limitations.append("snapshot_truncated")
    assert result["limitations"] == expected_limitations


# Retain the stable protected regression case name.
# pylint: disable-next=line-too-long
async def test_concurrent_agents_do_not_share_snapshots_or_configured_but_unused_sources():  # noqa: E501
    a, _a_model, a_user = make_agent()
    b, _b_model, b_user = make_agent()
    a._context_inspection_prompt_sources = [
        {"label": "NOT_USED.md", "content": "absent fragment"},
    ]
    a_user.content = [TextBlock(type="text", text="only A")]
    b_user.content = [TextBlock(type="text", text="only B")]
    await asyncio.gather(
        a._call_model([a_user], []),
        b._call_model([b_user], []),
    )
    a_view = inspection_view(a.state_dict())
    b_view = inspection_view(b.state_dict())
    assert "only A" in json.dumps(a_view) and "only B" not in json.dumps(
        a_view,
    )
    assert "only B" in json.dumps(b_view) and "only A" not in json.dumps(
        b_view,
    )
    assert "NOT_USED" not in json.dumps(a_view)
    assert a_view["snapshot"]["id"] != b_view["snapshot"]["id"]
    assert not any(
        s["kind"] in {"system", "memory"} for s in a_view["sources"]
    )


async def test_observer_failure_does_not_change_or_repeat_model_call(
    monkeypatch,
):  # noqa: E501
    agent, model, user = make_agent()

    def broken(*_args, **_kwargs):
        raise RuntimeError("inspector failure")

    monkeypatch.setattr(
        "qwenpaw.agents.context_inspection.collect_sources",
        broken,
    )
    assert await agent._call_model([user], []) == "synthetic-result"
    assert len(model.calls) == 1
    assert "context_inspection" not in agent.state_dict()


# Retain the stable protected regression case name.
# pylint: disable-next=line-too-long
async def test_actual_data_and_read_file_result_use_frozen_model_visible_evidence(  # noqa: E501
    tmp_path,
):
    agent, _model, user = make_agent()
    path = tmp_path / "evidence.txt"
    path.write_text(
        "current bytes must never be substituted",
        encoding="utf-8",
    )
    user.content.append(
        DataBlock(
            source=URLSource(
                type="url",
                url=path.as_uri(),
                media_type="text/plain",
            ),
            name="evidence.txt",
        ),
    )
    tool = Msg(
        name="assistant",
        role="assistant",
        content=[
            ToolCallBlock(
                id="read",
                name="read_file",
                input=json.dumps({"file_path": str(path)}),
            ),
            ToolResultBlock(
                id="read",
                name="read_file",
                state="success",
                output="historical tool result",
            ),
        ],
    )
    await agent._call_model([user, tool], [])
    files = [
        s
        for s in inspection_view(agent.state_dict())["sources"]
        if s["kind"] == "file"
    ]
    assert len(files) == 2
    assert files[0]["content"] is None
    assert files[1]["content"] == "historical tool result"
    assert files[1]["path"] == str(path)
    assert "current bytes" not in json.dumps(files)


# Retain the stable protected regression case name.
# pylint: disable-next=line-too-long
async def test_snapshot_roundtrip_discards_rewound_turn_and_rebounds_imported_content():  # noqa: E501
    agent, _model, user = make_agent()
    await agent._call_model([user], [])
    saved = agent.state_dict()
    restored, _other, _user = make_agent()
    restored.load_state_dict(saved)
    assert (
        restored.state_dict()["context_inspection"]
        == saved["context_inspection"]
    )
    rewound = deepcopy(saved)
    rewound["state"]["context"] = []
    restored.load_state_dict(rewound)
    assert "context_inspection" not in restored.state_dict()
    recorded = saved["context_inspection"]
    recorded["sources"] = [
        dict(recorded["sources"][0], content="x" * 10000),
    ] * 100
    result = inspection_view(saved)
    assert "snapshot_truncated" in result["limitations"]
    assert len(result["sources"]) == MAX_SOURCES
    assert (
        sum(len(s["content"] or "") for s in result["sources"])
        <= MAX_TOTAL_CONTENT
    )


def test_legacy_context_is_saved_evidence_and_does_not_invent_rules_or_memory():  # noqa: E501
    result = inspection_view(
        {
            "state": {
                "summary": "durable native summary",
                "context": [
                    {"role": "user", "id": "old", "content": "saved message"},
                ],
            },
        },
    )
    assert result["snapshot"]["basis"] == "saved_session"
    assert result["snapshot"]["captured_at"] is None
    assert result["sources"][0]["provenance"] == "saved_session"
    assert result["summary"]["content"] == "durable native summary"
    assert result["summary"]["kind"] == "native"
    assert "runtime_sources_unavailable" in result["limitations"]
    assert not any(
        s["kind"] in {"system", "memory"} for s in result["sources"]
    )
    old = inspection_view(
        {
            "memory": {
                "content": [[{"role": "user", "content": "1.x"}, []]],
                "_compressed_summary": "old summary",
            },
        },
    )
    assert old["sources"][0]["content"] == "1.x"
    assert old["summary"]["content"] == "old summary"
    assert inspection_view({})["status"] == "empty"


def test_scroll_summary_uses_saved_continuation_and_preserves_staleness():
    data = {
        "scroll": {
            "continuation_summary": {
                "version": 1,
                "covered_seq": [1, 3],
                "active_task": "Resume the synthetic task",
                "status": "in_progress",
                "current_state": [],
                "constraints": [],
                "decisions": [],
                "open_work": [],
            },
            "summary_update_failed": True,
        },
        "state": {"summary": "native fallback"},
    }
    before = deepcopy(data)
    result = inspection_view(data)
    assert result["summary"]["kind"] == "scroll"
    assert "Resume the synthetic task" in result["summary"]["content"]
    assert result["summary"]["stale"] is True
    assert data == before


def test_snapshot_limits_exclude_binary_and_only_count_quotes_present_in_message():  # noqa: E501
    messages = [
        {
            "id": "u",
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": (
                        "Quoted passages from assistant replies:\n[answer]\n> "
                        "actual quote"
                    ),
                },
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "data": "private-binary-data",
                    },
                },
                {
                    "type": "file",
                    "filename": "report.pdf",
                    "source": {
                        "url": (
                            "https://user:password@example.test/report.pdf?tok"
                            "en=secret"
                        ),
                    },
                },
            ],
            "metadata": {
                "qwenpaw_answer_quotes": [
                    {"text": "actual quote", "messageId": "answer"},
                    {"text": "not actually sent", "messageId": "other"},
                ],
            },
        },
    ]
    sources, _ = collect_sources(messages, provenance="model_request")
    assert [s["content"] for s in sources if s["kind"] == "quote"] == [
        "actual quote",
    ]
    rendered = json.dumps(sources)
    assert "private-binary-data" not in rendered
    assert "password" not in rendered and "secret" not in rendered
    assert any(s["path"] == "https://example.test/report.pdf" for s in sources)
    many = [{"role": "user", "content": "x" * 10000} for _ in range(100)]
    sources, truncated = collect_sources(many, provenance="model_request")
    assert truncated
    assert len(sources) <= MAX_SOURCES
    assert all(len(s["content"] or "") <= MAX_CONTENT for s in sources)
    assert sum(len(s["content"] or "") for s in sources) <= MAX_TOTAL_CONTENT


def test_memory_provenance_marks_only_the_recorded_hint_block():
    sources, _ = collect_sources(
        [
            {
                "role": "user",
                "metadata": {AUTO_MEMORY_SEARCH_BLOCK_IDS_KEY: ["recalled"]},
                "content": [
                    {"type": "text", "text": "original question"},
                    {
                        "type": "hint",
                        "id": "recalled",
                        "hint": "actual recall",
                    },
                    {"type": "hint", "id": "other", "hint": "ordinary hint"},
                ],
            },
        ],
        provenance="model_request",
    )
    assert [s["content"] for s in sources if s["kind"] == "memory"] == [
        "actual recall",
    ]
    assert [s["content"] for s in sources if s["kind"] == "conversation"] == [
        "original question\nordinary hint",
    ]


@pytest.fixture
async def context_app(tmp_path, monkeypatch):
    workspaces = {}
    profiles = {}
    for agent_id in ("a", "b"):
        root = tmp_path / agent_id
        root.mkdir()
        session = SafeJSONSession(str(root / "sessions"))
        chat = ChatSpec(
            id="chat",
            session_id="same-session",
            user_id=f"owner-{agent_id}",
            channel="console",
        )
        manager = SimpleNamespace(
            get_chat=AsyncMock(
                side_effect=lambda cid, chat=chat: chat
                if cid == "chat"
                else None,
            ),
        )
        workspaces[agent_id] = SimpleNamespace(
            agent_id=agent_id,
            chat_manager=manager,
            session=session,
        )
        profiles[agent_id] = AgentProfileRef(
            id=agent_id,
            workspace_dir=str(root),
        )
        proxy = StateProxy()
        proxy.data = {
            "state": {
                "context": [
                    {"role": "user", "content": ("private " f"{agent_id}")},
                ],
            },
        }
        await session.save_session_state(
            "same-session",
            f"owner-{agent_id}",
            "console",
            agent=proxy,
        )
        proxy.data = {
            "state": {
                "context": [{"role": "user", "content": "other user secret"}],
            },
        }
        await session.save_session_state(
            "same-session",
            "another-user",
            "console",
            agent=proxy,
        )
    monkeypatch.setattr(
        "qwenpaw.app.agent_context.load_config",
        lambda: SimpleNamespace(
            agents=SimpleNamespace(profiles=profiles, active_agent="a"),
        ),
    )
    monkeypatch.setattr(auth, "is_auth_enabled", lambda: True)
    monkeypatch.setattr(auth, "has_registered_users", lambda: True)
    monkeypatch.setattr(
        auth,
        "_get_config_cached",
        lambda: (
            SimpleNamespace(security=SimpleNamespace(allow_no_auth_hosts=[])),
            None,
        ),
    )
    monkeypatch.setattr(
        auth,
        "verify_token",
        lambda value: "desktop-login" if value == "valid" else None,
    )
    app = FastAPI()
    app.include_router(api.router, prefix="/api")
    app.add_middleware(auth.AuthMiddleware)
    app.state.multi_agent_manager = SimpleNamespace(
        get_agent=AsyncMock(side_effect=lambda aid: workspaces[aid]),
    )
    return app, workspaces


# Retain the stable protected regression case name.
# pylint: disable-next=line-too-long
async def test_http_context_requires_auth_and_uses_exact_agent_chat_user_identity(  # noqa: E501
    context_app,
):
    app, workspaces = context_app
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        assert (await client.get("/api/chats/chat/context")).status_code == 401
        for agent_id in ("a", "b"):
            response = await client.get(
                "/api/chats/chat/context",
                headers={
                    "Authorization": "Bearer valid",
                    "X-Agent-Id": agent_id,
                },
                params={
                    "expected_session_id": "same-session",
                    "expected_user_id": f"owner-{agent_id}",
                },
            )
            assert response.status_code == 200
            assert response.json()["agent_id"] == agent_id
            assert response.json()["sources"][0]["content"] == (
                "private " f"{agent_id}"
            )
            assert "other user secret" not in response.text
        for query in (
            {"expected_session_id": "wrong"},
            {"expected_user_id": "another-user"},
        ):
            response = await client.get(
                "/api/chats/chat/context",
                headers={"Authorization": "Bearer valid", "X-Agent-Id": "a"},
                params=query,
            )
            assert response.status_code == 409
        assert (
            await client.get(
                "/api/chats/chat/context",
                headers={
                    "Authorization": "Bearer valid",
                    "X-Agent-Id": "unknown",
                },
            )
        ).status_code == 404
        assert (
            await client.get(
                "/api/chats/missing/context",
                headers={"Authorization": "Bearer valid", "X-Agent-Id": "a"},
            )
        ).status_code == 404
        workspaces["a"].chat_manager.get_chat.side_effect = None
        workspaces["a"].chat_manager.get_chat.return_value = ChatSpec(
            id="app",
            session_id="same-session",
            user_id="owner-a",
            channel="console",
            meta={"pawapp": {"app_id": "forms"}},
        )
        assert (
            await client.get(
                "/api/chats/app/context",
                headers={"Authorization": "Bearer valid", "X-Agent-Id": "a"},
            )
        ).status_code == 404


async def test_http_context_is_read_only_and_never_hydrates_or_executes(
    context_app,
):  # noqa: E501
    app, workspaces = context_app
    ws = workspaces["a"]
    ws.harness_runtime = SimpleNamespace(
        hydrate_session=AsyncMock(
            side_effect=AssertionError("hydrate forbidden"),
        ),
    )
    before = await ws.session.get_session_state_dict(
        "same-session",
        "owner-a",
        "console",
    )
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.get(
            "/api/chats/chat/context",
            headers={"Authorization": "Bearer valid", "X-Agent-Id": "a"},
        )
    assert response.status_code == 200
    assert (
        await ws.session.get_session_state_dict(
            "same-session",
            "owner-a",
            "console",
        )
        == before
    )
    ws.harness_runtime.hydrate_session.assert_not_awaited()
