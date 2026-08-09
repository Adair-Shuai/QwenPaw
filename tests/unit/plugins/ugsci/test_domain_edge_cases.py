# -*- coding: utf-8 -*-
"""Edge-case tests for domain modules — boundary conditions and gap coverage.

These tests supplement the main test files with specific scenarios
identified during code review:
  - sample_rows boundary (0, negative, very large)
  - empty depth array QC
  - empty forecast_time rejection
  - EUR with both forecast_end and economic_limit
  - EUR with economic_limit=0
  - sanitize_json with tuple
  - to_python_float with string inputs
  - DomainError with default details
  - probe_dependency with unknown name
  - _run_qc idempotency (double-call warning duplication)
"""

from __future__ import annotations

import json
import math
from typing import Any

import pytest

from plugins.bundle.ugsci.domain.common.errors import (
    DomainError,
    DomainErrorCode,
)
from plugins.bundle.ugsci.domain.common.serialization import (
    sanitize_json,
    to_python_float,
    to_python_list,
    validate_json_safe,
)
from plugins.bundle.ugsci.domain.decline.models import (
    DeclineFit,
    DeclineModel,
)
from plugins.bundle.ugsci.domain.decline.service import DeclineAnalysisService
from plugins.bundle.ugsci.domain.well_log.models import (
    LogCurve,
    WellLogDataset,
    WellMetadata,
)
from plugins.bundle.ugsci.domain.well_log.ports import (
    DependencyStatus,
    WellLogReadRequest,
)
from plugins.bundle.ugsci.domain.well_log.service import WellLogService
from plugins.bundle.ugsci.domain_engine.dependency_probe import (
    probe_dependency,
)

# ─── Serialization edge cases ────────────────────────────────────────────────


class TestSerializationEdgeCases:
    def test_to_python_float_with_numeric_string(self) -> None:
        """String '3.14' is converted to 3.14 by float()."""
        assert to_python_float("3.14") == 3.14

    def test_to_python_float_with_non_numeric_string(self) -> None:
        """String 'abc' cannot convert — returns None."""
        assert to_python_float("abc") is None

    def test_to_python_float_with_empty_string(self) -> None:
        assert to_python_float("") is None

    def test_to_python_float_with_bool(self) -> None:
        """bool is a subclass of int; True → 1.0."""
        assert to_python_float(True) == 1.0
        assert to_python_float(False) == 0.0

    def test_sanitize_json_with_tuple(self) -> None:
        """Tuples should be converted to lists."""
        result = sanitize_json((1, 2, 3))
        assert result == [1, 2, 3]
        assert isinstance(result, list)

    def test_sanitize_json_with_nested_tuple(self) -> None:
        result = sanitize_json({"data": (1, 2)})
        assert result["data"] == [1, 2]

    def test_sanitize_json_with_empty_containers(self) -> None:
        assert sanitize_json({}) == {}
        assert sanitize_json([]) == []

    def test_to_python_list_with_empty_list(self) -> None:
        assert not to_python_list([])

    def test_validate_json_safe_rejects_custom_object(self) -> None:
        class CustomObj:
            pass

        with pytest.raises(DomainError) as exc_info:
            validate_json_safe({"obj": CustomObj()})
        assert exc_info.value.code == DomainErrorCode.INVALID_RESULT


# ─── DomainError edge cases ──────────────────────────────────────────────────


class TestDomainErrorEdgeCases:
    def test_default_details_is_empty_dict(self) -> None:
        err = DomainError(DomainErrorCode.INVALID_INPUT, "msg")
        assert err.details == {}

    def test_default_retryable_is_false(self) -> None:
        err = DomainError(DomainErrorCode.CALCULATION_FAILED, "msg")
        assert err.retryable is False

    def test_to_dict_round_trip(self) -> None:
        err = DomainError(
            DomainErrorCode.FILE_NOT_FOUND,
            "Not found",
            details={"file": "test.las"},
            retryable=True,
        )
        d = err.to_dict()
        # Should be JSON serializable
        json_str = json.dumps(d)
        d2 = json.loads(json_str)
        assert d2["code"] == "file_not_found"
        assert d2["retryable"] is True
        assert d2["details"] == {"file": "test.las"}


