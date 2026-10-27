# -*- coding: utf-8 -*-
"""The persisted workflow contract shared by the canvas and executor.

Canvas edges project into typed node inputs/control targets. \
Documents predating
canvas edges are upgraded from their references. Validation never \
executes tools
and may use the selected agent's dynamic node registry for schema \
checks.
"""
from __future__ import annotations

import copy
import math
from dataclasses import dataclass, field
from typing import Any, Iterable

from pydantic import BaseModel, Field

from .errors import ValidationError
from .types import resolve_template

# Retain the historical document helper as the same public resolver.
_resolve_template = resolve_template

CONTROL_TARGET_FIELDS = (
    "next",
    "else",
    "else_node",
    "on_reject",
    "error_handler",
    "pass_node",
    "fail_node",
    "retry_node",
    "exhausted_node",
)


class WorkflowDocument(BaseModel):
    id: str
    name: str = ""
    description: str = ""
    nodes: dict[str, dict[str, Any]] = Field(default_factory=dict)
    edges: list[dict[str, Any]] = Field(default_factory=list)
    inputs: list[dict[str, Any]] = Field(default_factory=list)
    outputs: list[str] | dict[str, Any] = Field(default_factory=list)
    start_id: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    version: str = "1.0"


@dataclass
class ValidationResult:
    ok: bool
    output_nodes: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)


def _is_link(value: Any) -> bool:
    # Include invalid negative/bool slots here so validation can reject them.
    # Two strings are ordinary array data, not a reference.
    return (
        isinstance(value, (list, tuple))
        and len(value) == 2
        and isinstance(value[0], str)
        and isinstance(value[1], int)
    )


def _links(value: Any, path: str = "") -> Iterable[tuple[str, Any, str]]:
    if _is_link(value):
        yield value[0], value[1], path
    elif isinstance(value, dict):
        for key, child in value.items():
            yield from _links(child, f"{path}.{key}" if path else str(key))
    elif isinstance(value, (list, tuple)):
        for index, child in enumerate(value):
            yield from _links(child, f"{path}[{index}]")


