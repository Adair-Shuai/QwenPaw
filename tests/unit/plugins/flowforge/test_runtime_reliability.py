# -*- coding: utf-8 -*-
"""Executable workflow regressions with deterministic tool fixtures."""
from __future__ import annotations

import asyncio
import time
from pathlib import Path
from types import SimpleNamespace

import pytest

from qwenpaw.plugins_bundle.flowforge.engine import (
    WorkflowExecutor,
    WorkflowStatus,
    load,
)
from qwenpaw.plugins_bundle.flowforge.engine.adapter.sandbox import (
    execute_script,
    ScriptTimeoutError,
)
from qwenpaw.plugins_bundle.flowforge.engine.errors import ValidationError
from qwenpaw.plugins_bundle.flowforge.engine.state_store import (
    JsonWorkflowStateStore,
)


def run(executor, definition, inputs=None):
    return asyncio.run(executor.execute(load(definition), inputs or {}))


@pytest.mark.parametrize(
    "value",
    ["AI搭建修复验收通过", 0, False, None, {"answer": 42}],
)
def test_end_node_returns_its_declared_value(value):
    result = run(
        WorkflowExecutor(),
        {
            "id": "end-value",
            "nodes": {
                "end": {"class_type": "EndNode", "inputs": {"value": value}},
            },
            "outputs": ["end"],
        },
    )
    assert result.status == WorkflowStatus.COMPLETED
    assert result.outputs == {"end": value}


def test_end_node_without_value_preserves_collected_outputs():
    result = run(
        WorkflowExecutor(),
        {
            "id": "end-collect",
            "nodes": {
                "before": {
                    "class_type": "OutputNode",
                    "inputs": {"value": "kept"},
                },
                "end": {
                    "class_type": "EndNode",
                    "inputs": {"__flow_dependencies": [["before", 0]]},
                },
            },
            "outputs": ["end"],
        },
    )
    assert result.status == WorkflowStatus.COMPLETED
    # Preserve the existing collector's output-slot representation.
    assert result.outputs == {"end": {"before": ("kept",)}}


def tool(name, **extra):
    return {
        "class_type": "ToolNode",
        "inputs": {"tool_name": name, "args": {}},
        **extra,
    }


def review_flow():
    return {
        "id": "review",
        "nodes": {
            "review": {
                "class_type": "HumanReviewNode",
                "inputs": {"reviewer": "operator"},
            },
        },
        "outputs": ["review"],
    }


def test_control_only_branches_gate_side_effects_and_join_once():
    calls = []
    executor = WorkflowExecutor(
        tool_registry={
            name: lambda name=name: calls.append(name) or name
            for name in ("yes", "no", "join")
        },
    )
    definition = {
        "id": "diamond",
        "nodes": {
            "route": {
                "class_type": "ConditionNode",
                "control": {
                    "conditions": [
                        {
                            "left": "inputs.flag",
                            "operator": "eq",
                            "right": True,
                            "then_node": "yes",
                        },
                    ],
                    "else_node": "no",
                },
            },
            "yes": tool("yes", control={"next": "join"}),
            "no": tool("no", control={"next": "join"}),
            "join": tool("join"),
        },
        "outputs": ["join"],
    }
    result = run(executor, definition, {"flag": True})
    assert result.status == WorkflowStatus.COMPLETED
    assert calls == ["yes", "join"]
    assert [entry.node_id for entry in result.execution_history] == [
        "route",
        "yes",
        "join",
    ]


def test_true_parallel_dag_rendezvous_and_recursive_argument_join():
    async def scenario():
        started = set()
        both = asyncio.Event()

        async def produce(name):
            started.add(name)
            if len(started) == 2:
                both.set()
            await asyncio.wait_for(both.wait(), 0.5)
            return 20 if name == "left" else 22

        executor = WorkflowExecutor(
            tool_registry={
                "left": lambda: produce("left"),
                "right": lambda: produce("right"),
                "join": lambda data: data,
            },
        )
        definition = {
            "id": "parallel-dag",
            "nodes": {
                "left": tool("left"),
                "right": tool("right"),
                "join": {
                    "class_type": "ToolNode",
                    "inputs": {
                        "tool_name": "join",
                        "args": {
                            "data": {
                                "values": [["left", 0], ["right", 0]],
                                "literal": ["a", "b"],
                            },
                        },
                    },
                },
            },
            "outputs": ["join"],
        }
        result = await executor.execute(load(definition))
        assert result.status == WorkflowStatus.COMPLETED
        assert result.outputs["join"] == {
            "values": [20, 22],
            "literal": ["a", "b"],
        }

    asyncio.run(scenario())


