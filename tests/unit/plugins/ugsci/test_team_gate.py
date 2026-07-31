# -*- coding: utf-8 -*-
"""State-machine tests for the UGSci expert-team gate."""

# pylint: disable=protected-access

from __future__ import annotations

from pathlib import Path

import pytest

from plugins.bundle.ugsci.team.gate import UGSciTeamGate
from plugins.bundle.ugsci.team.state import TeamWorkflowState
from qwenpaw.loop.gates import StopAction


def _activate(
    gate: UGSciTeamGate,
    workspace: Path,
    agent_id: str = "",
) -> TeamWorkflowState:
    instance = gate.activate_for_team(
        workspace,
        "reservoir",
        "储层评价团队",
        "pipeline",
        [{"name": "油藏工程师", "role": "评价", "emoji": "🛢️"}],
        "评价目标区块",
        agent_id,
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


# ── Restore tests (BUG-005: service restart recovery) ────────────────


def test_restore_revives_active_workflow_from_disk(
    tmp_path: Path,
) -> None:
    """A fresh gate restores the latest active instance after restart."""
    original_gate = UGSciTeamGate()
    original_workflow = _activate(original_gate, tmp_path)
    original_workflow.update_state({"current_phase": "dispatch"})
    original_state = original_gate._state()

    # Simulate restart: discard the old gate and create a new one.
    new_gate = UGSciTeamGate()
    assert new_gate._state() is None

    restored = new_gate.restore(tmp_path, "default")

    assert restored is True
    st = new_gate._state()
    assert st is not None
    assert st.phase == "dispatch"
    assert st.team_name == "储层评价团队"
    assert st.task == "评价目标区块"
    assert st.loop_dir == original_state.loop_dir


def test_restore_is_idempotent_when_state_already_loaded(
    tmp_path: Path,
) -> None:
    """Restore returns True immediately if the gate already has state."""
    gate = UGSciTeamGate()
    _activate(gate, tmp_path)

    # Should not scan disk — already active.
    assert gate.restore(tmp_path) is True
    st = gate._state()
    assert st is not None
    assert st.phase == "plan"


def test_restore_returns_false_when_no_state_directory(
    tmp_path: Path,
) -> None:
    """Restore does nothing when the workspace has no team instances."""
    gate = UGSciTeamGate()
    assert gate.restore(tmp_path) is False
    assert gate._state() is None


def test_restore_returns_false_when_no_active_instances(
    tmp_path: Path,
) -> None:
    """Completed or terminated workflows are never revived."""
    gate = UGSciTeamGate()
    _activate(gate, tmp_path)
    gate.terminate_current("test_terminated")

    new_gate = UGSciTeamGate()
    assert new_gate.restore(tmp_path) is False
    assert new_gate._state() is None

    # Also verify completed status is skipped.
    gate2 = UGSciTeamGate()
    workflow2 = _activate(gate2, tmp_path)
    workflow2.update_state({"current_phase": "completed"})
    workflow2.finalize("completed", "done")

    new_gate2 = UGSciTeamGate()
    assert new_gate2.restore(tmp_path) is False
    assert new_gate2._state() is None


def test_restore_selects_latest_active_instance(
    tmp_path: Path,
) -> None:
    """When multiple instances exist, the newest active one wins."""
    import os

    gate_old = UGSciTeamGate()
    wf_old = _activate(gate_old, tmp_path)
    gate_old.deactivate()

    gate_new = UGSciTeamGate()
    wf_new = _activate(gate_new, tmp_path)
    wf_new.update_state({"current_phase": "verify"})
    gate_new.deactivate()

    # Make the newer instance's state.json file appear more recent.
    old_sf = wf_old.instance_dir / "state.json"
    new_sf = wf_new.instance_dir / "state.json"
    os.utime(old_sf, (100, 100))
    os.utime(new_sf, (200, 200))

    fresh_gate = UGSciTeamGate()
    assert fresh_gate.restore(tmp_path) is True
    st = fresh_gate._state()
    assert st is not None
    assert st.phase == "verify"
    assert st.loop_dir == wf_new.instance_dir


def test_restore_skips_corrupted_state_file(
    tmp_path: Path,
) -> None:
    """Corrupted state.json is skipped, not restored."""
    gate = UGSciTeamGate()
    workflow = _activate(gate, tmp_path)
    gate.deactivate()

    assert workflow.instance_dir is not None
    (workflow.instance_dir / "state.json").write_text(
        "{broken",
        encoding="utf-8",
    )

    new_gate = UGSciTeamGate()
    assert new_gate.restore(tmp_path) is False
    assert new_gate._state() is None


def test_restore_skips_wrong_agent_id(
    tmp_path: Path,
) -> None:
    """Restore does not pick up instances belonging to a different agent."""
    gate = UGSciTeamGate()
    _activate(gate, tmp_path, agent_id="agent-a")
    gate.deactivate()

    fresh = UGSciTeamGate()
    assert fresh.restore(tmp_path, "agent-b") is False
    assert fresh._state() is None

    # Same agent_id restores fine.
    fresh2 = UGSciTeamGate()
    assert fresh2.restore(tmp_path, "agent-a") is True
    assert fresh2._state() is not None


@pytest.mark.asyncio
async def test_restored_gate_continues_correct_phase(
    tmp_path: Path,
) -> None:
    """After restore, check() continues from the persisted phase."""
    original_gate = UGSciTeamGate()
    workflow = _activate(original_gate, tmp_path)
    workflow.update_state({"current_phase": "dispatch"})
    original_gate.deactivate()

    # Simulate restart.
    new_gate = UGSciTeamGate()
    assert new_gate.restore(tmp_path) is True
    restored_state = new_gate._state()
    assert restored_state is not None
    assert restored_state.phase == "dispatch"

    # The restored gate should continue the dispatch phase.
    result = await new_gate.check({})
    assert result is not None
    assert result.action == StopAction.INTERRUPT_AND_CONTINUE
    # The iteration counter increments, proving the gate is active.
    state = workflow.read_state()
    assert state["iteration"] == 1


def test_restore_makes_gate_is_active_consistent(
    tmp_path: Path,
) -> None:
    """After restore, gate._state() is non-None (is_active becomes True)."""
    gate = UGSciTeamGate()
    _activate(gate, tmp_path)
    gate.deactivate()

    assert gate._state() is None

    fresh = UGSciTeamGate()
    assert fresh._state() is None
    assert fresh.restore(tmp_path) is True
    assert fresh._state() is not None
