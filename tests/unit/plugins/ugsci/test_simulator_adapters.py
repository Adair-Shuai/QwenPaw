# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import os
import time
from types import SimpleNamespace
import zipfile

import pytest

from plugins.bundle.ugsci.engine.adapters import (
    CMGAdapter,
    COMSOLAdapter,
    EclipseAdapter,
    IntersectAdapter,
    TNavigatorAdapter,
    inspect_mph_metadata,
    list_supported_simulators,
)
from plugins.bundle.ugsci.engine.tools.autotune import diagnose_terminal_job


def test_registry_contains_all_managed_simulators() -> None:
    assert list_supported_simulators() == [
        "cmg_gem",
        "cmg_imex",
        "cmg_stars",
        "comsol",
        "eclipse",
        "intersect",
        "tnavigator",
    ]


def test_cmg_selects_module_specific_executable() -> None:
    engine = SimpleNamespace(
        executable_path="C:/cmg/IMEX/mx.exe",
        module_paths={
            "IMEX": "C:/cmg/IMEX/mx.exe",
            "STARS": "C:/cmg/STARS/st.exe",
            "GEM": "C:/cmg/GEM/gm.exe",
        },
    )
    assert CMGAdapter("stars").resolve_executable(engine).endswith("st.exe")
    assert CMGAdapter("gem").resolve_executable(engine).endswith("gm.exe")


def test_intersect_and_tnavigator_commands_preserve_case_contract() -> None:
    assert IntersectAdapter().build_command("ix.exe", "C:/run/CASE.DATA") == [
        "ix.exe",
        "C:/run/CASE",
    ]
    assert TNavigatorAdapter().build_command(
        "tnav.exe",
        "C:/run/CASE.DATA",
    ) == [
        "tnav.exe",
        "C:/run/CASE.DATA",
    ]


def test_comsol_command_distinguishes_batch_executables() -> None:
    adapter = COMSOLAdapter()
    assert (
        adapter.build_command("comsol.exe", "C:/run/model.mph")[1] == "batch"
    )
    assert (
        adapter.build_command("comsolbatch.exe", "C:/run/model.mph")[1]
        == "-inputfile"
    )


def test_comsol_csv_result_reader(tmp_path) -> None:
    result = tmp_path / "model.csv"
    result.write_text("TIME,TEMP,POINT:A\n0,10,1\n1,12,2\n", encoding="utf-8")
    summary = COMSOLAdapter().read_summary(tmp_path)
    assert summary.vectors["TEMP"] == [(0.0, 10.0), (1.0, 12.0)]
    assert summary.well_vectors["POINT:A"] == [(0.0, 1.0), (1.0, 2.0)]


def test_comsol_spatial_export_uses_parenthesis_aware_header(tmp_path) -> None:
    result = tmp_path / "model_field.csv"
    result.write_text(
        "% Model,model.mph\n"
        "% Version,COMSOL 6.1.0.252\n"
        "% Length unit,m\n"
        "% X,Y,sw1.int1(x, y) (m^2),sw1.int2(x, y) (m^2)\n"
        "0,0,1,2\n"
        "1,0,3,4\n",
        encoding="utf-8",
    )
    (tmp_path / "unrelated.csv").write_text(
        "TIME,BAD\n0,99\n",
        encoding="utf-8",
    )

    summary = COMSOLAdapter().read_summary(tmp_path, case_stem="model")

    assert not summary.vectors
    assert len(summary.fields) == 1
    table = summary.fields[0]
    assert table.kind == "spatial_point_cloud"
    assert table.coordinates == ("X", "Y")
    assert table.variables == (
        "sw1.int1(x, y) (m^2)",
        "sw1.int2(x, y) (m^2)",
    )
    assert table.column_count == 4
    assert table.metadata["variable_units"] == ["m^2", "m^2"]


def test_comsol_headerless_matrix_requires_explicit_schema(tmp_path) -> None:
    result = tmp_path / "model_values.csv"
    result.write_text("0,0,1,2\n0,1,3,4\n", encoding="utf-8")

    summary = COMSOLAdapter().read_summary(tmp_path, case_stem="model")

    assert not summary.vectors
    table = summary.fields[0]
    assert table.kind == "headerless_table"
    assert table.variables == ()
    assert table.row_count == 2
    assert "schema_required" in table.metadata["warnings"][0]


def test_comsol_parser_is_not_tied_to_comma_delimited_fixture(
    tmp_path,
) -> None:
    result = tmp_path / "generic_field.csv"
    result.write_text(
        "% X;Y;physics.operator(x, y) (K)\n" + "0;0;273.15\n" + "1;0;274.15\n",
        encoding="utf-8",
    )

    summary = COMSOLAdapter().read_summary(tmp_path, case_stem="generic")

    table = summary.fields[0]
    assert table.variables == ("physics.operator(x, y) (K)",)
    assert table.row_count == 2
    assert table.metadata["delimiter"] == ";"


