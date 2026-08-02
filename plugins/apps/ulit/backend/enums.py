# -*- coding: utf-8 -*-
"""ULit domain enums and constants."""

from __future__ import annotations

import enum


class ReadingStatus(str, enum.Enum):
    UNREAD = "unread"
    SKIMMING = "skimming"
    READING = "reading"
    READ = "read"
    SHELVED = "shelved"


class PaperType(str, enum.Enum):
    JOURNAL = "journal"
    CONFERENCE = "conference"
    PREPRINT = "preprint"
    THESIS = "thesis"
    BOOK = "book"
    CHAPTER = "chapter"
    REPORT = "report"
    OTHER = "other"


class AnnotationType(str, enum.Enum):
    HIGHLIGHT = "highlight"
    UNDERLINE = "underline"
    NOTE = "note"
    AREA = "area"


class EvidenceKind(str, enum.Enum):
    SUPPORT = "support"
    REFUTE = "refute"
    BACKGROUND = "background"
    METHOD = "method"
    DATA = "data"


class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    GROUNDED = "grounded"
    PARTIALLY_GROUNDED = "partially_grounded"
    UNGROUNDED = "ungrounded"


class JobType(str, enum.Enum):
    IMPORT_FILE = "import_file"
    RESOLVE_METADATA = "resolve_metadata"
    PARSE_DOCUMENT = "parse_document"
    RUN_OCR = "run_ocr"
    BUILD_INDEX = "build_index"
    GENERATE_READING_CARD = "generate_reading_card"
    ANSWER_QUESTION = "answer_question"
    EXPORT_BUNDLE = "export_bundle"


class JobState(str, enum.Enum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLING = "cancelling"
    CANCELLED = "cancelled"
    INTERRUPTED = "interrupted"
    RETRYING = "retrying"


class AIScopeType(str, enum.Enum):
    PAPER = "paper"
    PROJECT = "project"


# Session ID prefixes
def paper_session_id(paper_id: str) -> str:
    return f"pawapp:ulit:paper:{paper_id}"


def project_session_id(project_id: str) -> str:
    return f"pawapp:ulit:project:{project_id}"


# Allowed import file types
ALLOWED_MIME = {
    "application/pdf",
    "application/x-bibtex",
    "text/x-bibtex",
    "application/x-research-info-systems",
    "text/x-research-info-systems",
    "application/json",
    "text/plain",
}

ALLOWED_EXTENSIONS = {".pdf", ".bib", ".ris", ".json"}

MAX_UPLOAD_SIZE = 200 * 1024 * 1024  # 200 MB per file
