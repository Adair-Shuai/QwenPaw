# -*- coding: utf-8 -*-
"""Behavior regression for the installed agenda API and persistent workflow."""

import base64
import importlib.util
import io
import json
import sys
import types
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = "test_research_agenda_plugin"
package = types.ModuleType(PACKAGE)
package.__path__ = [str(ROOT)]
sys.modules[PACKAGE] = package
spec = importlib.util.spec_from_file_location(
    f"{PACKAGE}.main",
    ROOT / "backend/main.py",
)
main = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = main
spec.loader.exec_module(main)
Store = main.Store


@pytest.fixture(name="client")
def client_fixture(tmp_path, monkeypatch):
    monkeypatch.setattr(main, "WORKING_DIR", tmp_path)
    app = FastAPI()
    app.include_router(main.router, prefix="/api/research-agenda")
    app.dependency_overrides[
        main.get_scoped_ctx
    ] = lambda: types.SimpleNamespace(
        user_id="user-a",
        agent_id="default",
    )
    with TestClient(app) as client:
        yield client


def fields(**changes):
    return main.TaskFields(title="修改研究方案", **changes).model_dump(mode="json")


def material(**changes):
    return {
        "text": "张老师：我周五提交研究方案。",
        "identity": "张老师",
        "reference_date": "2026-11-17",
        **changes,
    }


def result(**changes):
    return {
        "summary": "研究方案需要提交",
        "candidates": [
            {
                **fields(due_date="2026-11-20"),
                "relation": "mine",
                "evidence": "我周五提交研究方案。",
                **changes,
            },
        ],
    }


def test_text_import_review_apply_is_persistent_and_idempotent(
    client,
    monkeypatch,
):
    model_calls = []

    async def model(body, _existing, agent_id):
        model_calls.append(body)
        assert agent_id == "default"
        assert body.identity == "张老师"
        return json.dumps(result(), ensure_ascii=False)

    monkeypatch.setattr(main.extract, "call_model", model)
    response = client.post("/api/research-agenda/extract", json=material())
    assert response.status_code == 200
    source = response.json()
    assert client.get("/api/research-agenda/state").json()["tasks"] == []
    candidate = source["candidates"][0]
    payload = {
        "candidates": [
            {
                "candidate_id": candidate["candidate_id"],
                "fields": fields(due_date="2026-11-20"),
            },
        ],
    }
    first = client.post(
        f"/api/research-agenda/sources/{source['id']}/apply",
        json=payload,
    )
    second = client.post(
        f"/api/research-agenda/sources/{source['id']}/apply",
        json=payload,
    )
    assert first.status_code == second.status_code == 200
    assert first.json()["ids"] == second.json()["ids"]
    repeated_import = client.post(
        "/api/research-agenda/extract",
        json=material(),
    )
    assert repeated_import.json()["id"] == source["id"]
    assert repeated_import.json()["status"] == "applied"
    assert len(model_calls) == 1
    assert len(second.json()["tasks"]) == 1
    assert second.json()["tasks"][0]["evidence"] == "我周五提交研究方案。"
    assert (
        client.get(f"/api/research-agenda/sources/{source['id']}").json()[
            "accepted_candidates"
        ]
        == payload["candidates"]
    )
    assert (
        client.get(f"/api/research-agenda/sources/{source['id']}").json()[
            "text"
        ]
        == material()["text"]
    )


def test_missing_evidence_and_invalid_images_are_rejected(client, monkeypatch):
    async def model(*_args):
        return json.dumps(result(evidence="无来源的任务"), ensure_ascii=False)

    monkeypatch.setattr(main.extract, "call_model", model)
    assert (
        client.post(
            "/api/research-agenda/extract",
            json=material(),
        ).status_code
        == 422
    )
    assert client.get("/api/research-agenda/state").json()["sources"] == []
    assert (
        client.post(
            "/api/research-agenda/extract",
            json=material(
                images=[
                    {
                        "name": "bad.png",
                        "data_url": "data:image/png;base64,ZmFrZQ==",
                    },
                ],
            ),
        ).status_code
        == 422
    )


def test_screenshot_body_reaches_model_and_transcript_is_preserved(
    client,
    monkeypatch,
):
    image = Image.new("RGB", (12, 12), "white")
    output = io.BytesIO()
    image.save(output, format="PNG")
    encoded = (
        "data:image/png;base64," + base64.b64encode(output.getvalue()).decode()
    )

    async def model(body, _existing, _agent_id):
        assert body.images[0].data_url == encoded
        return json.dumps(
            {**result(), "transcript": material()["text"]},
            ensure_ascii=False,
        )

    monkeypatch.setattr(main.extract, "call_model", model)
    response = client.post(
        "/api/research-agenda/extract",
        json=material(
            text="",
            images=[{"name": "聊天截图.png", "data_url": encoded}],
        ),
    )
    assert response.status_code == 200
    assert response.json()["transcript"] == material()["text"]
    assert response.json()["images"][0]["data_url"] == encoded


