# -*- coding: utf-8 -*-
"""Real Excel/Word and HTTP lifecycle regressions for document forms."""

import importlib.util
import base64
import io
import json
import shutil
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


def bundled_workbook(client, filled=False):
    response = client.get("/api/document-forms/starter")
    assert response.status_code == 200, response.text
    with ZipFile(io.BytesIO(response.content)) as archive:
        assert set(archive.namelist()) == set(main.builtin.NAMES) | {
            "变量管理表.xlsx",
        }
        data = archive.read("变量管理表.xlsx")
    if not filled:
        return data
    book = load_workbook(io.BytesIO(data))
    values = {
        "project.name": "测试项目 A & B <参数>",
        "dates.issue": "2026-11-01",
        "events.invitation_time": "2026-11-02 09:00 ~ 2026-11-03 17:00",
        "events.questions_time": "2026-11-04 09:00 ~ 2026-11-04 11:00",
        "submission.deadline": "2026-11-06T17:00",
        "events.negotiation_time": "2026-11-07 09:00 ~ 2026-11-07 11:00",
        "qualification.start_year": "2023",
        "budget.ceiling_number": "100000",
        "budget.ceiling_upper": "壹拾万元整",
    }
    for row in book["变量配置"].iter_rows(min_row=2):
        row[2].value = values.get(row[0].value, row[1].value + "测试内容")
    for index, name in enumerate(("甲单位", "乙单位", "丙单位"), 2):
        book["受邀单位"].cell(index, 1, name)
    book["受邀单位"].cell(2, 2, "2026-11-02T09:00")
    book["受邀单位"].cell(2, 3, "2026-11-02T11:00")
    output = io.BytesIO()
    book.save(output)
    return output.getvalue()


def project_case(client, stage_id="negotiation"):
    project = client.post(
        "/api/document-forms/projects",
        json={"name": "全流程测试项目", "code": "P-001", "owner": "测试经办人"},
    ).json()
    case = client.post(
        f"/api/document-forms/projects/{project['id']}/cases",
        json={"revision": project["revision"], "stage_id": stage_id},
    ).json()
    project = client.get(
        f"/api/document-forms/projects/{project['id']}",
    ).json()
    return project, case


def test_project_migration_groups_legacy_forms_without_rewriting_files(
    client,
    sources,
):
    first = create(client, sources)
    second = create(client, sources)
    before = {
        str(p): p.read_bytes() for p in main.ROOT.glob("*/**/*") if p.is_file()
    }
    projects = client.get("/api/document-forms/projects").json()
    assert len(projects) == 1 and projects[0]["forms"] == 2
    assert all(Path(p).read_bytes() == data for p, data in before.items())
    project = client.get(
        f"/api/document-forms/projects/{projects[0]['id']}",
    ).json()
    assert {f["case_id"] for f in project["forms"]} == {
        first["id"],
        second["id"],
    }
    assert all(f["stage_id"] == "negotiation" for f in project["forms"])
    repeated = client.get("/api/document-forms/projects").json()
    assert repeated == projects
    assert len(project["stages"]) == 6 and project["migrated"]
    assert {
        s["status"] for s in project["stages"] if s["id"] != "negotiation"
    } == {"pending"}
    other = client.get(
        "/api/document-forms/projects",
        headers={"X-Agent-Id": "another-agent"},
    )
    assert other.json() == []


