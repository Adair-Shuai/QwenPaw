# -*- coding: utf-8 -*-
"""Simulation adapter registry.

Each adapter knows how to:
- Build the command line for its simulator
- Parse progress / convergence from log files
- Parse summary vectors from result files
- Identify warnings and errors in log output

Adapters are selected by ``get_adapter(simulator)`` where *simulator*
is one of: ``"eclipse"``, ``"cmg_imex"``, ``"cmg_stars"``,
``"cmg_gem"``, ``"comsol"``, ``"intersect"``, ``"tnavigator"``.
"""
from __future__ import annotations

from typing import Dict, Type

from .base import (
    BaseSimAdapter,
    SimCapabilities,
    SimFieldTable,
    SimProgress,
    SimSummary,
    SimWarning,
)
from .eclipse_adapter import EclipseAdapter
from .cmg_adapter import CMGAdapter
from .comsol_adapter import COMSOLAdapter, inspect_mph_metadata
from .intersect_adapter import IntersectAdapter
from .tnavigator_adapter import TNavigatorAdapter

_ADAPTERS: Dict[str, BaseSimAdapter] = {}


def _init_adapters() -> None:
    """Populate the adapter registry."""
    instances = [
        EclipseAdapter(),
        CMGAdapter("imex"),
        CMGAdapter("stars"),
        CMGAdapter("gem"),
        COMSOLAdapter(),
        IntersectAdapter(),
        TNavigatorAdapter(),
    ]
    for inst in instances:
        _ADAPTERS[inst.simulator_id] = inst


_init_adapters()


def get_adapter(simulator: str) -> BaseSimAdapter:
    """Return the adapter for *simulator*.

    Raises ``KeyError`` if no adapter is registered for that name.
    """
    key = simulator.lower().strip()
    if key not in _ADAPTERS:
        raise KeyError(
            f"No adapter registered for simulator '{simulator}'. "
            f"Available: {', '.join(sorted(_ADAPTERS))}",
        )
    return _ADAPTERS[key]


def list_supported_simulators() -> list[str]:
    """Return a sorted list of supported simulator identifiers."""
    return sorted(_ADAPTERS.keys())


__all__ = [
    "BaseSimAdapter",
    "SimCapabilities",
    "SimFieldTable",
    "SimProgress",
    "SimSummary",
    "SimWarning",
    "inspect_mph_metadata",
    "get_adapter",
    "list_supported_simulators",
]
