# -*- coding: utf-8 -*-
# pylint: disable=protected-access,unused-argument
from __future__ import annotations

import base64
import hashlib
import json
import os
import shutil
import zipfile
from pathlib import Path

import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from qwenpaw.components.update import ComponentUpdateError, ComponentUpdater
from qwenpaw.components.update import ComponentUpdatePlan
import qwenpaw.components.update as component_update


def _plugin(root: Path, version: str, **files: str) -> None:
    root.mkdir(parents=True)
    (root / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": version}),
        encoding="utf-8",
    )
    for name, value in files.items():
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(value, encoding="utf-8")


def test_signed_manifest_and_plan(tmp_path):
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    raw = json.dumps(
        {
            "schema_version": 1,
            "target": "windows-x86_64",
            "core_min_version": "1.0.0",
            "components": {
                "demo": {
                    "version": "1.1.0",
                    "full": {
                        "url": "https://example/full.zip",
                        "sha256": "a" * 64,
                        "size": 10,
                        "signature": "sig",
                    },
                    "deltas": [
                        {
                            "from": "1.0.0",
                            "url": "https://example/delta.zip",
                            "sha256": "b" * 64,
                            "size": 5,
                            "signature": "sig",
                        },
                    ],
                },
            },
        },
        separators=(",", ":"),
    ).encode()
    manifest = tmp_path / "manifest.json"
    signature = tmp_path / "manifest.sig"
    manifest.write_bytes(raw)
    signature.write_text(
        base64.b64encode(private.sign(raw)).decode(),
        encoding="utf-8",
    )
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    loaded = updater.load_manifest(manifest, signature)
    plan = updater.plan(loaded, "demo", tmp_path / "installed")
    assert plan and plan.artifact_kind == "full"


def test_directory_component_plans_from_atomic_active_pointer(tmp_path):
    active = tmp_path / "state" / "active.json"
    installed = tmp_path / "managed" / "backend" / "1.0.0"
    installed.mkdir(parents=True)
    active.parent.mkdir()
    active.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "target": "windows-x86_64",
                "components": {
                    "backend": {
                        "version": "1.0.0",
                        "path": str(installed.absolute()),
                    },
                },
            },
        ),
        encoding="utf-8",
    )
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"backend"},
        directory_components={"backend"},
        target="windows-x86_64",
        core_version="1.0.0",
        active_path=active,
    )
    manifest = {
        "components": {
            "backend": {
                "version": "1.1.0",
                "deltas": [
                    {
                        "from": "1.0.0",
                        "url": "https://oss/backend.delta.zip",
                        "sha256": "a" * 64,
                        "signature": "sig",
                    },
                ],
                "full": {},
            },
        },
    }

    plan = updater.plan(manifest, "backend", installed)

    assert plan is not None
    assert plan.from_version == "1.0.0"
    assert plan.artifact_kind == "delta"
    assert not plan.preserve_paths


def test_directory_component_at_target_version_has_no_plan(tmp_path):
    active = tmp_path / "state" / "active.json"
    installed = tmp_path / "managed" / "backend" / "1.1.0"
    installed.mkdir(parents=True)
    active.parent.mkdir()
    active.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "target": "windows-x86_64",
                "components": {
                    "backend": {
                        "version": "1.1.0",
                        "path": str(installed.absolute()),
                        "kind": "python",
                    },
                },
            },
        ),
        encoding="utf-8",
    )
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"backend"},
        directory_components={"backend"},
        target="windows-x86_64",
        core_version="1.0.0",
        active_path=active,
    )

    assert (
        updater.plan(
            {
                "components": {
                    "backend": {
                        "version": "1.1.0",
                        "full": {
                            "url": "https://oss/backend.zip",
                            "sha256": "a" * 64,
                            "signature": "sig",
                        },
                    },
                },
            },
            "backend",
            installed,
        )
        is None
    )


def test_bundled_directory_component_is_used_as_fresh_install_baseline(
    tmp_path,
):
    bundled = tmp_path / "resources" / "binaries" / "app" / "backend"
    bundled.mkdir(parents=True)
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"backend"},
        directory_components={"backend"},
        bundled_directory_records={"backend": ("1.1.0", bundled.absolute())},
        target="windows-x86_64",
        core_version="1.0.0",
    )

    assert (
        updater.plan(
            {
                "components": {
                    "backend": {
                        "version": "1.1.0",
                        "full": {
                            "url": "https://oss/backend.zip",
                            "sha256": "a" * 64,
                            "signature": "sig",
                        },
                    },
                },
            },
            "backend",
            bundled,
        )
        is None
    )


def test_directory_component_full_activation_is_versioned(tmp_path):
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    archive = tmp_path / "backend.zip"
    payload = b"new backend"
    with zipfile.ZipFile(archive, "w") as bundle:
        bundle.writestr("qwenpaw/__init__.py", payload)
    signature = base64.b64encode(private.sign(archive.read_bytes())).decode()
    expected = {
        "qwenpaw/__init__.py": {
            "size": len(payload),
            "sha256": hashlib.sha256(payload).hexdigest(),
        },
    }
    active = tmp_path / "state" / "active.json"
    old = tmp_path / "managed" / "backend" / "1.0.0"
    old.mkdir(parents=True)
    (old / "old.py").write_text("old", encoding="utf-8")
    active.parent.mkdir()
    active.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "components": {
                    "backend": {
                        "version": "1.0.0",
                        "path": str(old.absolute()),
                    },
                },
            },
        ),
        encoding="utf-8",
    )
    destination = tmp_path / "managed" / "backend" / "1.1.0"
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"backend"},
        directory_components={"backend"},
        target="windows-x86_64",
        core_version="1.0.0",
        active_path=active,
    )
    plan = ComponentUpdatePlan(
        "backend",
        "1.0.0",
        "1.1.0",
        "full",
        "https://oss/backend.zip",
        hashlib.sha256(archive.read_bytes()).hexdigest(),
        signature,
        (),
    )

    updater.apply_full(plan, archive, destination, expected_files=expected)

    pointer = json.loads(active.read_text(encoding="utf-8"))
    assert pointer["components"]["backend"] == {
        "kind": "python",
        "path": str(destination),
        "version": "1.1.0",
    }
    assert (destination / "qwenpaw" / "__init__.py").read_bytes() == payload
    assert (old / "old.py").is_file()


