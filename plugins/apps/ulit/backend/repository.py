# -*- coding: utf-8 -*-
"""ULit data access layer — repository functions over SQLite.

All functions are synchronous and operate on the thread-local
connection managed by :class:`Database`.  FastAPI handlers wrap
blocking calls with ``asyncio.to_thread``.
"""

from __future__ import annotations

import json
import sqlite3
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from .database import get_db

_DT = lambda: datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")  # noqa: E731


def _uid() -> str:
    return uuid.uuid4().hex


def _row_to_dict(row: sqlite3.Row | None) -> dict[str, Any] | None:
    if row is None:
        return None
    return {k: row[k] for k in row.keys()}


def _rows_to_dicts(rows: list[sqlite3.Row]) -> list[dict[str, Any]]:
    return [{k: r[k] for k in r.keys()} for r in rows]


# ════════════════════════════════════════════════════════════════════
#  Projects
# ════════════════════════════════════════════════════════════════════

def create_project(name: str, question: str = "", description: str = "") -> dict:
    pid = _uid()
    get_db().execute(
        "INSERT INTO projects (id, name, question, description) VALUES (?,?,?,?)",
        (pid, name, question, description),
    )
    return get_project(pid)  # type: ignore[return-value]


def get_project(project_id: str) -> dict | None:
    row = get_db().query_one(
        "SELECT * FROM projects WHERE id=? AND deleted_at IS NULL",
        (project_id,),
    )
    return _row_to_dict(row)


def list_projects() -> list[dict]:
    rows = get_db().query(
        "SELECT * FROM projects WHERE deleted_at IS NULL ORDER BY updated_at DESC"
    )
    return _rows_to_dicts(rows)


def update_project(project_id: str, **fields: Any) -> dict | None:
    allowed = {"name", "question", "description", "status"}
    sets = [f"{k}=?" for k in fields if k in allowed]
    vals = [v for k, v in fields.items() if k in allowed]
    if not sets:
        return get_project(project_id)
    sets.append("updated_at=?")
    vals.append(_DT())
    vals.append(project_id)
    get_db().execute(
        f"UPDATE projects SET {', '.join(sets)} WHERE id=?",
        tuple(vals),
    )
    return get_project(project_id)


def soft_delete_project(project_id: str) -> bool:
    get_db().execute(
        "UPDATE projects SET deleted_at=?, status='deleted' WHERE id=?",
        (_DT(), project_id),
    )
    return True


# ════════════════════════════════════════════════════════════════════
#  Papers
# ════════════════════════════════════════════════════════════════════

def create_paper(
    *,
    title: str = "",
    abstract: str = "",
    year: Optional[int] = None,
    venue: str = "",
    language: str = "",
    doi: str = "",
    paper_type: str = "other",
    inbox: bool = True,
) -> dict:
    pid = _uid()
    get_db().execute(
        """INSERT INTO papers (id, type, title, abstract, year, venue, language, doi, status, inbox)
           VALUES (?,?,?,?,?,?,?,?,?,?)""",
        (pid, paper_type, title, abstract, year, venue, language, doi, "unread", 1 if inbox else 0),
    )
    if doi:
        add_paper_identifier(pid, "doi", doi.lower())
    return get_paper(pid)  # type: ignore[return-value]


def get_paper(paper_id: str) -> dict | None:
    row = get_db().query_one(
        "SELECT * FROM papers WHERE id=? AND deleted_at IS NULL",
        (paper_id,),
    )
    return _row_to_dict(row)


def list_papers(
    *,
    project_id: Optional[str] = None,
    status: Optional[str] = None,
    inbox_only: bool = False,
    limit: int = 100,
    offset: int = 0,
) -> list[dict]:
    sql = "SELECT DISTINCT p.* FROM papers p"
    params: list[Any] = []
    clauses = ["p.deleted_at IS NULL"]
    if project_id:
        sql += " JOIN project_papers pp ON pp.paper_id = p.id"
        clauses.append("pp.project_id = ?")
        params.append(project_id)
    if status:
        clauses.append("p.status = ?")
        params.append(status)
    if inbox_only:
        clauses.append("p.inbox = 1")
    sql += " WHERE " + " AND ".join(clauses)
    sql += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    rows = get_db().query(sql, tuple(params))
    return _rows_to_dicts(rows)


