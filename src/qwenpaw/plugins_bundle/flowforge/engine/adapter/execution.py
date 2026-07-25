# -*- coding: utf-8 -*-
"""Adapter: execution scope stubs for workflow coding agent nodes.

LeAgent's ``coding_agent`` node uses ``begin_execution`` / ``end_execution``
and ``ExecutionScope`` to create nested execution runs for observability.

QwenPaw doesn't have this concept yet, so these are lightweight stubs
that generate run IDs without registering them anywhere.  The interface
is preserved so the node code compiles and runs without modification.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class ExecutionScope(str, Enum):
    """Mirror of LeAgent's ``ExecutionScope``."""

    WORKFLOW = "workflow"
    AGENT = "agent"
    TOOL = "tool"
    SUBWORKFLOW = "subworkflow"


@dataclass
class ExecutionRun:
    """Lightweight execution run record."""

    run_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    scope: ExecutionScope = ExecutionScope.WORKFLOW
    session_id: str | None = None
    user_id: str | None = None
    parent_run_id: str | None = None


def begin_execution(
    *,
    scope: ExecutionScope = ExecutionScope.WORKFLOW,
    session_id: str | None = None,
    user_id: str | None = None,
    parent_run_id: str | None = None,
) -> ExecutionRun:
    """Begin a new execution run (stub — generates an ID only)."""
    return ExecutionRun(
        scope=scope,
        session_id=session_id,
        user_id=user_id,
        parent_run_id=parent_run_id,
    )


def end_execution(run_id: str) -> None:
    """End an execution run (stub — no-op)."""
    pass


__all__ = ["ExecutionRun", "ExecutionScope", "begin_execution", "end_execution"]