def test_comsol_case_binding_does_not_scan_unrelated_csv(tmp_path) -> None:
    (tmp_path / "other.csv").write_text("TIME,TEMP\n0,99\n", encoding="utf-8")
    summary = COMSOLAdapter().read_summary(tmp_path, case_stem="model")
    assert not summary.vectors
    assert not summary.fields


def test_comsol_uses_mph_declared_export_without_filename_convention(
    tmp_path,
) -> None:
    mph = tmp_path / "model.mph"
    with zipfile.ZipFile(mph, "w") as archive:
        archive.writestr("modelinfo.xml", '<modelInfo nodeType="solved"/>')
        archive.writestr(
            "dmodel.xml",
            '<model><Results><ExportFeature op="Data">'
            '<propertyValue name="p:lastwrittenfile" '
            'value="arbitrary-export-42.csv"/>'
            "</ExportFeature></Results></model>",
        )
    (tmp_path / "arbitrary-export-42.csv").write_text(
        "TIME,TEMP\n0,10\n1,12\n",
        encoding="utf-8",
    )
    (tmp_path / "unrelated.csv").write_text(
        "TIME,BAD\n0,99\n",
        encoding="utf-8",
    )

    summary = COMSOLAdapter().read_summary(tmp_path, case_stem="model")

    assert summary.vectors["TEMP"] == [(0.0, 10.0), (1.0, 12.0)]
    assert "BAD" not in summary.vectors
    assert (
        summary.metadata["exports"][0]["source_file"]
        == "arbitrary-export-42.csv"
    )


def test_comsol_mph_metadata_is_bounded_and_redacts_absolute_paths(
    tmp_path,
) -> None:
    mph = tmp_path / "model_result.mph"
    model_info = (
        '<modelInfo comsolVersion="6.1.0.252" modelType="MODEL" '
        'nodeType="solved" isRunnable="false" locale="zh_CN" '
        'lastComputationTime="33389.692 s">'
        '<historyInfo createdIn="COMSOL 6.1" createdDate="1" '
        'lastModifiedDate="2" author="private"/>'
        '<licenseInfo products="CFD|POROUSMEDIAFLOW##SUBSURFACEFLOW"/>'
        '<physicsInfo physics="Darcy##Transport"/>'
        '<geometryInfo><geom tag="geom1" dimension="2"/></geometryInfo>'
        "</modelInfo>"
    )
    dmodel = (
        '<model><StudyFeature op="FunctionSweep">'
        '<propertyValue name="p:filename" '
        'value="C:\\Users\\private\\secret\\k_1.txt"/>'
        '</StudyFeature><Results><ExportFeature op="Data">'
        '<propertyValue name="p:coordfilename" '
        'value="C:\\Users\\private\\secret\\location1.txt"/>'
        "</ExportFeature></Results></model>"
    )
    with zipfile.ZipFile(mph, "w") as archive:
        archive.writestr("fileversion", "1745:COMSOL 6.1.0.252")
        archive.writestr("modelinfo.xml", model_info)
        archive.writestr("dmodel.xml", dmodel)
        archive.writestr("savepoint1/model.zip", b"one")
        archive.writestr("savepoint1/preview.png", b"two")

    metadata = inspect_mph_metadata(mph, deep=True)
    rendered = json.dumps(metadata, allow_nan=False)
    assert metadata["node_type"] == "solved"
    assert metadata["timing"]["last_seconds"] == pytest.approx(33389.692)
    assert metadata["external_references"][0]["basename"] == "k_1.txt"
    assert metadata["container"]["savepoint_count"] == 1
    assert metadata["container"]["is_solved"] is True
    assert any(
        item["role"] == "export_input" and item["basename"] == "location1.txt"
        for item in metadata["external_references"]
    )
    assert "Users" not in rendered
    assert "private" not in rendered

    preflight = COMSOLAdapter().inspect_input(mph)
    assert preflight["warnings"] == [
        "unresolved external COMSOL input: k_1.txt",
    ]


def test_comsol_result_mph_is_only_terminal_evidence_when_fresh(
    tmp_path,
) -> None:
    mph = tmp_path / "model_result.mph"
    with zipfile.ZipFile(mph, "w") as archive:
        archive.writestr("modelinfo.xml", '<modelInfo nodeType="solved"/>')
    adapter = COMSOLAdapter()
    now = time.time()
    assert (
        adapter.infer_terminal_status(
            tmp_path,
            start_ts=now - 1,
            case_stem="model",
        )[0]
        == "completed"
    )
    os.utime(mph, (now - 100, now - 100))
    assert (
        adapter.infer_terminal_status(
            tmp_path,
            start_ts=now,
            case_stem="model",
        )[0]
        is None
    )


