# -*- coding: utf-8 -*-
"""UIdeas - 科研灵感管理应用后端。

API（前缀 /api/uideas）：
- GET    /ideas            灵感列表（支持 ?status= 和 ?tag=）
- POST   /ideas            新建灵感
- GET    /ideas/{id}       灵感详情（含扩充结果）
- PATCH  /ideas/{id}       更新灵感（标题/内容/标签/状态/归档）
- DELETE /ideas/{id}       删除灵感
- POST   /analyze          L1 聚类整理（异步任务）
- POST   /expand/{id}      L2 单条扩充（异步任务）
- POST   /think            立即执行一轮 L3 主动思考（异步任务）
- GET    /jobs/{id}        查询异步任务
- GET    /suggestions      建议列表（支持 ?status=）
- PATCH  /suggestions/{id} 更新建议状态（accepted/dismissed）
- GET    /clusters         聚类方向列表
- GET    /meta             应用元数据（设置项）
- PATCH  /meta             更新设置（proactive_enabled 等）
- GET    /stream           SSE 事件流（EventSource）
"""

from __future__ import annotations

import json
import logging
import os
import sys
import asyncio
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Awaitable, Callable, Dict, List, Optional

# PluginLoader 将 backend/main.py 以插件根目录为包的搜索路径加载，
# 相对导入不可靠。这里把 backend 目录加入 sys.path，统一使用绝对导入。
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from qwenpaw.pawapp import PawApp
from qwenpaw.pawapp.deps import get_ctx

import proactive
from sse import recent_events, subscribe, unsubscribe

logger = logging.getLogger(__name__)

app = PawApp(name="UIdeas", app_id="uideas")
router = APIRouter()
app.include_router(router)


# ─── 请求/响应模型 ───────────────────────────────────────────────────

class IdeaCreate(BaseModel):
    # 允许空标题：前端支持只写内容，store 会从内容自动提炼标题
    title: str = Field("", max_length=200)
    content: str = Field("", max_length=10000)
    tags: List[str] = Field(default_factory=list, max_length=50)
    related_experiments: List[str] = Field(default_factory=list, max_length=20)
    source: str = "user"


class IdeaUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = Field(None, max_length=10000)
    tags: Optional[List[str]] = Field(None, max_length=50)
    related_experiments: Optional[List[str]] = Field(None, max_length=20)
    status: Optional[str] = None
    cluster_id: Optional[str] = None


class SuggestionStatusUpdate(BaseModel):
    status: str


class MetaUpdate(BaseModel):
    proactive_enabled: Optional[bool] = None
    interval_minutes: Optional[int] = Field(None, ge=10, le=720)
    min_ideas: Optional[int] = Field(None, ge=1, le=100)
    analyze_skill: Optional[str] = None
    expand_skill: Optional[str] = None
    think_skill: Optional[str] = None


# Long-running Agent operations are detached from the HTTP request.  The
# generic app SSE stream carries lifecycle events so the UI stays responsive
# while the result is being generated.
_JOBS: Dict[str, Dict[str, Any]] = {}
_JOB_TASKS: Dict[str, asyncio.Task] = {}


def _job_now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def _run_job(
    job_id: str,
    job_type: str,
    handler: Callable[[], Awaitable[Dict[str, Any]]],
) -> None:
    from sse import broadcast

    job = _JOBS[job_id]
    job["status"] = "running"
    job["started_at"] = _job_now()
    await broadcast({"type": "job:started", "job_id": job_id, "job_type": job_type})
    try:
        result = await handler()
        job["status"] = "done"
        job["result"] = result
        job["finished_at"] = _job_now()
        await broadcast(
            {
                "type": "job:done",
                "job_id": job_id,
                "job_type": job_type,
                "result": {
                    "cluster_count": result.get("cluster_count", 0),
                    "tagged": result.get("tagged", 0),
                    "created_count": len(result.get("created", [])),
                    "idea_id": result.get("idea", {}).get("id"),
                    "warning": result.get("warning"),
                },
            }
        )
    except asyncio.CancelledError:
        job["status"] = "cancelled"
        job["finished_at"] = _job_now()
        raise
    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("[uideas] %s job %s failed", job_type, job_id)
        job["status"] = "error"
        job["error"] = str(exc)
        job["finished_at"] = _job_now()
        await broadcast(
            {
                "type": "job:error",
                "job_id": job_id,
                "job_type": job_type,
                "message": str(exc),
            }
        )
    finally:
        _JOB_TASKS.pop(job_id, None)


