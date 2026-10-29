# -*- coding: utf-8 -*-
# pylint: disable=no-name-in-module
# pylint: disable=protected-access
# pylint: disable=redefined-outer-name
# pylint: disable=wrong-import-position
from __future__ import annotations

import asyncio
import copy
import importlib.util
import sys
import threading
from concurrent.futures import ThreadPoolExecutor
from datetime import date, timedelta
from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from plugins.apps.uproject.backend.ai import (
    extract_items_from_notes,
    fallback_agenda,
    fallback_weekly,
)
from plugins.apps.uproject.backend.store import (
    annotate_project,
    build_demo_state,
    create_project,
    ensure_seeded,
    get_project_bundle,
    list_projects,
    reset_demo,
)

REPO = Path(__file__).resolve().parents[3]
PLUGIN_ROOT = REPO / "plugins" / "apps" / "uproject"


class _MemStore:
    def __init__(self) -> None:
        self._data = {}

    async def get(self, key, default=None):
        return self._data.get(key, default)

    async def set(self, key, value):
        self._data[key] = value


class _Ctx:
    def __init__(self):
        self.storage = _MemStore()


def test_demo_scenes_have_client_and_vendor():
    state = build_demo_state()
    assert len(state["projects"]) == 2
    names = {p["name"] for p in state["projects"]}
    assert (
        "\u50a8\u6c14\u5e93\u6570\u503c\u6a21\u62df\u6280\u672f\u670d\u52a1"
        in names
    )
    assert (
        "\u9875\u5ca9\u6c14\u538b\u88c2\u6548\u679c\u8bc4\u4ef7\u4e13\u9898"
        in names
    )
    for project in state["projects"]:
        assert project["client"]["org"]
        assert project["vendor"]["org"]
        assert project["sow"]
    assert any(i["status"] == "blocked" for i in state["items"])
    assert any(i["status"] == "agreed" for i in state["items"])


def test_annotate_counts_alignment_items():
    state = build_demo_state()
    first = annotate_project(state["projects"][0], state)
    assert first["open_count"] >= 1
    assert first["blocked_count"] >= 1


def test_seed_once_then_create_project():
    async def _run():
        ctx = _Ctx()
        seeded = await ensure_seeded(ctx)
        assert seeded["seeded"] is True
        again = await ensure_seeded(ctx)
        assert len(again["projects"]) == 2
        created = await asyncio.wait_for(
            create_project(
                ctx,
                {
                    "name": "\u5ba4\u5185\u5ca9\u5fc3\u9a71\u66ff\u4e13\u9898",
                    "client": {
                        "org": "\u6cb9\u7530\u7814\u7a76\u9662",
                        "contact": "Zhou",
                    },
                    "vendor": {
                        "org": "\u6211\u65b9\u5b9e\u9a8c\u5ba4",
                        "contact": "Wu",
                    },
                    "sow": "SOW",
                },
            ),
            timeout=1,
        )
        assert created["id"].startswith("proj_")
        projects = await list_projects(ctx)
        assert len(projects) == 3
        bundle = await get_project_bundle(ctx, created["id"])
        assert bundle is not None
        assert (
            bundle["project"]["client"]["org"]
            == "\u6cb9\u7530\u7814\u7a76\u9662"
        )

    asyncio.run(_run())


def test_create_project_seeds_empty_store_without_deadlock():
    async def _run():
        ctx = _Ctx()
        created = await asyncio.wait_for(
            create_project(ctx, {"name": "first"}),
            timeout=1,
        )
        projects = await list_projects(ctx)
        assert created["name"] == "first"
        assert len(projects) == 3

    asyncio.run(_run())


def test_reset_demo_replaces_user_data():
    async def _run():
        ctx = _Ctx()
        await ensure_seeded(ctx)
        await create_project(ctx, {"name": "tmp"})
        state = await reset_demo(ctx)
        assert len(state["projects"]) == 2
        names = {p["name"] for p in state["projects"]}
        assert "tmp" not in names

    asyncio.run(_run())


