# -*- coding: utf-8 -*-
"""WorkflowState — per-instance state directory and file management.

Adapted from OMP's ``shared/state.py``, customised for UGSci expert
teams.  Path convention::

    {workspace_dir}/.qwenpaw/ugsci_teams/{team_id}-{timestamp}/

Each instance directory contains:
- ``state.json``       — current phase, retry counters, forks_integrated
- ``progress.txt``      — append-only audit log
- ``handoffs/``         — structured inter-expert handoff files
- ``results/``          — per-expert output files
- ``reviews/``          — verification-phase review reports
"""

from __future__ import annotations

import json
import logging
import shutil
import time
import uuid
from pathlib import Path
from typing import Any

from .constants import ALL_PHASES, PHASE_COMPLETED, PHASE_PLAN

logger = logging.getLogger(__name__)

WORKFLOW_ACTIVE = "active"
WORKFLOW_COMPLETED = "completed"
WORKFLOW_TERMINATED = "terminated"
WORKFLOW_STATUSES = frozenset(
    {WORKFLOW_ACTIVE, WORKFLOW_COMPLETED, WORKFLOW_TERMINATED},
)


class TeamStateInvalidError(ValueError):
    """Raised when a workflow state document is malformed."""


def validate_state_document(data: Any) -> dict[str, Any]:
    """Validate and return a workflow state mapping.

    State is controller-editable, so validation must happen at every read
    boundary rather than relying only on the initial writer.
    """
    if not isinstance(data, dict):
        raise TeamStateInvalidError("state document must be a JSON object")
    phase = data.get("current_phase")
    if phase not in ALL_PHASES:
        raise TeamStateInvalidError(
            f"current_phase must be one of {', '.join(ALL_PHASES)}",
        )
    workflow_status = data.get("workflow_status", WORKFLOW_ACTIVE)
    if workflow_status not in WORKFLOW_STATUSES:
        raise TeamStateInvalidError(
            "workflow_status must be active, completed, or terminated",
        )
    return data


