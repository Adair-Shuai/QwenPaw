# -*- coding: utf-8 -*-
"""Local production workbench HTTP API with nonblocking import jobs."""

from __future__ import annotations

import threading
import uuid
from concurrent.futures import ThreadPoolExecutor

from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field

from .analysis import analyze, markdown_report
from .store import DatasetStore
from .tools import save_report


class ImportRequest(BaseModel):
    input_path: str = Field(min_length=1, max_length=4096)


class AnalysisRequest(BaseModel):
    dataset_id: str = Field(pattern=r"^[a-f0-9]{24}$")
    facility: str = Field(default="", max_length=128)
    well: str = Field(default="", max_length=128)
    start: str = ""
    end: str = ""
    cycle_start_month: int = Field(default=4, ge=1, le=12)
    drop_threshold_pct: float = Field(default=30, gt=0, le=100)


def build_storage_dynamics_router(
    store: DatasetStore | None = None,
) -> APIRouter:
    store = store or DatasetStore()
    router = APIRouter()
    jobs: dict[str, dict] = {}
    lock = threading.Lock()
    executor = ThreadPoolExecutor(
        max_workers=1,
        thread_name_prefix="ugsci-history",
    )

    @router.get("/datasets")
    def datasets():
        return {"datasets": store.list()}

    @router.post("/imports", status_code=202)
    def import_data(body: ImportRequest):
        job_id = uuid.uuid4().hex
        with lock:
            if any(
                j["status"] in ("queued", "running") for j in jobs.values()
            ):
                raise HTTPException(409, "已有导入正在进行，请等待完成")
            if len(jobs) >= 100:
                jobs.clear()
            jobs[job_id] = {"id": job_id, "status": "queued"}

        def run():
            with lock:
                jobs[job_id]["status"] = "running"
            try:
                manifest = store.import_path(body.input_path)
                with lock:
                    jobs[job_id].update(status="completed", dataset=manifest)
            except Exception as exc:
                with lock:
                    jobs[job_id].update(status="failed", error=str(exc))

        executor.submit(run)
        return {"id": job_id, "status": "queued"}

    @router.get("/imports/{job_id}")
    def import_status(job_id: str):
        with lock:
            if job_id not in jobs:
                raise HTTPException(404, "导入任务不存在，可能平台已重启")
            return dict(jobs[job_id])

    def compute(body):
        try:
            return analyze(store, **body.model_dump())
        except FileNotFoundError as exc:
            raise HTTPException(404, str(exc)) from exc
        except ValueError as exc:
            raise HTTPException(422, str(exc)) from exc

    @router.post("/analyze")
    def analysis(body: AnalysisRequest):
        return compute(body)

    @router.post("/report")
    def report(body: AnalysisRequest):
        result = compute(body)
        return save_report(store, result)

    @router.post("/export", response_class=PlainTextResponse)
    def export(body: AnalysisRequest):
        return PlainTextResponse(
            markdown_report(compute(body)),
            media_type="text/markdown; charset=utf-8",
            headers={
                "Content-Disposition": "attachment; "
                'filename="storage-dynamics-report.md'
                '"',
            },
        )

    return router
