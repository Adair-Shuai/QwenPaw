"""One service entry point for root, nested and resumed workflow runs.

The lifecycle lock serializes admission/resume/cancel in this service instance.
It is not a distributed lease; separate processes must not share this runner.
"""

from __future__ import annotations

import asyncio
import copy
import os
import time
from typing import Any, Callable, TYPE_CHECKING
from uuid import UUID, uuid4

from .engine import ProgressEvent, ProgressRegistry, WorkflowStatus, load
from .invocation import MAX_WORKFLOW_DEPTH, current_run, workflow_stack

PAUSED = {"paused", "waiting_human"}

if TYPE_CHECKING:
    from .service import RunHandle


class RunLifecycleMixin:
    """Run management for WorkflowService; storage and executor are injected."""

    def start_run(
        self,
        flow_id: str,
        inputs: dict[str, Any] | None = None,
        *,
        on_event: Callable[[ProgressEvent], None] | None = None,
        trigger_type: str | None = None,
        agent_id: str | None = None,
    ) -> RunHandle:
        with self._lifecycle_lock:
            ancestry = workflow_stack.get()
            if flow_id in ancestry:
                raise ValueError(
                    f"Recursive workflow invocation: {' -> '.join((*ancestry, flow_id))}"
                )
            if len(ancestry) >= MAX_WORKFLOW_DEPTH:
                raise ValueError(f"Workflow nesting exceeds {MAX_WORKFLOW_DEPTH}")
            parent = current_run.get() or {}
            parent_id = parent.get("run_id")
            if parent_id:
                parent_record = self.get_run_record(parent_id)
                if parent_record is None or parent_record["status"] in {
                    "cancelled",
                    "failed",
                    "timeout",
                }:
                    raise ValueError(
                        "Parent workflow is no longer accepting child runs"
                    )
            payload = self.get_flow(flow_id)
            if payload is None:
                raise FileNotFoundError(f"flow '{flow_id}' not found")
            from qwenpaw.app.agent_context import (
                get_current_user_id,
                get_current_session_id,
                get_current_agent_id,
                get_current_channel,
            )

            run_id = str(uuid4())
            metadata = {
                "parent_run_id": parent_id,
                "root_run_id": parent.get("root_run_id") or run_id,
                "trigger_type": trigger_type or ("agent" if parent_id else "manual"),
                "resumed_from_run_id": None,
                "workflow_stack": [*ancestry, flow_id],
                "user_id": parent.get("user_id") or get_current_user_id(),
                "session_id": parent.get("session_id") or get_current_session_id(),
                "agent_id": agent_id
                or (
                    get_current_agent_id()
                    if trigger_type == "agent"
                    else parent.get("agent_id") or get_current_agent_id()
                ),
                "channel": parent.get("channel") or get_current_channel() or "console",
            }
            return self._submit_run(
                run_id, flow_id, payload, inputs or {}, metadata, on_event=on_event
            )

    def resume_run(
        self, run_id: str, inputs: dict[str, Any] | None = None
    ) -> RunHandle:
        """Resume exactly one continuation of a paused run using its saved graph."""
        with self._lifecycle_lock:
            record = self.get_run_record(run_id)
            if record is None:
                raise FileNotFoundError(f"run '{run_id}' not found")
            persisted = self._execution_repository.get(run_id) or {}
            if persisted.get("resumed_by_run_id"):
                raise ValueError(
                    "Run already resumed; use resumed_by_run_id to follow its continuation"
                )
            handle = self._runs.get(run_id)
            if record["status"] not in PAUSED or (
                handle is not None and not handle.is_done
            ):
                raise ValueError(
                    "Only a finalized paused or waiting_human run can be resumed"
                )
            flow_id = record["flow_id"]
            # Legacy records predate graph snapshots. Preserve their old behavior.
            payload = persisted.get("flow_snapshot") or self.get_flow(flow_id)
            if payload is None:
                raise FileNotFoundError(f"flow '{flow_id}' not found")
            new_id = str(uuid4())
            metadata = {
                key: record.get(key)
                for key in (
                    "parent_run_id",
                    "root_run_id",
                    "user_id",
                    "session_id",
                    "workflow_stack",
                    "agent_id",
                    "channel",
                )
            }
            metadata.update(
                root_run_id=metadata.get("root_run_id") or run_id,
                workflow_stack=metadata.get("workflow_stack") or [flow_id],
                trigger_type="resume",
                resumed_from_run_id=run_id,
            )
            active_parent = current_run.get()
            if active_parent:
                metadata["parent_run_id"] = active_parent["run_id"]
            parent_id = metadata.get("parent_run_id")
            if parent_id:
                parent = self.get_run_record(parent_id)
                if parent and parent["status"] == "cancelled":
                    raise ValueError("Cannot resume a child of a cancelled run")
            state_id = UUID(str(record["state_id"]))
            result = self._submit_run(
                new_id, flow_id, payload, inputs or {}, metadata, state_id=state_id
            )
            self._execution_repository.update(run_id, resumed_by_run_id=new_id)
            return result

    def _submit_run(
        self,
        run_id: str,
        flow_id: str,
        payload: dict[str, Any],
        inputs: dict[str, Any],
        metadata: dict[str, Any],
        *,
        state_id: UUID | None = None,
        on_event: Callable[[ProgressEvent], None] | None = None,
    ) -> RunHandle:
        from .service import RunHandle
        from .engine import canonicalize

        # Snapshot now: neither edits nor deletion of the saved flow may change a continuation.
        payload = copy.deepcopy(canonicalize(payload))
        doc = load(payload)
        inputs = copy.deepcopy(inputs)
        progress = ProgressRegistry(prompt_id=run_id)
        self._execution_repository.create(
            run_id,
            flow_id,
            status="queued",
            started_at=time.time(),
            owner_pid=os.getpid(),
            flow_snapshot=payload,
            **metadata,
        )
        progress.add_handler(
            lambda event: self._execution_repository.append_event(
                run_id, event.to_dict()
            )
        )
        if on_event is not None:
            progress.add_handler(on_event)
        handle = RunHandle(
            run_id=run_id,
            flow_id=flow_id,
            state_id=state_id or UUID(int=0),
            progress=progress,
            metadata=metadata,
        )
        self._runs[run_id] = handle

        async def execute():
            stack_token = workflow_stack.set(tuple(metadata["workflow_stack"]))
            run_token = current_run.set({**metadata, "run_id": run_id})
            try:
                self._execution_repository.update(run_id, status="running")
                executor = self._executor
                if self.node_catalog is not None:
                    from qwenpaw.app.agent_context import get_current_agent_id

                    executor = await self.node_catalog.prepare(
                        executor,
                        metadata.get("agent_id") or get_current_agent_id(),
                        {**metadata, "run_id": run_id},
                    )
                if state_id is not None:
                    return await executor.resume(
                        doc,
                        state_id,
                        inputs,
                        prompt_id=run_id,
                        progress_registry=progress,
                        extra_data=metadata,
                    )
                return await executor.execute_async(
                    doc,
                    inputs,
                    prompt_id=run_id,
                    progress_registry=progress,
                    extra_data=metadata,
                )
            finally:
                current_run.reset(run_token)
                workflow_stack.reset(stack_token)

        handle.future = asyncio.run_coroutine_threadsafe(execute(), self._loop)

        def done(future):
            with self._lifecycle_lock:
                handle.finished_at = time.time()
                try:
                    handle.result = future.result()
                    handle.state_id = handle.result.state_id
                    if handle.cancel_requested:
                        handle.result.status = WorkflowStatus.CANCELLED
                    self._execution_repository.update(
                        run_id,
                        state_id=str(handle.state_id),
                        status=handle.result.status.value,
                        finished_at=handle.finished_at,
                        outputs=handle.result.outputs,
                        errors=handle.result.errors,
                        duration_ms=handle.result.duration_ms,
                        execution_history=[
                            entry.model_dump(mode="json")
                            for entry in handle.result.execution_history
                        ],
                        node_statuses=progress.node_statuses(),
                    )
                except Exception as exc:
                    handle.error = str(exc)
                    status = "cancelled" if handle.cancel_requested else "failed"
                    progress.emit(
                        ProgressEvent(
                            type=f"execution_{status}",
                            prompt_id=run_id,
                            data={"errors": [str(exc)], "outputs": {}},
                        )
                    )
                    self._execution_repository.update(
                        run_id,
                        status=status,
                        error=str(exc),
                        finished_at=handle.finished_at,
                    )
                finally:
                    handle.finalized = True
                # Failed/cancelled parents must not leave unawaited agent-started children running.
                if handle.status.value in {"failed", "cancelled", "timeout"}:
                    self._cancel_children(run_id)

        handle.future.add_done_callback(done)
        return handle

    def get_run(self, run_id: str) -> RunHandle | None:
        return self._runs.get(run_id)

    def get_run_record(self, run_id: str) -> dict[str, Any] | None:
        with self._lifecycle_lock:
            record = self._execution_repository.get(run_id)
            handle = self._runs.get(run_id)
            if record is None and handle is None:
                return None
            result = dict(record or {})
            result.pop("flow_snapshot", None)
            if handle is not None:
                result.update(handle.to_dict())
            return result

    def list_runs(self) -> list[dict[str, Any]]:
        with self._lifecycle_lock:
            records = [
                self.get_run_record(record["run_id"])
                for record in self._execution_repository.list()
            ]
            return sorted(
                records, key=lambda record: record.get("started_at") or 0, reverse=True
            )

    def _cancel_children(self, run_id: str) -> None:
        for record in self._execution_repository.list():
            if (
                record.get("parent_run_id") == run_id
                or record.get("resumed_from_run_id") == run_id
            ):
                self.cancel_run(record["run_id"])

    def cancel_run(self, run_id: str) -> bool:
        with self._lifecycle_lock:
            record = self.get_run_record(run_id)
            if record is None:
                return False
            handle = self._runs.get(run_id)
            if record["status"] in {"queued", "running", *PAUSED}:
                if handle is not None:
                    handle.cancel_requested = True
                self._execution_repository.update(run_id, status="cancelled")
                if handle is not None and not handle.is_done:
                    self._loop.call_soon_threadsafe(
                        self._executor.cancel_by_prompt_id, run_id
                    )
            self._cancel_children(run_id)
            return True
