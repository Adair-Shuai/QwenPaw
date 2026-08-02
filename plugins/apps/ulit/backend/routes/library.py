# -*- coding: utf-8 -*-
"""ULit library routes — projects, papers, files, import."""

from __future__ import annotations

import asyncio
import logging
from typing import List, Optional

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from .. import repository as repo
from ..database import get_data_root
from ..enums import ALLOWED_EXTENSIONS, MAX_UPLOAD_SIZE
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
        "grobid": False,
        "ocr": False,
        "vector_search": False,
        "external_sources": [],
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
) -> dict:
    """Upload one or more PDF files. Returns import results."""
    results = []
    for upload in files:
        # Validate file type
        ext = "." + upload.filename.rsplit(".", 1)[-1].lower() if "." in upload.filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(400, f"File type {ext} not allowed. Allowed: {ALLOWED_EXTENSIONS}")

        data = await upload.read()
        if len(data) > MAX_UPLOAD_SIZE:
            raise HTTPException(400, f"File too large (max {MAX_UPLOAD_SIZE // (1024*1024)}MB)")

        try:
            paper = await IngestService.import_pdf_bytes(
                data, upload.filename, project_id=project_id
            )
            # Try to parse if we have a file
            if paper.get("file"):
                try:
                    await IngestService.parse_document(paper["file"]["id"])
                except Exception:
                    logger.warning("[ulit] PDF parsing failed for %s", paper.get("id"))

            results.append({
                "paper": paper,
                "filename": upload.filename,
                "status": "imported",
            })
        except Exception as exc:
            logger.exception("[ulit] Import failed for %s", upload.filename)
            results.append({
                "filename": upload.filename,
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
    return FileResponse(
        file_rec["path"],
        media_type=file_rec.get("mime", "application/pdf"),
        filename=file_rec.get("filename", "document.pdf"),
    )


@router.get("/files/{file_id}/document")
async def get_file_document(file_id: str) -> dict:
    """Get parsed document info: pages, sections, chunks."""
    doc = await asyncio.to_thread(repo.get_document_by_file, file_id)
    if doc is None:
        # Auto-parse if not yet parsed
        try:
            doc = await IngestService.parse_document(file_id)
        except Exception as exc:
            raise HTTPException(500, f"Failed to parse document: {exc}") from exc

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
