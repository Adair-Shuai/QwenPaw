# -*- coding: utf-8 -*-
"""Surface mesh converter.

Converts 2D regular grid surfaces (horizons, fault planes) to
TriangleMesh binary format.
"""

from __future__ import annotations

import struct
from pathlib import Path
from typing import Any

from .geometry import finite_number, geometry_metadata, resource_name


def convert_regular_surface(
    x: list[float],
    y: list[float],
    z: list[list[float]],
    name: str,
    bin_dir: Path,
) -> dict[str, Any]:
    """Convert a regular grid surface to binary format.

    Args:
        x: X coordinates (nx values)
        y: Y coordinates (ny values)
        z: Z values (ny × nx grid, row-major)
        name: Surface name
        bin_dir: Output directory
    """
    nx = len(x)
    ny = len(y)
    if nx < 2 or ny < 2 or len(z) != ny or any(len(row) != nx for row in z):
        raise ValueError("层面网格至少为 2×2，Z 的行列数必须与 Y、X 一致")
    x = [finite_number(value, "X") for value in x]
    y = [finite_number(value, "Y") for value in y]
    z = [[finite_number(value, "Z") for value in row] for row in z]
    for label, axis in (("X", x), ("Y", y)):
        increasing = all(b > a for a, b in zip(axis, axis[1:]))
        decreasing = all(b < a for a, b in zip(axis, axis[1:]))
        if not (increasing or decreasing):
            raise ValueError(f"层面 {label} 坐标必须严格单调")
    n_vertices = nx * ny

    prefix = f"surface_{resource_name(name)}"

    positions: list[float] = []
    for j in range(ny):
        for i in range(nx):
            positions.extend([float(x[i]), float(y[j]), -float(z[j][i])])

    # Triangle indices for regular grid
    indices: list[int] = []
    for j in range(ny - 1):
        for i in range(nx - 1):
            a = j * nx + i
            b = j * nx + i + 1
            c = (j + 1) * nx + i
            d = (j + 1) * nx + i + 1
            indices.extend([a, b, c, b, d, c])

    cell_ids = list(range(len(indices) // 3))

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

    return {
        "id": prefix,
        "name": f"层面：{name}（{nx}×{ny}）",
        "n_vertices": n_vertices,
        "n_cells": len(cell_ids),
        "n_indices": len(indices),
        "source": "surface",
        "files": {
            "positions": f"{prefix}_positions.f32",
            "indices": f"{prefix}_indices.u32",
            "cell_ids": f"{prefix}_cell_ids.u32",
            "scalars": {},
        },
        "metadata": {
            **geometry_metadata("triangles", "cell"),
            "indices_per_cell": 3,
            "grid_dims": [nx, ny],
            "x_range": [float(min(x)), float(max(x))],
            "y_range": [float(min(y)), float(max(y))],
        },
    }
