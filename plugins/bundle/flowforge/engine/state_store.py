# -*- coding: utf-8 -*-
"""Durable workflow-state persistence (FlowForge port).

Ported from ``leagent.workflow.state_store``. Provides:

  * :class:`WorkflowRunSnapshot` — serialisable bundle for pause/resume.
  * :class:`InMemoryWorkflowStateStore` — non-durable store for tests.
  * :class:`JsonWorkflowStateStore` — JSON-file backed store (the FlowForge
    default, since plugins should not assume a SQL DB).
  * :class:`build_workflow_state_store` — factory.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Protocol
from uuid import UUID

from .types import WorkflowState, WorkflowStatus


@dataclass
class WorkflowRunSnapshot:
    """Serializable bundle for pause/resume."""

    state: WorkflowState
    output_cache: dict[str, Any]
    blocked_nodes: list[str]
    prompt_id: str | None = None
    execution_id: UUID | None = None

    def to_payload(self) -> str:
        return json.dumps(
            {
                "state": self.state.model_dump(mode="json"),
                "output_cache": self.output_cache,
                "blocked_nodes": self.blocked_nodes,
                "prompt_id": self.prompt_id,
                "execution_id": str(self.execution_id) if self.execution_id else None,
            },
            ensure_ascii=False,
            default=str,
        )

    @classmethod
    def from_payload(cls, raw: str) -> "WorkflowRunSnapshot":
        data = json.loads(raw)
        state = WorkflowState.model_validate(data["state"])
        execution_id = data.get("execution_id")
        return cls(
            state=state,
            output_cache=dict(data.get("output_cache") or {}),
            blocked_nodes=list(data.get("blocked_nodes") or []),
            prompt_id=data.get("prompt_id"),
            execution_id=UUID(execution_id) if execution_id else None,
        )


class WorkflowStateStore(Protocol):
    """Protocol every state store implements."""

    async def save(self, snapshot: WorkflowRunSnapshot) -> None: ...
    async def load(self, state_id: UUID) -> WorkflowRunSnapshot | None: ...
    async def load_by_prompt_id(self, prompt_id: str) -> WorkflowRunSnapshot | None: ...
    async def delete(self, state_id: UUID) -> None: ...


class InMemoryWorkflowStateStore:
    """Non-durable store for tests and single-process deployments."""

    def __init__(self) -> None:
        self._by_state: dict[str, WorkflowRunSnapshot] = {}
        self._by_prompt: dict[str, str] = {}

    async def save(self, snapshot: WorkflowRunSnapshot) -> None:
        key = str(snapshot.state.id)
        self._by_state[key] = snapshot
        if snapshot.prompt_id:
            self._by_prompt[snapshot.prompt_id] = key

    async def load(self, state_id: UUID) -> WorkflowRunSnapshot | None:
        return self._by_state.get(str(state_id))

    async def load_by_prompt_id(self, prompt_id: str) -> WorkflowRunSnapshot | None:
        key = self._by_prompt.get(prompt_id)
        if key is None:
            return None
        return self._by_state.get(key)

    async def delete(self, state_id: UUID) -> None:
        snap = self._by_state.pop(str(state_id), None)
        if snap and snap.prompt_id:
            self._by_prompt.pop(snap.prompt_id, None)


class JsonWorkflowStateStore:
    """JSON-file backed store at ``<root>/flowforge/runs/<state_id>.json``.

    The default durable store for FlowForge — keeps plugin self-contained
    without requiring a SQL database.
    """

    def __init__(self, root: Path | str) -> None:
        self._root = Path(root)
        (self._root / "runs").mkdir(parents=True, exist_ok=True)
        self._index: dict[str, str] = {}  # prompt_id -> state_id
        self._load_index()

    def _index_path(self) -> Path:
        return self._root / "runs" / "_prompt_index.json"

    def _state_path(self, state_id: str) -> Path:
        return self._root / "runs" / f"{state_id}.json"

    def _load_index(self) -> None:
        path = self._index_path()
        if path.exists():
            try:
                self._index = json.loads(path.read_text(encoding="utf-8"))
            except Exception:
                self._index = {}

    def _save_index(self) -> None:
        try:
            self._index_path().write_text(
                json.dumps(self._index, ensure_ascii=False),
                encoding="utf-8",
            )
        except OSError:
            pass

    async def save(self, snapshot: WorkflowRunSnapshot) -> None:
        key = str(snapshot.state.id)
        payload = snapshot.to_payload()
        path = self._state_path(key)
        path.write_text(payload, encoding="utf-8")
        if snapshot.prompt_id:
            self._index[snapshot.prompt_id] = key
            self._save_index()

    async def load(self, state_id: UUID) -> WorkflowRunSnapshot | None:
        path = self._state_path(str(state_id))
        if not path.exists():
            return None
        try:
            return WorkflowRunSnapshot.from_payload(
                path.read_text(encoding="utf-8"),
            )
        except Exception:
            return None

    async def load_by_prompt_id(self, prompt_id: str) -> WorkflowRunSnapshot | None:
        key = self._index.get(prompt_id)
        if key is None:
            return None
        return await self.load(UUID(key))

    async def delete(self, state_id: UUID) -> None:
        path = self._state_path(str(state_id))
        if path.exists():
            try:
                path.unlink()
            except OSError:
                pass


def build_workflow_state_store(
    root: Path | str | None,
) -> WorkflowStateStore:
    """Factory: prefer JSON-file store, fall back to in-memory."""
    if root is not None:
        try:
            return JsonWorkflowStateStore(root)
        except Exception:
            pass
    return InMemoryWorkflowStateStore()


__all__ = [
    "InMemoryWorkflowStateStore",
    "JsonWorkflowStateStore",
    "WorkflowRunSnapshot",
    "WorkflowStateStore",
    "build_workflow_state_store",
]
