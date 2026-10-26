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
from typing import Any, Literal
from queue import Empty, Queue

from fastapi import (
    APIRouter,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
    Body,
    Request,
)
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from .service import RunHandle, WorkflowService
from .engine.progress import ProgressEvent, ProgressHandler, ProgressRegistry
from .authoring import AuthoringUnavailable
from .flow_repository import RevisionConflict
from .lifecycle import ResumeInputError
from .engine.errors import ValidationError as WorkflowValidationError

logger = logging.getLogger(__name__)


def _request_agent_id(request: Request) -> str | None:
    from qwenpaw.app.agent_context import _normalize_agent_id

    return _normalize_agent_id(
        getattr(request.state, "agent_id", None)
        or request.headers.get("X-Agent-Id"),
    )


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
    revision: int | None = Field(default=None, ge=0, strict=True)
    expected_revision: int | None = Field(default=None, ge=0, strict=True)


class RunRequest(BaseModel):
    """Body schema for POST /flows/{id}/run."""

    inputs: dict[str, Any] = {}


class GenerateRequest(BaseModel):
    """Natural-language SOP generation request."""

    prompt: str
    name: str = ""
    agent_id: str = "default"


class ProposalRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=20000)
    flow: dict[str, Any] | None = None
    name: str = ""
    agent_id: str = "default"


class RevisionRequest(BaseModel):
    expected_revision: int = Field(ge=0, strict=True)


def _service_error(exc: Exception) -> HTTPException:
    if isinstance(exc, RevisionConflict):
        return HTTPException(409, str(exc))
    if isinstance(exc, FileNotFoundError):
        return HTTPException(404, str(exc))
    if isinstance(exc, AuthoringUnavailable):
        return HTTPException(503, str(exc))
    if isinstance(exc, WorkflowValidationError) and exc.errors:
        return HTTPException(422, "; ".join(exc.errors))
    return HTTPException(422, str(exc))


def build_router(service: WorkflowService) -> APIRouter:
    """Build the FastAPI router bound to *service*."""
    router = APIRouter()
    _register_health_routes(router, service)
    _register_flow_routes(router, service)
    _register_validation_routes(router, service)
    _register_authoring_routes(router, service)
    _register_run_routes(router, service)
    _register_event_routes(router, service)
    _register_websocket_route(router, service)
    return router


def _register_health_routes(
    router: APIRouter,
    service: WorkflowService,
) -> None:
    @router.get("/health")
    async def health() -> dict[str, Any]:
        return {"status": "ok", "flows_dir": str(service.flows_dir)}

    @router.get("/node-types")
    async def node_types(request: Request) -> list[dict[str, Any]]:
        try:
            return await service.refresh_node_types(_request_agent_id(request))
        except ValueError as exc:
            raise HTTPException(404, str(exc)) from exc
        except AuthoringUnavailable as exc:
            raise _service_error(exc) from exc

    @router.post("/node-types/refresh")
    async def refresh_node_types(request: Request) -> list[dict[str, Any]]:
        return await node_types(request)


def _register_flow_routes(router: APIRouter, service: WorkflowService) -> None:
    @router.get("/flows")
    async def list_flows() -> list[dict[str, Any]]:
        return service.list_flows()

    @router.post("/flows")
    async def create_flow(payload: FlowPayload = Body(...)) -> dict[str, Any]:
        data = payload.model_dump()
        flow_id = data.get("id") or data.get("name") or "flow"
        try:
            expected = (
                payload.expected_revision
                if payload.expected_revision is not None
                else payload.revision or 0
            )
            return service.save_flow(flow_id, data, expected_revision=expected)
        except (ValueError, TypeError, WorkflowValidationError) as exc:
            raise _service_error(exc) from exc

    @router.get("/flows/{flow_id}")
    async def get_flow(flow_id: str) -> dict[str, Any]:
        flow = service.get_flow(flow_id)
        if flow is None:
            raise HTTPException(404, f"flow '{flow_id}' not found")
        return flow

    @router.put("/flows/{flow_id}")
    async def update_flow(
        flow_id: str,
        payload: FlowPayload = Body(...),
    ) -> dict[str, Any]:
        data = payload.model_dump()
        data["id"] = flow_id
        try:
            expected = (
                payload.expected_revision
                if payload.expected_revision is not None
                else payload.revision or 0
            )
            return service.save_flow(flow_id, data, expected_revision=expected)
        except (ValueError, TypeError, WorkflowValidationError) as exc:
            raise _service_error(exc) from exc

    @router.delete("/flows/{flow_id}")
    async def delete_flow(flow_id: str) -> dict[str, bool]:
        deleted = service.delete_flow(flow_id)
        if not deleted:
            raise HTTPException(404, f"flow '{flow_id}' not found")
        return {"deleted": True}


