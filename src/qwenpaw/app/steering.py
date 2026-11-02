# -*- coding: utf-8 -*-
"""Durable, text-only input to an existing console execution.

The controller belongs to a particular tracked run, never a chat's next run.
Only the executing QwenPaw agent may consume input, at a reasoning boundary.
SQLite receipts survive disconnects/restarts; session metadata reconciles the
small crash window between saving context and acknowledging consumption.
"""

from __future__ import annotations

import asyncio
from contextvars import ContextVar
from datetime import datetime, timezone
from pathlib import Path
import sqlite3
from typing import Any
from uuid import uuid4

from ..utils.io_utils import run_async_to_completion, run_sync_io

CURRENT_STEERING: ContextVar[Any] = ContextVar(
    "qwenpaw_steering",
    default=None,
)
STEERING_METADATA = "qwenpaw_steering"


class SteeringConflict(ValueError):
    """The target run or idempotency key no longer matches."""


class SteeringStore:
    """Small transactional receipt ledger, isolated by agent and chat."""

    def __init__(self, path: Path, agent_id: str) -> None:
        self.path = path
        self.agent_id = agent_id

    def _connect(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(self.path, timeout=10)
        conn.row_factory = sqlite3.Row
        conn.execute(
            "CREATE TABLE IF NOT EXISTS steering ("
            "agent_id TEXT NOT NULL, chat_id TEXT NOT NULL, "
            "request_id TEXT NOT NULL, run_id TEXT NOT NULL, "
            "text TEXT NOT NULL, status TEXT NOT NULL, error TEXT, "
            "created_at TEXT NOT NULL, "
            "PRIMARY KEY(agent_id, chat_id, request_id))",
        )
        return conn

    @staticmethod
    def _receipt(row):
        if row is None:
            return None
        return {
            key: row[key]
            for key in ("request_id", "run_id", "text", "status", "error")
        }

    def get(self, chat_id: str, request_id: str):
        conn = self._connect()
        try:
            row = conn.execute(
                "SELECT * FROM steering WHERE agent_id=? "
                "AND chat_id=? AND request_id=?",
                (self.agent_id, chat_id, request_id),
            ).fetchone()
            return self._receipt(row)
        finally:
            conn.close()

    def list(self, chat_id: str, *, pending_run: str | None = None):
        conn = self._connect()
        try:
            query = "SELECT * FROM steering WHERE agent_id=? AND chat_id=?"
            params: tuple = (self.agent_id, chat_id)
            if pending_run is not None:
                query += " AND run_id=? AND status='pending'"
                params += (pending_run,)
            # Unresolved entries must never fall off a bounded list.
            query += " ORDER BY (status='pending') DESC, rowid DESC LIMIT 100"
            rows = conn.execute(query, params).fetchall()
            return [self._receipt(row) for row in reversed(rows)]
        finally:
            conn.close()

    def accept(self, chat_id: str, run_id: str, request_id: str, text: str):
        conn = self._connect()
        try:
            with conn:
                conn.execute("BEGIN IMMEDIATE")
                existing = conn.execute(
                    "SELECT * FROM steering WHERE agent_id=? AND chat_id=? "
                    "AND request_id=?",
                    (self.agent_id, chat_id, request_id),
                ).fetchone()
                if existing is not None:
                    if (
                        existing["run_id"] != run_id
                        or existing["text"] != text
                    ):
                        raise SteeringConflict(
                            "Steering request ID was reused",
                        )
                    return self._receipt(existing)
                count = conn.execute(
                    "SELECT count(*) FROM steering WHERE agent_id=? "
                    "AND chat_id=? AND status='pending'",
                    (self.agent_id, chat_id),
                ).fetchone()[0]
                if count >= 32:
                    raise SteeringConflict(
                        "Too many pending steering messages",
                    )
                conn.execute(
                    "INSERT INTO steering VALUES(?,?,?,?,?,?,?,?)",
                    (
                        self.agent_id,
                        chat_id,
                        request_id,
                        run_id,
                        text,
                        "pending",
                        None,
                        datetime.now(timezone.utc).isoformat(),
                    ),
                )
            return self.get(chat_id, request_id)
        finally:
            conn.close()

    def reconcile(
        self,
        chat_id: str,
        active_run: str | None,
        applied_ids: set[str],
        reason: str = "The target execution ended before receiving this input",
    ) -> None:
        conn = self._connect()
        try:
            with conn:
                for request_id in applied_ids:
                    conn.execute(
                        "UPDATE steering SET status='applied', error=NULL "
                        "WHERE agent_id=? AND chat_id=? AND request_id=? "
                        "AND status IN ('pending','returned')",
                        (self.agent_id, chat_id, request_id),
                    )
                conn.execute(
                    "UPDATE steering SET status='returned', error=? "
                    "WHERE agent_id=? AND chat_id=? AND status='pending' "
                    "AND (? IS NULL OR run_id<>?)",
                    (reason, self.agent_id, chat_id, active_run, active_run),
                )
        finally:
            conn.close()


def get_steering_store(workspace: Any) -> SteeringStore:
    """Use the tracker (which survives workspace reload) as the cache owner."""
    tracker = workspace.task_tracker
    stores = getattr(tracker, "_steering_stores", None)
    if stores is None:
        stores = (
            tracker._steering_stores
        ) = {}  # pylint: disable=protected-access
    path = Path(workspace.workspace_dir).resolve() / "steering.sqlite3"
    key = (str(path), str(workspace.agent_id))
    if key not in stores:
        stores[key] = SteeringStore(path, str(workspace.agent_id))
    return stores[key]


def applied_ids_from_state(state: dict) -> set[str]:
    """Recover only server-authored, durable user-input markers."""
    context = ((state.get("agent") or {}).get("state") or {}).get(
        "context",
        [],
    )
    result = set()
    for msg in context:
        marker = (msg.get("metadata") or {}).get(STEERING_METADATA)
        if msg.get("role") == "user" and isinstance(marker, dict):
            request_id = marker.get("request_id")
            if isinstance(request_id, str) and marker.get("run_id"):
                result.add(request_id)
    return result


class SteeringController:
    """Admission and consumption share a lock; closing seals the run."""

    def __init__(self, workspace: Any, chat: Any) -> None:
        self.workspace = workspace
        self.chat = chat
        self.run_id = uuid4().hex
        self.store = get_steering_store(workspace)
        self.lock = asyncio.Lock()
        self.accepting = False
        self.closed = False
        self.agent = None
        self.ctx = None
        self._receipts_closed = False

    def bind(self, ctx: Any) -> bool:
        request = ctx.request
        if ctx.workspace is not self.workspace or (
            self.ctx is not None and self.ctx is not ctx
        ):
            return False
        if (
            str(ctx.agent_id) != self.store.agent_id
            or str(ctx.session_id) != str(self.chat.session_id)
            or str(getattr(request, "user_id", "") or ctx.session_id)
            != str(self.chat.user_id)
            or str(getattr(request, "channel", "") or "")
            != str(self.chat.channel)
            or self.closed
        ):
            return False
        self.agent, self.ctx = ctx.agent, ctx
        self.agent._user_steering = self  # pylint: disable=protected-access
        self.accepting = True
        return True

    async def submit(self, expected_run_id: str, request_id: str, text: str):
        async with self.lock:
            existing = await run_sync_io(
                self.store.get,
                self.chat.id,
                request_id,
            )
            if existing is not None:
                if (
                    existing["run_id"] != expected_run_id
                    or existing["text"] != text
                ):
                    raise SteeringConflict("Steering request ID was reused")
                return existing
            if (
                expected_run_id != self.run_id
                or not self.accepting
                or self.closed
            ):
                raise SteeringConflict(
                    "The target execution is no longer steerable",
                )
            return await run_sync_io(
                self.store.accept,
                self.chat.id,
                self.run_id,
                request_id,
                text,
            )

    async def consume(self, *, final: bool = False) -> bool:
        """Persist real user messages before the next model call sees them."""
        from agentscope.message import Msg, TextBlock
        from ..runtime._state_utils import StateProxy

        async with self.lock:
            if self.closed or not self.accepting:
                return False
            pending = await run_sync_io(
                self.store.list,
                self.chat.id,
                pending_run=self.run_id,
            )
            # Never extend the configured iteration budget to service input.
            can_continue = (
                self.agent.state.cur_iter < self.agent.react_config.max_iters
            )
            if pending and can_continue:
                context = self.agent.state.context
                previous_context = list(context)
                for item in pending:
                    msg_id = "steering_" + item["request_id"]
                    if any(msg.id == msg_id for msg in context):
                        continue
                    context.append(
                        Msg(
                            id=msg_id,
                            name="user",
                            role="user",
                            content=[TextBlock(text=item["text"])],
                            metadata={
                                STEERING_METADATA: {
                                    "request_id": item["request_id"],
                                    "run_id": self.run_id,
                                },
                            },
                        ),
                    )
                proxy = StateProxy()
                proxy.data = self.agent.state_dict()
                proxy.data["mode_state"] = self.ctx.mode_state
                # Complete the checkpoint even if stop arrives during disk I/O.
                try:
                    await run_async_to_completion(
                        self.workspace.session.save_session_state(
                            session_id=self.chat.session_id,
                            user_id=self.chat.user_id,
                            channel=self.chat.channel,
                            agent=proxy,
                        ),
                    )
                except Exception:
                    # A failed checkpoint is not consumed input. Keep the
                    # durable pending receipt for explicit return/retry.
                    context[:] = previous_context
                    raise
                await run_sync_io(
                    self.store.reconcile,
                    self.chat.id,
                    self.run_id,
                    {item["request_id"] for item in pending},
                )
                return True
            if final:
                self.accepting = False
                self.closed = True
                await run_sync_io(
                    self.store.reconcile,
                    self.chat.id,
                    None,
                    set(),
                )
            return False

    async def close(self) -> None:
        async with self.lock:
            if self._receipts_closed:
                return
            self.accepting = False
            self.closed = True
            # Checkpoint may have completed just as cancellation arrived.
            state = await self.workspace.session.get_session_state_dict(
                self.chat.session_id,
                self.chat.user_id,
                self.chat.channel,
            )
            await run_sync_io(
                self.store.reconcile,
                self.chat.id,
                None,
                applied_ids_from_state(state or {}),
            )
            self._receipts_closed = True
