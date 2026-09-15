# -*- coding: utf-8 -*-
"""Typed contracts for deterministic storage-inventory calculations."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


@dataclass(frozen=True)
class InventoryAccountingRequest:
    initial_inventory: float
    cumulative_injected: float
    cumulative_produced: float
    gas_volume_unit: str = "1e8_sm3"


@dataclass(frozen=True)
class EffectiveInventoryLayerRequest:
    name: str
    produced_gas: float
    injection_end_pressure: float
    injection_end_z: float
    evaluation_pressure: float
    evaluation_z: float


@dataclass(frozen=True)
class EffectiveInventoryRequest:
    layers: tuple[EffectiveInventoryLayerRequest, ...]
    cycle_id: str
    injection_end_state_id: str
    evaluation_state_id: str
    gas_volume_unit: str = "1e8_sm3"
    pressure_unit: str = "MPa"
    pressure_basis: Literal["absolute", "apparent_formation", "report_defined"] = (
        "absolute"
    )
    denominator_relative_tolerance: float = 1e-9
    maximum_inverse_withdrawal_fraction: float = 100.0


@dataclass(frozen=True)
class StorageInventoryEvaluationRequest:
    effective_inventory: EffectiveInventoryRequest
    design_capacity: float
    book_inventory: float | None = None
    initial_inventory: float | None = None
    cumulative_injected: float | None = None
    cumulative_produced: float | None = None
    working_gas: float | None = None
    design_working_gas: float | None = None
    peak_daily_rate: float | None = None
    design_peak_daily_rate: float | None = None
    daily_rate_unit: str = "1e4_sm3/d"


@dataclass(frozen=True)
class StorageCapacityLayerRequest:
    """Pressure-envelope inputs for one storage layer.

    ``pore_volume`` is the connected pore volume represented by the selected
    model snapshot.  The two pressure/Z states are converted to standard gas
    volume using the ideal gas scaling ``Vp * (P/Z) * Ts/(T*Ps)``.  This is a
    screening calculation; aquifer support, water influx, geomechanics and
    deliverability must be supplied by a domain-specific provider.
    """

    name: str
    pore_volume: float
    maximum_pressure: float
    maximum_z: float
    minimum_pressure: float
    minimum_z: float
    temperature: float


@dataclass(frozen=True)
class StorageCapacityEvaluationRequest:
    """Evaluate total, cushion and working gas from pressure boundaries."""

    layers: tuple[StorageCapacityLayerRequest, ...]
    pore_volume_unit: str = "m3"
    pressure_unit: str = "MPa"
    temperature_unit: str = "K"
    standard_pressure: float = 0.101325
    standard_temperature: float = 288.15
    gas_volume_unit: str = "1e8_sm3"


@dataclass(frozen=True)
class StorageAllocationWellRequest:
    """Bounds and priority for one well in a screening allocation."""

    name: str
    maximum_rate: float
    minimum_rate: float = 0.0
    weight: float = 1.0
    available: bool = True


@dataclass(frozen=True)
class StorageInjectionAllocationRequest:
    """Allocate a target injection rate within well-level operating bounds."""

    wells: tuple[StorageAllocationWellRequest, ...]
    target_rate: float
    rate_unit: str = "1e4_sm3/d"
    require_feasible: bool = False


@dataclass(frozen=True)
class StorageProductionAllocationRequest:
    """Allocate a production demand within well-level deliverability bounds."""

    wells: tuple[StorageAllocationWellRequest, ...]
    demand_rate: float
    rate_unit: str = "1e4_sm3/d"
    require_feasible: bool = False


@dataclass(frozen=True)
class StorageScenarioRequest:
    """One candidate scenario and its scalar engineering metrics."""

    name: str
    metrics: dict[str, float]
    metadata: dict[str, str] | None = None


@dataclass(frozen=True)
class StorageScenarioObjective:
    """Objective definition used by the transparent scenario ranker."""

    key: str
    direction: Literal["maximize", "minimize"] = "maximize"
    weight: float = 1.0


@dataclass(frozen=True)
class StorageScenarioConstraint:
    """A scalar metric constraint for scenario screening."""

    key: str
    operator: Literal["<=", ">=", "=="]
    limit: float


@dataclass(frozen=True)
class StorageScenarioOptimizationRequest:
    """Rank feasible scenarios and expose the non-dominated Pareto set."""

    scenarios: tuple[StorageScenarioRequest, ...]
    objectives: tuple[StorageScenarioObjective, ...]
    constraints: tuple[StorageScenarioConstraint, ...] = ()
    metric_unit: str = ""
