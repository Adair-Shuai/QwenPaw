# -*- coding: utf-8 -*-
"""Real execution, restart and HTTP/stream inspection contracts."""

import asyncio
import copy
import importlib
from pathlib import Path
import json
import time

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient


@pytest.fixture(params=["qwenpaw.plugins_bundle", "plugins.bundle"])
def environment(request, tmp_path):
    package = f"{request.param}.flowforge"
    service_module = importlib.import_module(f"{package}.service")
    router_module = importlib.import_module(f"{package}.router")
    service = service_module.WorkflowService(flows_dir=tmp_path)
    app = FastAPI()
    app.include_router(router_module.build_router(service))
    with TestClient(app) as client:
        yield service, client, service_module, router_module
    service.close(timeout=3)


def wait(handle):
    deadline = time.monotonic() + 5
    while not handle.is_done and time.monotonic() < deadline:
        time.sleep(0.01)
    assert handle.is_done
    assert handle.status.value == "completed", handle.to_dict()


def test_run_node_directory_uses_fixed_snapshot_and_preserves_false_values(
    environment,
):
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=redefined-outer-name
    service, client, _, _ = environment
    service.save_flow(
        "fixed",
        {
            "id": "fixed",
            "nodes": {
                "zero": {
                    "class_type": "OutputNode",
                    "label": "原始节点",
                    "inputs": {"value": 0},
                },
                "false": {
                    "class_type": "OutputNode",
                    "inputs": {"value": False},
                },
            },
        },
    )
    handle = service.start_run("fixed")
    wait(handle)
    service.save_flow(
        "fixed",
        {
            "id": "fixed",
            "nodes": {
                "replacement": {
                    "class_type": "OutputNode",
                    "inputs": {"value": "new"},
                },
            },
        },
    )
    record = client.get(f"/runs/{handle.run_id}").json()
    details = record["node_details"]
    assert set(details) == {"zero", "false"}
    assert details["zero"]["label"] == "原始节点"
    assert details["zero"]["outputs"] == [0]
    assert details["false"]["outputs"] == [False]
    assert details["zero"]["duration_ms"] >= 0
    assert details["zero"]["inputs_available"] is True
    assert details["zero"]["inputs"] == {"value": 0}
    assert details["false"]["inputs"] == {"value": False}
    assert "flow_snapshot" not in record


def test_not_yet_executed_nodes_are_visible_without_fabricated_outputs(
    environment,
):
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=redefined-outer-name
    service, client, _, _ = environment
    service.save_flow(
        "waiting",
        {
            "id": "waiting",
            "nodes": {
                "wait": {"class_type": "WaitNode", "inputs": {"seconds": 60}},
                "after": {
                    "class_type": "OutputNode",
                    "inputs": {"value": ["wait", 0]},
                },
            },
        },
    )
    handle = service.start_run("waiting")
    try:
        record = client.get(f"/runs/{handle.run_id}").json()
        detail = record["node_details"]["after"]
        assert detail["status"] == "not_executed"
        assert detail["inputs_available"] is False
        assert "outputs" not in detail
    finally:
        service.cancel_run(handle.run_id)


def _assert_public_transport(client, run_id, secrets):
    response = client.get(f"/runs/{run_id}")
    assert response.status_code == 200
    listing = client.get("/runs")
    events = client.get(f"/runs/{run_id}/events")
    assert "[凭据已隐藏]" in response.text
    for secret in secrets:
        assert secret not in response.text
        assert secret not in listing.text
        assert secret not in events.text
    with client.websocket_connect("/ws") as websocket:
        websocket.send_json({"type": "subscribe", "run_id": run_id})
        for _ in range(100):
            event = websocket.receive_json()
            assert not any(secret in json.dumps(event) for secret in secrets)
            if event.get("type") == "run_finished":
                break
        else:
            raise AssertionError("Missing terminal WebSocket frame")


