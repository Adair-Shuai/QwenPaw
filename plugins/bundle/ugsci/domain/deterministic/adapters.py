# -*- coding: utf-8 -*-
"""Pure Python providers for the deterministic petroleum kernel.

The formulas are intentionally small and explicit.  They are not a proxy for
NeqSim compositional thermodynamics; each adapter reports its applicability
and assumptions in the result envelope.
"""

from __future__ import annotations

import math
from typing import Any

from ..common.errors import DomainError, DomainErrorCode
from ..common.serialization import sanitize_json, validate_json_safe
from ..computation.ports import ComputationOutput
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
from .units import convert, normalize_unit, require_unit


def _require_finite_positive(value: float, name: str) -> float:
    value = float(value)
    if not math.isfinite(value) or value <= 0:
        raise DomainError(DomainErrorCode.INVALID_INPUT, f"{name} must be positive and finite")
    return value


def _require_finite_nonnegative(value: float, name: str) -> float:
    value = float(value)
    if not math.isfinite(value) or value < 0:
        raise DomainError(DomainErrorCode.INVALID_INPUT, f"{name} must be non-negative and finite")
    return value


def _require_fraction(value: float, name: str, *, strict_upper: bool = True) -> float:
    value = float(value)
    upper_ok = value < 1.0 if strict_upper else value <= 1.0
    if not math.isfinite(value) or value < 0.0 or not upper_ok:
        bound = "[0, 1)" if strict_upper else "[0, 1]"
        raise DomainError(DomainErrorCode.INVALID_INPUT, f"{name} must be in {bound}")
    return value


class _DeterministicAdapter:
    provider_id = "ugsci-petroleum-core"
    provider_version = "1.1.0"
    engine_version = "1.1.0"
    deterministic = True
    support_dependencies = ("pytoolbox",)

    def _output(
        self,
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
            tolerances={"absolute": 1e-10, "relative": 1e-8},
            applicability=applicability,
        )


class UnitConversionAdapter(_DeterministicAdapter):
    operation = "units.convert"

    def compute(self, request: UnitConversionRequest) -> ComputationOutput:
        source = normalize_unit(request.from_unit)
        target = normalize_unit(request.to_unit)
        result = convert(request.value, source, target)
        return self._output(
            {"value": result, "from_unit": source, "to_unit": target},
            units={"value": target},
            applicability=["Scalar conversions within the supported UGSci unit system"],
        )


class VolumetricOilInPlaceAdapter(_DeterministicAdapter):
    operation = "reservoir.volumetrics.oil_in_place"

    def compute(self, request: VolumetricOilInPlaceRequest) -> ComputationOutput:
        area_m2 = convert(_require_finite_positive(request.area, "area"), request.area_unit, "m2")
        thickness_m = convert(_require_finite_positive(request.net_pay, "net_pay"), request.length_unit, "m")
        porosity = _require_fraction(request.porosity, "porosity")
        water_saturation = _require_fraction(request.water_saturation, "water_saturation")
        bo = _require_finite_positive(request.oil_fvf, "oil_fvf")
        output_unit = require_unit(request.output_unit, "liquid_volume")
        pore_volume_m3 = area_m2 * thickness_m * porosity * (1.0 - water_saturation)
        stock_tank_m3 = pore_volume_m3 / bo
        oil_in_place = convert(stock_tank_m3, "m3", output_unit)
        return self._output(
            {
                "oil_in_place": oil_in_place,
                "pore_volume": convert(pore_volume_m3, "m3", "rb"),
                "hydrocarbon_pore_fraction": porosity * (1.0 - water_saturation),
            },
            units={"oil_in_place": output_unit, "pore_volume": "rb"},
            metrics={"hydrocarbon_pore_fraction": porosity * (1.0 - water_saturation)},
            assumptions=["Volumetric tank-initially-oil calculation", "Single effective net-pay interval", "Uniform porosity and water saturation"],
            applicability=["Static volumetric OOIP estimate", "No fluid influx, cap-rock leakage, or pressure history"],
        )


