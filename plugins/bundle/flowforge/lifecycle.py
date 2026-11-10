# -*- coding: utf-8 -*-
"""One service entry point for root, nested and resumed workflow runs.

The lifecycle lock serializes admission/resume/cancel in this service instance.
It is not a distributed lease; separate processes must not share this runner.
"""

from __future__ import annotations

import asyncio
import copy
import logging
import os
import time
from concurrent.futures import CancelledError as FutureCancelledError
from typing import Any, Callable, TYPE_CHECKING
from uuid import UUID, uuid4

from .engine import (
    ProgressEvent,
    ProgressRegistry,
    WorkflowResult,
    WorkflowStatus,
    load,
)
from .engine.progress import NodeStatus
from .invocation import MAX_WORKFLOW_DEPTH, current_run, workflow_stack
from .flow_repository import RevisionConflict
from .inspection import (
    credential_values,
    node_details,
    redact_transport,
    transport_credential_values,
)

logger = logging.getLogger(__name__)

PAUSED = {"paused", "waiting_human"}


class ResumeInputError(ValueError):
    """Invalid review input must not consume a paused continuation."""


if TYPE_CHECKING:
    from .engine import WorkflowDocument
    from .service import RunHandle


def _snapshot_run(
    payload: dict[str, Any],
    inputs: dict[str, Any],
) -> tuple[dict[str, Any], WorkflowDocument, dict[str, Any]]:
    from .engine import canonicalize

    payload = copy.deepcopy(canonicalize(payload))
    return payload, load(payload), copy.deepcopy(inputs)


