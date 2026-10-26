"""Real-file simulation result collection, persistence and HTTP boundaries."""
from __future__ import annotations

import csv
import io
import json
import struct
import threading
import time
from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from plugins.bundle.ugsci.engine.tools import job_store, result_service as service
from plugins.bundle.ugsci.sim_api import build_sim_router


@pytest.fixture
def case(tmp_path, monkeypatch):
    monkeypatch.setattr(job_store, "_store_file", lambda: tmp_path / "state" / "jobs.json")
    monkeypatch.setattr(service, "_publish_fields", lambda *_: {"status": "unavailable", "datasets": [], "warnings": []})
    output = tmp_path / "output"
    output.mkdir()
    deck = output / "CASE.mph"
    # No fake MPH output: this path identifies the input case only.
    job_store.save_job("sim-test", {"job_id": "sim-test", "simulator": "comsol", "deck_file": str(deck), "output_dir": str(output), "status": "running", "agent_id": "default", "start_ts": time.time() - 10})
    return output


def write_csv(case: Path, rows: str):
    (case / "CASE.csv").write_text("Time,pressure\n" + rows, encoding="utf-8")


def test_real_csv_incremental_half_write_preserves_snapshot_and_restart(case):
    write_csv(case, "0,10\n1,11\n")
    first = service.collect_once("sim-test")
    assert [point["value"] for point in first["series"][0]["points"]] == [10, 11]
    assert first["series"][0]["unit"] is None
    write_csv(case, "0,10\n1,11\n2,")
    partial = service.collect_once("sim-test")
    assert partial["stale"] is True
    assert partial["series"] == first["series"]
    assert partial["revision"] > first["revision"]
    write_csv(case, "0,10\n1,11\n2,12\n")
    final = service.collect_once("sim-test", final=True, status="completed")
    assert final["series"][0]["points"][-1] == {"time": 2.0, "value": 12.0}
    assert final["finalized"] is True
    # Load from the durable database, with no in-memory reader state.
    assert service.load_snapshot("ugsci:sim-test") == final
    assert job_store.load_job("sim-test")["status"] == "running"


def test_case_scoping_does_not_read_other_output_and_full_export_is_not_sampled(case):
    (case / "OTHER.csv").write_text("Time,secret\n0,999\n")
    write_csv(case, "".join(f"{i},{i * 2}\n" for i in range(1201)))
    snapshot = service.collect_once("sim-test")
    assert len(snapshot["series"]) == 1
    public = service.sampled_snapshot(snapshot)
    assert public["series"][0]["sampled"] is True
    assert public["series"][0]["total_points"] == 1201
    assert len(public["series"][0]["points"]) == 600
    rows = list(csv.reader(io.StringIO(service.export_csv(snapshot, "PRESSURE"))))
    assert len(rows) == 1202
    assert rows[-1][:2] == ["1200.0", "2400.0"]


def test_missing_and_repeated_times_preserve_gaps_without_invented_units(case):
    write_csv(case, "0,10\n1,nan\n1,11\n0,12\n")
    result = service.collect_once("sim-test")
    points = result["series"][0]["points"]
    assert points[1]["value"] is None
    assert points[2] == {"time": 1.0, "value": None}
    assert points[4] == {"time": 0.0, "value": None}
    assert result["series"][0]["time_unit"] is None
    public = service.sampled_snapshot(result, limit=3)
    assert any(point["value"] is None for point in public["series"][0]["points"])


def test_text_eclipse_uses_physical_time_not_row_index(case):
    job_store.update_job_fields("sim-test", simulator="eclipse", deck_file=str(case / "CASE.DATA"))
    (case / "CASE.RSM").write_text("DAYS FPR FOPR\n0 100 10\n30 90 9\n60 80 8\n")
    result = service.collect_once("sim-test")
    pressure = next(item for item in result["series"] if item["id"] == "FPR")
    assert [point["time"] for point in pressure["points"]] == [0, 30, 60]
    assert pressure["time_unit"] == "day"


def _fort_record(data):
    return struct.pack(">i", len(data)) + data + struct.pack(">i", len(data))


def _fort_array(name, kind, values):
    data = b"".join(value.encode().ljust(8) for value in values) if kind == "CHAR" else struct.pack(">" + "f" * len(values), *values)
    return _fort_record(name.encode().ljust(8) + struct.pack(">i", len(values)) + kind.encode()) + _fort_record(data)


