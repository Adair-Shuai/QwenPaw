"""Read the supported Hutubi templates by heading, preserving source row numbers."""

import math
import re
from contextlib import contextmanager
from datetime import date, datetime
from io import BytesIO
from zipfile import BadZipFile, ZipFile

import openpyxl
import xlrd


def label(value):
    value = str(value or "").lower().translate(str.maketrans("（）³⁴", "()34"))
    return re.sub(r"[\s()^]", "", value)


@contextmanager
def workbook(raw, filename):
    stream = BytesIO(raw)
    if filename.lower().endswith(".xlsx"):
        try:
            with ZipFile(stream) as archive:
                if sum(i.file_size for i in archive.infolist()) > 768 * 1024**2:
                    raise ValueError("工作簿解压后超过 768 MiB")
            book = openpyxl.load_workbook(stream, read_only=True, data_only=True)
        except (BadZipFile, KeyError, OSError) as exc:
            raise ValueError("无法读取 XLSX 工作簿") from exc
        try:
            yield {
                sheet.title: lambda s=sheet: s.iter_rows(values_only=True)
                for sheet in book
            }
        finally:
            book.close()
    elif filename.lower().endswith(".xls"):
        try:
            book = xlrd.open_workbook(file_contents=raw, on_demand=True)
        except xlrd.XLRDError as exc:
            raise ValueError("无法读取旧版 XLS 工作簿") from exc

        def rows(name):
            sheet = book.sheet_by_name(name)
            for i in range(sheet.nrows):
                yield [
                    (
                        xlrd.xldate_as_datetime(c.value, book.datemode)
                        if c.ctype == xlrd.XL_CELL_DATE
                        else c.value
                    )
                    for c in sheet.row(i)
                ]

        try:
            yield {name: lambda n=name: rows(n) for name in book.sheet_names()}
        finally:
            book.release_resources()
    else:
        raise ValueError("请选择 .xlsx 或 .xls 文件")


GAS = {"inj": "日注气量104m3", "prod": "日采气量104m3"}
WELL = {
    "day": "日期",
    "well": "井号",
    **GAS,
    "hours": "生产时间h",
    "tubing": "油压mpa",
    "casing": "套压mpa",
    "memo": "备注",
}
BLOCK = {"day": "日期", **GAS, "mode": "运行工况"}
MASTER = {
    "well": "井号",
    "external_id": "井id",
    "kind": "井别",
    "station": "站库",
    "line": "管线名称",
}
PIPE = {
    "code": "管道编号",
    "name": "管道名称",
    "start": "管线起点",
    "end": "管线终点",
    "length": "管线长度km",
    "diameter": "管道外径mm",
    "pressure": "管线设计压力mpa",
}


def records(get_rows, sheet, fields, optional=(), on_text=None):
    rows = iter(get_rows())
    headers = [label(v) for v in next(rows, ())]
    missing = [
        heading
        for key, heading in fields.items()
        if key not in optional and heading not in headers
    ]
    if missing:
        raise ValueError(f"{sheet} 缺少字段或单位不匹配：{'、'.join(missing)}")
    indices = {
        key: headers.index(heading)
        for key, heading in fields.items()
        if heading in headers
    }
    for line, row in enumerate(rows, 2):
        if not any(v is not None and v != "" for v in row):
            continue
        values = {
            key: row[idx] if idx < len(row) else None for key, idx in indices.items()
        }
        try:
            for key in (
                "inj",
                "prod",
                "hours",
                "tubing",
                "casing",
                "diameter",
                "length",
                "pressure",
            ):
                if key in values:
                    v = values[key]
                    if isinstance(v, str):
                        v = v.strip()
                    if v in (None, "", "-", "—", "/"):
                        values[key] = None
                    else:
                        try:
                            number = float(v)
                            if not math.isfinite(number):
                                raise ValueError("非有限数值")
                            values[key] = number
                        except (ValueError, TypeError):
                            on_text(sheet, line, fields[key], str(v))
                            values[key] = None
            if "day" in values:
                v = values["day"]
                values["day"] = (
                    v.date()
                    if isinstance(v, datetime)
                    else (
                        v
                        if isinstance(v, date)
                        else date.fromisoformat(str(v).strip().replace("/", "-"))
                    )
                ).isoformat()
            if "well" in values:
                values["well"] = str(values["well"] or "").strip().upper()
                if not values["well"]:
                    raise ValueError("缺少井号")
        except (TypeError, ValueError) as exc:
            raise ValueError(f"{sheet} 第 {line} 行：{exc}") from exc
        yield (line, *(values.get(key) for key in fields))


def identify(sheets):
    if "区块" in sheets and "单井" in sheets:
        return "production", [("区块", BLOCK, ("mode",)), ("单井", WELL, ("memo",))]
    for name in sheets:
        if name.startswith("单井基础数据"):
            return "master", [(name, MASTER, ())]
    first_sheet = next(iter(sheets.values()), None)
    first_row = next(iter(first_sheet()), ()) if first_sheet else ()
    if any("完井数据卡片" in str(c) for c in first_row):
        return "casing", [(name, {}, ()) for name in sheets]
    for name, rows in sheets.items():
        headers = {label(v) for v in next(iter(rows()), ())}
        if {"管道编号", "管线起点", "管线终点"} <= headers:
            return "pipe", [(name, PIPE, ())]
    raise ValueError(
        "未识别模板。请选择区块及单井汇总、单井基础数据或站外管道基础数据工作簿。"
    )


def casing_rows(get_rows, sheet):
    """Extract only identified single-well card sections and their labelled columns."""
    if not re.fullmatch(r"[A-Za-z]+[A-Za-z0-9-]*\d", sheet.strip()):
        return
    headers = {}
    for line, row in enumerate(get_rows(), 1):
        cells = [label(v) for v in row]
        cells = ["水泥返深" if v == "水泥返深m" else v for v in cells]
        fields = ("套管名称", "外径mm", "下深m", "水泥返深", "固井质量")
        if all(f in cells for f in fields):
            name_col = cells.index(fields[0])
            headers = {f: cells.index(f, name_col) for f in fields}
            continue
        if headers:
            values = [row[i] if i < len(row) else None for i in headers.values()]
            if not values[0] or values[1] in (None, "") or values[2] in (None, ""):
                break
            if any(label(v) in {"取心层位", "压力", "井段m", "收获率%"} for v in row):
                break
            yield (line, sheet.strip().upper(), sheet, *values)
