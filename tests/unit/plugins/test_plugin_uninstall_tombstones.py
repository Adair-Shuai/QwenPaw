# -*- coding: utf-8 -*-
"""Persistent uninstall intent across API/CLI removal and restart."""

from __future__ import annotations

import json
import shutil
from contextlib import asynccontextmanager
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


@pytest.mark.asyncio
async def test_api_uninstall_persists_tombstone_before_deleting(
    monkeypatch,
    tmp_path,
):
    plugins = tmp_path / "plugins"
    installed = plugins / "demo"
    source_root = tmp_path / "bundle"
    _write_plugin(installed)
    _write_plugin(source_root / "demo")
    monkeypatch.setattr(
        "qwenpaw.config.utils.get_plugins_dir",
        lambda: plugins,
    )

    class FakeLoader:
        registry = object()

        @asynccontextmanager
        async def plugin_lifecycle(self, _plugin_id):
            yield

        @staticmethod
        def get_loaded_plugin(_plugin_id):
            return SimpleNamespace(manifest=SimpleNamespace(meta={}))

        @staticmethod
        async def unload_plugin(_plugin_id, delete_files=False):
            assert delete_files is True
            assert (plugins / ".uninstalled" / "demo").is_file()
            shutil.rmtree(installed)

    request = SimpleNamespace(
        app=SimpleNamespace(
            state=SimpleNamespace(plugin_loader=FakeLoader()),
        ),
    )
    monkeypatch.setattr(
        plugin_router,
        "_collect_plugin_runtime_ids",
        lambda *_args: (set(), set()),
    )
    monkeypatch.setattr(plugin_router, "_post_unload_cleanup", lambda *_: None)
    monkeypatch.setattr(
        plugin_router,
        "_remove_plugin_tools_from_agents",
        lambda *_: None,
    )
    monkeypatch.setattr(
        plugin_router,
        "_schedule_all_agents_reload",
        AsyncMock(),
    )

    result = await plugin_router.uninstall_plugin("demo", request)

    assert result["id"] == "demo"
    assert (plugins / ".uninstalled" / "demo").is_file()
    _assert_restart_does_not_restore(monkeypatch, plugins, source_root)


@pytest.mark.asyncio
async def test_api_uninstall_restores_adoption_when_delete_fails(
    monkeypatch,
):
    calls: list[tuple[str, bool]] = []

    class FakeLoader:
        registry = object()

        @asynccontextmanager
        async def plugin_lifecycle(self, _plugin_id):
            yield

        @staticmethod
        def get_loaded_plugin(_plugin_id):
            return SimpleNamespace(manifest=SimpleNamespace(meta={}))

        @staticmethod
        async def unload_plugin(_plugin_id, delete_files=False):
            assert delete_files is True
            raise OSError("locked")

    request = SimpleNamespace(
        app=SimpleNamespace(
            state=SimpleNamespace(plugin_loader=FakeLoader()),
        ),
    )
    monkeypatch.setattr(
        plugin_router,
        "_collect_plugin_runtime_ids",
        lambda *_args: (set(), set()),
    )
    monkeypatch.setattr(bundled, "mark_plugin_uninstalled", lambda *_: True)
    clear_marker = MagicMock()
    monkeypatch.setattr(bundled, "clear_uninstalled_marker", clear_marker)
    monkeypatch.setattr(
        "qwenpaw.components.service.is_component_update_adopted",
        lambda _plugin_id: True,
    )
    monkeypatch.setattr(
        "qwenpaw.components.service.set_component_update_adoption",
        lambda plugin_id, adopted: calls.append((plugin_id, adopted)),
    )

    with pytest.raises(HTTPException) as error:
        await plugin_router.uninstall_plugin("demo", request)

    assert error.value.status_code == 500
    assert calls == [("demo", False), ("demo", True)]
    clear_marker.assert_called_once_with("demo")


@pytest.mark.asyncio
async def test_api_uninstall_does_not_mutate_when_adoption_write_fails(
    monkeypatch,
):
    unloaded = False

    class FakeLoader:
        registry = object()

        @asynccontextmanager
        async def plugin_lifecycle(self, _plugin_id):
            yield

        @staticmethod
        def get_loaded_plugin(_plugin_id):
            return SimpleNamespace(manifest=SimpleNamespace(meta={}))

        @staticmethod
        async def unload_plugin(_plugin_id, delete_files=False):
            nonlocal unloaded
            assert delete_files is True
            unloaded = True

    request = SimpleNamespace(
        app=SimpleNamespace(
            state=SimpleNamespace(plugin_loader=FakeLoader()),
        ),
    )
    monkeypatch.setattr(
        plugin_router,
        "_collect_plugin_runtime_ids",
        lambda *_args: (set(), set()),
    )
    mark_marker = MagicMock()
    monkeypatch.setattr(bundled, "mark_plugin_uninstalled", mark_marker)
    monkeypatch.setattr(
        "qwenpaw.components.service.is_component_update_adopted",
        lambda _plugin_id: True,
    )
    monkeypatch.setattr(
        "qwenpaw.components.service.set_component_update_adoption",
        MagicMock(side_effect=OSError("read-only filesystem")),
    )

    with pytest.raises(HTTPException) as error:
        await plugin_router.uninstall_plugin("demo", request)

    assert error.value.status_code == 500
    assert unloaded is False
    mark_marker.assert_not_called()


def test_offline_cli_uninstall_persists_tombstone_after_delete(
    monkeypatch,
    tmp_path,
):
    plugins = tmp_path / "plugins"
    installed = plugins / "demo"
    source_root = tmp_path / "bundle"
    _write_plugin(installed)
    _write_plugin(source_root / "demo")
    monkeypatch.setattr(plugin_commands, "_is_running", lambda: False)
    monkeypatch.setattr(
        "qwenpaw.config.utils.get_plugins_dir",
        lambda: plugins,
    )
    monkeypatch.setattr(
        plugin_commands,
        "_remove_tool_plugin_from_agents",
        lambda *_: None,
    )

    result = CliRunner().invoke(
        plugin_commands.uninstall,
        ["demo"],
        input="y\n",
    )

    assert result.exit_code == 0, result.output
    assert not installed.exists()
    assert (plugins / ".uninstalled" / "demo").is_file()
    _assert_restart_does_not_restore(monkeypatch, plugins, source_root)


def test_cli_uninstall_rejects_traversal_before_live_api(monkeypatch):
    api_uninstall = AsyncMock()
    monkeypatch.setattr(plugin_commands, "_is_running", lambda: True)
    monkeypatch.setattr(
        plugin_commands,
        "_api_uninstall_plugin",
        api_uninstall,
    )

    result = CliRunner().invoke(
        plugin_commands.uninstall,
        ["../escape"],
    )

    assert result.exit_code == 0
    assert "Invalid plugin ID" in result.output
    api_uninstall.assert_not_called()


@pytest.mark.asyncio
async def test_explicit_reinstall_clears_persistent_tombstone(tmp_path):
    plugins = tmp_path / "plugins"
    source = tmp_path / "source"
    _write_plugin(source)
    bundled.mark_plugin_uninstalled("demo", plugins_dir=plugins)
    loader = PluginLoader([plugins])

    record = await loader.load_plugin_from_path(source)

    assert record.manifest.id == "demo"
    assert not bundled.is_plugin_uninstalled(
        "demo",
        plugins_dir=plugins,
        plugin_dir=plugins / "demo",
    )
    assert [manifest.id for manifest, _ in loader.discover_plugins()] == [
        "demo",
    ]