class OilMaterialBalanceAdapter(_DeterministicAdapter):
    operation = "reservoir.material_balance.oil"

    def compute(self, request: OilMaterialBalanceRequest) -> ComputationOutput:
        np_ = convert(_require_finite_positive(request.produced_oil, "produced_oil"), request.volume_unit, "stb")
        boi = _require_finite_positive(request.initial_oil_fvf, "initial_oil_fvf")
        bo = _require_finite_positive(request.current_oil_fvf, "current_oil_fvf")
        volume_unit = require_unit(request.volume_unit, "liquid_volume")
        pi_input = _require_finite_positive(request.initial_pressure, "initial_pressure")
        p_input = _require_finite_positive(request.current_pressure, "current_pressure")
        pi = convert(pi_input, request.pressure_unit, "psi")
        p = convert(p_input, request.pressure_unit, "psi")
        if p > pi:
            raise DomainError(DomainErrorCode.INVALID_INPUT, "current_pressure must not exceed initial_pressure")
        swi = _require_fraction(request.initial_water_saturation, "initial_water_saturation", strict_upper=False)
        for name, value in (("produced_gor", request.produced_gor), ("initial_solution_gor", request.initial_solution_gor), ("current_solution_gor", request.current_solution_gor)):
            if not math.isfinite(float(value)) or float(value) < 0:
                raise DomainError(DomainErrorCode.INVALID_INPUT, f"{name} must be non-negative and finite")
        produced_water = _require_finite_nonnegative(request.produced_water, "produced_water")
        water_influx = _require_finite_nonnegative(request.water_influx, "water_influx")
        gas_fvf = _require_finite_nonnegative(request.gas_fvf, "gas_fvf")
        water_fvf = _require_finite_positive(request.water_fvf, "water_fvf")
        water_compressibility = _require_finite_nonnegative(request.water_compressibility, "water_compressibility")
        rock_compressibility = _require_finite_nonnegative(request.rock_compressibility, "rock_compressibility")
        compressibility_unit = require_unit(request.compressibility_unit, "compressibility")
        compressibility = convert(water_compressibility + rock_compressibility, compressibility_unit, "1/psi")
        delta_p = pi - p
        underground_withdrawal = np_ * (bo + max(request.produced_gor - request.current_solution_gor, 0.0) * gas_fvf)
        produced_water_stb = convert(produced_water, volume_unit, "stb")
        water_influx_rb = convert(water_influx, volume_unit, "rb")
        underground_withdrawal += produced_water_stb * water_fvf
        oil_expansion = (bo - boi) + (request.initial_solution_gor - request.current_solution_gor) * gas_fvf
        formation_expansion = boi * ((swi * convert(water_compressibility, compressibility_unit, "1/psi") + convert(rock_compressibility, compressibility_unit, "1/psi")) / max(1.0 - swi, 1e-12)) * delta_p
        total_expansion = oil_expansion + formation_expansion
        if total_expansion <= 1e-12:
            raise DomainError(DomainErrorCode.INVALID_INPUT, "Expansion term is non-positive; provide a pressure change and valid PVT data")
        estimated_ooip_stb = (underground_withdrawal - water_influx_rb) / total_expansion
        if estimated_ooip_stb <= 0:
            raise DomainError(DomainErrorCode.INVALID_RESULT, "Material-balance OOIP is non-positive; check water influx and PVT inputs")
        output_ooip = convert(estimated_ooip_stb, "stb", volume_unit)
        output_withdrawal = convert(underground_withdrawal, "rb", volume_unit)
        output_water_influx = convert(water_influx_rb, "rb", volume_unit)
        return self._output(
            {
                "estimated_ooip": output_ooip,
                "underground_withdrawal": output_withdrawal,
                "oil_expansion": oil_expansion,
                "formation_water_rock_expansion": formation_expansion,
                "total_expansion": total_expansion,
                "net_water_support": output_water_influx,
            },
            units={"estimated_ooip": volume_unit, "underground_withdrawal": volume_unit, "oil_expansion": "rb/stb", "formation_water_rock_expansion": "rb/stb", "total_expansion": "rb/stb", "net_water_support": volume_unit},
            metrics={"pressure_drop": pi_input - p_input, "pressure_unit": request.pressure_unit, "water_support_fraction": water_influx_rb / max(underground_withdrawal, 1e-12), "compressibility_sum_1_per_psi": compressibility},
            assumptions=["Havlena–Ode style oil material balance", "No gas-cap expansion term", "Bo, Bg and Rs are supplied by the caller", "Water influx is supplied in reservoir-volume units"],
            applicability=["Black-oil tank material balance", "Single average reservoir pressure", "No compositional effects or spatial pressure gradients"],
        )


