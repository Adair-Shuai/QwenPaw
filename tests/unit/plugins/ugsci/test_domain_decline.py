# -*- coding: utf-8 -*-
"""Tests for the decline analysis domain."""

# pylint: disable=redefined-outer-name,unused-argument

from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any

import pytest

from plugins.bundle.ugsci.domain.common.errors import (
    DomainError,
    DomainErrorCode,
)
from plugins.bundle.ugsci.domain.decline.models import (
    DeclineFit,
    DeclineFitRequest,
    DeclineModel,
    ProductionPoint,
)
from plugins.bundle.ugsci.domain.decline.service import DeclineAnalysisService
from plugins.bundle.ugsci.domain.decline.adapters.scipy_arps import (
    ScipyArpsAdapter,
)

FIXTURES_DIR = Path(__file__).parent / "fixtures"


# ─── Fake Engine for Service tests ───────────────────────────────────────


class FakeDeclineEngine:
    """In-memory engine for testing DeclineAnalysisService without scipy."""

    provider_id = "fake-decline"

    def dependency_status(self):
        from plugins.bundle.ugsci.domain.well_log.ports import DependencyStatus

        return DependencyStatus(available=True)

    def fit(self, request) -> list[DeclineFit]:
        # Return a single fake fit
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


# ─── Service tests ───────────────────────────────────────────────────────


