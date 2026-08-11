# -*- coding: utf-8 -*-
"""Golden and contract tests for the UGSci deterministic petroleum core."""

from __future__ import annotations

import math

import pytest

from plugins.bundle.ugsci.domain.common.errors import DomainError
from plugins.bundle.ugsci.domain.computation.service import ComputationService
from plugins.bundle.ugsci.domain.deterministic.adapters import (
    ConservationCheckAdapter,
    GasMaterialBalanceAdapter,
    NodalAnalysisAdapter,
    OilMaterialBalanceAdapter,
    StandingBlackOilAdapter,
    UnitConversionAdapter,
    VolumetricOilInPlaceAdapter,
    VogelIPRAdapter,
)
from plugins.bundle.ugsci.domain.deterministic.models import (
    ConservationCheckRequest,
    GasMaterialBalanceRequest,
    NodalAnalysisRequest,
    OilMaterialBalanceRequest,
    StandingBlackOilRequest,
    UnitConversionRequest,
    VolumetricOilInPlaceRequest,
    VogelIPRRequest,
)
from plugins.bundle.ugsci.domain.deterministic.providers import (
    default_registry,
)
from plugins.bundle.ugsci.domain.deterministic.units import require_unit
from plugins.bundle.ugsci.domain_engine.catalog import get_engine


def test_unit_conversion_pressure() -> None:
    result = UnitConversionAdapter().compute(
        UnitConversionRequest(1000.0, "psi", "MPa"),
    )
    assert result.result["value"] == pytest.approx(6.894757293168)


def test_volumetric_ooip_matches_field_formula() -> None:
    request = VolumetricOilInPlaceRequest(640.0, 50.0, 0.2, 0.25, 1.2)
    result = VolumetricOilInPlaceAdapter().compute(request)
    expected = 7758.0 * 640.0 * 50.0 * 0.2 * 0.75 / 1.2
    assert result.result["oil_in_place"] == pytest.approx(expected, rel=2e-4)


def test_oil_material_balance_returns_positive_ooip_and_terms() -> None:
    request = OilMaterialBalanceRequest(
        produced_oil=1_000_000.0,
        initial_oil_fvf=1.2,
        current_oil_fvf=1.25,
        initial_pressure=4000.0,
        current_pressure=3000.0,
        produced_gor=700.0,
        initial_solution_gor=600.0,
        current_solution_gor=500.0,
        gas_fvf=0.001,
        water_compressibility=3e-6,
        rock_compressibility=5e-6,
    )
    result = OilMaterialBalanceAdapter().compute(request)
    assert result.result["estimated_ooip"] > request.produced_oil
    assert result.result["total_expansion"] == pytest.approx(0.1584)


def test_gas_pz_material_balance_golden_case() -> None:
    result = GasMaterialBalanceAdapter().compute(
        GasMaterialBalanceRequest(2e9, 4000.0, 0.9, 2500.0, 0.8),
    )
    assert result.result["estimated_ogip"] == pytest.approx(6.736842105e9)
    assert result.result["recovery_factor"] == pytest.approx(0.296875)


def test_standing_black_oil_reports_applicability_and_warning() -> None:
    result = StandingBlackOilAdapter().compute(
        StandingBlackOilRequest(2500.0, 180.0, 35.0, 0.75, 600.0),
    )
    assert result.result["bubble_point_pressure"] == pytest.approx(
        2463.011,
        rel=1e-5,
    )
    assert result.result["oil_fvf"] > 1.0
    assert result.applicability
    assert result.warnings


def test_vogel_ipr_recovers_test_rate() -> None:
    result = VogelIPRAdapter().compute(
        VogelIPRRequest(3000.0, 2000.0, 500.0, [2000.0, 0.0]),
    )
    assert result.result["rates"][0]["rate"] == pytest.approx(500.0)
    assert result.result["absolute_open_flow_rate"] > 500.0


def test_nodal_analysis_closes_ipr_vlp_residual() -> None:
    result = NodalAnalysisAdapter().compute(
        NodalAnalysisRequest(3000.0, 2000.0, 500.0, 200.0, 1200.0, 100.0),
    )
    assert result.result["operating_rate"] > 0
    assert abs(result.result["residual"]) <= 1e-6


def test_conservation_check_has_explicit_pass_fail() -> None:
    passed = ConservationCheckAdapter().compute(
        ConservationCheckRequest(100.0, [20.0], [30.0], 90.0),
    )
    failed = ConservationCheckAdapter().compute(
        ConservationCheckRequest(100.0, [20.0], [30.0], 88.0),
    )
    assert passed.result["passed"] is True
    assert failed.result["passed"] is False
    assert failed.warnings


