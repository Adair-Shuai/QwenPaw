# -*- coding: utf-8 -*-
"""JSON Schema, component catalog, and validation for declarative GenUI trees.

Ported from LeAgent ``backend/leagent/services/gen_ui/schema.py`` (Apache-2.0).
Adapted for QwenPaw: removed ServiceManager / CanvasService dependencies.
"""

import copy
import re
import uuid
from typing import Any

import jsonschema
from jsonschema.exceptions import ValidationError

GENUI_MAX_TREE_DEPTH = 20
GENUI_MAX_NODES = 500
GENUI_MAX_JSON_CHARS = 32_000
GENUI_MAX_STRING_CHARS = 8_000
GENUI_MAX_TABLE_ROWS = 200
GENUI_MAX_CHART_POINTS = 2_000

# ─── Component kind whitelists ──────────────────────────────────────────────

# Phase-1: safe declarative components (PLAN §6.6 第一阶段)
_PHASE1_KINDS: list[str] = [
    "Stack", "Grid", "Row", "Spacer",
    "Text", "Heading", "Divider", "Markdown",
    "Card", "Stat", "Badge", "Tag", "Progress",
    "Table", "TableRow", "TableCell", "List", "ListItem",
    "Image", "Chart", "Icon",
    "Button", "Input", "Select",
    "CodeBlock", "JsonDebug",
    "Alert", "Callout",
    "DataCard", "MetricCard", "AlertCard",
]

# Phase-2: additional interactive / layout components (PLAN §6.6 第二阶段)
_PHASE2_KINDS: list[str] = [
    "ScrollArea",
    "Tabs", "TabItem",
    "Accordion", "AccordionItem",
    "Form", "Switch", "Slider", "Textarea", "NumberInput", "FileInput",
    "ImageGallery", "TimelineCard", "KpiBoard",
    "Chip", "ChipGroup",
    "SectionHeader", "KeyValueList",
    "FeatureGrid", "Stepper",
    "Skeleton", "Avatar",
    "WeatherCard", "ProfileCard", "MediaCard", "QuoteCard",
    "InteractiveButton", "ToggleButton", "LinkButton",
    "AspectBox",
]

# Phase-3: unsafe / heavy components — excluded from Schema by default (PLAN §6.6 第三阶段)
_PHASE3_KINDS: list[str] = [
    "HostedCanvasFrame", "HtmlFrame", "ThreeJsFrame",
    "Model3D", "LiveCamera",
    "SlideDeck", "Slide",
    "DesignSurface",
    "Video",
]

# Allowed kinds = phase-1 + phase-2 (phase-3 excluded unless explicitly enabled)
_ALLOWED_KINDS: list[str] = _PHASE1_KINDS + _PHASE2_KINDS

# Full list (including phase-3) — only used when allow_unsafe_kinds=True
_FULL_KINDS: list[str] = _ALLOWED_KINDS + _PHASE3_KINDS

# ─── URL scheme validation ──────────────────────────────────────────────────

_ALLOWED_URL_SCHEMES: frozenset[str] = frozenset({"https", "http", "blob", "data"})
_BLOCKED_URL_SCHEMES: frozenset[str] = frozenset({"javascript", "vbscript", "file"})

def _validate_url(value: Any) -> None:
    """Reject dangerous URL schemes (javascript:, vbscript:, file:)."""
    if not isinstance(value, str) or not value:
        return
    stripped = value.strip().lower()
    # Reject javascript: and vbscript: in any context
    for scheme in _BLOCKED_URL_SCHEMES:
        if stripped.startswith(scheme + ":"):
            raise ValidationError(f"URL scheme '{scheme}' is not allowed")
    # Reject data:text/html
    if stripped.startswith("data:text/html"):
        raise ValidationError("data:text/html URLs are not allowed")
    # For explicit scheme checks, verify it's in the allowlist
    match = re.match(r"^([a-zA-Z][a-zA-Z0-9+.\-]*):", stripped)
    if match:
        scheme = match.group(1).lower()
        if scheme not in _ALLOWED_URL_SCHEMES:
            raise ValidationError(f"URL scheme '{scheme}' is not allowed")

# ─── UI Tree Schema ─────────────────────────────────────────────────────────

