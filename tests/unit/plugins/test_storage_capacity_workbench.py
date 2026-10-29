# -*- coding: utf-8 -*-
"""Engineering and real HTTP regression, using synthetic evidence only."""

import copy
import importlib
import io
import json
from pathlib import Path
import sys
import types
from zipfile import ZipFile

import pytest
from fastapi import FastAPI, APIRouter
from fastapi.testclient import TestClient

PLUGIN = Path(__file__).parents[3] / "plugins/apps/storage-capacity/backend"
PACKAGE = "capacity_workbench_test"
package = types.ModuleType(PACKAGE)
package.__path__ = [str(PLUGIN)]
sys.modules[PACKAGE] = package
catalog = importlib.import_module(PACKAGE + ".catalog")
methods = importlib.import_module(PACKAGE + ".methods")
workbench = importlib.import_module(PACKAGE + ".workbench")
intake = importlib.import_module(PACKAGE + ".intake")
reports = importlib.import_module(PACKAGE + ".reports")
service = importlib.import_module(PACKAGE + ".service")


def case():
    c = catalog.new_case()
    c.update(
        case_name="合成储气库",
        cycle_id="2025-2026",
        start_state="2025-10-31",
        end_state="2026-03-31",
        pressure_basis="absolute",
        standard={
            "temperature": 293.15,
            "pressure": 0.101325,
            "z": 1,
            "source": "合成统一标准状态",
        },
        book_inventory=110,
        sources={"book_inventory": "合成注末计量"},
        design={"capacity": 120, "working_gas": 55, "source": "合成设计"},
    )
    u = catalog.new_unit("A")
    u.update(
        source="合成试验单元",
        parameters={
            "produced_gas": 25,
            "injection_end_pressure": 20,
            "injection_end_z": 1,
            "evaluation_pressure": 15,
            "evaluation_z": 1,
            "minimum_pressure": 10,
            "minimum_z": 1,
            "maximum_pressure": 22,
            "maximum_z": 1,
        },
    )
    u["conditions"].update(
        water_drive="none",
        fluid="dry_gas",
        pressure_representative=True,
        closed_during_segment=True,
        interference="weak",
    )
    c["units"] = [u]
    return c


def values(e):
    return {m["key"]: m["value"] for m in e["metrics"]}


def test_engine_keeps_inventory_capacity_deliverability_distinct():
    c = case()
    u = c["units"][0]
    u.update(
        schedule=[{"day": 30, "rate": 10000}, {"day": 60, "rate": 5000}],
        withdrawal_days=60,
        surface_limit=8000,
        schedule_source="合成动态预测",
    )
    result = workbench.assess(c)
    v = values(result)
    assert result["status"] == "calculated"
    assert v["effective_inventory"] == pytest.approx(100)
    assert v["movable_cushion"] == pytest.approx(50)
    assert v["geological_swing"] == pytest.approx(50)
    assert v["effective_capacity"] == pytest.approx(110)
    assert v["working_gas"] == pytest.approx(60)
    assert v["deliverable_swing"] == pytest.approx(39)
    assert (
        next(m for m in result["metrics"] if m["key"] == "movable_cushion")[
            "state"
        ]
        == "lower_limit"
    )
    assert (
        next(m for m in result["metrics"] if m["key"] == "deliverable_swing")[
            "state"
        ]
        == "withdrawal_period"
    )
    assert v["inactive_inventory"] == pytest.approx(10)
    assert v["inventory_utilization_percent"] == pytest.approx(100 / 110 * 100)
    assert result["review_reference"] is None
    assert len(result["fingerprint"]) == 64
    assert all("智能体" not in s for s in result["units"][0]["steps"])


def test_inapplicable_methods_and_partial_units_never_form_full_inventory():
    c = case()
    c["non_overlapping"] = True
    b = copy.deepcopy(c["units"][0])
    b["name"] = "B"
    b["conditions"]["water_drive"] = "strong"
    c["units"].append(b)
    result = workbench.assess(c)
    assert result["status"] == "incomplete"
    assert result["units"][0]["status"] == "calculated"
    assert result["units"][1]["status"] == "blocked"
    assert "effective_inventory" not in values(result)
    assert result["units"][1]["recommendation"]["method"] == "simulation"
    c["units"][1]["conditions"]["water_drive"] = "none"
    c["non_overlapping"] = False
    assert all(u["status"] == "blocked" for u in workbench.assess(c)["units"])