class RunLifecycleMixin:
    """Run management for WorkflowService; storage and executor are
    injected.
    """

    def start_run(
        self,
        flow_id: str,
        inputs: dict[str, Any] | None = None,
        *,
        on_event: Callable[[ProgressEvent], None] | None = None,
        trigger_type: str | None = None,
        agent_id: str | None = None,
        debug_options: dict[str, Any] | None = None,
        _captured_payload: dict[str, Any] | None = None,
    ) -> RunHandle:
        with self._lifecycle_lock:
            self._assert_accepting_runs()
            ancestry = workflow_stack.get()
            if flow_id in ancestry:
                raise ValueError(
                    "Recursive workflow invocation: "
                    f"{' -> '.join((*ancestry, flow_id))}",
                )
            if len(ancestry) >= MAX_WORKFLOW_DEPTH:
                raise ValueError(
                    f"Workflow nesting exceeds {MAX_WORKFLOW_DEPTH}",
                )
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
                        "Parent workflow is no longer accepting child runs",
                    )
            payload = (
                copy.deepcopy(_captured_payload)
                if _captured_payload is not None
                else self.get_flow(flow_id)
            )
            if payload is None:
                raise FileNotFoundError(f"flow '{flow_id}' not found")
            from .engine.executor import _merge_schema_input_defaults

            document = load(payload)
            if debug_options is not None:
                from .debugging import debug_document

                document = debug_document(payload, debug_options)
            inputs = _merge_schema_input_defaults(document, inputs or {})
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
                "trigger_type": trigger_type
                or ("agent" if parent_id else "manual"),
                "resumed_from_run_id": None,
                "workflow_stack": [*ancestry, flow_id],
                "user_id": parent.get("user_id") or get_current_user_id(),
                "session_id": parent.get("session_id")
                or get_current_session_id(),
                "agent_id": agent_id
                or (
                    get_current_agent_id()
                    if trigger_type == "agent"
                    else parent.get("agent_id") or get_current_agent_id()
                ),
                "channel": parent.get("channel")
                or get_current_channel()
                or "console",
                "flow_revision": payload.get("revision", 0),
            }
            if debug_options is not None:
                from .debugging import debug_summary

                metadata["trigger_type"] = "debug"
                metadata["debug"] = debug_summary(debug_options)
            return self._submit_run(
                run_id,
                flow_id,
                payload,
                inputs or {},
                metadata,
                on_event=on_event,
                debug_options=debug_options,
            )

    async def start_debug_run(
        self,
        flow_id: str,
        inputs: dict[str, Any] | None = None,
        *,
        mode: str,
        target_node_id: str,
        expected_revision: int,
        pins: dict[str, list[Any]] | None = None,
        node_inputs: dict[str, Any] | None = None,
        agent_id: str | None = None,
    ) -> RunHandle:
        """Admit an isolated test of a saved revision with real runners."""
        from .debugging import (
            debug_document,
            debug_validation_document,
            prepare_debug_plan,
        )
        from .engine.errors import ValidationError

        scope, executor = await self.authoring_executor(agent_id)
        with self._lifecycle_lock:
            payload = self.get_flow(flow_id)
            if payload is None:
                raise FileNotFoundError(f"flow '{flow_id}' not found")
            options = prepare_debug_plan(
                payload,
                executor.node_registry,
                mode=mode,
                target_node_id=target_node_id,
                expected_revision=expected_revision,
                pins=pins,
                node_inputs=node_inputs,
            )
            doc = debug_document(payload, options)
            checked = self.validate_flow(
                debug_validation_document(
                    doc,
                    options,
                    executor.node_registry,
                ).model_dump(),
                executor=executor,
                pinned_node_ids=set(options["pins"]),
            )
            if not checked["ok"]:
                raise ValidationError(
                    "Debug workflow validation failed",
                    errors=checked["errors"],
                )
            return self.start_run(
                flow_id,
                inputs,
                agent_id=scope,
                debug_options=options,
                _captured_payload=payload,
            )

    def resume_run(
        self,
        run_id: str,
        inputs: dict[str, Any] | None = None,
    ) -> RunHandle:
        (
            "Resume exactly one continuation of a paused run "
            "using its saved graph."
        )
        with self._lifecycle_lock:
            self._assert_accepting_runs()
            record = self.get_run_record(run_id)
            if record is None:
                raise FileNotFoundError(f"run '{run_id}' not found")
            persisted = self._execution_repository.get(run_id) or {}
            if persisted.get("resumed_by_run_id"):
                raise RevisionConflict(
                    "Run already resumed; use resumed_by_run_id "
                    "to follow its continuation",
                )
            handle = self._runs.get(run_id)
            if record["status"] not in PAUSED or (
                handle is not None and not handle.is_done
            ):
                raise ValueError(
                    "Only a finalized paused or waiting_human run "
                    "can be resumed",
                )
            flow_id = record["flow_id"]
            # Legacy records predate graph snapshots. Preserve their old
            # behavior.
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
                flow_revision=payload.get(
                    "revision",
                    record.get("flow_revision", 0),
                ),
            )
            if record.get("debug") is not None:
                metadata["debug"] = record["debug"]
            active_parent = current_run.get()
            if active_parent:
                metadata["parent_run_id"] = active_parent["run_id"]
            parent_id = metadata.get("parent_run_id")
            if parent_id:
                parent = self.get_run_record(parent_id)
                if parent and parent["status"] == "cancelled":
                    raise ValueError(
                        "Cannot resume a child of a cancelled run",
                    )
            state_id = UUID(str(record["state_id"]))
            self._validate_resume_inputs(record, payload, inputs or {})
            self._flow_repository.claim_resume(run_id, new_id)
            try:
                self._execution_repository.update(
                    run_id,
                    resumed_by_run_id=new_id,
                )
                result = self._submit_run(
                    new_id,
                    flow_id,
                    payload,
                    inputs or {},
                    metadata,
                    state_id=state_id,
                    debug_options=persisted.get("debug_options"),
                )
            except Exception:
                self._flow_repository.release_resume(run_id, new_id)
                self._execution_repository.update(
                    run_id,
                    resumed_by_run_id=None,
                )
                raise
            return result

    def _validate_resume_inputs(self, record, payload, inputs, *, depth=0):
        if any(str(key).startswith("__") for key in inputs):
            raise ResumeInputError("恢复输入不能包含运行时保留变量。")
        if "approved" in inputs and not isinstance(inputs["approved"], bool):
            raise ResumeInputError("人工审核 approved 必须为布尔值。")
        blocked = [
            node_id
            for node_id, status in record.get("node_statuses", {}).items()
            if status == "blocked"
        ]
        target = inputs.get("node_id")
        if len(blocked) > 1 and target is None:
            raise ResumeInputError("多个节点等待处理，请指定 node_id。")
        if target is not None and (
            not isinstance(target, str) or target not in blocked
        ):
            raise ResumeInputError("node_id 不属于当前等待节点。")
        for node_id in [target] if target else blocked:
            kind = payload.get("nodes", {}).get(node_id, {}).get("class_type")
            if kind == "HumanReviewNode" and not isinstance(
                inputs.get("approved"),
                bool,
            ):
                raise ResumeInputError("人工审核必须提供布尔值 approved。")
            if kind == "SubworkflowNode" and depth < MAX_WORKFLOW_DEPTH:
                entries = [
                    item
                    for item in record.get("execution_history", [])
                    if item.get("node_id") == node_id
                ]
                child_id = next(
                    (
                        item.get("metadata", {}).get("child_run_id")
                        for item in reversed(entries)
                        if item.get("metadata", {}).get("child_run_id")
                    ),
                    None,
                )
                child = (
                    self._execution_repository.get(child_id)
                    if child_id
                    else None
                )
                followed = set()
                while (
                    child
                    and child.get("resumed_by_run_id")
                    and child["run_id"] not in followed
                ):
                    followed.add(child["run_id"])
                    child = self._execution_repository.get(
                        child["resumed_by_run_id"],
                    )
                if child and child.get("status") in PAUSED:
                    decision = inputs.get(
                        "child_inputs",
                        {
                            key: value
                            for key, value in inputs.items()
                            if key != "node_id"
                        },
                    )
                    if not isinstance(decision, dict):
                        raise ResumeInputError(
                            "子流程审核 child_inputs 必须为对象。",
                        )
                    self._validate_resume_inputs(
                        child,
                        child.get("flow_snapshot") or {},
                        decision,
                        depth=depth + 1,
                    )

    async def _execute_run(
        self,
        handle: RunHandle,
        payload: dict[str, Any],
        doc: WorkflowDocument,
        inputs: dict[str, Any],
        metadata: dict[str, Any],
        state_id: UUID | None,
        progress: ProgressRegistry,
        run_id: str,
        debug_options: dict[str, Any] | None = None,
    ) -> WorkflowResult:
        """Prepare the agent and execute under the captured run context."""
        handle.task = asyncio.current_task()
        if handle.cancel_requested or self._closing:
            handle.cancel_requested = True
            raise asyncio.CancelledError()
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
            validation_payload = payload
            if debug_options is not None:
                from .debugging import (
                    debug_document,
                    debug_validation_document,
                )

                doc = debug_document(payload, debug_options)
                validation_payload = debug_validation_document(
                    doc,
                    debug_options,
                    executor.node_registry,
                ).model_dump()
            validation = self.validate_flow(
                validation_payload,
                executor=executor,
                resuming=state_id is not None,
                pinned_node_ids=(
                    set(debug_options["pins"])
                    if debug_options is not None
                    else None
                ),
            )
            if not validation["ok"]:
                raise ValueError(
                    "工作流校验失败：" + "; ".join(validation["errors"]),
                )
            handle.execution_started = True
            if state_id is not None:
                return await executor.resume(
                    doc,
                    state_id,
                    inputs,
                    prompt_id=run_id,
                    progress_registry=progress,
                    extra_data=metadata,
                    **(
                        {"debug_options": debug_options}
                        if debug_options is not None
                        else {}
                    ),
                )
            return await executor.execute_async(
                doc,
                inputs,
                prompt_id=run_id,
                progress_registry=progress,
                extra_data=metadata,
                **(
                    {"debug_options": debug_options}
                    if debug_options is not None
                    else {}
                ),
            )
        finally:
            current_run.reset(run_token)
            workflow_stack.reset(stack_token)

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
        debug_options: dict[str, Any] | None = None,
    ) -> RunHandle:
        from .service import RunHandle

        self._assert_accepting_runs()

        # Snapshot now: neither edits nor deletion of the saved flow may
        # change a continuation.
        payload, doc, inputs = _snapshot_run(payload, inputs)
        progress = ProgressRegistry(prompt_id=run_id)
        self._execution_repository.create(
            run_id,
            flow_id,
            status="queued",
            started_at=time.time(),
            owner_pid=os.getpid(),
            flow_snapshot=payload,
            **(
                {"debug_options": debug_options}
                if debug_options is not None
                else {}
            ),
            **metadata,
        )
        progress.add_handler(
            lambda event: self._execution_repository.append_event(
                run_id,
                event.to_dict(),
            ),
        )
        if on_event is not None:
            progress.add_handler(on_event)
        handle = RunHandle(
            run_id=run_id,
            flow_id=flow_id,
            state_id=state_id or UUID(int=0),
            progress=progress,
            metadata=metadata,
            inspection_secrets=credential_values(
                payload,
                inputs,
                debug_options,
            ),
        )
        self._runs[run_id] = handle

        handle.future = asyncio.run_coroutine_threadsafe(
            self._execute_run(
                handle,
                payload,
                doc,
                inputs,
                metadata,
                state_id,
                progress,
                run_id,
                debug_options,
            ),
            self._loop,
        )

        def done(future):
            with self._lifecycle_lock:
                handle.finished_at = time.time()
                try:
                    try:
                        handle.result = future.result()
                    except FutureCancelledError:
                        if not handle.cancel_requested:
                            raise
                        # Cancellation before executor admission has no engine
                        # result. Publish the same durable terminal contract as
                        # a cancellation after node execution has started.
                        handle.result = WorkflowResult(
                            workflow_id=doc.id or run_id,
                            state_id=handle.state_id,
                            status=WorkflowStatus.CANCELLED,
                            metadata={"prompt_id": run_id},
                        )
                    handle.state_id = handle.result.state_id
                    if handle.cancel_requested:
                        handle.result.status = WorkflowStatus.CANCELLED
                        progress.finish_unfinished(NodeStatus.CANCELLED)
                        events = progress.history()
                        if (
                            not events
                            or events[-1].type != "execution_cancelled"
                        ):
                            progress.emit(
                                ProgressEvent(
                                    type="execution_cancelled",
                                    prompt_id=run_id,
                                    data={
                                        "outputs": handle.result.outputs,
                                        "errors": handle.result.errors,
                                    },
                                ),
                            )
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
                    logger.exception(
                        "workflow_run_failed run_id=%s flow_id=%s",
                        run_id,
                        handle.flow_id,
                    )
                    handle.error = str(exc)
                    status = (
                        "cancelled" if handle.cancel_requested else "failed"
                    )
                    progress.finish_unfinished(NodeStatus(status))
                    progress.emit(
                        ProgressEvent(
                            type=f"execution_{status}",
                            prompt_id=run_id,
                            data={"errors": [str(exc)], "outputs": {}},
                        ),
                    )
                    self._execution_repository.update(
                        run_id,
                        status=status,
                        error=str(exc),
                        finished_at=handle.finished_at,
                        node_statuses=progress.node_statuses(),
                    )
                    # A failed preparation/validation performed no node work.
                    # Release its resume claim so corrected input or a restored
                    # model/tool connection can be retried on the original run.
                    original = metadata.get("resumed_from_run_id")
                    if original and not progress.node_statuses():
                        self._flow_repository.release_resume(original, run_id)
                        parent_record = (
                            self._execution_repository.get(original) or {}
                        )
                        if parent_record.get("resumed_by_run_id") == run_id:
                            self._execution_repository.update(
                                original,
                                resumed_by_run_id=None,
                            )
                finally:
                    handle.finalized = True
                # Failed/cancelled parents must not leave unawaited
                # agent-started children running.
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
            result.pop("debug_options", None)
            if handle is not None:
                result.update(handle.to_dict())
            result["node_details"] = node_details(
                result,
                (record or {}).get("flow_snapshot") or {},
                events=(record or {}).get("events"),
            )
            return result

    async def public_run_redactor(self, run_id: str):
        """Build a public-view filter without modifying executable values."""
        record = self._execution_repository.get(run_id) or {}
        definition = record.get("flow_snapshot") or {}
        node_output_ids = (
            set(definition.get("nodes") or {})
            if definition and not isinstance(definition.get("outputs"), dict)
            else None
        )
        secrets = transport_credential_values(record, node_output_ids)
        handle = self._runs.get(run_id)
        if handle is not None:
            secrets.update(handle.inspection_secrets)
        if self._executor.state_store is not None:
            # The public record's state ID also survives a missing prompt
            # index and continuations that share their parent's checkpoint.
            raw_state_id = record.get("state_id")
            snapshot = None
            if raw_state_id:
                snapshot = await self._executor.state_store.load(
                    UUID(str(raw_state_id)),
                )
            if snapshot is None:
                snapshot = await self._executor.state_store.load_by_prompt_id(
                    run_id,
                )
            # A continuation can publish before its own prompt index is saved;
            # the shared checkpoint still owns the original workflow inputs.
            if snapshot is None and handle is not None and handle.state_id.int:
                snapshot = await self._executor.state_store.load(
                    handle.state_id,
                )
            if snapshot is not None:
                secrets.update(
                    credential_values(
                        snapshot.state.inputs,
                        snapshot.state.variables,
                    ),
                )

        def clean(value):
            secrets.update(transport_credential_values(value, node_output_ids))
            return redact_transport(value, secrets, node_output_ids)

        return clean

    async def get_public_run_record(
        self,
        run_id: str,
    ) -> dict[str, Any] | None:  # noqa: E501
        record = self.get_run_record(run_id)
        if record is None:
            return None
        clean = await self.public_run_redactor(run_id)
        return clean(record)

    def list_runs(self) -> list[dict[str, Any]]:
        with self._lifecycle_lock:
            records = [
                current
                for record in self._execution_repository.list()
                if (current := self.get_run_record(record["run_id"]))
                is not None
            ]
            return sorted(
                records,
                key=lambda record: record.get("started_at") or 0,
                reverse=True,
            )

    def _cancel_children(self, run_id: str) -> None:
        for record in self._execution_repository.list():
            if (
                record.get("parent_run_id") == run_id
                or record.get("resumed_from_run_id") == run_id
            ):
                self.cancel_run(record["run_id"])

    def _finish_cancelled_run(self, run_id, record, handle) -> None:
        # A paused run has no live executor to publish its final
        # node states. Cancel it durably, including after restart.
        progress = handle.progress if handle else ProgressRegistry(run_id)
        if handle is None:
            progress.add_handler(
                lambda event: self._execution_repository.append_event(
                    run_id,
                    event.to_dict(),
                ),
            )
            for node_id, status in record.get("node_statuses", {}).items():
                progress.state(node_id).status = NodeStatus(status)
        progress.finish_unfinished(NodeStatus.CANCELLED)
        progress.emit(
            ProgressEvent(type="execution_cancelled", prompt_id=run_id),
        )
        self._execution_repository.update(
            run_id,
            finished_at=time.time(),
            node_statuses=progress.node_statuses(),
        )

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
                        self._executor.cancel_by_prompt_id,
                        run_id,
                    )
                else:
                    self._finish_cancelled_run(run_id, record, handle)
            self._cancel_children(run_id)
            return True
