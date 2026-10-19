# -*- coding: utf-8 -*-
"""Document routes, isolated by authenticated user and Agent."""
from __future__ import annotations

import hashlib
import io
import json
import logging
import re
import shutil
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from urllib.parse import quote

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Request,
    UploadFile,
)
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel, Field
from qwenpaw.constant import WORKING_DIR
from qwenpaw.pawapp import PawApp

# PluginLoader treats this entry module as the plugin root package.
from .backend.engine import (  # pylint: disable=relative-beyond-top-level
    MAX_FILE,
    checks,
    export_excel,
    read_excel,
    recipient_defaults,
    render_template,
    starter_files,
    template_info,
)

app = PawApp(name="文书填报", app_id="document-forms")
router = APIRouter()
ROOT = Path(WORKING_DIR) / "apps" / "document-forms"
_lock = threading.RLock()
logger = logging.getLogger(__name__)


def scope(request: Request):
    user = str(getattr(request.state, "user", None) or "default")
    agent = request.headers.get("X-Agent-Id") or request.query_params.get(
        "agent_id",
        "default",
    )
    if not re.fullmatch(r"[\w.-]{1,128}", agent):
        raise HTTPException(400, "Agent 标识无效")
    return ROOT / hashlib.sha256(f"{user}\0{agent}".encode()).hexdigest()[:32]


def folder(root, case_id):
    if not re.fullmatch(r"[a-f0-9]{32}", case_id):
        raise HTTPException(404, "填报记录不存在")
    return root / case_id


def load(root, case_id):
    path = folder(root, case_id) / "draft.json"
    if not path.is_file():
        raise HTTPException(404, "填报记录不存在")
    case = json.loads(path.read_text(encoding="utf-8"))
    case["recipients"] = recipient_defaults(case["recipients"])
    return case


def save(root, case):
    path = folder(root, case["id"])
    path.mkdir(parents=True, exist_ok=True)
    case["updated_at"] = datetime.now(timezone.utc).isoformat()
    temp = path / "draft.tmp"
    temp.write_text(json.dumps(case, ensure_ascii=False), encoding="utf-8")
    temp.replace(path / "draft.json")


def public(case):
    return {k: v for k, v in case.items() if k != "review_token"}


def version(case, expected):
    if case["revision"] != expected:
        raise HTTPException(409, "此记录已在其他页面修改，请重新打开后编辑")


def upload(file, extension):
    if not file.filename or not file.filename.lower().endswith(extension):
        raise HTTPException(400, f"请导入 {extension} 文件")
    content = file.file.read(MAX_FILE + 1)
    if len(content) > MAX_FILE:
        raise HTTPException(413, "单个文件不能超过 15 MB")
    return content


def name_only(name):
    return (
        re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", name).strip(" .")[:100] or "文书"
    )


def attach_default_templates(root, case):
    library = root / "default-templates"
    index = library / "index.json"
    if not index.is_file():
        return 0
    entries = json.loads(index.read_text(encoding="utf-8"))
    if not isinstance(entries, list) or not 1 <= len(entries) <= 20:
        raise ValueError("默认模板清单不完整，请重新设定")
    prepared = []
    for entry in entries:
        digest = entry["sha256"]
        if not re.fullmatch(r"[a-f0-9]{64}", digest):
            raise ValueError("默认模板校验信息无效")
        content = (library / (digest + ".docx")).read_bytes()
        if hashlib.sha256(content).hexdigest() != digest:
            raise ValueError("默认模板内容已改变，请重新选择原文件")
        info = template_info(
            content,
            entry["name"],
            {f["key"] for f in case["fields"]},
        )
        prepared.append(
            (
                dict(
                    info,
                    id=uuid.uuid4().hex,
                    sha256=digest,
                    from_default=True,
                ),
                content,
            ),
        )
    target = folder(root, case["id"]) / "templates"
    target.mkdir(parents=True, exist_ok=True)
    for info, content in prepared:
        (target / (info["id"] + ".docx")).write_bytes(content)
    case["templates"] = [info for info, _ in prepared]
    return len(prepared)


