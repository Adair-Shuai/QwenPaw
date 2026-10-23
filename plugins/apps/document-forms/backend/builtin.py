# -*- coding: utf-8 -*-
"""Portable standard templates, without local projects or Office history."""

import hashlib
import io
import json
import re
from pathlib import Path
from xml.etree import ElementTree
from zipfile import ZipFile

LIBRARY = Path(__file__).resolve().parents[1] / "templates"
NAMES = (
    "01_商务谈判文件_模板.docx",
    "02_谈判邀请函_模板.docx",
    "03_投标报价一览表_模板.docx",
    "04_综合评分表_模板.docx",
    "05_综合评分汇总表_模板.docx",
)
PLAN_NAMES = ("01_外协必要性说明_模板.docx", "02_科研计划填报_模板.xlsx")
ALL_NAMES = NAMES + PLAN_NAMES


def additional_shared_fields():
    definitions = (
        (
            "project.executing_unit",
            "执行单位",
            "基本信息",
            "text",
            "填写本项目的执行单位，不必与谈判邀请单位相同。",
        ),
        ("funding.project_name", "依托科研项目名称", "依托项目与经费", "textarea", ""),
        (
            "funding.budget_note",
            "依托科研项目经费（万元）",
            "依托项目与经费",
            "text",
            "沿用原表的总经费、到所经费与已外协经费填写口径；原表中以斜线分隔的写法不自动拆分。",
        ),
        ("funding.wbs", "经费编号（WBS 编码）", "依托项目与经费", "text", ""),
        ("funding.channel", "列支渠道", "依托项目与经费", "text", ""),
        ("funding.source", "经费来源", "依托项目与经费", "text", ""),
    )
    return [
        {
            "key": key,
            "label": label,
            "group": group,
            "kind": kind,
            "required": False,
            "value": "",
            "help": help_text,
        }
        for key, label, group, kind, help_text in definitions
    ]


def plan_fields(common=()):
    basic = {f["key"]: f for f in blank_fields() + additional_shared_fields()}
    current = {f["key"]: f for f in common}
    keys = (
        "project.name",
        "project.background",
        "research.contents",
        "project.executing_unit",
        "funding.project_name",
        "funding.budget_note",
        "funding.wbs",
        "funding.channel",
        "funding.source",
    )
    fields = [
        dict(
            basic[key],
            value=current.get(key, {}).get("value", ""),
            required=True,
            scope="shared",
        )
        for key in keys
    ]
    definitions = (
        ("period", "申报批次", "申报信息", "text", "例如：2026年第二季度。"),
        ("code", "科研计划编号", "申报信息", "text", "填写本次上报编号，与项目编号分别保存。"),
        ("name", "本次申报计划名称", "申报信息", "text", "可与统一项目名称不同，不会改写谈判文书中的项目名称。"),
        ("budget_wan", "本次申报外协经费（万元）", "申报信息", "number", "与商务谈判最高限价分开维护。"),
        (
            "classification",
            "必要性分类",
            "外协必要性",
            "text",
            "A.技术创新探索类；B.技术引进类；C.实物工作量类。",
        ),
        (
            "necessity",
            "外协必要性说明",
            "外协必要性",
            "textarea",
            "说明为何需要外部技术团队支持；生成说明时与项目背景衔接。",
        ),
        (
            "partners",
            "本次计划拟合作单位",
            "拟合作单位",
            "textarea",
            "每家单位一行，与商务谈判阶段的受邀单位分开保存。",
        ),
        ("category", "计划类别", "申报信息", "text", "例如：技术服务（科技）。"),
        ("notes", "申报备注", "申报信息", "textarea", ""),
    )
    fields.extend(
        {
            "key": "plan." + key,
            "label": label,
            "group": group,
            "kind": kind,
            "help": help_text,
            "required": key != "notes",
            "value": current.get("plan." + key, {}).get(
                "value",
                current.get("project.name", {}).get("value", "")
                if key == "name"
                else "",
            ),
        }
        for key, label, group, kind, help_text in definitions
    )
    return fields