class TestDeclineService:
    def test_fit_basic(self) -> None:
        service = DeclineAnalysisService(FakeDeclineEngine())
        times = [0, 1, 2, 3, 4, 5]
        rates = [1000, 900, 810, 729, 656, 590]
        result = service.fit(
            times,
            rates,
            "month",
            "bbl/d",
            model="exponential",
        )

        assert result.engine_id == "decline-analysis"
        assert result.operation == "production.decline.fit"
        assert len(result.result["fits"]) >= 1

    def test_fit_auto_returns_recommendation(self) -> None:
        service = DeclineAnalysisService(FakeDeclineEngine())
        times = list(range(10))
        rates = [1000 * math.exp(-0.1 * t) for t in times]
        result = service.fit(times, rates, "month", "bbl/d", model="auto")

        assert result.result["is_auto"] is True
        assert result.result["recommended"] is not None
        assert (
            len(result.result["warnings"]) > 0
        )  # Should warn about recommendation

    def test_fit_rejects_too_few_points(self) -> None:
        service = DeclineAnalysisService(FakeDeclineEngine())
        with pytest.raises(DomainError) as exc_info:
            service.fit([0, 1, 2], [100, 90, 80], "month", "bbl/d")
        assert exc_info.value.code == DomainErrorCode.INVALID_INPUT

    def test_fit_rejects_negative_rate(self) -> None:
        service = DeclineAnalysisService(FakeDeclineEngine())
        with pytest.raises(DomainError) as exc_info:
            service.fit(
                [0, 1, 2, 3, 4],
                [100, 90, -10, 70, 60],
                "month",
                "bbl/d",
            )
        assert exc_info.value.code == DomainErrorCode.INVALID_INPUT

    def test_fit_rejects_mismatched_length(self) -> None:
        service = DeclineAnalysisService(FakeDeclineEngine())
        with pytest.raises(DomainError) as exc_info:
            service.fit([0, 1, 2, 3, 4], [100, 90, 80], "month", "bbl/d")
        assert exc_info.value.code == DomainErrorCode.INVALID_INPUT

    def test_fit_rejects_unknown_model(self) -> None:
        service = DeclineAnalysisService(FakeDeclineEngine())
        times = list(range(6))
        rates = [1000 * math.exp(-0.1 * t) for t in times]
        with pytest.raises(DomainError) as exc_info:
            service.fit(times, rates, "month", "bbl/d", model="unknown")
        assert exc_info.value.code == DomainErrorCode.INVALID_INPUT

    def test_forecast_basic(self) -> None:
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
        assert result.operation == "production.decline.forecast"
        assert len(result.result["forecast"]) == 4
        # Rate should decrease over time
        rates = [f["rate"] for f in result.result["forecast"]]
        assert rates[0] > rates[1] > rates[2] > rates[3]

    def test_forecast_rejects_auto(self) -> None:
        service = DeclineAnalysisService(FakeDeclineEngine())
        with pytest.raises(DomainError) as exc_info:
            service.forecast(
                "auto",
                1000.0,
                0.1,
                None,
                [0, 1],
                "month",
                "bbl/d",
            )
        assert exc_info.value.code == DomainErrorCode.INVALID_INPUT

    def test_forecast_rejects_negative_qi(self) -> None:
        service = DeclineAnalysisService(FakeDeclineEngine())
        with pytest.raises(DomainError) as exc_info:
            service.forecast(
                "exponential",
                -100,
                0.1,
                None,
                [0, 1],
                "month",
                "bbl/d",
            )
        assert exc_info.value.code == DomainErrorCode.INVALID_INPUT

    def test_forecast_rejects_negative_time(self) -> None:
        service = DeclineAnalysisService(FakeDeclineEngine())
        with pytest.raises(DomainError) as exc_info:
            service.forecast(
                "exponential",
                100,
                0.1,
                None,
                [-1, 0],
                "month",
                "bbl/d",
            )
        assert exc_info.value.code == DomainErrorCode.INVALID_INPUT

    def test_eur_with_forecast_end(self) -> None:
        service = DeclineAnalysisService(FakeDeclineEngine())
        result = service.eur(
            "exponential",
            1000.0,
            0.1,
            None,
            "month",
            "bbl/d",
            forecast_end=60.0,
        )
        assert result.operation == "production.decline.eur"
        assert result.result["cumulative_production"] > 0
        assert result.result["effective_end"] == 60.0

    def test_eur_converts_month_axis_for_daily_rate(self) -> None:
        service = DeclineAnalysisService(FakeDeclineEngine())
        result = service.eur(
            "exponential",
            1000.0,
            0.1,
            None,
            "month",
            "bbl/d",
            forecast_end=12.0,
        )
        raw_month_integral = (1000.0 / 0.1) * (1 - math.exp(-1.2))
        assert result.result["cumulative_production"] == pytest.approx(
            raw_month_integral * 30.4375,
        )
        assert result.units["cumulative"] == "bbl"

    def test_eur_rejects_rate_without_time_denominator(self) -> None:
        service = DeclineAnalysisService(FakeDeclineEngine())
        with pytest.raises(DomainError) as exc_info:
            service.eur(
                "exponential",
                1000.0,
                0.1,
                None,
                "month",
                "bbl",
                forecast_end=12.0,
            )
        assert exc_info.value.code == DomainErrorCode.INVALID_INPUT

    def test_eur_with_economic_limit(self) -> None:
        service = DeclineAnalysisService(FakeDeclineEngine())
        result = service.eur(
            "exponential",
            1000.0,
            0.1,
            None,
            "month",
            "bbl/d",
            economic_limit=10.0,
        )
        assert result.result["cumulative_production"] > 0
        assert result.result["economic_limit_used"] is True

    def test_eur_rejects_no_boundary(self) -> None:
        service = DeclineAnalysisService(FakeDeclineEngine())
        with pytest.raises(DomainError) as exc_info:
            service.eur("exponential", 1000.0, 0.1, None, "month", "bbl/d")
        assert exc_info.value.code == DomainErrorCode.INVALID_INPUT

    def test_eur_rejects_econ_limit_above_qi(self) -> None:
        service = DeclineAnalysisService(FakeDeclineEngine())
        with pytest.raises(DomainError) as exc_info:
            service.eur(
                "exponential",
                100.0,
                0.1,
                None,
                "month",
                "bbl/d",
                economic_limit=200.0,
            )
        assert exc_info.value.code == DomainErrorCode.INVALID_INPUT

    def test_result_is_json_safe(self) -> None:
        service = DeclineAnalysisService(FakeDeclineEngine())
        times = [0, 1, 2, 3, 4, 5]
        rates = [1000 * math.exp(-0.1 * t) for t in times]
        result = service.fit(
            times,
            rates,
            "month",
            "bbl/d",
            model="exponential",
        )
        serialized = json.dumps(result.to_dict())
        assert "numpy" not in serialized.lower()
        assert "scipy" not in serialized.lower()

    def test_cumulative_non_negative(self) -> None:
        service = DeclineAnalysisService(FakeDeclineEngine())
        result = service.eur(
            "exponential",
            1000.0,
            0.1,
            None,
            "month",
            "bbl/d",
            forecast_end=100.0,
        )
        assert result.result["cumulative_production"] >= 0


