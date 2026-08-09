# -*- coding: utf-8 -*-
"""On-demand GenUI guide payload for the model."""
from typing import Any

_GUIDE_PAYLOAD: dict[str, Any] = {
    "purpose": "Ship polished, scannable gen UI: clear hierarchy, calm spacing, consistent variants.",
    "wire_format_and_syntax": [
        'Envelope: {"schemaVersion":"1","root":{...}} or bare root {kind,props,children}.',
        "Node shape: {kind, props, children, nodeId}. All component fields inside props.",
        "kind: PascalCase from list_ui_components. Legacy type is coerced to kind.",
        "nodeId: optional; server fills when missing.",
        "Aliases: Heading value|text|title; Text value|text|content; Image src|url|imageUrl.",
        "Tool args: emit_ui_tree({tree: <JSON object>}) — strict JSON, no markdown fences.",
    ],
    "patch_format": {
        "description": "Use emit_ui_patch to update an existing tree without re-sending it.",
        "structure": '{"ui_id":"ui_xxx","base_revision":1,"patches":[{"op":"replace","path":"/root/children/0/props/text","value":"Updated"}]}',
        "ops": ["replace", "add", "remove"],
        "rules": [
            "path must start with /root",
            "Cannot modify schemaVersion, root/nodeId, or root/kind",
            "base_revision must match the current revision of the tree",
            "After patching, the tree is re-validated",
        ],
    },
    "when_to_call": ["Dashboards, multi-card layouts, 6+ nodes.", "When user wants visual UI."],
    "layout_structure": [
        "Use Stack/Grid for layout. One focal point per block. Avoid 3+ nesting levels.",
        "Use Tabs/Accordion for organizing dense content into collapsible sections.",
        "Use KpiBoard with MetricCard children for dashboard layouts.",
        "Use ImageGallery with Image children for multi-image displays.",
    ],
    "typography": ["Heading for titles, Text for body. One H1 per tree. Use List+ListItem for lists."],
    "actions": [
        'Button: {type:"send_message", payload:{content:"..."}}',
        'Form: {type:"submit_form"} or send_message content with {{fieldName}} placeholders; give each field a name',
    ],
    "anti_patterns": ["Invalid kind strings. Random keys on nodes. Emoji on every line. Flat 10+ peer nodes."],
}

def get_genui_guide() -> dict[str, Any]:
    return _GUIDE_PAYLOAD

__all__ = ["get_genui_guide"]
