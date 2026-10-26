"""Real synthetic Eclipse files; no solver, private data or external service."""
from __future__ import annotations

import importlib.util
import json
import math
import struct
import sys
from pathlib import Path

import numpy as np
import pytest
import resfo
import xtgeo
from fastapi import FastAPI
from fastapi.testclient import TestClient

ROOT = Path(__file__).parents[4]
PACKAGE = ROOT / "plugins/bundle/ugsci/visualization"
NAME = "ugsci_simulation_fields_test"
spec = importlib.util.spec_from_file_location(NAME, PACKAGE / "__init__.py", submodule_search_locations=[str(PACKAGE)])
module = importlib.util.module_from_spec(spec)
sys.modules[NAME] = module
spec.loader.exec_module(module)
simulation = __import__(f"{NAME}.backend.simulation", fromlist=["simulation"])


def header(day=1):
    value = np.zeros(100, dtype=np.int32)
    value[2], value[8], value[9], value[10], value[11] = 1, 2, 1, 1, 2
    value[14], value[64], value[65], value[66], value[94] = 7, day, 1, 2026, 100
    return value


def restart_record(step, pressure, *, complete=True):
    entries = [("SEQNUM  ", np.array([step], dtype=np.int32)), ("INTEHEAD", header(step)),
               ("LOGIHEAD", np.zeros(100, dtype=np.bool_)), ("DOUBHEAD", np.zeros(100)),
               ("STARTSOL", resfo.MessType()), ("PRESSURE", np.array(pressure, dtype=np.float32)),
               ("SWAT    ", np.array([0.2, 0.3], dtype=np.float32))]
    if complete:
        entries.append(("ENDSOL  ", resfo.MessType()))
    return entries


@pytest.fixture
def case(tmp_path, monkeypatch):
    runtime = tmp_path / "runtime"
    monkeypatch.setattr(simulation, "runtime_directory", lambda: runtime)
    output = tmp_path / "output"
    output.mkdir()
    deck = output / "CASE.DATA"
    deck.write_text("synthetic test only", encoding="utf-8")
    xtgeo.create_box_grid((2, 1, 1)).to_file(output / "CASE.EGRID", fformat="egrid")
    resfo.write(output / "CASE.INIT", [("INTEHEAD", header()), ("LOGIHEAD", np.zeros(100, dtype=np.bool_)),
                                     ("PORO    ", np.array([0.15, np.nan], dtype=np.float32))])
    resfo.write(output / "CASE.UNRST", restart_record(1, [100, 200]))
    return deck, output, runtime


def values(path):
    raw = path.read_bytes()
    return struct.unpack(f"<{len(raw) // 4}f", raw)


def test_real_eclipse_fields_publish_resources_and_preserve_missing_values(case):
    deck, output, runtime = case
    result = simulation.publish_simulation_fields("run1", "eclipse", str(deck), str(output), final=True)
    assert result["status"] == "ready", result
    descriptor = result["datasets"][0]
    assert descriptor["time_steps"] == [{"index": 0, "timeStep": 1, "step_number": 1, "date": "20260101", "properties": ["pressure", "swat"]}]
    ds = simulation.runtime_manifest().get_dataset(descriptor["dataset_id"])
    assert values(runtime / "bin" / ds["time_steps"][0]["scalars"]["pressure"]) == (100, 200)
    assert math.isnan(values(runtime / "bin" / ds["files"]["scalars"]["poro"])[1])
    assert ds["properties"]["pressure"]["unit"] is None
    assert len(ds["time_steps"]) == 1
    assert not (output / "bin").exists()


def test_complete_frames_only_immutable_revisions_and_no_unchanged_conversion(case, monkeypatch):
    deck, output, runtime = case
    first = simulation.publish_simulation_fields("run1", "eclipse", str(deck), str(output), final=True)
    ds_id = first["datasets"][0]["dataset_id"]
    old = simulation.runtime_manifest().get_dataset(ds_id)
    old_resource = runtime / "bin" / old["time_steps"][0]["scalars"]["pressure"]
    old_bytes = old_resource.read_bytes()
    # A second step has readable records but no ENDSOL. It must not appear.
    resfo.write(output / "CASE.UNRST", restart_record(1, [100, 200]) + restart_record(2, [150, 250], complete=False))
    partial = simulation.publish_simulation_fields("run1", "eclipse", str(deck), str(output), final=True)
    assert partial["datasets"][0]["revision"] == 1
    assert len(partial["datasets"][0]["time_steps"]) == 1
    resfo.write(output / "CASE.UNRST", restart_record(1, [100, 200]) + restart_record(2, [150, 250]))
    second = simulation.publish_simulation_fields("run1", "eclipse", str(deck), str(output), final=True)
    assert second["datasets"][0]["dataset_id"] == ds_id
    assert second["datasets"][0]["revision"] == 2
    assert len(second["datasets"][0]["time_steps"]) == 2
    assert old_resource.read_bytes() == old_bytes
    reader = __import__(f"{NAME}.backend.readers.eclipse", fromlist=["EclipseReader"])
    monkeypatch.setattr(reader.EclipseReader, "read", lambda *a, **k: pytest.fail("unchanged fields were reconverted"))
    assert simulation.publish_simulation_fields("run1", "eclipse", str(deck), str(output))["datasets"] == second["datasets"]
    # Catalog publication may survive a crash before the small sampling-state
    # commit. Its stored fingerprint still prevents a redundant new revision.
    next((runtime / "runs").glob("*.json")).unlink()
    assert simulation.publish_simulation_fields("run1", "eclipse", str(deck), str(output), final=True)["datasets"] == second["datasets"]


