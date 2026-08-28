# -*- coding: utf-8 -*-
"""Traced-derivation data model for observable UGSci calculations.

A ``DerivationTrace`` is an ordered list of steps.  Each step is one of four
kinds: a symbolic transformation (rearrange / substitute / simplify / solve),
a variable binding (a symbol enters scope with a value and unit), a numeric
evaluation (a symbolic expression is evaluated with concrete values), or a
guard assertion (a tolerance / validity check, surfaced as a step so the
validation that used to be invisible becomes observable).

The trace is deliberately independent of SymPy.  Symbolic expressions are
carried as *strings* (both plain-text and LaTeX forms).  Curated formulas
author their step text directly; numerical evaluation is plain Python.
SymPy is only required later, by freeform mode, for parsing and algebra on
agent-authored expressions.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from ..common.result import DomainResult


class TraceStepKind(str, Enum):
    SYMBOLIC = "symbolic"
    BIND = "bind"
    EVALUATE = "evaluate"
    ASSERT = "assert"


class VariableSource(str, Enum):
    INPUT = "input"
    CONSTANT = "constant"
    PRIOR_STEP = "prior_step"
    DERIVED = "derived"


class TraceStepGroup(str, Enum):
    ASSEMBLE = "assemble"
    SUBSTITUTE = "substitute"
    REDUCE = "reduce"
    SOLVE = "solve"
    VERIFY = "verify"
    BIND = "bind"


@dataclass(frozen=True)
class VariableBinding:
    """One variable that enters scope during a derivation."""

    name: str
    symbol: str
    value: float | int | None
    unit: str = ""
    source: str = VariableSource.INPUT.value
    description: str = ""
    # Live-edit metadata (Phase 2): whether the trace card lets the user
    # change this value and re-run the derivation, plus an optional
    # (min, max) hint for a slider in the rendered form.
    editable: bool = False
    display_name: str = ""
    input_bounds: tuple[float | None, float | None] | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "symbol": self.symbol,
            "value": self.value,
            "unit": self.unit,
            "source": self.source,
            "description": self.description,
            "editable": self.editable,
            "display_name": self.display_name,
            "input_bounds": list(self.input_bounds) if self.input_bounds else None,
        }


@dataclass(frozen=True)
class TraceStep:
    """One observable step in a derivation."""

    id: str
    kind: TraceStepKind
    title: str
    description: str = ""
    expression: str = ""
    latex: str = ""
    unicode: str = ""
    operation: str = ""
    group: str = ""  # workflow stage label (e.g. 'assemble', 'substitute', 'solve')
    # Variable names this step reads and the single one it produces.
    reads: tuple[str, ...] = ()
    writes: str = ""
    # For evaluate steps: the symbol->value substitution map.
    substitutions: tuple[tuple[str, str], ...] = ()
    value: float | int | str | None = None
    unit: str = ""
    display_value: float | int | str | None = None
    display_unit: str = ""
    note: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "kind": self.kind.value,
            "title": self.title,
            "description": self.description,
            "expression": self.expression,
            "latex": self.latex,
            "unicode": self.unicode,
            "operation": self.operation,
            "group": self.group,
            "reads": list(self.reads),
            "writes": self.writes,
            "substitutions": [list(pair) for pair in self.substitutions],
            "value": self.value,
            "unit": self.unit,
            "display_value": self.display_value,
            "display_unit": self.display_unit,
            "note": self.note,
        }


@dataclass
class DerivationTrace:
    """The ordered derivation plus a registry of all observed variables."""

    title: str = ""
    formula_id: str = ""
    formula_name: str = ""
    formula_version: str = ""
    source: str = "curated"  # curated | freeform
    symbols: str = ""  # prettified derivation note
    steps: list[TraceStep] = field(default_factory=list)
    # name -> VariableBinding, insertion-ordered so the registry reads
    # the way the derivation does.
    variables: dict[str, VariableBinding] = field(default_factory=dict)
    # Live-edit input hints for the rendered worksheet: name -> (min, max).
    # Bounds are optional; a control still renders without them.
    input_bounds: dict[str, tuple[float | None, float | None]] = field(default_factory=dict)
    input_units: dict[str, str] = field(default_factory=dict)
    parameter_sources: dict[str, dict[str, Any]] = field(default_factory=dict)

    def __post_init__(self) -> None:
        self._step_index: dict[str, int] = {}

    def add_step(self, step: TraceStep) -> TraceStep:
        self._step_index[step.id] = len(self.steps)
        self.steps.append(step)
        return step

    def bind(self, binding: VariableBinding) -> VariableBinding:
        self.variables[binding.name] = binding
        if binding.editable and binding.input_bounds:
            self.input_bounds[binding.name] = binding.input_bounds
        return binding

    def get(self, name: str) -> VariableBinding | None:
        return self.variables.get(name)

    def to_dict(self) -> dict[str, Any]:
        return {
            "title": self.title,
            "formula_id": self.formula_id,
            "formula_name": self.formula_name,
            "formula_version": self.formula_version,
            "source": self.source,
            "symbols": self.symbols,
            "steps": [step.to_dict() for step in self.steps],
            "variables": [binding.to_dict() for binding in self.variables.values()],
            "input_bounds": {
                name: [bounds[0], bounds[1]] for name, bounds in self.input_bounds.items()
            },
            "input_units": dict(self.input_units),
            "parameter_sources": dict(self.parameter_sources),
        }


@dataclass
class TracedResult:
    """A DomainResult carrying an observable derivation trace.

    ``domain`` is the standard envelope (result, metrics, assumptions,
    provenance, …); ``trace`` is the ordered derivation.  ``to_dict`` merges
    both so existing GenUI rendering and the rest of the pipeline keep
    working unchanged — a traced result is a superset of a domain result.
    """

    domain: DomainResult
    trace: DerivationTrace

    def to_dict(self) -> dict[str, Any]:
        payload = self.domain.to_dict()
        payload["trace"] = self.trace.to_dict()
        return payload

    def to_domain_dict(self) -> dict[str, Any]:
        return self.domain.to_dict()


__all__ = [
    "DerivationTrace",
    "TraceStep",
    "TraceStepKind",
    "TraceStepGroup",
    "TracedResult",
    "VariableBinding",
    "VariableSource",
]
