# -*- coding: utf-8 -*-
"""Best-effort, explicit unit consistency audit for traced formulas."""
from __future__ import annotations

from typing import Any

from ..deterministic.units import normalize_unit, require_unit


def audit_units(unit_dimensions: dict[str, str], inputs: dict[str, Any], output_units: dict[str, str] | None = None) -> dict[str, Any]:
    per_symbol: dict[str, dict[str, Any]] = {}
    ok = True
    for name, expected in unit_dimensions.items():
        if name.endswith("_unit"):
            continue
        if expected == "dimensionless":
            actual = ""
            valid = True
        else:
            unit_key = "gas_volume_unit" if expected == "gas_volume" else "pressure_unit" if expected == "pressure" else name
            raw = inputs.get(unit_key, "")
            actual = str(raw) if raw else ""
            try:
                require_unit(actual, expected)
                valid = True
                actual = normalize_unit(actual)
            except Exception:
                valid = False
        per_symbol[name] = {"expected": expected, "actual": actual, "ok": valid}
        ok = ok and valid
    for name, actual in (output_units or {}).items():
        per_symbol[name] = {"expected": "output", "actual": actual, "ok": bool(actual)}
        ok = ok and bool(actual)
    return {"ok": ok, "per_symbol": per_symbol}


__all__ = ["audit_units"]
