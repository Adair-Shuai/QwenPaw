"""Persistent, plugin-owned GenUI feature settings."""

from __future__ import annotations

import json
import threading
from pathlib import Path
from typing import Any

from qwenpaw.constant import WORKING_DIR

_PATH = Path(WORKING_DIR) / "ugsci" / "genui.json"
_LOCK = threading.RLock()
_DEFAULTS: dict[str, Any] = {
    "enabled": True,
    "freeform_enabled": False,  # freeform mode is off by default (§12)
    "freeform_max_steps": 25,
    "freeform_simplify": False,
}


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
    with _LOCK:
        value = load_settings()
        value["enabled"] = bool(enabled)
        _PATH.parent.mkdir(parents=True, exist_ok=True)
        temporary = _PATH.with_suffix(".tmp")
        temporary.write_text(
            json.dumps(value, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        temporary.replace(_PATH)
    return value


def save_freeform_settings(
    *,
    freeform_enabled: bool | None = None,
    freeform_max_steps: int | None = None,
    freeform_simplify: bool | None = None,
) -> dict[str, Any]:
    """Atomically persist freeform-mode settings (§12).

    Only the provided keys are updated; the rest are preserved.
    """
    if freeform_max_steps is not None and not 1 <= int(freeform_max_steps) <= 100:
        raise ValueError("freeform_max_steps must be between 1 and 100")
    with _LOCK:
        current = load_settings()
        current.update({
            k: v for k, v in {
                "freeform_enabled": freeform_enabled,
                "freeform_max_steps": freeform_max_steps,
                "freeform_simplify": freeform_simplify,
            }.items() if v is not None
        })
        _PATH.parent.mkdir(parents=True, exist_ok=True)
        temporary = _PATH.with_suffix(".tmp")
        temporary.write_text(
            json.dumps(current, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        temporary.replace(_PATH)
        return current


__all__ = ["load_settings", "save_settings", "save_freeform_settings"]
