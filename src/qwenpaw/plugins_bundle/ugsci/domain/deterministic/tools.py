# -*- coding: utf-8 -*-
"""Agent-facing tools backed by the deterministic Provider registry."""

from __future__ import annotations

import json
from typing import Any

from ..common.errors import DomainError, DomainErrorCode, wrap_unknown_error
from ..computation.service import ComputationService
from .models import (
    ConservationCheckRequest,
    GasMaterialBalanceRequest,
    NodalAnalysisRequest,
    OilMaterialBalanceRequest,
    StandingBlackOilRequest,
    UnitConversionRequest,
    VolumetricOilInPlaceRequest,
    VogelIPRRequest,
)
from .providers import default_registry

_service = ComputationService()


def _chunk(payload: dict[str, Any], *, error: bool = False) -> Any:
    try:
        from agentscope.message import TextBlock, ToolResultState
        from agentscope.tool import ToolChunk
    except Exception:
        return {"error": error, "payload": payload}
    return ToolChunk(
        is_last=True,
        state=ToolResultState.ERROR if error else ToolResultState.SUCCESS,
        content=[TextBlock(type="text", text=json.dumps(payload, ensure_ascii=False, indent=2))],
    )


def _run(capability_id: str, request: Any, method: str) -> Any:
    try:
        adapter = default_registry.resolve(capability_id)
        return _chunk(_service.execute(capability_id, adapter, request, method=method).to_dict())
    except DomainError as exc:
        return _chunk(exc.to_dict(), error=True)
    except Exception as exc:
        return _chunk(wrap_unknown_error(exc).to_dict(), error=True)


def _invalid(exc: Exception) -> Any:
    return _chunk(DomainError(DomainErrorCode.INVALID_INPUT, f"Invalid deterministic input: {exc}").to_dict(), error=True)


async def ugsci_convert_units(value: float, from_unit: str, to_unit: str) -> Any:
    """Convert a scalar using the explicit UGSci unit system."""
    try:
        request = UnitConversionRequest(float(value), from_unit, to_unit)
    except (TypeError, ValueError) as exc:
        return _invalid(exc)
    return _run("units.convert", request, "unit_conversion")


async def ugsci_volumetric_oil_in_place(
    area: float,
    net_pay: float,
    porosity: float,
    water_saturation: float,
    oil_fvf: float,
    area_unit: str = "acre",
    length_unit: str = "ft",
    output_unit: str = "stb",
) -> Any:
    """Estimate volumetric stock-tank oil initially in place."""
    try:
        request = VolumetricOilInPlaceRequest(area, net_pay, porosity, water_saturation, oil_fvf, area_unit, length_unit, output_unit)
    except (TypeError, ValueError) as exc:
        return _invalid(exc)
    return _run("reservoir.volumetrics.oil_in_place", request, "volumetric_ooip")


async def ugsci_oil_material_balance(
    produced_oil: float,
    initial_oil_fvf: float,
    current_oil_fvf: float,
    initial_pressure: float,
    current_pressure: float,
    produced_gor: float = 0.0,
    initial_solution_gor: float = 0.0,
    current_solution_gor: float = 0.0,
    gas_fvf: float = 0.0,
    produced_water: float = 0.0,
    water_fvf: float = 1.0,
    water_influx: float = 0.0,
    initial_water_saturation: float = 0.2,
    water_compressibility: float = 0.0,
    rock_compressibility: float = 0.0,
    volume_unit: str = "stb",
    pressure_unit: str = "psi",
    compressibility_unit: str = "1/psi",
) -> Any:
    """Estimate oil OOIP using an explicit Havlena–Ode style balance."""
    try:
        request = OilMaterialBalanceRequest(
            produced_oil, initial_oil_fvf, current_oil_fvf, initial_pressure, current_pressure,
            produced_gor, initial_solution_gor, current_solution_gor, gas_fvf,
            produced_water, water_fvf, water_influx, initial_water_saturation,
            water_compressibility, rock_compressibility, volume_unit, pressure_unit, compressibility_unit,
        )
    except (TypeError, ValueError) as exc:
        return _invalid(exc)
    return _run("reservoir.material_balance.oil", request, "havlena_ode_oil")


