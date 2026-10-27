# -*- coding: utf-8 -*-
"""FlowForge workflow executor.

Ported and focused subset of ``leagent.workflow.engine.executor``.
Combines :class:`ExecutionList`, :class:`NodeRunner`, and the cache set
into a single async pipeline. Entry points:

  * :meth:`WorkflowExecutor.execute`         — run a doc end-to-end.
  * :meth:`WorkflowExecutor.execute_async`   — main entry (accepts prompt_id).
  * :meth:`WorkflowExecutor.resume`          — reattach to a blocked run.
  * :meth:`WorkflowExecutor.cancel`          — mark a state id cancelled.
"""

from __future__ import annotations

import asyncio
import time
from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from .document import WorkflowDocument, load, validate
from .errors import (
    DependencyCycleError,
    ValidationError,
)
from .graph import DynamicPrompt, ExecutionList, ExpandFrame, TopologicalSort
from .io import HiddenHolder, NodeOutput
from .nodes import NodeRegistry, bootstrap
from .runner import NodeRunner
from .caching import BasicCache, CacheKeySetInputSignature
from .progress import (
    NodeStatus,
    ProgressEvent,
    ProgressHandler,
    ProgressRegistry,
)
from .state_store import WorkflowRunSnapshot, WorkflowStateStore
from .types import (
    NodeExecutionResult,
    WorkflowResult,
    WorkflowState,
    WorkflowStatus,
)


def _ensure_document(definition: Any) -> WorkflowDocument:
    """Coerce a dict / str / WorkflowDocument into a WorkflowDocument."""
    if isinstance(definition, WorkflowDocument):
        return definition
    if isinstance(definition, dict):
        return load(definition)
    if isinstance(definition, str):
        return load(definition)
    raise ValidationError(
        f"workflow definition must be WorkflowDocument / dict / str, "
        f"got {type(definition).__name__}",
    )


def _merge_schema_input_defaults(
    doc: WorkflowDocument,
    inputs: dict[str, Any] | None,
) -> dict[str, Any]:
    (
        "Merge workflow schema defaults with "
        "caller-supplied inputs (user wins)."
    )
    defaults: dict[str, Any] = {}
    for spec in doc.inputs or []:
        if not isinstance(spec, dict):
            continue
        name = spec.get("name")
        if not name:
            continue
        key = str(name)
        if "default" in spec:
            defaults[key] = spec["default"]
        elif "value" in spec:
            defaults[key] = spec["value"]
    user = dict(inputs or {})
    if any(str(key).startswith("__") for key in user):
        raise ValidationError("Workflow inputs contain reserved runtime keys")
    merged = {**defaults, **user}
    failures = _schema_input_failures(doc, merged)
    if failures:
        raise ValidationError("Workflow inputs are invalid", errors=failures)
    return merged


def _node_mode(node_def: dict[str, Any]) -> str:
    return str(node_def.get("control", {}).get("mode") or "run")


def _mode_passthrough_output(
    _registry: NodeRegistry,
    node_def: dict[str, Any],
    upstream_values: dict[tuple[str, int], Any],
    _mode: str,
) -> NodeOutput:
    """Mute/bypass: pass the first upstream slot through unchanged."""
    for value in (node_def.get("inputs") or {}).values():
        if (
            isinstance(value, list)
            and len(value) == 2
            and isinstance(value[0], str)
        ):
            val = upstream_values.get((value[0], int(value[1])))
            return NodeOutput(values=(val,))
    return NodeOutput(values=(None,))


def _next_call_idx(exec_list: ExecutionList, node_id: str) -> int:
    """Return the next expand call index for ``node_id``."""
    # Best-effort: count ephemeral children whose prefix matches.
    count = 0
    prompt = exec_list.prompt
    for eid in prompt.ephemeral_ids:
        if eid.startswith(f"{node_id}:"):
            count += 1
    return count


def _sanitize_ui(ui: Any) -> Any:
    """Make ``ui`` JSON-serialisable before emitting over SSE."""
    if ui is None:
        return None
    if isinstance(ui, (str, int, float, bool)):
        return ui
    try:
        import json

        return json.loads(json.dumps(ui, default=str))
    except Exception:
        return str(ui)


