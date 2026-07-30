# -*- coding: utf-8 -*-
"""FlowForge node base + registry + built-in nodes.

Ported and adapted from ``leagent.workflow.nodes`` (focused subset).
Each node type subclasses :class:`WorkflowNode` and implements
:meth:`run`. Built-in nodes:

  * :class:`InputNode`  — materialises a workflow input value.
  * :class:`OutputNode` — declares a workflow output.
  * :class:`ToolNode`   — invokes a QwenPaw agent tool (via workspace
    ToolRegistry). Falls back to a pure-python ``func`` callable when
    ``class_type == "CodeNode"``-style inline function is unavailable.
  * :class:`AgentNode`  — runs a QwenPaw agent sub-turn.
  * :class:`ConditionNode`] — evaluates a condition and routes to a branch.
  * :class:`LLMNode`     — direct LLM call via provider_manager.
  * :class:`CodeNode`    — runs a python snippet in a restricted namespace.

The :class:`NodeRegistry` maps ``class_type`` strings to node
instances and is the single extension point for plugins.
"""

from __future__ import annotations

import asyncio
import inspect
import logging
import time
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional

from .progress import NodeStatus, ProgressRegistry
from .types import (
    ConditionExpression,
    NodeExecutionResult,
    WorkflowState,
    WorkflowStatus,
    _resolve_template,
)

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────────────
# NodeOutput — the envelope returned by every node's run()
# ──────────────────────────────────────────────────────────────────────────────


@dataclass
class NodeOutput:
    """Envelope returned by :meth:`WorkflowNode.run`.

    Mirrors LeAgent's ``NodeOutput`` so the executor's bookkeeping is
    portable. ``values`` is a tuple-indexed slot list; slot ``i`` is
    consumed by downstream nodes via ``[upstream_id, i]`` input links.
    """

    values: tuple[Any, ...] = ()
    error: str | None = None
    next_node: str | None = None
    block_execution: str | None = None  # e.g. "awaiting_review"
    expand: dict[str, Any] | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    ui: dict[str, Any] | None = None

    def as_tuple(self) -> tuple[Any, ...]:
        if isinstance(self.values, tuple):
            return self.values
        return (self.values,)


@dataclass
class NodeRunResult:
    """Internal result returned by the :class:`NodeRunner`."""

    output: NodeOutput
    duration_ms: int = 0
    cached: bool = False


# ──────────────────────────────────────────────────────────────────────────────
# HiddenHolder — execution context passed to every node
# ──────────────────────────────────────────────────────────────────────────────


@dataclass
class HiddenHolder:
    """Shared execution context handed to every node's ``run()``.

    The executor populates this with references the nodes need to do
    their work (workspace manager, tool registry, llm service, …).
    """

    prompt: dict[str, dict[str, Any]]
    dynprompt: Any
    execution_id: str
    user_id: str | None = None
    session_id: str | None = None
    tool_context: Any = None
    llm_service: Any = None
    review_service: Any = None
    agent_runtime: Any = None
    workflow_state: WorkflowState | None = None
    progress: ProgressRegistry | None = None
    abort_event: asyncio.Event | None = None


# ──────────────────────────────────────────────────────────────────────────────
# WorkflowNode base + registry
# ──────────────────────────────────────────────────────────────────────────────


class WorkflowNode:
    """Abstract base for every workflow node type."""

    class_type: str = "WorkflowNode"
    display_name: str = "Workflow Node"
    description: str = ""
    category: str = "general"
    icon: str = "🔧"
    inputs_schema: list[dict[str, Any]] = []  # [{name, type, required, default}]
    outputs_schema: list[dict[str, Any]] = []  # [{name, type}]
    control_schema: list[str] = []  # ["next", "conditions", "else", …]

    async def run(
        self,
        node_id: str,
        node_def: dict[str, Any],
        upstream_values: dict[tuple[str, int], Any],
        hidden: HiddenHolder,
    ) -> NodeOutput:  # pragma: no cover — abstract
        raise NotImplementedError

    # ------------------------------------------------------------------
    def resolve_inputs(
        self,
        node_def: dict[str, Any],
        upstream_values: dict[tuple[str, int], Any],
        hidden: HiddenHolder,
    ) -> dict[str, Any]:
        """Resolve declared inputs to concrete values.

        Each input value can be:
          * ``[upstream_id, slot]``  → pull from ``upstream_values``.
          * ``[[id, slot], ...]``    → list of upstream refs.
          * ``"${var}"``             → template-resolve against state.
          * ``dict`` / nested        → recursively resolved (so
            ``args={"x": ["upstream_id", 0]}`` works for ToolNode).
          * any literal              → returned as-is.
        """
        state = hidden.workflow_state
        ctx = state._build_context() if state else {}

        def resolve(value: Any) -> Any:
            if (
                isinstance(value, list)
                and len(value) == 2
                and isinstance(value[0], str)
            ):
                return upstream_values.get((value[0], int(value[1])))
            if (
                isinstance(value, list)
                and value
                and all(
                    isinstance(item, list)
                    and len(item) == 2
                    and isinstance(item[0], str)
                    for item in value
                )
            ):
                return [
                    upstream_values.get((item[0], int(item[1])))
                    for item in value
                ]
            if isinstance(value, dict):
                return {k: resolve(v) for k, v in value.items()}
            if isinstance(value, list):
                return [resolve(item) for item in value]
            if state is not None:
                return _resolve_template(value, ctx)
            return value

        out: dict[str, Any] = {}
        for fname, value in (node_def.get("inputs") or {}).items():
            out[fname] = resolve(value)
        return out