def test_failed_dependency_never_executes_downstream_tool():
    calls = []
    definition = {
        "id": "fail-closed",
        "nodes": {
            "bad": tool("missing", control={"next": "sink"}),
            "sink": tool("sink"),
        },
        "outputs": ["sink"],
    }
    result = run(
        WorkflowExecutor(tool_registry={"sink": lambda: calls.append(True)}),
        definition,
    )
    assert result.status == WorkflowStatus.FAILED
    assert not calls


def test_structured_tool_error_retries_with_configured_budget():
    calls = []

    async def unstable():
        calls.append(True)
        if len(calls) < 3:
            raise ConnectionError("connection reset")
        return "recovered"

    definition = {
        "id": "retry",
        "nodes": {
            "job": tool(
                "unstable",
                control={"max_retries": 2, "retry_delay_sec": 0},
            ),
        },
        "outputs": ["job"],
    }
    result = run(
        WorkflowExecutor(tool_registry={"unstable": unstable}),
        definition,
    )
    assert result.status == WorkflowStatus.COMPLETED
    assert result.outputs["job"] == "recovered"
    assert len(calls) == 3


def test_node_timeout_stops_awaiting_tool():
    completed = []

    async def slow():
        await asyncio.sleep(1)
        completed.append(True)

    definition = {
        "id": "timeout",
        "nodes": {"slow": tool("slow", control={"timeout_sec": 0.02})},
        "outputs": ["slow"],
    }
    result = run(WorkflowExecutor(tool_registry={"slow": slow}), definition)
    assert result.status == WorkflowStatus.FAILED
    assert "TimeoutError" in result.errors[0]
    assert not completed


def test_existing_cancellation_contract_stops_inflight_tools():
    async def scenario():
        started = asyncio.Event()
        completed = []

        async def slow():
            started.set()
            await asyncio.sleep(10)
            completed.append(True)

        executor = WorkflowExecutor(tool_registry={"slow": slow})
        definition = load(
            {
                "id": "cancel",
                "nodes": {"slow": tool("slow")},
                "outputs": ["slow"],
            },
        )
        task = asyncio.create_task(
            executor.execute_async(definition, {}, prompt_id="run-cancel"),
        )
        await started.wait()
        assert executor.cancel_by_prompt_id("run-cancel")
        result = await asyncio.wait_for(task, 0.5)
        assert result.status == WorkflowStatus.CANCELLED
        assert not completed

    asyncio.run(scenario())


def test_checkpoint_preserves_completed_parallel_sibling_across_restart(
    tmp_path: Path,
):
    calls = []

    async def effect():
        await asyncio.sleep(0.01)
        calls.append(True)
        return "persisted"

    definition = load(
        {
            "id": "parallel-review",
            "nodes": {
                "a_review": {
                    "class_type": "HumanReviewNode",
                    "inputs": {"reviewer": "operator"},
                },
                "z_effect": tool("effect"),
                "out": {
                    "class_type": "OutputNode",
                    "inputs": {
                        "value": ["a_review", 0],
                        "__flow_dependencies": [["z_effect", 0]],
                    },
                },
            },
            "outputs": ["out"],
        },
    )

    async def scenario():
        original = WorkflowExecutor(
            tool_registry={"effect": effect},
            state_store=JsonWorkflowStateStore(tmp_path),
        )
        paused = await original.execute(definition)
        assert paused.status == WorkflowStatus.WAITING_HUMAN
        restarted = WorkflowExecutor(
            tool_registry={"effect": effect},
            state_store=JsonWorkflowStateStore(tmp_path),
        )
        result = await restarted.resume(
            definition,
            paused.state_id,
            {"approved": True},
        )
        assert result.status == WorkflowStatus.COMPLETED
        assert calls == [True]
        with pytest.raises(ValueError, match="only paused"):
            await restarted.resume(
                definition,
                paused.state_id,
                {"approved": True},
            )

    asyncio.run(scenario())


