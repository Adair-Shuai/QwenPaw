# -*- coding: utf-8 -*-
"""Numerical, data-quality and API regression tests for storage history."""

from __future__ import annotations

import csv
import json
import time
from datetime import date, timedelta

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from plugins.bundle.ugsci.domain.storage_dynamics.analysis import (
    analyze,
    markdown_report,
)
from plugins.bundle.ugsci.domain.storage_dynamics.api import (
    build_storage_dynamics_router,
)
from plugins.bundle.ugsci.domain.storage_dynamics.store import DatasetStore
from plugins.bundle.ugsci.domain.storage_dynamics.tools import save_report


def source(tmp_path, rows, name="history.csv", unit="万方", mode="采"):
    path = tmp_path / name
    with path.open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.writer(stream)
        writer.writerow(
            [
                "储气库",
                "井号",
                "日期",
                "生产时间(小时)",
                f"日{mode}气量({unit})",
                "油压(兆帕)",
                "日产水量(吨)",
                "备注",
            ],
        )
        writer.writerows(rows)
    return path


def import_rows(tmp_path, rows, **kwargs):
    store = DatasetStore(tmp_path / "store")
    path = source(tmp_path, rows, **kwargs)
    manifest = store.import_path(str(path))
    return store, manifest


def test_measured_volumes_not_operating_rates_and_missing_not_zero(tmp_path):
    store, m = import_rows(
        tmp_path,
        [
            ["库A", "井1", "2026-01-01", 12, 10, 15, 2, ""],
            ["库A", "井1", "2026-01-02", 24, "", 15, 2, ""],
        ],
    )
    r = analyze(store, m["id"])
    assert r["summary"]["withdrawal"] == 10
    assert r["summary"]["missing_gas"] == 1
    assert r["summary"]["injection"] is None
    assert r["daily_recent"][1]["withdrawal"] is None
    assert r["cycles"][0]["net_metered_change"] is None
    assert r["cycles"][0]["water_gas_mass_ratio"] == 0.2


def test_duplicates_identical_dedup_conflicting_values_excluded(tmp_path):
    row = ["库A", "井1", "2026-01-01", 24, 10, 15, 2, ""]
    store, m = import_rows(
        tmp_path,
        [
            row,
            row,
            ["库A", "井2", "2026-01-01", 24, 10, 15, 2, ""],
            ["库A", "井2", "2026-01-01", 24, 11, 15, 2, ""],
        ],
    )
    assert m["records"] == 2
    assert m["quality_counts"] == {
        "duplicate_identical": 1,
        "duplicate_conflict": 1,
    }
    r = analyze(store, m["id"])
    assert r["summary"]["withdrawal"] == 10
    assert r["summary"]["missing_gas"] == 1


def test_units_converted_and_unknown_rejected(tmp_path):
    store, m = import_rows(
        tmp_path,
        [["库A", "井1", "2026-01-01", 24, 123400, 15, 0, ""]],
        unit="m³",
    )
    assert analyze(store, m["id"])["summary"]["withdrawal"] == 12.34
    bad = source(
        tmp_path,
        [["库A", "井1", "2026-01-01", 24, 10, 15, 0, ""]],
        name="bad.csv",
        unit="未知",
    )
    with pytest.raises(ValueError, match="单位"):
        store.import_path(str(bad))
    assert len(store.list()) == 1


def test_invalid_numbers_hours_and_dates_are_audited(tmp_path):
    store, m = import_rows(
        tmp_path,
        [
            ["库A", "井1", "2026-01-01", 25, -1, 15, 0, ""],
            ["库A", "井1", "2026-01-02", 0, 9, "NaN", 0, ""],
            ["库A", "井1", "not-a-date", 24, 10, 15, 0, ""],
        ],
    )
    assert m["records"] == 2
    assert m["quality_counts"]["invalid_range"] == 2
    assert m["quality_counts"]["invalid_identity"] == 1
    r = analyze(store, m["id"])
    assert r["summary"]["gas_without_hours_count"] == 1
    assert r["summary"]["withdrawal"] == 9
    json.dumps(r, allow_nan=False)


def test_idempotent_import_and_no_source_modification(tmp_path):
    path = source(tmp_path, [["库A", "井1", "2026-01-01", 24, 10, 15, 0, ""]])
    original = path.read_bytes()
    store = DatasetStore(tmp_path / "store")
    first, second = store.import_path(str(path)), store.import_path(str(path))
    assert first["id"] == second["id"]
    assert second["reused"] is True
    assert path.read_bytes() == original


def test_gas_year_config_and_filter_boundaries(tmp_path):
    store, m = import_rows(
        tmp_path,
        [
            ["库A", "井1", "2026-03-31", 24, 10, 15, 0, ""],
            ["库A", "井1", "2026-04-01", 24, 20, 15, 0, ""],
        ],
    )
    assert [r["gas_year"] for r in analyze(store, m["id"])["cycles"]] == [
        "2025-2026",
        "2026-2027",
    ]
    assert [
        r["gas_year"]
        for r in analyze(store, m["id"], cycle_start_month=1)["cycles"]
    ] == ["2026"]
    assert (
        analyze(store, m["id"], start="2026-04-01")["summary"]["withdrawal"]
        == 20
    )
    with pytest.raises(ValueError):
        analyze(store, m["id"], start="2026-04-01", end="2026-03-31")
    with pytest.raises(ValueError):
        store.manifest("../escape")


