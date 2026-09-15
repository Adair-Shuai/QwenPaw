# -*- coding: utf-8 -*-
"""Agent-facing tools for deterministic storage-inventory evaluation."""

import json
from typing import Annotated, Any, Literal

from pydantic import Field
from typing_extensions import NotRequired, Required, TypedDict

from ..common.errors import DomainError, DomainErrorCode, wrap_unknown_error
from ..common.tool_chunk import emit_tool_chunk
from ..computation.service import ComputationService
from .adapters import (
    EffectiveInventoryAdapter,
    InventoryAccountingAdapter,
    StorageCapacityEvaluationAdapter,
    StorageInjectionAllocationAdapter,
    StorageProductionAllocationAdapter,
    StorageScenarioOptimizationAdapter,
    StorageInventoryEvaluationAdapter,
)
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

_service = ComputationService()

CycleId = Annotated[str, Field(description="Evaluation-cycle identifier")]
InjectionStateId = Annotated[
    str,
    Field(description="Injection-end equilibrium-state identifier"),
]
EvaluationStateId = Annotated[
    str,
    Field(description="Later production/evaluation equilibrium-state identifier"),
]
GasVolumeUnit = Annotated[
    str,
    Field(
        description="Common standard-gas volume unit for every inventory and gas-volume input"
    ),
]
PressureUnit = Annotated[
    str,
    Field(description="Pressure unit shared by all layer pressure inputs"),
]
PressureBasis = Literal["absolute", "apparent_formation", "report_defined"]
GasRateUnit = Annotated[
    str,
    Field(
        description="Standard-gas daily-rate unit shared by actual and design peak rate"
    ),
]


class StorageCapacityLayerInput(TypedDict):
    """Pressure-envelope inputs for one storage layer."""

    name: Annotated[str, Field(description="Unique layer or reservoir-unit name")]
    pore_volume: Annotated[float, Field(description="Connected pore volume")]
    maximum_pressure: Annotated[float, Field(description="Maximum operating pressure")]
    maximum_z: Annotated[float, Field(description="Z factor at maximum pressure")]
    minimum_pressure: Annotated[float, Field(description="Minimum operating pressure")]
    minimum_z: Annotated[float, Field(description="Z factor at minimum pressure")]
    temperature: Annotated[float, Field(description="Representative reservoir temperature")]


class StorageAllocationWellInput(TypedDict):
    """Well bounds used by injection and production allocation tools."""

    name: Required[Annotated[str, Field(description="Unique well or well-group name")]]
    maximum_rate: Required[Annotated[float, Field(description="Maximum allowable standard-gas rate")]]
    minimum_rate: NotRequired[Annotated[float, Field(description="Minimum operating rate; defaults to zero")]]
    weight: NotRequired[Annotated[float, Field(description="Priority weight for residual allocation; defaults to one")]]
    available: NotRequired[Annotated[bool, Field(description="Whether the well is available in this scenario")]]


class StorageScenarioInput(TypedDict):
    """Candidate scenario metrics for transparent ranking and Pareto screening."""

    name: Required[Annotated[str, Field(description="Unique scenario name")]]
    metrics: Required[Annotated[dict[str, float], Field(description="Scalar metric values keyed by objective/constraint name")]]
    metadata: NotRequired[Annotated[dict[str, str], Field(description="Optional scenario metadata")]]


class StorageScenarioObjectiveInput(TypedDict):
    key: Required[Annotated[str, Field(description="Metric key to optimize")]]
    direction: NotRequired[Literal["maximize", "minimize"]]
    weight: NotRequired[Annotated[float, Field(description="Positive objective weight")]]


class StorageScenarioConstraintInput(TypedDict):
    key: Required[Annotated[str, Field(description="Metric key to constrain")]]
    operator: Required[Literal["<=", ">=", "=="]]
    limit: Required[Annotated[float, Field(description="Constraint limit")]]


