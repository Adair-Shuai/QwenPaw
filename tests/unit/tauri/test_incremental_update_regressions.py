# -*- coding: utf-8 -*-
"""Regression tests for independently reproduced incremental update failures."""

from pathlib import Path
import base64
import hashlib
import json
import random
import sys
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "src"))
sys.path.insert(0, str(ROOT / "scripts" / "pack-tauri"))

import pytest
import httpx
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from build_component_delta import write_delta
from build_component_release import build_release, _full_zip
import build_component_release as release_module
from stage_desktop_components import stage
from qwenpaw.components.update import (
    ComponentUpdater,
    ComponentUpdatePlan,
    ComponentUpdateError,
)
from qwenpaw.components.service import ComponentUpdateService
from qwenpaw.components.client import ComponentClient
import qwenpaw.components.service as service_module
from renew_component_pointer import renew
from check_component_pointer_promotion import _load_verified
from component_host import host_fingerprint


def test_windows_update_assistant_changes_require_a_host_upgrade(tmp_path):
    from component_host import HOST_INPUTS

    inputs = (
        "scripts/pack-tauri/windows_update_assistant.cs",
        "scripts/pack-tauri/build_windows_update_assistant.ps1",
    )
    rust_build = (ROOT / "console/src-tauri/build.rs").read_text(
        encoding="utf-8"
    )
    for name in inputs:
        assert name in HOST_INPUTS
        assert f'"{name}"' in rust_build
        path = tmp_path / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(b"original\r\n")
        before = host_fingerprint(tmp_path)
        path.write_bytes(b"original\n")
        assert host_fingerprint(tmp_path) == before
        path.write_bytes(b"updated helper\n")
        assert host_fingerprint(tmp_path) != before


def keys():
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw, serialization.PublicFormat.Raw
        )
    ).decode()
    raw = base64.b64encode(
        private.private_bytes(
            serialization.Encoding.Raw,
            serialization.PrivateFormat.Raw,
            serialization.NoEncryption(),
        )
    ).decode()
    return private, public, raw


def plugin(path, version, files):
    path.mkdir(parents=True)
    (path / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": version})
    )
    for name, content in files.items():
        dest = path / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(content)


def artifact(path, private):
    raw = path.read_bytes()
    return {
        "url": "https://example.test/" + path.name,
        "size": len(raw),
        "sha256": hashlib.sha256(raw).hexdigest(),
        "signature": base64.b64encode(private.sign(raw)).decode(),
    }


def test_hash_version_changed_content_is_offered(tmp_path):
    installed = tmp_path / "old"
    installed.mkdir()
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"python-packages"},
        directory_components={"python-packages"},
        core_version="2.2.1",
        bundled_directory_records={
            "python-packages": ("0+sha.ffffffffffffffff", installed)
        },
    )
    manifest = {
        "components": {
            "python-packages": {
                "version": "0+sha.aaaaaaaaaaaaaaaa",
                "preserve": [],
                "full": {
                    "url": "https://example.test/full.zip",
                    "sha256": "a" * 64,
                },
            }
        }
    }
    assert (
        updater.plan(manifest, "python-packages", installed).target_version
        == "0+sha.aaaaaaaaaaaaaaaa"
    )


def test_hash_version_delta_builds_in_either_lexical_direction(tmp_path):
    _, _, private = keys()
    common = random.Random(7).randbytes(100_000)
    for root, version in [
        ("old", "0+sha.ffffffffffffffff"),
        ("new", "0+sha.aaaaaaaaaaaaaaaa"),
    ]:
        path = tmp_path / root / "python-packages"
        path.mkdir(parents=True)
        (path / "component.json").write_text(
            json.dumps(
                {
                    "schema_version": 1,
                    "id": "python-packages",
                    "version": version,
                    "preserve": [],
                    "install_scope": "desktop-runtime",
                }
            )
        )
        (path / "unchanged.bin").write_bytes(common)
    build_release(
        source_root=tmp_path / "new",
        output_root=tmp_path / "out",
        base_root=tmp_path / "old",
        target="windows-x86_64",
        core_min_version="2.2.1",
        base_url="https://example.test",
        private_key_b64=private,
        product="qwenpaw",
        channel="stable",
    )


