# -*- coding: utf-8 -*-
"""UIdeas SSE 广播通道。

主动思考 / 整理 / 扩充等后台操作完成后，向前端推送事件。
前端通过 ``GET /api/uideas/stream`` 订阅。

实现：全局一个 SSEChannel，但每个订阅者拥有独立的缓冲队列——
``SSEChannel`` 内部是单 asyncio.Queue，多个消费者会竞争事件，
因此这里实现简单的多订阅者广播：每个连接一个 channel，广播时
向所有存活 channel 转发。
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

from qwenpaw.pawapp.task import SSEChannel

# 活跃订阅者（每个前端连接一个 channel）
_subscribers: List[SSEChannel] = []
_subscribers_lock = asyncio.Lock()
# 最近事件回放（新连接可先看到最近的 N 条）
_recent: List[Dict[str, Any]] = []
_RECENT_MAX = 100


async def broadcast(event: Dict[str, Any]) -> None:
    """向所有活跃订阅者广播事件，并缓存到最近事件列表。"""
    if not isinstance(event, dict):
        event = {"type": "event", "data": event}
    # 补齐时间戳
    from datetime import datetime, timezone

    event.setdefault("ts", datetime.now(timezone.utc).isoformat())
    _recent.append(event)
    if len(_recent) > _RECENT_MAX:
        del _recent[: len(_recent) - _RECENT_MAX]

    async with _subscribers_lock:
        targets = list(_subscribers)
    for ch in targets:
        try:
            await ch.send_event(event)
        except Exception as exc:  # pylint: disable=broad-except
            logger.debug("[uideas] broadcast to subscriber failed: %s", exc)
            async with _subscribers_lock:
                if ch in _subscribers:
                    _subscribers.remove(ch)


async def subscribe() -> SSEChannel:
    """创建并注册一个订阅通道（供 stream 端点使用）。"""
    ch = SSEChannel(max_buffer=200)
    async with _subscribers_lock:
        _subscribers.append(ch)
    return ch


def unsubscribe(ch: SSEChannel) -> None:
    """移除订阅通道。"""
    # 调用方在 loop 中，直接操作（广播端已加锁，这里用 loop.call_soon 提交）
    async def _do():
        async with _subscribers_lock:
            if ch in _subscribers:
                _subscribers.remove(ch)
        ch.close()

    try:
        loop = asyncio.get_running_loop()
        loop.create_task(_do())
    except RuntimeError:
        pass


def recent_events() -> List[Dict[str, Any]]:
    return list(_recent)


def _serialize(event: Dict[str, Any]) -> str:
    return f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
