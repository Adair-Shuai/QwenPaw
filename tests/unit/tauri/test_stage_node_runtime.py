# -*- coding: utf-8 -*-
from __future__ import annotations

import importlib.util
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[3]
HELPER_PATH = REPO_ROOT / "scripts" / "pack-tauri" / "stage_node_runtime.py"


def _load_helper():
    spec = importlib.util.spec_from_file_location(
        "qwenpaw_stage_node_runtime_test",
        HELPER_PATH,
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_prune_runtime_keeps_executables_and_package_managers(tmp_path):
    helper = _load_helper()
    (tmp_path / "bin").mkdir()
    (tmp_path / "lib" / "node_modules" / "npm").mkdir(parents=True)
    (tmp_path / "include" / "node").mkdir(parents=True)
    (tmp_path / "share" / "man").mkdir(parents=True)
    (tmp_path / "bin" / "node").write_bytes(b"node")
    (tmp_path / "bin" / "npx").write_bytes(b"npx")
    (tmp_path / "lib" / "node_modules" / "npm" / "package.json").write_bytes(
        b"npm",
    )
    (tmp_path / "include" / "node" / "node.h").write_bytes(b"h" * 10)
    (tmp_path / "share" / "man" / "node.1").write_bytes(b"m" * 20)
    (tmp_path / "README.md").write_bytes(b"r" * 30)
    (tmp_path / "LICENSE").write_bytes(b"license")

    assert helper.prune_runtime(tmp_path) == 60
    assert (tmp_path / "bin" / "node").is_file()
    assert (tmp_path / "bin" / "npx").is_file()
    assert (
        tmp_path / "lib" / "node_modules" / "npm" / "package.json"
    ).is_file()
    assert (tmp_path / "LICENSE").is_file()
    assert not (tmp_path / "include").exists()
    assert not (tmp_path / "share").exists()
    assert not (tmp_path / "README.md").exists()
