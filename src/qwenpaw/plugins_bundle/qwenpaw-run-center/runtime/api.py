"""FastAPI endpoints for the independent Run Center R0."""

from __future__ import annotations

import asyncio
import json
from typing import Any, Callable

from fastapi import APIRouter, Body, Header, HTTPException, Query, Request, status
from fastapi.responses import StreamingResponse

from .models import CONTRACT_VERSION, TERMINAL_STATUSES
from .descriptors import normalize_operation_descriptor, validate_json_schema
from .repository import RunRepository


# These values describe executable implementation details.  They are allowed
# in trusted provider-to-provider calls (which use the repository directly),
# but must never be accepted from the public JSON Run creation endpoint.  A
# client submits references and parameters; the provider resolves commands and
# workspace paths on the server.
_FORBIDDEN_CLIENT_RUN_KEYS = frozenset(
    {
        "command",
        "argv",
        "working_dir",
        "execution_dir",
        "log_path",
        "upload_path",
        "prop_path",
        "bin_dir",
        "output_dir",
    }
)


def _find_forbidden_run_key(value: Any, *, path: str = "payload") -> str | None:
    if isinstance(value, dict):
        for key, child in value.items():
            normalized = str(key).strip().lower()
            if normalized in _FORBIDDEN_CLIENT_RUN_KEYS:
                return f"{path}.{key}"
            found = _find_forbidden_run_key(child, path=f"{path}.{key}")
            if found:
                return found
    elif isinstance(value, list):
        for index, child in enumerate(value):
            found = _find_forbidden_run_key(child, path=f"{path}[{index}]")
            if found:
                return found
    return None


