# -*- coding: utf-8 -*-
"""Pure deterministic formulas for underground-gas-storage inventory."""

from __future__ import annotations

import math
from dataclasses import replace
from typing import Any

from ..common.errors import DomainError, DomainErrorCode
from ..common.serialization import sanitize_json, validate_json_safe
from ..computation.ports import ComputationOutput
from ..deterministic.units import convert, require_unit
from .models import (
    EffectiveInventoryLayerRequest,
    EffectiveInventoryRequest,
    InventoryAccountingRequest,
    StorageCapacityEvaluationRequest,
    StorageCapacityLayerRequest,
    StorageAllocationWellRequest,
    StorageInjectionAllocationRequest,
    StorageProductionAllocationRequest,
    StorageScenarioConstraint,
    StorageScenarioObjective,
    StorageScenarioOptimizationRequest,
    StorageScenarioRequest,
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
    provider_version = "1.3.0"
    engine_version = "1.3.0"
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
        if isinstance(request, StorageCapacityEvaluationRequest):
            return replace(
                request,
                pore_volume_unit=require_unit(request.pore_volume_unit, "volume"),
                pressure_unit=require_unit(request.pressure_unit, "pressure"),
                temperature_unit=require_unit(request.temperature_unit, "temperature"),
                gas_volume_unit=require_unit(request.gas_volume_unit, "gas_volume"),
            )
        if isinstance(request, (StorageInjectionAllocationRequest, StorageProductionAllocationRequest)):
            return replace(
                request,
                wells=tuple(
                    replace(well, name=str(well.name).strip()) for well in request.wells
                ),
                rate_unit=require_unit(request.rate_unit, "gas_rate"),
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
    injection_state = _required_text(
        request.injection_end_state_id, "injection_end_state_id"
    )
    evaluation_state = _required_text(
        request.evaluation_state_id, "evaluation_state_id"
    )
    if injection_state.casefold() == evaluation_state.casefold():
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            "injection_end_state_id and evaluation_state_id must identify different states",
        )
    if request.pressure_basis not in {
        "absolute",
        "apparent_formation",
        "report_defined",
    }:
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            "pressure_basis must be an explicit supported basis for p/Z inventory calculation",
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
    if request.pressure_basis != "absolute":
        warnings.append(
            "Pressure basis is report-defined/apparent formation pressure; this is an empirical engineering p/Z estimate. "
            "Do not reinterpret it as thermodynamic absolute pressure without independent calibration."
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
            applicability=[
                "Book/accounting inventory; not effective controlled inventory"
            ],
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
            metrics={
                "layer_count": len(rows),
                "total_produced_gas": sum(float(row["produced_gas"]) for row in rows),
            },
            assumptions=[
                "Each row uses one layer, one production segment and consistent state boundaries",
                "Pressure is an average equilibrium reservoir pressure for that layer",
                "Z factors correspond to the same composition, temperature and pressure states",
                "Layer results are calculated independently before aggregation",
                "Both states use the explicitly declared pressure basis; no pressure conversion is performed",
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
        rows, effective, warnings = calculate_effective_inventory(
            request.effective_inventory
        )
        design = _positive(request.design_capacity, "design_capacity")
        working = _optional_positive(request.working_gas, "working_gas")
        design_working = _optional_positive(
            request.design_working_gas, "design_working_gas"
        )
        peak = _optional_positive(request.peak_daily_rate, "peak_daily_rate")
        design_peak = _optional_positive(
            request.design_peak_daily_rate, "design_peak_daily_rate"
        )
        gas_volume_unit = require_unit(
            request.effective_inventory.gas_volume_unit, "gas_volume"
        )
        pressure_unit = require_unit(
            request.effective_inventory.pressure_unit, "pressure"
        )
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
                "effective_inventory_design_compliance_percent": effective
                / design
                * 100.0,
                "book_inventory_fill_percent": book / design * 100.0,
                "effective_to_book_percent": effective / book * 100.0,
            },
            assumptions=[
                "Effective inventory is calculated independently from book inventory and working gas",
                "Calculation output is always pending review; approval is an external workflow",
            ],
            warnings=warnings,
            applicability=[
                "Deterministic inventory-evaluation summary after input-data gating"
            ],
        )


def calculate_capacity_layer(
    layer: StorageCapacityLayerRequest,
    *,
    pore_volume_unit: str,
    pressure_unit: str,
    temperature_unit: str,
    standard_pressure: float,
    standard_temperature: float,
    gas_volume_unit: str,
) -> dict[str, float | str]:
    """Convert a layer pressure envelope into standard gas volumes.

    The result is intentionally labelled as a screening estimate.  It uses
    the explicitly supplied pressure/Z and temperature states and does not
    infer fluid, water, geomechanical or well deliverability effects.
    """
    name = _required_text(layer.name, "layer.name")
    pore_volume = _positive(layer.pore_volume, f"{name}.pore_volume")
    maximum_pressure = _positive(layer.maximum_pressure, f"{name}.maximum_pressure")
    minimum_pressure = _positive(layer.minimum_pressure, f"{name}.minimum_pressure")
    maximum_z = _positive(layer.maximum_z, f"{name}.maximum_z")
    minimum_z = _positive(layer.minimum_z, f"{name}.minimum_z")
    temperature = _positive(layer.temperature, f"{name}.temperature")
    ps = _positive(standard_pressure, "standard_pressure")
    ts = _positive(standard_temperature, "standard_temperature")
    pv_m3 = convert(pore_volume, pore_volume_unit, "m3")
    pmax_pa = convert(maximum_pressure, pressure_unit, "pa")
    pmin_pa = convert(minimum_pressure, pressure_unit, "pa")
    temp_k = convert(temperature, temperature_unit, "k")
    ps_pa = convert(ps, pressure_unit, "pa")
    if pmax_pa / maximum_z <= pmin_pa / minimum_z:
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            f"{name}: maximum_pressure/maximum_z must exceed minimum_pressure/minimum_z",
        )
    maximum_standard_m3 = pv_m3 * (pmax_pa / maximum_z) * ts / (temp_k * ps_pa)
    minimum_standard_m3 = pv_m3 * (pmin_pa / minimum_z) * ts / (temp_k * ps_pa)
    maximum_capacity = convert(maximum_standard_m3, "sm3", gas_volume_unit)
    minimum_inventory = convert(minimum_standard_m3, "sm3", gas_volume_unit)
    working_gas = maximum_capacity - minimum_inventory
    if not all(math.isfinite(value) and value >= 0.0 for value in (maximum_capacity, minimum_inventory, working_gas)):
        raise DomainError(DomainErrorCode.INVALID_RESULT, f"{name}: capacity result is not finite")
    return {
        "name": name,
        "pore_volume": pore_volume,
        "maximum_pressure": maximum_pressure,
        "minimum_pressure": minimum_pressure,
        "maximum_z": maximum_z,
        "minimum_z": minimum_z,
        "temperature": temperature,
        "maximum_capacity": maximum_capacity,
        "minimum_inventory": minimum_inventory,
        "working_gas": working_gas,
        "working_gas_fraction": working_gas / maximum_capacity if maximum_capacity else 0.0,
    }


