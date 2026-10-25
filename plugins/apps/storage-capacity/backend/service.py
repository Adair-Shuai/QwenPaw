# -*- coding: utf-8 -*-
"""Scoped durable cases, immutable calculations, original evidence and
exports.
"""

from __future__ import annotations

import asyncio
import copy
import hashlib
import json
import re
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

from fastapi import (
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    Request,
    UploadFile,
)
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel, Field

from qwenpaw.constant import WORKING_DIR
from qwenpaw.pawapp import get_scoped_ctx

from .catalog import catalog, new_case, new_unit, normalize_case
from .intake import extract, map_table, MAPPING_FIELDS, MAX_FILE
from .workbench import expert_prompt, fingerprint
from . import reports
from . import workflow, assistant

ROOT = Path(WORKING_DIR) / "apps" / "storage-capacity"
LOCK = threading.RLock()


def scope(request: Request):
    user = str(getattr(request.state, "user", None) or "default")
    agent = request.headers.get("X-Agent-Id") or request.query_params.get(
        "agent_id",
        "default",
    )
    if not re.fullmatch(r"[\w.-]{1,128}", agent):
        raise HTTPException(400, "Agent 标识无效")
    return ROOT / hashlib.sha256(f"{user}\0{agent}".encode()).hexdigest()[:32]


def folder(root, identifier):
    if not re.fullmatch(r"[a-f0-9]{32}", identifier):
        raise HTTPException(404, "评估记录不存在")
    return root / identifier


def read(path):
    if not path.is_file():
        raise HTTPException(404, "记录不存在")
    return json.loads(path.read_text(encoding="utf-8"))


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + "." + uuid.uuid4().hex + ".tmp")
    temp.write_text(
        json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False),
        encoding="utf-8",
    )
    temp.replace(path)


def now():
    return datetime.now(timezone.utc).isoformat()


def validate_case(case):
    if not isinstance(case, dict) or case.get("schema_version") != 2:
        raise HTTPException(400, "请使用第 2 版评估数据格式")
    try:
        if (
            len(json.dumps(case, ensure_ascii=False, allow_nan=False))
            > 5_000_000
        ):
            raise ValueError("评估数据过大")
        if (
            not isinstance(case.get("units"), list)
            or len(case["units"]) > 100
            or any(not isinstance(u, dict) for u in case["units"])
        ):
            raise ValueError("评估单元格式无效")
    except (ValueError, TypeError) as exc:
        raise HTTPException(400, str(exc)) from exc


class SaveBody(BaseModel):
    revision: int = Field(ge=1)
    case: dict


class RevisionBody(BaseModel):
    revision: int = Field(ge=1)


class NodeBody(RevisionBody):
    unit_index: int = Field(default=0, ge=0, le=99)


class ChatBody(NodeBody):
    message: str = Field(min_length=1, max_length=12000)
    node: str = "scope"
    document_ids: list[str] = Field(default_factory=list, max_length=20)


class AdoptBody(RevisionBody):
    ids: list[str] = Field(min_length=1, max_length=60)


def current(root, case_id, revision=None):
    record = read(folder(root, case_id) / "draft.json")
    if revision is not None and revision != record["revision"]:
        raise HTTPException(409, "评估记录已更新，请重新载入后再保存")
    return record


def fresh_run(root, case_id):
    record = current(root, case_id)
    if not record.get("latest_run"):
        raise HTTPException(409, "请先运行计算")
    run = read(folder(root, case_id) / "runs" / f"{record['latest_run']}.json")
    if run["fingerprint"] != fingerprint(record["case"]):
        raise HTTPException(409, "参数或资料已改变，请重新计算后生成报告")
    return record, run


