# -*- coding: utf-8 -*-
"""Native storage handlers for the host-owned Run Center."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, Callable

if TYPE_CHECKING:
    from ..computation.service import ComputationService
    from .models import (
        EffectiveInventoryLayerRequest,
        EffectiveInventoryRequest,
        StorageCapacityLayerRequest,
        StorageAllocationWellRequest,
        StorageScenarioConstraint,
        StorageScenarioObjective,
        StorageScenarioRequest,
    )


class StorageRunExecutors:
    """Bind captured request and adapter types to one computation service."""

    service: ComputationService

    def __init__(self) -> None:
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

        self.EffectiveInventoryAdapter = EffectiveInventoryAdapter
        self.InventoryAccountingAdapter = InventoryAccountingAdapter
        self.StorageCapacityEvaluationAdapter = (
            StorageCapacityEvaluationAdapter
        )
        self.StorageInjectionAllocationAdapter = (
            StorageInjectionAllocationAdapter
        )
        self.StorageProductionAllocationAdapter = (
            StorageProductionAllocationAdapter
        )
        self.StorageScenarioOptimizationAdapter = (
            StorageScenarioOptimizationAdapter
        )
        self.StorageInventoryEvaluationAdapter = (
            StorageInventoryEvaluationAdapter
        )
        self.EffectiveInventoryLayerRequest = EffectiveInventoryLayerRequest
        self.EffectiveInventoryRequest = EffectiveInventoryRequest
        self.InventoryAccountingRequest = InventoryAccountingRequest
        self.StorageCapacityEvaluationRequest = (
            StorageCapacityEvaluationRequest
        )
        self.StorageCapacityLayerRequest = StorageCapacityLayerRequest
        self.StorageAllocationWellRequest = StorageAllocationWellRequest
        self.StorageInjectionAllocationRequest = (
            StorageInjectionAllocationRequest
        )
        self.StorageProductionAllocationRequest = (
            StorageProductionAllocationRequest
        )
        self.StorageScenarioConstraint = StorageScenarioConstraint
        self.StorageScenarioObjective = StorageScenarioObjective
        self.StorageScenarioOptimizationRequest = (
            StorageScenarioOptimizationRequest
        )
        self.StorageScenarioRequest = StorageScenarioRequest
        self.StorageInventoryEvaluationRequest = (
            StorageInventoryEvaluationRequest
        )

    def bind(
        self,
        service: ComputationService,
    ) -> dict[str, Callable[..., Any]]:
        self.service = service
        return {
            "storage.inventory.accounting": self.accounting_handler,
            "storage.inventory.effective_controlled": self.effective_handler,
            "storage.inventory.evaluate": self.evaluation_handler,
            "storage.capacity.evaluate": self.capacity_handler,
            "storage.injection_allocation.optimize": (
                self.injection_allocation_handler
            ),
            "storage.production_allocation.optimize": (
                self.production_allocation_handler
            ),
            "storage.scenario.optimize": self.scenario_handler,
        }

    def parameters(self, payload: dict[str, Any] | None) -> dict[str, Any]:
        """Flatten supported Run payload envelopes into operation inputs."""
        source = dict(payload or {})
        merged = dict(source)
        snapshot = source.get("input_snapshot")
        if isinstance(snapshot, dict):
            merged.update(snapshot)
            snapshot_parameters = snapshot.get("parameters")
            if isinstance(snapshot_parameters, dict):
                merged.update(snapshot_parameters)
        explicit_parameters = source.get("parameters")
        if isinstance(explicit_parameters, dict):
            # Explicit parameters are the highest-precedence input source.
            merged.update(explicit_parameters)
        return merged

    def effective_request(
        self,
        values: dict[str, Any],
    ) -> EffectiveInventoryRequest:
        raw_layers = values.get("layers")
        if not isinstance(raw_layers, (list, tuple)):
            raise ValueError("layers must be an array")
        layers: list[EffectiveInventoryLayerRequest] = []
        for index, layer in enumerate(raw_layers):
            if not isinstance(layer, dict):
                raise ValueError(f"layers[{index}] must be an object")
            layers.append(self.EffectiveInventoryLayerRequest(**layer))
        return self.EffectiveInventoryRequest(
            layers=tuple(layers),
            cycle_id=values.get("cycle_id", ""),
            injection_end_state_id=values.get(
                "injection_end_state_id",
                "",
            ),
            evaluation_state_id=values.get("evaluation_state_id", ""),
            gas_volume_unit=values.get("gas_volume_unit", "1e8_sm3"),
            pressure_unit=values.get("pressure_unit", "MPa"),
            pressure_basis=values.get("pressure_basis", "absolute"),
            denominator_relative_tolerance=values.get(
                "denominator_relative_tolerance",
                1e-9,
            ),
            maximum_inverse_withdrawal_fraction=values.get(
                "maximum_inverse_withdrawal_fraction",
                100.0,
            ),
        )

    def persist_result(self, context: Any, result: dict[str, Any]) -> None:
        (
            "Persist reproducibility metadata and publish a durable "
            "result event."
        )
        provenance = dict(result.get("provenance") or {})
        known = {
            "input_fingerprint",
            "provider_id",
            "provider_version",
            "engine_version",
            "unit_system",
            "coordinate_system",
        }
        repository = getattr(context, "repository", None)
        upsert_provenance = getattr(repository, "upsert_provenance", None)
        if callable(upsert_provenance):
            upsert_provenance(
                context.run_id,
                {
                    "input_fingerprint": provenance.get(
                        "input_fingerprint",
                    ),
                    "provider_id": provenance.get("provider_id"),
                    "provider_version": provenance.get("provider_version"),
                    "software_version": provenance.get("engine_version"),
                    "unit_system": provenance.get("unit_system"),
                    "coordinate_system": provenance.get(
                        "coordinate_system",
                    ),
                    "metadata": {
                        key: value
                        for key, value in provenance.items()
                        if key not in known
                    },
                },
            )
        emit = getattr(context, "emit", None)
        if callable(emit):
            emit(
                "result.ready",
                {
                    "operation": result.get("operation"),
                    "result": result.get("result"),
                    "units": result.get("units"),
                    "metrics": result.get("metrics"),
                    "warnings": result.get("warnings"),
                    "provenance": result.get("provenance"),
                    "artifacts": result.get("artifacts"),
                },
            )

    def check_cancelled(self, context: Any) -> None:
        checker = getattr(context, "check_cancelled", None)
        if callable(checker):
            checker()

    def accounting_handler(
        self,
        context: Any,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        values = self.parameters(payload)
        self.check_cancelled(context)
        result = self.service.execute(
            "storage-inventory-evaluation",
            self.InventoryAccountingAdapter(),
            self.InventoryAccountingRequest(
                initial_inventory=values["initial_inventory"],
                cumulative_injected=values["cumulative_injected"],
                cumulative_produced=values["cumulative_produced"],
                gas_volume_unit=values.get("gas_volume_unit", "1e8_sm3"),
            ),
            method="injection_production_accounting",
        ).to_dict()
        self.check_cancelled(context)
        self.persist_result(context, result)
        self.check_cancelled(context)
        return result

    def effective_handler(
        self,
        context: Any,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        values = self.parameters(payload)
        self.check_cancelled(context)
        result = self.service.execute(
            "storage-inventory-evaluation",
            self.EffectiveInventoryAdapter(),
            self.effective_request(values),
            method="layered_p_over_z_withdrawal",
        ).to_dict()
        self.check_cancelled(context)
        self.persist_result(context, result)
        self.check_cancelled(context)
        return result

    def evaluation_handler(
        self,
        context: Any,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        values = self.parameters(payload)
        self.check_cancelled(context)
        effective = self.effective_request(values)
        result = self.service.execute(
            "storage-inventory-evaluation",
            self.StorageInventoryEvaluationAdapter(),
            self.StorageInventoryEvaluationRequest(
                effective_inventory=effective,
                design_capacity=values["design_capacity"],
                book_inventory=values.get("book_inventory"),
                initial_inventory=values.get("initial_inventory"),
                cumulative_injected=values.get("cumulative_injected"),
                cumulative_produced=values.get("cumulative_produced"),
                working_gas=values.get("working_gas"),
                design_working_gas=values.get("design_working_gas"),
                peak_daily_rate=values.get("peak_daily_rate"),
                design_peak_daily_rate=values.get(
                    "design_peak_daily_rate",
                ),
                daily_rate_unit=values.get("daily_rate_unit", "1e4_sm3/d"),
            ),
            method="separated_inventory_indicator_workflow",
        ).to_dict()
        self.check_cancelled(context)
        self.persist_result(context, result)
        self.check_cancelled(context)
        return result

    def capacity_handler(
        self,
        context: Any,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        values = self.parameters(payload)
        self.check_cancelled(context)
        raw_layers = values.get("layers")
        if not isinstance(raw_layers, (list, tuple)):
            raise ValueError("layers must be an array")
        layers: list[StorageCapacityLayerRequest] = []
        for index, layer in enumerate(raw_layers):
            if not isinstance(layer, dict):
                raise ValueError(f"layers[{index}] must be an object")
            layers.append(self.StorageCapacityLayerRequest(**layer))
        result = self.service.execute(
            "storage-capacity-evaluation",
            self.StorageCapacityEvaluationAdapter(),
            self.StorageCapacityEvaluationRequest(
                layers=tuple(layers),
                pore_volume_unit=values.get("pore_volume_unit", "m3"),
                pressure_unit=values.get("pressure_unit", "MPa"),
                temperature_unit=values.get("temperature_unit", "K"),
                standard_pressure=values.get(
                    "standard_pressure",
                    0.101325,
                ),
                standard_temperature=values.get(
                    "standard_temperature",
                    288.15,
                ),
                gas_volume_unit=values.get("gas_volume_unit", "1e8_sm3"),
            ),
            method="pressure_envelope_ideal_gas_scaling",
        ).to_dict()
        self.check_cancelled(context)
        self.persist_result(context, result)
        self.check_cancelled(context)
        return result

    def allocation_wells(
        self,
        values: dict[str, Any],
    ) -> tuple[StorageAllocationWellRequest, ...]:
        raw_wells = values.get("wells")
        if not isinstance(raw_wells, (list, tuple)):
            raise ValueError("wells must be an array")
        normalized: list[StorageAllocationWellRequest] = []
        for index, well in enumerate(raw_wells):
            if not isinstance(well, dict):
                raise ValueError(f"wells[{index}] must be an object")
            normalized.append(
                self.StorageAllocationWellRequest(
                    name=well["name"],
                    maximum_rate=well["maximum_rate"],
                    minimum_rate=well.get("minimum_rate", 0.0),
                    weight=well.get("weight", 1.0),
                    available=well.get("available", True),
                ),
            )
        return tuple(normalized)

    def injection_allocation_handler(
        self,
        context: Any,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        values = self.parameters(payload)
        self.check_cancelled(context)
        result = self.service.execute(
            "storage-injection-allocation",
            self.StorageInjectionAllocationAdapter(),
            self.StorageInjectionAllocationRequest(
                wells=self.allocation_wells(values),
                target_rate=values["target_rate"],
                rate_unit=values.get("rate_unit", "1e4_sm3/d"),
                require_feasible=values.get("require_feasible", False),
            ),
            method="bounded_weighted_water_filling",
        ).to_dict()
        self.check_cancelled(context)
        self.persist_result(context, result)
        self.check_cancelled(context)
        return result

    def production_allocation_handler(
        self,
        context: Any,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        values = self.parameters(payload)
        self.check_cancelled(context)
        result = self.service.execute(
            "storage-production-allocation",
            self.StorageProductionAllocationAdapter(),
            self.StorageProductionAllocationRequest(
                wells=self.allocation_wells(values),
                demand_rate=values["demand_rate"],
                rate_unit=values.get("rate_unit", "1e4_sm3/d"),
                require_feasible=values.get("require_feasible", False),
            ),
            method="bounded_weighted_water_filling",
        ).to_dict()
        self.check_cancelled(context)
        self.persist_result(context, result)
        self.check_cancelled(context)
        return result

    def scenario_handler(
        self,
        context: Any,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        values = self.parameters(payload)
        self.check_cancelled(context)
        raw_scenarios = values.get("scenarios")
        raw_objectives = values.get("objectives")
        raw_constraints = values.get("constraints", [])
        if not isinstance(raw_scenarios, (list, tuple)):
            raise ValueError("scenarios must be an array")
        if not isinstance(raw_objectives, (list, tuple)):
            raise ValueError("objectives must be an array")
        scenarios: list[StorageScenarioRequest] = []
        for index, item in enumerate(raw_scenarios):
            if not isinstance(item, dict):
                raise ValueError(f"scenarios[{index}] must be an object")
            scenarios.append(
                self.StorageScenarioRequest(
                    name=item["name"],
                    metrics=item["metrics"],
                    metadata=item.get("metadata"),
                ),
            )
        objectives: list[StorageScenarioObjective] = []
        for index, item in enumerate(raw_objectives):
            if not isinstance(item, dict):
                raise ValueError(f"objectives[{index}] must be an object")
            objectives.append(
                self.StorageScenarioObjective(
                    key=item["key"],
                    direction=item.get("direction", "maximize"),
                    weight=item.get("weight", 1.0),
                ),
            )
        constraints: list[StorageScenarioConstraint] = []
        if not isinstance(raw_constraints, (list, tuple)):
            raise ValueError("constraints must be an array")
        for index, item in enumerate(raw_constraints):
            if not isinstance(item, dict):
                raise ValueError(f"constraints[{index}] must be an object")
            constraints.append(
                self.StorageScenarioConstraint(
                    key=item["key"],
                    operator=item["operator"],
                    limit=item["limit"],
                ),
            )
        result = self.service.execute(
            "storage-scenario-optimization",
            self.StorageScenarioOptimizationAdapter(),
            self.StorageScenarioOptimizationRequest(
                scenarios=tuple(scenarios),
                objectives=tuple(objectives),
                constraints=tuple(constraints),
                metric_unit=values.get("metric_unit", ""),
            ),
            method="constraint_screening_weighted_score_pareto",
        ).to_dict()
        self.check_cancelled(context)
        self.persist_result(context, result)
        self.check_cancelled(context)
        return result


__all__ = ["StorageRunExecutors"]
