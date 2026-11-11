# -*- coding: utf-8 -*-
"""Exercise desktop database paths through history, recall and backup."""

# pylint: disable=protected-access

from contextlib import closing
from pathlib import Path
import sqlite3
import sys
import platform
from types import SimpleNamespace

import pytest

from qwenpaw.agents.context.scroll.history import (
    HistoryStore,
    backup_history_database,
    validate_history_database,
)
from qwenpaw.agents.context.scroll.memoryspace import MemorySpace
from qwenpaw.agents.context.types import LogEntry
from qwenpaw.backup._ops.sqlite_snapshot import _snapshot
from qwenpaw.plugins.dependency_context import DependencyEnvironmentContext


def test_desktop_history_recall_and_snapshots_preserve_native_paths(tmp_path):
    root = tmp_path / "中文 workspace #100%"
    root.mkdir()
    _verify_history_paths(root)
    if sys.platform == "win32":
        _verify_history_paths(Path("\\\\?\\" + str(root / "extended")))


def _verify_history_paths(root):
    root.mkdir(parents=True, exist_ok=True)
    database = root / "history #%.db"
    store = HistoryStore(database)
    try:
        store.append(
            session_id="desktop",
            dedup_key="message",
            entry=LogEntry(
                kind="model_turn",
                role="assistant",
                content="saved",
            ),
        )
        assert store.count("desktop") == 1
        assert validate_history_database(database) == 1
        recall = MemorySpace(history_db_path=database, session_id="desktop")
        try:
            assert (
                recall._conn.execute(
                    "SELECT content FROM hist.conversation_history",
                ).fetchone()[0]
                == "saved"
            )
            with pytest.raises(sqlite3.DatabaseError):
                recall._conn.execute("DELETE FROM hist.conversation_history")
        finally:
            recall.close()
        history_backup = backup_history_database(database, root / "backup.db")
        assert validate_history_database(history_backup) == 1
        snapshot = root / "snapshot.db"
        _snapshot(database, snapshot)
        with closing(sqlite3.connect(snapshot)) as connection:
            assert (
                connection.execute(
                    "SELECT content FROM conversation_history",
                ).fetchone()[0]
                == "saved"
            )
    finally:
        store.close()
    maintenance = HistoryStore(database, initialize=False)
    try:
        assert maintenance.count("desktop") == 1
    finally:
        maintenance.close()


def test_desktop_dependency_executor_accepts_native_path_aliases(tmp_path):
    import packaging
    from packaging.tags import sys_tags
    from qwenpaw.plugins.channel_bootstrap import validate_runtime_identity

    prefix = "\\\\?\\" if sys.platform == "win32" else ""
    identity = {
        "implementation": sys.implementation.name,
        "cache_tag": sys.implementation.cache_tag,
        "version": list(sys.version_info[:2]),
        "sys_platform": sys.platform,
        "system": platform.system(),
        "machine": platform.machine(),
        "supported_tags": [str(tag) for tag in sys_tags()],
    }
    context = DependencyEnvironmentContext(
        prefix + sys.executable,
        Path(packaging.__file__).parent.parent,
        (),
        None,
        runtime_identity=identity,
    )
    assert context.inspect_executor()
    different = tmp_path / "different-python"
    different.write_bytes(b"different executable")
    with pytest.raises(ValueError, match="CHANNEL_RUNTIME_IDENTITY_MISMATCH"):
        validate_runtime_identity(
            SimpleNamespace(executable=str(different)),
            identity,
            sys.executable,
        )
