# -*- coding: utf-8 -*-
"""Schlumberger INTERSECT adapter.

INTERSECT accepts the same case-name style as Eclipse but writes a slightly
different set of log/terminal artifacts.  The common Eclipse summary reader
is intentionally reused because INTERSECT can emit SMS/RSM/ECL-compatible
summary files.
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import List, Optional

from .base import SimCapabilities, SimProgress, SimWarning
from .eclipse_adapter import EclipseAdapter


class IntersectAdapter(EclipseAdapter):
    simulator_id = "intersect"
    display_name = "Schlumberger INTERSECT"
    deck_extension = ".DATA"
    log_extension = ".PRT"
    capabilities = SimCapabilities(
        supports_progress=True,
        supports_result_reading=True,
        supports_terminal_artifacts=True,
        supports_checkpoint_resume=False,
        supports_auto_tune=False,
    )

    def build_command(
        self,
        executable: str,
        deck_file: str,
        output_file: str = "",
    ) -> list[str]:
        case = str(deck_file)
        if case.upper().endswith(".DATA"):
            case = case[:-5]
        return [executable, case]

    def find_log_file(self, working_dir: str | Path) -> Optional[Path]:
        directory = Path(working_dir)
        if not directory.is_dir():
            return None
        candidates: list[Path] = []
        for pattern in ("*.PRT", "*.prt", "*.MSG", "*.msg", "*.log"):
            candidates.extend(directory.glob(pattern))
        return max(candidates, key=lambda path: path.stat().st_mtime) if candidates else None

    def parse_progress(self, working_dir: str | Path) -> SimProgress:
        progress = super().parse_progress(working_dir)
        log_file = self.find_log_file(working_dir)
        if not log_file:
            return progress
        tail = self._read_log_tail(log_file, 800)
        upper = tail.upper()
        if re.search(r"(?:INTERSECT\s+COMPLETED|END\s+OF\s+SIMULATION|NORMAL\s+TERMINATION)", upper):
            progress.status = "completed"
        elif re.search(r"(?:ABNORMAL\s+TERMINATION|FATAL\s+ERROR|\bFATAL\b)", upper):
            progress.status = "failed"
        return progress

    def parse_warnings(
        self, working_dir: str | Path, limit: int = 20,
    ) -> List[SimWarning]:
        warnings = super().parse_warnings(working_dir, limit=limit)
        if warnings:
            return warnings
        log_file = self.find_log_file(working_dir)
        if not log_file:
            return []
        result: list[SimWarning] = []
        for index, line in enumerate(self._read_log_tail(log_file, 5000).splitlines(), 1):
            upper = line.upper()
            if "WARNING" in upper:
                result.append(SimWarning("warning", index, line.strip()))
            elif "FATAL" in upper or "ABNORMAL TERMINATION" in upper:
                result.append(SimWarning("error", index, line.strip()))
            if len(result) >= limit:
                break
        return result


__all__ = ["IntersectAdapter"]
