# -*- coding: utf-8 -*-
"""Durable run metadata and event repository for FlowForge."""

from __future__ import annotations

import json
import os
import threading
import time
from pathlib import Path
from typing import Any
from uuid import uuid4


class ExecutionRepository:
    """JSON-backed repository; one atomic file per public run id."""

    def __init__(self, root: Path | str) -> None:
        self.root = Path(root) / "executions"
        self.root.mkdir(parents=True, exist_ok=True)
        self._lock = threading.RLock()

    def create(self, run_id: str, flow_id: str, **fields: Any) -> dict[str, Any]:
        record = {
            "run_id": run_id,
            "flow_id": flow_id,
            "state_id": fields.pop("state_id", None),
            "status": fields.pop("status", "queued"),
            "started_at": fields.pop("started_at", None),
            "finished_at": None,
            "node_statuses": {},
            "outputs": {},
            "errors": [],
            "error": None,
            "duration_ms": 0,
            "execution_history": [],
            "events": [],
            **fields,
        }
        self.save(record)
        return record

    def get(self, run_id: str) -> dict[str, Any] | None:
        path = self._path(run_id)
        if not path.is_file():
            return None
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return None

    def update(self, run_id: str, **changes: Any) -> dict[str, Any] | None:
        with self._lock:
            record = self.get(run_id)
            if record is None:
                return None
            record.update(changes)
            self.save(record)
            return record

    def append_event(self, run_id: str, event: dict[str, Any]) -> None:
        with self._lock:
            record = self.get(run_id)
            if record is None:
                return
            record.setdefault("events", []).append(event)
            state = event.get("state") or {}
            node_id = event.get("node_id")
            if node_id and state.get("status"):
                record.setdefault("node_statuses", {})[node_id] = state["status"]
            self.save(record)

    def list(self) -> list[dict[str, Any]]:
        records = [
            record
            for path in self.root.glob("*.json")
            if (record := self.get(path.stem)) is not None
        ]
        return sorted(
            records, key=lambda item: item.get("started_at") or 0, reverse=True,
        )

    def recover_incomplete(self, *, active_owner_pid: int | None = None) -> int:
        """Mark process-local runs left behind by a crash as failed."""
        recovered = 0
        for record in self.list():
            if record.get("status") not in {"queued", "running"}:
                continue
            if (
                active_owner_pid is not None
                and record.get("owner_pid") == active_owner_pid
            ):
                # Another service instance in this same live process may
                # still own the run during hot reload/startup overlap.
                continue
            record.update(
                {
                    "status": "failed",
                    "finished_at": time.time(),
                    "error": "FlowForge process stopped before the run completed",
                    "errors": [
                        "FlowForge process stopped before the run completed",
                    ],
                },
            )
            self.save(record)
            recovered += 1
        return recovered

    def save(self, record: dict[str, Any]) -> None:
        run_id = str(record["run_id"])
        path = self._path(run_id)
        # Repository instances can overlap briefly during a service restart.
        # A fixed ``<run>.tmp`` name lets one instance replace/delete another
        # instance's temporary file. A unique sidecar preserves atomic writes
        # without requiring a process-global lock.
        temporary = path.with_name(f".{path.name}.{uuid4().hex}.tmp")
        payload = json.dumps(record, ensure_ascii=False, default=str, indent=2)
        with self._lock:
            try:
                temporary.write_text(payload, encoding="utf-8")
                os.replace(temporary, path)
            finally:
                temporary.unlink(missing_ok=True)

    def _path(self, run_id: str) -> Path:
        safe = "".join(char if char.isalnum() or char in "-_." else "_" for char in run_id)
        return self.root / f"{safe}.json"


__all__ = ["ExecutionRepository"]