def update_paper(paper_id: str, **fields: Any) -> dict | None:
    allowed = {"title", "abstract", "year", "venue", "language", "doi", "type", "status"}
    sets = [f"{k}=?" for k in fields if k in allowed]
    vals = [v for k, v in fields.items() if k in allowed]
    if not sets:
        return get_paper(paper_id)
    sets.append("updated_at=?")
    vals.append(_DT())
    vals.append(paper_id)
    get_db().execute(
        f"UPDATE papers SET {', '.join(sets)} WHERE id=?",
        tuple(vals),
    )
    if "doi" in fields and fields["doi"]:
        add_paper_identifier(paper_id, "doi", fields["doi"].lower())
    return get_paper(paper_id)


def soft_delete_paper(paper_id: str) -> bool:
    get_db().execute(
        "UPDATE papers SET deleted_at=? WHERE id=?",
        (_DT(), paper_id),
    )
    return True


def restore_paper(paper_id: str) -> dict | None:
    get_db().execute(
        "UPDATE papers SET deleted_at=NULL WHERE id=?",
        (paper_id,),
    )
    return get_paper(paper_id)


def find_paper_by_doi(doi: str) -> dict | None:
    row = get_db().query_one(
        "SELECT p.* FROM papers p JOIN paper_identifiers pi ON pi.paper_id = p.id "
        "WHERE pi.scheme='doi' AND pi.value=? AND p.deleted_at IS NULL",
        (doi.lower(),),
    )
    return _row_to_dict(row)


def find_paper_by_sha256(sha256: str) -> dict | None:
    row = get_db().query_one(
        "SELECT p.* FROM papers p JOIN files f ON f.paper_id = p.id "
        "WHERE f.sha256=? AND p.deleted_at IS NULL",
        (sha256,),
    )
    return _row_to_dict(row)


def merge_papers(source_id: str, target_id: str) -> dict | None:
    """Merge source paper into target: move files, annotations, project links."""
    db = get_db()
    # Move files
    db.execute("UPDATE files SET paper_id=? WHERE paper_id=?", (target_id, source_id))
    # Move project links (avoid duplicates)
    existing = {
        r["project_id"]
        for r in db.query(
            "SELECT project_id FROM project_papers WHERE paper_id=?",
            (target_id,),
        )
    }
    links = db.query(
        "SELECT project_id FROM project_papers WHERE paper_id=?",
        (source_id,),
    )
    for link in links:
        if link["project_id"] not in existing:
            db.execute(
                "UPDATE project_papers SET paper_id=? WHERE paper_id=? AND project_id=?",
                (target_id, source_id, link["project_id"]),
            )
    # Delete remaining source links
    db.execute("DELETE FROM project_papers WHERE paper_id=?", (source_id,))
    # Move evidence cards
    db.execute(
        "UPDATE evidence_cards SET paper_id=? WHERE paper_id=?",
        (target_id, source_id),
    )
    # Move notes
    db.execute("UPDATE notes SET paper_id=? WHERE paper_id=?", (target_id, source_id))
    # Move identifiers
    db.execute(
        "INSERT OR IGNORE INTO paper_identifiers (paper_id, scheme, value) "
        "SELECT ?, scheme, value FROM paper_identifiers WHERE paper_id=?",
        (target_id, source_id),
    )
    # Soft-delete source
    db.execute("UPDATE papers SET deleted_at=? WHERE id=?", (_DT(), source_id))
    return get_paper(target_id)


# ── Paper identifiers ───────────────────────────────────────────────

def add_paper_identifier(paper_id: str, scheme: str, value: str) -> None:
    get_db().execute(
        "INSERT OR IGNORE INTO paper_identifiers (paper_id, scheme, value) VALUES (?,?,?)",
        (paper_id, scheme, value),
    )


