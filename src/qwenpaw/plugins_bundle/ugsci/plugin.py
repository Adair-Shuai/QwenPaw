# -*- coding: utf-8 -*-
"""UGSci plugin entry point.

The entry module deliberately contains registration orchestration only.
HTTP APIs, avatar processing, simulation monitoring, and skill-pool
lifecycle logic live in dedicated modules and are imported here through
compatibility aliases.
"""

from __future__ import annotations

import asyncio
import logging
from pathlib import Path
from typing import Any, Callable

from .avatar import (
    BACKGROUND_COLOR as _BG_COLOR,
    CANVAS_SIZE as _CANVAS_SIZE,
    AvatarService,
)
from .domain_engine.api import build_domain_engine_router
from .docs_api import build_docs_router
from .engine.api import EngineRequest, build_engine_router
from .sim_api import build_sim_router
from .genui.api import build_genui_router
from .health_api import build_health_router, record_route_registration
from .skill_pool import (
    remove_plugin_pool_skills,
    sync_plugin_skills_to_pool,
)
from .tool_manifest import (
    ToolManifestError,
    sync_manifest_tools_to_all_agents,
    validate_tool_bindings,
)
from .visualization import (
    build_visualization_router as _build_provider_visualization_router,
    get_visualization_tool_bindings,
)

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci")

PLUGIN_ID = "ugsci"
PLUGIN_NAME = "UGSci"
PLUGIN_DIR = Path(__file__).parent

_avatar_service = AvatarService(PLUGIN_ID, PLUGIN_DIR)

# Backwards-compatible private names used by older integrations and tests.
_sync_plugin_skills_to_pool = sync_plugin_skills_to_pool
_remove_plugin_pool_skills = remove_plugin_pool_skills
_resource_dir = _avatar_service.resource_dir
_default_avatar_path = _avatar_service.default_avatar_path
_seed_to_filename = _avatar_service.seed_to_filename
_cached_avatar_path = _avatar_service.cached_avatar_path
_fetch_avatar_png_online = _avatar_service.fetch_avatar_png_online
_get_or_fetch_avatar_png = _avatar_service.get_or_fetch_avatar_png
_preset_avatar_data = _avatar_service.preset_avatar_data
_collect_agent_names = _avatar_service.collect_agent_names
_prewarm_avatar_cache = _avatar_service.prewarm_cache
_circle_mask = _avatar_service.circle_mask
_apply_circle_clip = _avatar_service.apply_circle_clip
_team_positions = _avatar_service.team_positions
_compose_team_avatar = _avatar_service.compose_team_avatar


def _build_engine_router():
    """Compatibility wrapper for the extracted engine API."""
    return build_engine_router(PLUGIN_DIR)


def _build_avatar_router():
    """Compatibility wrapper for the extracted avatar API."""
    return _avatar_service.build_router()


def _build_domain_engine_router():
    """Build the domain engine catalog router."""
    return build_domain_engine_router()


def _build_sim_router():
    """Compatibility wrapper for the extracted simulation API."""
    return build_sim_router(PLUGIN_ID)


def _build_visualization_router():
    """Build the UGSci-owned visualization router via its provider."""
    return _build_provider_visualization_router()


