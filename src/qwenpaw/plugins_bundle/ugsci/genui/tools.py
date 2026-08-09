# -*- coding: utf-8 -*-
"""GenUI tool functions for the UGSci plugin.

Four tools exposed to the model:
- emit_ui_tree  — validate and emit a declarative UI tree.
- emit_ui_patch — apply patches to an existing UI tree (phase-2).
- list_ui_components — return the component catalog.
- get_genui_guide — return layout and visual design guidance.

IMPORTANT: This module must NOT use ``from __future__ import annotations``
because AgentScope's FunctionTool resolves type annotations at runtime.

The ``tree`` and ``patches`` parameters are object-first while retaining
string compatibility for older models and saved conversations.

Tools return a single ``ToolChunk`` (not a list), matching the existing
UGSci tool convention (see engine/tools/launcher.py etc.).
"""

import json
import logging
from typing import Any

from agentscope.message import TextBlock, ToolResultState
from agentscope.tool import ToolChunk

from .guide import get_genui_guide
from .json_repair import try_parse_json_object
from .schema import GENUI_MAX_JSON_CHARS, list_component_catalog, validate_ui_tree, validate_ui_patch, apply_ui_patches
from .state import get_state_store
from .settings import load_settings

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.genui")


def _result(text: str, *, ok: bool) -> ToolChunk:
    """Build a standard ToolChunk result with a TextBlock."""
    return ToolChunk(
        is_last=True,
        state=ToolResultState.SUCCESS if ok else ToolResultState.ERROR,
        content=[TextBlock(type="text", text=text)],
    )


def _ok(payload: dict[str, Any]) -> ToolChunk:
    return _result(json.dumps(payload, ensure_ascii=False), ok=True)


def _err(error_code: str, message: str, hint: str = "") -> ToolChunk:
    payload: dict[str, Any] = {"ok": False, "kind": "genui_error", "error_code": error_code, "message": message}
    if hint: payload["hint"] = hint
    return _result(json.dumps(payload, ensure_ascii=False), ok=False)


def _get_session_id() -> str:
    session_id = ""
    try:
        from qwenpaw.app.agent_context import get_current_session_id
        sid = get_current_session_id()
        if sid: session_id = sid
    except Exception:
        pass
    return session_id


def _get_tool_call_id() -> str:
    """Get the current tool_call_id from the ToolCallContext contextvar."""
    try:
        from qwenpaw.tool_calls._ctxvars import get_call_context
        ctx = get_call_context()
        if ctx and ctx.tool_call_id:
            return ctx.tool_call_id
    except Exception:
        pass
    return ""


def _parse_tree_param(tree: Any) -> dict[str, Any] | None:
    """Parse the tree parameter, handling JSON strings, dicts, and repair."""
    if isinstance(tree, dict):
        return tree
    if isinstance(tree, str):
        raw = tree.strip()
        if not raw:
            return None
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return try_parse_json_object(raw)
    return None


def _payload_size(value: Any) -> int:
    """Return the canonical JSON character size for object/string inputs."""
    if isinstance(value, str):
        return len(value)
    try:
        return len(json.dumps(value, ensure_ascii=False, separators=(",", ":")))
    except (TypeError, ValueError):
        return GENUI_MAX_JSON_CHARS + 1


def emit_ui_tree(tree: dict[str, Any] | str) -> ToolChunk:
    """Emit a validated generative UI tree that renders inline in the chat.

    Use this tool for cards, dashboards, tables, KPIs, charts, and other
    component-based layouts when the user wants visual UI instead of plain
    markdown. Do NOT use it for simple Q&A or navigation.

    The ``tree`` parameter is a JSON string of the UI tree. Acceptable
    formats:
    - Full envelope: ``{"schemaVersion":"1","root":{"kind":"Stack","props":{},"children":[]}}``
    - Bare root: ``{"kind":"Stack","props":{},"children":[]}``

    Every node has exactly ``{kind, props, children, nodeId}``:
    - ``kind``: PascalCase component name (call list_ui_components first).
    - ``props``: all component configuration (title, value, chart, etc.).
    - ``children``: nested node objects only (never raw strings).

    Call ``get_genui_guide`` and ``list_ui_components`` before authoring
    non-trivial trees (dashboards, multi-card layouts, 6+ nodes).

    Args:
        tree: JSON string of the generative UI tree. Must be valid JSON
              or a repairable JSON-like string (code fences, trailing
              commas, and truncation are handled).

    Returns:
        ToolChunk with JSON text: ``{ok, kind, ui_id, revision, tree}``
        on success, or ``{ok:false, kind:"genui_error", error_code, message}``
        on failure.
    """
    if not load_settings().get("enabled", True):
        return _err("feature_disabled", "GenUI is disabled in UGSci settings.")
    if _payload_size(tree) > GENUI_MAX_JSON_CHARS:
        return _err("payload_too_large", f"tree JSON exceeds {GENUI_MAX_JSON_CHARS} chars")

    if not isinstance(tree, (str, dict)):
        return _err("invalid_type", f"tree must be a JSON string, got {type(tree).__name__}")

    if isinstance(tree, str) and not tree.strip():
        return _err("empty_tree", "tree parameter is empty", "Provide a JSON UI tree object.")

    parsed_tree = _parse_tree_param(tree)

    if not isinstance(parsed_tree, dict):
        return _err(
            "parse_failed",
            "Failed to parse tree as a JSON object.",
            "Check JSON escaping: use \\\" for quotes and \\n for newlines.",
        )

    try:
        normalized = validate_ui_tree(parsed_tree)
    except Exception as exc:
        return _err("invalid_tree", str(exc), "Call list_ui_components to verify kind/prop names.")

    session_id = _get_session_id()
    if not session_id:
        return _err("missing_session_context", "GenUI requires an active session context.")
    tool_call_id = _get_tool_call_id()
    store = get_state_store()
    snapshot = store.create(session_id=session_id, tree=normalized, tool_call_id=tool_call_id)

    result: dict[str, Any] = {
        "ok": True,
        "kind": "genui",
        "schema_version": "1",
        "ui_id": snapshot.ui_id,
        "revision": snapshot.revision,
        "tree": normalized,
        "tool_call_id": snapshot.tool_call_id or "",
    }
    logger.info("[ugsci.genui] emit_ui_tree: ui_id=%s, session=%s", snapshot.ui_id, session_id)
    return _ok(result)