def store_default_templates(root, case):
    if not case["templates"]:
        raise HTTPException(422, "请先添加需要作为默认的 Word 模板")
    library = root / "default-templates"
    prepared = []
    for template in case["templates"]:
        content = (
            folder(root, case["id"]) / "templates" / (template["id"] + ".docx")
        ).read_bytes()
        digest = hashlib.sha256(content).hexdigest()
        if digest != template["sha256"]:
            raise HTTPException(422, "模板内容已改变，请重新导入后设为默认")
        prepared.append(
            ({"name": template["name"], "sha256": digest}, content),
        )
    library.mkdir(parents=True, exist_ok=True)
    for entry, content in prepared:
        temp = library / (entry["sha256"] + ".tmp")
        temp.write_bytes(content)
        temp.replace(library / (entry["sha256"] + ".docx"))
    temp = library / "index.tmp"
    temp.write_text(
        json.dumps([entry for entry, _ in prepared], ensure_ascii=False),
        encoding="utf-8",
    )
    temp.replace(library / "index.json")
    return len(prepared)


class Recipient(BaseModel):
    name: str = Field(default="", max_length=200)
    start: str = Field(default="", max_length=80)
    end: str = Field(default="", max_length=80)
    follow_start: bool | None = None
    follow_end: bool | None = None


class DraftBody(BaseModel):
    revision: int
    name: str = Field(min_length=1, max_length=120)
    values: dict[str, str]
    recipients: list[Recipient] = Field(max_length=200)


class ReviewBody(BaseModel):
    revision: int


class GenerateBody(ReviewBody):
    review_token: str
    confirmed: bool = False


@router.get("/cases")
def list_cases(root=Depends(scope)):
    with _lock:
        records = [
            json.loads(p.read_text(encoding="utf-8"))
            for p in root.glob("*/draft.json")
        ]
    return [
        {
            "id": c["id"],
            "name": c["name"],
            "revision": c["revision"],
            "updated_at": c["updated_at"],
            "outputs": sum(len(g["files"]) for g in c["generations"]),
        }
        for c in sorted(records, key=lambda c: c["updated_at"], reverse=True)
    ]


@router.post("/cases")
def create_case(workbook: UploadFile = File(...), root=Depends(scope)):
    try:
        data = read_excel(upload(workbook, ".xlsx"))
    except Exception as exc:
        if isinstance(exc, HTTPException):
            raise
        raise HTTPException(422, f"Excel 无法读取：{exc}") from exc
    case = dict(
        data,
        id=uuid.uuid4().hex,
        name=Path(workbook.filename).stem[:120],
        revision=1,
        templates=[],
        generations=[],
        review_token=None,
    )
    with _lock:
        try:
            attach_default_templates(root, case)
        except (ValueError, KeyError, OSError) as exc:
            case["template_notice"] = "默认模板未能载入，请重新选择 Word 文件"
            logger.warning("Default templates could not be loaded: %s", exc)
        save(root, case)
    return public(case)


@router.get("/cases/{case_id}")
def get_case(case_id: str, root=Depends(scope)):
    with _lock:
        return public(load(root, case_id))


@router.post("/cases/{case_id}/defaults")
def set_default_templates(case_id: str, body: ReviewBody, root=Depends(scope)):
    with _lock:
        case = load(root, case_id)
        version(case, body.revision)
        try:
            count = store_default_templates(root, case)
        except OSError as exc:
            raise HTTPException(422, "模板文件缺失或无法写入，请重新添加 Word 文件") from exc
    return {"count": count}


