# -*- coding: utf-8 -*-
"""Regression coverage for FlowForge's visual-authoring execution contract."""

from __future__ import annotations

import asyncio
import os
import subprocess
import sys
import time
from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient

from qwenpaw.plugins_bundle.flowforge.engine import (
    WorkflowExecutor,
    WorkflowStatus,
    load,
    validate,
)
from qwenpaw.plugins_bundle.flowforge.router import build_router
from qwenpaw.plugins_bundle.flowforge.execution_repository import (
    ExecutionRepository,
)
from qwenpaw.plugins_bundle.flowforge.service import (
    WorkflowService,
    _materialize_edge_dependencies,
)


def test_canvas_edge_materializes_order_and_target_socket() -> None:
    payload = {
        "id": "edge-contract",
        "nodes": {
            "input": {
                "class_type": "InputNode",
                "inputs": {"name": "request"},
            },
            "output": {
                "class_type": "OutputNode",
                "inputs": {},
            },
        },
        "edges": [
            {
                "source": "input",
                "target": "output",
                "target_handle": "value",
            },
        ],
        "outputs": ["output"],
        "start_id": "input",
    }

    canonical = _materialize_edge_dependencies(payload)

    assert canonical["nodes"]["output"]["inputs"]["value"] == ["input", 0]
    assert canonical["nodes"]["output"]["inputs"]["__flow_dependencies"] == [
        ["input", 0],
    ]
    result = asyncio.run(
        WorkflowExecutor().execute(load(canonical), {"request": "VALUE"}),
    )
    assert result.outputs == {"output": "VALUE"}
    assert [entry.node_id for entry in result.execution_history] == [
        "input",
        "output",
    ]


class _RecordingRuntime:
    def __init__(self) -> None:
        self.calls: list[str] = []
        self.queries: list[str] = []

    async def run_agent_turn(self, _agent_id: str, query: str) -> str:
        self.queries.append(query)
        step = query.split("：", 1)[-1].split("\n", 1)[0]
        self.calls.append(step)
        await asyncio.sleep(0.005)
        return step


def test_generated_sop_is_strictly_ordered_and_streams_progress(
    tmp_path: Path,
) -> None:
    service = WorkflowService(flows_dir=tmp_path)
    runtime = _RecordingRuntime()
    service.executor.agent_runtime = runtime
    flow = service.generate_flow(
        "步骤一；步骤二；步骤三",
        agent_id="stable-controller-id",
    )
    assert flow["nodes"]["step_1"]["inputs"]["agent_id"] == (
        "stable-controller-id"
    )
    service.save_flow(flow["id"], flow)

    handle = service.start_run(flow["id"], {"request": "test"})
    deadline = time.monotonic() + 3
    while not handle.is_done and time.monotonic() < deadline:
        time.sleep(0.01)

    assert handle.result is not None
    assert runtime.calls == ["步骤一", "步骤二", "步骤三"]
    assert "## 上游输入/产物\n步骤一" in runtime.queries[1]
    assert [entry.node_id for entry in handle.result.execution_history] == [
        "input",
        "step_1",
        "step_2",
        "step_3",
        "output",
    ]
    assert handle.progress.history()
    assert handle.progress.node_statuses() == {
        "input": "success",
        "step_1": "success",
        "step_2": "success",
        "step_3": "success",
        "output": "success",
    }


def test_generate_route_binds_nodes_to_stable_agent_id(
    tmp_path: Path,
) -> None:
    service = WorkflowService(flows_dir=tmp_path)
    app = FastAPI()
    app.include_router(build_router(service))

    response = TestClient(app).post(
        "/generate",
        json={
            "prompt": "检查数据；形成结论",
            "name": "稳定绑定",
            "agent_id": "cloud-orchestrator",
        },
    )

    assert response.status_code == 200
    assert response.json()["nodes"]["step_1"]["inputs"]["agent_id"] == (
        "cloud-orchestrator"
    )