def test_fallback_agenda_lists_open_and_blocked():
    state = build_demo_state()
    pid = state["projects"][0]["id"]
    bundle = {
        "project": state["projects"][0],
        "items": [i for i in state["items"] if i["project_id"] == pid],
        "milestones": [
            m for m in state["milestones"] if m["project_id"] == pid
        ],
        "meetings": [],
    }
    text = fallback_agenda(bundle)
    assert "\u5bf9\u9f50\u4f1a\u8bae\u7a0b" in text
    assert "\u5386\u53f2\u4e95\u8f68\u8ff9" in text
    assert "\u5b89\u5168\u51c6\u5165" in text


def test_fallback_weekly_asks_client_to_decide():
    state = build_demo_state()
    pid = state["projects"][0]["id"]
    bundle = {
        "project": state["projects"][0],
        "items": [i for i in state["items"] if i["project_id"] == pid],
        "milestones": [],
        "meetings": [],
    }
    text = fallback_weekly(bundle)
    assert "\u5468\u62a5" in text
    assert "\u9700\u8981\u7532\u65b9\u62cd\u677f" in text


def test_extract_items_from_notes_classifies_owner_and_status():
    notes = chr(10).join(
        [
            (
                "\u7532\u65b9\u9700\u672c\u5468\u4e94"
                "\u8865\u9f50 4 \u53e3\u4e95\u66f2\u7ebf"
            ),
            "\u9a8c\u6536\u6307\u6807\u4ecd\u672a\u7b7e\u5b57",
            (
                "\u5b89\u5168\u51c6\u5165\u672a\u6279"
                "\uff0c\u5361\u7740\u8fdb\u573a"
            ),
            (
                "\u7f1d\u63a7\u50a8\u91cf\u7b97\u6cd5"
                "\u5df2\u786e\u8ba4\u7ef4\u6301\u4f53\u79ef\u6cd5"
            ),
        ],
    )
    items = extract_items_from_notes(notes, "proj_x")
    assert len(items) == 4
    assert any(i["owner_side"] == "client" for i in items)
    assert any(i["status"] == "blocked" for i in items)
    assert any(i["status"] == "agreed" for i in items)
    assert any(i["kind"] == "acceptance" for i in items)


def test_store_import_ignores_cached_uideas_store(monkeypatch):
    import importlib
    import types

    import plugins.apps.uproject.backend.store as uproject_store

    fake = types.ModuleType("store")
    monkeypatch.setitem(sys.modules, "store", fake)
    uproject_store = importlib.reload(uproject_store)
    assert hasattr(uproject_store, "create_project")
    assert hasattr(uproject_store, "build_demo_state")


@pytest.fixture
def http_env(tmp_path, monkeypatch):
    """Real routes, PawApp storage adapter and atomic JSON persistence."""
    from qwenpaw.app.chats.session import SafeJSONSession
    from qwenpaw.pawapp.context import AppStorage

    name = "plugin_uproject_regression"
    spec = importlib.util.spec_from_file_location(
        name,
        PLUGIN_ROOT / "backend/main.py",
        submodule_search_locations=[str(PLUGIN_ROOT)],
    )
    module = importlib.util.module_from_spec(spec)
    monkeypatch.setitem(sys.modules, name, module)
    spec.loader.exec_module(module)
    for suffix in ("backend", "backend.store", "backend.ai"):
        monkeypatch.setitem(
            sys.modules,
            f"{name}.{suffix}",
            sys.modules[f"{name}.{suffix}"],
        )
    session = SafeJSONSession(save_dir=str(tmp_path))
    ctx = SimpleNamespace(storage=AppStorage(session, "pawapp:uproject"))
    app = FastAPI()
    app.include_router(module.router, prefix="/api/uproject")
    app.dependency_overrides[module.get_ctx] = lambda: ctx
    with TestClient(app) as client:
        yield client, ctx, sys.modules[f"{name}.backend.store"], tmp_path


def _http_project(client, name="合成科研项目"):
    response = client.post("/api/uproject/projects", json={"name": name})
    assert response.status_code == 200, response.text
    return response.json()["project"]["id"]