def test_adapter_completion_markers_are_not_generic_substrings(
    tmp_path,
) -> None:
    log = tmp_path / "case.out"
    log.write_text("STOP REQUEST RECEIVED\nTIME = 2 DAYS\n", encoding="utf-8")
    assert CMGAdapter().parse_progress(tmp_path).status == "running"
    log.write_text("NORMAL TERMINATION\n", encoding="utf-8")
    assert CMGAdapter().parse_progress(tmp_path).status == "completed"


def test_cmg_parses_real_imex_timestep_summary_shape(tmp_path) -> None:
    log = tmp_path / "case.log"
    log.write_text(
        "  9025w .500 1 0 17081 2025:10:07 22.4 19.4 66.3\n"
        "21 Warning messages. 0 Error messages.\n"
        "End of Simulation: Normal Termination\n",
        encoding="utf-8",
    )
    progress = CMGAdapter().parse_progress(tmp_path)
    assert progress.status == "completed"
    assert progress.current_step == 9025
    assert progress.current_time == "17081 days (2025:10:07)"
    assert progress.time_step_size == ".500 days"


def test_cmg_reads_native_sr3_hdf5_time_series(tmp_path) -> None:
    h5py = pytest.importorskip("h5py")
    numpy = pytest.importorskip("numpy")
    sr3 = tmp_path / "case.sr3"
    with h5py.File(sr3, "w") as handle:
        general = handle.create_group("General")
        master_dtype = numpy.dtype(
            [("Index", "<u4"), ("Offset in days", "<f8"), ("Date", "<f8")],
        )
        general.create_dataset(
            "MasterTimeTable",
            data=numpy.array(
                [(0, 0.0, 20200101.0), (1, 1.0, 20200102.0)],
                dtype=master_dtype,
            ),
        )
        time_series = handle.create_group("TimeSeries")
        groups = time_series.create_group("GROUPS")
        groups.create_dataset(
            "Variables",
            data=numpy.array([b"OILRATSC", b"OILVOLSC"]),
        )
        groups.create_dataset(
            "Origins",
            data=numpy.array([b"Default-Field-PRO"]),
        )
        groups.create_dataset(
            "Timesteps",
            data=numpy.array([0, 1], dtype="<u4"),
        )
        groups.create_dataset(
            "Data",
            data=numpy.array([[[10.0], [100.0]], [[12.0], [112.0]]]),
        )
        wells = time_series.create_group("WELLS")
        wells.create_dataset("Variables", data=numpy.array([b"BHP"]))
        wells.create_dataset("Origins", data=numpy.array([b"W1"]))
        wells.create_dataset(
            "Timesteps",
            data=numpy.array([0, 1], dtype="<u4"),
        )
        wells.create_dataset("Data", data=numpy.array([[[200.0]], [[190.0]]]))

    summary = CMGAdapter().read_summary(tmp_path, wells=["W1"])
    assert summary.vectors["FOPR"] == [(0.0, 10.0), (1.0, 12.0)]
    assert summary.vectors["FOPT"] == [(0.0, 100.0), (1.0, 112.0)]
    assert summary.well_vectors["WBHP:W1"] == [(0.0, 200.0), (1.0, 190.0)]


def test_case_bound_result_lookup_never_falls_back_to_another_case(
    tmp_path,
) -> None:
    (tmp_path / "case_a.sr3").write_bytes(b"not-needed")
    (tmp_path / "case_a.RSM").write_text("not-needed", encoding="utf-8")

    assert (
        CMGAdapter().find_summary_file(tmp_path, case_stem="case_a").name
        == "case_a.sr3"
    )
    assert CMGAdapter().find_summary_file(tmp_path, case_stem="case_b") is None
    assert (
        EclipseAdapter().find_summary_file(tmp_path, case_stem="case_a").name
        == "case_a.RSM"
    )
    assert (
        EclipseAdapter().find_summary_file(tmp_path, case_stem="case_b")
        is None
    )


def test_autotune_is_capability_driven() -> None:
    eclipse_job = SimpleNamespace(
        job_id="e",
        simulator="eclipse",
        status="failed",
        error="Newton convergence failed",
        working_dir="",
        deck_file="",
        extra={},
    )
    cmg_job = SimpleNamespace(
        job_id="c",
        simulator="cmg_imex",
        status="failed",
        error="Newton convergence failed",
        working_dir="",
        deck_file="",
        extra={},
    )
    assert (
        diagnose_terminal_job(eclipse_job)["safe_to_generate_candidate"]
        is True
    )
    assert (
        diagnose_terminal_job(cmg_job)["safe_to_generate_candidate"] is False
    )
