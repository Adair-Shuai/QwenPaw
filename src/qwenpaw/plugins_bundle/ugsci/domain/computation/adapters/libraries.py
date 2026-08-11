# -*- coding: utf-8 -*-
"""Thin adapters over optional scientific Python libraries."""

from __future__ import annotations

import math
from typing import Any

from ...common.errors import DomainError, DomainErrorCode
from ...common.serialization import sanitize_json
from ..models import (
    BayesianNormalRequest,
    GeospatialPointsRequest,
    GraphAnalysisRequest,
    MachineLearningRegressionRequest,
    MultiObjectiveQuadraticRequest,
    PolynomialRootsRequest,
    QueueSimulationRequest,
    StatisticalRegressionRequest,
)


def _missing(provider: str, exc: ImportError) -> DomainError:
    return DomainError(
        DomainErrorCode.DEPENDENCY_UNAVAILABLE,
        f"{provider} is not installed",
        details={"provider": provider},
    )


class SymPyAdapter:
    provider_id = "ugsci-symbolic-sympy"
    dependency_package = "sympy"
    provider_version = ""
    engine_version = "1.0.0"
    deterministic = True
    operation = "math.polynomial.roots"

    def compute(self, request: PolynomialRootsRequest) -> dict[str, Any]:
        try:
            import sympy as sp
        except ImportError as exc:
            raise _missing("sympy", exc) from exc
        x = sp.Symbol("x")
        polynomial = sum(
            sp.Float(value) * x ** (len(request.coefficients) - index - 1)
            for index, value in enumerate(request.coefficients)
        )
        roots = sp.nroots(polynomial)
        return sanitize_json({
            "degree": len(request.coefficients) - 1,
            "roots": [
                {"real": float(sp.re(root)), "imag": float(sp.im(root))}
                for root in roots
            ],
        })


class PyMCAdapter:
    provider_id = "ugsci-bayesian-pymc"
    dependency_package = "pymc"
    provider_version = ""
    engine_version = "1.0.0"
    deterministic = False
    operation = "statistics.bayesian.normal_mean"

    def compute(self, request: BayesianNormalRequest) -> dict[str, Any]:
        try:
            import numpy as np
            import pymc as pm
        except ImportError as exc:
            raise _missing("pymc", exc) from exc
        try:
            with pm.Model():
                mean = pm.Normal("mean", mu=request.prior_mean, sigma=request.prior_std)
                pm.Normal(
                    "observed",
                    mu=mean,
                    sigma=request.observation_std,
                    observed=request.observations,
                )
                trace = pm.sample(
                    draws=request.draws,
                    tune=request.tune,
                    chains=2,
                    cores=1,
                    random_seed=request.seed,
                    progressbar=False,
                    compute_convergence_checks=False,
                )
            samples = trace.posterior["mean"].values.reshape(-1)
            return sanitize_json({
                "posterior_mean": float(samples.mean()),
                "posterior_std": float(samples.std()),
                "credible_interval_95": [
                    float(np.quantile(samples, 0.025)),
                    float(np.quantile(samples, 0.975)),
                ],
                "sample_count": int(samples.size),
            })
        except DomainError:
            raise
        except Exception as exc:
            raise DomainError(
                DomainErrorCode.CALCULATION_FAILED,
                f"PyMC sampling failed: {type(exc).__name__}: {exc}",
            ) from exc


class PymooAdapter:
    provider_id = "ugsci-optimization-pymoo"
    dependency_package = "pymoo"
    provider_version = ""
    engine_version = "1.0.0"
    deterministic = False
    operation = "optimization.quadratic.pareto"

    def compute(self, request: MultiObjectiveQuadraticRequest) -> dict[str, Any]:
        try:
            import numpy as np
            from pymoo.algorithms.moo.nsga2 import NSGA2
            from pymoo.core.problem import ElementwiseProblem
            from pymoo.optimize import minimize
        except ImportError as exc:
            raise _missing("pymoo", exc) from exc

        centers = np.asarray(request.centers, dtype=float)
        bounds = np.asarray(request.bounds, dtype=float)

        class QuadraticProblem(ElementwiseProblem):
            def __init__(self) -> None:
                super().__init__(
                    n_var=bounds.shape[0],
                    n_obj=centers.shape[0],
                    xl=bounds[:, 0],
                    xu=bounds[:, 1],
                )

            def _evaluate(self, x: Any, out: dict[str, Any], *args: Any, **kwargs: Any) -> None:
                del args, kwargs
                out["F"] = np.sum((centers - x) ** 2, axis=1)

        result = minimize(
            QuadraticProblem(),
            NSGA2(pop_size=request.population_size),
            ("n_gen", request.generations),
            seed=request.seed,
            verbose=False,
        )
        solutions = [
            {"variables": x.tolist(), "objectives": f.tolist()}
            for x, f in zip(result.X, result.F)
        ]
        return sanitize_json({"solutions": solutions, "solution_count": len(solutions)})


