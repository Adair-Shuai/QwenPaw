# -*- coding: utf-8 -*-
# pylint: disable=protected-access, import-outside-toplevel
"""Tests for flowforge.engine.graph — DynamicPrompt / TopologicalSort /
ExecutionList.

Ported from the LeAgent graph tests: dependency walking, branch
selection pruning, external blocks, cycle detection, reopen for loops.
"""

from __future__ import annotations

import asyncio

from plugins.bundle.flowforge.engine.graph import (
    DynamicPrompt,
    ExecutionList,
    TopologicalSort,
)


def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


def make_prompt(nodes: dict) -> DynamicPrompt:
    return DynamicPrompt(nodes)


class TestDynamicPrompt:
    def test_get_original(self):
        p = make_prompt({"n1": {"class_type": "ToolNode"}})
        assert p.get("n1") == {"class_type": "ToolNode"}

    def test_get_ephemeral(self):
        p = make_prompt({})
        p._ephemeral["x"] = {"class_type": "ToolNode"}
        assert p.get("x") == {"class_type": "ToolNode"}
        assert p.is_ephemeral("x")

    def test_all_ids(self):
        p = make_prompt({"n1": {}})
        from plugins.bundle.flowforge.engine.graph import ExpandFrame

        p.add_expanded(
            ExpandFrame(parent_id="n1", call_idx=0, nodes={"child": {}}),
        )
        assert "n1" in p.all_ids
        assert "n1:0:child" in p.all_ids

    def test_parent_of(self):
        p = make_prompt({"n1": {}})
        from plugins.bundle.flowforge.engine.graph import ExpandFrame

        p.add_expanded(
            ExpandFrame(parent_id="n1", call_idx=0, nodes={"c": {}}),
        )
        assert p.parent_of("n1:0:c") == "n1"


class TestTopologicalSort:
    def test_upstream_of_single_link(self):
        p = make_prompt(
            {
                "n1": {"class_type": "ToolNode"},
                "n2": {
                    "class_type": "OutputNode",
                    "inputs": {"value": ["n1", 0]},
                },
            },
        )
        topo = TopologicalSort(p)
        assert topo.upstream_of("n2") == [("n1", 0)]
        assert not topo.upstream_of("n1")

    def test_upstream_of_multilink(self):
        p = make_prompt(
            {
                "n1": {"class_type": "ToolNode"},
                "n2": {"class_type": "ToolNode"},
                "n3": {
                    "class_type": "ToolNode",
                    "inputs": {"args": [["n1", 0], ["n2", 0]]},
                },
            },
        )
        topo = TopologicalSort(p)
        ups = topo.upstream_of("n3")
        assert ("n1", 0) in ups
        assert ("n2", 0) in ups

    def test_successors_of_next(self):
        p = make_prompt(
            {
                "n1": {"class_type": "ToolNode", "control": {"next": "n2"}},
                "n2": {"class_type": "ToolNode"},
            },
        )
        topo = TopologicalSort(p)
        assert topo.successors_of("n1") == {"n2"}

    def test_successors_of_condition(self):
        p = make_prompt(
            {
                "n1": {
                    "class_type": "ConditionNode",
                    "control": {
                        "conditions": [{"then_node": "n2", "condition": {}}],
                        "else_node": "n3",
                    },
                },
            },
        )
        topo = TopologicalSort(p)
        assert topo.successors_of("n1") == {"n2", "n3"}


