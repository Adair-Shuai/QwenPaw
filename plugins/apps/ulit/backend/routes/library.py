# -*- coding: utf-8 -*-
"""ULit library routes — projects, papers, files, import."""

from __future__ import annotations

import asyncio
import logging
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from qwenpaw.pawapp import get_ctx

from .. import repository as repo
from ..database import get_data_root
from ..enums import ALLOWED_EXTENSIONS, MAX_UPLOAD_SIZE, ReadingStatus
from ..schemas import (
    BibliographyImport,
    IdentifierImport,
    PaperMerge,
    PaperPatch,
    ProjectCreate,
    ProjectPatch,
    SearchQuery,
)
from ..services import IngestService, LibraryService

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Health & capabilities ───────────────────────────────────────────

@router.get("/health")
async def health() -> dict:
    """Check database and parser availability."""
    from ..database import get_db
    try:
        await asyncio.to_thread(get_db().execute, "SELECT 1")
        db_ok = True
    except Exception:
        db_ok = False
    try:
        import fitz  # noqa: F401
        parser_ok = True
    except ImportError:
        parser_ok = False
    return {
        "database": "ok" if db_ok else "error",
        "pdf_parser": "pymupdf" if parser_ok else "unavailable",
        "data_root": str(get_data_root()),
    }


@router.get("/capabilities")
async def capabilities() -> dict:
    """Return available capabilities."""
    try:
        import fitz  # noqa: F401
        pdf_text = True
    except ImportError:
        pdf_text = False
    return {
        "pdf_text_extraction": pdf_text,
        "grobid": bool(__import__("os").environ.get("ULIT_GROBID_URL", "").strip()),
        "ocr": False,
        "vector_search": False,
        "fulltext_search": True,
        "external_sources": ["crossref"],
        "async_import": True,
    }


# ── Projects ────────────────────────────────────────────────────────

@router.get("/projects")
async def list_projects() -> dict:
    projects = await LibraryService.list_projects()
    # Enrich with paper counts
    for p in projects:
        papers = await LibraryService.get_project_papers(p["id"])
        p["paper_count"] = len(papers)
    return {"projects": projects}


@router.post("/projects")
async def create_project(body: ProjectCreate) -> dict:
    return await LibraryService.create_project(
        body.name, body.question, body.description
    )


@router.get("/projects/{project_id}")
async def get_project(project_id: str) -> dict:
    proj = await LibraryService.get_project(project_id)
    if proj is None:
        raise HTTPException(404, "Project not found")
    papers = await LibraryService.get_project_papers(project_id)
    proj["papers"] = papers
    return proj


@router.patch("/projects/{project_id}")
async def update_project(project_id: str, body: ProjectPatch) -> dict:
    fields = {k: v for k, v in body.model_dump().items() if v is not None}
    proj = await LibraryService.update_project(project_id, **fields)
    if proj is None:
        raise HTTPException(404, "Project not found")
    return proj


@router.delete("/projects/{project_id}")
async def delete_project(project_id: str) -> dict:
    await LibraryService.delete_project(project_id)
    return {"ok": True}


@router.get("/projects/{project_id}/papers")
async def get_project_papers(project_id: str) -> dict:
    papers = await LibraryService.get_project_papers(project_id)
    return {"papers": papers}


@router.post("/projects/{project_id}/papers")
async def add_paper_to_project(project_id: str, body: dict) -> dict:
    paper_id = body.get("paper_id", "")
    if not paper_id:
        raise HTTPException(400, "paper_id required")
    return await LibraryService.add_paper_to_project(project_id, paper_id)


@router.delete("/projects/{project_id}/papers/{paper_id}")
async def remove_paper_from_project(project_id: str, paper_id: str) -> dict:
    await LibraryService.remove_paper_from_project(project_id, paper_id)
    return {"ok": True}


@router.patch("/projects/{project_id}/papers/{paper_id}/status")
async def update_reading_status(project_id: str, paper_id: str, body: dict) -> dict:
    """Update the per-project reading state and mirror the paper status."""
    status = str(body.get("status", "")).strip().lower()
    allowed = {item.value for item in ReadingStatus}
    if status not in allowed:
        raise HTTPException(400, f"status must be one of {sorted(allowed)}")
    linked = await asyncio.to_thread(repo.get_project_papers, project_id)
    if not any(p["id"] == paper_id for p in linked):
        raise HTTPException(404, "Paper is not in this project")
    await asyncio.to_thread(repo.set_reading_status, project_id, paper_id, status)
    return {"project_id": project_id, "paper_id": paper_id, "status": status}


# ── Papers ──────────────────────────────────────────────────────────

@router.get("/papers")
async def list_papers(
    project_id: Optional[str] = None,
    status: Optional[str] = None,
    inbox: bool = False,
    limit: int = 100,
    offset: int = 0,
) -> dict:
    papers = await LibraryService.list_papers(
        project_id=project_id, status=status, inbox_only=inbox,
        limit=limit, offset=offset,
    )
    return {"papers": papers}


@router.get("/papers/{paper_id}")
async def get_paper(paper_id: str) -> dict:
    paper = await LibraryService.get_paper(paper_id)
    if paper is None:
        raise HTTPException(404, "Paper not found")
    return paper


