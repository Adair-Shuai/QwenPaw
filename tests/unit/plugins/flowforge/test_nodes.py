# -*- coding: utf-8 -*-
# pylint: disable=unused-argument
"""Tests for flowforge.engine.nodes — registry + built-in node run()."""

from __future__ import annotations

import asyncio

import pytest

from plugins.bundle.flowforge.engine.nodes import (
    AgentNode,
    CodeNode,
    ConditionNode,
    HiddenHolder,
    InputNode,
    LLMNode,
    NodeRegistry,
    NodeRunner,
    OutputNode,
    ToolNode,
    WorkflowNode,
    bootstrap,
    get_registry,
)
from plugins.bundle.flowforge.engine.progress import ProgressRegistry
from plugins.bundle.flowforge.engine.types import WorkflowState


def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


def make_hidden(state: WorkflowState | None = None, **kw) -> HiddenHolder:
    return HiddenHolder(
        prompt={},
        dynprompt=None,
        execution_id="test",
        workflow_state=state,
        progress=ProgressRegistry(prompt_id="test"),
        **kw,
    )


class TestNodeRegistry:
    def test_bootstrap_registers_all_builtins(self):
        reg = bootstrap()
        for ct in (
            "InputNode",
            "OutputNode",
            "ToolNode",
            "AgentNode",
            "ConditionNode",
            "LLMNode",
            "CodeNode",
        ):
            assert ct in reg
        assert len(reg) >= 7

    def test_get_registry_is_singleton(self):
        assert get_registry() is get_registry()

    def test_register_duplicate_raises(self):
        reg = NodeRegistry()
        reg.register(InputNode())
        with pytest.raises(ValueError):
            reg.register(InputNode())

    def test_register_requires_class_type(self):
        class NoType(WorkflowNode):
            class_type = ""

        with pytest.raises(ValueError):
            reg = NodeRegistry()
            reg.register(NoType())

    def test_all_types_returns_schema(self):
        reg = bootstrap()
        types = reg.all_types()
        names = {t["class_type"] for t in types}
        assert "ToolNode" in names
        assert "AgentNode" in names
        for t in types:
            assert "display_name" in t
            assert "inputs_schema" in t


class TestInputNode:
    def test_run_materialises_input(self):
        state = WorkflowState(workflow_id="wf", inputs={"query": "hello"})
        node = InputNode()
        out = _run(
            node.run(
                "n1",
                {"inputs": {"name": "query"}},
                {},
                make_hidden(state),
            ),
        )
        assert out.values == ("hello",)


class TestOutputNode:
    def test_run_records_output(self):
        state = WorkflowState(workflow_id="wf")
        hidden = make_hidden(state)
        node = OutputNode()
        out = _run(
            node.run(
                "n2",
                {"inputs": {"value": ["n1", 0]}},
                {("n1", 0): "data"},
                hidden,
            ),
        )
        assert out.values == ("data",)
        assert state.outputs["n2"] == "data"


class TestToolNode:
    def test_run_inline_callable(self):
        def my_tool(x: int = 0, **kw):
            return {"doubled": x * 2}

        node = ToolNode()
        out = _run(
            node.run(
                "n3",
                {"func": my_tool, "inputs": {"args": {"x": 5}}},
                {},
                make_hidden(),
            ),
        )
        assert out.values[0]["doubled"] == 10

    def test_run_async_callable(self):
        async def async_tool(value: str):
            return value.upper()

        node = ToolNode()
        out = _run(
            node.run(
                "n4",
                {"func": async_tool, "inputs": {"args": {"value": "hi"}}},
                {},
                make_hidden(),
            ),
        )
        assert out.values[0] == "HI"

    def test_run_via_tool_context_dict(self):
        def add(a, b):
            return a + b

        node = ToolNode()
        out = _run(
            node.run(
                "n5",
                {"tool_name": "add", "inputs": {"args": {"a": 2, "b": 3}}},
                {},
                make_hidden(tool_context={"add": add}),
            ),
        )
        assert out.values[0] == 5

    def test_run_missing_callable_returns_error(self):
        node = ToolNode()
        out = _run(
            node.run(
                "n6",
                {"tool_name": "nonexistent", "inputs": {}},
                {},
                make_hidden(),
            ),
        )
        assert out.error is not None
        assert "nonexistent" in out.error

    def test_run_callable_raises_returns_error(self):
        def boom(**kw):
            raise RuntimeError("kaboom")

        node = ToolNode()
        out = _run(
            node.run("n7", {"func": boom, "inputs": {}}, {}, make_hidden()),
        )
        assert out.error is not None
        assert "kaboom" in out.error