def _register_validation_routes(
    router: APIRouter,
    service: WorkflowService,
) -> None:
    @router.post("/flows/{flow_id}/validate")
    async def validate_flow(flow_id: str, request: Request) -> dict[str, Any]:
        flow = service.get_flow(flow_id)
        if flow is None:
            raise HTTPException(404, f"flow '{flow_id}' not found")
        try:
            return await service.validate_flow_for_agent(
                flow,
                _request_agent_id(request),
            )
        except (ValueError, AuthoringUnavailable) as exc:
            raise _service_error(exc) from exc

    @router.post("/flows/validate")
    async def validate_payload(
        request: Request,
        payload: FlowPayload = Body(...),
    ) -> dict[str, Any]:
        try:
            return await service.validate_flow_for_agent(
                payload.model_dump(),
                _request_agent_id(request),
            )
        except (ValueError, AuthoringUnavailable) as exc:
            raise _service_error(exc) from exc

    @router.get("/flows/{flow_id}/versions")
    async def flow_versions(flow_id: str):
        return service.flow_versions(flow_id)

    @router.post("/flows/{flow_id}/versions/{revision}/restore")
    async def restore_version(
        flow_id: str,
        revision: int,
        payload: RevisionRequest = Body(...),
    ):
        try:
            return service.restore_version(
                flow_id,
                revision,
                payload.expected_revision,
            )
        except (ValueError, FileNotFoundError, WorkflowValidationError) as exc:
            raise _service_error(exc) from exc


def _register_authoring_routes(
    router: APIRouter,
    service: WorkflowService,
) -> None:
    @router.post("/generate")
    async def generate_flow(payload: GenerateRequest = Body(...)):
        """Explicit legacy sequential template; AI creation uses proposals."""
        try:
            return service.generate_flow(
                payload.prompt,
                name=payload.name,
                agent_id=payload.agent_id,
            )
        except ValueError as exc:
            raise _service_error(exc) from exc

    @router.post("/authoring/proposals")
    async def create_proposal(
        request: Request,
        payload: ProposalRequest = Body(...),
    ):
        try:
            return await service.create_proposal(
                payload.prompt,
                flow=payload.flow,
                name=payload.name,
                agent_id=payload.agent_id,
                scope_agent_id=_request_agent_id(request),
            )
        except (
            ValueError,
            TypeError,
            AuthoringUnavailable,
            WorkflowValidationError,
        ) as exc:
            raise _service_error(exc) from exc

    @router.post("/authoring/proposals/{proposal_id}/apply")
    async def apply_proposal(
        proposal_id: str,
        request: Request,
        payload: RevisionRequest = Body(...),
    ):
        try:
            return await service.apply_proposal_for_agent(
                proposal_id,
                payload.expected_revision,
                _request_agent_id(request),
            )
        except (
            ValueError,
            TypeError,
            AuthoringUnavailable,
            WorkflowValidationError,
        ) as exc:
            raise _service_error(exc) from exc


def _register_run_routes(router: APIRouter, service: WorkflowService) -> None:
    @router.post("/flows/{flow_id}/run")
    async def start_run(
        flow_id: str,
        request: Request,
        body: RunRequest | None = Body(None),
    ) -> dict[str, Any]:
        inputs = (body.inputs if body else {}) or {}
        try:
            handle = service.start_run(
                flow_id,
                inputs,
                agent_id=_request_agent_id(request),
            )
        except (FileNotFoundError, ValueError, WorkflowValidationError) as exc:
            raise _service_error(exc) from exc
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
        record = service.get_run_record(run_id)
        if record is None:
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
            raise HTTPException(404, str(exc)) from exc
        except ResumeInputError as exc:
            raise HTTPException(422, str(exc)) from exc
        except ValueError as exc:
            raise HTTPException(409, str(exc)) from exc
        return {
            "run_id": handle.run_id,
            "flow_id": handle.flow_id,
            "status": handle.status.value,
        }


