"""Manage the working records of a selected source version, with reversible revisions."""

import csv
import hashlib
import json
import math
from datetime import date
from uuid import uuid4
from fastapi import HTTPException

from . import ledger

FIELDS = {
    "daily": {
        "day": "生产日",
        "well": "井号",
        "inj": "日注气（万方）",
        "prod": "日采气（万方）",
        "hours": "生产时间（h）",
        "tubing": "油压（MPa）",
        "casing": "套压（MPa）",
        "memo": "备注",
    },
    "block": {
        "day": "生产日",
        "inj": "日注气（万方）",
        "prod": "日采气（万方）",
        "mode": "运行工况",
    },
    "master": {
        "well": "井号",
        "external_id": "井 ID",
        "kind": "井别",
        "station": "站库",
        "line": "管线名称",
    },
    "pipe": {
        "code": "管道编号",
        "name": "管道名称",
        "start": "起点",
        "end": "终点",
        "length": "长度（km）",
        "diameter": "外径（mm）",
        "pressure": "设计压力（MPa）",
    },
    "casing": {
        "well": "井号",
        "name": "套管名称",
        "diameter": "外径（卡片原值）",
        "depth": "下深（卡片原值）",
        "cement": "水泥返深",
        "quality": "固井质量",
    },
}
KIND = {
    "daily": "production",
    "block": "production",
    "master": "master",
    "pipe": "pipe",
    "casing": "casing",
}
REQUIRED = {
    "daily": ("day", "well"),
    "block": ("day",),
    "master": ("well",),
    "pipe": ("code", "name"),
    "casing": ("well", "name"),
}
NUMERIC = {"hours", "inj", "prod", "tubing", "casing", "length", "diameter", "pressure"}
NOTE_FIELDS = {
    "inj": "日注气量104m3",
    "prod": "日采气量104m3",
    "hours": "生产时间h",
    "tubing": "油压mpa",
    "casing": "套压mpa",
}
SHEETS = {"daily": "单井", "block": "区块"}


def spec(area):
    if area not in FIELDS:
        raise HTTPException(404, "数据表不存在")
    return FIELDS[area]


def source_id(db, area, src, create=False):
    spec(area)
    kind = KIND[area]
    if src is not None:
        if not db.execute(
            "SELECT 1 FROM source WHERE id=? AND kind=?", (src, kind)
        ).fetchone():
            raise HTTPException(404, "当前项目没有对应的数据版本")
        return src
    src = ledger.latest(db, kind)
    if src is None and create:
        return db.execute(
            """INSERT INTO source(digest,name,kind,sheets,original)
            VALUES(?,?,?,?,?)""",
            (
                "manual-" + uuid4().hex,
                "手工台账 · "
                + {
                    "production": "注采",
                    "master": "井档",
                    "pipe": "管线",
                    "casing": "完井",
                }[kind],
                kind,
                "手工录入",
                b"",
            ),
        ).lastrowid
    return src


def select_rows(db, area, src, search, start, end):
    fields = spec(area)
    src = source_id(db, area, src)
    filters = ["t.src=?"]
    params = [src]
    if search.strip():
        searchable = [
            f
            for f in fields
            if f
            in {
                "day",
                "well",
                "code",
                "name",
                "station",
                "start",
                "end",
                "memo",
                "kind",
                "line",
                "mode",
            }
        ]
        filters.append(
            "("
            + " OR ".join(f"instr(lower(t.{f}),lower(?))>0" for f in searchable)
            + ")"
        )
        params.extend([search.strip()] * len(searchable))
    if "day" in fields:
        for op, value in ((">=", start), ("<=", end)):
            if value:
                date.fromisoformat(value)
                filters.append("t.day" + op + "?")
                params.append(value)
    return src, " FROM " + area + " t WHERE " + " AND ".join(filters), params


