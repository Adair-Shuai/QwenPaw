# -*- coding: utf-8 -*-
"""Discovery precision, public identity and request-scoped execution."""
# pylint: disable=protected-access

import json
from dataclasses import replace
from types import SimpleNamespace
from typing import Literal
from unittest.mock import AsyncMock

import pytest
from agentscope.agent import Agent
from agentscope.message import ToolCallBlock, ToolResultState
from agentscope.state import AgentState

from qwenpaw.app.workspace.local_workspace import QwenPawLocalWorkspace
from qwenpaw.governance.policy import GovernanceAction, GovernanceDecision
from qwenpaw.governance.tool_registry import DEFAULT_REGISTRY
from qwenpaw.runtime.tool_discovery import DiscoveryToolkit
from qwenpaw.runtime.tool_registry import ToolDescriptor, ToolRegistry
from qwenpaw.drivers.adapters.agentscope_tool import DriverCapabilityTool
from qwenpaw.drivers.capabilities import DriverCapability, CapabilityExposure

from .test_tool_discovery import CatalogTool, invoke, names


@pytest.mark.parametrize(
    "query",
    [
        "qwenpaw_data_execute_sql",
        "qwenpaw_data_list_domains",
        "materialize_skill",
        "unknown__read_file",
        "paw_execute_sql",
    ],
)
async def test_unknown_identifiers_never_substitute_other_apps(query):
    tools = [
        CatalogTool("datapaw_execute_sql", "Run SQL for DataPaw"),
        CatalogTool("datapaw_list_domains", "List DataPaw domains"),
        CatalogTool("Skill", "Materialize a skill"),
        CatalogTool("read_file", "Read a file"),
    ]
    toolkit, state = DiscoveryToolkit(tools=tools), AgentState()
    result = await invoke(toolkit, state, "search_tools", query=query)
    assert result["tools"] == []
    assert not state.tool_context.activated_groups
    assert all(not tool.calls for tool in tools)


async def test_exact_identity_case_and_server_scope():
    tools = [
        CatalogTool("read_file"),
        CatalogTool("cloud__read_file"),
        CatalogTool("othercloud__read_file"),
    ]
    toolkit = DiscoveryToolkit(tools=tools)
    result = await invoke(
        toolkit,
        AgentState(),
        "search_tools",
        query="READ_FILE",
    )
    assert [item["name"] for item in result["tools"]] == ["read_file"]
    result = await invoke(
        toolkit,
        AgentState(),
        "search_tools",
        query="read_file",
        namespace="cloud",
    )
    assert [item["name"] for item in result["tools"]] == ["cloud__read_file"]
    result = await invoke(
        toolkit,
        AgentState(),
        "search_tools",
        query="cloud__read.file",
    )
    assert [item["name"] for item in result["tools"]] == ["cloud__read_file"]
    result = await invoke(
        toolkit,
        AgentState(),
        "search_tools",
        query="read_file",
        namespace="missing",
    )
    assert result["tools"] == []


async def test_exact_server_precedes_similarly_named_tool_prefixes():
    tools = []
    for server, name in [
        ("cloud", "Office__read_file"),
        ("cloud2", "cloud2__read_file"),
        ("other", "cloud__read_file"),
    ]:
        tools.append(
            DriverCapabilityTool(
                DriverCapability(
                    capability_id=name,
                    driver_name=server,
                    protocol="mcp",
                    kind="tool",
                    action="invoke",
                    name="read_file",
                    description="Read a cloud file",
                    input_schema={"type": "object", "properties": {}},
                    exposure=CapabilityExposure(as_tool=True, tool_name=name),
                ),
                None,
            ),
        )
    result = await invoke(
        DiscoveryToolkit(tools=tools),
        AgentState(),
        "search_tools",
        query="read_file",
        namespace="cloud",
    )
    assert [item["name"] for item in result["tools"]] == ["Office__read_file"]


@pytest.mark.parametrize(
    "raw_name",
    ["read-file.v2", "very_long_" * 12 + "read_file"],
)
async def test_original_driver_names_resolve_to_their_public_binding(raw_name):
    target = DriverCapabilityTool(
        DriverCapability(
            capability_id="opaque-id",
            driver_name="cloud-service",
            protocol="mcp",
            kind="tool",
            action="invoke",
            name=raw_name,
            description="Read a remote file",
            input_schema={"type": "object", "properties": {}},
            exposure=CapabilityExposure(
                as_tool=True,
                tool_name="safe__short_abc123",
            ),
        ),
        None,
    )
    toolkit = DiscoveryToolkit(tools=[target])
    for query in (raw_name, "cloud-service__" + raw_name):
        found = await invoke(
            toolkit,
            AgentState(),
            "search_tools",
            query=query,
            namespace="cloud-service",
        )
        assert [item["name"] for item in found["tools"]] == [target.name]


