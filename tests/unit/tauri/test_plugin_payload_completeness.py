# -*- coding: utf-8 -*-
"""Exercise desktop plugin reuse and actual signed payload completeness."""

from __future__ import annotations

import base64
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import zipfile

import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

ROOT = Path(__file__).resolve().parents[3]
TOOLS = ROOT / "scripts/pack-tauri"
sys.path.insert(0, str(TOOLS))


def _load(name):
    spec = importlib.util.spec_from_file_location(name, TOOLS / f"{name}.py")
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _write(root, relative, data=b"export {};\n"):
    path = root / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return path


def _desktop(tmp_path):
    repo = tmp_path / "repo"
    binaries = tmp_path / "resources/binaries"
    plugins = binaries / "app/backend/2.3.0b4/qwenpaw/plugins_bundle"
    _write(
        binaries,
        "state/active.json",
        json.dumps(
            {
                "schemaVersion": 1,
                "target": "macos-aarch64",
                "components": {
                    "backend": {
                        "version": "2.3.0b4",
                        "path": "binaries/app/backend/2.3.0b4",
                    },
                },
            },
        ).encode(),
    )
    for plugin_id in (
        "ugsci",
        "ugsci_research",
        "flowforge",
        "qwenpaw-run-center",
        "qwenpaw-openui",
        "qwenpaw-data",
    ):
        manifest = {
            "id": plugin_id,
            "version": "1.0.5",
            "entry": {"backend": "plugin.py", "frontend": "ui/index.js"},
            "pack_requires": ["ui/context-console/index.html"],
        }
        category = "apps" if plugin_id == "qwenpaw-data" else "bundle"
        _write(
            repo / "plugins" / category / plugin_id,
            "plugin.json",
            json.dumps(manifest).encode(),
        )
        source = plugins / plugin_id
        _write(source, "plugin.json", json.dumps(manifest).encode())
        for path in [*manifest["entry"].values(), *manifest["pack_requires"]]:
            _write(source, path)
    return repo, binaries, plugins


def _release(source, destination):
    private = Ed25519PrivateKey.generate()
    key = base64.b64encode(
        private.private_bytes(
            serialization.Encoding.Raw,
            serialization.PrivateFormat.Raw,
            serialization.NoEncryption(),
        ),
    ).decode()
    manifest = _load("build_component_release").build_release(
        source,
        destination,
        product="qwenpaw",
        channel="stable",
        target="macos-aarch64",
        core_min_version="2.2.2b9",
        release_version="2.3.0b4",
        protocol_version=2,
        base_url="https://release.example",
        private_key_b64=key,
    )
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    _load("verify_component_release").verify_release(
        destination,
        manifest,
        target="macos-aarch64",
        base_url="https://release.example",
        public_key=public,
    )
    return manifest


def test_desktop_plugins_reuse_complete_payloads_in_real_signed_zips(tmp_path):
    repo, binaries, plugins = _desktop(tmp_path)
    output = tmp_path / "staged"
    _load("stage_desktop_plugins").stage(
        repo,
        binaries,
        output,
        "macos-aarch64",
        "v2.3.0-beta.4",
    )
    manifest_path = _release(output, tmp_path / "release")
    manifest = json.loads(manifest_path.read_text("utf-8"))
    for identifier, entry in manifest["components"].items():
        archive_path = (
            tmp_path
            / "release"
            / entry["full"]["url"].removeprefix("https://release.example/")
        )
        with zipfile.ZipFile(archive_path) as archive:
            for required in (
                "plugin.py",
                "ui/index.js",
                "ui/context-console/index.html",
            ):
                assert (
                    archive.read(required)
                    == (plugins / identifier / required).read_bytes()
                )


@pytest.mark.parametrize(
    "missing",
    ["ui/index.js", "ui/context-console/index.html"],
)
def test_signed_component_gate_rejects_missing_declared_payload(
    tmp_path,
    missing,
):
    _, _, plugins = _desktop(tmp_path)
    (plugins / "qwenpaw-data" / missing).unlink()
    with pytest.raises(ValueError, match="missing required payload"):
        _release(plugins, tmp_path / "release")


@pytest.mark.parametrize(
    "damage",
    ["target", "version", "identity", "missing", "data"],
)
def test_desktop_plugin_reuse_rejects_foreign_or_incomplete_sources(
    tmp_path,
    damage,
):
    repo, binaries, plugins = _desktop(tmp_path)
    active = binaries / "state/active.json"
    if damage in {"target", "version"}:
        document = json.loads(active.read_text("utf-8"))
        if damage == "target":
            document["target"] = "windows-x86_64"
        else:
            document["components"]["backend"]["version"] = "2.3.0b3"
        active.write_text(json.dumps(document), "utf-8")
    elif damage == "identity":
        manifest = plugins / "qwenpaw-data/plugin.json"
        document = json.loads(manifest.read_text("utf-8"))
        document["version"] = "1.0.4"
        manifest.write_text(json.dumps(document), "utf-8")
    elif damage == "missing":
        (plugins / "qwenpaw-data/ui/context-console/index.html").unlink()
    else:
        _write(plugins / "ugsci", "visualization/data/local.bin")
    output = tmp_path / "output"
    with pytest.raises(ValueError):
        _load("stage_desktop_plugins").stage(
            repo,
            binaries,
            output,
            "macos-aarch64",
            "2.3.0b4",
        )
    assert not output.exists()


