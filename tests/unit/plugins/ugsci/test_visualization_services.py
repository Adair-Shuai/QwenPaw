# -*- coding: utf-8 -*-
"""Shared services retain real storage, worker, and HTTP behavior."""

from concurrent.futures import ThreadPoolExecutor
import importlib
import json
import os
import struct
import sys
import time
from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient


@pytest.fixture(
    name="backend",
    params=["plugins.bundle", "qwenpaw.plugins_bundle"],
)
def _backend(request, tmp_path, monkeypatch):
    prefix = request.param + ".ugsci.visualization.backend"
    simulation = importlib.import_module(prefix + ".simulation")
    monkeypatch.setattr(
        simulation,
        "runtime_directory",
        lambda: tmp_path / "runtime",
    )
    return prefix


def write_f32(path, values):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(struct.pack(f"<{len(values)}f", *values))


def test_import_worker_publishes_related_wells_without_http_module(
    backend,
    tmp_path,
    monkeypatch,
):
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=redefined-outer-name
    manager = importlib.import_module(backend + ".jobs.manager")
    datasets = importlib.import_module(backend + ".services.datasets")
    # Exercise actual conversion and publication when the HTTP adapter cannot
    # be imported, as in standalone Run Center/background-worker use.
    monkeypatch.setitem(sys.modules, backend + ".api", None)
    monkeypatch.setattr(manager, "_job_store", lambda: None)
    source = tmp_path / "wells.json"
    source.write_text(
        json.dumps(
            {
                "type": "FeatureCollection",
                "coordinate_system": {"crs": "EPSG:32650"},
                "features": [
                    {
                        "type": "Feature",
                        "properties": {"name": f"井 {index}"},
                        "geometry": {
                            "type": "LineString",
                            "coordinates": [
                                [500000 + index, 4000000, 0],
                                [500000 + index, 4000000, -100],
                            ],
                        },
                    }
                    for index in range(2)
                ],
            },
        ),
        encoding="utf-8",
    )
    bin_dir = tmp_path / "data" / "bin"
    job = manager.JobManager().submit_import(
        "wells",
        source,
        None,
        bin_dir,
        _force_legacy=True,
        _execute_sync=True,
    )

    assert job.status == "completed", job.error
    published = json.loads((bin_dir / "manifest.json").read_text("utf-8"))
    assert len(published["datasets"]) == 2
    primary = job.result["id"]
    related = job.result["related_datasets"][0]["id"]
    assert {item["id"] for item in published["datasets"]} == {
        primary,
        related,
    }
    for dataset in published["datasets"]:
        assert dataset["metadata"]["managed"] is True
        if dataset["id"] == related:
            assert dataset["metadata"]["parent_dataset"] == primary
        for filename in datasets.dataset_resource_files(dataset).values():
            assert (bin_dir / filename).is_file()
        positions = (bin_dir / dataset["files"]["positions"]).read_bytes()
        assert struct.unpack("<6f", positions)[2::3] == (0.0, -100.0)
        assert dataset["properties"]["md"]["association"] == "point"
    assert source.is_file()
    assert job.drain_events()[-1]["type"] == "completed"


def test_catalog_publication_keeps_parallel_storage_contexts_independent(
    backend,
    tmp_path,
):
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=redefined-outer-name
    catalog = importlib.import_module(backend + ".services.catalog")
    layout = importlib.import_module(backend + ".cache.layout")
    manifests = importlib.import_module(backend + ".cache.manifest_store")
    resources = importlib.import_module(backend + ".cache.resource_store")
    state = importlib.import_module(backend + ".cache.catalog_state")
    roots = [tmp_path / "left", tmp_path / "right"]
    for root_index, root in enumerate(roots):
        for index in range(24):
            write_f32(
                root / "bin" / f"value-{index}.f32",
                [float(root_index)],
            )
    outside = tmp_path / "retained.f32"
    write_f32(outside, [42.0])

    def publish(item):
        root, index = item
        catalog.publish_manifest(
            root / "bin",
            {
                "id": f"dataset-{index}",
                "name": root.name,
                "files": {"scalars": {"VALUE": f"value-{index}.f32"}},
                "metadata": {"managed": True},
            },
        )

    with ThreadPoolExecutor(max_workers=8) as executor:
        list(executor.map(publish, [(r, i) for r in roots for i in range(24)]))
    stores = [
        manifests.ManifestStore(root / "bin", layout.CacheLayout(root))
        for root in roots
    ]
    for root, store in zip(roots, stores):
        rows = store.read()["datasets"]
        assert {row["id"] for row in rows} == {
            f"dataset-{index}" for index in range(24)
        }
        assert {row["name"] for row in rows} == {root.name}
        assert not list((root / "bin").glob(".manifest_*.tmp"))
        assert not list((root / "bin").glob(".manifest.json.*.tmp"))

    stores[0].upsert(
        {
            "id": "unsafe-child",
            "files": {"scalars": {"VALUE": "../../retained.f32"}},
            "metadata": {"managed": True, "parent_dataset": "dataset-0"},
        },
    )
    local_catalog = catalog.DatasetCatalog(
        stores[0],
        resources.ResourceStore(roots[0] / "bin"),
        state.CatalogState(roots[0]),
    )
    result = local_catalog.delete_or_hide_dataset("dataset-0")
    assert result["removed"] == ["dataset-0", "unsafe-child"]
    assert result["deleted_files"] == 1
    assert not (roots[0] / "bin" / "value-0.f32").exists()
    assert (roots[0] / "bin" / "value-1.f32").is_file()
    assert (roots[1] / "bin" / "value-0.f32").read_bytes() == struct.pack(
        "<f",
        1.0,
    )
    assert len(stores[1].read()["datasets"]) == 24
    assert outside.read_bytes() == struct.pack("<f", 42.0)


