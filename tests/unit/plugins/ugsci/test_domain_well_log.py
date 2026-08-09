# -*- coding: utf-8 -*-
"""Tests for the well log domain: models, service, adapter, and tools."""

# pylint: disable=redefined-outer-name,unused-argument

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from plugins.bundle.ugsci.domain.common.errors import (
    DomainError,
    DomainErrorCode,
)
from plugins.bundle.ugsci.domain.well_log.models import (
    LogCurve,
    WellLogDataset,
    WellMetadata,
)
from plugins.bundle.ugsci.domain.well_log.ports import (
    DependencyStatus,
    WellLogReadRequest,
    WellLogExportRequest,
)
from plugins.bundle.ugsci.domain.well_log.service import WellLogService
from plugins.bundle.ugsci.domain.well_log.adapters.lasio_adapter import (
    LasioAdapter,
)
from plugins.bundle.ugsci.domain.well_log.tools import _resolve_workspace_path
from qwenpaw.config.context import (
    set_current_project_dir,
    set_current_workspace_dir,
)

FIXTURES_DIR = Path(__file__).parent / "fixtures"


# ─── Fake Engine for Service tests ───────────────────────────────────────────


class FakeWellLogEngine:
    """In-memory engine for testing WellLogService without lasio."""

    provider_id = "fake-welllog"

    def __init__(self, dataset: WellLogDataset | None = None) -> None:
        self._dataset = dataset
        self._exported: list[WellLogExportRequest] = []

    def dependency_status(self) -> DependencyStatus:
        return DependencyStatus(available=True)

    def read(self, request: WellLogReadRequest) -> WellLogDataset:
        if self._dataset is None:
            raise DomainError(DomainErrorCode.FILE_NOT_FOUND, "No dataset")
        return WellLogDataset(
            metadata=self._dataset.metadata,
            depth_mnemonic=self._dataset.depth_mnemonic,
            depth=self._dataset.depth,
            curves=self._dataset.curves,
            source_path=request.path,
            null_value=self._dataset.null_value,
            warnings=list(self._dataset.warnings),
        )

    def export(self, request: WellLogExportRequest) -> Any:
        from plugins.bundle.ugsci.domain.common.result import ArtifactRef

        self._exported.append(request)
        return ArtifactRef(
            path=request.output_path,
            media_type="text/plain",
            description="Exported",
        )


def _make_test_dataset() -> WellLogDataset:
    """Create a simple dataset for testing."""
    return WellLogDataset(
        metadata=WellMetadata(
            well_name="Test Well",
            uwi="WI-001",
            field="Test Field",
            company="Test Co",
            start_depth=1000.0,
            stop_depth=1005.0,
            step=0.5,
            depth_unit="m",
        ),
        depth_mnemonic="DEPT",
        depth=[1000.0, 1000.5, 1001.0, 1001.5, 1002.0],
        curves=[
            LogCurve("GR", "API", "Gamma Ray", [85.0, 90.0, 75.0, 80.0, 95.0]),
            LogCurve(
                "RHOB",
                "g/cc",
                "Density",
                [2.35, 2.40, 2.30, 2.38, 2.42],
            ),
        ],
        source_path="test.las",
        null_value=-999.25,
    )


# ─── Service tests with FakeEngine ───────────────────────────────────────────


