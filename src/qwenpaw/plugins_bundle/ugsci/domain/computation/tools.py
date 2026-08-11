# -*- coding: utf-8 -*-
"""Stable Agent tools for general scientific computation capabilities."""

from __future__ import annotations

import json
from typing import Any

from ..common.errors import DomainError, DomainErrorCode, wrap_unknown_error
from .adapters import (
    GeoPandasAdapter,
    NetworkXAdapter,
    ScikitLearnAdapter,
    SimPyAdapter,
    StatsmodelsAdapter,
    SymPyAdapter,
)
from ..stochastic.adapters import PyMCAdapter, PymooAdapter
from ..deterministic.providers import default_registry
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
from .service import ComputationService, require, validate_matrix

_service = ComputationService()


def _chunk(payload: dict[str, Any], *, error: bool = False) -> Any:
    try:
        from agentscope.message import TextBlock, ToolResultState
        from agentscope.tool import ToolChunk
    except Exception:
        return {"error": error, "payload": payload}
    return ToolChunk(
        is_last=True,
        state=ToolResultState.ERROR if error else ToolResultState.SUCCESS,
        content=[TextBlock(type="text", text=json.dumps(payload, ensure_ascii=False, indent=2))],
    )


def _run(
    engine_id: str,
    adapter: Any,
    request: Any,
    method: str,
    assumptions: list[str] | None = None,
    *,
    capability_id: str | None = None,
    execution_class: str = "deterministic",
) -> Any:
    try:
        if capability_id:
            adapter = default_registry.resolve(
                capability_id,
                execution_class=execution_class,
            )
        return _chunk(
            _service.execute(
                engine_id,
                adapter,
                request,
                method=method,
                assumptions=assumptions,
            ).to_dict(),
        )
    except DomainError as exc:
        return _chunk(exc.to_dict(), error=True)
    except Exception as exc:
        return _chunk(wrap_unknown_error(exc).to_dict(), error=True)


def _invalid_input(exc: Exception) -> Any:
    error = DomainError(
        code=DomainErrorCode.INVALID_INPUT,
        message=f"Invalid computation input: {exc}",
    )
    return _chunk(error.to_dict(), error=True)


async def ugsci_symbolic_polynomial_roots(coefficients: list[float]) -> Any:
    """Find all real and complex roots of a polynomial.

    ``coefficients`` are ordered from highest power to the constant term.
    """
    try:
        require(len(coefficients) >= 2, "At least two coefficients are required")
        require(coefficients[0] != 0, "Leading coefficient must be non-zero")
        require(len(coefficients) <= 21, "Polynomial degree must not exceed 20")
        request = PolynomialRootsRequest([float(value) for value in coefficients])
    except DomainError as exc:
        return _chunk(exc.to_dict(), error=True)
    except (TypeError, ValueError) as exc:
        return _invalid_input(exc)
    return _run("sympy", None, request, "symbolic_nroots", capability_id="math.symbolic")


async def ugsci_bayesian_normal_estimate(
    observations: list[float],
    prior_mean: float = 0.0,
    prior_std: float = 10.0,
    observation_std: float = 1.0,
    draws: int = 1000,
    tune: int = 500,
    seed: int = 42,
) -> Any:
    """Estimate an unknown normal mean with a PyMC Bayesian model."""
    try:
        require(len(observations) >= 2, "At least two observations are required")
        require(prior_std > 0 and observation_std > 0, "Standard deviations must be positive")
        require(100 <= draws <= 5000 and 0 <= tune <= 5000, "draws/tune are outside safe limits")
        request = BayesianNormalRequest(
            [float(value) for value in observations], float(prior_mean),
            float(prior_std), float(observation_std), draws, tune, seed,
        )
    except DomainError as exc:
        return _chunk(exc.to_dict(), error=True)
    except (TypeError, ValueError) as exc:
        return _invalid_input(exc)
    return _run("pymc", PyMCAdapter(), request, "mcmc_nuts", ["Normal likelihood with known observation standard deviation"])


async def ugsci_multiobjective_quadratic(
    centers: list[list[float]],
    bounds: list[list[float]],
    population_size: int = 80,
    generations: int = 100,
    seed: int = 42,
) -> Any:
    """Compute a Pareto set for structured quadratic objectives."""
    try:
        dimensions = validate_matrix(centers, "centers")
        require(len(centers) >= 2, "At least two objective centers are required")
        require(len(bounds) == dimensions and all(len(row) == 2 and row[0] < row[1] for row in bounds), "bounds must contain [lower, upper] for every variable")
        require(20 <= population_size <= 500 and 10 <= generations <= 2000, "optimizer limits exceeded")
        request = MultiObjectiveQuadraticRequest(
            [[float(value) for value in row] for row in centers],
            [[float(value) for value in row] for row in bounds],
            population_size,
            generations,
            seed,
        )
    except DomainError as exc:
        return _chunk(exc.to_dict(), error=True)
    except (TypeError, ValueError) as exc:
        return _invalid_input(exc)
    return _run("pymoo", PymooAdapter(), request, "nsga2")


