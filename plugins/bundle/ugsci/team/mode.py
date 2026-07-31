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

from qwenpaw.runtime.hooks import HookContext
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

    async def on_turn_start(self, ctx: HookContext) -> None:
        """Restore persisted team state before handler scope selection.

        After a service restart the gate's in-memory ``_sessions`` dict
        is empty even though ``state.json`` on disk still reports an
        active workflow.  This hook scans the workspace for the latest
        active instance and reactivates the gate so subsequent
        ``check()`` calls continue the correct phase.
        """
        if self._gate is None:
            return
        # Skip when state is already loaded (same process, new turn).
        # pylint: disable=protected-access
        if self._gate._state() is not None:
            return
        workspace_dir = getattr(ctx, "workspace_dir", None)
        if not workspace_dir:
            return
        agent_id = str(getattr(ctx, "agent_id", "") or "")
        await asyncio.to_thread(
            self._gate.restore,
            Path(workspace_dir),
            agent_id,
        )

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
        if parsed.get("_error"):
            return info_msg(parsed["_error"])

        team_mode = parsed["team_mode"]
        team_name = parsed["team_name"]
        task = parsed["task"]
        members = parsed["members"]
        custom_team_def = parsed.get("custom_team_def")

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

        # If a custom team definition is available, include its
        # orchestration prompt and structured steps in the plan
        # prompt so the controller follows the user-defined workflow.
        extra_sections = ""
        if custom_team_def:
            orch_prompt = custom_team_def.get(
                "orchestration_prompt", "",
            )
            if orch_prompt:
                extra_sections += f"\n---\n\n## 编排说明\n\n{orch_prompt}\n"

            steps = custom_team_def.get("steps", [])
            if steps:
                step_lines = []
                for idx, step in enumerate(steps):
                    agent = step.get("agentName", step.get("agent_name", ""))
                    instr = step.get("instruction", "")
                    pass_ctx = step.get(
                        "passContext", step.get("pass_context", False),
                    )
                    ctx_note = (
                        "（传递上一步的结果作为上下文）"
                        if pass_ctx
                        else "（独立执行，不传递上下文）"
                    )
                    step_lines.append(
                        f"{idx + 1}. 向「{agent}」发送请求：{instr} {ctx_note}",
                    )
                step_text = "\n".join(step_lines)
                extra_sections += (
                    f"\n---\n\n## 执行步骤\n\n{step_text}\n"
                )

        prompt = (
            f"UGSci 专家团已激活。\n"
            f"团队: {team_name}\n"
            f"模式: {team_mode}\n"
            f"任务: {task}\n"
            f"状态目录: {loop_dir}\n\n"
            f"团队成员:\n{member_list}\n"
            f"{extra_sections}"
            f"\n阶段: plan — 分析任务并创建任务分解计划。\n"
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
    1. ``<mode> @<team_id> <task...>`` — custom team by ID
    2. ``@<team_id> <task...>`` — custom team, defaults to pipeline
    3. ``<mode> <team_name> <task...>`` — preset team by name
    4. ``<team_name> <task...>`` — preset team, defaults to pipeline

    Custom teams are referenced via ``@<team_id>`` — a whitespace-free
    token returned by ``POST /api/ugsci/team/custom``.  This avoids
    the team-name-with-spaces parsing problem (BUG-004) because the
    ID is always a single token.

    Preset team names may contain spaces (e.g. "开发方案评审团队").
    The parser tries longest preset-name match first, then falls
    back to splitting on the first whitespace.

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

    # ── Step 2: Check for @-prefixed custom team ID ──────────────
    if remaining.startswith("@"):
        parts = remaining[1:].split(None, 1)
        if len(parts) < 2:
            return {"_error": "请提供任务描述。用法: /ugsci-team <mode> @<team_id> <task>"}
        custom_team_id = parts[0]
        task = parts[1]

        from .custom_store import load_custom_team

        team_def = load_custom_team(custom_team_id)
        if team_def is None:
            logger.warning(
                "Custom team '@%s' not found in store",
                custom_team_id,
            )
            return {
                "_error": (
                    f"自定义团队 '@{custom_team_id}' 不存在或已过期。"
                    f"请重新发起团队任务。"
                ),
            }

        members = [
            {
                "name": m.get("name", ""),
                "role": m.get("role", ""),
                "emoji": m.get("emoji", ""),
            }
            for m in team_def.get("members", [])
        ]

        return {
            "team_mode": team_mode,
            "team_name": team_def.get("name", custom_team_id),
            "task": task,
            "members": members,
            "custom_team_def": team_def,
        }

    # ── Step 3: Try to match a preset team name ───────────────────
    # Preset team names may contain spaces, so we try longest match first.
    team_name, task = _split_team_name(remaining)

    if not team_name or not task:
        return None

    # ── Step 4: Resolve members ────────────────────────────────────
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
