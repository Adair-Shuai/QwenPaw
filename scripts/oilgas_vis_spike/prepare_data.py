#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# pylint: skip-file
"""Prepare visualization data from webviz-subsurface-components example data.

Converts JSON VTK grid arrays to compact binary files that can be
efficiently fetched by a Three.js viewer. Also generates synthetic
large grids (100k / 500k / 1M cells) for benchmark testing.

Output layout:
    data/bin/
        simgrid_positions.f32      # Float32Array  — vertex xyz
        simgrid_indices.u32         # Uint32Array   — cell index pairs
        simgrid_scalars_porosity.f32  # Float32Array — per-cell property
        synthetic_100k_*.bin        # synthetic grids
        synthetic_500k_*.bin
        synthetic_1m_*.bin
        manifest.json               # dataset catalog
"""

from __future__ import annotations

import json
import math
import struct
import sys
import time
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
BIN_DIR = DATA_DIR / "bin"
BIN_DIR.mkdir(parents=True, exist_ok=True)


# ─── Helper: write typed array to raw binary ──────────────────────────────


def write_f32(path: Path, values: list[float]) -> int:
    """Write a list of floats as raw little-endian Float32 binary."""
    data = struct.pack(f"<{len(values)}f", *values)
    path.write_bytes(data)
    return len(data)


def write_u32(path: Path, values: list[int]) -> int:
    """Write a list of ints as raw little-endian Uint32 binary."""
    data = struct.pack(f"<{len(values)}I", *values)
    path.write_bytes(data)
    return len(data)


# ─── 1. Convert webviz Simgrid data ─────────────────────────────────────────


def convert_simgrid() -> dict:
    """Convert the webviz Simgrid JSON arrays to binary format."""
    print("[1/3] Converting webviz Simgrid data...")

    pts = json.loads((DATA_DIR / "simgrid_points.json").read_text())
    polys = json.loads((DATA_DIR / "simgrid_polys.json").read_text())
    scalars = json.loads((DATA_DIR / "simgrid_scalar.json").read_text())

    # Points: flat [x0,y0,z0, x1,y1,z1, ...] → already in this format
    n_vertices = len(pts) // 3
    write_f32(BIN_DIR / "simgrid_positions.f32", pts)

    # Polys: VTK cell array [n, i0, i1, ..., n, i0, ...]
    # Convert to index pairs: for quad cells, each cell is [n, i0, i1, i2, i3]
    # We need to extract the indices, skipping the size prefix.
    # For rendering, we'll produce:
    #   - indices.u32: flat index array for gl.TRIANGLES (each quad → 2 triangles)
    #   - cell_ids.u32: per-cell ID for picking
    indices: list[int] = []
    cell_ids: list[int] = []
    cell_count = 0
    i = 0
    while i < len(polys):
        n = int(polys[i])
        cell_indices = polys[i + 1 : i + 1 + n]
        cell_ids.append(cell_count)
        cell_count += 1
        if n == 4:
            # Quad → two triangles
            a, b, c, d = cell_indices
            indices.extend([a, b, c, a, c, d])
        elif n == 3:
            # Triangle
            a, b, c = cell_indices
            indices.extend([a, b, c])
        else:
            # Fan triangulation
            for j in range(1, n - 1):
                indices.extend(
                    [cell_indices[0], cell_indices[j], cell_indices[j + 1]],
                )
        i += 1 + n

    write_u32(BIN_DIR / "simgrid_indices.u32", indices)
    write_u32(BIN_DIR / "simgrid_cell_ids.u32", cell_ids)

    # Scalars: per-cell property (porosity)
    write_f32(BIN_DIR / "simgrid_scalars_porosity.f32", scalars)

    # Generate a second synthetic property (permeability) from porosity
    perm = [float(p * 1000 + 0.01) for p in scalars]  # Kozeny-Carman-ish
    write_f32(BIN_DIR / "simgrid_scalars_permeability.f32", perm)

    # Generate a discrete property (facies)
    facies = [int(p > 0.15) + int(p > 0.25) for p in scalars]
    write_u32(BIN_DIR / "simgrid_scalars_facies.u32", facies)

    print(f"  Vertices: {n_vertices}")
    print(f"  Cells:    {cell_count}")
    print(f"  Indices:  {len(indices)} (triangle indices)")

    return {
        "id": "simgrid",
        "name": "Simgrid (webviz example)",
        "n_vertices": n_vertices,
        "n_cells": cell_count,
        "n_indices": len(indices),
        "files": {
            "positions": "simgrid_positions.f32",
            "indices": "simgrid_indices.u32",
            "cell_ids": "simgrid_cell_ids.u32",
            "scalars": {
                "porosity": "simgrid_scalars_porosity.f32",
                "permeability": "simgrid_scalars_permeability.f32",
                "facies": "simgrid_scalars_facies.u32",
            },
        },
    }


