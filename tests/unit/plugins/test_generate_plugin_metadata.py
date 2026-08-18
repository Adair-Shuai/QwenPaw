# -*- coding: utf-8 -*-
# pylint: disable=wrong-import-position
"""Unit tests for scripts/pack/generate_plugin_metadata.py."""

from __future__ import annotations

import json
import sys
import zipfile
from pathlib import Path

import pytest

# Add scripts/pack to the path so we can import the module
sys.path.insert(
    0,
    str(
        Path(__file__).resolve().parent.parent.parent.parent
        / "scripts"
        / "pack",
    ),
)

from generate_plugin_metadata import (  # noqa: E402
    _build_metadata,
    _iter_tree_relpaths,
    _normalize_pack_exclude,
    _safe_entry_relpath,
    _safe_release_segment,
    _validate_declared_entries,
    _zip_plugin,
    discover_and_pack,
    get_version,
)


def test_published_metadata_defaults_to_ugsci_channel(tmp_path: Path) -> None:
    zip_path = tmp_path / "demo.zip"
    zip_path.write_bytes(b"demo")
    metadata = _build_metadata(
        {"id": "ulit", "author": "QwenPaw Team"},
        file_id="ulit-0.1.2",
        plugin_id="ulit",
        version="0.1.2",
        kind="app",
        zip_path=zip_path,
        cdn_path="/files/plugins/ulit-0.1.2.zip",
    )
    assert metadata["channel"] == "ugsci"
    assert metadata["author"] == "QwenPaw Team"


def test_structured_qwenpaw_version_passthrough() -> None:
    manifest = {"qwenpaw_version": {"min": "1.1.6", "max": "2.1.0"}}
    assert get_version(manifest) == {"min": "1.1.6", "max": "2.1.0"}


def test_structured_qwenpaw_version_only_min() -> None:
    manifest = {"qwenpaw_version": {"min": "2.0.0"}}
    assert get_version(manifest) == {"min": "2.0.0"}


def test_structured_qwenpaw_version_strips_leading_v() -> None:
    manifest = {"qwenpaw_version": {"min": "v1.0.0", "max": "v2.0.0"}}
    assert get_version(manifest) == {"min": "1.0.0", "max": "2.0.0"}


def test_structured_qwenpaw_version_strips_whitespace() -> None:
    manifest = {"qwenpaw_version": {"min": " 1.0.0 ", "max": " 2.0.0\t"}}
    assert get_version(manifest) == {"min": "1.0.0", "max": "2.0.0"}


def test_legacy_min_and_max() -> None:
    manifest = {"min_version": "1.1.0", "max_version": "2.0.0"}
    assert get_version(manifest) == {"min": "1.1.0", "max": "2.0.0"}


def test_legacy_only_min() -> None:
    manifest = {"min_version": "1.1.0"}
    assert get_version(manifest) == {"min": "1.1.0"}


def test_legacy_only_max() -> None:
    manifest = {"max_version": "2.0.0"}
    assert get_version(manifest) == {"max": "2.0.0"}


def test_legacy_strips_leading_v() -> None:
    manifest = {"min_version": "v1.0.0", "max_version": "V2.0.0"}
    assert get_version(manifest) == {"min": "1.0.0", "max": "2.0.0"}


def test_legacy_strips_whitespace() -> None:
    manifest = {"min_version": " 1.0.0 ", "max_version": "\t2.0.0 "}
    assert get_version(manifest) == {"min": "1.0.0", "max": "2.0.0"}


def test_no_constraints_returns_none() -> None:
    manifest = {"id": "demo", "version": "1.0.0"}
    assert get_version(manifest) is None


def test_non_dict_qwenpaw_version_falls_to_legacy() -> None:
    """Non-dict qwenpaw_version is ignored; falls back to min/max."""
    manifest = {
        "qwenpaw_version": "invalid",
        "min_version": "1.0.0",
    }
    assert get_version(manifest) == {"min": "1.0.0"}


def test_non_dict_qwenpaw_version_no_legacy_returns_none() -> None:
    manifest = {"qwenpaw_version": "invalid"}
    assert get_version(manifest) is None


def test_prerelease_version_string_in_legacy() -> None:
    """Pre-release suffix like '1.0.0-rc1' passes through as-is."""
    manifest = {"min_version": "1.0.0-rc1", "max_version": "2.0.0-beta"}
    assert get_version(manifest) == {
        "min": "1.0.0-rc1",
        "max": "2.0.0-beta",
    }


def test_extra_keys_in_qwenpaw_version_ignored() -> None:
    """Only 'min' and 'max' keys are retained."""
    manifest = {
        "qwenpaw_version": {
            "min": "1.0.0",
            "max": "2.0.0",
            "note": "should be ignored",
        },
    }
    assert get_version(manifest) == {"min": "1.0.0", "max": "2.0.0"}


