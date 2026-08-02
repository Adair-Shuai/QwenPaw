# -*- coding: utf-8 -*-
"""ULit SQLite database — schema, migration, connection management.

Uses SQLite WAL mode with foreign keys and busy timeout.  All business
data lives in a single ``ulit.db`` file under the data root directory.
PDF files are stored by SHA-256 hash in ``files/``.
"""

from __future__ import annotations

import hashlib
import logging
import os
import sqlite3
import threading
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger(__name__)

_SCHEMA_VERSION = 1

_SCHEMA_SQL = """
-- ── Projects ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    question     TEXT DEFAULT '',
    description  TEXT DEFAULT '',
    status       TEXT DEFAULT 'active',
    settings_json TEXT DEFAULT '{}',
    created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    deleted_at   TEXT
);

-- ── Papers ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS papers (
    id           TEXT PRIMARY KEY,
    type         TEXT DEFAULT 'other',
    title        TEXT NOT NULL DEFAULT '',
    abstract     TEXT DEFAULT '',
    year         INTEGER,
    venue        TEXT DEFAULT '',
    language     TEXT DEFAULT '',
    doi          TEXT DEFAULT '',
    status       TEXT DEFAULT 'unread',
    inbox        INTEGER DEFAULT 0,
    deleted_at   TEXT,
    created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_papers_title ON papers(title);
CREATE INDEX IF NOT EXISTS idx_papers_doi ON papers(doi);
CREATE INDEX IF NOT EXISTS idx_papers_status ON papers(status);
CREATE INDEX IF NOT EXISTS idx_papers_inbox ON papers(inbox);

-- ── Paper identifiers (DOI, PMID, arXiv, S2, OpenAlex) ────────────
CREATE TABLE IF NOT EXISTS paper_identifiers (
    paper_id  TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    scheme    TEXT NOT NULL,
    value     TEXT NOT NULL,
    PRIMARY KEY (scheme, value)
);
CREATE INDEX IF NOT EXISTS idx_pidentifiers_paper ON paper_identifiers(paper_id);

-- ── Authors ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS authors (
    id             TEXT PRIMARY KEY,
    canonical_name TEXT NOT NULL,
    orcid          TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS paper_authors (
    paper_id   TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    author_id  TEXT NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    position   INTEGER DEFAULT 0,
    role       TEXT DEFAULT 'author',
    PRIMARY KEY (paper_id, author_id)
);

-- ── Project ↔ Paper (many-to-many) ────────────────────────────────
CREATE TABLE IF NOT EXISTS project_papers (
    project_id     TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    paper_id       TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    reading_status TEXT DEFAULT 'unread',
    priority       INTEGER DEFAULT 0,
    added_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    PRIMARY KEY (project_id, paper_id)
);
CREATE INDEX IF NOT EXISTS idx_pp_project ON project_papers(project_id);
CREATE INDEX IF NOT EXISTS idx_pp_paper ON project_papers(paper_id);

-- ── Tags ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
    id    TEXT PRIMARY KEY,
    name  TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#8b5cf6'
);

CREATE TABLE IF NOT EXISTS paper_tags (
    paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    tag_id   TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (paper_id, tag_id)
);

-- ── Files (PDF attachments, content-addressed) ────────────────────
CREATE TABLE IF NOT EXISTS files (
    id         TEXT PRIMARY KEY,
    paper_id   TEXT REFERENCES papers(id) ON DELETE SET NULL,
    sha256     TEXT NOT NULL,
    filename   TEXT NOT NULL DEFAULT '',
    mime       TEXT DEFAULT 'application/pdf',
    size       INTEGER DEFAULT 0,
    path       TEXT NOT NULL,
    version    INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_files_paper ON files(paper_id);
CREATE INDEX IF NOT EXISTS idx_files_sha ON files(sha256);

-- ── Documents (parsed results) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
    id            TEXT PRIMARY KEY,
    file_id       TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    parser        TEXT DEFAULT 'basic',
    status        TEXT DEFAULT 'pending',
    page_count    INTEGER DEFAULT 0,
    text_quality  TEXT DEFAULT 'unknown',
    needs_ocr     INTEGER DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_docs_file ON documents(file_id);

-- ── Sections (chapter tree) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS sections (
    id           TEXT PRIMARY KEY,
    document_id  TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    parent_id    TEXT,
    title        TEXT DEFAULT '',
    level        INTEGER DEFAULT 0,
    page_start   INTEGER,
    page_end     INTEGER
);
CREATE INDEX IF NOT EXISTS idx_sections_doc ON sections(document_id);

-- ── Chunks (retrieval units) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS chunks (
    id            TEXT PRIMARY KEY,
    document_id   TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    section_id    TEXT,
    page_start    INTEGER,
    page_end      INTEGER,
    text          TEXT NOT NULL DEFAULT '',
    token_count   INTEGER DEFAULT 0,
    char_start    INTEGER DEFAULT 0,
    char_end      INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_chunks_doc ON chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_section ON chunks(section_id);

-- ── Page texts ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_texts (
    document_id  TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    page_index   INTEGER NOT NULL,
    text         TEXT DEFAULT '',
    text_hash    TEXT DEFAULT '',
    PRIMARY KEY (document_id, page_index)
);

-- ── Annotations ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS annotations (
    id             TEXT PRIMARY KEY,
    file_id        TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    page_index     INTEGER NOT NULL,
    type           TEXT DEFAULT 'highlight',
    color          TEXT DEFAULT '#fbbf24',
    selected_text  TEXT DEFAULT '',
    comment        TEXT DEFAULT '',
    anchor_json    TEXT DEFAULT '{}',
    created_by     TEXT DEFAULT 'human',
    created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_anno_file ON annotations(file_id);
CREATE INDEX IF NOT EXISTS idx_anno_page ON annotations(page_index);

-- ── Notes ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
    id               TEXT PRIMARY KEY,
    project_id       TEXT REFERENCES projects(id) ON DELETE SET NULL,
    paper_id         TEXT REFERENCES papers(id) ON DELETE SET NULL,
    title            TEXT DEFAULT '',
    content_markdown TEXT DEFAULT '',
    created_by       TEXT DEFAULT 'human',
    created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_notes_project ON notes(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_paper ON notes(paper_id);

-- ── Evidence cards ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evidence_cards (
    id                   TEXT PRIMARY KEY,
    project_id           TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    paper_id             TEXT REFERENCES papers(id) ON DELETE SET NULL,
    claim                TEXT NOT NULL DEFAULT '',
    quote                TEXT DEFAULT '',
    source_ref           TEXT DEFAULT '',
    page_index           INTEGER,
    kind                 TEXT DEFAULT 'background',
    verification_status  TEXT DEFAULT 'pending',
    created_by           TEXT DEFAULT 'human',
    ai_run_id            TEXT,
    tags_json            TEXT DEFAULT '[]',
    created_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    updated_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_evidence_project ON evidence_cards(project_id);
CREATE INDEX IF NOT EXISTS idx_evidence_paper ON evidence_cards(paper_id);

-- ── AI sessions ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_sessions (
    id                TEXT PRIMARY KEY,
    scope_type        TEXT NOT NULL DEFAULT 'paper',
    scope_id          TEXT NOT NULL,
    qwen_session_id   TEXT NOT NULL,
    title             TEXT DEFAULT '',
    created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_aisess_scope ON ai_sessions(scope_type, scope_id);

-- ── AI runs (auditable records) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_runs (
    id               TEXT PRIMARY KEY,
    session_id       TEXT NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
    model            TEXT DEFAULT '',
    prompt_version   TEXT DEFAULT '',
    input_refs_json  TEXT DEFAULT '[]',
    output_json      TEXT DEFAULT '{}',
    status           TEXT DEFAULT 'pending',
    grounding_status TEXT DEFAULT 'ungrounded',
    created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_airuns_session ON ai_runs(session_id);

-- ── Jobs (persistent task table) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
    id            TEXT PRIMARY KEY,
    type          TEXT NOT NULL,
    state         TEXT DEFAULT 'queued',
    progress      REAL DEFAULT 0.0,
    payload_json  TEXT DEFAULT '{}',
    result_json   TEXT DEFAULT '{}',
    error_json    TEXT DEFAULT '{}',
    paper_id      TEXT,
    project_id    TEXT,
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_jobs_state ON jobs(state);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);
CREATE INDEX IF NOT EXISTS idx_jobs_paper ON jobs(paper_id);

-- ── FTS5 full-text search ─────────────────────────────────────────
CREATE VIRTUAL TABLE IF NOT EXISTS papers_fts USING fts5(
    paper_id UNINDEXED,
    title,
    abstract,
    content='papers',
    content_rowid='rowid'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS papers_ai AFTER INSERT ON papers BEGIN
    INSERT INTO papers_fts(rowid, paper_id, title, abstract)
    VALUES (new.rowid, new.id, new.title, COALESCE(new.abstract, ''));
END;
CREATE TRIGGER IF NOT EXISTS papers_ad AFTER DELETE ON papers BEGIN
    INSERT INTO papers_fts(papers_fts, rowid, paper_id, title, abstract)
    VALUES ('delete', old.rowid, old.id, old.title, COALESCE(old.abstract, ''));
END;
CREATE TRIGGER IF NOT EXISTS papers_au AFTER UPDATE ON papers BEGIN
    INSERT INTO papers_fts(papers_fts, rowid, paper_id, title, abstract)
    VALUES ('delete', old.rowid, old.id, old.title, COALESCE(old.abstract, ''));
    INSERT INTO papers_fts(rowid, paper_id, title, abstract)
    VALUES (new.rowid, new.id, new.title, COALESCE(new.abstract, ''));
END;

-- ── Schema version ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schema_meta (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
INSERT OR IGNORE INTO schema_meta (key, value) VALUES ('version', '1');
"""


