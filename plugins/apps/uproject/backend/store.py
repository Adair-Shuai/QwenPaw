# -*- coding: utf-8 -*-
"""UProject persistence and demo scenes.

Uses PawAppContext.storage (namespace ``pawapp:uproject``).
Read-modify-write is serialized by an in-process lock.
"""

from __future__ import annotations

import asyncio
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

PROJECT_STATUSES = (
    "intake",
    "aligning",
    "executing",
    "acceptance",
    "closed",
)
ITEM_STATUSES = ("open", "proposed", "agreed", "blocked", "deferred")
ITEM_KINDS = (
    "scope",
    "milestone",
    "deliverable",
    "data",
    "interface",
    "acceptance",
    "change",
    "risk",
)
SIDES = ("client", "vendor", "both")
MILESTONE_STATUSES = ("pending", "done")

_STORE_LOCK = None


def _lock() -> asyncio.Lock:
    loop = asyncio.get_running_loop()
    lock = getattr(loop, "_uproject_store_lock", None)
    if lock is None:
        lock = asyncio.Lock()
        setattr(loop, "_uproject_store_lock", lock)
    return lock


@asynccontextmanager
async def transaction():
    async with _lock():
        yield


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:10]}"


def _empty_state() -> Dict[str, Any]:
    return {
        "projects": [],
        "milestones": [],
        "items": [],
        "meetings": [],
        "briefs": [],
        "seeded": False,
    }


async def get_state(ctx: Any) -> Dict[str, Any]:
    state = await ctx.storage.get("state", default=None)
    if not isinstance(state, dict):
        return _empty_state()
    merged = _empty_state()
    merged.update(state)
    for key in ("projects", "milestones", "items", "meetings", "briefs"):
        if not isinstance(merged.get(key), list):
            merged[key] = []
    return merged


async def save_state(ctx: Any, state: Dict[str, Any]) -> None:
    await ctx.storage.set("state", state)


def party(
    *,
    org: str,
    contact: str = "",
    role: str = "",
    email: str = "",
) -> Dict[str, str]:
    return {
        "org": org.strip(),
        "contact": contact.strip(),
        "role": role.strip(),
        "email": email.strip(),
    }


