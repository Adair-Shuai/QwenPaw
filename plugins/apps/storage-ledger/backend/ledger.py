"""Transactional, versioned workbook snapshots for one reservoir workspace."""

import hashlib
import sqlite3
from contextlib import closing, contextmanager

from .workbooks import casing_rows, identify, records, workbook

SCHEMA = """
CREATE TABLE IF NOT EXISTS source(
 id INTEGER PRIMARY KEY, digest TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
 kind TEXT NOT NULL, sheets TEXT NOT NULL, original BLOB NOT NULL,
 imported TEXT DEFAULT CURRENT_TIMESTAMP, rows_count INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS block(
 src INTEGER, row_no INTEGER, day TEXT, inj REAL, prod REAL, mode TEXT, PRIMARY KEY(src, day));
CREATE TABLE IF NOT EXISTS daily(
 src INTEGER, row_no INTEGER, day TEXT, well TEXT, inj REAL, prod REAL, hours REAL,
 tubing REAL, casing REAL, memo TEXT, PRIMARY KEY(src,row_no));
CREATE INDEX IF NOT EXISTS daily_key ON daily(src, day, well);
CREATE INDEX IF NOT EXISTS well_history ON daily(src, well, day);
CREATE TABLE IF NOT EXISTS master(
 src INTEGER, row_no INTEGER, well TEXT, external_id TEXT, kind TEXT, station TEXT, line TEXT);
CREATE INDEX IF NOT EXISTS master_well ON master(src,well);
CREATE TABLE IF NOT EXISTS pipe(
 src INTEGER, row_no INTEGER, code TEXT, name TEXT, start TEXT, end TEXT,
 length REAL, diameter REAL, pressure REAL);
CREATE TABLE IF NOT EXISTS conflict(
 src INTEGER, day TEXT, well TEXT, selected INTEGER, note TEXT, PRIMARY KEY(src,day,well));
CREATE TABLE IF NOT EXISTS review_log(
 src INTEGER, day TEXT, well TEXT, row_no INTEGER, note TEXT, reviewed TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS reading_note(src INTEGER,sheet TEXT,row_no INTEGER,field TEXT,value TEXT);
CREATE INDEX IF NOT EXISTS reading_location ON reading_note(src,sheet,row_no,field);
CREATE TABLE IF NOT EXISTS casing(src INTEGER,row_no INTEGER,well TEXT,sheet TEXT,name TEXT,
    diameter TEXT,depth TEXT,cement TEXT,quality TEXT);
CREATE TABLE IF NOT EXISTS balance(
 src INTEGER, day TEXT, inj REAL, prod REAL, block_inj REAL, block_prod REAL, pending INTEGER,
 PRIMARY KEY(src,day));
CREATE TABLE IF NOT EXISTS project_info(
 id INTEGER PRIMARY KEY CHECK(id=1),name TEXT NOT NULL,operator TEXT NOT NULL DEFAULT '',
 region TEXT NOT NULL DEFAULT '',description TEXT NOT NULL DEFAULT '',archived INTEGER NOT NULL DEFAULT 0,
 revision INTEGER NOT NULL DEFAULT 1,created TEXT DEFAULT CURRENT_TIMESTAMP,modified TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS record_change(
 id INTEGER PRIMARY KEY,area TEXT NOT NULL,src INTEGER NOT NULL,record_id INTEGER NOT NULL,
 action TEXT NOT NULL,reason TEXT NOT NULL,prior TEXT,current TEXT,created TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS change_record ON record_change(area,record_id,id);
CREATE TABLE IF NOT EXISTS source_tag(src INTEGER PRIMARY KEY,well TEXT NOT NULL,category TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS source_archive(src INTEGER PRIMARY KEY);
CREATE TABLE IF NOT EXISTS lineage(src INTEGER,area TEXT,row_no INTEGER,origin_src INTEGER,origin_row INTEGER,
 PRIMARY KEY(src,area,row_no));
"""
# Both sides retain NULL when the source has no reading in that direction.
SUMS = """
 SELECT d.day, SUM(CASE WHEN c.well IS NULL OR c.selected=d.row_no THEN d.inj END) AS inj,
 SUM(CASE WHEN c.well IS NULL OR c.selected=d.row_no THEN d.prod END) AS prod,
 COUNT(DISTINCT CASE WHEN c.well IS NOT NULL AND c.selected IS NULL THEN d.well END) AS pending
 FROM daily d LEFT JOIN conflict c USING(src,day,well) WHERE d.src=:src {day_filter} GROUP BY d.day
"""
GAP = """pending=0 AND (ABS(inj-block_inj)>=0.0001 OR ABS(prod-block_prod)>=0.0001)"""


