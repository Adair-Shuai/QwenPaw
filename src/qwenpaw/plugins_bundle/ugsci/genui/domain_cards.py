# -*- coding: utf-8 -*-
"""Turn UGSci domain / simulation / visualization payloads into GenUI trees.

Adapters never raise into the calling tool: a card failure leaves the
original payload unchanged so domain contracts stay stable.
"""

from __future__ import annotations

import hashlib
import json
import logging
import math
import re
from typing import Any

from .emit_core import get_session_id, store_validated_tree
from .schema import GENUI_MAX_CHART_POINTS, GENUI_MAX_TABLE_ROWS
from .settings import load_settings

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.genui.domain")

try:
    from ..domain.trace.asciimath import to_unicode as _asciimath_to_unicode
except Exception:  # noqa: BLE001  (keep the cards live if the trace module is absent)
    _asciimath_to_unicode = None

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


def _slider_step(value: float, lo: float, hi: float) -> float:
    """Pick a sensible step for a slider in the editable worksheet."""
    span = hi - lo
    if span <= 0:
        return 1.0
    return max(span / 100.0, 10.0 ** (int(math.log10(max(abs(span), 1.0))) - 1))


def _stable_ui_id(payload: dict[str, Any]) -> str:
    raw = str(
        payload.get("operation")
        or payload.get("kind")
        or payload.get("engine_id")
        or "domain",
    )
    safe = re.sub(r"[^a-zA-Z0-9]+", "_", raw).strip("_").lower()[:48]
    return f"ui_dom_{safe or 'result'}"


def _trace_ui_id(payload: dict[str, Any], trace: dict[str, Any]) -> str:
    formula_id = re.sub(
        r"[^a-zA-Z0-9]+", "_", str(trace.get("formula_id") or "derivation")
    ).strip("_").lower()[:48]
    provenance = payload.get("provenance") or {}
    fingerprint = str(
        provenance.get("formula_fingerprint")
        or provenance.get("input_fingerprint")
        or ""
    )
    suffix = hashlib.sha256(fingerprint.encode("utf-8")).hexdigest()[:12] if fingerprint else "current"
    return f"ui_trc_{formula_id}_{suffix}"


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


_STEP_ICONS = {
    "bind": "📌",
    "symbolic": "🧮",
    "evaluate": "🔢",
    "assert": "✅",
}
_STEP_GROUP_LABELS = {
    "assemble": "组装方程",
    "substitute": "代入数值",
    "reduce": "化简",
    "solve": "求解",
    "verify": "校验",
}


def _step_math(step: dict[str, Any]) -> str:
    """Return the best rendering of a step's equation in Unicode math."""
    unicode = step.get("unicode") or ""
    if unicode:
        return unicode
    latex = step.get("latex") or ""
    if latex:
        return _asciimath_to_unicode(latex) if _asciimath_to_unicode else latex
    return step.get("expression") or ""


def _trace_step_body(step: dict[str, Any], index: int) -> list[dict[str, Any]]:
    children: list[dict[str, Any]] = []
    kind = step.get("kind", "")
    icon = _STEP_ICONS.get(kind, "•")
    title = step.get("title") or f"步骤 {index + 1}"

    label = title
    group = step.get("group")
    if group in _STEP_GROUP_LABELS:
        label = f"{icon} {_STEP_GROUP_LABELS[group]} · {title}"
    else:
        label = f"{icon} {title}"

    # Equation — rendered as Unicode math (readable in any text node).
    math = _step_math(step)
    if math:
        children.append(_node("Text", {"value": math, "size": "base", "bold": True}))

    # Description / rationale.
    if step.get("description"):
        children.append(_node("Text", {"value": step["description"], "size": "sm", "color": "muted"}))

    # Numeric substitutions (for evaluate steps).
    substitutions = step.get("substitutions") or []
    if substitutions:
        items = [
            {"key": _asciimath_to_unicode(str(key)) if _asciimath_to_unicode else str(key),
             "value": str(val)}
            for key, val in substitutions[:16]
            if isinstance(val, (str, int, float))
        ]
        if items:
            children.append(_node("KeyValueList", {"items": items}))

    # Result value for evaluate/assert steps.  Symbolic steps carry no value.
    if "value" in step and not isinstance(step.get("value"), dict):
        value = step.get("display_value")
        unit = step.get("display_unit") or step.get("unit")
        if value is None:
            value = step.get("value")
        if isinstance(value, bool):
            if kind == "assert":
                children.append(_node("Badge", {
                    "value": "校验通过" if value else "校验失败",
                    "variant": "success" if value else "error",
                }))
        elif value is not None:
            shown = _fmt(value) if isinstance(value, float) else str(value)
            if unit:
                shown = f"{shown} {unit}"
            children.append(_node("Text", {"value": f"= {shown}", "size": "sm", "bold": True}))

    if step.get("note"):
        children.append(_node("Text", {"value": step["note"], "size": "xs", "color": "muted"}))

    return children


