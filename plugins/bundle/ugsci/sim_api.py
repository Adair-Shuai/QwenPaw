# -*- coding: utf-8 -*-
"""Simulation job monitoring HTTP routes for UGSci."""

from __future__ import annotations

import asyncio
import json
import logging
import time
from typing import Any

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.sim_api")


def build_sim_router(plugin_id: str) -> APIRouter:
    """Build job-list and server-sent-event monitoring routes."""
    router = APIRouter()

    @router.get("/jobs")
    def list_sim_jobs() -> dict[str, Any]:
        try:
            from .engine.tools import job_store
            from .engine.tools.launcher import get_all_jobs

            result: dict[str, Any] = {}
            for job_id, metadata in job_store.list_jobs().items():
                result[job_id] = {
                    "job_id": metadata.get("job_id", job_id),
                    "simulator": metadata.get("simulator", ""),
                    "status": metadata.get("status", "unknown"),
                    "deck_file": metadata.get("deck_file", ""),
                    "pid": metadata.get("pid", 0),
                    "start_ts": metadata.get("start_ts"),
                    "end_ts": metadata.get("end_ts"),
                }
            for job_id, job in get_all_jobs().items():
                result[job_id] = {
                    "job_id": job.job_id,
                    "simulator": job.simulator,
                    "status": job.status,
                    "deck_file": job.deck_file,
                    "pid": job.pid,
                    "start_ts": job.start_ts if job.start_ts > 0 else None,
                    "end_ts": job.end_ts,
                }
            return {"jobs": list(result.values())}
        except Exception as exc:
            logger.error("[%s] Failed to list jobs: %s", plugin_id, exc)
            return {"jobs": [], "error": str(exc)}

    @router.get("/jobs/{job_id}/stream")
    async def job_stream(job_id: str, request: Request):
        async def event_stream():
            try:
                from .engine.tools import job_store
                from .engine.tools.launcher import _get_job
            except Exception:
                yield ("data: " f"{json.dumps({'error': 'Job store unavailable'})}\n\n")
                return

            terminal_states = {
                "completed",
                "failed",
                "timeout",
                "error",
                "interrupted",
                "cancelled",
            }
            try:
                cursor = max(0, int(request.headers.get("last-event-id") or 0))
            except (TypeError, ValueError):
                cursor = 0
            replayed_any = False
            for stored_event in job_store.list_job_events(job_id, cursor):
                replayed_any = True
                cursor = stored_event["sequence"]
                yield (
                    f"id: {cursor}\nevent: simulation\n"
                    f"data: {json.dumps(stored_event['data'])}\n\n"
                )
            last_heartbeat = time.monotonic()
            while True:
                if await request.is_disconnected():
                    return
                job = _get_job(job_id)
                if not job:
                    yield (
                        "data: "
                        f"{json.dumps({'error': 'Job not found', 'job_id': job_id})}"
                        "\n\n"
                    )
                    return

                data: dict[str, Any] = {
                    "job_id": job.job_id,
                    "status": job.status,
                    "simulator": job.simulator,
                    "pid": job.pid,
                }
                if job.start_ts > 0:
                    elapsed = time.time() - job.start_ts
                    data["elapsed"] = round(elapsed, 1)
                    data["remaining"] = (
                        None if job.unlimited else round(max(0, job.timeout - elapsed), 1)
                    )
                if job.returncode is not None:
                    data["returncode"] = job.returncode
                if job.error:
                    data["error"] = job.error
                if job.end_ts:
                    data["end_ts"] = job.end_ts

                try:
                    sequence, changed = job_store.append_job_event_if_changed(
                        job_id,
                        data,
                    )
                except Exception as exc:
                    # Keep the live stream useful during a transient store
                    # outage; the next poll can persist/replay the snapshot.
                    logger.warning("Failed to persist simulation SSE event %s: %s", job_id, exc)
                    sequence, changed = cursor, False
                # Avoid duplicating a terminal event already replayed on
                # reconnect, while still emitting current state if history
                # retention removed the event behind the supplied cursor.
                if changed or (job.status in terminal_states and not replayed_any):
                    cursor = sequence
                    yield (
                        f"id: {sequence}\nevent: simulation\n"
                        f"data: {json.dumps(data)}\n\n"
                    )
                    last_heartbeat = time.monotonic()
                elif time.monotonic() - last_heartbeat >= 15:
                    yield f": heartbeat {int(time.time())}\n\n"
                    last_heartbeat = time.monotonic()
                if job.status in terminal_states:
                    return
                try:
                    await asyncio.sleep(5)
                except asyncio.CancelledError:
                    return

        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    return router


__all__ = ["build_sim_router"]