def test_binary_partial_array_and_nan_gap_are_not_silently_published(case):
    job_store.update_job_fields("sim-test", simulator="eclipse", deck_file=str(case / "CASE.DATA"))
    (case / "CASE.SMSPEC").write_bytes(_fort_array("KEYWORDS", "CHAR", ["TIME", "FPR"]) + _fort_array("UNITS", "CHAR", ["DAYS", "BAR"]))
    data = b"".join(_fort_array("PARAMS", "REAL", row) for row in [[0, 100], [1, float("nan")], [2, 90]])
    (case / "CASE.UNSMRY").write_bytes(data)
    first = service.collect_once("sim-test")
    pressure = next(item for item in first["series"] if item["id"] == "FPR")
    assert pressure["points"][1] == {"time": 1.0, "value": None}
    assert pressure["unit"] == "BAR"
    (case / "CASE.UNSMRY").write_bytes(data + _fort_record(b"PARAMS  " + struct.pack(">i", 2) + b"REAL"))
    partial = service.collect_once("sim-test", final=True, status="cancelled")
    assert partial["series"] == first["series"]
    assert partial["stale"] and partial["finalized"]
    assert partial["status"] == "cancelled"


def test_http_get_is_read_only_scoped_and_csv_uses_persisted_full_data(case, monkeypatch):
    from qwenpaw.app import agent_context
    from unittest.mock import AsyncMock

    app = FastAPI()
    profiles = {name: SimpleNamespace(enabled=name != "disabled") for name in ("default", "another-agent", "disabled")}
    monkeypatch.setattr(agent_context, "load_config", lambda: SimpleNamespace(agents=SimpleNamespace(active_agent="default", profiles=profiles)))
    app.state.multi_agent_manager = SimpleNamespace(get_agent=AsyncMock(side_effect=lambda agent: SimpleNamespace(agent_id=agent)))
    app.include_router(build_sim_router("ugsci"), prefix="/ugsci/sim")
    client = TestClient(app)
    write_csv(case, "0,1\n1,2\n")
    first = client.get("/ugsci/sim/jobs/ugsci:sim-test/results")
    assert first.status_code == 200 and first.json()["status"] == "not_collected"
    assert not (service._root() / "results.sqlite3").exists()
    snapshot = service.collect_once("sim-test")
    monkeypatch.setattr(service, "collect_once", lambda *a, **k: pytest.fail("GET parsed files"))
    write_csv(case, "0,999\n")
    assert client.get("/ugsci/sim/jobs/sim-test/results").json()["revision"] == snapshot["revision"]
    assert "1.0,2.0" in client.get("/ugsci/sim/jobs/sim-test/results/export?series_id=PRESSURE").text
    assert client.get("/ugsci/sim/jobs/fake/results").status_code == 404
    assert client.get("/ugsci/sim/jobs/sim-test/results", headers={"X-Agent-Id": "forged"}).status_code == 404
    assert client.get("/ugsci/sim/jobs/sim-test/results", headers={"X-Agent-Id": "another-agent"}).status_code == 404
    assert client.get("/ugsci/sim/jobs/sim-test/results", headers={"X-Agent-Id": "disabled"}).status_code == 403
    assert client.get("/ugsci/sim/jobs/sim-test/results/export?series_id=PRESSURE", headers={"X-Agent-Id": "another-agent"}).status_code == 404
    assert client.post("/ugsci/sim/jobs/sim-test/results/refresh", headers={"X-Agent-Id": "another-agent"}).status_code == 404
    job_store.update_job_fields("sim-test", agent_id="another-agent")
    assert client.get("/ugsci/sim/jobs/sim-test/results").status_code == 404


def test_background_finalization_and_restart_retain_terminal_status(case, monkeypatch):
    write_csv(case, "0,1\n1,2\n")
    monkeypatch.setattr(service, "POLL_SECONDS", 0.05)
    service.start_collection("sim-test")
    job_store.update_job_status("sim-test", "cancelled")
    service.finish_collection("sim-test", "cancelled")
    deadline = time.monotonic() + 5
    while time.monotonic() < deadline:
        snapshot = service.load_snapshot("sim-test")
        if snapshot and snapshot.get("finalized"):
            break
        time.sleep(0.02)
    assert snapshot["finalized"] and snapshot["status"] == "cancelled"
    assert snapshot["series"]
    with service._workers_lock:
        worker = service._workers.get("sim-test")
    if worker:
        worker.thread.join(timeout=2)
    assert service.load_snapshot("sim-test")["finalized"]


