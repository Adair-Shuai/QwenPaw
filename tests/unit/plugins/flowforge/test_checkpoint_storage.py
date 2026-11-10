# -*- coding: utf-8 -*-
"""Durable checkpoint faults, recovery and public transport diagnostics."""
# pylint: disable=protected-access

import asyncio
from concurrent.futures import ThreadPoolExecutor
import errno
import importlib
import json
from pathlib import Path
import time

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient


@pytest.fixture(
    params=["qwenpaw.plugins_bundle", "plugins.bundle"],
    name="stores",
)
def store_modules(request):
    return importlib.import_module(
        f"{request.param}.flowforge.engine.state_store",
    )


def snapshot(stores, prompt="run", value="中文 English café 🙂"):
    return stores.WorkflowRunSnapshot(
        state=stores.WorkflowState(
            workflow_id="checkpoint",
            inputs={"value": value},
        ),
        output_cache={},
        dynamic_prompt={},
        blocked_nodes=[],
        prompt_id=prompt,
    )


def wait(handle):
    deadline = time.monotonic() + 8
    while not handle.is_done and time.monotonic() < deadline:
        time.sleep(0.01)
    assert handle.is_done


def test_configured_storage_failure_does_not_fall_back_to_memory(
    stores,
    tmp_path,
    caplog,
):
    invalid_root = tmp_path / "not-a-directory"
    invalid_root.write_text("retained", encoding="utf8")
    with pytest.raises(stores.CheckpointStorageError) as caught:
        stores.build_workflow_state_store(invalid_root)
    assert "initialize" in str(caught.value)
    assert str(invalid_root) in str(caught.value)
    assert isinstance(caught.value.__cause__, OSError)
    assert invalid_root.read_text() == "retained"
    assert "workflow_checkpoint_initialize_failed" in caplog.text
    assert isinstance(
        stores.build_workflow_state_store(None),
        stores.InMemoryWorkflowStateStore,
    )


def test_disk_full_preserves_previous_checkpoint_and_logs_cause(
    stores,
    tmp_path,
    monkeypatch,
    caplog,
):
    store = stores.JsonWorkflowStateStore(tmp_path)
    saved = snapshot(stores)
    asyncio.run(store.save(saved))
    path = tmp_path / "runs" / f"{saved.state.id}.json"
    original = path.read_bytes()
    saved.state.variables["secret_token"] = "do-not-log-payload"

    def disk_full(_descriptor):
        raise OSError(errno.ENOSPC, "disk full")

    monkeypatch.setattr(stores.os, "fsync", disk_full)
    with pytest.raises(stores.CheckpointStorageError) as caught:
        asyncio.run(store.save(saved))
    assert "errno=28" in str(caught.value)
    assert str(path) in str(caught.value)
    assert isinstance(caught.value.__cause__, OSError)
    assert path.read_bytes() == original
    assert "workflow_checkpoint_write_failed" in caplog.text
    assert "do-not-log-payload" not in caplog.text
    assert not list(path.parent.glob(".*"))


def test_serialization_failure_preserves_previous_checkpoint(
    stores,
    tmp_path,
    caplog,
):
    store = stores.JsonWorkflowStateStore(tmp_path)
    saved = snapshot(stores)
    asyncio.run(store.save(saved))
    path = tmp_path / "runs" / f"{saved.state.id}.json"
    original = path.read_bytes()
    saved.state.variables["unsupported"] = object()
    with pytest.raises(stores.CheckpointStorageError) as caught:
        asyncio.run(store.save(saved))
    assert "serialize" in str(caught.value)
    assert str(path) in str(caught.value)
    assert path.read_bytes() == original
    assert "workflow_checkpoint_serialize_failed" in caplog.text


def test_temp_cleanup_failure_keeps_original_write_error(
    stores,
    tmp_path,
    monkeypatch,
    caplog,
):
    store = stores.JsonWorkflowStateStore(tmp_path)
    original_unlink = Path.unlink

    def disk_full(_descriptor):
        raise OSError(errno.ENOSPC, "original disk failure")

    def locked_temporary(path, *args, **kwargs):
        if path.parent == tmp_path / "runs" and path.name.startswith("."):
            raise PermissionError("temporary cleanup denied")
        return original_unlink(path, *args, **kwargs)

    with monkeypatch.context() as patch:
        patch.setattr(stores.os, "fsync", disk_full)
        patch.setattr(Path, "unlink", locked_temporary)
        with pytest.raises(stores.CheckpointStorageError) as caught:
            asyncio.run(store.save(snapshot(stores)))
    assert "errno=28" in str(caught.value)
    assert "original disk failure" in str(caught.value)
    assert caught.value.__cause__.errno == errno.ENOSPC
    assert "workflow_checkpoint_temp_cleanup_failed" in caplog.text


