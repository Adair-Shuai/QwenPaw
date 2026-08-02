# -*- coding: utf-8 -*-
"""Console chat target-agent routing tests."""
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException

from qwenpaw.app.routers.console import (
    _extract_target_agent_id,
    post_console_chat,
)
from qwenpaw.schemas import AgentRequest


def test_extract_target_agent_id_from_dict_and_model():
    assert _extract_target_agent_id({"target_agent_id": " reviewer "}) == (
        "reviewer"
    )
    request = AgentRequest(target_agent_id="writer")
    assert _extract_target_agent_id(request) == "writer"
    assert (
        _extract_target_agent_id(
            {
                "target_agent_id": " reviewer ",
                "target_agent_ids": ["reviewer"],
            },
        )
        == "reviewer"
    )


def test_extract_target_agent_id_rejects_multiple_distinct_agents():
    with pytest.raises(HTTPException, match="Only one target agent"):
        _extract_target_agent_id({"target_agent_ids": ["writer", "reviewer"]})


@pytest.mark.asyncio
async def test_post_console_chat_routes_body_target(monkeypatch):
    import qwenpaw.app.routers.console as console_module

    workspace = MagicMock()
    workspace.channel_manager.get_channel = AsyncMock(return_value=None)
    get_agent = AsyncMock(return_value=workspace)
    monkeypatch.setattr(console_module, "get_agent_for_request", get_agent)
    request = MagicMock()

    with pytest.raises(HTTPException) as exc_info:
        await post_console_chat(
            AgentRequest(target_agent_id="reviewer"),
            request,
        )

    assert exc_info.value.status_code == 503
    get_agent.assert_awaited_once_with(request, agent_id="reviewer")
