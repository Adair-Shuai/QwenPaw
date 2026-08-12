# -*- coding: utf-8 -*-
"""Golden, boundary and report-level tests for storage inventory."""

from __future__ import annotations

import dataclasses
import inspect
from typing import get_args, get_type_hints

import pytest

from plugins.bundle.ugsci.domain.common.errors import DomainError
from plugins.bundle.ugsci.domain.computation.service import ComputationService
from plugins.bundle.ugsci.domain.storage_inventory.adapters import (
    EffectiveInventoryAdapter,
    InventoryAccountingAdapter,
    StorageInventoryEvaluationAdapter,
)
from plugins.bundle.ugsci.domain.storage_inventory.models import (
    EffectiveInventoryLayerRequest,
    EffectiveInventoryRequest,
    InventoryAccountingRequest,
    StorageInventoryEvaluationRequest,
)
from plugins.bundle.ugsci.domain_engine.catalog import get_engine
from plugins.bundle.ugsci.domain.storage_inventory.tools import (
    ugsci_storage_effective_inventory,
    ugsci_storage_inventory_evaluate,
)


def _request(
    *layers: EffectiveInventoryLayerRequest,
) -> EffectiveInventoryRequest:
    return EffectiveInventoryRequest(
        layers=tuple(layers),
        cycle_id="2024-2025",
        injection_end_state_id="2024-injection-end-equilibrium",
        evaluation_state_id="2025-production-end-equilibrium",
    )


def _hutubi_reconstructed_layers() -> tuple[EffectiveInventoryLayerRequest, ...]:
    """Reconstruct formula inputs from published layer results and Qp=30.2.

    The PPT publishes 78.3 and 26.7 (total 105.0) but does not expose the
    source layer pressure/Z table as machine-readable text.  This fixture
    therefore verifies the formula and report-level acceptance values without
    pretending the reconstructed Z factor is a measured source datum.
    """
    common = {
        "injection_end_pressure": 34.0,
        "injection_end_z": 0.9681,
        "evaluation_pressure": 22.47,
        "evaluation_z": 0.8981152622680088,
    }
    return (
        EffectiveInventoryLayerRequest(
            name="E1-2z21",
            produced_gas=22.520571428571426,
            **common,
        ),
        EffectiveInventoryLayerRequest(
            name="E1-2z22",
            produced_gas=7.679428571428571,
            **common,
        ),
    )


def test_inventory_accounting_golden_case() -> None:
    result = InventoryAccountingAdapter().compute(
        InventoryAccountingRequest(49.28, 100.0, 44.4),
    )
    assert result.result["inventory"] == pytest.approx(104.88)
    assert result.result["net_change"] == pytest.approx(55.6)


def test_effective_inventory_formula_exact_case() -> None:
    result = EffectiveInventoryAdapter().compute(
        _request(
            EffectiveInventoryLayerRequest(
                name="layer-a",
                produced_gas=20.0,
                injection_end_pressure=30.0,
                injection_end_z=1.0,
                evaluation_pressure=20.0,
                evaluation_z=1.0,
            ),
        ),
    )
    assert result.result["effective_inventory"] == pytest.approx(60.0)
    assert result.result["layers"][0]["withdrawal_fraction"] == pytest.approx(
        1 / 3,
    )
    assert result.result["layers"][0]["inverse_withdrawal_fraction"] == pytest.approx(
        3.0,
    )
    assert result.units["layers.inverse_withdrawal_fraction"] == "dimensionless"
    assert result.units["layers.withdrawal_fraction"] == "dimensionless"


