# -*- coding: utf-8 -*-
"""Backward-compatibility shim — re-exports from ``engine.adapters.base``."""
from __future__ import annotations

from .engine.adapters.base import (
    BaseSimAdapter,
    SimProgress,
    SimSummary,
    SimWarning,
)

__all__ = [
    "BaseSimAdapter",
    "SimProgress",
    "SimSummary",
    "SimWarning",
]
