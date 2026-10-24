# -*- coding: utf-8 -*-
"""Fill scalar Excel template cells without rebuilding their Office package."""

import io
import math
import re
import unicodedata
from decimal import Decimal, InvalidOperation
from zipfile import ZipFile, ZIP_DEFLATED

from lxml import etree

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
M = "{" + NS["m"] + "}"
SLOT = re.compile(r"{{\s*([^{}]+?)\s*}}")


def parse_xml(content):
    return etree.fromstring(
        content,
        etree.XMLParser(resolve_entities=False, no_network=True),
    )


def strings(archive):
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []
    root = parse_xml(archive.read("xl/sharedStrings.xml"))
    return ["".join(node.itertext()) for node in root.findall(M + "si")]


def cell_text(cell, shared):
    if cell.get("t") == "s":
        return shared[int(cell.findtext(M + "v"))]
    if cell.get("t") == "inlineStr":
        return "".join(cell.xpath(".//m:t/text()", namespaces=NS))
    return cell.findtext(M + "v") or ""


def worksheets(archive):
    for name in archive.namelist():
        if re.fullmatch(r"xl/worksheets/sheet\d+\.xml", name):
            yield name, parse_xml(archive.read(name))


def template_keys(content, validate_key):
    keys = set()
    with ZipFile(io.BytesIO(content)) as archive:
        shared = strings(archive)
        for _, sheet in worksheets(archive):
            for cell in sheet.findall(".//" + M + "c"):
                if "{{" in (cell.findtext(M + "f") or ""):
                    raise ValueError("Excel 公式中不能使用变量占位符")
                value = cell_text(cell, shared)
                if "{%" in value or (
                    "{{" in value and cell.find(M + "f") is not None
                ):
                    raise ValueError(
                        "Excel 模板仅支持单元格文字中的变量占位符"
                    )
                for match in SLOT.finditer(value):
                    keys.add(validate_key(match[1].strip()))
                if "{{" in SLOT.sub("", value) or "}}" in SLOT.sub("", value):
                    raise ValueError("Excel 模板中有未闭合的变量占位符")
    if not keys:
        raise ValueError("Excel 模板未找到 {{ project.name }} 形式的变量")
    return keys


def number(value):
    try:
        result = Decimal(str(value))
    except InvalidOperation as exc:
        raise ValueError("数值字段请填写有效数字") from exc
    if not result.is_finite() or len(str(value)) > 50:
        raise ValueError("数值字段超出 Excel 可用范围")
    return format(result, "f")


XML_SPACE = "{http://www.w3.org/XML/1998/namespace}space"


def fill_cell(cell, value, values, numeric):
    match = SLOT.fullmatch(value)
    rendered = SLOT.sub(lambda found: values[found[1].strip()], value)
    inline = cell.find(M + "is")
    keep_runs = False
    if inline is not None:
        texts = inline.findall(".//" + M + "t")
        replacements = [
            SLOT.sub(
                lambda found: values[found[1].strip()],
                node.text or "",
            )
            for node in texts
        ]
        keep_runs = "".join(replacements) == rendered
        if keep_runs:
            for node, replacement in zip(texts, replacements):
                node.text = replacement
                node.set(
                    XML_SPACE,
                    "preserve",
                )
    for node in list(cell):
        if node.tag in {M + "v", M + "is", M + "f"}:
            cell.remove(node)
    if match and match[1].strip() in numeric and rendered.strip():
        cell.set("t", "n")
        etree.SubElement(cell, M + "v").text = number(rendered)
    else:
        cell.set("t", "inlineStr")
        if keep_runs:
            cell.append(inline)
        else:
            text = etree.SubElement(
                etree.SubElement(cell, M + "is"),
                M + "t",
            )
            text.set(
                XML_SPACE,
                "preserve",
            )
            text.text = rendered
    return rendered


def cell_height(sheet, cell, rendered):
    column = re.match(r"[A-Z]+", cell.get("r"))[0]
    index = 0
    for char in column:
        index = index * 26 + ord(char) - 64
    width = next(
        (
            float(c.get("width", 10))
            for c in sheet.findall(".//" + M + "col")
            if int(c.get("min")) <= index <= int(c.get("max"))
        ),
        10,
    )
    lines = sum(
        max(
            1,
            math.ceil(
                sum(
                    2 if unicodedata.east_asian_width(c) in "WF" else 1
                    for c in line
                )
                / max(4, width - 1),
            ),
        )
        for line in rendered.split("\n")
    )
    # Allow font leading as well as glyph height for wrapped CJK text.
    return min(409, lines * 15 + 8)


def fill(content, fields):
    values = {f["key"]: str(f["value"]) for f in fields}
    numeric = {f["key"] for f in fields if f["kind"] == "number"}
    output = io.BytesIO()
    with ZipFile(io.BytesIO(content)) as source:
        shared = strings(source)
        modified = {}
        for name, sheet in worksheets(source):
            touched = False
            for row in sheet.findall(".//" + M + "sheetData/" + M + "row"):
                heights = []
                for cell in row.findall(M + "c"):
                    value = cell_text(cell, shared)
                    if not SLOT.search(value):
                        continue
                    rendered = fill_cell(cell, value, values, numeric)
                    field = next(
                        (
                            f
                            for f in fields
                            if value.strip() == "{{ " + f["key"] + " }}"
                        ),
                        None,
                    )
                    if field and field.get("options"):
                        for validation in sheet.findall(
                            ".//" + M + "dataValidation"
                        ):
                            if (
                                cell.get("r")
                                in validation.get("sqref", "").split()
                            ):
                                formula = validation.find(M + "formula1")
                                if formula is not None:
                                    formula.text = (
                                        '"' + ",".join(field["options"]) + '"'
                                    )
                    # Grow data rows; retain column widths and print settings.
                    if row.get("r") != "1":
                        heights.append(cell_height(sheet, cell, rendered))
                    touched = True
                if heights:
                    row.set("ht", str(max(float(row.get("ht", 15)), *heights)))
                    row.set("customHeight", "1")
            if touched:
                modified[name] = etree.tostring(
                    sheet,
                    xml_declaration=True,
                    encoding="UTF-8",
                    standalone=True,
                )
        with ZipFile(output, "w", ZIP_DEFLATED) as target:
            for entry in source.infolist():
                target.writestr(
                    entry,
                    modified.get(entry.filename, source.read(entry.filename)),
                )
    return output.getvalue()