class NodeRegistry:
    """Maps ``class_type`` strings to :class:`WorkflowNode` instances."""

    def __init__(self) -> None:
        self._nodes: Dict[str, WorkflowNode] = {}

    def register(self, node: WorkflowNode) -> None:
        if not node.class_type:
            raise ValueError("node must define class_type")
        if node.class_type in self._nodes:
            raise ValueError(
                f"node class_type '{node.class_type}' already registered",
            )
        self._nodes[node.class_type] = node

    def get(self, class_type: str) -> WorkflowNode | None:
        return self._nodes.get(class_type)

    def all_types(self) -> list[dict[str, Any]]:
        out: list[dict[str, Any]] = []
        for ct, node in self._items_sorted():
            out.append(
                {
                    "class_type": ct,
                    "display_name": node.display_name,
                    "description": node.description,
                    "category": node.category,
                    "icon": node.icon,
                    "inputs_schema": node.inputs_schema,
                    "outputs_schema": node.outputs_schema,
                    "control_schema": node.control_schema,
                },
            )
        return out

    def _items_sorted(self) -> list[tuple[str, WorkflowNode]]:
        return sorted(self._nodes.items(), key=lambda kv: kv[0])

    def __contains__(self, class_type: object) -> bool:
        return isinstance(class_type, str) and class_type in self._nodes

    def __len__(self) -> int:
        return len(self._nodes)


# ──────────────────────────────────────────────────────────────────────────────
# Built-in nodes
# ──────────────────────────────────────────────────────────────────────────────


class InputNode(WorkflowNode):
    """Materialises a workflow input value."""

    class_type = "InputNode"
    display_name = "Input"
    description = "Declares a workflow input parameter."
    category = "io"
    icon = "📥"
    outputs_schema = [{"name": "value", "type": "any"}]

    async def run(
        self,
        node_id: str,
        node_def: dict[str, Any],
        upstream_values: dict[tuple[str, int], Any],
        hidden: HiddenHolder,
    ) -> NodeOutput:
        name = node_def.get("inputs", {}).get("name") or node_id
        state = hidden.workflow_state
        value = state.inputs.get(name) if state else None
        return NodeOutput(values=(value,))


class OutputNode(WorkflowNode):
    """Declares a workflow output."""

    class_type = "OutputNode"
    display_name = "Output"
    description = "Declares a workflow output."
    category = "io"
    icon = "📤"
    inputs_schema = [{"name": "value", "type": "any", "required": True}]

    async def run(
        self,
        node_id: str,
        node_def: dict[str, Any],
        upstream_values: dict[tuple[str, int], Any],
        hidden: HiddenHolder,
    ) -> NodeOutput:
        resolved = self.resolve_inputs(node_def, upstream_values, hidden)
        value = resolved.get("value")
        if hidden.workflow_state is not None:
            hidden.workflow_state.outputs[node_id] = value
        return NodeOutput(values=(value,))


