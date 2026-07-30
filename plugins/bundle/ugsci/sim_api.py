# -*- coding: utf-8 -*-
"""Simulation job monitoring HTTP routes for UGSci."""

from __future__ import annotations

import asyncio
import json
import logging
import time
from typing import Any

from fastapi import APIRouter
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
    async def job_stream(job_id: str):
        async def event_stream():
            try:
                from .engine.tools.launcher import _get_job
            except Exception:
                yield ("data: " f"{json.dumps({'error': 'Job store unavailable'})}\n\n")
                return

            while True:
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
                    data["remaining"] = round(
                        max(0, job.timeout - elapsed),
                        1,
                    )
                if job.returncode is not None:
                    data["returncode"] = job.returncode
                if job.error:
                    data["error"] = job.error
                if job.end_ts:
                    data["end_ts"] = job.end_ts

                yield f"data: {json.dumps(data)}\n\n"
                if job.status in {
                    "completed",
                    "failed",
                    "timeout",
                    "error",
                }:
                    return
                await asyncio.sleep(5)

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
