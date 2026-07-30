# -*- coding: utf-8 -*-
"""UGSciTeamMode — OMP-backed expert-team workflow mode.

Registers the ``/ugsci-team`` slash command and manages the
5-phase state machine (plan → dispatch → verify → synthesize → completed).

Usage:
    /ugsci-team <mode> <team_name> <task>
    /ugsci-team <team_name> <task>          (defaults to pipeline)

The mode activates the gate, which then drives the controller
through each phase via continuation prompts.
"""

from __future__ import annotations

import asyncio
import logging
import re
from pathlib import Path
from typing import TYPE_CHECKING, Any, Optional

from qwenpaw.runtime.slash_command_registry import CommandSpec

from .gate import UGSciTeamGate
from .mode_base import UGSciModeBase, info_msg, rewrite_user_msg
from .presets import PRESET_TEAM_NAMES, resolve_team_members

if TYPE_CHECKING:
    from agentscope.message import Msg

logger = logging.getLogger(__name__)

_HELP = (
    "**UGSci 专家团** — OMP 驱动的多智能体协同工作流\n\n"
    "用法: `/ugsci-team <模式> <团队名> <任务描述>`\n\n"
    "模式:\n"
    "  pipeline   — 流水线：专家按顺序执行，结果逐步传递\n"
    "  coordinator — 协调者：由协调者按需调用专家\n"
    "  roundtable  — 圆桌讨论：专家并行独立评估\n\n"
    "示例:\n"
    "  `/ugsci-team pipeline 储层评价团队 对XX区块进行储层评价`\n"
    "  `/ugsci-team roundtable 开发方案评审团队 评估XX区块开发方案`\n"
    "  `/ugsci-team 储层评价团队 对XX区块进行储层评价` (默认pipeline)\n\n"
    "阶段: plan → dispatch → verify → synthesize → completed"
)

_TEAM_MODE_RE = re.compile(
    r"^(pipeline|coordinator|roundtable)$",
    re.IGNORECASE,
)


class UGSciTeamMode(UGSciModeBase):
    """AgentMode for the UGSci expert-team workflow."""

    name = "ugsci-team"
    gate_cls = UGSciTeamGate
    plugin_id = "__ugsci_team__"
    handler_name = "ugsci-team-stop-handler"
    scope = "ugsci-team"

    def commands(self) -> list[CommandSpec]:
        return [
            CommandSpec(
                name="ugsci-team",
                handler=self._handler,
                category="builtin",
                help_text=_HELP,
                metadata={"builtin": True},
            ),
        ]

    async def _handler(
        self,
        ctx: "Any",
        args: str,
    ) -> Optional["Msg"]:
        if not args or not args.strip() or args.strip().lower() == "help":
            return info_msg(_HELP)

        parsed = _parse_args(args)
        if parsed is None:
            return info_msg("参数格式无效。\n\n" + _HELP)

        team_mode = parsed["team_mode"]
        team_name = parsed["team_name"]
        task = parsed["task"]
        members = parsed["members"]

        if len(task) < 5:
            return info_msg(
                "请提供更详细的任务描述（至少 5 个字符）。\n\n" + _HELP,
            )

        workspace_dir = getattr(ctx, "workspace_dir", None)
        if not workspace_dir:
            return info_msg("ERROR: 无法获取工作区目录。")

        # Generate a team_id from team_name (keep only word chars + CJK)
        team_id = re.sub(
            r"[^\w\u4e00-\u9fff]", "-", team_name,
        )[:30].strip("-")
        if not team_id:
            team_id = "ugsci-team"

        self.claim_workflow()
        loop_dir = await asyncio.to_thread(
            self._gate.activate_for_team,
            Path(workspace_dir),
            team_id,
            team_name,
            team_mode,
            members,
            task,
            str(getattr(ctx, "agent_id", "") or ""),
        )

        # Build the initial prompt for the plan phase
        member_list = "\n".join(
            f"- {m.get('emoji', '')} {m.get('name', '')}"
            f"（{m.get('role', '')}）"
            for m in members
        )

        prompt = (
            f"UGSci 专家团已激活。\n"
            f"团队: {team_name}\n"
            f"模式: {team_mode}\n"
            f"任务: {task}\n"
            f"状态目录: {loop_dir}\n\n"
            f"团队成员:\n{member_list}\n\n"
            f"阶段: plan — 分析任务并创建任务分解计划。\n"
            f"请先读取 {loop_dir}/state.json 确认工作流状态，"
            f"然后开始规划。"
        )
        rewrite_user_msg(ctx, prompt)
        logger.info(
            "UGSci team command started",
            extra={
                "agent_id": str(getattr(ctx, "agent_id", "") or ""),
                "team_id": team_id,
                "instance_id": loop_dir.name,
                "phase": "plan",
                "team_mode": team_mode,
            },
        )
        return None


# ── Argument parsing ──────────────────────────────────────────────────


def _parse_args(raw: str) -> dict | None:
    """Parse /ugsci-team arguments.

    Supported formats:
    1. ``<mode> <team_name> <task...>``
    2. ``<team_name> <task...>``  (defaults to pipeline)

    Team names may contain spaces (e.g. "开发方案评审团队").
    The parser first tries to match against known preset team names
    to correctly split the team name from the task.

    Returns None on invalid input.
    """
    raw = raw.strip()
    if not raw:
        return None

    # ── Step 1: Check if first token is a mode keyword ────────────
    first_token = raw.split(None, 1)[0] if raw else ""
    has_mode_prefix = bool(_TEAM_MODE_RE.match(first_token))

    if has_mode_prefix:
        team_mode = first_token.lower()
        remaining = raw[len(first_token):].strip()
    else:
        team_mode = "pipeline"
        remaining = raw

    if not remaining:
        return None

    # ── Step 2: Try to match a preset team name ───────────────────
    # Preset team names may contain spaces, so we try longest match first.
    team_name, task = _split_team_name(remaining)

    if not team_name or not task:
        return None

    # ── Step 3: Resolve members ────────────────────────────────────
    members = resolve_team_members(team_name)

    return {
        "team_mode": team_mode,
        "team_name": team_name,
        "task": task,
        "members": members,
    }


def _split_team_name(remaining: str) -> tuple[str, str]:
    """Split *remaining* into (team_name, task).

    Tries to match preset team names (which may contain spaces)
    against the beginning of the string. Falls back to splitting
    on the first whitespace.
    """
    # Sort by length descending so longer names match first
    sorted_names = sorted(PRESET_TEAM_NAMES, key=len, reverse=True)

    for name in sorted_names:
        if remaining.startswith(name):
            rest = remaining[len(name):].strip()
            if rest:
                return name, rest

    # Fallback: first token is team name, rest is task
    parts = remaining.split(None, 1)
    if len(parts) < 2:
        return "", ""
    return parts[0], parts[1]
