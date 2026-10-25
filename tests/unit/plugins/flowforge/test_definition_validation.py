"""Canvas and engine validation, including dynamic tool schemas."""
from __future__ import annotations

import copy
from types import SimpleNamespace

import pytest

from qwenpaw.plugins_bundle.flowforge.engine import (
    WorkflowExecutor,
    canonicalize,
    load,
    validate,
)
from qwenpaw.plugins_bundle.flowforge.engine.errors import ValidationError
from qwenpaw.plugins_bundle.flowforge.engine.adapter.tool_base import BaseTool
from qwenpaw.plugins_bundle.flowforge.engine.nodes.tool_factory import (
    build_node_class,
)


@pytest.fixture
def registry():
    return WorkflowExecutor().node_registry


def output(value="result"):
    return {"class_type": "OutputNode", "inputs": {"value": value}}


def check(nodes, registry, **kwargs):
    return validate(
        load({"id": "validation", "nodes": nodes, **kwargs}), registry=registry
    )


def test_unknown_nodes_and_required_inputs_are_rejected(registry):
    result = check(
        {
            "unknown": {"class_type": "InventedTool"},
            "out": {"class_type": "OutputNode"},
        },
        registry,
    )
    assert not result.ok
    assert any("unknown class_type" in error for error in result.errors)
    assert any("required input 'value'" in error for error in result.errors)


@pytest.mark.parametrize("slot", [-1, True, 1])
def test_output_slot_validation(registry, slot):
    result = check(
        {"source": output(), "sink": output(["source", slot])}, registry
    )
    assert not result.ok
    assert any("output slot" in error for error in result.errors)


def test_literal_two_string_array_is_not_a_link(registry):
    result = check({"out": output(["first", "second"])}, registry)
    assert result.ok, result.errors


def test_recursive_references_and_cycles_are_checked(registry):
    result = check(
        {"a": output({"nested": ["b", 0]}), "b": output(["a", 0])}, registry
    )
    assert not result.ok
    assert any("data dependency cycle" in error for error in result.errors)
    missing = check(
        {"a": output({"nested": [{"deep": ["missing", 0]}]})}, registry
    )
    assert not missing.ok
    assert any("nested[0].deep" in error for error in missing.errors)


def test_required_input_types_and_link_compatibility(registry):
    scalar = check(
        {"input": {"class_type": "InputNode", "inputs": {"name": False}}},
        registry,
    )
    assert not scalar.ok
    result = check(
        {
            "source": {"class_type": "StartNode"},
            "sink": {
                "class_type": "InputNode",
                "inputs": {"name": ["source", 0]},
            },
        },
        registry,
    )
    assert not result.ok
    assert any(
        "type mismatch: OBJECT -> STRING" in error for error in result.errors
    )


def test_deleting_last_canvas_edge_removes_dependency_without_mutating_caller(
    registry,
):
    canonical = canonicalize(
        {"id": "remove", "nodes": {"a": output(), "b": output(["a", 0])}}
    )
    canonical["edges"] = []
    before = copy.deepcopy(canonical)
    projected = canonicalize(canonical)
    assert "value" not in projected["nodes"]["b"]["inputs"]
    assert "__flow_dependencies" not in projected["nodes"]["b"]["inputs"]
    assert canonical == before
    assert not validate(load(projected), registry=registry).ok


def test_camel_case_edges_project_typed_sockets_idempotently(registry):
    canonical = canonicalize(
        {
            "id": "camel",
            "nodes": {"a": output(), "b": {"class_type": "OutputNode"}},
            "edges": [
                {
                    "source": "a",
                    "target": "b",
                    "targetHandle": "value",
                    "sourceSlot": 0,
                }
            ],
        }
    )
    assert canonical["nodes"]["b"]["inputs"]["value"] == ["a", 0]
    assert canonicalize(canonical) == canonical
    assert validate(load(canonical), registry=registry).ok


def test_legacy_ordering_only_edges_preserve_socket_bindings(registry):
    result = check(
        {"a": output(), "b": output(["a", 0])},
        registry,
        edges=[{"source": "a", "target": "b"}],
    )
    assert result.ok, result.errors


def test_control_targets_are_removed_with_canvas_edges():
    canonical = canonicalize(
        {
            "id": "remove-control",
            "nodes": {
                "a": {**output(), "control": {"next": "b"}},
                "b": output(),
            },
        }
    )
    canonical["edges"] = []
    assert "next" not in canonicalize(canonical)["nodes"]["a"]["control"]


