# -*- coding: utf-8 -*-
"""UIdeas 记忆聚合层。

L3 主动思考的输入：结合
1. UIdeas 自身的灵感记录（ideas + clusters + suggestions）
2. 软件其他 Agent 的对话记忆（通过 ctx.get_session_history 跨会话获取）

对会话历史进行截断与摘要，拼装成可供 Agent 参考的上下文。
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# 会话历史中每个 role 最多保留的消息数
_MAX_HISTORY_PER_ROLE = 12
# 单条消息最大字符数
_MAX_MSG_CHARS = 600
# 参与聚合的最大会话数
_MAX_SESSIONS = 5


async def collect_idea_summary(ctx: Any) -> str:
    """将 UIdeas 的灵感记录整理成摘要文本。"""
    from store import get_clusters, get_ideas, get_suggestions

    ideas = await get_ideas(ctx)
    clusters = await get_clusters(ctx)
    suggestions = await get_suggestions(ctx)

    lines: List[str] = []
    if ideas:
        lines.append(f"【灵感记录共 {len(ideas)} 条】")
        for idea in ideas[-15:]:  # 取最近 15 条
            tags = "、".join(idea.get("tags") or []) or "无标签"
            lines.append(
                f"- [{idea.get('status', 'raw')}] {idea.get('title', '')}"
                f"（标签：{tags}）\n  {idea.get('content', '')[:120]}"
            )
    if clusters:
        lines.append(f"【已归纳的聚类方向共 {len(clusters)} 个】")
        for c in clusters[-8:]:
            lines.append(
                f"- {c.get('name', '')}（{len(c.get('idea_ids') or [])} 条灵感）"
            )
    if suggestions:
        lines.append(f"【此前已提出 {len(suggestions)} 条建议】")
        for s in suggestions[-6:]:
            lines.append(f"- [{s.get('status')}] {s.get('title', '')}")
    if not lines:
        return "（暂无灵感记录）"
    return "\n".join(lines)


async def collect_session_memories(ctx: Any) -> str:
    """跨会话聚合软件其他 Agent 的对话记忆。

    从 ctx.get_session_history() 获取各会话历史，提取 assistant/user
    的关键信息，压缩为上下文块。失败时静默降级为空。
    """
    blocks: List[str] = []
    try:
        # 软件主对话（session_id="default"）——其他 Agent 的主要记忆来源
        history = await ctx.get_session_history(session_id="default")
        if history:
            summary = _compress_history(history, label="global")
            if summary:
                blocks.append("【全局会话记忆】\n" + summary)
    except Exception as exc:  # pylint: disable=broad-except
        logger.warning("[uideas] read default session history failed: %s", exc)

    try:
        # UIdeas 专属会话（默认 session_id="pawapp:{app_id}"）
        own = await ctx.get_session_history()
        if own:
            summary = _compress_history(own, label="pawapp")
            if summary:
                blocks.append("【UIdeas 专属会话记忆】\n" + summary)
    except Exception as exc:  # pylint: disable=broad-except
        logger.warning("[uideas] read pawapp session history failed: %s", exc)

    if not blocks:
        return ""
    return "\n\n".join(blocks)


def _compress_history(
    history: List[Dict[str, Any]], *, label: str = "global"
) -> str:
    """压缩会话历史为可读文本。

    history 是消息 dict 列表（含 role/content）。统计各 role 数量，
    保留最近若干条核心内容。
    """
    if not history:
        return ""
    roles = {"user": 0, "assistant": 0}
    kept: List[str] = []
    for msg in history[-_MAX_HISTORY_PER_ROLE:]:
        role = str(msg.get("role") or msg.get("type") or "?")
        if role in roles:
            roles[role] += 1
        content = str(msg.get("content") or "").strip()
        if content and len(content) < _MAX_MSG_CHARS * 2:
            content = content[:_MAX_MSG_CHARS]
            kept.append(f"[{role}] {content}")
    if not kept:
        return ""
    header = f"会话消息（user {roles['user']} / assistant {roles['assistant']}，来源 {label}）："
    return header + "\n" + "\n".join(kept[-_MAX_HISTORY_PER_ROLE:])


async def build_think_context(ctx: Any) -> str:
    """拼装 L3 主动思考的完整上下文。"""
    idea_summary = await collect_idea_summary(ctx)
    session_memories = await collect_session_memories(ctx)
    parts = [idea_summary]
    if session_memories:
        parts.append(session_memories)
    return "\n\n".join(parts)


async def build_expand_context(ctx: Any, idea: Dict[str, Any]) -> str:
    """拼装 L2 单条灵感扩充的上下文。"""
    from store import get_clusters, get_ideas

    lines = [f"目标灵感：\n- 标题：{idea.get('title', '')}\n- 内容：{idea.get('content', '')}"]
    tags = idea.get("tags") or []
    if tags:
        lines.append(f"标签：{'、'.join(tags)}")

    ideas = await get_ideas(ctx)
    others = [i for i in ideas if i.get("id") != idea.get("id")][-6:]
    if others:
        lines.append("\n相关灵感（供参考）：")
        for i in others:
            lines.append(f"- {i.get('title', '')}：{i.get('content', '')[:100]}")

    clusters = await get_clusters(ctx)
    if clusters:
        lines.append("\n已归纳方向（供参考）：")
        for c in clusters[-5:]:
            lines.append(f"- {c.get('name', '')}")
    return "\n".join(lines)
