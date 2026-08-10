# -*- coding: utf-8 -*-
"""Job state models (separate from manager to avoid circular imports)."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class StageInfo:
    """A single stage in an import job."""
    name: str
    started_at: float = 0.0
    finished_at: float = 0.0
    status: str = "pending"  # pending, running, completed, failed

    @property
    def duration(self) -> float:
        return (self.finished_at - self.started_at) if self.finished_at else 0.0


@dataclass
class JobMetrics:
    """Runtime metrics collected during an import job."""
    peak_rss_mb: float = 0.0
    input_bytes: int = 0
    output_bytes: int = 0
    cell_count: int = 0
    triangle_count: int = 0
    well_count: int = 0
    time_step_count: int = 0
    cache_hit: bool = False


@dataclass
class JobResult:
    """Final result of a completed job."""
    dataset_info: dict[str, Any] | None = None
    metrics: JobMetrics = field(default_factory=JobMetrics)
    warnings: list[str] = field(default_factory=list)
    error_code: str | None = None