def test_concurrent_stores_recover_entries_after_index_loss(stores, tmp_path):
    first = stores.JsonWorkflowStateStore(tmp_path)
    second = stores.JsonWorkflowStateStore(tmp_path)
    snapshots = [
        snapshot(stores, "中文-run"),
        snapshot(stores, "english-run", "Hello"),
    ]
    with ThreadPoolExecutor(max_workers=2) as pool:
        jobs = [
            pool.submit(asyncio.run, store.save(saved))
            for store, saved in zip([first, second], snapshots)
        ]
        for job in jobs:
            job.result(timeout=8)
    index = tmp_path / "runs" / "_prompt_index.json"
    assert isinstance(json.loads(index.read_text(encoding="utf8")), dict)
    index.write_text("{}", encoding="utf8")
    reopened = stores.JsonWorkflowStateStore(tmp_path)
    for saved in snapshots:
        recovered = asyncio.run(reopened.load_by_prompt_id(saved.prompt_id))
        assert recovered.state.id == saved.state.id
        assert recovered.state.inputs == saved.state.inputs


def test_failed_index_write_is_diagnostic_and_does_not_commit_memory_index(
    stores,
    tmp_path,
    monkeypatch,
):
    store = stores.JsonWorkflowStateStore(tmp_path)
    saved = snapshot(stores)
    file_io = importlib.import_module(
        stores.__package__.rsplit(".", 1)[0] + ".file_io",
    )
    original_replace = file_io.os.replace

    def locked_index(source, target):
        if Path(target).name == "_prompt_index.json":
            error = PermissionError(errno.EACCES, "index is locked")
            error.winerror = 32
            raise error
        return original_replace(source, target)

    with monkeypatch.context() as patch:
        patch.setattr(file_io.os, "replace", locked_index)
        with pytest.raises(stores.CheckpointStorageError) as caught:
            asyncio.run(store.save(saved))
    assert "_prompt_index.json" in str(caught.value)
    assert "winerror=32" in str(caught.value)
    assert saved.prompt_id not in store._index
    reopened = stores.JsonWorkflowStateStore(tmp_path)
    recovered = asyncio.run(reopened.load_by_prompt_id(saved.prompt_id))
    assert recovered.state.inputs == saved.state.inputs


@pytest.mark.parametrize("contents", ["invalid JSON", "[]", "{}", None])
def test_index_recovery_survives_http_resume_and_protects_original_inputs(
    stores,
    tmp_path,
    contents,
):
    package = stores.__package__.rsplit(".", 1)[0]
    service_module = importlib.import_module(package + ".service")
    router_module = importlib.import_module(package + ".router")
    service = service_module.WorkflowService(flows_dir=tmp_path)
    try:
        service.save_flow(
            "review",
            {
                "id": "review",
                "nodes": {
                    "input": {
                        "class_type": "InputNode",
                        "inputs": {"name": "access_token"},
                    },
                    "review": {
                        "class_type": "HumanReviewNode",
                        "inputs": {
                            "reviewer": "owner",
                            "__flow_dependencies": [["input", 0]],
                        },
                        "control": {"next": "output"},
                    },
                    "output": {
                        "class_type": "OutputNode",
                        "inputs": {"value": ["input", 0]},
                    },
                },
                "outputs": ["output"],
            },
        )
        original = service.start_run(
            "review",
            {"access_token": "original-secret-中文"},
        )
        wait(original)
        assert original.status.value == "waiting_human"
        state_id = original.state_id
        original_id = original.run_id
    finally:
        service.close(timeout=3)
    index_path = tmp_path / "runs" / "_prompt_index.json"
    if contents is None:
        index_path.unlink()
    else:
        index_path.write_text(contents, encoding="utf8")
    service = service_module.WorkflowService(flows_dir=tmp_path)
    app = FastAPI()
    app.include_router(router_module.build_router(service))
    try:
        recovered = asyncio.run(
            service.executor.state_store.load_by_prompt_id(original_id),
        )
        assert recovered.state.id == state_id
        with TestClient(app) as client:
            response = client.post(
                f"/runs/{original_id}/resume",
                json={"inputs": {"approved": True}},
            )
            assert response.status_code == 200, response.text
            continued_id = response.json()["run_id"]
            continued = service.get_run(continued_id)
            wait(continued)
            assert continued.status.value == "completed", continued.error
            raw = service.get_run_record(continued_id)
            assert raw["outputs"]["output"] == "original-secret-中文"
            assert (
                sum(
                    entry["node_id"] == "input"
                    for entry in raw["execution_history"]
                )
                == 1
            )
            # Even a subsequent index loss preserves credential redaction for
            # the parent and the continuation through their durable state ID.
            index_path.unlink()
            for run_id in [original_id, continued_id]:
                response = client.get(f"/runs/{run_id}")
                assert response.status_code == 200
                assert "original-secret" not in response.text
                assert "[凭据已隐藏]" in response.text
    finally:
        service.close(timeout=3)


