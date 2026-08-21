# -*- coding: utf-8 -*-
from __future__ import annotations

import importlib.util
import struct
import sys
from pathlib import Path

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
