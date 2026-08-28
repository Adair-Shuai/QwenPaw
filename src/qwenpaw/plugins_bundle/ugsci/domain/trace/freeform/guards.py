# -*- coding: utf-8 -*-
"""Layer 4 — centralised resource guards for freeform mode.

All hard caps are constants so tests can lock them (design doc §10).
When a cap is hit the engine stops, emits a **warning** step, and returns the
partial trace plus a ``warnings`` entry — it never hangs and never silently
truncates.  A thrown guard is a ``DomainError(NON_CONVERGENT)``.
"""

from __future__ import annotations

import math
import signal
import threading
from typing import Any

from ...common.errors import DomainError, DomainErrorCode
from . import errors as _ff_errors

# ── Hard caps (all constants, centralised per design §10) ──────────────────

MAX_SYMPY_OPS: int = 200
MAX_SYMBOLS: int = 32
MAX_TRACE_STEPS: int = 25
MAX_SUBS: int = 1_000
MAX_MAGNITUDE: float = 1e15
MAX_TRANSFORM_SECONDS: float = 5.0
ALLOW_SIMPLIFY: bool = False

# A timed-out Python thread cannot be forcefully stopped.  Keep at most one
# transform running after its caller has timed out so repeated requests cannot
# accumulate an unbounded number of CPU-heavy SymPy workers.
_TRANSFORM_SLOT = threading.BoundedSemaphore(1)


# ── Expression size guards ─────────────────────────────────────────────────


def check_op_count(expr: Any) -> None:
    """Reject expressions whose ``count_ops()`` exceeds ``MAX_SYMPY_OPS``."""
    try:
        ops = int(expr.count_ops())
    except Exception:
        ops = 0
    if ops > MAX_SYMPY_OPS:
        raise _ff_errors.guard_exceeded("MAX_SYMPY_OPS", ops, MAX_SYMPY_OPS)


def check_symbol_count(expr: Any) -> None:
    """Reject expressions with too many distinct free symbols."""
    try:
        symbols = expr.free_symbols
    except Exception:
        symbols = set()
    count = len(symbols)
    if count > MAX_SYMBOLS:
        raise _ff_errors.guard_exceeded("MAX_SYMBOLS", count, MAX_SYMBOLS)


def check_depth(expr: Any, *, max_depth: int = 50) -> None:
    """Reject expression trees deeper than ``max_depth``."""
    try:
        depth = _expr_depth(expr)
    except Exception:
        depth = 0
    if depth > max_depth:
        raise _ff_errors.guard_exceeded("MAX_DEPTH", depth, max_depth)


def _expr_depth(expr: Any, visited: set | None = None) -> int:
    """Recursive depth of a SymPy expression tree."""
    if visited is None:
        visited = set()
    expr_id = id(expr)
    if expr_id in visited:
        return 0
    visited.add(expr_id)
    args = getattr(expr, "args", ())
    if not args:
        return 1
    return 1 + max((_expr_depth(a, visited) for a in args), default=0)


# ── Numeric guards ──────────────────────────────────────────────────────────


def check_finite(value: float, symbol: str) -> float:
    """Ensure a numeric result is finite; raise ``invalid_result`` otherwise."""
    try:
        numeric = float(value)
    except (TypeError, ValueError) as exc:
        raise DomainError(
            DomainErrorCode.INVALID_RESULT,
            f"Non-numeric result for '{symbol}': {value}",
        ) from exc
    if not math.isfinite(numeric):
        raise _ff_errors.non_finite_result(symbol, numeric)
    return numeric


def check_magnitude(value: float, symbol: str) -> float:
    """Reject values whose magnitude exceeds ``MAX_MAGNITUDE``."""
    numeric = check_finite(value, symbol)
    if abs(numeric) > MAX_MAGNITUDE:
        raise _ff_errors.guard_exceeded("MAX_MAGNITUDE", abs(numeric), MAX_MAGNITUDE)
    return numeric


# ── Step counter guard ──────────────────────────────────────────────────────


def check_steps(current_count: int, max_steps: int | None = None) -> None:
    """Reject derivation traces exceeding ``MAX_TRACE_STEPS``."""
    limit = max_steps if max_steps is not None else MAX_TRACE_STEPS
    if current_count >= limit:
        raise _ff_errors.guard_exceeded("MAX_TRACE_STEPS", current_count, limit)


def check_substitutions(count: int) -> None:
    """Reject numeric or symbolic substitution maps above ``MAX_SUBS``."""
    if count > MAX_SUBS:
        raise _ff_errors.guard_exceeded("MAX_SUBS", count, MAX_SUBS)


# ── Timeout guard for transforms ─────────────────────────────────────────────


class _Timeout(Exception):
    """Internal timeout sentinel."""


def _windows_timeout_handler(signum: int, frame: Any) -> None:  # pragma: no cover
    raise _Timeout


def with_timeout(seconds: float | None, func, *args, **kwargs):
    """Run ``func(*args, **kwargs)`` with a wall-clock timeout.

    On Windows (where ``signal.SIGALRM`` is unavailable) a watchdog thread
    is used.  Python cannot forcefully stop that worker, so a timed-out call
    may finish in the background; a global slot prevents subsequent calls
    from creating more workers until it exits.
    """
    if seconds is None or seconds <= 0:
        return func(*args, **kwargs)

    if not _TRANSFORM_SLOT.acquire(blocking=False):
        raise _ff_errors.guard_exceeded(
            "MAX_TRANSFORM_CONCURRENCY", 1, 1,
        )

    result: dict[str, Any] = {"value": None, "error": None, "done": False}

    def _runner() -> None:
        try:
            result["value"] = func(*args, **kwargs)
        except Exception as exc:
            result["error"] = exc
        finally:
            result["done"] = True
            _TRANSFORM_SLOT.release()

    thread = threading.Thread(target=_runner, daemon=True)
    try:
        thread.start()
    except Exception:
        _TRANSFORM_SLOT.release()
        raise
    thread.join(timeout=seconds)

    if not result["done"]:
        raise _ff_errors.guard_exceeded(
            "MAX_TRANSFORM_SECONDS", seconds, MAX_TRANSFORM_SECONDS,
        )
    if result["error"] is not None:
        raise result["error"]
    return result["value"]


__all__ = [
    "ALLOW_SIMPLIFY",
    "MAX_MAGNITUDE",
    "MAX_SUBS",
    "MAX_SYMBOLS",
    "MAX_SYMPY_OPS",
    "MAX_TRACE_STEPS",
    "MAX_TRANSFORM_SECONDS",
    "check_depth",
    "check_finite",
    "check_magnitude",
    "check_op_count",
    "check_substitutions",
    "check_steps",
    "check_symbol_count",
    "with_timeout",
]
