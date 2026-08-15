# -*- coding: utf-8 -*-
"""Best-effort .pth processing for the portable Windows dependency layer."""

from __future__ import annotations

import os
import sys


def bootstrap_windows_pth_dirs() -> None:
    """Process dependency-layer .pth files in portable Windows installs.

    The bundled python-packages layer is added through PYTHONPATH, which does
    not process .pth files. pywin32 relies on pywin32.pth to register the
    win32/pythonwin import paths and the pywin32_system32 DLL directory;
    without it mcp.os.win32 cannot import pywintypes and the desktop backend
    exits during startup.
    """
    if sys.platform != "win32":
        return
    for entry in list(sys.path):
        if not entry or not os.path.isdir(entry):
            continue
        pth = os.path.join(entry, "pywin32.pth")
        if os.path.isfile(pth):
            _process_pth_file(entry, pth)
            break


def _process_pth_file(directory: str, pth: str) -> None:
    try:
        with open(pth, encoding="utf-8", errors="replace") as stream:
            lines = stream.read().splitlines()
    except OSError:
        return
    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if stripped.startswith("import "):
            try:
                # noqa: S102 - execute the dependency's own import line.
                exec(stripped, {"__name__": "__qwenpaw_pywin32_pth__"})
            except Exception:
                continue
            continue
        candidate = os.path.join(directory, stripped)
        if os.path.isdir(candidate):
            normalized = os.path.normcase(os.path.abspath(candidate))
            if not any(
                os.path.normcase(os.path.abspath(item)) == normalized
                for item in sys.path
            ):
                sys.path.append(candidate)
