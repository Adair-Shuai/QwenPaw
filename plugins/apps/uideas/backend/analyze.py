# -*- coding: utf-8 -*-
"""UIdeas 分析层。

- L1 organize：调用 Agent 对灵感聚类整理（生成 clusters + 分配 tags）
- L2 expand  ：调用 Agent 对单条灵感进行扩充（生成扩展文本 + 关联建议）

通过 ctx.chat 调用软件 Agent（可指定 skill，如 UGSci 的油气领域技能），
将回复解析为结构化 JSON 后写回存储。
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# 默认使用通用分析 skill（可被 meta.analyze_skill 覆盖）
DEFAULT_SKILL = ""


def _extract_json(text: str) -> Optional[Any]:
    """从 Agent 回复中提取 JSON（容忍 markdown 代码块包裹）。"""
    if not text:
        return None
    # 去掉 ```json ... ``` 围栏
    stripped = text.strip()
    fence = re.search(r"```(?:json)?\s*(.*?)```", stripped, re.DOTALL)
    if fence:
        stripped = fence.group(1).strip()
    else:
        # 截取第一个 { 到最后一个 }
        start, end = stripped.find("{"), stripped.rfind("}")
        if start >= 0 and end > start:
            stripped = stripped[start : end + 1]
    try:
        return json.loads(stripped)
    except json.JSONDecodeError as exc:
        logger.warning("[uideas] JSON 解析失败: %s", exc)
        return None


async def _chat(ctx: Any, prompt: str, *, skill: str = "") -> str:
    """调用 Agent 获取回复文本。"""
    try:
        if skill:
            reply = await ctx.chat(prompt, skill=skill)
        else:
            reply = await ctx.chat(prompt)
        return getattr(reply, "text", "") or ""
    except Exception as exc:  # pylint: disable=broad-except
        logger.warning("[uideas] chat 调用失败: %s", exc)
        raise


# ─── L1 整理 ─────────────────────────────────────────────────────────

async def organize_ideas(ctx: Any) -> Dict[str, Any]:
    """对全部未归档灵感进行聚类整理。

    返回 {"clusters": [...], "ideas": [...]}，并写回存储。
    """
    from store import get_ideas, save_clusters, save_ideas

    ideas = await get_ideas(ctx)
    active = [i for i in ideas if i.get("status") != "archived"]
    if not active:
        return {"clusters": [], "ideas": ideas, "skipped": True}

    listing = "\n".join(
        f"{i.get('id')}|{i.get('title', '')}|{i.get('content', '')[:150]}|"
        f"{'、'.join(i.get('tags') or [])}"
        for i in active
    )
    prompt = (
        "你是科研灵感整理助手。请对以下灵感记录进行聚类归纳，输出 JSON：\n"
        "{\n"
        '  "clusters": [{"name": "方向名", "description": "一句话描述", '
        '"idea_ids": ["灵感ID"]}],\n'
        '  "tags": {"灵感ID": ["补充标签"]}\n'
        "}\n"
        "要求：\n"
        "1. clusters 数量控制在 2~5 个，每条灵感只能属于一个方向；\n"
        "2. tags 为每条灵感补充 1~3 个领域标签（油气/储气库/数值模拟等方向）；\n"
        "3. 只输出 JSON，不要多余文字。\n\n"
        f"灵感记录：\n{listing}"
    )

    meta = await _read_meta(ctx)
    skill = meta.get("analyze_skill") or DEFAULT_SKILL
    reply = await _chat(ctx, prompt, skill=skill)
    data = _extract_json(reply)

    clusters: List[Dict[str, Any]] = []
    tag_map: Dict[str, List[str]] = {}

    if data and isinstance(data, dict):
        clusters_raw = data.get("clusters") or []
        for c in clusters_raw:
            if isinstance(c, dict) and c.get("name"):
                clusters.append(
                    {
                        "id": _new_id("cl"),
                        "name": str(c.get("name"))[:40],
                        "description": str(c.get("description") or "")[:200],
                        "idea_ids": [
                            iid
                            for iid in (c.get("idea_ids") or [])
                            if isinstance(iid, str)
                        ],
                    }
                )
        tags_raw = data.get("tags") or {}
        if isinstance(tags_raw, dict):
            for iid, tlist in tags_raw.items():
                if isinstance(tlist, list):
                    tag_map[str(iid)] = [str(t) for t in tlist if str(t).strip()]

    # 回写：更新灵感状态、标签、聚类归属
    by_id = {i["id"]: i for i in ideas}
    for cl in clusters:
        for iid in cl.get("idea_ids", []):
            idea = by_id.get(iid)
            if idea:
                idea["cluster_id"] = cl["id"]
                idea["status"] = "organized" if idea["status"] == "raw" else idea["status"]
    for iid, tags in tag_map.items():
        idea = by_id.get(iid)
        if idea:
            existing = set(idea.get("tags") or [])
            existing.update(tags)
            idea["tags"] = sorted(existing)

    from datetime import datetime, timezone

    now = datetime.now(timezone.utc).isoformat()
    clusters.sort(key=lambda c: len(c.get("idea_ids") or []), reverse=True)
    await save_clusters(ctx, clusters)
    await save_ideas(ctx, ideas)

    return {
        "clusters": clusters,
        "ideas": ideas,
        "cluster_count": len(clusters),
        "tagged": len(tag_map),
    }


async def _read_meta(ctx: Any) -> Dict[str, Any]:
    from store import get_meta

    return await get_meta(ctx)


def _new_id(prefix: str) -> str:
    import uuid

    return f"{prefix}_{uuid.uuid4().hex[:12]}"


# ─── L2 扩充 ─────────────────────────────────────────────────────────

async def expand_idea(ctx: Any, idea: Dict[str, Any]) -> Dict[str, Any]:
    """对单条灵感调用 Agent 扩充，返回扩充结果并写回灵感。"""
    from memory import build_expand_context
    from store import update_idea

    context = await build_expand_context(ctx, idea)
    prompt = (
        "你是油气/储气库领域的科研助手。请对下面这条研究灵感进行扩充，"
        "输出 JSON（不要多余文字）：\n"
        "{\n"
        '  "title": "优化后的标题",\n'
        '  "expansion": "扩充正文：研究背景、可能的思路/方法、关键科学问题、'
        "下一步行动建议（2~4 个要点）\",\n"
        '  "related_tags": ["补充标签"]\n'
        "}\n\n"
        f"研究灵感：\n{context}"
    )

    meta = await _read_meta(ctx)
    skill = meta.get("expand_skill") or DEFAULT_SKILL
    reply = await _chat(ctx, prompt, skill=skill)
    data = _extract_json(reply)

    expansion = ""
    new_title = idea.get("title", "")
    related_tags: List[str] = []
    if data and isinstance(data, dict):
        expansion = str(data.get("expansion") or "").strip()
        new_title = str(data.get("title") or "").strip() or new_title
        related_tags = [
            str(t).strip() for t in (data.get("related_tags") or []) if str(t).strip()
        ]

    if expansion:
        updated = await update_idea(
            ctx,
            idea["id"],
            title=new_title,
            content=idea.get("content", ""),
            tags=list(dict.fromkeys((idea.get("tags") or []) + related_tags)),
            status="expanded",
        )
        if updated:
            updated["expansion"] = expansion
            updated["expanded_at"] = _now_iso()
            await _persist_expansion(ctx, updated)
            return updated

    # 失败兜底：直接返回原灵感
    return idea


async def _persist_expansion(ctx: Any, idea: Dict[str, Any]) -> None:
    """将扩充结果写回存储（保存在灵感记录的 expansion 字段）。"""
    from store import get_ideas, save_ideas

    ideas = await get_ideas(ctx)
    for i in ideas:
        if i.get("id") == idea.get("id"):
            i["expansion"] = idea.get("expansion", "")
            i["expanded_at"] = idea.get("expanded_at")
            break
    await save_ideas(ctx, ideas)


def _now_iso() -> str:
    from datetime import datetime, timezone

    return datetime.now(timezone.utc).isoformat()
