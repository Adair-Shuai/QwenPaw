# -*- coding: utf-8 -*-
"""JSON Schema, component catalog, and validation for declarative GenUI trees.

Ported from LeAgent ``backend/leagent/services/gen_ui/schema.py`` (Apache-2.0).
Adapted for QwenPaw: removed ServiceManager / CanvasService dependencies;
config limits are plain module constants instead of service settings.

The wire format is::

    {
      "schemaVersion": "1",
      "root": {
        "nodeId": "root",
        "kind": "Stack",
        "props": {"gap": 12},
        "children": [ ... ]
      }
    }

Each node has exactly ``{nodeId, kind, props, children}``:
- ``kind``    — PascalCase component name from the catalog enum.
- ``props``   — all component configuration (title, value, chart, …).
- ``children``— nested node objects only (never raw strings).
- ``nodeId``  — optional; the server fills it when missing.
"""

import copy
import json
import uuid
from typing import Any

import jsonschema
from jsonschema.exceptions import ValidationError

# ---------------------------------------------------------------------------
# Configuration limits (module-level constants, not service settings).
# ---------------------------------------------------------------------------

GENUI_MAX_TREE_DEPTH = 20
GENUI_MAX_NODES = 500
GENUI_MAX_JSON_CHARS = 32_000
GENUI_MAX_STRING_CHARS = 8_000
GENUI_MAX_TABLE_ROWS = 200
GENUI_MAX_CHART_POINTS = 2_000

# ---------------------------------------------------------------------------
# JSON Schemas — versioned; bump schemaVersion when this contract changes.
# ---------------------------------------------------------------------------

UI_NODE_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": ["nodeId", "kind"],
    "additionalProperties": False,
    "properties": {
        "nodeId": {"type": "string", "minLength": 1, "maxLength": 128},
        "kind": {"type": "string", "minLength": 1, "maxLength": 64},
        "props": {"type": "object"},
        "children": {"type": "array"},
    },
}

# Phase-1 component kinds (safe, declarative only).
# Phase-2/3 components (HtmlFrame, ThreeJsFrame, Model3D, LiveCamera, etc.)
# are deliberately omitted from the enum but kept in the catalog for reference.
_PHASE1_KINDS: list[str] = [
    # Layout
    "Stack", "Grid", "Row", "Spacer",
    # Typography & basic
    "Text", "Heading", "Divider",
    # Data display
    "Badge", "Tag", "Stat", "Progress",
    "Image", "Table", "TableRow", "TableCell",
    "List", "ListItem", "CodeBlock", "Markdown", "Chart",
    "Icon",
    # Cards
    "Card", "AlertCard", "DataCard", "MetricCard",
    # Interactive (phase-1: send_message only)
    "Button", "Input", "Select",
    # Feedback
    "Alert", "Callout",
    # Debug
    "JsonDebug",
]

# Full catalog includes phase-2/3 kinds for the list_ui_components tool.
_FULL_KINDS: list[str] = _PHASE1_KINDS + [
    "ScrollArea", "Tabs", "TabItem", "Accordion", "AccordionItem",
    "AspectBox", "DesignSurface", "Skeleton",
    "Avatar", "Video", "Model3D", "LiveCamera",
    "WeatherCard", "ProfileCard", "MediaCard", "TimelineCard",
    "SlideDeck", "Slide", "KpiBoard", "FeatureGrid", "Stepper",
    "QuoteCard", "ImageGallery", "KeyValueList", "SectionHeader",
    "InteractiveButton", "ToggleButton", "LinkButton",
    "Chip", "ChipGroup",
    "Form", "NumberInput", "Switch", "Slider", "FileInput", "Textarea",
    "HostedCanvasFrame", "HtmlFrame", "ThreeJsFrame",
]

