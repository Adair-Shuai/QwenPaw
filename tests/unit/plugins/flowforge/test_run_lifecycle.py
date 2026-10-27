# -*- coding: utf-8 -*-
"""Lifecycle integration tests with the real scheduler and durable \
repository."""

import asyncio
import time
from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
from types import SimpleNamespace

import pytest

from qwenpaw.plugins_bundle.flowforge.engine.adapter.agent_runtime import (
    AgentRuntime,
)
from qwenpaw.plugins_bundle.flowforge.engine.adapter.agent_events import (
    AgentEventType,
)
from qwenpaw.plugins_bundle.flowforge.service import WorkflowService
from qwenpaw.plugins_bundle.flowforge.execution_repository import (
    ExecutionRepository,
)
from qwenpaw.plugins_bundle.flowforge.invocation import current_run


@pytest.fixture(name="service")
def _service_fixture(tmp_path):
    instance = WorkflowService(flows_dir=tmp_path)
    yield instance
    for record in instance.list_runs():
        instance.cancel_run(record["run_id"])
    instance.close(timeout=3)


@contextmanager
def _restarted_service(service):
    service.close(timeout=3)
    restarted = WorkflowService(flows_dir=service.flows_dir)
    try:
        yield restarted
    finally:
        restarted.close(timeout=3)


def wait(handle):
    deadline = time.monotonic() + 5
    while not handle.is_done and time.monotonic() < deadline:
        time.sleep(0.01)
    assert handle.is_done, handle.to_dict()
    return handle.to_dict()


def flow(service, flow_id, nodes):
    output = next(reversed(nodes))
    payload = {"id": flow_id, "nodes": nodes, "outputs": [output]}
    service.save_flow(flow_id, payload)
    return payload


def child_node(child):
    return {
        "class_type": "SubworkflowNode",
        "inputs": {"subworkflow_id": child},
    }


def test_cancel_finalizes_node_events_live_and_persisted_records(service):
    flow(
        service,
        "cancel-status",
        {
            "before": {
                "class_type": "OutputNode",
                "inputs": {"value": "kept"},
            },
            "wait": {
                "class_type": "WaitNode",
                "inputs": {
                    "seconds": 60,
                    "__flow_dependencies": [["before", 0]],
                },
            },
            "after": {
                "class_type": "OutputNode",
                "inputs": {"value": ["wait", 0]},
            },
        },
    )
    handle = service.start_run("cancel-status")
    deadline = time.monotonic() + 3
    while (
        handle.progress.node_statuses().get("wait") != "running"
        and time.monotonic() < deadline
    ):
        time.sleep(0.01)
    assert handle.progress.node_statuses()["wait"] == "running"
    assert service.cancel_run(handle.run_id)
    result = wait(handle)
    assert result["status"] == "cancelled"
    assert result["node_statuses"] == {
        "before": "success",
        "wait": "cancelled",
    }
    events = ExecutionRepository(service.flows_dir).get(handle.run_id)["events"]
    cancelled = next(
        event for event in events if event["type"] == "node_cancelled"
    )
    assert (
        cancelled["node_id"] == "wait" and cancelled["state"]["finished_at_ms"]
    )
    assert events[-1]["type"] == "execution_cancelled"
    with _restarted_service(service) as restarted:
        assert (
            restarted.get_run_record(handle.run_id)["node_statuses"]
            == result["node_statuses"]
        )


def test_cancel_paused_and_legacy_records_closes_only_unfinished_nodes(
    service,
):
    ExecutionRepository(service.flows_dir).create(
        "legacy",
        "review",
        status="waiting_human",
        node_statuses={
            "before": "success",
            "review": "blocked",
            "skip": "skipped",
        },
    )
    assert service.cancel_run("legacy")
    result = service.get_run_record("legacy")
    assert result["status"] == "cancelled"
    assert result["node_statuses"] == {
        "before": "success",
        "review": "cancelled",
        "skip": "skipped",
    }
    assert result["finished_at"]
    ExecutionRepository(service.flows_dir).create(
        "old",
        "cancel",
        status="cancelled",
        node_statuses={"wait": "running"},
    )
    assert service.get_run_record("old")["node_statuses"] == {
        "wait": "cancelled",
    }