def test_hutubi_report_level_golden_case() -> None:
    effective_request = _request(*_hutubi_reconstructed_layers())
    result = StorageInventoryEvaluationAdapter().compute(
        StorageInventoryEvaluationRequest(
            effective_inventory=effective_request,
            book_inventory=104.88,
            design_capacity=107.0,
            working_gas=43.5,
            design_working_gas=45.1,
            peak_daily_rate=3950.0,
            design_peak_daily_rate=4020.0,
        ),
    )
    assert [
        row["effective_inventory"] for row in result.result["layers"]
    ] == pytest.approx([78.3, 26.7])
    assert result.result["effective_inventory"] == pytest.approx(105.0)
    assert result.result["book_minus_effective_inventory"] == pytest.approx(
        -0.12,
    )
    assert result.result["effective_minus_book_percent"] == pytest.approx(
        0.1144165,
    )
    assert result.result[
        "effective_inventory_design_compliance_percent"
    ] == pytest.approx(98.1308411)
    assert result.result["book_inventory_fill_percent"] == pytest.approx(
        98.0186916,
    )
    assert result.result["effective_to_book_percent"] == pytest.approx(
        100.1144165,
    )
    assert result.result["working_gas_compliance_percent"] == pytest.approx(
        96.4523282,
    )
    assert result.result["peak_daily_compliance_percent"] == pytest.approx(
        98.2587065,
    )
    assert result.result["review_status"] == "calculated_recommendation_pending_review"
    assert result.result["book_inventory_source"] == "provided_book_inventory"
    assert result.result["quality_gate"]["maximum_inverse_withdrawal_fraction"] == 100.0
    assert result.units["layers.produced_gas"] == "1e8_sm3"
    assert result.units["layers.injection_end_p_over_z"] == "mpa"
    assert result.units["layers.inverse_withdrawal_fraction"] == "dimensionless"
    assert any("not an approved capacity" in warning for warning in result.warnings)


def test_full_reservoir_averages_do_not_replace_layer_calculation() -> None:
    result = EffectiveInventoryAdapter().compute(
        _request(
            EffectiveInventoryLayerRequest(
                name="full-reservoir-aggregate",
                produced_gas=30.2,
                injection_end_pressure=34.0,
                injection_end_z=0.9681,
                evaluation_pressure=22.47,
                evaluation_z=0.9044,
            ),
        ),
    )
    assert result.result["effective_inventory"] == pytest.approx(103.2233607)
    assert result.result["effective_inventory"] != pytest.approx(
        105.0,
        abs=0.5,
    )


@pytest.mark.parametrize(
    ("pin", "zin", "pressure", "z_factor", "message"),
    [
        (20.0, 1.0, 20.0, 1.0, "must exceed"),
        (19.0, 1.0, 20.0, 1.0, "must exceed"),
        (30.0, 0.0, 20.0, 1.0, "must be positive"),
    ],
)
def test_effective_inventory_rejects_invalid_p_over_z_boundary(
    pin: float,
    zin: float,
    pressure: float,
    z_factor: float,
    message: str,
) -> None:
    with pytest.raises(DomainError, match=message):
        EffectiveInventoryAdapter().compute(
            _request(
                EffectiveInventoryLayerRequest(
                    name="layer-a",
                    produced_gas=1.0,
                    injection_end_pressure=pin,
                    injection_end_z=zin,
                    evaluation_pressure=pressure,
                    evaluation_z=z_factor,
                ),
            ),
        )


def test_effective_inventory_rejects_ambiguous_or_duplicate_scope() -> None:
    layer = EffectiveInventoryLayerRequest("same", 1.0, 30.0, 1.0, 20.0, 1.0)
    with pytest.raises(DomainError, match="cycle_id must not be empty"):
        EffectiveInventoryAdapter().compute(
            EffectiveInventoryRequest((layer,), "", "start", "end"),
        )
    with pytest.raises(DomainError, match="layer names must be unique"):
        EffectiveInventoryAdapter().compute(_request(layer, layer))
    with pytest.raises(DomainError, match="layer names must be unique"):
        EffectiveInventoryAdapter().compute(
            _request(
                layer,
                EffectiveInventoryLayerRequest(
                    "SAME",
                    1.0,
                    30.0,
                    1.0,
                    20.0,
                    1.0,
                ),
            ),
        )