async def test_discovery_overview_contains_only_request_available_namespaces(
    monkeypatch,
):
    from qwenpaw.runtime.builder import AgentBuilder

    remote = []
    for name in ("server-alpha", "server-beta"):
        remote.append(
            DriverCapabilityTool(
                DriverCapability(
                    capability_id=name,
                    driver_name=name,
                    protocol="mcp",
                    kind="tool",
                    action="invoke",
                    name="read",
                    description="Read service data",
                    input_schema={"type": "object", "properties": {}},
                    exposure=CapabilityExposure(
                        as_tool=True,
                        tool_name=name + "__read",
                    ),
                ),
                None,
            ),
        )
    local = [CatalogTool(f"local_tool_{index}") for index in range(30)]
    monkeypatch.setattr(AgentBuilder, "_load_runtime_skills", lambda *args: [])
    toolkit = await AgentBuilder().build_toolkit(
        SimpleNamespace(coding_mode=SimpleNamespace(enabled=False)),
        extra_tools=local + remote,
        request_context={
            "subagent_allowed_tools": [
                tool.name for tool in local + remote[:1]
            ],
        },
    )
    instructions = await toolkit.get_skill_instructions()
    assert "server-alpha" in instructions
    assert "server-beta" not in instructions


@pytest.mark.parametrize("query", ["create pptx", "新建 pptx 演示文稿"])
async def test_unsupported_formats_are_not_positive_capabilities(query):
    unsupported = CatalogTool(
        "cloud__create_with_content",
        "Create document content. 不支持 .ppt/.pptx/.csv。",
    )
    supported = CatalogTool("cloud__create_empty_file", "新建空白在线文档")
    supported.input_schema["properties"]["file_extension"] = {
        "type": "string",
        "enum": ["docx", "xlsx", "pptx"],
    }
    toolkit = DiscoveryToolkit(tools=[unsupported, supported])
    result = await invoke(toolkit, AgentState(), "search_tools", query=query)
    assert result["tools"][0]["name"] == supported.name
    assert unsupported.name not in [item["name"] for item in result["tools"]]


@pytest.mark.parametrize(
    "query",
    [
        "读取工作表，不要删除",
        "不要删除工作表，只读取",
        "read worksheet, do not delete",
    ],
)
async def test_explicit_negative_actions_are_not_activated(query):
    read = CatalogTool("cloud__read_worksheet", "Read worksheet data")
    delete = CatalogTool("cloud__delete_worksheet", "Delete worksheet")
    toolkit = DiscoveryToolkit(tools=[read, delete])
    result = await invoke(toolkit, AgentState(), "search_tools", query=query)
    assert [item["name"] for item in result["tools"]] == [read.name]
    assert not delete.calls


async def test_action_and_format_indexes_refresh_after_schema_mutation():
    first = CatalogTool("cloud__operation", "Read a worksheet")
    second = CatalogTool("cloud__read_worksheet", "Read worksheet data")
    toolkit = DiscoveryToolkit(tools=[first, second])
    await invoke(toolkit, AgentState(), "search_tools", query="read worksheet")
    first.description = "Delete a worksheet"
    first.input_schema["properties"]["file_extension"] = {
        "type": "string",
        "description": "不支持 pptx",
    }
    result = await invoke(
        toolkit,
        AgentState(),
        "search_tools",
        query="read worksheet, do not delete",
    )
    assert [item["name"] for item in result["tools"]] == [second.name]


async def test_full_json_array_budget_includes_separators_and_evicts_base():
    tools = [CatalogTool(f"capability_{i}", size=1800) for i in range(40)]
    tools += [
        CatalogTool("read_file", size=7000),
        CatalogTool("write_file", size=6000),
    ]
    selected = CatalogTool("selected_tool", size=29000)
    toolkit, state = DiscoveryToolkit(tools=tools + [selected]), AgentState()
    result = await invoke(
        toolkit,
        state,
        "search_tools",
        query=selected.name,
        limit=1,
    )
    schemas = await toolkit.get_tool_schemas(
        state.tool_context.activated_groups,
    )
    assert result["tools"][0]["activated"]
    assert selected.name in names(schemas)
    assert (
        len(json.dumps(schemas, ensure_ascii=False).encode("utf-8")) <= 32000
    )
    assert "write_file" not in names(schemas)
    for tool in tools[:40]:
        await invoke(toolkit, state, "search_tools", query=tool.name, limit=1)
        schemas = await toolkit.get_tool_schemas(
            state.tool_context.activated_groups,
        )
        assert len(schemas) <= 24
        assert (
            len(json.dumps(schemas, ensure_ascii=False).encode("utf-8"))
            <= 32000
        )


