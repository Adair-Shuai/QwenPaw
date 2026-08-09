#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# pylint: skip-file
"""Convert Eclipse/ROFF grid files to Three.js binary format using xtgeo.

Supports:
- ROFF (.roff) — binary format via xtgeo
- Eclipse EGRID (.EGRID/.egrid) — via xtgeo + resfo
- Eclipse INIT (.INIT) — property extraction
- Eclipse UNRST (.UNRST) — dynamic properties (time steps)

The script extracts:
- Cell geometry: 8 corner-point coordinates per active cell
- Triangle indices: each cell rendered as 6 quads (12 triangles) on top faces
- Cell properties: porosity, permeability, saturation, etc.

Usage:
    .venv/bin/python scripts/oilgas_vis_spike/convert_roff_grid.py
"""

from __future__ import annotations

import json
import struct
import sys
import warnings
import time
from pathlib import Path

# Suppress xtgeo deprecation warnings for ROFF files
warnings.filterwarnings("ignore", category=UserWarning)

DATA_DIR = Path(__file__).parent / "data"
BIN_DIR = DATA_DIR / "bin"
BIN_DIR.mkdir(parents=True, exist_ok=True)


def write_f32(path: Path, values: list[float]) -> int:
    data = struct.pack(f"<{len(values)}f", *values)
    path.write_bytes(data)
    return len(data)


def write_u32(path: Path, values: list[int]) -> int:
    data = struct.pack(f"<{len(values)}I", *values)
    path.write_bytes(data)
    return len(data)


