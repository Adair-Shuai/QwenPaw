# -*- coding: utf-8 -*-
"""Adapter: ``AgentRuntime`` facade bridging QwenPaw's agent execution system.

LeAgent's ``agent_exec.py`` expects an ``AgentRuntime`` with:

* ``runtime.resolve(agent_name)`` → ``AgentDefinition``
* ``runtime.stream(definition, prompt, ...)`` → ``AsyncIterator[AgentEvent]``
* ``runtime.delegate(parent, definition, prompt, ...)`` → dict envelope
* ``runtime.resume(agent_name, checkpoint_id, answer, ...)`` → ``AsyncIterator[AgentEvent]``

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
from uuid import UUID

from .agent_definition import AgentDefinition
from .agent_events import AgentEvent, AgentEventType

logger = logging.getLogger(__name__)


class AgentRuntime:
    """Facade that dispatches workflow agent-node execution to QwenPaw's runtime.

    The runtime is wired by the plugin's ``_wire_services`` hook, which
    passes the host's ``MultiAgentManager`` (or equivalent workspace
    manager) as the ``workspace_manager`` attribute.
    """

    def __init__(self, workspace_manager: Any | None = None) -> None:
        self.workspace_manager = workspace_manager
        self._registry = None

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
    ) -> AsyncIterator[AgentEvent]:
        """Stream an agent turn, yielding :class:`AgentEvent` objects.

        This builds a QwenPaw agent for the definition's name and runs
        a single turn with the given prompt.  Agent output (text deltas,
        tool calls, results) is yielded as ``AgentEvent`` objects.
        """
        agent_name = definition.name

        # Try to get the workspace for this agent
        ws = self._get_workspace(agent_name)
        if ws is None:
            # No workspace — use LLM directly as a fallback
            yield AgentEvent(
                AgentEventType.ASSISTANT,
                {"content": f"Agent '{agent_name}' not found — using direct LLM call."},
            )
            try:
                from .llm_service import LLMService
                from .chat_message import ChatMessage

                svc = LLMService()
                response = await svc.complete(
                    messages=[ChatMessage.user(prompt)],
                )
                yield AgentEvent(
                    AgentEventType.ASSISTANT,
                    {"content": response.content},
                )
            except Exception as exc:  # noqa: BLE001
                yield AgentEvent(
                    AgentEventType.ERROR,
                    {"error": str(exc)},
                )
            yield AgentEvent(
                AgentEventType.RESULT,
                {"reason": "completed"},
            )
            return

        # Dispatch to QwenPaw's agent runtime
        async for event in self._run_qwenpaw_agent(ws, prompt, definition, cwd, abort_event):
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
                        nested_preview_emit({"type": "delta", "content": str(delta)})
            elif etype == AgentEventType.ASSISTANT:
                final_text = str(data.get("content") or "")
                if nested_preview_emit:
                    nested_preview_emit({"type": "assistant", "content": final_text})
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
                error = data.get("error")
            elif etype == AgentEventType.ERROR:
                error = str(data.get("error") or "Unknown error")

        text = final_text or "".join(text_parts)
        success = error is None
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
        """Resume a paused agent turn from a checkpoint.

        QwenPaw doesn't have a direct checkpoint/resume mechanism yet,
        so this starts a fresh turn with the answer as input.
        """
        definition = self.resolve(agent_name)
        # Append the answer as a continuation prompt
        prompt = f"[Resumed from checkpoint {checkpoint_id}]\n\n{answer}"
        async for event in self.stream(
            definition,
            prompt,
            user_id=user_id,
            cwd=cwd,
            tool_extra=tool_extra,
            abort_event=abort_event,
        ):
            yield event

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
    ) -> AsyncIterator[AgentEvent]:
        """Run a QwenPaw agent turn and yield events.

        This uses the workspace's ``process`` or ``process_agent_message``
        method to run a single agent turn, converting the result into
        ``AgentEvent`` objects.
        """
        import inspect

        try:
            # Try workspace.process (single-agent workspace)
            process = getattr(workspace, "process", None)
            if process is not None:
                result = process(prompt)
                if inspect.isawaitable(result):
                    result = await result
                text = _extract_text(result)
                yield AgentEvent(AgentEventType.ASSISTANT, {"content": text})
                yield AgentEvent(AgentEventType.RESULT, {"reason": "completed"})
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
                yield AgentEvent(AgentEventType.RESULT, {"reason": "completed"})
                return

            # Fallback: direct LLM call
            from .llm_service import LLMService
            from .chat_message import ChatMessage

            svc = LLMService()
            response = await svc.complete(messages=[ChatMessage.user(prompt)])
            yield AgentEvent(AgentEventType.ASSISTANT, {"content": response.content})
            yield AgentEvent(AgentEventType.RESULT, {"reason": "completed"})

        except Exception as exc:  # noqa: BLE001
            logger.error("agent_runtime_error", agent=definition.name, error=str(exc), exc_info=True)
            yield AgentEvent(AgentEventType.ERROR, {"error": str(exc)})
            yield AgentEvent(AgentEventType.RESULT, {"reason": "failed", "error": str(exc)})


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
