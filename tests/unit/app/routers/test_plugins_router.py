# -*- coding: utf-8 -*-
"""Plugin-list publication during incremental backend startup."""

from __future__ import annotations

import asyncio
from types import SimpleNamespace

from qwenpaw.app import _app
from qwenpaw.app.routers import frontend_plugin as frontend_router
from qwenpaw.app.routers import plugins as plugin_router


def _loaded_record(plugin_id: str):
    manifest = SimpleNamespace(
        id=plugin_id,
        name=f"Loaded {plugin_id}",
        version="1.0.0",
        description="loaded",
        author="UGSci",
        plugin_type="general",
        entry=SimpleNamespace(frontend="dist/index.js"),
    )
    return SimpleNamespace(manifest=manifest, enabled=True)


def test_partial_loader_merges_not_yet_loaded_disk_plugins(monkeypatch):
    loader = SimpleNamespace(
        get_all_loaded_plugins=lambda: {"loaded": _loaded_record("loaded")},
    )
    request = SimpleNamespace(
        app=SimpleNamespace(state=SimpleNamespace(plugin_loader=loader)),
    )
    monkeypatch.setattr(
        plugin_router,
        "_list_plugins_from_disk",
        lambda: [
            {"id": "loaded", "loaded": False, "name": "stale"},
            {"id": "pending", "loaded": False, "name": "Pending"},
        ],
    )

    result = asyncio.run(plugin_router.list_plugins(request))

    assert [item["id"] for item in result] == ["loaded", "pending"]
    assert result[0]["loaded"] is True
    assert result[0]["name"] == "Loaded loaded"
    assert result[1]["loaded"] is False


def test_frontend_manifest_exposes_each_loaded_plugin_immediately(
    monkeypatch,
    tmp_path,
):
    record = _loaded_record("ugsci")
    record.source_path = tmp_path
    loader = SimpleNamespace(
        get_all_loaded_plugins=lambda: {"ugsci": record},
    )
    request = SimpleNamespace(
        app=SimpleNamespace(state=SimpleNamespace(plugin_loader=loader)),
    )
    monkeypatch.setattr(
        frontend_router,
        "_frontend_revision",
        lambda *_args: "1.0.0-revision",
    )

    result = asyncio.run(frontend_router.list_frontend_plugins(request))

    assert [item["id"] for item in result] == ["ugsci"]
    assert result[0]["frontend_revision"] == "1.0.0-revision"


def test_bundled_status_reports_incremental_loaded_count():
    loader = SimpleNamespace(
        get_all_loaded_plugins=lambda: {
            "ugsci": object(),
            "ugsci_research": object(),
        },
    )
    state = SimpleNamespace(
        plugin_loader=loader,
        bundled_plugins_status={
            "state": "files_ready",
            "installed": [],
            "error": None,
        },
    )
    request = SimpleNamespace(app=SimpleNamespace(state=state))

    result = _app.get_bundled_plugins_status(request)

    assert result["loaded_count"] == 2
