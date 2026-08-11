# -*- coding: utf-8 -*-
"""Result envelope and artifact reference for domain operations."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class ArtifactRef:
    """Reference to an output artifact (file, plot, etc.).

    Attributes:
        path: Relative or workspace-scoped path to the artifact.
        media_type: MIME type (e.g. ``application/json``, ``image/png``).
        description: Human-readable description of the artifact.
    """

    path: str
    media_type: str
    description: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "path": self.path,
            "media_type": self.media_type,
            "description": self.description,
        }


@dataclass
class DomainResult:
    """Standard result envelope for all domain operations.

    Every domain tool returns a ``DomainResult`` serialised to JSON-safe
    dict.  Third-party objects (numpy arrays, pandas DataFrames, lasio
    objects) must never appear in ``result`` or ``metrics``.
    """

    schema_version: int = 1
    engine_id: str = ""
    engine_version: str = ""
    provider_id: str = ""
    provider_version: str = ""
    operation: str = ""
    method: str = ""
    deterministic: bool = True
    result: dict[str, Any] = field(default_factory=dict)
    units: dict[str, str] = field(default_factory=dict)
    metrics: dict[str, float | int | str | None] = field(default_factory=dict)
    assumptions: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    tolerances: dict[str, float | int | str] = field(default_factory=dict)
    applicability: list[str] = field(default_factory=list)
    provenance: dict[str, Any] = field(default_factory=dict)
    artifacts: list[ArtifactRef] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        """Serialise to a JSON-safe dict.

        Raises ``ValueError`` if any value cannot be JSON-serialised,
        which the caller should convert to a ``DomainError``.
        """
        return {
            "schema_version": self.schema_version,
            "engine_id": self.engine_id,
            "engine_version": self.engine_version,
            "provider_id": self.provider_id,
            "provider_version": self.provider_version,
            "operation": self.operation,
            "method": self.method,
            "deterministic": self.deterministic,
            "result": self.result,
            "units": self.units,
            "metrics": self.metrics,
            "assumptions": self.assumptions,
            "warnings": self.warnings,
            "tolerances": self.tolerances,
            "applicability": self.applicability,
            "provenance": self.provenance,
            "artifacts": [a.to_dict() for a in self.artifacts],
        }
