# -*- coding: utf-8 -*-
"""Adapter: ``get_service_manager`` — service manager facade.

LeAgent's ``load_image`` and ``asset_export`` nodes call
``get_service_manager()`` to access the session manager and file service.

QwenPaw doesn't have a global service manager singleton.  This adapter
returns a lightweight facade that delegates to QwenPaw's plugin registry
and workspace manager when available, and returns ``None`` for any
service that isn't wired.
"""

from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)


class ServiceManagerFacade:
    """Lightweight facade mirroring LeAgent's ``ServiceManager``.

    Attributes:
        session_manager: Always ``None`` (QwenPaw sessions are workspace-scoped).
        file_service: Always ``None`` (use ``register_tool_artifact`` instead).
    """

    def __init__(self) -> None:
        self.session_manager: Any = None
        self.file_service: Any = None

        # Try to resolve the workspace manager for file access
        try:
            from qwenpaw.plugins.registry import PluginRegistry

            registry = PluginRegistry()
            mgr = registry.get_workspace_manager()
            if mgr is not None:
                # Look for file_service on the workspace manager or first workspace
                self.file_service = getattr(mgr, "file_service", None)
                if self.file_service is None:
                    agents = getattr(mgr, "agents", None) or getattr(mgr, "workspaces", None)
                    if agents:
                        first_ws = next(iter(agents.values()))
                        self.file_service = getattr(first_ws, "file_service", None)
        except Exception:  # noqa: BLE001
            pass


_singleton: ServiceManagerFacade | None = None


def get_service_manager() -> ServiceManagerFacade:
    """Return the process-wide :class:`ServiceManagerFacade` singleton."""
    global _singleton
    if _singleton is None:
        _singleton = ServiceManagerFacade()
    return _singleton


__all__ = ["ServiceManagerFacade", "get_service_manager"]
