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


def test_finds_exact_reusable_layered_runtime(tmp_path, monkeypatch):
    helper = _load_helper()
    monkeypatch.setattr(helper.platform, "system", lambda: "Windows")
    dest = tmp_path / "binaries" / "python-runtime"
    candidate = tmp_path / "binaries" / "runtimes" / "python" / "short-id"
    executable = candidate / "python" / "python.exe"
    executable.parent.mkdir(parents=True)
    executable.write_bytes(b"python")
    marker_value = "3.11-x86_64-pc-windows-msvc-20260623-" + "a" * 64
    (candidate / ".python-runtime-version").write_text(
        marker_value,
        encoding="utf-8",
    )

    assert helper._find_reusable_runtime(dest, marker_value) == candidate
    assert helper._find_reusable_runtime(dest, marker_value + "x") is None


def test_prunes_python_native_symbols_but_keeps_runtime_and_build_support(
    tmp_path,
):
    helper = _load_helper()
    removed = ("python/python.pdb", "python/DLLs/_ssl.pdb")
    retained = (
        "python/python.exe",
        "python/python311.dll",
        "python/DLLs/_ssl.pyd",
        "python/Lib/pdb.py",
        "python/Lib/site-packages/pip/__init__.py",
        "python/include/Python.h",
        "python/libs/python311.lib",
    )
    for relative in removed + retained:
        path = tmp_path / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(relative.encode())

    assert helper._prune_debug_symbols(tmp_path) == sum(map(len, removed))
    assert all(not (tmp_path / name).exists() for name in removed)
    for name in retained:
        assert (tmp_path / name).read_bytes() == name.encode()


def test_cached_python_runtime_is_pruned_without_download(
    tmp_path,
    monkeypatch,
):
    helper = _load_helper()
    monkeypatch.setattr(helper.platform, "system", lambda: "Windows")
    monkeypatch.setattr(helper, "_host_triple", lambda: "windows-test")
    monkeypatch.setattr(helper, "_preferred_release", lambda: "20260623")
    dest = tmp_path / "python-runtime"
    executable = dest / "python/python.exe"
    executable.parent.mkdir(parents=True)
    executable.write_bytes(b"python")
    symbols = dest / "python/python.pdb"
    symbols.write_bytes(b"symbols")
    (dest / ".python-runtime-version").write_text(
        "3.11-windows-test-20260623-" + "a" * 64,
        encoding="utf-8",
    )
    monkeypatch.setattr(
        sys,
        "argv",
        [
            "stage_python_runtime.py",
            "--dest",
            str(dest),
            "--python-version",
            "3.11",
            "--sha256",
            "a" * 64,
        ],
    )

    def reject_download(*_args, **_kwargs):
        pytest.fail("cached runtime must not download again")

    monkeypatch.setattr(helper, "_find_asset_url", reject_download)
    helper.main()
    assert not symbols.exists()
    assert executable.read_bytes() == b"python"


def test_pruned_python_runtime_gets_new_component_identity(tmp_path):
    helper = _load_helper()
    from assemble_desktop_layout import _release_version

    (tmp_path / "python.exe").write_bytes(b"interpreter")
    (tmp_path / "python.pdb").write_bytes(b"debug symbols")
    marker = "3.11-x86_64-pc-windows-msvc-20260623-" + "a" * 64
    before = _release_version(marker, "2.2.2b9", tmp_path)
    helper._prune_debug_symbols(tmp_path)
    after = _release_version(marker, "2.2.2b9", tmp_path)
    assert before != after
    assert after == _release_version(marker, "2.2.2b9", tmp_path)