def test_legacy_bundle_without_descriptor_accepts_verified_delta(tmp_path):
    private, public, _ = keys()
    for label, version in [("old", "1.0.0"), ("new", "1.1.0")]:
        binaries = tmp_path / label / "binaries"
        source = binaries / "backend"
        source.mkdir(parents=True)
        (source / "main.py").write_text("print(" + repr(version) + ")")
        (binaries / "state").mkdir()
        (binaries / "state" / "active.json").write_text(
            json.dumps(
                {
                    "schemaVersion": 1,
                    "components": {
                        "backend": {
                            "version": version,
                            "path": "binaries/backend",
                            "kind": "python",
                        }
                    },
                }
            )
        )
        stage(binaries, tmp_path / (label + "-staged"), version)
    archive = tmp_path / "delta.zip"
    delta = write_delta(
        tmp_path / "old-staged/backend",
        tmp_path / "new-staged/backend",
        archive,
        (),
    )
    bundled = tmp_path / "old/binaries/backend"
    assert "component.json" in delta["base_files"]
    assert not (bundled / "component.json").exists()
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"backend"},
        directory_components={"backend"},
        core_version="2.2.1",
        bundled_directory_records={"backend": ("1.0.0", bundled)},
    )
    entry = artifact(archive, private)
    plan = ComponentUpdatePlan(
        "backend",
        "1.0.0",
        "1.1.0",
        "delta",
        entry["url"],
        entry["sha256"],
        entry["signature"],
        (),
    )
    updater.apply_delta(
        plan, bundled, archive, tmp_path / "managed/backend/1.1.0"
    )


@pytest.mark.parametrize("fault", ["directory_to_file", "http_404"])
def test_structural_delta_and_download_failure_recover(
    tmp_path, monkeypatch, fault
):
    private, public, _ = keys()
    plugins = tmp_path / "plugins"
    installed, target = plugins / "demo", tmp_path / "target"
    plugin(installed, "1.0.0", {"module/old.py": b"old"})
    plugin(target, "1.1.0", {"module": b"new"})
    delta_path, full_path = tmp_path / "delta.zip", tmp_path / "full.zip"
    delta = write_delta(installed, target, delta_path)
    _full_zip(target, full_path)
    delta_entry, full_entry = artifact(delta_path, private), artifact(
        full_path, private
    )
    manifest = {
        "components": {
            "demo": {
                "version": "1.1.0",
                "files": delta["final_files"],
                "full": full_entry,
                "deltas": [{"from": "1.0.0", **delta_entry}],
            }
        }
    }
    calls = []

    class Client:
        def download_artifact(self, url, **kwargs):
            calls.append(url)
            if url.endswith("delta.zip"):
                if fault == "http_404":
                    httpx.Response(
                        404, request=httpx.Request("GET", url)
                    ).raise_for_status()
                return delta_path
            return full_path

    monkeypatch.setattr(service_module, "get_plugins_dir", lambda: plugins)
    monkeypatch.setattr(
        service_module, "_ADOPTED_COMPONENTS_PATH", tmp_path / "adopted.json"
    )
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"demo"},
        core_version="2.2.1",
    )
    service = ComponentUpdateService(updater, Client(), "https://example.test")
    result = service._install_component("demo", manifest=manifest)
    assert result["updated"]
    assert calls == (
        [delta_entry["url"], full_entry["url"]]
        if fault == "http_404"
        else [delta_entry["url"]]
    )
    full_plan = ComponentUpdatePlan(
        "demo",
        "1.0.0",
        "1.1.0",
        "full",
        full_entry["url"],
        full_entry["sha256"],
        full_entry["signature"],
    )
    updater.apply_full(
        full_plan, full_path, installed, expected_files=delta["final_files"]
    )
    assert (installed / "module").read_bytes() == b"new"


def test_new_bundle_supersedes_old_managed_backend(tmp_path, monkeypatch):
    managed = tmp_path / "managed/backend/2.1.0"
    bundled = tmp_path / "bundle/backend/2.2.0"
    managed.mkdir(parents=True)
    bundled.mkdir(parents=True)
    pointer = tmp_path / "active.json"
    pointer.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "target": "windows-x86_64",
                "components": {
                    "backend": {"version": "2.1.0", "path": str(managed)}
                },
            }
        )
    )
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"backend"},
        directory_components={"backend"},
        core_version="2.2.0",
        target="windows-x86_64",
        active_path=pointer,
        bundled_directory_records={"backend": ("2.2.0", bundled)},
    )
    monkeypatch.setattr(
        service_module, "_MANAGED_COMPONENTS_ROOT", tmp_path / "managed"
    )
    assert (
        service_module._resolve_installed_directory(updater, "backend")
        == bundled
    )


