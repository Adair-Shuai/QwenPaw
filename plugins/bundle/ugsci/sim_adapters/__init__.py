# -*- coding: utf-8 -*-
"""Backward-compatibility shim — re-exports from ``engine.adapters``.

Simulation adapters have been moved to ``engine/adapters/``.
This module re-exports the public API so that existing imports
``from .sim_adapters import ...`` continue to work.
"""
from __future__ import annotations

from .engine.adapters import (
    BaseSimAdapter,
    SimProgress,
    SimSummary,
    SimWarning,
    get_adapter,
    list_supported_simulators,
)

__all__ = [
    "BaseSimAdapter",
    "SimProgress",
    "SimSummary",
    "SimWarning",
    "get_adapter",
    "list_supported_simulators",
]