def test_directory_component_delta_does_not_require_plugin_json(tmp_path):
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    base = tmp_path / "managed" / "node-runtime" / "20.0.0"
    base.mkdir(parents=True)
    (base / "node.exe").write_bytes(b"old")
    new_bytes = b"new"
    final_files = {
        "node.exe": {
            "size": len(new_bytes),
            "sha256": hashlib.sha256(new_bytes).hexdigest(),
        },
    }
    archive = tmp_path / "node.delta.zip"
    with zipfile.ZipFile(archive, "w") as bundle:
        bundle.writestr(
            "delta.json",
            json.dumps(
                {
                    "component": "node-runtime",
                    "base_version": "20.0.0",
                    "target_version": "20.0.1",
                    "base_files": component_update._inventory(base, ()),
                    "delete": [],
                    "add": [],
                    "replace": ["node.exe"],
                    "final_files": final_files,
                },
            ),
        )
        bundle.writestr("files/node.exe", new_bytes)
    signature = base64.b64encode(private.sign(archive.read_bytes())).decode()
    active = tmp_path / "state" / "active.json"
    active.parent.mkdir()
    active.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "components": {
                    "node-runtime": {
                        "version": "20.0.0",
                        "path": str(base),
                    },
                },
            },
        ),
        encoding="utf-8",
    )
    destination = base.parent / "20.0.1"
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"node-runtime"},
        directory_components={"node-runtime"},
        target="windows-x86_64",
        core_version="1.0.0",
        active_path=active,
    )
    plan = ComponentUpdatePlan(
        "node-runtime",
        "20.0.0",
        "20.0.1",
        "delta",
        "https://oss/node.delta.zip",
        hashlib.sha256(archive.read_bytes()).hexdigest(),
        signature,
        (),
    )

    updater.apply_delta(plan, base, archive, destination)

    assert (destination / "node.exe").read_bytes() == new_bytes
    assert (base / "node.exe").read_bytes() == b"old"
    pointer = json.loads(active.read_text(encoding="utf-8"))
    assert pointer["components"]["node-runtime"]["version"] == "20.0.1"


def test_signature_verification_accepts_omitted_base64_padding():
    private = Ed25519PrivateKey.generate()
    public = (
        base64.b64encode(
            private.public_key().public_bytes(
                serialization.Encoding.Raw,
                serialization.PublicFormat.Raw,
            ),
        )
        .decode()
        .rstrip("=")
    )
    data = b"signed component"
    signature = base64.b64encode(private.sign(data)).decode().rstrip("=")

    component_update._verify_signature(data, signature, public)


def test_signature_verification_rejects_impossible_base64_length():
    with pytest.raises(ComponentUpdateError, match="verification failed"):
        component_update._verify_signature(b"data", "A", "A")


def test_uninstalled_component_is_not_activated(tmp_path):
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    base = tmp_path / "base"
    destination = tmp_path / "destination"
    _plugin(base, "1.0.0", main="old")
    tombstones = destination.parent / ".uninstalled"
    tombstones.mkdir()
    (tombstones / "demo").write_text("1", encoding="utf-8")
    plan = type(
        "Plan",
        (),
        {
            "artifact_kind": "delta",
            "component": "demo",
            "artifact_sha256": "",
            "artifact_signature": "",
            "from_version": "1.0.0",
            "target_version": "1.1.0",
        },
    )()
    with pytest.raises(ComponentUpdateError, match="uninstalled"):
        updater.apply_delta(plan, base, tmp_path / "missing.zip", destination)


def test_delta_rejects_reparse_component_root(monkeypatch, tmp_path):
    plugins = tmp_path / "plugins"
    installed = plugins / "demo"
    _plugin(installed, "1.0.0", main="old")
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    plan = ComponentUpdatePlan(
        component="demo",
        from_version="1.0.0",
        target_version="1.1.0",
        artifact_kind="delta",
        artifact_url="https://example/delta.zip",
        artifact_sha256="a" * 64,
        artifact_signature="signature",
    )
    monkeypatch.setattr(
        component_update,
        "_is_link_like",
        lambda path: path == installed,
    )

    with pytest.raises(ComponentUpdateError, match="may not be a link"):
        updater.apply_delta(
            plan,
            installed,
            tmp_path / "missing.zip",
            installed,
        )


def test_delta_rejects_reparse_plugins_root(monkeypatch, tmp_path):
    plugins = tmp_path / "plugins"
    installed = plugins / "demo"
    _plugin(installed, "1.0.0", main="old")
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    plan = ComponentUpdatePlan(
        component="demo",
        from_version="1.0.0",
        target_version="1.1.0",
        artifact_kind="delta",
        artifact_url="https://example/delta.zip",
        artifact_sha256="a" * 64,
        artifact_signature="signature",
    )
    monkeypatch.setattr(
        component_update,
        "_is_link_like",
        lambda path: path == plugins,
    )

    with pytest.raises(ComponentUpdateError, match="plugins directory"):
        updater.apply_delta(
            plan,
            installed,
            tmp_path / "missing.zip",
            installed,
        )


def test_full_rejects_reparse_component_destination(monkeypatch, tmp_path):
    plugins = tmp_path / "plugins"
    destination = plugins / "demo"
    destination.mkdir(parents=True)
    archive = tmp_path / "full.zip"
    archive.write_bytes(b"archive")
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    plan = ComponentUpdatePlan(
        component="demo",
        from_version="1.0.0",
        target_version="1.1.0",
        artifact_kind="full",
        artifact_url="https://example/full.zip",
        artifact_sha256="a" * 64,
        artifact_signature="signature",
    )
    monkeypatch.setattr(component_update, "_sha256", lambda _path: "a" * 64)
    monkeypatch.setattr(
        component_update,
        "_verify_signature_file",
        lambda *_args: None,
    )
    monkeypatch.setattr(
        component_update,
        "_is_link_like",
        lambda path: path == destination,
    )

    with pytest.raises(ComponentUpdateError, match="may not be a link"):
        updater.apply_full(plan, archive, destination, expected_files={})


