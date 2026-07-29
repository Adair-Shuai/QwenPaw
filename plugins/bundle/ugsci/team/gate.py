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
import logging
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
    UGSCI_TEAM_MAX_ITERATIONS,
    UGSCI_TEAM_MAX_VERIFY_RETRIES,
)
from .fork_guard import forks_integrated, merge_blocked_continuation
from .roles import FORK_MERGE_PROTOCOL
from .state import TeamWorkflowState

logger = logging.getLogger(__name__)


@dataclass
class _TeamState:
    """Per-session runtime state for the UGSci team gate."""

    loop_dir: Path
    workspace_dir: Path
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
    max_dispatch_retries: int = 2
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
            team_id=team_id,
            team_name=team_name,
            team_mode=team_mode,
            members=members,
            task=task,
        )
        wf.write_state(
            {
                "current_phase": PHASE_PLAN,
                "team_id": team_id,
                "team_name": team_name,
                "team_mode": team_mode,
                "members": members,
                "task": task,
                "verify_retries": 0,
                "dispatch_retries": 0,
            },
        )
        self.activate(state)
        logger.info(
            "UGSci team '%s' activated: mode=%s, members=%d, dir=%s",
            team_name, team_mode, len(members), loop_dir,
        )
        return loop_dir

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
        data = await asyncio.to_thread(wf.read_state)

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
                await asyncio.to_thread(
                    wf.update_state,
                    {
                        "merge_blocked": True,
                        "resume_phase": phase,
                    },
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

        # ── Iteration limit ─────────────────────────────────────────
        st.iteration += 1
        if st.iteration > st.max_iterations:
            await asyncio.to_thread(wf.cleanup)
            self.deactivate()
            return StopHandlerResult(
                action=StopAction.TERMINATE,
                reason=f"Iteration limit ({st.max_iterations})",
            )

        # ── Completion ──────────────────────────────────────────────
        if phase == PHASE_COMPLETED:
            await asyncio.to_thread(wf.cleanup)
            self.deactivate()
            return StopHandlerResult(
                action=StopAction.TERMINATE,
                reason="UGSci team workflow completed",
            )

        # ── Verify retry counter ────────────────────────────────────
        if phase == PHASE_VERIFY and prev_phase != PHASE_VERIFY:
            st.verify_retries += 1
            if st.verify_retries > st.max_verify_retries:
                await asyncio.to_thread(wf.cleanup)
                self.deactivate()
                return StopHandlerResult(
                    action=StopAction.TERMINATE,
                    reason=(
                        f"Verify retry limit "
                        f"({st.max_verify_retries})"
                    ),
                )
            await asyncio.to_thread(
                wf.update_state,
                {"verify_retries": st.verify_retries},
            )

        # ── Dispatch retry counter ───────────────────────────────────
        if phase == PHASE_DISPATCH and prev_phase != PHASE_DISPATCH:
            st.dispatch_retries += 1
            if st.dispatch_retries > st.max_dispatch_retries:
                await asyncio.to_thread(wf.cleanup)
                self.deactivate()
                return StopHandlerResult(
                    action=StopAction.TERMINATE,
                    reason=(
                        f"Dispatch retry limit "
                        f"({st.max_dispatch_retries})"
                    ),
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
