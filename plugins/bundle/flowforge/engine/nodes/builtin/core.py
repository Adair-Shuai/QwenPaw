# -*- coding: utf-8 -*-
"""Schema-native core nodes used by FlowForge-authored workflows."""

from __future__ import annotations

import asyncio
import inspect
import json
import math
import re
from typing import Any

from ...io import IO, Hidden, HiddenHolder, NodeOutput, Schema
from ...types import ConditionExpression
from ..base import WorkflowNode


class InputNode(WorkflowNode):
    NODE_ID = "InputNode"

    @classmethod
    def define_schema(cls) -> Schema:
        return Schema(
            node_id=cls.NODE_ID, display_name="Input", category="workflow/io",
            description="Read one value from workflow inputs.",
            inputs=[IO.String.Input(id="name")],
            outputs=[IO.Any_.Output(id="value")],
            hidden=[Hidden.WORKFLOW_STATE],
        )

    async def execute(self, *, hidden: HiddenHolder, **inputs: Any) -> NodeOutput:
        state = hidden.workflow_state
        return NodeOutput(values=((state.inputs.get(inputs["name"]) if state else None),))


class OutputNode(WorkflowNode):
    NODE_ID = "OutputNode"

    @classmethod
    def define_schema(cls) -> Schema:
        return Schema(
            node_id=cls.NODE_ID, display_name="Output", category="workflow/io",
            description="Publish a workflow output.",
            inputs=[IO.Any_.Input(id="value")],
            outputs=[IO.Any_.Output(id="value")],
            hidden=[Hidden.UNIQUE_ID, Hidden.WORKFLOW_STATE],
            is_output_node=True,
        )

    async def execute(self, *, hidden: HiddenHolder, **inputs: Any) -> NodeOutput:
        value = inputs.get("value")
        if hidden.workflow_state is not None and hidden.unique_id:
            hidden.workflow_state.outputs[hidden.unique_id] = value
        return NodeOutput(values=(value,))


class AgentNode(WorkflowNode):
    NODE_ID = "AgentNode"

    @classmethod
    def define_schema(cls) -> Schema:
        return Schema(
            node_id=cls.NODE_ID, display_name="Agent Turn",
            category="workflow/action",
            inputs=[
                IO.String.Input(id="agent_id"),
                IO.String.Input(id="query", multiline=True),
            ],
            outputs=[IO.String.Output(id="reply")],
            hidden=[Hidden.AGENT_RUNTIME],
            control_flow=True,
            not_idempotent=True,
        )

    async def execute(self, *, hidden: HiddenHolder, **inputs: Any) -> NodeOutput:
        runtime = hidden.agent_runtime
        if runtime is None:
            return NodeOutput(error="AgentNode requires agent_runtime")
        try:
            reply = await _dispatch_agent_turn(
                runtime, str(inputs["agent_id"]), str(inputs["query"]),
            )
        except Exception as exc:  # noqa: BLE001
            return NodeOutput(error=f"{type(exc).__name__}: {exc}")
        return NodeOutput(values=(reply,))


class ToolNode(WorkflowNode):
    NODE_ID = "ToolNode"

    @classmethod
    def define_schema(cls) -> Schema:
        return Schema(
            node_id=cls.NODE_ID, display_name="Tool Call",
            category="workflow/action",
            inputs=[
                IO.String.Input(id="tool_name"),
                IO.Object.Input(id="args", optional=True, default={}),
            ],
            outputs=[IO.Any_.Output(id="result")],
            hidden=[Hidden.TOOL_CONTEXT],
            control_flow=True,
            not_idempotent=True,
        )

    async def execute(self, *, hidden: HiddenHolder, **inputs: Any) -> NodeOutput:
        tool_name = str(inputs.get("tool_name") or "")
        context = hidden.tool_context
        registry = getattr(context, "tool_registry", context)
        descriptor = (
            registry.get(tool_name)
            if registry is not None and hasattr(registry, "get")
            else None
        )
        func = getattr(descriptor, "func", None) or (
            descriptor if callable(descriptor) else None
        )
        if func is None:
            return NodeOutput(error=f"ToolNode: unknown tool {tool_name!r}")
        try:
            result = func(**(inputs.get("args") or {}))
            if inspect.isawaitable(result):
                result = await result
        except Exception as exc:  # noqa: BLE001
            return NodeOutput(error=f"{type(exc).__name__}: {exc}")
        return NodeOutput(values=(result,))


