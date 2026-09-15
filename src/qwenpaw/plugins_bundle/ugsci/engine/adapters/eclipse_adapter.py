# -*- coding: utf-8 -*-
"""Eclipse reservoir simulator adapter.

Parses:
- ``.PRT``  — printable output (progress, convergence, warnings)
- ``.SMS``  — summary file (field/well vectors, text format)
- ``.RSM``  — summary report (formatted table, fallback)

Binary ``.SMSPEC/.UNSMRY`` files are read through the optional OPM
``resdata`` reader, with a dependency-free fortio fallback.
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import List, Optional

from .base import BaseSimAdapter, SimCapabilities, SimProgress, SimSummary, SimWarning


class EclipseAdapter(BaseSimAdapter):
    simulator_id = "eclipse"
    display_name = "Eclipse (E100/E300)"
    deck_extension = ".DATA"
    log_extension = ".PRT"
    capabilities = SimCapabilities(
        supports_progress=True,
        supports_result_reading=True,
        supports_terminal_artifacts=True,
        # The common runtime can recover monitoring, but does not yet restart
        # a simulator from a checkpoint automatically.
        supports_checkpoint_resume=False,
        supports_auto_tune=True,
        tuning_keywords=("NSTACK", "LITMAX"),
    )

    def tuning_rules(self) -> dict[str, tuple[int, int, object]]:
        return {
            "NSTACK": (1, 100, lambda value: max(value + 5, int(value * 1.5 + 0.5))),
            "LITMAX": (1, 100, lambda value: max(value + 5, int(value * 1.5 + 0.5))),
        }

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
    _RE_TOTAL_STEPS = re.compile(
        r"TOTAL\s+REPORT\s+STEPS\s*:\s*\d+\s+TOTAL\s+TIME\s+STEPS\s*:\s*(\d+)",
        re.IGNORECASE,
    )
    _RE_FINAL_CPU = re.compile(
        r"^\s*FINAL\s+CPU\b", re.IGNORECASE | re.MULTILINE,
    )
    _RE_ERROR_SUMMARY = re.compile(
        r"^\s*ERROR\s+SUMMARY\s*:?\s*$", re.IGNORECASE | re.MULTILINE,
    )

    def parse_progress(self, working_dir: str | Path) -> SimProgress:
        progress = SimProgress()
        log_file = self.find_log_file(working_dir)
        if not log_file:
            return progress

        log_tail = self._read_log_tail(log_file, 1000)

        # Status: check for completion or failure.  Eclipse writes either an
        # explicit end marker or a final CPU line; both are terminal evidence.
        final_cpu_matches = list(self._RE_FINAL_CPU.finditer(log_tail))
        has_end_marker = "END OF SIMULATION" in log_tail.upper()
        if has_end_marker or final_cpu_matches:
            progress.status = "completed"
        elif any(
            re.match(r"^\s*(?:[*#]+\s*)?(?:ERROR|FATAL|ABORT)\b", line, re.IGNORECASE)
            and not re.match(
                r"^\s*(?:[*#]+\s*)?ERROR\s+SUMMARY\b", line, re.IGNORECASE,
            )
            for line in log_tail.splitlines()[-40:]
        ):
            progress.status = "failed"
        else:
            progress.status = "running"

        # The terminal count table is emitted in a few spelling variants,
        # including ``Errors: 2`` and ``Problems 1``.  It is authoritative
        # when Eclipse has reached its terminal marker, so do not report a
        # run as completed merely because ``END OF SIMULATION`` is present.
        summary_matches = list(self._RE_ERROR_SUMMARY.finditer(log_tail))
        if summary_matches:
            summary_body = log_tail[summary_matches[-1].end() :]
        elif final_cpu_matches:
            summary_body = log_tail[final_cpu_matches[-1].start() :]
        else:
            summary_body = ""
        if (has_end_marker or final_cpu_matches) and summary_body:
            error_match = re.search(
                r"(?im)^\s*Errors?\s*:?\s*(\d+)\b", summary_body,
            )
            problem_match = re.search(
                r"(?im)^\s*Problems?\s*:?\s*(\d+)\b", summary_body,
            )
            errors = int(error_match.group(1)) if error_match else 0
            problems = int(problem_match.group(1)) if problem_match else 0
            if error_match or problem_match:
                progress.status = "failed" if errors or problems else "completed"

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

        # Eclipse wraps this line in some versions, so normalize whitespace
        # before parsing the authoritative cumulative time-step count.
        normalized = re.sub(r"\s+", " ", log_tail)
        step_matches = [int(m.group(1)) for m in self._RE_TOTAL_STEPS.finditer(normalized)]
        if step_matches:
            progress.current_step = max(step_matches)

        return progress

    def parse_warnings(
        self, working_dir: str | Path, limit: int = 20,
    ) -> List[SimWarning]:
        warnings: List[SimWarning] = []
        log_file = self.find_log_file(working_dir)
        if not log_file:
            return warnings

        log_tail = self._read_log_tail(log_file, 5000)
        for i, line in enumerate(log_tail.splitlines(), 1):
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

    def find_summary_file(
        self,
        working_dir: str | Path,
        case_stem: str = "",
    ) -> Optional[Path]:
        """Find the .SMS or .RSM file."""
        working_dir = Path(working_dir)
        for ext in [".SMS", ".RSM", ".sms", ".rsm"]:
            matches = (
                list(working_dir.glob(f"{case_stem}{ext}"))
                if case_stem
                else list(working_dir.glob(f"*{ext}"))
            )
            if matches:
                return matches[0]
        return None

    def find_binary_summary_files(
        self, working_dir: str | Path, case_stem: str = "",
    ) -> tuple[Optional[Path], Optional[Path]]:
        directory = Path(working_dir)
        stem = case_stem
        if not stem:
            specs = sorted(directory.glob("*.SMSPEC"))
            stem = specs[0].stem if specs else ""
        if not stem:
            return None, None
        spec = directory / f"{stem}.SMSPEC"
        unsmry = directory / f"{stem}.UNSMRY"
        return (spec if spec.is_file() else None, unsmry if unsmry.is_file() else None)

    def read_summary(
        self,
        working_dir: str | Path,
        variables: Optional[List[str]] = None,
        wells: Optional[List[str]] = None,
        case_stem: str = "",
    ) -> SimSummary:
        """Parse summary data from .SMS (text) or .RSM (report table).

        The .RSM file is a formatted table with column headers like
        ``DATE``, ``FOPR``, ``FPR``, ``WOPR:PROD1``, etc.
        """
        summary = SimSummary()
        rsm_file = self.find_summary_file(working_dir, case_stem=case_stem)
        if not rsm_file or not rsm_file.is_file():
            from .eclipse_summary import read_binary_summary
            return read_binary_summary(working_dir, case_stem, variables, wells)

        try:
            content = rsm_file.read_text(encoding="utf-8", errors="replace")
        except Exception:
            from .eclipse_summary import read_binary_summary
            return read_binary_summary(working_dir, case_stem, variables, wells)

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
            from .eclipse_summary import read_binary_summary
            return read_binary_summary(working_dir, case_stem, variables, wells)

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
                        (time_val, val),
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
                        (time_val, val),
                    )
                except (ValueError, IndexError):
                    pass

        # A partially written/corrupt text report can still contain a valid
        # header while yielding no usable rows. Prefer the native binary
        # summary in that case instead of silently returning an empty result.
        if not summary.dates and not summary.vectors and not summary.well_vectors:
            from .eclipse_summary import read_binary_summary

            return read_binary_summary(working_dir, case_stem, variables, wells)

        return summary
