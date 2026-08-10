# -*- coding: utf-8 -*-
"""Abstract base reader interface for all data format readers.

Every reader converts a domain file (LAS, DLIS, EGRID, ROFF, CSV, etc.)
into a standardized binary format for the Three.js viewer.

All readers MUST:
- Import heavy dependencies lazily (inside methods, not at module top)
- Gracefully degrade if optional dependencies are missing
- Return a DatasetManifest-compatible dict
- Write binary output to bin_dir using struct.pack
"""

from __future__ import annotations

import abc
import struct
from pathlib import Path
from typing import Any


class BaseReader(abc.ABC):
    """Abstract base class for all format readers."""

    @property
    @abc.abstractmethod
    def format_id(self) -> str:
        """Unique format identifier (e.g. 'roff', 'las', 'dlis')."""

    @property
    @abc.abstractmethod
    def extensions(self) -> tuple[str, ...]:
        """File extensions this reader handles (e.g. ('.roff', '.roffbin'))."""

    @property
    def requires(self) -> tuple[str, ...]:
        """Python package names required (e.g. ('xtgeo',)). Empty = no deps."""
        return ()

    def is_available(self) -> bool:
        """Check if all required packages are installed."""
        for pkg in self.requires:
            try:
                __import__(pkg)
            except ImportError:
                return False
        return True

    @abc.abstractmethod
    def read(
        self,
        file_path: str,
        name: str,
        bin_dir: Path,
        options: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Read a file and convert to binary format.

        Args:
            file_path: Path to the input file
            name: Dataset name for output files
            bin_dir: Output directory for binary files
            options: Optional reader-specific options

        Returns:
            Dataset manifest entry dict.
        """


def write_f32(path: Path, values: list[float]) -> None:
    """Write a list of floats as little-endian float32 binary."""
    path.write_bytes(struct.pack(f"<{len(values)}f", *values))


def write_u32(path: Path, values: list[int]) -> None:
    """Write a list of ints as little-endian uint32 binary."""
    path.write_bytes(struct.pack(f"<{len(values)}I", *values))


def write_f64(path: Path, values: list[float]) -> None:
    """Write a list of floats as little-endian float64 binary."""
    path.write_bytes(struct.pack(f"<{len(values)}d", *values))


# Registry of all readers
_READER_REGISTRY: dict[str, BaseReader] = {}


def register_reader(reader: BaseReader) -> None:
    """Register a reader instance."""
    _READER_REGISTRY[reader.format_id] = reader


def get_reader(format_id: str) -> BaseReader | None:
    """Get a reader by format ID."""
    return _READER_REGISTRY.get(format_id)


def list_readers() -> list[BaseReader]:
    """List all registered readers."""
    return list(_READER_REGISTRY.values())


def get_available_formats() -> dict[str, bool]:
    """Return a dict of {format_id: is_available}."""
    return {r.format_id: r.is_available() for r in _READER_REGISTRY.values()}
