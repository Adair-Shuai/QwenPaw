# -*- coding: utf-8 -*-
"""Actionable validation through the actual scoped workflow service."""

import copy
import importlib

import pytest


@pytest.fixture(params=["qwenpaw.plugins_bundle", "plugins.bundle"])
def service(request, tmp_path):
    module = importlib.import_module(f"{request.param}.flowforge.service")
    instance = module.WorkflowService(flows_dir=tmp_path)
    yield instance
    instance.close(timeout=3)


def output(value="done", **kwargs):
    return {"class_type": "OutputNode", "inputs": {"value": value}, **kwargs}


def test_required_inputs_have_stable_codes_and_field_locations(service):
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=redefined-outer-name
    payload = {
        "id": "diagnostics",
        "nodes": {"expert": {"class_type": "AgentNode"}},
    }
    before = copy.deepcopy(payload)
    result = service.validate_flow(payload)
    assert not result["ok"]
    assert payload == before
    assert any(
        "required input 'agent_id'" in item for item in result["errors"]
    )
    assert {
        (item["code"], item.get("node_id"), item.get("field"))
        for item in result["diagnostics"]
    } >= {
        ("INPUT_REQUIRED", "expert", "inputs.agent_id"),
        ("INPUT_REQUIRED", "expert", "inputs.query"),
    }
    assert all(item["severity"] == "error" for item in result["diagnostics"])


def test_edge_type_diagnostic_identifies_the_canvas_edge(service):
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=redefined-outer-name
    result = service.validate_flow(
        {
            "id": "types",
            "nodes": {
                "source": {"class_type": "StartNode"},
                "sink": {"class_type": "InputNode"},
            },
            "edges": [
                {
                    "id": "chosen-edge",
                    "source": "source",
                    "target": "sink",
                    "target_handle": "name",
                },
            ],
        },
    )
    diagnostic = next(
        item
        for item in result["diagnostics"]
        if item["code"] == "INPUT_TYPE_MISMATCH"
    )
    assert diagnostic["edge_id"] == "chosen-edge"
    assert diagnostic["node_id"] == "sink"
    assert diagnostic["field"] == "inputs.name"
    assert any("OBJECT -> STRING" in item for item in result["errors"])


def test_duplicate_control_binding_is_rejected_instead_of_last_edge_winning(
    service,
):
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=redefined-outer-name
    result = service.validate_flow(
        {
            "id": "control-collision",
            "nodes": {"start": output(), "a": output(), "b": output()},
            "edges": [
                {
                    "id": "first",
                    "source": "start",
                    "target": "a",
                    "kind": "control",
                    "source_handle": "next",
                },
                {
                    "id": "second",
                    "source": "start",
                    "target": "b",
                    "kind": "control",
                    "source_handle": "next",
                },
            ],
        },
    )
    assert not result["ok"]
    diagnostic = next(
        item
        for item in result["diagnostics"]
        if item["code"] == "CONTROL_MULTIPLE_BINDINGS"
    )
    assert diagnostic["edge_id"] == "second"
    assert diagnostic["field"] == "control.next"


def test_independent_nodes_warn_without_changing_validity(service):
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=redefined-outer-name
    result = service.validate_flow(
        {"id": "branches", "nodes": {"a": output(0), "b": output(False)}},
    )
    assert result["ok"]
    assert result["errors"] == []
    assert set(result["output_nodes"]) == {"a", "b"}
    assert len(result["warnings"]) == 2
    assert {item["node_id"] for item in result["diagnostics"]} == {"a", "b"}
    assert {item["code"] for item in result["diagnostics"]} == {
        "NODE_ISOLATED",
    }


def test_bounded_refine_loop_remains_valid_with_diagnostics(service):
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=redefined-outer-name
    result = service.validate_flow(
        {
            "id": "bounded",
            "nodes": {
                "work": output(control={"next": "refine"}),
                "refine": {
                    "class_type": "IterativeRefineNode",
                    "inputs": {"max_iterations": 2},
                    "control": {
                        "retry_node": "work",
                        "exhausted_node": "done",
                    },
                },
                "done": output(),
            },
        },
    )
    assert result["ok"], result
    assert not result["diagnostics"]


def test_unavailable_capability_and_invalid_document_keep_uniform_contract(
    service,
):
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=redefined-outer-name
    result = service.validate_flow(
        {
            "id": "tool",
            "nodes": {
                "tool": {
                    "class_type": "ToolNode",
                    "inputs": {"tool_name": "missing"},
                },
            },
        },
    )
    assert any(
        item["code"] == "TOOL_UNAVAILABLE"
        and item["node_id"] == "tool"
        and item["field"] == "inputs.tool_name"
        for item in result["diagnostics"]
    )
    malformed = service.validate_flow({"id": "bad", "nodes": []})
    assert not malformed["ok"]
    assert malformed["errors"]
    assert malformed["diagnostics"][0]["code"] == "DOCUMENT_INVALID"
    assert malformed["warnings"] == []


def test_flexible_schema_keeps_arbitrary_input_ports(service):
    # Exercise real internals and verify lifecycle state in this test.
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=protected-access
    # pylint: disable=redefined-outer-name
    engine = importlib.import_module(
        service.__class__.__module__.rsplit(".", 1)[0] + ".engine",
    )
    base = importlib.import_module(
        service.__class__.__module__.rsplit(".", 1)[0] + ".engine.nodes.base",
    )

    class Flexible(base.WorkflowNode):
        @classmethod
        def define_schema(cls):
            return engine.Schema(node_id="Flexible", accept_all_inputs=True)

    service._executor.node_registry.register(Flexible)
    result = service.validate_flow(
        {
            "id": "flexible",
            "nodes": {"source": output(), "sink": {"class_type": "Flexible"}},
            "edges": [
                {
                    "source": "source",
                    "target": "sink",
                    "target_handle": "custom",
                },
            ],
        },
    )
    assert result["ok"], result
