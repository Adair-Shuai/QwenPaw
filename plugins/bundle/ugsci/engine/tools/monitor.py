# -*- coding: utf-8 -*-
"""check_simulation_status — query the status of a running simulation."""
from __future__ import annotations

import asyncio
from typing import Any

logger = logging = __import__("logging").getLogger("qwenpaw.plugin.ugsci.sim")


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
    from agentscope.message import TextBlock
    from agentscope.tool import ToolChunk, ToolResultState

    from .launcher import _sim_jobs

    job = _sim_jobs.get(job_id)
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

    loop = asyncio.get_event_loop()

    # ── Build status text ────────────────────────────────────────────
    lines = [
        f"Job ID:      {job.job_id}",
        f"Simulator:   {job.simulator}",
        f"Status:      {job.status}",
        f"Input file:  {job.deck_file}",
        f"Working dir: {job.working_dir}",
        f"PID:         {job.pid}",
    ]

    # Elapsed / duration
    if job.status == "running":
        elapsed = loop.time() - job.start_time
        lines.append(
            f"Elapsed:     {elapsed:.0f}s ({elapsed/3600:.1f}h)",
        )
        remaining = job.timeout - elapsed
        lines.append(
            f"Remaining:   {remaining:.0f}s ({remaining/3600:.1f}h)",
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
            from ..adapters import get_adapter

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
        except Exception:
            pass

    return ToolChunk(
        is_last=True,
        state=ToolResultState.SUCCESS,
        content=[TextBlock(type="text", text="\n".join(lines))],
    )