def browse(db, area, src, search, start, end, page):
    src, tail, args = select_rows(db, area, src, search, start, end)
    total = db.execute("SELECT count(*)" + tail, args).fetchone()[0]
    page = min(page, max(0, (total - 1) // 50))
    order = "t.day DESC,t.row_no" if "day" in FIELDS[area] else "t.rowid DESC"
    sql = """SELECT t.rowid AS record_id,t.*,COALESCE((SELECT MAX(id) FROM record_change
        WHERE area=? AND record_id=t.rowid AND src=t.src),0) AS revision"""
    rows = ledger.all_rows(
        db,
        sql + tail + " ORDER BY " + order + " LIMIT 50 OFFSET ?",
        [area, *args, page * 50],
    )
    for row in rows:
        row["raw"] = raw_notes(db, area, src, row["row_no"])
        lineage = db.execute(
            """SELECT s.name,l.origin_row FROM lineage l JOIN source s ON s.id=l.origin_src
                           WHERE l.src=? AND l.area=? AND l.row_no=?""",
            (src, area, row["row_no"]),
        ).fetchone()
        row["origin"] = (
            (lineage[0] + " · " + (str(lineage[1]) if lineage[1] > 0 else "手工录入"))
            if lineage
            else ""
        )
    return {
        "rows": rows,
        "count": total,
        "page": page,
        "src": src,
        "fields": FIELDS[area],
        "required": REQUIRED[area],
        "history": ledger.all_rows(
            db,
            """SELECT id,record_id,action,reason,created,prior,current FROM record_change
            WHERE area=? AND src=? ORDER BY id DESC LIMIT 100""",
            (area, src),
        ),
    }


def raw_notes(db, area, src, row_no):
    if area not in SHEETS:
        return {}
    return dict(
        db.execute(
            "SELECT field,value FROM reading_note WHERE src=? AND sheet=? AND row_no=?",
            (src, SHEETS[area], row_no),
        )
    )


def json_text(item):
    return (
        json.dumps(item, ensure_ascii=False, sort_keys=True)
        if item is not None
        else None
    )


def checked_values(area, payload, prior):
    if set(payload) - FIELDS[area].keys():
        raise ValueError("包含无法识别的字段")
    values = {}
    notes = (prior or {}).get("raw", {}).copy()
    for field in FIELDS[area]:
        v = payload.get(field)
        if isinstance(v, (list, dict, bool)):
            raise ValueError("字段类型无效")
        if isinstance(v, str):
            v = v.strip()
        if field in REQUIRED[area] and v in ("", None):
            raise ValueError("请填写" + FIELDS[area][field])
        if field == "day":
            v = date.fromisoformat(v).isoformat()
        elif field == "well":
            v = v.upper()
        elif field in NUMERIC and area != "casing":
            tag = NOTE_FIELDS.get(field)
            if tag in notes and v == notes[tag]:
                values[field] = None
                continue
            notes.pop(tag, None)
            v = None if v in ("", None) else float(v)
            if v is not None and (
                not math.isfinite(v)
                or (field == "hours" and not 0 <= v <= 24)
                or (field in {"inj", "prod", "length", "diameter"} and v < 0)
            ):
                raise ValueError(FIELDS[area][field] + " 超出有效范围")
        elif v is not None:
            v = str(v)
            if len(v) > 4000:
                raise ValueError("字段文本过长")
        values[field] = v
    return values, notes


def sync_day(db, src, area, before, after):
    if area not in SHEETS:
        return
    keys = {(r["day"], r.get("well")) for r in (before, after) if r}
    for day, well in keys:
        if well:
            db.execute(
                "DELETE FROM conflict WHERE src=? AND day=? AND well=?",
                (src, day, well),
            )
            db.execute(
                """INSERT INTO conflict(src,day,well) SELECT src,day,well FROM daily
                WHERE src=? AND day=? AND well=? GROUP BY src,day,well HAVING COUNT(*)>1""",
                (src, day, well),
            )
        db.execute("DELETE FROM balance WHERE src=? AND day=?", (src, day))
        ledger.rebuild_balance(db, src, day)


def mutate(db, area, src, key, revision, payload, action, reason):
    spec(area)
    src = source_id(db, area, src, create=action == "add")
    if db.execute("SELECT 1 FROM source_archive WHERE src=?", (src,)).fetchone():
        raise HTTPException(409, "此资料已收起，请先在资料库恢复使用")
    if not reason.strip():
        raise ValueError("请填写变更原因")
    if action == "add":
        if key is not None:
            raise ValueError("新增记录不能带已有记录编号")
        key = ledger.next_record_id(db, area)
    else:
        if key is None:
            raise ValueError("缺少记录编号")
    previous = db.execute(
        "SELECT id,prior,action FROM record_change WHERE area=? AND src=? AND record_id=? ORDER BY id DESC LIMIT 1",
        (area, src, key),
    ).fetchone()
    if (previous[0] if previous else 0) != revision:
        raise HTTPException(409, "记录已变化，请刷新后重新编辑")
    found = db.execute(
        f"SELECT * FROM {area} WHERE src=? AND rowid=?", (src, key)
    ).fetchone()
    before = dict(found) if found else None
    if before:
        before["raw"] = raw_notes(db, area, src, before["row_no"])
    if action in {"edit", "remove"} and not before:
        raise HTTPException(404, "记录不存在")
    if action == "undo":
        if not previous or previous["action"] == "undo":
            raise ValueError("没有可撤销的修改")
        after = json.loads(previous["prior"]) if previous["prior"] else None
    elif action == "remove":
        after = None
    else:
        values, notes = checked_values(area, payload, before)
        after = dict(before or {})
        if not before:
            # Negative row numbers distinguish operator entries from workbook positions.
            after.update(src=src, row_no=-key)
        after.update(values)
        after["raw"] = notes
        if area == "casing" and not before:
            after["sheet"] = "手工录入"
    if before:
        db.execute(f"DELETE FROM {area} WHERE src=? AND rowid=?", (src, key))
        if area in SHEETS:
            db.execute(
                "DELETE FROM reading_note WHERE src=? AND sheet=? AND row_no=?",
                (src, SHEETS[area], before["row_no"]),
            )
    if after:
        cols = ["src", "row_no", *FIELDS[area]]
        if area == "casing":
            cols.append("sheet")
        db.execute(
            f"INSERT INTO {area}(rowid,{','.join(cols)}) VALUES({','.join(['?']*(1+len(cols)))})",
            [key, *[after[c] for c in cols]],
        )
        if area in SHEETS:
            db.executemany(
                "INSERT INTO reading_note VALUES(?,?,?,?,?)",
                [
                    (src, SHEETS[area], after["row_no"], f, v)
                    for f, v in after["raw"].items()
                ],
            )
    db.execute(
        "UPDATE source SET rows_count=rows_count+? WHERE id=?",
        (int(bool(after)) - int(bool(before)), src),
    )
    change = db.execute(
        """INSERT INTO record_change(area,src,record_id,action,reason,prior,current) VALUES(?,?,?,?,?,?,?)""",
        (area, src, key, action, reason.strip(), json_text(before), json_text(after)),
    ).lastrowid
    sync_day(db, src, area, before, after)
    return {"src": src, "revision": change, "record_id": key}


def export_csv(db, area, src, search, start, end, out):
    src, tail, args = select_rows(db, area, src, search, start, end)
    fields = FIELDS[area]
    writer = csv.writer(out)
    writer.writerow(["来源行（负号为手工）", *fields.values()])

    # Keep spreadsheet applications from treating user text as a formula.
    def safe(v):
        return (
            "'" + v
            if isinstance(v, str) and v.lstrip().startswith(("=", "+", "-", "@"))
            else v
        )

    for row in db.execute("SELECT t.*" + tail + " ORDER BY t.rowid", args):
        notes = raw_notes(db, area, src, row["row_no"])
        writer.writerow(
            [
                row["row_no"],
                *[safe(notes.get(NOTE_FIELDS.get(f), row[f])) for f in fields],
            ]
        )


def attach(db, name, raw, well, category):
    digest = hashlib.sha256(raw).hexdigest()
    existing = db.execute("SELECT id FROM source WHERE digest=?", (digest,)).fetchone()
    if existing:
        return {"id": existing[0], "duplicate": True}
    key = db.execute(
        "INSERT INTO source(name,kind,digest,sheets,original) VALUES(?,'attachment',?,'',?)",
        (name, digest, raw),
    ).lastrowid
    db.execute(
        "INSERT INTO source_tag VALUES(?,?,?)",
        (key, well.strip().upper(), category.strip()),
    )
    return {"id": key, "duplicate": False}
