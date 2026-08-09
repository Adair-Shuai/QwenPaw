"""Persistent, plugin-owned GenUI feature settings."""

from __future__ import annotations

import json
import threading
from pathlib import Path
from typing import Any

from qwenpaw.constant import WORKING_DIR

_PATH = Path(WORKING_DIR) / "ugsci" / "genui.json"
_LOCK = threading.RLock()
_DEFAULTS: dict[str, Any] = {"enabled": True}


def load_settings() -> dict[str, Any]:
    """Load settings, failing open to the documented default."""
    with _LOCK:
        try:
            value = json.loads(_PATH.read_text(encoding="utf-8"))
        except (OSError, ValueError, TypeError):
            value = {}
        return {**_DEFAULTS, **(value if isinstance(value, dict) else {})}


def save_settings(*, enabled: bool) -> dict[str, Any]:
    """Atomically persist the global GenUI switch."""
    value = {"enabled": bool(enabled)}
    with _LOCK:
        _PATH.parent.mkdir(parents=True, exist_ok=True)
        temporary = _PATH.with_suffix(".tmp")
        temporary.write_text(
            json.dumps(value, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        temporary.replace(_PATH)
    return value


__all__ = ["load_settings", "save_settings"]