def get_paper_identifiers(paper_id: str) -> list[dict]:
    rows = get_db().query(
        "SELECT scheme, value FROM paper_identifiers WHERE paper_id=?",
        (paper_id,),
    )
    return _rows_to_dicts(rows)


# ── Authors ─────────────────────────────────────────────────────────

def set_paper_authors(paper_id: str, authors: list[str]) -> None:
    get_db().execute(
        "DELETE FROM paper_authors WHERE paper_id=?", (paper_id,)
    )
    for i, name in enumerate(authors):
        aid = _uid()
        get_db().execute(
            "INSERT OR IGNORE INTO authors (id, canonical_name) VALUES (?,?)",
            (aid, name),
        )
        # Find existing author by name
        row = get_db().query_one(
            "SELECT id FROM authors WHERE canonical_name=?", (name,)
        )
        if row:
            aid = row["id"]
        get_db().execute(
            "INSERT OR IGNORE INTO paper_authors (paper_id, author_id, position) VALUES (?,?,?)",
            (paper_id, aid, i),
        )


def get_paper_authors(paper_id: str) -> list[dict]:
    rows = get_db().query(
        "SELECT a.* FROM authors a JOIN paper_authors pa ON pa.author_id=a.id "
        "WHERE pa.paper_id=? ORDER BY pa.position",
        (paper_id,),
    )
    return _rows_to_dicts(rows)


# ── Project ↔ Paper ─────────────────────────────────────────────────

def add_paper_to_project(project_id: str, paper_id: str, priority: int = 0) -> None:
    get_db().execute(
        "INSERT OR IGNORE INTO project_papers (project_id, paper_id, priority) VALUES (?,?,?)",
        (project_id, paper_id, priority),
    )
    # Remove from inbox
    get_db().execute("UPDATE papers SET inbox=0 WHERE id=?", (paper_id,))


def remove_paper_from_project(project_id: str, paper_id: str) -> None:
    get_db().execute(
        "DELETE FROM project_papers WHERE project_id=? AND paper_id=?",
        (project_id, paper_id),
    )


def get_project_papers(project_id: str) -> list[dict]:
    rows = get_db().query(
        "SELECT p.*, pp.reading_status, pp.priority, pp.added_at FROM papers p "
        "JOIN project_papers pp ON pp.paper_id = p.id "
        "WHERE pp.project_id=? AND p.deleted_at IS NULL ORDER BY pp.added_at DESC",
        (project_id,),
    )
    return _rows_to_dicts(rows)


def set_reading_status(project_id: str, paper_id: str, status: str) -> None:
    get_db().execute(
        "UPDATE project_papers SET reading_status=? WHERE project_id=? AND paper_id=?",
        (status, project_id, paper_id),
    )
    get_db().execute("UPDATE papers SET status=? WHERE id=?", (status, paper_id))


# ── Tags ────────────────────────────────────────────────────────────

def get_or_create_tag(name: str, color: str = "#8b5cf6") -> str:
    row = get_db().query_one("SELECT id FROM tags WHERE name=?", (name,))
    if row:
        return row["id"]
    tid = _uid()
    get_db().execute(
        "INSERT INTO tags (id, name, color) VALUES (?,?,?)",
        (tid, name, color),
    )
    return tid


def add_tag_to_paper(paper_id: str, tag_name: str) -> None:
    tid = get_or_create_tag(tag_name)
    get_db().execute(
        "INSERT OR IGNORE INTO paper_tags (paper_id, tag_id) VALUES (?,?)",
        (paper_id, tid),
    )


def get_paper_tags(paper_id: str) -> list[dict]:
    rows = get_db().query(
        "SELECT t.* FROM tags t JOIN paper_tags pt ON pt.tag_id=t.id WHERE pt.paper_id=?",
        (paper_id,),
    )
    return _rows_to_dicts(rows)


# ════════════════════════════════════════════════════════════════════
#  Files
# ════════════════════════════════════════════════════════════════════

