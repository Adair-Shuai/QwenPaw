# -*- coding: utf-8 -*-
"""Exclude visualization fixtures and preserve user imports during updates."""

# pylint: disable=protected-access,redefined-outer-name

from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tarfile
import time
import zipfile

import pytest

ROOT = Path(__file__).resolve().parents[3]
TOOLS = ROOT / "scripts" / "pack-tauri"
sys.path.insert(0, str(TOOLS))


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


stage = _load("ugsci_data_staging", TOOLS / "stage_bundled_plugins.py")
market = _load(
    "ugsci_data_market_pack",
    ROOT / "scripts/pack/generate_plugin_metadata.py",
)
release = _load("ugsci_data_release", TOOLS / "build_component_release.py")
verify = _load("ugsci_data_verify", TOOLS / "verify_component_release.py")
desktop = _load("ugsci_data_desktop", TOOLS / "verify_frozen_plugins.py")
mirror = _load("ugsci_data_mirror", ROOT / "scripts/sync_ugsci_bundle.py")


def _write(root: Path, relative: str, data: bytes = b"test payload") -> Path:
    path = root / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return path


def _plugin(root: Path) -> dict:
    manifest = json.loads(
        (ROOT / "plugins/bundle/ugsci/plugin.json").read_text(
            encoding="utf-8",
        ),
    )
    manifest["version"] = "0.7.6"
    _write(root, "plugin.json", json.dumps(manifest).encode())
    _write(root, "plugin.py", b"VALUE = 1\n")
    _write(root, "ui/dist/index.js", b"export {};\n")
    _write(root, "visualization/backend/api.py", b"VALUE = 1\n")
    for relative in (
        "gullfaks.json",
        "bin/manifest.json",
        "bin/example_positions.f32",
        "data/local-grid.EGRID",
        "cache/local-grid/manifest.json",
        "benchmarks/local-grid.json",
    ):
        _write(root, f"visualization/data/{relative}")
    return manifest


@pytest.mark.parametrize(
    "relative",
    ["plugins/bundle/ugsci", "src/qwenpaw/plugins_bundle/ugsci"],
)
def test_ugsci_manifests_exclude_entire_local_visualization_data(relative):
    manifest = json.loads((ROOT / relative / "plugin.json").read_text("utf-8"))
    assert "visualization/data" in manifest["pack_exclude"]
    assert "visualization/data" in manifest["component_update"]["preserve"]


def test_release_staging_and_market_zip_exclude_local_visualization_data(
    tmp_path,
):
    source = tmp_path / "repo/plugins/bundle/ugsci"
    manifest = _plugin(source)
    local_before = {
        path: path.read_bytes() for path in source.rglob("*") if path.is_file()
    }
    destination = tmp_path / "staged"
    assert stage.stage_bundled_plugins(tmp_path / "repo", destination) == [
        "ugsci",
    ]
    packaged = destination / "ugsci"
    assert not (packaged / "visualization/data").exists()
    assert (packaged / "visualization/backend/api.py").is_file()

    for name, writer in (
        ("market.zip", lambda p: market._zip_plugin(source, p, manifest)),
        ("component.zip", lambda p: release._full_zip(packaged, p)),
    ):
        output = tmp_path / name
        writer(output)
        with zipfile.ZipFile(output) as archive:
            assert archive.namelist()
            assert not any(
                "visualization/data/" in p for p in archive.namelist()
            )
            assert any(
                p.endswith("ui/dist/index.js") for p in archive.namelist()
            )
    assert all(
        path.read_bytes() == data for path, data in local_before.items()
    )


def test_market_pack_rejects_visualization_data_if_exclusion_is_removed(
    tmp_path,
):
    manifest = _plugin(tmp_path / "ugsci")
    manifest.pop("pack_exclude")
    with pytest.raises(ValueError, match="test data must not be published"):
        market._zip_plugin(tmp_path / "ugsci", tmp_path / "bad.zip", manifest)


@pytest.mark.parametrize("delta", [None, {"from": "0.7.5"}])
def test_signed_component_gate_rejects_visualization_test_payload(
    tmp_path,
    delta,
):
    output = tmp_path / "bad.zip"
    prefix = "files/" if delta else ""
    with zipfile.ZipFile(output, "w") as archive:
        archive.writestr(
            prefix + "visualization/data/bin/example.f32",
            b"sample",
        )
    with pytest.raises(ValueError, match="test data must not be published"):
        verify._verify_archive(output, "ugsci", {}, delta)


def test_delta_can_remove_previously_shipped_visualization_examples(tmp_path):
    from build_component_delta import write_delta
    from component_common import DEFAULT_PRESERVE_PATHS, file_inventory

    base = tmp_path / "base/ugsci"
    _plugin(base)
    target = tmp_path / "target/ugsci"
    for path in stage.iter_runtime_files(base):
        _write(target, path.relative_to(base).as_posix(), path.read_bytes())
    manifest = json.loads((target / "plugin.json").read_text())
    old_version = manifest["version"]
    manifest["version"] = "0.7.7"
    (target / "plugin.json").write_text(json.dumps(manifest), encoding="utf-8")
    output = tmp_path / "delta.zip"
    document = write_delta(base, target, output)
    assert any(p.startswith("visualization/data/") for p in document["delete"])
    entry = {
        "version": "0.7.7",
        "preserve": list(DEFAULT_PRESERVE_PATHS),
        "files": file_inventory(target),
    }
    verify._verify_archive(output, "ugsci", entry, {"from": old_version})


