# -*- coding: utf-8 -*-
# pylint: disable=protected-access
from __future__ import annotations

import base64
import hashlib
import json
import os
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
    installed = tmp_path / "installed"
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
    installed = tmp_path / "installed"
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