def build_demo_state() -> Dict[str, Any]:
    """Two ready-to-use client/vendor research-project scenes."""
    now = now_iso()
    p1 = "proj_gas_storage"
    p2 = "proj_shale_frac"

    projects = [
        {
            "id": p1,
            "name": "储气库数值模拟技术服务",
            "code": "UG-2026-NS-018",
            "status": "aligning",
            "domain": "储气库",
            "client": party(
                org="中石化储气库分公司",
                contact="李明",
                role="甲方项目经理",
                email="li.ming@example.com",
            ),
            "vendor": party(
                org="我方技术团队",
                contact="王倩",
                role="乙方项目经理",
                email="wang.qian@example.com",
            ),
            "start_date": "2026-03-01",
            "end_date": "2026-11-30",
            "next_align_at": "2026-08-25",
            "sow": "完成目标库三维地质建模、注采数值模拟与方案比选，按里程碑交付网格、报告与可复现算例。",
            "notes": "合同已签，进场资料和验收口径还没对齐。",
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": p2,
            "name": "页岩气压裂效果评价专题",
            "code": "UG-2026-FRAC-007",
            "status": "executing",
            "domain": "非常规",
            "client": party(
                org="西南油气田分公司勘探开发研究院",
                contact="赵磊",
                role="甲方技术接口",
                email="zhao.lei@example.com",
            ),
            "vendor": party(
                org="联合实验室",
                contact="陈博",
                role="乙方技术负责人",
                email="chen.bo@example.com",
            ),
            "start_date": "2026-01-15",
            "end_date": "2026-09-30",
            "next_align_at": "2026-08-28",
            "sow": "基于 12 口井压裂施工与返排数据，评价缝网有效性并给出下一批井参数建议。",
            "notes": "数据已到 8 口，剩余 4 口甲方本周补齐。",
            "created_at": now,
            "updated_at": now,
        },
    ]

    milestones = [
        {
            "id": "ms_p1_kickoff",
            "project_id": p1,
            "title": "进场与资料交接",
            "due_date": "2026-04-15",
            "status": "done",
            "owner_side": "both",
        },
        {
            "id": "ms_p1_grid",
            "project_id": p1,
            "title": "地质网格初版评审",
            "due_date": "2026-08-30",
            "status": "pending",
            "owner_side": "vendor",
        },
        {
            "id": "ms_p1_accept",
            "project_id": p1,
            "title": "中期验收（指标签字）",
            "due_date": "2026-09-20",
            "status": "pending",
            "owner_side": "client",
        },
        {
            "id": "ms_p2_data",
            "project_id": p2,
            "title": "全部井数据到齐",
            "due_date": "2026-08-22",
            "status": "pending",
            "owner_side": "client",
        },
        {
            "id": "ms_p2_report",
            "project_id": p2,
            "title": "评价报告初稿",
            "due_date": "2026-09-10",
            "status": "pending",
            "owner_side": "vendor",
        },
    ]

    items = [
        {
            "id": "it_p1_coords",
            "project_id": p1,
            "title": "历史井轨迹坐标系未确认",
            "detail": "甲方给的井斜数据疑似矿区坐标，乙方建模按 WGS84 会偏。需书面确认转换参数。",
            "kind": "data",
            "owner_side": "client",
            "status": "open",
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "it_p1_inject",
            "project_id": p1,
            "title": "2019–2023 注采日度数据接口",
            "detail": "需要字段：井号、日期、注气量、采气量、套压。目前只有月报。",
            "kind": "interface",
            "owner_side": "client",
            "status": "proposed",
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "it_p1_kpi",
            "project_id": p1,
            "title": "中期验收指标尚未签字",
            "detail": "库存拟合误差、单井配产偏差的通过线，甲方技术委员会还没批。",
            "kind": "acceptance",
            "owner_side": "both",
            "status": "open",
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "it_p1_access",
            "project_id": p1,
            "title": "现场安全准入未批，无法核对井史",
            "detail": "资料室在生产区，乙方两人准入申请卡在 HSE。",
            "kind": "risk",
            "owner_side": "client",
            "status": "blocked",
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "it_p1_grid_scope",
            "project_id": p1,
            "title": "模型范围按库容边界还是矿权边界",
            "detail": "两套边界相差约 1.8 km，影响网格规模与工期。",
            "kind": "scope",
            "owner_side": "both",
            "status": "open",
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "it_p2_wells",
            "project_id": p2,
            "title": "剩余 4 口井压裂曲线待补齐",
            "detail": "甲方接口已答应本周五前从作业区导出。",
            "kind": "data",
            "owner_side": "client",
            "status": "open",
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "it_p2_metric",
            "project_id": p2,
            "title": "缝控储量算法口径已对齐",
            "detail": "双方确认采用体积法 + 微地震包络，不再用单一 EUR 外推。",
            "kind": "acceptance",
            "owner_side": "both",
            "status": "agreed",
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "it_p2_change",
            "project_id": p2,
            "title": "增补 2 口对照井（变更）",
            "detail": "甲方口头要求加对照井，尚未出变更单，影响报告结构。",
            "kind": "change",
            "owner_side": "both",
            "status": "proposed",
            "created_at": now,
            "updated_at": now,
        },
    ]

    meetings = [
        {
            "id": "mt_p1_kickoff",
            "project_id": p1,
            "title": "开工对接会",
            "held_at": "2026-03-12",
            "attendees_client": "李明、资料员周姐",
            "attendees_vendor": "王倩、陈博",
            "agenda": "合同范围、资料清单、进场安排",
            "notes": "确认合同范围不变。资料清单甲方下周给初稿。安全准入由李明去推。",
            "decisions": "每周一对齐；网格初版 8 月底评审。",
            "created_at": now,
        },
        {
            "id": "mt_p2_weekly",
            "project_id": p2,
            "title": "第 18 周进度对齐",
            "held_at": "2026-08-14",
            "attendees_client": "赵磊",
            "attendees_vendor": "陈博",
            "agenda": "到数进度、对照井变更、初稿目录",
            "notes": "8 口井已质检。剩余 4 口本周五。对照井先按口头范围做敏感性，变更单后补。",
            "decisions": "算法口径维持体积法；初稿目录按甲方模板。",
            "created_at": now,
        },
    ]

    return {
        "projects": projects,
        "milestones": milestones,
        "items": items,
        "meetings": meetings,
        "briefs": [],
        "seeded": True,
    }


