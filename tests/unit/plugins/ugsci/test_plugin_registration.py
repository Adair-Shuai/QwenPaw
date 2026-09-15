# -*- coding: utf-8 -*-
"""Registration-chain test for the bundled UGSci plugin."""

from __future__ import annotations

import inspect
import importlib.util
import json
import sys
from pathlib import Path
from types import SimpleNamespace
from typing import Any

from plugins.bundle.ugsci import engine
from plugins.bundle.ugsci.plugin import UGSciPlugin
from plugins.bundle.ugsci.team.mode import UGSciTeamMode


class RecordingPluginApi:
    """Small PluginApi stand-in that records public registrations."""

    def __init__(self) -> None:
        self.modes: list[type] = []
        self.routers: dict[str, Any] = {}
        self.tools: list[str] = []
        self.tool_options: dict[str, dict[str, Any]] = {}
        self.startup_hooks: list[str] = []
        self.uninstall_hooks: list[str] = []
        self.operations: list[str] = []
        self.run_executors: dict[str, Any] = {}
        self.run_executor_options: dict[str, dict[str, Any]] = {}
        self.reject_operation: str | None = None

    def register_mode(self, mode: type) -> None:
        self.modes.append(mode)

    def register_http_router(
        self,
        router: Any,
        *,
        prefix: str,
        tags: list[str],
    ) -> None:
        del tags
        self.routers[prefix] = router

    def register_tool(self, *, tool_name: str, **kwargs: Any) -> None:
        self.tools.append(tool_name)
        self.tool_options[tool_name] = kwargs

    def register_startup_hook(self, *, hook_name: str, **_kwargs: Any) -> None:
        self.startup_hooks.append(hook_name)

    def register_uninstall_hook(
        self,
        *,
        hook_name: str,
        **_kwargs: Any,
    ) -> None:
        self.uninstall_hooks.append(hook_name)

    def register_operation(
        self,
        operation: str,
        _descriptor: dict[str, Any],
        **_kwargs: Any,
    ) -> None:
        self.operations.append(operation)
        if operation == self.reject_operation:
            raise ValueError("claimed by another plugin")

    def register_run_executor(
        self,
        operation: str,
        handler: Any,
        **kwargs: Any,
    ) -> None:
        self.run_executors[operation] = handler
        self.run_executor_options[operation] = kwargs


