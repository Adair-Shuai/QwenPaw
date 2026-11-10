# -*- coding: utf-8 -*-
"""Exercise bounded discovery through the builder and real SDK tool path."""
# pylint: disable=protected-access

import json
from types import SimpleNamespace

import pytest
from agentscope.agent import Agent, ContextConfig
from agentscope.formatter import DeepSeekChatFormatter
from agentscope.message import (
    TextBlock,
    ToolCallBlock,
    ToolResultState,
    UserMsg,
)
from agentscope.model import ChatModelBase
from agentscope.model._model_response import ChatResponse
from agentscope.permission import PermissionBehavior, PermissionDecision
from agentscope.state import AgentState
from agentscope.tool import ToolBase, ToolChunk

from qwenpaw.runtime.builder import AgentBuilder
from qwenpaw.runtime.tool_discovery import DiscoveryToolkit
from qwenpaw.drivers.adapters.agentscope_tool import DriverCapabilityTool
from qwenpaw.drivers.capabilities import DriverCapability, CapabilityExposure


class CatalogTool(ToolBase):
    is_read_only = True
    is_concurrency_safe = True

    def __init__(self, name, description="Format a document", size=0):
        super().__init__()
        self.name = name
        self.description = description
        self.input_schema = {
            "type": "object",
            "properties": {
                "value": {"type": "string", "description": "x" * size},
            },
        }
        self.calls = []
        self.permission = PermissionBehavior.ALLOW

    async def check_permissions(self, *args, **kwargs):
        # pylint: disable=unused-argument
        return PermissionDecision(
            behavior=self.permission,
            message="Fixture permission",
        )

    async def __call__(self, value=""):
        self.calls.append(value)
        return ToolChunk(content=[TextBlock(text=value or "ok")])


def catalog():
    return [CatalogTool(f"kdocs__wps_format_{i}") for i in range(629)] + [
        CatalogTool("kdocs__sheet_get_cells", "Get spreadsheet cell values"),
        CatalogTool("read_file", "Read a local file"),
    ]


async def invoke(toolkit, state, name, **kwargs):
    results = [
        result
        async for result in toolkit.call_tool(
            ToolCallBlock(id="call", name=name, input=json.dumps(kwargs)),
            state,
        )
    ]
    assert results[-1].state == ToolResultState.SUCCESS
    return json.loads(results[-1].content[0].text)


def names(schemas):
    return [schema["function"]["name"] for schema in schemas]


@pytest.mark.parametrize("allowed", [True, False])
async def test_real_agent_loop_discovers_calls_and_checks_permissions(allowed):
    tools = catalog()
    target = tools[-2]
    target.is_read_only = False
    if not allowed:
        target.permission = PermissionBehavior.DENY

    class ScriptedModel(ChatModelBase):
        def __init__(self):
            super().__init__(
                credential=None,
                model="fixture",
                stream=False,
                parameters=ChatModelBase.Parameters(),
                context_size=100_000,
            )
            self.requests = []
            self.formatter = DeepSeekChatFormatter()

        async def __call__(self, messages, tools, **kwargs):
            self.requests.append(names(tools))
            if len(self.requests) == 1:
                assert target.name not in self.requests[-1]
                content = [
                    ToolCallBlock(
                        id="find",
                        name="search_tools",
                        input='{"query":"读取表格单元格","limit":1}',
                    ),
                ]
            elif len(self.requests) == 2:
                assert target.name in self.requests[-1]
                content = [
                    ToolCallBlock(
                        id="use",
                        name=target.name,
                        input='{"value":"model call"}',
                    ),
                ]
            else:
                content = [TextBlock(text="done")]
            return ChatResponse(content=content, is_last=True)

    model = ScriptedModel()
    agent = Agent(
        name="test",
        system_prompt="Test",
        model=model,
        toolkit=DiscoveryToolkit(tools=tools),
    )
    await agent.reply(UserMsg(name="user", content="读取表格单元格"))
    assert len(model.requests) == 3
    assert target.calls == (["model call"] if allowed else [])


