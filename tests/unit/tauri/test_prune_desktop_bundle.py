# -*- coding: utf-8 -*-
from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest


REPO_ROOT = Path(__file__).resolve().parents[3]
HELPER_PATH = REPO_ROOT / "scripts" / "pack-tauri" / "prune_desktop_bundle.py"


def _load_helper():
    spec = importlib.util.spec_from_file_location(
        "qwenpaw_desktop_bundle_pruner_test",
        HELPER_PATH,
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_pruner_removes_frontend_workspaces_and_caches(tmp_path):
    helper = _load_helper()
    bundle = tmp_path / "qwenpaw-backend"
    (bundle / "_internal" / "plugin" / "ui" / "node_modules").mkdir(
        parents=True,
    )
    (bundle / "_internal" / "plugin" / "__pycache__").mkdir()
    (
        bundle / "_internal" / "plugin" / "ui" / "node_modules" / "unused.js"
    ).write_bytes(
        b"x" * 128,
    )
    (
        bundle / "_internal" / "plugin" / "__pycache__" / "unused.pyc"
    ).write_bytes(
        b"y" * 64,
    )
    (bundle / "_internal" / ".DS_Store").write_bytes(b"z")
    (bundle / "qwenpaw-backend").write_bytes(b"backend")
    (bundle / "qwenpaw").write_bytes(b"cli")

    removed = helper.prune_bundle(bundle)

    assert removed >= 193
    assert not (
        bundle / "_internal" / "plugin" / "ui" / "node_modules"
    ).exists()
    assert not (bundle / "_internal" / "plugin" / "__pycache__").exists()
    assert not (bundle / "_internal" / ".DS_Store").exists()
    assert (bundle / "qwenpaw-backend").is_file()


def test_pruner_rejects_non_pyinstaller_directories(tmp_path):
    helper = _load_helper()
    with pytest.raises(ValueError):
        helper.prune_bundle(tmp_path)
