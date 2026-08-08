# -*- coding: utf-8 -*-
"""On-demand GenUI guide payload for the model.

Ported from LeAgent ``backend/leagent/tools/canvas/genui_guide.py`` (Apache-2.0).
Adapted: removed LeAgent-specific canvas_routing references; trimmed to
phase-1 component set and QwenPaw action allowlist.
"""

from typing import Any

_GUIDE_PAYLOAD: dict[str, Any] = {
    "purpose": (
        "Ship polished, scannable gen UI: clear hierarchy, calm spacing, "
        "consistent variants — not noisy emoji decoration or flat walls of text."
    ),
    "wire_format_and_syntax": [
        '**Envelope (schemaVersion 1):** Prefer `{"schemaVersion":"1","root":{...}}`. '
        "You may also emit a **bare root node** `{...}` — the server wraps it. "
        "Top-level keys outside `schemaVersion`/`root` are rejected.",
        "**Node shape:** Allowed top-level keys per node: `kind`, optional `props`, "
        "optional `children`, optional `nodeId`. Component fields must live under "
        "**`props`**. The server may **lift** catalog-documented prop keys if you "
        "accidentally placed them beside `kind`; any **other** stray key fails validation.",
        "**`kind`:** PascalCase string from the shipped enum only — call "
        "`list_ui_components` before authoring non-trivial trees. Legacy **`type`** "
        "is accepted once and coerced to **`kind`**.",
        "**`nodeId`:** Optional; omit or leave empty and the server assigns stable ids.",
        "**`props`:** All component configuration lives here (`title`, `value`, `chart`, "
        "`categories`, `series`, …). `children` holds **only** nested node objects.",
        "**Aliases normalized server-side:** Heading `value`|`text`|`title`; "
        "Text/ListItem/TableCell `value`|`text`|`content`|`label`; Markdown "
        "`content`|`text`|`value`; Image `src`|`url`|`imageUrl`; Badge "
        "`value`|`text`|`label`; Tag/Chip `label`|`text`|`value`; Alert-family "
        "`message`|`description`|`text`|`content`.",
        "**Tool args / result:** `emit_ui_tree({ \"tree\": <envelope or bare root> })` "
        "— args and tool result use the same top-level keys (never wrap in `payload`).",
        "**Strict JSON in tool arguments:** One JSON object per tool call — no markdown "
        "fences or commentary. Pass **`tree` as a nested JSON object** when possible.",
    ],
    "when_to_call": [
        "Do **not** open this guide just to polish a normal chat answer — onboarding, "
        "feature lists, and navigation tips belong in markdown.",
        "Dashboards, multi-card layouts, or any tree with more than ~6 nodes.",
        "Whenever the user cares about appearance (report, dashboard, card layout).",
    ],
    "layout_structure": [
        "Use **`Stack`** (vertical) or **`Grid`** for layout; set gap implicitly via "
        "child **`Card`/`Spacer`** — avoid deep nesting of more than 3–4 levels.",
        "One primary **focal point** per block: a single `Heading` (level 1–2) or hero "
        "`Image`, then supporting `Text`/`Stat`/`Table`.",
    ],
    "typography": [
        "Use **`Heading`** for section titles; use **`Text`** for body. Prefer `Text` "
        "`size` `sm` or `base` and `color` `muted` for secondary lines.",
        "For lists, use **`List`** + **`ListItem`**, not multiple `Text` nodes with "
        "manual bullet characters.",
        "Maximum **one** `Heading` level 1 per tree root unless building a long-form "
        "doc with clear sections.",
    ],
    "spacing_and_density": [
        "Prefer **`Card`** `padding` `md`. Align siblings: if one card uses `padding='md'`, "
        "nearby cards should match.",
        "Leave breathing room: group related items in one `Card` or `Stack` instead of "
        "many tiny borderless `Text` siblings.",
    ],
    "emoji_and_icons": [
        "Default to **`Icon`** for UI affordances: `props.name` kebab-case from lucide.dev.",
        "Do **not** decorate every heading, stat row, or list item with emoji.",
        "If you use emoji at all, **at most one** decorative emoji per card/section.",
    ],
    "color_and_semantics": [
        "Use **`Badge`** / **`Tag`** / **`Stat`** variants (`success`, `warning`, "
        "`error`, `info`) for meaning — do not encode state only with random emoji.",
        "Charts: pass clean `categories` and `series`; prefer **`Chart`** for standard plots.",
    ],
    "actions": [
        "Phase-1 only allows `send_message`: set `props.action` to "
        '`{type: "send_message", payload: {content: "请总结这张表"}}`.',
        "Future phases will open `open_url`, `navigate`, `open_file`, etc.",
    ],
    "anti_patterns": [
        "Invalid `kind` strings (snake_case, lowercase, or invented component names).",
        "Random keys on a node (e.g. `title` beside `kind` without being in props).",
        "Emoji prefix on every line or heading.",
        "Flat sequence of 10+ peer nodes with no `Card`/`Stack`/`Grid` grouping.",
        "Using `Markdown` as a dump for unstructured prose when `List`, `Table`, or "
        "`Card` would scan better.",
    ],
}


def get_genui_guide() -> dict[str, Any]:
    """Return the GenUI guide payload (shared dict; do not mutate)."""
    return _GUIDE_PAYLOAD


__all__ = ["get_genui_guide"]
