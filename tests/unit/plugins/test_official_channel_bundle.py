# -*- coding: utf-8 -*-
"""Verify actual offline channel ZIPs against the current host and source."""
from __future__ import annotations

import json
from pathlib import Path
import zipfile

import pytest

from qwenpaw.__version__ import __version__
from qwenpaw.plugins.official_channel_catalog import OFFICIAL_CHANNELS
from qwenpaw.plugins.official_channels import (
    _bundled_archive,
    _bundled_index,
    _extracted_channel_source,
)

ROOT = Path(__file__).resolve().parents[3]
BUNDLE = ROOT / "src/qwenpaw/official_channels"


def test_official_bundle_keeps_current_closed_host_identity():
    index = _bundled_index(BUNDLE)
    assert index["host_version"] == __version__
    assert {row["plugin_id"] for row in index["plugins"]} == {
        row["plugin_id"] for row in OFFICIAL_CHANNELS
    }


@pytest.mark.parametrize(
    "official",
    OFFICIAL_CHANNELS,
    ids=lambda row: row["plugin_id"],
)
def test_official_bundle_retains_current_runtime_source(
    official,
    tmp_path,
    monkeypatch,
):
    # Production extraction validates every archive's closed manifest identity,
    # compatibility, descriptor, requirements digest and safe member paths.
    monkeypatch.setattr("tempfile.tempdir", str(tmp_path))
    row = next(
        item
        for item in _bundled_index(BUNDLE)["plugins"]
        if item["plugin_id"] == official["plugin_id"]
    )
    payload = _bundled_archive(BUNDLE, row)
    with _extracted_channel_source(
        row["plugin_id"],
        row,
        payload,
    ) as extracted:
        assert extracted.resolve().is_relative_to(tmp_path.resolve())
    source = ROOT / "plugins/channel" / official["source_dir"]
    manifest = json.loads((source / "plugin.json").read_text(encoding="utf8"))
    required = {
        "plugin.json",
        manifest["entry"]["descriptor"],
        "requirements.txt",
        "README.md",
    }
    # Source/runtime coherence is independent of the packer's file iterator.
    required.update(
        path.relative_to(source).as_posix()
        for path in source.rglob("*.py")
        if "__pycache__" not in path.parts and "tests" not in path.parts
    )
    with zipfile.ZipFile(BUNDLE / row["filename"]) as archive:
        assert archive.testzip() is None
        prefix = official["plugin_id"] + "/"
        assert all(name.startswith(prefix) for name in archive.namelist())
        members = {name.removeprefix(prefix) for name in archive.namelist()}
        assert required <= members
        for relative in members:
            bundled_bytes = archive.read(prefix + relative)
            source_bytes = (source / relative).read_bytes()
            if Path(relative).suffix in {".json", ".md", ".txt"}:
                # Git may check these text assets out as CRLF on Windows.
                # Exact ZIP signatures still validate the delivered bytes.
                bundled_bytes = bundled_bytes.replace(b"\r\n", b"\n")
                source_bytes = source_bytes.replace(b"\r\n", b"\n")
            assert bundled_bytes == source_bytes, relative