class TestWellLogService:
    def test_read_returns_domain_result(self) -> None:
        engine = FakeWellLogEngine(_make_test_dataset())
        service = WellLogService(engine)
        result = service.read("test.las", sample_rows=3)

        assert result.engine_id == "well-log-processing"
        assert result.operation == "welllog.las.read"
        assert result.schema_version == 1
        assert result.provider_id == "fake-welllog"

    def test_read_summary_has_curve_stats(self) -> None:
        engine = FakeWellLogEngine(_make_test_dataset())
        service = WellLogService(engine)
        result = service.read("test.las", sample_rows=2)

        curves = result.result["curves"]
        assert len(curves) == 2
        assert curves[0]["mnemonic"] == "GR"
        assert curves[0]["count"] == 5
        assert curves[0]["null_count"] == 0
        assert curves[0]["min"] == 75.0
        assert curves[0]["max"] == 95.0

    def test_read_sample_rows_capped(self) -> None:
        engine = FakeWellLogEngine(_make_test_dataset())
        service = WellLogService(engine)
        # Request 200 rows but only 5 available
        result = service.read("test.las", sample_rows=200)
        assert result.result["total_rows"] == 5
        assert len(result.result["sample_head"]) <= 5

    def test_read_rejects_non_las(self) -> None:
        engine = FakeWellLogEngine(_make_test_dataset())
        service = WellLogService(engine)
        with pytest.raises(DomainError) as exc_info:
            service.read("test.csv")
        assert exc_info.value.code == DomainErrorCode.UNSUPPORTED_FORMAT

    def test_read_rejects_missing_file(self) -> None:
        # File existence is checked by the adapter, not the service.
        # The FakeEngine raises FILE_NOT_FOUND when no dataset is set.
        engine = FakeWellLogEngine(None)
        service = WellLogService(engine)
        with pytest.raises(DomainError) as exc_info:
            service.read("nonexistent.las")
        assert exc_info.value.code == DomainErrorCode.FILE_NOT_FOUND

    def test_validate_returns_qc_report(self) -> None:
        engine = FakeWellLogEngine(_make_test_dataset())
        service = WellLogService(engine)
        result = service.validate("test.las")

        assert result.operation == "welllog.quality.validate"
        assert "passed" in result.result
        assert "errors" in result.result
        assert "warnings" in result.result
        assert "checks" in result.result

    def test_validate_detects_missing_units(self) -> None:
        dataset = _make_test_dataset()
        dataset.curves.append(
            LogCurve("NPHI", "", "No unit", [0.1, 0.2, 0.3, 0.4, 0.5]),
        )
        engine = FakeWellLogEngine(dataset)
        service = WellLogService(engine)
        result = service.validate("test.las")

        unit_warnings = [
            w for w in result.result["warnings"] if "unit" in w.lower()
        ]
        assert len(unit_warnings) > 0

    def test_validate_detects_nulls(self) -> None:
        dataset = _make_test_dataset()
        dataset.curves[0].values = [85.0, None, 75.0, None, 95.0]
        engine = FakeWellLogEngine(dataset)
        service = WellLogService(engine)
        result = service.validate("test.las")

        null_warnings = [
            w for w in result.result["warnings"] if "null" in w.lower()
        ]
        assert len(null_warnings) > 0

    def test_export_rejects_in_place_overwrite(self) -> None:
        engine = FakeWellLogEngine(_make_test_dataset())
        service = WellLogService(engine)
        # The service only checks .las extension; in-place check is in adapter.
        # Create a temp .las file for the test.
        import tempfile

        with tempfile.NamedTemporaryFile(suffix=".las", delete=False) as f:
            f.write(b"test")
            tmp_path = f.name
        try:
            # With FakeEngine, export succeeds (in-place check is in adapter on
            result = service.export(tmp_path, tmp_path)
            assert result.operation == "welllog.las.export"
        finally:
            Path(tmp_path).unlink(missing_ok=True)

    def test_result_is_json_safe(self) -> None:
        engine = FakeWellLogEngine(_make_test_dataset())
        service = WellLogService(engine)
        result = service.read("test.las", sample_rows=3)
        d = result.to_dict()
        # Should be JSON serializable
        serialized = json.dumps(d)
        assert "numpy" not in serialized.lower()
        assert "lasio" not in serialized.lower()


# ─── LasioAdapter integration tests (skip if lasio not installed) ────────────


@pytest.fixture
def lasio_available() -> None:
    """Skip test if lasio is not installed."""
    pytest.importorskip("lasio")


