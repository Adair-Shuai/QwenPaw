# -*- coding: utf-8 -*-
"""Layer 2 — SymPy ``parse_expr`` sandbox (the critical piece, §6).

This module is the *only* place where a user/model string is turned into
code.  It uses ``sympy.parse_expr`` with:

- A hand-built ``ALLOWED`` locals table, **not** ``sympy.__dict__`` and
  **not** a module namespace.
- An explicit, minimal transformation list.
- Post-parse structural validation (walk the tree before doing anything).

If SymPy is not installed, callers get ``dependency_unavailable``.
"""

from __future__ import annotations

import hashlib
import re
from typing import Any

from ...common.errors import DomainError
from . import errors as _ff_errors
from . import guards

# ── Lazy SymPy import ───────────────────────────────────────────────────────

_sp: Any = None


def _get_sympy() -> Any:
    """Import sympy lazily; raise ``dependency_unavailable`` if absent."""
    global _sp
    if _sp is not None:
        return _sp
    try:
        import sympy as _module

        _sp = _module
        return _sp
    except ImportError as exc:
        raise _ff_errors.dependency_unavailable() from exc


# ── ALLOWED locals table (§6.2) ────────────────────────────────────────────
# Hand-built dict, NOT sympy.__dict__.  Contains only safe math ops and
# constants.  No exec, eval, open, __import__, __builtins__, os, sys,
# getattr, lambda, Function, solve (top-level).


def _build_allowed(sp) -> dict[str, Any]:
    """Build the locked-down ``local_dict`` for ``parse_expr``."""
    from sympy import (
        Abs, E, I, Integer, Max, Min, Rational, Symbol, cos, exp, log,
        pi, sin, sqrt, tan, atan,
    )
    return {
        # Constants
        "pi": pi,
        "E": E,
        "I": I,
        # Numeric types
        "Integer": Integer,
        "Rational": Rational,
        "Float": sp.Float,
        "Symbol": Symbol,
        # Safe math functions
        "sqrt": sqrt,
        "exp": exp,
        "log": log,
        "sin": sin,
        "cos": cos,
        "tan": tan,
        "atan": atan,
        "Min": Min,
        "Max": Max,
        "Abs": Abs,
    }


# ── Transformation allowlist (§6.2) ─────────────────────────────────────────
# We explicitly opt out of convert_xor, sqrt-shorthand ambiguity, and any
# transform that would let a bare token become a function call.
# implicit_multiplication is excluded by default (§17 Risk #2).

def _get_transforms(sp):
    """Return the explicit, minimal transformation list."""
    try:
        from sympy.parsing.sympy_parser import (
            standard_transformations,
            implicit_multiplication_application,
            auto_symbol,
            split_symbols,
            convert_xor,
        )
    except ImportError:
        return None

    # Start with the safe standard set; deliberately exclude:
    #   convert_xor (§6.2 — opt out of ^ ambiguity)
    #   implicit_multiplication (§17 Risk #2 — excluded by default)
    transforms = list(standard_transformations)
    return tuple(transforms)


# ── Post-parse structural validation (§6.3) ─────────────────────────────────

# Forbidden SymPy node types — no Derivative, Integral, Piecewise, etc.
_FORBIDDEN_TYPES = frozenset({
    "Derivative", "Integral", "Piecewise", "Tuple", "Lambda",
    "Subs", "FunctionClass", "UnevaluatedExpr",
})
_SAFE_FUNCTION_NAMES = frozenset({
    "sqrt", "exp", "log", "sin", "cos", "tan", "atan", "Min", "Max", "Abs",
})
_FORBIDDEN_IDENTIFIERS = frozenset({
    "eval", "exec", "open", "compile", "input", "__import__", "import",
    "getattr", "setattr", "delattr", "globals", "locals", "vars", "dir",
    "os", "sys", "subprocess", "pathlib", "builtins", "lambda",
})


def _reject_unsafe_text(raw: str) -> None:
    """Reject code-like syntax before SymPy sees the input."""
    if any(char in raw for char in ("'", '"', ";", "[", "]", "{", "}")):
        raise _ff_errors.parse_error("string, statement, or container syntax is not allowed")
    if re.search(r"[A-Za-z_]\w*\s*\.|\.\s*[A-Za-z_]", raw):
        raise _ff_errors.parse_error("attribute access is not allowed")
    identifiers = re.findall(r"[A-Za-z_]\w*", raw)
    for name in identifiers:
        if name.startswith("__") or name.lower() in _FORBIDDEN_IDENTIFIERS:
            raise _ff_errors.symbol_not_allowed(name)


def _parse_one(sp: Any, raw: str, allowed: dict[str, Any], transforms: Any) -> Any:
    global_dict = {"__builtins__": {}, **allowed}
    return sp.parse_expr(
        raw,
        local_dict=dict(allowed),
        global_dict=global_dict,
        transformations=transforms,
        evaluate=True,
    )


