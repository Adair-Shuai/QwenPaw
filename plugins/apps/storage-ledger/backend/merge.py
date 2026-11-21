"""Build a production edition while preserving the input workbooks and row lineage."""

import hashlib
import json

from fastapi import HTTPException

from . import ledger


def combine(db, source_ids, name):
    ids = sorted(set(source_ids))
    if len(ids) < 2 or len(ids) > 50 or not name.strip():
        raise HTTPException(422, "请命名汇编并选择 2 至 50 个生产版本")
    marks = ",".join("?" for _ in ids)
    inputs = db.execute(
        f"""SELECT s.id,
        (SELECT max(id) FROM record_change WHERE src=s.id),
        (SELECT max(rowid) FROM review_log WHERE src=s.id)
        FROM source s WHERE kind='production' AND s.id IN ({marks})
        AND s.id NOT IN (SELECT src FROM source_archive) ORDER BY s.id""",
        ids,
    ).fetchall()
    if len(inputs) != len(ids):
        raise HTTPException(422, "请选择当前项目使用中的生产版本")
    signature = json.dumps(
        [name.strip(), [tuple(r) for r in inputs]], ensure_ascii=False
    )
    digest = "edition-" + hashlib.sha256(signature.encode()).hexdigest()
    previous = db.execute("SELECT id FROM source WHERE digest=?", (digest,)).fetchone()
    if previous:
        return {"src": previous[0], "duplicate": True}
    new = db.execute(
        """INSERT INTO source(name,kind,sheets,original,digest) VALUES(?,'production',? ,?,?)""",
        (name.strip(), "汇编 · " + ",".join(map(str, ids)), b"", digest),
    ).lastrowid
    count = 0
    for area, sheet, keys in [("daily", "单井", "day,well"), ("block", "区块", "day")]:
        cols = [
            r["name"]
            for r in db.execute("PRAGMA table_info(" + area + ")")
            if r["name"] not in ("src", "row_no")
        ]
        fields = ",".join("t." + c for c in cols)
        db.execute("DROP TABLE IF EXISTS temp.edition_rows")
        db.execute(
            f"""CREATE TEMP TABLE edition_rows AS WITH ranked AS (
                SELECT src,row_no,rowid AS rid,MAX(src) OVER(PARTITION BY {keys}) keep FROM {area} WHERE src IN ({marks}))
                SELECT rid,src,row_no,ROW_NUMBER() OVER(ORDER BY src,row_no) AS new_row
                FROM ranked WHERE src=keep""",
            ids,
        )
        db.execute("CREATE INDEX temp.edition_origin ON edition_rows(src,row_no)")
        first = ledger.next_record_id(db, area)
        count += db.execute(
            f"""INSERT INTO {area}(rowid,src,row_no,{','.join(cols)}) SELECT ?+m.new_row-1,?,m.new_row,{fields}
                FROM edition_rows m JOIN {area} t ON t.rowid=m.rid""",
            (first, new),
        ).rowcount
        db.execute(
            """INSERT INTO lineage SELECT ?,?,m.new_row,COALESCE(l.origin_src,m.src),COALESCE(l.origin_row,m.row_no)
            FROM edition_rows m LEFT JOIN lineage l ON l.src=m.src AND l.area=? AND l.row_no=m.row_no""",
            (new, area, area),
        )
        db.execute(
            """INSERT INTO reading_note SELECT ?,?,m.new_row,n.field,n.value FROM edition_rows m
            JOIN reading_note n ON n.src=m.src AND n.sheet=? AND n.row_no=m.row_no""",
            (new, sheet, sheet),
        )
        if area == "daily":
            db.execute(
                """INSERT INTO conflict(src,day,well,selected,note)
                SELECT ?,d.day,d.well,MAX(CASE WHEN c.selected=m.row_no THEN m.new_row END),MAX(c.note)
                FROM edition_rows m JOIN daily d ON d.rowid=m.rid LEFT JOIN conflict c USING(src,day,well)
                GROUP BY d.day,d.well HAVING count(*)>1""",
                (new,),
            )
    db.execute("UPDATE source SET rows_count=? WHERE id=?", (count, new))
    ledger.rebuild_balance(db, new)
    return {"src": new, "duplicate": False, "count": count}
