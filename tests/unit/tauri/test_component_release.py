# -*- coding: utf-8 -*-
from __future__ import annotations

import base64
import importlib.util
import json
import sys
from pathlib import Path

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
