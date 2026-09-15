"""Execution abstractions for the independent Run Center.

The service intentionally keeps execution provider-agnostic. Domain plugins
register a callable for an operation; the Run Center owns lifecycle updates,
control signals and durable event reporting. Heavy external simulators can use
``ProcessExecutor`` or provide their own adapter without changing repository or
HTTP contracts.
"""
from __future__ import annotations

import asyncio
import inspect
import json
import logging
import queue
import subprocess
import threading
import time
from pathlib import Path
from concurrent.futures import Future, ThreadPoolExecutor
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Callable, Protocol

from .models import TERMINAL_STATUSES, RunStatus
from .repository import RunRepository

logger = logging.getLogger("qwenpaw").getChild("plugin.run_center.executors")


class Executor(Protocol):
    """Provider-neutral executor contract."""

    def execute(self, handler: Any, context: "ExecutionContext", payload: dict[str, Any]) -> Any:
        ...

    # Optional protocol method.  Executors that can restore a process or a
    # remote worker from a persisted checkpoint may implement this method;
    # older executors remain valid and are run from the beginning.
    def resume(
        self,
        handler: Any,
        context: "ExecutionContext",
        payload: dict[str, Any],
        checkpoint: dict[str, Any],
    ) -> Any:
        ...


@dataclass
class ExecutionContext:
    """Cooperative control and durable reporting context for one Run."""

    run_id: str
    repository: RunRepository
    cancel_event: threading.Event
    pause_event: threading.Event
    resume_checkpoint: dict[str, Any] | None = None

    @property
    def cancelled(self) -> bool:
        return self.cancel_event.is_set()

    @property
    def paused(self) -> bool:
        return self.pause_event.is_set()

    def emit(self, event_type: str, data: dict[str, Any] | None = None, *, stage_id: str | None = None) -> dict[str, Any]:
        return self.repository.append_event(self.run_id, event_type, data or {}, stage_id=stage_id)

    def heartbeat(self, *, metrics: dict[str, Any] | None = None) -> dict[str, Any]:
        """Record a provider heartbeat in the durable Run event stream.

        Long-running providers should call this from their polling loop.  The
        Run Center does not assume a particular monitoring library because a
        local process, remote worker and HPC scheduler expose different
        counters; providers can attach their own JSON-safe metrics.
        """
        data: dict[str, Any] = {
            "worker_id": threading.current_thread().name,
            "heartbeat_at": datetime.now(timezone.utc).isoformat(),
        }
        if metrics:
            data["metrics"] = dict(metrics)
        return self.emit("worker.heartbeat", data)

    def sample_resources(self, sample: dict[str, Any]) -> dict[str, Any]:
        """Record a provider-supplied resource usage sample.

        Samples are intentionally opaque JSON data so providers may report
        CPU, memory, GPU, disk or simulator-specific counters without adding a
        hard dependency to the process-local executor.
        """
        if not isinstance(sample, dict):
            raise TypeError("resource sample must be a mapping")
        return self.emit("worker.resource_sample", dict(sample))

    def progress(self, value: float, *, phase: str | None = None, data: dict[str, Any] | None = None) -> dict[str, Any]:
        current = self.repository.get_run(self.run_id)
        if current is None:
            raise KeyError(self.run_id)
        # Progress updates are represented by a durable event and run snapshot.
        if current.get("status") not in {RunStatus.RUNNING, RunStatus.PREPARING, RunStatus.FINALIZING}:
            return current
        updated = self.repository.transition(
            self.run_id,
            current["status"],
            phase=phase,
            progress=value,
            data={"progress": float(value), **(data or {})},
        )
        return updated

    def wait_if_paused(self, timeout: float = 0.25) -> bool:
        """Block cooperatively while paused; return False after cancellation."""
        while self.pause_event.is_set() and not self.cancel_event.is_set():
            self.cancel_event.wait(timeout)
        return not self.cancel_event.is_set()

    def check_cancelled(self) -> None:
        if self.cancel_event.is_set():
            raise ExecutionCancelled("Run cancellation requested")

    @property
    def resume_checkpoint_id(self) -> str | None:
        """Checkpoint id selected by Run Center for this execution attempt."""
        value = self.resume_checkpoint or {}
        checkpoint_id = value.get("checkpoint_id")
        return str(checkpoint_id).strip() if checkpoint_id else None

    def checkpoint(
        self,
        checkpoint: dict[str, Any] | None = None,
        *,
        checkpoint_id: str | None = None,
        stage_id: str | None = None,
        artifact_ref: dict[str, Any] | None = None,
        state: str = "ready",
        resume_token: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Persist a provider resume point and return its canonical record.

        Providers should keep large state in an Artifact and pass its
        reference here.  Small JSON state may be put in ``metadata``.  The
        method is intentionally synchronous: a successful return means the
        checkpoint is durable before a provider yields at a pause boundary.
        """
        value = dict(checkpoint or {})
        if checkpoint_id is not None:
            value["checkpoint_id"] = checkpoint_id
        if stage_id is not None:
            value["stage_id"] = stage_id
        if artifact_ref is not None:
            value["artifact_ref"] = artifact_ref
        if state != "ready":
            value["state"] = state
        if resume_token is not None:
            value["resume_token"] = resume_token
        if metadata is not None:
            value["metadata"] = metadata
        value.setdefault("state", "ready")
        item = self.repository.create_checkpoint(self.run_id, value)
        self.emit(
            "checkpoint.saved",
            {
                "checkpoint_id": item["checkpoint_id"],
                "state": item.get("state"),
                "resume_token": item.get("resume_token"),
            },
            stage_id=item.get("stage_id"),
        )
        return item

    # ``save_checkpoint`` is the descriptive alias used by domain providers.
    save_checkpoint = checkpoint


class ExecutionCancelled(RuntimeError):
    """Raised by an executor or handler when a run is cancelled."""


class ExecutionTimeout(RuntimeError):
    """Raised when a provider exceeds its declared wall-clock timeout."""


class InProcessExecutor:
    """Run a registered Python callable in a managed worker thread."""

    def execute(self, handler: Any, context: ExecutionContext, payload: dict[str, Any]) -> Any:
        if not callable(handler):
            raise TypeError("in-process executor handler must be callable")
        checkpoint = context.resume_checkpoint
        resume_handler = getattr(handler, "resume", None) if checkpoint else None
        if callable(resume_handler):
            return self.resume(handler, context, payload, checkpoint)
        return self._invoke(handler, context, payload)

    def resume(
        self,
        handler: Any,
        context: ExecutionContext,
        payload: dict[str, Any],
        checkpoint: dict[str, Any],
    ) -> Any:
        """Resume a handler from a durable checkpoint when it exposes one.

        The handler hook is intentionally optional.  A legacy callable that
        only implements ``execute(context, payload)`` is still supported and
        is rerun from the beginning when no resume hook is available.
        """
        if not callable(handler):
            raise TypeError("in-process executor handler must be callable")
        resume_handler = getattr(handler, "resume", None)
        if callable(resume_handler):
            return self._invoke(resume_handler, context, payload, checkpoint)
        return self._invoke(handler, context, payload)

    @staticmethod
    def _invoke(handler: Any, context: ExecutionContext, payload: dict[str, Any], checkpoint: dict[str, Any] | None = None) -> Any:
        try:
            parameters = list(inspect.signature(handler).parameters.values())
        except (TypeError, ValueError):
            parameters = []
        # Support the two stable provider forms: (context, payload) and
        # (context). A provider may also accept keyword-only payload.
        payload_parameter = next(
            (parameter for parameter in parameters if parameter.name == "payload"),
            None,
        )
        checkpoint_parameter = next(
            (parameter for parameter in parameters if parameter.name in {"checkpoint", "resume_checkpoint"}),
            None,
        )
        positional = [
            parameter
            for parameter in parameters
            if parameter.kind
            in {
                inspect.Parameter.POSITIONAL_ONLY,
                inspect.Parameter.POSITIONAL_OR_KEYWORD,
            }
        ]
        has_varargs = any(
            parameter.kind == inspect.Parameter.VAR_POSITIONAL
            for parameter in parameters
        )
        if checkpoint is not None and checkpoint_parameter is not None:
            # Prefer semantic parameter names, while retaining the stable
            # positional convention ``(context, payload, checkpoint)`` for
            # providers that use generic argument names.
            args: list[Any] = [context]
            for parameter in positional[1:]:
                if parameter.name in {"checkpoint", "resume_checkpoint"}:
                    args.append(checkpoint)
                elif parameter.name in {"payload", "request", "params"}:
                    args.append(payload)
                elif len(args) == 1:
                    args.append(payload)
                else:
                    args.append(checkpoint)
                if len(args) >= len(positional):
                    break
            if checkpoint_parameter.kind == inspect.Parameter.KEYWORD_ONLY:
                kwargs = {checkpoint_parameter.name: checkpoint}
                if payload_parameter is not None and payload_parameter.kind == inspect.Parameter.KEYWORD_ONLY:
                    kwargs[payload_parameter.name] = payload
                result = handler(*args, **kwargs)
            else:
                result = handler(*args)
        elif checkpoint is not None and len(positional) >= 3:
            result = handler(context, payload, checkpoint)
        elif len(positional) >= 2 or has_varargs:
            result = handler(context, payload)
        elif payload_parameter is not None:
            result = handler(context, payload=payload)
        else:
            result = handler(context)
        if inspect.isawaitable(result):
            try:
                return asyncio.run(result)
            except RuntimeError:
                # A provider invoked from an already-running loop can still be
                # executed synchronously in this worker thread.
                loop = asyncio.new_event_loop()
                try:
                    return loop.run_until_complete(result)
                finally:
                    loop.close()
        return result


class ProcessExecutor:
    """Execute an argv command without a shell and stream stdout/stderr events."""

    def execute(self, handler: Any, context: ExecutionContext, payload: dict[str, Any]) -> dict[str, Any]:
        argv = handler if isinstance(handler, (list, tuple)) else payload.get("argv")
        if not isinstance(argv, (list, tuple)) or not argv or not all(isinstance(item, str) and item for item in argv):
            raise ValueError("process executor requires a non-empty argv list")
        timeout_value = payload.get("timeout", 0)
        try:
            timeout = float(timeout_value or 0)
        except (TypeError, ValueError, OverflowError):
            raise ValueError("process timeout must be a number") from None
        if timeout < 0:
            raise ValueError("process timeout must be non-negative")
        log_handle = None
        log_path = payload.get("log_path")
        if log_path:
            try:
                log_target = Path(str(log_path)).expanduser().resolve()
                log_target.parent.mkdir(parents=True, exist_ok=True)
                log_handle = log_target.open("w", encoding="utf-8", errors="replace")
            except OSError:
                # Logging is auxiliary; execution remains valid when the
                # requested compatibility log cannot be opened.
                log_handle = None
        process_kwargs: dict[str, Any] = {
            "stdout": subprocess.PIPE,
            "stderr": subprocess.PIPE,
            "text": True,
            "bufsize": 1,
        }
        # Process based providers commonly rely on relative include paths and
        # simulator generated output.  Honor the execution directory carried
        # by the Run payload instead of inheriting the host process cwd.
        execution_dir = payload.get("working_dir") or payload.get("execution_dir")
        if execution_dir:
            process_kwargs["cwd"] = str(Path(str(execution_dir)).expanduser().resolve())
        try:
            process = subprocess.Popen(
                list(argv),
                **process_kwargs,
            )
        except Exception:
            if log_handle is not None:
                log_handle.close()
            raise
        context.emit("process.started", {"pid": process.pid, "argv": list(argv)})
        deadline = time.monotonic() + timeout if timeout > 0 else None
        lines: queue.Queue[tuple[str, str]] = queue.Queue()

        def _read(stream: Any, event_type: str) -> None:
            if stream is None:
                return
            for line in iter(stream.readline, ""):
                text = line.rstrip("\r\n")
                if log_handle is not None:
                    try:
                        log_handle.write(text + "\n")
                        log_handle.flush()
                    except OSError:
                        pass
                lines.put((event_type, text))

        readers = [
            threading.Thread(target=_read, args=(process.stdout, "process.stdout"), daemon=True),
            threading.Thread(target=_read, args=(process.stderr, "process.stderr"), daemon=True),
        ]
        for reader in readers:
            reader.start()
        try:
            while process.poll() is None:
                if context.cancelled:
                    process.terminate()
                    try:
                        process.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        process.kill()
                        process.wait(timeout=5)
                    raise ExecutionCancelled("Process terminated after cancellation")
                if deadline is not None and time.monotonic() >= deadline:
                    process.terminate()
                    try:
                        process.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        process.kill()
                        process.wait(timeout=5)
                    context.emit("process.timeout", {"timeout": timeout, "argv": list(argv)})
                    raise ExecutionTimeout(
                        f"process exceeded timeout of {timeout:.3f} seconds"
                    )
                while True:
                    try:
                        event_type, line = lines.get_nowait()
                    except queue.Empty:
                        break
                    context.emit(event_type, {"line": line})
                if process.poll() is None:
                    context.cancel_event.wait(0.05)
            for reader in readers:
                reader.join(timeout=1)
            while True:
                try:
                    event_type, line = lines.get_nowait()
                except queue.Empty:
                    break
                context.emit(event_type, {"line": line})
            returncode = int(process.returncode or 0)
            if returncode != 0:
                context.emit("process.exit", {"returncode": returncode, "argv": list(argv)})
                raise RuntimeError(f"process exited with return code {returncode}")
            context.emit("process.exit", {"returncode": returncode, "argv": list(argv)})
            return {"returncode": returncode, "argv": list(argv)}
        finally:
            if process.poll() is None:
                process.kill()
            if log_handle is not None:
                try:
                    log_handle.close()
                except OSError:
                    pass


@dataclass
class _Registration:
    handler: Any
    executor: Executor
    provider_id: str | None


class RunExecutorService:
    """Durable worker service with cooperative control and restart recovery."""

    def __init__(
        self,
        repository: RunRepository,
        *,
        max_workers: int = 2,
        heartbeat_interval: float = 15.0,
        review_checker: Callable[[dict[str, Any]], bool] | None = None,
    ) -> None:
        self.repository = repository
        self.max_workers = max(1, int(max_workers))
        try:
            self.heartbeat_interval = max(1.0, float(heartbeat_interval))
        except (TypeError, ValueError):
            self.heartbeat_interval = 15.0
        self.review_checker = review_checker
        self._registrations: dict[tuple[str, str | None], _Registration] = {}
        self._controls: dict[str, tuple[threading.Event, threading.Event]] = {}
        self._futures: dict[str, Future[Any]] = {}
        # ``_controls`` tracks every submitted run, including work items that
        # are waiting in ThreadPoolExecutor's internal queue.  Keep a separate
        # set for workers that have actually entered ``_execute`` so capacity
        # reporting does not mistake pending work for an active worker.
        self._active: set[str] = set()
        # Runs that cannot acquire a project lease are returned to the durable
        # queue instead of occupying a worker while waiting.  Timers are
        # process-local hints only; the Run record remains the source of truth
        # and startup recovery will discover queued work again.
        self._admission_timers: set[threading.Timer] = set()
        self._lock = threading.RLock()
        self._pool: ThreadPoolExecutor | None = None
        self._started = False

    @property
    def started(self) -> bool:
        """Whether the worker pool accepts new submissions."""
        with self._lock:
            return self._started and self._pool is not None

    @property
    def active_runs(self) -> int:
        """Number of runs currently occupying a worker slot."""
        with self._lock:
            return len(self._active)

    @property
    def submitted_runs(self) -> int:
        """Number of submitted runs with a live worker future."""
        with self._lock:
            return len(self._futures)

    @property
    def pending_runs(self) -> int:
        """Number of submitted runs waiting for a worker slot."""
        with self._lock:
            return max(0, len(self._futures) - len(self._active))

    def snapshot(self) -> dict[str, Any]:
        """Return a provider-neutral executor capacity snapshot.

        The queue API can use this without reaching into private fields.  A
        run is counted as active only after its worker starts, while submitted
        includes both active and pending futures.
        """
        with self._lock:
            active = len(self._active)
            submitted = len(self._futures)
            return {
                "started": self._started and self._pool is not None,
                "max_workers": self.max_workers,
                "submitted": submitted,
                "active": active,
                "pending": max(0, submitted - active),
                "registered_operations": len(self._registrations),
                "heartbeat_interval": self.heartbeat_interval,
                "admission_retries": len(self._admission_timers),
            }

    @property
    def registered_operations(self) -> int:
        """Number of operation/provider adapters available in this process."""
        with self._lock:
            return len(self._registrations)

    def register(self, operation: str, handler: Any, *, provider_id: str | None = None, executor: Executor | None = None) -> None:
        operation = str(operation or "").strip()
        if not operation or not callable(handler) and not isinstance(handler, (list, tuple)):
            raise ValueError("operation and executable handler are required")
        if provider_id is not None:
            provider_id = str(provider_id).strip() or None
        selected = executor or InProcessExecutor()
        with self._lock:
            self._registrations[(operation, provider_id)] = _Registration(handler, selected, provider_id)
            started = self._started
        if started:
            for run in self._fair_queue_order(
                self.repository.list_runs(
                    status=RunStatus.QUEUED, operation=operation, limit=500
                )
            ):
                if provider_id is None or run.get("provider_id") == provider_id:
                    self._submit_discovered_run(run["run_id"])

    def unregister(self, operation: str, *, provider_id: str | None = None) -> None:
        with self._lock:
            self._registrations.pop((str(operation).strip(), provider_id), None)

    def replace_registrations(self, registrations: list[Any]) -> None:
        """Atomically replace host-owned executor registrations.

        Plugin reload can remove or replace an implementation. Keeping stale
        callable objects here would let Run Center continue executing code
        from an unloaded plugin, so the host snapshot must be authoritative.
        """
        normalized: dict[tuple[str, str | None], _Registration] = {}
        for item in registrations:
            operation = str(getattr(item, "operation", "") or "").strip()
            handler = getattr(item, "handler", None)
            provider_id = getattr(item, "provider_id", None)
            if not operation or (
                not callable(handler) and not isinstance(handler, (list, tuple))
            ):
                raise ValueError("operation and executable handler are required")
            if provider_id is not None:
                provider_id = str(provider_id).strip() or None
            executor = getattr(item, "executor", None) or InProcessExecutor()
            normalized[(operation, provider_id)] = _Registration(
                handler,
                executor,
                provider_id,
            )
        with self._lock:
            self._registrations = normalized
            started = self._started
        if started:
            for run in self._fair_queue_order(
                self.repository.list_runs(status=RunStatus.QUEUED, limit=500)
            ):
                if self._find_registration(
                    run.get("operation"), run.get("provider_id")
                ):
                    self._submit_discovered_run(run["run_id"])

    def start(self) -> None:
        with self._lock:
            if self._started:
                return
            self.repository.initialize()
            self.repository.recover_incomplete_runs()
            # A previous process may have exited between acquiring a lease and
            # releasing it.  Reconcile those durable records before admitting
            # new work so a project cannot remain blocked after restart.
            try:
                self.repository.cleanup_stale_resource_leases()
            except (KeyError, ValueError):
                logger.debug("Stale resource lease cleanup failed", exc_info=True)
            self._pool = ThreadPoolExecutor(max_workers=self.max_workers, thread_name_prefix="run-center")
            self._started = True
        # Queue only runs for which this process has an executor. Unknown
        # operations remain queued and can be picked up after plugin reload.
        self._queue_review_pending_drafts()
        queued = self._fair_queue_order(
            self.repository.list_runs(status=RunStatus.QUEUED, limit=500)
        )
        for run in queued:
            if self._find_registration(run.get("operation"), run.get("provider_id")):
                self._submit_discovered_run(run["run_id"])

    def _submit_discovered_run(self, run_id: str) -> None:
        """Best-effort dispatch for durable queue discovery.

        Startup and plugin reload scan durable queued Runs automatically.  A
        Run that is still waiting for approval is a valid queue state, not a
        service-start failure.  Leave it queued so an explicit submit after
        approval, or a later reload/restart, can dispatch it.
        """
        try:
            self.submit(run_id)
        except (KeyError, ValueError) as exc:
            if "approved review is required" in str(exc):
                logger.info("Run %s remains queued pending an approved review", run_id)
            else:
                # Queue state may change concurrently between discovery and
                # submission.  Keep automatic recovery best-effort while an
                # explicit API submission continues to return the error.
                logger.debug("Automatic submission skipped for Run %s", run_id, exc_info=True)

    def _queue_review_pending_drafts(self) -> None:
        """Promote only review-gated drafts into the durable queue.

        Generic drafts represent intentionally unsubmitted requests and must
        remain drafts.  High-risk descriptors, however, need a visible queued
        state while awaiting approval so users can review and then explicitly
        submit them without losing the request on restart.
        """
        for run in self.repository.list_runs(status=RunStatus.DRAFT, limit=500):
            try:
                record = self.repository.get_operation(
                    str(run.get("operation") or ""),
                    provider_id=run.get("provider_id"),
                )
                descriptor = (record or {}).get("descriptor") or {}
                risk = descriptor.get("risk") if isinstance(descriptor, dict) else {}
                requires_review = isinstance(risk, dict) and risk.get("requires_review") is True
                payload = run.get("payload") if isinstance(run.get("payload"), dict) else {}
                requires_review = requires_review or payload.get("require_review") is True
                if requires_review:
                    self.repository.transition(
                        run["run_id"], RunStatus.QUEUED,
                        data={"reason": "awaiting_review"},
                    )
            except (KeyError, TypeError, ValueError):
                logger.debug("Review draft promotion skipped for Run %s", run.get("run_id"), exc_info=True)

    def _fair_queue_order(self, runs: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Interleave queued projects while retaining priority/FIFO per project.

        This is a deliberately small local fairness policy: each project gets
        one turn before another turn is granted, and runs from the same project
        are ordered by durable priority then creation/update order.  Explicit
        ``submit(run_id)`` calls remain authoritative; this ordering governs
        automatic startup/reload dispatch and can be replaced by a weighted
        scheduler without changing the repository/API contract.
        """
        if len(runs) < 2:
            return runs
        groups: dict[str, list[dict[str, Any]]] = {}
        order: list[str] = []
        for run in runs:
            project = str(run.get("project_id") or "__default__")
            if project not in groups:
                groups[project] = []
                order.append(project)
            groups[project].append(run)
        for items in groups.values():
            items.sort(
                key=lambda item: (
                    -int(item.get("priority") or (item.get("payload") or {}).get("priority") or 0),
                    str(item.get("created_at") or item.get("updated_at") or ""),
                    str(item.get("run_id") or ""),
                )
            )
        result: list[dict[str, Any]] = []
        while True:
            emitted = False
            for project in order:
                items = groups[project]
                if items:
                    result.append(items.pop(0))
                    emitted = True
            if not emitted:
                break
        return result

    def stop(self, *, wait: bool = False) -> None:
        with self._lock:
            self._started = False
            controls = list(self._controls.items())
            pool = self._pool
            self._pool = None
            timers = list(self._admission_timers)
            self._admission_timers.clear()
        for timer in timers:
            timer.cancel()
        # Persist cancellation before signalling the worker.  A process that
        # exits while ``wait=False`` must leave no run stuck in ``running``;
        # startup recovery can deterministically finish ``cancelling`` as
        # ``cancelled`` if the old worker never gets to run its cleanup.
        for run_id, (cancel_event, _pause_event) in controls:
            try:
                self.repository.control(run_id, "cancel")
            except (KeyError, ValueError):
                # The worker may have reached a terminal state concurrently.
                pass
            cancel_event.set()
        if pool is not None:
            pool.shutdown(wait=wait, cancel_futures=False)

    def _find_registration(self, operation: str | None, provider_id: str | None) -> _Registration | None:
        if not operation:
            return None
        with self._lock:
            return self._registrations.get((operation, provider_id)) or self._registrations.get((operation, None))

    def submit(self, run_id: str) -> None:
        if not self._started:
            self.start()
        run = self.repository.get_run(run_id)
        if run is None:
            raise KeyError(run_id)
        if run.get("source") == "ugsci-legacy":
            raise ValueError("legacy runs are read-only")
        # Startup/reload discovery may have submitted this Run concurrently
        # with an explicit submit request.  Treat an existing live Future as
        # idempotent before validating the durable status, since the worker
        # can already have advanced it to preparing/running.
        with self._lock:
            existing = self._futures.get(run_id)
            if existing is not None and not existing.done():
                return
        if run.get("status") == RunStatus.DRAFT:
            self.repository.transition(run_id, RunStatus.QUEUED)
            run = self.repository.get_run(run_id) or run
        if run.get("status") != RunStatus.QUEUED:
            raise ValueError(f"Run cannot be submitted from state: {run.get('status')}")
        # Review gating is enabled by either the immutable Run request or the
        # registered Operation Descriptor.  The descriptor is authoritative
        # for high-risk providers, so a client cannot bypass a mandatory gate
        # simply by omitting ``require_review`` from its payload.
        payload = run.get("payload") if isinstance(run.get("payload"), dict) else {}
        descriptor_requires_review = False
        try:
            operation_record = self.repository.get_operation(
                str(run.get("operation") or ""),
                provider_id=run.get("provider_id"),
            )
            descriptor = (operation_record or {}).get("descriptor") or {}
            risk = descriptor.get("risk") if isinstance(descriptor, dict) else {}
            descriptor_requires_review = bool(
                isinstance(risk, dict) and risk.get("requires_review") is True
            )
        except (KeyError, TypeError, ValueError):
            # A missing or malformed descriptor is handled by the normal
            # registration lookup below; it must not turn a low-risk legacy
            # integration into an unexpected review failure.
            descriptor_requires_review = False
        if payload.get("require_review") is True or descriptor_requires_review:
            if self.review_checker is None or not self.review_checker(run):
                raise ValueError("an approved review is required before submitting this Run")
        registration = self._find_registration(run.get("operation"), run.get("provider_id"))
        if registration is None:
            raise ValueError(f"No executor registered for operation: {run.get('operation')}")
        with self._lock:
            if run_id in self._futures and not self._futures[run_id].done():
                return
            assert self._pool is not None
            cancel_event = threading.Event()
            pause_event = threading.Event()
            self._controls[run_id] = (cancel_event, pause_event)
            self._futures[run_id] = self._pool.submit(self._execute, run, registration, cancel_event, pause_event)

    def request_control(self, run_id: str, action: str) -> None:
        with self._lock:
            control = self._controls.get(run_id)
        if control is None:
            return
        cancel_event, pause_event = control
        if action == "cancel":
            cancel_event.set()
        elif action == "pause":
            pause_event.set()
        elif action == "resume":
            pause_event.clear()

    def control(self, run_id: str, action: str) -> dict[str, Any]:
        """Apply a lifecycle control and deliver its cooperative signal."""
        normalized = str(action or "").strip().lower()
        current = self.repository.get_run(run_id)
        if current is None:
            raise KeyError(run_id)
        with self._lock:
            # A control entry also exists for futures still waiting in the
            # thread pool.  Only a worker that has entered ``_execute`` can be
            # resumed directly to ``running``; a queued-and-paused future must
            # first return to ``queued`` so its pending worker can start.
            executing = run_id in self._active
        if normalized == "resume" and executing and current.get("status") == RunStatus.PAUSED:
            self.request_control(run_id, "resume")
            return self.repository.transition(run_id, RunStatus.RUNNING, data={"action": "resume"})
        result = self.repository.control(run_id, normalized)
        self.request_control(run_id, normalized)
        if normalized == "resume" and result.get("status") == RunStatus.QUEUED:
            # If a cooperative provider saved a durable checkpoint before it
            # returned/was paused, bind this attempt to that checkpoint.  The
            # marker is persisted before submission, so a crash between these
            # two operations still recovers deterministically.
            try:
                marked = self.repository.mark_resume_requested(run_id)
                if marked is not None:
                    result = marked
            except (KeyError, ValueError):
                # A provider may intentionally resume from the beginning; the
                # legacy behavior remains valid when no checkpoint exists.
                pass
            registration = self._find_registration(result.get("operation"), result.get("provider_id"))
            if registration is not None:
                self.submit(run_id)
        return result

    def _execute(self, run: dict[str, Any], registration: _Registration, cancel_event: threading.Event, pause_event: threading.Event) -> None:
        run_id = run["run_id"]
        payload = dict(run.get("payload") or {})
        resume_checkpoint = self._resume_checkpoint(run_id, payload)
        context = ExecutionContext(
            run_id,
            self.repository,
            cancel_event,
            pause_event,
            resume_checkpoint=resume_checkpoint,
        )
        heartbeat_stop = threading.Event()
        heartbeat_thread: threading.Thread | None = None
        lease: dict[str, Any] | None = None
        admission_retry = False
        with self._lock:
            self._active.add(run_id)
        try:
            # A queued Future may start after a user paused or cancelled the
            # Run.  Do not attempt an invalid state transition (for example
            # ``paused -> preparing``); leave paused Runs resumable and finish
            # cancellation deterministically.
            current = self.repository.get_run(run_id)
            if not current:
                return
            if cancel_event.is_set() or current.get("status") in {
                RunStatus.CANCELLED,
                RunStatus.CANCELLING,
            }:
                if current.get("status") == RunStatus.CANCELLING:
                    self.repository.transition(
                        run_id,
                        RunStatus.CANCELLED,
                        data={"reason": "cancel_requested"},
                    )
                return
            if current.get("status") == RunStatus.PAUSED:
                return
            if current.get("status") != RunStatus.QUEUED:
                return
            payload_resources = payload.get("resource_request")
            if not isinstance(payload_resources, dict):
                payload_resources = payload.get("resources") if isinstance(payload.get("resources"), dict) else {}
            if not payload_resources:
                try:
                    descriptor_record = self.repository.get_operation(
                        str(current.get("operation") or ""),
                        provider_id=current.get("provider_id"),
                    )
                    descriptor = (descriptor_record or {}).get("descriptor") or {}
                    declared = descriptor.get("resources") if isinstance(descriptor, dict) else None
                    if isinstance(declared, dict):
                        payload_resources = dict(declared)
                except (KeyError, TypeError, ValueError):
                    payload_resources = {}
            pool_id = str(payload_resources.get("pool") or "local")
            # Descriptor envelopes contain routing and unknown/optional values
            # in addition to consumable quantities.  Persist only concrete
            # numeric counters and named string slots in the lease.
            lease_resources = {
                key: value
                for key, value in payload_resources.items()
                if key != "pool"
                and value is not None
                and (
                    (isinstance(value, (int, float)) and not isinstance(value, bool))
                    or (isinstance(value, list) and all(isinstance(item, str) for item in value))
                )
            }
            project_id = current.get("project_id") or payload.get("project_id")
            lease = self.repository.acquire_resource_lease(
                run_id,
                project_id=str(project_id).strip() if project_id else None,
                pool_id=pool_id,
                resources=lease_resources,
                owner="run-center.local",
            )
            if lease is None:
                # Project concurrency is enforced durably by the repository.
                # Yield this worker and retry shortly; other projects can use
                # the slot and a restart will still recover the queued Run.
                admission_retry = True
                return
            self.repository.transition(run_id, RunStatus.PREPARING)
            self.repository.transition(run_id, RunStatus.RUNNING)
            # Emit an initial liveness signal even when a provider does not
            # implement its own polling heartbeat.  Providers can call
            # ``context.heartbeat(metrics=...)`` periodically for long jobs.
            context.heartbeat()

            def _heartbeat_loop() -> None:
                while not heartbeat_stop.wait(self.heartbeat_interval):
                    if cancel_event.is_set():
                        return
                    current = self.repository.get_run(run_id)
                    if not current or current.get("status") in TERMINAL_STATUSES:
                        return
                    try:
                        context.heartbeat()
                    except Exception:  # pragma: no cover - telemetry must not fail a Run
                        logger.debug("Run %s heartbeat failed", run_id, exc_info=True)

            heartbeat_thread = threading.Thread(
                target=_heartbeat_loop,
                name=f"run-center-heartbeat:{run_id}",
                daemon=True,
            )
            heartbeat_thread.start()
            result = self._execute_registration(
                registration,
                context,
                payload,
                resume_checkpoint,
            )
            current = self.repository.get_run(run_id)
            if cancel_event.is_set() or not current or current.get("status") in {RunStatus.CANCELLING, RunStatus.CANCELLED}:
                if current and current.get("status") == RunStatus.CANCELLING:
                    self.repository.transition(run_id, RunStatus.CANCELLED, data={"reason": "cancel_requested"})
                return
            if current.get("status") == RunStatus.PAUSED:
                # A provider that returns while paused must not silently mark
                # the run successful; it can be resumed and submitted again.
                return
            self.repository.transition(run_id, RunStatus.FINALIZING, data={"result": _json_safe(result)})
            self.repository.transition(run_id, RunStatus.SUCCEEDED, data={"result": _json_safe(result)})
        except ExecutionCancelled as exc:
            current = self.repository.get_run(run_id)
            if current and current.get("status") == RunStatus.CANCELLING:
                self.repository.transition(run_id, RunStatus.CANCELLED, data={"reason": str(exc)})
        except ExecutionTimeout as exc:
            current = self.repository.get_run(run_id)
            if current and current.get("status") not in TERMINAL_STATUSES:
                try:
                    self.repository.transition(
                        run_id,
                        RunStatus.FAILED,
                        error={"kind": "timeout", "message": str(exc)},
                        data={"reason": "timeout"},
                    )
                except ValueError:
                    pass
        except Exception as exc:  # provider boundary: persist a classified failure
            logger.exception("Run %s failed", run_id)
            current = self.repository.get_run(run_id)
            if current and current.get("status") == RunStatus.CANCELLING:
                # A provider may raise while a stop/cancel signal is in flight.
                # Complete the cancellation instead of leaving a ghost
                # ``cancelling`` run behind until the next process restart.
                try:
                    self.repository.transition(
                        run_id,
                        RunStatus.CANCELLED,
                        data={"reason": "cancel_requested", "provider_error": str(exc)},
                    )
                except ValueError:
                    pass
            elif current and current.get("status") != RunStatus.CANCELLED:
                try:
                    self.repository.transition(run_id, RunStatus.FAILED, error={"kind": "executor_error", "message": str(exc)})
                except ValueError:
                    pass
        finally:
            heartbeat_stop.set()
            if heartbeat_thread is not None and heartbeat_thread is not threading.current_thread():
                heartbeat_thread.join(timeout=min(1.0, self.heartbeat_interval))
            with self._lock:
                self._active.discard(run_id)
                self._controls.pop(run_id, None)
                self._futures.pop(run_id, None)
            if lease is not None:
                try:
                    self.repository.release_resource_lease(
                        lease["lease_id"],
                        reason="run_finished",
                        allow_active_run=True,
                    )
                except (KeyError, ValueError):
                    logger.debug("Failed to release lease for Run %s", run_id, exc_info=True)
            if admission_retry:
                # Schedule only after this Future has been removed.  Doing it
                # earlier can race with ``submit``'s duplicate guard and leave
                # a durable queued Run without another admission attempt.
                self._schedule_admission_retry(run_id)

    def _schedule_admission_retry(self, run_id: str, delay: float = 0.1) -> None:
        """Retry a queued Run after project admission became unavailable."""
        def retry() -> None:
            with self._lock:
                self._admission_timers.discard(timer)
                started = self._started
            if not started:
                return
            try:
                current = self.repository.get_run(run_id)
                if current and current.get("status") == RunStatus.QUEUED:
                    self.submit(run_id)
            except (KeyError, ValueError):
                logger.debug("Admission retry skipped for Run %s", run_id, exc_info=True)

        timer = threading.Timer(max(0.01, float(delay)), retry)
        timer.daemon = True
        with self._lock:
            if not self._started:
                return
            self._admission_timers.add(timer)
        timer.start()

    def _resume_checkpoint(
        self,
        run_id: str,
        payload: dict[str, Any],
    ) -> dict[str, Any] | None:
        """Resolve a persisted checkpoint selected for this attempt."""
        checkpoint_id = payload.get("resume_checkpoint_id")
        checkpoint = None
        if checkpoint_id:
            checkpoint = self.repository.get_checkpoint(str(checkpoint_id))
            if checkpoint is not None and checkpoint.get("run_id") != run_id:
                checkpoint = None
        if checkpoint is None and payload.get("resume_requested"):
            checkpoint = self.repository.latest_checkpoint(run_id)
        if checkpoint is None:
            return None
        state = str(checkpoint.get("state") or "").strip().lower()
        if state in {"invalid", "deleted", "failed", "aborted"}:
            return None
        return checkpoint

    @staticmethod
    def _execute_registration(
        registration: _Registration,
        context: ExecutionContext,
        payload: dict[str, Any],
        checkpoint: dict[str, Any] | None,
    ) -> Any:
        """Invoke the optional executor-level resume hook when available."""
        resume = getattr(registration.executor, "resume", None)
        if checkpoint is not None and callable(resume):
            return resume(registration.handler, context, payload, checkpoint)
        return registration.executor.execute(registration.handler, context, payload)


def _json_safe(value: Any) -> Any:
    try:
        json.dumps(value, ensure_ascii=False, allow_nan=False)
        return value
    except (TypeError, ValueError):
        return {"repr": repr(value)}


__all__ = [
    "ExecutionCancelled",
    "ExecutionTimeout",
    "ExecutionContext",
    "Executor",
    "InProcessExecutor",
    "ProcessExecutor",
    "RunExecutorService",
]
