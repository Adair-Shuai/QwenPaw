# -*- coding: utf-8 -*-
"""Public storage adapters preserve \
numerical and validation stage \
boundaries."""

import importlib

import pytest


@pytest.fixture(
    name="storage",
    params=["plugins.bundle", "qwenpaw.plugins_bundle"],
)
def load_storage(request):
    prefix = request.param + ".ugsci.domain.storage_inventory"
    return importlib.import_module(
        prefix + ".adapters",
    ), importlib.import_module(
        prefix + ".models",
    )


def effective_request(models):
    return models.EffectiveInventoryRequest(
        layers=(
            models.EffectiveInventoryLayerRequest("layer", 10, 20, 1, 10, 1),
        ),
        cycle_id="cycle",
        injection_end_state_id="injection",
        evaluation_state_id="evaluation",
    )


@pytest.mark.parametrize("mask", range(8))
@pytest.mark.parametrize("provided", [None, 20.0])
def test_book_inventory_retains_missing_zero_and_source_precedence(
    storage,
    mask,
    provided,
):
    adapters, models = storage
    fields = {
        name: value if mask & (1 << index) else None
        for index, (name, value) in enumerate(
            [
                ("initial_inventory", 20.0),
                ("cumulative_injected", 0.0),
                ("cumulative_produced", 0.0),
            ],
        )
    }
    request = models.StorageInventoryEvaluationRequest(
        effective_request(models),
        50,
        book_inventory=provided,
        **fields,
    )
    if provided is not None and mask:
        with pytest.raises(
            adapters.DomainError,
            match="provide either book_inventory",
        ):
            adapters.StorageInventoryEvaluationAdapter().compute(request)
    elif provided is None and mask != 7:
        with pytest.raises(
            adapters.DomainError,
            match="book_inventory or all of",
        ):
            adapters.StorageInventoryEvaluationAdapter().compute(request)
    else:
        output = adapters.StorageInventoryEvaluationAdapter().compute(request)
        result = output.result
        assert result["effective_inventory"] == pytest.approx(20.0)
        assert result["book_inventory"] == 20.0
        assert result["book_minus_effective_inventory"] == pytest.approx(0)
        assert result["book_inventory_fill_percent"] == pytest.approx(40)
        assert (
            result["review_status"]
            == "calculated_recommendation_pending_review"
        )
        if provided is None:
            assert (
                result["book_inventory_source"]
                == "injection_production_accounting"
            )
            accounting = result["book_inventory_accounting"]
            assert accounting["cumulative_injected"] == 0
            assert accounting["cumulative_produced"] == 0
            assert accounting["net_change"] == 0
            assert (
                output.units["book_inventory_accounting.net_change"]
                == "1e8_sm3"
            )
        else:
            assert result["book_inventory_source"] == "provided_book_inventory"
            assert "book_inventory_accounting" not in result


@pytest.mark.parametrize(
    "target,expected,unmet,oversupply",
    [
        (0, [0, 5, 0], 0, 5),
        (5, [0, 5, 0], 0, 0),
        (15, [2.5, 12.5, 0], 0, 0),
        (25, [5, 20, 0], 0, 0),
        (40, [10, 20, 0], 10, 0),
    ],
)
@pytest.mark.parametrize("production", [False, True])
def test_allocation_retains_weighted_filling_bounds_and_row_order(
    storage,
    target,
    expected,
    unmet,
    oversupply,
    production,
):
    adapters, models = storage
    wells = (
        models.StorageAllocationWellRequest("A", 10, weight=1),
        models.StorageAllocationWellRequest("B", 20, minimum_rate=5, weight=3),
        models.StorageAllocationWellRequest("offline", 99, available=False),
    )
    if production:
        request = models.StorageProductionAllocationRequest(wells, target)
        output = adapters.StorageProductionAllocationAdapter().compute(request)
        key = "demand_rate"
    else:
        request = models.StorageInjectionAllocationRequest(wells, target)
        output = adapters.StorageInjectionAllocationAdapter().compute(request)
        key = "target_rate"
    result = output.result
    assert result[key] == target
    assert [row["name"] for row in result["wells"]] == ["A", "B", "offline"]
    assert [row["allocated_rate"] for row in result["wells"]] == pytest.approx(
        expected,
    )
    assert result["allocated_rate"] == pytest.approx(sum(expected))
    assert result["unmet_rate"] == unmet
    assert result["oversupply_rate"] == oversupply
    assert result["feasible"] is (unmet == 0 and oversupply == 0)
    assert result["wells"][-1]["constraint_status"] == "unavailable"
    assert result["method"] == "bounded_weighted_water_filling"
    assert output.units[key] == "1e4_sm3/d"
    assert output.metrics["available_well_count"] == 2