async def ugsci_gas_material_balance(
    produced_gas: float,
    initial_pressure: float,
    initial_z_factor: float,
    current_pressure: float,
    current_z_factor: float,
    gas_volume_unit: str = "scf",
    pressure_unit: str = "psi",
) -> Any:
    """Estimate OGIP from a volumetric gas p/z balance."""
    try:
        request = GasMaterialBalanceRequest(produced_gas, initial_pressure, initial_z_factor, current_pressure, current_z_factor, gas_volume_unit, pressure_unit)
    except (TypeError, ValueError) as exc:
        return _invalid(exc)
    return _run("reservoir.material_balance.gas_pz", request, "p_over_z")


async def ugsci_black_oil_pvt(
    pressure: float,
    temperature: float,
    oil_api: float,
    gas_specific_gravity: float,
    solution_gor_at_bubble_point: float,
    pressure_unit: str = "psi",
    temperature_unit: str = "F",
    gor_unit: str = "scf/stb",
) -> Any:
    """Run the local Standing black-oil screening correlation."""
    try:
        request = StandingBlackOilRequest(pressure, temperature, oil_api, gas_specific_gravity, solution_gor_at_bubble_point, pressure_unit, temperature_unit, gor_unit)
    except (TypeError, ValueError) as exc:
        return _invalid(exc)
    return _run("fluid.pvt.standing_black_oil", request, "standing_black_oil")


async def ugsci_vogel_ipr(
    reservoir_pressure: float,
    test_flowing_pressure: float,
    test_rate: float,
    target_flowing_pressures: list[float],
    pressure_unit: str = "psi",
    rate_unit: str = "stb/d",
) -> Any:
    """Build a deterministic Vogel inflow performance relationship."""
    try:
        request = VogelIPRRequest(reservoir_pressure, test_flowing_pressure, test_rate, target_flowing_pressures, pressure_unit, rate_unit)
    except (TypeError, ValueError) as exc:
        return _invalid(exc)
    return _run("production.ipr.vogel", request, "vogel_ipr")


async def ugsci_nodal_analysis(
    reservoir_pressure: float,
    test_flowing_pressure: float,
    test_rate: float,
    wellhead_pressure: float,
    hydrostatic_pressure: float,
    friction_pressure_at_test_rate: float,
    pressure_unit: str = "psi",
    rate_unit: str = "stb/d",
    tolerance: float = 1e-6,
    max_iterations: int = 100,
) -> Any:
    """Intersect a Vogel IPR with a transparent quadratic VLP model."""
    try:
        request = NodalAnalysisRequest(reservoir_pressure, test_flowing_pressure, test_rate, wellhead_pressure, hydrostatic_pressure, friction_pressure_at_test_rate, pressure_unit, rate_unit, tolerance, max_iterations)
    except (TypeError, ValueError) as exc:
        return _invalid(exc)
    return _run("production.nodal_analysis", request, "vogel_quadratic_vlp")


async def ugsci_conservation_check(
    initial_inventory: float,
    inflows: list[float],
    outflows: list[float],
    final_inventory: float,
    tolerance: float = 1e-6,
    unit: str = "rb",
) -> Any:
    """Check a scalar conservation/material-balance equation."""
    try:
        request = ConservationCheckRequest(initial_inventory, inflows, outflows, final_inventory, tolerance, unit)
    except (TypeError, ValueError) as exc:
        return _invalid(exc)
    return _run("validation.conservation_check", request, "scalar_conservation")


__all__ = [
    "ugsci_convert_units",
    "ugsci_volumetric_oil_in_place",
    "ugsci_oil_material_balance",
    "ugsci_gas_material_balance",
    "ugsci_black_oil_pvt",
    "ugsci_vogel_ipr",
    "ugsci_nodal_analysis",
    "ugsci_conservation_check",
]
