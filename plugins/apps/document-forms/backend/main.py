# -*- coding: utf-8 -*-
"""Document routes, isolated by authenticated user and Agent."""

from __future__ import annotations

import hashlib
import io
import json
import logging
import os
import re
import shutil
import subprocess
import sys
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
    Query,
)
from fastapi.responses import FileResponse, Response, JSONResponse
from pydantic import BaseModel, Field
from qwenpaw.constant import WORKING_DIR
from qwenpaw.pawapp import PawApp

from .backend import builtin  # pylint: disable=relative-beyond-top-level
from .backend import projects  # pylint: disable=relative-beyond-top-level
from .backend import (  # pylint: disable=relative-beyond-top-level
    review as response_review,
)

# PluginLoader treats this entry module as the plugin root package.
from .backend.engine import (  # pylint: disable=relative-beyond-top-level
    MAX_FILE,
    checks,
    document_date,
    document_field_value,
    export_excel,
    read_excel,
    recipient_defaults,
    render_template,
    template_info,
    template_metadata,
)

app = PawApp(name="文书填报", app_id="document-forms")
app.agent_profile(
    response_review.AGENT_ID,
    name="响应文件核查",
    description="对照商务谈判文件核查响应材料，列出问题、依据与待人工确认事项。",
    language="zh",
    plan_enabled=False,
    pinned=False,
)
router = APIRouter()
ROOT = Path(WORKING_DIR) / "apps" / "document-forms"
_lock = threading.RLock()
_print_lock = threading.Lock()
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
    normalize_templates(case)
    if case.get("selection_schema") == 1 and case.get("stage_id") == "selection":
        project_id = case.get("project_id")
        if not project_id:
            linked = [
                project
                for project in project_store.all_projects(root)
                if project.get("form_id") == case["id"]
                or any(form["case_id"] == case["id"] for form in project["forms"])
            ]
            if len(linked) == 1:
                project_id = linked[0]["id"]
                case["project_id"] = project_id
        if project_id:
            project_store.prepare_selection(
                root, project_store.load(root, project_id), case
            )
    return case


def template_extension(template):
    return ".xlsx" if template.get("name", "").lower().endswith(".xlsx") else ".docx"


def normalize_templates(case):
    for index, template in enumerate(case["templates"], 1):
        template.update(template_metadata(template["name"], index))


def project_name(case):
    return name_only(
        next(
            (
                f["value"]
                for f in case["fields"]
                if f["key"] == "project.name" and f["value"].strip()
            ),
            case["name"],
        ),
    )[:40]


def output_name(case, template, index, recipient, recipient_index):
    name = f"{index:02d}_{name_only(template['title'])[:28]}_{project_name(case)}"
    if recipient:
        name += f"_{recipient_index:02d}_{name_only(recipient['name'])[:40]}"
    return name + template_extension(template)


def save(root, case):
    normalize_templates(case)
    path = folder(root, case["id"])
    path.mkdir(parents=True, exist_ok=True)
    case["updated_at"] = datetime.now(timezone.utc).isoformat()
    temp = path / "draft.tmp"
    temp.write_text(json.dumps(case, ensure_ascii=False), encoding="utf-8")
    temp.replace(path / "draft.json")


def public(case):
    result = {k: v for k, v in case.items() if k != "review_token"}
    result["content_digest"] = projects.content_digest(case)
    result["document_values"] = {
        f["key"]: document_field_value(f) for f in case["fields"]
    }
    result["recipient_document_times"] = [
        document_date(r["start"] + " 至 " + r["end"]) for r in case["recipients"]
    ]
    return result


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
    return re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", name).strip(" .")[:100] or "文书"


def office_cli():
    """Share the host's bundled OfficeCLI."""
    # The released host exposes the binary through these internal helpers.
    # pylint: disable=protected-access
    from qwenpaw.app.routers import workspace

    if not workspace._is_officecli_available():
        raise ValueError("OfficeCLI 暂不可用")
    return workspace._officecli_bin()