def test_effective_inventory_rejects_same_named_state_boundary() -> None:
    layer = EffectiveInventoryLayerRequest(
        "layer-a",
        1.0,
        30.0,
        1.0,
        20.0,
        1.0,
    )
    with pytest.raises(DomainError, match="must identify different states"):
        EffectiveInventoryAdapter().compute(
            EffectiveInventoryRequest(
                (layer,),
                "cycle",
                "Equilibrium-A",
                "equilibrium-a",
            ),
        )


def test_effective_inventory_rejects_unknown_pressure_basis() -> None:
    layer = EffectiveInventoryLayerRequest(
        "layer-a",
        1.0,
        30.0,
        1.0,
        20.0,
        1.0,
    )
    with pytest.raises(DomainError, match="pressure_basis"):
        EffectiveInventoryAdapter().compute(
            EffectiveInventoryRequest(
                (layer,),
                "cycle",
                "start",
                "end",
                pressure_basis="gauge",  # type: ignore[arg-type]
            ),
        )


def test_effective_inventory_accepts_apparent_formation_pressure_basis() -> None:
    layer = EffectiveInventoryLayerRequest("layer-a", 1.0, 30.0, 1.0, 20.0, 1.0)
    result = EffectiveInventoryAdapter().compute(
        EffectiveInventoryRequest(
            (layer,),
            "cycle",
            "injection-end",
            "evaluation",
            pressure_basis="apparent_formation",
        ),
    )
    assert result.result["pressure_basis"] == "apparent_formation"


def test_effective_inventory_rejects_engineering_instability() -> None:
    with pytest.raises(DomainError, match="engineering stability limit"):
        EffectiveInventoryAdapter().compute(
            _request(
                EffectiveInventoryLayerRequest(
                    "layer-a",
                    1.0,
                    30.0,
                    1.0,
                    29.8,
                    1.0,
                ),
            ),
        )


def test_storage_inventory_units_are_validated_and_normalized() -> None:
    accounting = InventoryAccountingAdapter().compute(
        InventoryAccountingRequest(1.0, 2.0, 1.0, "亿方"),
    )
    assert accounting.units["inventory"] == "1e8_sm3"

    effective_request = EffectiveInventoryRequest(
        layers=(
            EffectiveInventoryLayerRequest(
                "layer-a",
                20.0,
                30.0,
                1.0,
                20.0,
                1.0,
            ),
        ),
        cycle_id="cycle",
        injection_end_state_id="start",
        evaluation_state_id="end",
        gas_volume_unit="10^8sm3",
        pressure_unit="MPa",
    )
    evaluated = StorageInventoryEvaluationAdapter().compute(
        StorageInventoryEvaluationRequest(
            effective_inventory=effective_request,
            book_inventory=60.0,
            design_capacity=100.0,
            peak_daily_rate=30.0,
            design_peak_daily_rate=40.0,
            daily_rate_unit="万方/日",
        ),
    )
    assert evaluated.units["effective_inventory"] == "1e8_sm3"
    assert evaluated.units["peak_daily_rate"] == "1e4_sm3/d"


@pytest.mark.parametrize(
    "case",
    [
        InventoryAccountingRequest(1.0, 1.0, 1.0, "stb"),
        EffectiveInventoryRequest(
            (
                EffectiveInventoryLayerRequest(
                    "layer-a",
                    1.0,
                    30.0,
                    1.0,
                    20.0,
                    1.0,
                ),
            ),
            "cycle",
            "start",
            "end",
            pressure_unit="m",
        ),
    ],
)
def test_storage_inventory_rejects_incompatible_units(case) -> None:
    adapter = (
        InventoryAccountingAdapter()
        if isinstance(case, InventoryAccountingRequest)
        else EffectiveInventoryAdapter()
    )
    with pytest.raises(DomainError, match="Expected a"):
        adapter.compute(case)


def test_evaluation_rejects_incompatible_daily_rate_unit() -> None:
    with pytest.raises(DomainError, match="Expected a gas_rate unit"):
        StorageInventoryEvaluationAdapter().compute(
            StorageInventoryEvaluationRequest(
                effective_inventory=_request(*_hutubi_reconstructed_layers()),
                book_inventory=104.88,
                design_capacity=107.0,
                daily_rate_unit="stb/d",
            ),
        )


