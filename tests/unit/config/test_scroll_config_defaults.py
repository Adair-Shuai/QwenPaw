# -*- coding: utf-8 -*-
"""Safe defaults for durable conversation history."""

from qwenpaw.config.config import ScrollContextConfig, ToolResultPruningConfig


def test_scroll_history_is_kept_forever_by_default() -> None:
    assert ScrollContextConfig().history_retention_days == 0


def test_complete_tool_results_are_kept_forever_by_default() -> None:
    assert ToolResultPruningConfig().offload_retention_days == 0