def create_file(
    *,
    paper_id: str,
    sha256: str,
    filename: str,
    mime: str = "application/pdf",
    size: int = 0,
    path: str,
) -> dict:
    fid = _uid()
    get_db().execute(
        "INSERT INTO files (id, paper_id, sha256, filename, mime, size, path) "
        "VALUES (?,?,?,?,?,?,?)",
        (fid, paper_id, sha256, filename, mime, size, path),
    )
    row = get_db().query_one("SELECT * FROM files WHERE id=?", (fid,))
    return _row_to_dict(row)  # type: ignore[return-value]


def get_file(file_id: str) -> dict | None:
    row = get_db().query_one("SELECT * FROM files WHERE id=?", (file_id,))
    return _row_to_dict(row)


def get_paper_files(paper_id: str) -> list[dict]:
    rows = get_db().query(
        "SELECT * FROM files WHERE paper_id=? ORDER BY created_at DESC",
        (paper_id,),
    )
    return _rows_to_dicts(rows)


# ════════════════════════════════════════════════════════════════════
#  Documents (parsed PDFs)
# ════════════════════════════════════════════════════════════════════

def create_document(file_id: str, parser: str = "basic") -> dict:
    did = _uid()
    get_db().execute(
        "INSERT INTO documents (id, file_id, parser, status) VALUES (?,?,?,'pending')",
        (did, file_id, parser),
    )
    row = get_db().query_one("SELECT * FROM documents WHERE id=?", (did,))
    return _row_to_dict(row)  # type: ignore[return-value]


def get_document_by_file(file_id: str) -> dict | None:
    row = get_db().query_one(
        "SELECT * FROM documents WHERE file_id=? ORDER BY created_at DESC LIMIT 1",
        (file_id,),
    )
    return _row_to_dict(row)


def update_document(doc_id: str, **fields: Any) -> None:
    allowed = {"status", "page_count", "text_quality", "needs_ocr"}
    sets = [f"{k}=?" for k in fields if k in allowed]
    vals = [v for k, v in fields.items() if k in allowed]
    if not sets:
        return
    get_db().execute(
        f"UPDATE documents SET {', '.join(sets)} WHERE id=?",
        tuple(vals) + (doc_id,),
    )


def add_page_text(doc_id: str, page_index: int, text: str, text_hash: str = "") -> None:
    get_db().execute(
        "INSERT OR REPLACE INTO page_texts (document_id, page_index, text, text_hash) "
        "VALUES (?,?,?,?)",
        (doc_id, page_index, text, text_hash),
    )


def clear_document_content(doc_id: str) -> None:
    """Remove parsed pages/chunks before a document is rebuilt.

    Reparse is an update operation, not an append operation.  Clearing the
    FTS rows first prevents stale pages and duplicate retrieval chunks from
    surviving a second parse.
    """
    db = get_db()
    db.execute(
        "DELETE FROM chunks_fts WHERE chunk_id IN (SELECT id FROM chunks WHERE document_id=?)",
        (doc_id,),
    )
    db.execute("DELETE FROM chunks WHERE document_id=?", (doc_id,))
    db.execute("DELETE FROM page_texts WHERE document_id=?", (doc_id,))


def get_page_texts(doc_id: str) -> list[dict]:
    rows = get_db().query(
        "SELECT * FROM page_texts WHERE document_id=? ORDER BY page_index",
        (doc_id,),
    )
    return _rows_to_dicts(rows)


def get_page_text(doc_id: str, page_index: int) -> dict | None:
    row = get_db().query_one(
        "SELECT * FROM page_texts WHERE document_id=? AND page_index=?",
        (doc_id, page_index),
    )
    return _row_to_dict(row)


