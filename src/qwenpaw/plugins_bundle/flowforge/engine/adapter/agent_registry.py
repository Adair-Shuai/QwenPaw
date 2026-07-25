# -*- coding: utf-8 -*-
"""Adapter: ``AgentRegistry`` bridging QwenPaw's agent/workspace system.

LeAgent's workflow ``agent_node_factory`` expects:

* ``AgentRegistry.all()`` → ``list[AgentDefinition]``
* ``AgentRegistry.get(name)`` → ``AgentDefinition | None``

QwenPaw manages agents through workspace configs.  Each agent has an
``AgentConfig`` stored on disk.  This adapter lazily loads all agent
configs and wraps them into :class:`AgentDefinition` instances.
"""

from __future__ import annotations

import logging
from typing import Any

from .agent_definition import AgentDefinition

logger = logging.getLogger(__name__)


class AgentRegistry:
    """Adapter wrapping QwenPaw's agent configuration system.

    Lazily discovers all configured agents and wraps their configs into
    :class:`AgentDefinition` instances.
    """

    def __init__(self) -> None:
        self._defs: dict[str, AgentDefinition] = {}
        self._loaded = False

    def _ensure_loaded(self) -> None:
        if self._loaded:
            return
        self._loaded = True
        try:
            from qwenpaw.config.config import list_agent_ids, load_agent_config

            for agent_id in list_agent_ids():
                try:
                    cfg = load_agent_config(agent_id)
                    definition = AgentDefinition.from_qwenpaw_config(cfg)
                    if definition.name:
                        self._defs[definition.name] = definition
                except Exception:  # noqa: BLE001
                    logger.debug("Failed to load agent %r", agent_id, exc_info=True)
        except Exception:  # noqa: BLE001
            logger.debug("AgentRegistry: failed to list agent configs", exc_info=True)

    def all(self) -> list[AgentDefinition]:
        """Return all registered agent definitions."""
        self._ensure_loaded()
        return list(self._defs.values())

    def get(self, name: str) -> AgentDefinition | None:
        """Return the ``AgentDefinition`` for ``name``, or ``None``."""
        self._ensure_loaded()
        return self._defs.get(name)

    def names(self) -> list[str]:
        """Return sorted agent names."""
        self._ensure_loaded()
        return sorted(self._defs.keys())

    def __contains__(self, name: object) -> bool:
        return isinstance(name, str) and name in self.names()

    def __len__(self) -> int:
        self._ensure_loaded()
        return len(self._defs)


# ── Module-level singleton (mirrors ``leagent.runtime.get_agent_registry``) ──

_global_registry: AgentRegistry | None = None


def get_agent_registry() -> AgentRegistry:
    """Return the process-wide :class:`AgentRegistry` singleton."""
    global _global_registry
    if _global_registry is None:
        _global_registry = AgentRegistry()
    return _global_registry


__all__ = ["AgentRegistry", "get_agent_registry"]
