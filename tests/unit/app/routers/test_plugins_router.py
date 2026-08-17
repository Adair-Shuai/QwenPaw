# -*- coding: utf-8 -*-
# pylint: disable=protected-access
"""Plugin-list publication during incremental backend startup."""

from __future__ import annotations

import asyncio
import hashlib
import json
import shutil
import zipfile
from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from qwenpaw.app import _app
from qwenpaw.app.routers import frontend_plugin as frontend_router
from qwenpaw.app.routers import plugins as plugin_router
from qwenpaw.plugins.loader import PluginLoader


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


def _write_plugin_zip(path, *, plugin_id="external-plugin", version="2.0.0"):
    manifest = {
        "id": plugin_id,
        "name": "External Plugin",
        "version": version,
        "type": "general",
        "entry": {},
    }
    with zipfile.ZipFile(path, "w") as archive:
        archive.writestr(
            f"{plugin_id}/plugin.json",
            json.dumps(manifest),
        )
        archive.writestr(f"{plugin_id}/main.py", "VALUE = 2\n")


def test_external_upgrade_archive_must_match_catalog_entry(tmp_path):
    archive = tmp_path / "plugin.zip"
    _write_plugin_zip(archive, plugin_id="actual-plugin")

    with pytest.raises(ValueError, match="Plugin id does not match"):
        plugin_router._validate_upgrade_archive(
            archive,
            expected_plugin_id="selected-plugin",
            expected_version="2.0.0",
        )


def test_replace_installed_plugin_uses_backend_lifecycle(
    monkeypatch,
    tmp_path,
):
    plugins_dir = tmp_path / "plugins"
    installed = plugins_dir / "external-plugin"
    installed.mkdir(parents=True)
    (installed / "plugin.json").write_text(
        json.dumps({"id": "external-plugin", "version": "1.0.0"}),
        encoding="utf-8",
    )
    archive = tmp_path / "external-plugin.zip"
    _write_plugin_zip(archive)
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()

    async def fake_download(_source, destination):
        shutil.copyfile(archive, destination)

    calls = []

    async def fake_load(loader, request, source_path, *, force):
        calls.append((loader, request, source_path, force))
        return SimpleNamespace(
            manifest=SimpleNamespace(
                id="external-plugin",
                name="External Plugin",
                version="2.0.0",
            ),
        )

    from qwenpaw.config import utils as config_utils

    monkeypatch.setattr(config_utils, "get_plugins_dir", lambda: plugins_dir)
    monkeypatch.setattr(plugin_router, "_async_download", fake_download)
    monkeypatch.setattr(
        plugin_router,
        "_load_plugin_with_optional_force_reinstall",
        fake_load,
    )
    loader = object()
    request = SimpleNamespace(
        app=SimpleNamespace(state=SimpleNamespace(plugin_loader=loader)),
    )

    result = asyncio.run(
        plugin_router.replace_installed_plugin(
            plugin_router.ReplacePluginRequest(
                source=(
                    "https://download.qwenpaw.agentscope.io/"
                    "external-plugin.zip"
                ),
                plugin_id="external-plugin",
                version="2.0.0",
                sha256=digest,
            ),
            request,
        ),
    )

    assert result["id"] == "external-plugin"
    assert result["version"] == "2.0.0"
    assert result["restart_required"] is True
    assert len(calls) == 1
    assert calls[0][3] is True
    backup = result["backup_path"]
    assert backup is not None
    with open(f"{backup}/plugin.json", encoding="utf-8") as handle:
        assert json.load(handle)["version"] == "1.0.0"


def test_replace_installed_plugin_rejects_unapproved_host():
    request = SimpleNamespace(
        app=SimpleNamespace(state=SimpleNamespace(plugin_loader=object())),
    )

    with pytest.raises(HTTPException) as caught:
        asyncio.run(
            plugin_router.replace_installed_plugin(
                plugin_router.ReplacePluginRequest(
                    source="https://example.com/plugin.zip",
                    plugin_id="external-plugin",
                ),
                request,
            ),
        )

    assert caught.value.status_code == 400
    assert "approved external catalog" in caught.value.detail


def test_replace_installed_plugin_full_isolated_lifecycle(
    monkeypatch,
    tmp_path,
):
    """Exercise ZIP verification, backup, disk swap and real hot reload."""
    plugin_id = "isolated-upgrade-lifecycle"
    plugins_dir = tmp_path / "plugins"
    installed = plugins_dir / plugin_id
    (installed / "dist").mkdir(parents=True)
    (installed / "plugin.json").write_text(
        json.dumps(
            {
                "id": plugin_id,
                "name": "Isolated Upgrade Lifecycle",
                "version": "1.0.0",
                "type": "general",
                "qwenpaw_version": {"min": "2.0.0", "max": "3.0.0"},
                "entry": {"frontend": "dist/index.js"},
            },
        ),
        encoding="utf-8",
    )
    (installed / "dist" / "index.js").write_text(
        "export const version = '1.0.0';\n",
        encoding="utf-8",
    )
    archive = tmp_path / "upgrade.zip"
    with zipfile.ZipFile(archive, "w") as bundle:
        bundle.writestr(
            f"{plugin_id}/plugin.json",
            json.dumps(
                {
                    "id": plugin_id,
                    "name": "Isolated Upgrade Lifecycle",
                    "version": "1.1.0",
                    "type": "general",
                    "qwenpaw_version": {"min": "2.0.0", "max": "3.0.0"},
                    "entry": {"frontend": "dist/index.js"},
                },
            ),
        )
        bundle.writestr(
            f"{plugin_id}/dist/index.js",
            "export const version = '1.1.0';\n",
        )
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()

    async def fake_download(_source, destination):
        shutil.copyfile(archive, destination)

    async def no_reload(_request):
        return None

    async def no_post_load(_request, _plugin_id):
        return None

    from qwenpaw.config import utils as config_utils

    monkeypatch.setattr(config_utils, "get_plugins_dir", lambda: plugins_dir)
    monkeypatch.setattr(plugin_router, "_async_download", fake_download)
    monkeypatch.setattr(
        plugin_router,
        "_schedule_all_agents_reload",
        no_reload,
    )
    monkeypatch.setattr(plugin_router, "_post_load_setup", no_post_load)
    loader = PluginLoader([plugins_dir])
    initial = asyncio.run(
        loader.load_plugin_from_path(installed, install_dir=plugins_dir),
    )
    assert initial.manifest.version == "1.0.0"
    request = SimpleNamespace(
        app=SimpleNamespace(state=SimpleNamespace(plugin_loader=loader)),
    )

    result = asyncio.run(
        plugin_router.replace_installed_plugin(
            plugin_router.ReplacePluginRequest(
                source=(
                    "https://download.qwenpaw.agentscope.io/"
                    "isolated-upgrade-lifecycle-1.1.0.zip"
                ),
                plugin_id=plugin_id,
                version="1.1.0",
                sha256=digest,
            ),
            request,
        ),
    )

    assert result["version"] == "1.1.0"
    assert loader.get_loaded_plugin(plugin_id).manifest.version == "1.1.0"
    assert (
        json.loads((installed / "plugin.json").read_text(encoding="utf-8"))[
            "version"
        ]
        == "1.1.0"
    )
    assert "1.1.0" in (installed / "dist" / "index.js").read_text(
        encoding="utf-8",
    )
    backup = Path(result["backup_path"])
    assert (
        json.loads((backup / "plugin.json").read_text(encoding="utf-8"))[
            "version"
        ]
        == "1.0.0"
    )
