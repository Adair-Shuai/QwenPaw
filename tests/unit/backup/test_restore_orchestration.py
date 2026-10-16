# -*- coding: utf-8 -*-
"""Tests for backup restore HTTP orchestration."""
from __future__ import annotations

import asyncio

import pytest

from qwenpaw.backup import orchestration
from qwenpaw.backup.models import (
    BackupDetail,
    BackupValidationError,
    RestoreBackupRequest,
)


def _detail() -> BackupDetail:
    return BackupDetail(
        id="backup-test",
        name="Backup",
        workspace_stats={"default": {"files": 1, "size": 1}},
    )


def test_restore_preflight_runs_before_stopping_agents(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    events: list[str] = []
    browser_dirs: list[str] = []

    async def fake_get_backup(_backup_id: str) -> BackupDetail:
        return _detail()

    def fake_preflight(_backup_id: str, _req: RestoreBackupRequest):
        events.append("preflight")

    async def fake_stop_agent(_agent_id: str) -> bool:
        events.append("stop")
        return True

    async def fake_stop_browsers(workspace_dirs: list[str]) -> None:
        browser_dirs.extend(workspace_dirs)
        events.append("stop_browsers")

    async def fake_restore(
        _backup_id: str,
        _req: RestoreBackupRequest,
    ) -> BackupDetail:
        events.append("restore")
        return _detail()

    monkeypatch.setattr(orchestration, "get_backup", fake_get_backup)
    monkeypatch.setattr(orchestration, "preflight_restore", fake_preflight)
    monkeypatch.setattr(orchestration, "restore", fake_restore)
    monkeypatch.setattr(
        orchestration,
        "_workspace_dirs_for_agents",
        lambda _agent_ids: ["workspace/default"],
    )

    asyncio.run(
        orchestration.execute_restore(
            "backup-test",
            RestoreBackupRequest(agent_ids=["default"]),
            stop_agent_fn=fake_stop_agent,
            stop_browsers_fn=fake_stop_browsers,
        ),
    )

    assert events == ["preflight", "stop", "stop_browsers", "restore"]
    assert browser_dirs == ["workspace/default"]


def test_restore_preflight_failure_does_not_stop_agents(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    stopped: list[str] = []

    async def fake_get_backup(_backup_id: str) -> BackupDetail:
        return _detail()

    def fake_preflight(
        _backup_id: str,
        _req: RestoreBackupRequest,
    ) -> None:
        raise BackupValidationError(
            "backup_legacy_unsigned",
            "Backup requires explicit trust.",
        )

    async def fake_stop_agent(agent_id: str) -> bool:
        stopped.append(agent_id)
        return True

    async def fake_stop_browsers(_workspace_dirs: list[str]) -> None:
        raise AssertionError(
            "browsers should not stop after preflight failure",
        )

    async def fake_restore(
        _backup_id: str,
        _req: RestoreBackupRequest,
    ) -> BackupDetail:
        raise AssertionError("restore should not run after preflight failure")

    monkeypatch.setattr(orchestration, "get_backup", fake_get_backup)
    monkeypatch.setattr(orchestration, "preflight_restore", fake_preflight)
    monkeypatch.setattr(orchestration, "restore", fake_restore)

    with pytest.raises(BackupValidationError):
        asyncio.run(
            orchestration.execute_restore(
                "backup-test",
                RestoreBackupRequest(agent_ids=["default"]),
                stop_agent_fn=fake_stop_agent,
                stop_browsers_fn=fake_stop_browsers,
            ),
        )

    assert not stopped


def test_restore_without_agents_does_not_stop_browsers(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    events: list[str] = []

    async def fake_get_backup(_backup_id: str) -> BackupDetail:
        return _detail()

    def fake_preflight(_backup_id: str, _req: RestoreBackupRequest):
        events.append("preflight")

    async def fake_stop_browsers(_workspace_dirs: list[str]) -> None:
        events.append("stop_browsers")

    async def fake_restore(
        _backup_id: str,
        _req: RestoreBackupRequest,
    ) -> BackupDetail:
        events.append("restore")
        return _detail()

    monkeypatch.setattr(orchestration, "get_backup", fake_get_backup)
    monkeypatch.setattr(orchestration, "preflight_restore", fake_preflight)
    monkeypatch.setattr(orchestration, "restore", fake_restore)

    asyncio.run(
        orchestration.execute_restore(
            "backup-test",
            RestoreBackupRequest(include_agents=False, agent_ids=[]),
            stop_browsers_fn=fake_stop_browsers,
        ),
    )

    assert events == ["preflight", "restore"]


@pytest.mark.parametrize("failure", ["stop", "browser", "restore"])
def test_preparation_failure_restarts_only_successfully_stopped_agents(
    monkeypatch,
    failure,
):
    from unittest.mock import AsyncMock, MagicMock

    detail = BackupDetail(
        id="review",
        name="Review",
        workspace_stats={
            key: {"files": 1, "size": 1} for key in ("a", "b", "idle")
        },
    )
    stopped = []

    async def stop(agent_id):
        if agent_id == "b" and failure == "stop":
            raise RuntimeError("stop failed")
        if agent_id == "idle":
            return False
        stopped.append(agent_id)
        return True

    scheduled = MagicMock()
    monkeypatch.setattr(
        orchestration,
        "get_backup",
        AsyncMock(return_value=detail),
    )
    monkeypatch.setattr(orchestration, "preflight_restore", lambda *_: None)
    monkeypatch.setattr(
        orchestration,
        "_workspace_dirs_for_agents",
        lambda _: [],
    )
    monkeypatch.setattr(orchestration, "_preload_agents_background", scheduled)
    restore_call = AsyncMock(side_effect=RuntimeError("restore failed"))
    monkeypatch.setattr(orchestration, "restore", restore_call)
    browser = AsyncMock(
        side_effect=RuntimeError("browser failed")
        if failure == "browser"
        else None,
    )
    preload = AsyncMock()
    with pytest.raises(RuntimeError):
        asyncio.run(
            orchestration.execute_restore(
                "review",
                RestoreBackupRequest(agent_ids=["a", "b", "idle"]),
                stop_agent_fn=stop,
                stop_browsers_fn=browser,
                preload_agent_fn=preload,
            ),
        )
    assert stopped == (["a"] if failure == "stop" else ["a", "b"])
    scheduled.assert_called_once_with(preload, stopped)
    if failure != "restore":
        restore_call.assert_not_called()
