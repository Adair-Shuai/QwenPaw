# -*- coding: utf-8 -*-
# pylint: disable=protected-access
"""Required-file validation in the plugin pack pipeline.

A plugin whose declared ``entry`` files or ``pack_requires`` artifacts are
missing on disk must fail the pack loudly instead of shipping a broken zip.
"""

from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path
import zipfile

import pytest

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
SCRIPT_FILE = (
    REPOSITORY_ROOT / "scripts" / "pack" / "generate_plugin_metadata.py"
)


def _load_packer():
    spec = importlib.util.spec_from_file_location(
        "generate_plugin_metadata_under_test",
        SCRIPT_FILE,
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


packer = _load_packer()


def _write_plugin(
    plugins_root: Path,
    manifest: dict,
    files: list[str],
    category: str = "apps",
) -> Path:
    plugin_dir = plugins_root / category / manifest["id"]
    plugin_dir.mkdir(parents=True)
    (plugin_dir / "plugin.json").write_text(
        json.dumps(manifest),
        encoding="utf-8",
    )
    for rel in files:
        target = plugin_dir / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text("content", encoding="utf-8")
    return plugin_dir


def _manifest(**overrides) -> dict:
    manifest = {
        "id": "demo",
        "version": "1.0.0",
        "entry": {
            "backend": "backend/main.py",
            "frontend": "ui/dist/index.js",
        },
    }
    manifest.update(overrides)
    return manifest


def test_complete_plugin_packs_and_reports_no_failures(tmp_path) -> None:
    plugins_root = tmp_path / "plugins"
    _write_plugin(
        plugins_root,
        _manifest(pack_requires=["ui/dist/vendor/index.html"]),
        ["backend/main.py", "ui/dist/index.js", "ui/dist/vendor/index.html"],
    )

    index, failed = packer.discover_and_pack(
        plugins_root,
        tmp_path / "dist",
        "/files/plugins",
    )

    assert failed == []
    assert "demo-1.0.0" in index["files"]
    assert (tmp_path / "dist" / "apps" / "demo" / "demo-1.0.0.zip").is_file()


@pytest.mark.parametrize(
    "category,manifest,files",
    [
        ("apps", _manifest(), ["backend/main.py"]),
        (
            "channel",
            _manifest(
                id="demo-channel",
                version="0.1.0",
                type="channel",
                entry={"backend": "plugin.py"},
            ),
            [],
        ),
    ],
    ids=["app-frontend", "channel-backend"],
)
def test_missing_entry_file_fails_the_pack(
    tmp_path,
    category,
    manifest,
    files,
) -> None:
    plugins_root = tmp_path / "plugins"
    _write_plugin(plugins_root, manifest, files, category=category)

    index, failed = packer.discover_and_pack(
        plugins_root,
        tmp_path / "dist",
        "/files/plugins",
    )

    assert failed == [manifest["id"]]
    assert index["files"] == {}
    assert not (tmp_path / "dist" / category / manifest["id"]).exists()


def test_missing_pack_requires_artifact_fails_the_pack(
    tmp_path,
    capsys,
) -> None:
    plugins_root = tmp_path / "plugins"
    _write_plugin(
        plugins_root,
        _manifest(
            pack_requires=["ui/dist/vendor/index.html"],
            pack_requires_hint="Run scripts/vendor.sh first.",
        ),
        ["backend/main.py", "ui/dist/index.js"],
    )

    index, failed = packer.discover_and_pack(
        plugins_root,
        tmp_path / "dist",
        "/files/plugins",
    )

    assert failed == ["demo"]
    assert index["files"] == {}
    captured = capsys.readouterr()
    assert "ui/dist/vendor/index.html" in captured.err
    assert "Run scripts/vendor.sh first." in captured.err


def test_required_relpaths_merges_entries_and_drops_unsafe() -> None:
    required = packer._required_relpaths(
        _manifest(
            pack_requires=[
                "ui/dist/index.js",  # duplicate of the entry
                "ui/dist/vendor/index.html",
                "../outside.txt",  # traversal is ignored
                "",  # empty is ignored
            ],
        ),
    )

    assert required == [
        "backend/main.py",
        "ui/dist/index.js",
        "ui/dist/vendor/index.html",
    ]


def _write_channel(plugins_root: Path, plugin_id="demo-channel", **settings):
    """Create a channel source without depending on a real platform SDK."""
    manifest = {
        "id": plugin_id,
        "version": "0.1.0",
        "type": "channel",
        "entry": {"backend": "plugin.py"},
        **settings,
    }
    plugin_dir = _write_plugin(plugins_root, manifest, [], category="channel")
    (plugin_dir / "plugin.py").write_text(
        "plugin = object()\n",
        encoding="utf-8",
        newline="\n",
    )
    return plugin_dir


def test_channel_discovery_builds_archive_and_channel_metadata(tmp_path):
    plugins_root = tmp_path / "plugins"
    _write_channel(plugins_root)
    _write_channel(plugins_root, "private-channel", publish=False)

    index, failed = packer.discover_and_pack(
        plugins_root,
        tmp_path / "dist",
        "/files/plugins",
    )

    assert failed == []
    assert set(index["files"]) == {"demo-channel-0.1.0"}
    metadata = index["files"]["demo-channel-0.1.0"]
    assert metadata["platform"] == "channel"
    assert (
        metadata["url"]
        == "/files/plugins/channel/demo-channel/demo-channel-0.1.0.zip"
    )
    assert index["platforms"]["channel"]["versions"] == ["demo-channel-0.1.0"]
    archive = tmp_path / "dist/channel/demo-channel/demo-channel-0.1.0.zip"
    with zipfile.ZipFile(archive) as zipped:
        assert zipped.testzip() is None
        assert set(zipped.namelist()) == {
            "demo-channel/plugin.json",
            "demo-channel/plugin.py",
        }
        assert zipped.read("demo-channel/plugin.py") == b"plugin = object()\n"
    assert not (tmp_path / "dist/channel/private-channel").exists()


@pytest.mark.parametrize("exclude_apps", [False, True])
def test_cli_category_scope_preserves_independent_app_publication(
    tmp_path,
    monkeypatch,
    exclude_apps,
) -> None:
    plugins_root = tmp_path / "plugins"
    for category in packer.KIND_DIRS:
        _write_plugin(
            plugins_root,
            _manifest(id=f"demo-{category}"),
            ["backend/main.py", "ui/dist/index.js"],
            category=category,
        )
    dist = tmp_path / "dist"
    stale_app = dist / "apps" / "old-app.zip"
    stale_app.parent.mkdir(parents=True)
    stale_app.write_bytes(b"stale app from an earlier build")
    command = [
        str(SCRIPT_FILE),
        "--plugins-root",
        str(plugins_root),
        "--dist",
        str(dist),
    ]
    if exclude_apps:
        command.extend(["--exclude-kind", "apps"])
    monkeypatch.setattr(sys, "argv", command)

    assert packer.main() == 0

    index = json.loads((dist / "index.json").read_text(encoding="utf-8"))
    selected = set(packer.KIND_DIRS) - ({"apps"} if exclude_apps else set())
    assert set(index["platforms"]) == selected
    assert set(index["files"]) == {
        f"demo-{category}-1.0.0" for category in selected
    }
    assert not stale_app.exists()
    assert {
        path.parent.parent.name for path in dist.rglob("*.zip")
    } == selected
    for category in selected:
        plugin_id = f"demo-{category}"
        file_id = f"{plugin_id}-1.0.0"
        item = index["files"][file_id]
        assert item["url"] == (
            f"/files/plugins/{category}/{plugin_id}/{file_id}.zip"
        )
        with zipfile.ZipFile(
            dist / category / plugin_id / item["filename"],
        ) as archive:
            assert archive.read(f"{plugin_id}/backend/main.py") == b"content"
            descriptor = json.loads(archive.read(f"{plugin_id}/plugin.json"))
            assert descriptor["id"] == plugin_id


def test_cli_dry_run_uses_the_same_app_category_scope(
    tmp_path,
    monkeypatch,
    capsys,
) -> None:
    plugins_root = tmp_path / "plugins"
    for category in ("apps", "bundle"):
        _write_plugin(
            plugins_root,
            _manifest(id=f"demo-{category}"),
            ["backend/main.py", "ui/dist/index.js"],
            category=category,
        )
    dist = tmp_path / "dist"
    monkeypatch.setattr(
        sys,
        "argv",
        [
            str(SCRIPT_FILE),
            "--plugins-root",
            str(plugins_root),
            "--dist",
            str(dist),
            "--exclude-kind",
            "apps",
            "--dry-run",
        ],
    )

    assert packer.main() == 0

    output = capsys.readouterr().out
    assert "would pack bundle/demo-bundle" in output
    assert "would pack apps/demo-apps" not in output
    assert not dist.exists()


def test_scoped_release_merge_retains_independent_app_versions(
    tmp_path,
) -> None:
    spec = importlib.util.spec_from_file_location(
        "merge_plugin_index_under_test",
        SCRIPT_FILE.with_name("merge_plugin_index.py"),
    )
    assert spec is not None and spec.loader is not None
    merger = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(merger)
    plugins_root = tmp_path / "plugins"
    descriptor = _manifest(id="independent-app")
    source = _write_plugin(
        plugins_root,
        descriptor,
        ["backend/main.py", "ui/dist/index.js"],
    )
    published = tmp_path / "published"
    history, failures = packer.discover_and_pack(
        plugins_root,
        published,
        "/files/plugins",
    )
    assert failures == []
    descriptor["version"] = "2.0.0"
    (source / "plugin.json").write_text(
        json.dumps(descriptor),
        encoding="utf-8",
    )
    independent, failures = packer.discover_and_pack(
        plugins_root,
        published,
        "/files/plugins",
    )
    assert failures == []
    history = merger.merge_indexes(independent, history)
    prior_app_bytes = {
        path: path.read_bytes() for path in published.rglob("*.zip")
    }
    assert len(prior_app_bytes) == 2
    _write_plugin(
        plugins_root,
        _manifest(id="core-plugin"),
        ["backend/main.py", "ui/dist/index.js"],
        category="bundle",
    )

    candidate, failures = packer.discover_and_pack(
        plugins_root,
        tmp_path / "candidate",
        "/files/plugins",
        exclude_kinds=["apps"],
    )
    assert failures == []
    assert set(candidate["files"]) == {"core-plugin-1.0.0"}
    merged = merger.merge_indexes(candidate, history, {"computer-use-tool"})

    assert merged["platforms"]["apps"]["versions"] == [
        "independent-app-2.0.0",
        "independent-app-1.0.0",
    ]
    for file_id, item in history["files"].items():
        assert merged["files"][file_id] == item
    assert all(
        path.read_bytes() == data for path, data in prior_app_bytes.items()
    )
    assert set(merged["files"]) == {
        "core-plugin-1.0.0",
        "independent-app-1.0.0",
        "independent-app-2.0.0",
    }