@router.post("/cases/{case_id}/defaults/apply")
def use_default_templates(case_id: str, body: ReviewBody, root=Depends(scope)):
    with _lock:
        case = load(root, case_id)
        version(case, body.revision)
        if case["templates"]:
            raise HTTPException(409, "当前已有 Word 模板，请先移除后再载入默认模板")
        try:
            count = attach_default_templates(root, case)
        except (ValueError, KeyError, OSError) as exc:
            raise HTTPException(422, "默认模板未能载入，请重新选择 Word 文件") from exc
        if not count:
            raise HTTPException(404, "尚未设置默认模板。添加 Word 文件后，可将这组模板设为默认。")
        case["revision"] += 1
        case["review_token"] = None
        case.pop("template_notice", None)
        save(root, case)
        return public(case)


@router.put("/cases/{case_id}")
def update_case(case_id: str, body: DraftBody, root=Depends(scope)):
    with _lock:
        case = load(root, case_id)
        version(case, body.revision)
        if set(body.values) != {f["key"] for f in case["fields"]} or any(
            len(v) > 20000 for v in body.values.values()
        ):
            raise HTTPException(422, "填写字段与 Excel 配置不一致或内容过长")
        case["name"] = body.name
        for field in case["fields"]:
            field["value"] = body.values[field["key"]]
        case["recipients"] = recipient_defaults(
            [r.model_dump(exclude_none=True) for r in body.recipients],
        )
        case["revision"] += 1
        case["review_token"] = None
        save(root, case)
        return public(case)


@router.post("/cases/{case_id}/templates")
def add_templates(
    case_id: str,
    revision: int = Form(...),
    files: list[UploadFile] = File(...),
    root=Depends(scope),
):
    if not 1 <= len(files) <= 20:
        raise HTTPException(422, "一次最多导入 20 个 Word 模板")
    with _lock:
        case = load(root, case_id)
        version(case, revision)
        global_keys = {f["key"] for f in case["fields"]}
    prepared = []
    try:
        for file in files:
            content = upload(file, ".docx")
            info = template_info(
                content,
                name_only(file.filename),
                global_keys,
            )
            prepared.append(
                (
                    dict(
                        info,
                        id=uuid.uuid4().hex,
                        sha256=hashlib.sha256(content).hexdigest(),
                    ),
                    content,
                ),
            )
    except Exception as exc:
        if isinstance(exc, HTTPException):
            raise
        raise HTTPException(422, f"Word 模板无法读取：{exc}") from exc
    with _lock:
        case = load(root, case_id)
        version(case, revision)
        if len(case["templates"]) + len(prepared) > 20:
            raise HTTPException(422, "每条记录最多保留 20 个 Word 模板")
        for info, content in prepared:
            target = folder(root, case_id) / "templates"
            target.mkdir(exist_ok=True)
            (target / (info["id"] + ".docx")).write_bytes(content)
            case["templates"].append(info)
        case["revision"] += 1
        case["review_token"] = None
        save(root, case)
        return public(case)


@router.delete("/cases/{case_id}/templates/{template_id}")
def remove_template(
    case_id: str,
    template_id: str,
    revision: int,
    root=Depends(scope),
):
    with _lock:
        case = load(root, case_id)
        version(case, revision)
        case["templates"] = [
            t for t in case["templates"] if t["id"] != template_id
        ]
        case["revision"] += 1
        case["review_token"] = None
        save(root, case)
        return public(case)


@router.post("/cases/{case_id}/review")
def review(case_id: str, body: ReviewBody, root=Depends(scope)):
    with _lock:
        case = load(root, case_id)
        version(case, body.revision)
        results = checks(case)
        blocked = any(r["status"] != "ok" for r in results)
        case["review_token"] = None if blocked else uuid.uuid4().hex
        save(root, case)
        return {
            "checks": results,
            "can_generate": not blocked,
            "review_token": case["review_token"],
            "revision": case["revision"],
        }