def _http_item(client, project_id, title="整理资料", **fields):
    response = client.post(
        f"/api/uproject/projects/{project_id}/items",
        json={"title": title, **fields},
    )
    assert response.status_code == 200, response.text
    return response.json()["item"]


def test_http_work_planning_fields_statistics_activity_and_disk_roundtrip(
    http_env,
):
    client, _, store, directory = http_env
    pid = _http_project(client)
    milestone = client.post(
        f"/api/uproject/projects/{pid}/milestones",
        json={"title": "阶段验收", "due_date": "2030-01-01"},
    ).json()["milestone"]
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    task = _http_item(
        client,
        pid,
        priority="urgent",
        assignee="研究员甲",
        due_date=yesterday,
        milestone_id=milestone["id"],
    )
    done = _http_item(
        client,
        pid,
        "已对齐事项",
        status="agreed",
        priority="high",
        due_date=yesterday,
    )
    _http_item(
        client,
        pid,
        "暂缓事项",
        status="deferred",
        priority="high",
        due_date=yesterday,
    )
    bundle = client.get(f"/api/uproject/projects/{pid}").json()
    project = bundle["project"]
    assert (
        project["item_count"],
        project["completion_percent"],
        project["overdue_count"],
        project["high_priority_count"],
    ) == (3, 33, 1, 1)
    assert project["agreed_count"] == 1 and project["open_count"] == 1
    assert task["priority"] == "urgent" and task["assignee"] == "研究员甲"
    assert task["milestone_id"] == milestone["id"] and task["depends_on"] == []
    route = f"/api/uproject/items/{task['id']}"
    assert (
        client.patch(
            route,
            json={
                "title": "完成资料质检",
                "priority": "low",
                "milestone_id": None,
                "depends_on": [done["id"]],
            },
        ).status_code
        == 200
    )
    activity = client.get(f"/api/uproject/projects/{pid}").json()["activity"]
    assert activity[0]["changes"]["title"] == {
        "before": "整理资料",
        "after": "完成资料质检",
    }
    assert (
        activity[0]["entity_id"] == task["id"]
        and "更新事项" in activity[0]["summary"]
    )
    assert {event["entity_type"] for event in activity} == {
        "project",
        "item",
        "milestone",
    }
    from qwenpaw.app.chats.session import SafeJSONSession
    from qwenpaw.pawapp.context import AppStorage

    reopened = SimpleNamespace(
        storage=AppStorage(
            SafeJSONSession(save_dir=str(directory)),
            "pawapp:uproject",
        ),
    )
    persisted = asyncio.run(store.get_project_bundle(reopened, pid))
    actual = next(row for row in persisted["items"] if row["id"] == task["id"])
    assert actual["title"] == "完成资料质检" and actual["milestone_id"] is None
    assert persisted["activity"] == activity


def test_http_dependency_integrity_and_completion_gate(http_env):
    client, _, _, _ = http_env
    pid = _http_project(client)
    other = _http_project(client, "另一个项目")
    upstream = _http_item(client, pid, "数据交接")
    middle = _http_item(client, pid, "网格建模", depends_on=[upstream["id"]])
    downstream = _http_item(client, pid, "模型验收", depends_on=[middle["id"]])
    foreign = _http_item(client, other)
    route = f"/api/uproject/items/{upstream['id']}"
    for refs in (
        [upstream["id"]],
        [downstream["id"]],
        [foreign["id"]],
        ["missing"],
    ):
        assert (
            client.patch(route, json={"depends_on": refs}).status_code == 400
        )
    assert (
        client.patch(
            f"/api/uproject/items/{middle['id']}",
            json={"status": "agreed"},
        ).status_code
        == 400
    )
    assert client.patch(route, json={"status": "agreed"}).status_code == 200
    assert (
        client.patch(
            f"/api/uproject/items/{middle['id']}",
            json={"status": "agreed"},
        ).status_code
        == 200
    )
    reopened = client.patch(route, json={"status": "open"})
    assert reopened.status_code == 400 and "下游" in reopened.json()["detail"]
    bundle = client.get(f"/api/uproject/projects/{pid}").json()
    assert (
        next(row for row in bundle["items"] if row["id"] == upstream["id"])[
            "status"
        ]
        == "agreed"
    )