def test_full_rejects_reparse_plugins_root(monkeypatch, tmp_path):
    plugins = tmp_path / "plugins"
    destination = plugins / "demo"
    destination.mkdir(parents=True)
    archive = tmp_path / "full.zip"
    archive.write_bytes(b"archive")
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    plan = ComponentUpdatePlan(
        component="demo",
        from_version="1.0.0",
        target_version="1.1.0",
        artifact_kind="full",
        artifact_url="https://example/full.zip",
        artifact_sha256="a" * 64,
        artifact_signature="signature",
    )
    monkeypatch.setattr(component_update, "_sha256", lambda _path: "a" * 64)
    monkeypatch.setattr(
        component_update,
        "_verify_signature_file",
        lambda *_args: None,
    )
    monkeypatch.setattr(
        component_update,
        "_is_link_like",
        lambda path: path == plugins,
    )

    with pytest.raises(ComponentUpdateError, match="plugins directory"):
        updater.apply_full(plan, archive, destination, expected_files={})


def test_full_rejects_preserve_source_outside_plugins(monkeypatch, tmp_path):
    plugins = tmp_path / "plugins"
    destination = plugins / "demo"
    preserve_source = tmp_path / "outside"
    _plugin(preserve_source, "1.0.0", **{"data/db.json": "important"})
    archive = tmp_path / "full.zip"
    archive.write_bytes(b"archive")
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    plan = ComponentUpdatePlan(
        component="demo",
        from_version="1.0.0",
        target_version="1.1.0",
        artifact_kind="full",
        artifact_url="https://example/full.zip",
        artifact_sha256="a" * 64,
        artifact_signature="signature",
    )
    monkeypatch.setattr(component_update, "_sha256", lambda _path: "a" * 64)
    monkeypatch.setattr(
        component_update,
        "_verify_signature_file",
        lambda *_args: None,
    )

    with pytest.raises(ComponentUpdateError, match="preserve source"):
        updater.apply_full(
            plan,
            archive,
            destination,
            expected_files={},
            preserve_from=preserve_source,
        )


def test_component_plan_respects_tombstone_without_install_directory(tmp_path):
    plugins = tmp_path / "plugins"
    tombstones = plugins / ".uninstalled"
    tombstones.mkdir(parents=True)
    (tombstones / "demo").write_text("1", encoding="utf-8")
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    manifest = {
        "components": {
            "demo": {
                "version": "1.1.0",
                "full": {
                    "url": "https://example/full.zip",
                    "sha256": "a" * 64,
                    "signature": "sig",
                },
            },
        },
    }

    assert (
        updater.plan(
            manifest,
            "demo",
            None,
            plugins_root=plugins,
        )
        is None
    )


def test_delta_can_atomically_replace_installed_directory(tmp_path):
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    installed = tmp_path / "plugins" / "demo"
    _plugin(installed, "1.0.0", main="old")
    target = tmp_path / "target"
    _plugin(target, "1.1.0", main="new")
    scripts = Path(__file__).resolve().parents[3] / "scripts" / "pack-tauri"
    import sys

    sys.path.insert(0, str(scripts))
    try:
        from build_component_delta import write_delta

        archive = tmp_path / "delta.zip"
        write_delta(installed, target, archive)
    finally:
        sys.path.remove(str(scripts))
    signature = base64.b64encode(private.sign(archive.read_bytes())).decode()
    plan = ComponentUpdatePlan(
        "demo",
        "1.0.0",
        "1.1.0",
        "delta",
        "https://oss/delta.zip",
        hashlib.sha256(archive.read_bytes()).hexdigest(),
        signature,
    )
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    updater.apply_delta(plan, installed, archive, installed)
    assert (
        json.loads((installed / "plugin.json").read_text(encoding="utf-8"))[
            "version"
        ]
        == "1.1.0"
    )


def test_deferred_activation_keeps_previous_until_health_commit(tmp_path):
    destination = tmp_path / "plugins" / "demo"
    _plugin(destination, "1.0.0", main="old")
    staged = tmp_path / "staged"
    _plugin(staged, "1.1.0", main="new")
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
        defer_activation_cleanup=True,
    )
    updater._atomic_activate(staged, destination, "demo", "1.1.0")
    previous = destination.parent / ".demo.previous"
    assert previous.is_dir()
    assert (destination.parent / ".demo.activation.json").is_file()
    updater.finalize_activation("demo", destination)
    assert not previous.exists()
    assert not (destination.parent / ".demo.activation.json").exists()


def test_atomic_activation_rejects_link_like_marker_and_restores_previous(
    monkeypatch,
    tmp_path,
):
    destination = tmp_path / "plugins" / "demo"
    _plugin(destination, "1.0.0", main="old")
    staged = tmp_path / "staged"
    _plugin(staged, "1.1.0", main="new")
    marker = destination.parent / ".demo.activation.json"
    original_is_link_like = component_update._is_link_like
    monkeypatch.setattr(
        component_update,
        "_is_link_like",
        lambda path: path == marker or original_is_link_like(path),
    )
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
        defer_activation_cleanup=True,
    )

    with pytest.raises(ComponentUpdateError, match="unsafe activation marker"):
        updater._atomic_activate(staged, destination, "demo", "1.1.0")

    restored = json.loads(
        (destination / "plugin.json").read_text(encoding="utf-8"),
    )
    assert restored["version"] == "1.0.0"
    assert not (destination.parent / ".demo.previous").exists()
    assert not list(
        destination.parent.glob("..demo.activation.json.*.staging"),
    )


def test_failed_new_component_rolls_back_and_removes_active(tmp_path):
    destination = tmp_path / "plugins" / "demo"
    staged = tmp_path / "staged"
    _plugin(staged, "1.1.0", main="new")
    active = tmp_path / "components" / "active.json"
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
        active_path=active,
        defer_activation_cleanup=True,
    )
    updater._atomic_activate(staged, destination, "demo", "1.1.0")
    assert updater.rollback_activation("demo", destination) is False
    assert not destination.exists()
    assert (
        not active.exists()
        or "demo" not in json.loads(active.read_text())["components"]
    )


