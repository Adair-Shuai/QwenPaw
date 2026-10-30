# -*- coding: utf-8 -*-
"""A scoped Agent tool; only the host middleware supplies request identity."""

from __future__ import annotations

import asyncio
import json
from contextvars import ContextVar
from typing import Any

from agentscope.message import TextBlock, ToolResultState
from agentscope.middleware import MiddlewareBase
from agentscope.tool import ToolChunk

from .schema import RequestDefinition
from .scope import resolve_scope

_context: ContextVar[Any] = ContextVar(
    "openui_interaction_context",
    default=None,
)

INTERACTION_PROMPT = """
Structured user input is available in the right workspace via
request_user_input. Use it when essential information is missing, the user
must confirm parameters, or a bounded form will make the task clearer.
Use only actual task parameter names, units, constraints and known defaults;
explain unknown assumptions and sources. Fields support string, number,
integer, boolean, select and multiselect. After a pending request is created,
tell the user to fill the workspace panel and END THIS TURN. Do not guess the
answer, duplicate the request, poll, or execute work depending on these inputs.
The submitted answer arrives as a new user turn linked to this request; it is
not an Agent execution checkpoint. Cancelled requests supply no authorization.
""".strip()


def is_available(context: dict[str, Any]) -> bool:
    capabilities = context.get("ui_capabilities")
    session = context.get("session_id")
    root = context.get("root_session_id")
    return (
        context.get("channel") == "console"
        and isinstance(capabilities, dict)
        and capabilities.get("openui_interactions") == "v1"
        and context.get("source")
        not in {
            "cron",
            "heartbeat",
            "portability_adaptation",
            "subagent",
        }
        and context.get("subagent_allowed_tools") is None
        and not context.get("_spawn_subagent")
        and (not root or root == session)
    )


def capable_context(ctx) -> bool:
    request = getattr(ctx, "request", None)
    raw = getattr(request, "request_context", None)
    if not isinstance(raw, dict):
        return False
    return is_available(
        {
            **raw,
            "channel": getattr(request, "channel", None),
            "session_id": getattr(ctx, "session_id", None),
            "root_session_id": getattr(ctx, "root_session_id", None),
        },
    )


class InteractionMiddleware(MiddlewareBase):
    def __init__(self, ctx):
        self.ctx = ctx

    async def on_system_prompt(self, _agent, current_prompt: str) -> str:
        if INTERACTION_PROMPT in current_prompt:
            return current_prompt
        return f"{current_prompt.rstrip()}\n\n{INTERACTION_PROMPT}".strip()

    async def on_acting(self, _agent, input_kwargs, next_handler):
        call = input_kwargs.get("tool_call") or {}
        name = (
            call.get("name")
            if isinstance(call, dict)
            else getattr(call, "name", None)
        )
        if name != "request_user_input":
            async for event in next_handler(**input_kwargs):
                yield event
            return
        # Scoped to actual tool iteration; also inherited by asyncio.to_thread.
        token = _context.set(self.ctx if capable_context(self.ctx) else None)
        try:
            async for event in next_handler(**input_kwargs):
                yield event
        finally:
            _context.reset(token)


def _reply(payload: dict[str, Any]) -> ToolChunk:
    return ToolChunk(
        is_last=True,
        state=(
            ToolResultState.SUCCESS if payload["ok"] else ToolResultState.ERROR
        ),
        content=[
            TextBlock(
                type="text",
                text=json.dumps(payload, ensure_ascii=False),
            ),
        ],
    )


def build_tool(service):
    async def request_user_input(
        kind: str,
        title: str,
        fields: list[dict[str, Any]],
        description: str = "",
        preview: list[dict[str, str]] | None = None,
    ) -> ToolChunk:
        """Ask for structured input in the current Console workspace.

        End the turn after creation; wait for the user's submitted answer.
        Do not call dependent calculation tools before the user answers.
        Args:
            kind: clarify, confirm, or form.
            title: Short task-specific title.
            fields: One to 32 fields. Each has name, label, type (string,
                number, integer, boolean, select, multiselect); optional
                required, default, unit, description, minimum, maximum.
                Select types require options [{label, value}] with string
                values. Confirmations should use an explicit select choice.
            description: Explain missing inputs, assumptions and next action.
            preview: Optional read-only facts [{label, value}], strings only.
        """
        ctx = _context.get()
        if ctx is None or not capable_context(ctx):
            return _reply({"ok": False, "error": "unsupported_context"})
        try:
            workspace = getattr(ctx, "workspace", None)
            if workspace is None or workspace.agent_id != ctx.agent_id:
                raise KeyError("Console chat not found")
            scope = await resolve_scope(
                workspace,
                ctx.session_id,
                user_id=getattr(ctx.request, "user_id", None),
            )
            definition = RequestDefinition.model_validate(
                {
                    "kind": kind,
                    "title": title,
                    "fields": fields,
                    "description": description,
                    "preview": preview or [],
                },
            )
            record = await asyncio.to_thread(service.create, scope, definition)
        except (KeyError, ValueError) as exc:
            return _reply({"ok": False, "error": str(exc)})
        return _reply(
            {
                "ok": True,
                "kind": "openui_interaction",
                "request": record,
                "instruction": (
                    "End this turn and wait for the user's answer in "
                    "the workspace. Do not execute work dependent on "
                    "these inputs."
                ),
            },
        )

    return request_user_input
