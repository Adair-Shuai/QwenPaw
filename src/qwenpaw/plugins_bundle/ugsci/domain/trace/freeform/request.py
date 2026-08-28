# -*- coding: utf-8 -*-
"""Layer 1 — Pydantic-free request models for freeform tools.

These are plain dataclasses that validate the *shape* of a request before
SymPy is ever involved.  They deliberately avoid a hard pydantic dependency
so the freeform module loads in any install.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Any

from ...common.errors import DomainError, DomainErrorCode


# ── Derive ──────────────────────────────────────────────────────────────────


@dataclass
class DeriveFormulaRequest:
    """``ugsci_derive_formula`` — symbolic rearrangement + trace."""

    expression: str
    solve_for: str = ""
    symbols: dict[str, str] = field(default_factory=dict)
    assumptions: list[str] = field(default_factory=list)
    max_steps: int = 25
    idempotent: bool = False  # whether simplify is allowed

    def validate(self) -> "DeriveFormulaRequest":
        if not self.expression or not self.expression.strip():
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "expression is required",
            )
        if self.max_steps < 1 or self.max_steps > 100:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                f"max_steps must be between 1 and 100, got {self.max_steps}",
            )
        return self

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "DeriveFormulaRequest":
        if not isinstance(data, dict):
            raise DomainError(DomainErrorCode.INVALID_INPUT, "request must be a dict")
        return cls(
            expression=str(data.get("expression", "")),
            solve_for=str(data.get("solve_for", "")),
            symbols=dict(data.get("symbols") or {}),
            assumptions=list(data.get("assumptions") or []),
            max_steps=int(data.get("max_steps", 25)),
            idempotent=bool(data.get("idempotent", False)),
        ).validate()


# ── Evaluate ───────────────────────────────────────────────────────────────


@dataclass
class EvaluateFormulaRequest:
    """``ugsci_evaluate_formula`` — numeric substitution + trace."""

    expression: str
    inputs: dict[str, float] = field(default_factory=dict)
    units: dict[str, str] = field(default_factory=dict)
    output_symbol: str = ""
    tolerance: float = 1e-8
    max_steps: int = 25

    def validate(self) -> "EvaluateFormulaRequest":
        if not self.expression or not self.expression.strip():
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "expression is required",
            )
        if not self.inputs:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "at least one input value is required",
            )
        for key, val in self.inputs.items():
            if not isinstance(val, (int, float)) or isinstance(val, bool):
                raise DomainError(
                    DomainErrorCode.INVALID_INPUT,
                    f"input '{key}' must be numeric",
                )
            if isinstance(val, float) and not (val == val and val != float("inf") and val != float("-inf")):
                raise DomainError(
                    DomainErrorCode.INVALID_INPUT,
                    f"input '{key}' must be finite",
                )
        if not math.isfinite(self.tolerance) or self.tolerance <= 0:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "tolerance must be positive and finite",
            )
        if self.max_steps < 1 or self.max_steps > 100:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                f"max_steps must be between 1 and 100, got {self.max_steps}",
            )
        return self

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "EvaluateFormulaRequest":
        if not isinstance(data, dict):
            raise DomainError(DomainErrorCode.INVALID_INPUT, "request must be a dict")
        return cls(
            expression=str(data.get("expression", "")),
            inputs=dict(data.get("inputs") or {}),
            units=dict(data.get("units") or {}),
            output_symbol=str(data.get("output_symbol", "")),
            tolerance=float(data.get("tolerance", 1e-8)),
            max_steps=int(data.get("max_steps", 25)),
        ).validate()


# ── Transform ──────────────────────────────────────────────────────────────


@dataclass
class TransformFormulaRequest:
    """``ugsci_transform_formula`` — rename / rearrange a given equation."""

    expression: str
    operation: str = "rearrange"  # rearrange | substitute | simplify | expand | collect | solve_for
    solve_for: str = ""
    substitution: dict[str, str] = field(default_factory=dict)
    symbols: dict[str, str] = field(default_factory=dict)
    max_steps: int = 25
    idempotent: bool = False

    _VALID_OPS = frozenset({
        "rearrange", "substitute", "simplify", "expand", "collect", "solve_for",
    })

    def validate(self) -> "TransformFormulaRequest":
        if not self.expression or not self.expression.strip():
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "expression is required",
            )
        if self.operation not in self._VALID_OPS:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                f"operation must be one of {sorted(self._VALID_OPS)}, got '{self.operation}'",
            )
        if self.operation in ("rearrange", "solve_for") and not self.solve_for:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                f"solve_for is required for operation '{self.operation}'",
            )
        if self.operation == "substitute" and not self.substitution:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "substitution map is required for operation 'substitute'",
            )
        if self.max_steps < 1 or self.max_steps > 100:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                f"max_steps must be between 1 and 100, got {self.max_steps}",
            )
        return self

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "TransformFormulaRequest":
        if not isinstance(data, dict):
            raise DomainError(DomainErrorCode.INVALID_INPUT, "request must be a dict")
        return cls(
            expression=str(data.get("expression", "")),
            operation=str(data.get("operation", "rearrange")),
            solve_for=str(data.get("solve_for", "")),
            substitution=dict(data.get("substitution") or {}),
            symbols=dict(data.get("symbols") or {}),
            max_steps=int(data.get("max_steps", 25)),
            idempotent=bool(data.get("idempotent", False)),
        ).validate()


# ── Preview ─────────────────────────────────────────────────────────────────


@dataclass
class FormulaPreviewRequest:
    """``ugsci_formula_preview`` — dry-run parse + validate."""

    expression: str
    symbols: dict[str, str] = field(default_factory=dict)

    def validate(self) -> "FormulaPreviewRequest":
        if not self.expression or not self.expression.strip():
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "expression is required",
            )
        return self

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "FormulaPreviewRequest":
        if not isinstance(data, dict):
            raise DomainError(DomainErrorCode.INVALID_INPUT, "request must be a dict")
        return cls(
            expression=str(data.get("expression", "")),
            symbols=dict(data.get("symbols") or {}),
        ).validate()


__all__ = [
    "DeriveFormulaRequest",
    "EvaluateFormulaRequest",
    "FormulaPreviewRequest",
    "TransformFormulaRequest",
]