async def ensure_seeded(ctx: Any) -> Dict[str, Any]:
    async with transaction():
        state = await get_state(ctx)
        if state.get("seeded") or state.get("projects"):
            return state
        state = build_demo_state()
        await save_state(ctx, state)
        return state


def annotate_project(project: Dict[str, Any], state: Dict[str, Any]) -> Dict[str, Any]:
    pid = project.get("id")
    items = [i for i in state.get("items", []) if i.get("project_id") == pid]
    milestones = [
        m for m in state.get("milestones", []) if m.get("project_id") == pid
    ]
    out = dict(project)
    out["open_count"] = sum(1 for i in items if i.get("status") == "open")
    out["proposed_count"] = sum(1 for i in items if i.get("status") == "proposed")
    out["blocked_count"] = sum(1 for i in items if i.get("status") == "blocked")
    out["agreed_count"] = sum(1 for i in items if i.get("status") == "agreed")
    out["pending_milestones"] = sum(
        1 for m in milestones if m.get("status") != "done"
    )
    return out


def find_by_id(rows: List[Dict[str, Any]], item_id: str) -> Optional[Dict[str, Any]]:
    for row in rows:
        if row.get("id") == item_id:
            return row
    return None


async def list_projects(ctx: Any) -> List[Dict[str, Any]]:
    state = await ensure_seeded(ctx)
    projects = [annotate_project(p, state) for p in state["projects"]]
    projects.sort(key=lambda p: p.get("updated_at", ""), reverse=True)
    return projects


async def get_project_bundle(ctx: Any, project_id: str) -> Optional[Dict[str, Any]]:
    state = await ensure_seeded(ctx)
    project = find_by_id(state["projects"], project_id)
    if project is None:
        return None
    return {
        "project": annotate_project(project, state),
        "milestones": [
            m for m in state["milestones"] if m.get("project_id") == project_id
        ],
        "items": [i for i in state["items"] if i.get("project_id") == project_id],
        "meetings": [
            m for m in state["meetings"] if m.get("project_id") == project_id
        ],
        "briefs": [b for b in state["briefs"] if b.get("project_id") == project_id],
    }


def _clean_party(raw: Optional[Dict[str, Any]]) -> Dict[str, str]:
    raw = raw or {}
    return party(
        org=str(raw.get("org") or ""),
        contact=str(raw.get("contact") or ""),
        role=str(raw.get("role") or ""),
        email=str(raw.get("email") or ""),
    )


