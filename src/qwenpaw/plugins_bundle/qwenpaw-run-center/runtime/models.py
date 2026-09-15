"""Small, JSON-safe public contracts for the independent Run Center."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import StrEnum
from typing import Any

CONTRACT_VERSION = "1.0"


class RunStatus(StrEnum):
    DRAFT = "draft"
    QUEUED = "queued"
    PREPARING = "preparing"
    RUNNING = "running"
    FINALIZING = "finalizing"
    SUCCEEDED = "succeeded"
    PAUSED = "paused"
    CANCELLING = "cancelling"
    CANCELLED = "cancelled"
    RETRY_WAIT = "retry_wait"
    FAILED = "failed"
    BLOCKED = "blocked"


class StageStatus(StrEnum):
    """Lifecycle state for one execution stage."""

    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    SKIPPED = "skipped"


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _rfc3339(value: Any) -> str | None:
    """Normalize legacy epoch seconds and modern strings to UTC text."""
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)):
        try:
            return datetime.fromtimestamp(value, timezone.utc).isoformat()
        except (OverflowError, OSError, ValueError):
            return None
    return str(value)


@dataclass(frozen=True)
class ArtifactRef:
    """Small immutable reference to a large run input or output artifact."""

    ref_id: str
    kind: str = "artifact"
    uri: str = ""
    media_type: str | None = None
    sha256: str | None = None
    size_bytes: int | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class ProvenanceRef:
    """Reproducibility metadata attached to a Run or Artifact."""

    input_fingerprint: str | None = None
    provider_id: str | None = None
    provider_version: str | None = None
    software_version: str | None = None
    unit_system: str | None = None
    coordinate_system: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class Stage:
    """A stable, ordered unit of work inside a Run."""

    stage_id: str
    operation: str
    status: str = StageStatus.PENDING
    progress: float | None = None
    attempt: int = 0
    input_refs: tuple[ArtifactRef, ...] = ()
    output_refs: tuple[ArtifactRef, ...] = ()
    checkpoint_ref: ArtifactRef | None = None
    metrics: dict[str, Any] = field(default_factory=dict)
    warnings: tuple[str, ...] = ()

    def to_dict(self) -> dict[str, Any]:
        value = asdict(self)
        value["input_refs"] = [ref.to_dict() for ref in self.input_refs]
        value["output_refs"] = [ref.to_dict() for ref in self.output_refs]
        value["checkpoint_ref"] = (
            self.checkpoint_ref.to_dict() if self.checkpoint_ref else None
        )
        value["warnings"] = list(self.warnings)
        return value


@dataclass(frozen=True)
class Checkpoint:
    """Durable resume point for a Run or one of its stages.

    Checkpoint state is intentionally small and JSON-safe.  The actual state
    snapshot is normally represented by ``artifact_ref`` and kept outside the
    run database (for example in the workspace or object storage).
    """

    checkpoint_id: str
    run_id: str
    stage_id: str | None = None
    artifact_ref: ArtifactRef | None = None
    state: str = "ready"
    resume_token: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: str = field(default_factory=_utc_now)
    updated_at: str | None = None

    def to_dict(self) -> dict[str, Any]:
        value = asdict(self)
        value["artifact_ref"] = (
            self.artifact_ref.to_dict() if self.artifact_ref else None
        )
        return value


@dataclass(frozen=True)
class Event:
    """Append-only event in the Run event stream."""

    run_id: str
    sequence: int
    event_type: str
    data: dict[str, Any] = field(default_factory=dict)
    created_at: str = field(default_factory=_utc_now)
    stage_id: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "run_id": self.run_id,
            "sequence": self.sequence,
            "seq": self.sequence,
            "type": self.event_type,
            "data": dict(self.data),
            "created_at": self.created_at,
            "stage_id": self.stage_id,
        }


@dataclass(frozen=True)
class Run:
    """Canonical Run contract shared by platform and domain plugins."""

    run_id: str
    operation: str
    status: str = RunStatus.DRAFT
    project_id: str | None = None
    parent_run_id: str | None = None
    idempotency_key: str | None = None
    provider_id: str | None = None
    provider_version: str | None = None
    phase: str = ""
    progress: float | None = None
    priority: int = 0
    input_snapshot: dict[str, Any] = field(default_factory=dict)
    parameter_schema: dict[str, Any] = field(default_factory=dict)
    unit_system: str | None = None
    stages: tuple[Stage, ...] = ()
    artifacts: tuple[ArtifactRef, ...] = ()
    provenance: ProvenanceRef | None = None
    created_at: str = field(default_factory=_utc_now)
    started_at: str | None = None
    finished_at: str | None = None
    error: dict[str, Any] | None = None

    def to_dict(self) -> dict[str, Any]:
        value = asdict(self)
        value["stages"] = [stage.to_dict() for stage in self.stages]
        value["artifacts"] = [ref.to_dict() for ref in self.artifacts]
        value["provenance"] = self.provenance.to_dict() if self.provenance else None
        return {"contract_version": CONTRACT_VERSION, **value}


TERMINAL_STATUSES = frozenset(
    {
        RunStatus.SUCCEEDED,
        RunStatus.CANCELLED,
        RunStatus.FAILED,
        RunStatus.BLOCKED,
    },
)


def normalize_legacy_status(value: Any) -> str:
    """Map legacy UGSci statuses onto the Run Center vocabulary."""
    status = str(value or "unknown").strip().lower()
    mapped = {
        "completed": RunStatus.SUCCEEDED,
        "success": RunStatus.SUCCEEDED,
        "timeout": RunStatus.FAILED,
        "error": RunStatus.FAILED,
        "interrupted": RunStatus.FAILED,
        "unknown": RunStatus.BLOCKED,
    }.get(status)
    if mapped is not None:
        return mapped
    try:
        RunStatus(status)
    except ValueError:
        return RunStatus.BLOCKED
    return status


def run_summary(
    run_id: str,
    *,
    operation: str,
    status: str,
    payload: dict[str, Any] | None = None,
    source: str = "run-center",
) -> dict[str, Any]:
    """Build the stable summary shape returned by list/detail endpoints."""
    data = payload or {}
    return {
        "contract_version": CONTRACT_VERSION,
        "run_id": run_id,
        "source_run_id": data.get("source_run_id"),
        "operation": operation,
        "status": normalize_legacy_status(status),
        "raw_status": str(status or "unknown"),
        "phase": data.get("phase") or data.get("current_stage") or "",
        "progress": data.get("progress"),
        "project_id": data.get("project_id"),
        "parent_run_id": data.get("parent_run_id"),
        "model_version_id": data.get("model_version_id"),
        "study_id": data.get("study_id"),
        "created_at": _rfc3339(data.get("created_at") or data.get("start_ts")),
        "started_at": _rfc3339(data.get("started_at") or data.get("start_ts")),
        "finished_at": _rfc3339(data.get("finished_at") or data.get("end_ts")),
        "updated_at": _rfc3339(data.get("updated_at")),
        "source": source,
        "error": data.get("error"),
        "provider_id": data.get("provider_id"),
        "provider_version": data.get("provider_version"),
        "idempotency_key": data.get("idempotency_key"),
        "priority": data.get("priority", 0),
        "stages": data.get("stages") or [],
        "artifacts": data.get("artifacts") or [],
        "provenance": data.get("provenance"),
    }
