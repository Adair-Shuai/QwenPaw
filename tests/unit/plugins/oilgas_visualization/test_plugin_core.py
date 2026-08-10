# -*- coding: utf-8 -*-
from __future__ import annotations

import importlib.util
import json
import sys
import asyncio
import struct
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest


ROOT = Path(__file__).parents[4]
PLUGIN_DIR = ROOT / "plugins" / "bundle" / "oilgas-visualization"


def _load_plugin_package():
    name = "oilgas_visualization_test_plugin"
    if name in sys.modules:
        return sys.modules[name]
    spec = importlib.util.spec_from_file_location(
        name,
        PLUGIN_DIR / "plugin.py",
        submodule_search_locations=[str(PLUGIN_DIR)],
    )
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


PLUGIN = _load_plugin_package()


def test_router_uses_package_relative_imports_despite_global_api_collision(
    monkeypatch,
):
    fake_spec = importlib.util.spec_from_loader("api", loader=None)
    fake_api = importlib.util.module_from_spec(fake_spec)
    monkeypatch.setitem(sys.modules, "api", fake_api)
    from oilgas_visualization_test_plugin.backend.api import build_router

    assert len(build_router(PLUGIN_DIR).routes) >= 16


def test_health_range_and_protected_builtin_cache():
    from oilgas_visualization_test_plugin.backend.api import build_router

    app = FastAPI()
    app.include_router(build_router(PLUGIN_DIR), prefix="/api")
    client = TestClient(app)

    health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json()["service"] == "oilgas-visualization"

    ranged = client.get(
        "/api/resource/egrid_test_cell_ids.u32",
        headers={"Range": "bytes=0-15"},
    )
    assert ranged.status_code == 206
    assert len(ranged.content) == 16
    assert ranged.headers["content-range"].startswith("bytes 0-15/")

    invalid = client.get(
        "/api/resource/egrid_test_cell_ids.u32",
        headers={"Range": "bytes=999999999-"},
    )
    assert invalid.status_code == 416

    per_dataset = client.get(
        "/api/datasets/egrid_test/resources/egrid_test_cell_ids.u32",
        headers={"Range": "bytes=0-15"},
    )
    assert per_dataset.status_code == 206
    assert len(per_dataset.content) == 16

    protected = client.delete("/api/datasets/egrid_test/cache")
    assert protected.status_code == 409

    stats = client.get("/api/datasets/roff_eclgrid/stats?property=porosity")
    assert stats.status_code == 200
    assert stats.json()["count"] > 0
    assert stats.json()["min"] <= stats.json()["p50"] <= stats.json()["max"]

    details = client.get("/api/datasets/egrid_test/cells/0")
    assert details.status_code == 200
    assert details.json()["cell_id"] == 0
    assert len(details.json()["ijk"]) == 3

    exported = client.get("/api/datasets/roff_eclgrid/export?format=csv")
    assert exported.status_code == 200
    assert exported.headers["content-type"].startswith("text/csv")
    assert "cell_id" in exported.text


def test_cell_details_and_export_use_original_noncontiguous_cell_ids(tmp_path):
    from oilgas_visualization_test_plugin.backend.api import build_router

    bin_dir = tmp_path / "data" / "bin"
    bin_dir.mkdir(parents=True)
    positions = []
    for base in (0.0, 10.0):
        for index in range(8):
            positions.extend([base + index, 0.0, 0.0])
    (bin_dir / "grid_positions.f32").write_bytes(
        struct.pack(f"<{len(positions)}f", *positions),
    )
    (bin_dir / "grid_indices.u32").write_bytes(struct.pack("<48I", *range(48)))
    (bin_dir / "grid_cell_ids.u32").write_bytes(struct.pack("<2I", 3, 10))
    (bin_dir / "grid_scalars.f32").write_bytes(struct.pack("<2f", 0.1, 0.9))
    (bin_dir / "manifest.json").write_text(
        json.dumps(
            {
                "version": 1,
                "datasets": [
                    {
                        "id": "grid",
                        "name": "grid",
                        "n_vertices": 16,
                        "n_cells": 2,
                        "n_indices": 48,
                        "grid_dims": [2, 1, 1],
                        "files": {
                            "positions": "grid_positions.f32",
                            "indices": "grid_indices.u32",
                            "cell_ids": "grid_cell_ids.u32",
                            "scalars": {"porosity": "grid_scalars.f32"},
                        },
                    },
                ],
            },
        ),
    )
    app = FastAPI()
    app.include_router(build_router(tmp_path), prefix="/api")
    client = TestClient(app)

    details = client.get("/api/datasets/grid/cells/10")
    assert details.status_code == 200
    assert details.json()["cell_id"] == 10
    assert details.json()["properties"]["porosity"] == pytest.approx(0.9)
    exported = client.get("/api/datasets/grid/export?format=csv")
    assert exported.status_code == 200
    assert "3,0.1" in exported.text
    assert "10,0.899" in exported.text