@pytest.mark.parametrize("decision", ["false", 1, None, {}])
def test_review_requires_boolean_decision(tmp_path: Path, decision):
    async def scenario():
        executor = WorkflowExecutor(
            state_store=JsonWorkflowStateStore(tmp_path),
        )
        definition = load(review_flow())
        paused = await executor.execute(definition)
        with pytest.raises(ValueError, match="boolean approved"):
            await executor.resume(
                definition,
                paused.state_id,
                {"approved": decision},
            )

    asyncio.run(scenario())


def test_rejected_review_cannot_execute_approval_side_effect(tmp_path: Path):
    async def scenario():
        calls = []
        definition = review_flow()
        definition["nodes"]["review"]["control"] = {"next": "publish"}
        definition["nodes"]["publish"] = tool("publish")
        definition["outputs"] = ["publish"]
        executor = WorkflowExecutor(
            tool_registry={"publish": lambda: calls.append(True)},
            state_store=JsonWorkflowStateStore(tmp_path),
        )
        paused = await executor.execute(load(definition))
        result = await executor.resume(
            definition,
            paused.state_id,
            {"approved": False},
        )
        assert result.status == WorkflowStatus.FAILED
        assert not calls

    asyncio.run(scenario())


def test_workflow_input_schema_is_enforced_before_side_effects():
    calls = []
    executor = WorkflowExecutor(
        tool_registry={"effect": lambda: calls.append(True)},
    )
    definition = {
        "id": "input-contract",
        "inputs": [
            {
                "name": "pressure",
                "type": "number",
                "required": True,
                "minimum": 0,
                "maximum": 34,
            },
        ],
        "nodes": {"job": tool("effect")},
        "outputs": ["job"],
    }
    for inputs in ({}, {"pressure": "32"}, {"pressure": -1}, {"pressure": 40}):
        with pytest.raises(ValidationError, match="inputs are invalid"):
            run(executor, definition, inputs)
    assert not calls
    assert (
        run(executor, definition, {"pressure": 32}).status
        == WorkflowStatus.COMPLETED
    )


def test_multiple_reviews_resolve_only_the_selected_request(tmp_path: Path):
    async def scenario():
        definition = load(
            {
                "id": "reviewers",
                "nodes": {
                    name: {
                        "class_type": "HumanReviewNode",
                        "inputs": {"reviewer": name},
                    }
                    for name in ("alice", "bob")
                },
                "outputs": ["alice", "bob"],
            },
        )
        executor = WorkflowExecutor(
            state_store=JsonWorkflowStateStore(tmp_path),
        )
        paused = await executor.execute(definition)
        with pytest.raises(ValueError, match="node_id is required"):
            await executor.resume(
                definition,
                paused.state_id,
                {"approved": True},
            )
        partial = await executor.resume(
            definition,
            paused.state_id,
            {"node_id": "alice", "approved": True},
        )
        assert partial.status == WorkflowStatus.WAITING_HUMAN
        final = await executor.resume(
            definition,
            paused.state_id,
            {"node_id": "bob", "approved": True},
        )
        assert final.status == WorkflowStatus.COMPLETED
        assert final.outputs["alice"]["approved"] is True
        assert final.outputs["bob"]["approved"] is True
        assert (
            len(
                [
                    entry
                    for entry in final.execution_history
                    if entry.node_id == "alice"
                    and entry.status == WorkflowStatus.COMPLETED
                ],
            )
            == 1
        )

    asyncio.run(scenario())


def test_expired_review_cannot_be_approved(tmp_path: Path, monkeypatch):
    from qwenpaw.plugins_bundle.flowforge.engine.nodes.builtin import (
        human_review,
    )

    clock = [1000.0]
    monkeypatch.setattr(human_review.time, "time", lambda: clock[0])

    async def scenario():
        definition = review_flow()
        definition["nodes"]["review"]["inputs"]["timeout_sec"] = 1
        executor = WorkflowExecutor(
            state_store=JsonWorkflowStateStore(tmp_path),
        )
        paused = await executor.execute(load(definition))
        clock[0] = 1002.0
        result = await executor.resume(
            definition,
            paused.state_id,
            {"approved": True},
        )
        assert result.status == WorkflowStatus.FAILED
        assert "expired" in result.errors[0]

    asyncio.run(scenario())


