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
from typing import Any, Iterable, cast

from pydantic import BaseModel, Field

from .errors import ValidationError
from .input_bindings import is_opaque_input, node_dependency_inputs
from .types import resolve_template
from .template_paths import (
    parse_template_path,
    template_expressions,
    template_node_sources,
)

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
    diagnostics: list[dict[str, Any]] = field(default_factory=list)

    @property
    def warnings(self) -> list[str]:
        return [
            item["message"]
            for item in self.diagnostics
            if item["severity"] == "warning"
        ]

    def add_error(
        self,
        legacy_message: str,
        *,
        code: str,
        message: str,
        **location: Any,
    ) -> None:
        """Keep old consumers working while exposing actionable diagnostics."""
        self.ok = False
        if legacy_message not in self.errors:
            self.errors.append(legacy_message)
        self.add_diagnostic(code, message, severity="error", **location)

    def add_diagnostic(
        self,
        code: str,
        message: str,
        *,
        severity: str = "warning",
        **location: Any,
    ) -> None:
        item = {
            "code": code,
            "severity": severity,
            "message": message,
            **{
                key: value
                for key, value in location.items()
                if value is not None
            },
        }
        if item not in self.diagnostics:
            self.diagnostics.append(item)

    def to_dict(self) -> dict[str, Any]:
        return {
            "ok": not self.errors,
            "errors": self.errors,
            "warnings": self.warnings,
            "diagnostics": self.diagnostics,
            "output_nodes": self.output_nodes,
        }


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


# pylint: disable-next=R0912,R0915
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

    # pylint: disable-next=R1702
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
                if is_opaque_input(node, field_id, value):
                    continue
                for upstream, slot, path in _links(value):
                    add(
                        upstream,
                        nid,
                        slot=slot,
                        target_handle=(
                            field_id
                            if not path and field_id != "__flow_dependencies"
                            else None
                        ),
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


def _cycle_errors(
    graph: dict[str, set[str]],
    kind: str,
) -> list[tuple[str, str, str]]:  # noqa: E501
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
                    (
                        f"{kind} cycle detected: '{current}' -> '{child}'",
                        current,
                        child,
                    ),
                )
            elif not color.get(child):
                color[child] = 1
                stack.append((child, iter(sorted(graph[child]))))
    return errors