class StorageCapacityEvaluationAdapter(_StorageInventoryAdapter):
    """Pressure-envelope storage capacity screening adapter."""

    operation = "storage.capacity.evaluate"

    def compute(self, request: StorageCapacityEvaluationRequest) -> ComputationOutput:
        if not request.layers:
            raise DomainError(DomainErrorCode.INVALID_INPUT, "layers must not be empty")
        pore_volume_unit = require_unit(request.pore_volume_unit, "volume")
        pressure_unit = require_unit(request.pressure_unit, "pressure")
        temperature_unit = require_unit(request.temperature_unit, "temperature")
        gas_volume_unit = require_unit(request.gas_volume_unit, "gas_volume")
        names = [_required_text(layer.name, "layer.name") for layer in request.layers]
        if len(names) != len({name.casefold() for name in names}):
            raise DomainError(DomainErrorCode.INVALID_INPUT, "layer names must be unique")
        rows = [
            calculate_capacity_layer(
                layer,
                pore_volume_unit=pore_volume_unit,
                pressure_unit=pressure_unit,
                temperature_unit=temperature_unit,
                standard_pressure=request.standard_pressure,
                standard_temperature=request.standard_temperature,
                gas_volume_unit=gas_volume_unit,
            )
            for layer in request.layers
        ]
        total_capacity = sum(float(row["maximum_capacity"]) for row in rows)
        cushion_gas = sum(float(row["minimum_inventory"]) for row in rows)
        working_gas = sum(float(row["working_gas"]) for row in rows)
        return self._output(
            {
                "total_capacity": total_capacity,
                "cushion_gas": cushion_gas,
                "working_gas": working_gas,
                "working_gas_fraction": working_gas / total_capacity if total_capacity else 0.0,
                "layers": rows,
                "pressure_window": {
                    "maximum_pressure": max(float(layer.maximum_pressure) for layer in request.layers),
                    "minimum_pressure": min(float(layer.minimum_pressure) for layer in request.layers),
                    "pressure_unit": pressure_unit,
                },
                "method": "pressure_envelope_ideal_gas_scaling",
                "review_status": "calculated_recommendation_pending_review",
                "review_reference": None,
            },
            units={
                "total_capacity": gas_volume_unit,
                "cushion_gas": gas_volume_unit,
                "working_gas": gas_volume_unit,
                "working_gas_fraction": "dimensionless",
                "layers.pore_volume": pore_volume_unit,
                "layers.maximum_pressure": pressure_unit,
                "layers.minimum_pressure": pressure_unit,
                "layers.maximum_capacity": gas_volume_unit,
                "layers.minimum_inventory": gas_volume_unit,
                "layers.working_gas": gas_volume_unit,
                "layers.working_gas_fraction": "dimensionless",
                "pressure_window.maximum_pressure": pressure_unit,
                "pressure_window.minimum_pressure": pressure_unit,
            },
            metrics={
                "layer_count": len(rows),
                "total_capacity": total_capacity,
                "cushion_gas": cushion_gas,
                "working_gas": working_gas,
            },
            assumptions=[
                "Each layer uses a connected pore volume and explicit maximum/minimum pressure/Z states",
                "Ideal-gas pressure/temperature scaling is used to convert reservoir volume to standard gas volume",
                "No water influx, geomechanics, non-equilibrium effects or well deliverability are inferred",
                "The output is a screening estimate pending engineering review and model cross-check",
            ],
            warnings=[],
            applicability=[
                "Early-stage pressure-envelope capacity screening",
                "Use compositional/PVT simulation and deliverability studies for approved design capacity",
            ],
        )