def build_trace_tree(payload: dict[str, Any]) -> dict[str, Any] | None:
    """Render a traced calculation as an observable scientific worksheet."""
    trace = payload.get("trace")
    if not isinstance(trace, dict):
        return None
    steps = trace.get("steps") or []
    if not steps:
        return None

    children: list[dict[str, Any]] = [
        _node("Heading", {"level": 2, "value": trace.get("title") or _title_of(payload)}),
    ]
    if trace.get("formula_name"):
        children.append(_node("Text", {"value": trace["formula_name"], "size": "sm", "color": "muted"}))

    # ── Freeform provenance: unverified badge + unit-unknown warnings (§11). ──
    provenance = payload.get("provenance") or {}
    if trace.get("source") == "freeform" or provenance.get("source") == "freeform":
        children.append(_node("Alert", {
            "title": "自由公式推断",
            "message": "此推导由 AI 自由构建，未经审校。请核实公式与单位。",
            "severity": "warning",
        }))
        children.append(_node("Badge", {
            "value": "AI-推导 / 未审校",
            "variant": "warning",
        }))
        # List symbols whose unit was inferred or unknown.
        unit_unknown = provenance.get("unit_unknown") or []
        inferred = provenance.get("inferred_units") or []
        if unit_unknown:
            children.append(_node("Text", {
                "value": f"单位未知符号: {', '.join(unit_unknown[:12])}",
                "size": "xs", "color": "muted",
            }))
        if inferred:
            children.append(_node("Text", {
                "value": f"单位已推断符号: {', '.join(inferred[:12])}",
                "size": "xs", "color": "muted",
            }))
        # parser_hash for auditability
        parser_hash = provenance.get("parser_hash")
        if parser_hash:
            children.append(_node("Text", {
                "value": f"parser: {parser_hash}",
                "size": "xs", "color": "muted",
            }))

    # ── Live-edit worksheet: editable inputs become Form controls. ──────
    editable = [
        binding for binding in (trace.get("variables") or [])
        if binding.get("editable") and binding.get("source") == "input"
    ]
    if editable:
        bounds = trace.get("input_bounds") or {}
        fields: list[dict[str, Any]] = []
        for binding in editable:
            name = str(binding.get("name"))
            symbol = str(binding.get("symbol", name))
            label = str(binding.get("display_name") or symbol)
            value = binding.get("value")
            value = float(value) if isinstance(value, (int, float)) else 0.0
            lo, hi = bounds.get(name, (None, None))
            if isinstance(lo, (int, float)) and isinstance(hi, (int, float)):
                fields.append(_node("Slider", {
                    "name": name, "label": label, "value": value,
                    "min": float(lo), "max": float(hi), "step": _slider_step(value, lo, hi),
                }))
            else:
                number_props: dict[str, Any] = {
                    "name": name, "label": label, "value": value,
                }
                if isinstance(lo, (int, float)):
                    number_props["min"] = float(lo)
                fields.append(_node("NumberInput", number_props))
        if trace.get("source") == "freeform" or provenance.get("source") == "freeform":
            expression = str(provenance.get("expression") or "")
            output_symbol = str(provenance.get("output_symbol") or "")
            unit_map = provenance.get("units") if isinstance(provenance.get("units"), dict) else {}
            content = (
                "请调用 ugsci_evaluate_formula 重新计算以下自由公式。"
                f"\nexpression: {expression}"
                f"\noutput_symbol: {output_symbol}"
                f"\nunits: {json.dumps(unit_map, ensure_ascii=False, sort_keys=True)}"
                "\ninputs:"
                + "".join(
                    f"\n{field['props']['name']}: {{{{ {field['props']['name']} }}}}"
                    for field in fields
                )
            )
        else:
            content = (
                f"重新计算 {trace.get('formula_id') or trace.get('title', '该推导')}，"
                f"使用以下输入："
                + "".join(
                    f"\n{field['props']['name']}: {{{{ {field['props']['name']} }}}}"
                    for field in fields
                )
            )
        input_units = trace.get("input_units") if isinstance(trace.get("input_units"), dict) else {}
        for key, value in input_units.items():
            content += f"\n{key}: {value}"
        children.append(_node("Form", {
            "formId": f"ugsci_ws_{_trace_ui_id(payload, trace)}",
            "title": "编辑输入并重新推导",
            "submitLabel": "重新计算",
            "action": {"type": "submit_form", "payload": {"content": content}},
        }, fields))

    # ── Derivation steps, grouped by workflow stage. ────────────────────
    children.append(_node("Heading", {"level": 3, "value": "推导过程"}))
    stage_order = ["assemble", "substitute", "reduce", "solve", "verify"]
    grouped: dict[str, list[tuple[int, dict[str, Any]]]] = {}
    ungrouped: list[tuple[int, dict[str, Any]]] = []
    for index, step in enumerate(steps):
        group = step.get("group") or ""
        # Bind steps are variable definitions already captured by the editable
        # fields and the variable registry; skip them entirely so the step list
        # shows only the actual derivation.
        if step.get("kind") == "bind":
            continue
        if group in stage_order:
            grouped.setdefault(group, []).append((index, step))
        else:
            ungrouped.append((index, step))

    for group in stage_order:
        entries = grouped.get(group)
        if not entries:
            continue
        children.append(_node("Divider", {"label": _STEP_GROUP_LABELS[group]}))
        for index, step in entries:
            children.append(_node("Card", {"title": ""}, _trace_step_body(step, index)))
    if ungrouped:
        for index, step in ungrouped:
            children.append(_node("Card", {"title": ""}, _trace_step_body(step, index)))

    # ── Result (headline answer after the derivation). ───────────────────
    children.append(_node("Divider", {"label": "计算结果"}))
    children.extend(_domain_result_children(payload))

    # ── Variable registry ───────────────────────────────────────────────
    variables = trace.get("variables") or []
    if variables:
        headers = ["variable", "值", "单位", "来源"]
        rows = []
        for binding in variables[:24]:
            value = binding.get("value")
            shown = _fmt(value) if isinstance(value, (int, float)) else str(value or "—")
            rows.append(_node("TableRow", {}, [
                _node("TableCell", {"value": str(binding.get("symbol"))}),
                _node("TableCell", {"value": shown}),
                _node("TableCell", {"value": binding.get("unit", "")}),
                _node("TableCell", {"value": str(binding.get("source", "")).replace("_", " ")}),
            ]))
            if len(rows) >= 24:
                break
        children.append(_node("Stack", {"gap": 8}, [
            _node("Heading", {"level": 3, "value": "变量汇总"}),
            _node("Table", {"headers": headers, "compact": True}, rows),
        ]))

    # ── Assumptions / applicability. ────────────────────────────────────
    assumptions = payload.get("assumptions")
    if isinstance(assumptions, list) and assumptions:
        children.append(_node("Accordion", {}, [
            _node("AccordionItem", {"header": "假设条件", "key": "assumptions"}, [
                _node("List", {}, [
                    _node("ListItem", {"value": str(item)}) for item in assumptions[:10]
                ]),
            ]),
        ]))
    applicability = payload.get("applicability")
    if isinstance(applicability, list) and applicability:
        children.append(_node("Accordion", {}, [
            _node("AccordionItem", {"header": "适用场景", "key": "applicability"}, [
                _node("List", {}, [
                    _node("ListItem", {"value": str(item)}) for item in applicability[:8]
                ]),
            ]),
        ]))

    # ── Warnings. ───────────────────────────────────────────────────────
    warnings = payload.get("warnings")
    if isinstance(warnings, list) and warnings:
        children.append(_node("Alert", {
            "title": "警告",
            "message": " · ".join(str(item) for item in warnings[:6]),
            "severity": "warning",
        }))

    return {"schemaVersion": "1", "root": _node("Stack", {"gap": 12}, children)}