def review_flow(service, flow_id="review"):
    return flow(
        service,
        flow_id,
        {
            "work": {
                "class_type": "AgentNode",
                "inputs": {"agent_id": "worker", "query": "do once"},
            },
            "review": {
                "class_type": "HumanReviewNode",
                "inputs": {
                    "reviewer": "owner",
                    "__flow_dependencies": [["work", 0]],
                },
            },
            "out": {
                "class_type": "OutputNode",
                "inputs": {"value": ["review", 0]},
            },
        },
    )


def test_nested_runs_share_service_identity_and_durable_lineage(service):
    flow(
        service,
        "child",
        {"out": {"class_type": "OutputNode", "inputs": {"value": "done"}}},
    )
    flow(service, "parent", {"child": child_node("child")})
    token = current_run.set(None)
    try:
        parent = service.start_run("parent")
    finally:
        current_run.reset(token)
    result = wait(parent)
    assert result["status"] == "completed", result
    assert result["outputs"] == {"child": {"out": "done"}}
    records = service.list_runs()
    child = next(record for record in records if record["flow_id"] == "child")
    assert child["parent_run_id"] == parent.run_id
    assert child["root_run_id"] == parent.run_id
    assert child["trigger_type"] == "subworkflow"
    assert child["workflow_stack"] == ["parent", "child"]
    persisted = ExecutionRepository(service.flows_dir).get(child["run_id"])
    assert persisted["parent_run_id"] == parent.run_id
    assert "flow_snapshot" not in child


def test_cycle_through_subworkflow_fails_without_unbounded_children(service):
    flow(service, "a", {"child": child_node("b")})
    flow(service, "b", {"child": child_node("a")})
    result = wait(service.start_run("a"))
    assert result["status"] == "failed"
    assert "Recursive workflow" in str(result["errors"])
    assert len(service.list_runs()) == 2


def test_cancel_interrupts_inflight_agent_and_descendants(service):
    started = []
    stopped = []

    class Runtime:
        async def run_agent_turn(self, agent_id, query):
            assert agent_id == "worker"
            assert query == "wait"
            started.append(True)
            try:
                await asyncio.sleep(60)
            finally:
                stopped.append(True)

    service.executor.agent_runtime = Runtime()
    flow(
        service,
        "child",
        {
            "agent": {
                "class_type": "AgentNode",
                "inputs": {"agent_id": "worker", "query": "wait"},
            },
        },
    )
    flow(service, "parent", {"child": child_node("child")})
    parent = service.start_run("parent")
    deadline = time.monotonic() + 3
    while not started and time.monotonic() < deadline:
        time.sleep(0.01)
    assert started
    assert service.cancel_run(parent.run_id)
    assert wait(parent)["status"] == "cancelled"
    for record in service.list_runs():
        assert wait(service.get_run(record["run_id"]))["status"] == "cancelled"
    assert stopped == [True]


def test_paused_child_resumes_original_graph_without_repeating_effects(
    service,
):
    calls = []

    class Runtime:
        async def run_agent_turn(self, agent_id, query):
            assert agent_id == "worker"
            calls.append(query)
            return "effect committed"

    service.executor.agent_runtime = Runtime()
    review_flow(service)
    flow(service, "parent", {"child": child_node("review")})
    parent = service.start_run("parent")
    assert wait(parent)["status"] == "waiting_human"
    # Editing both definitions must not change an existing paused run.
    flow(
        service,
        "review",
        {"out": {"class_type": "OutputNode", "inputs": {"value": "WRONG"}}},
    )
    flow(
        service,
        "parent",
        {"out": {"class_type": "OutputNode", "inputs": {"value": "WRONG"}}},
    )
    resumed = service.resume_run(parent.run_id, {"approved": True})
    result = wait(resumed)
    assert result["status"] == "completed", result
    assert result["outputs"]["child"]["out"]["approved"] is True
    assert calls == ["do once"]
    assert result["root_run_id"] == parent.run_id
    assert result["resumed_from_run_id"] == parent.run_id
    assert result["parent_run_id"] is None
    child_resumes = [
        r
        for r in service.list_runs()
        if r["flow_id"] == "review" and r["trigger_type"] == "resume"
    ]
    assert child_resumes[0]["parent_run_id"] == resumed.run_id


