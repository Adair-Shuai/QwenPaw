#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Helpers for safely installing downloaded runtime directory trees."""

from __future__ import annotations

import os
import shutil
import tempfile
from pathlib import Path


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
        shutil.copytree(source, pending, symlinks=True)
        if backup.exists():
            shutil.rmtree(backup)
        if dest.exists():
            os.replace(dest, backup)
        try:
            os.replace(pending, dest)
        except Exception:
            if backup.exists() and not dest.exists():
                os.replace(backup, dest)
            raise
        shutil.rmtree(backup, ignore_errors=True)
    finally:
        shutil.rmtree(pending, ignore_errors=True)
