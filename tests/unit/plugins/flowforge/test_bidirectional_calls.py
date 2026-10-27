# -*- coding: utf-8 -*-
"""Exercise the agent/tool/workflow round trip without a model provider."""

import asyncio
import json
from types import SimpleNamespace

import pytest

from qwenpaw.plugins_bundle.flowforge.engine.adapter.agent_runtime import (
    AgentRuntime,
)
from qwenpaw.plugins_bundle.flowforge.engine.adapter.agent_definition import (
    AgentDefinition,
    ToolsPolicy,
)
from qwenpaw.plugins_bundle.flowforge.invocation import (
    MAX_WORKFLOW_DEPTH,
    workflow_stack,
)
from qwenpaw.plugins_bundle.flowforge.service import WorkflowService
from qwenpaw.plugins_bundle.flowforge.engine.io import HiddenHolder
from qwenpaw.plugins_bundle.flowforge.engine.nodes.agent_exec import (
    run_agent_node,
)
from qwenpaw.plugins_bundle.flowforge.tools import build_tools
from qwenpaw.schemas import Message, Role, RunStatus, TextContent
from qwenpaw.runtime.builder import AgentBuilder, _resolve_react_iterations


def decode(chunk):
    return json.loads(chunk.content[0].text)


@pytest.fixture(name="service")
def _service_fixture(tmp_path):
    instance = WorkflowService(flows_dir=tmp_path)
    yield instance
    instance.close(timeout=3)


def test_agent_tool_to_workflow_to_native_agent(service):
    requests = []
    nested_errors = []

    class Workspace:
        async def stream_query(self, request):
            requests.append(request)
            # An agent inside a workflow must not recursively launch that flow.
            nested_errors.append(
                decode(await tools["flowforge_run_workflow"](flow["id"])),
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
            tools["flowforge_run_workflow"](
                flow["id"],
                {"request": "purchase"},
                3,
            ),
        ),
    )
    assert result["status"] == "completed", result
    assert result["outputs"] == {"output": "approved"}
    assert "purchase" in requests[0]["input"][0]["content"][0]["text"]
    assert requests[0]["request_context"]["workflow_stack"] == [flow["id"]]
    assert "Recursive workflow" in nested_errors[0]["error"]
    assert (
        decode(asyncio.run(tools["flowforge_get_run"](result["run_id"])))[
            "outputs"
        ]
        == result["outputs"]
    )


@pytest.mark.parametrize("kind", ["missing", "unsupported", "error"])
def test_agent_errors_do_not_fall_back_to_llm(kind):
    class FailedWorkspace:
        async def stream_query(self, request):
            assert request["request_context"]["agent_id"] == "reviewer"
            assert request["request_context"]["source"] == "flowforge"
            yield {
                "object": "response",
                "status": "failed",
                "error": {"message": "provider unavailable"},
            }

    workspace = {
        "missing": None,
        "unsupported": object(),
        "error": FailedWorkspace(),
    }[kind]
    runtime = AgentRuntime(SimpleNamespace(agents={"reviewer": workspace}))
    with pytest.raises(RuntimeError):
        asyncio.run(runtime.run_agent_turn("reviewer", "Review"))


def test_tool_validation_and_depth_limit_create_no_run(service):
    tools = {tool.__name__: tool for tool in build_tools(service)}
    for wait in (-1, 61, float("nan")):
        assert "error" in decode(
            asyncio.run(
                tools["flowforge_run_workflow"]("missing", wait_seconds=wait),
            ),
        )
    assert "error" in decode(
        asyncio.run(tools["flowforge_get_run"]("missing")),
    )
    token = workflow_stack.set(
        tuple(str(index) for index in range(MAX_WORKFLOW_DEPTH)),
    )
    try:
        with pytest.raises(ValueError, match="nesting"):
            service.start_run("another")
    finally:
        workflow_stack.reset(token)
    assert service.list_runs() == []


def test_wait_expiry_keeps_run_queryable(service):
    class SlowRuntime:
        async def run_agent_turn(self, agent_id, query):
            assert agent_id == "default"
            assert "Review" in query
            await asyncio.sleep(0.15)
            return "finished"

    service.executor.agent_runtime = SlowRuntime()
    flow = service.generate_flow("Review")
    service.save_flow(flow["id"], flow)
    tools = {tool.__name__: tool for tool in build_tools(service)}

    async def scenario():
        result = decode(
            await tools["flowforge_run_workflow"](flow["id"], {}, 0.01),
        )
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


