# -*- coding: utf-8 -*-
"""DLIS well log file reader.

Reads DLIS (Digital Log Interchange Standard) files using ``dlisio``.
DLIS is a binary format used for wellbore data. This reader gracefully
degrades if ``dlisio`` is not installed.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from .base import BaseReader, write_f32, write_u32, register_reader


class DlisReader(BaseReader):
    """Reader for DLIS wellbore files."""

    @property
    def format_id(self) -> str:
        return "dlis"

    @property
    def extensions(self) -> tuple[str, ...]:
        return (".dlis",)

    @property
    def requires(self) -> tuple[str, ...]:
        return ("dlisio",)

    def read(
        self,
        file_path: str,
        name: str,
        bin_dir: Path,
        options: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Read a DLIS file and convert to binary format."""
        import dlisio

        with dlisio.load(file_path) as files:
            # Use the first logical file
            lf = files[0]

            # Find depth channel
            depth_channel = None
            depth_mnemonic = (options or {}).get("depth_mnemonic", "TVD")

            for channel in lf.channels:
                if channel.name.upper() in ("TVD", "MD", "DEPT"):
                    depth_channel = channel
                    break

            if not depth_channel:
                # Use first channel as fallback
                channels = list(lf.channels)
                if channels:
                    depth_channel = channels[0]
                else:
                    raise ValueError("No channels found in DLIS file")

            depths = list(depth_channel.curves())
            n_samples = len(depths)
            if n_samples == 0:
                raise ValueError("DLIS file contains no depth samples")

            # Write positions
            positions: list[float] = []
            for d in depths:
                positions.extend([0.0, 0.0, -float(d)])

            prefix = f"dlis_{name}"
            write_f32(bin_dir / f"{prefix}_positions.f32", positions)

            indices: list[int] = []
            for i in range(n_samples - 1):
                indices.extend([i, i + 1])
            write_u32(bin_dir / f"{prefix}_indices.u32", indices)

            cell_ids = list(range(max(n_samples - 1, 0)))
            write_u32(bin_dir / f"{prefix}_cell_ids.u32", cell_ids)

            # Extract curves
            scalars_files: dict[str, str] = {}
            for channel in lf.channels:
                if channel is depth_channel:
                    continue
                try:
                    values = list(channel.curves())
                    from ..security import sanitize_identifier
                    safe_name = sanitize_identifier(channel.name.lower(), "curve")
                    float_values = [
                        float(v) if isinstance(v, (int, float)) else 0.0
                        for v in values
                    ]
                    write_f32(bin_dir / f"{prefix}_scalars_{safe_name}.f32", float_values)
                    scalars_files[safe_name] = f"{prefix}_scalars_{safe_name}.f32"
                except Exception:
                    continue  # Skip problematic channels

            return {
                "id": f"dlis_{name}",
                "name": f"DLIS: {name} ({n_samples} samples)",
                "n_vertices": n_samples,
                "n_cells": max(n_samples - 1, 0),
                "n_indices": len(indices),
                "source": "dlis",
                "files": {
                    "positions": f"{prefix}_positions.f32",
                    "indices": f"{prefix}_indices.u32",
                    "cell_ids": f"{prefix}_cell_ids.u32",
                    "scalars": scalars_files,
                },
                "metadata": {
                    "n_channels": len(scalars_files),
                    "depth_range": [float(depths[0]), float(depths[-1])],
                },
            }


register_reader(DlisReader())
