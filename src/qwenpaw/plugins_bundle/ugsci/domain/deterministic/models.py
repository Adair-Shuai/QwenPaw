# -*- coding: utf-8 -*-
"""Typed requests for the deterministic petroleum calculation kernel."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class UnitConversionRequest:
    value: float
    from_unit: str
    to_unit: str


@dataclass(frozen=True)
class VolumetricOilInPlaceRequest:
    area: float
    net_pay: float
    porosity: float
    water_saturation: float
    oil_fvf: float
    area_unit: str = "acre"
    length_unit: str = "ft"
    output_unit: str = "stb"


@dataclass(frozen=True)
class OilMaterialBalanceRequest:
    produced_oil: float
    initial_oil_fvf: float
    current_oil_fvf: float
    initial_pressure: float
    current_pressure: float
    produced_gor: float = 0.0
    initial_solution_gor: float = 0.0
    current_solution_gor: float = 0.0
    gas_fvf: float = 0.0
    produced_water: float = 0.0
    water_fvf: float = 1.0
    water_influx: float = 0.0
    initial_water_saturation: float = 0.2
    water_compressibility: float = 0.0
    rock_compressibility: float = 0.0
    volume_unit: str = "stb"
    pressure_unit: str = "psi"
    compressibility_unit: str = "1/psi"


@dataclass(frozen=True)
class GasMaterialBalanceRequest:
    produced_gas: float
    initial_pressure: float
    initial_z_factor: float
    current_pressure: float
    current_z_factor: float
    gas_volume_unit: str = "scf"
    pressure_unit: str = "psi"


@dataclass(frozen=True)
class StandingBlackOilRequest:
    pressure: float
    temperature: float
    oil_api: float
    gas_specific_gravity: float
    solution_gor_at_bubble_point: float
    pressure_unit: str = "psi"
    temperature_unit: str = "F"
    gor_unit: str = "scf/stb"


@dataclass(frozen=True)
class VogelIPRRequest:
    reservoir_pressure: float
    test_flowing_pressure: float
    test_rate: float
    target_flowing_pressures: list[float]
    pressure_unit: str = "psi"
    rate_unit: str = "stb/d"


@dataclass(frozen=True)
class NodalAnalysisRequest:
    reservoir_pressure: float
    test_flowing_pressure: float
    test_rate: float
    wellhead_pressure: float
    hydrostatic_pressure: float
    friction_pressure_at_test_rate: float
    pressure_unit: str = "psi"
    rate_unit: str = "stb/d"
    tolerance: float = 1e-6
    max_iterations: int = 100


@dataclass(frozen=True)
class ConservationCheckRequest:
    initial_inventory: float
    inflows: list[float]
    outflows: list[float]
    final_inventory: float
    tolerance: float = 1e-6
    unit: str = "rb"