@pytest.mark.parametrize("archive", [False, True])
def test_desktop_publication_gate_rejects_visualization_test_data(
    tmp_path,
    archive,
):
    app = tmp_path / "UGSci.app"
    root = (
        app
        / "Contents/Resources/binaries/qwenpaw-backend"
        / "_internal/qwenpaw/plugins_bundle"
    )
    for plugin_id in desktop.CRITICAL_PLUGINS:
        plugin = root / plugin_id
        manifest = {"id": plugin_id, "entry": {"backend": "plugin.py"}}
        _write(plugin, "plugin.json", json.dumps(manifest).encode())
        _write(plugin, "plugin.py", b"VALUE = 1\n")
    _write(root / "ugsci", "visualization/data/example.json")
    with pytest.raises(ValueError, match="test data must not be published"):
        if archive:
            output = tmp_path / "desktop.zip"
            with zipfile.ZipFile(output, "w") as package:
                for path in app.rglob("*"):
                    if path.is_file():
                        package.write(
                            path,
                            path.relative_to(tmp_path).as_posix(),
                        )
            desktop.verify_archive(output)
        else:
            desktop.verify(root)


def test_mirror_keeps_visualization_samples_only_in_local_source(tmp_path):
    source, destination = tmp_path / "source", tmp_path / "mirror"
    _plugin(source)
    _plugin(destination)
    mirror.sync(source, destination)
    assert (source / "visualization/data/gullfaks.json").is_file()
    assert not (destination / "visualization/data").exists()
    assert (destination / "visualization/backend/api.py").is_file()
    assert not mirror.find_drift(source, destination)


def test_python_wheel_and_sdist_exclude_visualization_test_data(tmp_path):
    project = tmp_path / "project"
    project.mkdir()
    for name in ("pyproject.toml", "setup.py", "MANIFEST.in"):
        shutil.copy2(ROOT / name, project / name)
    _write(project, "README.md", b"Test release\n")
    _write(project, "src/qwenpaw/__init__.py", b"")
    _write(project, "src/qwenpaw/__version__.py", b'__version__ = "0.0.1"\n')
    _write(
        project,
        "packages/qwenpawmail-mcp/src/qwenpawmail_mcp/__init__.py",
        b"",
    )
    (project / "plugins/hub").mkdir(parents=True)
    _plugin(project / "src/qwenpaw/plugins_bundle/ugsci")
    _plugin(project / "plugins/bundle/ugsci")
    output = tmp_path / "artifacts"
    # Build backends own process-global setuptools state; isolate the two
    # formats exactly as a frontend such as `python -m build` does.
    for method in ("build_wheel", "build_sdist"):
        result = subprocess.run(
            [
                sys.executable,
                "-c",
                f"import sys; from setuptools.build_meta import {method}; "
                f"{method}(sys.argv[1])",
                str(output),
            ],
            cwd=project,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            check=False,
        )
        assert result.returncode == 0, (result.stdout + result.stderr)[-6000:]
    with zipfile.ZipFile(next(output.glob("*.whl"))) as archive:
        names = archive.namelist()
        assert any(p.endswith("ugsci/ui/dist/index.js") for p in names)
        assert not any("ugsci/visualization/data/" in p for p in names)
    sdist = next(path for path in output.iterdir() if path.suffix != ".whl")
    if sdist.suffix == ".zip":
        with zipfile.ZipFile(sdist) as archive:
            names = archive.namelist()
    else:
        with tarfile.open(sdist) as archive:
            names = archive.getnames()
    assert not any("ugsci/visualization/data/" in p for p in names)


def test_docker_context_excludes_both_visualization_fixture_trees():
    patterns = (
        (ROOT / ".dockerignore").read_text(encoding="utf-8").splitlines()
    )
    assert "plugins/bundle/ugsci/visualization/data" in patterns
    assert "src/qwenpaw/plugins_bundle/ugsci/visualization/data" in patterns