async def test_direct_catalog_boundary_counts_the_complete_array():
    first = CatalogTool("one")
    toolkit = DiscoveryToolkit(tools=[first])
    initial = await toolkit.get_tool_schemas()
    padding = 32000 - len(
        json.dumps(initial, ensure_ascii=False).encode("utf-8"),
    )
    first.input_schema["properties"]["value"]["description"] = "x" * padding
    assert names(await toolkit.get_tool_schemas()) == [first.name]
    first.input_schema["properties"]["value"]["description"] += "x"
    assert "search_tools" in names(await toolkit.get_tool_schemas())


async def test_large_catalog_generates_only_base_and_selected_schemas(
    monkeypatch,
):
    tools = [CatalogTool(f"remote__tool_{index}") for index in range(630)]
    tools.append(CatalogTool("read_file"))
    toolkit, state = DiscoveryToolkit(tools=tools), AgentState()
    generated = []
    original = toolkit._schema

    def observed(registered):
        generated.append(registered.tool.name)
        return original(registered)

    monkeypatch.setattr(toolkit, "_schema", observed)
    assert set(names(await toolkit.get_tool_schemas())) == {
        "search_tools",
        "read_file",
    }
    assert set(generated) == {"search_tools", "read_file"}
    generated.clear()
    found = await invoke(
        toolkit,
        state,
        "search_tools",
        query="remote__tool_17",
        limit=1,
    )
    assert found["tools"][0]["activated"]
    assert set(generated) == {"search_tools", "read_file", "remote__tool_17"}
    assert len(toolkit._schemas) == 3


class RecordingGovernor:
    def __init__(self):
        self.policy = SimpleNamespace(execution_level="auto")
        self.denied = set()
        self.calls = []
        self.audits = []

    def assert_policy(self, call):
        self.calls.append(call)
        return GovernanceDecision(
            action=(
                GovernanceAction.DENY
                if call.tool_name in self.denied
                else GovernanceAction.ALLOW
            ),
            reason="Owned regression fixture",
        )

    def audit(self, call, decision):
        self.audits.append((call, decision))


def dependency_descriptor(app, calls):
    async def dependency_status(value: str = ""):
        """Inspect this application's dependencies.

        Args:
            value: An optional diagnostic marker.
        """
        calls.append((app, value))
        return app

    descriptor = ToolDescriptor(
        name=f"{app}_dependency_status",
        func=dependency_status,
        description=f"Inspect {app} dependencies",
        owner_plugin_id=app,
    )
    dependency_status._tool_descriptor = descriptor
    return descriptor


async def test_native_owner_overview_and_bilingual_dependency_intent(tmp_path):
    registry = ToolRegistry()
    registry.register_many(
        dependency_descriptor(app, []) for app in ("datapaw", "qwenpaw-data")
    )
    workspace = QwenPawLocalWorkspace(registry, workdir=str(tmp_path))
    toolkit = DiscoveryToolkit(
        tools=[
            *await workspace.list_tools(),
            *[CatalogTool(f"local_{index}") for index in range(30)],
        ],
    )
    instructions = await toolkit.get_skill_instructions()
    assert "datapaw_" in instructions
    assert "qwenpaw-data_" in instructions
    found = await invoke(
        toolkit,
        AgentState(),
        "search_tools",
        query="检查 qwenpaw-data 依赖健康状态",
        limit=1,
    )
    assert [tool["name"] for tool in found["tools"]] == [
        "qwenpaw-data_dependency_status",
    ]


async def execute(toolkit, state, name, arguments):
    agent = Agent(
        name="accuracy-test",
        system_prompt="Test",
        model=SimpleNamespace(count_tokens=AsyncMock(return_value=1)),
        toolkit=toolkit,
        state=state,
    )
    chunks = [
        chunk
        async for chunk in agent._execute_tool_call(
            ToolCallBlock(id="test", name=name, input=json.dumps(arguments)),
        )
    ]
    return chunks[-1]


