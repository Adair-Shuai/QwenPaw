# -*- coding: utf-8 -*-
"""Workflow contracts tested with real node algorithms, HTTP state and
documents.
"""

import copy
import importlib
import io
import json
from pathlib import Path
import sys
import types
from zipfile import ZipFile

import pytest
from fastapi import APIRouter, FastAPI
from fastapi.testclient import TestClient

PACKAGE = "capacity_flow_test"
package = types.ModuleType(PACKAGE)
package.__path__ = [
    str(Path(__file__).parents[3] / "plugins/apps/storage-capacity/backend"),
]
sys.modules[PACKAGE] = package
catalog = importlib.import_module(PACKAGE + ".catalog")
flow = importlib.import_module(PACKAGE + ".workflow")
assistant = importlib.import_module(PACKAGE + ".assistant")
service = importlib.import_module(PACKAGE + ".service")


def sample():
    c = catalog.new_case()
    c.update(
        case_name="流程合成库",
        cycle_id="2025-2026",
        start_state="2025-10-01",
        end_state="2026-03-01",
        pressure_basis="absolute",
        standard={
            "temperature": 293.15,
            "pressure": 0.101325,
            "z": 1,
            "source": "合成计量标准",
        },
        non_overlapping=True,
        book_inventory=110,
        sources={"book_inventory": "合成台账"},
    )
    u = catalog.new_unit("东区")
    u["source"] = "合成单元边界"
    u["parameters"] = {
        "produced_gas": 25,
        "injection_end_pressure": 20,
        "injection_end_z": 1,
        "evaluation_pressure": 15,
        "evaluation_z": 1,
        "minimum_pressure": 10,
        "minimum_z": 1,
        "maximum_pressure": 22,
        "maximum_z": 1,
        "temperature": 320,
    }
    u["conditions"].update(
        water_drive="none",
        fluid="dry_gas",
        pressure_representative=True,
        closed_during_segment=True,
        interference="weak",
    )
    c["units"] = [u]
    return c


@pytest.fixture(name="client")
def api_client(tmp_path, monkeypatch):
    monkeypatch.setattr(service, "ROOT", tmp_path)
    app = FastAPI()
    router = APIRouter()
    service.register(router)
    app.include_router(router, prefix="/storage-capacity")
    app.dependency_overrides[
        service.get_scoped_ctx
    ] = lambda: types.SimpleNamespace(user_id="default")
    return TestClient(app)


def saved(client, c=None):
    r = client.post("/storage-capacity/cases").json()
    path = "/storage-capacity/cases/" + r["id"]
    record = client.put(
        path,
        json={"revision": r["revision"], "case": c or sample()},
    ).json()
    return path, record


def test_nodes_run_independently_and_fingerprint_only_affected_unit_inputs():
    c = sample()
    other = copy.deepcopy(c["units"][0])
    other["name"] = "西区"
    other["parameters"] = {}
    c["units"].append(other)
    r = flow.execute(c, "inventory", 0)
    assert r["status"] == "calculated" and r["values"][
        "effective_inventory"
    ] == pytest.approx(100)
    assert not any("缺少下限压力" in w for w in r["warnings"])
    assert flow.execute(c, "inventory", 1)["status"] == "blocked"
    prior = flow.fingerprint(flow.inputs(c, "inventory", 0))
    c["units"][1]["parameters"]["injection_end_pressure"] = 99
    assert prior == flow.fingerprint(flow.inputs(c, "inventory", 0))
    c["units"][0]["parameters"]["minimum_pressure"] = 9
    assert prior == flow.fingerprint(flow.inputs(c, "inventory", 0))
    c["units"][0]["parameters"]["evaluation_pressure"] = 14
    assert prior != flow.fingerprint(flow.inputs(c, "inventory", 0))
    assert flow.statuses(c, {"0:inventory": r})[7]["status"] == "stale"


