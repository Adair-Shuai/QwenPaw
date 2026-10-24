"""Invocation ancestry shared across workflow tasks and agent tool calls."""

from contextvars import ContextVar

workflow_stack: ContextVar[tuple[str, ...]] = ContextVar(
    "flowforge_workflow_stack",
    default=(),
)
MAX_WORKFLOW_DEPTH = 8

current_run: ContextVar[dict | None] = ContextVar("flowforge_current_run", default=None)
