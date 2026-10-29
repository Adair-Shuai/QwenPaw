# -*- coding: utf-8 -*-
"""Controller isolation through the UGSci mode, gate and state tool \
boundary."""

import asyncio
import json
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from qwenpaw.app.agent_context import scoped_session_id
from plugins.bundle.ugsci.team.gate import UGSciTeamGate
from plugins.bundle.ugsci.team.mode import UGSciTeamMode
from plugins.bundle.ugsci.team.state import (
    TeamStateConflictError,
    TeamStateInvalidError,
    TeamWorkflowState,
)
from plugins.bundle.ugsci.team.state_guard import TeamStateWriteGuard


def mode():
    instance = UGSciTeamMode(gate=UGSciTeamGate())
    return instance


def activate(instance, path):
    folder = instance.gate.activate_for_team(
        path,
        "synthetic",
        "Synthetic team",
        "pipeline",
        [],
        "Synthetic test",
        "default",
    )
    return TeamWorkflowState.from_existing(path, "synthetic", folder)


def context(path, sid, rc=None):
    return SimpleNamespace(
        workspace_dir=path,
        session_id=sid,
        agent_id="default",
        request=SimpleNamespace(request_context=rc or {}),
    )


@pytest.mark.asyncio
async def test_owner_restores_but_child_and_unrelated_chats_do_not(tmp_path):
    owner = mode()
    with scoped_session_id("owner"):
        wf = activate(owner, tmp_path)
        wf.update_state({"current_phase": "dispatch"})
        assert wf.read_state()["owner_session_id"] == "owner"
    before = (wf.instance_dir / "state.json").read_bytes()
    for sid, rc in [
        ("child", {"_spawn_subagent": True, "parent_session_id": "owner"}),
        ("unrelated", {}),
        ("delegate", {"parent_session_id": "owner"}),
    ]:
        fresh = mode()
        with scoped_session_id(sid):
            ctx = context(tmp_path, sid, rc)
            await fresh.on_turn_start(ctx)
            assert not fresh.is_active(ctx)
            assert fresh.gate.current_state() is None
            assert fresh.gate.build_continuation() == ""
            with pytest.raises(TeamStateConflictError):
                fresh.tools()[0].func()
    assert (wf.instance_dir / "state.json").read_bytes() == before
    with scoped_session_id("owner"):
        fresh = mode()
        await fresh.on_turn_start(context(tmp_path, "owner"))
        assert fresh.is_active(context(tmp_path, "owner"))
        assert fresh.gate.current_state().loop_dir == wf.instance_dir
        assert fresh.gate.current_state().phase == "dispatch"


@pytest.mark.asyncio
async def test_child_cannot_start_team_even_with_explicit_slash_command(
    tmp_path,
):
    child = mode()
    ctx = context(tmp_path, "child", {"_spawn_subagent": True})
    with scoped_session_id("child"):
        reply = await child.handle_command(ctx, "pipeline 储层评价团队 创建测试规划")
        assert reply is not None
        assert not child.is_active(ctx)
    assert not (tmp_path / ".qwenpaw" / "ugsci_teams").exists()


def test_ownerless_legacy_instance_is_readable_but_never_auto_claimed(
    tmp_path,
):
    wf = TeamWorkflowState(tmp_path)
    folder = wf.create_instance()
    wf.write_state({"current_phase": "dispatch", "active": True})
    before = (folder / "state.json").read_bytes()
    with scoped_session_id("unrelated"):
        assert not UGSciTeamGate().restore(tmp_path)
    assert wf.read_state()["current_phase"] == "dispatch"
    assert (folder / "state.json").read_bytes() == before


def test_latest_terminal_instance_does_not_revive_older_active_run(tmp_path):
    with scoped_session_id("owner"):
        older = activate(mode(), tmp_path)
        latest_mode = mode()
        latest = activate(latest_mode, tmp_path)
        latest_mode.gate.terminate_current("test_finished")
        assert latest.read_state()["workflow_status"] == "terminated"
        assert not UGSciTeamGate().restore(tmp_path, "default", "owner")
        assert older.read_state()["workflow_status"] == "active"


@pytest.mark.asyncio
async def test_new_explicit_team_closes_only_its_previous_instance(tmp_path):
    owner = mode()
    with scoped_session_id("other"):
        other = activate(owner, tmp_path)
    with scoped_session_id("owner"):
        old = activate(owner, tmp_path)
        ctx = context(tmp_path, "owner")
        ctx.user_msg = SimpleNamespace(content="")
        await owner.handle_command(ctx, "pipeline 储层评价团队 创建测试规划")
        assert old.read_state()["workflow_status"] == "terminated"
        assert old.read_state()["termination_reason"] == "replaced_by_new_team"
        assert owner.gate.current_state().loop_dir != old.instance_dir
        assert owner.is_active(ctx)
    assert other.read_state()["workflow_status"] == "active"


