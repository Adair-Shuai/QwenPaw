# -*- coding: utf-8 -*-
"""Persistence tests for UGSci team workflow state."""

from __future__ import annotations

from pathlib import Path

import pytest

from plugins.bundle.ugsci.team.state import (
    TeamStateInvalidError,
    TeamWorkflowState,
)


def test_state_round_trip_and_cleanup(tmp_path: Path) -> None:
    workflow = TeamWorkflowState(tmp_path, "reservoir")
    instance = workflow.create_instance()

    workflow.write_state({"current_phase": "plan", "iteration": 0})
    workflow.update_state({"current_phase": "dispatch"})
    (instance / "results" / "result.md").write_text("ok", encoding="utf-8")

    assert workflow.read_state() == {
        "current_phase": "dispatch",
        "iteration": 0,
    }

    workflow.cleanup()

    assert (instance / "state.json").exists()
    assert (instance / "results" / "result.md").read_text(
        encoding="utf-8",
    ) == "ok"
    assert "cleanup complete" in (instance / "progress.txt").read_text(
        encoding="utf-8",
    )


def test_invalid_json_is_not_silently_rewritten(tmp_path: Path) -> None:
    workflow = TeamWorkflowState(tmp_path, "reservoir")
    instance = workflow.create_instance()
    (instance / "state.json").write_text("{invalid", encoding="utf-8")

    with pytest.raises(TeamStateInvalidError):
        workflow.read_state()


def test_non_object_json_is_rejected(tmp_path: Path) -> None:
    workflow = TeamWorkflowState(tmp_path, "reservoir")
    instance = workflow.create_instance()
    (instance / "state.json").write_text("[]", encoding="utf-8")

    with pytest.raises(TeamStateInvalidError):
        workflow.read_state()


def test_finalize_preserves_queryable_terminal_state(tmp_path: Path) -> None:
    workflow = TeamWorkflowState(tmp_path, "reservoir")
    workflow.create_instance()
    workflow.write_state({"current_phase": "dispatch"})

    workflow.finalize("terminated", "conversation_reset")
    workflow.cleanup()

    state = workflow.read_state()
    assert state["workflow_status"] == "terminated"
    assert state["active"] is False
    assert state["termination_reason"] == "conversation_reset"


def test_instances_are_unique(tmp_path: Path) -> None:
    first = TeamWorkflowState(tmp_path, "reservoir").create_instance()
    second = TeamWorkflowState(tmp_path, "reservoir").create_instance()

    assert first != second
    assert first.parent == second.parent
