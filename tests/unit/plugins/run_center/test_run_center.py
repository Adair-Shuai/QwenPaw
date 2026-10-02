# -*- coding: utf-8 -*-
"""R0 contract and legacy-bridge tests for the independent Run Center."""

from __future__ import annotations

import json
import sqlite3
import importlib.util
import sys
import threading
import time
from pathlib import Path

import pytest

from fastapi import FastAPI
from fastapi.testclient import TestClient


_PLUGIN_ROOT = (
    Path(__file__).parents[4] / "plugins" / "bundle" / "qwenpaw-run-center"
)


def _runtime_module():
    name = "test_run_center_runtime"
    if name in sys.modules:
        return sys.modules[name]
    spec = importlib.util.spec_from_file_location(
        name,
        _PLUGIN_ROOT / "runtime" / "__init__.py",
        submodule_search_locations=[str(_PLUGIN_ROOT / "runtime")],
    )
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


runtime = _runtime_module()
build_router = sys.modules["test_run_center_runtime.api"].build_router
repository_module = sys.modules["test_run_center_runtime.repository"]
descriptor_module = sys.modules["test_run_center_runtime.descriptors"]
RunRepository = runtime.RunRepository
CONTRACT_VERSION = runtime.CONTRACT_VERSION
normalize_legacy_status = sys.modules[
    "test_run_center_runtime.models"
].normalize_legacy_status
ArtifactRef = runtime.ArtifactRef
Event = runtime.Event
Run = runtime.Run
Stage = runtime.Stage
Checkpoint = runtime.Checkpoint
ExecutionCancelled = runtime.ExecutionCancelled
RunExecutorService = runtime.RunExecutorService


def _legacy_store(
    root: Path,
    job_id: str = "legacy-1",
    *,
    payload: dict | None = None,
    event: dict | None = None,
) -> None:
    path = root / "ugsci" / "jobs.sqlite3"
    path.parent.mkdir(parents=True)
    conn = sqlite3.connect(path)
    conn.execute(
        "CREATE TABLE jobs (job_id TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at TEXT NOT NULL)",
    )
    conn.execute(
        "CREATE TABLE job_events (job_id TEXT NOT NULL, sequence INTEGER NOT NULL, payload TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY(job_id, sequence))",
    )
    payload = payload or {
        "status": "completed",
        "simulator": "Eclipse",
        "start_ts": 10,
    }
    conn.execute(
        "INSERT INTO jobs VALUES (?, ?, ?)",
        (job_id, json.dumps(payload), "2026-09-05T00:00:00+00:00"),
    )
    conn.execute(
        "INSERT INTO job_events VALUES (?, ?, ?, ?)",
        (
            job_id,
            1,
            json.dumps(event or {"status": "running"}),
            "2026-09-05T00:00:01+00:00",
        ),
    )
    conn.commit()
    conn.close()


def test_legacy_jobs_are_read_as_stable_runs(tmp_path, monkeypatch) -> None:
    _legacy_store(tmp_path)
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")

    runs = repository.list_runs()
    assert len(runs) == 1
    assert runs[0]["run_id"] == "ugsci:legacy-1"
    assert runs[0]["source_run_id"] == "legacy-1"
    assert runs[0]["operation"] == "simulation.run"
    assert runs[0]["status"] == "succeeded"
    assert runs[0]["source"] == "ugsci-legacy"

    events = repository.list_events("ugsci:legacy-1")
    assert events[0]["sequence"] == 1
    assert events[0]["seq"] == 1
    assert events[0]["type"] == "legacy.snapshot"
    assert repository.get_run("legacy-1")["run_id"] == "ugsci:legacy-1"
    assert repository.list_events("legacy-1")[0]["sequence"] == 1