def _load_run_center_module():
    name = "test_ugsci_run_center_runtime"
    if name in sys.modules:
        return sys.modules[name]
    root = (
        Path(__file__).parents[4] / "plugins" / "bundle" / "qwenpaw-run-center"
    )
    spec = importlib.util.spec_from_file_location(
        name,
        root / "runtime" / "__init__.py",
        submodule_search_locations=[str(root / "runtime")],
    )
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def test_plugin_registers_team_mode_router_and_simulation_tools(
    monkeypatch,
) -> None:
    monkeypatch.setattr(engine, "init_default_engines", lambda: 0)
    api = RecordingPluginApi()

    UGSciPlugin().register(api)

    assert UGSciTeamMode in api.modes
    assert {
        "/ugsci/team",
        "/ugsci/engines",
        "/ugsci/avatar",
        "/ugsci/sim",
        "/ugsci/domain-engines",
        "/ugsci/visualization",
        "/ugsci",
    } <= api.routers.keys()
    team_paths = {route.path for route in api.routers["/ugsci/team"].routes}
    assert {"/preset-teams", "/roles", "/state"} <= team_paths
    engine_paths = {
        route.path for route in api.routers["/ugsci/engines"].routes
    }
    assert {
        "/list",
        "/summary",
        "/detect",
        "/detect/refresh",
        "/icon/{engine_id}",
        "/{engine_id}",
        "/",
    } <= engine_paths
    avatar_paths = {
        route.path for route in api.routers["/ugsci/avatar"].routes
    }
    assert {"/{seed}", "/team/{team_id}"} <= avatar_paths
    sim_paths = {route.path for route in api.routers["/ugsci/sim"].routes}
    assert {"/jobs", "/jobs/{job_id}/stream"} <= sim_paths
    # Domain engine router routes
    domain_paths = {
        route.path for route in api.routers["/ugsci/domain-engines"].routes
    }
    assert {
        "/list",
        "/{engine_id}",
        "/probe",
        "/{engine_id}/probe",
    } <= domain_paths
    health_paths = {route.path for route in api.routers["/ugsci"].routes}
    assert "/health" in health_paths
    # Simulation tools (enabled by default)
    assert {
        "launch_simulation",
        "check_simulation_status",
        "wait_for_simulation",
        "read_simulation_results",
        "edit_simulation_deck",
        "analyze_simulation",
        "import_subsurface_dataset",
        "open_oilgas_visualization",
        "set_visualization_property",
        "set_visualization_timestep",
        "configure_visualization_view",
        "get_visualization_command_status",
        "focus_visualization_object",
        "create_intersection",
        "capture_visualization",
        "run_visualization_benchmark",
        "filter_visualization",
        "generate_visualization_report",
        "save_visualization_report",
    } <= set(api.tools)
    # Domain computing tools (disabled by default)
    assert {
        "ugsci_welllog_read",
        "ugsci_welllog_validate",
        "ugsci_welllog_export",
        "ugsci_decline_fit",
        "ugsci_decline_forecast",
        "ugsci_decline_eur",
        "ugsci_symbolic_polynomial_roots",
        "ugsci_bayesian_normal_estimate",
        "ugsci_multiobjective_quadratic",
        "ugsci_queue_simulate",
        "ugsci_graph_analyze",
        "ugsci_geospatial_points_analyze",
        "ugsci_ml_regression",
        "ugsci_statistical_regression",
        "ugsci_convert_units",
        "ugsci_volumetric_oil_in_place",
        "ugsci_oil_material_balance",
        "ugsci_gas_material_balance",
        "ugsci_black_oil_pvt",
        "ugsci_vogel_ipr",
        "ugsci_nodal_analysis",
        "ugsci_conservation_check",
        "ugsci_storage_capacity_evaluate",
        "ugsci_neqsim_flash",
        "ugsci_neqsim_pvt",
        "ugsci_neqsim_phase_envelope",
        "ugsci_neqsim_process_simulate",
        "ugsci_neqsim_pipeline_flow",
    } <= set(api.tools)
    # Derivation (traceable) tools
    assert {
        "ugsci_trace_calculation",
        "ugsci_list_derivation_formulas",
    } <= set(api.tools)
    assert {
        "ugsci_sync_skills_to_pool",
        "ugsci_sync_manifest_tools",
        "ugsci_init",
    } <= set(api.startup_hooks)
    assert "ugsci_remove_pool_skills" in api.uninstall_hooks
    assert "ugsci_dispose_genui" in api.uninstall_hooks
    assert {
        "storage.inventory.accounting",
        "storage.inventory.effective_controlled",
        "storage.inventory.evaluate",
        "storage.capacity.evaluate",
        "storage.injection_allocation.optimize",
        "storage.production_allocation.optimize",
        "storage.scenario.optimize",
        "simulation.run",
        "visualization.import",
    } <= set(api.run_executors)
    assert {
        options["provider_id"] for options in api.run_executor_options.values()
    } == {
        "ugsci-storage-inventory-core",
        "ugsci-simulation",
        "ugsci.visualization",
    }


