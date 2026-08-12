# -*- coding: utf-8 -*-
from __future__ import annotations

import base64
import importlib.util
import json
import sys
from pathlib import Path

import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

ROOT = Path(__file__).resolve().parents[3]
SCRIPTS = ROOT / "scripts" / "pack-tauri"
sys.path.insert(0, str(SCRIPTS))


def _load():
    spec = importlib.util.spec_from_file_location("build_component_release", SCRIPTS / "build_component_release.py")
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _load_pointer_checker():
    spec = importlib.util.spec_from_file_location(
        "check_component_pointer_promotion",
        SCRIPTS / "check_component_pointer_promotion.py",
    )
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_builds_signed_full_release_and_excludes_user_inventory(tmp_path):
    module = _load()
    source = tmp_path / "staged" / "demo"
    source.mkdir(parents=True)
    (source / "plugin.json").write_text(json.dumps({"id": "demo", "version": "1.0.0"}), encoding="utf-8")
    (source / "main.py").write_text("code", encoding="utf-8")
    (source / "engines").mkdir()
    (source / "engines" / "default.json").write_text("{}", encoding="utf-8")
    private = Ed25519PrivateKey.generate()
    key = base64.b64encode(private.private_bytes(serialization.Encoding.Raw, serialization.PrivateFormat.Raw, serialization.NoEncryption())).decode()
    manifest_path = module.build_release(source.parent, tmp_path / "release", product="qwenpaw", channel="stable", target="windows-x86_64", core_min_version="1.0.0", base_url="https://oss.example", private_key_b64=key)
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    assert "engines/default.json" not in manifest["components"]["demo"]["files"]
    assert manifest_path.with_name(manifest_path.name + ".sig").is_file()
    assert (tmp_path / "release" / "artifacts" / "components" / "windows-x86_64" / "demo" / "1.0.0" / "full.zip").is_file()


def test_builds_delta_when_previous_base_is_supplied(tmp_path):
    module = _load()
    base = tmp_path / "base" / "demo"
    source = tmp_path / "staged" / "demo"
    for root, version, body in ((base, "1.0.0", "old"), (source, "1.1.0", "new")):
        root.mkdir(parents=True)
        (root / "plugin.json").write_text(json.dumps({"id": "demo", "version": version}), encoding="utf-8")
        (root / "main.py").write_text(body, encoding="utf-8")
    private = Ed25519PrivateKey.generate()
    key = base64.b64encode(private.private_bytes(serialization.Encoding.Raw, serialization.PrivateFormat.Raw, serialization.NoEncryption())).decode()
    manifest_path = module.build_release(source.parent, tmp_path / "release", product="qwenpaw", channel="stable", target="windows-x86_64", core_min_version="1.0.0", base_url="https://oss.example", private_key_b64=key, base_root=base.parent)
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    assert manifest["components"]["demo"]["deltas"][0]["from"] == "1.0.0"
    assert (tmp_path / "release" / "artifacts" / "components" / "windows-x86_64" / "demo" / "1.0.0-1.1.0" / "delta.zip").is_file()


def test_release_id_writes_versioned_manifest_and_signed_pointer(tmp_path):
    module = _load()
    source = tmp_path / "staged" / "demo"
    source.mkdir(parents=True)
    (source / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": "1.0.0"}),
        encoding="utf-8",
    )
    (source / "main.py").write_text("code", encoding="utf-8")
    private = Ed25519PrivateKey.generate()
    key = base64.b64encode(
        private.private_bytes(
            serialization.Encoding.Raw,
            serialization.PrivateFormat.Raw,
            serialization.NoEncryption(),
        ),
    ).decode()
    manifest_path = module.build_release(
        source.parent,
        tmp_path / "release",
        product="qwenpaw",
        channel="stable",
        target="windows-x86_64",
        core_min_version="1.0.0",
        base_url="https://oss.example",
        private_key_b64=key,
        release_id="run-1",
    )
    pointer = manifest_path.with_name("windows-x86_64.current.json")
    assert manifest_path.name == "windows-x86_64-run-1.json"
    assert pointer.is_file()
    assert json.loads(pointer.read_text(encoding="utf-8"))["release_id"] == "run-1"
    assert json.loads(pointer.read_text(encoding="utf-8"))["release_version"] == "1.0.0"