def canonicalize(data: dict[str, Any]) -> dict[str, Any]:
    """Return a non-mutating, idempotent executable projection of the canvas.

    Explicit edges, including [], own top-level wired sockets and \
control
    targets. Nested object bindings remain in their objects; \
ordering-only edges
    never replace those objects. Invalid edges are retained for error \
reporting.
    """
    result = copy.deepcopy(data)
    nodes = result.get("nodes")
    if not isinstance(nodes, dict):
        return result
    authoritative = "edges" in result
    raw_edges = result.get("edges", [])
    if not isinstance(raw_edges, list):
        raise ValidationError("'edges' must be an array")
    edges = []
    for index, edge in enumerate(raw_edges):
        if not isinstance(edge, dict):
            raise ValidationError(f"edge '{index}' must be an object")
        edge = dict(edge)
        for snake, camel in (
            ("source_handle", "sourceHandle"),
            ("target_handle", "targetHandle"),
            ("source_slot", "sourceSlot"),
        ):
            if snake not in edge and camel in edge:
                edge[snake] = edge[camel]
            edge.pop(camel, None)
        edge.setdefault("kind", "data")
        edge.setdefault("source_slot", 0)
        edges.append(edge)

    def add(
        source,
        target,
        *,
        kind="data",
        source_handle=None,
        target_handle=None,
        slot=0,
    ):
        candidate = {
            "source": source,
            "target": target,
            "kind": kind,
            "source_handle": source_handle,
            "target_handle": target_handle,
            "source_slot": slot,
        }
        if any(
            all(edge.get(key) == value for key, value in candidate.items())
            for edge in edges
        ):
            return
        candidate["id"] = f"e-{len(edges)}-{source}-{target}"
        edges.append(candidate)

    def survives(source, target, field_id, slot):
        return any(
            edge.get("source") == source
            and edge.get("target") == target
            and edge.get("kind", "data") == "data"
            and edge.get("source_slot", 0) == slot
            and edge.get("target_handle") in (None, "", field_id)
            for edge in edges
        )

    for nid, node in nodes.items():
        if not isinstance(node, dict):
            continue
        inputs, control = node.setdefault("inputs", {}), node.setdefault(
            "control",
            {},
        )
        if not isinstance(inputs, dict) or not isinstance(control, dict):
            continue
        if authoritative:
            for key, value in list(inputs.items()):
                if _is_link(value) and value[0] in nodes:
                    if not survives(value[0], nid, key, value[1]):
                        inputs.pop(key)
                elif (
                    isinstance(value, list)
                    and value
                    and all(_is_link(item) for item in value)
                ):
                    remaining = [
                        item
                        for item in value
                        if item[0] not in nodes
                        or survives(item[0], nid, key, item[1])
                    ]
                    if remaining:
                        inputs[key] = remaining
                    else:
                        inputs.pop(key)
            for key in CONTROL_TARGET_FIELDS:
                target = control.get(key)
                if isinstance(target, str) and target in nodes:
                    control.pop(key)
            conditions = control.get("conditions", [])
            if isinstance(conditions, list):
                for condition in conditions:
                    if isinstance(condition, dict):
                        for key in ("then", "then_node"):
                            target = condition.get(key)
                            if isinstance(target, str) and target in nodes:
                                condition.pop(key)
        else:
            for field_id, value in inputs.items():
                for upstream, slot, path in _links(value):
                    add(
                        upstream,
                        nid,
                        slot=slot,
                        target_handle=field_id
                        if not path and field_id != "__flow_dependencies"
                        else None,
                    )
            for key in CONTROL_TARGET_FIELDS:
                if control.get(key):
                    add(nid, control[key], kind="control", source_handle=key)
            conditions = control.get("conditions", [])
            if isinstance(conditions, list):
                for index, condition in enumerate(conditions):
                    if isinstance(condition, dict):
                        target = condition.get("then_node") or condition.get(
                            "then",
                        )
                        if target:
                            add(
                                nid,
                                target,
                                kind="control",
                                source_handle=f"condition:{index}",
                            )
        inputs.pop("__flow_dependencies", None)

    incoming: dict[str, list[list[Any]]] = {}
    for edge in edges:
        source, target = edge.get("source"), edge.get("target")
        if not isinstance(source, str) or not isinstance(target, str):
            continue
        if source not in nodes or target not in nodes:
            continue
        if not isinstance(nodes[source], dict) or not isinstance(
            nodes[target],
            dict,
        ):
            continue
        if edge.get("kind") == "control":
            control = nodes[source].get("control")
            handle = edge.get("source_handle")
            if not isinstance(control, dict):
                continue
            if handle in CONTROL_TARGET_FIELDS:
                control[handle] = target
            elif (
                isinstance(handle, str)
                and handle.startswith("condition:")
                and handle[10:].isdigit()
            ):
                index = int(handle[10:])
                conditions = control.get("conditions", [])
                if (
                    isinstance(conditions, list)
                    and index < len(conditions)
                    and isinstance(conditions[index], dict)
                ):
                    conditions[index]["then_node"] = target
            continue
        if edge.get("kind") != "data":
            continue
        inputs = nodes[target].get("inputs")
        if not isinstance(inputs, dict):
            continue
        reference = [source, edge.get("source_slot", 0)]
        dependencies = incoming.setdefault(target, [])
        if reference not in dependencies:
            dependencies.append(reference)
        handle = edge.get("target_handle")
        if isinstance(handle, str) and handle:
            inputs[handle] = reference
    for target, dependencies in incoming.items():
        nodes[target]["inputs"]["__flow_dependencies"] = dependencies
    result["edges"] = edges
    return result


def load(data: dict[str, Any] | str) -> WorkflowDocument:
    if isinstance(data, str):
        import json

        data = json.loads(data)
    if not isinstance(data, dict):
        raise ValidationError("workflow document must be a JSON object")
    data = canonicalize(data)
    if not data.get("id"):
        raise ValidationError("workflow document missing required 'id' field")
    nodes = data.get("nodes", {})
    if not isinstance(nodes, dict):
        raise ValidationError("'nodes' must be an object keyed by node id")
    for nid, node in nodes.items():
        if not isinstance(node, dict):
            raise ValidationError(f"node '{nid}' must be an object")
        node.setdefault("id", nid)
        node.setdefault("class_type", node.get("type") or "ToolNode")
        node.setdefault("inputs", {})
        node.setdefault("control", {})
        for key in ("inputs", "control"):
            if not isinstance(node[key], dict):
                raise ValidationError(f"node '{nid}' {key} must be an object")
    return WorkflowDocument.model_validate(data)


