# -*- coding: utf-8 -*-
"""Adapter: ``ChatMessage`` using agentscope's ``Msg`` / ``TextBlock``.

LeAgent's workflow nodes call ``ChatMessage.user(prompt)`` /
``ChatMessage.system(text)`` to build LLM prompts.  QwenPaw uses
agentscope 2.0's ``Msg`` with typed content blocks (``TextBlock``).

This adapter provides the same factory API so node code stays unchanged.
"""

from __future__ import annotations

from typing import Any


class ChatMessage:
    """Light wrapper around agentscope ``Msg`` with LeAgent-compatible factory API."""

    def __init__(self, role: str, content: str, *, name: str | None = None) -> None:
        self.role = role
        self.content = content
        self.name = name or role

    @classmethod
    def user(cls, content: str) -> "ChatMessage":
        return cls("user", content, name="user")

    @classmethod
    def system(cls, content: str) -> "ChatMessage":
        return cls("system", content, name="system")

    @classmethod
    def assistant(cls, content: str) -> "ChatMessage":
        return cls("assistant", content, name="assistant")

    def to_msg(self) -> Any:
        """Convert to an agentscope ``Msg`` object."""
        from agentscope.message import Msg, TextBlock

        return Msg(
            name=self.name,
            role=self.role,
            content=[TextBlock(type="text", text=self.content)],
        )

    def to_dict(self) -> dict[str, Any]:
        """Plain dict representation (for serialization)."""
        return {"role": self.role, "content": self.content, "name": self.name}

    def __repr__(self) -> str:
        return f"<ChatMessage role={self.role!r}>"


def messages_to_agentscope(messages: list[ChatMessage]) -> list[Any]:
    """Convert a list of ``ChatMessage`` to agentscope ``Msg`` objects."""
    return [m.to_msg() for m in messages]


__all__ = ["ChatMessage", "messages_to_agentscope"]
