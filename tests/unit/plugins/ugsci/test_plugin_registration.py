# -*- coding: utf-8 -*-
"""Registration-chain test for the bundled UGSci plugin."""

from __future__ import annotations

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

    def register_tool(self, *, tool_name: str, **_kwargs: Any) -> None:
        self.tools.append(tool_name)

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
    assert "/ugsci/team" in api.routers
    team_paths = {route.path for route in api.routers["/ugsci/team"].routes}
    assert {"/preset-teams", "/roles", "/state"} <= team_paths
    assert {
        "launch_simulation",
        "check_simulation_status",
        "wait_for_simulation",
        "read_simulation_results",
        "edit_simulation_deck",
        "analyze_simulation",
    } <= set(api.tools)
    assert {
        "ugsci_sync_skills_to_pool",
        "ugsci_init",
    } <= set(api.startup_hooks)
    assert api.uninstall_hooks == ["ugsci_remove_pool_skills"]
