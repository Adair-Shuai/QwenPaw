# -*- coding: utf-8 -*-
"""Shared preservation policy for managed plugin/component updates."""

from __future__ import annotations

# These top-level directories may contain machine-local or user-generated
# state.  A full replacement must stage the new bundle first, then overlay
# only files missing from the new bundle so shipped code/config remains
# authoritative while user data survives fallback-to-full updates.
DEFAULT_PRESERVE_PATHS = (
    "engines",
    "data",
    "state",
    "workspace",
    "models",
    "user-data",
)

ALLOWED_PRESERVE_PATHS = frozenset(DEFAULT_PRESERVE_PATHS)