def _schema_input_failures(
    doc: WorkflowDocument,
    merged: dict[str, Any],
) -> list[str]:
    from jsonschema import Draft202012Validator
    from jsonschema.exceptions import SchemaError

    failures: list[str] = []
    for spec in doc.inputs or []:
        if not isinstance(spec, dict) or not spec.get("name"):
            continue
        name = str(spec["name"])
        if name not in merged:
            if spec.get("required") is True:
                failures.append(f"required workflow input '{name}' is missing")
            continue
        schema = {
            key: value
            for key, value in spec.items()
            if key not in {"name", "label", "value"}
        }
        if isinstance(schema.get("required"), bool):
            schema.pop("required")
        try:
            Draft202012Validator.check_schema(schema)
            for error in Draft202012Validator(schema).iter_errors(
                merged[name],
            ):
                path = ".".join(str(item) for item in error.path)
                failures.append(
                    (
                        f"input '"
                        f"{name}"
                        f"{('.' + path if path else '')}"
                        f"': "
                        f"{error.message}"
                    ),
                )
        except SchemaError as exc:
            failures.append(
                f"input '{name}' has an invalid schema: {exc.message}",
            )
    return failures


def _restore_scheduler(
    doc: WorkflowDocument,
    resume_state: WorkflowState | None,
    state: WorkflowState,
    exec_list: ExecutionList,
    topo: TopologicalSort,
    upstream_values: dict[tuple[str, int], Any],
) -> None:
    saved_scheduler = (
        state.metadata.get("scheduler_checkpoint")
        if resume_state is not None
        else None
    )
    saved_completed = (
        set(saved_scheduler.get("completed", []))
        if isinstance(saved_scheduler, dict)
        else None
    )
    if resume_state is not None:
        for entry in state.execution_history:
            if (
                entry.status == WorkflowStatus.COMPLETED
                and entry.node_id in doc.nodes
                and (
                    saved_completed is None or entry.node_id in saved_completed
                )
            ):
                exec_list.state.completed.add(entry.node_id)
                values = state.outputs.get(entry.node_id, entry.output)
                if not isinstance(values, tuple):
                    values = (
                        tuple(values)
                        if isinstance(values, list)
                        else (values,)
                    )
                for slot, value in enumerate(values):
                    upstream_values[(entry.node_id, slot)] = value

    if isinstance(saved_scheduler, dict):
        exec_list.state.skipped.update(saved_scheduler.get("skipped", []))
        for node_id, successors in saved_scheduler.get(
            "active_successors",
            {},
        ).items():
            topo.set_active_successors(node_id, successors)
        exec_list.state.pruned_edges.update(
            tuple(edge) for edge in saved_scheduler.get("pruned_edges", [])
        )
    elif resume_state is not None:
        # Backward-compatible restoration of earlier checkpoint format.
        for entry in state.execution_history:
            definition = doc.nodes.get(entry.node_id) or {}
            if entry.status == WorkflowStatus.COMPLETED and (
                entry.next_node is not None
                or definition.get("class_type") == "ConditionNode"
            ):
                exec_list.select_branch(entry.node_id, entry.next_node)


def _route_node_output(
    exec_list: ExecutionList,
    node_id: str,
    class_type: str,
    output: NodeOutput,
) -> None:
    if output.expand:
        frame = ExpandFrame(
            parent_id=node_id,
            call_idx=_next_call_idx(exec_list, node_id),
            nodes=output.expand.get("nodes", {}),
        )
        added = exec_list.prompt.add_expanded(frame)
        for nid in added:
            exec_list.add_node(nid)

    exec_list.skip_unused_error_handler(node_id)
    allow_reopen = class_type in ("IterativeRefineNode", "LoopNode")
    if output.next_node is not None or class_type == "ConditionNode":
        exec_list.select_branch(node_id, output.next_node)
        # Mark this routing node completed so the scheduler can finish
        # (otherwise it stays in_progress and is_done() never flips).
        exec_list.complete_node_execution(node_id)
        if output.next_node:
            exec_list.reopen_or_add(
                output.next_node,
                allow_reopen=allow_reopen,
            )
    else:
        exec_list.complete_node_execution(node_id)
        for succ in exec_list.topo.successors_of(node_id):
            exec_list.add_node(succ)


