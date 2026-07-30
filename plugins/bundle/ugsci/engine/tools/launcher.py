# -*- coding: utf-8 -*-
"""launch_simulation — start a numerical simulation and return a job_id.

The tool is async: it starts the simulator as a background subprocess
and returns immediately with a ``job_id``.  A background monitoring
coroutine tracks the process and updates the in-memory job table.

The simulator executable path is resolved from the UGSci engine
registry (``engine_manager.py``), so the user must have configured the
engine in the Capabilities Center before using this tool.
"""
from __future__ import annotations

import asyncio
import logging
import os
import time
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.sim")

# ---------------------------------------------------------------------------
# Shared job state (imported by monitor / result_reader / analyzer)
# ---------------------------------------------------------------------------

@dataclass
class SimJob:
    """In-memory record of a simulation job."""

    job_id: str
    simulator: str
    deck_file: str
    working_dir: str
    pid: int
    status: str = "running"  # running | completed | failed | timeout | error
    start_time: float = 0.0  # loop.time() — for in-process elapsed calc
    start_ts: float = 0.0  # time.time() — wall clock, survives restart
    end_time: float | None = None  # loop.time()
    end_ts: float | None = None  # time.time() — wall clock
    timeout: float = 86400.0
    returncode: int | None = None
    error: str | None = None
    process: Any | None = None  # asyncio.subprocess.Process
    extra: dict[str, Any] = field(default_factory=dict)


# Global job table — keyed by job_id
_sim_jobs: dict[str, SimJob] = {}


# ---------------------------------------------------------------------------
# Tool function
# ---------------------------------------------------------------------------

