# -*- coding: utf-8 -*-
"""Process-local callbacks for chat session deletion.

Plugins (for example GenUI) register here so ChatManager can drop
per-session state without importing plugin modules.
"""

from __future__ import annotations

import logging
import threading
from collections.abc import Callable

logger = logging.getLogger(__name__)

_lock = threading.Lock()
_listeners: list[Callable[[str], None]] = []


def register_session_deleted(
    callback: Callable[[str], None],
) -> Callable[[], None]:
    """Subscribe to session deletion. Returns an unregister function."""
    with _lock:
        _listeners.append(callback)

    def unregister() -> None:
        with _lock:
            try:
                _listeners.remove(callback)
            except ValueError:
                pass

    return unregister


def notify_session_deleted(session_id: str) -> None:
    """Notify listeners that ``session_id`` was deleted."""
    if not session_id:
        return
    with _lock:
        listeners = list(_listeners)
    for callback in listeners:
        try:
            callback(session_id)
        except Exception:
            logger.warning(
                "session_deleted listener failed for session=%s",
                session_id[:30],
                exc_info=True,
            )


def reset_session_deleted_listeners() -> None:
    """Drop all listeners. Intended for tests."""
    with _lock:
        _listeners.clear()