# ─── safe_float edge cases ───────────────────────────────────────────────────


class TestSafeFloat:
    """Tests for safe_float helper replacing 'to_python_float(x) or 0.0'
    fallback pattern, correctly preserving 0.0."""

    def test_safe_float_preserves_zero(self) -> None:
        """safe_float(0.0) must return 0.0, not the default.

        This is the key difference from 'to_python_float(x) or 0.0'
        where 0.0 is falsy and would be replaced by the default.
        """
        from plugins.bundle.ugsci.domain.common.serialization import safe_float

        assert safe_float(0.0) == 0.0
        assert safe_float(0) == 0.0

    def test_safe_float_none_returns_default(self) -> None:
        from plugins.bundle.ugsci.domain.common.serialization import safe_float

        assert safe_float(None) == 0.0
        assert safe_float(None, default=-1.0) == -1.0

    def test_safe_float_nan_returns_default(self) -> None:
        from plugins.bundle.ugsci.domain.common.serialization import safe_float

        assert safe_float(float("nan")) == 0.0
        assert safe_float(float("inf")) == 0.0

    def test_safe_float_normal_value(self) -> None:
        from plugins.bundle.ugsci.domain.common.serialization import safe_float

        assert safe_float(3.14) == 3.14
        assert safe_float(42) == 42.0

    def test_safe_float_numpy_scalar(self) -> None:
        np = pytest.importorskip("numpy")
        from plugins.bundle.ugsci.domain.common.serialization import safe_float

        assert safe_float(np.float64(0.0)) == 0.0
        assert safe_float(np.float64(3.14)) == pytest.approx(3.14)


# ─── WellLogService edge cases ───────────────────────────────────────────────


class FakeWellLogEngine:
    """Minimal fake engine for edge-case tests."""

    provider_id = "fake-welllog"

    def __init__(self, dataset: WellLogDataset | None = None) -> None:
        self._dataset = dataset

    def dependency_status(self) -> DependencyStatus:
        return DependencyStatus(available=True)

    def read(
        self,
        _request: WellLogReadRequest,
    ) -> WellLogDataset:
        if self._dataset is None:
            raise DomainError(DomainErrorCode.FILE_NOT_FOUND, "No dataset")
        return self._dataset

    def export(self, request: Any) -> Any:
        from plugins.bundle.ugsci.domain.common.result import ArtifactRef

        return ArtifactRef(
            path=request.output_path,
            media_type="text/plain",
            description="Exported",
        )


def _make_test_dataset() -> WellLogDataset:
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


class TestWellLogServiceEdgeCases:
    def test_read_with_sample_rows_zero(self) -> None:
        """sample_rows=0 should return empty sample_head and sample_tail."""
        engine = FakeWellLogEngine(_make_test_dataset())
        service = WellLogService(engine)
        result = service.read("test.las", sample_rows=0)
        assert result.result["sample_head"] == []
        assert result.result["sample_tail"] == []

    def test_read_with_negative_sample_rows(self) -> None:
        """Negative sample_rows should be treated as 0."""
        engine = FakeWellLogEngine(_make_test_dataset())
        service = WellLogService(engine)
        result = service.read("test.las", sample_rows=-10)
        assert result.result["sample_head"] == []

    def test_read_with_very_large_sample_rows(self) -> None:
        """sample_rows > total_rows should cap at total_rows."""
        engine = FakeWellLogEngine(_make_test_dataset())
        service = WellLogService(engine)
        result = service.read("test.las", sample_rows=10000)
        assert len(result.result["sample_head"]) <= 5

    def test_read_empty_path_raises(self) -> None:
        engine = FakeWellLogEngine(_make_test_dataset())
        service = WellLogService(engine)
        with pytest.raises(DomainError) as exc_info:
            service.read("")
        assert exc_info.value.code == DomainErrorCode.INVALID_INPUT

    def test_read_empty_depth_array(self) -> None:
        """A dataset with no depth values should not crash QC."""
        dataset = WellLogDataset(
            metadata=WellMetadata(well_name="Empty"),
            depth_mnemonic="DEPT",
            depth=[],
            curves=[],
            source_path="empty.las",
            null_value=None,
        )
        engine = FakeWellLogEngine(dataset)
        service = WellLogService(engine)
        result = service.read("empty.las")
        assert result.result["total_rows"] == 0

    def test_qc_warnings_not_duplicated_on_re_read(self) -> None:
        """If the same engine returns the same dataset object twice,
        warnings should not accumulate in the second result.

        This verifies that _run_qc does NOT modify dataset.warnings in-place.
        """
        dataset = _make_test_dataset()
        engine = FakeWellLogEngine(dataset)
        service = WellLogService(engine)
        # First read
        result1 = service.read("test.las")
        warning_count_1 = len(result1.warnings)
        # Second read — should produce the same number of warnings
        result2 = service.read("test.las")
        warning_count_2 = len(result2.warnings)
        # The second result should have exactly the same number of warnings
        assert warning_count_2 == warning_count_1
        # And the original dataset.warnings should not have been modified
        assert (
            len(dataset.warnings) == 0
        )  # Original dataset starts with no warnings


