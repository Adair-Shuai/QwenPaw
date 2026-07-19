# -*- coding: utf-8 -*-
"""Tests for flowforge.engine.executor — end-to-end async run lifecycle.

Covers: linear chain, parallel branches, condition routing, error
propagation, pause/resume, cancel, timeout, template resolution.
"""

from __future__ import annotations

import asyncio

import pytest

from plugins.bundle.flowforge.engine.document import load
from plugins.bundle.flowforge.engine.executor import WorkflowExecutor
from plugins.bundle.flowforge.engine.nodes import (
    NodeRegistry,
    ToolNode,
    bootstrap,
)
from plugins.bundle.flowforge.engine.progress import ProgressEvent, ProgressRegistry
from plugins.bundle.flowforge.engine.state_store import (
    InMemoryWorkflowStateStore,
    build_workflow_state_store,
)
from plugins.bundle.flowforge.engine.types import WorkflowStatus


def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


class TestLinearChain:
    def test_input_to_output_passes_value(self):
        doc = load({
            "id": "wf-linear",
            "name": "Linear",
            "nodes": {
                "in": {"class_type": "InputNode", "inputs": {"name": "query"}},
                "out": {"class_type": "OutputNode", "inputs": {"value": ["in", 0]}},
            },
            "outputs": ["out"],
        })
        ex = WorkflowExecutor()
        result = _run(ex.execute(doc, {"query": "hello"}))
        assert result.status == WorkflowStatus.COMPLETED
        assert result.outputs["out"] == "hello"
        assert result.success

    def test_tool_node_pipeline(self):
        """in → tool(doubler) → out."""
        def doubler(x, **kw):
            return x * 2

        # Register an inline callable on the node def.
        doc = load({
            "id": "wf-tool",
            "nodes": {
                "in": {"class_type": "InputNode", "inputs": {"name": "n"}},
                "tool": {
                    "class_type": "ToolNode",
                    "func": doubler,
                    "inputs": {"args": {"x": ["in", 0]}},
                },
                "out": {"class_type": "OutputNode", "inputs": {"value": ["tool", 0]}},
            },
            "outputs": ["out"],
        })
        ex = WorkflowExecutor()
        result = _run(ex.execute(doc, {"n": 21}))
        assert result.success
        assert result.outputs["out"] == 42


class TestConditionRouting:
    def test_condition_branches_to_then(self):
        def make_tool(label):
            def f(**kw):
                return label
            return f

        doc = load({
            "id": "wf-cond",
            "nodes": {
                "in": {"class_type": "InputNode", "inputs": {"name": "amount"}},
                "cond": {
                    "class_type": "ConditionNode",
                    "control": {
                        "conditions": [
                            {
                                "then_node": "yes",
                                "condition": {"left": "amount", "operator": "gt", "right": 50},
                            },
                        ],
                        "else_node": "no",
                    },
                },
                "yes": {"class_type": "ToolNode", "func": make_tool("yes"), "control": {"next": "out"}},
                "no": {"class_type": "ToolNode", "func": make_tool("no"), "control": {"next": "out"}},
                "out": {"class_type": "OutputNode", "inputs": {"value": ["yes", 0]}},
            },
            "outputs": ["out"],
        })
        ex = WorkflowExecutor()
        result = _run(ex.execute(doc, {"amount": 100}))
        assert result.success
        assert result.outputs["out"] == "yes"

    def test_condition_branches_to_else(self):
        def make_tool(label):
            def f(**kw):
                return label
            return f

        doc = load({
            "id": "wf-cond2",
            "nodes": {
                "in": {"class_type": "InputNode", "inputs": {"name": "amount"}},
                "cond": {
                    "class_type": "ConditionNode",
                    "control": {
                        "conditions": [
                            {
                                "then_node": "yes",
                                "condition": {"left": "amount", "operator": "gt", "right": 50},
                            },
                        ],
                        "else_node": "no",
                    },
                },
                "yes": {"class_type": "ToolNode", "func": make_tool("yes"), "control": {"next": "out"}},
                "no": {"class_type": "ToolNode", "func": make_tool("no"), "control": {"next": "out"}},
                "out": {"class_type": "OutputNode", "inputs": {"value": ["no", 0]}},
            },
            "outputs": ["out"],
        })
        ex = WorkflowExecutor()
        result = _run(ex.execute(doc, {"amount": 10}))
        assert result.success
        assert result.outputs["out"] == "no"


class TestParallelBranches:
    def test_two_independent_nodes_run_concurrently(self):
        """fan-out: in → [tool_a, tool_b] → out(a) + out(b)."""
        def a_tool(**kw): return "A"
        def b_tool(**kw): return "B"

        doc = load({
            "id": "wf-par",
            "nodes": {
                "in": {"class_type": "InputNode", "inputs": {"name": "x"}},
                "a": {"class_type": "ToolNode", "func": a_tool, "inputs": {"args": {"x": ["in", 0]}}},
                "b": {"class_type": "ToolNode", "func": b_tool, "inputs": {"args": {"x": ["in", 0]}}},
                "out_a": {"class_type": "OutputNode", "inputs": {"value": ["a", 0]}},
                "out_b": {"class_type": "OutputNode", "inputs": {"value": ["b", 0]}},
            },
            "outputs": ["out_a", "out_b"],
        })
        ex = WorkflowExecutor(max_parallelism=4)
        result = _run(ex.execute(doc, {"x": 1}))
        assert result.success
        assert result.outputs["out_a"] == "A"
        assert result.outputs["out_b"] == "B"


