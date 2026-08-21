# -*- coding: utf-8 -*-
"""Eclipse binary format reader (EGRID, INIT, UNRST).

Provides:
- EGRID: corner-point grid geometry via xtgeo
- INIT: static properties (PORO, PERMX, etc.)
- UNRST: dynamic properties by time step (PRESSURE, SWAT, SGAS)
"""

from __future__ import annotations

import struct
import time
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
        ncol, nrow, nlay = dims.ncol, dims.nrow, dims.nlay
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
                x = float(x_arr[cell_idx]) if x_arr[cell_idx] is not None else 0.0
                y = float(y_arr[cell_idx]) if y_arr[cell_idx] is not None else 0.0
                z = float(z_arr[cell_idx]) if z_arr[cell_idx] is not None else 0.0
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
                    str(init_path), n_total, active_mask, prefix, bin_dir
                )
            )

        # Extract dynamic properties from UNRST file
        time_steps: list[dict[str, Any]] = []
        unrst_path = Path(options.get("unrst_path")) if options.get("unrst_path") else _find_sibling(source_path, {".unrst"})
        if unrst_path.exists():
            time_steps = self._read_unrst_properties(
                str(unrst_path), n_total, active_mask, prefix, bin_dir,
                options.get("properties", ["PRESSURE", "SWAT", "SGAS"]),
                options.get("timeSteps", "manifest-only"),
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
            "metadata": {
                "simulator": "Eclipse-compatible",
                "format": suffix.lstrip(".").upper(),
                "n_time_steps": len(time_steps),
                "has_init": init_path.exists(),
                "has_unrst": unrst_path.exists(),
            },
        }

    @staticmethod
    def _read_init_properties(
        init_path: str, n_total: int, active_mask: Any,
        prefix: str, bin_dir: Path,
    ) -> dict[str, str]:
        """Read static properties from an INIT file."""
        import xtgeo
        result: dict[str, str] = {}

        for prop_name in ["PORO", "PERMX", "PERMY", "PERMZ", "NTG"]:
            try:
                prop = xtgeo.gridproperty_from_file(
                    init_path, fformat="init", name=prop_name
                )
                prop_values = prop.values.flatten(order="F")
                active_values: list[float] = []
                for cell_idx in range(n_total):
                    if active_mask[cell_idx]:
                        v = float(prop_values[cell_idx])
                        active_values.append(v if v == v else 0.0)

                safe_name = prop_name.lower()
                write_f32(
                    bin_dir / f"{prefix}_scalars_{safe_name}.f32",
                    active_values,
                )
                result[safe_name] = f"{prefix}_scalars_{safe_name}.f32"
            except Exception:
                pass  # Property not found

        return result

    @staticmethod
    def _read_unrst_properties(
        unrst_path: str, n_total: int, active_mask: Any,
        prefix: str, bin_dir: Path,
        property_names: list[str],
        time_step_mode: str,
    ) -> list[dict[str, Any]]:
        """Read dynamic properties from a UNRST file.

        Returns a list of time step descriptors, each with
        property → filename mappings.
        """
        import xtgeo

        time_steps: list[dict[str, Any]] = []

        # Discover available time steps
        try:
            # xtgeo can list properties in UNRST
            prop_list = xtgeo.list_gridproperties(unrst_path, fformat="unrst")
            # Extract unique time step numbers from property names
            step_numbers = set()
            for p in prop_list:
                if hasattr(p, "date") and p.date:
                    step_numbers.add(p.date)
        except Exception:
            step_numbers = set([0])  # Fallback: single step

        steps = sorted(step_numbers)
        if time_step_mode == "manifest-only" and len(steps) > 3:
            steps = [steps[0], steps[len(steps) // 2], steps[-1]]
        elif time_step_mode == "range":
            pass  # Use all steps

        for step_i, step_num in enumerate(steps):
            step_info: dict[str, Any] = {
                "index": step_i,
                "step_number": step_num,
                "scalars": {},
            }

            for prop_name in property_names:
                try:
                    prop = xtgeo.gridproperty_from_file(
                        unrst_path, fformat="unrst",
                        name=prop_name, date=step_num,
                    )
                    prop_values = prop.values.flatten(order="F")
                    active_values: list[float] = []
                    for cell_idx in range(n_total):
                        if active_mask[cell_idx]:
                            v = float(prop_values[cell_idx])
                            active_values.append(v if v == v else 0.0)

                    safe_name = prop_name.lower()
                    fname = f"{prefix}_scalars_{safe_name}_ts{step_i}.f32"
                    write_f32(bin_dir / fname, active_values)
                    step_info["scalars"][safe_name] = fname
                except Exception:
                    pass  # Property not found at this step

            if step_info["scalars"]:
                time_steps.append(step_info)

        return time_steps


register_reader(EclipseReader())


def _find_sibling(source_path: Path, suffixes: set[str]) -> Path:
    """Find a case-insensitive companion next to an Eclipse grid."""
    for candidate in source_path.parent.iterdir():
        if candidate.stem.lower() == source_path.stem.lower() and candidate.suffix.lower() in suffixes:
            return candidate
    return source_path.parent / f"__missing__{next(iter(suffixes))}"