@router.patch("/papers/{paper_id}")
async def update_paper(paper_id: str, body: PaperPatch) -> dict:
    fields = {k: v for k, v in body.model_dump().items() if v is not None}
    paper = await LibraryService.update_paper(paper_id, **fields)
    if paper is None:
        raise HTTPException(404, "Paper not found")
    return paper


@router.delete("/papers/{paper_id}")
async def delete_paper(paper_id: str) -> dict:
    await LibraryService.delete_paper(paper_id)
    return {"ok": True}


@router.post("/papers/{paper_id}/restore")
async def restore_paper(paper_id: str) -> dict:
    paper = await LibraryService.restore_paper(paper_id)
    if paper is None:
        raise HTTPException(404, "Paper not found")
    return paper


@router.post("/papers/merge")
async def merge_papers(body: PaperMerge) -> dict:
    paper = await LibraryService.merge_papers(body.source_id, body.target_id)
    if paper is None:
        raise HTTPException(404, "Target paper not found")
    return paper


# ── Search ──────────────────────────────────────────────────────────

@router.post("/search")
async def search(body: SearchQuery) -> dict:
    """Full-text search over papers using FTS5."""
    results = await LibraryService.search(
        body.query, project_id=body.project_id, limit=body.limit
    )
    return {"papers": results}


# ── Import ──────────────────────────────────────────────────────────

@router.post("/imports/files")
async def import_files(
    files: List[UploadFile] = File(...),
    project_id: Optional[str] = None,
    ctx=Depends(get_ctx),
) -> dict:
    """Upload one or more PDF files. Returns import results."""
    results = []
    for upload in files:
        filename = upload.filename or "upload.pdf"
        # Validate file type — record per-file failure instead of aborting
        # the whole batch so the remaining files still get imported.
        ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            results.append({
                "filename": filename,
                "status": "failed",
                "error": f"File type {ext} not allowed. Allowed: {sorted(ALLOWED_EXTENSIONS)}",
            })
            continue

        data = await upload.read()
        if len(data) > MAX_UPLOAD_SIZE:
            results.append({
                "filename": filename,
                "status": "failed",
                "error": f"File too large (max {MAX_UPLOAD_SIZE // (1024*1024)}MB)",
            })
            continue

        try:
            paper = await IngestService.import_pdf_bytes(
                data, filename, project_id=project_id
            )
            # Parsing is a durable background job.  The upload request stays
            # responsive and the task center can expose failures/retries.
            parse_job = None
            if paper.get("file"):
                from ..job_runner import JobRunner
                parse_job = JobRunner.enqueue(
                    "parse_document",
                    payload={"file_id": paper["file"]["id"]},
                    ctx=ctx,
                    paper_id=paper.get("id"),
                    project_id=project_id,
                )

            results.append({
                "paper": paper,
                "filename": filename,
                "status": "imported",
                "parse_job": parse_job,
            })
        except Exception as exc:
            logger.exception("[ulit] Import failed for %s", filename)
            results.append({
                "filename": filename,
                "status": "failed",
                "error": str(exc),
            })

    return {"results": results}


@router.post("/imports/identifiers")
async def import_identifiers(body: IdentifierImport) -> dict:
    papers = await IngestService.import_identifiers(
        body.identifiers, project_id=body.project_id
    )
    return {"papers": papers}


@router.post("/imports/bibliography")
async def import_bibliography(body: BibliographyImport) -> dict:
    papers = await IngestService.import_bibliography(
        body.content, body.format, project_id=body.project_id
    )
    return {"papers": papers}


# ── Files ───────────────────────────────────────────────────────────

@router.get("/papers/{paper_id}/files")
async def get_paper_files(paper_id: str) -> dict:
    files = await asyncio.to_thread(repo.get_paper_files, paper_id)
    return {"files": files}


@router.get("/files/{file_id}/content")
async def get_file_content(file_id: str) -> FileResponse:
    """Stream PDF file content with Range support."""
    file_rec = await asyncio.to_thread(repo.get_file, file_id)
    if file_rec is None:
        raise HTTPException(404, "File not found")
    path = Path(file_rec["path"]).resolve()
    root = get_data_root().resolve()
    if root not in path.parents or not path.is_file():
        raise HTTPException(404, "File content unavailable")
    return FileResponse(
        str(path),
        media_type=file_rec.get("mime", "application/pdf"),
        filename=file_rec.get("filename", "document.pdf"),
    )


@router.get("/files/{file_id}/document")
async def get_file_document(file_id: str) -> dict:
    """Get parsed document info: pages, sections, chunks."""
    doc = await asyncio.to_thread(repo.get_document_by_file, file_id)
    if doc is None:
        # Parsing is normally scheduled at import time.  Do not block a UI
        # request on a potentially large PDF; the caller can explicitly
        # reparse or poll the task center.
        raise HTTPException(409, "Document is not parsed yet; wait for the parse job")

    page_texts = await asyncio.to_thread(repo.get_page_texts, doc["id"])
    return {
        "document": doc,
        "page_texts": page_texts,
        "page_count": len(page_texts),
    }


@router.post("/files/{file_id}/reparse")
async def reparse_file(file_id: str) -> dict:
    """Re-parse a file."""
    file_rec = await asyncio.to_thread(repo.get_file, file_id)
    if file_rec is None:
        raise HTTPException(404, "File not found")
    doc = await IngestService.parse_document(file_id)
    return doc