def test_manifest_migration_metadata_is_validated(tmp_path):
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    raw = json.dumps(
        {
            "schema_version": 1,
            "target": "windows-x86_64",
            "core_min_version": "1.0.0",
            "components": {
                "demo": {
                    "version": "1.1.0",
                    "migration": {
                        "hook": "migrate:upgrade",
                        "from": "1.0.0",
                        "to": "1.1.0",
                    },
                    "full": {
                        "url": "https://example/full.zip",
                        "sha256": "a" * 64,
                        "size": 1,
                        "signature": "sig",
                    },
                },
            },
        },
        separators=(",", ":"),
    ).encode()
    manifest = tmp_path / "manifest.json"
    signature = tmp_path / "manifest.sig"
    manifest.write_bytes(raw)
    signature.write_text(
        base64.b64encode(private.sign(raw)).decode(),
        encoding="utf-8",
    )
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    loaded = updater.load_manifest(manifest, signature)
    plan = updater.plan(loaded, "demo", tmp_path / "installed")
    assert plan is not None and plan.migration["hook"] == "migrate:upgrade"


def test_active_pointer_is_atomic_and_optional(tmp_path):
    active = tmp_path / "components" / "active.json"
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
        active_path=active,
    )
    updater._commit_active("demo", "1.1.0", tmp_path / "plugins" / "demo")
    payload = json.loads(active.read_text(encoding="utf-8"))
    assert payload["components"]["demo"]["version"] == "1.1.0"


def test_full_update_preserves_user_engines(tmp_path):
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    installed = tmp_path / "plugins" / "legacy-demo"
    _plugin(installed, "1.0.0", **{"engines/user.json": "user-data"})
    archive = tmp_path / "full.zip"
    plugin_bytes = json.dumps({"id": "demo", "version": "1.1.0"}).encode()
    main_bytes = b"new-code"
    with zipfile.ZipFile(archive, "w") as bundle:
        bundle.writestr("plugin.json", plugin_bytes)
        bundle.writestr("main.py", main_bytes)
    signature = base64.b64encode(private.sign(archive.read_bytes())).decode()
    plan = ComponentUpdatePlan(
        "demo",
        "1.0.0",
        "1.1.0",
        "full",
        "https://oss/full.zip",
        hashlib.sha256(archive.read_bytes()).hexdigest(),
        signature,
    )
    expected = {
        "main.py": {
            "size": len(main_bytes),
            "sha256": hashlib.sha256(main_bytes).hexdigest(),
        },
        "plugin.json": {
            "size": len(plugin_bytes),
            "sha256": hashlib.sha256(plugin_bytes).hexdigest(),
        },
    }
    destination = tmp_path / "plugins" / "demo"
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    updater.apply_full(
        plan,
        archive,
        destination,
        expected_files=expected,
        preserve_from=installed,
    )
    assert (destination / "engines" / "user.json").read_text(
        encoding="utf-8",
    ) == "user-data"


def test_full_update_backups_and_restores_all_default_user_data(tmp_path):
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    installed = tmp_path / "plugins" / "legacy-demo"
    _plugin(
        installed,
        "1.0.0",
        **{
            "engines/user.json": "engine",
            "data/db.json": "data",
            "state/session.json": "state",
            "workspace/note.txt": "workspace",
            "models/model.bin": "model",
            "user-data/profile.json": "profile",
        },
    )
    archive = tmp_path / "full.zip"
    plugin_bytes = json.dumps({"id": "demo", "version": "1.1.0"}).encode()
    with zipfile.ZipFile(archive, "w") as bundle:
        bundle.writestr("plugin.json", plugin_bytes)
        bundle.writestr("main.py", b"new-code")
    signature = base64.b64encode(private.sign(archive.read_bytes())).decode()
    preserve = ("engines", "data", "state", "workspace", "models", "user-data")
    plan = ComponentUpdatePlan(
        "demo",
        "1.0.0",
        "1.1.0",
        "full",
        "https://oss/full.zip",
        hashlib.sha256(archive.read_bytes()).hexdigest(),
        signature,
        preserve,
    )
    expected = {
        "main.py": {
            "size": 8,
            "sha256": hashlib.sha256(b"new-code").hexdigest(),
        },
        "plugin.json": {
            "size": len(plugin_bytes),
            "sha256": hashlib.sha256(plugin_bytes).hexdigest(),
        },
    }
    backup_root = tmp_path / "backups"
    destination = tmp_path / "plugins" / "demo"
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
        backup_root=backup_root,
    )
    updater.apply_full(
        plan,
        archive,
        destination,
        expected_files=expected,
        preserve_from=installed,
    )
    for relative, value in {
        "engines/user.json": "engine",
        "data/db.json": "data",
        "state/session.json": "state",
        "workspace/note.txt": "workspace",
        "models/model.bin": "model",
        "user-data/profile.json": "profile",
    }.items():
        assert (destination / relative).read_text(encoding="utf-8") == value
    backups = list((backup_root / "demo").glob("*/backup.json"))
    assert len(backups) == 1
    metadata = json.loads(backups[0].read_text(encoding="utf-8"))
    assert set(metadata["preserve"]) == {
        "engines",
        "data",
        "state",
        "workspace",
        "models",
        "user-data",
    }


def test_manifest_rejects_unsafe_preserve_path(tmp_path):
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    raw = json.dumps(
        {
            "schema_version": 1,
            "target": "windows-x86_64",
            "core_min_version": "1.0.0",
            "components": {
                "demo": {
                    "version": "1.1.0",
                    "preserve": ["../outside"],
                    "full": {
                        "url": "https://example/full.zip",
                        "sha256": "a" * 64,
                        "size": 1,
                        "signature": "sig",
                    },
                },
            },
        },
    ).encode()
    manifest = tmp_path / "manifest.json"
    signature = tmp_path / "manifest.sig"
    manifest.write_bytes(raw)
    signature.write_text(
        base64.b64encode(private.sign(raw)).decode(),
        encoding="utf-8",
    )
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    with pytest.raises(ComponentUpdateError, match="unsafe component path"):
        updater.load_manifest(manifest, signature)