def print_document(source, cache, page=None):
    """Render real Word pages; HTML pagination cannot verify a printed form."""
    with _print_lock:
        cache.mkdir(parents=True, exist_ok=True)
        stats = cache / "pages-v3.json"
        target = cache / (f"page-{page}.png" if page else "document-v3.png")
        count = None
        if stats.is_file():
            count = json.loads(stats.read_text(encoding="utf-8"))["pages"]
            if page == 0:
                return None, count
            if page is not None and page > count:
                raise HTTPException(404, "页码超出文书范围")
            if target.is_file():
                return target, count
        binary = office_cli()
        working = cache / (uuid.uuid4().hex[:8] + ".docx")
        temp = working.with_suffix(".png")
        # The resident in older OfficeCLI builds drops page-range arguments.
        # Use an isolated read copy with auto-resident disabled. Native page
        # stitching retains full resolution; contact sheets shrink long files.
        environment = dict(os.environ, OFFICECLI_NO_AUTO_RESIDENT="1")
        try:
            shutil.copyfile(source, working)
            if count is None:
                result = subprocess.run(
                    [
                        binary,
                        "view",
                        str(working),
                        "stats",
                        "--page-count",
                        "--json",
                    ],
                    capture_output=True,
                    timeout=90,
                    check=False,
                    env=environment,
                )
                if result.returncode:
                    raise ValueError("无法读取 Word 页数")
                data = json.loads(result.stdout)
                count = data.get("data", data).get("pages", 0)
                if not isinstance(count, int) or not 1 <= count <= 40:
                    raise ValueError("未获得有效的 Word 页数")
                stats.write_text(
                    json.dumps({"pages": count}),
                    encoding="utf-8",
                )
            if page == 0:
                return None, count
            if page is not None and page > count:
                raise HTTPException(404, "页码超出文书范围")
            result = subprocess.run(
                [
                    binary,
                    "view",
                    str(working),
                    "screenshot",
                    "--render",
                    "native",
                    "--page",
                    str(page) if page else f"1-{count}",
                    "-o",
                    str(temp),
                ],
                capture_output=True,
                timeout=90,
                check=False,
                env=environment,
            )
            if (
                result.returncode
                or not temp.is_file()
                or not temp.read_bytes().startswith(b"\x89PNG\r\n\x1a\n")
            ):
                raise ValueError("Word 打印页面未能渲染")
            temp.replace(target)
            stats.write_text(json.dumps({"pages": count}), encoding="utf-8")
        finally:
            temp.unlink(missing_ok=True)
            working.unlink(missing_ok=True)
        return target, count


def default_library(root, case):
    stage_id = case.get("stage_id", "negotiation")
    if stage_id != "negotiation" and stage_id in projects.STAGE_IDS:
        return root / "stage-defaults" / stage_id
    return root / "default-templates"


def attach_default_templates(root, case):
    library = default_library(root, case)
    index = library / "index.json"
    built_in = not index.is_file()
    bundled = {}
    if built_in:
        if case.get("stage_id", "negotiation") not in {
            "negotiation",
            "plan",
            "selection",
            "acceptance",
        }:
            case["template_notice"] = (
                "本阶段尚未设置默认 文书模板，可添加统一模板后设为本阶段默认。"
            )
            return 0
        field_keys = {field["key"] for field in case["fields"]}
        if (
            case.get("stage_id", "negotiation")
            not in {"plan", "selection", "acceptance"}
            and not {
                field["key"]
                for field in builtin.blank_fields()
                if not field["key"].startswith("implementation.")
            }
            <= field_keys
        ):
            case["template_notice"] = (
                "这份 Excel 字段不同，请添加对应的 文书模板，或使用应用配套 Excel。"
            )
            return 0
        if case.get("stage_id", "negotiation") == "negotiation":
            case["fields"].extend(
                field
                for field in builtin.implementation_fields()
                if field["key"] not in field_keys
            )
        bundled = builtin.load_templates(case.get("stage_id", "negotiation"))
        entries = [
            {"name": name, "sha256": hashlib.sha256(content).hexdigest()}
            for name, content in bundled.items()
        ]
    else:
        entries = json.loads(index.read_text(encoding="utf-8"))
    if not isinstance(entries, list) or not 1 <= len(entries) <= 20:
        raise ValueError("默认模板清单不完整，请重新设定")
    prepared = []
    for entry in entries:
        digest = entry["sha256"]
        if not re.fullmatch(r"[a-f0-9]{64}", digest):
            raise ValueError("默认模板校验信息无效")
        content = (
            bundled[entry["name"]]
            if built_in
            else (library / (digest + template_extension(entry))).read_bytes()
        )
        if hashlib.sha256(content).hexdigest() != digest:
            raise ValueError("默认模板内容已改变，请重新选择原文件")
        if case.get("stage_id") == "plan" and digest == builtin.LEGACY_PLAN_WORD:
            content = builtin.load_templates("plan")[builtin.PLAN_NAMES[0]]
            digest = hashlib.sha256(content).hexdigest()
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
                    from_builtin=built_in,
                ),
                content,
            ),
        )
    target = folder(root, case["id"]) / "templates"
    target.mkdir(parents=True, exist_ok=True)
    for info, content in prepared:
        (target / (info["id"] + template_extension(info))).write_bytes(content)
    case["templates"] = [info for info, _ in prepared]
    normalize_templates(case)
    return len(prepared)


