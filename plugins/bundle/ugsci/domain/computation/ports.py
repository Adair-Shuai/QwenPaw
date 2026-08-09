# -*- coding: utf-8 -*-
"""Stable ports implemented by third-party scientific-library adapters."""

from __future__ import annotations

from typing import Any, Protocol

from .models import (
    BayesianNormalRequest,
    GeospatialPointsRequest,
    GraphAnalysisRequest,
    MachineLearningRegressionRequest,
    MultiObjectiveQuadraticRequest,
    PolynomialRootsRequest,
    QueueSimulationRequest,
    StatisticalRegressionRequest,
)


class ComputationAdapter(Protocol):
    provider_id: str
    operation: str

    def compute(self, request: Any) -> dict[str, Any]: ...


Request = (
    PolynomialRootsRequest
    | BayesianNormalRequest
    | MultiObjectiveQuadraticRequest
    | QueueSimulationRequest
    | GraphAnalysisRequest
    | GeospatialPointsRequest
    | MachineLearningRegressionRequest
    | StatisticalRegressionRequest
)
