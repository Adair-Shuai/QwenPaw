"""Read models for the project explorer, engineering plots and source inspector."""

from datetime import date, timedelta
from functools import lru_cache
from math import isfinite
import re

from fastapi import HTTPException

from . import ledger, records
from .workbooks import label, workbook


def number(value):
    try:
        result = float(value)
    except (ValueError, TypeError):
        return None
    return result if isfinite(result) else None


@lru_cache(maxsize=12)
def workbook_positions(path, src, digest):
    # A project backup can reuse a source id. The digest identifies the actual bytes.
    with ledger.database(path) as db:
        source = db.execute(
            "SELECT name,original FROM source WHERE id=? AND digest=?", (src, digest)
        ).fetchone()
    if not source or not source["original"]:
        return {}
    with workbook(source["original"], source["name"]) as sheets:
        for name, read in sheets.items():
            if not name.startswith("单井基础数据"):
                continue
            rows = iter(read())
            headings = [label(cell) for cell in next(rows, ())]
            keys = ("井号", "井口坐标x", "井口坐标y")
            if not all(key in headings for key in keys):
                continue
            iw, ix, iy = (headings.index(key) for key in keys)
            positions = {}
            for n, row in enumerate(rows, 2):
                if len(row) <= max(iw, ix, iy):
                    continue
                x, y = number(row[ix]), number(row[iy])
                if x is not None and y is not None:
                    positions[n, str(row[iw] or "").strip().upper()] = (x, y)
            return positions
    return {}


def endpoint(text, wells):
    name = (text or "").strip()
    candidate = re.sub(r"(?:井井场|井场|井)$", "", name, flags=re.I).upper()
    for key in (name.upper(), candidate):
        if key in wells:
            return {"type": "well", "name": key}
    if "站" in name and name.endswith("站"):
        return {
            "type": "station",
            "name": re.sub(r"(\d+)[#＃](?=集配站$)", r"\1号", name),
        }
    return {"type": "endpoint", "name": name}


def objects(db, path, src):
    src = records.source_id(db, "daily", src)
    master = ledger.latest(db, "master")
    casing = ledger.latest(db, "casing")
    pipes = ledger.latest(db, "pipe")
    head = db.execute("SELECT digest FROM source WHERE id=?", (master,)).fetchone()
    positions = workbook_positions(path, master, head[0]) if head else {}
    wells = {}

    def item(name):
        return wells.setdefault(
            name, {"name": name, "masters": [], "strings": [], "days": 0, "pending": 0}
        )

    for row in ledger.all_rows(
        db, "SELECT * FROM master WHERE src=? ORDER BY row_no", (master,)
    ):
        xy = positions.get((row["row_no"], row["well"]))
        item(row["well"])["masters"].append({**row, "xy": xy})
    for row in ledger.all_rows(
        db, "SELECT * FROM casing WHERE src=? ORDER BY sheet,row_no", (casing,)
    ):
        item(row["well"])["strings"].append(row)
    for row in db.execute(
        """SELECT well, MIN(day), MAX(day), COUNT(DISTINCT day)
        FROM daily WHERE src=? GROUP BY well""",
        (src,),
    ):
        item(row[0]).update(first=row[1], last=row[2], days=row[3])
    for well, count in db.execute(
        "SELECT well, COUNT(*) FROM conflict WHERE src=? AND selected IS NULL GROUP BY well",
        (src,),
    ):
        item(well)["pending"] = count
    for well in wells.values():
        pairs = {r["xy"] for r in well["masters"] if r["xy"] is not None}
        well["xy"] = next(iter(pairs)) if len(pairs) == 1 else None
        well["coordinate_conflict"] = len(pairs) > 1
    lines = ledger.all_rows(
        db, "SELECT * FROM pipe WHERE src=? ORDER BY row_no", (pipes,)
    )
    stations = set()
    for line in lines:
        for col in ("start", "end"):
            node = endpoint(line[col], wells)
            line[col + "_node"] = node
            if node["type"] == "station":
                stations.add(node["name"])
    return {
        "src": src,
        "wells": sorted(wells.values(), key=lambda w: w["name"]),
        "stations": sorted(stations),
        "pipes": lines,
    }


