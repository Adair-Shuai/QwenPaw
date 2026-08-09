# -*- coding: utf-8 -*-
"""Well log domain models.

These are UGSci-owned dataclasses.  Third-party objects (lasio.LASFile,
numpy arrays, pandas DataFrames) must never appear in these models.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class WellMetadata:
    """Well-level header information extracted from a LAS file."""

    well_name: str = ""
    uwi: str = ""
    field: str = ""
    company: str = ""
    start_depth: float | None = None
    stop_depth: float | None = None
    step: float | None = None
    depth_unit: str = ""


@dataclass
class LogCurve:
    """A single log curve with metadata and values.

    ``values`` is a list of Python float or None.  NULL and non-finite
    values from the source file are stored as ``None``.
    """

    mnemonic: str
    unit: str
    description: str
    values: list[float | None]


@dataclass
class WellLogDataset:
    """Complete well log dataset returned by the engine adapter.

    This is the full data structure used by the service layer.  The
    tool layer typically returns a summary, not the full dataset, to
    avoid flooding the agent context with large arrays.
    """

    metadata: WellMetadata
    depth_mnemonic: str
    depth: list[float | None]
    curves: list[LogCurve]
    source_path: str
    null_value: float | None
    warnings: list[str] = field(default_factory=list)


@dataclass
class CurveSummary:
    """Statistical summary of a single curve for tool output."""

    mnemonic: str
    unit: str
    description: str
    count: int
    null_count: int
    min: float | None
    max: float | None
    mean: float | None


@dataclass
class WellLogReadSummary:
    """Summary output for the ``ugsci_welllog_read`` tool.

    Contains metadata, curve summaries, limited sample rows, and QC
    warnings — not the full curve data.
    """

    metadata: WellMetadata
    depth_mnemonic: str
    curve_summaries: list[CurveSummary]
    sample_head: list[dict[str, float | None]]
    sample_tail: list[dict[str, float | None]]
    sample_rows: int
    total_rows: int
    warnings: list[str]