async def ugsci_queue_simulate(
    arrival_interval: float,
    service_time: float,
    servers: int = 1,
    duration: float = 100.0,
) -> Any:
    """Run a deterministic first-in-first-out queue simulation."""
    try:
        require(arrival_interval > 0 and service_time > 0 and duration > 0, "Time inputs must be positive")
        require(1 <= servers <= 100, "servers must be between 1 and 100")
        require(duration / arrival_interval <= 100000, "simulation would create too many arrivals")
        request = QueueSimulationRequest(arrival_interval, service_time, servers, duration)
    except DomainError as exc:
        return _chunk(exc.to_dict(), error=True)
    except (TypeError, ValueError) as exc:
        return _invalid_input(exc)
    return _run("simpy", None, request, "deterministic_fifo", capability_id="simulation.queue.deterministic")


async def ugsci_graph_analyze(
    nodes: list[str],
    edges: list[list[str]],
    directed: bool = False,
    source: str | None = None,
    target: str | None = None,
) -> Any:
    """Analyze graph connectivity, density, centrality and an optional path."""
    try:
        require(bool(nodes), "nodes must not be empty")
        require(len(nodes) == len(set(nodes)), "nodes must be unique")
        require(all(len(edge) == 2 for edge in edges), "every edge must have two node IDs")
        node_set = set(nodes)
        require(all(edge[0] in node_set and edge[1] in node_set for edge in edges), "edges must reference declared nodes")
        require((source is None) == (target is None), "source and target must be provided together")
        require(source is None or (source in node_set and target in node_set), "source and target must reference declared nodes")
        request = GraphAnalysisRequest(nodes, edges, directed, source, target)
    except DomainError as exc:
        return _chunk(exc.to_dict(), error=True)
    return _run("networkx", None, request, "networkx_graph_algorithms", capability_id="graph.network.analyze")


async def ugsci_geospatial_points_analyze(points: list[list[float]], crs: str = "EPSG:4326") -> Any:
    """Compute bounds and centroid for a structured point set."""
    try:
        require(bool(points) and all(len(point) == 2 for point in points), "points must contain [x, y] pairs")
        require(len(points) <= 100000, "point count exceeds safe limit")
        require(bool(crs.strip()), "crs is required")
        request = GeospatialPointsRequest(
            [[float(value) for value in point] for point in points], crs
        )
    except DomainError as exc:
        return _chunk(exc.to_dict(), error=True)
    except (TypeError, ValueError) as exc:
        return _invalid_input(exc)
    return _run("geopandas", None, request, "geopandas_geometry", capability_id="geospatial.points.analyze")


async def ugsci_ml_regression(
    features: list[list[float]],
    targets: list[float],
    predict_features: list[list[float]],
) -> Any:
    """Fit deterministic linear regression and predict structured rows."""
    try:
        width = validate_matrix(features, "features")
        require(len(features) == len(targets) and len(targets) >= width + 1, "targets length or sample count is invalid")
        require(bool(predict_features) and all(len(row) == width for row in predict_features), "predict_features width must match training features")
        request = MachineLearningRegressionRequest(
            [[float(value) for value in row] for row in features],
            [float(value) for value in targets],
            [[float(value) for value in row] for row in predict_features],
        )
    except DomainError as exc:
        return _chunk(exc.to_dict(), error=True)
    except (TypeError, ValueError) as exc:
        return _invalid_input(exc)
    return _run("scikit-learn", None, request, "ordinary_least_squares", capability_id="machine_learning.linear_regression")


async def ugsci_statistical_regression(
    features: list[list[float]],
    targets: list[float],
    feature_names: list[str] | None = None,
) -> Any:
    """Fit OLS regression with inferential statistics."""
    try:
        width = validate_matrix(features, "features")
        require(len(features) == len(targets) and len(targets) > width + 1, "insufficient observations for OLS")
        names = feature_names or [f"x{index + 1}" for index in range(width)]
        require(len(names) == width and len(names) == len(set(names)), "feature_names must be unique and match feature width")
        request = StatisticalRegressionRequest(
            [[float(value) for value in row] for row in features],
            [float(value) for value in targets],
            names,
        )
    except DomainError as exc:
        return _chunk(exc.to_dict(), error=True)
    except (TypeError, ValueError) as exc:
        return _invalid_input(exc)
    return _run("statsmodels", None, request, "ordinary_least_squares", capability_id="statistics.ols_regression")
