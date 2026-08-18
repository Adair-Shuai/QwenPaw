# -*- coding: utf-8 -*-
"""Turn UGSci domain / simulation / visualization payloads into GenUI trees.

Adapters never raise into the calling tool: a card failure leaves the
original payload unchanged so domain contracts stay stable.
"""

from __future__ import annotations

import logging
import re
from typing import Any

from .emit_core import get_session_id, store_validated_tree
from .schema import GENUI_MAX_CHART_POINTS, GENUI_MAX_TABLE_ROWS
from .settings import load_settings

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.genui.domain")

_FIELD_SKIP = frozenset({
    "schema_version", "engine_id", "engine_version", "provider_id",
    "provider_version", "deterministic", "provenance", "artifacts",
    "genui", "viewer", "text",
})


def _node(kind: str, props: dict[str, Any] | None = None, children: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    return {"kind": kind, "props": props or {}, "children": children or []}


def _fmt(value: Any) -> str:
    if value is None:
        return "—"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, int) and not isinstance(value, bool):
        return f"{value:,}"
    if isinstance(value, float):
        if value != 0 and (abs(value) < 1e-3 or abs(value) >= 1e5):
            return f"{value:.4g}"
        return f"{value:.6g}"
    text = str(value)
    return text if len(text) <= 120 else text[:117] + "…"


def _title_of(payload: dict[str, Any]) -> str:
    for key in ("title", "operation", "method", "engine_id", "kind"):
        value = payload.get(key)
        if isinstance(value, str) and value.strip():
            return value.replace(".", " · ").replace("_", " ")
    return "UGSci result"


def _stable_ui_id(payload: dict[str, Any]) -> str:
    raw = str(
        payload.get("operation")
        or payload.get("kind")
        or payload.get("engine_id")
        or "domain",
    )
    safe = re.sub(r"[^a-zA-Z0-9]+", "_", raw).strip("_").lower()[:48]
    return f"ui_dom_{safe or 'result'}"


def _is_error_payload(payload: dict[str, Any]) -> bool:
    if payload.get("error") is True:
        return True
    if payload.get("kind") == "error":
        return True
    code = payload.get("code")
    return isinstance(code, str) and code in {
        "invalid_input", "file_not_found", "unsupported_format",
        "dependency_unavailable", "engine_unavailable",
        "unsupported_operation", "calculation_failed",
        "non_convergent", "invalid_result",
    }


def _metric_cards(metrics: dict[str, Any], units: dict[str, str] | None = None) -> list[dict[str, Any]]:
    cards: list[dict[str, Any]] = []
    units = units or {}
    for key, value in list(metrics.items())[:8]:
        if value is None or isinstance(value, (dict, list)):
            continue
        suffix = units.get(key)
        shown = _fmt(value)
        if suffix:
            shown = f"{shown} {suffix}"
        cards.append(_node("MetricCard", {
            "title": str(key).replace("_", " "),
            "value": shown,
        }))
    return cards


def _scalar_stats(data: dict[str, Any], units: dict[str, str] | None = None) -> list[dict[str, Any]]:
    stats: list[dict[str, Any]] = []
    units = units or {}
    for key, value in data.items():
        if key in _FIELD_SKIP or isinstance(value, (dict, list)):
            continue
        suffix = units.get(key)
        shown = _fmt(value)
        if suffix:
            shown = f"{shown} {suffix}"
        stats.append(_node("Stat", {"label": str(key).replace("_", " "), "value": shown}))
        if len(stats) >= 8:
            break
    return stats


def _xy_points(value: Any) -> list[tuple[str, float]] | None:
    if not isinstance(value, list) or len(value) < 2:
        return None
    points: list[tuple[str, float]] = []
    if all(isinstance(item, dict) for item in value):
        x_key = next((k for k in ("time", "x", "depth", "pressure") if k in value[0]), None)
        y_key = next((k for k in ("rate", "y", "value", "q") if k in value[0]), None)
        if not x_key or not y_key:
            return None
        for item in value[:GENUI_MAX_CHART_POINTS]:
            try:
                points.append((_fmt(item[x_key]), float(item[y_key])))
            except (TypeError, ValueError, KeyError):
                return None
        return points
    if all(isinstance(item, (list, tuple)) and len(item) >= 2 for item in value):
        for item in value[:GENUI_MAX_CHART_POINTS]:
            try:
                points.append((_fmt(item[0]), float(item[1])))
            except (TypeError, ValueError):
                return None
        return points
    return None


def _table_from_dicts(rows: list[dict[str, Any]], title: str = "") -> dict[str, Any] | None:
    if not rows or not isinstance(rows[0], dict):
        return None
    headers = [str(key) for key in rows[0].keys()][:12]
    table_rows = []
    for row in rows[:GENUI_MAX_TABLE_ROWS]:
        cells = [_node("TableCell", {"value": _fmt(row.get(header))}) for header in headers]
        table_rows.append(_node("TableRow", {}, cells))
    table = _node("Table", {"headers": headers, "compact": True}, table_rows)
    if title:
        return _node("Stack", {"gap": 8}, [_node("Heading", {"level": 3, "value": title}), table])
    return table