async def test_schema_and_search_cache_follow_inplace_definition_updates():
    tools = catalog()
    toolkit = DiscoveryToolkit(tools=tools)
    state = AgentState()
    await invoke(
        toolkit,
        state,
        "search_tools",
        query="kdocs__sheet_get_cells",
        limit=1,
    )
    tools[-2].input_schema["properties"]["value"][
        "description"
    ] = "rare_parameter_semantics"
    result = await invoke(
        toolkit,
        state,
        "search_tools",
        query="rare_parameter_semantics",
        limit=1,
    )
    assert result["tools"][0]["name"] == tools[-2].name
    schema = next(
        item
        for item in await toolkit.get_tool_schemas(
            state.tool_context.activated_groups,
        )
        if item["function"]["name"] == tools[-2].name
    )
    assert (
        schema["function"]["parameters"]["properties"]["value"]["description"]
        == "rare_parameter_semantics"
    )


async def test_builder_bounds_large_catalog_and_activates_through_sdk(
    monkeypatch,
):
    tools = catalog()
    monkeypatch.setattr(AgentBuilder, "_load_runtime_skills", lambda *args: [])
    toolkit = await AgentBuilder().build_toolkit(
        SimpleNamespace(coding_mode=SimpleNamespace(enabled=False)),
        extra_tools=tools,
    )
    state = AgentState()
    # Exercise the SDK's actual system prompt and tool-schema assembly.
    agent = Agent(
        name="test",
        system_prompt="Test",
        model=None,
        toolkit=toolkit,
        state=state,
        context_config=ContextConfig(compression_tool_enabled=True),
    )
    initial = await agent._prepare_model_input()
    assert "search_tools" in names(initial["tools"])
    assert "read_file" in names(initial["tools"])
    assert "CompressContext" in names(initial["tools"])
    assert len(initial["tools"]) <= 16
    assert len(json.dumps(initial["tools"]).encode()) < 32_000
    assert "kdocs__sheet_get_cells" not in names(initial["tools"])
    # The metadata call uses the same state-injection and validation path as
    # a model-generated call, then the next model input exposes its schema.
    result = await invoke(
        toolkit,
        state,
        "search_tools",
        query="读取表格单元格",
        limit=1,
    )
    assert result["tools"][0]["name"] == "kdocs__sheet_get_cells"
    assert result["tools"][0]["activated"] is True
    selected = await agent._prepare_model_input()
    assert "kdocs__sheet_get_cells" in names(selected["tools"])
    target = await toolkit.get_tool("kdocs__sheet_get_cells")
    chunks = [
        chunk
        async for chunk in toolkit.call_tool(
            ToolCallBlock(
                id="execute",
                name=target.name,
                input='{"value":"real call"}',
            ),
            state,
        )
    ]
    assert chunks[-1].state == ToolResultState.SUCCESS
    assert target.calls == ["real call"]


async def test_discovery_survives_serialized_state_and_revalidates_registry():
    tools = catalog()
    toolkit = DiscoveryToolkit(tools=tools)
    first, second = AgentState(), AgentState()
    await invoke(
        toolkit,
        first,
        "search_tools",
        query="kdocs__sheet_get_cells",
        limit=1,
    )
    assert "kdocs__sheet_get_cells" not in names(
        await toolkit.get_tool_schemas(
            second.tool_context.activated_groups,
        ),
    )
    restored = AgentState.model_validate_json(first.model_dump_json())
    replacement = CatalogTool("kdocs__sheet_get_cells", "Updated definition")
    current = DiscoveryToolkit(tools=tools[:-2] + [replacement])
    schemas = await current.get_tool_schemas(
        restored.tool_context.activated_groups,
    )
    assert (
        next(
            schema["function"]["description"]
            for schema in schemas
            if schema["function"]["name"] == replacement.name
        )
        == "Updated definition"
    )
    removed = DiscoveryToolkit(tools=tools[:-2])
    assert replacement.name not in names(
        await removed.get_tool_schemas(
            restored.tool_context.activated_groups,
        ),
    )