def test_project_shared_profile_sync_is_selective_and_invalidates_review(
    client,
):
    project, case = project_case(client)
    base = f"/api/document-forms/projects/{project['id']}"
    profile = {
        "revision": project["revision"],
        "name": "更新后的项目",
        "code": "P-002",
        "owner": "经办人",
        "values": {
            "project.background": "统一背景",
            "research.contents": "统一研究内容",
        },
    }
    updated = client.put(base, json=profile).json()
    assert updated["shared_revision"] == project["shared_revision"] + 1
    assert client.put(base, json=profile).status_code == 409
    original = client.get(f"/api/document-forms/cases/{case['id']}").json()
    assert values_for(original)["project.name"] == "全流程测试项目"
    assert set(updated["forms"][0]["shared_changes"]) == {
        "project.name",
        "project.background",
        "research.contents",
    }
    synced = client.post(
        base + f"/cases/{case['id']}/sync",
        json={
            "revision": updated["revision"],
            "case_revision": case["revision"],
            "keys": ["project.background"],
        },
    )
    assert synced.status_code == 200, synced.text
    assert values_for(synced.json())["project.background"] == "统一背景"
    assert values_for(synced.json())["research.contents"] == ""
    assert synced.json()["revision"] == case["revision"] + 1
    assert "review_token" not in synced.json()
    current = client.get(base).json()
    assert "project.background" not in current["forms"][0]["shared_changes"]
    assert (
        client.post(
            base + f"/cases/{case['id']}/sync",
            json={
                "revision": current["revision"],
                "case_revision": case["revision"],
                "keys": ["project.name"],
            },
        ).status_code
        == 409
    )
    assert (
        client.post(
            base + f"/cases/{case['id']}/sync",
            json={
                "revision": current["revision"],
                "case_revision": synced.json()["revision"],
                "keys": ["dates.issue"],
            },
        ).status_code
        == 422
    )
    assert client.get(base, headers={"X-Agent-Id": "other"}).status_code == 404


def values_for(case):
    return {f["key"]: f["value"] for f in case["fields"]}


def test_project_stage_defaults_do_not_replace_negotiation_defaults(client):
    project, negotiation = project_case(client)
    base = f"/api/document-forms/projects/{project['id']}"
    kickoff = client.post(
        base + "/cases",
        json={"revision": project["revision"], "stage_id": "kickoff"},
    ).json()
    doc = Document()
    doc.add_paragraph("开题报告：{{ project.name }}")
    stream = io.BytesIO()
    doc.save(stream)
    path = f"/api/document-forms/cases/{kickoff['id']}"
    kickoff = client.post(
        path + "/templates",
        data={"revision": kickoff["revision"]},
        files=[("files", ("开题报告_模板.docx", stream.getvalue()))],
    ).json()
    client.post(
        path + "/defaults",
        json={"revision": kickoff["revision"]},
    ).raise_for_status()
    project = client.get(base).json()
    next_kickoff = client.post(
        base + "/cases",
        json={"revision": project["revision"], "stage_id": "kickoff"},
    ).json()
    assert len(next_kickoff["templates"]) == 1
    assert (
        next_kickoff["templates"][0]["sha256"]
        == kickoff["templates"][0]["sha256"]
    )
    project = client.get(base).json()
    next_negotiation = client.post(
        base + "/cases",
        json={"revision": project["revision"], "stage_id": "negotiation"},
    ).json()
    assert [t["sha256"] for t in next_negotiation["templates"]] == [
        t["sha256"] for t in negotiation["templates"]
    ]
    assert not list(main.ROOT.glob("*/default-templates/index.json"))
    assert (
        len(list(main.ROOT.glob("*/stage-defaults/kickoff/index.json"))) == 1
    )


def test_project_sync_rejects_stale_confirmation_and_missing_archive_files(
    client,
    sources,
):
    case = create(client, sources)
    project_id = client.get("/api/document-forms/projects").json()[0]["id"]
    base = f"/api/document-forms/projects/{project_id}"
    project = client.get(base).json()
    review = client.post(
        f"/api/document-forms/cases/{case['id']}/review",
        json={"revision": case["revision"]},
    ).json()
    assert review["can_generate"]
    project = client.put(
        base,
        json={
            "revision": project["revision"],
            "name": "新的项目底稿",
            "code": project["code"],
            "owner": project["owner"],
        },
    ).json()
    changed = client.post(
        base + f"/cases/{case['id']}/sync",
        json={
            "revision": project["revision"],
            "case_revision": case["revision"],
            "keys": ["project.name"],
        },
    )
    assert changed.status_code == 200
    stale = client.post(
        f"/api/document-forms/cases/{case['id']}/generate",
        json={
            "revision": case["revision"],
            "review_token": review["review_token"],
            "confirmed": True,
        },
    )
    assert stale.status_code == 409
    root = next(main.ROOT.iterdir())
    template = (
        main.folder(root, case["id"])
        / "templates"
        / (case["templates"][0]["id"] + ".docx")
    )
    template.write_bytes(b"tampered")
    result = client.get(base + "/bundle")
    assert result.status_code == 422 and "校验" in result.json()["detail"]


