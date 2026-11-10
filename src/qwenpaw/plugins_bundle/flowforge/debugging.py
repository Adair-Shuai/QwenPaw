# -*- coding: utf-8 -*-
"""Explicit, run-scoped plans for testing saved workflow nodes."""

from __future__ import annotations

import copy
import json
from typing import Any

from .engine.document import _links, canonicalize, load
from .engine.graph import DynamicPrompt, TopologicalSort
from .engine.input_bindings import node_dependency_inputs
from .engine.template_paths import (
    parse_template_path,
    template_expressions,
    template_node_sources,
)
from .flow_repository import RevisionConflict


def _json_value(value: Any, path: str) -> None:
    try:
        json.dumps(value, ensure_ascii=False, allow_nan=False)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{path} must contain finite JSON values") from exc


def _matches_type(value: Any, io_type: str) -> bool:
    """Validate JSON test outputs against their declared socket types."""
    if io_type in {"*", "ANY", "MULTI", "UNKNOWN"}:
        return True
    if "," in io_type:
        return any(_matches_type(value, item) for item in io_type.split(","))
    if io_type in {"FLOAT", "NUMBER"}:
        return isinstance(value, (int, float)) and not isinstance(value, bool)
    if io_type in {"INT", "INTEGER"}:
        return isinstance(value, int) and not isinstance(value, bool)
    types = {
        "STRING": str,
        "COMBO": str,
        "BOOLEAN": bool,
        "OBJECT": dict,
        "ARRAY": list,
        "FILE": str,
        "DATETIME": str,
        "IMAGE": dict,
        "VIDEO": dict,
        "AUDIO": dict,
        "MESH3D": dict,
    }
    expected = types.get(io_type)
    return expected is None or isinstance(value, expected)