def _build_ui_tree_schema(allowed_kinds: list[str]) -> dict[str, Any]:
    return {
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
                    "nodeId": {"type": "string", "minLength": 1, "maxLength": 128},
                    "kind": {"type": "string", "enum": allowed_kinds},
                    "props": {"type": "object"},
                    "children": {"type": "array", "items": {"$ref": "#/$defs/node"}},
                },
            }
        },
    }

UI_TREE_SCHEMA: dict[str, Any] = _build_ui_tree_schema(_ALLOWED_KINDS)

# ─── UI Patch Schema (RFC 6902 subset) ──────────────────────────────────────

UI_PATCH_SCHEMA: dict[str, Any] = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "required": ["ui_id", "base_revision", "patches"],
    "additionalProperties": False,
    "properties": {
        "ui_id": {"type": "string", "minLength": 1, "maxLength": 128},
        "base_revision": {"type": "integer", "minimum": 1},
        "patches": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["op", "path"],
                "additionalProperties": False,
                "properties": {
                    "op": {"type": "string", "enum": ["replace", "add", "remove"]},
                    "path": {"type": "string", "minLength": 1, "maxLength": 512},
                    "value": {},
                },
            },
            "maxItems": 100,
        },
    },
}

# ─── Component catalog ──────────────────────────────────────────────────────

