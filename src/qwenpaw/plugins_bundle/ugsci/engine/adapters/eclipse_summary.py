# -*- coding: utf-8 -*-
"""Readers for Eclipse binary summary files (``SMSPEC``/``UNSMRY``).

Eclipse writes these files using the classic Fortran *fortio* record format.
When the optional OPM ``resdata`` package is installed we use its maintained
reader.  A small, dependency-free reader is kept as a fallback so the UGSci
runtime can still expose the common field vectors on a clean installation.
"""
from __future__ import annotations

import math
import re
import struct
from datetime import datetime, timedelta
from pathlib import Path
from typing import Iterable

from .base import SimSummary


def _records(path: Path) -> Iterable[bytes]:
    data = path.read_bytes()
    offset = 0
    while offset + 8 <= len(data):
        size = struct.unpack(">i", data[offset : offset + 4])[0]
        if size < 0 or size > 64 * 1024 * 1024 or offset + size + 8 > len(data):
            raise ValueError(f"invalid fortio record at offset {offset}")
        end = offset + 4 + size
        if data[end : end + 4] != data[offset : offset + 4]:
            raise ValueError(f"fortio record marker mismatch at offset {offset}")
        yield data[offset + 4 : end]
        offset = end + 4
    if offset != len(data):
        raise ValueError("truncated fortio file")


def _element_width(kind: str) -> int | None:
    if kind in {"INTE", "REAL", "LOGI"}:
        return 4
    if kind == "DOUB":
        return 8
    if kind == "CHAR":
        return 8
    if re.fullmatch(r"C\d{3}", kind):
        return int(kind[1:])
    if kind == "MESS":
        return 0
    return None


def _header(payload: bytes) -> tuple[str, str, int, bytes] | None:
    if len(payload) < 16:
        return None
    keyword = payload[:8].decode("ascii", "ignore").strip().upper()
    count = struct.unpack(">i", payload[8:12])[0]
    kind = payload[12:16].decode("ascii", "ignore").strip().upper()
    if not keyword or any(ch not in "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_ :+-" for ch in keyword):
        return None
    if _element_width(kind) is None:
        return None
    if count < 0 or count > 100_000_000:
        return None
    return keyword, kind, count, payload[16:]


def _logical_records(path: Path):
    """Yield (keyword, type, count, data) from descriptor/data fortio pairs."""
    raw = list(_records(path))
    i = 0
    while i < len(raw):
        item = _header(raw[i])
        if item:
            key, kind, count, inline = item
            width = _element_width(kind) or 0
            expected = count * width
            chunks = [inline] if inline else []
            i += 1
            # Eclipse splits large arrays into several FortIO records.  Keep
            # consuming data records until the declared element count is
            # satisfied or the next keyword header starts.
            while i < len(raw) and sum(map(len, chunks)) < expected:
                if _header(raw[i]) is not None:
                    break
                chunks.append(raw[i])
                i += 1
            body = b"".join(chunks)
            yield key, kind, count, body[:expected] if expected else body
            continue
        i += 1


def _strings(raw: bytes, count: int, width: int = 8) -> list[str]:
    """Decode a fixed-width Eclipse string array without losing alignment."""
    return [
        raw[i * width : (i + 1) * width]
        .decode("ascii", "ignore")
        .strip(" \x00")
        .upper()
        for i in range(count)
    ]