def _register_event_routes(
    router: APIRouter,
    service: WorkflowService,
) -> None:
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
                persisted_event_generator(),
                media_type="text/event-stream",
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


class _WebSocketSubscription:
    """Keep one socket's live progress registration and replay state."""

    def __init__(self, service: WorkflowService) -> None:
        self.service = service
        self.run_id: str | None = None
        self.queue: Queue[ProgressEvent] | None = None
        self.progress: ProgressRegistry | None = None
        self.handler: ProgressHandler | None = None
        self.replayed: set[int] = set()

    def detach(self) -> None:
        if self.progress is not None and self.handler is not None:
            self.progress.remove_handler(self.handler)
        self.progress = None
        self.handler = None

    async def subscribe(
        self,
        websocket: WebSocket,
        run_id: str,
    ) -> Literal["missing", "persisted", "live"]:
        self.detach()
        self.run_id = run_id
        handle = self.service.get_run(run_id)
        if handle is None:
            record = self.service.get_run_record(run_id)
            if record is None:
                await websocket.send_text(
                    json.dumps(
                        {
                            "type": "error",
                            "error": f"run '{run_id}' not found",
                        },
                    ),
                )
                self.run_id = None
                return "missing"
            for event in record.get("events", []):
                await websocket.send_text(json.dumps(event))
            await websocket.send_text(
                json.dumps(
                    {
                        "type": "run_finished",
                        "run_id": run_id,
                        "status": record.get("status"),
                    },
                ),
            )
            return "persisted"

        # Progress emits on the workflow's background thread. This queue is
        # deliberately synchronous: the socket polls without awaiting it.
        event_queue: Queue[ProgressEvent] = Queue()
        self.queue = event_queue
        self.progress = handle.progress
        self.handler = event_queue.put_nowait
        self.progress.add_handler(self.handler)
        history = handle.progress.history()
        # Registry history and handlers share the same immutable event objects.
        # An event emitted at attachment can reach both history and the queue.
        self.replayed = {id(event) for event in history}
        for event in history:
            await websocket.send_text(json.dumps(event.to_dict()))
        return "live"

    async def forward(self, websocket: WebSocket) -> bool:
        if self.queue is None:
            return False
        try:
            while True:
                event = self.queue.get_nowait()
                if id(event) in self.replayed:
                    continue
                await websocket.send_text(json.dumps(event.to_dict()))
                break
        except Empty:
            pass
        handle: RunHandle | None = (
            self.service.get_run(self.run_id) if self.run_id else None
        )
        if handle and handle.is_done and self.queue.empty():
            await websocket.send_text(
                json.dumps(
                    {
                        "type": "run_finished",
                        "run_id": self.run_id,
                        "status": handle.status.value,
                    },
                ),
            )
            return True
        return False


def _register_websocket_route(
    router: APIRouter,
    service: WorkflowService,
) -> None:
    @router.websocket("/ws")
    async def websocket_endpoint(websocket: WebSocket) -> None:
        await websocket.accept()
        subscription = _WebSocketSubscription(service)
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
                        outcome = await subscription.subscribe(
                            websocket,
                            msg["run_id"],
                        )
                        if outcome == "missing":
                            continue
                        if outcome == "persisted":
                            break
                    elif msg.get("type") == "ping":
                        await websocket.send_text(json.dumps({"type": "pong"}))
                if await subscription.forward(websocket):
                    break
        except WebSocketDisconnect:
            pass
        finally:
            subscription.detach()


def _sse_pack(payload: dict[str, Any]) -> str:
    """Pack a dict as an SSE ``data:`` frame."""
    return f"data: {json.dumps(payload, ensure_ascii=False, default=str)}\n\n"


__all__ = ["build_router"]