def _walk_nodes(expr, visitor_fn, visited: set | None = None) -> None:
    """Pre-order traversal of a SymPy expression tree."""
    if visited is None:
        visited = set()
    expr_id = id(expr)
    if expr_id in visited:
        return
    visited.add(expr_id)
    visitor_fn(expr)
    for arg in getattr(expr, "args", ()):
        _walk_nodes(arg, visitor_fn, visited)


def _validate_structure(expr, allowed_symbol_names: set[str]) -> list[str]:
    """Walk the parsed expression tree and enforce structural constraints.

    Returns a list of offending node names (empty if OK).
    """
    sp = _get_sympy()
    offending: list[str] = []

    def check_node(node) -> None:
        type_name = type(node).__name__
        # Check forbidden types
        if type_name in _FORBIDDEN_TYPES:
            offending.append(type_name)
            return
        # Check Symbol names are in allowlist
        if isinstance(node, sp.Symbol):
            name = str(node)
            if name not in allowed_symbol_names:
                offending.append(name)
        # Check Function nodes
        if isinstance(node, sp.Function):
            name = str(getattr(node, "func", node).__name__ if hasattr(node, "func") else node)
            if name not in _SAFE_FUNCTION_NAMES:
                offending.append(f"Function:{name}")

    _walk_nodes(expr, check_node)
    return offending


# ── Public parse API ────────────────────────────────────────────────────────


def parse_expression(
    raw: str,
    *,
    allowed_symbols: set[str] | None = None,
) -> Any:
    """Parse a string into a validated SymPy expression.

    Args:
        raw: The expression string (e.g. ``"G_p = OGIP * (1 - (p/z) / (p_i/z_i))"``).
        allowed_symbols: Set of symbol names that are permitted.  If ``None``,
            all symbols are allowed (used when the request does not constrain
            the symbol set).

    Returns:
        A validated SymPy expression object.

    Raises:
        DomainError: On any parse or structural validation failure.
    """
    if not isinstance(raw, str) or not raw.strip():
        raise _ff_errors.parse_error("empty expression")
    _reject_unsafe_text(raw)

    sp = _get_sympy()
    allowed = _build_allowed(sp)
    transforms = _get_transforms(sp)

    # Strip equation form (lhs = rhs) — we parse as Eq(lhs, rhs) if '=' present.
    try:
        if "=" in raw and not raw.strip().startswith("="):
            parts = raw.split("=", 1)
            if len(parts) == 2:
                lhs_str, rhs_str = parts[0].strip(), parts[1].strip()
                lhs = _parse_one(sp, lhs_str, allowed, transforms)
                rhs = _parse_one(sp, rhs_str, allowed, transforms)
                expr = sp.Eq(lhs, rhs)
            else:
                expr = _parse_one(sp, raw, allowed, transforms)
        else:
            expr = _parse_one(sp, raw, allowed, transforms)
    except Exception as exc:
        raise _ff_errors.parse_error(str(exc)) from exc

    if not isinstance(expr, sp.Basic):
        raise _ff_errors.parse_error("expression did not produce a SymPy object")

    # Post-parse structural validation
    symbol_names = allowed_symbols
    if symbol_names is None:
        # If no explicit allowlist, auto-derive from the expression itself.
        symbol_names = {str(s) for s in expr.free_symbols}
    else:
        symbol_names = set(symbol_names)

    offending = _validate_structure(expr, symbol_names)
    if offending:
        raise _ff_errors.symbol_not_allowed(
            offending[0],
            allowed=sorted(symbol_names) if len(symbol_names) <= 20 else None,
        )

    # Resource guards
    guards.check_op_count(expr)
    guards.check_symbol_count(expr)
    guards.check_depth(expr)

    return expr


def parser_hash() -> str:
    """A stable hash of the locked-down parser configuration.

    Recorded per-result so a future change to the sandbox is auditable.
    """
    import json

    config = {
        "allowed": sorted([
            "pi", "E", "I", "Integer", "Rational", "Float", "Symbol",
            "sqrt", "exp", "log", "sin", "cos", "tan", "atan", "Min", "Max", "Abs",
        ]),
        "transforms": "standard_transformations",
        "forbidden": sorted(_FORBIDDEN_TYPES),
        "max_ops": guards.MAX_SYMPY_OPS,
        "max_symbols": guards.MAX_SYMBOLS,
    }
    encoded = json.dumps(config, sort_keys=True, ensure_ascii=True).encode("utf-8")
    return f"sha256:{hashlib.sha256(encoded).hexdigest()[:16]}"


def is_sympy_available() -> bool:
    """Check whether SymPy can be imported."""
    try:
        _get_sympy()
        return True
    except DomainError:
        return False


__all__ = [
    "is_sympy_available",
    "parse_expression",
    "parser_hash",
]