class EffectiveInventoryLayerInput(TypedDict):
    """Public schema for one layer in the p/Z effective-inventory tools."""

    name: Annotated[str, Field(description="Unique layer or reservoir-unit name")]
    produced_gas: Annotated[
        float, Field(description="Gas produced from injection end to evaluation state")
    ]
    injection_end_pressure: Annotated[
        float,
        Field(
            description=(
                "Average equilibrium formation pressure at injection end; interpret "
                "according to the explicit pressure_basis (for example, the report's "
                "视地层压力); no implicit conversion is performed"
            )
        ),
    ]
    injection_end_z: Annotated[
        float, Field(description="Z factor at injection-end pressure and temperature")
    ]
    evaluation_pressure: Annotated[
        float,
        Field(
            description=(
                "Average equilibrium formation pressure at evaluation state; interpret "
                "according to the explicit pressure_basis (for example, the report's "
                "视地层压力); no implicit conversion is performed"
            )
        ),
    ]
    evaluation_z: Annotated[
        float, Field(description="Z factor at evaluation pressure and temperature")
    ]


def _chunk(payload: dict[str, Any], *, error: bool = False) -> Any:
    return emit_tool_chunk(payload, error=error)


def _error(exc: Exception) -> Any:
    if isinstance(exc, DomainError):
        domain_error = exc
    elif isinstance(exc, (TypeError, ValueError, KeyError)):
        domain_error = DomainError(
            DomainErrorCode.INVALID_INPUT, f"Invalid storage inventory input: {exc}"
        )
    else:
        domain_error = wrap_unknown_error(exc)
    return _chunk(domain_error.to_dict(), error=True)


def _layers(
    values: list[EffectiveInventoryLayerInput],
) -> tuple[EffectiveInventoryLayerRequest, ...]:
    return tuple(EffectiveInventoryLayerRequest(**value) for value in values)


def _effective_request(
    layers: list[EffectiveInventoryLayerInput],
    cycle_id: str,
    injection_end_state_id: str,
    evaluation_state_id: str,
    gas_volume_unit: str,
    pressure_unit: str,
    pressure_basis: PressureBasis,
) -> EffectiveInventoryRequest:
    return EffectiveInventoryRequest(
        layers=_layers(layers),
        cycle_id=cycle_id,
        injection_end_state_id=injection_end_state_id,
        evaluation_state_id=evaluation_state_id,
        gas_volume_unit=gas_volume_unit,
        pressure_unit=pressure_unit,
        pressure_basis=pressure_basis,
    )


async def ugsci_storage_inventory_accounting(
    initial_inventory: Annotated[
        float,
        Field(description="Book inventory at the accounting-period start"),
    ],
    cumulative_injected: Annotated[
        float,
        Field(description="Cumulative injected gas over the same accounting period"),
    ],
    cumulative_produced: Annotated[
        float,
        Field(description="Cumulative produced gas over the same accounting period"),
    ],
    gas_volume_unit: GasVolumeUnit = "1e8_sm3",
) -> Any:
    """Calculate book inventory from one consistent metering boundary.

    Args:
        initial_inventory: Book inventory at the accounting-period start.
        cumulative_injected: Cumulative injected gas over the same period.
        cumulative_produced: Cumulative produced gas over the same period.
        gas_volume_unit: Common standard-gas volume unit for all inputs.
    """
    try:
        request = InventoryAccountingRequest(
            initial_inventory,
            cumulative_injected,
            cumulative_produced,
            gas_volume_unit,
        )
        result = _service.execute(
            "storage.inventory.accounting",
            InventoryAccountingAdapter(),
            request,
            method="injection_production_accounting",
        )
        return _chunk(result.to_dict())
    except Exception as exc:  # noqa: BLE001
        return _error(exc)


