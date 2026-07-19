# -*- coding: utf-8 -*-
"""FlowForge workflow engine — error taxonomy.

Ported from ``leagent.workflow.engine.errors`` with the same class
hierarchy so exception-handling code stays portable.
"""

from __future__ import annotations


class WorkflowEngineError(Exception):
    """Base class for every workflow-engine error."""


class ValidationError(WorkflowEngineError):
    """Raised when a :class:`WorkflowDocument` fails validation."""

    def __init__(self, message: str, *, errors: list[str] | None = None) -> None:
        super().__init__(message)
        self.errors = list(errors or [])


class DependencyCycleError(WorkflowEngineError):
    """Raised when the staged strong-link graph contains a cycle."""


class NodeExecutionError(WorkflowEngineError):
    """Raised when a single node fails during execution."""

    def __init__(self, node_id: str, message: str) -> None:
        super().__init__(f"{node_id}: {message}")
        self.node_id = node_id


class BlockedError(WorkflowEngineError):
    """Raised when staging blocks on an external event indefinitely."""


__all__ = [
    "BlockedError",
    "DependencyCycleError",
    "NodeExecutionError",
    "ValidationError",
    "WorkflowEngineError",
]
