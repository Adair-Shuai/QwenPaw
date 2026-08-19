# -*- coding: utf-8 -*-
"""Tests for revealing workspace files in the OS file manager."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

from qwenpaw.services import reveal_file


def test_open_in_file_manager_selects_an_existing_file(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Existing files are handed to the platform file manager."""
    target = tmp_path / "notes.md"
    target.write_text("hello", encoding="utf-8")
    calls: list[list[str]] = []
    monkeypatch.setattr(reveal_file, "spawn_file_manager", calls.append)

    reveal_file.open_in_file_manager(target)

    assert calls
    argv = calls[0]
    if sys.platform == "win32":
        assert argv[1] == "/select,"
        assert Path(argv[2]) == target.resolve()
    elif sys.platform == "darwin":
        assert argv[:2] == ["open", "-R"]
        assert Path(argv[2]) == target.resolve()
    else:
        assert argv[0] == "xdg-open"
        assert Path(argv[1]) == target.parent.resolve()


def test_open_in_file_manager_falls_back_to_parent_directory(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """A missing file still opens the folder that should contain it."""
    missing = tmp_path / "gone.md"
    calls: list[list[str]] = []
    monkeypatch.setattr(reveal_file, "spawn_file_manager", calls.append)

    reveal_file.open_in_file_manager(missing)

    assert calls
    argv = calls[0]
    if sys.platform == "win32":
        assert Path(argv[-1]) == tmp_path.resolve()
        assert "/select," not in argv
    elif sys.platform == "darwin":
        assert argv[0] == "open"
        assert Path(argv[-1]) == tmp_path.resolve()
    else:
        assert argv[0] == "xdg-open"
        assert Path(argv[1]) == tmp_path.resolve()


def test_reveal_workspace_path_opens_relative_files(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """The public helper resolves POSIX API paths before spawning."""
    notes = tmp_path / "notes.md"
    notes.write_text("hello", encoding="utf-8")
    opened: list[Path] = []

    def record_open(target: Path) -> None:
        opened.append(Path(target))

    monkeypatch.setattr(reveal_file, "open_in_file_manager", record_open)

    reveal_file.reveal_workspace_path(tmp_path, "notes.md")

    assert opened == [notes.resolve()]
