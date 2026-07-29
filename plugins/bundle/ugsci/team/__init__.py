# -*- coding: utf-8 -*-
"""UGSci Expert Team workflow — OMP-backed multi-agent orchestration.

This package reimplements the UGSci expert-team feature on top of
the OMP workflow infrastructure (LoopGate state machine, structured
handoffs, fork isolation, role-based tool scoping).

Public API:
    UGSciTeamMode  — AgentMode for ``/ugsci-team`` slash command.
"""

from .mode import UGSciTeamMode

__all__ = ["UGSciTeamMode"]
