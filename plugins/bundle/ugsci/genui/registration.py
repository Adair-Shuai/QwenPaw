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

import functools
import inspect
import logging
import os
import threading
from pathlib import Path
from typing import Any

from ..tool_manifest import (
    sync_manifest_tools_to_all_agents,
    validate_tool_bindings,
)
from .tools import (
    emit_ui_tree,
    emit_ui_patch,
    list_ui_components,
    get_genui_guide_tool,
    genui_unavailable,
)
from .prompt import get_prompt_text
from .settings import load_settings

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

    # The plugin-owned switch is global and defaults to enabled.  Environment
    # variables remain the highest-precedence operational override.
    cfg["enabled"] = _coerce_bool(load_settings().get("enabled"), cfg["enabled"])

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
    # Channel-gated capabilities must fail closed outside a request.
    return ""


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

_PLUGIN_DIR = Path(__file__).resolve().parents[1]
_GENUI_TOOL_BINDINGS: dict[str, Any] = {
    "emit_ui_tree": emit_ui_tree,
    "emit_ui_patch": emit_ui_patch,
    "list_ui_components": list_ui_components,
    "get_genui_guide": get_genui_guide_tool,
}

_active_lock = threading.Lock()
_active: dict[str, dict[str, Any]] = {}


def _remember_registration(plugin_id: str, **fields: Any) -> None:
    with _active_lock:
        current = _active.get(plugin_id, {})
        current.update(fields)
        _active[plugin_id] = current


def _on_session_deleted(session_id: str) -> None:
    from .state import get_state_store

    get_state_store().clear_session(session_id)


def _bind_session_cleanup(plugin_id: str) -> None:
    """Hook chat-session deletion so SQLite snapshots do not outlive the chat."""
    rec = None
    with _active_lock:
        rec = _active.get(plugin_id)
    previous = rec.get("session_deleted_unreg") if rec else None
    if callable(previous):
        try:
            previous()
        except Exception:
            logger.debug(
                "[%s.genui] Failed to replace session-deleted listener",
                plugin_id,
                exc_info=True,
            )
    try:
        from qwenpaw.app.chats.session_events import register_session_deleted
    except Exception:
        logger.debug(
            "[%s.genui] session_events unavailable; skip snapshot cleanup hook",
            plugin_id,
            exc_info=True,
        )
        return
    unreg = register_session_deleted(_on_session_deleted)
    _remember_registration(plugin_id, session_deleted_unreg=unreg)


def _take_registration(plugin_id: str) -> dict[str, Any] | None:
    with _active_lock:
        return _active.pop(plugin_id, None)


def _remove_prompt_section(registry: Any, name: str | None) -> None:
    """Drop a named prompt section without waiting for full plugin unload."""
    if registry is None or not name:
        return
    sections = getattr(registry, "_prompt_sections", None)
    names = getattr(registry, "_prompt_section_names", None)
    if isinstance(sections, list):
        sections[:] = [
            section for section in sections if getattr(section, "name", None) != name
        ]
    if isinstance(names, set):
        names.discard(name)


def _request_gated_tool(func: Any, api: Any) -> Any:
    """Wrap a GenUI tool with a request-time feature/channel gate.

    ``PluginApi.register_tool`` intentionally has a small, stable signature
    upstream.  Keep dynamic gating in the callable instead of relying on
    local-only registration kwargs such as ``availability_check``.
    ``__signature__`` preserves AgentScope's argument discovery.
    """
    if inspect.iscoroutinefunction(func):

        @functools.wraps(func)
        async def _async_gated(*args: Any, **kwargs: Any) -> Any:
            if not is_genui_enabled_for_context(api=api):
                return genui_unavailable()
            return await func(*args, **kwargs)

        _async_gated.__signature__ = inspect.signature(func)
        return _async_gated

    @functools.wraps(func)
    def _gated(*args: Any, **kwargs: Any) -> Any:
        if not is_genui_enabled_for_context(api=api):
            return genui_unavailable()
        return func(*args, **kwargs)

    _gated.__signature__ = inspect.signature(func)
    return _gated


def _existing_genui_tool_names(registry: Any) -> set[str]:
    """Return GenUI tool names already registered by upstream/native code."""
    found: set[str] = set()
    if registry is None:
        return found
    try:
        wm = registry.get_workspace_manager()
        if wm is None:
            return found
        known = set(_GENUI_TOOL_BINDINGS)
        for ws in getattr(wm, "agents", {}).values():
            tr = getattr(getattr(ws, "plugins", None), "tool_registry", None)
            if tr is None:
                continue
            for name in known:
                if name in tr:
                    found.add(name)
    except Exception:
        pass
    return found


def _has_existing_emit_ui_tool(registry: Any) -> bool:
    """Backward-compatible probe used by older tests."""
    return "emit_ui_tree" in _existing_genui_tool_names(registry)


