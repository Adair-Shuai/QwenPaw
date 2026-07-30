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
    assert workflow.read_state() == {}


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
