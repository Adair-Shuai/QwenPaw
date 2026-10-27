# -*- coding: utf-8 -*-
"""Read daily-volume records without modifying the source files."""

from __future__ import annotations

import csv
import math
import re
from dataclasses import dataclass, fields
from datetime import date, datetime
from pathlib import Path
from typing import Iterator


@dataclass(slots=True)
class Record:
    facility: str
    well: str
    day: str
    mode: str
    gas: float | None
    hours: float | None
    pressure: float | None
    casing: float | None
    water: float | None
    vent: float | None
    note: str
    file: str
    sheet: str
    row: int

    def values(self) -> tuple:
        return tuple(getattr(self, f.name) for f in fields(self))


def number(value) -> float | None:
    if value is None or str(value).strip() in (
        "",
        "--",
        "-",
        "无",
        "null",
        "None",
    ):
        return None
    try:
        n = float(str(value).replace(",", "").strip())
        return n if math.isfinite(n) else None
    except (TypeError, ValueError):
        return None


def day_string(value) -> str:
    if isinstance(value, (datetime, date)):
        return value.strftime("%Y-%m-%d")
    text = str(value).strip().replace("/", "-")
    match = re.match(r"^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s|T|$)", text)
    if not match:
        raise ValueError(f"无效日期：{value!r}")
    return date(*map(int, match.groups())).isoformat()


def _key(value) -> str:
    return re.sub(r"\s+", "", str(value)).replace("（", "(").replace("）", ")")


def _factor(header: str, kind: str) -> float:
    rules = {
        "gas": (
            (("万方", "万m3", "万m³", "万立方米"), 1.0),
            (("亿方", "亿m3", "亿m³", "亿立方米"), 10000.0),
            (("m3", "m³", "立方米"), 0.0001),
        ),
        "pressure": (
            (("兆帕", "MPa"), 1.0),
            (("kPa",), 0.001),
            (("bar",), 0.1),
        ),
        "hours": ((("小时", "h)"), 1.0),),
        "water": ((("吨", "t)"), 1.0),),
    }
    for units, factor in rules.get(kind, ()):
        if any(unit in header for unit in units):
            return factor
    raise ValueError(f"表头单位缺失或不支持：{header}；请在表头明确单位")


def _sheets(path: Path):
    if path.suffix.lower() == ".xls":
        try:
            import xlrd
        except ImportError as exc:
            raise ValueError(
                "读取 XLS 需要 xlrd：在平台 Python 环境安装 xlrd>=2,<3",
            ) from exc
        book = xlrd.open_workbook(str(path), on_demand=True)
        try:
            for sheet in book.sheets():

                def rows(current_sheet=sheet):
                    for i in range(current_sheet.nrows):
                        values = current_sheet.row_values(i)
                        for j, value in enumerate(values):
                            if (
                                current_sheet.cell_type(i, j)
                                == xlrd.XL_CELL_DATE
                            ):
                                values[j] = xlrd.xldate_as_datetime(
                                    value,
                                    book.datemode,
                                )
                        yield values

                yield sheet.name, sheet.nrows == 65536, rows()
                book.unload_sheet(sheet.name)
        finally:
            book.release_resources()
    elif path.suffix.lower() == ".xlsx":
        try:
            import openpyxl
        except ImportError as exc:
            raise ValueError("读取 XLSX 需要 openpyxl") from exc
        book = openpyxl.load_workbook(path, read_only=True, data_only=True)
        try:
            for sheet in book:
                yield sheet.title, False, sheet.iter_rows(values_only=True)
        finally:
            book.close()
    else:
        with path.open(encoding="utf-8-sig", newline="") as stream:
            yield path.stem, False, csv.reader(stream)


