# -*- coding: utf-8 -*-
"""ULit persistent job runner with SSE streaming.

Jobs are persisted in SQLite (the ``jobs`` table).  SSE channels are
in-memory and used only for real-time event delivery — the database
is the source of truth for job state.

Architecture:
    1. API handler calls ``JobRunner.enqueue(job_type, payload, ctx)``
    2. Runner creates a DB row + SSE channel, then launches asyncio task
    3. Handler calls ``ctx.ui.push()`` or ``runner.update_progress()``
    4. Frontend subscribes to SSE stream via ``/jobs/{id}/stream``
    5. On completion/failure, DB row is updated and channel is closed
    6. On startup, interrupted jobs are recovered
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any, Dict, Optional

from fastapi.responses import StreamingResponse

from . import repository as repo
from .enums import JobType
from .services import IngestService, AIService

logger = logging.getLogger(__name__)

# In-memory SSE channels: job_id -> SSEChannel
_CHANNELS: Dict[str, "SSEChannel"] = {}

# In-memory running tasks: job_id -> asyncio.Task
_RUNNING: Dict[str, "asyncio.Task"] = {}


class SSEChannel:
    """Simple async-safe SSE channel for job progress events."""

    def __init__(self, max_buffer: int = 500):
        self._queue: asyncio.Queue = asyncio.Queue(maxsize=max_buffer)
        self._closed = False
        self._event_id = 0

    async def send_event(self, data: dict) -> None:
        if self._closed:
            return
        self._event_id += 1
        data = {**data, "event_id": self._event_id}
        try:
            self._queue.put_nowait(data)
        except asyncio.QueueFull:
            logger.warning("[ulit] SSE channel full, dropping event for job")

    def close(self) -> None:
        self._closed = True
        try:
            self._queue.put_nowait(None)
        except asyncio.QueueFull:
            pass

    @property
    def is_closed(self) -> bool:
        return self._closed

    async def __aiter__(self):
        while True:
            if self._closed and self._queue.empty():
                break
            try:
                event = await asyncio.wait_for(self._queue.get(), timeout=30.0)
            except asyncio.TimeoutError:
                yield ": keepalive\n\n"
                continue
            if event is None:
                break
            yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"


class JobRunner:
    """Manages background jobs with persistent state and SSE streaming."""

    @staticmethod
    def enqueue(
        job_type: str,
        payload: dict | None = None,
        *,
        ctx: Any = None,
        paper_id: Optional[str] = None,
        project_id: Optional[str] = None,
    ) -> dict:
        """Create a job in the DB and start execution.

        Returns the job record dict.
        """
        job = repo.create_job(
            job_type,
            payload or {},
            paper_id=paper_id,
            project_id=project_id,
        )

        # Create SSE channel
        _CHANNELS[job["id"]] = SSEChannel()

        # Launch background task
        if ctx is not None:
            task = asyncio.create_task(
                _execute_job(job, ctx)
            )
            _RUNNING[job["id"]] = task
        return job

    @staticmethod
    async def update_progress(job_id: str, progress: float, stage: str = "", message: str = "") -> None:
        """Update job progress and push SSE event."""
        repo.update_job(job_id, state="running", progress=progress)
        ch = _CHANNELS.get(job_id)
        if ch is not None:
            await ch.send_event({
                "type": "progress",
                "job_id": job_id,
                "stage": stage,
                "progress": progress,
                "message": message,
            })

    @staticmethod
    async def send_event(job_id: str, event: dict) -> None:
        """Send a custom SSE event for a job."""
        ch = _CHANNELS.get(job_id)
        if ch is not None:
            await ch.send_event(event)

    @staticmethod
    def get_channel(job_id: str) -> Optional[SSEChannel]:
        return _CHANNELS.get(job_id)

    @staticmethod
    def get_stream_response(job_id: str) -> StreamingResponse:
        """Return a StreamingResponse for the job's SSE stream."""
        ch = _CHANNELS.get(job_id)
        if ch is None:
            # Job may have completed; create a transient channel
            ch = SSEChannel()
            job = repo.get_job(job_id)
            if job:
                # Replay final state
                asyncio.create_task(ch.send_event({
                    "type": "state",
                    "job_id": job_id,
                    "state": job["state"],
                    "progress": job["progress"],
                    "result": job.get("result", {}),
                    "error": job.get("error", {}),
                }))
                asyncio.create_task(asyncio.sleep(0.1))
                ch.close()
            _CHANNELS[job_id] = ch

        async def _gen():
            try:
                async for chunk in ch:
                    yield chunk
            finally:
                if _CHANNELS.get(job_id) is ch:
                    _CHANNELS.pop(job_id, None)

        return StreamingResponse(
            _gen(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                "Connection": "keep-alive",
            },
        )

    @staticmethod
    async def cancel_job(job_id: str) -> dict | None:
        """Request cancellation of a running job."""
        job = repo.get_job(job_id)
        if job is None:
            return None
        if job["state"] not in ("running", "queued"):
            return job

        repo.update_job(job_id, state="cancelling")
        task = _RUNNING.pop(job_id, None)
        if task is not None and not task.done():
            task.cancel()
        ch = _CHANNELS.get(job_id)
        if ch is not None:
            await ch.send_event({"type": "cancelled", "job_id": job_id})
            ch.close()

        repo.update_job(job_id, state="cancelled", progress=0.0)
        return repo.get_job(job_id)

    @staticmethod
    async def retry_job(job_id: str, ctx: Any) -> dict | None:
        """Retry a failed or interrupted job."""
        job = repo.get_job(job_id)
        if job is None:
            return None
        if job["state"] not in ("failed", "interrupted", "cancelled"):
            return job

        repo.update_job(job_id, state="queued", progress=0.0)
        _CHANNELS[job_id] = SSEChannel()
        task = asyncio.create_task(_execute_job(job, ctx))
        _RUNNING[job_id] = task
        return repo.get_job(job_id)

    @staticmethod
    def recover_on_startup() -> list[dict]:
        """Recover interrupted jobs on startup."""
        recovered = repo.recover_interrupted_jobs()
        if recovered:
            logger.info("[ulit] Recovered %d interrupted jobs", len(recovered))
        return recovered

    @staticmethod
    def shutdown() -> None:
        """Cancel all running tasks on shutdown."""
        for job_id, task in list(_RUNNING.items()):
            if not task.done():
                task.cancel()
        _RUNNING.clear()
        for ch in _CHANNELS.values():
            ch.close()
        _CHANNELS.clear()


