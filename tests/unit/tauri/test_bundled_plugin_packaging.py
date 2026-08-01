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


def test_discovery_uses_only_the_two_plugin_ids_as_denylist():
    helper = _load_helper()
    all_ids = {
        _manifest_id(path)
        for path in (REPO_ROOT / "plugins").glob("*/*/plugin.json")
    }
    selected_ids = {
        helper.plugin_id(path)
        for path in helper.discover_bundled_plugins(REPO_ROOT)
    }

    assert helper.PLUGIN_DENYLIST == {"cloudpaw", "qwenpaw-pet"}
    assert selected_ids == all_ids - helper.PLUGIN_DENYLIST
    assert {
        "agent-kanban",
        "chrome",
        "flowforge",
        "omp-workflows",
    } <= selected_ids


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