def emit_ui_patch(patches: dict[str, Any] | str) -> ToolChunk:
    """Apply JSON Patch operations to an existing GenUI tree.

    Use this to update a previously emitted UI tree without re-sending the
    entire tree. Patches follow a subset of RFC 6902 (replace, add, remove).

    The ``patches`` parameter is a JSON string:
    ``{"ui_id":"ui_xxx","base_revision":1,"patches":[{"op":"replace","path":"/root/children/0/props/text","value":"Updated"}]}``

    Rules:
    - ``ui_id`` must be a tree previously emitted in this session.
    - ``base_revision`` must match the current revision of the tree.
    - ``path`` must start with ``/root`` and cannot modify
      ``schemaVersion``, ``root/nodeId``, or ``root/kind``.
    - After patching, the tree is re-validated; invalid trees are rejected.

    Args:
        patches: JSON string with ``ui_id``, ``base_revision``, and
                 ``patches`` array.

    Returns:
        ToolChunk with JSON: ``{ok, kind:"genui_patch", ui_id,
        base_revision, revision, patches, tree}`` on success,
        or ``{ok:false, kind:"genui_error", ...}`` on failure.
    """
    if not load_settings().get("enabled", True):
        return _err("feature_disabled", "GenUI is disabled in UGSci settings.")
    if _payload_size(patches) > GENUI_MAX_JSON_CHARS:
        return _err("payload_too_large", f"patches JSON exceeds {GENUI_MAX_JSON_CHARS} chars")

    # Parse patches parameter
    parsed: Any = None
    if isinstance(patches, dict):
        parsed = patches
    elif isinstance(patches, str):
        raw = patches.strip()
        if not raw:
            return _err("empty_patches", "patches parameter is empty")
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            parsed = try_parse_json_object(raw)
    else:
        return _err("invalid_type", f"patches must be a JSON string, got {type(patches).__name__}")

    if not isinstance(parsed, dict):
        return _err("parse_failed", "Failed to parse patches as a JSON object.")

    # Validate patch structure
    try:
        validated_patch = validate_ui_patch(parsed)
    except Exception as exc:
        return _err("invalid_patch", str(exc), "Check patch format: {ui_id, base_revision, patches:[{op,path,value?}]}")

    ui_id = validated_patch["ui_id"]
    base_revision = validated_patch["base_revision"]
    patch_list = validated_patch["patches"]

    session_id = _get_session_id()
    if not session_id:
        return _err("missing_session_context", "GenUI patching requires an active session context.")
    store = get_state_store()

    try:
        snapshot = store.apply_patch(
            session_id=session_id,
            ui_id=ui_id,
            base_revision=base_revision,
            patches=patch_list,
        )
    except ValueError as exc:
        msg = str(exc)
        if "revision conflict" in msg:
            return _err("revision_conflict", msg, "Call emit_ui_tree to get the latest revision, then retry.")
        elif "not found" in msg:
            return _err("ui_id_not_found", msg, "The ui_id does not exist in this session.")
        else:
            return _err("patch_failed", msg, "The patch could not be applied to the tree.")

    result: dict[str, Any] = {
        "ok": True,
        "kind": "genui_patch",
        "ui_id": snapshot.ui_id,
        "base_revision": base_revision,
        "revision": snapshot.revision,
        "patches": patch_list,
        "tree": snapshot.tree,
        "tool_call_id": snapshot.tool_call_id or "",
    }
    logger.info("[ugsci.genui] emit_ui_patch: ui_id=%s, revision=%d->%d", snapshot.ui_id, base_revision, snapshot.revision)
    return _ok(result)


def list_ui_components() -> ToolChunk:
    """Return the GenUI component catalog (kinds + prop hints).

    Call this BEFORE authoring any non-trivial emit_ui_tree payload.
    Read-only, no side effects.

    Returns:
        ToolChunk with JSON: ``{node_shape, rules, components}``.
    """
    return _ok({
        "node_shape": '{"kind": "...", "props": { ... }, "children": [ ... ]}',
        "rules": [
            "Every component prop goes inside `props`.",
            "`children` is only for nested nodes, never strings.",
            "Use `nodeId` only if you want a stable id; otherwise omit.",
        ],
        "components": list_component_catalog(),
    })


def get_genui_guide_tool() -> ToolChunk:
    """Return the GenUI guide: wire format, syntax, layout, and visual design.

    Call before non-trivial emit_ui_tree (dashboards, multi-card UIs, 6+ nodes).
    Read-only, no side effects.

    Returns:
        ToolChunk with JSON containing the guide payload.
    """
    return _ok(get_genui_guide())


emit_ui_tree.__name__ = "emit_ui_tree"
emit_ui_patch.__name__ = "emit_ui_patch"
list_ui_components.__name__ = "list_ui_components"
get_genui_guide_tool.__name__ = "get_genui_guide"

__all__ = ["emit_ui_tree", "emit_ui_patch", "list_ui_components", "get_genui_guide_tool"]