def test_dangling_edges_unknown_sockets_and_duplicate_bindings_fail(registry):
    result = check(
        {"a": output(), "b": output()},
        registry,
        edges=[
            {"source": "missing", "target": "b"},
            {"source": "a", "target": "b", "target_handle": "typo"},
            {
                "source": "a",
                "target": "b",
                "source_handle": "typo",
                "target_handle": "value",
            },
            {"source": "a", "target": "b", "target_handle": "value"},
        ],
    )
    assert not result.ok
    assert any("unknown source" in error for error in result.errors)
    assert any("no input socket" in error for error in result.errors)
    assert any("no output socket" in error for error in result.errors)
    assert any("multiple canvas bindings" in error for error in result.errors)


def test_ordinary_control_cycle_and_invalid_condition_fail(registry):
    cycle = check(
        {
            "a": {**output(), "control": {"next": "b"}},
            "b": {**output(), "control": {"next": "a"}},
        },
        registry,
    )
    assert not cycle.ok
    assert any("workflow cycle" in error for error in cycle.errors)
    malformed = check(
        {
            "gate": {
                "class_type": "ConditionNode",
                "control": {
                    "conditions": [{"if": "probably true", "then_node": "out"}]
                },
            },
            "out": output(),
        },
        registry,
    )
    assert not malformed.ok
    assert any("invalid expression" in error for error in malformed.errors)


@pytest.mark.parametrize(
    "key,value",
    [
        ("max_retries", 11),
        ("max_retries", True),
        ("retry_delay_sec", -1),
        ("timeout_sec", 0),
        ("timeout_sec", float("inf")),
    ],
)
def test_execution_policy_is_finite_and_bounded(registry, key, value):
    result = check({"out": {**output(), "control": {key: value}}}, registry)
    assert not result.ok
    assert any(f"control.{key}" in error for error in result.errors)


@pytest.mark.parametrize(
    "key", ["pass_node", "fail_node", "retry_node", "exhausted_node"]
)
def test_business_control_targets_cannot_dangle(registry, key):
    result = check(
        {"out": {**output(), "control": {key: "missing"}}}, registry
    )
    assert not result.ok
    assert any(f"control.{key}" in error for error in result.errors)


def test_only_explicit_bounded_refine_retry_edge_is_allowed(registry):
    nodes = {
        "work": {**output(), "control": {"next": "refine"}},
        "refine": {
            "class_type": "IterativeRefineNode",
            "inputs": {"max_iterations": 2},
            "control": {"retry_node": "work", "exhausted_node": "done"},
        },
        "done": output(),
    }
    valid = check(nodes, registry)
    assert valid.ok, valid.errors
    nodes["refine"]["inputs"]["max_iterations"] = "${inputs.budget}"
    assert not check(nodes, registry).ok
    nodes["refine"]["inputs"]["max_iterations"] = 2
    nodes["refine"]["control"]["exhausted_node"] = "work"
    assert not check(nodes, registry).ok


def test_quality_gate_edges_roundtrip(registry):
    raw = {
        "id": "quality",
        "nodes": {
            "gate": {
                "class_type": "QualityGateNode",
                "inputs": {"score": 0.8},
                "control": {"pass_node": "passed", "fail_node": "failed"},
            },
            "passed": output(),
            "failed": output(),
        },
    }
    canonical = canonicalize(raw)
    assert canonicalize(canonical) == canonical
    assert validate(load(canonical), registry=registry).ok
    assert {edge["source_handle"] for edge in canonical["edges"]} == {
        "pass_node",
        "fail_node",
    }


@pytest.mark.parametrize("patch", [{"inputs": []}, {"control": []}])
def test_malformed_node_fields_fail_with_precise_error(patch):
    with pytest.raises(ValidationError, match="must be an object"):
        load(
            {
                "id": "bad",
                "nodes": {"bad": {"class_type": "OutputNode", **patch}},
            }
        )


def test_dynamic_tool_schema_and_colliding_control_fields_remain_supported(
    registry,
):
    async def report(output: str, count: int):
        return f"{output}:{count}"

    descriptor = SimpleNamespace(
        name="report", func=report, description="Report", metadata={}
    )
    tool = BaseTool(descriptor)
    node_class = build_node_class(tool)
    registry.register(node_class)
    schema = node_class.get_schema()
    assert schema.metadata["control_inputs"]["output"] == "__flow_output"
    valid = check(
        {
            "tool": {
                "class_type": "Tool.report",
                "inputs": {"output": "report.csv", "count": 3},
            }
        },
        registry,
    )
    assert valid.ok, valid.errors
    invalid = check(
        {
            "tool": {
                "class_type": "Tool.report",
                "inputs": {"output": "report.csv", "count": False},
            }
        },
        registry,
    )
    assert not invalid.ok
    assert any("count" in error for error in invalid.errors)


def test_reserved_workflow_inputs_cannot_inject_review_state(registry):
    document = load(
        {
            "id": "reserved-input",
            "nodes": {"out": output()},
            "inputs": [{"name": "__resume__", "default": {"approved": True}}],
        }
    )
    result = validate(document, registry=registry)
    assert not result.ok
    assert any("reserved internal name" in error for error in result.errors)