class Database:
    """Thread-safe SQLite database wrapper."""

    def __init__(self, db_path: Path):
        self._db_path = db_path
        self._local = threading.local()
        db_path.parent.mkdir(parents=True, exist_ok=True)
        # Run migration on first init
        self._migrate()

    def _get_conn(self) -> sqlite3.Connection:
        """Get a thread-local connection."""
        conn = getattr(self._local, "conn", None)
        if conn is None:
            conn = sqlite3.connect(
                str(self._db_path),
                timeout=30.0,
                check_same_thread=False,
            )
            conn.row_factory = sqlite3.Row
            conn.execute("PRAGMA journal_mode=WAL")
            conn.execute("PRAGMA foreign_keys=ON")
            conn.execute("PRAGMA busy_timeout=30000")
            self._local.conn = conn
        return conn

    def _migrate(self) -> None:
        """Run schema migration."""
        conn = self._get_conn()
        conn.executescript(_SCHEMA_SQL)
        conn.commit()
        row = conn.execute(
            "SELECT value FROM schema_meta WHERE key='version'"
        ).fetchone()
        current = int(row["value"]) if row else 0
        if current < _SCHEMA_VERSION:
            conn.execute(
                "UPDATE schema_meta SET value=? WHERE key='version'",
                (str(_SCHEMA_VERSION),),
            )
            conn.commit()
        logger.info(
            "[ulit] Database ready at %s (schema v%d)",
            self._db_path,
            _SCHEMA_VERSION,
        )

    @property
    def db_path(self) -> Path:
        return self._db_path

    def execute(
        self,
        sql: str,
        params: tuple | list = (),
    ) -> sqlite3.Cursor:
        conn = self._get_conn()
        cur = conn.execute(sql, params)
        conn.commit()
        return cur

    def query(
        self,
        sql: str,
        params: tuple | list = (),
    ) -> list[sqlite3.Row]:
        conn = self._get_conn()
        cur = conn.execute(sql, params)
        return cur.fetchall()

    def query_one(
        self,
        sql: str,
        params: tuple | list = (),
    ) -> Optional[sqlite3.Row]:
        conn = self._get_conn()
        cur = conn.execute(sql, params)
        return cur.fetchone()

    def close(self) -> None:
        conn = getattr(self._local, "conn", None)
        if conn is not None:
            conn.close()
            self._local.conn = None


