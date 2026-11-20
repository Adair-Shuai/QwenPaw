# -*- coding: utf-8 -*-
"""Transactional, account- and agent-scoped agenda storage."""

import hashlib
import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4


def now():
    return datetime.now(timezone.utc).isoformat()


class Store:
    def __init__(self, root, user_id, agent_id):
        scope = hashlib.sha256(f"{user_id}\0{agent_id}".encode()).hexdigest()
        self.path = Path(root) / "research-agenda" / scope / "agenda.sqlite3"
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as db:
            db.executescript(
                (
                    "\n"
                    "                CREATE TABLE IF NOT EXISTS task"
                    "s (id TEXT PRIMARY KEY, body TEXT NOT NULL);\n"
                    "                CREATE TABLE IF NOT EXISTS sour"
                    "ces (id TEXT PRIMARY KEY, body TEXT NOT NULL);\n"
                    "            "
                ),
            )

    @contextmanager
    def connect(self):
        db = sqlite3.connect(self.path, timeout=15)
        try:
            with db:
                yield db
        finally:
            db.close()

    @staticmethod
    def rows(db, table):
        return [
            json.loads(row[0])
            for row in db.execute(
                f"SELECT body FROM {table} ORDER BY rowid DESC",
            )
        ]

    @staticmethod
    def put(db, table, row):
        db.execute(
            (
                f"INSERT INTO {table}(id, body) VALUES (?, ?) ON CONFLICT(id)"
                " DO UPDATE SET body=excluded.body"
            ),
            (row["id"], json.dumps(row, ensure_ascii=False)),
        )

    @staticmethod
    def get(db, table, key):
        result = db.execute(
            f"SELECT body FROM {table} WHERE id=?",
            (key,),
        ).fetchone()
        if not result:
            raise KeyError(key)
        return json.loads(result[0])

    def snapshot(self):
        with self.connect() as db:
            sources = self.rows(db, "sources")
            return {
                "tasks": self.rows(db, "tasks"),
                "sources": [
                    {
                        k: v
                        for k, v in source.items()
                        if k not in {"images", "text"}
                    }
                    for source in sources
                ],
            }

    def source(self, source_id):
        with self.connect() as db:
            return self.get(db, "sources", source_id)

    def add_source(self, source):
        with self.connect() as db:
            db.execute(
                "INSERT OR IGNORE INTO sources(id, body) VALUES (?, ?)",
                (source["id"], json.dumps(source, ensure_ascii=False)),
            )
            return self.get(db, "sources", source["id"])

    def create_task(self, fields):
        with self.connect() as db:
            row = {
                **fields,
                "id": uuid4().hex,
                "revision": 1,
                "created_at": now(),
                "updated_at": now(),
            }
            self.put(db, "tasks", row)
        return row

    def update_task(self, key, revision, fields):
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            row = self.get(db, "tasks", key)
            if row["revision"] != revision:
                raise ValueError("事项已被更新，请刷新后重试")
            row.update(fields, revision=revision + 1, updated_at=now())
            self.put(db, "tasks", row)
        return row

    def apply(self, source_id, candidates):
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            source = self.get(db, "sources", source_id)
            if source["status"] == "applied":
                return source["applied_ids"]
            ids = []
            originals = {
                item["candidate_id"]: item for item in source["candidates"]
            }
            for candidate in candidates:
                original = originals.get(candidate["candidate_id"])
                if not original:
                    raise ValueError("未知候选事项，请重新打开整理结果")
                fields = dict(candidate["fields"])
                # Ownership and provenance are fixed by the saved proposal.
                fields.update(
                    source_id=source_id,
                    evidence=original["evidence"],
                )
                target_id = original.get("target_id")
                if original["action"] in {"update", "cancel"}:
                    row = self.get(db, "tasks", target_id)
                    if row["revision"] != original["target_revision"]:
                        raise ValueError("关联事项已经变化，请重新整理这份材料")
                    fields["status"] = (
                        "cancelled"
                        if original["action"] == "cancel"
                        else fields["status"]
                    )
                    fields["history"] = [
                        *row.get("history", []),
                        {
                            "source_id": row.get("source_id"),
                            "evidence": row.get("evidence", ""),
                            "title": row["title"],
                            "due_date": row.get("due_date"),
                            "status": row["status"],
                        },
                    ]
                    row.update(
                        fields,
                        revision=row["revision"] + 1,
                        updated_at=now(),
                    )
                else:
                    row = {
                        **fields,
                        "id": uuid4().hex,
                        "revision": 1,
                        "created_at": now(),
                        "updated_at": now(),
                    }
                self.put(db, "tasks", row)
                ids.append(row["id"])
            source.update(
                status="applied",
                applied_ids=ids,
                applied_at=now(),
                accepted_candidates=candidates,
            )
            self.put(db, "sources", source)
            return ids