def store_default_templates(root, case):
    if not case["templates"]:
        raise HTTPException(422, "请先添加需要作为默认的 文书模板")
    library = default_library(root, case)
    prepared = []
    for template in case["templates"]:
        content = (
            folder(root, case["id"])
            / "templates"
            / (template["id"] + template_extension(template))
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
        temp.replace(library / (entry["sha256"] + template_extension(entry)))
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
            json.loads(p.read_text(encoding="utf-8")) for p in root.glob("*/draft.json")
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
            raise HTTPException(
                422,
                "模板文件缺失或无法写入，请重新添加 Word 文件",
            ) from exc
    return {"count": count}


@router.post("/cases/{case_id}/defaults/apply")
def use_default_templates(case_id: str, body: ReviewBody, root=Depends(scope)):
    with _lock:
        case = load(root, case_id)
        version(case, body.revision)
        if case["templates"]:
            raise HTTPException(
                409,
                "当前已有 文书模板，请先移除后再载入默认模板",
            )
        try:
            count = attach_default_templates(root, case)
        except (ValueError, KeyError, OSError) as exc:
            raise HTTPException(
                422,
                "默认模板未能载入，请重新选择 Word 文件",
            ) from exc
        if not count:
            raise HTTPException(
                422,
                case.get("template_notice", "未能载入默认模板，请重新选择 Word 文件"),
            )
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
        if any(
            field.get("read_only") and body.values[field["key"]] != field["value"]
            for field in case["fields"]
        ):
            raise HTTPException(
                422, "论证预算引用基础信息，请在基础信息填报中修改项目金额"
            )
        case["name"] = body.name
        for field in case["fields"]:
            field["value"] = body.values[field["key"]]
        case["recipients"] = recipient_defaults(
            [r.model_dump(exclude_none=True) for r in body.recipients],
        )
        case["revision"] += 1
        case["review_token"] = None
        normalize_templates(case)
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
        raise HTTPException(422, "一次最多导入 20 个 文书模板")
    with _lock:
        case = load(root, case_id)
        version(case, revision)
        global_keys = {f["key"] for f in case["fields"]}
    prepared = []
    try:
        for file in files:
            extension = Path(file.filename or "").suffix.lower()
            if extension not in {".docx", ".xlsx"}:
                raise HTTPException(422, "文书模板支持 .docx 与 .xlsx 文件")
            content = upload(file, extension)
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
        raise HTTPException(422, f"文书模板无法读取：{exc}") from exc
    with _lock:
        case = load(root, case_id)
        version(case, revision)
        if len(case["templates"]) + len(prepared) > 20:
            raise HTTPException(422, "每条记录最多保留 20 个 文书模板")
        for info, content in prepared:
            target = folder(root, case_id) / "templates"
            target.mkdir(exist_ok=True)
            (target / (info["id"] + template_extension(info))).write_bytes(
                content,
            )
            case["templates"].append(info)
        case["revision"] += 1
        case["review_token"] = None
        case.pop("template_notice", None)
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
        case["templates"] = [t for t in case["templates"] if t["id"] != template_id]
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
                    base / "templates" / (t["id"] + template_extension(t))
                ).read_bytes()
                if hashlib.sha256(source).hexdigest() != t["sha256"]:
                    raise ValueError("模板内容已变化，请重新导入")
                for i, recipient in enumerate(
                    case["recipients"] if t["per_recipient"] else [None],
                    1,
                ):
                    filename = output_name(case, t, n, recipient, i)
                    data = render_template(
                        source,
                        case["fields"],
                        recipient,
                        case["recipients"],
                        template_extension(t),
                    )
                    (staging / filename).write_bytes(data)
                    files.append(
                        {
                            "name": filename,
                            "size": len(data),
                            "extension": template_extension(t).lstrip("."),
                            "print_copies": t["print_copies"],
                            "print_note": t["print_note"],
                            "recipient": (
                                recipient["name"] if recipient else "共用文件"
                            ),
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
            with ZipFile(
                staging / "全部文书.zip",
                "w",
                ZIP_DEFLATED,
            ) as archive:
                for path in staging.iterdir():
                    if path.name != "全部文书.zip":
                        archive.write(
                            path,
                            (
                                project_name(case) + "_" + path.name
                                if path.name in {"填写数据.xlsx", "核对记录.json"}
                                else path.name
                            ),
                        )
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
        bundle_label = {row[0]: row[1] for row in projects.STAGES}.get(
            case.get("stage_id"),
            "谈判",
        )
        generation = {
            "id": generation_id,
            "stage_id": case.get("stage_id", "negotiation"),
            "content_digest": projects.content_digest(case),
            "revision": case["revision"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "files": files,
            "date_style": "zh-CN",
            "naming_style": "formal",
            "data_name": project_name(case) + "_填写数据.xlsx",
            "bundle_name": (
                project_name(case)
                + "_"
                + bundle_label
                + "材料_"
                + datetime.now(timezone.utc).astimezone().strftime("%Y%m%d_%H%M%S")
                + "_"
                + generation_id[:6]
                + ".zip"
            ),
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
        download_name = filename
        if filename == "全部文书.zip":
            download_name = generation.get("bundle_name", filename)
        elif filename == "填写数据.xlsx":
            download_name = generation.get("data_name", filename)
        return FileResponse(path, filename=download_name)


@router.get("/cases/{case_id}/print/{generation_id}/{filename}")
def print_preview(
    case_id: str,
    generation_id: str,
    filename: str,
    page: int | None = Query(None, ge=1, le=40),
    pages: bool = False,
    root=Depends(scope),
):
    with _lock:
        case = load(root, case_id)
        generation = next(
            (g for g in case["generations"] if g["id"] == generation_id),
            None,
        )
        if not generation or filename not in {f["name"] for f in generation["files"]}:
            raise HTTPException(404, "文件不存在")
        source = folder(root, case_id) / "outputs" / generation_id / filename
        digest = hashlib.sha256(source.read_bytes()).hexdigest()
        cache = folder(root, case_id) / "print-previews" / digest[:24]
    try:
        image, count = print_document(source, cache, 0 if pages else page)
    except HTTPException:
        raise
    except (OSError, ValueError, KeyError, subprocess.TimeoutExpired) as exc:
        logger.warning("Office print preview unavailable: %s", exc)
        raise HTTPException(
            503, "打印预览暂不可用，可切换文字预览或下载 Word 查看"
        ) from exc
    if pages:
        return JSONResponse(
            {"pages": count},
            headers={"Cache-Control": "no-store"},
        )
    return FileResponse(
        image,
        media_type="image/png",
        headers={
            "X-Total-Pages": str(count),
            "X-Preview-Engine": "officecli-native",
            "Cache-Control": "no-store",
        },
    )


@router.get("/cases/{case_id}/excel")
def excel(case_id: str, root=Depends(scope)):
    with _lock:
        case = load(root, case_id)
        return Response(
            export_excel(case),
            media_type=(
                "application/vnd.openxmlformats-officedocument." "spreadsheetml.sheet"
            ),
            headers={
                "Content-Disposition": "attachment; filename*=UTF-8''"
                + quote(project_name(case) + "_填写数据.xlsx"),
            },
        )


@router.get("/starter")
def starter():
    stream = io.BytesIO()
    with ZipFile(stream, "w", ZIP_DEFLATED) as archive:
        for name, content in builtin.starter_files().items():
            archive.writestr(name, content)
    return Response(
        stream.getvalue(),
        media_type="application/zip",
        headers={
            "Content-Disposition": ("attachment; filename=document-forms-starter.zip"),
        },
    )


project_store = projects.register_routes(
    router,
    scope,
    _lock,
    sys.modules[__name__],
)
response_review.register_routes(router, scope, _lock, project_store)
response_review.register_assistant_routes(router, scope, _lock, project_store)
app.include_router(router)
plugin = app
