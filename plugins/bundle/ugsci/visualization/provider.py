# -*- coding: utf-8 -*-
"""UGSci-owned visualization backend facade."""

from __future__ import annotations

from pathlib import Path
from typing import Any


VISUALIZATION_DIR = Path(__file__).resolve().parent


def build_visualization_router():
    """Build a fresh visualization API router."""
    from .backend.api import build_router

    return build_router(VISUALIZATION_DIR)


def get_visualization_tool_bindings() -> dict[str, Any]:
    """Return visualization tool callables for UGSci registration."""
    from .backend.tools import configure_tools, get_tool_bindings

    configure_tools(VISUALIZATION_DIR)
    return {name: func for name, func, *_ in get_tool_bindings()}