def add_chunk(
    doc_id: str,
    text: str,
    *,
    section_id: Optional[str] = None,
    page_start: Optional[int] = None,
    page_end: Optional[int] = None,
    char_start: int = 0,
    char_end: int = 0,
) -> str:
    cid = _uid()
    token_count = len(text) // 4  # rough estimate
    db = get_db()
    db.execute(
        "INSERT INTO chunks (id, document_id, section_id, page_start, page_end, text, token_count, char_start, char_end) "
        "VALUES (?,?,?,?,?,?,?,?,?)",
        (cid, doc_id, section_id, page_start, page_end, text, token_count, char_start, char_end),
    )
    # Keep parsed content searchable by paper and page.  FTS5 stores the
    # searchable text and the identifiers are returned as UNINDEXED fields.
    row = db.query_one(
        "SELECT f.paper_id FROM documents d JOIN files f ON f.id=d.file_id WHERE d.id=?",
        (doc_id,),
    )
    if row and row["paper_id"]:
        db.execute(
            "INSERT INTO chunks_fts(chunk_id, paper_id, page_start, text) VALUES (?,?,?,?)",
            (cid, row["paper_id"], page_start, text),
        )
    return cid


def get_chunks_for_paper(paper_id: str) -> list[dict]:
    rows = get_db().query(
        "SELECT c.*, f.paper_id FROM chunks c "
        "JOIN documents d ON d.id = c.document_id "
        "JOIN files f ON f.id = d.file_id "
        "WHERE f.paper_id=? ORDER BY c.page_start",
        (paper_id,),
    )
    return _rows_to_dicts(rows)


def search_chunks(query: str, *, paper_id: str | None = None, limit: int = 50) -> list[dict]:
    """Search parsed full text and return source-ready chunk records."""
    if not query.strip():
        return []
    # Quote the complete query to avoid malformed FTS expressions from user
    # punctuation while retaining phrase matching for normal searches.
    fts_query = '"' + query.strip().replace('"', '""') + '"'
    sql = (
        "SELECT c.*, f.paper_id FROM chunks_fts x "
        "JOIN chunks c ON c.id=x.chunk_id "
        "JOIN documents d ON d.id=c.document_id "
        "JOIN files f ON f.id=d.file_id "
        "WHERE chunks_fts MATCH ?"
    )
    params: list[Any] = [fts_query]
    if paper_id:
        sql += " AND f.paper_id=?"
        params.append(paper_id)
    sql += " ORDER BY bm25(chunks_fts) LIMIT ?"
    params.append(max(1, min(limit, 200)))
    return _rows_to_dicts(get_db().query(sql, tuple(params)))


# ════════════════════════════════════════════════════════════════════
#  Annotations
# ════════════════════════════════════════════════════════════════════

def create_annotation(
    *,
    file_id: str,
    page_index: int,
    type: str = "highlight",
    color: str = "#fbbf24",
    selected_text: str = "",
    comment: str = "",
    anchor_json: str = "{}",
    created_by: str = "human",
) -> dict:
    aid = _uid()
    get_db().execute(
        "INSERT INTO annotations (id, file_id, page_index, type, color, selected_text, comment, anchor_json, created_by) "
        "VALUES (?,?,?,?,?,?,?,?,?)",
        (aid, file_id, page_index, type, color, selected_text, comment, anchor_json, created_by),
    )
    row = get_db().query_one("SELECT * FROM annotations WHERE id=?", (aid,))
    return _row_to_dict(row)  # type: ignore[return-value]


def get_annotation(annotation_id: str) -> dict | None:
    row = get_db().query_one("SELECT * FROM annotations WHERE id=?", (annotation_id,))
    return _row_to_dict(row)


def list_annotations(file_id: str) -> list[dict]:
    rows = get_db().query(
        "SELECT * FROM annotations WHERE file_id=? ORDER BY page_index, created_at",
        (file_id,),
    )
    return _rows_to_dicts(rows)


def update_annotation(annotation_id: str, **fields: Any) -> dict | None:
    allowed = {"type", "color", "selected_text", "comment", "anchor_json"}
    sets = [f"{k}=?" for k in fields if k in allowed]
    vals = [v for k, v in fields.items() if k in allowed]
    if not sets:
        return get_annotation(annotation_id)
    sets.append("updated_at=?")
    vals.append(_DT())
    vals.append(annotation_id)
    get_db().execute(
        f"UPDATE annotations SET {', '.join(sets)} WHERE id=?",
        tuple(vals),
    )
    return get_annotation(annotation_id)