def test_script_timeout_kills_worker_without_blocking_event_loop():
    async def scenario():
        start = time.monotonic()
        with pytest.raises(ScriptTimeoutError):
            await execute_script("while True: pass", timeout_sec=0.05)
        assert time.monotonic() - start < 1
        result = await execute_script(
            "def twice(x):\n    return x * 2\nresult = twice(3)",
        )
        assert result.result == 6

    asyncio.run(scenario())


def test_script_cancellation_and_json_argument_contract():
    async def scenario():
        result = await execute_script(
            "result = sum(inputs['values'])",
            inputs={"inputs": {"values": [2, 3]}},
        )
        assert result.result == 5
        task = asyncio.create_task(
            execute_script("while True: pass", timeout_sec=30),
        )
        await asyncio.sleep(0.03)
        task.cancel()
        with pytest.raises(asyncio.CancelledError):
            await asyncio.wait_for(task, 0.5)

    asyncio.run(scenario())


def test_checkpoint_write_failure_does_not_claim_resumable_success():
    class BrokenStore:
        async def save(self, snapshot):
            raise OSError("disk full")

    async def scenario():
        with pytest.raises(
            RuntimeError,
            match="checkpoint could not be persisted",
        ):
            await WorkflowExecutor(state_store=BrokenStore()).execute(
                load(review_flow()),
            )

    asyncio.run(scenario())


def refine_flow():
    return {
        "id": "refine",
        "nodes": {
            "generate": tool("score"),
            "gate": {
                "class_type": "QualityGateNode",
                "inputs": {"score": ["generate", 0], "threshold": 0.7},
                "control": {"pass_node": "accepted", "fail_node": "refine"},
            },
            "refine": {
                "class_type": "IterativeRefineNode",
                "inputs": {"max_iterations": 2},
                "control": {
                    "retry_node": "generate",
                    "exhausted_node": "exhausted",
                },
            },
            "accepted": {
                "class_type": "OutputNode",
                "inputs": {"value": "${outputs.generate}"},
            },
            "exhausted": {
                "class_type": "OutputNode",
                "inputs": {"value": "retry budget exhausted"},
            },
        },
        "outputs": ["accepted", "exhausted"],
        "metadata": {"timeout_sec": 1},
    }


def test_bounded_refinement_reexecutes_with_actual_quality_score():
    scores = iter([0.2, 0.8])
    calls = []

    def evaluate():
        value = next(scores)
        calls.append(value)
        return value

    result = run(
        WorkflowExecutor(tool_registry={"score": evaluate}),
        refine_flow(),
    )
    assert result.status == WorkflowStatus.COMPLETED
    assert calls == [0.2, 0.8]
    assert result.outputs == {"accepted": 0.8}
    assert [entry.node_id for entry in result.execution_history] == [
        "generate",
        "gate",
        "refine",
        "generate",
        "gate",
        "accepted",
    ]


def test_refinement_exhausts_after_initial_attempt_plus_retry_budget():
    calls = []
    result = run(
        WorkflowExecutor(
            tool_registry={"score": lambda: calls.append(0.1) or 0.1},
        ),
        refine_flow(),
    )
    assert result.status == WorkflowStatus.COMPLETED
    assert calls == [0.1, 0.1, 0.1]
    assert result.outputs == {"exhausted": "retry budget exhausted"}


def test_quality_gate_requires_explicit_score_and_parallel_never_fakes_work():
    with pytest.raises(ValidationError):
        run(
            WorkflowExecutor(),
            {
                "id": "no-score",
                "nodes": {"gate": {"class_type": "QualityGateNode"}},
                "outputs": ["gate"],
            },
        )
    definition = {
        "id": "embedded-parallel",
        "nodes": {
            "parallel": {
                "class_type": "ParallelNode",
                "control": {
                    "branches": [{"id": "branch", "nodes": ["effect"]}],
                },
            },
            "effect": tool("effect"),
        },
        "outputs": ["parallel"],
    }
    calls = []
    result = run(
        WorkflowExecutor(tool_registry={"effect": lambda: calls.append(True)}),
        definition,
    )
    assert result.status == WorkflowStatus.FAILED
    assert not calls