# ─── ScipyArpsAdapter integration tests (skip if scipy) ────────────────────


@pytest.fixture
def scipy_available() -> None:
    pytest.importorskip("numpy")
    pytest.importorskip("scipy")


class TestScipyArpsAdapter:
    def test_dependency_status(self, scipy_available: None) -> None:
        adapter = ScipyArpsAdapter()
        status = adapter.dependency_status()
        assert status.available is True

    def test_fit_exponential_recovery(self, scipy_available: None) -> None:
        """Recover known exponential parameters from synthetic data."""
        adapter = ScipyArpsAdapter()
        qi_true = 1000.0
        di_true = 0.12
        times = [float(t) for t in range(0, 37, 3)]
        rates = [qi_true * math.exp(-di_true * t) for t in times]

        fits = adapter.fit(
            _make_fit_request(
                times,
                rates,
                DeclineModel.EXPONENTIAL,
            ),
        )
        assert len(fits) == 1
        fit = fits[0]
        assert fit.model == DeclineModel.EXPONENTIAL
        assert fit.qi == pytest.approx(qi_true, rel=1e-3)
        assert fit.di == pytest.approx(di_true, rel=1e-3)
        assert fit.r_squared > 0.99

    def test_fit_harmonic_recovery(self, scipy_available: None) -> None:
        adapter = ScipyArpsAdapter()
        qi_true = 1000.0
        di_true = 0.1
        times = [float(t) for t in range(0, 37, 3)]
        rates = [qi_true / (1 + di_true * t) for t in times]

        fits = adapter.fit(
            _make_fit_request(
                times,
                rates,
                DeclineModel.HARMONIC,
            ),
        )
        assert len(fits) == 1
        fit = fits[0]
        assert fit.model == DeclineModel.HARMONIC
        assert fit.qi == pytest.approx(qi_true, rel=1e-3)
        assert fit.di == pytest.approx(di_true, rel=1e-3)

    def test_fit_hyperbolic_recovery(self, scipy_available: None) -> None:
        adapter = ScipyArpsAdapter()
        qi_true = 1000.0
        di_true = 0.12
        b_true = 0.6
        times = [float(t) for t in range(0, 37, 3)]
        rates = [
            qi_true / (1 + b_true * di_true * t) ** (1 / b_true) for t in times
        ]

        fits = adapter.fit(
            _make_fit_request(
                times,
                rates,
                DeclineModel.HYPERBOLIC,
            ),
        )
        assert len(fits) == 1
        fit = fits[0]
        assert fit.model == DeclineModel.HYPERBOLIC
        assert fit.qi == pytest.approx(qi_true, rel=1e-2)
        assert fit.di == pytest.approx(di_true, rel=1e-2)
        assert fit.b == pytest.approx(b_true, rel=1e-2)

    def test_auto_fits_all_candidates(self, scipy_available: None) -> None:
        adapter = ScipyArpsAdapter()
        qi_true = 1000.0
        di_true = 0.12
        b_true = 0.6
        times = [float(t) for t in range(0, 37, 3)]
        rates = [
            qi_true / (1 + b_true * di_true * t) ** (1 / b_true) for t in times
        ]

        fits = adapter.fit(
            _make_fit_request(
                times,
                rates,
                DeclineModel.AUTO,
            ),
        )
        # Should get at least 2 successful fits
        assert len(fits) >= 2
        models = {f.model for f in fits}
        assert DeclineModel.HYPERBOLIC in models

    def test_auto_recommends_exact_exponential_fit(
        self,
        scipy_available: None,
    ) -> None:
        service = DeclineAnalysisService(ScipyArpsAdapter())
        times = [float(t) for t in range(10)]
        rates = [1000.0 * math.exp(-0.1 * t) for t in times]

        result = service.fit(times, rates, "month", "bbl/d", model="auto")

        assert result.result["recommended"]["model"] == "exponential"
        exponential = next(
            fit
            for fit in result.result["fits"]
            if fit["model"] == "exponential"
        )
        assert exponential["aic"] is not None

    def test_one_model_failure_doesnt_block_others(
        self,
        scipy_available: None,
    ) -> None:
        """If one model fails, others should still succeed."""
        adapter = ScipyArpsAdapter()
        # Use data that's clearly exponential — harmonic might struggle
        qi_true = 1000.0
        di_true = 0.5  # steep decline
        times = [float(t) for t in range(0, 20, 2)]
        rates = [qi_true * math.exp(-di_true * t) for t in times]

        fits = adapter.fit(
            _make_fit_request(
                times,
                rates,
                DeclineModel.AUTO,
            ),
        )
        # At least exponential should succeed
        assert len(fits) >= 1

    def test_rates_monotonic_decreasing(self, scipy_available: None) -> None:
        adapter = ScipyArpsAdapter()
        fit = DeclineFit(
            model=DeclineModel.EXPONENTIAL,
            qi=1000.0,
            di=0.1,
            b=None,
            rmse=0,
            mae=0,
            r_squared=1,
            aic=None,
            fit_start=0,
            fit_end=36,
        )
        times = [float(t) for t in range(0, 50, 5)]
        rates = adapter.rates(fit, times)
        for i in range(len(rates) - 1):
            assert rates[i] >= rates[i + 1] - 1e-10

    def test_cumulative_non_negative_and_increasing(
        self,
        scipy_available: None,
    ) -> None:
        adapter = ScipyArpsAdapter()
        fit = DeclineFit(
            model=DeclineModel.HYPERBOLIC,
            qi=1000.0,
            di=0.12,
            b=0.6,
            rmse=0,
            mae=0,
            r_squared=1,
            aic=None,
            fit_start=0,
            fit_end=36,
        )
        c1 = adapter.cumulative(fit, 0, 12)
        c2 = adapter.cumulative(fit, 0, 24)
        c3 = adapter.cumulative(fit, 0, 36)
        assert c1 > 0
        assert c2 > c1
        assert c3 > c2

    def test_no_numpy_in_output(self, scipy_available: None) -> None:
        adapter = ScipyArpsAdapter()
        times = [float(t) for t in range(0, 37, 3)]
        rates = [1000 * math.exp(-0.12 * t) for t in times]
        fits = adapter.fit(
            _make_fit_request(times, rates, DeclineModel.EXPONENTIAL),
        )
        for fit in fits:
            assert isinstance(fit.qi, float)
            assert isinstance(fit.di, float)
            assert isinstance(fit.rmse, float)


