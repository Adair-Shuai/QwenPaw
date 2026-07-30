# -*- coding: utf-8 -*-
"""Persistence tests for UGSci team workflow state."""

from __future__ import annotations

from pathlib import Path

from plugins.bundle.ugsci.team.state import TeamWorkflowState


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

    assert not (instance / "state.json").exists()
    assert (instance / "results" / "result.md").read_text(
        encoding="utf-8",
    ) == "ok"
    assert "cleanup complete" in (instance / "progress.txt").read_text(
        encoding="utf-8",
    )


def test_invalid_json_recovers_as_empty_state(tmp_path: Path) -> None:
    workflow = TeamWorkflowState(tmp_path, "reservoir")
    instance = workflow.create_instance()
    (instance / "state.json").write_text("{invalid", encoding="utf-8")

    assert workflow.read_state() == {}


def test_instances_are_unique(tmp_path: Path) -> None:
    first = TeamWorkflowState(tmp_path, "reservoir").create_instance()
    second = TeamWorkflowState(tmp_path, "reservoir").create_instance()

    assert first != second
    assert first.parent == second.parent
