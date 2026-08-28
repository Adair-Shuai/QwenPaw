# -*- coding: utf-8 -*-
"""Layer 3 — numeric evaluation with dimensional unit propagation."""

from __future__ import annotations

import math
import re
from dataclasses import dataclass
from fractions import Fraction
from typing import Any

from ...common.errors import DomainError, DomainErrorCode
from ...deterministic.units import _UNITS, convert, normalize_unit
from ..recorder import TraceRecorder
from . import errors as _ff_errors
from . import guards
from .parser import _get_sympy


_DIMENSIONS: dict[str, dict[str, Fraction]] = {
    "pressure": {"P": Fraction(1)},
    "length": {"L": Fraction(1)},
    "area": {"L": Fraction(2)},
    "volume": {"L": Fraction(3)},
    "rate": {"L": Fraction(3), "T": Fraction(-1)},
    "compressibility": {"P": Fraction(-1)},
    "pressure_gradient": {"P": Fraction(1), "L": Fraction(-1)},
    "temperature": {"Temp": Fraction(1)},
    "gor": {"GOR": Fraction(1)},
}
_EXTRA_ATOMS: dict[str, tuple[dict[str, Fraction], float]] = {
    "d": ({"T": Fraction(1)}, 1.0),
    "day": ({"T": Fraction(1)}, 1.0),
    "days": ({"T": Fraction(1)}, 1.0),
    "h": ({"T": Fraction(1)}, 1.0 / 24.0),
    "hr": ({"T": Fraction(1)}, 1.0 / 24.0),
    "s": ({"T": Fraction(1)}, 1.0 / 86_400.0),
    "kg": ({"M": Fraction(1)}, 1.0),
    "g": ({"M": Fraction(1)}, 0.001),
    "md": ({"L": Fraction(2)}, 9.869233e-16),
    "darcy": ({"L": Fraction(2)}, 9.869233e-13),
    "cp": ({"P": Fraction(1), "T": Fraction(1)}, 0.001 / 86_400.0),
}


def _clean_dims(dims: dict[str, Fraction]) -> dict[str, Fraction]:
    return {key: value for key, value in dims.items() if value}


def _combine_dims(
    left: dict[str, Fraction],
    right: dict[str, Fraction],
    multiplier: Fraction = Fraction(1),
) -> dict[str, Fraction]:
    result = dict(left)
    for key, value in right.items():
        result[key] = result.get(key, Fraction(0)) + value * multiplier
    return _clean_dims(result)


def _dims_text(dims: dict[str, Fraction]) -> str:
    if not dims:
        return "dimensionless"
    return "*".join(
        key if power == 1 else f"{key}^{power}"
        for key, power in sorted(dims.items())
    )


def _atomic_unit_spec(token: str) -> tuple[dict[str, Fraction], float]:
    normalized = normalize_unit(token)
    if normalized in _UNITS:
        dimension, factor = _UNITS[normalized]
        return dict(_DIMENSIONS[dimension]), factor
    if normalized in _EXTRA_ATOMS:
        dims, factor = _EXTRA_ATOMS[normalized]
        return dict(dims), factor
    match = re.fullmatch(r"(.+?)(-?\d+)", normalized)
    if match:
        base, exponent_text = match.groups()
        base_dims, base_factor = _atomic_unit_spec(base)
        exponent = int(exponent_text)
        return (
            {key: value * exponent for key, value in base_dims.items()},
            base_factor**exponent,
        )
    raise DomainError(DomainErrorCode.INVALID_INPUT, f"Unsupported unit: {token}")


def _unit_spec(unit: str) -> tuple[dict[str, Fraction], float, str]:
    normalized = normalize_unit(unit)
    if normalized in _UNITS:
        dimension, factor = _UNITS[normalized]
        return dict(_DIMENSIONS[dimension]), factor, normalized

    parts = re.split(r"([*/])", normalized)
    dims: dict[str, Fraction] = {}
    factor = 1.0
    operation = "*"
    for part in parts:
        if not part:
            continue
        if part in {"*", "/"}:
            operation = part
            continue
        if part == "1":
            continue
        atom_dims, atom_factor = _atomic_unit_spec(part)
        multiplier = Fraction(1) if operation == "*" else Fraction(-1)
        dims = _combine_dims(dims, atom_dims, multiplier)
        factor = factor * atom_factor if operation == "*" else factor / atom_factor
    return dims, factor, normalized


def _to_canonical(value: float, unit: str) -> tuple[float, dict[str, Fraction]]:
    dims, factor, normalized = _unit_spec(unit)
    if dims == _DIMENSIONS["temperature"]:
        return convert(value, normalized, "k"), dims
    return value * factor, dims


