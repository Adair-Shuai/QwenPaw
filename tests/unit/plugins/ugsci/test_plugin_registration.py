# -*- coding: utf-8 -*-
"""Registration-chain test for the bundled UGSci plugin."""

from __future__ import annotations

import inspect
import json
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
        "ugsci_neqsim_flash",
        "ugsci_neqsim_pvt",
        "ugsci_neqsim_phase_envelope",
        "ugsci_neqsim_process_simulate",
        "ugsci_neqsim_pipeline_flow",
    } <= set(api.tools)
    assert {
        "ugsci_sync_skills_to_pool",
        "ugsci_sync_manifest_tools",
        "ugsci_init",
    } <= set(api.startup_hooks)
    assert api.uninstall_hooks == ["ugsci_remove_pool_skills"]


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
        "max": "2.2.0",
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
    tools = config_module.ToolsConfig(
        builtin_tools={"ugsci_decline_fit": existing},
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
    assert agent_config.tools.builtin_tools["emit_ui_tree"].enabled is True