async def launch_simulation(
    simulator: str,
    deck_file: str,
    working_dir: str = "",
    timeout: float = 86400,
) -> Any:
    """Start a numerical simulation and return a job_id for monitoring.

    The simulation runs as a background subprocess — this function returns
    immediately.  Use ``check_simulation_status`` to query progress.

    For long-running simulations (hours/days), consider setting up a
    scheduled check via the cron system so the Agent is automatically
    notified when the simulation finishes::

        qwenpaw cron create --type agent --schedule-type scheduled \
          --run-at "<10 minutes later>" --text "检查 job <job_id> 状态" \
          --channel <channel> --agent-id <agent_id>

    Args:
        simulator (`str`):
            Simulator type. One of: ``"eclipse"``, ``"cmg_imex"``,
            ``"cmg_stars"``, ``"cmg_gem"``, ``"comsol"``.
        deck_file (`str`):
            Path to the input/deck file (e.g. ``model.DATA``,
            ``case.dat``, ``study.mph``).  Relative paths resolve from
            the agent workspace.
        working_dir (`str`):
            Working directory for the simulation.  Defaults to the
            current agent workspace.
        timeout (`float`):
            Maximum runtime in seconds.  Default 86400 (24 hours).
            When the timeout is reached, the process is killed and the
            job status becomes ``"timeout"``.

    Returns:
        ``ToolChunk``: Contains the job_id and launch information.
    """
    from agentscope.message import TextBlock, ToolResultState
    from agentscope.tool import ToolChunk

    # ── Resolve working directory ────────────────────────────────────
    if not working_dir:
        try:
            from qwenpaw.config.context import get_current_workspace_dir
            working_dir = str(get_current_workspace_dir())
        except Exception:
            working_dir = os.getcwd()
    work_path = Path(working_dir).expanduser().resolve()
    work_path.mkdir(parents=True, exist_ok=True)

    # ── Resolve deck file path ───────────────────────────────────────
    deck_path = Path(deck_file)
    if not deck_path.is_absolute():
        deck_path = work_path / deck_file
    if not deck_path.exists():
        return ToolChunk(
            is_last=True,
            state=ToolResultState.ERROR,
            content=[
                TextBlock(
                    type="text",
                    text=f"Error: Input file not found: {deck_path}",
                ),
            ],
        )

    # ── Resolve executable from engine registry ──────────────────────
    from .. import get_engine

    # Map simulator name to engine ID
    engine_id_map = {
        "eclipse": "eclipse",
        "cmg_imex": "cmg",
        "cmg_stars": "cmg",
        "cmg_gem": "cmg",
        "comsol": "comsol",
    }
    engine_id = engine_id_map.get(simulator.lower().strip(), simulator)

    executable = ""
    license_env = ""
    if get_engine:
        engine = get_engine(engine_id)
        if engine and engine.executable_path:
            executable = engine.executable_path
            license_env = engine.license_server or ""

    if not executable:
        return ToolChunk(
            is_last=True,
            state=ToolResultState.ERROR,
            content=[
                TextBlock(
                    type="text",
                    text=(
                        f"Error: Simulator '{simulator}' (engine '{engine_id}') "
                        f"has no executable path configured.\n"
                        f"Please configure it in Capabilities → Engines."
                    ),
                ),
            ],
        )

    # ── Build command via adapter ────────────────────────────────────
    from ..adapters import get_adapter

    try:
        adapter = get_adapter(simulator)
    except KeyError as exc:
        return ToolChunk(
            is_last=True,
            state=ToolResultState.ERROR,
            content=[
                TextBlock(
                    type="text",
                    text=f"Error: {exc}",
                ),
            ],
        )

    output_file = str(deck_path.with_suffix(adapter.log_extension))
    command = adapter.build_command(executable, str(deck_path), output_file)

    # ── Start subprocess ─────────────────────────────────────────────
    env = {**os.environ}
    if license_env:
        env.setdefault("LM_LICENSE_FILE", license_env)

    try:
        proc = await asyncio.create_subprocess_exec(
            *command,
            cwd=str(work_path),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env,
        )
    except Exception as exc:
        return ToolChunk(
            is_last=True,
            state=ToolResultState.ERROR,
            content=[
                TextBlock(
                    type="text",
                    text=f"Error: Failed to start simulation: {exc}",
                ),
            ],
        )

    # ── Register job ─────────────────────────────────────────────────
    job_id = f"sim_{uuid.uuid4().hex[:8]}"

    wall_now = time.time()
    try:
        loop = asyncio.get_running_loop()
        mono_now = loop.time()
    except RuntimeError:
        mono_now = time.time()

    job = SimJob(
        job_id=job_id,
        simulator=simulator.lower().strip(),
        deck_file=str(deck_path),
        working_dir=str(work_path),
        pid=proc.pid,
        status="running",
        start_time=mono_now,
        start_ts=wall_now,
        timeout=timeout,
        process=proc,
    )
    _sim_jobs[job_id] = job

    # ── Persist job metadata ────────────────────────────────────────
    try:
        from . import job_store

        job_store.save_job(job_id, {
            "job_id": job_id,
            "simulator": job.simulator,
            "deck_file": job.deck_file,
            "working_dir": job.working_dir,
            "pid": job.pid,
            "status": job.status,
            "start_ts": job.start_ts,
            "timeout": job.timeout,
            "returncode": None,
            "error": None,
        })
    except Exception as exc:
        logger.warning("Failed to persist job %s: %s", job_id, exc)

    # ── Start background monitor ─────────────────────────────────────
    asyncio.create_task(_monitor_job(job_id))

    logger.info(
        "Simulation started: job=%s simulator=%s pid=%d deck=%s",
        job_id, simulator, proc.pid, deck_path,
    )

    return ToolChunk(
        is_last=True,
        state=ToolResultState.SUCCESS,
        content=[
            TextBlock(
                type="text",
                text=(
                    f"Simulation started.\n"
                    f"  Job ID:      {job_id}\n"
                    f"  Simulator:   {simulator}\n"
                    f"  Input file:  {deck_path}\n"
                    f"  Working dir: {work_path}\n"
                    f"  PID:         {proc.pid}\n"
                    f"  Timeout:     {timeout:.0f}s ({timeout/3600:.1f}h)\n\n"
                    f"Use check_simulation_status(job_id=\"{job_id}\") "
                    f"to monitor progress."
                ),
            ),
        ],
    )


# ---------------------------------------------------------------------------
# Job recovery — used by monitor / result_reader / analyzer when a job
# is not found in the in-memory _sim_jobs dict (e.g. after restart).
# ---------------------------------------------------------------------------