def test_parser_failure_never_changes_solver_status(case, monkeypatch):
    write_csv(case, "0,1\n")
    first = service.collect_once("sim-test")
    monkeypatch.setattr(service, "_stable_copy", lambda *args: (_ for _ in ()).throw(RuntimeError("locked result")))
    failed = service.collect_once("sim-test", final=True, status="completed")
    assert failed["series"] == first["series"]
    assert failed["status"] == "completed" and failed["collection_status"] == "error"
    assert job_store.load_job("sim-test")["status"] == "running"


def test_unchanged_valid_final_curve_is_complete_not_error(case):
    write_csv(case, "0,10\n1,11\n")
    first = service.collect_once("sim-test")
    second = service.collect_once("sim-test")
    assert second["stale"] is True
    final = service.collect_once("sim-test", final=True, status="completed")
    assert final["series"] == first["series"]
    assert final["collection_status"] == "complete" and not final["stale"]
    assert final["started_at"]


def test_log_growth_without_curve_change_preserves_data_timestamp(case):
    write_csv(case, "0,10\n1,11\n")
    log = case / "CASE.sim.log"
    log.write_text("solver iteration 1\n")
    first = service.collect_once("sim-test")
    log.write_text("solver iteration 1\nsolver iteration 2\n")
    second = service.collect_once("sim-test")
    assert second["source_fingerprint"] != first["source_fingerprint"]
    assert second["series"] == first["series"]
    assert second["data_updated_at"] == first["data_updated_at"]
    assert second["stale"]
    final = service.collect_once("sim-test", final=True, status="completed")
    assert final["data_updated_at"] == first["data_updated_at"]
    assert final["collection_status"] == "complete"


def test_real_multiple_rsm_blocks_preserve_distinct_columns_and_physical_time(case):
    job_store.update_job_fields("sim-test", simulator="eclipse", deck_file=str(case / "CASE.DATA"))
    (case / "CASE.RSM").write_text("DAYS FPR FOPR\n0 100 10\n30 90 9\n\nPAGE 2\nDAYS WOPR:W1\n0 5\n30 4\n")
    result = service.collect_once("sim-test", final=True, status="completed")
    assert result["collection_status"] == "complete"
    values = {item["id"]: item for item in result["series"]}
    assert set(values) == {"FPR", "FOPR", "WOPR:W1"}
    assert values["WOPR:W1"]["well"] == "W1"
    assert values["WOPR:W1"]["points"][-1] == {"time": 30.0, "value": 4.0}


def test_standard_rsm_separate_well_and_unit_rows_are_not_merged(case):
    job_store.update_job_fields("sim-test", simulator="eclipse", deck_file=str(case / "CASE.DATA"))
    (case / "CASE.RSM").write_text(
        "     TIME       WOPR       WOPR\n"
        "     DAYS    SM3/DAY    SM3/DAY\n"
        "                  A          B\n"
        "        0         10         20\n"
        "       30          9         18\n"
    )
    result = service.collect_once("sim-test", final=True, status="completed")
    assert result["collection_status"] == "complete"
    values = {item["id"]: item for item in result["series"]}
    assert set(values) == {"WOPR:A", "WOPR:B"}
    assert [point["value"] for point in values["WOPR:A"]["points"]] == [10, 9]
    assert [point["value"] for point in values["WOPR:B"]["points"]] == [20, 18]
    assert values["WOPR:A"]["unit"] == "SM3/DAY"
    assert values["WOPR:B"]["well"] == "B"
    # A field column has no object label; the well-name row retains its blank
    # TIME/FPR slots. A well named C must not be mistaken for Celsius units.
    (case / "CASE.RSM").write_text(
        "TIME FPR WOPR WOPR\nDAYS BAR SM3/DAY SM3/DAY\n"
        "             A    C\n0 100 10 20\n30 90 9 18\n"
    )
    mixed = service.collect_once("sim-test", final=True, status="completed")
    mixed_values = {item["id"]: item for item in mixed["series"]}
    assert set(mixed_values) == {"FPR", "WOPR:A", "WOPR:C"}
    assert mixed_values["WOPR:C"]["points"][-1]["value"] == 18