# --- pack_exclude ---------------------------------------------------------


def _make_plugin_tree(root: Path) -> Path:
    """Create a plugin dir with runtime files and dev-only files."""
    plugin_dir = root / "demo-plugin"
    files = [
        "plugin.json",
        "requirements.txt",
        "backend/main.py",
        "backend/api/router.py",
        "backend/tests/test_api.py",
        "backend/pytest.ini",
        "e2e/test_shell.py",
        "ui/dist/index.js",
        "ui/src/App.tsx",
        "ui/package.json",
    ]
    for rel in files:
        path = plugin_dir / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("x", encoding="utf-8")
    return plugin_dir


def _demo_manifest() -> dict:
    return {
        "id": "demo-plugin",
        "version": "1.0.0",
        "entry": {
            "backend": "backend/main.py",
            "frontend": "ui/dist/index.js",
        },
        "pack_exclude": [
            "backend/tests",
            "backend/pytest.ini",
            "e2e",
            "ui/src",
            "ui/package.json",
        ],
    }


def test_normalize_pack_exclude_missing_returns_empty() -> None:
    assert not _normalize_pack_exclude({})


def test_normalize_pack_exclude_non_list_ignored() -> None:
    assert not _normalize_pack_exclude({"pack_exclude": "backend/tests"})


def test_normalize_pack_exclude_strips_slashes_and_backslashes() -> None:
    manifest = {"pack_exclude": ["e2e/", "ui\\src", "/scripts"]}
    assert _normalize_pack_exclude(manifest) == [
        "e2e",
        "ui/src",
        "scripts",
    ]


def test_normalize_pack_exclude_drops_traversal_and_empty() -> None:
    manifest = {"pack_exclude": ["../secrets", "a/../../b", "", "."]}
    assert not _normalize_pack_exclude(manifest)


def test_iter_tree_relpaths_prunes_pack_exclude(tmp_path: Path) -> None:
    plugin_dir = _make_plugin_tree(tmp_path)
    rels = _iter_tree_relpaths(plugin_dir, _demo_manifest())
    assert "backend/main.py" in rels
    assert "backend/api/router.py" in rels
    assert "ui/dist/index.js" in rels
    assert "plugin.json" in rels
    assert "backend/tests/test_api.py" not in rels
    assert "backend/pytest.ini" not in rels
    assert "e2e/test_shell.py" not in rels
    assert "ui/src/App.tsx" not in rels
    assert "ui/package.json" not in rels


def test_pack_exclude_never_drops_manifest_or_entries(
    tmp_path: Path,
) -> None:
    """plugin.json and entry files survive even a hostile pack_exclude."""
    plugin_dir = _make_plugin_tree(tmp_path)
    manifest = _demo_manifest()
    manifest["pack_exclude"] = [
        "plugin.json",
        "backend/main.py",
        "ui/dist/index.js",
    ]
    rels = _iter_tree_relpaths(plugin_dir, manifest)
    assert "plugin.json" in rels
    assert "backend/main.py" in rels
    assert "ui/dist/index.js" in rels


def test_iter_tree_relpaths_are_posix_on_every_platform(
    tmp_path: Path,
) -> None:
    """Relpaths never carry a native separator (Windows regression guard)."""
    plugin_dir = _make_plugin_tree(tmp_path)
    rels = _iter_tree_relpaths(plugin_dir, _demo_manifest())
    assert rels
    assert not any("\\" in rel for rel in rels)


def test_pack_exclude_exact_prefix_no_sibling_bleed(tmp_path: Path) -> None:
    """'e2e' must not exclude a sibling like 'e2e-extra/'."""
    plugin_dir = _make_plugin_tree(tmp_path)
    extra = plugin_dir / "e2e-extra" / "keep.py"
    extra.parent.mkdir(parents=True)
    extra.write_text("x", encoding="utf-8")
    rels = _iter_tree_relpaths(plugin_dir, _demo_manifest())
    assert "e2e-extra/keep.py" in rels
    assert "e2e/test_shell.py" not in rels


def test_zip_plugin_applies_pack_exclude(tmp_path: Path) -> None:
    plugin_dir = _make_plugin_tree(tmp_path)
    manifest = _demo_manifest()
    (plugin_dir / "plugin.json").write_text(
        json.dumps(manifest),
        encoding="utf-8",
    )
    out_zip = tmp_path / "out" / "demo-plugin-1.0.0.zip"
    _zip_plugin(plugin_dir, out_zip, manifest)
    with zipfile.ZipFile(out_zip) as zf:
        names = set(zf.namelist())
    assert "demo-plugin/backend/main.py" in names
    assert "demo-plugin/ui/dist/index.js" in names
    assert "demo-plugin/plugin.json" in names
    assert not any("backend/tests" in n for n in names)
    assert not any("/e2e/" in n for n in names)
    assert not any("ui/src" in n for n in names)


