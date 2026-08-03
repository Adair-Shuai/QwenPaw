# -*- coding: utf-8 -*-
"""UIdeas - 科研灵感管理应用后端。

API（前缀 /api/uideas）：
- GET    /ideas            灵感列表（支持 ?status=）
- POST   /ideas            新建灵感
- GET    /ideas/{id}       灵感详情（含扩充结果）
- PATCH  /ideas/{id}       更新灵感（标题/内容/标签/状态/归档）
- DELETE /ideas/{id}       删除灵感
- POST   /analyze          L1 聚类整理
- POST   /expand/{id}      L2 单条扩充
- POST   /think            立即执行一轮 L3 主动思考
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
from pathlib import Path
from typing import Any, Dict, List, Optional

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
    content: str = ""
    tags: List[str] = []
    source: str = "user"


class IdeaUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None
    cluster_id: Optional[str] = None


class SuggestionStatusUpdate(BaseModel):
    status: str


class MetaUpdate(BaseModel):
    proactive_enabled: Optional[bool] = None
    interval_minutes: Optional[int] = None
    min_ideas: Optional[int] = None
    analyze_skill: Optional[str] = None
    expand_skill: Optional[str] = None
    think_skill: Optional[str] = None


# ─── 灵感 ───────────────────────────────────────────────────────────

@router.get("/ideas")
async def list_ideas(
    status: Optional[str] = None,
    ctx=Depends(get_ctx),
):
    proactive.cache_ctx(ctx)
    from store import get_ideas

    ideas = await get_ideas(ctx)
    if status:
        ideas = [i for i in ideas if i.get("status") == status]
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

    try:
        result = await organize_ideas(ctx)
    except Exception as exc:  # pylint: disable=broad-except
        logger.warning("[uideas] analyze failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    from sse import broadcast

    await broadcast(
        {
            "type": "analyze:done",
            "cluster_count": result.get("cluster_count", 0),
            "tagged": result.get("tagged", 0),
        }
    )
    return result


@router.post("/expand/{idea_id}")
async def expand(idea_id: str, ctx=Depends(get_ctx)):
    proactive.cache_ctx(ctx)
    from analyze import expand_idea
    from store import get_idea

    idea = await get_idea(ctx, idea_id)
    if idea is None:
        raise HTTPException(status_code=404, detail="not found")
    try:
        result = await expand_idea(ctx, idea)
    except Exception as exc:  # pylint: disable=broad-except
        logger.warning("[uideas] expand failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    from sse import broadcast

    await broadcast({"type": "expand:done", "idea": result})
    return {"idea": result}


@router.post("/think")
async def think(ctx=Depends(get_ctx)):
    proactive.cache_ctx(ctx)
    from store import is_thinking_available

    if not await is_thinking_available(ctx):
        from store import get_meta

        meta = await get_meta(ctx)
        return {
            "skipped": True,
            "reason": "cooldown",
            "meta": meta,
        }
    try:
        result = await proactive.think_once(ctx)
    except Exception as exc:  # pylint: disable=broad-except
        logger.warning("[uideas] think failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return result


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
    return {"meta": meta}


@router.patch("/meta")
async def patch_meta(body: MetaUpdate, ctx=Depends(get_ctx)):
    proactive.cache_ctx(ctx)
    from store import get_meta, save_meta

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
