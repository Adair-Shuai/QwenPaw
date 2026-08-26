# -*- coding: utf-8 -*-
"""QwenPawLocalWorkspace — routes tool management to ToolRegistry.

Subclasses AgentScope's :class:`LocalWorkspace` so that
:meth:`list_tools` returns QwenPaw's own tools (managed by
:class:`ToolRegistry`) instead of AgentScope's built-in six.

All tool consumers call ``list_tools()`` — the only public interface:

- **No arguments**: returns default-enabled tools (``WorkspaceBase``
  protocol).
- **With filter kwargs**: returns tools filtered by per-request
  context (modes, skills, features, agent config gates).

``ToolRegistry`` is an internal implementation detail.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from agentscope.workspace import LocalWorkspace as AgentScopeLocalWorkspace

if TYPE_CHECKING:
    from ...runtime.tool_registry import ToolRegistry


class QwenPawLocalWorkspace(AgentScopeLocalWorkspace):
    """LocalWorkspace whose ``list_tools`` delegates to ToolRegistry."""

    def __init__(self, tool_registry: ToolRegistry, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        self._tool_registry = tool_registry
        self._governor: Any = None

    async def initialize(self) -> None:
        """Mark the tool adapter ready without managing workspace state.

        QwenPaw owns MCP and skill persistence. AgentScope 2.0.7 otherwise
        repartitions QwenPaw's ``skills`` directory during initialization.
        """
        self.is_alive = True

    def set_governor(self, governor: Any) -> None:
        """Inject the ResourceGovernor for policy-governed tool wrapping.

        Called by :class:`AgentBuilder` after the governor is created.
        Must be called before the first :meth:`list_tools` invocation
        for the governor to take effect on workspace tools.
        """
        self._governor = governor

    async def list_tools(  # type: ignore[override]
        self,
        *,
        agent_config: Any = None,
        agent_id: str | None = None,  # pylint: disable=unused-argument
        request_context: dict[str, Any] | None = None,
        active_modes: tuple[str, ...] | set[str] = (),
        active_skills: tuple[str, ...] | set[str] = (),
        enabled_features: tuple[str, ...] | set[str] = (),
    ) -> list[Any]:
        """Return QwenPaw tools, replacing AgentScope built-ins.

        Without arguments the call satisfies the ``WorkspaceBase``
        protocol and returns every default-enabled tool.  When
        *agent_config* (and optional filter sets) are supplied the
        result is narrowed by config gates and four-dimensional
        filtering.
        """
        from ...governance import PolicyGuardedTool

        if agent_config is not None:
            allowed, denied = self._resolve_config_gates(agent_config)
        else:
            allowed, denied = None, set()

        subagent_whitelist = (request_context or {}).get(
            "subagent_allowed_tools",
        )
        if isinstance(subagent_whitelist, list):
            # Empty list means deny-all workspace tools (unlike
            # ToolRegistry.filter, where empty allowed == unrestricted).
            if not subagent_whitelist:
                if not (request_context or {}).get(
                    "agent_coordination_requested",
                ):
                    return []
                allowed = set()
            else:
                sa_set = set(subagent_whitelist)
                allowed = (allowed & sa_set) if allowed is not None else sa_set

        allowed, denied = self._apply_coordination_tool_gates(
            allowed,
            denied,
            request_context,
        )

        descs = self._tool_registry.filter(
            active_modes=set(active_modes),
            active_skills=set(active_skills),
            enabled_features=set(enabled_features),
            allowed=allowed,
            denied=denied,
            request_context=request_context,
        )

        return [
            PolicyGuardedTool(
                d.func,
                governor=self._governor,
                request_context=request_context,
            )
            for d in descs
        ]

    # -------------------------------------------------------------- internal

    @staticmethod
    def _apply_coordination_tool_gates(
        allowed: set[str] | None,
        denied: set[str],
        request_context: dict[str, Any] | None,
    ) -> tuple[set[str] | None, set[str]]:
        """Enable only inter-Agent tools for an explicit coordination turn.

        The override is request-scoped and does not persist changes to the
        Agent's configured tool permissions.
        """
        if (request_context or {}).get(
            "agent_coordination_requested",
        ) is not True:
            return allowed, denied
        required = {"list_agents", "chat_with_agent"}
        next_allowed = (
            (set(allowed) | required) if allowed is not None else None
        )
        return next_allowed, set(denied) - required

    def _resolve_config_gates(
        self,
        agent_config: Any,
    ) -> tuple[set[str] | None, set[str]]:
        """Translate ``agent_config.tools.builtin_tools`` to (allowed, denied).

        Migrated verbatim from ``AgentBuilder._resolve_config_gates``.
        """
        cfg = (
            getattr(
                getattr(agent_config, "tools", None),
                "builtin_tools",
                None,
            )
            or {}
        )
        denied = {
            n for n, c in cfg.items() if getattr(c, "enabled", True) is False
        }
        explicit_enabled = {
            n for n, c in cfg.items() if getattr(c, "enabled", True)
        }

        defaults = self._tool_registry.default_enabled_names()
        plugin_opt_ins = explicit_enabled - defaults
        if plugin_opt_ins:
            return defaults | explicit_enabled, denied
        return None, denied


__all__ = ["QwenPawLocalWorkspace"]
