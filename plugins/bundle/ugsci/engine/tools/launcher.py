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
import json
import logging
import math
import os
import re
import subprocess
import time
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.sim")

# Numerical simulations commonly run for several days.  ``timeout=0`` is
# reserved for simulator-managed/infinite runs.
DEFAULT_SIM_TIMEOUT = 7 * 24 * 60 * 60


def _ensure_path_in_workspace(
    path: Path,
    working_dir: str = "",  # noqa: ARG001  kept for API stability
) -> Path:
    """Resolve *path* and verify it is within the agent workspace.

    BUG-001: Without this check, an agent can pass arbitrary absolute
    paths to ``working_dir`` or ``deck_file``, writing files and starting
    processes outside the user's expected workspace boundary.

    The workspace root is **always** obtained from the system context
    (``get_current_workspace_dir``), never from the user-provided
    ``working_dir`` — otherwise an attacker could pass
    ``working_dir=/tmp/evil`` and the check would pass.

    Returns the resolved absolute path on success.
    Raises ``PermissionError`` if the path escapes the workspace.
    """
    resolved = path.expanduser().resolve()
    try:
        from qwenpaw.config.context import get_current_workspace_dir
        ws_root = get_current_workspace_dir().resolve()
    except Exception:
        ws_root = Path(os.getcwd()).resolve()
    try:
        resolved.relative_to(ws_root)
    except ValueError as exc:
        raise PermissionError(
            f"Path '{resolved}' is outside the workspace '{ws_root}'. "
            f"Simulation tools may only operate within the workspace.",
        ) from exc
    return resolved

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
    status: str = "running"  # running | completed | failed | timeout | error | interrupted
    start_time: float = 0.0  # loop.time() — for in-process elapsed calc
    start_ts: float = 0.0  # time.time() — wall clock, survives restart
    end_time: float | None = None  # loop.time()
    end_ts: float | None = None  # time.time() — wall clock
    timeout: float = DEFAULT_SIM_TIMEOUT
    returncode: int | None = None
    error: str | None = None
    process: Any | None = None  # asyncio.subprocess.Process
    # BUG-002: file handle for redirected stdout/stderr log
    _log_file: Any = field(default=None, repr=False)
    extra: dict[str, Any] = field(default_factory=dict)

    @property
    def unlimited(self) -> bool:
        return self.timeout <= 0


# Global job table — keyed by job_id
_sim_jobs: dict[str, SimJob] = {}
_monitor_tasks: dict[str, asyncio.Task[Any]] = {}
_terminal_tasks: dict[str, asyncio.Task[Any]] = {}
_cleanup_tasks: dict[str, asyncio.Task[Any]] = {}

_ARTIFACT_MTIME_TOLERANCE_SECONDS = 2.0
_CLEANUP_RETRY_DELAYS = (30.0, 60.0, 300.0)


def _output_dir_for(deck_file: str, working_dir: str = "", output_dir: str = "") -> Path:
    """Return the directory where simulator artifacts are expected."""
    if output_dir:
        return Path(output_dir).expanduser().resolve()
    if deck_file:
        deck_path = Path(deck_file).expanduser()
        if deck_path.is_absolute():
            return deck_path.resolve().parent
        if working_dir:
            return (Path(working_dir).expanduser().resolve() / deck_path).parent
    if working_dir:
        return Path(working_dir).expanduser().resolve()
    return Path.cwd().resolve()


def _artifact_is_current(path: Path, job: SimJob) -> bool:
    """Return whether *path* can credibly belong to the current run."""
    if not path.is_file():
        return False
    if job.start_ts <= 0:
        return False
    try:
        return path.stat().st_mtime + _ARTIFACT_MTIME_TOLERANCE_SECONDS >= job.start_ts
    except OSError:
        return False


def _terminal_status_from_artifacts(job: SimJob) -> tuple[str | None, int | None, str | None]:
    """Infer a credible terminal state after the original process handle is lost."""
    output_dir = _output_dir_for(
        job.deck_file,
        job.working_dir,
        str(job.extra.get("output_dir") or ""),
    )
    stem = str(job.extra.get("case_stem") or Path(job.deck_file).stem)
    if job.simulator == "eclipse":
        eclend = output_dir / f"{stem}.ECLEND"
        prt = output_dir / f"{stem}.PRT"
        tail = ""
        current_eclend = _artifact_is_current(eclend, job)
        current_prt = _artifact_is_current(prt, job)
        try:
            if current_prt:
                with prt.open("rb") as handle:
                    handle.seek(max(0, prt.stat().st_size - 128 * 1024))
                    tail = handle.read().decode("utf-8", errors="replace")
        except OSError:
            tail = ""
        errors = re.search(r"^\s*Errors\s*:?\s*(\d+)", tail, re.MULTILINE | re.IGNORECASE)
        problems = re.search(r"^\s*Problems\s*:?\s*(\d+)", tail, re.MULTILINE | re.IGNORECASE)
        has_final_summary = "FINAL CPU" in tail.upper() and errors is not None
        if current_eclend or has_final_summary:
            error_count = int(errors.group(1)) if errors else 0
            problem_count = int(problems.group(1)) if problems else 0
            if error_count == 0 and problem_count == 0:
                return "completed", 0, None
            return (
                "failed",
                None,
                f"Eclipse final summary reports errors={error_count}, problems={problem_count}",
            )
        return None, None, None

    try:
        from ..adapters import get_adapter

        adapter = get_adapter(job.simulator)
        return adapter.infer_terminal_status(
            output_dir,
            start_ts=job.start_ts,
            case_stem=stem,
        )
    except Exception:
        pass
    return None, None, None


