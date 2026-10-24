"""Exercise the agent/tool/workflow round trip without a model provider."""

import asyncio
import json
from types import SimpleNamespace

import pytest

from qwenpaw.plugins_bundle.flowforge.engine.adapter.agent_runtime import AgentRuntime
from qwenpaw.plugins_bundle.flowforge.invocation import (
    MAX_WORKFLOW_DEPTH,
    workflow_stack,
)
from qwenpaw.plugins_bundle.flowforge.service import WorkflowService
from qwenpaw.plugins_bundle.flowforge.tools import build_tools
from qwenpaw.schemas import Message, Role, RunStatus, TextContent


def decode(chunk):
    return json.loads(chunk.content[0].text)


@pytest.fixture
def service(tmp_path):
    instance = WorkflowService(flows_dir=tmp_path)
    yield instance
    instance._loop.call_soon_threadsafe(instance._loop.stop)
    instance._loop_thread.join(timeout=3)


def test_agent_tool_to_workflow_to_native_agent(service):
    requests = []
    nested_errors = []

    class Workspace:
        async def stream_query(self, request):
            requests.append(request)
            # An agent inside a workflow must not recursively launch that flow.
            nested_errors.append(
                decode(await tools["flowforge_run_workflow"](flow["id"]))
            )
            yield {
                "object": "message",
                "status": "in_progress",
                "role": "assistant",
                "content": [{"type": "text", "text": "partial"}],
            }
            yield Message(
                object="message",
                status=RunStatus.Completed,
                role=Role.ASSISTANT,
                content=[TextContent(type="text", text="approved")],
            )

    class Manager:
        async def get_agent(self, agent_id):
            assert agent_id == "reviewer"
            return Workspace()

    service.executor.agent_runtime = AgentRuntime(Manager())
    flow = service.generate_flow("Review the request", agent_id="reviewer")
    service.save_flow(flow["id"], flow)
    tools = {tool.__name__: tool for tool in build_tools(service)}
    result = decode(
        asyncio.run(
            tools["flowforge_run_workflow"](flow["id"], {"request": "purchase"}, 3)
        )
    )
    assert result["status"] == "completed", result
    assert result["outputs"] == {"output": "approved"}
    assert "purchase" in requests[0]["input"][0]["content"][0]["text"]
    assert requests[0]["request_context"]["workflow_stack"] == [flow["id"]]
    assert "Recursive workflow" in nested_errors[0]["error"]
    assert (
        decode(asyncio.run(tools["flowforge_get_run"](result["run_id"])))["outputs"]
        == result["outputs"]
    )


@pytest.mark.parametrize("kind", ["missing", "unsupported", "error"])
def test_agent_errors_do_not_fall_back_to_llm(kind):
    class FailedWorkspace:
        async def stream_query(self, request):
            yield {
                "object": "response",
                "status": "failed",
                "error": {"message": "provider unavailable"},
            }

    workspace = {"missing": None, "unsupported": object(), "error": FailedWorkspace()}[
        kind
    ]
    runtime = AgentRuntime(SimpleNamespace(agents={"reviewer": workspace}))
    with pytest.raises(RuntimeError):
        asyncio.run(runtime.run_agent_turn("reviewer", "Review"))


def test_tool_validation_and_depth_limit_create_no_run(service):
    tools = {tool.__name__: tool for tool in build_tools(service)}
    for wait in (-1, 61, float("nan")):
        assert "error" in decode(
            asyncio.run(tools["flowforge_run_workflow"]("missing", wait_seconds=wait))
        )
    assert "error" in decode(asyncio.run(tools["flowforge_get_run"]("missing")))
    token = workflow_stack.set(tuple(str(index) for index in range(MAX_WORKFLOW_DEPTH)))
    try:
        with pytest.raises(ValueError, match="nesting"):
            service.start_run("another")
    finally:
        workflow_stack.reset(token)
    assert service.list_runs() == []


def test_wait_expiry_keeps_run_queryable(service):
    class SlowRuntime:
        async def run_agent_turn(self, agent_id, query):
            await asyncio.sleep(0.15)
            return "finished"

    service.executor.agent_runtime = SlowRuntime()
    flow = service.generate_flow("Review")
    service.save_flow(flow["id"], flow)
    tools = {tool.__name__: tool for tool in build_tools(service)}

    async def scenario():
        result = decode(await tools["flowforge_run_workflow"](flow["id"], {}, 0.01))
        assert result["status"] == "running"
        handle = service.get_run(result["run_id"])
        for _ in range(100):
            if handle.is_done:
                break
            await asyncio.sleep(0.01)
        assert handle.is_done
        assert decode(await tools["flowforge_get_run"](result["run_id"]))[
            "outputs"
        ] == {"output": "finished"}

    asyncio.run(scenario())
