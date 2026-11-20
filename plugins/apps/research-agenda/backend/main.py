# -*- coding: utf-8 -*-
"""Research agenda PawApp API."""

import asyncio
import hashlib
import json
import logging
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from qwenpaw.constant import WORKING_DIR
from qwenpaw.pawapp import PawApp
from qwenpaw.pawapp.deps import get_scoped_ctx

from .backend import extract
from .backend.extract import ImportBody, TaskFields
from .backend.store import Store, now

logger = logging.getLogger(__name__)
app = PawApp(name="工作日程", app_id="research-agenda")
router = APIRouter()
app.include_router(router)


def scoped_store(ctx=Depends(get_scoped_ctx)):
    return Store(WORKING_DIR / "apps", ctx.user_id, ctx.agent_id)


@router.get("/state")
def state(store=Depends(scoped_store)):
    return store.snapshot()


@router.get("/sources/{source_id}")
def source(source_id: str, store=Depends(scoped_store)):
    try:
        return store.source(source_id)
    except KeyError as exc:
        raise HTTPException(404, "找不到这份材料") from exc


@router.post("/extract")
async def extract_material(
    body: ImportBody,
    ctx=Depends(get_scoped_ctx),
    store=Depends(scoped_store),
):
    fingerprint = hashlib.sha256(
        json.dumps(
            body.model_dump(mode="json", exclude={"source_name"}),
            sort_keys=True,
            ensure_ascii=False,
        ).encode(),
    ).hexdigest()
    try:
        return store.source(fingerprint)
    except KeyError:
        pass
    existing = store.snapshot()["tasks"]
    if len(existing) > 300:
        raise HTTPException(400, "当前版本最多对照 300 条事项，请先导出并整理历史事项")
    try:
        response = await extract.call_model(body, existing, ctx.agent_id)
        result = extract.parse_result(response, body, existing)
    except asyncio.TimeoutError as exc:
        raise HTTPException(504, "整理超时，输入内容已保留，可重试") from exc
    except ValueError as exc:
        # Validation errors may contain the source material. Keep it
        # server-side.
        logger.info(
            "Agenda extraction validation failed: %s",
            type(exc).__name__,
        )
        raise HTTPException(
            422,
            "模型结果未通过来源或结构校验，请重试并核对图片是否清晰",
        ) from exc
    except Exception as exc:
        logger.warning("Agenda model request failed: %s", type(exc).__name__)
        raise HTTPException(
            503,
            "整理失败，请检查当前专家的模型配置和图片识别能力后重试",
        ) from exc
    source_record = {
        **result,
        "id": fingerprint,
        "status": "review",
        "created_at": now(),
        "source_name": body.source_name,
        "reference_date": body.reference_date.isoformat(),
        "identity": body.identity,
        "text": body.text,
        "images": [image.model_dump() for image in body.images],
        "applied_ids": [],
    }
    return store.add_source(source_record)


class SelectedCandidate(BaseModel):
    candidate_id: str
    fields: TaskFields


class ApplyBody(BaseModel):
    candidates: list[SelectedCandidate] = Field(max_length=80)


@router.post("/sources/{source_id}/apply")
def apply_source(source_id: str, body: ApplyBody, store=Depends(scoped_store)):
    if len({candidate.candidate_id for candidate in body.candidates}) != len(
        body.candidates,
    ):
        raise HTTPException(400, "重复选择了同一候选事项")
    try:
        ids = store.apply(
            source_id,
            [
                candidate.model_dump(mode="json")
                for candidate in body.candidates
            ],
        )
        return {"ids": ids, **store.snapshot()}
    except KeyError as exc:
        raise HTTPException(404, "材料或关联事项不存在") from exc
    except ValueError as exc:
        raise HTTPException(409, str(exc)) from exc


@router.post("/tasks")
def create_task(body: TaskFields, store=Depends(scoped_store)):
    return store.create_task(body.model_dump(mode="json"))


class UpdateBody(BaseModel):
    revision: int
    fields: TaskFields


@router.put("/tasks/{task_id}")
def update_task(task_id: str, body: UpdateBody, store=Depends(scoped_store)):
    try:
        return store.update_task(
            task_id,
            body.revision,
            body.fields.model_dump(mode="json"),
        )
    except KeyError as exc:
        raise HTTPException(404, "找不到这项工作") from exc
    except ValueError as exc:
        raise HTTPException(409, str(exc)) from exc


def minutes(value):
    hour, minute = map(int, value.split(":"))
    return hour * 60 + minute


def clock(value):
    return f"{value // 60:02d}:{value % 60:02d}"


def build_plan(tasks, day):
    fixed = [
        task
        for task in tasks
        if task.get("planned_date") == day
        and task.get("start")
        and task["status"] == "todo"
    ]
    busy = [(720, 810)] + [
        (
            minutes(task["start"]),
            minutes(task["start"]) + task["duration"] + 15,
        )
        for task in fixed
    ]
    blocks = [
        {
            "task_id": task["id"],
            "title": task["title"],
            "start": task["start"],
            "end": clock(minutes(task["start"]) + task["duration"]),
            "fixed": True,
            "kind": task["kind"],
        }
        for task in fixed
    ]
    queue = [
        task
        for task in tasks
        if task["status"] == "todo"
        and not task.get("start")
        and task.get("relation") not in {"others", "unclear"}
        and (not task.get("planned_date") or task["planned_date"] <= day)
    ]
    queue.sort(
        key=lambda task: (
            task.get("due_date") or "9999",
            {"urgent": 0, "high": 1, "normal": 2}[task["priority"]],
            task["kind"] != "科研",
            task["id"],
        ),
    )
    unplanned = []
    for task in queue:
        start = 540
        while start + task["duration"] <= 1080 and any(
            start < end and start + task["duration"] > begin
            for begin, end in busy
        ):
            start += 15
        if start + task["duration"] > 1080:
            unplanned.append(task["id"])
            continue
        busy.append((start, start + task["duration"] + 15))
        blocks.append(
            {
                "task_id": task["id"],
                "title": task["title"],
                "start": clock(start),
                "end": clock(start + task["duration"]),
                "fixed": False,
                "kind": task["kind"],
            },
        )
    conflicts = []
    for index, first in enumerate(fixed):
        for second in fixed[index + 1 :]:
            if (
                minutes(first["start"])
                < minutes(second["start"]) + second["duration"]
                and minutes(second["start"])
                < minutes(first["start"]) + first["duration"]
            ):
                conflicts.append([first["id"], second["id"]])
    return {
        "blocks": sorted(blocks, key=lambda block: block["start"]),
        "unplanned": unplanned,
        "conflicts": conflicts,
    }


@router.get("/plan")
def plan(day: date, store=Depends(scoped_store)):
    return build_plan(store.snapshot()["tasks"], day.isoformat())


@router.get("/export")
def export(store=Depends(scoped_store)):
    with store.connect() as db:
        return {
            "version": 2,
            "exported_at": now(),
            "tasks": store.rows(db, "tasks"),
            "sources": store.rows(db, "sources"),
        }


plugin = app