def test_corrupt_checkpoint_is_reported_by_http_sse_and_websocket(
    stores,
    tmp_path,
):
    package = stores.__package__.rsplit(".", 1)[0]
    service_module = importlib.import_module(package + ".service")
    router_module = importlib.import_module(package + ".router")
    service = service_module.WorkflowService(flows_dir=tmp_path)
    app = FastAPI()
    app.include_router(router_module.build_router(service))
    try:
        service.save_flow(
            "one",
            {
                "id": "one",
                "nodes": {
                    "out": {
                        "class_type": "OutputNode",
                        "inputs": {"value": "你好 Hello"},
                    },
                },
            },
        )
        handle = service.start_run("one")
        wait(handle)
        assert handle.status.value == "completed"
        path = tmp_path / "runs" / f"{handle.state_id}.json"
        path.write_text("invalid checkpoint", encoding="utf8")
        with TestClient(app) as client:
            for route in [
                f"/runs/{handle.run_id}",
                "/runs",
                f"/runs/{handle.run_id}/events",
            ]:
                response = client.get(route)
                assert response.status_code == 503
                detail = response.json()["detail"]
                assert str(path) in detail
                assert "JSONDecodeError" in detail
            with client.websocket_connect("/ws") as socket:
                socket.send_json(
                    {"type": "subscribe", "run_id": handle.run_id},
                )
                message = socket.receive_json()
                assert message["code"] == "CHECKPOINT_STORAGE_ERROR"
                assert str(path) in message["error"]
        assert path.read_text() == "invalid checkpoint"
    finally:
        service.close(timeout=3)


def test_http_write_failure_exposes_path_and_codes_then_allows_retry(
    stores,
    tmp_path,
    monkeypatch,
):
    package = stores.__package__.rsplit(".", 1)[0]
    service_module = importlib.import_module(package + ".service")
    router_module = importlib.import_module(package + ".router")
    file_io = importlib.import_module(package + ".file_io")
    service = service_module.WorkflowService(flows_dir=tmp_path)
    app = FastAPI()
    app.include_router(router_module.build_router(service))
    original_replace = file_io.os.replace

    def denied_checkpoint(source, target):
        if Path(target).parent == tmp_path / "runs":
            error = PermissionError(errno.EACCES, "checkpoint file denied")
            error.winerror = 5
            raise error
        return original_replace(source, target)

    try:
        service.save_flow(
            "retry",
            {
                "id": "retry",
                "nodes": {
                    "out": {
                        "class_type": "OutputNode",
                        "inputs": {"value": "中文 English"},
                    },
                },
            },
        )
        with TestClient(app) as client:
            with monkeypatch.context() as patch:
                patch.setattr(file_io.os, "replace", denied_checkpoint)
                started = client.post("/flows/retry/run", json={})
                assert started.status_code == 200
                run_id = started.json()["run_id"]
                wait(service.get_run(run_id))
                response = client.get(f"/runs/{run_id}")
                assert response.status_code == 200, response.text
                record = response.json()
                assert record["status"] == "failed"
                assert record["outputs"] == {}
                assert "PermissionError" in record["error"]
                assert "errno=13" in record["error"]
                assert "winerror=5" in record["error"]
                assert str(tmp_path / "runs") in record["error"]
            started = client.post("/flows/retry/run", json={})
            run_id = started.json()["run_id"]
            wait(service.get_run(run_id))
            response = client.get(f"/runs/{run_id}")
            assert response.json()["status"] == "completed"
            assert response.json()["outputs"] == {"out": "中文 English"}
    finally:
        service.close(timeout=3)
