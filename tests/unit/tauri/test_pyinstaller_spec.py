# -*- coding: utf-8 -*-
from __future__ import annotations

import ast
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
SPEC_PATH = REPO_ROOT / "scripts" / "pack-tauri" / "qwenpaw.spec"
WINDOWS_BUILD_PATH = (
    REPO_ROOT / "scripts" / "pack-tauri" / "build_pyinstaller.ps1"
)
UNIX_BUILD_PATH = REPO_ROOT / "scripts" / "pack-tauri" / "build_pyinstaller.sh"


def _collected_submodule_packages() -> set[str]:
    tree = ast.parse(SPEC_PATH.read_text(encoding="utf-8"))
    packages = set()
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call):
            continue
        if not isinstance(node.func, ast.Name):
            continue
        if node.func.id != "collect_submodules" or not node.args:
            continue
        package = node.args[0]
        if isinstance(package, ast.Constant) and isinstance(
            package.value,
            str,
        ):
            packages.add(package.value)
    return packages


def test_desktop_spec_collects_pawapp_sdk_for_runtime_loaded_plugins():
    assert "qwenpaw.pawapp" in _collected_submodule_packages()


def test_desktop_packagers_use_denylist_plugin_discovery():
    spec = SPEC_PATH.read_text(encoding="utf-8")

    assert "discover_bundled_plugins(REPO_ROOT)" in spec
    assert "stage_bundled_plugins" in spec


def test_whisper_is_opt_in_for_desktop_pyinstaller_builds():
    spec = SPEC_PATH.read_text(encoding="utf-8")
    unix_build = (
        UNIX_BUILD_PATH
    ).read_text(
        encoding="utf-8",
    )
    windows_build = WINDOWS_BUILD_PATH.read_text(encoding="utf-8")

    assert "QWENPAW_INCLUDE_WHISPER" in spec
    assert 'excludes=[] if INCLUDE_WHISPER else ["whisper", "torch"' in spec
    assert ".[local,codex,qoder]" in unix_build
    assert ".[local,codex,qoder]" in windows_build


def test_layered_builds_skip_pyinstaller_and_use_locked_dependency_layer():
    unix_build = UNIX_BUILD_PATH.read_text(encoding="utf-8")
    windows_build = WINDOWS_BUILD_PATH.read_text(encoding="utf-8")
    layer_builder = (
        REPO_ROOT / "scripts/pack-tauri/build_python_layers.py"
    ).read_text(encoding="utf-8")

    assert 'if [ "$LAYERED_DESKTOP" = false ]; then' in unix_build
    assert "if (-not $LAYERED_DESKTOP)" in windows_build
    assert "--uv" not in unix_build
    assert "--uv" not in windows_build
    assert 'repo / "requirements-desktop.lock"' in layer_builder
    assert '"--require-hashes"' in layer_builder
    assert 'repo / "uv.lock"' not in layer_builder


def test_layered_builds_do_not_install_domain_packages_into_interpreter():
    unix_build = UNIX_BUILD_PATH.read_text(encoding="utf-8")
    windows_build = WINDOWS_BUILD_PATH.read_text(encoding="utf-8")

    unix_layered_branch = unix_build.split(
        'if [ "$LAYERED_DESKTOP" = true ]; then', 1,
    )[1]
    windows_layered_branch = windows_build.split(
        "if ($LAYERED_DESKTOP) {",
        1,
    )[1]
    assert "numpy pandas scipy" not in unix_layered_branch
    assert "numpy pandas scipy" not in windows_layered_branch