class ToolNode(WorkflowNode):
    """Invokes a QwenPaw agent tool (or any plain callable).

    Resolution order for the callable:
      1. ``node_def.func``   — inline callable (test / CodeNode-style).
      2. ``node_def.tool_name`` → lookup in ``hidden.tool_context``
         (QwenPaw workspace ToolRegistry or a dict of name→callable).
    """

    class_type = "ToolNode"
    display_name = "Tool Call"
    description = "Invoke a QwenPaw agent tool or inline callable."
    category = "action"
    icon = "🛠️"
    inputs_schema = [{"name": "args", "type": "object", "required": False}]
    outputs_schema = [{"name": "result", "type": "any"}]
    control_schema = ["next", "error_handler"]

    async def run(
        self,
        node_id: str,
        node_def: dict[str, Any],
        upstream_values: dict[tuple[str, int], Any],
        hidden: HiddenHolder,
    ) -> NodeOutput:
        resolved = self.resolve_inputs(node_def, upstream_values, hidden)
        kwargs = resolved.get("args") or {}
        if not isinstance(kwargs, dict):
            kwargs = {"value": kwargs}
        func: Callable[..., Any] | None = node_def.get("func")
        tool_name = node_def.get("tool_name") or node_def.get("inputs", {}).get(
            "tool_name",
        )
        if func is None and tool_name and hidden.tool_context is not None:
            tc = hidden.tool_context
            # QwenPaw ToolRegistry exposes ToolDescriptor with .func
            desc = None
            if hasattr(tc, "get"):
                desc = tc.get(tool_name)
            if desc is not None:
                func = getattr(desc, "func", None) or (
                    desc if callable(desc) else None
                )
            elif isinstance(tc, dict):
                func = tc.get(tool_name)
        if func is None:
            return NodeOutput(
                error=f"ToolNode '{node_id}': no callable resolved "
                f"(tool_name={tool_name!r})",
            )
        try:
            result = func(**kwargs) if not _is_async(func) else await func(**kwargs)
            if inspect.isawaitable(result):
                result = await result
        except Exception as exc:  # noqa: BLE001
            return NodeOutput(error=f"{type(exc).__name__}: {exc}")
        return NodeOutput(values=(result,))


class AgentNode(WorkflowNode):
    """Runs a QwenPaw agent sub-turn.

    Uses ``hidden.agent_runtime`` (the MultiAgentManager / workspace
    manager) to dispatch a single turn to the named agent and return
    its textual reply.
    """

    class_type = "AgentNode"
    display_name = "Agent Turn"
    description = "Run a QwenPaw agent sub-turn and return its reply."
    category = "action"
    icon = "🤖"
    inputs_schema = [
        {"name": "agent_id", "type": "string", "required": True},
        {"name": "query", "type": "string", "required": True},
    ]
    outputs_schema = [{"name": "reply", "type": "string"}]
    control_schema = ["next", "error_handler"]

    async def run(
        self,
        node_id: str,
        node_def: dict[str, Any],
        upstream_values: dict[tuple[str, int], Any],
        hidden: HiddenHolder,
    ) -> NodeOutput:
        resolved = self.resolve_inputs(node_def, upstream_values, hidden)
        agent_id = resolved.get("agent_id")
        query = resolved.get("query")
        if not agent_id or not query:
            return NodeOutput(
                error=f"AgentNode '{node_id}': agent_id and query are required",
            )
        runtime = hidden.agent_runtime
        if runtime is None:
            return NodeOutput(
                error="AgentNode requires agent_runtime (workspace manager)",
            )
        try:
            reply = await _dispatch_agent_turn(runtime, agent_id, query)
        except Exception as exc:  # noqa: BLE001
            return NodeOutput(error=f"{type(exc).__name__}: {exc}")
        return NodeOutput(values=(reply,))


async def _dispatch_agent_turn(
    runtime: Any,
    agent_id: str,
    query: str,
) -> str:
    """Best-effort dispatch of a single agent turn across QwenPaw runtimes."""
    # 1. MultiAgentManager-style: agents[agent_id].process(query)
    agents = getattr(runtime, "agents", None) or getattr(
        runtime, "workspaces", None,
    )
    if agents and agent_id in agents:
        ws = agents[agent_id]
        process = getattr(ws, "process", None)
        if process is not None:
            result = process(query)
            if inspect.isawaitable(result):
                result = await result
            return _stringify_agent_reply(result)
    # 2. process_agent_message(agent_id, query, ...) helper
    process = getattr(runtime, "process_agent_message", None)
    if process is not None:
        result = process(agent_id, query)
        if inspect.isawaitable(result):
            result = await result
        return _stringify_agent_reply(result)
    # 3. run_agent_turn helper
    run = getattr(runtime, "run_agent_turn", None)
    if run is not None:
        result = run(agent_id, query)
        if inspect.isawaitable(result):
            result = await result
        return _stringify_agent_reply(result)
    raise RuntimeError(
        f"agent_runtime {type(runtime).__name__} has no supported dispatch method",
    )