def test_http_rejects_invalid_fields_without_partial_writes(http_env):
    client, _, _, _ = http_env
    pid = _http_project(client)
    task = _http_item(client, pid)
    original = client.get(f"/api/uproject/projects/{pid}").json()
    for patch in (
        {"title": "  "},
        {"priority": "critical"},
        {"priority": None},
        {"due_date": "2026-02-30"},
        {"due_date": "20261028"},
        {"assignee": None},
        {"depends_on": None},
        {"status": ""},
        {"kind": "invalid"},
        {"owner_side": "unknown"},
    ):
        response = client.patch(
            f"/api/uproject/items/{task['id']}",
            json={**patch, "detail": "不得部分保存"},
        )
        assert response.status_code == 400, response.text
        assert client.get(f"/api/uproject/projects/{pid}").json() == original
    for body in (
        {"name": "  "},
        {"name": "异常", "status": "invalid"},
        {"name": "异常", "start_date": "2026-12-01", "end_date": "2026-01-01"},
    ):
        assert (
            client.post("/api/uproject/projects", json=body).status_code == 400
        )
    assert (
        client.patch(
            f"/api/uproject/projects/{pid}",
            json={"name": "  "},
        ).status_code
        == 400
    )
    assert (
        client.post(
            f"/api/uproject/projects/{pid}/milestones",
            json={"title": "日期错误", "due_date": "明天"},
        ).status_code
        == 400
    )
    assert (
        client.post(
            f"/api/uproject/projects/{pid}/meetings",
            json={"title": "会议", "held_at": "2026-02-30"},
        ).status_code
        == 400
    )
    assert (
        client.patch(
            "/api/uproject/items/missing",
            json={"status": "agreed"},
        ).status_code
        == 404
    )


def test_http_deletion_cleans_dependencies_and_milestone_links(http_env):
    client, ctx, store, _ = http_env
    pid = _http_project(client)
    other = _http_project(client, "独立项目")
    upstream = _http_item(client, pid)
    milestone = client.post(
        f"/api/uproject/projects/{pid}/milestones",
        json={"title": "阶段评审"},
    ).json()["milestone"]
    foreign_milestone = client.post(
        f"/api/uproject/projects/{other}/milestones",
        json={"title": "其他里程碑"},
    ).json()["milestone"]
    dependent = _http_item(
        client,
        pid,
        "数据核验",
        depends_on=[upstream["id"]],
        milestone_id=milestone["id"],
    )
    assert (
        client.patch(
            f"/api/uproject/items/{dependent['id']}",
            json={"milestone_id": foreign_milestone["id"]},
        ).status_code
        == 400
    )
    assert (
        client.delete(f"/api/uproject/items/{upstream['id']}").status_code
        == 200
    )
    assert (
        client.delete(
            f"/api/uproject/milestones/{milestone['id']}",
        ).status_code
        == 200
    )
    bundle = client.get(f"/api/uproject/projects/{pid}").json()
    assert (
        bundle["items"][0]["depends_on"] == []
        and bundle["items"][0]["milestone_id"] is None
    )
    assert (
        len([row for row in bundle["activity"] if row["action"] == "delete"])
        == 2
    )
    assert (
        len([row for row in bundle["activity"] if "清理事项" in row["summary"]])
        == 2
    )
    assert client.delete(f"/api/uproject/projects/{pid}").status_code == 200
    assert client.get(f"/api/uproject/projects/{pid}").status_code == 404
    state = asyncio.run(store.get_state(ctx))
    for key in ("items", "milestones", "meetings", "briefs"):
        assert not any(row["project_id"] == pid for row in state[key])
    assert any(
        row["project_id"] == pid
        and row["entity_type"] == "project"
        and row["action"] == "delete"
        for row in state["activity"]
    )
    assert client.get(f"/api/uproject/projects/{other}").status_code == 200