def test_composite_evaluation_calculates_book_inventory_in_one_request() -> None:
    result = StorageInventoryEvaluationAdapter().compute(
        StorageInventoryEvaluationRequest(
            effective_inventory=_request(*_hutubi_reconstructed_layers()),
            design_capacity=107.0,
            initial_inventory=49.28,
            cumulative_injected=100.0,
            cumulative_produced=44.4,
        ),
    )
    assert result.result["book_inventory"] == pytest.approx(104.88)
    assert result.result["book_inventory_source"] == "injection_production_accounting"
    assert result.result["book_inventory_accounting"]["net_change"] == pytest.approx(
        55.6,
    )
    assert result.units["book_inventory_accounting.initial_inventory"] == "1e8_sm3"


def test_composite_evaluation_requires_exactly_one_book_inventory_source() -> None:
    base = {
        "effective_inventory": _request(*_hutubi_reconstructed_layers()),
        "design_capacity": 107.0,
    }
    with pytest.raises(DomainError, match="either book_inventory"):
        StorageInventoryEvaluationAdapter().compute(
            StorageInventoryEvaluationRequest(
                **base,
                book_inventory=104.88,
                initial_inventory=49.28,
                cumulative_injected=100.0,
                cumulative_produced=44.4,
            ),
        )
    with pytest.raises(DomainError, match="all of initial_inventory"):
        StorageInventoryEvaluationAdapter().compute(
            StorageInventoryEvaluationRequest(
                **base,
                initial_inventory=49.28,
            ),
        )


def test_composite_evaluation_rejects_zero_accounting_inventory() -> None:
    with pytest.raises(DomainError, match="book_inventory must be positive"):
        StorageInventoryEvaluationAdapter().compute(
            StorageInventoryEvaluationRequest(
                effective_inventory=_request(*_hutubi_reconstructed_layers()),
                design_capacity=107.0,
                initial_inventory=1.0,
                cumulative_injected=0.0,
                cumulative_produced=1.0,
            ),
        )


def test_evaluation_contract_cannot_self_declare_review_or_approval() -> None:
    field_names = {
        field.name for field in dataclasses.fields(StorageInventoryEvaluationRequest)
    }
    assert "review_status" not in field_names
    assert "review_reference" not in field_names

    result = StorageInventoryEvaluationAdapter().compute(
        StorageInventoryEvaluationRequest(
            effective_inventory=_request(*_hutubi_reconstructed_layers()),
            book_inventory=104.88,
            design_capacity=107.0,
        ),
    )
    assert result.result["review_status"] == "calculated_recommendation_pending_review"
    assert result.result["review_reference"] is None


def test_evaluation_rejects_design_working_gas_above_design_capacity() -> None:
    with pytest.raises(DomainError, match="must not exceed design_capacity"):
        StorageInventoryEvaluationAdapter().compute(
            StorageInventoryEvaluationRequest(
                effective_inventory=_request(*_hutubi_reconstructed_layers()),
                book_inventory=104.88,
                design_capacity=107.0,
                working_gas=50.0,
                design_working_gas=108.0,
            ),
        )


def test_evaluation_warns_when_working_gas_exceeds_effective_inventory() -> None:
    result = StorageInventoryEvaluationAdapter().compute(
        StorageInventoryEvaluationRequest(
            effective_inventory=_request(
                EffectiveInventoryLayerRequest(
                    "layer-a",
                    20.0,
                    30.0,
                    1.0,
                    20.0,
                    1.0,
                ),
            ),
            book_inventory=65.0,
            design_capacity=100.0,
            working_gas=61.0,
            design_working_gas=80.0,
        ),
    )
    assert any(
        "Working gas exceeds effective" in warning for warning in result.warnings
    )


