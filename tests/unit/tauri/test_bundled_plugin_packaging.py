# -*- coding: utf-8 -*-
from __future__ import annotations

import importlib.util
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
HELPER_PATH = REPO_ROOT / "scripts" / "pack-tauri" / "stage_bundled_plugins.py"


def _load_helper():
    spec = importlib.util.spec_from_file_location(
        "qwenpaw_bundled_plugin_stage_test",
        HELPER_PATH,
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _manifest_id(path: Path) -> str:
    return json.loads(path.read_text(encoding="utf-8"))["id"]


def test_default_discovery_uses_desktop_managed_roots_and_denylist():
    helper = _load_helper()
    all_ids = {
        _manifest_id(path)  # noqa: E501
        for root in helper.DEFAULT_PLUGIN_ROOTS
        for path in (REPO_ROOT / "plugins" / root).glob("*/plugin.json")
    }
    selected_ids = {
        helper.plugin_id(path)  # noqa: E501
        for path in helper.discover_bundled_plugins(REPO_ROOT)
    }

    assert helper.PLUGIN_DENYLIST == {
        "cloudpaw",
        "qwenpaw-pet",
        "qwenpaw-creator",
        "azure-bot",
    }
    assert selected_ids == all_ids - helper.PLUGIN_DENYLIST
    assert {
        "agent-kanban",
        "chrome",
        "flowforge",
        "omp-workflows",
    } <= selected_ids
    assert "azure-bot" not in selected_ids
    assert "qwenpaw-creator" not in selected_ids
    assert "middleware-demo-thinking-log" not in selected_ids
    assert "wan27-tool" not in selected_ids


def test_desktop_bundled_plugins_accept_current_core_version():
    """A shipped frontend must never outrun its registered backend."""
    from qwenpaw._version_compat import check_plugin_version_compat
    from qwenpaw.plugins.architecture import PluginManifest

    helper = _load_helper()
    failures = []
    for plugin_dir in helper.discover_bundled_plugins(REPO_ROOT):
        manifest_data = json.loads(
            (plugin_dir / "plugin.json").read_text(encoding="utf-8"),
        )
        manifest = PluginManifest.from_dict(
            manifest_data,
        )
        compatible, message = check_plugin_version_compat(manifest)
        if not compatible:
            failures.append(f"{manifest.id}: {message}")

    assert not failures, "; ".join(failures)


def test_staging_excludes_denied_plugins_and_build_trees(tmp_path):
    helper = _load_helper()
    repo = tmp_path / "repo"
    allowed = repo / "plugins" / "bundle" / "allowed"
    denied = repo / "plugins" / "apps" / "cloud"
    allowed.mkdir(parents=True)
    denied.mkdir(parents=True)
    (allowed / "plugin.json").write_text(
        '{"id": "allowed"}\n',
        encoding="utf-8",
    )
    (allowed / "main.py").write_text("VALUE = 1\n", encoding="utf-8")
    node_module = allowed / "ui" / "node_modules" / "package"
    node_module.mkdir(parents=True)
    (node_module / "index.js").write_text("ignored\n", encoding="utf-8")
    (denied / "plugin.json").write_text(
        '{"id": "cloudpaw"}\n',
        encoding="utf-8",
    )
    destination = tmp_path / "staged"

    assert helper.stage_bundled_plugins(repo, destination) == ["allowed"]
    assert (destination / "allowed" / "main.py").is_file()
    assert not (destination / "allowed" / "ui" / "node_modules").exists()
    assert not (destination / "cloud").exists()
