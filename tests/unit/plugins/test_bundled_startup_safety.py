# -*- coding: utf-8 -*-
# pylint: disable=protected-access
"""Safety regressions for bundled-plugin startup synchronization."""

from __future__ import annotations

import json
import sys

import pytest

from qwenpaw.plugins import bundled
from qwenpaw.app.routers.plugins import _frontend_revision
from qwenpaw.plugins.loader import PluginLoader


def _write_plugin(directory, version: str, *, frontend: bool = True) -> dict:
    directory.mkdir(parents=True)
    manifest = {
        "id": "critical-plugin",
        "version": version,
        "entry": {
            "backend": "plugin.py",
            "frontend": "ui/dist/index.js",
        },
    }
    (directory / "plugin.json").write_text(
        json.dumps(manifest),
        encoding="utf-8",
    )
    (directory / "plugin.py").write_text(
        f'VERSION = "{version}"\n',
        encoding="utf-8",
    )
    if frontend:
        frontend_path = directory / "ui" / "dist" / "index.js"
        frontend_path.parent.mkdir(parents=True)
        frontend_path.write_text(f"// {version}\n", encoding="utf-8")
    return manifest


def test_uninstall_tombstone_survives_deleted_plugin_directory(tmp_path):
    plugins = tmp_path / "plugins"

    assert bundled.mark_plugin_uninstalled(
        "critical-plugin",
        plugins_dir=plugins,
    )
    assert not (plugins / "critical-plugin").exists()
    assert (plugins / ".uninstalled" / "critical-plugin").is_file()
    assert bundled.is_plugin_uninstalled(
        "critical-plugin",
        plugins_dir=plugins,
    )


@pytest.mark.parametrize(
    "plugin_id",
    ["", ".", "..", "../escape", "a/b", r"a\b", "C:escape", " bad"],
)
def test_uninstall_tombstone_rejects_unsafe_plugin_ids(
    tmp_path,
    plugin_id,
):
    plugins = tmp_path / "plugins"

    with pytest.raises(ValueError, match="unsafe plugin id"):
        bundled.mark_plugin_uninstalled(plugin_id, plugins_dir=plugins)

    assert not (tmp_path / "escape").exists()


def test_legacy_uninstall_marker_is_migrated_and_cleared(tmp_path):
    plugins = tmp_path / "plugins"
    installed = plugins / "critical-plugin"
    _write_plugin(installed, "1.0.0")
    legacy = installed / ".uninstalled"
    legacy.write_text("legacy", encoding="utf-8")

    assert bundled.is_plugin_uninstalled(
        "critical-plugin",
        plugins_dir=plugins,
        plugin_dir=installed,
    )
    assert not legacy.exists()
    assert (plugins / ".uninstalled" / "critical-plugin").is_file()
    assert bundled.clear_uninstalled_marker(
        "critical-plugin",
        plugins_dir=plugins,
    )
    assert not bundled.is_plugin_uninstalled(
        "critical-plugin",
        plugins_dir=plugins,
        plugin_dir=installed,
    )


def test_sync_and_loader_skip_persistent_uninstall_tombstone(
    monkeypatch,
    tmp_path,
):
    source_root = tmp_path / "bundle"
    _write_plugin(source_root / "critical-plugin", "1.0.0")
    plugins = tmp_path / "plugins"
    bundled.mark_plugin_uninstalled(
        "critical-plugin",
        plugins_dir=plugins,
    )
    monkeypatch.setattr(
        bundled,
        "_get_bundled_plugins_dirs",
        lambda: [source_root],
    )
    monkeypatch.setattr(
        "qwenpaw.config.utils.get_plugins_dir",
        lambda: plugins,
    )

    assert not bundled.ensure_bundled_plugins_installed()
    assert not (plugins / "critical-plugin").exists()

    _write_plugin(plugins / "critical-plugin", "1.0.0")
    assert not PluginLoader([plugins]).discover_plugins()