async def ugsci_storage_effective_inventory(
    layers: list[EffectiveInventoryLayerInput],
    cycle_id: CycleId,
    injection_end_state_id: InjectionStateId,
    evaluation_state_id: EvaluationStateId,
    gas_volume_unit: GasVolumeUnit = "1e8_sm3",
    pressure_unit: PressureUnit = "MPa",
    pressure_basis: Annotated[
        PressureBasis,
        Field(
            description="Explicit pressure basis shared by both states; use apparent_formation for 视地层压力; do not mix or silently convert"
        ),
    ] = "absolute",
) -> Any:
    """Calculate layer-first effective controlled inventory using the p/Z formula.

    Every layer requires: name, produced_gas, injection_end_pressure,
    injection_end_z, evaluation_pressure and evaluation_z.

    Args:
        layers: Layer-specific production, pressure and Z-factor data.
        cycle_id: Evaluation-cycle identifier.
        injection_end_state_id: Injection-end equilibrium-state identifier.
        evaluation_state_id: Later evaluation equilibrium-state identifier.
        gas_volume_unit: Common standard-gas volume unit for every gas volume.
        pressure_unit: Pressure unit shared by every layer.
        pressure_basis: Explicit basis shared by both states; use apparent_formation for 视地层压力.
    """
    try:
        request = _effective_request(
            layers,
            cycle_id,
            injection_end_state_id,
            evaluation_state_id,
            gas_volume_unit,
            pressure_unit,
            pressure_basis,
        )
        result = _service.execute(
            "storage.inventory.effective_controlled",
            EffectiveInventoryAdapter(),
            request,
            method="layered_p_over_z_withdrawal",
        )
        return _chunk(result.to_dict())
    except Exception as exc:  # noqa: BLE001
        return _error(exc)


async def ugsci_storage_inventory_evaluate(
    layers: list[EffectiveInventoryLayerInput],
    cycle_id: CycleId,
    injection_end_state_id: InjectionStateId,
    evaluation_state_id: EvaluationStateId,
    design_capacity: Annotated[
        float,
        Field(description="Approved design total capacity, in gas_volume_unit"),
    ],
    book_inventory: Annotated[
        float | None,
        Field(
            description="Known book inventory; omit when providing all three accounting inputs"
        ),
    ] = None,
    initial_inventory: Annotated[
        float | None,
        Field(
            description="Accounting-period initial inventory; provide with both cumulative totals"
        ),
    ] = None,
    cumulative_injected: Annotated[
        float | None,
        Field(
            description="Period cumulative injected gas; provide with the other accounting inputs"
        ),
    ] = None,
    cumulative_produced: Annotated[
        float | None,
        Field(
            description="Period cumulative produced gas; provide with the other accounting inputs"
        ),
    ] = None,
    working_gas: Annotated[
        float | None,
        Field(
            description="Actual cyclic working gas; provide together with design_working_gas"
        ),
    ] = None,
    design_working_gas: Annotated[
        float | None,
        Field(
            description="Design cyclic working gas; provide together with working_gas"
        ),
    ] = None,
    peak_daily_rate: Annotated[
        float | None,
        Field(
            description="Actual standard-gas peak daily rate; provide with design peak rate"
        ),
    ] = None,
    design_peak_daily_rate: Annotated[
        float | None,
        Field(
            description="Design standard-gas peak daily rate; provide with actual peak rate"
        ),
    ] = None,
    gas_volume_unit: GasVolumeUnit = "1e8_sm3",
    pressure_unit: PressureUnit = "MPa",
    pressure_basis: Annotated[
        PressureBasis,
        Field(
            description="Explicit pressure basis shared by both states; use apparent_formation for 视地层压力; do not mix or silently convert"
        ),
    ] = "absolute",
    daily_rate_unit: GasRateUnit = "1e4_sm3/d",
) -> Any:
    """Evaluate separated book, effective, working-gas and peak-capacity indicators.

    Every layer requires: name, produced_gas, injection_end_pressure,
    injection_end_z, evaluation_pressure and evaluation_z.  This composite
    operation already returns per-layer values, so callers do not need a
    separate effective-inventory call before it.  Provide either a known book
    inventory or all three injection/production accounting inputs.  The
    agent-facing calculation always returns a pending-review result; it cannot
    declare a result reviewed or approved.

    Args:
        layers: Layer-specific production, pressure and Z-factor data.
        cycle_id: Evaluation-cycle identifier.
        injection_end_state_id: Injection-end equilibrium-state identifier.
        evaluation_state_id: Later evaluation equilibrium-state identifier.
        design_capacity: Approved design total capacity in gas_volume_unit.
        book_inventory: Known book inventory; omit when using accounting inputs.
        initial_inventory: Initial inventory; provide with both cumulative totals.
        cumulative_injected: Cumulative injected gas for the accounting period.
        cumulative_produced: Cumulative produced gas for the accounting period.
        working_gas: Actual cyclic working gas; pair with design_working_gas.
        design_working_gas: Design cyclic working gas; pair with working_gas.
        peak_daily_rate: Actual standard-gas peak rate; pair with design peak rate.
        design_peak_daily_rate: Design standard-gas peak daily rate.
        gas_volume_unit: Common standard-gas volume unit for all gas volumes.
        pressure_unit: Pressure unit shared by every layer.
        pressure_basis: Explicit basis shared by both states; use apparent_formation for 视地层压力.
        daily_rate_unit: Standard-gas daily-rate unit for both peak rates.
    """
    try:
        effective = _effective_request(
            layers,
            cycle_id,
            injection_end_state_id,
            evaluation_state_id,
            gas_volume_unit,
            pressure_unit,
            pressure_basis,
        )
        request = StorageInventoryEvaluationRequest(
            effective_inventory=effective,
            design_capacity=design_capacity,
            book_inventory=book_inventory,
            initial_inventory=initial_inventory,
            cumulative_injected=cumulative_injected,
            cumulative_produced=cumulative_produced,
            working_gas=working_gas,
            design_working_gas=design_working_gas,
            peak_daily_rate=peak_daily_rate,
            design_peak_daily_rate=design_peak_daily_rate,
            daily_rate_unit=daily_rate_unit,
        )
        result = _service.execute(
            "storage.inventory.evaluate",
            StorageInventoryEvaluationAdapter(),
            request,
            method="separated_inventory_indicator_workflow",
        )
        return _chunk(result.to_dict())
    except Exception as exc:  # noqa: BLE001
        return _error(exc)


