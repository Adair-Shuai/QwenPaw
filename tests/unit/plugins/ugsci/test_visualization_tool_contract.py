# -*- coding: utf-8 -*-
"""Viewer tools keep real queue, binary-report and HTTP dispatch behavior."""

import asyncio
import importlib
import json
import struct
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import pytest


@pytest.fixture(
    name="viewer_tools",
    params=["plugins.bundle", "qwenpaw.plugins_bundle"],
)
def load_viewer_tools(request, tmp_path, monkeypatch):
    tools = importlib.import_module(
        request.param + ".ugsci.visualization.backend.tools",
    )
    monkeypatch.setattr(tools, "_plugin_dir", None)
    monkeypatch.setattr(tools, "command_bus", tools.ViewerCommandBus())
    tools.configure_tools(tmp_path)
    binary = tmp_path / "data" / "bin"
    binary.mkdir(parents=True)
    (binary / "pressure.f32").write_bytes(
        struct.pack("<6f", 0, 10, 20, float("nan"), float("inf"), -10),
    )
    (binary / "facies.u32").write_bytes(struct.pack("<3I", 0, 2, 4))
    (binary / "empty.f32").write_bytes(b"")
    (binary / "bad.f32").write_bytes(b"bad")
    (binary / "manifest.json").write_text(
        json.dumps(
            {
                "datasets": [
                    {
                        "id": "grid",
                        "name": "真实网格",
                        "files": {
                            "scalars": {
                                "pressure": "pressure.f32",
                                "facies": "facies.u32",
                                "empty": "empty.f32",
                                "bad": "bad.f32",
                            },
                        },
                    },
                ],
            },
        ),
        encoding="utf-8",
    )
    return tools


@pytest.fixture(name="http_backend")
def run_http_backend():
    calls = []

    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            body = json.loads(
                self.rfile.read(int(self.headers["Content-Length"])),
            )
            calls.append((self.path, body))
            payload = json.dumps({"job_id": "actual-job", "body": body})
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(payload.encode())

        def log_message(self, _format, *_args):
            pass

    with ThreadingHTTPServer(("127.0.0.1", 0), Handler) as server:
        worker = threading.Thread(target=server.serve_forever, daemon=True)
        worker.start()
        try:
            yield f"http://127.0.0.1:{server.server_port}", calls
        finally:
            server.shutdown()
            worker.join(timeout=3)
            assert not worker.is_alive()


@pytest.mark.parametrize(
    "name,args,path,body,kind",
    [
        (
            "import_subsurface_dataset",
            {},
            "/imports",
            {"workspacePath": "", "name": ""},
            "oilgas.import-result",
        ),
        (
            "import_subsurface_dataset",
            {"file_path": "真实.EGRID", "name": "项目"},
            "/imports",
            {"workspacePath": "真实.EGRID", "name": "项目"},
            "oilgas.import-result",
        ),
        (
            "create_intersection",
            {
                "dataset_id": "grid",
                "polyline_x": [0, 1],
                "polyline_y": [2, 3],
            },
            "/datasets/grid/intersections",
            {
                "polyline_x": [0, 1],
                "polyline_y": [2, 3],
                "z_min": 0,
                "z_max": 5000,
                "name": "section",
            },
            "oilgas.intersection-result",
        ),
        (
            "create_well_section",
            {
                "dataset_id": "grid",
                "well_dataset_id": "well",
                "offset": 0,
                "name": "",
                "property": "pressure",
            },
            "/datasets/grid/well-sections",
            {
                "well_dataset_id": "well",
                "offset": 0,
                "name": "",
                "property": "pressure",
            },
            "oilgas.well-section-result",
        ),
        (
            "create_ijk_slice",
            {"dataset_id": "grid", "index": 1},
            "/datasets/grid/slices",
            {"axis": "k", "index": 1, "name": "slice", "property": ""},
            "oilgas.slice-result",
        ),
    ],
)
def test_dispatch_posts_original_paths_and_payloads(
    viewer_tools,
    http_backend,
    name,
    args,
    path,
    body,
    kind,
):
    base, calls = http_backend
    result = asyncio.run(viewer_tools.execute_tool(name, args, base))
    assert result["kind"] == kind
    assert calls == [(path, body)]
    if name == "import_subsurface_dataset":
        assert result == {"kind": kind, "job_id": "actual-job"}
    else:
        assert result["result"] == {"job_id": "actual-job", "body": body}
    assert viewer_tools.command_bus.pending_count() == 0


