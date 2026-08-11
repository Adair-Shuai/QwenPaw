# -*- coding: utf-8 -*-
"""Durable, multi-process-safe storage for UGSci simulation jobs."""
from __future__ import annotations

import json
import logging
import os
import sqlite3
import time
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.sim")

_MAX_STORED_JOBS = 200
_MAX_EVENTS_PER_JOB = 100
DEFAULT_WAKE_LEASE_SECONDS = 20 * 60


def _store_file() -> Path:
    """Return the legacy JSON path (also used to locate the SQLite DB)."""
    try:
        from qwenpaw.constant import WORKING_DIR

        base = Path(WORKING_DIR)
    except Exception:
        base = Path.home() / ".qwenpaw"
    return base / "ugsci" / "jobs.json"


def _database_file() -> Path:
    return _store_file().with_name("jobs.sqlite3")


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _decode_payload(raw: str | bytes | None) -> dict[str, Any]:
    if not raw:
        return {}
    try:
        value = json.loads(raw)
    except (TypeError, json.JSONDecodeError):
        return {}
    return value if isinstance(value, dict) else {}


@contextmanager
def _connection(*, write: bool = False) -> Iterator[sqlite3.Connection]:
    db_file = _database_file()
    db_file.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_file, timeout=30, isolation_level=None)
    conn.row_factory = sqlite3.Row
    try:
        conn.execute("PRAGMA busy_timeout=30000")
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA synchronous=NORMAL")
        conn.execute(
            "CREATE TABLE IF NOT EXISTS jobs ("
            "job_id TEXT PRIMARY KEY, payload TEXT NOT NULL, "
            "updated_at TEXT NOT NULL)"
        )
        conn.execute(
            "CREATE TABLE IF NOT EXISTS job_events ("
            "job_id TEXT NOT NULL, sequence INTEGER NOT NULL, "
            "payload TEXT NOT NULL, created_at TEXT NOT NULL, "
            "PRIMARY KEY(job_id, sequence))"
        )
        if write:
            conn.execute("BEGIN IMMEDIATE")
        yield conn
        if write:
            conn.execute("COMMIT")
    except Exception:
        if write:
            try:
                conn.execute("ROLLBACK")
            except sqlite3.Error:
                pass
        raise
    finally:
        conn.close()


def _migrate_legacy_json_if_needed(conn: sqlite3.Connection) -> None:
    count = int(conn.execute("SELECT COUNT(*) FROM jobs").fetchone()[0])
    legacy = _store_file()
    if count or not legacy.is_file():
        return
    try:
        raw = json.loads(legacy.read_text(encoding="utf-8"))
        if not isinstance(raw, dict):
            return
        for job_id, payload in raw.items():
            if not isinstance(job_id, str) or not isinstance(payload, dict):
                continue
            updated_at = str(payload.get("updated_at") or _utc_now_iso())
            conn.execute(
                "INSERT OR IGNORE INTO jobs(job_id, payload, updated_at) "
                "VALUES (?, ?, ?)",
                (job_id, json.dumps(payload, ensure_ascii=False, default=str), updated_at),
            )
        # Commit the imported rows before archiving the source.  File rename
        # and SQLite cannot share one transaction; this ordering prevents a
        # later caller failure from rolling back the DB after jobs.json was
        # already moved away.
        conn.execute("COMMIT")
        try:
            archive = legacy.with_name(f"{legacy.name}.migrated")
            if archive.exists():
                archive = legacy.with_name(
                    f"{legacy.name}.migrated.{int(time.time())}"
                )
            os.replace(legacy, archive)
        except OSError as exc:
            logger.warning("Migrated jobs but could not archive %s: %s", legacy, exc)
        finally:
            conn.execute("BEGIN IMMEDIATE")
        logger.info("Migrated %d UGSci jobs from JSON to SQLite", len(raw))
    except Exception as exc:
        logger.warning("Failed to migrate legacy UGSci job store: %s", exc)


def _write_payload(
    conn: sqlite3.Connection,
    job_id: str,
    payload: dict[str, Any],
) -> None:
    updated_at = _utc_now_iso()
    payload["updated_at"] = updated_at
    conn.execute(
        "INSERT INTO jobs(job_id, payload, updated_at) VALUES (?, ?, ?) "
        "ON CONFLICT(job_id) DO UPDATE SET payload=excluded.payload, "
        "updated_at=excluded.updated_at",
        (job_id, json.dumps(payload, ensure_ascii=False, default=str), updated_at),
    )


def _load_payload_for_update(
    conn: sqlite3.Connection,
    job_id: str,
) -> dict[str, Any] | None:
    row = conn.execute(
        "SELECT payload FROM jobs WHERE job_id=?",
        (job_id,),
    ).fetchone()
    return _decode_payload(row["payload"]) if row else None


