# -*- coding: utf-8 -*-
"""LAS well log file reader.

Prefers the ``lasio`` library when installed.  Unwrapped/wrapped LAS 2.0
text files also parse through a small builtin fallback so well-log preview
works without optional dependencies.

Each LAS file produces:
- positions.f32: MD/TVMD depth array
- scalars: one float32 array per curve (GR, SP, RT, etc.)
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from .base import BaseReader, write_f32, write_u32, register_reader

_DEPTH_MNEMONICS = ("DEPT", "DEPTH", "MD")


def _parse_las_text(path: Path) -> tuple[list[float], list[tuple[str, list[float]]], str]:
    """Parse a LAS 2.0 text file without lasio.

    Returns (depths, [(mnemonic, values), ...] excluding depth, well name).
    """
    mnemonics: list[str] = []
    null_value = -999.25
    well_name = ""
    section = ""
    rows: list[float] = []

    with path.open("r", encoding="utf-8", errors="replace", newline=None) as handle:
        for raw in handle:
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            if line.startswith("~"):
                section = line[1:2].upper()
                continue
            if section == "A":
                for token in line.split():
                    try:
                        rows.append(float(token))
                    except ValueError:
                        raise ValueError(f"Non-numeric LAS data token: {token}")
                continue
            if section not in ("W", "C"):
                continue
            # Header line: MNEM.UNIT   DATA : DESCRIPTION
            head, _, _ = line.partition(":")
            mnemonic, dot, remainder = head.partition(".")
            if not dot:
                continue
            mnemonic = mnemonic.strip().upper()
            if section == "C":
                mnemonics.append(mnemonic)
            elif mnemonic == "NULL":
                try:
                    null_value = float(remainder.split()[-1])
                except (ValueError, IndexError):
                    pass
            elif mnemonic == "WELL":
                # The unit hugs the dot (e.g. "STRT.M"); if whitespace
                # follows the dot the whole remainder is the value.
                value = remainder if remainder[:1].isspace() else (
                    remainder.split(None, 1)[1] if len(remainder.split(None, 1)) > 1 else ""
                )
                well_name = value.strip() or well_name

    if not mnemonics:
        raise ValueError("LAS file has no ~Curve section")
    n_curves = len(mnemonics)
    if not rows or len(rows) % n_curves:
        raise ValueError(
            f"LAS data section is not a multiple of {n_curves} curve columns"
        )

    columns: list[list[float]] = [[] for _ in range(n_curves)]
    for index, value in enumerate(rows):
        columns[index % n_curves].append(
            0.0 if value == null_value else value
        )

    depth_index = 0
    for candidate in _DEPTH_MNEMONICS:
        if candidate in mnemonics:
            depth_index = mnemonics.index(candidate)
            break
    depths = columns[depth_index]
    curves = [
        (mnemonics[index], columns[index])
        for index in range(n_curves)
        if index != depth_index
    ]
    return depths, curves, well_name


class LasReader(BaseReader):
    """Reader for LAS well log files."""

    @property
    def format_id(self) -> str:
        return "las"

    @property
    def extensions(self) -> tuple[str, ...]:
        return (".las", ".las3")

    @property
    def requires(self) -> tuple[str, ...]:
        # lasio is preferred but the builtin LAS 2.0 parser keeps this
        # reader available without it.
        return ()

    def read(
        self,
        file_path: str,
        name: str,
        bin_dir: Path,
        options: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Read a LAS file and convert to binary format."""
        try:
            import lasio
        except ImportError:
            depths, curves, well_name = _parse_las_text(Path(file_path))
            return self._build_dataset(
                name, bin_dir, depths, curves, well_name or name, "builtin-las",
            )

        las = lasio.read(file_path)

        depth_mnemonic = options.get("depth_mnemonic", "DEPT") if options else "DEPT"
        curves_by_name = {curve.mnemonic.upper(): curve for curve in las.curves}
        depth_curve = curves_by_name.get(depth_mnemonic.upper())
        if depth_curve is None:
            depth_curve = curves_by_name.get("DEPT") or curves_by_name.get("MD")
        depths = depth_curve.data if depth_curve is not None else las.index
        if len(depths) == 0:
            raise ValueError("LAS file contains no depth samples")

        curves = [
            (curve.mnemonic, [float(v) if v == v else 0.0 for v in curve.data])
            for curve in las.curves
            if curve is not depth_curve
        ]
        well_info = las.well
        well_name = str(well_info.WELL.value) if hasattr(well_info, "WELL") else name
        return self._build_dataset(
            name, bin_dir, [float(d) for d in depths], curves, well_name, "lasio",
        )

    @staticmethod
    def _build_dataset(
        name: str,
        bin_dir: Path,
        depths: list[float],
        curves: list[tuple[str, list[float]]],
        well_name: str,
        reader: str,
    ) -> dict[str, Any]:
        from ..security import sanitize_identifier

        n_samples = len(depths)
        if n_samples == 0:
            raise ValueError("LAS file contains no depth samples")

        positions: list[float] = []
        for depth in depths:
            positions.extend([0.0, 0.0, -float(depth)])  # depth-down

        prefix = f"las_{name}"
        write_f32(bin_dir / f"{prefix}_positions.f32", positions)

        indices: list[int] = []
        for index in range(n_samples - 1):
            indices.extend([index, index + 1])
        write_u32(bin_dir / f"{prefix}_indices.u32", indices)
        write_u32(bin_dir / f"{prefix}_cell_ids.u32", list(range(max(n_samples - 1, 0))))

        scalars_files: dict[str, str] = {}
        for mnemonic, values in curves:
            safe_name = sanitize_identifier(mnemonic.lower(), "curve")
            write_f32(bin_dir / f"{prefix}_scalars_{safe_name}.f32", values)
            scalars_files[safe_name] = f"{prefix}_scalars_{safe_name}.f32"

        return {
            "id": f"las_{name}",
            "name": f"LAS: {well_name} ({n_samples} samples)",
            "n_vertices": n_samples,
            "n_cells": max(n_samples - 1, 0),
            "n_indices": len(indices),
            "source": "las",
            "files": {
                "positions": f"{prefix}_positions.f32",
                "indices": f"{prefix}_indices.u32",
                "cell_ids": f"{prefix}_cell_ids.u32",
                "scalars": scalars_files,
            },
            "metadata": {
                "well_name": well_name,
                "n_curves": len(scalars_files),
                "depth_range": [float(depths[0]), float(depths[-1])],
                "reader": reader,
            },
        }


register_reader(LasReader())
