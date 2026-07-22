# -*- coding: utf-8 -*-
"""read_simulation_results — read summary and field data from a completed (or running) simulation."""
from __future__ import annotations

import json
from typing import Any

import logging
_logger = logging.getLogger("qwenpaw.plugin.ugsci.sim")


async def read_simulation_results(
    job_id: str,
    data_type: str = "summary",
    variables: list[str] | None = None,
    wells: list[str] | None = None,
    max_points: int = 200,
) -> Any:
    """Read result data from a simulation job.

    Args:
        job_id (`str`):
            The job_id returned by ``launch_simulation``.
        data_type (`str`):
            Type of data to read:
            - ``"summary"``: Field-level summary vectors (FOPR, FPR, etc.)
            - ``"well"``: Well-level vectors (WOPR, WWPR per well)
            - ``"report"``: Text report summary from the log file
            - ``"all"``: Both summary and well data
        variables (`list[str] | None`):
            Variable names to extract (e.g. ``["FOPR", "FPR", "FWCT"]``).
            ``None`` means extract all available.
        wells (`list[str] | None`):
            Well names for well-level data.  ``None`` means all wells.
        max_points (`int`):
            Maximum data points per variable (downsampled if exceeded).
            Default 200 to keep the response compact.

    Returns:
        ``ToolChunk``: Contains formatted text with result data.
    """
    from agentscope.message import TextBlock, ToolResultState
    from agentscope.tool import ToolChunk

    from .launcher import _get_job

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

    try:
        from ..adapters import get_adapter
        adapter = get_adapter(job.simulator)
    except Exception as exc:
        return ToolChunk(
            is_last=True,
            state=ToolResultState.ERROR,
            content=[
                TextBlock(
                    type="text",
                    text=f"Error: Cannot find adapter for '{job.simulator}': {exc}",
                ),
            ],
        )

    lines = [
        f"Simulation results for job: {job_id}",
        f"Simulator: {job.simulator}",
        f"Status:    {job.status}",
        f"Deck:      {job.deck_file}",
        "",
    ]

    # ── Report mode: extract text summary from log ──────────────────
    if data_type == "report":
        log_file = adapter.find_log_file(job.working_dir)
        if log_file and log_file.is_file():
            tail = adapter._read_log_tail(log_file, 80)
            lines.append("--- Report (last 80 lines of log) ---")
            lines.append(tail)
        else:
            lines.append("No log file found.")
        return ToolChunk(
            is_last=True,
            state=ToolResultState.SUCCESS,
            content=[TextBlock(type="text", text="\n".join(lines))],
        )

    # ── Summary / well data ──────────────────────────────────────────
    summary = adapter.read_summary(
        job.working_dir,
        variables=variables,
        wells=wells,
    )

    if not summary.vectors and not summary.well_vectors:
        lines.append("No summary data could be extracted.")
        lines.append(
            "This may be because the simulation has not produced "
            "output yet, or the result file format requires a "
            "specialized parser.",
        )
        return ToolChunk(
            is_last=True,
            state=ToolResultState.SUCCESS,
            content=[TextBlock(type="text", text="\n".join(lines))],
        )

    # ── Format field-level vectors ───────────────────────────────────
    if data_type in ("summary", "all") and summary.vectors:
        lines.append("--- Field-level summary vectors ---")
        lines.append(f"  Dates: {len(summary.dates)} time steps")
        if summary.dates:
            lines.append(f"  First: {summary.dates[0]}")
            lines.append(f"  Last:  {summary.dates[-1]}")
        lines.append("")

        for vec_name, data_points in sorted(summary.vectors.items()):
            if variables and vec_name.upper() not in [v.upper() for v in variables]:
                continue
            # Downsample
            if len(data_points) > max_points:
                step = len(data_points) / max_points
                sampled = [
                    data_points[int(i * step)]
                    for i in range(max_points)
                ]
            else:
                sampled = data_points

            values = [v for _, v in sampled]
            if values:
                lines.append(f"  {vec_name}:")
                lines.append(
                    f"    points={len(data_points)} "
                    f"min={min(values):.4g} "
                    f"max={max(values):.4g} "
                    f"last={values[-1]:.4g}",
                )
                # Show first/last few points
                preview = sampled[:5] + (["..."] if len(sampled) > 10 else []) + sampled[-5:]
                pts_parts: list[str] = []
                for item in preview:
                    if isinstance(item, tuple):
                        t, v = item
                        pts_parts.append(f"{t:.1f}:{v:.4g}")
                    else:
                        pts_parts.append(str(item))
                if pts_parts:
                    lines.append(f"    preview: {', '.join(pts_parts)}")
        lines.append("")

    # ── Format well-level vectors ────────────────────────────────────
    if data_type in ("well", "all") and summary.well_vectors:
        lines.append("--- Well-level vectors ---")
        well_names = set()
        for key in summary.well_vectors:
            if ":" in key:
                well_names.add(key.split(":")[1])
        lines.append(f"  Wells: {', '.join(sorted(well_names))}")
        lines.append("")

        for vec_name, data_points in sorted(summary.well_vectors.items()):
            if wells:
                parts = vec_name.split(":")
                if len(parts) < 2 or parts[1].upper() not in [w.upper() for w in wells]:
                    continue
            values = [v for _, v in data_points]
            if values:
                lines.append(
                    f"  {vec_name}: "
                    f"points={len(data_points)} "
                    f"min={min(values):.4g} "
                    f"max={max(values):.4g} "
                    f"last={values[-1]:.4g}",
                )

    return ToolChunk(
        is_last=True,
        state=ToolResultState.SUCCESS,
        content=[TextBlock(type="text", text="\n".join(lines))],
    )
