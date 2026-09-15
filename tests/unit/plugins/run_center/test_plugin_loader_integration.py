# -*- coding: utf-8 -*-
"""Exercise Run Center through the real PluginLoader namespace path."""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest


@pytest.mark.asyncio
async def test_loader_mounts_run_center_and_runs_startup_sync(
    tmp_path, monkeypatch
) -> None:
    from qwenpaw.plugins.loader import PluginLoader
    from qwenpaw.plugins.registry import PluginRegistry

    old_registry = PluginRegistry._instance
    PluginRegistry._instance = None
    try:
        registry = PluginRegistry()
        app = FastAPI()
        registry.set_plugin_http_app(app)
        loader = PluginLoader(plugin_dirs=[tmp_path / "plugins"])
        loader.registry = registry
        monkeypatch.setattr("qwenpaw.constant.WORKING_DIR", tmp_path)

        # The test file lives under <repo>/tests/unit/plugins/run_center.
        source = (
            Path(__file__).parents[4]
            / "plugins"
            / "bundle"
            / "qwenpaw-run-center"
        )
        source = source.resolve()
        record = await loader.load_plugin_from_path(
            source, install_dir=tmp_path / "plugins"
        )
        assert record.manifest.id == "qwenpaw-run-center"

        startup = registry.get_startup_hooks()
        assert any(
            hook.hook_name == "run_center_initialize" for hook in startup
        )
        record.instance._on_startup()  # noqa: SLF001 - integration assertion

        with TestClient(app) as client:
            health = client.get("/api/run-center/health")
        assert health.status_code == 200
        assert health.json()["plugin_id"] == "qwenpaw-run-center"

        await loader.unload_plugin("qwenpaw-run-center")
        assert not any(
            registration.plugin_id == "qwenpaw-run-center"
            for registration in registry.get_http_router_registrations()
        )
    finally:
        PluginRegistry._instance = old_registry