@pytest.mark.parametrize(
    "name,args,command,payload,extra",
    [
        (
            "open_oilgas_visualization",
            {},
            "open",
            {"datasetId": ""},
            {"datasetId": ""},
        ),
        (
            "set_visualization_property",
            {"property": "pressure", "dataset_id": "grid"},
            "set-property",
            {"property": "pressure", "datasetId": "grid"},
            {"property": "pressure"},
        ),
        (
            "set_visualization_timestep",
            {"time_step": 0},
            "set-timestep",
            {"timeStep": 0},
            {"timeStep": 0},
        ),
        (
            "focus_visualization_object",
            {"object_type": "cell", "object_id": "0"},
            "focus",
            {"objectType": "cell", "objectId": "0"},
            {"objectType": "cell", "objectId": "0"},
        ),
        ("capture_visualization", {}, "capture", {}, {}),
        ("run_visualization_benchmark", {}, "benchmark", {}, {}),
        (
            "filter_visualization",
            {
                "property": "pressure",
                "property_min": 0,
                "ijk_i": "1:2",
            },
            "set-filter",
            {
                "datasetId": "",
                "property": "pressure",
                "propertyMin": 0,
                "propertyMax": None,
                "i": "1:2",
                "j": "",
                "k": "",
                "bounds": None,
                "wellId": "",
                "radius": None,
            },
            {},
        ),
    ],
)
def test_dispatch_retains_queue_payload_and_acknowledgement(
    viewer_tools,
    name,
    args,
    command,
    payload,
    extra,
):
    result = asyncio.run(viewer_tools.execute_tool(name, args, ""))
    command_id = result["commandId"]
    assert result == {
        "kind": "oilgas.viewer-command",
        "commandId": command_id,
        "command": command,
        **extra,
    }
    repeated = asyncio.run(viewer_tools.execute_tool(name, args, ""))
    assert repeated == result
    first = viewer_tools.command_bus.drain("first")
    assert [(item.command_id, item.command, item.args) for item in first] == [
        (command_id, command, payload),
    ]
    assert viewer_tools.command_bus.drain("first") == []
    assert viewer_tools.command_bus.drain("second") == first
    assert viewer_tools.command_bus.acknowledge(
        command_id,
        result={"ok": True},
    )
    status = asyncio.run(
        viewer_tools.execute_tool(
            "get_visualization_command_status",
            {"command_id": command_id},
            "",
        ),
    )
    assert status["kind"] == "oilgas.viewer-command-status"
    assert status["command"] == command
    assert status["status"] == "completed"
    assert status["result"] == {"ok": True}
    assert status["ackedAt"] is not None


def test_dispatch_view_configuration_keeps_order_and_zero(viewer_tools):
    result = asyncio.run(
        viewer_tools.execute_tool(
            "configure_visualization_view",
            {
                "colormap": "turbo",
                "opacity": 0,
                "wireframe": False,
                "view": "wellbore",
            },
            "",
        ),
    )
    assert result["kind"] == "oilgas.viewer-commands"
    commands = viewer_tools.command_bus.drain()
    assert [(item.command, item.args) for item in commands] == [
        ("set-colormap", {"colormap": "turbo"}),
        ("set-opacity", {"opacity": 0.0}),
        ("set-wireframe", {"enabled": False}),
        ("set-view", {"view": "wellbore"}),
    ]
    assert [item["commandId"] for item in result["commands"]] == [
        item.command_id for item in commands
    ]
    # The public host binding must still accept the documented keyword.
    binding = next(
        item[1]
        for item in viewer_tools.get_tool_bindings()
        if item[0] == "set_visualization_property"
    )
    changed = asyncio.run(binding(property="facies", dataset_id="grid"))
    assert changed["args"] == {"property": "facies", "datasetId": "grid"}


@pytest.mark.parametrize(
    "property_name,expected",
    [
        (
            "",
            {
                "count": 4,
                "min": -10.0,
                "max": 20.0,
                "mean": 5.0,
                "p10": -10.0,
                "p50": 0.0,
                "p90": 10.0,
            },
        ),
        (
            "facies",
            {
                "count": 3,
                "min": 0.0,
                "max": 4.0,
                "mean": 2.0,
                "p10": 0.0,
                "p50": 2.0,
                "p90": 2.0,
            },
        ),
        (
            "empty",
            {
                "count": 0,
                "min": None,
                "max": None,
                "mean": None,
                "p10": None,
                "p50": None,
                "p90": None,
            },
        ),
        (
            "absent",
            {
                "count": 0,
                "min": None,
                "max": None,
                "mean": None,
                "p10": None,
                "p50": None,
                "p90": None,
            },
        ),
    ],
)
def test_reports_retain_finite_statistics_and_real_json(
    viewer_tools,
    tmp_path,
    property_name,
    expected,
):
    report = asyncio.run(
        viewer_tools.execute_tool(
            "generate_visualization_report",
            {"dataset_id": "grid", "property": property_name, "title": "分析"},
            "",
        ),
    )
    selected = property_name or "pressure"
    assert report == {
        "dataset_id": "grid",
        "dataset": "真实网格",
        "property": selected,
        "stats": expected,
        "title": "分析",
        "kind": "oilgas.analysis-report",
        "commandId": report["commandId"],
    }
    queued = viewer_tools.command_bus.drain()
    assert len(queued) == 1
    assert queued[0].command == "show-report"
    assert queued[0].args is report
    target = tmp_path / "真实报告.json"
    saved = asyncio.run(
        viewer_tools.execute_tool(
            "save_visualization_report",
            {
                "dataset_id": "grid",
                "property": property_name,
                "output_path": str(target),
                "title": "分析",
            },
            "",
        ),
    )
    assert saved == {
        "kind": "oilgas.report-file",
        "file_path": str(target),
        "dataset_id": "grid",
        "property": selected,
    }
    content = target.read_text(encoding="utf-8")
    disk = json.loads(content)
    assert disk == {
        key: value for key, value in report.items() if key != "commandId"
    }
    assert "真实网格" in content
    assert content.endswith("\n")
    refused = asyncio.run(
        viewer_tools.save_visualization_report(
            "grid",
            str(target),
            property=property_name,
        ),
    )
    assert refused == {
        "kind": "error",
        "error": f"File already exists: {target}",
    }
    assert target.read_text(encoding="utf-8") == content