class UGSciPlugin:
    """QwenPaw registration coordinator for UGSci capabilities."""

    def register(self, api) -> None:
        """Register lifecycle hooks, modes, routers, and simulation tools."""
        logger.info(
            "[%s] Plugin registered — petroleum domain enhancement active",
            PLUGIN_ID,
        )
        self._register_lifecycle_hooks(api)
        self._register_team(api)
        self._initialize_engines()
        self._register_router(
            api,
            _build_engine_router,
            "/ugsci/engines",
            "ugsci-engines",
            "engine management",
        )
        self._register_router(
            api,
            _build_avatar_router,
            "/ugsci/avatar",
            "ugsci-avatar",
            "avatar",
        )
        self._register_router(
            api,
            _build_sim_router,
            "/ugsci/sim",
            "ugsci-sim",
            "simulation monitoring",
        )
        self._register_router(
            api,
            _build_domain_engine_router,
            "/ugsci/domain-engines",
            "ugsci-domain-engines",
            "domain engine catalog",
        )
        self._register_router(
            api,
            lambda: build_genui_router(api),
            "/ugsci/genui",
            "ugsci-genui",
            "GenUI settings",
        )
        self._register_router(
            api,
            lambda: build_docs_router(PLUGIN_DIR),
            "/ugsci/docs",
            "ugsci-docs",
            "offline documentation",
        )
        self._register_router(
            api,
            lambda: build_health_router(PLUGIN_DIR),
            "/ugsci",
            "ugsci-health",
            "capability health",
        )
        # Visualization is now a UGSci-owned capability.  The user-facing
        # page keeps its historical URL, while its API is namespaced under
        # UGSci.
        self._register_router(
            api,
            _build_visualization_router,
            "/ugsci/visualization",
            "ugsci-visualization",
            "visualization",
        )
        self._register_simulation_tools(api)
        self._register_domain_tools(api)
        self._register_derivation_tools(api)
        self._register_freeform_tools(api)
        self._register_visualization_tools(api)
        self._register_genui(api)
        self._register_run_center_operations(api)
        self._register_run_center_executors(api)

    @staticmethod
    def _register_run_center_operations(api) -> None:
        """Publish the domain catalog to the optional Run Center registry.

        The registration is metadata-only and intentionally independent of
        Run Center imports.  Older hosts or test doubles without the new
        PluginApi method continue to load UGSci normally.
        """
        register_operation = getattr(api, "register_operation", None)
        if not callable(register_operation):
            logger.debug("[%s] Run Center Operation API unavailable", PLUGIN_ID)
            return
        try:
            from .domain_engine.catalog import list_engines

            registered = 0
            rejected = 0
            # Publish bridge descriptors regardless of plugin load order. The
            # host registry is durable metadata; Run Center can persist these
            # registrations when it starts later, so checking whether its
            # module is already imported makes startup behavior nondeterministic.
            bridge_operations = (
                (
                    "simulation.run",
                    {
                        "title": "数值模拟",
                        "description": "通过统一运行中心执行 Eclipse、CMG、COMSOL 等外部数值模拟",
                        "domain": "reservoir_simulation",
                        "execution_class": "external",
                        "supports_pause": False,
                        "supports_cancel": True,
                        "deterministic": False,
                        "tags": ["simulation", "eclipse", "cmg", "comsol"],
                        "input_schema": {
                            "type": "object",
                            "properties": {"model_version_id": {"type": "string"}},
                        },
                        "output_schema": {"type": "object"},
                        "units": {"system": "SI", "inputs": {}, "outputs": {}, "required": []},
                        "resources": {"pool": "local", "cpu": 1, "licenses": []},
                        "risk": {"level": "high", "requires_review": True, "reasons": ["external simulator"]},
                        "estimate": {"method": "provider", "duration_seconds": None, "confidence": None},
                    },
                    "ugsci-simulation",
                ),
                (
                    "visualization.import",
                    {
                        "title": "储层数据导入",
                        "description": "通过统一运行中心执行网格与属性文件导入",
                        "domain": "reservoir_visualization",
                        "execution_class": "filesystem",
                        "supports_pause": False,
                        "supports_cancel": True,
                        "deterministic": True,
                        "tags": ["visualization", "import", "grid"],
                        "input_schema": {"type": "object"},
                        "output_schema": {"type": "object"},
                        "units": {"system": "SI", "inputs": {}, "outputs": {}, "required": []},
                        "resources": {"pool": "local", "cpu": 1, "licenses": []},
                        "risk": {"level": "medium", "requires_review": False, "reasons": []},
                        "estimate": {"method": "provider", "duration_seconds": None, "confidence": None},
                    },
                    "ugsci.visualization",
                ),
            )
            for operation, descriptor, provider_id in bridge_operations:
                try:
                    register_operation(
                        operation,
                        descriptor,
                        provider_id=provider_id,
                        contract_version="1.0",
                    )
                    registered += 1
                except Exception as exc:
                    rejected += 1
                    logger.warning(
                        "[%s] Operation '%s' provider '%s' was rejected: %s",
                        PLUGIN_ID,
                        operation,
                        provider_id,
                        exc,
                    )
            for engine in list_engines():
                provider_id = engine.provider.id
                for operation in engine.operations:
                    try:
                        register_operation(
                            operation.id,
                            {
                                "title": operation.name,
                                "description": operation.description,
                                "domain": engine.domain,
                                "engine_id": engine.id,
                                "engine_version": engine.engine_version,
                                "execution_class": engine.execution_class,
                                "dependencies": list(engine.dependencies),
                                "tags": list(engine.tags),
                                "tool_names": list(operation.tool_names),
                                "driver_tool_names": list(
                                    operation.driver_tool_names
                                ),
                                "supports_pause": False,
                                "input_schema": {"type": "object"},
                                "output_schema": {"type": "object"},
                                "units": {"system": "SI", "inputs": {}, "outputs": {}, "required": []},
                                "resources": {"pool": "local", "cpu": 1, "licenses": []},
                                "risk": {"level": "medium", "requires_review": False, "reasons": []},
                                "estimate": {"method": "provider", "duration_seconds": None, "confidence": None},
                                "deterministic": (
                                    engine.execution_class == "deterministic"
                                ),
                            },
                            provider_id=provider_id,
                            contract_version="1.0",
                        )
                        registered += 1
                    except Exception as exc:
                        rejected += 1
                        logger.warning(
                            "[%s] Operation '%s' provider '%s' was rejected: %s",
                            PLUGIN_ID,
                            operation.id,
                            provider_id,
                            exc,
                        )
            logger.info(
                "[%s] Published %d Operation descriptor(s) to Run Center; "
                "%d rejected",
                PLUGIN_ID,
                registered,
                rejected,
            )
        except Exception as exc:
            logger.warning("[%s] Run Center Operation registration skipped: %s", PLUGIN_ID, exc)

    @staticmethod
    def _register_run_center_executors(api) -> None:
        """Register native deterministic UGSci executors with Run Center.

        The Run Center owns scheduling, cancellation, lifecycle transitions and
        durable events.  UGSci contributes only typed request construction and
        deterministic computation, keeping the plugin independent from the
        Run Center implementation details.  The registration remains optional
        so older hosts can continue loading UGSci without the new API.
        """
        register_executor = getattr(api, "register_run_executor", None)
        if not callable(register_executor):
            logger.debug("[%s] Run Center executor API unavailable", PLUGIN_ID)
            return

        try:
            from .domain.computation.service import ComputationService
            from .domain.storage_inventory.adapters import (
                EffectiveInventoryAdapter,
                InventoryAccountingAdapter,
                StorageCapacityEvaluationAdapter,
                StorageInjectionAllocationAdapter,
                StorageProductionAllocationAdapter,
                StorageScenarioOptimizationAdapter,
                StorageInventoryEvaluationAdapter,
            )
            from .domain.storage_inventory.models import (
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
            from .engine.tools.run_center_bridge import (
                execute_simulation,
                execute_visualization_import,
            )
        except Exception as exc:  # pragma: no cover - defensive plugin boundary
            logger.warning(
                "[%s] Run Center executor dependencies unavailable: %s",
                PLUGIN_ID,
                exc,
            )
            return

        service = ComputationService()
        provider_id = "ugsci-storage-inventory-core"
        simulation_provider_id = "ugsci-simulation"

        def parameters(payload: dict[str, Any] | None) -> dict[str, Any]:
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

        def effective_request(values: dict[str, Any]) -> EffectiveInventoryRequest:
            raw_layers = values.get("layers")
            if not isinstance(raw_layers, (list, tuple)):
                raise ValueError("layers must be an array")
            layers: list[EffectiveInventoryLayerRequest] = []
            for index, layer in enumerate(raw_layers):
                if not isinstance(layer, dict):
                    raise ValueError(f"layers[{index}] must be an object")
                layers.append(EffectiveInventoryLayerRequest(**layer))
            return EffectiveInventoryRequest(
                layers=tuple(layers),
                cycle_id=values.get("cycle_id", ""),
                injection_end_state_id=values.get("injection_end_state_id", ""),
                evaluation_state_id=values.get("evaluation_state_id", ""),
                gas_volume_unit=values.get("gas_volume_unit", "1e8_sm3"),
                pressure_unit=values.get("pressure_unit", "MPa"),
                pressure_basis=values.get("pressure_basis", "absolute"),
                denominator_relative_tolerance=values.get(
                    "denominator_relative_tolerance", 1e-9
                ),
                maximum_inverse_withdrawal_fraction=values.get(
                    "maximum_inverse_withdrawal_fraction", 100.0
                ),
            )

        def persist_result(context: Any, result: dict[str, Any]) -> None:
            """Persist reproducibility metadata and publish a durable result event."""
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
                        "input_fingerprint": provenance.get("input_fingerprint"),
                        "provider_id": provenance.get("provider_id"),
                        "provider_version": provenance.get("provider_version"),
                        "software_version": provenance.get("engine_version"),
                        "unit_system": provenance.get("unit_system"),
                        "coordinate_system": provenance.get("coordinate_system"),
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

        def check_cancelled(context: Any) -> None:
            checker = getattr(context, "check_cancelled", None)
            if callable(checker):
                checker()

        def accounting_handler(context: Any, payload: dict[str, Any]) -> dict[str, Any]:
            values = parameters(payload)
            check_cancelled(context)
            result = service.execute(
                "storage-inventory-evaluation",
                InventoryAccountingAdapter(),
                InventoryAccountingRequest(
                    initial_inventory=values["initial_inventory"],
                    cumulative_injected=values["cumulative_injected"],
                    cumulative_produced=values["cumulative_produced"],
                    gas_volume_unit=values.get("gas_volume_unit", "1e8_sm3"),
                ),
                method="injection_production_accounting",
            ).to_dict()
            check_cancelled(context)
            persist_result(context, result)
            check_cancelled(context)
            return result

        def effective_handler(context: Any, payload: dict[str, Any]) -> dict[str, Any]:
            values = parameters(payload)
            check_cancelled(context)
            result = service.execute(
                "storage-inventory-evaluation",
                EffectiveInventoryAdapter(),
                effective_request(values),
                method="layered_p_over_z_withdrawal",
            ).to_dict()
            check_cancelled(context)
            persist_result(context, result)
            check_cancelled(context)
            return result

        def evaluation_handler(context: Any, payload: dict[str, Any]) -> dict[str, Any]:
            values = parameters(payload)
            check_cancelled(context)
            effective = effective_request(values)
            result = service.execute(
                "storage-inventory-evaluation",
                StorageInventoryEvaluationAdapter(),
                StorageInventoryEvaluationRequest(
                    effective_inventory=effective,
                    design_capacity=values["design_capacity"],
                    book_inventory=values.get("book_inventory"),
                    initial_inventory=values.get("initial_inventory"),
                    cumulative_injected=values.get("cumulative_injected"),
                    cumulative_produced=values.get("cumulative_produced"),
                    working_gas=values.get("working_gas"),
                    design_working_gas=values.get("design_working_gas"),
                    peak_daily_rate=values.get("peak_daily_rate"),
                    design_peak_daily_rate=values.get("design_peak_daily_rate"),
                    daily_rate_unit=values.get("daily_rate_unit", "1e4_sm3/d"),
                ),
                method="separated_inventory_indicator_workflow",
            ).to_dict()
            check_cancelled(context)
            persist_result(context, result)
            check_cancelled(context)
            return result

        def capacity_handler(context: Any, payload: dict[str, Any]) -> dict[str, Any]:
            values = parameters(payload)
            check_cancelled(context)
            raw_layers = values.get("layers")
            if not isinstance(raw_layers, (list, tuple)):
                raise ValueError("layers must be an array")
            layers: list[StorageCapacityLayerRequest] = []
            for index, layer in enumerate(raw_layers):
                if not isinstance(layer, dict):
                    raise ValueError(f"layers[{index}] must be an object")
                layers.append(StorageCapacityLayerRequest(**layer))
            result = service.execute(
                "storage-capacity-evaluation",
                StorageCapacityEvaluationAdapter(),
                StorageCapacityEvaluationRequest(
                    layers=tuple(layers),
                    pore_volume_unit=values.get("pore_volume_unit", "m3"),
                    pressure_unit=values.get("pressure_unit", "MPa"),
                    temperature_unit=values.get("temperature_unit", "K"),
                    standard_pressure=values.get("standard_pressure", 0.101325),
                    standard_temperature=values.get("standard_temperature", 288.15),
                    gas_volume_unit=values.get("gas_volume_unit", "1e8_sm3"),
                ),
                method="pressure_envelope_ideal_gas_scaling",
            ).to_dict()
            check_cancelled(context)
            persist_result(context, result)
            check_cancelled(context)
            return result

        def allocation_wells(values: dict[str, Any]) -> tuple[StorageAllocationWellRequest, ...]:
            raw_wells = values.get("wells")
            if not isinstance(raw_wells, (list, tuple)):
                raise ValueError("wells must be an array")
            normalized: list[StorageAllocationWellRequest] = []
            for index, well in enumerate(raw_wells):
                if not isinstance(well, dict):
                    raise ValueError(f"wells[{index}] must be an object")
                normalized.append(
                    StorageAllocationWellRequest(
                        name=well["name"],
                        maximum_rate=well["maximum_rate"],
                        minimum_rate=well.get("minimum_rate", 0.0),
                        weight=well.get("weight", 1.0),
                        available=well.get("available", True),
                    )
                )
            return tuple(normalized)

        def injection_allocation_handler(context: Any, payload: dict[str, Any]) -> dict[str, Any]:
            values = parameters(payload)
            check_cancelled(context)
            result = service.execute(
                "storage-injection-allocation",
                StorageInjectionAllocationAdapter(),
                StorageInjectionAllocationRequest(
                    wells=allocation_wells(values),
                    target_rate=values["target_rate"],
                    rate_unit=values.get("rate_unit", "1e4_sm3/d"),
                    require_feasible=values.get("require_feasible", False),
                ),
                method="bounded_weighted_water_filling",
            ).to_dict()
            check_cancelled(context)
            persist_result(context, result)
            check_cancelled(context)
            return result

        def production_allocation_handler(context: Any, payload: dict[str, Any]) -> dict[str, Any]:
            values = parameters(payload)
            check_cancelled(context)
            result = service.execute(
                "storage-production-allocation",
                StorageProductionAllocationAdapter(),
                StorageProductionAllocationRequest(
                    wells=allocation_wells(values),
                    demand_rate=values["demand_rate"],
                    rate_unit=values.get("rate_unit", "1e4_sm3/d"),
                    require_feasible=values.get("require_feasible", False),
                ),
                method="bounded_weighted_water_filling",
            ).to_dict()
            check_cancelled(context)
            persist_result(context, result)
            check_cancelled(context)
            return result

        def scenario_handler(context: Any, payload: dict[str, Any]) -> dict[str, Any]:
            values = parameters(payload)
            check_cancelled(context)
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
                    StorageScenarioRequest(
                        name=item["name"],
                        metrics=item["metrics"],
                        metadata=item.get("metadata"),
                    )
                )
            objectives: list[StorageScenarioObjective] = []
            for index, item in enumerate(raw_objectives):
                if not isinstance(item, dict):
                    raise ValueError(f"objectives[{index}] must be an object")
                objectives.append(
                    StorageScenarioObjective(
                        key=item["key"],
                        direction=item.get("direction", "maximize"),
                        weight=item.get("weight", 1.0),
                    )
                )
            constraints: list[StorageScenarioConstraint] = []
            if not isinstance(raw_constraints, (list, tuple)):
                raise ValueError("constraints must be an array")
            for index, item in enumerate(raw_constraints):
                if not isinstance(item, dict):
                    raise ValueError(f"constraints[{index}] must be an object")
                constraints.append(
                    StorageScenarioConstraint(
                        key=item["key"],
                        operator=item["operator"],
                        limit=item["limit"],
                    )
                )
            result = service.execute(
                "storage-scenario-optimization",
                StorageScenarioOptimizationAdapter(),
                StorageScenarioOptimizationRequest(
                    scenarios=tuple(scenarios),
                    objectives=tuple(objectives),
                    constraints=tuple(constraints),
                    metric_unit=values.get("metric_unit", ""),
                ),
                method="constraint_screening_weighted_score_pareto",
            ).to_dict()
            check_cancelled(context)
            persist_result(context, result)
            check_cancelled(context)
            return result

        handlers = {
            "storage.inventory.accounting": accounting_handler,
            "storage.inventory.effective_controlled": effective_handler,
            "storage.inventory.evaluate": evaluation_handler,
            "storage.capacity.evaluate": capacity_handler,
            "storage.injection_allocation.optimize": injection_allocation_handler,
            "storage.production_allocation.optimize": production_allocation_handler,
            "storage.scenario.optimize": scenario_handler,
        }
        # Register the simulation bridge whenever the host exposes executable
        # Run adapters.  The handler is capability based and remains inert on
        # older hosts; delaying registration until the Run Center module is
        # already loaded would lose the executor when plugins load in the
        # opposite order.  Its provider id must match the native Run payload,
        # otherwise Run Center cannot resolve the adapter and launch falls
        # back to the legacy in-process launcher.
        handlers["simulation.run"] = execute_simulation
        # Register the visualization bridge unconditionally when the host
        # exposes the executor API.  The bridge resolves the live Run Center
        # runtime only at execution time, so making registration depend on
        # plugin load order would lose the adapter when UGSci loads first.
        handlers["visualization.import"] = execute_visualization_import
        registered = 0
        for operation, handler in handlers.items():
            try:
                register_executor(
                    operation,
                    handler,
                    provider_id=(
                        simulation_provider_id
                        if operation == "simulation.run"
                        else "ugsci.visualization"
                        if operation == "visualization.import"
                        else provider_id
                    ),
                )
                registered += 1
            except Exception as exc:
                logger.warning(
                    "[%s] Run Center executor '%s' provider '%s' was rejected: %s",
                    PLUGIN_ID,
                    operation,
                    provider_id,
                    exc,
                )
        logger.info(
            "[%s] Registered %d native Run Center storage-inventory executor(s)",
            PLUGIN_ID,
            registered,
        )

    def _register_lifecycle_hooks(self, api) -> None:
        """Register startup and uninstall hooks independently."""
        try:
            api.register_startup_hook(
                hook_name="ugsci_sync_skills_to_pool",
                callback=self._on_startup_sync_skills,
                priority=80,
            )
        except Exception as exc:
            logger.debug(
                "[%s] Startup skill sync hook unavailable: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )
        try:
            api.register_startup_hook(
                hook_name="ugsci_sync_manifest_tools",
                callback=self._on_startup_sync_manifest_tools,
                priority=95,
            )
        except Exception as exc:
            logger.debug(
                "[%s] Manifest tool sync hook unavailable: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )
        try:
            api.register_uninstall_hook(
                hook_name="ugsci_remove_pool_skills",
                callback=self._on_uninstall_remove_skills,
            )
        except Exception as exc:
            logger.debug(
                "[%s] Uninstall hook unavailable: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )
        try:
            api.register_uninstall_hook(
                hook_name="ugsci_dispose_genui",
                callback=self._on_uninstall_dispose_genui,
            )
        except Exception as exc:
            logger.debug(
                "[%s] GenUI dispose hook unavailable: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )
        try:
            api.register_startup_hook(
                hook_name="ugsci_init",
                callback=self._on_startup,
                # UGSci registers runtime tools from this hook.  Run after
                # plugins such as CloudPaw that persist their built-in agent
                # definitions during startup; otherwise their stale
                # load/modify/save cycle can overwrite the tool entries that
                # PluginApi just added to agent.json.
                priority=90,
            )
        except Exception as exc:
            logger.debug(
                "[%s] Startup initialization hook unavailable: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    @staticmethod
    def _register_team(api) -> None:
        """Register the OMP-backed Team mode and its state API."""
        try:
            from .team.mode import UGSciTeamMode

            api.register_mode(UGSciTeamMode)
            logger.info(
                "[%s] UGSci Team mode registered (/ugsci-team)",
                PLUGIN_ID,
            )
        except Exception as exc:
            logger.error(
                "[%s] Failed to register UGSci Team mode: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )
        try:
            from .team.api import build_team_router

            api.register_http_router(
                build_team_router(),
                prefix="/ugsci/team",
                tags=["ugsci-team"],
            )
            logger.info(
                "[%s] HTTP router registered at /api/ugsci/team",
                PLUGIN_ID,
            )
            record_route_registration("/ugsci/team", success=True)
        except Exception as exc:
            record_route_registration(
                "/ugsci/team",
                success=False,
                error=f"{type(exc).__name__}: {exc}",
            )
            logger.error(
                "[%s] Failed to register team workflow HTTP router: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    @staticmethod
    def _initialize_engines() -> None:
        """Create default engine records when they do not yet exist."""
        try:
            from .engine import init_default_engines

            count = init_default_engines()
            if count:
                logger.info(
                    "[%s] Created %d default engine(s)",
                    PLUGIN_ID,
                    count,
                )
        except Exception as exc:
            logger.error(
                "[%s] Failed to init default engines: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    @staticmethod
    def _register_router(
        api,
        factory: Callable[[], Any],
        prefix: str,
        tag: str,
        label: str,
    ) -> None:
        """Register one independently recoverable HTTP capability."""
        try:
            api.register_http_router(
                factory(),
                prefix=prefix,
                tags=[tag],
            )
            logger.info(
                "[%s] HTTP router registered at /api%s",
                PLUGIN_ID,
                prefix,
            )
            record_route_registration(prefix, success=True)
        except Exception as exc:
            record_route_registration(
                prefix,
                success=False,
                error=f"{type(exc).__name__}: {exc}",
            )
            logger.error(
                "[%s] Failed to register %s HTTP router: %s",
                PLUGIN_ID,
                label,
                exc,
                exc_info=True,
            )

    @staticmethod
    def _register_tool_group(
        api,
        group: str,
        bindings: dict[str, Callable[..., Any]],
    ) -> int:
        """Bind implementations to one manifest-declared tool group.

        Names and all display/governance metadata come from ``plugin.json``.
        A declaration/implementation mismatch fails the whole group so drift
        cannot produce tools that exist only in the runtime or only in the UI.
        """
        specs = validate_tool_bindings(
            PLUGIN_DIR,
            bindings,
            groups={group},
        )

        registered = 0
        for spec in specs:
            try:
                api.register_tool(
                    tool_name=spec.name,
                    tool_func=bindings[spec.name],
                    description=spec.description,
                    icon=spec.icon,
                    enabled=spec.enabled_by_default,
                    tool_type=spec.tool_type,
                    target_param=spec.target_param,
                )
                registered += 1
            except Exception as exc:
                logger.error(
                    "[%s] Failed to register %s tool '%s': %s",
                    PLUGIN_ID,
                    group,
                    spec.name,
                    exc,
                )
        return registered

    @classmethod
    def _register_simulation_tools(cls, api) -> None:
        """Register manifest-declared simulation tool implementations."""
        try:
            from .engine.tools import (
                analyze_simulation,
                check_simulation_status,
                edit_simulation_deck,
                launch_simulation,
                read_simulation_results,
                wait_for_simulation,
            )

            bindings = {
                "launch_simulation": launch_simulation,
                "check_simulation_status": check_simulation_status,
                "wait_for_simulation": wait_for_simulation,
                "read_simulation_results": read_simulation_results,
                "edit_simulation_deck": edit_simulation_deck,
                "analyze_simulation": analyze_simulation,
            }
            registered = cls._register_tool_group(api, "simulation", bindings)
            logger.info(
                "[%s] Simulation control tools registered (%d tools)",
                PLUGIN_ID,
                registered,
            )
        except Exception as exc:
            logger.error(
                "[%s] Failed to register simulation tools: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    @classmethod
    def _register_domain_tools(cls, api) -> None:
        """Register manifest-declared domain computing implementations."""
        try:
            from .domain.tool_bindings import get_domain_tool_bindings

            bindings = get_domain_tool_bindings()
            registered = cls._register_tool_group(api, "domain", bindings)
            logger.info(
                "[%s] Domain computing tools registered (%d tools)",
                PLUGIN_ID,
                registered,
            )
        except Exception as exc:
            logger.error(
                "[%s] Failed to register domain tools: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    @classmethod
    def _register_derivation_tools(cls, api) -> None:
        """Register observable, step-traceable derivation tools."""
        try:
            from .domain.trace.tools import (
                ugsci_list_derivation_formulas,
                ugsci_replay_calculation,
                ugsci_trace_calculation,
            )

            bindings = {
                "ugsci_trace_calculation": ugsci_trace_calculation,
                "ugsci_list_derivation_formulas": ugsci_list_derivation_formulas,
                "ugsci_replay_calculation": ugsci_replay_calculation,
            }
            registered = cls._register_tool_group(api, "derivation", bindings)
            logger.info(
                "[%s] Derivation tools registered (%d tools)",
                PLUGIN_ID,
                registered,
            )
        except Exception as exc:
            logger.error(
                "[%s] Failed to register derivation tools: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    @classmethod
    def _register_freeform_tools(cls, api) -> None:
        """Register freeform (agent-authored) symbolic derivation tools.

        Freeform tools are opt-in (disabled by default).  When the master
        switch ``ugsci.trace.freeform_enabled`` is off, the tools still
        register so the agent can discover them, but every call returns a
        ``feature_unavailable`` response.
        """
        try:
            from .domain.trace.freeform.tools import (
                ugsci_derive_formula,
                ugsci_evaluate_formula,
                ugsci_formula_preview,
                ugsci_transform_formula,
            )

            bindings = {
                "ugsci_derive_formula": ugsci_derive_formula,
                "ugsci_evaluate_formula": ugsci_evaluate_formula,
                "ugsci_transform_formula": ugsci_transform_formula,
                "ugsci_formula_preview": ugsci_formula_preview,
            }
            registered = cls._register_tool_group(api, "freeform", bindings)
            logger.info(
                "[%s] Freeform tools registered (%d tools)",
                PLUGIN_ID,
                registered,
            )
        except Exception as exc:
            logger.error(
                "[%s] Failed to register freeform tools: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    @classmethod
    def _register_visualization_tools(cls, api) -> None:
        try:
            bindings = get_visualization_tool_bindings()
            registered = cls._register_tool_group(api, "visualization", bindings)
            logger.info(
                "[%s] Visualization tools registered (%d tools)",
                PLUGIN_ID,
                registered,
            )
        except Exception as exc:
            logger.error(
                "[%s] Failed to register visualization tools: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    @staticmethod
    def _register_genui(api) -> None:
        """Register GenUI tools and prompt section as an isolated UGSci module."""
        try:
            from .genui.registration import register_genui
            register_genui(api, plugin_id=PLUGIN_ID)
        except Exception as exc:
            logger.error(
                "[%s] Failed to register GenUI module: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    async def _on_startup(self) -> None:
        """Warm assets and reattach durable simulation monitors."""
        logger.info("[%s] Startup hook executed", PLUGIN_ID)
        try:
            from .engine.tools.launcher import recover_persisted_jobs

            recovered = recover_persisted_jobs()
            if recovered:
                logger.info("[%s] Recovered %d simulation job(s)", PLUGIN_ID, recovered)
        except Exception:
            logger.exception("[%s] Failed to recover simulation jobs", PLUGIN_ID)
        await asyncio.to_thread(_prewarm_avatar_cache)

    async def _on_startup_sync_skills(self) -> None:
        """Synchronize bundled skills into the shared pool."""
        skills_dir = PLUGIN_DIR / "skills"
        if not skills_dir.exists():
            return
        try:
            count = await asyncio.to_thread(
                _sync_plugin_skills_to_pool,
                PLUGIN_ID,
                skills_dir,
            )
            if count:
                logger.info(
                    "[%s] Synced %d skill(s) to skill pool",
                    PLUGIN_ID,
                    count,
                )
        except Exception as exc:
            logger.error(
                "[%s] Failed to sync skills to pool: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    async def _on_startup_sync_manifest_tools(self) -> None:
        """Persist every missing manifest tool for each configured Agent.

        Plugin tool registration runs before a current-Agent context exists,
        so ``PluginApi.register_tool`` cannot persist per-Agent preferences at
        that point.  Synchronising from the plugin manifest closes that gap
        without changing any existing enabled/disabled choice.
        """
        await asyncio.to_thread(self._sync_manifest_tools_to_all_agents)

    @staticmethod
    def _sync_manifest_tools_to_all_agents() -> None:
        """Synchronize the complete declarative catalog to Agent configs."""
        try:
            changed_agents = sync_manifest_tools_to_all_agents(PLUGIN_DIR)
            logger.info(
                "[%s] Synced manifest tools to %d Agent config(s)",
                PLUGIN_ID,
                changed_agents,
            )
        except ToolManifestError as exc:
            logger.error("[%s] Cannot sync tool manifest: %s", PLUGIN_ID, exc)
        except Exception as exc:  # noqa: BLE001
            logger.error(
                "[%s] Failed to sync manifest tools: %s",
                PLUGIN_ID,
                exc,
                exc_info=True,
            )

    async def _on_startup_sync_domain_tools(self) -> None:
        """Backward-compatible alias for the old startup callback name."""
        await self._on_startup_sync_manifest_tools()

    @staticmethod
    def _sync_domain_tools_to_all_agents() -> None:
        """Backward-compatible alias for integrations using the old name."""
        UGSciPlugin._sync_manifest_tools_to_all_agents()

    @staticmethod
    def _on_uninstall_remove_skills(
        plugin_id: str,
        delete_files: bool = False,
    ) -> None:
        """Remove plugin-owned pool skills during uninstall."""
        del delete_files
        try:
            count = _remove_plugin_pool_skills(plugin_id)
            if count:
                logger.info(
                    "[%s] Removed %d skill(s) from pool",
                    plugin_id,
                    count,
                )
        except Exception as exc:
            logger.error(
                "Failed to remove pool skills for '%s': %s",
                plugin_id,
                exc,
                exc_info=True,
            )

    @staticmethod
    def _on_uninstall_dispose_genui(
        plugin_id: str,
        delete_files: bool = False,
    ) -> None:
        """Release GenUI tools, prompt section, and snapshot store."""
        del delete_files
        try:
            from .genui.registration import dispose_genui

            dispose_genui(plugin_id=plugin_id)
        except Exception as exc:
            logger.error(
                "Failed to dispose GenUI for '%s': %s",
                plugin_id,
                exc,
                exc_info=True,
            )


plugin = UGSciPlugin()

__all__ = ["EngineRequest", "UGSciPlugin", "plugin", "build_domain_engine_router"]
