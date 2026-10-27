# -*- coding: utf-8 -*-
"""Workflow shutdown keeps its loop until cancellation cleanup acknowledges."""

import asyncio
import json
from pathlib import Path
import threading
import time

import pytest

from qwenpaw.plugins_bundle.flowforge.service import WorkflowService


def _running_service(tmp_path, release_cleanup=True):
    service = WorkflowService(flows_dir=tmp_path / "flows")
    started = threading.Event()
    release = threading.Event()
    finished = threading.Event()
    cleanups = []
    if release_cleanup:
        release.set()

    class Runtime:
        async def run_agent_turn(self, agent_id, query):
            assert agent_id == "default"
            assert "cleanup" in query
            started.set()
            try:
                await asyncio.sleep(60)
            finally:
                cleanups.append("started")
                try:
                    while not release.is_set():
                        await asyncio.sleep(0.01)
                finally:
                    finished.set()

    service.executor.agent_runtime = Runtime()
    flow = service.generate_flow("Synthetic cleanup wait")
    service.save_flow(flow["id"], flow)
    handle = service.start_run(flow["id"])
    assert started.wait(3)
    return service, handle, release, finished, cleanups


def test_close_drains_cancelled_run_and_preserves_durable_data(tmp_path):
    service, handle, release, finished, cleanups = _running_service(tmp_path)
    try:
        service.close()
        assert service.closed
        assert finished.is_set()
        assert cleanups == ["started"]
        assert handle.is_done
        assert handle.future.done()
        assert service.executor.resource_snapshot() == {
            "active_runs": 0,
            "abort_waiters": 0,
        }
        assert service.get_run_record(handle.run_id)["status"] == "cancelled"
        assert service.get_flow(handle.flow_id)["id"] == handle.flow_id
        assert service.list_runs()[0]["run_id"] == handle.run_id
        service.close()
        with pytest.raises(RuntimeError, match="shutting down"):
            service.start_run(handle.flow_id)
    finally:
        release.set()
        service.close()


def test_shutdown_timeout_retries_without_cancelling_cleanup_again(tmp_path):
    service, handle, release, finished, cleanups = _running_service(
        tmp_path,
        release_cleanup=False,
    )
    try:
        for _ in range(2):
            with pytest.raises(TimeoutError):
                service.close(timeout=0.03)
            assert not service.closed
            assert not finished.is_set()
            assert not handle.is_done
        release.set()
        service.close()
        assert service.closed
        assert finished.is_set()
        assert cleanups == ["started"]
        assert handle.is_done
        assert service.get_run_record(handle.run_id)["status"] == "cancelled"
    finally:
        release.set()
        service.close()


@pytest.mark.asyncio
async def test_async_close_keeps_host_available_for_callback_cleanup(tmp_path):
    host_loop = asyncio.get_running_loop()
    service = WorkflowService(flows_dir=tmp_path / "flows")
    started = threading.Event()
    acknowledged = []

    async def host_cleanup():
        await asyncio.sleep(0)
        acknowledged.append("released")

    class Runtime:
        async def run_agent_turn(self, agent_id, query):
            assert agent_id == "default"
            assert "cleanup" in query
            started.set()
            try:
                await asyncio.sleep(60)
            finally:
                await asyncio.wrap_future(
                    asyncio.run_coroutine_threadsafe(
                        host_cleanup(),
                        host_loop,
                    ),
                )

    service.executor.agent_runtime = Runtime()
    flow = service.generate_flow("Host cleanup callback")
    service.save_flow(flow["id"], flow)
    handle = service.start_run(flow["id"])
    try:
        assert await asyncio.to_thread(started.wait, 3)
        with pytest.raises(RuntimeError, match="aclose"):
            service.close()
        await service.aclose()
        assert acknowledged == ["released"]
        assert handle.is_done
        assert service.closed
    finally:
        await service.aclose()


def test_close_interrupts_preparation_before_any_agent_effect(tmp_path):
    service = WorkflowService(flows_dir=tmp_path / "flows")
    entered = threading.Event()
    released = threading.Event()

    class Catalog:
        async def prepare(self, executor, agent_id, metadata):
            assert executor is service.executor
            assert agent_id == "default"
            assert metadata["run_id"]
            entered.set()
            try:
                await asyncio.sleep(60)
            finally:
                released.set()

    class Runtime:
        async def run_agent_turn(self, agent_id, query):
            pytest.fail(
                f"Preparation cancellation executed {agent_id}: {query}",
            )

    service.node_catalog = Catalog()
    service.executor.agent_runtime = Runtime()
    flow = service.generate_flow("Never run after cancelled preparation")
    service.save_flow(flow["id"], flow)
    handle = service.start_run(flow["id"])
    try:
        assert entered.wait(3)
        service.close()
        assert released.is_set()
        assert handle.is_done
        assert service.closed
        assert service.get_run_record(handle.run_id)["status"] == "cancelled"
    finally:
        service.close()


