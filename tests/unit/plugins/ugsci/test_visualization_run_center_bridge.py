# -*- coding: utf-8 -*-
"""Tests for the durable visualization-import bridge used by Run Center."""

from __future__ import annotations

import importlib
import importlib.util
import json
import sys
import threading
import time
from pathlib import Path


ROOT = Path(__file__).parents[4]
PLUGIN_DIR = ROOT / "plugins" / "bundle" / "ugsci" / "visualization"


def _manager_module():
    package = "ugsci_visualization_bridge_test_plugin"
    if package not in sys.modules:
        spec = importlib.util.spec_from_file_location(
            package,
            PLUGIN_DIR / "__init__.py",
            submodule_search_locations=[str(PLUGIN_DIR)],
        )
        assert spec and spec.loader
        module = importlib.util.module_from_spec(spec)
        sys.modules[package] = module
        spec.loader.exec_module(module)
    return importlib.import_module(f"{package}.backend.jobs.manager")


class _MemoryJobStore:
    def __init__(self):
        self.jobs = {}
        self.events = {}

    def save_job(self, job_id, payload):
        self.jobs[job_id] = json.loads(json.dumps(payload))

    def append_job_event_if_changed(self, job_id, event):
        stream = self.events.setdefault(job_id, [])
        if stream and stream[-1]["data"] == event:
            return stream[-1]["sequence"], False
        sequence = len(stream) + 1
        stream.append(
            {"sequence": sequence, "data": json.loads(json.dumps(event))}
        )
        return sequence, True

    def load_job(self, job_id):
        return self.jobs.get(job_id)

    def list_job_events(self, job_id, after_sequence=0):
        return [
            item
            for item in self.events.get(job_id, [])
            if item["sequence"] > after_sequence
        ]


def test_import_job_is_persisted_with_run_center_operation(monkeypatch):
    manager = _manager_module()
    store = _MemoryJobStore()
    monkeypatch.setattr(manager, "_job_store", lambda: store)

    job = manager.ImportJob(job_id="import-1", name="grid")
    job.add_event("created", {"job_id": job.job_id})

    assert store.jobs[job.job_id]["operation"] == "visualization.import"
    assert store.jobs[job.job_id]["provider_id"] == "ugsci.visualization"
    assert store.jobs[job.job_id]["job_type"] == "visualization_import"
    assert store.events[job.job_id][0]["data"]["type"] == "created"


def test_import_job_can_be_rehydrated_after_restart(monkeypatch):
    manager = _manager_module()
    store = _MemoryJobStore()
    monkeypatch.setattr(manager, "_job_store", lambda: store)

    original = manager.ImportJob(
        job_id="import-2", name="grid", status="completed", progress=1.0
    )
    original.add_event("completed", {"dataset_id": "dataset-1"})

    restarted = manager.JobManager()
    restored = restarted.get_job("import-2")

    assert restored is not None
    assert restored.name == "grid"
    assert restored.status == "completed"
    assert restored.progress == 1.0
    assert restored.drain_events()[0]["type"] == "completed"


def test_running_import_is_marked_interrupted_after_restart(monkeypatch):
    manager = _manager_module()
    store = _MemoryJobStore()
    monkeypatch.setattr(manager, "_job_store", lambda: store)

    original = manager.ImportJob(
        job_id="import-running",
        name="grid",
        status="running",
        progress=0.25,
    )
    original.add_event("stage", {"stage": "reading-source"})

    restored = manager.JobManager().get_job("import-running")

    assert restored is not None
    assert restored.status == "failed"
    assert restored.finished_at > 0
    assert "restart" in (restored.error or "").lower()
    assert store.jobs[restored.job_id]["status"] == "failed"
    assert store.events[restored.job_id][-1]["data"]["data"]["reason"] == (
        "backend_restart"
    )


def test_cancelled_import_does_not_emit_late_worker_events(monkeypatch):
    manager = _manager_module()
    store = _MemoryJobStore()
    monkeypatch.setattr(manager, "_job_store", lambda: store)
    job = manager.ImportJob(job_id="import-cancelled", name="grid")

    job.status = "cancelled"
    job.add_event("stage", {"stage": "writing-manifest"})
    job.add_event("cancelled", {"job_id": job.job_id})

    assert [item["data"]["type"] for item in store.events[job.job_id]] == [
        "cancelled",
    ]


def test_manifest_commit_and_cancellation_are_serialized(
    tmp_path, monkeypatch
):
    manager = _manager_module()
    package = manager.__package__.split(".backend", 1)[0]
    formats = importlib.import_module(f"{package}.backend.formats")
    api = importlib.import_module(f"{package}.backend.api")
    store = _MemoryJobStore()
    monkeypatch.setattr(manager, "_job_store", lambda: store)
    monkeypatch.setattr(
        formats,
        "convert_source",
        lambda *_args, **_kwargs: {"id": "dataset-1", "metadata": {}},
    )

    commit_started = threading.Event()
    allow_commit = threading.Event()

    def _blocking_update(_bin_dir, _dataset):
        commit_started.set()
        assert allow_commit.wait(timeout=5)

    monkeypatch.setattr(api, "_update_manifest", _blocking_update)
    upload = tmp_path / "grid.grdecl"
    upload.write_text("GRID", encoding="utf-8")
    job_manager = manager.JobManager()
    job = job_manager.submit_import("grid", upload, None, tmp_path)
    assert commit_started.wait(timeout=5)

    result: list[bool] = []
    cancel_thread = threading.Thread(
        target=lambda: result.append(job_manager.cancel_job(job.job_id)),
    )
    cancel_thread.start()
    time.sleep(0.05)
    assert cancel_thread.is_alive()

    allow_commit.set()
    cancel_thread.join(timeout=5)
    deadline = time.time() + 5
    while (
        job.status not in {"completed", "failed", "cancelled"}
        and time.time() < deadline
    ):
        time.sleep(0.01)

    assert result == [False]
    assert job.status == "completed"
    assert store.jobs[job.job_id]["status"] == "completed"
