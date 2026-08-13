# -*- coding: utf-8 -*-
# pylint: disable=protected-access
from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
HELPER_PATH = REPO_ROOT / "scripts" / "pack-tauri" / "stage_jre.py"


def _load_helper():
    sys.path.insert(0, str(HELPER_PATH.parent))
    spec = importlib.util.spec_from_file_location(
        "qwenpaw_stage_jre_test",
        HELPER_PATH,
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_prune_regenerable_windows_jre_caches(tmp_path):
    helper = _load_helper()
    server = tmp_path / "bin" / "server"
    server.mkdir(parents=True)
    cache = server / "classes.jsa"
    dynamic_cache = server / "classes_nocoops.jsa"
    library = server / "jvm.dll"
    cache.write_bytes(b"cache")
    dynamic_cache.write_bytes(b"cache")
    library.write_bytes(b"library")

    helper._prune_regenerable_runtime_files(tmp_path, "windows")

    assert not cache.exists()
    assert not dynamic_cache.exists()
    assert library.read_bytes() == b"library"


def test_keep_jre_caches_on_non_windows_platforms(tmp_path):
    helper = _load_helper()
    server = tmp_path / "bin" / "server"
    server.mkdir(parents=True)
    cache = server / "classes.jsa"
    cache.write_bytes(b"cache")

    helper._prune_regenerable_runtime_files(tmp_path, "mac")

    assert cache.read_bytes() == b"cache"
