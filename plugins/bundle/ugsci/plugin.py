# -*- coding: utf-8 -*-
"""UGSci plugin backend for QwenPaw.

A lightweight domain-enhancement plugin that reorganizes the QwenPaw UI
into a petroleum-domain-friendly interface with three core modules:
Capabilities, Skills, and Experts.

The backend syncs plugin skills into the **shared skill pool** (not
individual workspaces) so that they are available to all agents without
being auto-injected.  Users can then download specific skills from the
pool to any agent on demand.
"""

from __future__ import annotations

import logging
import shutil
from pathlib import Path

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci")

PLUGIN_ID = "ugsci"
PLUGIN_NAME = "UGSci"
PLUGIN_DIR = Path(__file__).parent


def _sync_plugin_skills_to_pool(
    plugin_id: str,
    skills_dir: Path,
) -> int:
    """Copy plugin skills into the shared skill pool.

    Returns the number of skills synced.
    Uses absolute imports because plugins are loaded as top-level
    modules (``plugin_ugsci``) — relative imports will fail.
    """
    from qwenpaw.agents.skill_system.store import (
        copy_skill_dir,
        get_skill_pool_dir,
        safe_skill_dir,
        get_pool_skill_manifest_path,
        default_pool_manifest,
        mutate_json,
    )
    from qwenpaw.agents.skill_system.registry import (
        ensure_skill_pool_initialized,
        reconcile_pool_manifest,
    )
    from qwenpaw.agents.skill_system.pool_service import (
        _register_pool_skill_entry,
    )

    ensure_skill_pool_initialized()
    pool_dir = get_skill_pool_dir()
    source_tag = f"plugin:{plugin_id}"

    skill_names = [
        d.name
        for d in skills_dir.iterdir()
        if d.is_dir() and (d / "SKILL.md").exists()
    ]

    if not skill_names:
        return 0

    for skill_name in skill_names:
        src = skills_dir / skill_name
        dst = safe_skill_dir(pool_dir, skill_name)

        if dst.exists():
            shutil.rmtree(dst)
        copy_skill_dir(src, dst)

        def _update(
            payload,
            _name=skill_name,
            _dir=dst,
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


def _remove_plugin_pool_skills(plugin_id: str) -> int:
    """Remove plugin-sourced skills from the pool on uninstall.

    Returns the number of skills removed.
    """
    from qwenpaw.agents.skill_system.store import (
        get_pool_skill_manifest_path,
        get_skill_pool_dir,
        default_pool_manifest,
        mutate_json,
        read_skill_pool_manifest,
    )
    from qwenpaw.agents.skill_system.registry import (
        reconcile_pool_manifest,
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

    pool_dir = get_skill_pool_dir()

    def _update(payload, _names=tuple(to_remove)):
        skills = payload.get("skills", {})
        for n in _names:
            skills.pop(n, None)
        return payload

    mutate_json(
        get_pool_skill_manifest_path(),
        default_pool_manifest(),
        _update,
    )

    for name in to_remove:
        skill_dir = pool_dir / name
        if skill_dir.exists():
            shutil.rmtree(skill_dir)

    reconcile_pool_manifest()
    return len(to_remove)


class UGSciPlugin:
    """UGSci plugin backend entry point."""

    def register(self, api) -> None:
        """Register plugin components via the PluginApi."""
        logger.info(
            "[%s] Plugin registered — petroleum domain enhancement active",
            PLUGIN_ID,
        )

        # Sync skills into the shared skill pool (not workspaces).
        try:
            api.register_startup_hook(
                hook_name="ugsci_sync_skills_to_pool",
                callback=self._on_startup_sync_skills,
                priority=80,
            )
        except Exception:
            pass

        # Register cleanup on uninstall
        try:
            api.register_uninstall_hook(
                hook_name="ugsci_remove_pool_skills",
                callback=self._on_uninstall_remove_skills,
            )
        except Exception:
            pass

        # Register startup hook for any future backend-side initialization
        try:
            api.register_startup_hook(
                hook_name="ugsci_init",
                callback=self._on_startup,
                priority=50,
            )
        except Exception:
            pass

    async def _on_startup(self) -> None:
        """Called when the QwenPaw application starts."""
        logger.info("[%s] Startup hook executed", PLUGIN_ID)

    async def _on_startup_sync_skills(self) -> None:
        """Sync plugin skills to the shared skill pool on startup."""
        skills_dir = PLUGIN_DIR / "skills"
        if not skills_dir.exists():
            return
        try:
            count = _sync_plugin_skills_to_pool(PLUGIN_ID, skills_dir)
            if count:
                logger.info(
                    "[%s] Synced %d skill(s) to skill pool",
                    PLUGIN_ID,
                    count,
                )
        except Exception as exc:
            logger.error(
                "[%s] Failed to sync skills to pool: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    @staticmethod
    def _on_uninstall_remove_skills(
        plugin_id: str,
        delete_files: bool = False,
    ) -> None:
        """Remove plugin-sourced skills from the pool on uninstall."""
        try:
            count = _remove_plugin_pool_skills(plugin_id)
            if count:
                logger.info(
                    "[%s] Removed %d skill(s) from pool",
                    plugin_id,
                    count,
                )
        except Exception as exc:
            logger.error(
                "Failed to remove pool skills for '%s': %s",
                plugin_id,
                exc,
                exc_info=True,
            )


# Module-level plugin object — required by the QwenPaw plugin loader.
plugin = UGSciPlugin()
