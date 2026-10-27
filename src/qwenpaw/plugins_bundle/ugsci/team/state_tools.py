# -*- coding: utf-8 -*-
"""Controller-only state tools; use host extension APIs, not SDK changes."""

from __future__ import annotations

import json
from typing import Any

from .state import (
    TeamStateConflictError,
    TeamWorkflowState,
    validate_state_document,
)
from .artifacts import TeamArtifacts, freeze_plan, validate_phase
from .constants import POST_DISPATCH_PHASES
from .fork_guard import forks_integrated

STATE_UPDATE_PROTOCOL = (
    "状态更新规则（优先于下文的状态操作描述）：\n"
    "只允许本会话主控更新团队状态，成员只向主控交付结果，不得接管控制流程。\n"
    "读取状态使用 ugsci_team_get_state()；更新时调用\n"
    'ugsci_team_update_state(patch={"current_phase": "dispatch"}, '
    "expected_revision=<刚读取的 revision>)。\n"
    "所有“更新 state.json”均指调用该工具，禁止通过 write_file/edit_file、Shell "
    "或脚本改写状态。\n"
    "只提交需要变更的字段。发生版本冲突必须重新读取并核对进度，不得重放旧快照。\n"
    "不要修改 owner_session_id、revision、iteration、active、workflow_sta"
    "tus、termination_reason 等宿主字段；\n"
    '完成前先通过成果发布工具写入报告，再设置 current_phase="completed"，由 gate 验证、收尾。\n'
    "\n"
    "成果版本规则（artifact_protocol=1 的新任务）：\n"
    "计划保存在 handoffs/plan.json，steps 中每项用唯一整数 step。首次进入 dispatch "
    "会冻结计划。\n"
    "每次分派前调用 ugsci_team_prepare_result(step, task_id=<分派标识>, "
    "expected_revision)，\n"
    "把工具返回的 absolute_candidate_path 传给成员，成员只写该候选文件，或返回结果由主控存入该候选文件。\n"
    "取得实际后台任务 ID 后应自行记录与分派标识的对应关系；候选的 attempt_id 不能复用给另一轮任务。\n"
    "不要让成员直接写 results/step-N.json。完成后主控调用 "
    "ugsci_team_publish_result(step, attempt_id, expected_revision)。\n"
    "重复派发必须重新 prepare，旧任务迟到只留下独立候选，不能覆盖新发布成果。\n"
    "所有计划步骤发布后进入 verify。调用 ugsci_team_prepare_review(expected_rev"
    "ision)，\n"
    "把返回的 snapshot（包含每份不可变成果的 path）和 absolute_candidate_path "
    "交给独立审核专家。\n"
    '审核专家仅写该候选审核报告，格式为 {"review_id": "返回的ID", "snapshot": '
    "<原样返回的snapshot>,\n"
    '"verdict": "PASS/FAIL/PARTIAL", "issues": []}。主控通过 '
    "ugsci_team_accept_review(review_id, expected_revision) 接收。\n"
    "只有当前版本全部 PASS 才能进入 synthesize。重做任一步都会使旧审核失效，必须重新审核。\n"
    "最终报告调用 ugsci_team_publish_report(content=<Markdown报告正文>, "
    "expected_revision)，成功后才能完成。\n"
    "artifacts/、results/、reviews/verify-report.json 和 "
    "handoffs/final-report.md 均由发布工具管理，禁止直接改写。\n"
    "每次工具操作都会返回新的 revision；冲突时重新读取状态。\n"
    "进入 verify、synthesize 或 completed 前，必须先完成真实 fork 集成并设置 "
    "forks_integrated=true；无 fork 也要明确确认。\n"
    "若 current_phase=completed 但 workflow_status=active，这是待 gate "
    "收尾而非终态；\n"
    '仅允许补交 patch={"forks_integrated": true}，保留全部阶段与成果版本，由 gate '
    "复核后关闭。终态仍禁止任何更新。\n"
)

_PROTECTED = frozenset(
    {
        "owner_session_id",
        "agent_id",
        "team_id",
        "team_name",
        "team_mode",
        "members",
        "task",
        "revision",
        "iteration",
        "active",
        "workflow_status",
        "termination_reason",
        "created_at_ns",
        "finished_at_ns",
        "verify_retries",
        "dispatch_retries",
        "max_dispatch_retries",
        "merge_waits",
        "artifact_protocol",
        "artifact_plan",
        "artifact_results",
        "artifact_pending_review",
        "artifact_review",
        "artifact_report",
    },
)