async def test_subagent_whitelist_applies_before_search(monkeypatch):
    monkeypatch.setattr(AgentBuilder, "_load_runtime_skills", lambda *args: [])
    tools = catalog()
    toolkit = await AgentBuilder().build_toolkit(
        SimpleNamespace(coding_mode=SimpleNamespace(enabled=False)),
        extra_tools=tools,
        request_context={
            "subagent_allowed_tools": [tool.name for tool in tools[:40]],
        },
    )
    result = await invoke(
        toolkit,
        AgentState(),
        "search_tools",
        query="sheet_get_cells",
    )
    assert result["tools"] == []
    assert await toolkit.get_tool("kdocs__sheet_get_cells") is None


async def test_activation_budget_and_oversized_tool_access():
    tools = [CatalogTool(f"capability_{i}", size=4000) for i in range(40)]
    toolkit, state = DiscoveryToolkit(tools=tools), AgentState()
    for tool in tools:
        await invoke(toolkit, state, "search_tools", query=tool.name, limit=1)
    schemas = await toolkit.get_tool_schemas(
        state.tool_context.activated_groups,
    )
    assert len(schemas) <= 24
    assert len(json.dumps(schemas, ensure_ascii=False).encode()) < 32_000
    assert len(state.tool_context.activated_groups) <= 24
    large = CatalogTool("large_tool", size=60_000)
    toolkit = DiscoveryToolkit(tools=tools + [large])
    await invoke(toolkit, state, "search_tools", query="large_tool", limit=1)
    assert large.name in names(
        await toolkit.get_tool_schemas(
            state.tool_context.activated_groups,
        ),
    )


async def test_small_catalog_direct_tools_and_schema_isolation():
    toolkit = DiscoveryToolkit(tools=[CatalogTool("small")])
    schemas = await toolkit.get_tool_schemas()
    assert names(schemas) == ["small"]
    assert await toolkit.get_skill_instructions() is None
    schemas[0]["function"]["parameters"]["properties"].clear()
    assert (
        "value"
        in (await toolkit.get_tool_schemas())[0]["function"]["parameters"][
            "properties"
        ]
    )


@pytest.mark.parametrize("query", ["does_not_exist", "不存在的能力", "   "])
async def test_search_empty_result_does_not_activate_unrelated_tools(query):
    toolkit, state = DiscoveryToolkit(tools=catalog()), AgentState()
    result = await invoke(toolkit, state, "search_tools", query=query)
    assert result["tools"] == []
    assert state.tool_context.activated_groups == []


async def test_search_prefers_read_action_over_provider_name():
    tools = catalog() + [
        CatalogTool("kdocs__get_feedback_url", "获取金山产品反馈地址"),
        CatalogTool("kdocs__read_file", "读取云文档正文内容"),
    ]
    toolkit, state = DiscoveryToolkit(tools=tools), AgentState()
    result = await invoke(
        toolkit,
        state,
        "search_tools",
        query="金山文档读取",
        namespace="kdocs",
        limit=1,
    )
    assert result["tools"][0]["name"] == "kdocs__read_file"


async def test_search_server_key_with_custom_display_namespace():
    target = DriverCapabilityTool(
        DriverCapability(
            capability_id="read",
            driver_name="cloud-docs",
            protocol="mcp",
            kind="tool",
            action="invoke",
            name="read",
            description="Read a cloud file",
            input_schema={"type": "object", "properties": {}},
            exposure=CapabilityExposure(
                as_tool=True,
                tool_name="Office__read",
            ),
        ),
        None,
    )
    toolkit = DiscoveryToolkit(tools=catalog() + [target])
    result = await invoke(
        toolkit,
        AgentState(),
        "search_tools",
        query="read",
        namespace="cloud-docs",
    )
    assert [item["name"] for item in result["tools"]] == ["Office__read"]
