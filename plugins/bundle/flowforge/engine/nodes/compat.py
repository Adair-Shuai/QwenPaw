# -*- coding: utf-8 -*-
"""Compatibility layer: provides the old simplified node API on top of the
new LeAgent-ported Schema-driven node system.

This lets ``executor.py``, ``service.py``, ``router.py`` and tests keep
using the old import path (``from .nodes import ToolNode, …``) while the
new Schema/caching/runner modules are available for advanced use.
"""

from __future__ import annotations

import asyncio
import inspect
import time
from typing import Any

from ..io import HiddenHolder, NodeOutput
from ..progress import NodeStatus, ProgressRegistry

try:
    from ..progress import CurrentNodeContext
except ImportError:
    class CurrentNodeContext:
        def __init__(self, node_id): self.node_id = node_id
        def __enter__(self): return self
        def __exit__(self, *a): pass


# ── Simplified node base (old API) ─────────────────────────────────────────────

class WorkflowNode:
    """Simplified node base (old API): async run() with positional args.
    Not abstract — allows instantiation for testing."""
    class_type: str = "WorkflowNode"
    display_name: str = "Workflow Node"
    description: str = ""
    category: str = "general"
    icon: str = "🔧"
    inputs_schema: list = []
    outputs_schema: list = []
    control_schema: list = []

    async def run(self, node_id, node_def, upstream_values, hidden) -> NodeOutput:
        raise NotImplementedError

    def resolve_inputs(self, node_def, upstream_values, hidden):
        state = getattr(hidden, 'workflow_state', None)
        ctx = state._build_context() if state and hasattr(state, '_build_context') else {}
        def resolve(value):
            if isinstance(value, list) and len(value) == 2 and isinstance(value[0], str):
                return upstream_values.get((value[0], int(value[1])))
            if isinstance(value, list) and value and all(
                isinstance(i, list) and len(i) == 2 and isinstance(i[0], str) for i in value
            ):
                return [upstream_values.get((i[0], int(i[1]))) for i in value]
            if isinstance(value, dict):
                return {k: resolve(v) for k, v in value.items()}
            if isinstance(value, list):
                return [resolve(i) for i in value]
            if state is not None:
                from ..types import _resolve_template
                return _resolve_template(value, ctx)
            return value
        return {k: resolve(v) for k, v in (node_def.get("inputs") or {}).items()}


class InputNode(WorkflowNode):
    class_type = "InputNode"
    display_name = "Input"
    category = "io"
    icon = "📥"
    outputs_schema = [{"name": "value", "type": "any"}]

    async def run(self, node_id, node_def, upstream_values, hidden):
        name = node_def.get("inputs", {}).get("name") or node_id
        state = hidden.workflow_state
        value = state.inputs.get(name) if state else None
        return NodeOutput(values=(value,))


class OutputNode(WorkflowNode):
    class_type = "OutputNode"
    display_name = "Output"
    category = "io"
    icon = "📤"
    inputs_schema = [{"name": "value", "type": "any", "required": True}]

    async def run(self, node_id, node_def, upstream_values, hidden):
        resolved = self.resolve_inputs(node_def, upstream_values, hidden)
        value = resolved.get("value")
        if hidden.workflow_state:
            hidden.workflow_state.outputs[node_id] = value
        return NodeOutput(values=(value,))


class ToolNode(WorkflowNode):
    class_type = "ToolNode"
    display_name = "Tool Call"
    category = "action"
    icon = "🛠️"
    inputs_schema = [{"name": "args", "type": "object", "required": False}]
    outputs_schema = [{"name": "result", "type": "any"}]
    control_schema = ["next", "error_handler"]

    async def run(self, node_id, node_def, upstream_values, hidden):
        resolved = self.resolve_inputs(node_def, upstream_values, hidden)
        kwargs = resolved.get("args") or {}
        if not isinstance(kwargs, dict):
            kwargs = {"value": kwargs}
        func = node_def.get("func")
        tool_name = node_def.get("tool_name") or node_def.get("inputs", {}).get("tool_name")
        if func is None and tool_name and hidden.tool_context is not None:
            tc = hidden.tool_context
            desc = None
            if hasattr(tc, "get"):
                desc = tc.get(tool_name)
            if desc is not None:
                func = getattr(desc, "func", None) or (desc if callable(desc) else None)
            elif isinstance(tc, dict):
                func = tc.get(tool_name)
        if func is None:
            return NodeOutput(error=f"ToolNode '{node_id}': no callable (tool_name={tool_name!r})")
        try:
            result = func(**kwargs) if not _is_async(func) else await func(**kwargs)
            if inspect.isawaitable(result):
                result = await result
        except Exception as exc:
            return NodeOutput(error=f"{type(exc).__name__}: {exc}")
        return NodeOutput(values=(result,))


