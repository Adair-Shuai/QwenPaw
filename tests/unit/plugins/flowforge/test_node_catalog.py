"""Discovery through the real workspace filter, execution through host guards."""

import asyncio
import json
import time
from pathlib import Path
from types import SimpleNamespace
from typing import Literal

import pytest
from agentscope.tool import ToolChunk
from agentscope.message import TextBlock, ToolResultState

from qwenpaw.app.workspace.local_workspace import QwenPawLocalWorkspace
from qwenpaw.app.workspace.workspace_plugins import WorkspacePlugins
from qwenpaw.runtime.tool_registry import ToolDescriptor
from qwenpaw.plugins_bundle.flowforge.node_catalog import AgentNodeCatalog
from qwenpaw.plugins_bundle.flowforge.service import WorkflowService


@pytest.fixture
def environment(tmp_path, monkeypatch):
    workspaces = {}
    profiles = {}

    class Manager:
        async def get_agent(self, agent_id):
            return workspaces.get(agent_id)

    monkeypatch.setattr(
        "qwenpaw.config.utils.load_config",
        lambda: SimpleNamespace(agents=SimpleNamespace(profiles=profiles)),
    )
    monkeypatch.setattr(
        "qwenpaw.agents.skill_system.resolve_effective_skills", lambda *args: []
    )
    monkeypatch.setattr(
        "qwenpaw.runtime.builder.AgentBuilder._init_governor", lambda *args: None
    )
    monkeypatch.setattr(
        "qwenpaw.app.agent_context.get_agent_project_dir",
        lambda workspace: workspace.workspace_dir,
    )
    # Explicit OFF config exercises the real host wrapper without a real sandbox.
    from qwenpaw.security.tool_guard.execution_level import ToolExecutionLevel

    monkeypatch.setattr(
        "qwenpaw.governance.tool_adapter._resolve_effective_approval_level",
        lambda ctx: ToolExecutionLevel.OFF,
    )

    def workspace(agent_id, functions):
        root = tmp_path / agent_id
        root.mkdir(exist_ok=True)
        plugins = WorkspacePlugins()
        for fn in functions:
            descriptor = ToolDescriptor(name=fn.__name__, func=fn)
            plugins.tool_registry.register(descriptor)
            fn._tool_descriptor = descriptor
        config = SimpleNamespace(
            name="Display name", description="", tools=SimpleNamespace(builtin_tools={})
        )
        ws = SimpleNamespace(
            agent_id=agent_id,
            workspace_dir=root,
            config=config,
            plugins=plugins,
            local_workspace=QwenPawLocalWorkspace(
                plugins.tool_registry, workdir=str(root)
            ),
        )
        workspaces[agent_id] = ws
        profiles[agent_id] = SimpleNamespace(enabled=True)
        return ws

    service = WorkflowService(flows_dir=tmp_path / "flows")
    catalog = AgentNodeCatalog(Manager())
    service.node_catalog = catalog
    yield SimpleNamespace(
        service=service,
        catalog=catalog,
        workspace=workspace,
        profiles=profiles,
        workspaces=workspaces,
    )
    service._loop.call_soon_threadsafe(service._loop.stop)
    service._loop_thread.join(timeout=3)


def wait(handle):
    deadline = time.monotonic() + 5
    while not handle.is_done and time.monotonic() < deadline:
        time.sleep(0.01)
    assert handle.is_done
    return handle.to_dict()


