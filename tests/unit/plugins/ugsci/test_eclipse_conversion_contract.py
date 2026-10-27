# -*- coding: utf-8 -*-
"""Public Eclipse conversion retains companion and binary output contracts."""

import importlib
import math
import struct
import sys
from pathlib import Path
from types import SimpleNamespace

import numpy as np
import pytest
import resfo


pytestmark = pytest.mark.parametrize(
    "namespace",
    [
        "plugins.bundle.ugsci.visualization.backend.readers.eclipse",
        "qwenpaw.plugins_bundle.ugsci.visualization.backend.readers.eclipse",
    ],
)


def numbers(path, code):
    return [
        item[0] for item in struct.iter_unpack("<" + code, path.read_bytes())
    ]


def xtgeo_boundary(active, discovery):
    """Provide dependency arrays for the real converter and binary writers."""
    calls = []

    def prop(values):
        return SimpleNamespace(
            values=np.asarray(values).reshape((2, 2, 1), order="F"),
        )

    corners = [
        prop(
            [
                cell * 10 + corner % 2
                if axis == 0
                else corner // 2 % 2
                if axis == 1
                else 100 + corner // 4
                for cell in range(4)
            ],
        )
        for corner in range(8)
        for axis in range(3)
    ]
    boundary_grid = SimpleNamespace(
        dimensions=(2, 2, 1),
        get_actnum=lambda: prop([1, 0, 1, 0] if active else [0] * 4),
        get_xyz_corners=lambda: corners,
    )

    def load_grid(path, *, fformat):
        calls.append(("grid", Path(path).name, fformat))
        return boundary_grid

    def load_property(path, *, fformat, name, date=None, grid):
        assert grid is boundary_grid
        calls.append(("property", Path(path).name, fformat, name, date))
        if name == "PORO":
            return prop([0.125, 999, float("nan"), 999])
        if name == "PERMX":
            return prop([float("inf"), 999, -3, 999])
        if name == "PRESSURE":
            return prop([10 + date, 999, float("nan"), 999])
        raise KeyError(name)

    def list_properties(path, *, fformat):
        calls.append(("steps", Path(path).name, fformat))
        if discovery == "discovery-error":
            raise ValueError("unavailable step catalog")
        return [
            (step, step)
            for step in (
                [] if discovery == "empty" else [10, 20, 30, 40, 50, 60]
            )
        ]

    return (
        SimpleNamespace(
            grid_from_file=load_grid,
            gridproperty_from_file=load_property,
            GridProperties=SimpleNamespace(
                scan_dates=lambda path: list_properties(path, fformat="unrst"),
            ),
        ),
        calls,
    )


def write_companion(path):
    """Use complete binary records so the real record parser stays \
exercised."""
    if path.suffix.lower() == ".init":
        records = [
            (
                "PORO    ",
                np.array([0.125, 999, np.nan, 999], dtype=np.float32),
            ),
            ("PERMX   ", np.array([np.inf, 999, -3, 999], dtype=np.float32)),
        ]
    else:
        records = []
        for step in [10, 20, 30, 40, 50, 60]:
            records.extend(
                [
                    ("SEQNUM  ", np.array([step], dtype=np.int32)),
                    (
                        "PRESSURE",
                        np.array(
                            [10 + step, 999, np.nan, 999],
                            dtype=np.float32,
                        ),
                    ),
                ],
            )
    resfo.write(path, records)


def companions(source, mode):
    sibling_init = source.with_name("case.iNiT")
    sibling_unrst = source.with_name("cAsE.UNRST")
    for path in (sibling_init, sibling_unrst):
        write_companion(path)
    options = {}
    if mode == "override":
        init = source.with_name("uploaded-property.INIT")
        unrst = source.with_name("uploaded-property.UNRST")
        write_companion(init)
        write_companion(unrst)
        options = {"init_path": str(init), "unrst_path": unrst}
    elif mode == "missing":
        init = source.with_name("absent.INIT")
        unrst = source.with_name("absent.UNRST")
        options = {"init_path": init, "unrst_path": str(unrst)}
    else:
        init, unrst = sibling_init, sibling_unrst
        if mode == "falsey":
            options = {"init_path": None, "unrst_path": ""}
    return options, init, unrst


