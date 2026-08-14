# -*- coding: utf-8 -*-
"""Regression guards for safe release artifact resume and replacement."""

from __future__ import annotations

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]


def _workflow(name: str) -> str:
    return (REPO_ROOT / ".github" / "workflows" / name).read_text(
        encoding="utf-8",
    )


def test_resumed_artifacts_must_match_release_commit_and_metadata() -> None:
    release = _workflow("release.yml")

    assert 'if [ "$source_sha" != "$sha" ]' in release
    assert release.count("was not built from release commit $sha") >= 3
    assert "grep -qx 'tauri-updater-meta-windows'" in release
    assert "grep -qx 'tauri-updater-meta-macos'" in release


def test_replacement_desktop_runs_overlay_pair() -> None:
    publish = _workflow("desktop-publish.yml")
    promote = _workflow("desktop-promote.yml")

    # desktop-publish has separate GitHub Release and OSS jobs.
    assert publish.count("Download replacement Windows updater metadata") == 2
    assert publish.count("Download replacement macOS updater metadata") == 2
    assert (
        publish.count(
            "rm -rf UGSci-Desktop-Tauri-Windows-* tauri-updater-meta-windows",
        )
        == 2
    )
    assert (
        publish.count(
            "rm -rf UGSci-Desktop-Tauri-macOS-* tauri-updater-meta-macos",
        )
        == 2
    )

    assert "Overlay replacement Windows updater metadata" in promote
    assert "Overlay replacement macOS updater metadata" in promote
    assert "cp -a replacement-windows/tauri-updater-meta-windows ." in promote
    assert "cp -a replacement-macos/tauri-updater-meta-macos ." in promote
