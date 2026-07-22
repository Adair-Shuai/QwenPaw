# -*- coding: utf-8 -*-
"""wait_for_simulation — block until a simulation finishes or progress stalls.

This tool solves the **token-burn problem** when an agent needs to monitor
a long-running simulation.  Without it, the agent calls
``check_simulation_status`` in a loop, and each iteration costs a full LLM
round-trip (receive result → reason → decide to check again → generate
next tool call).  For a 2-hour simulation checked every 30 seconds, that
is ~240 LLM calls — thousands of tokens wasted on "the simulation is still
running".

``wait_for_simulation`` does the polling **internally in Python** — zero
LLM tokens consumed.  The agent makes a single tool call; the tool blocks
until one of these exit conditions is met:

1. **Job finished** — status becomes ``completed``, ``failed``, ``timeout``,
   or ``error``.
2. **Max wait reached** — ``max_wait_seconds`` elapsed (default 300s = 5 min).
3. **Progress stall** — no convergence progress for ``stall_timeout`` seconds
   (default 120s).  Useful for detecting frozen simulators.
4. **Error** — the job or process disappeared.

The tool returns a concise status report.  If the job is still running
when the tool returns, the agent can call it again (one more LLM call)
or switch to a different strategy.

For truly long-running jobs (hours), combine with the cron system::

    # Agent sets up a scheduled check in 30 minutes
    qwenpaw cron create --type agent --schedule-type scheduled \\
      --run-at "<30 minutes later>" --text "检查 job <job_id> 状态" \\
      --channel <channel> --agent-id <agent_id>

This way the agent sleeps and is woken only when needed — zero polling
tokens.
"""
from __future__ import annotations

import asyncio
import time
from typing import Any

import logging
_logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.sim")


