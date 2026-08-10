# -*- coding: utf-8 -*-
"""Intersection (cross-section) converter.

Generates 2D/3D cross-section geometry from a 3D grid along a
polyline path. Used for geological cross-sections and well tie views.
"""

from __future__ import annotations

import struct
from pathlib import Path
from typing import Any


def create_intersection_along_polyline(
    grid_positions: list[float],
    grid_indices: list[int],
    grid_cell_ids: list[int],
    polyline_x: list[float],
    polyline_y: list[float],
    z_min: float,
    z_max: float,
    name: str,
    bin_dir: Path,
) -> dict[str, Any]:
    """Create a vertical cross-section along a 2D polyline.

    The intersection is a vertical curtain following the polyline path,
    with Z ranging from z_min to z_max.

    Args:
        grid_positions: Source grid vertex positions (not used directly,
            but available for property extraction)
        grid_indices: Source grid triangle indices
        grid_cell_ids: Source grid cell IDs
        polyline_x: X coordinates of the polyline
        polyline_y: Y coordinates of the polyline
        z_min: Bottom depth
        z_max: Top depth
        name: Intersection name
        bin_dir: Output directory
    """
    n_path = len(polyline_x)
    if n_path < 2:
        raise ValueError("Polyline must have at least 2 points")

    prefix = f"intersection_{name}"

    # Build vertices: for each polyline point, create top and bottom vertices
    positions: list[float] = []
    indices: list[int] = []

    for i in range(n_path):
        px = float(polyline_x[i])
        py = float(polyline_y[i])
        # Top vertex (z_max is shallower, negate for depth-down)
        positions.extend([px, py, -float(z_max)])
        # Bottom vertex
        positions.extend([px, py, -float(z_min)])

    # Build quad strips between consecutive path points
    for i in range(n_path - 1):
        a = i * 2       # top_i
        b = i * 2 + 1   # bottom_i
        c = (i + 1) * 2     # top_{i+1}
        d = (i + 1) * 2 + 1 # bottom_{i+1}
        indices.extend([a, c, b, b, c, d])

    cell_ids = list(range(len(indices) // 3))

    (bin_dir / f"{prefix}_positions.f32").write_bytes(
        struct.pack(f"<{len(positions)}f", *positions)
    )
    (bin_dir / f"{prefix}_indices.u32").write_bytes(
        struct.pack(f"<{len(indices)}I", *indices)
    )
    (bin_dir / f"{prefix}_cell_ids.u32").write_bytes(
        struct.pack(f"<{len(cell_ids)}I", *cell_ids)
    )

    return {
        "id": f"intersection_{name}",
        "name": f"Intersection: {name} ({n_path} waypoints)",
        "n_vertices": n_path * 2,
        "n_cells": len(cell_ids),
        "n_indices": len(indices),
        "source": "intersection",
        "files": {
            "positions": f"{prefix}_positions.f32",
            "indices": f"{prefix}_indices.u32",
            "cell_ids": f"{prefix}_cell_ids.u32",
            "scalars": {},
        },
        "metadata": {
            "n_waypoints": n_path,
            "z_range": [float(z_min), float(z_max)],
        },
    }


def create_well_intersection(
    well_x: list[float],
    well_y: list[float],
    well_tvd: list[float],
    name: str,
    bin_dir: Path,
    offset: float = 50.0,
) -> dict[str, Any]:
    """Create a cross-section along a well trajectory.

    The section is a vertical strip centered on the well path,
    with a lateral offset for visual separation.
    """
    n = len(well_x)
    positions: list[float] = []
    indices: list[int] = []

    for i in range(n):
        px = float(well_x[i])
        py = float(well_y[i])
        tvd = float(well_tvd[i])

        # Left and right offset vertices
        positions.extend([px + offset, py, -tvd])
        positions.extend([px - offset, py, -tvd])

    for i in range(n - 1):
        a = i * 2       # right_i
        b = i * 2 + 1   # left_i
        c = (i + 1) * 2     # right_{i+1}
        d = (i + 1) * 2 + 1 # left_{i+1}
        indices.extend([a, c, b, b, c, d])

    cell_ids = list(range(len(indices) // 3))

    prefix = f"wellsec_{name}"
    (bin_dir / f"{prefix}_positions.f32").write_bytes(
        struct.pack(f"<{len(positions)}f", *positions)
    )
    (bin_dir / f"{prefix}_indices.u32").write_bytes(
        struct.pack(f"<{len(indices)}I", *indices)
    )
    (bin_dir / f"{prefix}_cell_ids.u32").write_bytes(
        struct.pack(f"<{len(cell_ids)}I", *cell_ids)
    )

    return {
        "id": f"wellsec_{name}",
        "name": f"Well Section: {name}",
        "n_vertices": n * 2,
        "n_cells": len(cell_ids),
        "n_indices": len(indices),
        "source": "well-intersection",
        "files": {
            "positions": f"{prefix}_positions.f32",
            "indices": f"{prefix}_indices.u32",
            "cell_ids": f"{prefix}_cell_ids.u32",
            "scalars": {},
        },
    }