def test_registered_tools_validate_and_compare_revision(tmp_path):
    owner = mode()
    with scoped_session_id("owner"):
        wf = activate(owner, tmp_path)
        get, update = [tool.func for tool in owner.tools()][:2]
        initial = json.loads(get())
        state = json.loads(
            update(
                {"current_phase": "dispatch", "plan_steps": 3},
                initial["revision"],
            ),
        )
        assert state["revision"] == initial["revision"] + 1
        before = (wf.instance_dir / "state.json").read_bytes()
        for patch, revision in [
            ({"current_phase": "plan"}, initial["revision"]),
            ({"termination_reason": None}, state["revision"]),
            ({"owner_session_id": "child"}, state["revision"]),
            ({"current_phase": "completed"}, state["revision"]),
        ]:
            with pytest.raises(TeamStateConflictError):
                update(patch, revision)
            assert (wf.instance_dir / "state.json").read_bytes() == before
        with pytest.raises(TeamStateInvalidError):
            update({"current_phase": None}, state["revision"])


def test_host_registry_and_sdk_expose_tools_only_in_team_mode():
    from agentscope.tool import FunctionTool
    from qwenpaw.runtime.tool_registry import ToolRegistry

    registry = ToolRegistry()
    registry.register_many(mode().tools())
    assert registry.filter(active_modes=set()) == []
    tools = registry.filter(active_modes={"ugsci-team"})
    assert {
        "ugsci_team_get_state",
        "ugsci_team_update_state",
        "ugsci_team_publish_result",
        "ugsci_team_accept_review",
        "ugsci_team_publish_report",
    }.issubset({tool.name for tool in tools})
    update = next(
        tool for tool in tools if tool.name == "ugsci_team_update_state"
    )
    schema = FunctionTool(update.func).input_schema
    assert set(schema["required"]) == {"patch", "expected_revision"}
    assert schema["properties"]["patch"]["type"] == "object"
    assert schema["properties"]["expected_revision"]["type"] == "integer"


def test_state_rejects_invalid_writes_without_destroying_last_valid_snapshot(
    tmp_path,
):
    owner = mode()
    with scoped_session_id("owner"):
        wf = activate(owner, tmp_path)
        state = wf.read_state()
        before = (wf.instance_dir / "state.json").read_bytes()
        with pytest.raises(TeamStateInvalidError):
            wf.write_state({**state, "termination_reason": None})
        with pytest.raises(TeamStateConflictError):
            wf.write_state({**state, "owner_session_id": "other"})
        assert (wf.instance_dir / "state.json").read_bytes() == before


@pytest.mark.asyncio
async def test_concurrent_updates_cannot_both_commit_same_revision(tmp_path):
    owner = mode()
    with scoped_session_id("owner"):
        wf = activate(owner, tmp_path)
        revision = wf.read_state()["revision"]
        results = await asyncio.gather(
            *[
                asyncio.to_thread(
                    wf.update_state,
                    {"note": n},
                    expected_revision=revision,
                )
                for n in ["first", "second"]
            ],
            return_exceptions=True,
        )
    assert (
        sum(isinstance(result, TeamStateConflictError) for result in results)
        == 1
    )
    assert wf.read_state()["revision"] == revision + 1


@pytest.mark.asyncio
async def test_controller_can_progress_and_gate_finishes_without_null_repair(
    tmp_path,
):
    owner = mode()
    with scoped_session_id("owner"):
        wf = activate(owner, tmp_path)
        get, update = [tool.func for tool in owner.tools()][:2]
        for phase in ["dispatch", "verify", "synthesize", "completed"]:
            state = json.loads(get())
            update(
                {"current_phase": phase, "forks_integrated": True},
                state["revision"],
            )
        # Gate owns lifecycle fields and terminal cleanup.
        await owner.gate.check({})
        state = wf.read_state()
        assert state["workflow_status"] == "completed"
        assert state["active"] is False
        assert isinstance(state["termination_reason"], str)
        assert state["owner_session_id"] == "owner"
        assert not owner.is_active(context(tmp_path, "owner"))
        with pytest.raises(TeamStateConflictError):
            update({"current_phase": "plan"}, state["revision"])


@pytest.mark.asyncio
async def test_state_write_guard_preserves_reads_and_member_results(
    tmp_path,
):
    guard = TeamStateWriteGuard(tmp_path)
    state = tmp_path / ".qwenpaw" / "ugsci_teams" / "run" / "state.json"
    assert guard.blocked("write_file", {"file_path": str(state)})
    assert guard.blocked("edit_file", {"file_path": str(state)})
    assert guard.blocked(
        "execute_shell_command",
        {"command": f'python -c \'open("{state}","w")\''},
    )
    assert not guard.blocked("read_file", {"file_path": str(state)})
    assert not guard.blocked(
        "write_file",
        {"file_path": str(state.parent / "results" / "step-1.json")},
    )
    assert not guard.blocked(
        "write_file",
        {"file_path": str(tmp_path / "state.json")},
    )
    assert not guard.blocked(
        "execute_shell_command",
        {"command": "python simulation.py"},
    )
    called = AsyncMock()

    async def next_handler():
        await called()
        yield "executed"

    call = SimpleNamespace(
        name="write_file",
        input={"file_path": str(state), "content": "{}"},
    )
    chunks = [
        chunk
        async for chunk in guard.on_acting(
            None,
            {"tool_call": call},
            next_handler,
        )
    ]
    assert chunks and not called.called
    assert not state.exists()