UI_TREE_SCHEMA: dict[str, Any] = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "required": ["schemaVersion", "root"],
    "additionalProperties": False,
    "properties": {
        "schemaVersion": {"type": "string", "enum": ["1"]},
        "root": {"$ref": "#/$defs/node"},
    },
    "$defs": {
        "node": {
            "type": "object",
            "required": ["nodeId", "kind"],
            "additionalProperties": False,
            "properties": {
                "nodeId": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 128,
                },
                "kind": {
                    "type": "string",
                    "enum": _FULL_KINDS,
                },
                "props": {"type": "object"},
                "children": {
                    "type": "array",
                    "items": {"$ref": "#/$defs/node"},
                },
            },
        }
    },
}

UI_PATCH_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": ["patches"],
    "additionalProperties": False,
    "properties": {
        "canvas_id": {"type": "string", "minLength": 1, "maxLength": 128},
        "seq": {"type": "integer", "minimum": 0},
        "patches": {
            "type": "array",
            "minItems": 1,
            "maxItems": 200,
            "items": {
                "type": "object",
                "required": ["op", "path"],
                "additionalProperties": False,
                "properties": {
                    "op": {
                        "type": "string",
                        "enum": ["add", "replace", "remove"],
                    },
                    "path": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 512,
                    },
                    "value": {},
                },
            },
        },
    },
}

# ---------------------------------------------------------------------------
# Component catalog — documentation for list_ui_components and model guidance.
# ---------------------------------------------------------------------------

