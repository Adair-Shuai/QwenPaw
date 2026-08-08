# -*- coding: utf-8 -*-
from types import SimpleNamespace

import pytest
from fastapi import HTTPException
from starlette.requests import Request

from qwenpaw.app import agent_context
from qwenpaw.app.routers.files import _resolve_relative_path


@pytest.mark.asyncio
async def test_relative_preview_prefers_session_project_directory(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path,
) -> None:
    workspace_dir = tmp_path / "workspace"
    session_project_dir = tmp_path / "session-project"
    target = session_project_dir / "Documents" / "测试图片.png"
    workspace_dir.mkdir()
    target.parent.mkdir(parents=True)
    target.write_bytes(b"png")
    workspace = SimpleNamespace(workspace_dir=workspace_dir)

    async def fake_get_agent_for_request(_request: Request):
        return workspace

    async def fake_get_project_dir_for_request(
        _request: Request,
        _workspace,
    ):
        return session_project_dir

    monkeypatch.setattr(
        agent_context,
        "get_agent_for_request",
        fake_get_agent_for_request,
    )
    monkeypatch.setattr(
        agent_context,
        "get_project_dir_for_request",
        fake_get_project_dir_for_request,
    )
    monkeypatch.setattr(
        agent_context,
        "get_agent_project_dir",
        lambda _workspace: workspace_dir,
    )

    request = Request({"type": "http", "headers": []})
    resolved = await _resolve_relative_path(
        "Documents/测试图片.png",
        request,
    )

    assert resolved == target.resolve()


@pytest.mark.asyncio
async def test_relative_preview_preserves_chat_lookup_http_error(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path,
) -> None:
    workspace_dir = tmp_path / "workspace"
    workspace_dir.mkdir()
    workspace = SimpleNamespace(workspace_dir=workspace_dir)

    async def fake_get_agent_for_request(_request: Request):
        return workspace

    async def fake_get_project_dir_for_request(
        _request: Request,
        _workspace,
    ):
        raise HTTPException(status_code=404, detail="Chat not found")

    monkeypatch.setattr(
        agent_context,
        "get_agent_for_request",
        fake_get_agent_for_request,
    )
    monkeypatch.setattr(
        agent_context,
        "get_project_dir_for_request",
        fake_get_project_dir_for_request,
    )

    request = Request({"type": "http", "headers": []})
    with pytest.raises(HTTPException) as exc_info:
        await _resolve_relative_path("report.md", request)

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Chat not found"


@pytest.mark.asyncio
async def test_relative_preview_preserves_agent_lookup_http_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def fake_get_agent_for_request(_request: Request):
        raise HTTPException(status_code=404, detail="Agent not found")

    monkeypatch.setattr(
        agent_context,
        "get_agent_for_request",
        fake_get_agent_for_request,
    )

    request = Request({"type": "http", "headers": []})
    with pytest.raises(HTTPException) as exc_info:
        await _resolve_relative_path("report.md", request)

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Agent not found"
