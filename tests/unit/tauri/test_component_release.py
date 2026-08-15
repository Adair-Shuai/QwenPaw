# -*- coding: utf-8 -*-
# pylint: disable=protected-access
from __future__ import annotations

import base64
import importlib.util
import json
import os
import sys
from pathlib import Path

import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

ROOT = Path(__file__).resolve().parents[3]
SCRIPTS = ROOT / "scripts" / "pack-tauri"
sys.path.insert(0, str(SCRIPTS))


def _load():
    spec = importlib.util.spec_from_file_location(
        "build_component_release",
        SCRIPTS / "build_component_release.py",
    )
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


def test_python_dependency_layer_has_bounded_production_archive_limits():
    module = _load()
    large = module._archive_limits("python-packages")
    regular = module._archive_limits("demo")

    assert large[0] >= 50_000
    assert large[1] <= 8 * 1024**3
    assert regular[0] == 10_000


def test_builds_signed_full_release_and_excludes_user_inventory(tmp_path):
    module = _load()
    source = tmp_path / "staged" / "demo"
    source.mkdir(parents=True)
    (source / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": "1.0.0"}),
        encoding="utf-8",
    )
    (source / "main.py").write_text("code", encoding="utf-8")
    (source / "engines").mkdir()
    (source / "engines" / "default.json").write_text("{}", encoding="utf-8")
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
    )
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    assert (
        "engines/default.json" not in manifest["components"]["demo"]["files"]
    )
    assert manifest_path.with_name(manifest_path.name + ".sig").is_file()
    assert (
        tmp_path
        / "release"
        / "artifacts"
        / "components"
        / "windows-x86_64"
        / "demo"
        / "1.0.0"
        / "full.zip"
    ).is_file()


def test_builds_delta_when_previous_base_is_supplied(tmp_path):
    module = _load()
    base = tmp_path / "base" / "demo"
    source = tmp_path / "staged" / "demo"
    for root, version, body in (
        (base, "1.0.0", "old"),
        (source, "1.1.0", "new"),
    ):
        root.mkdir(parents=True)
        (root / "plugin.json").write_text(
            json.dumps({"id": "demo", "version": version}),
            encoding="utf-8",
        )
        (root / "main.py").write_text(body, encoding="utf-8")
    stable = os.urandom(100_000)
    (base / "stable.bin").write_bytes(stable)
    (source / "stable.bin").write_bytes(stable)
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
        base_root=base.parent,
    )
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    assert manifest["components"]["demo"]["deltas"][0]["from"] == "1.0.0"
    assert (
        tmp_path
        / "release"
        / "artifacts"
        / "components"
        / "windows-x86_64"
        / "demo"
        / "1.0.0-1.1.0"
        / "delta.zip"
    ).is_file()


def test_builds_generic_runtime_component_without_plugin_manifest(tmp_path):
    module = _load()
    source = tmp_path / "staged" / "python-runtime"
    source.mkdir(parents=True)
    (source / "component.json").write_text(
        json.dumps(
            {
                "schema_version": 1,
                "id": "python-runtime",
                "version": "3.11.9",
                "install_scope": "desktop-runtime",
                "preserve": [],
            },
        ),
        encoding="utf-8",
    )
    (source / "python.exe").write_bytes(b"runtime")
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
        core_min_version="2.1.1b7",
        base_url="https://oss.example",
        private_key_b64=key,
    )

    entry = json.loads(manifest_path.read_text())["components"][
        "python-runtime"
    ]
    assert entry["install_scope"] == "desktop-runtime"
    assert entry["preserve"] == []
    assert "python.exe" in entry["files"]


def test_plugin_release_default_preserve_policy_matches_runtime(tmp_path):
    module = _load()
    source = tmp_path / "staged" / "demo"
    source.mkdir(parents=True)
    (source / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": "1.0.0"}),
        encoding="utf-8",
    )
    (source / "main.py").write_text("pass\n", encoding="utf-8")
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
        core_min_version="2.1.1b7",
        base_url="https://oss.example",
        private_key_b64=key,
    )

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    entry = manifest["components"]["demo"]
    assert entry["preserve"] == [
        "engines",
        "data",
        "state",
        "workspace",
        "models",
        "user-data",
    ]