_COMPONENT_CATALOG: list[dict[str, Any]] = [
    # ── Layout ────────────────────────────────────────────────────────────
    {"kind": "Stack", "description": "Vertical flex stack container", "props": {"gap": "number", "align": "string (start|center|end|stretch)", "padding": "number"}},
    {"kind": "Grid", "description": "CSS grid layout", "props": {"columns": "number (1-6)", "gap": "number", "minChildWidth": "string (e.g. '200px')"}},
    {"kind": "Row", "description": "Horizontal flex row", "props": {"gap": "number", "align": "string (start|center|end|stretch)", "justify": "string (start|center|end|between|around)"}},
    {"kind": "Spacer", "description": "Vertical whitespace", "props": {"size": "number (px)"}},
    {"kind": "ScrollArea", "description": "Scrollable content area with max height", "props": {"maxHeight": "number (px)"}},
    {"kind": "Tabs", "description": "Tabbed content container; children must be TabItem", "props": {"defaultTab": "string (label of default active tab)"}},
    {"kind": "TabItem", "description": "Single tab pane inside Tabs", "props": {"label": "string (tab title)"}},
    {"kind": "Accordion", "description": "Expandable section container; children must be AccordionItem", "props": {}},
    {"kind": "AccordionItem", "description": "Single expandable section", "props": {"title": "string", "defaultOpen": "boolean"}},
    {"kind": "AspectBox", "description": "Fixed aspect-ratio frame for posters, slides, cards", "props": {"ratio": "string (16:9|4:3|1:1|3:2)", "maxWidth": "number (px)", "rounded": "boolean", "overflow": "string (hidden|visible)"}},
    {"kind": "DesignSurface", "description": "Themed wrapper for consistent gen UI styling", "props": {"preset": "string (poster|slide|card|editorial|minimal|brutalist|geek)", "padding": "string (none|sm|md|lg)"}},
    # ── Typography & basic ────────────────────────────────────────────────
    {"kind": "Text", "description": "Body text paragraph; value supports inline markdown such as **bold**", "props": {"value": "string", "size": "string (xs|sm|base|lg)", "color": "string (muted|default|primary|success|warning|error)", "bold": "boolean"}},
    {"kind": "Heading", "description": "Section title heading", "props": {"level": "number (1-4)", "value": "string"}},
    {"kind": "Divider", "description": "Horizontal divider line", "props": {"label": "string (optional center label)"}},
    {"kind": "Skeleton", "description": "Loading placeholder shimmer", "props": {"lines": "number", "variant": "string (text|card|avatar)"}},
    # ── Data display ──────────────────────────────────────────────────────
    {"kind": "Badge", "description": "Small status label", "props": {"value": "string", "variant": "string (default|primary|success|warning|error|info)"}},
    {"kind": "Tag", "description": "Removable tag / chip label", "props": {"label": "string", "color": "string (gray|blue|green|red|yellow|purple)"}},
    {"kind": "Stat", "description": "Key-value statistic display", "props": {"label": "string", "value": "string", "delta": "string (e.g. +12%)", "trend": "string (up|down|neutral)"}},
    {"kind": "Progress", "description": "Progress bar with percentage", "props": {"value": "number (0-100)", "label": "string", "color": "string (primary|success|warning|error)"}},
    {"kind": "Avatar", "description": "User or entity avatar", "props": {"src": "string (image URL)", "name": "string (fallback initials)", "size": "string (sm|md|lg)"}},
    {"kind": "Image", "description": "Image with URL or workspace file path", "props": {"src": "string (URL or /api/workspace/files/...)", "alt": "string", "caption": "string", "rounded": "boolean", "maxHeight": "number (px)", "fit": "string (cover|contain|fill)", "aspect": "string (CSS aspect-ratio e.g. '16/9')", "shadow": "string (none|sm|md|lg)", "lightbox": "boolean"}},
    {"kind": "Video", "description": "Inline video player", "props": {"src": "string (URL)", "poster": "string", "caption": "string", "autoPlay": "boolean", "loop": "boolean", "muted": "boolean", "controls": "boolean", "rounded": "boolean", "maxHeight": "number (px)"}},
    {"kind": "Model3D", "description": "Interactive 3D model viewer (GLB/GLTF)", "props": {"src": "string (URL to .glb/.gltf)", "caption": "string", "height": "number (px)", "background": "string (CSS color)", "autoRotate": "boolean", "rotateSpeed": "number", "wireframe": "boolean"}},
    {"kind": "LiveCamera", "description": "Live camera preview (getUserMedia)", "props": {"facingMode": "string (user|environment)", "mirrored": "boolean", "maxHeight": "number (px)", "label": "string"}},
    {"kind": "Icon", "description": "Lucide SVG icon or emoji", "props": {"name": "string (Lucide kebab id or emoji)", "size": "number (px)", "color": "string (muted|default|primary|success|warning|error)", "iconSet": "string (auto|lucide|emoji)", "strokeWidth": "number"}},
    {"kind": "Table", "description": "Data table; children are TableRow", "props": {"headers": "array of string", "striped": "boolean", "compact": "boolean"}},
    {"kind": "TableRow", "description": "Table row; children are TableCell", "props": {"highlight": "boolean"}},
    {"kind": "TableCell", "description": "Table cell", "props": {"value": "string", "align": "string (left|center|right)", "bold": "boolean"}},
    {"kind": "List", "description": "Ordered or unordered list; children are ListItem", "props": {"ordered": "boolean", "variant": "string (default|bordered|separated)"}},
    {"kind": "ListItem", "description": "Single list item", "props": {"value": "string", "icon": "string (emoji or icon name)"}},
    {"kind": "CodeBlock", "description": "Syntax-highlighted code block", "props": {"code": "string", "language": "string (python|javascript|json|sql|bash)", "title": "string"}},
    {"kind": "Markdown", "description": "Rendered block markdown content", "props": {"content": "string (markdown text)", "value": "string (fallback markdown text)"}},
    {"kind": "Chart", "description": "Data chart (line, bar, area, pie) with theme-aligned styling", "props": {"chart": "string (line|bar|area|pie)", "title": "string", "categories": "array of string", "series": "array of {name: string, values: array of number}", "height": "number (px)", "stacked": "boolean", "showLegend": "boolean", "showGrid": "boolean"}},
    # ── Rich Cards ────────────────────────────────────────────────────────
    {"kind": "Card", "description": "General-purpose bordered card container", "props": {"title": "string", "subtitle": "string", "variant": "string (default|elevated|outlined)", "padding": "string (sm|md|lg)"}},
    {"kind": "WeatherCard", "description": "Weather information card", "props": {"location": "string", "temperature": "string", "condition": "string", "icon": "string", "humidity": "string", "wind": "string", "feelsLike": "string", "forecast": "array of {day, high, low, icon}"}},
    {"kind": "DataCard", "description": "Data summary card with title, value, and optional children", "props": {"title": "string", "value": "string", "description": "string", "icon": "string (emoji)"}},
    {"kind": "MetricCard", "description": "KPI metric card with trend indicator", "props": {"title": "string", "value": "string", "delta": "string", "trend": "string (up|down|neutral)", "period": "string", "icon": "string (emoji)"}},
    {"kind": "ProfileCard", "description": "User or entity profile card", "props": {"name": "string", "role": "string", "avatarUrl": "string", "initials": "string", "bio": "string", "stats": "array of {label, value}"}},
    {"kind": "MediaCard", "description": "Card with image/media header and content area", "props": {"imageUrl": "string", "title": "string", "description": "string", "badge": "string", "aspectRatio": "string"}},
    {"kind": "AlertCard", "description": "Prominent alert / notification card", "props": {"title": "string", "message": "string", "severity": "string (info|success|warning|error)", "icon": "string (emoji)"}},
    {"kind": "TimelineCard", "description": "Vertical timeline of events", "props": {"title": "string", "events": "array of {time, title, description, icon, status}"}},
    {"kind": "SlideDeck", "description": "Presentation deck; children should be Slide nodes", "props": {"title": "string", "aspectRatio": "string (16:9|4:3|1:1|3:2)", "loop": "boolean", "showPager": "boolean", "showExport": "boolean", "slides": "array of slide specs"}},
    {"kind": "Slide", "description": "Single slide inside SlideDeck", "props": {"eyebrow": "string", "title": "string", "subtitle": "string", "layout": "string (title-content|cover|two-column)", "variant": "string (cover|content)", "background": "string", "imageUrl": "string"}},
    {"kind": "KpiBoard", "description": "Responsive grid of KPI cards", "props": {"columns": "number (1-6)"}},
    {"kind": "FeatureGrid", "description": "Grid of feature tiles from props.items", "props": {"columns": "number (1-6)", "items": "array of {title, description, icon, iconTone, badge}"}},
    {"kind": "Stepper", "description": "Vertical or horizontal steps checklist", "props": {"orientation": "string (vertical|horizontal)", "current": "number", "steps": "array of {title, description, icon, status}"}},
    {"kind": "QuoteCard", "description": "Blockquote testimonial with attribution", "props": {"quote": "string", "author": "string", "role": "string", "avatarUrl": "string"}},
    {"kind": "ImageGallery", "description": "Responsive image grid", "props": {"columns": "number (1-6)", "aspect": "string (CSS ratio)", "lightbox": "boolean", "shadow": "string", "items": "array of {src, alt, caption, aspect}"}},
    {"kind": "KeyValueList", "description": "Two-column definition list for dense facts", "props": {"columns": "number (1-2)", "items": "array of {label, value, icon}"}},
    {"kind": "SectionHeader", "description": "Eyebrow + title row", "props": {"eyebrow": "string", "title": "string", "description": "string", "icon": "string", "iconTone": "string"}},
    # ── Interactive ────────────────────────────────────────────────────────
    {"kind": "Button", "description": "Simple action button", "props": {"label": "string", "actionId": "string (legacy)", "action": "object {type: string, payload?: object}", "variant": "string (primary|secondary|ghost|danger)"}},
    {"kind": "InteractiveButton", "description": "Rich interactive button with icon and action dispatch", "props": {"label": "string", "actionId": "string (legacy)", "action": "object {type, payload?}", "icon": "string (emoji)", "variant": "string (primary|secondary|outline|ghost|danger)", "size": "string (sm|md|lg)", "tooltip": "string", "disabled": "boolean"}},
    {"kind": "ToggleButton", "description": "Toggle on/off button", "props": {"label": "string", "actionId": "string", "active": "boolean"}},
    {"kind": "LinkButton", "description": "Button styled as a link", "props": {"label": "string", "url": "string", "external": "boolean"}},
    {"kind": "Input", "description": "Text input field (display-only outside Form)", "props": {"label": "string", "name": "string", "placeholder": "string", "value": "string", "type": "string (text|email|number)", "required": "boolean", "description": "string"}},
    {"kind": "Select", "description": "Dropdown select (display-only outside Form)", "props": {"label": "string", "name": "string", "options": "array of string", "value": "string", "required": "boolean", "description": "string"}},
    {"kind": "Chip", "description": "Compact selection chip", "props": {"label": "string", "selected": "boolean", "color": "string"}},
    {"kind": "ChipGroup", "description": "Group of selectable chips", "props": {"label": "string"}},
    # ── Forms ─────────────────────────────────────────────────────────────
    {"kind": "Form", "description": "Interactive form scope", "props": {"formId": "string", "title": "string", "description": "string"}},
    {"kind": "NumberInput", "description": "Numeric form field", "props": {"label": "string", "name": "string", "value": "number", "min": "number", "max": "number", "step": "number", "required": "boolean", "description": "string", "integer": "boolean"}},
    {"kind": "Switch", "description": "Boolean toggle form field", "props": {"label": "string", "name": "string", "value": "boolean", "description": "string"}},
    {"kind": "Slider", "description": "Bounded numeric slider form field", "props": {"label": "string", "name": "string", "value": "number", "min": "number", "max": "number", "step": "number", "description": "string"}},
    {"kind": "FileInput", "description": "File reference form field", "props": {"label": "string", "name": "string", "value": "string", "accept": "string", "required": "boolean", "description": "string"}},
    {"kind": "Textarea", "description": "Multiline text form field", "props": {"label": "string", "name": "string", "value": "string", "placeholder": "string", "rows": "number", "required": "boolean", "description": "string"}},
    # ── Feedback ──────────────────────────────────────────────────────────
    {"kind": "Alert", "description": "Inline alert banner", "props": {"title": "string", "message": "string", "severity": "string (info|success|warning|error)", "icon": "string"}},
    {"kind": "Callout", "description": "Highlighted callout / tip / note block", "props": {"title": "string", "message": "string", "variant": "string (info|tip|warning|important)"}},
    # ── Embed ─────────────────────────────────────────────────────────────
    {"kind": "HostedCanvasFrame", "description": "Embed hosted HTML canvas by id", "props": {"canvasId": "string"}},
    {"kind": "HtmlFrame", "description": "Sandboxed iframe for arbitrary HTML/JS snippets", "props": {"html": "string", "height": "number|string (px)", "title": "string", "allowJs": "boolean"}},
    {"kind": "ThreeJsFrame", "description": "Three.js 3D scene card with structured props", "props": {"title": "string", "height": "number|string", "geometry": "string (box|sphere|icosahedron|octahedron|dodecahedron|tetrahedron|torus-knot)", "color": "string", "accentColor": "string", "background": "string", "particles": "number", "orbiters": "number", "wireframe": "boolean", "detail": "number", "quality": "string (auto|high|low)", "dpr": "number", "rotateSpeed": "number", "autoRotate": "boolean", "cameraZ": "number", "sceneScript": "string (legacy hint)"}},
    {"kind": "JsonDebug", "description": "Collapsed JSON viewer (dev/debug)", "props": {"label": "string", "data": "object"}},
]