_COMPONENT_CATALOG: list[dict[str, Any]] = [
    # Layout
    {"kind": "Stack", "description": "Vertical flex stack container", "props": {"gap": "number", "align": "string", "padding": "number"}},
    {"kind": "Grid", "description": "CSS grid layout", "props": {"columns": "number (1-6)", "gap": "number"}},
    {"kind": "Row", "description": "Horizontal flex row", "props": {"gap": "number", "align": "string", "justify": "string"}},
    {"kind": "Spacer", "description": "Vertical whitespace", "props": {"size": "number (px)"}},
    {"kind": "ScrollArea", "description": "Scrollable container", "props": {"maxHeight": "number", "padding": "number"}},
    # Text
    {"kind": "Text", "description": "Body text paragraph", "props": {"value": "string", "size": "string (xs|sm|base|lg)", "color": "string", "bold": "boolean"}},
    {"kind": "Heading", "description": "Section title heading", "props": {"level": "number (1-4)", "value": "string"}},
    {"kind": "Divider", "description": "Horizontal divider line", "props": {"label": "string"}},
    {"kind": "Markdown", "description": "Rendered markdown content", "props": {"content": "string", "value": "string"}},
    {"kind": "CodeBlock", "description": "Syntax-highlighted code block", "props": {"code": "string", "language": "string", "title": "string"}},
    {"kind": "SectionHeader", "description": "Section header with optional icon", "props": {"title": "string", "subtitle": "string", "icon": "string"}},
    {"kind": "KeyValueList", "description": "List of key-value pairs", "props": {"items": "array of {key, value}"}},
    # Status / Display
    {"kind": "Badge", "description": "Small status label", "props": {"value": "string", "variant": "string"}},
    {"kind": "Tag", "description": "Tag / chip label", "props": {"label": "string", "color": "string"}},
    {"kind": "Stat", "description": "Key-value statistic display", "props": {"label": "string", "value": "string", "delta": "string", "trend": "string"}},
    {"kind": "Progress", "description": "Progress bar", "props": {"value": "number (0-100)", "label": "string", "color": "string"}},
    {"kind": "Skeleton", "description": "Loading placeholder", "props": {"rows": "number", "active": "boolean"}},
    {"kind": "Avatar", "description": "User avatar", "props": {"src": "string", "name": "string", "size": "number"}},
    {"kind": "Icon", "description": "Lucide SVG icon or emoji", "props": {"name": "string", "size": "number", "color": "string"}},
    # Cards
    {"kind": "Card", "description": "General-purpose bordered card", "props": {"title": "string", "subtitle": "string", "variant": "string", "padding": "string"}},
    {"kind": "DataCard", "description": "Data summary card", "props": {"title": "string", "value": "string", "description": "string", "icon": "string"}},
    {"kind": "MetricCard", "description": "KPI metric card", "props": {"title": "string", "value": "string", "delta": "string", "trend": "string", "period": "string", "icon": "string"}},
    {"kind": "AlertCard", "description": "Alert / notification card", "props": {"title": "string", "message": "string", "severity": "string", "icon": "string"}},
    {"kind": "WeatherCard", "description": "Weather display card", "props": {"location": "string", "temperature": "string", "condition": "string", "icon": "string"}},
    {"kind": "ProfileCard", "description": "User profile card", "props": {"name": "string", "role": "string", "avatar": "string", "bio": "string"}},
    {"kind": "MediaCard", "description": "Media (image/video) card", "props": {"title": "string", "src": "string", "caption": "string"}},
    {"kind": "QuoteCard", "description": "Quote / testimonial card", "props": {"quote": "string", "author": "string", "role": "string"}},
    {"kind": "TimelineCard", "description": "Timeline event card", "props": {"title": "string", "date": "string", "description": "string", "status": "string"}},
    {"kind": "KpiBoard", "description": "KPI dashboard board; children are MetricCards", "props": {"title": "string", "columns": "number"}},
    {"kind": "FeatureGrid", "description": "Feature grid; children are Cards", "props": {"columns": "number", "gap": "number"}},
    {"kind": "Stepper", "description": "Step progress indicator", "props": {"current": "number", "steps": "array of string"}},
    # Table / List
    {"kind": "Table", "description": "Data table; children are TableRow", "props": {"headers": "array of string", "striped": "boolean", "compact": "boolean"}},
    {"kind": "TableRow", "description": "Table row; children are TableCell", "props": {"highlight": "boolean"}},
    {"kind": "TableCell", "description": "Table cell", "props": {"value": "string", "align": "string", "bold": "boolean"}},
    {"kind": "List", "description": "Ordered or unordered list", "props": {"ordered": "boolean", "variant": "string"}},
    {"kind": "ListItem", "description": "Single list item", "props": {"value": "string", "icon": "string"}},
    # Media
    {"kind": "Image", "description": "Image with URL or file path", "props": {"src": "string", "alt": "string", "caption": "string", "rounded": "boolean", "maxHeight": "number", "fit": "string", "aspect": "string", "lightbox": "boolean"}},
    {"kind": "ImageGallery", "description": "Gallery of images; children are Image", "props": {"columns": "number", "gap": "number"}},
    {"kind": "Chart", "description": "Data chart (line, bar, area, pie)", "props": {"chart": "string", "title": "string", "categories": "array of string", "series": "array of {name, values}", "height": "number", "stacked": "boolean", "showLegend": "boolean"}},
    # Interactive
    {"kind": "Button", "description": "Action button", "props": {"label": "string", "action": "object {type, payload}", "variant": "string"}},
    {"kind": "InteractiveButton", "description": "Button with loading state", "props": {"label": "string", "action": "object", "variant": "string", "loading": "boolean"}},
    {"kind": "ToggleButton", "description": "Toggle button", "props": {"label": "string", "checked": "boolean", "action": "object"}},
    {"kind": "LinkButton", "description": "Link-style button", "props": {"label": "string", "href": "string", "action": "object"}},
    {"kind": "Input", "description": "Text input (display-only outside Form)", "props": {"label": "string", "placeholder": "string", "value": "string"}},
    {"kind": "NumberInput", "description": "Numeric input", "props": {"label": "string", "value": "number", "min": "number", "max": "number"}},
    {"kind": "Select", "description": "Dropdown select", "props": {"label": "string", "options": "array of string", "value": "string"}},
    {"kind": "Textarea", "description": "Multi-line text input", "props": {"label": "string", "placeholder": "string", "value": "string", "rows": "number"}},
    {"kind": "Form", "description": "Form container; children are inputs", "props": {"title": "string", "submitLabel": "string", "action": "object"}},
    {"kind": "Switch", "description": "Toggle switch", "props": {"label": "string", "checked": "boolean"}},
    {"kind": "Slider", "description": "Range slider", "props": {"label": "string", "value": "number", "min": "number", "max": "number", "step": "number"}},
    {"kind": "FileInput", "description": "File upload input", "props": {"label": "string", "accept": "string", "multiple": "boolean"}},
    {"kind": "Chip", "description": "Removable chip", "props": {"label": "string", "color": "string"}},
    {"kind": "ChipGroup", "description": "Group of chips", "props": {"items": "array of string"}},
    # Tabs / Accordion
    {"kind": "Tabs", "description": "Tab container; children are TabItem", "props": {"activeKey": "string"}},
    {"kind": "TabItem", "description": "Tab pane", "props": {"tab": "string", "key": "string"}},
    {"kind": "Accordion", "description": "Collapsible sections; children are AccordionItem", "props": {}},
    {"kind": "AccordionItem", "description": "Accordion section", "props": {"header": "string", "key": "string"}},
    # Alerts
    {"kind": "Alert", "description": "Inline alert banner", "props": {"title": "string", "message": "string", "severity": "string"}},
    {"kind": "Callout", "description": "Highlighted callout block", "props": {"title": "string", "message": "string", "variant": "string"}},
    {"kind": "JsonDebug", "description": "Collapsed JSON viewer", "props": {"label": "string", "data": "object"}},
    {"kind": "AspectBox", "description": "Aspect-ratio container", "props": {"ratio": "string (e.g. 16:9)", "fit": "string"}},
]

