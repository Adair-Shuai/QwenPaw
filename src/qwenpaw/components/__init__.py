# -*- coding: utf-8 -*-
"""Standalone component update primitives.

The package is intentionally opt-in. Existing startup, plugin loading, and
Tauri core updates do not import it automatically.
"""

from .update import (
    ComponentUpdateError,
    ComponentUpdatePlan,
    ComponentUpdater,
    detect_target,
)
from .client import ComponentClient

__all__ = [
    "ComponentUpdateError",
    "ComponentUpdatePlan",
    "ComponentUpdater",
    "detect_target",
    "ComponentClient",
]