_LIST_COMPONENT_CATALOG_CACHE: list[dict[str, Any]] = list(_COMPONENT_CATALOG)


def list_component_catalog() -> list[dict[str, Any]]:
    """Return the GenUI component catalog (shared list; do not mutate)."""
    return _LIST_COMPONENT_CATALOG_CACHE


# ---------------------------------------------------------------------------
# Normalization helpers
# ---------------------------------------------------------------------------

_KIND_PROP_NAMES: dict[str, frozenset[str]] = {
    str(entry["kind"]): frozenset((entry.get("props") or {}).keys())
    for entry in _COMPONENT_CATALOG
}

_RESERVED_NODE_KEYS: frozenset[str] = frozenset(
    {"nodeId", "kind", "type", "props", "children"}
)


def _lift_known_flat_props(node: dict[str, Any]) -> None:
    """Move catalog-documented flat keys on ``node`` into ``node['props']``."""
    kind = node.get("kind")
    if not isinstance(kind, str):
        return
    known = _KIND_PROP_NAMES.get(kind)
    if not known:
        return
    existing = node.get("props")
    props: dict[str, Any] | None = existing if isinstance(existing, dict) else None
    lifted: dict[str, Any] | None = None
    for key in list(node.keys()):
        if key in _RESERVED_NODE_KEYS:
            continue
        if key not in known:
            continue
        if props is None and lifted is None:
            lifted = {}
        target = props if props is not None else lifted
        assert target is not None
        if key not in target:
            target[key] = node[key]
        del node[key]
    if lifted is not None:
        node["props"] = lifted