def _apply_dead_process_terminal_status(job: SimJob, fallback_error: str) -> None:
    """Apply artifact-backed terminal state, failing closed when unavailable."""
    inferred_status, inferred_returncode, inferred_error = (
        _terminal_status_from_artifacts(job)
    )
    if inferred_status is not None:
        job.status = inferred_status
        job.returncode = inferred_returncode
        job.error = inferred_error
    else:
        job.status = "interrupted"
        job.returncode = None
        job.error = fallback_error


# ---------------------------------------------------------------------------
# Tool function
# ---------------------------------------------------------------------------

async def launch_simulation(
    simulator: str,
    deck_file: str,
    working_dir: str = "",
    timeout: float = DEFAULT_SIM_TIMEOUT,
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
            ``"cmg_stars"``, ``"cmg_gem"``, ``"comsol"``,
            ``"intersect"``, ``"tnavigator"``.
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

    if not isinstance(timeout, (int, float)) or not math.isfinite(float(timeout)) or float(timeout) < 0:
        return ToolChunk(
            is_last=True,
            state=ToolResultState.ERROR,
            content=[TextBlock(type="text", text="Error: timeout must be a non-negative finite number of seconds (0 means unlimited).")],
        )
    timeout = float(timeout)

    # ── Resolve working directory ────────────────────────────────────
    if not working_dir:
        try:
            from qwenpaw.config.context import get_current_workspace_dir
            working_dir = str(get_current_workspace_dir())
        except Exception:
            working_dir = os.getcwd()
    work_path = Path(working_dir).expanduser().resolve()

    # BUG-001: Verify working directory is within the workspace.
    # Check BEFORE mkdir so we don't create directories outside the
    # workspace boundary even if the call later fails.
    _ensure_path_in_workspace(work_path)
    work_path.mkdir(parents=True, exist_ok=True)

    # ── Resolve deck file path ───────────────────────────────────────
    deck_path = Path(deck_file)
    if not deck_path.is_absolute():
        deck_path = work_path / deck_file
    # BUG-001: Verify deck file is within the workspace.
    _ensure_path_in_workspace(deck_path)
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
    output_path = deck_path.resolve().parent
    _ensure_path_in_workspace(output_path)

    from .. import get_engine
    from ..adapters import get_adapter

    # Resolve the adapter before the engine.  The adapter owns variant-specific
    # executable selection (notably CMG IMEX/STARS/GEM).
    try:
        adapter = get_adapter(simulator)
    except KeyError as exc:
        return ToolChunk(
            is_last=True,
            state=ToolResultState.ERROR,
            content=[TextBlock(type="text", text=f"Error: {exc}")],
        )

    # Map simulator name to engine ID
    engine_id_map = {
        "eclipse": "eclipse",
        "cmg_imex": "cmg",
        "cmg_stars": "cmg",
        "cmg_gem": "cmg",
        "comsol": "comsol",
        "intersect": "intersect",
        "tnavigator": "tnavigator",
    }
    engine_id = engine_id_map.get(simulator.lower().strip(), simulator)

    executable = ""
    license_env = ""
    if get_engine:
        engine = get_engine(engine_id)
        if engine:
            executable = adapter.resolve_executable(engine)
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
    input_inspection: dict[str, Any] = {}
    if adapter.capabilities.supports_input_inspection:
        try:
            input_inspection = adapter.inspect_input(deck_path)
        except Exception as exc:
            input_inspection = {
                "warnings": [
                    f"input preflight inspection failed: {type(exc).__name__}"
                ]
            }

    output_file = str(deck_path.with_suffix(adapter.log_extension))
    command = adapter.build_command(executable, str(deck_path), output_file)

    # ── Prepare log file for stdout/stderr ───────────────────────────
    # BUG-002: Using PIPE without draining causes deadlock on high
    # simulator output.  Redirect to log files in the working directory
    # instead so the OS handles buffering and we can read them later.
    log_path = output_path / f"{deck_path.stem}.sim.log"
    log_file = open(log_path, "w", encoding="utf-8", errors="replace")  # noqa: SIM115

    # ── Start subprocess ─────────────────────────────────────────────
    env = {**os.environ}
    if license_env:
        env.setdefault("LM_LICENSE_FILE", license_env)

    wall_now = time.time()
    try:
        loop = asyncio.get_running_loop()
        mono_now = loop.time()
    except RuntimeError:
        mono_now = time.time()

    try:
        proc = await asyncio.create_subprocess_exec(
            *command,
            cwd=str(work_path),
            stdout=log_file,
            stderr=subprocess.STDOUT,
            env=env,
        )
    except Exception as exc:
        # BUG-002: Close the log file if subprocess creation failed
        # to avoid leaking the file handle.
        try:
            log_file.close()
        except Exception:
            pass
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
    agent_id = "default"
    session_id = ""
    user_id = ""
    channel = ""
    try:
        from qwenpaw.app.agent_context import (
            get_current_agent_id,
            get_current_channel,
            get_current_session_id,
            get_current_user_id,
        )
        agent_id = get_current_agent_id()
        session_id = get_current_session_id() or ""
        user_id = get_current_user_id() or ""
        channel = get_current_channel() or ""
    except Exception:
        pass

    job = SimJob(
        job_id=job_id,
        simulator=simulator.lower().strip(),
        deck_file=str(deck_path),
        working_dir=str(output_path),
        pid=proc.pid,
        status="running",
        start_time=mono_now,
        start_ts=wall_now,
        timeout=timeout,
        process=proc,
        # BUG-002: store log file handle so _monitor_job can close it
        _log_file=log_file,
        extra={
            "execution_dir": str(work_path),
            "output_dir": str(output_path),
            "log_path": str(log_path),
            "command": command,
            "case_stem": deck_path.stem,
            "input_inspection": input_inspection,
            "agent_id": agent_id,
            "session_id": session_id,
            "user_id": user_id,
            "channel": channel,
        },
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
            "execution_dir": str(work_path),
            "output_dir": str(output_path),
            "pid": job.pid,
            "status": job.status,
            "start_ts": job.start_ts,
            "timeout": job.timeout,
            "returncode": None,
            "error": None,
            "log_path": str(log_path),
            "command": command,
            "case_stem": deck_path.stem,
            "input_inspection": input_inspection,
            "agent_id": agent_id,
            "session_id": session_id,
            "user_id": user_id,
            "channel": channel,
            "wake_status": "pending",
            "wake_attempts": 0,
            "diagnosis_rounds": 0,
            "cron_cleanup_status": "pending",
            "cron_cleanup_attempts": 0,
        })
    except Exception as exc:
        logger.error("Failed to persist job %s: %s", job_id, exc)
        try:
            proc.kill()
            await proc.wait()
        finally:
            log_file.close()
            _sim_jobs.pop(job_id, None)
        return ToolChunk(
            is_last=True,
            state=ToolResultState.ERROR,
            content=[TextBlock(type="text", text=f"Error: Simulation started but durable job registration failed: {exc}")],
        )

    # ── Start background monitor ─────────────────────────────────────
    _ensure_monitor_task(job_id)

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
                    f"  Output dir:  {output_path}\n"
                    f"  Process cwd: {work_path}\n"
                    f"  PID:         {proc.pid}\n"
                    f"  Timeout:     {timeout:.0f}s ({timeout/3600:.1f}h)\n\n"
                    f"Use check_simulation_status(job_id=\"{job_id}\") "
                    f"to monitor progress."
                    + (
                        "\n\nPreflight warnings:\n  - "
                        + "\n  - ".join(input_inspection.get("warnings", [])[:20])
                        if input_inspection.get("warnings")
                        else ""
                    )
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

    try:
        pid = int(meta.get("pid", 0) or 0)
    except (TypeError, ValueError):
        pid = 0
    try:
        timeout = float(meta.get("timeout", DEFAULT_SIM_TIMEOUT) or 0)
    except (TypeError, ValueError):
        timeout = DEFAULT_SIM_TIMEOUT
    stored_working_dir = str(meta.get("working_dir") or "")
    output_dir = _output_dir_for(
        str(meta.get("deck_file") or ""),
        stored_working_dir,
        str(meta.get("output_dir") or ""),
    )
    job = SimJob(
        job_id=meta.get("job_id", job_id),
        simulator=meta.get("simulator", ""),
        deck_file=meta.get("deck_file", ""),
        working_dir=str(output_dir),
        pid=pid,
        status=meta.get("status", "unknown"),
        start_ts=start_ts,
        end_ts=end_ts,
        timeout=timeout,
        returncode=meta.get("returncode"),
        error=meta.get("error"),
        process=None,
        extra={
            k: meta.get(k)
            for k in (
                "log_path",
                "command",
                "case_stem",
                "input_inspection",
                "execution_dir",
                "output_dir",
                "agent_id",
                "session_id",
                "user_id",
                "channel",
                "terminal_notified",
                "wake_status",
                "wake_attempts",
                "wake_run_key",
                "diagnosis_rounds",
                "diagnosis",
                "tuning_candidate",
                "cron_cleanup_status",
                "cron_cleanup_attempts",
                "cron_cleanup_error",
            )
            if meta.get(k) is not None
        },
    )
    job.extra["output_dir"] = str(output_dir)
    if stored_working_dir != str(output_dir) or meta.get("output_dir") != str(output_dir):
        try:
            job_store.update_job_fields(
                job_id,
                working_dir=str(output_dir),
                output_dir=str(output_dir),
                execution_dir=str(meta.get("execution_dir") or stored_working_dir),
            )
        except Exception as exc:
            logger.warning("Failed to persist output directory migration for %s: %s", job_id, exc)

    # If status was "running", inspect dead-process artifacts first. A
    # successful run may have finished while the service was offline, even
    # when the persisted record is now older than its configured timeout.
    if job.status == "running":
        if job.pid <= 0 or not job_store.is_pid_alive(job.pid):
            # Process is no longer running. Without a process handle we
            # cannot determine the real return code.
            #
            # If the store has a return code from a prior _monitor_job
            # completion, trust it. Otherwise mark as 'interrupted' —
            # the Agent must verify results manually.
            #
            # BUG-007: never optimistically mark as 'completed' when
            # we lack a credible exit code. A dead PID could mean
            # crash, OOM, user-kill, or non-zero exit — all of which
            # would be falsely presented as success.
            if job.returncode is not None:
                job.status = (
                    "completed" if job.returncode == 0 else "failed"
                )
            else:
                _apply_dead_process_terminal_status(
                    job,
                    "process exited while the service was disconnected; "
                    "return code and credible terminal artifacts are unavailable",
                )
            job.end_ts = time.time()
            job_store.update_job_status(
                job_id,
                job.status,
                returncode=job.returncode,
                error=job.error,
                end_ts=job.end_ts,
            )
            logger.info(
                "Recovered job %s: process dead, marked as %s "
                "(returncode=%s)",
                job_id, job.status, job.returncode,
            )
        elif (
            job.start_ts > 0
            and not job.unlimited
            and time.time() - job.start_ts > job.timeout
        ):
            logger.info(
                "Recovered job %s: exceeded timeout, attaching terminator",
                job_id,
            )
        elif job.pid > 0:
            # PID is alive — verify it's the same process to detect
            # PID reuse (BUG-007). If we can't confirm identity, be
            # safe and mark as 'interrupted'.
            if job_store.is_pid_ours(job.pid, job.start_ts,
                                     job.deck_file):
                logger.info(
                    "Recovered job %s: process still running "
                    "(pid=%d)",
                    job_id, job.pid,
                )
                # Attach after inserting into the in-memory table below.
            else:
                job.status = "interrupted"
                job.end_ts = time.time()
                job_store.update_job_status(
                    job_id,
                    job.status,
                    end_ts=job.end_ts,
                )
                logger.warning(
                    "Recovered job %s: pid=%d is alive but does not "
                    "match original process (PID reuse suspected), "
                    "marked as interrupted",
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
    if job.status == "running":
        _ensure_monitor_task(job_id)
    else:
        if (
            not meta.get("terminal_notified")
            or str(meta.get("wake_status") or "pending") != "completed"
        ):
            _ensure_terminal_task(job_id)
        elif str(meta.get("cron_cleanup_status") or "pending") != "completed":
            _ensure_cleanup_retry_task(job_id)
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


def _ensure_monitor_task(job_id: str) -> None:
    task = _monitor_tasks.get(job_id)
    if task is not None and not task.done():
        return
    coroutine = _monitor_job(job_id)
    try:
        task = asyncio.create_task(coroutine, name=f"ugsci-sim-{job_id}")
    except RuntimeError:
        coroutine.close()
        return
    _monitor_tasks[job_id] = task
    task.add_done_callback(lambda _: _monitor_tasks.pop(job_id, None))


def _ensure_terminal_task(job_id: str) -> None:
    task = _terminal_tasks.get(job_id)
    if task is not None and not task.done():
        return
    job = _sim_jobs.get(job_id)
    if job is None:
        return
    coroutine = _notify_terminal_job(job)
    try:
        task = asyncio.create_task(
            coroutine,
            name=f"ugsci-sim-terminal-{job_id}",
        )
    except RuntimeError:
        coroutine.close()
        return
    _terminal_tasks[job_id] = task
    task.add_done_callback(lambda _: _terminal_tasks.pop(job_id, None))


def get_all_jobs() -> dict[str, SimJob]:
    """Return a snapshot of all in-memory jobs.

    This is the public accessor for the job table — used by the
    HTTP SSE router in plugin.py instead of importing the private
    ``_sim_jobs`` dict directly.
    """
    return dict(_sim_jobs)


def recover_persisted_jobs() -> int:
    """Recover monitors and pending terminal orchestration after startup."""
    try:
        from . import job_store
        stored = job_store.list_jobs()
    except Exception:
        return 0
    recovered = 0
    for job_id, meta in stored.items():
        job = _recover_job(job_id)
        if job is None:
            continue
        if job.status == "running":
            recovered += 1
        elif (
            not meta.get("terminal_notified")
            or str(meta.get("wake_status") or "pending") != "completed"
        ):
            _ensure_terminal_task(job_id)
        elif str(meta.get("cron_cleanup_status") or "pending") != "completed":
            _ensure_cleanup_retry_task(job_id)
    return recovered


async def _terminate_process_tree(job: SimJob) -> None:
    """Terminate descendants first, then the simulator process itself."""
    try:
        import psutil

        parent = psutil.Process(job.pid)
        children = parent.children(recursive=True)
        for child in reversed(children):
            child.terminate()
        parent.terminate()
        _, alive = psutil.wait_procs([*children, parent], timeout=10)
        for process in alive:
            process.kill()
        if job.process is not None:
            try:
                await asyncio.wait_for(job.process.wait(), timeout=10)
            except Exception:
                pass
        return
    except Exception as exc:
        logger.warning("Process-tree termination fallback for %s: %s", job.job_id, exc)
    if job.process is not None:
        job.process.kill()
        await job.process.wait()


async def _terminate_recovered_process(job: SimJob) -> bool:
    """Best-effort termination for a recovered PID; confirm it is gone."""
    from . import job_store

    try:
        import psutil

        parent = psutil.Process(job.pid)
        children = parent.children(recursive=True)
        targets = [*children, parent]
        for process in reversed(children):
            process.terminate()
        parent.terminate()
        _, alive = await asyncio.to_thread(psutil.wait_procs, targets, timeout=10)
        for process in alive:
            process.kill()
        if alive:
            await asyncio.to_thread(psutil.wait_procs, alive, timeout=10)
    except Exception as exc:
        logger.warning("Recovered process-tree termination failed for %s: %s", job.job_id, exc)
    return not job_store.is_pid_alive(job.pid)


# ---------------------------------------------------------------------------
# Background monitor coroutine
# ---------------------------------------------------------------------------

async def _monitor_job(job_id: str) -> None:
    """Wait for a simulation process to finish and update its status."""
    job = _sim_jobs.get(job_id)
    if not job:
        return

    if not job.process:
        await _monitor_recovered_job(job)
        return

    proc = job.process

    try:
        if job.unlimited:
            await proc.wait()
        else:
            # The live asyncio process uses the event-loop monotonic clock;
            # ``start_ts`` is wall-clock metadata and may be intentionally
            # synthetic in tests or jump after NTP/time-zone corrections.
            try:
                elapsed = asyncio.get_running_loop().time() - job.start_time
            except RuntimeError:
                elapsed = time.time() - job.start_ts
            remaining = max(0.0, job.timeout - max(0.0, elapsed))
            await asyncio.wait_for(proc.wait(), timeout=remaining)
        job.returncode = proc.returncode
        job.status = "completed" if proc.returncode == 0 else "failed"
    except asyncio.TimeoutError:
        try:
            await _terminate_process_tree(job)
        except Exception:
            pass
        job.status = "timeout"
    except Exception as exc:
        job.status = "error"
        job.error = str(exc)
    finally:
        # BUG-002: Close the log file handle now that the process is
        # done, whether it exited normally, timed out, or errored.
        # The handle is stored on SimJob so _monitor_job can access
        # it even though it runs as a separate asyncio task.
        lf = getattr(job, "_log_file", None)
        if lf is not None:
            try:
                lf.close()
            except Exception:
                pass
            job._log_file = None  # type: ignore[union-assign]

    # Record the monotonic end time *after* the process has finished so
    # that duration calculations (end_time - start_time) are correct.
    try:
        loop = asyncio.get_running_loop()
        job.end_time = loop.time()
    except RuntimeError:
        job.end_time = time.time()
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

    await _notify_terminal_job(job)

    logger.info(
        "Simulation ended: job=%s status=%s rc=%s",
        job_id, job.status, job.returncode,
    )


async def _monitor_recovered_job(job: SimJob) -> None:
    """Poll a persisted PID when an asyncio Process handle was lost."""
    from . import job_store

    while job.status == "running":
        if not job_store.is_pid_alive(job.pid):
            _apply_dead_process_terminal_status(
                job,
                "process exited while the service was disconnected; "
                "return code and credible terminal artifacts are unavailable",
            )
            break
        if not job_store.is_pid_ours(job.pid, job.start_ts, job.deck_file):
            if not job_store.is_pid_alive(job.pid):
                _apply_dead_process_terminal_status(
                    job,
                    "process exited during identity verification and credible "
                    "terminal artifacts are unavailable",
                )
            else:
                job.status = "interrupted"
                job.error = "process identity no longer matches the recorded simulation"
            break
        elapsed = max(0.0, time.time() - job.start_ts) if job.start_ts > 0 else 0.0
        if job.start_ts > 0 and not job.unlimited and elapsed >= job.timeout:
            if await _terminate_recovered_process(job):
                job.status = "timeout"
                break
            job.error = (
                "timeout reached but the recovered process is still alive; "
                "termination will be retried"
            )
        await asyncio.sleep(5)

    job.end_ts = time.time()
    job_store.update_job_status(
        job.job_id,
        job.status,
        returncode=job.returncode,
        error=job.error,
        end_ts=job.end_ts,
    )
    await _notify_terminal_job(job)


def _is_simulation_monitor_cron(spec: Any, job_id: str) -> bool:
    """Return whether a recurring cron specifically monitors *job_id*."""
    if getattr(getattr(spec, "schedule", None), "type", None) != "cron":
        return False

    request = getattr(spec, "request", None)
    structured_sources = (
        getattr(spec, "meta", None),
        getattr(getattr(spec, "dispatch", None), "meta", None),
        getattr(request, "request_context", None),
    )
    structured_job_match = False
    explicit_monitor_role = False
    for source in structured_sources:
        if not isinstance(source, dict):
            continue
        if str(source.get("simulation_job_id") or "") == job_id:
            structured_job_match = True
        role = str(
            source.get("simulation_role")
            or source.get("automation_role")
            or source.get("role")
            or ""
        ).strip().casefold()
        if role in {"simulation_monitor", "monitor", "monitoring"}:
            explicit_monitor_role = True

    request_input = getattr(request, "input", None)
    if isinstance(request_input, str):
        request_text = request_input
    else:
        try:
            request_text = json.dumps(request_input, ensure_ascii=False, default=str)
        except Exception:
            request_text = str(request_input or "")
    haystack = "\n".join(
        str(value or "")
        for value in (
            getattr(spec, "name", ""),
            getattr(spec, "text", ""),
            request_text,
        )
    )
    exact_job_id = structured_job_match or re.search(
        rf"(?<![A-Za-z0-9_]){re.escape(job_id)}(?![A-Za-z0-9_])",
        haystack,
    )
    monitor_semantics = re.search(
        r"监测|监控|检查.{0,24}(?:状态|进度|模拟|仿真|job)|"
        r"(?:模拟|仿真).{0,24}(?:状态|进度)|"
        r"\bmonitor(?:ing)?\b|\bcheck.{0,24}(?:status|progress)\b",
        haystack,
        re.IGNORECASE,
    )
    return bool(exact_job_id) and (explicit_monitor_role or monitor_semantics is not None)


async def _cleanup_simulation_monitor_crons(job: SimJob) -> list[str]:
    """Delete recurring monitors once their simulation reaches a terminal state."""
    from qwenpaw.plugins.registry import PluginRegistry

    manager = PluginRegistry().get_workspace_manager()
    if manager is None:
        raise RuntimeError("workspace manager is not ready for cron cleanup")
    agent_id = str(job.extra.get("agent_id") or "default")
    workspace = await manager.get_agent(agent_id)
    cron_manager = getattr(workspace, "cron_manager", None)
    if cron_manager is None:
        raise RuntimeError(f"cron manager is unavailable for agent {agent_id}")

    deleted: list[str] = []
    failures: list[str] = []
    for spec in await cron_manager.list_jobs():
        cron_id = str(getattr(spec, "id", None) or "")
        if cron_id and _is_simulation_monitor_cron(spec, job.job_id):
            try:
                await cron_manager.delete_job(cron_id)
                deleted.append(cron_id)
            except Exception as exc:
                failures.append(f"{cron_id}: {exc}")
    if deleted:
        logger.info(
            "Deleted terminal simulation monitor cron jobs for %s: %s",
            job.job_id,
            ", ".join(deleted),
        )
    if failures:
        raise RuntimeError("failed to delete simulation monitor cron(s): " + "; ".join(failures))
    return deleted


def _ensure_cleanup_retry_task(job_id: str) -> None:
    task = _cleanup_tasks.get(job_id)
    if task is not None and not task.done():
        return
    coroutine = _retry_simulation_monitor_cleanup(job_id)
    try:
        task = asyncio.create_task(
            coroutine,
            name=f"ugsci-sim-cleanup-{job_id}",
        )
    except RuntimeError:
        coroutine.close()
        return
    _cleanup_tasks[job_id] = task
    task.add_done_callback(lambda _: _cleanup_tasks.pop(job_id, None))


async def _retry_simulation_monitor_cleanup(job_id: str) -> None:
    """Retry failed cron cleanup without repeatedly waking the model."""
    from . import job_store

    retry_index = 0
    while True:
        delay = _CLEANUP_RETRY_DELAYS[min(retry_index, len(_CLEANUP_RETRY_DELAYS) - 1)]
        await asyncio.sleep(delay)
        job = _sim_jobs.get(job_id)
        if job is None:
            return
        stored = job_store.load_job(job_id)
        if not stored or str(stored.get("cron_cleanup_status") or "") == "completed":
            return
        try:
            attempts = int(stored.get("cron_cleanup_attempts") or 0) + 1
        except (TypeError, ValueError, OverflowError):
            attempts = 1
        try:
            await _cleanup_simulation_monitor_crons(job)
        except Exception as exc:
            try:
                job_store.update_job_fields(
                    job_id,
                    cron_cleanup_status="failed",
                    cron_cleanup_attempts=attempts,
                    cron_cleanup_error=repr(exc),
                )
            except Exception:
                logger.exception("Failed to persist cron cleanup failure for %s", job_id)
            retry_index += 1
            continue
        try:
            job_store.update_job_fields(
                job_id,
                cron_cleanup_status="completed",
                cron_cleanup_attempts=attempts,
                cron_cleanup_error=None,
            )
        except Exception:
            logger.exception("Failed to persist cron cleanup success for %s", job_id)
        job.extra["cron_cleanup_status"] = "completed"
        return


async def _notify_terminal_job(job: SimJob) -> None:
    """Publish the terminal event, diagnose safely, and resume the agent."""
    from . import job_store

    diagnosis: dict[str, Any] = {}
    tuning_candidate: dict[str, Any] | None = None
    try:
        stored = job_store.load_job(job.job_id)
    except Exception as exc:
        # Unit callers and legacy in-memory jobs may not have a durable record;
        # do not turn a completed process into a failed monitor task.
        logger.warning("Skipping terminal orchestration for %s: %s", job.job_id, exc)
        return
    if not stored:
        return
    if str(stored.get("cron_cleanup_status") or "pending") != "completed":
        try:
            attempts = int(stored.get("cron_cleanup_attempts") or 0) + 1
        except (TypeError, ValueError, OverflowError):
            attempts = 1
        try:
            await _cleanup_simulation_monitor_crons(job)
            try:
                job_store.update_job_fields(
                    job.job_id,
                    cron_cleanup_status="completed",
                    cron_cleanup_attempts=attempts,
                    cron_cleanup_error=None,
                )
            except Exception:
                logger.exception(
                    "Failed to persist cron cleanup success for %s",
                    job.job_id,
                )
            job.extra["cron_cleanup_status"] = "completed"
        except Exception as exc:
            try:
                job_store.update_job_fields(
                    job.job_id,
                    cron_cleanup_status="failed",
                    cron_cleanup_attempts=attempts,
                    cron_cleanup_error=repr(exc),
                )
            except Exception:
                logger.exception(
                    "Failed to persist cron cleanup failure for %s",
                    job.job_id,
                )
            job.extra["cron_cleanup_status"] = "failed"
            logger.exception(
                "Failed to clean up recurring simulation monitors for %s",
                job.job_id,
            )
            _ensure_cleanup_retry_task(job.job_id)
    try:
        from qwenpaw.app.inbox_store import append_event

        if job_store.claim_terminal_notification(job.job_id):
            await append_event(
                agent_id=str(job.extra.get("agent_id") or "default"),
                source_type="simulation",
                source_id=job.job_id,
                event_type="simulation_terminal",
                status=job.status,
                severity="info" if job.status == "completed" else "warning",
                title=f"Simulation {job.status}: {Path(job.deck_file).name}",
                body=job.error or f"Job {job.job_id} reached terminal state {job.status}.",
                payload={
                    "job_id": job.job_id,
                    "pid": job.pid,
                    "status": job.status,
                    "session_id": str(job.extra.get("session_id") or ""),
                    "resume_prompt": f"Inspect simulation job {job.job_id}, diagnose its terminal state, and continue the workflow.",
                },
            )
            job.extra["terminal_notified"] = True
    except Exception:
        try:
            job_store.update_job_fields(job.job_id, terminal_notified=False)
        except Exception:
            pass
        logger.exception("Failed to publish simulation terminal event: %s", job.job_id)

    # Cleanup retries are deliberately independent from model orchestration.
    # A restart after a transient cron-manager failure must not consume another
    # diagnosis round or generate a second tuning candidate after the wake was
    # already delivered successfully.
    if str(stored.get("wake_status") or "pending") == "completed":
        return

    try:
        from .autotune import (
            create_tuning_candidate,
            diagnose_terminal_job,
            max_diagnosis_rounds,
        )

        rounds = int(stored.get("diagnosis_rounds") or 0)
        stored_diagnosis = stored.get("diagnosis")
        if rounds > 0 and isinstance(stored_diagnosis, dict):
            diagnosis = dict(stored_diagnosis)
            tuning_candidate = stored.get("tuning_candidate")
        elif rounds < max_diagnosis_rounds():
            diagnosis = diagnose_terminal_job(job)
            rounds += 1
            tuning_candidate = create_tuning_candidate(
                job,
                diagnosis,
                attempt=rounds,
            )
            job.extra["diagnosis"] = diagnosis
            job.extra["diagnosis_rounds"] = rounds
            if tuning_candidate:
                job.extra["tuning_candidate"] = tuning_candidate
            job_store.update_job_fields(
                job.job_id,
                diagnosis=diagnosis,
                diagnosis_rounds=rounds,
                tuning_candidate=tuning_candidate,
            )
        else:
            diagnosis = dict(stored.get("diagnosis") or {})
            tuning_candidate = stored.get("tuning_candidate")
    except Exception as exc:
        diagnosis = {
            "job_id": job.job_id,
            "status": job.status,
            "category": "diagnosis_error",
            "evidence": [str(exc)],
            "recommendations": ["Inspect the simulator log manually."],
        }
        logger.exception("Automatic simulation diagnosis failed: %s", job.job_id)

    await _resume_agent_with_retries(job, diagnosis, tuning_candidate)


async def _resume_agent_with_retries(
    job: SimJob,
    diagnosis: dict[str, Any],
    tuning_candidate: dict[str, Any] | None,
) -> None:
    from . import job_store

    max_attempts = 3
    for delay in (0, 2, 10):
        if delay:
            await asyncio.sleep(delay)
        claimed, attempt, run_key = job_store.claim_wake_attempt(
            job.job_id,
            max_attempts=max_attempts,
        )
        if not claimed:
            return
        try:
            result = await _run_agent_resume(
                job,
                diagnosis,
                tuning_candidate,
                run_key=run_key,
                attempt=attempt,
            )
            if result.get("delivery_status") not in {"success", "suppressed"}:
                raise RuntimeError(
                    f"agent resume delivery was not successful: {result.get('delivery_status')}"
                )
            try:
                finished = job_store.finish_wake_attempt(
                    job.job_id,
                    success=True,
                    run_id=str(result.get("run_id") or ""),
                    attempt=attempt,
                )
            except Exception as exc:
                logger.exception("Failed to persist successful wake for %s", job.job_id)
                await _publish_resume_failure(job, exc)
                return
            if finished is False:
                logger.warning("Wake lease became stale for %s", job.job_id)
                return
            job.extra["wake_status"] = "completed"
            return
        except Exception as exc:
            retryable = attempt < max_attempts
            try:
                job_store.finish_wake_attempt(
                    job.job_id,
                    success=False,
                    error=repr(exc),
                    retryable=retryable,
                    attempt=attempt,
                )
            except Exception:
                logger.exception("Failed to persist wake failure for %s", job.job_id)
            logger.exception(
                "Agent resume attempt %d failed for simulation %s",
                attempt,
                job.job_id,
            )
            if not retryable:
                await _publish_resume_failure(job, exc)
                return


async def _run_agent_resume(
    job: SimJob,
    diagnosis: dict[str, Any],
    tuning_candidate: dict[str, Any] | None,
    *,
    run_key: str,
    attempt: int,
) -> dict[str, Any]:
    from datetime import datetime, timezone

    from qwenpaw.app.crons.executor import CronExecutor
    from qwenpaw.app.crons.models import (
        CronJobRequest,
        CronJobSpec,
        DispatchSpec,
        DispatchTarget,
        JobRuntimeSpec,
        ScheduleSpec,
    )
    from qwenpaw.app.channels.schema import DEFAULT_CHANNEL
    from qwenpaw.plugins.registry import PluginRegistry

    agent_id = str(job.extra.get("agent_id") or "default")
    session_id = str(job.extra.get("session_id") or f"simulation:{job.job_id}")
    user_id = str(job.extra.get("user_id") or "console")
    channel = str(job.extra.get("channel") or DEFAULT_CHANNEL)
    manager = PluginRegistry().get_workspace_manager()
    if manager is None:
        raise RuntimeError("workspace manager is not ready")
    workspace = await manager.get_agent(agent_id)
    channel_manager = workspace.channel_manager
    if channel_manager is None:
        raise RuntimeError(f"channel manager is unavailable for agent {agent_id}")

    candidate_text = "No automatic parameter candidate was produced."
    if tuning_candidate:
        candidate_text = json.dumps(tuning_candidate, ensure_ascii=False, indent=2)
    prompt = (
        "A long-running numerical simulation reached a terminal state. "
        "Resume the original workflow automatically and act conservatively.\n\n"
        f"Job: {job.job_id}\nStatus: {job.status}\nDeck: {job.deck_file}\n"
        f"Idempotency key: {run_key}\nWake attempt: {attempt}\n\n"
        "Structured diagnosis:\n"
        f"{json.dumps(diagnosis, ensure_ascii=False, indent=2)}\n\n"
        "Bounded tuning candidate (the original deck was not modified):\n"
        f"{candidate_text}\n\n"
        "Check the job status and logs, validate the diagnosis, and explain the result. "
        "If a candidate exists, verify its manifest and parameter bounds. Relaunch it only "
        "when approval_required is false or the user has already approved; otherwise ask for "
        "approval. Never overwrite the original deck, stop after the configured diagnosis "
        "rounds, compare convergence before/after when re-running, and fail closed on ambiguity."
    )
    spec = CronJobSpec(
        id=f"ugsci-resume-{job.job_id}",
        name=f"Resume simulation {job.job_id}",
        schedule=ScheduleSpec(type="once", run_at=datetime.now(timezone.utc)),
        task_type="agent",
        request=CronJobRequest(
            input=prompt,
            session_id=session_id,
            user_id=user_id,
            request_context={
                "source": "simulation_resume",
                "simulation_job_id": job.job_id,
                "idempotency_key": run_key,
            },
        ),
        dispatch=DispatchSpec(
            channel=channel,
            target=DispatchTarget(user_id=user_id, session_id=session_id),
            mode="stream",
            silent=False,
            meta={"simulation_job_id": job.job_id, "idempotency_key": run_key},
        ),
        runtime=JobRuntimeSpec(
            timeout_seconds=900,
            share_session=True,
            tool_safety=False,
        ),
    )
    return await CronExecutor(
        workspace=workspace,
        channel_manager=channel_manager,
    ).execute(spec)


async def _publish_resume_failure(job: SimJob, error: Exception) -> None:
    try:
        from qwenpaw.app.inbox_store import append_event

        await append_event(
            agent_id=str(job.extra.get("agent_id") or "default"),
            source_type="simulation",
            source_id=job.job_id,
            event_type="simulation_resume_failed",
            status="failed",
            severity="error",
            title=f"Automatic resume failed: {Path(job.deck_file).name}",
            body=f"The model could not be resumed after bounded retries: {error}",
            payload={"job_id": job.job_id, "session_id": job.extra.get("session_id")},
        )
    except Exception:
        logger.exception("Failed to publish resume failure fallback: %s", job.job_id)
