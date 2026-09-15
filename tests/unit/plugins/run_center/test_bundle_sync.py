# -*- coding: utf-8 -*-
from pathlib import Path

from scripts.sync_run_center_bundle import find_drift, sync


def test_run_center_mirror_removes_excluded_build_files(
    tmp_path: Path,
) -> None:
    source = tmp_path / "source"
    destination = tmp_path / "destination"
    source.mkdir()
    destination.mkdir()
    (source / "plugin.json").write_text('{"id":"demo"}\n', encoding="utf-8")
    (destination / "plugin.json").write_text(
        '{"id":"demo"}\n', encoding="utf-8"
    )
    stale = destination / "__pycache__" / "old.pyc"
    stale.parent.mkdir()
    stale.write_bytes(b"stale")

    assert "obsolete: __pycache__/old.pyc" in find_drift(source, destination)
    copied, removed = sync(source, destination)
    assert copied == 0
    assert removed == 1
    assert not stale.exists()