def test_resume_is_single_use_and_rejects_completed_runs(service):
    flow(
        service,
        "review",
        {
            "review": {
                "class_type": "HumanReviewNode",
                "inputs": {"reviewer": "owner"},
            },
        },
    )
    original = service.start_run("review")
    wait(original)

    def attempt():
        try:
            return service.resume_run(original.run_id, {"approved": True})
        except ValueError:
            return None

    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(lambda _: attempt(), range(2)))
    handles = [handle for handle in results if handle is not None]
    assert len(handles) == 1
    assert wait(handles[0])["status"] == "completed"
    with pytest.raises(ValueError, match="Only a finalized"):
        service.resume_run(handles[0].run_id)
    assert (
        service.get_run_record(original.run_id)["resumed_by_run_id"]
        == handles[0].run_id
    )


def test_cancel_paused_tree_prevents_later_resume(service):
    flow(
        service,
        "review",
        {
            "review": {
                "class_type": "HumanReviewNode",
                "inputs": {"reviewer": "owner"},
            },
        },
    )
    flow(service, "parent", {"child": child_node("review")})
    parent = service.start_run("parent")
    wait(parent)
    service.cancel_run(parent.run_id)
    for record in service.list_runs():
        assert record["status"] == "cancelled"
        with pytest.raises(ValueError):
            service.resume_run(record["run_id"], {"approved": True})


def test_agent_resume_explicitly_rejects_fake_checkpoint_replay():
    called = []

    class Workspace:
        async def process(self, prompt):
            called.append(prompt)

    runtime = AgentRuntime(SimpleNamespace(agents={"worker": Workspace()}))

    async def collect():
        return [
            event
            async for event in runtime.resume("worker", "checkpoint", "yes")
        ]

    events = asyncio.run(collect())
    assert events[0].type == AgentEventType.ERROR
    assert events[-1].data["reason"] == "failed"
    assert not called


def test_paused_tree_survives_restart_and_flow_deletion(service):
    flow(
        service,
        "review",
        {
            "review": {
                "class_type": "HumanReviewNode",
                "inputs": {"reviewer": "owner"},
            },
        },
    )
    flow(service, "parent", {"child": child_node("review")})
    original = service.start_run("parent")
    assert wait(original)["status"] == "waiting_human"
    service.close(timeout=3)
    service.delete_flow("parent")
    service.delete_flow("review")
    restarted = WorkflowService(flows_dir=service.flows_dir)
    try:
        continuation = restarted.resume_run(
            original.run_id,
            {"approved": True},
        )
        result = wait(continuation)
        assert result["status"] == "completed", result
        assert result["outputs"]["child"]["review"]["approved"] is True
        with pytest.raises(ValueError, match="already resumed"):
            restarted.resume_run(original.run_id)
    finally:
        restarted.close(timeout=3)


def test_agent_started_child_gets_lineage_and_identity(service):
    from qwenpaw.app.agent_context import (
        get_current_user_id,
        get_current_session_id,
        set_current_user_id,
        set_current_session_id,
    )
    from qwenpaw.plugins_bundle.flowforge.tools import build_tools
    import json

    requests = []
    tools = {tool.__name__: tool for tool in build_tools(service)}
    flow(
        service,
        "child",
        {"out": {"class_type": "OutputNode", "inputs": {"value": "ok"}}},
    )

    class Workspace:
        async def stream_query(self, request):
            requests.append(request)
            response = await tools["flowforge_run_workflow"](
                "child",
                wait_seconds=2,
            )
            assert (
                json.loads(response.content[0].text)["status"] == "completed"
            )
            yield {
                "object": "message",
                "role": "assistant",
                "status": "completed",
                "content": [{"type": "text", "text": "done"}],
            }

    service.executor.agent_runtime = AgentRuntime(
        SimpleNamespace(agents={"worker": Workspace()}),
    )
    flow(
        service,
        "parent",
        {
            "agent": {
                "class_type": "AgentNode",
                "inputs": {"agent_id": "worker", "query": "call child"},
            },
        },
    )
    old_user, old_session = get_current_user_id(), get_current_session_id()
    try:
        set_current_user_id("alice")
        set_current_session_id("business-chat")
        parent = service.start_run("parent")
    finally:
        set_current_user_id(old_user)
        set_current_session_id(old_session)
    assert wait(parent)["status"] == "completed"
    child = next(
        record
        for record in service.list_runs()
        if record["flow_id"] == "child"
    )
    assert child["parent_run_id"] == parent.run_id
    assert child["user_id"] == "alice"
    assert child["session_id"] == "business-chat"
    assert child["trigger_type"] == "agent"
    assert requests[0]["user_id"] == "alice"
    assert requests[0]["request_context"]["workflow_run_id"] == parent.run_id
    assert (
        requests[0]["request_context"]["parent_session_id"] == "business-chat"
    )


