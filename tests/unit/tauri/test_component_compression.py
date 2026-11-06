# -*- coding: utf-8 -*-
"""Real archive and signed installer coverage for component compression."""
# pylint: disable=protected-access
from __future__ import annotations

import base64
import hashlib
import importlib
import json
import random
import sys
import zipfile
import zlib
from pathlib import Path

import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from qwenpaw.components.update import ComponentUpdatePlan, ComponentUpdater

SCRIPTS = Path(__file__).resolve().parents[3] / "scripts" / "pack-tauri"
sys.path.insert(0, str(SCRIPTS))
release = importlib.import_module("build_component_release")
delta_builder = importlib.import_module("build_component_delta")
common = importlib.import_module("component_common")


def _payload() -> bytes:
    rng = random.Random(29)
    return "\n".join(
        f"component-{rng.randrange(500):03d}-payload-{rng.randrange(20):02d}"
        for _ in range(20_000)
    ).encode()


def _component(root: Path, version: str, payload: bytes) -> None:
    root.mkdir(parents=True)
    (root / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": version}),
        encoding="utf-8",
    )
    (root / "payload.txt").write_bytes(payload)


def _compressed_size(payload: bytes, level: int) -> int:
    compressor = zlib.compressobj(level, zlib.DEFLATED, -15)
    return len(compressor.compress(payload) + compressor.flush())


@pytest.mark.parametrize("kind", ["full", "delta"])
def test_component_archives_use_best_deflate_and_are_deterministic(
    tmp_path: Path,
    kind: str,
):
    base, target = tmp_path / "base", tmp_path / "target"
    payload = _payload()
    _component(base, "1.0.0", b"old payload")
    _component(target, "1.1.0", payload)
    first, second = tmp_path / "first.zip", tmp_path / "second.zip"
    for output in (first, second):
        if kind == "full":
            release._full_zip(target, output)
        else:
            delta_builder.write_delta(base, target, output)

    assert first.read_bytes() == second.read_bytes()
    with zipfile.ZipFile(first) as archive:
        assert archive.testzip() is None
        for entry in archive.infolist():
            content = archive.read(entry)
            assert entry.date_time == (1980, 1, 1, 0, 0, 0)
            assert entry.compress_type == zipfile.ZIP_DEFLATED
            assert entry.compress_size == _compressed_size(content, 9)
        member = "payload.txt" if kind == "full" else "files/payload.txt"
        assert archive.read(member) == payload
        assert archive.getinfo(member).compress_size < _compressed_size(
            payload,
            6,
        )
        if kind == "delta":
            document = json.loads(archive.read("delta.json"))
            assert document["base_files"] == common.file_inventory(base)
            assert document["final_files"] == common.file_inventory(target)
            assert document["files"]["payload.txt"]["sha256"] == (
                hashlib.sha256(payload).hexdigest()
            )


@pytest.mark.parametrize("kind", ["full", "delta"])
def test_best_deflate_archives_pass_signed_runtime_installation(
    tmp_path: Path,
    kind: str,
):
    installed, target = tmp_path / "demo", tmp_path / "target"
    _component(installed, "1.0.0", b"old payload")
    _component(target, "1.1.0", _payload())
    (installed / "data").mkdir()
    user_data = installed / "data" / "user.json"
    user_data.write_bytes(b'{"keep": "user configuration"}')
    archive = tmp_path / f"{kind}.zip"
    if kind == "full":
        release._full_zip(target, archive)
    else:
        delta_builder.write_delta(installed, target, archive)
    private = Ed25519PrivateKey.generate()
    public = base64.b64encode(
        private.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        ),
    ).decode("ascii")
    signature = release._sign(archive, private)
    plan = ComponentUpdatePlan(
        "demo",
        "1.0.0",
        "1.1.0",
        kind,
        f"https://example.test/{archive.name}",
        hashlib.sha256(archive.read_bytes()).hexdigest(),
        signature,
    )
    updater = ComponentUpdater(
        public_key_b64=public,
        managed_components={"demo"},
        core_version="2.2.2",
    )
    expected = common.file_inventory(target)
    if kind == "full":
        updater.apply_full(
            plan,
            archive,
            installed,
            expected_files=expected,
            preserve_from=installed,
        )
    else:
        updater.apply_delta(plan, installed, archive, installed)
    assert common.file_inventory(installed) == expected
    assert user_data.read_bytes() == b'{"keep": "user configuration"}'
