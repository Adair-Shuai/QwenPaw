# -*- coding: utf-8 -*-
"""Backward-compatibility shim — re-exports from ``engine.tools.result_reader``."""
from __future__ import annotations

from .engine.tools.result_reader import read_simulation_results

__all__ = ["read_simulation_results"]
