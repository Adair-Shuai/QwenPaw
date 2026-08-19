# -*- coding: utf-8 -*-
"""AI helpers for agenda, minutes, and weekly briefs.

If the Agent is unavailable, deterministic fallbacks still produce usable text
so the UI never depends on a live model.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict, List, Optional, Tuple

from store import ITEM_KINDS, SIDES, ITEM_STATUSES, new_id, now_iso

logger = logging.getLogger(__name__)

KIND_LABEL = {
    "scope": "范围",
    "milestone": "里程碑",
    "deliverable": "交付物",
    "data": "资料/数据",
    "interface": "接口",
    "acceptance": "验收",
    "change": "变更",
    "risk": "风险",
}
SIDE_LABEL = {
    "client": "甲方",
    "vendor": "乙方",
    "both": "双方",
}
STATUS_LABEL = {
    "open": "未对齐",
    "proposed": "已提议",
    "agreed": "已对齐",
    "blocked": "阻塞",
    "deferred": "暂缓",
}


def _extract_json(text: str) -> Optional[Any]:
    if not text:
        return None
    stripped = text.strip()
    fence = re.search(r"```(?:json)?\s*(.*?)```", stripped, re.DOTALL)
    if fence:
        stripped = fence.group(1).strip()
    else:
        start, end = stripped.find("{"), stripped.rfind("}")
        if start >= 0 and end > start:
            stripped = stripped[start : end + 1]
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        return None


def project_snapshot(bundle: Dict[str, Any]) -> str:
    project = bundle["project"]
    client = project.get("client") or {}
    vendor = project.get("vendor") or {}
    lines = [
        f"项目：{project.get('name')}（{project.get('code') or '无编号'}）",
        f"状态：{project.get('status')}  领域：{project.get('domain') or '-'}",
        f"周期：{project.get('start_date') or '-'} ~ {project.get('end_date') or '-'}",
        f"下次对齐：{project.get('next_align_at') or '未约'}",
        f"甲方：{client.get('org')} / {client.get('contact')}（{client.get('role')}）",
        f"乙方：{vendor.get('org')} / {vendor.get('contact')}（{vendor.get('role')}）",
        f"范围：{project.get('sow') or '-'}",
        "",
        "对齐项：",
    ]
    for item in bundle.get("items") or []:
        lines.append(
            f"- [{STATUS_LABEL.get(item.get('status'), item.get('status'))}] "
            f"[{KIND_LABEL.get(item.get('kind'), item.get('kind'))}] "
            f"[{SIDE_LABEL.get(item.get('owner_side'), item.get('owner_side'))}] "
            f"{item.get('title')}。{item.get('detail') or ''}"
        )
    lines.append("")
    lines.append("里程碑：")
    for milestone in bundle.get("milestones") or []:
        lines.append(
            f"- [{milestone.get('status')}] {milestone.get('title')} "
            f"截止 {milestone.get('due_date') or '-'} "
            f"负责 {SIDE_LABEL.get(milestone.get('owner_side'), '')}"
        )
    recent = (bundle.get("meetings") or [])[-2:]
    if recent:
        lines.append("")
        lines.append("最近对齐会：")
        for meeting in recent:
            lines.append(
                f"- {meeting.get('held_at')} {meeting.get('title')}: "
                f"{meeting.get('decisions') or meeting.get('notes') or ''}"
            )
    return "\n".join(lines)


def fallback_agenda(bundle: Dict[str, Any]) -> str:
    project = bundle["project"]
    client = project.get("client") or {}
    vendor = project.get("vendor") or {}
    items = bundle.get("items") or []
    focus = [i for i in items if i.get("status") in ("open", "proposed", "blocked")]
    lines = [
        f"# {project.get('name')} 对齐会议程",
        "",
        f"- 时间：{project.get('next_align_at') or '待定'}",
        f"- 甲方：{client.get('org')} {client.get('contact')}",
        f"- 乙方：{vendor.get('org')} {vendor.get('contact')}",
        f"- 目标：把未对齐项落到负责人、时间和书面结论",
        "",
        "## 1. 上次遗留",
    ]
    blocked = [i for i in focus if i.get("status") == "blocked"]
    if blocked:
        for item in blocked:
            lines.append(
                f"- 【阻塞】{item.get('title')}（负责：{SIDE_LABEL.get(item.get('owner_side'))}）"
            )
    else:
        lines.append("- 无阻塞项")
    lines.append("")
    lines.append("## 2. 本次必须对齐")
    must = [i for i in focus if i.get("status") != "blocked"]
    if not must:
        lines.append("- 当前无未对齐项，改为核对里程碑与下周交付")
    for item in must:
        lines.append(
            f"- {item.get('title')}（{KIND_LABEL.get(item.get('kind'))} / "
            f"{SIDE_LABEL.get(item.get('owner_side'))}）"
        )
        if item.get("detail"):
            lines.append(f"  - 背景：{item['detail']}")
    lines.append("")
    lines.append("## 3. 里程碑核对")
    pending = [m for m in bundle.get("milestones") or [] if m.get("status") != "done"]
    if not pending:
        lines.append("- 里程碑均已完成")
    for milestone in pending:
        lines.append(
            f"- {milestone.get('title')}，截止 {milestone.get('due_date') or '未定'}"
        )
    lines.append("")
    lines.append("## 4. 会后动作")
    lines.append("- 每条结论写清：谁、何时、交付什么")
    lines.append("- 无法当场定的，标成阻塞并给升级路径")
    return "\n".join(lines)


def fallback_weekly(bundle: Dict[str, Any]) -> str:
    project = bundle["project"]
    items = bundle.get("items") or []
    agreed = [i for i in items if i.get("status") == "agreed"]
    open_items = [i for i in items if i.get("status") in ("open", "proposed")]
    blocked = [i for i in items if i.get("status") == "blocked"]
    lines = [
        f"# {project.get('name')} 周报（给甲方）",
        "",
        f"编号：{project.get('code') or '-'}    下次对齐：{project.get('next_align_at') or '待约'}",
        "",
        "## 本周进展",
        f"- 已对齐 {len(agreed)} 项，待对齐 {len(open_items)} 项，阻塞 {len(blocked)} 项。",
        f"- 项目范围：{project.get('sow') or '见合同'}",
    ]
    if agreed:
        lines.append("- 已对齐要点：")
        for item in agreed[:5]:
            lines.append(f"  - {item.get('title')}")
    lines.append("")
    lines.append("## 需要甲方拍板")
    need_client = [
        i
        for i in items
        if i.get("status") in ("open", "proposed", "blocked")
        and i.get("owner_side") in ("client", "both")
    ]
    if not need_client:
        lines.append("- 本周无需要甲方拍板的事项")
    for item in need_client:
        lines.append(f"- {item.get('title')}（{STATUS_LABEL.get(item.get('status'))}）")
    lines.append("")
    lines.append("## 乙方下周计划")
    lines.append("- 关闭可独立推进的对齐项")
    pending = [m for m in bundle.get("milestones") or [] if m.get("status") != "done"]
    for milestone in pending[:3]:
        lines.append(f"- 里程碑推进：{milestone.get('title')}（{milestone.get('due_date') or '未定'}）")
    lines.append("")
    lines.append("## 风险")
    if blocked:
        for item in blocked:
            lines.append(f"- {item.get('title')}")
    else:
        lines.append("- 当前无阻塞，关注资料到齐与验收口径")
    return "\n".join(lines)


def extract_items_from_notes(notes: str, project_id: str) -> List[Dict[str, Any]]:
    """Rule-based extraction used when the Agent is offline."""
    created: List[Dict[str, Any]] = []
    now = now_iso()
    for raw in notes.replace("\r", "").split("\n"):
        line = raw.strip().lstrip("-•*").strip()
        if len(line) < 4:
            continue
        if line.startswith(("#", "时间：", "时间:", "参加")):
            continue
        status = "open"
        owner = "both"
        kind = "scope"
        if any(token in line for token in ("阻塞", "未批", "卡着", "进不去")):
            status = "blocked"
            kind = "risk"
        elif any(token in line for token in ("变更", "增补", "追加")):
            kind = "change"
            status = "proposed"
        elif any(token in line for token in ("验收", "指标", "签字")):
            kind = "acceptance"
        elif any(token in line for token in ("数据", "资料", "井", "曲线")):
            kind = "data"
        elif any(token in line for token in ("接口", "格式", "坐标系", "字段")):
            kind = "interface"
        if any(token in line for token in ("甲方", "请甲方", "甲方需")):
            owner = "client"
        elif any(token in line for token in ("乙方", "我方", "乙方需")):
            owner = "vendor"
        if any(token in line for token in ("已确认", "已对齐", "维持", "不再")):
            status = "agreed"
        created.append(
            {
                "id": new_id("it"),
                "project_id": project_id,
                "title": line[:80],
                "detail": line,
                "kind": kind,
                "owner_side": owner,
                "status": status,
                "created_at": now,
                "updated_at": now,
            }
        )
    return created[:12]


async def _chat(ctx: Any, prompt: str) -> str:
    try:
        reply = await ctx.chat(prompt)
        return getattr(reply, "text", "") or ""
    except Exception as exc:  # pylint: disable=broad-except
        logger.warning("[uproject] chat failed: %s", exc)
        return ""


def _normalize_item(raw: Dict[str, Any], project_id: str) -> Optional[Dict[str, Any]]:
    title = str(raw.get("title") or "").strip()
    if not title:
        return None
    kind = raw.get("kind") if raw.get("kind") in ITEM_KINDS else "scope"
    owner = raw.get("owner_side") if raw.get("owner_side") in SIDES else "both"
    status = raw.get("status") if raw.get("status") in ITEM_STATUSES else "open"
    now = now_iso()
    return {
        "id": new_id("it"),
        "project_id": project_id,
        "title": title[:120],
        "detail": str(raw.get("detail") or "").strip()[:2000],
        "kind": kind,
        "owner_side": owner,
        "status": status,
        "created_at": now,
        "updated_at": now,
    }


async def generate_agenda(ctx: Any, bundle: Dict[str, Any]) -> Tuple[str, str]:
    prompt = (
        "你是企业科研项目的乙方项目经理。根据下面的项目台账，写一份给甲方的对齐会议程。"
        "要求：中文 Markdown；写清必须拍板的事项、负责方、建议结论；不要空话。只输出正文。\n\n"
        + project_snapshot(bundle)
    )
    text = (await _chat(ctx, prompt)).strip()
    if len(text) >= 40:
        return text, "agent"
    return fallback_agenda(bundle), "fallback"


async def generate_weekly(ctx: Any, bundle: Dict[str, Any]) -> Tuple[str, str]:
    prompt = (
        "你是乙方项目经理。根据台账写一份发给甲方项目经理的周报。"
        "结构：本周进展 / 需要甲方拍板 / 乙方下周计划 / 风险。"
        "语气克制、可转发邮件。只输出 Markdown 正文。\n\n"
        + project_snapshot(bundle)
    )
    text = (await _chat(ctx, prompt)).strip()
    if len(text) >= 40:
        return text, "agent"
    return fallback_weekly(bundle), "fallback"


async def generate_minutes_items(
    ctx: Any,
    bundle: Dict[str, Any],
    notes: str,
) -> Tuple[List[Dict[str, Any]], str]:
    prompt = (
        "从对齐会纪要中抽取需要对齐或已对齐的事项，输出 JSON：\n"
        '{"items":[{"title":"","detail":"","kind":"scope|milestone|deliverable|'
        'data|interface|acceptance|change|risk","owner_side":"client|vendor|both",'
        '"status":"open|proposed|agreed|blocked|deferred"}]}\n'
        "只抽取可执行事项，不要寒暄。只输出 JSON。\n\n"
        f"{project_snapshot(bundle)}\n\n纪要：\n{notes}"
    )
    parsed = _extract_json(await _chat(ctx, prompt))
    items: List[Dict[str, Any]] = []
    if isinstance(parsed, dict) and isinstance(parsed.get("items"), list):
        for raw in parsed["items"]:
            if isinstance(raw, dict):
                item = _normalize_item(raw, bundle["project"]["id"])
                if item:
                    items.append(item)
    source = "agent"
    if not items:
        items = extract_items_from_notes(notes, bundle["project"]["id"])
        source = "fallback"
    return items, source
