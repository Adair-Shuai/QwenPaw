# -*- coding: utf-8 -*-
# pylint: disable=protected-access
from __future__ import annotations

import importlib.util
import io
import sys
import tarfile
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[3]
HELPER_PATH = REPO_ROOT / "scripts" / "pack-tauri" / "stage_python_runtime.py"


def _load_helper():
    sys.path.insert(0, str(HELPER_PATH.parent))
    spec = importlib.util.spec_from_file_location(
        "qwenpaw_stage_python_runtime_test",
        HELPER_PATH,
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_sha256_verification_rejects_wrong_digest():
    helper = _load_helper()
    with pytest.raises(SystemExit, match="mismatch"):
        helper._verify_sha256(b"runtime", "0" * 64)


def test_safe_extract_rejects_path_traversal(tmp_path):
    helper = _load_helper()
    archive = tmp_path / "runtime.tar.gz"
    with tarfile.open(archive, "w:gz") as tar:
        info = tarfile.TarInfo("../escape")
        info.size = 1
        tar.addfile(info, io.BytesIO(b"x"))

    with pytest.raises(SystemExit, match="escapes target"):
        helper._extract_safely(str(archive), tmp_path / "dest")


def test_safe_extract_rejects_duplicate_members(tmp_path):
    helper = _load_helper()
    archive = tmp_path / "runtime.tar.gz"
    with tarfile.open(archive, "w:gz") as tar:
        for value in (b"one", b"two"):
            info = tarfile.TarInfo("python/python.exe")
            info.size = len(value)
            tar.addfile(info, io.BytesIO(value))

    with pytest.raises(SystemExit, match="duplicate"):
        helper._extract_safely(str(archive), tmp_path / "dest")


def test_validate_member_accepts_internal_relative_symlink(tmp_path):
    helper = _load_helper()
    root = (tmp_path / "dest").resolve()
    info = tarfile.TarInfo("python/bin/2to3")
    info.type = tarfile.SYMTYPE
    info.linkname = "2to3-3.11"

    helper._validate_member(info, root)


@pytest.mark.parametrize("linkname", ["/tmp/escape", "../../../escape"])
def test_validate_member_rejects_unsafe_symlink(tmp_path, linkname):
    helper = _load_helper()
    root = (tmp_path / "dest").resolve()
    info = tarfile.TarInfo("python/bin/2to3")
    info.type = tarfile.SYMTYPE
    info.linkname = linkname

    with pytest.raises(SystemExit):
        helper._validate_member(info, root)


def test_validate_member_rejects_hardlink(tmp_path):
    helper = _load_helper()
    root = (tmp_path / "dest").resolve()
    info = tarfile.TarInfo("python/bin/python3")
    info.type = tarfile.LNKTYPE
    info.linkname = "python/bin/python3.11"

    with pytest.raises(SystemExit):
        helper._validate_member(info, root)


def test_production_asset_lookup_never_falls_back_to_latest(monkeypatch):
    helper = _load_helper()

    def missing(_release):
        raise helper.urllib.error.HTTPError("url", 404, "missing", {}, None)

    monkeypatch.setattr(helper, "_release_data", missing)
    with pytest.raises(SystemExit, match="pinned.*not found"):
        helper._find_asset_url(
            "3.11",
            "x86_64-pc-windows-msvc",
            "20260623",
            allow_latest_fallback=False,
        )
