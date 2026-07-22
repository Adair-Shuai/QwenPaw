# -*- coding: utf-8 -*-
"""COMSOL Multiphysics adapter.

COMSOL runs in batch mode via ``comsolbatch``.  Output is a log
file and an ``.mph`` result file.

Parsing strategy:
- ``.log`` — batch execution log (progress, solver status, errors)
- ``.mph`` — binary result file (requires COMSOL API to extract data)

This adapter parses the text log for progress and warnings.  Full
result extraction requires the COMSOL Java/Python API and will be
added in a future iteration.
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import List, Optional

from .base import BaseSimAdapter, SimProgress, SimSummary, SimWarning


class COMSOLAdapter(BaseSimAdapter):
    simulator_id = "comsol"
    display_name = "COMSOL Multiphysics"
    deck_extension = ".mph"
    log_extension = ".log"

    # ------------------------------------------------------------------
    # Command
    # ------------------------------------------------------------------

    def build_command(
        self,
        executable: str,
        deck_file: str,
        output_file: str = "",
    ) -> list[str]:
        # COMSOL batch mode: -inputfile <model.mph> -outputfile <result.mph>
        # The output_file passed by the launcher is a .log path (adapter.log_extension);
        # COMSOL's -outputfile expects a .mph result file, so derive it from deck_file.
        cmd = [executable, "batch", "-inputfile", deck_file]
        deck_base = deck_file.rsplit(".", 1)[0]
        cmd.extend(["-outputfile", deck_base + "_result.mph"])
        # Use the deck file's parent directory as temp dir
        cmd.extend(["-tmpdir", str(Path(deck_file).parent)])
        return cmd

    # ------------------------------------------------------------------
    # Progress parsing
    # ------------------------------------------------------------------

    _RE_PROGRESS = re.compile(
        r"(\d+)%\s*", re.IGNORECASE,
    )
    _RE_TIME = re.compile(
        r"Solving.*?time[:\s]+([\d.]+)\s*(s|sec|seconds)?",
        re.IGNORECASE,
    )
    _RE_SOLVER = re.compile(
        r"(Stationary|Time[- ]dependent|Eigenvalue)\s+solver",
        re.IGNORECASE,
    )
    _RE_CONVERGED = re.compile(
        r"(converged|solution completed)", re.IGNORECASE,
    )

    def find_log_file(self, working_dir: str | Path) -> Optional[Path]:
        """Find the most recent .log file."""
        working_dir = Path(working_dir)
        if not working_dir.is_dir():
            return None
        # COMSOL creates .log files with the case name
        matches = sorted(
            working_dir.glob("*.log"),
            key=lambda p: p.stat().st_mtime,
            reverse=True,
        )
        return matches[0] if matches else None

    def parse_progress(self, working_dir: str | Path) -> SimProgress:
        progress = SimProgress()
        log_file = self.find_log_file(working_dir)
        if not log_file:
            return progress

        log_tail = self._read_log_tail(log_file, 500)
        upper_tail = log_tail[-200:].upper()

        if self._RE_CONVERGED.search(log_tail):
            progress.status = "completed"
        elif "ERROR" in upper_tail or "FAILED" in upper_tail:
            progress.status = "failed"
        else:
            progress.status = "running"

        # Parse progress percentage
        for line in reversed(log_tail.splitlines()):
            m = self._RE_PROGRESS.search(line)
            if m:
                try:
                    pct = int(m.group(1))
                    progress.current_step = pct
                    progress.target_time = "100%"
                    progress.current_time = f"{pct}%"
                except ValueError:
                    pass
                break

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
            elif "ERROR" in upper:
                warnings.append(SimWarning("error", i, line.strip()))
            if len(warnings) >= limit:
                break
        return warnings

    # ------------------------------------------------------------------
    # Result parsing
    # ------------------------------------------------------------------

    def find_summary_file(self, working_dir: str | Path) -> Optional[Path]:
        """Find the result .mph file."""
        working_dir = Path(working_dir)
        for pattern in ["*_result.mph", "*.mph"]:
            matches = list(working_dir.glob(pattern))
            if matches:
                return matches[0]
        return None

    def read_summary(
        self,
        working_dir: str | Path,
        variables: Optional[List[str]] = None,
        wells: Optional[List[str]] = None,
    ) -> SimSummary:
        """Read COMSOL results.

        Note: ``.mph`` is a binary format requiring the COMSOL API.
        This stub returns an empty summary.  When the COMSOL Python
        API is available, it will be used to export data.
        """
        return SimSummary()
