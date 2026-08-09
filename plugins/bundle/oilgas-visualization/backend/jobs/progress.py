# -*- coding: utf-8 -*-
"""Progress reporter for import jobs.

Provides a callback interface that the job manager calls to report
progress to the SSE stream and any listening subscribers.
"""

from __future__ import annotations

import time
from typing import Any, Callable

from .models import StageInfo


class ProgressReporter:
    """Reports progress through a callback chain.

    The job manager creates one reporter per job, and the reader
    calls report() at each stage transition.
    """

    def __init__(self, job_id: str, emit_callback: Callable[[str, dict], None]):
        self.job_id = job_id
        self._emit = emit_callback
        self._stages: list[StageInfo] = []
        self._current_stage: StageInfo | None = None

    def start_stage(self, name: str) -> None:
        """Begin a new stage."""
        if self._current_stage:
            self._current_stage.finished_at = time.time()
            self._current_stage.status = "completed"

        stage = StageInfo(name=name, started_at=time.time(), status="running")
        self._stages.append(stage)
        self._current_stage = stage
        self._emit("stage", {"stage": name, "progress": self.progress})

    def finish_stage(self, **kwargs: Any) -> None:
        """Finish the current stage with optional metrics."""
        if self._current_stage:
            self._current_stage.finished_at = time.time()
            self._current_stage.status = "completed"
            self._emit("stage-completed", {
                "stage": self._current_stage.name,
                "duration": self._current_stage.duration,
                **kwargs,
            })

    def report_error(self, stage: str, error: str) -> None:
        """Report an error in a stage."""
        if self._current_stage:
            self._current_stage.status = "failed"
            self._current_stage.finished_at = time.time()
        self._emit("error", {"stage": stage, "error": error})

    @property
    def progress(self) -> float:
        """Approximate progress 0.0 to 1.0."""
        if not self._stages:
            return 0.0
        total = len(self._stages)
        completed = sum(1 for s in self._stages if s.status == "completed")
        return completed / total if total > 0 else 0.0

    @property
    def stages(self) -> list[StageInfo]:
        return list(self._stages)