def test_macos_onedir_fallback_discovers_plugins_next_to_executable(
    monkeypatch,
    tmp_path,
) -> None:
    """Finder-launched PyInstaller apps can resolve from the onedir root."""
    backend_root = (
        tmp_path
        / "UGSci Desktop.app"
        / "Contents"
        / "Resources"
        / "binaries"
        / "qwenpaw-backend"
    )
    plugin_root = backend_root / "_internal" / "qwenpaw" / "plugins_bundle"
    _write_plugin(plugin_root / "critical-plugin", "1.0.0")

    # Make package-relative and source-checkout discovery unavailable so this
    # exercises the macOS onedir executable fallback specifically.
    import qwenpaw

    fake_package = tmp_path / "unrelated" / "qwenpaw" / "__init__.py"
    fake_package.parent.mkdir(parents=True)
    fake_package.write_text("", encoding="utf-8")
    monkeypatch.setattr(qwenpaw, "__file__", str(fake_package))
    monkeypatch.setattr(bundled, "__file__", str(fake_package))
    backend_executable = backend_root / "qwenpaw-backend"
    monkeypatch.setattr(sys, "executable", str(backend_executable))
    monkeypatch.delattr(sys, "_MEIPASS", raising=False)

    discovered = bundled._get_bundled_plugins_dirs()

    assert plugin_root.resolve() in discovered


def test_desktop_fast_path_repairs_missing_entry(
    monkeypatch,
    tmp_path,
) -> None:
    source = tmp_path / "source"
    target = tmp_path / "installed" / "critical-plugin"
    manifest = _write_plugin(source, "1.0.0")
    _write_plugin(target, "1.0.0", frontend=False)
    bundle_hash_file = target / bundled._BUNDLE_HASH_FILE
    bundle_hash_file.write_text(  # pylint: disable=protected-access
        "previous-complete-install",
        encoding="utf-8",
    )
    monkeypatch.setenv("QWENPAW_DESKTOP_APP", "1")

    install_or_update = bundled._install_or_update_plugin
    changed = install_or_update(  # pylint: disable=protected-access
        source,
        target,
        "critical-plugin",
        manifest,
    )

    assert changed is True
    assert (target / "ui" / "dist" / "index.js").is_file()


def test_packaged_same_version_skips_content_hash(
    monkeypatch,
    tmp_path,
) -> None:
    source = tmp_path / "source"
    target = tmp_path / "installed" / "critical-plugin"
    manifest = _write_plugin(source, "1.0.0")
    _write_plugin(target, "1.0.0")
    monkeypatch.setattr(bundled, "_is_development_environment", lambda: False)
    (target / bundled._BUNDLE_REVISION_FILE).write_text(
        "version:1.0.0",
        encoding="utf-8",
    )
    bundled._write_bundle_complete(target, target)

    def _fail_hash(*_args, **_kwargs):
        raise AssertionError("packaged startup must not compute bundle hashes")

    monkeypatch.setattr(bundled, "_compute_bundle_hash", _fail_hash)

    changed = bundled._install_or_update_plugin(
        source,
        target,
        "critical-plugin",
        manifest,
    )

    assert changed is False
    assert (target / bundled._BUNDLE_REVISION_FILE).read_text(
        encoding="utf-8",
    ) == "version:1.0.0"
    assert (target / bundled._BUNDLE_COMPLETE_FILE).is_file()


def test_packaged_same_version_repairs_missing_completion_marker(
    monkeypatch,
    tmp_path,
) -> None:
    source = tmp_path / "source"
    target = tmp_path / "installed" / "critical-plugin"
    manifest = _write_plugin(source, "1.0.0")
    _write_plugin(target, "1.0.0")
    monkeypatch.setattr(bundled, "_is_development_environment", lambda: False)
    (target / bundled._BUNDLE_REVISION_FILE).write_text(
        "version:1.0.0",
        encoding="utf-8",
    )

    assert bundled._install_or_update_plugin(
        source,
        target,
        "critical-plugin",
        manifest,
    )
    assert (target / bundled._BUNDLE_COMPLETE_FILE).is_file()
    assert (target / bundled._BUNDLE_REVISION_FILE).read_text(
        encoding="utf-8",
    ) == "version:1.0.0"


def test_packaged_same_version_repairs_missing_non_entry_file(
    monkeypatch,
    tmp_path,
) -> None:
    source = tmp_path / "source"
    target = tmp_path / "installed" / "critical-plugin"
    manifest = _write_plugin(source, "1.0.0")
    (source / "runtime.py").write_text("VALUE = 1\n", encoding="utf-8")
    _write_plugin(target, "1.0.0")
    (target / "runtime.py").write_text("VALUE = 1\n", encoding="utf-8")
    bundled._write_bundle_revision(target, "version:1.0.0")
    bundled._write_bundle_complete(target, target)
    (target / "runtime.py").unlink()
    monkeypatch.setattr(bundled, "_is_development_environment", lambda: False)

    assert bundled._install_or_update_plugin(
        source,
        target,
        "critical-plugin",
        manifest,
    )
    assert (target / "runtime.py").is_file()


