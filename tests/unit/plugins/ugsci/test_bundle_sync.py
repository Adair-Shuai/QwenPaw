# -*- coding: utf-8 -*-
"""Regression tests for the canonical UGSci packaging mirror."""

# pylint: disable=no-name-in-module

from pathlib import Path

from scripts.sync_ugsci_bundle import (
    _generated_bundle_targets,
    find_drift,
    sync,
)


def test_generated_bundle_targets_exclude_repository_runtime_dirs(
    tmp_path: Path,
) -> None:
    relative_targets = [
        target.relative_to(tmp_path)
        for target in _generated_bundle_targets(tmp_path)
    ]

    assert all(
        not any(part.startswith(".qwenpaw") for part in target.parts)
        for target in relative_targets
    )


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


def test_mirror_removes_files_excluded_from_canonical_source(
    tmp_path: Path,
) -> None:
    source = tmp_path / "source"
    destination = tmp_path / "destination"
    source.mkdir()
    destination.mkdir()
    (source / "live.py").write_text("value = 1\n", encoding="utf-8")
    (destination / "live.py").write_text("value = 1\n", encoding="utf-8")

    stale_docs = destination / "docs" / "independent.md"
    stale_cache = destination / "__pycache__" / "module.pyc"
    stale_node = destination / "ui" / "node_modules" / "package.json"
    for path in (stale_docs, stale_cache, stale_node):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("stale\n", encoding="utf-8")

    assert find_drift(source, destination) == [
        "obsolete: __pycache__/module.pyc",
        "obsolete: docs/independent.md",
        "obsolete: ui/node_modules/package.json",
    ]

    copied, removed = sync(source, destination)

    assert copied == 0
    assert removed == 3
    assert not stale_docs.exists()
    assert not stale_cache.exists()
    assert not stale_node.exists()
    assert not find_drift(source, destination)
