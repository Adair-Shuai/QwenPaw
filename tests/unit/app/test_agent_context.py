# -*- coding: utf-8 -*-
"""Agent request resolution error-boundary regressions."""

from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException

from qwenpaw.app import agent_context


def _request(manager, *, header_agent_id: str = "reviewer"):
    return SimpleNamespace(
        state=SimpleNamespace(),
        headers={"X-Agent-Id": header_agent_id},
        app=SimpleNamespace(
            state=SimpleNamespace(multi_agent_manager=manager),
        ),
    )


def _config():
    return SimpleNamespace(
        agents=SimpleNamespace(
            active_agent="default",
            profiles={
                "default": SimpleNamespace(enabled=True),
                "reviewer": SimpleNamespace(enabled=True),
            },
        ),
    )


@pytest.mark.asyncio
async def test_get_agent_preserves_deliberate_http_error(monkeypatch):
    manager = SimpleNamespace(get_agent=AsyncMock(return_value=None))
    monkeypatch.setattr(agent_context, "load_config", _config)

    with pytest.raises(HTTPException) as exc_info:
        await agent_context.get_agent_for_request(_request(manager))

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Agent 'reviewer' not found"


@pytest.mark.asyncio
async def test_get_agent_normalizes_header_id(monkeypatch):
    workspace = object()
    manager = SimpleNamespace(get_agent=AsyncMock(return_value=workspace))
    monkeypatch.setattr(agent_context, "load_config", _config)

    result = await agent_context.get_agent_for_request(
        _request(manager, header_agent_id=" reviewer "),
    )

    assert result is workspace
    manager.get_agent.assert_awaited_once_with("reviewer")
