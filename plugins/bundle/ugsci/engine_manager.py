# -*- coding: utf-8 -*-
"""Backward-compatibility shim — re-exports from ``engine/`` package.

All engine detection and management logic has been moved to the
``engine/`` sub-package for better organisation:

- ``engine/manager.py``  — data model, persistence, CRUD
- ``engine/detector.py``  — per-software detection strategies + parallel
- ``engine/adapters/``    — simulation adapters (CMG / Eclipse / COMSOL)
- ``engine/tools/``       — simulation control tools

This module re-exports the public API so that existing imports
``from .engine_manager import ...`` continue to work.
"""
from __future__ import annotations

from .engine import (
    EngineInfo,
    DEFAULT_ENGINES,
    ENGINES_DIR,
    _LEGACY_ENGINES_DIR,
    _migrate_legacy_engines,
    init_default_engines,
    list_engines,
    get_engine,
    add_engine,
    update_engine,
    delete_engine,
    to_dict,
    engines_to_list,
    build_capability_summary,
    detect_engines,
)

__all__ = [
    "EngineInfo",
    "DEFAULT_ENGINES",
    "ENGINES_DIR",
    "_LEGACY_ENGINES_DIR",
    "_migrate_legacy_engines",
    "init_default_engines",
    "list_engines",
    "get_engine",
    "add_engine",
    "update_engine",
    "delete_engine",
    "to_dict",
    "engines_to_list",
    "build_capability_summary",
    "detect_engines",
]
