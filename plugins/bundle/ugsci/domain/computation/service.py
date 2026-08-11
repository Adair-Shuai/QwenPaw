# -*- coding: utf-8 -*-
"""Validation and stable result envelopes for scientific computations."""

from __future__ import annotations

import dataclasses
import hashlib
import importlib.metadata
import json
import math
from typing import Any

from ..common.errors import DomainError, DomainErrorCode
from ..common.result import DomainResult
from ..common.serialization import sanitize_json
from .ports import ComputationAdapter, ComputationOutput, Request


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
        raw_output = adapter.compute(request)
        output = (
            raw_output
            if isinstance(raw_output, ComputationOutput)
            else ComputationOutput(result=raw_output)
        )
        provider_version = getattr(adapter, "provider_version", "")
        if not provider_version:
            package_name = getattr(adapter, "dependency_package", "")
            if package_name:
                try:
                    provider_version = importlib.metadata.version(package_name)
                except importlib.metadata.PackageNotFoundError:
                    provider_version = "unknown"
        engine_version = getattr(adapter, "engine_version", "1.0.0")
        deterministic = bool(getattr(adapter, "deterministic", True))
        provenance = {
            "engine_id": engine_id,
            "engine_version": engine_version,
            "provider_id": adapter.provider_id,
            "provider_version": provider_version or "unknown",
            "operation": adapter.operation,
            "method": method,
            "deterministic": deterministic,
            "input_fingerprint": self._fingerprint(request),
            "support_libraries": self._support_library_versions(adapter),
        }
        return DomainResult(
            engine_id=engine_id,
            engine_version=engine_version,
            provider_id=adapter.provider_id,
            provider_version=provider_version or "unknown",
            operation=adapter.operation,
            method=method,
            deterministic=deterministic,
            result=sanitize_json(output.result),
            units=units or output.units,
            metrics=sanitize_json(output.metrics),
            assumptions=[*(assumptions or []), *output.assumptions],
            warnings=output.warnings,
            tolerances=output.tolerances,
            applicability=output.applicability,
            provenance=provenance,
            artifacts=[],
        )

    @staticmethod
    def _fingerprint(request: Any) -> str:
        if dataclasses.is_dataclass(request):
            payload = dataclasses.asdict(request)
        else:
            payload = request
        encoded = json.dumps(
            sanitize_json(payload),
            ensure_ascii=True,
            sort_keys=True,
            separators=(",", ":"),
        ).encode("utf-8")
        return f"sha256:{hashlib.sha256(encoded).hexdigest()}"

    @staticmethod
    def _support_library_versions(adapter: ComputationAdapter) -> dict[str, str]:
        versions: dict[str, str] = {}
        for package in getattr(adapter, "support_dependencies", ()):
            try:
                versions[package] = importlib.metadata.version(package)
            except importlib.metadata.PackageNotFoundError:
                versions[package] = "unavailable"
        return versions

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
