# -*- coding: utf-8 -*-
"""Persistent GenUI state keyed by ``session_id::ui_id``."""

import json
import os
import sqlite3
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from uuid import uuid4

from .schema import apply_ui_patches, validate_ui_tree


@dataclass
class GenUiSnapshot:
    ui_id: str
    session_id: str
    revision: int
    tree: dict[str, Any]
    tool_call_id: str = ""
    message_id: str = ""
    updated_at: float = 0.0


class GenUiStateStore:
    """Thread-safe SQLite store; ``path=None`` creates an isolated memory DB."""

    def __init__(self, max_entries: int = 256, path: str | Path | None = None) -> None:
        self._max = max_entries
        self._lock = threading.RLock()
        self._path = str(path) if path is not None else ":memory:"
        if self._path != ":memory:":
            Path(self._path).parent.mkdir(parents=True, exist_ok=True)
        self._db = sqlite3.connect(self._path, check_same_thread=False)
        self._db.execute("PRAGMA journal_mode=WAL")
        self._db.execute(
            """CREATE TABLE IF NOT EXISTS genui_snapshots (
            session_id TEXT NOT NULL, ui_id TEXT NOT NULL, revision INTEGER NOT NULL,
            tree_json TEXT NOT NULL, tool_call_id TEXT NOT NULL DEFAULT '',
            message_id TEXT NOT NULL DEFAULT '', updated_at REAL NOT NULL,
            PRIMARY KEY(session_id, ui_id))""",
        )
        self._db.commit()

    @staticmethod
    def _from_row(row: tuple[Any, ...] | None) -> GenUiSnapshot | None:
        if row is None:
            return None
        return GenUiSnapshot(
            session_id=row[0], ui_id=row[1], revision=row[2],
            tree=json.loads(row[3]), tool_call_id=row[4],
            message_id=row[5], updated_at=row[6],
        )

    def create(self, session_id: str, tree: dict[str, Any], tool_call_id: str = "") -> GenUiSnapshot:
        if not session_id:
            raise ValueError("session_id is required")
        snap = GenUiSnapshot(
            ui_id=f"ui_{uuid4().hex[:24]}", session_id=session_id,
            revision=1, tree=tree, tool_call_id=tool_call_id,
            updated_at=time.time(),
        )
        with self._lock:
            self._db.execute(
                "INSERT INTO genui_snapshots VALUES (?, ?, ?, ?, ?, ?, ?)",
                (snap.session_id, snap.ui_id, snap.revision,
                 json.dumps(snap.tree, ensure_ascii=False), snap.tool_call_id,
                 snap.message_id, snap.updated_at),
            )
            self._evict_locked()
            self._db.commit()
        return snap

    def get(self, session_id: str, ui_id: str) -> GenUiSnapshot | None:
        with self._lock:
            row = self._db.execute(
                "SELECT session_id, ui_id, revision, tree_json, tool_call_id, message_id, updated_at "
                "FROM genui_snapshots WHERE session_id=? AND ui_id=?",
                (session_id, ui_id),
            ).fetchone()
            if row is not None:
                # Access refreshes LRU position without changing revision.
                touched = time.time()
                self._db.execute(
                    "UPDATE genui_snapshots SET updated_at=? WHERE session_id=? AND ui_id=?",
                    (touched, session_id, ui_id),
                )
                self._db.commit()
                row = (*row[:-1], touched)
        return self._from_row(row)

    def apply_patch(self, session_id: str, ui_id: str, base_revision: int, patches: list[dict[str, Any]]) -> GenUiSnapshot:
        with self._lock:
            self._db.execute("BEGIN IMMEDIATE")
            try:
                row = self._db.execute(
                    "SELECT session_id, ui_id, revision, tree_json, tool_call_id, message_id, updated_at "
                    "FROM genui_snapshots WHERE session_id=? AND ui_id=?",
                    (session_id, ui_id),
                ).fetchone()
                snap = self._from_row(row)
                if snap is None:
                    raise ValueError(f"ui_id '{ui_id}' not found in session '{session_id}'")
                if snap.revision != base_revision:
                    raise ValueError(f"revision conflict: expected {snap.revision}, got base_revision {base_revision}")
                try:
                    validated = validate_ui_tree(apply_ui_patches(snap.tree, patches))
                except Exception as exc:
                    raise ValueError(f"invalid patch result: {exc}") from exc
                updated = GenUiSnapshot(
                    ui_id=ui_id, session_id=session_id,
                    revision=snap.revision + 1, tree=validated,
                    tool_call_id=snap.tool_call_id, message_id=snap.message_id,
                    updated_at=time.time(),
                )
                cursor = self._db.execute(
                    "UPDATE genui_snapshots SET revision=?, tree_json=?, updated_at=? "
                    "WHERE session_id=? AND ui_id=? AND revision=?",
                    (updated.revision, json.dumps(updated.tree, ensure_ascii=False),
                     updated.updated_at, session_id, ui_id, base_revision),
                )
                if cursor.rowcount != 1:
                    raise ValueError("revision conflict: snapshot changed concurrently")
                self._db.commit()
                return updated
            except Exception:
                self._db.rollback()
                raise

    def count(self) -> int:
        """Return the total number of snapshots in the store."""
        with self._lock:
            return self._db.execute("SELECT COUNT(*) FROM genui_snapshots").fetchone()[0]

    def clear_session(self, session_id: str) -> None:
        with self._lock:
            self._db.execute("DELETE FROM genui_snapshots WHERE session_id=?", (session_id,))
            self._db.commit()

    def close(self) -> None:
        with self._lock:
            self._db.close()

    def _evict_locked(self) -> None:
        count = self._db.execute("SELECT COUNT(*) FROM genui_snapshots").fetchone()[0]
        excess = count - self._max
        if excess > 0:
            self._db.execute(
                "DELETE FROM genui_snapshots WHERE rowid IN "
                "(SELECT rowid FROM genui_snapshots ORDER BY updated_at ASC LIMIT ?)",
                (excess,),
            )


_global_store: GenUiStateStore | None = None
_store_lock = threading.Lock()


def _default_store_path() -> Path:
    override = os.environ.get("GENUI_STATE_DB", "").strip()
    if override:
        return Path(override).expanduser()
    try:
        from qwenpaw.constant import WORKING_DIR
        return Path(WORKING_DIR) / "state" / "genui.sqlite3"
    except Exception:
        return Path.cwd() / ".qwenpaw" / "state" / "genui.sqlite3"


def get_state_store() -> GenUiStateStore:
    global _global_store
    if _global_store is None:
        with _store_lock:
            if _global_store is None:
                path = None if os.environ.get("PYTEST_CURRENT_TEST") else _default_store_path()
                _global_store = GenUiStateStore(path=path)
    return _global_store


def dispose_state_store() -> None:
    global _global_store
    with _store_lock:
        if _global_store is not None:
            _global_store.close()
            _global_store = None


__all__ = ["GenUiSnapshot", "GenUiStateStore", "get_state_store", "dispose_state_store"]