def test_service_adds_versions_tolerances_and_provenance() -> None:
    result = (
        ComputationService()
        .execute(
            "reservoir.volumetrics.oil_in_place",
            VolumetricOilInPlaceAdapter(),
            VolumetricOilInPlaceRequest(640.0, 50.0, 0.2, 0.25, 1.2),
            method="volumetric_ooip",
        )
        .to_dict()
    )
    assert result["engine_version"] == "1.1.0"
    assert result["provider_version"] == "1.1.0"
    assert result["deterministic"] is True
    assert result["tolerances"]["relative"] == 1e-8
    assert result["provenance"]["input_fingerprint"].startswith("sha256:")
    assert "pytoolbox" in result["provenance"]["support_libraries"]


def test_provider_registry_separates_stochastic_providers() -> None:
    rows = {row["capability_id"]: row for row in default_registry.describe()}
    assert (
        rows["reservoir.material_balance.oil"]["providers"][0][
            "execution_class"
        ]
        == "deterministic"
    )
    assert (
        rows["statistics.bayesian.normal_mean"]["providers"][0][
            "execution_class"
        ]
        == "stochastic"
    )


def test_catalog_exposes_petroleum_core_and_execution_classes() -> None:
    core = get_engine("petroleum-deterministic-core")
    pymc = get_engine("pymc")
    assert core is not None
    assert core.execution_class == "deterministic"
    assert len(core.operations) == 8
    assert pymc is not None and pymc.execution_class == "stochastic"


def test_unit_conversion_supports_affine_temperature_units() -> None:
    result = UnitConversionAdapter().compute(
        UnitConversionRequest(32.0, "degF", "degC"),
    )
    assert result.result["value"] == pytest.approx(0.0)


def test_unit_conversion_supports_gas_cubic_metres_and_cubic_feet() -> None:
    standard_cubic_metres = UnitConversionAdapter().compute(
        UnitConversionRequest(1.0, "sm3", "scf"),
    )
    generic_cubic_metres = UnitConversionAdapter().compute(
        UnitConversionRequest(1.0, "m³", "ft³"),
    )
    assert standard_cubic_metres.result["value"] == pytest.approx(
        35.3146667215,
    )
    assert generic_cubic_metres.result["value"] == pytest.approx(35.3146667215)


def test_gas_material_balance_accepts_m3_and_sm3() -> None:
    produced_scf = 2e9
    baseline = GasMaterialBalanceAdapter().compute(
        GasMaterialBalanceRequest(produced_scf, 4000.0, 0.9, 2500.0, 0.8),
    )
    produced_m3 = produced_scf * 0.028316846592
    for unit in ("m3", "sm3", "m³", "stdm³"):
        metric = GasMaterialBalanceAdapter().compute(
            GasMaterialBalanceRequest(
                produced_m3,
                4000.0,
                0.9,
                2500.0,
                0.8,
                gas_volume_unit=unit,
            ),
        )
        assert metric.result["estimated_ogip"] == pytest.approx(
            baseline.result["estimated_ogip"] * 0.028316846592,
        )
        assert metric.units["estimated_ogip"] in {"m3", "sm3"}


def test_volume_units_are_domain_specific() -> None:
    assert require_unit("m3", "gas_volume") == "m3"
    assert require_unit("m3", "liquid_volume") == "m3"
    assert require_unit("sm3", "gas_volume") == "sm3"
    assert require_unit("stb", "liquid_volume") == "stb"
    assert require_unit("1e4_sm3/d", "gas_rate") == "1e4_sm3/d"
    assert require_unit("stb/d", "liquid_rate") == "stb/d"
    with pytest.raises(DomainError, match="Expected a gas_volume unit"):
        require_unit("stb", "gas_volume")
    with pytest.raises(DomainError, match="Expected a liquid_volume unit"):
        require_unit("scf", "liquid_volume")
    with pytest.raises(DomainError, match="Expected a gas_rate unit"):
        require_unit("stb/d", "gas_rate")


