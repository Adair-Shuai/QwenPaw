# -*- coding: utf-8 -*-
from __future__ import annotations

import importlib.util
import json
import sys
import zipfile
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[3]
SCRIPTS = REPO_ROOT / "scripts" / "pack-tauri"
sys.path.insert(0, str(SCRIPTS))


def _load(name: str):
    path = SCRIPTS / f"{name}.py"
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _plugin(root: Path, version: str, **files: str) -> None:
    root.mkdir(parents=True)
    (root / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": version}),
        encoding="utf-8",
    )
    for name, content in files.items():
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")


def test_delta_is_deterministic_and_contains_base_and_final_inventory(
    tmp_path,
):
    builder = _load("build_component_delta")
    base = tmp_path / "base"
    target = tmp_path / "target"
    _plugin(base, "1.0.0", keep="same", changed="old", removed="gone")
    _plugin(target, "1.1.0", keep="same", changed="new", added="new")

    first = tmp_path / "one.zip"
    second = tmp_path / "two.zip"
    delta = builder.write_delta(base, target, first)
    builder.write_delta(base, target, second)

    assert first.read_bytes() == second.read_bytes()
    assert delta["base_version"] == "1.0.0"
    assert delta["target_version"] == "1.1.0"
    assert delta["add"] == ["added"]
    assert delta["replace"] == ["changed", "plugin.json"]
    assert delta["delete"] == ["removed"]
    assert delta["base_files"]
    assert delta["final_files"]
    # The signed Manifest is the authoritative preserve list; embedding it
    # here would change delta bytes whenever the default policy evolves.
    assert "preserve" not in delta
    with zipfile.ZipFile(first) as archive:
        embedded = json.loads(archive.read("delta.json"))
    assert "preserve" not in embedded


def test_apply_delta_reconstructs_target_and_rejects_tampered_base(tmp_path):
    builder = _load("build_component_delta")
    verifier = _load("verify_component_artifacts")
    base = tmp_path / "base"
    target = tmp_path / "target"
    _plugin(base, "1.0.0", changed="old")
    _plugin(target, "1.1.0", changed="new", added="new")
    archive = tmp_path / "delta.zip"
    builder.write_delta(base, target, archive)

    output = tmp_path / "output"
    verifier.apply_delta(base, archive, output)
    assert verifier.file_inventory(output) == verifier.file_inventory(target)

    (base / "changed").write_text("tampered", encoding="utf-8")
    with pytest.raises(ValueError, match="base component"):
        verifier.apply_delta(base, archive, tmp_path / "rejected")


def test_component_tools_reject_symlinks_and_traversal(tmp_path):
    common = _load("component_common")
    root = tmp_path / "component"
    root.mkdir()
    (root / "ok").write_text("x", encoding="utf-8")
    link = root / "link"
    try:
        link.symlink_to(root / "ok")
    except (OSError, NotImplementedError):
        pytest.skip("symlinks unavailable")
    with pytest.raises(ValueError, match="symlinks"):
        common.file_inventory(root)
    with pytest.raises(ValueError):
        common.safe_relative_path("../escape")
    with pytest.raises(ValueError):
        common.safe_relative_path("/absolute")


def test_delta_requires_base_and_final_inventories(tmp_path):
    verifier = _load("verify_component_artifacts")
    base = tmp_path / "base"
    _plugin(base, "1.0.0", keep="same")
    archive = tmp_path / "bad.zip"
    with zipfile.ZipFile(archive, "w") as output:
        output.writestr("delta.json", json.dumps({"schema_version": 1}))
    with pytest.raises(ValueError, match="base_files"):
        verifier.apply_delta(base, archive, tmp_path / "out")


def test_delta_rejects_replacing_base_in_place(tmp_path):
    builder = _load("build_component_delta")
    verifier = _load("verify_component_artifacts")
    base = tmp_path / "base"
    target = tmp_path / "target"
    _plugin(base, "1.0.0", keep="same")
    _plugin(target, "1.1.0", keep="changed")
    archive = tmp_path / "delta.zip"
    builder.write_delta(base, target, archive)
    with pytest.raises(ValueError, match="inside base"):
        verifier.apply_delta(base, archive, base)
