# -*- coding: utf-8 -*-
"""Agent-facing freeform tools (§5).

Four tools, each returning the same ``ToolChunk`` envelope as curated tools:

- ``ugsci_derive_formula`` — symbolic rearrangement + trace
- ``ugsci_evaluate_formula`` — numeric substitution + trace
- ``ugsci_transform_formula`` — rename / rearrange a given equation
- ``ugsci_formula_preview`` — dry-run parse + validate (safety valve)

When freeform is disabled, all four return the stable ``feature_unavailable``
ToolChunk (reusing the GenUI ``genui_unavailable()`` pattern).
"""

from __future__ import annotations

import hashlib
import json
from typing import Any

from ...common.errors import DomainError, DomainErrorCode, wrap_unknown_error
from ...common.result import DomainResult
from ...common.serialization import sanitize_json
from ...common.tool_chunk import emit_tool_chunk
from ..recorder import TraceRecorder
from . import errors as _ff_errors
from . import guards
from .evaluate import evaluate_expression
from .parser import is_sympy_available, parse_expression, parser_hash
from .request import (
    DeriveFormulaRequest,
    EvaluateFormulaRequest,
    FormulaPreviewRequest,
    TransformFormulaRequest,
)
from .symbols import build_symbol_table, inferred_symbols, unit_unknown_symbols
from .transform import do_collect, do_expand, do_rearrange, do_simplify, do_solve, do_substitute

ENGINE_ID = "ugsci-freeform"
PROVIDER_ID = "ugsci-freeform-engine"
PROVIDER_VERSION = "0.1.0"


def _is_freeform_enabled() -> bool:
    """Check the freeform master switch (off by default, §12)."""
    try:
        from ....genui.settings import load_settings

        return bool(load_settings().get("freeform_enabled", False))
    except Exception:
        return False


def _freeform_settings() -> dict[str, Any]:
    try:
        from ....genui.settings import load_settings

        return load_settings()
    except Exception:
        return {
            "freeform_enabled": False,
            "freeform_max_steps": guards.MAX_TRACE_STEPS,
            "freeform_simplify": guards.ALLOW_SIMPLIFY,
        }


def _resolved_max_steps(value: int | None) -> int:
    if value is not None:
        return int(value)
    return int(_freeform_settings().get("freeform_max_steps", guards.MAX_TRACE_STEPS))


def _resolved_simplify(value: bool | None) -> bool:
    if value is not None:
        return bool(value)
    return bool(_freeform_settings().get("freeform_simplify", guards.ALLOW_SIMPLIFY))


def _feature_unavailable() -> Any:
    """Return the stable ``feature_unavailable`` chunk (§12)."""
    return emit_tool_chunk(
        {
            "ok": False,
            "kind": "error",
            "code": "feature_unavailable",
            "message": "Freeform mode is disabled. Set ugsci.trace.freeform_enabled=true to enable.",
        },
        error=True,
    )


def _chunk(payload: dict[str, Any], *, error: bool = False) -> Any:
    return emit_tool_chunk(payload, error=error)


def _build_provenance(
    *,
    symbol_table: dict[str, dict[str, Any]],
    expression: str,
    operation: str = "",
    output_symbol: str = "",
) -> dict[str, Any]:
    """Build the freeform provenance block (§11)."""
    identity = json.dumps(
        {
            "expression": expression,
            "operation": operation,
            "output_symbol": output_symbol,
        },
        ensure_ascii=True,
        sort_keys=True,
        separators=(",", ":"),
    )
    return {
        "source": "freeform",
        "curated": False,
        "freeform_engine": ENGINE_ID,
        "parser_hash": parser_hash(),
        "expression": expression,
        "operation": operation,
        "output_symbol": output_symbol,
        "formula_fingerprint": hashlib.sha256(identity.encode("utf-8")).hexdigest(),
        "units": {name: info["unit"] for name, info in symbol_table.items()},
        "unit_unknown": unit_unknown_symbols(symbol_table),
        "inferred_units": inferred_symbols(symbol_table),
    }


def _error_payload(exc: DomainError, recorder: TraceRecorder | None = None) -> dict[str, Any]:
    payload = exc.to_dict()
    if recorder is not None:
        payload["trace"] = recorder.trace.to_dict()
        payload["warnings"] = [exc.message]
    return payload


# ── ugsci_derive_formula ────────────────────────────────────────────────────


