# -*- coding: utf-8 -*-
"""IJK slice extraction from a corner-point hex mesh."""

from __future__ import annotations

import struct
from pathlib import Path
from typing import Any, Sequence


def create_ijk_slice(
    positions: Sequence[float],
    indices: Sequence[int],
    cell_ids: Sequence[int],
    grid_dims: Sequence[int],
    axis: str,
    index: int,
    name: str,
    bin_dir: Path,
    scalars: dict[str, Sequence[float]] | None = None,
) -> dict[str, Any]:
    """Keep cells whose 1-based I, J or K index matches ``index``."""
    axis_name = axis.strip().lower()
    if axis_name not in {"i", "j", "k"}:
        raise ValueError("axis must be i, j or k")
    if len(grid_dims) != 3 or any(int(value) <= 0 for value in grid_dims):
        raise ValueError("grid_dims must be a positive I/J/K triple")
    ncol, nrow, nlay = (int(value) for value in grid_dims)
    limits = {"i": ncol, "j": nrow, "k": nlay}
    if index < 1 or index > limits[axis_name]:
        raise ValueError(f"{axis_name.upper()} index {index} is outside 1..{limits[axis_name]}")

    n_cells = len(cell_ids)
    if n_cells == 0:
        raise ValueError("source grid has no cells")
    verts_per_cell = len(positions) // (3 * n_cells)
    if verts_per_cell <= 0 or len(positions) != n_cells * verts_per_cell * 3:
        raise ValueError("grid positions do not match cell count")
    indices_per_cell = len(indices) // n_cells
    if indices_per_cell <= 0 or len(indices) != n_cells * indices_per_cell:
        raise ValueError("grid indices do not match cell count")

    selected: list[int] = []
    for offset, cell_id in enumerate(cell_ids):
        i_index = int(cell_id) % ncol + 1
        j_index = (int(cell_id) // ncol) % nrow + 1
        k_index = int(cell_id) // (ncol * nrow) + 1
        current = {"i": i_index, "j": j_index, "k": k_index}[axis_name]
        if current == index:
            selected.append(offset)
    if not selected:
        raise ValueError(f"no active cells on {axis_name.upper()}={index}")

    out_positions: list[float] = []
    out_indices: list[int] = []
    out_cell_ids: list[int] = []
    for new_offset, source_offset in enumerate(selected):
        start = source_offset * verts_per_cell * 3
        out_positions.extend(float(value) for value in positions[start:start + verts_per_cell * 3])
        base = new_offset * verts_per_cell
        src_index_start = source_offset * indices_per_cell
        first_vertex = source_offset * verts_per_cell
        for value in indices[src_index_start:src_index_start + indices_per_cell]:
            out_indices.append(int(value) - first_vertex + base)
        out_cell_ids.append(int(cell_ids[source_offset]))

    prefix = f"slice_{name}"
    bin_dir.mkdir(parents=True, exist_ok=True)
    (bin_dir / f"{prefix}_positions.f32").write_bytes(
        struct.pack(f"<{len(out_positions)}f", *out_positions)
    )
    (bin_dir / f"{prefix}_indices.u32").write_bytes(
        struct.pack(f"<{len(out_indices)}I", *out_indices)
    )
    (bin_dir / f"{prefix}_cell_ids.u32").write_bytes(
        struct.pack(f"<{len(out_cell_ids)}I", *out_cell_ids)
    )
    scalar_files: dict[str, str] = {}
    for key, values in (scalars or {}).items():
        sampled = [float(values[offset]) for offset in selected if offset < len(values)]
        if len(sampled) != len(selected):
            continue
        filename = f"{prefix}_scalars_{key}.f32"
        (bin_dir / filename).write_bytes(struct.pack(f"<{len(sampled)}f", *sampled))
        scalar_files[key] = filename

    return {
        "id": prefix,
        "name": f"Slice: {axis_name.upper()}={index} ({len(selected)} cells)",
        "n_vertices": len(out_positions) // 3,
        "n_cells": len(selected),
        "n_indices": len(out_indices),
        "grid_dims": list(grid_dims),
        "source": "slice",
        "files": {
            "positions": f"{prefix}_positions.f32",
            "indices": f"{prefix}_indices.u32",
            "cell_ids": f"{prefix}_cell_ids.u32",
            "scalars": scalar_files,
        },
        "metadata": {
            "axis": axis_name,
            "index": int(index),
            "n_source_cells": n_cells,
        },
    }