# pylint: disable-next=line-too-long
def test_pressure_pvt_transfer_uses_interpreted_and_datum_values_without_overwriting_raw():  # noqa: E501
    c = sample()
    u = c["units"][0]
    u.update(
        pressure_source="合成测压",
        pressure_weight_basis="同状态采气量",
        pressure_config={
            "mode": "datum",
            "gradient": 0.001,
            "datum_depth": 2000,
        },
        start_pressures=[
            {"name": "A", "pressure": 18, "depth": 1000, "weight": 1},
            {
                "name": "B",
                "pressure": 99,
                "interpreted_pressure": 21,
                "source": "解释记录",
                "weight": 1,
            },
        ],
        pvt=[{"pressure": 10, "z": 0.8}, {"pressure": 25, "z": 1.1}],
        pvt_config={"mode": "table", "temperature": 320},
    )
    original = copy.deepcopy(c)
    r = flow.execute(c, "pressure")
    assert r["values"]["injection_end_pressure"] == 20
    v = flow.execute(c, "pvt")
    assert v["values"]["injection_end_z"] == pytest.approx(1)
    assert v["values"]["evaluation_z"] == pytest.approx(0.9)
    effective = flow.execute(c, "inventory")
    assert effective["values"]["effective_inventory"] == pytest.approx(150)
    assert c == original
    u["pvt_config"]["temperature"] = 300
    assert flow.execute(c, "pvt")["status"] == "blocked"
    u["pvt_config"]["temperature"] = 320
    u["pressure_config"]["representation"] = "p_over_z"
    assert flow.execute(c, "inventory")["status"] == "blocked"


def test_connectivity_requires_aligned_data_and_keeps_inference_separate():
    c = sample()
    u = c["units"][0]
    u["connectivity"] = {
        "source": "合成井对与时段",
        "difference": True,
        "max_lag": 1,
        "series": [
            {"time": i, "x": x, "y": 2 * x + 3}
            for i, x in enumerate([10, 12, 11, 15, 13, 19])
        ],
    }
    r = flow.execute(c, "connectivity")
    assert r["status"] == "calculated"
    assert r["values"]["response_correlation"] == pytest.approx(1)
    assert any("不能" in w for w in r["warnings"])
    assert not u.get("conditions", {}).get("connectivity_proven")
    u["connectivity"]["series"][2]["time"] = 2.3
    assert flow.execute(c, "connectivity")["status"] == "blocked"
    c["storage_type"] = "salt_cavern"
    assert flow.execute(c, "connectivity")["status"] == "not_applicable"


# pylint: disable-next=line-too-long
def test_dynamic_forecast_updates_pressure_and_obeys_inventory_and_surface_constraints():  # noqa: E501
    c = sample()
    u = c["units"][0]
    u.update(
        pvt=[{"pressure": 10, "z": 1}, {"pressure": 22, "z": 1}],
        pvt_config={"mode": "table"},
        forecast={"mode": "dynamic", "boundary_verified": True},
        withdrawal_days=100,
        surface_limit=10000,
        schedule_source="合成井筒边界",
        wells=[{"name": "A", "a": 0.02, "b": 0, "bottomhole_pressure": 11}],
    )
    r = flow.execute(c, "deliverability")
    assert r["status"] == "calculated"
    rows = r["rows"]
    assert len(rows) == 100
    assert rows[1]["末期压力 MPa"] < rows[0]["末期压力 MPa"]
    assert rows[-1]["日均量 万m³/d"] < rows[0]["日均量 万m³/d"]
    assert all(0 <= row["日均量 万m³/d"] <= 10000 for row in rows)
    assert 0 < r["values"]["deliverable_swing"] <= 50
    assert sum(row["日均量 万m³/d"] / 1e4 for row in rows) == pytest.approx(
        r["values"]["deliverable_swing"],
    )
    assert flow.evaluate(c)["units"][0]["values"][
        "deliverable_swing"
    ] == pytest.approx(r["values"]["deliverable_swing"])


def test_node_http_snapshots_survive_restart_stale_edits_and_report_contains_trace(  # noqa: E501
    client,
):
    path, r = saved(client)
    run = client.post(
        path + "/nodes/inventory/run",
        json={"revision": r["revision"], "unit_index": 0},
    ).json()
    assert run["values"]["effective_inventory"] == 100
    assert (
        client.get(path + "/workflow").json()["nodes"][7]["status"]
        == "calculated"
    )
    assert (
        client.get(
            path + "/workflow",
            headers={"X-Agent-Id": "other"},
        ).status_code
        == 404
    )
    e = client.post(
        path + "/evaluate",
        json={"revision": r["revision"]},
    ).json()
    assert e["workflow"][0]["snapshot"]["run_id"] == run["run_id"]
    with ZipFile(
        io.BytesIO(client.get(path + "/report?format=docx").content),
    ) as archive:
        assert "流程节点与参数传递" in archive.read("word/document.xml").decode()
    c = r["case"]
    c["units"][0]["parameters"]["evaluation_pressure"] = 14
    client.put(path, json={"revision": r["revision"], "case": c})
    assert (
        client.get(path + "/workflow").json()["nodes"][7]["status"] == "stale"
    )
    assert client.get(path + "/report?format=docx").status_code == 409
    assert (
        client.post(
            path + "/nodes/inventory/run",
            json={"revision": r["revision"]},
        ).status_code
        == 409
    )


