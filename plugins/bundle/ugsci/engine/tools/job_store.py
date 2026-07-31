# -*- coding: utf-8 -*-
"""Job metadata persistence for UGSci simulation tools.

Stores job metadata (excluding process handles) as a JSON file so that
simulation jobs survive QwenPaw service restarts.  After restart, tools
can recover job metadata and check process liveness via PID.

This module has minimal coupling to QwenPaw internals — it imports
``WORKING_DIR`` lazily (at call time, not import time) so the module
remains importable in standalone contexts.  The store file is placed
under QwenPaw's formal working directory (``WORKING_DIR``) rather than
a hardcoded ``~/.qwenpaw`` path (BUG-012).
"""
from __future__ import annotations

import json
import logging
import os
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.sim")

# Lock for thread-safe file access
_lock = threading.Lock()

# Maximum number of jobs to keep in the store (oldest are pruned)
_MAX_STORED_JOBS = 200


def _store_file() -> Path:
    """Return the job store file path under QwenPaw's WORKING_DIR.

    Uses ``qwenpaw.constant.WORKING_DIR`` which respects
    ``QWENPAW_WORKING_DIR`` env var and the ``~/.copaw`` legacy path.
    Falls back to ``~/.qwenpaw`` if the constant is unavailable.
    """
    try:
        from qwenpaw.constant import WORKING_DIR

        base = Path(WORKING_DIR)
    except Exception:
        base = Path.home() / ".qwenpaw"
    return base / "ugsci" / "jobs.json"


def _load_store() -> dict[str, dict[str, Any]]:
    """Load the job store from disk. Returns empty dict on error."""
    try:
        store_file = _store_file()
        if store_file.is_file():
            data = json.loads(store_file.read_text(encoding="utf-8"))
            if isinstance(data, dict):
                return data
    except Exception as exc:
        logger.warning("Failed to load job store: %s", exc)
    return {}


def _save_store(store: dict[str, dict[str, Any]]) -> None:
    """Save the job store to disk (atomic write via tmp + os.replace)."""
    store_file = _store_file()
    store_file.parent.mkdir(parents=True, exist_ok=True)
    tmp = store_file.with_suffix(".tmp")
    try:
        tmp.write_text(
            json.dumps(store, indent=2, ensure_ascii=False, default=str),
            encoding="utf-8",
        )
        os.replace(tmp, store_file)
    except Exception as exc:
        logger.warning("Failed to save job store: %s", exc)
        if tmp.exists():
            tmp.unlink(missing_ok=True)


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


def load_job(job_id: str) -> dict[str, Any] | None:
    """Load a job's metadata. Returns None if not found."""
    with _lock:
        store = _load_store()
        return store.get(job_id)


def update_job_status(
    job_id: str,
    status: str,
    *,
    returncode: int | None = None,
    error: str | None = None,
    end_ts: float | None = None,
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


def is_pid_ours(
    pid: int,
    expected_start_ts: float,
    deck_file: str = "",
) -> bool:
    """Check whether *pid* still belongs to our simulation process.

    Used during job recovery to detect PID reuse: after a service restart
    the original process may have died and the OS may have recycled the
    PID for an unrelated process.  If we cannot confirm identity we
    return ``False`` so the caller marks the job as ``interrupted``
    rather than trusting a stale PID (BUG-007).

    Identity is established by checking that the process's command line
    contains the deck file basename.  This is a heuristic — it may
    return ``False`` for very short-lived processes or when ``ps`` is
    unavailable, but it never produces false positives.

    Args:
        pid: Process ID to verify.
        expected_start_ts: Wall-clock start time of the original job
            (unused on some platforms but kept for future extensions).
        deck_file: Path to the simulation deck file — its basename is
            searched for in the process command line.

    Returns:
        ``True`` if the PID appears to be our process, ``False`` if the
        PID has been reused or identity cannot be confirmed.
    """
    if pid <= 0:
        return False
    if not is_pid_alive(pid):
        return False

    # Build a search token from the deck file basename.
    import os as _os
    search_token = ""
    if deck_file:
        search_token = _os.path.basename(deck_file)
    if not search_token:
        # Without a token we cannot confirm identity.
        return False

    try:
        if _os.name == "nt":
            # Windows: use wmic to get the command line.
            import subprocess

            result = subprocess.run(
                [
                    "wmic", "process", "where",
                    f"ProcessId={pid}",
                    "get", "CommandLine", "/value",
                ],
                capture_output=True,
                text=True,
                timeout=5,
            )
            cmdline = result.stdout
        else:
            # Unix: read /proc/{pid}/cmdline (Linux) or use ps (macOS/BSD).
            proc_cmdline = Path(f"/proc/{pid}/cmdline")
            if proc_cmdline.is_file():
                raw = proc_cmdline.read_bytes()
                cmdline = raw.replace(b"\x00", b" ").decode(
                    "utf-8", errors="replace",
                )
            else:
                import subprocess

                result = subprocess.run(
                    ["ps", "-p", str(pid), "-o", "command="],
                    capture_output=True,
                    text=True,
                    timeout=5,
                )
                cmdline = result.stdout
    except Exception:
        # Cannot confirm identity — be safe.
        return False

    return search_token in cmdline


def is_pid_alive(pid: int) -> bool:
    """Check if a process with the given PID is still running.

    Cross-platform: uses ctypes on Windows, os.kill(0) on Unix.
    Returns False for invalid PIDs or on any error.
    """
    if pid <= 0:
        return False
    try:
        if os.name == "nt":
            # Windows: use ctypes to check process existence.
            # On 64-bit systems, HANDLE is a 64-bit pointer — we must
            # set restype/argtypes to avoid truncation (default c_int
            # is only 32 bits).
            import ctypes

            kernel32 = ctypes.windll.kernel32
            kernel32.OpenProcess.restype = ctypes.c_void_p
            kernel32.CloseHandle.argtypes = [ctypes.c_void_p]
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
