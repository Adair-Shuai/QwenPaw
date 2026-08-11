# -*- coding: utf-8 -*-
"""Compatibility boundary for probabilistic and stochastic Providers."""

from ..computation.adapters.libraries import (
    PyMCAdapter as _PyMCAdapter,
    PymooAdapter as _PymooAdapter,
)


class PyMCAdapter(_PyMCAdapter):
    """PyMC is reproducible with a seed but not a deterministic kernel."""

    deterministic = False


class PymooAdapter(_PymooAdapter):
    """Pymoo is a stochastic optimizer and belongs to workflow/provider level."""

    deterministic = False


__all__ = ["PyMCAdapter", "PymooAdapter"]