def test_previous_signed_pointer_base_is_downloaded_and_verified(tmp_path, monkeypatch):
    release_module = _load()
    prepare_spec = importlib.util.spec_from_file_location(
        "prepare_component_base",
        SCRIPTS / "prepare_component_base.py",
    )
    assert prepare_spec and prepare_spec.loader
    prepare = importlib.util.module_from_spec(prepare_spec)
    prepare_spec.loader.exec_module(prepare)

    source = tmp_path / "source" / "demo"
    source.mkdir(parents=True)
    (source / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": "1.1.0"}),
        encoding="utf-8",
    )
    (source / "main.py").write_text("new", encoding="utf-8")
    previous_source = tmp_path / "previous" / "demo"
    previous_source.mkdir(parents=True)
    (previous_source / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": "1.0.0"}),
        encoding="utf-8",
    )
    (previous_source / "main.py").write_text("old", encoding="utf-8")
    private = Ed25519PrivateKey.generate()
    key = base64.b64encode(
        private.private_bytes(
            serialization.Encoding.Raw,
            serialization.PrivateFormat.Raw,
            serialization.NoEncryption(),
        ),
    ).decode()
    previous_release = tmp_path / "previous-release"
    previous_manifest = release_module.build_release(
        previous_source.parent,
        previous_release,
        product="qwenpaw",
        channel="stable",
        target="windows-x86_64",
        core_min_version="1.0.0",
        base_url="https://oss.example",
        private_key_b64=key,
        release_id="old",
    )
    pointer = previous_manifest.with_name("windows-x86_64.current.json")
    manifest_bytes = previous_manifest.read_bytes()
    signature_bytes = previous_manifest.with_name(previous_manifest.name + ".sig").read_bytes()
    artifact = next((previous_release / "artifacts").rglob("full.zip")).read_bytes()
    urls = {
        "https://oss.example/metadata/components/stable/windows-x86_64.current.json": pointer.read_bytes(),
        "https://oss.example/metadata/components/stable/windows-x86_64-old.json": manifest_bytes,
        "https://oss.example/metadata/components/stable/windows-x86_64-old.json.sig": signature_bytes,
        "https://oss.example/artifacts/components/windows-x86_64/demo/1.0.0/full.zip": artifact,
    }
    monkeypatch.setattr(prepare, "_get", lambda url: urls[url])
    base_root = tmp_path / "component-base"
    assert prepare.prepare_base(
        source.parent,
        base_root,
        manifest_url="https://oss.example/metadata/components/stable/windows-x86_64.current.json",
        private_key_b64=key,
        expected_target="windows-x86_64",
    )
    assert (base_root / "demo" / "plugin.json").is_file()
    assert json.loads((base_root / "demo" / "plugin.json").read_text())["version"] == "1.0.0"


def test_pointer_promotion_rejects_older_release_version(tmp_path):
    module = _load()
    checker = _load_pointer_checker()
    private = Ed25519PrivateKey.generate()
    key = base64.b64encode(
        private.private_bytes(
            serialization.Encoding.Raw,
            serialization.PrivateFormat.Raw,
            serialization.NoEncryption(),
        ),
    ).decode()

    def build(version, sequence, name):
        source = tmp_path / name / "source" / "demo"
        source.mkdir(parents=True)
        (source / "plugin.json").write_text(
            json.dumps({"id": "demo", "version": version}), encoding="utf-8",
        )
        manifest = module.build_release(
            source.parent,
            tmp_path / name / "release",
            product="qwenpaw",
            channel="stable",
            target="windows-x86_64",
            core_min_version=version,
            base_url="https://oss.example",
            private_key_b64=key,
            release_id=name,
            release_version=version,
            release_sequence=sequence,
            release_attempt=1,
        )
        return manifest.with_name("windows-x86_64.current.json")

    local = build("1.9.0", 200, "local")
    remote = build("2.0.0", 100, "remote")
    with pytest.raises(ValueError, match="rollback"):
        checker.check_promotion(
            local,
            remote,
            private_key_b64=key,
            expected_target="windows-x86_64",
        )


def test_pointer_promotion_orders_same_version_by_run_and_attempt(tmp_path):
    module = _load()
    checker = _load_pointer_checker()
    private = Ed25519PrivateKey.generate()
    key = base64.b64encode(
        private.private_bytes(
            serialization.Encoding.Raw,
            serialization.PrivateFormat.Raw,
            serialization.NoEncryption(),
        ),
    ).decode()

    def build(sequence, attempt, name):
        source = tmp_path / name / "source" / "demo"
        source.mkdir(parents=True)
        (source / "plugin.json").write_text(
            json.dumps({"id": "demo", "version": "2.0.0"}), encoding="utf-8",
        )
        manifest = module.build_release(
            source.parent,
            tmp_path / name / "release",
            product="qwenpaw",
            channel="stable",
            target="windows-x86_64",
            core_min_version="2.0.0",
            base_url="https://oss.example",
            private_key_b64=key,
            release_id=name,
            release_version="2.0.0",
            release_sequence=sequence,
            release_attempt=attempt,
        )
        return manifest.with_name("windows-x86_64.current.json")

    remote = build(100, 2, "remote")
    stale = build(100, 1, "stale")
    current = build(101, 1, "current")
    with pytest.raises(ValueError, match="stale"):
        checker.check_promotion(
            stale,
            remote,
            private_key_b64=key,
            expected_target="windows-x86_64",
        )
    checker.check_promotion(
        current,
        remote,
        private_key_b64=key,
        expected_target="windows-x86_64",
    )