async def _enqueue_job(
    job_type: str,
    handler: Callable[[], Awaitable[Dict[str, Any]]],
) -> str:
    if len(_JOBS) >= 100:
        completed = [
            key for key, value in _JOBS.items()
            if value.get("status") in ("done", "error", "cancelled")
        ]
        for key in completed[: max(1, len(completed) - 80)]:
            _JOBS.pop(key, None)
    job_id = f"job_{uuid.uuid4().hex[:12]}"
    _JOBS[job_id] = {
        "id": job_id,
        "type": job_type,
        "status": "queued",
        "created_at": _job_now(),
    }
    _JOB_TASKS[job_id] = asyncio.create_task(_run_job(job_id, job_type, handler))
    return job_id


# ─── 灵感 ───────────────────────────────────────────────────────────

@router.get("/ideas")
async def list_ideas(
    status: Optional[str] = None,
    tag: Optional[str] = None,
    ctx=Depends(get_ctx),
):
    proactive.cache_ctx(ctx)
    from store import get_ideas

    ideas = await get_ideas(ctx)
    if status:
        ideas = [i for i in ideas if i.get("status") == status]
    if tag:
        ideas = [i for i in ideas if tag in (i.get("tags") or [])]
    # 按创建时间倒序
    ideas.sort(key=lambda i: i.get("created_at", ""), reverse=True)
    return {"ideas": ideas}


@router.post("/ideas")
async def create_idea(body: IdeaCreate, ctx=Depends(get_ctx)):
    proactive.cache_ctx(ctx)
    from store import create_idea

    idea = await create_idea(
        ctx,
        title=body.title,
        content=body.content,
        tags=body.tags,
        related_experiments=body.related_experiments,
        source=body.source,
    )
    from sse import broadcast

    await broadcast({"type": "idea:created", "idea": idea})
    return {"idea": idea}


@router.get("/ideas/{idea_id}")
async def get_idea_detail(idea_id: str, ctx=Depends(get_ctx)):
    proactive.cache_ctx(ctx)
    from store import get_idea

    idea = await get_idea(ctx, idea_id)
    if idea is None:
        raise HTTPException(status_code=404, detail="not found")
    return {"idea": idea}


@router.patch("/ideas/{idea_id}")
async def update_idea(idea_id: str, body: IdeaUpdate, ctx=Depends(get_ctx)):
    proactive.cache_ctx(ctx)
    from store import update_idea

    try:
        idea = await update_idea(
            ctx,
            idea_id,
            title=body.title,
            content=body.content,
            tags=body.tags,
            related_experiments=body.related_experiments,
            status=body.status,
            cluster_id=body.cluster_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if idea is None:
        raise HTTPException(status_code=404, detail="not found")
    from sse import broadcast

    await broadcast({"type": "idea:updated", "idea": idea})
    return {"idea": idea}


@router.delete("/ideas/{idea_id}")
async def delete_idea(idea_id: str, ctx=Depends(get_ctx)):
    proactive.cache_ctx(ctx)
    from store import delete_idea

    ok = await delete_idea(ctx, idea_id)
    if not ok:
        raise HTTPException(status_code=404, detail="not found")
    from sse import broadcast

    await broadcast({"type": "idea:deleted", "idea_id": idea_id})
    return {"ok": True}


# ─── L1 整理 / L2 扩充 / L3 思考 ────────────────────────────────────

@router.post("/analyze")
async def analyze(ctx=Depends(get_ctx)):
    proactive.cache_ctx(ctx)
    from analyze import organize_ideas

    job_id = await _enqueue_job("analyze", lambda: organize_ideas(ctx))
    return {"job_id": job_id, "status": "queued"}


@router.post("/expand/{idea_id}")
async def expand(idea_id: str, ctx=Depends(get_ctx)):
    proactive.cache_ctx(ctx)
    from store import get_idea

    idea = await get_idea(ctx, idea_id)
    if idea is None:
        raise HTTPException(status_code=404, detail="not found")
    job_id = await _enqueue_job(
        "expand",
        lambda: _expand_job(ctx, idea),
    )
    return {"job_id": job_id, "status": "queued", "idea_id": idea_id}


async def _expand_job(ctx: Any, idea: Dict[str, Any]) -> Dict[str, Any]:
    from analyze import expand_idea

    return {"idea": await expand_idea(ctx, idea)}


@router.post("/think")
async def think(ctx=Depends(get_ctx)):
    proactive.cache_ctx(ctx)
    from store import is_thinking_available

    # Manual thinking is an explicit user action: it may bypass the global
    # proactive switch and cooldown, but still requires enough active ideas.
    if not await is_thinking_available(ctx, manual=True):
        from store import get_meta

        meta = await get_meta(ctx)
        return {
            "skipped": True,
            "reason": "min_ideas",
            "meta": meta,
        }
    job_id = await _enqueue_job("think", lambda: proactive.think_once(ctx))
    return {"job_id": job_id, "status": "queued"}


@router.get("/jobs/{job_id}")
async def get_job(job_id: str):
    job = _JOBS.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="job not found")
    return {"job": job}


