# -*- coding: utf-8 -*-
"""Tests for BUG-009: engine config persistence across plugin upgrades.

Covers:
- ``_migrate_legacy_engines()`` copies configs from the old plugin-dir
  location to ``WORKING_DIR/ugsci/engines``.
- Existing configs in the new location are never overwritten.
- ``init_default_engines()`` triggers migration before creating defaults.
- ``bundled.py`` preserves the ``engines/`` directory across rmtree +
  copytree updates.
"""

# pylint: disable=protected-access,redefined-outer-name,unused-argument

from __future__ import annotations

import json
from pathlib import Path

import pytest

from plugins.bundle.ugsci.engine.manager import (
    DEFAULT_ENGINES,
    EngineInfo,
    _migrate_legacy_engines,
    _read_all_engines,
    _read_engine,
    _write_engine,
    init_default_engines,
)

# ──────────────────────────────────────────────────────────────────────────
# _migrate_legacy_engines
# ──────────────────────────────────────────────────────────────────────────


def test_migrate_legacy_engines_copies_files(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Configs in the legacy plugin-dir are copied to the new location."""
    new_dir = tmp_path / "new_engines"
    legacy_dir = tmp_path / "legacy_engines"
    legacy_dir.mkdir()

    # Create a user-modified engine config in the legacy location
    user_engine = EngineInfo(
        id="custom_sim",
        name="Custom Simulator",
        vendor="TestCo",
        version="2.0",
        executable_path="/usr/local/bin/custom_sim",
        is_custom=True,
    )
    (legacy_dir / "custom_sim.json").write_text(
        json.dumps(
            __import__("dataclasses").asdict(user_engine),
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    monkeypatch.setattr(
        "plugins.bundle.ugsci.engine.manager.ENGINES_DIR",
        new_dir,
    )
    monkeypatch.setattr(
        "plugins.bundle.ugsci.engine.manager._LEGACY_ENGINES_DIR",
        legacy_dir,
    )

    count = _migrate_legacy_engines()

    assert count == 1
    migrated = _read_engine("custom_sim")
    assert migrated is not None
    assert migrated.name == "Custom Simulator"
    assert migrated.executable_path == "/usr/local/bin/custom_sim"


def test_migrate_legacy_engines_does_not_overwrite(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Existing configs in the new location are not overwritten."""
    new_dir = tmp_path / "new_engines"
    new_dir.mkdir(parents=True)
    legacy_dir = tmp_path / "legacy_engines"
    legacy_dir.mkdir()

    # Monkeypatch BEFORE writing so _write_engine targets new_dir
    monkeypatch.setattr(
        "plugins.bundle.ugsci.engine.manager.ENGINES_DIR",
        new_dir,
    )
    monkeypatch.setattr(
        "plugins.bundle.ugsci.engine.manager._LEGACY_ENGINES_DIR",
        legacy_dir,
    )

    # Write a config in the new location (user's current version)
    current = EngineInfo(id="eclipse", name="Eclipse Current", is_default=True)
    _write_engine(current)

    # Write a different version in the legacy location
    legacy_engine = EngineInfo(
        id="eclipse",
        name="Eclipse Old",
        is_default=True,
    )
    (legacy_dir / "eclipse.json").write_text(
        json.dumps(
            __import__("dataclasses").asdict(legacy_engine),
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    count = _migrate_legacy_engines()

    assert count == 0  # Nothing migrated because eclipse.json already exists
    engine = _read_engine("eclipse")
    assert engine is not None
    assert engine.name == "Eclipse Current"  # Not overwritten


def test_migrate_legacy_engines_no_legacy_dir(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Returns 0 when the legacy directory doesn't exist."""
    monkeypatch.setattr(
        "plugins.bundle.ugsci.engine.manager.ENGINES_DIR",
        tmp_path / "new_engines",
    )
    monkeypatch.setattr(
        "plugins.bundle.ugsci.engine.manager._LEGACY_ENGINES_DIR",
        tmp_path / "nonexistent",
    )

    assert _migrate_legacy_engines() == 0


def test_migrate_legacy_engines_empty_legacy_dir(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Returns 0 when the legacy directory exists but is empty."""
    legacy_dir = tmp_path / "legacy_engines"
    legacy_dir.mkdir()

    monkeypatch.setattr(
        "plugins.bundle.ugsci.engine.manager.ENGINES_DIR",
        tmp_path / "new_engines",
    )
    monkeypatch.setattr(
        "plugins.bundle.ugsci.engine.manager._LEGACY_ENGINES_DIR",
        legacy_dir,
    )

    assert _migrate_legacy_engines() == 0


# ──────────────────────────────────────────────────────────────────────────
# init_default_engines (with migration)
# ──────────────────────────────────────────────────────────────────────────


def test_init_default_engines_migrates_then_creates(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """init_default_engines migrates legacy configs, then creates
    missing defaults."""
    new_dir = tmp_path / "new_engines"
    legacy_dir = tmp_path / "legacy_engines"
    legacy_dir.mkdir()

    # Put a user-modified default engine in the legacy location
    user_cmg = EngineInfo(
        id="cmg",
        name="CMG (User Configured)",
        vendor="Computer Modelling Group",
        version="2025.30",
        executable_path="D:\\CMG\\IMEX\\2025.30\\Win_x64\\EXE\\mx202530.exe",
        is_default=True,
    )
    (legacy_dir / "cmg.json").write_text(
        json.dumps(
            __import__("dataclasses").asdict(user_cmg),
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    monkeypatch.setattr(
        "plugins.bundle.ugsci.engine.manager.ENGINES_DIR",
        new_dir,
    )
    monkeypatch.setattr(
        "plugins.bundle.ugsci.engine.manager._LEGACY_ENGINES_DIR",
        legacy_dir,
    )

    count = init_default_engines()

    # Should have migrated cmg (1) + created remaining defaults (4)
    # Total defaults = len(DEFAULT_ENGINES) = 5, minus 1 migrated = 4 created
    assert count == len(DEFAULT_ENGINES) - 1

    # The migrated CMG config should preserve user modifications
    cmg = _read_engine("cmg")
    assert cmg is not None
    assert cmg.version == "2025.30"
    assert "mx202530.exe" in cmg.executable_path

    # Other defaults should be created with default values
    eclipse = _read_engine("eclipse")
    assert eclipse is not None
    assert eclipse.version == ""  # Default, not user-configured


def test_init_default_engines_idempotent(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Calling init_default_engines twice doesn't duplicate or overwrite."""
    new_dir = tmp_path / "new_engines"
    legacy_dir = tmp_path / "legacy_engines"
    legacy_dir.mkdir()

    monkeypatch.setattr(
        "plugins.bundle.ugsci.engine.manager.ENGINES_DIR",
        new_dir,
    )
    monkeypatch.setattr(
        "plugins.bundle.ugsci.engine.manager._LEGACY_ENGINES_DIR",
        legacy_dir,
    )

    count1 = init_default_engines()
    count2 = init_default_engines()

    assert count1 == len(DEFAULT_ENGINES)  # All defaults created
    assert count2 == 0  # Nothing new on second call

    engines = _read_all_engines()
    assert len(engines) == len(DEFAULT_ENGINES)


# ──────────────────────────────────────────────────────────────────────────
# bundled.py — engines/ directory preservation across updates
# ──────────────────────────────────────────────────────────────────────────


def test_bundled_preserves_engines_dir_on_update(
    tmp_path: Path,
) -> None:
    """_install_or_update_plugin preserves the engines/ dir during
    rmtree+copytree."""
    from qwenpaw.plugins.bundled import (
        _install_or_update_plugin,
        _read_manifest,
    )

    # Simulate a bundle source plugin
    bundle_src = tmp_path / "bundle_src" / "testplugin"
    bundle_src.mkdir(parents=True)
    (bundle_src / "plugin.json").write_text(
        json.dumps(
            {"id": "testplugin", "version": "1.0.0"},
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    (bundle_src / "main.py").write_text("# v1.0.0\n", encoding="utf-8")

    # Simulate an installed plugin with user engine configs
    target_dir = tmp_path / "installed" / "testplugin"
    target_dir.mkdir(parents=True)
    (target_dir / "plugin.json").write_text(
        json.dumps(
            {"id": "testplugin", "version": "0.9.0"},
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    (target_dir / "main.py").write_text("# v0.9.0\n", encoding="utf-8")

    # User engine config in the old location
    engines_dir = target_dir / "engines"
    engines_dir.mkdir()
    user_config = {
        "id": "custom",
        "name": "My Engine",
        "executable_path": "/opt/sim",
    }
    (engines_dir / "custom.json").write_text(
        json.dumps(user_config, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    manifest = _read_manifest(bundle_src)
    assert manifest is not None

    result = _install_or_update_plugin(
        bundle_src,
        target_dir,
        "testplugin",
        manifest,
    )

    assert result is True

    # The user engine config should still exist after the update
    preserved = target_dir / "engines" / "custom.json"
    assert preserved.is_file()
    data = json.loads(preserved.read_text(encoding="utf-8"))
    assert data["name"] == "My Engine"
    assert data["executable_path"] == "/opt/sim"

    # The plugin code should be updated
    assert (target_dir / "main.py").read_text(encoding="utf-8") == "# v1.0.0\n"


@pytest.mark.parametrize(
    "dirname",
    ["engines", "data", "state", "workspace", "models", "user-data"],
)
def test_bundled_full_update_preserves_all_user_data_roots(
    tmp_path: Path,
    dirname: str,
) -> None:
    """Full bundled sync overlays user data into the staged replacement."""
    from qwenpaw.plugins.bundled import _install_or_update_plugin
    from qwenpaw.plugins.bundled import _read_manifest

    source = tmp_path / "source"
    target = tmp_path / "installed"
    source.mkdir()
    target.mkdir()
    (source / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": "2.0.0"}),
        encoding="utf-8",
    )
    (target / "plugin.json").write_text(
        json.dumps({"id": "demo", "version": "1.0.0"}),
        encoding="utf-8",
    )
    (source / dirname).mkdir()
    (target / dirname).mkdir()
    (source / dirname / "shipped.json").write_text("new", encoding="utf-8")
    (target / dirname / "shipped.json").write_text("old", encoding="utf-8")
    (target / dirname / "user.json").write_text("keep", encoding="utf-8")

    manifest = _read_manifest(source)
    assert manifest is not None
    assert _install_or_update_plugin(source, target, "demo", manifest)
    user_value = (target / dirname / "user.json").read_text(encoding="utf-8")
    shipped_value = (target / dirname / "shipped.json").read_text(
        encoding="utf-8",
    )
    assert user_value == "keep"
    assert shipped_value == "new"


def test_bundled_hash_excludes_engines_dir(
    tmp_path: Path,
) -> None:
    """Content hash excludes files in the engines/ directory."""
    from qwenpaw.plugins.bundled import _compute_bundle_hash

    plugin_a = tmp_path / "plugin_a"
    plugin_a.mkdir()
    (plugin_a / "plugin.json").write_text(
        json.dumps({"id": "test", "version": "1.0.0"}, ensure_ascii=False),
        encoding="utf-8",
    )
    (plugin_a / "main.py").write_text("# code\n", encoding="utf-8")

    plugin_b = tmp_path / "plugin_b"
    plugin_b.mkdir()
    (plugin_b / "plugin.json").write_text(
        json.dumps({"id": "test", "version": "1.0.0"}, ensure_ascii=False),
        encoding="utf-8",
    )
    (plugin_b / "main.py").write_text("# code\n", encoding="utf-8")

    # Add different engine configs to each — should NOT affect hash
    (plugin_a / "engines").mkdir()
    (plugin_a / "engines" / "a.json").write_text(
        '{"id": "a"}',
        encoding="utf-8",
    )

    (plugin_b / "engines").mkdir()
    (plugin_b / "engines" / "b.json").write_text(
        '{"id": "b"}',
        encoding="utf-8",
    )

    manifest = {"id": "test", "version": "1.0.0"}
    hash_a = _compute_bundle_hash(plugin_a, manifest)
    hash_b = _compute_bundle_hash(plugin_b, manifest)

    assert hash_a == hash_b