# ─── 2. Generate synthetic grids ────────────────────────────────────────────


def generate_synthetic_grid(nx: int, ny: int, nz: int, name: str) -> dict:
    """Generate a synthetic corner-point-like grid.

    Produces a regular grid with slight fault displacement for realism.
    All arrays are written as raw binary for efficient fetching.
    """
    print(f"  Generating {name}: {nx}x{ny}x{nz} = {nx*ny*nz} cells...")

    t0 = time.time()
    n_cells = nx * ny * nz
    # Vertices: (nx+1) * (ny+1) * (nz+1)
    nvx, nvy, nvz = nx + 1, ny + 1, nz + 1
    n_vertices = nvx * nvy * nvz

    # Generate positions
    positions: list[float] = []
    cell_size = 50.0  # meters
    fault_offset = 0.0
    for k in range(nvz):
        for j in range(nvy):
            for i in range(nvx):
                x = i * cell_size
                y = j * cell_size
                z = -k * cell_size * 0.5  # depth

                # Add a fault: shift x for cells past a plane
                if i > nx * 0.6:
                    fault_offset = 20.0 * math.sin(j * 0.1) * (k / nvz)
                    x += fault_offset

                # Slight structural dip
                z -= i * 0.3 + j * 0.2

                positions.extend([x, y, z])

    # Generate indices (two triangles per hexahedral face — we render
    # top faces only for performance, like a fence diagram)
    # For each cell, we create a quad on the top face
    indices: list[int] = []
    cell_ids: list[int] = []

    def vidx(i: int, j: int, k: int) -> int:
        return k * nvx * nvy + j * nvx + i

    for k in range(nz):
        for j in range(ny):
            for i in range(nx):
                cell_id = k * nx * ny + j * nx + i
                cell_ids.append(cell_id)

                # Top face quad
                a = vidx(i, j, k)
                b = vidx(i + 1, j, k)
                c = vidx(i + 1, j + 1, k)
                d = vidx(i, j + 1, k)
                indices.extend([a, b, c, a, c, d])

    # Generate scalar property (porosity)
    scalars: list[float] = []
    for k in range(nz):
        for j in range(ny):
            for i in range(nx):
                # Layer-dependent porosity with some noise
                base = 0.35 - k * 0.02  # decreases with depth
                noise = 0.05 * math.sin(i * 0.3) * math.cos(j * 0.2)
                scalars.append(max(0.01, base + noise))

    # Write binary files
    prefix = f"synthetic_{name}"
    write_f32(BIN_DIR / f"{prefix}_positions.f32", positions)
    write_u32(BIN_DIR / f"{prefix}_indices.u32", indices)
    write_u32(BIN_DIR / f"{prefix}_cell_ids.u32", cell_ids)
    write_f32(BIN_DIR / f"{prefix}_scalars_porosity.f32", scalars)

    # Generate permeability from porosity
    perm = [p**3 * 1000 for p in scalars]
    write_f32(BIN_DIR / f"{prefix}_scalars_permeability.f32", perm)

    # Generate facies (discrete)
    facies = [int(p > 0.2) + int(p > 0.3) for p in scalars]
    write_u32(BIN_DIR / f"{prefix}_scalars_facies.u32", facies)

    elapsed = time.time() - t0
    bin_size = sum(
        (BIN_DIR / f"{prefix}_{suffix}").stat().st_size
        for suffix in [
            "positions.f32",
            "indices.u32",
            "cell_ids.u32",
            "scalars_porosity.f32",
            "scalars_permeability.f32",
            "scalars_facies.u32",
        ]
    )
    print(
        f"    vertices={n_vertices}, cells={n_cells}, "
        f"indices={len(indices)}, "
        f"binary={bin_size / 1024 / 1024:.1f} MB, "
        f"gen_time={elapsed:.2f}s",
    )

    return {
        "id": f"synthetic_{name}",
        "name": f"Synthetic {name} ({nx}x{ny}x{nz})",
        "n_vertices": n_vertices,
        "n_cells": n_cells,
        "n_indices": len(indices),
        "files": {
            "positions": f"{prefix}_positions.f32",
            "indices": f"{prefix}_indices.u32",
            "cell_ids": f"{prefix}_cell_ids.u32",
            "scalars": {
                "porosity": f"{prefix}_scalars_porosity.f32",
                "permeability": f"{prefix}_scalars_permeability.f32",
                "facies": f"{prefix}_scalars_facies.u32",
            },
        },
    }