def delete_annotation(annotation_id: str) -> bool:
    get_db().execute("DELETE FROM annotations WHERE id=?", (annotation_id,))
    return True


# ════════════════════════════════════════════════════════════════════
#  Notes
# ════════════════════════════════════════════════════════════════════

def create_note(
    *,
    project_id: Optional[str] = None,
    paper_id: Optional[str] = None,
    title: str = "",
    content_markdown: str = "",
    created_by: str = "human",
) -> dict:
    nid = _uid()
    get_db().execute(
        "INSERT INTO notes (id, project_id, paper_id, title, content_markdown, created_by) "
        "VALUES (?,?,?,?,?,?)",
        (nid, project_id, paper_id, title, content_markdown, created_by),
    )
    row = get_db().query_one("SELECT * FROM notes WHERE id=?", (nid,))
    return _row_to_dict(row)  # type: ignore[return-value]


def get_note(note_id: str) -> dict | None:
    row = get_db().query_one("SELECT * FROM notes WHERE id=?", (note_id,))
    return _row_to_dict(row)


def list_notes(
    *,
    project_id: Optional[str] = None,
    paper_id: Optional[str] = None,
) -> list[dict]:
    clauses = []
    params: list[Any] = []
    if project_id:
        clauses.append("project_id=?")
        params.append(project_id)
    if paper_id:
        clauses.append("paper_id=?")
        params.append(paper_id)
    sql = "SELECT * FROM notes"
    if clauses:
        sql += " WHERE " + " AND ".join(clauses)
    sql += " ORDER BY updated_at DESC"
    rows = get_db().query(sql, tuple(params))
    return _rows_to_dicts(rows)


def update_note(note_id: str, **fields: Any) -> dict | None:
    allowed = {"title", "content_markdown"}
    sets = [f"{k}=?" for k in fields if k in allowed]
    vals = [v for k, v in fields.items() if k in allowed]
    if not sets:
        return get_note(note_id)
    sets.append("updated_at=?")
    vals.append(_DT())
    vals.append(note_id)
    get_db().execute(
        f"UPDATE notes SET {', '.join(sets)} WHERE id=?",
        tuple(vals),
    )
    return get_note(note_id)


def delete_note(note_id: str) -> bool:
    get_db().execute("DELETE FROM notes WHERE id=?", (note_id,))
    return True


# ════════════════════════════════════════════════════════════════════
#  Evidence cards
# ════════════════════════════════════════════════════════════════════

def create_evidence(
    *,
    project_id: str,
    paper_id: Optional[str] = None,
    claim: str,
    quote: str = "",
    source_ref: str = "",
    page_index: Optional[int] = None,
    kind: str = "background",
    verification_status: str = "pending",
    created_by: str = "human",
    ai_run_id: Optional[str] = None,
) -> dict:
    eid = _uid()
    get_db().execute(
        "INSERT INTO evidence_cards (id, project_id, paper_id, claim, quote, source_ref, page_index, kind, verification_status, created_by, ai_run_id) "
        "VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        (eid, project_id, paper_id, claim, quote, source_ref, page_index, kind, verification_status, created_by, ai_run_id),
    )
    row = get_db().query_one("SELECT * FROM evidence_cards WHERE id=?", (eid,))
    return _row_to_dict(row)  # type: ignore[return-value]


def get_evidence(evidence_id: str) -> dict | None:
    row = get_db().query_one("SELECT * FROM evidence_cards WHERE id=?", (evidence_id,))
    return _row_to_dict(row)


def list_evidence(project_id: str) -> list[dict]:
    rows = get_db().query(
        "SELECT * FROM evidence_cards WHERE project_id=? ORDER BY created_at DESC",
        (project_id,),
    )
    return _rows_to_dicts(rows)


