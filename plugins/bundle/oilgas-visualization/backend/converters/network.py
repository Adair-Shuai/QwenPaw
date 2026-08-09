# -*- coding: utf-8 -*-
"""Network geometry converter.

Converts tabular pipeline/node data into 3D line and tube geometry
for rendering pipeline networks with property-based coloring.
"""

from __future__ import annotations

import struct
from pathlib import Path
from typing import Any


def convert_network_to_lines(
    segments: list[dict[str, Any]],
    name: str,
    bin_dir: Path,
) -> dict[str, Any]:
    """Convert network segments to 3D line geometry.

    Each segment becomes a pair of vertices (start, end) connected
    by a degenerate line triangle.

    Args:
        segments: List of dicts with x1,y1,z1,x2,y2,z2 and properties
        name: Network name
        bin_dir: Output directory
    """
    n_segments = len(segments)
    prefix = f"network_{name}"

    positions: list[float] = []
    indices: list[int] = []
    cell_ids: list[int] = []

    for i, seg in enumerate(segments):
        x1 = float(seg.get("x1", 0))
        y1 = float(seg.get("y1", 0))
        z1 = float(seg.get("z1", 0))
        x2 = float(seg.get("x2", 0))
        y2 = float(seg.get("y2", 0))
        z2 = float(seg.get("z2", 0))

        positions.extend([x1, y1, -z1, x2, y2, -z2])
        base = i * 2
        indices.extend([base, base + 1, base])
        cell_ids.append(i)

    # Extract property scalars
    scalar_keys = ["pressure", "flow_rate", "temperature", "diameter"]
    scalars_files: dict[str, str] = {}

    for key in scalar_keys:
        values: list[float] = []
        has_data = False
        for seg in segments:
            v = seg.get(key)
            if v is not None:
                values.append(float(v))
                has_data = True
            else:
                values.append(0.0)

        if has_data:
            fname = f"{prefix}_scalars_{key}.f32"
            (bin_dir / fname).write_bytes(
                struct.pack(f"<{len(values)}f", *values)
            )
            scalars_files[key] = fname

    # Write geometry files
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
        "name": f"Network: {name} ({n_segments} segments)",
        "n_vertices": n_segments * 2,
        "n_cells": n_segments,
        "n_indices": len(indices),
        "source": "network",
        "files": {
            "positions": f"{prefix}_positions.f32",
            "indices": f"{prefix}_indices.u32",
            "cell_ids": f"{prefix}_cell_ids.u32",
            "scalars": scalars_files,
        },
        "metadata": {"n_segments": n_segments},
    }


def convert_network_to_tubes(
    segments: list[dict[str, Any]],
    name: str,
    bin_dir: Path,
    segments_per_circle: int = 8,
) -> dict[str, Any]:
    """Convert network segments to 3D tube geometry.

    Each segment becomes a tube with the specified diameter,
    rendered as a triangular mesh with proper normals.

    This produces more realistic 3D pipe geometry at the cost
    of higher triangle count (n_segments * segments_per_circle * 6).
    """
    n_segments = len(segments)
    prefix = f"network_tube_{name}"

    positions: list[float] = []
    indices: list[int] = []
    cell_ids: list[int] = []

    for seg_i, seg in enumerate(segments):
        x1 = float(seg.get("x1", 0))
        y1 = float(seg.get("y1", 0))
        z1 = float(seg.get("z1", 0))
        x2 = float(seg.get("x2", 0))
        y2 = float(seg.get("y2", 0))
        z2 = float(seg.get("z2", 0))
        diameter = float(seg.get("diameter", 0.1))
        radius = diameter / 2

        # Direction vector
        dx = x2 - x1
        dy = y2 - y1
        dz = z2 - z1
        length = (dx * dx + dy * dy + dz * dz) ** 0.5
        if length < 1e-10:
            continue
        dx, dy, dz = dx / length, dy / length, dz / length

        # Perpendicular vectors
        if abs(dx) > 0.5:
            px, py, pz = -dy, dx, 0.0
        else:
            px, py, pz = 0.0, -dz, dy
        plen = (px * px + py * py + pz * pz) ** 0.5
        px, py, pz = px / plen, py / plen, pz / plen

        # Second perpendicular
        qx = dy * pz - dz * py
        qy = dz * px - dx * pz
        qz = dx * py - dy * px

        base = len(positions) // 3

        # Create circle vertices at start and end
        import math
        for end_pt in range(2):
            cx = x1 + end_pt * dx * length
            cy = y1 + end_pt * dy * length
            cz = z1 + end_pt * dz * length
            for j in range(segments_per_circle):
                angle = 2 * math.pi * j / segments_per_circle
                cos_a = math.cos(angle)
                sin_a = math.sin(angle)
                px_off = px * cos_a + qx * sin_a
                py_off = py * cos_a + qy * sin_a
                pz_off = pz * cos_a + qz * sin_a
                positions.extend([
                    cx + px_off * radius,
                    cy + py_off * radius,
                    cz + pz_off * radius,
                ])

        # Side faces
        for j in range(segments_per_circle):
            j2 = (j + 1) % segments_per_circle
            a = base + j
            b = base + j2
            c = base + segments_per_circle + j
            d = base + segments_per_circle + j2
            indices.extend([a, b, c, b, d, c])
            cell_ids.append(seg_i)

    # Write files
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
        "name": f"Network Tubes: {name} ({n_segments} segments)",
        "n_vertices": len(positions) // 3,
        "n_cells": len(cell_ids),
        "n_indices": len(indices),
        "source": "network-tube",
        "files": {
            "positions": f"{prefix}_positions.f32",
            "indices": f"{prefix}_indices.u32",
            "cell_ids": f"{prefix}_cell_ids.u32",
            "scalars": {},
        },
        "metadata": {"n_segments": n_segments, "segments_per_circle": segments_per_circle},
    }
