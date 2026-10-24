"""UGSci publication regressions and complete host/SDK workflow verification.

All data is synthetic. No user chats, credentials or external model are used.
"""

import asyncio
import json
from pathlib import Path
from types import SimpleNamespace

import pytest
from agentscope.message import Msg
from agentscope.tool import FunctionTool
from fastapi import FastAPI
from fastapi.testclient import TestClient

from plugins.bundle.ugsci.team.api import build_team_router
from plugins.bundle.ugsci.team.artifacts import TeamArtifacts, validate_phase
from plugins.bundle.ugsci.team.gate import UGSciTeamGate
from plugins.bundle.ugsci.team.mode import UGSciTeamMode
from plugins.bundle.ugsci.team.state import TeamStateConflictError, TeamWorkflowState
from plugins.bundle.ugsci.team.state_guard import TeamStateWriteGuard
from qwenpaw.app.agent_context import scoped_session_id
from qwenpaw.app.workspace.workspace_plugins import WorkspacePlugins
from qwenpaw.runtime.phases import Phase
from qwenpaw.loop.gates import StopAction
from qwenpaw.runtime.slash_command_registry import SlashCommandRegistry
from qwenpaw.runtime.tool_registry import ToolRegistry


class Workflow:
    def __init__(self, path):
        self.mode = UGSciTeamMode()
        self.mode._gate = UGSciTeamGate()
        folder = self.mode._gate.activate_for_team(
            path,
            "synthetic",
            "Synthetic team",
            "pipeline",
            [],
            "Synthetic validation",
            "default",
            artifact_protocol=1,
        )
        self.wf = TeamWorkflowState.from_existing(path, "synthetic", folder)
        self.tools = {
            d.name.removeprefix("ugsci_team_"): d.func for d in self.mode.tools()
        }
        self.write("handoffs/plan.json", {"steps": [{"step": 1}, {"step": 2}]})

    def write(self, relative, content):
        path = self.wf.instance_dir / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(content), encoding="utf-8")

    def call(self, name, **kwargs):
        if name != "get_state":
            kwargs.setdefault("expected_revision", self.wf.read_state()["revision"])
        return json.loads(self.tools[name](**kwargs))

    def phase(self, name):
        return self.call(
            "update_state", patch={"current_phase": name, "forks_integrated": True}
        )

    def publish(self, step, payload=None):
        attempt = self.call("prepare_result", step=step, task_id=f"synthetic-{step}")
        self.write(attempt["candidate_path"], payload or {"value": step})
        self.call("publish_result", step=step, attempt_id=attempt["attempt_id"])
        return attempt

    def review(self, verdict="PASS"):
        pending = self.call("prepare_review")
        self.write(
            pending["candidate_path"],
            {
                "review_id": pending["review_id"],
                "snapshot": pending["snapshot"],
                "verdict": verdict,
                "issues": [],
            },
        )
        self.call("accept_review", review_id=pending["review_id"])
        return pending

    def verified(self):
        self.phase("dispatch")
        self.publish(1)
        self.publish(2)
        self.phase("verify")
        return self.review()


@pytest.fixture
def flow(tmp_path):
    with scoped_session_id("owner"):
        yield Workflow(tmp_path)


def test_late_old_attempt_cannot_overwrite_new_published_result(flow):
    flow.phase("dispatch")
    old = flow.call("prepare_result", step=1, task_id="old-task")
    latest = flow.publish(1, {"version": "new"})
    before = flow.wf.read_state()
    published = (flow.wf.instance_dir / "results/step-1.json").read_bytes()
    flow.write(old["candidate_path"], {"version": "old"})
    with pytest.raises(TeamStateConflictError, match="superseded"):
        flow.call("publish_result", step=1, attempt_id=old["attempt_id"])
    assert flow.wf.read_state() == before
    assert (flow.wf.instance_dir / "results/step-1.json").read_bytes() == published
    assert latest["attempt_id"] != old["attempt_id"]