async def ugsci_derive_formula(
    expression: str,
    solve_for: str = "",
    symbols: dict[str, str] | None = None,
    assumptions: list[str] | None = None,
    max_steps: int | None = None,
    idempotent: bool | None = None,
) -> Any:
    """Derive a formula by symbolic rearrangement and trace each step.

    The agent provides a target statement (what to prove/derive) and the
    known constraints. The engine does minimal symbolic rearrangement and
    traces it.
    """
    if not _is_freeform_enabled():
        return _feature_unavailable()

    if not is_sympy_available():
        return _chunk(_ff_errors.dependency_unavailable().to_dict(), error=True)

    recorder: TraceRecorder | None = None
    try:
        resolved_max_steps = _resolved_max_steps(max_steps)
        resolved_simplify = _resolved_simplify(idempotent)
        req = DeriveFormulaRequest.from_dict({
            "expression": expression,
            "solve_for": solve_for,
            "symbols": symbols or {},
            "assumptions": assumptions or [],
            "max_steps": resolved_max_steps,
            "idempotent": resolved_simplify,
        })

        # Parse the expression (Layer 2)
        allowed_symbols = set(req.symbols.keys())
        if req.solve_for:
            allowed_symbols.add(req.solve_for)
        # Allow auto-derived symbols too if no explicit list
        if not req.symbols:
            allowed_symbols = None

        expr = parse_expression(req.expression, allowed_symbols=allowed_symbols)

        # Build symbol table
        expr_sym_names = {str(s) for s in expr.free_symbols}
        sym_table = build_symbol_table(req.symbols, expr_symbols=expr_sym_names)

        # Create recorder with freeform provenance
        recorder = TraceRecorder(
            title=f"Freeform derivation: {req.expression}",
            formula_id="freeform_derive",
            formula_name="Agent-authored derivation",
            source="freeform",
            symbols=", ".join(sorted(expr_sym_names)),
            max_steps=req.max_steps,
        )

        # If solve_for is specified, solve for it
        if req.solve_for:
            result_expr = do_solve(
                expr, req.solve_for, recorder,
                group="solve",
                reads=tuple(expr_sym_names),
                max_steps=req.max_steps,
            )
            # Optionally simplify
            if req.idempotent:
                result_expr = do_simplify(
                    result_expr, recorder,
                    idempotent=True,
                    group="reduce",
                    reads=tuple(expr_sym_names),
                    writes=req.solve_for,
                )
        else:
            # Just record the parsed expression
            recorder.substitute(
                "Parsed expression",
                str(expr),
                group="assemble",
                reads=tuple(expr_sym_names),
                writes="result",
                note="Expression parsed and validated",
            )
            result_expr = expr

        # Build the domain result
        result = {
            "derived_expression": str(result_expr),
            "symbols": {name: info["unit"] for name, info in sym_table.items()},
        }
        provenance = _build_provenance(
            symbol_table=sym_table,
            expression=req.expression,
            operation="derive",
            output_symbol=req.solve_for,
        )
        provenance["assumptions"] = req.assumptions

        domain = DomainResult(
            engine_id=ENGINE_ID,
            engine_version="0.1.0",
            provider_id=PROVIDER_ID,
            provider_version=PROVIDER_VERSION,
            operation="freeform.derive",
            method="sympy_solve",
            deterministic=True,
            result=sanitize_json(result),
            units={name: info["unit"] for name, info in sym_table.items()},
            assumptions=req.assumptions,
            warnings=[],
            provenance=provenance,
        )
        traced = recorder.finish(domain)
        return _chunk(traced.to_dict())

    except DomainError as exc:
        return _chunk(_error_payload(exc, recorder), error=True)
    except Exception as exc:  # noqa: BLE001
        return _chunk(_error_payload(wrap_unknown_error(exc), recorder), error=True)


# ── ugsci_evaluate_formula ──────────────────────────────────────────────────


