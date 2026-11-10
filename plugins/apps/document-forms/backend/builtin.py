# -*- coding: utf-8 -*-
"""Portable standard templates, without local projects or Office history."""

import hashlib
import io
import json
import re
from decimal import Decimal, InvalidOperation
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
    "06_服务选商实施方案_模板.docx",
)
PLAN_NAMES = ("01_外协必要性说明_模板.docx", "02_科研计划填报_模板.xlsx")
SELECTION_NAMES = (
    "01_论证意见及签字表_模板.docx",
    "02_非招标方案填报_模板.xlsx",
)
ACCEPTANCE_NAMES = ("01_项目验收意见_模板.docx",)
ALL_NAMES = NAMES + PLAN_NAMES + SELECTION_NAMES + ACCEPTANCE_NAMES
LEGACY_PLAN_WORD = (
    "64492548958b8ae57d825be95d6a5ae6469b0adbd26a89e0efa64c1d8f8e3e0a"
)


SELECTION_CHOICES = {
    "selection.plan_type": [
        "科研设备购置计划",
        "委托研发/技术服务计划",
        "测试化验加工计划",
        "资料出版翻译计划",
        "租赁维护维修计划",
        "大宗材料购置计划",
        "内部测试分析计划",
        "其他",
    ],
    "selection.funding_source": ["股份", "集团"],
}


def selection_budget(common):
    """Use exact decimal yuan-to-wan conversion from the shared profile."""
    value = next(
        (f["value"] for f in common if f["key"] == "budget.ceiling_number"),
        "",
    )
    try:
        amount = Decimal(str(value).replace(",", "").replace("，", "").strip())
        if not amount.is_finite() or amount < 0 or len(str(value)) > 50:
            return ""
        return (
            format(amount / Decimal(10000), "f").rstrip("0").rstrip(".")
            if amount % 10000
            else format(amount / Decimal(10000), ".0f")
        )
    except (InvalidOperation, ValueError):
        return ""


def selection_linked_prefix(parts, values):
    return "".join(
        (
            part
            if isinstance(part, str)
            else values.get(part["field"], "").strip()
            or f"（{part['label']}待填写）"
        )
        for part in parts
    )


def selection_opinion_notes(field, value, prefix):
    """Retain authored findings while replacing only the linked fact block."""
    for previous in (field.get("linked_prefix"), prefix):
        if previous and value.startswith(previous):
            return value[len(previous) :]
    if not field.get("linked_parts"):
        if field["key"] == "selection.reliability":
            match = re.match(
                r"^\s*《.+?》.*?计划金额为[^。]+。\s*依托《.+?》.*?"
                r"依托项目经费为[^，。]+万元[，。]\s*",
                value,
                re.S,
            )
            if match:
                return value[match.end() :]
        elif field["key"] == "selection.qualification_review":
            match = re.search(r"分别为[^。；\n]+[。；]?", value)
            if match:
                before = value[: match.start()].rstrip("，,：: ")
                return (before + "。" if before else "") + value[match.end() :]
    return value


OPINION_VARIABLES = {
    "project.name": "项目名称",
    "selection.year": "计划年度",
    "selection.budget_wan": "计划批复金额（万元）",
    "funding.project_name": "依托项目名称",
    "funding.wbs": "依托项目 WBS 编码",
    "funding.amount_wan": "依托项目经费（万元）",
    **{f"selection.partner{i}_name": f"候选单位{i}" for i in range(1, 4)},
}
OPINION_DEFAULTS = {
    "selection.reliability": (
        "《【project.name】》为【selection.year】年审查通过的技术服务实施计划，计划金额为【selection.budge"
        "t_wan】万元。依托《【funding.project_name】》，WBS编码【funding.wbs】，依托项目经费为【fundin"
        "g.amount_wan】万元，"
    ),
    "selection.qualification_review": (
        "通过调研业内情况，综合对比了多家单位的优势技术、专业特色及历史业绩等，优选三家单位开展论证与资质审查，分别为【selection.part"
        "ner1_name】、【selection.partner2_name】、【selection.partner3_name】。"
    ),
}
OPINION_TOKEN = re.compile(r"【([a-z][a-z0-9_.]*(?:\|[0-6])?)】")


