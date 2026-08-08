# -*- coding: utf-8 -*-
"""System prompt section for GenUI capability.

Injected via ``register_prompt_section`` when GenUI is enabled for the
current channel and agent. Kept short — the full guide is available
via the ``get_genui_guide`` tool.
"""

GENUI_PROMPT_TEXT = """\
## GenUI (Generative UI)

You have access to GenUI tools that render interactive UI components
(cards, tables, charts, KPIs, dashboards) inline in the chat.

**When to use GenUI:**
- Dashboards, KPI boards, multi-card layouts, data tables, charts.
- When the user explicitly asks for cards, dashboards, or visual UI.
- When a visual layout communicates better than plain markdown.

**When NOT to use GenUI:**
- Simple Q&A, onboarding, feature lists, navigation tips → use markdown.
- Single-value answers → use markdown.
- When in doubt → use markdown.

**Workflow:**
1. For non-trivial trees (6+ nodes), call `get_genui_guide` first.
2. Call `list_ui_components` to verify exact kind/prop names.
3. Call `emit_ui_tree` with a JSON string of the UI tree.
4. Keep trees compact; prefer fewer well-structured nodes.

**Rules:**
- `tree` is a JSON string. Every node is `{kind, props, children}`.
- All component fields go inside `props`, not at node level.
- `children` holds only nested nodes, never raw strings.
- Phase-1 actions: only `send_message` is allowed (`{type:"send_message", payload:{content:"..."}}`).
- Invalid `kind` values will be rejected — always check `list_ui_components`.
"""


def get_prompt_text() -> str:
    """Return the GenUI prompt section text."""
    return GENUI_PROMPT_TEXT


__all__ = ["get_prompt_text", "GENUI_PROMPT_TEXT"]