def make_state_tools(mode: Any) -> list:
    def workflow() -> TeamWorkflowState:
        from qwenpaw.app.agent_context import get_current_session_id

        state = mode.gate.current_state() if mode.gate else None
        if (
            not state
            or not state.owner_session_id
            or (
                state.owner_session_id
                != (get_current_session_id() or "default")
            )
        ):
            raise TeamStateConflictError(
                "Only the owning controller session may update state",
            )
        return TeamWorkflowState.from_existing(
            state.workspace_dir,
            state.team_id,
            state.loop_dir,
        )

    def ugsci_team_get_state() -> str:
        """Read current owned team state, including its revision."""
        return json.dumps(workflow().read_state(), ensure_ascii=False)

    def ugsci_team_update_state(
        patch: dict[str, Any],
        expected_revision: int,
    ) -> str:
        """Update only changed workflow fields using the last observed \
revision.

        Args:
            patch: Fields to change; never send a complete \
state document.
            expected_revision: Revision returned by \
ugsci_team_get_state.
        """
        if not isinstance(patch, dict) or _PROTECTED.intersection(patch):
            raise TeamStateConflictError(
                "Controller lifecycle/identity fields are read-only",
            )
        if isinstance(expected_revision, bool) or not isinstance(
            expected_revision,
            int,
        ):
            raise TeamStateConflictError(
                "expected_revision must be an integer",
            )
        wf = workflow()
        with wf.locked():
            state = wf.read_state()
            validate_state_document({**state, **patch})
            if state.get("workflow_status") != "active" or not state.get(
                "active",
                True,
            ):
                raise TeamStateConflictError(
                    "Terminal workflows cannot be reopened",
                )
            if state.get("current_phase") == "completed" and not (
                state.get("artifact_protocol") == 1
                and patch == {"forks_integrated": True}
            ):
                raise TeamStateConflictError(
                    "Terminal workflows cannot be reopened",
                )
            transitions = {
                "plan": {"plan", "dispatch"},
                "dispatch": {"dispatch", "verify"},
                "verify": {"verify", "dispatch", "synthesize"},
                "synthesize": {"synthesize", "completed"},
            }
            if "current_phase" in patch and patch[
                "current_phase"
            ] not in transitions.get(state["current_phase"], set()):
                raise TeamStateConflictError("Invalid phase transition")
            changes = dict(patch)
            if state.get("artifact_protocol") == 1:
                if patch.get("current_phase") == "dispatch":
                    changes["artifact_plan"] = freeze_plan(wf, state)
                    if state["current_phase"] == "verify":
                        changes.update(
                            artifact_review={},
                            artifact_pending_review={},
                            artifact_report={},
                        )
                validate_phase(wf, {**state, **changes})
                if {**state, **changes}[
                    "current_phase"
                ] in POST_DISPATCH_PHASES and not forks_integrated(
                    {**state, **changes},
                    wf.workspace_dir,
                ):
                    raise TeamStateConflictError(
                        "Integrate actual fork results and "
                        "set forks_integrated=true before "
                        "phase advance",
                    )
            return json.dumps(
                wf.update_state(changes, expected_revision=expected_revision),
                ensure_ascii=False,
            )

    def ugsci_team_prepare_result(
        step: int,
        task_id: str,
        expected_revision: int,
    ) -> str:
        """Reserve a new isolated result candidate for a planned step and \
dispatch ID."""
        return json.dumps(
            TeamArtifacts(workflow()).prepare_result(
                step,
                task_id,
                expected_revision,
            ),
            ensure_ascii=False,
        )

    def ugsci_team_publish_result(
        step: int,
        attempt_id: str,
        expected_revision: int,
    ) -> str:
        """Validate and publish the latest candidate; superseded attempts are \
rejected."""
        return json.dumps(
            TeamArtifacts(workflow()).publish_result(
                step,
                attempt_id,
                expected_revision,
            ),
            ensure_ascii=False,
        )

    def ugsci_team_prepare_review(expected_revision: int) -> str:
        """Freeze current result versions and reserve an isolated reviewer \
output path."""
        return json.dumps(
            TeamArtifacts(workflow()).prepare_review(expected_revision),
            ensure_ascii=False,
        )

    def ugsci_team_accept_review(
        review_id: str,
        expected_revision: int,
    ) -> str:
        """Accept a reviewer candidate only if its identity and result \
versions match."""
        return json.dumps(
            TeamArtifacts(workflow()).accept_review(
                review_id,
                expected_revision,
            ),
            ensure_ascii=False,
        )

    def ugsci_team_publish_report(content: str, expected_revision: int) -> str:
        """Publish final Markdown only after a PASS review of the current \
results."""
        return json.dumps(
            TeamArtifacts(workflow()).publish_report(
                content,
                expected_revision,
            ),
            ensure_ascii=False,
        )

    return [
        ugsci_team_get_state,
        ugsci_team_update_state,
        ugsci_team_prepare_result,
        ugsci_team_publish_result,
        ugsci_team_prepare_review,
        ugsci_team_accept_review,
        ugsci_team_publish_report,
    ]