def test_rsm_bar_unit_is_not_reinterpreted_as_header(case):
    job_store.update_job_fields("sim-test", simulator="eclipse", deck_file=str(case / "CASE.DATA"))
    (case / "CASE.RSM").write_text(
        "TIME FPR WGPR:A WGPR:B\nDAYS BAR SM3/D SM3/D\n"
        "0 220 18000 15000\n30 210 17000 14000\n"
    )
    result = service.collect_once("sim-test", final=True, status="completed")
    values = {item["id"]: item for item in result["series"]}
    assert set(values) == {"FPR", "WGPR:A", "WGPR:B"}
    assert values["FPR"]["unit"] == "BAR"
    assert values["FPR"]["points"] == [{"time": 0.0, "value": 220.0}, {"time": 30.0, "value": 210.0}]


def test_rsm_duplicate_columns_without_well_names_keep_previous_snapshot(case):
    job_store.update_job_fields("sim-test", simulator="eclipse", deck_file=str(case / "CASE.DATA"))
    source = case / "CASE.RSM"
    source.write_text("TIME WOPR:A WOPR:B\nDAYS SM3/DAY SM3/DAY\n0 10 20\n")
    first = service.collect_once("sim-test")
    source.write_text("TIME WOPR WOPR\nDAYS SM3/DAY SM3/DAY\n0 11 22\n")
    ambiguous = service.collect_once("sim-test", final=True, status="completed")
    assert ambiguous["series"] == first["series"]
    assert ambiguous["data_updated_at"] == first["data_updated_at"]
    assert ambiguous["stale"] and ambiguous["collection_status"] == "error"
    assert any("拒绝合并" in warning for warning in ambiguous["warnings"])


def test_metrics_require_log_evidence_and_report_step_is_not_tail_count(case):
    job_store.update_job_fields("sim-test", simulator="eclipse", deck_file=str(case / "CASE.DATA"))
    (case / "CASE.RSM").write_text("DAYS FPR\n0 220\n30 210\n")
    log = case / "CASE.PRT"
    log.write_text("TIME = 30 DAYS\n")
    initial = service.collect_once("sim-test")
    assert initial["simulation_time"] == "30 DAYS"
    assert initial["metrics"] == []
    log.write_text("REPORT STEP 41 TIME = 30 DAYS\nITER # 0\nMATERIAL BALANCE ERROR = 1e-6\n")
    measured = service.collect_once("sim-test")
    metrics = {item["id"]: item for item in measured["metrics"]}
    assert metrics["current_step"]["points"][-1]["value"] == 41
    assert metrics["newton_iterations"]["points"][-1]["value"] == 0
    assert metrics["material_balance_error"]["points"][-1]["value"] == 1e-6


def test_manual_refresh_reparses_unchanged_source_and_replaces_old_wrong_snapshot(case, monkeypatch):
    from qwenpaw.app import agent_context
    from unittest.mock import AsyncMock

    job_store.update_job_fields("sim-test", simulator="eclipse", deck_file=str(case / "CASE.DATA"), status="completed")
    source = case / "CASE.RSM"
    source.write_text("TIME FPR WGPR:A WGPR:B\nDAYS BAR SM3/D SM3/D\n0 220 18000 15000\n")
    good = service.collect_once("sim-test", final=True, status="completed")
    source_before = (source.stat().st_size, source.stat().st_mtime_ns)
    old = json.loads(json.dumps(good))
    old["series"] = [{"id": "BAR", "label": "BAR", "unit": None, "time_unit": None, "well": None,
                      "points": [{"time": 0, "value": 999}], "total_points": 1, "sampled": False}]
    service._persist("sim-test", old)
    app = FastAPI()
    monkeypatch.setattr(agent_context, "load_config", lambda: SimpleNamespace(agents=SimpleNamespace(active_agent="default", profiles={"default": SimpleNamespace(enabled=True)})))
    app.state.multi_agent_manager = SimpleNamespace(get_agent=AsyncMock(return_value=SimpleNamespace(agent_id="default")))
    app.include_router(build_sim_router("ugsci"), prefix="/ugsci/sim")
    client = TestClient(app)
    response = client.post("/ugsci/sim/jobs/sim-test/results/refresh")
    assert response.status_code == 202
    with service._workers_lock:
        worker = service._workers.get("sim-test")
    if worker:
        worker.thread.join(timeout=5)
        assert not worker.thread.is_alive()
    corrected = client.get("/ugsci/sim/jobs/sim-test/results").json()
    assert {item["id"] for item in corrected["series"]} == {"FPR", "WGPR:A", "WGPR:B"}
    assert corrected["source_fingerprint"] == good["source_fingerprint"]
    assert source_before == (source.stat().st_size, source.stat().st_mtime_ns)
    assert corrected["finalized"] and corrected["collection_status"] == "complete"


