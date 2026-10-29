# -*- coding: utf-8 -*-
"""Pipeline geometry and topology shared by JSON, CSV, Arrow and \
applications."""

from __future__ import annotations

import math
import struct
from pathlib import Path
from typing import Any, Sequence

from .geometry import (
    finite_number,
    geometry_metadata,
    optional_scalar,
    property_descriptor,
    resource_name,
)

PROPERTY_LABELS = {
    "pressure": "压力",
    "flow_rate": "流量",
    "temperature": "温度",
    "diameter": "管径",
    "velocity": "流速",
    "mass_flow": "质量流量",
    "density": "密度",
}


# pylint: disable-next=R0912,R0915
def _prepare_segments(
    segments: list[dict[str, Any]],
) -> tuple[list[dict], dict]:
    if not segments:
        raise ValueError("管网至少需要一条管段")
    normalized = []
    nodes: dict[str, dict] = {}
    explicit_node_ids = {
        str(segment[key])
        for segment in segments
        if isinstance(segment, dict)
        for key in ("start_node", "end_node")
        if segment.get(key) is not None and str(segment[key]).strip()
    }
    coordinates: dict[tuple[float, ...], str] = {}
    explicit_coordinates: dict[tuple[float, ...], set[str]] = {}
    edges = []
    edge_ids: set[str] = set()
    for index, segment in enumerate(segments):
        if not isinstance(segment, dict):
            raise ValueError(f"第 {index + 1} 条管段必须是对象")
        item = dict(segment)
        for key in ("x1", "y1", "x2", "y2"):
            item[key] = finite_number(
                segment.get(key),
                f"管段 {index + 1}.{key}",
            )
        for key in ("z1", "z2"):
            item[key] = finite_number(
                segment.get(key, 0),
                f"管段 {index + 1}.{key}",
            )
        start = (item["x1"], item["y1"], -item["z1"])
        end = (item["x2"], item["y2"], -item["z2"])
        if start == end:
            raise ValueError(f"第 {index + 1} 条管段长度为零")
        raw_id = segment.get("segment_id", segment.get("id"))
        edge_id = (
            str(raw_id)
            if raw_id is not None and str(raw_id).strip()
            else f"segment-{index}"
        )
        if edge_id in edge_ids:
            raise ValueError(f"管段标识重复: {edge_id}")
        edge_ids.add(edge_id)
        # Resolve explicit identities across the entire table before assigning
        # anonymous endpoints. Otherwise connectivity depends on row order.
        for endpoint, position in (("start_node", start), ("end_node", end)):
            explicit_id = segment.get(endpoint)
            if explicit_id is not None and str(explicit_id).strip():
                node_id = str(explicit_id)
                if (
                    node_id in nodes
                    and tuple(nodes[node_id]["position"]) != position
                ):
                    raise ValueError(f"节点 {node_id} 的坐标不一致")
                nodes[node_id] = {"id": node_id, "position": list(position)}
                explicit_coordinates.setdefault(position, set()).add(node_id)
        properties = segment.get("properties") or {}
        if not isinstance(properties, dict):
            raise ValueError(f"管段 {index + 1}.properties 必须是对象")
        if any(
            not isinstance(key, str) or not key.strip() for key in properties
        ):
            raise ValueError(f"管段 {index + 1} 的属性名必须为非空字符串")
        item["properties"] = properties
        normalized.append(item)
        edges.append({"id": edge_id, "cell_id": index})

    for index, segment in enumerate(normalized):
        node_ids = []
        for endpoint, position in (
            ("start_node", (segment["x1"], segment["y1"], -segment["z1"])),
            ("end_node", (segment["x2"], segment["y2"], -segment["z2"])),
        ):
            explicit_id = segment.get(endpoint)
            if explicit_id is not None and str(explicit_id).strip():
                node_id = str(explicit_id)
            else:
                candidates = explicit_coordinates.get(position, set())
                if len(candidates) > 1:
                    raise ValueError(
                        f"坐标 "
                        f"{position}"
                        f" 对应多个节点，请为管段 "
                        f"{index + 1}"
                        f" 显式指定 "
                        f"{endpoint}",
                    )
                node_id = (
                    next(iter(candidates))
                    if candidates
                    else coordinates.get(position, "")
                )
                if not node_id:
                    node_id = f"node-{len(nodes)}"
                    while node_id in nodes or node_id in explicit_node_ids:
                        node_id += "-auto"
            nodes[node_id] = {"id": node_id, "position": list(position)}
            coordinates.setdefault(position, node_id)
            node_ids.append(node_id)
        edges[index].update({"from": node_ids[0], "to": node_ids[1]})
    return normalized, {"nodes": list(nodes.values()), "edges": edges}


def _scalar_arrays(segments: list[dict]) -> dict[str, list[float]]:
    keys = list(PROPERTY_LABELS)
    for segment in segments:
        keys.extend(key for key in segment["properties"] if key not in keys)
    arrays = {}
    for key in keys:
        if not any(
            key in segment["properties"] or key in segment
            for segment in segments
        ):
            continue
        values = [
            optional_scalar(
                segment["properties"].get(key, segment.get(key)),
                f"管段 {index + 1}.{key}",
            )
            for index, segment in enumerate(segments)
        ]
        if key == "diameter" and any(
            math.isfinite(value) and value <= 0 for value in values
        ):
            raise ValueError("管径必须大于零")
        arrays[key] = values
    return arrays


