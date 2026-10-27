# -*- coding: utf-8 -*-
"""UIdeas real HTTP/storage regressions; synthetic records and no model \
calls."""
from __future__ import annotations

import asyncio
import copy
import importlib.util
import sys
from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

BACKEND = Path(__file__).resolve().parents[3] / "plugins/apps/uideas/backend"


class MemoryStorage:
    def __init__(self):
        self.data = {}

    async def get(self, key, default=None):
        return copy.deepcopy(self.data.get(key, default))

    async def set(self, key, value):
        self.data[key] = copy.deepcopy(value)


@pytest.fixture(name="app_env")
def _app_env_fixture(monkeypatch):
    # The plugin loader uses private backend search paths. Restore all aliases
    # afterwards so other apps with a module named store are unaffected.
    monkeypatch.syspath_prepend(str(BACKEND))
    modules = {}
    for name in ("store", "sse", "memory", "analyze", "proactive", "main"):
        spec = importlib.util.spec_from_file_location(
            name,
            BACKEND / f"{name}.py",
        )
        module = importlib.util.module_from_spec(spec)
        monkeypatch.setitem(sys.modules, name, module)
        spec.loader.exec_module(module)
        modules[name] = module
    ctx = SimpleNamespace(app_id="uideas", storage=MemoryStorage())
    app = FastAPI()
    app.include_router(modules["main"].router, prefix="/api/uideas")
    app.dependency_overrides[modules["main"].get_ctx] = lambda: ctx
    with TestClient(app) as client:
        yield client, ctx, modules


def test_http_action_adoption_completion_reopen_and_missing_ids(app_env):
    client, ctx, modules = app_env
    store = modules["store"]
    idea = client.post(
        "/api/uideas/ideas",
        json={"content": "压力假设 #数模 @实验3"},
    ).json()["idea"]
    suggestion = asyncio.run(
        store.create_suggestion(
            ctx,
            title="验证假设",
            body="合成实验计划",
            source_idea_ids=[idea["id"]],
        ),
    )
    route = f"/api/uideas/suggestions/{suggestion['id']}"
    assert client.patch(route, json={"status": "accepted"}).status_code == 200
    assert client.patch(route, json={"status": "accepted"}).status_code == 200
    meta = client.get("/api/uideas/meta").json()["meta"]
    assert meta["todo_count"] == 1
    assert len(meta["todo_queue"]) == 1
    todo = meta["todo_queue"][0]
    route = f"/api/uideas/todos/{todo['id']}"
    done = client.patch(route, json={"status": "done"}).json()["todo"]
    again = client.patch(route, json={"status": "done"}).json()["todo"]
    assert done["completed_at"] == again["completed_at"]
    assert done["idea_ids"] == [idea["id"]]
    assert done["suggestion_id"] == suggestion["id"]
    assert client.get("/api/uideas/meta").json()["meta"]["todo_count"] == 0
    reopened = client.patch(route, json={"status": "todo"}).json()["todo"]
    assert "completed_at" not in reopened
    assert client.get("/api/uideas/meta").json()["meta"]["todo_count"] == 1
    assert client.patch(route, json={"status": "invalid"}).status_code == 422
    assert (
        client.patch(
            "/api/uideas/todos/missing",
            json={"status": "done"},
        ).status_code
        == 404
    )
    assert (
        len(client.get("/api/uideas/meta").json()["meta"]["todo_queue"]) == 1
    )
    assert any(
        e["type"] == "todo:updated" for e in modules["sse"].recent_events()
    )


def test_idea_validation_metadata_archive_and_restore_through_http(app_env):
    client, _, _ = app_env
    assert (
        client.post(
            "/api/uideas/ideas",
            json={"title": "  ", "content": "\n"},
        ).status_code
        == 400
    )
    idea = client.post(
        "/api/uideas/ideas",
        json={
            "title": "观察",
            "content": "长期记录",
            "related_experiments": ["原始实验"],
        },
    ).json()["idea"]
    route = f"/api/uideas/ideas/{idea['id']}"
    edited = client.patch(route, json={"title": "新问题 #压力 @实验8"}).json()["idea"]
    assert edited["tags"] == ["压力"]
    assert edited["related_experiments"] == ["原始实验", "实验8"]
    assert (
        client.patch(route, json={"title": "", "content": ""}).status_code
        == 400
    )
    assert (
        client.patch(
            route,
            json={"content": "不得写入", "status": "invalid"},
        ).status_code
        == 400
    )
    assert client.get(route).json()["idea"]["content"] == "长期记录"
    archived = client.patch(route, json={"status": "archived"}).json()["idea"]
    assert archived["status_before_archive"] == "raw"
    restored = client.patch(
        route,
        json={"status": archived["status_before_archive"]},
    ).json()["idea"]
    assert restored["status"] == "raw"
    assert "status_before_archive" not in restored
    assert restored["related_experiments"] == ["原始实验", "实验8"]


def test_concurrent_action_updates_preserve_queue_and_settings(app_env):
    _, ctx, modules = app_env
    store = modules["store"]

    async def run():
        initial = await store.create_suggestion(ctx, title="初始行动", body="合成数据")
        await store.update_suggestion_status(ctx, initial["id"], "accepted")
        meta = await store.get_meta(ctx)
        todo = meta["todo_queue"][0]
        more = await store.create_suggestion(ctx, title="后续行动", body="合成数据")

        async def settings():
            async with store.transaction():
                value = await store.get_meta(ctx)
                value["interval_minutes"] = 120
                await store.save_meta(ctx, value)

        await asyncio.gather(
            store.update_todo_status(ctx, todo["id"], "done"),
            store.update_suggestion_status(ctx, more["id"], "accepted"),
            settings(),
        )
        result = await store.get_meta(ctx)
        assert result["interval_minutes"] == 120
        assert len(result["todo_queue"]) == 2
        assert result["todo_queue"][0]["status"] == "done"
        assert result["todo_queue"][1]["status"] == "todo"
        # A separate storage namespace cannot mutate the first one's actions.
        other = SimpleNamespace(storage=MemoryStorage())
        assert (
            await store.update_todo_status(other, todo["id"], "done") is None
        )
        assert (await store.get_meta(ctx))["todo_queue"] == result[
            "todo_queue"
        ]

    asyncio.run(run())


def test_stream_connects_immediately_and_releases_subscription(app_env):
    _, ctx, modules = app_env

    async def run():
        response = await modules["main"].stream(ctx)
        iterator = response.body_iterator
        assert (
            await asyncio.wait_for(anext(iterator), 0.5) == ": connected\n\n"
        )
        await modules["sse"].broadcast(
            {"type": "todo:updated", "todo": {"id": "synthetic"}},
        )
        assert '"type": "todo:updated"' in await asyncio.wait_for(
            anext(iterator),
            0.5,
        )
        await iterator.aclose()
        await asyncio.sleep(0)
        assert modules["sse"]._subscribers == []

    asyncio.run(run())