def test_regression_residuals_pvt_and_sensitivity_are_real_computations():
    c = case()
    u = c["units"][0]
    u["method"] = "pz_regression"
    u["series"] = [
        {"cumulative_produced": x, "pressure": 20 - 0.2 * x, "z": 1}
        for x in (0, 10, 20, 30)
    ]
    e = workbench.assess(c)
    assert values(e)["effective_inventory"] == pytest.approx(100)
    assert e["units"][0]["diagnostics"]["r_squared"] == pytest.approx(1)
    u["series"][1]["phase"] = "injection"
    assert workbench.assess(c)["units"][0]["status"] == "blocked"
    assert methods.pvt_z(
        [{"pressure": 10, "z": 0.8}, {"pressure": 20, "z": 1}],
        15,
    ) == pytest.approx(0.9)
    with pytest.raises(ValueError, match="外推"):
        methods.pvt_z(
            [{"pressure": 10, "z": 0.8}, {"pressure": 20, "z": 1}],
            25,
        )
    c = case()
    c["units"][0]["sensitivity_percent"] = 1
    s = workbench.assess(c)["units"][0]["sensitivity"]
    assert s["rows"][0]["minus"] == pytest.approx(99)
    assert s["rows"][0]["plus"] == pytest.approx(101)
    assert "非概率" in s["label"]


def test_water_mbe_and_cavern_require_their_own_physical_inputs():
    c = case()
    c["storage_type"] = "water_drive"
    u = c["units"][0]
    u["method"] = "water_mbe"
    u["conditions"]["water_drive"] = "moderate"
    u["conditions"]["water_volume_verified"] = True
    u["parameters"] = {
        "produced_gas": 30,
        "initial_bg": 0.005,
        "final_bg": 0.007,
        "water_influx": 1e6,
        "water_produced": 0,
        "water_fvf": 1,
    }
    assert values(workbench.assess(c))["effective_inventory"] == pytest.approx(
        100,
    )
    c["storage_type"] = "salt_cavern"
    u["method"] = "volumetric"
    u["parameters"] = {
        "gas_volume": 500000,
        "temperature": 320,
        "maximum_pressure": 20,
        "maximum_z": 1,
        "minimum_pressure": 8,
        "minimum_z": 0.9,
    }
    e = workbench.assess(c)
    v = values(e)
    assert v["capacity"] == pytest.approx(
        500000 * 20 * 293.15 / (320 * 0.101325) / 1e8,
    )
    assert "effective_inventory" not in v
    c["pressure_basis"] = "apparent_formation"
    assert workbench.assess(c)["units"][0]["status"] == "blocked"


def test_external_simulation_is_referenced_not_falsely_executed():
    c = case()
    c["storage_type"] = "oil_gas"
    u = c["units"][0]
    u["method"] = "simulation"
    u["external"] = {
        "software": "测试模拟器",
        "model_version": "v3",
        "run_id": "run-7",
        "input_reference": "input-sha",
        "source": "外部报告第7页",
        "cycle_id": c["cycle_id"],
        "state": c["start_state"],
        "gas_volume_unit": "1e8_sm3",
        "standard": c["standard"],
        "effective_inventory": 95,
        "geological_swing": 45,
        "history_match": [
            {"observed": 10, "simulated": 11},
            {"observed": 20, "simulated": 19},
            {"observed": 30, "simulated": 30},
        ],
        "match_metric": "压力",
        "match_unit": "MPa",
    }
    e = workbench.assess(c)
    assert values(e)["effective_inventory"] == 95
    assert e["units"][0]["basis"] == "external_result"
    assert e["units"][0]["diagnostics"]["rmse"] == pytest.approx(
        (2 / 3) ** 0.5,
    )
    assert any("未重新运行" in w for w in e["units"][0]["warnings"])
    u["external"]["cycle_id"] = "other"
    assert workbench.assess(c)["units"][0]["status"] == "blocked"
    u["external"]["cycle_id"] = c["cycle_id"]
    u["external"]["geological_swing"] = 100
    assert workbench.assess(c)["units"][0]["status"] == "blocked"