def test_close_preserves_paused_checkpoint_for_restart(tmp_path):
    folder = tmp_path / "flows"
    service = WorkflowService(flows_dir=folder)
    service.save_flow(
        "approval",
        {
            "id": "approval",
            "nodes": {
                "review": {
                    "class_type": "HumanReviewNode",
                    "inputs": {"reviewer": "owner"},
                },
            },
            "outputs": ["review"],
        },
    )
    handle = service.start_run("approval")
    try:
        handle.future.result(timeout=3)
        deadline = time.monotonic() + 3
        while not handle.is_done and time.monotonic() < deadline:
            time.sleep(0.01)
        assert handle.is_done
        assert (
            service.get_run_record(handle.run_id)["status"] == "waiting_human"
        )
        service.close()
        assert (
            service.get_run_record(handle.run_id)["status"] == "waiting_human"
        )
        restarted = WorkflowService(flows_dir=folder)
        try:
            continuation = restarted.resume_run(
                handle.run_id,
                {"approved": True},
            )
            result = continuation.future.result(timeout=3)
            assert result.status.value == "completed"
        finally:
            restarted.close()
    finally:
        service.close()


@pytest.mark.parametrize("timeout", [0, -1, float("nan"), float("inf"), True])
def test_invalid_shutdown_budget_does_not_close_service(tmp_path, timeout):
    service = WorkflowService(flows_dir=tmp_path / "flows")
    try:
        with pytest.raises(ValueError, match="positive and finite"):
            service.close(timeout=timeout)
        assert not service.closed
    finally:
        service.close()


@pytest.mark.asyncio
@pytest.mark.parametrize("mode", ["unload", "uninstall"])
async def test_real_loader_drains_running_work_before_removing_routes(
    tmp_path,
    mode,
):
    from qwenpaw.plugins.testing import PluginTestHost

    source = Path(__file__).parents[4] / "plugins/bundle/flowforge"
    before = set(threading.enumerate())
    async with PluginTestHost(tmp_path / "host") as host:
        installed = await host.install(source)
        assert installed.ok, installed.diagnostics
        health = await host.request("GET", "/api/flowforge/health")
        assert health.status == 200
        folder = Path(health.json()["flows_dir"])
        payload = {
            "id": "owned-wait",
            "nodes": {
                "wait": {
                    "class_type": "WaitNode",
                    "inputs": {"seconds": 60},
                },
            },
            "outputs": ["wait"],
        }
        saved = await host.request(
            "POST",
            "/api/flowforge/flows",
            headers={"content-type": "application/json"},
            body=json.dumps(payload).encode(),
        )
        assert saved.status == 200, saved.text
        started = await host.request(
            "POST",
            "/api/flowforge/flows/owned-wait/run",
        )
        assert started.status == 200, started.text
        run_id = started.json()["run_id"]
        deadline = time.monotonic() + 3
        while time.monotonic() < deadline:
            state = await host.request(
                "GET",
                f"/api/flowforge/runs/{run_id}",
            )
            assert state.status == 200, state.text
            if state.json()["node_statuses"].get("wait") == "running":
                break
            await asyncio.sleep(0.01)
        else:
            pytest.fail("Real loader did not enter the owned WaitNode")
        owned = [
            thread
            for thread in threading.enumerate()
            if thread not in before and thread.name == "flowforge-loop"
        ]
        assert len(owned) == 1
        result = await getattr(host, mode)("flowforge")
        assert result.clean, result.errors
        assert result.quiescent
        assert not result.needs_restart
        assert not owned[0].is_alive()
        host.assert_quiescent("flowforge")
        removed = await host.request("GET", "/api/flowforge/health")
        assert removed.status == 404
        recovered = WorkflowService(flows_dir=folder)
        try:
            assert recovered.get_run_record(run_id)["status"] == "cancelled"
            assert recovered.get_flow("owned-wait")["id"] == "owned-wait"
        finally:
            await recovered.aclose()


@pytest.mark.asyncio
async def test_critical_ledger_retains_timed_out_cleanup_until_retry(
    tmp_path,
    monkeypatch,
):
    from qwenpaw.plugins.api import PluginApi
    from qwenpaw.plugins.lifecycle import PluginInstance, UnloadMode
    from qwenpaw.plugins.registry import PluginRegistry
    from qwenpaw.plugins.testing import PluginTestHost
    from qwenpaw.plugins_bundle.flowforge import plugin as plugin_module

    async with PluginTestHost(tmp_path / "host"):
        service, handle, release, finished, cleanups = _running_service(
            tmp_path,
            release_cleanup=False,
        )
        original_close = service.aclose

        async def bounded_close():
            await original_close(timeout=0.03)

        monkeypatch.setattr(service, "aclose", bounded_close)
        monkeypatch.setattr(plugin_module, "build_service", lambda: service)
        plugin = plugin_module.FlowForgePlugin()
        instance = PluginInstance("flowforge")
        api = PluginApi("flowforge", {})
        api.set_registry(PluginRegistry())
        api.bind_instance(instance)
        try:
            plugin.register(api)
            report = await instance.dispose(UnloadMode.UNLOAD)
            assert not report.clean
            assert not report.quiescent
            assert report.needs_restart
            assert plugin.service is service
            assert not service.closed
            assert not finished.is_set()
            release.set()
            monkeypatch.setattr(service, "aclose", original_close)
            retried = await instance.dispose(UnloadMode.UNLOAD)
            assert retried.clean, retried.errors
            assert retried.quiescent
            assert not retried.needs_restart
            assert plugin.service is None
            assert service.closed
            assert finished.is_set()
            assert cleanups == ["started"]
            assert (
                service.get_run_record(handle.run_id)["status"] == "cancelled"
            )
        finally:
            release.set()
            await original_close()
            await instance.dispose(UnloadMode.UNLOAD)
