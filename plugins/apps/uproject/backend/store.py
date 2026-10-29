# -*- coding: utf-8 -*-
"""UProject persistence and demo scenes.

Uses PawAppContext.storage (namespace ``pawapp:uproject``).
Read-modify-write is serialized by an in-process lock.
"""

from __future__ import annotations

import asyncio
import copy
import re
import uuid
from contextlib import asynccontextmanager
from datetime import date, datetime, timezone
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
PRIORITIES = ("urgent", "high", "normal", "low")


class ValidationError(ValueError):
    """A rejected user mutation; no partial state has been committed."""


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
        "activity": [],
        "seeded": False,
        "generation": None,
    }


async def get_state(ctx: Any) -> Dict[str, Any]:
    state = await ctx.storage.get("state", default=None)
    if not isinstance(state, dict):
        return _empty_state()
    merged = _empty_state()
    # Storage implementations may return shared references. Validation and
    # failed writes must never modify the last committed state in memory.
    merged.update(copy.deepcopy(state))
    for key in (
        "projects",
        "milestones",
        "items",
        "meetings",
        "briefs",
        "activity",
    ):
        if not isinstance(merged.get(key), list):
            merged[key] = []
    merged["items"] = [item_defaults(row) for row in merged["items"]]
    return merged


async def save_state(ctx: Any, state: Dict[str, Any]) -> None:
    await ctx.storage.set("state", copy.deepcopy(state))


def item_defaults(row: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "priority": "normal",
        "assignee": "",
        "due_date": "",
        "milestone_id": None,
        "depends_on": [],
        **copy.deepcopy(row),
    }


def _text(value: Any, field: str, *, required: bool = False) -> str:
    if not isinstance(value, str):
        raise ValidationError(f"{field}必须是文本")
    value = value.strip()
    if required and (not value or len(value) > 200):
        raise ValidationError(f"{field}不能为空，且不能超过 200 个字符")
    return value


def _date(value: Any, field: str) -> str:
    value = _text(value, field)
    if value:
        try:
            if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
                raise ValueError
            date.fromisoformat(value)
        except ValueError as exc:
            raise ValidationError(
                f"{field}必须是有效的 YYYY-MM-DD 日期或留空",
            ) from exc
    return value


def _enum(value: Any, choices: tuple, field: str) -> Any:
    if value not in choices:
        raise ValidationError(f"{field}无效")
    return value


def _validate_project(project: Dict[str, Any]) -> None:
    project["name"] = _text(project.get("name"), "项目名称", required=True)
    _enum(project.get("status"), PROJECT_STATUSES, "项目状态")
    for field in ("start_date", "end_date", "next_align_at"):
        project[field] = _date(project.get(field, ""), field)
    if (
        project["start_date"]
        and project["end_date"]
        and project["start_date"] > project["end_date"]
    ):
        raise ValidationError("项目结束日期不能早于开始日期")


