# -*- coding: utf-8 -*-
"""Public visualization routes consume actual mesh and scalar resources."""

import csv
import importlib
import io
import struct

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient


@pytest.fixture(
    name="scene",
    params=["plugins.bundle", "qwenpaw.plugins_bundle"],
)
def load_scene(request, tmp_path):
    prefix = request.param + ".ugsci.visualization.backend"
    api = importlib.import_module(prefix + ".api")
    layout = importlib.import_module(prefix + ".cache.layout")
    manifests = importlib.import_module(prefix + ".cache.manifest_store")
    data_dir = tmp_path / "data"
    bin_dir = data_dir / "bin"
    store = manifests.ManifestStore(bin_dir, layout.CacheLayout(data_dir))
    positions = [
        coordinate
        for cell in range(2)
        for x, y, z in [
            (0, 0, 0),
            (1, 0, 0),
            (1, 1, 0),
            (0, 1, 0),
            (0, 0, 1),
            (1, 0, 1),
            (1, 1, 1),
            (0, 1, 1),
        ]
        for coordinate in (x + cell, y, z)
    ]
    triangles = [
        0,
        1,
        2,
        0,
        2,
        3,
        4,
        6,
        5,
        4,
        7,
        6,
        0,
        4,
        5,
        0,
        5,
        1,
        1,
        5,
        6,
        1,
        6,
        2,
        2,
        6,
        7,
        2,
        7,
        3,
        3,
        7,
        4,
        3,
        4,
        0,
    ]
    indices = triangles + [value + 8 for value in triangles]
    for filename, code, values in [
        ("positions.f32", "f", positions),
        ("indices.u32", "I", indices),
        ("cell_ids.u32", "I", [0, 1]),
        ("pressure.f32", "f", [0.0, 20.0]),
    ]:
        (bin_dir / filename).write_bytes(
            struct.pack(f"<{len(values)}{code}", *values),
        )
    store.upsert(
        {
            "id": "grid",
            "name": "真实网格",
            "source": "contract",
            "n_cells": 2,
            "n_vertices": 16,
            "n_indices": len(indices),
            "grid_dims": [2, 1, 1],
            "files": {
                "positions": "positions.f32",
                "indices": "indices.u32",
                "cell_ids": "cell_ids.u32",
                "scalars": {"PRESSURE": "pressure.f32"},
            },
        },
    )
    app = FastAPI()
    app.include_router(api.build_router(tmp_path), prefix="/api")
    with TestClient(app) as client:
        yield client, bin_dir, store


def test_scalar_queries_and_exports_keep_public_parameters(scene):
    client, _bin_dir, _store = scene
    stats = client.get("/api/datasets/grid/stats?property=PRESSURE")
    assert stats.status_code == 200
    assert stats.json() == {
        "dataset_id": "grid",
        "property": "PRESSURE",
        "count": 2,
        "min": 0.0,
        "max": 20.0,
        "mean": 10.0,
        "p10": 0.0,
        "p50": 0.0,
        "p90": 0.0,
    }
    histogram = client.get(
        "/api/datasets/grid/histogram?property=PRESSURE&bins=2",
    )
    assert histogram.status_code == 200
    assert histogram.json()["property"] == "PRESSURE"
    assert sum(histogram.json()["counts"]) == 2
    details = client.get("/api/datasets/grid/cells/1")
    assert details.status_code == 200
    assert details.json() == {
        "dataset_id": "grid",
        "cell_id": 1,
        "ijk": [2, 1, 1],
        "center": [1.5, 0.5, 0.5],
        "properties": {"PRESSURE": 20.0},
    }
    manifest = client.get("/api/datasets/grid/export?format=json")
    assert manifest.status_code == 200
    assert manifest.json()["name"] == "真实网格"
    exported = client.get("/api/datasets/grid/export?format=csv")
    assert exported.status_code == 200
    assert list(csv.DictReader(io.StringIO(exported.text))) == [
        {"cell_id": "0", "PRESSURE": "0.0"},
        {"cell_id": "1", "PRESSURE": "20.0"},
    ]
    assert client.get("/api/datasets/grid/export").json() == manifest.json()
    invalid = client.get("/api/datasets/grid/export?format=xml")
    assert invalid.status_code == 400
    assert invalid.json() == {"detail": "format must be json or csv"}
    schema = client.get("/openapi.json").json()["paths"]
    for suffix, name, default in [
        ("stats", "property", ""),
        ("histogram", "property", ""),
        ("export", "format", "json"),
    ]:
        parameters = schema[f"/api/datasets/{{dataset_id}}/{suffix}"]
        query = [
            item
            for item in parameters["get"]["parameters"]
            if item["in"] == "query" and item["name"] == name
        ]
        assert len(query) == 1
        assert query[0]["schema"]["default"] == default


@pytest.mark.parametrize(
    "header,start,end",
    [
        ("bytes=0-3", 0, 3),
        ("bytes=-4", 4, 7),
        ("bytes=4-", 4, 7),
        ("bytes=0-999", 0, 7),
    ],
)
def test_resource_ranges_preserve_real_bytes_and_headers(
    scene,
    header,
    start,
    end,
):
    client, bin_dir, _store = scene
    raw = (bin_dir / "pressure.f32").read_bytes()
    response = client.get(
        "/api/resource/pressure.f32",
        headers={"Range": header},
    )
    assert response.status_code == 206
    assert response.content == raw[start : end + 1]
    assert response.headers["content-range"] == f"bytes {start}-{end}/8"
    assert response.headers["content-length"] == str(end - start + 1)
    assert response.headers["accept-ranges"] == "bytes"
    assert response.headers["cache-control"] == "public, max-age=3600"


