# -*- coding: utf-8 -*-
"""Pure deterministic formulas for underground-gas-storage inventory."""

from __future__ import annotations

import math
from dataclasses import replace
from typing import Any

from ..common.errors import DomainError, DomainErrorCode
from ..common.serialization import sanitize_json, validate_json_safe
from ..computation.ports import ComputationOutput
from ..deterministic.units import require_unit
from .models import (
    EffectiveInventoryLayerRequest,
    EffectiveInventoryRequest,
    InventoryAccountingRequest,
    StorageInventoryEvaluationRequest,
)


def _positive(value: float, name: str) -> float:
    number = float(value)
    if not math.isfinite(number) or number <= 0.0:
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            f"{name} must be positive and finite",
        )
    return number


def _nonnegative(value: float, name: str) -> float:
    number = float(value)
    if not math.isfinite(number) or number < 0.0:
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            f"{name} must be non-negative and finite",
        )
    return number


def _required_text(value: str, name: str) -> str:
    text = str(value).strip()
    if not text:
        raise DomainError(DomainErrorCode.INVALID_INPUT, f"{name} must not be empty")
    return text


def _optional_positive(value: float | None, name: str) -> float | None:
    return None if value is None else _positive(value, name)


class _StorageInventoryAdapter:
    provider_id = "ugsci-storage-inventory-core"
    provider_version = "1.2.0"
    engine_version = "1.2.0"
    deterministic = True
    support_dependencies: tuple[str, ...] = ()

    @staticmethod
    def canonicalize_request(request: Any) -> Any:
        """Normalize unit aliases and surrounding text before fingerprinting."""
        if isinstance(request, InventoryAccountingRequest):
            return replace(
                request,
                gas_volume_unit=require_unit(request.gas_volume_unit, "gas_volume"),
            )
        if isinstance(request, EffectiveInventoryRequest):
            return replace(
                request,
                cycle_id=request.cycle_id.strip(),
                injection_end_state_id=request.injection_end_state_id.strip(),
                evaluation_state_id=request.evaluation_state_id.strip(),
                gas_volume_unit=require_unit(request.gas_volume_unit, "gas_volume"),
                pressure_unit=require_unit(request.pressure_unit, "pressure"),
            )
        if isinstance(request, StorageInventoryEvaluationRequest):
            return replace(
                request,
                effective_inventory=_StorageInventoryAdapter.canonicalize_request(
                    request.effective_inventory
                ),
                daily_rate_unit=require_unit(request.daily_rate_unit, "gas_rate"),
            )
        return request

    @staticmethod
    def _output(
        result: dict[str, Any],
        *,
        units: dict[str, str],
        metrics: dict[str, float | int | str | None] | None = None,
        assumptions: list[str] | None = None,
        warnings: list[str] | None = None,
        applicability: list[str],
    ) -> ComputationOutput:
        validate_json_safe(result)
        validate_json_safe(metrics or {})
        return ComputationOutput(
            result=sanitize_json(result),
            units=units,
            metrics=metrics or {},
            assumptions=assumptions or [],
            warnings=warnings or [],
            tolerances={"absolute": 1e-10, "relative": 1e-9},
            applicability=applicability,
        )


def calculate_layer_effective_inventory(
    layer: EffectiveInventoryLayerRequest,
    *,
    relative_tolerance: float,
    maximum_inverse_withdrawal_fraction: float,
) -> dict[str, float | str]:
    """Apply Grm = Qp*(Pin/Zin)/((Pin/Zin)-(P/Z)) to one layer."""
    name = _required_text(layer.name, "layer.name")
    produced = _positive(layer.produced_gas, f"{name}.produced_gas")
    pin = _positive(layer.injection_end_pressure, f"{name}.injection_end_pressure")
    zin = _positive(layer.injection_end_z, f"{name}.injection_end_z")
    pressure = _positive(layer.evaluation_pressure, f"{name}.evaluation_pressure")
    z_factor = _positive(layer.evaluation_z, f"{name}.evaluation_z")
    initial_pz = pin / zin
    current_pz = pressure / z_factor
    denominator = initial_pz - current_pz
    scale = max(abs(initial_pz), abs(current_pz), 1.0)
    if denominator <= 0.0:
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            f"{name}: injection_end_pressure/Z must exceed evaluation_pressure/Z",
        )
    if denominator <= relative_tolerance * scale:
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            f"{name}: p/Z depletion denominator is too small for a stable estimate",
        )
    effective = produced * initial_pz / denominator
    if not math.isfinite(effective) or effective <= 0.0:
        raise DomainError(
            DomainErrorCode.INVALID_RESULT,
            f"{name}: effective inventory is non-positive or non-finite",
        )
    inverse_withdrawal_fraction = effective / produced
    if inverse_withdrawal_fraction > maximum_inverse_withdrawal_fraction:
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            f"{name}: inverse withdrawal fraction exceeds the engineering stability limit "
            f"({maximum_inverse_withdrawal_fraction:g})",
        )
    return {
        "name": name,
        "produced_gas": produced,
        "injection_end_p_over_z": initial_pz,
        "evaluation_p_over_z": current_pz,
        "p_over_z_depletion": denominator,
        "withdrawal_fraction": produced / effective,
        "inverse_withdrawal_fraction": inverse_withdrawal_fraction,
        "effective_inventory": effective,
    }


