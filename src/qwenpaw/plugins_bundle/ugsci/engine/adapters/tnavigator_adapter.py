# -*- coding: utf-8 -*-
"""tNavigator reservoir simulator adapter.

tNavigator consumes a complete deck path rather than Eclipse's case stem.
Its ECL-compatible summary outputs are handled by the inherited reader, while
the log locator accepts the common ``.log/.out/.PRT`` variants emitted by
different tNavigator releases and batch wrappers.
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import Optional

from .base import SimCapabilities, SimProgress
from .eclipse_adapter import EclipseAdapter


class TNavigatorAdapter(EclipseAdapter):
    simulator_id = "tnavigator"
    display_name = "tNavigator"
    deck_extension = ".DATA"
    log_extension = ".log"
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
        return [executable, str(deck_file)]

    def find_log_file(self, working_dir: str | Path) -> Optional[Path]:
        directory = Path(working_dir)
        if not directory.is_dir():
            return None
        candidates: list[Path] = []
        for pattern in ("*.log", "*.LOG", "*.out", "*.OUT", "*.PRT", "*.prt"):
            candidates.extend(directory.glob(pattern))
        return max(candidates, key=lambda path: path.stat().st_mtime) if candidates else None

    def parse_progress(self, working_dir: str | Path) -> SimProgress:
        progress = super().parse_progress(working_dir)
        log_file = self.find_log_file(working_dir)
        if not log_file:
            return progress
        tail = self._read_log_tail(log_file, 1000)
        upper = tail.upper()
        if re.search(r"(?:SIMULATION\s+COMPLETED|END\s+OF\s+SIMULATION|NORMAL\s+TERMINATION)", upper):
            progress.status = "completed"
        elif re.search(r"(?:ABNORMAL\s+TERMINATION|FATAL\s+ERROR|\bFATAL\b|\bABORTED\b)", upper):
            progress.status = "failed"
        return progress


__all__ = ["TNavigatorAdapter"]