def _write_dataset(
    segments: list[dict],
    topology: dict,
    name: str,
    bin_dir: Path,
    positions: list[float],
    indices: list[int],
    *,
    tube: bool = False,
    segments_per_circle: int = 8,
) -> dict[str, Any]:
    prefix = f"network_{'tube_' if tube else ''}{resource_name(name)}"
    scalars = _scalar_arrays(segments)
    bin_dir.mkdir(parents=True, exist_ok=True)
    files: dict[str, Any] = {"scalars": {}}
    arrays: tuple[tuple[str, str, Sequence[float | int], str], ...] = (
        ("positions", "f32", positions, "f"),
        ("indices", "u32", indices, "I"),
        ("cell_ids", "u32", list(range(len(segments))), "I"),
    )
    for role, extension, values, code in arrays:
        filename = f"{prefix}_{role}.{extension}"
        (bin_dir / filename).write_bytes(
            struct.pack(f"<{len(values)}{code}", *values),
        )
        files[role] = filename
    for index, (key, values) in enumerate(scalars.items()):
        # An ordinal prevents two sanitized property names overwriting each
        # other.
        filename = f"{prefix}_scalars_{index}_{resource_name(key)}.f32"
        (bin_dir / filename).write_bytes(
            struct.pack(f"<{len(values)}f", *values),
        )
        files["scalars"][key] = filename
    metadata = {
        **geometry_metadata("triangles" if tube else "lines", "cell"),
        "n_segments": len(segments),
        "vertices_per_cell": 2 * segments_per_circle if tube else 2,
        "indices_per_cell": 6 * segments_per_circle if tube else 2,
        "topology": topology,
    }
    if tube:
        metadata["segments_per_circle"] = segments_per_circle
    return {
        "id": prefix,
        "name": f"管网：{name}（{len(segments)} 条管段）",
        "n_vertices": len(positions) // 3,
        "n_cells": len(segments),
        "n_indices": len(indices),
        "source": "network-tube" if tube else "network",
        "files": files,
        "metadata": metadata,
        "properties": {
            key: property_descriptor(
                PROPERTY_LABELS.get(key, key),
                "cell",
                len(segments),
            )
            for key in scalars
        },
    }


def convert_network_to_lines(
    segments: list[dict[str, Any]],
    name: str,
    bin_dir: Path,
) -> dict[str, Any]:
    """Convert one source segment to one indexed line and one property row."""
    segments, topology = _prepare_segments(segments)
    positions = [
        value
        for segment in segments
        for value in (
            segment["x1"],
            segment["y1"],
            -segment["z1"],
            segment["x2"],
            segment["y2"],
            -segment["z2"],
        )
    ]
    return _write_dataset(
        segments,
        topology,
        name,
        bin_dir,
        positions,
        list(range(len(segments) * 2)),
    )


def convert_network_to_tubes(
    segments: list[dict[str, Any]],
    name: str,
    bin_dir: Path,
    segments_per_circle: int = 8,
) -> dict[str, Any]:
    """Generate tubes with the same frame, IDs and properties as line \
geometry."""
    if (
        not isinstance(segments_per_circle, int)
        or not 3 <= segments_per_circle <= 128
    ):
        raise ValueError("管段圆周细分必须为 3 到 128 的整数")
    segments, topology = _prepare_segments(segments)
    positions: list[float] = []
    indices: list[int] = []
    for index, segment in enumerate(segments):
        x1, y1, z1 = segment["x1"], segment["y1"], -segment["z1"]
        x2, y2, z2 = segment["x2"], segment["y2"], -segment["z2"]
        # The radius is a display fallback only; absent measured diameter
        # remains NaN.
        diameter_value = optional_scalar(
            segment["properties"].get("diameter", segment.get("diameter")),
            "管径",
        )
        diameter = diameter_value if math.isfinite(diameter_value) else 0.1
        if diameter <= 0:
            raise ValueError(f"第 {index + 1} 条管段的管径必须大于零")
        radius = diameter / 2
        dx, dy, dz = x2 - x1, y2 - y1, z2 - z1
        length = math.sqrt(dx * dx + dy * dy + dz * dz)
        dx, dy, dz = dx / length, dy / length, dz / length
        if abs(dx) > 0.5:
            px, py, pz = -dy, dx, 0.0
        else:
            px, py, pz = 0.0, -dz, dy
        plen = math.sqrt(px * px + py * py + pz * pz)
        px, py, pz = px / plen, py / plen, pz / plen
        qx, qy, qz = dy * pz - dz * py, dz * px - dx * pz, dx * py - dy * px
        base = len(positions) // 3
        for cx, cy, cz in ((x1, y1, z1), (x2, y2, z2)):
            for j in range(segments_per_circle):
                angle = 2 * math.pi * j / segments_per_circle
                cosine, sine = math.cos(angle), math.sin(angle)
                positions.extend(
                    [
                        finite_number(
                            cx + (px * cosine + qx * sine) * radius,
                            "管道 x",
                        ),
                        finite_number(
                            cy + (py * cosine + qy * sine) * radius,
                            "管道 y",
                        ),
                        finite_number(
                            cz + (pz * cosine + qz * sine) * radius,
                            "管道 z",
                        ),
                    ],
                )
        for j in range(segments_per_circle):
            j2 = (j + 1) % segments_per_circle
            a, b = base + j, base + j2
            c, d = (
                base + segments_per_circle + j,
                base + segments_per_circle + j2,
            )
            indices.extend([a, b, c, b, d, c])
    return _write_dataset(
        segments,
        topology,
        name,
        bin_dir,
        positions,
        indices,
        tube=True,
        segments_per_circle=segments_per_circle,
    )
