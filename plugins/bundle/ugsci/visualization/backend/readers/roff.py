# -*- coding: utf-8 -*-
"""ROFF and Eclipse EGRID grid reader using xtgeo.

Converts binary reservoir grid files to Three.js-compatible
binary format (positions, indices, cell_ids, scalars).

Supported formats:
- ROFF (.roff) — binary format via xtgeo
- Eclipse EGRID (.EGRID/.egrid) — via xtgeo + resfo
- GRDECL (.grdecl) — Eclipse ASCII keyword format
"""

from __future__ import annotations

import struct
import time
import warnings
from pathlib import Path
from typing import Any

warnings.filterwarnings("ignore", category=UserWarning)


def _write_f32(path: Path, values: list[float]) -> None:
    path.write_bytes(struct.pack(f"<{len(values)}f", *values))

def _write_u32(path: Path, values: list[int]) -> None:
    path.write_bytes(struct.pack(f"<{len(values)}I", *values))


def _detect_format(file_path: str) -> str:
    """Auto-detect xtgeo format from file extension."""
    ext = Path(file_path).suffix.lower()
    if ext in (".roff", ".roffbin"):
        return "roff"
    if ext in (".egrid", ".eclrun"):
        return "egrid"
    if ext == ".grdecl":
        return "grdecl"
    if ext == ".init":
        return "init"
    if ext == ".unrst":
        return "unrst"
    return "roff"  # default


def convert_grid_to_binary(
    grid_path: str,
    prop_files: dict[str, str],
    name: str,
    bin_dir: Path,
) -> dict[str, Any]:
    """Convert a ROFF or EGRID grid to Three.js binary format.

    Args:
        grid_path: Path to the grid file
        prop_files: Dict of {property_name: property_file_path}
        name: Dataset name for output files
        bin_dir: Output directory

    Returns:
        Dataset manifest entry with file descriptors.
    """
    import xtgeo

    fformat = _detect_format(grid_path)

    print(f"  Loading grid ({fformat}): {grid_path}")
    t0 = time.time()

    grd = xtgeo.grid_from_file(grid_path, fformat=fformat)
    dims = grd.dimensions
    ncol, nrow, nlay = dims.ncol, dims.nrow, dims.nlay
    n_total = ncol * nrow * nlay
    print(f"  Grid: {ncol}x{nrow}x{nlay} = {n_total:,} total cells")

    # Get active cells
    actnum = grd.get_actnum()
    active_mask = actnum.values.flatten(order="F").astype(bool)
    n_active = int(active_mask.sum())
    print(f"  Active cells: {n_active:,}")

    # Get corner-point coordinates (24 properties: 8 corners x 3 coords)
    corners = grd.get_xyz_corners()
    corner_xyz = []
    for i in range(0, 24, 3):
        x_arr = corners[i].values.flatten(order="F")
        y_arr = corners[i + 1].values.flatten(order="F")
        z_arr = corners[i + 2].values.flatten(order="F")
        corner_xyz.append((x_arr, y_arr, z_arr))

    # Build vertex array (8 vertices per active cell)
    # Bug 5 fix: store original cell_idx, not sequential output index
    positions: list[float] = []
    cell_ids: list[int] = []

    from ..converters.hex import XTGEO_TO_VTK, compact_hex_centroid_mesh

    for cell_idx in range(n_total):
        if not active_mask[cell_idx]:
            continue
        for eclipse_index in XTGEO_TO_VTK:
            x_arr, y_arr, z_arr = corner_xyz[eclipse_index]
            x = float(x_arr[cell_idx]) if x_arr[cell_idx] is not None else 0.0
            y = float(y_arr[cell_idx]) if y_arr[cell_idx] is not None else 0.0
            z = float(z_arr[cell_idx]) if z_arr[cell_idx] is not None else 0.0
            positions.extend([x, y, -z])
        cell_ids.append(cell_idx)  # Store ORIGINAL cell index, not output index

    positions, packed_indices = compact_hex_centroid_mesh(positions)
    n_vertices = len(positions) // 3
    _write_f32(bin_dir / f"{name}_positions.f32", positions)
    _write_u32(bin_dir / f"{name}_cell_ids.u32", cell_ids)

    indices = list(packed_indices)
    _write_u32(bin_dir / f"{name}_indices.u32", indices)

    print(f"  Vertices: {n_vertices:,}, Triangles: {len(indices) // 3:,}")

    # Extract properties — Bug 6 fix: auto-detect property format
    scalars_files: dict[str, str] = {}
    for prop_name, prop_path in prop_files.items():
        print(f"  Loading property: {prop_name} from {prop_path}")
        prop_format = _detect_format(prop_path)

        # Auto-discover property name
        try:
            prop_names = xtgeo.list_gridproperties(prop_path, fformat=prop_format)
            prop_name_in_file = prop_names[0] if len(prop_names) == 1 else prop_name.upper()
        except Exception:
            prop_name_in_file = prop_name.upper()

        prop = xtgeo.gridproperty_from_file(
            prop_path, fformat=prop_format, name=prop_name_in_file,
        )
        prop_values = prop.values.flatten(order="F")

        active_values: list[float] = []
        for cell_idx in range(n_total):
            if active_mask[cell_idx]:
                v = float(prop_values[cell_idx])
                active_values.append(v if v == v else 0.0)  # NaN check

        ext = ".f32"
        _write_f32(bin_dir / f"{name}_scalars_{prop_name}{ext}", active_values)
        scalars_files[prop_name] = f"{name}_scalars_{prop_name}{ext}"
        print(f"    {prop_name}: min={min(active_values):.4f}, max={max(active_values):.4f}")

    # Generate derived properties
    if "porosity" in scalars_files:
        poro_data = struct.unpack(
            f"<{n_active}f",
            (bin_dir / scalars_files["porosity"]).read_bytes(),
        )
        if "permeability" not in scalars_files:
            perm = [p**3 * 1000 + 0.01 for p in poro_data]
            _write_f32(bin_dir / f"{name}_scalars_permeability.f32", perm)
            scalars_files["permeability"] = f"{name}_scalars_permeability.f32"
        if "facies" not in scalars_files:
            facies = [int(p > 0.15) + int(p > 0.25) for p in poro_data]
            _write_u32(bin_dir / f"{name}_scalars_facies.u32", facies)
            scalars_files["facies"] = f"{name}_scalars_facies.u32"

    elapsed = time.time() - t0
    print(f"  Conversion time: {elapsed:.2f}s")

    return {
        "id": name,
        "name": f"Grid: {name} ({ncol}x{nrow}x{nlay}, {n_active:,} active)",
        "n_vertices": n_vertices,
        "n_cells": n_active,
        "n_indices": len(indices),
        "grid_dims": [ncol, nrow, nlay],
        "source": fformat,
        "files": {
            "positions": f"{name}_positions.f32",
            "indices": f"{name}_indices.u32",
            "cell_ids": f"{name}_cell_ids.u32",
            "scalars": scalars_files,
        },
    }
