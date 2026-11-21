# -*- coding: utf-8 -*-
"""Exercise the installed brainstorming routes with real, disk-backed PawApp storage."""

import importlib.util
import json
import sys
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from qwenpaw import constant
from qwenpaw.agents import model_factory

ROOT = Path(__file__).resolve().parents[3] / "plugins/apps/brainstorm"
SESSIONS = "/api/brainstorm/sessions"
TOPIC = "怎样让邻里更愿意交换闲置工具？"
FIRST = "谁最需要借工具？"
SECOND = "你会用什么证据验证他们的顾虑？"
LAST = "如果完全取消押金，怎样建立信任？"
IDEA = "先从常修家具的邻居开始。"


@pytest.fixture
def client(tmp_path, monkeypatch):
    name = "installed_brainstorm_test"
    spec = importlib.util.spec_from_file_location(
        name,
        ROOT / "backend/main.py",
        submodule_search_locations=[str(ROOT)],
    )
    main = importlib.util.module_from_spec(spec)
    monkeypatch.setitem(sys.modules, name, main)
    spec.loader.exec_module(main)
    monkeypatch.setattr(constant, "WORKING_DIR", tmp_path)
    application = FastAPI()

    @application.middleware("http")
    async def set_test_principal(request, next_handler):
        request.state.user = request.headers.get("test-principal", "alice")
        return await next_handler(request)

    application.include_router(main.router, prefix="/api/brainstorm")
    with TestClient(application) as http:
        yield http


@pytest.fixture
def model_provider(monkeypatch):
    """Substitute the provider only; exercise actual prompt creation/response handling."""
    replies = []
    calls = []

    async def create(*, agent_id, **_):
        async def complete(messages, **_):
            instruction, context = messages
            assert instruction.role == "system" and context.role == "user"
            calls.append(
                (
                    agent_id,
                    instruction.get_text_content(),
                    context.get_text_content(),
                ),
            )
            reply = replies.pop(0)
            if isinstance(reply, BaseException):
                raise reply
            return {
                "content": [
                    {"type": "thinking", "text": "provider reasoning"},
                    {"type": "text", "text": reply},
                ],
            }

        complete.context_size = 4096
        return complete, None

    monkeypatch.setattr(
        model_factory, "create_model_and_formatter_async", create
    )
    return replies, calls


def post(client, url, body, **kwargs):
    response = client.post(url, json=body, **kwargs)
    assert response.is_success, response.text
    return response.json()


def start(client, **kwargs):
    return post(
        client, SESSIONS, {"topic": TOPIC, "request_id": "open"}, **kwargs
    )


def test_discussion_uses_real_model_adapter_context_and_persisted_history(
    client,
    model_provider,
    tmp_path,
):
    replies, calls = model_provider
    material = "附近有二十户家庭。"
    draft = "访谈三位借过电钻的邻居。"
    summary = "## 下一步\n访谈三位邻居。"
    replies.extend([FIRST, SECOND, summary, LAST])
    agent = {"agent_id": "researcher"}
    opened = post(
        client,
        SESSIONS,
        {"topic": TOPIC, "materials": material, "request_id": "open"},
        params=agent,
    )
    url = f"{SESSIONS}/{opened['id']}"
    assert opened["turns"][-1]["question"] == FIRST
    updated = post(
        client,
        url + "/turns",
        {
            "revision": opened["revision"],
            "request_id": "follow",
            "mode": "deepen",
            "answer": IDEA,
        },
        params=agent,
    )
    assert [row["question"] for row in updated["turns"]] == [FIRST, SECOND]
    assert updated["turns"][0]["answer"] == IDEA
    summarized = post(
        client,
        url + "/summary",
        {
            "revision": updated["revision"],
            "request_id": "sum",
            "answer": draft,
        },
        params=agent,
    )
    assert summarized["summary"] == summary
    for agent_id, _, transcript in calls:
        assert agent_id == "researcher"
        context = json.loads(transcript)
        assert context["topic"] == TOPIC
        assert context["materials"] == material
    for phrase in [FIRST, IDEA, SECOND, draft]:
        assert phrase in calls[-1][2]
    assert len(list(tmp_path.rglob("*.json"))) > 0
    assert client.get(url, params=agent).json() == summarized
    assert client.get(SESSIONS, params=agent).json()["sessions"][0][
        "has_summary"
    ]
    continued = post(
        client,
        url + "/turns",
        {
            "revision": summarized["revision"],
            "request_id": "next",
            "mode": "reframe",
            "answer": "",
        },
        params=agent,
    )
    assert continued["turns"][-1]["question"] == LAST
    assert continued["summary"] is None
    assert client.get(url, params=agent).json() == continued