def test_catalog_is_scoped_and_refreshes_enable_disable_unregister(environment):
    async def alpha(value: int):
        return value

    async def beta(value: str):
        return value

    a = environment.workspace("a", [alpha])
    environment.workspace("b", [beta])

    async def scenario():
        ids = lambda specs: {spec["class_type"] for spec in specs}
        initial = ids(await environment.service.refresh_node_types("a"))
        assert "Tool.alpha" in initial
        assert "Tool.beta" not in initial and "Agent.b" not in initial
        assert "Tool.alpha" not in ids(
            await environment.service.refresh_node_types("b")
        )
        a.config.tools.builtin_tools["alpha"] = SimpleNamespace(enabled=False)
        assert "Tool.alpha" not in ids(
            await environment.service.refresh_node_types("a")
        )
        a.config.tools.builtin_tools["alpha"].enabled = True
        assert "Tool.alpha" in ids(await environment.service.refresh_node_types("a"))
        a.plugins.tool_registry.unregister("alpha")
        assert "Tool.alpha" not in ids(
            await environment.service.refresh_node_types("a")
        )

    asyncio.run(scenario())


def test_authoring_and_execution_bind_the_selected_agent_model(environment, monkeypatch):
    from qwenpaw.plugins_bundle.flowforge.engine.adapter.llm_service import LLMService

    document = {"nodes": {"out": {"class_type": "OutputNode", "inputs": {"value": "done"}}}, "outputs": ["out"]}
    calls = []

    def model(model_id):
        async def complete(*args, **kwargs):
            calls.append(model_id)
            return {"content": json.dumps({"flow": document, "warnings": []})}
        return complete

    environment.workspace("a", [])
    environment.workspace("b", [])
    monkeypatch.setattr(
        "qwenpaw.config.config.load_agent_config",
        lambda agent: SimpleNamespace(
            active_model=SimpleNamespace(provider_id="provider", model=agent),
            enabled=True, name=agent, description="",
        ),
    )
    environment.service.executor.llm_service = LLMService(SimpleNamespace(
        get_active_model=lambda: None,
        get_provider=lambda _: SimpleNamespace(enabled=True, get_chat_model_instance=model),
    ))

    async def scenario():
        for agent in ["a", "b"]:
            proposal = await environment.service.create_proposal("输出 done", scope_agent_id=agent)
            assert proposal["validation"]["ok"], proposal
            scoped = await environment.catalog.prepare(environment.service.executor, agent, {})
            assert scoped.llm_service.agent_id == agent
        assert environment.service.executor.llm_service.agent_id is None

    asyncio.run(scenario())
    assert calls == ["a", "b"]
    environment.service.save_flow("model-run", {
        "id": "model-run",
        "nodes": {"llm": {"class_type": "LLMNode", "inputs": {"prompt": "hello"}}},
        "outputs": ["llm"],
    })
    handles = [environment.service.start_run("model-run", agent_id=agent) for agent in ["a", "b"]]
    for handle in handles:
        result = wait(handle)
        assert result["status"] == "completed", result
        assert json.loads(result["outputs"]["llm"])["flow"] == document
    assert sorted(calls[2:]) == ["a", "b"]


def test_schema_changes_and_output_parameter_collision(environment):
    async def report(output: str, format: Literal["pdf", "docx"] = "pdf"):
        return output

    ws = environment.workspace("a", [report])

    async def scenario():
        first = await environment.catalog.prepare(environment.service.executor, "a", {})
        schema = first.node_registry.require("Tool.report").get_schema()
        assert {"output", "__flow_output", "format"} <= {
            item.id for item in schema.inputs
        }
        assert schema.metadata["control_inputs"]["output"] == "__flow_output"
        same = await environment.catalog.prepare(environment.service.executor, "a", {})
        assert first.node_registry.require("Tool.report") is same.node_registry.require(
            "Tool.report"
        )

        async def updated(count: int):
            return count

        updated.__name__ = "report"
        ws.plugins.tool_registry.unregister("report")
        ws.plugins.tool_registry.register(ToolDescriptor(name="report", func=updated))
        second = await environment.catalog.prepare(
            environment.service.executor, "a", {}
        )
        assert "count" in {
            item.id
            for item in second.node_registry.require("Tool.report").get_schema().inputs
        }
        assert "count" not in {item.id for item in schema.inputs}

    asyncio.run(scenario())