async def wait_for_simulation(
    job_id: str,
    poll_interval: float = 10.0,
    max_wait_seconds: float = 300.0,
    stall_timeout: float = 120.0,
    detail_level: str = "summary",
) -> Any:
    """Wait for a simulation to finish, polling internally (zero LLM tokens).

    This tool blocks the agent's ReAct loop until the simulation finishes
    or a timeout is reached.  No LLM tokens are consumed during the wait
    — polling happens entirely in Python.

    Typical usage::

        # Launch a simulation
        result = launch_simulation(simulator="eclipse", deck_file="model.DATA")
        job_id = result["job_id"]

        # Wait up to 5 minutes for it to finish
        status = wait_for_simulation(job_id=job_id, max_wait_seconds=300)

        if status["finished"]:
            results = read_simulation_results(job_id=job_id)
        else:
            # Still running — set up a cron check for later
            ...

    Args:
        job_id (`str`):
            The job_id returned by ``launch_simulation``.
        poll_interval (`float`):
            Seconds between status checks.  Default 10s.
            Increase to 30-60s for very long simulations to reduce
            filesystem I/O.
        max_wait_seconds (`float`):
            Maximum total wait time.  Default 300s (5 minutes).
            The tool returns after this time even if the job is still
            running.  Set to 0 for no timeout (wait forever — not
            recommended).
        stall_timeout (`float`):
            If no progress (no new time steps) is detected for this
            many seconds, the tool returns early with a "stalled"
            status.  Default 120s.  Set to 0 to disable stall detection.
        detail_level (`str`):
            Detail level for the returned status report:
            - ``"summary"``: basic status + elapsed time.
            - ``"convergence"``: + convergence indicators.
            - ``"full"``: + recent warnings/errors.

    Returns:
        ``ToolChunk``: Contains a status report.  The text includes
        whether the job finished, current status, elapsed time, and
        (if applicable) convergence info.
    """
    from agentscope.message import TextBlock, ToolResultState
    from agentscope.tool import ToolChunk

    from .launcher import _get_job
    from .monitor import check_simulation_status

    job = _get_job(job_id)
    if not job:
        return ToolChunk(
            is_last=True,
            state=ToolResultState.ERROR,
            content=[
                TextBlock(
                    type="text",
                    text=f"Error: Job '{job_id}' not found.",
                ),
            ],
        )

    # ── Fast path: already finished ─────────────────────────────────
    terminal_states = {"completed", "failed", "timeout", "error"}
    if job.status in terminal_states:
        return ToolChunk(
            is_last=True,
            state=ToolResultState.SUCCESS,
            content=[
                TextBlock(
                    type="text",
                    text=(
                        f"Job {job_id} already finished: {job.status}\n"
                        f"  Return code: {job.returncode}\n"
                        f"  Error: {job.error or 'none'}\n\n"
                        f"Use read_simulation_results(job_id=\"{job_id}\") "
                        f"to view the output."
                    ),
                ),
            ],
        )

    # ── Poll loop ──────────────────────────────────────────────────
    start_wait = time.time()
    last_progress_step: int | None = None
    last_progress_time = time.time()
    poll_count = 0
    stall_detected = False

    _logger.info(
        "wait_for_simulation: job=%s polling every %ss, max_wait=%ss",
        job_id, poll_interval, max_wait_seconds,
    )

    while True:
        poll_count += 1
        elapsed = time.time() - start_wait

        # Check max_wait
        if max_wait_seconds > 0 and elapsed >= max_wait_seconds:
            break

        # Refresh job from memory / recovery
        job = _get_job(job_id)
        if not job:
            break

        # Check terminal status
        if job.status in terminal_states:
            break

        # Check stall: try to parse progress for new time steps
        if stall_timeout > 0:
            try:
                from ..adapters import get_adapter
                adapter = get_adapter(job.simulator)
                progress = adapter.parse_progress(job.working_dir)
                current_step = progress.current_step or 0
                if last_progress_step is not None and current_step == last_progress_step:
                    if time.time() - last_progress_time >= stall_timeout:
                        stall_detected = True
                        break
                else:
                    last_progress_step = current_step
                    last_progress_time = time.time()
            except Exception:
                # Progress parse failed — don't trigger stall on errors
                pass

        # Sleep (but check max_wait remaining)
        remaining = max_wait_seconds - elapsed if max_wait_seconds > 0 else poll_interval
        sleep_time = min(poll_interval, remaining) if remaining > 0 else poll_interval
        await asyncio.sleep(max(1.0, sleep_time))

    # ── Build result ───────────────────────────────────────────────
    job = _get_job(job_id) or job  # Final refresh
    total_waited = time.time() - start_wait
    finished = job.status in terminal_states

    lines = [
        f"Wait complete for job: {job_id}",
        f"  Status:     {job.status}",
        f"  Waited:     {total_waited:.0f}s ({poll_count} polls)",
    ]

    if job.returncode is not None:
        lines.append(f"  Return code: {job.returncode}")
    if job.error:
        lines.append(f"  Error:      {job.error}")
    if stall_detected:
        lines.append(f"  ⚠ Stalled: no progress for {stall_timeout}s")

    lines.append("")

    if finished:
        lines.append("✅ Simulation finished!")
        lines.append(
            f"Use read_simulation_results(job_id=\"{job_id}\") "
            f"to view the output.",
        )
    else:
        lines.append("⏳ Simulation still running.")
        lines.append(f"  Elapsed: {total_waited:.0f}s")
        if stall_detected:
            lines.append("  The simulation may be frozen — consider checking")
            lines.append("  the log file or killing the job.")
        else:
            lines.append("  Call wait_for_simulation again to continue waiting,")
            lines.append("  or set up a cron check for later:")
            lines.append(
                f"  qwenpaw cron create --type agent --schedule-type scheduled "
                f'--run-at "<10 minutes later>" '
                f'--text "检查 job {job_id} 状态" '
                f"--channel <channel> --agent-id <agent_id>",
            )

    # Add convergence info if requested
    if detail_level in ("convergence", "full") and not stall_detected:
        try:
            from ..adapters import get_adapter
            adapter = get_adapter(job.simulator)
            progress = adapter.parse_progress(job.working_dir)
            if progress.current_time:
                lines.append("")
                lines.append("--- Convergence ---")
                lines.append(f"  Sim time:     {progress.current_time}")
                if progress.target_time:
                    lines.append(f"  Target time:  {progress.target_time}")
                lines.append(f"  Time steps:   {progress.current_step}")
                lines.append(f"  Newton iter:  {progress.newton_iterations}")
                if progress.material_balance_error is not None:
                    lines.append(
                        f"  Mat. balance: {progress.material_balance_error:.2e}",
                    )
                if progress.cfl_number is not None:
                    lines.append(f"  CFL number:   {progress.cfl_number:.2f}")
        except Exception:
            pass

    return ToolChunk(
        is_last=True,
        state=ToolResultState.SUCCESS,
        content=[TextBlock(type="text", text="\n".join(lines))],
    )