def _prune(conn: sqlite3.Connection) -> None:
    rows = conn.execute(
        "SELECT job_id, payload FROM jobs ORDER BY updated_at DESC"
    ).fetchall()
    if len(rows) <= _MAX_STORED_JOBS:
        return
    terminal = []
    for row in reversed(rows):
        payload = _decode_payload(row["payload"])
        if payload.get("status") != "running":
            terminal.append(row["job_id"])
    remove_count = len(rows) - _MAX_STORED_JOBS
    for job_id in terminal[:remove_count]:
        conn.execute("DELETE FROM job_events WHERE job_id=?", (job_id,))
        conn.execute("DELETE FROM jobs WHERE job_id=?", (job_id,))


def save_job(job_id: str, meta: dict[str, Any]) -> None:
    with _connection(write=True) as conn:
        _migrate_legacy_json_if_needed(conn)
        _write_payload(conn, job_id, dict(meta))
        _prune(conn)


def load_job(job_id: str) -> dict[str, Any] | None:
    try:
        with _connection(write=True) as conn:
            _migrate_legacy_json_if_needed(conn)
            return _load_payload_for_update(conn, job_id)
    except (sqlite3.Error, OSError) as exc:
        logger.warning("Failed to load UGSci job %s: %s", job_id, exc)
        return None


def update_job_status(
    job_id: str,
    status: str,
    *,
    returncode: int | None = None,
    error: str | None = None,
    end_ts: float | None = None,
) -> None:
    fields: dict[str, Any] = {"status": status}
    if returncode is not None:
        fields["returncode"] = returncode
    if error is not None:
        fields["error"] = error
    if end_ts is not None:
        fields["end_ts"] = end_ts
    update_job_fields(job_id, **fields)


def update_job_fields(job_id: str, **fields: Any) -> None:
    with _connection(write=True) as conn:
        _migrate_legacy_json_if_needed(conn)
        payload = _load_payload_for_update(conn, job_id)
        if payload is None:
            return
        payload.update(fields)
        _write_payload(conn, job_id, payload)


def claim_terminal_notification(job_id: str) -> bool:
    with _connection(write=True) as conn:
        _migrate_legacy_json_if_needed(conn)
        payload = _load_payload_for_update(conn, job_id)
        if payload is None or payload.get("terminal_notified"):
            return False
        payload["terminal_notified"] = True
        _write_payload(conn, job_id, payload)
        return True


def claim_wake_attempt(
    job_id: str,
    *,
    max_attempts: int = 3,
    lease_seconds: float = DEFAULT_WAKE_LEASE_SECONDS,
) -> tuple[bool, int, str]:
    """Claim one idempotent agent-resume attempt with a stale lease."""
    now = time.time()
    with _connection(write=True) as conn:
        _migrate_legacy_json_if_needed(conn)
        payload = _load_payload_for_update(conn, job_id)
        if payload is None:
            return False, 0, ""
        run_key = str(payload.get("wake_run_key") or f"simulation:{job_id}:terminal")
        status = str(payload.get("wake_status") or "pending")
        try:
            attempts = int(payload.get("wake_attempts") or 0)
        except (TypeError, ValueError, OverflowError):
            attempts = 0
        try:
            claimed_at = float(payload.get("wake_claimed_ts") or 0)
        except (TypeError, ValueError, OverflowError):
            claimed_at = 0.0
        if status == "completed" or attempts >= max_attempts:
            return False, attempts, run_key
        if status == "running" and now - claimed_at < lease_seconds:
            return False, attempts, run_key
        attempts += 1
        payload.update(
            wake_run_key=run_key,
            wake_status="running",
            wake_attempts=attempts,
            wake_claimed_ts=now,
            wake_error=None,
        )
        _write_payload(conn, job_id, payload)
        return True, attempts, run_key


def finish_wake_attempt(
    job_id: str,
    *,
    success: bool,
    run_id: str | None = None,
    error: str | None = None,
    retryable: bool = True,
    attempt: int | None = None,
) -> bool:
    """Finish a wake lease, ignoring stale workers after lease expiry."""
    with _connection(write=True) as conn:
        _migrate_legacy_json_if_needed(conn)
        payload = _load_payload_for_update(conn, job_id)
        if payload is None:
            return False
        if attempt is not None:
            try:
                current_attempt = int(payload.get("wake_attempts") or 0)
            except (TypeError, ValueError, OverflowError):
                return False
            if current_attempt != attempt or payload.get("wake_status") != "running":
                return False
        payload.update(
            wake_status="completed" if success else ("pending" if retryable else "failed"),
            wake_completed_ts=time.time() if success else None,
            wake_run_id=run_id,
            wake_error=error,
        )
        _write_payload(conn, job_id, payload)
        return True


