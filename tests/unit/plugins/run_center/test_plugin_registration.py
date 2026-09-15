# -*- coding: utf-8 -*-
"""Plugin registration test for qwenpaw-run-center."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path
from types import SimpleNamespace


_PLUGIN_ROOT = (
    Path(__file__).parents[4] / "plugins" / "bundle" / "qwenpaw-run-center"
)


def _plugin_module():
    name = "test_run_center_plugin"
    spec = importlib.util.spec_from_file_location(
        name,
        _PLUGIN_ROOT / "plugin.py",
        submodule_search_locations=[str(_PLUGIN_ROOT)],
    )
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


class RecordingApi:
    def __init__(self, operations=None, executors=None) -> None:
        self.routers = {}
        self.startup = []
        self.uninstall = []
        self.operations = list(operations or [])
        self.executors = list(executors or [])

    def register_http_router(self, router, *, prefix, tags):
        self.routers[prefix] = (router, tags)

    def register_startup_hook(self, *, hook_name, callback, priority):
        self.startup.append((hook_name, callback, priority))

    def register_uninstall_hook(self, *, hook_name, callback):
        self.uninstall.append((hook_name, callback))

    def get_operations(self):
        return list(self.operations)

    def get_run_executors(self):
        return list(self.executors)


def test_registers_independent_router_and_lifecycle_hooks() -> None:
    api = RecordingApi()
    _plugin_module().RunCenterPlugin().register(api)

    assert "/run-center" in api.routers
    paths = {route.path for route in api.routers["/run-center"][0].routes}
    assert {
        "/health",
        "/runs",
        "/runs/{run_id}",
        "/runs/{run_id}/events",
        "/runs/{run_id}/stages",
        "/runs/{run_id}/stages/{stage_id}",
        "/runs/{run_id}/artifacts",
        "/runs/{run_id}/checkpoints",
        "/runs/{run_id}/provenance",
        "/runs/{run_id}/transition",
        "/runs/{run_id}/pause",
        "/runs/{run_id}/resume",
        "/runs/{run_id}/cancel",
        "/runs/{run_id}/clone",
        "/runs/{run_id}/retry",
        "/operations",
    } <= paths
    assert api.startup[0][0] == "run_center_initialize"
    assert api.uninstall[0][0] == "run_center_shutdown"


def test_operation_snapshot_tracks_runtime_plugin_reload() -> None:
    class RecordingRepository:
        def __init__(self):
            self.snapshots = []

        def initialize(self):
            return None

        def replace_operations(self, operations):
            self.snapshots.append(operations)

        def list_operations(self):
            return self.snapshots[-1] if self.snapshots else []

    module = _plugin_module()
    plugin = module.RunCenterPlugin()
    plugin.repository = RecordingRepository()
    api = RecordingApi()
    api.operations = [
        SimpleNamespace(
            operation="simulation.run",
            descriptor={"title": "UGSci"},
            provider_id="ugsci",
            contract_version="1.0",
        ),
    ]
    plugin.register(api)
    api.startup[0][1]()
    assert plugin.repository.snapshots[-1][0]["provider_id"] == "ugsci"

    api.operations = []
    plugin._sync_operations()  # noqa: SLF001 - lifecycle contract
    assert plugin.repository.snapshots[-1] == []


def test_startup_persists_host_operation_descriptors(tmp_path) -> None:
    module = _plugin_module()
    operation = SimpleNamespace(
        operation="storage.inventory.evaluate",
        provider_id="ugsci-storage",
        contract_version="1.0",
        descriptor={"title": "库存评价", "supports_pause": False},
    )
    api = RecordingApi([operation])
    plugin = module.RunCenterPlugin()
    plugin.repository = module.RunRepository(tmp_path / "run-center")

    plugin.register(api)
    plugin._on_startup()

    registrations = plugin.repository.list_operations()
    assert registrations == [
        {
            "operation": "storage.inventory.evaluate",
            "descriptor": {"title": "库存评价", "supports_pause": False},
            "contract_version": "1.0",
            "provider_id": "ugsci-storage",
            "updated_at": registrations[0]["updated_at"],
        },
    ]


def test_executor_snapshot_removes_unloaded_plugin_handlers() -> None:
    module = _plugin_module()
    plugin = module.RunCenterPlugin()
    handler = lambda *_args: None
    api = RecordingApi(
        executors=[
            SimpleNamespace(
                operation="simulation.run",
                provider_id="ugsci",
                handler=handler,
                executor=None,
            ),
        ],
    )
    plugin.register(api)

    plugin._sync_executors()  # noqa: SLF001 - reload snapshot contract
    assert (
        plugin.executor_service._find_registration(  # noqa: SLF001
            "simulation.run",
            "ugsci",
        ).handler
        is handler
    )

    api.executors = []
    plugin._sync_executors()  # noqa: SLF001
    assert (
        plugin.executor_service._find_registration(  # noqa: SLF001
            "simulation.run",
            "ugsci",
        )
        is None
    )
