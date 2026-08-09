# -*- coding: utf-8 -*-
"""Registration orchestration for the GenUI module within UGSci.

Includes channel/feature gating per PLAN §8 and REVIEW D14:
- Tools and prompts are only registered when GenUI is enabled and
  the current channel supports GenUI rendering.
- Config keys: genui_enabled, genui_channels, genui_allow_html, genui_allow_actions.

Configuration precedence (highest to lowest):
1. Environment variables (GENUI_ENABLED, GENUI_CHANNELS, ...)
2. Plugin config (api.config["genui_enabled"], api.config["genui_channels"], ...)
3. Built-in defaults
"""

import logging
import os
from typing import Any

from .tools import emit_ui_tree, emit_ui_patch, list_ui_components, get_genui_guide_tool
from .prompt import get_prompt_text

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.genui")

# ─── Configuration ──────────────────────────────────────────────────────────

# Channels that support GenUI rendering (REVIEW D14)
_GENUI_CAPABLE_CHANNELS: frozenset[str] = frozenset({"console", "web", "pywebview"})

# Default allowed actions (REVIEW D9)
_DEFAULT_ALLOWED_ACTIONS: tuple[str, ...] = ("send_message",)

# Default config — used when neither env nor plugin config provides a value
_DEFAULT_CONFIG: dict[str, Any] = {
    "enabled": True,
    "channels": ["console", "web"],
    "allow_html": False,
    "allow_actions": list(_DEFAULT_ALLOWED_ACTIONS),
}


def _read_bool_env(key: str, default: bool) -> bool:
    """Read a boolean from environment variable."""
    val = os.environ.get(key.upper(), "")
    if val.lower() in ("1", "true", "yes", "on"):
        return True
    if val.lower() in ("0", "false", "no", "off"):
        return False
    return default


def _read_list_env(key: str, default: list[str]) -> list[str]:
    """Read a comma-separated list from environment variable."""
    val = os.environ.get(key.upper(), "")
    if val:
        return [v.strip() for v in val.split(",") if v.strip()]
    return default


def _coerce_bool(val: Any, default: bool = False) -> bool:
    """Coerce any value to bool with fallback."""
    if isinstance(val, bool):
        return val
    if isinstance(val, str):
        if val.lower() in ("1", "true", "yes", "on"):
            return True
        if val.lower() in ("0", "false", "no", "off"):
            return False
    return default


def _coerce_list(val: Any, default: list[str]) -> list[str]:
    """Coerce any value to list[str] with fallback."""
    if isinstance(val, list):
        return [str(v) for v in val if v]
    if isinstance(val, str) and val:
        return [v.strip() for v in val.split(",") if v.strip()]
    return default


def get_genui_config(api: Any = None) -> dict[str, Any]:
    """Read GenUI configuration from plugin config, env, and defaults.

    Precedence: env > plugin config (api.config) > defaults.

    Args:
        api: PluginApi instance (optional). When provided, reads
            ``api.config`` for plugin-level configuration keys:
            ``genui_enabled``, ``genui_channels``,
            ``genui_allow_html``, ``genui_allow_actions``.

    Returns:
        Dict with keys: enabled, channels, allow_html, allow_actions.
    """
    # Start with defaults
    cfg = {
        "enabled": _DEFAULT_CONFIG["enabled"],
        "channels": list(_DEFAULT_CONFIG["channels"]),
        "allow_html": _DEFAULT_CONFIG["allow_html"],
        "allow_actions": list(_DEFAULT_CONFIG["allow_actions"]),
    }

    # Layer 1: plugin config (api.config)
    if api is not None:
        api_cfg = getattr(api, "config", None) or {}
        if isinstance(api_cfg, dict):
            if "genui_enabled" in api_cfg:
                cfg["enabled"] = _coerce_bool(api_cfg["genui_enabled"], cfg["enabled"])
            if "genui_channels" in api_cfg:
                cfg["channels"] = _coerce_list(api_cfg["genui_channels"], cfg["channels"])
            if "genui_allow_html" in api_cfg:
                cfg["allow_html"] = _coerce_bool(api_cfg["genui_allow_html"], cfg["allow_html"])
            if "genui_allow_actions" in api_cfg:
                cfg["allow_actions"] = _coerce_list(api_cfg["genui_allow_actions"], cfg["allow_actions"])

    # Layer 2: environment overrides
    cfg["enabled"] = _read_bool_env("GENUI_ENABLED", cfg["enabled"])
    cfg["channels"] = _read_list_env("GENUI_CHANNELS", cfg["channels"])
    cfg["allow_html"] = _read_bool_env("GENUI_ALLOW_HTML", cfg["allow_html"])
    cfg["allow_actions"] = _read_list_env("GENUI_ALLOW_ACTIONS", cfg["allow_actions"])

    return cfg


