"""Agent-scoped node discovery and governed tool execution.

Catalogues are rebuilt from the host's public list_tools interface. They are
snapshots, never a shared union of tools from unrelated workspaces.
"""

from __future__ import annotations

import asyncio
import copy
import inspect
from pathlib import Path
from types import SimpleNamespace
from typing import Any

from .engine.adapter.tool_base import BaseTool
from .engine.adapter.tool_registry import (
    ToolExecResult,
    ToolResult,
    _normalise_tool_output,
)
from .engine.nodes.registry import NodeRegistry
from .engine.nodes.tool_factory import build_node_class


class AgentNodeCatalog:
    def __init__(self, workspace_manager: Any, *, host_loop=None) -> None:
        self.manager = workspace_manager
        self.host_loop = host_loop

    async def _on_host(self, operation):
        """Keep manager locks and approval futures on the application's loop."""
        if self.host_loop is None or asyncio.get_running_loop() is self.host_loop:
            return await operation()
        if self.host_loop.is_closed() or not self.host_loop.is_running():
            raise RuntimeError("Host event loop is unavailable")
        future = asyncio.run_coroutine_threadsafe(operation(), self.host_loop)
        return await asyncio.wrap_future(future)

    async def _tools(self, agent_id: str, metadata: dict):
        from qwenpaw.runtime.hooks import HookContext
        from qwenpaw.agents.skill_system import resolve_effective_skills
        from qwenpaw.config.utils import load_config

        host_config = await asyncio.to_thread(load_config)
        profile = host_config.agents.profiles.get(agent_id)
        if profile is None or not profile.enabled:
            raise ValueError(f"Agent '{agent_id}' is missing or disabled")
        workspace = await self.manager.get_agent(agent_id)
        if workspace is None:
            raise ValueError(f"Agent '{agent_id}' not found")
        config = workspace.config
        if getattr(config, "enabled", True) is False:
            raise ValueError(f"Agent '{agent_id}' is disabled")
        local = workspace.local_workspace
        if local is None:
            raise RuntimeError("Agent tool workspace is unavailable")
        context = {
            "source": "flowforge",
            "agent_id": agent_id,
            "channel": metadata.get("channel") or "console",
            "session_id": metadata.get("session_id") or "",
            "user_id": metadata.get("user_id") or "",
            "workflow_run_id": metadata.get("run_id"),
            "workspace_dir": str(workspace.workspace_dir),
        }
        hook_ctx = HookContext(
            request=SimpleNamespace(
                channel=context["channel"], request_context=context
            ),
            session_id=context["session_id"],
            agent_id=agent_id,
            root_session_id=context["session_id"],
            root_agent_id=agent_id,
            workspace_dir=Path(workspace.workspace_dir),
            workspace=workspace,
            app_services=getattr(workspace, "_app_services", None),
            agent_config=config,
        )
        modes = workspace.plugins.active_mode_names(hook_ctx)
        skills = await asyncio.to_thread(
            resolve_effective_skills, workspace.workspace_dir, context["channel"]
        )
        tools = await local.list_tools(
            agent_config=config,
            agent_id=agent_id,
            request_context=context,
            active_modes=modes,
            active_skills=skills,
        )
        return workspace, context, {tool.name: tool for tool in tools}

    async def prepare(self, executor, agent_id: str, metadata: dict):
        async def discover():
            return await self._tools(agent_id, metadata)

        _, _, tools = await self._on_host(discover)
        registry = NodeRegistry()
        for name, node in executor.node_registry.items():
            # Never import another agent's generated palette into this one.
            if not node.get_schema().metadata.get("auto_generated"):
                registry.register(node)
        for tool in tools.values():
            native = getattr(getattr(tool, "_func", None), "_tool_descriptor", None)
            descriptor = SimpleNamespace(
                name=tool.name,
                func=getattr(tool, "_func", None),
                description=tool.description,
                input_schema=tool.input_schema,
                metadata=getattr(native, "metadata", {}),
                requires_sandbox=getattr(native, "requires_sandbox", ()),
            )
            facade = BaseTool(descriptor)
            # Unknown mutability must not be represented as a read-only tool.
            facade.is_read_only = bool(getattr(tool, "is_read_only", False))
            registry.register(build_node_class(facade))
        # Keep the service's state/abort maps shared so cancel_by_prompt_id
        # reaches this run, but replace all tool-facing attributes locally.
        scoped = copy.copy(executor)
        scoped.node_registry = registry
        scoped.tool_registry = None  # Raw callable dispatch is unavailable here.
        scoped.tool_executor = GovernedWorkflowTools(self, agent_id, metadata)
        return scoped

    async def invoke(self, agent_id: str, metadata: dict, tool_name: str, params: dict):
        async def execute():
            from agentscope.permission import PermissionBehavior
            from jsonschema import validate
            from qwenpaw.runtime.builder import AgentBuilder
            from qwenpaw.governance import PolicyGuardedTool
            from qwenpaw.app.agent_context import (
                get_agent_project_dir,
                set_current_agent_id,
                set_current_user_id,
                set_current_session_id,
                set_current_channel,
            )
            from qwenpaw.config import context as config_context

            # Re-select for every invocation: disabling/uninstalling after a
            # palette refresh must take effect before the next side effect.
            workspace, context, tools = await self._tools(agent_id, metadata)
            tool = tools.get(tool_name)
            if tool is None:
                return ToolExecResult(
                    ToolResult(
                        False,
                        error=f"Tool '{tool_name}' is unavailable for agent '{agent_id}'",
                        retryable=False,
                    )
                )
            validate(params, tool.input_schema)
            project = await asyncio.to_thread(get_agent_project_dir, workspace)
            set_current_agent_id(agent_id)
            set_current_user_id(context["user_id"])
            set_current_session_id(context["session_id"])
            set_current_channel(context["channel"])
            config_context.set_current_workspace_dir(Path(workspace.workspace_dir))
            config_context.set_current_project_dir(project)
            config_context.set_current_project_dirs(None)
            config_context.set_current_session_id(context["session_id"])
            app_services = getattr(workspace, "_app_services", None)
            for key in ("approval_coordinator", "tool_coordinator"):
                context[key] = getattr(app_services, key, None)
            governor = await asyncio.to_thread(
                AgentBuilder._init_governor,
                workspace.workspace_dir,
                project,
            )
            try:
                guarded = PolicyGuardedTool(
                    tool._func,
                    governor=governor,
                    request_context=context,
                    input_schema=tool.input_schema,
                )
                decision = await guarded.check_permissions(params)
                if decision.behavior != PermissionBehavior.ALLOW:
                    return ToolExecResult(
                        ToolResult(
                            False,
                            error=decision.message or "Tool permission denied",
                            retryable=False,
                        )
                    )
                raw = guarded(**params)
                if inspect.isawaitable(raw):
                    raw = await raw
                chunks = []
                if hasattr(raw, "__aiter__"):
                    try:
                        async for chunk in raw:
                            chunks.append(chunk)
                    finally:
                        await raw.aclose()
                else:
                    chunks.append(raw)
                for chunk in chunks:
                    state = getattr(getattr(chunk, "state", None), "value", None)
                    if state in {"error", "denied"}:
                        return ToolExecResult(
                            ToolResult(
                                False,
                                error=str(_normalise_tool_output(chunk)),
                                retryable=False,
                            )
                        )
                data = [_normalise_tool_output(chunk) for chunk in chunks]
                return ToolExecResult(
                    ToolResult(True, data=data[0] if len(data) == 1 else data)
                )
            finally:
                if governor is not None:
                    await asyncio.to_thread(governor.stop)

        # Isolate mutations of tool ContextVars from other workflow nodes.
        async def isolated():
            return await asyncio.create_task(execute())

        try:
            return await self._on_host(isolated)
        except Exception as exc:
            return ToolExecResult(
                ToolResult(False, error=f"{type(exc).__name__}: {exc}", retryable=False)
            )


class GovernedWorkflowTools:
    def __init__(
        self, catalog: AgentNodeCatalog, agent_id: str, metadata: dict
    ) -> None:
        self.catalog, self.agent_id, self.metadata = catalog, agent_id, metadata

    def get_tool_context(self, state=None):
        return state

    async def execute(self, tool_name, params, context=None):
        return await self.catalog.invoke(
            self.agent_id, self.metadata, tool_name, params
        )
