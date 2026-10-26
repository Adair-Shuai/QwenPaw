# -*- coding: utf-8 -*-
"""Public plugin registrations executed by the real durable Run Center."""

from __future__ import annotations

import copy
import importlib
import threading
import time

import pytest

from tests.unit.plugins.ugsci.test_plugin_registration import (
    RecordingPluginApi,
    _load_run_center_module,
)


_ACCOUNTING = {
    "initial_inventory": 10.0,
    "cumulative_injected": 3.0,
    "cumulative_produced": 1.0,
}
_EFFECTIVE = {
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
    "injection_end_state_id": "injection",
    "evaluation_state_id": "evaluation",
}
_CASES = (
    ("storage.inventory.accounting", _ACCOUNTING, "inventory", 12.0),
    (
        "storage.inventory.effective_controlled",
        _EFFECTIVE,
        "effective_inventory",
        10.0,
    ),
    (
        "storage.inventory.evaluate",
        {
            **_EFFECTIVE,
            "design_capacity": 20.0,
            "book_inventory": 12.0,
        },
        "book_inventory_fill_percent",
        60.0,
    ),
    (
        "storage.capacity.evaluate",
        {
            "layers": [
                {
                    "name": "L1",
                    "pore_volume": 100_000_000.0,
                    "maximum_pressure": 20.0,
                    "maximum_z": 1.0,
                    "minimum_pressure": 10.0,
                    "minimum_z": 1.0,
                    "temperature": 300.0,
                },
            ],
        },
        "working_gas",
        None,
    ),
    (
        "storage.injection_allocation.optimize",
        {"wells": [{"name": "W1", "maximum_rate": 10.0}], "target_rate": 5.0},
        "allocated_rate",
        5.0,
    ),
    (
        "storage.production_allocation.optimize",
        {"wells": [{"name": "W1", "maximum_rate": 10.0}], "demand_rate": 5.0},
        "allocated_rate",
        5.0,
    ),
    (
        "storage.scenario.optimize",
        {
            "scenarios": [
                {"name": "base", "metrics": {"score": 1.0}},
                {"name": "high", "metrics": {"score": 2.0}},
            ],
            "objectives": [{"key": "score"}],
        },
        "recommended_scenario",
        "high",
    ),
)


@pytest.fixture(
    name="native_storage",
    params=(
        "plugins.bundle.ugsci",
        "qwenpaw.plugins_bundle.ugsci",
    ),
)
def _native_storage(request, monkeypatch, tmp_path):
    monkeypatch.setattr("qwenpaw.constant.WORKING_DIR", str(tmp_path / "work"))
    engine = importlib.import_module(f"{request.param}.engine")
    monkeypatch.setattr(engine, "init_default_engines", lambda: 0)
    plugin = importlib.import_module(f"{request.param}.plugin")
    api = RecordingPluginApi()
    plugin.UGSciPlugin().register(api)
    expected = [case[0] for case in _CASES]
    assert list(api.run_executors) == expected + [
        "simulation.run",
        "visualization.import",
    ]
    bridge = importlib.import_module(
        f"{request.param}.engine.tools.run_center_bridge",
    )
    assert api.run_executors["simulation.run"] is bridge.execute_simulation
    assert api.run_executors["visualization.import"] is (
        bridge.execute_visualization_import
    )
    runtime = _load_run_center_module()
    repository = runtime.RunRepository(tmp_path / "runs")
    return api, runtime, repository


