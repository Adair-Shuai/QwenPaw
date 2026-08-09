# -*- coding: utf-8 -*-
"""Async import job manager with SSE progress reporting.

Jobs run in a background thread pool. Each job reports stage progress
through an event queue that the SSE endpoint consumes.
"""

from __future__ import annotations

import asyncio
import hashlib
import logging
import os
import threading
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

logger = logging.getLogger("qwenpaw").getChild("plugin.oilgas_vis.jobs")

# Single shared executor for all import jobs
_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="oilgas-import")


@dataclass
class JobStage:
    """A single stage in an import job."""
    name: str
    started_at: float = 0.0
    finished_at: float = 0.0
    status: str = "pending"  # pending, running, completed, failed


@dataclass
class ImportJob:
    """State of a single import job."""
    job_id: str
    name: str
    status: str = "queued"  # queued, running, completed, failed, cancelled
    stages: list[JobStage] = field(default_factory=list)
    current_stage: str = ""
    progress: float = 0.0  # 0.0 to 1.0
    error: str | None = None
    result: dict | None = None
    created_at: float = field(default_factory=time.time)
    finished_at: float = 0.0
    # Event queue for SSE
    _events: list[dict] = field(default_factory=list)
    _lock: threading.Lock = field(default_factory=threading.Lock)

    def add_event(self, event_type: str, data: dict | None = None) -> None:
        with self._lock:
            self._events.append({
                "type": event_type,
                "data": data or {},
                "ts": time.time(),
            })

    def drain_events(self) -> list[dict]:
        with self._lock:
            events = list(self._events)
            self._events.clear()
            return events

    def to_dict(self) -> dict:
        return {
            "job_id": self.job_id,
            "name": self.name,
            "status": self.status,
            "current_stage": self.current_stage,
            "progress": self.progress,
            "error": self.error,
            "stages": [
                {
                    "name": s.name,
                    "status": s.status,
                    "duration": (s.finished_at - s.started_at) if s.finished_at else 0,
                }
                for s in self.stages
            ],
            "created_at": self.created_at,
            "finished_at": self.finished_at,
            "result": self.result,
        }


class JobManager:
    """Manages import jobs."""

    def __init__(self) -> None:
        self._jobs: dict[str, ImportJob] = {}
        self._lock = threading.Lock()

    def create_job(self, name: str) -> ImportJob:
        job_id = str(uuid.uuid4())[:8]
        job = ImportJob(job_id=job_id, name=name)
        with self._lock:
            self._jobs[job_id] = job
        job.add_event("created", {"job_id": job_id, "name": name})
        return job

    def get_job(self, job_id: str) -> ImportJob | None:
        return self._jobs.get(job_id)

    def cancel_job(self, job_id: str) -> bool:
        job = self._jobs.get(job_id)
        if job and job.status in ("queued", "running"):
            job.status = "cancelled"
            job.add_event("cancelled", {"job_id": job_id})
            return True
        return False

    def submit_import(
        self,
        name: str,
        upload_path: Path,
        prop_path: Path | None,
        bin_dir: Path,
    ) -> ImportJob:
        """Submit an import job to the thread pool."""
        job = self.create_job(name)

        def _run():
            try:
                job.status = "running"
                job.add_event("started", {"name": name})

                stages = [
                    "validating",
                    "reading-source",
                    "normalizing-coordinates",
                    "extracting-geometry",
                    "writing-properties",
                    "writing-manifest",
                ]
                for stage_name in stages:
                    job.stages.append(JobStage(name=stage_name))
                job.stages[0].status = "running"
                job.current_stage = stages[0]
                job.progress = 0.0
                job.add_event("stage", {"stage": stages[0]})

                # Stage 1: validating
                job.stages[0].started_at = time.time()
                if not upload_path.exists():
                    raise FileNotFoundError(f"Grid file not found: {upload_path}")
                job.stages[0].finished_at = time.time()
                job.stages[0].status = "completed"
                job.progress = 0.15
                job.add_event("stage", {"stage": stages[1]})

                # Stage 2: reading-source + conversion
                job.stages[1].started_at = time.time()
                job.current_stage = stages[1]

                from ..readers.roff import convert_grid_to_binary

                prop_files = {"porosity": str(prop_path)} if prop_path else {}
                job.progress = 0.25
                job.add_event("stage", {"stage": "extracting-geometry"})

                ds_info = convert_grid_to_binary(
                    str(upload_path),
                    prop_files,
                    name,
                    bin_dir,
                )

                job.stages[1].finished_at = time.time()
                job.stages[1].status = "completed"
                job.stages[2].status = "completed"
                job.stages[2].started_at = job.stages[1].started_at
                job.stages[2].finished_at = job.stages[1].finished_at
                job.stages[3].status = "completed"
                job.stages[3].started_at = job.stages[1].started_at
                job.stages[3].finished_at = job.stages[1].finished_at
                job.stages[4].status = "completed"
                job.stages[4].started_at = job.stages[1].started_at
                job.stages[4].finished_at = job.stages[1].finished_at
                job.progress = 0.85
                job.add_event("stage", {"stage": "writing-manifest"})

                # Stage 6: writing-manifest
                job.stages[5].started_at = time.time()
                job.current_stage = "writing-manifest"

                # Atomic manifest update
                from ..api import _update_manifest
                _update_manifest(bin_dir, ds_info)

                job.stages[5].finished_at = time.time()
                job.stages[5].status = "completed"
                job.progress = 1.0
                job.status = "completed"
                job.finished_at = time.time()
                job.result = ds_info
                job.add_event("completed", {"dataset_id": ds_info["id"]})

            except Exception as exc:
                job.status = "failed"
                job.error = str(exc)
                job.finished_at = time.time()
                job.add_event("failed", {"error": str(exc)})
                logger.error("Import job %s failed: %s", job.job_id, exc, exc_info=True)

        _executor.submit(_run)
        return job


# Singleton
job_manager = JobManager()