# ─── 建议 ───────────────────────────────────────────────────────────

@router.get("/suggestions")
async def list_suggestions(
    status: Optional[str] = None,
    ctx=Depends(get_ctx),
):
    proactive.cache_ctx(ctx)
    from store import get_suggestions

    suggestions = await get_suggestions(ctx)
    if status:
        suggestions = [s for s in suggestions if s.get("status") == status]
    suggestions.sort(key=lambda s: s.get("created_at", ""), reverse=True)
    return {"suggestions": suggestions}


@router.patch("/suggestions/{suggestion_id}")
async def update_suggestion(
    suggestion_id: str, body: SuggestionStatusUpdate, ctx=Depends(get_ctx)
):
    proactive.cache_ctx(ctx)
    from store import update_suggestion_status

    try:
        suggestion = await update_suggestion_status(ctx, suggestion_id, body.status)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if suggestion is None:
        raise HTTPException(status_code=404, detail="not found")
    from sse import broadcast

    await broadcast({"type": "suggestion:updated", "suggestion": suggestion})
    return {"suggestion": suggestion}


# ─── 聚类 ───────────────────────────────────────────────────────────

@router.get("/clusters")
async def list_clusters(ctx=Depends(get_ctx)):
    proactive.cache_ctx(ctx)
    from store import get_clusters

    clusters = await get_clusters(ctx)
    return {"clusters": clusters}


# ─── 元数据/设置 ────────────────────────────────────────────────────

@router.get("/meta")
async def get_meta(ctx=Depends(get_ctx)):
    proactive.cache_ctx(ctx)
    from store import get_ideas, get_meta, get_suggestions

    meta = await get_meta(ctx)
    ideas = await get_ideas(ctx)
    suggestions = await get_suggestions(ctx)
    meta["idea_count"] = len(ideas)
    meta["suggestion_count"] = len(suggestions)
    meta["raw_count"] = sum(1 for i in ideas if i.get("status") == "raw")
    meta["active_suggestion_count"] = sum(1 for s in suggestions if s.get("status") == "new")
    meta["todo_count"] = sum(1 for item in meta.get("todo_queue", []) if item.get("status") == "todo")
    return {"meta": meta}


@router.patch("/meta")
async def patch_meta(body: MetaUpdate, ctx=Depends(get_ctx)):
    proactive.cache_ctx(ctx)
    from store import get_meta, save_meta, transaction

    async with transaction():
        meta = await get_meta(ctx)
        patch = body.model_dump(exclude_none=True)
        meta.update(patch)
        await save_meta(ctx, meta)
    from sse import broadcast

    await broadcast({"type": "meta:updated", "meta": meta})
    return {"meta": meta}


# ─── SSE 事件流 ─────────────────────────────────────────────────────

@router.get("/stream")
async def stream(ctx=Depends(get_ctx)):
    proactive.cache_ctx(ctx)
    channel = await subscribe()

    async def event_gen():
        try:
            # 先回放最近事件
            for ev in recent_events():
                yield f"data: {json.dumps(ev, ensure_ascii=False)}\n\n"
            # 再实时转发
            async for chunk in channel:
                yield chunk
        finally:
            unsubscribe(channel)

    return StreamingResponse(
        event_gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ─── 生命周期 ───────────────────────────────────────────────────────

@app.on_launch
async def on_launch() -> None:
    await proactive.start_proactive_loop()


@app.on_terminate
async def on_terminate() -> None:
    await proactive.stop_proactive_loop()


# PluginLoader 约定：暴露 plugin = app
plugin = app