# Preserve the protected regression name in the fixed inventory.
# pylint: disable-next=line-too-long
# pylint: disable-next=line-too-long
def test_public_inspection_redacts_credentials_live_and_after_restart_without_changing_results(  # noqa: E501
    environment,
):
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=redefined-outer-name
    service, client, service_module, router_module = environment
    secret = "snapshot-private-123456"
    runtime_secret = "runtime-private-654321"
    service.save_flow(
        "sensitive",
        {
            "id": "sensitive",
            "nodes": {
                "out": {
                    "class_type": "OutputNode",
                    "inputs": {
                        "value": {
                            "api_key": secret,
                            "echo": f"echo: {secret}",
                            "runtime_echo": "${inputs.access_token}",
                        },
                    },
                },
            },
        },
    )
    handle = service.start_run("sensitive", {"access_token": runtime_secret})
    wait(handle)
    raw = service.get_run_record(handle.run_id)
    assert raw["outputs"]["out"]["api_key"] == secret
    assert raw["outputs"]["out"]["runtime_echo"] == runtime_secret
    _assert_public_transport(client, handle.run_id, [secret, runtime_secret])
    assert service.get_run_record(handle.run_id)["outputs"] == raw["outputs"]
    service.close(timeout=3)
    restarted = service_module.WorkflowService(flows_dir=service.flows_dir)
    try:
        app = FastAPI()
        app.include_router(router_module.build_router(restarted))
        with TestClient(app) as restarted_client:
            _assert_public_transport(
                restarted_client,
                handle.run_id,
                [secret, runtime_secret],
            )
            assert (
                restarted.get_run_record(handle.run_id)["outputs"]
                == raw["outputs"]
            )
    finally:
        restarted.close(timeout=3)


def test_named_workflow_output_cannot_impersonate_a_node_output(environment):
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=redefined-outer-name
    service, client, _, _ = environment
    service.save_flow(
        "aliases",
        {
            "id": "aliases",
            "nodes": {
                "out": {"class_type": "OutputNode", "inputs": {"value": 0}},
            },
            "outputs": {"out": "workflow summary"},
        },
    )
    handle = service.start_run("aliases")
    wait(handle)
    record = client.get(f"/runs/{handle.run_id}").json()
    assert record["outputs"] == {"out": "workflow summary"}
    assert record["node_details"]["out"]["outputs"] == [0]


def test_short_credentials_do_not_corrupt_run_routing_or_status(environment):
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=redefined-outer-name
    service, client, _, _ = environment
    service.save_flow(
        "a-flow",
        {
            "id": "a-flow",
            "nodes": {
                "token": {
                    "class_type": "OutputNode",
                    "inputs": {
                        "value": "echo: ${inputs.access_token}",
                    },
                },
            },
        },
    )
    handle = service.start_run("a-flow", {"access_token": "a"})
    wait(handle)
    record = client.get(f"/runs/{handle.run_id}").json()
    assert record["run_id"] == handle.run_id
    assert record["flow_id"] == "a-flow"
    assert record["status"] == "completed"
    assert record["node_statuses"] == {"token": "success"}
    detail = record["node_details"]["token"]
    assert detail["id"] == "token"
    assert detail["status"] == "success"
    assert "[凭据已隐藏]" in detail["outputs"][0]
    assert "echo: a" not in detail["outputs"][0]


def test_stream_redactor_remembers_credentials_discovered_in_earlier_events(
    environment,
):
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=redefined-outer-name
    service, _, _, _ = environment
    clean = asyncio.run(service.public_run_redactor("legacy-events"))
    first = clean(
        {
            "type": "progress",
            "prompt_id": "run",
            "data": {"access_token": "generated-secret"},
        },
    )
    second = clean(
        {
            "type": "progress",
            "prompt_id": "run",
            "data": {"message": "echo: generated-secret"},
        },
    )
    assert first["data"]["access_token"] == "[凭据已隐藏]"
    assert second["data"]["message"] == "echo: [凭据已隐藏]"


