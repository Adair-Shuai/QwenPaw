# -*- coding: utf-8 -*-
"""Explicitly configured OPM Flow, using Eclipse-compatible result formats."""
from __future__ import annotations

from pathlib import Path

from .base import SimCapabilities
from .eclipse_adapter import EclipseAdapter


class OPMFlowAdapter(EclipseAdapter):
    simulator_id = "opm_flow"
    display_name = "OPM Flow"
    capabilities = SimCapabilities(
        supports_progress=True,
        supports_result_reading=True,
        supports_terminal_artifacts=False,
        supports_checkpoint_resume=False,
        supports_auto_tune=False,
    )

    def build_command(
        self,
        executable: str,
        deck_file: str,
        output_file: str = "",
    ) -> list[str]:
        deck = Path(deck_file).expanduser().resolve()
        return [executable, str(deck), f"--output-dir={deck.parent}"]

    def tuning_rules(self):
        # Eclipse's NSTACK/LITMAX tuning does not define Flow solver controls.
        return {}