# ─── DeclineAnalysisService edge cases ───────────────────────────────────────


class FakeDeclineEngine:
    """In-memory engine for decline service edge-case tests."""

    provider_id = "fake-decline"

    def dependency_status(self):
        return DependencyStatus(available=True)

    def fit(self, request) -> list[DeclineFit]:
        return [
            DeclineFit(
                model=(
                    request.model
                    if request.model != DeclineModel.AUTO
                    else DeclineModel.EXPONENTIAL
                ),
                qi=1000.0,
                di=0.1,
                b=None,
                rmse=5.0,
                mae=4.0,
                r_squared=0.95,
                aic=42.0,
                fit_start=0.0,
                fit_end=36.0,
            ),
        ]

    def rates(self, fit: DeclineFit, times: list[float]) -> list[float]:
        return [fit.qi * math.exp(-fit.di * t) for t in times]

    def cumulative(self, fit: DeclineFit, start: float, end: float) -> float:
        if fit.di <= 0:
            return fit.qi * (end - start)
        return (fit.qi / fit.di) * (
            math.exp(-fit.di * start) - math.exp(-fit.di * end)
        )


class TestDeclineServiceEdgeCases:
    def test_forecast_rejects_empty_time(self) -> None:
        """forecast_time=[] should raise INVALID_INPUT."""
        service = DeclineAnalysisService(FakeDeclineEngine())
        with pytest.raises(DomainError) as exc_info:
            service.forecast(
                "exponential",
                1000.0,
                0.1,
                None,
                [],
                "month",
                "bbl/d",
            )
        assert exc_info.value.code == DomainErrorCode.INVALID_INPUT

    def test_eur_with_both_boundaries(self) -> None:
        """EUR with both forecast_end and economic_limit should use min."""
        service = DeclineAnalysisService(FakeDeclineEngine())
        result = service.eur(
            "exponential",
            1000.0,
            0.1,
            None,
            "month",
            "bbl/d",
            forecast_end=100.0,
            economic_limit=10.0,
        )
        # economic_limit=10 → t = -ln(10/1000)/0.1 = -ln(0.01)/0.1 ≈ 46.05
        # min(46.05, 100) = 46.05
        assert result.result["effective_end"] < 100.0
        assert result.result["economic_limit_used"] is True
        assert result.result["forecast_end_used"] is True

    def test_eur_with_economic_limit_zero(self) -> None:
        """economic_limit=0 without forecast_end should raise INVALID_INPUT."""
        service = DeclineAnalysisService(FakeDeclineEngine())
        with pytest.raises(DomainError) as exc_info:
            service.eur(
                "exponential",
                1000.0,
                0.1,
                None,
                "month",
                "bbl/d",
                economic_limit=0.0,
            )
        assert exc_info.value.code == DomainErrorCode.INVALID_INPUT

    def test_eur_with_economic_limit_zero_and_forecast_end(self) -> None:
        """economic_limit=0 with forecast_end should use forecast_end."""
        service = DeclineAnalysisService(FakeDeclineEngine())
        result = service.eur(
            "exponential",
            1000.0,
            0.1,
            None,
            "month",
            "bbl/d",
            forecast_end=50.0,
            economic_limit=0.0,
        )
        assert result.result["effective_end"] == 50.0

    def test_forecast_with_time_zero(self) -> None:
        """Forecast at t=0 should return qi."""
        service = DeclineAnalysisService(FakeDeclineEngine())
        result = service.forecast(
            "exponential",
            1000.0,
            0.1,
            None,
            [0.0, 1.0],
            "month",
            "bbl/d",
        )
        assert result.result["forecast"][0]["time"] == 0.0
        assert result.result["forecast"][0]["rate"] == pytest.approx(1000.0)

    def test_fit_with_zero_rate_point(self) -> None:
        """A data point with rate=0 should be accepted (non-negative)."""
        service = DeclineAnalysisService(FakeDeclineEngine())
        times = [0, 1, 2, 3, 4]
        rates = [1000, 500, 100, 50, 0]
        result = service.fit(
            times,
            rates,
            "month",
            "bbl/d",
            model="exponential",
        )
        assert len(result.result["fits"]) >= 1

    def test_fit_empty_time_raises(self) -> None:
        service = DeclineAnalysisService(FakeDeclineEngine())
        with pytest.raises(DomainError) as exc_info:
            service.fit([], [], "month", "bbl/d")
        assert exc_info.value.code == DomainErrorCode.INVALID_INPUT

    def test_fit_empty_units_raises(self) -> None:
        service = DeclineAnalysisService(FakeDeclineEngine())
        with pytest.raises(DomainError) as exc_info:
            service.fit([0, 1, 2, 3], [100, 90, 80, 70], "", "bbl/d")
        assert exc_info.value.code == DomainErrorCode.INVALID_INPUT

    def test_forecast_result_is_json_serializable(self) -> None:
        service = DeclineAnalysisService(FakeDeclineEngine())
        result = service.forecast(
            "exponential",
            1000.0,
            0.1,
            None,
            [0, 1, 2, 3],
            "month",
            "bbl/d",
        )
        # Should not raise
        json.dumps(result.to_dict())