def test_backup_failure_blocks_full_update(tmp_path, monkeypatch):
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    installed = tmp_path / "plugins" / "demo"
    _plugin(installed, "1.0.0", **{"data/db.json": "important"})
    archive = tmp_path / "full.zip"
    plugin_bytes = json.dumps({"id": "demo", "version": "1.1.0"}).encode()
    with zipfile.ZipFile(archive, "w") as bundle:
        bundle.writestr("plugin.json", plugin_bytes)
    signature = base64.b64encode(private.sign(archive.read_bytes())).decode()
    plan = ComponentUpdatePlan(
        "demo",
        "1.0.0",
        "1.1.0",
        "full",
        "https://oss/full.zip",
        hashlib.sha256(archive.read_bytes()).hexdigest(),
        signature,
    )
    expected = {
        "plugin.json": {
            "size": len(plugin_bytes),
            "sha256": hashlib.sha256(plugin_bytes).hexdigest(),
        },
    }
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    monkeypatch.setattr(
        updater,
        "_backup_component_data",
        lambda *_args, **_kwargs: (_ for _ in ()).throw(
            ComponentUpdateError("backup failed"),
        ),
    )
    with pytest.raises(ComponentUpdateError, match="backup failed"):
        updater.apply_full(
            plan,
            archive,
            installed,
            expected_files=expected,
            preserve_from=installed,
        )
    assert (
        json.loads((installed / "plugin.json").read_text(encoding="utf-8"))[
            "version"
        ]
        == "1.0.0"
    )
    assert (installed / "data" / "db.json").read_text(
        encoding="utf-8",
    ) == "important"


def test_overlapping_preserve_paths_are_rejected(tmp_path):
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    raw = json.dumps(
        {
            "schema_version": 1,
            "target": "windows-x86_64",
            "core_min_version": "1.0.0",
            "components": {
                "demo": {
                    "version": "1.1.0",
                    "preserve": ["data", "data/cache"],
                    "full": {
                        "url": "https://example/full.zip",
                        "sha256": "a" * 64,
                        "size": 1,
                        "signature": "sig",
                    },
                },
            },
        },
    ).encode()
    manifest = tmp_path / "manifest.json"
    signature = tmp_path / "manifest.sig"
    manifest.write_bytes(raw)
    signature.write_text(
        base64.b64encode(private.sign(raw)).decode(),
        encoding="utf-8",
    )
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    with pytest.raises(ComponentUpdateError, match="allowed data root"):
        updater.load_manifest(manifest, signature)


def test_interrupted_activation_restores_previous_before_planning(tmp_path):
    destination = tmp_path / "plugins" / "demo"
    previous = destination.parent / ".demo.previous"
    _plugin(previous, "1.0.0", **{"data/db.json": "important"})
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    expected = {
        "data/db.json": {
            "size": (previous / "data/db.json").stat().st_size,
            "sha256": hashlib.sha256(
                (previous / "data/db.json").read_bytes(),
            ).hexdigest(),
        },
        "plugin.json": {
            "size": (previous / "plugin.json").stat().st_size,
            "sha256": hashlib.sha256(
                (previous / "plugin.json").read_bytes(),
            ).hexdigest(),
        },
    }
    updater.recover_interrupted_activation(
        "demo",
        destination,
        expected_files=expected,
    )
    assert not previous.exists()
    assert (
        json.loads((destination / "plugin.json").read_text(encoding="utf-8"))[
            "version"
        ]
        == "1.0.0"
    )
    assert (destination / "data" / "db.json").read_text(
        encoding="utf-8",
    ) == "important"


def test_rollback_rejects_destination_outside_plugins(tmp_path):
    plugins = tmp_path / "plugins"
    plugins.mkdir()
    outside = tmp_path / "outside"
    outside.mkdir()
    sentinel = outside / "keep.txt"
    sentinel.write_text("important", encoding="utf-8")
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )

    with pytest.raises(ComponentUpdateError, match="plugins directory"):
        updater.rollback_activation("demo", plugins / "..")
    assert sentinel.read_text(encoding="utf-8") == "important"


def test_interrupted_activation_commits_valid_new_destination(tmp_path):
    destination = tmp_path / "plugins" / "demo"
    previous = destination.parent / ".demo.previous"
    _plugin(previous, "1.0.0", main="old")
    _plugin(destination, "1.1.0", main="new")
    expected = component_update._inventory(destination)
    active = tmp_path / "components" / "active.json"
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
        active_path=active,
    )
    updater.recover_interrupted_activation(
        "demo",
        destination,
        expected_files=expected,
        expected_version="1.1.0",
    )
    assert not previous.exists()
    assert (
        json.loads(active.read_text(encoding="utf-8"))["components"]["demo"][
            "version"
        ]
        == "1.1.0"
    )


def test_concurrent_active_commits_merge_sibling_components(
    tmp_path,
    monkeypatch,
):
    """Different updater instances cannot lose an active.json RMW update."""
    import threading
    import time

    active = tmp_path / "components" / "active.json"
    updaters = [
        ComponentUpdater(
            public_key_b64="",
            managed_components={"alpha", "beta"},
            target="windows-x86_64",
            core_version="1.0.0",
            active_path=active,
        )
        for _ in range(2)
    ]
    original = ComponentUpdater._write_active_payload
    writers = 0
    max_writers = 0
    writers_guard = threading.Lock()

    def slow_write(self, payload):
        nonlocal writers, max_writers
        with writers_guard:
            writers += 1
            max_writers = max(max_writers, writers)
        try:
            time.sleep(0.05)
            original(self, payload)
        finally:
            with writers_guard:
                writers -= 1

    monkeypatch.setattr(ComponentUpdater, "_write_active_payload", slow_write)
    threads = [
        threading.Thread(
            target=updater._commit_active,
            args=(component, "1.0.0", tmp_path / component),
        )
        for updater, component in zip(updaters, ("alpha", "beta"), strict=True)
    ]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join(timeout=5)
        assert not thread.is_alive()

    payload = json.loads(active.read_text(encoding="utf-8"))
    assert set(payload["components"]) == {"alpha", "beta"}
    assert max_writers == 1


def test_active_file_lock_is_reentrant_without_relocking_os_file(tmp_path):
    """Nested helpers in one thread must not self-deadlock on Windows."""
    active = tmp_path / "components" / "active.json"
    with component_update._active_file_lock(active):
        with component_update._active_file_lock(active):
            active.write_text("{}", encoding="utf-8")
    assert active.read_text(encoding="utf-8") == "{}"


def test_stale_previous_is_cleaned_when_active_matches_installed(tmp_path):
    destination = tmp_path / "plugins" / "demo"
    previous = destination.parent / ".demo.previous"
    _plugin(previous, "1.0.0", main="old")
    _plugin(destination, "1.1.0", main="current")
    active = tmp_path / "components" / "active.json"
    active.parent.mkdir(parents=True)
    active.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "target": "windows-x86_64",
                "components": {
                    "demo": {"version": "1.1.0", "path": str(destination)},
                },
            },
        ),
        encoding="utf-8",
    )
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
        active_path=active,
    )
    updater.recover_interrupted_activation(
        "demo",
        destination,
        expected_files={"not-current": {}},
        expected_version="1.2.0",
    )
    assert not previous.exists()
    assert (
        json.loads((destination / "plugin.json").read_text(encoding="utf-8"))[
            "version"
        ]
        == "1.1.0"
    )