def register(router):  # pylint: disable=too-many-statements
    @router.get("/catalog")
    def get_catalog():
        return {
            **catalog(),
            "mapping_fields": MAPPING_FIELDS,
            "unit_template": new_unit(),
            "workflow": workflow.catalog(),
        }

    @router.get("/cases")
    def list_cases(root=Depends(scope)):
        result = []
        if root.exists():
            for path in root.glob("*/draft.json"):
                record = read(path)
                result.append(
                    {k: record[k] for k in ("id", "revision", "updated_at")}
                    | {
                        "name": record["case"].get("case_name", "未命名"),
                        "cycle": record["case"].get("cycle_id", ""),
                    },
                )
        return {
            "cases": sorted(
                result,
                key=lambda r: r["updated_at"],
                reverse=True,
            ),
        }

    @router.post("/cases")
    def create_case(root=Depends(scope)):
        record = {
            "id": uuid.uuid4().hex,
            "revision": 1,
            "case": new_case(),
            "latest_run": None,
            "updated_at": now(),
        }
        record["case"].update(
            storage_type="auto",
            rock_type="auto",
            method_preference="auto",
        )
        write(folder(root, record["id"]) / "draft.json", record)
        return record

    @router.get("/cases/{case_id}")
    def get_case(case_id: str, root=Depends(scope)):
        record = current(root, case_id)
        if record.get("latest_run"):
            record["evaluation"] = read(
                folder(root, case_id)
                / "runs"
                / f"{record['latest_run']}.json",
            )
            record["stale"] = record["evaluation"][
                "fingerprint"
            ] != fingerprint(record["case"])
            review_path = (
                folder(root, case_id)
                / "runs"
                / f"{record['latest_run']}.review.json"
            )
            record["review"] = (
                read(review_path) if review_path.is_file() else None
            )
        return record

    @router.put("/cases/{case_id}")
    def save_case(case_id: str, body: SaveBody, root=Depends(scope)):
        validate_case(body.case)
        try:
            body.case = normalize_case(body.case)
        except ValueError as exc:
            raise HTTPException(400, str(exc)) from exc
        with LOCK:
            record = current(root, case_id, body.revision)
            # Original-evidence index is controlled by the server, not by a
            # JSON import.
            body.case["documents"] = record["case"].get("documents", [])
            sources = copy.deepcopy(record["case"].get("field_sources", {}))
            for path, source in list(sources.items()):
                if assistant.get_value(body.case, path) != assistant.get_value(
                    record["case"],
                    path,
                ):
                    sources[path] = {
                        "location": "手工修改",
                        "quote": "",
                        "reason": "原采用值已被编辑，旧引用仅作历史记录",
                        "previous_source": source,
                    }
            body.case["field_sources"] = sources
            record.update(
                case=body.case,
                revision=record["revision"] + 1,
                updated_at=now(),
            )
            write(folder(root, case_id) / "draft.json", record)
        return record

    @router.post("/cases/{case_id}/documents")
    async def upload(
        case_id: str,
        revision: int = Form(...),
        files: list[UploadFile] = File(...),
        root=Depends(scope),
    ):
        if not 1 <= len(files) <= 20:
            raise HTTPException(400, "每次上传 1–20 份资料")
        current(root, case_id, revision)
        docs = []
        total = 0
        for f in files:
            raw = await f.read(MAX_FILE + 1)
            total += len(raw)
            if total > 100 * 1024 * 1024:
                raise HTTPException(413, "本批资料总量超过 100 MB")
            try:
                document = await asyncio.to_thread(
                    extract,
                    f.filename or "资料",
                    raw,
                )
            except Exception as exc:
                raise HTTPException(
                    400,
                    f"{f.filename} 读取失败：{exc}",
                ) from exc
            docs.append((document, raw))
        with LOCK:
            record = current(root, case_id, revision)
            existing = {d["id"] for d in record["case"].get("documents", [])}
            for d, raw in docs:
                if d["id"] in existing:
                    continue
                directory = folder(root, case_id) / "documents"
                directory.mkdir(parents=True, exist_ok=True)
                (directory / (d["id"] + ".bin")).write_bytes(raw)
                write(directory / (d["id"] + ".json"), d)
                summary = {
                    k: v
                    for k, v in d.items()
                    if k not in {"tables", "pages", "case_candidate"}
                }
                summary.update(
                    tables=[
                        {
                            "label": t["label"],
                            "id": t["id"],
                            "row_count": len(t["rows"]),
                        }
                        for t in d["tables"]
                    ],
                    pages=[{"label": p["label"]} for p in d["pages"]],
                )
                record["case"].setdefault("documents", []).append(summary)
                existing.add(d["id"])
            record.update(revision=record["revision"] + 1, updated_at=now())
            write(folder(root, case_id) / "draft.json", record)
        return record

    def evidence(root, case_id, doc_id):
        record = current(root, case_id)
        if doc_id not in {
            d["id"] for d in record["case"].get("documents", [])
        }:
            raise HTTPException(404, "资料不存在")
        return read(folder(root, case_id) / "documents" / (doc_id + ".json"))

    @router.get("/cases/{case_id}/documents/{doc_id}")
    def get_document(case_id: str, doc_id: str, root=Depends(scope)):
        return evidence(root, case_id, doc_id)

    @router.get("/cases/{case_id}/documents/{doc_id}/original")
    def get_original(case_id: str, doc_id: str, root=Depends(scope)):
        doc = evidence(root, case_id, doc_id)
        return FileResponse(
            folder(root, case_id) / "documents" / (doc_id + ".bin"),
            filename=doc["name"],
            media_type="application/octet-stream",
        )

    @router.post("/cases/{case_id}/documents/{doc_id}/map")
    def mapping(case_id: str, doc_id: str, body: dict, root=Depends(scope)):
        try:
            return map_table(evidence(root, case_id, doc_id), body)
        except (ValueError, TypeError) as exc:
            raise HTTPException(400, str(exc)) from exc

    @router.post("/cases/{case_id}/evaluate")
    def evaluate(case_id: str, body: RevisionBody, root=Depends(scope)):
        with LOCK:
            record = current(root, case_id, body.revision)
            try:
                run = workflow.evaluate(record["case"])
            except (ValueError, TypeError, KeyError, OverflowError) as exc:
                raise HTTPException(400, str(exc)) from exc
            run_id = uuid.uuid4().hex
            run.update(run_id=run_id, revision=record["revision"])
            run["workflow"] = []
            for index in range(max(1, len(record["case"].get("units", [])))):
                for state in workflow.statuses(
                    record["case"],
                    record.get("node_runs", {}),
                    index,
                ):
                    if index and state["scope"] == "project":
                        continue
                    if state.get("run"):
                        run["workflow"].append(
                            {
                                "node": state["name"],
                                "unit_index": (
                                    None
                                    if state["scope"] == "project"
                                    else index
                                ),
                                "status": state["status"],
                                "snapshot": state["run"],
                            },
                        )
            write(folder(root, case_id) / "runs" / (run_id + ".json"), run)
            record["latest_run"] = run_id
            record["updated_at"] = now()
            write(folder(root, case_id) / "draft.json", record)
        return run

    @router.get("/cases/{case_id}/workflow")
    def get_workflow(case_id: str, unit_index: int = 0, root=Depends(scope)):
        record = current(root, case_id)
        return {
            "revision": record["revision"],
            "nodes": workflow.statuses(
                record["case"],
                record.get("node_runs", {}),
                unit_index,
            ),
            "messages": record.get("messages", []),
            "proposals": record.get("proposals", []),
            "can_undo": bool(record.get("last_edit")),
        }

    @router.post("/cases/{case_id}/nodes/{node}/run")
    def run_node(case_id: str, node: str, body: NodeBody, root=Depends(scope)):
        with LOCK:
            record = current(root, case_id, body.revision)
            try:
                result = workflow.execute(
                    record["case"],
                    node,
                    body.unit_index,
                )
            except (ValueError, TypeError) as exc:
                raise HTTPException(400, str(exc)) from exc
            result["run_id"] = uuid.uuid4().hex
            result["revision"] = record["revision"]
            write(
                folder(root, case_id) / "nodes" / (result["run_id"] + ".json"),
                result,
            )
            record.setdefault("node_runs", {})[
                workflow.key(node, body.unit_index)
            ] = result
            record["updated_at"] = now()
            write(folder(root, case_id) / "draft.json", record)
        return result

    @router.post("/cases/{case_id}/assistant")
    async def chat(
        case_id: str,
        body: ChatBody,
        root=Depends(scope),
        ctx=Depends(get_scoped_ctx),
    ):
        with LOCK:
            record = copy.deepcopy(current(root, case_id, body.revision))
        if body.node not in workflow.LABELS:
            raise HTTPException(400, "未知流程节点")
        docs = [
            evidence(root, case_id, identifier)
            for identifier in body.document_ids
        ]
        chunks = assistant.evidence_chunks(docs)
        response = (
            assistant.direct_reply(
                record["case"],
                body.message,
                body.unit_index,
            )
            if not docs
            else None
        )
        if response is None:
            task_ctx = copy.copy(ctx)
            task_ctx.agent_id = "Inventory-agent"
            task_ctx.app_id = "storage-capacity"
            try:
                reply = await asyncio.wait_for(
                    task_ctx.chat(
                        assistant.prompt(
                            record["case"],
                            body.node,
                            body.unit_index,
                            body.message,
                            chunks,
                            record.get("messages", []),
                        ),
                        session_id=(
                            f"pawapp:storage-capacity:{ctx.user_id}:{case_id}"
                            f":assistant:{uuid.uuid4().hex}"
                        ),
                    ),
                    timeout=150,
                )
                text = getattr(reply, "text", "").strip()
                if not text or text.startswith("[PawApp ctx.chat fallback]"):
                    raise ValueError("未收到有效回复")
                response = assistant.parse_reply(text)
            except Exception as exc:
                raise HTTPException(
                    503,
                    "评估助手未完成请求，请检查 Inventory-agent 与模型配置。资料已保留，可继续手动填写或独立计算。",
                ) from exc
        candidates, rejected = assistant.proposals(
            record["case"],
            response,
            body.message,
            chunks,
        )
        with LOCK:
            latest = current(root, case_id, body.revision)
            before = copy.deepcopy(latest["case"])
            auto_ids = []
            for item in candidates:
                if item["kind"] == "extracted" and (
                    item["source"].get("document_id") == "user"
                    or item["previous"] in (None, "", "auto", "unknown", [])
                ):
                    # Judgement-created units must be adopted before their
                    # dependent fields.
                    if item["path"].startswith("units.") and int(
                        item["path"].split(".")[1],
                    ) >= len(before.get("units", [])):
                        continue
                    auto_ids.append(item["id"])
            try:
                changed, applied = assistant.adopt(
                    before,
                    candidates,
                    auto_ids,
                    overwrite=True,
                )
                validate_case(changed)
            except (ValueError, TypeError) as exc:
                raise HTTPException(400, str(exc)) from exc
            latest["case"] = changed
            latest["proposals"] = (latest.get("proposals", []) + candidates)[
                -200:
            ]
            stamp = now()
            latest["messages"] = (
                latest.get("messages", [])
                + [
                    {
                        "role": "user",
                        "text": body.message,
                        "node": body.node,
                        "created_at": stamp,
                        "document_ids": body.document_ids,
                    },
                    {
                        "role": "assistant",
                        "text": response["reply"],
                        "node": body.node,
                        "created_at": stamp,
                        "applied": len(applied),
                        "pending": len(candidates) - len(applied),
                        "rejected": rejected,
                    },
                ]
            )[-60:]
            if applied:
                latest["last_edit"] = {
                    "before": before,
                    "after_hash": fingerprint(changed),
                    "ids": applied,
                }
            latest.update(revision=latest["revision"] + 1, updated_at=stamp)
            write(folder(root, case_id) / "draft.json", latest)
        return latest

    @router.post("/cases/{case_id}/assistant/adopt")
    def adopt_proposals(case_id: str, body: AdoptBody, root=Depends(scope)):
        with LOCK:
            record = current(root, case_id, body.revision)
            before = copy.deepcopy(record["case"])
            try:
                changed, applied = assistant.adopt(
                    before,
                    record.get("proposals", []),
                    body.ids,
                    overwrite=True,
                )
                if not applied:
                    raise ValueError("没有可采用的建议")
                validate_case(changed)
            except (ValueError, TypeError) as exc:
                raise HTTPException(409, str(exc)) from exc
            record["case"] = changed
            record["last_edit"] = {
                "before": before,
                "after_hash": fingerprint(changed),
                "ids": applied,
            }
            record.update(revision=record["revision"] + 1, updated_at=now())
            write(folder(root, case_id) / "draft.json", record)
        return record

    @router.post("/cases/{case_id}/assistant/undo")
    def undo_proposals(case_id: str, body: RevisionBody, root=Depends(scope)):
        with LOCK:
            record = current(root, case_id, body.revision)
            last = record.get("last_edit")
            if not last or last["after_hash"] != fingerprint(record["case"]):
                raise HTTPException(
                    409,
                    "此后已有其他参数或资料修改，不能整批撤销；请在对应字段调整",
                )
            record["case"] = last["before"]
            for item in record.get("proposals", []):
                if item["id"] in last["ids"]:
                    item["status"] = "undone"
            record.pop("last_edit", None)
            record.update(revision=record["revision"] + 1, updated_at=now())
            write(folder(root, case_id) / "draft.json", record)
        return record

    @router.post("/cases/{case_id}/review")
    async def review(
        case_id: str,
        body: RevisionBody,
        root=Depends(scope),
        ctx=Depends(get_scoped_ctx),
    ):
        with LOCK:
            current(root, case_id, body.revision)
            _, run = fresh_run(root, case_id)
        task_ctx = copy.copy(ctx)
        # Reference the user's existing UGSci specialist. No fictional expert
        # execution.
        task_ctx.agent_id = "Inventory-agent"
        task_ctx.app_id = "storage-capacity"
        try:
            reply = await asyncio.wait_for(
                task_ctx.chat(
                    expert_prompt(run),
                    session_id=(
                        f"pawapp:storage-capacity:{ctx.user_id}:{case_id}:"
                        f"{run['run_id']}:review"
                    ),
                ),
                timeout=90,
            )
            text = getattr(reply, "text", "").strip()
            if not text or text.startswith("[PawApp ctx.chat fallback]"):
                raise RuntimeError("未取得有效审查意见")
        except Exception as exc:
            raise HTTPException(
                503,
                "库存评价智能体未完成审查；计算结果仍可使用。请检查 Inventory-agent 和模型配置。",
            ) from exc
        with LOCK:
            latest = current(root, case_id, body.revision)
            if latest.get("latest_run") != run["run_id"]:
                raise HTTPException(
                    409,
                    "计算已更新，旧审查意见不写入当前结果",
                )
            review = {
                "status": "completed",
                "agent_id": "Inventory-agent",
                "text": text,
                "fingerprint": run["fingerprint"],
                "created_at": now(),
            }
            write(
                folder(root, case_id)
                / "runs"
                / (run["run_id"] + ".review.json"),
                review,
            )
        return review

    @router.get("/cases/{case_id}/report")
    def report(
        case_id: str,
        report_format: str = Query("html", alias="format"),
        root=Depends(scope),
    ):
        with LOCK:
            record, run = fresh_run(root, case_id)
            review_path = (
                folder(root, case_id)
                / "runs"
                / (run["run_id"] + ".review.json")
            )
            review = read(review_path) if review_path.is_file() else None
        if report_format not in {"html", "docx", "md", "json", "zip"}:
            raise HTTPException(400, "不支持的报告格式")
        if report_format == "json":
            content = json.dumps(run, ensure_ascii=False, indent=2)
            mime = "application/json"
        elif report_format == "docx":
            try:
                content = reports.docx_report(run, review)
            except ImportError as exc:
                raise HTTPException(
                    503,
                    "Word 导出需要宿主的 python-docx 依赖，请使用 HTML 或复算包",
                ) from exc
            mime = (
                "application/vnd.openxmlformats-officedocumen"
                "t.wordprocessingml.document"
            )
        elif report_format == "zip":
            content = reports.bundle(run, review)
            mime = "application/zip"
        elif report_format == "md":
            content = reports.markdown(run, review)
            mime = "text/markdown"
        else:
            content = reports.html_report(run, review)
            mime = "text/html"
        name = (
            re.sub(
                r'[<>:"/\\|?*\x00-\x1f]',
                "_",
                record["case"].get("case_name", "储气库"),
            )[:80]
            + "-库容评估报告."
            + report_format
        )
        return Response(
            content,
            media_type=mime,
            headers={
                "Content-Disposition": "attachment; filename*=UTF-8''"
                + quote(name),
                "X-Content-Type-Options": "nosniff",
                "Content-Security-Policy": (
                    "default-src 'none'; style-src 'unsafe-inline" "'"
                ),
            },
        )
