# -*- coding: utf-8 -*-
"""Resolve ownership through the host's workspace and persisted chat index."""

from .service import Scope


async def resolve_scope(workspace, session_id: str, *, user_id=None) -> Scope:
    if not isinstance(session_id, str) or not session_id:
        raise KeyError("Console chat not found")
    chats = await workspace.chat_manager.list_chats(channel="console")
    chat = next(
        (
            item
            for item in chats
            if item.session_id == session_id
            and (user_id is None or item.user_id == user_id)
            and getattr(item, "source", "chat") == "chat"
            and not getattr(item, "parent_session_id", None)
        ),
        None,
    )
    if chat is None:
        raise KeyError("Console chat not found")
    return Scope(workspace.agent_id, session_id, chat.id)