@pytest.mark.parametrize("raw", ["", "[]", "{}", "{invalid", '"text"'])
def test_invalid_candidates_never_replace_result_or_advance_state(flow, raw):
    flow.phase("dispatch")
    attempt = flow.call("prepare_result", step=1, task_id="task")
    Path(attempt["absolute_candidate_path"]).write_text(raw, encoding="utf-8")
    before = flow.wf.read_state()
    with pytest.raises(TeamStateConflictError):
        flow.call("publish_result", step=1, attempt_id=attempt["attempt_id"])
    assert flow.wf.read_state() == before
    assert not (flow.wf.instance_dir / "results/step-1.json").exists()


@pytest.mark.parametrize(
    "patch",
    [
        {"artifact_protocol": 0},
        {"artifact_results": {}},
        {"artifact_review": {"verdict": "PASS"}},
        {"artifact_plan": {}},
    ],
)
def test_generic_state_tool_cannot_forge_publication_metadata(flow, patch):
    before = flow.wf.read_state()
    with pytest.raises(TeamStateConflictError):
        flow.call("update_state", patch=patch)
    assert flow.wf.read_state() == before


def test_verify_requires_every_planned_step_and_frozen_plan(flow):
    flow.phase("dispatch")
    flow.publish(1)
    with pytest.raises(TeamStateConflictError, match="step-2"):
        flow.phase("verify")
    flow.publish(2)
    flow.write("handoffs/plan.json", {"steps": [{"step": 1}]})
    with pytest.raises(TeamStateConflictError, match="plan"):
        flow.phase("verify")


def test_failed_review_blocks_synthesis_and_report_publication(flow):
    flow.phase("dispatch")
    flow.publish(1)
    flow.publish(2)
    flow.phase("verify")
    flow.review("FAIL")
    with pytest.raises(TeamStateConflictError, match="PASS"):
        flow.phase("synthesize")
    with pytest.raises(TeamStateConflictError):
        flow.call("publish_report", content="Must not be published")
    assert not (flow.wf.instance_dir / "handoffs/final-report.md").exists()


def test_review_must_identify_the_exact_snapshot_and_current_review_attempt(flow):
    flow.verified()
    older = flow.call("prepare_review")
    current = flow.call("prepare_review")
    for pending in [older, current]:
        flow.write(
            pending["candidate_path"],
            {"review_id": pending["review_id"], "snapshot": {}, "verdict": "PASS"},
        )
        with pytest.raises(TeamStateConflictError):
            flow.call("accept_review", review_id=pending["review_id"])
    assert not flow.wf.read_state().get("artifact_review")


def test_rework_invalidates_pass_even_when_the_new_payload_is_identical(flow):
    accepted = flow.verified()
    old_snapshot = accepted["snapshot"]
    flow.phase("dispatch")
    flow.publish(1)  # Identical bytes; different attempt and immutable path.
    flow.phase("verify")
    with pytest.raises(TeamStateConflictError, match="PASS"):
        flow.phase("synthesize")
    current = flow.call("prepare_review")
    flow.write(
        current["candidate_path"],
        {
            "review_id": current["review_id"],
            "snapshot": old_snapshot,
            "verdict": "PASS",
        },
    )
    with pytest.raises(TeamStateConflictError, match="versions"):
        flow.call("accept_review", review_id=current["review_id"])


@pytest.mark.parametrize(
    "which", ["result_alias", "result_snapshot", "review_alias", "review_snapshot"]
)
def test_post_review_tampering_cannot_reach_synthesis(flow, which):
    flow.verified()
    data = flow.wf.read_state()
    paths = {
        "result_alias": "results/step-1.json",
        "result_snapshot": data["artifact_results"]["step-1"]["published"]["path"],
        "review_alias": "reviews/verify-report.json",
        "review_snapshot": data["artifact_review"]["path"],
    }
    flow.write(paths[which], {"tampered": True})
    with pytest.raises(TeamStateConflictError, match="changed"):
        flow.phase("synthesize")