def test_packaged_visualization_imports_user_data_without_shipped_examples(
    tmp_path,
    monkeypatch,
):
    from fastapi import FastAPI
    from fastapi.testclient import TestClient
    import importlib

    source = ROOT / "plugins/bundle/ugsci"
    packaged = tmp_path / "ugsci"
    for path in stage.iter_runtime_files(source):
        _write(
            packaged,
            path.relative_to(source).as_posix(),
            path.read_bytes(),
        )
    visual = packaged / "visualization"
    assert not (visual / "data").exists()
    name = "ugsci_release_empty_visualization"
    spec = importlib.util.spec_from_file_location(
        name,
        visual / "__init__.py",
        submodule_search_locations=[str(visual)],
    )
    assert spec and spec.loader
    package = importlib.util.module_from_spec(spec)
    monkeypatch.setitem(sys.modules, name, package)
    spec.loader.exec_module(package)
    api = importlib.import_module(f"{name}.backend.api")
    manager = importlib.import_module(f"{name}.backend.jobs.manager")
    monkeypatch.setattr(manager, "_job_store", lambda: None)
    app = FastAPI()
    app.include_router(api.build_router(visual), prefix="/visualization")
    fixture = ROOT / "tests/unit/plugins/ugsci/fixtures/minimal_valid.las"
    with TestClient(app) as client:
        assert client.get("/visualization/health").status_code == 200
        assert client.get("/visualization/manifest").json()["datasets"] == []
        response = client.post(
            "/visualization/imports?name=user-log",
            files={
                "file": (
                    "user-log.las",
                    fixture.read_bytes(),
                    "application/octet-stream",
                ),
            },
        )
        assert response.status_code == 202
        job_id = response.json()["job_id"]
        deadline = time.monotonic() + 10
        while time.monotonic() < deadline:
            job = client.get(f"/visualization/imports/{job_id}").json()
            if job["status"] in {"completed", "failed", "cancelled"}:
                break
            time.sleep(0.02)
        assert job["status"] == "completed", job
        datasets = client.get("/visualization/manifest").json()["datasets"]
        assert len(datasets) == 1
        assert datasets[0]["source"] == "las"
        assert "Test Well 001" in datasets[0]["name"]
    manager._executor.shutdown(wait=True)


@pytest.mark.parametrize("route", ["bundled", "signed_full"])
def test_updates_preserve_user_imports_without_shipping_visualization_data(
    tmp_path,
    route,
):
    import base64
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric.ed25519 import (
        Ed25519PrivateKey,
    )
    from qwenpaw.components.update import (
        ComponentUpdater,
        ComponentUpdateError,
    )
    from qwenpaw.plugins.bundled import _install_or_update_plugin

    installed = tmp_path / "installed/ugsci"
    _plugin(installed)
    user_file = _write(
        installed,
        "visualization/data/user-import/unique-grid.bin",
        b"user-owned grid",
    )
    source = tmp_path / "repo/plugins/bundle/ugsci"
    manifest = _plugin(source)
    manifest["version"] = "0.7.7"
    (source / "plugin.json").write_text(json.dumps(manifest), encoding="utf-8")
    staging = tmp_path / "staging"
    stage.stage_bundled_plugins(tmp_path / "repo", staging)
    packaged = staging / "ugsci"
    assert not (packaged / "visualization/data").exists()
    if route == "bundled":
        assert _install_or_update_plugin(
            packaged,
            installed,
            "ugsci",
            manifest,
        )
    else:
        private = Ed25519PrivateKey.generate()
        public = base64.b64encode(
            private.public_key().public_bytes(
                serialization.Encoding.Raw,
                serialization.PublicFormat.Raw,
            ),
        ).decode()
        raw = base64.b64encode(
            private.private_bytes(
                serialization.Encoding.Raw,
                serialization.PrivateFormat.Raw,
                serialization.NoEncryption(),
            ),
        ).decode()
        output = tmp_path / "release"
        minimum = json.loads(
            (TOOLS / "component_compatibility.json").read_text(),
        )["core_min_version"]
        path = release.build_release(
            staging,
            output,
            product="qwenpaw",
            channel="stable",
            target="windows-x86_64",
            core_min_version=minimum,
            protocol_version=2,
            release_version="2.2.2b9",
            release_id="test",
            base_url="https://example.test",
            private_key_b64=raw,
        )
        verify.verify_release(
            output,
            path,
            target="windows-x86_64",
            base_url="https://example.test",
            public_key=public,
        )
        updater = ComponentUpdater(
            public_key_b64=public,
            managed_components={"ugsci"},
            target="windows-x86_64",
            core_version="2.2.2b9",
        )
        document = updater.load_manifest(path, path.with_suffix(".json.sig"))
        entry = document["components"]["ugsci"]
        assert not any(
            p.startswith("visualization/data/") for p in entry["files"]
        )
        old = ComponentUpdater(
            public_key_b64=public,
            managed_components={"ugsci"},
            target="windows-x86_64",
            core_version="2.2.2b8",
        )
        with pytest.raises(ComponentUpdateError, match="core|minimum"):
            old.load_manifest(path, path.with_suffix(".json.sig"))
        plan = updater.plan(document, "ugsci", installed)
        assert plan is not None
        archive = output / entry["full"]["url"].removeprefix(
            "https://example.test/",
        )
        updater.apply_full(
            plan,
            archive,
            installed,
            expected_files=entry["files"],
            preserve_from=installed,
        )
    assert user_file.read_bytes() == b"user-owned grid"
    assert (
        json.loads((installed / "plugin.json").read_text())["version"]
        == "0.7.7"
    )