@contextmanager
def database(path):
    path.parent.mkdir(parents=True, exist_ok=True)
    with closing(sqlite3.connect(path, timeout=120)) as db:
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA trusted_schema=OFF")
        if db.execute("PRAGMA user_version").fetchone()[0] < 4:
            db.executescript(SCHEMA)
            with db:
                db.execute("BEGIN IMMEDIATE")
                if db.execute("PRAGMA user_version").fetchone()[0] < 4:
                    for src, name, raw in db.execute(
                        "SELECT id,name,original FROM source WHERE kind='casing'"
                    ):
                        with workbook(raw, name) as sheets:
                            db.execute("DELETE FROM casing WHERE src=?", (src,))
                            count = sum(
                                insert_casing(db, src, name, rows)
                                for name, rows in sheets.items()
                            )
                            db.execute(
                                "UPDATE source SET rows_count=? WHERE id=?",
                                (count, src),
                            )
                    db.execute(
                        "DELETE FROM reading_note WHERE trim(value, ' ' || char(12288))=''"
                    )
                    db.execute("PRAGMA user_version=4")
        if db.execute("PRAGMA user_version").fetchone()[0] < 5:
            db.executescript(SCHEMA + "PRAGMA user_version=5;")
        with db:
            yield db


def all_rows(db, sql, params=()):
    return [dict(row) for row in db.execute(sql, params)]


def rebuild_balance(db, src, day=None):
    day_filter = "AND d.day=:day" if day else ""
    only = "AND day=:day" if day else ""
    db.execute(
        f"""
        INSERT OR REPLACE INTO balance
        WITH sums AS ({SUMS.format(day_filter=day_filter)}),
        days AS (SELECT day FROM block WHERE src=:src {only} UNION SELECT day FROM sums)
        SELECT :src,days.day,s.inj,s.prod,b.inj,b.prod,COALESCE(s.pending,0)
        FROM days LEFT JOIN sums s USING(day) LEFT JOIN block b ON b.src=:src AND b.day=days.day
    """,
        {"src": src, "day": day},
    )


def next_record_id(db, area):
    # Reserve removed IDs as long as their changes can be undone.
    return db.execute(
        f"""SELECT MAX(n)+1 FROM (
      SELECT COALESCE(MAX(rowid),0) n FROM {area}
      UNION ALL SELECT COALESCE(MAX(record_id),0) FROM record_change WHERE area=?)""",
        (area,),
    ).fetchone()[0]


def insert_rows(db, table, src, rows):
    columns = [r["name"] for r in db.execute(f"PRAGMA table_info({table})")]
    sql = f"INSERT INTO {table}(rowid,{','.join(columns)}) VALUES({','.join(['?']*(1+len(columns)))})"
    return db.executemany(
        sql,
        (
            (key, src, *row)
            for key, row in enumerate(rows, start=next_record_id(db, table))
        ),
    ).rowcount


def insert_casing(db, src, sheet, rows):
    return insert_rows(db, "casing", src, casing_rows(rows, sheet))


