# -*- coding: utf-8 -*-
"""Shared binary loaders and histogram helpers for visualization post-processing."""

from __future__ import annotations

import math
import struct
from pathlib import Path
from typing import Sequence


def load_f32(path: Path) -> list[float]:
    raw = path.read_bytes()
    if len(raw) % 4:
        raise ValueError(f"truncated float32 buffer: {path.name}")
    return list(struct.unpack(f"<{len(raw) // 4}f", raw))


def load_u32(path: Path) -> list[int]:
    raw = path.read_bytes()
    if len(raw) % 4:
        raise ValueError(f"truncated uint32 buffer: {path.name}")
    return list(struct.unpack(f"<{len(raw) // 4}I", raw))


def compute_histogram(values: Sequence[float], bins: int = 24) -> dict[str, object]:
    finite = [float(value) for value in values if math.isfinite(float(value))]
    if not finite:
        raise ValueError("property contains no finite values")
    bins = max(4, min(128, int(bins)))
    minimum = min(finite)
    maximum = max(finite)
    if maximum == minimum:
        return {
            "count": len(finite),
            "min": minimum,
            "max": maximum,
            "bins": bins,
            "edges": [minimum, maximum],
            "counts": [len(finite)],
        }
    width = (maximum - minimum) / bins
    counts = [0] * bins
    for value in finite:
        slot = min(bins - 1, int((value - minimum) / width))
        counts[slot] += 1
    edges = [minimum + width * index for index in range(bins + 1)]
    return {
        "count": len(finite),
        "min": minimum,
        "max": maximum,
        "bins": bins,
        "edges": edges,
        "counts": counts,
    }
