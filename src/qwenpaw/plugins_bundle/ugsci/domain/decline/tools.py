# -*- coding: utf-8 -*-
"""Decline analysis domain tools — stable, namespaced public interface.

Tool names are frozen: ``ugsci_decline_fit``, ``ugsci_decline_forecast``,
``ugsci_decline_eur``.  These names must not change without a migration
plan.

Each tool returns an AgentScope ``ToolChunk``.  The ``agentscope`` import
is deferred to the function body so that importing this module does not
require agentscope at module load time.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from ..common.errors import DomainError, wrap_unknown_error
from ..common.tool_chunk import emit_tool_chunk
from .adapters.scipy_arps import ScipyArpsAdapter
from .service import DeclineAnalysisService

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.domain.decline.tools")

# Singleton service — created lazily
_service: DeclineAnalysisService | None = None

# --- agentscope availability check -------------------------------------------

_agentscope_available: bool | None = None


def _check_agentscope() -> bool:
    """Return True if agentscope can be imported, False otherwise."""
    global _agentscope_available
    if _agentscope_available is None:
        try:
            from agentscope.message import TextBlock, ToolResultState  # noqa: F401
            from agentscope.tool import ToolChunk  # noqa: F401

            _agentscope_available = True
        except Exception:
            # Catch ImportError, ModuleNotFoundError, and any other
            # exception that might arise from a broken agentscope install.
            _agentscope_available = False
    return _agentscope_available


def _get_service() -> DeclineAnalysisService:
    global _service
    if _service is None:
        _service = DeclineAnalysisService(ScipyArpsAdapter())
    return _service


def _make_error_chunk(exc: DomainError) -> Any:
    """Build a ToolChunk for an error result.

    If agentscope is unavailable, returns a plain dict fallback
    so that the tool never crashes the agent session.
    """
    payload = json.dumps(exc.to_dict(), ensure_ascii=False, indent=2)
    if not _check_agentscope():
        logger.error(
            "agentscope not available; returning plain dict error: %s",
            exc.message,
        )
        return {"error": True, "payload": exc.to_dict()}

    from agentscope.message import TextBlock, ToolResultState
    from agentscope.tool import ToolChunk

    return ToolChunk(
        is_last=True,
        state=ToolResultState.ERROR,
        content=[
            TextBlock(
                type="text",
                text=payload,
            ),
        ],
    )


def _make_success_chunk(result_dict: dict[str, Any]) -> Any:
    return emit_tool_chunk(result_dict, error=False)


async def ugsci_decline_fit(
    time: list[float],
    rate: list[float],
    time_unit: str,
    rate_unit: str,
    model: str = "auto",
) -> Any:
    """Fit Arps decline curve(s) to production data.

    Args:
        time: List of time values (relative, starting from 0 or first production).
        rate: List of production rates corresponding to each time value.
        time_unit: Unit of time (e.g. ``"month"``, ``"day"``, ``"year"``).
        rate_unit: Unit of rate (e.g. ``"bbl/d"``, ``"m3/d"``).
        model: Decline model to fit: ``"auto"``, ``"exponential"``,
            ``"harmonic"``, or ``"hyperbolic"`` (default ``"auto"``).

    Returns:
        ToolChunk with JSON containing fit parameters, metrics, and
        recommended model (for ``model=auto``).
    """
    try:
        service = _get_service()
        result = service.fit(time, rate, time_unit, rate_unit, model=model)
        return _make_success_chunk(result.to_dict())
    except DomainError as exc:
        return _make_error_chunk(exc)
    except Exception as exc:
        return _make_error_chunk(wrap_unknown_error(exc))


async def ugsci_decline_forecast(
    model: str,
    qi: float,
    di: float,
    b: float | None,
    forecast_time: list[float],
    time_unit: str,
    rate_unit: str,
) -> Any:
    """Forecast production rates at specified times using decline parameters.

    Args:
        model: Decline model: ``"exponential"``, ``"harmonic"``, or ``"hyperbolic"``.
        qi: Initial production rate.
        di: Initial decline rate.
        b: Hyperbolic exponent (required for ``"hyperbolic"``, ignored otherwise).
        forecast_time: List of time values to forecast.
        time_unit: Unit of time.
        rate_unit: Unit of rate.

    Returns:
        ToolChunk with JSON containing forecasted rates at each time.
    """
    try:
        service = _get_service()
        result = service.forecast(
            model,
            qi,
            di,
            b,
            forecast_time,
            time_unit,
            rate_unit,
        )
        return _make_success_chunk(result.to_dict())
    except DomainError as exc:
        return _make_error_chunk(exc)
    except Exception as exc:
        return _make_error_chunk(wrap_unknown_error(exc))


async def ugsci_decline_eur(
    model: str,
    qi: float,
    di: float,
    b: float | None,
    time_unit: str,
    rate_unit: str,
    forecast_end: float | None = None,
    economic_limit: float | None = None,
) -> Any:
    """Compute Estimated Ultimate Recovery (EUR) for a decline model.

    At least one of ``forecast_end`` or ``economic_limit`` must be provided.

    Args:
        model: Decline model: ``"exponential"``, ``"harmonic"``, or ``"hyperbolic"``.
        qi: Initial production rate.
        di: Initial decline rate.
        b: Hyperbolic exponent (required for ``"hyperbolic"``).
        time_unit: Unit of time.
        rate_unit: Unit of rate.
        forecast_end: End time for cumulative production.
        economic_limit: Economic limit rate (production stops when rate drops below this).

    Returns:
        ToolChunk with JSON containing cumulative production and effective end time.
    """
    try:
        service = _get_service()
        result = service.eur(
            model,
            qi,
            di,
            b,
            time_unit,
            rate_unit,
            forecast_end=forecast_end,
            economic_limit=economic_limit,
        )
        return _make_success_chunk(result.to_dict())
    except DomainError as exc:
        return _make_error_chunk(exc)
    except Exception as exc:
        return _make_error_chunk(wrap_unknown_error(exc))
