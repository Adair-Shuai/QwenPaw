# -*- coding: utf-8 -*-
"""Curated UGS / petroleum formula library.

Each ``FormulaSpec`` declares a vetted, version-pinned derivation with its
symbols, unit dimensions, applicability, and a ``case`` callable that walks a
``TraceRecorder`` through the derivation and returns a ``DomainResult``.

Formulas are authored to run without SymPy: symbolic step text (plain and
LaTeX) is written out by the spec, and numeric evaluation is plain Python.
SymPy is only needed later by freeform mode for parsing agent-authored
expressions.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable

from ...common.errors import DomainError, DomainErrorCode
from ...common.result import DomainResult
from ..models import DerivationTrace  # noqa: F401  (re-exported)
from ..recorder import TraceRecorder

# A ``case`` receives the input dict and a TraceRecorder, validates and
# computes, and returns the standard DomainResult envelope.  The recorder's
# trace is attached at the tool layer.
FormulaCase = Callable[[dict[str, Any], TraceRecorder], DomainResult]


@dataclass(frozen=True)
class FormulaSpec:
    """Declarative metadata for one curated derivation."""

    formula_id: str
    name: str
    method: str
    description: str
    symbols: str
    unit_dimensions: dict[str, str]
    applicability: list[str]
    assumptions: list[str]
    case: FormulaCase = field(compare=False, repr=False)
    version: str = "1.0.0"
    reference: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "formula_id": self.formula_id,
            "name": self.name,
            "method": self.method,
            "description": self.description,
            "symbols": self.symbols,
            "unit_dimensions": self.unit_dimensions,
            "applicability": self.applicability,
            "assumptions": self.assumptions,
            "version": self.version,
            "reference": self.reference,
        }


class FormulaLibrary:
    """Registry of curated derivations, keyed by ``formula_id``."""

    def __init__(self) -> None:
        self._formulas: dict[str, FormulaSpec] = {}

    def register(self, spec: FormulaSpec) -> None:
        if spec.formula_id in self._formulas:
            raise ValueError(f"duplicate formula: {spec.formula_id}")
        self._formulas[spec.formula_id] = spec

    def get(self, formula_id: str) -> FormulaSpec:
        spec = self._formulas.get(formula_id)
        if spec is None:
            raise DomainError(
                DomainErrorCode.UNSUPPORTED_OPERATION,
                f"No curated derivation formula: {formula_id}",
            )
        return spec

    def has(self, formula_id: str) -> bool:
        return formula_id in self._formulas

    def list(self) -> list[dict[str, Any]]:
        return [spec.to_dict() for spec in self._formulas.values()]


def build_default_library() -> FormulaLibrary:
    from .material_balance import GAS_PZ_FORMULA

    library = FormulaLibrary()
    for spec in (GAS_PZ_FORMULA,):
        library.register(spec)
    return library


default_library = build_default_library()

__all__ = [
    "FormulaCase",
    "FormulaLibrary",
    "FormulaSpec",
    "default_library",
    "DerivationTrace",
]