def test_runtime_inventory_rejects_hard_links(tmp_path):
    component = tmp_path / "demo"
    _plugin(component, "1.0.0", main="content")
    try:
        os.link(component / "main", component / "alias")
    except OSError as exc:
        pytest.skip(f"hard links are unavailable: {exc}")
    with pytest.raises(ComponentUpdateError, match="hard link"):
        component_update._inventory(component)


def test_delta_restores_and_verifies_file_modes(monkeypatch, tmp_path):
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    installed = tmp_path / "plugins" / "demo"
    _plugin(installed, "1.0.0", main="old")
    plugin = json.dumps({"id": "demo", "version": "1.1.0"}).encode()
    main = b"new"
    base_plugin = (installed / "plugin.json").read_bytes()
    base_main = (installed / "main").read_bytes()
    inventory = lambda payload, mode: {
        "size": len(payload),
        "sha256": hashlib.sha256(payload).hexdigest(),
        "mode": mode,
    }
    delta = {
        "schema_version": 1,
        "component": "demo",
        "base_version": "1.0.0",
        "target_version": "1.1.0",
        "add": [],
        "delete": [],
        "replace": ["main", "plugin.json"],
        "base_files": {
            "main": inventory(base_main, 0o644),
            "plugin.json": inventory(base_plugin, 0o644),
        },
        "files": {
            "main": inventory(main, 0o755),
            "plugin.json": inventory(plugin, 0o644),
        },
        "final_files": {
            "main": inventory(main, 0o755),
            "plugin.json": inventory(plugin, 0o644),
        },
    }
    archive = tmp_path / "delta.zip"
    with zipfile.ZipFile(archive, "w") as bundle:
        bundle.writestr("delta.json", json.dumps(delta))
        bundle.writestr("files/main", main)
        bundle.writestr("files/plugin.json", plugin)
    modes: dict[str, int] = {}
    monkeypatch.setattr(
        component_update,
        "_supports_posix_modes",
        lambda: True,
    )
    monkeypatch.setattr(
        component_update,
        "_file_mode",
        lambda path: modes.get(path.name, 0o644),
    )
    monkeypatch.setattr(
        Path,
        "chmod",
        lambda path, mode: modes.__setitem__(path.name, mode),
    )
    signature = base64.b64encode(private.sign(archive.read_bytes())).decode()
    plan = ComponentUpdatePlan(
        "demo",
        "1.0.0",
        "1.1.0",
        "delta",
        "https://oss/delta.zip",
        hashlib.sha256(archive.read_bytes()).hexdigest(),
        signature,
    )
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"demo"},
        target="macos-aarch64",
        core_version="1.0.0",
    )

    updater.apply_delta(plan, installed, archive, installed)

    assert modes["main"] == 0o755
    assert component_update._inventory(installed)["main"]["mode"] == 0o755


def test_full_restores_and_verifies_file_modes(monkeypatch, tmp_path):
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    plugin = json.dumps({"id": "demo", "version": "1.1.0"}).encode()
    main = b"new"
    inventory = lambda payload, mode: {
        "size": len(payload),
        "sha256": hashlib.sha256(payload).hexdigest(),
        "mode": mode,
    }
    expected = {
        "main": inventory(main, 0o755),
        "plugin.json": inventory(plugin, 0o644),
    }
    archive = tmp_path / "full.zip"
    with zipfile.ZipFile(archive, "w") as bundle:
        bundle.writestr("main", main)
        bundle.writestr("plugin.json", plugin)
    modes: dict[str, int] = {}
    monkeypatch.setattr(
        component_update,
        "_supports_posix_modes",
        lambda: True,
    )
    monkeypatch.setattr(
        component_update,
        "_file_mode",
        lambda path: modes.get(path.name, 0o644),
    )
    monkeypatch.setattr(
        Path,
        "chmod",
        lambda path, mode: modes.__setitem__(path.name, mode),
    )
    signature = base64.b64encode(private.sign(archive.read_bytes())).decode()
    plan = ComponentUpdatePlan(
        "demo",
        None,
        "1.1.0",
        "full",
        "https://oss/full.zip",
        hashlib.sha256(archive.read_bytes()).hexdigest(),
        signature,
    )
    destination = tmp_path / "plugins" / "demo"
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"demo"},
        target="macos-aarch64",
        core_version="1.0.0",
    )

    updater.apply_full(plan, archive, destination, expected_files=expected)

    assert modes["main"] == 0o755
    assert component_update._inventory(destination)["main"]["mode"] == 0o755


def test_invalid_delta_json_is_wrapped(tmp_path):
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    installed = tmp_path / "plugins" / "demo"
    _plugin(installed, "1.0.0", main="old")
    archive = tmp_path / "delta.zip"
    with zipfile.ZipFile(archive, "w") as bundle:
        bundle.writestr("delta.json", b"{")
    signature = base64.b64encode(private.sign(archive.read_bytes())).decode()
    plan = ComponentUpdatePlan(
        "demo",
        "1.0.0",
        "1.1.0",
        "delta",
        "https://oss/delta.zip",
        hashlib.sha256(archive.read_bytes()).hexdigest(),
        signature,
    )
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )

    with pytest.raises(ComponentUpdateError, match="invalid delta.json JSON"):
        updater.apply_delta(plan, installed, archive, installed)


def test_invalid_full_plugin_json_is_wrapped(tmp_path):
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    plugin = b"{"
    archive = tmp_path / "full.zip"
    with zipfile.ZipFile(archive, "w") as bundle:
        bundle.writestr("plugin.json", plugin)
    signature = base64.b64encode(private.sign(archive.read_bytes())).decode()
    expected = {
        "plugin.json": {
            "size": len(plugin),
            "sha256": hashlib.sha256(plugin).hexdigest(),
        },
    }
    plan = ComponentUpdatePlan(
        "demo",
        None,
        "1.1.0",
        "full",
        "https://oss/full.zip",
        hashlib.sha256(archive.read_bytes()).hexdigest(),
        signature,
    )
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )

    with pytest.raises(ComponentUpdateError, match="invalid full plugin JSON"):
        updater.apply_full(
            plan,
            archive,
            tmp_path / "plugins" / "demo",
            expected_files=expected,
        )


