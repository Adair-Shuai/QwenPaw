# -*- coding: utf-8 -*-
"""Freeform derivation mode — model-authored symbolic math under a four-layer gate.

The freeform module lets an agent submit arbitrary expressions (or transform
known equations), and the engine traces every symbolic step and every numeric
substitution so the result is auditable.  It reuses the same ``TracedResult``
+ ``build_trace_tree`` card as curated mode, so the UI, live-edit form, and
export all work unchanged.

Four-layer gate:
    Layer 1  Expression contract (request.py)     — grammar, symbol list, caps
    Layer 2  Parsing sandbox (parser.py)         — sympy.parse_expr under lockdown
    Layer 3  Evaluation sandbox (evaluate.py)    — safe substitution, never eval()
    Layer 4  Resource guards (guards.py)         — size/depth/time/node caps
"""

from __future__ import annotations

from .evaluate import evaluate_expression
from .errors import (
    dependency_unavailable,
    guard_exceeded,
    non_finite_result,
    parse_error,
    solve_no_real_root,
    symbol_not_allowed,
    unit_mismatch,
)
from .guards import (
    ALLOW_SIMPLIFY,
    MAX_MAGNITUDE,
    MAX_SUBS,
    MAX_SYMBOLS,
    MAX_SYMPY_OPS,
    MAX_TRACE_STEPS,
    MAX_TRANSFORM_SECONDS,
)
from .parser import is_sympy_available, parse_expression, parser_hash
from .request import (
    DeriveFormulaRequest,
    EvaluateFormulaRequest,
    FormulaPreviewRequest,
    TransformFormulaRequest,
)
from .symbols import (
    build_symbol_table,
    infer_unit,
    inferred_symbols,
    unit_unknown_symbols,
)
from .transform import (
    do_collect,
    do_expand,
    do_rearrange,
    do_simplify,
    do_solve,
    do_substitute,
)

__all__ = [
    # Errors
    "dependency_unavailable",
    "guard_exceeded",
    "non_finite_result",
    "parse_error",
    "solve_no_real_root",
    "symbol_not_allowed",
    "unit_mismatch",
    # Guards
    "ALLOW_SIMPLIFY",
    "MAX_MAGNITUDE",
    "MAX_SUBS",
    "MAX_SYMBOLS",
    "MAX_SYMPY_OPS",
    "MAX_TRACE_STEPS",
    "MAX_TRANSFORM_SECONDS",
    # Parser
    "is_sympy_available",
    "parse_expression",
    "parser_hash",
    # Request models
    "DeriveFormulaRequest",
    "EvaluateFormulaRequest",
    "FormulaPreviewRequest",
    "TransformFormulaRequest",
    # Symbols
    "build_symbol_table",
    "infer_unit",
    "inferred_symbols",
    "unit_unknown_symbols",
    # Transforms
    "do_collect",
    "do_expand",
    "do_rearrange",
    "do_simplify",
    "do_solve",
    "do_substitute",
    # Evaluate
    "evaluate_expression",
]