@pytest.mark.parametrize(
    "header",
    [
        "items=0-3",
        "bytes=8-",
        "bytes=4-2",
        "bytes=-",
        "bytes=-0",
        "bytes=0-1,3-4",
        "bytes=invalid",
        "bytes=0-1-2",
    ],
)
def test_resource_invalid_ranges_remain_unsatisfiable(scene, header):
    client, _bin_dir, _store = scene
    response = client.get(
        "/api/resource/pressure.f32",
        headers={"Range": header},
    )
    assert response.status_code == 416
    assert response.headers["content-range"] == "bytes */8"
    assert response.content == b""


def test_slice_persists_selected_geometry_ids_and_zero_scalars(scene):
    client, bin_dir, store = scene
    for index, scalar in [(1, 0.0), (2, 20.0)]:
        response = client.post(
            "/api/datasets/grid/slices",
            json={
                "axis": "i",
                "index": index,
                "property": "PRESSURE",
                "name": f"picked{index}",
            },
        )
        assert response.status_code == 200
        result = response.json()
        assert result["id"] == f"slice_picked{index}"
        assert result["n_cells"] == 1
        assert result["n_vertices"] == 8
        assert result["n_indices"] == 36
        files = result["files"]
        assert struct.unpack(
            "<I",
            (bin_dir / files["cell_ids"]).read_bytes(),
        ) == (index - 1,)
        assert struct.unpack(
            "<f",
            (bin_dir / files["scalars"]["PRESSURE"]).read_bytes(),
        ) == (scalar,)
        positions = struct.unpack(
            "<24f",
            (bin_dir / files["positions"]).read_bytes(),
        )
        assert min(positions[::3]) == index - 1
        assert max(positions[::3]) == index
        assert store.get_dataset(result["id"]) == result
        downloaded = client.get(
            f"/api/datasets/{result['id']}/resources/{files['cell_ids']}",
        )
        assert downloaded.status_code == 200
        assert downloaded.content == struct.pack("<I", index - 1)


def test_slice_and_property_failures_keep_http_details(scene):
    client, _bin_dir, store = scene
    invalid = client.post(
        "/api/datasets/grid/slices",
        json={"axis": "i", "index": 3},
    )
    assert invalid.status_code == 422
    assert invalid.json() == {"detail": "I index 3 is outside 1..2"}
    assert (
        client.post(
            "/api/datasets/grid/slices",
            json={"index": 0},
        ).status_code
        == 422
    )
    assert client.get("/api/datasets/grid/cells/3").json() == {
        "detail": "Cell not found: 3",
    }
    assert client.get("/api/datasets/grid/stats").status_code == 404
    dataset = store.get_dataset("grid")
    dataset["files"]["scalars"]["PRESSURE"] = "../unsafe.f32"
    store.upsert(dataset)
    unsafe = client.get("/api/datasets/grid/stats?property=PRESSURE")
    assert unsafe.status_code == 400
    assert unsafe.json() == {"detail": "Invalid property resource"}
    dataset["files"] = {}
    store.upsert(dataset)
    missing = client.post("/api/datasets/grid/slices", json={"index": 1})
    assert missing.status_code == 422
    assert missing.json() == {
        "detail": "Dataset has no grid geometry to slice",
    }
    absent = client.post("/api/datasets/absent/slices", json={"index": 1})
    assert absent.status_code == 404
    assert absent.json() == {"detail": "Dataset not found: absent"}


def test_catalog_cascade_hides_examples_and_removes_managed_files(scene):
    client, bin_dir, store = scene
    child_file = bin_dir / "child.f32"
    child_file.write_bytes(struct.pack("<f", 5))
    store.upsert(
        {
            "id": "child",
            "name": "derived",
            "n_cells": 1,
            "n_vertices": 1,
            "files": {"scalars": {"X": "child.f32"}},
            "metadata": {"managed": True, "parent_dataset": "grid"},
        },
    )
    response = client.delete("/api/datasets/grid/cache")
    assert response.status_code == 200
    assert response.json() == {
        "dataset_id": "grid",
        "hidden": ["grid"],
        "removed": ["child"],
        "deleted_files": 1,
        "status": "hidden",
    }
    assert not child_file.exists()
    assert (bin_dir / "pressure.f32").exists()
    assert store.get_dataset("child") is None
    assert client.get("/api/datasets").json() == {"datasets": []}
    assert client.get("/api/manifest").json()["datasets"] == []
    assert client.get("/api/health").json()["datasets"] == []
    hidden = client.get("/api/manifest?include_hidden=true").json()
    assert hidden["catalog"] == {"hidden_count": 1, "hidden_ids": ["grid"]}
    restored = client.post("/api/catalog/restore-examples")
    assert restored.json() == {
        "status": "restored",
        "restored": ["grid"],
        "count": 1,
    }
    assert client.get("/api/datasets").json()["datasets"][0]["id"] == "grid"
