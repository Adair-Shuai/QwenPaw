# -*- coding: utf-8 -*-
"""Keep editor field precedence through the real canonical loader."""

import copy
import importlib

import pytest


@pytest.fixture(
    name="authoring",
    params=["plugins.bundle", "qwenpaw.plugins_bundle"],
)
def load_authoring_modules(request):
    prefix = request.param + ".flowforge.engine.io"
    return (
        importlib.import_module(prefix + ".authoring"),
        importlib.import_module(prefix + ".loader"),
    )


def test_editor_shell_priority_survives_canonical_loader(authoring):
    converter, loader = authoring
    raw = {
        "workflow": {
            "start_node": "begin",
            "end_node": "done",
            "timeout_sec": 0,
            "max_retries": 0,
            "nodes": [
                {
                    "id": "call",
                    "type": "script",
                    "metadata": {"outer": True},
                    "data": {
                        "type": "toolCall",
                        "name": "Inner name",
                        "description": "Description",
                        "metadata": {"inner": True},
                        "tool": "explicit.tool",
                        "params": {},
                        "timeout_sec": 0,
                        "inputs": {"value": 0},
                        "tool_inputs": {"ignored": True},
                        "next": "done",
                        "config": {
                            "node_type": "tool_call",
                            "tool": "config.tool",
                            "params": {"shadow": True},
                            "source": "config source",
                            "output": "config output",
                            "inputs": {"value": 9},
                            "timeout_sec": 10,
                        },
                    },
                },
            ],
        },
    }
    before = copy.deepcopy(raw)
    canonical = converter.to_canonical(raw)
    loaded = loader.load(canonical)
    assert loaded.nodes["call"] == {
        "class_type": "ToolCallNode",
        "inputs": {
            "tool": "explicit.tool",
            "params": {},
            "timeout_sec": 0,
            "inputs": {"value": 0},
            "source": "config source",
            "output": "config output",
        },
        "meta": {
            "name": "Inner name",
            "description": "Description",
            "outer": True,
        },
        "control": {"next": "done"},
    }
    assert loaded.nodes["begin"]["control"] == {"next": "call"}
    assert loaded.nodes["done"]["class_type"] == "EndNode"
    assert loaded.control["timeout_sec"] == 0
    assert loaded.control["max_retries"] == 0
    assert raw == before


@pytest.mark.parametrize(
    ("node", "class_type"),
    [
        (
            {"config": {"node_type": "llm_call"}, "class_type": "StartNode"},
            "LLMCallNode",
        ),
        (
            {"class_type": "ToolCallNode", "data": {"type": "wait"}},
            "ToolCallNode",
        ),
        ({"type": "script", "data": {"type": "wait"}}, "WaitNode"),
        ({"type": "default", "data": {"icon": "parallel"}}, "ParallelNode"),
        ({"type": "customNode"}, "CustomNode"),
        ({"type": "generic"}, "ToolCallNode"),
        ({"type": "default", "icon": "llm_call"}, "LLMCallNode"),
        (
            {"type": "default", "config": {"node_type": "generic"}},
            "ToolCallNode",
        ),
        ({"class_type": "WaitNode"}, "WaitNode"),
        (
            {"data": {"type": "tool_call", "config": {"node_type": "end"}}},
            "EndNode",
        ),
    ],
)
def test_authoring_type_precedence_is_preserved(authoring, node, class_type):
    converter, loader = authoring
    raw = {"nodes": [{"id": "n", **copy.deepcopy(node)}]}
    before = copy.deepcopy(raw)
    loaded = loader.load(converter.to_canonical(raw))
    assert loaded.nodes["n"]["class_type"] == class_type
    assert raw == before


@pytest.mark.parametrize(
    "alias",
    ["tool_id", "tool_name", "toolId", "toolName"],
)
def test_editor_tool_alias_and_empty_params_are_preserved(authoring, alias):
    converter, loader = authoring
    raw = {
        "nodes": [
            {
                "id": "call",
                "type": "tool_call",
                "data": {
                    "tool_inputs": {},
                    "config": {alias: "lookup", "timeout_sec": 0},
                },
            },
        ],
    }
    before = copy.deepcopy(raw)
    loaded = loader.load(converter.to_canonical(raw))
    assert loaded.nodes["call"]["inputs"] == {
        "params": {},
        "timeout_sec": 0,
        "tool": "lookup",
    }
    assert raw == before


def test_canonical_input_aliases_and_boundaries_remain_intact(authoring):
    converter, loader = authoring
    raw = {
        "nodes": {
            17: {
                "class_type": "toolCall",
                "inputs": {"tool_name": "lookup", "toolId": "later"},
            },
            "invalid": "not a node",
        },
        "control": {"end": " exit ", "extra": True},
    }
    before = copy.deepcopy(raw)
    loaded = loader.load(converter.to_canonical(raw))
    assert loaded.nodes["17"]["inputs"] == {"tool": "lookup"}
    assert loaded.nodes["17"]["class_type"] == "ToolCallNode"
    assert "invalid" not in loaded.nodes
    assert loaded.nodes["start"]["control"] == {"next": "17"}
    assert loaded.nodes["exit"]["class_type"] == "EndNode"
    assert loaded.control == {"start": "start", "end": "exit", "extra": True}
    assert raw == before


def test_invalid_authoring_root_keeps_original_error(authoring):
    converter, _ = authoring
    with pytest.raises(TypeError, match="must be a mapping, got list"):
        converter.to_canonical([])
