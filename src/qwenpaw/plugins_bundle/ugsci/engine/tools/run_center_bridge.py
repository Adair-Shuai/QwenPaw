# -*- coding: utf-8 -*-
"""Optional bridge from UGSci simulation tools to the independent Run Center.

The bridge is deliberately capability based.  UGSci remains loadable on older
hosts, while a host that has ``qwenpaw-run-center`` loaded gets one durable Run
for every simulation.  The legacy SQLite job record is kept as a projection so
existing status, wait and result tools continue to accept the returned job_id.
"""
from __future__ import annotations

import sys
import threading
import time
from pathlib import Path
from typing import Any


RUN_CENTER_MODULE = "plugin_qwenpaw_run_center"
SIMULATION_PROVIDER = "ugsci-simulation"


def _plugin() -> Any | None:
    candidates = [sys.modules.get(RUN_CENTER_MODULE)]
    # Unit hosts and embedders may namespace plugin modules differently while
    # retaining the stable PLUGIN_ID.  Scan only loaded modules; no imports or
    # filesystem discovery occurs on this optional compatibility path.
    candidates.extend(
        module
        for name, module in list(sys.modules.items())
        if module is not None
        and name != RUN_CENTER_MODULE
        and (
            name.endswith("qwenpaw_run_center")
            or getattr(module, "PLUGIN_ID", None) == "qwenpaw-run-center"
        )
    )
    for module in candidates:
        value = getattr(module, "plugin", None) if module is not None else None
        if value is not None and getattr(value, "repository", None) and getattr(value, "executor_service", None):
            return value
    return None


def available() -> bool:
    """Return whether a live Run Center runtime can accept a native Run."""
    value = _plugin()
    return bool(value and getattr(value.executor_service, "started", False))


def loaded() -> bool:
    """Return whether the Run Center plugin instance is present in-process."""
    return _plugin() is not None


def execute_simulation(context: Any, payload: dict[str, Any]) -> dict[str, Any]:
    """Run one prepared simulator command through Run Center's process executor."""
    module = sys.modules.get(f"{RUN_CENTER_MODULE}.runtime.executors")
    if module is None:
        module = next(
            (
                candidate
                for name, candidate in list(sys.modules.items())
                if candidate is not None and name.endswith("qwenpaw_run_center.runtime.executors")
            ),
            None,
        )
    if module is None:
        raise RuntimeError("Run Center process executor is unavailable")
    # ``RunRepository`` stores the provider input under the JSON-first
    # ``payload`` field.  The executor service passes that complete row
    # snapshot to handlers, so unwrap the provider payload before resolving
    # command, cwd, timeout and compatibility metadata.  Keep outer fields as
    # fallbacks for forward compatibility with directly-created Runs.
    nested = payload.get("payload")
    if isinstance(nested, dict):
        payload = {**payload, **nested}
    process_executor = module.ProcessExecutor()
    execution_cancelled = module.ExecutionCancelled
    execution_timeout = getattr(module, "ExecutionTimeout", TimeoutError)

    # Keep old UGSci callers observable while the Run Center owns the actual
    # process.  The adapter is installed per invocation and restored in all
    # exit paths, so provider code cannot accidentally affect other Runs.
    try:
        from . import job_store
    except Exception:  # pragma: no cover - optional compatibility layer
        job_store = None
    original_emit = context.emit

    def emit(event_type: str, data: dict[str, Any] | None = None, *, stage_id: str | None = None):
        event = original_emit(event_type, data or {}, stage_id=stage_id)
        value = dict(data or {})
        if job_store is not None:
            try:
                if event_type == "process.started":
                    job_store.update_job_fields(
                        context.run_id,
                        status="running",
                        pid=int(value.get("pid") or 0),
                        start_ts=float(payload.get("start_ts") or time.time()),
                    )
                elif event_type == "process.exit":
                    returncode = value.get("returncode")
                    job_store.update_job_status(
                        context.run_id,
                        "completed" if returncode == 0 else "failed",
                        returncode=int(returncode) if returncode is not None else None,
                        end_ts=time.time(),
                    )
                elif event_type == "process.timeout":
                    job_store.update_job_status(
                        context.run_id,
                        "timeout",
                        error=f"simulation exceeded timeout {value.get('timeout')}s",
                        end_ts=time.time(),
                    )
                elif event_type in {"process.stdout", "process.stderr"}:
                    job_store.append_job_event_if_changed(
                        context.run_id,
                        {"type": event_type, "data": value, "ts": time.time()},
                    )
            except Exception:
                # A compatibility projection must never fail the durable Run.
                pass
        return event

    context.emit = emit
    try:
        result = process_executor.execute(payload.get("command"), context, payload)
        output_dir = Path(str(payload.get("output_dir") or ""))
        log_path = Path(str(payload.get("log_path") or ""))
        repository = context.repository
        if log_path.is_file():
            repository.add_artifact(
                context.run_id,
                {
                    "ref_id": "simulation-log",
                    "kind": "log",
                    "uri": str(log_path),
                    "media_type": "text/plain",
                    "size_bytes": log_path.stat().st_size,
                    "metadata": {"simulator": payload.get("simulator")},
                },
                role="log",
            )
        context.emit(
            "result.ready",
            {
                "returncode": result.get("returncode"),
                "output_dir": str(output_dir),
                "log_path": str(log_path),
            },
        )
        return {
            **result,
            "simulator": payload.get("simulator"),
            "deck_file": payload.get("deck_file"),
            "output_dir": str(output_dir),
            "log_path": str(log_path),
        }
    except execution_cancelled:
        if job_store is not None:
            try:
                job_store.update_job_status(
                    context.run_id,
                    "cancelled",
                    error="simulation cancelled by Run Center",
                    end_ts=time.time(),
                )
            except Exception:
                pass
        raise
    except execution_timeout:
        if job_store is not None:
            try:
                job_store.update_job_status(
                    context.run_id,
                    "timeout",
                    error="simulation exceeded Run Center timeout",
                    end_ts=time.time(),
                )
            except Exception:
                pass
        raise
    finally:
        context.emit = original_emit


