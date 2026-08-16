# -*- coding: utf-8 -*-
# pylint: disable=reimported,protected-access
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


def test_build_delta_defaults_to_full_preserve_list(tmp_path):
    """Guard against the narrow engines-only preserve default.

    A delta built with the default preserve set must exclude every managed
    user-data path (data/, state/, workspace/, models/, user-data/, engines/).
    """
    from component_common import DEFAULT_PRESERVE_PATHS

    builder = _load("build_component_delta")
    base = tmp_path / "base"
    target = tmp_path / "target"
    _plugin(base, "1.0.0", keep="same")
    _plugin(target, "1.1.0", keep="same")
    builder.build_delta(base, target)
    # The shared default must be the full managed-user-data preserve list.
    assert tuple(DEFAULT_PRESERVE_PATHS) == (
        "engines",
        "data",
        "state",
        "workspace",
        "models",
        "user-data",
    )


def test_build_delta_treats_managed_user_data_as_unmanaged_by_default(
    tmp_path,
):
    """Guard: a managed user-data change must NOT appear in the delta ops."""
    builder = _load("build_component_delta")
    base = tmp_path / "base"
    target = tmp_path / "target"
    _plugin(base, "1.0.0", keep="same")
    _plugin(target, "1.1.0", keep="same")
    # Only a preserved (managed) path changes between base and target.
    (base / "data").mkdir(exist_ok=True)
    (target / "data").mkdir(exist_ok=True)
    (base / "data" / "user.json").write_text("old", encoding="utf-8")
    (target / "data" / "user.json").write_text("new", encoding="utf-8")
    delta = builder.build_delta(base, target)
    all_ops = delta["add"] + delta["replace"] + delta["delete"]
    assert not any(
        op.startswith("data/") for op in all_ops
    ), "default delta must not touch managed user-data paths"


def test_verify_rejects_delta_touching_preserved_paths(tmp_path):
    """Guard: the verifier mirrors the runtime preserved-path write protect."""
    builder = _load("build_component_delta")
    verifier = _load("verify_component_artifacts")
    base = tmp_path / "base"
    target = tmp_path / "target"
    _plugin(base, "1.0.0", keep="same")
    _plugin(target, "1.1.0", keep="changed")
    archive = tmp_path / "delta.zip"
    builder.write_delta(base, target, archive)
    # Tamper: move a legitimate add/replace payload onto a managed user-data
    # path, keeping the member set consistent so the preserved-path guard (not
    # the member-consistency check) is what fires.
    import io
    import zipfile as zf

    with zf.ZipFile(archive) as z:
        delta = json.loads(z.read("delta.json"))
        payload_members = {
            n: z.read(n) for n in z.namelist() if n != "delta.json"
        }
    victim = delta["replace"][0] if delta["replace"] else delta["add"][0]
    blob = payload_members.pop(f"files/{victim}")
    preserved_path = "data/user.json"
    if victim in delta["replace"]:
        delta["replace"] = [
            preserved_path if p == victim else p for p in delta["replace"]
        ]
    else:
        delta["add"] = [
            preserved_path if p == victim else p for p in delta["add"]
        ]
    payload_members[f"files/{preserved_path}"] = blob
    buf = io.BytesIO()
    with zf.ZipFile(buf, "w") as z:
        z.writestr("delta.json", json.dumps(delta))
        for name, data in payload_members.items():
            z.writestr(name, data)
    archive.write_bytes(buf.getvalue())
    with pytest.raises(ValueError, match="preserved"):
        verifier.apply_delta(base, archive, tmp_path / "out")


def test_build_manifest_rejects_placeholder_version(tmp_path):
    """Guard: build_component_manifest must not silently emit version 0.0.0."""
    builder = _load("build_component_manifest")
    root = tmp_path / "bare"
    root.mkdir()
    (root / "keep.txt").write_text("x", encoding="utf-8")  # no plugin.json
    # No plugin.json/component.json and no --version override -> the resolved
    # version would fall back to the 0.0.0 placeholder, which must be rejected.
    with pytest.raises(ValueError, match="0.0.0|placeholder|non-empty"):
        builder.build_manifest(
            root.resolve(),
            product="qwenpaw",
            channel="desktop",
            target="windows",
            core_min_version="2.0.0",
        )


def test_atomic_write_bytes_replaces_atomically(tmp_path):
    """Guard: atomic_write_bytes never leaves a torn file behind."""
    from component_common import atomic_write_bytes

    target = tmp_path / "out.json"
    atomic_write_bytes(target, b'{"a":1}')
    assert target.read_bytes() == b'{"a":1}'
    atomic_write_bytes(target, b'{"b":2}')
    assert target.read_bytes() == b'{"b":2}'
    # No stray temp files remain in the directory.
    leftovers = [p.name for p in tmp_path.iterdir() if p.name != "out.json"]
    assert leftovers == [], f"torn temp files left behind: {leftovers}"


def test_full_zip_rejects_links_before_file_filter():
    """Guard: _full_zip must check is_symlink BEFORE the is_file filter.

    A dangling symlink reports is_file() == False, so checking after the
    filter would silently skip it. The order must match
    component_common.iter_files (symlink check first).
    """
    import inspect as _inspect

    builder = _load("build_component_release")
    source = _inspect.getsource(builder._full_zip)
    # Match the code forms, not the words in comments.
    sym_pos = source.find("path.is_symlink()")
    file_pos = source.find("path.is_file()")
    assert sym_pos != -1, "_full_zip must reject symlinks"
    assert file_pos != -1
    assert sym_pos < file_pos, (
        "symlink check must precede the is_file filter so dangling links "
        "are rejected instead of silently skipped"
    )