@pytest.mark.parametrize("node_type", ["Tool.echo", "ToolNode", "ToolCallNode"])
def test_all_tool_nodes_use_current_permissions(environment, node_type):
    calls = []

    async def echo(output: str):
        calls.append(output)
        return "received:" + output

    environment.workspace("a", [echo])
    inputs = (
        {"output": "business-value"}
        if node_type == "Tool.echo"
        else (
            {"tool_name": "echo", "args": {"output": "business-value"}}
            if node_type == "ToolNode"
            else {"tool": "echo", "params": {"output": "business-value"}}
        )
    )
    environment.service.save_flow(
        "flow",
        {
            "id": "flow",
            "nodes": {"tool": {"class_type": node_type, "inputs": inputs}},
            "outputs": ["tool"],
        },
    )
    result = wait(environment.service.start_run("flow", agent_id="a"))
    assert result["status"] == "completed", result
    assert result["outputs"] == {"tool": "received:business-value"}
    assert calls == ["business-value"]


def test_permission_revoked_after_preparation_blocks_raw_function(environment):
    calls = []

    async def secret():
        calls.append(True)

    ws = environment.workspace("a", [secret])

    async def scenario():
        scoped = await environment.catalog.prepare(
            environment.service.executor, "a", {}
        )
        ws.config.tools.builtin_tools["secret"] = SimpleNamespace(enabled=False)
        result = await scoped.tool_executor.execute("secret", {})
        assert not result.result.success
        assert "unavailable" in result.result.error

    asyncio.run(scenario())
    assert calls == []


def test_governance_unavailable_denies_without_side_effects_or_retries(
    environment, monkeypatch
):
    calls = []

    async def dangerous():
        calls.append(True)

    environment.workspace("a", [dangerous])
    monkeypatch.setattr(
        "qwenpaw.governance.tool_adapter._resolve_effective_approval_level",
        lambda ctx: None,
    )
    monkeypatch.setattr(
        "qwenpaw.governance.tool_adapter._is_execution_level_off", lambda: False
    )

    async def scenario():
        result = await environment.catalog.invoke("a", {}, "dangerous", {})
        assert not result.result.success and not result.result.retryable
        assert "unavailable" in result.result.error

    asyncio.run(scenario())
    assert calls == []


def test_validation_and_error_chunks_are_not_success(environment):
    calls = []

    async def typed(count: int):
        calls.append(count)
        return ToolChunk(
            state=ToolResultState.ERROR, content=[TextBlock(text="business error")]
        )

    environment.workspace("a", [typed])

    async def scenario():
        invalid = await environment.catalog.invoke("a", {}, "typed", {"count": "wrong"})
        assert not invalid.result.success and calls == []
        failed = await environment.catalog.invoke("a", {}, "typed", {"count": 1})
        assert not failed.result.success and "business error" in failed.result.error

    asyncio.run(scenario())


def test_disabled_agent_is_rejected_even_if_workspace_is_cached(environment):
    environment.workspace("a", [])
    environment.profiles["a"].enabled = False
    with pytest.raises(ValueError, match="disabled"):
        asyncio.run(environment.service.refresh_node_types("a"))


def test_refresh_http_endpoint_uses_agent_header(environment):
    from fastapi import FastAPI
    from fastapi.testclient import TestClient
    from qwenpaw.plugins_bundle.flowforge.router import build_router

    async def alpha():
        return "a"

    environment.workspace("a", [alpha])
    app = FastAPI()
    app.include_router(build_router(environment.service))
    with TestClient(app) as client:
        response = client.post("/node-types/refresh", headers={"X-Agent-Id": "a"})
        assert response.status_code == 200, response.text
        assert "Tool.alpha" in {spec["class_type"] for spec in response.json()}
        assert (
            client.get("/node-types", headers={"X-Agent-Id": "unknown"}).status_code
            == 404
        )
        payload = {
            "id": "test",
            "nodes": {"tool": {"class_type": "Tool.alpha", "inputs": {}}},
            "outputs": ["tool"],
        }
        checked = client.post(
            "/flows/validate", headers={"X-Agent-Id": "a"}, json=payload
        )
        assert checked.status_code == 200 and checked.json()["ok"], checked.text
        environment.service.save_flow("test", payload)
        started = client.post("/flows/test/run", headers={"X-Agent-Id": "a"})
        assert started.status_code == 200, started.text
        handle = environment.service.get_run(started.json()["run_id"])
        result = wait(handle)
        assert result["agent_id"] == "a"
        assert result["status"] == "completed", result