class GasMaterialBalanceAdapter(_DeterministicAdapter):
    operation = "reservoir.material_balance.gas_pz"

    def compute(self, request: GasMaterialBalanceRequest) -> ComputationOutput:
        gas_volume_unit = require_unit(request.gas_volume_unit, "gas_volume")
        pressure_unit = require_unit(request.pressure_unit, "pressure")
        gp_scf = convert(_require_finite_positive(request.produced_gas, "produced_gas"), gas_volume_unit, "scf")
        pi = convert(_require_finite_positive(request.initial_pressure, "initial_pressure"), pressure_unit, "psi")
        p = convert(_require_finite_positive(request.current_pressure, "current_pressure"), pressure_unit, "psi")
        zi = _require_finite_positive(request.initial_z_factor, "initial_z_factor")
        z = _require_finite_positive(request.current_z_factor, "current_z_factor")
        if p >= pi:
            raise DomainError(DomainErrorCode.INVALID_INPUT, "current_pressure must be lower than initial_pressure")
        initial_pz = pi / zi
        current_pz = p / z
        denominator = 1.0 - current_pz / initial_pz
        if denominator <= 1e-12:
            raise DomainError(DomainErrorCode.INVALID_INPUT, "p/z depletion term is too small for a stable OGIP estimate")
        ogip_scf = gp_scf / denominator
        ogip = convert(ogip_scf, "scf", gas_volume_unit)
        produced = float(request.produced_gas)
        return self._output(
            {"estimated_ogip": ogip, "remaining_gas": max(ogip - produced, 0.0), "initial_p_over_z": convert(initial_pz, "psi", pressure_unit), "current_p_over_z": convert(current_pz, "psi", pressure_unit), "recovery_factor": produced / ogip},
            units={"estimated_ogip": gas_volume_unit, "remaining_gas": gas_volume_unit, "initial_p_over_z": pressure_unit, "current_p_over_z": pressure_unit},
            metrics={"recovery_factor": produced / ogip},
            assumptions=["Volumetric dry-gas p/z material balance", "No water influx, gas cap, or rock compressibility correction"],
            applicability=["Dry or near-dry gas reservoir", "Single average pressure and z-factor per state"],
        )


class StandingBlackOilAdapter(_DeterministicAdapter):
    operation = "fluid.pvt.standing_black_oil"

    def compute(self, request: StandingBlackOilRequest) -> ComputationOutput:
        pressure_input = _require_finite_positive(request.pressure, "pressure")
        pressure = convert(pressure_input, request.pressure_unit, "psi")
        try:
            temperature = float(request.temperature)
        except (TypeError, ValueError) as exc:
            raise DomainError(DomainErrorCode.INVALID_INPUT, "temperature must be numeric") from exc
        if not math.isfinite(temperature):
            raise DomainError(DomainErrorCode.INVALID_INPUT, "temperature must be finite")
        api = _require_finite_positive(request.oil_api, "oil_api")
        gas_gravity = _require_finite_positive(request.gas_specific_gravity, "gas_specific_gravity")
        rsb = _require_finite_positive(request.solution_gor_at_bubble_point, "solution_gor_at_bubble_point")
        if not 5 <= api <= 60:
            raise DomainError(DomainErrorCode.INVALID_INPUT, "oil_api must be between 5 and 60 for Standing correlation")
        temperature_unit = require_unit(request.temperature_unit, "temperature")
        temp_f = convert(temperature, temperature_unit, "f")
        if temp_f <= -459.67:
            raise DomainError(DomainErrorCode.INVALID_INPUT, "temperature must be above absolute zero")
        pb = 18.2 * ((rsb / gas_gravity) ** 0.83 * 10 ** (0.00091 * temp_f - 0.0125 * api) - 1.4)
        rs = gas_gravity * (((pressure / 18.2) + 1.4) * 10 ** (0.0125 * api - 0.00091 * temp_f)) ** (1.0 / 0.83)
        rs = min(rsb, rs) if pressure <= pb else rsb
        bo = 0.972 + 0.000147 * (rs * (gas_gravity / (141.5 / (api + 131.5))) ** 0.5 + 1.25 * temp_f) ** 1.175
        warnings = []
        if pressure > pb:
            warnings.append("Pressure is above bubble point; Standing Rs/Bo is an empirical extrapolation without undersaturated compressibility")
        return self._output(
            {"bubble_point_pressure": convert(pb, "psi", request.pressure_unit), "solution_gor": rs, "oil_fvf": bo, "oil_specific_gravity": 141.5 / (api + 131.5)},
            units={"bubble_point_pressure": request.pressure_unit, "solution_gor": request.gor_unit, "oil_fvf": "rb/stb", "oil_specific_gravity": "dimensionless"},
            metrics={"pressure_to_bubble_point_ratio": pressure / max(pb, 1e-12)},
            assumptions=["Standing black-oil empirical correlation", "Oil API and gas gravity are surface-reference values", "Temperature is constant"],
            warnings=warnings,
            applicability=["Conventional black-oil fluids", "Screening and initialization only; validate against laboratory PVT"],
        )


