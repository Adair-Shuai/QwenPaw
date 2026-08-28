# -*- coding: utf-8 -*-
"""Curated derivation: volumetric dry-gas p/z material balance.

Derives OGIP from produced volume and two pressure/z states via the classic
``Gp = OGIP * (1 - (p/z) / (p_i/z_i))`` depletion relation.

The numeric result deliberately mirrors ``GasMaterialBalanceAdapter`` so a
traced run agrees with the existing ``ugsci_gas_material_balance`` tool on the
same inputs.
"""

from __future__ import annotations

import hashlib
import json
import math
from typing import Any

from ...common.errors import DomainError, DomainErrorCode
from ...common.result import DomainResult
from ...common.serialization import sanitize_json
from ...common.unit_audit import audit_units
from ...deterministic.units import convert, require_unit
from . import FormulaSpec
from ..recorder import TraceRecorder

FORMULA_ID = "gas_material_balance_pz"

SIZEOF_MSG = 1e-12
Z_FACTOR_MIN = 0.1
Z_FACTOR_MAX = 1.5

ENGINE_ID = "ugsci-trace"
PROVIDER_ID = "ugsci-curated-formulas"
PROVIDER_VERSION = "1.0.0"
FORMULA_VERSION = "1.0.0"
OPERATION = "reservoir.material_balance.gas_pz"
METHOD = "p_over_z"


def _require_positive(value: float, name: str, *, strict_upper: bool = False) -> float:
    value = float(value)
    if not math.isfinite(value) or value <= 0:
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            f"{name} must be positive and finite",
        )
    return value


def _require_z_factor(value: float, name: str) -> float:
    value = _require_positive(value, name)
    if value < Z_FACTOR_MIN or value > Z_FACTOR_MAX:
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            f"{name} must be between {Z_FACTOR_MIN} and {Z_FACTOR_MAX}",
            details={"minimum": Z_FACTOR_MIN, "maximum": Z_FACTOR_MAX},
        )
    return value


