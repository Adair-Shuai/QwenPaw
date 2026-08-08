# -*- coding: utf-8 -*-
"""GenUI state store — manages ui_id and revision lifecycle.

Phase-1: Process-local LRU cache. Each emit_ui_tree call creates a new snapshot
with a server-generated ui_id. Phase-2 will add patch support with revision
checking and optional database persistence.
"""

import threading
from collections import OrderedDict
from dataclasses import dataclass, field
from typing import Any
from uuid import uuid4


@dataclass
class GenUiSnapshot:
    """Immutable snapshot of a GenUI tree at a specific revision."""

    ui_id: str
    session_id: str
    revision: int
    tree: dict[str, Any]
    tool_call_id: str = ""
    message_id: str = ""
    updated_at: float = 0.0


class GenUiStateStore:
    """Thread-safe LRU cache for GenUI snapshots, keyed by session + ui_id.

    Phase-1: create-only (no patch). Each emit_ui_tree call generates a new
    ui_id and revision=1. The store is process-local; persistence across
    restarts relies on PLUGIN_CALL_OUTPUT message history recovery on the
    frontend.
    """

    def __init__(self, max_entries: int = 256) -> None:
        self._max = max_entries
        self._store: OrderedDict[str, GenUiSnapshot] = OrderedDict()
        self._lock = threading.Lock()

    def create(
        self,
        session_id: str,
        tree: dict[str, Any],
        tool_call_id: str = "",
    ) -> GenUiSnapshot:
        """Create a new snapshot with a fresh ui_id and revision=1."""
        import time

        ui_id = f"ui_{uuid4().hex[:24]}"
        snapshot = GenUiSnapshot(
            ui_id=ui_id,
            session_id=session_id,
            revision=1,
            tree=tree,
            tool_call_id=tool_call_id,
            updated_at=time.time(),
        )
        key = f"{session_id}::{ui_id}"
        with self._lock:
            self._store[key] = snapshot
            self._evict_locked()
        return snapshot

    def get(self, session_id: str, ui_id: str) -> GenUiSnapshot | None:
        """Return the snapshot for session_id + ui_id, or None."""
        key = f"{session_id}::{ui_id}"
        with self._lock:
            snap = self._store.get(key)
            if snap is not None:
                self._store.move_to_end(key)
            return snap

    def clear_session(self, session_id: str) -> int:
        """Remove all snapshots for a session. Returns count removed."""
        removed = 0
        with self._lock:
            keys_to_remove = [
                k for k, v in self._store.items()
                if v.session_id == session_id
            ]
            for k in keys_to_remove:
                del self._store[k]
                removed += 1
        return removed

    def _evict_locked(self) -> None:
        """Evict oldest entries when over capacity. Caller must hold lock."""
        while len(self._store) > self._max:
            self._store.popitem(last=False)


# Module-level singleton (process-local).
_global_store: GenUiStateStore | None = None
_store_lock = threading.Lock()


def get_state_store() -> GenUiStateStore:
    """Return the global GenUiStateStore singleton."""
    global _global_store
    if _global_store is None:
        with _store_lock:
            if _global_store is None:
                _global_store = GenUiStateStore()
    return _global_store


__all__ = ["GenUiSnapshot", "GenUiStateStore", "get_state_store"]
