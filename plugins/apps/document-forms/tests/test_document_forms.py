# -*- coding: utf-8 -*-
"""Real Excel/Word and HTTP lifecycle regressions for document forms."""
import importlib.util
import io
import json
import sys
import types
from pathlib import Path
from zipfile import ZipFile

import pytest
from docx import Document
from fastapi import FastAPI
from fastapi.testclient import TestClient
from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = "document_forms_test_plugin"
package = types.ModuleType(PACKAGE)
package.__path__ = [str(ROOT)]
sys.modules[PACKAGE] = package


def module(name, path):
    spec = importlib.util.spec_from_file_location(
        name,
        path,
        submodule_search_locations=[str(ROOT)],
    )
    result = importlib.util.module_from_spec(spec)
    sys.modules[name] = result
    spec.loader.exec_module(result)
    return result


main = module(PACKAGE, ROOT / "backend/main.py")
engine = sys.modules[PACKAGE + ".backend.engine"]


@pytest.fixture(name="client")
def client_fixture(tmp_path, monkeypatch):
    monkeypatch.setattr(main, "ROOT", tmp_path)
    app = FastAPI()
    app.include_router(main.router, prefix="/api/document-forms")
    with TestClient(app) as test:
        yield test


@pytest.fixture(name="sources")
def source_files():
    result = engine.starter_files()
    book = load_workbook(io.BytesIO(result["变量管理表.xlsx"]))
    values = {
        "project.name": "储气库 A & B <参数> 测试",
        "project.code": "0012",
        "organization.name": "测试单位",
        "contact.name": "张工",
        "contact.phone": "01234567890",
        "dates.issue": "2026-11-01",
        "events.qa_deadline": "2026-11-05T12:00",
        "events.response_deadline": "2026-11-06T12:00",
        "events.negotiation_time": "2026-11-07T09:00",
        "events.location": "会议室",
        "qualification.start_year": "2023",
    }
    for row in book["变量配置"].iter_rows(min_row=2):
        row[2].value = values[row[0].value]
    sheet = book["受邀单位"]
    for i, name in enumerate(["甲单位", "乙单位", "丙单位"], 2):
        sheet.cell(i, 1, name)
        sheet.cell(i, 2, f"2026-11-0{i}T09:00")
        sheet.cell(i, 3, f"2026-11-0{i}T11:00")
    output = io.BytesIO()
    book.save(output)
    result["变量管理表.xlsx"] = output.getvalue()
    return result


def create(client, sources):
    response = client.post(
        "/api/document-forms/cases",
        files={"workbook": ("数据.xlsx", sources["变量管理表.xlsx"])},
    )
    assert response.status_code == 200, response.text
    case = response.json()
    response = client.post(
        f"/api/document-forms/cases/{case['id']}/templates",
        data={"revision": case["revision"]},
        files=[
            ("files", (name, data))
            for name, data in sources.items()
            if name.endswith(".docx")
        ],
    )
    assert response.status_code == 200, response.text
    return response.json()


def test_real_excel_form_review_three_invitations_and_office_output(
    client,
    sources,
):
    case = create(client, sources)
    base = f"/api/document-forms/cases/{case['id']}"
    assert (
        next(f["value"] for f in case["fields"] if f["key"] == "project.code")
        == "0012"
    )
    assert len(case["recipients"]) == 3
    result = client.post(base + "/review", json={"revision": case["revision"]})
    assert result.json()["can_generate"], result.text
    generated = client.post(
        base + "/generate",
        json={
            "revision": case["revision"],
            "review_token": result.json()["review_token"],
            "confirmed": True,
        },
    )
    assert generated.status_code == 200, generated.text
    generation = generated.json()["generations"][0]
    assert len(generation["files"]) == 4
    invite_texts = []
    for f in generation["files"]:
        assert f["preview_url"].startswith("/api/files/preview/")
        response = client.get(
            base + f"/outputs/{generation['id']}/{f['name']}",
        )
        assert response.status_code == 200
        doc = Document(io.BytesIO(response.content))
        text = "\n".join(p.text for p in doc.paragraphs)
        assert "{{" not in text and "{%" not in text
        assert "储气库 A & B <参数> 测试" in text
        assert "2026-11-01" in text
        assert "2026-11-07 09:00" in text
        if f["recipient"] != "共用文件":
            assert f["recipient"] in text
            invite_texts.append(text)
    assert len(set(invite_texts)) == 3
    with ZipFile(
        io.BytesIO(
            client.get(base + f"/outputs/{generation['id']}/全部文书.zip").content,
        ),
    ) as archive:
        assert len(archive.namelist()) == 6
        workbook = load_workbook(io.BytesIO(archive.read("填写数据.xlsx")))
        assert workbook.sheetnames == ["变量配置", "受邀单位", "校核规则", "日期校核"]
        audit = json.loads(archive.read("核对记录.json"))
    assert audit["revision"] == case["revision"]
    assert (
        client.post(
            base + "/generate",
            json={
                "revision": case["revision"],
                "review_token": result.json()["review_token"],
                "confirmed": True,
            },
        ).status_code
        == 409
    )