def _apply_resume_payload(
    snapshot: WorkflowRunSnapshot,
    doc: WorkflowDocument,
    inputs: dict[str, Any] | None,
) -> None:
    resume_payload = dict(inputs or {})
    target = resume_payload.pop("node_id", None)
    if len(snapshot.blocked_nodes) > 1 and target is None:
        raise ValueError(
            "node_id is required when multiple nodes await review",
        )
    if target is not None and target not in snapshot.blocked_nodes:
        raise ValueError("node_id does not identify a blocked node")
    review_nodes = [target] if target else snapshot.blocked_nodes
    for node_id in review_nodes:
        definition = doc.nodes.get(node_id) or {}
        if definition.get(
            "class_type",
        ) == "HumanReviewNode" and not isinstance(
            resume_payload.get("approved"),
            bool,
        ):
            raise ValueError(
                "review decision requires a boolean approved field",
            )
        snapshot.state.variables[f"__resume__{node_id}"] = resume_payload


def _finish_execution_status(
    state: WorkflowState,
    errors_list: list[str],
) -> None:
    if state.status == WorkflowStatus.TIMEOUT:
        pass
    elif errors_list:
        state.status = WorkflowStatus.FAILED
    elif state.status not in (
        WorkflowStatus.WAITING_HUMAN,
        WorkflowStatus.PAUSED,
        WorkflowStatus.CANCELLED,
    ):
        state.status = WorkflowStatus.COMPLETED


class _ContextShim:
    """Tiny adapter that lets nodes reach back into the executor.

    Used by :class:`ToolNode` / :class:`AgentNode` to resolve the
    host's tool context / agent runtime without leaking the executor
    itself onto :class:`HiddenHolder`.
    """

    def __init__(self, executor: "WorkflowExecutor") -> None:
        self._executor = executor

    @property
    def tool_context(self) -> Any:
        return self._executor.tool_registry

    @property
    def tool_executor(self) -> Any:
        return self._executor.tool_executor

    @property
    def agent_runtime(self) -> Any:
        return self._executor.agent_runtime

    @property
    def agent_controller(self) -> Any:
        return self._executor.agent_controller

    @property
    def llm_service(self) -> Any:
        return self._executor.llm_service

    @property
    def workflow_registry(self) -> Any:
        return self._executor.workflow_registry

    @property
    def workflow_service(self) -> Any:
        return getattr(self._executor, "workflow_service", None)

    @property
    def tool_registry(self) -> Any:
        return self._executor.tool_registry

    def get_tool_context(self, state: Any = None) -> Any:
        """Delegate to the tool executor's context resolver if available."""
        te = self._executor.tool_executor
        if te is not None and hasattr(te, "get_tool_context"):
            return te.get_tool_context(state)
        return state