def _p0_keypair():
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode()
    return private, public


def _p0_full_plan(private, archive, component="backend", target="2.0.0"):
    signature = base64.b64encode(private.sign(archive.read_bytes())).decode()
    return ComponentUpdatePlan(
        component,
        "1.0.0",
        target,
        "full",
        "https://oss/full.zip",
        hashlib.sha256(archive.read_bytes()).hexdigest(),
        signature,
        (),
    )


def test_full_directory_component_preserves_from_bundled_resource(tmp_path):
    """P0-1: first update after install must accept a preserve source inside
    the Tauri resource dir (a different parent than the managed destination).
    """
    private, public = _p0_keypair()
    archive = tmp_path / "backend.zip"
    payload = b"new backend"
    with zipfile.ZipFile(archive, "w") as bundle:
        bundle.writestr("qwenpaw/__init__.py", payload)
    expected = {
        "qwenpaw/__init__.py": {
            "size": len(payload),
            "sha256": hashlib.sha256(payload).hexdigest(),
        },
    }
    destination = tmp_path / "managed" / "backend" / "2.0.0"
    bundled = tmp_path / "resources" / "binaries" / "backend"
    (bundled / "data").mkdir(parents=True)
    (bundled / "data" / "user.json").write_text("user-data", encoding="utf-8")
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"backend"},
        directory_components={"backend"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    plan = _p0_full_plan(private, archive)

    # No preserve paths: nothing is copied, but the call must not reject the
    # bundled source merely for living outside the destination's parent.
    updater.apply_full(
        plan,
        archive,
        destination,
        expected_files=expected,
        preserve_from=bundled,
    )
    assert (destination / "qwenpaw" / "__init__.py").is_file()


def test_full_plugin_preserve_source_outside_plugins_still_rejected(tmp_path):
    """P0-1 guard rail: plugin components keep the strict sibling check."""
    private, public = _p0_keypair()
    archive = tmp_path / "demo.zip"
    payload = b"plugin"
    with zipfile.ZipFile(archive, "w") as bundle:
        bundle.writestr("plugin.json", b'{"id": "demo", "version": "2.0.0"}')
        bundle.writestr("keep.py", payload)
    expected = {
        "plugin.json": {
            "size": 31,
            "sha256": hashlib.sha256(
                b'{"id": "demo", "version": "2.0.0"}',
            ).hexdigest(),
        },
        "keep.py": {
            "size": len(payload),
            "sha256": hashlib.sha256(payload).hexdigest(),
        },
    }
    plugins = tmp_path / "plugins"
    destination = plugins / "demo"
    outside = tmp_path / "elsewhere" / "demo"
    outside.mkdir(parents=True)
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"demo"},
        target="windows-x86_64",
        core_version="1.0.0",
    )
    plan = _p0_full_plan(private, archive, component="demo")

    with pytest.raises(ComponentUpdateError, match="preserve source"):
        updater.apply_full(
            plan,
            archive,
            destination,
            expected_files=expected,
            preserve_from=outside,
        )


def test_delta_directory_component_base_may_be_bundled(tmp_path):
    """P0-1: delta base may live in the resource dir for directory components.

    Same scenario as test_delta_directory_component_activation but with the
    base tree under a DIFFERENT parent than the destination (the bundled
    resource dir), which the pre-fix sibling check rejected.
    """
    private, public = _p0_keypair()
    bundled = tmp_path / "resources" / "backend"
    bundled.mkdir(parents=True)
    (bundled / "runtime.dat").write_bytes(b"old")
    new_bytes = b"new"
    final_files = {
        "runtime.dat": {
            "size": len(new_bytes),
            "sha256": hashlib.sha256(new_bytes).hexdigest(),
        },
    }
    archive = tmp_path / "delta.zip"
    with zipfile.ZipFile(archive, "w") as bundle:
        bundle.writestr(
            "delta.json",
            json.dumps(
                {
                    "component": "backend",
                    "base_version": "1.0.0",
                    "target_version": "2.0.0",
                    "base_files": component_update._inventory(bundled, ()),
                    "delete": [],
                    "add": [],
                    "replace": ["runtime.dat"],
                    "final_files": final_files,
                },
            ),
        )
        bundle.writestr("files/runtime.dat", new_bytes)
    signature = base64.b64encode(private.sign(archive.read_bytes())).decode()
    active = tmp_path / "state" / "active.json"
    active.parent.mkdir()
    destination = tmp_path / "managed" / "backend" / "2.0.0"
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"backend"},
        directory_components={"backend"},
        target="windows-x86_64",
        core_version="1.0.0",
        active_path=active,
    )
    plan = ComponentUpdatePlan(
        "backend",
        "1.0.0",
        "2.0.0",
        "delta",
        "https://oss/delta.zip",
        hashlib.sha256(archive.read_bytes()).hexdigest(),
        signature,
        (),
    )

    updater.apply_delta(plan, bundled, archive, destination)

    assert (destination / "runtime.dat").read_bytes() == new_bytes
    assert (bundled / "runtime.dat").read_bytes() == b"old"
    pointer = json.loads(active.read_text(encoding="utf-8"))
    assert pointer["components"]["backend"]["version"] == "2.0.0"


def _p1_dir_updater(tmp_path, component="backend", active_path=None):
    private, public = _p0_keypair()
    return private, ComponentUpdater(
        public_key_b64=public,
        managed_components={component},
        directory_components={component},
        target="windows-x86_64",
        core_version="1.0.0",
        active_path=active_path,
    )


def test_directory_recovery_completes_applied_candidate(tmp_path):
    """Complete an applied candidate after a pre-finalize crash."""
    _, updater = _p1_dir_updater(tmp_path)
    destination = tmp_path / "managed" / "backend" / "2.0.0"
    destination.mkdir(parents=True)
    payload = b"runtime"
    (destination / "runtime.dat").write_bytes(payload)
    expected = {
        "runtime.dat": {
            "size": len(payload),
            "sha256": hashlib.sha256(payload).hexdigest(),
        },
    }
    previous = destination.parent / f".{destination.name}.previous"
    previous.mkdir()
    (previous / "old.dat").write_bytes(b"old")
    marker = destination.parent / f".{destination.name}.activation.json"
    marker.write_text(
        '{"schema_version": 1, "component": "backend", "version": "2.0.0"}',
        encoding="utf-8",
    )

    updater.recover_interrupted_directory_activation(
        "backend",
        destination,
        expected_files=expected,
        expected_version="2.0.0",
    )
    # Complete candidate: marker + previous cleared, candidate kept.
    assert not marker.exists()
    assert not previous.exists()
    assert (destination / "runtime.dat").is_file()


