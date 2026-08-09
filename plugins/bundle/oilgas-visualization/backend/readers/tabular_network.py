# -*- coding: utf-8 -*-
"""Tabular network/pipeline reader.

Reads CSV or Apache Arrow files describing a flow network
(pipeline segments, nodes, and edge properties) and converts
them to binary format for 3D rendering.

Expected CSV format:
  segment_id, x1, y1, z1, x2, y2, z2, diameter, pressure, flow_rate, temperature, phase

Or Arrow IPC format with the same columns.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from .base import BaseReader, write_f32, write_u32, register_reader


class TabularNetworkReader(BaseReader):
    """Reader for tabular network/pipeline data (CSV/Arrow)."""

    @property
    def format_id(self) -> str:
        return "network"

    @property
    def extensions(self) -> tuple[str, ...]:
        return (".csv", ".arrow", ".parquet")

    @property
    def requires(self) -> tuple[str, ...]:
        return ()

    def read(
        self,
        file_path: str,
        name: str,
        bin_dir: Path,
        options: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Read a network CSV/Arrow file and convert to binary format."""
        ext = Path(file_path).suffix.lower()
        rows = self._load_table(file_path, ext)

        if not rows:
            raise ValueError("No data rows found in network file")

        n_segments = len(rows)

        # Build vertex positions (2 per segment: start + end)
        positions: list[float] = []
        indices: list[int] = []
        cell_ids: list[int] = []
        scalars_pressure: list[float] = []
        scalars_flow: list[float] = []
        scalars_temp: list[float] = []
        scalars_diameter: list[float] = []

        for i, row in enumerate(rows):
            x1 = float(row.get("x1", 0))
            y1 = float(row.get("y1", 0))
            z1 = float(row.get("z1", 0))
            x2 = float(row.get("x2", 0))
            y2 = float(row.get("y2", 0))
            z2 = float(row.get("z2", 0))
            positions.extend([x1, y1, -z1, x2, y2, -z2])

            base = i * 2
            indices.extend([base, base + 1])
            cell_ids.append(i)

            scalars_pressure.append(float(row.get("pressure", 0)))
            scalars_flow.append(float(row.get("flow_rate", 0)))
            scalars_temp.append(float(row.get("temperature", 0)))
            scalars_diameter.append(float(row.get("diameter", 0.1)))

        prefix = f"network_{name}"
        write_f32(bin_dir / f"{prefix}_positions.f32", positions)
        write_u32(bin_dir / f"{prefix}_indices.u32", indices)
        write_u32(bin_dir / f"{prefix}_cell_ids.u32", cell_ids)
        write_f32(bin_dir / f"{prefix}_scalars_pressure.f32", scalars_pressure)
        write_f32(bin_dir / f"{prefix}_scalars_flow_rate.f32", scalars_flow)
        write_f32(bin_dir / f"{prefix}_scalars_temperature.f32", scalars_temp)
        write_f32(bin_dir / f"{prefix}_scalars_diameter.f32", scalars_diameter)

        return {
            "id": f"network_{name}",
            "name": f"Network: {name} ({n_segments} segments)",
            "n_vertices": n_segments * 2,
            "n_cells": n_segments,
            "n_indices": len(indices),
            "source": "network",
            "files": {
                "positions": f"{prefix}_positions.f32",
                "indices": f"{prefix}_indices.u32",
                "cell_ids": f"{prefix}_cell_ids.u32",
                "scalars": {
                    "pressure": f"{prefix}_scalars_pressure.f32",
                    "flow_rate": f"{prefix}_scalars_flow_rate.f32",
                    "temperature": f"{prefix}_scalars_temperature.f32",
                    "diameter": f"{prefix}_scalars_diameter.f32",
                },
            },
            "metadata": {"n_segments": n_segments},
        }

    @staticmethod
    def _load_table(file_path: str, ext: str) -> list[dict[str, Any]]:
        """Load a CSV or Arrow file as a list of dict rows."""
        if ext == ".csv":
            import csv
            with open(file_path, "r", newline="") as f:
                reader = csv.DictReader(f)
                return list(reader)

        if ext in (".arrow", ".parquet"):
            try:
                import pyarrow as pa
                import pyarrow.csv as pacsv
                import pyarrow.parquet as pq

                if ext == ".arrow":
                    table = pacsv.read_csv(file_path)
                else:
                    table = pq.read_table(file_path)
                return table.to_pylist()
            except ImportError:
                raise ImportError(
                    "pyarrow is required to read Arrow/Parquet files"
                )

        raise ValueError(f"Unsupported file format: {ext}")


register_reader(TabularNetworkReader())
