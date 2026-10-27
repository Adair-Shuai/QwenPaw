# -*- coding: utf-8 -*-
"""Adapter: ``AgentRuntime`` facade bridging QwenPaw's agent execution \
system.

LeAgent's ``agent_exec.py`` expects an ``AgentRuntime`` with:

* ``runtime.resolve(agent_name)`` → ``AgentDefinition``
* ``runtime.stream(definition, prompt, ...)`` → \
``AsyncIterator[AgentEvent]``
* ``runtime.delegate(parent, definition, prompt, ...)`` → dict \
envelope
* ``runtime.resume(agent_name, checkpoint_id, answer, ...)`` → \
``AsyncIterator[AgentEvent]``

QwenPaw builds agents per-request via ``AgentBuilder`` and runs them
through the ``Runtime`` pipeline.  This adapter provides the same
interface but dispatches to QwenPaw's native agent runtime — building
a fresh agent for each workflow agent node execution and streaming the
results as ``AgentEvent`` objects.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any, AsyncIterator
from uuid import UUID, uuid4

from .agent_definition import AgentDefinition
from .agent_events import AgentEvent, AgentEventType

logger = logging.getLogger(__name__)


class AgentRuntime:
    """Facade that dispatches workflow agent-node execution to QwenPaw's \
runtime.

    The runtime is wired by the plugin's ``_wire_services`` hook, \
which
    passes the host's ``MultiAgentManager`` (or equivalent workspace
    manager) as the ``workspace_manager`` attribute.
    """

    def __init__(self, workspace_manager: Any | None = None) -> None:
        self.workspace_manager = workspace_manager
        self._registry = None

    async def run_agent_turn(self, agent_id: str, query: str) -> str:
        """Dispatch the basic AgentNode through the same adapter as \
