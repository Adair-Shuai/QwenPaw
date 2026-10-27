# -*- coding: utf-8 -*-
# pylint: disable=protected-access
from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[3]
HELPER_PATH = REPO_ROOT / "scripts" / "pack-tauri" / "stage_jre.py"


def _load_helper():
    sys.path.insert(0, str(HELPER_PATH.parent))
    spec = importlib.util.spec_from_file_location(
        "qwenpaw_stage_jre_test",
        HELPER_PATH,
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_prune_regenerable_windows_jre_caches(tmp_path):
    helper = _load_helper()
    server = tmp_path / "bin" / "server"
    server.mkdir(parents=True)
    cache = server / "classes.jsa"
    dynamic_cache = server / "classes_nocoops.jsa"
    library = server / "jvm.dll"
    cache.write_bytes(b"cache")
    dynamic_cache.write_bytes(b"cache")
    library.write_bytes(b"library")

    helper._prune_regenerable_runtime_files(tmp_path, "windows")

    assert not cache.exists()
    assert not dynamic_cache.exists()
    assert library.read_bytes() == b"library"


def test_keep_jre_caches_on_non_windows_platforms(tmp_path):
    helper = _load_helper()
    server = tmp_path / "bin" / "server"
    server.mkdir(parents=True)
    cache = server / "classes.jsa"
    cache.write_bytes(b"cache")

    helper._prune_regenerable_runtime_files(tmp_path, "mac")

    assert cache.read_bytes() == b"cache"


@pytest.mark.parametrize("target", [("windows", "x64"), ("mac", "aarch64")])
def test_pinned_jre_resolves_exact_release_without_querying_latest(
    monkeypatch,
    target,
):
    helper = _load_helper()
    monkeypatch.setattr(helper, "_target", lambda: target)
    release = "jdk-21.0.12.1+1"
    package_url = (
        "https://github.com/adoptium/temurin21-binaries/pinned.tar.gz"
    )
    digest = "a" * 64

    def fetch(url):
        assert "/assets/release_name/eclipse/jdk-21.0.12.1%2B1?" in url
        assert f"architecture={target[1]}" in url
        assert f"&os={target[0]}&" in url
        assert "jvm_impl=hotspot" in url
        assert "latest" not in url
        return json.dumps(
            {
                "release_name": release,
                "binaries": [
                    {"package": {"link": package_url, "checksum": digest}},
                ],
            },
        ).encode("utf-8")

    monkeypatch.setattr(helper, "_http_get", fetch)
    assert helper._resolve_download_url("21", release) == (
        package_url,
        release,
        digest,
    )


def test_pinned_jre_rejects_mismatched_release_metadata(monkeypatch):
    helper = _load_helper()
    monkeypatch.setattr(helper, "_target", lambda: ("mac", "aarch64"))
    monkeypatch.setattr(
        helper,
        "_http_get",
        lambda _url: json.dumps({"release_name": "jdk-21.0.13+9"}).encode(),
    )
    with pytest.raises(SystemExit, match="Adoptium release drifted"):
        helper._resolve_download_url("21", "jdk-21.0.12.1+1")


def test_local_verified_jre_marker_skips_metadata_lookup(
    tmp_path,
    monkeypatch,
):
    helper = _load_helper()
    monkeypatch.setattr(helper.platform, "system", lambda: "Windows")
    java = tmp_path / "bin" / "java.exe"
    java.parent.mkdir(parents=True)
    java.write_bytes(b"java")
    digest = "a" * 64
    marker = tmp_path / ".java-runtime-version"
    marker.write_text(
        f"jdk-21.0.12+8-windows-x64-{digest}",
        encoding="utf-8",
    )

    assert helper._local_marker_match(
        tmp_path,
        marker,
        os_name="windows",
        arch="x64",
        release="",
        sha256="",
    ) == marker.read_text(encoding="utf-8")
    assert helper._local_marker_match(
        tmp_path,
        marker,
        os_name="windows",
        arch="x64",
        release="jdk-21.0.12+8",
        sha256=digest,
    )
    assert (
        helper._local_marker_match(
            tmp_path,
            marker,
            os_name="windows",
            arch="x64",
            release="jdk-21.0.13+1",
            sha256=digest,
        )
        is None
    )
