# -*- coding: utf-8 -*-
"""Port (protocol) for decline analysis engine adapters."""

from __future__ import annotations

from typing import Protocol

from .models import DeclineFit, DeclineFitRequest
from ..well_log.ports import DependencyStatus


class DeclineEngine(Protocol):
    """Stable interface for decline curve computation engines.

    Implementations (e.g. ScipyArpsAdapter) satisfy this protocol.
    """

    provider_id: str

    def dependency_status(self) -> DependencyStatus: ...

    def fit(self, request: DeclineFitRequest) -> list[DeclineFit]: ...

    def rates(self, fit: DeclineFit, times: list[float]) -> list[float]: ...

    def cumulative(self, fit: DeclineFit, start: float, end: float) -> float: ...