def _validate_allocation_wells(
    wells: tuple[StorageAllocationWellRequest, ...],
) -> list[dict[str, Any]]:
    """Normalize well bounds while preserving a deterministic input order."""
    if not wells:
        raise DomainError(DomainErrorCode.INVALID_INPUT, "wells must not be empty")
    names = [_required_text(well.name, "well.name") for well in wells]
    if len(names) != len({name.casefold() for name in names}):
        raise DomainError(DomainErrorCode.INVALID_INPUT, "well names must be unique")
    normalized: list[dict[str, Any]] = []
    for well, name in zip(wells, names):
        maximum = _nonnegative(well.maximum_rate, f"{name}.maximum_rate")
        minimum = _nonnegative(well.minimum_rate, f"{name}.minimum_rate")
        weight = _positive(well.weight, f"{name}.weight")
        if not isinstance(well.available, bool):
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                f"{name}.available must be a boolean",
            )
        if minimum > maximum:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                f"{name}.minimum_rate must not exceed maximum_rate",
            )
        normalized.append(
            {
                "name": name,
                "minimum_rate": minimum,
                "maximum_rate": maximum,
                "weight": weight,
                "available": bool(well.available),
            }
        )
    return normalized


def calculate_storage_allocation(
    wells: tuple[StorageAllocationWellRequest, ...],
    target_rate: float,
    *,
    rate_unit: str,
    require_feasible: bool,
    quantity_label: str,
) -> ComputationOutput:
    """Perform bounded weighted water-filling for injection or production.

    The result is a transparent screening recommendation.  Minimum rates are
    honoured first, then any remaining target is distributed by priority
    weight until each well reaches its maximum.  If the target is outside the
    aggregate bounds, the response remains useful and marks ``feasible``
    false unless ``require_feasible`` requests an input error.
    """
    unit = require_unit(rate_unit, "gas_rate")
    target = _nonnegative(target_rate, quantity_label)
    if not isinstance(require_feasible, bool):
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            "require_feasible must be a boolean",
        )
    rows = _validate_allocation_wells(wells)
    active = [row for row in rows if row["available"]]
    requested_key = quantity_label
    if not active:
        if target > 0:
            if require_feasible:
                raise DomainError(DomainErrorCode.INVALID_INPUT, "no available wells")
            return _StorageInventoryAdapter._output(
                {
                    requested_key: target,
                    "requested_rate": target,
                    "target_rate": target,
                    "allocated_rate": 0.0,
                    "unmet_rate": target,
                    "oversupply_rate": 0.0,
                    "feasible": False,
                    "wells": [
                        {**row, "allocated_rate": 0.0, "constraint_status": "unavailable"}
                        for row in rows
                    ],
                    "method": "bounded_weighted_water_filling",
                    "review_status": "calculated_recommendation_pending_review",
                },
                units={"target_rate": unit, "requested_rate": unit, requested_key: unit, "allocated_rate": unit, "unmet_rate": unit, "oversupply_rate": unit},
                metrics={"well_count": len(rows), "available_well_count": 0},
                assumptions=["Unavailable wells are excluded from the allocation"],
                warnings=["No available well can satisfy the requested rate"],
                applicability=["Early-stage bounded allocation screening"],
            )
        return _StorageInventoryAdapter._output(
            {
                requested_key: 0.0,
                "requested_rate": 0.0,
                "target_rate": 0.0,
                "allocated_rate": 0.0,
                "unmet_rate": 0.0,
                "oversupply_rate": 0.0,
                "feasible": True,
                "wells": [
                    {**row, "allocated_rate": 0.0, "constraint_status": "unavailable" if not row["available"] else "within_bounds"}
                    for row in rows
                ],
                "method": "bounded_weighted_water_filling",
                "review_status": "calculated_recommendation_pending_review",
            },
            units={"target_rate": unit, "requested_rate": unit, requested_key: unit, "allocated_rate": unit, "unmet_rate": unit, "oversupply_rate": unit},
            metrics={"well_count": len(rows), "available_well_count": 0},
            assumptions=["Unavailable wells are excluded from the allocation"],
            applicability=["Early-stage bounded allocation screening"],
        )

    min_total = sum(row["minimum_rate"] for row in active)
    max_total = sum(row["maximum_rate"] for row in active)
    if require_feasible and not min_total <= target <= max_total:
        raise DomainError(
            DomainErrorCode.INVALID_INPUT,
            f"{quantity_label} must lie between aggregate minimum and maximum rates",
        )
    allocations = {row["name"]: row["minimum_rate"] for row in active}
    residual = max(0.0, target - min_total)
    # Iterative weighted filling avoids assigning more than a well's headroom.
    remaining = list(active)
    while residual > 1e-12 and remaining:
        weight_total = sum(row["weight"] for row in remaining)
        if weight_total <= 0.0:
            break
        distributed = 0.0
        next_remaining: list[dict[str, Any]] = []
        for row in remaining:
            headroom = row["maximum_rate"] - allocations[row["name"]]
            share = residual * row["weight"] / weight_total
            increment = min(headroom, share)
            allocations[row["name"]] += increment
            distributed += increment
            if headroom - increment > 1e-12:
                next_remaining.append(row)
        if distributed <= 1e-12:
            break
        residual -= distributed
        remaining = next_remaining
    allocated = sum(allocations.values())
    unmet = max(0.0, target - allocated)
    oversupply = max(0.0, min_total - target)
    feasible = unmet <= 1e-9 and oversupply <= 1e-9
    warnings: list[str] = []
    if unmet > 1e-9:
        warnings.append("Requested rate exceeds available aggregate deliverability")
    if oversupply > 1e-9:
        warnings.append("Requested rate is below aggregate minimum operating rates")
    output_rows: list[dict[str, Any]] = []
    for row in rows:
        allocated_rate = allocations.get(row["name"], 0.0)
        if not row["available"]:
            status = "unavailable"
        elif allocated_rate <= row["minimum_rate"] + 1e-9:
            status = "at_minimum"
        elif allocated_rate >= row["maximum_rate"] - 1e-9:
            status = "at_maximum"
        else:
            status = "within_bounds"
        output_rows.append(
            {
                **row,
                "allocated_rate": allocated_rate,
                "headroom": max(0.0, row["maximum_rate"] - allocated_rate),
                "utilization": allocated_rate / row["maximum_rate"] if row["maximum_rate"] else 0.0,
                "constraint_status": status,
            }
        )
    return _StorageInventoryAdapter._output(
        {
            requested_key: target,
            "requested_rate": target,
            "target_rate": target,
            "allocated_rate": allocated,
            "unmet_rate": unmet,
            "oversupply_rate": oversupply,
            "aggregate_minimum_rate": min_total,
            "aggregate_maximum_rate": max_total,
            "feasible": feasible,
            "wells": output_rows,
            "method": "bounded_weighted_water_filling",
            "review_status": "calculated_recommendation_pending_review",
        },
        units={
            "target_rate": unit,
            "requested_rate": unit,
            requested_key: unit,
            "allocated_rate": unit,
            "unmet_rate": unit,
            "oversupply_rate": unit,
            "aggregate_minimum_rate": unit,
            "aggregate_maximum_rate": unit,
            "wells.minimum_rate": unit,
            "wells.maximum_rate": unit,
            "wells.allocated_rate": unit,
            "wells.headroom": unit,
            "wells.utilization": "dimensionless",
        },
        metrics={
            "well_count": len(rows),
            "available_well_count": len(active),
            "allocated_rate": allocated,
            "feasibility_percent": 100.0 if feasible else 0.0,
        },
        assumptions=[
            "Each available well is represented by an independent rate bound",
            "Residual rate is distributed proportionally to declared priority weights",
            "No pressure, tubing, network or transient well interaction is inferred",
            "The recommendation remains pending engineering review",
        ],
        warnings=warnings,
        applicability=[
            "Early-stage storage injection/production allocation screening",
            "Use coupled well/network simulation for approved operating schedules",
        ],
    )


