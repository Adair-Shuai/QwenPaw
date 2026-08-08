# -*- coding: utf-8 -*-
"""Registration orchestration for the GenUI module within UGSci.

Called by ``UGSciPlugin._register_genui(api)``. Handles:
- Feature flag and channel capability checks.
- Tool conflict detection (skip if upstream already provides emit_ui_tree).
- Tool registration via ``api.register_tool``.
- Prompt section injection via ``api.register_prompt_section``.
- Graceful failure: GenUI registration errors never affect other UGSci capabilities.
"""

import logging
from typing import Any

from .tools import emit_ui_tree, list_ui_components, get_genui_guide_tool
from .prompt import get_prompt_text

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.genui")

# Tool registration tuples: (name, func, description, icon, tool_type, target_param)
_GENUI_TOOLS: list[tuple[str, Any, str, str, str, str]] = [
    (
        "emit_ui_tree",
        emit_ui_tree,
        "Emit a validated generative UI tree (cards, tables, charts, KPIs) "
        "that renders inline in chat. Call get_genui_guide and "
        "list_ui_components before non-trivial trees.",
        "🎨",
        "internal",
        "",
    ),
    (
        "list_ui_components",
        list_ui_components,
        "Return the GenUI component catalog (kinds + prop hints). "
        "Call before authoring emit_ui_tree payloads. Read-only.",
        "📋",
        "internal",
        "",
    ),
    (
        "get_genui_guide",
        get_genui_guide_tool,
        "Return the GenUI guide: wire format, syntax, layout, and visual "
        "design guidance. Call before non-trivial emit_ui_tree. Read-only.",
        "📖",
        "internal",
        "",
    ),
]


def _genui_enabled_for_context(agent: Any) -> bool:
    """Check if GenUI is enabled for the current agent/channel context.

    Phase-1: Always enabled when the module is loaded. Phase-2 will add
    channel detection (only 'console' channel) and feature flag checks.
    """
    # TODO: Add channel detection — only enable for 'console' channel.
    # TODO: Add feature flag check from agent config or global settings.
    return True


def _has_existing_emit_ui_tool(registry: Any) -> bool:
    """Check if an emit_ui_tree tool is already registered (upstream or other plugin)."""
    if registry is None:
        return False
    try:
        wm = registry.get_workspace_manager()
        if wm is None:
            return False
        for ws in getattr(wm, "agents", {}).values():
            tr = getattr(
                getattr(ws, "plugins", None),
                "tool_registry",
                None,
            )
            if tr is not None and "emit_ui_tree" in tr:
                return True
    except Exception:
        pass
    return False


def register_genui(api: Any, plugin_id: str = "ugsci") -> None:
    """Register GenUI tools and prompt section.

    This function is the single entry point for GenUI module registration.
    It is called by ``UGSciPlugin._register_genui`` and must:
    - Read feature flags and channel capabilities before registering.
    - Use existing ``api.register_tool`` and ``api.register_prompt_section``.
    - Handle registration failures gracefully (log and skip, don't crash).
    - Skip tool registration if upstream already provides emit_ui_tree.
    - Register prompt section only when tools are successfully registered.
    """
    try:
        # ── Feature flag check ──────────────────────────────────────────
        # Phase-1: always enabled. Future: check config and channel.
        if not _genui_enabled_for_context(None):
            logger.info("[%s.genui] GenUI disabled by feature flag", plugin_id)
            return

        # ── Tool conflict detection ─────────────────────────────────────
        registry = getattr(api, "_registry", None)
        if _has_existing_emit_ui_tool(registry):
            logger.info(
                "[%s.genui] emit_ui_tree already registered by upstream; "
                "skipping tool registration",
                plugin_id,
            )
            # Still register the prompt section so the model knows GenUI
            # is available via the upstream tool.
            _register_prompt(api, plugin_id)
            return

        # ── Register tools ──────────────────────────────────────────────
        registered_count = 0
        for name, func, description, icon, tool_type, target_param in _GENUI_TOOLS:
            try:
                api.register_tool(
                    tool_name=name,
                    tool_func=func,
                    description=description,
                    icon=icon,
                    enabled=True,
                    tool_type=tool_type,
                    target_param=target_param,
                )
                registered_count += 1
            except Exception as exc:
                logger.error(
                    "[%s.genui] Failed to register tool '%s': %s",
                    plugin_id,
                    name,
                    exc,
                    exc_info=True,
                )

        if registered_count == 0:
            logger.error(
                "[%s.genui] No GenUI tools registered; skipping prompt",
                plugin_id,
            )
            return

        logger.info(
            "[%s.genui] Registered %d GenUI tool(s)",
            plugin_id,
            registered_count,
        )

        # ── Register prompt section ─────────────────────────────────────
        _register_prompt(api, plugin_id)

    except Exception as exc:
        logger.error(
            "[%s.genui] GenUI registration failed: %s",
            plugin_id,
            exc,
            exc_info=True,
        )


def _register_prompt(api: Any, plugin_id: str) -> None:
    """Register the GenUI system prompt section."""
    try:
        api.register_prompt_section(
            name=f"{plugin_id}.genui_guide",
            after="workspace",
            provider=lambda agent: get_prompt_text(),
            priority=90,
        )
        logger.info(
            "[%s.genui] Prompt section registered",
            plugin_id,
        )
    except Exception as exc:
        logger.debug(
            "[%s.genui] Prompt section registration failed: %s",
            plugin_id,
            exc,
            exc_info=True,
        )


__all__ = ["register_genui"]
