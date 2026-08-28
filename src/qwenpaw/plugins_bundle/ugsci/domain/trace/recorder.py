# -*- coding: utf-8 -*-
"""``TraceRecorder`` — build an ordered derivation trace step by step.

Adapters (curated formulas, and later freeform evaluation) call the recorder
to log each observable action.  The recorder assigns stable step ids, ingests
variable bindings into the registry, and emits the finished ``TracedResult``.

None of the recorder's methods depend on SymPy.  Symbolic step text is
passed in as authored strings; numeric evaluation is plain Python.  This keeps
the curated library runnable in a default install.
"""

from __future__ import annotations

from typing import Any

from ..common.errors import DomainError, DomainErrorCode
from ..common.result import DomainResult
from .asciimath import latex_fragment, to_unicode
from .models import (
    DerivationTrace,
    TraceStep,
    TraceStepGroup,
    TraceStepKind,
    TracedResult,
    VariableBinding,
    VariableSource,
)


class TraceRecorder:
    """Accumulates a derivation trace and produces a ``TracedResult``."""

    def __init__(
        self,
        *,
        title: str = "",
        formula_id: str = "",
        formula_name: str = "",
        formula_version: str = "",
        source: str = "curated",
        symbols: str = "",
        max_steps: int | None = None,
    ) -> None:
        self._trace = DerivationTrace(
            title=title,
            formula_id=formula_id,
            formula_name=formula_name,
            formula_version=formula_version,
            source=source,
            symbols=symbols,
        )
        self._counter = 0
        self._max_steps = max_steps

    # ── Step id / helpers ──────────────────────────────────────────────

    def _next_id(self, prefix: str) -> str:
        self._counter += 1
        return f"{prefix}{self._counter}"

    @property
    def trace(self) -> DerivationTrace:
        return self._trace

    @property
    def variables(self) -> dict[str, VariableBinding]:
        return self._trace.variables

    def set_max_steps(self, max_steps: int | None) -> None:
        """Apply an optional hard cap to subsequently recorded steps."""
        self._max_steps = max_steps

    def _ensure_capacity(self) -> None:
        if self._max_steps is not None and len(self._trace.steps) >= self._max_steps:
            raise DomainError(
                DomainErrorCode.NON_CONVERGENT,
                f"Trace step limit exceeded: {len(self._trace.steps)} >= {self._max_steps}",
                details={
                    "guard": "MAX_TRACE_STEPS",
                    "actual": len(self._trace.steps),
                    "limit": self._max_steps,
                },
                retryable=True,
            )

    # ── Variable bindings ──────────────────────────────────────────────

    def bind(
        self,
        name: str,
        symbol: str,
        value: float | int | None,
        unit: str = "",
        *,
        source: str = VariableSource.INPUT.value,
        description: str = "",
        editable: bool = False,
        display_name: str = "",
        input_bounds: tuple[float | None, float | None] | None = None,
    ) -> VariableBinding:
        """Register a variable (input, constant, or derived) in scope."""
        self._ensure_capacity()
        binding = VariableBinding(
            name=name,
            symbol=symbol,
            value=value,
            unit=unit,
            source=source,
            description=description,
            editable=editable,
            display_name=display_name,
            input_bounds=input_bounds,
        )
        self._trace.bind(binding)
        source_map = {
            VariableSource.INPUT.value: "user_input",
            VariableSource.CONSTANT.value: "constant",
            VariableSource.PRIOR_STEP.value: "derived_from",
            VariableSource.DERIVED.value: "derived_from",
        }
        self._trace.parameter_sources[name] = {
            "source": source_map.get(source, source),
            "value": value,
            "unit": unit,
        }
        if source in {VariableSource.PRIOR_STEP.value, VariableSource.DERIVED.value}:
            for step in reversed(self._trace.steps):
                if step.writes == name:
                    self._trace.parameter_sources[name]["step_id"] = step.id
                    break
        self._add(
            kind=TraceStepKind.BIND,
            title=f"Define {symbol}",
            reads=(),
            writes=name,
            value=value if isinstance(value, (int, float)) else None,
            unit=unit,
            note=binding.source.replace("_", " "),
            group=TraceStepGroup.BIND.value,
        )
        return binding

    # ── Symbolic steps ─────────────────────────────────────────────────

    def rearrange(
        self,
        title: str,
        expression: str,
        latex: str = "",
        *,
        group: str = "",
        description: str = "",
        reads: tuple[str, ...] = (),
        writes: str = "",
    ) -> TraceStep:
        """Log an algebraic rearrangement (e.g. solve an equation for a variable)."""
        return self._add(
            kind=TraceStepKind.SYMBOLIC,
            operation="rearrange",
            title=title,
            expression=expression,
            latex=latex,
            group=group,
            description=description,
            reads=reads,
            writes=writes,
        )

    def substitute(
        self,
        title: str,
        expression: str,
        latex: str = "",
        *,
        group: str = "",
        reads: tuple[str, ...] = (),
        writes: str = "",
        note: str = "",
    ) -> TraceStep:
        """Log a substitution (an expression is replaced by an equivalent form)."""
        return self._add(
            kind=TraceStepKind.SYMBOLIC,
            operation="substitute",
            title=title,
            expression=expression,
            latex=latex,
            group=group,
            reads=reads,
            writes=writes,
            note=note,
        )

    def simplify(
        self,
        title: str,
        expression: str,
        latex: str = "",
        *,
        group: str = "",
        description: str = "",
        reads: tuple[str, ...] = (),
        writes: str = "",
    ) -> TraceStep:
        return self._add(
            kind=TraceStepKind.SYMBOLIC,
            operation="simplify",
            title=title,
            expression=expression,
            latex=latex,
            group=group,
            description=description,
            reads=reads,
            writes=writes,
        )

    def solve(
        self,
        title: str,
        expression: str,
        latex: str = "",
        *,
        for_symbol: str = "",
        group: str = "",
        reads: tuple[str, ...] = (),
        writes: str = "",
        description: str = "",
        note: str = "",
    ) -> TraceStep:
        note = note or (f"Solve for {for_symbol}" if for_symbol else "")
        return self._add(
            kind=TraceStepKind.SYMBOLIC,
            operation="solve",
            title=title,
            expression=expression,
            latex=latex,
            group=group,
            description=description,
            reads=reads,
            writes=writes,
            note=note,
        )

    # ── Numeric evaluation ─────────────────────────────────────────────

    def evaluate(
        self,
        title: str,
        expression: str,
        value: float | int,
        unit: str = "",
        *,
        substitutions: tuple[tuple[str, str], ...] = (),
        reads: tuple[str, ...] = (),
        writes: str = "",
        latex: str = "",
        group: str = "",
        description: str = "",
        display_value: float | int | str | None = None,
        display_unit: str = "",
    ) -> TraceStep:
        return self._add(
            kind=TraceStepKind.EVALUATE,
            title=title,
            expression=expression,
            latex=latex,
            group=group,
            description=description,
            reads=reads,
            writes=writes,
            substitutions=substitutions,
            value=value,
            unit=unit,
            display_value=display_value,
            display_unit=display_unit,
        )

    # ── Guard assertion ────────────────────────────────────────────────

    def assert_true(
        self,
        title: str,
        passed: bool,
        *,
        detail: str = "",
        group: str = "",
        reads: tuple[str, ...] = (),
    ) -> TraceStep:
        return self._add(
            kind=TraceStepKind.ASSERT,
            title=title,
            description=detail,
            group=group,
            reads=reads,
            value=passed,
            note="passed" if passed else "failed",
        )

    # ── Finalize ───────────────────────────────────────────────────────

    def editable_inputs(self) -> list[VariableBinding]:
        """Return the variable bindings the user may edit in the worksheet."""
        return [
            binding
            for binding in self._trace.variables.values()
            if binding.editable and binding.source == VariableSource.INPUT.value
        ]

    def finish(
        self,
        domain: DomainResult,
    ) -> TracedResult:
        """Wrap a standard DomainResult with the accumulated trace."""
        return TracedResult(domain=domain, trace=self._trace)

    # ── Internal ───────────────────────────────────────────────────────

    def _add(
        self,
        *,
        kind: TraceStepKind,
        title: str,
        reads: tuple[str, ...] = (),
        writes: str = "",
        operation: str = "",
        expression: str = "",
        latex: str = "",
        unicode: str = "",
        group: str = "",
        description: str = "",
        substitutions: tuple[tuple[str, str], ...] = (),
        value: float | int | str | bool | None = None,
        unit: str = "",
        note: str = "",
        display_value: float | int | str | None = None,
        display_unit: str = "",
    ) -> TraceStep:
        self._ensure_capacity()
        if group and group not in {item.value for item in TraceStepGroup}:
            raise ValueError(f"unsupported trace step group: {group}")
        if not unicode:
            unicode = latex_fragment(latex) if latex else to_unicode(expression)
        step = TraceStep(
            id=self._next_id("step"),
            kind=kind,
            title=title,
            description=description,
            expression=expression,
            latex=latex,
            unicode=unicode,
            operation=operation,
            group=group,
            reads=reads,
            writes=writes,
            substitutions=substitutions,
            value=value if isinstance(value, (int, float, bool, str)) else None,
            unit=unit,
            display_value=(
                display_value if isinstance(display_value, (int, float, bool, str)) else None
            ),
            display_unit=display_unit,
            note=note,
        )
        self._trace.add_step(step)
        return step


__all__ = ["TraceRecorder"]