async def ugsci_evaluate_formula(
    expression: str,
    inputs: dict[str, float],
    units: dict[str, str] | None = None,
    output_symbol: str = "",
    tolerance: float = 1e-8,
    max_steps: int | None = None,
) -> Any:
    """Plug in numbers and trace the numeric substitution.

    Substitutes numeric values into a parsed expression and evaluates,
    tracing every substitution and guard assertion.
    """
    if not _is_freeform_enabled():
        return _feature_unavailable()

    if not is_sympy_available():
        return _chunk(_ff_errors.dependency_unavailable().to_dict(), error=True)

    recorder: TraceRecorder | None = None
    try:
        resolved_max_steps = _resolved_max_steps(max_steps)
        req = EvaluateFormulaRequest.from_dict({
            "expression": expression,
            "inputs": inputs,
            "units": units or {},
            "output_symbol": output_symbol,
            "tolerance": tolerance,
            "max_steps": resolved_max_steps,
        })

        # Parse the expression
        allowed_symbols = set(req.inputs.keys())
        if req.output_symbol:
            allowed_symbols.add(req.output_symbol)
        expr = parse_expression(req.expression, allowed_symbols=allowed_symbols)

        # Build symbol table
        expr_sym_names = {str(s) for s in expr.free_symbols}
        sym_table = build_symbol_table(req.units, expr_symbols=expr_sym_names)
        effective_units = {name: info["unit"] for name, info in sym_table.items()}

        recorder = TraceRecorder(
            title=f"Freeform evaluation: {req.expression}",
            formula_id="freeform_evaluate",
            formula_name="Agent-authored evaluation",
            source="freeform",
            symbols=", ".join(sorted(expr_sym_names)),
            max_steps=req.max_steps,
        )

        # Evaluate
        result_value = evaluate_expression(
            expr,
            req.inputs,
            output_symbol=req.output_symbol,
            units=effective_units,
            tolerance=req.tolerance,
            recorder=recorder,
            expected_output_unit=effective_units.get(req.output_symbol, ""),
            max_steps=req.max_steps,
            unit_unknown=set(unit_unknown_symbols(sym_table)),
        )

        result = {
            "result": result_value,
            "output_symbol": req.output_symbol or "result",
            "expression": str(expr),
        }
        if req.output_symbol:
            result[req.output_symbol] = result_value

        provenance = _build_provenance(
            symbol_table=sym_table,
            expression=req.expression,
            operation="evaluate",
            output_symbol=req.output_symbol,
        )

        domain = DomainResult(
            engine_id=ENGINE_ID,
            engine_version="0.1.0",
            provider_id=PROVIDER_ID,
            provider_version=PROVIDER_VERSION,
            operation="freeform.evaluate",
            method="sympy_subs_evalf",
            deterministic=True,
            result=sanitize_json(result),
            units={name: info["unit"] for name, info in sym_table.items()},
            provenance=provenance,
        )
        traced = recorder.finish(domain)
        return _chunk(traced.to_dict())

    except DomainError as exc:
        return _chunk(_error_payload(exc, recorder), error=True)
    except Exception as exc:  # noqa: BLE001
        return _chunk(_error_payload(wrap_unknown_error(exc), recorder), error=True)


# ── ugsci_transform_formula ─────────────────────────────────────────────────


async def ugsci_transform_formula(
    expression: str,
    operation: str = "rearrange",
    solve_for: str = "",
    substitution: dict[str, str] | None = None,
    symbols: dict[str, str] | None = None,
    max_steps: int | None = None,
    idempotent: bool | None = None,
) -> Any:
    """Rename / rearrange a given equation, returning the transformed form as a trace.

    Operations: rearrange, substitute, simplify, expand, collect, solve_for.
    """
    if not _is_freeform_enabled():
        return _feature_unavailable()

    if not is_sympy_available():
        return _chunk(_ff_errors.dependency_unavailable().to_dict(), error=True)

    recorder: TraceRecorder | None = None
    try:
        resolved_max_steps = _resolved_max_steps(max_steps)
        resolved_simplify = _resolved_simplify(idempotent)
        req = TransformFormulaRequest.from_dict({
            "expression": expression,
            "operation": operation,
            "solve_for": solve_for,
            "substitution": substitution or {},
            "symbols": symbols or {},
            "max_steps": resolved_max_steps,
            "idempotent": resolved_simplify,
        })

        # Parse the expression
        allowed_symbols = set(req.symbols.keys())
        if req.solve_for:
            allowed_symbols.add(req.solve_for)
        allowed_symbols.update(req.substitution.keys())
        if not req.symbols:
            allowed_symbols = None

        expr = parse_expression(req.expression, allowed_symbols=allowed_symbols)

        # Build symbol table
        expr_sym_names = {str(s) for s in expr.free_symbols}
        sym_table = build_symbol_table(req.symbols, expr_symbols=expr_sym_names)

        recorder = TraceRecorder(
            title=f"Freeform transform ({req.operation}): {req.expression}",
            formula_id="freeform_transform",
            formula_name=f"Agent-authored {req.operation}",
            source="freeform",
            symbols=", ".join(sorted(expr_sym_names)),
            max_steps=req.max_steps,
        )

        # Record the initial expression
        recorder.substitute(
            f"Parsed expression",
            str(expr),
            group="assemble",
            reads=tuple(expr_sym_names),
            writes="result",
            note=f"Operation: {req.operation}",
        )

        # Execute the requested operation
        reads = tuple(expr_sym_names)
        if req.operation in ("rearrange", "solve_for"):
            result_expr = do_rearrange(
                expr, req.solve_for, recorder,
                group="solve",
                reads=reads,
                max_steps=req.max_steps,
            )
        elif req.operation == "substitute":
            replacement_allowed = (
                set(req.symbols) | ({req.solve_for} if req.solve_for else set())
                if req.symbols
                else None
            )
            result_expr = do_substitute(
                expr, req.substitution, recorder,
                group="substitute",
                reads=reads,
                writes="result",
                allowed_symbols=replacement_allowed,
            )
        elif req.operation == "simplify":
            result_expr = do_simplify(
                expr, recorder,
                idempotent=req.idempotent,
                group="reduce",
                reads=reads,
                writes="result",
            )
        elif req.operation == "expand":
            result_expr = do_expand(
                expr, recorder,
                group="reduce",
                reads=reads,
                writes="result",
            )
        elif req.operation == "collect":
            result_expr = do_collect(
                expr, req.solve_for or list(expr_sym_names)[0] if expr_sym_names else "x",
                recorder,
                group="reduce",
                reads=reads,
                writes="result",
            )
        else:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                f"Unknown operation: {req.operation}",
            )

        # Optional simplify after transform
        if req.idempotent and req.operation != "simplify":
            result_expr = do_simplify(
                result_expr, recorder,
                idempotent=True,
                group="reduce",
                reads=reads,
                writes="result",
            )

        result_sym_names = {str(symbol) for symbol in result_expr.free_symbols}
        sym_table = build_symbol_table(
            req.symbols,
            expr_symbols=expr_sym_names | result_sym_names,
        )
        result = {
            "transformed_expression": str(result_expr),
            "operation": req.operation,
        }
        provenance = _build_provenance(
            symbol_table=sym_table,
            expression=req.expression,
            operation=req.operation,
            output_symbol=req.solve_for,
        )

        domain = DomainResult(
            engine_id=ENGINE_ID,
            engine_version="0.1.0",
            provider_id=PROVIDER_ID,
            provider_version=PROVIDER_VERSION,
            operation=f"freeform.transform.{req.operation}",
            method=f"sympy_{req.operation}",
            deterministic=True,
            result=sanitize_json(result),
            units={name: info["unit"] for name, info in sym_table.items()},
            provenance=provenance,
        )
        traced = recorder.finish(domain)
        return _chunk(traced.to_dict())

    except DomainError as exc:
        return _chunk(_error_payload(exc, recorder), error=True)
    except Exception as exc:  # noqa: BLE001
        return _chunk(_error_payload(wrap_unknown_error(exc), recorder), error=True)


