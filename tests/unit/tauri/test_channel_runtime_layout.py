# -*- coding: utf-8 -*-
"""Exercise wheel staging, desktop assembly and the real channel consumer."""

import base64
import csv
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import shutil
import subprocess
import sys
import venv
import zipfile

import pytest

from qwenpaw.__version__ import __version__
from qwenpaw.plugins.channel_bootstrap import runtime_manifest

ROOT = Path(__file__).resolve().parents[3]


@pytest.fixture(autouse=True)
def _script_imports(monkeypatch):
    monkeypatch.syspath_prepend(str(ROOT / "scripts/pack-tauri"))


def _load(name, path):
    spec = importlib.util.spec_from_file_location(name, ROOT / path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _host_wheel(tmp_path):
    """Use actual official archives in a dependency-free wheel fixture."""
    builder = _load(
        "channel_layout_pack",
        "scripts/pack/generate_plugin_metadata.py",
    )
    official = tmp_path / "official"
    builder.build_official_channel_bundle(
        ROOT,
        official,
        host_version=__version__,
    )
    info = f"qwenpaw-{__version__}.dist-info"
    files = {
        "qwenpaw/__init__.py": b"",
        "qwenpaw/plugins/official_channel_catalog.py": (
            ROOT / "src/qwenpaw/plugins/official_channel_catalog.py"
        ).read_bytes(),
        f"{info}/METADATA": (
            "Metadata-Version: 2.1\nName: qwenpaw\n"
            f"Version: {__version__}\n"
        ).encode(),
        f"{info}/WHEEL": (
            "Wheel-Version: 1.0\nRoot-Is-Purelib: true\nTag: py3-none-any\n"
        ).encode(),
    }
    for path in official.iterdir():
        if path.is_file():
            files[f"qwenpaw/official_channels/{path.name}"] = path.read_bytes()
    record = io.StringIO()
    writer = csv.writer(record)
    for name, content in sorted(files.items()):
        digest = base64.urlsafe_b64encode(hashlib.sha256(content).digest())
        writer.writerow(
            (name, "sha256=" + digest.decode().rstrip("="), len(content)),
        )
    writer.writerow((f"{info}/RECORD", "", ""))
    files[f"{info}/RECORD"] = record.getvalue().encode()
    wheel = tmp_path / f"qwenpaw-{__version__}-py3-none-any.whl"
    with zipfile.ZipFile(wheel, "w") as archive:
        for name, content in files.items():
            archive.writestr(name, content)
    return wheel


def _staged_resources(tmp_path, target, *, wheel=None):
    resources = tmp_path / "Resources"
    binaries = resources / "binaries"
    runtime = binaries / "python-runtime"
    home = runtime / "python"
    venv.EnvBuilder(with_pip=False, symlinks=False).create(home)
    if sys.platform == "win32":
        executable = home / "python.exe"
        shutil.copyfile(home / "Scripts/python.exe", executable)
    else:
        executable = home / "bin/python3"
    stage = _load(
        "channel_layout_stage",
        "scripts/pack-tauri/stage_channel_runtime.py",
    )
    manifest = stage.stage_channel_runtime(
        python=executable,
        wheel=_host_wheel(tmp_path) if wheel is None else wheel,
        resource_dir=resources,
        python_runtime_release="3.11.0+layout",
    )
    for name, marker, version in (
        ("python-runtime", ".python-runtime-version", "3.11.0+layout"),
        ("node-runtime", ".node-runtime-version", "22.0.0"),
        ("java-runtime", ".java-runtime-version", "21.0.0"),
    ):
        directory = binaries / name
        directory.mkdir(exist_ok=True)
        (directory / marker).write_text(version, encoding="utf-8")
    for name in ("officecli", "neqsim"):
        (binaries / name).mkdir()
    (binaries / f"app/backend/{__version__}/qwenpaw").mkdir(parents=True)
    (binaries / "runtimes/python-packages/layout").mkdir(parents=True)
    helper = binaries / f"tools/computer-use/{__version__}"
    helper.mkdir(parents=True)
    name = "qwenpaw-computer-use-helper"
    if target.startswith("windows-"):
        name += ".exe"
    (helper / name).write_bytes(b"helper")
    return binaries, manifest


@pytest.mark.parametrize("target", ["windows-x86_64", "macos-aarch64"])
def test_assembled_channel_runtime_matches_launcher_and_runs(
    tmp_path,
    monkeypatch,
    target,
):
    binaries, path = _staged_resources(tmp_path, target)
    original = json.loads(path.read_text(encoding="utf-8"))
    assembly = _load(
        "channel_layout_assemble",
        "scripts/pack-tauri/assemble_desktop_layout.py",
    )
    active = assembly.assemble(binaries, __version__, target)
    backend = binaries.parent / active["components"]["backend"]["path"]
    assert not path.exists()
    assert not (binaries / "channel-runtime").exists()
    path = backend / "c/runtime.json"
    runtime = binaries.parent / active["components"]["python-runtime"]["path"]
    leaf = (
        "python/python.exe"
        if sys.platform == "win32"
        else "python/bin/python3"
    )
    executable = runtime / leaf
    support = backend / "c/s"
    for name, value in {
        "QWENPAW_TAURI_RESOURCE_DIR": binaries.parent,
        "QWENPAW_CHANNEL_RESOURCE_DIR": backend,
        "QWENPAW_CHANNEL_RUNTIME_MANIFEST": path,
        "QWENPAW_DESKTOP_PY_RUNTIME": executable,
        "QWENPAW_CHANNEL_SUPPORT_ROOT": support,
        "QWENPAW_CHANNEL_DEPENDENCY_PATHS": json.dumps([str(support)]),
    }.items():
        monkeypatch.setenv(name, str(value))
    monkeypatch.delenv("QWENPAW_CHANNEL_PRESET", raising=False)
    resolved = runtime_manifest()
    assert resolved[:3] == (
        executable.resolve(),
        support.resolve(),
        (support.resolve(),),
    )
    assert not (binaries / "python-runtime").exists()
    result = subprocess.run(
        [str(resolved[0]), "-I", "-c", "print('relocated-channel-runtime')"],
        check=True,
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert result.stdout.strip() == "relocated-channel-runtime"
    updated = json.loads(path.read_text(encoding="utf-8"))
    assert (
        updated.pop("python_executable")
        == executable.relative_to(binaries.parent).as_posix()
    )
    original.pop("python_executable")
    assert updated.pop("support_root") == "c/s"
    assert updated.pop("dependency_paths") == ["c/s"]
    original.pop("support_root")
    original.pop("dependency_paths")
    assert updated == original
    before = path.read_bytes()
    refresh = _load(
        "channel_layout_refresh",
        "scripts/pack-tauri/refresh_desktop_descriptors.py",
    )
    refresh.refresh(binaries, __version__)
    assert path.read_bytes() == before
    components = _load(
        "channel_layout_components",
        "scripts/pack-tauri/stage_desktop_components.py",
    )
    staging = tmp_path / "components"
    descriptors = components.stage(binaries, staging, __version__)
    descriptor = next(row for row in descriptors if row["id"] == "backend")
    bundled = json.loads(
        (backend / "component.json").read_text(encoding="utf-8"),
    )
    assert descriptor == bundled
    assert (staging / "backend/c/runtime.json").read_bytes() == before


@pytest.mark.parametrize(
    "executable",
    [
        "../outside/python",
        "/outside/python",
        "C:/outside/python.exe",
        "binaries/python-runtime/../../outside/python",
        "binaries/other-runtime/python/python.exe",
        "binaries/python-runtime-sibling/python/python.exe",
    ],
)
def test_channel_manifest_relocation_rejects_unowned_paths(
    tmp_path,
    executable,
):
    binaries = tmp_path / "binaries"
    manifest = binaries / "channel-runtime/runtime.json"
    manifest.parent.mkdir(parents=True)
    manifest.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "python_executable": executable,
                "support_root": "binaries/channel-runtime/site",
                "dependency_paths": ["binaries/channel-runtime/site"],
            },
        ),
        encoding="utf-8",
    )
    original = manifest.read_bytes()
    active = {
        "components": {
            "python-runtime": {
                "path": "binaries/runtimes/python/3.11",
                "version": "3.11",
            },
        },
    }
    refresh = _load(
        "channel_layout_refresh",
        "scripts/pack-tauri/refresh_desktop_descriptors.py",
    )
    with pytest.raises(ValueError, match="channel interpreter"):
        refresh.refresh(binaries, __version__, active)
    assert manifest.read_bytes() == original
    assert not (binaries / "state/active.json").exists()


def test_channel_relocation_requires_selected_interpreter(
    tmp_path,
):
    binaries = tmp_path / "binaries"
    manifest = binaries / "channel-runtime/runtime.json"
    manifest.parent.mkdir(parents=True)
    executable = "binaries/python-runtime/python/python.exe"
    manifest.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "python_executable": executable,
                "support_root": "binaries/channel-runtime/site",
                "dependency_paths": ["binaries/channel-runtime/site"],
            },
        ),
        encoding="utf-8",
    )
    active = {
        "components": {
            "python-runtime": {
                "path": "binaries/runtimes/python/3.11",
                "version": "3.11",
            },
        },
    }
    refresh = _load(
        "channel_layout_refresh",
        "scripts/pack-tauri/refresh_desktop_descriptors.py",
    )
    with pytest.raises(ValueError, match="channel interpreter is missing"):
        refresh.refresh(binaries, __version__, active)
