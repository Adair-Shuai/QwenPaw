# -*- coding: utf-8 -*-
"""UProject — client/vendor research-project alignment desk.

API prefix: /api/uproject
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from qwenpaw.pawapp import PawApp
from qwenpaw.pawapp.deps import get_ctx

# Loaded as plugin_uproject with the plugin root on __path__ (same as ulit).
# Do not put backend/ on sys.path: uideas also exports a top-level store
# module, and a cached import would load UIdeas instead of UProject.
from .backend.store import (
    ITEM_KINDS,
    ITEM_STATUSES,
    MILESTONE_STATUSES,
    SIDES,
    add_brief,
    add_child,
    create_project,
    delete_child,
    delete_project,
    get_project_bundle,
    list_projects,
    new_id,
    now_iso,
    patch_child,
    reset_demo,
    update_project,
)
from .backend.ai import generate_agenda, generate_minutes_items, generate_weekly

app = PawApp(name="UProject", app_id="uproject")
router = APIRouter()
app.include_router(router)


class PartyBody(BaseModel):
    org: str = ""
    contact: str = ""
    role: str = ""
    email: str = ""


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    code: str = ""
    status: str = "intake"
    domain: str = ""
    client: PartyBody = Field(default_factory=PartyBody)
    vendor: PartyBody = Field(default_factory=PartyBody)
    start_date: str = ""
    end_date: str = ""
    next_align_at: str = ""
    sow: str = ""
    notes: str = ""


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    status: Optional[str] = None
    domain: Optional[str] = None
    client: Optional[PartyBody] = None
    vendor: Optional[PartyBody] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    next_align_at: Optional[str] = None
    sow: Optional[str] = None
    notes: Optional[str] = None


class MilestoneCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    due_date: str = ""
    status: str = "pending"
    owner_side: str = "vendor"


class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    due_date: Optional[str] = None
    status: Optional[str] = None
    owner_side: Optional[str] = None


class ItemCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    detail: str = ""
    kind: str = "scope"
    owner_side: str = "both"
    status: str = "open"


class ItemUpdate(BaseModel):
    title: Optional[str] = None
    detail: Optional[str] = None
    kind: Optional[str] = None
    owner_side: Optional[str] = None
    status: Optional[str] = None


class MeetingCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    held_at: str = ""
    attendees_client: str = ""
    attendees_vendor: str = ""
    agenda: str = ""
    notes: str = ""
    decisions: str = ""


class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    held_at: Optional[str] = None
    attendees_client: Optional[str] = None
    attendees_vendor: Optional[str] = None
    agenda: Optional[str] = None
    notes: Optional[str] = None
    decisions: Optional[str] = None


class MinutesBody(BaseModel):
    notes: str = Field(..., min_length=2, max_length=20000)
    apply: bool = True


@router.get("/projects")
async def api_list_projects(ctx=Depends(get_ctx)) -> Dict[str, Any]:
    return {"projects": await list_projects(ctx)}


@router.post("/projects")
async def api_create_project(body: ProjectCreate, ctx=Depends(get_ctx)) -> Dict[str, Any]:
    project = await create_project(ctx, body.model_dump())
    return {"project": project}


@router.get("/projects/{project_id}")
async def api_get_project(project_id: str, ctx=Depends(get_ctx)) -> Dict[str, Any]:
    bundle = await get_project_bundle(ctx, project_id)
    if bundle is None:
        raise HTTPException(status_code=404, detail="project not found")
    return bundle


@router.patch("/projects/{project_id}")
async def api_update_project(
    project_id: str,
    body: ProjectUpdate,
    ctx=Depends(get_ctx),
) -> Dict[str, Any]:
    project = await update_project(
        ctx,
        project_id,
        body.model_dump(exclude_none=True),
    )
    if project is None:
        raise HTTPException(status_code=404, detail="project not found")
    return {"project": project}


@router.delete("/projects/{project_id}")
async def api_delete_project(project_id: str, ctx=Depends(get_ctx)) -> Dict[str, Any]:
    if not await delete_project(ctx, project_id):
        raise HTTPException(status_code=404, detail="project not found")
    return {"ok": True}


@router.post("/projects/{project_id}/milestones")
async def api_add_milestone(
    project_id: str,
    body: MilestoneCreate,
    ctx=Depends(get_ctx),
) -> Dict[str, Any]:
    if body.status not in MILESTONE_STATUSES:
        raise HTTPException(status_code=400, detail="invalid milestone status")
    if body.owner_side not in SIDES:
        raise HTTPException(status_code=400, detail="invalid owner_side")
    row = {
        "id": new_id("ms"),
        "project_id": project_id,
        "title": body.title.strip(),
        "due_date": body.due_date.strip(),
        "status": body.status,
        "owner_side": body.owner_side,
    }
    created = await add_child(ctx, "milestones", project_id, row)
    if created is None:
        raise HTTPException(status_code=404, detail="project not found")
    return {"milestone": created}


@router.patch("/milestones/{milestone_id}")
async def api_patch_milestone(
    milestone_id: str,
    body: MilestoneUpdate,
    ctx=Depends(get_ctx),
) -> Dict[str, Any]:
    data = body.model_dump(exclude_none=True)
    if data.get("status") and data["status"] not in MILESTONE_STATUSES:
        raise HTTPException(status_code=400, detail="invalid milestone status")
    if data.get("owner_side") and data["owner_side"] not in SIDES:
        raise HTTPException(status_code=400, detail="invalid owner_side")
    row = await patch_child(ctx, "milestones", milestone_id, data)
    if row is None:
        raise HTTPException(status_code=404, detail="milestone not found")
    return {"milestone": row}


@router.delete("/milestones/{milestone_id}")
async def api_delete_milestone(milestone_id: str, ctx=Depends(get_ctx)) -> Dict[str, Any]:
    if not await delete_child(ctx, "milestones", milestone_id):
        raise HTTPException(status_code=404, detail="milestone not found")
    return {"ok": True}


@router.post("/projects/{project_id}/items")
async def api_add_item(
    project_id: str,
    body: ItemCreate,
    ctx=Depends(get_ctx),
) -> Dict[str, Any]:
    if body.kind not in ITEM_KINDS:
        raise HTTPException(status_code=400, detail="invalid kind")
    if body.owner_side not in SIDES:
        raise HTTPException(status_code=400, detail="invalid owner_side")
    if body.status not in ITEM_STATUSES:
        raise HTTPException(status_code=400, detail="invalid status")
    now = now_iso()
    row = {
        "id": new_id("it"),
        "project_id": project_id,
        "title": body.title.strip(),
        "detail": body.detail.strip(),
        "kind": body.kind,
        "owner_side": body.owner_side,
        "status": body.status,
        "created_at": now,
        "updated_at": now,
    }
    created = await add_child(ctx, "items", project_id, row)
    if created is None:
        raise HTTPException(status_code=404, detail="project not found")
    return {"item": created}


@router.patch("/items/{item_id}")
async def api_patch_item(
    item_id: str,
    body: ItemUpdate,
    ctx=Depends(get_ctx),
) -> Dict[str, Any]:
    data = body.model_dump(exclude_none=True)
    if data.get("kind") and data["kind"] not in ITEM_KINDS:
        raise HTTPException(status_code=400, detail="invalid kind")
    if data.get("owner_side") and data["owner_side"] not in SIDES:
        raise HTTPException(status_code=400, detail="invalid owner_side")
    if data.get("status") and data["status"] not in ITEM_STATUSES:
        raise HTTPException(status_code=400, detail="invalid status")
    row = await patch_child(ctx, "items", item_id, data)
    if row is None:
        raise HTTPException(status_code=404, detail="item not found")
    return {"item": row}


@router.delete("/items/{item_id}")
async def api_delete_item(item_id: str, ctx=Depends(get_ctx)) -> Dict[str, Any]:
    if not await delete_child(ctx, "items", item_id):
        raise HTTPException(status_code=404, detail="item not found")
    return {"ok": True}


@router.post("/projects/{project_id}/meetings")
async def api_add_meeting(
    project_id: str,
    body: MeetingCreate,
    ctx=Depends(get_ctx),
) -> Dict[str, Any]:
    row = {
        "id": new_id("mt"),
        "project_id": project_id,
        "title": body.title.strip(),
        "held_at": body.held_at.strip() or now_iso()[:10],
        "attendees_client": body.attendees_client.strip(),
        "attendees_vendor": body.attendees_vendor.strip(),
        "agenda": body.agenda.strip(),
        "notes": body.notes.strip(),
        "decisions": body.decisions.strip(),
        "created_at": now_iso(),
    }
    created = await add_child(ctx, "meetings", project_id, row)
    if created is None:
        raise HTTPException(status_code=404, detail="project not found")
    return {"meeting": created}


@router.patch("/meetings/{meeting_id}")
async def api_patch_meeting(
    meeting_id: str,
    body: MeetingUpdate,
    ctx=Depends(get_ctx),
) -> Dict[str, Any]:
    row = await patch_child(
        ctx,
        "meetings",
        meeting_id,
        body.model_dump(exclude_none=True),
    )
    if row is None:
        raise HTTPException(status_code=404, detail="meeting not found")
    return {"meeting": row}


@router.delete("/meetings/{meeting_id}")
async def api_delete_meeting(meeting_id: str, ctx=Depends(get_ctx)) -> Dict[str, Any]:
    if not await delete_child(ctx, "meetings", meeting_id):
        raise HTTPException(status_code=404, detail="meeting not found")
    return {"ok": True}


async def _require_bundle(ctx: Any, project_id: str) -> Dict[str, Any]:
    bundle = await get_project_bundle(ctx, project_id)
    if bundle is None:
        raise HTTPException(status_code=404, detail="project not found")
    return bundle


@router.post("/projects/{project_id}/ai/agenda")
async def api_ai_agenda(project_id: str, ctx=Depends(get_ctx)) -> Dict[str, Any]:
    bundle = await _require_bundle(ctx, project_id)
    content, source = await generate_agenda(ctx, bundle)
    brief = await add_brief(ctx, project_id, "agenda", content, source)
    return {"kind": "agenda", "content": content, "source": source, "brief": brief}


@router.post("/projects/{project_id}/ai/weekly")
async def api_ai_weekly(project_id: str, ctx=Depends(get_ctx)) -> Dict[str, Any]:
    bundle = await _require_bundle(ctx, project_id)
    content, source = await generate_weekly(ctx, bundle)
    brief = await add_brief(ctx, project_id, "weekly", content, source)
    return {"kind": "weekly", "content": content, "source": source, "brief": brief}


@router.post("/projects/{project_id}/ai/minutes")
async def api_ai_minutes(
    project_id: str,
    body: MinutesBody,
    ctx=Depends(get_ctx),
) -> Dict[str, Any]:
    bundle = await _require_bundle(ctx, project_id)
    items, source = await generate_minutes_items(ctx, bundle, body.notes)
    created: List[Dict[str, Any]] = []
    if body.apply:
        for item in items:
            row = await add_child(ctx, "items", project_id, item)
            if row is not None:
                created.append(row)
    content = "\n".join(
        f"- [{item.get('status')}] {item.get('title')}" for item in (created or items)
    )
    brief = await add_brief(ctx, project_id, "minutes", content, source)
    return {
        "kind": "minutes",
        "content": content,
        "source": source,
        "items": created or items,
        "brief": brief,
    }


@router.post("/demo/reset")
async def api_reset_demo(ctx=Depends(get_ctx)) -> Dict[str, Any]:
    state = await reset_demo(ctx)
    return {"ok": True, "project_count": len(state.get("projects") or [])}


plugin = app