def get_allowed_actions(api: Any = None) -> list[str]:
    """Return the list of allowed GenUI actions for the current config."""
    return get_genui_config(api).get("allow_actions", list(_DEFAULT_ALLOWED_ACTIONS))


def _get_current_channel() -> str:
    """Determine the current request channel from agent context."""
    try:
        from qwenpaw.app.agent_context import get_current_channel
        ch = get_current_channel()
        if ch:
            return ch
    except Exception:
        pass
    # Default to console when channel detection is unavailable
    return "console"


def is_genui_enabled_for_context(config: dict[str, Any] | None = None, api: Any = None) -> bool:
    """Check if GenUI should be enabled for the current context.

    Returns True only when:
    - genui_enabled is True (feature flag)
    - current channel is in genui_channels (channel gate)

    Args:
        config: Pre-computed config dict (optional). If None, reads from api/defaults.
        api: PluginApi instance for reading plugin config (optional).
    """
    cfg = config or get_genui_config(api)
    if not cfg.get("enabled", False):
        return False
    channel = _get_current_channel()
    allowed_channels = cfg.get("channels", ["console", "web"])
    # Also check if the channel is in the capable set
    if channel not in _GENUI_CAPABLE_CHANNELS:
        logger.debug(
            "[ugsci.genui] Channel '%s' not GenUI-capable %s",
            channel,
            _GENUI_CAPABLE_CHANNELS,
        )
        return False
    if channel not in allowed_channels:
        logger.debug(
            "[ugsci.genui] Channel '%s' not in GenUI channels %s",
            channel,
            allowed_channels,
        )
        return False
    return True


# Backward-compatible aliases
_get_genui_config = get_genui_config
_is_genui_enabled_for_context = is_genui_enabled_for_context


# ─── Tool definitions ───────────────────────────────────────────────────────

_GENUI_TOOLS: list[tuple[str, Any, str, str, str, str]] = [
    ("emit_ui_tree", emit_ui_tree, "Emit a validated generative UI tree (cards, tables, charts) that renders inline in chat.", "🎨", "internal", ""),
    ("emit_ui_patch", emit_ui_patch, "Apply JSON Patch operations to an existing GenUI tree (update without re-sending full tree).", "📝", "internal", ""),
    ("list_ui_components", list_ui_components, "Return the GenUI component catalog (kinds + prop hints). Read-only.", "📋", "internal", ""),
    ("get_genui_guide", get_genui_guide_tool, "Return the GenUI guide: wire format, syntax, layout guidance. Read-only.", "📖", "internal", ""),
]


def _has_existing_emit_ui_tool(registry: Any) -> bool:
    """Check if emit_ui_tree is already registered by upstream/native capability."""
    if registry is None:
        return False
    try:
        wm = registry.get_workspace_manager()
        if wm is None:
            return False
        for ws in getattr(wm, "agents", {}).values():
            tr = getattr(getattr(ws, "plugins", None), "tool_registry", None)
            if tr is not None and "emit_ui_tree" in tr:
                return True
    except Exception:
        pass
    return False


