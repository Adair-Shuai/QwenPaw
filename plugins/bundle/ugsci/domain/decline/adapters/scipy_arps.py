# -*- coding: utf-8 -*-
"""ScipyArpsAdapter — fit and forecast Arps decline curves via numpy/scipy.

All ``import numpy`` and ``import scipy`` calls are deferred to method
bodies so that the module can be imported even when these packages are
not installed.
"""

from __future__ import annotations

import math
import logging
from typing import Any

from ...common.errors import DomainError, DomainErrorCode
from ...common.serialization import safe_float, to_python_float
from ...well_log.ports import DependencyStatus
from ..models import DeclineFit, DeclineFitRequest, DeclineModel, ProductionPoint

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.domain.decline.scipy")

PROVIDER_ID = "ugsci-decline-scipy"

# Minimum number of data points required for fitting
MIN_POINTS = 4


class ScipyArpsAdapter:
    """Decline engine adapter backed by numpy/scipy."""

    provider_id = PROVIDER_ID

    def dependency_status(self) -> DependencyStatus:
        import importlib.util

        numpy_spec = importlib.util.find_spec("numpy")
        scipy_spec = importlib.util.find_spec("scipy")
        if numpy_spec is not None and scipy_spec is not None:
            return DependencyStatus(available=True)
        missing = []
        if numpy_spec is None:
            missing.append("numpy")
        if scipy_spec is None:
            missing.append("scipy")
        return DependencyStatus(
            available=False,
            reason=f"Missing packages: {', '.join(missing)}",
        )

    def fit(self, request: DeclineFitRequest) -> list[DeclineFit]:
        """Fit one or more decline models to production data.

        For ``model=auto``, fits exponential, harmonic, and hyperbolic
        models independently.  A failure in one model does not block
        the others.

        Returns a list of successful fits (may be empty if all fail).
        """
        points = request.points
        if len(points) < MIN_POINTS:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                f"At least {MIN_POINTS} data points required, got {len(points)}",
            )

        # Validate and sort points
        sorted_points = self._sort_and_validate(points)

        times = [p.time for p in sorted_points]
        rates = [p.rate for p in sorted_points]

        models_to_fit: list[DeclineModel] = []
        if request.model == DeclineModel.AUTO:
            models_to_fit = [
                DeclineModel.EXPONENTIAL,
                DeclineModel.HARMONIC,
                DeclineModel.HYPERBOLIC,
            ]
        else:
            models_to_fit = [request.model]

        results: list[DeclineFit] = []
        for model in models_to_fit:
            try:
                fit = self._fit_single_model(model, times, rates)
                results.append(fit)
            except DomainError as exc:
                if exc.code == DomainErrorCode.NON_CONVERGENT:
                    logger.info(
                        "Model %s did not converge: %s",
                        model.value,
                        exc.message,
                    )
                else:
                    raise
            except Exception as exc:
                logger.info(
                    "Model %s fitting failed: %s: %s",
                    model.value,
                    type(exc).__name__,
                    exc,
                )

        return results

    def rates(self, fit: DeclineFit, times: list[float]) -> list[float]:
        """Compute production rates at given times for a fitted model."""
        results: list[float] = []
        for t in times:
            rate = self._compute_rate(fit, t)
            results.append(safe_float(rate))
        return results

    def cumulative(self, fit: DeclineFit, start: float, end: float) -> float:
        """Compute cumulative production between ``start`` and ``end``.

        Uses analytical (closed-form) integration for exponential and
        harmonic models, and numerical integration for hyperbolic.
        """
        if end <= start:
            return 0.0

        if fit.model == DeclineModel.EXPONENTIAL:
            # ∫ qi * exp(-di*t) dt = qi/di * (exp(-di*start) - exp(-di*end))
            di = fit.di
            qi = fit.qi
            if di <= 0:
                return qi * (end - start)
            result = (qi / di) * (math.exp(-di * start) - math.exp(-di * end))
            return safe_float(result)

        elif fit.model == DeclineModel.HARMONIC:
            # ∫ qi / (1 + di*t) dt = qi/di * ln((1 + di*end) / (1 + di*start))
            di = fit.di
            qi = fit.qi
            if di <= 0:
                return qi * (end - start)
            result = (qi / di) * math.log((1 + di * end) / (1 + di * start))
            return safe_float(result)

        elif fit.model == DeclineModel.HYPERBOLIC:
            b = fit.b or 1.0
            if b <= 0 or b >= 1:
                # Fall back to numerical integration
                return self._numerical_cumulative(fit, start, end)
            di = fit.di
            qi = fit.qi
            # ∫ qi / (1 + b*di*t)^(1/b) dt
            # = qi / (di * (1 - b)) * [(1 + b*di*start)^(1 - 1/b) - (1 + b*di*end)^(1 - 1/b)]
            # Wait, let me redo this properly.
            # q(t) = qi / (1 + b*di*t)^(1/b)
            # ∫ q(t) dt = qi * ∫ (1 + b*di*t)^(-1/b) dt
            # Let u = 1 + b*di*t, du = b*di*dt, dt = du/(b*di)
            # = qi/(b*di) * ∫ u^(-1/b) du
            # = qi/(b*di) * [u^(1 - 1/b) / (1 - 1/b)]
            # = qi/(b*di) * u^(1 - 1/b) / (1 - 1/b)
            # = qi/(di*(b - 1)) * [u_end^(1-1/b) - u_start^(1-1/b)]
            # Wait, 1 - 1/b = (b-1)/b, so:
            # = qi/(b*di) * b/(b-1) * [u_end^((b-1)/b) - u_start^((b-1)/b)]
            # = qi/(di*(b-1)) * [u_end^((b-1)/b) - u_start^((b-1)/b)]
            # Since b < 1, (b-1) < 0, and we need to be careful with signs.
            # Actually: qi/(di*(b-1)) * [...] — but di*(b-1) is negative when b<1.
            # Let's just compute it directly:
            exponent = (b - 1) / b  # This is negative when 0 < b < 1
            u_start = 1 + b * di * start
            u_end = 1 + b * di * end
            # ∫ = qi / (di * (b - 1)) * (u_end^exponent - u_start^exponent)
            # But (b-1) < 0, and u_end > u_start, and exponent < 0,
            # so u_end^exponent < u_start^exponent, making the bracket negative.
            # Negative / negative = positive. Good.
            if di <= 0 or b <= 0:
                return self._numerical_cumulative(fit, start, end)
            try:
                # ∫_{start}^{end} qi / (1 + b*di*t)^(1/b) dt
                # = qi / (di*(b-1)) * [u_end^((b-1)/b) - u_start^((b-1)/b)]
                # Since b < 1: (b-1) < 0, exponent < 0, u_end > u_start
                # → u_end^exp < u_start^exp → bracket negative
                # → 1/(di*(b-1)) negative → negative * negative = positive ✓
                result = (qi / (di * (b - 1))) * (
                    u_end ** exponent - u_start ** exponent
                )
                return safe_float(result)
            except (ValueError, OverflowError):
                return self._numerical_cumulative(fit, start, end)

        return 0.0

    # ── Private helpers ───────────────────────────────────────────────

    @staticmethod
    def _sort_and_validate(points: list[ProductionPoint]) -> list[ProductionPoint]:
        """Sort by time and validate constraints."""
        # Check for negative rates
        for p in points:
            if p.rate < 0:
                raise DomainError(
                    DomainErrorCode.INVALID_INPUT,
                    f"Negative production rate at time {p.time}: {p.rate}",
                )
            if p.time < 0:
                raise DomainError(
                    DomainErrorCode.INVALID_INPUT,
                    f"Negative time value: {p.time}",
                )

        # Sort by time
        sorted_points = sorted(points, key=lambda p: p.time)

        # Check for strict monotonicity (no duplicate times)
        for i in range(1, len(sorted_points)):
            if sorted_points[i].time == sorted_points[i - 1].time:
                raise DomainError(
                    DomainErrorCode.INVALID_INPUT,
                    f"Duplicate time value: {sorted_points[i].time}",
                )

        return sorted_points

    @staticmethod
    def _compute_rate(fit: DeclineFit, t: float) -> float:
        """Compute rate at time t for a fitted model."""
        if fit.model == DeclineModel.EXPONENTIAL:
            return fit.qi * math.exp(-fit.di * t)
        elif fit.model == DeclineModel.HARMONIC:
            return fit.qi / (1 + fit.di * t)
        elif fit.model == DeclineModel.HYPERBOLIC:
            b = fit.b or 1.0
            return fit.qi / (1 + b * fit.di * t) ** (1 / b)
        return 0.0

    def _fit_single_model(
        self,
        model: DeclineModel,
        times: list[float],
        rates: list[float],
    ) -> DeclineFit:
        """Fit a single decline model using scipy.optimize.curve_fit."""
        try:
            import numpy as np
            from scipy.optimize import curve_fit
        except ImportError as exc:
            raise DomainError(
                DomainErrorCode.DEPENDENCY_UNAVAILABLE,
                "numpy/scipy not installed",
            ) from exc

        t_arr = np.array(times, dtype=float)
        r_arr = np.array(rates, dtype=float)

        qi_guess = max(rates[0], 1e-10)
        di_guess = 0.1
        if len(rates) >= 2 and rates[0] > 0:
            # Estimate decline from first and last point
            ratio = rates[-1] / rates[0] if rates[0] > 0 else 0.5
            if ratio > 0 and ratio < 1:
                di_guess = -math.log(ratio) / (times[-1] - times[0]) if times[-1] > times[0] else 0.1
                di_guess = max(di_guess, 1e-6)

        if model == DeclineModel.EXPONENTIAL:
            def exp_func(t, qi, di):
                return qi * np.exp(-di * t)

            try:
                popt, _ = curve_fit(
                    exp_func,
                    t_arr,
                    r_arr,
                    p0=[qi_guess, di_guess],
                    bounds=([1e-10, 1e-10], [1e12, 100.0]),
                    maxfev=10000,
                )
            except Exception as exc:
                raise DomainError(
                    DomainErrorCode.NON_CONVERGENT,
                    f"Exponential fit did not converge: {type(exc).__name__}",
                ) from exc

            qi, di = float(popt[0]), float(popt[1])
            b = None

        elif model == DeclineModel.HARMONIC:
            def harm_func(t, qi, di):
                return qi / (1 + di * t)

            try:
                popt, _ = curve_fit(
                    harm_func,
                    t_arr,
                    r_arr,
                    p0=[qi_guess, di_guess],
                    bounds=([1e-10, 1e-10], [1e12, 100.0]),
                    maxfev=10000,
                )
            except Exception as exc:
                raise DomainError(
                    DomainErrorCode.NON_CONVERGENT,
                    f"Harmonic fit did not converge: {type(exc).__name__}",
                ) from exc

            qi, di = float(popt[0]), float(popt[1])
            b = 1.0

        elif model == DeclineModel.HYPERBOLIC:
            def hyp_func(t, qi, di, b):
                return qi / (1 + b * di * t) ** (1 / b)

            b_guess = 0.5
            try:
                popt, _ = curve_fit(
                    hyp_func,
                    t_arr,
                    r_arr,
                    p0=[qi_guess, di_guess, b_guess],
                    bounds=([1e-10, 1e-10, 1e-6], [1e12, 100.0, 0.999]),
                    maxfev=10000,
                )
            except Exception as exc:
                raise DomainError(
                    DomainErrorCode.NON_CONVERGENT,
                    f"Hyperbolic fit did not converge: {type(exc).__name__}",
                ) from exc

            qi, di, b = float(popt[0]), float(popt[1]), float(popt[2])

            # Validate b constraint
            if b <= 0 or b >= 1:
                raise DomainError(
                    DomainErrorCode.NON_CONVERGENT,
                    f"Hyperbolic b out of range (0, 1): {b}",
                )

        else:
            raise DomainError(
                DomainErrorCode.UNSUPPORTED_OPERATION,
                f"Unknown model: {model}",
            )

        # Compute fit metrics — reuse the fitted DeclineFit for prediction
        # instead of creating a temporary one per data point
        temp_fit = DeclineFit(
            model=model,
            qi=qi,
            di=di,
            b=b,
            rmse=0.0,
            mae=0.0,
            r_squared=0.0,
            aic=None,
            fit_start=times[0],
            fit_end=times[-1],
        )
        predicted = np.array([
            self._compute_rate(temp_fit, t) for t in times
        ])

        residuals = r_arr - predicted
        n = len(times)

        rmse = float(np.sqrt(np.mean(residuals ** 2)))
        mae = float(np.mean(np.abs(residuals)))

        ss_res = float(np.sum(residuals ** 2))
        ss_tot = float(np.sum((r_arr - np.mean(r_arr)) ** 2))
        r_squared = 1 - ss_res / ss_tot if ss_tot > 0 else 0.0

        # AIC: n * ln(ss_res/n) + 2*k
        k = 2 if model != DeclineModel.HYPERBOLIC else 3
        if n > 0:
            # A perfect (or numerically perfect) fit has the best possible
            # likelihood; it must not be excluded from auto-selection merely
            # because log(0) is undefined.  Clamp the mean squared residual to
            # the smallest positive normal float so AIC stays finite and
            # JSON-safe while preserving the correct ordering.
            mean_squared_residual = max(ss_res / n, float(np.finfo(float).tiny))
            aic = float(n * math.log(mean_squared_residual) + 2 * k)
        else:
            aic = None

        return DeclineFit(
            model=model,
            qi=safe_float(qi),
            di=safe_float(di),
            b=safe_float(b) if model == DeclineModel.HYPERBOLIC else b,
            rmse=safe_float(rmse),
            mae=safe_float(mae),
            r_squared=safe_float(r_squared),
            aic=to_python_float(aic),
            fit_start=float(times[0]),
            fit_end=float(times[-1]),
        )

    @staticmethod
    def _numerical_cumulative(fit: DeclineFit, start: float, end: float) -> float:
        """Compute cumulative production via trapezoidal rule."""
        n_steps = 1000
        dt = (end - start) / n_steps
        total = 0.0
        for i in range(n_steps):
            t1 = start + i * dt
            t2 = start + (i + 1) * dt
            r1 = ScipyArpsAdapter._compute_rate(fit, t1)
            r2 = ScipyArpsAdapter._compute_rate(fit, t2)
            total += (r1 + r2) / 2 * dt
        return safe_float(total)