agent nodes."""
        result = await self.delegate(None, self.resolve(agent_id), query)
        if not result["success"]:
            raise RuntimeError(
                result["error"] or "Agent turn did not complete",
            )
        return result["text"]

    def resolve(self, agent_name: str) -> AgentDefinition:
        """Resolve an agent name into an :class:`AgentDefinition`."""
        from .agent_registry import get_agent_registry

        if self._registry is None:
            self._registry = get_agent_registry()

        definition = self._registry.get(agent_name)
        if definition is not None:
            return definition

        # Fallback: construct a minimal definition
        return AgentDefinition(
            name=agent_name,
            description=f"Agent '{agent_name}'",
            max_turns=20,
        )

    async def stream(
        self,
        definition: AgentDefinition,
        prompt: str,
        *,
        session_id: UUID | None = None,
        user_id: UUID | None = None,
        cwd: str = ".",
        tool_extra: dict[str, Any] | None = None,
        abort_event: asyncio.Event | None = None,
        allowed_tools: list[str] | None = None,
        max_turns: int | None = None,
    ) -> AsyncIterator[AgentEvent]:
        """Stream an agent turn, yielding :class:`AgentEvent` objects.

        This builds a QwenPaw agent for the definition's name and runs
        a single turn with the given prompt.  Agent output (text deltas,
        tool calls, results) is yielded as ``AgentEvent`` objects.
        """
        agent_name = definition.name

        # Try to get the workspace for this agent
        try:
            manager = self.workspace_manager
            if manager is not None and hasattr(manager, "get_agent"):
                ws = await manager.get_agent(agent_name)
            else:
                ws = self._get_workspace(agent_name)
        except Exception as exc:
            yield AgentEvent(AgentEventType.ERROR, {"error": str(exc)})
            yield AgentEvent(AgentEventType.RESULT, {"reason": "failed"})
            return
        if ws is None:
            yield AgentEvent(
                AgentEventType.ERROR,
                {"error": f"Agent '{agent_name}' not found"},
            )
            yield AgentEvent(AgentEventType.RESULT, {"reason": "failed"})
            return

        # Dispatch to QwenPaw's agent runtime
        async for event in self._run_qwenpaw_agent(
            ws,
            prompt,
            definition,
            cwd,
            abort_event,
            user_id=user_id,
            allowed_tools=allowed_tools,
            max_turns=max_turns,
        ):
            yield event

    async def delegate(
        self,
        parent: Any,
        definition: AgentDefinition,
        prompt: str,
        *,
        allowed_tools: list[str] | None = None,
        max_turns: int | None = None,
        tool_extra: dict[str, Any] | None = None,
        cwd: str | None = None,
        inherit_abort: bool = True,
        nested_preview_emit: Any = None,
        log_event: str = "agent_node",
        log_fields: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Delegate a sub-agent step from a parent agent.

        Returns a dict envelope with keys: ``text``, ``success``,
        ``steps_count``, ``checkpoint_id``, ``activity``, ``produced_files``,
        ``partial``, ``changed_files``, ``error``.
        """
        events = self.stream(
            definition,
            prompt,
            cwd=cwd or ".",
            tool_extra=tool_extra,
            allowed_tools=allowed_tools,
            max_turns=max_turns,
            abort_event=getattr(parent, "abort_event", None)
            if inherit_abort
            else None,
        )

        text_parts: list[str] = []
        final_text = ""
        steps = 0
        activity: list[dict[str, Any]] = []
        produced: list[Any] = []
        error: str | None = None
        reason = "completed"

        async for event in events:
            etype = event.type
            data = event.data or {}
            if etype == AgentEventType.STREAM_DELTA:
                delta = data.get("content")
                if delta:
                    text_parts.append(str(delta))
                    if nested_preview_emit:
                        nested_preview_emit(
                            {"type": "delta", "content": str(delta)},
                        )
            elif etype == AgentEventType.ASSISTANT:
                final_text = str(data.get("content") or "")
                if nested_preview_emit:
                    nested_preview_emit(
                        {"type": "assistant", "content": final_text},
                    )
            elif etype == AgentEventType.TOOL_USE:
                steps += 1
                name = str(data.get("name") or "tool")
                activity.append({"type": "tool_use", "name": name})
            elif etype == AgentEventType.TOOL_RESULT:
                name = str(data.get("name") or "tool")
                activity.append({"type": "tool_result", "name": name})
            elif etype == AgentEventType.WORKSPACE_ATTACHMENTS:
                for path in data.get("paths") or []:
                    if path:
                        produced.append(str(path))
            elif etype == AgentEventType.RESULT:
                reason = str(data.get("reason") or "completed")
                error = data.get("error") or error
            elif etype == AgentEventType.ERROR:
                error = str(data.get("error") or "Unknown error")

        text = final_text or "".join(text_parts)
        success = error is None and reason == "completed"
        return {
            "text": text,
            "success": success,
            "steps_count": steps,
            "checkpoint_id": "",
            "activity": activity,
            "produced_files": produced,
            "partial": reason not in ("completed", ""),
            "changed_files": [],
            "error": error,
        }

    async def resume(
        self,
        agent_name: str,
        checkpoint_id: str,
        answer: str,
        *,
        user_id: UUID | None = None,
        cwd: str = ".",
        tool_extra: dict[str, Any] | None = None,
        abort_event: asyncio.Event | None = None,
    ) -> AsyncIterator[AgentEvent]:
        """Reject unsupported agent checkpoint recovery without replaying work.

        Workflow checkpoints are supported separately by WorkflowService.
        The host adapter has no verified agent checkpoint restoration API.
        """
        # Every legacy resume option must produce the same rejection. Looking
        # up an agent or using its answer here would risk replaying a new turn.
        del agent_name, checkpoint_id, answer, user_id, cwd, tool_extra
        del abort_event
        error = (
            "Agent checkpoint resume is not supported by this "
            "adapter; no new turn was started"
        )
        yield AgentEvent(AgentEventType.ERROR, {"error": error})
        yield AgentEvent(
            AgentEventType.RESULT,
            {"reason": "failed", "error": error},
        )

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _get_workspace(self, agent_name: str) -> Any | None:
        """Find the workspace for ``agent_name`` from the workspace manager."""
        if self.workspace_manager is None:
            return None
        agents = (
            getattr(self.workspace_manager, "agents", None)
            or getattr(self.workspace_manager, "workspaces", None)
            or {}
        )
        if isinstance(agents, dict):
            return agents.get(agent_name)
        return None

    async def _run_qwenpaw_agent(
        self,
        workspace: Any,
        prompt: str,
        definition: AgentDefinition,
        cwd: str,
        abort_event: asyncio.Event | None,
        *,
        user_id: UUID | None = None,
        allowed_tools: list[str] | None = None,
        max_turns: int | None = None,
    ) -> AsyncIterator[AgentEvent]:
        """Run a QwenPaw agent turn and yield events.

        This uses the workspace's ``process`` or ``process_agent_message``
        method to run a single agent turn, converting the result into
        ``AgentEvent`` objects.
        """
        import inspect

        try:
            if abort_event is not None and abort_event.is_set():
                raise asyncio.CancelledError()
            if hasattr(workspace, "stream_query"):
                from qwenpaw.app.agent_context import get_current_user_id
                from ...invocation import current_run, workflow_stack

                invocation = current_run.get() or {}

                request = {
                    "input": [
                        {
                            "role": "user",
                            "content": [{"type": "text", "text": prompt}],
                        },
                    ],
                    "session_id": f"flowforge:{uuid4().hex}",
                    "user_id": str(
                        user_id
                        or invocation.get("user_id")
                        or get_current_user_id()
                        or "flowforge",
                    ),
                    "channel": "console",
                    "request_context": {
                        "source": "flowforge",
                        "agent_id": definition.name,
                        "workflow_stack": list(workflow_stack.get()),
                        "workflow_run_id": invocation.get("run_id"),
                        "root_workflow_run_id": invocation.get("root_run_id"),
                        "parent_session_id": invocation.get("session_id"),
                    },
                }
                request["request_context"].update(
                    _execution_controls(definition, allowed_tools, max_turns),
                )
                async for event in workspace.stream_query(request):
                    if abort_event is not None and abort_event.is_set():
                        raise asyncio.CancelledError()
                    status = _field(event, "status")
                    status = getattr(status, "value", status)
                    error = _field(event, "error")
                    if error or status in ("failed", "cancelled"):
                        raise RuntimeError(
                            str(error or f"Agent turn {status}"),
                        )
                    role = _field(event, "role")
                    role = getattr(role, "value", role)
                    if (
                        _field(event, "object") == "message"
                        and status == "completed"
                        and role == "assistant"
                    ):
                        text = "".join(
                            str(_field(block, "text") or "")
                            for block in (_field(event, "content") or [])
                            if _field(block, "type") == "text"
                        )
                        if text:
                            yield AgentEvent(
                                AgentEventType.ASSISTANT,
                                {"content": text},
                            )
                yield AgentEvent(
                    AgentEventType.RESULT,
                    {"reason": "completed"},
                )
                return

            if allowed_tools is not None or max_turns is not None:
                raise RuntimeError(
                    "Agent runtime cannot enforce workflow execution controls",
                )

            # Try workspace.process (single-agent workspace)
            process = getattr(workspace, "process", None)
            if process is not None:
                result = process(prompt)
                if inspect.isawaitable(result):
                    result = await result
                text = _extract_text(result)
                yield AgentEvent(AgentEventType.ASSISTANT, {"content": text})
                yield AgentEvent(
                    AgentEventType.RESULT,
                    {"reason": "completed"},
                )
                return

            # Try process_agent_message (multi-agent workspace)
            process_msg = getattr(workspace, "process_agent_message", None)
            if process_msg is not None:
                agent_id = getattr(workspace, "agent_id", definition.name)
                result = process_msg(agent_id, prompt)
                if inspect.isawaitable(result):
                    result = await result
                text = _extract_text(result)
                yield AgentEvent(AgentEventType.ASSISTANT, {"content": text})
                yield AgentEvent(
                    AgentEventType.RESULT,
                    {"reason": "completed"},
                )
                return

            raise RuntimeError(
                f"Agent '{definition.name}' has no supported runtime",
            )

        except Exception as exc:  # noqa: BLE001
            logger.exception("Agent %s failed: %s", definition.name, exc)
            yield AgentEvent(AgentEventType.ERROR, {"error": str(exc)})
            yield AgentEvent(
                AgentEventType.RESULT,
                {"reason": "failed", "error": str(exc)},
            )