@router.post("/cases/{case_id}/generate")
def generate(case_id: str, body: GenerateBody, root=Depends(scope)):
    with _lock:
        case = load(root, case_id)
        version(case, body.revision)
        if (
            not body.confirmed
            or not body.review_token
            or body.review_token != case["review_token"]
        ):
            raise HTTPException(409, "请先完成核对并确认本次填写内容")
        if any(r["status"] != "ok" for r in checks(case)):
            raise HTTPException(422, "资料不完整或存在日期冲突，请重新核对")
        generation_id = uuid.uuid4().hex
        base = folder(root, case_id)
        staging = base / ("staging-" + generation_id)
        staging.mkdir()
        files = []
        try:
            for n, t in enumerate(case["templates"], 1):
                source = (
                    base / "templates" / (t["id"] + ".docx")
                ).read_bytes()
                if hashlib.sha256(source).hexdigest() != t["sha256"]:
                    raise ValueError("模板内容已变化，请重新导入")
                for i, recipient in enumerate(
                    case["recipients"] if t["per_recipient"] else [None],
                    1,
                ):
                    filename = (
                        f"{n:02d}_{name_only(Path(t['name']).stem)}"
                        + (
                            f"_{i:02d}_{name_only(recipient['name'])}"
                            if recipient
                            else ""
                        )
                        + ".docx"
                    )
                    data = render_template(source, case["fields"], recipient)
                    (staging / filename).write_bytes(data)
                    files.append(
                        {
                            "name": filename,
                            "size": len(data),
                            "recipient": recipient["name"]
                            if recipient
                            else "共用文件",
                        },
                    )
            (staging / "填写数据.xlsx").write_bytes(export_excel(case))
            (staging / "核对记录.json").write_text(
                json.dumps(
                    {
                        "revision": case["revision"],
                        "checks": checks(case),
                        "fields": case["fields"],
                        "recipients": case["recipients"],
                        "templates": case["templates"],
                    },
                    ensure_ascii=False,
                    indent=2,
                ),
                encoding="utf-8",
            )
            with ZipFile(staging / "全部文书.zip", "w", ZIP_DEFLATED) as archive:
                for path in staging.iterdir():
                    if path.name != "全部文书.zip":
                        archive.write(path, path.name)
            target = base / "outputs" / generation_id
            target.parent.mkdir(exist_ok=True)
            staging.replace(target)
        except Exception as exc:
            shutil.rmtree(staging, ignore_errors=True)
            raise HTTPException(422, f"未生成文件：{exc}") from exc
        for f in files:
            # The host converter accepts preview URLs rooted in WORKING_DIR.
            f["preview_url"] = "/api/files/preview/" + quote(
                str(target / f["name"]),
                safe="",
            )
        generation = {
            "id": generation_id,
            "revision": case["revision"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "files": files,
        }
        case["generations"].insert(0, generation)
        case["review_token"] = None
        save(root, case)
        return public(case)


@router.get("/cases/{case_id}/outputs/{generation_id}/{filename}")
def download(
    case_id: str,
    generation_id: str,
    filename: str,
    root=Depends(scope),
):
    with _lock:
        case = load(root, case_id)
        generation = next(
            (g for g in case["generations"] if g["id"] == generation_id),
            None,
        )
        if not generation or filename not in {
            f["name"] for f in generation["files"]
        } | {"全部文书.zip", "填写数据.xlsx"}:
            raise HTTPException(404, "文件不存在")
        path = folder(root, case_id) / "outputs" / generation_id / filename
        return FileResponse(path, filename=filename)


@router.get("/cases/{case_id}/excel")
def excel(case_id: str, root=Depends(scope)):
    with _lock:
        case = load(root, case_id)
        return Response(
            export_excel(case),
            media_type=(
                "application/vnd.openxmlformats-officedocument."
                "spreadsheetml.sheet"
            ),
            headers={
                "Content-Disposition": "attachment; filename*=UTF-8''"
                + quote(name_only(case["name"]) + ".xlsx"),
            },
        )


@router.get("/starter")
def starter():
    stream = io.BytesIO()
    with ZipFile(stream, "w", ZIP_DEFLATED) as archive:
        for name, content in starter_files().items():
            archive.writestr(name, content)
    return Response(
        stream.getvalue(),
        media_type="application/zip",
        headers={
            "Content-Disposition": (
                "attachment; filename=document-forms-starter.zip"
            ),
        },
    )


app.include_router(router)
plugin = app
