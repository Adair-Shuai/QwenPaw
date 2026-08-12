# -*- coding: utf-8 -*-
from __future__ import annotations

import base64
import hashlib
import json
import zipfile
from pathlib import Path

import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from qwenpaw.components.update import ComponentUpdateError, ComponentUpdater
from qwenpaw.components.update import ComponentUpdatePlan


def _plugin(root: Path, version: str, **files: str) -> None:
    root.mkdir(parents=True)
    (root / "plugin.json").write_text(json.dumps({"id": "demo", "version": version}), encoding="utf-8")
    for name, value in files.items():
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(value, encoding="utf-8")


def test_signed_manifest_and_plan(tmp_path):
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(private.public_key().public_bytes(serialization.Encoding.Raw, serialization.PublicFormat.Raw)).decode()
    raw = json.dumps({"schema_version": 1, "target": "windows-x86_64", "core_min_version": "1.0.0", "components": {"demo": {"version": "1.1.0", "full": {"url": "https://example/full.zip", "sha256": "a" * 64, "size": 10, "signature": "sig"}, "deltas": [{"from": "1.0.0", "url": "https://example/delta.zip", "sha256": "b" * 64, "size": 5, "signature": "sig"}]}}}, separators=(",", ":")).encode()
    manifest = tmp_path / "manifest.json"
    signature = tmp_path / "manifest.sig"
    manifest.write_bytes(raw)
    signature.write_text(base64.b64encode(private.sign(raw)).decode(), encoding="utf-8")
    updater = ComponentUpdater(public_key_b64=public, managed_components={"demo"}, target="windows-x86_64", core_version="1.0.0")
    loaded = updater.load_manifest(manifest, signature)
    plan = updater.plan(loaded, "demo", tmp_path / "installed")
    assert plan and plan.artifact_kind == "full"


def test_uninstalled_component_is_not_activated(tmp_path):
    updater = ComponentUpdater(public_key_b64="", managed_components={"demo"}, target="windows-x86_64", core_version="1.0.0")
    base = tmp_path / "base"
    destination = tmp_path / "destination"
    _plugin(base, "1.0.0", main="old")
    (base / ".uninstalled").write_text("1", encoding="utf-8")
    plan = type("Plan", (), {"artifact_kind": "delta", "component": "demo", "artifact_sha256": "", "artifact_signature": "", "from_version": "1.0.0", "target_version": "1.1.0"})()
    with pytest.raises(ComponentUpdateError, match="uninstalled"):
        updater.apply_delta(plan, base, tmp_path / "missing.zip", destination)


def test_delta_can_atomically_replace_installed_directory(tmp_path):
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(private.public_key().public_bytes(serialization.Encoding.Raw, serialization.PublicFormat.Raw)).decode()
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
    plan = ComponentUpdatePlan("demo", "1.0.0", "1.1.0", "delta", "https://oss/delta.zip", hashlib.sha256(archive.read_bytes()).hexdigest(), signature)
    updater = ComponentUpdater(public_key_b64=public, managed_components={"demo"}, target="windows-x86_64", core_version="1.0.0")
    updater.apply_delta(plan, installed, archive, installed)
    assert json.loads((installed / "plugin.json").read_text(encoding="utf-8"))["version"] == "1.1.0"
    assert (installed / "main").read_text(encoding="utf-8") == "new"


def test_active_pointer_is_atomic_and_optional(tmp_path):
    active = tmp_path / "components" / "active.json"
    updater = ComponentUpdater(public_key_b64="", managed_components={"demo"}, target="windows-x86_64", core_version="1.0.0", active_path=active)
    updater._commit_active("demo", "1.1.0", tmp_path / "plugins" / "demo")
    payload = json.loads(active.read_text(encoding="utf-8"))
    assert payload["components"]["demo"]["version"] == "1.1.0"


def test_full_update_preserves_user_engines(tmp_path):
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(private.public_key().public_bytes(serialization.Encoding.Raw, serialization.PublicFormat.Raw)).decode()
    installed = tmp_path / "installed"
    _plugin(installed, "1.0.0", **{"engines/user.json": "user-data"})
    archive = tmp_path / "full.zip"
    plugin_bytes = json.dumps({"id": "demo", "version": "1.1.0"}).encode()
    main_bytes = b"new-code"
    with zipfile.ZipFile(archive, "w") as bundle:
        bundle.writestr("plugin.json", plugin_bytes)
        bundle.writestr("main.py", main_bytes)
    signature = base64.b64encode(private.sign(archive.read_bytes())).decode()
    plan = ComponentUpdatePlan("demo", "1.0.0", "1.1.0", "full", "https://oss/full.zip", hashlib.sha256(archive.read_bytes()).hexdigest(), signature)
    expected = {
        "main.py": {"size": len(main_bytes), "sha256": hashlib.sha256(main_bytes).hexdigest()},
        "plugin.json": {"size": len(plugin_bytes), "sha256": hashlib.sha256(plugin_bytes).hexdigest()},
    }
    destination = tmp_path / "plugins" / "demo"
    updater = ComponentUpdater(public_key_b64=public, managed_components={"demo"}, target="windows-x86_64", core_version="1.0.0")
    updater.apply_full(plan, archive, destination, expected_files=expected, preserve_from=installed)
    assert (destination / "engines" / "user.json").read_text(encoding="utf-8") == "user-data"