# ─── 3. Generate well log data ─────────────────────────────────────────────


def prepare_well_log_data() -> dict:
    """Extract well log curve data from two_logs_example.json."""
    print("[2/3] Preparing well log data...")
    try:
        data = json.loads((DATA_DIR / "two_logs_example.json").read_text())
        collections = data.get("wellLogCollections", [])
        if not collections:
            print("  No wellLogCollections found")
            return {}

        logs = []
        for col in collections:
            # wellLogCollections is a list of lists of well objects
            wells = col if isinstance(col, list) else [col]
            for well in wells:
                if not isinstance(well, dict):
                    continue
                header = well.get("header", {})
                curves_meta = well.get("curves", [])
                data_rows = well.get("data", [])
                name = header.get("well", "unknown")

                if not data_rows:
                    continue

                # data_rows is a 2D array: [[depth, curve1_val, curve2_val, ...], ...]
                # First column is depth
                all_depths: list[float] = []
                all_curves: dict[int, list[float]] = {}
                for row in data_rows:
                    if not isinstance(row, list):
                        continue
                    all_depths.append(
                        float(row[0]) if row[0] is not None else 0.0,
                    )
                    for ci in range(1, len(row)):
                        if ci not in all_curves:
                            all_curves[ci] = []
                        all_curves[ci].append(
                            float(row[ci]) if row[ci] is not None else 0.0,
                        )

                # Write depth
                safe_name = name.replace("/", "_").replace(" ", "_")
                write_f32(
                    BIN_DIR / f"welllog_{safe_name}_depth.f32",
                    all_depths,
                )

                # Write each curve
                curve_files = {"depth": f"welllog_{safe_name}_depth.f32"}
                for ci, vals in all_curves.items():
                    cname = (
                        curves_meta[ci]["name"]
                        if ci < len(curves_meta)
                        else f"curve_{ci}"
                    )
                    safe_cname = cname.replace("/", "_").replace(".", "_")
                    write_f32(
                        BIN_DIR / f"welllog_{safe_name}_{safe_cname}.f32",
                        vals,
                    )
                    curve_files[
                        cname
                    ] = f"welllog_{safe_name}_{safe_cname}.f32"

                logs.append(
                    {
                        "name": name,
                        "n_points": len(all_depths),
                        "curves": curve_files,
                    },
                )
                print(
                    f"  Well '{name}': {len(all_depths)} points, {len(all_curves)} curves",
                )

        return {"wells": logs}
    except Exception as exc:
        print(f"  Well log data not available: {exc}")
        return {"wells": []}


# ─── 4. Write manifest ──────────────────────────────────────────────────────


def main() -> None:
    print("=== Oil & Gas Visualization Data Preparation ===\n")

    datasets: list[dict] = []

    # 1. Convert webviz Simgrid
    sim = convert_simgrid()
    datasets.append(sim)

    # 2. Prepare well log data
    logs = prepare_well_log_data()

    # 3. Generate synthetic grids
    print("\n[3/3] Generating synthetic grids...")
    configs = [
        # (nx, ny, nz, name) — target ~100k, ~500k, ~1M cells
        (47, 47, 46, "100k"),  # ~101k cells
        (80, 80, 80, "500k"),  # ~512k cells
        (101, 101, 100, "1m"),  # ~1.02M cells
    ]
    for nx, ny, nz, name in configs:
        ds = generate_synthetic_grid(nx, ny, nz, name)
        datasets.append(ds)

    # 4. Write manifest
    manifest = {
        "version": 1,
        "datasets": datasets,
        "well_logs": logs,
        "properties": {
            "porosity": {
                "name": "Porosity",
                "unit": "fraction",
                "range": [0.0, 0.4],
                "colormap": "viridis",
            },
            "permeability": {
                "name": "Permeability",
                "unit": "mD",
                "range": [0.0, 100.0],
                "colormap": "plasma",
            },
            "facies": {
                "name": "Facies",
                "unit": "class",
                "range": [0, 2],
                "colormap": "category",
            },
        },
    }

    manifest_path = BIN_DIR / "manifest.json"
    manifest_path.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False),
    )
    print(f"\nManifest written to {manifest_path}")
    print(
        f"Total binary data: {sum(f.stat().st_size for f in BIN_DIR.iterdir() if f.is_file()) / 1024 / 1024:.1f} MB",
    )


if __name__ == "__main__":
    main()
