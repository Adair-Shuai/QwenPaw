# -*- coding: utf-8 -*-
"""Auditable, deterministic petroleum-engineering calculations.

This package owns pure calculations and their contracts.  External engines
such as NeqSim remain Providers outside this package.
"""

from .providers import default_registry

__all__ = ["default_registry"]