def test_zip_plugin_is_byte_identical_for_unchanged_content(
    tmp_path: Path,
) -> None:
    """Rebuilds can safely reuse an immutable OSS object."""
    plugin_dir = _make_plugin_tree(tmp_path)
    manifest = _demo_manifest()
    (plugin_dir / "plugin.json").write_text(
        json.dumps(manifest),
        encoding="utf-8",
    )
    first_zip = tmp_path / "first" / "demo-plugin-1.0.0.zip"
    second_zip = tmp_path / "second" / "demo-plugin-1.0.0.zip"

    _zip_plugin(plugin_dir, first_zip, manifest)
    for source in plugin_dir.rglob("*"):
        if source.is_file():
            source.touch()
    _zip_plugin(plugin_dir, second_zip, manifest)

    assert first_zip.read_bytes() == second_zip.read_bytes()


def test_validate_declared_entries_rejects_missing_frontend(
    tmp_path: Path,
) -> None:
    plugin_dir = _make_plugin_tree(tmp_path)
    manifest = _demo_manifest()
    (plugin_dir / "ui/dist/index.js").unlink()

    with pytest.raises(
        FileNotFoundError,
        match=(
            r"cannot package demo-plugin: declared entry file\(s\) "
            r"missing: ui/dist/index.js"
        ),
    ):
        _validate_declared_entries(plugin_dir, manifest)


def test_zip_plugin_missing_entry_leaves_no_artifact(tmp_path: Path) -> None:
    plugin_dir = _make_plugin_tree(tmp_path)
    manifest = _demo_manifest()
    (plugin_dir / "ui/dist/index.js").unlink()
    out_zip = tmp_path / "out" / "demo-plugin-1.0.0.zip"

    with pytest.raises(FileNotFoundError, match="ui/dist/index.js"):
        _zip_plugin(plugin_dir, out_zip, manifest)

    assert not out_zip.exists()


def test_zip_plugin_without_manifest_packs_everything(
    tmp_path: Path,
) -> None:
    """Backwards compatibility: no manifest arg means no pack_exclude."""
    plugin_dir = _make_plugin_tree(tmp_path)
    out_zip = tmp_path / "out" / "demo-plugin-1.0.0.zip"
    _zip_plugin(plugin_dir, out_zip)
    with zipfile.ZipFile(out_zip) as zf:
        names = set(zf.namelist())
    assert "demo-plugin/backend/tests/test_api.py" in names
    assert "demo-plugin/ui/src/App.tsx" in names


@pytest.mark.parametrize(
    "value",
    ["../escape", "a/b", "a\\b", "/absolute", "C:drive", "", ".", ".."],
)
def test_release_segments_reject_path_escapes(value: str) -> None:
    with pytest.raises(ValueError, match="unsafe"):
        _safe_release_segment(value, "plugin id")


@pytest.mark.parametrize(
    "value",
    ["../secret.py", "a/../../b.py", "/absolute.py", "C:\\secret.py"],
)
def test_entry_paths_reject_path_escapes(value: str) -> None:
    with pytest.raises(ValueError, match="unsafe"):
        _safe_entry_relpath(value, "plugin entry")


def test_zip_plugin_rejects_symlinked_files(tmp_path: Path) -> None:
    plugin_dir = _make_plugin_tree(tmp_path)
    target = tmp_path / "outside.txt"
    target.write_text("secret", encoding="utf-8")
    link = plugin_dir / "leak.txt"
    try:
        link.symlink_to(target)
    except OSError:
        pytest.skip("symlinks unavailable on this platform")

    with pytest.raises(ValueError, match="symlinked file"):
        _zip_plugin(plugin_dir, tmp_path / "out.zip", _demo_manifest())


def test_duplicate_plugin_id_version_fails_closed(tmp_path: Path) -> None:
    plugins_root = tmp_path / "plugins"
    for kind in ("bundle", "apps"):
        plugin_dir = plugins_root / kind / f"demo-{kind}"
        plugin_dir.mkdir(parents=True)
        manifest = {"id": "same-id", "version": "1.0.0"}
        (plugin_dir / "plugin.json").write_text(
            json.dumps(manifest),
            encoding="utf-8",
        )

    with pytest.raises(ValueError, match="duplicate published plugin"):
        discover_and_pack(plugins_root, tmp_path / "dist", "/files/plugins")
