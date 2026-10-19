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
from openpyxl import Workbook, load_workbook

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
        assert "2026年11月1日" in text
        assert "2026年11月7日上午09:00" in text
        if f["recipient"] != "共用文件":
            assert f["recipient"] in text
            invite_texts.append(text)
    assert len(set(invite_texts)) == 3
    with ZipFile(
        io.BytesIO(
            client.get(
                base + f"/outputs/{generation['id']}/全部文书.zip",
            ).content,
        ),
    ) as archive:
        assert len(archive.namelist()) == 6
        workbook = load_workbook(io.BytesIO(archive.read("填写数据.xlsx")))
        assert workbook.sheetnames == [
            "变量配置",
            "受邀单位",
            "校核规则",
            "日期校核",
        ]
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


def unsized_workbook():
    """Anonymized version of the reported writer/layout, without dimensions."""
    book = Workbook(write_only=True)
    variables = book.create_sheet("变量配置")
    for row in [
        ["变量名称", "中文名称", "值"],
        ["project.name", "项目名称", "回归测试项目"],
        ["org.name", "邀请单位", "测试单位"],
        ["dates.issue", "文件落款日期", "2026-10-17"],
        [
            "events.invitation_time",
            "总体邀请函发放时段",
            "2026-07-02 09:00 ~ 2026-07-02 17:00",
        ],
        [
            "events.questions_time",
            "商务答疑时间段",
            "2026-07-03 09:00 ~ 2026-07-03 17:00",
        ],
        ["submission.deadline", "响应文件提交截止时间", "2026-07-04 17:00"],
        [
            "events.negotiation_time",
            "商务谈判时间段",
            "2026-07-05 09:00 ~ 2026-07-05 17:00",
        ],
        ["research.contents", "主要研究内容", "第一项\n第二项"],
    ]:
        variables.append(row)
    recipients = book.create_sheet("受邀单位")
    for row in [
        [
            "序号",
            "受邀单位（invitation.recipient）",
            "邀请函领取开始（YYYY-MM-DD HH:MM）",
            "邀请函领取结束（YYYY-MM-DD HH:MM）",
        ],
        [1, "甲单位", "2026-07-02 09:00", "2026-07-02 10:00"],
        [2],
        [3],
        [],
        ["说明：每家单位填写名称与独立领取时间。"],
    ]:
        recipients.append(row)
    audit = book.create_sheet("日期校核")
    audit.append(["旧结果", "=1+1"])
    output = io.BytesIO()
    book.save(output)
    return output.getvalue()


def with_stale_dimensions(content):
    output = io.BytesIO()
    with (
        ZipFile(io.BytesIO(content)) as source,
        ZipFile(
            output,
            "w",
        ) as target,
    ):
        for name in source.namelist():
            payload = source.read(name)
            if name.startswith("xl/worksheets/") and name.endswith(".xml"):
                payload = payload.replace(
                    b"<sheetPr>",
                    b'<dimension ref="A1:A1"/><sheetPr>',
                    1,
                )
            target.writestr(name, payload)
    return output.getvalue()


@pytest.mark.parametrize("stale", [False, True])
def test_missing_or_stale_dimensions_annotated_headers_and_sparse_rows(stale):
    content = unsized_workbook()
    if stale:
        content = with_stale_dimensions(content)
    data = engine.read_excel(content)
    assert len(data["fields"]) == 8
    assert len(data["recipients"]) == 3
    assert data["recipients"][0] == {
        "name": "甲单位",
        "start": "2026-07-02T09:00",
        "end": "2026-07-02T10:00",
        "follow_start": False,
        "follow_end": False,
    }
    assert data["recipients"][1] == {
        "name": "",
        "start": "2026-07-02T09:00",
        "end": "2026-07-02T10:00",
        "follow_start": True,
        "follow_end": True,
    }
    checks = engine.checks(dict(data, templates=[]))
    assert any(
        r["label"] == "落款日期不晚于总体发放开始" and r["status"] == "error"
        for r in checks
    )
    assert not any("格式" in r["detail"] for r in checks)


