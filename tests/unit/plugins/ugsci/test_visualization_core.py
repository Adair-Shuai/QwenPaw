# -*- coding: utf-8 -*-
# pylint: disable=no-name-in-module
from __future__ import annotations

import importlib.util
import json
import sys
import asyncio
import struct
from array import array
from types import SimpleNamespace
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest

ROOT = Path(__file__).parents[4]
PLUGIN_DIR = ROOT / "plugins" / "bundle" / "ugsci" / "visualization"


def _load_plugin_package():
    name = "ugsci_visualization_test_plugin"
    if name in sys.modules:
        return sys.modules[name]
    spec = importlib.util.spec_from_file_location(
        name,
        PLUGIN_DIR / "__init__.py",
        submodule_search_locations=[str(PLUGIN_DIR)],
    )
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


_load_plugin_package()

configure_tools = importlib.import_module(
    "ugsci_visualization_test_plugin.backend.tools",
).configure_tools
configure_tools(PLUGIN_DIR)


def test_router_uses_package_relative_imports_despite_global_api_collision(
    monkeypatch,
):
    fake_spec = importlib.util.spec_from_loader("api", loader=None)
    fake_api = importlib.util.module_from_spec(fake_spec)
    monkeypatch.setitem(sys.modules, "api", fake_api)
    from ugsci_visualization_test_plugin.backend.api import build_router

    assert len(build_router(PLUGIN_DIR).routes) >= 16


def test_health_range_and_cell_details():
    from ugsci_visualization_test_plugin.backend.api import build_router

    app = FastAPI()
    app.include_router(build_router(PLUGIN_DIR), prefix="/api")
    client = TestClient(app)

    health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json()["service"] == "ugsci-visualization"

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
    from ugsci_visualization_test_plugin.backend.api import build_router

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


def _write_tiny_grid_plugin(
    root: Path,
    *,
    managed: bool = False,
    extra: dict | None = None,
) -> None:
    bin_dir = root / "data" / "bin"
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
    dataset = {
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
    }
    if managed:
        dataset["metadata"] = {"managed": True}
    if extra:
        dataset.update(extra)
    (bin_dir / "manifest.json").write_text(
        json.dumps({"version": 1, "datasets": [dataset]}),
        encoding="utf-8",
    )


def test_builtin_delete_hides_example_and_restore_brings_it_back(tmp_path):
    from ugsci_visualization_test_plugin.backend.api import build_router

    _write_tiny_grid_plugin(tmp_path)
    app = FastAPI()
    app.include_router(build_router(tmp_path), prefix="/api")
    client = TestClient(app)

    hidden = client.delete("/api/datasets/grid")
    assert hidden.status_code == 200
    payload = hidden.json()
    assert payload["status"] == "hidden"
    assert payload["hidden"] == ["grid"]
    assert (tmp_path / "data" / "bin" / "grid_positions.f32").exists()

    catalog = client.get("/api/manifest")
    assert catalog.status_code == 200
    assert catalog.json()["datasets"] == []
    assert catalog.json()["catalog"]["hidden_count"] == 1

    listed = client.get("/api/datasets")
    assert listed.json()["datasets"] == []

    details = client.get("/api/datasets/grid/cells/10")
    assert details.status_code == 200

    restored = client.post("/api/catalog/restore-examples")
    assert restored.status_code == 200
    assert restored.json()["count"] == 1
    assert client.get("/api/manifest").json()["datasets"][0]["id"] == "grid"