@pytest.mark.asyncio
async def test_gate_rechecks_final_report_and_does_not_complete_tampered_workflow(flow):
    flow.verified()
    flow.phase("synthesize")
    with pytest.raises(TeamStateConflictError, match="final report"):
        flow.phase("completed")
    flow.call("publish_report", content="# Synthetic report\nReviewed data.")
    flow.phase("completed")
    (flow.wf.instance_dir / "handoffs/final-report.md").write_text(
        "overwritten", encoding="utf-8"
    )
    outcome = await flow.mode._gate.check({})
    assert outcome.action == StopAction.TERMINATE
    assert flow.wf.read_state()["workflow_status"] == "terminated"
    assert flow.wf.read_state()["termination_reason"] == "artifact_invalid"


@pytest.mark.asyncio
async def test_same_revision_concurrent_publication_commits_once(flow):
    flow.phase("dispatch")
    attempt = flow.call("prepare_result", step=1, task_id="task")
    flow.write(attempt["candidate_path"], {"value": 1})
    revision = flow.wf.read_state()["revision"]
    artifacts = TeamArtifacts(flow.wf)
    outcomes = await asyncio.gather(
        *[
            asyncio.to_thread(
                artifacts.publish_result, 1, attempt["attempt_id"], revision
            )
            for _ in range(2)
        ],
        return_exceptions=True,
    )
    assert sum(isinstance(x, dict) for x in outcomes) == 1
    assert sum(isinstance(x, TeamStateConflictError) for x in outcomes) == 1
    assert flow.wf.read_state()["revision"] == revision + 1


def test_candidate_paths_cannot_be_replaced_by_external_symlinks(flow, tmp_path):
    flow.phase("dispatch")
    attempt = flow.call("prepare_result", step=1, task_id="task")
    external = tmp_path / "private.json"
    external.write_text('{"private": true}', encoding="utf-8")
    try:
        Path(attempt["absolute_candidate_path"]).symlink_to(external)
    except OSError:
        pytest.skip("OS does not permit creating test symlinks")
    with pytest.raises(TeamStateConflictError):
        flow.call("publish_result", step=1, attempt_id=attempt["attempt_id"])
    assert not (flow.wf.instance_dir / "results/step-1.json").exists()


def test_write_guard_blocks_published_files_but_allows_distinct_candidates(flow):
    flow.phase("dispatch")
    attempt = flow.call("prepare_result", step=1, task_id="task")
    guard = TeamStateWriteGuard(flow.wf.workspace_dir)
    for relative in [
        "results/step-1.json",
        "artifacts/step-1/snapshot.json",
        "reviews/verify-report.json",
        "handoffs/final-report.md",
        "handoffs/plan.json",
    ]:
        assert guard.blocked(
            "write_file", {"file_path": str(flow.wf.instance_dir / relative)}
        )
    assert not guard.blocked(
        "write_file", {"file_path": attempt["absolute_candidate_path"]}
    )
    assert not guard.blocked(
        "read_file", {"file_path": str(flow.wf.instance_dir / "results/step-1.json")}
    )


def test_finalization_itself_rejects_unreviewed_completion(flow):
    flow.phase("dispatch")
    with pytest.raises(TeamStateConflictError):
        flow.wf.finalize("completed", "forged")
    assert flow.wf.read_state()["workflow_status"] == "active"


def test_phase_advance_requires_explicit_and_real_fork_integration(flow, monkeypatch):
    flow.phase("dispatch")
    flow.publish(1)
    flow.publish(2)
    flow.wf.update_state({"forks_integrated": False})
    with pytest.raises(TeamStateConflictError, match="forks_integrated"):
        flow.call("update_state", patch={"current_phase": "verify"})
    assert flow.wf.read_state()["current_phase"] == "dispatch"
    monkeypatch.setattr(
        "plugins.bundle.ugsci.team.state_tools.forks_integrated", lambda *_: False
    )
    with pytest.raises(TeamStateConflictError, match="actual fork"):
        flow.phase("verify")


