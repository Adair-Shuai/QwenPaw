# -*- coding: utf-8 -*-
"""Persistent uninstall intent across API/CLI removal and restart."""

from __future__ import annotations

import json
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest
from click.testing import CliRunner
from fastapi import HTTPException

from qwenpaw.app.routers import plugins as plugin_router
from qwenpaw.cli import plugin_commands
from qwenpaw.plugins import bundled
from qwenpaw.plugins.loader import PluginLoader


def _write_plugin(directory, plugin_id: str = "demo") -> None:
    directory.mkdir(parents=True)
    (directory / "plugin.json").write_text(
        json.dumps(
            {
                "id": plugin_id,
                "name": "Demo",
                "version": "1.0.0",
                "entry": {"frontend": "index.js"},
            },
        ),
        encoding="utf-8",
    )
    (directory / "index.js").write_text("// demo\n", encoding="utf-8")


def _assert_restart_does_not_restore(monkeypatch, plugins, source_root):
    monkeypatch.setattr(
        bundled,
        "_get_bundled_plugins_dirs",
        lambda: [source_root],
    )
    monkeypatch.setattr(
        "qwenpaw.config.utils.get_plugins_dir",
        lambda: plugins,
    )
    assert not bundled.ensure_bundled_plugins_installed()
    assert not (plugins / "demo").exists()


@pytest.fixture(name="native_install")
async def _native_install_fixture(tmp_path, monkeypatch, fresh_registry):
    from qwenpaw.components import service

    work = tmp_path / "work"
    monkeypatch.setattr("qwenpaw.constant.WORKING_DIR", work)
    monkeypatch.setattr("qwenpaw.config.utils.WORKING_DIR", work)
    plugins = tmp_path / "plugins"
    source_root = tmp_path / "bundle"
    source = source_root / "demo"
    _write_plugin(source)
    monkeypatch.setattr(
        "qwenpaw.config.utils.get_plugins_dir",
        lambda: plugins,
    )
    adoption = {"demo": True}
    monkeypatch.setattr(
        service,
        "is_component_update_adopted",
        lambda name: adoption.get(name, False),
    )
    monkeypatch.setattr(
        service,
        "set_component_update_adoption",
        lambda name, value: adoption.update({name: value}),
    )
    loader = PluginLoader([plugins])
    loader.registry = fresh_registry
    await loader.load_plugin_from_path(source)
    request = SimpleNamespace(
        app=SimpleNamespace(state=SimpleNamespace(plugin_loader=loader)),
    )
    try:
        yield loader, request, plugins, source_root, adoption
    finally:
        if loader.get_loaded_plugin("demo") is not None:
            await loader.unload_plugin("demo")


@pytest.mark.asyncio
async def test_api_uninstall_persists_tombstone_before_deleting(
    native_install,
    monkeypatch,
):
    from qwenpaw.plugins import loader as loader_module

    loader, request, plugins, source_root, adoption = native_install
    original = loader_module.safe_remove
    observed = []

    def remove(path, **kwargs):
        if path == plugins / "demo":
            observed.append((plugins / ".uninstalled/demo").is_file())
        return original(path, **kwargs)

    monkeypatch.setattr(loader_module, "safe_remove", remove)
    assert (await plugin_router.uninstall_plugin("demo", request))[
        "id"
    ] == "demo"
    assert observed == [True]
    assert not adoption["demo"]
    _assert_restart_does_not_restore(monkeypatch, plugins, source_root)


@pytest.mark.asyncio
async def test_api_uninstall_restores_adoption_when_delete_fails(
    native_install,
    monkeypatch,
):
    loader, request, plugins, _source, adoption = native_install
    monkeypatch.setattr(
        "qwenpaw.plugins.loader.safe_remove",
        MagicMock(side_effect=OSError("locked")),
    )
    with pytest.raises(HTTPException, match="locked"):
        await plugin_router.uninstall_plugin("demo", request)
    assert adoption["demo"]
    assert (plugins / "demo").is_dir()
    assert not bundled.is_plugin_uninstalled("demo", plugins_dir=plugins)