def test_project_stage_imports_own_templates_and_inherits_only_blank_fields(
    client,
    sources,
):
    project, first = project_case(client)
    base = f"/api/document-forms/projects/{project['id']}"
    assert len(first["templates"]) == 5
    response = client.post(
        base + "/cases/import",
        data={"revision": project["revision"], "stage_id": "kickoff"},
        files={"workbook": ("开题.xlsx", sources["变量管理表.xlsx"])},
    )
    assert response.status_code == 200, response.text
    kickoff = response.json()
    assert kickoff["templates"] == []
    assert values_for(kickoff)["project.name"] != project["name"]
    current = client.get(base).json()
    assert {f["stage_id"] for f in current["forms"]} == {
        "negotiation",
        "kickoff",
    }
    data = engine.read_excel(sources["变量管理表.xlsx"])
    data["templates"] = []
    for field in data["fields"]:
        field["value"] = ""
    blank = engine.export_excel(data)
    new_case = client.post(
        base + "/cases/import",
        data={"revision": current["revision"], "stage_id": "acceptance"},
        files={"workbook": ("验收.xlsx", blank)},
    ).json()
    assert values_for(new_case)["project.name"] == project["name"]
    assert values_for(new_case)["project.code"] == project["code"]
    assert new_case["templates"] == []
    root = next(main.ROOT.iterdir())
    stored = main.load(root, new_case["id"])
    assert (
        stored["stage_id"] == "acceptance"
        and stored["project_id"] == project["id"]
    )


def test_stage_completion_requires_confirmation_and_tracks_upstream_rework(
    client,
):
    project, _ = project_case(client, "kickoff")
    base = f"/api/document-forms/projects/{project['id']}"
    stage = project["stages"][0]
    material = stage["materials"][0]
    path = base + f"/stages/plan/materials/{material['id']}"
    project = client.put(
        path,
        json={
            "revision": project["revision"],
            "name": material["name"],
            "required": True,
            "status": "pending",
        },
    ).json()
    body = {
        "revision": project["revision"],
        "status": "completed",
        "notes": "系统已审批",
    }
    assert client.put(base + "/stages/plan", json=body).status_code == 422
    body["confirmed"] = True
    assert (
        "必备" in client.put(base + "/stages/plan", json=body).json()["detail"]
    )
    project = client.put(
        path,
        json={
            "revision": project["revision"],
            "name": material["name"],
            "required": True,
            "status": "done",
        },
    ).json()
    body["revision"] = project["revision"]
    project = client.put(base + "/stages/plan", json=body).json()
    assert project["stages"][0]["status"] == "completed"
    assert "上报计划" in project["stages"][3]["upstream_changed"]
    project = client.post(
        base + "/stages/kickoff/acknowledge",
        json={"revision": project["revision"]},
    ).json()
    assert project["stages"][3]["upstream_changed"] == []
    project = client.put(
        path,
        json={
            "revision": project["revision"],
            "name": material["name"],
            "required": True,
            "status": "preparing",
        },
    ).json()
    assert project["stages"][0]["status"] == "in_progress"
    assert project["stages"][3]["upstream_changed"] == ["上报计划"]
    assert (
        client.put(
            base + "/stages/plan",
            json={"revision": project["revision"], "status": "banana"},
        ).status_code
        == 422
    )
    assert (
        client.put(
            base + "/stages/plan",
            json={
                "revision": project["revision"],
                "status": "submitted",
                "system_url": "javascript:alert(1)",
            },
        ).status_code
        == 422
    )
    assert (
        client.put(
            base + "/stages/plan",
            json={
                "revision": project["revision"],
                "status": "submitted",
                "due_date": "2026-02-30",
            },
        ).status_code
        == 422
    )


