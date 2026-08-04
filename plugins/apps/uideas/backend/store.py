# -*- coding: utf-8 -*-
"""UIdeas 数据存储层。

基于 PawAppContext.storage（命名空间 pawapp:uideas 的 KV）持久化：
- ideas      : 灵感记录列表
- clusters   : L1 整理产出的聚类方向
- suggestions: L3 主动思考产出的建议
- meta       : 应用元数据（设置、冷却、去重哈希）

所有接口为 async。PawApp storage 的单次 set 虽然是原子的，但业务层的
读-改-写仍需要应用级事务锁，否则并发请求会丢更新。
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import re
import uuid
from contextlib import asynccontextmanager
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
    "todo_queue": [],
}

_STORE_LOCK = asyncio.Lock()
_HASHTAG_RE = re.compile(r"(?<!\w)#([^\s#@，。；;,.!?！？]+)")
_EXPERIMENT_RE = re.compile(r"(?<!\w)@([^\s#@，。；;,.!?！？]+)")


@asynccontextmanager
async def transaction():
    """Serialize complete read-modify-write transactions in this process."""
    async with _STORE_LOCK:
        yield


def parse_inline_metadata(text: str) -> tuple[List[str], List[str]]:
    """Extract ``#tags`` and ``@experiment`` markers from free-form text."""
    if not text:
        return [], []
    tags = list(dict.fromkeys(m.group(1).strip() for m in _HASHTAG_RE.finditer(text)))
    experiments = list(
        dict.fromkeys(m.group(1).strip() for m in _EXPERIMENT_RE.finditer(text))
    )
    return tags, experiments


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
    related_experiments: Optional[List[str]] = None,
    source: str = "user",
) -> Dict[str, Any]:
    async with transaction():
        ideas = await get_ideas(ctx)
        now = now_iso()
        title = title.strip()
        content = content.strip()
        if not title:
            first_line = content.splitlines()[0] if content.splitlines() else content
            title = (first_line[:40] or "未命名灵感").strip()
        parsed_tags, parsed_experiments = parse_inline_metadata(
            f"{title}\n{content}"
        )
        idea: Dict[str, Any] = {
            "id": _new_id("idea"),
            "title": title,
            "content": content,
            "tags": list(
                dict.fromkeys(
                    [t.strip() for t in (tags or []) if t.strip()] + parsed_tags
                )
            ),
            "related_experiments": list(
                dict.fromkeys(
                    [e.strip() for e in (related_experiments or []) if e.strip()]
                    + parsed_experiments
                )
            ),
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
    related_experiments: Optional[List[str]] = None,
    status: Optional[str] = None,
    cluster_id: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    async with transaction():
        ideas = await get_ideas(ctx)
        target = next((i for i in ideas if i.get("id") == idea_id), None)
        if target is None:
            return None
        if title is not None:
            target["title"] = title.strip()
        if content is not None:
            target["content"] = content.strip()
            parsed_tags, parsed_experiments = parse_inline_metadata(
                f"{target.get('title', '')}\n{target['content']}"
            )
            if tags is None:
                tags = target.get("tags") or []
            if related_experiments is None:
                related_experiments = target.get("related_experiments") or []
            tags = list(dict.fromkeys(list(tags) + parsed_tags))
            related_experiments = list(
                dict.fromkeys(list(related_experiments) + parsed_experiments)
            )
        if tags is not None:
            target["tags"] = [t.strip() for t in tags if t.strip()]
        if related_experiments is not None:
            target["related_experiments"] = [
                e.strip() for e in related_experiments if e.strip()
            ]
        if status is not None:
            if status not in IDEA_STATUSES:
                raise ValueError(f"invalid idea status: {status}")
            if status == "archived" and target.get("status") != "archived":
                target["status_before_archive"] = target.get("status", "raw")
            elif target.get("status") == "archived" and status != "archived":
                target.pop("status_before_archive", None)
            target["status"] = status
        if cluster_id is not None:
            target["cluster_id"] = cluster_id or None
        if not target.get("title"):
            first_line = (target.get("content") or "").splitlines()
            target["title"] = (first_line[0][:40] if first_line else "未命名灵感")
        target["updated_at"] = now_iso()
        await save_ideas(ctx, ideas)
        return target


async def delete_idea(ctx: Any, idea_id: str) -> bool:
    async with transaction():
        ideas = await get_ideas(ctx)
        before = len(ideas)
        ideas = [i for i in ideas if i.get("id") != idea_id]
        if len(ideas) == before:
            return False
        await save_ideas(ctx, ideas)
        clusters = await get_clusters(ctx)
        changed = False
        for c in clusters:
            if idea_id in c.get("idea_ids", []):
                c["idea_ids"] = [i for i in c["idea_ids"] if i != idea_id]
                changed = True
        if changed:
            await save_clusters(ctx, clusters)
        suggestions = await get_suggestions(ctx)
        suggestion_changed = False
        for suggestion in suggestions:
            old_ids = suggestion.get("source_idea_ids") or []
            new_ids = [i for i in old_ids if i != idea_id]
            if new_ids != old_ids:
                suggestion["source_idea_ids"] = new_ids
                suggestion_changed = True
        if suggestion_changed:
            await save_suggestions(ctx, suggestions)
        return True


async def save_expansion(
    ctx: Any,
    idea_id: str,
    *,
    title: str,
    expansion: str,
    related_tags: Optional[List[str]] = None,
) -> Optional[Dict[str, Any]]:
    """Commit an expansion and its metadata in one transaction."""
    async with transaction():
        ideas = await get_ideas(ctx)
        target = next((i for i in ideas if i.get("id") == idea_id), None)
        if target is None:
            return None
        target["title"] = title.strip() or target.get("title", "未命名灵感")
        target["tags"] = list(
            dict.fromkeys(
                (target.get("tags") or [])
                + [t.strip() for t in (related_tags or []) if t.strip()]
            )
        )
        target["status"] = "expanded"
        target["expansion"] = expansion.strip()
        target["expansion_version"] = int(target.get("expansion_version", 0)) + 1
        target["expanded_at"] = now_iso()
        target["updated_at"] = now_iso()
        await save_ideas(ctx, ideas)
        return target


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
    async with transaction():
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
    async with transaction():
        suggestions = await get_suggestions(ctx)
        for s in suggestions:
            if s.get("id") == suggestion_id:
                if status == "accepted" and s.get("status") != "accepted":
                    s["accepted_at"] = now_iso()
                    meta = await get_meta(ctx)
                    queue = list(meta.get("todo_queue") or [])
                    if not any(item.get("suggestion_id") == suggestion_id for item in queue):
                        queue.append(
                            {
                                "id": _new_id("todo"),
                                "suggestion_id": suggestion_id,
                                "title": s.get("title", ""),
                                "body": s.get("body", ""),
                                "idea_ids": s.get("source_idea_ids") or [],
                                "status": "todo",
                                "created_at": now_iso(),
                            }
                        )
                    meta["todo_queue"] = queue
                    await save_meta(ctx, meta)
                s["status"] = status
                s["updated_at"] = now_iso()
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
    async with transaction():
        meta = await get_meta(ctx)
        meta["last_think_at"] = now_iso()
        meta["seen_hashes"] = seen_hashes
        if cooldown_until:
            meta["cooldown_until"] = cooldown_until
        await save_meta(ctx, meta)


async def is_thinking_available(ctx: Any, *, manual: bool = False) -> bool:
    """Check whether thinking can run; manual actions bypass switch/cooldown."""
    meta = await get_meta(ctx)
    if not manual and not meta.get("proactive_enabled", True):
        return False
    ideas = await get_ideas(ctx)
    if sum(1 for idea in ideas if idea.get("status") != "archived") < int(
        meta.get("min_ideas", 3)
    ):
        return False
    cooldown = None if manual else meta.get("cooldown_until")
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