# pylint: disable-next=too-many-branches
def _validate_child(
    collection: str,
    row: Dict[str, Any],
    state: Dict[str, Any],
) -> Dict[str, Any]:
    row = item_defaults(row) if collection == "items" else copy.deepcopy(row)
    row["title"] = _text(row.get("title"), "标题", required=True)
    if collection in ("items", "milestones"):
        _enum(row.get("owner_side"), SIDES, "负责方")
        row["due_date"] = _date(row.get("due_date", ""), "截止日期")
    if collection == "milestones":
        _enum(row.get("status"), MILESTONE_STATUSES, "里程碑状态")
    elif collection == "meetings":
        row["held_at"] = _date(row.get("held_at", ""), "会议日期")
    elif collection == "items":
        _enum(row.get("kind"), ITEM_KINDS, "事项类型")
        _enum(row.get("status"), ITEM_STATUSES, "事项状态")
        _enum(row["priority"], PRIORITIES, "优先级")
        row["assignee"] = _text(row["assignee"], "负责人")
        milestone_id = row.get("milestone_id")
        if milestone_id not in (None, ""):
            milestone = find_by_id(state["milestones"], milestone_id)
            if (
                not milestone
                or milestone.get("project_id") != row["project_id"]
            ):
                raise ValidationError("里程碑必须属于当前项目")
        row["milestone_id"] = milestone_id or None
        dependencies = row["depends_on"]
        if not isinstance(dependencies, list) or any(
            not isinstance(key, str) or not key for key in dependencies
        ):
            raise ValidationError("前置依赖必须是事项 ID 数组")
        row["depends_on"] = list(dict.fromkeys(dependencies))
        graph = {
            item["id"]: item
            for item in state["items"]
            if item.get("project_id") == row["project_id"]
        }
        graph[row["id"]] = row
        for item in graph.values():
            for dependency in item.get("depends_on", []):
                if dependency == item["id"]:
                    raise ValidationError("事项不能依赖自身")
                if dependency not in graph:
                    raise ValidationError("前置依赖必须属于当前项目")
                if (
                    item.get("status") == "agreed"
                    and graph[dependency].get("status") != "agreed"
                ):
                    raise ValidationError(
                        f"「{item['title']}」的前置事项尚未对齐；请先完成前置事项或重新打开下游事项",
                    )
        # Iterative DFS supports long schedules without exhausting Python's
        # recursion stack and verifies all affected completed descendants.
        visited, active = set(), set()
        for key in graph:
            stack = [(key, False)]
            while stack:
                current, leaving = stack.pop()
                if leaving:
                    active.discard(current)
                    visited.add(current)
                    continue
                if current in active:
                    raise ValidationError("前置依赖不能形成循环")
                if current in visited:
                    continue
                active.add(current)
                stack.append((current, True))
                stack.extend(
                    (dep, False)
                    for dep in graph[current].get("depends_on", [])
                )
    return row


def _record_activity(
    state: Dict[str, Any],
    collection: str,
    row: Dict[str, Any],
    action: str,
    before: Optional[Dict[str, Any]] = None,
    summary: str = "",
) -> None:
    names = {
        "projects": "项目",
        "items": "事项",
        "milestones": "里程碑",
        "meetings": "会议",
        "briefs": "文稿",
    }
    entity_types = {
        "projects": "project",
        "items": "item",
        "milestones": "milestone",
        "meetings": "meeting",
        "briefs": "brief",
    }
    verbs = {"create": "创建", "update": "更新", "delete": "删除"}
    changes = (
        {
            key: {
                "before": (before or {}).get(key),
                "after": copy.deepcopy(value),
            }
            for key, value in row.items()
            if key not in ("created_at", "updated_at")
            and (before or {}).get(key) != value
        }
        if action == "update"
        else {}
    )
    if action == "update" and not changes:
        return
    title = row.get("name") or row.get("title") or row.get("kind", "")
    state.setdefault("activity", []).insert(
        0,
        {
            "id": new_id("act"),
            "project_id": (
                row["id"] if collection == "projects" else row["project_id"]
            ),
            "entity_type": entity_types[collection],
            "entity_id": row["id"],
            "action": action,
            "summary": summary
            or f"{verbs[action]}{names[collection]}「{title}」",
            "created_at": now_iso(),
            "changes": changes,
        },
    )


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
        "items": [item_defaults(row) for row in items],
        "meetings": meetings,
        "briefs": [],
        "activity": [],
        "seeded": True,
        "generation": uuid.uuid4().hex,
    }


async def ensure_seeded(ctx: Any) -> Dict[str, Any]:
    async with transaction():
        state = await get_state(ctx)
        if state.get("seeded") or state.get("projects"):
            if not state.get("generation"):
                state["generation"] = uuid.uuid4().hex
                await save_state(ctx, state)
            return state
        state = build_demo_state()
        await save_state(ctx, state)
        return state


def annotate_project(
    project: Dict[str, Any],
    state: Dict[str, Any],
) -> Dict[str, Any]:
    pid = project.get("id")
    items = [i for i in state.get("items", []) if i.get("project_id") == pid]
    milestones = [
        m for m in state.get("milestones", []) if m.get("project_id") == pid
    ]
    out = dict(project)
    out["open_count"] = sum(1 for i in items if i.get("status") == "open")
    out["proposed_count"] = sum(
        1 for i in items if i.get("status") == "proposed"
    )
    out["blocked_count"] = sum(
        1 for i in items if i.get("status") == "blocked"
    )
    out["agreed_count"] = sum(1 for i in items if i.get("status") == "agreed")
    out["pending_milestones"] = sum(
        1 for m in milestones if m.get("status") != "done"
    )
    today = date.today().isoformat()
    active = [
        i for i in items if i.get("status") not in ("agreed", "deferred")
    ]
    out["item_count"] = len(items)
    out["completion_percent"] = (
        round(100 * out["agreed_count"] / len(items)) if items else 0
    )
    out["overdue_count"] = sum(
        1 for i in active if i.get("due_date") and i["due_date"] < today
    )
    out["high_priority_count"] = sum(
        1 for i in active if i.get("priority") in ("urgent", "high")
    )
    out["overdue_milestones"] = sum(
        1
        for m in milestones
        if m.get("status") != "done"
        and m.get("due_date")
        and m["due_date"] < today
    )
    return out