@pytest.mark.asyncio
async def test_api_uninstall_does_not_mutate_when_adoption_write_fails(
    native_install,
    monkeypatch,
):
    loader, request, plugins, _source, adoption = native_install
    old = loader.get_loaded_plugin("demo")
    monkeypatch.setattr(
        "qwenpaw.components.service.set_component_update_adoption",
        MagicMock(side_effect=OSError("read-only filesystem")),
    )
    with pytest.raises(HTTPException, match="read-only"):
        await plugin_router.uninstall_plugin("demo", request)
    assert loader.get_loaded_plugin("demo") is old
    assert (plugins / "demo").is_dir() and adoption["demo"]
    assert not bundled.is_plugin_uninstalled("demo", plugins_dir=plugins)


@pytest.mark.asyncio
async def test_offline_cli_uninstall_persists_tombstone_after_delete(
    native_install,
    monkeypatch,
):
    import asyncio

    loader, _request, plugins, source_root, _adoption = native_install
    # The offline process has no loaded instance.
    await loader.unload_plugin("demo")
    monkeypatch.delenv("QWENPAW_RUNTIME_ID", raising=False)
    monkeypatch.setattr(plugin_commands, "_is_running", lambda: False)
    result = await asyncio.to_thread(
        CliRunner().invoke,
        plugin_commands.uninstall,
        ["demo"],
        input="y\n",
    )
    assert result.exit_code == 0, result.output
    assert not (plugins / "demo").exists()
    _assert_restart_does_not_restore(monkeypatch, plugins, source_root)


def test_cli_uninstall_rejects_traversal_before_live_api(monkeypatch):
    api_uninstall = AsyncMock()
    monkeypatch.setattr(plugin_commands, "_is_running", lambda: True)
    monkeypatch.setattr(
        plugin_commands,
        "_api_uninstall_plugin",
        api_uninstall,
    )
    result = CliRunner().invoke(plugin_commands.uninstall, ["../escape"])
    assert result.exit_code == 0
    assert "Invalid plugin ID" in result.output
    api_uninstall.assert_not_called()


@pytest.mark.asyncio
async def test_explicit_reinstall_clears_persistent_tombstone(native_install):
    loader, request, plugins, source_root, _adoption = native_install
    await plugin_router.uninstall_plugin("demo", request)
    assert bundled.is_plugin_uninstalled("demo", plugins_dir=plugins)
    assert (
        await loader.load_plugin_from_path(source_root / "demo")
    ).status == "active"
    assert not bundled.is_plugin_uninstalled("demo", plugins_dir=plugins)
    assert [manifest.id for manifest, _ in loader.discover_plugins()] == [
        "demo",
    ]


@pytest.mark.asyncio
@pytest.mark.parametrize("delete_fails", [False, True])
async def test_api_uninstalls_failed_plugin_with_transaction(
    native_install,
    monkeypatch,
    delete_fails,
):
    import asyncio
    from fastapi import FastAPI
    from fastapi.testclient import TestClient
    from qwenpaw.plugins.lifecycle import PluginState

    loader, _request, plugins, source_root, adoption = native_install
    loader.get_loaded_plugin("demo").status = "failed"
    loader.lifecycle.get_instance("demo").state = PluginState.FAILED
    if delete_fails:
        monkeypatch.setattr(
            "qwenpaw.plugins.loader.safe_remove",
            MagicMock(side_effect=OSError("locked")),
        )
    app = FastAPI()
    app.state.plugin_loader = loader
    app.include_router(plugin_router.router, prefix="/api")
    response = await asyncio.to_thread(
        TestClient(app).delete,
        "/api/plugins/demo",
    )
    assert response.status_code == (500 if delete_fails else 200)
    assert (plugins / "demo").exists() == delete_fails
    assert (
        bundled.is_plugin_uninstalled("demo", plugins_dir=plugins)
        != delete_fails
    )
    assert adoption["demo"] == delete_fails
    if not delete_fails:
        _assert_restart_does_not_restore(monkeypatch, plugins, source_root)