def _execution_controls(
    definition: AgentDefinition,
    allowed_tools: list[str] | None,
    max_turns: int | None,
) -> dict[str, Any]:
    """Translate node restrictions into the host's guarded request context."""
    context: dict[str, Any] = {}
    if allowed_tools is not None:
        if not isinstance(allowed_tools, list) or any(
            not isinstance(name, str) for name in allowed_tools
        ):
            raise ValueError("allowed_tools must be a list of tool names")
        context["subagent_allowed_tools"] = list(allowed_tools)
    elif definition.tools.allow:
        context["subagent_allowed_tools"] = list(definition.tools.allow)
    limit = max_turns if max_turns is not None else definition.max_turns
    if max_turns is not None or limit:
        if isinstance(limit, bool) or not isinstance(limit, int) or limit < 1:
            raise ValueError("max_turns must be a positive integer")
        context["max_react_iterations"] = limit
    return context


def _field(value: Any, name: str) -> Any:
    return (
        value.get(name)
        if isinstance(value, dict)
        else getattr(value, name, None)
    )


def _extract_text(result: Any) -> str:
    """Best-effort text extraction from various result types."""
    if result is None:
        return ""
    if isinstance(result, str):
        return result
    for attr in ("content", "text", "message", "reply", "output"):
        val = getattr(result, attr, None)
        if isinstance(val, str) and val:
            return val
    return str(result)


__all__ = ["AgentRuntime"]