def _from_canonical(value: float, dims: dict[str, Fraction], unit: str) -> float:
    expected_dims, factor, normalized = _unit_spec(unit)
    if _clean_dims(dims) != _clean_dims(expected_dims):
        raise _ff_errors.unit_mismatch(
            f"result dimension {_dims_text(dims)} is incompatible with '{unit}' "
            f"({_dims_text(expected_dims)})",
            details={
                "actual_dimension": _dims_text(dims),
                "expected_unit": unit,
                "expected_dimension": _dims_text(expected_dims),
            },
        )
    if dims == _DIMENSIONS["temperature"]:
        return convert(value, "k", normalized)
    return value / factor


@dataclass(frozen=True)
class _Quantity:
    value: float
    dims: dict[str, Fraction]


def _checked(value: float, dims: dict[str, Fraction], label: str) -> _Quantity:
    return _Quantity(guards.check_finite(value, label), _clean_dims(dims))


def _evaluate_node(
    expr: Any,
    values: dict[str, _Quantity],
    *,
    tolerance: float,
    sp: Any,
) -> _Quantity:
    if isinstance(expr, sp.Symbol):
        name = str(expr)
        if name not in values:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                f"Missing numeric input for symbol '{name}'",
                details={"symbol": name},
            )
        return values[name]

    if not getattr(expr, "free_symbols", set()) and getattr(expr, "is_number", False):
        try:
            return _checked(float(expr.evalf()), {}, str(expr))
        except (TypeError, ValueError) as exc:
            raise DomainError(
                DomainErrorCode.INVALID_RESULT,
                f"Cannot evaluate numeric constant: {expr}",
            ) from exc

    if isinstance(expr, sp.Add):
        items = [_evaluate_node(arg, values, tolerance=tolerance, sp=sp) for arg in expr.args]
        expected = items[0].dims
        for item in items[1:]:
            if item.dims != expected:
                raise _ff_errors.unit_mismatch(
                    f"addition requires matching dimensions, got "
                    f"{_dims_text(expected)} and {_dims_text(item.dims)}",
                    details={"expression": str(expr)},
                )
        return _checked(sum(item.value for item in items), expected, str(expr))

    if isinstance(expr, sp.Mul):
        value = 1.0
        dims: dict[str, Fraction] = {}
        for arg in expr.args:
            item = _evaluate_node(arg, values, tolerance=tolerance, sp=sp)
            value *= item.value
            dims = _combine_dims(dims, item.dims)
        return _checked(value, dims, str(expr))

    if isinstance(expr, sp.Pow):
        base = _evaluate_node(expr.base, values, tolerance=tolerance, sp=sp)
        exponent_q = _evaluate_node(expr.exp, values, tolerance=tolerance, sp=sp)
        if exponent_q.dims:
            raise _ff_errors.unit_mismatch(
                "a power exponent must be dimensionless",
                details={"expression": str(expr)},
            )
        exponent = (
            Fraction(expr.exp)
            if getattr(expr.exp, "is_Rational", False)
            else Fraction(exponent_q.value)
        )
        if exponent < 0 and abs(base.value) <= tolerance:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                f"Denominator is within tolerance ({base.value} <= {tolerance})",
                details={"expression": str(expr), "tolerance": tolerance},
                retryable=True,
            )
        value = base.value ** float(exponent)
        dims = {key: power * exponent for key, power in base.dims.items()}
        return _checked(value, dims, str(expr))

    function_name = getattr(getattr(expr, "func", None), "__name__", "")
    args = [_evaluate_node(arg, values, tolerance=tolerance, sp=sp) for arg in expr.args]
    if function_name == "Abs":
        return _checked(abs(args[0].value), args[0].dims, str(expr))
    if function_name in {"Min", "Max"}:
        expected = args[0].dims
        if any(item.dims != expected for item in args[1:]):
            raise _ff_errors.unit_mismatch(
                f"{function_name} requires matching dimensions",
                details={"expression": str(expr)},
            )
        fn = min if function_name == "Min" else max
        return _checked(fn(item.value for item in args), expected, str(expr))
    if function_name in {"exp", "log", "sin", "cos", "tan", "atan"}:
        if args[0].dims:
            raise _ff_errors.unit_mismatch(
                f"{function_name} requires a dimensionless argument",
                details={"expression": str(expr)},
            )
        return _checked(getattr(math, function_name)(args[0].value), {}, str(expr))
    raise DomainError(
        DomainErrorCode.UNSUPPORTED_OPERATION,
        f"Unsupported numeric expression node: {type(expr).__name__}",
    )