def test_managed_delete_removes_cache_files_and_cascades_children(tmp_path):
    from ugsci_visualization_test_plugin.backend.api import build_router

    _write_tiny_grid_plugin(tmp_path, managed=True)
    bin_dir = tmp_path / "data" / "bin"
    (bin_dir / "slice_positions.f32").write_bytes(
        struct.pack("<24f", *([0.0] * 24)),
    )
    (bin_dir / "slice_indices.u32").write_bytes(
        struct.pack("<36I", *range(36)),
    )
    (bin_dir / "slice_cell_ids.u32").write_bytes(struct.pack("<I", 1))
    manifest = json.loads(
        (bin_dir / "manifest.json").read_text(encoding="utf-8"),
    )
    manifest["datasets"].append(
        {
            "id": "grid_slice",
            "name": "grid slice",
            "n_vertices": 8,
            "n_cells": 1,
            "n_indices": 36,
            "source": "slice",
            "metadata": {"managed": True, "parent_dataset": "grid"},
            "files": {
                "positions": "slice_positions.f32",
                "indices": "slice_indices.u32",
                "cell_ids": "slice_cell_ids.u32",
                "scalars": {},
            },
        },
    )
    (bin_dir / "manifest.json").write_text(
        json.dumps(manifest),
        encoding="utf-8",
    )

    app = FastAPI()
    app.include_router(build_router(tmp_path), prefix="/api")
    client = TestClient(app)

    deleted = client.delete("/api/datasets/grid/cache")
    assert deleted.status_code == 200
    payload = deleted.json()
    assert payload["status"] == "removed"
    assert set(payload["removed"]) == {"grid", "grid_slice"}
    assert not (bin_dir / "grid_positions.f32").exists()
    assert not (bin_dir / "slice_positions.f32").exists()
    assert client.get("/api/manifest").json()["datasets"] == []
    assert client.get("/api/datasets/grid/cells/10").status_code == 404


def test_security_and_resource_store_reject_traversal(tmp_path):
    from ugsci_visualization_test_plugin.backend.cache.resource_store import (
        ResourceStore,
    )
    from ugsci_visualization_test_plugin.backend.security import safe_resolve

    assert safe_resolve(Path("../outside"), tmp_path) is None
    store = ResourceStore(tmp_path)
    try:
        store.get_path("../outside")
    except ValueError:
        pass
    else:
        raise AssertionError("resource traversal was accepted")


def test_workspace_import_hands_resolved_path_directly_to_worker(
    tmp_path,
    monkeypatch,
):
    """Large workspace files must not be copied through browser multipart."""
    from ugsci_visualization_test_plugin.backend.api import build_router
    from ugsci_visualization_test_plugin.backend.jobs.manager import (
        job_manager,
    )
    from qwenpaw.app import agent_context

    source = tmp_path / "million-cell.DATA"
    source.write_text("RUN\n", encoding="utf-8")

    async def fake_agent_for_request(_request):
        return SimpleNamespace(workspace_dir=tmp_path)

    captured = {}

    def fake_submit(
        name,
        upload_path,
        prop_path,
        bin_dir,
        _companion_paths=None,
    ):
        captured.update(
            {
                "name": name,
                "path": upload_path,
                "prop_path": prop_path,
                "bin_dir": bin_dir,
            },
        )
        return SimpleNamespace(job_id="direct01", status="queued")

    monkeypatch.setattr(
        agent_context,
        "get_agent_for_request",
        fake_agent_for_request,
    )
    monkeypatch.setattr(job_manager, "submit_import", fake_submit)

    app = FastAPI()
    app.include_router(build_router(tmp_path), prefix="/api")
    client = TestClient(app)
    response = client.post(
        "/api/imports/workspace",
        json={
            "path": source.name,
            "root": "workspace",
            "name": "million-cell",
        },
    )

    assert response.status_code == 202
    assert response.json()["source"] == "workspace"
    assert response.json()["size"] == source.stat().st_size
    assert captured["path"] == source.resolve()
    assert captured["prop_path"] is None
    assert source.exists()

    traversal = client.post(
        "/api/imports/workspace",
        json={"path": "../outside.DATA", "root": "workspace"},
    )
    assert traversal.status_code == 400


