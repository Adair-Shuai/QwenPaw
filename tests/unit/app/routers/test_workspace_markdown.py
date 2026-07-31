# -*- coding: utf-8 -*-
"""Focused tests for root-workspace Markdown write behavior."""

from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from qwenpaw.app.routers import workspace as workspace_router


def _workspace(tmp_path):
    return SimpleNamespace(workspace_dir=tmp_path, agent_id="agent-a")


def _patch_manager_without_agent_config(monkeypatch):
    manager_class = workspace_router.AgentMdManager
    monkeypatch.setattr(
        workspace_router,
        "AgentMdManager",
        lambda working_dir, agent_id=None: manager_class(working_dir),
    )


@pytest.mark.asyncio
async def test_prompt_file_write_returns_final_name_and_mounts(
    tmp_path,
    monkeypatch,
):
    async def get_workspace(_request):
        return _workspace(tmp_path)

    config = SimpleNamespace(system_prompt_files=[])
    saved = []
    _patch_manager_without_agent_config(monkeypatch)
    monkeypatch.setattr(
        workspace_router,
        "get_agent_for_request",
        get_workspace,
    )
    monkeypatch.setattr(
        workspace_router,
        "load_agent_config",
        lambda _id: config,
    )
    monkeypatch.setattr(
        workspace_router,
        "save_agent_config",
        lambda agent_id, value: saved.append((agent_id, value)),
    )
    monkeypatch.setattr(
        workspace_router,
        "schedule_agent_reload",
        lambda *_: None,
    )

    result = await workspace_router.write_prompt_file(
        workspace_router.PromptFileWriteRequest(
            filename="Report.MD",
            content="\n# Report\n",
            enable=True,
        ),
        object(),
    )

    assert result["filename"] == "Report.md"
    assert result["system_prompt_files"] == ["Report.md"]
    assert (tmp_path / "Report.md").read_text(
        encoding="utf-8",
    ) == "\n# Report\n"
    assert saved and saved[0][0] == "agent-a"


@pytest.mark.asyncio
async def test_prompt_file_write_rolls_back_when_config_save_fails(
    tmp_path,
    monkeypatch,
):
    async def get_workspace(_request):
        return _workspace(tmp_path)

    target = tmp_path / "Report.md"
    target.write_text("old content", encoding="utf-8")
    config = SimpleNamespace(system_prompt_files=[])
    _patch_manager_without_agent_config(monkeypatch)
    monkeypatch.setattr(
        workspace_router,
        "get_agent_for_request",
        get_workspace,
    )
    monkeypatch.setattr(
        workspace_router,
        "load_agent_config",
        lambda _id: config,
    )
    monkeypatch.setattr(
        workspace_router,
        "save_agent_config",
        lambda *_: (_ for _ in ()).throw(RuntimeError("config failed")),
    )

    with pytest.raises(HTTPException) as exc_info:
        await workspace_router.write_prompt_file(
            workspace_router.PromptFileWriteRequest(
                filename="Report.md",
                content="new content",
                enable=True,
            ),
            object(),
        )

    assert exc_info.value.status_code == 500
    assert target.read_text(encoding="utf-8") == "old content"


@pytest.mark.asyncio
async def test_prompt_file_write_rejects_path_separators(
    tmp_path,
    monkeypatch,
):
    async def get_workspace(_request):
        return _workspace(tmp_path)

    _patch_manager_without_agent_config(monkeypatch)
    monkeypatch.setattr(
        workspace_router,
        "get_agent_for_request",
        get_workspace,
    )

    with pytest.raises(HTTPException) as exc_info:
        await workspace_router.write_prompt_file(
            workspace_router.PromptFileWriteRequest(
                filename="notes\\unsafe.md",
                content="content",
                enable=True,
            ),
            object(),
        )

    assert exc_info.value.status_code == 400
    assert not list(tmp_path.glob("*.md"))
