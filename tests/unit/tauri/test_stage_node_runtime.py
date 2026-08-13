# -*- coding: utf-8 -*-
from __future__ import annotations

import importlib.util
import os
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[3]
HELPER_PATH = REPO_ROOT / "scripts" / "pack-tauri" / "stage_node_runtime.py"


def _load_helper():
    sys.path.insert(0, str(HELPER_PATH.parent))
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


def test_atomic_install_tree_uses_same_volume_for_final_renames(
    tmp_path,
    monkeypatch,
):
    helper = _load_helper()
    source = tmp_path / "temporary-volume" / "runtime"
    dest = tmp_path / "checkout-volume" / "node-runtime"
    source.mkdir(parents=True)
    dest.mkdir(parents=True)
    (source / "node.exe").write_bytes(b"new")
    (dest / "node.exe").write_bytes(b"old")

    real_replace = os.replace
    replace_pairs = []

    def guarded_replace(source_path, dest_path):
        source_path = Path(source_path)
        dest_path = Path(dest_path)
        replace_pairs.append((source_path, dest_path))
        assert source_path.parent == dest_path.parent
        return real_replace(source_path, dest_path)

    runtime_os = helper.atomic_install_tree.__globals__["os"]
    monkeypatch.setattr(runtime_os, "replace", guarded_replace)
    helper.atomic_install_tree(source, dest)

    assert (dest / "node.exe").read_bytes() == b"new"
    assert len(replace_pairs) == 2


def test_atomic_install_tree_restores_previous_runtime_on_failure(
    tmp_path,
    monkeypatch,
):
    helper = _load_helper()
    source = tmp_path / "source"
    dest = tmp_path / "node-runtime"
    source.mkdir()
    dest.mkdir()
    (source / "node.exe").write_bytes(b"new")
    (dest / "node.exe").write_bytes(b"old")

    real_replace = os.replace
    calls = 0

    def fail_activation(source_path, dest_path):
        nonlocal calls
        calls += 1
        if calls == 2:
            raise OSError("simulated activation failure")
        return real_replace(source_path, dest_path)

    runtime_os = helper.atomic_install_tree.__globals__["os"]
    monkeypatch.setattr(runtime_os, "replace", fail_activation)
    with pytest.raises(OSError, match="activation failure"):
        helper.atomic_install_tree(source, dest)

    assert (dest / "node.exe").read_bytes() == b"old"


def test_atomic_install_tree_refuses_stale_recovery_directory(tmp_path):
    helper = _load_helper()
    source = tmp_path / "source"
    dest = tmp_path / "node-runtime"
    backup = tmp_path / ".node-runtime.previous"
    source.mkdir()
    dest.mkdir()
    backup.mkdir()
    (source / "node.exe").write_bytes(b"new")
    (dest / "node.exe").write_bytes(b"current")
    (backup / "node.exe").write_bytes(b"recoverable")

    with pytest.raises(RuntimeError, match="stale runtime recovery"):
        helper.atomic_install_tree(source, dest)

    assert (dest / "node.exe").read_bytes() == b"current"
    assert (backup / "node.exe").read_bytes() == b"recoverable"