def test_updates_are_atomic_and_stale_review_does_not_overwrite_changes(
    tmp_path,
):
    store = Store(tmp_path, "a", "default")
    task = store.create_task(fields())
    source = {
        "id": "source",
        "status": "review",
        "candidates": [
            {
                "candidate_id": "new",
                "action": "create",
                "relation": "mine",
                "evidence": "新工作",
            },
            {
                "candidate_id": "update",
                "action": "update",
                "relation": "mine",
                "evidence": "改期",
                "target_id": task["id"],
                "target_revision": 1,
            },
        ],
    }
    store.add_source(source)
    store.update_task(task["id"], 1, fields(notes="手动修改"))
    with pytest.raises(ValueError, match="已经变化"):
        store.apply(
            "source",
            [
                {"candidate_id": "new", "fields": fields()},
                {"candidate_id": "update", "fields": fields()},
            ],
        )
    assert len(store.snapshot()["tasks"]) == 1
    assert store.source("source")["status"] == "review"
    assert store.snapshot()["tasks"][0]["notes"] == "手动修改"


def test_account_and_agent_scope_cannot_read_other_sources(tmp_path):
    first = Store(tmp_path, "user-a", "agent-a")
    first.create_task(fields())
    first.add_source(
        {"id": "private", "text": "private", "images": [], "candidates": []},
    )
    for store in [
        Store(tmp_path, "user-b", "agent-a"),
        Store(tmp_path, "user-a", "agent-b"),
    ]:
        assert store.snapshot() == {"tasks": [], "sources": []}
        with pytest.raises(KeyError):
            store.source("private")


def test_plan_respects_meetings_lunch_waiting_and_capacity():
    day = "2026-11-17"
    tasks = [
        {
            **fields(planned_date=day, start="09:00", duration=60),
            "id": "meeting",
        },
        {**fields(duration=120, due_date="2026-11-20"), "id": "research"},
        {**fields(status="waiting"), "id": "waiting"},
        {**fields(duration=480), "id": "too-long"},
        {**fields(planned_date="2026-11-18"), "id": "future"},
    ]
    plan = main.build_plan(tasks, day)
    assert {block["task_id"] for block in plan["blocks"]} == {
        "meeting",
        "research",
    }
    research = next(
        block for block in plan["blocks"] if block["task_id"] == "research"
    )
    assert research["start"] == "13:30"
    assert plan["unplanned"] == ["too-long"]


def test_cancel_preserves_provenance_and_update_revision(tmp_path):
    store = Store(tmp_path, "a", "default")
    task = store.create_task(
        {**fields(), "source_id": "old", "evidence": "原约定"},
    )
    store.add_source(
        {
            "id": "new",
            "status": "review",
            "candidates": [
                {
                    "candidate_id": "cancel",
                    "action": "cancel",
                    "relation": "mine",
                    "evidence": "会议取消",
                    "target_id": task["id"],
                    "target_revision": 1,
                },
            ],
        },
    )
    store.apply("new", [{"candidate_id": "cancel", "fields": fields()}])
    row = store.snapshot()["tasks"][0]
    assert row["status"] == "cancelled"
    assert row["revision"] == 2
    assert row["history"][0]["source_id"] == "old"
    assert row["history"][0]["evidence"] == "原约定"


def test_multiple_grounded_quotes_and_ambiguous_time_remain_reviewable():
    body = main.extract.ImportBody(
        **material(text="张老师：周五提交报告。\n李工：明天上午发数据。"),
    )
    raw = result(evidence="周五提交报告。\n明天上午发数据。", start="上午")
    parsed = main.extract.parse_result(json.dumps(raw), body, [])
    proposal = parsed["candidates"][0]
    assert proposal["start"] == ""
    assert "需要确认具体时刻" in proposal["questions"][0]
    raw["candidates"][0]["evidence"] = "   "
    with pytest.raises(ValueError):
        main.extract.parse_result(json.dumps(raw), body, [])


def test_unknown_target_is_rejected_before_persistence(client, monkeypatch):
    async def model(*_args):
        return json.dumps(
            result(action="update", target_id="foreign"),
            ensure_ascii=False,
        )

    monkeypatch.setattr(main.extract, "call_model", model)
    assert (
        client.post(
            "/api/research-agenda/extract",
            json=material(),
        ).status_code
        == 422
    )
    assert client.get("/api/research-agenda/state").json()["sources"] == []


@pytest.mark.asyncio
async def test_real_message_contract_and_image_payload(monkeypatch):
    from qwenpaw.agents import model_factory
    from agentscope.message import Msg

    calls = []

    class Model:
        async def __call__(self, messages):
            calls.extend(messages)
            assert all(isinstance(message, Msg) for message in messages)
            assert isinstance(messages[0].content, list)
            return {
                "content": [{"type": "text", "text": json.dumps(result())}],
            }

    class Formatter:
        async def format(self, _messages):
            return [
                {
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {"url": "data:image/png;base64,test"},
                        },
                    ],
                },
            ]

    async def factory(**kwargs):
        assert kwargs["agent_id"] == "default"
        return Model(), Formatter()

    monkeypatch.setattr(
        model_factory,
        "create_model_and_formatter_async",
        factory,
    )
    body = main.extract.ImportBody(**material())
    value = await main.extract.call_model(body, [], "default")
    assert json.loads(value)["candidates"][0]["title"] == "修改研究方案"
    assert len(calls) == 2
    output = io.BytesIO()
    Image.new("RGB", (12, 12), "white").save(output, format="PNG")
    encoded = (
        "data:image/png;base64," + base64.b64encode(output.getvalue()).decode()
    )
    body = main.extract.ImportBody(
        **material(images=[{"name": "chat.png", "data_url": encoded}]),
    )
    await main.extract.call_model(body, [], "default")
    assert calls[-1].content[-1].source.media_type == "image/png"
