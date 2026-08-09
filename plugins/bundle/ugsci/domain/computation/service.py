# -*- coding: utf-8 -*-
"""Validation and stable result envelopes for scientific computations."""

from __future__ import annotations

import math
from typing import Any

from ..common.errors import DomainError, DomainErrorCode
from ..common.result import DomainResult
from ..common.serialization import sanitize_json
from .ports import ComputationAdapter, Request


class ComputationService:
    """Execute validated UGSci requests through replaceable adapters."""

    def execute(
        self,
        engine_id: str,
        adapter: ComputationAdapter,
        request: Request,
        *,
        method: str,
        assumptions: list[str] | None = None,
        units: dict[str, str] | None = None,
    ) -> DomainResult:
        self._validate_finite(request)
        result = adapter.compute(request)
        return DomainResult(
            engine_id=engine_id,
            provider_id=adapter.provider_id,
            operation=adapter.operation,
            method=method,
            result=sanitize_json(result),
            units=units or {},
            metrics={},
            assumptions=assumptions or [],
            warnings=[],
            artifacts=[],
        )

    @classmethod
    def _validate_finite(cls, value: Any) -> None:
        if hasattr(value, "__dataclass_fields__"):
            for field_name in value.__dataclass_fields__:
                cls._validate_finite(getattr(value, field_name))
            return
        if isinstance(value, (list, tuple)):
            for item in value:
                cls._validate_finite(item)
            return
        if isinstance(value, float) and not math.isfinite(value):
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "Numeric inputs must be finite",
            )


def require(condition: bool, message: str) -> None:
    if not condition:
        raise DomainError(DomainErrorCode.INVALID_INPUT, message)


def validate_matrix(matrix: list[list[float]], name: str) -> int:
    require(bool(matrix), f"{name} must not be empty")
    width = len(matrix[0])
    require(width > 0, f"{name} rows must not be empty")
    require(all(len(row) == width for row in matrix), f"{name} must be rectangular")
    return width