def test_missing_dates_conflicts_and_review_invalidation(client, sources):
    case = create(client, sources)
    base = f"/api/document-forms/cases/{case['id']}"
    good = client.post(
        base + "/review",
        json={"revision": case["revision"]},
    ).json()
    values = {f["key"]: f["value"] for f in case["fields"]}
    values["dates.issue"] = "2026-12-01"
    values["contact.name"] = ""
    saved = client.put(
        base,
        json={
            "revision": case["revision"],
            "name": "修改后的填报",
            "values": values,
            "recipients": case["recipients"],
        },
    ).json()
    assert (
        client.post(
            base + "/generate",
            json={
                "revision": saved["revision"],
                "review_token": good["review_token"],
                "confirmed": True,
            },
        ).status_code
        == 409
    )
    checked = client.post(
        base + "/review",
        json={"revision": saved["revision"]},
    ).json()
    assert not checked["can_generate"]
    assert any(r["status"] == "error" for r in checked["checks"])
    assert any(
        r["label"] == "联系人" and r["status"] == "missing"
        for r in checked["checks"]
    )
    assert (
        client.put(
            base,
            json={
                "revision": case["revision"],
                "name": "旧页面",
                "values": values,
                "recipients": case["recipients"],
            },
        ).status_code
        == 409
    )


def test_scope_isolation_and_paths(client, sources):
    case = create(client, sources)
    base = f"/api/document-forms/cases/{case['id']}"
    assert (
        client.get(base, headers={"X-Agent-Id": "other-agent"}).status_code
        == 404
    )
    assert (
        client.get(
            "/api/document-forms/cases",
            headers={"X-Agent-Id": "other-agent"},
        ).json()
        == []
    )
    assert (
        client.get("/api/document-forms/cases/not-a-case").status_code == 404
    )
    assert client.get(base + "/outputs/invalid/draft.json").status_code == 404


def test_duplicate_variables_formulas_custom_rules_and_excel_roundtrip(
    sources,
):
    data = engine.read_excel(sources["变量管理表.xlsx"])
    case = dict(
        data,
        templates=[{"keys": ["project.unknown"], "per_recipient": False}],
    )
    assert any(r["field"] == "project.unknown" for r in engine.checks(case))
    case["templates"] = []
    data["fields"][0]["value"] = '=HYPERLINK("https://example.test")'
    exported = engine.export_excel(case)
    book = load_workbook(io.BytesIO(exported))
    assert book["变量配置"]["C2"].data_type == "s"
    assert engine.read_excel(exported)["fields"][0]["value"].startswith(
        "=HYPERLINK",
    )
    book["变量配置"]["C2"] = "=1+1"
    output = io.BytesIO()
    book.save(output)
    with pytest.raises(ValueError, match="使用了公式"):
        engine.read_excel(output.getvalue())
    book["变量配置"]["C2"] = "literal"
    book["变量配置"].append(["project.name", "重复字段", "x"])
    output = io.BytesIO()
    book.save(output)
    with pytest.raises(ValueError, match="重复"):
        engine.read_excel(output.getvalue())
    data = engine.read_excel(sources["变量管理表.xlsx"])
    case = dict(
        data,
        templates=[],
        rules=[
            {
                "label": "严格顺序",
                "start": "dates.issue",
                "end": "dates.issue",
                "equal": False,
            },
        ],
    )
    assert any(
        r["label"] == "严格顺序" and r["status"] == "error"
        for r in engine.checks(case)
    )


def test_split_runs_tables_headers_and_literal_xml():
    doc = Document()
    p = doc.add_paragraph()
    p.add_run("{{ project.").bold = True
    p.add_run("name }}").italic = True
    doc.add_table(rows=1, cols=1).cell(0, 0).text = "{{ project.name }}"
    doc.sections[0].header.paragraphs[0].text = "{{ project.name }}"
    source = io.BytesIO()
    doc.save(source)
    info = engine.template_info(source.getvalue(), "test.docx")
    assert info["keys"] == ["project.name"]
    output = engine.render_template(
        source.getvalue(),
        [{"key": "project.name", "value": "A & B <名称>"}],
    )
    result = Document(io.BytesIO(output))
    assert result.paragraphs[0].text == "A & B <名称>"
    assert result.tables[0].cell(0, 0).text == "A & B <名称>"
    assert result.sections[0].header.paragraphs[0].text == "A & B <名称>"
    assert result.paragraphs[0].runs[0].bold