# ── ugsci_formula_preview ────────────────────────────────────────────────────


async def ugsci_formula_preview(
    expression: str,
    symbols: dict[str, str] | None = None,
) -> Any:
    """Dry-run: parse + validate + return the first symbolic step.

    A safety valve — lets the agent (or human) see that an expression is
    parseable before committing to a full derivation.
    """
    if not _is_freeform_enabled():
        return _feature_unavailable()

    if not is_sympy_available():
        return _chunk(_ff_errors.dependency_unavailable().to_dict(), error=True)

    try:
        req = FormulaPreviewRequest.from_dict({
            "expression": expression,
            "symbols": symbols or {},
        })

        # Parse the expression
        allowed_symbols = set(req.symbols.keys()) if req.symbols else None
        expr = parse_expression(req.expression, allowed_symbols=allowed_symbols)

        # Build symbol table
        expr_sym_names = {str(s) for s in expr.free_symbols}
        sym_table = build_symbol_table(req.symbols, expr_symbols=expr_sym_names)

        # Return the preview
        result = {
            "parseable": True,
            "expression": str(expr),
            "free_symbols": sorted(expr_sym_names),
            "symbols": {name: info for name, info in sym_table.items()},
            "ops": int(expr.count_ops()) if hasattr(expr, "count_ops") else 0,
        }
        provenance = _build_provenance(
            symbol_table=sym_table,
            expression=req.expression,
            operation="preview",
        )

        domain = DomainResult(
            engine_id=ENGINE_ID,
            engine_version="0.1.0",
            provider_id=PROVIDER_ID,
            provider_version=PROVIDER_VERSION,
            operation="freeform.preview",
            method="sympy_parse",
            deterministic=True,
            result=sanitize_json(result),
            provenance=provenance,
        )
        # For preview, return a simple result without a full trace
        return _chunk(domain.to_dict())

    except DomainError as exc:
        return _chunk(exc.to_dict(), error=True)
    except Exception as exc:  # noqa: BLE001
        return _chunk(wrap_unknown_error(exc).to_dict(), error=True)


__all__ = [
    "ugsci_derive_formula",
    "ugsci_evaluate_formula",
    "ugsci_formula_preview",
    "ugsci_transform_formula",
]