class StorageInjectionAllocationAdapter(_StorageInventoryAdapter):
    operation = "storage.injection_allocation.optimize"

    def compute(self, request: StorageInjectionAllocationRequest) -> ComputationOutput:
        return calculate_storage_allocation(
            request.wells,
            request.target_rate,
            rate_unit=request.rate_unit,
            require_feasible=request.require_feasible,
            quantity_label="target_rate",
        )


class StorageProductionAllocationAdapter(_StorageInventoryAdapter):
    operation = "storage.production_allocation.optimize"

    def compute(self, request: StorageProductionAllocationRequest) -> ComputationOutput:
        return calculate_storage_allocation(
            request.wells,
            request.demand_rate,
            rate_unit=request.rate_unit,
            require_feasible=request.require_feasible,
            quantity_label="demand_rate",
        )


def _scenario_constraint_passes(value: float, constraint: StorageScenarioConstraint) -> bool:
    if constraint.operator == "<=":
        return value <= constraint.limit + 1e-12
    if constraint.operator == ">=":
        return value >= constraint.limit - 1e-12
    return abs(value - constraint.limit) <= max(1e-9, abs(constraint.limit) * 1e-9)


class StorageScenarioOptimizationAdapter(_StorageInventoryAdapter):
    """Rank supplied scenario metrics with constraints and Pareto dominance."""

    operation = "storage.scenario.optimize"

    def compute(self, request: StorageScenarioOptimizationRequest) -> ComputationOutput:
        if not request.scenarios:
            raise DomainError(DomainErrorCode.INVALID_INPUT, "scenarios must not be empty")
        if not request.objectives:
            raise DomainError(DomainErrorCode.INVALID_INPUT, "objectives must not be empty")
        metric_unit = str(request.metric_unit or "")
        names = [_required_text(item.name, "scenario.name") for item in request.scenarios]
        if len(names) != len({name.casefold() for name in names}):
            raise DomainError(DomainErrorCode.INVALID_INPUT, "scenario names must be unique")
        objective_keys = [_required_text(item.key, "objective.key") for item in request.objectives]
        if len(objective_keys) != len({key.casefold() for key in objective_keys}):
            raise DomainError(DomainErrorCode.INVALID_INPUT, "objective keys must be unique")
        objective_map: dict[str, dict[str, Any]] = {}
        for objective in request.objectives:
            if objective.direction not in {"maximize", "minimize"}:
                raise DomainError(DomainErrorCode.INVALID_INPUT, "objective direction must be maximize or minimize")
            objective_map[objective.key] = {
                "direction": objective.direction,
                "weight": _positive(objective.weight, f"{objective.key}.weight"),
            }
        constraint_keys = [_required_text(item.key, "constraint.key") for item in request.constraints]
        if len(constraint_keys) != len({key.casefold() for key in constraint_keys}):
            raise DomainError(DomainErrorCode.INVALID_INPUT, "constraint keys must be unique")
        for constraint in request.constraints:
            _required_text(constraint.key, "constraint.key")
            if constraint.operator not in {"<=", ">=", "=="}:
                raise DomainError(DomainErrorCode.INVALID_INPUT, "unsupported constraint operator")
            if not math.isfinite(float(constraint.limit)):
                raise DomainError(DomainErrorCode.INVALID_INPUT, "constraint limit must be finite")
        rows: list[dict[str, Any]] = []
        for scenario in request.scenarios:
            if not isinstance(scenario.metrics, dict):
                raise DomainError(DomainErrorCode.INVALID_INPUT, f"{scenario.name}: metrics must be an object")
            metrics: dict[str, float] = {}
            for key, value in scenario.metrics.items():
                if not isinstance(key, str) or not key.strip():
                    raise DomainError(DomainErrorCode.INVALID_INPUT, "metric keys must be non-empty strings")
                number = float(value)
                if not math.isfinite(number):
                    raise DomainError(DomainErrorCode.INVALID_INPUT, f"{scenario.name}.{key} must be finite")
                metrics[key] = number
            missing = [key for key in objective_map if key not in metrics]
            missing.extend(item.key for item in request.constraints if item.key not in metrics)
            if missing:
                raise DomainError(DomainErrorCode.INVALID_INPUT, f"{scenario.name}: missing metric(s): {', '.join(dict.fromkeys(missing))}")
            constraint_results = {
                item.key: _scenario_constraint_passes(metrics[item.key], item)
                for item in request.constraints
            }
            rows.append(
                {
                    "name": scenario.name,
                    "metrics": metrics,
                    "metadata": dict(scenario.metadata or {}),
                    "constraints": constraint_results,
                    "feasible": all(constraint_results.values()),
                }
            )
        feasible_rows = [row for row in rows if row["feasible"]]
        ranges: dict[str, dict[str, float]] = {}
        for key in objective_map:
            values = [row["metrics"][key] for row in feasible_rows]
            if not values:
                values = [row["metrics"][key] for row in rows]
            ranges[key] = {"minimum": min(values), "maximum": max(values)}
        for row in rows:
            scores: dict[str, float] = {}
            for key, definition in objective_map.items():
                low = ranges[key]["minimum"]
                high = ranges[key]["maximum"]
                value = row["metrics"][key]
                if abs(high - low) <= 1e-15:
                    score = 1.0
                elif definition["direction"] == "maximize":
                    score = (value - low) / (high - low)
                else:
                    score = (high - value) / (high - low)
                scores[key] = min(1.0, max(0.0, score))
            weight_total = sum(item["weight"] for item in objective_map.values())
            row["objective_scores"] = scores
            row["score"] = sum(scores[key] * definition["weight"] for key, definition in objective_map.items()) / weight_total
        def dominates(left: dict[str, Any], right: dict[str, Any]) -> bool:
            if not left["feasible"] or not right["feasible"]:
                return left["feasible"] and not right["feasible"]
            no_worse = True
            strictly_better = False
            for key, definition in objective_map.items():
                lv = left["metrics"][key]
                rv = right["metrics"][key]
                if definition["direction"] == "maximize":
                    if lv < rv - 1e-12:
                        no_worse = False
                    if lv > rv + 1e-12:
                        strictly_better = True
                else:
                    if lv > rv + 1e-12:
                        no_worse = False
                    if lv < rv - 1e-12:
                        strictly_better = True
            return no_worse and strictly_better
        pareto = [row["name"] for row in rows if row["feasible"] and not any(dominates(other, row) for other in rows)]
        ranked = sorted(rows, key=lambda row: (not row["feasible"], -row["score"], row["name"].casefold()))
        for index, row in enumerate(ranked, start=1):
            row["rank"] = index
            row["pareto_optimal"] = row["name"] in pareto
        warnings: list[str] = []
        if not feasible_rows:
            warnings.append("No scenario satisfies all declared constraints")
        if len(feasible_rows) < 3:
            warnings.append("Fewer than three feasible scenarios; ranking and Pareto coverage are limited")
        return self._output(
            {
                "scenarios": ranked,
                "pareto_front": pareto,
                "recommended_scenario": ranked[0]["name"] if feasible_rows else None,
                "objective_ranges": ranges,
                "objectives": [
                    {"key": item.key, "direction": item.direction, "weight": item.weight}
                    for item in request.objectives
                ],
                "constraints": [
                    {"key": item.key, "operator": item.operator, "limit": item.limit}
                    for item in request.constraints
                ],
                "method": "constraint_screening_weighted_score_pareto",
                "review_status": "calculated_recommendation_pending_review",
            },
            units={"metric": metric_unit or "declared per metric", "score": "dimensionless"},
            metrics={
                "scenario_count": len(rows),
                "feasible_scenario_count": len(feasible_rows),
                "pareto_count": len(pareto),
            },
            assumptions=[
                "Objective metrics are commensurated only through min-max normalization across supplied scenarios",
                "Constraint and objective values are treated as scalar snapshot metrics",
                "The recommendation is a screening result and requires engineering review",
            ],
            warnings=warnings,
            applicability=[
                "Transparent comparison of candidate storage operating scenarios",
                "Use coupled simulation and uncertainty analysis before approving a plan",
            ],
        )


__all__ = [
    "EffectiveInventoryAdapter",
    "InventoryAccountingAdapter",
    "StorageInventoryEvaluationAdapter",
    "StorageCapacityEvaluationAdapter",
    "StorageInjectionAllocationAdapter",
    "StorageProductionAllocationAdapter",
    "StorageScenarioOptimizationAdapter",
    "calculate_capacity_layer",
    "calculate_effective_inventory",
    "calculate_layer_effective_inventory",
    "calculate_storage_allocation",
]
