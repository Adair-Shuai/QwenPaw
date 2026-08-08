# -*- coding: utf-8 -*-
"""GenUI tool functions for the UGSci plugin.

Three tools are exposed to the model:
- ``emit_ui_tree``  — validate and emit a declarative UI tree.
- ``list_ui_components`` — return the component catalog.
- ``get_genui_guide`` — return layout and visual design guidance.

All tools are internal, read-only, and return JSON text as standard
ToolChunk results — no custom SSE events.

IMPORTANT: This module must NOT use ``from __future__ import annotations``
because AgentScope's FunctionTool resolves type annotations at runtime
via pydantic ``create_model``; stringified forward references fail.

The ``tree`` parameter uses ``str`` type so AgentScope generates a clean
``{"type": "string"}`` schema. The function body accepts both a JSON
string and (defensively) a pre-parsed dict, applying the full JSON repair
pipeline for malformed LLM output.
"""

import json
import logging
from typing import Any

from agentscope.message import TextBlock, ToolResultState
from agentscope.tool import ToolChunk

from .guide import get_genui_guide
from .json_repair import try_parse_json_object
from .schema import (
    GENUI_MAX_JSON_CHARS,
    list_component_catalog,
    validate_ui_tree,
)
from .state import get_state_store

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.genui")


def _make_tool_result(
    payload: dict[str, Any],
    *,
    ok: bool,
) -> list:
    """Build a standard ToolChunk result with a TextBlock JSON payload."""
    return [
        ToolChunk(
            type="text",
            content=[
                TextBlock(
                    type="text",
                    text=json.dumps(payload, ensure_ascii=False),
                ),
            ],
            result_state=ToolResultState.SUCCESS if ok else ToolResultState.FAILURE,
        ),
    ]


def _make_error_result(
    error_code: str,
    message: str,
    hint: str = "",
) -> list:
    """Build an error ToolChunk result."""
    payload: dict[str, Any] = {
        "ok": False,
        "kind": "genui_error",
        "error_code": error_code,
        "message": message,
    }
    if hint:
        payload["hint"] = hint
    return _make_tool_result(payload, ok=False)


