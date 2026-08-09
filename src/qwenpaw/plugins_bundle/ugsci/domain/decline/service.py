# -*- coding: utf-8 -*-
"""DeclineAnalysisService — domain rules, candidate comparison, and forecasting.

The service layer owns input validation, candidate model comparison (for
``model=auto``), forecasting, and EUR computation.  It depends on the
``DeclineEngine`` protocol, not on any concrete adapter.
"""

from __future__ import annotations

import math
import logging
from typing import Any

from ..common.errors import DomainError, DomainErrorCode
from ..common.result import DomainResult
from ..common.serialization import sanitize_json, safe_float
from .models import DeclineFit, DeclineFitRequest, DeclineModel, ProductionPoint
from .ports import DeclineEngine

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.domain.decline.service")

ENGINE_ID = "decline-analysis"
OPERATION_FIT = "production.decline.fit"
OPERATION_FORECAST = "production.decline.forecast"
OPERATION_EUR = "production.decline.eur"

MIN_POINTS = 4

_SECONDS_PER_TIME_UNIT = {
    "s": 1.0,
    "sec": 1.0,
    "second": 1.0,
    "seconds": 1.0,
    "min": 60.0,
    "minute": 60.0,
    "minutes": 60.0,
    "h": 3600.0,
    "hr": 3600.0,
    "hour": 3600.0,
    "hours": 3600.0,
    "d": 86400.0,
    "day": 86400.0,
    "days": 86400.0,
    "mo": 2629800.0,
    "month": 2629800.0,
    "months": 2629800.0,
    "y": 31557600.0,
    "yr": 31557600.0,
    "year": 31557600.0,
    "years": 31557600.0,
}


def _cumulative_unit_factor(time_unit: str, rate_unit: str) -> tuple[float, str]:
    """Return multiplier and physical cumulative unit for rate integration."""
    normalized_time = time_unit.strip().lower()
    if normalized_time not in _SECONDS_PER_TIME_UNIT:
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            f"Unsupported time unit for EUR calculation: {time_unit}",
        )

    numerator, separator, denominator = rate_unit.strip().rpartition("/")
    normalized_denominator = denominator.strip().lower()
    if (
        not separator
        or not numerator.strip()
        or normalized_denominator not in _SECONDS_PER_TIME_UNIT
    ):
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            "EUR rate_unit must include a supported time denominator "
            "(for example bbl/d, m3/day, or scf/month)",
        )

    factor = (
        _SECONDS_PER_TIME_UNIT[normalized_time]
        / _SECONDS_PER_TIME_UNIT[normalized_denominator]
    )
    return factor, numerator.strip()


