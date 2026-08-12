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
