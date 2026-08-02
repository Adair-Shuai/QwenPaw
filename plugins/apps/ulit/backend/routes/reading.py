# -*- coding: utf-8 -*-
"""ULit reading routes — annotations, notes, evidence."""

from __future__ import annotations

import asyncio

from fastapi import APIRouter, HTTPException

from .. import repository as repo
from ..schemas import (
    AnnotationCreate,
    AnnotationPatch,
    EvidenceCreate,
    EvidenceVerify,
    NoteCreate,
    NoteFromAnnotations,
    NotePatch,
)
from ..services import AnnotationService

router = APIRouter()


# ── Annotations ─────────────────────────────────────────────────────

@router.get("/files/{file_id}/annotations")
async def list_annotations(file_id: str) -> dict:
    annos = await AnnotationService.list_annotations(file_id)
    return {"annotations": annos}


@router.post("/files/{file_id}/annotations")
async def create_annotation(file_id: str, body: AnnotationCreate) -> dict:
    if body.file_id != file_id:
        raise HTTPException(400, "file_id mismatch")
    return await AnnotationService.create_annotation(
        file_id=file_id,
        page_index=body.page_index,
        type=body.type,
        color=body.color,
        selected_text=body.selected_text,
        comment=body.comment,
        anchor_json=body.anchor_json,
    )


@router.patch("/annotations/{annotation_id}")
async def update_annotation(annotation_id: str, body: AnnotationPatch) -> dict:
    fields = {k: v for k, v in body.model_dump().items() if v is not None}
    anno = await AnnotationService.update_annotation(annotation_id, **fields)
    if anno is None:
        raise HTTPException(404, "Annotation not found")
    return anno


@router.delete("/annotations/{annotation_id}")
async def delete_annotation(annotation_id: str) -> dict:
    await AnnotationService.delete_annotation(annotation_id)
    return {"ok": True}


# ── Notes ───────────────────────────────────────────────────────────

@router.get("/notes")
async def list_notes(
    project_id: str | None = None,
    paper_id: str | None = None,
) -> dict:
    notes = await asyncio.to_thread(repo.list_notes, project_id=project_id, paper_id=paper_id)
    return {"notes": notes}


@router.post("/notes")
async def create_note(body: NoteCreate) -> dict:
    return await asyncio.to_thread(
        repo.create_note,
        project_id=body.project_id,
        paper_id=body.paper_id,
        title=body.title,
        content_markdown=body.content_markdown,
    )


@router.get("/notes/{note_id}")
async def get_note(note_id: str) -> dict:
    note = await asyncio.to_thread(repo.get_note, note_id)
    if note is None:
        raise HTTPException(404, "Note not found")
    return note


@router.patch("/notes/{note_id}")
async def update_note(note_id: str, body: NotePatch) -> dict:
    fields = {k: v for k, v in body.model_dump().items() if v is not None}
    note = await asyncio.to_thread(repo.update_note, note_id, **fields)
    if note is None:
        raise HTTPException(404, "Note not found")
    return note


@router.delete("/notes/{note_id}")
async def delete_note(note_id: str) -> dict:
    await asyncio.to_thread(repo.delete_note, note_id)
    return {"ok": True}


@router.post("/notes/from-annotations")
async def create_note_from_annotations(body: NoteFromAnnotations) -> dict:
    return await AnnotationService.create_note_from_annotations(
        file_id=body.file_id,
        annotation_ids=body.annotation_ids,
        project_id=body.project_id,
        paper_id=body.paper_id,
        title=body.title,
    )


# ── Evidence cards ──────────────────────────────────────────────────

@router.get("/projects/{project_id}/evidence")
async def list_evidence(project_id: str) -> dict:
    evidence = await asyncio.to_thread(repo.list_evidence, project_id)
    return {"evidence": evidence}


@router.post("/projects/{project_id}/evidence")
async def create_evidence(project_id: str, body: EvidenceCreate) -> dict:
    if body.project_id != project_id:
        raise HTTPException(400, "project_id mismatch")
    return await asyncio.to_thread(
        repo.create_evidence,
        project_id=project_id,
        paper_id=body.paper_id,
        claim=body.claim,
        quote=body.quote,
        source_ref=body.source_ref,
        page_index=body.page_index,
        kind=body.kind,
    )


@router.patch("/evidence/{evidence_id}/verify")
async def verify_evidence(evidence_id: str, body: EvidenceVerify) -> dict:
    fields: dict = {"verification_status": body.verification_status}
    if body.claim is not None:
        fields["claim"] = body.claim
    if body.quote is not None:
        fields["quote"] = body.quote
    evidence = await asyncio.to_thread(repo.update_evidence, evidence_id, **fields)
    if evidence is None:
        raise HTTPException(404, "Evidence card not found")
    return evidence