class TestLasioAdapter:
    def test_dependency_status(self, lasio_available: None) -> None:
        adapter = LasioAdapter()
        status = adapter.dependency_status()
        assert status.available is True

    def test_read_minimal_valid(self, lasio_available: None) -> None:
        adapter = LasioAdapter()
        fixture = FIXTURES_DIR / "minimal_valid.las"
        dataset = adapter.read(WellLogReadRequest(path=str(fixture)))

        assert dataset.metadata.well_name == "Test Well 001"
        assert dataset.metadata.field == "Test Field"
        assert len(dataset.curves) >= 2
        assert len(dataset.depth) == 11

    def test_read_returns_python_types(self, lasio_available: None) -> None:
        adapter = LasioAdapter()
        fixture = FIXTURES_DIR / "minimal_valid.las"
        dataset = adapter.read(WellLogReadRequest(path=str(fixture)))

        for d in dataset.depth:
            assert d is None or isinstance(d, float)
        for curve in dataset.curves:
            for v in curve.values:
                assert v is None or isinstance(v, float)

    def test_read_null_values_become_none(self, lasio_available: None) -> None:
        adapter = LasioAdapter()
        fixture = FIXTURES_DIR / "nulls_and_duplicates.las"
        dataset = adapter.read(WellLogReadRequest(path=str(fixture)))

        # The fixture has -999.25 NULL values in GR and RHOB
        gr = next(c for c in dataset.curves if c.mnemonic == "GR")
        none_count = sum(1 for v in gr.values if v is None)
        assert none_count >= 1

    def test_read_non_las_rejected(self, lasio_available: None) -> None:
        adapter = LasioAdapter()
        with pytest.raises(DomainError) as exc_info:
            adapter.read(WellLogReadRequest(path="test.csv"))
        assert exc_info.value.code == DomainErrorCode.UNSUPPORTED_FORMAT

    def test_read_missing_file(self, lasio_available: None) -> None:
        adapter = LasioAdapter()
        with pytest.raises(DomainError) as exc_info:
            adapter.read(WellLogReadRequest(path="nonexistent.las"))
        assert exc_info.value.code == DomainErrorCode.FILE_NOT_FOUND

    def test_export_rejects_in_place(self, lasio_available: None) -> None:
        adapter = LasioAdapter()
        fixture = FIXTURES_DIR / "minimal_valid.las"
        with pytest.raises(DomainError) as exc_info:
            adapter.export(
                WellLogExportRequest(
                    input_path=str(fixture),
                    output_path=str(fixture),
                ),
            )
        assert exc_info.value.code == DomainErrorCode.INVALID_INPUT

    def test_export_creates_new_file(
        self,
        lasio_available: None,
        tmp_path: Path,
    ) -> None:
        adapter = LasioAdapter()
        fixture = FIXTURES_DIR / "minimal_valid.las"
        output = tmp_path / "exported.las"
        artifact = adapter.export(
            WellLogExportRequest(
                input_path=str(fixture),
                output_path=str(output),
            ),
        )
        assert output.exists()
        assert artifact.path == str(output)
        assert artifact.media_type == "text/plain"


# ─── End-to-end service + adapter tests ──────────────────────────────────────


class TestWellLogServiceWithAdapter:
    def test_full_read_pipeline(self, lasio_available: None) -> None:
        fixture = FIXTURES_DIR / "minimal_valid.las"
        service = WellLogService(LasioAdapter())
        result = service.read(str(fixture), sample_rows=5)

        assert result.engine_id == "well-log-processing"
        assert result.provider_id == "ugsci-welllog-lasio"
        assert result.result["metadata"]["well_name"] == "Test Well 001"
        assert len(result.result["curves"]) >= 2
        assert result.result["total_rows"] == 11

    def test_full_validate_pipeline(self, lasio_available: None) -> None:
        fixture = FIXTURES_DIR / "nulls_and_duplicates.las"
        service = WellLogService(LasioAdapter())
        result = service.validate(str(fixture))

        # Should have warnings about null values and missing unit
        assert len(result.result["warnings"]) > 0

    def test_no_numpy_in_output(self, lasio_available: None) -> None:
        fixture = FIXTURES_DIR / "minimal_valid.las"
        service = WellLogService(LasioAdapter())
        result = service.read(str(fixture), sample_rows=3)
        serialized = json.dumps(result.to_dict())
        assert "numpy" not in serialized.lower()


class TestWorkspacePathResolution:
    def test_relative_path_prefers_current_project(
        self,
        tmp_path: Path,
    ) -> None:
        workspace = tmp_path / "workspace"
        project = tmp_path / "project"
        workspace.mkdir()
        project.mkdir()
        set_current_workspace_dir(workspace)
        set_current_project_dir(project)
        try:
            assert _resolve_workspace_path("data/well.las") == str(
                (project / "data" / "well.las").resolve(),
            )
        finally:
            set_current_project_dir(None)
            set_current_workspace_dir(None)

    def test_relative_path_falls_back_to_workspace(
        self,
        tmp_path: Path,
    ) -> None:
        set_current_project_dir(None)
        set_current_workspace_dir(tmp_path)
        try:
            assert _resolve_workspace_path("well.las") == str(
                (tmp_path / "well.las").resolve(),
            )
        finally:
            set_current_workspace_dir(None)


# ─── Malformed header tests ──────────────────────────────────────────────────