def test_resume_endpoint_conflict_and_persisted_cancel(service):
    from fastapi import FastAPI
    from fastapi.testclient import TestClient
    from qwenpaw.plugins_bundle.flowforge.router import build_router

    flow(
        service,
        "review",
        {
            "review": {
                "class_type": "HumanReviewNode",
                "inputs": {"reviewer": "owner"},
            },
        },
    )
    original = service.start_run("review")
    wait(original)
    # Exercise the durable-record path used after process restart.
    with _restarted_service(service) as restarted:
        app = FastAPI()
        app.include_router(build_router(restarted))
        with TestClient(app) as client:
            assert (
                client.post(f"/runs/{original.run_id}/cancel").status_code == 200
            )
            assert (
                client.post(
                    f"/runs/{original.run_id}/resume",
                    json={"inputs": {"approved": True}},
                ).status_code
                == 409
            )


def test_parent_timeout_cancels_child_and_cleans_waiters(service):
    stopped = []

    class Runtime:
        async def run_agent_turn(self, agent_id, query):
            assert agent_id == "worker"
            assert query == "wait"
            try:
                await asyncio.sleep(60)
            finally:
                stopped.append(True)

    service.executor.agent_runtime = Runtime()
    flow(
        service,
        "child",
        {
            "agent": {
                "class_type": "AgentNode",
                "inputs": {"agent_id": "worker", "query": "wait"},
            },
        },
    )
    payload = flow(service, "parent", {"child": child_node("child")})
    payload["metadata"] = {"timeout_sec": 0.3}
    service.save_flow("parent", payload)
    parent = service.start_run("parent")
    assert wait(parent)["status"] == "timeout"
    child = next(
        record
        for record in service.list_runs()
        if record["flow_id"] == "child"
    )
    assert wait(service.get_run(child["run_id"]))["status"] == "cancelled"
    assert stopped == [True]
    assert service.executor.resource_snapshot()["active_runs"] == 0
    assert service.executor.resource_snapshot()["abort_waiters"] == 0


def test_parent_follows_child_already_resumed_by_reviewer(service):
    flow(
        service,
        "review",
        {
            "review": {
                "class_type": "HumanReviewNode",
                "inputs": {"reviewer": "owner"},
            },
        },
    )
    flow(service, "parent", {"child": child_node("review")})
    parent = service.start_run("parent")
    assert wait(parent)["status"] == "waiting_human"
    child = next(
        record
        for record in service.list_runs()
        if record["flow_id"] == "review"
    )
    assert (
        wait(service.resume_run(child["run_id"], {"approved": True}))["status"]
        == "completed"
    )
    result = wait(service.resume_run(parent.run_id))
    assert result["status"] == "completed"
    assert result["outputs"]["child"]["review"]["approved"] is True
    assert len(service.list_runs()) == 4


def test_cancelled_parent_cannot_spawn_late_child(service):
    flow(
        service,
        "review",
        {
            "review": {
                "class_type": "HumanReviewNode",
                "inputs": {"reviewer": "owner"},
            },
        },
    )
    parent = service.start_run("review")
    wait(parent)
    service.cancel_run(parent.run_id)
    token = current_run.set(
        {"run_id": parent.run_id, "root_run_id": parent.run_id},
    )
    try:
        with pytest.raises(ValueError, match="no longer accepting"):
            service.start_run("another")
    finally:
        current_run.reset(token)
    assert len(service.list_runs()) == 1
