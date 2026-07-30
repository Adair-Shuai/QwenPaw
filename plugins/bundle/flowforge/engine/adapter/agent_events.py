# -*- coding: utf-8 -*-
"""Adapter: ``AgentEventType`` enum for agent event streaming.

LeAgent's ``agent_exec.py`` consumes ``AgentEventType.STREAM_DELTA``,
``ASSISTANT``, ``TOOL_USE``, ``TOOL_RESULT``, ``WORKSPACE_ATTACHMENTS``,
and ``RESULT`` to aggregate agent activity.

Since QwenPaw uses a different event model (agentscope streaming), this
adapter provides the same enum values so the aggregation code compiles
and runs. The actual event objects from QwenPaw's runtime are mapped
at the :class:`AgentRuntime` level.
"""

from __future__ import annotations

from enum import Enum


class AgentEventType(str, Enum):
    """Mirror of LeAgent's ``AgentEventType``."""

    STREAM_DELTA = "stream_delta"
    ASSISTANT = "assistant"
    TOOL_USE = "tool_use"
    TOOL_RESULT = "tool_result"
    WORKSPACE_ATTACHMENTS = "workspace_attachments"
    RESULT = "result"
    ERROR = "error"


class AgentEvent:
    """Simple event wrapper with ``.type`` and ``.data`` attributes."""

    __slots__ = ("type", "data")

    def __init__(self, type: AgentEventType | str, data: dict | None = None) -> None:
        self.type = type
        self.data = data or {}

    def __repr__(self) -> str:
        return f"<AgentEvent type={self.type!r}>"


__all__ = ["AgentEvent", "AgentEventType"]