@pytest.mark.parametrize("kind", ["status", "action"])
async def test_public_names_keep_closures_distinct_through_sdk_and_governance(
    tmp_path,
    kind,
):
    registry, calls = ToolRegistry(), []
    descriptors = [
        replace(
            dependency_descriptor(app, calls),
            name=f"{app}_dependency_{kind}",
        )
        for app in ("datapaw", "qwenpaw-data")
    ]
    registry.register_many(descriptors)
    workspace = QwenPawLocalWorkspace(registry, workdir=str(tmp_path))
    governor = RecordingGovernor()
    workspace.set_governor(governor)
    tools = await workspace.list_tools(
        request_context={"approval_level": "auto"},
    )
    assert {tool.name for tool in tools} == {desc.name for desc in descriptors}
    assert all(
        tool.source_function.__name__ == "dependency_status" for tool in tools
    )
    assert all(
        "Inspect this application's dependencies." in tool.description
        and "optional diagnostic marker"
        in tool.input_schema["properties"]["value"]["description"]
        for tool in tools
    )
    toolkit, state = DiscoveryToolkit(tools=tools), AgentState()
    for descriptor in descriptors:
        result = await invoke(
            toolkit,
            state,
            "search_tools",
            query=descriptor.name,
        )
        assert [tool["name"] for tool in result["tools"]] == [descriptor.name]
        response = await execute(
            toolkit,
            state,
            descriptor.name,
            {"value": descriptor.owner_plugin_id},
        )
        assert response.state == ToolResultState.SUCCESS
    assert calls == [
        (desc.owner_plugin_id, desc.owner_plugin_id) for desc in descriptors
    ]
    expected = [
        DEFAULT_REGISTRY.python_to_policy_name(desc.name)
        for desc in descriptors
    ]
    assert [call.tool_name for call in governor.calls] == expected
    governor.denied.add(expected[1])
    response = await execute(
        toolkit,
        state,
        descriptors[1].name,
        {"value": "blocked"},
    )
    assert response.state == ToolResultState.DENIED
    assert len(calls) == 2
    assert len(governor.audits) == 3


@pytest.mark.parametrize(
    "overrides,filters,eligible",
    [
        ({}, {}, False),
        ({"channel": "console"}, {}, False),
        (
            {"channel": "console"},
            {
                "active_modes": {"analysis"},
                "active_skills": {"files"},
                "enabled_features": {"forms"},
            },
            True,
        ),
        (
            {"channel": "cli"},
            {
                "active_modes": {"analysis"},
                "active_skills": {"files"},
                "enabled_features": {"forms"},
            },
            False,
        ),
        (
            {"subagent_allowed_tools": []},
            {
                "active_modes": {"analysis"},
                "active_skills": {"files"},
                "enabled_features": {"forms"},
            },
            False,
        ),
    ],
)
async def test_request_gates_precede_discovery_and_saved_activation(
    tmp_path,
    overrides,
    filters,
    eligible,
):
    registry = ToolRegistry()
    descriptor = dependency_descriptor("datapaw", [])
    descriptor = replace(
        descriptor,
        requires_modes=("analysis",),
        requires_skills=("files",),
        requires_features=("forms",),
        metadata={"allowed_channels": ["console"]},
    )
    registry.register(descriptor)
    workspace = QwenPawLocalWorkspace(registry, workdir=str(tmp_path))
    context = {"channel": "console", **overrides}
    tools = await workspace.list_tools(request_context=context, **filters)
    toolkit, state = DiscoveryToolkit(tools=tools), AgentState()
    state.tool_context.activated_groups = ["qwenpaw:tool:" + descriptor.name]
    result = await invoke(
        toolkit,
        state,
        "search_tools",
        query=descriptor.name,
    )
    assert bool(result["tools"]) is eligible
    assert (await toolkit.get_tool(descriptor.name) is not None) is eligible
    if not eligible:
        assert descriptor.name not in names(
            await toolkit.get_tool_schemas(
                state.tool_context.activated_groups,
            ),
        )
        assert not state.tool_context.activated_groups


