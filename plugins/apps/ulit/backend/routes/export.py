# -*- coding: utf-8 -*-
"""ULit export routes — Markdown, BibTeX, JSON."""

from __future__ import annotations

import asyncio

from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse

from .. import repository as repo
from ..schemas import ExportRequest
from ..services import ExportService

router = APIRouter()


@router.post("/export")
async def export(body: ExportRequest) -> PlainTextResponse:
    """Export papers, annotations, and evidence in the specified format."""
    fmt = body.format.lower()
    if fmt == "markdown":
        content = await ExportService.export_markdown(
            project_id=body.project_id,
            paper_ids=body.paper_ids or None,
            include_annotations=body.include_annotations,
            include_evidence=body.include_evidence,
        )
        return PlainTextResponse(content, media_type="text/markdown")
    elif fmt == "bibtex":
        content = await ExportService.export_bibtex(
            project_id=body.project_id,
            paper_ids=body.paper_ids or None,
        )
        return PlainTextResponse(content, media_type="application/x-bibtex")
    elif fmt == "json":
        content = await ExportService.export_json(
            project_id=body.project_id,
            paper_ids=body.paper_ids or None,
            include_annotations=body.include_annotations,
            include_evidence=body.include_evidence,
        )
        return PlainTextResponse(content, media_type="application/json")
    elif fmt == "csv":
        # CSV export of evidence cards
        if not body.project_id:
            raise HTTPException(400, "project_id required for CSV export")
        evidence = await asyncio.to_thread(repo.list_evidence, body.project_id)
        import csv as _csv
        import io as _io

        buf = _io.StringIO()
        writer = _csv.writer(buf)
        writer.writerow(["id", "paper_id", "claim", "quote", "kind", "verification_status", "page_index"])
        for e in evidence:
            writer.writerow([
                e.get("id", ""),
                e.get("paper_id", ""),
                e.get("claim", ""),
                e.get("quote", ""),
                e.get("kind", ""),
                e.get("verification_status", ""),
                str(e.get("page_index", "")),
            ])
        return PlainTextResponse(buf.getvalue(), media_type="text/csv")
    else:
        raise HTTPException(400, f"Unknown format: {fmt}")
