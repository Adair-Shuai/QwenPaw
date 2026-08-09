# -*- coding: utf-8 -*-
"""Unit tests for the GenUI state store.

Covers plan section 9.1:
- Session isolation: different sessions don't see each other's trees
- ui_id format and uniqueness
- Revision lifecycle
- LRU eviction
- Thread safety (basic smoke)
"""

from __future__ import annotations

import threading

from qwenpaw.plugins_bundle.ugsci.genui.state import (
    GenUiStateStore,
    get_state_store,
)


# ─── Session Isolation ──────────────────────────────────────────────────────


class TestSessionIsolation:
    def test_different_sessions_isolated(self) -> None:
        store = GenUiStateStore()
        tree = {"kind": "Text", "props": {"value": "hi"}, "children": []}
        snap_a = store.create(session_id="session-a", tree=tree)
        snap_b = store.create(session_id="session-b", tree=tree)

        # session-a should only see snap_a
        assert store.get("session-a", snap_a.ui_id) is not None
        assert store.get("session-a", snap_b.ui_id) is None

        # session-b should only see snap_b
        assert store.get("session-b", snap_b.ui_id) is not None
        assert store.get("session-b", snap_a.ui_id) is None

    def test_same_session_multiple_trees(self) -> None:
        store = GenUiStateStore()
        tree = {"kind": "Text", "props": {"value": "hi"}, "children": []}
        snap1 = store.create(session_id="s1", tree=tree)
        snap2 = store.create(session_id="s1", tree=tree)

        assert store.get("s1", snap1.ui_id) is not None
        assert store.get("s1", snap2.ui_id) is not None
        assert snap1.ui_id != snap2.ui_id

    def test_get_nonexistent_returns_none(self) -> None:
        store = GenUiStateStore()
        assert store.get("s1", "ui_nonexistent") is None

    def test_get_nonexistent_session_returns_none(self) -> None:
        store = GenUiStateStore()
        assert store.get("nonexistent", "ui_anything") is None


# ─── ui_id Format ───────────────────────────────────────────────────────────


class TestUiIdFormat:
    def test_ui_id_prefix(self) -> None:
        store = GenUiStateStore()
        snap = store.create(
            session_id="s1",
            tree={"kind": "Stack", "children": []},
        )
        assert snap.ui_id.startswith("ui_")

    def test_ui_id_length(self) -> None:
        store = GenUiStateStore()
        snap = store.create(
            session_id="s1",
            tree={"kind": "Stack", "children": []},
        )
        # ui_ + 24 hex chars
        assert len(snap.ui_id) == 3 + 24

    def test_ui_id_unique(self) -> None:
        store = GenUiStateStore()
        ids = set()
        for _ in range(100):
            snap = store.create(
                session_id="s1",
                tree={"kind": "Stack", "children": []},
            )
            ids.add(snap.ui_id)
        assert len(ids) == 100


# ─── Revision Lifecycle ─────────────────────────────────────────────────────


class TestRevisionLifecycle:
    def test_initial_revision_is_1(self) -> None:
        store = GenUiStateStore()
        snap = store.create(
            session_id="s1",
            tree={"kind": "Stack", "children": []},
        )
        assert snap.revision == 1

    def test_tree_stored_correctly(self) -> None:
        store = GenUiStateStore()
        tree = {
            "schemaVersion": "1",
            "root": {
                "kind": "Text",
                "props": {"value": "test"},
                "children": [],
            },
        }
        snap = store.create(session_id="s1", tree=tree)
        retrieved = store.get("s1", snap.ui_id)
        assert retrieved is not None
        assert retrieved.tree == tree

    def test_snapshot_has_timestamp(self) -> None:
        store = GenUiStateStore()
        snap = store.create(
            session_id="s1",
            tree={"kind": "Stack", "children": []},
        )
        assert snap.updated_at > 0

    def test_snapshot_has_session_id(self) -> None:
        store = GenUiStateStore()
        snap = store.create(
            session_id="my-session",
            tree={"kind": "Stack", "children": []},
        )
        assert snap.session_id == "my-session"


# ─── LRU Eviction ───────────────────────────────────────────────────────────


class TestLRUEviction:
    def test_eviction_when_exceeding_max(self) -> None:
        store = GenUiStateStore(max_entries=3)
        tree = {"kind": "Stack", "children": []}
        snaps = [store.create(session_id="s1", tree=tree) for _ in range(4)]

        # First entry should be evicted
        assert store.get("s1", snaps[0].ui_id) is None
        # Remaining 3 should exist
        for snap in snaps[1:]:
            assert store.get("s1", snap.ui_id) is not None

    def test_get_moves_to_end(self) -> None:
        """
        Accessing an entry should move it to the end (MRU), preventing
        eviction.
        """
        store = GenUiStateStore(max_entries=3)
        tree = {"kind": "Stack", "children": []}
        snap1 = store.create(session_id="s1", tree=tree)
        snap2 = store.create(session_id="s1", tree=tree)
        store.create(session_id="s1", tree=tree)  # snap3

        # Access snap1 to make it MRU
        store.get("s1", snap1.ui_id)

        # Add a new entry — snap2 (LRU) should be evicted, not snap1
        store.create(session_id="s1", tree=tree)  # snap4
        assert (
            store.get("s1", snap1.ui_id) is not None
        )  # Was accessed, still alive
        assert store.get("s1", snap2.ui_id) is None  # LRU, evicted


# ─── get_state_store Singleton ─────────────────────────────────────────────


class TestGetStateStore:
    def test_returns_same_instance(self) -> None:
        store1 = get_state_store()
        store2 = get_state_store()
        assert store1 is store2

    def test_is_gen_ui_state_store(self) -> None:
        store = get_state_store()
        assert isinstance(store, GenUiStateStore)


# ─── Thread Safety Smoke ────────────────────────────────────────────────────


class TestThreadSafety:
    def test_concurrent_creates_no_crash(self) -> None:
        """Concurrent create calls should not crash or corrupt state."""
        store = GenUiStateStore(max_entries=1000)
        tree = {"kind": "Stack", "children": []}
        errors: list[Exception] = []

        def worker():
            try:
                for _ in range(50):
                    store.create(session_id="s1", tree=tree)
            except Exception as exc:
                errors.append(exc)

        threads = [threading.Thread(target=worker) for _ in range(4)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        assert len(errors) == 0
        # Should have created 200 entries (but max_entries=1000, so no
        # eviction)
        snap = store.create(session_id="s1", tree=tree)
        assert snap is not None