def test_store_legacy_defaults_atomic_validation_and_failed_save():
    from plugins.apps.uproject.backend import store

    async def run():
        ctx = _Ctx()
        await ensure_seeded(ctx)
        legacy = ctx.storage._data["state"]["items"][0]
        for key in (
            "priority",
            "assignee",
            "due_date",
            "milestone_id",
            "depends_on",
        ):
            legacy.pop(key, None)
        before = copy.deepcopy(ctx.storage._data)
        with pytest.raises(store.ValidationError):
            await store.patch_child(
                ctx,
                "items",
                legacy["id"],
                {"title": "不应保存", "priority": "invalid"},
            )
        assert ctx.storage._data == before
        normalized = await store.get_state(ctx)
        assert normalized["items"][0]["priority"] == "normal"
        assert normalized["items"][0]["depends_on"] == []
        row = {**legacy, "id": "test_atomic", "title": "合法事项"}
        invalid = {**row, "id": "invalid", "title": " "}
        with pytest.raises(store.ValidationError):
            await store.add_children(
                ctx,
                "items",
                legacy["project_id"],
                [row, invalid],
            )
        assert ctx.storage._data == before

        async def fail_save(key, value):
            raise OSError("synthetic disk error")

        ctx.storage.set = fail_save
        with pytest.raises(OSError):
            await store.patch_child(
                ctx,
                "items",
                legacy["id"],
                {"title": "写入失败"},
            )
        assert ctx.storage._data == before

    asyncio.run(run())


def test_real_storage_concurrent_mutations_preserve_all_items_and_history(
    http_env,
):
    client, ctx, store, _ = http_env
    pid = _http_project(client)

    async def run():
        async def add(index):
            return await store.add_child(
                ctx,
                "items",
                pid,
                {
                    "id": f"concurrent_{index}",
                    "project_id": pid,
                    "title": f"并发事项 {index}",
                    "kind": "scope",
                    "owner_side": "both",
                    "status": "open",
                },
            )

        rows = await asyncio.gather(*(add(index) for index in range(16)))
        await asyncio.gather(
            *(
                store.patch_child(
                    ctx,
                    "items",
                    row["id"],
                    {"assignee": f"成员 {index}"},
                )
                for index, row in enumerate(rows)
            ),
            store.update_project(ctx, pid, {"notes": "并发项目说明"}),
        )
        result = await store.get_project_bundle(ctx, pid)
        assert len(result["items"]) == 16
        assert (
            len(result["activity"]) == 34
        )  # project create, 16 creates, 17 updates
        assert result["project"]["notes"] == "并发项目说明"
        assert {row["assignee"] for row in result["items"]} == {
            f"成员 {index}" for index in range(16)
        }

    asyncio.run(run())


def test_http_minutes_agenda_weekly_preserve_planning_context(http_env):
    client, _, _, _ = http_env
    pid = _http_project(client)
    upstream = _http_item(client, pid, "甲方交付井数据")
    _http_item(
        client,
        pid,
        "地质建模",
        priority="urgent",
        assignee="合成负责人",
        due_date="2030-04-05",
        depends_on=[upstream["id"]],
    )
    base = f"/api/uproject/projects/{pid}"
    preview = client.post(
        f"{base}/ai/minutes",
        json={"notes": "甲方需补齐井曲线", "apply": False},
    )
    assert (
        preview.status_code == 200
        and len(client.get(base).json()["items"]) == 2
    )
    applied = client.post(
        f"{base}/ai/minutes",
        json={"notes": "甲方需补齐井曲线", "apply": True},
    ).json()
    assert (
        applied["source"] == "fallback"
        and applied["items"][0]["priority"] == "normal"
    )
    assert len(client.get(base).json()["items"]) == 3
    for kind in ("agenda", "weekly"):
        response = client.post(f"{base}/ai/{kind}")
        assert response.status_code == 200, response.text
        content = response.json()["content"]
        for expected in (
            "合成负责人",
            "2030-04-05",
            "紧急",
            "前置依赖",
            "甲方交付井数据",
        ):
            assert expected in content
        if kind == "weekly":
            assert "当前台账快照" in content and "## 本周进展" not in content
    assert len(client.get(base).json()["briefs"]) == 4