# pylint: disable-next=R0912,R0915
def validate(
    doc: WorkflowDocument,
    *,
    registry: Any = None,
) -> ValidationResult:
    """Check structural invariants and, when supplied, current registry \
schemas."""
    from .io.types import types_compatible
    from .types import ConditionExpression

    nodes, result = doc.nodes, ValidationResult(True)
    if not nodes:
        result.add_error(
            "workflow has no nodes",
            code="FLOW_EMPTY",
            message="请先添加工作流节点。",
        )
        return result
    if doc.start_id is not None and doc.start_id not in nodes:
        result.add_error(
            f"start node '{doc.start_id}' not in nodes",
            code="START_NODE_MISSING",
            message="起始节点不存在，请重新选择。",
            node_id=doc.start_id,
            field="start_id",
        )
    for spec in doc.inputs:
        name = spec.get("name")
        if isinstance(name, str) and name.startswith("__"):
            result.add_error(
                f"workflow input '{name}' uses a reserved internal name",
                code="INPUT_NAME_RESERVED",
                message="工作流输入名称使用了保留的内部名称。",
                field=f"inputs.{name}",
            )
    schemas = {}
    for nid, node in nodes.items():
        class_type = node.get("class_type")
        if not isinstance(class_type, str) or not class_type:
            result.add_error(
                f"node '{nid}' class_type must be a non-empty string",
                code="NODE_TYPE_REQUIRED",
                message="请选择有效的节点类型。",
                node_id=nid,
                field="class_type",
            )
        elif registry is not None:
            cls = registry.get(class_type)
            if cls is None:
                result.add_error(
                    f"node '{nid}' has unknown class_type '{class_type}'",
                    code="NODE_TYPE_UNKNOWN",
                    message="节点类型不存在或未启用，请刷新目录。",
                    node_id=nid,
                    field="class_type",
                )
            else:
                schemas[nid] = cls.get_schema()
    data_graph = {nid: set() for nid in nodes}
    control_graph = {nid: set() for nid in nodes}
    wired = set()
    control_wired = set()

    def parsed_unavailable(source, slot):
        source_node = nodes.get(source) or {}
        return (
            slot in (1, "1")
            and source_node.get("class_type") == "LLMCallNode"
            and (source_node.get("inputs") or {}).get(
                "response_format",
                "text",
            )
            in (None, "", "text")
        )

    def input_edge(target, path, source, slot):
        for index, edge in enumerate(doc.edges):
            if (
                edge.get("kind", "data") == "data"
                and edge.get("source") == source
                and edge.get("target") == target
                and edge.get("source_slot", 0) == slot
                and edge.get("target_handle") in (None, "", path)
            ):
                return str(edge.get("id", index))
        return None

    for index, edge in enumerate(doc.edges):
        source, target = edge.get("source"), edge.get("target")
        label = edge.get("id", index)
        for name, nid in (("source", source), ("target", target)):
            if not isinstance(nid, str) or nid not in nodes:
                result.add_error(
                    f"edge '{label}' references unknown {name} '{nid}'",
                    code="EDGE_NODE_MISSING",
                    message="连线引用了不存在的节点。",
                    edge_id=str(label),
                    field=name,
                )
        kind = edge.get("kind", "data")
        if kind == "data":
            slot, handle = edge.get("source_slot", 0), edge.get(
                "target_handle",
            )
            if isinstance(slot, bool) or not isinstance(slot, int) or slot < 0:
                result.add_error(
                    (
                        "edge '"
                        f"{label}"
                        "' source_slot must be a non-negative integer"
                    ),
                    code="EDGE_SLOT_INVALID",
                    message="输出槽位必须是非负整数。",
                    edge_id=str(label),
                    field="source_slot",
                )
            source_handle = edge.get("source_handle")
            if isinstance(source, str) and source in schemas and source_handle:
                output_names = [
                    output.id or f"out{i}"
                    for i, output in enumerate(schemas[source].outputs)
                ]
                if source_handle not in output_names:
                    result.add_error(
                        (
                            "node '"
                            f"{source}"
                            "' has no output socket '"
                            f"{source_handle}"
                            "'"
                        ),
                        code="OUTPUT_PORT_UNKNOWN",
                        message="所选输出端口已不存在。",
                        edge_id=str(label),
                        node_id=source,
                        field=f"outputs.{source_handle}",
                    )
                elif (
                    type(slot) is int
                    and output_names.index(source_handle) != slot
                ):
                    result.add_error(
                        (
                            "edge '"
                            f"{label}"
                            "' source_handle and source_slot do not match"
                        ),
                        code="EDGE_SLOT_MISMATCH",
                        message="输出端口与输出槽位不一致。",
                        edge_id=str(label),
                        node_id=source,
                        field="source_slot",
                    )
            if isinstance(target, str) and isinstance(handle, str) and handle:
                if (target, handle) in wired:
                    result.add_error(
                        (
                            "node '"
                            f"{target}"
                            "' input '"
                            f"{handle}"
                            "' has multiple canvas bindings"
                        ),
                        code="INPUT_MULTIPLE_BINDINGS",
                        message="此输入端口只能连接一个上游输出。",
                        edge_id=str(label),
                        node_id=target,
                        field=f"inputs.{handle}",
                    )
                wired.add((target, handle))
                if (
                    target in schemas
                    and not schemas[target].accept_all_inputs
                    and handle
                    not in {item.id for item in schemas[target].inputs}
                ):
                    result.add_error(
                        f"node '{target}' has no input socket '{handle}'",
                        code="INPUT_PORT_UNKNOWN",
                        message="所选输入端口已不存在。",
                        edge_id=str(label),
                        node_id=target,
                        field=f"inputs.{handle}",
                    )
        elif kind == "control":
            handle = edge.get("source_handle")
            if isinstance(source, str) and isinstance(handle, str):
                if (source, handle) in control_wired:
                    result.add_error(
                        (
                            "node '"
                            f"{source}"
                            "' control '"
                            f"{handle}"
                            "' has multiple canvas bindings"
                        ),
                        code="CONTROL_MULTIPLE_BINDINGS",
                        message="此控制分支只能连接一个目标，请删除重复连线。",
                        node_id=source,
                        field=f"control.{handle}",
                        edge_id=str(label),
                    )
                control_wired.add((source, handle))
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
                result.add_error(
                    f"edge '{label}' has invalid control handle '{handle}'",
                    code="CONTROL_PORT_INVALID",
                    message="控制连线的分支端口无效。",
                    edge_id=str(label),
                    field=f"control.{handle}",
                )
        else:
            result.add_error(
                f"edge '{label}' has unknown kind '{kind}'",
                code="EDGE_KIND_UNKNOWN",
                message="连线类型必须是数据连线或控制连线。",
                edge_id=str(label),
                field="kind",
            )
    # pylint: disable-next=R1702
    for nid, node in nodes.items():
        inputs, control = node.get("inputs", {}), node.get("control", {})
        if not isinstance(inputs, dict):
            result.add_error(
                f"node '{nid}' inputs must be an object",
                code="NODE_INPUTS_INVALID",
                message="节点输入配置必须是对象。",
                node_id=nid,
                field="inputs",
            )
            inputs = {}
        if not isinstance(control, dict):
            result.add_error(
                f"node '{nid}' control must be an object",
                code="NODE_CONTROL_INVALID",
                message="节点执行配置必须是对象。",
                node_id=nid,
                field="control",
            )
            control = {}
        for source, slot, path in _links(node_dependency_inputs(node)):
            if source not in nodes:
                result.add_error(
                    (
                        "node '"
                        f"{nid}"
                        "' input '"
                        f"{path}"
                        "' references unknown node '"
                        f"{source}"
                        "'"
                    ),
                    code="INPUT_NODE_MISSING",
                    message="输入引用了不存在的上游节点。",
                    node_id=nid,
                    field=f"inputs.{path}",
                    edge_id=input_edge(nid, path, source, slot),
                )
                continue
            data_graph[source].add(nid)
            if isinstance(slot, bool) or slot < 0:
                result.add_error(
                    (
                        "node '"
                        f"{nid}"
                        "' input '"
                        f"{path}"
                        "' output slot must be a non-negative integer"
                    ),
                    code="INPUT_SLOT_INVALID",
                    message="输入引用的输出槽位必须是非负整数。",
                    node_id=nid,
                    field=f"inputs.{path}",
                    edge_id=input_edge(nid, path, source, slot),
                )
            elif (
                source in schemas
                and slot >= len(schemas[source].outputs)
                and not path.startswith("__flow_dependencies")
            ):
                result.add_error(
                    (
                        "node '"
                        f"{nid}"
                        "' input '"
                        f"{path}"
                        "' output slot "
                        f"{slot}"
                        " does not exist on '"
                        f"{source}"
                        "'"
                    ),
                    code="OUTPUT_SLOT_MISSING",
                    message="上游节点没有此输出槽位。",
                    node_id=nid,
                    field=f"inputs.{path}",
                    edge_id=input_edge(nid, path, source, slot),
                )
        for source, slot, path in _links(node_dependency_inputs(node)):
            if parsed_unavailable(source, slot):
                result.add_error(
                    f"node '{nid}' input '{path}' parsed output "
                    "is unavailable in text mode",
                    code="OUTPUT_SLOT_UNAVAILABLE",
                    message="parsed 输出仅在来源节点启用 json_schema 模式时可用。",
                    node_id=nid,
                    field=f"inputs.{path}",
                    edge_id=input_edge(nid, path, source, slot),
                )
        template_fields = {
            f"inputs.{key}": value
            for key, value in node_dependency_inputs(node).items()
        }
        template_fields.update(
            {f"control.{key}": value for key, value in control.items()},
        )
        for field_name, value in template_fields.items():
            try:
                for source in template_node_sources(value, nodes, strict=True):
                    data_graph[source].add(nid)
            except ValueError as exc:
                result.add_error(
                    f"node '{nid}' template: {exc}",
                    code="TEMPLATE_REFERENCE_INVALID",
                    message=f"变量引用无效：{exc}",
                    node_id=nid,
                    field=field_name,
                )
            for expression in template_expressions(value):
                try:
                    parts = parse_template_path(expression)
                except (ValueError, SyntaxError):
                    continue
                if (
                    len(parts) >= 3
                    and parts[0] == "output_slots"
                    and parsed_unavailable(parts[1], parts[2])
                ):
                    result.add_error(
                        f"node '{nid}' template parsed output "
                        "is unavailable in text mode",
                        code="OUTPUT_SLOT_UNAVAILABLE",
                        message="parsed 输出仅在来源节点启用 json_schema 模式时可用。",
                        node_id=nid,
                        field=field_name,
                    )
        if nid in schemas:
            schema = schemas[nid]
            if not schema.accept_all_inputs:
                unknown_inputs = (
                    set(inputs)
                    - {item.id for item in schema.inputs}
                    - {"__flow_dependencies"}
                )
                for name in sorted(unknown_inputs):
                    result.add_diagnostic(
                        "INPUT_UNKNOWN",
                        f"节点 {nid} 未声明输入 {name}，请核对节点支持的参数。",
                        node_id=nid,
                        field=f"inputs.{name}",
                    )
            source = inputs.get("source")
            if (
                node.get("class_type") == "ScriptNode"
                and isinstance(source, str)
                and "${" not in source
            ):
                from .adapter.script_worker import validate_source

                try:
                    validate_source(source)
                except (SyntaxError, ValueError) as exc:
                    result.add_error(
                        f"node '{nid}' script: {exc}",
                        code="SCRIPT_SOURCE_INVALID",
                        message=f"脚本语法或模块导入无效：{exc}",
                        node_id=nid,
                        field="inputs.source",
                    )
            for inp in schemas[nid].inputs:
                value = inputs.get(inp.id)
                if value is None:
                    if (
                        not inp.optional
                        and getattr(inp, "default", None) is None
                    ):
                        result.add_error(
                            (
                                "node '"
                                f"{nid}"
                                "' required input '"
                                f"{inp.id}"
                                "' is missing"
                            ),
                            code="INPUT_REQUIRED",
                            message="请填写必填输入或连接上游输出。",
                            node_id=nid,
                            field=f"inputs.{inp.id}",
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
                            result.add_error(
                                (
                                    "node '"
                                    f"{nid}"
                                    "' input '"
                                    f"{inp.id}"
                                    "' type mismatch: "
                                    f"{upstream_type}"
                                    " -> "
                                    f"{inp.get_io_type()}"
                                ),
                                code="INPUT_TYPE_MISMATCH",
                                message="上游输出类型与输入端口不兼容。",
                                node_id=nid,
                                field=f"inputs.{inp.id}",
                                edge_id=input_edge(nid, inp.id, source, slot),
                            )
                    continue
                if isinstance(value, str) and "${" in value:
                    continue
                io_type = inp.get_io_type()
                if io_type == "OBJECT" and not isinstance(value, dict):
                    result.add_error(
                        f"node '{nid}' input '{inp.id}' must be an object",
                        code="INPUT_TYPE_INVALID",
                        message="输入必须是对象。",
                        node_id=nid,
                        field=f"inputs.{inp.id}",
                    )
                elif io_type == "ARRAY" and not isinstance(value, list):
                    result.add_error(
                        f"node '{nid}' input '{inp.id}' must be an array",
                        code="INPUT_TYPE_INVALID",
                        message="输入必须是数组。",
                        node_id=nid,
                        field=f"inputs.{inp.id}",
                    )
                elif (
                    io_type in ("INT", "FLOAT")
                    and isinstance(value, (int, float))
                    and not math.isfinite(value)
                ):
                    result.add_error(
                        f"node '{nid}' input '{inp.id}' must be finite",
                        code="INPUT_NUMBER_INVALID",
                        message="输入必须是有限数值。",
                        node_id=nid,
                        field=f"inputs.{inp.id}",
                    )
                else:
                    try:
                        ok, detail = inp.validate(value)
                    except (TypeError, ValueError) as exc:
                        ok, detail = False, str(exc)
                    if not ok:
                        result.add_error(
                            f"node '{nid}' input '{inp.id}': {detail}",
                            code="INPUT_VALUE_INVALID",
                            message="输入值不符合字段的类型、范围或可选值要求。",
                            node_id=nid,
                            field=f"inputs.{inp.id}",
                        )
        bounded_refine = node.get("class_type") == "IterativeRefineNode"
        if bounded_refine:
            budget = inputs.get("max_iterations", 3)
            if type(budget) is not int or not 1 <= budget <= 20:
                result.add_error(
                    (
                        "node '"
                        f"{nid}"
                        "' max_iterations must be a literal integer from 1 to "
                        "20"
                    ),
                    code="ITERATION_BUDGET_INVALID",
                    message="迭代次数必须是 1 到 20 的整数。",
                    node_id=nid,
                    field="inputs.max_iterations",
                )
            for key in ("retry_node", "exhausted_node"):
                target = control.get(key)
                if not isinstance(target, str) or target not in nodes:
                    result.add_error(
                        (
                            "node '"
                            f"{nid}"
                            "' requires an explicit control."
                            f"{key}"
                            " target"
                        ),
                        code="ITERATION_TARGET_REQUIRED",
                        message="请配置重试目标与预算耗尽目标。",
                        node_id=nid,
                        field=f"control.{key}",
                    )
            if control.get("retry_node") == control.get("exhausted_node"):
                result.add_error(
                    f"node '{nid}' retry and exhausted targets must differ",
                    code="ITERATION_TARGET_CONFLICT",
                    message="重试目标与预算耗尽目标必须不同。",
                    node_id=nid,
                    field="control.exhausted_node",
                )
            if any(control.get(key) for key in ("next", "else", "else_node")):
                result.add_error(
                    (
                        "node '"
                        f"{nid}"
                        "' must use retry_node/exhausted_node instead of next/"
                        "else aliases"
                    ),
                    code="ITERATION_ROUTING_INVALID",
                    message="迭代节点须使用重试与预算耗尽端口。",
                    node_id=nid,
                    field="control",
                )
        for key in CONTROL_TARGET_FIELDS:
            target = control.get(key)
            if target is not None:
                if not isinstance(target, str) or target not in nodes:
                    result.add_error(
                        (
                            "node '"
                            f"{nid}"
                            "' control."
                            f"{key}"
                            " -> unknown node '"
                            f"{target}"
                            "'"
                        ),
                        code="CONTROL_TARGET_MISSING",
                        message="控制分支指向了不存在的节点。",
                        node_id=nid,
                        field=f"control.{key}",
                    )
                elif not (bounded_refine and key == "retry_node"):
                    control_graph[nid].add(target)
        conditions = control.get("conditions", [])
        if not isinstance(conditions, list):
            result.add_error(
                f"node '{nid}' control.conditions must be an array",
                code="CONDITIONS_INVALID",
                message="条件分支配置必须是数组。",
                node_id=nid,
                field="control.conditions",
            )
        else:
            for index, condition in enumerate(conditions):
                if not isinstance(condition, dict):
                    result.add_error(
                        f"node '{nid}' condition {index} must be an object",
                        code="CONDITION_INVALID",
                        message="条件分支配置必须是对象。",
                        node_id=nid,
                        field=f"control.conditions.{index}",
                    )
                    continue
                target = condition.get("then_node") or condition.get("then")
                if not isinstance(target, str) or target not in nodes:
                    result.add_error(
                        (
                            "node '"
                            f"{nid}"
                            "' condition "
                            f"{index}"
                            " -> unknown node '"
                            f"{target}"
                            "'"
                        ),
                        code="CONDITION_TARGET_MISSING",
                        message="条件分支指向了不存在的节点。",
                        node_id=nid,
                        field=f"control.conditions.{index}.then_node",
                    )
                else:
                    control_graph[nid].add(target)
                expression = next(
                    (
                        condition[key]
                        for key in ("if", "if_expr", "condition", "expr")
                        if key in condition
                    ),
                    cast(Any, condition),
                )
                try:
                    ConditionExpression.model_validate(expression)
                except Exception:
                    result.add_error(
                        (
                            "node '"
                            f"{nid}"
                            "' condition "
                            f"{index}"
                            " has an invalid expression"
                        ),
                        code="CONDITION_EXPRESSION_INVALID",
                        message="条件表达式无效，请检查运算符与参数。",
                        node_id=nid,
                        field=f"control.conditions.{index}",
                    )
        branches = control.get("branches", [])
        if not isinstance(branches, list):
            result.add_error(
                f"node '{nid}' control.branches must be an array",
                code="BRANCHES_INVALID",
                message="并行分支配置必须是数组。",
                node_id=nid,
                field="control.branches",
            )
        else:
            for index, branch in enumerate(branches):
                if not isinstance(branch, dict) or not isinstance(
                    branch.get("nodes", []),
                    list,
                ):
                    result.add_error(
                        (
                            "node '"
                            f"{nid}"
                            "' branch "
                            f"{index}"
                            " must contain a nodes array"
                        ),
                        code="BRANCH_INVALID",
                        message="并行分支必须包含节点数组。",
                        node_id=nid,
                        field=f"control.branches.{index}",
                    )
                    continue
                for target in branch.get("nodes", []):
                    if not isinstance(target, str) or target not in nodes:
                        result.add_error(
                            (
                                "node '"
                                f"{nid}"
                                "' branch "
                                f"{index}"
                                " -> unknown node '"
                                f"{target}"
                                "'"
                            ),
                            code="BRANCH_TARGET_MISSING",
                            message="并行分支引用了不存在的节点。",
                            node_id=nid,
                            field=f"control.branches.{index}.nodes",
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
                    result.add_error(
                        (
                            "node '"
                            f"{nid}"
                            "' control."
                            f"{key}"
                            " is outside its allowed range"
                        ),
                        code="EXECUTION_POLICY_INVALID",
                        message="执行策略超出允许范围。",
                        node_id=nid,
                        field=f"control.{key}",
                    )
        if control.get("mode", "run") not in ("run", "mute", "bypass"):
            result.add_error(
                f"node '{nid}' control.mode must be run, mute or bypass",
                code="EXECUTION_MODE_INVALID",
                message="执行模式必须是运行、静音或旁路。",
                node_id=nid,
                field="control.mode",
            )
    for message, source, _ in _cycle_errors(data_graph, "data dependency"):
        result.add_error(
            message,
            code="DATA_CYCLE",
            message="数据依赖存在循环，请移除回路。",
            node_id=source,
        )
    combined = {nid: data_graph[nid] | control_graph[nid] for nid in nodes}
    for message, source, _ in _cycle_errors(combined, "workflow"):
        result.add_error(
            message,
            code="WORKFLOW_CYCLE",
            message="工作流存在非有界循环，请检查控制连线。",
            node_id=source,
        )
    output_nodes = list(
        dict.fromkeys(
            (
                doc.outputs
                if isinstance(doc.outputs, list)
                else doc.outputs.keys()
            ),
        ),
    )
    if not output_nodes:
        output_nodes = [nid for nid in nodes if not combined[nid]]
    for out in output_nodes:
        if out not in nodes:
            result.add_error(
                f"output node '{out}' not in nodes",
                code="OUTPUT_NODE_MISSING",
                message="工作流输出引用了不存在的节点。",
                node_id=out,
                field="outputs",
            )
    result.output_nodes = output_nodes
    # Disconnected branches are legal. Surface authoring mistakes without
    # changing scheduling, bounded-loop or explicit-output semantics.
    incoming_nodes = {
        target for targets in combined.values() for target in targets
    }
    if len(nodes) > 1:
        for nid in nodes:
            if not combined[nid] and nid not in incoming_nodes:
                result.add_diagnostic(
                    "NODE_ISOLATED",
                    "此节点未与其他节点连接，请确认是否需要独立分支。",
                    node_id=nid,
                )
            elif doc.outputs and not combined[nid] and nid not in output_nodes:
                result.add_diagnostic(
                    "TERMINAL_OUTPUT_UNUSED",
                    "此分支的末端节点未列入工作流输出，请确认结果是否需要保留。",
                    node_id=nid,
                    field="outputs",
                )
    return result


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