class SimPyAdapter:
    provider_id = "ugsci-queue-simpy"
    dependency_package = "simpy"
    provider_version = ""
    engine_version = "1.0.0"
    deterministic = True
    operation = "simulation.queue.deterministic"

    def compute(self, request: QueueSimulationRequest) -> dict[str, Any]:
        try:
            import simpy
        except ImportError as exc:
            raise _missing("simpy", exc) from exc
        env = simpy.Environment()
        resource = simpy.Resource(env, capacity=request.servers)
        waits: list[float] = []
        completed = 0

        def customer(arrival: float):
            nonlocal completed
            with resource.request() as token:
                yield token
                waits.append(float(env.now - arrival))
                yield env.timeout(request.service_time)
                completed += 1

        def arrivals():
            arrival = 0.0
            while arrival <= request.duration:
                env.process(customer(arrival))
                yield env.timeout(request.arrival_interval)
                arrival += request.arrival_interval

        env.process(arrivals())
        env.run(until=request.duration)
        return {
            "arrivals": len(waits),
            "completed": completed,
            "average_wait": sum(waits) / len(waits) if waits else 0.0,
            "maximum_wait": max(waits, default=0.0),
            "servers": request.servers,
        }


class NetworkXAdapter:
    provider_id = "ugsci-graph-networkx"
    dependency_package = "networkx"
    provider_version = ""
    engine_version = "1.0.0"
    deterministic = True
    operation = "graph.network.analyze"

    def compute(self, request: GraphAnalysisRequest) -> dict[str, Any]:
        try:
            import networkx as nx
        except ImportError as exc:
            raise _missing("networkx", exc) from exc
        graph = nx.DiGraph() if request.directed else nx.Graph()
        graph.add_nodes_from(request.nodes)
        graph.add_edges_from((edge[0], edge[1]) for edge in request.edges)
        components = (
            list(nx.weakly_connected_components(graph))
            if request.directed
            else list(nx.connected_components(graph))
        )
        shortest_path = None
        if request.source is not None and request.target is not None:
            shortest_path = (
                nx.shortest_path(graph, request.source, request.target)
                if nx.has_path(graph, request.source, request.target)
                else None
            )
        return sanitize_json({
            "node_count": graph.number_of_nodes(),
            "edge_count": graph.number_of_edges(),
            "component_count": len(components),
            "density": float(nx.density(graph)),
            "degree_centrality": nx.degree_centrality(graph),
            "shortest_path": shortest_path,
        })


class GeoPandasAdapter:
    provider_id = "ugsci-geospatial-geopandas"
    dependency_package = "geopandas"
    provider_version = ""
    engine_version = "1.0.0"
    deterministic = True
    operation = "geospatial.points.analyze"

    def compute(self, request: GeospatialPointsRequest) -> dict[str, Any]:
        try:
            import geopandas as gpd
        except ImportError as exc:
            raise _missing("geopandas", exc) from exc
        frame = gpd.GeoDataFrame(
            geometry=gpd.points_from_xy(
                [point[0] for point in request.points],
                [point[1] for point in request.points],
            ),
            crs=request.crs,
        )
        centroid = frame.unary_union.centroid
        bounds = frame.total_bounds.tolist()
        return sanitize_json({
            "point_count": len(frame),
            "crs": str(frame.crs),
            "bounds": bounds,
            "centroid": [float(centroid.x), float(centroid.y)],
        })


class ScikitLearnAdapter:
    provider_id = "ugsci-ml-scikit-learn"
    dependency_package = "scikit-learn"
    provider_version = ""
    engine_version = "1.0.0"
    deterministic = True
    operation = "machine_learning.linear_regression"

    def compute(self, request: MachineLearningRegressionRequest) -> dict[str, Any]:
        try:
            from sklearn.linear_model import LinearRegression
            from sklearn.metrics import mean_squared_error, r2_score
        except ImportError as exc:
            raise _missing("scikit-learn", exc) from exc
        model = LinearRegression().fit(request.features, request.targets)
        fitted = model.predict(request.features)
        predicted = model.predict(request.predict_features)
        return sanitize_json({
            "coefficients": model.coef_.tolist(),
            "intercept": float(model.intercept_),
            "training_r_squared": float(r2_score(request.targets, fitted)),
            "training_rmse": float(math.sqrt(mean_squared_error(request.targets, fitted))),
            "predictions": predicted.tolist(),
        })


class StatsmodelsAdapter:
    provider_id = "ugsci-statistics-statsmodels"
    dependency_package = "statsmodels"
    provider_version = ""
    engine_version = "1.0.0"
    deterministic = True
    operation = "statistics.ols_regression"

    def compute(self, request: StatisticalRegressionRequest) -> dict[str, Any]:
        try:
            import statsmodels.api as sm
        except ImportError as exc:
            raise _missing("statsmodels", exc) from exc
        design = sm.add_constant(request.features, has_constant="add")
        fit = sm.OLS(request.targets, design).fit()
        names = ["intercept", *request.feature_names]
        return sanitize_json({
            "coefficients": dict(zip(names, fit.params.tolist())),
            "standard_errors": dict(zip(names, fit.bse.tolist())),
            "p_values": dict(zip(names, fit.pvalues.tolist())),
            "r_squared": float(fit.rsquared),
            "adjusted_r_squared": float(fit.rsquared_adj),
            "observation_count": int(fit.nobs),
        })