def test_concurrent_same_named_tools_do_not_share_schema_or_execution(environment):
    calls = []

    async def first(number: int):
        calls.append(("a", number))
        return f"a:{number}"

    async def second(label: str):
        calls.append(("b", label))
        return f"b:{label}"

    first.__name__ = second.__name__ = "shared"
    environment.workspace("a", [first])
    environment.workspace("b", [second])
    for agent_id, params in [("a", {"number": 7}), ("b", {"label": "text"})]:
        environment.service.save_flow(
            agent_id,
            {
                "id": agent_id,
                "nodes": {"tool": {"class_type": "Tool.shared", "inputs": params}},
                "outputs": ["tool"],
            },
        )
    a = environment.service.start_run("a", agent_id="a")
    b = environment.service.start_run("b", agent_id="b")
    assert wait(a)["outputs"] == {"tool": "a:7"}
    assert wait(b)["outputs"] == {"tool": "b:text"}
    assert set(calls) == {("a", 7), ("b", "text")}


def test_mode_skill_channel_and_availability_gates_remain_enforced(environment):
    async def conditional():
        return "never"

    ws = environment.workspace("a", [])
    registry = ws.plugins.tool_registry
    for name, kwargs in [
        ("mode_only", {"requires_modes": ("coding",)}),
        ("skill_only", {"requires_skills": ("private",)}),
        ("other_channel", {"metadata": {"allowed_channels": ("mail",)}}),
        (
            "predicate_denied",
            {"metadata": {"availability_check": lambda context: False}},
        ),
        ("opt_in", {"enabled_by_default": False}),
    ]:
        registry.register(ToolDescriptor(name=name, func=conditional, **kwargs))
    specs = asyncio.run(environment.service.refresh_node_types("a"))
    assert not any(spec["class_type"].startswith("Tool.") for spec in specs)


def test_denial_does_not_retry_or_invoke_function(environment, monkeypatch):
    from agentscope.permission import PermissionBehavior, PermissionDecision

    permissions = []
    effects = []

    async def risky():
        effects.append(True)

    async def deny(self, input_data=None, context=None):
        permissions.append(input_data)
        return PermissionDecision(
            behavior=PermissionBehavior.DENY, message="Policy denied"
        )

    environment.workspace("a", [risky])
    monkeypatch.setattr(
        "qwenpaw.governance.tool_adapter._policy_tool_check_permissions", deny
    )
    environment.service.save_flow(
        "flow",
        {
            "id": "flow",
            "nodes": {
                "tool": {"class_type": "Tool.risky", "inputs": {"retry_count": 10}}
            },
            "outputs": ["tool"],
        },
    )
    result = wait(environment.service.start_run("flow", agent_id="a"))
    assert result["status"] == "failed"
    assert "Policy denied" in str(result["errors"])
    assert len(permissions) == 1 and effects == []


def test_startup_initializes_scoped_catalog(environment, monkeypatch):
    from qwenpaw.plugins.registry import PluginRegistry
    from qwenpaw.plugins_bundle.flowforge.plugin import FlowForgePlugin

    environment.workspace("default", [])
    monkeypatch.setattr(
        PluginRegistry,
        "get_workspace_manager",
        lambda self: environment.catalog.manager,
    )
    monkeypatch.setattr(
        "qwenpaw.app.agent_context.get_current_agent_id", lambda: "default"
    )
    plugin = FlowForgePlugin()
    plugin._service = environment.service

    async def scenario():
        await plugin._wire_services()
        assert environment.service.node_catalog.host_loop is asyncio.get_running_loop()
        assert environment.service.executor.tool_registry is None
        assert environment.service.executor.tool_executor is None

    asyncio.run(scenario())