def prepare_debug_plan(
    payload: dict[str, Any],
    registry: Any,
    *,
    mode: str,
    target_node_id: str,
    expected_revision: int,
    pins: dict[str, list[Any]] | None = None,
    node_inputs: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Validate a test request before any node or external capability runs."""
    # pylint: disable=too-many-branches,too-many-statements
    if mode not in {"node", "until"}:
        raise ValueError("debug.mode must be 'node' or 'until'")
    revision = payload.get("revision", 0)
    if type(expected_revision) is not int or expected_revision != revision:
        raise RevisionConflict(
            f"Workflow revision changed (current revision {revision})",
        )
    payload = canonicalize(payload)
    nodes = payload.get("nodes") or {}
    if target_node_id not in nodes:
        raise ValueError(f"debug.target_node_id '{target_node_id}' not found")
    pins = copy.deepcopy(pins or {})
    overrides = copy.deepcopy(node_inputs or {})
    _json_value(pins, "debug.pins")
    _json_value(overrides, "debug.node_inputs")
    if target_node_id in pins:
        raise ValueError(
            "debug target must be executed; unpin this node first",
        )
    for node_id, values in pins.items():
        if node_id not in nodes:
            raise ValueError(f"debug.pins.{node_id}: node not found")
        node_cls = registry.get(nodes[node_id].get("class_type"))
        if node_cls is None:
            raise ValueError(f"debug.pins.{node_id}: node type is unavailable")
        schema = node_cls.get_schema()
        control = nodes[node_id].get("control") or {}
        if schema.node_id in {
            "ConditionNode",
            "HumanReviewNode",
            "QualityGateNode",
            "IterativeRefineNode",
            "ParallelNode",
            "ErrorHandlerNode",
        } or any(
            key in control
            for key in (
                "conditions",
                "branches",
                "else",
                "else_node",
                "on_reject",
                "pass_node",
                "fail_node",
                "retry_node",
                "exhausted_node",
            )
        ):
            raise ValueError(
                f"debug.pins.{node_id}: control-flow nodes cannot be pinned",
            )
        text_output = nodes[node_id].get("class_type") == "LLMCallNode" and (
            nodes[node_id].get("inputs") or {}
        ).get("response_format", "text") in (None, "", "text")
        expected_slots = 1 if text_output else len(schema.outputs)
        if not isinstance(values, list) or len(values) != expected_slots:
            raise ValueError(
                f"debug.pins.{node_id}: expected {expected_slots} "
                "output slots",
            )
        for slot, (value, output) in enumerate(zip(values, schema.outputs)):
            io_type = output.get_io_type()
            valid = (
                isinstance(value, list)
                and all(_matches_type(item, io_type) for item in value)
                if output.is_list
                else _matches_type(value, io_type)
            )
            if not valid:
                raise ValueError(
                    f"debug.pins.{node_id}[{slot}] must match {io_type}",
                )
    node_cls = registry.get(nodes[target_node_id].get("class_type"))
    if node_cls is None:
        raise ValueError("debug target node type is unavailable")
    schema = node_cls.get_schema()
    for name, value in overrides.items():
        field = schema.get_input(name)
        if name.startswith("__") or (
            field is None and not schema.accept_all_inputs
        ):
            raise ValueError(f"debug.node_inputs.{name}: unknown input")
        if field is not None:
            valid, error = field.validate(value)
            values = (
                value
                if getattr(field, "multiselect", False)
                and isinstance(value, list)
                else [value]
            )
            allow_none = field.optional or (
                getattr(field, "default", None) is not None
            )
            typed = all(
                _matches_type(item, field.get_io_type())
                or (item is None and allow_none)
                for item in values
            )
            if not valid or not typed:
                raise ValueError(
                    f"debug.node_inputs.{name}: {error or 'type mismatch'}",
                )

    dependency_nodes = copy.deepcopy(nodes)
    target = dependency_nodes[target_node_id]
    target["inputs"] = {
        name: value
        for name, value in node_dependency_inputs(target).items()
        if name not in overrides and name != "__flow_dependencies"
    }
    overridden_links = {
        (source, slot)
        for name in overrides
        for source, slot, _ in _links(
            node_dependency_inputs(nodes[target_node_id]).get(name),
        )
    }
    remaining_links = {
        (source, slot) for source, slot, _ in _links(target["inputs"])
    }
    for edge in payload.get("edges") or []:
        if (
            edge.get("kind", "data") == "data"
            and edge.get("target") == target_node_id
            and edge.get("target_handle") not in overrides
            and (edge.get("source"), edge.get("source_slot", 0))
            not in overridden_links - remaining_links
        ):
            target["inputs"].setdefault("__flow_dependencies", []).append(
                [edge["source"], edge.get("source_slot", 0)],
            )
    topo = TopologicalSort(DynamicPrompt(dependency_nodes))
    template_dependencies: dict[str, list[str]] = {}

    def template_sources(node_id: str) -> list[str]:
        definition = dependency_nodes[node_id]
        return template_node_sources(
            {
                "inputs": node_dependency_inputs(definition),
                "control": definition.get("control") or {},
            },
            dependency_nodes,
            strict=True,
        )

    allowed: set[str] = set()
    needed_pins: dict[str, list[Any]] = {}
    stack = [target_node_id]
    while stack:
        node_id = stack.pop()
        if node_id in allowed:
            continue
        allowed.add(node_id)
        if node_id in pins:
            needed_pins[node_id] = pins[node_id]
            continue
        sources = template_sources(node_id)
        if sources:
            template_dependencies[node_id] = sources
        references = topo.upstream_of(node_id) + [
            (source, 0) for source in sources
        ]
        for source, slot in references:
            if source not in nodes or slot < 0:
                raise ValueError(f"debug node '{node_id}' has an invalid link")
            if mode == "node" and source not in pins:
                raise ValueError(
                    f"debug node '{node_id}' requires pinned output "
                    f"'{source}[{slot}]' or an explicit node input",
                )
            stack.append(source)
        if mode == "until":
            stack.extend(topo.control_predecessors_of(node_id))
    return {
        "mode": mode,
        "target_node_id": target_node_id,
        "source_revision": revision,
        "allowed_nodes": sorted(allowed),
        "pins": needed_pins,
        "node_inputs": overrides,
        "template_dependencies": {
            node_id: sources
            for node_id, sources in template_dependencies.items()
            if node_id in allowed and node_id not in needed_pins
        },
    }


def debug_summary(plan: dict[str, Any]) -> dict[str, Any]:
    return {
        key: copy.deepcopy(plan[key])
        for key in ("mode", "target_node_id", "source_revision")
    } | {"pinned_node_ids": sorted(plan["pins"])}


def debug_document(payload: dict[str, Any], plan: dict[str, Any]):
    """Build an isolated executable view while preserving the stored flow."""
    doc = load(payload).model_copy(deep=True)
    doc.outputs = [plan["target_node_id"]]
    allowed = set(plan["allowed_nodes"])
    if doc.start_id not in allowed or plan["mode"] == "node":
        doc.start_id = plan["target_node_id"]
    for node_id, sources in plan.get("template_dependencies", {}).items():
        for source in sources:
            doc.nodes[node_id]["inputs"].setdefault(
                "__flow_dependencies",
                [],
            ).append([source, 0])
            doc.edges.append(
                {
                    "id": f"debug-template-{source}-{node_id}",
                    "source": source,
                    "target": node_id,
                    "kind": "data",
                    "source_slot": 0,
                },
            )
    input_names: set[str] = set()
    for node_id in allowed - set(plan["pins"]):
        node = copy.deepcopy(doc.nodes[node_id])
        if node_id == plan["target_node_id"]:
            node["inputs"].update(plan["node_inputs"])
        if node.get("class_type") == "InputNode":
            name = node["inputs"].get("name")
            if isinstance(name, str):
                input_names.add(name)
        for expression in template_expressions(
            {
                "inputs": node_dependency_inputs(node),
                "control": node.get("control") or {},
            },
        ):
            parts = parse_template_path(expression)
            name = (
                parts[1]
                if parts[0] in {"input", "inputs"} and len(parts) > 1
                else parts[0]
            )
            if isinstance(name, str):
                input_names.add(name)
    doc.inputs = [
        field for field in doc.inputs if field.get("name") in input_names
    ]
    return doc


def debug_validation_document(doc: Any, plan: dict[str, Any], registry: Any):
    """Validate the execution boundary without requiring unrelated inputs."""
    validation_doc = doc.model_copy(deep=True)
    allowed = set(plan["allowed_nodes"])
    for node_id in validation_doc.nodes:
        if node_id not in allowed:
            validation_doc.nodes[node_id] = {
                "class_type": "InputNode",
                "inputs": {"name": "debug-boundary"},
                "control": {},
            }
        elif node_id in plan["pins"]:
            node = validation_doc.nodes[node_id]
            schema = registry.get(node["class_type"]).get_schema()
            node["inputs"] = {
                field.id: "${inputs.__debug_test_value}"
                for field in schema.inputs
            }
            node["control"] = {}
    target = validation_doc.nodes[plan["target_node_id"]]
    target["inputs"].pop("__flow_dependencies", None)
    for name, value in plan["node_inputs"].items():
        target["inputs"][name] = (
            "${inputs.__debug_test_value}"
            if value is None or next(iter(_links(value)), None) is not None
            else copy.deepcopy(value)
        )
    validation_doc.edges = [
        edge
        for edge in validation_doc.edges
        if edge.get("source") in allowed
        and edge.get("target") not in plan["pins"]
        and (
            edge.get("kind", "data") == "control"
            or edge.get("target") in allowed
        )
        and not (
            edge.get("target") == plan["target_node_id"]
            and edge.get("target_handle") in plan["node_inputs"]
        )
    ]
    return validation_doc