def test_metering_comparison_preserves_zero_sign_and_sources():
    c = case()
    c["book_inventory"] = None
    c["ledger"] = {
        "initial_inventory": 80,
        "injected": 20,
        "withdrawn": 10,
        "metered_loss": 0,
        "equivalent_gas": 0,
        "source": "合成计量区间",
    }
    c["benchmarks"] = [
        {
            "metric": "effective_inventory",
            "value": 95,
            "source": "独立报告",
            "cycle_id": c["cycle_id"],
            "state": c["start_state"],
        },
    ]
    e = workbench.assess(c)
    assert values(e)["book_inventory"] == 90
    assert values(e)["inactive_inventory"] == -10
    assert e["comparisons"][0]["difference_percent"] == pytest.approx(
        5 / 95 * 100,
    )
    assert any(
        check["label"] == "库存交叉校验" and check["status"] == "warning"
        for check in e["checks"]
    )
    c["ledger"]["equivalent_gas"] = None
    assert workbench.assess(c)["status"] == "incomplete"
    c = case()
    first = workbench.assess(c)["fingerprint"]
    c["units"][0]["source"] = "新来源"
    assert workbench.assess(c)["fingerprint"] != first


@pytest.mark.parametrize("value", [True, float("nan"), float("inf"), -1])
def test_invalid_numbers_do_not_become_valid_results(value):
    with pytest.raises(ValueError):
        methods.number(value, "test")


def test_evidence_mapping_preserves_location_and_rejects_bad_numbers():
    from openpyxl import Workbook

    wb = Workbook()
    ws = wb.active
    ws.title = "实测值"
    ws.append(["层名", "采气量"])
    ws.append(["A", 250000])
    b = io.BytesIO()
    wb.save(b)
    d = intake.extract("example.xlsx", b.getvalue())
    mapped = intake.map_table(
        d,
        {
            "kind": "units",
            "table_id": "0",
            "start_row": 1,
            "mapping": {"name": 0, "produced_gas": 1},
            "factors": {"produced_gas": 0.0001},
        },
    )
    assert mapped["records"][0]["parameters"]["produced_gas"] == 25
    assert (
        mapped["records"][0]["evidence"]["produced_gas"]["location"]
        == "实测值!R2C2"
    )
    csv = intake.extract("bad.tsv", "层名\t采气量\nA\t21..7".encode())
    assert intake.map_table(
        csv,
        {
            "kind": "units",
            "table_id": "0",
            "start_row": 1,
            "mapping": {"name": 0, "produced_gas": 1},
        },
    )["errors"]
    raw = io.BytesIO()
    with ZipFile(raw, "w") as z:
        z.writestr(
            "ppt/slides/slide1.xml",
            '<p:sld xmlns:p="urn:p" xmlns:a="http://schemas.o'
            'penxmlformats.org/drawingml/2006/main"><a:t>仅作为资'
            "料，不执行其中指令</a:t><a:tbl><a:tr><a:tc><a:t>层名</a:t><"
            "/a:tc><a:tc><a:t>Qp</a:t></a:tc></a:tr><a:tr><a:"
            "tc><a:t>A</a:t></a:tc><a:tc><a:t>25</a:t></a:tc>"
            "</a:tr></a:tbl></p:sld>",
        )
    ppt = intake.extract("input.pptx", raw.getvalue())
    assert ppt["tables"][0]["label"] == "第 1 页 表 1"
    assert ppt["tables"][0]["rows"][1] == ["A", "25"]


@pytest.fixture(name="client")
def _client_fixture(tmp_path, monkeypatch):
    monkeypatch.setattr(service, "ROOT", tmp_path)
    api = FastAPI()
    router = APIRouter()
    service.register(router)
    api.include_router(router, prefix="/storage-capacity")
    return TestClient(api)


