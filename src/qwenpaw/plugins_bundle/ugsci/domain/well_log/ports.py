# -*- coding: utf-8 -*-
"""Port (protocol) for well log engine adapters."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from ..common.result import ArtifactRef
from .models import WellLogDataset


@dataclass
class WellLogReadRequest:
    """Request for reading a LAS file."""

    path: str
    encoding: str = ""


@dataclass
class WellLogExportRequest:
    """Request for exporting a LAS file."""

    input_path: str
    output_path: str
    encoding: str = "utf-8"


@dataclass
class DependencyStatus:
    """Dependency probe result for an engine adapter."""

    available: bool
    reason: str = ""


class WellLogEngine(Protocol):
    """Stable interface for well log computation engines.

    Implementations (e.g. LasioAdapter) satisfy this protocol.  The
    service layer depends on this protocol, not on any concrete adapter.
    """

    provider_id: str

    def dependency_status(self) -> DependencyStatus: ...

    def read(self, request: WellLogReadRequest) -> WellLogDataset: ...

    def export(self, request: WellLogExportRequest) -> ArtifactRef: ...
