# -*- coding: utf-8 -*-
"""UGSci-owned guard for direct writes to team control documents.

This uses the host middleware extension; it does not change AgentScope.
It is a tool-interface guard, not an operating-system sandbox for scripts.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from agentscope.middleware import MiddlewareBase
from agentscope.message import TextBlock, ToolResultState
from agentscope.tool import ToolChunk


class TeamStateWriteGuard(MiddlewareBase):
    def __init__(self, workspace_dir: Path):
        self.workspace_dir = workspace_dir
        self.base = (workspace_dir / ".qwenpaw" / "ugsci_teams").resolve()

    def blocked(self, name: str, args: dict) -> bool:
        if name in {"write_file", "edit_file", "append_file"}:
            return self._file_blocked(
                args.get("file_path") or args.get("path"),
            )
        # State inspection has a dedicated read tool as well. Never ask a
        # shell interpreter to mutate/inspect the control document directly.
        if name == "execute_shell_command":
            command = str(args.get("command", ""))
            lower = command.lower()
            return "ugsci_teams" in lower and any(
                part in lower
                for part in (
                    "state.json",
                    "results",
                    "artifacts",
                    "verify-report.json",
                    "final-report.md",
                    "plan.json",
                )
            )
        return False

    def _file_blocked(self, raw: object) -> bool:
        if not isinstance(raw, str):
            return False
        path = Path(raw).expanduser()
        if not path.is_absolute():
            path = self.workspace_dir / path
        path = path.resolve()
        if not path.is_relative_to(self.base):
            return False
        parts = path.relative_to(self.base).parts
        if len(parts) < 2:
            return False
        if path.name.lower() == "state.json":
            return True
        return self._artifact_blocked(parts)

    def _artifact_blocked(self, parts: tuple[str, ...]) -> bool:
        try:
            state = json.loads(
                (self.base / parts[0] / "state.json").read_text(
                    encoding="utf-8",
                ),
            )
        except (OSError, ValueError):
            return False
        if not isinstance(state, dict) or state.get("artifact_protocol") != 1:
            return False
        rel = "/".join(parts[1:]).lower()
        return (
            parts[1].lower() in {"artifacts", "results"}
            or rel
            in {"reviews/verify-report.json", "handoffs/final-report.md"}
            or (
                rel == "handoffs/plan.json"
                and bool(state.get("artifact_plan"))
            )
        )

    async def on_acting(
        self,
        agent: Any,
        input_kwargs: dict,
        next_handler: Any,
    ):
        del agent
        call = input_kwargs["tool_call"]
        args = getattr(call, "input", {})
        if isinstance(args, str):
            try:
                args = json.loads(args)
            except ValueError:
                args = {}
        if isinstance(args, dict) and self.blocked(call.name, args):
            yield ToolChunk(
                is_last=True,
                state=ToolResultState.ERROR,
                content=[
                    TextBlock(
                        type="text",
                        text=(
                            "UGSci 团队状态和已发布成果禁止直接改写。主控请使用 "
                            "ugsci_team_* 状态及成果发布工具；成员只写本轮候选文件或返回结果。"
                        ),
                    ),
                ],
            )
            return
        async for item in next_handler():
            yield item


def state_guard_factory(ctx: Any, _config: Any):
    workspace = getattr(ctx, "workspace_dir", None)
    return TeamStateWriteGuard(Path(workspace)) if workspace else None
