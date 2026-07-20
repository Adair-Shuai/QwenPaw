# -*- coding: utf-8 -*-
"""UGSci Engine package — detection, management, adapters, and tools.

Sub-modules:
- ``manager``   — data model, persistence, CRUD operations
- ``detector``   — per-software detection strategies + parallel detection
- ``adapters``   — simulation adapters (CMG / Eclipse / COMSOL)
- ``tools``      — simulation control tools (launch / monitor / results)

Public API re-exports everything from ``manager`` and ``detector`` so that
``from .engine import ...`` works as a drop-in replacement for the old
``engine_manager`` module.
"""
from __future__ import annotations

from .manager import (
    EngineInfo,
    DEFAULT_ENGINES,
    ENGINES_DIR,
    init_default_engines,
    list_engines,
    get_engine,
    add_engine,
    update_engine,
    delete_engine,
    to_dict,
    engines_to_list,
    build_capability_summary,
    _write_engine,
    _read_all_engines,
    _read_engine,
)

from .detector import (
    detect_engines,
)

__all__ = [
    # Data model
    "EngineInfo",
    "DEFAULT_ENGINES",
    "ENGINES_DIR",
    # CRUD
    "init_default_engines",
    "list_engines",
    "get_engine",
    "add_engine",
    "update_engine",
    "delete_engine",
    "to_dict",
    "engines_to_list",
    "build_capability_summary",
    # Detection
    "detect_engines",
    # Internal (used by plugin.py and tools)
    "_write_engine",
    "_read_all_engines",
    "_read_engine",
]