def test_half_written_and_wrong_case_preserve_last_result(case):
    deck, output, runtime = case
    first = simulation.publish_simulation_fields("run1", "eclipse", str(deck), str(output), final=True)
    (output / "CASE.EGRID").write_bytes(b"incomplete")
    result = simulation.publish_simulation_fields("run1", "eclipse", str(deck), str(output), final=True)
    assert result["status"] == "stale"
    assert result["datasets"] == first["datasets"]
    (output / "CASE.EGRID").rename(output / "OTHER.EGRID")
    result = simulation.publish_simulation_fields("another-run", "eclipse", str(deck), str(output), final=True)
    assert result["status"] == "pending" and result["datasets"] == []


def test_sampling_requires_stability_and_api_serves_runtime_with_local_catalog(case, tmp_path):
    deck, output, runtime = case
    assert simulation.publish_simulation_fields("run1", "eclipse", str(deck), str(output))["status"] == "pending"
    ready = simulation.publish_simulation_fields("run1", "eclipse", str(deck), str(output))
    assert ready["status"] == "ready", ready
    local = tmp_path / "local"
    (local / "data/bin").mkdir(parents=True)
    (local / "data/bin/manifest.json").write_text(json.dumps({"version": 1, "datasets": [{"id": "old", "files": {}}]}))
    api = __import__(f"{NAME}.backend.api", fromlist=["build_router"])
    app = FastAPI()
    app.include_router(api.build_router(local), prefix="/vis")
    client = TestClient(app)
    catalog = client.get("/vis/manifest").json()
    assert {ds["id"] for ds in catalog["datasets"]} == {"old", ready["datasets"][0]["dataset_id"]}
    ds = next(item for item in catalog["datasets"] if item["id"] != "old")
    resource = ds["time_steps"][0]["scalars"]["pressure"]
    response = client.get(f"/vis/resource/{resource}", headers={"Range": "bytes=0-3"})
    assert response.status_code == 206 and struct.unpack("<f", response.content) == (100,)
    assert client.get(f"/vis/datasets/{ds['id']}/resources/{resource}").status_code == 200
    assert not (local / "data/bin" / resource).exists()
    assert client.get(f"/vis/datasets/{ds['id']}/stats?property=pressure&time_step=1").json()["mean"] == 150
    picked = client.get(f"/vis/datasets/{ds['id']}/cells/0?time_step=1")
    assert picked.status_code == 200
    section = client.post(f"/vis/datasets/{ds['id']}/slices", json={"axis": "i", "index": 1, "property": "pressure", "time_step": 1})
    assert section.status_code == 200, section.text
    sliced = section.json()
    assert values(runtime / "bin" / sliced["files"]["scalars"]["pressure"]) == (100,)
    assert not (local / "data/bin" / sliced["files"]["positions"]).exists()


def test_new_run_excludes_old_restart_but_can_reuse_static_grid(case, monkeypatch):
    deck, output, runtime = case
    monkeypatch.setattr(simulation, "_run_started", lambda run_id: (output / "CASE.UNRST").stat().st_mtime + 60)
    result = simulation.publish_simulation_fields("new-run", "eclipse", str(deck), str(output), final=True)
    assert result["status"] == "ready", result
    assert result["datasets"][0]["time_steps"] == []
    assert result["datasets"][0]["properties"] == ["poro"]
    assert any("predates" in warning for warning in result["warnings"])


