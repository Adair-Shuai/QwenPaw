# -*- coding: utf-8 -*-
# pylint: disable=too-many-branches,too-many-statements
"""ULit 文研 — PawApp backend entry point.

Exports a :class:`PawApp` instance named ``app`` (also aliased as
``plugin``) which the PluginLoader discovers and registers. All ULit
REST routes are mounted under ``/api/ulit`` via the PawApp router
prefix contract.
"""

from __future__ import annotations

import asyncio
import logging

from qwenpaw.pawapp import PawApp, get_ctx

# PluginLoader imports this file with the plugin root as the package path
# (for example ``plugin_ulit.backend.main``).  Keep the backend package in
# the import path explicitly; importing ``.database`` would look for a
# non-existent ``plugin_ulit.database`` module and prevent the app from
# loading at all.
from .backend.database import close_db, get_data_root, get_db
from .backend import repository as repo
from .backend.job_runner import JobRunner
from .backend.routes import router as ulit_router
from .backend.services import LibraryService

logger = logging.getLogger("qwenpaw").getChild("plugin.ulit")

# ── PawApp definition ──────────────────────────────────────────────

app = PawApp(name="ULit 文研", app_id="ulit")
app.include_router(ulit_router)


# ── Lifecycle: startup ─────────────────────────────────────────────


@app.hook("startup", priority=90)
async def _startup() -> None:
    """Initialize ULit on startup.

    1. Ensure data root and database are ready
    2. Recover interrupted jobs
    3. Log capability status
    """
    try:
        data_root = get_data_root()
        db = get_db()
        logger.info("[ulit] Data root: %s", data_root)
        logger.info("[ulit] Database: %s", db.db_path)
    except Exception:
        logger.exception("[ulit] Failed to initialize data root / database")
        raise

    # Recover interrupted jobs
    try:
        recovered = await asyncio.to_thread(JobRunner.recover_on_startup)
        if recovered:
            logger.info("[ulit] Recovered %d interrupted jobs", len(recovered))
    except Exception:
        logger.exception("[ulit] Job recovery failed (non-fatal)")

    # Check PDF parser availability
    try:
        import fitz  # noqa: F401
        logger.info("[ulit] PDF text extraction: PyMuPDF available")
    except ImportError:
        logger.warning(
            "[ulit] PyMuPDF (fitz) not installed — PDF text extraction disabled. "
            "Install with: pip install PyMuPDF"
        )

    logger.info("[ulit] ULit 文研 ready")


@app.hook("shutdown", priority=90)
async def _shutdown() -> None:
    """Shutdown ULit gracefully.

    1. Cancel all running background tasks
    2. Close database connections
    """
    logger.info("[ulit] Shutting down...")
    try:
        JobRunner.shutdown()
    except Exception:
        logger.exception("[ulit] JobRunner shutdown error")
    try:
        close_db()
    except Exception:
        logger.exception("[ulit] Database close error")
    logger.info("[ulit] Shutdown complete")


# ── Agent tools ────────────────────────────────────────────────────
# Read-only tools that let the QwenPaw main Agent access the user's
# literature library from outside the ULit app context.


@app.tool(
    "ulit_search_library",
    description="Search the ULit literature library by keyword. Returns matching papers with title, authors, year, and DOI.",
    icon="🔍",
    enabled=True,
)
async def ulit_search_library(
    query: str = "",
    project_id: str = "",
    limit: int = 20,
) -> dict:
    """Search the user's literature library."""
    if not query:
        papers = await LibraryService.list_papers(limit=limit)
    else:
        papers = await LibraryService.search(query, project_id=project_id or None, limit=limit)

    # Return compact summaries
    return {
        "count": len(papers),
        "papers": [
            {
                "id": p["id"],
                "title": p.get("title", ""),
                "year": p.get("year"),
                "doi": p.get("doi", ""),
                "status": p.get("status", ""),
            }
            for p in papers
        ],
    }


@app.tool(
    "ulit_get_paper",
    description="Get detailed metadata for a paper in the ULit library, including abstract, authors, and identifiers.",
    icon="📄",
    enabled=True,
)
async def ulit_get_paper(paper_id: str) -> dict:
    """Get paper details."""
    paper = await LibraryService.get_paper(paper_id)
    if paper is None:
        return {"error": "Paper not found", "paper_id": paper_id}
    return paper


@app.tool(
    "ulit_read_evidence",
    description="Read evidence cards, annotations, or page text from a paper in the ULit library. Specify what to read with kind: 'evidence', 'annotations', or 'page'.",
    icon="📖",
    enabled=True,
)
async def ulit_read_evidence(
    paper_id: str,
    kind: str = "evidence",
    page_index: int = -1,
    project_id: str = "",
) -> dict:
    """Read evidence, annotations, or page text for a paper."""
    if kind == "evidence" and project_id:
        evidence = await asyncio.to_thread(repo.list_evidence, project_id)
        paper_evidence = [e for e in evidence if e.get("paper_id") == paper_id]
        return {"kind": "evidence", "count": len(paper_evidence), "items": paper_evidence}

    elif kind == "annotations":
        files = await asyncio.to_thread(repo.get_paper_files, paper_id)
        all_annos = []
        for f in files:
            annos = await asyncio.to_thread(repo.list_annotations, f["id"])
            all_annos.extend(annos)
        return {"kind": "annotations", "count": len(all_annos), "items": all_annos}

    elif kind == "page":
        files = await asyncio.to_thread(repo.get_paper_files, paper_id)
        if not files:
            return {"error": "No file attached to this paper"}
        doc = await asyncio.to_thread(repo.get_document_by_file, files[0]["id"])
        if doc is None:
            return {"error": "Document not yet parsed"}
        if page_index >= 0:
            page = await asyncio.to_thread(repo.get_page_text, doc["id"], page_index)
            return {"kind": "page", "page_index": page_index, "text": page.get("text", "") if page else ""}
        else:
            pages = await asyncio.to_thread(repo.get_page_texts, doc["id"])
            return {"kind": "pages", "page_count": len(pages), "items": pages}

    return {"error": f"Unknown kind: {kind}. Use 'evidence', 'annotations', or 'page'."}


@app.tool(
    "ulit_list_project_evidence",
    description="List confirmed evidence cards for a ULit project. Returns claims, quotes, and source references.",
    icon="🗂️",
    enabled=True,
)
async def ulit_list_project_evidence(project_id: str) -> dict:
    """List project evidence cards."""
    evidence = await asyncio.to_thread(repo.list_evidence, project_id)
    confirmed = [e for e in evidence if e.get("verification_status") == "confirmed"]
    return {
        "project_id": project_id,
        "total": len(evidence),
        "confirmed": len(confirmed),
        "items": confirmed,
    }


# The 'plugin' variable is what PluginLoader looks for.
plugin = app