def _integers(raw: bytes, count: int) -> list[int]:
    available = min(count, len(raw) // 4)
    if not available:
        return []
    return list(struct.unpack(">" + "i" * available, raw[: available * 4]))


def _series_name(keyword: str, wgname: str, number: int | None) -> str:
    if wgname:
        return f"{keyword}:{wgname}"
    # Block/region vectors can have repeated keywords distinguished only by
    # NUMS. Preserve them instead of collapsing multiple series into one.
    if number is not None and number >= 0 and keyword[:1] in {"B", "C", "R"}:
        return f"{keyword}:{number}"
    return keyword


def _fallback_read(spec: Path, unsmry: Path, variables=None, wells=None) -> SimSummary:
    summary = SimSummary()
    keywords: list[str] = []
    wgnames: list[str] = []
    numbers: list[int] = []
    units: list[str] = []
    start_date: datetime | None = None
    for key, kind, count, body in _logical_records(spec):
        if key == "KEYWORDS":
            keywords = _strings(body, count, _element_width(kind) or 8)
        elif key == "WGNAMES":
            wgnames = _strings(body, count, _element_width(kind) or 8)
        elif key == "NUMS":
            numbers = _integers(body, count)
        elif key == "UNITS":
            units = _strings(body, count, _element_width(kind) or 8)
        elif key == "STARTDAT":
            values = _integers(body, count)
            if len(values) >= 3:
                try:
                    start_date = datetime(values[2], values[1], values[0])
                except ValueError:
                    start_date = None
    if not keywords:
        return summary
    values_by_index: list[list[float]] = [[] for _ in keywords]
    for key, kind, count, body in _logical_records(unsmry):
        if key != "PARAMS" or kind not in {"REAL", "DOUB"}:
            continue
        width = _element_width(kind) or 4
        n = min(len(keywords), count, len(body) // width)
        code = "f" if kind == "REAL" else "d"
        vals = struct.unpack(">" + code * n, body[: n * width])
        for index, value in enumerate(vals):
            # Retain non-finite placeholders so later values stay aligned
            # with their original report step.
            values_by_index[index].append(float(value))

    row_count = max((len(values) for values in values_by_index), default=0)
    time_index = next(
        (
            index
            for index, keyword in enumerate(keywords)
            if keyword in {"TIME", "DAYS", "DAY"}
        ),
        None,
    )
    year_index = next(
        (index for index, keyword in enumerate(keywords) if keyword == "YEARS"),
        None,
    )
    if time_index is not None:
        raw_days = values_by_index[time_index]
    elif year_index is not None:
        raw_days = [value * 365.25 for value in values_by_index[year_index]]
    else:
        raw_days = []
    days = [
        raw_days[index]
        if index < len(raw_days) and math.isfinite(raw_days[index])
        else float(index + 1)
        for index in range(row_count)
    ]
    summary.dates = [
        (start_date + timedelta(days=day)).isoformat()
        if start_date is not None
        else str(day)
        for day in days
    ]
    wanted = {v.upper() for v in variables or ()}
    wanted_wells = {w.upper() for w in wells or ()}
    for idx, keyword in enumerate(keywords):
        wgname = wgnames[idx] if idx < len(wgnames) else ""
        number = numbers[idx] if idx < len(numbers) else None
        name = _series_name(keyword, wgname, number)
        vals = values_by_index[idx]
        if not vals:
            continue
        base = keyword
        if wanted and name not in wanted and base not in wanted:
            continue
        points = [
            (days[i] if i < len(days) else float(i + 1), value)
            for i, value in enumerate(vals)
            if math.isfinite(value)
        ]
        if wgname:
            if wanted_wells and wgname not in wanted_wells:
                continue
            summary.well_vectors[name] = points
        else:
            summary.vectors[name] = points
        if idx < len(units):
            summary.metadata.setdefault("units", {})[name] = units[idx]
    summary.metadata.update({"format": "Eclipse SMSPEC/UNSMRY", "parser": "builtin"})
    return summary


def read_binary_summary(working_dir: str | Path, case_stem: str = "", variables=None, wells=None) -> SimSummary:
    directory = Path(working_dir)
    stem = case_stem or (next(iter(directory.glob("*.SMSPEC")), Path("case.SMSPEC")).stem)
    spec = directory / f"{stem}.SMSPEC"
    unsmry = directory / f"{stem}.UNSMRY"
    if not spec.exists() or not unsmry.exists():
        return SimSummary()
    try:
        from resdata.summary import Summary  # type: ignore
        loaded = Summary(str(directory / stem), lazy_load=False)
        result = SimSummary()
        dates = list(getattr(loaded, "dates", []) or [])
        days = list(getattr(loaded, "days", []) or [])
        result.dates = [d.isoformat() if isinstance(d, datetime) else str(d) for d in dates]
        wanted = {v.upper() for v in variables or ()}
        wanted_wells = {w.upper() for w in wells or ()}
        key_source = getattr(loaded, "keys", [])
        key_source = key_source() if callable(key_source) else key_source
        for name in list(key_source or []):
            name = str(name).upper()
            base = name.split(":", 1)[0]
            if wanted and name not in wanted and base not in wanted:
                continue
            if ":" in name and wanted_wells and name.split(":", 1)[1] not in wanted_wells:
                continue
            reader = getattr(loaded, "numpy_vector", None)
            vals = [float(v) for v in (reader(name) if callable(reader) else loaded.get_values(name))]
            points = [(float(days[i]) if i < len(days) else float(i + 1), v)
                      for i, v in enumerate(vals) if math.isfinite(v)]
            if ":" in name:
                result.well_vectors[name] = points
            else:
                result.vectors[name] = points
            try:
                result.metadata.setdefault("units", {})[name] = str(loaded.unit(name))
            except Exception:
                pass
        result.metadata.update({"format": "Eclipse SMSPEC/UNSMRY", "parser": "resdata"})
        return result
    except Exception:
        try:
            return _fallback_read(spec, unsmry, variables, wells)
        except Exception:
            return SimSummary()