def _recover_job(job_id: str) -> SimJob | None:
    """Try to recover a job from persistent storage.

    Returns a SimJob (without process handle) if found in the JSON
    store, or None.  The recovered job is inserted into ``_sim_jobs``
    so subsequent lookups hit memory directly.
    """
    try:
        from . import job_store
    except Exception:
        return None

    meta = job_store.load_job(job_id)
    if not meta:
        return None

    # Reconstruct SimJob from stored metadata (process handle is lost)
    start_ts = meta.get("start_ts", 0.0)
    try:
        start_ts = float(start_ts)
    except (ValueError, TypeError):
        start_ts = 0.0

    end_ts = meta.get("end_ts")
    try:
        end_ts = float(end_ts) if end_ts is not None else None
    except (ValueError, TypeError):
        end_ts = None

    job = SimJob(
        job_id=meta.get("job_id", job_id),
        simulator=meta.get("simulator", ""),
        deck_file=meta.get("deck_file", ""),
        working_dir=meta.get("working_dir", ""),
        pid=meta.get("pid", 0),
        status=meta.get("status", "unknown"),
        start_ts=start_ts,
        end_ts=end_ts,
        timeout=meta.get("timeout", 86400.0),
        returncode=meta.get("returncode"),
        error=meta.get("error"),
        process=None,  # Cannot recover process handle after restart
    )

    # If status was "running", check timeout first, then PID liveness.
    # Timeout check guards against PID reuse: if the job has exceeded
    # its timeout, we mark it as "timeout" regardless of PID status.
    if job.status == "running":
        if job.start_ts > 0:
            elapsed = time.time() - job.start_ts
            if elapsed > job.timeout:
                job.status = "timeout"
                job.end_ts = time.time()
                job_store.update_job_status(
                    job_id,
                    job.status,
                    end_ts=job.end_ts,
                )
                logger.info(
                    "Recovered job %s: exceeded timeout, marked as timeout",
                    job_id,
                )
                _sim_jobs[job_id] = job
                return job

        if job.pid > 0 and not job_store.is_pid_alive(job.pid):
            # Process has terminated — mark as completed (optimistic;
            # Agent should verify with read_simulation_results)
            job.status = "completed"
            job.end_ts = time.time()
            job_store.update_job_status(
                job_id,
                job.status,
                end_ts=job.end_ts,
            )
            logger.info(
                "Recovered job %s: process dead, marked as completed",
                job_id,
            )
        elif job.pid > 0:
            logger.info(
                "Recovered job %s: process still running (pid=%d)",
                job_id, job.pid,
            )
        else:
            logger.info(
                "Recovered job %s: status=%s (no PID)",
                job_id, job.status,
            )
    else:
        logger.info(
            "Recovered job %s: status=%s",
            job_id, job.status,
        )

    _sim_jobs[job_id] = job
    return job


def _get_job(job_id: str) -> SimJob | None:
    """Look up a job by ID, recovering from persistent store if needed.

    This is the single entry point for job lookup — used by monitor,
    result_reader, and analyzer.  Returns None only if the job is truly
    unknown (neither in memory nor in the persistent store).
    """
    job = _sim_jobs.get(job_id)
    if job is not None:
        return job
    # Try recovery from persistent store
    return _recover_job(job_id)


def get_all_jobs() -> dict[str, SimJob]:
    """Return a snapshot of all in-memory jobs.

    This is the public accessor for the job table — used by the
    HTTP SSE router in plugin.py instead of importing the private
    ``_sim_jobs`` dict directly.
    """
    return dict(_sim_jobs)


# ---------------------------------------------------------------------------
# Background monitor coroutine
# ---------------------------------------------------------------------------

async def _monitor_job(job_id: str) -> None:
    """Wait for a simulation process to finish and update its status."""
    job = _sim_jobs.get(job_id)
    if not job or not job.process:
        return

    proc = job.process

    try:
        loop = asyncio.get_running_loop()
        mono_now = loop.time()
    except RuntimeError:
        mono_now = time.time()

    try:
        await asyncio.wait_for(proc.wait(), timeout=job.timeout)
        job.returncode = proc.returncode
        job.status = "completed" if proc.returncode == 0 else "failed"
    except asyncio.TimeoutError:
        try:
            proc.kill()
            await proc.wait()
        except Exception:
            pass
        job.status = "timeout"
    except Exception as exc:
        job.status = "error"
        job.error = str(exc)

    job.end_time = mono_now
    job.end_ts = time.time()

    # ── Update persisted status ──────────────────────────────────────
    try:
        from . import job_store

        job_store.update_job_status(
            job_id,
            job.status,
            returncode=job.returncode,
            error=job.error,
            end_ts=job.end_ts,
        )
    except Exception as exc:
        logger.warning("Failed to update job status %s: %s", job_id, exc)

    logger.info(
        "Simulation ended: job=%s status=%s rc=%s",
        job_id, job.status, job.returncode,
    )
