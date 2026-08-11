"""Durable, multi-signal activity snapshots for simulation jobs."""
from __future__ import annotations

import time
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class ActivitySnapshot:
    token: tuple[object, ...]
    log_path: str = ""
    log_size: int = 0
    log_mtime: float = 0.0
    current_time: str = ""
    current_step: int = 0
    cpu_seconds: float | None = None
    process_alive: bool = False
    observed_at: float = 0.0


def _process_cpu(pid: int) -> tuple[bool, float | None]:
    if pid <= 0:
        return False, None
    try:
        import psutil

        proc = psutil.Process(pid)
        times = proc.cpu_times()
        return proc.is_running(), float(times.user + times.system)
    except Exception:
        try:
            from .job_store import is_pid_alive

            return is_pid_alive(pid), None
        except Exception:
            return False, None


def capture_activity(job) -> ActivitySnapshot:
    """Capture progress without assuming that simulator steps are frequent."""
    log_path = ""
    size = 0
    mtime = 0.0
    current_time = ""
    current_step = 0
    try:
        from ..adapters import get_adapter

        adapter = get_adapter(job.simulator)
        log_file = adapter.find_log_file(job.working_dir)
        if log_file:
            path = Path(log_file)
            stat = path.stat()
            log_path = str(path)
            size = stat.st_size
            mtime = stat.st_mtime
        progress = adapter.parse_progress(job.working_dir)
        current_time = progress.current_time or ""
        current_step = int(progress.current_step or 0)
    except Exception:
        pass
    alive, cpu = _process_cpu(int(job.pid or 0))
    cpu_token = round(cpu, 1) if cpu is not None else None
    token = (log_path, size, round(mtime, 3), current_time, current_step, cpu_token, alive)
    return ActivitySnapshot(
        token=token,
        log_path=log_path,
        log_size=size,
        log_mtime=mtime,
        current_time=current_time,
        current_step=current_step,
        cpu_seconds=cpu,
        process_alive=alive,
        observed_at=time.time(),
    )


def has_progress(previous: ActivitySnapshot | None, current: ActivitySnapshot) -> bool:
    if previous is None:
        return True
    return current.token != previous.token