def opinion_variable(key, values):
    base, _, precision = key.partition("|")
    value = values.get(base, "").strip()
    if precision and value:
        try:
            number = Decimal(value)
            text = format(number, "f")
            whole, _, fraction = text.partition(".")
            value = whole + "." + fraction.ljust(int(precision), "0")
        except InvalidOperation:
            pass
    return value or f"（{OPINION_VARIABLES[base]}待填写）"


def opinion_template(field, text):
    """Replace variable values in place without rewriting authored prose."""
    if field["key"] == "selection.reliability":
        patterns = [
            (r"^\s*《([^》]+)》", "project.name"),
            (r"为(\d{4})(?=年审查通过)", "selection.year"),
            (
                r"(?:计划金额为|批复金额为|本次论证预算为)([\d.,]+)(?=万元)",
                "selection.budget_wan",
            ),
            (r"依托《([^》]+)》", "funding.project_name"),
            (r"WBS编码(?:为)?([^，。\s]+)", "funding.wbs"),
            (r"依托项目经费为([\d.,]+)(?=万元)", "funding.amount_wan"),
        ]
        for pattern, key in patterns:

            def replace(match, key=key):
                original = match.group(1)
                precision = (
                    len(original.partition(".")[2])
                    if key in {"selection.budget_wan", "funding.amount_wan"}
                    else 0
                )
                token = key + (f"|{precision}" if 0 < precision <= 6 else "")
                offset = match.start(1) - match.start()
                return (
                    match.group()[:offset]
                    + "【"
                    + token
                    + "】"
                    + match.group()[offset + len(original) :]
                )

            text = re.sub(pattern, replace, text, count=1)
    else:
        match = re.search(r"分别为([^。；\n]+)", text)
        if match and "【selection.partner" not in match.group(1):
            names = re.split(r"([、，,])", match.group(1))
            if len(names) == 5:
                for i in range(3):
                    names[i * 2] = f"【selection.partner{i+1}_name】"
                text = (
                    text[: match.start(1)]
                    + "".join(names)
                    + text[match.end(1) :]
                )
    # Existing inline references are also retained when only prose was edited.
    return text


def refresh_selection_opinions(fields):
    current = {f["key"]: f["value"] for f in fields}
    for field in fields:
        if field["key"] not in OPINION_DEFAULTS or not field.get(
            "linked_variables",
        ):
            continue
        variables = dict(field["linked_variables"])
        variables.update(
            {k: v for k, v in current.items() if k in OPINION_VARIABLES},
        )
        if "linked_template" not in field or field["value"] != field.get(
            "linked_rendered",
            field["value"],
        ):
            text = field["value"]
            field["linked_template"] = (
                opinion_template(field, text)
                if text
                else OPINION_DEFAULTS[field["key"]]
            )
        parts, cursor = [], 0
        for match in OPINION_TOKEN.finditer(field["linked_template"]):
            key = match.group(1)
            if key.partition("|")[0] not in OPINION_VARIABLES:
                continue
            parts.append(field["linked_template"][cursor : match.start()])
            parts.append(
                {
                    "field": key,
                    "label": OPINION_VARIABLES[key.partition("|")[0]],
                    "value": opinion_variable(key, variables),
                },
            )
            cursor = match.end()
        parts.append(field["linked_template"][cursor:])
        rendered = "".join(
            part if isinstance(part, str) else part["value"] for part in parts
        )
        field.update(
            linked_parts=parts,
            linked_variables=variables,
            linked_rendered=rendered,
            value=rendered,
            linked_schema=2,
        )
        field.pop("linked_prefix", None)
        field["opinion_empty"] = (
            not field["linked_template"].strip()
            or field["linked_template"] == OPINION_DEFAULTS[field["key"]]
        )


def link_selection_opinions(fields, references):
    common = {f["key"]: f["value"] for f in fields}
    common.update(references)
    for field in fields:
        if field["key"] not in OPINION_DEFAULTS:
            continue
        field.update(
            linked_variables={k: common.get(k, "") for k in OPINION_VARIABLES},
            opinion_required=True,
            help="【】内的资料自动关联前面填写的变量；可以直接编辑正文，引用随来源更新。",
        )
    refresh_selection_opinions(fields)


