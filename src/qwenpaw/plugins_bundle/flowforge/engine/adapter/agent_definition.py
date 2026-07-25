# -*- coding: utf-8 -*-
"""Adapter: ``AgentDefinition`` / ``ModelPolicy`` for QwenPaw agent config.

LeAgent's workflow agent nodes expect an ``AgentDefinition`` with attributes
like ``name``, ``description``, ``max_turns``, ``tools.allow``, ``model.provider``,
``model.model``, ``prompt_variant``, and a ``with_overrides(...)`` method.

QwenPaw agents are configured via :class:`~qwenpaw.config.config.AgentConfig`.
This adapter wraps an ``AgentConfig`` (or constructs one from scratch) into
the ``AgentDefinition`` interface the workflow nodes use.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class ModelPolicy:
    """Model routing policy (provider + model name)."""

    provider: str = ""
    model: str = ""

    def model_copy(self, *, update: dict[str, Any] | None = None) -> "ModelPolicy":
        """Pydantic-like ``model_copy`` for compatibility."""
        new = ModelPolicy(provider=self.provider, model=self.model)
        if update:
            if "provider" in update:
                new.provider = update["provider"]
            if "model" in update:
                new.model = update["model"]
        return new


@dataclass
class ToolsPolicy:
    """Tool allow/deny policy."""

    allow: tuple[str, ...] = ()
    deny: tuple[str, ...] = ()

    def model_copy(self, *, update: dict[str, Any] | None = None) -> "ToolsPolicy":
        new = ToolsPolicy(allow=self.allow, deny=self.deny)
        if update:
            if "allow" in update:
                new.allow = tuple(update["allow"])
            if "deny" in update:
                new.deny = tuple(update["deny"])
        return new


class AgentDefinition:
    """LeAgent-compatible ``AgentDefinition`` wrapping a QwenPaw agent config.

    Provides the attributes and ``with_overrides()`` method the workflow
    agent nodes use, without requiring ``leagent.runtime.definition``.
    """

    def __init__(
        self,
        name: str = "",
        description: str = "",
        max_turns: int = 0,
        tools: ToolsPolicy | None = None,
        model: ModelPolicy | None = None,
        prompt_variant: str = "",
        agent_config: Any = None,
    ) -> None:
        self.name: str = name
        self.description: str = description
        self.max_turns: int = max_turns
        self.tools: ToolsPolicy = tools or ToolsPolicy()
        self.model: ModelPolicy = model or ModelPolicy()
        self.prompt_variant: str = prompt_variant
        self._agent_config = agent_config

    def with_overrides(
        self,
        *,
        model: ModelPolicy | None = None,
        tools: ToolsPolicy | None = None,
        max_turns: int | None = None,
    ) -> "AgentDefinition":
        """Return a copy with the given overrides applied."""
        return AgentDefinition(
            name=self.name,
            description=self.description,
            max_turns=max_turns if max_turns is not None else self.max_turns,
            tools=tools or self.tools,
            model=model or self.model,
            prompt_variant=self.prompt_variant,
            agent_config=self._agent_config,
        )

    @classmethod
    def from_qwenpaw_config(cls, agent_config: Any) -> "AgentDefinition":
        """Build from a QwenPaw ``AgentConfig``."""
        name = getattr(agent_config, "name", "") or ""
        description = getattr(agent_config, "description", "") or ""

        running = getattr(agent_config, "running", None)
        max_turns = getattr(running, "max_iters", 0) if running else 0

        # Extract model info
        active_model = getattr(agent_config, "active_model", None)
        provider = getattr(active_model, "provider_id", "") if active_model else ""
        model_name = getattr(active_model, "model", "") if active_model else ""

        # Extract tool allow list
        tool_config = getattr(agent_config, "tools", None)
        allow: tuple[str, ...] = ()
        if tool_config is not None:
            allow_list = getattr(tool_config, "allow", None) or getattr(tool_config, "enabled", None)
            if isinstance(allow_list, (list, tuple)):
                allow = tuple(str(t) for t in allow_list)

        return cls(
            name=name,
            description=description,
            max_turns=max_turns,
            tools=ToolsPolicy(allow=allow),
            model=ModelPolicy(provider=provider, model=model_name),
            agent_config=agent_config,
        )


__all__ = ["AgentDefinition", "ModelPolicy", "ToolsPolicy"]