def test_security_and_resource_store_reject_traversal(tmp_path):
    from oilgas_visualization_test_plugin.backend.cache.resource_store import (
        ResourceStore,
    )
    from oilgas_visualization_test_plugin.backend.security import safe_resolve

    assert safe_resolve(Path("../outside"), tmp_path) is None
    store = ResourceStore(tmp_path)
    try:
        store.get_path("../outside")
    except ValueError:
        pass
    else:
        raise AssertionError("resource traversal was accepted")


def test_manifest_concurrent_upserts_are_not_lost(tmp_path):
    from oilgas_visualization_test_plugin.backend.cache.layout import (
        CacheLayout,
    )
    from oilgas_visualization_test_plugin.backend.cache.manifest_store import (
        ManifestStore,
    )

    store = ManifestStore(tmp_path / "bin", CacheLayout(tmp_path))

    def add(index: int):
        store.upsert({"id": f"ds-{index}", "name": str(index)})

    with ThreadPoolExecutor(max_workers=8) as pool:
        list(pool.map(add, range(40)))
    manifest = json.loads(store.manifest_path.read_text())
    assert {item["id"] for item in manifest["datasets"]} == {
        f"ds-{index}" for index in range(40)
    }


def test_las_reader_converts_fixture(tmp_path):
    pytest.importorskip("lasio")
    from oilgas_visualization_test_plugin.backend.readers.las import LasReader

    fixture = (
        ROOT
        / "tests"
        / "unit"
        / "plugins"
        / "ugsci"
        / "fixtures"
        / "minimal_valid.las"
    )
    result = LasReader().read(str(fixture), "minimal", tmp_path)
    assert result["source"] == "las"
    assert result["n_vertices"] > 0
    assert result["n_cells"] == result["n_vertices"] - 1
    for filename in result["files"].values():
        if isinstance(filename, str):
            assert (tmp_path / filename).exists()


def test_tool_registration_uses_name_callable_pairs():
    plugin = PLUGIN.plugin
    calls = []

    class FakeAPI:
        def register_tool(self, **kwargs):
            calls.append(kwargs)

    plugin._register_tools(FakeAPI())  # pylint: disable=protected-access
    assert len(calls) == 11
    assert {call["tool_name"] for call in calls} == {
        "import_subsurface_dataset",
        "open_oilgas_visualization",
        "set_visualization_property",
        "set_visualization_timestep",
        "focus_visualization_object",
        "create_intersection",
        "capture_visualization",
        "run_visualization_benchmark",
        "filter_visualization",
        "generate_visualization_report",
        "save_visualization_report",
    }
    assert all(callable(call["tool_func"]) for call in calls)


def test_agent_filter_and_report_tools_return_viewer_commands():
    from oilgas_visualization_test_plugin.backend.tools import (
        filter_visualization,
        generate_visualization_report,
    )

    filtered = asyncio.run(
        filter_visualization(
            property="porosity",
            dataset_id="roff_eclgrid",
            property_min=0.2,
            ijk_i="1:5",
        ),
    )
    assert filtered["command"] == "set-filter"
    assert filtered["args"]["propertyMin"] == 0.2

    report = asyncio.run(
        generate_visualization_report("roff_eclgrid", "porosity"),
    )
    assert report["kind"] == "oilgas.analysis-report"
    assert report["stats"]["count"] > 0
    assert report["viewer"]["command"] == "show-report"


def test_agent_filter_resolves_well_radius_bounds(tmp_path):
    from oilgas_visualization_test_plugin.backend import tools

    bin_dir = tmp_path / "data" / "bin"
    bin_dir.mkdir(parents=True)
    (bin_dir / "manifest.json").write_text(
        json.dumps(
            {
                "datasets": [
                    {
                        "id": "well_3",
                        "name": "Well: 3",
                        "source": "wellbore",
                        "files": {"positions": "well_3_positions.f32"},
                    },
                ],
            },
        ),
    )
    (bin_dir / "well_3_positions.f32").write_bytes(
        struct.pack(
            "<9f",
            0,
            0,
            0,
            100,
            0,
            -100,
            200,
            0,
            -200,
        ),
    )
    tools.configure_tools(tmp_path)

    result = asyncio.run(
        tools.filter_visualization(
            dataset_id="grid",
            well_id="3",
            radius=50,
        ),
    )
    assert result["command"] == "set-filter"
    assert result["args"]["bounds"] == [50.0, 150.0, -50.0, 50.0, -200.0, 0.0]
    assert result["args"]["wellId"] == "3"

    missing = asyncio.run(
        tools.filter_visualization(
            dataset_id="grid",
            well_id="missing",
            radius=50,
        ),
    )
    assert missing["kind"] == "error"