def calculate_effective_inventory(
    request: EffectiveInventoryRequest,
) -> tuple[list[dict[str, float | str]], float, list[str]]:
    if not request.layers:
        raise DomainError(DomainErrorCode.INVALID_INPUT, "layers must not be empty")
    _required_text(request.cycle_id, "cycle_id")
    injection_state = _required_text(request.injection_end_state_id, "injection_end_state_id")
    evaluation_state = _required_text(request.evaluation_state_id, "evaluation_state_id")
    if injection_state.casefold() == evaluation_state.casefold():
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            "injection_end_state_id and evaluation_state_id must identify different states",
        )
    if request.pressure_basis != "absolute":
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            "pressure_basis must be absolute for p/Z inventory calculation",
        )
    require_unit(request.gas_volume_unit, "gas_volume")
    require_unit(request.pressure_unit, "pressure")
    tolerance = _positive(
        request.denominator_relative_tolerance,
        "denominator_relative_tolerance",
    )
    maximum_inverse = _positive(
        request.maximum_inverse_withdrawal_fraction,
        "maximum_inverse_withdrawal_fraction",
    )
    names = [_required_text(layer.name, "layer.name") for layer in request.layers]
    if len(names) != len({name.casefold() for name in names}):
        raise DomainError(DomainErrorCode.INVALID_INPUT, "layer names must be unique")
    rows = [
        calculate_layer_effective_inventory(
            layer,
            relative_tolerance=tolerance,
            maximum_inverse_withdrawal_fraction=maximum_inverse,
        )
        for layer in request.layers
    ]
    warnings: list[str] = []
    if any(float(row["inverse_withdrawal_fraction"]) > 20.0 for row in rows):
        warnings.append(
            "At least one layer has an inverse withdrawal fraction above 20; "
            "treat the p/Z estimate as high-sensitivity and cross-check pressure and Z factors."
        )
    if any(
        not 0.2 <= float(z_factor) <= 2.0
        for layer in request.layers
        for z_factor in (layer.injection_end_z, layer.evaluation_z)
    ):
        warnings.append(
            "At least one Z factor is outside the broad engineering screening range [0.2, 2.0]; "
            "confirm the PVT basis before use."
        )
    return rows, sum(float(row["effective_inventory"]) for row in rows), warnings


def calculate_accounting_inventory(
    initial_inventory: float,
    cumulative_injected: float,
    cumulative_produced: float,
) -> tuple[float, float]:
    """Return book inventory and net change for one metering boundary."""
    initial = _nonnegative(initial_inventory, "initial_inventory")
    injected = _nonnegative(cumulative_injected, "cumulative_injected")
    produced = _nonnegative(cumulative_produced, "cumulative_produced")
    net_change = injected - produced
    inventory = initial + net_change
    if inventory < 0.0:
        raise DomainError(
            DomainErrorCode.INVALID_RESULT,
            "accounting inventory is negative; check time boundaries and metering signs",
        )
    return inventory, net_change


class InventoryAccountingAdapter(_StorageInventoryAdapter):
    operation = "storage.inventory.accounting"

    def compute(self, request: InventoryAccountingRequest) -> ComputationOutput:
        gas_volume_unit = require_unit(request.gas_volume_unit, "gas_volume")
        inventory, net_change = calculate_accounting_inventory(
            request.initial_inventory,
            request.cumulative_injected,
            request.cumulative_produced,
        )
        return self._output(
            {
                "inventory": inventory,
                "net_change": net_change,
                "equation": "Gr = G0 + sum(Qin) - sum(Qp)",
            },
            units={"inventory": gas_volume_unit, "net_change": gas_volume_unit},
            assumptions=[
                "All volumes use the same standard reference conditions",
                "Injection and production totals share one accounting time boundary",
            ],
            applicability=["Book/accounting inventory; not effective controlled inventory"],
        )


