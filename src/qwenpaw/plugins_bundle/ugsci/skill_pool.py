# -*- coding: utf-8 -*-
"""Shared skill-pool lifecycle helpers for the UGSci plugin."""

from __future__ import annotations

import logging
import shutil
from pathlib import Path

logger = logging.getLogger("qwenpaw").getChild("plugin")


def sync_plugin_skills_to_pool(plugin_id: str, skills_dir: Path) -> int:
    """Copy plugin skills into the shared skill pool.

    Only skills that are brand-new or already owned by *plugin_id* are
    written.  Skills owned by the user, another plugin, or present as
    orphan directories are skipped and reported as conflicts so user data
    is never silently destroyed.

    Returns the number of skills actually synced.
    """
    from qwenpaw.agents.skill_system.pool_service import (
        _register_pool_skill_entry,
    )
    from qwenpaw.agents.skill_system.registry import (
        ensure_skill_pool_initialized,
        reconcile_pool_manifest,
    )
    from qwenpaw.agents.skill_system.store import (
        compute_skill_md_hash,
        copy_skill_dir,
        default_pool_manifest,
        get_pool_skill_manifest_path,
        get_skill_pool_dir,
        mutate_json,
        read_skill_pool_manifest,
        safe_skill_dir,
    )

    ensure_skill_pool_initialized()
    pool_dir = get_skill_pool_dir()
    source_tag = f"plugin:{plugin_id}"
    skill_names = [
        directory.name
        for directory in skills_dir.iterdir()
        if directory.is_dir() and (directory / "SKILL.md").exists()
    ]
    if not skill_names:
        return 0

    manifest = read_skill_pool_manifest()
    skills_index = manifest.get("skills", {})

    synced: list[str] = []
    conflicts: list[str] = []
    for skill_name in skill_names:
        source = skills_dir / skill_name
        destination = safe_skill_dir(pool_dir, skill_name)

        existing_entry = skills_index.get(skill_name) or {}
        existing_installed_from = str(
            existing_entry.get("installed_from", "") or "",
        )

        # Guard: never overwrite a skill we do not own.  This protects
        # user-created skills, skills from other plugins, and orphan
        # directories that have no manifest entry at all.
        if destination.exists() and existing_installed_from != source_tag:
            conflicts.append(skill_name)
            logger.warning(
                "[%s] Skill '%s' already exists in the pool "
                "(installed_from=%r); skipping sync to avoid "
                "overwriting user data.",
                plugin_id,
                skill_name,
                existing_installed_from or "<unknown>",
            )
            continue

        source_hash = compute_skill_md_hash(source)
        recorded_hash = str(
            existing_entry.get("plugin_install_hash", "") or "",
        )
        if destination.exists() and recorded_hash:
            destination_hash = compute_skill_md_hash(destination)
            if (
                destination_hash == recorded_hash
                and source_hash == recorded_hash
            ):
                # The common startup path: no disk copy and no manifest write.
                continue

        # Safe to write: either a brand-new name or our own prior install
        # (legitimate upgrade).
        copy_skill_dir(source, destination)
        install_hash = compute_skill_md_hash(destination)

        def _update(
            payload,
            _name=skill_name,
            _dir=destination,
            _src=source_tag,
            _hash=install_hash,
        ):
            _register_pool_skill_entry(
                payload,
                _name,
                _dir,
                source="customized",
                installed_from=_src,
            )
            entry = payload.get("skills", {}).get(_name)
            if isinstance(entry, dict):
                entry["plugin_install_hash"] = _hash
            return payload

        mutate_json(
            get_pool_skill_manifest_path(),
            default_pool_manifest(),
            _update,
        )
        synced.append(skill_name)

    reconcile_pool_manifest()

    if conflicts:
        logger.warning(
            "[%s] Skipped %d conflicting skill(s) during sync: %s",
            plugin_id,
            len(conflicts),
            ", ".join(sorted(conflicts)),
        )
    return len(synced)


def remove_plugin_pool_skills(plugin_id: str) -> int:
    """Remove skills installed from this plugin during uninstall.

    Only skills whose on-disk content still matches the plugin's original
    install hash (or that have no recorded hash) are deleted.  Skills that
    the user has modified after installation are preserved and demoted to
    regular pool skills so user edits are never lost.

    Returns the number of skills actually removed.
    """
    from qwenpaw.agents.skill_system.registry import reconcile_pool_manifest
    from qwenpaw.agents.skill_system.store import (
        compute_skill_md_hash,
        default_pool_manifest,
        get_pool_skill_manifest_path,
        get_skill_pool_dir,
        is_primary_pool_skill_dir,
        mutate_json,
        read_skill_pool_manifest,
        safe_skill_dir,
    )

    source_tag = f"plugin:{plugin_id}"
    manifest = read_skill_pool_manifest()
    pool_dir = get_skill_pool_dir()

    to_remove: list[str] = []
    to_preserve: list[str] = []
    for name, raw_entry in manifest.get("skills", {}).items():
        entry = raw_entry if isinstance(raw_entry, dict) else {}
        if entry.get("installed_from") != source_tag:
            continue

        recorded_hash = str(entry.get("plugin_install_hash", "") or "")
        if recorded_hash:
            skill_dir = safe_skill_dir(pool_dir, name)
            current_hash = compute_skill_md_hash(skill_dir)
            if current_hash and current_hash != recorded_hash:
                # The user modified the content after the plugin installed
                # it — preserve the directory and demote the manifest entry
                # to a regular user-owned skill.
                to_preserve.append(name)
                logger.warning(
                    "[%s] Preserving user-modified skill '%s' during "
                    "uninstall (content differs from original install).",
                    plugin_id,
                    name,
                )
                continue

        to_remove.append(name)

    if not to_remove and not to_preserve:
        return 0

    def _update(
        payload,
        _remove=tuple(to_remove),
        _preserve=tuple(to_preserve),
    ):
        skills = payload.get("skills", {})
        for name in _remove:
            skills.pop(name, None)
        for name in _preserve:
            entry = skills.get(name)
            if isinstance(entry, dict):
                entry.pop("installed_from", None)
                entry.pop("plugin_install_hash", None)
        return payload

    mutate_json(
        get_pool_skill_manifest_path(),
        default_pool_manifest(),
        _update,
    )

    for name in to_remove:
        skill_dir = safe_skill_dir(pool_dir, name)
        if skill_dir.exists() and is_primary_pool_skill_dir(skill_dir):
            shutil.rmtree(skill_dir)

    reconcile_pool_manifest()

    if to_preserve:
        logger.info(
            "[%s] Preserved %d user-modified skill(s) during uninstall: %s",
            plugin_id,
            len(to_preserve),
            ", ".join(sorted(to_preserve)),
        )
    return len(to_remove)


__all__ = ["remove_plugin_pool_skills", "sync_plugin_skills_to_pool"]