def test_project_attachments_retain_versions_scope_and_real_archive(client):
    project, _ = project_case(client)
    base = f"/api/document-forms/projects/{project['id']}"
    material = project["stages"][0]["materials"][0]
    path = base + f"/stages/plan/materials/{material['id']}/files"
    payloads = [b"%PDF-1.4 draft", b"%PDF-1.4 final"]
    stale = project["revision"]
    for content in payloads:
        result = client.post(
            path,
            data={"revision": project["revision"]},
            files={"file": ("上报计划.pdf", content, "application/pdf")},
        )
        assert result.status_code == 200, result.text
        project = result.json()
    item = project["stages"][0]["materials"][0]
    assert len(item["files"]) == 2 and item["status"] == "preparing"
    for file, content in zip(item["files"], payloads):
        assert client.get(base + f"/files/{file['id']}").content == content
        assert (
            client.get(
                base + f"/files/{file['id']}",
                headers={"X-Agent-Id": "different"},
            ).status_code
            == 404
        )
        assert "storage" not in file and file["preview_url"].startswith(
            "/api/files/preview/",
        )
    assert (
        client.post(
            path,
            data={"revision": stale},
            files={"file": ("stale.pdf", b"x")},
        ).status_code
        == 409
    )
    assert (
        client.post(
            path,
            data={"revision": project["revision"]},
            files={"file": ("unsafe.exe", b"x")},
        ).status_code
        == 422
    )
    bundle = client.get(base + "/bundle?stage_id=plan")
    assert bundle.status_code == 200
    with ZipFile(io.BytesIO(bundle.content)) as archive:
        assert len(archive.namelist()) == 4 and archive.testzip() is None
        index = load_workbook(io.BytesIO(archive.read("材料目录.xlsx")))
        assert index.active["E2"].value == 2
        assert index.active["F2"].value == "上报计划.pdf"
        manifest = json.loads(archive.read("项目材料台账.json"))
        assert len(manifest["stages"]) == 1 and manifest["forms"] == []
        assert b"preview_url" not in archive.read("项目材料台账.json")
        assert set(
            archive.read(n) for n in archive.namelist() if n.endswith(".pdf")
        ) == set(payloads)
    assert (
        len(client.get(base).json()["stages"][0]["materials"][0]["files"]) == 2
    )


def test_project_generated_batch_changes_prompt_downstream_review(
    client,
    sources,
):
    case = create(client, sources)
    projects = client.get("/api/document-forms/projects").json()
    base = f"/api/document-forms/projects/{projects[0]['id']}"
    project = client.get(base).json()
    project = client.put(
        base + "/stages/kickoff",
        json={"revision": project["revision"], "status": "in_progress"},
    ).json()
    revision = case["revision"]
    client.put(
        f"/api/document-forms/cases/{case['id']}",
        json={
            "revision": revision,
            "name": case["name"],
            "values": values_for(case),
            "recipients": case["recipients"],
        },
    ).raise_for_status()
    updated = client.get(base).json()
    assert updated["stages"][3]["upstream_changed"] == ["商务谈判"]
    case = client.get(f"/api/document-forms/cases/{case['id']}").json()
    review = client.post(
        f"/api/document-forms/cases/{case['id']}/review",
        json={"revision": case["revision"]},
    ).json()
    generated = client.post(
        f"/api/document-forms/cases/{case['id']}/generate",
        json={
            "revision": case["revision"],
            "review_token": review["review_token"],
            "confirmed": True,
        },
    ).json()
    batch_id = generated["generations"][0]["id"]
    original = client.get(
        f"/api/document-forms/cases/{case['id']}"
        f"/outputs/{batch_id}/全部文书.zip",
    ).content
    bundle = client.get(base + "/bundle")
    with ZipFile(io.BytesIO(bundle.content)) as archive:
        nested = [n for n in archive.namelist() if n.endswith(".zip")]
        assert len(nested) == 1 and archive.read(nested[0]) == original
    project = client.get(base).json()
    changed = client.put(
        base,
        json={
            "revision": project["revision"],
            "name": "新的项目名称",
            "code": project["code"],
            "owner": project["owner"],
        },
    ).json()
    case = client.post(
        base + f"/cases/{case['id']}/sync",
        json={
            "revision": changed["revision"],
            "case_revision": generated["revision"],
            "keys": ["project.name"],
        },
    ).json()
    assert case["revision"] == generated["revision"] + 1
    assert (
        client.get(
            f"/api/document-forms/cases/{case['id']}"
            f"/outputs/{batch_id}/全部文书.zip",
        ).content
        == original
    )


