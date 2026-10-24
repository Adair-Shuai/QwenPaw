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
from uuid import UUID

from .execution_repository import ExecutionRepository
from .lifecycle import RunLifecycleMixin
from .engine import (
    ProgressRegistry,
    WorkflowExecutor,
    WorkflowResult,
    WorkflowStatus,
    build_workflow_state_store,
    canonicalize,
    load,
    validate,
)

logger = logging.getLogger(__name__)

DEFAULT_FLOWS_DIR_NAME = "flows"
# Keep the run-list response useful for the run center without allowing a
# verbose progress stream to make every polling response unbounded.
RUN_SUMMARY_EVENT_LIMIT = 100


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
    # A future can become done just before its callback persists the terminal
    # record.  Keep the public handle non-terminal until that write finishes,
    # so callers that observe ``is_done`` can safely restart and read the
    # durable state immediately.
    finalized: bool = False
    metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def status(self) -> WorkflowStatus:
        if self.cancel_requested:
            return WorkflowStatus.CANCELLED
        if self.result is not None:
            return self.result.status
        if self.error is not None:
            return WorkflowStatus.FAILED
        return WorkflowStatus.RUNNING

    @property
    def is_done(self) -> bool:
        return self.finalized

    def to_dict(self) -> dict[str, Any]:
        history = self.progress.history()
        return {
            **self.metadata,
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
            "events": [
                event.to_dict()
                for event in history[-RUN_SUMMARY_EVENT_LIMIT:]
            ],
        }


class WorkflowService(RunLifecycleMixin):
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
        self._lifecycle_lock = threading.RLock()
        self._executor.workflow_service = self
        self.node_catalog = None
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

    def validate_flow(self, payload: dict[str, Any], *, node_registry=None) -> dict[str, Any]:
        doc = load(_materialize_edge_dependencies(payload))
        result = validate(doc, registry=node_registry or self._executor.node_registry)
        return {
            "ok": result.ok,
            "errors": result.errors,
            "output_nodes": result.output_nodes,
        }

    async def validate_flow_for_agent(self, payload: dict[str, Any], agent_id: str | None = None) -> dict[str, Any]:
        if self.node_catalog is None:
            return self.validate_flow(payload)
        from qwenpaw.app.agent_context import get_current_agent_id

        scoped = await self.node_catalog.prepare(self._executor, agent_id or get_current_agent_id(), {})
        return self.validate_flow(payload, node_registry=scoped.node_registry)

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
    def node_types(self) -> list[dict[str, Any]]:
        return self._executor.node_registry.all_types()

    async def refresh_node_types(self, agent_id: str | None = None) -> list[dict[str, Any]]:
        if self.node_catalog is None:
            return self.node_types()
        from qwenpaw.app.agent_context import get_current_agent_id

        scoped = await self.node_catalog.prepare(self._executor, agent_id or get_current_agent_id(), {})
        return scoped.node_registry.all_types()

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
