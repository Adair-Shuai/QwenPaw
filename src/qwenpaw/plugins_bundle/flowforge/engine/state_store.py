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
import logging
import os
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Protocol
from uuid import UUID

from ..file_io import atomic_replace
from .types import WorkflowState


logger = logging.getLogger(__name__)


class CheckpointStorageError(RuntimeError):
    """A durable checkpoint operation failed with its original IO context."""

    def __init__(self, operation: str, path: Path, error: Exception) -> None:
        super().__init__(
            f"checkpoint {operation} failed at {path} "
            f"({type(error).__name__}, "
            f"errno={getattr(error, 'errno', None)}, "
            f"winerror={getattr(error, 'winerror', None)}): {error}",
        )


@dataclass
class WorkflowRunSnapshot:
    """Serializable bundle for pause/resume."""

    state: WorkflowState
    output_cache: dict[str, Any]
    dynamic_prompt: dict[str, dict[str, Any]]
    blocked_nodes: list[str]
    prompt_id: str | None = None
    execution_id: UUID | None = None

    def to_payload(self) -> str:
        return json.dumps(
            {
                "state": self.state.model_dump(mode="json"),
                "output_cache": self.output_cache,
                "dynamic_prompt": self.dynamic_prompt,
                "blocked_nodes": self.blocked_nodes,
                "prompt_id": self.prompt_id,
                "execution_id": str(self.execution_id)
                if self.execution_id
                else None,
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
            dynamic_prompt=dict(data.get("dynamic_prompt") or {}),
            blocked_nodes=list(data.get("blocked_nodes") or []),
            prompt_id=data.get("prompt_id"),
            execution_id=UUID(execution_id) if execution_id else None,
        )


class WorkflowStateStore(Protocol):
    """Protocol every state store implements."""

    async def save(self, snapshot: WorkflowRunSnapshot) -> None:
        ...

    async def load(self, state_id: UUID) -> WorkflowRunSnapshot | None:
        ...

    async def load_by_prompt_id(
        self,
        prompt_id: str,
    ) -> WorkflowRunSnapshot | None:
        ...

    async def delete(self, state_id: UUID) -> None:
        ...


class InMemoryWorkflowStateStore:
    """Non-durable store for tests and single-process deployments."""

    def __init__(self) -> None:
        self._by_state: dict[str, WorkflowRunSnapshot] = {}
        self._by_prompt: dict[str, str] = {}

    async def save(self, snapshot: WorkflowRunSnapshot) -> None:
        key = str(snapshot.state.id)
        self._by_state[key] = WorkflowRunSnapshot.from_payload(
            snapshot.to_payload(),
        )
        if snapshot.prompt_id:
            self._by_prompt[snapshot.prompt_id] = key

    async def load(self, state_id: UUID) -> WorkflowRunSnapshot | None:
        snapshot = self._by_state.get(str(state_id))
        return (
            WorkflowRunSnapshot.from_payload(snapshot.to_payload())
            if snapshot
            else None
        )

    async def load_by_prompt_id(
        self,
        prompt_id: str,
    ) -> WorkflowRunSnapshot | None:
        key = self._by_prompt.get(prompt_id)
        if key is None:
            return None
        return await self.load(UUID(key))

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
        try:
            index = json.loads(path.read_text(encoding="utf-8"))
            if not isinstance(index, dict) or any(
                not isinstance(key, str) or not isinstance(value, str)
                for key, value in index.items()
            ):
                raise ValueError("checkpoint index must map run IDs to UUIDs")
            for value in index.values():
                UUID(value)
            self._index.update(index)
        except FileNotFoundError:
            pass
        except (OSError, ValueError):
            logger.warning(
                "workflow_checkpoint_index_unavailable path=%s",
                path,
                exc_info=True,
            )

    @staticmethod
    def _atomic_write(path: Path, content: str) -> None:
        temporary = None
        try:
            descriptor, temporary = tempfile.mkstemp(
                prefix=f".{path.name}.",
                dir=path.parent,
            )
            with os.fdopen(descriptor, "w", encoding="utf-8") as stream:
                stream.write(content)
                stream.flush()
                os.fsync(stream.fileno())
            atomic_replace(temporary, path)
        except Exception as exc:
            logger.exception("workflow_checkpoint_write_failed path=%s", path)
            raise CheckpointStorageError("write", path, exc) from exc
        finally:
            if temporary is not None:
                try:
                    Path(temporary).unlink(missing_ok=True)
                except OSError:
                    logger.warning(
                        "workflow_checkpoint_temp_cleanup_failed path=%s",
                        temporary,
                        exc_info=True,
                    )

    def _save_index(self, index: dict[str, str]) -> None:
        self._atomic_write(
            self._index_path(),
            json.dumps(index, ensure_ascii=False),
        )

    async def save(self, snapshot: WorkflowRunSnapshot) -> None:
        key = str(snapshot.state.id)
        path = self._state_path(key)
        try:
            payload = snapshot.to_payload()
        except Exception as exc:
            logger.exception(
                "workflow_checkpoint_serialize_failed state_id=%s path=%s",
                key,
                path,
            )
            raise CheckpointStorageError("serialize", path, exc) from exc
        self._atomic_write(path, payload)
        if snapshot.prompt_id:
            self._load_index()
            index = {**self._index, snapshot.prompt_id: key}
            self._save_index(index)
            self._index = index

    async def load(self, state_id: UUID) -> WorkflowRunSnapshot | None:
        path = self._state_path(str(state_id))
        try:
            snapshot = WorkflowRunSnapshot.from_payload(
                path.read_text(encoding="utf-8"),
            )
            if str(snapshot.state.id) != str(state_id):
                raise ValueError("checkpoint state ID differs from filename")
            return snapshot
        except FileNotFoundError:
            return None
        except Exception as exc:
            logger.exception("workflow_checkpoint_read_failed path=%s", path)
            raise CheckpointStorageError("read", path, exc) from exc

    async def load_by_prompt_id(
        self,
        prompt_id: str,
    ) -> WorkflowRunSnapshot | None:
        self._load_index()
        key = self._index.get(prompt_id)
        if key is not None:
            snapshot = await self.load(UUID(key))
            if snapshot is not None:
                return snapshot
        # The index is a locator. Recover a missing entry from the durable
        # snapshot rather than losing a completed or paused execution.
        for path in (self._root / "runs").glob("*.json"):
            try:
                state_id = UUID(path.stem)
            except ValueError:
                continue
            try:
                snapshot = await self.load(state_id)
            except CheckpointStorageError:
                continue
            if snapshot is not None and snapshot.prompt_id:
                self._index[snapshot.prompt_id] = str(state_id)
                if snapshot.prompt_id == prompt_id:
                    return snapshot
        return None

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
    """Use configured durable storage or explicit memory storage."""
    if root is not None:
        try:
            return JsonWorkflowStateStore(root)
        except Exception as exc:
            logger.exception(
                "workflow_checkpoint_initialize_failed root=%s",
                root,
            )
            raise CheckpointStorageError(
                "initialize",
                Path(root),
                exc,
            ) from exc
    return InMemoryWorkflowStateStore()


__all__ = [
    "CheckpointStorageError",
    "InMemoryWorkflowStateStore",
    "JsonWorkflowStateStore",
    "WorkflowRunSnapshot",
    "WorkflowStateStore",
    "build_workflow_state_store",
]
