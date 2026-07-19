# -*- coding: utf-8 -*-
"""Tests for flowforge.engine.document — loader + validator.

Covers: loading from dict/JSON string, input-link validation, control
successor validation, output-node resolution, cycle detection is the
graph's job (tested separately).
"""

from __future__ import annotations

import pytest

from plugins.bundle.flowforge.engine.document import (
    WorkflowDocument,
    graph_hash,
    load,
    to_json,
    validate,
)
from plugins.bundle.flowforge.engine.errors import ValidationError


class TestLoad:
    def test_load_from_dict(self):
        doc = load({
            "id": "wf1",
            "name": "Test",
            "nodes": {
                "n1": {"class_type": "InputNode", "inputs": {"name": "x"}},
                "n2": {"class_type": "OutputNode", "inputs": {"value": ["n1", 0]}},
            },
            "outputs": ["n2"],
        })
        assert isinstance(doc, WorkflowDocument)
        assert doc.id == "wf1"
        assert "n1" in doc.nodes
        assert doc.nodes["n1"]["class_type"] == "InputNode"

    def test_load_from_json_string(self):
        doc = load('{"id": "wf2", "nodes": {}, "outputs": []}')
        assert doc.id == "wf2"

    def test_load_normalises_node_fields(self):
        doc = load({
            "id": "wf",
            "nodes": {"n": {"type": "ToolNode"}},
        })
        assert doc.nodes["n"]["class_type"] == "ToolNode"
        assert doc.nodes["n"]["inputs"] == {}
        assert doc.nodes["n"]["control"] == {}

    def test_load_missing_id_raises(self):
        with pytest.raises(ValidationError):
            load({"nodes": {}})

    def test_load_non_dict_raises(self):
        with pytest.raises(ValidationError):
            load([1, 2, 3])  # type: ignore[arg-type]

    def test_load_nodes_must_be_object(self):
        with pytest.raises(ValidationError):
            load({"id": "wf", "nodes": [1, 2]})


class TestValidate:
    def test_valid_document(self):
        result = validate(load({
            "id": "wf",
            "nodes": {
                "n1": {"class_type": "InputNode"},
                "n2": {"class_type": "OutputNode", "inputs": {"value": ["n1", 0]}},
            },
        }))
        assert result.ok, result.errors
        assert "n2" in result.output_nodes

    def test_empty_document_fails(self):
        result = validate(load({"id": "wf", "nodes": {}}))
        assert not result.ok
        assert any("no nodes" in e for e in result.errors)

    def test_dangling_input_link_fails(self):
        result = validate(load({
            "id": "wf",
            "nodes": {
                "n1": {"class_type": "OutputNode", "inputs": {"value": ["ghost", 0]}},
            },
        }))
        assert not result.ok
        assert any("ghost" in e for e in result.errors)

    def test_dangling_control_next_fails(self):
        result = validate(load({
            "id": "wf",
            "nodes": {
                "n1": {"class_type": "ToolNode", "control": {"next": "nonexistent"}},
            },
        }))
        assert not result.ok
        assert any("nonexistent" in e for e in result.errors)

    def test_dangling_condition_target_fails(self):
        result = validate(load({
            "id": "wf",
            "nodes": {
                "n1": {
                    "class_type": "ConditionNode",
                    "control": {
                        "conditions": [
                            {"then_node": "ghost", "condition": {"left": "x", "operator": "eq", "right": 1}},
                        ],
                    },
                },
            },
        }))
        assert not result.ok
        assert any("ghost" in e for e in result.errors)

    def test_output_nodes_inferred_from_leaves(self):
        result = validate(load({
            "id": "wf",
            "nodes": {
                "n1": {"class_type": "InputNode"},
                "n2": {
                    "class_type": "ToolNode",
                    "inputs": {"args": ["n1", 0]},
                    "control": {"next": "n3"},
                },
                "n3": {"class_type": "OutputNode", "inputs": {"value": ["n2", 0]}},
            },
        }))
        assert result.ok, result.errors
        # n3 is a leaf (no successors), so it's an output node
        assert "n3" in result.output_nodes


class TestSerialization:
    def test_to_json_roundtrip(self):
        original = load({
            "id": "wf",
            "name": "Roundtrip",
            "nodes": {"n1": {"class_type": "InputNode"}},
        })
        js = to_json(original)
        assert '"id": "wf"' in js
        roundtripped = load(js)
        assert roundtripped.id == "wf"
        assert roundtripped.name == "Roundtrip"

    def test_graph_hash_stable(self):
        doc = load({"id": "wf", "nodes": {"n1": {"class_type": "InputNode"}}})
        assert graph_hash(doc) == graph_hash(doc)

    def test_graph_hash_differs_on_change(self):
        d1 = load({"id": "wf", "nodes": {"n1": {"class_type": "InputNode"}}})
        d2 = load({"id": "wf", "nodes": {"n1": {"class_type": "OutputNode"}}})
        assert graph_hash(d1) != graph_hash(d2)