class AgentNode(WorkflowNode):
    class_type = "AgentNode"
    display_name = "Agent Turn"
    category = "action"
    icon = "🤖"
    inputs_schema = [
        {"name": "agent_id", "type": "string", "required": True},
        {"name": "query", "type": "string", "required": True},
    ]
    outputs_schema = [{"name": "reply", "type": "string"}]
    control_schema = ["next", "error_handler"]

    async def run(self, node_id, node_def, upstream_values, hidden):
        resolved = self.resolve_inputs(node_def, upstream_values, hidden)
        agent_id = resolved.get("agent_id")
        query = resolved.get("query")
        if not agent_id or not query:
            return NodeOutput(error=f"AgentNode '{node_id}': agent_id and query required")
        runtime = hidden.agent_runtime
        if runtime is None:
            return NodeOutput(error="AgentNode requires agent_runtime")
        try:
            reply = await _dispatch_agent_turn(runtime, agent_id, query)
        except Exception as exc:
            return NodeOutput(error=f"{type(exc).__name__}: {exc}")
        return NodeOutput(values=(reply,))


class ConditionNode(WorkflowNode):
    class_type = "ConditionNode"
    display_name = "Condition"
    category = "control"
    icon = "🔀"
    control_schema = ["conditions", "else"]

    async def run(self, node_id, node_def, upstream_values, hidden):
        state = hidden.workflow_state
        control = node_def.get("control") or {}
        conditions = control.get("conditions", []) or []
        chosen = None
        for cond in conditions:
            expr_data = cond.get("condition") or cond.get("expr") or {}
            try:
                from ..types import ConditionExpression
                expr = ConditionExpression.model_validate(expr_data)
            except Exception as exc:
                return NodeOutput(error=f"ConditionNode '{node_id}': invalid expr: {exc}")
            if state is not None and expr.evaluate(state._build_context()):
                chosen = cond.get("then_node") or cond.get("then")
                break
        if chosen is None:
            chosen = control.get("else_node") or control.get("else")
        return NodeOutput(next_node=chosen)


class LLMNode(WorkflowNode):
    class_type = "LLMNode"
    display_name = "LLM Call"
    category = "action"
    icon = "💬"
    inputs_schema = [
        {"name": "prompt", "type": "string", "required": True},
        {"name": "system", "type": "string", "required": False},
    ]
    outputs_schema = [{"name": "reply", "type": "string"}]
    control_schema = ["next", "error_handler"]

    async def run(self, node_id, node_def, upstream_values, hidden):
        resolved = self.resolve_inputs(node_def, upstream_values, hidden)
        prompt = resolved.get("prompt")
        if not prompt:
            return NodeOutput(error=f"LLMNode '{node_id}': prompt required")
        svc = hidden.llm_service
        if svc is None:
            return NodeOutput(error="LLMNode requires llm_service")
        try:
            reply = await _call_llm(svc, prompt, resolved.get("system"))
        except Exception as exc:
            return NodeOutput(error=f"{type(exc).__name__}: {exc}")
        return NodeOutput(values=(reply,))


class CodeNode(WorkflowNode):
    class_type = "CodeNode"
    display_name = "Code"
    category = "action"
    icon = "🐍"
    inputs_schema = [{"name": "code", "type": "string", "required": True}]
    outputs_schema = [{"name": "result", "type": "any"}]
    control_schema = ["next", "error_handler"]
    _ALLOWED_BUILTINS = {
        "abs": abs, "all": all, "any": any, "bool": bool, "dict": dict,
        "enumerate": enumerate, "filter": filter, "float": float,
        "int": int, "len": len, "list": list, "map": map, "max": max,
        "min": min, "range": range, "round": round, "set": set,
        "sorted": sorted, "str": str, "sum": sum, "tuple": tuple,
        "zip": zip, "isinstance": isinstance, "print": print,
    }

    async def run(self, node_id, node_def, upstream_values, hidden):
        resolved = self.resolve_inputs(node_def, upstream_values, hidden)
        code = resolved.get("code") or node_def.get("code")
        if not code:
            return NodeOutput(error=f"CodeNode '{node_id}': code required")
        import math, json, re
        globals_ns = {"__builtins__": self._ALLOWED_BUILTINS, "math": math, "json": json, "re": re}
        locals_ns = {"inputs": resolved, "result": None}
        try:
            exec(code, globals_ns, locals_ns)
        except Exception as exc:
            return NodeOutput(error=f"{type(exc).__name__}: {exc}")
        return NodeOutput(values=(locals_ns.get("result"),))


# ── NodeRegistry (old API wrapper) ─────────────────────────────────────────────

class NodeRegistry:
    """Old API: maps class_type strings to node instances."""

    def __init__(self):
        self._nodes: dict[str, WorkflowNode] = {}

    def register(self, node):
        if isinstance(node, type):
            node = node()
        if not isinstance(node, WorkflowNode):
            raise TypeError(f"register() requires a WorkflowNode, got {type(node).__name__}")
        ct = getattr(node, 'class_type', None) or getattr(node, 'NODE_ID', None)
        if not ct:
            raise ValueError("node must define class_type")
        if ct in self._nodes:
            raise ValueError(f"tool {ct!r} already registered")
        self._nodes[ct] = node

    def get(self, class_type):
        return self._nodes.get(class_type)

    def names(self):
        return sorted(self._nodes.keys())

    def all_types(self):
        out = []
        for ct, node in sorted(self._nodes.items()):
            out.append({
                "class_type": ct,
                "display_name": getattr(node, 'display_name', ct),
                "description": getattr(node, 'description', ''),
                "category": getattr(node, 'category', 'general'),
                "icon": getattr(node, 'icon', '🔧'),
                "inputs_schema": getattr(node, 'inputs_schema', []),
                "outputs_schema": getattr(node, 'outputs_schema', []),
                "control_schema": getattr(node, 'control_schema', []),
            })
        return out

    def __contains__(self, ct):
        return isinstance(ct, str) and ct in self._nodes

    def __len__(self):
        return len(self._nodes)


