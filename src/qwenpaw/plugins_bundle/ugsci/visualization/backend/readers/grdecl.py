# -*- coding: utf-8 -*-
"""Pure-Python Eclipse GRDECL fallback reader.

GRDECL is the ASCII corner-point deck (SPECGRID/DIMENS, COORD, ZCORN,
ACTNUM plus cell arrays such as PORO/PERMX).  ``EclipseReader`` prefers
xtgeo when it is installed; this module keeps GRDECL preview working
without any heavy optional dependency.  Binary EGRID/INIT/UNRST files
still require xtgeo.
"""

from __future__ import annotations

import time
from array import array
from pathlib import Path
from typing import Any, Iterator

from .base import write_f32, write_u32
from .cmg import _CELL_CORNERS

_PROPERTY_KEYWORDS = {
    "PORO": "porosity",
    "PERMX": "permx",
    "PERMY": "permy",
    "PERMZ": "permz",
    "NTG": "ntg",
}


def _tokens(path: Path) -> Iterator[str]:
    """Yield GRDECL tokens with ``--`` comments stripped."""
    with path.open("r", encoding="utf-8", errors="replace", newline=None) as handle:
        for line in handle:
            comment = line.find("--")
            if comment >= 0:
                line = line[:comment]
            yield from line.split()


def _read_values(tokens: Iterator[str], expected: int, keyword: str) -> array:
    """Read a slash-terminated numeric section, expanding ``n*value`` runs."""
    values = array("d")
    for token in tokens:
        if token.startswith("/"):
            break
        if "*" in token:
            count_text, _, value_text = token.partition("*")
            count = int(count_text)
            value = float(value_text) if value_text else 0.0
            values.extend([value] * count)
        else:
            values.append(float(token))
        if len(values) > expected:
            raise ValueError(f"GRDECL {keyword} has more than {expected:,} values")
    if len(values) != expected:
        raise ValueError(
            f"GRDECL {keyword} ended after {len(values):,} of {expected:,} values"
        )
    return values


def _skip_section(tokens: Iterator[str]) -> None:
    for token in tokens:
        if token.startswith("/") or token.endswith("/"):
            return


def parse_grdecl(path: Path) -> dict[str, Any]:
    """Parse dims, COORD, ZCORN, ACTNUM and known cell arrays from a deck."""
    dims: tuple[int, int, int] | None = None
    coord: array | None = None
    zcorn: array | None = None
    actnum: array | None = None
    properties: dict[str, array] = {}
    pending: list[str] = []

    tokens = _tokens(path)
    for token in tokens:
        keyword = token.upper()
        if keyword in ("SPECGRID", "DIMENS"):
            ncol = int(next(tokens))
            nrow = int(next(tokens))
            nlay = int(next(tokens))
            dims = (ncol, nrow, nlay)
            _skip_section(tokens)
        elif keyword in ("COORD", "ZCORN", "ACTNUM") or keyword in _PROPERTY_KEYWORDS:
            if dims is None:
                pending.append(keyword)
                _skip_section(tokens)
                continue
            ncol, nrow, nlay = dims
            n_total = ncol * nrow * nlay
            if keyword == "COORD":
                coord = _read_values(tokens, 6 * (ncol + 1) * (nrow + 1), keyword)
            elif keyword == "ZCORN":
                zcorn = _read_values(tokens, 8 * n_total, keyword)
            elif keyword == "ACTNUM":
                actnum = _read_values(tokens, n_total, keyword)
            else:
                properties[_PROPERTY_KEYWORDS[keyword]] = _read_values(
                    tokens,
                    n_total,
                    keyword,
                )

    if dims is None:
        raise ValueError("GRDECL deck has no SPECGRID/DIMENS")
    if coord is None or zcorn is None:
        missing = "COORD" if coord is None else "ZCORN"
        if pending:
            raise ValueError(
                f"GRDECL {missing} appears before SPECGRID/DIMENS; reorder the deck"
            )
        raise ValueError(f"GRDECL deck has no {missing}")
    return {
        "dims": dims,
        "coord": coord,
        "zcorn": zcorn,
        "actnum": actnum,
        "properties": properties,
    }


def _cell_corner(
    coord: array,
    zcorn: array,
    ncol: int,
    nrow: int,
    i: int,
    j: int,
    k: int,
    delta: tuple[int, int, int],
) -> tuple[float, float, float]:
    """Locate one cell corner on its COORD pillar at the ZCORN depth."""
    di, dj, dk = delta
    zcorn_index = (
        (2 * i + di) + 2 * ncol * (2 * j + dj) + 4 * ncol * nrow * (2 * k + dk)
    )
    z = zcorn[zcorn_index]
    pillar = ((j + dj) * (ncol + 1) + (i + di)) * 6
    x_top, y_top, z_top = coord[pillar], coord[pillar + 1], coord[pillar + 2]
    x_bot, y_bot, z_bot = coord[pillar + 3], coord[pillar + 4], coord[pillar + 5]
    if z_bot == z_top:
        return (x_top, y_top, z)
    t = (z - z_top) / (z_bot - z_top)
    return (x_top + t * (x_bot - x_top), y_top + t * (y_bot - y_top), z)


def read_grdecl_dataset(file_path: str, name: str, bin_dir: Path) -> dict[str, Any]:
    """Convert a GRDECL deck to the shared binary manifest contract."""
    started = time.time()
    source = Path(file_path)
    parsed = parse_grdecl(source)
    ncol, nrow, nlay = parsed["dims"]
    n_total = ncol * nrow * nlay

    actnum = parsed["actnum"]
    active_ids = [
        index for index in range(n_total) if actnum is None or actnum[index] != 0.0
    ]

    coord, zcorn = parsed["coord"], parsed["zcorn"]
    positions: list[float] = []
    for cell_id in active_ids:
        i = cell_id % ncol
        j = (cell_id // ncol) % nrow
        k = cell_id // (ncol * nrow)
        for delta in _CELL_CORNERS:
            x, y, z = _cell_corner(coord, zcorn, ncol, nrow, i, j, k, delta)
            positions.extend([float(x), float(y), float(-z)])

    n_active = len(active_ids)
    from ..converters.hex import compact_hex_centroid_mesh

    positions, indices = compact_hex_centroid_mesh(positions)
    prefix = name
    write_f32(bin_dir / f"{prefix}_positions.f32", positions)
    write_u32(bin_dir / f"{prefix}_indices.u32", list(indices))
    write_u32(bin_dir / f"{prefix}_cell_ids.u32", active_ids)

    scalar_files: dict[str, str] = {}
    for prop_name, values in parsed["properties"].items():
        filename = f"{prefix}_scalars_{prop_name}.f32"
        write_f32(bin_dir / filename, [float(values[index]) for index in active_ids])
        scalar_files[prop_name] = filename

    return {
        "id": prefix,
        "name": f"Eclipse: {prefix} ({ncol}x{nrow}x{nlay}, {n_active:,} active)",
        "n_vertices": len(positions) // 3,
        "n_cells": n_active,
        "n_indices": len(indices),
        "grid_dims": [ncol, nrow, nlay],
        "source": "egrid",
        "files": {
            "positions": f"{prefix}_positions.f32",
            "indices": f"{prefix}_indices.u32",
            "cell_ids": f"{prefix}_cell_ids.u32",
            "scalars": scalar_files,
        },
        "time_steps": [],
        "metadata": {
            "simulator": "Eclipse-compatible",
            "format": "GRDECL",
            "reader": "builtin-grdecl",
            "n_total_cells": n_total,
            "n_active_cells": n_active,
            "parse_seconds": round(time.time() - started, 3),
        },
    }