@pytest.mark.asyncio
async def test_pending_completion_restores_and_can_finish_without_redispatch(flow):
    flow.verified()
    flow.phase("synthesize")
    flow.call("publish_report", content="# Synthetic report")
    flow.phase("completed")
    # A snapshot left by the previous implementation, which allowed phase
    # completion before the integration acknowledgement was checked.
    flow.wf.update_state({"forks_integrated": False, "merge_blocked": True})
    before = flow.wf.read_state()
    recovered = UGSciTeamMode()
    recovered._gate = UGSciTeamGate()
    assert recovered._gate.restore(flow.wf.workspace_dir, "default", "owner")
    assert "ugsci_team_update_state" in recovered._gate.build_continuation()
    flow.tools = {d.name.removeprefix("ugsci_team_"): d.func for d in recovered.tools()}
    with pytest.raises(TeamStateConflictError):
        flow.call("update_state", patch={"current_phase": "dispatch"})
    flow.call("update_state", patch={"forks_integrated": True})
    outcome = await recovered._gate.check({})
    after = flow.wf.read_state()
    assert outcome.action == StopAction.TERMINATE
    assert after["workflow_status"] == "completed" and after["active"] is False
    assert after["artifact_results"] == before["artifact_results"]
    assert after["artifact_review"] == before["artifact_review"]
    assert after["artifact_report"] == before["artifact_report"]
    with pytest.raises(TeamStateConflictError):
        flow.call("update_state", patch={"forks_integrated": True})


def test_interrupted_publish_can_retry_without_replacing_immutable_snapshot(
    flow, monkeypatch
):
    import plugins.bundle.ugsci.team.artifacts as artifacts

    flow.phase("dispatch")
    attempt = flow.call("prepare_result", step=1, task_id="task")
    flow.write(attempt["candidate_path"], {"value": 1})
    original = artifacts._alias
    with monkeypatch.context() as patch:
        patch.setattr(
            artifacts,
            "_alias",
            lambda *args: (_ for _ in ()).throw(OSError("synthetic crash")),
        )
        with pytest.raises(OSError):
            flow.call("publish_result", step=1, attempt_id=attempt["attempt_id"])
    assert not flow.wf.read_state()["artifact_results"]["step-1"].get("published")
    flow.call("publish_result", step=1, attempt_id=attempt["attempt_id"])
    assert flow.wf.read_state()["artifact_results"]["step-1"]["published"]


def test_stale_publication_revision_has_no_file_side_effects(flow):
    flow.phase("dispatch")
    old_revision = flow.wf.read_state()["revision"]
    attempt = flow.call("prepare_result", step=1, task_id="task")
    flow.write(attempt["candidate_path"], {"value": 1})
    before = flow.wf.read_state()
    with pytest.raises(TeamStateConflictError):
        flow.call(
            "publish_result",
            step=1,
            attempt_id=attempt["attempt_id"],
            expected_revision=old_revision,
        )
    assert flow.wf.read_state() == before
    assert not (flow.wf.instance_dir / "artifacts").exists()


def test_reworked_upstream_requires_downstream_to_be_recomputed(flow):
    flow.write(
        "handoffs/plan.json", {"steps": [{"step": 1}, {"step": 2, "depends_on": [1]}]}
    )
    flow.verified()
    flow.phase("dispatch")
    flow.publish(1, {"new_input": True})
    with pytest.raises(TeamStateConflictError, match="superseded input"):
        flow.phase("verify")
    flow.publish(2)
    flow.phase("verify")
    flow.review()
    flow.phase("synthesize")


def test_candidate_cannot_publish_against_replaced_dependency(flow):
    flow.write(
        "handoffs/plan.json", {"steps": [{"step": 1}, {"step": 2, "depends_on": [1]}]}
    )
    flow.phase("dispatch")
    with pytest.raises(TeamStateConflictError):
        flow.call("prepare_result", step=2, task_id="premature")
    flow.publish(1)
    dependent = flow.call("prepare_result", step=2, task_id="dependent")
    flow.write(dependent["candidate_path"], {"old_dependency": True})
    flow.publish(1, {"changed": True})
    with pytest.raises(TeamStateConflictError, match="input versions changed"):
        flow.call("publish_result", step=2, attempt_id=dependent["attempt_id"])


