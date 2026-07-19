# -*- coding: utf-8 -*-
"""Eclipse reservoir simulator adapter.

Parses:
- ``.PRT``  — printable output (progress, convergence, warnings)
- ``.SMS``  — summary file (field/well vectors, text format)
- ``.RSM``  — summary report (formatted table, fallback)

Note: Binary formats (``.SMSPE``, ``.UNRST``, ``.EGRID``) require the
``ecl`` / ``resdata`` library.  This adapter focuses on text-parsable
output for now; binary parsing can be added later.
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import List, Optional

from .base import BaseSimAdapter, SimProgress, SimSummary, SimWarning


class EclipseAdapter(BaseSimAdapter):
    simulator_id = "eclipse"
    display_name = "Eclipse (E100/E300)"
    deck_extension = ".DATA"
    log_extension = ".PRT"

    # ------------------------------------------------------------------
    # Command
    # ------------------------------------------------------------------

    def build_command(
        self,
        executable: str,
        deck_file: str,
        output_file: str = "",
    ) -> list[str]:
        cmd = [executable]
        # Eclipse takes the case name (without .DATA extension)
        case = deck_file
        if case.upper().endswith(".DATA"):
            case = case[:-5]
        cmd.append(case)
        return cmd

    # ------------------------------------------------------------------
    # Progress parsing
    # ------------------------------------------------------------------

    # Patterns
    _RE_TIME = re.compile(
        r"^\s*REPORT\s+STEP\s+\d+\s+.*?TIME\s*=\s*([\d.]+)\s+(DAYS|DAY)",
        re.IGNORECASE,
    )
    _RE_TIME_ALT = re.compile(
        r"^\s*TIME\s*=\s*([\d.]+)\s+(DAYS|DAY)", re.IGNORECASE,
    )
    _RE_TARGET = re.compile(
        r"TSTEP.*?|END\s+OF\s+SIMULATION", re.IGNORECASE,
    )
    _RE_NEWTON = re.compile(
        r"ITER\s*#\s*(\d+)", re.IGNORECASE,
    )
    _RE_MBE = re.compile(
        r"MATERIAL\s+BALANCE.*?ERROR\s*=\s*([0-9.eE+\-]+)",
        re.IGNORECASE,
    )
    _RE_CFL = re.compile(
        r"CFL\s*=\s*([0-9.eE+\-]+)", re.IGNORECASE,
    )

    def parse_progress(self, working_dir: str | Path) -> SimProgress:
        progress = SimProgress()
        log_file = self.find_log_file(working_dir)
        if not log_file:
            return progress

        log_tail = self._read_log_tail(log_file, 1000)

        # Status: check for completion or failure
        if "END OF SIMULATION" in log_tail.upper():
            progress.status = "completed"
        elif "ERROR" in log_tail[-200:].upper():
            progress.status = "failed"
        else:
            progress.status = "running"

        # Time / progress
        for line in log_tail.splitlines():
            m = self._RE_TIME.search(line) or self._RE_TIME_ALT.search(line)
            if m:
                progress.current_time = f"{m.group(1)} {m.group(2)}"
                progress.current_step += 1

            m_newton = self._RE_NEWTON.search(line)
            if m_newton:
                progress.newton_iterations = int(m_newton.group(1))

            m_mbe = self._RE_MBE.search(line)
            if m_mbe:
                try:
                    progress.material_balance_error = float(m_mbe.group(1))
                except ValueError:
                    pass

            m_cfl = self._RE_CFL.search(line)
            if m_cfl:
                try:
                    progress.cfl_number = float(m_cfl.group(1))
                except ValueError:
                    pass

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
            elif "ERROR" in upper and "--" not in line[:5]:
                warnings.append(SimWarning("error", i, line.strip()))
            if len(warnings) >= limit:
                break
        return warnings

    # ------------------------------------------------------------------
    # Result parsing
    # ------------------------------------------------------------------

    def find_summary_file(self, working_dir: str | Path) -> Optional[Path]:
        """Find the .SMS or .RSM file."""
        working_dir = Path(working_dir)
        for ext in [".SMS", ".RSM", ".sms", ".rsm"]:
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
        """Parse summary data from .SMS (text) or .RSM (report table).

        The .RSM file is a formatted table with column headers like
        ``DATE``, ``FOPR``, ``FPR``, ``WOPR:PROD1``, etc.
        """
        summary = SimSummary()
        rsm_file = self.find_summary_file(working_dir)
        if not rsm_file or not rsm_file.is_file():
            return summary

        try:
            content = rsm_file.read_text(encoding="utf-8", errors="replace")
        except Exception:
            return summary

        lines = content.splitlines()
        # Parse RSM format: find header line, then data lines
        header_idx = None
        col_names: list[str] = []

        for i, line in enumerate(lines):
            fields = line.split()
            if len(fields) >= 2 and any(
                f.upper() in line.upper()
                for f in ["FOPR", "FPR", "FWPR", "FOPT", "WOPR", "WWPR"]
            ):
                header_idx = i
                col_names = fields
                break

        if header_idx is None:
            return summary

        # Identify column indices
        date_col = None
        vec_cols: dict[str, int] = {}
        well_cols: dict[str, int] = {}

        for j, name in enumerate(col_names):
            upper = name.upper()
            if upper in ("DATE", "TIME", "DAYS"):
                date_col = j
            elif ":" in upper:
                # Well vector: WOPR:PROD1
                well_cols[upper] = j
            else:
                vec_cols[upper] = j

        # Parse data rows
        for line in lines[header_idx + 1:]:
            fields = line.split()
            if len(fields) < len(col_names):
                continue
            if date_col is not None:
                summary.dates.append(fields[date_col])

            time_val = float(summary.dates.__len__())  # 1-based step index

            for vec_name, col_idx in vec_cols.items():
                if variables and vec_name not in [v.upper() for v in variables]:
                    continue
                try:
                    val = float(fields[col_idx])
                    summary.vectors.setdefault(vec_name, []).append(
                        (time_val, val)
                    )
                except (ValueError, IndexError):
                    pass

            for well_key, col_idx in well_cols.items():
                if wells:
                    parts = well_key.split(":")
                    if len(parts) < 2 or parts[1].upper() not in [w.upper() for w in wells]:
                        continue
                try:
                    val = float(fields[col_idx])
                    summary.well_vectors.setdefault(well_key, []).append(
                        (time_val, val)
                    )
                except (ValueError, IndexError):
                    pass

        return summary