def test_long_discussions_fit_the_model_window_and_preserve_full_source(
    client,
    model_provider,
):
    replies, calls = model_provider
    material = "\n".join(["访谈记录：邻居担心损坏别人家的工具。"] * 500)
    questions = [f"第{index}种试点办法如何衡量？" for index in range(8)]
    answers = [
        f"第{index}轮访谈：" + IDEA * 120
        for index in range(len(questions) - 1)
    ]
    latest = "请给试点过程设计一个复盘指标。"
    replies.extend([*questions, "总结：记录实际借出次数。"])
    session = post(
        client,
        SESSIONS,
        {
            "topic": TOPIC,
            "materials": material,
            "request_id": "open",
        },
    )
    url = f"{SESSIONS}/{session['id']}"
    for i, answer in enumerate(answers):
        session = post(
            client,
            url + "/turns",
            {
                "revision": session["revision"],
                "request_id": f"step-{i}",
                "answer": answer,
                "mode": "deepen",
            },
        )
    post(
        client,
        url + "/summary",
        {
            "revision": session["revision"],
            "request_id": "summary",
            "answer": latest,
        },
    )
    for _, instruction, transcript in calls:
        assert len(instruction.encode()) + len(transcript.encode()) <= 2944
    excerpt = json.loads(calls[-1][2])
    assert excerpt["excerpted"] and excerpt["total_turns"] == len(questions)
    assert excerpt["turns"][-1]["question"] == questions[-1]
    assert excerpt["turns"][-1]["answer"] == latest
    stored = client.get(url).json()
    assert stored["materials"] == material
    assert [row["question"] for row in stored["turns"]] == questions
    assert [row["answer"] for row in stored["turns"]] == [*answers, latest]


def test_retries_conflicts_and_model_errors_preserve_the_last_saved_turn(
    client,
    model_provider,
):
    replies, calls = model_provider
    replies.extend([FIRST, RuntimeError("private provider details"), SECOND])
    session = start(client)
    assert start(client)["id"] == session["id"]
    assert len(calls) == 1
    url = f"{SESSIONS}/{session['id']}"
    payload = {
        "revision": session["revision"],
        "request_id": "next",
        "answer": IDEA,
        "mode": "diverge",
    }
    failed = client.post(url + "/turns", json=payload)
    assert failed.status_code == 503
    assert "private provider details" not in failed.text
    assert client.get(url).json() == session
    saved = post(client, url + "/turns", payload)
    assert post(client, url + "/turns", payload)["turns"] == saved["turns"]
    assert (
        client.post(
            url + "/turns",
            json={
                **payload,
                "request_id": "late",
                "answer": "旧窗口的回答",
            },
        ).status_code
        == 409
    )
    assert len(calls) == 3
    assert client.get(url).json() == saved


def test_other_accounts_and_experts_cannot_open_or_extend_a_session(
    client,
    model_provider,
):
    replies, calls = model_provider
    replies.append(FIRST)
    session = start(client)
    url = f"{SESSIONS}/{session['id']}"
    for scope in [
        {"headers": {"test-principal": "bob"}},
        {"params": {"agent_id": "b"}},
    ]:
        assert client.get(SESSIONS, **scope).json() == {"sessions": []}
        assert client.get(url, **scope).status_code == 404
        denied = client.post(
            url + "/turns",
            json={
                "revision": session["revision"],
                "request_id": "other",
                "mode": "deepen",
                "answer": IDEA,
            },
            **scope,
        )
        assert denied.status_code == 404
    assert client.get(url, params={"user_id": "bob"}).status_code == 403
    assert (
        client.get(url, headers={"X-PawApp-Id": "uproject"}).status_code == 403
    )
    assert len(calls) == 1
    assert client.get(url).json() == session
