# -*- coding: utf-8 -*-
from __future__ import annotations

import importlib.util
import hashlib
import json
from pathlib import Path
from types import SimpleNamespace

import pytest

REPO_ROOT = Path(__file__).resolve().parents[3]
HELPER_PATH = REPO_ROOT / "scripts" / "pack-tauri" / "stage_officecli.py"


def _load_helper():
    spec = importlib.util.spec_from_file_location(
        "qwenpaw_officecli_stage_test",
        HELPER_PATH,
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_stage_doc_plugin_uses_officecli_side_by_side_layout(tmp_path):
    helper = _load_helper()
    source = tmp_path / "officecli-dump-reader-doc"
    source.write_bytes(b"authorized plugin binary")
    destination = tmp_path / "officecli"

    helper._stage_doc_plugin(  # pylint: disable=protected-access
        str(source),
        destination,
    )

    target = destination / "plugins" / "dump-reader" / "doc" / "plugin"
    assert target.read_bytes() == source.read_bytes()
    assert (target.parent / "plugin.sha256").read_text().strip()


def test_stage_doc_plugin_without_source_is_a_noop(tmp_path):
    helper = _load_helper()
    destination = tmp_path / "officecli"

    helper._stage_doc_plugin(  # pylint: disable=protected-access
        None,
        destination,
    )

    assert not destination.exists()


def test_reviewed_pin_does_not_query_latest(monkeypatch):
    helper = _load_helper()
    monkeypatch.delenv("QWENPAW_OFFICECLI_VERSION", raising=False)
    monkeypatch.setattr(
        helper.urllib.request,
        "urlopen",
        lambda *a, **k: pytest.fail("must not query latest"),
    )
    assert helper._resolve_version(None) == "v1.0.157"
    assert helper._resolve_version("1.0.157") == "v1.0.157"
    with pytest.raises(SystemExit, match="reviewed release lock"):
        helper._resolve_version("v1.0.141")
    monkeypatch.setenv("QWENPAW_OFFICECLI_VERSION", "v1.0.141")
    with pytest.raises(SystemExit):
        helper._resolve_version(None)


def test_release_lock_covers_all_supported_desktop_targets():
    helper = _load_helper()
    lock = json.loads(helper.LOCK_PATH.read_text())
    for system in ("win", "mac", "linux"):
        for arch in ("x64", "arm64"):
            digest = lock["sha256"][helper._release_asset_name(system, arch)]
            assert len(bytes.fromhex(digest)) == 32


def test_binary_verification_checks_bytes_and_executed_version(
    tmp_path,
    monkeypatch,
):
    helper = _load_helper()
    binary = tmp_path / "officecli"
    binary.write_bytes(b"test engine")
    lock = tmp_path / "release.json"
    lock.write_text(
        json.dumps(
            {
                "sha256": {
                    "asset": hashlib.sha256(binary.read_bytes()).hexdigest(),
                },
            },
        ),
    )
    monkeypatch.setattr(helper, "LOCK_PATH", lock)
    monkeypatch.setattr(
        helper.subprocess,
        "run",
        lambda *a, **k: SimpleNamespace(
            returncode=0,
            stdout="1.0.157",
            stderr="",
        ),
    )
    helper._verify_binary(binary, "asset", "v1.0.157")
    monkeypatch.setattr(
        helper.subprocess,
        "run",
        lambda *a, **k: SimpleNamespace(
            returncode=0,
            stdout="1.0.141",
            stderr="",
        ),
    )
    with pytest.raises(SystemExit, match="version verification failed"):
        helper._verify_binary(binary, "asset", "v1.0.157")
    binary.write_bytes(b"tampered cached engine")
    monkeypatch.setattr(
        helper.subprocess,
        "run",
        lambda *a, **k: pytest.fail("untrusted bytes executed"),
    )
    with pytest.raises(SystemExit, match="checksum mismatch"):
        helper._verify_binary(binary, "asset", "v1.0.157")


def test_matching_marker_cannot_bypass_cached_binary_validation(
    tmp_path,
    monkeypatch,
):
    helper = _load_helper()
    monkeypatch.setattr(helper, "_target", lambda: ("win", "x64"))
    monkeypatch.delenv("QWENPAW_OFFICECLI_VERSION", raising=False)
    (tmp_path / "officecli.exe").write_bytes(b"tampered")
    (tmp_path / ".officecli-version").write_text("v1.0.157-win-x64")
    monkeypatch.setattr(helper.sys, "argv", ["stage", "--dest", str(tmp_path)])
    with pytest.raises(SystemExit, match="checksum mismatch"):
        helper.main()


@pytest.mark.parametrize("failure", ["checksum", "version"])
def test_failed_upgrade_preserves_existing_engine_and_marker(
    tmp_path,
    monkeypatch,
    failure,
):
    helper = _load_helper()
    monkeypatch.delenv("QWENPAW_OFFICECLI_VERSION", raising=False)
    monkeypatch.setattr(helper, "_target", lambda: ("win", "x64"))
    dest = tmp_path / "destination"
    dest.mkdir()
    binary = dest / "officecli.exe"
    marker = dest / ".officecli-version"
    binary.write_bytes(b"working old engine")
    marker.write_text("v1.0.144-win-x64")
    payload = b"x" * 1_000_000
    lock = tmp_path / "lock.json"
    lock.write_text(
        json.dumps(
            {
                "version": "v1.0.157",
                "sha256": {
                    "officecli-win-x64.exe": hashlib.sha256(
                        payload if failure == "version" else b"different",
                    ).hexdigest(),
                },
            },
        ),
    )
    monkeypatch.setattr(helper, "LOCK_PATH", lock)
    monkeypatch.setattr(
        helper,
        "_http_download",
        lambda url, target: target.write_bytes(payload),
    )
    monkeypatch.setattr(
        helper.subprocess,
        "run",
        lambda *a, **k: SimpleNamespace(
            returncode=0,
            stdout="1.0.141",
            stderr="",
        ),
    )
    monkeypatch.setattr(helper.sys, "argv", ["stage", "--dest", str(dest)])
    with pytest.raises(SystemExit):
        helper.main()
    assert binary.read_bytes() == b"working old engine"
    assert marker.read_text() == "v1.0.144-win-x64"
    assert not (dest / "officecli.staging.exe").exists()