def _ensure_node_ids(node: dict[str, Any]) -> None:
    nid = node.get("nodeId")
    if not isinstance(nid, str) or not nid.strip():
        node["nodeId"] = uuid.uuid4().hex
    for ch in node.get("children") or []:
        if isinstance(ch, dict):
            _ensure_node_ids(ch)


def _coerce_legacy_type_to_kind(node: dict[str, Any]) -> None:
    """Models often emit ``type`` (React-style); wire format requires ``kind``."""
    legacy = node.pop("type", None)
    kind = node.get("kind")
    if not isinstance(kind, str) or not kind.strip():
        if isinstance(legacy, str) and legacy.strip():
            node["kind"] = legacy.strip()
    for ch in node.get("children") or []:
        if isinstance(ch, dict):
            _coerce_legacy_type_to_kind(ch)


_SIZE_TOKENS: dict[str, int] = {
    "none": 0, "xs": 4, "sm": 8, "md": 12, "base": 12,
    "lg": 16, "xl": 24, "2xl": 32,
}


def _coerce_number_token(value: Any) -> Any:
    """Coerce common model-friendly spacing/size tokens into numbers."""
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return value
    if not isinstance(value, str):
        return value
    raw = value.strip()
    if not raw:
        return value
    token = raw.lower()
    if token in _SIZE_TOKENS:
        return _SIZE_TOKENS[token]
    if token.endswith("px"):
        token = token[:-2].strip()
    try:
        parsed = float(token)
    except ValueError:
        return value
    return int(parsed) if parsed.is_integer() else parsed