_LIST_COMPONENT_CATALOG_CACHE: list[dict[str, Any]] = list(_COMPONENT_CATALOG)

def list_component_catalog() -> list[dict[str, Any]]:
    return _LIST_COMPONENT_CATALOG_CACHE

# ─── Normalize helpers ──────────────────────────────────────────────────────

_KIND_PROP_NAMES: dict[str, frozenset[str]] = {
    str(e["kind"]): frozenset((e.get("props") or {}).keys()) for e in _COMPONENT_CATALOG
}
_RESERVED_NODE_KEYS: frozenset[str] = frozenset({"nodeId", "kind", "type", "props", "children"})

def _lift_known_flat_props(node: dict[str, Any]) -> None:
    kind = node.get("kind")
    if not isinstance(kind, str): return
    known = _KIND_PROP_NAMES.get(kind)
    if not known: return
    existing = node.get("props")
    props = existing if isinstance(existing, dict) else None
    lifted = None
    for key in list(node.keys()):
        if key in _RESERVED_NODE_KEYS or key not in known: continue
        if props is None and lifted is None: lifted = {}
        target = props if props is not None else lifted
        if target is None: continue
        if key not in target: target[key] = node[key]
        del node[key]
    if lifted is not None: node["props"] = lifted

def _ensure_node_ids(node: dict[str, Any]) -> None:
    nid = node.get("nodeId")
    if not isinstance(nid, str) or not nid.strip(): node["nodeId"] = uuid.uuid4().hex
    for ch in node.get("children") or []:
        if isinstance(ch, dict): _ensure_node_ids(ch)

def _coerce_legacy_type_to_kind(node: dict[str, Any]) -> None:
    legacy = node.pop("type", None)
    kind = node.get("kind")
    if not isinstance(kind, str) or not kind.strip():
        if isinstance(legacy, str) and legacy.strip(): node["kind"] = legacy.strip()
    for ch in node.get("children") or []:
        if isinstance(ch, dict): _coerce_legacy_type_to_kind(ch)

_SIZE_TOKENS: dict[str, int] = {"none":0,"xs":4,"sm":8,"md":12,"base":12,"lg":16,"xl":24,"2xl":32}

def _coerce_number_token(value: Any) -> Any:
    if isinstance(value, bool): return value
    if isinstance(value, (int, float)): return value
    if not isinstance(value, str): return value
    raw = value.strip()
    if not raw: return value
    token = raw.lower()
    if token in _SIZE_TOKENS: return _SIZE_TOKENS[token]
    if token.endswith("px"): token = token[:-2].strip()
    try: parsed = float(token)
    except ValueError: return value
    return int(parsed) if parsed.is_integer() else parsed

def _rename_prop(props: dict[str, Any], target: str, *aliases: str) -> None:
    if target in props: return
    for alias in aliases:
        if alias in props: props[target] = props[alias]; return

def _normalize_node_props(node: dict[str, Any]) -> None:
    _lift_known_flat_props(node)
    kind = node.get("kind")
    props = node.get("props")
    if isinstance(props, dict) and isinstance(kind, str):
        if kind == "Badge": _rename_prop(props, "value", "text", "label")
        elif kind in {"Tag", "Chip"}: _rename_prop(props, "label", "text", "value")
        elif kind in {"Text", "TableCell", "ListItem"}: _rename_prop(props, "value", "text", "content", "label")
        elif kind == "Heading": _rename_prop(props, "value", "text", "title")
        elif kind == "Markdown": _rename_prop(props, "content", "text", "value")
        elif kind == "Image": _rename_prop(props, "src", "url", "imageUrl")
        elif kind in {"Alert", "AlertCard", "Callout"}: _rename_prop(props, "message", "description", "text", "content")
        if "alignment" in props and "align" not in props: props["align"] = props["alignment"]
        for key in ("gap", "padding", "size", "maxHeight", "columns", "value"):
            if key in props and kind in {"Stack", "Row", "Grid", "Spacer", "ScrollArea", "Progress"}:
                props[key] = _coerce_number_token(props[key])
    for ch in node.get("children") or []:
        if isinstance(ch, dict): _normalize_node_props(ch)

