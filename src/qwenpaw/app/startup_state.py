# -*- coding: utf-8 -*-
"""Thread-safe, public-safe desktop startup progress state."""

from __future__ import annotations

import json
import threading
import time
from pathlib import Path
from typing import Any

from ..__version__ import __version__
from ..constant import WORKING_DIR


_MARKER_PATH = Path(WORKING_DIR) / "cache" / "startup-complete.json"


class StartupState:
    """Keep the latest startup checkpoint for the bootstrap window."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self.reset()

    def _is_first_run(self) -> bool:
        """Return whether this version has completed preparation before."""
        try:
            marker = json.loads(_MARKER_PATH.read_text(encoding="utf-8"))
            return marker.get("version") != __version__
        except (OSError, ValueError, TypeError):
            return True

    def reset(self) -> None:
        """Reset progress for a new process lifespan."""
        with getattr(self, "_lock", threading.Lock()):
            self._started_at = time.time()
            self._payload: dict[str, Any] = {
                "ready": False,
                "stage": "backend",
                "message": "正在启动本地服务…",
                "progress": 3,
                "current": None,
                "total": None,
                "detail": None,
                "first_run": self._is_first_run(),
                "version": __version__,
                "error": None,
            }

    def update(
        self,
        stage: str,
        message: str,
        progress: int,
        *,
        current: int | None = None,
        total: int | None = None,
        detail: str | None = None,
    ) -> None:
        """Publish a monotonic user-facing preparation checkpoint."""
        with self._lock:
            is_ready = bool(self._payload.get("ready"))
            self._payload.update(
                {
                    "stage": stage,
                    "message": message,
                    # Core readiness is a terminal gate for the UI. Keep the
                    # public progress at 100 while optional background work
                    # continues, instead of regressing from 100 to 60.
                    "progress": (
                        100 if is_ready else max(0, min(99, int(progress)))
                    ),
                    "current": current,
                    "total": total,
                    "detail": detail,
                    "error": None,
                },
            )

    def mark_ready(self) -> None:
        """Publish core readiness and persist the version marker atomically."""
        with self._lock:
            self._payload.update(
                {
                    "ready": True,
                    "stage": "ready",
                    "message": "准备完成，正在进入工作台…",
                    "progress": 100,
                    "current": None,
                    "total": None,
                    "detail": None,
                    "error": None,
                },
            )
        try:
            _MARKER_PATH.parent.mkdir(parents=True, exist_ok=True)
            temporary = _MARKER_PATH.with_suffix(".tmp")
            temporary.write_text(
                json.dumps(
                    {"version": __version__, "completed_at": time.time()},
                    ensure_ascii=False,
                ),
                encoding="utf-8",
            )
            temporary.replace(_MARKER_PATH)
        except OSError:
            # Marker only controls first-run wording; startup still succeeds.
            pass

    def mark_core_ready(self) -> None:
        """Publish that the core app is interactive while warm-up continues."""
        with self._lock:
            self._payload.update(
                {
                    "ready": True,
                    "stage": "ready",
                    "message": "核心服务已就绪，正在后台准备扩展…",
                    "progress": 100,
                    "current": None,
                    "total": None,
                    "detail": None,
                    "error": None,
                },
            )

    def mark_error(self, message: str) -> None:
        """Publish a terminal startup error."""
        with self._lock:
            self._payload.update(
                {
                    "ready": False,
                    "stage": "error",
                    "message": "启动准备未完成",
                    "error": message,
                },
            )

    def snapshot(self) -> dict[str, Any]:
        """Return a copy safe for the public startup endpoint."""
        with self._lock:
            payload = dict(self._payload)
            payload["elapsed_seconds"] = round(
                max(0.0, time.time() - self._started_at),
                1,
            )
            return payload


startup_state = StartupState()
