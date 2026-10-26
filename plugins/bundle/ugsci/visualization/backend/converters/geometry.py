"""Shared geometry contracts for independently reusable domain converters.

Positions use an explicit right-handed, Z-up frame. Scalars keep missing
measurements as IEEE NaN in binary resources; JSON descriptors never contain
NaN. A renderer must use the declared association rather than guess it from
array lengths.
"""

from __future__ import annotations

import hashlib
import math
from typing import Any

from ..security import sanitize_identifier

FLOAT32_MAX = 3.4028234663852886e38


def finite_number(value: Any, field: str) -> float:
    """Validate a coordinate before any output is written."""
    try:
        result = float(value)
    except (TypeError, ValueError, OverflowError) as exc:
        raise ValueError(f"{field} 必须是有效数值") from exc
    if not math.isfinite(result) or abs(result) > FLOAT32_MAX:
        raise ValueError(f"{field} 必须是有限的 float32 数值")
    return result


def optional_scalar(value: Any, field: str) -> float:
    """Missing values are unknown, never a measured zero."""
    if value is None or (isinstance(value, str) and not value.strip()):
        return math.nan
    try:
        if math.isnan(float(value)):
            return math.nan
    except (TypeError, ValueError, OverflowError):
        pass
    return finite_number(value, field)


def resource_name(name: str) -> str:
    fallback = "dataset_" + hashlib.sha256(name.encode("utf-8")).hexdigest()[:12]
    return sanitize_identifier(name, fallback)


def geometry_metadata(primitive: str, association: str) -> dict[str, Any]:
    return {
        "geometry_primitive": primitive,
        "scalar_association": association,
        "coordinate_system": {
            "axis_order": "x,y,z", "z_positive": "up",
            "source_z_positive": "down", "length_unit": "m",
        },
    }


def property_descriptor(
    label: str, association: str, count: int, unit: str | None = None,
) -> dict[str, Any]:
    return {
        "label": label, "association": association, "count": count,
        "unit": unit, "no_data": "nan",
    }
