# -*- coding: utf-8 -*-
from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[3]
SCRIPTS = ROOT / "scripts" / "pack-tauri"
sys.path.insert(0, str(SCRIPTS))


def _load(name: str):
    spec = importlib.util.spec_from_file_location(name, SCRIPTS / f"{name}.py")
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_manifest_matches_local_component_and_rejects_bad_full_metadata(
    tmp_path,
):
    builder = _load("build_component_manifest")
    validator = _load("component_manifest")
    root = tmp_path / "demo"
    root.mkdir()
    (root / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": "1.0.0"}),
        encoding="utf-8",
    )
    (root / "main.py").write_text("print('ok')\n", encoding="utf-8")
    manifest = builder.build_manifest(
        root,
        product="qwenpaw",
        channel="stable",
        target="windows-x86_64",
        core_min_version="1.0.0",
    )
    validator.validate_manifest(
        manifest,
        component_root=root,
        expected_target="windows-x86_64",
        core_version="1.0.1",
    )
    with pytest.raises(ValueError, match="full-size"):
        builder.build_manifest(
            root,
            product="qwenpaw",
            channel="stable",
            target="windows-x86_64",
            core_min_version="1.0.0",
            full_url="https://example.test/demo.zip",
        )


def test_manifest_rejects_traversal_and_core_mismatch():
    validator = _load("component_manifest")
    bad = {
        "schema_version": 1,
        "product": "qwenpaw",
        "channel": "stable",
        "target": "windows-x86_64",
        "core_min_version": "2.0.0",
        "components": {
            "demo": {
                "version": "1.0.0",
                "files": {"../escape": {"size": 1, "sha256": "0" * 64}},
            },
        },
    }
    with pytest.raises(ValueError, match="below manifest minimum"):
        validator.validate_manifest(bad, core_version="1.0.0")
    bad["core_min_version"] = "1.0.0"
    with pytest.raises(ValueError):
        validator.validate_manifest(bad, core_version="1.0.0")
