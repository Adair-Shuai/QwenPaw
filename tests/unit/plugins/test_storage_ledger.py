"""Mounted ledger endpoints with in-memory synthetic source workbooks."""

import importlib.util
import io
import sys
import types
from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient
from openpyxl import Workbook, load_workbook


def mounted(monkeypatch, tmp_path):
    root = Path(__file__).resolve().parents[3] / "plugins/apps/storage-ledger"
    package = types.ModuleType("ledger_test_app")
    package.__path__ = [str(root)]
    monkeypatch.setitem(sys.modules, package.__name__, package)
    spec = importlib.util.spec_from_file_location(
        "ledger_test_app.entry", root / "backend/main.py"
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    monkeypatch.setattr(module, "ROOT", tmp_path)
    api = FastAPI()
    api.include_router(module.router)
    return TestClient(api)


def test_import_review_reconcile_and_preserve_source(monkeypatch, tmp_path):
    client = mounted(monkeypatch, tmp_path)
    raw = client.get("/sample").content

    def upload():
        return client.post("/imports", files={"file": ("demo.xlsx", raw)}).json()

    attached = client.post(
        "/attachments", files={"file": ("demo.xlsx", raw)}, data={"category": "原表"}
    ).json()
    batch = upload()
    assert batch["id"] == attached["id"] and batch["kind"] == "production"
    assert batch["count"] == 4 and not batch["duplicate"]
    src = batch["id"]
    before = client.get("/workspace").json()
    assert before["block_row"] == 2
    assert before["balance"]["pending"] == 1 and before["balance"]["prod"] == 4
    row = before["issues"][0]
    choice = {
        "src": src,
        "day": row["day"],
        "well": row["well"],
        "row_no": 2,
        "previous": None,
        "note": "已核对原件",
    }
    assert client.post("/reviews", json={**choice, "row_no": 4}).status_code == 409
    assert client.post("/reviews", json=choice).status_code == 200
    assert client.post("/reviews", json=choice).status_code == 409
    assert upload() == {**batch, "duplicate": True}
    after = client.get("/workspace", params={"well": row["well"]}).json()
    assert after["balance"]["prod"] == after["balance"]["block_prod"] == 10
    assert after["balance"]["pending"] == 0 and not after["gaps"]
    assert len(after["history"]) == 2 and after["audit"][0]["note"] == "已核对原件"
    assert client.get(f"/sources/{src}").content == raw
    assert not client.get("/workspace", headers={"X-Agent-Id": "other"}).json()[
        "sources"
    ]
    assert (
        client.get(f"/sources/{src}", headers={"X-Agent-Id": "other"}).status_code
        == 404
    )


def test_text_reading_and_failed_import_are_traceable(monkeypatch, tmp_path):
    client = mounted(monkeypatch, tmp_path)
    book = load_workbook(io.BytesIO(client.get("/sample").content))

    def upload():
        stream = io.BytesIO()
        book.save(stream)
        return client.post(
            "/imports", files={"file": ("readings.xlsx", stream.getvalue())}
        )

    book["单井"]["F2"] = "12–13"
    assert upload().status_code == 200
    data = client.get("/workspace").json()
    assert data["daily"][0]["tubing"] is None
    assert data["reading_notes"][0]["value"] == "12–13"
    assert data["reading_notes"][0]["row_no"] == 2
    book["单井"]["E1"] = "日采气量（亿方）"
    assert upload().status_code == 422
    assert len(client.get("/workspace").json()["sources"]) == 1


def test_casing_and_surface_sources_reach_well_archive(monkeypatch, tmp_path):
    client = mounted(monkeypatch, tmp_path)

    def submit(book):
        stream = io.BytesIO()
        book.save(stream)
        response = client.post(
            "/imports", files={"file": ("合成台账.xlsx", stream.getvalue())}
        )
        assert response.status_code == 200, response.text
        return response.json()["count"]

    cards = Workbook()
    for i, cement in enumerate(["水泥返深", "水泥返深(m)"], 1):
        sheet = cards.active if i == 1 else cards.create_sheet()
        sheet.title = f"W{i}"
        sheet.append([f"W{i}井完井数据卡片"])
        sheet.append(["套管名称", "外径(mm)", "下深(m)", cement, "固井质量"])
        sheet.append(["表层套管", 200, 500, "地面", "合格"])
    assert submit(cards) == 2
    pipes = Workbook()
    pipes.active.append(
        [
            "管道编号",
            "管道名称",
            "管线起点",
            "管线终点",
            "管线长度(km)",
            "管道外径(mm)",
            "管线设计压力(MPa)",
        ]
    )
    pipes.active.append(["01", "测试管线", "井场", "站A", 1.5, 200, 10])
    assert submit(pipes) == 1
    archive = client.get("/workspace", params={"well": "W2"}).json()
    assert archive["archive_wells"] == ["W1", "W2"]
    assert (
        archive["casing"][0]["depth"] == "500" and archive["casing"][0]["row_no"] == 3
    )
    assert archive["pipes"][0]["code"] == "01"


def test_projects_isolate_restore_and_archive_without_touching_original(
    monkeypatch, tmp_path
):
    client = mounted(monkeypatch, tmp_path)
    assert client.get("/projects").json() == []
    sample = client.get("/sample").content
    # Simulate the pre-project API writing into the original agent-scoped ledger.
    client.post(
        "/imports", files={"file": ("呼图壁-合成.xlsx", sample)}
    ).raise_for_status()
    (legacy,) = client.get("/projects").json()
    assert legacy["id"] == "legacy" and legacy["name"] == "呼图壁储气库"
    p = client.post("/projects", json={"name": "项目 B", "region": "西区"}).json()
    h = {"X-Ledger-Project": p["id"]}
    assert client.get("/workspace", headers=h).json()["sources"] == []
    assert (
        client.get("/workspace", headers={**h, "X-Agent-Id": "another"}).status_code
        == 404
    )
    data = {"well": "W1", "day": "2025-01-01", "prod": 3, "hours": 12}
    add = client.post(
        "/records/daily",
        headers=h,
        json={"action": "add", "reason": "日报", "values": data},
    ).json()
    assert add["record_id"] == 1
    src = add["src"]
    edit = {
        **add,
        "action": "edit",
        "reason": "计量订正",
        "values": {**data, "prod": 5},
    }
    result = client.post("/records/daily", headers=h, json=edit)
    result.raise_for_status()
    assert client.post("/records/daily", headers=h, json=edit).status_code == 409
    assert client.get("/workspace", headers=h).json()["balance"]["prod"] == 5
    assert "5.0" in client.get("/exports/daily?search=W1", headers=h).content.decode(
        "utf-8-sig"
    )
    rows = client.get("/records/daily?search=W1", headers=h).json()
    assert rows["count"] == 1 and len(rows["history"]) == 2
    remove = client.post(
        "/records/daily",
        headers=h,
        json={**result.json(), "action": "remove", "reason": "复核"},
    ).json()
    assert client.get("/workspace", headers=h).json()["period"]["days"] == 0
    client.post(
        "/records/daily",
        headers=h,
        json={**remove, "action": "undo", "reason": "恢复原值"},
    ).raise_for_status()
    attach = client.post(
        "/attachments",
        headers=h,
        files={"file": ("测试报告.txt", b"source")},
        data={"well": "W1", "category": "井筒资料"},
    ).json()
    backup = client.get("/projects/" + p["id"] + "/backup")
    restored = client.post(
        "/projects/restore", files={"file": ("copy.ugsdb", backup.content)}
    )
    restored.raise_for_status()
    h2 = {"X-Ledger-Project": restored.json()["id"]}
    assert h2 != h
    assert client.get("/workspace", headers=h2).json()["balance"]["prod"] == 5
    assert client.get(f"/sources/{attach['id']}", headers=h2).content == b"source"
    assert len(client.get("/records/daily", headers=h2).json()["history"]) == 4
    client.patch(
        "/projects/" + p["id"], json={**p, "archived": True}
    ).raise_for_status()
    assert (
        client.post(
            "/records/pipe",
            headers=h,
            json={
                "action": "add",
                "reason": "录入",
                "values": {"name": "支线", "code": "001"},
            },
        ).status_code
        == 409
    )
    assert client.get("/workspace").json()["issues"][0]["selected"] is None
    assert (
        client.post(
            "/projects/restore", files={"file": ("bad.ugsdb", b"not a project")}
        ).status_code
        == 422
    )
    assert len(client.get("/projects").json()) == 3


def test_edited_raw_reading_and_source_retirement(monkeypatch, tmp_path):
    client = mounted(monkeypatch, tmp_path)
    book = load_workbook(io.BytesIO(client.get("/sample").content))
    book["单井"]["F2"] = "12~13"
    stream = io.BytesIO()
    book.save(stream)
    source = client.post(
        "/imports", files={"file": ("sample.xlsx", stream.getvalue())}
    ).json()["id"]
    row = next(
        r for r in client.get("/records/daily").json()["rows"] if r["row_no"] == 2
    )
    payload = {"day": row["day"], "well": row["well"], "prod": 7, "tubing": 12.5}
    c = client.post(
        "/records/daily",
        json={
            "src": source,
            "action": "edit",
            "record_id": row["record_id"],
            "values": payload,
            "reason": "复测",
        },
    ).json()
    assert client.get("/workspace").json()["notes_count"] == 0
    client.post(
        "/records/daily", json={**c, "action": "undo", "reason": "调回原表"}
    ).raise_for_status()
    assert client.get("/workspace").json()["notes_count"] == 1
    client.patch(f"/sources/{source}", json={"archived": True}).raise_for_status()
    assert client.get("/workspace").json()["src"] is None
    client.patch(f"/sources/{source}", json={"archived": False}).raise_for_status()
    assert client.get("/workspace").json()["src"] == source
    assert client.get(f"/sources/{source}").content == stream.getvalue()


def test_editions_merge_by_well_day_with_original_lineage(monkeypatch, tmp_path):
    client = mounted(monkeypatch, tmp_path)
    raw = client.get("/sample").content
    first = client.post("/imports", files={"file": ("first.xlsx", raw)}).json()["id"]
    book = load_workbook(io.BytesIO(raw))
    sheet = book["单井"]
    sheet.delete_rows(2, 2)  # Only update well B, preserve both candidates for well A.
    sheet["E2"] = 10
    sheet.append(["2025-01-02", "示例井B", 24, None, 3, 10, 9, "新增日期"])
    book["区块"]["D2"] = 16
    book["区块"].append(["2025-01-02", "采气", None, 3])
    stream = io.BytesIO()
    book.save(stream)
    second = client.post(
        "/imports", files={"file": ("second.xlsx", stream.getvalue())}
    ).json()["id"]
    payload = {"sources": [first, second], "name": "两期汇编"}
    result = client.post("/editions", json=payload)
    result.raise_for_status()
    src = result.json()["src"]
    assert result.json()["count"] == 6
    assert client.post("/editions", json=payload).json()["src"] == src
    merged = client.get("/workspace", params={"src": src, "day": "2025-01-01"}).json()
    assert len(merged["daily"]) == 3 and merged["balance"]["pending"] == 1
    assert merged["balance"]["prod"] == 10 and merged["balance"]["block_prod"] == 16
    assert merged["period"]["days"] == 2
    rows = client.get(
        "/records/daily", params={"src": src, "search": "示例井B"}
    ).json()["rows"]
    assert all("second.xlsx" in r["origin"] for r in rows)
    assert client.get(f"/sources/{first}").content == raw


def test_engineering_objects_read_original_coordinates_and_link_exact_endpoints(
    monkeypatch, tmp_path
):
    client = mounted(monkeypatch, tmp_path)

    def submit(book, name):
        out = io.BytesIO()
        book.save(out)
        response = client.post("/imports", files={"file": (name, out.getvalue())})
        assert response.status_code == 200, response.text
        return response.json()["id"]

    master = Workbook()
    master.active.title = "单井基础数据（含观察井）"
    master.active.append(
        ["井号", "井ID", "井别", "站库", "管线名称", "井口坐标X", "井口坐标y"]
    )
    for well, x, y in [
        ("W1", 10, 20),
        ("W2", 31, 43),
        ("W2", 33, 43),
        ("W3", None, 20),
    ]:
        master.active.append([well, "ID-" + well, "观察井", "库区", "P1", x, y])
    src = submit(master, "井位.xlsx")
    pipes = Workbook()
    pipes.active.append(
        [
            "管道编号",
            "管道名称",
            "管线起点",
            "管线终点",
            "管线长度(km)",
            "管道外径(mm)",
            "管线设计压力(MPa)",
        ]
    )
    pipes.active.append(["P1", "一号支线", "W1井井场", "1#集配站", 1.4, 200, 12])
    pipes.active.append(["P2", "二号支线", "W11井井场", "1号集配站", 1.1, 180, 10])
    submit(pipes, "管线.xlsx")
    index = client.get("/objects").json()
    wells = {w["name"]: w for w in index["wells"]}
    assert wells["W1"]["xy"] == [10, 20]
    assert wells["W2"]["xy"] is None and wells["W2"]["coordinate_conflict"]
    assert wells["W3"]["xy"] is None and not wells["W3"]["coordinate_conflict"]
    assert index["stations"] == ["1号集配站"]
    assert index["pipes"][0]["start_node"] == {"type": "well", "name": "W1"}
    assert index["pipes"][1]["start_node"]["type"] == "endpoint"
    assert (
        client.get("/trace/master", params={"src": src, "row_no": 2}).json()["line"]
        == 2
    )
    item = client.get("/records/master").json()["rows"]
    row = next(r for r in item if r["well"] == "W1")
    response = client.post(
        "/records/master",
        json={
            "src": src,
            "record_id": row["record_id"],
            "revision": 0,
            "action": "edit",
            "values": {"well": "RENAMED"},
            "reason": "修订井标识",
        },
    )
    assert response.status_code == 200, response.text
    changed = client.get("/objects").json()
    assert next(w for w in changed["wells"] if w["name"] == "RENAMED")["xy"] is None
    assert (
        client.get("/objects", headers={"X-Agent-Id": "isolated"}).json()["wells"] == []
    )


def test_engineering_series_respects_review_calendar_null_zero_and_lineage(
    monkeypatch, tmp_path
):
    client = mounted(monkeypatch, tmp_path)
    book = load_workbook(io.BytesIO(client.get("/sample").content))
    book["单井"].append(["2025-01-03", "示例井B", 24, 0, 0, "12–13", 4, ""])
    book["区块"].append(["2025-01-03", "停井", 0, 0])

    def submit(name):
        out = io.BytesIO()
        book.save(out)
        return client.post("/imports", files={"file": (name, out.getvalue())}).json()[
            "id"
        ]

    a = submit("日报一.xlsx")
    params = [("well", "示例井A"), ("well", "示例井B"), ("src", a), ("span", 0)]
    result = client.get("/series", params=params).json()
    assert (result["start"], result["end"]) == ("2025-01-01", "2025-01-03")
    pending = result["series"]["示例井A"][0]
    assert (
        pending["candidates"] == [2, 3]
        and pending["row_no"] is None
        and pending["prod"] is None
    )
    last = result["series"]["示例井B"][1]
    assert last["prod"] == 0 and last["tubing"] is None and last["row_no"] == 5
    one = client.get(
        "/series", params={"well": "示例井B", "src": a, "span": 1, "end": "2025-01-02"}
    ).json()
    assert one["start"] == "2025-01-02" and one["series"]["示例井B"] == []
    assert client.post(
        "/reviews",
        json={
            "src": a,
            "day": "2025-01-01",
            "well": "示例井A",
            "row_no": 3,
            "previous": None,
            "note": "核对原件",
        },
    ).is_success
    assert (
        client.get("/series", params=params).json()["series"]["示例井A"][0]["prod"] == 5
    )
    book["单井"]["H5"] = "第二份日报"
    b = submit("日报二.xlsx")
    edition = client.post(
        "/editions", json={"sources": [a, b], "name": "合并日报"}
    ).json()["src"]
    day = client.get(
        "/series", params={"src": edition, "well": "示例井B", "span": 1}
    ).json()["series"]["示例井B"][0]
    trace = client.get(
        "/trace/daily", params={"src": edition, "row_no": day["row_no"]}
    ).json()
    assert (trace["source"]["id"], trace["sheet"], trace["line"]) == (b, "单井", 5)
    assert trace["raw"]["油压mpa"] == "12–13"
    assert (
        client.get(
            "/trace/daily",
            params={"src": b, "row_no": 5},
            headers={"X-Agent-Id": "other"},
        ).status_code
        == 404
    )
