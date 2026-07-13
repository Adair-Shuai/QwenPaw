# -*- coding: utf-8 -*-
"""UGSci plugin backend for QwenPaw.

A lightweight domain-enhancement plugin that reorganizes the QwenPaw UI
into a petroleum-domain-friendly interface with three core modules:
Capabilities, Skills, and Experts.

The backend is intentionally minimal — all UI logic and data aggregation
happens in the frontend plugin (ui/dist/index.js). The backend only provides
plugin lifecycle hooks via the standard QwenPaw plugin API.
"""

from __future__ import annotations

import logging
from pathlib import Path

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci")

PLUGIN_ID = "ugsci"
PLUGIN_NAME = "UGSci"
PLUGIN_DIR = Path(__file__).parent


class UGSciPlugin:
    """UGSci plugin backend entry point.

    Implements the standard QwenPaw plugin interface: a module-level
    ``plugin`` object with a ``register(api)`` method.
    """

    def register(self, api) -> None:
        """Register plugin components via the PluginApi.

        UGSci is a frontend-only enhancement plugin — no backend tools,
        providers, or channels are registered. The frontend bundle
        (ui/dist/index.js) handles all route/menu registration via
        ``window.QwenPaw`` host externals.

        Args:
            api: PluginApi instance provided by the plugin loader.
        """
        logger.info(
            "[%s] Plugin registered — petroleum domain enhancement active",
            PLUGIN_ID,
        )

        # Register skill provider — installs skills from the plugin's
        # ``skills/`` directory into the workspace skill pool.
        try:
            skills_dir = PLUGIN_DIR / "skills"
            if skills_dir.exists():
                api.register_skill_provider(
                    skills_dir=skills_dir,
                    enabled_by_default=False,
                    channels=["all"],
                )
                logger.info(
                    "[%s] Skill provider registered: %s",
                    PLUGIN_ID,
                    skills_dir,
                )
        except Exception as exc:
            logger.error("Failed to register skills: %s", exc)

        # Register startup hook for any future backend-side initialization
        try:
            api.register_startup_hook(
                hook_name="ugsci_init",
                callback=self._on_startup,
                priority=50,
            )
        except Exception:
            # Startup hook registration is optional — the frontend
            # plugin works independently of backend hooks.
            pass

    async def _on_startup(self) -> None:
        """Called when the QwenPaw application starts."""
        logger.info("[%s] Startup hook executed", PLUGIN_ID)


# Module-level plugin object — required by the QwenPaw plugin loader.
# The loader calls ``plugin.register(api)`` during initialization.
plugin = UGSciPlugin()
