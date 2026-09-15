# -*- coding: utf-8 -*-
from __future__ import annotations

import threading
import time
import importlib.util
import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient

_PLUGIN_ROOT = (
    Path(__file__).parents[4] / "plugins" / "bundle" / "qwenpaw-run-center"
)


def _runtime_module():
    name = "test_queue_resources_runtime"
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
build_router = sys.modules["test_queue_resources_runtime.api"].build_router
RunExecutorService = runtime.RunExecutorService
RunRepository = runtime.RunRepository


def test_project_queue_policy_and_resource_lease_lifecycle(tmp_path) -> None:
    repository = RunRepository(tmp_path / "run-center")
    repository.create_run(
        {"run_id": "r1", "operation": "test.calculate", "project_id": "p1"}
    )
    repository.create_run(
        {"run_id": "r2", "operation": "test.calculate", "project_id": "p1"}
    )
    policy = repository.upsert_project_queue_policy(
        "p1",
        max_concurrency=1,
        resource_limits={"cpu": 2},
    )
    assert policy["max_concurrency"] == 1
    first = repository.acquire_resource_lease(
        "r1",
        project_id="p1",
        resources={"cpu": 2},
    )
    assert first and first["state"] == "active"
    assert (
        repository.acquire_resource_lease(
            "r2", project_id="p1", resources={"cpu": 1}
        )
        is None
    )
    assert (
        repository.list_resource_leases(project_id="p1", state="active")[0][
            "run_id"
        ]
        == "r1"
    )
    released = repository.release_resource_lease(
        first["lease_id"], reason="test"
    )
    assert released and released["state"] == "released"
    second = repository.acquire_resource_lease(
        "r2", project_id="p1", resources={"cpu": 1}
    )
    assert second and second["run_id"] == "r2"


def test_queue_policy_http_contract(tmp_path) -> None:
    repository = RunRepository(tmp_path / "run-center")
    app = FastAPI()
    app.include_router(build_router(repository), prefix="/api/run-center")
    with TestClient(app) as client:
        created = client.put(
            "/api/run-center/queue/policies/project-a",
            json={
                "max_concurrency": 2,
                "weight": 3,
                "resource_limits": {"cpu": 4},
            },
        )
        assert created.status_code == 200
        assert created.json()["policy"]["max_concurrency"] == 2
        listed = client.get("/api/run-center/queue/policies")
        assert listed.status_code == 200
        assert listed.json()["policies"][0]["project_id"] == "project-a"
        missing = client.get("/api/run-center/queue/policies/missing")
        assert missing.status_code == 404
        deleted = client.delete("/api/run-center/queue/policies/project-a")
        assert deleted.status_code == 200


def test_local_executor_enforces_project_concurrency_and_releases_lease(
    tmp_path,
) -> None:
    repository = RunRepository(tmp_path / "run-center")
    repository.upsert_project_queue_policy("p1", max_concurrency=1)
    entered = threading.Event()
    release = threading.Event()
    started: list[str] = []
    lock = threading.Lock()

    def handler(context, _payload):
        with lock:
            started.append(context.run_id)
        entered.set()
        release.wait(3)
        return {"ok": True}

    service = RunExecutorService(repository, max_workers=2)
    service.register("test.policy", handler)
    repository.create_run(
        {"run_id": "policy-1", "operation": "test.policy", "project_id": "p1"}
    )
    repository.create_run(
        {"run_id": "policy-2", "operation": "test.policy", "project_id": "p1"}
    )
    service.submit("policy-1")
    service.submit("policy-2")
    assert entered.wait(2)
    time.sleep(0.15)
    assert len(started) == 1
    release.set()
    for _ in range(200):
        if all(
            repository.get_run(run_id)["status"] == "succeeded"
            for run_id in ("policy-1", "policy-2")
        ):
            break
        time.sleep(0.01)
    service.stop(wait=True)
    assert repository.get_run("policy-1")["status"] == "succeeded"
    assert repository.get_run("policy-2")["status"] == "succeeded"
    assert repository.list_resource_leases(state="active") == []


def test_startup_recovery_releases_lease_after_volatile_run_is_resolved(
    tmp_path,
) -> None:
    repository = RunRepository(tmp_path / "run-center")
    repository.upsert_project_queue_policy("p1", max_concurrency=1)
    repository.create_run(
        {
            "run_id": "crashed",
            "operation": "test.crash",
            "project_id": "p1",
            "recovery_policy": "block",
        },
    )
    repository.transition("crashed", "queued")
    repository.transition("crashed", "running")
    lease = repository.acquire_resource_lease("crashed", project_id="p1")
    assert lease is not None

    service = RunExecutorService(repository, max_workers=1)
    service.start()
    service.stop(wait=True)

    assert repository.get_run("crashed")["status"] == "blocked"
    assert repository.list_resource_leases(state="active") == []
    assert (
        repository.list_resource_leases(run_id="crashed")[0]["state"]
        == "released"
    )


def test_fair_queue_order_round_robins_projects_and_respects_project_priority(
    tmp_path,
) -> None:
    repository = RunRepository(tmp_path / "run-center")
    service = RunExecutorService(repository)
    runs = [
        {
            "run_id": "a-low",
            "project_id": "a",
            "priority": 0,
            "created_at": "2026-01-01",
        },
        {
            "run_id": "a-high",
            "project_id": "a",
            "priority": 5,
            "created_at": "2026-01-02",
        },
        {
            "run_id": "b-one",
            "project_id": "b",
            "priority": 0,
            "created_at": "2026-01-01",
        },
    ]
    ordered = service._fair_queue_order(
        runs
    )  # noqa: SLF001 - scheduler contract test
    assert [item["run_id"] for item in ordered] == ["a-high", "b-one", "a-low"]