def test_last_node_execution_clears_previous_failure_in_inspection(
    environment,
):
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=redefined-outer-name
    service, _, _, _ = environment
    inspection = importlib.import_module(
        service.__class__.__module__.rsplit(".", 1)[0] + ".inspection",
    )
    record = {
        "node_statuses": {"work": "success"},
        "execution_history": [
            {"node_id": "work", "status": "failed", "error": "first attempt"},
            {
                "node_id": "work",
                "status": "completed",
                "output": [0],
                "error": None,
            },
        ],
    }
    detail = inspection.node_details(
        record,
        {"nodes": {"work": {"class_type": "OutputNode"}}},
    )["work"]
    assert "error" not in detail
    assert detail["outputs"] == [0]


def test_resumed_run_uses_original_input_credentials_for_public_redaction(
    environment,
):
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=redefined-outer-name
    service, client, _, _ = environment
    service.save_flow(
        "resume-secrets",
        {
            "id": "resume-secrets",
            "nodes": {
                "review": {
                    "class_type": "HumanReviewNode",
                    "inputs": {"reviewer": "owner"},
                    "control": {"next": "out"},
                },
                "out": {
                    "class_type": "OutputNode",
                    "inputs": {"value": "${inputs.access_token}"},
                },
            },
        },
    )
    original = service.start_run(
        "resume-secrets",
        {"access_token": "original-secret-123"},
    )
    deadline = time.monotonic() + 5
    while not original.is_done and time.monotonic() < deadline:
        time.sleep(0.01)
    assert original.is_done and original.status.value == "waiting_human"
    continued = service.resume_run(original.run_id, {"approved": True})
    wait(continued)
    response = client.get(f"/runs/{continued.run_id}")
    assert response.status_code == 200
    assert "original-secret-123" not in response.text
    assert (
        service.get_run_record(continued.run_id)["outputs"]["out"]
        == "original-secret-123"
    )


@pytest.mark.parametrize("node_id", ["tokenizer", "secret-check"])
def test_node_identity_in_output_map_is_not_a_credential_name(
    environment,
    node_id,
):
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=redefined-outer-name
    service, client, _, _ = environment
    service.save_flow(
        "ordinary-output",
        {
            "id": "ordinary-output",
            "nodes": {
                node_id: {
                    "class_type": "OutputNode",
                    "inputs": {"value": "ordinary result"},
                },
            },
        },
    )
    handle = service.start_run("ordinary-output")
    wait(handle)
    public = client.get(f"/runs/{handle.run_id}").json()
    assert public["outputs"] == {node_id: "ordinary result"}
    assert public["node_details"][node_id]["outputs"] == ["ordinary result"]
    terminal = next(
        event
        for event in public["events"]
        if event["type"] == "execution_success"
    )
    assert terminal["data"]["outputs"] == {node_id: "ordinary result"}
    stream = client.get(f"/runs/{handle.run_id}/events")
    events = [
        json.loads(line[6:])
        for line in stream.text.splitlines()
        if line.startswith("data: ")
    ]
    terminal = next(
        event for event in events if event["type"] == "execution_success"
    )
    assert terminal["data"]["outputs"] == {node_id: "ordinary result"}
    with client.websocket_connect("/ws") as socket:
        socket.send_json({"type": "subscribe", "run_id": handle.run_id})
        for _ in range(100):
            event = socket.receive_json()
            if event["type"] == "execution_success":
                assert event["data"]["outputs"] == {node_id: "ordinary result"}
                break
        else:
            raise AssertionError("No completed output event")


