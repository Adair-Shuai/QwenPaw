# -*- coding: utf-8 -*-
"""Tests for the fork-owned distribution endpoint module."""

import importlib
import os

from qwenpaw import distribution

_DEFAULT_BASE = "https://ugsci-download.oss-cn-beijing.aliyuncs.com"


def test_defaults_point_at_ugsci_download() -> None:
    assert distribution.DOWNLOAD_BASE_URL == _DEFAULT_BASE
    assert distribution.PLUGIN_DOWNLOAD_CDN == _DEFAULT_BASE
    assert distribution.COMPONENT_BASE_URL == _DEFAULT_BASE
    assert distribution.DESKTOP_UPDATE_MANIFEST_URL == (
        f"{_DEFAULT_BASE}/metadata/qwenpaw-tauri-latest.json"
    )
    assert distribution.CORE_UPDATE_MANIFEST_URL == (
        f"{_DEFAULT_BASE}/metadata/ugsci-core-latest.json"
    )
    assert distribution.LLAMA_CPP_DOWNLOAD_BASE_URL == (
        f"{_DEFAULT_BASE}/files/models/llama_cpp"
    )
    assert distribution.PYPI_JSON_URL == ""
    assert distribution.PIP_INDEX_URL == ""
    assert distribution.is_unsafe_upstream_core_update() is True


def test_upgrade_hosts_include_upstream_and_fork() -> None:
    hosts = distribution.EXTERNAL_PLUGIN_UPGRADE_HOSTS
    assert "download.qwenpaw.agentscope.io" in hosts
    assert "platform.agentscope.io" in hosts
    assert "ugsci-download.oss-cn-beijing.aliyuncs.com" in hosts


def test_download_base_env_override_rewires_derived_urls() -> None:
    os.environ[
        "QWENPAW_DOWNLOAD_BASE_URL"
    ] = "https://mirror.example.com/base/"
    try:
        reloaded = importlib.reload(distribution)
        metadata_base = "https://mirror.example.com/base/metadata"
        models_base = "https://mirror.example.com/base/files/models"
        assert reloaded.DOWNLOAD_BASE_URL == "https://mirror.example.com/base"
        assert (
            reloaded.PLUGIN_DOWNLOAD_CDN == "https://mirror.example.com/base"
        )
        assert reloaded.DESKTOP_UPDATE_MANIFEST_URL == (
            f"{metadata_base}/qwenpaw-tauri-latest.json"
        )
        assert reloaded.CORE_UPDATE_MANIFEST_URL == (
            f"{metadata_base}/ugsci-core-latest.json"
        )
        assert reloaded.LLAMA_CPP_DOWNLOAD_BASE_URL == (
            f"{models_base}/llama_cpp"
        )
        assert "mirror.example.com" in reloaded.EXTERNAL_PLUGIN_UPGRADE_HOSTS
        # Upstream hosts stay approved for compatibility.
        assert (
            "download.qwenpaw.agentscope.io"
            in reloaded.EXTERNAL_PLUGIN_UPGRADE_HOSTS
        )
    finally:
        os.environ.pop("QWENPAW_DOWNLOAD_BASE_URL", None)
        importlib.reload(distribution)


def test_pypi_env_overrides() -> None:
    os.environ["QWENPAW_PYPI_JSON_URL"] = "https://pypi.internal/x/json"
    os.environ["QWENPAW_PIP_INDEX_URL"] = "https://pypi.internal/simple"
    try:
        reloaded = importlib.reload(distribution)
        assert reloaded.PYPI_JSON_URL == "https://pypi.internal/x/json"
        assert reloaded.PIP_INDEX_URL == "https://pypi.internal/simple"
    finally:
        os.environ.pop("QWENPAW_PYPI_JSON_URL", None)
        os.environ.pop("QWENPAW_PIP_INDEX_URL", None)
        importlib.reload(distribution)


def test_self_hosted_index_is_not_an_upstream_overwrite() -> None:
    assert (
        distribution.is_unsafe_upstream_core_update(
            package_name="qwenpaw",
            json_url="https://pypi.internal/qwenpaw/json",
            index_url="https://pypi.internal/simple",
        )
        is False
    )
    assert (
        distribution.is_unsafe_upstream_core_update(
            package_name="qwenpaw",
            json_url="https://pypi.org/pypi/qwenpaw/json",
            index_url="https://pypi.internal/simple",
        )
        is True
    )
    assert (
        distribution.is_unsafe_upstream_core_update(
            package_name="ugsci",
            json_url="https://pypi.org/pypi/ugsci/json",
            index_url="",
        )
        is False
    )


def test_ugsci_catalog_membership_uses_channel_and_author() -> None:
    assert distribution.is_ugsci_catalog_plugin(
        plugin_id="new-plugin",
        author="UGSci Team",
    )
    assert distribution.is_ugsci_catalog_plugin(
        plugin_id="anything",
        channel="ugsci",
    )
    assert not distribution.is_ugsci_catalog_plugin(
        plugin_id="uideas",
        author="Someone Else",
    )
    assert not distribution.is_ugsci_catalog_plugin(
        plugin_id="community-app",
        author="UGSci Team",
        channel="community",
    )


def test_tauri_updater_endpoints_match_distribution() -> None:
    import json
    from pathlib import Path

    repo = Path(__file__).resolve().parents[2]
    expected = [distribution.DESKTOP_UPDATE_MANIFEST_URL]
    config = json.loads(
        (repo / "console" / "src-tauri" / "tauri.conf.json").read_text(
            encoding="utf-8",
        ),
    )
    assert config["plugins"]["updater"]["endpoints"] == expected


def test_ugsci_upgrade_hosts_require_digest() -> None:
    assert distribution.upgrade_source_requires_digest(
        "https://ugsci-download.oss-cn-beijing.aliyuncs.com/x.zip",
    )
    assert not distribution.upgrade_source_requires_digest(
        "https://download.qwenpaw.agentscope.io/x.zip",
    )
