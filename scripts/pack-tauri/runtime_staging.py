#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Helpers for safely installing downloaded runtime directory trees."""

from __future__ import annotations

import os
import shutil
import tempfile
from pathlib import Path

from copy_windows_tree import copy_tree


def _remove_tree(path: Path, *, ignore_errors: bool = False) -> None:
    if not path.exists():
        return
    try:
        shutil.rmtree(_filesystem_path(path))
    except OSError:
        if not ignore_errors:
            raise


def _filesystem_path(path: Path) -> str:
    value = os.path.abspath(os.fspath(path))
    if os.name != "nt" or value.startswith("\\\\?\\"):
        return value
    if value.startswith("\\\\"):
        return "\\\\?\\UNC\\" + value[2:]
    return "\\\\?\\" + value


def atomic_install_tree(source: Path, dest: Path) -> None:
    """Copy *source* beside *dest*, then atomically replace *dest*.

    System temporary directories and the checkout may live on different
    Windows volumes. A direct replace from the temporary directory therefore
    fails with WinError 17. The final renames here always stay on one volume.
    """
    source = source.resolve()
    dest = dest.resolve()
    if not source.is_dir():
        raise ValueError(
            f"runtime staging source is not a directory: {source}",
        )

    dest.parent.mkdir(parents=True, exist_ok=True)
    pending = Path(
        tempfile.mkdtemp(prefix=f".{dest.name}.install-", dir=dest.parent),
    )
    pending.rmdir()
    backup = dest.with_name(f".{dest.name}.previous")
    try:
        if os.name == "nt":
            copy_tree(source, pending)
        else:
            shutil.copytree(source, pending, symlinks=True)
        if backup.exists():
            raise RuntimeError(
                f"stale runtime recovery directory exists: {backup}",
            )
        if dest.exists():
            os.replace(dest, backup)
        try:
            os.replace(pending, dest)
        except Exception:
            if backup.exists() and not dest.exists():
                os.replace(backup, dest)
            raise
        _remove_tree(backup, ignore_errors=True)
    finally:
        _remove_tree(pending, ignore_errors=True)