def test_tools_run_on_host_loop_and_context_does_not_leak(environment):
    from qwenpaw.config import context
    from qwenpaw.app.agent_context import peek_current_agent_id

    observed = []

    async def scenario():
        host_loop = asyncio.get_running_loop()
        old_workspace = context.get_current_workspace_dir()
        old_agent = peek_current_agent_id()

        async def check():
            observed.append(
                (
                    asyncio.get_running_loop(),
                    context.get_current_workspace_dir(),
                    peek_current_agent_id(),
                )
            )
            return "host-ok"

        ws = environment.workspace("a", [check])
        environment.catalog.host_loop = host_loop
        environment.service.save_flow(
            "flow",
            {
                "id": "flow",
                "nodes": {"tool": {"class_type": "Tool.check", "inputs": {}}},
                "outputs": ["tool"],
            },
        )
        result = await asyncio.to_thread(
            wait, environment.service.start_run("flow", agent_id="a")
        )
        assert result["status"] == "completed", result
        assert observed == [(host_loop, ws.workspace_dir, "a")]
        assert context.get_current_workspace_dir() == old_workspace
        assert peek_current_agent_id() == old_agent

    asyncio.run(scenario())


def test_subworkflow_inherits_explicit_agent_binding(environment, monkeypatch):
    async def echo():
        return "a-only"

    environment.workspace("a", [echo])
    monkeypatch.setattr(
        "qwenpaw.app.agent_context.get_current_agent_id", lambda: "different-default"
    )
    environment.service.save_flow(
        "child",
        {
            "id": "child",
            "nodes": {"tool": {"class_type": "Tool.echo", "inputs": {}}},
            "outputs": ["tool"],
        },
    )
    environment.service.save_flow(
        "parent",
        {
            "id": "parent",
            "nodes": {
                "child": {
                    "class_type": "SubworkflowNode",
                    "inputs": {"subworkflow_id": "child"},
                }
            },
            "outputs": ["child"],
        },
    )
    result = wait(environment.service.start_run("parent", agent_id="a"))
    assert result["status"] == "completed", result
    assert result["outputs"] == {"child": {"tool": "a-only"}}
    assert {record["agent_id"] for record in environment.service.list_runs()} == {"a"}


def test_cancel_propagates_to_host_permission_wait(environment, monkeypatch):
    started, stopped, effects = [], [], []

    async def pending_permission(self, input_data=None, context=None):
        started.append(True)
        try:
            await asyncio.sleep(60)
        finally:
            stopped.append(True)

    async def effect():
        effects.append(True)

    environment.workspace("a", [effect])
    monkeypatch.setattr(
        "qwenpaw.governance.tool_adapter._policy_tool_check_permissions",
        pending_permission,
    )
    environment.service.save_flow(
        "flow",
        {
            "id": "flow",
            "nodes": {"tool": {"class_type": "Tool.effect", "inputs": {}}},
            "outputs": ["tool"],
        },
    )

    async def scenario():
        environment.catalog.host_loop = asyncio.get_running_loop()
        handle = environment.service.start_run("flow", agent_id="a")
        for _ in range(300):
            if started:
                break
            await asyncio.sleep(0.01)
        assert started
        environment.service.cancel_run(handle.run_id)
        result = await asyncio.to_thread(wait, handle)
        assert result["status"] == "cancelled"
        for _ in range(100):
            if stopped:
                break
            await asyncio.sleep(0.01)
        assert stopped == [True] and effects == []

    asyncio.run(scenario())
