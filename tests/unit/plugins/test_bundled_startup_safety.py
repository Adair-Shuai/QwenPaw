# -*- coding: utf-8 -*-
# pylint: disable=protected-access
"""Safety regressions for bundled-plugin startup synchronization."""

from __future__ import annotations

import json

import pytest

from qwenpaw.plugins import bundled
from qwenpaw.app.routers.plugins import _frontend_revision


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


def test_desktop_fast_path_repairs_missing_entry(
    monkeypatch,
    tmp_path,
) -> None:
    source = tmp_path / "source"
    target = tmp_path / "installed" / "critical-plugin"
    manifest = _write_plugin(source, "1.0.0")
    _write_plugin(target, "1.0.0", frontend=False)
    (
        target / bundled._BUNDLE_HASH_FILE
    ).write_text(  # pylint: disable=protected-access
        "previous-complete-install",
        encoding="utf-8",
    )
    monkeypatch.setenv("QWENPAW_DESKTOP_APP", "1")

    changed = (
        bundled._install_or_update_plugin(  # pylint: disable=protected-access
            source,
            target,
            "critical-plugin",
            manifest,
        )
    )

    assert changed is True
    assert (target / "ui" / "dist" / "index.js").is_file()


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

    assert (target / "plugin.py").read_text(encoding="utf-8") == (
        'VERSION = "1.0.0"\n'
    )
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