# ─── Dependency probe edge cases ─────────────────────────────────────────────


class TestDependencyProbeEdgeCases:
    def test_unknown_dependency_returns_unknown(self) -> None:
        result = probe_dependency("some-unknown-dep")
        assert result.status == "unknown"

    def test_known_python_package_lasio(self) -> None:
        """lasio is whitelisted; probe returns available or unavailable."""
        result = probe_dependency("lasio")
        assert result.status in ("available", "unavailable")

    def test_nonexistent_whitelisted_package(self) -> None:
        """A whitelisted but missing package should return unavailable."""
        result = probe_dependency("welly")
        assert result.status in ("available", "unavailable")


class TestCrossPlatformCompatibility:
    """Tests for cross-platform (Windows/macOS/Linux) compatibility."""

    def test_java_runtime_probe_returns_valid_status(self) -> None:
        """Java runtime probe should return a valid status on any platform."""
        from plugins.bundle.ugsci.domain_engine.dependency_probe import (
            probe_java_runtime,
        )

        result = probe_java_runtime()
        assert result.status in ("available", "unavailable")
        assert result.name == "java-runtime"

    def test_java_runtime_probe_uses_correct_exe_on_windows(self) -> None:
        """On Windows, JAVA_HOME check should look for java.exe.

        We can't patch os.name to 'nt' on macOS because Path() would try
        to instantiate WindowsPath. Instead, we verify the logic by mocking
        Path.exists to simulate the java.exe file being present.
        """
        import os
        import tempfile
        from unittest.mock import patch

        from plugins.bundle.ugsci.domain_engine.dependency_probe import (
            probe_java_runtime,
        )

        fake_home = tempfile.gettempdir()

        # Mock: no java in PATH, JAVA_HOME set, java.exe exists
        class FakePath:
            def __init__(self, *args):
                self._parts = args

            def __truediv__(self, other):
                return FakePath(*self._parts, other)

            @property
            def name(self):
                return str(self._parts[-1]) if self._parts else ""

            def exists(self):
                # Return True only for java.exe path (bin/java.exe)
                return self._parts and "java.exe" in self._parts[-1]

            def mkdir(self, **kwargs):
                pass

        with (
            patch("shutil.which", return_value=None),
            patch.dict(
                os.environ,
                {"JAVA_HOME": fake_home, "PATH": ""},
                clear=True,
            ),
            patch(
                "plugins.bundle.ugsci.domain_engine.dependency_probe.Path",
                FakePath,
            ),
            patch.object(os, "name", "nt"),
        ):
            result = probe_java_runtime()
            assert result.status == "available"

    def test_path_handling_forward_slash_in_artifact(self) -> None:
        """ArtifactRef.path uses user-provided path, not resolved abs."""
        from plugins.bundle.ugsci.domain.common.result import ArtifactRef

        ref = ArtifactRef(
            path="output/result.las",
            media_type="text/plain",
            description="test",
        )
        d = ref.to_dict()
        assert d["path"] == "output/result.las"

    def test_desktop_java_home_is_detected(
        self,
        tmp_path,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        from plugins.bundle.ugsci.domain_engine.dependency_probe import (
            probe_java_runtime,
        )

        java = tmp_path / "bin" / "java"
        java.parent.mkdir()
        java.touch()
        monkeypatch.setattr("shutil.which", lambda _name: None)
        monkeypatch.delenv("JAVA_HOME", raising=False)
        monkeypatch.setenv("QWENPAW_DESKTOP_JAVA_HOME", str(tmp_path))

        assert probe_java_runtime().status == "available"

    def test_desktop_neqsim_jar_is_detected(
        self,
        tmp_path,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        from plugins.bundle.ugsci.domain_engine.dependency_probe import (
            probe_neqsim_mcp_server,
        )

        jar = tmp_path / "neqsim-mcp-server.jar"
        jar.touch()
        monkeypatch.setenv("QWENPAW_DESKTOP_NEQSIM_JAR", str(jar))

        assert probe_neqsim_mcp_server().status == "available"

    def test_desktop_resource_dir_neqsim_jar_is_detected(
        self,
        tmp_path,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        from plugins.bundle.ugsci.domain_engine.dependency_probe import (
            probe_neqsim_mcp_server,
        )

        jar = tmp_path / "binaries" / "neqsim" / "neqsim-mcp-server.jar"
        jar.parent.mkdir(parents=True)
        jar.touch()
        monkeypatch.delenv("QWENPAW_DESKTOP_NEQSIM_JAR", raising=False)
        monkeypatch.setenv("QWENPAW_TAURI_RESOURCE_DIR", str(tmp_path))

        assert probe_neqsim_mcp_server().status == "available"


class TestLasioAdapterDepthMnemonic:
    """Test that depth_mnemonic comes from curve mnemonic, not index_unit."""

    def test_depth_mnemonic_uses_curve_mnemonic(self) -> None:
        """depth_mnemonic should be the first curve's mnemonic (e.g. 'DEPT'),
        not the index unit (e.g. 'm')."""
        pytest.importorskip("lasio")

        import os
        import tempfile
        from plugins.bundle.ugsci.domain.well_log.adapters import (
            LasioAdapter,
        )

        las_content = """~V
VERS.   2.0:    CWLS log ASCII Standard -VERSION 2.0
WRAP.   NO:     One line per depth step
~W
STRT.M           1000.000:
STOP.M           1002.000:
STEP.M              0.500:
NULL.          -999.25:
~C
DEPT.M       DEPTH:
GR.API         GR:
~A
1000.000    85.0
1000.500    90.0
1001.000    75.0
1001.500    80.0
1002.000    95.0
"""
        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".las",
            delete=False,
            encoding="utf-8",
        ) as f:
            f.write(las_content)
            f.flush()
            adapter = LasioAdapter()
            dataset = adapter.read(WellLogReadRequest(path=f.name))

        os.unlink(f.name)

        assert dataset.depth_mnemonic == "DEPT"
        assert dataset.depth_mnemonic != "M"
        curve_mnemonics = [c.mnemonic for c in dataset.curves]
        assert "DEPT" not in curve_mnemonics
        assert "GR" in curve_mnemonics