class VogelIPRAdapter(_DeterministicAdapter):
    operation = "production.ipr.vogel"

    def compute(self, request: VogelIPRRequest) -> ComputationOutput:
        pres = _require_finite_positive(request.reservoir_pressure, "reservoir_pressure")
        pwf_test = _require_finite_nonnegative(request.test_flowing_pressure, "test_flowing_pressure")
        q_test = _require_finite_positive(request.test_rate, "test_rate")
        if pwf_test >= pres:
            raise DomainError(DomainErrorCode.INVALID_INPUT, "test_flowing_pressure must be in [0, reservoir_pressure)")
        ratio = pwf_test / pres
        denominator = 1.0 - 0.2 * ratio - 0.8 * ratio * ratio
        if not math.isfinite(denominator) or denominator <= 1e-12:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "Vogel test point is too close to reservoir pressure for a stable inflow estimate",
            )
        qmax = q_test / denominator
        if not math.isfinite(qmax):
            raise DomainError(DomainErrorCode.CALCULATION_FAILED, "Vogel absolute open-flow rate is non-finite")
        if not request.target_flowing_pressures:
            raise DomainError(DomainErrorCode.INVALID_INPUT, "target_flowing_pressures must not be empty")
        rates: list[dict[str, float]] = []
        for pressure in request.target_flowing_pressures:
            pressure = _require_finite_nonnegative(pressure, "target_flowing_pressure")
            if pressure > pres:
                raise DomainError(DomainErrorCode.INVALID_INPUT, "target flowing pressures must lie in [0, reservoir_pressure]")
            x = pressure / pres
            rates.append({"flowing_pressure": pressure, "rate": qmax * (1.0 - 0.2 * x - 0.8 * x * x)})
        return self._output(
            {"absolute_open_flow_rate": qmax, "rates": rates},
            units={"absolute_open_flow_rate": request.rate_unit, "rates.flowing_pressure": request.pressure_unit, "rates.rate": request.rate_unit},
            metrics={"test_pressure_ratio": ratio},
            assumptions=["Vogel inflow performance relationship", "Single-phase average reservoir pressure", "Test rate is representative and stable"],
            applicability=["Solution-gas-drive oil wells below bubble point", "Screening IPR; validate multiphase/VLP effects separately"],
        )