def test_bundled_templates_are_portable_blank_and_generate_nine_documents(
    client,
):
    blank = bundled_workbook(client)
    data = engine.read_excel(blank)
    assert len(data["fields"]) == 25 and all(
        not f["value"] for f in data["fields"]
    )
    assert all(
        not r["name"] and not r["start"] and not r["end"]
        for r in data["recipients"]
    )
    assert (
        data["recipients"][1]["follow_start"]
        and data["recipients"][2]["follow_end"]
    )
    response = client.post(
        "/api/document-forms/cases",
        files={"workbook": ("配套.xlsx", bundled_workbook(client, True))},
    )
    assert response.status_code == 200, response.text
    case = response.json()
    assert [t["name"] for t in case["templates"]] == list(main.builtin.NAMES)
    assert all(t["from_builtin"] for t in case["templates"])
    assert not list(main.ROOT.glob("*/default-templates/index.json"))
    base = f"/api/document-forms/cases/{case['id']}"
    review = client.post(
        base + "/review",
        json={"revision": case["revision"]},
    ).json()
    assert review["can_generate"], review
    case = client.post(
        base + "/generate",
        json={
            "revision": case["revision"],
            "review_token": review["review_token"],
            "confirmed": True,
        },
    ).json()
    generation = case["generations"][0]
    assert len(generation["files"]) == 9
    bundle = client.get(base + f"/outputs/{generation['id']}/全部文书.zip")
    with ZipFile(io.BytesIO(bundle.content)) as archive:
        assert archive.testzip() is None and len(archive.namelist()) == 11
        for file in generation["files"]:
            content = archive.read(file["name"])
            main.builtin.verify_public_template(content)
            text = "".join(Document(io.BytesIO(content)).element.itertext())
            assert "测试项目 A & B <参数>" in text
            assert not any(s in text for s in ("{{", "{%", "驴驹河", "郑帅"))
    other = client.post(
        "/api/document-forms/cases",
        headers={"X-Agent-Id": "new-device"},
        files={"workbook": ("配套.xlsx", blank)},
    ).json()
    assert len(other["templates"]) == 5 and all(
        t["from_builtin"] for t in other["templates"]
    )
    assert {t["id"] for t in case["templates"]}.isdisjoint(
        t["id"] for t in other["templates"]
    )


def test_personal_defaults_override_bundled_without_changing_old_records(
    client,
    sources,
):
    case = create(client, sources)
    base = f"/api/document-forms/cases/{case['id']}"
    client.post(
        base + "/defaults",
        json={"revision": case["revision"]},
    ).raise_for_status()
    before = client.get(base).json()
    fresh = client.post(
        "/api/document-forms/cases",
        files={"workbook": ("配套.xlsx", bundled_workbook(client))},
    ).json()
    assert [t["sha256"] for t in fresh["templates"]] == [
        t["sha256"] for t in case["templates"]
    ]
    assert all(not t["from_builtin"] for t in fresh["templates"])
    assert client.get(base).json() == before


def test_corrupt_bundled_assets_are_rejected_without_partial_templates(
    client,
    tmp_path,
    monkeypatch,
):
    workbook = bundled_workbook(client)
    target = tmp_path / "broken-builtins"
    shutil.copytree(main.builtin.LIBRARY, target)
    (target / main.builtin.NAMES[0]).write_bytes(b"damaged")
    monkeypatch.setattr(main.builtin, "LIBRARY", target)
    response = client.post(
        "/api/document-forms/cases",
        files={"workbook": ("配套.xlsx", workbook)},
    )
    assert response.status_code == 200
    assert (
        response.json()["templates"] == []
        and response.json()["template_notice"]
    )
    with pytest.raises(ValueError, match="校验失败"):
        main.builtin.load_templates()