def _cycle_errors(graph: dict[str, set[str]], kind: str) -> list[str]:
    errors, color = [], {}
    for start in graph:
        if color.get(start):
            continue
        color[start] = 1
        stack = [(start, iter(sorted(graph[start])))]
        while stack:
            current, children = stack[-1]
            child = next(children, None)
            if child is None:
                color[current] = 2
                stack.pop()
            elif color.get(child) == 1:
                errors.append(
                    f"{kind} cycle detected: '{current}' -> '{child}'",
                )
            elif not color.get(child):
                color[child] = 1
                stack.append((child, iter(sorted(graph[child]))))
    return errors


def validate(
    doc: WorkflowDocument,
    *,
    registry: Any = None,
) -> ValidationResult:
    """Check structural invariants and, when supplied, current registry \
schemas."""
    from .io.types import types_compatible
    from .types import ConditionExpression

    nodes, errors = doc.nodes, []
    if not nodes:
        return ValidationResult(False, [], ["workflow has no nodes"])
    if doc.start_id is not None and doc.start_id not in nodes:
        errors.append(f"start node '{doc.start_id}' not in nodes")
    for spec in doc.inputs:
        name = spec.get("name")
        if isinstance(name, str) and name.startswith("__"):
            errors.append(
                f"workflow input '{name}' uses a reserved internal name",
            )
    schemas = {}
    for nid, node in nodes.items():
        class_type = node.get("class_type")
        if not isinstance(class_type, str) or not class_type:
            errors.append(
                f"node '{nid}' class_type must be a non-empty string",
            )
        elif registry is not None:
            cls = registry.get(class_type)
            if cls is None:
                errors.append(
                    f"node '{nid}' has unknown class_type '{class_type}'",
                )
            else:
                schemas[nid] = cls.get_schema()
    data_graph = {nid: set() for nid in nodes}
    control_graph = {nid: set() for nid in nodes}
    wired = set()
    for index, edge in enumerate(doc.edges):
        source, target = edge.get("source"), edge.get("target")
        label = edge.get("id", index)
        for name, nid in (("source", source), ("target", target)):
            if not isinstance(nid, str) or nid not in nodes:
                errors.append(
                    f"edge '{label}' references unknown {name} '{nid}'",
                )
        kind = edge.get("kind", "data")
        if kind == "data":
            slot, handle = edge.get("source_slot", 0), edge.get(
                "target_handle",
            )
            if isinstance(slot, bool) or not isinstance(slot, int) or slot < 0:
                errors.append(
                    f"edge '"
                    f"{label}"
                    f"' source_slot must be a non-negative integer",
                )
            source_handle = edge.get("source_handle")
            if isinstance(source, str) and source in schemas and source_handle:
                output_names = [
                    output.id or f"out{i}"
                    for i, output in enumerate(schemas[source].outputs)
                ]
                if source_handle not in output_names:
                    errors.append(
                        f"node '"
                        f"{source}"
                        f"' has no output socket '"
                        f"{source_handle}"
                        f"'",
                    )
                elif (
                    type(slot) is int
                    and output_names.index(source_handle) != slot
                ):
                    errors.append(
                        f"edge '"
                        f"{label}"
                        f"' source_handle and source_slot do "
                        f"not match",
                    )
            if isinstance(target, str) and isinstance(handle, str) and handle:
                if (target, handle) in wired:
                    errors.append(
                        f"node '"
                        f"{target}"
                        f"' input '"
                        f"{handle}"
                        f"' has multiple canvas bindings",
                    )
                wired.add((target, handle))
                if target in schemas and handle not in {
                    item.id for item in schemas[target].inputs
                }:
                    errors.append(
                        f"node '{target}' has no input socket '{handle}'",
                    )
        elif kind == "control":
            handle = edge.get("source_handle")
            control = (
                nodes.get(source, {}).get("control")
                if isinstance(source, str)
                else None
            )
            conditions = (
                control.get("conditions", [])
                if isinstance(control, dict)
                else []
            )
            valid_condition = (
                isinstance(handle, str)
                and handle.startswith("condition:")
                and handle[10:].isdigit()
                and isinstance(conditions, list)
                and int(handle[10:]) < len(conditions)
            )
            if handle not in CONTROL_TARGET_FIELDS and not valid_condition:
                errors.append(
                    f"edge '{label}' has invalid control handle '{handle}'",
                )
        else:
            errors.append(f"edge '{label}' has unknown kind '{kind}'")
    for nid, node in nodes.items():
        inputs, control = node.get("inputs", {}), node.get("control", {})
        if not isinstance(inputs, dict):
            errors.append(f"node '{nid}' inputs must be an object")
            inputs = {}
        if not isinstance(control, dict):
            errors.append(f"node '{nid}' control must be an object")
            control = {}
        for source, slot, path in _links(inputs):
            if source not in nodes:
                errors.append(
                    f"node '"
                    f"{nid}"
                    f"' input '"
                    f"{path}"
                    f"' references unknown node '"
                    f"{source}"
                    f"'",
                )
                continue
            data_graph[source].add(nid)
            if isinstance(slot, bool) or slot < 0:
                errors.append(
                    f"node '"
                    f"{nid}"
                    f"' input '"
                    f"{path}"
                    f"' output slot must be a non-negative integer",
                )
            elif (
                source in schemas
                and slot >= len(schemas[source].outputs)
                and not path.startswith("__flow_dependencies")
            ):
                errors.append(
                    f"node '"
                    f"{nid}"
                    f"' input '"
                    f"{path}"
                    f"' output slot "
                    f"{slot}"
                    f" does not exist on '"
                    f"{source}"
                    f"'",
                )
        if nid in schemas:
            for inp in schemas[nid].inputs:
                value = inputs.get(inp.id)
                if value is None:
                    if (
                        not inp.optional
                        and getattr(inp, "default", None) is None
                    ):
                        errors.append(
                            f"node '"
                            f"{nid}"
                            f"' required input '"
                            f"{inp.id}"
                            f"' is missing",
                        )
                    continue
                if _is_link(value):
                    source, slot = value
                    if (
                        source in schemas
                        and type(slot) is int
                        and 0 <= slot < len(schemas[source].outputs)
                    ):
                        upstream_type = (
                            schemas[source].outputs[slot].get_io_type()
                        )
                        if not types_compatible(
                            upstream_type,
                            inp.get_io_type(),
                        ):
                            errors.append(
                                f"node '"
                                f"{nid}"
                                f"' input '"
                                f"{inp.id}"
                                f"' type mismatch: "
                                f"{upstream_type}"
                                f" -> "
                                f"{inp.get_io_type()}",
                            )
                    continue
                if isinstance(value, str) and "${" in value:
                    continue
                io_type = inp.get_io_type()
                if io_type == "OBJECT" and not isinstance(value, dict):
                    errors.append(
                        f"node '{nid}' input '{inp.id}' must be an object",
                    )
                elif io_type == "ARRAY" and not isinstance(value, list):
                    errors.append(
                        f"node '{nid}' input '{inp.id}' must be an array",
                    )
                elif (
                    io_type in ("INT", "FLOAT")
                    and isinstance(value, (int, float))
                    and not math.isfinite(value)
                ):
                    errors.append(
                        f"node '{nid}' input '{inp.id}' must be finite",
                    )
                else:
                    try:
                        ok, detail = inp.validate(value)
                    except (TypeError, ValueError) as exc:
                        ok, detail = False, str(exc)
                    if not ok:
                        errors.append(
                            f"node '{nid}' input '{inp.id}': {detail}",
                        )
        bounded_refine = node.get("class_type") == "IterativeRefineNode"
        if bounded_refine:
            budget = inputs.get("max_iterations", 3)
            if type(budget) is not int or not 1 <= budget <= 20:
                errors.append(
                    f"node '"
                    f"{nid}"
                    f"' max_iterations must be a literal "
                    f"integer from 1 to 20",
                )
            for key in ("retry_node", "exhausted_node"):
                target = control.get(key)
                if not isinstance(target, str) or target not in nodes:
                    errors.append(
                        f"node '"
                        f"{nid}"
                        f"' requires an explicit control."
                        f"{key}"
                        f" target",
                    )
            if control.get("retry_node") == control.get("exhausted_node"):
                errors.append(
                    f"node '{nid}' retry and exhausted targets must differ",
                )
            if any(control.get(key) for key in ("next", "else", "else_node")):
                errors.append(
                    f"node '"
                    f"{nid}"
                    f"' must use retry_node/exhausted_node "
                    f"instead of next/else aliases",
                )
        for key in CONTROL_TARGET_FIELDS:
            target = control.get(key)
            if target is not None:
                if not isinstance(target, str) or target not in nodes:
                    errors.append(
                        f"node '"
                        f"{nid}"
                        f"' control."
                        f"{key}"
                        f" -> unknown node '"
                        f"{target}"
                        f"'",
                    )
                elif not (bounded_refine and key == "retry_node"):
                    control_graph[nid].add(target)
        conditions = control.get("conditions", [])
        if not isinstance(conditions, list):
            errors.append(f"node '{nid}' control.conditions must be an array")
        else:
            for index, condition in enumerate(conditions):
                if not isinstance(condition, dict):
                    errors.append(
                        f"node '{nid}' condition {index} must be an object",
                    )
                    continue
                target = condition.get("then_node") or condition.get("then")
                if not isinstance(target, str) or target not in nodes:
                    errors.append(
                        f"node '"
                        f"{nid}"
                        f"' condition "
                        f"{index}"
                        f" -> unknown node '"
                        f"{target}"
                        f"'",
                    )
                else:
                    control_graph[nid].add(target)
                expression = next(
                    (
                        condition[key]
                        for key in ("if", "if_expr", "condition", "expr")
                        if key in condition
                    ),
                    condition,
                )
                try:
                    ConditionExpression.model_validate(expression)
                except Exception:
                    errors.append(
                        f"node '"
                        f"{nid}"
                        f"' condition "
                        f"{index}"
                        f" has an invalid expression",
                    )
        branches = control.get("branches", [])
        if not isinstance(branches, list):
            errors.append(f"node '{nid}' control.branches must be an array")
        else:
            for index, branch in enumerate(branches):
                if not isinstance(branch, dict) or not isinstance(
                    branch.get("nodes", []),
                    list,
                ):
                    errors.append(
                        f"node '"
                        f"{nid}"
                        f"' branch "
                        f"{index}"
                        f" must contain a nodes array",
                    )
                    continue
                for target in branch.get("nodes", []):
                    if not isinstance(target, str) or target not in nodes:
                        errors.append(
                            f"node '"
                            f"{nid}"
                            f"' branch "
                            f"{index}"
                            f" -> unknown node '"
                            f"{target}"
                            f"'",
                        )
        for key, low, high, integer in (
            ("max_retries", 0, 10, True),
            ("retry_delay_sec", 0, 60, False),
            ("timeout_sec", 0, 86400, False),
        ):
            if key in control:
                value = control[key]
                valid = (
                    isinstance(value, (int, float))
                    and not isinstance(value, bool)
                    and math.isfinite(value)
                    and low <= value <= high
                    and (not integer or type(value) is int)
                    and (key != "timeout_sec" or value > 0)
                )
                if not valid:
                    errors.append(
                        f"node '"
                        f"{nid}"
                        f"' control."
                        f"{key}"
                        f" is outside its allowed range",
                    )
        if control.get("mode", "run") not in ("run", "mute", "bypass"):
            errors.append(
                f"node '{nid}' control.mode must be run, mute or bypass",
            )
    errors.extend(_cycle_errors(data_graph, "data dependency"))
    combined = {nid: data_graph[nid] | control_graph[nid] for nid in nodes}
    errors.extend(_cycle_errors(combined, "workflow"))
    output_nodes = list(
        dict.fromkeys(
            doc.outputs
            if isinstance(doc.outputs, list)
            else doc.outputs.keys(),
        ),
    )
    if not output_nodes:
        output_nodes = [nid for nid in nodes if not combined[nid]]
    for out in output_nodes:
        if out not in nodes:
            errors.append(f"output node '{out}' not in nodes")
    return ValidationResult(
        not errors,
        output_nodes,
        list(dict.fromkeys(errors)),
    )


def to_json(doc: WorkflowDocument) -> str:
    return doc.model_dump_json(indent=2)


def graph_hash(doc: WorkflowDocument) -> str:
    import hashlib
    import json

    payload = json.dumps(
        doc.model_dump(mode="json"),
        sort_keys=True,
        ensure_ascii=False,
        default=str,
    )
    return hashlib.md5(payload.encode("utf-8")).hexdigest()


__all__ = [
    "ValidationResult",
    "WorkflowDocument",
    "canonicalize",
    "graph_hash",
    "load",
    "to_json",
    "validate",
]