class EffectiveInventoryAdapter(_StorageInventoryAdapter):
    operation = "storage.inventory.effective_controlled"

    def compute(self, request: EffectiveInventoryRequest) -> ComputationOutput:
        rows, total, warnings = calculate_effective_inventory(request)
        gas_volume_unit = require_unit(request.gas_volume_unit, "gas_volume")
        pressure_unit = require_unit(request.pressure_unit, "pressure")
        return self._output(
            {
                "effective_inventory": total,
                "layers": rows,
                "cycle_id": request.cycle_id,
                "injection_end_state_id": request.injection_end_state_id,
                "evaluation_state_id": request.evaluation_state_id,
                "pressure_basis": request.pressure_basis,
                "equation": "Grm = Qp*(Pin/Zin)/((Pin/Zin)-(P/Z))",
                "quantity_definition": "inventory effectively controlled by the current well pattern",
                "quality_gate": {
                    "numerical_denominator_relative_tolerance": request.denominator_relative_tolerance,
                    "maximum_inverse_withdrawal_fraction": request.maximum_inverse_withdrawal_fraction,
                    "high_sensitivity_warning_above": 20.0,
                },
            },
            units={
                "effective_inventory": gas_volume_unit,
                "layers.produced_gas": gas_volume_unit,
                "layers.effective_inventory": gas_volume_unit,
                "layers.injection_end_p_over_z": pressure_unit,
                "layers.evaluation_p_over_z": pressure_unit,
                "layers.p_over_z_depletion": pressure_unit,
                "layers.withdrawal_fraction": "dimensionless",
                "layers.inverse_withdrawal_fraction": "dimensionless",
                "quality_gate.numerical_denominator_relative_tolerance": "dimensionless",
                "quality_gate.maximum_inverse_withdrawal_fraction": "dimensionless",
                "quality_gate.high_sensitivity_warning_above": "dimensionless",
            },
            metrics={"layer_count": len(rows), "total_produced_gas": sum(float(row["produced_gas"]) for row in rows)},
            assumptions=[
                "Each row uses one layer, one production segment and consistent state boundaries",
                "Pressure is an average equilibrium reservoir pressure for that layer",
                "Z factors correspond to the same composition, temperature and pressure states",
                "Layer results are calculated independently before aggregation",
            ],
            warnings=warnings,
            applicability=[
                "Effective controlled inventory (Grm) evaluation",
                "Not working gas, cushion gas, book inventory or Gr-Grmin",
                "Use reservoir simulation, RTA or geological models for cross-validation when available",
            ],
        )