async def test_bad_arguments_and_missing_governor_never_execute(tmp_path):
    calls, registry = [], ToolRegistry()

    async def checked_action(value: Literal["allowed"]):
        calls.append(value)
        return value

    descriptor = ToolDescriptor(name="checked_action", func=checked_action)
    registry.register(descriptor)
    workspace = QwenPawLocalWorkspace(registry, workdir=str(tmp_path))
    governor = RecordingGovernor()
    workspace.set_governor(governor)
    toolkit = DiscoveryToolkit(tools=await workspace.list_tools())
    result = await execute(
        toolkit,
        AgentState(),
        descriptor.name,
        {"value": "invalid"},
    )
    assert result.state == ToolResultState.ERROR
    assert not governor.calls
    assert not calls
    workspace.set_governor(None)
    toolkit = DiscoveryToolkit(tools=await workspace.list_tools())
    result = await execute(
        toolkit,
        AgentState(),
        descriptor.name,
        {"value": "allowed"},
    )
    assert result.state == ToolResultState.DENIED
    assert not calls


async def test_discovery_name_collision_keeps_both_integration_tools_callable():  # noqa: E501
    integrations = [
        CatalogTool("search_tools"),
        CatalogTool("qwenpaw_search_tools"),
    ]
    toolkit = DiscoveryToolkit(
        tools=integrations
        + [CatalogTool(f"remote__tool_{index}") for index in range(30)],
    )
    assert toolkit._search.name == "qwenpaw_qwenpaw_search_tools"
    state = AgentState()
    result = await invoke(
        toolkit,
        state,
        toolkit._search.name,
        query="search_tools",
        limit=1,
    )
    assert [item["name"] for item in result["tools"]] == ["search_tools"]
    for tool in integrations:
        result = await execute(toolkit, state, tool.name, {"value": tool.name})
        assert result.state == ToolResultState.SUCCESS
        assert tool.calls == [tool.name]


@pytest.mark.parametrize("gate", ["agent_config", "subagent_whitelist"])
async def test_public_identity_revocation_hides_and_blocks_execution(
    tmp_path,
    gate,
):
    calls, registry = [], ToolRegistry()
    descriptors = [
        dependency_descriptor(app, calls)
        for app in ("datapaw", "qwenpaw-data")
    ]
    registry.register_many(descriptors)
    workspace = QwenPawLocalWorkspace(registry, workdir=str(tmp_path))
    kwargs = {"request_context": {"approval_level": "auto"}}
    if gate == "agent_config":
        kwargs["agent_config"] = SimpleNamespace(
            tools=SimpleNamespace(
                builtin_tools={
                    descriptors[1].name: SimpleNamespace(enabled=False),
                },
            ),
        )
    else:
        kwargs["request_context"]["subagent_allowed_tools"] = [
            descriptors[0].name,
        ]
    toolkit, state = (
        DiscoveryToolkit(tools=await workspace.list_tools(**kwargs)),
        AgentState(),
    )
    state.tool_context.activated_groups = [
        "qwenpaw:tool:" + descriptors[1].name,
    ]
    found = await invoke(
        toolkit,
        state,
        "search_tools",
        query=descriptors[1].name,
    )
    assert found["tools"] == []
    assert await toolkit.get_tool(descriptors[0].name) is not None
    assert await toolkit.get_tool(descriptors[1].name) is None
    response = await execute(toolkit, state, descriptors[1].name, {})
    assert response.state == ToolResultState.ERROR
    assert not calls


async def test_code_mode_catalog_preserves_public_aliases_and_inner_denial(
    tmp_path,
):
    from agentscope.tool import Toolkit
    from qwenpaw.modes.coding.code_mode import (
        CodeModeTool,
        _Script,
        _tool_catalog,
    )

    calls, registry = [], ToolRegistry()
    registry.register_many(
        dependency_descriptor(app, calls)
        for app in ("datapaw", "qwenpaw-data")
    )
    workspace = QwenPawLocalWorkspace(registry, workdir=str(tmp_path))
    governor = RecordingGovernor()
    workspace.set_governor(governor)
    tools = await workspace.list_tools(
        request_context={"approval_level": "auto"},
    )
    toolkit = Toolkit(tools=tools)
    catalog = await _tool_catalog(toolkit)
    assert len({item["python_name"] for item in catalog.values()}) == 2
    assert all(item["python_name"].isidentifier() for item in catalog.values())
    script = _Script(CodeModeTool(toolkit), AgentState())
    await script._load_catalog()
    response = await script.invoke(
        "qwenpaw-data_dependency_status",
        value="correct app",
    )
    assert response["state"] == "success"
    assert calls == [("qwenpaw-data", "correct app")]
    governor.denied.add(
        DEFAULT_REGISTRY.python_to_policy_name(
            "qwenpaw-data_dependency_status",
        ),
    )
    with pytest.raises(PermissionError):
        await script.invoke("qwenpaw-data_dependency_status", value="blocked")
    assert len(calls) == 1
