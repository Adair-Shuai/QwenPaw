# -*- coding: utf-8 -*-
"""Regression tests for the canonical UGSci packaging mirror."""

from pathlib import Path

from scripts.sync_ugsci_bundle import find_drift, sync


def test_mirror_reports_and_removes_obsolete_files(tmp_path: Path) -> None:
    source = tmp_path / "source"
    destination = tmp_path / "destination"
    source.mkdir()
    destination.mkdir()
    (source / "live.py").write_text("value = 1\n", encoding="utf-8")
    (destination / "live.py").write_text("value = 1\n", encoding="utf-8")
    obsolete = destination / "obsolete.py"
    obsolete.write_text("stale = True\n", encoding="utf-8")

    assert find_drift(source, destination) == ["obsolete: obsolete.py"]

    copied, removed = sync(source, destination)

    assert copied == 0
    assert removed == 1
    assert not obsolete.exists()
    assert not find_drift(source, destination)
