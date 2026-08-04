# -*- coding: utf-8 -*-
"""UIdeas L3 主动思考。

在 app 启动后启动后台 asyncio 循环：周期检查
- 是否开启（meta.proactive_enabled）
- 是否在冷却期（cooldown_until）
- 灵感数是否达标（min_ideas）

满足条件时聚合记忆（灵感记录 + 跨会话对话记忆），调用 Agent 生成
研究建议，经 hash 去重后写入 suggestions 并推送 SSE 事件。

ctx 获取：PawAppContext 每次 HTTP 请求重建，因此本模块维护
``_LAST_CTX`` 缓存（由 HTTP 路由填充），后台循环复用最近一次 ctx。
PawAppContext 是轻量的，其持有的 workspace_registry 是长生命周期单例，
可以安全复用。
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

from memory import build_think_context
from store import (
    create_suggestion,
    get_meta,
    is_thinking_available,
    record_think,
)

# 后台循环轮询间隔（秒）
LOOP_INTERVAL_SECONDS = 30
# 冷却倍率：冷却 = 间隔 * COOLDOWN_FACTOR
COOLDOWN_FACTOR = 2.0
# 单轮最多产出建议数
MAX_SUGGESTIONS_PER_ROUND = 3

# ctx 缓存：app_id -> PawAppContext（由 HTTP 路由填充）
_LAST_CTX: Dict[str, Any] = {}
# 后台任务引用
_THINK_TASK: Optional[asyncio.Task] = None
_THINK_LOCK = asyncio.Lock()


def cache_ctx(ctx: Any) -> Any:
    """缓存 ctx 供后台循环使用（幂等，返回原 ctx）。"""
    _LAST_CTX[ctx.app_id or "uideas"] = ctx
    return ctx


def get_cached_ctx(app_id: str = "uideas") -> Optional[Any]:
    return _LAST_CTX.get(app_id)


async def start_proactive_loop() -> None:
    """启动后台主动思考循环（由 startup hook 调用）。"""
    global _THINK_TASK
    if _THINK_TASK is not None and not _THINK_TASK.done():
        return
    _THINK_TASK = asyncio.create_task(_proactive_loop())
    logger.info("[uideas] proactive loop started")


async def stop_proactive_loop() -> None:
    global _THINK_TASK
    if _THINK_TASK is not None:
        _THINK_TASK.cancel()
        try:
            await _THINK_TASK
        except asyncio.CancelledError:
            pass
        _THINK_TASK = None
    logger.info("[uideas] proactive loop stopped")


async def _proactive_loop() -> None:
    """后台循环：等待 ctx 就绪后周期性主动思考。"""
    logger.info("[uideas] proactive loop running")
    while True:
        try:
            await asyncio.sleep(LOOP_INTERVAL_SECONDS)
            ctx = get_cached_ctx()
            if ctx is None:
                # 尚无任何 HTTP 请求填充 ctx，跳过本轮
                continue
            if not await is_thinking_available(ctx):
                continue
            await think_once(ctx)
        except asyncio.CancelledError:
            raise
        except Exception as exc:  # pylint: disable=broad-except
            logger.warning("[uideas] proactive round failed: %s", exc)


async def think_once(ctx: Any) -> Dict[str, Any]:
    """Run one deduplicated thinking round at a time."""
    async with _THINK_LOCK:
        return await _think_once_unlocked(ctx)


async def _think_once_unlocked(ctx: Any) -> Dict[str, Any]:
    """执行一轮主动思考：聚合记忆 -> 生成建议 -> 去重入库 -> 推送。"""
    context = await build_think_context(ctx)

    prompt = (
        "你是油气/储气库领域的资深科研助手。请基于以下研究记忆，"
        "主动提出最有价值的 1~3 条研究建议（可以是新研究方向、待验证的假设、"
        "可尝试的数值模拟方案、数据/文献线索等）。\n\n"
        "严格输出 JSON（不要多余文字）：\n"
        "{\n"
        '  "suggestions": [\n'
        "    {\n"
        '      "title": "建议标题",\n'
        '      "body": "建议正文（2~4 句）",\n'
        '      "rationale": "为什么值得关注（结合记忆依据）",\n'
        '      "source_idea_ids": ["关联的灵感ID（可空）"]\n'
        "    }\n"
        "  ]\n"
        "}\n\n"
        f"研究记忆：\n{context}"
    )

    meta = await get_meta(ctx)
    skill = meta.get("think_skill") or ""
    reply = await _chat(ctx, prompt, skill=skill)
    items = _parse_suggestions(reply)

    seen = set(meta.get("seen_hashes") or [])
    created: List[Dict[str, Any]] = []
    for item in items[:MAX_SUGGESTIONS_PER_ROUND]:
        title = str(item.get("title") or "").strip()
        body = str(item.get("body") or "").strip()
        if not title or not body:
            continue
        # hash 去重（基于标题+正文）
        import hashlib

        h = hashlib.sha256(f"{title}|{body}".encode("utf-8")).hexdigest()[:16]
        if h in seen:
            continue
        seen.add(h)
        suggestion = await create_suggestion(
            ctx,
            title=title,
            body=body,
            rationale=str(item.get("rationale") or "").strip(),
            source_idea_ids=[
                iid
                for iid in (item.get("source_idea_ids") or [])
                if isinstance(iid, str)
            ],
        )
        created.append(suggestion)

    # 记录本轮思考状态
    meta = await get_meta(ctx)
    interval = float(meta.get("interval_minutes", 60))
    cooldown = datetime.now(timezone.utc) + timedelta(
        minutes=interval * COOLDOWN_FACTOR
    )
    await record_think(
        ctx,
        seen_hashes=sorted(seen),
        cooldown_until=cooldown.isoformat(),
    )

    # 推送 SSE 事件
    from sse import broadcast

    await broadcast(
        {
            "type": "suggestion",
            "suggestions": created,
            "round": {
                "last_think_at": datetime.now(timezone.utc).isoformat(),
                "cooldown_until": cooldown.isoformat(),
            },
        }
    )

    logger.info("[uideas] think round done: %d new suggestions", len(created))
    return {"created": created, "cooldown_until": cooldown.isoformat()}


async def _chat(ctx: Any, prompt: str, *, skill: str = "") -> str:
    try:
        if skill:
            reply = await ctx.chat(prompt, skill=skill)
        else:
            reply = await ctx.chat(prompt)
        return getattr(reply, "text", "") or ""
    except Exception as exc:  # pylint: disable=broad-except
        logger.warning("[uideas] chat 调用失败: %s", exc)
        raise


def _parse_suggestions(text: str) -> List[Dict[str, Any]]:
    """解析 Agent 回复中的建议列表 JSON。"""
    if not text:
        return []
    stripped = text.strip()
    fence = re.search(r"```(?:json)?\s*(.*?)```", stripped, re.DOTALL)
    if fence:
        stripped = fence.group(1).strip()
    else:
        start, end = stripped.find("{"), stripped.rfind("}")
        if start >= 0 and end > start:
            stripped = stripped[start : end + 1]
    try:
        data = json.loads(stripped)
    except json.JSONDecodeError as exc:
        logger.warning("[uideas] think JSON 解析失败: %s", exc)
        return []
    if not isinstance(data, dict):
        return []
    suggestions = data.get("suggestions") or []
    if not isinstance(suggestions, list):
        return []
    return [s for s in suggestions if isinstance(s, dict)]