async def _execute_job(job: dict, ctx: Any) -> None:
    """Execute a single job based on its type."""
    job_id = job["id"]
    job_type = job["type"]
    payload = job.get("payload", {})

    try:
        repo.update_job(job_id, state="running", progress=0.0)

        if job_type == JobType.IMPORT_FILE.value:
            await _handle_import_file(job_id, payload, ctx)
        elif job_type == JobType.PARSE_DOCUMENT.value:
            await _handle_parse_document(job_id, payload, ctx)
        elif job_type == JobType.GENERATE_READING_CARD.value:
            await _handle_reading_card(job_id, payload, ctx)
        elif job_type == JobType.ANSWER_QUESTION.value:
            await _handle_answer_question(job_id, payload, ctx)
        elif job_type == JobType.EXPORT_BUNDLE.value:
            await _handle_export(job_id, payload, ctx)
        else:
            logger.warning("[ulit] Unknown job type: %s", job_type)
            repo.update_job(job_id, state="failed", error={"message": f"Unknown job type: {job_type}"})

    except asyncio.CancelledError:
        repo.update_job(job_id, state="cancelled", progress=0.0)
        raise
    except Exception as exc:
        logger.exception("[ulit] Job %s failed", job_id)
        repo.update_job(
            job_id, state="failed",
            error={"message": str(exc), "type": type(exc).__name__},
        )
        ch = _CHANNELS.get(job_id)
        if ch is not None:
            await ch.send_event({"type": "error", "job_id": job_id, "message": str(exc)})
    finally:
        ch = _CHANNELS.get(job_id)
        if ch is not None:
            await ch.send_event({"type": "done", "job_id": job_id})
            ch.close()
        _RUNNING.pop(job_id, None)


async def _handle_import_file(job_id: str, payload: dict, ctx: Any) -> None:
    """Handle PDF file import job."""
    file_data_b64 = payload.get("file_data")
    filename = payload.get("filename", "upload.pdf")
    project_id = payload.get("project_id")

    import base64
    import binascii

    if not file_data_b64:
        raise ValueError("file_data required for import_file job")

    await JobRunner.update_progress(job_id, 0.1, "receiving", "接收文件")
    try:
        data = base64.b64decode(file_data_b64, validate=True)
    except (ValueError, binascii.Error):
        raise ValueError("Invalid base64 file_data payload") from None

    await JobRunner.update_progress(job_id, 0.3, "hashing", "计算文件哈希")
    paper = await IngestService.import_pdf_bytes(data, filename, project_id=project_id)

    await JobRunner.update_progress(job_id, 0.6, "metadata", "提取元数据")
    # If paper has a file, parse it
    if paper.get("file"):
        await JobRunner.update_progress(job_id, 0.7, "parsing", "解析 PDF 文本")
        try:
            doc = await IngestService.parse_document(paper["file"]["id"])
            await JobRunner.update_progress(job_id, 0.9, "indexing", "建立全文索引")
        except Exception as exc:
            logger.warning("[ulit] PDF parsing failed for %s: %s", paper.get("id"), exc)

    await JobRunner.update_progress(job_id, 1.0, "complete", "导入完成")
    repo.update_job(job_id, state="succeeded", progress=1.0, result={"paper_id": paper["id"]})

    ch = _CHANNELS.get(job_id)
    if ch is not None:
        await ch.send_event({"type": "result", "paper": paper})