def _domain_result_children(payload: dict[str, Any]) -> list[dict[str, Any]]:
    units = payload.get("units") if isinstance(payload.get("units"), dict) else {}
    metrics = payload.get("metrics") if isinstance(payload.get("metrics"), dict) else {}
    result = payload.get("result") if isinstance(payload.get("result"), dict) else {}

    metric_nodes = _metric_cards(metrics, units)
    if metric_nodes:
        return [_node("KpiBoard", {"columns": min(4, len(metric_nodes))}, metric_nodes)]

    scalar_source = result or {
        key: value for key, value in payload.items()
        if key not in _FIELD_SKIP
    }
    scalars = _scalar_stats(scalar_source, units)
    if scalars:
        return [_node("Grid", {"columns": min(4, len(scalars)), "gap": 8}, scalars)]
    return []


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
    # Traced derivations render through the observable trace workspace.
    trace = payload.get("trace")
    if isinstance(trace, dict):
        tree = build_trace_tree(payload)
        if tree is not None:
            try:
                envelope = store_validated_tree(
                    tree,
                    ui_id=_trace_ui_id(payload, trace),
                )
            except Exception as exc:
                logger.info("[ugsci.genui] trace card skipped: %s", exc)
                return payload
            merged = dict(payload)
            merged["genui"] = envelope
            return merged
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


__all__ = ["attach_genui", "build_domain_tree", "build_trace_tree"]
