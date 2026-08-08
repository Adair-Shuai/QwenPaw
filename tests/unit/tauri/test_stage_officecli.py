# -*- coding: utf-8 -*-
from __future__ import annotations

import importlib.util
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[3]
HELPER_PATH = REPO_ROOT / "scripts" / "pack-tauri" / "stage_officecli.py"


def _load_helper():
    spec = importlib.util.spec_from_file_location(
        "qwenpaw_officecli_stage_test",
        HELPER_PATH,
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_stage_doc_plugin_uses_officecli_side_by_side_layout(tmp_path):
    helper = _load_helper()
    source = tmp_path / "officecli-dump-reader-doc"
    source.write_bytes(b"authorized plugin binary")
    destination = tmp_path / "officecli"

    helper._stage_doc_plugin(  # pylint: disable=protected-access
        str(source),
        destination,
    )

    target = destination / "plugins" / "dump-reader" / "doc" / "plugin"
    assert target.read_bytes() == source.read_bytes()
    assert (target.parent / "plugin.sha256").read_text().strip()


def test_stage_doc_plugin_without_source_is_a_noop(tmp_path):
    helper = _load_helper()
    destination = tmp_path / "officecli"

    helper._stage_doc_plugin(  # pylint: disable=protected-access
        None,
        destination,
    )

    assert not destination.exists()