def register_genui(api: Any, plugin_id: str = "ugsci") -> None:
    """Register GenUI tools and prompt section.

    Tools are always registered and default-enabled so they remain discoverable
    and an off -> on transition works without restarting. ``genui_enabled`` is
    enforced by a request-time wrapper and independently controls prompt
    injection. Per-Agent tool preferences remain explicit overrides.

    Set ``GENUI_ENABLED=false`` to hide GenUI tools from model requests and
    exclude the prompt contents while keeping stable registrations visible in
    the Console.
    """
    _bind_session_cleanup(plugin_id)
    try:
        config = get_genui_config(api)
        genui_enabled = bool(config.get("enabled", False))

        if not genui_enabled:
            logger.info(
                "[%s.genui] GenUI feature disabled (enabled=%s, channel=%s) "
                "— tools registered but request-gated",
                plugin_id,
                config.get("enabled"),
                _get_current_channel(),
            )

        # Tool conflict detection (REVIEW D13) — skip only the names
        # already owned by upstream so list/guide/patch can still register.
        registry = getattr(api, "_registry", None)
        existing_names = _existing_genui_tool_names(registry)
        if existing_names:
            logger.info(
                "[%s.genui] upstream already owns %s — skipping those names",
                plugin_id,
                sorted(existing_names),
            )

        specs = validate_tool_bindings(
            _PLUGIN_DIR,
            _GENUI_TOOL_BINDINGS,
            groups={"genui"},
        )

        registered_tools: list[tuple[str, Any]] = []
        for spec in specs:
            if spec.name in existing_names:
                continue
            try:
                gated = _request_gated_tool(
                    _GENUI_TOOL_BINDINGS[spec.name],
                    api,
                )
                api.register_tool(
                    tool_name=spec.name,
                    tool_func=gated,
                    description=spec.description,
                    icon=spec.icon,
                    enabled=spec.enabled_by_default,
                    tool_type=spec.tool_type,
                    target_param=spec.target_param,
                )
                registered_tools.append((spec.name, gated))
            except Exception as exc:
                logger.error(
                    "[%s.genui] Failed to register '%s': %s",
                    plugin_id,
                    spec.name,
                    exc,
                    exc_info=True,
                )

        if registered_tools:
            logger.info(
                "[%s.genui] Registered %d tool(s) (descriptor_enabled=%s, global_enabled=%s, channel='%s', "
                "allow_actions=%s, allow_html=%s)",
                plugin_id,
                len(registered_tools),
                all(spec.enabled_by_default for spec in specs),
                genui_enabled,
                _get_current_channel(),
                config.get("allow_actions"),
                config.get("allow_html"),
            )
        elif existing_names:
            logger.info("[%s.genui] All GenUI tools owned upstream; prompt still registered", plugin_id)
        else:
            logger.error("[%s.genui] No tools registered", plugin_id)
            return
        _register_prompt(api, plugin_id, config)
        _remember_registration(
            plugin_id,
            api=api,
            tools=registered_tools,
            prompt_name=f"{plugin_id}.genui_guide",
        )
    except Exception as exc:
        logger.error(
            "[%s.genui] Registration failed: %s",
            plugin_id,
            exc,
            exc_info=True,
        )


def _register_prompt(api: Any, plugin_id: str, config: dict[str, Any]) -> None:
    """Register the GenUI prompt section."""
    try:
        api.register_prompt_section(
            name=f"{plugin_id}.genui_guide",
            after="workspace",
            provider=lambda agent: get_prompt_text(),
            priority=90,
            # Resolve the persisted switch at request time so toggling does
            # not require a backend restart.
            condition=lambda agent: is_genui_enabled_for_context(api=api),
        )
        logger.info("[%s.genui] Prompt section registered", plugin_id)
    except Exception as exc:
        logger.debug(
            "[%s.genui] Prompt registration failed: %s",
            plugin_id,
            exc,
            exc_info=True,
        )


def _sync_all_agent_tool_configs() -> None:
    """Compatibility wrapper using the shared manifest synchronization."""
    try:
        changed_agents = sync_manifest_tools_to_all_agents(
            _PLUGIN_DIR,
            groups={"genui"},
        )
        logger.info(
            "[ugsci.genui] Synced GenUI defaults to %d agent(s)",
            changed_agents,
        )
    except Exception:
        logger.exception("[ugsci.genui] Failed to sync GenUI defaults to agents")


def dispose_genui(plugin_id: str = "ugsci") -> None:
    """Clean up GenUI registrations when UGSci plugin is unloaded.

    Unbridges request-gated tools, drops the prompt section, and closes the
    process-local snapshot store. Safe to call more than once.
    """
    logger.info("[%s.genui] Disposing GenUI registrations", plugin_id)
    rec = _take_registration(plugin_id)
    if rec:
        unreg = rec.get("session_deleted_unreg")
        if callable(unreg):
            try:
                unreg()
            except Exception:
                logger.debug(
                    "[%s.genui] Failed to drop session-deleted listener",
                    plugin_id,
                    exc_info=True,
                )
        api = rec.get("api")
        registry = getattr(api, "_registry", None) if api is not None else None
        try:
            from qwenpaw.plugins.api import _unbridge_from_runtime
        except Exception:  # pragma: no cover - import guard
            _unbridge_from_runtime = None
        if _unbridge_from_runtime is not None:
            for name, func in rec.get("tools") or []:
                try:
                    _unbridge_from_runtime(name, func, registry)
                except Exception:
                    logger.debug(
                        "[%s.genui] Failed to unbridge '%s'",
                        plugin_id,
                        name,
                        exc_info=True,
                    )
        try:
            _remove_prompt_section(registry, rec.get("prompt_name"))
        except Exception:
            logger.debug(
                "[%s.genui] Failed to remove prompt section",
                plugin_id,
                exc_info=True,
            )
    from .state import dispose_state_store
    dispose_state_store()


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