@pytest.mark.parametrize(
    "steps",
    [
        [{"step": 1, "depends_on": [2]}, {"step": 2, "depends_on": [1]}],
        [{"step": 1, "depends_on": [99]}],
        [{"step": 1}, {"step": 1}],
    ],
)
def test_plan_rejects_cycles_missing_dependencies_and_duplicate_steps(flow, steps):
    flow.write("handoffs/plan.json", {"steps": steps})
    with pytest.raises(TeamStateConflictError):
        flow.phase("dispatch")
    assert flow.wf.read_state()["current_phase"] == "plan"


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "style",
    ["pipeline", "roundtable", "coordinator", "router", "review_loop", "debate"],
)
async def test_system_host_sdk_workflow_rework_restart_and_history(
    tmp_path, style, monkeypatch
):
    """Real host mode setup, slash dispatch, SDK tools, gate, middleware, HTTP API."""

    class Workspace:
        pass

    from agentscope.permission import PermissionBehavior
    from qwenpaw.governance import tool_adapter, tool_registry
    from qwenpaw.governance.policy import (
        GovernancePolicy,
        GovernanceAction,
        ToolCallSpec,
    )
    from qwenpaw.governance.resource_governor import ResourceGovernor

    governance_registry = tool_registry.ToolRegistry()
    monkeypatch.setattr(tool_registry, "DEFAULT_REGISTRY", governance_registry)
    monkeypatch.setattr(tool_adapter, "DEFAULT_REGISTRY", governance_registry)
    governor = ResourceGovernor(
        str(tmp_path), governance_dir=str(tmp_path / "governance")
    )
    governor._policy = GovernancePolicy(
        _registry=governance_registry, audit_level="none"
    )
    assert (
        governor.assert_policy(
            ToolCallSpec(
                tool_name="UgsciTeamGetState",
                target="",
                agent_id="default",
                session_id="system-owner",
            )
        ).action
        == GovernanceAction.DENY
    )

    ws = Workspace()
    ws.plugins = WorkspacePlugins()
    mode = UGSciTeamMode()
    ws.plugins.register_mode(mode, ws)
    ctx = SimpleNamespace(
        workspace_dir=tmp_path,
        agent_id="default",
        session_id="system-owner",
        request=SimpleNamespace(request_context={}),
        input_msgs=[
            Msg(
                name="user",
                content=[{"type": "text", "text": "Synthetic task"}],
                role="user",
            )
        ],
    )
    with scoped_session_id("system-owner"):
        await ws.plugins.slash_command_registry.dispatch(
            f"/ugsci-team {style} 储层评价团队 执行合成数据验证", ctx
        )
        assert mode.is_active(ctx)
        folder = mode._gate._state().loop_dir
        wf = TeamWorkflowState.from_existing(tmp_path, "synthetic", folder)
        assert wf.read_state()["artifact_protocol"] == 1
        (folder / "handoffs/plan.json").write_text(
            json.dumps({"steps": [{"step": 1}]}), encoding="utf-8"
        )
        tools = {
            d.name.removeprefix("ugsci_team_"): tool_adapter.PolicyGuardedTool(
                d.func,
                governor=governor,
                request_context={
                    "session_id": "system-owner",
                    "approval_level": "auto",
                },
            )
            for d in ws.plugins.tool_registry.filter(active_modes={"ugsci-team"})
        }
        guard = TeamStateWriteGuard(tmp_path)

        def write_file(file_path: str, content: str) -> str:
            Path(file_path).write_text(content, encoding="utf-8")
            return "written"

        async def member_write(file_path, content):
            args = {"file_path": str(file_path), "content": content}

            async def invoke():
                yield await FunctionTool(write_file).call(**args)

            return [
                chunk
                async for chunk in guard.on_acting(
                    None,
                    {
                        "tool_call": SimpleNamespace(
                            name="write_file", input=json.dumps(args)
                        )
                    },
                    invoke,
                )
            ]

        async def call(name, **kwargs):
            if name != "get_state":
                kwargs.setdefault("expected_revision", wf.read_state()["revision"])
            permission = await tools[name].check_permissions(kwargs)
            assert permission.behavior == PermissionBehavior.ALLOW, permission.message
            chunk = await tools[name].call(**kwargs)
            return json.loads(chunk.content[0].text)

        async def phase(name):
            await call(
                "update_state", patch={"current_phase": name, "forks_integrated": True}
            )
            await mode._gate.check({})

        await phase("dispatch")
        prompt = mode._gate.build_continuation()
        assert "prepare_result" in prompt and "publish_result" in prompt
        late = await call("prepare_result", step=1, task_id="late-task")
        current = await call("prepare_result", step=1, task_id="current-task")
        await member_write(current["absolute_candidate_path"], '{"synthetic":1}')
        await call("publish_result", step=1, attempt_id=current["attempt_id"])
        await member_write(folder / "results/step-1.json", '{"forged": true}')
        assert json.loads((folder / "results/step-1.json").read_text()) == {
            "synthetic": 1
        }
        await phase("verify")
        # Child has the parent's workspace, but must not gain its controller.
        child = UGSciTeamMode()
        child._gate = UGSciTeamGate()
        with scoped_session_id("child"):
            child_ctx = SimpleNamespace(
                **{
                    **vars(ctx),
                    "session_id": "child",
                    "request": SimpleNamespace(
                        request_context={
                            "_spawn_subagent": True,
                            "parent_session_id": "system-owner",
                        }
                    ),
                }
            )
            await child.on_turn_start(child_ctx)
            assert not child.is_active(child_ctx)
        pending = await call("prepare_review")
        Path(pending["absolute_candidate_path"]).write_text(
            json.dumps({**pending, "verdict": "PARTIAL"}), encoding="utf-8"
        )
        await call("accept_review", review_id=pending["review_id"])
        await phase("dispatch")
        revised = await call("prepare_result", step=1, task_id="revision-task")
        Path(revised["absolute_candidate_path"]).write_text(
            '{"synthetic":2}', encoding="utf-8"
        )
        await call("publish_result", step=1, attempt_id=revised["attempt_id"])
        Path(late["absolute_candidate_path"]).write_text(
            '{"synthetic":0}', encoding="utf-8"
        )
        with pytest.raises(TeamStateConflictError):
            await call("publish_result", step=1, attempt_id=late["attempt_id"])
        await phase("verify")
        # Service restart restores exactly this owner, including attempt metadata.
        restored_ws = Workspace()
        restored_ws.plugins = WorkspacePlugins()
        restored = UGSciTeamMode()
        restored_ws.plugins.register_mode(restored, restored_ws)
        assert restored_ws.plugins.tool_registry.filter(active_modes=set()) == []
        await restored_ws.plugins.hook_registry.run(Phase.PRE_AGENT_BUILD, ctx)
        assert (
            restored.is_active(ctx) and restored._gate._state().artifact_protocol == 1
        )
        assert {
            d.name
            for d in restored_ws.plugins.tool_registry.filter(
                active_modes=restored_ws.plugins.active_mode_names(ctx)
            )
        } == {d.name for d in restored.tools()}
        pending = await call("prepare_review")
        Path(pending["absolute_candidate_path"]).write_text(
            json.dumps({**pending, "verdict": "PASS"}), encoding="utf-8"
        )
        await call("accept_review", review_id=pending["review_id"])
        await phase("synthesize")
        await call(
            "publish_report",
            content=f"# Synthetic {style}\nAll current results reviewed.",
        )
        await phase("completed")
        assert not mode.is_active(ctx)
        assert wf.read_state()["workflow_status"] == "completed"
        validate_phase(wf, wf.read_state())
        assert json.loads((folder / "results/step-1.json").read_text()) == {
            "synthetic": 2
        }
        assert not UGSciTeamGate().restore(tmp_path, "default", "system-owner")
        app = FastAPI()
        app.include_router(build_team_router(lambda _: tmp_path), prefix="/team")
        response = TestClient(app).get("/team/state", headers={"X-Agent-Id": "default"})
        assert response.status_code == 200
        assert (
            response.json()["status"] == "completed"
            and response.json()["active"] is False
        )