def series(db, src, wells, end, span):
    src = records.source_id(db, "daily", src)
    wells = list(dict.fromkeys(w.strip().upper() for w in wells if w.strip()))
    if not 1 <= len(wells) <= 2:
        raise HTTPException(422, "请选择一至两口井")
    end = (
        end
        or db.execute("SELECT MAX(day) FROM balance WHERE src=?", (src,)).fetchone()[0]
    )
    if end:
        try:
            last = date.fromisoformat(end)
            start = (
                (last - timedelta(days=min(span - 1, last.toordinal() - 1))).isoformat()
                if span
                else ""
            )
        except ValueError as exc:
            raise HTTPException(422, "日期格式应为 YYYY-MM-DD") from exc
    else:
        start = ""
    marks = ",".join("?" for _ in wells)
    results = {well: [] for well in wells}
    for row in db.execute(
        f"""SELECT d.well,d.day,d.row_no,d.inj,d.prod,d.tubing,d.casing,d.hours,
        c.well IS NOT NULL AS contested,c.selected FROM daily d
        LEFT JOIN conflict c USING(src,well,day) WHERE d.src=? AND d.well IN ({marks})
        AND d.day BETWEEN ? AND ? ORDER BY d.well,d.day,d.row_no""",
        (src, *wells, start, end or ""),
    ):
        points = results[row["well"]]
        if not points or points[-1]["day"] != row["day"]:
            points.append(
                {
                    "day": row["day"],
                    "row_no": None,
                    "candidates": [],
                    "inj": None,
                    "prod": None,
                    "tubing": None,
                    "casing": None,
                    "hours": None,
                }
            )
        point = points[-1]
        if row["contested"]:
            point["candidates"].append(row["row_no"])
            if row["selected"] != row["row_no"]:
                continue
        for key in ("row_no", "inj", "prod", "tubing", "casing", "hours"):
            point[key] = row[key]
    if not start:
        start = min(
            (points[0]["day"] for points in results.values() if points), default=end
        )
    return {"src": src, "start": start, "end": end, "series": results}


def trace(db, area, src, row_no, sheet):
    records.spec(area)
    sql = f"SELECT rowid AS record_id,* FROM {area} WHERE src=? AND row_no=?"
    args = [src, row_no]
    if area == "casing" and sheet:
        sql += " AND sheet=?"
        args.append(sheet)
    rows = ledger.all_rows(db, sql, args)
    if not rows:
        raise HTTPException(404, "记录已移除或不在当前项目")
    if len(rows) > 1:
        raise HTTPException(422, "请选择套管记录所在的工作表")
    row = rows[0]
    changes = ledger.all_rows(
        db,
        """SELECT action,reason,created FROM record_change
        WHERE area=? AND src=? AND record_id=? ORDER BY id DESC""",
        (area, src, row["record_id"]),
    )
    origin = db.execute(
        "SELECT origin_src,origin_row FROM lineage WHERE src=? AND area=? AND row_no=?",
        (src, area, row_no),
    ).fetchone()
    source_id, line = tuple(origin) if origin else (src, row_no)
    source = db.execute(
        "SELECT id,name,sheets,length(original)>0 AS has_original FROM source WHERE id=?",
        (source_id,),
    ).fetchone()
    sheet_name = {"daily": "单井", "block": "区块"}.get(
        area, row.get("sheet") or source["sheets"]
    )
    return {
        "row": row,
        "fields": records.FIELDS[area],
        "raw": records.raw_notes(db, area, src, row_no),
        "changes": changes,
        "source": dict(source),
        "sheet": sheet_name,
        "line": line,
    }