def test_viewer_command_bus_delivers_once_per_viewer():
    from oilgas_visualization_test_plugin.backend.tools import ViewerCommandBus

    bus = ViewerCommandBus(max_queue=3)
    command_id = bus.enqueue("set-property", {"property": "porosity"})
    assert [item.command_id for item in bus.drain("viewer-a")] == [command_id]
    assert bus.drain("viewer-a") == []
    assert [item.command_id for item in bus.drain("viewer-b")] == [command_id]


def test_agent_report_can_be_saved_to_explicit_json_path(tmp_path):
    from oilgas_visualization_test_plugin.backend import tools

    tools.configure_tools(PLUGIN_DIR)
    target = tmp_path / "porosity-report.json"
    saved = asyncio.run(
        tools.save_visualization_report(
            "roff_eclgrid",
            str(target),
            property="porosity",
        ),
    )
    assert (
        saved["kind"] == "oilgas.report-file"
    ), f"Expected oilgas.report-file but got: {saved}"
    payload = json.loads(target.read_text(encoding="utf-8"))
    assert payload["dataset_id"] == "roff_eclgrid"
    assert payload["stats"]["count"] > 0

    duplicate = asyncio.run(
        tools.save_visualization_report(
            "roff_eclgrid",
            str(target),
            property="porosity",
        ),
    )
    assert duplicate["kind"] == "error"


def test_foundational_oilfield_converters_emit_shared_manifest_contract(
    tmp_path,
):
    from oilgas_visualization_test_plugin.backend.converters.network import (
        convert_network_to_lines,
    )
    from oilgas_visualization_test_plugin.backend.converters.surface import (
        convert_regular_surface,
    )
    from oilgas_visualization_test_plugin.backend.converters.wellbore import (
        convert_well_trajectory,
    )

    surface = convert_regular_surface(
        [0, 10],
        [0, 10],
        [[100, 101], [102, 103]],
        "horizon",
        tmp_path,
    )
    well = convert_well_trajectory(
        [0, 100],
        [0, 95],
        [10, 10],
        [20, 21],
        "A-1",
        tmp_path,
    )
    network = convert_network_to_lines(
        [
            {
                "x1": 0,
                "y1": 0,
                "z1": 0,
                "x2": 10,
                "y2": 0,
                "z2": 1,
                "pressure": 12,
            },
        ],
        "gathering",
        tmp_path,
    )
    for result, source in (
        (surface, "surface"),
        (well, "wellbore"),
        (network, "network"),
    ):
        assert result["source"] == source
        assert set(result["files"]) == {
            "positions",
            "indices",
            "cell_ids",
            "scalars",
        }
        assert all(
            (tmp_path / filename).exists()
            for filename in result["files"].values()
            if isinstance(filename, str)
        )


def test_vtk_reader_supports_vtu_surface_and_cell_data(tmp_path):
    pytest.importorskip("meshio")
    import numpy as np
    import meshio

    source = tmp_path / "sample.vtu"
    meshio.write(
        source,
        meshio.Mesh(
            points=np.array([[0, 0, 0], [1, 0, 0], [0, 1, 0]], dtype=float),
            cells=[("triangle", np.array([[0, 1, 2]], dtype=int))],
            cell_data={"pressure": [np.array([42.0])]},
        ),
    )
    from oilgas_visualization_test_plugin.backend.readers.vtk import VtkReader

    result = VtkReader().read(str(source), "sample", tmp_path)
    assert result["source"] == "vtk"
    assert result["n_vertices"] == 3
    assert result["n_cells"] == 1
    assert "pressure" in result["files"]["scalars"]


def test_agent_tools_reject_invalid_scene_arguments():
    from oilgas_visualization_test_plugin.backend.tools import (
        create_intersection,
        filter_visualization,
        set_visualization_timestep,
    )

    assert asyncio.run(set_visualization_timestep(-1))["kind"] == "error"
    assert (
        asyncio.run(
            create_intersection("grid", [0, 1], [0], 0, 10),
        )["kind"]
        == "error"
    )
    assert (
        asyncio.run(
            filter_visualization(property_min=0.9, property_max=0.1),
        )["kind"]
        == "error"
    )


def test_cancelled_import_does_not_start_after_queue_race(
    monkeypatch,
    tmp_path,
):
    from oilgas_visualization_test_plugin.backend.jobs import (
        manager as jobs_manager_module,
    )

    class DeferredExecutor:
        def __init__(self):
            self.callback = None

        def submit(self, callback):
            self.callback = callback

    deferred = DeferredExecutor()
    monkeypatch.setattr(jobs_manager_module, "_executor", deferred)
    manager = jobs_manager_module.JobManager()
    job = manager.submit_import(
        "cancel-me",
        tmp_path / "missing.roff",
        None,
        tmp_path,
    )
    assert manager.cancel_job(job.job_id) is True
    assert deferred.callback is not None
    deferred.callback()
    assert job.status == "cancelled"