def test_development_same_version_still_detects_content_changes(
    monkeypatch,
    tmp_path,
) -> None:
    source = tmp_path / "source"
    target = tmp_path / "installed" / "critical-plugin"
    manifest = _write_plugin(source, "1.0.0")
    _write_plugin(target, "1.0.0")
    monkeypatch.setattr(bundled, "_is_development_environment", lambda: True)

    # Seed the installed marker from the original source, then change a file
    # without changing plugin.json/version.
    original_hash = bundled._compute_bundle_hash(source, manifest)
    (target / bundled._BUNDLE_HASH_FILE).write_text(
        original_hash,
        encoding="utf-8",
    )
    (source / "plugin.py").write_text(
        'VERSION = "1.0.0-dev-edit"\n',
        encoding="utf-8",
    )

    changed = bundled._install_or_update_plugin(
        source,
        target,
        "critical-plugin",
        manifest,
    )

    assert changed is True
    assert (target / "plugin.py").read_text(encoding="utf-8") == (
        'VERSION = "1.0.0-dev-edit"\n'
    )


def test_failed_update_keeps_previous_plugin(monkeypatch, tmp_path) -> None:
    source = tmp_path / "source"
    target = tmp_path / "installed" / "critical-plugin"
    manifest = _write_plugin(source, "2.0.0")
    _write_plugin(target, "1.0.0")

    def _fail_copy(_source, _target) -> None:
        raise OSError("simulated antivirus lock")

    monkeypatch.setattr(bundled, "_copy_bundle", _fail_copy)

    with pytest.raises(OSError, match="antivirus"):
        bundled._install_or_update_plugin(  # pylint: disable=protected-access
            source,
            target,
            "critical-plugin",
            manifest,
        )

    plugin_source = (target / "plugin.py").read_text(encoding="utf-8")
    assert plugin_source == 'VERSION = "1.0.0"\n'
    assert (target / "ui" / "dist" / "index.js").is_file()


def test_failed_rollback_retains_previous_plugin_backup(
    monkeypatch,
    tmp_path,
) -> None:
    source = tmp_path / "source"
    target = tmp_path / "installed" / "critical-plugin"
    manifest = _write_plugin(source, "2.0.0")
    _write_plugin(target, "1.0.0")
    original_replace = bundled.Path.replace

    def _fail_new_and_rollback(path, destination):
        if path.name == "plugin" or path.name.startswith(
            ".critical-plugin.previous-",
        ):
            raise OSError("simulated persistent Windows file lock")
        return original_replace(path, destination)

    monkeypatch.setattr(bundled.Path, "replace", _fail_new_and_rollback)

    with pytest.raises(RuntimeError, match="backup retained"):
        bundled._install_or_update_plugin(  # pylint: disable=protected-access
            source,
            target,
            "critical-plugin",
            manifest,
        )

    backups = list(
        (tmp_path / "installed").glob(
            ".critical-plugin.previous-*",
        ),
    )
    assert len(backups) == 1
    assert (backups[0] / "plugin.py").read_text(encoding="utf-8") == (
        'VERSION = "1.0.0"\n'
    )


def test_frontend_revision_changes_without_version_bump(tmp_path) -> None:
    plugin_dir = tmp_path / "plugin"
    manifest = _write_plugin(plugin_dir, "1.0.0")
    entry = manifest["entry"]["frontend"]
    first = _frontend_revision(plugin_dir, entry, "1.0.0")

    (plugin_dir / entry).write_text("// hotfix\n", encoding="utf-8")
    second = _frontend_revision(plugin_dir, entry, "1.0.0")

    assert first != second


def test_frontend_revision_prefers_release_revision_marker(tmp_path) -> None:
    plugin_dir = tmp_path / "plugin"
    manifest = _write_plugin(plugin_dir, "1.0.0")
    (plugin_dir / bundled._BUNDLE_REVISION_FILE).write_text(
        "version:1.0.0",
        encoding="utf-8",
    )

    revision = _frontend_revision(
        plugin_dir,
        manifest["entry"]["frontend"],
        "1.0.0",
    )

    assert revision == "1.0.0-version:1.0.0"