def test_checkpoint_inside_second_iteration_preserves_scheduler_state(
    tmp_path: Path,
):
    async def scenario():
        calls = []
        scores = iter([0.2, 0.8])

        def evaluate():
            score = next(scores)
            calls.append(score)
            return score

        definition = refine_flow()
        definition["nodes"]["generate"]["control"] = {"next": "review"}
        definition["nodes"]["review"] = {
            "class_type": "HumanReviewNode",
            "inputs": {"reviewer": "operator"},
            "control": {"next": "gate"},
        }
        executor = WorkflowExecutor(
            tool_registry={"score": evaluate},
            state_store=JsonWorkflowStateStore(tmp_path),
        )
        first = await executor.execute(load(definition))
        assert first.status == WorkflowStatus.WAITING_HUMAN
        second = await executor.resume(
            definition,
            first.state_id,
            {"approved": True},
        )
        assert second.status == WorkflowStatus.WAITING_HUMAN
        assert calls == [0.2, 0.8]
        restarted = WorkflowExecutor(
            tool_registry={"score": evaluate},
            state_store=JsonWorkflowStateStore(tmp_path),
        )
        final = await restarted.resume(
            definition,
            first.state_id,
            {"approved": True},
        )
        assert final.status == WorkflowStatus.COMPLETED
        assert final.outputs == {"accepted": 0.8}
        assert calls == [0.2, 0.8]

    asyncio.run(scenario())


@pytest.mark.parametrize("fails", [False, True])
def test_error_handler_runs_only_on_failure_and_keeps_failure_visible(fails):
    calls = []

    def process():
        calls.append("process")
        if fails:
            raise RuntimeError("invalid source data")
        return "okay"

    definition = {
        "id": "fallback",
        "nodes": {
            "process": tool(
                "process",
                control={"next": "normal", "error_handler": "fallback"},
            ),
            "normal": tool("normal"),
            "fallback": tool("fallback"),
        },
        "outputs": ["normal", "fallback"],
    }
    executor = WorkflowExecutor(
        tool_registry={
            "process": process,
            "normal": lambda: calls.append("normal"),
            "fallback": lambda: calls.append("fallback"),
        },
    )
    result = run(executor, definition)
    assert result.status == (
        WorkflowStatus.FAILED if fails else WorkflowStatus.COMPLETED
    )
    assert calls == (
        ["process", "fallback"] if fails else ["process", "normal"]
    )


def test_workflow_inputs_cannot_inject_review_decision():
    with pytest.raises(ValidationError, match="reserved runtime keys"):
        run(
            WorkflowExecutor(),
            review_flow(),
            {"__resume__review": {"approved": True}},
        )


def test_document_metadata_cannot_expand_refinement_budget():
    calls = []
    definition = refine_flow()
    definition["metadata"]["refine_counters"] = {"refine": -999}
    result = run(
        WorkflowExecutor(
            tool_registry={"score": lambda: calls.append(True) or 0.1},
        ),
        definition,
    )
    assert result.outputs == {"exhausted": "retry budget exhausted"}
    assert len(calls) == 3


@pytest.mark.parametrize(
    "class_type",
    ["ToolNode", "ToolCallNode", "Tool.guarded"],
)
def test_governance_nonretryable_error_never_retries(class_type):
    from qwenpaw.plugins_bundle.flowforge.engine.adapter.tool_registry import (
        ToolResult,
        ToolExecResult,
    )
    from qwenpaw.plugins_bundle.flowforge.engine.adapter.tool_base import (
        BaseTool,
    )
    from qwenpaw.plugins_bundle.flowforge.engine.nodes.tool_factory import (
        build_node_class,
    )
    from qwenpaw.plugins_bundle.flowforge.engine.nodes import bootstrap

    class GuardedExecutor:
        def __init__(self):
            self.calls = 0

        async def execute(self, name, params, context):
            assert name == "guarded"
            assert params == {}
            assert context.workflow_id == "no-retry"
            self.calls += 1
            return ToolExecResult(
                ToolResult(
                    success=False,
                    error="approval service unavailable",
                    retryable=False,
                ),
            )

    guarded = GuardedExecutor()
    registry = bootstrap()
    if class_type.startswith("Tool."):
        registry.register(
            build_node_class(
                BaseTool(
                    SimpleNamespace(
                        name="guarded",
                        description="guarded",
                        input_schema={"type": "object", "properties": {}},
                    ),
                ),
            ),
        )
    inputs = (
        {"tool_name": "guarded"}
        if class_type == "ToolNode"
        else {"tool": "guarded"}
        if class_type == "ToolCallNode"
        else {}
    )
    definition = {
        "id": "no-retry",
        "nodes": {
            "guarded": {
                "class_type": class_type,
                "inputs": inputs,
                "control": {"max_retries": 2, "retry_delay_sec": 0},
            },
        },
        "outputs": ["guarded"],
    }
    result = run(
        WorkflowExecutor(node_registry=registry, tool_executor=guarded),
        definition,
    )
    assert result.status == WorkflowStatus.FAILED
    assert guarded.calls == 1
    assert result.errors == ["guarded: approval service unavailable"]


