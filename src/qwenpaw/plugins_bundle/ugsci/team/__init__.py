# -*- coding: utf-8 -*-
"""UGSci Expert Team workflow — OMP-backed multi-agent orchestration.

This package reimplements the UGSci expert-team feature on top of
the OMP workflow infrastructure (LoopGate state machine, structured
handoffs, fork isolation, role-based tool scoping).

Public API:
    UGSciTeamMode  — AgentMode for ``/ugsci-team`` slash command.
"""

from .mode import UGSciTeamMode
from .presets import PRESET_UGSCI_TEAMS, resolve_team_members
from .api import build_team_router

__all__ = [
    "UGSciTeamMode",
    "PRESET_UGSCI_TEAMS",
    "build_team_router",
    "resolve_team_members",
]
