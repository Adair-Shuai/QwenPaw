# -*- coding: utf-8 -*-
"""Transactional drafts, immutable revisions, proposals and resume claims.

Legacy JSON files are imported once and left untouched. SQLite is the source
of truth after migration; deleted legacy flows therefore do not reappear.
"""
from __future__ import annotations

import json
import sqlite3
import time
from contextlib import contextmanager
from pathlib import Path


class RevisionConflict(ValueError):
    """Reload the current version instead of overwriting concurrent edits."""


class FlowRepository:
    def __init__(self, root: Path | str):
        self.root = Path(root)
        self.path = self.root / "workflows.sqlite3"
        with self.transaction() as db:
            db.executescript(
                "\n"
                "                CREATE TABLE IF NOT EXISTS flows(id "
                "TEXT PRIMARY KEY, revision INTEGER NOT NULL, payload "
                "TEXT NOT NULL, updated_at REAL NOT NULL);\n"
                "                CREATE TABLE IF NOT EXISTS "
                "versions(flow_id TEXT NOT NULL, revision INTEGER NOT "
                "NULL, payload TEXT NOT NULL, created_at REAL NOT NULL, "
                "PRIMARY KEY(flow_id,revision));\n"
                "                CREATE TABLE IF NOT EXISTS "
                "proposals(id TEXT PRIMARY KEY, payload TEXT NOT NULL, "
                "expires_at REAL NOT NULL, applied INTEGER NOT NULL "
                "DEFAULT 0);\n"
                "                CREATE TABLE IF NOT EXISTS "
                "migrations(name TEXT PRIMARY KEY);\n"
                "                CREATE TABLE IF NOT EXISTS "
                "resume_claims(parent_id TEXT PRIMARY KEY,child_id TEXT "
                "NOT NULL);\n"
                "            ",
            )
            db.execute("BEGIN IMMEDIATE")
            if not db.execute(
                "SELECT 1 FROM migrations WHERE name='legacy-json'",
            ).fetchone():
                for path in self.root.glob("*.json"):
                    try:
                        flow = json.loads(path.read_text(encoding="utf-8"))
                        if not isinstance(flow, dict) or not isinstance(
                            flow.get("nodes"),
                            dict,
                        ):
                            continue
                        flow.update(
                            id=str(flow.get("id") or path.stem),
                            revision=1,
                        )
                        data = json.dumps(
                            flow,
                            ensure_ascii=False,
                            allow_nan=False,
                        )
                        db.execute(
                            "INSERT OR IGNORE INTO flows VALUES(?,?,?,?)",
                            (flow["id"], 1, data, path.stat().st_mtime),
                        )
                        db.execute(
                            "INSERT OR IGNORE INTO versions VALUES(?,?,?,?)",
                            (flow["id"], 1, data, path.stat().st_mtime),
                        )
                    except (OSError, ValueError, TypeError):
                        continue
                db.execute("INSERT INTO migrations VALUES('legacy-json')")

    @contextmanager
    def transaction(self):
        db = sqlite3.connect(self.path, timeout=15)
        try:
            db.execute("PRAGMA busy_timeout=15000")
            db.execute("BEGIN IMMEDIATE")
            yield db
            db.commit()
        except BaseException:
            db.rollback()
            raise
        finally:
            db.close()

    def get(self, flow_id):
        with self.transaction() as db:
            row = db.execute(
                "SELECT payload FROM flows WHERE id=?",
                (flow_id,),
            ).fetchone()
            return json.loads(row[0]) if row else None

    def list(self):
        with self.transaction() as db:
            return [
                {**json.loads(row[0]), "updated_at": row[1]}
                for row in db.execute(
                    "SELECT payload,updated_at FROM flows ORDER BY "
                    "updated_at DESC",
                )
            ]

    def save(
        self,
        flow_id,
        payload,
        expected_revision=None,
        *,
        proposal_id=None,
    ):
        with self.transaction() as db:
            row = db.execute(
                "SELECT revision FROM flows WHERE id=?",
                (flow_id,),
            ).fetchone()
            actual = row[0] if row else 0
            # None retains the internal, trusted legacy service API. HTTP and
            # authoring always supply a concrete revision (0 means create).
            if expected_revision is not None and expected_revision != actual:
                raise RevisionConflict(f"工作流已更新（当前版本 {actual}），请重新载入后保存。")
            if proposal_id:
                row = db.execute(
                    "SELECT applied,expires_at FROM proposals WHERE id=?",
                    (proposal_id,),
                ).fetchone()
                if not row or row[0] or row[1] <= time.time():
                    raise RevisionConflict("修改建议已应用或已过期，请重新生成。")
                db.execute(
                    "UPDATE proposals SET applied=1 WHERE id=?",
                    (proposal_id,),
                )
            latest = (
                db.execute(
                    "SELECT MAX(revision) FROM versions WHERE flow_id=?",
                    (flow_id,),
                ).fetchone()[0]
                or 0
            )
            saved = {**payload, "id": flow_id, "revision": latest + 1}
            encoded, now = (
                json.dumps(saved, ensure_ascii=False, allow_nan=False),
                time.time(),
            )
            db.execute(
                "INSERT OR REPLACE INTO flows VALUES(?,?,?,?)",
                (flow_id, latest + 1, encoded, now),
            )
            db.execute(
                "INSERT INTO versions VALUES(?,?,?,?)",
                (flow_id, latest + 1, encoded, now),
            )
            return saved

    def delete(self, flow_id):
        with self.transaction() as db:
            return (
                db.execute("DELETE FROM flows WHERE id=?", (flow_id,)).rowcount
                > 0
            )

    def versions(self, flow_id):
        with self.transaction() as db:
            return [
                {
                    "revision": row[0],
                    "created_at": row[1],
                    "name": json.loads(row[2]).get("name", ""),
                    "node_count": len(json.loads(row[2]).get("nodes", {})),
                }
                for row in db.execute(
                    "SELECT revision,created_at,payload FROM versions WHERE "
                    "flow_id=? ORDER BY revision DESC",
                    (flow_id,),
                )
            ]

    def version(self, flow_id, revision):
        with self.transaction() as db:
            row = db.execute(
                "SELECT payload FROM versions WHERE flow_id=? AND revision=?",
                (flow_id, revision),
            ).fetchone()
            return json.loads(row[0]) if row else None

    def put_proposal(self, proposal):
        with self.transaction() as db:
            db.execute(
                "DELETE FROM proposals WHERE expires_at<?",
                (time.time(),),
            )
            db.execute(
                "INSERT INTO proposals(id,payload,expires_at) VALUES(?,?,?)",
                (
                    proposal["proposal_id"],
                    json.dumps(proposal, ensure_ascii=False, allow_nan=False),
                    proposal["expires_at"],
                ),
            )

    def proposal(self, proposal_id):
        with self.transaction() as db:
            row = db.execute(
                "SELECT payload FROM proposals WHERE id=? AND applied=0 "
                "AND expires_at>?",
                (proposal_id, time.time()),
            ).fetchone()
            return json.loads(row[0]) if row else None

    def claim_resume(self, parent_id, child_id):
        with self.transaction() as db:
            try:
                db.execute(
                    "INSERT INTO resume_claims VALUES(?,?)",
                    (parent_id, child_id),
                )
            except sqlite3.IntegrityError as exc:
                raise RevisionConflict(
                    "Run already resumed; follow its continuation",
                ) from exc

    def release_resume(self, parent_id, child_id):
        with self.transaction() as db:
            db.execute(
                "DELETE FROM resume_claims WHERE parent_id=? AND child_id=?",
                (parent_id, child_id),
            )
