# -*- coding: utf-8 -*-
"""Validate the actual FlowForge release archive and catalog isolation."""

import copy
import importlib
import sys
from pathlib import Path
from zipfile import ZipFile

import pytest

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "scripts/pack"))
publisher = importlib.import_module("publish_flowforge")
packer = importlib.import_module("generate_plugin_metadata")


def test_actual_flowforge_archive_rejects_extra_and_modified_members(tmp_path):
    index, failed = packer.discover_and_pack(
        ROOT / "plugins",
        tmp_path,
        "/files/plugins",
        only=["flowforge"],
    )
    assert not failed
    entry = next(iter(index["files"].values()))
    archive = tmp_path / entry["url"].removeprefix("/files/plugins/")
    assert publisher.verify_plugin(archive, entry) == archive.read_bytes()
    with ZipFile(archive) as bundle:
        members = {name: bundle.read(name) for name in bundle.namelist()}
    members["flowforge/plugin.py"] += b"\n# modified\n"
    with ZipFile(archive, "w") as bundle:
        for name, payload in members.items():
            bundle.writestr(name, payload)
    entry.update(
        sha256=publisher.digest(archive.read_bytes()),
        size_bytes=archive.stat().st_size,
    )
    with pytest.raises(ValueError, match="packaged source mismatch"):
        publisher.verify_plugin(archive, entry)
    with ZipFile(archive, "a") as bundle:
        bundle.writestr("flowforge/data/private.json", b"private data")
    entry.update(
        sha256=publisher.digest(archive.read_bytes()),
        size_bytes=archive.stat().st_size,
    )
    with pytest.raises(ValueError, match="Unexpected"):
        publisher.verify_plugin(archive, entry)


def test_flowforge_catalog_preserves_apps_and_rejects_downgrades():
    old = {
        "files": {"app-1": {"plugin_id": "app", "version": "1.0"}},
        "platforms": {"apps": {"versions": ["app-1"]}},
    }
    original = copy.deepcopy(old)
    new = {
        "updated_at": "now",
        "files": {
            "flowforge-0.1.11": {
                "plugin_id": "flowforge",
                "version": "0.1.11",
                "sha256": "reviewed",
            },
        },
    }
    merged = publisher.merge_catalog(
        old,
        new,
        plugin_id="flowforge",
        platform="bundle",
    )
    assert old == original
    assert merged["files"]["app-1"] == old["files"]["app-1"]
    assert merged["platforms"]["apps"] == old["platforms"]["apps"]
    assert merged["platforms"]["bundle"]["versions"] == ["flowforge-0.1.11"]
    earlier = copy.deepcopy(new)
    earlier["files"]["flowforge-0.1.11"]["version"] = "0.1.10"
    earlier["files"]["flowforge-0.1.10"] = earlier["files"].pop(
        "flowforge-0.1.11",
    )
    with pytest.raises(ValueError, match="downgrade"):
        publisher.merge_catalog(
            merged,
            earlier,
            plugin_id="flowforge",
            platform="bundle",
        )
