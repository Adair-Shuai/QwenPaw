"""UGSci routes for the gas-storage ledger."""

import hashlib
import os
import sqlite3
import tempfile
from typing import Literal
from pathlib import Path
from io import BytesIO
from urllib.parse import quote

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    Request,
    UploadFile,
)
from fastapi.responses import Response, FileResponse
from starlette.background import BackgroundTask
from pydantic import BaseModel, Field

from qwenpaw.constant import WORKING_DIR
from qwenpaw.pawapp import PawApp
from .backend import engineering, ledger, projects, records, merge

ROOT = Path(WORKING_DIR) / "apps" / "storage-ledger"
plugin = PawApp(name="储气库数据管理", app_id="storage-ledger")
router = APIRouter()
LIMIT = 96 * 1024**2


def legacy_path(request: Request):
    user = str(getattr(request.state, "user", None) or "default")
    agent = (
        request.headers.get("X-Agent-Id")
        or request.query_params.get("agent_id")
        or "default"
    )
    return (
        ROOT
        / hashlib.sha256(f"{user}\0{agent}".encode()).hexdigest()[:32]
        / "ledger.sqlite3"
    )


def scope(request: Request, legacy=Depends(legacy_path)):
    identifier = request.headers.get("X-Ledger-Project")
    return projects.existing(legacy, identifier) if identifier else legacy


@router.get("/projects")
def list_projects(legacy=Depends(legacy_path)):
    return projects.catalog(legacy)


@router.post("/projects")
def create_project(body: projects.ProjectFields, legacy=Depends(legacy_path)):
    return projects.create(legacy, body)


@router.patch("/projects/{identifier}")
def update_project(
    identifier: str, body: projects.ProjectUpdate, legacy=Depends(legacy_path)
):
    with ledger.database(projects.existing(legacy, identifier)) as db:
        db.execute("BEGIN IMMEDIATE")
        return projects.edit(db, identifier, body)


@router.get("/projects/{identifier}/backup")
def backup_project(identifier: str, legacy=Depends(legacy_path)):
    file = projects.snapshot(projects.existing(legacy, identifier))
    return FileResponse(
        file,
        filename="project.ugsdb",
        media_type="application/octet-stream",
        background=BackgroundTask(file.unlink, missing_ok=True),
    )


@router.post("/projects/restore")
def restore_project(file: UploadFile = File(...), legacy=Depends(legacy_path)):
    return projects.restore(legacy, file.file)


@router.get("/workspace")
def workspace(
    src: int | None = None,
    day: str = "",
    well: str = "",
    notes_page: int = 0,
    path=Depends(scope),
):
    with ledger.database(path) as db:
        return ledger.overview(db, src, day, well, min(notes_page, 1000000))


@router.get("/objects")
def project_objects(src: int | None = None, path=Depends(scope)):
    with ledger.database(path) as db:
        return engineering.objects(db, path, src)


@router.get("/series")
def well_series(
    well: list[str] = Query(...),
    src: int | None = None,
    end: str = "",
    span: int = Query(365, ge=0, le=36600),
    path=Depends(scope),
):
    with ledger.database(path) as db:
        return engineering.series(db, src, well, end, span)


@router.get("/trace/{area}")
def record_trace(
    area: str, src: int, row_no: int, sheet: str = "", path=Depends(scope)
):
    with ledger.database(path) as db:
        return engineering.trace(db, area, src, row_no, sheet)


@router.post("/imports")
def upload(file: UploadFile = File(...), path=Depends(scope)):
    raw = file.file.read(LIMIT + 1)
    if len(raw) > LIMIT:
        raise HTTPException(413, "单份工作簿上限为 96 MiB")
    try:
        with projects.write_db(path) as db:
            return ledger.ingest(
                db, Path((file.filename or "").replace("\\", "/")).name, raw
            )
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc


