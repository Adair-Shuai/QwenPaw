# -*- coding: utf-8 -*-
"""UGSciTeamGate — 5-phase state machine for expert-team workflows.

Phases:
    plan → dispatch → verify → synthesize → completed

The gate enforces:
- Iteration limits (UGSCI_TEAM_MAX_ITERATIONS)
- Verify retry limits (UGSCI_TEAM_MAX_VERIFY_RETRIES)
- Fork integration before post-dispatch phase advance
- Structured state persistence via TeamWorkflowState
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

from qwenpaw.loop.gates import StopAction, StopHandlerResult
from qwenpaw.loop.gates.loop_gate import LoopGate

from .constants import (
    PHASE_COMPLETED,
    PHASE_DISPATCH,
    PHASE_PLAN,
    PHASE_SYNTHESIZE,
    PHASE_VERIFY,
    POST_DISPATCH_PHASES,
    UGSCI_TEAM_MAX_DISPATCH_RETRIES,
    UGSCI_TEAM_MAX_ITERATIONS,
    UGSCI_TEAM_MAX_MERGE_WAITS,
    UGSCI_TEAM_MAX_VERIFY_RETRIES,
)
from .fork_guard import forks_integrated, merge_blocked_continuation
from .roles import FORK_MERGE_PROTOCOL
from .state import (
    TeamStateInvalidError,
    TeamWorkflowState,
    WORKFLOW_ACTIVE,
    WORKFLOW_COMPLETED,
    WORKFLOW_TERMINATED,
    validate_state_document,
)

logger = logging.getLogger(__name__)


def _instance_sort_key(instance: Path) -> tuple[int, str]:
    """Return a deterministic, cross-platform recency key."""
    try:
        state_file = instance / "state.json"
        timestamp = (
            state_file.stat().st_mtime_ns
            if state_file.exists()
            else instance.stat().st_mtime_ns
        )
        return timestamp, instance.name
    except OSError:
        return 0, instance.name


@dataclass
class _TeamState:
    """Per-session runtime state for the UGSci team gate."""

    loop_dir: Path
    workspace_dir: Path
    agent_id: str = ""
    team_id: str = "ugsci-team"
    team_mode: str = "pipeline"          # pipeline | coordinator | roundtable
    team_name: str = ""                  # display name (e.g. "储层评价团队")
    members: list[dict[str, str]] = field(default_factory=list)
    task: str = ""                       # user's original task description
    active: bool = True
    iteration: int = 0
    max_iterations: int = UGSCI_TEAM_MAX_ITERATIONS
    verify_retries: int = 0
    max_verify_retries: int = UGSCI_TEAM_MAX_VERIFY_RETRIES
    dispatch_retries: int = 0
    max_dispatch_retries: int = UGSCI_TEAM_MAX_DISPATCH_RETRIES
    merge_waits: int = 0
    max_merge_waits: int = UGSCI_TEAM_MAX_MERGE_WAITS
    phase: str = PHASE_PLAN
    blocked_on_merge: bool = False


class UGSciTeamGate(LoopGate):
    """Stop gate for the UGSci expert-team pipeline."""

    @property
    def name(self) -> str:
        return "ugsci-team"

    @property
    def priority(self) -> int:
        return 50

    def activate_for_team(
        self,
        workspace_dir: Path,
        team_id: str,
        team_name: str,
        team_mode: str,
        members: list[dict[str, str]],
        task: str,
        agent_id: str = "",
    ) -> Path:
        """Create the workflow instance directory and activate the gate."""
        try:
            from qwenpaw.agents.fork_project import begin_fork_scope

            begin_fork_scope(workspace_dir)
        except ImportError:
            logger.debug(
                "begin_fork_scope unavailable; fork merge scope disabled",
            )

        wf = TeamWorkflowState(workspace_dir, team_id)
        loop_dir = wf.create_instance()

        state = _TeamState(
            loop_dir=loop_dir,
            workspace_dir=workspace_dir,
            agent_id=agent_id,
            team_id=team_id,
            team_name=team_name,
            team_mode=team_mode,
            members=members,
            task=task,
        )
        wf.write_state(
            {
                "current_phase": PHASE_PLAN,
                "agent_id": agent_id,
                "team_id": team_id,
                "team_name": team_name,
                "team_mode": team_mode,
                "members": members,
                "task": task,
                "workflow_status": "active",
                "active": True,
                "iteration": 0,
                "verify_retries": 0,
                "dispatch_retries": 0,
                "merge_waits": 0,
                "created_at_ns": time.time_ns(),
            },
        )
        self.activate(state)
        logger.info(
            "UGSci team workflow activated",
            extra={
                "agent_id": agent_id,
                "team_id": team_id,
                "instance_id": loop_dir.name,
                "phase": PHASE_PLAN,
                "team_mode": team_mode,
                "member_count": len(members),
            },
        )
        return loop_dir

    @staticmethod
    def _fallback_state(st: _TeamState) -> dict[str, Any]:
        """Build a complete terminal snapshot if the state file is damaged."""
        return {
            "current_phase": st.phase,
            "agent_id": st.agent_id,
            "team_id": st.team_id,
            "team_name": st.team_name,
            "team_mode": st.team_mode,
            "members": st.members,
            "task": st.task,
            "iteration": st.iteration,
            "verify_retries": st.verify_retries,
            "dispatch_retries": st.dispatch_retries,
            "merge_waits": st.merge_waits,
        }

    async def _finish(
        self,
        wf: TeamWorkflowState,
        st: _TeamState,
        workflow_status: str,
        reason: str,
        result_reason: str,
    ) -> StopHandlerResult:
        """Persist terminal state, clean temporary files, and deactivate."""
        await asyncio.to_thread(
            wf.finalize,
            workflow_status,
            reason,
            self._fallback_state(st),
        )
        await asyncio.to_thread(wf.cleanup)
        self.deactivate()
        return StopHandlerResult(
            action=StopAction.TERMINATE,
            reason=result_reason,
        )

    def terminate_current(self, reason: str) -> None:
        """Terminate the active session while preserving a queryable snapshot."""
        st: _TeamState | None = self._state()
        if st is None:
            return
        wf = TeamWorkflowState.from_existing(
            st.workspace_dir,
            st.team_id,
            st.loop_dir,
        )
        wf.finalize(
            WORKFLOW_TERMINATED,
            reason,
            self._fallback_state(st),
        )
        wf.cleanup()
        self.deactivate()

    def restore(
        self,
        workspace_dir: Path,
        agent_id: str = "",
    ) -> bool:
        """Restore the latest active workflow instance from disk.

        Called by the mode's ``on_turn_start`` after a service restart.
        Scans the workspace's ``.qwenpaw/ugsci_teams/`` directory for the
        newest instance whose ``state.json`` reports an active workflow,
        validates it, and reactivates the in-memory ``_TeamState``.

        The method handles:
        - Corrupted state files (skips them with a warning)
        - Terminal workflows (completed / terminated are never restored)
        - Agent-id mismatch (skips instances belonging to other agents)
        - Concurrent instances (selects the most recently modified)

        Returns ``True`` if state was restored, ``False`` otherwise.
        """
        if self._state() is not None:
            return True  # already restored (or freshly activated)

        base = workspace_dir / ".qwenpaw" / "ugsci_teams"
        if not base.exists():
            return False

        try:
            base_resolved = base.resolve()
            instances = sorted(
                (
                    path
                    for path in base.iterdir()
                    if path.is_dir()
                    and not path.is_symlink()
                    and path.resolve().is_relative_to(base_resolved)
                ),
                key=_instance_sort_key,
                reverse=True,
            )
        except OSError:
            logger.warning(
                "UGSci team restore: state directory unreadable",
                extra={"agent_id": agent_id},
                exc_info=True,
            )
            return False

        for instance in instances:
            state_file = instance / "state.json"
            if not state_file.is_file() or state_file.is_symlink():
                continue

            try:
                data = validate_state_document(
                    json.loads(
                        state_file.read_text(encoding="utf-8"),
                    ),
                )
            except (
                json.JSONDecodeError,
                UnicodeDecodeError,
                TeamStateInvalidError,
            ):
                logger.warning(
                    "UGSci team restore: skipping invalid state file",
                    extra={
                        "agent_id": agent_id,
                        "instance_id": instance.name,
                    },
                    exc_info=True,
                )
                continue
            except OSError:
                logger.warning(
                    "UGSci team restore: state file unreadable",
                    extra={
                        "agent_id": agent_id,
                        "instance_id": instance.name,
                    },
                    exc_info=True,
                )
                continue

            # Skip terminal workflows — they should never be revived.
            workflow_status = data.get(
                "workflow_status",
                WORKFLOW_ACTIVE,
            )
            if workflow_status != WORKFLOW_ACTIVE:
                continue

            phase = data.get("current_phase", PHASE_PLAN)
            if phase == PHASE_COMPLETED:
                continue

            # Match agent_id when both sides are non-empty.
            persisted_agent_id = data.get("agent_id", "")
            if (
                agent_id
                and persisted_agent_id
                and agent_id != persisted_agent_id
            ):
                continue

            team_id = data.get("team_id", "ugsci-team")
            st = _TeamState(
                loop_dir=instance,
                workspace_dir=workspace_dir,
                agent_id=persisted_agent_id,
                team_id=team_id,
                team_mode=data.get("team_mode", "pipeline"),
                team_name=data.get("team_name", ""),
                members=data.get("members", []),
                task=data.get("task", ""),
                active=True,
                iteration=int(data.get("iteration", 0)),
                verify_retries=int(data.get("verify_retries", 0)),
                dispatch_retries=int(
                    data.get("dispatch_retries", 0),
                ),
                merge_waits=int(data.get("merge_waits", 0)),
                phase=phase,
                blocked_on_merge=bool(
                    data.get("merge_blocked", False),
                ),
            )
            self.activate(st)
            logger.info(
                "UGSci team workflow restored from disk",
                extra={
                    "agent_id": persisted_agent_id,
                    "team_id": team_id,
                    "instance_id": instance.name,
                    "phase": phase,
                },
            )
            return True

        return False

    async def check(  # pylint: disable=too-many-return-statements
        self,
        ctx: Any,
    ) -> Optional[StopHandlerResult]:
        if isinstance(ctx, dict) and ctx.get("has_tool_calls"):
            return StopHandlerResult(action=StopAction.BYPASS)

        st: _TeamState | None = self._state()
        if st is None:
            return StopHandlerResult(action=StopAction.BYPASS)

        wf = TeamWorkflowState.from_existing(
            st.workspace_dir,
            st.team_id,
            st.loop_dir,
        )
        try:
            data = await asyncio.to_thread(wf.read_state)
        except TeamStateInvalidError:
            logger.error(
                "UGSci team state is invalid; terminating workflow",
                extra={
                    "agent_id": st.agent_id,
                    "team_id": st.team_id,
                    "instance_id": st.loop_dir.name,
                    "phase": st.phase,
                },
                exc_info=True,
            )
            return await self._finish(
                wf,
                st,
                WORKFLOW_TERMINATED,
                "state_invalid",
                "UGSci team state is invalid",
            )
        if not data:
            logger.error(
                "UGSci team state is missing; terminating workflow",
                extra={
                    "agent_id": st.agent_id,
                    "team_id": st.team_id,
                    "instance_id": st.loop_dir.name,
                    "phase": st.phase,
                },
            )
            return await self._finish(
                wf,
                st,
                WORKFLOW_TERMINATED,
                "state_missing",
                "UGSci team state is missing",
            )

        prev_phase = st.phase
        phase = data.get("current_phase", PHASE_PLAN)
        st.phase = phase

        # ── Fork integration check (post-dispatch phases) ──────────
        if phase in POST_DISPATCH_PHASES:
            integrated = await asyncio.to_thread(
                forks_integrated,
                data,
                st.workspace_dir,
            )
            if not integrated:
                st.blocked_on_merge = True
                st.phase = phase
                st.merge_waits += 1
                await asyncio.to_thread(
                    wf.update_state,
                    {
                        "merge_blocked": True,
                        "resume_phase": phase,
                        "merge_waits": st.merge_waits,
                    },
                )
                if st.merge_waits > st.max_merge_waits:
                    logger.error(
                        "UGSci team fork merge wait limit reached",
                        extra={
                            "agent_id": st.agent_id,
                            "team_id": st.team_id,
                            "instance_id": st.loop_dir.name,
                            "phase": phase,
                            "merge_waits": st.merge_waits,
                        },
                    )
                    return await self._finish(
                        wf,
                        st,
                        WORKFLOW_TERMINATED,
                        "merge_wait_limit",
                        (
                            "Fork merge wait limit "
                            f"({st.max_merge_waits})"
                        ),
                    )
                return StopHandlerResult(
                    action=StopAction.INTERRUPT_AND_CONTINUE,
                    reason="UGSci team blocked: forks not integrated",
                )

        if data.get("merge_blocked"):
            await asyncio.to_thread(
                wf.update_state,
                {"merge_blocked": False},
            )
        st.blocked_on_merge = False
        st.merge_waits = int(data.get("merge_waits", st.merge_waits))

        # ── Iteration limit ─────────────────────────────────────────
        st.iteration += 1
        await asyncio.to_thread(
            wf.update_state,
            {"iteration": st.iteration},
        )
        if st.iteration > st.max_iterations:
            logger.error(
                "UGSci team iteration limit reached",
                extra={
                    "agent_id": st.agent_id,
                    "team_id": st.team_id,
                    "instance_id": st.loop_dir.name,
                    "phase": phase,
                    "iteration": st.iteration,
                },
            )
            return await self._finish(
                wf,
                st,
                WORKFLOW_TERMINATED,
                "iteration_limit",
                f"Iteration limit ({st.max_iterations})",
            )

        # ── Completion ──────────────────────────────────────────────
        if phase == PHASE_COMPLETED:
            logger.info(
                "UGSci team workflow completed",
                extra={
                    "agent_id": st.agent_id,
                    "team_id": st.team_id,
                    "instance_id": st.loop_dir.name,
                    "phase": phase,
                    "iteration": st.iteration,
                },
            )
            return await self._finish(
                wf,
                st,
                WORKFLOW_COMPLETED,
                "completed",
                "UGSci team workflow completed",
            )

        # ── Verify retry counter ────────────────────────────────────
        if phase == PHASE_VERIFY and prev_phase != PHASE_VERIFY:
            st.verify_retries += 1
            if st.verify_retries > st.max_verify_retries:
                logger.error(
                    "UGSci team verify retry limit reached",
                    extra={
                        "agent_id": st.agent_id,
                        "team_id": st.team_id,
                        "instance_id": st.loop_dir.name,
                        "phase": phase,
                        "verify_retries": st.verify_retries,
                    },
                )
                return await self._finish(
                    wf,
                    st,
                    WORKFLOW_TERMINATED,
                    "verify_retry_limit",
                    f"Verify retry limit ({st.max_verify_retries})",
                )
            await asyncio.to_thread(
                wf.update_state,
                {"verify_retries": st.verify_retries},
            )

        # ── Dispatch retry counter ───────────────────────────────────
        if phase == PHASE_DISPATCH and prev_phase != PHASE_DISPATCH:
            st.dispatch_retries += 1
            if st.dispatch_retries > st.max_dispatch_retries:
                logger.error(
                    "UGSci team dispatch retry limit reached",
                    extra={
                        "agent_id": st.agent_id,
                        "team_id": st.team_id,
                        "instance_id": st.loop_dir.name,
                        "phase": phase,
                        "dispatch_retries": st.dispatch_retries,
                    },
                )
                return await self._finish(
                    wf,
                    st,
                    WORKFLOW_TERMINATED,
                    "dispatch_retry_limit",
                    f"Dispatch retry limit ({st.max_dispatch_retries})",
                )
            await asyncio.to_thread(
                wf.update_state,
                {"dispatch_retries": st.dispatch_retries},
            )

        return StopHandlerResult(
            action=StopAction.INTERRUPT_AND_CONTINUE,
            reason="UGSci team pipeline in progress",
        )

    def build_continuation(self) -> str:
        """Build continuation prompt from current gate state."""
        st: _TeamState | None = self._state()
        if st is None:
            return ""
        if st.blocked_on_merge:
            return merge_blocked_continuation(FORK_MERGE_PROTOCOL)

        # Import here to avoid circular imports
        from .prompts import build_continuation as _build

        return _build(
            phase=st.phase,
            iteration=st.iteration,
            max_iterations=st.max_iterations,
            loop_dir=st.loop_dir,
            team_mode=st.team_mode,
            team_name=st.team_name,
            members=st.members,
            task=st.task,
            verify_retries=st.verify_retries,
            max_verify_retries=st.max_verify_retries,
            dispatch_retries=st.dispatch_retries,
        )