async def ugsci_storage_capacity_evaluate(
    layers: list[StorageCapacityLayerInput],
    pore_volume_unit: Annotated[str, Field(description="Pore-volume unit, for example m3")]= "m3",
    pressure_unit: PressureUnit = "MPa",
    temperature_unit: Annotated[str, Field(description="Temperature unit, for example K")]= "K",
    standard_pressure: Annotated[
        float,
        Field(description="Standard-state pressure in pressure_unit"),
    ] = 0.101325,
    standard_temperature: Annotated[
        float,
        Field(description="Standard-state temperature in temperature_unit"),
    ] = 288.15,
    gas_volume_unit: GasVolumeUnit = "1e8_sm3",
) -> Any:
    """Screen total, cushion and working gas from layer pressure boundaries.

    This uses explicit pore volume, pressure/Z and temperature states.  It is
    a transparent pressure-envelope screening estimate; it does not replace
    compositional/PVT simulation, aquifer/geomechanical analysis or
    deliverability constraints.
    """
    try:
        if not isinstance(layers, list):
            raise ValueError("layers must be an array")
        requests = tuple(StorageCapacityLayerRequest(**dict(layer)) for layer in layers)
        request = StorageCapacityEvaluationRequest(
            layers=requests,
            pore_volume_unit=pore_volume_unit,
            pressure_unit=pressure_unit,
            temperature_unit=temperature_unit,
            standard_pressure=standard_pressure,
            standard_temperature=standard_temperature,
            gas_volume_unit=gas_volume_unit,
        )
        result = _service.execute(
            "storage.capacity.evaluate",
            StorageCapacityEvaluationAdapter(),
            request,
            method="pressure_envelope_ideal_gas_scaling",
        )
        return _chunk(result.to_dict())
    except Exception as exc:  # noqa: BLE001
        return _error(exc)


def _allocation_wells(values: list[StorageAllocationWellInput]) -> tuple[StorageAllocationWellRequest, ...]:
    if not isinstance(values, list):
        raise ValueError("wells must be an array")
    return tuple(
        StorageAllocationWellRequest(
            name=str(item["name"]),
            maximum_rate=float(item["maximum_rate"]),
            minimum_rate=float(item.get("minimum_rate", 0.0)),
            weight=float(item.get("weight", 1.0)),
            available=item.get("available", True),
        )
        for item in values
    )


