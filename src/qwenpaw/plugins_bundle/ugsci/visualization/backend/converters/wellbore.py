# -*- coding: utf-8 -*-
"""Wellbore geometry converter.

Converts well trajectory (MD, TVD, X, Y) and completion data
(casing, perforation, tools) into 3D tube/line geometry for rendering.
"""

from __future__ import annotations

import math
import struct
from pathlib import Path
from typing import Any

from .geometry import (
    finite_number,
    geometry_metadata,
    property_descriptor,
    resource_name,
)

# Metres. A vertical well in UTM is spatial even if XY does not vary.
# LAS/DLIS sticks collapsed to the origin stay depth-only.
SPATIAL_XY_METERS = 1.0


def trajectory_placement(x: list[float], y: list[float]) -> dict[str, Any]:
    """Classify a trajectory as a spatial well or a depth-only log."""
    easts: list[float] = []
    norths: list[float] = []
    for east, north in zip(x, y):
        try:
            xe = float(east)
            yn = float(north)
        except (TypeError, ValueError):
            continue
        if not math.isfinite(xe) or not math.isfinite(yn):
            continue
        easts.append(xe)
        norths.append(yn)
    if not easts:
        return {
            "kind": "well-log",
            "placement": "depth-only",
            "spatial": False,
        }
    max_abs = max(
        max(abs(value) for value in easts),
        max(abs(value) for value in norths),
    )
    span = max(max(easts) - min(easts), max(norths) - min(norths))
    if max_abs > SPATIAL_XY_METERS or span > SPATIAL_XY_METERS:
        return {"kind": "wellbore", "placement": "spatial", "spatial": True}
    return {"kind": "well-log", "placement": "depth-only", "spatial": False}


def convert_well_trajectory(
    md: list[float],
    tvd: list[float],
    x: list[float],
    y: list[float],
    name: str,
    bin_dir: Path,
) -> dict[str, Any]:
    """Convert well trajectory to binary positions and indices.

    Produces a polyline (line segments) for the well path.
    """
    n_points = len(md)
    if n_points < 2 or any(len(values) != n_points for values in (tvd, x, y)):
        raise ValueError("井轨迹需要至少两个测点，且 MD、TVD、X、Y 长度必须一致")
    md, tvd, x, y = (
        [
            finite_number(value, f"{label}[{index}]")
            for index, value in enumerate(values)
        ]
        for label, values in (("MD", md), ("TVD", tvd), ("X", x), ("Y", y))
    )
    if any(current <= previous for previous, current in zip(md, md[1:])):
        raise ValueError("井轨迹 MD 必须严格递增")
    prefix = f"well_{resource_name(name)}"

    positions: list[float] = []
    for i in range(n_points):
        positions.extend([float(x[i]), float(y[i]), -float(tvd[i])])

    # A trajectory has an explicit line topology; no degenerate triangles.
    indices: list[int] = []
    for i in range(n_points - 1):
        indices.extend([i, i + 1])

    cell_ids = list(range(n_points))

    bin_dir.mkdir(parents=True, exist_ok=True)
    (bin_dir / f"{prefix}_positions.f32").write_bytes(
        struct.pack(f"<{len(positions)}f", *positions),
    )
    (bin_dir / f"{prefix}_indices.u32").write_bytes(
        struct.pack(f"<{len(indices)}I", *indices),
    )
    (bin_dir / f"{prefix}_cell_ids.u32").write_bytes(
        struct.pack(f"<{len(cell_ids)}I", *cell_ids),
    )

    # MD as a scalar (for depth reference)
    (bin_dir / f"{prefix}_scalars_md.f32").write_bytes(
        struct.pack(f"<{n_points}f", *md),
    )

    return {
        "id": prefix,
        "name": f"井轨迹：{name}（{n_points} 个测点）",
        "n_vertices": n_points,
        "n_cells": n_points,
        "n_indices": len(indices),
        "source": "wellbore",
        "files": {
            "positions": f"{prefix}_positions.f32",
            "indices": f"{prefix}_indices.u32",
            "cell_ids": f"{prefix}_cell_ids.u32",
            "scalars": {"md": f"{prefix}_scalars_md.f32"},
        },
        "metadata": {
            **geometry_metadata("lines", "point"),
            "md_range": [float(md[0]), float(md[-1])],
            "tvd_range": [float(min(tvd)), float(max(tvd))],
            "well_name": name,
            **trajectory_placement(x, y),
        },
        "properties": {
            "md": property_descriptor("测量井深", "point", n_points, "m"),
        },
    }


def convert_perforation_intervals(
    intervals: list[dict[str, float]],
    name: str,
    bin_dir: Path,
) -> dict[str, str]:
    """Convert perforation intervals to binary markers.

    Each interval has: top_md, bottom_md, top_tvd, bottom_tvd, x, y
    """
    prefix = f"perf_{name}"
    positions: list[float] = []
    indices: list[int] = []
    cell_ids: list[int] = []

    for i, interval in enumerate(intervals):
        top_z = -float(interval["top_tvd"])
        bot_z = -float(interval["bottom_tvd"])
        x = float(interval.get("x", 0))
        y = float(interval.get("y", 0))

        positions.extend([x, y, top_z, x, y, bot_z])
        base = i * 2
        indices.extend([base, base + 1, base])
        cell_ids.append(i)

    (bin_dir / f"{prefix}_positions.f32").write_bytes(
        struct.pack(f"<{len(positions)}f", *positions),
    )
    (bin_dir / f"{prefix}_indices.u32").write_bytes(
        struct.pack(f"<{len(indices)}I", *indices),
    )
    (bin_dir / f"{prefix}_cell_ids.u32").write_bytes(
        struct.pack(f"<{len(cell_ids)}I", *cell_ids),
    )

    return {
        "positions": f"{prefix}_positions.f32",
        "indices": f"{prefix}_indices.u32",
        "cell_ids": f"{prefix}_cell_ids.u32",
    }
