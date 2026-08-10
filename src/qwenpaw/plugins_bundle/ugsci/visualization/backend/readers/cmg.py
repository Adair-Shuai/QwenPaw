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


_GRID_RE = re.compile(r"^\s*GRID\s+CORNER\s+(\d+)\s+(\d+)\s+(\d+)\b", re.I)
_REPEAT_RE = re.compile(r"^(\d+)\*(.+)$")
_RESULTS_RE = re.compile(r"^\s*RESULTS\s+SIMULATOR\s+(\S+)(?:\s+(.*))?$", re.I)
_MODEL_RE = re.compile(r"^\s*MODEL\s+(\S+)", re.I)
_WELL_RE = re.compile(r"^\s*WELL\s+['\"]([^'\"]+)['\"]", re.I)
_DATE_RE = re.compile(r"^\s*DATE\s+(\d{4})\s+(\d{1,2})\s+([0-9.]+)", re.I)
_OUTSRF_GRID_RE = re.compile(r"^\s*OUTSRF\s+GRID\s+(.+)$", re.I)


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


def _find_grid_dimensions(path: Path) -> tuple[int, int, int]:
    with path.open("r", encoding="utf-8", errors="replace", newline=None) as handle:
        for line in handle:
            match = _GRID_RE.match(line)
            if match:
                return tuple(int(match.group(i)) for i in range(1, 4))  # type: ignore[return-value]
    raise ValueError("CMG deck does not contain GRID CORNER I J K")


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
                if words and words[0] == target:
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
    """CMG GEM ASCII grid reader."""

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
        del options  # Reserved for future schedule/property selection.
        source_path = Path(file_path)
        if not source_path.exists():
            raise FileNotFoundError(f"CMG deck not found: {source_path}")

        started = time.time()
        deck_metadata = _scan_deck_metadata(source_path)
        ncol, nrow, nlay = _find_grid_dimensions(source_path)
        n_total = ncol * nrow * nlay

        # CMG CORNERS is three component blocks over an I-fast refined corner
        # lattice with dimensions (2*ncol, 2*nrow, 2*nlay).
        corner_values = _read_keyword_values(source_path, "CORNERS", 24 * n_total)
        null_values = _read_keyword_values(source_path, "NULL", n_total)
        active_mask = [value != 0.0 for value in null_values]
        active_ids = [index for index, active in enumerate(active_mask) if active]

        positions = array("f")
        # Corner order matches the existing viewer/Eclipse reader faces.
        for cell_id in active_ids:
            for x, y, z in _cell_corner_points(
                corner_values,
                cell_id,
                ncol,
                nrow,
                nlay,
            ):
                positions.extend((float(x), float(y), float(-z)))

        n_active = len(active_ids)
        indices = array("I")
        faces = (
            (0, 1, 2, 3), (4, 7, 6, 5), (0, 1, 5, 4),
            (3, 2, 6, 7), (0, 3, 7, 4), (1, 2, 6, 5),
        )
        for cell_index in range(n_active):
            base = cell_index * 8
            for a, b, c, d in faces:
                indices.extend((base + a, base + b, base + c,
                                base + a, base + c, base + d))

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

        # NETGROSS is useful for filtering and is present in many GEM decks;
        # absence is tolerated because it is not required for geometry.
        try:
            write_property("netgross", _read_keyword_values(source_path, "NETGROSS", n_total))
        except ValueError:
            pass
        try:
            write_property("porosity", _read_keyword_values(source_path, "POR", n_total))
        except ValueError:
            pass
        try:
            permi = _read_keyword_values(source_path, "PERMI", n_total)
            write_property("permi", permi)
            # GEM deck expressions used by this sample and commonly emitted
            # by CMG: PERMJ EQUALSI and PERMK EQUALSI * 0.1.
            write_property("permj", permi)
            write_property("permk", array("d", (value * 0.1 for value in permi)))
        except ValueError:
            pass

        elapsed = time.time() - started
        return {
            "id": prefix,
            "name": f"CMG GEM: {prefix} ({ncol}x{nrow}x{nlay}, {n_active:,} active)",
            "n_vertices": n_active * 8,
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
            "metadata": {
                **deck_metadata,
                "format": "CMG DAT",
                "units": "SI",
                "grid_type": "corner-point",
                "n_total_cells": n_total,
                "n_active_cells": n_active,
                "parse_seconds": round(elapsed, 3),
                "properties": sorted(scalar_files),
            },
        }


register_reader(CmgReader())