def test_builds_ten_direct_deltas_and_binds_signed_history(tmp_path):
    module = _load()
    source = tmp_path / "staged" / "demo"
    source.mkdir(parents=True)
    (source / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": "2.0.0"}),
        encoding="utf-8",
    )
    stable = os.urandom(100_000)
    (source / "stable.bin").write_bytes(stable)
    bases = tmp_path / "bases"
    for index in range(10):
        base = bases / f"run-{index}" / "demo"
        base.mkdir(parents=True)
        (base / "plugin.json").write_text(
            json.dumps({"id": "demo", "version": f"1.{index}.0"}),
            encoding="utf-8",
        )
        (base / "stable.bin").write_bytes(stable)
    private = Ed25519PrivateKey.generate()
    key = base64.b64encode(
        private.private_bytes(
            serialization.Encoding.Raw,
            serialization.PrivateFormat.Raw,
            serialization.NoEncryption(),
        ),
    ).decode()
    manifest = module.build_release(
        source.parent,
        tmp_path / "release",
        product="qwenpaw",
        channel="stable",
        target="windows-x86_64",
        core_min_version="1.0.0",
        base_url="https://oss.example",
        private_key_b64=key,
        base_root=bases,
        release_id="run-10",
        release_version="2.0.0",
        history_count=10,
    )
    document = json.loads(manifest.read_text(encoding="utf-8"))
    assert len(document["components"]["demo"]["deltas"]) == 10
    pointer = json.loads(
        manifest.with_name("windows-x86_64.current.json").read_text(),
    )
    history = manifest.with_name("windows-x86_64-run-10.history.json")
    assert pointer["history_size"] == history.stat().st_size
    import hashlib

    assert (
        pointer["history_sha256"]
        == hashlib.sha256(
            history.read_bytes(),
        ).hexdigest()
    )
    private.public_key().verify(
        base64.b64decode(pointer["history_signature"]),
        history.read_bytes(),
    )


def test_history_count_above_ten_is_rejected(tmp_path):
    module = _load()
    source = tmp_path / "source" / "demo"
    source.mkdir(parents=True)
    (source / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": "1.0.0"}),
        encoding="utf-8",
    )
    private = Ed25519PrivateKey.generate()
    key = base64.b64encode(
        private.private_bytes(
            serialization.Encoding.Raw,
            serialization.PrivateFormat.Raw,
            serialization.NoEncryption(),
        ),
    ).decode()
    with pytest.raises(ValueError, match="between 1 and 10"):
        module.build_release(
            source.parent,
            tmp_path / "release",
            product="qwenpaw",
            channel="stable",
            target="windows-x86_64",
            core_min_version="1.0.0",
            base_url="https://oss.example",
            private_key_b64=key,
            release_id="run",
            history_count=11,
        )


def test_private_key_accepts_omitted_base64_padding():
    module = _load()
    private = Ed25519PrivateKey.generate()
    key = (
        base64.b64encode(
            private.private_bytes(
                serialization.Encoding.Raw,
                serialization.PrivateFormat.Raw,
                serialization.NoEncryption(),
            ),
        )
        .decode()
        .rstrip("=")
    )

    loaded = module._private_key(key)
    message = b"padding-compatible"
    private.public_key().verify(loaded.sign(message), message)


def test_private_key_rejects_invalid_base64():
    module = _load()
    with pytest.raises(ValueError, match="valid Base64"):
        module._private_key("not a key!")