def test_reported_workbook_layout_review_edit_generate_and_roundtrip(client):
    response = client.post(
        "/api/document-forms/cases",
        files={"workbook": ("变量表.xlsx", unsized_workbook())},
    )
    assert response.status_code == 200, response.text
    case = response.json()
    base = f"/api/document-forms/cases/{case['id']}"
    templates = []
    for name, paragraph in [
        (
            "谈判文件.docx",
            "{{ project.name }} {{ events.invitation_time }} "
            "{{ dates.issue }}",
        ),
        (
            "邀请函.docx",
            "{{ invitation.recipient }} {{ events.invitation_time }} "
            "{{ dates.issue }}",
        ),
    ]:
        doc = Document()
        doc.add_paragraph(paragraph)
        output = io.BytesIO()
        doc.save(output)
        templates.append(("files", (name, output.getvalue())))
    response = client.post(
        base + "/templates",
        data={"revision": case["revision"]},
        files=templates,
    )
    assert response.status_code == 200, response.text
    case = response.json()
    assert [t["per_recipient"] for t in case["templates"]] == [False, True]
    review = client.post(
        base + "/review",
        json={"revision": case["revision"]},
    ).json()
    assert not review["can_generate"]
    assert any(r["status"] == "error" for r in review["checks"])
    values = {f["key"]: f["value"] for f in case["fields"]}
    values["dates.issue"] = "2026-07-01"
    recipients = [
        {
            "name": name,
            "start": f"2026-07-02T{hour}:00",
            "end": f"2026-07-02T{hour}:30",
        }
        for name, hour in [
            ("甲单位", "09"),
            ("乙单位", "11"),
            ("丙单位", "13"),
        ]
    ]
    case = client.put(
        base,
        json={
            "revision": case["revision"],
            "name": "复核测试",
            "values": values,
            "recipients": recipients,
        },
    ).json()
    review = client.post(
        base + "/review",
        json={"revision": case["revision"]},
    ).json()
    assert review["can_generate"], review
    response = client.post(
        base + "/generate",
        json={
            "revision": case["revision"],
            "review_token": review["review_token"],
            "confirmed": True,
        },
    )
    assert response.status_code == 200, response.text
    generation = response.json()["generations"][0]
    assert len(generation["files"]) == 4
    for item in generation["files"]:
        result = client.get(
            base + f"/outputs/{generation['id']}/{item['name']}",
        )
        paragraph = Document(io.BytesIO(result.content)).paragraphs[0].text
        if item["recipient"] == "共用文件":
            assert "2026年7月2日上午09:00至下午17:00" in paragraph
        else:
            recipient = next(
                r for r in recipients if r["name"] == item["recipient"]
            )
            assert engine.document_date(recipient["start"]) in paragraph
        assert "2026年7月1日" in paragraph
    exported = engine.read_excel(client.get(base + "/excel").content)
    assert exported["fields"] == case["fields"]
    assert exported["recipients"] == case["recipients"]


@pytest.mark.parametrize("limit", ["rows", "columns", "formula"])
def test_untrusted_dimensions_cannot_hide_limits_or_input_formulas(limit):
    book = Workbook(write_only=True)
    sheet = book.create_sheet("变量配置")
    sheet.append(["变量名称", "中文名称", "值"])
    sheet.append(
        ["project.name", "项目名称", "=1+1" if limit == "formula" else "项目"],
    )
    if limit == "columns":
        sheet.append([None] * 30 + ["超出列数"])
    if limit == "rows":
        for index in range(1000):
            sheet.append([f"p{index}", "测试", "值"])
    output = io.BytesIO()
    book.save(output)
    with pytest.raises(
        ValueError,
        match="使用了公式" if limit == "formula" else "最多支持",
    ):
        engine.read_excel(with_stale_dimensions(output.getvalue()))


@pytest.mark.parametrize(
    "value",
    [
        "2026-07-03 17:00 ~ 2026-07-03 09:00",
        "2026-07-03 09:00 ~ 明天",
        "2026-07-03 09:00 ~ 2026-07-04 18:00",
    ],
)
def test_time_ranges_reject_reversed_malformed_and_overlapping_events(value):
    data = engine.read_excel(unsized_workbook())
    for field in data["fields"]:
        if field["key"] == "dates.issue":
            field["value"] = "2026-07-01"
        if field["key"] == "events.questions_time":
            field["value"] = value
    data["recipients"] = data["recipients"][:1]
    results = engine.checks(
        dict(
            data,
            templates=[{"keys": ["project.name"], "per_recipient": False}],
        ),
    )
    assert any(
        r["status"] == "error"
        and r["field"] in {"events.questions_time", "submission.deadline"}
        for r in results
    )


