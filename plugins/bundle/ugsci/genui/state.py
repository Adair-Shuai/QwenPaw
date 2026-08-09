# -*- coding: utf-8 -*-
"""GenUI state store — manages ui_id and revision lifecycle."""
import threading, time, logging
from collections import OrderedDict
from dataclasses import dataclass
from typing import Any
from uuid import uuid4

from .schema import apply_ui_patches, validate_ui_tree

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.genui")

@dataclass
class GenUiSnapshot:
    ui_id: str; session_id: str; revision: int; tree: dict[str, Any]
    tool_call_id: str = ""; message_id: str = ""; updated_at: float = 0.0

class GenUiStateStore:
    def __init__(self, max_entries: int = 256) -> None:
        self._max = max_entries; self._store: OrderedDict[str, GenUiSnapshot] = OrderedDict(); self._lock = threading.Lock()
    def create(self, session_id: str, tree: dict[str, Any], tool_call_id: str = "") -> GenUiSnapshot:
        ui_id = f"ui_{uuid4().hex[:24]}"
        snap = GenUiSnapshot(ui_id=ui_id, session_id=session_id, revision=1, tree=tree, tool_call_id=tool_call_id, updated_at=time.time())
        key = f"{session_id}::{ui_id}"
        with self._lock: self._store[key] = snap; self._evict_locked()
        return snap
    def get(self, session_id: str, ui_id: str) -> GenUiSnapshot | None:
        key = f"{session_id}::{ui_id}"
        with self._lock:
            snap = self._store.get(key)
            if snap: self._store.move_to_end(key)
            return snap
    def apply_patch(self, session_id: str, ui_id: str, base_revision: int, patches: list[dict[str, Any]]) -> GenUiSnapshot:
        """Apply patches to an existing tree. Raises ValueError on revision conflict or validation failure."""
        key = f"{session_id}::{ui_id}"
        with self._lock:
            snap = self._store.get(key)
            if snap is None:
                raise ValueError(f"ui_id '{ui_id}' not found in session '{session_id}'")
            if snap.revision != base_revision:
                raise ValueError(f"revision conflict: expected {snap.revision}, got base_revision {base_revision}")
            # Apply patches to a copy of the tree
            try:
                new_tree = apply_ui_patches(snap.tree, patches)
            except Exception as exc:
                raise ValueError(f"patch application failed: {exc}") from exc
            # Re-validate the patched tree
            try:
                validated = validate_ui_tree(new_tree)
            except Exception as exc:
                raise ValueError(f"patched tree is invalid: {exc}") from exc
            # Create new snapshot with incremented revision
            new_snap = GenUiSnapshot(
                ui_id=ui_id, session_id=session_id,
                revision=snap.revision + 1,
                tree=validated, tool_call_id=snap.tool_call_id,
                message_id=snap.message_id, updated_at=time.time(),
            )
            self._store[key] = new_snap
            self._store.move_to_end(key)
            return new_snap
    def _evict_locked(self) -> None:
        while len(self._store) > self._max: self._store.popitem(last=False)

_global_store: GenUiStateStore | None = None
_store_lock = threading.Lock()
def get_state_store() -> GenUiStateStore:
    global _global_store
    if _global_store is None:
        with _store_lock:
            if _global_store is None: _global_store = GenUiStateStore()
    return _global_store

__all__ = ["GenUiSnapshot", "GenUiStateStore", "get_state_store"]