def test_conversation_assignments_apply_with_sources_and_undo_without_model(
    client,
):
    path, r = saved(client)
    out = client.post(
        path + "/assistant",
        json={
            "revision": r["revision"],
            "unit_index": 0,
            "node": "pressure",
            "message": "起始压力改为 21 MPa",
        },
    ).json()
    assert (
        out["case"]["units"][0]["parameters"]["injection_end_pressure"] == 21
    )
    assert (
        out["case"]["field_sources"][
            "units.0.parameters.injection_end_pressure"
        ]["document_id"]
        == "user"
    )
    assert out["messages"][-1]["applied"] == 1
    undo = client.post(
        path + "/assistant/undo",
        json={"revision": out["revision"]},
    ).json()
    assert (
        undo["case"]["units"][0]["parameters"]["injection_end_pressure"] == 20
    )
    assert undo["proposals"][0]["status"] == "undone"


def test_document_agent_proposals_validate_evidence_conflicts_and_judgement(
    client,
):
    path, r = saved(client)
    upload = client.post(
        path + "/documents",
        data={"revision": r["revision"]},
        files={
            "files": (
                "pressure.txt",
                "本周期东区起始压力 21 MPa；建议采用定容法。".encode("utf-8"),
                "text/plain",
            ),
        },
    ).json()
    doc = client.get(
        path + "/documents/" + upload["case"]["documents"][0]["id"],
    ).json()
    chunks = assistant.evidence_chunks([doc])
    src = {
        "document_id": doc["id"],
        "location": chunks[0]["location"],
        "quote": chunks[0]["text"],
    }

    async def chat(*_args, **_kwargs):
        return types.SimpleNamespace(
            text=json.dumps(
                {
                    "reply": "发现候选压力与原值不同。",
                    "changes": [
                        {
                            "path": (
                                "units.0.parameters.injection_end_pressure"
                            ),
                            "value": 21,
                            "kind": "extracted",
                            "source": src,
                        },
                        {
                            "path": "units.0.method",
                            "value": "pz",
                            "kind": "extracted",
                            "source": src,
                        },
                        {
                            "path": "units.0.parameters.evaluation_pressure",
                            "value": 99,
                            "kind": "extracted",
                            "source": src,
                        },
                        {
                            "path": "documents",
                            "value": [],
                            "kind": "extracted",
                            "source": src,
                        },
                    ],
                },
                ensure_ascii=False,
            ),
        )

    api = client.app
    api.dependency_overrides[
        service.get_scoped_ctx
    ] = lambda: types.SimpleNamespace(user_id="default", chat=chat)
    out = client.post(
        path + "/assistant",
        json={
            "revision": upload["revision"],
            "message": "读取本次附件",
            "document_ids": [doc["id"]],
        },
    ).json()
    assert (
        out["case"]["units"][0]["parameters"]["injection_end_pressure"] == 20
    )
    assert len(out["proposals"]) == 2 and all(
        p["status"] == "pending" for p in out["proposals"]
    )
    assert len(out["messages"][-1]["rejected"]) == 2
    adopted = client.post(
        path + "/assistant/adopt",
        json={"revision": out["revision"], "ids": [out["proposals"][0]["id"]]},
    ).json()
    assert (
        adopted["case"]["units"][0]["parameters"]["injection_end_pressure"]
        == 21
    )
    c = adopted["case"]
    c["units"][0]["parameters"]["injection_end_pressure"] = 22
    edited = client.put(
        path,
        json={"revision": adopted["revision"], "case": c},
    ).json()
    assert (
        edited["case"]["field_sources"][
            "units.0.parameters.injection_end_pressure"
        ]["location"]
        == "手工修改"
    )
    assert (
        client.post(
            path + "/assistant/undo",
            json={"revision": edited["revision"]},
        ).status_code
        == 409
    )