def list_jobs() -> dict[str, dict[str, Any]]:
    try:
        with _connection(write=True) as conn:
            _migrate_legacy_json_if_needed(conn)
            rows = conn.execute("SELECT job_id, payload FROM jobs").fetchall()
            return {row["job_id"]: _decode_payload(row["payload"]) for row in rows}
    except (sqlite3.Error, OSError) as exc:
        logger.warning("Failed to list UGSci jobs: %s", exc)
        return {}


def remove_job(job_id: str) -> None:
    with _connection(write=True) as conn:
        conn.execute("DELETE FROM job_events WHERE job_id=?", (job_id,))
        conn.execute("DELETE FROM jobs WHERE job_id=?", (job_id,))


def append_job_event_if_changed(
    job_id: str,
    event: dict[str, Any],
) -> tuple[int, bool]:
    encoded = json.dumps(event, sort_keys=True, ensure_ascii=False, default=str)
    with _connection(write=True) as conn:
        latest = conn.execute(
            "SELECT sequence, payload FROM job_events WHERE job_id=? "
            "ORDER BY sequence DESC LIMIT 1",
            (job_id,),
        ).fetchone()
        if latest and latest["payload"] == encoded:
            return int(latest["sequence"]), False
        sequence = int(latest["sequence"] if latest else 0) + 1
        conn.execute(
            "INSERT INTO job_events(job_id, sequence, payload, created_at) "
            "VALUES (?, ?, ?, ?)",
            (job_id, sequence, encoded, _utc_now_iso()),
        )
        conn.execute(
            "DELETE FROM job_events WHERE job_id=? AND sequence <= ?",
            (job_id, max(0, sequence - _MAX_EVENTS_PER_JOB)),
        )
        return sequence, True


def list_job_events(job_id: str, after_sequence: int = 0) -> list[dict[str, Any]]:
    try:
        with _connection() as conn:
            rows = conn.execute(
                "SELECT sequence, payload FROM job_events "
                "WHERE job_id=? AND sequence>? ORDER BY sequence",
                (job_id, max(0, after_sequence)),
            ).fetchall()
    except (sqlite3.Error, OSError) as exc:
        logger.warning("Failed to list UGSci events for %s: %s", job_id, exc)
        return []
    return [
        {"sequence": int(row["sequence"]), "data": _decode_payload(row["payload"])}
        for row in rows
    ]


def is_pid_ours(pid: int, expected_start_ts: float, deck_file: str = "") -> bool:
    """Confirm PID identity using create time and an exact deck basename token."""
    if pid <= 0 or not is_pid_alive(pid):
        return False
    basename = os.path.basename(deck_file).casefold() if deck_file else ""
    if not basename:
        return False
    expected_tokens = {basename}
    stem, ext = os.path.splitext(basename)
    if ext == ".data" and stem:
        expected_tokens.add(stem)
    try:
        import psutil

        process = psutil.Process(pid)
        if expected_start_ts > 0 and abs(process.create_time() - expected_start_ts) > 5:
            return False
        tokens = [os.path.basename(part.strip('"')).casefold() for part in process.cmdline()]
        return bool(expected_tokens.intersection(tokens))
    except Exception:
        pass
    if os.name != "nt":
        return False
    try:
        import subprocess

        result = subprocess.run(
            [
                "powershell",
                "-NoProfile",
                "-Command",
                f"(Get-CimInstance Win32_Process -Filter 'ProcessId={pid}').CommandLine",
            ],
            capture_output=True,
            text=True,
            timeout=5,
            check=False,
        )
        command = result.stdout.replace('"', '').casefold()
        tokens = [os.path.basename(token) for token in command.split()]
        return bool(expected_tokens.intersection(tokens))
    except Exception:
        return False


def is_pid_alive(pid: int) -> bool:
    if pid <= 0:
        return False
    try:
        import psutil

        process = psutil.Process(pid)
        return process.is_running() and process.status() != psutil.STATUS_ZOMBIE
    except ImportError:
        pass
    except Exception:
        return False
    try:
        if os.name == "nt":
            import ctypes

            handle = ctypes.windll.kernel32.OpenProcess(0x1000, False, pid)
            if handle:
                ctypes.windll.kernel32.CloseHandle(handle)
                return True
            return False
        os.kill(pid, 0)
        return True
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    except Exception:
        return False


__all__ = [
    "append_job_event_if_changed",
    "claim_terminal_notification",
    "claim_wake_attempt",
    "finish_wake_attempt",
    "is_pid_alive",
    "is_pid_ours",
    "list_job_events",
    "list_jobs",
    "load_job",
    "remove_job",
    "save_job",
    "update_job_fields",
    "update_job_status",
]