async def ugsci_storage_injection_allocation_optimize(
    wells: list[StorageAllocationWellInput],
    target_rate: Annotated[float, Field(description="Requested total injection rate")],
    rate_unit: GasRateUnit = "1e4_sm3/d",
    require_feasible: Annotated[bool, Field(description="Fail when target is outside aggregate bounds")]=False,
) -> Any:
    """Allocate storage injection across available wells using bounded weighted filling.

    This is a screening recommendation that exposes aggregate shortfall or
    oversupply. It does not model pressure interference, network hydraulics or
    transient well behavior.
    """
    try:
        request = StorageInjectionAllocationRequest(
            wells=_allocation_wells(wells),
            target_rate=target_rate,
            rate_unit=rate_unit,
            require_feasible=require_feasible,
        )
        result = _service.execute(
            "storage-injection-allocation",
            StorageInjectionAllocationAdapter(),
            request,
            method="bounded_weighted_water_filling",
        )
        return _chunk(result.to_dict())
    except Exception as exc:  # noqa: BLE001
        return _error(exc)


async def ugsci_storage_production_allocation_optimize(
    wells: list[StorageAllocationWellInput],
    demand_rate: Annotated[float, Field(description="Requested total production/deliverability rate")],
    rate_unit: GasRateUnit = "1e4_sm3/d",
    require_feasible: Annotated[bool, Field(description="Fail when demand is outside aggregate bounds")]=False,
) -> Any:
    """Allocate storage production demand across available wells."""
    try:
        request = StorageProductionAllocationRequest(
            wells=_allocation_wells(wells),
            demand_rate=demand_rate,
            rate_unit=rate_unit,
            require_feasible=require_feasible,
        )
        result = _service.execute(
            "storage-production-allocation",
            StorageProductionAllocationAdapter(),
            request,
            method="bounded_weighted_water_filling",
        )
        return _chunk(result.to_dict())
    except Exception as exc:  # noqa: BLE001
        return _error(exc)


async def ugsci_storage_scenario_optimize(
    scenarios: list[StorageScenarioInput],
    objectives: list[StorageScenarioObjectiveInput],
    constraints: list[StorageScenarioConstraintInput] | None = None,
    metric_unit: Annotated[str, Field(description="Optional common metric unit label")]= "",
) -> Any:
    """Rank storage scenarios with constraints, weighted scores and a Pareto front."""
    try:
        if not isinstance(scenarios, list) or not isinstance(objectives, list):
            raise ValueError("scenarios and objectives must be arrays")
        scenario_requests = tuple(
            StorageScenarioRequest(
                name=str(item["name"]),
                metrics={str(key): float(value) for key, value in dict(item["metrics"]).items()},
                metadata={str(key): str(value) for key, value in dict(item.get("metadata") or {}).items()},
            )
            for item in scenarios
        )
        objective_requests = tuple(
            StorageScenarioObjective(
                key=str(item["key"]),
                direction=item.get("direction", "maximize"),
                weight=float(item.get("weight", 1.0)),
            )
            for item in objectives
        )
        constraint_requests = tuple(
            StorageScenarioConstraint(
                key=str(item["key"]),
                operator=item["operator"],
                limit=float(item["limit"]),
            )
            for item in (constraints or [])
        )
        request = StorageScenarioOptimizationRequest(
            scenarios=scenario_requests,
            objectives=objective_requests,
            constraints=constraint_requests,
            metric_unit=metric_unit,
        )
        result = _service.execute(
            "storage-scenario-optimization",
            StorageScenarioOptimizationAdapter(),
            request,
            method="constraint_screening_weighted_score_pareto",
        )
        return _chunk(result.to_dict())
    except Exception as exc:  # noqa: BLE001
        return _error(exc)


__all__ = [
    "EffectiveInventoryLayerInput",
    "StorageAllocationWellInput",
    "StorageScenarioInput",
    "StorageScenarioObjectiveInput",
    "StorageScenarioConstraintInput",
    "ugsci_storage_effective_inventory",
    "ugsci_storage_inventory_accounting",
    "ugsci_storage_inventory_evaluate",
    "ugsci_storage_capacity_evaluate",
    "ugsci_storage_injection_allocation_optimize",
    "ugsci_storage_production_allocation_optimize",
    "ugsci_storage_scenario_optimize",
]