def _rename_prop(props: dict[str, Any], target: str, *aliases: str) -> None:
    if target in props:
        return
    for alias in aliases:
        if alias in props:
            props[target] = props[alias]
            return


def _normalize_node_props(node: dict[str, Any]) -> None:
    """Normalize common LLM prop aliases while keeping the wire schema stable."""
    _lift_known_flat_props(node)
    kind = node.get("kind")
    props = node.get("props")
    if isinstance(props, dict) and isinstance(kind, str):
        if kind == "Badge":
            _rename_prop(props, "value", "text", "label")
        elif kind in {"Tag", "Chip"}:
            _rename_prop(props, "label", "text", "value")
        elif kind in {"Text", "TableCell", "ListItem"}:
            _rename_prop(props, "value", "text", "content", "label")
        elif kind == "Heading":
            _rename_prop(props, "value", "text", "title")
        elif kind == "Markdown":
            _rename_prop(props, "content", "text", "value")
        elif kind == "Image":
            _rename_prop(props, "src", "url", "imageUrl")
        elif kind == "LinkButton":
            _rename_prop(props, "url", "href")
        elif kind in {"Alert", "AlertCard", "Callout"}:
            _rename_prop(props, "message", "description", "text", "content")

        if "alignment" in props and "align" not in props:
            props["align"] = props["alignment"]
        for key in ("gap", "padding", "size", "maxHeight", "columns", "value"):
            if key in props and kind in {
                "Stack", "Row", "Grid", "Spacer", "ScrollArea", "Progress",
            }:
                props[key] = _coerce_number_token(props[key])

    for ch in node.get("children") or []:
        if isinstance(ch, dict):
            _normalize_node_props(ch)