def test_implicit_outputs_are_graph_leaves_not_dependency_targets() -> None:
    document = load(
        {
            "id": "implicit-output",
            "nodes": {
                "input": {
                    "class_type": "InputNode",
                    "inputs": {"name": "request"},
                },
                "output": {
                    "class_type": "OutputNode",
                    "inputs": {"value": ["input", 0]},
                },
            },
            "start_id": "input",
        },
    )

    validation = validate(document)

    assert validation.ok
    assert validation.output_nodes == ["output"]
    result = asyncio.run(
        WorkflowExecutor().execute(document, {"request": "VALUE"}),
    )
    assert result.outputs == {"output": "VALUE"}


class _SlowRuntime:
    async def run_agent_turn(self, _agent_id: str, _query: str) -> str:
        await asyncio.sleep(0.2)
        return "late result"


def test_cancel_is_reported_as_cancelled_even_during_startup(
    tmp_path: Path,
) -> None:
    service = WorkflowService(flows_dir=tmp_path)
    service.executor.agent_runtime = _SlowRuntime()
    flow = service.generate_flow("慢步骤")
    service.save_flow(flow["id"], flow)

    handle = service.start_run(flow["id"], {"request": "test"})
    assert service.cancel_run(handle.run_id)
    assert handle.status == WorkflowStatus.CANCELLED

    deadline = time.monotonic() + 3
    while not handle.is_done and time.monotonic() < deadline:
        time.sleep(0.01)

    assert handle.error is None
    assert handle.result is not None
    assert handle.result.status == WorkflowStatus.CANCELLED


def test_human_review_can_resume_from_durable_checkpoint(
    tmp_path: Path,
) -> None:
    service = WorkflowService(flows_dir=tmp_path)
    flow = {
        "id": "human-review-resume",
        "nodes": {
            "input": {
                "class_type": "InputNode",
                "inputs": {"name": "request"},
            },
            "review": {
                "class_type": "HumanReviewNode",
                "inputs": {
                    "reviewer": "owner",
                    "review_prompt": "请审批",
                    "__flow_dependencies": [["input", 0]],
                },
            },
            "output": {
                "class_type": "OutputNode",
                "inputs": {
                    "value": ["review", 0],
                    "__flow_dependencies": [["review", 0]],
                },
            },
        },
        "outputs": ["output"],
        "start_id": "input",
    }
    service.save_flow(flow["id"], flow)

    first = service.start_run(flow["id"], {"request": "test"})
    deadline = time.monotonic() + 3
    while not first.is_done and time.monotonic() < deadline:
        time.sleep(0.01)

    assert first.result is not None
    assert first.result.status == WorkflowStatus.WAITING_HUMAN
    assert str(first.state_id) != "00000000-0000-0000-0000-000000000000"

    resumed = service.resume_run(
        first.run_id,
        {"approved": True, "comments": "可以发布"},
    )
    deadline = time.monotonic() + 3
    while not resumed.is_done and time.monotonic() < deadline:
        time.sleep(0.01)

    assert resumed.error is None
    assert resumed.result is not None
    assert resumed.result.status == WorkflowStatus.COMPLETED
    assert resumed.result.outputs["output"]["approved"] is True
    completed_input_entries = [
        entry
        for entry in resumed.result.execution_history
        if entry.node_id == "input"
        and entry.status == WorkflowStatus.COMPLETED
    ]
    assert len(completed_input_entries) == 1


def test_completed_run_and_events_survive_service_restart(
    tmp_path: Path,
) -> None:
    service = WorkflowService(flows_dir=tmp_path)
    flow = {
        "id": "durable-run",
        "nodes": {
            "input": {
                "class_type": "InputNode",
                "inputs": {"name": "request"},
            },
            "output": {
                "class_type": "OutputNode",
                "inputs": {"value": ["input", 0]},
            },
        },
        "outputs": ["output"],
    }
    service.save_flow(flow["id"], flow)
    handle = service.start_run(flow["id"], {"request": "persisted"})
    deadline = time.monotonic() + 3
    while not handle.is_done and time.monotonic() < deadline:
        time.sleep(0.01)

    restarted = WorkflowService(flows_dir=tmp_path)
    record = restarted.get_run_record(handle.run_id)

    assert record is not None
    assert record["status"] == "completed"
    assert record["outputs"] == {"output": "persisted"}
    assert record["execution_history"]
    assert record["events"]
    assert restarted.list_runs()[0]["run_id"] == handle.run_id