def test_storage_inventory_run_executors_return_result_and_emit_audit_events() -> (
    None
):
    from types import SimpleNamespace

    class Repository:
        def __init__(self) -> None:
            self.provenance: list[tuple[str, dict[str, Any]]] = []
            self.events: list[tuple[str, dict[str, Any]]] = []

        def upsert_provenance(
            self, run_id: str, payload: dict[str, Any]
        ) -> None:
            self.provenance.append((run_id, payload))

    repository = Repository()
    context = SimpleNamespace(
        run_id="inventory-run",
        repository=repository,
        emit=lambda event_type, data: repository.events.append(
            (event_type, data)
        ),
        check_cancelled=lambda: None,
    )
    api = RecordingPluginApi()
    UGSciPlugin._register_run_center_executors(api)  # noqa: SLF001

    accounting = api.run_executors["storage.inventory.accounting"](
        context,
        {
            "parameters": {
                "initial_inventory": 10.0,
                "cumulative_injected": 3.0,
                "cumulative_produced": 1.0,
            },
        },
    )
    assert accounting["operation"] == "storage.inventory.accounting"
    assert accounting["result"]["inventory"] == 12.0
    assert repository.provenance[0][0] == "inventory-run"
    assert repository.events[-1][0] == "result.ready"

    effective = api.run_executors["storage.inventory.effective_controlled"](
        context,
        {
            "layers": [
                {
                    "name": "L1",
                    "produced_gas": 2.0,
                    "injection_end_pressure": 10.0,
                    "injection_end_z": 1.0,
                    "evaluation_pressure": 8.0,
                    "evaluation_z": 1.0,
                },
            ],
            "cycle_id": "cycle-1",
            "injection_end_state_id": "inj",
            "evaluation_state_id": "eval",
        },
    )
    assert effective["result"]["effective_inventory"] == 10.0


def test_run_center_executor_registration_is_optional() -> None:
    class LegacyApi:
        pass

    # Hosts predating PluginApi.register_run_executor must remain compatible.
    UGSciPlugin._register_run_center_executors(LegacyApi())  # noqa: SLF001


def test_storage_inventory_executor_runs_through_native_run_center(
    tmp_path,
    monkeypatch,
) -> None:
    import time

    run_center_module = _load_run_center_module()
    RunExecutorService = run_center_module.RunExecutorService
    RunRepository = run_center_module.RunRepository
    api = RecordingPluginApi()
    UGSciPlugin._register_run_center_executors(api)  # noqa: SLF001
    repository = RunRepository(tmp_path / "run-center")
    service = RunExecutorService(repository, max_workers=1)
    service.register(
        "storage.inventory.accounting",
        api.run_executors["storage.inventory.accounting"],
        provider_id="ugsci-storage-inventory-core",
    )
    repository.create_run(
        {
            "run_id": "native-inventory",
            "operation": "storage.inventory.accounting",
            "provider_id": "ugsci-storage-inventory-core",
            "parameters": {
                "initial_inventory": 10.0,
                "cumulative_injected": 3.0,
                "cumulative_produced": 1.0,
            },
        },
    )
    service.submit("native-inventory")
    for _ in range(200):
        if repository.get_run("native-inventory")["status"] == "succeeded":
            break
        time.sleep(0.01)
    service.stop(wait=True)

    run = repository.get_run("native-inventory")
    assert run["status"] == "succeeded"
    assert any(
        event["type"] == "result.ready"
        for event in repository.list_events("native-inventory")
    )
    provenance = repository.list_provenance("native-inventory")
    assert (
        provenance
        and provenance[0]["provider_id"] == "ugsci-storage-inventory-core"
    )


def test_storage_capacity_executor_runs_through_native_run_center(
    tmp_path,
) -> None:
    import time

    run_center_module = _load_run_center_module()
    RunExecutorService = run_center_module.RunExecutorService
    RunRepository = run_center_module.RunRepository
    api = RecordingPluginApi()
    UGSciPlugin._register_run_center_executors(api)  # noqa: SLF001
    repository = RunRepository(tmp_path / "run-center")
    service = RunExecutorService(repository, max_workers=1)
    service.register(
        "storage.capacity.evaluate",
        api.run_executors["storage.capacity.evaluate"],
        provider_id="ugsci-storage-inventory-core",
    )
    repository.create_run(
        {
            "run_id": "native-capacity",
            "operation": "storage.capacity.evaluate",
            "provider_id": "ugsci-storage-inventory-core",
            "parameters": {
                "layers": [
                    {
                        "name": "layer-a",
                        "pore_volume": 100_000_000.0,
                        "maximum_pressure": 20.0,
                        "maximum_z": 1.0,
                        "minimum_pressure": 10.0,
                        "minimum_z": 1.0,
                        "temperature": 300.0,
                    },
                ],
            },
        },
    )
    service.submit("native-capacity")
    for _ in range(200):
        if repository.get_run("native-capacity")["status"] == "succeeded":
            break
        time.sleep(0.01)
    service.stop(wait=True)

    run = repository.get_run("native-capacity")
    assert run["status"] == "succeeded"
    events = repository.list_events("native-capacity")
    ready = [event for event in events if event["type"] == "result.ready"]
    assert ready and ready[-1]["data"]["result"]["working_gas"] > 0