def supplemental_sources():
    """Synthetic forms keep private project files out of releases."""
    result = {}
    for name in (
        "7 投标报价一览-打印签字",
        "5 综合评分打分表（打印7份，每位专家一份）--(2)",
        "6 综合评分总表-打印签字",
    ):
        doc = Document()
        doc.add_paragraph("{{ project.name }}")
        if name.startswith("7"):
            doc.add_paragraph("{{ invitation.recipient }}")
            table = doc.add_table(rows=3, cols=3)
            for cell, text in zip(table.rows[0].cells, ("轮次", "报价", "签字")):
                cell.text = text
            table.cell(1, 0).text = "第一轮"
            table.cell(2, 0).text = "第二轮"
        elif name.startswith("5"):
            doc.add_paragraph("{%p for group in participant_groups %}")
            table = doc.add_table(rows=2, cols=3)
            for cell, key in zip(
                table.rows[0].cells,
                ("first", "second", "third"),
            ):
                cell.text = "{{ group." + key + " }}"
            doc.add_paragraph("评委签字：")
            doc.add_paragraph("{%p endfor %}")
        else:
            table = doc.add_table(rows=4, cols=4)
            for cell, text in zip(
                table.rows[0].cells,
                ("序号", "申请单位", "综合得分", "排序"),
            ):
                cell.text = text
            table.cell(1, 0).text = "{%tr for participant in participants %}"
            table.cell(2, 0).text = "{{ loop.index }}"
            table.cell(2, 1).text = "{{ participant.name }}"
            table.cell(3, 0).text = "{%tr endfor %}"
        stream = io.BytesIO()
        doc.save(stream)
        result[name + ".docx"] = stream.getvalue()
    return result


@pytest.mark.parametrize("unit_count", [1, 3, 4])
def test_shared_score_tables_and_separate_quotes_follow_current_units(
    client,
    sources,
    unit_count,
):
    case = create(client, sources)
    base = f"/api/document-forms/cases/{case['id']}"
    recipients = [
        dict(case["recipients"][0], name=f"单位 {i} & <技术>")
        for i in range(unit_count)
    ]
    response = client.put(
        base,
        json={
            "revision": case["revision"],
            "name": case["name"],
            "values": {f["key"]: f["value"] for f in case["fields"]},
            "recipients": recipients,
        },
    )
    assert response.status_code == 200, response.text
    case = response.json()
    response = client.post(
        base + "/templates",
        data={"revision": case["revision"]},
        files=[
            ("files", (name, content))
            for name, content in supplemental_sources().items()
        ],
    )
    assert response.status_code == 200, response.text
    case = response.json()
    assert [t["name"] for t in case["templates"]] == [
        "01_商务谈判文件_模板.docx",
        "02_谈判邀请函_模板.docx",
        "03_投标报价一览表_模板.docx",
        "04_综合评分表_模板.docx",
        "05_综合评分汇总表_模板.docx",
    ]
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
    assert len(generation["files"]) == 3 + unit_count * 2
    assert generation["bundle_name"].startswith(
        main.project_name(case) + "_谈判材料_",
    )
    for file in generation["files"]:
        assert main.project_name(case) in file["name"]
        assert "模板" not in file["name"] and "打印" not in file["name"]
        assert all(c not in file["name"] for c in '<>:"/\\|?*')
        doc = Document(
            io.BytesIO(
                client.get(
                    base + f"/outputs/{generation['id']}/{file['name']}",
                ).content,
            ),
        )
        if file["name"].startswith("03_"):
            assert file["recipient"] in "\n".join(
                p.text for p in doc.paragraphs
            )
            assert all(
                not cell.text
                for row in doc.tables[0].rows[1:]
                for cell in row.cells[1:]
            )
        elif file["name"].startswith("04_"):
            assert file["print_copies"] == 7
            assert len(doc.tables) == (unit_count + 2) // 3
            names = [
                c.text for t in doc.tables for c in t.rows[0].cells if c.text
            ]
            assert names == [r["name"] for r in recipients]
        elif file["name"].startswith("05_"):
            assert len(doc.tables[0].rows) == unit_count + 1
            assert [r.cells[1].text for r in doc.tables[0].rows[1:]] == [
                r["name"] for r in recipients
            ]
            assert all(
                not c.text for r in doc.tables[0].rows[1:] for c in r.cells[2:]
            )
    # Reopening or renaming templates must not rewrite prior batch names/bytes.
    reopened = client.get(base).json()
    assert reopened["generations"][0] == generation
    assert reopened["fields"] == case["fields"]