def _make_fit_request(
    times: list[float],
    rates: list[float],
    model: DeclineModel,
):
    points = [ProductionPoint(time=t, rate=r) for t, r in zip(times, rates)]
    return DeclineFitRequest(
        points=points,
        time_unit="month",
        rate_unit="bbl/d",
        model=model,
    )


def _load_fixture(name: str) -> dict[str, Any]:
    """Load a JSON fixture from the fixtures directory."""
    path = FIXTURES_DIR / name
    with open(path, encoding="utf-8") as f:
        return json.load(f)


# ─── Golden-data tests (fixture-based parameter recovery) ────────────────────


@pytest.fixture(scope="class")
def hyperbolic_fixture() -> dict[str, Any]:
    return _load_fixture("decline_hyperbolic.json")


class TestDeclineGoldenData:
    """Verify that the adapter recovers known parameters from
    fixture-generated synthetic data.

    The fixture ``decline_hyperbolic.json`` contains production data
    generated from the Arps hyperbolic formula with known parameters:
    qi=1000, di=0.12, b=0.6.  The fitter should recover these within
    tight tolerances.
    """

    def test_hyperbolic_parameter_recovery(
        self,
        scipy_available: None,
        hyperbolic_fixture,
    ) -> None:
        """Recover qi, di, b from fixture data within 1% relative error."""
        adapter = ScipyArpsAdapter()
        fixture = hyperbolic_fixture
        points = [
            ProductionPoint(time=p["time"], rate=p["rate"])
            for p in fixture["points"]
        ]
        request = DeclineFitRequest(
            points=points,
            time_unit=fixture["time_unit"],
            rate_unit=fixture["rate_unit"],
            model=DeclineModel.HYPERBOLIC,
        )
        fits = adapter.fit(request)
        assert len(fits) == 1
        fit = fits[0]

        assert fit.model == DeclineModel.HYPERBOLIC
        assert fit.qi == pytest.approx(fixture["qi"], rel=1e-2)
        assert fit.di == pytest.approx(fixture["di"], rel=1e-2)
        assert fit.b == pytest.approx(fixture["b"], rel=1e-2)
        assert fit.r_squared > 0.99

    def test_hyperbolic_forecast_matches_fixture(
        self,
        scipy_available: None,
        hyperbolic_fixture,
    ) -> None:
        """Forecast rates at the fixture time points should match within
        rounding tolerance (2 decimal places)."""
        adapter = ScipyArpsAdapter()
        fixture = hyperbolic_fixture
        points = [
            ProductionPoint(time=p["time"], rate=p["rate"])
            for p in fixture["points"]
        ]
        request = DeclineFitRequest(
            points=points,
            time_unit=fixture["time_unit"],
            rate_unit=fixture["rate_unit"],
            model=DeclineModel.HYPERBOLIC,
        )
        fits = adapter.fit(request)
        assert len(fits) == 1
        fit = fits[0]

        times = [p["time"] for p in fixture["points"]]
        expected_rates = [p["rate"] for p in fixture["points"]]
        actual_rates = adapter.rates(fit, times)

        for t, expected, actual in zip(times, expected_rates, actual_rates):
            assert actual == pytest.approx(
                expected,
                abs=0.5,
            ), f"Rate mismatch at t={t}: expected≈{expected}, got {actual}"

    def test_hyperbolic_cumulative_increasing(
        self,
        scipy_available: None,
        hyperbolic_fixture,
    ) -> None:
        """Cumulative production should be positive and increasing over
        the fixture time range."""
        adapter = ScipyArpsAdapter()
        fixture = hyperbolic_fixture
        points = [
            ProductionPoint(time=p["time"], rate=p["rate"])
            for p in fixture["points"]
        ]
        request = DeclineFitRequest(
            points=points,
            time_unit=fixture["time_unit"],
            rate_unit=fixture["rate_unit"],
            model=DeclineModel.HYPERBOLIC,
        )
        fits = adapter.fit(request)
        assert len(fits) == 1
        fit = fits[0]

        cumulative_values = [
            adapter.cumulative(fit, 0.0, t) for t in [12.0, 24.0, 36.0]
        ]
        for c in cumulative_values:
            assert c > 0
        assert (
            cumulative_values[0] < cumulative_values[1] < cumulative_values[2]
        )

    def test_service_golden_data_round_trip(
        self,
        scipy_available: None,
        hyperbolic_fixture,
    ) -> None:
        """End-to-end: service.fit → service.forecast → service.eur all
        succeed and return JSON-safe results."""
        adapter = ScipyArpsAdapter()
        service = DeclineAnalysisService(adapter)
        fixture = hyperbolic_fixture

        times = [p["time"] for p in fixture["points"]]
        rates = [p["rate"] for p in fixture["points"]]

        # Fit
        fit_result = service.fit(
            times,
            rates,
            fixture["time_unit"],
            fixture["rate_unit"],
            model="hyperbolic",
        )
        assert fit_result.result["is_auto"] is False
        assert len(fit_result.result["fits"]) == 1
        fit_data = fit_result.result["fits"][0]
        assert fit_data["qi"] == pytest.approx(fixture["qi"], rel=1e-2)
        assert fit_data["b"] == pytest.approx(fixture["b"], rel=1e-2)

        # Forecast
        forecast_times = [float(t) for t in range(0, 50, 5)]
        forecast_result = service.forecast(
            "hyperbolic",
            fit_data["qi"],
            fit_data["di"],
            fit_data["b"],
            forecast_times,
            fixture["time_unit"],
            fixture["rate_unit"],
        )
        assert len(forecast_result.result["forecast"]) == len(forecast_times)

        # EUR
        eur_result = service.eur(
            "hyperbolic",
            fit_data["qi"],
            fit_data["di"],
            fit_data["b"],
            fixture["time_unit"],
            fixture["rate_unit"],
            forecast_end=60.0,
        )
        assert eur_result.result["cumulative_production"] > 0

        # JSON-safe: no numpy scalar types in serialized output.
        # Note: provider_id ``ugsci-decline-scipy`` legitimately contains
        # the substring ``scipy``; we check for numpy object type names
        # instead of the broad substring.
        for result in (fit_result, forecast_result, eur_result):
            serialized = json.dumps(result.to_dict())
            assert "numpy.float" not in serialized
            assert "numpy.ndarray" not in serialized

    def test_auto_fits_golden_data(
        self,
        scipy_available: None,
        hyperbolic_fixture,
    ) -> None:
        """AUTO model on golden data should produce hyperbolic as the
        best candidate (lowest AIC)."""
        adapter = ScipyArpsAdapter()
        fixture = hyperbolic_fixture
        points = [
            ProductionPoint(time=p["time"], rate=p["rate"])
            for p in fixture["points"]
        ]
        request = DeclineFitRequest(
            points=points,
            time_unit=fixture["time_unit"],
            rate_unit=fixture["rate_unit"],
            model=DeclineModel.AUTO,
        )
        fits = adapter.fit(request)
        assert len(fits) >= 2

        # Hyperbolic should have the best (lowest) AIC
        fits_with_aic = [f for f in fits if f.aic is not None]
        assert len(fits_with_aic) >= 2
        best = min(fits_with_aic, key=lambda f: f.aic)
        assert best.model == DeclineModel.HYPERBOLIC