# ── NodeRunner (old API) ───────────────────────────────────────────────────────

class NodeRunResult:
    __slots__ = ("output", "cached", "duration_ms", "error")

    def __init__(self, output, *, cached=False, duration_ms=0, error=None):
        self.output = output
        self.cached = cached
        self.duration_ms = duration_ms
        self.error = error


class NodeRunner:
    """Old API: runs a single node with progress reporting."""
    def __init__(self, *, registry, progress=None, **kwargs):
        self.registry = registry
        self.progress = progress

    async def run(self, node_id, node_def, upstream_values, hidden):
        ct = node_def.get("class_type", "ToolNode")
        node = self.registry.get(ct)
        if node is None:
            raise NodeExecutionError(ct, f"unknown node class_type '{ct}'") from None
        if self.progress:
            self.progress.set_status(node_id, NodeStatus.RUNNING)
        start = time.monotonic()
        try:
            with CurrentNodeContext(node_id):
                output = await node.run(node_id, node_def, upstream_values, hidden)
        except Exception as exc:
            if self.progress:
                self.progress.set_status(node_id, NodeStatus.FAILED, error=str(exc))
            from ..errors import NodeExecutionError
            raise NodeExecutionError(str(exc), node_id=node_id) from exc
        duration_ms = int((time.monotonic() - start) * 1000)
        if not isinstance(output, NodeOutput):
            output = NodeOutput(values=output)
        if self.progress:
            status = (
                NodeStatus.FAILED if output.error
                else NodeStatus.BLOCKED if output.block_execution
                else NodeStatus.COMPLETED
            )
            self.progress.set_status(node_id, status, duration_ms=duration_ms, metadata=output.metadata)
        return NodeRunResult(output=output, duration_ms=duration_ms)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _is_async(func):
    return asyncio.iscoroutinefunction(func) or inspect.iscoroutinefunction(func)


async def _dispatch_agent_turn(runtime, agent_id, query):
    agents = getattr(runtime, "agents", None) or getattr(runtime, "workspaces", None)
    if agents and agent_id in agents:
        ws = agents[agent_id]
        process = getattr(ws, "process", None)
        if process:
            result = process(query)
            if inspect.isawaitable(result):
                result = await result
            return _stringify_reply(result)
    process = getattr(runtime, "process_agent_message", None)
    if process:
        result = process(agent_id, query)
        if inspect.isawaitable(result):
            result = await result
        return _stringify_reply(result)
    run = getattr(runtime, "run_agent_turn", None)
    if run:
        result = run(agent_id, query)
        if inspect.isawaitable(result):
            result = await result
        return _stringify_reply(result)
    raise RuntimeError(f"agent_runtime {type(runtime).__name__} has no dispatch method")


def _stringify_reply(result):
    if result is None: return ""
    if isinstance(result, str): return result
    for attr in ("content", "text", "message", "reply", "output"):
        val = getattr(result, attr, None)
        if isinstance(val, str) and val: return val
    return str(result)


async def _call_llm(svc, prompt, system):
    chat = getattr(svc, "chat", None)
    if chat:
        messages = []
        if system: messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        result = chat(messages=messages) if "messages" in _callable_kwargs(chat) else chat(prompt)
        if inspect.isawaitable(result): result = await result
        return _stringify_reply(result)
    complete = getattr(svc, "complete", None)
    if complete:
        result = complete(prompt)
        if inspect.isawaitable(result): result = await result
        return _stringify_reply(result)
    raise RuntimeError(f"llm_service {type(svc).__name__} has no chat/complete")


def _callable_kwargs(func):
    try:
        return set(inspect.signature(func).parameters.keys())
    except (ValueError, TypeError):
        return set()


# ── Bootstrap ─────────────────────────────────────────────────────────────────

_registry: NodeRegistry | None = None


def bootstrap() -> NodeRegistry:
    global _registry
    if _registry is None:
        _registry = NodeRegistry()
        for cls in (InputNode, OutputNode, ToolNode, AgentNode, ConditionNode, LLMNode, CodeNode):
            _registry.register(cls())
    return _registry


def get_registry() -> NodeRegistry:
    return bootstrap()


__all__ = [
    "AgentNode", "CodeNode", "ConditionNode", "HiddenHolder", "InputNode",
    "LLMNode", "NodeOutput", "NodeRegistry", "NodeRunResult", "NodeRunner",
    "OutputNode", "ToolNode", "WorkflowNode", "bootstrap", "get_registry",
]
