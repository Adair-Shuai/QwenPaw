# -*- coding: utf-8 -*-
# pylint: disable=protected-access
from __future__ import annotations

import importlib.util
import json
from pathlib import Path

import pytest


SCRIPT_PATH = (
    Path(__file__).resolve().parents[3]
    / "scripts"
    / "dev_ensure_plugin_uis.py"
)
SPEC = importlib.util.spec_from_file_location(
    "dev_ensure_plugin_uis",
    SCRIPT_PATH,
)
assert SPEC is not None and SPEC.loader is not None
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def _write_plugin(
    root: Path,
    directory: str,
    plugin_id: str,
    frontend: str | None,
) -> Path:
    plugin_dir = root / directory
    plugin_dir.mkdir(parents=True)
    entry = {"frontend": frontend} if frontend else {}
    (plugin_dir / "plugin.json").write_text(
        json.dumps({"id": plugin_id, "entry": entry}),
        encoding="utf-8",
    )
    return plugin_dir


def test_collects_frontend_plugins_from_bundles_and_apps(
    tmp_path: Path,
) -> None:
    bundle = _write_plugin(
        tmp_path / "plugins" / "bundle",
        "chrome",
        "chrome",
        "ui/dist/index.js",
    )
    app = _write_plugin(
        tmp_path / "plugins" / "apps",
        "datapaw",
        "datapaw",
        "ui/dist/index.js",
    )
    _write_plugin(
        tmp_path / "plugins" / "apps",
        "backend-only",
        "backend-only",
        None,
    )

    assert MODULE._collect_frontend_plugins(tmp_path) == [
        (bundle, "chrome", "ui/dist/index.js"),
        (app, "datapaw", "ui/dist/index.js"),
    ]


def test_sync_dist_copies_nested_assets_to_runtime_and_mirror(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    plugin_dir = tmp_path / "plugins" / "bundle" / "datapaw"
    dist_dir = plugin_dir / "ui" / "dist"
    (dist_dir / "context-console").mkdir(parents=True)
    (dist_dir / "app").mkdir()
    (dist_dir / "index.js").write_text("export {};", encoding="utf-8")
    (dist_dir / "context-console" / "index.html").write_text(
        "<main></main>",
        encoding="utf-8",
    )
    (dist_dir / "app" / "logo.png").write_bytes(b"png")

    mirror = tmp_path / "src" / "qwenpaw" / "plugins_bundle" / "datapaw"
    mirror.mkdir(parents=True)
    runtime_root = tmp_path / "runtime-plugins"
    (runtime_root / "datapaw").mkdir(parents=True)
    monkeypatch.setattr(MODULE, "_get_plugins_dir", lambda: runtime_root)

    MODULE._sync_dist(
        plugin_dir,
        "ui/dist/index.js",
        tmp_path,
        "datapaw",
    )

    for target in (mirror, runtime_root / "datapaw"):
        assert (target / "ui" / "dist" / "index.js").is_file()
        assert (
            target / "ui" / "dist" / "context-console" / "index.html"
        ).is_file()
        assert (target / "ui" / "dist" / "app" / "logo.png").is_file()

    revision = (runtime_root / "datapaw" / ".bundle_revision").read_text(
        encoding="utf-8",
    )
    assert revision.startswith("dev-")