def _fingerprint(inputs: dict[str, Any]) -> str:
    encoded = json.dumps(
        sanitize_json(inputs),
        ensure_ascii=True,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return f"sha256:{hashlib.sha256(encoded).hexdigest()}"


def _gas_pz_case(inputs: dict[str, Any], recorder: TraceRecorder) -> DomainResult:
    gas_volume_unit = require_unit(inputs.get("gas_volume_unit", "scf"), "gas_volume")
    pressure_unit = require_unit(inputs.get("pressure_unit", "psi"), "pressure")
    recorder.trace.input_units.update({"gas_volume_unit": gas_volume_unit, "pressure_unit": pressure_unit})

    # ── Gather and convert inputs ────────────────────────────────────────
    produced_gas = float(inputs["produced_gas"])
    pi = convert(_require_positive(produced_gas, "produced_gas"), gas_volume_unit, "scf")

    pip = _require_positive(inputs["initial_pressure"], "initial_pressure")
    pi_psi = convert(pip, pressure_unit, "psi")
    zi = _require_z_factor(inputs["initial_z_factor"], "initial_z_factor")

    pcur = _require_positive(inputs["current_pressure"], "current_pressure")
    p_psi = convert(pcur, pressure_unit, "psi")
    z = _require_z_factor(inputs["current_z_factor"], "current_z_factor")

    if p_psi >= pi_psi:
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            "current_pressure must be lower than initial_pressure",
        )

    # ── Bind variables ───────────────────────────────────────────────────
    recorder.bind(
        "produced_gas", "G_p", produced_gas, gas_volume_unit,
        source="input", description="Cumulative gas produced (surface volume)",
        editable=True, display_name="Produced gas (G_p)", input_bounds=(0.0, None),
    )
    recorder.bind(
        "initial_pressure", "p_i", pip, pressure_unit,
        source="input", description="Initial average reservoir pressure",
        editable=True, display_name="Initial pressure (p_i)", input_bounds=(0.0, None),
    )
    recorder.bind(
        "initial_z_factor", "z_i", zi, "", source="input",
        description="Gas compressibility factor at initial state",
        editable=True, display_name="Initial z-factor (z_i)", input_bounds=(Z_FACTOR_MIN, Z_FACTOR_MAX),
    )
    recorder.bind(
        "current_pressure", "p", pcur, pressure_unit,
        source="input", description="Current average reservoir pressure",
        editable=True, display_name="Current pressure (p)", input_bounds=(0.0, None),
    )
    recorder.bind(
        "current_z_factor", "z", z, "", source="input",
        description="Gas compressibility factor at current state",
        editable=True, display_name="Current z-factor (z)", input_bounds=(Z_FACTOR_MIN, Z_FACTOR_MAX),
    )

    # ── Derivation: p/z depletion equation ───────────────────────────────
    recorder.solve(
        "Depletion material-balance equation",
        "G_p = OGIP * (1 - (p/z) / (p_i/z_i))",
        latex=r"G_p \;=\; OGIP \left(1 - \frac{p/z}{\;p_i/z_i\;}\right)",
        for_symbol="OGIP",
        group="assemble",
        reads=("produced_gas", "initial_pressure", "initial_z_factor", "current_pressure", "current_z_factor"),
        writes="ogip",
        description="For a volumetric dry-gas reservoir, produced gas is the "
        "product of OGIP and the fractional depletion of the p/z ratio.",
    )

    # initial p_i/z_i
    initial_pz = pi_psi / zi
    recorder.evaluate(
        "Initial p/z ratio",
        "p_i / z_i",
        initial_pz,
        "psi",
        substitutions=(("p_i", f"{pi_psi:.4g} psi"), ("z_i", f"{zi:.4g}")),
        reads=("initial_pressure", "initial_z_factor"),
        writes="initial_pz",
        group="substitute",
        latex=r"\frac{p_i}{z_i} = \frac{" + f"{pi_psi:.4g}" + r"}{" + f"{zi:.4g}" + r"}",
        display_value=convert(initial_pz, "psi", pressure_unit),
        display_unit=pressure_unit,
    )
    recorder.bind(
        "initial_pz", "p_i/z_i", initial_pz, "psi",
        source="derived", description="Initial pressure divided by initial z-factor",
    )

    # current p/z
    current_pz = p_psi / z
    recorder.evaluate(
        "Current p/z ratio",
        "p / z",
        current_pz,
        "psi",
        substitutions=(("p", f"{p_psi:.4g} psi"), ("z", f"{z:.4g}")),
        reads=("current_pressure", "current_z_factor"),
        writes="current_pz",
        group="substitute",
        latex=r"\frac{p}{z} = \frac{" + f"{p_psi:.4g}" + r"}{" + f"{z:.4g}" + r"}",
        display_value=convert(current_pz, "psi", pressure_unit),
        display_unit=pressure_unit,
    )
    recorder.bind(
        "current_pz", "p/z", current_pz, "psi",
        source="derived", description="Current pressure divided by current z-factor",
    )

    # depletion fraction
    denominator = 1.0 - current_pz / initial_pz
    recorder.substitute(
        "Depletion fraction",
        "1 - (p/z) / (p_i/z_i)",
        reads=("initial_pz", "current_pz"),
        writes="depletion_fraction",
        group="reduce",
        note="Re-arrange the balance so the unknown OGIP is isolated: "
        "OGIP = G_p / (1 - (p/z)/(p_i/z_i)).",
    )
    recorder.evaluate(
        "Depletion fraction",
        "1 - (p/z) / (p_i/z_i)",
        denominator,
        "",
        substitutions=(("p/z", f"{current_pz:.4g} psi"), ("p_i/z_i", f"{initial_pz:.4g} psi")),
        reads=("initial_pz", "current_pz"),
        writes="depletion_fraction",
        group="reduce",
    )
    recorder.assert_true(
        "Depletion denominator is well-conditioned",
        denominator > SIZEOF_MSG,
        detail=f"1 - (p/z)/(p_i/z_i) = {denominator:.6g}; must be above "
        f"{SIZEOF_MSG:.1e} for a stable OGIP estimate.",
        reads=("initial_pz", "current_pz"),
        group="reduce",
    )
    if denominator <= SIZEOF_MSG:
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            "p/z depletion term is too small for a stable OGIP estimate",
        )

    # Solve for OGIP
    ogip_scf = pi / denominator
    recorder.solve(
        "Solve for OGIP",
        "OGIP = G_p / (1 - (p/z) / (p_i/z_i))",
        latex=r"OGIP \;=\; \frac{G_p}{1 - \dfrac{p/z}{\;p_i/z_i\;}}",
        for_symbol="OGIP",
        group="solve",
        reads=("produced_gas", "initial_pz", "current_pz"),
        writes="ogip",
    )
    recorder.evaluate(
        "Original gas in place (standard volume)",
        "G_p / (1 - (p/z) / (p_i/z_i))",
        ogip_scf,
        "scf",
        substitutions=(("G_p", f"{pi:.4g} scf"), ("1 - (p/z)/(p_i/z_i)", f"{denominator:.6g}")),
        reads=("produced_gas", "depletion_fraction"),
        writes="ogip_scf",
        group="solve",
    )

    ogip = convert(ogip_scf, "scf", gas_volume_unit)
    recorder.bind("ogip", "OGIP", ogip, gas_volume_unit, source="derived")
    produced_input = float(inputs["produced_gas"])
    recovery_factor = produced_input / ogip if ogip else 0.0
    remaining = ogip - produced_input
    if remaining < -1e-10:
        raise DomainError(
            DomainErrorCode.INVALID_RESULT,
            "Estimated remaining gas is negative; review units and p/z inputs",
        )
    remaining = max(remaining, 0.0)

    recorder.evaluate(
        "Recovery factor",
        "G_p / OGIP",
        recovery_factor,
        "",
        substitutions=(("G_p", f"{produced_input:.4g} {gas_volume_unit}"),
                       ("OGIP", f"{ogip:.4g} {gas_volume_unit}")),
        reads=("produced_gas", "ogip"),
        writes="recovery_factor",
    )

    assumptions = [
        "Volumetric dry-gas p/z material balance",
        "No water influx, gas cap, or rock compressibility correction",
    ]
    result = {
        "estimated_ogip": ogip,
        "remaining_gas": remaining,
        "initial_p_over_z": convert(initial_pz, "psi", pressure_unit),
        "current_p_over_z": convert(current_pz, "psi", pressure_unit),
        "recovery_factor": recovery_factor,
    }
    return DomainResult(
        engine_id=ENGINE_ID,
        engine_version="1.0.0",
        provider_id=PROVIDER_ID,
        provider_version=PROVIDER_VERSION,
        operation=OPERATION,
        method=METHOD,
        deterministic=True,
        result=sanitize_json(result),
        units={
            "estimated_ogip": gas_volume_unit,
            "remaining_gas": gas_volume_unit,
            "initial_p_over_z": pressure_unit,
            "current_p_over_z": pressure_unit,
        },
        metrics={"recovery_factor": recovery_factor},
        assumptions=assumptions,
        tolerances={"absolute": 1e-10, "relative": 1e-8},
        applicability=[
            "Dry or near-dry gas reservoir",
            "Single average pressure and z-factor per state",
        ],
        provenance={
            "engine_id": ENGINE_ID,
            "engine_version": "1.0.0",
            "provider_id": PROVIDER_ID,
            "provider_version": PROVIDER_VERSION,
            "formula_version": FORMULA_VERSION,
            "operation": OPERATION,
            "method": METHOD,
            "deterministic": True,
            "input_fingerprint": _fingerprint(inputs),
            "reference": 'Standing (1947), pressure/z material balance',
            "formula_id": FORMULA_ID,
            "source": "curated",
            "parameter_sources": dict(recorder.trace.parameter_sources),
            "unit_audit": audit_units(GAS_PZ_FORMULA.unit_dimensions, inputs, {
                "estimated_ogip": gas_volume_unit,
                "remaining_gas": gas_volume_unit,
            }),
            "gate": [step.title for step in recorder.trace.steps if step.kind.value == "assert" and step.value is True],
        },
    )