def emit_ui_tree(
    tree: str,
    session_id: str = "",
    ui_id: str = "",
) -> list:
    """Emit a validated generative UI tree that renders inline in the chat.

    Use this tool for cards, dashboards, tables, KPIs, charts, and other
    component-based layouts when the user wants visual UI instead of plain
    markdown. Do NOT use it for simple Q&A, onboarding, or navigation —
    those belong in markdown.

    The ``tree`` parameter is a JSON string of the UI tree. Acceptable
    formats:
    - Full envelope: ``{"schemaVersion":"1","root":{"kind":"Stack","props":{},"children":[]}}``
    - Bare root: ``{"kind":"Stack","props":{},"children":[]}``
    - The server normalizes and validates the tree automatically.

    Every node has exactly ``{kind, props, children, nodeId}``:
    - ``kind``: PascalCase component name (call list_ui_components first).
    - ``props``: all component configuration (title, value, chart, etc.).
    - ``children``: nested node objects only (never raw strings).
    - ``nodeId``: optional; the server fills it when missing.

    Call ``get_genui_guide`` and ``list_ui_components`` before authoring
    non-trivial trees (dashboards, multi-card layouts, 6+ nodes).

    Args:
        tree: JSON string of the generative UI tree. Must be valid JSON
              or a repairable JSON-like string (code fences, trailing
              commas, and truncation are handled).
        session_id: Current session ID (auto-injected by the runtime
                    when available). Do not set manually.
        ui_id: Optional existing ui_id to update. Leave empty for a new
               tree. Phase-1 always creates a new ui_id.

    Returns:
        JSON text with ``{ok, kind, ui_id, revision, tree}`` on success,
        or ``{ok:false, kind:"genui_error", error_code, message}`` on failure.
    """
    # ── Size guard ─────────────────────────────────────────────────────
    if isinstance(tree, str) and len(tree) > GENUI_MAX_JSON_CHARS:
        return _make_error_result(
            "payload_too_large",
            f"tree JSON exceeds {GENUI_MAX_JSON_CHARS} characters",
            "Reduce the tree size or split into multiple emit_ui_tree calls.",
        )

    # ── Parse tree ─────────────────────────────────────────────────────
    parsed_tree: dict[str, Any] | None = None

    # Defensive: some models may pass a dict directly despite str type hint.
    if isinstance(tree, dict):
        parsed_tree = tree
    elif isinstance(tree, str):
        raw = tree.strip()
        if not raw:
            return _make_error_result(
                "empty_tree",
                "tree parameter is empty",
                "Provide a JSON string of the UI tree.",
            )
        # Try direct JSON parse first.
        try:
            parsed_tree = json.loads(raw)
        except json.JSONDecodeError:
            pass
        # Fall back to full repair pipeline.
        if not isinstance(parsed_tree, dict):
            parsed_tree = try_parse_json_object(raw)
    else:
        return _make_error_result(
            "invalid_type",
            f"tree must be a JSON string, got {type(tree).__name__}",
            "Pass tree as a JSON string.",
        )

    if not isinstance(parsed_tree, dict):
        return _make_error_result(
            "parse_failed",
            "Failed to parse tree as a JSON object. The JSON may be "
            "malformed, truncated, or have unescaped characters.",
            "Check JSON escaping: use \\\" for quotes and \\n for newlines "
            "inside string values. Call get_genui_guide for syntax help.",
        )

    # ── Validate and normalize ──────────────────────────────────────────
    try:
        normalized = validate_ui_tree(parsed_tree)
    except Exception as exc:
        return _make_error_result(
            "invalid_tree",
            str(exc),
            "Call list_ui_components to verify kind/prop names, "
            "then retry with corrected JSON.",
        )

    # ── Create state snapshot ───────────────────────────────────────────
    store = get_state_store()
    snapshot = store.create(
        session_id=session_id or "unknown",
        tree=normalized,
    )

    # ── Build success result ────────────────────────────────────────────
    result: dict[str, Any] = {
        "ok": True,
        "kind": "genui",
        "schema_version": "1",
        "ui_id": snapshot.ui_id,
        "revision": snapshot.revision,
        "tree": normalized,
    }
    logger.info(
        "[ugsci.genui] emit_ui_tree success: ui_id=%s, session=%s",
        snapshot.ui_id,
        session_id,
    )
    return _make_tool_result(result, ok=True)


def list_ui_components() -> list:
    """Return the GenUI component catalog (kinds + prop hints).

    Call this BEFORE authoring any non-trivial emit_ui_tree payload to
    verify every kind and prop name you plan to use. Read-only, no side
    effects.

    Returns:
        JSON text with the component catalog: ``{node_shape, rules, components}``.
    """
    payload: dict[str, Any] = {
        "node_shape": '{"kind": "...", "props": { ... }, "children": [ ... ]}',
        "rules": [
            "Every component prop goes inside `props`.",
            "`children` is only for nested nodes, never strings or props.",
            "Use `nodeId` only if you want a stable id; otherwise omit "
            "(server fills).",
        ],
        "components": list_component_catalog(),
    }
    return _make_tool_result(payload, ok=True)


def get_genui_guide_tool() -> list:
    """Return the GenUI guide: wire format, syntax, layout, and visual design.

    Call before non-trivial emit_ui_tree (dashboards, multi-card UIs, 6+ nodes).
    After this guide, call list_ui_components for exact kind/prop names.
    Read-only, no side effects.

    Returns:
        JSON text with the guide payload (wire_format_and_syntax, layout,
        typography, actions, anti_patterns, etc.).
    """
    payload = get_genui_guide()
    return _make_tool_result(payload, ok=True)


# ── Names for registration ────────────────────────────────────────────────
# These must match the function __name__ for the tool registration system.
emit_ui_tree.__name__ = "emit_ui_tree"
list_ui_components.__name__ = "list_ui_components"
get_genui_guide_tool.__name__ = "get_genui_guide"


__all__ = [
    "emit_ui_tree",
    "list_ui_components",
    "get_genui_guide_tool",
]
