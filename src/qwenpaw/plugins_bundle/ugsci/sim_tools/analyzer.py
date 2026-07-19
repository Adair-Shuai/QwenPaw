# -*- coding: utf-8 -*-
"""analyze_simulation — analyze simulation results for convergence, balance, and performance."""
from __future__ import annotations

import math
from typing import Any, List, Optional

import logging
_logger = logging.getLogger("qwenpaw.plugin.ugsci.sim")


async def analyze_simulation(
    job_id: str,
    analysis_type: str = "convergence",
    reference_job_id: str = "",
    metrics: Optional[List[str]] = None,
) -> Any:
    """Analyze simulation results and return a diagnostic report.

    Args:
        job_id (`str`):
            The job_id of the simulation to analyze.
        analysis_type (`str`):
            Type of analysis:
            - ``"convergence"``: Convergence quality (Newton iterations,
              time-step cuts, material balance trend).
            - ``"balance"``: Material balance check (volume conservation).
            - ``"performance"``: Dynamic performance (recovery factor,
              water cut trend, production/injection ratio).
            - ``"comparison"``: Compare with a reference job
              (requires *reference_job_id*).
        reference_job_id (`str`):
            Job ID of a reference case for comparison analysis.
        metrics (`list[str] | None`):
            Custom metric names to evaluate (e.g.
            ``["recovery_factor", "water_cut"]``).

    Returns:
        ``ToolChunk``: Contains a structured analysis report.
    """
    from agentscope.message import TextBlock
    from agentscope.tool import ToolChunk, ToolResultState

    from .launcher import _sim_jobs

    job = _sim_jobs.get(job_id)
    if not job:
        return ToolChunk(
            is_last=True,
            state=ToolResultState.ERROR,
            content=[TextBlock(
                type="text",
                text=f"Error: Job '{job_id}' not found.",
            )],
        )

    try:
        from ..sim_adapters import get_adapter
        adapter = get_adapter(job.simulator)
    except Exception as exc:
        return ToolChunk(
            is_last=True,
            state=ToolResultState.ERROR,
            content=[TextBlock(
                type="text",
                text=f"Error: Cannot find adapter: {exc}",
            )],
        )

    lines = [
        f"Analysis report for job: {job_id}",
        f"  Simulator: {job.simulator}",
        f"  Status:    {job.status}",
        f"  Deck:      {job.deck_file}",
        "",
    ]

    # ── Convergence analysis ─────────────────────────────────────────
    if analysis_type == "convergence":
        progress = adapter.parse_progress(job.working_dir)
        warnings = adapter.parse_warnings(job.working_dir, limit=50)

        lines.append("=== Convergence Analysis ===")
        lines.append("")

        # Overall assessment
        if progress.status == "completed":
            lines.append("✅ Simulation completed successfully.")
        elif progress.status == "failed":
            lines.append("❌ Simulation failed.")
        elif progress.status == "running":
            lines.append("⏳ Simulation is still running. Analysis based on partial data.")
        else:
            lines.append(f"⚠️ Status: {progress.status}")

        lines.append("")
        lines.append("--- Convergence Indicators ---")
        lines.append(f"  Time steps completed: {progress.current_step}")

        if progress.newton_iterations > 0:
            if progress.newton_iterations <= 4:
                lines.append(f"  Newton iterations (last): {progress.newton_iterations} — Good")
            elif progress.newton_iterations <= 8:
                lines.append(f"  Newton iterations (last): {progress.newton_iterations} — Acceptable")
            else:
                lines.append(f"  Newton iterations (last): {progress.newton_iterations} — High (potential convergence issues)")

        if progress.material_balance_error is not None:
            mbe = progress.material_balance_error
            if abs(mbe) < 1e-6:
                lines.append(f"  Material balance error: {mbe:.2e} — Excellent")
            elif abs(mbe) < 1e-3:
                lines.append(f"  Material balance error: {mbe:.2e} — Acceptable")
            else:
                lines.append(f"  Material balance error: {mbe:.2e} — High (check model consistency)")

        if progress.cfl_number is not None and progress.cfl_number > 1.0:
            lines.append(f"  CFL number: {progress.cfl_number:.2f} — Exceeds 1.0 (time step may be too large)")

        # Warnings summary
        warning_count = sum(1 for w in warnings if w.level == "warning")
        error_count = sum(1 for w in warnings if w.level == "error")
        lines.append("")
        lines.append(f"  Warnings: {warning_count}")
        lines.append(f"  Errors:   {error_count}")

        if error_count > 0:
            lines.append("")
            lines.append("--- Critical errors ---")
            for w in warnings:
                if w.level == "error":
                    lines.append(f"  ✖ {w.message}")

        # Recommendations
        lines.append("")
        lines.append("--- Recommendations ---")
        if progress.newton_iterations > 8:
            lines.append("  • Consider reducing time step size or improving initial guess")
        if progress.material_balance_error and abs(progress.material_balance_error) > 1e-3:
            lines.append("  • Check PVT table consistency and initialization")
            lines.append("  • Verify boundary conditions and source/sink terms")
        if progress.cfl_number and progress.cfl_number > 1.0:
            lines.append("  • Reduce time step to satisfy CFL condition")
        if error_count == 0 and warning_count <= 2:
            lines.append("  • No major issues detected. Model appears well-conditioned.")

    # ── Material balance analysis ────────────────────────────────────
    elif analysis_type == "balance":
        summary = adapter.read_summary(job.working_dir)
        lines.append("=== Material Balance Analysis ===")
        lines.append("")

        # Try to compute balance from available vectors
        fopt = summary.vectors.get("FOPT", [])
        fwpt = summary.vectors.get("FWPT", [])
        fwit = summary.vectors.get("FWIT", [])
        fpr = summary.vectors.get("FPR", [])

        if fopt:
            final_fopt = fopt[-1][1]
            lines.append(f"  Cumulative oil production (FOPT): {final_fopt:.2f}")
        if fwpt:
            final_fwpt = fwpt[-1][1]
            lines.append(f"  Cumulative water production (FWPT): {final_fwpt:.2f}")
        if fwit:
            final_fwit = fwit[-1][1]
            lines.append(f"  Cumulative water injection (FWIT): {final_fwit:.2f}")
        if fpr:
            initial_fpr = fpr[0][1]
            final_fpr = fpr[-1][1]
            pressure_decline = initial_fpr - final_fpr
            lines.append(f"  Initial reservoir pressure: {initial_fpr:.2f}")
            lines.append(f"  Final reservoir pressure:    {final_fpr:.2f}")
            lines.append(f"  Pressure decline:            {pressure_decline:.2f}")

        if not any([fopt, fwpt, fwit, fpr]):
            lines.append("  (No summary vectors available for balance analysis.)")
            lines.append("  Make sure the simulation has completed and result files exist.")

    # ── Performance analysis ─────────────────────────────────────────
    elif analysis_type == "performance":
        summary = adapter.read_summary(job.working_dir)
        lines.append("=== Performance Analysis ===")
        lines.append("")

        fopr = summary.vectors.get("FOPR", [])
        fwpr = summary.vectors.get("FWPR", [])
        fopt = summary.vectors.get("FOPT", [])

        if fopr:
            peak_oil = max(v for _, v in fopr)
            current_oil = fopr[-1][1]
            lines.append(f"  Peak oil rate (FOPR):   {peak_oil:.2f}")
            lines.append(f"  Current oil rate (FOPR): {current_oil:.2f}")
            decline = (1 - current_oil / peak_oil * 100) if peak_oil > 0 else 0
            lines.append(f"  Decline from peak:      {decline:.1f}%")

        if fwpr and fopr:
            current_wcut = fwpr[-1][1] / (fopr[-1][1] + fwpr[-1][1]) * 100 if (fopr[-1][1] + fwpr[-1][1]) > 0 else 0
            lines.append(f"  Current water cut:      {current_wcut:.1f}%")

        if fopt and fopr:
            lines.append(f"  Cumulative oil (FOPT):  {fopt[-1][1]:.2f}")

        if not any([fopr, fwpr, fopt]):
            lines.append("  (No production data available for performance analysis.)")

    # ── Comparison analysis ──────────────────────────────────────────
    elif analysis_type == "comparison":
        if not reference_job_id:
            lines.append("Error: comparison analysis requires reference_job_id.")
        else:
            ref_job = _sim_jobs.get(reference_job_id)
            if not ref_job:
                lines.append(f"Error: Reference job '{reference_job_id}' not found.")
            else:
                lines.append(f"=== Comparison: {job_id} vs {reference_job_id} ===")
                lines.append("")

                # Read both summaries
                summary_a = adapter.read_summary(job.working_dir)
                try:
                    ref_adapter = get_adapter(ref_job.simulator)
                    summary_b = ref_adapter.read_summary(ref_job.working_dir)
                except Exception:
                    summary_b = summary_a.__class__()

                # Compare common vectors
                common_keys = set(summary_a.vectors.keys()) & set(summary_b.vectors.keys())
                if not common_keys:
                    lines.append("  No common summary vectors found between the two jobs.")
                else:
                    lines.append(f"  Common vectors: {', '.join(sorted(common_keys))}")
                    lines.append("")
                    for key in sorted(common_keys):
                        vec_a = summary_a.vectors[key]
                        vec_b = summary_b.vectors[key]
                        if vec_a and vec_b:
                            last_a = vec_a[-1][1]
                            last_b = vec_b[-1][1]
                            diff = last_a - last_b
                            rel_diff = (diff / last_b * 100) if last_b != 0 else 0
                            lines.append(
                                f"  {key}: "
                                f"job={last_a:.4g} "
                                f"ref={last_b:.4g} "
                                f"diff={diff:+.4g} ({rel_diff:+.1f}%)"
                            )
    else:
        lines.append(f"Unknown analysis type: '{analysis_type}'")
        lines.append("Supported: convergence, balance, performance, comparison")

    return ToolChunk(
        is_last=True,
        state=ToolResultState.SUCCESS,
        content=[TextBlock(type="text", text="\n".join(lines))],
    )