GAS_PZ_FORMULA = FormulaSpec(
    formula_id=FORMULA_ID,
    name="Dry-gas p/z material balance",
    method="p_over_z",
    description=(
        "Estimate original gas in place (OGIP) and recovery factor from "
        "produced volume and the change in the pressure/z-factor ratio, "
        "with each derivation step shown."
    ),
    symbols=(
        "G_p produced gas · p_i, p reservoir pressure · z_i, z gas "
        "z-factor · OGIP initial gas in place · RF recovery factor"
    ),
    unit_dimensions={
        "produced_gas": "gas_volume",
        "initial_pressure": "pressure",
        "current_pressure": "pressure",
        "initial_z_factor": "dimensionless",
        "current_z_factor": "dimensionless",
        "gas_volume_unit": "gas_volume",
        "pressure_unit": "pressure",
    },
    applicability=[
        "Dry or near-dry gas reservoir",
        "Single average pressure and z-factor per state",
    ],
    assumptions=[
        "Volumetric dry-gas p/z material balance",
        "No water influx, gas cap, or rock compressibility correction",
    ],
    version=FORMULA_VERSION,
    case=_gas_pz_case,
    reference="Standing (1947), pressure/z material balance",
)

__all__ = ["GAS_PZ_FORMULA", "FORMULA_ID"]