def test_catalog_publication_retries_temporary_windows_manifest_lock(
    backend,
    tmp_path,
    monkeypatch,
):
    from qwenpaw.utils import io_utils

    catalog = importlib.import_module(backend + ".services.catalog")
    bin_dir = tmp_path / "中文 catalog" / "bin"
    original = {"id": "original", "name": "原有 Existing"}
    catalog.publish_manifest(bin_dir, original)
    target = bin_dir / "manifest.json"
    before = target.read_bytes()
    replacement = {"id": "new", "name": "中文 English", "enabled": False}
    expected = {"version": 1, "datasets": [replacement, original]}
    attempts = []
    real_replace = os.replace
    sleep = Mock()

    def replace_after_readers_close(source, destination):
        attempts.append((source, destination))
        assert target.read_bytes() == before
        assert source.read_text(encoding="utf-8") == json.dumps(
            expected,
            indent=2,
            ensure_ascii=False,
        )
        if len(attempts) < 3:
            error = PermissionError("manifest temporarily busy")
            error.winerror = 5
            raise error
        real_replace(source, destination)

    monkeypatch.setattr(
        io_utils,
        "os",
        SimpleNamespace(
            **{**vars(os), "replace": replace_after_readers_close},
        ),
    )
    monkeypatch.setattr(
        io_utils,
        "time",
        SimpleNamespace(**{**vars(time), "sleep": sleep}),
    )
    catalog.publish_manifest(bin_dir, replacement)
    assert len(attempts) == 3
    assert sleep.call_count == 2
    assert json.loads(target.read_text(encoding="utf-8")) == expected
    assert "中文 English" in target.read_text(encoding="utf-8")
    assert not list(bin_dir.glob(".manifest_*.tmp"))
    assert not list(bin_dir.glob(".manifest.json.*.tmp"))


def test_catalog_publication_keeps_previous_manifest_after_persistent_lock(
    backend,
    tmp_path,
    monkeypatch,
):
    from qwenpaw.utils import io_utils

    catalog = importlib.import_module(backend + ".services.catalog")
    bin_dir = tmp_path / "persistent-lock" / "bin"
    original = {"id": "original", "name": "保留 Existing"}
    catalog.publish_manifest(bin_dir, original)
    target = bin_dir / "manifest.json"
    before = target.read_bytes()
    error = PermissionError("manifest remains busy")
    error.winerror = 32
    attempts = []
    sleep = Mock()

    def occupied(source, destination):
        attempts.append((source, destination))
        assert len(attempts) <= 7
        assert target.read_bytes() == before
        assert source.is_file()
        raise error

    monkeypatch.setattr(
        io_utils,
        "os",
        SimpleNamespace(**{**vars(os), "replace": occupied}),
    )
    monkeypatch.setattr(
        io_utils,
        "time",
        SimpleNamespace(**{**vars(time), "sleep": sleep}),
    )
    with pytest.raises(PermissionError) as caught:
        catalog.publish_manifest(bin_dir, {"id": "new", "name": "未发布"})
    assert caught.value is error
    assert len(attempts) == 7
    assert sleep.call_count == 6
    assert target.read_bytes() == before
    assert not list(bin_dir.glob(".manifest_*.tmp"))
    assert not list(bin_dir.glob(".manifest.json.*.tmp"))


