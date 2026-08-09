# -*- coding: utf-8 -*-
"""Decline analysis domain models.

All values are plain Python floats.  numpy/scipy types must never
appear in these models.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class DeclineModel(str, Enum):
    """Arps decline model types."""

    AUTO = "auto"
    EXPONENTIAL = "exponential"
    HARMONIC = "harmonic"
    HYPERBOLIC = "hyperbolic"


@dataclass
class ProductionPoint:
    """A single production data point."""

    time: float
    rate: float


@dataclass
class DeclineFitRequest:
    """Request for fitting a decline curve."""

    points: list[ProductionPoint]
    time_unit: str
    rate_unit: str
    model: DeclineModel


@dataclass
class DeclineFit:
    """Result of fitting a single decline model.

    Attributes:
        model: Which model was fitted.
        qi: Initial production rate.
        di: Initial decline rate.
        b: Hyperbolic exponent (None for exponential, 1.0 for harmonic).
        rmse: Root-mean-square error of the fit.
        mae: Mean absolute error.
        r_squared: Coefficient of determination (R²).
        aic: Akaike Information Criterion (None if not computed).
        fit_start: Time of first data point used.
        fit_end: Time of last data point used.
    """

    model: DeclineModel
    qi: float
    di: float
    b: float | None
    rmse: float
    mae: float
    r_squared: float
    aic: float | None
    fit_start: float
    fit_end: float


@dataclass
class DeclineForecastRequest:
    """Request for forecasting production rates."""

    model: DeclineModel
    qi: float
    di: float
    b: float | None
    times: list[float]
    time_unit: str
    rate_unit: str


@dataclass
class DeclineEurRequest:
    """Request for computing Estimated Ultimate Recovery."""

    model: DeclineModel
    qi: float
    di: float
    b: float | None
    time_unit: str
    rate_unit: str
    forecast_end: float | None = None
    economic_limit: float | None = None