async def _handle_parse_document(job_id: str, payload: dict, ctx: Any) -> None:
    """Handle document parsing job."""
    file_id = payload.get("file_id")
    if not file_id:
        raise ValueError("file_id required")

    await JobRunner.update_progress(job_id, 0.2, "extracting", "提取页面文本")
    doc = await IngestService.parse_document(file_id)
    await JobRunner.update_progress(job_id, 0.8, "chunking", "切分检索块")
    await JobRunner.update_progress(job_id, 1.0, "complete", "解析完成")
    repo.update_job(job_id, state="succeeded", progress=1.0, result={"document_id": doc["id"]})


async def _handle_reading_card(job_id: str, payload: dict, ctx: Any) -> None:
    """Handle reading card generation."""
    paper_id = payload.get("paper_id")
    if not paper_id:
        raise ValueError("paper_id required")

    await JobRunner.update_progress(job_id, 0.2, "retrieving", "检索文献上下文")
    result = await AIService.generate_reading_card(ctx, paper_id)
    await JobRunner.update_progress(job_id, 1.0, "complete", "阅读卡生成完成")
    repo.update_job(job_id, state="succeeded", progress=1.0, result=result)

    ch = _CHANNELS.get(job_id)
    if ch is not None:
        await ch.send_event({"type": "result", "card": result})


async def _handle_answer_question(job_id: str, payload: dict, ctx: Any) -> None:
    """Handle AI Q&A job."""
    paper_id = payload.get("paper_id")
    question = payload.get("question", "")
    scope = payload.get("scope", "paper")
    selected_text = payload.get("selected_text")
    page_index = payload.get("page_index")

    if not paper_id or not question:
        raise ValueError("paper_id and question required")

    await JobRunner.update_progress(job_id, 0.3, "retrieving", "检索文献上下文")
    result = await AIService.ask(
        ctx, question,
        paper_id=paper_id, scope=scope,
        selected_text=selected_text, page_index=page_index,
    )
    await JobRunner.update_progress(job_id, 1.0, "complete", "回答完成")
    repo.update_job(job_id, state="succeeded", progress=1.0, result=result)

    ch = _CHANNELS.get(job_id)
    if ch is not None:
        await ch.send_event({"type": "result", "answer": result})


async def _handle_export(job_id: str, payload: dict, ctx: Any) -> None:
    """Handle export job."""
    from .services import ExportService

    fmt = payload.get("format", "markdown")
    project_id = payload.get("project_id")
    paper_ids = payload.get("paper_ids", [])

    await JobRunner.update_progress(job_id, 0.3, "collecting", "收集数据")
    if fmt == "markdown":
        content = await ExportService.export_markdown(
            project_id=project_id, paper_ids=paper_ids or None,
        )
    elif fmt == "bibtex":
        content = await ExportService.export_bibtex(
            project_id=project_id, paper_ids=paper_ids or None,
        )
    elif fmt == "json":
        content = await ExportService.export_json(
            project_id=project_id, paper_ids=paper_ids or None,
        )
    elif fmt == "csv":
        if not project_id:
            raise ValueError("project_id required for CSV export")
        import csv as _csv
        import io as _io
        from . import repository as repo
        evidence = await asyncio.to_thread(repo.list_evidence, project_id)
        buf = _io.StringIO()
        writer = _csv.writer(buf)
        writer.writerow(["id", "paper_id", "claim", "quote", "kind", "verification_status", "page_index"])
        for e in evidence:
            writer.writerow([
                e.get("id", ""),
                e.get("paper_id", ""),
                e.get("claim", ""),
                e.get("quote", ""),
                e.get("kind", ""),
                e.get("verification_status", ""),
                str(e.get("page_index", "")),
            ])
        content = buf.getvalue()
    else:
        raise ValueError(f"Unknown export format: {fmt}")

    await JobRunner.update_progress(job_id, 1.0, "complete", "导出完成")
    repo.update_job(job_id, state="succeeded", progress=1.0, result={"format": fmt, "size": len(content)})
    # Store export content in cache
    ch = _CHANNELS.get(job_id)
    if ch is not None:
        await ch.send_event({"type": "result", "format": fmt, "content": content})
