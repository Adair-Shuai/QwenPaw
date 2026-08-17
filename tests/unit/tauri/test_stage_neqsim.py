# -*- coding: utf-8 -*-
# pylint: disable=protected-access
from __future__ import annotations

import hashlib
import importlib.util
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[3]
HELPER_PATH = REPO_ROOT / "scripts" / "pack-tauri" / "stage_neqsim.py"
SMOKE_PATH = REPO_ROOT / "scripts" / "pack-tauri" / "smoke_neqsim.py"


def _load_helper():
    spec = importlib.util.spec_from_file_location(
        "qwenpaw_stage_neqsim_test",
        HELPER_PATH,
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def test_sha256_verification_rejects_wrong_digest():
    helper = _load_helper()
    with pytest.raises(SystemExit, match="mismatch"):
        helper._verify_sha256(b"neqsim", "0" * 64)


def test_cached_jar_is_rehashed_before_skip(tmp_path, monkeypatch):
    helper = _load_helper()
    jar = tmp_path / helper.JAR_NAME
    jar.write_bytes(b"valid-jar")
    (tmp_path / ".neqsim-version").write_text("3.17.0", encoding="utf-8")
    digest = hashlib.sha256(b"valid-jar").hexdigest()
    (tmp_path / helper.SHA256_NAME).write_text(digest, encoding="utf-8")
    monkeypatch.setattr(
        sys,
        "argv",
        ["stage_neqsim.py", "--dest", str(tmp_path), "--version", "3.17.0"],
    )
    monkeypatch.setattr(
        helper,
        "_http_get",
        lambda _url: pytest.fail("cache should not download"),
    )

    helper.main()


def test_production_build_requires_fixed_hash(tmp_path, monkeypatch):
    helper = _load_helper()
    monkeypatch.setenv("QWENPAW_REQUIRE_RUNTIME_HASHES", "true")
    monkeypatch.delenv("QWENPAW_NEQSIM_SHA256", raising=False)
    monkeypatch.setattr(
        sys,
        "argv",
        ["stage_neqsim.py", "--dest", str(tmp_path)],
    )

    with pytest.raises(SystemExit, match="QWENPAW_NEQSIM_SHA256"):
        helper.main()


def test_atomic_write_replaces_complete_artifact(tmp_path):
    helper = _load_helper()
    target = tmp_path / helper.JAR_NAME
    target.write_bytes(b"old")

    helper._atomic_write(target, b"new-complete-artifact")

    assert target.read_bytes() == b"new-complete-artifact"
    assert not list(tmp_path.glob(f".{helper.JAR_NAME}.*.tmp"))


def test_smoke_uses_dependency_free_mcp_stdio_client():
    source = SMOKE_PATH.read_text(encoding="utf-8")

    assert "asyncio.create_subprocess_exec" in source
    assert '"tools/list"' in source
    assert '"tools/call"' in source
    assert '"notifications/initialized"' in source
    assert "from qwenpaw" not in source
    assert "dotenv" not in source