# Preserve the protected regression name in the fixed inventory.
def test_named_business_credential_output_remains_redacted_when_alias_is_node_id(  # noqa: E501
    environment,
):
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=redefined-outer-name
    service, client, _, _ = environment
    service.save_flow(
        "named-credential",
        {
            "id": "named-credential",
            "nodes": {
                "api_key": {
                    "class_type": "OutputNode",
                    "inputs": {"value": "ordinary result"},
                },
            },
            "outputs": {"api_key": "actual-credential-result"},
        },
    )
    handle = service.start_run("named-credential")
    wait(handle)
    public = client.get(f"/runs/{handle.run_id}").json()
    assert public["outputs"] == {"api_key": "[凭据已隐藏]"}
    assert public["node_details"]["api_key"]["outputs"] == ["ordinary result"]
    assert "actual-credential-result" not in json.dumps(public)


def test_real_credentials_inside_node_identity_output_still_redact(
    environment,
):
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=redefined-outer-name
    service, client, _, _ = environment
    service.save_flow(
        "nested-credential",
        {
            "id": "nested-credential",
            "nodes": {
                "tokenizer": {
                    "class_type": "OutputNode",
                    "inputs": {
                        "value": {
                            "api_key": "nested-private-value",
                            "echo": "echo: nested-private-value",
                            "ordinary": "ordinary result",
                        },
                    },
                },
            },
        },
    )
    handle = service.start_run("nested-credential")
    wait(handle)
    public = client.get(f"/runs/{handle.run_id}").json()
    assert public["outputs"]["tokenizer"] == {
        "api_key": "[凭据已隐藏]",
        "echo": "echo: [凭据已隐藏]",
        "ordinary": "ordinary result",
    }
    assert (
        public["node_details"]["tokenizer"]["outputs"][0]
        == public["outputs"]["tokenizer"]
    )


def test_run_persistence_failures_log_original_cause_without_claiming_success(
    environment,
    caplog,
):
    # Retain the public Pytest environment fixture name.
    # pylint: disable=redefined-outer-name
    service, client, _, _ = environment

    store_module = importlib.import_module(
        service.__class__.__module__.rsplit(".", 1)[0] + ".engine.state_store",
    )

    class BrokenStore(store_module.InMemoryWorkflowStateStore):
        async def save(self, snapshot):
            raise PermissionError("checkpoint locked by scanner")

    # Exercise failure in the real executor persistence path.
    # pylint: disable-next=protected-access
    service._executor.state_store = BrokenStore()
    service.save_flow(
        "write-failure",
        {
            "id": "write-failure",
            "nodes": {
                "out": {"class_type": "OutputNode", "inputs": {"value": 0}},
            },
        },
    )
    handle = service.start_run("write-failure")
    deadline = time.monotonic() + 5
    while not handle.is_done and time.monotonic() < deadline:
        time.sleep(0.01)
    assert handle.is_done
    record = client.get(f"/runs/{handle.run_id}").json()
    assert record["status"] == "failed"
    assert record["outputs"] == {}
    assert "workflow_run_failed" in caplog.text
    assert "PermissionError" in record["error"]
    assert "checkpoint locked by scanner" in record["error"]
    assert "PermissionError: checkpoint locked by scanner" in caplog.text
    assert "workflow checkpoint could not be persisted" in caplog.text


@pytest.mark.parametrize("winerror", [5, 32, 33])
def test_checkpoint_reader_collision_retries_without_losing_durable_results(
    environment,
    monkeypatch,
    winerror,
):
    # Retain the public Pytest environment fixture name.
    # pylint: disable=redefined-outer-name
    service, client, _, _ = environment
    package = service.__class__.__module__.rsplit(".", 1)[0]
    file_io = importlib.import_module(package + ".file_io")
    original_replace = file_io.os.replace
    attempts = []

    def replace(source, target):
        target = Path(target)
        if (
            target.parent.name == "runs"
            and target.name != "_prompt_index.json"
            and target.exists()
        ):
            attempts.append(target)
            if len(attempts) == 1:
                error = PermissionError(
                    "reader temporarily denies replacement",
                )
                error.winerror = winerror
                raise error
        return original_replace(source, target)

    monkeypatch.setattr(file_io.os, "replace", replace)
    service.save_flow(
        "checkpoint-reader",
        {
            "id": "checkpoint-reader",
            "nodes": {
                "out": {
                    "class_type": "OutputNode",
                    "inputs": {"value": {"count": 0, "approved": False}},
                },
            },
        },
    )
    handle = service.start_run("checkpoint-reader")
    wait(handle)
    assert len(attempts) >= 2
    record = client.get(f"/runs/{handle.run_id}").json()
    assert record["status"] == "completed"
    assert record["node_details"]["out"]["outputs"] == [
        {"count": 0, "approved": False},
    ]
    store_module = importlib.import_module(package + ".engine.state_store")
    reopened = store_module.JsonWorkflowStateStore(service.flows_dir)
    snapshot = asyncio.run(reopened.load_by_prompt_id(handle.run_id))
    assert snapshot.state.outputs["out"] == [{"count": 0, "approved": False}]
    assert not list((service.flows_dir / "runs").glob(".*.json.*"))