def _chart_from_points(points: list[tuple[str, float]], title: str, series_name: str) -> dict[str, Any]:
    return _node("Chart", {
        "chart": "line",
        "title": title,
        "categories": [p[0] for p in points],
        "series": [{"name": series_name, "values": [p[1] for p in points]}],
        "height": 220,
        "showLegend": True,
    })


def _kv_items(mapping: dict[str, Any]) -> list[dict[str, str]]:
    items: list[dict[str, str]] = []
    for key, value in mapping.items():
        if isinstance(value, (dict, list)):
            continue
        items.append({"key": str(key).replace("_", " "), "value": _fmt(value)})
        if len(items) >= 16:
            break
    return items


def build_domain_tree(payload: dict[str, Any]) -> dict[str, Any] | None:
    """Build a validated-shape tree (bare root) from a domain-like payload."""
    if not isinstance(payload, dict) or _is_error_payload(payload):
        return None

    children: list[dict[str, Any]] = [
        _node("Heading", {"level": 2, "value": _title_of(payload)}),
    ]
    method = payload.get("method") or payload.get("engine_id")
    if isinstance(method, str) and method.strip() and method != payload.get("operation"):
        children.append(_node("Text", {"value": method, "size": "sm", "color": "muted"}))

    units = payload.get("units") if isinstance(payload.get("units"), dict) else {}
    metrics = payload.get("metrics") if isinstance(payload.get("metrics"), dict) else {}
    result = payload.get("result") if isinstance(payload.get("result"), dict) else {}
    stats = payload.get("stats") if isinstance(payload.get("stats"), dict) else {}

    metric_nodes = _metric_cards({**metrics, **stats}, units)
    if metric_nodes:
        children.append(_node("KpiBoard", {"columns": min(4, len(metric_nodes))}, metric_nodes))

    scalar_source = result or {
        key: value for key, value in payload.items()
        if key not in _FIELD_SKIP | {"metrics", "result", "stats", "warnings", "assumptions", "units", "title", "operation", "method", "kind"}
    }
    scalars = _scalar_stats(scalar_source, units)
    if scalars:
        children.append(_node("Grid", {"columns": min(4, len(scalars)), "gap": 8}, scalars))

    series_built = False
    for candidate, label in (
        (result.get("forecast") if result else None, "Forecast"),
        (result.get("rates") if result else None, "Rate"),
        (result.get("curve") if result else None, "Curve"),
        (payload.get("series"), "Series"),
    ):
        points = _xy_points(candidate)
        if points:
            children.append(_chart_from_points(points, label, label))
            series_built = True
            break

    if result.get("fits") and isinstance(result["fits"], list) and result["fits"] and isinstance(result["fits"][0], dict):
        table = _table_from_dicts(result["fits"], "Candidate models")
        if table:
            children.append(table)

    if not series_built:
        for key, value in (result or payload).items():
            if key in _FIELD_SKIP or not isinstance(value, list):
                continue
            if value and isinstance(value[0], dict) and not _xy_points(value):
                table = _table_from_dicts(value, str(key).replace("_", " "))
                if table:
                    children.append(table)
                    break

    warnings = payload.get("warnings")
    if isinstance(warnings, list) and warnings:
        children.append(_node("Alert", {
            "title": "Warnings",
            "message": " · ".join(str(item) for item in warnings[:6]),
            "severity": "warning",
        }))

    if units:
        items = _kv_items(units)
        if items:
            children.append(_node("KeyValueList", {"items": items}))

    assumptions = payload.get("assumptions")
    if isinstance(assumptions, list) and assumptions:
        children.append(_node("Accordion", {}, [
            _node("AccordionItem", {"header": "Assumptions", "key": "assumptions"}, [
                _node("List", {}, [
                    _node("ListItem", {"value": str(item)}) for item in assumptions[:8]
                ]),
            ]),
        ]))

    text = payload.get("text")
    if isinstance(text, str) and text.strip() and len(children) < 4:
        children.append(_node("Markdown", {"content": text[:4000]}))

    if len(children) <= 1:
        return None
    return {"schemaVersion": "1", "root": _node("Stack", {"gap": 12}, children)}


def attach_genui(payload: dict[str, Any]) -> dict[str, Any]:
    """Return ``payload`` plus a ``genui`` envelope when a card can be stored."""
    if not isinstance(payload, dict) or payload.get("genui"):
        return payload
    if not load_settings().get("enabled", True):
        return payload
    if not get_session_id():
        return payload
    try:
        from .registration import _get_current_channel, is_genui_enabled_for_context

        channel = _get_current_channel()
        if channel and not is_genui_enabled_for_context():
            return payload
    except Exception:
        pass
    tree = build_domain_tree(payload)
    if tree is None:
        return payload
    try:
        envelope = store_validated_tree(tree, ui_id=_stable_ui_id(payload))
    except Exception as exc:
        logger.info("[ugsci.genui] domain card skipped: %s", exc)
        return payload
    merged = dict(payload)
    merged["genui"] = envelope
    return merged


__all__ = ["attach_genui", "build_domain_tree"]
