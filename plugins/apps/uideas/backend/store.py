# -*- coding: utf-8 -*-
"""UIdeas 数据存储层。

基于 PawAppContext.storage（命名空间 pawapp:uideas 的 KV）持久化：
- ideas      : 灵感记录列表
- clusters   : L1 整理产出的聚类方向
- suggestions: L3 主动思考产出的建议
- meta       : 应用元数据（设置、冷却、去重哈希）

所有接口为 async，直接操作 ctx.storage，无文件锁需求。
"""

from __future__ import annotations

import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

IDEA_STATUSES = ("raw", "organized", "expanded", "archived")
SUGGESTION_STATUSES = ("new", "accepted", "dismissed")

DEFAULT_META: Dict[str, Any] = {
    "proactive_enabled": True,
    "interval_minutes": 60,
    "min_ideas": 3,
    "last_think_at": None,
    "cooldown_until": None,
    "seen_hashes": [],
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


# ─── 基础读写 ───────────────────────────────────────────────────────

async def get_ideas(ctx: Any) -> List[Dict[str, Any]]:
    return await ctx.storage.get("ideas", default=[])


async def save_ideas(ctx: Any, ideas: List[Dict[str, Any]]) -> None:
    await ctx.storage.set("ideas", ideas)


async def get_clusters(ctx: Any) -> List[Dict[str, Any]]:
    return await ctx.storage.get("clusters", default=[])


async def save_clusters(ctx: Any, clusters: List[Dict[str, Any]]) -> None:
    await ctx.storage.set("clusters", clusters)


async def get_suggestions(ctx: Any) -> List[Dict[str, Any]]:
    return await ctx.storage.get("suggestions", default=[])


async def save_suggestions(ctx: Any, suggestions: List[Dict[str, Any]]) -> None:
    await ctx.storage.set("suggestions", suggestions)


async def get_meta(ctx: Any) -> Dict[str, Any]:
    meta = await ctx.storage.get("meta", default=None)
    if not isinstance(meta, dict):
        meta = {}
    merged = dict(DEFAULT_META)
    merged.update(meta)
    return merged


async def save_meta(ctx: Any, meta: Dict[str, Any]) -> None:
    merged = dict(DEFAULT_META)
    merged.update(meta)
    await ctx.storage.set("meta", merged)


# ─── 灵感记录操作 ───────────────────────────────────────────────────

async def create_idea(
    ctx: Any,
    *,
    title: str,
    content: str = "",
    tags: Optional[List[str]] = None,
    source: str = "user",
) -> Dict[str, Any]:
    ideas = await get_ideas(ctx)
    now = now_iso()
    idea: Dict[str, Any] = {
        "id": _new_id("idea"),
        "title": title.strip(),
        "content": content.strip(),
        "tags": [t.strip() for t in (tags or []) if t.strip()],
        "status": "raw",
        "source": source,
        "cluster_id": None,
        "created_at": now,
        "updated_at": now,
    }
    ideas.append(idea)
    await save_ideas(ctx, ideas)
    return idea


async def get_idea(ctx: Any, idea_id: str) -> Optional[Dict[str, Any]]:
    ideas = await get_ideas(ctx)
    for idea in ideas:
        if idea.get("id") == idea_id:
            return idea
    return None


async def update_idea(
    ctx: Any,
    idea_id: str,
    *,
    title: Optional[str] = None,
    content: Optional[str] = None,
    tags: Optional[List[str]] = None,
    status: Optional[str] = None,
    cluster_id: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    ideas = await get_ideas(ctx)
    target = None
    for idea in ideas:
        if idea.get("id") == idea_id:
            target = idea
            break
    if target is None:
        return None
    if title is not None:
        target["title"] = title.strip()
    if content is not None:
        target["content"] = content.strip()
    if tags is not None:
        target["tags"] = [t.strip() for t in tags if t.strip()]
    if status is not None:
        if status not in IDEA_STATUSES:
            raise ValueError(f"invalid idea status: {status}")
        target["status"] = status
    if cluster_id is not None:
        target["cluster_id"] = cluster_id or None
    target["updated_at"] = now_iso()
    await save_ideas(ctx, ideas)
    return target


async def delete_idea(ctx: Any, idea_id: str) -> bool:
    ideas = await get_ideas(ctx)
    before = len(ideas)
    ideas = [i for i in ideas if i.get("id") != idea_id]
    if len(ideas) == before:
        return False
    await save_ideas(ctx, ideas)
    # 同时从聚类中移除
    clusters = await get_clusters(ctx)
    changed = False
    for c in clusters:
        if idea_id in c.get("idea_ids", []):
            c["idea_ids"] = [i for i in c["idea_ids"] if i != idea_id]
            changed = True
    if changed:
        await save_clusters(ctx, clusters)
    return True


# ─── 建议操作 ───────────────────────────────────────────────────────

def _suggestion_hash(title: str, body: str) -> str:
    return hashlib.sha256(f"{title}|{body}".encode("utf-8")).hexdigest()[:16]


async def create_suggestion(
    ctx: Any,
    *,
    title: str,
    body: str,
    rationale: str = "",
    source_idea_ids: Optional[List[str]] = None,
) -> Dict[str, Any]:
    suggestions = await get_suggestions(ctx)
    suggestion: Dict[str, Any] = {
        "id": _new_id("sugg"),
        "title": title.strip(),
        "body": body.strip(),
        "rationale": rationale.strip(),
        "source_idea_ids": source_idea_ids or [],
        "status": "new",
        "hash": _suggestion_hash(title, body),
        "created_at": now_iso(),
    }
    suggestions.append(suggestion)
    await save_suggestions(ctx, suggestions)
    return suggestion


async def update_suggestion_status(
    ctx: Any, suggestion_id: str, status: str
) -> Optional[Dict[str, Any]]:
    if status not in SUGGESTION_STATUSES:
        raise ValueError(f"invalid suggestion status: {status}")
    suggestions = await get_suggestions(ctx)
    for s in suggestions:
        if s.get("id") == suggestion_id:
            s["status"] = status
            await save_suggestions(ctx, suggestions)
            return s
    return None


# ─── 元数据工具 ─────────────────────────────────────────────────────

async def record_think(
    ctx: Any,
    *,
    seen_hashes: List[str],
    cooldown_until: Optional[str] = None,
) -> None:
    meta = await get_meta(ctx)
    meta["last_think_at"] = now_iso()
    meta["seen_hashes"] = seen_hashes
    if cooldown_until:
        meta["cooldown_until"] = cooldown_until
    await save_meta(ctx, meta)


async def is_thinking_available(ctx: Any) -> bool:
    """主动思考是否可用：开启 + 冷却已过 + 灵感数达标。"""
    meta = await get_meta(ctx)
    if not meta.get("proactive_enabled", True):
        return False
    ideas = await get_ideas(ctx)
    if len(ideas) < int(meta.get("min_ideas", 3)):
        return False
    cooldown = meta.get("cooldown_until")
    if cooldown:
        try:
            end = datetime.fromisoformat(cooldown)
            if datetime.now(timezone.utc) < end:
                return False
        except (TypeError, ValueError):
            pass
    return True


def export_json(data: Any) -> str:
    return json.dumps(data, ensure_ascii=False, indent=2)
