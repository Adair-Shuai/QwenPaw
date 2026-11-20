# -*- coding: utf-8 -*-
"""Session-scoped immutable turn-file previews, diffs, and downloads."""

from __future__ import annotations

import base64
import binascii
import ipaddress
import mimetypes
from typing import Literal
from urllib.parse import quote, urlparse

from pydantic import BaseModel, Field

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import Response

from ...turn_files import get_store
from ...services import desktop_associations, desktop_delivery
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


def _require_local_desktop(request: Request) -> None:
    """Only the local console may request actions on this computer."""
    try:
        local_client = bool(
            request.client
            and ipaddress.ip_address(request.client.host).is_loopback,
        )
    except ValueError:
        local_client = False
    origin = request.headers.get("origin")
    if not local_client or (
        origin
        and urlparse(origin).hostname not in {"localhost", "127.0.0.1", "::1"}
    ):
        raise HTTPException(
            403,
            "Desktop file actions require the local console",
        )


class DesktopStageRequest(BaseModel):
    fileName: str = Field(min_length=1, max_length=240)
    contentBase64: str = Field(max_length=44_739_244)


class DesktopActionRequest(BaseModel):
    token: str = Field(min_length=1, max_length=64)
    action: Literal["open", "reveal"]
    applicationId: str | None = Field(default=None, max_length=32768)


@router.get("/desktop/applications")
async def desktop_applications(
    request: Request,
    session_id: str,
    file_name: str = Query(min_length=1, max_length=240),
) -> dict:
    _require_local_desktop(request)
    await _scope(request, session_id)
    return await _read(desktop_associations.list_applications, file_name)


@router.post("/desktop/stage")
async def stage_desktop_file(
    body: DesktopStageRequest,
    request: Request,
    session_id: str,
) -> dict:
    _require_local_desktop(request)
    _, scope = await _scope(request, session_id)
    try:
        content = base64.b64decode(body.contentBase64, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise HTTPException(422, "Invalid delivery bytes") from exc
    return await _read(
        desktop_delivery.stage_file,
        tuple(sorted(scope.items())),
        body.fileName,
        content,
    )


@router.post("/desktop/action")
async def desktop_file_action(
    body: DesktopActionRequest,
    request: Request,
    session_id: str,
) -> dict:
    _require_local_desktop(request)
    _, scope = await _scope(request, session_id)
    await _read(
        desktop_delivery.act_on_file,
        tuple(sorted(scope.items())),
        body.token,
        body.action,
        body.applicationId,
    )
    return {"ok": True}
