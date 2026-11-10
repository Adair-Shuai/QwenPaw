# -*- coding: utf-8 -*-
"""Atomic replacement resilient to short Windows reader/scanner handles."""

from __future__ import annotations

import os
import time
from pathlib import Path


def atomic_replace(source: Path | str, target: Path | str) -> None:
    (
        "Keep the old file until replacement succeeds; "
        "never hide write failure."
    )
    delays = (0.01, 0.02, 0.04, 0.08, 0.16)
    for attempt in range(len(delays) + 1):
        try:
            os.replace(source, target)
            return
        except OSError as error:
            if getattr(error, "winerror", None) not in {
                5,
                32,
                33,
            } or attempt == len(delays):
                raise
            time.sleep(delays[attempt])