def test_operation_registration_isolates_one_rejected_descriptor(
    monkeypatch,
) -> None:
    from plugins.bundle.ugsci.domain_engine import catalog

    operations = [
        SimpleNamespace(
            id="first.operation",
            name="First",
            description="first",
            tool_names=(),
            driver_tool_names=(),
        ),
        SimpleNamespace(
            id="second.operation",
            name="Second",
            description="second",
            tool_names=(),
            driver_tool_names=(),
        ),
    ]
    domain_engine = SimpleNamespace(
        id="test-engine",
        domain="test",
        engine_version="1",
        execution_class="deterministic",
        dependencies=(),
        tags=(),
        provider=SimpleNamespace(id="test-provider"),
        operations=operations,
    )
    monkeypatch.setattr(catalog, "list_engines", lambda: [domain_engine])
    api = RecordingPluginApi()
    api.reject_operation = "first.operation"

    UGSciPlugin._register_run_center_operations(api)  # noqa: SLF001

    assert api.operations == [
        "simulation.run",
        "visualization.import",
        "first.operation",
        "second.operation",
    ]


def test_manifest_is_the_complete_runtime_tool_catalog(monkeypatch) -> None:
    manifest_path = (
        Path(__file__).parents[4]
        / "plugins"
        / "bundle"
        / "ugsci"
        / "plugin.json"
    )
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    declarations = {tool["name"]: tool for tool in manifest["meta"]["tools"]}
    expected = {
        "emit_ui_tree",
        "emit_ui_patch",
        "list_ui_components",
        "get_genui_guide",
        "launch_simulation",
        "check_simulation_status",
        "wait_for_simulation",
        "read_simulation_results",
        "edit_simulation_deck",
        "analyze_simulation",
        "ugsci_welllog_read",
        "ugsci_welllog_validate",
        "ugsci_welllog_export",
        "ugsci_decline_fit",
        "ugsci_decline_forecast",
        "ugsci_decline_eur",
        "ugsci_symbolic_polynomial_roots",
        "ugsci_bayesian_normal_estimate",
        "ugsci_multiobjective_quadratic",
        "ugsci_queue_simulate",
        "ugsci_graph_analyze",
        "ugsci_geospatial_points_analyze",
        "ugsci_ml_regression",
        "ugsci_statistical_regression",
        "ugsci_convert_units",
        "ugsci_volumetric_oil_in_place",
        "ugsci_oil_material_balance",
        "ugsci_gas_material_balance",
        "ugsci_black_oil_pvt",
        "ugsci_vogel_ipr",
        "ugsci_nodal_analysis",
        "ugsci_conservation_check",
        "ugsci_neqsim_flash",
        "ugsci_neqsim_pvt",
        "ugsci_neqsim_phase_envelope",
        "ugsci_neqsim_process_simulate",
        "ugsci_neqsim_pipeline_flow",
        "import_subsurface_dataset",
        "open_oilgas_visualization",
        "set_visualization_property",
        "set_visualization_timestep",
        "configure_visualization_view",
        "get_visualization_command_status",
        "focus_visualization_object",
        "create_intersection",
        "capture_visualization",
        "run_visualization_benchmark",
        "filter_visualization",
        "generate_visualization_report",
        "save_visualization_report",
    }
    assert set(declarations) >= expected

    monkeypatch.setattr(engine, "init_default_engines", lambda: 0)
    api = RecordingPluginApi()
    UGSciPlugin().register(api)

    assert set(api.tools) == set(declarations)
    for name, declaration in declarations.items():
        options = api.tool_options[name]
        assert options["description"] == declaration["description"]
        assert options["icon"] == declaration["icon"]
        assert options["enabled"] is declaration["enabled_by_default"]
        assert options["tool_type"] == declaration["tool_type"]
        assert options["target_param"] == declaration["target_param"]
        target_param = declaration["target_param"]
        if target_param:
            assert (
                target_param
                in inspect.signature(
                    options["tool_func"],
                ).parameters
            )