def execute_visualization_import(context: Any, payload: dict[str, Any]) -> dict[str, Any]:
    """Execute one visualization import synchronously inside a Run worker.

    ``JobManager`` still performs its carefully serialized manifest commit and
    compatibility persistence.  Calling its private synchronous mode here
    avoids a second independent lifecycle while Run Center records the
    canonical Run, events and terminal state.
    """
    nested = payload.get("payload")
    if isinstance(nested, dict):
        payload = {**payload, **nested}
    try:
        from ...visualization.backend.jobs.manager import job_manager
    except Exception as exc:  # pragma: no cover - plugin isolation boundary
        raise RuntimeError("UGSci visualization import manager is unavailable") from exc
    executor_module = next(
        (
            candidate
            for name, candidate in list(sys.modules.items())
            if candidate is not None and name.endswith("qwenpaw_run_center.runtime.executors")
        ),
        None,
    )
    execution_cancelled = getattr(executor_module, "ExecutionCancelled", RuntimeError)
    job = job_manager.get_job(context.run_id)
    if job is None:
        raise KeyError(f"visualization import job not found: {context.run_id}")

    original_add_event = job.add_event

    def add_event(event_type: str, data: dict[str, Any] | None = None) -> None:
        original_add_event(event_type, data)
        context.emit(
            f"import.{event_type}",
            {"event_type": event_type, **dict(data or {})},
        )

    job.add_event = add_event  # type: ignore[method-assign]
    watcher_stop = threading.Event()

    def watch_cancel() -> None:
        while not watcher_stop.wait(0.1):
            if context.cancelled:
                job_manager.cancel_job(context.run_id)
                return

    watcher = threading.Thread(
        target=watch_cancel,
        name=f"run-center-import-cancel:{context.run_id}",
        daemon=True,
    )
    watcher.start()
    try:
        job_manager.submit_import(
            job.name,
            Path(str(payload.get("upload_path") or "")),
            Path(str(payload["prop_path"])) if payload.get("prop_path") else None,
            Path(str(payload.get("bin_dir") or "")),
            [Path(str(item)) for item in payload.get("companion_paths") or []],
            _existing_job=job,
            _force_legacy=True,
            _execute_sync=True,
        )
        if job.status == "cancelled":
            raise execution_cancelled(context.run_id)
        if job.status == "failed":
            raise RuntimeError(job.error or "visualization import failed")
        result = dict(job.result or {})
        context.emit("result.ready", result)
        return result
    finally:
        watcher_stop.set()
        watcher.join(timeout=1)
        job.add_event = original_add_event  # type: ignore[method-assign]