@pytest.mark.parametrize("sheet_name", ["变量配置", "受邀单位", "校核规则"])
def test_empty_unsized_input_sections_have_clear_errors(sheet_name):
    book = Workbook(write_only=True)
    sheet = book.create_sheet("变量配置")
    if sheet_name != "变量配置":
        sheet.append(["变量名称", "中文名称", "值"])
        sheet.append(["project.name", "项目名称", "测试项目"])
        book.create_sheet(sheet_name)
    output = io.BytesIO()
    book.save(output)
    with pytest.raises(ValueError, match=sheet_name + "为空"):
        engine.read_excel(output.getvalue())


def test_recipients_stay_in_overall_window_and_response_precedes_negotiation():
    data = engine.read_excel(unsized_workbook())
    data["recipients"] = data["recipients"][:1]
    data["recipients"][0]["start"] = "2026-07-02T08:30"
    data["recipients"][0]["end"] = "2026-07-02T17:30"
    for field in data["fields"]:
        if field["key"] == "dates.issue":
            field["value"] = "2026-07-01"
        if field["key"] == "submission.deadline":
            field["value"] = "2026-07-05T09:00"
    results = engine.checks(dict(data, templates=[]))
    assert (
        sum(
            r["status"] == "error" and "处于总体发放期" in r["label"] for r in results
        )
        == 2
    )
    assert any(
        r["status"] == "error" and r["field"] == "events.negotiation_time"
        for r in results
    )


def test_followed_times_manual_override_save_reload_and_excel_roundtrip(
    client,
):
    response = client.post(
        "/api/document-forms/cases",
        files={"workbook": ("变量表.xlsx", unsized_workbook())},
    )
    case = response.json()
    base = f"/api/document-forms/cases/{case['id']}"

    def persist():
        response = client.put(
            base,
            json={
                "revision": case["revision"],
                "name": case["name"],
                "values": {f["key"]: f["value"] for f in case["fields"]},
                "recipients": case["recipients"],
            },
        )
        assert response.status_code == 200, response.text
        return response.json()

    assert case["recipients"][1]["follow_start"]
    assert case["recipients"][2]["start"] == case["recipients"][0]["start"]
    case["recipients"][1].update(start="2026-07-02T10:00", follow_start=False)
    case["recipients"][0].update(
        start="2026-07-02T09:30",
        end="2026-07-02T11:00",
    )
    case = persist()
    assert case["recipients"][1]["start"] == "2026-07-02T10:00"
    assert case["recipients"][1]["end"] == "2026-07-02T11:00"
    assert case["recipients"][2]["start"] == "2026-07-02T09:30"
    case["recipients"][1].update(end="", follow_end=False)
    case["recipients"][0]["end"] = "2026-07-02T12:00"
    case = persist()
    assert case["recipients"][1]["end"] == ""
    assert client.get(base).json()["recipients"] == case["recipients"]
    exported = engine.read_excel(client.get(base + "/excel").content)
    assert exported["recipients"] == case["recipients"]
    case["recipients"][1]["follow_start"] = True
    case = persist()
    assert case["recipients"][1]["start"] == case["recipients"][0]["start"]


def test_legacy_explicit_times_are_preserved_and_empty_slots_can_follow():
    data = [
        {"name": "甲", "start": "2026-07-01T09:00", "end": "2026-07-01T17:00"},
        {"name": "乙", "start": "2026-07-02T10:00", "end": ""},
        {"name": "丙", "start": "", "end": ""},
    ]
    recipients = engine.recipient_defaults(data)
    assert recipients[1]["start"] == data[1]["start"]
    assert not recipients[1]["follow_start"]
    assert recipients[1]["follow_end"]
    assert recipients[2]["start"] == data[0]["start"]
    assert data[2]["start"] == "", "Input must not be mutated"
    recipients.pop(0)
    adjusted = engine.recipient_defaults(recipients)
    assert not adjusted[0]["follow_start"]
    assert adjusted[1]["start"] == adjusted[0]["start"]


