# -*- coding: utf-8 -*-
"""SQLite storage with atomic, owner-scoped mutations and short connections."""

from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Callable


class InteractionStore:
    def __init__(self, path: Path):
        self.path = path

    @contextmanager
    def connection(self, *, write: bool = False):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(self.path, timeout=10)
        try:
            conn.execute(
                "CREATE TABLE IF NOT EXISTS interactions ("
                "id TEXT PRIMARY KEY, agent_id TEXT NOT NULL, "
                "session_id TEXT NOT NULL, payload TEXT NOT NULL)",
            )
            conn.execute(
                "CREATE INDEX IF NOT EXISTS interaction_scope "
                "ON interactions(agent_id, session_id)",
            )
            if write:
                conn.execute("BEGIN IMMEDIATE")
            yield conn
            conn.commit()
        except BaseException:
            conn.rollback()
            raise
        finally:
            conn.close()

    def create(self, record: dict[str, Any]) -> dict[str, Any]:
        with self.connection(write=True) as conn:
            conn.execute(
                "INSERT INTO interactions VALUES (?, ?, ?, ?)",
                (
                    record["id"],
                    record["agent_id"],
                    record["session_id"],
                    json.dumps(record, ensure_ascii=False, allow_nan=False),
                ),
            )
        return record

    def list(self, agent_id: str, session_id: str) -> list[dict[str, Any]]:
        with self.connection() as conn:
            rows = conn.execute(
                "SELECT payload FROM interactions "
                "WHERE agent_id=? AND session_id=? ORDER BY rowid",
                (agent_id, session_id),
            ).fetchall()
        return [json.loads(row[0]) for row in rows]

    @staticmethod
    def _get(conn, request_id: str, agent_id: str, session_id: str):
        row = conn.execute(
            "SELECT payload FROM interactions "
            "WHERE id=? AND agent_id=? AND session_id=?",
            (request_id, agent_id, session_id),
        ).fetchone()
        if row is None:
            raise KeyError("Interaction not found")
        return json.loads(row[0])

    def get(self, request_id: str, agent_id: str, session_id: str):
        with self.connection() as conn:
            return self._get(conn, request_id, agent_id, session_id)

    def update(
        self,
        request_id: str,
        agent_id: str,
        session_id: str,
        mutate: Callable[[dict[str, Any]], None],
    ) -> dict[str, Any]:
        with self.connection(write=True) as conn:
            record = self._get(conn, request_id, agent_id, session_id)
            mutate(record)
            conn.execute(
                "UPDATE interactions SET payload=? WHERE id=?",
                (
                    json.dumps(record, ensure_ascii=False, allow_nan=False),
                    request_id,
                ),
            )
        return record
