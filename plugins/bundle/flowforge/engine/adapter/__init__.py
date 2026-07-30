# -*- coding: utf-8 -*-
"""FlowForge adapter layer — QwenPaw-native replacement for ``leagent.*`` imports.

This package provides drop-in replacements for every ``leagent.*`` symbol
the workflow engine nodes import.  By routing through this adapter, the
FlowForge plugin has **zero hard dependency on the ``leagent`` package** and
runs entirely on QwenPaw's native tool registry, LLM provider system, and
agent runtime.

Modules:

* :mod:`tool_base`        — ``BaseTool`` / ``ToolCategory`` wrapping ``ToolDescriptor``
* :mod:`tool_registry`    — ``ToolRegistry`` / ``ToolExecutor`` bridging QwenPaw tools
* :mod:`chat_message`     — ``ChatMessage`` using agentscope ``Msg``
* :mod:`llm_service`      — ``LLMService`` using ``ProviderManager``
* :mod:`agent_definition` — ``AgentDefinition`` / ``ModelPolicy``
* :mod:`agent_registry`   — ``AgentRegistry`` / ``get_agent_registry``
* :mod:`agent_events`     — ``AgentEventType`` / ``AgentEvent``
* :mod:`agent_runtime`    — ``AgentRuntime`` facade
* :mod:`prompts`          — control-agent prompts + playbook helpers
* :mod:`sandbox`          — in-process script sandbox
* :mod:`tool_output`      — ``register_tool_artifact``
* :mod:`service_manager`  — ``get_service_manager``
* :mod:`execution`        — ``begin_execution`` / ``end_execution`` / ``ExecutionScope``
* :mod:`domain_registry`  — domain model registry stubs
"""

from __future__ import annotations

# Tool layer
from .tool_base import BaseTool, ToolCategory, wrap_descriptor
from .tool_registry import ToolExecutor, ToolExecResult, ToolRegistry, ToolResult

# LLM layer
from .chat_message import ChatMessage, messages_to_agentscope
from .llm_service import LLMResponse, LLMService

# Agent layer
from .agent_definition import AgentDefinition, ModelPolicy, ToolsPolicy
from .agent_registry import AgentRegistry, get_agent_registry
from .agent_events import AgentEvent, AgentEventType
from .agent_runtime import AgentRuntime

# Prompts
from .prompts import (
    compose_control_messages,
    mode_choices,
    playbook_ids_from_context,
    try_parse_json_payload,
)

# Sandbox
from .sandbox import (
    ScriptExecutionError,
    ScriptResult,
    ScriptTimeoutError,
    execute_script,
)

# File / service stubs
from .tool_output import register_tool_artifact
from .service_manager import ServiceManagerFacade, get_service_manager

# Execution scope stubs
from .execution import ExecutionRun, ExecutionScope, begin_execution, end_execution

# Domain model stubs
from .domain_registry import (
    DomainModelAdapter,
    DomainModelRegistry,
    DomainModelSpec,
    DomainParam,
    get_domain_registry,
    load_domain_model_plugins,
    register_builtin_domain_models,
)

# Default coding/script agent tool sets (QwenPaw-native equivalents)
DEFAULT_CODING_AGENT_TOOLS = (
    "read_file",
    "write_file",
    "edit_file",
    "grep_search",
    "glob_search",
    "execute_shell_command",
    "ast_search",
)

DEFAULT_SCRIPT_AGENT_TOOLS = (
    "execute_shell_command",
    "read_file",
    "write_file",
)

# Capability bootstrap stub (no-op)
def bootstrap_capabilities() -> dict[str, list[str]]:
    """Return empty capability registry (no domain models in QwenPaw)."""
    return {"generation": [], "domain": []}


__all__ = [
    # Tool layer
    "BaseTool", "ToolCategory", "wrap_descriptor",
    "ToolExecutor", "ToolExecResult", "ToolRegistry", "ToolResult",
    # LLM layer
    "ChatMessage", "messages_to_agentscope",
    "LLMResponse", "LLMService",
    # Agent layer
    "AgentDefinition", "ModelPolicy", "ToolsPolicy",
    "AgentRegistry", "get_agent_registry",
    "AgentEvent", "AgentEventType",
    "AgentRuntime",
    # Prompts
    "compose_control_messages", "mode_choices",
    "playbook_ids_from_context", "try_parse_json_payload",
    # Sandbox
    "ScriptExecutionError", "ScriptResult", "ScriptTimeoutError",
    "execute_script",
    # File / service
    "register_tool_artifact",
    "ServiceManagerFacade", "get_service_manager",
    # Execution
    "ExecutionRun", "ExecutionScope", "begin_execution", "end_execution",
    # Domain models
    "DomainModelAdapter", "DomainModelRegistry", "DomainModelSpec",
    "DomainParam", "get_domain_registry",
    "load_domain_model_plugins", "register_builtin_domain_models",
    # Tool sets
    "DEFAULT_CODING_AGENT_TOOLS", "DEFAULT_SCRIPT_AGENT_TOOLS",
    # Capabilities
    "bootstrap_capabilities",
]
