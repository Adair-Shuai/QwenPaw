# -*- coding: utf-8 -*-
"""Transformation engine (§8).

Each operation maps to the same ``TraceStep`` kinds the curated path uses,
so the worksheet renders identically.

+-------------+--------------------------+----------------------------------------------+
| Freeform op | SymPy call               | TraceStep emitted                            |
+=============+==========================+==============================================+
| substitute  | expr.subs({old: new})    | kind=symbolic, operation=substitute          |
| rearrange   | solve(expr, target)      | kind=symbolic, operation=solve               |
| simplify    | sp.simplify (if idempotent| kind=symbolic, operation=simplify           |
| expand      | sp.expand                | kind=symbolic, operation=simplify             |
| collect     | sp.collect               | kind=symbolic, operation=simplify             |
| solve_for   | sp.solve(expr, target)   | kind=symbolic, operation=solve               |
+-------------+--------------------------+----------------------------------------------+
"""

from __future__ import annotations

from typing import Any

from ..recorder import TraceRecorder
from . import errors as _ff_errors
from . import guards
from .parser import _get_sympy


def _sympy_str(expr: Any) -> str:
    """Render a SymPy expression as a clean string."""
    try:
        return str(expr)
    except Exception:
        return repr(expr)


def _op_count(expr: Any) -> int:
    try:
        return int(expr.count_ops())
    except Exception:
        return 0


def _select_real_root(solutions: list, target: str, sp) -> Any:
    """Select the real-valued solution (or the one with the fewest I)."""
    if not solutions:
        raise _ff_errors.solve_no_real_root(target)
    if len(solutions) == 1:
        return solutions[0]
    # Prefer real solutions.
    real_sols = []
    for sol in solutions:
        if not sol.free_symbols or not sol.has(sp.I):
            real_sols.append(sol)
    if real_sols:
        # Pick the one with the fewest free symbols.
        real_sols.sort(key=lambda s: len(s.free_symbols))
        return real_sols[0]
    # Fall back to the first solution.
    return solutions[0]


def do_solve(
    expr: Any,
    target: str,
    recorder: TraceRecorder,
    *,
    group: str = "solve",
    reads: tuple[str, ...] = (),
    max_steps: int | None = None,
) -> Any:
    """Solve ``expr`` for ``target`` and record the step."""
    sp = _get_sympy()
    if max_steps is not None:
        recorder.set_max_steps(max_steps)
    target_sym = sp.Symbol(target) if not isinstance(target, sp.Symbol) else target

    # Handle equation vs expression
    if isinstance(expr, sp.Eq):
        solutions = guards.with_timeout(
            guards.MAX_TRANSFORM_SECONDS,
            lambda: sp.solve(expr, target_sym, dict=False),
        )
    else:
        solutions = guards.with_timeout(
            guards.MAX_TRANSFORM_SECONDS,
            lambda: sp.solve(sp.Eq(expr, 0), target_sym, dict=False),
        )

    if not solutions:
        raise _ff_errors.solve_no_real_root(target)

    selected = _select_real_root(solutions, target, sp)

    ops = _op_count(selected)
    if ops > guards.MAX_SYMPY_OPS:
        recorder.assert_true(
            "Result size within cap",
            False,
            detail=f"count_ops = {ops} > {guards.MAX_SYMPY_OPS}",
            group=group,
            reads=reads,
        )
        guards.check_op_count(selected)

    # Record the solve step
    sol_str = _sympy_str(selected)
    expr_str = _sympy_str(expr)
    recorder.solve(
        f"Solve for {target}",
        f"{expr_str}  →  {target} = {sol_str}",
        for_symbol=target,
        group=group,
        reads=reads,
        writes=target,
        description=f"Selected solution: {sol_str}",
        note=f"From {len(solutions)} solution(s)" if len(solutions) > 1 else "",
    )

    return selected


def do_substitute(
    expr: Any,
    substitution_map: dict[str, Any],
    recorder: TraceRecorder,
    *,
    group: str = "substitute",
    reads: tuple[str, ...] = (),
    writes: str = "",
    allowed_symbols: set[str] | None = None,
) -> Any:
    """Substitute symbols in ``expr`` and record the step."""
    sp = _get_sympy()
    guards.check_substitutions(len(substitution_map))
    subs_dict = {}
    for name, value in substitution_map.items():
        sym = sp.Symbol(name)
        if isinstance(value, str):
            # Parse the replacement expression
            from .parser import parse_expression

            subs_dict[sym] = parse_expression(value, allowed_symbols=allowed_symbols)
        else:
            subs_dict[sym] = value

    result = expr.subs(subs_dict)

    ops = _op_count(result)
    if ops > guards.MAX_SYMPY_OPS:
        recorder.assert_true(
            "Result size within cap",
            False,
            detail=f"count_ops = {ops} > {guards.MAX_SYMPY_OPS}",
            group=group,
            reads=reads,
        )
        guards.check_op_count(result)

    subs_str = ", ".join(f"{k}={v}" for k, v in substitution_map.items())
    recorder.substitute(
        f"Substitute {subs_str}",
        f"{_sympy_str(expr)}  →  {_sympy_str(result)}",
        group=group,
        reads=reads,
        writes=writes,
        note=f"Substituted: {subs_str}",
    )

    return result


