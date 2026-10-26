# -*- coding: utf-8 -*-
from __future__ import annotations

import importlib.util
import json
import math
import struct
import sys
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

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


@pytest.fixture(autouse=True)
def isolate_simulation_runtime(tmp_path, monkeypatch):
    """Keep API fixtures independent of the user's current simulation catalog."""
    from ugsci_visualization_test_plugin.backend import simulation

    monkeypatch.setattr(simulation, "runtime_directory", lambda: tmp_path / "simulation-runtime")


def test_las_fixture_is_depth_only(tmp_path):
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
    assert result["metadata"]["placement"] == "depth-only"
    assert result["metadata"]["spatial"] is False
    assert result["metadata"]["kind"] == "well-log"


def test_trajectory_placement_classifies_spatial_vs_depth_only(tmp_path):
    from ugsci_visualization_test_plugin.backend.converters.wellbore import (
        convert_well_trajectory,
        trajectory_placement,
    )

    assert trajectory_placement(
        [500000.0, 500000.0],
        [4_000_000.0, 4_000_000.0],
    ) == {
        "kind": "wellbore",
        "placement": "spatial",
        "spatial": True,
    }
    assert trajectory_placement([0.0, 0.0], [0.0, 0.0]) == {
        "kind": "well-log",
        "placement": "depth-only",
        "spatial": False,
    }
    spatial = convert_well_trajectory(
        [0, 100],
        [0, 95],
        [10, 10],
        [20, 21],
        "A-1",
        tmp_path,
    )
    assert spatial["source"] == "wellbore"
    assert spatial["metadata"]["placement"] == "spatial"
    origin_well = convert_well_trajectory(
        [0, 100],
        [0, 100],
        [0, 0],
        [0, 0],
        "origin",
        tmp_path,
    )
    assert origin_well["source"] == "wellbore"
    assert origin_well["metadata"]["placement"] == "depth-only"
    assert origin_well["metadata"]["spatial"] is False


def test_las_reader_uses_header_xy_as_spatial_stick(tmp_path, monkeypatch):
    monkeypatch.setitem(sys.modules, "lasio", None)
    from ugsci_visualization_test_plugin.backend.readers.las import LasReader

    source = tmp_path / "located.las"
    source.write_text(
        "\n".join(
            [
                "~Version Information",
                "VERS. 2.0 :",
                "WRAP. NO :",
                "~Well Information",
                "STRT.M 0 :",
                "STOP.M 2 :",
                "STEP.M 1 :",
                "NULL. -999.25 :",
                "WELL. Located :",
                "XWELL.M 500000 :",
                "YWELL.M 4000000 :",
                "~Curve Information",
                "DEPT.M :",
                "GR.API :",
                "~A",
                "0 10",
                "1 20",
                "2 30",
                "",
            ],
        ),
        encoding="utf-8",
    )
    result = LasReader().read(str(source), "located", tmp_path)
    assert result["metadata"]["placement"] == "spatial"
    assert result["metadata"]["spatial"] is True
    raw = (tmp_path / result["files"]["positions"]).read_bytes()
    values = struct.unpack(f"<{len(raw) // 4}f", raw)
    assert values[0] == 500000.0
    assert values[1] == 4000000.0
    assert values[2] == 0.0


@pytest.mark.parametrize("md,tvd,x,y", [
    ([], [], [], []),
    ([0, 10], [0], [0, 1], [0, 1]),
    ([0, 0], [0, 10], [0, 1], [0, 1]),
    ([10, 0], [0, 10], [0, 1], [0, 1]),
    ([0, 10], [0, float("nan")], [0, 1], [0, 1]),
    ([0, 10], [0, 10], [0, float("inf")], [0, 1]),
])
def test_well_trajectory_rejects_invalid_samples_before_writing(tmp_path, md, tvd, x, y):
    from ugsci_visualization_test_plugin.backend.converters.wellbore import convert_well_trajectory

    with pytest.raises(ValueError):
        convert_well_trajectory(md, tvd, x, y, "invalid", tmp_path)
    assert list(tmp_path.iterdir()) == []