def find_by_id(
    rows: List[Dict[str, Any]],
    item_id: str,
) -> Optional[Dict[str, Any]]:
    for row in rows:
        if row.get("id") == item_id:
            return row
    return None


async def list_projects(ctx: Any) -> List[Dict[str, Any]]:
    state = await ensure_seeded(ctx)
    projects = [annotate_project(p, state) for p in state["projects"]]
    projects.sort(key=lambda p: p.get("updated_at", ""), reverse=True)
    return projects


async def get_project_bundle(
    ctx: Any,
    project_id: str,
) -> Optional[Dict[str, Any]]:
    state = await ensure_seeded(ctx)
    project = find_by_id(state["projects"], project_id)
    if project is None:
        return None
    return {
        "_generation": state["generation"],
        "project": annotate_project(project, state),
        "milestones": [
            m for m in state["milestones"] if m.get("project_id") == project_id
        ],
        "items": [
            i for i in state["items"] if i.get("project_id") == project_id
        ],
        "meetings": [
            m for m in state["meetings"] if m.get("project_id") == project_id
        ],
        "briefs": [
            b for b in state["briefs"] if b.get("project_id") == project_id
        ],
        "activity": [
            a for a in state["activity"] if a.get("project_id") == project_id
        ],
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
            "name": body.get("name", ""),
            "code": (body.get("code") or "").strip(),
            "status": body.get("status", "intake"),
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
        _validate_project(project)
        state["projects"].append(project)
        _record_activity(state, "projects", project, "create")
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
        before = copy.deepcopy(project)
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
            if key in body:
                project[key] = _text(body[key], key)
        if "status" in body:
            project["status"] = body["status"]
        if "client" in body and body["client"] is not None:
            project["client"] = _clean_party(body["client"])
        if "vendor" in body and body["vendor"] is not None:
            project["vendor"] = _clean_party(body["vendor"])
        _validate_project(project)
        project["updated_at"] = now_iso()
        _record_activity(state, "projects", project, "update", before)
        await save_state(ctx, state)
        return annotate_project(project, state)


async def delete_project(ctx: Any, project_id: str) -> bool:
    async with transaction():
        state = await get_state(ctx)
        project = find_by_id(state["projects"], project_id)
        if project is None:
            return False
        before = len(state["projects"])
        state["projects"] = [
            p for p in state["projects"] if p.get("id") != project_id
        ]
        if len(state["projects"]) == before:
            return False
        for key in ("milestones", "items", "meetings", "briefs"):
            state[key] = [
                row
                for row in state[key]
                if row.get("project_id") != project_id
            ]
        _record_activity(state, "projects", project, "delete")
        await save_state(ctx, state)
        return True


async def add_child(
    ctx: Any,
    collection: str,
    project_id: str,
    row: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    rows = await add_children(ctx, collection, project_id, [row])
    return rows[0] if rows is not None else None


async def add_children(
    ctx: Any,
    collection: str,
    project_id: str,
    rows: List[Dict[str, Any]],
) -> Optional[List[Dict[str, Any]]]:
    """Validate and persist a group of extracted items in one transaction."""
    async with transaction():
        state = await get_state(ctx)
        if find_by_id(state["projects"], project_id) is None:
            return None
        created = _append_children(state, collection, project_id, rows)
        project = find_by_id(state["projects"], project_id)
        if project is not None:
            project["updated_at"] = now_iso()
        await save_state(ctx, state)
        return created


def _append_children(
    state: Dict[str, Any],
    collection: str,
    project_id: str,
    rows: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    created = []
    for source in rows:
        if source.get("project_id") != project_id:
            raise ValidationError("记录必须属于当前项目")
        if find_by_id(state[collection], source.get("id")):
            raise ValidationError("记录 ID 已存在")
        row = _validate_child(collection, source, state)
        state[collection].append(row)
        _record_activity(state, collection, row, "create")
        created.append(row)
    return created


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
        before = copy.deepcopy(row)
        if "id" in updates or "project_id" in updates:
            raise ValidationError("不能修改记录所属项目或 ID")
        candidate = _validate_child(collection, {**row, **updates}, state)
        candidate["updated_at"] = now_iso()
        row.update(candidate)
        _record_activity(state, collection, row, "update", before)
        project = find_by_id(state["projects"], row.get("project_id", ""))
        if project is not None:
            project["updated_at"] = now_iso()
        await save_state(ctx, state)
        return row


async def delete_child(ctx: Any, collection: str, item_id: str) -> bool:
    async with transaction():
        state = await get_state(ctx)
        deleted = find_by_id(state[collection], item_id)
        if deleted is None:
            return False
        before = len(state[collection])
        state[collection] = [
            row for row in state[collection] if row.get("id") != item_id
        ]
        if len(state[collection]) == before:
            return False
        for row in state["items"]:
            if row.get("project_id") != deleted.get("project_id"):
                continue
            original = copy.deepcopy(row)
            if collection == "items" and item_id in row.get("depends_on", []):
                row["depends_on"] = [
                    key for key in row["depends_on"] if key != item_id
                ]
            if (
                collection == "milestones"
                and row.get("milestone_id") == item_id
            ):
                row["milestone_id"] = None
            if row != original:
                row["updated_at"] = now_iso()
                _record_activity(
                    state,
                    "items",
                    row,
                    "update",
                    original,
                    f"清理事项「{row['title']}」对已删除记录「{deleted['title']}」的关联",
                )
        project = find_by_id(state["projects"], deleted["project_id"])
        if project:
            project["updated_at"] = now_iso()
        _record_activity(state, collection, deleted, "delete")
        await save_state(ctx, state)
        return True


async def add_brief(
    ctx: Any,
    project_id: str,
    kind: str,
    content: str,
    source: str,
) -> Dict[str, Any]:
    async with transaction():
        state = await get_state(ctx)
        brief = _append_brief(state, project_id, kind, content, source)
        await save_state(ctx, state)
        return brief


def _append_brief(
    state: Dict[str, Any],
    project_id: str,
    kind: str,
    content: str,
    source: str,
) -> Dict[str, Any]:
    project = find_by_id(state["projects"], project_id)
    if project is None:
        raise ValidationError("项目已删除，无法保存文稿")
    brief = {
        "id": new_id("brief"),
        "project_id": project_id,
        "kind": kind,
        "content": content,
        "source": source,
        "created_at": now_iso(),
    }
    state["briefs"].insert(0, brief)
    # Keep the existing per-project history without one project's report
    # generation silently evicting another project's briefs.
    seen = 0
    retained = []
    for row in state["briefs"]:
        if row.get("project_id") == project_id:
            seen += 1
            if seen > 40:
                continue
        retained.append(row)
    state["briefs"] = retained
    project["updated_at"] = now_iso()
    _record_activity(state, "briefs", brief, "create")
    return brief


async def save_ai_result(
    ctx: Any,
    project_id: str,
    generation: str,
    kind: str,
    content: str,
    source: str,
    items: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """Commit generated items and their brief against the original dataset.

    Generation is persisted once for legacy data and replaced on every reset,
    so an old model reply cannot enter a new demo with the same project IDs.
    The check, item creation and brief creation share one atomic write.
    """
    async with transaction():
        state = await get_state(ctx)
        if not generation or state.get("generation") != generation:
            raise ValidationError("项目数据已重置，请重新生成")
        if find_by_id(state["projects"], project_id) is None:
            raise ValidationError("项目已删除，无法保存生成结果")
        created = (
            _append_children(state, "items", project_id, items)
            if items is not None
            else []
        )
        brief = _append_brief(state, project_id, kind, content, source)
        await save_state(ctx, state)
        return {"items": created, "brief": brief}


async def reset_demo(ctx: Any) -> Dict[str, Any]:
    async with transaction():
        state = build_demo_state()
        await save_state(ctx, state)
        return state