def read_file(
    path: Path,
    issues: list[dict],
    sources: list[dict],
) -> Iterator[Record]:
    """Recognize explicit Chinese headers and preserve row-level provenance."""
    for sheet, at_limit, rows in _sheets(path):
        if at_limit:
            issues.append(
                {
                    "code": "xls_row_limit",
                    "file": path.name,
                    "sheet": sheet,
                    "message": "达到 XLS 65,536 行上限，疑似导出截断，不能认定历史完整",
                },
            )
        mapping = None
        count = 0
        mode = ""
        for row_number, values in enumerate(rows, 1):
            if mapping is None:
                headers = [_key(x) for x in values]
                if not all(x in headers for x in ("储气库", "井号", "日期")):
                    if row_number >= 20:
                        raise ValueError(
                            f"{path.name}/{sheet}：前 20 行没有储气库、井号、日期表头",
                        )
                    continue
                mapping, mode = _recognize_columns(headers, path, sheet)
                sources.append(
                    {
                        "file": path.name,
                        "sheet": sheet,
                        "mode": mode,
                        "header_row": row_number,
                        "columns": {
                            k: headers[v[0]] for k, v in mapping.items()
                        },
                        "xls_row_limit": at_limit,
                    },
                )
                continue
            if not any(str(x or "").strip() for x in values):
                continue

            def raw(name, row_mapping=mapping, row_values=values):
                col = row_mapping.get(name, (-1, 1))[0]
                return row_values[col] if 0 <= col < len(row_values) else None

            try:
                facility, well = (
                    str(raw("facility") or "").strip(),
                    str(raw("well") or "").strip(),
                )
                if not facility or not well:
                    raise ValueError("储气库或井号为空")
                day = day_string(raw("day"))
            except ValueError as exc:
                issues.append(
                    {
                        "code": "invalid_identity",
                        "file": path.name,
                        "sheet": sheet,
                        "row": row_number,
                        "message": str(exc),
                    },
                )
                continue
            nums = _read_measurements(
                raw,
                mapping,
                issues,
                path,
                sheet,
                row_number,
            )
            count += 1
            yield Record(
                facility,
                well,
                day,
                mode,
                **nums,
                note=str(raw("note") or "")[:2000],
                file=path.name,
                sheet=sheet,
                row=row_number,
            )
        if mapping is None:
            raise ValueError(f"{path.name}/{sheet}：没有可识别表头")
        sources[-1]["accepted_rows"] = count


def _recognize_columns(headers, path, sheet):
    """Read explicit column identities and physical units."""
    injection = [i for i, x in enumerate(headers) if x.startswith("日注气量")]
    production = [i for i, x in enumerate(headers) if x.startswith("日采气量")]
    if len(injection) + len(production) != 1:
        raise ValueError(
            f"{path.name}/{sheet}：需唯一的日注气量或日采气量列（带单位）",
        )
    mode = "injection" if injection else "withdrawal"
    gas_col = (injection or production)[0]
    mapping = {
        "facility": (headers.index("储气库"), 1),
        "well": (headers.index("井号"), 1),
        "day": (headers.index("日期"), 1),
        "gas": (gas_col, _factor(headers[gas_col], "gas")),
    }
    for name, prefix, kind in (
        ("hours", "生产时间", "hours"),
        ("pressure", "油压", "pressure"),
        ("casing", "套压", "pressure"),
        ("water", "日产水量", "water"),
        ("vent", "放空气量", "gas"),
        ("note", "备注", "text"),
    ):
        columns = [i for i, x in enumerate(headers) if x.startswith(prefix)]
        if len(columns) > 1:
            raise ValueError(f"{path.name}/{sheet}：重复列 {prefix}")
        if columns:
            col = columns[0]
            mapping[name] = (
                col,
                (1 if kind == "text" else _factor(headers[col], kind)),
            )
    return mapping, mode


def _read_measurements(raw, mapping, issues, path, sheet, row_number):
    """Read measurements while preserving missing values and provenance."""
    nums = {}
    for name in (
        "gas",
        "hours",
        "pressure",
        "casing",
        "water",
        "vent",
    ):
        value = raw(name)
        n = number(value)
        if (
            n is None
            and value is not None
            and str(value).strip() not in ("", "--", "-", "无")
        ):
            issues.append(
                {
                    "code": "invalid_number",
                    "file": path.name,
                    "sheet": sheet,
                    "row": row_number,
                    "field": name,
                    "message": f"非数值：{str(value)[:80]}",
                },
            )
        if n is not None:
            n *= mapping.get(name, (-1, 1))[1]
            if (name == "hours" and not 0 <= n <= 24) or (
                name != "hours" and n < 0
            ):
                issues.append(
                    {
                        "code": "invalid_range",
                        "file": path.name,
                        "sheet": sheet,
                        "row": row_number,
                        "field": name,
                        "message": f"无效取值：{n}",
                    },
                )
                n = None
        nums[name] = n
    return nums
