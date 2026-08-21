# -*- coding: utf-8 -*-
"""Reader for CMG GEM ASCII ``.dat`` grid decks.

CMG's corner-point grid syntax is not Eclipse GRDECL.  In particular,
``CORNERS`` contains three coordinate blocks over a refined
``(2*NI, 2*NJ, 2*NK)`` corner lattice and values may use the ``count*value``
run-length notation.  This reader intentionally implements
the portable, static part of a GEM deck (geometry, NULL/NETGROSS/POR/PERMI
and the derived PERMJ/PERMK arrays) and leaves the simulator schedule and
PVT sections untouched.

The output follows the same binary manifest contract as the Eclipse reader,
so the viewer does not need a CMG-specific rendering path.
"""

from __future__ import annotations

import re
import time
from array import array
from datetime import date
from pathlib import Path
from typing import Any, Iterable

from .base import BaseReader, register_reader


_GRID_CORNER_RE = re.compile(r"^\s*\*?GRID\s+CORNER\s+(\d+)\s+(\d+)\s+(\d+)\b", re.I)
_GRID_CART_RE = re.compile(r"^\s*\*?GRID\s+(?:CART|CARTESIAN)\s+(\d+)\s+(\d+)\s+(\d+)\b", re.I)
_REPEAT_RE = re.compile(r"^(\d+)\*(.+)$")
_RESULTS_RE = re.compile(r"^\s*\*?RESULTS\s+SIMULATOR\s+(\S+)(?:\s+(.*))?$", re.I)
_MODEL_RE = re.compile(r"^\s*\*?MODEL\s+(\S+)", re.I)
_WELL_RE = re.compile(r"^\s*\*?WELL\s+['\"]([^'\"]+)['\"]", re.I)
_DATE_RE = re.compile(r"^\s*\*?DATE\s+(\d{4})\s+(\d{1,2})\s+([0-9.]+)", re.I)
_OUTSRF_GRID_RE = re.compile(r"^\s*\*?OUTSRF\s+GRID\s+(.+)$", re.I)
_ORIGIN_RE = re.compile(
    r"^\s*\*?ORIGIN(?:\s+X)?\s+([^\s]+)\s+([^\s]+)(?:\s+([^\s]+))?",
    re.I,
)
_EQUALSI_RE = re.compile(r"^EQUALSI(?:\s*\*\s*([+-]?\d+(?:\.\d+)?(?:[EeDd][+-]?\d+)?))?$", re.I)


def _number(token: str) -> float:
    """Parse a CMG numeric token, including Fortran ``D`` exponents."""
    return float(token.replace("D", "E").replace("d", "e"))


def _values_from_line(line: str) -> Iterable[float]:
    """Yield numeric values from one CMG data line."""
    text = line.strip()
    if not text or text.startswith("**"):
        return
    for token in text.split():
        match = _REPEAT_RE.match(token)
        if match:
            count = int(match.group(1))
            if count < 0:
                raise ValueError(f"Invalid negative repeat count: {token}")
            value = _number(match.group(2))
            for _ in range(count):
                yield value
        else:
            # A data section can contain only numeric tokens.  Raising here
            # catches a truncated section instead of silently shifting arrays.
            yield _number(token)


def _first_keyword(line: str) -> str:
    words = line.strip().split()
    if not words:
        return ""
    return words[0].lstrip("*").upper()


def _find_grid_spec(path: Path) -> tuple[str, int, int, int]:
    with path.open("r", encoding="utf-8", errors="replace", newline=None) as handle:
        for line in handle:
            match = _GRID_CORNER_RE.match(line)
            if match:
                return ("corner", int(match.group(1)), int(match.group(2)), int(match.group(3)))
            match = _GRID_CART_RE.match(line)
            if match:
                return ("cartesian", int(match.group(1)), int(match.group(2)), int(match.group(3)))
    raise ValueError("CMG deck does not contain GRID CORNER/CART I J K")