@pytest.mark.parametrize("route", ["delegate", "standalone"])
@pytest.mark.parametrize(
    "allowed,limit,expected_tools,expected_limit",
    [
        (None, None, ["read_file", "write_file"], 20),
        ([], 3, [], 3),
        (["read_file"], 4, ["read_file"], 4),
        (["read_file"], 999, ["read_file"], 20),
    ],
)
def test_native_agent_enforces_node_tools_and_iteration_cap(
    route,
    allowed,
    limit,
    expected_tools,
    expected_limit,
):
    requests = []

    def read_file():
        return "read"

    def write_file():
        return "written"

    class Workspace:
        async def stream_query(self, request):
            requests.append(request)
            context = request["request_context"]
            tools = AgentBuilder.apply_subagent_tool_whitelist(
                [read_file, write_file],
                context,
            )
            assert [tool.__name__ for tool in tools] == expected_tools
            assert _resolve_react_iterations(20, context) == expected_limit
            yield {
                "object": "message",
                "status": "completed",
                "role": "assistant",
                "content": [{"type": "text", "text": "approved"}],
            }

    runtime = AgentRuntime(SimpleNamespace(agents={"reviewer": Workspace()}))
    definition = AgentDefinition(name="reviewer")
    extra = {"source": "portability_adaptation", "agent_id": "bad"}
    if route == "delegate":
        result = asyncio.run(
            runtime.delegate(
                None,
                definition,
                "Review",
                allowed_tools=allowed,
                max_turns=limit,
                tool_extra=extra,
            ),
        )
        assert result["success"], result
        assert result["text"] == "approved"
    else:
        output = asyncio.run(
            run_agent_node(
                hidden=HiddenHolder(agent_runtime=runtime),
                agent_name="reviewer",
                prompt="Review",
                allowed_tools=allowed,
                max_turns=limit,
                tool_extra=extra,
            ),
        )
        assert output.error is None, output
        assert output.metadata["success"] is True
        assert output.values[0] == "approved"
    assert requests[0]["request_context"]["source"] == "flowforge"
    assert requests[0]["request_context"]["agent_id"] == "reviewer"
    assert definition.tools.allow == ()
    assert definition.max_turns == 0


@pytest.mark.parametrize("limit", [0, -1, True, 1.5, "3"])
def test_invalid_agent_iteration_cap_starts_no_native_turn(limit):
    class Workspace:
        async def stream_query(self, request):
            pytest.fail(f"Invalid cap reached the host: {request}")
            yield

    runtime = AgentRuntime(SimpleNamespace(agents={"reviewer": Workspace()}))
    result = asyncio.run(
        runtime.delegate(
            None,
            AgentDefinition(name="reviewer"),
            "Review",
            max_turns=limit,
        ),
    )
    assert result["success"] is False
    assert "positive integer" in result["error"]


def test_agent_definition_restrictions_reach_native_context():
    requests = []

    class Workspace:
        async def stream_query(self, request):
            requests.append(request)
            yield {"status": "completed"}

    runtime = AgentRuntime(SimpleNamespace(agents={"reviewer": Workspace()}))
    definition = AgentDefinition(
        name="reviewer",
        max_turns=7,
        tools=ToolsPolicy(allow=("read_file",)),
    )
    result = asyncio.run(runtime.delegate(None, definition, "Review"))
    assert result["success"], result
    context = requests[0]["request_context"]
    assert context["subagent_allowed_tools"] == ["read_file"]
    assert context["max_react_iterations"] == 7


def test_legacy_runtime_rejects_unenforceable_agent_restrictions():
    class Workspace:
        def process(self, prompt):
            pytest.fail(
                f"Restricted turn reached an unguarded runtime: {prompt}",
            )

    runtime = AgentRuntime(SimpleNamespace(agents={"reviewer": Workspace()}))
    result = asyncio.run(
        runtime.delegate(
            None,
            AgentDefinition(name="reviewer"),
            "Review",
            allowed_tools=[],
        ),
    )
    assert result["success"] is False
    assert "cannot enforce" in result["error"]
