# -*- coding: utf-8 -*-
"""Job metadata persistence for UGSci simulation tools.

Stores job metadata (excluding process handles) as a JSON file so that
simulation jobs survive QwenPaw service restarts.  After restart, tools
can recover job metadata and check process liveness via PID.

This module has **zero dependencies** on QwenPaw internals — it only
uses the standard library, avoiding coupling to internal module paths
that may change between releases.
"""
from __future__ import annotations

import json
import logging
import os
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.sim")

# Lock for thread-safe file access
_lock = threading.Lock()

# Default store location: ~/.qwenpaw/ugsci/jobs.json
_STORE_FILE = Path.home() / ".qwenpaw" / "ugsci" / "jobs.json"

# Maximum number of jobs to keep in the store (oldest are pruned)
_MAX_STORED_JOBS = 200


def _load_store() -> dict[str, dict[str, Any]]:
    """Load the job store from disk. Returns empty dict on error."""
    try:
        if _STORE_FILE.is_file():
            data = json.loads(_STORE_FILE.read_text(encoding="utf-8"))
            if isinstance(data, dict):
                return data
    except Exception as exc:
        logger.warning("Failed to load job store: %s", exc)
    return {}


def _save_store(store: dict[str, dict[str, Any]]) -> None:
    """Save the job store to disk."""
    try:
        _STORE_FILE.parent.mkdir(parents=True, exist_ok=True)
        _STORE_FILE.write_text(
            json.dumps(store, indent=2, ensure_ascii=False, default=str),
            encoding="utf-8",
        )
    except Exception as exc:
        logger.warning("Failed to save job store: %s", exc)


def save_job(job_id: str, meta: dict[str, Any]) -> None:
    """Save or update a job's metadata.

    Args:
        job_id: Unique job identifier.
        meta: Metadata dict (must be JSON-serializable).
    """
    with _lock:
        store = _load_store()
        meta["updated_at"] = datetime.now(timezone.utc).isoformat()
        store[job_id] = meta
        # Prune old entries if exceeding limit
        if len(store) > _MAX_STORED_JOBS:
            sorted_items = sorted(
                store.items(),
                key=lambda x: x[1].get("updated_at", ""),
            )
            store = dict(sorted_items[-_MAX_STORED_JOBS:])
        _save_store(store)


def load_job(job_id: str) -> Optional[dict[str, Any]]:
    """Load a job's metadata. Returns None if not found."""
    with _lock:
        store = _load_store()
        return store.get(job_id)


def update_job_status(
    job_id: str,
    status: str,
    *,
    returncode: Optional[int] = None,
    error: Optional[str] = None,
    end_ts: Optional[float] = None,
) -> None:
    """Update specific fields of a job's metadata.

    Non-existent job_id is silently ignored (the job may have been
    pruned or the store may be corrupted).
    """
    with _lock:
        store = _load_store()
        job = store.get(job_id)
        if not job:
            return
        job["status"] = status
        if returncode is not None:
            job["returncode"] = returncode
        if error is not None:
            job["error"] = error
        if end_ts is not None:
            job["end_ts"] = end_ts
        job["updated_at"] = datetime.now(timezone.utc).isoformat()
        _save_store(store)


def list_jobs() -> dict[str, dict[str, Any]]:
    """Return all stored job metadata."""
    with _lock:
        return _load_store()


def remove_job(job_id: str) -> None:
    """Remove a job from the store."""
    with _lock:
        store = _load_store()
        store.pop(job_id, None)
        _save_store(store)


def is_pid_alive(pid: int) -> bool:
    """Check if a process with the given PID is still running.

    Cross-platform: uses ctypes on Windows, os.kill(0) on Unix.
    Returns False for invalid PIDs or on any error.
    """
    if pid <= 0:
        return False
    try:
        if os.name == "nt":
            # Windows: use ctypes to check process existence
            import ctypes

            kernel32 = ctypes.windll.kernel32
            SYNCHRONIZE = 0x00100000
            handle = kernel32.OpenProcess(SYNCHRONIZE, False, pid)
            if handle:
                kernel32.CloseHandle(handle)
                return True
            return False
        else:
            # Unix: signal 0 checks process existence without sending a signal
            os.kill(pid, 0)
            return True
    except ProcessLookupError:
        return False
    except PermissionError:
        # Process exists but we lack permission to signal it
        return True
    except Exception:
        return False
