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
        lines = ["id,paper_id,claim,quote,kind,verification_status,page_index"]
        for e in evidence:
            claim = e.get("claim", "").replace('"', '""')
            quote = e.get("quote", "").replace('"', '""')
            eid = e.get("id", "")
            pid = e.get("paper_id", "")
            ekind = e.get("kind", "")
            vstatus = e.get("verification_status", "")
            pidx = e.get("page_index", "")
            lines.append(
                '"' + eid + '","' + pid + '","' + claim + '","' + quote + '",'
                '"' + ekind + '","' + vstatus + '","' + str(pidx) + '"'
            )
        return PlainTextResponse("\n".join(lines), media_type="text/csv")
    else:
        raise HTTPException(400, f"Unknown format: {fmt}")