# ── Data root management ────────────────────────────────────────────

_db: Optional[Database] = None
_data_root: Optional[Path] = None


def get_data_root() -> Path:
    """Return the ULit data root directory."""
    global _data_root
    if _data_root is not None:
        return _data_root

    env_root = os.environ.get("ULIT_DATA_ROOT", "").strip()
    if env_root:
        root = Path(env_root).expanduser().resolve()
    else:
        from qwenpaw.constant import WORKING_DIR

        root = Path(WORKING_DIR) / "ulit-runtime"

    if not root.is_absolute():
        raise ValueError("ULIT_DATA_ROOT must be an absolute path")

    root.mkdir(parents=True, exist_ok=True)
    (root / "files").mkdir(exist_ok=True)
    (root / "thumbnails").mkdir(exist_ok=True)
    (root / "extracted").mkdir(exist_ok=True)
    (root / "exports").mkdir(exist_ok=True)
    (root / "cache").mkdir(exist_ok=True)

    _data_root = root
    return root


def get_db() -> Database:
    """Get the singleton Database instance."""
    global _db
    if _db is None:
        root = get_data_root()
        _db = Database(root / "ulit.db")
    return _db


def close_db() -> None:
    """Close the database connection (on shutdown)."""
    global _db
    if _db is not None:
        _db.close()
        _db = None


def file_path_for_hash(sha256: str) -> Path:
    """Return the content-addressed storage path for a SHA-256 hash."""
    root = get_data_root()
    prefix = sha256[:2]
    dir_path = root / "files" / prefix
    dir_path.mkdir(parents=True, exist_ok=True)
    return dir_path / f"{sha256}.pdf"


def compute_sha256(data: bytes) -> str:
    """Compute SHA-256 hex digest of bytes."""
    return hashlib.sha256(data).hexdigest()
