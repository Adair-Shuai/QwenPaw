# -*- coding: utf-8 -*-
# pylint: disable=protected-access
from __future__ import annotations

import asyncio
import io
import json
import zipfile

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from qwenpaw.app.routers import publisher


def _write_plugin(root, *, version="1.0.0", plugin_type="general"):
    root.mkdir(parents=True)
    (root / "plugin.json").write_text(
        json.dumps(
            {
                "id": "isolated-upgrade-test",
                "name": "Isolated Upgrade Test",
                "version": version,
                "type": plugin_type,
                "entry": {"backend": "main.py"},
            },
        ),
        encoding="utf-8",
    )
    (root / "main.py").write_text("VALUE = 1\n", encoding="utf-8")


def test_package_is_deterministic_and_round_trips(tmp_path):
    root = tmp_path / "isolated-upgrade-test"
    _write_plugin(root)

    first, packaged = publisher._package_directory(root)
    second, _ = publisher._package_directory(root)
    inspected = publisher._inspect_archive(first)

    assert first == second
    assert inspected["id"] == packaged["id"] == "isolated-upgrade-test"
    assert inspected["version"] == "1.0.0"
    assert inspected["file_count"] == 2


def test_installed_package_honors_manifest_pack_exclude(tmp_path):
    root = tmp_path / "isolated-upgrade-test"
    _write_plugin(root)
    manifest_path = root / "plugin.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    manifest["pack_exclude"] = ["samples/duplicate"]
    manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
    excluded = root / "samples" / "duplicate" / "large.json"
    excluded.parent.mkdir(parents=True)
    excluded.write_bytes(b"x" * 1024)

    archive, packaged = publisher._package_directory(root)
    inspected = publisher._inspect_archive(archive)
    summary = publisher._inspection(packaged, "plugin")

    assert packaged["excluded_files"] == 1
    assert inspected["file_count"] == 2
    assert summary["warnings"] == [
        "plugin.json pack_exclude excluded 1 path(s)",
    ]


def test_directory_inspection_does_not_build_an_archive(tmp_path, monkeypatch):
    root = tmp_path / "isolated-upgrade-test"
    _write_plugin(root)

    def fail_if_packaged(*_args, **_kwargs):
        raise AssertionError("metadata inspection must not create a ZIP")

    monkeypatch.setattr(publisher.zipfile, "ZipFile", fail_if_packaged)

    inspected = publisher._inspect_directory(root)

    assert inspected["id"] == "isolated-upgrade-test"
    assert inspected["file_count"] == 2


def test_archive_rejects_files_outside_plugin_root():
    output = io.BytesIO()
    with zipfile.ZipFile(output, "w") as archive:
        archive.writestr(
            "plugin/plugin.json",
            json.dumps({"id": "plugin", "version": "1.0.0"}),
        )
        archive.writestr("outside.txt", "unexpected")

    with pytest.raises(ValueError, match="outside the plugin root"):
        publisher._inspect_archive(output.getvalue())


def test_publish_prepares_local_package_without_remote_endpoint(
    tmp_path,
    monkeypatch,
):
    root = tmp_path / "plugins" / "isolated-upgrade-test"
    _write_plugin(root)
    monkeypatch.setattr(publisher, "_PUBLISH_ROOT", tmp_path / "publish")
    monkeypatch.delenv("UGSCI_SUBMISSION_ENDPOINT", raising=False)
    archive, inspected = publisher._package_directory(root)

    result = asyncio.run(
        publisher._publish(archive, inspected, "submission", "plugin"),
    )

    assert result["status"] == "prepared"
    assert result["sha256"]
    assert (
        tmp_path / "publish" / "inbox" / "isolated-upgrade-test-1.0.0.zip"
    ).is_file()
    metadata = json.loads(
        (
            tmp_path / "publish" / "inbox" / "isolated-upgrade-test-1.0.0.json"
        ).read_text(
            encoding="utf-8",
        ),
    )
    assert metadata["sha256"] == result["sha256"]


def test_same_version_cannot_change_content(tmp_path, monkeypatch):
    root = tmp_path / "plugins" / "isolated-upgrade-test"
    _write_plugin(root)
    monkeypatch.setattr(publisher, "_PUBLISH_ROOT", tmp_path / "publish")
    archive, inspected = publisher._package_directory(root)
    publisher._store_local(
        archive,
        "first",
        inspected,
        "release",
        "plugin",
    )
    (root / "main.py").write_text("VALUE = 2\n", encoding="utf-8")
    changed, changed_inspected = publisher._package_directory(root)

    with pytest.raises(ValueError, match="without a version bump"):
        publisher._store_local(
            changed,
            "second",
            changed_inspected,
            "release",
            "plugin",
        )


def test_runtime_api_inspects_publishes_and_uploads(tmp_path, monkeypatch):
    plugins_dir = tmp_path / "plugins"
    root = plugins_dir / "isolated-upgrade-test"
    _write_plugin(root)
    monkeypatch.setattr(publisher, "get_plugins_dir", lambda: plugins_dir)
    monkeypatch.setattr(publisher, "_PUBLISH_ROOT", tmp_path / "publish")
    monkeypatch.delenv("UGSCI_SUBMISSION_ENDPOINT", raising=False)
    app = FastAPI()
    app.include_router(publisher.router, prefix="/api")
    client = TestClient(app)

    inspected = client.post(
        "/api/publisher/inspect",
        json={"pluginId": "isolated-upgrade-test", "kind": "plugin"},
    )
    assert inspected.status_code == 200
    assert inspected.json()["version"] == "1.0.0"

    published = client.post(
        "/api/publisher/publish",
        json={
            "pluginId": "isolated-upgrade-test",
            "kind": "plugin",
            "mode": "submission",
        },
    )
    assert published.status_code == 200
    assert published.json()["status"] == "prepared"

    archive, _ = publisher._package_directory(root)
    uploaded = client.post(
        "/api/publisher/upload",
        content=archive,
        headers={
            "Content-Type": "application/zip",
            "X-UGSci-Asset-Kind": "plugin",
            "X-UGSci-Publish-Mode": "submission",
        },
    )
    assert uploaded.status_code == 200
    assert uploaded.json()["sha256"] == published.json()["sha256"]