def additional_shared_fields():
    definitions = (
        (
            "project.executing_unit",
            "执行单位",
            "基本信息",
            "text",
            "填写本项目的执行单位，不必与谈判邀请单位相同。",
        ),
        (
            "funding.project_name",
            "依托科研项目名称",
            "依托项目与经费",
            "textarea",
            "",
        ),
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
        (
            "funding.amount_wan",
            "依托主项目金额（万元）",
            "依托项目与经费",
            "number",
            "填写主项目总金额，与上报计划的经费说明、阶段预算分别保存。",
        ),
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
        (
            "code",
            "科研计划编号",
            "申报信息",
            "text",
            "填写本次上报编号，与项目编号分别保存。",
        ),
        (
            "name",
            "本次申报计划名称",
            "申报信息",
            "text",
            "可与统一项目名称不同，不会改写谈判文书中的项目名称。",
        ),
        (
            "budget_wan",
            "本次申报外协经费（万元）",
            "申报信息",
            "number",
            "与商务谈判最高限价分开维护。",
        ),
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
            "填写外协必要性说明的完整段落，生成文件时直接使用，不拼接项目背景。",
        ),
        (
            "partners",
            "本次计划拟合作单位",
            "拟合作单位",
            "textarea",
            "每家单位一行，与商务谈判阶段的受邀单位分开保存。",
        ),
        (
            "category",
            "计划类别",
            "申报信息",
            "text",
            "例如：技术服务（科技）。",
        ),
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
                (
                    current.get("project.name", {}).get("value", "")
                    if key == "name"
                    else ""
                ),
            ),
        }
        for key, label, group, kind, help_text in definitions
    )
    return fields


