# -*- coding: utf-8 -*-
"""Serialization helpers for domain results.

These functions ensure that third-party numeric types (numpy scalars,
numpy arrays, pandas types) never leak into JSON-serialised output.
"""

from __future__ import annotations

import math
from typing import Any

from .errors import DomainError, DomainErrorCode


def to_python_float(value: Any) -> float | None:
    """Convert a numeric value to a plain Python float or None.

    Handles numpy scalars, numpy arrays of size 1, and Python numbers.
    Returns ``None`` for NaN, Infinity, or non-finite values.
    """
    if value is None:
        return None
    # Convert numpy scalar / 0-d array / 1-element array → Python float
    if hasattr(value, "item"):
        try:
            value = value.item()
        except Exception:
            pass
    if hasattr(value, "__len__") and not isinstance(value, str):
        try:
            if len(value) == 1:
                value = value[0]
            else:
                # Multi-element array cannot be converted to a scalar
                return None
        except TypeError:
            pass
    try:
        result = float(value)
    except (TypeError, ValueError):
        return None
    if math.isnan(result) or math.isinf(result):
        return None
    return result


def safe_float(value: Any, default: float = 0.0) -> float:
    """Convert a numeric value to a plain Python float, with a default.

    Unlike ``to_python_float(x) or 0.0``, this function correctly
    preserves ``0.0`` (which is falsy in Python) and only falls back
    to ``default`` when the value is ``None`` or non-finite.

    >>> safe_float(0.0)      # returns 0.0, not the default
    >>> safe_float(None)     # returns default (0.0)
    >>> safe_float(float('nan'))  # returns default (0.0)
    """
    result = to_python_float(value)
    return result if result is not None else default


def to_python_list(values: Any) -> list[float | None]:
    """Convert an iterable of numeric values to a list of Python floats.

    NaN, Infinity, and non-finite values become ``None``.
    """
    if values is None:
        return []
    # Handle numpy arrays and pandas Series
    if hasattr(values, "tolist"):
        try:
            values = values.tolist()
        except Exception:
            pass
    result: list[float | None] = []
    for v in values:
        result.append(to_python_float(v))
    return result


def sanitize_json(value: Any) -> Any:
    """Recursively sanitize a value for JSON serialization.

    - numpy scalars/arrays → Python float/list
    - NaN/Infinity → None
    - dict/list → recursively sanitized
    - other → returned as-is
    """
    if value is None:
        return None
    if isinstance(value, bool):
        return value
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None
        return value
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        return {str(k): sanitize_json(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [sanitize_json(v) for v in value]
    # Try numpy scalar
    if hasattr(value, "item"):
        try:
            return sanitize_json(value.item())
        except Exception:
            pass
    # Try numpy array
    if hasattr(value, "tolist"):
        try:
            return sanitize_json(value.tolist())
        except Exception:
            pass
    # Fallback: try float conversion
    try:
        return to_python_float(value)
    except Exception:
        return None


def validate_json_safe(data: Any) -> None:
    """Raise DomainError if *data* contains non-JSON-safe values.

    This is a post-condition check: after serialisation, no NaN,
    Infinity, or numpy types should remain.
    """
    _check_json_safe(data)


def _check_json_safe(value: Any) -> None:
    if value is None or isinstance(value, bool | int | str):
        return
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            raise DomainError(
                DomainErrorCode.INVALID_RESULT,
                "Result contains NaN or Infinity",
            )
        return
    if isinstance(value, dict):
        for v in value.values():
            _check_json_safe(v)
        return
    if isinstance(value, list | tuple):
        for v in value:
            _check_json_safe(v)
        return
    # Reject unknown types (numpy objects, etc.)
    raise DomainError(
        DomainErrorCode.INVALID_RESULT,
        f"Result contains non-JSON-safe type: {type(value).__name__}",
    )