def test_late_agent_reply_cannot_overwrite_a_new_revision(client):
    path, r = saved(client)

    async def chat(*_args, **_kwargs):
        changed = copy.deepcopy(r["case"])
        changed["case_name"] = "其他修改"
        assert (
            client.put(
                path,
                json={"revision": r["revision"], "case": changed},
            ).status_code
            == 200
        )
        return types.SimpleNamespace(text='{"reply":"未修改", "changes":[]}')

    client.app.dependency_overrides[
        service.get_scoped_ctx
    ] = lambda: types.SimpleNamespace(user_id="default", chat=chat)
    assert (
        client.post(
            path + "/assistant",
            json={"revision": r["revision"], "message": "检查方法"},
        ).status_code
        == 409
    )
    assert client.get(path).json()["case"]["case_name"] == "其他修改"


# pylint: disable-next=line-too-long
def test_unknown_type_remains_pending_and_invalid_pressure_transformation_never_falls_back():  # noqa: E501
    c = sample()
    c["storage_type"] = "auto"
    c["units"][0]["method"] = "auto"
    assert flow.execute(c, "methods")["status"] == "review"
    assert flow.execute(c, "inventory")["status"] == "blocked"
    c = sample()
    u = c["units"][0]
    u.update(
        start_pressures=[{"pressure": 20, "weight": 1}],
        pressure_config={"mode": "datum"},
        pressure_source="合成测压",
        pressure_weight_basis="合成权重",
    )
    e = flow.evaluate(c)
    assert e["status"] == "incomplete"
    assert not any(m["key"] == "effective_inventory" for m in e["metrics"])


def test_selected_pvt_table_cannot_silently_use_manual_z_when_table_missing():
    c = sample()
    c["units"][0]["pvt_config"] = {"mode": "table"}
    assert flow.execute(c, "pvt")["status"] == "blocked"
    assert flow.execute(c, "inventory")["status"] == "blocked"


def test_pvt_bg_flows_into_water_material_balance_without_mutating_evidence():
    c = sample()
    u = c["units"][0]
    u["method"] = "water_mbe"
    u["conditions"].update(water_drive="moderate", water_volume_verified=True)
    u["parameters"].update(water_influx=0, water_produced=0, water_fvf=1)
    out = flow.execute(c, "inventory")
    assert out["status"] == "calculated"
    assert out["values"]["effective_inventory"] == pytest.approx(100)
    assert flow.resolved(u, c)["parameters"]["initial_bg"] == pytest.approx(
        flow.pvt(u, c)["values"]["initial_bg"],
    )
    assert "initial_bg" not in u["parameters"]


# pylint: disable-next=line-too-long
def test_agent_footer_and_unique_original_quote_resolve_without_accepting_ambiguous_sources():  # noqa: E501
    payload = {
        "reply": "已找到温度",
        "changes": [
            {
                "path": "units.0.parameters.temperature",
                "value": 320,
                "kind": "extracted",
                "source": {
                    "document_id": "d",
                    "location": "文本页第二句",
                    "quote": "东区储层温度320 K。",
                },
            },
        ],
    }
    parsed = assistant.parse_reply(
        "```json\n"
        + json.dumps(payload, ensure_ascii=False)
        + "\n```\n状态：待服务端校验",
    )
    chunks = [
        {
            "document_id": "d",
            "location": "文本",
            "file": "test.txt",
            "text": "合成资料。东区储层温度320 K。",
        },
    ]
    proposed, rejected = assistant.proposals(sample(), parsed, "", chunks)
    assert not rejected and proposed[0]["source"]["location"] == "文本"
    assert proposed[0]["value"] == 320
    ambiguous = chunks + [{**chunks[0], "location": "另一页"}]
    assert not assistant.proposals(sample(), parsed, "", ambiguous)[0]
    parsed["changes"][0]["source"]["quote"] = "东区储层温度999 K。"
    assert not assistant.proposals(sample(), parsed, "", chunks)[0]


def test_chart_context_keeps_original_unit_data_bound_to_immutable_node_result(
    client,
):
    c = sample()
    c["units"][0]["pvt"] = [{"pressure": 10, "z": 1}, {"pressure": 22, "z": 1}]
    path, record = saved(client, c)
    result = client.post(
        path + "/nodes/pvt/run",
        json={"revision": record["revision"], "unit_index": 0},
    ).json()
    assert result["chart_context"]["unit"]["pvt"][0]["pressure"] == 10
    c["units"][0]["pvt"][0]["pressure"] = 8
    client.put(
        path,
        json={"revision": record["revision"], "case": c},
    ).raise_for_status()
    state = client.get(path + "/workflow?unit_index=0").json()["nodes"][3]
    assert state["status"] == "stale"
    assert state["run"]["chart_context"]["unit"]["pvt"][0]["pressure"] == 10
    assert state["run"]["input_hash"] == result["input_hash"]