def test_private_key_must_match_configured_client_public_key(monkeypatch):
    module = _load()
    private = Ed25519PrivateKey.generate()
    other = Ed25519PrivateKey.generate()
    key = base64.b64encode(
        private.private_bytes(
            serialization.Encoding.Raw,
            serialization.PrivateFormat.Raw,
            serialization.NoEncryption(),
        ),
    ).decode()
    expected = base64.b64encode(
        other.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    monkeypatch.setenv("COMPONENT_SIGNING_PUBLIC_KEY", expected)

    with pytest.raises(ValueError, match="does not match"):
        module._private_key(key)


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
    assert (
        json.loads(pointer.read_text(encoding="utf-8"))["release_id"]
        == "run-1"
    )
    assert (
        json.loads(pointer.read_text(encoding="utf-8"))["release_version"]
        == "1.0.0"
    )


def test_previous_signed_pointer_base_is_downloaded_and_verified(
    tmp_path,
    monkeypatch,
):
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
    signature_bytes = previous_manifest.with_name(
        previous_manifest.name + ".sig",
    ).read_bytes()
    artifact = next(
        (previous_release / "artifacts").rglob("full.zip"),
    ).read_bytes()
    metadata_base = "https://oss.example/metadata/components/stable"
    artifact_url = (
        "https://oss.example/artifacts/components/windows-x86_64/"
        "demo/1.0.0/full.zip"
    )
    urls = {
        f"{metadata_base}/windows-x86_64.current.json": pointer.read_bytes(),
        f"{metadata_base}/windows-x86_64-old.json": manifest_bytes,
        f"{metadata_base}/windows-x86_64-old.json.sig": signature_bytes,
        artifact_url: artifact,
    }
    monkeypatch.setattr(prepare, "_get", lambda url: urls[url])
    base_root = tmp_path / "component-base"
    assert prepare.prepare_base(
        source.parent,
        base_root,
        manifest_url=f"{metadata_base}/windows-x86_64.current.json",
        private_key_b64=key,
        expected_target="windows-x86_64",
    )
    assert (base_root / "demo" / "plugin.json").is_file()
    assert (
        json.loads((base_root / "demo" / "plugin.json").read_text())["version"]
        == "1.0.0"
    )


def test_previous_base_restores_signed_file_modes(tmp_path, monkeypatch):
    release_module = _load()
    prepare_spec = importlib.util.spec_from_file_location(
        "prepare_component_base_modes",
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
    previous = tmp_path / "previous" / "demo"
    previous.mkdir(parents=True)
    (previous / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": "1.0.0"}),
        encoding="utf-8",
    )
    launcher = previous / "launch.sh"
    launcher.write_text("#!/bin/sh\n", encoding="utf-8")
    launcher.chmod(0o755)
    private = Ed25519PrivateKey.generate()
    key = base64.b64encode(
        private.private_bytes(
            serialization.Encoding.Raw,
            serialization.PrivateFormat.Raw,
            serialization.NoEncryption(),
        ),
    ).decode()
    release_root = tmp_path / "release"
    manifest = release_module.build_release(
        previous.parent,
        release_root,
        product="qwenpaw",
        channel="stable",
        target="macos-aarch64",
        core_min_version="1.0.0",
        base_url="https://oss.example",
        private_key_b64=key,
        release_id="old",
    )
    pointer = manifest.with_name("macos-aarch64.current.json")
    artifact = next((release_root / "artifacts").rglob("full.zip"))
    metadata_base = "https://oss.example/metadata/components/stable"
    urls = {
        f"{metadata_base}/macos-aarch64.current.json": pointer.read_bytes(),
        f"{metadata_base}/macos-aarch64-old.json": manifest.read_bytes(),
        f"{metadata_base}/macos-aarch64-old.json.sig": manifest.with_name(
            manifest.name + ".sig",
        ).read_bytes(),
        "https://oss.example/artifacts/components/macos-aarch64/"
        "demo/1.0.0/full.zip": artifact.read_bytes(),
    }
    monkeypatch.setattr(prepare, "_get", lambda url: urls[url])
    base_root = tmp_path / "component-base"
    assert prepare.prepare_base(
        source.parent,
        base_root,
        manifest_url=f"{metadata_base}/macos-aarch64.current.json",
        private_key_b64=key,
        expected_target="macos-aarch64",
    )
    expected_mode = json.loads(manifest.read_text(encoding="utf-8"))[
        "components"
    ]["demo"]["files"]["launch.sh"]["mode"]
    assert (
        base_root / "demo" / "launch.sh"
    ).stat().st_mode & 0o777 == expected_mode


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
            json.dumps({"id": "demo", "version": version}),
            encoding="utf-8",
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
            json.dumps({"id": "demo", "version": "2.0.0"}),
            encoding="utf-8",
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
