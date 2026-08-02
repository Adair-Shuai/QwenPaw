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
import os
import threading
import time
import re
from concurrent.futures import Future
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any
from uuid import UUID, uuid4

from .execution_repository import ExecutionRepository
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
    canonicalize,
    load,
    validate,
)

logger = logging.getLogger(__name__)

DEFAULT_FLOWS_DIR_NAME = "flows"


def _materialize_edge_dependencies(payload: dict[str, Any]) -> dict[str, Any]:
    """Backward-compatible alias for the canonical graph normalizer."""
    return canonicalize(payload)


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
    cancel_requested: bool = False
    started_at: float = field(default_factory=time.time)
    finished_at: float | None = None

    @property
    def status(self) -> WorkflowStatus:
        if self.result is not None:
            return self.result.status
        if self.cancel_requested:
            return WorkflowStatus.CANCELLED
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
        self._execution_repository = ExecutionRepository(self._flows_dir)
        recovered = self._execution_repository.recover_incomplete(
            active_owner_pid=os.getpid(),
        )
        if recovered:
            logger.warning("recovered %d interrupted FlowForge run(s)", recovered)
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
        payload = _materialize_edge_dependencies(payload)
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
        doc = load(_materialize_edge_dependencies(payload))
        result = validate(doc, registry=self._executor.node_registry)
        return {
            "ok": result.ok,
            "errors": result.errors,
            "output_nodes": result.output_nodes,
        }

    def generate_flow(
        self,
        prompt: str,
        *,
        name: str = "",
        agent_id: str = "default",
    ) -> dict[str, Any]:
        """Turn a plain-language SOP into a portable, editable draft."""
        prompt = (prompt or "").strip()
        if not prompt:
            raise ValueError("prompt must not be empty")
        raw_steps = re.split(r"(?:\n+|[。；;]+|\s*(?:->|→)\s*)", prompt)
        steps = []
        for item in raw_steps:
            item = re.sub(r"^\s*(?:第?[一二三四五六七八九十\d]+[步、.：:]?|\d+[.)、])\s*", "", item).strip()
            if item and item not in steps:
                steps.append(item)
        if len(steps) == 1:
            chunks = re.split(r"[，,]\s*(?:然后|再|并且|最后)?", steps[0])
            steps = [chunk.strip() for chunk in chunks if chunk.strip()]
        steps = steps[:12] or [prompt]

        flow_id = re.sub(r"[^a-zA-Z0-9_-]+", "-", name or steps[0])[:40].strip("-").lower()
        flow_id = flow_id or f"sop-{int(time.time())}"
        nodes: dict[str, dict[str, Any]] = {
            "input": {
                "id": "input", "class_type": "InputNode",
                "inputs": {"name": "request"}, "control": {"next": "step_1"},
                "label": "业务输入",
            },
        }
        positions: dict[str, dict[str, int]] = {"input": {"x": 80, "y": 180}}
        edges: list[dict[str, Any]] = []
        previous = "input"
        for index, step in enumerate(steps, start=1):
            node_id = f"step_{index}"
            next_id = f"step_{index + 1}" if index < len(steps) else "output"
            nodes[node_id] = {
                "id": node_id, "class_type": "AgentNode",
                "label": f"步骤 {index}",
                "inputs": {
                    # Bind by the runtime's stable agent identifier. Display
                    # names are mutable and may not be accepted by the agent
                    # runtime (for example CloudPaw-Master is commonly stored
                    # as ``cloud-orchestrator``).
                    "agent_id": agent_id.strip() or "default",
                    "query": f"请严格执行以下 SOP 步骤：{step}",
                    "context": [previous, 0],
                    "__flow_dependencies": [[previous, 0]],
                },
                "control": {"next": next_id},
            }
            positions[node_id] = {"x": 360 + (index - 1) * 300, "y": 180}
            edges.append({"id": f"e-{previous}-{node_id}", "source": previous, "target": node_id})
            previous = node_id
        nodes["output"] = {
            "id": "output", "class_type": "OutputNode", "label": "流程结果",
            "inputs": {"value": [previous, 0]}, "control": {},
        }
        positions["output"] = {"x": 360 + len(steps) * 300, "y": 180}
        edges.append({"id": f"e-{previous}-output", "source": previous, "target": "output"})
        return {
            "id": flow_id,
            "name": name.strip() or f"{steps[0][:20]} SOP",
            "description": prompt[:240],
            "nodes": nodes,
            "edges": edges,
            "inputs": [{"name": "request", "type": "string", "required": True, "label": "业务输入"}],
            "outputs": ["output"],
            "start_id": "input",
            "metadata": {"positions": positions, "source": "agent-generated", "sop": prompt},
            "version": "1.0",
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
        # Support flows saved by older editors where canvas edges existed only
        # in the sibling ``edges`` array and had not yet been materialised.
        doc = load(_materialize_edge_dependencies(flow_payload))
        run_id = str(uuid4())
        prompt_id = run_id  # 1:1 mapping for FlowForge
        progress = ProgressRegistry(prompt_id=prompt_id)
        self._execution_repository.create(
            run_id,
            flow_id,
            status="queued",
            started_at=time.time(),
            owner_pid=os.getpid(),
        )
        progress.add_handler(
            lambda event: self._execution_repository.append_event(
                run_id, event.to_dict(),
            ),
        )
        if on_event is not None:
            progress.add_handler(on_event)
        # Attach a fresh progress handler to the executor for this run.
        executor = self._executor

        async def _run() -> WorkflowResult:
            try:
                self._execution_repository.update(run_id, status="running")
                result = await executor.execute_async(
                    doc,
                    inputs or {},
                    prompt_id=prompt_id,
                    progress_registry=progress,
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
                self._execution_repository.update(
                    run_id,
                    state_id=str(handle.result.state_id),
                    status=handle.result.status.value,
                    finished_at=handle.finished_at,
                    outputs=handle.result.outputs,
                    errors=handle.result.errors,
                    duration_ms=handle.result.duration_ms,
                    execution_history=[
                        entry.model_dump(mode="json")
                        for entry in handle.result.execution_history
                    ],
                    node_statuses=handle.progress.node_statuses(),
                )
            except Exception as exc:
                handle.error = str(exc)
                handle.progress.emit(
                    ProgressEvent(
                        type="execution_failed",
                        prompt_id=run_id,
                        data={"errors": [str(exc)], "outputs": {}},
                    ),
                )
                self._execution_repository.update(
                    run_id, status="failed", error=str(exc),
                    finished_at=handle.finished_at,
                    node_statuses=handle.progress.node_statuses(),
                )

        future.add_done_callback(_on_done)
        return handle

    def resume_run(
        self,
        run_id: str,
        inputs: dict[str, Any] | None = None,
    ) -> RunHandle:
        """Resume a paused/blocked run with new inputs.

        Re-uses the existing executor's ``resume`` method to continue
        from the persisted state snapshot.
        """
        handle = self._runs.get(run_id)
        record = self._execution_repository.get(run_id)
        if handle is None and record is None:
            raise FileNotFoundError(f"run '{run_id}' not found")
        flow_id = handle.flow_id if handle is not None else str(record["flow_id"])
        state_id = (
            handle.state_id
            if handle is not None
            else UUID(str(record.get("state_id")))
        )
        flow_payload = self.get_flow(flow_id)
        if flow_payload is None:
            raise FileNotFoundError(f"flow '{flow_id}' not found")
        doc = load(_materialize_edge_dependencies(flow_payload))
        new_run_id = str(uuid4())
        prompt_id = new_run_id
        progress = ProgressRegistry(prompt_id=prompt_id)
        self._execution_repository.create(
            new_run_id,
            flow_id,
            status="queued",
            started_at=time.time(),
            parent_run_id=run_id,
            state_id=str(state_id),
            owner_pid=os.getpid(),
        )
        progress.add_handler(
            lambda event: self._execution_repository.append_event(
                new_run_id, event.to_dict(),
            ),
        )
        executor = self._executor

        async def _resume() -> WorkflowResult:
            try:
                self._execution_repository.update(new_run_id, status="running")
                from uuid import UUID
                result = await executor.resume(
                    doc,
                    state_id,
                    inputs or {},
                    prompt_id=prompt_id,
                    progress_registry=progress,
                )
                return result
            except Exception as exc:
                logger.exception("resume %s failed", new_run_id)
                raise exc

        future = asyncio.run_coroutine_threadsafe(_resume(), self._loop)
        new_handle = RunHandle(
            run_id=new_run_id,
            flow_id=flow_id,
            state_id=state_id,
            progress=progress,
            future=future,
        )
        self._runs[new_run_id] = new_handle

        def _on_done(fut: Future) -> None:
            new_handle.finished_at = time.time()
            try:
                new_handle.result = fut.result()
                new_handle.state_id = new_handle.result.state_id
                self._execution_repository.update(
                    new_run_id,
                    state_id=str(new_handle.result.state_id),
                    status=new_handle.result.status.value,
                    finished_at=new_handle.finished_at,
                    outputs=new_handle.result.outputs,
                    errors=new_handle.result.errors,
                    duration_ms=new_handle.result.duration_ms,
                    execution_history=[
                        entry.model_dump(mode="json")
                        for entry in new_handle.result.execution_history
                    ],
                    node_statuses=new_handle.progress.node_statuses(),
                )
            except Exception as exc:
                new_handle.error = str(exc)
                new_handle.progress.emit(
                    ProgressEvent(
                        type="execution_failed",
                        prompt_id=new_run_id,
                        data={"errors": [str(exc)], "outputs": {}},
                    ),
                )
                self._execution_repository.update(
                    new_run_id, status="failed", error=str(exc),
                    finished_at=new_handle.finished_at,
                    node_statuses=new_handle.progress.node_statuses(),
                )

        future.add_done_callback(_on_done)
        return new_handle

    def get_run(self, run_id: str) -> RunHandle | None:
        return self._runs.get(run_id)

    def get_run_record(self, run_id: str) -> dict[str, Any] | None:
        handle = self._runs.get(run_id)
        return handle.to_dict() if handle is not None else self._execution_repository.get(run_id)

    def list_runs(self) -> list[dict[str, Any]]:
        records = {
            record["run_id"]: record
            for record in self._execution_repository.list()
        }
        records.update({run_id: handle.to_dict() for run_id, handle in self._runs.items()})
        return sorted(
            records.values(),
            key=lambda item: item.get("started_at") or 0,
            reverse=True,
        )

    def cancel_run(self, run_id: str) -> bool:
        handle = self._runs.get(run_id)
        if handle is None:
            return False
        if handle.future is not None and not handle.future.done():
            handle.cancel_requested = True
            self._execution_repository.update(run_id, status="cancelled")
            self._loop.call_soon_threadsafe(
                self._executor.cancel_by_prompt_id,
                run_id,
            )
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
