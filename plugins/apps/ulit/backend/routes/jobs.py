# -*- coding: utf-8 -*-
"""ULit job routes — listing, SSE streaming, cancel/retry."""

from __future__ import annotations

import asyncio

from fastapi import APIRouter, Depends, HTTPException

from qwenpaw.pawapp import get_ctx

from .. import repository as repo
from ..job_runner import JobRunner

router = APIRouter()


@router.get("/jobs")
async def list_jobs(
    state: str | None = None,
    paper_id: str | None = None,
    limit: int = 50,
) -> dict:
    jobs = await asyncio.to_thread(repo.list_jobs, state=state, paper_id=paper_id, limit=limit)
    return {"jobs": jobs}


@router.get("/jobs/{job_id}")
async def get_job(job_id: str) -> dict:
    job = await asyncio.to_thread(repo.get_job, job_id)
    if job is None:
        raise HTTPException(404, "Job not found")
    return job


@router.get("/jobs/{job_id}/stream")
async def stream_job(job_id: str):
    """SSE stream of job progress events."""
    job = await asyncio.to_thread(repo.get_job, job_id)
    if job is None:
        raise HTTPException(404, "Job not found")
    return JobRunner.get_stream_response(job_id)


@router.post("/jobs/{job_id}/cancel")
async def cancel_job(job_id: str) -> dict:
    job = await JobRunner.cancel_job(job_id)
    if job is None:
        raise HTTPException(404, "Job not found")
    return job


@router.post("/jobs/{job_id}/retry")
async def retry_job(
    job_id: str,
    ctx=Depends(get_ctx),
) -> dict:
    job = await JobRunner.retry_job(job_id, ctx)
    if job is None:
        raise HTTPException(404, "Job not found")
    return job