def update_evidence(evidence_id: str, **fields: Any) -> dict | None:
    allowed = {"claim", "quote", "source_ref", "kind", "verification_status", "page_index"}
    sets = [f"{k}=?" for k in fields if k in allowed]
    vals = [v for k, v in fields.items() if k in allowed]
    if not sets:
        return get_evidence(evidence_id)
    sets.append("updated_at=?")
    vals.append(_DT())
    vals.append(evidence_id)
    get_db().execute(
        f"UPDATE evidence_cards SET {', '.join(sets)} WHERE id=?",
        tuple(vals),
    )
    return get_evidence(evidence_id)


# ════════════════════════════════════════════════════════════════════
#  AI sessions & runs
# ════════════════════════════════════════════════════════════════════

def create_ai_session(scope_type: str, scope_id: str, qwen_session_id: str, title: str = "") -> dict:
    sid = _uid()
    get_db().execute(
        "INSERT INTO ai_sessions (id, scope_type, scope_id, qwen_session_id, title) VALUES (?,?,?,?,?)",
        (sid, scope_type, scope_id, qwen_session_id, title),
    )
    row = get_db().query_one("SELECT * FROM ai_sessions WHERE id=?", (sid,))
    return _row_to_dict(row)  # type: ignore[return-value]


def get_ai_session(session_id: str) -> dict | None:
    row = get_db().query_one("SELECT * FROM ai_sessions WHERE id=?", (session_id,))
    return _row_to_dict(row)


def find_ai_session(scope_type: str, scope_id: str) -> dict | None:
    row = get_db().query_one(
        "SELECT * FROM ai_sessions WHERE scope_type=? AND scope_id=? ORDER BY created_at DESC LIMIT 1",
        (scope_type, scope_id),
    )
    return _row_to_dict(row)


def update_ai_session(session_id: str, **fields: Any) -> dict | None:
    # NOTE: ai_sessions has no updated_at column — only update allowed fields.
    allowed = {"title", "qwen_session_id"}
    sets: list[str] = []
    vals: list[Any] = []
    for k in fields:
        if k not in allowed:
            continue
        sets.append(f"{k}=?")
        vals.append(fields[k])
    if not sets:
        return get_ai_session(session_id)
    vals.append(session_id)
    get_db().execute(
        f"UPDATE ai_sessions SET {', '.join(sets)} WHERE id=?",
        tuple(vals),
    )
    return get_ai_session(session_id)


def create_ai_run(session_id: str, model: str = "", prompt_version: str = "", input_refs: list = None) -> dict:
    rid = _uid()
    get_db().execute(
        "INSERT INTO ai_runs (id, session_id, model, prompt_version, input_refs_json, status) VALUES (?,?,?,?,?,'running')",
        (rid, session_id, model, prompt_version, json.dumps(input_refs or [])),
    )
    row = get_db().query_one("SELECT * FROM ai_runs WHERE id=?", (rid,))
    return _row_to_dict(row)  # type: ignore[return-value]


def update_ai_run(run_id: str, **fields: Any) -> None:
    allowed = {"status", "output_json", "grounding_status"}
    sets: list[str] = []
    vals: list[Any] = []
    # Build sets/vals by field name (not .index()) so identical values for
    # different fields (e.g. output_json == grounding_status) can't collide.
    for k in fields:
        if k not in allowed:
            continue
        v = fields[k]
        if k == "output_json" and isinstance(v, (dict, list)):
            v = json.dumps(v, ensure_ascii=False)
        sets.append(f"{k}=?")
        vals.append(v)
    if not sets:
        return
    get_db().execute(
        f"UPDATE ai_runs SET {', '.join(sets)} WHERE id=?",
        tuple(vals) + (run_id,),
    )


def get_ai_run(run_id: str) -> dict | None:
    row = get_db().query_one("SELECT * FROM ai_runs WHERE id=?", (run_id,))
    return _row_to_dict(row)