class DeclineAnalysisService:
    """Domain service for decline curve analysis."""

    def __init__(self, engine: DeclineEngine) -> None:
        self._engine = engine

    @property
    def engine_id(self) -> str:
        return ENGINE_ID

    @property
    def provider_id(self) -> str:
        return self._engine.provider_id

    def dependency_status(self):
        return self._engine.dependency_status()

    # ── Fit ───────────────────────────────────────────────────────────

    def fit(
        self,
        time: list[float],
        rate: list[float],
        time_unit: str,
        rate_unit: str,
        model: str = "auto",
    ) -> DomainResult:
        """Fit decline curve(s) to production data."""
        points = self._validate_input(time, rate, time_unit, rate_unit)

        try:
            model_enum = DeclineModel(model.lower().strip())
        except ValueError:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                f"Unknown model: {model}. Valid: auto, exponential, harmonic, hyperbolic",
            )

        request = DeclineFitRequest(
            points=points,
            time_unit=time_unit,
            rate_unit=rate_unit,
            model=model_enum,
        )

        fits = self._engine.fit(request)

        if not fits:
            raise DomainError(
                DomainErrorCode.NON_CONVERGENT,
                "No models converged",
            )

        # For auto mode, determine recommended model
        recommended: DeclineFit | None = None
        if model_enum == DeclineModel.AUTO:
            # Prefer lowest AIC (if available), then lowest RMSE
            valid_aic = [f for f in fits if f.aic is not None]
            if valid_aic:
                recommended = min(
                    valid_aic,
                    key=lambda f: f.aic if f.aic is not None else float("inf"),
                )
            else:
                recommended = min(fits, key=lambda f: f.rmse)
        else:
            recommended = fits[0] if fits else None

        # Build result
        fits_list = [self._fit_to_dict(f) for f in fits]
        recommended_dict = self._fit_to_dict(recommended) if recommended else None

        assumptions = [
            f"Time unit: {time_unit}",
            f"Rate unit: {rate_unit}",
            "Arps decline model assumed",
            "Production data is from a single well or aggregate",
        ]
        if model_enum == DeclineModel.AUTO:
            assumptions.append(
                "Recommended model is based on AIC/RMSE comparison; "
                "all successful candidates are retained"
            )

        warnings: list[str] = []
        if model_enum == DeclineModel.AUTO and recommended:
            warnings.append(
                f"Recommended model: {recommended.model.value}. "
                "This is a statistical recommendation, not the only valid model."
            )

        result_dict: dict[str, Any] = {
            "fits": fits_list,
            "recommended": recommended_dict,
            "is_auto": model_enum == DeclineModel.AUTO,
            "warnings": warnings,
        }

        return DomainResult(
            engine_id=ENGINE_ID,
            provider_id=self._engine.provider_id,
            operation=OPERATION_FIT,
            method="arps_curve_fit",
            result=sanitize_json(result_dict),
            units={"time": time_unit, "rate": rate_unit},
            metrics={
                "candidate_count": len(fits),
                "data_points": len(points),
            },
            assumptions=assumptions,
            warnings=warnings,
            artifacts=[],
        )

    # ── Forecast ──────────────────────────────────────────────────────

    def forecast(
        self,
        model: str,
        qi: float,
        di: float,
        b: float | None,
        forecast_time: list[float],
        time_unit: str,
        rate_unit: str,
    ) -> DomainResult:
        """Forecast production rates at specified times."""
        fit = self._build_fit_from_params(model, qi, di, b, time_unit, rate_unit)

        # Validate forecast times
        if not forecast_time:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "forecast_time must contain at least one value",
            )
        for t in forecast_time:
            if t < 0:
                raise DomainError(
                    DomainErrorCode.INVALID_INPUT,
                    f"Forecast time must be non-negative, got: {t}",
                )

        rates = self._engine.rates(fit, forecast_time)

        result_dict: dict[str, Any] = {
            "model": fit.model.value,
            "qi": fit.qi,
            "di": fit.di,
            "b": fit.b,
            "forecast": [
                {"time": safe_float(t), "rate": safe_float(r)}
                for t, r in zip(forecast_time, rates)
            ],
        }

        assumptions = [
            f"Time unit: {time_unit}",
            f"Rate unit: {rate_unit}",
            "Forecast assumes decline parameters remain constant",
        ]
        warnings: list[str] = []
        # Check if forecast rates are monotonically non-increasing
        is_decreasing = all(
            rates[i] >= rates[i + 1] - 1e-10
            for i in range(len(rates) - 1)
        )
        if not is_decreasing:
            warnings.append("Forecast rates are not monotonically decreasing")

        return DomainResult(
            engine_id=ENGINE_ID,
            provider_id=self._engine.provider_id,
            operation=OPERATION_FORECAST,
            method="arps_forecast",
            result=sanitize_json(result_dict),
            units={"time": time_unit, "rate": rate_unit},
            metrics={"forecast_points": len(forecast_time)},
            assumptions=assumptions,
            warnings=warnings,
            artifacts=[],
        )

    # ── EUR ───────────────────────────────────────────────────────────

    def eur(
        self,
        model: str,
        qi: float,
        di: float,
        b: float | None,
        time_unit: str,
        rate_unit: str,
        forecast_end: float | None = None,
        economic_limit: float | None = None,
    ) -> DomainResult:
        """Compute Estimated Ultimate Recovery."""
        if forecast_end is None and economic_limit is None:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "Either forecast_end or economic_limit must be provided",
            )

        fit = self._build_fit_from_params(model, qi, di, b, time_unit, rate_unit)

        # Validate economic limit
        if economic_limit is not None:
            if economic_limit < 0:
                raise DomainError(
                    DomainErrorCode.INVALID_INPUT,
                    "Economic limit must be non-negative",
                )
            if economic_limit >= fit.qi:
                raise DomainError(
                    DomainErrorCode.INVALID_INPUT,
                    f"Economic limit ({economic_limit}) must be less than "
                    f"initial rate ({fit.qi})",
                )
            if economic_limit == 0 and forecast_end is None:
                raise DomainError(
                    DomainErrorCode.INVALID_INPUT,
                    "Economic limit of 0 means production never stops; "
                    "forecast_end is required to bound the calculation",
                )

        # Determine end time
        effective_end: float
        if economic_limit is not None and economic_limit > 0:
            # Solve for time when rate = economic_limit
            effective_end = self._solve_economic_limit(fit, economic_limit)
            if forecast_end is not None:
                effective_end = min(effective_end, forecast_end)
        elif forecast_end is not None:
            # economic_limit is None or 0; use forecast_end
            effective_end = forecast_end
        else:
            # This branch is unreachable due to earlier checks,
            # but kept for safety
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "Either forecast_end or a positive economic_limit must be provided",
            )

        if effective_end <= 0:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "Effective end time must be positive",
            )

        # Guard against non-finite effective_end (e.g. harmonic model with
        # extremely small economic_limit can produce inf).  Without this
        # check, safe_float(inf) silently returns 0.0 and the user sees
        # a meaningless EUR of 0.
        if not math.isfinite(effective_end):
            raise DomainError(
                DomainErrorCode.CALCULATION_FAILED,
                "Effective end time is not finite — economic_limit may be "
                "too small relative to qi. Provide a larger economic_limit "
                "or specify a finite forecast_end.",
                retryable=True,
            )

        cumulative_in_rate_time = self._engine.cumulative(
            fit,
            0.0,
            effective_end,
        )
        unit_factor, cumulative_unit = _cumulative_unit_factor(
            time_unit,
            rate_unit,
        )
        cumulative = cumulative_in_rate_time * unit_factor

        # Compute final rate at effective_end
        final_rate = self._engine.rates(fit, [effective_end])[0]

        result_dict: dict[str, Any] = {
            "model": fit.model.value,
            "qi": fit.qi,
            "di": fit.di,
            "b": fit.b,
            "effective_end": safe_float(effective_end),
            "final_rate": safe_float(final_rate),
            "cumulative_production": safe_float(cumulative),
            "economic_limit_used": economic_limit is not None,
            "forecast_end_used": forecast_end is not None,
        }

        assumptions = [
            f"Time unit: {time_unit}",
            f"Rate unit: {rate_unit}",
            "EUR computed via integration of Arps decline equation",
            "Cumulative production is non-negative by construction",
        ]
        if economic_limit is not None:
            assumptions.append(f"Economic limit: {economic_limit} {rate_unit}")
        if forecast_end is not None:
            assumptions.append(f"Forecast end: {forecast_end} {time_unit}")

        warnings: list[str] = []
        if cumulative < 0:
            warnings.append("Cumulative production is negative — check parameters")

        return DomainResult(
            engine_id=ENGINE_ID,
            provider_id=self._engine.provider_id,
            operation=OPERATION_EUR,
            method="analytical_integration",
            result=sanitize_json(result_dict),
            units={
                "time": time_unit,
                "rate": rate_unit,
                "cumulative": cumulative_unit,
            },
            metrics={
                "effective_end": safe_float(effective_end),
                "cumulative": safe_float(cumulative),
            },
            assumptions=assumptions,
            warnings=warnings,
            artifacts=[],
        )


    # ── Private helpers ───────────────────────────────────────────────

    @staticmethod
    def _validate_input(
        time: list[float],
        rate: list[float],
        time_unit: str,
        rate_unit: str,
    ) -> list[ProductionPoint]:
        """Validate and convert input arrays to ProductionPoints."""
        if not time or not rate:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "time and rate arrays must not be empty",
            )
        if len(time) != len(rate):
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                f"time ({len(time)}) and rate ({len(rate)}) must have equal length",
            )
        if not time_unit:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "time_unit is required",
            )
        if not rate_unit:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "rate_unit is required",
            )

        points = [
            ProductionPoint(time=float(t), rate=float(r))
            for t, r in zip(time, rate)
        ]

        # Validate rates
        for p in points:
            if p.rate < 0:
                raise DomainError(
                    DomainErrorCode.INVALID_INPUT,
                    f"Negative production rate at time {p.time}: {p.rate}",
                )

        # Check minimum points
        if len(points) < MIN_POINTS:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                f"At least {MIN_POINTS} data points required, got {len(points)}",
            )

        return points

    @staticmethod
    def _build_fit_from_params(
        model: str,
        qi: float,
        di: float,
        b: float | None,
        time_unit: str,
        rate_unit: str,
    ) -> DeclineFit:
        """Build a DeclineFit from user-provided parameters."""
        try:
            model_enum = DeclineModel(model.lower().strip())
        except ValueError:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                f"Unknown model: {model}",
            )

        if model_enum == DeclineModel.AUTO:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "Cannot forecast with model=auto; specify a concrete model",
            )

        if qi <= 0:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                f"qi must be positive, got: {qi}",
            )
        if di <= 0:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                f"di must be positive, got: {di}",
            )

        if model_enum == DeclineModel.EXPONENTIAL:
            b = None
        elif model_enum == DeclineModel.HARMONIC:
            b = 1.0
        elif model_enum == DeclineModel.HYPERBOLIC:
            if b is None:
                raise DomainError(
                    DomainErrorCode.INVALID_INPUT,
                    "b parameter required for hyperbolic model",
                )
            if b <= 0 or b >= 1:
                raise DomainError(
                    DomainErrorCode.INVALID_INPUT,
                    f"Hyperbolic b must be in (0, 1), got: {b}",
                )

        return DeclineFit(
            model=model_enum,
            qi=float(qi),
            di=float(di),
            b=float(b) if b is not None else None,
            rmse=0.0,
            mae=0.0,
            r_squared=0.0,
            aic=None,
            fit_start=0.0,
            fit_end=0.0,
        )

    @staticmethod
    def _fit_to_dict(fit: DeclineFit) -> dict[str, Any]:
        """Convert a DeclineFit to JSON-safe dict."""
        return sanitize_json({
            "model": fit.model.value,
            "qi": fit.qi,
            "di": fit.di,
            "b": fit.b,
            "rmse": fit.rmse,
            "mae": fit.mae,
            "r_squared": fit.r_squared,
            "aic": fit.aic,
            "fit_start": fit.fit_start,
            "fit_end": fit.fit_end,
        })

    @staticmethod
    def _solve_economic_limit(fit: DeclineFit, economic_limit: float) -> float:
        """Solve for time t where q(t) = economic_limit."""
        if fit.model == DeclineModel.EXPONENTIAL:
            # qi * exp(-di * t) = econ
            # t = -ln(econ/qi) / di
            if fit.qi <= 0 or fit.di <= 0:
                raise DomainError(
                    DomainErrorCode.CALCULATION_FAILED,
                    "Cannot solve economic limit with non-positive qi/di",
                )
            t = -math.log(economic_limit / fit.qi) / fit.di
            return max(t, 0.0)

        elif fit.model == DeclineModel.HARMONIC:
            # qi / (1 + di * t) = econ
            # t = (qi/econ - 1) / di
            if fit.di <= 0 or economic_limit <= 0:
                raise DomainError(
                    DomainErrorCode.CALCULATION_FAILED,
                    "Cannot solve economic limit",
                )
            t = (fit.qi / economic_limit - 1) / fit.di
            return max(t, 0.0)

        elif fit.model == DeclineModel.HYPERBOLIC:
            b = fit.b or 1.0
            # qi / (1 + b*di*t)^(1/b) = econ
            # (1 + b*di*t)^(1/b) = qi/econ
            # 1 + b*di*t = (qi/econ)^b
            # t = ((qi/econ)^b - 1) / (b * di)
            if b <= 0 or fit.di <= 0 or economic_limit <= 0:
                raise DomainError(
                    DomainErrorCode.CALCULATION_FAILED,
                    "Cannot solve economic limit",
                )
            t = ((fit.qi / economic_limit) ** b - 1) / (b * fit.di)
            return max(t, 0.0)

        raise DomainError(
            DomainErrorCode.UNSUPPORTED_OPERATION,
            f"Cannot solve economic limit for model: {fit.model}",
        )