# ─── Noisy parameter recovery tests (§16.2: fixed-seed light noise) ──────────


class TestDeclineNoisyRecovery:
    """Verify parameter recovery from noisy synthetic data.

    Per the implementation plan §16.2, the test suite must cover:

    > 固定种子轻噪声参数恢复

    We use the same hyperbolic parameters as the golden-data fixture
    (qi=1000, di=0.12, b=0.6, t=0..36 month), add ±2 % multiplicative
    Gaussian noise with a fixed seed, and verify:

    1. Parameters recovered within 5 % relative error.
    2. R² > 0.95 (noise degrades fit but not catastrophically).
    3. Forecast curve is monotonically non-increasing.
    4. Cumulative production is non-negative and increases over time.
    5. Output contains no numpy/scipy types.
    """

    # ── Noise generation ──────────────────────────────────────────────

    @staticmethod
    def _generate_noisy_data(
        qi: float = 1000.0,
        di: float = 0.12,
        b: float = 0.6,
        seed: int = 42,
        noise_pct: float = 0.02,
    ) -> tuple[list[float], list[float]]:
        """Generate hyperbolic decline data with fixed-seed noise.

        Returns (times, noisy_rates) as plain Python lists.
        """
        import numpy as np

        rng = np.random.default_rng(seed)
        times = [float(t) for t in range(0, 37, 3)]
        clean_rates = [qi / (1 + b * di * t) ** (1 / b) for t in times]
        noise = rng.normal(1.0, noise_pct, size=len(times))
        noisy_rates = [float(r * n) for r, n in zip(clean_rates, noise)]
        # Ensure no negative rates
        noisy_rates = [max(r, 0.0) for r in noisy_rates]
        return times, noisy_rates

    # ── Tests ──────────────────────────────────────────────────────────

    def test_noisy_parameter_recovery(self, scipy_available: None) -> None:
        """Recover qi, di, b from noisy data within 5 % relative error."""
        adapter = ScipyArpsAdapter()
        qi_true, di_true, b_true = 1000.0, 0.12, 0.6
        times, rates = self._generate_noisy_data(
            qi=qi_true,
            di=di_true,
            b=b_true,
            seed=42,
            noise_pct=0.02,
        )

        request = _make_fit_request(times, rates, DeclineModel.HYPERBOLIC)
        fits = adapter.fit(request)
        assert len(fits) == 1
        fit = fits[0]

        # Parameters within 5 % relative error
        assert fit.qi == pytest.approx(qi_true, rel=5e-2)
        assert fit.di == pytest.approx(di_true, rel=5e-2)
        assert fit.b == pytest.approx(b_true, rel=5e-2)

        # Fit quality: noise degrades R² but should still be high
        assert fit.r_squared > 0.95

    def test_noisy_forecast_monotonic_non_increasing(
        self,
        scipy_available: None,
    ) -> None:
        """Forecast rates from noisy-data fit must be monotonically
        non-increasing (within floating-point tolerance)."""
        adapter = ScipyArpsAdapter()
        qi_true, di_true, b_true = 1000.0, 0.12, 0.6
        times, rates = self._generate_noisy_data(
            qi=qi_true,
            di=di_true,
            b=b_true,
            seed=42,
            noise_pct=0.02,
        )

        request = _make_fit_request(times, rates, DeclineModel.HYPERBOLIC)
        fits = adapter.fit(request)
        assert len(fits) == 1
        fit = fits[0]

        forecast_times = [float(t) for t in range(0, 100, 5)]
        forecast_rates = adapter.rates(fit, forecast_times)

        for i in range(len(forecast_rates) - 1):
            assert forecast_rates[i] >= forecast_rates[i + 1] - 1e-10, (
                f"Rate increased from t={forecast_times[i]} to "
                f"t={forecast_times[i + 1]}: "
                f"{forecast_rates[i]} -> {forecast_rates[i + 1]}"
            )

    def test_noisy_cumulative_non_negative_and_increasing(
        self,
        scipy_available: None,
    ) -> None:
        """Cumulative production from noisy-data fit must be positive
        and strictly increasing over the fixture time range."""
        adapter = ScipyArpsAdapter()
        qi_true, di_true, b_true = 1000.0, 0.12, 0.6
        times, rates = self._generate_noisy_data(
            qi=qi_true,
            di=di_true,
            b=b_true,
            seed=42,
            noise_pct=0.02,
        )

        request = _make_fit_request(times, rates, DeclineModel.HYPERBOLIC)
        fits = adapter.fit(request)
        assert len(fits) == 1
        fit = fits[0]

        cumulative_values = [
            adapter.cumulative(fit, 0.0, t) for t in [12.0, 24.0, 36.0, 48.0]
        ]
        for c in cumulative_values:
            assert c > 0
        for i in range(len(cumulative_values) - 1):
            assert cumulative_values[i] < cumulative_values[i + 1]

    def test_noisy_fit_output_no_numpy_types(
        self,
        scipy_available: None,
    ) -> None:
        """All numeric outputs must be plain Python floats, not numpy
        scalars."""
        adapter = ScipyArpsAdapter()
        qi_true, di_true, b_true = 1000.0, 0.12, 0.6
        times, rates = self._generate_noisy_data(
            qi=qi_true,
            di=di_true,
            b=b_true,
            seed=42,
            noise_pct=0.02,
        )

        request = _make_fit_request(times, rates, DeclineModel.HYPERBOLIC)
        fits = adapter.fit(request)
        for fit in fits:
            assert isinstance(fit.qi, float)
            assert isinstance(fit.di, float)
            assert isinstance(fit.rmse, float)
            assert isinstance(fit.mae, float)
            assert isinstance(fit.r_squared, float)

    def test_noisy_service_round_trip(self, scipy_available: None) -> None:
        """End-to-end: service.fit → service.forecast → service.eur all
        succeed on noisy data and return JSON-safe results."""
        adapter = ScipyArpsAdapter()
        service = DeclineAnalysisService(adapter)
        qi_true, di_true, b_true = 1000.0, 0.12, 0.6
        times, rates = self._generate_noisy_data(
            qi=qi_true,
            di=di_true,
            b=b_true,
            seed=42,
            noise_pct=0.02,
        )

        # Fit
        fit_result = service.fit(
            times,
            rates,
            "month",
            "bbl/d",
            model="hyperbolic",
        )
        assert fit_result.result["is_auto"] is False
        assert len(fit_result.result["fits"]) == 1
        fit_data = fit_result.result["fits"][0]
        assert fit_data["qi"] == pytest.approx(qi_true, rel=5e-2)
        assert fit_data["b"] == pytest.approx(b_true, rel=5e-2)

        # Forecast
        forecast_times = [float(t) for t in range(0, 50, 5)]
        forecast_result = service.forecast(
            "hyperbolic",
            fit_data["qi"],
            fit_data["di"],
            fit_data["b"],
            forecast_times,
            "month",
            "bbl/d",
        )
        assert len(forecast_result.result["forecast"]) == len(forecast_times)

        # EUR
        eur_result = service.eur(
            "hyperbolic",
            fit_data["qi"],
            fit_data["di"],
            fit_data["b"],
            "month",
            "bbl/d",
            forecast_end=60.0,
        )
        assert eur_result.result["cumulative_production"] > 0

        # JSON-safe: no numpy scalar types in serialized output.
        for result in (fit_result, forecast_result, eur_result):
            serialized = json.dumps(result.to_dict())
            assert "numpy.float" not in serialized
            assert "numpy.ndarray" not in serialized

    def test_different_seed_still_recovers(
        self,
        scipy_available: None,
    ) -> None:
        """A different fixed seed should also recover parameters within
        15 % — this rules out seed-specific lucky alignment.

        With only 13 data points and 2 % multiplicative noise, ``di`` and
        ``b`` can deviate more than 5 % from the true value for certain
        seeds because the three hyperbolic parameters are correlated and
        the noise affects the optimizer's ability to distinguish between
        them.  A 15 % tolerance is realistic for this data size and noise
        level; the key quality gate is R² > 0.95, which confirms the fit
        is still physically meaningful.
        """
        adapter = ScipyArpsAdapter()
        qi_true, di_true, b_true = 1000.0, 0.12, 0.6

        for seed in [123, 456, 789]:
            times, rates = self._generate_noisy_data(
                qi=qi_true,
                di=di_true,
                b=b_true,
                seed=seed,
                noise_pct=0.02,
            )
            request = _make_fit_request(times, rates, DeclineModel.HYPERBOLIC)
            fits = adapter.fit(request)
            assert len(fits) == 1
            fit = fits[0]
            assert fit.qi == pytest.approx(
                qi_true,
                rel=1.5e-1,
            ), f"Seed {seed}: qi={fit.qi} vs true={qi_true}"
            assert fit.di == pytest.approx(
                di_true,
                rel=1.5e-1,
            ), f"Seed {seed}: di={fit.di} vs true={di_true}"
            assert fit.b == pytest.approx(
                b_true,
                rel=1.5e-1,
            ), f"Seed {seed}: b={fit.b} vs true={b_true}"
            # R² should still be high despite noise
            assert (
                fit.r_squared > 0.95
            ), f"Seed {seed}: r_squared={fit.r_squared} < 0.95"