def test_standing_black_oil_kelvin_matches_fahrenheit_and_celsius() -> None:
    fahrenheit = StandingBlackOilAdapter().compute(
        StandingBlackOilRequest(
            2500.0,
            180.0,
            35.0,
            0.75,
            600.0,
            temperature_unit="F",
        ),
    )
    celsius = StandingBlackOilAdapter().compute(
        StandingBlackOilRequest(
            2500.0,
            82.2222222222,
            35.0,
            0.75,
            600.0,
            temperature_unit="C",
        ),
    )
    kelvin = StandingBlackOilAdapter().compute(
        StandingBlackOilRequest(
            2500.0,
            355.3722222222,
            35.0,
            0.75,
            600.0,
            temperature_unit="K",
        ),
    )
    rankine = StandingBlackOilAdapter().compute(
        StandingBlackOilRequest(
            2500.0,
            639.67,
            35.0,
            0.75,
            600.0,
            temperature_unit="R",
        ),
    )
    for result in (celsius, kelvin, rankine):
        assert result.result["bubble_point_pressure"] == pytest.approx(
            fahrenheit.result["bubble_point_pressure"],
        )
        assert result.result["solution_gor"] == pytest.approx(
            fahrenheit.result["solution_gor"],
        )
        assert result.result["oil_fvf"] == pytest.approx(
            fahrenheit.result["oil_fvf"],
        )


def test_temperature_conversion_rejects_below_absolute_zero() -> None:
    with pytest.raises(DomainError, match="absolute zero"):
        UnitConversionAdapter().compute(UnitConversionRequest(-0.01, "K", "F"))


@pytest.mark.parametrize("bad_pressure", [math.nan, math.inf, -math.inf])
def test_vogel_adapter_rejects_non_finite_target_pressures(
    bad_pressure: float,
) -> None:
    with pytest.raises(
        DomainError,
        match="target_flowing_pressure must be non-negative and finite",
    ):
        VogelIPRAdapter().compute(
            VogelIPRRequest(3000.0, 2000.0, 500.0, [bad_pressure]),
        )


@pytest.mark.parametrize(
    "field_name",
    [
        "wellhead_pressure",
        "hydrostatic_pressure",
        "friction_pressure_at_test_rate",
    ],
)
@pytest.mark.parametrize("bad_value", [math.nan, math.inf, -math.inf])
def test_nodal_adapter_rejects_non_finite_vlp_components(
    field_name: str,
    bad_value: float,
) -> None:
    values = {
        "reservoir_pressure": 3000.0,
        "test_flowing_pressure": 2000.0,
        "test_rate": 500.0,
        "wellhead_pressure": 200.0,
        "hydrostatic_pressure": 1200.0,
        "friction_pressure_at_test_rate": 100.0,
    }
    values[field_name] = bad_value
    with pytest.raises(
        DomainError,
        match=f"{field_name} must be non-negative and finite",
    ):
        NodalAnalysisAdapter().compute(NodalAnalysisRequest(**values))


@pytest.mark.parametrize(
    "bad_tolerance",
    [math.nan, math.inf, -math.inf, 0.0, -1.0],
)
def test_nodal_adapter_rejects_invalid_tolerance(bad_tolerance: float) -> None:
    with pytest.raises(
        DomainError,
        match="tolerance must be positive and finite",
    ):
        NodalAnalysisAdapter().compute(
            NodalAnalysisRequest(
                3000.0,
                2000.0,
                500.0,
                200.0,
                1200.0,
                100.0,
                tolerance=bad_tolerance,
            ),
        )


def test_vogel_and_nodal_reject_numerically_degenerate_test_point() -> None:
    near_reservoir_pressure = math.nextafter(3000.0, 0.0)
    with pytest.raises(DomainError, match="too close to reservoir pressure"):
        VogelIPRAdapter().compute(
            VogelIPRRequest(3000.0, near_reservoir_pressure, 500.0, [0.0]),
        )
    with pytest.raises(DomainError, match="too close to reservoir pressure"):
        NodalAnalysisAdapter().compute(
            NodalAnalysisRequest(
                3000.0,
                near_reservoir_pressure,
                500.0,
                200.0,
                1200.0,
                100.0,
            ),
        )


def test_gas_material_balance_converts_pressure_units() -> None:
    psi = GasMaterialBalanceAdapter().compute(
        GasMaterialBalanceRequest(2e9, 4000.0, 0.9, 2500.0, 0.8),
    )
    kpa = GasMaterialBalanceAdapter().compute(
        GasMaterialBalanceRequest(
            2e9,
            4000.0 * 6.894757293168,
            0.9,
            2500.0 * 6.894757293168,
            0.8,
            pressure_unit="kPa",
        ),
    )
    assert kpa.result["estimated_ogip"] == pytest.approx(
        psi.result["estimated_ogip"],
    )
    assert kpa.result["initial_p_over_z"] == pytest.approx(
        psi.result["initial_p_over_z"] * 6.894757293168,
    )


def test_volumetric_inputs_reject_non_positive_geometry() -> None:
    with pytest.raises(DomainError, match="area must be positive"):
        VolumetricOilInPlaceAdapter().compute(
            VolumetricOilInPlaceRequest(-1.0, 50.0, 0.2, 0.25, 1.2),
        )