@pytest.mark.parametrize("builtin", [True, False])
def test_las_missing_values_remain_unknown_and_point_resources_include_last_sample(tmp_path, monkeypatch, builtin):
    from ugsci_visualization_test_plugin.backend.readers.las import LasReader
    from ugsci_visualization_test_plugin.backend.api import build_router

    if builtin:
        monkeypatch.setitem(sys.modules, "lasio", None)
    bin_dir = tmp_path / "data" / "bin"
    fixture = ROOT / "tests" / "unit" / "plugins" / "ugsci" / "fixtures" / "nulls_and_duplicates.las"
    dataset = LasReader().read(str(fixture), "nullable", bin_dir)
    raw = (bin_dir / dataset["files"]["scalars"]["gr"]).read_bytes()
    values = struct.unpack(f"<{len(raw) // 4}f", raw)
    assert values[0] == 85
    assert math.isnan(values[1]) and math.isnan(values[6])
    assert dataset["properties"]["gr"]["association"] == "point"
    (bin_dir / "manifest.json").write_text(json.dumps({"version": 1, "datasets": [dataset]}), encoding="utf-8")
    app = FastAPI()
    app.include_router(build_router(tmp_path), prefix="/api")
    client = TestClient(app)
    manifest = client.get("/api/manifest").json()
    resource = next(item for item in manifest["datasets"][0]["resources"] if item.get("propertyName") == "gr")
    assert resource["shape"] == [9]
    assert resource["association"] == "point"
    details = client.get("/api/datasets/las_nullable/cells/8")
    assert details.status_code == 200
    assert details.json()["properties"]["gr"] == 78
    exported = client.get("/api/datasets/las_nullable/export?format=csv")
    assert len(exported.text.splitlines()) == 10
    assert exported.text.splitlines()[0].startswith("point_id,")
    assert exported.text.splitlines()[-1].startswith("8,78.0,")


def test_cmg_horizontal_completion_path_has_increasing_geometric_md(tmp_path):
    from ugsci_visualization_test_plugin.backend.readers.cmg_wells import convert_cmg_wells

    def corners(cell):
        return tuple((10.0 * cell + x, y, 100.0 + z) for x, y, z in (
            (0, 0, 0), (1, 0, 0), (1, 1, 0), (0, 1, 0),
            (0, 0, 1), (1, 0, 1), (1, 1, 1), (0, 1, 1),
        ))

    datasets = convert_cmg_wells(
        {"H1": {"completions": [[1, 1, 1], [2, 1, 1]]}}, "horizontal", tmp_path,
        ncol=2, nrow=1, nlay=1, corner_points=corners,
    )
    raw = (tmp_path / datasets[0]["files"]["scalars"]["md"]).read_bytes()
    assert struct.unpack("<2f", raw) == (0.0, 10.0)


@pytest.mark.parametrize("builtin", [True, False])
def test_las_feet_are_normalized_to_metres_with_source_units_preserved(tmp_path, monkeypatch, builtin):
    from ugsci_visualization_test_plugin.backend.readers.las import LasReader

    if builtin:
        monkeypatch.setitem(sys.modules, "lasio", None)
    source = tmp_path / "feet.las"
    source.write_text("\n".join([
        "~Version Information", "VERS. 2.0 :", "WRAP. NO :",
        "~Well Information", "STRT.FT 100 :", "STOP.FT 200 :", "STEP.FT 100 :",
        "NULL. -999.25 :", "WELL. Feet Example :", "XWELL.FT 1000 :", "YWELL.M 500 :",
        "~Curve Information", "DEPT.FT :", "GR.API :", "~A", "100 20", "200 30", "",
    ]), encoding="utf-8")
    dataset = LasReader().read(str(source), "feet", tmp_path)
    raw = (tmp_path / dataset["files"]["positions"]).read_bytes()
    positions = struct.unpack("<6f", raw)
    assert positions == pytest.approx([304.8, 500, -30.48, 304.8, 500, -60.96])
    metadata = dataset["metadata"]
    assert metadata["coordinate_system"]["length_unit"] == "m"
    assert metadata["source_depth_unit"] == "FT"
    assert metadata["source_depth_range"] == [100, 200]
    assert metadata["depth_range"] == pytest.approx([30.48, 60.96])
    assert metadata["placement"] == "spatial"
    assert dataset["properties"]["gr"]["unit"] == "API"


def test_las_unknown_length_units_are_not_labelled_metres_or_placed_spatially(tmp_path):
    from ugsci_visualization_test_plugin.backend.readers.las import LasReader

    dataset = LasReader._build_dataset(
        "unknown", tmp_path, [10, 20], [("GR", [20, 30])], "unknown", "test",
        1000, 2000, depth_unit="", x_unit="M", y_unit="M",
    )
    assert dataset["metadata"]["coordinate_system"]["length_unit"] is None
    assert dataset["metadata"]["depth_unit"] is None
    assert dataset["metadata"]["placement"] == "depth-only"
    assert dataset["metadata"]["source_xy"] == [1000, 2000]
    raw = (tmp_path / dataset["files"]["positions"]).read_bytes()
    assert struct.unpack("<6f", raw) == (0, 0, -10, 0, 0, -20)