def list_ai_session_runs(session_id: str) -> list[dict]:
    rows = get_db().query(
        "SELECT * FROM ai_runs WHERE session_id=? ORDER BY created_at DESC",
        (session_id,),
    )
    return _rows_to_dicts(rows)


# ════════════════════════════════════════════════════════════════════
#  Jobs
# ════════════════════════════════════════════════════════════════════

def create_job(
    job_type: str,
    payload: dict | None = None,
    *,
    paper_id: Optional[str] = None,
    project_id: Optional[str] = None,
) -> dict:
    jid = _uid()
    get_db().execute(
        "INSERT INTO jobs (id, type, state, payload_json, paper_id, project_id) "
        "VALUES (?,?, 'queued', ?, ?, ?)",
        (jid, job_type, json.dumps(payload or {}, ensure_ascii=False), paper_id, project_id),
    )
    row = get_db().query_one("SELECT * FROM jobs WHERE id=?", (jid,))
    d = _row_to_dict(row)
    d["payload"] = json.loads(d.pop("payload_json", "{}"))
    d["result"] = json.loads(d.pop("result_json", "{}"))
    d["error"] = json.loads(d.pop("error_json", "{}"))
    return d  # type: ignore[return-value]


def get_job(job_id: str) -> dict | None:
    row = get_db().query_one("SELECT * FROM jobs WHERE id=?", (job_id,))
    if row is None:
        return None
    d = _row_to_dict(row)
    d["payload"] = json.loads(d.pop("payload_json", "{}"))
    d["result"] = json.loads(d.pop("result_json", "{}"))
    d["error"] = json.loads(d.pop("error_json", "{}"))
    return d


def list_jobs(
    *,
    state: Optional[str] = None,
    paper_id: Optional[str] = None,
    limit: int = 50,
) -> list[dict]:
    clauses = []
    params: list[Any] = []
    if state:
        clauses.append("state=?")
        params.append(state)
    if paper_id:
        clauses.append("paper_id=?")
        params.append(paper_id)
    sql = "SELECT * FROM jobs"
    if clauses:
        sql += " WHERE " + " AND ".join(clauses)
    sql += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)
    rows = get_db().query(sql, tuple(params))
    result = []
    for r in rows:
        d = _row_to_dict(r)
        d["payload"] = json.loads(d.pop("payload_json", "{}"))
        d["result"] = json.loads(d.pop("result_json", "{}"))
        d["error"] = json.loads(d.pop("error_json", "{}"))
        result.append(d)
    return result


def update_job(job_id: str, **fields: Any) -> dict | None:
    allowed = {"state", "progress"}
    sets = [f"{k}=?" for k in fields if k in allowed]
    vals: list[Any] = [v for k, v in fields.items() if k in allowed]
    if not sets:
        return get_job(job_id)
    sets.append("updated_at=?")
    vals.append(_DT())
    if "result" in fields:
        sets.append("result_json=?")
        vals.append(json.dumps(fields["result"], ensure_ascii=False))
    if "error" in fields:
        sets.append("error_json=?")
        vals.append(json.dumps(fields["error"], ensure_ascii=False))
    vals.append(job_id)
    get_db().execute(
        f"UPDATE jobs SET {', '.join(sets)} WHERE id=?",
        tuple(vals),
    )
    return get_job(job_id)


def recover_interrupted_jobs() -> list[dict]:
    """Mark interrupted jobs as requires_attention."""
    rows = get_db().query(
        "SELECT * FROM jobs WHERE state IN ('running','queued')"
    )
    recovered = []
    for r in rows:
        d = _row_to_dict(r)
        get_db().execute(
            "UPDATE jobs SET state='interrupted', updated_at=? WHERE id=?",
            (_DT(), d["id"]),
        )
        d["state"] = "interrupted"
        d["payload"] = json.loads(d.pop("payload_json", "{}"))
        d["result"] = json.loads(d.pop("result_json", "{}"))
        d["error"] = json.loads(d.pop("error_json", "{}"))
        recovered.append(d)
    return recovered