def test_manifest_declares_supported_qwenpaw_range() -> None:
    manifest_path = (
        Path(__file__).parents[4]
        / "plugins"
        / "bundle"
        / "ugsci"
        / "plugin.json"
    )
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    assert manifest["qwenpaw_version"] == {
        "min": "2.1.0",
        "max": "2.3.0",
    }


def test_manifest_tool_sync_adds_every_group_without_overwriting_preferences(
    monkeypatch,
) -> None:
    from qwenpaw.config import config as config_module
    from qwenpaw.config import utils as config_utils

    existing = config_module.BuiltinToolConfig(
        name="ugsci_decline_fit",
        enabled=True,
    )
    stale_simulation = config_module.BuiltinToolConfig(
        name="check_simulation_status",
        enabled=False,
        icon="🔍",
    )
    tools = config_module.ToolsConfig(
        builtin_tools={
            "ugsci_decline_fit": existing,
            "check_simulation_status": stale_simulation,
        },
    )
    agent_config = SimpleNamespace(tools=tools)
    saved: list[tuple[str, Any]] = []

    monkeypatch.setattr(
        config_utils,
        "load_config",
        lambda: SimpleNamespace(
            agents=SimpleNamespace(profiles={"agent-a": {}}),
        ),
    )
    monkeypatch.setattr(
        config_module,
        "load_agent_config",
        lambda agent_id: agent_config,
    )
    monkeypatch.setattr(
        config_module,
        "save_agent_config",
        lambda agent_id, value: saved.append((agent_id, value)),
    )

    # pylint: disable=protected-access
    UGSciPlugin._sync_manifest_tools_to_all_agents()

    assert saved and saved[0][0] == "agent-a"
    assert (
        agent_config.tools.builtin_tools["ugsci_decline_fit"].enabled is True
    )
    assert "ugsci_welllog_read" in agent_config.tools.builtin_tools
    assert (
        agent_config.tools.builtin_tools["ugsci_welllog_read"].enabled is False
    )
    assert (
        agent_config.tools.builtin_tools["launch_simulation"].enabled is True
    )
    assert (
        agent_config.tools.builtin_tools["check_simulation_status"].enabled
        is True
    )
    assert agent_config.tools.builtin_tools["emit_ui_tree"].enabled is True


def test_manifest_tool_sync_preserves_explicitly_disabled_simulation_tool(
    monkeypatch,
) -> None:
    from qwenpaw.config import config as config_module
    from qwenpaw.config import utils as config_utils

    user_disabled = config_module.BuiltinToolConfig(
        name="check_simulation_status",
        enabled=False,
        description="用户关闭的仿真状态检查",
        icon="📊",
        config={"reason": "用户偏好"},
    )
    agent_config = SimpleNamespace(
        tools=config_module.ToolsConfig(
            builtin_tools={"check_simulation_status": user_disabled},
        ),
    )
    saved: list[tuple[str, Any]] = []

    monkeypatch.setattr(
        config_utils,
        "load_config",
        lambda: SimpleNamespace(
            agents=SimpleNamespace(profiles={"agent-a": {}}),
        ),
    )
    monkeypatch.setattr(
        config_module, "load_agent_config", lambda _: agent_config
    )
    monkeypatch.setattr(
        config_module,
        "save_agent_config",
        lambda agent_id, value: saved.append((agent_id, value)),
    )

    # pylint: disable=protected-access
    UGSciPlugin._sync_manifest_tools_to_all_agents()

    assert (
        agent_config.tools.builtin_tools["check_simulation_status"].enabled
        is False
    )
    assert agent_config.tools.builtin_tools[
        "check_simulation_status"
    ].config == {
        "reason": "用户偏好",
    }
    assert saved and saved[0][0] == "agent-a"
