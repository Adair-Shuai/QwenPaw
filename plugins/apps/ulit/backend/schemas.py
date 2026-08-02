# -*- coding: utf-8 -*-
"""ULit Pydantic schemas for API request/response."""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


# ── Project schemas ─────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str
    question: str = ""
    description: str = ""


class ProjectPatch(BaseModel):
    name: Optional[str] = None
    question: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


# ── Paper schemas ───────────────────────────────────────────────────

class PaperPatch(BaseModel):
    title: Optional[str] = None
    abstract: Optional[str] = None
    year: Optional[int] = None
    venue: Optional[str] = None
    language: Optional[str] = None
    doi: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None


class PaperMerge(BaseModel):
    source_id: str
    target_id: str


class IdentifierImport(BaseModel):
    identifiers: list[str] = Field(default_factory=list)
    project_id: Optional[str] = None


class BibliographyImport(BaseModel):
    content: str
    format: str = "bibtex"  # bibtex | ris | csl_json
    project_id: Optional[str] = None


# ── Annotation schemas ──────────────────────────────────────────────

class AnnotationCreate(BaseModel):
    file_id: str
    page_index: int
    type: str = "highlight"
    color: str = "#fbbf24"
    selected_text: str = ""
    comment: str = ""
    anchor_json: str = "{}"


class AnnotationPatch(BaseModel):
    type: Optional[str] = None
    color: Optional[str] = None
    selected_text: Optional[str] = None
    comment: Optional[str] = None
    anchor_json: Optional[str] = None


# ── Note schemas ────────────────────────────────────────────────────

class NoteCreate(BaseModel):
    project_id: Optional[str] = None
    paper_id: Optional[str] = None
    title: str = ""
    content_markdown: str = ""


class NotePatch(BaseModel):
    title: Optional[str] = None
    content_markdown: Optional[str] = None


class NoteFromAnnotations(BaseModel):
    file_id: str
    annotation_ids: list[str] = Field(default_factory=list)
    project_id: Optional[str] = None
    paper_id: Optional[str] = None
    title: str = ""


# ── Evidence schemas ────────────────────────────────────────────────

class EvidenceCreate(BaseModel):
    project_id: str
    paper_id: Optional[str] = None
    claim: str
    quote: str = ""
    source_ref: str = ""
    page_index: Optional[int] = None
    kind: str = "background"


class EvidenceVerify(BaseModel):
    verification_status: str  # confirmed | rejected
    claim: Optional[str] = None
    quote: Optional[str] = None


# ── Search schemas ──────────────────────────────────────────────────

class SearchQuery(BaseModel):
    query: str
    project_id: Optional[str] = None
    status: Optional[str] = None
    limit: int = 50
    offset: int = 0


# ── AI schemas ──────────────────────────────────────────────────────

class AISessionCreate(BaseModel):
    scope_type: str = "paper"  # paper | project
    scope_id: str
    title: str = ""


class AIQuestion(BaseModel):
    question: str
    scope: str = "paper"  # selected_text | page | paper | project
    selected_text: Optional[str] = None
    page_index: Optional[int] = None


# ── Job schemas ─────────────────────────────────────────────────────

class JobResponse(BaseModel):
    id: str
    type: str
    state: str
    progress: float
    payload: dict[str, Any] = Field(default_factory=dict)
    result: dict[str, Any] = Field(default_factory=dict)
    error: dict[str, Any] = Field(default_factory=dict)
    created_at: str = ""
    updated_at: str = ""


# ── Export schemas ──────────────────────────────────────────────────

class ExportRequest(BaseModel):
    project_id: Optional[str] = None
    paper_ids: list[str] = Field(default_factory=list)
    format: str = "markdown"  # markdown | bibtex | json | csv
    include_annotations: bool = True
    include_evidence: bool = True
