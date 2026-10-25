# -*- coding: utf-8 -*-
"""Regression coverage for quality routing and optional node defaults."""

import asyncio

import pytest

from qwenpaw.plugins_bundle.flowforge.engine import (
    WorkflowExecutor,
    WorkflowStatus,
    load,
)
from qwenpaw.plugins_bundle.flowforge.engine.io import HiddenHolder
from qwenpaw.plugins_bundle.flowforge.engine.nodes.builtin import (
    IterativeRefineNode,
    QualityGateNode,
)


@pytest.mark.parametrize(
    ("control", "score", "expected"),
    [
        ({"fail_node": "rejected"}, 0.2, "rejected"),
        ({}, 0.8, None),
        ({"conditions": []}, 0.8, None),
        ({"conditions": [{"then_node": "accepted"}]}, 0.8, "accepted"),
        ({"conditions": [{"then": "accepted"}]}, 0.8, "accepted"),
        (
            {"conditions": [{"then_node": ""}, {"then": "accepted"}]},
            0.8,
            "accepted",
        ),
        (
            {
                "pass_node": "explicit",
                "conditions": [{"then_node": "accepted"}],
            },
            0.8,
            "explicit",
        ),
    ],
)
def test_quality_gate_uses_declared_routes_without_missing_helpers(
    control,
    score,
    expected,
):
    hidden = HiddenHolder(
        unique_id="gate",
        prompt={"gate": {"control": control}},
    )
    result = asyncio.run(QualityGateNode().execute(hidden=hidden, score=score))
    assert result.next_node == expected
    assert result.values == (score, score >= 0.7, None)
    assert result.error is None


@pytest.mark.parametrize(
    ("score", "expected"),
    [(0.2, "rejected"), (0.8, "accepted")],
)
def test_quality_gate_fallback_executes_only_the_selected_workflow_branch(
    score,
    expected,
):
    definition = {
        "id": "quality-fallback",
        "nodes": {
            "gate": {
                "class_type": "QualityGateNode",
                "inputs": {"score": score},
                "control": {
                    "conditions": [
                        {
                            "left": "inputs.allow",
                            "operator": "eq",
                            "right": True,
                            "then_node": "accepted",
                        },
                    ],
                    "fail_node": "rejected",
                },
            },
            **{
                name: {"class_type": "OutputNode", "inputs": {"value": name}}
                for name in ("accepted", "rejected")
            },
        },
        "outputs": ["accepted", "rejected"],
    }
    result = asyncio.run(
        WorkflowExecutor().execute(load(definition), {"allow": True}),
    )
    assert result.status == WorkflowStatus.COMPLETED
    assert result.outputs == {expected: expected}
    assert [item.node_id for item in result.execution_history] == [
        "gate",
        expected,
    ]


@pytest.mark.parametrize(("threshold", "passed"), [(None, False), (0.0, True)])
def test_quality_gate_default_preserves_an_explicit_zero(threshold, passed):
    result = asyncio.run(
        QualityGateNode().execute(
            hidden=HiddenHolder(),
            score=0.6,
            threshold=threshold,
        ),
    )
    assert result.values == (0.6, passed, None)


@pytest.mark.parametrize(("limit", "exhausted"), [(None, False), (0, True)])
def test_refine_default_preserves_an_explicit_zero(limit, exhausted):
    result = asyncio.run(
        IterativeRefineNode().execute(
            hidden=HiddenHolder(),
            max_iterations=limit,
        ),
    )
    assert result.values == (1, exhausted)
    assert result.metadata["max_iterations"] == (3 if limit is None else limit)


def test_node_schema_cache_is_local_to_each_class_and_can_be_invalidated():
    gate_schema = QualityGateNode.get_schema()
    refine_schema = IterativeRefineNode.get_schema()
    assert gate_schema.node_id == "QualityGateNode"
    assert refine_schema.node_id == "IterativeRefineNode"
    assert QualityGateNode.get_schema() is gate_schema
    assert IterativeRefineNode.get_schema() is refine_schema
    QualityGateNode.invalidate_schema_cache()
    assert QualityGateNode.get_schema() is not gate_schema
    assert IterativeRefineNode.get_schema() is refine_schema