def selection_fields(common=(), references=None):
    """Selection has its own budget, candidates and signed opinion content."""
    basic = {f["key"]: f for f in blank_fields() + additional_shared_fields()}
    current = {f["key"]: f for f in common}
    keys = (
        "project.name",
        "funding.project_name",
        "funding.amount_wan",
        "contact.department",
        "contact.name",
        "contact.office_phone",
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
    definitions = [
        ("date", "论证日期", "论证安排", "date", ""),
        ("location", "论证地点", "论证安排", "text", ""),
        (
            "plan_type",
            "依托计划类型",
            "非招标方案",
            "text",
            "例如：委托研发/技术服务计划。",
        ),
        ("year", "计划年度", "非招标方案", "number", "填写四位年份。"),
        (
            "plan_name",
            "依托计划名称",
            "非招标方案",
            "text",
            "填写系统中的完整计划名称。",
        ),
        (
            "budget_wan",
            "本次论证预算（万元）",
            "非招标方案",
            "number",
            "自动引用基础信息中的项目最高限价（元），换算为万元；请在基础信息填报中修改。",
        ),
        (
            "funding_source",
            "本次方案经费来源",
            "非招标方案",
            "text",
            "按本次系统填报口径填写，与基础信息中的经费来源分别保存。",
        ),
        (
            "relationship",
            "候选单位间关联关系",
            "非招标方案",
            "text",
            "填写“否”；如有关联，请如实说明。",
        ),
        (
            "reliability",
            "计划和依托项目的可靠性",
            "论证意见",
            "textarea",
            "填写完整段落，并核对计划年度、金额、依托项目和 WBS 编码。",
        ),
        (
            "overview",
            "项目概况",
            "论证意见",
            "textarea",
            "两份材料共用此段，按系统要求控制在 500 字以内。",
        ),
        (
            "qualification_review",
            "候选单位调研与资质审查意见",
            "论证意见",
            "textarea",
            "填写实际调研和审查情况，不预设审查通过。",
        ),
        (
            "conclusion",
            "论证结论与选商方式",
            "论证意见",
            "textarea",
            "填写实际论证结论、选商方式和组织实施要求；生成文件不等于完成审批。",
        ),
    ]
    for index in range(1, 4):
        definitions.extend(
            [
                (
                    f"partner{index}_name",
                    f"单位{index}",
                    f"候选单位 {index}",
                    "text",
                    "与上报计划拟合作单位、商务谈判受邀单位分别保存。",
                ),
                (
                    f"partner{index}_profile",
                    f"单位{index}技术特色与业绩",
                    f"候选单位 {index}",
                    "textarea",
                    "直接填写说明内容，文书在段首自动带入单位名称。",
                ),
            ],
        )
    for index in range(1, 6):
        definitions.extend(
            (f"member{index}_{key}", label, f"论证成员 {index}", "text", "")
            for key, label in [
                ("name", f"成员{index}姓名"),
                ("unit", f"成员{index}单位"),
                ("title", f"成员{index}职务/职称"),
                ("category", f"成员{index}人员类别"),
            ]
        )
    fields.extend(
        {
            "key": "selection." + key,
            "label": label,
            "group": group,
            "kind": kind,
            "help": help_text,
            "required": True,
            "value": current.get("selection." + key, {}).get(
                "value",
                (
                    current.get("funding.source", {}).get("value", "")
                    if key == "funding_source"
                    else ""
                ),
            ),
        }
        for key, label, group, kind, help_text in definitions
    )
    for field in fields:
        if field["key"] in SELECTION_CHOICES:
            field["options"] = list(SELECTION_CHOICES[field["key"]])
        if field["key"] == "selection.budget_wan":
            field.update(value=selection_budget(common), read_only=True)
            if references and references.get("approved_budget"):
                field.update(
                    value=references["approved_budget"],
                    help="自动引用计划批复金额；未上传有效批复时，按基础信息中的最高限价换算为万元。",
                )
        if references is not None and field["key"] in {
            "project.name",
            "funding.project_name",
            "funding.amount_wan",
        }:
            field.update(
                read_only=True,
                value=references.get(field["key"], ""),
                help="自动引用基础信息填报中的资料。",
            )
    if references is not None:
        link_selection_opinions(fields, references)
    return fields


def acceptance_fields(common=()):
    basic = {f["key"]: f for f in blank_fields() + additional_shared_fields()}
    current = {f["key"]: f for f in common}
    fields = [
        dict(
            basic["project.name"],
            value=current.get("project.name", {}).get("value", ""),
            required=True,
            scope="shared",
        ),
    ]
    definitions = (
        ("date", "验收日期", "验收安排", "date", ""),
        ("location", "验收地点", "验收安排", "text", ""),
        ("members", "验收组成员", "验收安排", "textarea", "成员姓名用顿号分隔。"),
        (
            "content",
            "验收意见正文",
            "验收意见",
            "textarea",
            "完整填写合同完成情况、材料完整性、成果评价及验收结论。",
        ),
    )
    fields.extend(
        {
            "key": "acceptance." + key,
            "label": label,
            "group": group,
            "kind": kind,
            "help": help_text,
            "required": True,
            "value": current.get("acceptance." + key, {}).get("value", ""),
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
    if slots.get("A1") == "非招标方案填报":
        expected = {f"C{row}" for row in range(2, 16)}
        if any(
            not re.fullmatch(
                r"(?:{{\s*[a-zA-Z][\w.]*\s*}})(?:、{{\s*[a-zA-Z][\w.]*\s*}})*",
                slots.get(cell, ""),
            )
            for cell in expected
        ):
            raise ValueError("非招标方案模板含项目填写值或缺少变量")
        return
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
        wanted = {
            "plan": PLAN_NAMES,
            "selection": SELECTION_NAMES,
            "acceptance": ACCEPTANCE_NAMES,
        }.get(stage_id, NAMES)
        if entry["name"] in wanted:
            result[entry["name"]] = content
    return result


def blank_fields():
    fields = json.loads(
        (LIBRARY / "variables.json").read_text(encoding="utf-8"),
    )
    if not fields or any("value" in field for field in fields):
        raise ValueError("配套 Excel 的字段配置不应包含项目填写值")
    return [
        dict(field, value="") for field in fields
    ] + implementation_fields()


def implementation_fields():
    """Details specific to the negotiation implementation scheme."""
    return [
        {
            "key": "implementation." + key,
            "label": label,
            "group": "服务选商实施方案",
            "kind": kind,
            "required": True,
            "value": "",
            "help": help_text,
        }
        for key, label, kind, help_text in (
            ("year", "实施方案年度", "text", "填写四位年份。"),
            (
                "expert_group",
                "谈判专家组组成",
                "textarea",
                "填写人数、成员来源及组成。",
            ),
            ("service_period", "服务周期", "text", "例如：2026年11月至2027年3月。"),
        )
    ]


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
    files.update(
        {
            "选商论证/" + name: content
            for name, content in load_templates("selection").items()
        },
    )
    files["选商论证/选商论证_变量管理表.xlsx"] = export_excel(
        {
            "fields": selection_fields(),
            "recipients": [],
            "rules": [],
            "templates": [],
        },
    )
    files.update(
        {
            "结题验收/" + name: content
            for name, content in load_templates("acceptance").items()
        },
    )
    files["结题验收/结题验收_变量管理表.xlsx"] = export_excel(
        {
            "fields": acceptance_fields(),
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
