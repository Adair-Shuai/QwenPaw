# -*- coding: utf-8 -*-
"""Session-scoped immutable turn-file previews, diffs, and downloads."""

from __future__ import annotations

import mimetypes
from typing import Literal
from urllib.parse import quote

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import Response

from ...turn_files import get_store
from ...utils.io_utils import run_sync_io
from ..agent_context import get_agent_for_request

router = APIRouter(prefix="/workspace/turn-files", tags=["turn-files"])


async def _scope(request: Request, session_id: str):
    workspace = await get_agent_for_request(request)
    agent_id = str(workspace.agent_id)
    header_agent = request.headers.get("X-Agent-Id", "").split(",")[-1].strip()
    if header_agent and header_agent != agent_id:
        raise HTTPException(404, "Chat not found")
    chat_header = request.headers.get("X-Chat-Id")
    chat_query = request.query_params.get("chat_id")
    if chat_header and chat_query and chat_header != chat_query:
        raise HTTPException(404, "Chat not found")
    chat_id = chat_header or chat_query
    if chat_id:
        chat = await workspace.chat_manager.get_chat(chat_id)
        if chat is None or chat.session_id != session_id:
            raise HTTPException(404, "Chat not found")
    else:
        chats = await workspace.chat_manager.list_chats(archived=None)
        matches = [chat for chat in chats if chat.session_id == session_id]
        if len(matches) != 1:
            raise HTTPException(404, "Chat not found")
        chat = matches[0]
    store = await run_sync_io(get_store, workspace.workspace_dir)
    return store, {
        "session_id": session_id,
        "agent_id": agent_id,
        "user_id": chat.user_id,
        "channel": chat.channel,
    }


async def _read(operation, *args, **kwargs):
    try:
        return await run_sync_io(operation, *args, **kwargs)
    except FileNotFoundError as exc:
        raise HTTPException(404, "File version or turn not found") from exc
    except (OSError, ValueError) as exc:
        raise HTTPException(422, "File version unavailable") from exc


@router.get("")
async def list_turn_files(
    request: Request,
    session_id: str = Query(min_length=1),
    limit: int = Query(default=100, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    response_id: str | None = Query(default=None, max_length=500),
    client_message_id: str | None = Query(default=None, max_length=500),
) -> dict:
    store, scope = await _scope(request, session_id)
    turns = await _read(
        store.list_turns,
        limit=limit + 1,
        offset=offset,
        response_id=response_id,
        client_message_id=client_message_id,
        **scope,
    )
    has_more = len(turns) > limit
    result = {"turns": turns[:limit], "has_more": has_more}
    if has_more:
        result["next_offset"] = offset + limit
    return result


@router.get("/{turn_id}")
async def get_turn_files(
    turn_id: str,
    request: Request,
    session_id: str = Query(min_length=1),
) -> dict:
    store, scope = await _scope(request, session_id)
    return await _read(store.get_turn, turn_id, **scope)


@router.get("/{turn_id}/files/{file_id}/diff")
async def get_turn_file_diff(
    turn_id: str,
    file_id: str,
    request: Request,
    session_id: str = Query(min_length=1),
) -> dict:
    store, scope = await _scope(request, session_id)
    return await _read(store.diff, turn_id, file_id, **scope)


@router.get("/{turn_id}/files/{file_id}")
async def get_turn_file(
    turn_id: str,
    file_id: str,
    request: Request,
    session_id: str = Query(min_length=1),
    version: Literal["before", "after"] = "after",
    download: bool = True,
) -> Response:
    store, scope = await _scope(request, session_id)
    content, name = await _read(
        store.get_file,
        turn_id,
        file_id,
        version=version,
        **scope,
    )
    media_type = mimetypes.guess_type(name)[0] or "application/octet-stream"
    disposition = "attachment" if download else "inline"
    return Response(
        content,
        media_type=media_type,
        headers={
            "Content-Disposition": (
                f"{disposition}; filename*=UTF-8''{quote(name, safe='')}"
            ),
            "Cache-Control": "private, no-store",
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": (
                "sandbox; default-src 'none'; style-src 'unsafe-inline'"
            ),
        },
    )


@router.get("/{turn_id}/download")
async def download_turn_files(
    turn_id: str,
    request: Request,
    session_id: str = Query(min_length=1),
) -> Response:
    store, scope = await _scope(request, session_id)
    content = await _read(store.bundle, turn_id, **scope)
    return Response(
        content,
        media_type="application/zip",
        headers={
            "Content-Disposition": (
                f'attachment; filename="turn-{turn_id}.zip"'
            ),
            "Cache-Control": "private, no-store",
            "X-Content-Type-Options": "nosniff",
        },
    )
