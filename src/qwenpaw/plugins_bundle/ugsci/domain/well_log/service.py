# -*- coding: utf-8 -*-
"""WellLogService — domain rules, QC validation, and result construction.

The service layer owns quality-control logic (depth monotonicity, NULL
checks, unit checks, etc.) so that swapping the engine adapter does not
change QC results.  It depends on the ``WellLogEngine`` protocol, not on
any concrete adapter.
"""

from __future__ import annotations

import math
import statistics
from pathlib import Path
from typing import Any

from ..common.errors import DomainError, DomainErrorCode
from ..common.result import ArtifactRef, DomainResult
from ..common.serialization import sanitize_json, to_python_float
from .models import (
    CurveSummary,
    LogCurve,
    WellLogDataset,
    WellLogReadSummary,
    WellMetadata,
)
from .ports import (
    DependencyStatus,
    WellLogEngine,
    WellLogExportRequest,
    WellLogReadRequest,
)

ENGINE_ID = "well-log-processing"
OPERATION_READ = "welllog.las.read"
OPERATION_VALIDATE = "welllog.quality.validate"
OPERATION_EXPORT = "welllog.las.export"

MAX_SAMPLE_ROWS = 200


class WellLogService:
    """Domain service for well log operations."""

    def __init__(self, engine: WellLogEngine) -> None:
        self._engine = engine

    @property
    def engine_id(self) -> str:
        return ENGINE_ID

    @property
    def provider_id(self) -> str:
        return self._engine.provider_id

    def dependency_status(self) -> DependencyStatus:
        return self._engine.dependency_status()

    # ── Read ──────────────────────────────────────────────────────────

    def read(self, path: str, encoding: str = "", sample_rows: int = 20) -> DomainResult:
        """Read a LAS file and return a summary DomainResult."""
        self._validate_path(path)
        sample_rows = max(0, min(sample_rows, MAX_SAMPLE_ROWS))

        request = WellLogReadRequest(path=path, encoding=encoding)
        dataset = self._engine.read(request)

        # Run QC checks (does not modify dataset.warnings in-place)
        qc_report = self._run_qc(dataset)
        combined_warnings = list(dataset.warnings) + qc_report["warnings"]

        summary = self._build_summary(dataset, sample_rows, combined_warnings)
        result_dict = self._summary_to_dict(summary)

        return DomainResult(
            engine_id=ENGINE_ID,
            provider_id=self._engine.provider_id,
            operation=OPERATION_READ,
            method="las_read",
            result=result_dict,
            units={"depth": dataset.metadata.depth_unit or "m"},
            metrics={
                "curve_count": len(dataset.curves),
                "total_rows": len(dataset.depth),
            },
            assumptions=["LAS 2.0 format"],
            warnings=combined_warnings,
            artifacts=[],
        )

    # ── Validate ──────────────────────────────────────────────────────

    def validate(self, path: str, encoding: str = "") -> DomainResult:
        """Validate a LAS file and return QC report."""
        self._validate_path(path)

        request = WellLogReadRequest(path=path, encoding=encoding)
        dataset = self._engine.read(request)

        qc_report = self._run_qc(dataset)
        combined_warnings = list(dataset.warnings) + qc_report["warnings"]
        result_dict = {
            "file": Path(path).name,
            "passed": len(qc_report["errors"]) == 0,
            "errors": qc_report["errors"],
            "warnings": qc_report["warnings"],
            "checks": qc_report["checks"],
        }

        return DomainResult(
            engine_id=ENGINE_ID,
            provider_id=self._engine.provider_id,
            operation=OPERATION_VALIDATE,
            method="ugsci-qc",
            result=sanitize_json(result_dict),
            units={"depth": dataset.metadata.depth_unit or "m"},
            metrics={
                "error_count": len(qc_report["errors"]),
                "warning_count": len(qc_report["warnings"]),
                "check_count": len(qc_report["checks"]),
            },
            assumptions=["LAS 2.0 format"],
            warnings=combined_warnings,
            artifacts=[],
        )

    # ── Export ────────────────────────────────────────────────────────

    def export(self, input_path: str, output_path: str, encoding: str = "utf-8") -> DomainResult:
        """Export a LAS file to a new normalised file."""
        self._validate_path(input_path)
        self._validate_path(output_path)

        request = WellLogExportRequest(
            input_path=input_path,
            output_path=output_path,
            encoding=encoding,
        )
        artifact = self._engine.export(request)

        return DomainResult(
            engine_id=ENGINE_ID,
            provider_id=self._engine.provider_id,
            operation=OPERATION_EXPORT,
            method="las_export",
            result={"output_path": artifact.path},
            units={},
            metrics={},
            assumptions=[],
            warnings=[],
            artifacts=[artifact],
        )

    # ── Private helpers ───────────────────────────────────────────────

    @staticmethod
    def _validate_path(path: str) -> None:
        if not path:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "Path is required",
            )
        p = Path(path)
        if p.suffix.lower() != ".las":
            raise DomainError(
                DomainErrorCode.UNSUPPORTED_FORMAT,
                f"Only .las files are supported, got: {p.suffix}",
            )
        # File existence is checked by the adapter, not the service.
        # This allows the service to be tested with fake engines.

    @staticmethod
    def _run_qc(dataset: WellLogDataset) -> dict[str, Any]:
        """Run quality-control checks on the dataset.

        Returns a structured QC report with errors, warnings, and
        individual check results.  Does **not** modify ``dataset.warnings``
        in-place — the caller is responsible for combining warnings.
        """
        errors: list[str] = []
        warnings: list[str] = []
        checks: list[dict[str, Any]] = []

        depth = dataset.depth
        valid_depth = [d for d in depth if d is not None]

        # Check 1: depth monotonicity
        is_monotonic = True
        if len(valid_depth) >= 2:
            direction = 0
            for i in range(1, len(valid_depth)):
                diff = valid_depth[i] - valid_depth[i - 1]
                if diff > 0:
                    current_dir = 1
                elif diff < 0:
                    current_dir = -1
                else:
                    current_dir = 0
                if direction == 0:
                    direction = current_dir
                elif current_dir != 0 and current_dir != direction:
                    is_monotonic = False
                    break
        checks.append({
            "name": "depth_monotonicity",
            "passed": is_monotonic,
            "detail": "Depth values are monotonically ordered" if is_monotonic else "Depth is not monotonic",
        })
        if not is_monotonic:
            errors.append("Depth is not monotonically increasing or decreasing")

        # Check 2: duplicate depths
        seen: set[float] = set()
        duplicates = 0
        for d in valid_depth:
            if d in seen:
                duplicates += 1
            seen.add(d)
        checks.append({
            "name": "duplicate_depths",
            "passed": duplicates == 0,
            "detail": f"{duplicates} duplicate depth value(s)" if duplicates else "No duplicate depths",
        })
        if duplicates > 0:
            warnings.append(f"{duplicates} duplicate depth value(s) found")

        # Check 3: NULL values
        null_count_total = 0
        for curve in dataset.curves:
            nulls = sum(1 for v in curve.values if v is None)
            null_count_total += nulls
            if nulls > 0:
                pct = nulls / len(curve.values) * 100 if curve.values else 0
                warnings.append(f"Curve {curve.mnemonic}: {nulls} null values ({pct:.1f}%)")
                checks.append({
                    "name": f"null_values_{curve.mnemonic}",
                    "passed": nulls == 0,
                    "detail": f"{nulls} null values ({pct:.1f}%)",
                })

        # Check 4: missing units
        for curve in dataset.curves:
            if not curve.unit:
                warnings.append(f"Curve {curve.mnemonic} has no unit")
                checks.append({
                    "name": f"missing_unit_{curve.mnemonic}",
                    "passed": False,
                    "detail": "No unit specified",
                })

        # Check 5: empty curves
        for curve in dataset.curves:
            if not curve.values:
                warnings.append(f"Curve {curve.mnemonic} is empty")
                checks.append({
                    "name": f"empty_curve_{curve.mnemonic}",
                    "passed": False,
                    "detail": "No data values",
                })

        # Check 6: non-finite values (already converted to None by adapter)
        # This check verifies the conversion happened
        for curve in dataset.curves:
            non_finite = sum(
                1 for v in curve.values
                if v is not None and (math.isnan(v) or math.isinf(v))
            )
            if non_finite > 0:
                warnings.append(f"Curve {curve.mnemonic}: {non_finite} non-finite values")

        # Check 7: missing rate metadata
        if not dataset.metadata.well_name:
            warnings.append("Well name is missing")
        if not dataset.metadata.depth_unit:
            warnings.append("Depth unit is missing")

        # Do NOT modify dataset.warnings in-place; return warnings to caller.
        return {
            "errors": errors,
            "warnings": warnings,
            "checks": checks,
        }

    @staticmethod
    def _build_summary(
        dataset: WellLogDataset,
        sample_rows: int,
        warnings: list[str] | None = None,
    ) -> WellLogReadSummary:
        """Build a summary with statistics and limited sample rows."""
        curve_summaries: list[CurveSummary] = []
        for curve in dataset.curves:
            valid = [v for v in curve.values if v is not None]
            count = len(curve.values)
            null_count = count - len(valid)
            if valid:
                curve_summaries.append(CurveSummary(
                    mnemonic=curve.mnemonic,
                    unit=curve.unit,
                    description=curve.description,
                    count=count,
                    null_count=null_count,
                    min=min(valid),
                    max=max(valid),
                    mean=statistics.mean(valid),
                ))
            else:
                curve_summaries.append(CurveSummary(
                    mnemonic=curve.mnemonic,
                    unit=curve.unit,
                    description=curve.description,
                    count=count,
                    null_count=null_count,
                    min=None,
                    max=None,
                    mean=None,
                ))

        # Build sample rows
        total = len(dataset.depth)
        head_count = min(sample_rows, total)
        tail_count = min(sample_rows, total - head_count)

        def _build_rows(start: int, count: int) -> list[dict[str, float | None]]:
            rows: list[dict[str, float | None]] = []
            for i in range(start, start + count):
                row: dict[str, float | None] = {dataset.depth_mnemonic: dataset.depth[i]}
                for curve in dataset.curves:
                    row[curve.mnemonic] = curve.values[i] if i < len(curve.values) else None
                rows.append(row)
            return rows

        sample_head = _build_rows(0, head_count)
        sample_tail = _build_rows(total - tail_count, tail_count) if tail_count > 0 else []

        return WellLogReadSummary(
            metadata=dataset.metadata,
            depth_mnemonic=dataset.depth_mnemonic,
            curve_summaries=curve_summaries,
            sample_head=sample_head,
            sample_tail=sample_tail,
            sample_rows=sample_rows,
            total_rows=total,
            warnings=warnings if warnings is not None else list(dataset.warnings),
        )

    @staticmethod
    def _summary_to_dict(summary: WellLogReadSummary) -> dict[str, Any]:
        """Convert summary to JSON-safe dict."""
        return sanitize_json({
            "metadata": {
                "well_name": summary.metadata.well_name,
                "uwi": summary.metadata.uwi,
                "field": summary.metadata.field,
                "company": summary.metadata.company,
                "start_depth": summary.metadata.start_depth,
                "stop_depth": summary.metadata.stop_depth,
                "step": summary.metadata.step,
                "depth_unit": summary.metadata.depth_unit,
            },
            "depth_mnemonic": summary.depth_mnemonic,
            "curves": [
                {
                    "mnemonic": cs.mnemonic,
                    "unit": cs.unit,
                    "description": cs.description,
                    "count": cs.count,
                    "null_count": cs.null_count,
                    "min": cs.min,
                    "max": cs.max,
                    "mean": cs.mean,
                }
                for cs in summary.curve_summaries
            ],
            "sample_head": summary.sample_head,
            "sample_tail": summary.sample_tail,
            "sample_rows": summary.sample_rows,
            "total_rows": summary.total_rows,
            "warnings": summary.warnings,
        })