@pytest.mark.parametrize(
    "name,args,error",
    [
        ("unknown", {}, "Unknown tool: unknown"),
        ("create_intersection", {}, "'dataset_id'"),
        (
            "generate_visualization_report",
            {"dataset_id": "gone"},
            "Dataset not found: gone",
        ),
        ("get_visualization_command_status", {}, "Command not found: "),
        (
            "filter_visualization",
            {"well_id": "well"},
            "radius is required when well_id is provided",
        ),
        (
            "filter_visualization",
            {"radius": 0},
            "well_id is required when radius is provided",
        ),
        (
            "configure_visualization_view",
            {"colormap": "bad"},
            "Unsupported colormap: bad",
        ),
    ],
)
def test_dispatch_errors_preserve_details_without_queue(
    viewer_tools,
    name,
    args,
    error,
):
    result = asyncio.run(viewer_tools.execute_tool(name, args, ""))
    assert result == {"kind": "error", "error": error}
    assert viewer_tools.command_bus.pending_count() == 0


def test_corrupt_scalar_report_keeps_original_error(viewer_tools, tmp_path):
    target = tmp_path / "bad.json"
    result = asyncio.run(
        viewer_tools.execute_tool(
            "save_visualization_report",
            {
                "dataset_id": "grid",
                "property": "bad",
                "output_path": str(target),
            },
            "",
        ),
    )
    assert result == {
        "kind": "error",
        "error": "unpack requires a buffer of 0 bytes",
    }
    assert not target.exists()
    assert viewer_tools.command_bus.pending_count() == 0


@pytest.mark.parametrize(
    "scenario,error",
    [
        ("valid", None),
        ("ambiguous", "Well id is ambiguous: well"),
        ("missing", "Well trajectory not found: well"),
        ("no-positions", "Well trajectory has no positions: well"),
        ("outside", "Well trajectory data is unavailable: well"),
        ("unavailable", "Well trajectory data is unavailable: well"),
        ("malformed", "Invalid well trajectory positions: well"),
        ("nonfinite", "Well trajectory contains no finite points: well"),
    ],
)
def test_well_filter_retains_actual_trajectory_and_path_guards(
    viewer_tools,
    tmp_path,
    scenario,
    error,
):
    binary = tmp_path / "data" / "bin"
    path = binary / "well.f32"
    points = [0, 10, -50, 20, 30, 0, float("nan"), 0, 0]
    if scenario == "nonfinite":
        points = [float("nan"), 0, 0]
    path.write_bytes(struct.pack(f"<{len(points)}f", *points))
    positions = "well.f32"
    if scenario == "outside":
        positions = "../private.f32"
        (binary.parent / "private.f32").write_bytes(path.read_bytes())
    elif scenario == "no-positions":
        positions = ""
    elif scenario == "unavailable":
        positions = "unavailable.f32"
    elif scenario == "malformed":
        path.write_bytes(b"bad")
    items = [
        {
            "id": "well",
            "source": "trajectory",
            "files": {"positions": positions},
        },
    ]
    if scenario == "ambiguous":
        items.append({**items[0], "id": "well-duplicate"})
    elif scenario == "missing":
        items = []
    (binary / "manifest.json").write_text(
        json.dumps({"datasets": items}),
        encoding="utf-8",
    )
    result = asyncio.run(
        viewer_tools.execute_tool(
            "filter_visualization",
            {"well_id": "well", "radius": 5},
            "",
        ),
    )
    if error is not None:
        assert result == {"kind": "error", "error": error}
        assert viewer_tools.command_bus.pending_count() == 0
    else:
        assert result["kind"] == "oilgas.viewer-command"
        command = viewer_tools.command_bus.drain()[0]
        assert command.args["bounds"] == [5.0, 15.0, 15.0, 25.0, -50.0, 0.0]
        assert command.args["wellId"] == "well"
        assert command.args["radius"] == 5
