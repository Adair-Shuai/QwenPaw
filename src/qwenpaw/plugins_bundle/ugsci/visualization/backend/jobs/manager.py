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

_ECLIPSE_GRID_EXTENSIONS = {".egrid", ".grid", ".grdecl"}

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
    native_run_id: str | None = None
    # Event queue for SSE
    _events: list[dict] = field(default_factory=list)
    _lock: threading.Lock = field(default_factory=threading.Lock)

    def add_event(self, event_type: str, data: dict | None = None) -> None:
        """Append an event to the live queue and durable UGSci job store.

        Import jobs historically lived only in this process.  Persisting the
        same compact snapshot and append-only event in ``jobs.sqlite3`` keeps
        the old ``/imports`` API intact while allowing Run Center to expose
        the job after a backend restart.
        """
        event = {
            "type": event_type,
            "data": data or {},
            "ts": time.time(),
        }
        with self._lock:
            if self.status == "cancelled" and event_type != "cancelled":
                return
            self._events.append(event)
            snapshot = self._store_payload_locked()
            # Serialize persistence with state mutation.  A concurrent
            # cancellation must never be followed by a stale worker snapshot.
            _persist_import_job(self.job_id, snapshot, event)

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
                    "started_at": s.started_at,
                    "finished_at": s.finished_at,
                    "duration": (s.finished_at - s.started_at) if s.finished_at else 0,
                }
                for s in self.stages
            ],
            "created_at": self.created_at,
            "finished_at": self.finished_at,
            "result": self.result,
        }

    def _store_payload_locked(self) -> dict[str, Any]:
        """Build the JSON-only payload written to the shared job store."""
        value = self.to_dict()
        value.update({
            "operation": "visualization.import",
            "provider_id": "ugsci.visualization",
            "job_type": "visualization_import",
        })
        if self.native_run_id:
            value["native_run_id"] = self.native_run_id
        return value

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> "ImportJob":
        """Rehydrate an import job persisted by a previous worker process."""
        def _number(value: Any, default: float = 0.0) -> float:
            try:
                return float(value)
            except (TypeError, ValueError, OverflowError):
                return default

        stages: list[JobStage] = []
        for raw in payload.get("stages") or []:
            if not isinstance(raw, dict):
                continue
            stages.append(JobStage(
                name=str(raw.get("name") or ""),
                started_at=_number(raw.get("started_at")),
                finished_at=_number(raw.get("finished_at")),
                status=str(raw.get("status") or "pending"),
            ))
        return cls(
            job_id=str(payload.get("job_id") or ""),
            name=str(payload.get("name") or "import"),
            status=str(payload.get("status") or "failed"),
            stages=stages,
            current_stage=str(payload.get("current_stage") or ""),
            progress=_number(payload.get("progress")),
            error=payload.get("error"),
            result=payload.get("result") if isinstance(payload.get("result"), dict) else None,
            created_at=_number(payload.get("created_at"), time.time()),
            finished_at=_number(payload.get("finished_at")),
            native_run_id=(str(payload.get("native_run_id")) if payload.get("native_run_id") else None),
        )


def _job_store():
    """Load the simulation job store lazily (and tolerate standalone tests)."""
    try:
        from ....engine.tools import job_store
        return job_store
    except Exception:  # pragma: no cover - optional host integration
        return None


def _persist_import_job(
    job_id: str,
    payload: dict[str, Any],
    event: dict[str, Any] | None = None,
) -> None:
    store = _job_store()
    if store is None:
        return
    try:
        store.save_job(job_id, payload)
        if event is not None:
            store.append_job_event_if_changed(job_id, event)
    except Exception:  # pragma: no cover - persistence must not break imports
        logger.warning("Failed to persist visualization import job %s", job_id, exc_info=True)