def test_run_center_api_has_r0_contract(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    app = FastAPI()
    app.include_router(
        build_router(RunRepository(tmp_path / "run-center")),
        prefix="/api/run-center",
    )

    with TestClient(app) as client:
        health = client.get("/api/run-center/health")
        assert health.status_code == 200
        assert health.json()["contract_version"] == CONTRACT_VERSION
        assert health.json()["database"] == "runs.sqlite3"
        assert "/" not in health.json()["database"]

        listing = client.get("/api/run-center/runs")
        assert listing.status_code == 200
        assert listing.json()["runs"] == []

        missing = client.get("/api/run-center/runs/missing")
        assert missing.status_code == 404


def test_health_distinguishes_contracts_from_optional_runtime_services(
    tmp_path, monkeypatch
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    app = FastAPI()
    app.include_router(
        build_router(RunRepository(tmp_path / "run-center")),
        prefix="/api/run-center",
    )
    with TestClient(app) as client:
        capabilities = client.get("/api/run-center/health").json()[
            "capabilities"
        ]
    assert capabilities["stage_contract"] is True
    assert capabilities["stage_persistence"] is True
    assert capabilities["model_registry"] is False
    assert capabilities["study_engine"] is False
    assert capabilities["doe"] == []


def test_health_executor_runtime_reflects_actual_worker_lifecycle(
    tmp_path, monkeypatch
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    service = RunExecutorService(repository)
    app = FastAPI()
    app.include_router(
        build_router(repository, executor_service=service),
        prefix="/api/run-center",
    )
    with TestClient(app) as client:
        before = client.get("/api/run-center/health").json()["capabilities"]
        service.start()
        after = client.get("/api/run-center/health").json()["capabilities"]
        service.stop(wait=True)
    assert before["executor_runtime"] is False
    assert before["restart_recovery"] is False
    assert after["executor_runtime"] is True
    assert after["restart_recovery"] is True


def test_resource_pool_and_queue_snapshot_report_local_capacity(
    tmp_path, monkeypatch
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    service = RunExecutorService(repository, max_workers=3)
    app = FastAPI()
    app.include_router(
        build_router(repository, executor_service=service),
        prefix="/api/run-center",
    )
    repository.create_run(
        {
            "run_id": "queued-1",
            "operation": "test.calculate",
            "status": "queued",
        }
    )
    with TestClient(app) as client:
        pools = client.get("/api/run-center/resource-pools")
        queue = client.get("/api/run-center/queue")
    assert pools.status_code == 200
    pool = pools.json()["resource_pools"][0]
    assert pool["pool_id"] == "local"
    assert pool["max_workers"] == 3
    assert pool["status"] == "stopped"
    assert pool["queue"]["queued"] == 1
    assert queue.json()["counts"]["queued"] == 1
    assert queue.json()["executor_started"] is False
    assert queue.json()["executor"]["submitted"] == 0
    assert queue.json()["executor"]["active"] == 0


def test_executor_snapshot_separates_pending_from_active_workers(
    tmp_path, monkeypatch
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    entered = threading.Event()
    release = threading.Event()

    def handler(context, _payload):
        entered.set()
        release.wait(2)
        return {"ok": True}

    service = RunExecutorService(repository, max_workers=1)
    service.register("test.snapshot", handler)
    repository.create_run(
        {"run_id": "snapshot-1", "operation": "test.snapshot"}
    )
    repository.create_run(
        {"run_id": "snapshot-2", "operation": "test.snapshot"}
    )
    service.submit("snapshot-1")
    assert entered.wait(2)
    service.submit("snapshot-2")
    snapshot = service.snapshot()
    assert snapshot["submitted"] == 2
    assert snapshot["active"] == 1
    assert snapshot["pending"] == 1
    assert service.active_runs == 1
    assert service.pending_runs == 1
    release.set()
    for _ in range(100):
        if repository.get_run("snapshot-2")["status"] == "succeeded":
            break
        time.sleep(0.01)
    service.stop(wait=True)
    assert repository.get_run("snapshot-2")["status"] == "succeeded"


def test_legacy_status_mapping() -> None:
    assert normalize_legacy_status("completed") == "succeeded"
    assert normalize_legacy_status("timeout") == "failed"
    assert normalize_legacy_status("unknown") == "blocked"
    assert normalize_legacy_status("not-a-status") == "blocked"


def test_operation_registry_is_json_only_and_queryable(
    tmp_path, monkeypatch
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    repository.register_operation(
        "storage.inventory.evaluate",
        {"title": "库存评价", "supports_pause": False},
        provider_id="ugsci",
    )
    operations = repository.list_operations()
    assert operations[0]["operation"] == "storage.inventory.evaluate"
    assert operations[0]["descriptor"]["supports_pause"] is False


def test_operation_descriptor_boundary_adds_stable_contract_defaults() -> None:
    normalize = descriptor_module.normalize_operation_descriptor
    value = normalize(
        {"title": "库存评价"}, operation="storage.inventory.evaluate"
    )
    assert value["operation"] == "storage.inventory.evaluate"
    assert value["descriptor_contract_version"] == "1.0"
    assert value["input_schema"]["type"] == "object"
    assert value["output_schema"]["type"] == "object"
    assert value["units"]["system"] == "SI"
    assert value["resources"]["pool"] == "local"
    assert value["risk"]["level"] == "medium"
    assert value["estimate"]["method"] == "provider"
    assert value["supports_pause"] is False
    assert value["supports_cancel"] is True


def test_operation_descriptor_input_validation_endpoint(
    tmp_path, monkeypatch
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    repository.register_operation(
        "storage.inventory.evaluate",
        {
            "title": "库存评价",
            "input_schema": {
                "type": "object",
                "required": ["project_id"],
                "properties": {
                    "project_id": {"type": "string", "minLength": 1}
                },
            },
        },
        provider_id="ugsci",
    )
    app = FastAPI()
    app.include_router(build_router(repository), prefix="/api/run-center")
    with TestClient(app) as client:
        listed = client.get("/api/run-center/operations")
        assert listed.status_code == 200
        listed_descriptor = listed.json()["operations"][0]["descriptor"]
        assert listed_descriptor["input_schema"]["type"] == "object"
        assert listed_descriptor["supports_cancel"] is True
        descriptor = client.get(
            "/api/run-center/operations/storage.inventory.evaluate?provider_id=ugsci",
        )
        assert descriptor.status_code == 200
        body = descriptor.json()["descriptor"]
        assert body["input_schema"]["required"] == ["project_id"]
        assert "resources" in body and "risk" in body and "estimate" in body
        valid = client.post(
            "/api/run-center/operations/storage.inventory.evaluate/validate?provider_id=ugsci",
            json={"project_id": "p1"},
        )
        assert valid.status_code == 200
        assert valid.json()["valid"] is True
        invalid = client.post(
            "/api/run-center/operations/storage.inventory.evaluate/validate?provider_id=ugsci",
            json={},
        )
        assert invalid.status_code == 200
        assert invalid.json()["valid"] is False
        assert "project_id" in invalid.json()["errors"][0]
        wrong_type = client.post(
            "/api/run-center/operations/storage.inventory.evaluate/validate?provider_id=ugsci",
            json=["p1"],
        )
        assert wrong_type.status_code == 200
        assert wrong_type.json()["valid"] is False


def test_operation_registry_snapshot_removes_unloaded_providers(
    tmp_path,
    monkeypatch,
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    repository.replace_operations(
        [
            {
                "operation": "simulation.run",
                "provider_id": "ugsci",
                "contract_version": "1.0",
                "descriptor": {"title": "UGSci"},
            },
            {
                "operation": "simulation.run",
                "provider_id": "remote",
                "contract_version": "1.0",
                "descriptor": {"title": "Remote"},
            },
        ],
    )
    repository.replace_operations(
        [
            {
                "operation": "simulation.run",
                "provider_id": "remote",
                "contract_version": "1.0",
                "descriptor": {"title": "Remote v2"},
            },
        ],
    )

    operations = repository.list_operations()
    assert [
        (item["operation"], item["provider_id"]) for item in operations
    ] == [
        ("simulation.run", "remote"),
    ]
    assert operations[0]["descriptor"]["title"] == "Remote v2"


def test_public_contracts_are_json_safe() -> None:
    artifact = ArtifactRef(
        ref_id="a1", uri="workspace://result.csv", sha256="abc"
    )
    stage = Stage(
        stage_id="validate", operation="data.validate", output_refs=(artifact,)
    )
    run = Run(
        run_id="r1",
        operation="storage.inventory.evaluate",
        stages=(stage,),
        artifacts=(artifact,),
    )
    event = Event(
        run_id="r1",
        sequence=1,
        event_type="stage.progress",
        stage_id="validate",
    )
    checkpoint = Checkpoint(
        checkpoint_id="c1", run_id="r1", artifact_ref=artifact
    )

    assert run.to_dict()["stages"][0]["output_refs"][0]["ref_id"] == "a1"
    assert event.to_dict()["seq"] == 1
    assert event.to_dict()["type"] == "stage.progress"
    assert checkpoint.to_dict()["artifact_ref"]["ref_id"] == "a1"


def test_native_timestamps_and_legacy_bridge_are_globally_sorted(
    tmp_path, monkeypatch
) -> None:
    _legacy_store(tmp_path, job_id="same-id")
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    repository.initialize()
    with repository._connection(
        write=True
    ) as conn:  # noqa: SLF001 - contract fixture
        conn.execute(
            "INSERT INTO runs (run_id, operation, status, payload, created_at, updated_at) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (
                "native-id",
                "simulation.run",
                "succeeded",
                "{}",
                "2026-09-05T00:00:00+00:00",
                "2026-09-05T00:00:02+00:00",
            ),
        )
    runs = repository.list_runs(limit=2)
    assert [item["run_id"] for item in runs] == ["native-id", "ugsci:same-id"]
    assert runs[0]["created_at"] == "2026-09-05T00:00:00+00:00"
    assert runs[0]["updated_at"] == "2026-09-05T00:00:02+00:00"
    assert repository.list_events("native-id") == []


def test_native_empty_event_stream_never_borrows_legacy_events(
    tmp_path,
    monkeypatch,
) -> None:
    _legacy_store(tmp_path, job_id="same-id")
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    repository.initialize()
    with repository._connection(write=True) as conn:  # noqa: SLF001
        conn.execute(
            "INSERT INTO runs (run_id, operation, status, payload, created_at, updated_at) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (
                "same-id",
                "native.operation",
                "draft",
                "{}",
                "2026-09-05T00:00:00+00:00",
                "2026-09-05T00:00:00+00:00",
            ),
        )

    assert repository.list_events("same-id") == []


def test_visualization_legacy_events_keep_their_event_type(
    tmp_path,
    monkeypatch,
) -> None:
    _legacy_store(
        tmp_path,
        job_id="import-1",
        payload={
            "status": "completed",
            "operation": "visualization.import",
            "job_type": "visualization_import",
        },
        event={
            "type": "stage",
            "data": {"stage": "reading-source"},
            "ts": 10,
        },
    )
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    event = RunRepository(tmp_path / "run-center").list_events(
        "ugsci:import-1",
    )[0]

    assert event["type"] == "stage"
    assert event["data"] == {"stage": "reading-source"}


def test_project_filter_excludes_unscoped_legacy_jobs(
    tmp_path, monkeypatch
) -> None:
    _legacy_store(tmp_path, job_id="legacy-projectless")
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    assert repository.list_runs(project_id="project-a") == []


def test_native_run_create_event_and_transition(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    created = repository.create_run(
        {"run_id": "m1", "operation": "simulation.run", "project_id": "p1"}
    )
    assert created["run_id"] == "m1"
    assert created["status"] == "draft"
    event = repository.append_event("m1", "log.line", {"message": "hello"})
    assert event["sequence"] == 2  # run.created is the first durable event
    transitioned = repository.transition("m1", "queued")
    assert transitioned["status"] == "queued"
    assert transitioned["event"]["data"]["to"] == "queued"
    assert len(repository.list_events("m1")) == 3


def test_native_run_state_machine_rejects_terminal_and_legacy_writes(
    tmp_path, monkeypatch
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    repository.create_run({"run_id": "m1", "operation": "simulation.run"})
    repository.transition("m1", "queued")
    repository.transition("m1", "running")
    repository.transition("m1", "succeeded")
    import pytest

    with pytest.raises(ValueError, match="Invalid run transition"):
        repository.transition("m1", "running")
    with pytest.raises(ValueError, match="Terminal run is immutable"):
        repository.transition("m1", "succeeded")
    with pytest.raises(ValueError, match="Terminal run is immutable"):
        repository.append_event("m1", "late.worker.event")
    with pytest.raises(ValueError, match="legacy"):
        repository.append_event("ugsci:x", "log.line")


def test_queued_run_can_be_paused_and_resumed(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    repository.create_run(
        {"run_id": "queued-pause", "operation": "simulation.run"}
    )
    repository.transition("queued-pause", "queued")

    paused = repository.control("queued-pause", "pause")
    assert paused["status"] == "paused"
    resumed = repository.control("queued-pause", "resume")
    assert resumed["status"] == "queued"


def test_create_run_idempotency_key_is_stable(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    first = repository.create_run(
        {"operation": "simulation.run", "idempotency_key": "same"}
    )
    second = repository.create_run(
        {"operation": "simulation.run", "idempotency_key": "same"}
    )
    assert first["run_id"] == second["run_id"]
    assert len(repository.list_runs()) == 1


def test_empty_idempotency_key_is_not_indexed(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")

    first = repository.create_run(
        {"operation": "simulation.run"},
        idempotency_key="  ",
    )
    second = repository.create_run(
        {"operation": "simulation.run"},
        idempotency_key="",
    )

    assert first["run_id"] != second["run_id"]
    assert len(repository.list_runs()) == 2


def test_old_database_migration_tolerates_bad_json_and_duplicate_keys(
    tmp_path,
    monkeypatch,
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    root = tmp_path / "run-center"
    root.mkdir()
    database = root / "runs.sqlite3"
    with sqlite3.connect(database) as conn:
        conn.execute(
            "CREATE TABLE runs ("
            "run_id TEXT PRIMARY KEY, operation TEXT NOT NULL, status TEXT NOT NULL, "
            "phase TEXT NOT NULL DEFAULT '', progress REAL, project_id TEXT, "
            "parent_run_id TEXT, model_version_id TEXT, study_id TEXT, "
            "payload TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)",
        )
        rows = [
            ("bad", "{not-json"),
            ("first", json.dumps({"idempotency_key": "same"})),
            ("second", json.dumps({"idempotency_key": "same"})),
        ]
        conn.executemany(
            "INSERT INTO runs "
            "(run_id, operation, status, payload, created_at, updated_at) "
            "VALUES (?, 'simulation.run', 'draft', ?, 'now', 'now')",
            rows,
        )

    repository = RunRepository(root)
    repository.initialize()
    with sqlite3.connect(database) as conn:
        keys = dict(
            conn.execute(
                "SELECT run_id, idempotency_key FROM runs ORDER BY rowid",
            ),
        )

    assert keys == {"bad": None, "first": "same", "second": None}


def test_native_write_api(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    app = FastAPI()
    app.include_router(
        build_router(RunRepository(tmp_path / "run-center")),
        prefix="/api/run-center",
    )
    with TestClient(app) as client:
        created = client.post(
            "/api/run-center/runs",
            json={
                "run_id": "api-1",
                "operation": "storage.inventory.evaluate",
            },
        )
        assert created.status_code == 201
        event = client.post(
            "/api/run-center/runs/api-1/events",
            json={"type": "metric", "data": {"value": 1}},
        )
        assert event.status_code == 201
        transition = client.post(
            "/api/run-center/runs/api-1/transition", json={"status": "queued"}
        )
        assert transition.status_code == 200
        assert (
            client.post(
                "/api/run-center/runs/missing/events", json={"type": "x"}
            ).status_code
            == 404
        )


def test_public_run_creation_rejects_terminal_and_execution_fields(
    tmp_path, monkeypatch
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    app = FastAPI()
    app.include_router(
        build_router(RunRepository(tmp_path / "run-center")),
        prefix="/api/run-center",
    )
    with TestClient(app) as client:
        terminal = client.post(
            "/api/run-center/runs",
            json={"operation": "simulation.run", "status": "succeeded"},
        )
        assert terminal.status_code == 400
        assert "draft or queued" in terminal.json()["detail"]

        injected = client.post(
            "/api/run-center/runs",
            json={
                "operation": "simulation.run",
                "payload": {"command": ["cmd", "/c", "whoami"]},
            },
        )
        assert injected.status_code == 400
        assert "reserved for trusted providers" in injected.json()["detail"]

        nested_path = client.post(
            "/api/run-center/runs",
            json={
                "operation": "storage.inventory.evaluate",
                "input_snapshot": {"working_dir": "C:/outside"},
            },
        )
        assert nested_path.status_code == 400


def test_api_rejects_unknown_query_status(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    app = FastAPI()
    app.include_router(
        build_router(RunRepository(tmp_path / "run-center")),
        prefix="/api/run-center",
    )
    with TestClient(app) as client:
        response = client.get("/api/run-center/runs?status=typo")
    assert response.status_code == 422


def test_existing_r0_database_is_migrated_and_idempotency_is_indexed(
    tmp_path, monkeypatch
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    root = tmp_path / "run-center"
    root.mkdir()
    db = root / "runs.sqlite3"
    conn = sqlite3.connect(db)
    conn.execute(
        "CREATE TABLE runs (run_id TEXT PRIMARY KEY, operation TEXT NOT NULL, status TEXT NOT NULL, phase TEXT NOT NULL DEFAULT '', progress REAL, project_id TEXT, parent_run_id TEXT, model_version_id TEXT, study_id TEXT, payload TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"
    )
    conn.execute(
        "CREATE TABLE run_events (run_id TEXT NOT NULL, sequence INTEGER NOT NULL, event_type TEXT NOT NULL, payload TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY (run_id, sequence))"
    )
    conn.execute(
        "CREATE TABLE operation_registry (operation TEXT PRIMARY KEY, descriptor TEXT NOT NULL, contract_version TEXT NOT NULL, provider_id TEXT, updated_at TEXT NOT NULL)"
    )
    conn.execute(
        "INSERT INTO runs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (
            "old",
            "simulation.run",
            "draft",
            "",
            None,
            None,
            None,
            None,
            None,
            json.dumps({"idempotency_key": "legacy-key"}),
            "2026",
            "2026",
        ),
    )
    conn.execute(
        "INSERT INTO operation_registry VALUES (?, ?, ?, ?, ?)",
        ("simulation.run", "{}", "1.0", None, "2026"),
    )
    conn.commit()
    conn.close()
    repository = RunRepository(root)
    assert (
        repository.create_run(
            {"operation": "simulation.run", "idempotency_key": "legacy-key"}
        )["run_id"]
        == "old"
    )
    repository.register_operation(
        "simulation.run", {"title": "remote"}, provider_id="remote"
    )
    assert {item["provider_id"] for item in repository.list_operations()} == {
        None,
        "remote",
    }


def test_control_and_clone_actions_share_state_machine(
    tmp_path, monkeypatch
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    repository.create_run(
        {"run_id": "control-1", "operation": "simulation.run"}
    )
    assert repository.control("control-1", "cancel")["status"] == "cancelled"
    clone = repository.clone_run("control-1", overrides={"priority": 4})
    assert clone["parent_run_id"] == "control-1"
    assert clone["status"] == "draft"


def test_retry_clones_terminal_run_with_audit_link(
    tmp_path, monkeypatch
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    repository.create_run({"run_id": "retry-1", "operation": "simulation.run"})
    repository.transition("retry-1", "queued")
    repository.transition("retry-1", "failed", error={"kind": "timeout"})
    retry = repository.retry_run("retry-1")
    assert retry["parent_run_id"] == "retry-1"
    assert retry["payload"]["retry_of"] == "retry-1"


def test_clone_does_not_reuse_source_idempotency_key(
    tmp_path, monkeypatch
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    source = repository.create_run(
        {
            "run_id": "idem-source",
            "operation": "simulation.run",
            "idempotency_key": "source-key",
        },
    )

    clone = repository.clone_run(source["run_id"])

    assert clone["run_id"] != source["run_id"]
    assert clone["parent_run_id"] == source["run_id"]
    assert clone["idempotency_key"] is None


def test_native_json_boundaries_reject_non_finite_values(
    tmp_path, monkeypatch
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    import math
    import pytest

    with pytest.raises(ValueError, match="finite"):
        repository.create_run(
            {"operation": "simulation.run", "progress": math.nan}
        )

    repository.create_run(
        {"run_id": "finite-1", "operation": "simulation.run"}
    )
    with pytest.raises(ValueError, match="JSON-safe"):
        repository.append_event("finite-1", "metric", {"value": math.inf})
    with pytest.raises(ValueError, match="finite"):
        repository.upsert_stage(
            "finite-1",
            {
                "stage_id": "bad-progress",
                "operation": "simulation.execute",
                "progress": math.nan,
            },
        )


def test_restart_recovery_keeps_top_level_state_columns_in_sync(
    tmp_path, monkeypatch
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    repository.create_run(
        {"run_id": "recover-sync", "operation": "simulation.run"}
    )
    repository.transition("recover-sync", "queued")
    repository.transition("recover-sync", "running")

    repository.recover_incomplete_runs()

    with sqlite3.connect(repository.database) as conn:
        status, phase, progress = conn.execute(
            "SELECT status, phase, progress FROM runs WHERE run_id=?",
            ("recover-sync",),
        ).fetchone()
    assert (status, phase, progress) == ("blocked", "", None)


def test_stage_artifact_checkpoint_and_provenance_are_durable(
    tmp_path,
    monkeypatch,
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    root = tmp_path / "run-center"
    repository = RunRepository(root)
    repository.create_run(
        {"run_id": "components-1", "operation": "simulation.run"}
    )

    stage = repository.upsert_stage(
        "components-1",
        {
            "stage_id": "simulate",
            "operation": "simulation.execute",
            "status": "running",
            "progress": 0.5,
            "ordinal": 2,
            "metrics": {"iterations": 4},
            "output_refs": [
                {"ref_id": "summary", "uri": "workspace://summary.json"},
            ],
        },
    )
    artifact = repository.add_artifact(
        "components-1",
        {
            "ref_id": "report",
            "kind": "report",
            "uri": "workspace://report.pdf",
            "media_type": "application/pdf",
        },
        stage_id="simulate",
        role="output",
    )
    checkpoint = repository.create_checkpoint(
        "components-1",
        {
            "checkpoint_id": "cp-1",
            "stage_id": "simulate",
            "resume_token": "resume-safe-token",
            "artifact_ref": {
                "ref_id": "restart",
                "kind": "checkpoint",
                "uri": "workspace://restart.bin",
            },
        },
    )
    provenance = repository.upsert_provenance(
        "components-1",
        {
            "input_fingerprint": "sha256:input",
            "provider_id": "ugsci",
            "provider_version": "1.2",
            "software_version": "2026.9",
            "unit_system": "SI",
            "metadata": {"solver": "Eclipse"},
        },
        artifact_ref_id="report",
    )

    restarted = RunRepository(root)
    assert restarted.list_stages("components-1")[0]["metrics"] == {
        "iterations": 4
    }
    assert {
        item["ref_id"] for item in restarted.list_artifacts("components-1")
    } == {
        "summary",
        "report",
        "restart",
    }
    assert (
        restarted.list_checkpoints("components-1")[0]["checkpoint_id"]
        == "cp-1"
    )
    assert (
        restarted.list_provenance("components-1")[0]["artifact_ref_id"]
        == "report"
    )
    detail = restarted.get_run("components-1")
    assert detail["stages"][0]["stage_id"] == "simulate"
    assert stage["status"] == "running"
    assert artifact["ref_id"] == "report"
    assert checkpoint["artifact_ref"]["ref_id"] == "restart"
    assert provenance["input_fingerprint"] == "sha256:input"
    event_types = [
        event["type"] for event in restarted.list_events("components-1")
    ]
    assert event_types == [
        "run.created",
        "stage.created",
        "artifact.ready",
        "checkpoint.created",
        "provenance.updated",
    ]


def test_embedded_components_are_promoted_during_schema_migration(
    tmp_path,
    monkeypatch,
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    root = tmp_path / "run-center"
    root.mkdir()
    database = root / "runs.sqlite3"
    payload = {
        "stages": [
            {
                "stage_id": "validate",
                "operation": "data.validate",
                "status": "succeeded",
            },
        ],
        "artifacts": [
            {"ref_id": "legacy-report", "uri": "workspace://report"}
        ],
        "provenance": {"input_fingerprint": "legacy-input"},
    }
    with sqlite3.connect(database) as conn:
        conn.execute(
            "CREATE TABLE runs (run_id TEXT PRIMARY KEY, operation TEXT NOT NULL, "
            "status TEXT NOT NULL, phase TEXT NOT NULL DEFAULT '', progress REAL, "
            "project_id TEXT, parent_run_id TEXT, model_version_id TEXT, study_id TEXT, "
            "payload TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)",
        )
        conn.execute(
            "INSERT INTO runs VALUES "
            "('legacy-components', 'simulation.run', 'succeeded', '', NULL, NULL, "
            "NULL, NULL, NULL, ?, '2026', '2026')",
            (json.dumps(payload),),
        )

    repository = RunRepository(root)
    assert (
        repository.list_stages("legacy-components")[0]["stage_id"]
        == "validate"
    )
    assert (
        repository.list_artifacts("legacy-components")[0]["ref_id"]
        == "legacy-report"
    )
    assert (
        repository.list_provenance("legacy-components")[0]["input_fingerprint"]
        == "legacy-input"
    )


def test_component_api_validates_relationships_and_exposes_records(
    tmp_path,
    monkeypatch,
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    app = FastAPI()
    app.include_router(
        build_router(RunRepository(tmp_path / "run-center")),
        prefix="/api/run-center",
    )
    with TestClient(app) as client:
        assert (
            client.post(
                "/api/run-center/runs",
                json={"run_id": "api-components", "operation": "x"},
            ).status_code
            == 201
        )
        assert (
            client.put(
                "/api/run-center/runs/api-components/stages/s1",
                json={
                    "operation": "x.stage",
                    "status": "running",
                    "progress": 0.2,
                },
            ).status_code
            == 200
        )
        assert (
            client.post(
                "/api/run-center/runs/api-components/artifacts",
                json={
                    "artifact": {"ref_id": "a1", "uri": "workspace://a1"},
                    "stage_id": "s1",
                    "role": "output",
                },
            ).status_code
            == 201
        )
        assert (
            client.post(
                "/api/run-center/runs/api-components/checkpoints",
                json={"checkpoint_id": "c1", "stage_id": "s1"},
            ).status_code
            == 201
        )
        assert (
            client.put(
                "/api/run-center/runs/api-components/provenance",
                json={"artifact_ref_id": "a1", "input_fingerprint": "input"},
            ).status_code
            == 200
        )

        assert (
            len(
                client.get(
                    "/api/run-center/runs/api-components/stages"
                ).json()["stages"]
            )
            == 1
        )
        assert (
            len(
                client.get(
                    "/api/run-center/runs/api-components/artifacts"
                ).json()["artifacts"]
            )
            == 1
        )
        assert (
            len(
                client.get(
                    "/api/run-center/runs/api-components/checkpoints"
                ).json()["checkpoints"]
            )
            == 1
        )
        assert (
            len(
                client.get(
                    "/api/run-center/runs/api-components/provenance"
                ).json()["provenance"]
            )
            == 1
        )
        bad = client.post(
            "/api/run-center/runs/api-components/artifacts",
            json={"ref_id": "orphan", "stage_id": "missing"},
        )
        assert bad.status_code == 400


def test_sse_stream_replays_events_after_last_event_id(
    tmp_path, monkeypatch
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    repository.create_run(
        {"run_id": "stream-1", "operation": "simulation.run"}
    )
    repository.append_event("stream-1", "log.line", {"message": "first"})
    repository.transition("stream-1", "cancelled")
    app = FastAPI()
    app.include_router(build_router(repository), prefix="/api/run-center")

    with TestClient(app) as client:
        response = client.get(
            "/api/run-center/runs/stream-1/events/stream",
            headers={"Last-Event-ID": "1"},
        )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    assert "id: 1\n" not in response.text
    assert "id: 2\n" in response.text
    assert '"type":"log.line"' in response.text
    assert "id: 3\n" in response.text


def test_restart_recovery_blocks_unknown_work_and_requeues_opted_in_run(
    tmp_path,
    monkeypatch,
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    repository.create_run(
        {"run_id": "block-me", "operation": "simulation.run"}
    )
    repository.transition("block-me", "queued")
    repository.transition("block-me", "running")
    repository.create_run(
        {
            "run_id": "requeue-me",
            "operation": "simulation.run",
            "recovery_policy": "requeue",
        },
    )
    repository.transition("requeue-me", "queued")
    repository.transition("requeue-me", "running")

    recovered = repository.recover_incomplete_runs()

    assert {item["run_id"] for item in recovered} == {"block-me", "requeue-me"}
    assert repository.get_run("block-me")["status"] == "blocked"
    assert (
        repository.get_run("block-me")["error"]["kind"]
        == "executor_interrupted"
    )
    assert repository.get_run("requeue-me")["status"] == "queued"
    events = repository.list_events("requeue-me")
    assert events[-1]["type"] == "run.recovered"
    assert events[-1]["data"]["reason"] == "requeued_after_restart"


def test_restart_recovery_resume_requires_checkpoint_and_marks_selected_point(
    tmp_path,
    monkeypatch,
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    repository.create_run(
        {
            "run_id": "resume-after-restart",
            "operation": "test.resume",
            "recovery_policy": "resume",
        },
    )
    repository.transition("resume-after-restart", "queued")
    repository.transition("resume-after-restart", "running")
    repository.create_checkpoint(
        "resume-after-restart",
        {
            "checkpoint_id": "cp-resume",
            "state": "ready",
            "metadata": {"cursor": 7},
        },
    )

    recovered = repository.recover_incomplete_runs()

    assert recovered[0]["status"] == "queued"
    run = repository.get_run("resume-after-restart")
    assert run["status"] == "queued"
    assert run["payload"]["resume_checkpoint_id"] == "cp-resume"
    events = repository.list_events("resume-after-restart")
    assert (
        events[-1]["data"]["reason"] == "resumed_from_checkpoint_after_restart"
    )


def test_restart_recovery_resume_without_checkpoint_blocks_run(
    tmp_path, monkeypatch
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    repository.create_run(
        {
            "run_id": "resume-without-checkpoint",
            "operation": "test.resume",
            "recovery_policy": "resume",
        },
    )
    repository.transition("resume-without-checkpoint", "queued")
    repository.transition("resume-without-checkpoint", "running")

    repository.recover_incomplete_runs()

    run = repository.get_run("resume-without-checkpoint")
    assert run["status"] == "blocked"
    assert run["error"]["kind"] == "resume_checkpoint_missing"


def test_in_process_executor_uses_handler_resume_hook_for_checkpoint(
    tmp_path,
    monkeypatch,
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    finished = threading.Event()

    class ResumableHandler:
        def __init__(self):
            self.checkpoint = None

        def __call__(self, _context, _payload):
            raise AssertionError(
                "fresh handler should not run for a resumed attempt"
            )

        def resume(self, context, payload, checkpoint):
            self.checkpoint = checkpoint
            finished.set()
            return {
                "mode": "resumed",
                "cursor": checkpoint["metadata"]["cursor"],
                "value": payload["value"],
            }

    handler = ResumableHandler()
    service = RunExecutorService(repository, max_workers=1)
    service.register("test.resume", handler)
    repository.create_run(
        {
            "run_id": "resume-in-process",
            "operation": "test.resume",
            "value": 3,
        },
    )
    repository.create_checkpoint(
        "resume-in-process",
        {"checkpoint_id": "cp-in-process", "metadata": {"cursor": 9}},
    )
    repository.transition("resume-in-process", "queued")
    repository.mark_resume_requested("resume-in-process")
    # Starting the service discovers and submits already queued Runs.
    service.start()
    assert finished.wait(10)
    for _ in range(100):
        if repository.get_run("resume-in-process")["status"] == "succeeded":
            break
        time.sleep(0.01)
    service.stop(wait=True)

    assert repository.get_run("resume-in-process")["status"] == "succeeded"
    assert handler.checkpoint["checkpoint_id"] == "cp-in-process"
    events = repository.list_events("resume-in-process")
    status_events = [
        event for event in events if event["type"] == "run.status_changed"
    ]
    assert status_events[-1]["data"]["result"]["mode"] == "resumed"


def test_in_process_executor_runs_registered_handler_and_persists_result(
    tmp_path,
    monkeypatch,
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    finished = threading.Event()

    def handler(context, payload):
        context.emit("metric", {"value": payload["value"]})
        finished.set()
        return {"answer": payload["value"] * 2}

    service = RunExecutorService(repository, max_workers=1)
    service.register("test.calculate", handler)
    repository.create_run(
        {"run_id": "execute-1", "operation": "test.calculate", "value": 21},
    )
    service.submit("execute-1")
    assert finished.wait(2)
    for _ in range(100):
        if repository.get_run("execute-1")["status"] == "succeeded":
            break
        time.sleep(0.01)
    service.stop(wait=True)

    assert repository.get_run("execute-1")["status"] == "succeeded"
    assert any(
        event["type"] == "metric"
        for event in repository.list_events("execute-1")
    )
    status_events = [
        event
        for event in repository.list_events("execute-1")
        if event["type"] == "run.status_changed"
    ]
    assert status_events[-1]["data"]["result"] == {"answer": 42}


def test_descriptor_risk_gate_blocks_high_risk_run_without_approval(
    tmp_path,
) -> None:
    repository = RunRepository(tmp_path / "run-center")
    repository.replace_operations(
        [
            {
                "operation": "test.high-risk",
                "provider_id": "provider-a",
                "contract_version": "1.0",
                "descriptor": {"risk": {"requires_review": True}},
            },
        ]
    )
    service = RunExecutorService(repository, review_checker=lambda _run: False)
    service.register(
        "test.high-risk",
        lambda _context, _payload: {"ok": True},
        provider_id="provider-a",
    )
    repository.create_run(
        {
            "run_id": "high-risk-1",
            "operation": "test.high-risk",
            "provider_id": "provider-a",
        }
    )
    with pytest.raises(ValueError, match="approved review"):
        service.submit("high-risk-1")


def test_start_keeps_review_blocked_run_queued(tmp_path) -> None:
    repository = RunRepository(tmp_path / "run-center")
    repository.replace_operations(
        [
            {
                "operation": "test.high-risk",
                "provider_id": "provider-a",
                "contract_version": "1.0",
                "descriptor": {"risk": {"requires_review": True}},
            },
        ]
    )
    repository.create_run(
        {
            "run_id": "high-risk-queued",
            "operation": "test.high-risk",
            "provider_id": "provider-a",
            "status": "queued",
        },
    )
    service = RunExecutorService(repository, review_checker=lambda _run: False)
    service.register(
        "test.high-risk",
        lambda _context, _payload: {"ok": True},
        provider_id="provider-a",
    )

    service.start()
    try:
        assert service.started is True
        assert repository.get_run("high-risk-queued")["status"] == "queued"
        assert service.submitted_runs == 0
    finally:
        service.stop(wait=True)


def test_executor_heartbeat_and_resource_sample_events(
    tmp_path, monkeypatch
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    finished = threading.Event()

    def handler(context, _payload):
        context.sample_resources({"cpu_percent": 12.5, "memory_bytes": 1024})
        finished.set()
        return {"ok": True}

    service = RunExecutorService(
        repository, max_workers=1, heartbeat_interval=1
    )
    service.register("test.telemetry", handler)
    repository.create_run(
        {"run_id": "telemetry-1", "operation": "test.telemetry"}
    )
    service.submit("telemetry-1")
    assert finished.wait(2)
    for _ in range(100):
        if repository.get_run("telemetry-1")["status"] == "succeeded":
            break
        time.sleep(0.01)
    service.stop(wait=True)
    events = repository.list_events("telemetry-1")
    assert any(event["type"] == "worker.heartbeat" for event in events)
    samples = [
        event for event in events if event["type"] == "worker.resource_sample"
    ]
    assert samples and samples[0]["data"]["cpu_percent"] == 12.5


def test_executor_control_signal_prevents_late_success(
    tmp_path, monkeypatch
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    entered = threading.Event()

    def handler(context, _payload):
        entered.set()
        while not context.cancelled:
            time.sleep(0.01)
        raise ExecutionCancelled("cancelled by test")

    service = RunExecutorService(repository, max_workers=1)
    service.register("test.cancel", handler)
    repository.create_run({"run_id": "cancel-1", "operation": "test.cancel"})
    service.submit("cancel-1")
    assert entered.wait(2)
    controlled = service.control("cancel-1", "cancel")
    assert controlled["status"] == "cancelling"
    for _ in range(100):
        if repository.get_run("cancel-1")["status"] == "cancelled":
            break
        time.sleep(0.01)
    service.stop(wait=True)

    assert repository.get_run("cancel-1")["status"] == "cancelled"
    assert repository.get_run("cancel-1")["status"] != "succeeded"


def test_resume_of_queued_paused_future_keeps_it_runnable(
    tmp_path, monkeypatch
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    first_entered = threading.Event()
    release_first = threading.Event()
    second_finished = threading.Event()

    def handler(context, _payload):
        if context.run_id == "queued-first":
            first_entered.set()
            release_first.wait(2)
        else:
            second_finished.set()
        return {"ok": True}

    service = RunExecutorService(repository, max_workers=1)
    service.register("test.queue-pause", handler)
    repository.create_run(
        {"run_id": "queued-first", "operation": "test.queue-pause"}
    )
    repository.create_run(
        {"run_id": "queued-second", "operation": "test.queue-pause"}
    )
    service.submit("queued-first")
    assert first_entered.wait(2)
    service.submit("queued-second")

    assert service.control("queued-second", "pause")["status"] == "paused"
    # The second future is still pending, so resume must return it to queued;
    # transitioning directly to running would make its worker skip execution.
    assert service.control("queued-second", "resume")["status"] == "queued"
    release_first.set()
    assert second_finished.wait(2)
    for _ in range(100):
        if repository.get_run("queued-second")["status"] == "succeeded":
            break
        time.sleep(0.01)
    service.stop(wait=True)
    assert repository.get_run("queued-second")["status"] == "succeeded"


def test_executor_stop_persists_cancellation_before_worker_exits(
    tmp_path, monkeypatch
) -> None:
    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    repository = RunRepository(tmp_path / "run-center")
    entered = threading.Event()
    release = threading.Event()

    def handler(_context, _payload):
        entered.set()
        release.wait(2)
        return {"late": True}

    service = RunExecutorService(repository, max_workers=1)
    service.register("test.stop", handler)
    repository.create_run({"run_id": "stop-1", "operation": "test.stop"})
    service.submit("stop-1")
    assert entered.wait(2)
    service.stop(wait=False)
    assert repository.get_run("stop-1")["status"] == "cancelling"
    release.set()
    for _ in range(100):
        if repository.get_run("stop-1")["status"] == "cancelled":
            break
        time.sleep(0.01)
    assert repository.get_run("stop-1")["status"] == "cancelled"