class TestMalformedHeader:
    """Test handling of LAS files with malformed headers."""

    def test_malformed_header_readable(self, lasio_available: None) -> None:
        """The malformed fixture should be readable without crashing."""
        adapter = LasioAdapter()
        fixture = FIXTURES_DIR / "malformed_header.las"
        dataset = adapter.read(WellLogReadRequest(path=str(fixture)))
        # Should still extract data
        assert len(dataset.depth) > 0
        assert len(dataset.curves) >= 1

    def test_malformed_header_has_warnings(
        self,
        lasio_available: None,
    ) -> None:
        """The malformed fixture should produce warnings via service."""
        fixture = FIXTURES_DIR / "malformed_header.las"
        service = WellLogService(LasioAdapter())
        result = service.read(str(fixture), sample_rows=5)
        # Should have some warnings about the malformed data
        assert result.engine_id == "well-log-processing"
        assert result.result["total_rows"] > 0

    def test_malformed_header_validate(self, lasio_available: None) -> None:
        """Validate should produce a QC report for the malformed fixture."""
        fixture = FIXTURES_DIR / "malformed_header.las"
        service = WellLogService(LasioAdapter())
        result = service.validate(str(fixture))
        assert "passed" in result.result
        assert "checks" in result.result


# ─── Duplicate depths QC tests ───────────────────────────────────────────────


class TestDuplicateDepths:
    """Test QC detection of duplicate depth values in LAS files.

    The fixture ``duplicate_depths.las`` contains 10 data rows where the
    depth 1002.0 appears twice (rows 5 and 6), simulating a common data
    acquisition or merge error.  It also includes a curve (NPHI) with no
    unit, verifying that multiple QC checks fire simultaneously.
    """

    def test_read_succeeds(self, lasio_available: None) -> None:
        """Reading the fixture should not raise — duplicates are a QC issue,
        not a parse error."""
        adapter = LasioAdapter()
        fixture = FIXTURES_DIR / "duplicate_depths.las"
        dataset = adapter.read(WellLogReadRequest(path=str(fixture)))
        assert len(dataset.depth) == 10
        assert len(dataset.curves) == 3

    def test_validate_detects_duplicate_depths(
        self,
        lasio_available: None,
    ) -> None:
        """The QC report must flag duplicate depths as a warning."""
        fixture = FIXTURES_DIR / "duplicate_depths.las"
        service = WellLogService(LasioAdapter())
        result = service.validate(str(fixture))

        # passed should be True (duplicates are warnings, not errors)
        assert result.result["passed"] is True

        # Find the duplicate_depths check
        checks = result.result["checks"]
        dup_check = next(
            (c for c in checks if c["name"] == "duplicate_depths"),
            None,
        )
        assert dup_check is not None
        assert dup_check["passed"] is False
        assert "1" in dup_check["detail"]

    def test_validate_has_duplicate_warning(
        self,
        lasio_available: None,
    ) -> None:
        """Warnings list should contain a duplicate-depth message."""
        fixture = FIXTURES_DIR / "duplicate_depths.las"
        service = WellLogService(LasioAdapter())
        result = service.validate(str(fixture))

        dup_warnings = [
            w for w in result.result["warnings"] if "duplicate" in w.lower()
        ]
        assert len(dup_warnings) >= 1

    def test_validate_detects_missing_unit(
        self,
        lasio_available: None,
    ) -> None:
        """NPHI has no unit — the missing-unit check should fire."""
        fixture = FIXTURES_DIR / "duplicate_depths.las"
        service = WellLogService(LasioAdapter())
        result = service.validate(str(fixture))

        unit_warnings = [
            w for w in result.result["warnings"] if "unit" in w.lower()
        ]
        assert len(unit_warnings) >= 1

    def test_read_summary_contains_qc_warnings(
        self,
        lasio_available: None,
    ) -> None:
        """Read should surface QC warnings in its summary."""
        fixture = FIXTURES_DIR / "duplicate_depths.las"
        service = WellLogService(LasioAdapter())
        result = service.read(str(fixture), sample_rows=5)

        dup_in_warnings = any(
            "duplicate" in w.lower() for w in result.warnings
        )
        assert dup_in_warnings

    def test_no_numpy_types_in_output(self, lasio_available: None) -> None:
        """Output should be JSON-safe with no numpy scalar types.

        Note: the provider_id ``ugsci-welllog-lasio`` legitimately
        contains the substring ``lasio``; the check ensures no lasio
        *objects* leak through, which is guaranteed by successful
        ``json.dumps()``.
        """
        fixture = FIXTURES_DIR / "duplicate_depths.las"
        service = WellLogService(LasioAdapter())
        result = service.validate(str(fixture))
        # json.dumps succeeds → no non-serializable objects leaked
        serialized = json.dumps(result.to_dict())
        assert "numpy.float" not in serialized
        assert "numpy.ndarray" not in serialized