def _stringify_agent_reply(result: Any) -> str:
    """Best-effort extraction of a textual reply from an agent result."""
    if result is None:
        return ""
    if isinstance(result, str):
        return result
    # AgentScope Msg-like objects
    for attr in ("content", "text", "message", "reply", "output"):
        val = getattr(result, attr, None)
        if isinstance(val, str) and val:
            return val
    if hasattr(result, "role") and hasattr(result, "content"):
        return str(result.content)
    return str(result)


class ConditionNode(WorkflowNode):
    """Evaluates a condition and routes to a branch.

    The chosen successor is returned via ``NodeOutput.next_node``; the
    executor calls ``select_branch`` so the other branches are pruned.
    """

    class_type = "ConditionNode"
    display_name = "Condition"
    description = "Branch on a condition expression."
    category = "control"
    icon = "🔀"
    inputs_schema = []
    outputs_schema = []
    control_schema = ["conditions", "else"]

    async def run(
        self,
        node_id: str,
        node_def: dict[str, Any],
        upstream_values: dict[tuple[str, int], Any],
        hidden: HiddenHolder,
    ) -> NodeOutput:
        state = hidden.workflow_state
        control = node_def.get("control") or {}
        conditions = control.get("conditions", []) or []
        chosen: str | None = None
        for cond in conditions:
            expr_data = cond.get("condition") or cond.get("expr") or {}
            try:
                expr = ConditionExpression.model_validate(expr_data)
            except Exception as exc:  # noqa: BLE001
                return NodeOutput(
                    error=f"ConditionNode '{node_id}': invalid expr: {exc}",
                )
            if state is not None and expr.evaluate(state._build_context()):
                chosen = cond.get("then_node") or cond.get("then")
                break
        if chosen is None:
            chosen = control.get("else_node") or control.get("else")
        return NodeOutput(next_node=chosen)


class LLMNode(WorkflowNode):
    """Direct LLM call via the host's llm_service / provider manager.

    The ``llm_service`` on :class:`HiddenHolder` must expose either
    ``chat(messages, **kwargs)`` or ``complete(prompt, **kwargs)``.
    """

    class_type = "LLMNode"
    display_name = "LLM Call"
    description = "Direct LLM call returning the textual completion."
    category = "action"
    icon = "💬"
    inputs_schema = [
        {"name": "prompt", "type": "string", "required": True},
        {"name": "system", "type": "string", "required": False},
    ]
    outputs_schema = [{"name": "reply", "type": "string"}]
    control_schema = ["next", "error_handler"]

    async def run(
        self,
        node_id: str,
        node_def: dict[str, Any],
        upstream_values: dict[tuple[str, int], Any],
        hidden: HiddenHolder,
    ) -> NodeOutput:
        resolved = self.resolve_inputs(node_def, upstream_values, hidden)
        prompt = resolved.get("prompt")
        if not prompt:
            return NodeOutput(error=f"LLMNode '{node_id}': prompt required")
        svc = hidden.llm_service
        if svc is None:
            return NodeOutput(error="LLMNode requires llm_service")
        try:
            reply = await _call_llm(svc, prompt, resolved.get("system"))
        except Exception as exc:  # noqa: BLE001
            return NodeOutput(error=f"{type(exc).__name__}: {exc}")
        return NodeOutput(values=(reply,))


async def _call_llm(svc: Any, prompt: str, system: str | None) -> str:
    chat = getattr(svc, "chat", None)
    if chat is not None:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        result = chat(messages=messages) if "messages" in _callable_kwargs(chat) else chat(prompt)
        if inspect.isawaitable(result):
            result = await result
        return _stringify_agent_reply(result)
    complete = getattr(svc, "complete", None)
    if complete is not None:
        result = complete(prompt)
        if inspect.isawaitable(result):
            result = await result
        return _stringify_agent_reply(result)
    raise RuntimeError(f"llm_service {type(svc).__name__} has no chat/complete")


def _callable_kwargs(func: Callable[..., Any]) -> set[str]:
    try:
        sig = inspect.signature(func)
        return set(sig.parameters.keys())
    except (ValueError, TypeError):
        return set()


def _is_async(func: Any) -> bool:
    return asyncio.iscoroutinefunction(func) or inspect.iscoroutinefunction(func)