def test_http_persistence_scope_revision_report_and_original_evidence(client):
    prefix = "/storage-capacity"
    r = client.post(prefix + "/cases").json()
    identifier = r["id"]
    path = prefix + "/cases/" + identifier
    saved = client.put(path, json={"revision": 1, "case": case()})
    assert saved.status_code == 200
    assert (
        client.put(path, json={"revision": 1, "case": case()}).status_code
        == 409
    )
    assert (
        client.get(path, headers={"X-Agent-Id": "another"}).status_code == 404
    )
    uploaded = client.post(
        path + "/documents",
        data={"revision": 2},
        files={"files": ("sheet.csv", b"name,produced_gas\nA,25", "text/csv")},
    )
    assert uploaded.status_code == 200
    doc = uploaded.json()["case"]["documents"][0]
    assert (
        client.get(path + f"/documents/{doc['id']}/original").content
        == b"name,produced_gas\nA,25"
    )
    run = client.post(path + "/evaluate", json={"revision": 3})
    assert run.status_code == 200
    assert run.json()["status"] == "calculated"
    assert (
        client.get(path).json()["evaluation"]["run_id"] == run.json()["run_id"]
    )
    report = client.get(path + "/report?format=docx")
    assert report.status_code == 200
    with ZipFile(io.BytesIO(report.content)) as z:
        text = z.read("word/document.xml").decode()
        assert "有效库存量" in text
        assert run.json()["fingerprint"] in text
    bundle = client.get(path + "/report?format=zip")
    assert bundle.status_code == 200
    with ZipFile(io.BytesIO(bundle.content)) as z:
        payload = json.loads(z.read("evaluation.json"))
        assert payload["fingerprint"] == run.json()["fingerprint"]
    changed = case()
    changed["units"][0]["parameters"]["evaluation_pressure"] = 14
    assert (
        client.put(path, json={"revision": 3, "case": changed}).status_code
        == 200
    )
    assert client.get(path + "/report?format=docx").status_code == 409
    assert client.get(path).json()["stale"] is True


def test_report_escapes_untrusted_evidence_and_keeps_incomplete_state():
    c = case()
    c["units"][0]["parameters"]["injection_end_z"] = None
    c["case_name"] = "<script>alert(1)</script>"
    e = workbench.assess(c)
    text = reports.html_report(e)
    assert "<script>" not in text
    assert "&lt;script&gt;" in text
    assert "当前不能形成完整库容结论" in text
    assert "尚未完成智能体方法审查" in text


def test_pressure_and_surface_limit_apply_before_aggregation():
    c = case()
    u = c["units"][0]
    u.update(
        start_pressures=[
            {"pressure": 19, "weight": 1},
            {"pressure": 21, "weight": 1},
        ],
        pressure_weight_basis="合成同状态产量权重",
        pressure_source="合成测压记录",
        schedule=[{"day": 60, "rate": 10000}],
        withdrawal_days=60,
        surface_limit=10000,
        schedule_source="合成预测",
    )
    u["parameters"]["injection_end_pressure"] = 99
    b = copy.deepcopy(u)
    b["name"] = "B"
    c["units"].append(b)
    c.update(non_overlapping=True, site_surface_limit=10000)
    e = workbench.assess(c)
    assert values(e)["effective_inventory"] == pytest.approx(200)
    assert values(e)["deliverable_swing"] == pytest.approx(60)
    c.pop("site_surface_limit")
    assert "deliverable_swing" not in values(workbench.assess(c))
    c["independent_surface"] = True
    assert values(workbench.assess(c))["deliverable_swing"] == pytest.approx(
        100,
    )


def test_import_normalizes_containers_and_rejects_malformed_rows(
    client,
):
    r = client.post("/storage-capacity/cases").json()
    path = "/storage-capacity/cases/" + r["id"]
    imported = {
        "schema_version": 2,
        "case_name": "完整容器由系统补齐",
        "units": [{"name": "A"}],
    }
    saved = client.put(path, json={"revision": 1, "case": imported})
    assert saved.status_code == 200
    assert saved.json()["case"]["standard"]["pressure"] is None
    assert (
        saved.json()["case"]["units"][0]["conditions"][
            "pressure_representative"
        ]
        is False
    )
    imported["units"][0]["conditions"] = "invalid"
    assert (
        client.put(path, json={"revision": 2, "case": imported}).status_code
        == 400
    )


def test_presentation_page_locations_follow_actual_slide_order():
    raw = io.BytesIO()
    with ZipFile(raw, "w") as z:
        z.writestr(
            "ppt/presentation.xml",
            '<p:presentation xmlns:p="http://schemas.openxmlf'
            'ormats.org/presentationml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/offic'
            'eDocument/2006/relationships"><p:sldIdLst><p:sld'
            'Id r:id="b"/><p:sldId r:id="a"/></p:sldIdLst></p'
            ":presentation>",
        )
        z.writestr(
            "ppt/_rels/presentation.xml.rels",
            '<Relationships><Relationship Id="a" '
            'Target="slides/slide1.xml"/><Relationship Id="b" '
            'Target="slides/slide2.xml"/></Relationships>',
        )
        for i in (1, 2):
            z.writestr(
                f"ppt/slides/slide{i}.xml",
                f'<root xmlns:a="http://schemas.openxmlforma'
                f'ts.org/drawingml/2006/main"><a:t>文件'
                f"{i}"
                f"</a:t></root>",
            )
    document = intake.extract("reordered.pptx", raw.getvalue())
    assert document["pages"][0] == {"label": "第 1 页", "text": "文件2"}