class NodalAnalysisAdapter(_DeterministicAdapter):
    operation = "production.nodal_analysis"

    @staticmethod
    def _inflow_pressure(q: float, pres: float, qmax: float) -> float:
        fraction = min(max(q / qmax, 0.0), 1.0)
        return pres * ((-0.2 + math.sqrt(max(0.0, 3.24 - 3.2 * fraction))) / 1.6)

    def compute(self, request: NodalAnalysisRequest) -> ComputationOutput:
        pres = _require_finite_positive(request.reservoir_pressure, "reservoir_pressure")
        pwf_test = _require_finite_nonnegative(request.test_flowing_pressure, "test_flowing_pressure")
        qtest = _require_finite_positive(request.test_rate, "test_rate")
        wellhead_pressure = _require_finite_nonnegative(request.wellhead_pressure, "wellhead_pressure")
        hydrostatic_pressure = _require_finite_nonnegative(request.hydrostatic_pressure, "hydrostatic_pressure")
        friction_pressure = _require_finite_nonnegative(
            request.friction_pressure_at_test_rate,
            "friction_pressure_at_test_rate",
        )
        tolerance = _require_finite_positive(request.tolerance, "tolerance")
        if isinstance(request.max_iterations, bool) or not isinstance(request.max_iterations, int):
            raise DomainError(DomainErrorCode.INVALID_INPUT, "max_iterations must be an integer")
        if not 1 <= request.max_iterations <= 1000:
            raise DomainError(DomainErrorCode.INVALID_INPUT, "tolerance/max_iterations are outside safe limits")
        if pwf_test >= pres:
            raise DomainError(DomainErrorCode.INVALID_INPUT, "test_flowing_pressure must be in [0, reservoir_pressure)")
        ratio = pwf_test / pres
        denominator = 1.0 - 0.2 * ratio - 0.8 * ratio**2
        if not math.isfinite(denominator) or denominator <= 1e-12:
            raise DomainError(
                DomainErrorCode.INVALID_INPUT,
                "Vogel test point is too close to reservoir pressure for a stable nodal estimate",
            )
        qmax = qtest / denominator
        if not math.isfinite(qmax):
            raise DomainError(DomainErrorCode.CALCULATION_FAILED, "Nodal-analysis maximum rate is non-finite")
        base_outflow = wellhead_pressure + hydrostatic_pressure
        if base_outflow >= pres:
            raise DomainError(DomainErrorCode.INVALID_INPUT, "surface plus hydrostatic pressure exceeds reservoir pressure")
        def residual(rate: float) -> float:
            outflow = base_outflow + friction_pressure * (rate / qtest) ** 2
            value = self._inflow_pressure(rate, pres, qmax) - outflow
            if not math.isfinite(value):
                raise DomainError(DomainErrorCode.CALCULATION_FAILED, "Nodal-analysis residual is non-finite")
            return value
        lo, hi = 0.0, qmax
        if residual(lo) < 0:
            raise DomainError(DomainErrorCode.CALCULATION_FAILED, "No positive IPR/VLP intersection")
        for iteration in range(1, request.max_iterations + 1):
            mid = (lo + hi) / 2.0
            if abs(residual(mid)) <= tolerance:
                lo = hi = mid
                break
            if residual(mid) > 0:
                lo = mid
            else:
                hi = mid
        rate = (lo + hi) / 2.0
        inflow_pressure = self._inflow_pressure(rate, pres, qmax)
        outflow_pressure = base_outflow + friction_pressure * (rate / qtest) ** 2
        return self._output(
            {"operating_rate": rate, "flowing_bottomhole_pressure": inflow_pressure, "inflow_pressure": inflow_pressure, "outflow_pressure": outflow_pressure, "residual": inflow_pressure - outflow_pressure, "iterations": iteration},
            units={"operating_rate": request.rate_unit, "flowing_bottomhole_pressure": request.pressure_unit, "inflow_pressure": request.pressure_unit, "outflow_pressure": request.pressure_unit, "residual": request.pressure_unit},
            metrics={"absolute_open_flow_rate": qmax, "relative_balance_error": abs(inflow_pressure - outflow_pressure) / max(pres, 1e-12)},
            assumptions=["Vogel IPR", "Quadratic friction VLP anchored at the test rate", "Constant hydrostatic contribution"],
            applicability=["Single-well screening nodal analysis", "Use a multiphase VLP Provider for final design"],
        )


class ConservationCheckAdapter(_DeterministicAdapter):
    operation = "validation.conservation_check"

    def compute(self, request: ConservationCheckRequest) -> ComputationOutput:
        values = [request.initial_inventory, request.final_inventory, *request.inflows, *request.outflows]
        if any(not math.isfinite(float(value)) for value in values):
            raise DomainError(DomainErrorCode.INVALID_INPUT, "All conservation values must be finite")
        if request.initial_inventory < 0 or request.final_inventory < 0:
            raise DomainError(DomainErrorCode.INVALID_INPUT, "inventory values must be non-negative")
        if any(float(value) < 0 for value in [*request.inflows, *request.outflows]):
            raise DomainError(DomainErrorCode.INVALID_INPUT, "Inflow and outflow values must be non-negative")
        if not math.isfinite(request.tolerance) or request.tolerance <= 0:
            raise DomainError(DomainErrorCode.INVALID_INPUT, "tolerance must be positive and finite")
        expected_final = request.initial_inventory + sum(request.inflows) - sum(request.outflows)
        residual = expected_final - request.final_inventory
        scale = max(abs(expected_final), abs(request.final_inventory), abs(request.initial_inventory), 1.0)
        relative_error = abs(residual) / scale
        passed = abs(residual) <= request.tolerance * scale
        return self._output(
            {"expected_final_inventory": expected_final, "actual_final_inventory": request.final_inventory, "residual": residual, "relative_error": relative_error, "passed": passed},
            units={"expected_final_inventory": request.unit, "actual_final_inventory": request.unit, "residual": request.unit},
            metrics={"relative_error": relative_error, "tolerance": request.tolerance},
            warnings=[] if passed else ["Conservation residual exceeds the requested tolerance"],
            applicability=["Scalar inventory/material-balance sanity check", "Use a domain-specific balance when phase behavior or compressibility matters"],
        )
