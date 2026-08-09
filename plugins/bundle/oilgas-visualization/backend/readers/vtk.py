# -*- coding: utf-8 -*-
"""VTK-family reader backed by meshio.

Supports the common unstructured formats used in engineering workspaces:
VTK, VTU, PVTU, XDMF and VTI when meshio can read them. Geometry is
normalized to the plugin's binary positions/indices/cell_ids contract.
"""

from __future__ import annotations

import struct
from pathlib import Path
from typing import Any

from .base import BaseReader, register_reader, write_f32, write_u32
from ..security import sanitize_identifier


_FACES = {
    "tetra": ((0, 1, 2), (0, 3, 1), (1, 3, 2), (2, 3, 0)),
    "hexahedron": (
        (0, 1, 2), (0, 2, 3), (4, 6, 5), (4, 7, 6),
        (0, 4, 5), (0, 5, 1), (1, 5, 6), (1, 6, 2),
        (2, 6, 7), (2, 7, 3), (3, 7, 4), (3, 4, 0),
    ),
}


class VtkReader(BaseReader):
    @property
    def format_id(self) -> str:
        return "vtk"

    @property
    def extensions(self) -> tuple[str, ...]:
        return (".vtk", ".vtu", ".pvtu", ".vti", ".xdmf")

    @property
    def requires(self) -> tuple[str, ...]:
        return ("meshio",)

    def read(
        self,
        file_path: str,
        name: str,
        bin_dir: Path,
        options: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        import meshio

        mesh = meshio.read(file_path)
        points = mesh.points
        if points.shape[1] < 3:
            raise ValueError("VTK mesh must contain at least 3 coordinate columns")
        positions = [float(value) for point in points for value in point[:3]]
        indices: list[int] = []
        primitive_cells: list[int] = []
        primitive_types: list[str] = []
        scalar_values: dict[str, list[float]] = {}
        scalar_source = dict(getattr(mesh, "point_data", {}) or {})
        cell_data = getattr(mesh, "cell_data", {}) or {}
        prefix = f"vtk_{sanitize_identifier(name, 'mesh')}"

        for block_index, block in enumerate(mesh.cells):
            cell_type = str(block.type)
            rows = block.data
            faces = _FACES.get(cell_type)
            block_primitive_cells: list[int] = []
            for row_index, row in enumerate(rows):
                if cell_type == "line":
                    indices.extend([int(row[0]), int(row[1])])
                    primitive_types.append(cell_type)
                    primitive_cells.append(row_index)
                    block_primitive_cells.append(row_index)
                elif cell_type in {"triangle", "quad"}:
                    if cell_type == "triangle":
                        indices.extend([int(row[0]), int(row[1]), int(row[2])])
                    else:
                        indices.extend([int(row[0]), int(row[1]), int(row[2]), int(row[0]), int(row[2]), int(row[3])])
                    primitive_types.extend([cell_type] * (1 if cell_type == "triangle" else 2))
                    primitive_cells.extend([row_index] * (1 if cell_type == "triangle" else 2))
                    block_primitive_cells.extend([row_index] * (1 if cell_type == "triangle" else 2))
                elif faces:
                    for face in faces:
                        if max(face) >= len(row):
                            continue
                        indices.extend([int(row[face[0]]), int(row[face[1]]), int(row[face[2]])])
                        primitive_types.append(cell_type)
                        primitive_cells.append(row_index)
                        block_primitive_cells.append(row_index)

            # Cell data arrays are keyed by name and contain one array per
            # cell block. Replicate each source value across generated faces.
            for prop_name, arrays in cell_data.items():
                if block_index >= len(arrays):
                    continue
                values = arrays[block_index]
                output = scalar_values.setdefault(sanitize_identifier(str(prop_name), "property"), [])
                for source_index in block_primitive_cells:
                    output.append(float(values[source_index]) if source_index < len(values) else 0.0)

        if not indices:
            raise ValueError("VTK file contains no supported line or surface cells")
        cell_ids = list(range(len(primitive_types)))
        write_f32(bin_dir / f"{prefix}_positions.f32", positions)
        write_u32(bin_dir / f"{prefix}_indices.u32", indices)
        write_u32(bin_dir / f"{prefix}_cell_ids.u32", cell_ids)
        scalar_files: dict[str, str] = {}
        for prop_name, values in scalar_values.items():
            filename = f"{prefix}_scalars_{prop_name}.f32"
            write_f32(bin_dir / filename, values)
            scalar_files[prop_name] = filename

        return {
            "id": prefix,
            "name": f"VTK: {name} ({len(cell_ids):,} primitives)",
            "n_vertices": len(points),
            "n_cells": len(cell_ids),
            "n_indices": len(indices),
            "source": "vtk",
            "files": {
                "positions": f"{prefix}_positions.f32",
                "indices": f"{prefix}_indices.u32",
                "cell_ids": f"{prefix}_cell_ids.u32",
                "scalars": scalar_files,
            },
            "metadata": {"format": Path(file_path).suffix.lower(), "cell_types": sorted(set(primitive_types))},
        }


register_reader(VtkReader())