def _looks_like_bare_root_node(d: dict[str, Any]) -> bool:
    if "root" in d: return False
    return isinstance(d.get("kind"), str) or isinstance(d.get("type"), str)

def normalize_ui_tree(tree: dict[str, Any]) -> dict[str, Any]:
    raw = copy.deepcopy(tree)
    if _looks_like_bare_root_node(raw):
        out: dict[str, Any] = {"schemaVersion": "1", "root": raw}
    else:
        out = raw
    if "schemaVersion" not in out: out["schemaVersion"] = "1"
    root = out.get("root")
    if isinstance(root, dict):
        _coerce_legacy_type_to_kind(root)
        _normalize_node_props(root)
        _ensure_node_ids(root)
    return out

# ─── Validation helpers ─────────────────────────────────────────────────────

def _count_nodes_depth(node: dict[str, Any], depth: int) -> tuple[int, int]:
    total = 1; max_d = depth
    for ch in node.get("children") or []:
        if isinstance(ch, dict):
            sub_n, sub_d = _count_nodes_depth(ch, depth + 1)
            total += sub_n; max_d = max(max_d, sub_d)
    return total, max_d

_URL_PROP_KEYS: frozenset[str] = frozenset({"src", "url", "href", "avatar", "imageUrl"})

def _validate_string_and_url_limits(node: dict[str, Any]) -> None:
    props = node.get("props")
    kind = node.get("kind", "")
    if isinstance(props, dict):
        for key, val in props.items():
            if isinstance(val, str):
                if len(val) > GENUI_MAX_STRING_CHARS:
                    raise ValidationError(f"string value exceeds {GENUI_MAX_STRING_CHARS} chars")
                # URL scheme validation
                if key in _URL_PROP_KEYS:
                    _validate_url(val)
            if isinstance(val, list) and len(val) > GENUI_MAX_TABLE_ROWS:
                raise ValidationError(f"array exceeds {GENUI_MAX_TABLE_ROWS} items")
        # Chart series point limit
        if kind == "Chart":
            series = props.get("series")
            if isinstance(series, list):
                for sr in series:
                    if isinstance(sr, dict):
                        values = sr.get("values")
                        if isinstance(values, list) and len(values) > GENUI_MAX_CHART_POINTS:
                            raise ValidationError(f"chart series exceeds {GENUI_MAX_CHART_POINTS} points")
        # Table row count limit (children-based, checked here for early feedback)
        if kind == "Table":
            headers = props.get("headers")
            if isinstance(headers, list) and len(headers) > GENUI_MAX_TABLE_ROWS:
                raise ValidationError(f"table headers exceed {GENUI_MAX_TABLE_ROWS} columns")
    for ch in node.get("children") or []:
        if isinstance(ch, dict): _validate_string_and_url_limits(ch)

def validate_ui_tree(tree: dict[str, Any], *, max_depth: int = GENUI_MAX_TREE_DEPTH, max_nodes: int = GENUI_MAX_NODES, allow_unsafe_kinds: bool = False) -> dict[str, Any]:
    normalized = normalize_ui_tree(tree)
    schema = UI_TREE_SCHEMA if not allow_unsafe_kinds else _build_ui_tree_schema(_FULL_KINDS)
    jsonschema.validate(instance=normalized, schema=schema)
    root = normalized.get("root")
    if not isinstance(root, dict): raise ValidationError("root must be an object")
    n, d = _count_nodes_depth(root, 1)
    if d > max_depth: raise ValidationError(f"tree depth {d} exceeds max {max_depth}")
    if n > max_nodes: raise ValidationError(f"tree node count {n} exceeds max {max_nodes}")
    _validate_string_and_url_limits(root)
    return normalized

# ─── Patch validation and application ───────────────────────────────────────

# Paths that must not be modified by patches
_PATCH_PROTECTED_PATHS: frozenset[str] = frozenset({
    "/schemaVersion", "/root/nodeId", "/root/kind",
})