def test_dynamic_readonly_tools_reenter_governance_each_loop_attempt():
    from qwenpaw.plugins_bundle.flowforge.engine.adapter.tool_registry import (
        ToolResult,
        ToolExecResult,
    )
    from qwenpaw.plugins_bundle.flowforge.engine.adapter.tool_base import (
        BaseTool,
    )
    from qwenpaw.plugins_bundle.flowforge.engine.nodes.tool_factory import (
        build_node_class,
    )
    from qwenpaw.plugins_bundle.flowforge.engine.nodes import bootstrap

    class LiveExecutor:
        def __init__(self):
            self.calls = 0

        async def execute(self, name, params, context):
            assert name == "live_score"
            assert params == {}
            assert context.workflow_id == "refine"
            self.calls += 1
            return ToolExecResult(
                ToolResult(data=0.2 if self.calls == 1 else 0.8),
            )

    governed = LiveExecutor()
    registry = bootstrap()
    registry.register(
        build_node_class(
            BaseTool(
                SimpleNamespace(
                    name="live_score",
                    description="live read",
                    input_schema={"type": "object", "properties": {}},
                ),
            ),
        ),
    )
    definition = refine_flow()
    definition["nodes"]["generate"] = {
        "class_type": "Tool.live_score",
        "inputs": {},
    }
    result = run(
        WorkflowExecutor(node_registry=registry, tool_executor=governed),
        definition,
    )
    assert result.status == WorkflowStatus.COMPLETED
    assert governed.calls == 2
    assert result.outputs == {"accepted": 0.8}


def test_dynamic_tool_output_parameter_and_renamed_control_remain_separate():
    from qwenpaw.plugins_bundle.flowforge.engine.adapter.tool_registry import (
        ToolResult,
        ToolExecResult,
    )
    from qwenpaw.plugins_bundle.flowforge.engine.adapter.tool_base import (
        BaseTool,
    )
    from qwenpaw.plugins_bundle.flowforge.engine.nodes.tool_factory import (
        build_node_class,
    )
    from qwenpaw.plugins_bundle.flowforge.engine.nodes import bootstrap

    seen = []

    class GovernedExecutor:
        async def execute(self, name, params, context):
            assert name == "runtime_collision"
            assert context.workflow_id == "control-collision"
            seen.append(params)
            return ToolExecResult(
                ToolResult(data={"answer": params["output"]}),
            )

    registry = bootstrap()
    registry.register(
        build_node_class(
            BaseTool(
                SimpleNamespace(
                    name="runtime_collision",
                    description="output param",
                    input_schema={
                        "type": "object",
                        "properties": {"output": {"type": "string"}},
                        "required": ["output"],
                    },
                ),
            ),
        ),
    )
    definition = {
        "id": "control-collision",
        "nodes": {
            "call": {
                "class_type": "Tool.runtime_collision",
                "inputs": {"output": "business", "__flow_output": "saved"},
            },
            "result": {
                "class_type": "OutputNode",
                "inputs": {
                    "value": "${vars.saved.answer}",
                    "__flow_dependencies": [["call", 0]],
                },
            },
        },
        "outputs": ["result"],
    }
    result = run(
        WorkflowExecutor(
            node_registry=registry,
            tool_executor=GovernedExecutor(),
        ),
        definition,
    )
    assert result.status == WorkflowStatus.COMPLETED
    assert seen == [{"output": "business"}]
    assert result.outputs == {"result": "business"}
