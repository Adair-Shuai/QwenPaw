# -*- coding: utf-8 -*-
"""Shared skill-pool lifecycle helpers for the UGSci plugin."""

from __future__ import annotations

import shutil
from pathlib import Path


def sync_plugin_skills_to_pool(plugin_id: str, skills_dir: Path) -> int:
    """Copy plugin skills into the shared skill pool."""
    from qwenpaw.agents.skill_system.pool_service import (
        _register_pool_skill_entry,
    )
    from qwenpaw.agents.skill_system.registry import (
        ensure_skill_pool_initialized,
        reconcile_pool_manifest,
    )
    from qwenpaw.agents.skill_system.store import (
        copy_skill_dir,
        default_pool_manifest,
        get_pool_skill_manifest_path,
        get_skill_pool_dir,
        mutate_json,
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

    for skill_name in skill_names:
        source = skills_dir / skill_name
        destination = safe_skill_dir(pool_dir, skill_name)
        if destination.exists():
            shutil.rmtree(destination)
        copy_skill_dir(source, destination)

        def _update(
            payload,
            _name=skill_name,
            _dir=destination,
            _src=source_tag,
        ):
            _register_pool_skill_entry(
                payload,
                _name,
                _dir,
                source="customized",
                installed_from=_src,
            )
            return payload

        mutate_json(
            get_pool_skill_manifest_path(),
            default_pool_manifest(),
            _update,
        )

    reconcile_pool_manifest()
    return len(skill_names)


def remove_plugin_pool_skills(plugin_id: str) -> int:
    """Remove skills installed from this plugin during uninstall."""
    from qwenpaw.agents.skill_system.registry import reconcile_pool_manifest
    from qwenpaw.agents.skill_system.store import (
        default_pool_manifest,
        get_pool_skill_manifest_path,
        get_skill_pool_dir,
        mutate_json,
        read_skill_pool_manifest,
    )

    source_tag = f"plugin:{plugin_id}"
    manifest = read_skill_pool_manifest()
    to_remove = [
        name
        for name, entry in manifest.get("skills", {}).items()
        if entry.get("installed_from") == source_tag
    ]
    if not to_remove:
        return 0

    def _update(payload, _names=tuple(to_remove)):
        skills = payload.get("skills", {})
        for name in _names:
            skills.pop(name, None)
        return payload

    mutate_json(
        get_pool_skill_manifest_path(),
        default_pool_manifest(),
        _update,
    )
    pool_dir = get_skill_pool_dir()
    for name in to_remove:
        skill_dir = pool_dir / name
        if skill_dir.exists():
            shutil.rmtree(skill_dir)

    reconcile_pool_manifest()
    return len(to_remove)


__all__ = ["remove_plugin_pool_skills", "sync_plugin_skills_to_pool"]