class TestCodeNode:
    def test_run_simple_snippet(self):
        node = CodeNode()
        out = _run(
            node.run(
                "n8",
                {"inputs": {"code": "result = inputs.get('x', 0) * 3"}},
                {},
                make_hidden(),
            ),
        )
        # x not provided → inputs.get('x', 0) returns 0 → result = 0
        assert out.values[0] == 0

    def test_run_with_input_value(self):
        node = CodeNode()
        out = _run(
            node.run(
                "n9",
                {
                    "inputs": {
                        "code": "result = sum(inputs.get('nums', []))",
                        "nums": [1, 2, 3],
                    },
                },
                {},
                make_hidden(),
            ),
        )
        assert out.values[0] == 6

    def test_run_invalid_code_returns_error(self):
        node = CodeNode()
        out = _run(
            node.run("n10", {"inputs": {"code": "1/0"}}, {}, make_hidden()),
        )
        assert out.error is not None


class TestConditionNode:
    def test_routes_to_then_branch(self):
        state = WorkflowState(workflow_id="wf", variables={"amount": 100})
        node = ConditionNode()
        out = _run(
            node.run(
                "n11",
                {
                    "control": {
                        "conditions": [
                            {
                                "then_node": "yes",
                                "condition": {
                                    "left": "amount",
                                    "operator": "gt",
                                    "right": 50,
                                },
                            },
                        ],
                        "else_node": "no",
                    },
                },
                {},
                make_hidden(state),
            ),
        )
        assert out.next_node == "yes"

    def test_routes_to_else_branch(self):
        state = WorkflowState(workflow_id="wf", variables={"amount": 10})
        node = ConditionNode()
        out = _run(
            node.run(
                "n12",
                {
                    "control": {
                        "conditions": [
                            {
                                "then_node": "yes",
                                "condition": {
                                    "left": "amount",
                                    "operator": "gt",
                                    "right": 50,
                                },
                            },
                        ],
                        "else_node": "no",
                    },
                },
                {},
                make_hidden(state),
            ),
        )
        assert out.next_node == "no"

    def test_invalid_expr_returns_error(self):
        node = ConditionNode()
        out = _run(
            node.run(
                "n13",
                {
                    "control": {
                        "conditions": [
                            {"then_node": "yes", "condition": {"left": "x"}},
                        ],
                    },
                },
                {},
                make_hidden(WorkflowState(workflow_id="wf")),
            ),
        )
        assert out.error is not None


class TestAgentNode:
    def test_run_requires_runtime(self):
        node = AgentNode()
        out = _run(
            node.run(
                "n14",
                {"inputs": {"agent_id": "a1", "query": "hi"}},
                {},
                make_hidden(),
            ),
        )
        assert out.error is not None
        assert "agent_runtime" in out.error

    def test_run_via_agents_dict(self):
        class FakeWS:
            async def process(self, query):
                return f"reply:{query}"

        class FakeMgr:
            agents = {"a1": FakeWS()}

        node = AgentNode()
        out = _run(
            node.run(
                "n15",
                {"inputs": {"agent_id": "a1", "query": "hello"}},
                {},
                make_hidden(agent_runtime=FakeMgr()),
            ),
        )
        assert out.values[0] == "reply:hello"


class TestLLMNode:
    def test_run_requires_llm_service(self):
        node = LLMNode()
        out = _run(
            node.run("n16", {"inputs": {"prompt": "hi"}}, {}, make_hidden()),
        )
        assert out.error is not None

    def test_run_via_chat_method(self):
        class FakeLLM:
            def chat(self, messages=None, **kw):
                return "mock reply"

        node = LLMNode()
        out = _run(
            node.run(
                "n17",
                {"inputs": {"prompt": "hello", "system": "be nice"}},
                {},
                make_hidden(llm_service=FakeLLM()),
            ),
        )
        assert out.values[0] == "mock reply"


class TestNodeRunner:
    def test_runs_node_and_emits_progress(self):
        reg = NodeRegistry()
        reg.register(ToolNode())
        progress = ProgressRegistry(prompt_id="test")
        runner = NodeRunner(registry=reg, progress=progress)

        def f(**kw):
            return "ok"

        result = _run(
            runner.run(
                "n1",
                {
                    "class_type": "ToolNode",
                    "func": f,
                    "inputs": {},
                },
                {},
                make_hidden(),
            ),
        )
        assert result.output.values[0] == "ok"
        assert progress.status("n1").value == "completed"

    def test_unknown_class_type_raises(self):
        reg = NodeRegistry()
        runner = NodeRunner(registry=reg)
        with pytest.raises(Exception):
            _run(
                runner.run(
                    "n1",
                    {"class_type": "GhostNode", "inputs": {}},
                    {},
                    make_hidden(),
                ),
            )

    def test_node_failure_emits_failed_status(self):
        reg = NodeRegistry()
        reg.register(ToolNode())
        progress = ProgressRegistry(prompt_id="test")
        runner = NodeRunner(registry=reg, progress=progress)

        def boom(**kw):
            raise ValueError("fail")

        # ToolNode catches exceptions and returns an error output;
        # NodeRunner surfaces that as FAILED (no re-raise).
        result = _run(
            runner.run(
                "n1",
                {"class_type": "ToolNode", "func": boom, "inputs": {}},
                {},
                make_hidden(),
            ),
        )
        assert result.output.error is not None
        from plugins.bundle.flowforge.engine.progress import NodeStatus

        assert progress.status("n1") == NodeStatus.FAILED