def create_and_submit(
    *,
    run_id: str,
    simulator: str,
    deck_file: str,
    working_dir: str,
    output_dir: str,
    command: list[str],
    log_path: str,
    timeout: float,
    input_inspection: dict[str, Any],
    agent_metadata: dict[str, Any] | None = None,
) -> dict[str, Any] | None:
    """Create a native Run and submit it, returning ``None`` if unavailable."""
    runtime = _plugin()
    if runtime is None or not getattr(runtime.executor_service, "started", False):
        return None
    now = time.time()
    job_store = None
    try:
        from . import job_store

        job_store.save_job(
            run_id,
            {
                "job_id": run_id,
                "simulator": simulator,
                "deck_file": deck_file,
                "working_dir": output_dir,
                "execution_dir": working_dir,
                "output_dir": output_dir,
                "pid": 0,
                "status": "queued",
                "start_ts": now,
                "timeout": timeout,
                "returncode": None,
                "error": None,
                "log_path": log_path,
                "command": command,
                "case_stem": Path(deck_file).stem,
                "input_inspection": input_inspection,
                "source_run_id": run_id,
                "native_run_id": run_id,
                **(agent_metadata or {}),
            },
        )
        run = runtime.repository.create_run(
            {
                "run_id": run_id,
                "operation": "simulation.run",
                "provider_id": SIMULATION_PROVIDER,
                "status": "queued",
                "input_snapshot": {
                    "simulator": simulator,
                    "deck_file": deck_file,
                    "working_dir": working_dir,
                    "output_dir": output_dir,
                    "command": list(command),
                    "timeout": timeout,
                    "input_inspection": input_inspection,
                },
                "simulator": simulator,
                "deck_file": deck_file,
                "working_dir": working_dir,
                "output_dir": output_dir,
                "command": list(command),
                "log_path": log_path,
                "timeout": timeout,
                "start_ts": now,
                "input_inspection": input_inspection,
                "stages": [
                    {"stage_id": "prepare", "operation": "simulation.prepare", "ordinal": 0},
                    {"stage_id": "execute", "operation": "simulation.execute", "ordinal": 1},
                    {"stage_id": "finalize", "operation": "simulation.finalize", "ordinal": 2},
                ],
                "provenance": {
                    "provider_id": SIMULATION_PROVIDER,
                    "provider_version": "1.0",
                    "metadata": {"simulator": simulator, "input_inspection": input_inspection},
                },
            }
        )
        runtime.executor_service.submit(run_id)
        return run
    except Exception:
        # Do not leave a compatibility job behind if native creation/submission
        # fails; callers can safely fall back to the historical launcher.
        if job_store is not None:
            try:
                job_store.remove_job(run_id)
            except Exception:
                pass
        raise


def create_import_run(
    *,
    run_id: str,
    name: str,
    upload_path: Path,
    prop_path: Path | None,
    bin_dir: Path,
    companion_paths: list[Path],
) -> dict[str, Any] | None:
    """Create and submit a native ``visualization.import`` Run."""
    runtime = _plugin()
    if runtime is None or not getattr(runtime.executor_service, "started", False):
        return None
    payload = {
        "run_id": run_id,
        "operation": "visualization.import",
        "provider_id": "ugsci.visualization",
        "status": "queued",
        "name": name,
        "upload_path": str(upload_path),
        "prop_path": str(prop_path) if prop_path else None,
        "bin_dir": str(bin_dir),
        "companion_paths": [str(item) for item in companion_paths],
        "input_snapshot": {
            "name": name,
            "upload_path": str(upload_path),
            "prop_path": str(prop_path) if prop_path else None,
            "bin_dir": str(bin_dir),
            "companion_paths": [str(item) for item in companion_paths],
        },
        "stages": [
            {"stage_id": "validate", "operation": "visualization.import.validate", "ordinal": 0},
            {"stage_id": "convert", "operation": "visualization.import.convert", "ordinal": 1},
            {"stage_id": "publish", "operation": "visualization.import.publish", "ordinal": 2},
        ],
        "provenance": {
            "provider_id": "ugsci.visualization",
            "provider_version": "0.1.0",
            "metadata": {"name": name},
        },
    }
    run = runtime.repository.create_run(payload)
    runtime.executor_service.submit(run_id)
    return run


__all__ = [
    "SIMULATION_PROVIDER",
    "available",
    "create_and_submit",
    "create_import_run",
    "execute_simulation",
    "execute_visualization_import",
    "loaded",
]