@pytest.mark.parametrize(
    "target,strict",
    [(0, False), (0, True), (5, False), (5, True)],
)
def test_inactive_allocation_retains_zero_and_feasibility_gate(
    storage,
    target,
    strict,
):
    adapters, models = storage
    request = models.StorageInjectionAllocationRequest(
        (models.StorageAllocationWellRequest("offline", 10, available=False),),
        target,
        require_feasible=strict,
    )
    if strict and target:
        with pytest.raises(adapters.DomainError, match="no available wells"):
            adapters.StorageInjectionAllocationAdapter().compute(request)
    else:
        output = adapters.StorageInjectionAllocationAdapter().compute(request)
        assert output.result["allocated_rate"] == 0
        assert output.result["unmet_rate"] == target
        assert output.result["feasible"] is (target == 0)
        assert output.result["wells"][0]["allocated_rate"] == 0
        assert "aggregate_minimum_rate" not in output.result
        assert output.metrics["available_well_count"] == 0


@pytest.mark.parametrize(
    "mode,ranking,pareto,recommended",
    [
        ("constrained", ["A", "B", "C"], ["A", "B"], "A"),
        ("none-feasible", ["B", "A", "C"], [], None),
        ("equal", ["A", "B", "C"], ["A", "B", "C"], "A"),
    ],
)
def test_scenario_ranking_retains_feasible_ranges_ties_and_pareto(
    storage,
    mode,
    ranking,
    pareto,
    recommended,
):
    adapters, models = storage
    metrics = [(0, 0), (10, 10), (5, 20)]
    if mode == "equal":
        metrics = [(0, 0)] * 3
    scenarios = tuple(
        models.StorageScenarioRequest(
            name,
            {"volume": volume, "cost": cost},
            {"source": name + ".json"},
        )
        for name, (volume, cost) in zip(["A", "B", "C"], metrics)
    )
    request = models.StorageScenarioOptimizationRequest(
        scenarios,
        (
            models.StorageScenarioObjective("volume"),
            models.StorageScenarioObjective("cost", direction="minimize"),
        ),
        (
            models.StorageScenarioConstraint(
                "cost",
                "<=",
                -1 if mode == "none-feasible" else 10,
            ),
        ),
        metric_unit="declared",
    )
    output = adapters.StorageScenarioOptimizationAdapter().compute(request)
    result = output.result
    assert [row["name"] for row in result["scenarios"]] == ranking
    assert result["pareto_front"] == pareto
    assert result["recommended_scenario"] == recommended
    assert [row["rank"] for row in result["scenarios"]] == [1, 2, 3]
    assert output.units == {"metric": "declared", "score": "dimensionless"}
    for row in result["scenarios"]:
        assert row["metadata"] == {"source": row["name"] + ".json"}
        assert row["pareto_optimal"] is (row["name"] in pareto)
    if mode == "constrained":
        assert result["objective_ranges"]["cost"] == {
            "minimum": 0,
            "maximum": 10,
        }
        assert [row["score"] for row in result["scenarios"]] == pytest.approx(
            [0.5, 0.5, 0.25],
        )
    elif mode == "equal":
        assert all(row["score"] == 1 for row in result["scenarios"])
    else:
        assert len(output.warnings) == 2
        assert result["objective_ranges"]["cost"] == {
            "minimum": 0,
            "maximum": 20,
        }


@pytest.mark.parametrize(
    "scenario,expected",
    [
        ("empty", "scenarios must not be empty"),
        ("objectives", "objectives must not be empty"),
        ("names", "scenario names must be unique"),
        ("weight", "volume.weight must be positive and finite"),
        ("missing", "missing metric"),
        ("nonfinite", "A.volume must be finite"),
    ],
)
def test_scenario_validation_retains_original_error_precedence(
    storage,
    scenario,
    expected,
):
    adapters, models = storage
    rows = (models.StorageScenarioRequest("A", {"volume": 0}),)
    objectives = (models.StorageScenarioObjective("volume"),)
    if scenario == "empty":
        rows = ()
        objectives = ()
    elif scenario == "objectives":
        objectives = ()
    elif scenario == "names":
        rows = rows + (models.StorageScenarioRequest(" a ", {"volume": 10}),)
        objectives = (models.StorageScenarioObjective("volume", weight=0),)
    elif scenario == "weight":
        objectives = (models.StorageScenarioObjective("volume", weight=0),)
    elif scenario == "missing":
        rows = (models.StorageScenarioRequest("A", {"other": 0}),)
    else:
        rows = (models.StorageScenarioRequest("A", {"volume": float("nan")}),)
    with pytest.raises(adapters.DomainError, match=expected):
        adapters.StorageScenarioOptimizationAdapter().compute(
            models.StorageScenarioOptimizationRequest(rows, objectives),
        )