def assert_geometry(output, manifest, active):
    cells = [0, 2] if active else []
    assert manifest["grid_dims"] == [2, 2, 1]
    assert manifest["n_cells"] == len(cells)
    assert manifest["n_vertices"] == 14 * len(cells)
    assert manifest["n_indices"] == 72 * len(cells)
    files = manifest["files"]
    assert numbers(output / files["cell_ids"], "I") == cells
    positions = numbers(output / files["positions"], "f")
    assert len(positions) == manifest["n_vertices"] * 3
    indices = numbers(output / files["indices"], "I")
    assert len(indices) == manifest["n_indices"]
    assert all(value < manifest["n_vertices"] for value in indices)
    for offset, cell in enumerate(cells):
        expected = [
            value
            for corner in (0, 1, 3, 2, 4, 5, 7, 6)
            for value in (
                cell * 10 + corner % 2,
                corner // 2 % 2,
                -(100 + corner // 4),
            )
        ]
        assert positions[offset * 42 : offset * 42 + 24] == expected


@pytest.mark.parametrize("mode", ["siblings", "override", "missing", "falsey"])
@pytest.mark.parametrize(
    "step_mode",
    ["manifest-only", "range", "discovery-error", "empty"],
)
@pytest.mark.parametrize("active", [False, True])
def test_eclipse_reader_preserves_companions_geometry_and_properties(
    namespace,
    tmp_path,
    monkeypatch,
    mode,
    step_mode,
    active,
):
    module = importlib.import_module(namespace)
    boundary, calls = xtgeo_boundary(active, step_mode)
    monkeypatch.setitem(sys.modules, "xtgeo", boundary)
    source = tmp_path / "CASE.EGRID"
    source.write_bytes(b"synthetic xtgeo grid boundary")
    options, init, unrst = companions(source, mode)
    options.update(properties=["PRESSURE", "MISSING"], timeSteps=step_mode)
    output = tmp_path / "output"
    output.mkdir()
    if step_mode == "discovery-error" and unrst.exists():
        with pytest.raises(ValueError, match="unavailable step catalog"):
            module.EclipseReader().read(
                str(source),
                "contract",
                output,
                options,
            )
        assert calls[0] == ("grid", "CASE.EGRID", "egrid")
        assert ("steps", unrst.name, "unrst") in calls
        assert not [
            item
            for item in calls
            if item[0] == "property" and item[1] == unrst.name
        ]
        assert not list(output.glob("*_ts*.f32"))
        return
    manifest = module.EclipseReader().read(
        str(source),
        "contract",
        output,
        options,
    )
    assert_geometry(output, manifest, active)
    assert calls[0] == ("grid", "CASE.EGRID", "egrid")
    assert manifest["metadata"]["has_init"] == init.exists()
    assert manifest["metadata"]["has_unrst"] == unrst.exists()
    static = manifest["files"]["scalars"]
    assert set(static) == ({"poro", "permx"} if init.exists() else set())
    if static:
        porosity = numbers(output / static["poro"], "f")
        permeability = numbers(output / static["permx"], "f")
        if active:
            assert porosity[0] == 0.125 and math.isnan(porosity[1])
            assert math.isnan(permeability[0]) and permeability[1] == -3
        else:
            assert porosity == [] and permeability == []
    expected_steps = (
        {
            "manifest-only": [10, 20, 30, 40, 50, 60],
            "range": [10, 20, 30, 40, 50, 60],
            "discovery-error": [0],
            "empty": [],
        }[step_mode]
        if unrst.exists()
        else []
    )
    steps = manifest["time_steps"]
    assert [step["step_number"] for step in steps] == expected_steps
    assert manifest["metadata"]["n_time_steps"] == len(expected_steps)
    for index, step in enumerate(steps):
        assert step["index"] == index
        assert set(step["scalars"]) == {"pressure"}
        values = numbers(output / step["scalars"]["pressure"], "f")
        if active:
            assert values[0] == 10 + expected_steps[index]
            assert math.isnan(values[1])
        else:
            assert values == []
    property_paths = {call[1] for call in calls if call[0] == "property"}
    assert property_paths == (
        ({init.name} if init.exists() else set())
        | ({unrst.name} if expected_steps else set())
    )