def test_empty_follow_modes_survive_excel_export_without_unit_names():
    data = engine.read_excel(unsized_workbook())
    data["recipients"] = engine.recipient_defaults(
        [{"name": "", "start": "", "end": ""}] * 3,
    )
    result = engine.read_excel(engine.export_excel(dict(data, templates=[])))
    assert result["recipients"] == data["recipients"]


def test_defaults_auto_attach_to_new_cases_and_apply_to_existing_case(
    client,
    sources,
):
    old = client.post(
        "/api/document-forms/cases",
        files={"workbook": ("旧草稿.xlsx", sources["变量管理表.xlsx"])},
    ).json()
    case = create(client, sources)
    base = f"/api/document-forms/cases/{case['id']}"
    result = client.post(
        base + "/defaults",
        json={"revision": case["revision"]},
    )
    assert result.status_code == 200, result.text
    assert result.json()["count"] == 2
    fresh = client.post(
        "/api/document-forms/cases",
        files={"workbook": ("新草稿.xlsx", sources["变量管理表.xlsx"])},
    ).json()
    assert [t["per_recipient"] for t in fresh["templates"]] == [False, True]
    assert {t["id"] for t in fresh["templates"]}.isdisjoint(
        t["id"] for t in case["templates"]
    )
    assert [t["sha256"] for t in fresh["templates"]] == [
        t["sha256"] for t in case["templates"]
    ]
    review = client.post(
        f"/api/document-forms/cases/{fresh['id']}/review",
        json={"revision": fresh["revision"]},
    ).json()
    assert review["can_generate"]
    applied = client.post(
        f"/api/document-forms/cases/{old['id']}/defaults/apply",
        json={"revision": old["revision"]},
    )
    assert applied.status_code == 200, applied.text
    assert len(applied.json()["templates"]) == 2
    assert applied.json()["revision"] == old["revision"] + 1
    assert (
        client.post(
            base + "/defaults/apply",
            json={"revision": case["revision"]},
        ).status_code
        == 409
    )
    other = client.post(
        "/api/document-forms/cases",
        headers={"X-Agent-Id": "other"},
        files={"workbook": ("其他智能体.xlsx", sources["变量管理表.xlsx"])},
    ).json()
    assert other["templates"] == []


def test_bad_default_files_do_not_break_excel_import_or_existing_draft(
    client,
    sources,
):
    case = create(client, sources)
    base = f"/api/document-forms/cases/{case['id']}"
    client.post(
        base + "/defaults",
        json={"revision": case["revision"]},
    ).raise_for_status()
    library = next(main.ROOT.glob("*/default-templates/index.json")).parent
    next(library.glob("*.docx")).write_bytes(b"damaged")
    response = client.post(
        "/api/document-forms/cases",
        files={"workbook": ("仍可导入.xlsx", sources["变量管理表.xlsx"])},
    )
    assert response.status_code == 200, response.text
    draft = response.json()
    assert draft["templates"] == [] and draft["template_notice"]
    before = client.get(base).json()
    assert (
        client.post(
            f"/api/document-forms/cases/{draft['id']}/defaults/apply",
            json={"revision": draft["revision"]},
        ).status_code
        == 422
    )
    assert client.get(base).json() == before


@pytest.mark.parametrize(
    "source,expected",
    [
        ("2026-09-30", "2026年9月30日"),
        ("2026-10-22T14:30", "2026年10月22日下午14:30"),
        ("2026-10-22T00:00", "2026年10月22日凌晨00:00"),
        ("2026-10-22T12:00", "2026年10月22日中午12:00"),
        ("2026-10-22T19:15:30", "2026年10月22日晚上19:15:30"),
        (
            "2026-10-22 14:30 ~ 2026-10-22 17:30",
            "2026年10月22日下午14:30至17:30",
        ),
        (
            "2026-10-22 09:00 ~ 2026-10-22 14:30",
            "2026年10月22日上午09:00至下午14:30",
        ),
        (
            "2026-10-22 14:30 ~ 2026-10-23 09:00",
            "2026年10月22日下午14:30至2026年10月23日上午09:00",
        ),
        ("2026年10月22日下午2:30至5:30", "2026年10月22日下午14:30至17:30"),
    ],
)
def test_chinese_date_output_roundtrips_without_changing_instant(
    source,
    expected,
):
    assert engine.document_date(source) == expected
    assert engine.parsed_interval(source) == engine.parsed_interval(expected)
    assert engine.document_date(expected) == expected