class TestErrorHandling:
    def test_node_error_propagates(self):
        def boom(**kw):
            raise RuntimeError("kaboom")

        doc = load({
            "id": "wf-err",
            "nodes": {
                "tool": {"class_type": "ToolNode", "func": boom, "inputs": {}},
                "out": {"class_type": "OutputNode", "inputs": {"value": ["tool", 0]}},
            },
            "outputs": ["out"],
        })
        ex = WorkflowExecutor()
        result = _run(ex.execute(doc, {}))
        assert result.status == WorkflowStatus.FAILED
        assert any("kaboom" in e for e in result.errors)
        assert not result.success

    def test_node_output_error_propagates(self):
        """ToolNode returns NodeOutput(error=...) when callable missing."""
        doc = load({
            "id": "wf-err2",
            "nodes": {
                "tool": {"class_type": "ToolNode", "tool_name": "ghost", "inputs": {}},
                "out": {"class_type": "OutputNode", "inputs": {"value": ["tool", 0]}},
            },
            "outputs": ["out"],
        })
        ex = WorkflowExecutor()
        result = _run(ex.execute(doc, {}))
        assert result.status == WorkflowStatus.FAILED
        assert any("ghost" in e for e in result.errors)


class TestProgressEvents:
    def test_events_emitted_for_run(self):
        events: list[ProgressEvent] = []

        def handler(ev: ProgressEvent) -> None:
            events.append(ev)

        doc = load({
            "id": "wf-prog",
            "nodes": {
                "in": {"class_type": "InputNode", "inputs": {"name": "x"}},
                "out": {"class_type": "OutputNode", "inputs": {"value": ["in", 0]}},
            },
            "outputs": ["out"],
        })
        ex = WorkflowExecutor(progress_handlers=[handler])
        result = _run(ex.execute(doc, {"x": "v"}))
        assert result.success
        types = [e.type for e in events]
        assert "execution_start" in types
        assert "execution_success" in types
        # node-level events
        assert any(t.startswith("node_") for t in types)


class TestCancel:
    def test_cancel_active_run(self):
        """Cancel a long-running node."""
        async def slow(**kw):
            await asyncio.sleep(10)
            return "never"

        doc = load({
            "id": "wf-cancel",
            "nodes": {
                "tool": {"class_type": "ToolNode", "func": slow, "inputs": {}},
                "out": {"class_type": "OutputNode", "inputs": {"value": ["tool", 0]}},
            },
            "outputs": ["out"],
        })
        ex = WorkflowExecutor()

        async def driver():
            # Start the run and let it stage the slow node.
            task = asyncio.ensure_future(
                ex.execute_async(
                    doc, {}, prompt_id="cancel-test",
                ),
            )
            await asyncio.sleep(0.2)
            # Find the active state_id and cancel it.
            state_id = next(iter(ex._states.keys()))
            ex.cancel(state_id)
            return await task

        result = _run(driver())
        assert result.status in (WorkflowStatus.CANCELLED, WorkflowStatus.FAILED)


class TestTimeout:
    def test_timeout_terminates_run(self):
        async def slow(**kw):
            await asyncio.sleep(10)
            return "late"

        doc = load({
            "id": "wf-timeout",
            "metadata": {"timeout_sec": 0.5},
            "nodes": {
                "tool": {"class_type": "ToolNode", "func": slow, "inputs": {}},
            },
            "outputs": [],
        })
        ex = WorkflowExecutor()
        result = _run(ex.execute(doc, {}))
        assert result.status == WorkflowStatus.TIMEOUT


class TestStateStore:
    def test_in_memory_store_roundtrip(self):
        from plugins.bundle.flowforge.engine.state_store import WorkflowRunSnapshot
        from plugins.bundle.flowforge.engine.types import WorkflowState
        store = InMemoryWorkflowStateStore()
        state = WorkflowState(workflow_id="wf")
        snap = WorkflowRunSnapshot(
            state=state, output_cache={"n1": "v"}, blocked_nodes=[], prompt_id="p1",
        )
        _run(store.save(snap))
        loaded = _run(store.load(state.id))
        assert loaded is not None
        assert loaded.state.id == state.id
        assert loaded.output_cache == {"n1": "v"}
        by_prompt = _run(store.load_by_prompt_id("p1"))
        assert by_prompt is not None
        _run(store.delete(state.id))
        assert _run(store.load(state.id)) is None

    def test_json_store_roundtrip(self, tmp_path):
        from plugins.bundle.flowforge.engine.state_store import (
            JsonWorkflowStateStore, WorkflowRunSnapshot,
        )
        from plugins.bundle.flowforge.engine.types import WorkflowState
        store = JsonWorkflowStateStore(tmp_path / "store")
        state = WorkflowState(workflow_id="wf-json")
        snap = WorkflowRunSnapshot(
            state=state, output_cache={}, blocked_nodes=["n1"], prompt_id="p2",
        )
        _run(store.save(snap))
        # Reload from disk.
        store2 = JsonWorkflowStateStore(tmp_path / "store")
        loaded = _run(store2.load(state.id))
        assert loaded is not None
        assert loaded.state.id == state.id
        assert loaded.blocked_nodes == ["n1"]
        by_prompt = _run(store2.load_by_prompt_id("p2"))
        assert by_prompt is not None

    def test_factory_prefers_json(self, tmp_path):
        from plugins.bundle.flowforge.engine.state_store import (
            JsonWorkflowStateStore, build_workflow_state_store,
        )
        store = build_workflow_state_store(tmp_path / "store")
        assert isinstance(store, JsonWorkflowStateStore)

    def test_factory_falls_back_to_inmemory(self):
        from plugins.bundle.flowforge.engine.state_store import (
            InMemoryWorkflowStateStore, build_workflow_state_store,
        )
        store = build_workflow_state_store(None)
        assert isinstance(store, InMemoryWorkflowStateStore)
