"""Find reviewable opposing pipe end faces in the assembled source geometry."""

import itertools
import json
import math
import re
import struct
from array import array

from .eztopology import add_relations

HEADER = struct.Struct("<4sIII")
SEGMENT = struct.Struct("<II7f")
UNIT_METRES = {"m": 1, "米": 1, "mm": 0.001, "毫米": 0.001, "cm": 0.01}
PIPE_TYPES = ("管线", "管道", "管段", "汇管")
PROCESS_PARTS = (
    "泵",
    "压缩机",
    "容器",
    "塔类",
    "过滤器",
    "分离器",
    "储罐",
    "除液器",
    "干燥器",
    "换热器",
    "加热器",
    "空冷器",
    "采气树",
    "锅炉",
    "球筒",
    "金属软管",
    "孔板",
    "盲板",
    "阻火器",
    "视镜",
    "流量计",
    "压力表",
    "变送器",
)
OPPOSING = math.cos(math.radians(3))


def contact_evidence(dst, scene, unit):
    """Only complete, mutually unambiguous, opposing end faces create a candidate.

    Distances are measured in the assembled frame. Intersections of projected
    lines, nearby equipment centres and subassembly membership create no edges.
    """
    metres = UNIT_METRES.get(str(unit).strip().lower())
    summary = {"pairs": 0, "distanceMm": 1, "maxAxisAngleDeg": 3}
    if not metres or not scene.get("segments"):
        return summary
    eligible = {}
    for tree, node, tag, kind, props in dst.execute(
        "select tree,node,tag,kind,props from asset"
    ):
        if kind.endswith(PIPE_TYPES):
            # Source D and DN pipe sizes are in millimetres (outside and nominal
            # diameter respectively). Exclude bolts and oversize flange shells.
            diameter = re.fullmatch(
                r"(?:DN|D|[Φφ])\s*([0-9]+(?:\.[0-9]+)?)\s*(?:mm)?",
                str(dict(json.loads(props)).get("管径", "")).strip(),
                re.I,
            )
            if diameter and float(diameter[1]) > 0:
                eligible[(tree, node)] = (tag, float(diameter[1]))
        elif "阀" in kind or kind.endswith(PROCESS_PARTS):
            eligible[(tree, node)] = (tag, 0)
    if not eligible:
        return summary
    row = dst.execute(
        "select substr(payload,1,16),length(payload) from ez_scene limit 1"
    ).fetchone()
    if not row:
        return summary
    magic, count, _, _ = HEADER.unpack(row[0])
    if magic != b"EZS1" or count * SEGMENT.size > row[1] - HEADER.size:
        raise ValueError("全站端面目录与场景数据不一致")
    segments = dst.execute(
        "select substr(payload,17,?) from ez_scene limit 1", (count * SEGMENT.size,)
    ).fetchone()[0]

    tolerance = 0.001 / metres
    spacing = tolerance * 4
    cells = {}
    pipe_faces = array("I")
    for idx, (tree, node, x, y, z, a, b, c, radius) in enumerate(
        SEGMENT.iter_unpack(segments)
    ):
        item = eligible.get((tree, node))
        if item is None or radius <= 0:
            continue
        nominal = item[1]
        if nominal and not 0.8 * nominal <= radius * 2000 * metres <= 1.32 * nominal:
            continue
        for side, point in enumerate(((x, y, z), (a, b, c))):
            face = idx * 2 + side
            cell = (tree, *(math.floor(v / spacing) for v in point))
            cells.setdefault(cell, []).append(face)
            if nominal:
                pipe_faces.append(face)

    def pose(face):
        tree, node, *data = SEGMENT.unpack_from(segments, (face // 2) * SEGMENT.size)
        p, q = data[:3], data[3:6]
        if face & 1:
            p, q = q, p
        length = math.dist(p, q)
        normal = tuple((v - w) / length for v, w in zip(p, q)) if length else (0, 0, 0)
        return (tree, node), p, normal, data[6]

    def opposite(face):
        owner, p, normal, radius = pose(face)
        bins = [
            range(
                math.floor((v - tolerance) / spacing),
                math.floor((v + tolerance) / spacing) + 1,
            )
            for v in p
        ]
        target, best = None, None
        for cell in itertools.product(*bins):
            bucket = cells.get((owner[0], *cell), ())
            # Repeated/copied geometry at a crowded origin is not a unique port.
            if len(bucket) > 64:
                return None
            for other in bucket:
                if other == face:
                    continue
                key, q, direction, r = pose(other)
                if abs(radius - r) > max(tolerance / 2, 0.025 * min(radius, r)):
                    continue
                gap = math.dist(p, q)
                if gap > tolerance:
                    continue
                cosine = -sum(v * w for v, w in zip(normal, direction))
                if cosine < OPPOSING:
                    continue
                if key == owner or (target is not None and target != key):
                    return None
                target = key
                if best is None or gap < best[0]:
                    best = gap, other, math.degrees(math.acos(min(1, cosine)))
        return best

    pairs = {}
    for face in pipe_faces:
        match = opposite(face)
        if match is None:
            continue
        gap, other, angle = match
        owner, _, _, radius = pose(face)
        target, _, _, other_radius = pose(other)
        pair = tuple(sorted((owner, target)))
        if pair in pairs and pairs[pair][0] <= gap:
            continue
        back = opposite(other)
        if back is not None and pose(back[1])[0] == owner:
            pairs[pair] = (gap, owner, target, angle, radius, other_radius)
    rows = []
    for gap, owner, target, angle, r, other_r in pairs.values():
        evidence = (
            f"同一模型树内两圆柱端面中心距 {gap*metres*1000:.2f} mm，"
            f"相向轴线偏角 {angle:.2f}°，半径 "
            f"{r*metres*1000:.1f} / {other_r*metres*1000:.1f} mm。"
            "两端均只对应另一个工程对象，需结合工艺图核对。"
        )
        rows.append(
            (
                "contact",
                *owner,
                *target,
                "端面吻合",
                eligible[target][0],
                "装配模型圆柱端面",
                evidence,
                1,
            )
        )
    add_relations(dst, rows)
    summary["pairs"] = len(rows)
    return summary
