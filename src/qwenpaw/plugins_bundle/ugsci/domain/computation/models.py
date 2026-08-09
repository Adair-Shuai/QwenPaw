# -*- coding: utf-8 -*-
"""UGSci-owned request models for general computation operations."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class PolynomialRootsRequest:
    coefficients: list[float]


@dataclass(frozen=True)
class BayesianNormalRequest:
    observations: list[float]
    prior_mean: float
    prior_std: float
    observation_std: float
    draws: int
    tune: int
    seed: int


@dataclass(frozen=True)
class MultiObjectiveQuadraticRequest:
    centers: list[list[float]]
    bounds: list[list[float]]
    population_size: int
    generations: int
    seed: int


@dataclass(frozen=True)
class QueueSimulationRequest:
    arrival_interval: float
    service_time: float
    servers: int
    duration: float


@dataclass(frozen=True)
class GraphAnalysisRequest:
    nodes: list[str]
    edges: list[list[str]]
    directed: bool
    source: str | None
    target: str | None


@dataclass(frozen=True)
class GeospatialPointsRequest:
    points: list[list[float]]
    crs: str


@dataclass(frozen=True)
class MachineLearningRegressionRequest:
    features: list[list[float]]
    targets: list[float]
    predict_features: list[list[float]]


@dataclass(frozen=True)
class StatisticalRegressionRequest:
    features: list[list[float]]
    targets: list[float]
    feature_names: list[str]