def _read_keyword_values(path: Path, keyword: str, expected: int) -> array:
    """Read exactly ``expected`` values following a CMG keyword.

    The scan stops as soon as the expected count is reached.  This is
    important for GEM decks where the next section can contain control words
    such as ``*BLOCKGROUP`` or another keyword rather than a slash terminator.
    """
    result = array("d")
    found = False
    target = keyword.upper()
    with path.open("r", encoding="utf-8", errors="replace", newline=None) as handle:
        for line in handle:
            stripped = line.strip()
            words = stripped.upper().split()
            if not found:
                if _first_keyword(stripped) == target:
                    found = True
                continue
            if stripped.startswith("**") or not stripped:
                continue
            if stripped.startswith("*") and not _REPEAT_RE.match(stripped.split()[0]):
                # A control line before the expected number means the input is
                # malformed; do not return a misleading partial array.
                raise ValueError(
                    f"CMG {keyword} section ended after {len(result):,} of {expected:,} values"
                )
            for value in _values_from_line(stripped):
                result.append(value)
                if len(result) == expected:
                    return result
                if len(result) > expected:
                    raise ValueError(
                        f"CMG {keyword} section has more than {expected:,} values"
                    )
    if not found:
        raise ValueError(f"CMG deck is missing {keyword} section")
    raise ValueError(
        f"CMG {keyword} section ended after {len(result):,} of {expected:,} values"
    )


def _try_keyword_values(path: Path, keyword: str, expected: int) -> array | None:
    try:
        return _read_keyword_values(path, keyword, expected)
    except ValueError:
        return None


def _apply_equalsi(source: array, expression: str) -> array:
    match = _EQUALSI_RE.match(expression.strip())
    if match is None:
        raise ValueError(f"Unsupported EQUALSI expression: {expression}")
    factor = 1.0
    if match.group(1):
        factor = _number(match.group(1))
    return array("d", (value * factor for value in source))


def _read_grid_property(
    path: Path,
    keyword: str,
    expected: int,
    *,
    equals_source: array | None = None,
) -> array | None:
    """Read a numeric grid array or a PERMJ/PERMK EQUALSI expression."""
    target = keyword.upper()
    with path.open("r", encoding="utf-8", errors="replace", newline=None) as handle:
        for line in handle:
            stripped = line.strip()
            if not stripped or stripped.startswith("**"):
                continue
            if _first_keyword(stripped) != target:
                continue
            words = stripped.split()
            rest = words[1:]
            if rest and rest[0].upper() == "ALL":
                rest = rest[1:]
            joined = " ".join(rest)
            if joined and _EQUALSI_RE.match(joined.replace(" ", "")):
                if equals_source is None:
                    return None
                return _apply_equalsi(equals_source, joined.replace(" ", "") if " " not in joined else joined)
            if joined.upper().startswith("EQUALSI"):
                if equals_source is None:
                    return None
                return _apply_equalsi(equals_source, joined)
            result = array("d")
            if rest:
                try:
                    for value in _values_from_line(" ".join(rest)):
                        result.append(value)
                        if len(result) == expected:
                            return result
                except ValueError:
                    pass
            for follow in handle:
                follow_stripped = follow.strip()
                if not follow_stripped or follow_stripped.startswith("**"):
                    continue
                if follow_stripped.upper().startswith("EQUALSI"):
                    if equals_source is None:
                        return None
                    return _apply_equalsi(equals_source, follow_stripped)
                follow_key = _first_keyword(follow_stripped)
                if follow_key.isalpha() and follow_key != target and not _REPEAT_RE.match(follow_stripped.split()[0]):
                    break
                try:
                    for value in _values_from_line(follow_stripped):
                        result.append(value)
                        if len(result) == expected:
                            return result
                except ValueError:
                    continue
            return result if len(result) == expected else None
    return None


def _find_sibling(source_path: Path, suffixes: set[str]) -> Path | None:
    if not source_path.parent.exists():
        return None
    wanted = {item.lower() for item in suffixes}
    for candidate in source_path.parent.iterdir():
        if (
            candidate.is_file()
            and candidate.stem.lower() == source_path.stem.lower()
            and candidate.suffix.lower() in wanted
        ):
            return candidate
    return None