def test_reserved_unit_context_and_filename_safety(sources):
    book = load_workbook(io.BytesIO(sources["变量管理表.xlsx"]))
    book["变量配置"].cell(2, 1, "participants.name")
    stream = io.BytesIO()
    book.save(stream)
    with pytest.raises(ValueError, match="保留变量"):
        engine.read_excel(stream.getvalue())
    case = {
        "name": "备用",
        "fields": [{"key": "project.name", "value": 'a/b:*?<>|"' * 40}],
    }
    template = {"title": "自定义\\文书" * 40}
    a = main.output_name(case, template, 1, {"name": "相同单位" * 80}, 1)
    b = main.output_name(case, template, 1, {"name": "相同单位" * 80}, 2)
    assert a != b and len(a) < 130 and not any(c in a for c in '<>:"/\\|?*')


def test_office_print_preview_all_pages_scope_cache_and_failure(
    client,
    sources,
    monkeypatch,
):
    case = create(client, sources)
    base = f"/api/document-forms/cases/{case['id']}"
    review = client.post(
        base + "/review",
        json={"revision": case["revision"]},
    ).json()
    case = client.post(
        base + "/generate",
        json={
            "revision": case["revision"],
            "review_token": review["review_token"],
            "confirmed": True,
        },
    ).json()
    generation = case["generations"][0]
    file = generation["files"][0]
    path = base + f"/print/{generation['id']}/{file['name']}"
    png = base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8"
        "/x8AAwMCAO+jN1kAAAAASUVORK5CYII=",
    )
    calls = []

    def run(args, **kwargs):
        assert kwargs["timeout"] == 90
        assert kwargs["env"]["OFFICECLI_NO_AUTO_RESIDENT"] == "1"
        assert Path(args[2]).is_file()
        calls.append(args)
        if "stats" in args:
            assert "--page-count" in args
            return types.SimpleNamespace(
                returncode=0,
                stdout=b'{"success":true,"data":{"pages":2}}',
            )
        assert args[args.index("--render") + 1] == "native"
        # A fresh read copy bypasses old residents that drop page filters.
        # Full-resolution native stitching keeps long documents readable.
        assert args[args.index("--page") + 1] == "1-2" and "--grid" not in args
        Path(args[-1]).write_bytes(png)
        return types.SimpleNamespace(returncode=0)

    monkeypatch.setattr(main, "office_cli", lambda: "officecli-test")
    monkeypatch.setattr(main.subprocess, "run", run)
    response = client.get(path)
    assert response.status_code == 200, response.text
    assert response.content == png and response.headers["X-Total-Pages"] == "2"
    assert response.headers["X-Preview-Engine"] == "officecli-native"
    assert response.headers["Cache-Control"] == "no-store"
    assert len(calls) == 2
    monkeypatch.setattr(
        main,
        "office_cli",
        lambda: (_ for _ in ()).throw(ValueError("unavailable")),
    )
    assert (
        client.get(path).content == png
    )  # Already rendered pages stay usable.
    assert len(calls) == 2
    assert client.get(path, headers={"X-Agent-Id": "other"}).status_code == 404
    assert (
        client.get(base + f"/print/{generation['id']}/填写数据.xlsx").status_code
        == 404
    )
    second = generation["files"][1]
    failure = client.get(base + f"/print/{generation['id']}/{second['name']}")
    assert failure.status_code == 503 and "文字预览" in failure.json()["detail"]
    reopened = client.get(base).json()
    assert reopened["generations"] == case["generations"]
    bundle = client.get(base + f"/outputs/{generation['id']}/全部文书.zip")
    with ZipFile(io.BytesIO(bundle.content)) as archive:
        assert not any(name.endswith(".png") for name in archive.namelist())