def test_finalizing_is_not_overwritten_by_inflight_collection(case, monkeypatch):
    write_csv(case, "0,10\n1,11\n")
    entered = threading.Event()
    release = threading.Event()
    original = service._stable_copy
    calls = []

    def slow_copy(*args):
        calls.append(1)
        if len(calls) == 1:
            entered.set()
            assert release.wait(5)
        return original(*args)

    monkeypatch.setattr(service, "_stable_copy", slow_copy)
    service.start_collection("sim-test")
    assert entered.wait(5)
    began = time.monotonic()
    service.finish_collection("sim-test", "cancelled")
    assert time.monotonic() - began < 1
    assert service.load_snapshot("sim-test")["collection_status"] == "finalizing"
    with service._workers_lock:
        worker = service._workers["sim-test"]
    release.set()
    worker.thread.join(timeout=5)
    assert not worker.thread.is_alive()
    result = service.load_snapshot("sim-test")
    assert result["status"] == "cancelled" and result["finalized"]


@pytest.mark.asyncio
async def test_real_result_tool_includes_persistent_simulation_reference(case, monkeypatch):
    from plugins.bundle.ugsci.engine.tools import launcher
    from plugins.bundle.ugsci.engine.tools.result_reader import read_simulation_results

    job_store.update_job_fields("sim-test", simulator="eclipse", deck_file=str(case / "CASE.DATA"), status="completed")
    (case / "CASE.RSM").write_text("DAYS FPR\n0 100\n30 90\n")
    job = SimpleNamespace(job_id="sim-test", simulator="eclipse", deck_file=str(case / "CASE.DATA"), working_dir=str(case), status="completed")
    monkeypatch.setattr(launcher, "_get_job", lambda _: job)
    output = await read_simulation_results("sim-test")
    texts = [part.get("text", "") if isinstance(part, dict) else part.text for part in output.content]
    # The live SDK concatenates TextBlocks; the persisted reference still has
    # unambiguous boundaries after the explanatory result text.
    import re
    references = [json.loads(text) for text in re.findall(
        r"<ugsci-simulation-ref>(.*?)</ugsci-simulation-ref>", "".join(texts), re.S,
    )]
    assert any(item.get("kind") == "ugsci_simulation" and item.get("run_id") == "sim-test" for item in references)
    assert any("FPR" in text for text in texts)
    with service._workers_lock:
        worker = service._workers.get("sim-test")
    if worker:
        worker.thread.join(timeout=5)


def test_opm_flow_registration_command_and_real_summary(case, monkeypatch):
    from plugins.bundle.ugsci.engine.adapters import get_adapter, list_supported_simulators
    from plugins.bundle.ugsci.engine.manager import DEFAULT_ENGINES, EngineInfo
    from plugins.bundle.ugsci.engine.detector import _detect_opm_flow

    assert "opm_flow" in list_supported_simulators()
    assert any(engine["id"] == "opm_flow" for engine in DEFAULT_ENGINES)
    adapter = get_adapter("opm_flow")
    deck = case / "CASE.DATA"
    assert adapter.build_command("/configured/opm/flow", str(deck)) == ["/configured/opm/flow", str(deck.resolve()), f"--output-dir={deck.parent.resolve()}"]
    assert not adapter.capabilities.supports_auto_tune
    assert not adapter.capabilities.supports_checkpoint_resume
    assert adapter.tuning_rules() == {}
    executable = case / "flow.exe"
    executable.write_bytes(b"configured fixture; never executed")
    monkeypatch.delenv("OPM_FLOW_EXECUTABLE", raising=False)
    monkeypatch.setenv("PATH", str(case))
    assert _detect_opm_flow(EngineInfo(id="opm_flow", name="OPM Flow")).status == "configured"
    engine = _detect_opm_flow(EngineInfo(id="opm_flow", name="OPM Flow", executable_path=str(executable)))
    assert engine.status == "detected" and "solver_not_executed" in engine.extra_info["verification"]
    job_store.update_job_fields("sim-test", simulator="opm_flow", deck_file=str(deck))
    (case / "CASE.RSM").write_text("DAYS FPR\n0 100\n30 95\n")
    result = service.collect_once("sim-test", final=True, status="completed")
    assert result["series"][0]["points"][-1] == {"time": 30.0, "value": 95.0}
    assert result["collection_status"] == "complete"
