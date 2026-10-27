# -*- coding: utf-8 -*-
"""Tabular network/pipeline reader.

Reads CSV or Apache Arrow files describing a flow network
(pipeline segments, nodes, and edge properties) and converts
them to binary format for 3D rendering.

Expected CSV format:
  segment_id, x1, y1, z1, x2, y2, z2, diameter, pressure, flow_rate, \
temperature, phase

Or Arrow IPC format with the same columns.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from .base import BaseReader, register_reader


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

        from ..converters.network import (
            convert_network_to_lines,
            convert_network_to_tubes,
        )

        if (options or {}).get("representation") == "tubes":
            return convert_network_to_tubes(rows, name, bin_dir)
        return convert_network_to_lines(rows, name, bin_dir)

    @staticmethod
    def _load_table(file_path: str, ext: str) -> list[dict[str, Any]]:
        """Load a CSV or Arrow file as a list of dict rows."""
        if ext == ".csv":
            import csv

            with open(file_path, "r", encoding="utf-8-sig", newline="") as f:
                reader = csv.DictReader(f)
                return list(reader)

        if ext in (".arrow", ".parquet"):
            try:
                import pyarrow as pa
                from pyarrow import ipc
                import pyarrow.parquet as pq

                if ext == ".arrow":
                    with pa.memory_map(file_path, "r") as source:
                        try:
                            table = ipc.open_file(source).read_all()
                        except pa.ArrowInvalid:
                            source.seek(0)
                            table = ipc.open_stream(source).read_all()
                else:
                    table = pq.read_table(file_path)
                return table.to_pylist()
            except ImportError as exc:
                raise ImportError(
                    "pyarrow is required to read Arrow/Parquet files",
                ) from exc

        raise ValueError(f"Unsupported file format: {ext}")


register_reader(TabularNetworkReader())