def test_persistent_checkpoint_collision_keeps_previous_snapshot_and_fails(
    environment,
    monkeypatch,
):
    # Retain the public Pytest environment fixture name.
    # pylint: disable=redefined-outer-name
    service, client, _, _ = environment
    package = service.__class__.__module__.rsplit(".", 1)[0]
    file_io = importlib.import_module(package + ".file_io")
    original_replace = file_io.os.replace
    attempts = []

    previous = []

    def replace(source, target):
        target = Path(target)
        if (
            target.parent.name == "runs"
            and target.name != "_prompt_index.json"
            and target.exists()
        ):
            if not previous:
                previous.append(target.read_bytes())
            attempts.append(target)
            error = PermissionError("permanently denied")
            error.winerror = 5
            raise error
        return original_replace(source, target)

    monkeypatch.setattr(file_io.os, "replace", replace)
    service.save_flow(
        "checkpoint-denied",
        {
            "id": "checkpoint-denied",
            "nodes": {
                "out": {"class_type": "OutputNode", "inputs": {"value": 0}},
            },
        },
    )
    handle = service.start_run("checkpoint-denied")
    deadline = time.monotonic() + 5
    while not handle.is_done and time.monotonic() < deadline:
        time.sleep(0.01)
    assert handle.is_done
    record = client.get(f"/runs/{handle.run_id}").json()
    assert record["status"] == "failed"
    assert record["outputs"] == {}
    assert 1 < len(attempts) <= 6
    store_module = importlib.import_module(package + ".engine.state_store")
    snapshot = asyncio.run(
        store_module.JsonWorkflowStateStore(
            service.flows_dir,
        ).load_by_prompt_id(handle.run_id),
    )
    assert snapshot is not None
    assert attempts[-1].read_bytes() == previous[0]
    assert snapshot.state.outputs == {"out": [0]}
    assert not list((service.flows_dir / "runs").glob(".*.json.*"))


def test_node_details_ignore_malformed_event_ids(environment):
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=redefined-outer-name
    _, _, service_module, _ = environment
    inspection = importlib.import_module(
        f"{service_module.__package__}.inspection",
    )
    record = {"node_statuses": {"task": "completed"}}
    snapshot = {"nodes": {"task": {"class_type": "Source"}, "1": {}}}
    events = [
        {"node_id": None, "state": {"error": "unaddressed"}},
        {"node_id": ["task"], "state": {"error": "unhashable"}},
        {"node_id": 1, "state": {"status": "failed", "error": "numeric"}},
        {
            "node_id": "task",
            "state": {"status": "completed", "metadata": {"duration_ms": 7}},
        },
    ]
    original = copy.deepcopy((record, snapshot, events))
    details = inspection.node_details(record, snapshot, events=events)
    assert set(details) == {"task", "1"}
    assert details["task"]["duration_ms"] == 7
    assert "error" not in details["task"]
    assert details["1"]["status"] == "not_executed"
    assert "error" not in details["1"]
    assert (record, snapshot, events) == original