def ingest(db, name, raw):
    digest = hashlib.sha256(raw).hexdigest()
    if not db.in_transaction:
        db.execute("BEGIN IMMEDIATE")
    existing = db.execute(
        "SELECT id,rows_count,kind FROM source WHERE digest=?", (digest,)
    ).fetchone()
    if existing and existing["kind"] != "attachment":
        return {
            "id": existing[0],
            "count": existing[1],
            "duplicate": True,
            "kind": existing["kind"],
        }
    with workbook(raw, name) as sheets:
        kind, selected = identify(sheets)
        sheet_names = "、".join(s[0] for s in selected)
        if existing:
            source = existing["id"]
            db.execute(
                "UPDATE source SET kind=?,sheets=? WHERE id=?",
                (kind, sheet_names, source),
            )
        else:
            source = db.execute(
                "INSERT INTO source(digest,name,kind,sheets,original) VALUES(?,?,?,?,?)",
                (digest, name, kind, sheet_names, raw),
            ).lastrowid
        count = 0

        def on_text(sheet, line, field, value):
            db.execute(
                "INSERT INTO reading_note VALUES(?,?,?,?,?)",
                (source, sheet, line, field, value),
            )

        for sheet, fields, optional in selected:
            if kind == "casing":
                count += insert_casing(db, source, sheet, sheets[sheet])
                continue
            table = (
                {"区块": "block", "单井": "daily"}.get(sheet, kind)
                if kind == "production"
                else kind
            )
            try:
                added = insert_rows(
                    db,
                    table,
                    source,
                    records(sheets[sheet], sheet, fields, optional, on_text),
                )
            except sqlite3.IntegrityError as exc:
                raise ValueError(f"{sheet} 含重复区块日期，请核对原表") from exc
            if not added:
                raise ValueError(f"{sheet} 没有数据行")
            count += added
        if not count:
            raise ValueError("未找到可识别的数据记录")
    if kind == "production":
        db.execute(
            """INSERT INTO conflict(src,day,well)
            SELECT src,day,well FROM daily WHERE src=? GROUP BY day,well HAVING COUNT(*)>1""",
            (source,),
        )
        rebuild_balance(db, source)
    db.execute("UPDATE source SET rows_count=? WHERE id=?", (count, source))
    return {"id": source, "count": count, "duplicate": False, "kind": kind}


def latest(db, kind):
    return db.execute(
        "SELECT MAX(id) FROM source WHERE kind=? AND id NOT IN (SELECT src FROM source_archive)",
        (kind,),
    ).fetchone()[0]


