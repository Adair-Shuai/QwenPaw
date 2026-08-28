# -*- coding: utf-8 -*-
"""Agent-facing tools for observable/traceable calculation."""

from __future__ import annotations

import math
import time
import uuid
from typing import Any

from ..common.errors import DomainError, DomainErrorCode, wrap_unknown_error
from ..common.tool_chunk import emit_tool_chunk
from .library import default_library
from .recorder import TraceRecorder
from ..common.replay import encode_replay_token, verify_replay_token


def _chunk(payload: dict[str, Any], *, error: bool = False) -> Any:
    return emit_tool_chunk(payload, error=error)


async def ugsci_trace_calculation(
    formula_id: str,
    inputs: dict[str, float],
) -> Any:
    """Run a curated, step-traceable UGS derivation.

    Each derivation is recorded as an ordered set of symbolic steps, variable
    bindings, numeric evaluations, and validity assertions.  The returned
    payload carries the standard result envelope plus a ``trace`` field that
    GenUI renders as an observable, step-by-step workspace.
    """
    try:
        spec = default_library.get(formula_id)
    except DomainError as exc:
        return _chunk(exc.to_dict(), error=True)

    try:
        finite_inputs = _validate_inputs(formula_id, inputs)
    except DomainError as exc:
        return _chunk(exc.to_dict(), error=True)
    except (TypeError, ValueError) as exc:
        error = DomainError(
            code=DomainErrorCode.INVALID_INPUT,
            message=f"Invalid derivation input: {exc}",
        )
        return _chunk(error.to_dict(), error=True)

    recorder = TraceRecorder(
        title=spec.name,
        formula_id=spec.formula_id,
        formula_name=spec.name,
        formula_version=spec.version,
        source="curated",
        symbols=spec.symbols,
    )
    try:
        domain = spec.case(finite_inputs, recorder)
    except DomainError as exc:
        payload = exc.to_dict()
        payload["trace"] = recorder.trace.to_dict()
        return _chunk(payload, error=True)
    except Exception as exc:  # noqa: BLE001
        return _chunk(wrap_unknown_error(exc).to_dict(), error=True)

    domain.provenance.setdefault("reference", getattr(spec, "reference", ""))
    domain.provenance.setdefault("source", "curated")
    replay_payload = {
        "kind": "curated",
        "formula_id": formula_id,
        "engine_id": domain.engine_id,
        "engine_version": domain.engine_version,
        "provider_version": domain.provider_version,
        "inputs": finite_inputs,
        "input_fingerprint": domain.provenance.get("input_fingerprint"),
    }
    try:
        domain.provenance["replay_token"] = encode_replay_token(replay_payload)
    except ValueError as exc:
        domain.warnings.append(f"Replay token unavailable: {exc}")
    traced = recorder.finish(domain)
    return _chunk(traced.to_dict())


async def ugsci_replay_calculation(replay_token: str) -> Any:
    """Verify and deterministically rerun a signed curated calculation."""
    started = time.perf_counter()
    try:
        payload = verify_replay_token(replay_token)
        formula_id = str(payload.get("formula_id", ""))
        inputs = payload.get("inputs")
        if not isinstance(inputs, dict):
            raise ValueError("invalid replay inputs")
        result = await ugsci_trace_calculation(formula_id, inputs)
        if hasattr(result, "content") and result.content:
            import json
            data = json.loads(result.content[0].text)
        else:
            data = result.get("payload", result) if isinstance(result, dict) else {}
        if data.get("code"):
            return _chunk(data, error=True)
        current = data.get("provenance", {})
        expected = payload.get("input_fingerprint")
        fingerprint_match = expected == current.get("input_fingerprint")
        version_diff = {
            key: {"expected": payload.get(key), "actual": current.get(key)}
            for key in ("engine_id", "engine_version", "provider_version")
            if payload.get(key) != current.get(key)
        }
        status = "reproducible" if fingerprint_match and not version_diff else "version_changed"
        diff = dict(version_diff)
        if not fingerprint_match:
            diff["input_fingerprint"] = {"expected": expected, "actual": current.get("input_fingerprint")}
        return _chunk({
            "replay_id": str(uuid.uuid4()),
            "status": status,
            "reproducible": status == "reproducible",
            "elapsed_ms": round((time.perf_counter() - started) * 1000, 3),
            "diff": diff,
            "result": data,
        })
    except (ValueError, TypeError) as exc:
        error = DomainError(DomainErrorCode.INVALID_INPUT, f"Invalid replay token: {exc}")
        return _chunk(error.to_dict(), error=True)


async def ugsci_list_derivation_formulas() -> Any:
    """List the curated, step-traceable UGS derivation formulas."""
    catalog = default_library.list()
    return _chunk(
        {
            "formulas": catalog,
            "count": len(catalog),
            "message": "Run ugsci_trace_calculation with one of these formula_id values.",
        }
    )


def _validate_inputs(formula_id: str, inputs: Any) -> dict[str, Any]:
    """Coerce an inputs mapping to finite floats for a formula.

    Rejects non-dict inputs, unknown keys, and non-finite values so the
    downstream derivation never sees NaN/Infinity or silently ignored fields.
    """
    if not isinstance(inputs, dict):
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            "inputs must be a mapping of variable name to numeric value",
        )
    spec = default_library.get(formula_id)
    # Nested per-formula defaults for input parameters shared across the case.
    defaults = {
        "gas_material_balance_pz": {
            "gas_volume_unit": "scf",
            "pressure_unit": "psi",
        },
    }.get(formula_id, {})
    inputs = {**defaults, **(inputs or {})}
    known = set(spec.unit_dimensions)
    unknown = set(inputs) - known
    if unknown:
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            f"Unknown input(s) for {formula_id}: {', '.join(sorted(unknown))}",
        )
    required = {name for name in spec.unit_dimensions if not name.endswith("_unit")}
    missing = sorted(name for name in required if name not in inputs)
    if missing:
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            f"Missing required input(s) for {formula_id}: {', '.join(missing)}",
            details={"missing": missing},
        )
    coerced: dict[str, Any] = {}
    for key, value in inputs.items():
        if isinstance(value, bool):
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                f"Input '{key}' must be numeric, not boolean",
            )
        if isinstance(value, str):
            if key.endswith("_unit"):
                coerced[key] = value
                continue
            try:
                numeric = float(value.strip())
            except (TypeError, ValueError) as exc:
                raise DomainError(
                    DomainErrorCode.INVALID_INPUT,
                    f"Input '{key}' must be numeric",
                ) from exc
            if not math.isfinite(numeric):
                raise DomainError(
                    DomainErrorCode.INVALID_INPUT,
                    f"Input '{key}' must be finite",
                )
            coerced[key] = numeric
            continue
        try:
            numeric = float(value)
        except (TypeError, ValueError) as exc:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                f"Input '{key}' must be numeric",
            ) from exc
        if not math.isfinite(numeric):
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                f"Input '{key}' must be finite",
            )
        coerced[key] = numeric
    return coerced


__all__ = ["ugsci_trace_calculation", "ugsci_replay_calculation", "ugsci_list_derivation_formulas"]