@pytest.mark.parametrize(
    ("operation", "parameters", "metric", "expected"),
    _CASES,
)
def test_public_storage_executor_runs_and_persists_results(
    native_storage,
    operation,
    parameters,
    metric,
    expected,
):
    api, runtime, repository = native_storage
    provider = api.run_executor_options[operation]["provider_id"]
    assert provider == "ugsci-storage-inventory-core"
    service = runtime.RunExecutorService(repository, max_workers=1)
    service.register(
        operation,
        api.run_executors[operation],
        provider_id=provider,
    )
    repository.create_run(
        {
            "run_id": "native-storage",
            "operation": operation,
            "provider_id": provider,
            "parameters": copy.deepcopy(parameters),
        },
    )
    try:
        service.submit("native-storage")
        deadline = time.monotonic() + 10
        while time.monotonic() < deadline:
            run = repository.get_run("native-storage")
            if run["status"] in {"succeeded", "failed", "cancelled"}:
                break
            time.sleep(0.01)
        assert run["status"] == "succeeded", run
    finally:
        service.stop(wait=True)
    events = repository.list_events("native-storage")
    event_types = [event["type"] for event in events]
    ready = [event for event in events if event["type"] == "result.ready"]
    assert len(ready) == 1
    result = ready[0]["data"]
    assert result["operation"] == operation
    if expected is None:
        assert result["result"][metric] > 0
    elif isinstance(expected, str):
        assert result["result"][metric] == expected
    else:
        assert result["result"][metric] == pytest.approx(expected)
    assert event_types.index("provenance.updated") < event_types.index(
        "result.ready",
    )
    provenance = repository.list_provenance("native-storage")
    assert (
        provenance[0]["input_fingerprint"]
        == result["provenance"]["input_fingerprint"]
    )
    fingerprint = provenance[0]["input_fingerprint"]
    assert fingerprint.startswith("sha256:")
    assert len(fingerprint.removeprefix("sha256:")) == 64


def _context(runtime, repository):
    repository.create_run(
        {
            "run_id": "direct-storage",
            "operation": "storage.inventory.accounting",
        },
    )
    return runtime.ExecutionContext(
        "direct-storage",
        repository,
        threading.Event(),
        threading.Event(),
    )


def test_storage_executor_preserves_envelope_priority_and_zero(native_storage):
    api, runtime, repository = native_storage
    context = _context(runtime, repository)
    payload = {
        "initial_inventory": 100.0,
        "cumulative_injected": 100.0,
        "cumulative_produced": 100.0,
        "input_snapshot": {
            "initial_inventory": 50.0,
            "parameters": {
                "initial_inventory": 20.0,
                "cumulative_injected": 7.0,
            },
        },
        "parameters": {
            "initial_inventory": 0.0,
            "cumulative_injected": 3.0,
            "cumulative_produced": 1.0,
        },
    }
    original = copy.deepcopy(payload)
    result = api.run_executors["storage.inventory.accounting"](
        context,
        payload,
    )
    assert result["result"]["inventory"] == 2.0
    assert payload == original
    assert repository.list_provenance("direct-storage")


@pytest.mark.parametrize("cancel_on", (1, 2, 3))
def test_storage_executor_keeps_cancellation_and_persistence_order(
    native_storage,
    cancel_on,
):
    api, runtime, repository = native_storage
    context = _context(runtime, repository)
    original_check = context.check_cancelled
    calls = 0

    def check_cancelled():
        nonlocal calls
        calls += 1
        if calls == cancel_on:
            context.cancel_event.set()
        original_check()

    context.check_cancelled = check_cancelled
    with pytest.raises(
        runtime.ExecutionCancelled,
        match="Run cancellation requested",
    ):
        api.run_executors["storage.inventory.accounting"](context, _ACCOUNTING)
    assert calls == cancel_on
    assert len(repository.list_provenance("direct-storage")) == (
        1 if cancel_on == 3 else 0
    )
    ready = [
        event
        for event in repository.list_events("direct-storage")
        if event["type"] == "result.ready"
    ]
    assert len(ready) == (1 if cancel_on == 3 else 0)


@pytest.mark.parametrize(
    ("operation", "payload", "message"),
    (
        (
            "storage.capacity.evaluate",
            {"layers": "bad"},
            "layers must be an array",
        ),
        (
            "storage.capacity.evaluate",
            {"layers": [None]},
            r"layers\[0\] must be an object",
        ),
        (
            "storage.injection_allocation.optimize",
            {"wells": "bad"},
            "wells must be an array",
        ),
        (
            "storage.scenario.optimize",
            {"scenarios": [], "objectives": "bad"},
            "objectives must be an array",
        ),
        (
            "storage.scenario.optimize",
            {"scenarios": [], "objectives": [], "constraints": "bad"},
            "constraints must be an array",
        ),
    ),
)
def test_storage_executor_keeps_input_shape_errors(
    native_storage,
    operation,
    payload,
    message,
):
    api, runtime, repository = native_storage
    context = _context(runtime, repository)
    with pytest.raises(ValueError, match=message):
        api.run_executors[operation](context, payload)
    assert repository.list_provenance("direct-storage") == []