def test_manifest_concurrent_upserts_are_not_lost(tmp_path):
    from ugsci_visualization_test_plugin.backend.cache.layout import (
        CacheLayout,
    )
    from ugsci_visualization_test_plugin.backend.cache.manifest_store import (
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


def test_manifest_store_preserves_unicode_and_repairs_legacy_names(tmp_path):
    from ugsci_visualization_test_plugin.backend.cache.layout import (
        CacheLayout,
    )
    from ugsci_visualization_test_plugin.backend.cache.manifest_store import (
        ManifestStore,
    )

    store = ManifestStore(tmp_path / "bin", CacheLayout(tmp_path))
    store.manifest_path.write_text(
        json.dumps(
            {
                "version": 1,
                "datasets": [
                    {"id": "legacy", "name": "ROFF Grid (46脳73脳30)"},
                ],
            },
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    manifest = store.read()
    assert manifest["datasets"][0]["name"] == "ROFF Grid (46×73×30)"

    store.upsert({"id": "unicode", "name": "地层模型 10×15×8"})
    persisted = json.loads(store.manifest_path.read_text(encoding="utf-8"))
    assert {item["name"] for item in persisted["datasets"]} == {
        "ROFF Grid (46×73×30)",
        "地层模型 10×15×8",
    }


def test_las_reader_converts_fixture(tmp_path):
    # Works with lasio when installed, otherwise via the builtin LAS parser.
    from ugsci_visualization_test_plugin.backend.readers.las import LasReader

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


def test_las_builtin_parser_used_when_lasio_missing(tmp_path, monkeypatch):
    monkeypatch.setitem(sys.modules, "lasio", None)
    from ugsci_visualization_test_plugin.backend.readers.las import LasReader

    fixture = (
        ROOT
        / "tests"
        / "unit"
        / "plugins"
        / "ugsci"
        / "fixtures"
        / "minimal_valid.las"
    )
    result = LasReader().read(str(fixture), "fallback", tmp_path)
    assert result["metadata"]["reader"] == "builtin-las"
    assert result["metadata"]["well_name"] == "Test Well 001"
    assert result["n_vertices"] == 11
    assert set(result["files"]["scalars"]) == {"gr", "rhob", "nphi"}
    raw = (tmp_path / result["files"]["scalars"]["gr"]).read_bytes()
    values = struct.unpack(f"<{len(raw) // 4}f", raw)
    assert abs(values[0] - 85.0) < 1e-6
    assert result["metadata"]["depth_range"] == [1000.0, 1005.0]


def test_grdecl_builtin_reader_without_xtgeo(tmp_path, monkeypatch):
    monkeypatch.setitem(sys.modules, "xtgeo", None)
    from ugsci_visualization_test_plugin.backend.readers.eclipse import (
        EclipseReader,
    )

    deck = "\n".join(
        [
            "-- 2x2x1 corner-point deck",
            "SPECGRID",
            " 2 2 1 1 F /",
            "COORD",
        ]
        + [
            f" {i * 100.0} {j * 100.0} 1000.0 {i * 100.0} {j * 100.0} 1010.0"
            for j in range(3)
            for i in range(3)
        ]
        + [
            " /",
            "ZCORN",
            " 16*1000.0 16*1010.0 /",
            "ACTNUM",
            " 1 1 1 0 /",
            "PORO",
            " 0.10 0.20 0.30 0.40 /",
            "PERMX",
            " 4*250.0 /",
            "",
        ],
    )
    source = tmp_path / "mini.grdecl"
    source.write_text(deck, encoding="utf-8")

    result = EclipseReader().read(str(source), "mini_grdecl", tmp_path)
    assert result["metadata"]["reader"] == "builtin-grdecl"
    assert result["grid_dims"] == [2, 2, 1]
    assert result["n_cells"] == 3  # ACTNUM removes the fourth cell
    assert result["n_vertices"] == 42

    raw = (tmp_path / result["files"]["scalars"]["porosity"]).read_bytes()
    porosity = struct.unpack(f"<{len(raw) // 4}f", raw)
    assert [round(v, 2) for v in porosity] == [0.10, 0.20, 0.30]

    raw = (tmp_path / result["files"]["positions"]).read_bytes()
    positions = struct.unpack(f"<{len(raw) // 4}f", raw)
    # First corner of cell (1,1,1) sits at the origin pillar, depth 1000
    # (z is negated for the viewer).
    assert positions[0:3] == (0.0, 0.0, -1000.0)
    xs = positions[0::3]
    ys = positions[1::3]
    assert max(xs) == 200.0 and max(ys) == 200.0


def test_eclipse_pairing_remaps_to_structured_vtk_hex():
    from ugsci_visualization_test_plugin.backend.converters.hex import (
        eclipse_pairing_to_vtk,
        hex_quad_normal_agreement,
        uses_eclipse_pairing,
    )

    # One cartesian cell in Eclipse pairing: (SW,SE,NW,NE) per layer.
    pairing = [
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        1.0,
        1.0,
        0.0,
        0.0,
        0.0,
        1.0,
        1.0,
        0.0,
        1.0,
        0.0,
        1.0,
        1.0,
        1.0,
        1.0,
        1.0,
    ]
    assert uses_eclipse_pairing(pairing)
    assert hex_quad_normal_agreement(pairing, 0, (0, 1, 2, 3)) < 0
    remapped = eclipse_pairing_to_vtk(pairing)
    assert not uses_eclipse_pairing(remapped)
    assert hex_quad_normal_agreement(remapped, 0, (0, 1, 2, 3)) > 0.99
    # VTK corner 2 is NE (1,1,0), not NW.
    assert remapped[6:9] == [1.0, 1.0, 0.0]


def test_opm_centroid_fan_avoids_diagonal_fold_on_nonplanar_quad():
    from ugsci_visualization_test_plugin.backend.converters.hex import (
        HEX_FILL_INDICES_PER_CELL,
        HEX_FILL_VERTS_PER_CELL,
        opm_quad_normal,
        tessellate_hex_opm_fan,
        hex_quad_normal_agreement,
    )

    # VTK hex with the top-NE corner lifted so the top face is non-planar.
    corners = [
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        1.0,
        1.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        1.0,
        1.0,
        0.0,
        1.0,
        1.0,
        1.0,
        1.4,
        0.0,
        1.0,
        1.0,
    ]
    # Top face (4, 7, 6, 5) splits along a diagonal into two triangles whose
    # normals disagree — the origami crease in the screenshot.
    assert hex_quad_normal_agreement(corners, 0, (4, 7, 6, 5)) < 0.95

    positions, indices, normals = tessellate_hex_opm_fan(corners)
    assert len(positions) == HEX_FILL_VERTS_PER_CELL * 3
    assert len(indices) == HEX_FILL_INDICES_PER_CELL
    assert len(normals) == len(positions)

    top_a = (0.0, 0.0, 1.0)
    top_b = (0.0, 1.0, 1.0)
    top_c = (1.0, 1.0, 1.4)
    top_d = (1.0, 0.0, 1.0)
    expected = opm_quad_normal(top_a, top_b, top_c, top_d)
    # Face 1 is VTK top (4, 7, 6, 5); all five duplicated verts share
    # one normal.
    top_base = 1 * 5
    for vertex in range(5):
        offset = (top_base + vertex) * 3
        assert normals[offset : offset + 3] == pytest.approx(
            expected,
            abs=1e-6,
        )

    # Fan triangles are centroid → each edge, not a single diagonal split.
    midpoint = top_base + 4
    fan = [
        tuple(indices[start : start + 3]) for start in range(1 * 12, 2 * 12, 3)
    ]
    assert fan == [
        (midpoint, top_base, top_base + 1),
        (midpoint, top_base + 1, top_base + 2),
        (midpoint, top_base + 2, top_base + 3),
        (midpoint, top_base + 3, top_base),
    ]


def test_compact_disk_mesh_is_opm_centroid_fan():
    from ugsci_visualization_test_plugin.backend.converters.hex import (
        HEX_COMPACT_VERTS_PER_CELL,
        HEX_FILL_INDICES_PER_CELL,
        compact_hex_centroid_mesh,
        eclipse_pairing_to_vtk,
        extract_hex_corners,
        tessellate_hex_opm_fan,
    )

    pairing = [
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        1.0,
        1.0,
        0.0,
        0.0,
        0.0,
        1.0,
        1.0,
        0.0,
        1.0,
        0.0,
        1.0,
        1.0,
        1.0,
        1.0,
        1.0,
    ]
    corners = eclipse_pairing_to_vtk(pairing)
    positions, indices = compact_hex_centroid_mesh(corners)
    assert len(positions) == HEX_COMPACT_VERTS_PER_CELL * 3
    assert len(indices) == HEX_FILL_INDICES_PER_CELL
    assert positions[:24] == corners
    # Top-face centroid is the average of VTK corners 4,7,6,5.
    top = positions[9 * 3 : 10 * 3]
    assert top == pytest.approx([0.5, 0.5, 1.0])
    for start in range(0, len(indices), 3):
        local = list(indices[start : start + 3])
        assert max(local) >= 8
        assert min(local) < 8

    extracted = extract_hex_corners(positions, 1)
    assert extracted == corners
    fill_positions, fill_indices, _normals = tessellate_hex_opm_fan(extracted)
    assert len(fill_indices) == HEX_FILL_INDICES_PER_CELL
    assert fill_positions[12:15] == pytest.approx([0.5, 0.5, 0.0])


def test_cmg_reader_parses_component_major_grid_and_repeat_values(tmp_path):
    from ugsci_visualization_test_plugin.backend.readers.cmg import CmgReader

    # 2x1x1 fixture: X, Y and Z blocks over the refined (4x2x2) corner
    # lattice. The second cell is NULL and must not be emitted.
    x_values = [0.0, 1.0, 1.0, 2.0] * 4
    y_values = [0.0] * 8 + [1.0] * 8
    z_values = [100.0] * 8 + [110.0] * 8
    lines = ["RESULTS SIMULATOR GEM 2024", "GRID CORNER 2 1 1", "CORNERS"]
    for values in (x_values, y_values, z_values):
        lines.append(" ".join(str(value) for value in values))
    lines += [
        "NULL ALL",
        "1 0",
        "NETGROSS ALL",
        "2*1",
        "POR ALL",
        "0.2 0.0",
        "PERMI ALL",
        "2*100",
        "PERMJ EQUALSI",
        "PERMK EQUALSI * 0.1",
        "END-GRID",
    ]
    fixture = tmp_path / "mini.dat"
    fixture.write_text("\n".join(lines), encoding="utf-8")

    result = CmgReader().read(str(fixture), "mini", tmp_path)
    assert result["source"] == "cmg"
    assert result["grid_dims"] == [2, 1, 1]
    assert result["n_cells"] == 1
    assert result["n_vertices"] == 14
    assert set(result["files"]["scalars"]) == {
        "netgross",
        "porosity",
        "permi",
        "permj",
        "permk",
    }
    assert result["metadata"]["simulator"] == "GEM"
    assert result["metadata"]["has_dynamic_results"] is False
    assert (
        tmp_path / result["files"]["positions"]
    ).stat().st_size == 14 * 3 * 4
    assert (tmp_path / result["files"]["indices"]).stat().st_size == 72 * 4

    positions = array("f")
    with (tmp_path / result["files"]["positions"]).open("rb") as handle:
        positions.fromfile(handle, 8 * 3)
    xs = positions[0::3]
    ys = positions[1::3]
    zs = positions[2::3]
    assert max(xs) - min(xs) == pytest.approx(1.0)
    assert max(ys) - min(ys) == pytest.approx(1.0)
    assert max(zs) - min(zs) == pytest.approx(10.0)


def test_cmg_reader_maps_refined_corner_lattice_to_hexahedral_cells(tmp_path):
    from ugsci_visualization_test_plugin.backend.readers.cmg import CmgReader

    # CMG stores CORNERS as three coordinate blocks over a refined
    # (2 * NI, 2 * NJ, 2 * NK) lattice, with I varying fastest.  Adjacent
    # cells have separate lattice points at their common face so faults can
    # split them; this continuous fixture gives those points equal values.
    ni, nj, nk = 2, 1, 1
    x_nodes = (0.0, 10.0, 10.0, 20.0)
    coordinates = [
        coordinate
        for axis in ("x", "y", "z")
        for k in range(2 * nk)
        for j in range(2 * nj)
        for i in range(2 * ni)
        for coordinate in (
            (
                x_nodes[i]
                if axis == "x"
                else (20.0 * j if axis == "y" else 100.0 + 5.0 * k)
            ),
        )
    ]
    fixture = tmp_path / "refined-lattice.dat"
    fixture.write_text(
        "\n".join(
            [
                f"GRID CORNER {ni} {nj} {nk}",
                "CORNERS",
                " ".join(str(value) for value in coordinates),
                "NULL ALL",
                "2*1",
                "END-GRID",
            ],
        ),
        encoding="utf-8",
    )

    result = CmgReader().read(str(fixture), "refined", tmp_path)
    from ugsci_visualization_test_plugin.backend.converters.hex import (
        HEX_COMPACT_VERTS_PER_CELL,
    )

    positions_path = tmp_path / result["files"]["positions"]
    positions = struct.unpack(
        f"<{positions_path.stat().st_size // 4}f",
        positions_path.read_bytes(),
    )
    stride = HEX_COMPACT_VERTS_PER_CELL * 3
    cells = [
        [
            tuple(positions[offset : offset + 3])
            for offset in range(start, start + 24, 3)
        ]
        for start in range(0, len(positions), stride)
    ]

    assert len(cells) == 2
    for vertices in cells:
        spans = [
            max(vertex[axis] for vertex in vertices)
            - min(vertex[axis] for vertex in vertices)
            for axis in range(3)
        ]
        assert spans == pytest.approx([10.0, 20.0, 5.0])
        assert len(set(vertices)) == 8

    shared_face = set(cells[0]).intersection(cells[1])
    assert len(shared_face) == 4
    assert {vertex[0] for vertex in shared_face} == {10.0}


def test_eclipse_and_tnavigator_format_routes(tmp_path):
    from ugsci_visualization_test_plugin.backend.jobs.manager import (
        _find_companion,
    )
    from ugsci_visualization_test_plugin.backend.readers.eclipse import (
        EclipseReader,
    )
    from ugsci_visualization_test_plugin.backend.readers.tnavigator import (
        TNavigatorReader,
    )

    assert ".grid" in EclipseReader().extensions

    deck = tmp_path / "CASE.DATA"
    grid = tmp_path / "CASE.GRID"
    grid.write_bytes(b"binary-grid-placeholder")
    deck.write_text("INCLUDE\n 'CASE.GRID' /\n", encoding="utf-8")
    # pylint: disable-next=protected-access
    assert TNavigatorReader()._resolve_grid(deck) == grid

    init_file = tmp_path / ".upload_property_random.INIT"
    init_file.write_bytes(b"properties")
    assert _find_companion(grid, init_file, {".init"}) == init_file


def test_tnavigator_reports_missing_grid_companion(tmp_path):
    from ugsci_visualization_test_plugin.backend.readers.tnavigator import (
        TNavigatorReader,
    )

    deck = tmp_path / "NO_GRID.DATA"
    deck.write_text("RUNSPEC\nDIMENS\n1 1 1 /\n", encoding="utf-8")
    with pytest.raises(ValueError, match="GRID/EGRID/GRDECL"):
        TNavigatorReader().read(str(deck), "missing", tmp_path)


def test_visualization_exposes_all_ugsci_tool_bindings():
    from plugins.bundle.ugsci.visualization import (
        get_visualization_tool_bindings,
    )

    bindings = get_visualization_tool_bindings()
    assert set(bindings) == {
        "import_subsurface_dataset",
        "open_oilgas_visualization",
        "set_visualization_property",
        "set_visualization_timestep",
        "configure_visualization_view",
        "get_visualization_command_status",
        "focus_visualization_object",
        "create_intersection",
        "create_well_section",
        "create_ijk_slice",
        "capture_visualization",
        "run_visualization_benchmark",
        "filter_visualization",
        "generate_visualization_report",
        "save_visualization_report",
    }
    assert all(callable(func) for func in bindings.values())


def test_agent_filter_and_report_tools_return_viewer_commands():
    from ugsci_visualization_test_plugin.backend.tools import (
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
    from ugsci_visualization_test_plugin.backend import tools

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
    from ugsci_visualization_test_plugin.backend.tools import ViewerCommandBus

    bus = ViewerCommandBus(max_queue=3)
    command_id = bus.enqueue("set-property", {"property": "porosity"})
    assert [item.command_id for item in bus.drain("viewer-a")] == [command_id]
    assert bus.drain("viewer-a") == []
    assert [item.command_id for item in bus.drain("viewer-b")] == [command_id]


def test_agent_report_can_be_saved_to_explicit_json_path(tmp_path):
    from ugsci_visualization_test_plugin.backend import tools

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
    from ugsci_visualization_test_plugin.backend.converters.network import (
        convert_network_to_lines,
    )
    from ugsci_visualization_test_plugin.backend.converters.surface import (
        convert_regular_surface,
    )
    from ugsci_visualization_test_plugin.backend.converters.wellbore import (
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
    from ugsci_visualization_test_plugin.backend.readers.vtk import VtkReader

    result = VtkReader().read(str(source), "sample", tmp_path)
    assert result["source"] == "vtk"
    assert result["n_vertices"] == 3
    assert result["n_cells"] == 1
    assert "pressure" in result["files"]["scalars"]


def test_cmg_reader_parses_equalsi_cartesian_wells_and_sr3(tmp_path):
    h5py = pytest.importorskip("h5py")
    numpy = pytest.importorskip("numpy")
    from ugsci_visualization_test_plugin.backend.readers.cmg import CmgReader

    deck = tmp_path / "case.dat"
    deck.write_text(
        "\n".join(
            [
                "RESULTS SIMULATOR IMEX 2024",
                "GRID CART 2 1 1",
                "ORIGIN 0 0 100",
                "DI",
                "10 10",
                "DJ",
                "20",
                "DK",
                "5",
                "NULL ALL",
                "2*1",
                "POR ALL",
                "0.2 0.3",
                "PERMI ALL",
                "2*50",
                "PERMJ EQUALSI",
                "PERMK EQUALSI * 0.1",
                "WELL 'P1'",
                "PERF GEOA 'P1'",
                "1 1 1 1.0 OPEN",
                "TRAJECTORY 'P1'",
                "0 100 5 10",
                "20 105 15 10",
            ],
        ),
        encoding="utf-8",
    )
    sr3 = tmp_path / "case.sr3"
    with h5py.File(sr3, "w") as handle:
        spatial = handle.create_group("SpatialProperties")
        step = spatial.create_group("000001")
        step.create_dataset(
            "PRES",
            data=numpy.array([100.0, 110.0], dtype="<f4"),
        )
        step.create_dataset("SOIL", data=numpy.array([0.7, 0.6], dtype="<f4"))
        step2 = spatial.create_group("000002")
        step2.create_dataset(
            "PRES",
            data=numpy.array([90.0, 95.0], dtype="<f4"),
        )
        step2.create_dataset(
            "SOIL",
            data=numpy.array([0.65, 0.55], dtype="<f4"),
        )

    result = CmgReader().read(
        str(deck),
        "case",
        tmp_path,
        options={"sr3_path": str(sr3)},
    )
    assert result["metadata"]["grid_type"] == "cartesian"
    assert result["metadata"]["simulator"] == "IMEX"
    assert result["n_cells"] == 2
    assert result["files"]["scalars"]["permj"]
    assert result["files"]["scalars"]["permk"]
    assert result["metadata"]["has_dynamic_results"] is True
    assert result["time_steps"]
    assert "pressure" in result["time_steps"][0]["scalars"]
    wells = result["related_datasets"]
    assert wells and wells[0]["source"] == "wellbore"
    assert wells[0]["n_vertices"] >= 2


def test_intersection_samples_nearest_cell_property(tmp_path):
    from ugsci_visualization_test_plugin.backend.converters import intersection

    create_intersection_along_polyline = (
        intersection.create_intersection_along_polyline
    )

    positions = []
    for origin in ((0.0, 0.0, 0.0), (10.0, 0.0, 0.0)):
        x0, y0, z0 = origin
        for dx, dy, dz in (
            (0, 0, 0),
            (1, 0, 0),
            (1, 1, 0),
            (0, 1, 0),
            (0, 0, 1),
            (1, 0, 1),
            (1, 1, 1),
            (0, 1, 1),
        ):
            positions.extend([x0 + dx, y0 + dy, z0 + dz])
    result = create_intersection_along_polyline(
        positions,
        [],
        [0, 1],
        [0.2, 0.8],
        [0.2, 0.8],
        0.0,
        10.0,
        "demo",
        tmp_path,
        property_values=[1.5, 9.5],
        property_name="porosity",
    )
    assert result["source"] == "intersection"
    assert "porosity" in result["files"]["scalars"]
    raw = (tmp_path / result["files"]["scalars"]["porosity"]).read_bytes()
    values = struct.unpack(f"<{len(raw) // 4}f", raw)
    assert all(value == pytest.approx(1.5) for value in values)


def test_slice_histogram_and_well_section_endpoints(tmp_path):
    from ugsci_visualization_test_plugin.backend.api import build_router

    bin_dir = tmp_path / "data" / "bin"
    bin_dir.mkdir(parents=True)
    positions = []
    for base in (0.0, 10.0):
        for index in range(8):
            positions.extend([base + (index % 2), index // 2, 0.0])
    (bin_dir / "grid_positions.f32").write_bytes(
        struct.pack(f"<{len(positions)}f", *positions),
    )
    (bin_dir / "grid_indices.u32").write_bytes(
        struct.pack("<72I", *list(range(36)) * 2),
    )
    (bin_dir / "grid_cell_ids.u32").write_bytes(struct.pack("<2I", 0, 1))
    (bin_dir / "grid_scalars.f32").write_bytes(struct.pack("<2f", 0.2, 0.8))
    well_positions = [0.0, 0.0, 0.0, 5.0, 0.0, -10.0]
    (bin_dir / "well_positions.f32").write_bytes(
        struct.pack(f"<{len(well_positions)}f", *well_positions),
    )
    (bin_dir / "well_indices.u32").write_bytes(struct.pack("<3I", 0, 1, 0))
    (bin_dir / "well_cell_ids.u32").write_bytes(struct.pack("<2I", 0, 1))
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
                        "n_indices": 72,
                        "grid_dims": [2, 1, 1],
                        "files": {
                            "positions": "grid_positions.f32",
                            "indices": "grid_indices.u32",
                            "cell_ids": "grid_cell_ids.u32",
                            "scalars": {"porosity": "grid_scalars.f32"},
                        },
                    },
                    {
                        "id": "well_p1",
                        "name": "Well P1",
                        "n_vertices": 2,
                        "n_cells": 2,
                        "n_indices": 3,
                        "source": "wellbore",
                        "files": {
                            "positions": "well_positions.f32",
                            "indices": "well_indices.u32",
                            "cell_ids": "well_cell_ids.u32",
                            "scalars": {},
                        },
                    },
                ],
            },
        ),
        encoding="utf-8",
    )
    app = FastAPI()
    app.include_router(build_router(tmp_path), prefix="/api")
    client = TestClient(app)

    histogram = client.get(
        "/api/datasets/grid/histogram?property=porosity&bins=8",
    )
    assert histogram.status_code == 200
    assert histogram.json()["count"] == 2
    assert sum(histogram.json()["counts"]) == 2

    sliced = client.post(
        "/api/datasets/grid/slices",
        json={"axis": "i", "index": 1, "property": "porosity"},
    )
    assert sliced.status_code == 200
    assert sliced.json()["source"] == "slice"
    assert sliced.json()["n_cells"] == 1

    section = client.post(
        "/api/datasets/grid/well-sections",
        json={"well_dataset_id": "well_p1", "property": "porosity"},
    )
    assert section.status_code == 200
    assert section.json()["source"] == "well-intersection"
    assert "porosity" in section.json()["files"]["scalars"]

    curtain = client.post(
        "/api/datasets/grid/intersections",
        json={
            "polyline_x": [0.0, 1.0],
            "polyline_y": [0.0, 1.0],
            "property": "porosity",
        },
    )
    assert curtain.status_code == 200
    assert "porosity" in curtain.json()["files"]["scalars"]
