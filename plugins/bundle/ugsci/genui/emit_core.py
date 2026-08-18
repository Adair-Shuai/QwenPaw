# -*- coding: utf-8 -*-
"""Shared validate-and-store path for GenUI trees.

Used by ``emit_ui_tree`` and by domain-tool adapters so every dashboard
goes through the same schema, action allowlist, and snapshot store.
"""

from __future__ import annotations

from typing import Any

from .schema import validate_ui_tree
from .settings import load_settings
from .state import get_state_store


def get_session_id() -> str:
    try:
        from qwenpaw.app.agent_context import get_current_session_id

        sid = get_current_session_id()
        if sid:
            return str(sid)
    except Exception:
        pass
    return ""


def get_tool_call_id() -> str:
    try:
        from qwenpaw.tool_calls._ctxvars import get_call_context

        ctx = get_call_context()
        if ctx and ctx.tool_call_id:
            return str(ctx.tool_call_id)
    except Exception:
        pass
    return ""


def resolve_allow_actions() -> list[str]:
    """Allowed action types plus the form-submit alias."""
    actions = ["send_message", "submit_form"]
    try:
        from .registration import get_allowed_actions

        for name in get_allowed_actions():
            if name and name not in actions:
                actions.append(str(name))
    except Exception:
        pass
    return actions


def resolve_allow_file_input() -> bool:
    try:
        from .registration import get_genui_config

        return bool(get_genui_config().get("allow_html", False))
    except Exception:
        return False


def store_validated_tree(
    tree: dict[str, Any],
    *,
    ui_id: str = "",
    allow_actions: list[str] | None = None,
    allow_file_input: bool | None = None,
) -> dict[str, Any]:
    """Validate ``tree``, persist it, and return the standard GenUI envelope."""
    if not load_settings().get("enabled", True):
        raise RuntimeError("feature_disabled")
    session_id = get_session_id()
    if not session_id:
        raise RuntimeError("missing_session_context")
    normalized = validate_ui_tree(
        tree,
        allow_actions=allow_actions if allow_actions is not None else resolve_allow_actions(),
        allow_file_input=resolve_allow_file_input() if allow_file_input is None else allow_file_input,
    )
    snapshot = get_state_store().create(
        session_id=session_id,
        tree=normalized,
        tool_call_id=get_tool_call_id(),
        ui_id=ui_id or None,
    )
    return {
        "ok": True,
        "kind": "genui",
        "schema_version": "1",
        "ui_id": snapshot.ui_id,
        "revision": snapshot.revision,
        "tree": normalized,
        "tool_call_id": snapshot.tool_call_id or "",
    }


__all__ = [
    "get_session_id",
    "get_tool_call_id",
    "resolve_allow_actions",
    "resolve_allow_file_input",
    "store_validated_tree",
]
