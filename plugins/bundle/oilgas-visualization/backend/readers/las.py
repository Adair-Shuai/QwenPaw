# -*- coding: utf-8 -*-
"""LAS well log file reader.

Reads LAS 2.0/3.0 files using the ``lasio`` library and converts
well log curves to binary format for the Three.js viewer.

Each LAS file produces:
- positions.f32: MD/TVMD depth array
- scalars: one float32 array per curve (GR, SP, RT, etc.)
"""

from __future__ import annotations

import struct
from pathlib import Path
from typing import Any

from .base import BaseReader, write_f32, register_reader


class LasReader(BaseReader):
    """Reader for LAS well log files."""

    @property
    def format_id(self) -> str:
        return "las"

    @property
    def extensions(self) -> tuple[str, ...]:
        return (".las", ".las3")

    @property
    def requires(self) -> tuple[str, ...]:
        return ("lasio",)

    def read(
        self,
        file_path: str,
        name: str,
        bin_dir: Path,
        options: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Read a LAS file and convert to binary format."""
        import lasio

        las = lasio.read(file_path)

        # Extract depth (MD) as positions
        depth_mnemonic = options.get("depth_mnemonic", "DEPT") if options else "DEPT"
        if depth_mnemonic in las.curves:
            depths = las.curves[depth_mnemonic]
        elif "DEPT" in las.curves:
            depths = las.curves.DEPT
        elif "MD" in las.curves:
            depths = las.curves.MD
        else:
            depths = las.index

        n_samples = len(depths)

        # Write positions (x=0, y=0, z=depth for vertical well)
        positions: list[float] = []
        for d in depths:
            positions.extend([0.0, 0.0, -float(d)])  # negate z for depth-down

        prefix = f"las_{name}"
        write_f32(bin_dir / f"{prefix}_positions.f32", positions)

        # Build simple indices (line segments: pairs of adjacent points)
        indices: list[int] = []
        for i in range(n_samples - 1):
            indices.extend([i, i + 1, i])  # degenerate triangle as line

        from .base import write_u32
        write_u32(bin_dir / f"{prefix}_indices.u32", indices)

        # Cell IDs (one per sample)
        cell_ids = list(range(n_samples))
        write_u32(bin_dir / f"{prefix}_cell_ids.u32", cell_ids)

        # Extract all curves as scalars
        scalars_files: dict[str, str] = {}
        for curve in las.curves:
            if curve.mnemonic in (depth_mnemonic, "DEPT", "MD"):
                continue
            values = curve.data
            safe_name = curve.mnemonic.lower().replace(" ", "_")
            float_values = [float(v) if v == v else 0.0 for v in values]  # NaN check
            write_f32(bin_dir / f"{prefix}_scalars_{safe_name}.f32", float_values)
            scalars_files[safe_name] = f"{prefix}_scalars_{safe_name}.f32"

        # Well metadata
        well_info = las.well
        well_name = str(well_info.WELL.value) if hasattr(well_info, "WELL") else name

        return {
            "id": f"las_{name}",
            "name": f"LAS: {well_name} ({n_samples} samples)",
            "n_vertices": n_samples,
            "n_cells": n_samples,
            "n_indices": len(indices),
            "source": "las",
            "files": {
                "positions": f"{prefix}_positions.f32",
                "indices": f"{prefix}_indices.u32",
                "cell_ids": f"{prefix}_cell_ids.u32",
                "scalars": scalars_files,
            },
            "metadata": {
                "well_name": well_name,
                "n_curves": len(scalars_files),
                "depth_range": [float(depths[0]), float(depths[-1])],
            },
        }


register_reader(LasReader())