class JobManager:
    """Manages import jobs."""

    def __init__(self) -> None:
        self._jobs: dict[str, ImportJob] = {}
        self._lock = threading.Lock()

    def _prune_finished_locked(self) -> None:
        """Bound the in-memory job registry during long-running sessions."""
        cutoff = time.time() - 3600
        stale = [
            job_id for job_id, job in self._jobs.items()
            if job.status in ("completed", "failed", "cancelled")
            and job.finished_at and job.finished_at < cutoff
        ]
        for job_id in stale:
            self._jobs.pop(job_id, None)
        if len(self._jobs) <= 1000:
            return
        finished = sorted(
            (job for job in self._jobs.values()
             if job.status in ("completed", "failed", "cancelled")),
            key=lambda item: item.finished_at or item.created_at,
        )
        for job in finished[: max(0, len(self._jobs) - 1000)]:
            self._jobs.pop(job.job_id, None)

    def create_job(self, name: str) -> ImportJob:
        job_id = str(uuid.uuid4())[:8]
        job = ImportJob(job_id=job_id, name=name)
        with self._lock:
            self._prune_finished_locked()
            self._jobs[job_id] = job
        job.add_event("created", {"job_id": job_id, "name": name})
        return job

    def get_job(self, job_id: str) -> ImportJob | None:
        with self._lock:
            self._prune_finished_locked()
            job = self._jobs.get(job_id)
            if job is not None:
                return job
            # Rehydrate durable visualization imports after a process restart.
            # Keep this under the manager lock so concurrent GET/SSE requests
            # cannot create two objects or append duplicate interruption events.
            store = _job_store()
            if store is None:
                return None
            try:
                payload = store.load_job(job_id)
            except Exception:  # pragma: no cover - optional host integration
                return None
            if (
                not isinstance(payload, dict)
                or payload.get("job_type") != "visualization_import"
            ):
                return None
            job = ImportJob.from_dict(payload)
            try:
                for item in store.list_job_events(job_id):
                    event = item.get("data") if isinstance(item, dict) else None
                    if isinstance(event, dict):
                        job._events.append(event)
            except Exception:
                logger.debug(
                    "Failed to restore events for visualization import %s",
                    job_id,
                    exc_info=True,
                )
            if job.status in {"queued", "running"} and not job.native_run_id:
                job.status = "failed"
                job.error = "Import interrupted by backend restart"
                job.finished_at = time.time()
                event = {
                    "type": "failed",
                    "data": {"error": job.error, "reason": "backend_restart"},
                    "ts": job.finished_at,
                }
                job._events.append(event)
                _persist_import_job(
                    job.job_id,
                    job._store_payload_locked(),
                    event,
                )
            self._jobs[job_id] = job
        return job

    def cancel_job(self, job_id: str) -> bool:
        with self._lock:
            job = self._jobs.get(job_id)
        if not job:
            return False
        with job._lock:
            if job.status not in ("queued", "running"):
                return False
            job.status = "cancelled"
            job.finished_at = time.time()
            event = {
                "type": "cancelled", "data": {"job_id": job_id}, "ts": time.time(),
            }
            job._events.append(event)
            snapshot = job._store_payload_locked()
            _persist_import_job(job.job_id, snapshot, event)
        return True

    def submit_import(
        self,
        name: str,
        upload_path: Path,
        prop_path: Path | None,
        bin_dir: Path,
        companion_paths: list[Path] | None = None,
        *,
        _existing_job: ImportJob | None = None,
        _force_legacy: bool = False,
        _execute_sync: bool = False,
    ) -> ImportJob:
        """Submit an import job to the thread pool."""
        job = _existing_job or self.create_job(name)
        companion_paths = list(companion_paths or [])

        # Once Run Center is available, it owns the durable lifecycle.  The
        # legacy ImportJob remains the compatibility projection consumed by
        # the existing visualization API and SSE endpoint.
        if not _force_legacy and _existing_job is None:
            try:
                from ....engine.tools.run_center_bridge import create_import_run

                native = create_import_run(
                    run_id=job.job_id,
                    name=name,
                    upload_path=upload_path,
                    prop_path=prop_path,
                    bin_dir=bin_dir,
                    companion_paths=companion_paths,
                )
                if native is not None:
                    with job._lock:
                        job.native_run_id = job.job_id
                    job.add_event("submitted", {"run_id": job.job_id, "operation": "visualization.import"})
                    return job
            except Exception as exc:
                logger.warning("Falling back to legacy visualization import: %s", exc)

        def _run():
            try:
                with job._lock:
                    if job.status == "cancelled":
                        return
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
                with job._lock:
                    if job.status == "cancelled":
                        return
                    for stage_name in stages:
                        job.stages.append(JobStage(name=stage_name))
                    job.stages[0].status = "running"
                    job.stages[0].started_at = time.time()
                    job.current_stage = stages[0]
                    job.progress = 0.0
                job.add_event("stage", {"stage": stages[0]})

                # Stage 1: validating
                if not upload_path.exists():
                    raise FileNotFoundError(f"Grid file not found: {upload_path}")
                with job._lock:
                    if job.status == "cancelled":
                        return
                    job.stages[0].finished_at = time.time()
                    job.stages[0].status = "completed"
                    job.stages[1].started_at = time.time()
                    job.current_stage = stages[1]
                    job.progress = 0.15
                job.add_event("stage", {"stage": stages[1]})

                # Stage 2: reading-source + conversion
                with job._lock:
                    if job.status == "cancelled":
                        return
                    job.progress = 0.25
                job.add_event("stage", {"stage": "extracting-geometry"})

                with job._lock:
                    if job.status == "cancelled":
                        job.finished_at = job.finished_at or time.time()
                        return

                from ..formats import convert_source

                ds_info = convert_source(
                    upload_path,
                    name,
                    bin_dir,
                    companions=[
                        candidate
                        for candidate in [prop_path, *companion_paths]
                        if candidate is not None
                    ],
                    options={
                        "property_path": str(prop_path) if prop_path else None,
                    },
                )

                with job._lock:
                    if job.status == "cancelled":
                        job.finished_at = job.finished_at or time.time()
                        return

                ds_info.setdefault("metadata", {})["managed"] = True

                with job._lock:
                    if job.status == "cancelled":
                        job.finished_at = job.finished_at or time.time()
                        return
                    conversion_finished_at = time.time()
                    job.stages[1].finished_at = conversion_finished_at
                    job.stages[1].status = "completed"
                    for stage in job.stages[2:5]:
                        stage.status = "completed"
                        stage.started_at = job.stages[1].started_at
                        stage.finished_at = conversion_finished_at
                    job.stages[5].started_at = time.time()
                    job.current_stage = "writing-manifest"
                    job.progress = 0.85
                job.add_event("stage", {"stage": "writing-manifest"})

                # Stage 6: writing-manifest
                # Treat manifest publication and the terminal state update as
                # one commit section.  If cancellation wins the lock first,
                # no manifest is written.  Once publication starts, a
                # concurrent cancel waits and then observes ``completed``
                # instead of reporting a cancellation that did not take
                # effect.
                from ..api import _update_manifest
                related = list(ds_info.get("related_datasets") or [])
                primary = {key: value for key, value in ds_info.items() if key != "related_datasets"}
                with job._lock:
                    if job.status == "cancelled":
                        job.finished_at = job.finished_at or time.time()
                        return
                    _update_manifest(bin_dir, primary)
                    for extra in related:
                        extra.setdefault("metadata", {})["managed"] = True
                        extra.setdefault("metadata", {})["parent_dataset"] = primary.get("id")
                        _update_manifest(bin_dir, extra)
                    job.stages[5].finished_at = time.time()
                    job.stages[5].status = "completed"
                    job.progress = 1.0
                    job.status = "completed"
                    job.finished_at = time.time()
                    job.result = {**primary, "related_datasets": related}
                job.add_event("completed", {
                    "dataset_id": primary["id"],
                    "related_ids": [item.get("id") for item in related],
                })

            except Exception as exc:
                with job._lock:
                    # Preserve an explicit cancellation if the converter
                    # raises after cancel_job() has already marked the job.
                    if job.status == "cancelled":
                        job.finished_at = job.finished_at or time.time()
                        return
                    job.status = "failed"
                    job.error = str(exc)
                    job.finished_at = time.time()
                job.add_event("failed", {"error": str(exc)})
                logger.error("Import job %s failed: %s", job.job_id, exc, exc_info=True)
            finally:
                for candidate in (upload_path, prop_path, *companion_paths):
                    if candidate and candidate.name.startswith(".upload_"):
                        try:
                            candidate.unlink(missing_ok=True)
                        except OSError:
                            logger.warning("Failed to remove upload temp file %s", candidate)

        if _execute_sync:
            _run()
        else:
            _executor.submit(_run)
        return job


def _find_companion(
    upload_path: Path,
    extra_paths: Path | None | list[Path | None],
    suffixes: set[str],
) -> Path | None:
    """Resolve a case-insensitive companion from upload or local siblings.

    ``property_file`` is accepted as a generic companion slot for API clients
    that upload INIT/UNRST together with their grid. Existing ROFF property
    uploads are unaffected because callers pass format-specific suffix sets.
    """
    from ..formats import _request_types

    _, _, _, find_companion = _request_types()
    return find_companion(upload_path, extra_paths, suffixes)


# Singleton
job_manager = JobManager()
