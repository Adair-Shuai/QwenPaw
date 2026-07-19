# -*- coding: utf-8 -*-
"""CMG (IMEX / STARS / GEM) reservoir simulator adapter.

Parses:
- ``.out`` — printable output (progress, convergence, warnings)
- ``.irf`` — IRF binary result file (requires ``cmg_io`` or manual parsing)

Currently supports text-based parsing of the ``.out`` file for progress
and warnings.  Binary ``.irf`` parsing requires the CMG Results API
and will be added in a future iteration.
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import List, Optional

from .base import BaseSimAdapter, SimProgress, SimSummary, SimWarning


class CMGAdapter(BaseSimAdapter):
    """Adapter for CMG simulators (IMEX, STARS, GEM)."""

    display_name = "CMG"
    deck_extension = ".dat"
    log_extension = ".out"

    def __init__(self, sim_type: str = "imex"):
        self.simulator_id = f"cmg_{sim_type}"
        self._sim_type = sim_type.lower()
        self.display_name = f"CMG {sim_type.upper()}"

    # ------------------------------------------------------------------
    # Command
    # ------------------------------------------------------------------

    def build_command(
        self,
        executable: str,
        deck_file: str,
        output_file: str = "",
    ) -> list[str]:
        cmd = [executable, "-f", deck_file]
        if output_file:
            cmd.extend(["-o", output_file])
        else:
            base = deck_file.rsplit(".", 1)[0]
            cmd.extend(["-o", base + ".out"])
        return cmd

    # ------------------------------------------------------------------
    # Progress parsing
    # ------------------------------------------------------------------

    _RE_TIME = re.compile(
        r"TIME\s*=\s*([\d.]+)\s*(DAYS|DAY|HOURS|HR)", re.IGNORECASE,
    )
    _RE_DT = re.compile(
        r"\bDT\s*=\s*([\d.eE+\-]+)", re.IGNORECASE,
    )
    _RE_NEWTON = re.compile(
        r"NEWTON\s+ITERATION\s*#?\s*(\d+)", re.IGNORECASE,
    )
    _RE_MBE = re.compile(
        r"MASS\s+BALANCE\s+ERROR\s*=\s*([\d.eE+\-]+)", re.IGNORECASE,
    )

    def parse_progress(self, working_dir: str | Path) -> SimProgress:
        progress = SimProgress()
        log_file = self.find_log_file(working_dir)
        if not log_file:
            return progress

        log_tail = self._read_log_tail(log_file, 1000)

        # Status
        upper_tail = log_tail[-300:].upper()
        if "SIMULATION COMPLETED" in upper_tail or "STOP" in upper_tail:
            progress.status = "completed"
        elif "ERROR" in upper_tail and "FATAL" in upper_tail:
            progress.status = "failed"
        else:
            progress.status = "running"

        last_newton = 0
        for line in log_tail.splitlines():
            m = self._RE_TIME.search(line)
            if m:
                progress.current_time = f"{m.group(1)} {m.group(2)}"
                progress.current_step += 1

            m_dt = self._RE_DT.search(line)
            if m_dt:
                try:
                    progress.time_step_size = f"{float(m_dt.group(1))}"
                except ValueError:
                    pass

            m_newton = self._RE_NEWTON.search(line)
            if m_newton:
                last_newton = int(m_newton.group(1))

            m_mbe = self._RE_MBE.search(line)
            if m_mbe:
                try:
                    progress.material_balance_error = float(m_mbe.group(1))
                except ValueError:
                    pass

        progress.newton_iterations = last_newton
        return progress

    def parse_warnings(
        self, working_dir: str | Path, limit: int = 20,
    ) -> List[SimWarning]:
        warnings: List[SimWarning] = []
        log_file = self.find_log_file(working_dir)
        if not log_file:
            return warnings

        full_log = self._read_log_full(log_file)
        for i, line in enumerate(full_log.splitlines(), 1):
            upper = line.upper()
            if "WARNING" in upper:
                warnings.append(SimWarning("warning", i, line.strip()))
            elif "FATAL" in upper or ("ERROR" in upper and "STOP" in upper):
                warnings.append(SimWarning("error", i, line.strip()))
            if len(warnings) >= limit:
                break
        return warnings

    # ------------------------------------------------------------------
    # Result parsing
    # ------------------------------------------------------------------

    def find_summary_file(self, working_dir: str | Path) -> Optional[Path]:
        """Find .irf or .out result file."""
        working_dir = Path(working_dir)
        for ext in [".irf", ".out", ".IRF", ".OUT"]:
            matches = list(working_dir.glob(f"*{ext}"))
            if matches:
                return matches[0]
        return None

    def read_summary(
        self,
        working_dir: str | Path,
        variables: Optional[List[str]] = None,
        wells: Optional[List[str]] = None,
    ) -> SimSummary:
        """Read summary data from CMG output.

        Note: Binary ``.irf`` parsing requires the CMG Results API.
        This implementation parses the text ``.out`` file for
        field-level summary data as a fallback.
        """
        summary = SimSummary()
        log_file = self.find_log_file(working_dir)
        if not log_file or not log_file.is_file():
            return summary

        try:
            content = log_file.read_text(encoding="utf-8", errors="replace")
        except Exception:
            return summary

        # Parse summary blocks from .out — CMG prints field totals
        # in blocks like:
        #   "FIELD TOTALS"
        #   Time     FOPT     FWPT     FPR  ...
        in_summary = False
        current_time = 0.0

        for line in content.splitlines():
            upper = line.strip().upper()
            if "FIELD TOTALS" in upper or "FIELD RATES" in upper:
                in_summary = True
                continue
            if in_summary:
                fields = line.split()
                if len(fields) < 2:
                    in_summary = False
                    continue
                # Try to parse as data row
                try:
                    current_time = float(fields[0])
                    for j, val_str in enumerate(fields[1:], 1):
                        try:
                            val = float(val_str)
                            # Generic naming — real implementation would
                            # parse column headers
                            key = f"COL{j}"
                            summary.vectors.setdefault(key, []).append(
                                (current_time, val)
                            )
                        except ValueError:
                            pass
                except ValueError:
                    in_summary = False

        return summary