def _parse_patch_path(path: str) -> list[Any]:
    """Parse a JSON Pointer path like /root/children/0/props/text into tokens.

    Per RFC 6902, ``-`` as an array index means "append to end".
    """
    if not path.startswith("/"):
        raise ValidationError(f"patch path must start with /: {path}")
    parts = path.split("/")[1:]  # drop leading empty
    tokens: list[Any] = []
    for part in parts:
        part = part.replace("~1", "/").replace("~0", "~")
        # RFC 6902: "-" means append to end of array
        if part == "-":
            tokens.append("-")
            continue
        # Try to parse as int for array indices
        try:
            tokens.append(int(part))
        except ValueError:
            tokens.append(part)
    return tokens

def _apply_single_patch(doc: Any, op: str, path: list[Any], value: Any) -> Any:
    """Apply a single RFC 6902 operation (replace, add, remove) to a document."""
    if not path:
        raise ValidationError("patch path cannot be empty after parsing")
    # Navigate to parent
    parent = doc
    for key in path[:-1]:
        if isinstance(parent, list):
            if not isinstance(key, int) or key < 0 or key >= len(parent):
                raise ValidationError(f"patch path index out of bounds: {key}")
            parent = parent[key]
        elif isinstance(parent, dict):
            if key not in parent:
                raise ValidationError(f"patch path key not found: {key}")
            parent = parent[key]
        else:
            raise ValidationError(f"patch path cannot traverse non-container: {key}")
    last = path[-1]
    if op == "replace":
        if isinstance(parent, list):
            if not isinstance(last, int) or last < 0 or last >= len(parent):
                raise ValidationError(f"patch replace index out of bounds: {last}")
            parent[last] = value
        elif isinstance(parent, dict):
            if last not in parent:
                raise ValidationError(f"patch replace key not found: {last}")
            parent[last] = value
        else:
            raise ValidationError("patch replace target is not a container")
    elif op == "add":
        if isinstance(parent, list):
            if last == "-":
                # RFC 6902: append to end of array
                parent.append(value)
            elif not isinstance(last, int) or last < 0 or last > len(parent):
                raise ValidationError(f"patch add index out of bounds: {last}")
            else:
                parent.insert(last, value)
        elif isinstance(parent, dict):
            parent[last] = value
        else:
            raise ValidationError("patch add target is not a container")
    elif op == "remove":
        if isinstance(parent, list):
            if not isinstance(last, int) or last < 0 or last >= len(parent):
                raise ValidationError(f"patch remove index out of bounds: {last}")
            parent.pop(last)
        elif isinstance(parent, dict):
            if last not in parent:
                raise ValidationError(f"patch remove key not found: {last}")
            del parent[last]
        else:
            raise ValidationError("patch remove target is not a container")
    return doc

def validate_ui_patch(patch: dict[str, Any]) -> dict[str, Any]:
    """Validate a UI patch payload. Returns a normalized copy."""
    raw = copy.deepcopy(patch)
    jsonschema.validate(instance=raw, schema=UI_PATCH_SCHEMA)
    # Check each patch path
    for p in raw.get("patches", []):
        path_str = p.get("path", "")
        # Reject patches to protected paths
        for protected in _PATCH_PROTECTED_PATHS:
            if path_str == protected or path_str.startswith(protected + "/"):
                raise ValidationError(f"patch path '{path_str}' targets protected field")
        # Ensure path starts with /root (limit patches to root subtree)
        if not path_str.startswith("/root"):
            raise ValidationError(f"patch path must start with /root: {path_str}")
        # Parse to verify it's well-formed
        _parse_patch_path(path_str)
    return raw

def apply_ui_patches(tree: dict[str, Any], patches: list[dict[str, Any]]) -> dict[str, Any]:
    """Apply a list of JSON Patch operations to a UI tree. Returns a new tree."""
    result = copy.deepcopy(tree)
    for p in patches:
        op = p.get("op", "")
        path_str = p.get("path", "")
        value = p.get("value")
        tokens = _parse_patch_path(path_str)
        result = _apply_single_patch(result, op, tokens, value)
    return result

__all__ = [
    "GENUI_MAX_JSON_CHARS", "GENUI_MAX_CHART_POINTS", "GENUI_MAX_TABLE_ROWS",
    "UI_TREE_SCHEMA", "UI_PATCH_SCHEMA",
    "list_component_catalog", "normalize_ui_tree", "validate_ui_tree",
    "validate_ui_patch", "apply_ui_patches",
]
