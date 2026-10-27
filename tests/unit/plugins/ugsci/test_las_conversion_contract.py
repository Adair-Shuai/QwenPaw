# -*- coding: utf-8 -*-
"""Actual LAS files retain their coordinate and binary conversion contract."""

import importlib
import math
import struct
import sys

import pytest


pytestmark = pytest.mark.parametrize(
    "namespace",
    [
        "plugins.bundle.ugsci.visualization.backend.readers.las",
        "qwenpaw.plugins_bundle.ugsci.visualization.backend.readers.las",
    ],
)


def read_numbers(path, code):
    return [
        item[0] for item in struct.iter_unpack("<" + code, path.read_bytes())
    ]


@pytest.mark.parametrize("depth_name", ["DEPT", "DEPTH", "MD"])
@pytest.mark.parametrize("wrapped", [False, True])
@pytest.mark.parametrize("xy", [None, (0, 0), (120, 80), ("nan", "nan")])
def test_las_file_preserves_depth_curves_nulls_and_placement(
    namespace,
    tmp_path,
    monkeypatch,
    depth_name,
    wrapped,
    xy,
):
    monkeypatch.setitem(sys.modules, "lasio", None)
    module = importlib.import_module(namespace)
    coordinates = (
        f"XWELL.M {xy[0]}\nYWELL.M {xy[1]}\n" if xy is not None else ""
    )
    data = ("\n" if wrapped else " ").join(
        ["12.5", "100", "-9999", "13", "101", "2.5"],
    )
    source = tmp_path / "well.las"
    source.write_text(
        "~Version\nVERS. 2.0\n"
        + ("WRAP. YES\n" if wrapped else "WRAP. NO\n")
        + "~Well\nNULL. invalid\nNULL. -9999\n"
        + "WELL.M Synthetic well\nWELL. \n"
        + coordinates
        + "~Curve\n# retained comment\nBROKEN HEADER\nGR.API\n"
        + f"{depth_name}.M\nRT.OHM\n"
        + "~Parameter\nIGNORED. value\n~Ascii\n"
        + data
        + "\n",
        encoding="utf-8",
    )
    output = tmp_path / "output"
    output.mkdir()
    manifest = module.LasReader().read(str(source), "contract", output)
    assert manifest["source"] == "las"
    assert manifest["n_vertices"] == 2
    assert manifest["n_cells"] == 1
    assert manifest["n_indices"] == 2
    metadata = manifest["metadata"]
    assert metadata["reader"] == "builtin-las"
    assert metadata["well_name"] == "Synthetic well"
    assert metadata["depth_range"] == [100.0, 101.0]
    assert metadata["n_curves"] == 2
    spatial = xy == (120, 80)
    assert metadata["spatial"] is spatial
    x_value, y_value = (120.0, 80.0) if spatial else (0.0, 0.0)
    files = manifest["files"]
    assert read_numbers(output / files["positions"], "f") == [
        x_value,
        y_value,
        -100.0,
        x_value,
        y_value,
        -101.0,
    ]
    assert read_numbers(output / files["indices"], "I") == [0, 1]
    assert read_numbers(output / files["cell_ids"], "I") == [0]
    assert set(files["scalars"]) == {"gr", "rt"}
    assert read_numbers(output / files["scalars"]["gr"], "f") == [12.5, 13.0]
    resistance = read_numbers(output / files["scalars"]["rt"], "f")
    assert math.isnan(resistance[0])
    assert resistance[1] == 2.5
    assert manifest["properties"]["rt"]["association"] == "point"


@pytest.mark.parametrize(
    ("text", "message"),
    [
        ("~Ascii\n100 1\n", "LAS file has no ~Curve section"),
        (
            "~Curve\nDEPT.M\nGR.API\n~Ascii\n",
            "LAS data section is not a multiple of 2 curve columns",
        ),
        (
            "~Curve\nDEPT.M\nGR.API\n~Ascii\n100 1 101\n",
            "LAS data section is not a multiple of 2 curve columns",
        ),
        (
            "~Curve\nDEPT.M\nGR.API\n~Ascii\n100 broken\n",
            "Non-numeric LAS data token: broken",
        ),
    ],
)
def test_las_file_retains_invalid_input_errors(
    namespace,
    tmp_path,
    monkeypatch,
    text,
    message,
):
    monkeypatch.setitem(sys.modules, "lasio", None)
    module = importlib.import_module(namespace)
    source = tmp_path / "invalid.las"
    source.write_text(text, encoding="utf-8")
    output = tmp_path / "output"
    output.mkdir()
    with pytest.raises(ValueError) as error:
        module.LasReader().read(str(source), "invalid", output)
    assert str(error.value) == message
    assert not list(output.iterdir())