def test_runtime_and_local_catalog_delete_restore_are_independent(case, tmp_path):
    deck, output, runtime = case
    ready = simulation.publish_simulation_fields("run1", "eclipse", str(deck), str(output), final=True)
    dataset_id = ready["datasets"][0]["dataset_id"]
    dataset = simulation.runtime_manifest().get_dataset(dataset_id)
    resource = dataset["time_steps"][0]["scalars"]["pressure"]
    local = tmp_path / "local"
    local_bin = local / "data/bin"
    local_bin.mkdir(parents=True)
    local_bytes = struct.pack("<3f", 0, 0, 0)
    (local_bin / "local.f32").write_bytes(local_bytes)
    (local_bin / "manifest.json").write_text(json.dumps({"version": 1, "datasets": [
        {"id": "local", "n_vertices": 1, "files": {"positions": "local.f32"}},
    ]}), encoding="utf-8")
    api = __import__(f"{NAME}.backend.api", fromlist=["build_router"])
    app = FastAPI()
    app.include_router(api.build_router(local), prefix="/vis")
    client = TestClient(app)

    assert client.delete("/vis/datasets/local").json()["status"] == "hidden"
    assert {item["id"] for item in client.get("/vis/manifest").json()["datasets"]} == {dataset_id}
    assert client.get(f"/vis/resource/{resource}").status_code == 200
    assert (local_bin / "local.f32").read_bytes() == local_bytes
    assert client.post("/vis/catalog/restore-examples").json()["count"] == 1
    assert {item["id"] for item in client.get("/vis/manifest").json()["datasets"]} == {"local", dataset_id}

    section = client.post(f"/vis/datasets/{dataset_id}/slices", json={"axis": "i", "index": 1, "property": "pressure", "time_step": 1})
    assert section.status_code == 200, section.text
    sliced = section.json()
    deleted = client.delete(f"/vis/datasets/{dataset_id}")
    assert deleted.status_code == 200
    assert set(deleted.json()["removed"]) == {dataset_id, sliced["id"]}
    assert {item["id"] for item in client.get("/vis/manifest").json()["datasets"]} == {"local"}
    assert client.get(f"/vis/resource/{resource}").status_code == 404
    assert not (runtime / "bin" / sliced["files"]["positions"]).exists()
    assert (local_bin / "local.f32").read_bytes() == local_bytes
    assert (output / "CASE.EGRID").is_file() and (output / "CASE.UNRST").is_file()


def test_real_vtk_point_data_missing_values_and_cell_association(tmp_path):
    import meshio
    reader = __import__(f"{NAME}.backend.readers.vtk", fromlist=["VtkReader"])
    mesh = meshio.Mesh(np.array([[0., 0., 0.], [1., 0., 0.], [0., 1., 0.]]),
                       [("triangle", np.array([[0, 1, 2]]))],
                       point_data={"temperature": np.array([1., np.nan, 3.])},
                       cell_data={"pressure": [np.array([np.nan])]})
    source = tmp_path / "field.vtu"
    mesh.write(source)
    ds = reader.VtkReader().read(str(source), "field", tmp_path)
    assert ds["properties"]["temperature"]["association"] == "point"
    assert ds["properties"]["pressure"]["association"] == "cell"
    assert math.isnan(values(tmp_path / ds["files"]["scalars"]["temperature"])[1])
    assert math.isnan(values(tmp_path / ds["files"]["scalars"]["pressure"])[0])


@pytest.mark.parametrize("simulator", ["cmg_imex", "cmg_gem", "cmg_stars"])
def test_cmg_terminal_sr3_snapshot_has_all_real_frames_and_no_live_claim(tmp_path, monkeypatch, simulator):
    import h5py
    runtime = tmp_path / "runtime"
    monkeypatch.setattr(simulation, "runtime_directory", lambda: runtime)
    deck = tmp_path / "CASE.dat"
    deck.write_text("\n".join(["RESULTS SIMULATOR IMEX 2024", "GRID CART 2 1 1", "DI", "10 10", "DJ", "20", "DK", "5", "NULL ALL", "2*1", "POR ALL", "0.2 0.3", "PERMI ALL", "2*50"]), encoding="utf-8")
    with h5py.File(tmp_path / "CASE.sr3", "w") as handle:
        spatial = handle.create_group("SpatialProperties")
        for index in range(12):
            group = spatial.create_group(f"{index:06}")
            group.create_dataset("PRES", data=np.array([100.0 + index, np.nan], dtype="<f4"))
    running = simulation.publish_simulation_fields("cmg-run", simulator, str(deck), str(tmp_path))
    assert running["status"] == "pending" and not running["datasets"]
    assert any("live" in item for item in running["warnings"])
    result = simulation.publish_simulation_fields("cmg-run", simulator, str(deck), str(tmp_path), final=True)
    assert result["status"] == "ready", result
    assert len(result["datasets"][0]["time_steps"]) == 12
    ds = simulation.runtime_manifest().get_dataset(result["datasets"][0]["dataset_id"])
    data = values(runtime / "bin" / ds["time_steps"][-1]["scalars"]["pressure"])
    assert data[0] == 111 and math.isnan(data[1])
    assert ds["metadata"]["units"] is None
    assert ds["properties"]["pressure"]["unit"] is None
    (tmp_path / "CASE.sr3").write_bytes(b"partial HDF5")
    failed = simulation.publish_simulation_fields("cmg-run", simulator, str(deck), str(tmp_path), final=True)
    assert failed["status"] == "stale" and failed["datasets"] == result["datasets"]


def test_opm_flow_reuses_real_eclipse_field_format(case):
    deck, output, _ = case
    result = simulation.publish_simulation_fields("opm-run", "opm_flow", str(deck), str(output), final=True)
    assert result["status"] == "ready", result
    assert result["datasets"][0]["time_steps"][0]["properties"] == ["pressure", "swat"]