def verify_public_workbook(archive):
    names = archive.namelist()
    if "xl/sharedStrings.xml" in names:
        raise ValueError("应用自带表格模板不应残留未使用的共享文字")
    xml_ns = {
        "m": "http://schemas.openxmlformats.org/" "spreadsheetml/2006/main",
    }
    sheet = ElementTree.fromstring(archive.read("xl/worksheets/sheet1.xml"))
    slots = {
        cell.get("r"): "".join(cell.itertext())
        for cell in sheet.findall(".//m:c", xml_ns)
    }
    if any(
        not re.fullmatch(
            r"{{\s*[a-zA-Z][\w.]*\s*}}",
            slots.get(column + "3", ""),
        )
        for column in "BCDEFGHIJKLMN"
    ):
        raise ValueError("应用自带表格模板含项目填写值或缺少变量")


def verify_public_template(content):
    """Reject editor history and private content in public templates."""
    with ZipFile(io.BytesIO(content)) as archive:
        names = archive.namelist()
        if len(set(names)) != len(names) or not (
            {"word/document.xml", "xl/workbook.xml"} & set(names)
        ):
            raise ValueError("应用自带模板的文档结构无效")
        if "xl/workbook.xml" in names:
            verify_public_workbook(archive)
        for name in names:
            if (
                name.startswith(
                    (
                        "customXml/",
                        "word/embeddings/",
                        "xl/externalLinks/",
                        "xl/embeddings/",
                        "xl/comments",
                        "xl/threadedComments",
                        "xl/connections",
                    ),
                )
                or name == "docProps/custom.xml"
                or "vbaProject" in name
                or ".." in Path(name).parts
                or "\\" in name
            ):
                raise ValueError("应用自带模板含不应发布的附加数据")
            if not name.endswith((".xml", ".rels")):
                continue
            root = ElementTree.fromstring(archive.read(name))
            for node in root.iter():
                tag = node.tag.rsplit("}", 1)[-1]
                if tag in {"fldData", "docVars"} or (
                    tag == "instrText"
                    and (node.text or "").strip().startswith("ADDIN")
                ):
                    raise ValueError("应用自带模板仍含旧插件数据")
                if (
                    tag == "Relationship"
                    and node.get("TargetMode") == "External"
                ):
                    if (
                        node.get("Target", "")
                        .lower()
                        .startswith(("file:", "mailto:"))
                    ):
                        raise ValueError("应用自带模板含本机或个人链接")
                if name == "docProps/core.xml" and tag in {
                    "creator",
                    "lastModifiedBy",
                }:
                    if node.text != "UGSci":
                        raise ValueError("应用自带模板仍含个人编辑信息")


def load_templates(stage_id="negotiation"):
    entries = json.loads((LIBRARY / "index.json").read_text(encoding="utf-8"))
    if [entry["name"] for entry in entries] != list(ALL_NAMES):
        raise ValueError("应用自带模板清单不完整")
    result = {}
    for entry in entries:
        content = (LIBRARY / entry["name"]).read_bytes()
        if hashlib.sha256(content).hexdigest() != entry["sha256"]:
            raise ValueError("应用自带模板校验失败，请重新安装应用")
        verify_public_template(content)
        wanted = PLAN_NAMES if stage_id == "plan" else NAMES
        if entry["name"] in wanted:
            result[entry["name"]] = content
    return result


def blank_fields():
    fields = json.loads(
        (LIBRARY / "variables.json").read_text(encoding="utf-8"),
    )
    if not fields or any("value" in field for field in fields):
        raise ValueError("配套 Excel 的字段配置不应包含项目填写值")
    return [dict(field, value="") for field in fields]


def starter_files():
    # The host loads backend as a subpackage of the dynamic plugin root.
    from .engine import (  # pylint: disable=relative-beyond-top-level
        export_excel,
        recipient_defaults,
    )

    files = load_templates()
    files.update(
        {
            "上报计划/" + name: content
            for name, content in load_templates("plan").items()
        },
    )
    files["上报计划/上报计划_变量管理表.xlsx"] = export_excel(
        {
            "fields": plan_fields(),
            "recipients": [],
            "rules": [],
            "templates": [],
        },
    )
    files["变量管理表.xlsx"] = export_excel(
        {
            "fields": blank_fields(),
            "recipients": recipient_defaults(
                [{"name": "", "start": "", "end": ""} for _ in range(3)],
            ),
            "rules": [],
            "templates": [],
        },
    )
    return files
