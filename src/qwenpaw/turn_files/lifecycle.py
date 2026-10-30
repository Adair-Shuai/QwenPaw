# -*- coding: utf-8 -*-
"""Shared, cancellation-safe file capture for native and external runtimes."""

from __future__ import annotations

import asyncio
import logging
from contextvars import ContextVar, Token
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)
_current: ContextVar[TurnFileTracker | None] = ContextVar(
    "turn_file_tracker",
    default=None,
)
_pending: set[asyncio.Task] = set()


def _retain(task: asyncio.Task) -> asyncio.Task:
    _pending.add(task)
    task.add_done_callback(_pending.discard)
    return task


class TurnFileTracker:
    """Own one attempt, independent of checkpoints and the user's Git index."""

    def __init__(self, store: Any, capture: Any) -> None:
        self.store = store
        self.capture = capture
        self._token: Token | None = _current.set(self)
        self._finish_task: asyncio.Task | None = None

    async def finish(self, status: str) -> None:
        if self._token is not None:
            try:
                _current.reset(self._token)
            except ValueError:
                # Generators may be closed by a different task.
                if _current.get() is self:
                    _current.set(None)
            self._token = None
        if self._finish_task is None:

            async def persist() -> None:
                try:
                    await asyncio.to_thread(
                        self.store.finish,
                        self.capture,
                        status=status,
                    )
                except Exception:
                    logger.warning(
                        "Could not finish turn file capture",
                        exc_info=True,
                    )

            self._finish_task = _retain(asyncio.create_task(persist()))
        current = asyncio.current_task()
        if current is not None and current.cancelling():
            # The retained host write continues without holding plugin cleanup.
            return
        try:
            await asyncio.shield(self._finish_task)
        except asyncio.CancelledError:
            # The owned task continues even if Stop is pressed repeatedly.
            pass


async def begin_turn_files(
    *,
    workspace_dir: Path | None,
    request: Any,
    agent_id: str,
    response_id: str,
    project_dirs: list[Path],
) -> TurnFileTracker | None:
    if workspace_dir is None:
        return None
    request_context = getattr(request, "request_context", None) or {}
    ephemeral = request_context.get("qwenpaw.ephemeral")
    if (
        request_context.get("_spawn_subagent")
        or ephemeral is True
        or (
            isinstance(ephemeral, str)
            and ephemeral.lower() in {"1", "true", "yes"}
        )
    ):
        return None

    def start():
        from .store import get_store

        inputs = getattr(request, "input", None) or []
        metadata = getattr(inputs[0], "metadata", None) if inputs else None
        client_id = (metadata or {}).get("qwenpaw_client_message_id", "")
        directory = Path(workspace_dir)
        # Do not resolve project symlinks away: the scanner must reject them.
        roots = [
            (
                (
                    "workspace"
                    if path.absolute() == directory.absolute()
                    else f"project:{path.absolute()}"
                ),
                path,
            )
            for path in map(Path, project_dirs)
        ]
        if not roots:
            roots = [("workspace", directory)]
        if not any(
            path.absolute() == directory.absolute() for _, path in roots
        ):
            roots.append(("output", directory / "output"))
        store = get_store(directory)
        capture = store.start(
            session_id=str(getattr(request, "session_id", "") or "default"),
            user_id=str(
                getattr(request, "user_id", "")
                or getattr(request, "session_id", "")
                or "default",
            ),
            channel=str(getattr(request, "channel", "") or ""),
            agent_id=agent_id,
            client_message_id=client_id,
            response_id=response_id,
            roots=roots,
        )
        return store, capture

    task = _retain(asyncio.create_task(asyncio.to_thread(start)))
    try:
        store, capture = await asyncio.shield(task)
        return TurnFileTracker(store, capture)
    except asyncio.CancelledError:

        async def finish_aborted_start() -> None:
            try:
                store, capture = await task
                await asyncio.to_thread(
                    store.finish,
                    capture,
                    status="canceled",
                )
            except Exception:
                logger.warning(
                    "Could not close canceled file baseline",
                    exc_info=True,
                )

        _retain(asyncio.create_task(finish_aborted_start()))
        raise
    except Exception:
        logger.warning("Could not begin turn file capture", exc_info=True)
        return None


async def record_delivered_file(path: str | Path) -> None:
    """Called only after send_file's content checks succeeded."""
    tracker = _current.get()
    if tracker is None or tracker._finish_task is not None:
        return
    try:
        await asyncio.to_thread(
            tracker.store.record_delivery,
            tracker.capture,
            Path(path),
        )
    except Exception:
        logger.warning("Could not archive delivered file", exc_info=True)


def terminal_status(error: BaseException | None) -> str:
    if isinstance(
        error,
        (asyncio.CancelledError, GeneratorExit, KeyboardInterrupt),
    ):
        return "canceled"
    return "failed" if error is not None else "completed"