@pytest.mark.parametrize("fail", [False, True])
def test_runtime_transaction_publishes_once_and_preserves_plugins(
    tmp_path, fail
):
    pointer = tmp_path / "active.json"
    original = {
        "schema_version": 1,
        "target": "windows-x86_64",
        "components": {
            "backend": {"version": "1.0.0", "path": str(tmp_path / "old")},
            "demo": {"version": "4.0.0", "path": str(tmp_path / "plugin")},
        },
    }
    pointer.write_text(json.dumps(original))
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"backend", "python-packages"},
        directory_components={"backend", "python-packages"},
        core_version="2.2.2b7",
        target="windows-x86_64",
        active_path=pointer,
    )

    def install():
        with updater.directory_transaction():
            updater._commit_active("backend", "1.1.0", tmp_path / "new")
            assert json.loads(pointer.read_text()) == original
            if fail:
                raise ComponentUpdateError(
                    "second component failed verification"
                )
            updater._commit_active(
                "python-packages", "0+sha.aaaa", tmp_path / "packages"
            )
            assert json.loads(pointer.read_text()) == original

    if fail:
        with pytest.raises(ComponentUpdateError):
            install()
        assert json.loads(pointer.read_text()) == original
    else:
        install()
        active = json.loads(pointer.read_text())
        assert active["components"]["backend"]["version"] == "1.1.0"
        assert (
            active["components"]["python-packages"]["version"] == "0+sha.aaaa"
        )
        assert active["components"]["demo"] == original["components"]["demo"]
        assert active["previous_runtime_components"] == {
            "backend": original["components"]["backend"]
        }
    assert updater._directory_records is None


def test_pointer_renewal_preserves_release_and_rejects_tampered_artifacts(
    tmp_path,
):
    private, _, key = keys()
    plugin(tmp_path / "source/demo", "1.1.0", {"plugin.py": b"# release"})
    manifest = build_release(
        source_root=tmp_path / "source",
        output_root=tmp_path / "out",
        target="windows-x86_64",
        core_min_version="2.2.2b7",
        base_url="https://example.test",
        private_key_b64=key,
        product="qwenpaw",
        channel="stable",
        release_id="regression",
    )
    pointer = manifest.parent / "windows-x86_64.current.json"
    history = manifest.parent / "windows-x86_64-regression.history.json"
    output = tmp_path / "renewed.json"
    old = json.loads(pointer.read_text())
    now = datetime(2099, 1, 1, tzinfo=timezone.utc)
    renew(
        pointer,
        output,
        private_key_b64=key,
        target="windows-x86_64",
        manifest=manifest,
        history=history,
        now=now,
    )
    renewed = _load_verified(output, private, "windows-x86_64")
    assert renewed["expires_at"] == "2099-01-31T00:00:00Z"
    for name in old.keys() - {"signature", "published_at", "expires_at"}:
        assert renewed[name] == old[name]
    manifest.write_bytes(manifest.read_bytes() + b" ")
    with pytest.raises(ValueError, match="does not match signed pointer"):
        renew(
            pointer,
            output,
            private_key_b64=key,
            target="windows-x86_64",
            manifest=manifest,
            history=history,
        )


def test_host_fingerprint_is_platform_independent_and_detects_native_changes(
    tmp_path,
):
    file = tmp_path / "console/src-tauri/src/main.rs"
    file.parent.mkdir(parents=True)
    file.write_bytes(b"fn main() {}\n")
    initial = host_fingerprint(tmp_path)
    file.write_bytes(b"fn main() {}\r\n")
    assert host_fingerprint(tmp_path) == initial
    generated_icon = tmp_path / "console/src-tauri/icons/icon.ico"
    generated_icon.parent.mkdir(parents=True)
    generated_icon.write_bytes(b"platform-specific generated icon")
    assert host_fingerprint(tmp_path) == initial
    source_icon = tmp_path / "scripts/pack/assets/icon.svg"
    source_icon.parent.mkdir(parents=True)
    source_icon.write_text("<svg/>")
    assert host_fingerprint(tmp_path) != initial
    source_icon.unlink()
    file.write_bytes(b"fn main() { changed(); }\n")
    assert host_fingerprint(tmp_path) != initial


@pytest.mark.parametrize("valid", [True, False])
def test_startup_validates_runtime_before_pointer_and_defers_plugins(
    tmp_path, monkeypatch, valid
):
    from types import SimpleNamespace

    monkeypatch.delenv("QWENPAW_COMPONENT_PROTOCOL", raising=False)
    monkeypatch.setattr(
        service_module, "_PENDING_UPDATES_PATH", tmp_path / "pending.json"
    )
    monkeypatch.setattr(
        service_module, "_COMPONENT_INSTALL_LOCKS", tmp_path / "locks"
    )
    service_module._store_pending_records(
        {
            key: service_module._new_pending_record()
            for key in ("backend", "demo")
        }
    )
    pointer = tmp_path / "active.json"
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"backend", "python-packages", "demo"},
        core_version="2.2.2b7",
        directory_components={"backend", "python-packages"},
        target="windows-x86_64",
        active_path=pointer,
    )
    calls = []

    def install(component, manifest):
        calls.append(component)
        updater._commit_active(component, "1.1.0", tmp_path / component)
        assert not pointer.exists()
        return {"component": component, "updated": True}

    def validate(candidate):
        assert candidate is updater
        assert set(candidate._directory_records) == {
            "backend",
            "python-packages",
        }
        assert not pointer.exists()
        if not valid:
            raise ComponentUpdateError("candidate imports failed")

    service = SimpleNamespace(
        updater=updater,
        client=SimpleNamespace(close=lambda: None),
        snapshot=lambda: (
            {"components": {}},
            [
                {"component": key}
                for key in ("backend", "python-packages", "demo")
            ],
        ),
        _install_from_manifest=install,
    )
    monkeypatch.setattr(service_module, "configured_service", lambda: service)
    monkeypatch.setattr(service_module, "_validate_runtime_set", validate)
    result = service_module.run_startup_updates()
    assert calls == ["backend", "python-packages"]
    assert bool(result.get("runtime_restart_required")) is valid
    assert pointer.exists() is valid
    pending = service_module._load_pending_records()
    assert set(pending) == (
        {"demo"} if valid else {"demo", "backend", "python-packages"}
    )