def test_schedule_year_and_business_identifiers_are_not_confused_with_dates():
    field = {
        "key": "milestones.schedule",
        "label": "进度安排",
        "kind": "textarea",
        "value": "（1）2026.11：调研；\n（2）2026.11-2026.12：建模；\n（3）2027-01-05：验收。",
    }
    assert (
        engine.document_field_value(field)
        == "（1）2026年11月：调研；\n（2）2026年11月至2026年12月：建模；\n（3）2027年1月5日：验收。"
    )
    for key, value in [
        ("qualification.start_year", "2023"),
        ("project.code", "QW-2026-10-22-A"),
        ("budget.ceiling_number", "450000"),
        ("contact.phone", "010-12345678"),
    ]:
        assert (
            engine.document_field_value(
                {"key": key, "label": key, "value": value, "kind": "text"},
            )
            == value
        )
    assert engine.parsed_date("2026年10月22日上午14:30") is None
    assert engine.parsed_interval("2026年2月30日下午14:30至17:30") is None


def test_chinese_dates_reach_body_tables_headers_footers_and_keep_run_format():
    document = Document()
    run = document.add_paragraph().add_run("{{ dates.issue }}")
    run.bold = True
    run.underline = True
    document.add_table(rows=1, cols=1).cell(
        0,
        0,
    ).text = "{{ submission.deadline }}"
    document.sections[0].header.paragraphs[0].text = "{{ dates.issue }}"
    document.sections[0].footer.paragraphs[
        0
    ].text = "{{ events.negotiation_time }}"
    stream = io.BytesIO()
    document.save(stream)
    fields = [
        {"key": "dates.issue", "value": "2026-09-30", "kind": "date"},
        {
            "key": "submission.deadline",
            "value": "2026-10-16T17:30",
            "kind": "datetime-local",
        },
        {
            "key": "events.negotiation_time",
            "value": "2026-10-22 14:30 ~ 2026-10-22 17:30",
            "kind": "text",
        },
    ]
    output = Document(
        io.BytesIO(engine.render_template(stream.getvalue(), fields)),
    )
    assert output.paragraphs[0].text == "2026年9月30日"
    assert (
        output.paragraphs[0].runs[0].bold
        and output.paragraphs[0].runs[0].underline
    )
    assert output.tables[0].cell(0, 0).text == "2026年10月16日下午17:30"
    assert output.sections[0].header.paragraphs[0].text == "2026年9月30日"
    assert (
        output.sections[0].footer.paragraphs[0].text
        == "2026年10月22日下午14:30至17:30"
    )


def test_review_and_excel_share_chinese_dates_and_preserve_source(
    client,
    sources,
):
    case = create(client, sources)
    values = {f["key"]: f["value"] for f in case["fields"]}
    assert case["document_values"]["dates.issue"] == "2026年11月1日"
    assert case["recipient_document_times"][0] == "2026年11月2日上午09:00至11:00"
    assert values["dates.issue"] == "2026-11-01"
    base = f"/api/document-forms/cases/{case['id']}"
    review = client.post(
        base + "/review",
        json={"revision": case["revision"]},
    ).json()
    assert review["can_generate"]
    assert any("2026年11月" in r["detail"] for r in review["checks"])
    assert all("T09:00" not in r["detail"] for r in review["checks"])
    exported = client.get(base + "/excel").content
    workbook = load_workbook(io.BytesIO(exported))
    assert workbook["变量配置"].cell(1, 7).value == "文书显示"
    assert (
        workbook["受邀单位"].cell(2, 6).value
        == case["recipient_document_times"][0]
    )
    assert engine.read_excel(exported)["fields"] == case["fields"]
