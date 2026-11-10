# -*- coding: utf-8 -*-
"""Real source backups remain durable and preserve read-only file modes."""
import os
import stat

import pytest

from qwenpaw.plugins.dependency_transaction import (
    _sync_source,
    backup_source,
    restore_source,
)


@pytest.mark.parametrize("read_only", [False, True])
def test_source_backup_and_restore_flush_exact_bytes_and_modes(
    tmp_path,
    read_only,
):
    source = tmp_path / "installed"
    source.mkdir()
    file = source / "plugin.py"
    original = b"PLUGIN_VERSION = 'original'\n"
    file.write_bytes(original)
    if read_only:
        file.chmod(stat.S_IREAD)
    mode = stat.S_IMODE(file.stat().st_mode)
    journal = tmp_path / "operation"
    journal.mkdir()
    try:
        before = backup_source(journal, source)
        retained = journal / "previous_source" / file.name
        assert file.read_bytes() == retained.read_bytes() == original
        assert stat.S_IMODE(file.stat().st_mode) == mode
        assert stat.S_IMODE(retained.stat().st_mode) == mode
        file.chmod(mode | stat.S_IWRITE)
        file.write_bytes(b"PLUGIN_VERSION = 'replacement'\n")
        restore_source(journal, {"source_before": before})
        assert file.read_bytes() == original
        assert stat.S_IMODE(file.stat().st_mode) == mode
        assert retained.read_bytes() == original
        assert stat.S_IMODE(retained.stat().st_mode) == mode
    finally:
        # These are the test's own copies; permit normal fixture cleanup.
        for path in tmp_path.rglob("*"):
            if path.is_file() and not path.is_symlink():
                path.chmod(stat.S_IMODE(path.stat().st_mode) | stat.S_IWRITE)


def test_source_sync_failure_preserves_original_read_only_mode(
    tmp_path,
    monkeypatch,
):
    file = tmp_path / "owned_backup.py"
    file.write_bytes(b"original bytes\n")
    file.chmod(stat.S_IREAD)
    mode = stat.S_IMODE(file.stat().st_mode)

    def failed_flush(_descriptor):
        raise OSError("flush failed")

    monkeypatch.setattr(os, "fsync", failed_flush)
    try:
        with pytest.raises(OSError, match="flush failed"):
            _sync_source(tmp_path)
        assert file.read_bytes() == b"original bytes\n"
        assert stat.S_IMODE(file.stat().st_mode) == mode
    finally:
        file.chmod(mode | stat.S_IWRITE)
