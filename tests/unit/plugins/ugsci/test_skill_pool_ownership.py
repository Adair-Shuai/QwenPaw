# -*- coding: utf-8 -*-
"""Regression tests for BUG-006: plugin skill sync must not overwrite
user data.

Covers:
- User-created skills with the same name are **not** overwritten during
  plugin skill sync.
- Skills owned by **another plugin** are not overwritten either.
- Skills previously installed by *this* plugin can be upgraded (re-synced).
- Uninstall only deletes skills whose on-disk content still matches the
  plugin's original install hash.
- Skills that the user modified after installation are **preserved** and
  demoted to regular pool skills during uninstall.
- Skills from other plugins are never touched during uninstall.
"""

# pylint: disable=protected-access,redefined-outer-name,unused-argument

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from plugins.bundle.ugsci.skill_pool import (
    remove_plugin_pool_skills,
    sync_plugin_skills_to_pool,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_SKILL_MD_TEMPLATE = """\
---
name: {name}
description: {description}
---

# {title}

{body}
"""


def _make_skill_md(
    name: str,
    description: str = "test skill",
    body: str = "Default body.",
) -> str:
    return _SKILL_MD_TEMPLATE.format(
        name=name,
        description=description,
        title=name,
        body=body,
    )


def _write_skill_dir(parent: Path, name: str, content: str) -> Path:
    """Create ``parent/name/SKILL.md`` and return the directory."""
    skill_dir = parent / name
    skill_dir.mkdir(parents=True, exist_ok=True)
    (skill_dir / "SKILL.md").write_text(content, encoding="utf-8")
    return skill_dir


def _read_pool_manifest(work_dir: Path) -> dict[str, Any]:
    manifest_path = work_dir / "skill_pool" / "skill.json"
    if not manifest_path.exists():
        return {"skills": {}}
    return json.loads(manifest_path.read_text(encoding="utf-8"))


def _write_pool_manifest(work_dir: Path, manifest: dict[str, Any]) -> None:
    manifest_path = work_dir / "skill_pool" / "skill.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )


def _pool_skill_dir(work_dir: Path, name: str) -> Path:
    return work_dir / "skill_pool" / name


def _read_skill_md(path: Path) -> str:
    skill_md = path / "SKILL.md"
    assert skill_md.exists(), f"SKILL.md missing at {skill_md}"
    return skill_md.read_text(encoding="utf-8")


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def isolated_work_dir(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> Path:
    """Point QWENPAW at a clean tmp working dir.

    Pre-creates the skill_pool directory and an empty manifest so that
    ``ensure_skill_pool_initialized`` does not trigger a full builtin
    import.
    """
    work_dir = tmp_path / "qwenpaw-home"
    pool_dir = work_dir / "skill_pool"
    pool_dir.mkdir(parents=True, exist_ok=True)

    # Write a minimal valid manifest so ensure_skill_pool_initialized
    # considers the pool "already initialised" and skips importing
    # packaged builtins.
    _write_pool_manifest(
        work_dir,
        {
            "schema_version": "skill-pool-manifest.v1",
            "version": 1,
            "skills": {},
            "builtin_skill_names": [],
        },
    )

    from qwenpaw import constant

    monkeypatch.setattr(constant, "WORKING_DIR", work_dir, raising=True)
    monkeypatch.setenv("QWENPAW_WORKING_DIR", str(work_dir))

    return work_dir


@pytest.fixture
def plugin_skills_dir(tmp_path: Path) -> Path:
    """A fake plugin ``skills/`` source directory with one bundled skill."""
    skills_dir = tmp_path / "plugin_skills"
    skills_dir.mkdir()
    _write_skill_dir(
        skills_dir,
        "shared_skill",
        _make_skill_md("shared_skill", "plugin bundled skill", "Plugin body."),
    )
    return skills_dir


PLUGIN_ID = "ugsci"
OTHER_PLUGIN_ID = "other_plugin"


# ---------------------------------------------------------------------------
# Sync: conflict detection
# ---------------------------------------------------------------------------


def test_sync_does_not_overwrite_user_skill(
    isolated_work_dir: Path,
    plugin_skills_dir: Path,
) -> None:
    """A user-created skill with the same name must survive plugin sync.

    Test flow:
    1. Pre-create a user skill ``shared_skill`` in the pool with no
       ``installed_from`` (user-owned).
    2. Run plugin sync.
    3. Assert the user's SKILL.md content is unchanged.
    4. Assert the manifest entry still has no ``installed_from``.
    """
    user_content = _make_skill_md(
        "shared_skill",
        "my custom skill",
        "User-authored content — do not touch.",
    )
    user_dir = _write_skill_dir(
        _pool_skill_dir(isolated_work_dir, "shared_skill").parent,
        "shared_skill",
        user_content,
    )
    # Give it a user-owned manifest entry (no installed_from).
    _write_pool_manifest(
        isolated_work_dir,
        {
            "schema_version": "skill-pool-manifest.v1",
            "version": 1,
            "skills": {
                "shared_skill": {
                    "name": "shared_skill",
                    "description": "my custom skill",
                    "source": "customized",
                    "installed_from": "",
                },
            },
            "builtin_skill_names": [],
        },
    )

    count = sync_plugin_skills_to_pool(PLUGIN_ID, plugin_skills_dir)

    # The conflicting skill was skipped, so 0 were synced.
    assert count == 0
    assert _read_skill_md(user_dir) == user_content

    manifest = _read_pool_manifest(isolated_work_dir)
    entry = manifest["skills"]["shared_skill"]
    assert entry.get("installed_from") != f"plugin:{PLUGIN_ID}"


def test_sync_does_not_overwrite_other_plugin_skill(
    isolated_work_dir: Path,
    plugin_skills_dir: Path,
) -> None:
    """A skill owned by another plugin must survive sync.

    Test flow:
    1. Pre-create a skill owned by ``plugin:other_plugin``.
    2. Run UGSci sync.
    3. Assert the other plugin's content and ownership are preserved.
    """
    other_content = _make_skill_md(
        "shared_skill",
        "other plugin skill",
        "Belongs to another plugin.",
    )
    other_dir = _write_skill_dir(
        _pool_skill_dir(isolated_work_dir, "shared_skill").parent,
        "shared_skill",
        other_content,
    )
    _write_pool_manifest(
        isolated_work_dir,
        {
            "schema_version": "skill-pool-manifest.v1",
            "version": 1,
            "skills": {
                "shared_skill": {
                    "name": "shared_skill",
                    "description": "other plugin skill",
                    "source": "customized",
                    "installed_from": f"plugin:{OTHER_PLUGIN_ID}",
                },
            },
            "builtin_skill_names": [],
        },
    )

    count = sync_plugin_skills_to_pool(PLUGIN_ID, plugin_skills_dir)

    assert count == 0
    assert _read_skill_md(other_dir) == other_content

    manifest = _read_pool_manifest(isolated_work_dir)
    entry = manifest["skills"]["shared_skill"]
    assert entry.get("installed_from") == f"plugin:{OTHER_PLUGIN_ID}"


def test_sync_does_not_overwrite_orphan_directory(
    isolated_work_dir: Path,
    plugin_skills_dir: Path,
) -> None:
    """An orphan directory (on disk, not in manifest) must survive sync.

    This models a user who manually dropped a skill folder into the pool
    without going through the manifest-managing API.
    """
    orphan_content = _make_skill_md(
        "shared_skill",
        "orphan skill",
        "Hand-placed content.",
    )
    orphan_dir = _write_skill_dir(
        _pool_skill_dir(isolated_work_dir, "shared_skill").parent,
        "shared_skill",
        orphan_content,
    )
    # Manifest has no entry for this skill at all.
    _write_pool_manifest(
        isolated_work_dir,
        {
            "schema_version": "skill-pool-manifest.v1",
            "version": 1,
            "skills": {},
            "builtin_skill_names": [],
        },
    )

    count = sync_plugin_skills_to_pool(PLUGIN_ID, plugin_skills_dir)

    assert count == 0
    assert _read_skill_md(orphan_dir) == orphan_content


# ---------------------------------------------------------------------------
# Sync: legitimate upgrade + new install
# ---------------------------------------------------------------------------


def test_sync_upgrades_own_skill(
    isolated_work_dir: Path,
    plugin_skills_dir: Path,
) -> None:
    """A skill previously installed by this plugin can be re-synced (upgraded).

    Test flow:
    1. Pre-create a skill owned by ``plugin:ugsci`` (stale content).
    2. Run sync with updated plugin source content.
    3. Assert the content was replaced and the manifest still marks
       ownership correctly, including ``plugin_install_hash``.
    """
    stale_content = _make_skill_md(
        "shared_skill",
        "old version",
        "Stale plugin body.",
    )
    _write_skill_dir(
        _pool_skill_dir(isolated_work_dir, "shared_skill").parent,
        "shared_skill",
        stale_content,
    )
    _write_pool_manifest(
        isolated_work_dir,
        {
            "schema_version": "skill-pool-manifest.v1",
            "version": 1,
            "skills": {
                "shared_skill": {
                    "name": "shared_skill",
                    "description": "old version",
                    "source": "customized",
                    "installed_from": f"plugin:{PLUGIN_ID}",
                    "plugin_install_hash": "stale-hash-placeholder",
                },
            },
            "builtin_skill_names": [],
        },
    )

    count = sync_plugin_skills_to_pool(PLUGIN_ID, plugin_skills_dir)

    assert count == 1
    new_content = _read_skill_md(
        _pool_skill_dir(isolated_work_dir, "shared_skill"),
    )
    assert "Plugin body." in new_content
    assert "Stale plugin body." not in new_content

    manifest = _read_pool_manifest(isolated_work_dir)
    entry = manifest["skills"]["shared_skill"]
    assert entry.get("installed_from") == f"plugin:{PLUGIN_ID}"
    # The install hash must be recorded and must be a non-empty string.
    assert entry.get("plugin_install_hash")


def test_sync_installs_brand_new_skill(
    isolated_work_dir: Path,
    plugin_skills_dir: Path,
) -> None:
    """A brand-new plugin skill (no pre-existing pool entry) is installed.

    Test flow:
    1. Start with an empty pool.
    2. Run sync.
    3. Assert the skill was copied and the manifest records ownership.
    """
    count = sync_plugin_skills_to_pool(PLUGIN_ID, plugin_skills_dir)

    assert count == 1
    skill_dir = _pool_skill_dir(isolated_work_dir, "shared_skill")
    assert (skill_dir / "SKILL.md").exists()

    manifest = _read_pool_manifest(isolated_work_dir)
    entry = manifest["skills"]["shared_skill"]
    assert entry.get("installed_from") == f"plugin:{PLUGIN_ID}"
    assert entry.get("plugin_install_hash")


def test_sync_mixed_conflict_and_new(
    isolated_work_dir: Path,
    tmp_path: Path,
) -> None:
    """Sync handles a mix of conflicts and new installs atomically per skill.

    Test flow:
    1. Plugin ships two skills: ``conflicted`` and ``fresh``.
    2. ``conflicted`` already exists as a user skill → skip.
    3. ``fresh`` is new → install.
    4. Assert count == 1, user content preserved, fresh installed.
    """
    plugin_dir = tmp_path / "plugin_skills"
    plugin_dir.mkdir()
    _write_skill_dir(
        plugin_dir,
        "conflicted",
        _make_skill_md("conflicted", "plugin version", "Plugin."),
    )
    _write_skill_dir(
        plugin_dir,
        "fresh",
        _make_skill_md("fresh", "plugin new skill", "New."),
    )

    # Pre-create the conflicting user skill.
    user_content = _make_skill_md("conflicted", "user version", "User.")
    _write_skill_dir(
        _pool_skill_dir(isolated_work_dir, "conflicted").parent,
        "conflicted",
        user_content,
    )
    _write_pool_manifest(
        isolated_work_dir,
        {
            "schema_version": "skill-pool-manifest.v1",
            "version": 1,
            "skills": {
                "conflicted": {
                    "name": "conflicted",
                    "source": "customized",
                    "installed_from": "",
                },
            },
            "builtin_skill_names": [],
        },
    )

    count = sync_plugin_skills_to_pool(PLUGIN_ID, plugin_dir)

    assert count == 1
    # User skill untouched.
    assert (
        _read_skill_md(_pool_skill_dir(isolated_work_dir, "conflicted"))
        == user_content
    )
    # New skill installed.
    fresh_dir = _pool_skill_dir(isolated_work_dir, "fresh")
    assert (fresh_dir / "SKILL.md").exists()
    manifest = _read_pool_manifest(isolated_work_dir)
    assert (
        manifest["skills"]["fresh"]["installed_from"] == f"plugin:{PLUGIN_ID}"
    )


# ---------------------------------------------------------------------------
# Uninstall: safe removal
# ---------------------------------------------------------------------------


def test_uninstall_removes_unmodified_plugin_skill(
    isolated_work_dir: Path,
    plugin_skills_dir: Path,
) -> None:
    """Uninstall deletes a plugin skill whose content is unchanged.

    Test flow:
    1. Sync the plugin skill.
    2. Uninstall.
    3. Assert the directory and manifest entry are gone.
    """
    sync_plugin_skills_to_pool(PLUGIN_ID, plugin_skills_dir)

    removed = remove_plugin_pool_skills(PLUGIN_ID)

    assert removed == 1
    assert not _pool_skill_dir(isolated_work_dir, "shared_skill").exists()
    manifest = _read_pool_manifest(isolated_work_dir)
    assert "shared_skill" not in manifest.get("skills", {})


def test_uninstall_preserves_user_modified_plugin_skill(
    isolated_work_dir: Path,
    plugin_skills_dir: Path,
) -> None:
    """Uninstall preserves a plugin skill the user edited after install.

    Test flow:
    1. Sync the plugin skill.
    2. Modify the SKILL.md on disk (simulating user edits).
    3. Uninstall.
    4. Assert the directory survives, the manifest entry is demoted
       (``installed_from`` and ``plugin_install_hash`` cleared), and
       the content is the user's edited version.
    """
    sync_plugin_skills_to_pool(PLUGIN_ID, plugin_skills_dir)

    skill_dir = _pool_skill_dir(isolated_work_dir, "shared_skill")
    # Simulate a user edit.
    edited_md = _make_skill_md(
        "shared_skill",
        "user-edited skill",
        "I added my own notes here.",
    )
    (skill_dir / "SKILL.md").write_text(edited_md, encoding="utf-8")

    removed = remove_plugin_pool_skills(PLUGIN_ID)

    assert removed == 0
    assert skill_dir.exists()
    assert _read_skill_md(skill_dir) == edited_md

    manifest = _read_pool_manifest(isolated_work_dir)
    entry = manifest["skills"]["shared_skill"]
    assert entry.get("installed_from") != f"plugin:{PLUGIN_ID}"
    assert "plugin_install_hash" not in entry


def test_uninstall_does_not_touch_other_plugin_skills(
    isolated_work_dir: Path,
    plugin_skills_dir: Path,
) -> None:
    """Uninstall never removes skills owned by another plugin.

    Test flow:
    1. Sync UGSci skill (installs ``shared_skill``).
    2. Manually re-tag the manifest entry as belonging to another plugin.
    3. Uninstall UGSci.
    4. Assert the skill is untouched.
    """
    sync_plugin_skills_to_pool(PLUGIN_ID, plugin_skills_dir)

    # Retag as another plugin's skill.
    manifest = _read_pool_manifest(isolated_work_dir)
    manifest["skills"]["shared_skill"][
        "installed_from"
    ] = f"plugin:{OTHER_PLUGIN_ID}"
    _write_pool_manifest(isolated_work_dir, manifest)

    removed = remove_plugin_pool_skills(PLUGIN_ID)

    assert removed == 0
    assert _pool_skill_dir(isolated_work_dir, "shared_skill").exists()
    new_manifest = _read_pool_manifest(isolated_work_dir)
    entry = new_manifest["skills"]["shared_skill"]
    assert entry.get("installed_from") == f"plugin:{OTHER_PLUGIN_ID}"


def test_uninstall_with_no_plugin_skills_returns_zero(
    isolated_work_dir: Path,
) -> None:
    """Uninstall is a no-op when no skills are tagged for the plugin."""
    removed = remove_plugin_pool_skills(PLUGIN_ID)
    assert removed == 0


# ---------------------------------------------------------------------------
# Round-trip: sync → upgrade → uninstall
# ---------------------------------------------------------------------------


def test_sync_upgrade_preserves_hash_after_reconcile(
    isolated_work_dir: Path,
    plugin_skills_dir: Path,
) -> None:
    """``plugin_install_hash`` survives ``reconcile_pool_manifest``.

    The reconcile step rebuilds manifest entries from disk; the hash must
    be carried over so a subsequent uninstall can detect user edits.
    """
    sync_plugin_skills_to_pool(PLUGIN_ID, plugin_skills_dir)

    manifest = _read_pool_manifest(isolated_work_dir)
    entry = manifest["skills"]["shared_skill"]
    assert entry.get("installed_from") == f"plugin:{PLUGIN_ID}"
    # After reconcile the hash must still be present.
    assert entry.get("plugin_install_hash")
    assert entry["plugin_install_hash"] != "stale-hash-placeholder"

    # Now a clean uninstall should remove it.
    removed = remove_plugin_pool_skills(PLUGIN_ID)
    assert removed == 1
    assert not _pool_skill_dir(isolated_work_dir, "shared_skill").exists()


def test_uninstall_preserves_skill_edited_via_api(
    isolated_work_dir: Path,
    plugin_skills_dir: Path,
) -> None:
    """Uninstall preserves a plugin skill the user edited through the API.

    This covers the path where ``_register_pool_skill_entry`` is invoked
    (e.g. via ``SkillPoolService.save_pool_skill``).  The hash must be
    preserved so that a subsequent uninstall detects the content change.

    Test flow:
    1. Sync the plugin skill (installs with ``plugin_install_hash``).
    2. Simulate an API edit by calling ``_register_pool_skill_entry``
       with new metadata and ``preserve_from`` pointing at the current
       entry — this is exactly what ``save_pool_skill`` does.
    3. Modify the SKILL.md content on disk.
    4. Uninstall.
    5. Assert the skill is preserved (not deleted).
    """
    from qwenpaw.agents.skill_system.pool_service import (
        _register_pool_skill_entry,
    )
    from qwenpaw.agents.skill_system.store import (
        default_pool_manifest,
        get_pool_skill_manifest_path,
        mutate_json,
    )

    sync_plugin_skills_to_pool(PLUGIN_ID, plugin_skills_dir)

    skill_dir = _pool_skill_dir(isolated_work_dir, "shared_skill")

    # Simulate user editing the content through the API.
    edited_md = _make_skill_md(
        "shared_skill",
        "user-edited via API",
        "API-edited content.",
    )
    (skill_dir / "SKILL.md").write_text(edited_md, encoding="utf-8")

    # Simulate what save_pool_skill does: rebuild the entry via
    # _register_pool_skill_entry with preserve_from = current entry.
    current_manifest = _read_pool_manifest(isolated_work_dir)
    current_entry = current_manifest["skills"]["shared_skill"]

    def _update(payload: dict[str, Any]) -> Any:
        _register_pool_skill_entry(
            payload,
            "shared_skill",
            skill_dir,
            source="customized",
            preserve_from=current_entry,
        )
        return payload

    mutate_json(
        get_pool_skill_manifest_path(),
        default_pool_manifest(),
        _update,
    )

    # The hash must still be present after the API edit.
    manifest = _read_pool_manifest(isolated_work_dir)
    entry = manifest["skills"]["shared_skill"]
    assert entry.get("installed_from") == f"plugin:{PLUGIN_ID}"
    assert entry.get(
        "plugin_install_hash",
    ), "plugin_install_hash must survive _register_pool_skill_entry"

    # Uninstall should preserve the skill because content differs.
    removed = remove_plugin_pool_skills(PLUGIN_ID)
    assert removed == 0
    assert skill_dir.exists()
    assert _read_skill_md(skill_dir) == edited_md