def overview(db, src, day, well, notes_page=0):
    if src is None:
        src = latest(db, "production")
    meta = db.execute(
        """SELECT MIN(day) AS first, MAX(day) AS last, COUNT(*) AS days
                         FROM balance WHERE src=?""",
        (src,),
    ).fetchone()
    day = day or meta["last"]
    args = (src, day)
    stats = all_rows(db, "SELECT * FROM balance WHERE src=? AND day=?", args)
    block = db.execute(
        "SELECT row_no FROM block WHERE src=? AND day=?", args
    ).fetchone()
    daily = all_rows(
        db,
        """SELECT d.*,c.selected,c.note AS review_note,c.well IS NOT NULL AS contested
        FROM daily d LEFT JOIN conflict c USING(src,day,well)
        WHERE d.src=? AND d.day=? ORDER BY d.well,d.row_no""",
        args,
    )
    wells = [
        r[0]
        for r in db.execute(
            "SELECT DISTINCT well FROM daily WHERE src=? ORDER BY well", (src,)
        )
    ]
    ids = (src, well, day)
    history = (
        all_rows(
            db,
            """SELECT d.day,d.row_no,d.inj,d.prod,d.hours,d.tubing,d.casing,
        c.well IS NOT NULL AS contested,c.selected FROM daily d LEFT JOIN conflict c USING(src,day,well)
        WHERE d.src=? AND d.well=? AND d.day<=? ORDER BY d.day DESC,d.row_no LIMIT 90""",
            ids,
        )
        if well
        else []
    )
    issues = all_rows(
        db,
        """SELECT c.*,COUNT(*) AS candidates FROM conflict c JOIN daily d USING(src,day,well)
        WHERE c.src=? GROUP BY c.day,c.well ORDER BY c.selected IS NOT NULL,c.day,c.well""",
        (src,),
    )
    row_ids = list({r["row_no"] for r in daily + history})
    text_values = {}
    for start in range(0, len(row_ids), 400):
        ids = row_ids[start : start + 400]
        marks = ",".join("?" for _ in ids)
        for row_no, field, value in db.execute(
            f"""SELECT row_no,field,value FROM reading_note
                WHERE src=? AND sheet='单井' AND row_no IN ({marks})""",
            (src, *ids),
        ):
            text_values.setdefault(row_no, {})[field] = value
    trend = all_rows(
        db,
        """SELECT day,inj,prod FROM block WHERE src=? AND day<=?
                        ORDER BY day DESC LIMIT 90""",
        args,
    )
    return {
        "sources": all_rows(
            db,
            """SELECT id,name,kind,sheets,rows_count,imported,
            length(original)>0 AS has_original,coalesce(t.well,'') AS well,coalesce(t.category,'') AS category,
            id IN (SELECT src FROM source_archive) AS archived
            FROM source LEFT JOIN source_tag t ON t.src=id ORDER BY id DESC""",
        ),
        "src": src,
        "day": day,
        "period": dict(meta),
        "wells": wells,
        "daily": daily,
        "trend": trend[::-1],
        "archive_wells": [
            r[0]
            for r in db.execute(
                "SELECT well FROM master WHERE src=? UNION SELECT well FROM casing WHERE src=? ORDER BY well",
                (latest(db, "master"), latest(db, "casing")),
            )
        ],
        "casing": all_rows(
            db,
            "SELECT * FROM casing WHERE src=? AND well=? ORDER BY row_no",
            (latest(db, "casing"), well),
        ),
        "balance": stats[0] if stats else None,
        "block_row": block[0] if block else None,
        "issues": issues,
        "history": history,
        "text_values": text_values,
        "gaps": all_rows(
            db, f"SELECT * FROM balance WHERE src=? AND ({GAP}) ORDER BY day", (src,)
        ),
        "reading_notes": all_rows(
            db,
            "SELECT * FROM reading_note WHERE src=? ORDER BY sheet,row_no,field LIMIT 100 OFFSET ?",
            (src, max(0, notes_page) * 100),
        ),
        "notes_count": db.execute(
            "SELECT COUNT(*) FROM reading_note WHERE src=?", (src,)
        ).fetchone()[0],
        "master": all_rows(
            db,
            "SELECT * FROM master WHERE src=? AND well=?",
            (latest(db, "master"), well),
        ),
        "pipes": all_rows(
            db, "SELECT * FROM pipe WHERE src=? ORDER BY row_no", (latest(db, "pipe"),)
        ),
        "audit": all_rows(
            db,
            "SELECT * FROM review_log WHERE src=? AND day=? ORDER BY rowid DESC",
            args,
        ),
    }


def review(db, src, day, well, row_no, note, previous):
    note = note.strip()
    if not note:
        raise ValueError("请填写采用该行的依据")
    if not db.in_transaction:
        db.execute("BEGIN IMMEDIATE")
    hit = db.execute(
        "SELECT 1 FROM daily WHERE src=? AND day=? AND well=? AND row_no=?",
        (src, day, well, row_no),
    ).fetchone()
    if not hit:
        raise ValueError("所选原始行不属于该井和生产日")
    changed = db.execute(
        """UPDATE conflict SET selected=?,note=? WHERE src=? AND day=? AND well=?
                          AND selected IS ?""",
        (row_no, note, src, day, well, previous),
    ).rowcount
    if not changed:
        raise ValueError("复核状态已变化，请刷新")
    db.execute(
        "INSERT INTO review_log(src,day,well,row_no,note) VALUES(?,?,?,?,?)",
        (src, day, well, row_no, note),
    )
    rebuild_balance(db, src, day)
