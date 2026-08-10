# -*- coding: utf-8 -*-
"""Synthetic grid generator for benchmark testing.

Generates corner-point-like grids with fault displacement,
layered porosity, and derived permeability/facies properties.
All output is written as raw binary for efficient frontend fetching.
"""

from __future__ import annotations

import json
import math
import struct
import time
from pathlib import Path


def _write_f32(path: Path, values: list[float]) -> None:
    path.write_bytes(struct.pack(f"<{len(values)}f", *values))

def _write_u32(path: Path, values: list[int]) -> None:
    path.write_bytes(struct.pack(f"<{len(values)}I", *values))


def generate_synthetic_grid(
    nx: int, ny: int, nz: int,
    name: str,
    bin_dir: Path,
) -> dict:
    """Generate a synthetic grid and write binary files.

    Args:
        nx, ny, nz: Grid dimensions
        name: Dataset name
        bin_dir: Output directory for binary files

    Returns:
        Dataset manifest entry.
    """
    t0 = time.time()
    n_cells = nx * ny * nz
    nvx, nvy, nvz = nx + 1, ny + 1, nz + 1
    n_vertices = nvx * nvy * nvz

    # Generate positions
    positions: list[float] = []
    cell_size = 50.0
    for k in range(nvz):
        for j in range(nvy):
            for i in range(nvx):
                x = i * cell_size
                y = j * cell_size
                z = -k * cell_size * 0.5
                if i > nx * 0.6:
                    x += 20.0 * math.sin(j * 0.1) * (k / nvz)
                z -= i * 0.3 + j * 0.2
                positions.extend([x, y, z])

    # Generate indices (top face quads)
    indices: list[int] = []
    cell_ids: list[int] = []
    def vidx(i, j, k): return k * nvx * nvy + j * nvx + i
    for k in range(nz):
        for j in range(ny):
            for i in range(nx):
                cell_ids.append(k * nx * ny + j * nx + i)
                a = vidx(i, j, k)
                b = vidx(i + 1, j, k)
                c = vidx(i + 1, j + 1, k)
                d = vidx(i, j + 1, k)
                indices.extend([a, b, c, a, c, d])

    # Generate porosity
    scalars: list[float] = []
    for k in range(nz):
        for j in range(ny):
            for i in range(nx):
                base = 0.35 - k * 0.02
                noise = 0.05 * math.sin(i * 0.3) * math.cos(j * 0.2)
                scalars.append(max(0.01, base + noise))

    prefix = f"synthetic_{name}"
    _write_f32(bin_dir / f"{prefix}_positions.f32", positions)
    _write_u32(bin_dir / f"{prefix}_indices.u32", indices)
    _write_u32(bin_dir / f"{prefix}_cell_ids.u32", cell_ids)
    _write_f32(bin_dir / f"{prefix}_scalars_porosity.f32", scalars)
    _write_f32(bin_dir / f"{prefix}_scalars_permeability.f32", [p**3 * 1000 for p in scalars])
    _write_u32(bin_dir / f"{prefix}_scalars_facies.u32", [int(p > 0.2) + int(p > 0.3) for p in scalars])

    elapsed = time.time() - t0
    print(f"    synthetic_{name}: {n_cells} cells, {elapsed:.2f}s")

    return {
        "id": f"synthetic_{name}",
        "name": f"Synthetic {name} ({nx}x{ny}x{nz})",
        "n_vertices": n_vertices,
        "n_cells": n_cells,
        "n_indices": len(indices),
        "source": "synthetic",
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


def generate_all_synthetic(bin_dir: Path) -> list[dict]:
    """Generate standard synthetic datasets (100k, 500k, 1M cells)."""
    print("[oilgas-vis] Generating synthetic grids...")
    configs = [
        (47, 47, 46, "100k"),
        (80, 80, 80, "500k"),
        (101, 101, 100, "1m"),
    ]
    return [generate_synthetic_grid(nx, ny, nz, name, bin_dir) for nx, ny, nz, name in configs]