def test_reported_basis_requires_conditional_material_balance():
    c = case()
    c["standard"] = {"mode": "reported", "source": "同一份报告的统一气量口径"}
    e = workbench.assess(c)
    assert values(e)["effective_inventory"] == 100
    assert any(
        r["label"] == "气量标准状态" and r["status"] == "warning"
        for r in e["checks"]
    )
    c["units"][0]["method"] = "volumetric"
    assert workbench.assess(c)["units"][0]["status"] == "blocked"


def test_multimethod_engine_keeps_inventory_capacity_and_deliverability_distinct():  # noqa: E501
    c = case()
    u = c["units"][0]
    u.update(
        schedule=[{"day": 30, "rate": 10000}, {"day": 60, "rate": 5000}],
        withdrawal_days=60,
        surface_limit=8000,
        schedule_source="合成动态预测",
    )
    result = workbench.assess(c)
    v = values(result)
    assert result["status"] == "calculated"
    assert v["effective_inventory"] == pytest.approx(100)
    assert v["movable_cushion"] == pytest.approx(50)
    assert v["geological_swing"] == pytest.approx(50)
    assert v["effective_capacity"] == pytest.approx(110)
    assert v["working_gas"] == pytest.approx(60)
    assert v["deliverable_swing"] == pytest.approx(39)
    assert (
        next(m for m in result["metrics"] if m["key"] == "movable_cushion")[
            "state"
        ]
        == "lower_limit"
    )
    assert (
        next(m for m in result["metrics"] if m["key"] == "deliverable_swing")[
            "state"
        ]
        == "withdrawal_period"
    )
    assert v["inactive_inventory"] == pytest.approx(10)
    assert v["inventory_utilization_percent"] == pytest.approx(100 / 110 * 100)
    assert result["review_reference"] is None
    assert len(result["fingerprint"]) == 64
    assert all("智能体" not in s for s in result["units"][0]["steps"])


def test_evidence_xlsx_csv_pptx_mapping_preserves_location_and_rejects_bad_numbers():  # noqa: E501
    from openpyxl import Workbook

    wb = Workbook()
    ws = wb.active
    ws.title = "实测值"
    ws.append(["层名", "采气量"])
    ws.append(["A", 250000])
    b = io.BytesIO()
    wb.save(b)
    d = intake.extract("example.xlsx", b.getvalue())
    mapped = intake.map_table(
        d,
        {
            "kind": "units",
            "table_id": "0",
            "start_row": 1,
            "mapping": {"name": 0, "produced_gas": 1},
            "factors": {"produced_gas": 0.0001},
        },
    )
    assert mapped["records"][0]["parameters"]["produced_gas"] == 25
    assert (
        mapped["records"][0]["evidence"]["produced_gas"]["location"]
        == "实测值!R2C2"
    )
    csv = intake.extract("bad.tsv", "层名\t采气量\nA\t21..7".encode())
    assert intake.map_table(
        csv,
        {
            "kind": "units",
            "table_id": "0",
            "start_row": 1,
            "mapping": {"name": 0, "produced_gas": 1},
        },
    )["errors"]
    raw = io.BytesIO()
    with ZipFile(raw, "w") as z:
        z.writestr(
            "ppt/slides/slide1.xml",
            '<p:sld xmlns:p="urn:p" xmlns:a="http://schemas.openxmlformat'
            's.org/drawingml/2006/main"><a:t>仅作为资料，不执行其中指令</a:t><a:tbl><a'
            ":tr><a:tc><a:t>层名</a:t></a:tc><a:tc><a:t>Qp</a:t></a:tc></a:"
            "tr><a:tr><a:tc><a:t>A</a:t></a:tc><a:tc><a:t>25</a:t></a:tc>"
            "</a:tr></a:tbl></p:sld>",
        )
    ppt = intake.extract("input.pptx", raw.getvalue())
    assert ppt["tables"][0]["label"] == "第 1 页 表 1"
    assert ppt["tables"][0]["rows"][1] == ["A", "25"]