class TestExecutionList:
    def test_add_node_walks_upstream(self):
        """add_node(n2) should discover n1 as a strong-link dep."""
        p = make_prompt(
            {
                "n1": {"class_type": "ToolNode"},
                "n2": {
                    "class_type": "OutputNode",
                    "inputs": {"value": ["n1", 0]},
                },
            },
        )
        topo = TopologicalSort(p)
        el = ExecutionList(p, topo)
        el.add_node("n2")
        # n1 has no deps → ready; n2 has dep n1 → not ready yet
        assert "n1" in el.state.ready
        assert "n2" not in el.state.ready

    def test_complete_promotes_downstream(self):
        p = make_prompt(
            {
                "n1": {"class_type": "ToolNode"},
                "n2": {
                    "class_type": "OutputNode",
                    "inputs": {"value": ["n1", 0]},
                },
            },
        )
        topo = TopologicalSort(p)
        el = ExecutionList(p, topo)
        el.add_node("n2")
        # Stage + complete n1
        batch = _run(el.stage_ready_batch(limit=8))
        assert "n1" in batch
        el.complete_node_execution("n1")
        assert "n2" in el.state.ready

    def test_select_branch_prunes_others(self):
        """Choosing n2 should prune n3 (the else branch)."""
        p = make_prompt(
            {
                "n1": {
                    "class_type": "ConditionNode",
                    "control": {
                        "conditions": [{"then_node": "n2", "condition": {}}],
                        "else_node": "n3",
                    },
                },
                "n2": {"class_type": "ToolNode"},
                "n3": {"class_type": "ToolNode"},
            },
        )
        topo = TopologicalSort(p)
        el = ExecutionList(p, topo)
        el.select_branch("n1", "n2")
        assert "n3" in el.state.skipped
        assert "n2" not in el.state.skipped

    def test_external_block_and_release(self):
        p = make_prompt({"n1": {"class_type": "ToolNode"}})
        topo = TopologicalSort(p)
        el = ExecutionList(p, topo)
        el.add_node("n1")
        batch = _run(el.stage_ready_batch())
        assert batch == ["n1"]
        el.add_external_block("n1", "awaiting_review")
        assert "n1" in el.state.blocked
        assert el.is_done() is False
        el.release_external_block("n1", "awaiting_review")
        assert "n1" not in el.state.blocked
        assert "n1" in el.state.ready

    def test_is_done_when_empty(self):
        p = make_prompt({"n1": {"class_type": "ToolNode"}})
        topo = TopologicalSort(p)
        el = ExecutionList(p, topo)
        assert el.is_done() is True

    def test_detect_cycles_finds_cycle(self):
        # n2 → n1 (strong link) and n1 → n2 (strong link via inputs)
        p = make_prompt(
            {
                "n1": {
                    "class_type": "ToolNode",
                    "inputs": {"args": ["n2", 0]},
                },
                "n2": {
                    "class_type": "ToolNode",
                    "inputs": {"args": ["n1", 0]},
                },
            },
        )
        topo = TopologicalSort(p)
        el = ExecutionList(p, topo)
        el.add_node("n1")
        el.add_node("n2")
        cycles = el.detect_cycles()
        assert len(cycles) >= 1

    def test_stage_ready_batch_returns_sorted(self):
        p = make_prompt(
            {
                "n1": {"class_type": "ToolNode"},
                "n2": {"class_type": "ToolNode"},
            },
        )
        topo = TopologicalSort(p)
        el = ExecutionList(p, topo)
        el.add_node("n1")
        el.add_node("n2")
        batch = _run(el.stage_ready_batch(limit=8))
        assert batch == sorted(batch)

    def test_cancel_makes_done(self):
        p = make_prompt({"n1": {"class_type": "ToolNode"}})
        topo = TopologicalSort(p)
        el = ExecutionList(p, topo)
        el.add_node("n1")
        el.cancel()
        assert el.is_done() is True
        batch = _run(el.stage_ready_batch())
        assert batch == []

    def test_reopen_for_loop(self):
        """reopen() should reset a completed node so a loop can re-run."""
        p = make_prompt(
            {
                "n1": {"class_type": "ToolNode", "control": {"next": "n2"}},
                "n2": {"class_type": "ToolNode", "control": {"next": "n1"}},
            },
        )
        topo = TopologicalSort(p)
        el = ExecutionList(p, topo)
        el.add_node("n1")
        el.complete_node_execution("n1")
        assert "n1" in el.state.completed
        el.reopen("n1")
        assert "n1" not in el.state.completed