class TeamWorkflowState:
    """Manage per-instance state directory and files for UGSci teams."""

    def __init__(self, workspace_dir: Path, team_id: str = "ugsci-team") -> None:
        self.workspace_dir = workspace_dir
        self.team_id = team_id
        self._instance_dir: Path | None = None

    def create_instance(self) -> Path:
        """Create a timestamped instance directory with sub-folders."""
        ts = time.strftime("%Y%m%d-%H%M%S")
        suffix = uuid.uuid4().hex[:6]
        base = self.workspace_dir / ".qwenpaw" / "ugsci_teams"
        self._instance_dir = base / f"{self.team_id}-{ts}-{suffix}"
        self._instance_dir.mkdir(parents=True, exist_ok=True)

        # Create sub-directories
        (self._instance_dir / "handoffs").mkdir(exist_ok=True)
        (self._instance_dir / "results").mkdir(exist_ok=True)
        (self._instance_dir / "reviews").mkdir(exist_ok=True)

        self.append_log(f"[{self.team_id}] instance created")
        return self._instance_dir

    @property
    def instance_dir(self) -> Path | None:
        return self._instance_dir

    @classmethod
    def from_existing(
        cls,
        workspace_dir: Path,
        team_id: str,
        instance_dir: Path,
    ) -> "TeamWorkflowState":
        """Attach to an already-created instance directory."""
        wf = cls(workspace_dir, team_id)
        wf._instance_dir = instance_dir
        return wf

    def read_state(self) -> dict[str, Any]:
        """Read and validate ``state.json``.

        A missing file still returns an empty mapping so callers can
        distinguish "not created" from malformed state. Invalid JSON, a
        non-object top level, and unknown phases raise
        :class:`TeamStateInvalidError` and are never silently overwritten.
        """
        if not self._instance_dir:
            return {}
        p = self._instance_dir / "state.json"
        if not p.exists():
            return {}
        try:
            data = json.loads(p.read_text(encoding="utf-8"))
            return validate_state_document(data)
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            logger.warning("Failed to read %s", p, exc_info=True)
            raise TeamStateInvalidError("state JSON is invalid") from exc

    def write_state(self, data: dict[str, Any]) -> None:
        """Atomically replace state.json with *data*."""
        if not self._instance_dir:
            return
        self._atomic_write_json(
            self._instance_dir / "state.json",
            data,
        )

    def update_state(self, patch: dict[str, Any]) -> dict[str, Any]:
        """Merge *patch* into state.json and write atomically.

        Returns the merged document.  Prefer this over
        :meth:`write_state` when the gate only owns some keys.
        """
        data = self.read_state()
        data.update(patch)
        self.write_state(data)
        return data

    def finalize(
        self,
        workflow_status: str,
        reason: str,
        fallback: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Persist a terminal snapshot that remains queryable after cleanup."""
        if workflow_status not in {
            WORKFLOW_COMPLETED,
            WORKFLOW_TERMINATED,
        }:
            raise ValueError("final workflow status must be terminal")
        try:
            data = self.read_state()
        except TeamStateInvalidError:
            data = dict(fallback or {})
        if not data:
            data = dict(fallback or {})
        data.setdefault("current_phase", PHASE_PLAN)
        if workflow_status == WORKFLOW_COMPLETED:
            data["current_phase"] = PHASE_COMPLETED
        data.update(
            {
                "workflow_status": workflow_status,
                "active": False,
                "termination_reason": reason,
                "finished_at_ns": time.time_ns(),
            },
        )
        self.write_state(data)
        return data

    def read_plan(self) -> dict[str, Any]:
        """Read handoffs/plan.json, returning empty dict if absent."""
        return self._read_json("handoffs/plan.json")

    def _read_json(self, relative: str) -> dict[str, Any]:
        if not self._instance_dir:
            return {}
        p = self._instance_dir / relative
        if not p.exists():
            return {}
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except Exception:
            logger.warning("Failed to read %s", p, exc_info=True)
            return {}

    def append_log(self, entry: str) -> None:
        """Append a line to progress.txt (survives :meth:`cleanup`)."""
        if not self._instance_dir:
            return
        p = self._instance_dir / "progress.txt"
        with p.open("a", encoding="utf-8") as f:
            f.write(entry + "\n")

    def cleanup(self) -> None:
        """Remove temporary control files; keep audit artifacts.

        Deletes ``prd.json`` and ``*.tmp`` sidecars. The terminal
        ``state.json`` is retained so the API can identify the latest run and
        never fall back to an older active instance.
        """
        if not self._instance_dir or not self._instance_dir.exists():
            return
        remove_names = {"prd.json"}
        for child in list(self._instance_dir.iterdir()):
            should_remove = child.name in remove_names or (
                child.is_file() and child.name.endswith(".tmp")
            )
            if not should_remove:
                continue
            try:
                if child.is_dir():
                    shutil.rmtree(child)
                else:
                    child.unlink()
            except OSError:
                logger.warning(
                    "Failed to remove %s during cleanup",
                    child,
                    exc_info=True,
                )
        self.append_log(f"[{self.team_id}] cleanup complete")
        logger.info(
            "UGSci team control files cleaned up",
            extra={
                "team_id": self.team_id,
                "instance_id": self._instance_dir.name,
            },
        )

    @staticmethod
    def _atomic_write_json(path: Path, data: dict[str, Any]) -> None:
        """Write JSON via temp file + replace."""
        path.parent.mkdir(parents=True, exist_ok=True)
        tmp = path.with_name(f".{path.name}.{uuid.uuid4().hex}.tmp")
        try:
            tmp.write_text(
                json.dumps(data, indent=2, ensure_ascii=False) + "\n",
                encoding="utf-8",
            )
            tmp.replace(path)
        finally:
            try:
                tmp.unlink(missing_ok=True)
            except OSError:
                logger.debug("Failed to remove state sidecar %s", tmp)


__all__ = [
    "TeamStateInvalidError",
    "TeamWorkflowState",
    "WORKFLOW_ACTIVE",
    "WORKFLOW_COMPLETED",
    "WORKFLOW_TERMINATED",
    "validate_state_document",
]