def _looks_like_bare_root_node(d: dict[str, Any]) -> bool:
    """True when the payload is a single node dict instead of {schemaVersion, root}."""
    if "root" in d:
        return False
    return isinstance(d.get("kind"), str) or isinstance(d.get("type"), str)


def normalize_ui_tree(tree: dict[str, Any]) -> dict[str, Any]:
    """Return a deep copy with root wrapper, schemaVersion, type→kind, and nodeIds."""
    raw = copy.deepcopy(tree)
    if _looks_like_bare_root_node(raw):
        out: dict[str, Any] = {"schemaVersion": "1", "root": raw}
    else:
        out = raw
    if "schemaVersion" not in out:
        out["schemaVersion"] = "1"
    root = out.get("root")
    if isinstance(root, dict):
        _coerce_legacy_type_to_kind(root)
        _normalize_node_props(root)
        _ensure_node_ids(root)
    return out


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------


def _count_nodes_depth(node: dict[str, Any], depth: int) -> tuple[int, int]:
    total = 1
    max_d = depth
    for ch in node.get("children") or []:
        if isinstance(ch, dict):
            sub_n, sub_d = _count_nodes_depth(ch, depth + 1)
            total += sub_n
            max_d = max(max_d, sub_d)
    return total, max_d


def _validate_string_limits(node: dict[str, Any]) -> None:
    """Recursively check string lengths and collection sizes."""
    props = node.get("props")
    if isinstance(props, dict):
        for val in props.values():
            if isinstance(val, str) and len(val) > GENUI_MAX_STRING_CHARS:
                raise ValidationError(
                    f"string value exceeds {GENUI_MAX_STRING_CHARS} chars"
                )
            if isinstance(val, list) and len(val) > GENUI_MAX_TABLE_ROWS:
                raise ValidationError(
                    f"array exceeds {GENUI_MAX_TABLE_ROWS} items"
                )
    for ch in node.get("children") or []:
        if isinstance(ch, dict):
            _validate_string_limits(ch)


def validate_ui_tree(
    tree: dict[str, Any],
    *,
    max_depth: int = GENUI_MAX_TREE_DEPTH,
    max_nodes: int = GENUI_MAX_NODES,
) -> dict[str, Any]:
    """Normalize and validate a UI tree. Returns the normalized tree."""
    normalized = normalize_ui_tree(tree)
    jsonschema.validate(instance=normalized, schema=UI_TREE_SCHEMA)
    root = normalized.get("root")
    if not isinstance(root, dict):
        raise ValidationError("root must be an object")
    n, d = _count_nodes_depth(root, 1)
    if d > max_depth:
        raise ValidationError(f"tree depth {d} exceeds max {max_depth}")
    if n > max_nodes:
        raise ValidationError(f"tree node count {n} exceeds max {max_nodes}")
    _validate_string_limits(root)
    return normalized


def validate_ui_patch(payload: dict[str, Any]) -> None:
    """Validate a JSON-Patch payload against UI_PATCH_SCHEMA."""
    normalized = {
        k: v
        for k, v in dict(payload).items()
        if v is not None and k in ("patches", "canvas_id", "seq")
    }
    jsonschema.validate(instance=normalized, schema=UI_PATCH_SCHEMA)


__all__ = [
    "GENUI_MAX_TREE_DEPTH",
    "GENUI_MAX_NODES",
    "GENUI_MAX_JSON_CHARS",
    "GENUI_MAX_STRING_CHARS",
    "GENUI_MAX_TABLE_ROWS",
    "GENUI_MAX_CHART_POINTS",
    "UI_TREE_SCHEMA",
    "UI_PATCH_SCHEMA",
    "list_component_catalog",
    "normalize_ui_tree",
    "validate_ui_tree",
    "validate_ui_patch",
]
