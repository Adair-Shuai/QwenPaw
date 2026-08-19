# -*- coding: utf-8 -*-
"""Reveal a workspace file in the host OS file manager."""
# The subprocess is intentionally fire-and-forget; the caller must not wait
# for Explorer/Finder/xdg-open to exit.
# pylint: disable=consider-using-with

from __future__ import annotations

import os
import subprocess
import sys
from collections.abc import Sequence
from pathlib import Path

from .workspace_files import resolve_reveal_target


def spawn_file_manager(argv: list[str]) -> None:
    """Launch the OS file manager without waiting for it to exit."""
    if sys.platform == "win32":
        subprocess.Popen(  # noqa: S603
            argv,
            close_fds=True,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
        return
    subprocess.Popen(argv, close_fds=True)  # noqa: S603


def open_in_file_manager(target: Path) -> None:
    """Reveal *target* in Explorer / Finder / the user file manager.

    If the file is missing, the parent directory is opened when it exists.
    """
    resolved = Path(target).resolve()
    if resolved.exists():
        _open_existing(resolved)
        return
    parent = resolved.parent
    if parent.exists():
        _open_existing(parent)
        return
    raise FileNotFoundError(str(resolved))


def reveal_workspace_path(
    files_root: Path,
    api_path: str,
    extra_roots: Sequence[Path] | None = None,
) -> None:
    """Resolve a workspace API path, then reveal it in the OS file manager."""
    open_in_file_manager(
        resolve_reveal_target(files_root, api_path, extra_roots),
    )


def _open_existing(target: Path) -> None:
    if sys.platform == "win32":
        _open_windows(target)
        return
    if sys.platform == "darwin":
        if target.is_file():
            spawn_file_manager(["open", "-R", str(target)])
            return
        spawn_file_manager(["open", str(target)])
        return
    directory = target if target.is_dir() else target.parent
    spawn_file_manager(["xdg-open", str(directory)])


def _open_windows(target: Path) -> None:
    windir = os.environ.get("WINDIR", "C:\\Windows")
    explorer = str(Path(windir) / "explorer.exe")
    normalized = os.path.normpath(str(target))
    if target.is_file():
        spawn_file_manager([explorer, "/select,", normalized])
        return
    spawn_file_manager([explorer, normalized])