def do_simplify(
    expr: Any,
    recorder: TraceRecorder,
    *,
    idempotent: bool = False,
    group: str = "reduce",
    reads: tuple[str, ...] = (),
    writes: str = "",
) -> Any:
    """Simplify an expression (only if ``idempotent`` is True)."""
    sp = _get_sympy()
    original_ops = 0
    try:
        original_ops = int(expr.count_ops())
    except Exception:
        pass

    if not idempotent:
        recorder.substitute(
            "Simplify skipped (idempotent=False)",
            _sympy_str(expr),
            group=group,
            reads=reads,
            writes=writes,
            note="Simplify skipped: opt-in idempotent flag is false",
        )
        return expr

    result = guards.with_timeout(guards.MAX_TRANSFORM_SECONDS, lambda: sp.simplify(expr))
    new_ops = _op_count(result)
    if new_ops > original_ops and new_ops > guards.MAX_SYMPY_OPS:
        recorder.assert_true(
            "Simplify did not inflate result",
            False,
            detail=f"ops {original_ops} → {new_ops} (cap {guards.MAX_SYMPY_OPS})",
            group=group,
            reads=reads,
        )
        # Return the original — the simplified form was worse.
        return expr

    result_str = _sympy_str(result)
    recorder.simplify(
        "Simplify",
        f"{_sympy_str(expr)}  →  {result_str}",
        group=group,
        reads=reads,
        writes=writes,
    )

    return result


def do_expand(
    expr: Any,
    recorder: TraceRecorder,
    *,
    group: str = "reduce",
    reads: tuple[str, ...] = (),
    writes: str = "",
) -> Any:
    """Expand an expression."""
    sp = _get_sympy()
    result = guards.with_timeout(guards.MAX_TRANSFORM_SECONDS, lambda: sp.expand(expr))
    new_ops = _op_count(result)
    if new_ops > guards.MAX_SYMPY_OPS:
        recorder.assert_true(
            "Expand result within cap",
            False,
            detail=f"count_ops = {new_ops} > {guards.MAX_SYMPY_OPS}",
            group=group,
            reads=reads,
        )
        guards.check_op_count(result)

    result_str = _sympy_str(result)
    recorder.simplify(
        "Expand",
        f"{_sympy_str(expr)}  →  {result_str}",
        group=group,
        reads=reads,
        writes=writes,
        description="Expanded form",
    )

    return result


def do_collect(
    expr: Any,
    target: str,
    recorder: TraceRecorder,
    *,
    group: str = "reduce",
    reads: tuple[str, ...] = (),
    writes: str = "",
) -> Any:
    """Collect terms by ``target``."""
    sp = _get_sympy()
    target_sym = sp.Symbol(target) if not isinstance(target, sp.Symbol) else target
    result = guards.with_timeout(guards.MAX_TRANSFORM_SECONDS, lambda: sp.collect(expr, target_sym))
    ops = _op_count(result)
    if ops > guards.MAX_SYMPY_OPS:
        recorder.assert_true(
            "Collect result within cap",
            False,
            detail=f"count_ops = {ops} > {guards.MAX_SYMPY_OPS}",
            group=group,
            reads=reads,
        )
        guards.check_op_count(result)
    result_str = _sympy_str(result)
    recorder.simplify(
        f"Collect by {target}",
        f"{_sympy_str(expr)}  →  {result_str}",
        group=group,
        reads=reads,
        writes=writes,
        description=f"Collected by {target}",
    )
    return result


def do_rearrange(
    expr: Any,
    target: str,
    recorder: TraceRecorder,
    *,
    group: str = "solve",
    reads: tuple[str, ...] = (),
    max_steps: int | None = None,
) -> Any:
    """Rearrange an equation for ``target`` (built on ``sp.solve``)."""
    return do_solve(expr, target, recorder, group=group, reads=reads, max_steps=max_steps)


__all__ = [
    "do_collect",
    "do_expand",
    "do_rearrange",
    "do_simplify",
    "do_solve",
    "do_substitute",
]
