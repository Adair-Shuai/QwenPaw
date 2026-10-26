# -*- coding: utf-8 -*-
"""Lifecycle listing tolerates a vanished durable record and retains peers."""

import importlib
import threading

import pytest


pytestmark = pytest.mark.parametrize(
    "namespace",
    ["plugins.bundle.flowforge", "qwenpaw.plugins_bundle.flowforge"],
)


def listing_service(namespace, tmp_path):
    lifecycle = importlib.import_module(namespace + ".lifecycle")
    repository = importlib.import_module(namespace + ".execution_repository")
    store = repository.ExecutionRepository(tmp_path)
    # Supply the same injected storage, lock and handle map used by the host.
    # All public lifecycle methods and actual disk repository stay unchanged.
    service_type = type(
        "ListingHost",
        (lifecycle.RunLifecycleMixin,),
        {
            "_execution_repository": store,
            "_lifecycle_lock": threading.RLock(),
            "_runs": {},
        },
    )
    return service_type(), store


@pytest.mark.parametrize("change", ["removed", "invalid-json"])
def test_listing_omits_record_lost_between_durable_reads(
    namespace,
    tmp_path,
    monkeypatch,
    change,
):
    service, repository = listing_service(namespace, tmp_path)
    repository.create("retained", "flow", status="completed", started_at=10)
    repository.create("lost", "flow", status="completed", started_at=20)
    original_list = repository.list

    def list_before_external_change():
        records = original_list()
        path = repository.root / "lost.json"
        if change == "removed":
            path.unlink()
        else:
            path.write_text("{interrupted record", encoding="utf-8")
        return records

    monkeypatch.setattr(repository, "list", list_before_external_change)
    records = service.list_runs()
    assert [record["run_id"] for record in records] == ["retained"]
    assert records[0]["status"] == "completed"
    assert repository.get("lost") is None
    assert repository.get("retained")["started_at"] == 10


def test_listing_preserves_order_metadata_and_independent_snapshots(
    namespace,
    tmp_path,
):
    service, repository = listing_service(namespace, tmp_path)
    for run_id, started_at in (
        ("unset", None),
        ("zero", 0),
        ("older", 10),
        ("newer", 20),
    ):
        repository.create(
            run_id,
            "flow",
            status="completed",
            started_at=started_at,
            flow_snapshot={"id": "flow", "nodes": {}},
            outputs={"result": run_id},
            parent_run_id="root",
            resumed_from_run_id="paused",
        )
    records = service.list_runs()
    assert [record["run_id"] for record in records[:2]] == ["newer", "older"]
    assert {record["run_id"] for record in records[2:]} == {"unset", "zero"}
    assert all("flow_snapshot" not in record for record in records)
    assert all(record["parent_run_id"] == "root" for record in records)
    assert all(record["resumed_from_run_id"] == "paused" for record in records)
    records[0]["outputs"]["result"] = "local mutation"
    assert service.get_run_record("newer")["outputs"] == {"result": "newer"}
    assert repository.get("newer")["flow_snapshot"]["id"] == "flow"