def _expression_for_output(
    expr: Any,
    output_symbol: str,
    recorder: TraceRecorder,
    sp: Any,
) -> Any:
    if not isinstance(expr, sp.Eq):
        return expr
    target_name = output_symbol
    if not target_name:
        if isinstance(expr.lhs, sp.Symbol):
            target_name = str(expr.lhs)
        elif isinstance(expr.rhs, sp.Symbol):
            target_name = str(expr.rhs)
        else:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "output_symbol is required when evaluating a non-isolated equation",
            )
    target = sp.Symbol(target_name)
    if expr.lhs == target:
        return expr.rhs
    if expr.rhs == target:
        return expr.lhs
    solutions = guards.with_timeout(
        guards.MAX_TRANSFORM_SECONDS,
        lambda: sp.solve(expr, target, dict=False),
    )
    if not solutions:
        raise _ff_errors.solve_no_real_root(target_name)
    selected = min(solutions, key=lambda item: len(getattr(item, "free_symbols", ())))
    recorder.solve(
        f"Solve for {target_name}",
        f"{expr}  →  {target_name} = {selected}",
        for_symbol=target_name,
        group="solve",
        reads=tuple(sorted(str(symbol) for symbol in expr.free_symbols)),
        writes=target_name,
    )
    return selected


def evaluate_expression(
    expr: Any,
    inputs: dict[str, float],
    *,
    output_symbol: str = "",
    units: dict[str, str] | None = None,
    tolerance: float = 1e-8,
    recorder: TraceRecorder | None = None,
    expected_output_unit: str = "",
    max_steps: int | None = None,
    unit_unknown: set[str] | None = None,
) -> float:
    """Evaluate a validated SymPy expression with dimensional unit handling."""
    sp = _get_sympy()
    units = units or {}
    unit_unknown = unit_unknown or set()
    if not math.isfinite(tolerance) or tolerance <= 0:
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            "tolerance must be positive and finite",
        )
    guards.check_substitutions(len(inputs))
    rec = recorder or TraceRecorder(source="freeform", max_steps=max_steps)
    if recorder is not None and max_steps is not None:
        rec.set_max_steps(max_steps)

    quantities: dict[str, _Quantity] = {}
    for name, value in inputs.items():
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                f"Input '{name}' must be numeric",
            )
        numeric = guards.check_finite(float(value), name)
        guards.check_magnitude(numeric, name)
        unit = units.get(name, "")
        canonical, dims = _to_canonical(numeric, unit) if unit else (numeric, {})
        quantities[name] = _checked(canonical, dims, name)
        rec.bind(
            name,
            name,
            numeric,
            unit,
            source="input",
            description=f"Input variable {name}",
            editable=True,
            display_name=name,
        )
        if name in unit_unknown:
            rec.assert_true(
                f"Unit check for {name}",
                False,
                detail=f"Unit unknown for '{name}' — provide an explicit unit",
                group="verify",
                reads=(name,),
            )

    target_expr = _expression_for_output(expr, output_symbol, rec, sp)
    missing = sorted(
        str(symbol)
        for symbol in target_expr.free_symbols
        if str(symbol) not in inputs
    )
    if missing:
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            f"Missing numeric input(s): {', '.join(missing)}",
            details={"missing": missing},
        )

    substitutions = ", ".join(
        f"{key}={float(value):.6g}" for key, value in inputs.items()
    )
    rec.substitute(
        "Substitute numeric values",
        f"{target_expr}  where  {substitutions}",
        group="substitute",
        reads=tuple(inputs.keys()),
        writes=output_symbol or "result",
        note=f"Substituted {len(inputs)} value(s)",
    )

    quantity = _evaluate_node(target_expr, quantities, tolerance=tolerance, sp=sp)
    output_unit = expected_output_unit or units.get(output_symbol, "")
    if not output_unit and quantity.dims:
        for name in inputs:
            candidate = units.get(name, "")
            if candidate and _unit_spec(candidate)[0] == quantity.dims:
                output_unit = candidate
                break
    result = (
        _from_canonical(quantity.value, quantity.dims, output_unit)
        if output_unit
        else quantity.value
    )
    result = guards.check_magnitude(
        guards.check_finite(result, output_symbol or "result"),
        output_symbol or "result",
    )

    rec.evaluate(
        f"Evaluate {output_symbol or 'result'}",
        str(expr),
        result,
        output_unit,
        substitutions=tuple(
            (key, f"{float(value):.6g}") for key, value in inputs.items()
        ),
        reads=tuple(inputs.keys()),
        writes=output_symbol or "result",
        group="solve",
    )
    rec.assert_true(
        "Result is finite",
        math.isfinite(result),
        detail=f"{output_symbol or 'result'} = {result:.6g}",
        group="verify",
        reads=(output_symbol,) if output_symbol else (),
    )
    if output_unit:
        rec.assert_true(
            "Output unit dimension check",
            True,
            detail=f"Result is compatible with {output_unit}",
            group="verify",
        )
    return result


__all__ = ["evaluate_expression"]
