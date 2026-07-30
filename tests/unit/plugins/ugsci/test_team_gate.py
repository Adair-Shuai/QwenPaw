# -*- coding: utf-8 -*-
"""State-machine tests for the UGSci expert-team gate."""

# pylint: disable=protected-access

from __future__ import annotations

from pathlib import Path

import pytest

from plugins.bundle.ugsci.team.gate import UGSciTeamGate
from plugins.bundle.ugsci.team.state import TeamWorkflowState
from qwenpaw.loop.gates import StopAction


def _activate(gate: UGSciTeamGate, workspace: Path) -> TeamWorkflowState:
    instance = gate.activate_for_team(
        workspace,
        "reservoir",
        "储层评价团队",
        "pipeline",
        [{"name": "油藏工程师", "role": "评价", "emoji": "🛢️"}],
        "评价目标区块",
    )
    return TeamWorkflowState.from_existing(
        workspace,
        "reservoir",
        instance,
    )


@pytest.mark.asyncio
async def test_iteration_limit_terminates_and_deactivates(
    tmp_path: Path,
) -> None:
    gate = UGSciTeamGate()
    workflow = _activate(gate, tmp_path)
    runtime_state = gate._state()
    runtime_state.max_iterations = 0

    result = await gate.check({})

    assert result is not None
    assert result.action == StopAction.TERMINATE
    assert "Iteration limit" in result.reason
    assert gate._state() is None
    assert workflow.read_state()["workflow_status"] == "terminated"


@pytest.mark.asyncio
async def test_completed_phase_terminates(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    gate = UGSciTeamGate()
    workflow = _activate(gate, tmp_path)
    workflow.update_state({"current_phase": "completed"})
    monkeypatch.setattr(
        "plugins.bundle.ugsci.team.gate.forks_integrated",
        lambda *_args: True,
    )

    result = await gate.check({})

    assert result is not None
    assert result.action == StopAction.TERMINATE
    assert result.reason == "UGSci team workflow completed"
    assert gate._state() is None
    assert workflow.read_state()["workflow_status"] == "completed"


@pytest.mark.asyncio
async def test_dispatch_retry_limit_is_enforced(tmp_path: Path) -> None:
    gate = UGSciTeamGate()
    workflow = _activate(gate, tmp_path)

    for expected_retry in (1, 2):
        workflow.update_state({"current_phase": "dispatch"})
        result = await gate.check({})
        assert result is not None
        assert result.action == StopAction.INTERRUPT_AND_CONTINUE
        assert workflow.read_state()["dispatch_retries"] == expected_retry
        workflow.update_state({"current_phase": "plan"})
        await gate.check({})

    workflow.update_state({"current_phase": "dispatch"})
    result = await gate.check({})

    assert result is not None
    assert result.action == StopAction.TERMINATE
    assert "Dispatch retry limit" in result.reason


@pytest.mark.asyncio
async def test_verify_waits_for_fork_integration(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    gate = UGSciTeamGate()
    workflow = _activate(gate, tmp_path)
    workflow.update_state({"current_phase": "verify"})
    monkeypatch.setattr(
        "plugins.bundle.ugsci.team.gate.forks_integrated",
        lambda *_args: False,
    )

    result = await gate.check({})

    assert result is not None
    assert result.action == StopAction.INTERRUPT_AND_CONTINUE
    assert "forks not integrated" in result.reason
    assert workflow.read_state()["merge_blocked"] is True


@pytest.mark.asyncio
async def test_merge_wait_limit_terminates_without_burning_iterations(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    gate = UGSciTeamGate()
    workflow = _activate(gate, tmp_path)
    workflow.update_state({"current_phase": "verify"})
    runtime_state = gate._state()
    runtime_state.max_merge_waits = 1
    monkeypatch.setattr(
        "plugins.bundle.ugsci.team.gate.forks_integrated",
        lambda *_args: False,
    )

    first = await gate.check({})
    second = await gate.check({})

    assert first is not None
    assert first.action == StopAction.INTERRUPT_AND_CONTINUE
    assert second is not None
    assert second.action == StopAction.TERMINATE
    assert runtime_state.iteration == 0
    assert workflow.read_state()["termination_reason"] == "merge_wait_limit"


@pytest.mark.asyncio
async def test_invalid_state_terminates_with_complete_snapshot(
    tmp_path: Path,
) -> None:
    gate = UGSciTeamGate()
    workflow = _activate(gate, tmp_path)
    assert workflow.instance_dir is not None
    (workflow.instance_dir / "state.json").write_text(
        "{invalid",
        encoding="utf-8",
    )

    result = await gate.check({})

    assert result is not None
    assert result.action == StopAction.TERMINATE
    state = workflow.read_state()
    assert state["workflow_status"] == "terminated"
    assert state["termination_reason"] == "state_invalid"
    assert state["team_name"] == "储层评价团队"


def test_explicit_termination_persists_terminal_snapshot(
    tmp_path: Path,
) -> None:
    gate = UGSciTeamGate()
    workflow = _activate(gate, tmp_path)

    gate.terminate_current("conversation_reset")

    assert gate._state() is None
    state = workflow.read_state()
    assert state["workflow_status"] == "terminated"
    assert state["active"] is False
    assert state["termination_reason"] == "conversation_reset"
    assert isinstance(state["finished_at_ns"], int)
