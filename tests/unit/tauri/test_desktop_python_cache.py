# -*- coding: utf-8 -*-
"""Bytecode must not invalidate the signed baseline for a later delta."""

import importlib
import json
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "scripts" / "pack-tauri"))
builder = importlib.import_module("build_component_delta")
verifier = importlib.import_module("verify_component_artifacts")


def test_real_import_cache_keeps_delta_baseline_valid(tmp_path):
    base, target = tmp_path / "base", tmp_path / "target"
    for directory, version in ((base, "1.0.0"), (target, "1.1.0")):
        directory.mkdir()
        (directory / "plugin.json").write_text(
            json.dumps({"id": "demo", "version": version}),
            encoding="utf-8",
        )
        (directory / "sample.py").write_text(
            f"VERSION = {version!r}\n",
            encoding="utf-8",
        )
    archive = tmp_path / "delta.zip"
    builder.write_delta(base, target, archive)
    before = verifier.file_inventory(base)
    cache = tmp_path / "user-cache"
    environment = {
        **os.environ,
        "PYTHONPATH": str(base),
        "PYTHONPYCACHEPREFIX": str(cache),
    }
    environment.pop("PYTHONDONTWRITEBYTECODE", None)
    subprocess.run(
        [
            sys.executable,
            "-c",
            "import sample; assert sample.VERSION == '1.0.0'",
        ],
        cwd=tmp_path,
        env=environment,
        check=True,
        capture_output=True,
        timeout=30,
    )
    assert list(cache.rglob("sample.*.pyc"))
    assert not list(base.rglob("*.pyc"))
    assert verifier.file_inventory(base) == before
    output = tmp_path / "installed"
    verifier.apply_delta(base, archive, output)
    assert verifier.file_inventory(output) == verifier.file_inventory(target)


def test_desktop_factories_pin_cache_after_extension_environment():
    source = (ROOT / "console/src-tauri/src/backend/command.rs").read_text(
        "utf-8",
    )
    assert (
        source.count(
            "pin_managed_python_cache(pin_managed_officecli(command))",
        )
        == 3
    )
    assert (
        source.count(
            "let command = apply_contributed_environment(app, command);",
        )
        == 2
    )
    assert "dirs::cache_dir()" in source
    assert "super::python_cache::prepare(&root)" in source
    assert (
        "super::python_cache::apply(command, cache.as_deref().ok())" in source
    )
    backend = (ROOT / "console/src-tauri/src/backend.rs").read_text("utf-8")
    assert "mod python_cache;" in backend
    launcher = (
        ROOT / "scripts/pack-tauri/windows_qwenpaw_cli_launcher.cs"
    ).read_text("utf-8")
    assert 'new List<string> { "-B", "-m", "qwenpaw" }' in launcher
    assert (
        'start.EnvironmentVariables["PYTHONDONTWRITEBYTECODE"] = "1";'
        in launcher
    )


def test_cli_python_descendants_cannot_write_into_components(tmp_path):
    source = tmp_path / "signed-layer"
    source.mkdir()
    (source / "sample.py").write_text("ANSWER = 42\n", encoding="utf-8")
    before = verifier.file_inventory(source)
    environment = {
        **os.environ,
        "PYTHONPATH": str(source),
        "PYTHONDONTWRITEBYTECODE": "1",
        # Even an inherited prefix aimed inside a component must not write.
        "PYTHONPYCACHEPREFIX": str(source / "ambient-cache"),
    }
    subprocess.run(
        [
            sys.executable,
            "-B",
            "-c",
            "import sample, subprocess, sys; "
            "subprocess.run([sys.executable, '-c', "
            "'import sample; assert sample.ANSWER == 42'], check=True)",
        ],
        cwd=tmp_path,
        env=environment,
        check=True,
        capture_output=True,
        timeout=30,
    )
    assert not list(source.rglob("*.pyc"))
    assert verifier.file_inventory(source) == before