def build_router(
    repository: RunRepository,
    sync_operations: Callable[[], None] | None = None,
    executor_service: Any | None = None,
    research_service: Any | None = None,
) -> APIRouter:
    router = APIRouter()

    def _executor_started() -> bool:
        if executor_service is None:
            return False
        started = getattr(executor_service, "started", None)
        return bool(started() if callable(started) else started)

    @router.get("/health")
    def health() -> dict[str, Any]:
        repository.initialize()
        executor_ready = _executor_started()
        return {
            "plugin_id": "qwenpaw-run-center",
            "contract_version": CONTRACT_VERSION,
            "status": "ready",
            # Never expose the local absolute path through the HTTP contract.
            "database": repository.database.name,
            "legacy_bridge": repository.legacy_bridge_status(),
            "capabilities": {
                "read_runs": True,
                "event_replay": True,
                "stage_contract": True,
                "artifact_refs": True,
                "provenance_refs": True,
                "stage_persistence": True,
                "artifact_query": True,
                "checkpoint_persistence": True,
                "checkpoint_resume": executor_ready,
                "provenance_query": True,
                "create_runs": True,
                "run_state_control": True,
                "sse_event_stream": True,
                "restart_recovery": executor_ready,
                "restart_recovery_mode": "requeue_or_block",
                "executor_runtime": _executor_started(),
                "project_queue_policies": True,
                "resource_leases": True,
                "model_registry": research_service is not None,
                "study_engine": research_service is not None,
                "doe": ["latin_hypercube", "random", "sobol", "full_factorial"] if research_service is not None else [],
                "uncertainty_statistics": research_service is not None,
                "sensitivity_screening": research_service is not None,
                "scenario_comparison": research_service is not None,
                "surrogate_model": research_service is not None,
                "observed_optimization": research_service is not None,
                "review_workflow": research_service is not None,
                "research_reports": research_service is not None,
                "contracts": {
                    "stage": True,
                    "artifact_ref": True,
                    "provenance_ref": True,
                },
                "runtime": {
                    "stage_persistence": True,
                    "artifact_query": True,
                    "checkpoint_persistence": True,
                    "checkpoint_resume": executor_ready,
                    "provenance_query": True,
                    "create_runs": True,
                    "state_control": True,
                    "sse_event_stream": True,
                    "restart_recovery": executor_ready,
                    "restart_recovery_mode": "requeue_or_block",
                    "executor_runtime": _executor_started(),
                    "project_queue_policies": True,
                    "resource_leases": True,
                    "model_registry": research_service is not None,
                    "study_engine": research_service is not None,
                    "review_workflow": research_service is not None,
                    "research_reports": research_service is not None,
                    "surrogate_model": research_service is not None,
                    "observed_optimization": research_service is not None,
                },
            },
        }

    @router.get("/runs")
    def list_runs(
        status: str | None = Query(default=None),
        operation: str | None = Query(default=None),
        project_id: str | None = Query(default=None),
        limit: int = Query(default=100, ge=1, le=500),
    ) -> dict[str, Any]:
        try:
            normalized_status = repository._query_status(status) if status else None  # noqa: SLF001
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        return {
            "contract_version": CONTRACT_VERSION,
            "runs": repository.list_runs(
                status=normalized_status,
                operation=operation,
                project_id=project_id,
                limit=limit,
            ),
        }

    @router.get("/runs/{run_id}")
    def get_run(run_id: str) -> dict[str, Any]:
        item = repository.get_run(run_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Run not found")
        return item

    @router.get("/runs/{run_id}/events")
    def list_events(
        run_id: str,
        after_seq: int = Query(default=0, ge=0),
    ) -> dict[str, Any]:
        if repository.get_run(run_id) is None:
            raise HTTPException(status_code=404, detail="Run not found")
        return {
            "contract_version": CONTRACT_VERSION,
            "run_id": run_id,
            "events": repository.list_events(run_id, after_seq),
        }

    @router.get("/runs/{run_id}/stages")
    def list_stages(run_id: str) -> dict[str, Any]:
        try:
            stages = repository.list_stages(run_id)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Run not found") from exc
        return {"contract_version": CONTRACT_VERSION, "run_id": run_id, "stages": stages}

    @router.put("/runs/{run_id}/stages/{stage_id}")
    def upsert_stage(
        run_id: str,
        stage_id: str,
        payload: dict[str, Any] = Body(...),
    ) -> dict[str, Any]:
        if payload.get("stage_id") not in (None, stage_id):
            raise HTTPException(status_code=400, detail="stage_id does not match path")
        try:
            stage = repository.upsert_stage(run_id, {**payload, "stage_id": stage_id})
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Run not found") from exc
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        return {"contract_version": CONTRACT_VERSION, "stage": stage}

    @router.get("/runs/{run_id}/artifacts")
    def list_artifacts(
        run_id: str,
        stage_id: str | None = Query(default=None),
        role: str | None = Query(default=None),
    ) -> dict[str, Any]:
        try:
            artifacts = repository.list_artifacts(run_id, stage_id=stage_id, role=role)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Run not found") from exc
        return {
            "contract_version": CONTRACT_VERSION,
            "run_id": run_id,
            "artifacts": artifacts,
        }

    @router.post("/runs/{run_id}/artifacts", status_code=status.HTTP_201_CREATED)
    def add_artifact(run_id: str, payload: dict[str, Any] = Body(...)) -> dict[str, Any]:
        artifact = payload.get("artifact") if isinstance(payload.get("artifact"), dict) else payload
        try:
            item = repository.add_artifact(
                run_id,
                artifact,
                stage_id=payload.get("stage_id"),
                role=str(payload.get("role") or "output"),
            )
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Run not found") from exc
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        return {"contract_version": CONTRACT_VERSION, "artifact": item}

    @router.get("/runs/{run_id}/checkpoints")
    def list_checkpoints(run_id: str) -> dict[str, Any]:
        try:
            checkpoints = repository.list_checkpoints(run_id)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Run not found") from exc
        return {
            "contract_version": CONTRACT_VERSION,
            "run_id": run_id,
            "checkpoints": checkpoints,
        }

    @router.post("/runs/{run_id}/checkpoints", status_code=status.HTTP_201_CREATED)
    def create_checkpoint(run_id: str, payload: dict[str, Any] = Body(...)) -> dict[str, Any]:
        try:
            item = repository.create_checkpoint(run_id, payload)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Run not found") from exc
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        return {"contract_version": CONTRACT_VERSION, "checkpoint": item}

    @router.get("/runs/{run_id}/provenance")
    def list_provenance(run_id: str) -> dict[str, Any]:
        try:
            provenance = repository.list_provenance(run_id)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Run not found") from exc
        return {
            "contract_version": CONTRACT_VERSION,
            "run_id": run_id,
            "provenance": provenance,
        }

    @router.put("/runs/{run_id}/provenance")
    def upsert_provenance(run_id: str, payload: dict[str, Any] = Body(...)) -> dict[str, Any]:
        try:
            item = repository.upsert_provenance(
                run_id,
                payload,
                artifact_ref_id=payload.get("artifact_ref_id"),
            )
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Run not found") from exc
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        return {"contract_version": CONTRACT_VERSION, "provenance": item}

    @router.get("/runs/{run_id}/events/stream")
    async def stream_events(
        request: Request,
        run_id: str,
        after_seq: int = Query(default=0, ge=0),
        last_event_id: str | None = Header(default=None, alias="Last-Event-ID"),
    ) -> StreamingResponse:
        """Replay durable events, then follow the run until it is terminal."""
        if repository.get_run(run_id) is None:
            raise HTTPException(status_code=404, detail="Run not found")
        cursor = after_seq
        if last_event_id:
            try:
                cursor = max(cursor, int(last_event_id))
            except ValueError as exc:
                raise HTTPException(status_code=400, detail="Last-Event-ID must be an integer") from exc

        async def generate():
            sequence = cursor
            heartbeat_at = asyncio.get_running_loop().time() + 15.0
            while True:
                events = await asyncio.to_thread(repository.list_events, run_id, sequence)
                for event in events:
                    sequence = max(sequence, int(event.get("sequence") or 0))
                    envelope = {
                        "contract_version": CONTRACT_VERSION,
                        "run_id": run_id,
                        "seq": sequence,
                        "type": event.get("type") or event.get("event_type"),
                        "ts": event.get("created_at"),
                        "stage_id": (event.get("data") or {}).get("stage_id"),
                        "data": event.get("data") or {},
                    }
                    yield (
                        f"id: {sequence}\n"
                        f"event: {envelope['type']}\n"
                        f"data: {json.dumps(envelope, ensure_ascii=False, separators=(',', ':'))}\n\n"
                    )
                current = await asyncio.to_thread(repository.get_run, run_id)
                if current is None or current.get("status") in TERMINAL_STATUSES:
                    # A final query closes the race between the last replay and
                    # terminal transition without duplicating earlier events.
                    final_events = await asyncio.to_thread(repository.list_events, run_id, sequence)
                    if final_events:
                        continue
                    return
                if await request.is_disconnected():
                    return
                now = asyncio.get_running_loop().time()
                if now >= heartbeat_at:
                    yield ": heartbeat\n\n"
                    heartbeat_at = now + 15.0
                await asyncio.sleep(0.2)

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    @router.post("/runs", status_code=status.HTTP_201_CREATED)
    def create_run(
        payload: dict[str, Any] = Body(...),
        idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
    ) -> dict[str, Any]:
        """Create a native durable Run.

        The payload intentionally remains JSON-first so domain plugins can add
        operation-specific fields without changing the platform API.
        """
        forbidden = _find_forbidden_run_key(payload)
        if forbidden:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"{forbidden} is reserved for trusted providers; "
                    "submit an artifact/reference and provider parameters instead"
                ),
            )
        requested_status = str(payload.get("status") or "draft").strip().lower()
        if requested_status not in {"draft", "queued"}:
            raise HTTPException(
                status_code=400,
                detail="public Run creation only accepts draft or queued status",
            )
        try:
            item = repository.create_run(
                payload,
                idempotency_key=idempotency_key or payload.get("idempotency_key"),
            )
        except ValueError as exc:
            detail = str(exc)
            code = 409 if "already exists" in detail else 400
            raise HTTPException(status_code=code, detail=detail) from exc
        except (TypeError, OverflowError) as exc:
            raise HTTPException(status_code=400, detail="run must be JSON-safe") from exc
        return item

    @router.post("/runs/{run_id}/events", status_code=status.HTTP_201_CREATED)
    def append_event(run_id: str, payload: dict[str, Any] = Body(...)) -> dict[str, Any]:
        event_type = payload.get("event_type") or payload.get("type")
        data = payload.get("data")
        if not isinstance(data, dict):
            data = {}
        try:
            event = repository.append_event(
                run_id,
                str(event_type or ""),
                data,
                stage_id=payload.get("stage_id"),
                created_at=payload.get("created_at"),
            )
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Run not found") from exc
        except (TypeError, OverflowError) as exc:
            raise HTTPException(status_code=400, detail="event data must be JSON-safe") from exc
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        return {"contract_version": CONTRACT_VERSION, "event": event}

    @router.post("/runs/{run_id}/transition")
    def transition_run(run_id: str, payload: dict[str, Any] = Body(...)) -> dict[str, Any]:
        try:
            item = repository.transition(
                run_id,
                str(payload.get("status") or ""),
                phase=payload.get("phase"),
                progress=payload.get("progress"),
                error=payload.get("error") if isinstance(payload.get("error"), dict) else None,
                data=payload.get("data") if isinstance(payload.get("data"), dict) else None,
            )
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Run not found") from exc
        except (TypeError, OverflowError) as exc:
            raise HTTPException(status_code=400, detail="transition data must be JSON-safe") from exc
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        return item

    @router.post("/runs/{run_id}/submit", status_code=status.HTTP_202_ACCEPTED)
    def submit_run(run_id: str) -> dict[str, Any]:
        if executor_service is None:
            raise HTTPException(status_code=503, detail="Executor runtime is unavailable")
        try:
            executor_service.submit(run_id)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Run not found") from exc
        except ValueError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
        item = repository.get_run(run_id)
        assert item is not None
        return item

    @router.post("/runs/{run_id}/pause")
    def pause_run(run_id: str) -> dict[str, Any]:
        return _control(repository, run_id, "pause", executor_service)

    @router.post("/runs/{run_id}/resume")
    def resume_run(
        run_id: str,
        payload: dict[str, Any] = Body(default={}),
    ) -> dict[str, Any]:
        checkpoint_id = payload.get("checkpoint_id") if isinstance(payload, dict) else None
        if checkpoint_id and executor_service is None:
            try:
                repository.mark_resume_requested(run_id, str(checkpoint_id))
            except KeyError as exc:
                raise HTTPException(status_code=404, detail="Run not found") from exc
            except ValueError as exc:
                raise HTTPException(status_code=400, detail=str(exc)) from exc
        if checkpoint_id and executor_service is not None:
            # Bind an explicit checkpoint before the executor transitions the
            # Run.  This keeps the selection durable across a crash between
            # the HTTP request and worker submission.
            try:
                repository.mark_resume_requested(run_id, str(checkpoint_id))
            except KeyError as exc:
                raise HTTPException(status_code=404, detail="Run not found") from exc
            except ValueError as exc:
                raise HTTPException(status_code=400, detail=str(exc)) from exc
        return _control(repository, run_id, "resume", executor_service)

    @router.post("/runs/{run_id}/cancel")
    def cancel_run(run_id: str) -> dict[str, Any]:
        return _control(repository, run_id, "cancel", executor_service)

    @router.post("/runs/{run_id}/clone", status_code=status.HTTP_201_CREATED)
    def clone_run(run_id: str, payload: dict[str, Any] = Body(default={})) -> dict[str, Any]:
        try:
            return repository.clone_run(
                run_id,
                idempotency_key=payload.get("idempotency_key"),
                overrides=payload.get("overrides") if isinstance(payload.get("overrides"), dict) else None,
            )
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Run not found") from exc
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    @router.post("/runs/{run_id}/retry", status_code=status.HTTP_201_CREATED)
    def retry_run(run_id: str, payload: dict[str, Any] = Body(default={})) -> dict[str, Any]:
        try:
            return repository.retry_run(run_id, idempotency_key=payload.get("idempotency_key"))
        except KeyError as exc:
            raise HTTPException(status_code=404, detail="Run not found") from exc
        except ValueError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc

    @router.get("/operations")
    def list_operations() -> dict[str, Any]:
        if sync_operations is not None:
            sync_operations()
        operations = repository.list_operations()
        # Normalize only at the public boundary.  The repository continues
        # returning the provider's original JSON for backwards compatibility
        # with callers that compare or archive the raw descriptor.
        for item in operations:
            item["descriptor"] = normalize_operation_descriptor(
                item.get("descriptor"),
                operation=item.get("operation"),
            )
        return {
            "contract_version": CONTRACT_VERSION,
            "operations": operations,
            "message": "Operation providers register JSON descriptors during startup.",
        }

    @router.get("/operations/{operation}")
    def get_operation(
        operation: str,
        provider_id: str | None = Query(default=None),
    ) -> dict[str, Any]:
        """Return one stable Operation Descriptor.

        Provider selection is explicit when ``provider_id`` is supplied;
        otherwise the repository chooses the deterministic default provider.
        """
        if sync_operations is not None:
            sync_operations()
        item = repository.get_operation(operation, provider_id=provider_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Operation not found")
        item["descriptor"] = normalize_operation_descriptor(
            item.get("descriptor"),
            operation=item.get("operation"),
        )
        return {"contract_version": CONTRACT_VERSION, **item}

    @router.post("/operations/{operation}/validate")
    def validate_operation_input(
        operation: str,
        payload: Any = Body(default={}),
        provider_id: str | None = Query(default=None),
    ) -> dict[str, Any]:
        """Validate JSON input against a provider's declared input schema.

        Validation intentionally covers the portable JSON-Schema subset in
        ``runtime.descriptors``.  Providers can still perform richer domain
        checks when a Run is submitted.
        """
        if sync_operations is not None:
            sync_operations()
        item = repository.get_operation(operation, provider_id=provider_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Operation not found")
        item["descriptor"] = normalize_operation_descriptor(
            item.get("descriptor"),
            operation=item.get("operation"),
        )
        descriptor = item.get("descriptor") or {}
        schema = descriptor.get("input_schema") or {"type": "object"}
        errors = validate_json_schema(payload, schema)
        return {
            "contract_version": CONTRACT_VERSION,
            "operation": item["operation"],
            "provider_id": item.get("provider_id"),
            "valid": not errors,
            "errors": errors,
            "schema": schema,
        }

    @router.get("/resource-pools")
    def list_resource_pools() -> dict[str, Any]:
        """Return a provider-neutral snapshot of local execution capacity.

        The local pool reports executor capacity plus durable project policies
        and lease support.  Remote/HPC pools, host-wide telemetry and license
        accounting remain extension points without changing this public shape.
        """
        if executor_service is None:
            return {
                "contract_version": CONTRACT_VERSION,
                "resource_pools": [],
            }
        started = _executor_started()
        max_workers = getattr(executor_service, "max_workers", None)
        try:
            max_workers = int(max_workers) if max_workers is not None else None
        except (TypeError, ValueError):
            max_workers = None
        snapshot_fn = getattr(executor_service, "snapshot", None)
        snapshot = snapshot_fn() if callable(snapshot_fn) else {}
        if not isinstance(snapshot, dict):
            snapshot = {}

        def _counter(name: str, fallback: Any = 0) -> int:
            value = snapshot.get(name, getattr(executor_service, name, fallback))
            try:
                return max(0, int(value() if callable(value) else value))
            except (TypeError, ValueError):
                return max(0, int(fallback or 0))

        # Prefer explicit executor snapshot counters while retaining
        # compatibility with host executors that only expose properties.
        active_runs = _counter("active")
        submitted_runs = _counter("submitted", active_runs)
        pending_runs = _counter("pending", max(0, submitted_runs - active_runs))
        registered_operations = _counter("registered_operations")
        counts = {
            state: len(repository.list_runs(status=state, limit=500))
            for state in ("queued", "preparing", "running", "paused", "cancelling")
        }
        return {
            "contract_version": CONTRACT_VERSION,
            "resource_pools": [
                {
                    "pool_id": "local",
                    "kind": "process-local",
                    "status": "ready" if started else "stopped",
                    "max_workers": max_workers,
                    "active_workers": active_runs,
                    "submitted_runs": int(submitted_runs),
                    "pending_runs": int(pending_runs),
                    "available_workers": (
                        max(0, max_workers - active_runs)
                        if max_workers is not None
                        else None
                    ),
                    "registered_operations": registered_operations,
                    "queue": counts,
                    "supports": {
                        "pause": True,
                        "cancel": True,
                        "resume": True,
                        "checkpoint_resume": True,
                        "restart_recovery": True,
                        "resource_sampling": False,
                        "license_leases": False,
                        "project_concurrency": True,
                        "resource_leases": True,
                    },
                }
            ],
        }

    @router.get("/queue/policies")
    def list_queue_policies() -> dict[str, Any]:
        """Return durable project scheduling policies."""
        return {
            "contract_version": CONTRACT_VERSION,
            "policies": repository.list_project_queue_policies(),
        }

    @router.get("/queue/policies/{project_id}")
    def get_queue_policy(project_id: str) -> dict[str, Any]:
        try:
            policy = repository.get_project_queue_policy(project_id)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        if policy is None:
            raise HTTPException(status_code=404, detail="Queue policy not found")
        return {"contract_version": CONTRACT_VERSION, "policy": policy}

    @router.put("/queue/policies/{project_id}")
    def put_queue_policy(project_id: str, payload: dict[str, Any] = Body(...)) -> dict[str, Any]:
        try:
            policy = repository.upsert_project_queue_policy(
                project_id,
                max_concurrency=payload.get("max_concurrency"),
                weight=payload.get("weight", 1.0),
                resource_limits=payload.get("resource_limits"),
                enabled=payload.get("enabled", True),
            )
        except (TypeError, ValueError) as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        return {"contract_version": CONTRACT_VERSION, "policy": policy}

    @router.delete("/queue/policies/{project_id}")
    def delete_queue_policy(project_id: str) -> dict[str, Any]:
        try:
            deleted = repository.delete_project_queue_policy(project_id)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        if not deleted:
            raise HTTPException(status_code=404, detail="Queue policy not found")
        return {"contract_version": CONTRACT_VERSION, "deleted": True, "project_id": project_id}

    @router.get("/resource-leases")
    def list_resource_leases(
        run_id: str | None = Query(default=None),
        project_id: str | None = Query(default=None),
        state: str | None = Query(default=None),
        limit: int = Query(default=100, ge=1, le=500),
    ) -> dict[str, Any]:
        try:
            leases = repository.list_resource_leases(
                run_id=run_id, project_id=project_id, state=state, limit=limit
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        return {"contract_version": CONTRACT_VERSION, "leases": leases}

    @router.post("/resource-leases/{lease_id}/release")
    def release_resource_lease(lease_id: str) -> dict[str, Any]:
        try:
            lease = repository.release_resource_lease(lease_id, reason="api_request")
        except ValueError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
        if lease is None:
            raise HTTPException(status_code=404, detail="Resource lease not found")
        return {"contract_version": CONTRACT_VERSION, "lease": lease}

    @router.get("/queue")
    def queue_snapshot() -> dict[str, Any]:
        """Return a compact queue snapshot for dashboards and diagnostics."""
        states = ("draft", "queued", "preparing", "running", "paused", "cancelling", "retry_wait")
        counts = {state: len(repository.list_runs(status=state, limit=500)) for state in states}
        snapshot = {}
        if executor_service is not None:
            getter = getattr(executor_service, "snapshot", None)
            if callable(getter):
                value = getter()
                if isinstance(value, dict):
                    snapshot = value
        return {
            "contract_version": CONTRACT_VERSION,
            "counts": counts,
            "executor_started": _executor_started(),
            "max_workers": getattr(executor_service, "max_workers", None)
            if executor_service is not None
            else None,
            "executor": snapshot,
            "policies": repository.list_project_queue_policies(),
            "active_leases": repository.list_resource_leases(state="active", limit=500),
        }

    return router


def _control(
    repository: RunRepository,
    run_id: str,
    action: str,
    executor_service: Any | None = None,
) -> dict[str, Any]:
    try:
        if executor_service is not None:
            return executor_service.control(run_id, action)
        return repository.control(run_id, action)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Run not found") from exc
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


__all__ = ["build_router"]
