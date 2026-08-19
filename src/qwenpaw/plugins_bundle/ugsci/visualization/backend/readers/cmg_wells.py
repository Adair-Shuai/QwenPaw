# -*- coding: utf-8 -*-
"""Extract well trajectories and completions from a CMG DAT deck.

CMG well geometry is not stored in CORNERS.  Decks typically give:

- ``WELL 'NAME'`` plus ``PERF`` I/J/K completions
- optional ``TRAJECTORY 'NAME'`` tables with MD/TVD/X/Y

Completions are converted to XYZ using the same corner-point lattice as the
grid reader so wells land on the reservoir they belong to.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any, Callable

from ..converters.wellbore import convert_well_trajectory
from ..security import sanitize_identifier

_WELL_RE = re.compile(r"^\s*\*?WELL\s+['\"]([^'\"]+)['\"]", re.I)
_TRAJ_RE = re.compile(r"^\s*\*?TRAJECTORY\s+['\"]([^'\"]+)['\"]", re.I)
_PERF_RE = re.compile(
    r"^\s*\*?PERF(?:ORATION)?(?:\s+\S+)?\s+['\"]([^'\"]+)['\"]",
    re.I,
)
_KEYWORD_RE = re.compile(r"^\s*\*?[A-Z][A-Z0-9_-]*\b", re.I)


def _is_keyword_line(line: str) -> bool:
    stripped = line.strip()
    if not stripped or stripped.startswith("**"):
        return False
    if _WELL_RE.match(stripped) or _TRAJ_RE.match(stripped) or _PERF_RE.match(stripped):
        return True
    first = stripped.split()[0].lstrip("*")
    if first[:1].isdigit() or "*" in first[:1]:
        return False
    return bool(_KEYWORD_RE.match(stripped))


def _tokens_to_floats(line: str) -> list[float]:
    values: list[float] = []
    for token in line.split():
        if token.startswith("**"):
            break
        try:
            values.append(float(token.replace("D", "E").replace("d", "e")))
        except ValueError:
            continue
    return values


def parse_cmg_wells(path: Path) -> dict[str, dict[str, Any]]:
    """Return well_name -> {trajectory: [[md,tvd,x,y], ...], completions: [[i,j,k], ...]}."""
    wells: dict[str, dict[str, Any]] = {}

    def bucket(name: str) -> dict[str, Any]:
        item = wells.setdefault(name, {"trajectory": [], "completions": []})
        return item

    current_perf: str | None = None
    current_traj: str | None = None

    with path.open("r", encoding="utf-8", errors="replace", newline=None) as handle:
        for raw in handle:
            line = raw.strip()
            if not line or line.startswith("**"):
                continue

            well_match = _WELL_RE.match(line)
            if well_match:
                bucket(well_match.group(1).strip())
                current_perf = None
                current_traj = None
                continue

            traj_match = _TRAJ_RE.match(line)
            if traj_match:
                current_traj = traj_match.group(1).strip()
                bucket(current_traj)
                current_perf = None
                continue

            perf_match = _PERF_RE.match(line)
            if perf_match:
                current_perf = perf_match.group(1).strip()
                bucket(current_perf)
                current_traj = None
                continue

            if current_traj:
                if _is_keyword_line(line) and not _TRAJ_RE.match(line):
                    current_traj = None
                else:
                    values = _tokens_to_floats(line)
                    if len(values) >= 4:
                        md, tvd, x, y = values[:4]
                        bucket(current_traj)["trajectory"].append([md, tvd, x, y])
                    elif len(values) == 3:
                        x, y, tvd = values
                        stations = bucket(current_traj)["trajectory"]
                        md = stations[-1][0] + abs(tvd - stations[-1][1]) if stations else 0.0
                        stations.append([md, tvd, x, y])
                    continue

            if current_perf:
                if _is_keyword_line(line) and not _PERF_RE.match(line):
                    current_perf = None
                    continue
                values = _tokens_to_floats(line)
                if len(values) >= 3:
                    i_index, j_index, k_index = (int(values[0]), int(values[1]), int(values[2]))
                    if i_index > 0 and j_index > 0 and k_index > 0:
                        bucket(current_perf)["completions"].append([i_index, j_index, k_index])

    return wells


def _completion_xyz(
    ijk: list[int],
    ncol: int,
    nrow: int,
    nlay: int,
    corner_points: Callable[[int], tuple[tuple[float, float, float], ...]],
) -> tuple[float, float, float] | None:
    i_index, j_index, k_index = (value - 1 for value in ijk)
    if not (0 <= i_index < ncol and 0 <= j_index < nrow and 0 <= k_index < nlay):
        return None
    cell_id = i_index + ncol * (j_index + nrow * k_index)
    points = corner_points(cell_id)
    xs = [point[0] for point in points]
    ys = [point[1] for point in points]
    zs = [point[2] for point in points]
    return (sum(xs) / 8.0, sum(ys) / 8.0, sum(zs) / 8.0)


def convert_cmg_wells(
    wells: dict[str, dict[str, Any]],
    name_prefix: str,
    bin_dir: Path,
    *,
    ncol: int,
    nrow: int,
    nlay: int,
    corner_points: Callable[[int], tuple[tuple[float, float, float], ...]] | None = None,
) -> list[dict[str, Any]]:
    """Write wellbore datasets for wells that have a trajectory or IJK completions."""
    related: list[dict[str, Any]] = []
    for well_name, payload in wells.items():
        stations = list(payload.get("trajectory") or [])
        if not stations and corner_points is not None:
            for ijk in payload.get("completions") or []:
                xyz = _completion_xyz(ijk, ncol, nrow, nlay, corner_points)
                if xyz is None:
                    continue
                x, y, z = xyz
                tvd = abs(z)
                md = stations[-1][0] + abs(tvd - stations[-1][1]) if stations else 0.0
                stations.append([md, tvd, x, y])
        if len(stations) == 1:
            md, tvd, x, y = stations[0]
            stations.append([md + 1.0, tvd + 1.0, x, y])
        if len(stations) < 2:
            continue
        safe = sanitize_identifier(f"{name_prefix}_{well_name}", "well")
        dataset = convert_well_trajectory(
            [row[0] for row in stations],
            [row[1] for row in stations],
            [row[2] for row in stations],
            [row[3] for row in stations],
            safe,
            bin_dir,
        )
        dataset["metadata"] = {
            **(dataset.get("metadata") or {}),
            "well_name": well_name,
            "source_format": "cmg",
            "n_completions": len(payload.get("completions") or []),
            "from_trajectory": bool(payload.get("trajectory")),
        }
        related.append(dataset)
    return related