def test_forecast_holdout_only_uses_prior_values_and_drop_has_source(tmp_path):
    rows = [
        [
            "库A",
            "井1",
            (date(2026, 1, 1) + timedelta(days=i)).isoformat(),
            24,
            100 if i < 14 else 40,
            15,
            0,
            "",
        ]
        for i in range(21)
    ]
    store, m = import_rows(tmp_path, rows)
    r = analyze(store, m["id"])
    w = r["wells"][0]
    assert w["forecast"]["daily_volume"] == 40
    # Prior-seven median remains 100 for holdout days 1–4, then becomes 40.
    assert w["forecast"]["backtest_mae"] == pytest.approx(240 / 7, abs=1e-6)
    assert w["rate_change_pct"] == -60
    assert r["anomalies"][0]["source"]["row"] == 19


@pytest.mark.parametrize("break_kind", ["zero", "missing", "gap", "hours"])
def test_forecast_does_not_cross_shutin_missing_or_gap(tmp_path, break_kind):
    rows = [
        [
            "库A",
            "井1",
            (date(2026, 1, 1) + timedelta(days=i)).isoformat(),
            24,
            100,
            15,
            0,
            "",
        ]
        for i in range(22)
    ]
    if break_kind == "gap":
        rows.pop(15)
    elif break_kind == "hours":
        rows[15][3] = 0
    else:
        rows[15][4] = 0 if break_kind == "zero" else ""
    store, m = import_rows(tmp_path, rows)
    assert analyze(store, m["id"])["wells"][0]["forecast"] is None


def test_injection_and_withdrawal_separate_even_same_well(tmp_path):
    folder = tmp_path / "input"
    folder.mkdir()
    source(
        folder,
        [["库A", "井1", "2026-01-01", 24, 10, 15, 0, ""]],
        name="inj.csv",
        mode="注",
    )
    source(
        folder,
        [["库A", "井1", "2026-01-01", 24, 6, 15, 0, ""]],
        name="out.csv",
    )
    store = DatasetStore(tmp_path / "store")
    m = store.import_path(str(folder))
    r = analyze(store, m["id"])
    assert len(r["wells"]) == 2
    assert r["daily_recent"][0]["state"] == "mixed"
    assert r["cycles"][0]["net_metered_change"] == 4


def test_report_persists_exact_parameters_and_provenance(tmp_path):
    store, m = import_rows(
        tmp_path,
        [["库A", "井1", "2026-01-01", 24, 10, 15, 0, ""]],
    )
    r = analyze(store, m["id"], cycle_start_month=5)
    saved = save_report(store, r)
    assert "井口油压" in saved["markdown"]
    assert m["files"][0]["sha256"] in saved["markdown"]
    from pathlib import Path

    snapshot = json.loads(
        Path(saved["analysis_path"]).read_text(encoding="utf-8"),
    )
    assert snapshot["parameters"]["cycle_start_month"] == 5
    assert "气年度 5 月起" in saved["markdown"]


def test_report_recent_cycles_across_facilities(tmp_path):
    rows = [["库A", "井1", "2026-05-01", 24, 10, 15, 0, ""]]
    rows += [
        ["库B", "井2", f"{year}-05-01", 24, 10, 15, 0, ""]
        for year in range(1970, 2010)
    ]
    store, m = import_rows(tmp_path, rows)
    report = markdown_report(analyze(store, m["id"]))
    assert "| 库A | 2026-2027 |" in report
    assert "| 库B | 1970-1971 |" not in report


def test_http_import_analysis_export_and_validation(tmp_path):
    path = source(tmp_path, [["库A", "井1", "2026-01-01", 24, 10, 15, 0, ""]])
    app = FastAPI()
    app.include_router(
        build_storage_dynamics_router(DatasetStore(tmp_path / "store")),
        prefix="/api/test",
    )
    with TestClient(app) as client:
        job = client.post("/api/test/imports", json={"input_path": str(path)})
        assert job.status_code == 202
        for _ in range(100):
            status = client.get("/api/test/imports/" + job.json()["id"]).json()
            if status["status"] in ("completed", "failed"):
                break
            time.sleep(0.01)
        assert status["status"] == "completed"
        body = {"dataset_id": status["dataset"]["id"]}
        assert (
            client.post("/api/test/analyze", json=body).json()["summary"][
                "withdrawal"
            ]
            == 10
        )
        assert client.post("/api/test/export", json=body).status_code == 200
        assert (
            client.post(
                "/api/test/analyze",
                json={**body, "cycle_start_month": 13},
            ).status_code
            == 422
        )
        assert (
            client.post(
                "/api/test/analyze",
                json={**body, "dataset_id": "../escape"},
            ).status_code
            == 422
        )
        assert (
            client.post(
                "/api/test/analyze",
                json={**body, "facility": "不存在"},
            ).status_code
            == 422
        )
