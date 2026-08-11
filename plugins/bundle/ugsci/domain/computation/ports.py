# -*- coding: utf-8 -*-
"""Stable ports implemented by third-party scientific-library adapters."""

from __future__ import annotations

from dataclasses import dataclass, field
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


@dataclass(frozen=True)
class ComputationOutput:
    """Adapter output before it is wrapped in the public DomainResult."""

    result: dict[str, Any]
    units: dict[str, str] = field(default_factory=dict)
    metrics: dict[str, float | int | str | None] = field(default_factory=dict)
    assumptions: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    tolerances: dict[str, float | int | str] = field(default_factory=dict)
    applicability: list[str] = field(default_factory=list)


class ComputationAdapter(Protocol):
    provider_id: str
    provider_version: str
    engine_version: str
    operation: str
    deterministic: bool

    def compute(self, request: Any) -> ComputationOutput | dict[str, Any]: ...


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
