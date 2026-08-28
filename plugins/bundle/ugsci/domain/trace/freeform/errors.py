# -*- coding: utf-8 -*-
"""Freeform-specific error helpers.

All freeform failures are surfaced as ``DomainError`` with a code from
``DomainErrorCode``.  The mapping follows the design doc §15:

+-----------------------------------+-------------------------------+----------+
| Condition                         | Code                          | Retryable|
+===================================+===============================+==========+
| sympy missing                     | dependency_unavailable        | no       |
| Parse fails / invalid syntax      | invalid_input                 | yes      |
| Symbol not in allowlist           | unsupported_operation         | yes      |
| Unit mismatch                      | invalid_input                 | yes      |
| Non-finite intermediate result    | invalid_result                | yes      |
| Exceeded op/symbol/depth cap      | non_convergent                | yes      |
| Transform timed out               | non_convergent                | yes      |
| Solve produced no real root       | calculation_failed            | yes      |
+-----------------------------------+-------------------------------+----------+
"""

from __future__ import annotations

from typing import Any

from ...common.errors import DomainError, DomainErrorCode


def dependency_unavailable(message: str = "SymPy is required for freeform mode") -> DomainError:
    """SymPy is not installed — freeform tools cannot run."""
    return DomainError(
        DomainErrorCode.DEPENDENCY_UNAVAILABLE,
        message,
        retryable=False,
    )


def parse_error(message: str, *, details: dict[str, Any] | None = None) -> DomainError:
    """Expression could not be parsed — agent should rephrase."""
    return DomainError(
        DomainErrorCode.INVALID_INPUT,
        f"Parse error: {message}",
        details=details,
        retryable=True,
    )


def symbol_not_allowed(name: str, *, allowed: list[str] | None = None) -> DomainError:
    """A symbol or function is outside the allowlist."""
    details: dict[str, Any] = {"offending_symbol": name}
    if allowed is not None:
        details["allowed"] = allowed
    return DomainError(
        DomainErrorCode.UNSUPPORTED_OPERATION,
        f"Symbol or function '{name}' is not in the freeform allowlist",
        details=details,
        retryable=True,
    )


def unit_mismatch(message: str, *, details: dict[str, Any] | None = None) -> DomainError:
    """Unit dimension incompatibility during evaluation."""
    return DomainError(
        DomainErrorCode.INVALID_INPUT,
        f"Unit mismatch: {message}",
        details=details,
        retryable=True,
    )


def non_finite_result(symbol: str, value: float) -> DomainError:
    """An intermediate numeric result is NaN or Infinity."""
    return DomainError(
        DomainErrorCode.INVALID_RESULT,
        f"Non-finite result for '{symbol}': {value}",
        details={"symbol": symbol, "value": str(value)},
        retryable=True,
    )


def guard_exceeded(cap_name: str, value: Any, limit: Any) -> DomainError:
    """A resource guard (ops, symbols, steps, magnitude, time) was hit."""
    return DomainError(
        DomainErrorCode.NON_CONVERGENT,
        f"Resource guard exceeded: {cap_name} = {value} (limit {limit})",
        details={"cap": cap_name, "value": str(value), "limit": str(limit)},
        retryable=True,
    )


def solve_no_real_root(symbol: str) -> DomainError:
    """``sp.solve`` produced no real-valued root."""
    return DomainError(
        DomainErrorCode.CALCULATION_FAILED,
        f"Solve produced no real root for '{symbol}'",
        details={"symbol": symbol},
        retryable=True,
    )


__all__ = [
    "dependency_unavailable",
    "guard_exceeded",
    "non_finite_result",
    "parse_error",
    "solve_no_real_root",
    "symbol_not_allowed",
    "unit_mismatch",
]