def test_print_preview_per_page_cache_and_bounds(client, sources, monkeypatch):
    case = create(client, sources)
    base = f"/api/document-forms/cases/{case['id']}"
    review = client.post(
        base + "/review",
        json={"revision": case["revision"]},
    ).json()
    case = client.post(
        base + "/generate",
        json={
            "revision": case["revision"],
            "review_token": review["review_token"],
            "confirmed": True,
        },
    ).json()
    generation = case["generations"][0]
    path = base + f"/print/{generation['id']}/{generation['files'][0]['name']}"
    png = b"\x89PNG\r\n\x1a\n"
    calls = []

    def page_run(args, **kwargs):
        assert kwargs["env"]["OFFICECLI_NO_AUTO_RESIDENT"] == "1"
        calls.append(args)
        if "stats" in args:
            return types.SimpleNamespace(returncode=0, stdout=b'{"pages":2}')
        assert args[args.index("--page") + 1] in ("1", "2")
        assert (
            args[args.index("--render") + 1] == "native"
            and "--grid" not in args
        )
        Path(args[-1]).write_bytes(png)
        return types.SimpleNamespace(returncode=0)

    monkeypatch.setattr(main, "office_cli", lambda: "officecli-test")
    monkeypatch.setattr(main.subprocess, "run", page_run)
    assert client.get(path + "?pages=true").json() == {"pages": 2}
    assert len(calls) == 1  # Metadata does not create a stitched image.
    for number in (1, 2):
        sheet = client.get(path + f"?page={number}")
        assert sheet.content == png and sheet.headers["X-Total-Pages"] == "2"
    assert len(calls) == 3
    monkeypatch.setattr(
        main,
        "office_cli",
        lambda: (_ for _ in ()).throw(ValueError("offline")),
    )
    assert client.get(path + "?pages=true").json() == {"pages": 2}
    assert client.get(path + "?page=1").content == png
    assert client.get(path + "?page=3").status_code == 404
    assert client.get(path + "?page=0").status_code == 422
    assert (
        client.get(
            path + "?page=1",
            headers={"X-Agent-Id": "other"},
        ).status_code
        == 404
    )
    assert len(calls) == 3


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
        workbook = load_workbook(
            io.BytesIO(
                archive.read(
                    main.project_name(case) + "_填写数据.xlsx",
                ),
            ),
        )
        assert workbook.sheetnames == [
            "变量配置",
            "受邀单位",
            "校核规则",
            "日期校核",
        ]
        audit = json.loads(
            archive.read(main.project_name(case) + "_核对记录.json"),
        )
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


def test_multiline_values_keep_each_paragraph_indent_font_and_spacing():
    # Inspect OOXML for character-based indentation and real paragraph breaks.
    # pylint: disable=protected-access
    from docx.oxml.ns import qn
    from docx.shared import Pt

    doc = Document()
    for p in (
        doc.add_paragraph("{{ research.contents }}"),
        doc.add_table(rows=1, cols=1).cell(0, 0).paragraphs[0],
        doc.sections[0].header.paragraphs[0],
    ):
        if not p.text:
            p.add_run("{{ research.contents }}")
        p.paragraph_format.first_line_indent = Pt(24)
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(6)
        ind = p._p.pPr.find(qn("w:ind"))
        ind.set(qn("w:firstLineChars"), "200")
        p.runs[0].font.name = "Times New Roman"
        p.runs[0].font.size = Pt(12)
        p.runs[0].bold = True
    stream = io.BytesIO()
    doc.save(stream)
    result = Document(
        io.BytesIO(
            engine.render_template(
                stream.getvalue(),
                [
                    {
                        "key": "research.contents",
                        "kind": "textarea",
                        "value": "（1）A & B 2026\r\n第二段 <85%>\n第三段",
                    },
                ],
            ),
        ),
    )
    for paragraphs in (
        result.paragraphs,
        result.tables[0].cell(0, 0).paragraphs,
        result.sections[0].header.paragraphs,
    ):
        assert [p.text for p in paragraphs] == [
            "（1）A & B 2026",
            "第二段 <85%>",
            "第三段",
        ]
        for p in paragraphs:
            assert p.paragraph_format.first_line_indent == Pt(24)
            assert (
                p._p.pPr.find(qn("w:ind")).get(qn("w:firstLineChars")) == "200"
            )
            assert p.paragraph_format.line_spacing == 1.5
            assert p.paragraph_format.space_after == Pt(6)
            assert p.runs[0].font.name == "Times New Roman"
            assert p.runs[0].font.size == Pt(12) and p.runs[0].bold
            assert not p._p.xpath(".//w:br")


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
