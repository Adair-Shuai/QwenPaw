# -*- coding: utf-8 -*-
"""Agent tools for explicitly stochastic Providers."""

from __future__ import annotations

import json
from typing import Any

from ..common.errors import DomainError, DomainErrorCode, wrap_unknown_error
from ..common.tool_chunk import emit_tool_chunk
from ..computation.models import BayesianNormalRequest, MultiObjectiveQuadraticRequest
from ..computation.service import ComputationService, require, validate_matrix
from ..deterministic.providers import default_registry

_service = ComputationService()


def _chunk(payload: dict[str, Any], *, error: bool = False) -> Any:
    return emit_tool_chunk(payload, error=error)


def _run(capability_id: str, request: Any, method: str, assumptions: list[str]) -> Any:
    try:
        adapter = default_registry.resolve(capability_id, execution_class="stochastic")
        return _chunk(
            _service.execute(
                capability_id, adapter, request, method=method, assumptions=assumptions
            ).to_dict()
        )
    except DomainError as exc:
        return _chunk(exc.to_dict(), error=True)
    except Exception as exc:
        return _chunk(wrap_unknown_error(exc).to_dict(), error=True)


async def ugsci_bayesian_normal_estimate(
    observations: list[float],
    prior_mean: float = 0.0,
    prior_std: float = 10.0,
    observation_std: float = 1.0,
    draws: int = 1000,
    tune: int = 500,
    seed: int = 42,
) -> Any:
    """Estimate a normal mean with an explicitly stochastic PyMC Provider."""
    try:
        require(len(observations) >= 2, "At least two observations are required")
        require(
            prior_std > 0 and observation_std > 0,
            "Standard deviations must be positive",
        )
        require(
            100 <= draws <= 5000 and 0 <= tune <= 5000,
            "draws/tune are outside safe limits",
        )
        request = BayesianNormalRequest(
            [float(value) for value in observations],
            float(prior_mean),
            float(prior_std),
            float(observation_std),
            draws,
            tune,
            seed,
        )
    except DomainError as exc:
        return _chunk(exc.to_dict(), error=True)
    except (TypeError, ValueError) as exc:
        return _chunk(
            DomainError(
                DomainErrorCode.INVALID_INPUT, f"Invalid stochastic input: {exc}"
            ).to_dict(),
            error=True,
        )
    return _run(
        "statistics.bayesian.normal_mean",
        request,
        "mcmc_nuts",
        [
            "Normal likelihood with known observation standard deviation",
            "Seeded sampling is reproducible but remains stochastic",
        ],
    )


async def ugsci_multiobjective_quadratic(
    centers: list[list[float]],
    bounds: list[list[float]],
    population_size: int = 80,
    generations: int = 100,
    seed: int = 42,
) -> Any:
    """Compute a seeded stochastic NSGA-II Pareto set."""
    try:
        dimensions = validate_matrix(centers, "centers")
        require(len(centers) >= 2, "At least two objective centers are required")
        require(
            len(bounds) == dimensions
            and all(len(row) == 2 and row[0] < row[1] for row in bounds),
            "bounds must contain [lower, upper] for every variable",
        )
        require(
            20 <= population_size <= 500 and 10 <= generations <= 2000,
            "optimizer limits exceeded",
        )
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
        return _chunk(
            DomainError(
                DomainErrorCode.INVALID_INPUT, f"Invalid stochastic input: {exc}"
            ).to_dict(),
            error=True,
        )
    return _run(
        "optimization.quadratic.pareto",
        request,
        "nsga2",
        [
            "Seeded NSGA-II is reproducible for a fixed Provider version but remains stochastic"
        ],
    )


__all__ = ["ugsci_bayesian_normal_estimate", "ugsci_multiobjective_quadratic"]