class WorkflowExecutor:
    """Orchestrates a single workflow execution.

    Keeps only transient state; a long-lived instance is safe to reuse
    across runs.
    """

    def __init__(
        self,
        *,
        tool_registry: Any = None,
        tool_executor: Any = None,
        llm_service: Any = None,
        review_service: Any = None,
        workflow_registry: Any = None,
        agent_controller: Any = None,
        agent_runtime: Any = None,
        node_registry: NodeRegistry | None = None,
        progress_handlers: list[ProgressHandler] | None = None,
        state_store: WorkflowStateStore | None = None,
        max_parallelism: int = 8,
    ) -> None:
        self.tool_registry = tool_registry
        self.tool_executor = tool_executor
        self.llm_service = llm_service
        self.review_service = review_service
        self.workflow_registry = workflow_registry
        self.agent_controller = agent_controller
        self.agent_runtime = agent_runtime
        self.node_registry = node_registry or bootstrap()
        self._progress_handlers: list[ProgressHandler] = list(
            progress_handlers or [],
        )
        self._active_lists: dict[str, ExecutionList] = {}
        self._states: dict[str, WorkflowState] = {}
        self._abort_events: dict[str, asyncio.Event] = {}
        self._pending_prompt_cancellations: set[str] = set()
        self.state_store = state_store
        self.max_parallelism = max(1, int(max_parallelism or 1))

    # ------------------------------------------------------------------
    # Convenience facade
    # ------------------------------------------------------------------
    async def execute(
        self,
        definition: Any,
        inputs: dict[str, Any] | None = None,
    ) -> WorkflowResult:
        """Run a workflow and return a :class:`WorkflowResult`."""
        doc = _ensure_document(definition)
        prompt_id = str(uuid4())
        return await self.execute_async(doc, inputs or {}, prompt_id=prompt_id)

    async def execute_async(
        self,
        doc: WorkflowDocument,
        inputs: dict[str, Any],
        *,
        prompt_id: str,
        extra_data: dict[str, Any] | None = None,
        outputs_to_execute: list[str] | None = None,
        resume_state: WorkflowState | None = None,
        abort_event: asyncio.Event | None = None,
        progress_registry: ProgressRegistry | None = None,
    ) -> WorkflowResult:
        """Main entry point.

        ``resume_state`` continues a paused run on its existing state so
        accumulated variables survive into the re-run. ``abort_event``
        lets a parent run share its abort signal with the child.
        """
        vr = validate(doc, registry=self.node_registry)
        ok, output_nodes, errors = vr.ok, vr.output_nodes, vr.errors
        if not ok:
            raise ValidationError("Workflow validation failed", errors=errors)

        if outputs_to_execute:
            output_nodes = [
                n for n in outputs_to_execute if n in doc.nodes
            ] or output_nodes

        state = self._prepare_state(
            doc,
            inputs,
            prompt_id,
            extra_data,
            resume_state,
        )

        state_id = str(state.id)
        self._states[state_id] = state

        if abort_event is None:
            abort_event = self._abort_events.get(state_id) or asyncio.Event()
        self._abort_events[state_id] = abort_event
        if prompt_id in self._pending_prompt_cancellations:
            abort_event.set()
            state.status = WorkflowStatus.CANCELLED
            self._pending_prompt_cancellations.discard(prompt_id)

        progress = progress_registry or ProgressRegistry(prompt_id=prompt_id)
        for h in self._progress_handlers:
            progress.add_handler(h)
        progress.emit(
            ProgressEvent(
                type="execution_start",
                prompt_id=prompt_id,
                data={"workflow_id": doc.id, "outputs": output_nodes},
            ),
        )

        prompt = DynamicPrompt(doc.nodes)
        topo = TopologicalSort(prompt)
        exec_list = ExecutionList(prompt, topo)
        self._active_lists[state_id] = exec_list
        upstream_values: dict[tuple[str, int], Any] = {}

        # Resume from the durable checkpoint: completed nodes stay completed
        # and their output slots are restored, while the blocked node is
        # intentionally left pending so it can consume the resume payload.
        _restore_scheduler(
            doc,
            resume_state,
            state,
            exec_list,
            topo,
            upstream_values,
        )

        for out_id in output_nodes:
            exec_list.add_node(out_id)

        if cycles := exec_list.detect_cycles():
            raise DependencyCycleError(f"Dependency cycles detected: {cycles}")

        output_cache = BasicCache()
        runner = NodeRunner(
            registry=self.node_registry,
            output_cache=output_cache,
            object_cache=BasicCache(),
            cache_keys=CacheKeySetInputSignature(
                doc.nodes,
                registry=self.node_registry,
            ),
            progress=progress,
        )
        hidden = HiddenHolder(
            prompt=doc.nodes,
            dynprompt=prompt,
            execution_id=prompt_id,
            user_id=(extra_data or {}).get("user_id"),
            session_id=(extra_data or {}).get("session_id"),
            tool_context=_ContextShim(self),
            llm_service=self.llm_service,
            review_service=self.review_service,
            agent_runtime=self.agent_runtime,
            workflow_state=state,
            progress=progress,
            abort_event=abort_event,
            extra_data=extra_data,
        )

        start_ts = time.monotonic()
        errors_list: list[str] = []
        try:
            await self._run_loop(
                exec_list,
                runner,
                doc,
                hidden,
                state,
                upstream_values,
                progress,
                prompt_id,
                errors_list,
            )
        except asyncio.CancelledError:
            state.status = WorkflowStatus.CANCELLED
            exec_list.cancel()
        finally:
            self._active_lists.pop(state_id, None)
            self._abort_events.pop(state_id, None)

        duration_ms = int((time.monotonic() - start_ts) * 1000)
        state.completed_at = datetime.utcnow()

        _finish_execution_status(state, errors_list)

        if state.status in {WorkflowStatus.CANCELLED, WorkflowStatus.TIMEOUT}:
            progress.finish_unfinished(NodeStatus(state.status.value))
        await self._persist_run_snapshot(state, prompt_id, exec_list)
        resolved_outputs = self._resolve_outputs(doc, state, output_nodes)
        progress.emit(
            ProgressEvent(
                type=(
                    "execution_success"
                    if state.status == WorkflowStatus.COMPLETED
                    else f"execution_{state.status.value}"
                ),
                prompt_id=prompt_id,
                data={
                    "duration_ms": duration_ms,
                    "outputs": resolved_outputs,
                    "errors": errors_list,
                },
            ),
        )

        self._states.pop(state_id, None)
        return WorkflowResult(
            workflow_id=doc.id or prompt_id,
            state_id=state.id,
            status=state.status,
            outputs=resolved_outputs or dict(state.outputs),
            errors=errors_list,
            execution_history=list(state.execution_history),
            duration_ms=duration_ms,
            metadata={"prompt_id": prompt_id},
        )

    def _prepare_state(
        self,
        doc: WorkflowDocument,
        inputs: dict[str, Any],
        prompt_id: str,
        extra_data: dict[str, Any] | None,
        resume_state: WorkflowState | None,
    ) -> WorkflowState:
        merged_inputs = _merge_schema_input_defaults(
            doc,
            resume_state.inputs if resume_state is not None else inputs,
        )

        if resume_state is not None:
            state = resume_state
            state.status = WorkflowStatus.RUNNING
            state.completed_at = None
            for key, value in merged_inputs.items():
                state.variables.setdefault(key, value)
        else:
            state = WorkflowState(
                workflow_id=doc.id or prompt_id,
                status=WorkflowStatus.RUNNING,
                inputs=dict(merged_inputs),
                variables=dict(merged_inputs),
                started_at=datetime.utcnow(),
            )

        if extra_data:
            state.metadata.update(
                {k: v for k, v in extra_data.items() if v is not None},
            )
        state.metadata["prompt_id"] = prompt_id
        if doc.metadata:
            state.metadata.update(
                {
                    k: v
                    for k, v in doc.metadata.items()
                    if v is not None
                    and k
                    not in {
                        "scheduler_checkpoint",
                        "refine_counters",
                        "subworkflow_runs",
                        "prompt_id",
                    }
                },
            )

        return state

    # ------------------------------------------------------------------
    # Main scheduler loop
    # ------------------------------------------------------------------
    async def _run_ready_batch(
        self,
        batch: list[str],
        max_par: int,
        deadline: float | None,
        exec_list: ExecutionList,
        runner: NodeRunner,
        hidden: HiddenHolder,
        upstream_values: dict[tuple[str, int], Any],
        progress: ProgressRegistry,
        state: WorkflowState,
        errors_list: list[str],
        prompt_id: str,
        doc: WorkflowDocument,
    ) -> list[
        tuple[str, dict[str, Any] | None, Any | None, Exception | None]
    ] | None:
        sem = asyncio.Semaphore(max_par)

        async def _guarded(
            nid: str,
        ) -> tuple[str, dict[str, Any] | None, Any | None, Exception | None]:
            async with sem:
                return await self._execute_node(
                    nid,
                    exec_list,
                    runner,
                    hidden,
                    upstream_values,
                    progress,
                )

        gather_coro = asyncio.gather(
            *[_guarded(nid) for nid in batch],
        )
        abort_wait = asyncio.create_task(hidden.abort_event.wait())
        try:
            remaining = (
                max(0.0, deadline - time.monotonic())
                if deadline is not None
                else None
            )
            done, _ = await asyncio.wait(
                [gather_coro, abort_wait],
                timeout=remaining,
                return_when=asyncio.FIRST_COMPLETED,
            )
            if abort_wait in done:
                gather_coro.cancel()
                await asyncio.gather(gather_coro, return_exceptions=True)
                state.status = WorkflowStatus.CANCELLED
                exec_list.cancel()
                return None
            if gather_coro not in done:
                gather_coro.cancel()
                await asyncio.gather(gather_coro, return_exceptions=True)
                errors_list.append("workflow timed out")
                state.error_stack.append("workflow timed out")
                state.status = WorkflowStatus.TIMEOUT
                exec_list.cancel()
                progress.emit(
                    ProgressEvent(
                        type="execution_timeout",
                        prompt_id=prompt_id,
                        data={"timeout_sec": self._timeout_sec(doc)},
                    ),
                )
                return None
            results = await gather_coro
        finally:
            abort_wait.cancel()
            if not gather_coro.done():
                gather_coro.cancel()
            await asyncio.gather(
                abort_wait,
                gather_coro,
                return_exceptions=True,
            )

        return results

    async def _run_loop(
        self,
        exec_list: ExecutionList,
        runner: NodeRunner,
        doc: WorkflowDocument,
        hidden: HiddenHolder,
        state: WorkflowState,
        upstream_values: dict[tuple[str, int], Any],
        progress: ProgressRegistry,
        prompt_id: str,
        errors_list: list[str],
    ) -> None:
        start_id = doc.start_id
        if start_id and start_id in doc.nodes:
            exec_list.add_node(start_id)
        deadline = self._compute_deadline(doc)
        max_par = self.max_parallelism

        while not exec_list.is_done():
            if hidden.abort_event is not None and hidden.abort_event.is_set():
                state.status = WorkflowStatus.CANCELLED
                exec_list.cancel()
                return
            if deadline is not None and time.monotonic() > deadline:
                errors_list.append("workflow timed out")
                state.error_stack.append("workflow timed out")
                state.status = WorkflowStatus.TIMEOUT
                exec_list.cancel()
                progress.emit(
                    ProgressEvent(
                        type="execution_timeout",
                        prompt_id=prompt_id,
                        data={"timeout_sec": self._timeout_sec(doc)},
                    ),
                )
                return

            batch = await exec_list.stage_ready_batch(limit=max_par)
            if not batch:
                break

            results = await self._run_ready_batch(
                batch,
                max_par,
                deadline,
                exec_list,
                runner,
                hidden,
                upstream_values,
                progress,
                state,
                errors_list,
                prompt_id,
                doc,
            )
            if results is None:
                return

            paused = False
            for node_id, node_def, result, exc in results:
                state.current_node = node_id
                outcome = await self._apply_node_result(
                    node_id,
                    node_def,
                    result,
                    exc,
                    exec_list=exec_list,
                    state=state,
                    upstream_values=upstream_values,
                    progress=progress,
                    prompt_id=prompt_id,
                    errors_list=errors_list,
                )
                if outcome == "paused":
                    paused = True
            for nid in exec_list.state.skipped:
                if nid not in progress.node_statuses():
                    progress.set_status(nid, NodeStatus.SKIPPED)
            # Save only after all sibling outcomes have been applied, including
            # side effects which completed alongside an approval pause.
            await self._persist_run_snapshot(state, prompt_id, exec_list)
            if paused:
                return

    async def _execute_node(
        self,
        node_id: str,
        exec_list: ExecutionList,
        runner: NodeRunner,
        hidden: HiddenHolder,
        upstream_values: dict[tuple[str, int], Any],
        progress: ProgressRegistry,
    ) -> tuple[str, dict[str, Any] | None, Any | None, Exception | None]:
        """Execute a single staged node (or its mute/bypass passthrough)."""
        node_def = exec_list.prompt.get(node_id)
        if node_def is None:
            return (node_id, None, None, None)
        mode = _node_mode(node_def)
        if mode in ("mute", "bypass"):
            progress.set_status(
                node_id,
                NodeStatus.SKIPPED,
                metadata={"mode": mode},
            )
            result = type(
                "PassthroughResult",
                (),
                {
                    "output": _mode_passthrough_output(
                        self.node_registry,
                        node_def,
                        upstream_values,
                        mode,
                    ),
                    "duration_ms": 0,
                    "cached": False,
                },
            )()
            return (node_id, node_def, result, None)
        try:
            result = await runner.run(
                node_id,
                node_def,
                upstream_values,
                hidden,
            )
            return (node_id, node_def, result, None)
        except Exception as exc:
            return (node_id, node_def, None, exc)

    async def _apply_node_result(
        self,
        node_id: str,
        node_def: dict[str, Any] | None,
        result: Any | None,
        exc: Exception | None,
        *,
        exec_list: ExecutionList,
        state: WorkflowState,
        upstream_values: dict[tuple[str, int], Any],
        progress: ProgressRegistry,
        prompt_id: str,
        errors_list: list[str],
    ) -> str:
        """Apply a node's execution outcome to the scheduler/state."""
        if node_def is None:
            exec_list.complete_node_execution(node_id)
            return "ok"

        control = node_def.get("control", {}) or {}
        class_type = node_def.get("class_type", "")

        if exc is not None:
            message = getattr(exc, "message", str(exc))
            errors_list.append(f"{node_id}: {message}")
            state.error_stack.append(f"{node_id}: {message}")
            exec_list.fail_node_execution(node_id)
            state.record_execution(
                NodeExecutionResult(
                    node_id=node_id,
                    status=WorkflowStatus.FAILED,
                    error=str(exc),
                ),
            )
            if control.get("error_handler"):
                exec_list.select_branch(node_id, control["error_handler"])
                exec_list.add_node(control["error_handler"])
            return "error"

        output: NodeOutput = (
            result.output if result and hasattr(result, "output") else None
        ) or NodeOutput()

        for slot, val in enumerate(output.as_tuple()):
            upstream_values[(node_id, slot)] = val

        if output.error and not (result and getattr(result, "cached", False)):
            errors_list.append(f"{node_id}: {output.error}")
            state.error_stack.append(f"{node_id}: {output.error}")
            exec_list.fail_node_execution(node_id)
            state.record_execution(
                NodeExecutionResult(
                    node_id=node_id,
                    status=WorkflowStatus.FAILED,
                    error=output.error,
                    duration_ms=result.duration_ms if result else 0,
                ),
            )
            if control.get("error_handler"):
                exec_list.select_branch(node_id, control["error_handler"])
                exec_list.add_node(control["error_handler"])
            return "error"

        if output.block_execution:
            exec_list.add_external_block(node_id, output.block_execution)
            state.status = (
                WorkflowStatus.WAITING_HUMAN
                if output.block_execution == "awaiting_review"
                else WorkflowStatus.PAUSED
            )
            state.record_execution(
                NodeExecutionResult(
                    node_id=node_id,
                    status=state.status,
                    output=output.values,
                    duration_ms=result.duration_ms if result else 0,
                    metadata=output.metadata,
                ),
            )
            progress.set_status(node_id, NodeStatus.BLOCKED)
            progress.emit(
                ProgressEvent(
                    type="execution_blocked",
                    prompt_id=prompt_id,
                    node_id=node_id,
                    data={
                        "tag": output.block_execution,
                        "ui": _sanitize_ui(output.ui),
                        "metadata": output.metadata,
                    },
                ),
            )
            return "paused"

        _route_node_output(exec_list, node_id, class_type, output)

        state.record_execution(
            NodeExecutionResult(
                node_id=node_id,
                status=WorkflowStatus.COMPLETED,
                output=output.values,
                duration_ms=result.duration_ms if result else 0,
                metadata=output.metadata,
                next_node=output.next_node,
            ),
        )
        return "ok"

    async def _persist_run_snapshot(
        self,
        state: WorkflowState,
        prompt_id: str,
        exec_list: ExecutionList,
    ) -> None:
        if self.state_store is None:
            return
        state.metadata["scheduler_checkpoint"] = {
            "completed": sorted(exec_list.state.completed),
            "skipped": sorted(exec_list.state.skipped),
            "active_successors": exec_list.topo.active_successors_snapshot(),
            "pruned_edges": sorted(exec_list.state.pruned_edges),
        }
        blocked = list(exec_list.state.blocked.keys())
        snapshot = WorkflowRunSnapshot(
            state=state,
            output_cache=dict(state.outputs),
            dynamic_prompt=exec_list.prompt.snapshot_nodes(),
            blocked_nodes=blocked,
            prompt_id=prompt_id,
        )
        try:
            await self.state_store.save(snapshot)
        except Exception as exc:
            raise RuntimeError(
                "workflow checkpoint could not be persisted",
            ) from exc

    # ------------------------------------------------------------------
    # Resume / cancel
    # ------------------------------------------------------------------
    async def resume(
        self,
        definition: Any,
        state_id: UUID,
        inputs: dict[str, Any] | None = None,
        *,
        prompt_id: str | None = None,
        progress_registry: ProgressRegistry | None = None,
        extra_data: dict[str, Any] | None = None,
    ) -> WorkflowResult:
        """Resume a paused run from its persisted snapshot."""
        if self.state_store is None:
            raise RuntimeError("resume requires a state_store")
        snapshot = await self.state_store.load(state_id)
        if snapshot is None:
            raise RuntimeError(f"no snapshot for state_id {state_id}")
        if snapshot.state.status not in (
            WorkflowStatus.PAUSED,
            WorkflowStatus.WAITING_HUMAN,
        ):
            raise ValueError(
                "only paused or waiting_human runs can be resumed",
            )
        doc = _ensure_document(definition)
        if snapshot.state.workflow_id != doc.id:
            raise ValueError("checkpoint belongs to another workflow")
        if snapshot.dynamic_prompt:
            doc = doc.model_copy(deep=True)
            doc.nodes.update(snapshot.dynamic_prompt)
        pid = prompt_id or snapshot.prompt_id or str(uuid4())
        _apply_resume_payload(snapshot, doc, inputs)
        return await self.execute_async(
            doc,
            {},
            prompt_id=pid,
            resume_state=snapshot.state,
            progress_registry=progress_registry,
            extra_data=extra_data or snapshot.state.metadata,
        )

    def resource_snapshot(self) -> dict[str, int]:
        """Report live scheduler resources without exposing mutable maps."""
        return {
            "active_runs": len(self._active_lists),
            "abort_waiters": len(self._abort_events),
        }

    def cancel(self, state_id: UUID | str) -> bool:
        """Mark a run cancelled. Returns True if the run was active."""
        sid = str(state_id)
        exec_list = self._active_lists.get(sid)
        if exec_list is None:
            return False
        abort_event = self._abort_events.get(sid)
        if abort_event is not None:
            abort_event.set()
        exec_list.cancel()
        state = self._states.get(sid)
        if state is not None and state.status not in (
            WorkflowStatus.COMPLETED,
            WorkflowStatus.FAILED,
        ):
            state.status = WorkflowStatus.CANCELLED
        return True

    def cancel_by_prompt_id(self, prompt_id: str) -> bool:
        """Cancel the active state correlated with a public run id."""
        for sid, state in list(self._states.items()):
            if state.metadata.get("prompt_id") == prompt_id:
                return self.cancel(sid)
        # Cancellation can race with coroutine startup. Remember it so the
        # run observes the abort signal as soon as its state is registered.
        self._pending_prompt_cancellations.add(prompt_id)
        return True

    # ------------------------------------------------------------------
    # Outputs + deadline helpers
    # ------------------------------------------------------------------
    def _resolve_outputs(
        self,
        doc: WorkflowDocument,
        state: WorkflowState,
        inferred_output_nodes: list[str] | None = None,
    ) -> dict[str, Any]:
        (
            "Resolve declared outputs from "
            "``doc.outputs`` against final state."
        )
        result: dict[str, Any] = {}
        if isinstance(doc.outputs, list):
            names = doc.outputs or list(inferred_output_nodes or [])
            for name in names:
                if name in state.outputs:
                    val = state.outputs[name]
                    # Unwrap single-slot tuples so OutputNode's declared
                    # value surfaces as a scalar (matches LeAgent semantics).
                    if isinstance(val, (tuple, list)) and len(val) == 1:
                        val = val[0]
                    result[name] = val
                elif name in state.variables:
                    result[name] = state.variables[name]
        elif isinstance(doc.outputs, dict):
            for key, spec in doc.outputs.items():
                if isinstance(spec, str):
                    result[key] = state.resolve_template(spec)
                else:
                    result[key] = state.outputs.get(key)
        return result

    def _compute_deadline(self, doc: WorkflowDocument) -> float | None:
        timeout = self._timeout_sec(doc)
        if timeout is None:
            return None
        return time.monotonic() + timeout

    def _timeout_sec(self, doc: WorkflowDocument) -> float | None:
        raw = (doc.metadata or {}).get("timeout_sec")
        if raw is None:
            return None
        try:
            return float(raw)
        except (TypeError, ValueError):
            return None


__all__ = ["WorkflowExecutor"]
