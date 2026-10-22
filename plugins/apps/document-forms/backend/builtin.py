# -*- coding: utf-8 -*-
"""Portable standard templates, without local projects or Office history."""

import hashlib
import io
import json
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


def verify_public_template(content):
    """Reject editor history and private content in public templates."""
    with ZipFile(io.BytesIO(content)) as archive:
        names = archive.namelist()
        if len(set(names)) != len(names) or "word/document.xml" not in names:
            raise ValueError("应用自带模板的文档结构无效")
        for name in names:
            if (
                name.startswith(("customXml/", "word/embeddings/"))
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


def load_templates():
    entries = json.loads((LIBRARY / "index.json").read_text(encoding="utf-8"))
    if [entry["name"] for entry in entries] != list(NAMES):
        raise ValueError("应用自带模板清单不完整")
    result = {}
    for entry in entries:
        content = (LIBRARY / entry["name"]).read_bytes()
        if hashlib.sha256(content).hexdigest() != entry["sha256"]:
            raise ValueError("应用自带模板校验失败，请重新安装应用")
        verify_public_template(content)
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