def test_tool_failure_is_a_failed_workflow() -> None:
    document = load(
        {
            "id": "tool-failure",
            "nodes": {
                "tool": {
                    "class_type": "ToolNode",
                    "inputs": {"tool_name": "missing", "args": {}},
                },
            },
            "outputs": ["tool"],
        },
    )

    result = asyncio.run(WorkflowExecutor().execute(document, {}))

    assert result.status == WorkflowStatus.FAILED
    assert result.errors
    assert "unknown tool" in result.errors[0]


def test_parallel_node_collects_all_declared_branches() -> None:
    document = load(
        {
            "id": "parallel-contract",
            "nodes": {
                "parallel": {
                    "class_type": "ParallelNode",
                    "inputs": {"merge_strategy": "collect"},
                    "control": {
                        "branches": [
                            {"id": "left"},
                            {"id": "right"},
                        ],
                    },
                },
            },
            "outputs": ["parallel"],
        },
    )

    result = asyncio.run(WorkflowExecutor().execute(document, {}))

    assert result.status == WorkflowStatus.COMPLETED
    assert len(result.outputs["parallel"]) == 2


def test_condition_executes_only_the_selected_branch() -> None:
    document = load(
        {
            "id": "condition-contract",
            "nodes": {
                "input": {
                    "class_type": "InputNode",
                    "inputs": {"name": "flag"},
                },
                "condition": {
                    "class_type": "ConditionNode",
                    "inputs": {"__flow_dependencies": [["input", 0]]},
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
                "yes": {
                    "class_type": "OutputNode",
                    "inputs": {
                        "value": "YES",
                        "__flow_dependencies": [["condition", 0]],
                    },
                },
                "no": {
                    "class_type": "OutputNode",
                    "inputs": {
                        "value": "NO",
                        "__flow_dependencies": [["condition", 0]],
                    },
                },
            },
            "outputs": ["yes", "no"],
            "start_id": "input",
        },
    )

    result = asyncio.run(WorkflowExecutor().execute(document, {"flag": True}))
    executed = [entry.node_id for entry in result.execution_history]

    assert result.status == WorkflowStatus.COMPLETED
    assert "yes" in executed
    assert "no" not in executed


class _WorkflowRegistry:
    def __init__(self, definitions: dict[str, dict]) -> None:
        self.definitions = definitions

    async def get(self, flow_id: str) -> dict | None:
        return self.definitions.get(flow_id)


def test_subworkflow_returns_child_outputs() -> None:
    child = {
        "id": "child",
        "nodes": {
            "input": {
                "class_type": "InputNode",
                "inputs": {"name": "request"},
            },
            "output": {
                "class_type": "OutputNode",
                "inputs": {"value": ["input", 0]},
            },
        },
        "outputs": ["output"],
    }
    parent = load(
        {
            "id": "parent",
            "nodes": {
                "child": {
                    "class_type": "SubworkflowNode",
                    "inputs": {
                        "subworkflow_id": "child",
                        "subworkflow_inputs": {"request": "nested"},
                    },
                },
            },
            "outputs": ["child"],
        },
    )
    executor = WorkflowExecutor(
        workflow_registry=_WorkflowRegistry({"child": child}),
    )

    result = asyncio.run(executor.execute(parent, {}))

    assert result.status == WorkflowStatus.COMPLETED
    assert result.outputs["child"] == {"output": "nested"}


def test_sse_replays_persisted_events_after_restart(tmp_path: Path) -> None:
    service = WorkflowService(flows_dir=tmp_path)
    service.save_flow(
        "sse-flow",
        {
            "id": "sse-flow",
            "nodes": {
                "output": {
                    "class_type": "OutputNode",
                    "inputs": {"value": "done"},
                },
            },
            "outputs": ["output"],
        },
    )
    handle = service.start_run("sse-flow", {})
    deadline = time.monotonic() + 3
    while not handle.is_done and time.monotonic() < deadline:
        time.sleep(0.01)

    restarted = WorkflowService(flows_dir=tmp_path)
    app = FastAPI()
    app.include_router(build_router(restarted))
    response = TestClient(app).get(f"/runs/{handle.run_id}/events")

    assert response.status_code == 200
    assert "execution_start" in response.text
    assert "execution_success" in response.text
    assert "execution_completed" not in response.text


def test_progress_history_keeps_point_in_time_statuses() -> None:
    result_events = []
    executor = WorkflowExecutor(
        progress_handlers=[result_events.append],
    )
    document = load(
        {
            "id": "event-snapshot",
            "nodes": {
                "output": {
                    "class_type": "OutputNode",
                    "inputs": {"value": "done"},
                },
            },
            "outputs": ["output"],
        },
    )

    asyncio.run(executor.execute(document, {}))
    executing = next(
        event
        for event in result_events
        if event.type == "executing" and event.node_id == "output"
    )

    assert executing.state is not None
    assert executing.state.status.value == "running"


def test_repository_recovers_runs_interrupted_by_restart(
    tmp_path: Path,
) -> None:
    repository = ExecutionRepository(tmp_path)
    repository.create(
        "interrupted",
        "flow",
        status="running",
        started_at=time.time(),
    )

    assert repository.recover_incomplete() == 1
    record = repository.get("interrupted")

    assert record is not None
    assert record["status"] == "failed"
    assert record["finished_at"] is not None
    assert "stopped before" in record["error"]


def test_repository_does_not_recover_run_owned_by_live_process(
    tmp_path: Path,
) -> None:
    repository = ExecutionRepository(tmp_path)
    repository.create(
        "live-run",
        "flow",
        status="running",
        started_at=time.time(),
        owner_pid=os.getpid(),
    )

    assert repository.recover_incomplete(active_owner_pid=os.getpid()) == 0
    assert repository.get("live-run")["status"] == "running"


def test_websocket_replays_persisted_run_after_restart(tmp_path: Path) -> None:
    service = WorkflowService(flows_dir=tmp_path)
    service.save_flow(
        "ws-flow",
        {
            "id": "ws-flow",
            "nodes": {
                "output": {
                    "class_type": "OutputNode",
                    "inputs": {"value": "done"},
                },
            },
            "outputs": ["output"],
        },
    )
    handle = service.start_run("ws-flow", {})
    deadline = time.monotonic() + 3
    while not handle.is_done and time.monotonic() < deadline:
        time.sleep(0.01)

    restarted = WorkflowService(flows_dir=tmp_path)
    app = FastAPI()
    app.include_router(build_router(restarted))
    with TestClient(app).websocket_connect("/ws") as websocket:
        websocket.send_json({"type": "subscribe", "run_id": handle.run_id})
        messages = []
        while True:
            message = websocket.receive_json()
            messages.append(message)
            if message.get("type") == "run_finished":
                break

    assert any(
        message.get("type") == "execution_start" for message in messages
    )
    assert messages[-1]["status"] == "completed"


def test_packaged_flowforge_has_no_source_drift() -> None:
    repository_root = Path(__file__).resolve().parents[4]
    completed = subprocess.run(
        [
            sys.executable,
            str(repository_root / "scripts" / "sync_flowforge_bundle.py"),
            "--check",
        ],
        cwd=repository_root,
        capture_output=True,
        text=True,
        check=False,
    )

    assert completed.returncode == 0, completed.stdout + completed.stderr
