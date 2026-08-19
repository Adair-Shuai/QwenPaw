# -*- coding: utf-8 -*-
"""Intersection (cross-section) converter.

Generates 2D/3D cross-section geometry from a 3D grid along a
polyline path. Used for geological cross-sections and well tie views.
"""

from __future__ import annotations

import struct
from pathlib import Path
from typing import Any


def _cell_xy_centers(grid_positions: list[float], n_cells: int) -> list[tuple[float, float]]:
    if n_cells <= 0 or len(grid_positions) < n_cells * 24:
        return []
    verts_per_cell = len(grid_positions) // (3 * n_cells)
    centers: list[tuple[float, float]] = []
    for cell_offset in range(n_cells):
        start = cell_offset * verts_per_cell * 3
        xs = 0.0
        ys = 0.0
        for vertex in range(verts_per_cell):
            xs += float(grid_positions[start + vertex * 3])
            ys += float(grid_positions[start + vertex * 3 + 1])
        centers.append((xs / verts_per_cell, ys / verts_per_cell))
    return centers


def _nearest_cell(centers: list[tuple[float, float]], x: float, y: float) -> int:
    best = 0
    best_dist = float("inf")
    for offset, (cx, cy) in enumerate(centers):
        dx = cx - x
        dy = cy - y
        dist = dx * dx + dy * dy
        if dist < best_dist:
            best_dist = dist
            best = offset
    return best


def _sample_scalars_on_triangles(
    triangle_xy: list[tuple[float, float]],
    grid_positions: list[float],
    grid_cell_ids: list[int],
    property_values: list[float],
) -> list[float]:
    """Nearest-cell XY lookup so a curtain/well section inherits grid properties."""
    if not grid_cell_ids or not property_values or not grid_positions:
        return []
    centers = _cell_xy_centers(grid_positions, len(grid_cell_ids))
    if not centers:
        return []
    sampled: list[float] = []
    for x, y in triangle_xy:
        offset = _nearest_cell(centers, x, y)
        if offset < len(property_values):
            sampled.append(float(property_values[offset]))
        else:
            sampled.append(0.0)
    return sampled


def _write_geometry(prefix: str, bin_dir: Path, positions: list[float], indices: list[int], cell_ids: list[int]) -> None:
    bin_dir.mkdir(parents=True, exist_ok=True)
    (bin_dir / f"{prefix}_positions.f32").write_bytes(
        struct.pack(f"<{len(positions)}f", *positions)
    )
    (bin_dir / f"{prefix}_indices.u32").write_bytes(
        struct.pack(f"<{len(indices)}I", *indices)
    )
    (bin_dir / f"{prefix}_cell_ids.u32").write_bytes(
        struct.pack(f"<{len(cell_ids)}I", *cell_ids)
    )


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
    property_values: list[float] | None = None,
    property_name: str = "",
) -> dict[str, Any]:
    """Create a vertical cross-section along a 2D polyline.

    The intersection is a vertical curtain following the polyline path,
    with Z ranging from z_min to z_max. When grid geometry and a scalar
    array are supplied, each curtain triangle is coloured from the nearest
    reservoir cell in map view.
    """
    del grid_indices  # Topology is not required for nearest-cell XY sampling.
    n_path = len(polyline_x)
    if n_path < 2:
        raise ValueError("Polyline must have at least 2 points")

    prefix = f"intersection_{name}"

    positions: list[float] = []
    indices: list[int] = []

    for i in range(n_path):
        px = float(polyline_x[i])
        py = float(polyline_y[i])
        positions.extend([px, py, -float(z_max)])
        positions.extend([px, py, -float(z_min)])

    triangle_xy: list[tuple[float, float]] = []
    for i in range(n_path - 1):
        a = i * 2
        b = i * 2 + 1
        c = (i + 1) * 2
        d = (i + 1) * 2 + 1
        indices.extend([a, c, b, b, c, d])
        mid_x = (float(polyline_x[i]) + float(polyline_x[i + 1])) * 0.5
        mid_y = (float(polyline_y[i]) + float(polyline_y[i + 1])) * 0.5
        triangle_xy.extend([(mid_x, mid_y), (mid_x, mid_y)])

    cell_ids = list(range(len(indices) // 3))
    _write_geometry(prefix, bin_dir, positions, indices, cell_ids)

    scalar_files: dict[str, str] = {}
    if property_values and property_name:
        sampled = _sample_scalars_on_triangles(
            triangle_xy, grid_positions, grid_cell_ids, property_values,
        )
        if sampled:
            filename = f"{prefix}_scalars_{property_name}.f32"
            (bin_dir / filename).write_bytes(struct.pack(f"<{len(sampled)}f", *sampled))
            scalar_files[property_name] = filename

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
            "scalars": scalar_files,
        },
        "metadata": {
            "n_waypoints": n_path,
            "z_range": [float(z_min), float(z_max)],
            "sampled_property": property_name or None,
        },
    }


def create_well_intersection(
    well_x: list[float],
    well_y: list[float],
    well_tvd: list[float],
    name: str,
    bin_dir: Path,
    offset: float = 50.0,
    grid_positions: list[float] | None = None,
    grid_cell_ids: list[int] | None = None,
    property_values: list[float] | None = None,
    property_name: str = "",
) -> dict[str, Any]:
    """Create a cross-section along a well trajectory.

    The section is a vertical strip centered on the well path,
    with a lateral offset for visual separation.
    """
    n = len(well_x)
    if n < 2 or n != len(well_y) or n != len(well_tvd):
        raise ValueError("Well section requires matching x/y/tvd arrays with at least 2 stations")
    positions: list[float] = []
    indices: list[int] = []
    triangle_xy: list[tuple[float, float]] = []

    for i in range(n):
        px = float(well_x[i])
        py = float(well_y[i])
        tvd = float(well_tvd[i])
        positions.extend([px + offset, py, -tvd])
        positions.extend([px - offset, py, -tvd])

    for i in range(n - 1):
        a = i * 2
        b = i * 2 + 1
        c = (i + 1) * 2
        d = (i + 1) * 2 + 1
        indices.extend([a, c, b, b, c, d])
        mid_x = (float(well_x[i]) + float(well_x[i + 1])) * 0.5
        mid_y = (float(well_y[i]) + float(well_y[i + 1])) * 0.5
        triangle_xy.extend([(mid_x, mid_y), (mid_x, mid_y)])

    cell_ids = list(range(len(indices) // 3))
    prefix = f"wellsec_{name}"
    _write_geometry(prefix, bin_dir, positions, indices, cell_ids)

    scalar_files: dict[str, str] = {}
    if property_values and property_name and grid_positions and grid_cell_ids:
        sampled = _sample_scalars_on_triangles(
            triangle_xy, list(grid_positions), list(grid_cell_ids), property_values,
        )
        if sampled:
            filename = f"{prefix}_scalars_{property_name}.f32"
            (bin_dir / filename).write_bytes(struct.pack(f"<{len(sampled)}f", *sampled))
            scalar_files[property_name] = filename

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
            "scalars": scalar_files,
        },
        "metadata": {"sampled_property": property_name or None, "offset": float(offset)},
    }
