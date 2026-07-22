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
    start_time: float = 0.0
    end_time: float | None = None
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
    try:
        from ..engine_manager import get_engine
    except Exception:
        get_engine = None  # type: ignore

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
    from ..sim_adapters import get_adapter

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
    loop = asyncio.get_event_loop()

    job = SimJob(
        job_id=job_id,
        simulator=simulator.lower().strip(),
        deck_file=str(deck_path),
        working_dir=str(work_path),
        pid=proc.pid,
        status="running",
        start_time=loop.time(),
        timeout=timeout,
        process=proc,
    )
    _sim_jobs[job_id] = job

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
# Background monitor coroutine
# ---------------------------------------------------------------------------

async def _monitor_job(job_id: str) -> None:
    """Wait for a simulation process to finish and update its status."""
    job = _sim_jobs.get(job_id)
    if not job or not job.process:
        return

    proc = job.process
    loop = asyncio.get_event_loop()

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

    job.end_time = loop.time()
    logger.info(
        "Simulation ended: job=%s status=%s rc=%s",
        job_id, job.status, job.returncode,
    )