class CodeNode(WorkflowNode):
    """Runs a python snippet in a restricted namespace.

    The snippet is executed with ``inputs`` (resolved upstream values)
    available as locals; it must assign a ``result`` variable. No
    imports beyond what is already in scope (``math``, ``json``,
    ``re``) are permitted by default.
    """

    class_type = "CodeNode"
    display_name = "Code"
    description = "Run a python snippet returning ``result``."
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

    async def run(
        self,
        node_id: str,
        node_def: dict[str, Any],
        upstream_values: dict[tuple[str, int], Any],
        hidden: HiddenHolder,
    ) -> NodeOutput:
        resolved = self.resolve_inputs(node_def, upstream_values, hidden)
        code = resolved.get("code") or node_def.get("code")
        if not code:
            return NodeOutput(error=f"CodeNode '{node_id}': code required")
        import math
        import json
        import re

        globals_ns: dict[str, Any] = {
            "__builtins__": self._ALLOWED_BUILTINS,
            "math": math,
            "json": json,
            "re": re,
        }
        locals_ns: dict[str, Any] = {"inputs": resolved, "result": None}
        try:
            exec(  # noqa: S102 — sandboxed by restricted globals
                code, globals_ns, locals_ns,
            )
        except Exception as exc:  # noqa: BLE001
            return NodeOutput(error=f"{type(exc).__name__}: {exc}")
        return NodeOutput(values=(locals_ns.get("result"),))


# ──────────────────────────────────────────────────────────────────────────────
# NodeRunner — drives a single node's run() with caching + progress
# ──────────────────────────────────────────────────────────────────────────────


class NodeRunner:
    """Runs a single node, with a tiny output cache and progress reporting."""

    def __init__(
        self,
        *,
        registry: NodeRegistry,
        output_cache: dict[tuple[str, int], Any] | None = None,
        object_cache: dict[str, Any] | None = None,
        progress: ProgressRegistry | None = None,
        cache_provider: Any = None,
        cache_keys: Any = None,
    ) -> None:
        self.registry = registry
        self.output_cache: dict[tuple[str, int], Any] = (
            output_cache if output_cache is not None else {}
        )
        self.object_cache: dict[str, Any] = (
            object_cache if object_cache is not None else {}
        )
        self.progress = progress
        self.cache_provider = cache_provider
        self.cache_keys = cache_keys

    async def run(
        self,
        node_id: str,
        node_def: dict[str, Any],
        upstream_values: dict[tuple[str, int], Any],
        hidden: HiddenHolder,
    ) -> NodeRunResult:
        class_type = node_def.get("class_type", "ToolNode")
        node = self.registry.get(class_type)
        if node is None:
            raise NodeExecutionError(
                node_id, f"unknown node class_type '{class_type}'",
            ) from None
        if self.progress is not None:
            self.progress.set_status(node_id, NodeStatus.RUNNING)
        start = time.monotonic()
        try:
            output = await node.run(node_id, node_def, upstream_values, hidden)
        except Exception as exc:  # noqa: BLE001
            if self.progress is not None:
                self.progress.set_status(
                    node_id, NodeStatus.FAILED, error=str(exc),
                )
            raise NodeExecutionError(node_id, str(exc)) from exc
        duration_ms = int((time.monotonic() - start) * 1000)
        if self.progress is not None:
            status = (
                NodeStatus.FAILED if output.error
                else NodeStatus.BLOCKED if output.block_execution
                else NodeStatus.COMPLETED
            )
            self.progress.set_status(
                node_id,
                status,
                duration_ms=duration_ms,
                metadata=output.metadata,
            )
        return NodeRunResult(output=output, duration_ms=duration_ms)


# ──────────────────────────────────────────────────────────────────────────────
# bootstrap — build the default registry with all built-in nodes
# ──────────────────────────────────────────────────────────────────────────────


_registry: NodeRegistry | None = None


def bootstrap() -> NodeRegistry:
    """Return the singleton :class:`NodeRegistry` with built-in nodes."""
    global _registry
    if _registry is None:
        _registry = NodeRegistry()
        for node_cls in (
            InputNode,
            OutputNode,
            ToolNode,
            AgentNode,
            ConditionNode,
            LLMNode,
            CodeNode,
        ):
            instance = node_cls()
            if instance.class_type not in _registry:
                _registry.register(instance)
    return _registry


def get_registry() -> NodeRegistry:
    return bootstrap()


__all__ = [
    "AgentNode",
    "CodeNode",
    "ConditionNode",
    "HiddenHolder",
    "InputNode",
    "LLMNode",
    "NodeOutput",
    "NodeRegistry",
    "NodeRunResult",
    "NodeRunner",
    "OutputNode",
    "ToolNode",
    "WorkflowNode",
    "bootstrap",
    "get_registry",
]