def _read_origin(path: Path) -> tuple[float, float, float]:
    with path.open("r", encoding="utf-8", errors="replace", newline=None) as handle:
        for line in handle:
            match = _ORIGIN_RE.match(line)
            if not match:
                continue
            x = _number(match.group(1))
            y = _number(match.group(2))
            z = _number(match.group(3)) if match.group(3) else 0.0
            return (x, y, z)
    return (0.0, 0.0, 0.0)


def _accumulate(sizes: array, origin: float) -> list[float]:
    nodes = [origin]
    for size in sizes:
        nodes.append(nodes[-1] + float(size))
    return nodes


def _cartesian_cell_points(
    i: int,
    j: int,
    k: int,
    xs: list[float],
    ys: list[float],
    zs: list[float],
) -> tuple[tuple[float, float, float], ...]:
    x0, x1 = xs[i], xs[i + 1]
    y0, y1 = ys[j], ys[j + 1]
    z0, z1 = zs[k], zs[k + 1]
    lookup = {
        (0, 0, 0): (x0, y0, z0),
        (1, 0, 0): (x1, y0, z0),
        (1, 1, 0): (x1, y1, z0),
        (0, 1, 0): (x0, y1, z0),
        (0, 0, 1): (x0, y0, z1),
        (1, 0, 1): (x1, y0, z1),
        (1, 1, 1): (x1, y1, z1),
        (0, 1, 1): (x0, y1, z1),
    }
    return tuple(lookup[delta] for delta in _CELL_CORNERS)


def _build_hex_indices(n_cells: int) -> array:
    from ..converters.hex import build_hex_centroid_fan_indices
    return build_hex_centroid_fan_indices(n_cells)


def _write_array(path: Path, typecode: str, values: array) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if values.typecode != typecode:
        values = array(typecode, values)
    with path.open("wb") as handle:
        values.tofile(handle)


_CELL_CORNERS = (
    (0, 0, 0),
    (1, 0, 0),
    (1, 1, 0),
    (0, 1, 0),
    (0, 0, 1),
    (1, 0, 1),
    (1, 1, 1),
    (0, 1, 1),
)