def test_effective_inventory_warns_for_implausible_z_factor() -> None:
    result = EffectiveInventoryAdapter().compute(
        _request(
            EffectiveInventoryLayerRequest(
                "layer-a",
                20.0,
                30.0,
                2.1,
                10.0,
                1.0,
            ),
        ),
    )
    assert any("Z factor is outside" in warning for warning in result.warnings)


def test_result_is_json_safe_and_provenance_is_stable() -> None:
    request = _request(*_hutubi_reconstructed_layers())
    first = (
        ComputationService()
        .execute(
            "storage.inventory.effective_controlled",
            EffectiveInventoryAdapter(),
            request,
            method="layered_p_over_z_withdrawal",
        )
        .to_dict()
    )
    second = (
        ComputationService()
        .execute(
            "storage.inventory.effective_controlled",
            EffectiveInventoryAdapter(),
            request,
            method="layered_p_over_z_withdrawal",
        )
        .to_dict()
    )
    assert first["result"] == second["result"]
    assert (
        first["provenance"]["input_fingerprint"]
        == second["provenance"]["input_fingerprint"]
    )
    assert first["deterministic"] is True


def test_semantically_equivalent_units_share_a_fingerprint() -> None:
    service = ComputationService()
    base = _request(*_hutubi_reconstructed_layers())
    alias = EffectiveInventoryRequest(
        layers=base.layers,
        cycle_id=f" {base.cycle_id} ",
        injection_end_state_id=base.injection_end_state_id,
        evaluation_state_id=base.evaluation_state_id,
        gas_volume_unit="10^8sm3",
        pressure_unit="mpa",
    )
    first = service.execute(
        "storage.inventory.effective_controlled",
        EffectiveInventoryAdapter(),
        base,
        method="layered_p_over_z_withdrawal",
    ).to_dict()
    second = service.execute(
        "storage.inventory.effective_controlled",
        EffectiveInventoryAdapter(),
        alias,
        method="layered_p_over_z_withdrawal",
    ).to_dict()
    assert (
        first["result"]["effective_inventory"]
        == second["result"]["effective_inventory"]
    )
    assert (
        first["provenance"]["input_fingerprint"]
        == second["provenance"]["input_fingerprint"]
    )


def test_catalog_exposes_storage_inventory_engine() -> None:
    engine = get_engine("storage-inventory-evaluation")
    assert engine is not None
    assert engine.execution_class == "deterministic"
    assert engine.engine_version == "1.2.0"
    assert {operation.id for operation in engine.operations} == {
        "storage.inventory.accounting",
        "storage.inventory.effective_controlled",
        "storage.inventory.evaluate",
    }


@pytest.mark.parametrize(
    "tool",
    [ugsci_storage_effective_inventory, ugsci_storage_inventory_evaluate],
)
def test_tool_schema_exposes_all_nested_layer_fields(tool) -> None:
    hints = get_type_hints(tool)
    layer_schema = get_args(hints["layers"])[0]
    assert layer_schema.__required_keys__ == {
        "name",
        "produced_gas",
        "injection_end_pressure",
        "injection_end_z",
        "evaluation_pressure",
        "evaluation_z",
    }
    doc = inspect.getdoc(tool)
    assert doc is not None
    assert "Every layer requires" in doc


def test_agentscope_function_tool_builds_nested_schema() -> None:
    from agentscope.tool import FunctionTool

    tool = FunctionTool(ugsci_storage_inventory_evaluate)
    nested = tool.input_schema["$defs"]["EffectiveInventoryLayerInput"]
    assert nested["required"] == [
        "name",
        "produced_gas",
        "injection_end_pressure",
        "injection_end_z",
        "evaluation_pressure",
        "evaluation_z",
    ]
    assert all(
        nested["properties"][name].get("description") for name in nested["required"]
    )
    properties = tool.input_schema["properties"]
    assert all(
        properties[name].get("description") for name in properties if name != "layers"
    )
    assert set(properties["pressure_basis"]["enum"]) == {
        "absolute",
        "apparent_formation",
        "report_defined",
    }
    assert "review_status" not in properties
    assert "review_reference" not in properties