def register_genui(api: Any, plugin_id: str = "ugsci") -> None:
    """Register GenUI tools and prompt section.

    Tools are ALWAYS registered so they appear in the Console Tools page
    for the user to discover and enable. The ``genui_enabled`` feature flag
    controls:
    - Whether tools are auto-enabled (True → enabled=True)
    - Whether the GenUI prompt section is injected (True → prompt registered)

    When ``genui_enabled=False`` (default), tools are registered but disabled.
    The user can manually enable them in the Tools page. However, without
    the prompt, the model won't know to proactively use GenUI — set
    ``GENUI_ENABLED=true`` for the full experience.
    """
    try:
        config = get_genui_config(api)
        genui_enabled = is_genui_enabled_for_context(config)

        if not genui_enabled:
            logger.info(
                "[%s.genui] GenUI feature disabled (enabled=%s, channel=%s) "
                "— tools registered but not auto-enabled",
                plugin_id,
                config.get("enabled"),
                _get_current_channel(),
            )

        # Tool conflict detection (REVIEW D13) — skip if upstream has it
        registry = getattr(api, "_registry", None)
        if _has_existing_emit_ui_tool(registry):
            logger.info("[%s.genui] emit_ui_tree already registered by upstream", plugin_id)
            if genui_enabled:
                _register_prompt(api, plugin_id)
            return

        # Always register tools so they appear in the Tools page.
        # When genui_enabled=True, auto-enable them; otherwise leave disabled.
        tool_enabled = genui_enabled
        registered = 0
        for name, func, desc, icon, tt, tp in _GENUI_TOOLS:
            try:
                api.register_tool(
                    tool_name=name,
                    tool_func=func,
                    description=desc,
                    icon=icon,
                    enabled=tool_enabled,
                    tool_type=tt,
                    target_param=tp,
                )
                registered += 1
            except Exception as exc:
                logger.error(
                    "[%s.genui] Failed to register '%s': %s",
                    plugin_id,
                    name,
                    exc,
                    exc_info=True,
                )

        if registered > 0:
            logger.info(
                "[%s.genui] Registered %d tool(s) (auto_enabled=%s, channel='%s', "
                "allow_actions=%s, allow_html=%s)",
                plugin_id,
                registered,
                tool_enabled,
                _get_current_channel(),
                config.get("allow_actions"),
                config.get("allow_html"),
            )
            # Only inject the prompt when GenUI is fully enabled
            if genui_enabled:
                _register_prompt(api, plugin_id)
        else:
            logger.error("[%s.genui] No tools registered", plugin_id)
    except Exception as exc:
        logger.error(
            "[%s.genui] Registration failed: %s",
            plugin_id,
            exc,
            exc_info=True,
        )


def _register_prompt(api: Any, plugin_id: str) -> None:
    """Register the GenUI prompt section."""
    try:
        api.register_prompt_section(
            name=f"{plugin_id}.genui_guide",
            after="workspace",
            provider=lambda agent: get_prompt_text(),
            priority=90,
        )
        logger.info("[%s.genui] Prompt section registered", plugin_id)
    except Exception as exc:
        logger.debug(
            "[%s.genui] Prompt registration failed: %s",
            plugin_id,
            exc,
            exc_info=True,
        )


def dispose_genui(plugin_id: str = "ugsci") -> None:
    """Clean up GenUI registrations when UGSci plugin is unloaded.

    This is called from UGSciPlugin's lifecycle hook to ensure GenUI
    tools and prompt sections are properly disposed.
    """
    logger.info("[%s.genui] Disposing GenUI registrations", plugin_id)
    # The actual disposal is handled by the plugin API's disposable mechanism;
    # this function serves as a hook for any additional cleanup.


__all__ = [
    "register_genui",
    "dispose_genui",
    "is_genui_enabled_for_context",
    "get_genui_config",
    "get_allowed_actions",
    # Backward-compatible aliases
    "_is_genui_enabled_for_context",
    "_get_genui_config",
]