class StorageInventoryEvaluationAdapter(_StorageInventoryAdapter):
    operation = "storage.inventory.evaluate"

    def compute(self, request: StorageInventoryEvaluationRequest) -> ComputationOutput:
        rows, effective, warnings = calculate_effective_inventory(request.effective_inventory)
        design = _positive(request.design_capacity, "design_capacity")
        working = _optional_positive(request.working_gas, "working_gas")
        design_working = _optional_positive(request.design_working_gas, "design_working_gas")
        peak = _optional_positive(request.peak_daily_rate, "peak_daily_rate")
        design_peak = _optional_positive(request.design_peak_daily_rate, "design_peak_daily_rate")
        gas_volume_unit = require_unit(request.effective_inventory.gas_volume_unit, "gas_volume")
        pressure_unit = require_unit(request.effective_inventory.pressure_unit, "pressure")
        daily_rate_unit = require_unit(request.daily_rate_unit, "gas_rate")
        accounting_values = (
            request.initial_inventory,
            request.cumulative_injected,
            request.cumulative_produced,
        )
        accounting_provided = any(value is not None for value in accounting_values)
        if request.book_inventory is not None and accounting_provided:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "provide either book_inventory or the three accounting inputs, not both",
            )
        if request.book_inventory is None:
            if not all(value is not None for value in accounting_values):
                raise DomainError(
                    DomainErrorCode.INVALID_INPUT,
                    "book_inventory or all of initial_inventory, cumulative_injected and "
                    "cumulative_produced is required",
                )
            book, accounting_net_change = calculate_accounting_inventory(
                request.initial_inventory,
                request.cumulative_injected,
                request.cumulative_produced,
            )
            book_source = "injection_production_accounting"
        else:
            book = _positive(request.book_inventory, "book_inventory")
            accounting_net_change = None
            book_source = "provided_book_inventory"
        book = _positive(book, "book_inventory")
        if (working is None) != (design_working is None):
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "working_gas and design_working_gas must be provided together",
            )
        if (peak is None) != (design_peak is None):
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "peak_daily_rate and design_peak_daily_rate must be provided together",
            )
        if design_working is not None and design_working > design:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "design_working_gas must not exceed design_capacity",
            )
        book_minus_effective = book - effective
        if book_minus_effective < 0.0:
            warnings.append(
                "Effective inventory exceeds book inventory. Review layer pressure/Z inputs and "
                "metering boundaries before interpreting the book/effective difference."
            )
        if working is not None and working > effective:
            warnings.append(
                "Working gas exceeds effective controlled inventory; verify quantity definitions and time boundaries."
            )
        warnings.append(
            "The effective-inventory value is a calculation/review candidate, not an approved capacity."
        )
        result: dict[str, Any] = {
            "effective_inventory": effective,
            "book_inventory": book,
            "book_minus_effective_inventory": book_minus_effective,
            "effective_minus_book_percent": (effective - book) / book * 100.0,
            "design_capacity": design,
            "effective_inventory_design_compliance_percent": effective / design * 100.0,
            "book_inventory_fill_percent": book / design * 100.0,
            "effective_to_book_percent": effective / book * 100.0,
            "book_inventory_source": book_source,
            "review_status": "calculated_recommendation_pending_review",
            "review_reference": None,
            "layers": rows,
            "quantity_separation": {
                "effective_inventory": "well-pattern controlled total inventory",
                "book_inventory": "metering/accounting inventory",
                "working_gas": "cyclically withdrawable gas in the operating pressure window",
            },
            "quality_gate": {
                "numerical_denominator_relative_tolerance": (
                    request.effective_inventory.denominator_relative_tolerance
                ),
                "maximum_inverse_withdrawal_fraction": (
                    request.effective_inventory.maximum_inverse_withdrawal_fraction
                ),
                "high_sensitivity_warning_above": 20.0,
            },
        }
        if accounting_net_change is not None:
            result["book_inventory_accounting"] = {
                "initial_inventory": request.initial_inventory,
                "cumulative_injected": request.cumulative_injected,
                "cumulative_produced": request.cumulative_produced,
                "net_change": accounting_net_change,
                "equation": "Gr = G0 + sum(Qin) - sum(Qp)",
            }
        units = {
            "effective_inventory": gas_volume_unit,
            "book_inventory": gas_volume_unit,
            "book_minus_effective_inventory": gas_volume_unit,
            "effective_minus_book_percent": "%",
            "design_capacity": gas_volume_unit,
            "effective_inventory_design_compliance_percent": "%",
            "book_inventory_fill_percent": "%",
            "effective_to_book_percent": "%",
            "layers.produced_gas": gas_volume_unit,
            "layers.effective_inventory": gas_volume_unit,
            "layers.injection_end_p_over_z": pressure_unit,
            "layers.evaluation_p_over_z": pressure_unit,
            "layers.p_over_z_depletion": pressure_unit,
            "layers.withdrawal_fraction": "dimensionless",
            "layers.inverse_withdrawal_fraction": "dimensionless",
            "quality_gate.numerical_denominator_relative_tolerance": "dimensionless",
            "quality_gate.maximum_inverse_withdrawal_fraction": "dimensionless",
            "quality_gate.high_sensitivity_warning_above": "dimensionless",
        }
        if accounting_net_change is not None:
            units.update(
                {
                    "book_inventory_accounting.initial_inventory": gas_volume_unit,
                    "book_inventory_accounting.cumulative_injected": gas_volume_unit,
                    "book_inventory_accounting.cumulative_produced": gas_volume_unit,
                    "book_inventory_accounting.net_change": gas_volume_unit,
                }
            )
        if working is not None and design_working is not None:
            result.update(
                working_gas=working,
                design_working_gas=design_working,
                working_gas_compliance_percent=working / design_working * 100.0,
            )
            units.update(
                working_gas=gas_volume_unit,
                design_working_gas=gas_volume_unit,
                working_gas_compliance_percent="%",
            )
        if peak is not None and design_peak is not None:
            result.update(
                peak_daily_rate=peak,
                design_peak_daily_rate=design_peak,
                peak_daily_compliance_percent=peak / design_peak * 100.0,
            )
            units.update(
                peak_daily_rate=daily_rate_unit,
                design_peak_daily_rate=daily_rate_unit,
                peak_daily_compliance_percent="%",
            )
        return self._output(
            result,
            units=units,
            metrics={
                "layer_count": len(rows),
                "effective_inventory_design_compliance_percent": effective / design * 100.0,
                "book_inventory_fill_percent": book / design * 100.0,
                "effective_to_book_percent": effective / book * 100.0,
            },
            assumptions=[
                "Effective inventory is calculated independently from book inventory and working gas",
                "Calculation output is always pending review; approval is an external workflow",
            ],
            warnings=warnings,
            applicability=["Deterministic inventory-evaluation summary after input-data gating"],
        )


__all__ = [
    "EffectiveInventoryAdapter",
    "InventoryAccountingAdapter",
    "StorageInventoryEvaluationAdapter",
    "calculate_effective_inventory",
    "calculate_layer_effective_inventory",
]
