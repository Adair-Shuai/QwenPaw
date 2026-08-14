# -*- coding: utf-8 -*-
"""Tests for the b7 versioned desktop runtime layout."""

from importlib.util import module_from_spec, spec_from_file_location
import json
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[3]
HELPER = REPO_ROOT / "scripts" / "pack-tauri" / "assemble_desktop_layout.py"
PYTHON_LAYERS = REPO_ROOT / "scripts" / "pack-tauri" / "build_python_layers.py"


def _load():
    spec = spec_from_file_location("assemble_desktop_layout", HELPER)
    assert spec and spec.loader
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _load_python_layers():
    spec = spec_from_file_location("build_python_layers", PYTHON_LAYERS)
    assert spec and spec.loader
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_dependency_layer_digest_is_a_valid_component_version():
    # pylint: disable=protected-access
    from packaging.version import Version

    helper = _load_python_layers()
    value = helper._dependency_version("e3028883b2090145" + "0" * 48)
    assert value == "0+sha.e3028883b2090145"
    assert str(Version(value)) == value


def test_assemble_moves_stable_resources_into_versioned_boundaries(tmp_path):
    helper = _load()
    binaries = tmp_path / "src-tauri" / "binaries"
    for name, marker, version in (
        ("python-runtime", ".python-runtime-version", "python-3.12-sha"),
        ("node-runtime", ".node-runtime-version", "node-22-sha"),
        ("java-runtime", ".java-runtime-version", "java-21-sha"),
    ):
        root = binaries / name
        root.mkdir(parents=True)
        (root / marker).write_text(version, encoding="utf-8")
    (binaries / "officecli").mkdir()
    (binaries / "neqsim").mkdir()
    (binaries / "app/backend/2.1.1b7/qwenpaw/tauri").mkdir(parents=True)
    (binaries / "runtimes/python-packages/lockhash").mkdir(parents=True)
    helper_root = binaries / "tools/computer-use/2.1.1b7"
    helper_root.mkdir(parents=True)
    (helper_root / "qwenpaw-computer-use-helper.exe").write_bytes(b"MZ")

    active = helper.assemble(binaries, "2.1.1b7", "windows-x86_64")

    assert not (binaries / "python-runtime").exists()
    assert (binaries / "runtimes/python/python-3.12-sha").is_dir()
    assert (binaries / "runtimes/node/node-22-sha").is_dir()
    assert (binaries / "runtimes/java/java-21-sha").is_dir()
    assert (binaries / "tools/officecli/2.1.1b7").is_dir()
    assert active["components"]["backend"]["kind"] == "python"
    assert active["target"] == "windows-x86_64"
    assert active["components"]["backend"]["path"].startswith(
        "binaries/app/backend/",
    )
    written = json.loads((binaries / "state/active.json").read_text())
    assert written == active


def test_assemble_requires_exactly_one_dependency_layer(tmp_path):
    helper = _load()
    binaries = tmp_path / "src-tauri" / "binaries"
    for name, marker in (
        ("python-runtime", ".python-runtime-version"),
        ("node-runtime", ".node-runtime-version"),
        ("java-runtime", ".java-runtime-version"),
    ):
        root = binaries / name
        root.mkdir(parents=True)
        (root / marker).write_text("version", encoding="utf-8")
    (binaries / "officecli").mkdir()
    (binaries / "neqsim").mkdir()
    (binaries / "app/backend/2.1.1b7/qwenpaw").mkdir(parents=True)
    (binaries / "runtimes/python-packages/one").mkdir(parents=True)
    (binaries / "runtimes/python-packages/two").mkdir(parents=True)
    helper_root = binaries / "tools/computer-use/2.1.1b7"
    helper_root.mkdir(parents=True)
    (helper_root / "qwenpaw-computer-use-helper.exe").write_bytes(b"MZ")

    try:
        helper.assemble(binaries, "2.1.1b7", "windows-x86_64")
    except ValueError as error:
        assert "exactly one Python dependency layer" in str(error)
    else:
        raise AssertionError("multiple dependency layers were accepted")


def test_assemble_accepts_extensionless_macos_helper(tmp_path):
    helper = _load()
    helper.sys.platform = "darwin"
    binaries = tmp_path / "src-tauri" / "binaries"
    for name, marker in (
        ("python-runtime", ".python-runtime-version"),
        ("node-runtime", ".node-runtime-version"),
        ("java-runtime", ".java-runtime-version"),
    ):
        root = binaries / name
        root.mkdir(parents=True)
        (root / marker).write_text("version", encoding="utf-8")
    (binaries / "officecli").mkdir()
    (binaries / "neqsim").mkdir()
    (binaries / "app/backend/2.1.1b7/qwenpaw").mkdir(parents=True)
    (binaries / "runtimes/python-packages/lockhash").mkdir(parents=True)
    helper_root = binaries / "tools/computer-use/2.1.1b7"
    helper_root.mkdir(parents=True)
    (helper_root / "qwenpaw-computer-use-helper").write_bytes(b"Mach-O")

    active = helper.assemble(binaries, "2.1.1b7", "macos-aarch64")

    assert active["components"]["computer-use-helper"]["path"].endswith(
        "/tools/computer-use/2.1.1b7",
    )
    assert active["target"] == "macos-aarch64"