class ConditionNode(WorkflowNode):
    NODE_ID = "ConditionNode"

    @classmethod
    def define_schema(cls) -> Schema:
        return Schema(
            node_id=cls.NODE_ID, display_name="Condition",
            category="workflow/control",
            outputs=[],
            hidden=[Hidden.UNIQUE_ID, Hidden.PROMPT, Hidden.WORKFLOW_STATE],
            control_flow=True,
        )

    async def execute(self, *, hidden: HiddenHolder, **inputs: Any) -> NodeOutput:
        node = hidden.prompt.get(hidden.unique_id or "", {})
        control = node.get("control") or {}
        context = (
            hidden.workflow_state._build_context()
            if hidden.workflow_state is not None
            else {}
        )
        for condition in control.get("conditions") or []:
            expression = ConditionExpression.model_validate(
                condition.get("condition") or condition.get("expr") or {},
            )
            if expression.evaluate(context):
                return NodeOutput(
                    next_node=condition.get("then_node") or condition.get("then"),
                )
        return NodeOutput(
            next_node=control.get("else_node") or control.get("else"),
        )


class LLMNode(WorkflowNode):
    NODE_ID = "LLMNode"

    @classmethod
    def define_schema(cls) -> Schema:
        return Schema(
            node_id=cls.NODE_ID, display_name="LLM Call",
            category="workflow/action",
            inputs=[
                IO.String.Input(id="prompt", multiline=True),
                IO.String.Input(id="system", optional=True, multiline=True),
            ],
            outputs=[IO.String.Output(id="reply")],
            hidden=[Hidden.LLM_SERVICE],
            control_flow=True,
            not_idempotent=True,
        )

    async def execute(self, *, hidden: HiddenHolder, **inputs: Any) -> NodeOutput:
        service = hidden.llm_service
        if service is None:
            return NodeOutput(error="LLMNode requires llm_service")
        try:
            if hasattr(service, "chat"):
                messages = []
                if inputs.get("system"):
                    messages.append({"role": "system", "content": inputs["system"]})
                messages.append({"role": "user", "content": inputs["prompt"]})
                result = service.chat(messages=messages)
            else:
                result = service.complete(inputs["prompt"])
            if inspect.isawaitable(result):
                result = await result
        except Exception as exc:  # noqa: BLE001
            return NodeOutput(error=f"{type(exc).__name__}: {exc}")
        return NodeOutput(values=(_stringify(result),))


class CodeNode(WorkflowNode):
    NODE_ID = "CodeNode"
    _BUILTINS = {
        "abs": abs, "all": all, "any": any, "bool": bool, "dict": dict,
        "enumerate": enumerate, "float": float, "int": int, "len": len,
        "list": list, "max": max, "min": min, "range": range, "round": round,
        "set": set, "sorted": sorted, "str": str, "sum": sum, "tuple": tuple,
        "zip": zip,
    }

    @classmethod
    def define_schema(cls) -> Schema:
        return Schema(
            node_id=cls.NODE_ID, display_name="Code",
            category="workflow/action",
            inputs=[IO.String.Input(id="code", multiline=True)],
            outputs=[IO.Any_.Output(id="result")],
            control_flow=True,
            not_idempotent=True,
        )

    async def execute(self, *, hidden: HiddenHolder, **inputs: Any) -> NodeOutput:
        local_vars = {"inputs": inputs, "result": None}
        try:
            exec(  # noqa: S102
                str(inputs["code"]),
                {
                    "__builtins__": self._BUILTINS,
                    "asyncio": asyncio, "json": json, "math": math, "re": re,
                },
                local_vars,
            )
        except Exception as exc:  # noqa: BLE001
            return NodeOutput(error=f"{type(exc).__name__}: {exc}")
        return NodeOutput(values=(local_vars.get("result"),))


async def _dispatch_agent_turn(runtime: Any, agent_id: str, query: str) -> str:
    agents = getattr(runtime, "agents", None) or getattr(runtime, "workspaces", None)
    if agents and agent_id in agents and hasattr(agents[agent_id], "process"):
        result = agents[agent_id].process(query)
    elif hasattr(runtime, "process_agent_message"):
        result = runtime.process_agent_message(agent_id, query)
    elif hasattr(runtime, "run_agent_turn"):
        result = runtime.run_agent_turn(agent_id, query)
    else:
        raise RuntimeError("agent runtime has no supported dispatch method")
    if inspect.isawaitable(result):
        result = await result
    return _stringify(result)


def _stringify(value: Any) -> str:
    if isinstance(value, str):
        return value
    for attribute in ("content", "text", "message", "reply", "output"):
        candidate = getattr(value, attribute, None)
        if isinstance(candidate, str):
            return candidate
    return "" if value is None else str(value)


CORE_NODES = [
    InputNode, OutputNode, AgentNode, ToolNode, ConditionNode, LLMNode, CodeNode,
]