@pytest.mark.parametrize("kind", ["agenda", "weekly", "minutes"])
@pytest.mark.parametrize("mutation", ["reset", "delete"])
def test_http_pending_ai_cannot_write_after_demo_reset(
    http_env,
    kind,
    mutation,
):
    """Hold the external chat reply while real HTTP changes persisted data."""
    client, ctx, store, _ = http_env
    pid = "proj_gas_storage"
    base = f"/api/uproject/projects/{pid}"
    initial = client.get(base).json()
    started, release = threading.Event(), threading.Event()

    # pylint: disable-next=unused-argument
    async def chat(prompt):
        started.set()
        assert await asyncio.to_thread(release.wait, 10)
        if kind == "minutes":
            return SimpleNamespace(
                text='{"items":[{"title":"重置前的合成事项",'
                '"kind":"scope","owner_side":"both","status":"open"}]}',
            )
        return SimpleNamespace(text="重置前的合成文稿，仅用于验证迟到的模型输出。" * 4)

    ctx.chat = chat
    with ThreadPoolExecutor(max_workers=1) as executor:
        request = executor.submit(
            client.post,
            f"{base}/ai/{kind}",
            json=(
                {"notes": "重置前的会议记录", "apply": True}
                if kind == "minutes"
                else None
            ),
        )
        try:
            assert started.wait(10), "AI route did not reach chat barrier"
            if mutation == "reset":
                assert (
                    client.post("/api/uproject/demo/reset").status_code == 200
                )
                reset = client.get(base).json()
                assert reset["_generation"] != initial["_generation"]
            else:
                assert client.delete(base).status_code == 200
            expected = asyncio.run(store.get_state(ctx))
        finally:
            release.set()
        response = request.result(timeout=10)
    assert response.status_code == 400, response.text
    assert ("重置" if mutation == "reset" else "删除") in response.json()["detail"]
    assert asyncio.run(store.get_state(ctx)) == expected


def test_http_minutes_commit_is_atomic_on_storage_failure(
    http_env,
    monkeypatch,
):
    client, ctx, _, _ = http_env
    pid = _http_project(client)
    base = f"/api/uproject/projects/{pid}"
    before = client.get(base).json()
    original_set = ctx.storage.set
    fail = {"enabled": True}

    async def set_with_failure(key, value):
        if fail["enabled"] and value.get("briefs"):
            raise OSError("synthetic brief persistence failure")
        await original_set(key, value)

    monkeypatch.setattr(ctx.storage, "set", set_with_failure)
    with pytest.raises(OSError, match="synthetic brief persistence failure"):
        client.post(
            f"{base}/ai/minutes",
            json={"notes": "甲方需补齐合成井数据", "apply": True},
        )
    assert client.get(base).json() == before
    fail["enabled"] = False
    assert (
        client.post(
            f"{base}/ai/minutes",
            json={"notes": "甲方需补齐合成井数据", "apply": True},
        ).status_code
        == 200
    )
    saved = client.get(base).json()
    assert len(saved["items"]) == 1 and len(saved["briefs"]) == 1
    assert len(saved["activity"]) == len(before["activity"]) + 2


def test_legacy_generation_is_stable_and_last_project_deletion_stays_empty(
    http_env,
):
    client, ctx, store, _ = http_env
    client.get("/api/uproject/projects")
    legacy = asyncio.run(store.get_state(ctx))
    legacy.pop("generation")
    asyncio.run(store.save_state(ctx, legacy))
    first = client.get("/api/uproject/projects/proj_gas_storage").json()
    again = client.get("/api/uproject/projects/proj_gas_storage").json()
    assert (
        first["_generation"] and first["_generation"] == again["_generation"]
    )
    assert (
        asyncio.run(store.get_state(ctx))["generation"] == first["_generation"]
    )
    for project in legacy["projects"]:
        assert (
            client.delete(
                f"/api/uproject/projects/{project['id']}",
            ).status_code
            == 200
        )
    assert client.get("/api/uproject/projects").json()["projects"] == []
    assert (
        asyncio.run(store.get_state(ctx))["generation"] == first["_generation"]
    )
