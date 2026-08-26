# -*- coding: utf-8 -*-
"""Tests for durable offloaded tool-result retention."""

from qwenpaw.agents.offloader import QwenPawOffloader


def test_cleanup_expired_keeps_files_when_retention_is_disabled(
    tmp_path,
) -> None:
    tool_results = tmp_path / "tool_results"
    tool_results.mkdir()
    artifact = tool_results / "old-result.txt"
    artifact.write_text("complete result", encoding="utf-8")

    offloader = QwenPawOffloader(
        dialog_path=str(tmp_path / "dialog"),
        tool_results_dir=str(tool_results),
    )

    assert offloader.cleanup_expired() == 0
    assert offloader.cleanup_expired(0) == 0
    assert artifact.read_text(encoding="utf-8") == "complete result"