def _corner_lattice_index(
    cell_id: int,
    ncol: int,
    nrow: int,
    delta: tuple[int, int, int],
) -> int:
    """Return the I-fast index into one CMG ``CORNERS`` coordinate block."""
    i = cell_id % ncol
    j = (cell_id // ncol) % nrow
    k = cell_id // (ncol * nrow)
    di, dj, dk = delta
    corner_i = 2 * i + di
    corner_j = 2 * j + dj
    corner_k = 2 * k + dk
    return corner_i + 2 * ncol * (corner_j + 2 * nrow * corner_k)


def _cell_corner_points(
    corner_values: array,
    cell_id: int,
    ncol: int,
    nrow: int,
    nlay: int,
) -> tuple[tuple[float, float, float], ...]:
    """Decode the eight vertices of one CMG corner-point cell.

    CMG serializes the X, Y and Z coordinates as three blocks, each covering
    the complete refined corner lattice.  Treating those blocks as eight
    per-corner cell arrays connects unrelated grid locations and can collapse
    cells into large diagonal sheets.
    """
    n_total = ncol * nrow * nlay
    points = []
    for delta in _CELL_CORNERS:
        lattice_index = _corner_lattice_index(cell_id, ncol, nrow, delta)
        points.append(
            (
                corner_values[lattice_index],
                corner_values[8 * n_total + lattice_index],
                corner_values[16 * n_total + lattice_index],
            ),
        )
    return tuple(points)


def _scan_deck_metadata(path: Path) -> dict[str, Any]:
    """Collect schedule/well metadata without pretending deck dates are results."""
    simulator = "GEM"
    simulator_version = ""
    model = ""
    wells: list[str] = []
    seen_wells: set[str] = set()
    dates: list[date] = []
    dynamic_properties: list[str] = []

    with path.open("r", encoding="utf-8", errors="replace", newline=None) as handle:
        for line in handle:
            if match := _RESULTS_RE.match(line):
                simulator = match.group(1).upper()
                simulator_version = (match.group(2) or "").strip()
            elif match := _MODEL_RE.match(line):
                model = match.group(1).upper()
            elif match := _WELL_RE.match(line):
                well = match.group(1).strip()
                if well and well not in seen_wells:
                    seen_wells.add(well)
                    wells.append(well)
            elif match := _DATE_RE.match(line):
                try:
                    dates.append(date(int(match.group(1)), int(match.group(2)), max(1, int(float(match.group(3))))))
                except ValueError:
                    pass
            elif match := _OUTSRF_GRID_RE.match(line):
                for keyword in match.group(1).split():
                    normalized = keyword.strip().lower()
                    if normalized and normalized not in dynamic_properties:
                        dynamic_properties.append(normalized)

    metadata: dict[str, Any] = {
        "simulator": simulator,
        "simulator_version": simulator_version,
        "model": model,
        "n_wells": len(wells),
        "wells": wells,
        "n_schedule_dates": len(dates),
        "requested_dynamic_properties": dynamic_properties,
        # A DAT deck defines requested outputs and schedule dates; actual
        # values live in SR3/IRF result files and are intentionally not faked.
        "has_dynamic_results": False,
    }
    if dates:
        metadata["schedule_range"] = [min(dates).isoformat(), max(dates).isoformat()]
    return metadata


class CmgReader(BaseReader):
    """CMG IMEX/GEM/STARS ASCII grid reader."""

    @property
    def format_id(self) -> str:
        return "cmg"

    @property
    def extensions(self) -> tuple[str, ...]:
        return (".dat",)

    def read(
        self,
        file_path: str,
        name: str,
        bin_dir: Path,
        options: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        options = options or {}
        source_path = Path(file_path)
        if not source_path.exists():
            raise FileNotFoundError(f"CMG deck not found: {source_path}")

        started = time.time()
        deck_metadata = _scan_deck_metadata(source_path)
        grid_type, ncol, nrow, nlay = _find_grid_spec(source_path)
        n_total = ncol * nrow * nlay

        null_values = _try_keyword_values(source_path, "NULL", n_total)
        if null_values is None:
            active_mask = [True] * n_total
        else:
            active_mask = [value != 0.0 for value in null_values]
        active_ids = [index for index, active in enumerate(active_mask) if active]

        corner_lookup = None
        if grid_type == "corner":
            corner_values = _read_keyword_values(source_path, "CORNERS", 24 * n_total)

            def corner_lookup(cell_id: int) -> tuple[tuple[float, float, float], ...]:
                return _cell_corner_points(corner_values, cell_id, ncol, nrow, nlay)
        else:
            di = _try_keyword_values(source_path, "DI", ncol) or _try_keyword_values(source_path, "DX", ncol)
            dj = _try_keyword_values(source_path, "DJ", nrow) or _try_keyword_values(source_path, "DY", nrow)
            dk = _try_keyword_values(source_path, "DK", nlay) or _try_keyword_values(source_path, "DZ", nlay)
            if di is None or dj is None or dk is None:
                raise ValueError("CMG cartesian grid is missing DI/DJ/DK (or DX/DY/DZ) sizes")
            origin = _read_origin(source_path)
            xs = _accumulate(di, origin[0])
            ys = _accumulate(dj, origin[1])
            zs = _accumulate(dk, origin[2])

            def corner_lookup(cell_id: int) -> tuple[tuple[float, float, float], ...]:
                i = cell_id % ncol
                j = (cell_id // ncol) % nrow
                k = cell_id // (ncol * nrow)
                return _cartesian_cell_points(i, j, k, xs, ys, zs)

        positions = array("f")
        for cell_id in active_ids:
            for x, y, z in corner_lookup(cell_id):
                positions.extend((float(x), float(y), float(-z)))

        n_active = len(active_ids)
        from ..converters.hex import compact_hex_centroid_mesh
        packed_positions, indices = compact_hex_centroid_mesh(positions)
        positions = array("f", packed_positions)
        prefix = name
        positions_name = f"{prefix}_positions.f32"
        indices_name = f"{prefix}_indices.u32"
        cell_ids_name = f"{prefix}_cell_ids.u32"
        _write_array(bin_dir / positions_name, "f", positions)
        _write_array(bin_dir / indices_name, "I", indices)
        _write_array(bin_dir / cell_ids_name, "I", array("I", active_ids))

        scalar_files: dict[str, str] = {}

        def write_property(key: str, values: array) -> None:
            active_values = array("f", (float(values[index]) for index in active_ids))
            filename = f"{prefix}_scalars_{key}.f32"
            _write_array(bin_dir / filename, "f", active_values)
            scalar_files[key] = filename

        netgross = _read_grid_property(source_path, "NETGROSS", n_total)
        if netgross is not None:
            write_property("netgross", netgross)
        porosity = _read_grid_property(source_path, "POR", n_total)
        if porosity is not None:
            write_property("porosity", porosity)
        permi = _read_grid_property(source_path, "PERMI", n_total) or _read_grid_property(source_path, "PERMX", n_total)
        if permi is not None:
            write_property("permi", permi)
            permj = _read_grid_property(source_path, "PERMJ", n_total, equals_source=permi)
            permj = permj or _read_grid_property(source_path, "PERMY", n_total, equals_source=permi)
            if permj is not None:
                write_property("permj", permj)
            permk = _read_grid_property(source_path, "PERMK", n_total, equals_source=permi)
            permk = permk or _read_grid_property(source_path, "PERMZ", n_total, equals_source=permi)
            if permk is not None:
                write_property("permk", permk)

        related_datasets: list[dict[str, Any]] = []
        try:
            from .cmg_wells import convert_cmg_wells, parse_cmg_wells
            related_datasets = convert_cmg_wells(
                parse_cmg_wells(source_path),
                prefix,
                bin_dir,
                ncol=ncol,
                nrow=nrow,
                nlay=nlay,
                corner_points=corner_lookup,
            )
        except Exception:
            related_datasets = []

        sr3_option = options.get("sr3_path")
        sr3_path = Path(sr3_option) if sr3_option else _find_sibling(source_path, {".sr3"})
        time_steps: list[dict[str, Any]] = []
        if sr3_path is not None:
            from .cmg_results import attach_sr3_spatial_properties
            time_steps, sr3_info = attach_sr3_spatial_properties(
                sr3_path, active_ids, n_total, prefix, bin_dir,
            )
            deck_metadata.update(sr3_info)

        elapsed = time.time() - started
        simulator = deck_metadata.get("simulator") or "CMG"
        result = {
            "id": prefix,
            "name": f"CMG {simulator}: {prefix} ({ncol}x{nrow}x{nlay}, {n_active:,} active)",
            "n_vertices": len(positions) // 3,
            "n_cells": n_active,
            "n_indices": len(indices),
            "grid_dims": [ncol, nrow, nlay],
            "source": "cmg",
            "files": {
                "positions": positions_name,
                "indices": indices_name,
                "cell_ids": cell_ids_name,
                "scalars": scalar_files,
            },
            "time_steps": time_steps,
            "related_datasets": related_datasets,
            "metadata": {
                **deck_metadata,
                "format": "CMG DAT",
                "units": "SI",
                "grid_type": "corner-point" if grid_type == "corner" else "cartesian",
                "n_total_cells": n_total,
                "n_active_cells": n_active,
                "n_wells_geometry": len(related_datasets),
                "parse_seconds": round(elapsed, 3),
                "properties": sorted(set(scalar_files) | {
                    name for step in time_steps for name in step.get("scalars", {})
                }),
            },
        }
        return result


register_reader(CmgReader())