def test_http_dataset_services_preserve_temporal_resources_and_errors(
    backend,
    tmp_path,
):
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=redefined-outer-name
    api = importlib.import_module(backend + ".api")
    catalog = importlib.import_module(backend + ".services.catalog")
    bin_dir = tmp_path / "data" / "bin"
    for name, values in {
        "positions.f32": [0.0, 0.0, 0.0] * 3,
        "node-static.f32": [0.0, float("nan"), 6.0],
        "node-step.f32": [0.0, 10.0, float("nan")],
        "cell-static.f32": [8.0, 10.0],
    }.items():
        write_f32(bin_dir / name, values)
    catalog.publish_manifest(
        bin_dir,
        {
            "id": "mixed",
            "name": "点与单元属性",
            "source": "contract",
            "n_vertices": 3,
            "n_cells": 2,
            "files": {
                "positions": "positions.f32",
                "scalars": {
                    "NODE": "node-static.f32",
                    "CELL": "cell-static.f32",
                },
            },
            "properties": {
                "NODE": {"association": "point"},
                "CELL": {"association": "cell"},
            },
            "time_steps": [
                {"index": 0, "scalars": {"NODE": "node-step.f32"}},
            ],
        },
    )
    app = FastAPI()
    app.include_router(api.build_router(tmp_path), prefix="/api")
    with TestClient(app) as client:
        response = client.get("/api/datasets/mixed/manifest")
        assert response.status_code == 200
        descriptors = {
            item["id"]: item for item in response.json()["resources"]
        }
        assert descriptors["node-static.f32"]["shape"] == [3]
        assert descriptors["cell-static.f32"]["shape"] == [2]
        assert descriptors["node-step.f32"]["association"] == "point"
        assert descriptors["node-step.f32"]["timeStep"] == 1
        assert descriptors["node-step.f32"]["byteLength"] == 12
        dynamic = client.get(
            "/api/datasets/mixed/stats?property=NODE&time_step=1",
        )
        assert dynamic.status_code == 200
        assert dynamic.json()["mean"] == 5.0
        assert dynamic.json()["min"] == 0.0
        assert dynamic.json()["missing_count"] == 1
        fallback = client.get(
            "/api/datasets/mixed/stats?property=CELL&time_step=1",
        )
        assert fallback.status_code == 200
        assert fallback.json()["mean"] == 9.0
        resource = client.get(
            "/api/datasets/mixed/resources/node-step.f32",
        )
        assert resource.content == (bin_dir / "node-step.f32").read_bytes()
        unknown = client.get(
            "/api/datasets/mixed/stats?property=NODE&time_step=2",
        )
        assert unknown.status_code == 404
        assert unknown.json() == {"detail": "Time step not found: 2"}
        missing = client.delete("/api/datasets/absent")
        assert missing.status_code == 404
        assert missing.json() == {"detail": "Dataset not found: absent"}


def test_derived_publication_keeps_runtime_catalog_ownership(
    backend,
    tmp_path,
):
    # Pytest injects the declared fixture by its public name.
    # pylint: disable=redefined-outer-name
    catalog = importlib.import_module(backend + ".services.catalog")
    layout = importlib.import_module(backend + ".cache.layout")
    manifests = importlib.import_module(backend + ".cache.manifest_store")
    simulation = importlib.import_module(backend + ".simulation")
    source = {
        "id": "simulation-parent",
        "metadata": {"simulation_run_id": "run-1"},
        "properties": {
            "NODE": {"association": "point", "count": 100, "unit": "m"},
            "CELL": {"association": "cell", "count": 100, "unit": "Pa"},
            "ABSENT": {"association": "cell", "count": 100},
        },
    }
    runtime_bin = tmp_path / "runtime" / "bin"
    write_f32(runtime_bin / "derived-node.f32", [0.0, 1.0, 2.0])
    write_f32(runtime_bin / "derived-cell.f32", [0.0, 10.0])
    derived = {
        "id": "derived",
        "n_vertices": 3,
        "n_cells": 2,
        "files": {
            "scalars": {
                "NODE": "derived-node.f32",
                "CELL": "derived-cell.f32",
            },
        },
    }
    local_root = tmp_path / "data"
    local = manifests.ManifestStore(
        local_root / "bin",
        layout.CacheLayout(local_root),
    )
    overlay = simulation.SimulationCatalog(local)
    catalog.publish_derived(derived, source, 2, overlay)
    assert local.read()["datasets"] == []
    persisted = simulation.runtime_manifest().get_dataset("derived")
    assert persisted["metadata"] == {
        "simulation_run_id": "run-1",
        "parent_dataset": "simulation-parent",
        "time_step": 2,
        "managed": True,
    }
    assert persisted["properties"] == {
        "NODE": {"association": "point", "count": 3, "unit": "m"},
        "CELL": {"association": "cell", "count": 2, "unit": "Pa"},
    }
    resources = simulation.SimulationResources(local_root / "bin")
    assert resources.get_path("derived-node.f32").read_bytes() == struct.pack(
        "<3f",
        0.0,
        1.0,
        2.0,
    )
    assert overlay.get_dataset("derived") == persisted