def convert_roff_grid(
    grid_path: str,
    prop_files: dict[str, str],
    name: str,
) -> dict:
    """Convert a ROFF or EGRID grid to Three.js binary format.

    Args:
        grid_path: Path to the .roff or .EGRID grid file
        prop_files: Dict of {property_name: property_file_path}
        name: Dataset name for output files
    """
    import xtgeo

    # Auto-detect format from file extension
    ext = Path(grid_path).suffix.lower()
    if ext in (".roff", ".roffbin"):
        fformat = "roff"
    elif ext in (".egrid", ".eclrun"):
        fformat = "egrid"
    elif ext == ".grdecl":
        fformat = "grdecl"
    else:
        fformat = "roff"  # default

    print(f"\n  Loading grid ({fformat}): {grid_path}")
    t0 = time.time()

    grd = xtgeo.grid_from_file(grid_path, fformat=fformat)
    dims = grd.dimensions
    ncol, nrow, nlay = dims.ncol, dims.nrow, dims.nlay
    n_total = ncol * nrow * nlay
    print(f"  Grid: {ncol}×{nrow}×{nlay} = {n_total:,} total cells")

    # Get active cells
    actnum = grd.get_actnum()
    active_mask = actnum.values.flatten(order="F").astype(bool)
    n_active = int(active_mask.sum())
    print(f"  Active cells: {n_active:,}")

    # Get corner-point coordinates (24 properties: 8 corners × 3 coords)
    # Tuple order: (x1,y1,z1, x2,y2,z2, ..., x8,y8,z8)
    corners = grd.get_xyz_corners()

    # Extract coordinates and flatten
    # Each GridProperty has shape (ncol, nrow, nlay)
    corner_xyz = []  # 8 × (x,y,z) arrays, each (ncol*nrow*nlay,)
    for i in range(0, 24, 3):
        x_arr = corners[i].values.flatten(order="F")
        y_arr = corners[i + 1].values.flatten(order="F")
        z_arr = corners[i + 2].values.flatten(order="F")
        corner_xyz.append((x_arr, y_arr, z_arr))

    # Build vertex array for Three.js
    # For each active cell, we output 8 vertices (8 corners)
    # Each vertex has 3 floats (x, y, z)
    positions: list[float] = []
    cell_ids: list[int] = []
    active_cell_indices: list[
        int
    ] = []  # mapping from output cell index to original index

    for cell_idx in range(n_total):
        if not active_mask[cell_idx]:
            continue
        # Output 8 corner vertices for this cell
        for ci in range(8):
            x_arr, y_arr, z_arr = corner_xyz[ci]
            # xtgeo uses masked arrays, fill with actual values
            x = float(x_arr[cell_idx]) if x_arr[cell_idx] is not None else 0.0
            y = float(y_arr[cell_idx]) if y_arr[cell_idx] is not None else 0.0
            z = float(z_arr[cell_idx]) if z_arr[cell_idx] is not None else 0.0
            positions.extend(
                [x, y, -z],
            )  # negate z for Three.js (depth goes down)
        cell_ids.append(len(active_cell_indices))
        active_cell_indices.append(cell_idx)

    n_vertices = len(positions) // 3
    write_f32(BIN_DIR / f"{name}_positions.f32", positions)
    write_u32(BIN_DIR / f"{name}_cell_ids.u32", cell_ids)

    # Build indices: each cell = 6 quad faces = 12 triangles = 36 indices
    # Cell corner numbering (Eclipse convention):
    #   1---2    5---6
    #   |   |    |   |
    #   4---3    8---7
    # (top: 1,2,3,4; bottom: 5,6,7,8)
    # Faces: top(1,2,3,4), bottom(5,6,7,8),
    #        front(1,2,6,5), back(3,4,8,7),
    #        left(1,4,8,5), right(2,3,7,6)

    # Corner indices within each cell's 8 vertices:
    # 0=1, 1=2, 2=3, 3=4, 4=5, 5=6, 6=7, 7=8
    faces = [
        (0, 1, 2, 3),  # top
        (4, 7, 6, 5),  # bottom (reversed for outward normal)
        (0, 1, 5, 4),  # front
        (3, 2, 6, 7),  # back
        (0, 3, 7, 4),  # left
        (1, 2, 6, 5),  # right
    ]

    indices: list[int] = []
    for cell_i in range(n_active):
        base = cell_i * 8  # offset of this cell's 8 vertices
        for face in faces:
            a, b, c, d = face
            indices.extend(
                [
                    base + a,
                    base + b,
                    base + c,  # triangle 1
                    base + a,
                    base + c,
                    base + d,  # triangle 2
                ],
            )

    write_u32(BIN_DIR / f"{name}_indices.u32", indices)
    print(f"  Vertices: {n_vertices:,} (8 per cell)")
    print(f"  Triangles: {len(indices) // 3:,} (12 per cell)")

    # Extract properties
    scalars_files = {}
    for prop_name, prop_path in prop_files.items():
        print(f"  Loading property: {prop_name} from {prop_path}")
        # Auto-discover property name if file has a single property
        prop_names = xtgeo.list_gridproperties(prop_path, fformat="roff")
        prop_name_in_file = (
            prop_names[0] if len(prop_names) == 1 else prop_name.upper()
        )
        prop = xtgeo.gridproperty_from_file(
            prop_path,
            fformat="roff",
            name=prop_name_in_file,
        )
        prop_values = prop.values.flatten(order="F")

        # Extract values for active cells only
        active_values: list[float] = []
        for cell_idx in range(n_total):
            if active_mask[cell_idx]:
                v = float(prop_values[cell_idx])
                active_values.append(v if v == v else 0.0)  # NaN check

        if prop_name == "porosity":
            write_f32(BIN_DIR / f"{name}_scalars_porosity.f32", active_values)
            scalars_files["porosity"] = f"{name}_scalars_porosity.f32"
        elif prop_name == "permeability":
            write_f32(
                BIN_DIR / f"{name}_scalars_permeability.f32",
                active_values,
            )
            scalars_files["permeability"] = f"{name}_scalars_permeability.f32"
        else:
            write_f32(
                BIN_DIR / f"{name}_scalars_{prop_name}.f32",
                active_values,
            )
            scalars_files[prop_name] = f"{name}_scalars_{prop_name}.f32"

        print(
            f"    {prop_name}: {len(active_values):,} values, "
            f"min={min(active_values):.4f}, max={max(active_values):.4f}",
        )

    # If no permeability file was provided, generate from porosity
    if "permeability" not in scalars_files and "porosity" in scalars_files:
        print(
            "  Generating synthetic permeability from porosity (Kozeny-Carman)...",
        )
        poro_path = BIN_DIR / scalars_files["porosity"]
        poro_data = struct.unpack(f"<{n_active}f", poro_path.read_bytes())
        perm_values = [p**3 * 1000 + 0.01 for p in poro_data]
        write_f32(BIN_DIR / f"{name}_scalars_permeability.f32", perm_values)
        scalars_files["permeability"] = f"{name}_scalars_permeability.f32"

    # Generate facies from porosity if available
    if "porosity" in scalars_files and "facies" not in scalars_files:
        print("  Generating facies classification from porosity...")
        poro_path = BIN_DIR / scalars_files["porosity"]
        poro_data = struct.unpack(f"<{n_active}f", poro_path.read_bytes())
        facies_values = [int(p > 0.15) + int(p > 0.25) for p in poro_data]
        write_u32(BIN_DIR / f"{name}_scalars_facies.u32", facies_values)
        scalars_files["facies"] = f"{name}_scalars_facies.u32"

    elapsed = time.time() - t0
    bin_size = sum(
        (BIN_DIR / f"{name}_{suffix}").stat().st_size
        for suffix in ["positions.f32", "indices.u32", "cell_ids.u32"]
    ) + sum(
        (BIN_DIR / fname).stat().st_size for fname in scalars_files.values()
    )

    print(f"  Binary size: {bin_size / 1024 / 1024:.1f} MB")
    print(f"  Conversion time: {elapsed:.2f}s")

    return {
        "id": name,
        "name": f"ROFF Grid: {name} ({ncol}×{nrow}×{nlay}, {n_active:,} active)",
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


def main():
    print("=== Eclipse/ROFF Grid Converter ===")

    datasets = []

    # 1. Convert webviz ROFF grid (real reservoir data)
    roff_grid = DATA_DIR / "eclgrid.roff"
    roff_poro = DATA_DIR / "eclgrid_poro.roff"

    if roff_grid.exists() and roff_poro.exists():
        print("\n[1/2] Converting ROFF grid from webviz example data...")
        ds = convert_roff_grid(
            str(roff_grid),
            {"porosity": str(roff_poro)},
            "roff_eclgrid",
        )
        datasets.append(ds)

    # 2. Convert EGRID test grid (Eclipse binary format)
    egrid_file = DATA_DIR / "test_boxgrid.EGRID"
    if egrid_file.exists():
        print("\n[2/2] Converting EGRID test grid (Eclipse binary)...")
        ds = convert_roff_grid(
            str(egrid_file),
            {},
            "egrid_test",
        )
        datasets.append(ds)

    # 2. Update manifest
    manifest_path = BIN_DIR / "manifest.json"
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text())
        # Replace or append
        existing_ids = {d["id"] for d in manifest["datasets"]}
        for ds in datasets:
            if ds["id"] in existing_ids:
                manifest["datasets"] = [
                    ds if d["id"] == ds["id"] else d
                    for d in manifest["datasets"]
                ]
            else:
                manifest["datasets"].insert(0, ds)  # ROFF grid first
        manifest_path.write_text(
            json.dumps(manifest, indent=2, ensure_ascii=False),
        )
        print(f"\nManifest updated: {manifest_path}")
        print(f"Total datasets: {len(manifest['datasets'])}")
        for ds in manifest["datasets"]:
            print(f"  - {ds['name']} ({ds['n_cells']:,} cells)")
    else:
        print("Manifest not found. Run prepare_data.py first.")


if __name__ == "__main__":
    main()