async def create_project(ctx: Any, body: Dict[str, Any]) -> Dict[str, Any]:
    # Seed before entering the write transaction. ensure_seeded() owns the
    # same non-reentrant lock, so calling it inside transaction() deadlocks.
    await ensure_seeded(ctx)
    async with transaction():
        state = await get_state(ctx)
        now = now_iso()
        project = {
            "id": new_id("proj"),
            "name": (body.get("name") or "未命名项目").strip(),
            "code": (body.get("code") or "").strip(),
            "status": body.get("status")
            if body.get("status") in PROJECT_STATUSES
            else "intake",
            "domain": (body.get("domain") or "").strip(),
            "client": _clean_party(body.get("client")),
            "vendor": _clean_party(body.get("vendor")),
            "start_date": (body.get("start_date") or "").strip(),
            "end_date": (body.get("end_date") or "").strip(),
            "next_align_at": (body.get("next_align_at") or "").strip(),
            "sow": (body.get("sow") or "").strip(),
            "notes": (body.get("notes") or "").strip(),
            "created_at": now,
            "updated_at": now,
        }
        state["projects"].append(project)
        await save_state(ctx, state)
        return annotate_project(project, state)


async def update_project(
    ctx: Any,
    project_id: str,
    body: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    async with transaction():
        state = await get_state(ctx)
        project = find_by_id(state["projects"], project_id)
        if project is None:
            return None
        for key in (
            "name",
            "code",
            "domain",
            "start_date",
            "end_date",
            "next_align_at",
            "sow",
            "notes",
        ):
            if key in body and body[key] is not None:
                project[key] = str(body[key]).strip()
        if body.get("status") in PROJECT_STATUSES:
            project["status"] = body["status"]
        if "client" in body and body["client"] is not None:
            project["client"] = _clean_party(body["client"])
        if "vendor" in body and body["vendor"] is not None:
            project["vendor"] = _clean_party(body["vendor"])
        project["updated_at"] = now_iso()
        await save_state(ctx, state)
        return annotate_project(project, state)


async def delete_project(ctx: Any, project_id: str) -> bool:
    async with transaction():
        state = await get_state(ctx)
        before = len(state["projects"])
        state["projects"] = [
            p for p in state["projects"] if p.get("id") != project_id
        ]
        if len(state["projects"]) == before:
            return False
        for key in ("milestones", "items", "meetings", "briefs"):
            state[key] = [
                row for row in state[key] if row.get("project_id") != project_id
            ]
        await save_state(ctx, state)
        return True


async def add_child(
    ctx: Any,
    collection: str,
    project_id: str,
    row: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    async with transaction():
        state = await get_state(ctx)
        if find_by_id(state["projects"], project_id) is None:
            return None
        state[collection].append(row)
        project = find_by_id(state["projects"], project_id)
        if project is not None:
            project["updated_at"] = now_iso()
        await save_state(ctx, state)
        return row


async def patch_child(
    ctx: Any,
    collection: str,
    item_id: str,
    updates: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    async with transaction():
        state = await get_state(ctx)
        row = find_by_id(state[collection], item_id)
        if row is None:
            return None
        row.update(updates)
        if "updated_at" in row:
            row["updated_at"] = now_iso()
        project = find_by_id(state["projects"], row.get("project_id", ""))
        if project is not None:
            project["updated_at"] = now_iso()
        await save_state(ctx, state)
        return row


async def delete_child(ctx: Any, collection: str, item_id: str) -> bool:
    async with transaction():
        state = await get_state(ctx)
        before = len(state[collection])
        state[collection] = [
            row for row in state[collection] if row.get("id") != item_id
        ]
        if len(state[collection]) == before:
            return False
        await save_state(ctx, state)
        return True


async def add_brief(
    ctx: Any,
    project_id: str,
    kind: str,
    content: str,
    source: str,
) -> Dict[str, Any]:
    brief = {
        "id": new_id("brief"),
        "project_id": project_id,
        "kind": kind,
        "content": content,
        "source": source,
        "created_at": now_iso(),
    }
    async with transaction():
        state = await get_state(ctx)
        state["briefs"].insert(0, brief)
        state["briefs"] = state["briefs"][:40]
        await save_state(ctx, state)
    return brief


async def reset_demo(ctx: Any) -> Dict[str, Any]:
    async with transaction():
        state = build_demo_state()
        await save_state(ctx, state)
        return state
