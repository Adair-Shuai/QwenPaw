# -*- coding: utf-8 -*-
"""Eclipse binary format reader (EGRID, INIT, UNRST).

Provides:
- EGRID: corner-point grid geometry via xtgeo
- INIT: static properties (PORO, PERMX, etc.)
- UNRST: dynamic properties by time step (PRESSURE, SWAT, SGAS)
"""

from __future__ import annotations

import time
import math
from pathlib import Path
from typing import Any

from .base import BaseReader, write_f32, write_u32, register_reader


class EclipseReader(BaseReader):
    """Reader for Eclipse EGRID/INIT/UNRST files."""

    @property
    def format_id(self) -> str:
        return "eclipse"

    @property
    def extensions(self) -> tuple[str, ...]:
        # .GRID is the common tNavigator/Eclipse-compatible binary grid
        # spelling.  It uses the same EGRID reader path.
        return (".egrid", ".grid", ".init", ".unrst", ".grdecl")

    @property
    def requires(self) -> tuple[str, ...]:
        return ("xtgeo",)

    def read(
        self,
        file_path: str,
        name: str,
        bin_dir: Path,
        options: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Read an Eclipse EGRID grid file and convert to binary format.

        If companion INIT and UNRST files exist alongside, extract
        static and dynamic properties.
        """
        source_path = Path(file_path)
        suffix = source_path.suffix.lower()
        if suffix in {".init", ".unrst"}:
            source_path = _find_sibling(source_path, {".egrid", ".grid"})
            if not source_path.is_file():
                raise ValueError("Eclipse properties require their same-case EGRID/GRID")
            suffix = source_path.suffix.lower()
        try:
            import xtgeo
        except ImportError:
            if suffix == ".grdecl":
                # ASCII corner-point decks do not need xtgeo; binary
                # EGRID/INIT/UNRST files still do.
                from .grdecl import read_grdecl_dataset
                return read_grdecl_dataset(file_path, name, bin_dir)
            raise

        options = options or {}
        t0 = time.time()
        grid_format = "grdecl" if suffix == ".grdecl" else "egrid"
        grd = xtgeo.grid_from_file(str(source_path), fformat=grid_format)
        dims = grd.dimensions
        ncol, nrow, nlay = map(int, dims)
        n_total = ncol * nrow * nlay

        actnum = grd.get_actnum()
        active_mask = actnum.values.flatten(order="F").astype(bool)
        n_active = int(active_mask.sum())

        # Build geometry (same logic as roff.py)
        corners = grd.get_xyz_corners()
        corner_xyz = []
        for i in range(0, 24, 3):
            x_arr = corners[i].values.flatten(order="F")
            y_arr = corners[i + 1].values.flatten(order="F")
            z_arr = corners[i + 2].values.flatten(order="F")
            corner_xyz.append((x_arr, y_arr, z_arr))

        positions: list[float] = []
        cell_ids: list[int] = []

        # xtgeo corners are Eclipse pairing order (SW,SE,NW,NE).  Reorder to
        # VTK hexahedron winding so the shared 6-quad table is planar.
        from ..converters.hex import XTGEO_TO_VTK, compact_hex_centroid_mesh

        for cell_idx in range(n_total):
            if not active_mask[cell_idx]:
                continue
            for eclipse_index in XTGEO_TO_VTK:
                x_arr, y_arr, z_arr = corner_xyz[eclipse_index]
                x, y, z = float(x_arr[cell_idx]), float(y_arr[cell_idx]), float(z_arr[cell_idx])
                if not all(math.isfinite(value) for value in (x, y, z)):
                    raise ValueError("Active Eclipse cell has missing/nonfinite coordinates")
                positions.extend([x, y, -z])
            cell_ids.append(cell_idx)

        prefix = name
        packed_positions, packed_indices = compact_hex_centroid_mesh(positions)
        positions = packed_positions
        write_f32(bin_dir / f"{prefix}_positions.f32", positions)
        write_u32(bin_dir / f"{prefix}_cell_ids.u32", cell_ids)

        indices = list(packed_indices)
        write_u32(bin_dir / f"{prefix}_indices.u32", indices)

        # Extract static properties from INIT file
        scalars_files: dict[str, str] = {}
        options = options or {}
        init_path = Path(options.get("init_path")) if options.get("init_path") else _find_sibling(source_path, {".init"})
        if init_path.exists():
            scalars_files.update(
                self._read_init_properties(
                    str(init_path), n_total, active_mask, prefix, bin_dir, grd
                )
            )

        # Extract dynamic properties from UNRST file
        time_steps: list[dict[str, Any]] = []
        unrst_path = Path(options.get("unrst_path")) if options.get("unrst_path") else _find_sibling(source_path, {".unrst"})
        if unrst_path.exists():
            time_steps = self._read_unrst_properties(
                str(unrst_path), n_total, active_mask, prefix, bin_dir,
                options.get("properties", ["PRESSURE", "SWAT", "SGAS"]),
                options.get("timeSteps", "range"), grd,
            )

        elapsed = time.time() - t0
        print(f"  Eclipse conversion: {elapsed:.2f}s, {n_active} active cells, {len(time_steps)} time steps")

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
                "scalars": scalars_files,
            },
            "time_steps": time_steps,
            "properties": {
                key: {"label": key.upper(), "association": "cell", "count": n_active, "unit": None}
                for key in set(scalars_files).union(*(set(step["scalars"]) for step in time_steps))
            },
            "metadata": {
                "simulator": "Eclipse-compatible",
                "format": suffix.lstrip(".").upper(),
                "n_time_steps": len(time_steps),
                "has_init": init_path.exists(),
                "has_unrst": unrst_path.exists(),
            },
        }

    @staticmethod
    def _active_values(prop: Any, active_mask: Any, n_total: int) -> list[float]:
        import numpy as np
        values = np.ma.asarray(prop.values, dtype=float).filled(np.nan).flatten(order="F")
        if len(values) != n_total:
            raise ValueError("Eclipse property/grid cell count mismatch")
        values[~np.isfinite(values)] = np.nan
        return values[active_mask].tolist()

    @staticmethod
    def _read_init_properties(
        init_path: str, n_total: int, active_mask: Any,
        prefix: str, bin_dir: Path, grid: Any,
    ) -> dict[str, str]:
        """Read actual present keywords, retaining missing values as NaN."""
        import xtgeo
        import resfo
        # Read complete records: a truncated file is not a valid static frame.
        present = set()
        for record in resfo.lazy_read(init_path):
            present.add(record.read_keyword().strip())
            record.read_array()
        result: dict[str, str] = {}
        for prop_name in ["PORO", "PERMX", "PERMY", "PERMZ", "NTG"]:
            if prop_name not in present:
                continue
            prop = xtgeo.gridproperty_from_file(init_path, fformat="init", name=prop_name, grid=grid)
            values = EclipseReader._active_values(prop, active_mask, n_total)
            key = prop_name.lower()
            filename = f"{prefix}_scalars_{key}.f32"
            write_f32(bin_dir / filename, values)
            result[key] = filename
        return result

    @staticmethod
    def _read_unrst_properties(
        unrst_path: str, n_total: int, active_mask: Any,
        prefix: str, bin_dir: Path,
        property_names: list[str], time_step_mode: str, grid: Any,
    ) -> list[dict[str, Any]]:
        """Use XTGeo's public date scan and bind each property to its grid.

        Every advertised timestep has real scalar resources. The legacy
        ``manifest-only`` spelling no longer produces an incomplete catalog.
        """
        import xtgeo
        import resfo
        names_by_step: dict[int, set[str]] = {}
        seqno = None
        for record in resfo.lazy_read(unrst_path):
            keyword = record.read_keyword().strip()
            values = record.read_array()
            if keyword == "SEQNUM":
                seqno = int(values[0])
                names_by_step[seqno] = set()
            elif seqno is not None:
                names_by_step[seqno].add(keyword)
        dates = xtgeo.GridProperties.scan_dates(unrst_path)
        time_steps = []
        for step_num, date in dates:
            names = names_by_step.get(int(step_num), set())
            step = {"index": len(time_steps), "step_number": int(step_num), "date": str(date), "scalars": {}}
            for prop_name in property_names:
                if prop_name not in names:
                    continue
                prop = xtgeo.gridproperty_from_file(
                    unrst_path, fformat="unrst", name=prop_name, date=int(date), grid=grid,
                )
                values = EclipseReader._active_values(prop, active_mask, n_total)
                key = prop_name.lower()
                filename = f"{prefix}_scalars_{key}_ts{step['index']}.f32"
                write_f32(bin_dir / filename, values)
                step["scalars"][key] = filename
            if step["scalars"]:
                time_steps.append(step)
        return time_steps


register_reader(EclipseReader())


def _find_sibling(source_path: Path, suffixes: set[str]) -> Path:
    """Find a case-insensitive companion next to an Eclipse grid."""
    for candidate in source_path.parent.iterdir():
        if candidate.stem.lower() == source_path.stem.lower() and candidate.suffix.lower() in suffixes:
            return candidate
    return source_path.parent / f"__missing__{next(iter(suffixes))}"
