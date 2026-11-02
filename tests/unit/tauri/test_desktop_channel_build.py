# -*- coding: utf-8 -*-
"""Keep clean desktop builders ready for actual channel contract checks."""

from __future__ import annotations

import json
from pathlib import Path
import runpy
import shutil

import pytest


REPO_ROOT = Path(__file__).resolve().parents[3]
PACK = REPO_ROOT / "scripts" / "pack-tauri"


@pytest.mark.parametrize("suffix", ["ps1", "sh"])
def test_channel_contract_dependencies_install_before_layout_branch(suffix):
    build = (PACK / f"build_pyinstaller.{suffix}").read_text(
        encoding="utf-8",
    )
    branch = (
        "if (-not $LAYERED_DESKTOP) {"
        if suffix == "ps1"
        else 'if [ "$LAYERED_DESKTOP" = false ]; then'
    )
    requirements = "scripts/pack/channel-contract-requirements.txt"
    install = build.index(requirements)
    # A fresh layered build skips the legacy host install entirely.
    assert install < build.index(branch)
    assert install < build.index("validate_channel_contracts.py")
    if suffix == "ps1":
        assert (
            'Install-PythonPackages -Packages @("-r", '
            in build[: build.index(branch)]
        )
        assert (
            'Assert-LastExit "Official channel contract validation failed"'
            in build
        )
    else:
        assert (
            'install_python_packages -r "${REPO_ROOT}/' + requirements in build
        )
        assert "set -e" in build


@pytest.mark.parametrize("suffix", ["ps1", "sh"])
def test_layered_channel_wheels_are_prepared_before_runtime_resolution(suffix):
    build = (PACK / f"build_pyinstaller.{suffix}").read_text(
        encoding="utf-8",
    )
    start = build.index("== Preparing layered channel dependency wheels ==")
    end = build.index("== Building readable channel runtime ==")
    preparation = build[start:end]
    assert start < end < build.index("stage_channel_runtime.py")
    assert "channel-source-wheels" in preparation
    assert "BUILD_VENV" in preparation
    assert "pip wheel --prefer-binary --wheel-dir" in preparation
    assert '".[channels]"' in preparation
    assert "[full]" not in preparation
    assert "qwenpaw-*.whl" in preparation
    assert "Expected one host wheel" in preparation
    assert "HOST_WHEEL=" in preparation or "$HOST_WHEEL =" in preparation
    # Resolution still consumes only the staged closure, without a network
    # fallback or copying the build environment into the published runtime.
    resolution = build[end : build.index("stage_channel_runtime.py")]
    assert "--no-index --only-binary=:all:" in resolution
    assert "HOST_WHEEL}[channels]" in resolution
    assert "--find-links" in resolution and "DESKTOP_WHEELS" in resolution


def test_desktop_channel_gate_rejects_retained_model_drift(tmp_path):
    validator = runpy.run_path(
        str(REPO_ROOT / "scripts/pack/validate_channel_contracts.py"),
    )["validate_official_channel_contracts"]
    catalogue = runpy.run_path(
        str(REPO_ROOT / "src/qwenpaw/plugins/official_channel_catalog.py"),
    )["OFFICIAL_CHANNELS"]
    feishu = next(row for row in catalogue if row["channel_key"] == "feishu")
    inventory = tmp_path / "src/qwenpaw/plugins/official_channel_catalog.py"
    inventory.parent.mkdir(parents=True)
    inventory.write_text(
        f"OFFICIAL_CHANNELS = ({feishu!r},)\n",
        encoding="utf-8",
    )
    source = REPO_ROOT / "plugins/channel" / feishu["source_dir"]
    destination = tmp_path / "plugins/channel" / feishu["source_dir"]
    destination.mkdir(parents=True)
    shutil.copyfile(source / "plugin.json", destination / "plugin.json")
    manifest = json.loads((source / "plugin.json").read_text("utf-8"))
    descriptor = destination / manifest["entry"]["descriptor"]
    shutil.copyfile(source / manifest["entry"]["descriptor"], descriptor)

    validator(tmp_path)
    value = json.loads(descriptor.read_text("utf-8"))
    value["config_schema"]["properties"]["enabled"]["default"] = True
    descriptor.write_text(json.dumps(value), encoding="utf-8")
    with pytest.raises(ValueError, match="descriptor differs from retained"):
        validator(tmp_path)
