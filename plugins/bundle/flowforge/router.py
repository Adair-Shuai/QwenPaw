# -*- coding: utf-8 -*-
"""FlowForge FastAPI router.

Exposes the full workflow lifecycle under ``/api/flowforge``:

  * ``GET    /flows``                        — list flows
  * ``POST   /flows``                        — create / upsert flow
  * ``GET    /flows/{id}``                   — get flow
  * ``PUT    /flows/{id}``                   — update flow
  * ``DELETE /flows/{id}``                   — delete flow
  * ``POST   /flows/{id}/validate``          — validate flow
  * ``POST   /flows/{id}/run``               — start run → ``{run_id}``
  * ``GET    /runs``                         — list runs
  * ``GET    /runs/{run_id}``                — get run status
  * ``POST   /runs/{run_id}/cancel``         — cancel run
  * ``GET    /runs/{run_id}/events``         — SSE stream of progress events
  * ``GET    /node-types``                    — list registered node types
  * ``GET    /health``                       — liveness probe

Plus a WebSocket endpoint at ``/api/flowforge/ws`` for live updates.
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Body
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from .service import RunHandle, WorkflowService

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────────────
# Request models (module-level so FastAPI reliably detects them as bodies)
# ──────────────────────────────────────────────────────────────────────────────


class FlowPayload(BaseModel):
    """Body schema for POST/PUT /flows."""

    id: str | None = None
    name: str = ""
    description: str = ""
    nodes: dict[str, Any] = {}
    edges: list[dict[str, Any]] = []
    inputs: list[dict[str, Any]] = []
    outputs: list[str] | dict[str, Any] = []
    start_id: str | None = None
    metadata: dict[str, Any] = {}
    version: str = "1.0"


class RunRequest(BaseModel):
    """Body schema for POST /flows/{id}/run."""

    inputs: dict[str, Any] = {}


class GenerateRequest(BaseModel):
    """Natural-language SOP generation request."""

    prompt: str
    name: str = ""


def build_router(service: WorkflowService) -> APIRouter:
    """Build the FastAPI router bound to *service*."""
    router = APIRouter()

    # ---------------------------------------------------------------- #
    # Health + node types
    # ---------------------------------------------------------------- #
    @router.get("/health")
    async def health() -> dict[str, Any]:
        return {"status": "ok", "flows_dir": str(service.flows_dir)}

    @router.get("/node-types")
    async def node_types() -> list[dict[str, Any]]:
        return service.node_types()

    # ---------------------------------------------------------------- #
    # Flow CRUD
    # ---------------------------------------------------------------- #
    @router.get("/flows")
    async def list_flows() -> list[dict[str, Any]]:
        return service.list_flows()

    @router.post("/flows")
    async def create_flow(payload: FlowPayload = Body(...)) -> dict[str, Any]:
        data = payload.model_dump()
        flow_id = data.get("id") or data.get("name") or "flow"
        return service.save_flow(flow_id, data)

    @router.get("/flows/{flow_id}")
    async def get_flow(flow_id: str) -> dict[str, Any]:
        flow = service.get_flow(flow_id)
        if flow is None:
            raise HTTPException(404, f"flow '{flow_id}' not found")
        return flow

    @router.put("/flows/{flow_id}")
    async def update_flow(flow_id: str, payload: FlowPayload = Body(...)) -> dict[str, Any]:
        data = payload.model_dump()
        data["id"] = flow_id
        return service.save_flow(flow_id, data)

    @router.delete("/flows/{flow_id}")
    async def delete_flow(flow_id: str) -> dict[str, bool]:
        deleted = service.delete_flow(flow_id)
        if not deleted:
            raise HTTPException(404, f"flow '{flow_id}' not found")
        return {"deleted": True}

    @router.post("/flows/{flow_id}/validate")
    async def validate_flow(flow_id: str) -> dict[str, Any]:
        flow = service.get_flow(flow_id)
        if flow is None:
            raise HTTPException(404, f"flow '{flow_id}' not found")
        return service.validate_flow(flow)

    @router.post("/flows/validate")
    async def validate_payload(payload: FlowPayload = Body(...)) -> dict[str, Any]:
        return service.validate_flow(payload.model_dump())

    @router.post("/generate")
    async def generate_flow(payload: GenerateRequest = Body(...)) -> dict[str, Any]:
        """Draft an editable workflow from a natural-language SOP."""
        return service.generate_flow(payload.prompt, name=payload.name)

    # ---------------------------------------------------------------- #
    # Run lifecycle
    # ---------------------------------------------------------------- #
    @router.post("/flows/{flow_id}/run")
    async def start_run(
        flow_id: str,
        body: RunRequest | None = Body(None),
    ) -> dict[str, Any]:
        inputs = (body.inputs if body else {}) or {}
        try:
            handle = service.start_run(flow_id, inputs)
        except FileNotFoundError as exc:
            raise HTTPException(404, str(exc))
        return {
            "run_id": handle.run_id,
            "flow_id": handle.flow_id,
            "status": handle.status.value,
        }

    @router.get("/runs")
    async def list_runs() -> list[dict[str, Any]]:
        return service.list_runs()

    @router.get("/runs/{run_id}")
    async def get_run(run_id: str) -> dict[str, Any]:
        record = service.get_run_record(run_id)
        if record is None:
            raise HTTPException(404, f"run '{run_id}' not found")
        return record

    @router.post("/runs/{run_id}/cancel")
    async def cancel_run(run_id: str) -> dict[str, Any]:
        handle = service.get_run(run_id)
        if handle is None:
            raise HTTPException(404, f"run '{run_id}' not found")
        cancelled = service.cancel_run(run_id)
        return {"run_id": run_id, "cancelled": cancelled}

    @router.post("/runs/{run_id}/resume")
    async def resume_run(
        run_id: str,
        body: RunRequest | None = Body(None),
    ) -> dict[str, Any]:
        inputs = (body.inputs if body else {}) or {}
        try:
            handle = service.resume_run(run_id, inputs)
        except FileNotFoundError as exc:
            raise HTTPException(404, str(exc))
        return {
            "run_id": handle.run_id,
            "flow_id": handle.flow_id,
            "status": handle.status.value,
        }

    # ---------------------------------------------------------------- #
    # SSE event stream
    # ---------------------------------------------------------------- #
    @router.get("/runs/{run_id}/events")
    async def run_events(run_id: str) -> StreamingResponse:
        handle = service.get_run(run_id)
        record = service.get_run_record(run_id)
        if record is None:
            raise HTTPException(404, f"run '{run_id}' not found")

        if handle is None:
            async def persisted_event_generator():
                for event in record.get("events", []):
                    yield _sse_pack(event)
            return StreamingResponse(
                persisted_event_generator(), media_type="text/event-stream",
            )

        # Poll handle.progress.history() + handle.is_done on a short cadence.
        # We avoid asyncio.Queue here because events are emitted from the
        # background loop thread; cross-loop asyncio.Queue is not safe.
        async def event_generator():
            seen = 0
            try:
                while True:
                    history = handle.progress.history()
                    new_events = history[seen:]
                    seen = len(history)
                    for ev in new_events:
                        yield _sse_pack(ev.to_dict())
                    if handle.is_done:
                        break
                    await asyncio.sleep(0.1)
            except asyncio.CancelledError:  # pragma: no cover
                pass

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    # ---------------------------------------------------------------- #
    # WebSocket endpoint (live run updates)
    # ---------------------------------------------------------------- #
    @router.websocket("/ws")
    async def websocket_endpoint(websocket: WebSocket) -> None:
        await websocket.accept()
        subscribed_run: str | None = None
        attached: bool = False
        queue: asyncio.Queue | None = None
        try:
            while True:
                # Drain incoming control messages (subscribe / cancel / ping).
                try:
                    raw = await asyncio.wait_for(
                        websocket.receive_text(),
                        timeout=0.5,
                    )
                except asyncio.TimeoutError:
                    raw = None
                if raw:
                    try:
                        msg = json.loads(raw)
                    except json.JSONDecodeError:
                        msg = {"type": raw}
                    if msg.get("type") == "subscribe" and msg.get("run_id"):
                        # Detach from previous run.
                        if (
                            subscribed_run
                            and queue is not None
                            and attached
                        ):
                            prev = service.get_run(subscribed_run)
                            if prev is not None:
                                prev.progress.detach_queue()
                        subscribed_run = msg["run_id"]
                        handle = service.get_run(subscribed_run)
                        if handle is None:
                            record = service.get_run_record(subscribed_run)
                            if record is None:
                                await websocket.send_text(
                                    json.dumps(
                                        {
                                            "type": "error",
                                            "error": f"run '{subscribed_run}' not found",
                                        },
                                    ),
                                )
                                subscribed_run = None
                                continue
                            for event in record.get("events", []):
                                await websocket.send_text(json.dumps(event))
                            await websocket.send_text(
                                json.dumps(
                                    {
                                        "type": "run_finished",
                                        "run_id": subscribed_run,
                                        "status": record.get("status"),
                                    },
                                ),
                            )
                            break
                        queue = handle.progress.attach_queue()
                        attached = True
                        for ev in handle.progress.history():
                            await websocket.send_text(
                                json.dumps(ev.to_dict()),
                            )
                    elif msg.get("type") == "ping":
                        await websocket.send_text(json.dumps({"type": "pong"}))

                # Forward any queued events for the subscribed run.
                if queue is not None:
                    try:
                        ev = queue.get_nowait()
                        await websocket.send_text(json.dumps(ev.to_dict()))
                    except asyncio.QueueEmpty:
                        pass
                    handle = service.get_run(subscribed_run) if subscribed_run else None
                    if (
                        handle
                        and handle.is_done
                        and queue.empty()
                    ):
                        await websocket.send_text(
                            json.dumps(
                                {
                                    "type": "run_finished",
                                    "run_id": subscribed_run,
                                    "status": handle.status.value,
                                },
                            ),
                        )
                        break
        except WebSocketDisconnect:
            pass
        finally:
            if (
                subscribed_run
                and attached
                and queue is not None
            ):
                handle = service.get_run(subscribed_run)
                if handle is not None:
                    handle.progress.detach_queue()

    return router


def _sse_pack(payload: dict[str, Any]) -> str:
    """Pack a dict as an SSE ``data:`` frame."""
    return f"data: {json.dumps(payload, ensure_ascii=False, default=str)}\n\n"


__all__ = ["build_router"]
