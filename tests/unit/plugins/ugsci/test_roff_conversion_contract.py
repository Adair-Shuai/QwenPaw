# -*- coding: utf-8 -*-
"""Real ROFF files retain physical measurements through conversion and HTTP."""

import hashlib
import json
import math
import struct

import numpy as np
import pytest
import xtgeo
from fastapi import FastAPI
from fastapi.testclient import TestClient

from plugins.bundle.ugsci.visualization.backend import simulation
from plugins.bundle.ugsci.visualization.backend.api import build_router
from plugins.bundle.ugsci.visualization.backend.formats import convert_source


def _grid_file(tmp_path):
    grid = xtgeo.create_box_grid((3, 1, 1))
    active = grid.get_actnum()
    active.values = np.array([1, 0, 1]).reshape((3, 1, 1), order="F")
    grid.set_actnum(active)
    path = tmp_path / "grid.roff"
    grid.to_file(path)
    return grid, path


@pytest.mark.parametrize("missing", ["nan", "mask", "all_missing"])
def test_real_roff_missing_values_remain_unknown_without_invented_properties(
    tmp_path,
    monkeypatch,
    missing,
):
    grid, source = _grid_file(tmp_path)
    values = np.array([0.2, 0.4, np.nan]).reshape((3, 1, 1), order="F")
    if missing == "mask":
        values = np.ma.array(values, mask=[[[False]], [[False]], [[True]]])
    elif missing == "all_missing":
        values = np.ma.masked_all((3, 1, 1))
    property_path = tmp_path / "porosity.roff"
    xtgeo.GridProperty(grid, name="PORO", values=values).to_file(property_path)
    before = [
        hashlib.sha256(path.read_bytes()).hexdigest()
        for path in (source, property_path)
    ]
    output = tmp_path / "data" / "bin"
    output.mkdir(parents=True)
    dataset = convert_source(
        source,
        "real_roff",
        output,
        options={"property_path": str(property_path)},
    )
    assert dataset["n_cells"] == 2
    assert dataset["grid_dims"] == [3, 1, 1]
    assert set(dataset["files"]["scalars"]) == {"porosity"}
    assert dataset["properties"]["porosity"] == {
        "label": "porosity",
        "association": "cell",
        "count": 2,
        "unit": None,
        "no_data": "nan",
    }
    samples = struct.unpack(
        "<2f",
        (output / dataset["files"]["scalars"]["porosity"]).read_bytes(),
    )
    assert math.isnan(samples[1])
    assert (
        math.isnan(samples[0])
        if missing == "all_missing"
        else samples[0] == pytest.approx(0.2)
    )
    assert struct.unpack(
        "<2I",
        (output / dataset["files"]["cell_ids"]).read_bytes(),
    ) == (0, 2)
    assert not list(output.glob("*permeability*"))
    assert not list(output.glob("*facies*"))
    assert [
        hashlib.sha256(path.read_bytes()).hexdigest()
        for path in (source, property_path)
    ] == before
    (output / "manifest.json").write_text(
        json.dumps({"datasets": [dataset]}),
        encoding="utf-8",
    )
    monkeypatch.setattr(
        simulation,
        "runtime_directory",
        lambda: tmp_path / "isolated-runtime",
    )
    app = FastAPI()
    app.include_router(build_router(tmp_path), prefix="/api")
    with TestClient(app) as client:
        stats = client.get("/api/datasets/real_roff/stats?property=porosity")
        if missing == "all_missing":
            assert stats.status_code == 422
            assert "no finite values" in stats.json()["detail"]
        else:
            assert stats.status_code == 200
            assert stats.json()["count"] == 1
            assert stats.json()["missing_count"] == 1
            assert stats.json()["min"] == pytest.approx(0.2)
        details = client.get("/api/datasets/real_roff/cells/2")
        assert details.status_code == 200
        assert details.json()["ijk"] == [3, 1, 1]
        assert details.json()["properties"]["porosity"] is None
        assert (
            client.get(
                "/api/datasets/real_roff/stats?property=permeability",
            ).status_code
            == 404
        )


@pytest.mark.parametrize("dimensions", [(1, 3, 1), (2, 1, 1)])
def test_real_roff_rejects_property_grid_dimension_mismatch(
    tmp_path,
    dimensions,
):
    _, source = _grid_file(tmp_path)
    property_path = tmp_path / "wrong.roff"
    xtgeo.GridProperty(
        ncol=dimensions[0],
        nrow=dimensions[1],
        nlay=dimensions[2],
        name="PORO",
        values=0.2,
    ).to_file(property_path)
    output = tmp_path / "binary"
    output.mkdir()
    with pytest.raises(ValueError, match="dimensions do not match"):
        convert_source(
            source,
            "wrong",
            output,
            options={"property_path": str(property_path)},
        )
