# -*- coding: utf-8 -*-
"""Oil & Gas Visualization plugin entry point.

Registers FastAPI routers for dataset management, binary resource serving,
and health checks.  No heavy dependencies are imported here — xtgeo and
numpy are imported lazily inside the reader modules.
"""

from __future__ import annotations

import logging
from pathlib import Path

logger = logging.getLogger("qwenpaw").getChild("plugin.oilgas_vis")

PLUGIN_ID = "oilgas-visualization"
PLUGIN_DIR = Path(__file__).parent


class OilGasVisualizationPlugin:
    """QwenPaw registration coordinator for the visualization plugin."""

    def register(self, api) -> None:
        """Register HTTP routers, workspace hooks, and agent tools."""
        logger.info("[%s] Plugin registered — visualization workspace active", PLUGIN_ID)

        self._register_router(
            api,
            self._build_api_router,
            "/oilgas-vis",
            "oilgas-vis",
            "oil & gas visualization API",
        )

        self._register_tools(api)

    def _register_tools(self, api) -> None:
        """Register agent tools and command bridge."""
        try:
            from .backend.tools import configure_tools, get_tool_bindings

            configure_tools(PLUGIN_DIR)
            for name, func, description, tool_type, target_param in get_tool_bindings():
                try:
                    api.register_tool(
                        tool_name=name,
                        tool_func=func,
                        description=description,
                        icon="🛢️",
                        # The visualization command bridge is the plugin's
                        # primary Agent integration.  Enable it by default so
                        # natural-language scene operations work immediately;
                        # users can still disable individual tools in the
                        # host's tool policy/configuration.
                        enabled=True,
                        tool_type=tool_type,
                        target_param=target_param,
                        startup_priority=95,
                    )
                    logger.info("[%s] Tool '%s' scheduled", PLUGIN_ID, name)
                except Exception:
                    logger.exception("[%s] Tool '%s' registration failed", PLUGIN_ID, name)
        except Exception as exc:
            logger.exception("[%s] Tool registration failed: %s", PLUGIN_ID, exc)

    def _register_router(self, api, router_factory, prefix, tag, label):
        """Register a FastAPI router with error handling.

        Uses the QwenPaw PluginAPI.register_http_router signature:
            register_http_router(router, *, prefix, tags)
        """
        try:
            router = router_factory()
            api.register_http_router(
                router,
                prefix=prefix,
                tags=[tag],
            )
            logger.info("[%s] Router '%s' registered at /api%s", PLUGIN_ID, tag, prefix)
        except Exception as exc:
            logger.error("[%s] Failed to register '%s': %s", PLUGIN_ID, label, exc, exc_info=True)

    @staticmethod
    def _build_api_router():
        # The loader exposes this entry module as a package even when the
        # manifest ID contains a hyphen, so package-relative imports are both
        # supported and required.  Bare names such as ``api`` can otherwise
        # resolve to another already-loaded plugin's module.
        from .backend.api import build_router
        return build_router(PLUGIN_DIR)


# QwenPaw's loader expects the backend entry module to expose a ``plugin``
# object implementing ``register(api)``.  Keep the module-level helper for
# compatibility with early standalone prototypes, but make the canonical
# loader contract explicit.
plugin = OilGasVisualizationPlugin()


def register(api) -> None:
    """Backward-compatible module-level registration function."""
    plugin.register(api)


__all__ = [
    "OilGasVisualizationPlugin",
    "PLUGIN_DIR",
    "PLUGIN_ID",
    "plugin",
    "register",
]
