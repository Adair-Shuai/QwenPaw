# -*- coding: utf-8 -*-
# pylint: disable=wrong-import-position
from __future__ import annotations

import asyncio
import sys
from pathlib import Path

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
