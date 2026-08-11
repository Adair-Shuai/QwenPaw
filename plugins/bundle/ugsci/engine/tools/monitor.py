# -*- coding: utf-8 -*-
"""check_simulation_status — query the status of a running simulation."""
from __future__ import annotations

import logging
import time
from typing import Any

_logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.sim")


async def check_simulation_status(
    job_id: str,
    detail_level: str = "summary",
) -> Any:
    """Check the status of a simulation job.

    Args:
        job_id (`str`):
            The job_id returned by ``launch_simulation``.
        detail_level (`str`):
            Level of detail to return:
            - ``"summary"``: status, elapsed time, basic progress.
            - ``"convergence"``: summary + convergence indicators
              (Newton iterations, material balance error, CFL).
            - ``"full"``: convergence + recent warnings/errors from log.

    Returns:
        ``ToolChunk``: Contains status information as formatted text.
    """
    from agentscope.message import TextBlock, ToolResultState
    from agentscope.tool import ToolChunk

    if detail_level not in {"summary", "convergence", "full"}:
        return ToolChunk(
            is_last=True,
            state=ToolResultState.ERROR,
            content=[TextBlock(type="text", text="Error: detail_level must be summary, convergence, or full.")],
        )

    from .launcher import (
        _apply_dead_process_terminal_status,
        _ensure_terminal_task,
        _get_job,
    )
    from ..adapters import get_adapter

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

    if job.status == "running" and job.process is None:
        from . import job_store
        if not job_store.is_pid_alive(job.pid):
            _apply_dead_process_terminal_status(
                job,
                "recovered process is no longer alive and credible terminal "
                "artifacts are unavailable",
            )
            job.end_ts = time.time()
            job_store.update_job_status(
                job.job_id,
                job.status,
                returncode=job.returncode,
                error=job.error,
                end_ts=job.end_ts,
            )
            _ensure_terminal_task(job.job_id)
        elif not job_store.is_pid_ours(job.pid, job.start_ts, job.deck_file):
            if not job_store.is_pid_alive(job.pid):
                _apply_dead_process_terminal_status(
                    job,
                    "recovered process exited during identity verification and "
                    "credible terminal artifacts are unavailable",
                )
            else:
                job.status = "interrupted"
                job.error = "recovered process no longer matches the recorded simulation"
            job.end_ts = time.time()
            job_store.update_job_status(
                job.job_id,
                job.status,
                returncode=job.returncode,
                error=job.error,
                end_ts=job.end_ts,
            )
            _ensure_terminal_task(job.job_id)

    # ── Build status text ────────────────────────────────────────────
    lines = [
        f"Job ID:      {job.job_id}",
        f"Simulator:   {job.simulator}",
        f"Status:      {job.status}",
        f"Input file:  {job.deck_file}",
        f"Working dir: {job.working_dir}",
        f"PID:         {job.pid}",
    ]

    # Elapsed / duration — prefer wall-clock time (survives restart)
    if job.status == "running":
        if job.start_ts > 0:
            elapsed = time.time() - job.start_ts
        else:
            elapsed = time.time() - job.start_time
        lines.append(
            f"Elapsed:     {elapsed:.0f}s ({elapsed/3600:.1f}h)",
        )
        if job.unlimited:
            lines.append("Remaining:   unlimited")
        else:
            remaining = max(0.0, job.timeout - elapsed)
            lines.append(f"Remaining:   {remaining:.0f}s ({remaining/3600:.1f}h)")
    elif job.end_ts and job.start_ts:
        duration = job.end_ts - job.start_ts
        lines.append(
            f"Duration:    {duration:.0f}s ({duration/3600:.1f}h)",
        )
    elif job.end_time:
        duration = job.end_time - job.start_time
        lines.append(
            f"Duration:    {duration:.0f}s ({duration/3600:.1f}h)",
        )

    if job.returncode is not None:
        lines.append(f"Return code: {job.returncode}")

    if job.error:
        lines.append(f"Error:       {job.error}")

    # ── Convergence detail ───────────────────────────────────────────
    if detail_level in ("convergence", "full"):
        try:
            adapter = get_adapter(job.simulator)
            progress = adapter.parse_progress(job.working_dir)

            lines.append("")
            lines.append("--- Convergence ---")
            if progress.current_time:
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
            if progress.time_step_size:
                lines.append(f"  DT size:      {progress.time_step_size}")
        except Exception as exc:
            lines.append(f"  (Log parse failed: {exc})")

    # ── Warnings / errors ────────────────────────────────────────────
    if detail_level == "full":
        try:
            adapter = get_adapter(job.simulator)
            warnings = adapter.parse_warnings(job.working_dir, limit=15)

            if warnings:
                lines.append("")
                lines.append("--- Recent warnings/errors ---")
                for w in warnings:
                    icon = "⚠" if w.level == "warning" else "✖"
                    lines.append(f"  {icon} L{w.line_number}: {w.message}")
            else:
                lines.append("")
                lines.append("--- No warnings detected ---")
        except Exception as exc:
            _logger.debug("Failed to parse warnings for job %s: %s", job_id, exc)

    return ToolChunk(
        is_last=True,
        state=ToolResultState.SUCCESS,
        content=[TextBlock(type="text", text="\n".join(lines))],
    )