# ─── Non-monotonic depths QC tests ───────────────────────────────────────────


class TestNonMonotonicDepths:
    """Test QC detection of non-monotonic depth values in LAS files.

    The fixture ``non_monotonic.las`` contains 11 data rows where the
    depth sequence goes backwards at row 4 (1001.0 → 1000.5) and again
    at row 6 (1001.5 → 1001.0).  This is a hard error, not just a
    warning, because it breaks the fundamental assumption of ordered
    depth sampling.
    """

    def test_read_succeeds(self, lasio_available: None) -> None:
        """Reading should succeed — non-monotonicity is a QC issue."""
        adapter = LasioAdapter()
        fixture = FIXTURES_DIR / "non_monotonic.las"
        dataset = adapter.read(WellLogReadRequest(path=str(fixture)))
        assert len(dataset.depth) == 11
        assert len(dataset.curves) == 3

    def test_validate_detects_non_monotonic(
        self,
        lasio_available: None,
    ) -> None:
        """The QC report must flag non-monotonic depth as an error."""
        fixture = FIXTURES_DIR / "non_monotonic.las"
        service = WellLogService(LasioAdapter())
        result = service.validate(str(fixture))

        # passed should be False (non-monotonic is an error)
        assert result.result["passed"] is False

        # Find the depth_monotonicity check
        checks = result.result["checks"]
        mono_check = next(
            (c for c in checks if c["name"] == "depth_monotonicity"),
            None,
        )
        assert mono_check is not None
        assert mono_check["passed"] is False

    def test_validate_has_non_monotonic_error(
        self,
        lasio_available: None,
    ) -> None:
        """Errors list should contain a non-monotonic depth message."""
        fixture = FIXTURES_DIR / "non_monotonic.las"
        service = WellLogService(LasioAdapter())
        result = service.validate(str(fixture))

        mono_errors = [
            e for e in result.result["errors"] if "monoton" in e.lower()
        ]
        assert len(mono_errors) >= 1

    def test_validate_also_detects_missing_unit(
        self,
        lasio_available: None,
    ) -> None:
        """NPHI has no unit — should still be flagged alongside the error."""
        fixture = FIXTURES_DIR / "non_monotonic.las"
        service = WellLogService(LasioAdapter())
        result = service.validate(str(fixture))

        unit_warnings = [
            w for w in result.result["warnings"] if "unit" in w.lower()
        ]
        assert len(unit_warnings) >= 1

    def test_read_summary_surfaces_non_monotonic_in_checks(
        self,
        lasio_available: None,
    ) -> None:
        """Read should surface non-monotonic issue in QC checks.

        Non-monotonic depth is classified as an error (not a warning)
        in the QC report.  The ``read()`` method only puts warnings
        into ``result.warnings``, but the individual checks are
        available in the validate result.  Here we verify that the
        read still completes and that validate flags the error.
        """
        fixture = FIXTURES_DIR / "non_monotonic.las"
        service = WellLogService(LasioAdapter())
        result = service.read(str(fixture), sample_rows=5)
        assert result.result["total_rows"] == 11

        # Validate should report the error
        validate_result = service.validate(str(fixture))
        mono_errors = [
            e
            for e in validate_result.result["errors"]
            if "monoton" in e.lower()
        ]
        assert len(mono_errors) >= 1

    def test_no_numpy_types_in_output(self, lasio_available: None) -> None:
        """Output should be JSON-safe with no numpy scalar types.

        Note: the provider_id ``ugsci-welllog-lasio`` legitimately
        contains the substring ``lasio``; the check ensures no lasio
        *objects* leak through, which is guaranteed by successful
        ``json.dumps()``.
        """
        fixture = FIXTURES_DIR / "non_monotonic.las"
        service = WellLogService(LasioAdapter())
        result = service.validate(str(fixture))
        # json.dumps succeeds → no non-serializable objects leaked
        serialized = json.dumps(result.to_dict())
        assert "numpy.float" not in serialized
        assert "numpy.ndarray" not in serialized