def test_protocol_two_requires_matching_host_and_supports_separate_release_version(
    tmp_path, monkeypatch
):
    _, public, key = keys()
    plugin(tmp_path / "source/demo", "1.1.0", {"plugin.py": b"# update"})
    path = build_release(
        source_root=tmp_path / "source",
        output_root=tmp_path / "out",
        target="windows-x86_64",
        core_min_version="2.2.2b7",
        release_version="2.3.0",
        protocol_version=2,
        base_url="https://example.test",
        private_key_b64=key,
        product="qwenpaw",
        channel="stable",
    )
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"demo"},
        core_version="2.2.2b7",
        target="windows-x86_64",
    )
    monkeypatch.setenv("QWENPAW_TAURI_RESOURCE_DIR", str(tmp_path))
    monkeypatch.setenv("QWENPAW_COMPONENT_PROTOCOL", "2")
    monkeypatch.setenv("QWENPAW_HOST_FINGERPRINT", "different")
    with pytest.raises(ComponentUpdateError, match="host changed"):
        updater.load_manifest(path, path.with_suffix(".json.sig"))
    monkeypatch.setenv(
        "QWENPAW_HOST_FINGERPRINT",
        json.loads(path.read_text())["host_fingerprint"],
    )
    assert (
        updater.load_manifest(path, path.with_suffix(".json.sig"))[
            "release_version"
        ]
        == "2.3.0"
    )
    monkeypatch.setenv("QWENPAW_COMPONENT_PROTOCOL", "1")
    with pytest.raises(ComponentUpdateError, match="host upgrade"):
        updater.load_manifest(path, path.with_suffix(".json.sig"))


def test_regular_release_gates_and_renewal_share_safe_publication_order():
    import yaml

    workflows = ROOT / ".github/workflows"
    release = yaml.safe_load(
        (workflows / "release.yml").read_text(encoding="utf-8")
    )["jobs"]
    assert "build-desktop" in release["build-components"]["needs"]
    assert (
        release["build-components"]["with"]["include_desktop_components"]
        is True
    )
    assert "build-components" in release["publish-desktop"]["needs"]
    assert "publish-components" in release["finalize"]["needs"]
    assert "finalize" in release["promote-components"]["needs"]
    assert "promote-components" in release["promote-desktop"]["needs"]
    renewal = yaml.safe_load(
        (workflows / "component-pointer-renewal.yml").read_text(
            encoding="utf-8"
        )
    )
    assert renewal["concurrency"]["group"] == "oss-production-metadata"


def test_descriptor_refresh_after_codesign_matches_installer_and_staging(
    tmp_path,
):
    from refresh_desktop_descriptors import refresh
    from component_common import file_inventory

    binaries = tmp_path / "binaries"
    packages = binaries / "packages"
    packages.mkdir(parents=True)
    native = packages / "Z_extension.so"
    native.write_bytes(b"unsigned native library")
    (packages / "a.py").write_bytes(b"# source\n")
    active = {
        "schemaVersion": 1,
        "target": "macos-aarch64",
        "components": {
            "python-packages": {
                "version": "0+sha.oldlock",
                "path": "binaries/packages",
            }
        },
    }
    before = refresh(binaries, "2.2.2b7", active)["components"][
        "python-packages"
    ]["version"]
    native.write_bytes(b"native library with an Apple code signature")
    after = refresh(binaries, "2.2.2b7")["components"]["python-packages"][
        "version"
    ]
    assert after != before
    staging = tmp_path / "staging"
    assert stage(binaries, staging, "2.2.2b7")[0]["version"] == after
    assert file_inventory(packages, ()) == file_inventory(
        staging / "python-packages", ()
    )
    assert (
        refresh(binaries, "2.2.2b7")["components"]["python-packages"][
            "version"
        ]
        == after
    )
