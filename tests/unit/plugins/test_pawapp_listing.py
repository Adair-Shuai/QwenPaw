# -*- coding: utf-8 -*-
"""Installed applications remain discoverable across runtime failures."""

import json

import httpx
import pytest
from fastapi import FastAPI

from qwenpaw import config as config_module
from qwenpaw.app.routers import pawapps
from qwenpaw.config import Config
from qwenpaw.plugins.architecture import PluginManifest
from qwenpaw.plugins.bundled import mark_plugin_uninstalled
from qwenpaw.plugins.lifecycle import UnloadMode
from qwenpaw.plugins.loader import PluginLoader


def _write_app(root, plugin_id, *, broken=False):
    directory = root / plugin_id
    directory.mkdir(parents=True)
    manifest = PluginManifest.from_dict(
        {
            "id": plugin_id,
            "name": plugin_id,
            "version": "1.0.0",
            "entry": {"backend": "main.py"},
            "meta": {
                "pawapp": {"entry_page": f"/apps/{plugin_id}"},
                "settings": [{"key": "example"}],
            },
        },
    )
    (directory / "plugin.json").write_text(
        manifest.model_dump_json(),
        encoding="utf-8",
    )
    (directory / "main.py").write_text(
        "raise RuntimeError('fixture loading failed')\n"
        if broken
        else "class Plugin:\n    def register(self, api):\n        pass\n"
        "plugin = Plugin()\n",
        encoding="utf-8",
    )
    return manifest, directory


@pytest.mark.asyncio
@pytest.mark.usefixtures("bounded_dependency_environment")
@pytest.mark.parametrize("with_active", [False, True])
async def test_app_listing_merges_failed_disabled_pending_and_active(
    tmp_path,
    monkeypatch,
    fresh_registry,
    with_active,
):
    config = Config(plugins={"disabled-app": {"enabled": False}})
    monkeypatch.setattr(config_module, "load_config", lambda: config)
    monkeypatch.setattr(pawapps, "_get_apps_dir", lambda: tmp_path)
    loader = PluginLoader([tmp_path])
    loader.registry = fresh_registry
    app = FastAPI()
    app.state.plugin_registry = fresh_registry
    app.state.plugin_loader = loader
    app.include_router(pawapps.router, prefix="/api")
    good, good_path = _write_app(tmp_path, "good-app")
    bad, bad_path = _write_app(tmp_path, "failed-app", broken=True)
    _write_app(tmp_path, "disabled-app")
    _write_app(tmp_path, "pending-app")
    try:
        if with_active:
            assert (
                await loader.load_plugin(good, good_path, {})
            ).status == "active"
        assert (await loader.load_plugin(bad, bad_path, {})).status == "failed"
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://fixture",
        ) as client:
            response = await client.get("/api/pawapps")
            assert response.status_code == 200
            rows = {item["id"]: item for item in response.json()["apps"]}
            assert {key: row["status"] for key, row in rows.items()} == {
                "good-app": "active" if with_active else "pending",
                "failed-app": "failed",
                "disabled-app": "disabled",
                "pending-app": "pending",
            }
            assert rows["good-app"]["loaded"] is with_active
            assert rows["failed-app"]["loaded"] is False
            assert rows["failed-app"]["enabled"] is True
            assert "fixture loading failed" in " ".join(
                rows["failed-app"]["diagnostics"],
            )
            assert rows["disabled-app"]["enabled"] is False
            for plugin_id in ("failed-app", "disabled-app", "pending-app"):
                detail = await client.get(f"/api/pawapps/{plugin_id}")
                assert detail.json()["status"] == rows[plugin_id]["status"]
                settings = await client.get(
                    f"/api/pawapps/{plugin_id}/settings",
                )
                assert settings.json()["settings"] == [{"key": "example"}]
    finally:
        await loader.lifecycle.unload_all(UnloadMode.SHUTDOWN)


@pytest.mark.asyncio
@pytest.mark.parametrize("typed_only", [False, True])
async def test_app_listing_excludes_backups_removed_and_malformed_manifests(
    tmp_path,
    monkeypatch,
    typed_only,
):
    monkeypatch.setattr(config_module, "load_config", Config)
    monkeypatch.setattr(pawapps, "_get_apps_dir", lambda: tmp_path)
    _, pending_path = _write_app(tmp_path, "pending-app")
    if typed_only:
        manifest_path = pending_path / "plugin.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        manifest["type"] = "app"
        manifest.pop("meta", None)
        manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
    _write_app(tmp_path, "removed-app")
    mark_plugin_uninstalled("removed-app", plugins_dir=tmp_path)
    _, backup = _write_app(tmp_path, "backup-app")
    backup.rename(tmp_path / ".backup-app.previous")
    invalid = tmp_path / "malformed"
    invalid.mkdir()
    (invalid / "plugin.json").write_text(json.dumps(["invalid"]))
    for index, bad_id in enumerate((["broken"], {"broken": True}, None, "")):
        bad = tmp_path / f"invalid-id-{index}"
        bad.mkdir()
        (bad / "plugin.json").write_text(
            json.dumps({"id": bad_id, "type": "app", "version": "1.0.0"}),
            encoding="utf-8",
        )
    app = FastAPI()
    app.include_router(pawapps.router, prefix="/api")
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://fixture",
    ) as client:
        response = await client.get("/api/pawapps")
    assert response.status_code == 200
    assert [item["id"] for item in response.json()["apps"]] == ["pending-app"]
    assert response.json()["apps"][0]["loaded"] is False
