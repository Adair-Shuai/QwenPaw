# -*- coding: utf-8 -*-
"""FlowForge service layer — flow persistence + run management.

Sits between the REST router and the :class:`WorkflowExecutor`. Owns:
  * JSON-file flow persistence under ``~/.qwenpaw/flowforge/flows/``.
  * Live run registry (run_id → run handle) with async result futures.
  * Progress event collectors for SSE / WebSocket replay.
"""

from __future__ import annotations

import asyncio
import json
import logging
import threading
import time
from concurrent.futures import Future
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any
from uuid import UUID, uuid4

from .engine import (
    NodeRegistry,
    ProgressEvent,
    ProgressRegistry,
    WorkflowDocument,
    WorkflowExecutor,
    WorkflowResult,
    WorkflowState,
    WorkflowStatus,
    build_workflow_state_store,
    load,
    validate,
)

logger = logging.getLogger(__name__)

DEFAULT_FLOWS_DIR_NAME = "flows"


@dataclass
class RunHandle:
    """Live handle for an in-progress or completed workflow run."""

    run_id: str
    flow_id: str
    state_id: UUID
    progress: ProgressRegistry
    task: asyncio.Task | None = None
    future: Future | None = None  # concurrent.futures.Future from background loop
    result: WorkflowResult | None = None
    error: str | None = None
    started_at: float = field(default_factory=time.time)
    finished_at: float | None = None

    @property
    def status(self) -> WorkflowStatus:
        if self.result is not None:
            return self.result.status
        if self.error is not None:
            return WorkflowStatus.FAILED
        if self.future is not None and self.future.done():
            # Exception path handled by _on_done; if no result yet, treat as failed.
            return WorkflowStatus.FAILED
        if self.task is not None and self.task.done():
            return WorkflowStatus.FAILED
        return WorkflowStatus.RUNNING

    @property
    def is_done(self) -> bool:
        if self.result is not None or self.error is not None:
            return True
        if self.future is not None:
            return self.future.done()
        if self.task is not None:
            return self.task.done()
        return False

    def to_dict(self) -> dict[str, Any]:
        return {
            "run_id": self.run_id,
            "flow_id": self.flow_id,
            "state_id": str(self.state_id),
            "status": self.status.value,
            "started_at": self.started_at,
            "finished_at": self.finished_at,
            "error": self.error,
            "node_statuses": self.progress.node_statuses(),
            "outputs": self.result.outputs if self.result else {},
            "errors": self.result.errors if self.result else [],
            "duration_ms": self.result.duration_ms if self.result else 0,
        }