@router.get("/sample")
def sample():
    from openpyxl import Workbook

    book = Workbook()
    block = book.active
    block.title = "区块"
    block.append(["日期", "运行工况", "日注气量（104m3）", "日采气量（104m3）"])
    block.append(["2025-01-01", "采气", None, 10])
    wells = book.create_sheet("单井")
    wells.append(
        [
            "日期",
            "井号",
            "生产时间 h",
            "日注气量（104m3）",
            "日采气量（104m3）",
            "油压 MPa",
            "套压 MPa",
            "备注",
        ]
    )
    for well, amount, note in [
        ("示例井A", 6, "报表值"),
        ("示例井A", 5, "待复核版本"),
        ("示例井B", 4, "报表值"),
    ]:
        wells.append(["2025-01-01", well, 24, None, amount, 10, 9, note])
    stream = BytesIO()
    book.save(stream)
    return Response(
        stream.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


class Review(BaseModel):
    src: int
    day: str
    well: str
    row_no: int
    previous: int | None = None
    note: str = Field(min_length=1, max_length=500)


@router.post("/reviews")
def review(body: Review, path=Depends(scope)):
    try:
        with projects.write_db(path) as db:
            if db.execute(
                "SELECT 1 FROM source_archive WHERE src=?", (body.src,)
            ).fetchone():
                raise HTTPException(409, "此资料已收起")
            ledger.review(db, **body.model_dump())
        return {"saved": True}
    except ValueError as exc:
        raise HTTPException(409, str(exc)) from exc


@router.get("/sources/{identifier}")
def download(identifier: int, path=Depends(scope)):
    with ledger.database(path) as db:
        row = db.execute(
            "SELECT name,original FROM source WHERE id=?", (identifier,)
        ).fetchone()
        if not row:
            raise HTTPException(404, "来源不存在")
        return Response(
            row["original"],
            media_type="application/octet-stream",
            headers={
                "Content-Disposition": "attachment; filename*=UTF-8''"
                + quote(row["name"], safe="")
            },
        )


class SourceState(BaseModel):
    archived: bool


@router.patch("/sources/{identifier}")
def archive_source(identifier: int, body: SourceState, path=Depends(scope)):
    with projects.write_db(path) as db:
        if not db.execute("SELECT id FROM source WHERE id=?", (identifier,)).fetchone():
            raise HTTPException(404, "资料不存在")
        if body.archived:
            db.execute("INSERT OR IGNORE INTO source_archive VALUES(?)", (identifier,))
        else:
            db.execute("DELETE FROM source_archive WHERE src=?", (identifier,))
    return {"archived": body.archived}


class Change(BaseModel):
    src: int | None = None
    record_id: int | None = None
    revision: int = Field(default=0, ge=0)
    action: Literal["add", "edit", "remove", "undo"]
    values: dict = Field(default_factory=dict)
    reason: str = Field(min_length=1, max_length=500)


class Edition(BaseModel):
    sources: list[int] = Field(min_length=2, max_length=50)
    name: str = Field(min_length=1, max_length=100)


@router.post("/editions")
def combine(body: Edition, path=Depends(scope)):
    with projects.write_db(path) as db:
        return merge.combine(db, body.sources, body.name)


@router.get("/records/{area}")
def table(
    area: str,
    src: int | None = None,
    search: str = "",
    start: str = "",
    end: str = "",
    page: int = 0,
    path=Depends(scope),
):
    with ledger.database(path) as db:
        try:
            return records.browse(db, area, src, search, start, end, max(0, page))
        except ValueError as exc:
            raise HTTPException(422, "日期格式无效") from exc


@router.post("/records/{area}")
def change(area: str, body: Change, path=Depends(scope)):
    try:
        with projects.write_db(path) as db:
            return records.mutate(
                db,
                area,
                body.src,
                body.record_id,
                body.revision,
                body.values,
                body.action,
                body.reason,
            )
    except sqlite3.IntegrityError as exc:
        raise HTTPException(409, "记录键冲突，请检查日期或数据版本") from exc
    except (ValueError, TypeError) as exc:
        raise HTTPException(422, str(exc)) from exc


@router.get("/exports/{area}")
def export(
    area: str,
    src: int | None = None,
    search: str = "",
    start: str = "",
    end: str = "",
    path=Depends(scope),
):
    fd, name = tempfile.mkstemp(suffix=".csv")
    try:
        with (
            os.fdopen(fd, "w", encoding="utf-8-sig", newline="") as out,
            ledger.database(path) as db,
        ):
            records.export_csv(db, area, src, search, start, end, out)
        return FileResponse(
            name,
            filename=area + ".csv",
            media_type="text/csv",
            background=BackgroundTask(Path(name).unlink, missing_ok=True),
        )
    except BaseException:
        Path(name).unlink(missing_ok=True)
        raise


@router.post("/attachments")
def attachment(
    file: UploadFile = File(...),
    well: str = Form("", max_length=100),
    category: str = Form("", max_length=100),
    path=Depends(scope),
):
    raw = file.file.read(LIMIT + 1)
    if not raw or len(raw) > LIMIT:
        raise HTTPException(422, "附件须非空且不超过 96 MiB")
    with projects.write_db(path) as db:
        return records.attach(
            db,
            Path((file.filename or "资料").replace("\\", "/")).name,
            raw,
            well,
            category,
        )


plugin.include_router(router)