def test_directory_recovery_discards_partial_candidate(tmp_path):
    """P1-2: crash mid-apply -> discard the partial candidate for a retry."""
    _, updater = _p1_dir_updater(tmp_path)
    destination = tmp_path / "managed" / "backend" / "2.0.0"
    destination.mkdir(parents=True)
    (destination / "runtime.dat").write_bytes(b"corrupt")
    expected = {
        "runtime.dat": {
            "size": 7,
            "sha256": hashlib.sha256(b"runtime").hexdigest(),
        },
    }
    marker = destination.parent / f".{destination.name}.activation.json"
    marker.write_text(
        '{"schema_version": 1, "component": "backend", "version": "2.0.0"}',
        encoding="utf-8",
    )

    updater.recover_interrupted_directory_activation(
        "backend",
        destination,
        expected_files=expected,
        expected_version="2.0.0",
    )
    # Partial candidate discarded so the version can be re-applied fresh.
    assert not destination.exists()
    assert not marker.exists()


def test_directory_recovery_clears_orphan_previous(tmp_path):
    """P1-2: crash during the swap leaves a stale previous with no marker."""
    _, updater = _p1_dir_updater(tmp_path)
    destination = tmp_path / "managed" / "backend" / "2.0.0"
    # No destination, no marker: candidate never activated.
    previous = destination.parent / f".{destination.name}.previous"
    previous.mkdir(parents=True)
    (previous / "old.dat").write_bytes(b"old")

    updater.recover_interrupted_directory_activation("backend", destination)
    assert not previous.exists()


def test_gc_removes_superseded_versions_keeps_active_and_latest(tmp_path):
    """P1-3: old managed versions are reclaimed; active + latest kept."""
    _, updater = _p1_dir_updater(tmp_path)
    root = tmp_path / "managed" / "backend"
    for version in ("1.0.0", "1.1.0", "1.2.0", "2.0.0"):
        d = root / version
        d.mkdir(parents=True)
        (d / "runtime.dat").write_bytes(version.encode())
    active = tmp_path / "state" / "active.json"
    active.parent.mkdir()
    active.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "target": "windows-x86_64",
                "components": {
                    "backend": {
                        "version": "2.0.0",
                        "path": str(root / "2.0.0"),
                    },
                },
            },
        ),
        encoding="utf-8",
    )
    updater_with_active = ComponentUpdater(
        public_key_b64=updater.public_key_b64,
        managed_components={"backend"},
        directory_components={"backend"},
        target="windows-x86_64",
        core_version="1.0.0",
        active_path=active,
    )
    # keep = just-committed 2.0.0; retain=1 keeps newest other (1.2.0);
    # active (2.0.0) always kept. 1.0.0 and 1.1.0 should be reclaimed.
    updater_with_active._gc_managed_versions("backend", keep=root / "2.0.0")
    remaining = {p.name for p in root.iterdir() if p.is_dir()}
    assert "2.0.0" in remaining  # active/keep never removed
    assert "1.2.0" in remaining  # newest retained
    assert "1.0.0" not in remaining
    assert "1.1.0" not in remaining


def test_gc_never_removes_active_version(tmp_path):
    """P1-3 guard rail: the active version is never reclaimed."""
    root = tmp_path / "managed" / "backend"
    for version in ("1.0.0", "2.0.0", "3.0.0"):
        (root / version).mkdir(parents=True)
    active = tmp_path / "state" / "active.json"
    active.parent.mkdir()
    # Active is an OLDER version (1.0.0) than the keep tree (3.0.0).
    active.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "target": "windows-x86_64",
                "components": {
                    "backend": {
                        "version": "1.0.0",
                        "path": str(root / "1.0.0"),
                    },
                },
            },
        ),
        encoding="utf-8",
    )
    _, updater = _p1_dir_updater(tmp_path, active_path=active)
    updater._gc_managed_versions("backend", keep=root / "3.0.0")
    remaining = {p.name for p in root.iterdir() if p.is_dir()}
    assert "1.0.0" in remaining  # active is sacred even when older
    assert "3.0.0" in remaining  # keep tree


def test_remove_readonly_clears_readonly_bit(tmp_path):
    """P1-4: the rmtree onerror handler removes read-only files."""
    target = tmp_path / "tree" / "file.dat"
    target.parent.mkdir(parents=True)
    target.write_bytes(b"x")
    target.chmod(0o444)  # read-only
    shutil.rmtree(target.parent, onerror=component_update._remove_readonly)
    assert not target.parent.exists()


def test_directory_recovery_never_deletes_live_tree(tmp_path):
    """P1-2 safety: recovery must never delete the tree active.json runs."""
    active = tmp_path / "state" / "active.json"
    active.parent.mkdir()
    live = tmp_path / "managed" / "backend" / "2.0.0"
    live.mkdir(parents=True)
    (live / "runtime.dat").write_bytes(b"edited")  # differs from manifest
    active.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "target": "windows-x86_64",
                "components": {
                    "backend": {"version": "2.0.0", "path": str(live)},
                },
            },
        ),
        encoding="utf-8",
    )
    _, updater = _p1_dir_updater(tmp_path, active_path=active)
    marker = live.parent / f".{live.name}.activation.json"
    marker.write_text(
        '{"schema_version": 1, "component": "backend", "version": "2.0.0"}',
        encoding="utf-8",
    )
    # Manifest expects different content -> looks "partial", but it is live.
    expected = {
        "runtime.dat": {
            "size": 7,
            "sha256": hashlib.sha256(b"runtime").hexdigest(),
        },
    }
    updater.recover_interrupted_directory_activation(
        "backend",
        live,
        expected_files=expected,
        expected_version="2.0.0",
    )
    # Live tree and its marker are left untouched.
    assert (live / "runtime.dat").read_bytes() == b"edited"
    assert marker.exists()