class WorkflowService:
    """Top-level service: flow CRUD + run lifecycle + progress routing.

    Runs workflows on a dedicated background event-loop thread so that
    run lifetime is decoupled from any single HTTP request (FastAPI's
    TestClient tears down its per-request loop, which would otherwise
    cancel any ``asyncio.ensure_future`` task).
    """

    def __init__(
        self,
        *,
        flows_dir: Path | str,
        executor: WorkflowExecutor | None = None,
    ) -> None:
        self._flows_dir = Path(flows_dir)
        self._flows_dir.mkdir(parents=True, exist_ok=True)
        self._executor = executor or WorkflowExecutor(
            state_store=build_workflow_state_store(self._flows_dir),
        )
        self._runs: dict[str, RunHandle] = {}
        # Background event loop so runs outlive any single HTTP request.
        self._loop = asyncio.new_event_loop()
        self._loop_thread = threading.Thread(
            target=self._loop.run_forever,
            name="flowforge-loop",
            daemon=True,
        )
        self._loop_thread.start()

    def __del__(self) -> None:  # pragma: no cover — best-effort cleanup
        try:
            self._loop.call_soon_threadsafe(self._loop.stop)
        except Exception:
            pass

    # ------------------------------------------------------------------
    # Properties for the router to introspect.
    # ------------------------------------------------------------------
    @property
    def executor(self) -> WorkflowExecutor:
        return self._executor

    @property
    def flows_dir(self) -> Path:
        return self._flows_dir

    # ------------------------------------------------------------------
    # Flow CRUD
    # ------------------------------------------------------------------
    def list_flows(self) -> list[dict[str, Any]]:
        out: list[dict[str, Any]] = []
        for path in sorted(self._flows_dir.glob("*.json")):
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
                out.append(
                    {
                        "id": data.get("id", path.stem),
                        "name": data.get("name", path.stem),
                        "description": data.get("description", ""),
                        "version": data.get("version", "1.0"),
                        "node_count": len(data.get("nodes", {})),
                        "updated_at": path.stat().st_mtime,
                    },
                )
            except Exception:
                logger.warning("skip malformed flow file %s", path)
        return out

    def get_flow(self, flow_id: str) -> dict[str, Any] | None:
        path = self._flow_path(flow_id)
        if not path.exists():
            return None
        return json.loads(path.read_text(encoding="utf-8"))

    def save_flow(self, flow_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        payload = dict(payload)
        payload["id"] = flow_id
        # Strip runtime-only fields (e.g. inline ``func`` callables) that
        # cannot survive JSON round-trip.
        nodes = payload.get("nodes") or {}
        for nid, node in list(nodes.items()):
            if isinstance(node, dict):
                for runtime_key in ("func",):
                    node.pop(runtime_key, None)
        # Validate it parses as a document (raises ValidationError on bad shape).
        doc = load(payload)
        # Round-trip through the model to normalise.
        normalised = doc.model_dump(mode="json")
        path = self._flow_path(flow_id)
        path.write_text(
            json.dumps(normalised, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        return normalised

    def delete_flow(self, flow_id: str) -> bool:
        path = self._flow_path(flow_id)
        if not path.exists():
            return False
        path.unlink()
        return True

    def validate_flow(self, payload: dict[str, Any]) -> dict[str, Any]:
        doc = load(payload)
        result = validate(doc, registry=self._executor.node_registry)
        return {
            "ok": result.ok,
            "errors": result.errors,
            "output_nodes": result.output_nodes,
        }

    # ------------------------------------------------------------------
    # Run lifecycle
    # ------------------------------------------------------------------
    def start_run(
        self,
        flow_id: str,
        inputs: dict[str, Any] | None = None,
        *,
        on_event: "callable[[ProgressEvent], None] | None" = None,  # type: ignore[name-defined]
    ) -> RunHandle:
        """Start an async run. Returns the run handle immediately.

        ``on_event`` is an optional sync callback invoked for every
        progress event (used by SSE / WebSocket endpoints).
        """
        flow_payload = self.get_flow(flow_id)
        if flow_payload is None:
            raise FileNotFoundError(f"flow '{flow_id}' not found")
        doc = load(flow_payload)
        run_id = str(uuid4())
        prompt_id = run_id  # 1:1 mapping for FlowForge
        progress = ProgressRegistry(prompt_id=prompt_id)
        if on_event is not None:
            progress.add_handler(on_event)
        # Attach a fresh progress handler to the executor for this run.
        executor = self._executor

        async def _run() -> WorkflowResult:
            try:
                result = await executor.execute_async(
                    doc,
                    inputs or {},
                    prompt_id=prompt_id,
                )
                return result
            except Exception as exc:
                logger.exception("run %s failed", run_id)
                raise exc

        # Schedule the coroutine on the background loop; the returned
        # concurrent.futures.Future lets us query / cancel it from any thread.
        future = asyncio.run_coroutine_threadsafe(_run(), self._loop)
        handle = RunHandle(
            run_id=run_id,
            flow_id=flow_id,
            state_id=UUID("00000000-0000-0000-0000-000000000000"),
            progress=progress,
            future=future,
        )
        self._runs[run_id] = handle

        def _on_done(fut: Future) -> None:
            handle.finished_at = time.time()
            try:
                handle.result = fut.result()
                handle.state_id = handle.result.state_id
            except Exception as exc:
                handle.error = str(exc)

        future.add_done_callback(_on_done)
        return handle

    def get_run(self, run_id: str) -> RunHandle | None:
        return self._runs.get(run_id)

    def list_runs(self) -> list[dict[str, Any]]:
        return [h.to_dict() for h in self._runs.values()]

    def cancel_run(self, run_id: str) -> bool:
        handle = self._runs.get(run_id)
        if handle is None:
            return False
        if handle.future is not None and not handle.future.done():
            # concurrent.futures.Future.cancel() is thread-safe.
            handle.future.cancel()
        return True

    def node_types(self) -> list[dict[str, Any]]:
        return self._executor.node_registry.all_types()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _flow_path(self, flow_id: str) -> Path:
        safe = "".join(
            c if c.isalnum() or c in "-_." else "_" for c in flow_id
        )
        return self._flows_dir / f"{safe}.json"


def default_flows_dir() -> Path:
    """Return the default flows directory under the QwenPaw working dir."""
    try:
        from qwenpaw.constant import WORKING_DIR

        root = Path(WORKING_DIR) / "flowforge"
    except Exception:
        # Tests / standalone: use a temp-ish dir under the user home.
        root = Path.home() / ".qwenpaw" / "flowforge"
    (root / DEFAULT_FLOWS_DIR_NAME).mkdir(parents=True, exist_ok=True)
    return root / DEFAULT_FLOWS_DIR_NAME


def build_service(
    *,
    flows_dir: Path | str | None = None,
    executor: WorkflowExecutor | None = None,
) -> WorkflowService:
    """Build a :class:`WorkflowService` with sensible defaults."""
    root = Path(flows_dir) if flows_dir is not None else default_flows_dir()
    return WorkflowService(flows_dir=root, executor=executor)


__all__ = [
    "DEFAULT_FLOWS_DIR_NAME",
    "RunHandle",
    "WorkflowService",
    "build_service",
    "default_flows_dir",
]