def test_bad_templates_and_unresolved_output_are_rejected(sources):
    with pytest.raises(ValueError):
        engine.template_info(b"not docx", "bad.docx")
    doc = Document()
    doc.add_paragraph("{{ project.__class__ }}")
    output = io.BytesIO()
    doc.save(output)
    with pytest.raises(ValueError):
        engine.template_info(output.getvalue(), "bad.docx")
    with pytest.raises(ValueError, match="模板标记"):
        engine.render_template(
            sources["谈判文件_示例模板.docx"],
            [
                dict(f, value="{{ unresolved }}")
                for f in engine.read_excel(sources["变量管理表.xlsx"])["fields"]
            ],
        )


def test_chinese_dates_and_excel_date_controls_round_trip(sources):
    book = load_workbook(io.BytesIO(sources["变量管理表.xlsx"]))
    for row in book["变量配置"].iter_rows(min_row=2):
        if row[0].value == "dates.issue":
            row[2].value = "2026年11月1日"
        if row[0].value == "events.qa_deadline":
            row[2].value = "2026年11月5日12时00分"
    book["受邀单位"]["B2"] = "2026年11月2日9时00分"
    stream = io.BytesIO()
    book.save(stream)
    data = engine.read_excel(stream.getvalue())
    assert (
        next(f["value"] for f in data["fields"] if f["key"] == "dates.issue")
        == "2026-11-01"
    )
    assert (
        next(
            f["value"]
            for f in data["fields"]
            if f["key"] == "events.qa_deadline"
        )
        == "2026-11-05T12:00"
    )
    assert data["recipients"][0]["start"] == "2026-11-02T09:00"
    assert engine.parsed_date("2026-11-02T09:00+08:00") is None
    assert engine.parsed_date("2026年2月30日") is None


def test_dict_method_names_are_rendered_as_excel_values():
    doc = Document()
    doc.add_paragraph("{{ project.items }} / {{ project.values }}")
    stream = io.BytesIO()
    doc.save(stream)
    result = engine.render_template(
        stream.getvalue(),
        [
            {"key": "project.items", "value": "测试项目"},
            {"key": "project.values", "value": "实际值"},
        ],
    )
    assert Document(io.BytesIO(result)).paragraphs[0].text == "测试项目 / 实际值"


def test_corrupt_workbook_and_unknown_date_values_preserve_existing_case(
    client,
    sources,
):
    case = create(client, sources)
    response = client.post(
        "/api/document-forms/cases",
        files={"workbook": ("bad.xlsx", b"broken")},
    )
    assert response.status_code == 422
    assert (
        client.get(f"/api/document-forms/cases/{case['id']}").json()[
            "revision"
        ]
        == case["revision"]
    )
    book = load_workbook(io.BytesIO(sources["变量管理表.xlsx"]))
    book["受邀单位"]["B2"] = "明天上午"
    stream = io.BytesIO()
    book.save(stream)
    with pytest.raises(ValueError, match="领取时间无法识别"):
        engine.read_excel(stream.getvalue())


def test_generate_requires_review_and_confirm(client, sources):
    case = create(client, sources)
    base = f"/api/document-forms/cases/{case['id']}"
    assert (
        client.post(
            base + "/generate",
            json={
                "revision": case["revision"],
                "review_token": "forged",
                "confirmed": True,
            },
        ).status_code
        == 409
    )
    result = client.post(
        base + "/review",
        json={"revision": case["revision"]},
    ).json()
    assert (
        client.post(
            base + "/generate",
            json={
                "revision": case["revision"],
                "review_token": result["review_token"],
                "confirmed": False,
            },
        ).status_code
        == 409
    )


def test_failed_batch_is_atomic_and_duplicate_names_are_safe(
    client,
    sources,
    monkeypatch,
):
    case = create(client, sources)
    base = f"/api/document-forms/cases/{case['id']}"
    result = client.post(
        base + "/review",
        json={"revision": case["revision"]},
    ).json()
    original = main.render_template
    count = 0

    def failing(*args):
        nonlocal count
        count += 1
        if count == 2:
            raise ValueError("模板错误")
        return original(*args)

    monkeypatch.setattr(main, "render_template", failing)
    assert (
        client.post(
            base + "/generate",
            json={
                "revision": case["revision"],
                "review_token": result["review_token"],
                "confirmed": True,
            },
        ).status_code
        == 422
    )
    assert client.get(base).json()["generations"] == []
    assert not list(main.ROOT.glob("*/*/staging-*"))