def test_desktop_archive_requires_manifest_declared_auxiliary_files(tmp_path):
    _, _, plugins = _desktop(tmp_path)
    (plugins / "qwenpaw-data/ui/context-console/index.html").unlink()
    verifier = _load("verify_frozen_plugins")
    with pytest.raises(ValueError, match="missing required payload"):
        verifier.verify(plugins)
    desktop = tmp_path / "desktop.zip"
    with zipfile.ZipFile(desktop, "w", zipfile.ZIP_DEFLATED) as archive:
        resource_root = plugins.parents[5]
        for path in resource_root.rglob("*"):
            if path.is_file():
                archive.write(path, path.relative_to(resource_root).as_posix())
    with pytest.raises(ValueError, match="missing required payload"):
        verifier.verify_archive(desktop)


def test_data_context_vendoring_runs_script_and_restores_router(
    tmp_path,
    monkeypatch,
):
    repo = tmp_path / "repo"
    scripts = repo / "plugins/apps/qwenpaw-data/scripts"
    for relative in ("sync-context-ui.sh", "context-console/paw-bridge.js"):
        original = ROOT / "plugins/apps/qwenpaw-data/scripts" / relative
        _write(scripts, relative, original.read_text("utf-8").encode())
    checkout = tmp_path / "data-source"
    frontend = checkout / "packages/qwenpaw-data-context/frontend"
    _write(
        frontend,
        "package.json",
        json.dumps(
            {
                "name": "context-build-fixture",
                "version": "1.0.0",
                "scripts": {"build": "node build.mjs"},
            },
        ).encode(),
    )
    router = _write(
        frontend,
        "src/router/index.tsx",
        b"export const router = createBrowserRouter([]);\n",
    )
    original_router = router.read_bytes()
    _write(
        frontend,
        "build.mjs",
        (
            b"import fs from 'node:fs'; "
            b"const router = fs.readFileSync('src/router/index.tsx', 'utf8'); "
            b"if (!router.includes('createHashRouter')) "
            b"throw Error('router was not patched'); "
            b"fs.mkdirSync('dist', {recursive:true}); "
            b"fs.writeFileSync('dist/index.html', "
            b"'<head></head><body>context console</body>');"
        ),
    )
    (frontend / "node_modules").mkdir()
    subprocess.run(
        ["git", "init", str(checkout)],
        check=True,
        capture_output=True,
    )
    subprocess.run(
        ["git", "-C", str(checkout), "add", "."],
        check=True,
        capture_output=True,
    )
    subprocess.run(
        [
            "git",
            "-C",
            str(checkout),
            "-c",
            "user.name=Build test",
            "-c",
            "user.email=build@example.invalid",
            "commit",
            "-m",
            "Fixture",
        ],
        check=True,
        capture_output=True,
    )
    monkeypatch.setenv("QWENPAW_DATA_SOURCE_DIR", str(checkout))
    _load("prepare_data_context_console").prepare(repo)
    output = repo / "plugins/apps/qwenpaw-data/ui/public/context-console"
    assert "paw-bridge.js" in (output / "index.html").read_text("utf-8")
    assert (output / "paw-bridge.js").read_bytes() == (
        scripts / "context-console/paw-bridge.js"
    ).read_bytes()
    assert "patches=createBrowserRouter->createHashRouter" in (
        output / "BUILD_INFO"
    ).read_text("utf-8")
    assert router.read_bytes() == original_router


def test_component_workflow_reuses_complete_desktop_plugins():
    workflow = (ROOT / ".github/workflows/component-release.yml").read_text(
        "utf-8",
    )
    assert "stage_desktop_plugins.py" in workflow
    assert "--target '${{ matrix.target }}'" in workflow
    assert "--version '${{ inputs.release_version }}'" in workflow
    assert "Build standalone managed plugin frontends" in workflow
    assert "verify_frozen_plugins.py component-staging" in workflow


def test_desktop_builds_vendor_data_context_before_plugin_bundle():
    for name in ("build_plugin_uis.sh", "build_plugin_uis.ps1"):
        script = (TOOLS / name).read_text("utf-8")
        assert script.index("prepare_data_context_console.py") < script.index(
            "npm run build",
            script.index("prepare_data_context_console.py"),
        )
    helper = _load("prepare_data_context_console")
    assert helper.DATA_REF == "v0.3.3"
    assert (
        helper.DATA_REPOSITORY
        == "https://github.com/agentscope-ai/QwenPaw-Data.git"
    )
