# -*- coding: utf-8 -*-
"""Workspace API – download / upload the entire WORKING_DIR as a zip.

Also includes agent file management, language settings, audio/transcription
configuration, running config, and system prompt files.
"""

from __future__ import annotations

import asyncio
import io
import json
import shutil
import stat
import subprocess
import tempfile
import os
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote

from fastapi import APIRouter, Body, HTTPException, UploadFile, File, Request
from fastapi.responses import (
    FileResponse,
    ORJSONResponse,
    Response,
    StreamingResponse,
)
from watchfiles import awatch, Change
from pydantic import BaseModel, Field

from ..utils import check_upload_size, safe_join, schedule_agent_reload
from ...config import (
    load_config,
    save_config,
    AgentsRunningConfig,
)
from ...config.config import load_agent_config, save_agent_config
from ...agents.memory.agent_md_manager import AgentMdManager
from ...agents.templates import get_workspace_md_template_id
from ...agents.utils import copy_workspace_md_files
from ...constant import BUILTIN_QA_AGENT_ID, SUPPORTED_AGENT_LANGUAGES
from ..agent_context import get_agent_for_request, get_coding_dir


router = APIRouter(prefix="/workspace", tags=["workspace"])


class MdFileInfo(BaseModel):
    """Markdown file metadata."""

    filename: str = Field(..., description="File name")
    path: str = Field(..., description="File path")
    size: int = Field(..., description="Size in bytes")
    created_time: str = Field(..., description="Created time")
    modified_time: str = Field(..., description="Modified time")


class MdFileContent(BaseModel):
    """Markdown file content."""

    content: str = Field(..., description="File content")


def _dir_stats(root: Path) -> tuple[int, int]:
    """Return (file_count, total_size) for *root* recursively."""
    count = 0
    size = 0
    if root.is_dir():
        for p in root.rglob("*"):
            if p.is_file():
                count += 1
                size += p.stat().st_size
    return count, size


def _zip_directory(root: Path) -> io.BytesIO:
    """Create an in-memory zip archive of *root* and return the buffer.

    All files **and** directories (including empty ones) are included.
    """
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for entry in sorted(root.rglob("*")):
            arcname = entry.relative_to(root).as_posix()
            if entry.is_file():
                zf.write(entry, arcname)
            elif entry.is_dir():
                # Zip spec: directory entries end with '/'
                zf.write(entry, arcname + "/")
    buf.seek(0)
    return buf


# ---------------------------------------------------------------------------
# Agent File Management Endpoints
# ---------------------------------------------------------------------------


@router.get(
    "/files",
    response_model=list[MdFileInfo],
    summary="List working files",
    description="List all working files (uses active agent)",
)
async def list_working_files(
    request: Request,
) -> list[MdFileInfo]:
    """List working directory markdown files."""
    try:
        workspace = await get_agent_for_request(request)
        workspace_manager = AgentMdManager(
            str(workspace.workspace_dir),
            agent_id=workspace.agent_id,
        )
        files = [
            MdFileInfo.model_validate(file)
            for file in workspace_manager.list_working_mds()
        ]
        return files
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get(
    "/files/{md_name}",
    response_model=MdFileContent,
    summary="Read a working file",
    description="Read a working markdown file (uses active agent)",
)
async def read_working_file(
    md_name: str,
    request: Request,
) -> MdFileContent:
    """Read a working directory markdown file."""
    try:
        workspace = await get_agent_for_request(request)
        workspace_manager = AgentMdManager(
            str(workspace.workspace_dir),
            agent_id=workspace.agent_id,
        )
        content = workspace_manager.read_working_md(md_name)
        return MdFileContent(content=content)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.put(
    "/files/{md_name}",
    response_model=dict,
    summary="Write a working file",
    description="Create or update a working file (uses active agent)",
)
async def write_working_file(
    md_name: str,
    body: MdFileContent,
    request: Request,
) -> dict:
    """Write a working directory markdown file."""
    try:
        workspace = await get_agent_for_request(request)
        workspace_manager = AgentMdManager(
            str(workspace.workspace_dir),
            agent_id=workspace.agent_id,
        )
        workspace_manager.write_working_md(md_name, body.content)
        return {"written": True}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ---------------------------------------------------------------------------
# Coding Mode – full file-tree + file watcher (SSE)
# ---------------------------------------------------------------------------

_SKIP_NAMES: frozenset[str] = frozenset(
    {
        ".git",
        "__pycache__",
        ".venv",
        "node_modules",
        ".mypy_cache",
        ".pytest_cache",
        ".ruff_cache",
        ".hypothesis",
    },
)


def _should_skip(rel_parts: tuple[str, ...]) -> bool:
    return any(p.startswith(".") or p in _SKIP_NAMES for p in rel_parts)


def _is_skipped_name(name: str) -> bool:
    return name.startswith(".") or name in _SKIP_NAMES


def _list_all_files(workspace_dir: Path) -> list[dict]:
    """Recursively list all non-hidden workspace files.

    Uses ``os.walk(topdown=True)`` and prunes ``dirnames`` in place so that
    we never descend into ``node_modules`` / ``.venv`` / ``.git`` etc. — the
    previous ``Path.rglob('*')`` walked them fully and filtered after the
    fact, which is the dominant cost on real projects. Each file is stat'd
    exactly once. Paths are returned with POSIX ``/`` separators so the
    frontend ``buildTree`` (which splits on ``/``) works on Windows too.
    """
    files: list[dict] = []
    root = str(workspace_dir)
    try:
        for dirpath, dirnames, filenames in os.walk(root, topdown=True):
            # Prune in place — must mutate, not rebind, for os.walk to honor.
            dirnames[:] = sorted(
                d for d in dirnames if not _is_skipped_name(d)
            )
            rel_dir = os.path.relpath(dirpath, root)
            for name in sorted(filenames):
                if _is_skipped_name(name):
                    continue
                full = os.path.join(dirpath, name)
                try:
                    st = os.stat(full)
                except OSError:
                    continue
                rel = (
                    name
                    if rel_dir == "."
                    else f"{rel_dir}/{name}".replace(os.sep, "/")
                )
                files.append(
                    {
                        "filename": rel,
                        "path": rel,
                        "size": st.st_size,
                        "modified_time": datetime.fromtimestamp(
                            st.st_mtime,
                            tz=timezone.utc,
                        ).isoformat(),
                    },
                )
    except Exception:
        pass
    return files


@router.get(
    "/code-files",
    summary="List all workspace files (Coding Mode)",
)
async def list_code_files(request: Request) -> list[dict]:
    """List every non-hidden file in the active coding project directory."""
    workspace = await get_agent_for_request(request)
    return await asyncio.get_event_loop().run_in_executor(
        None,
        _list_all_files,
        get_coding_dir(workspace),
    )


_CODE_FILE_MAX_BYTES = 5 * 1024 * 1024  # 5 MB
_BINARY_FILE_MAX_BYTES = 50 * 1024 * 1024  # 50 MB

_MIME_MAP: dict[str, str] = {
    # Images
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "webp": "image/webp",
    "svg": "image/svg+xml",
    "ico": "image/x-icon",
    "bmp": "image/bmp",
    "tiff": "image/tiff",
    "tif": "image/tiff",
    # Documents
    "pdf": "application/pdf",
    # Office (served as binary for download/preview)
    "doc": "application/msword",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # noqa: E501
    "xls": "application/vnd.ms-excel",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  # noqa: E501
    "ppt": "application/vnd.ms-powerpoint",
    "pptx": (
        "application/vnd.openxmlformats-officedocument"
        ".presentationml.presentation"
    ),
    "odt": "application/vnd.oasis.opendocument.text",
    "ods": "application/vnd.oasis.opendocument.spreadsheet",
    "odp": "application/vnd.oasis.opendocument.presentation",
    # Video
    "mp4": "video/mp4",
    "webm": "video/webm",
    "avi": "video/x-msvideo",
    "mov": "video/quicktime",
    "mkv": "video/x-matroska",
    "wmv": "video/x-ms-wmv",
    "flv": "video/x-flv",
    # Audio
    "mp3": "audio/mpeg",
    "wav": "audio/wav",
    "flac": "audio/flac",
    "aac": "audio/aac",
    "ogg": "audio/ogg",
    "wma": "audio/x-ms-wma",
    # Archives
    "zip": "application/zip",
    "tar": "application/x-tar",
    "gz": "application/gzip",
    "7z": "application/x-7z-compressed",
    "rar": "application/vnd.rar",
    # Data
    "csv": "text/csv",
}


@router.get(
    "/binary-files/{file_path:path}",
    summary="Serve a binary workspace file (images, PDFs) for preview",
)
async def read_binary_file(
    file_path: str,
    request: Request,
) -> StreamingResponse:
    """Return the raw bytes of *file_path* with the appropriate Content-Type.

    Intended for the IDE preview panel (images, PDFs, CSV).
    Rejects files that are not in ``_MIME_MAP`` or exceed 50 MB.
    """
    workspace = await get_agent_for_request(request)
    target = safe_join(get_coding_dir(workspace), file_path)

    ext = target.suffix.lstrip(".").lower()
    mime = _MIME_MAP.get(ext)
    if mime is None:
        raise HTTPException(
            status_code=415,
            detail=f"Preview not supported for .{ext} files",
        )

    try:
        size = await asyncio.to_thread(lambda: target.stat().st_size)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="File not found") from exc
    except OSError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    if size > _BINARY_FILE_MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail=(
                f"File too large for preview ({size // 1024 // 1024} MB"
                f" > {_BINARY_FILE_MAX_BYTES // 1024 // 1024} MB limit)"
            ),
        )

    def _iter_chunks(chunk_size: int = 64 * 1024):
        with open(target, "rb") as fh:
            while True:
                data = fh.read(chunk_size)
                if not data:
                    break
                yield data

    return StreamingResponse(
        _iter_chunks(),
        media_type=mime,
        headers={"Content-Length": str(size)},
    )


def _file_etag(stat_result: os.stat_result) -> str:
    """Build a weak ETag from mtime+size — cheap and good enough for IDE."""
    return f'W/"{stat_result.st_mtime_ns}-{stat_result.st_size}"'


@router.get(
    "/code-files/{file_path:path}",
    summary="Read any workspace file (Coding Mode)",
)
async def read_code_file(file_path: str, request: Request):
    """Return the text content of *file_path* inside the workspace.

    Adds a weak ETag (mtime_ns + size) so repeat opens of an unchanged file
    short-circuit to ``304 Not Modified`` and skip the read entirely.
    Returns HTTP 413 if the file exceeds ``_CODE_FILE_MAX_BYTES`` (5 MB) to
    avoid flooding the browser with huge binary or log files.
    """
    workspace = await get_agent_for_request(request)
    target = safe_join(get_coding_dir(workspace), file_path)

    def _stat() -> os.stat_result:
        return target.stat()

    try:
        st = await asyncio.to_thread(_stat)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="File not found") from exc
    except OSError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    if not stat.S_ISREG(st.st_mode):
        raise HTTPException(status_code=404, detail="File not found")

    etag = _file_etag(st)
    if request.headers.get("if-none-match") == etag:
        return Response(status_code=304, headers={"ETag": etag})

    if st.st_size > _CODE_FILE_MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail=(
                f"File too large to open in editor "
                f"({st.st_size // 1024 // 1024} MB"
                f" > {_CODE_FILE_MAX_BYTES // 1024 // 1024} MB limit)"
            ),
        )

    def _read() -> str:
        return target.read_text(encoding="utf-8", errors="replace")

    try:
        content = await asyncio.to_thread(_read)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return ORJSONResponse(
        {"path": file_path, "content": content},
        headers={"ETag": etag},
    )


@router.put(
    "/code-files/{file_path:path}",
    summary="Write any workspace file (Coding Mode)",
)
async def write_code_file(
    file_path: str,
    request: Request,
    body: dict = Body(...),
) -> dict:
    """Overwrite *file_path* inside the workspace with the provided content.

    Request body::

        {"content": "<new file content>"}
    """
    workspace = await get_agent_for_request(request)
    target = safe_join(get_coding_dir(workspace), file_path)
    content = body.get("content", "")
    if not isinstance(content, str):
        raise HTTPException(status_code=422, detail="content must be a string")

    def _write() -> int:
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")
        return target.stat().st_size

    try:
        size = await asyncio.to_thread(_write)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return {"path": file_path, "size": size}


# ---------------------------------------------------------------------------
# Office document conversion (DOCX → HTML)
# ---------------------------------------------------------------------------


class ConvertOfficeRequest(BaseModel):
    """Request body for /convert-office."""

    url: str = Field(..., description="File URL or path")
    mime_type: str | None = Field(None, description="MIME type of the file")


class OfficeViewRequest(BaseModel):
    """Request body for /office-screenshot and /office-outline."""

    url: str = Field(..., description="File URL or path")
    page: int = Field(1, description="Page/slide number (1-based)")


# ---------------------------------------------------------------------------
# OfficeCLI integration helpers
# ---------------------------------------------------------------------------

_OFFICECLI_TIMEOUT = 30  # seconds


def _is_officecli_available() -> bool:
    """Check if the officecli binary is on PATH."""
    return shutil.which("officecli") is not None


def _officecli_bin() -> str:
    """Return the resolved officecli executable path.

    On Windows, npm-installed CLIs are ``.cmd`` wrappers. ``subprocess.run``
    without ``shell=True`` cannot find them by bare name, so we resolve the
    full path via ``shutil.which``.
    """
    resolved = shutil.which("officecli")
    return resolved or "officecli"


def _convert_with_officecli(file_path: str) -> str | None:
    """High-fidelity HTML conversion via ``officecli view <file> html -o``.

    Uses ``-o`` to write HTML to a temp file (avoids opening a browser).
    Returns an HTML string on success, or *None* on any failure so the
    caller can fall back to the legacy conversion path.
    """
    tmp_html = tempfile.mktemp(suffix=".html")
    try:
        result = subprocess.run(  # noqa: S603
            [
                _officecli_bin(),
                "view",
                file_path,
                "html",
                "-o",
                tmp_html,
            ],
            capture_output=True,
            timeout=_OFFICECLI_TIMEOUT,
            check=False,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        Path(tmp_html).unlink(missing_ok=True)
        return None
    if result.returncode != 0 or not Path(tmp_html).exists():
        Path(tmp_html).unlink(missing_ok=True)
        return None
    try:
        with open(tmp_html, "r", encoding="utf-8") as f:
            return f.read()
    except OSError:
        return None
    finally:
        Path(tmp_html).unlink(missing_ok=True)


def _get_officecli_page_count(file_path: str) -> int:
    """Get the total page/slide count of an Office document via officecli.

    Uses ``officecli view <file> stats --json``.
    Returns 0 if the count cannot be determined (best-effort).
    """
    try:
        result = subprocess.run(  # noqa: S603
            [
                _officecli_bin(),
                "view",
                file_path,
                "stats",
                "--json",
            ],
            capture_output=True,
            text=True,
            timeout=_OFFICECLI_TIMEOUT,
            check=False,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return 0
    if result.returncode != 0:
        return 0
    try:
        data = json.loads(result.stdout)
    except json.JSONDecodeError:
        return 0
    # officecli stats --json returns:
    #   {"success": true, "data": {"slides": 5, ...}}   (PPTX)
    #   {"success": true, "data": {"pageCount": 3, ...}} (DOCX)
    # Try top-level and nested "data" keys
    nested = data.get("data") or {}
    return (
        data.get("pageCount")
        or data.get("page_count")
        or data.get("slides")
        or data.get("totalPages")
        or nested.get("pageCount")
        or nested.get("page_count")
        or nested.get("slides")
        or nested.get("totalPages")
        or 0
    )


def _resolve_file_path_from_url(url: str, coding_dir: Path) -> Path:
    """Resolve a frontend URL to an absolute file path.

    Handles ``/api/workspace/binary-files/<path>``, absolute paths, and
    ``file://`` URLs.  Raises ``HTTPException(404)`` if the file does
    not exist.
    """
    if "/binary-files/" in url:
        file_path = url.split("/binary-files/", 1)[1].split("?")[0]
        file_path = unquote(file_path)
    elif url.startswith("/"):
        file_path = url.lstrip("/")
    elif url.startswith("file:///"):
        # file:///c:/Users/... → c:/Users/... (Windows drive letter)
        file_path = url[len("file:///") :]
    elif url.startswith("file://"):
        # file://hostname/share/... → //hostname/share/... (UNC)
        file_path = url[len("file://") :]
    else:
        file_path = url

    try:
        target = safe_join(coding_dir, file_path)
    except Exception:
        target = Path(file_path)

    if not target.exists():
        raise HTTPException(
            status_code=404,
            detail=f"File not found: {file_path}",
        )
    return target


def _get_docx_page_info(file_path: str) -> dict:
    """Parse DOCX XML to get page dimensions and estimate lines/chars."""
    import xml.etree.ElementTree as ET

    W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
    # Defaults: US Letter, 1-inch margins
    defaults = {
        "lines_per_page": 45,
        "chars_per_line": 78,
    }

    try:
        with zipfile.ZipFile(file_path) as z:
            root = ET.fromstring(z.read("word/document.xml"))
    except Exception:
        return defaults

    body = root.find(f"{{{W_NS}}}body")
    if body is None:
        return defaults

    # Find section properties (document-level)
    sect_pr = body.find(f"{{{W_NS}}}sectPr")
    if sect_pr is None:
        for child in body:
            pPr = child.find(f"{{{W_NS}}}pPr")
            if pPr is not None:
                s = pPr.find(f"{{{W_NS}}}sectPr")
                if s is not None:
                    sect_pr = s
                    break
    if sect_pr is None:
        return defaults

    pg_sz = sect_pr.find(f"{{{W_NS}}}pgSz")
    pg_mar = sect_pr.find(f"{{{W_NS}}}pgMar")

    page_w = 12240
    page_h = 15840
    margin_top = 1440
    margin_bottom = 1440
    margin_left = 1440
    margin_right = 1440
    header_h = 0
    footer_h = 0

    if pg_sz is not None:
        page_w = int(pg_sz.get(f"{{{W_NS}}}w", page_w))
        page_h = int(pg_sz.get(f"{{{W_NS}}}h", page_h))
    if pg_mar is not None:
        margin_top = int(pg_mar.get(f"{{{W_NS}}}top", margin_top))
        margin_bottom = int(pg_mar.get(f"{{{W_NS}}}bottom", margin_bottom))
        margin_left = int(pg_mar.get(f"{{{W_NS}}}left", margin_left))
        margin_right = int(pg_mar.get(f"{{{W_NS}}}right", margin_right))
        header_h = int(pg_mar.get(f"{{{W_NS}}}header", 0))
        footer_h = int(pg_mar.get(f"{{{W_NS}}}footer", 0))

    usable_h = (
        page_h
        - margin_top
        - margin_bottom
        - max(0, header_h)
        - max(0, footer_h)
    )
    usable_w = page_w - margin_left - margin_right

    # 11pt font, 1.15 line spacing → ~253 twips/line
    lines_per_page = max(10, usable_h // 253)
    # 11pt font → avg char width ~120 twips
    chars_per_line = max(20, usable_w // 120)

    return {
        "lines_per_page": lines_per_page,
        "chars_per_line": chars_per_line,
    }


def _has_page_break(element) -> bool:
    """Recursively check if an element tree contains a page break."""
    try:
        from mammoth import documents
    except ImportError:
        return False
    if isinstance(element, documents.Break) and element.break_type == "page":
        return True
    if hasattr(element, "children"):
        return any(_has_page_break(c) for c in element.children)
    return False


def _estimate_element_lines(  # pylint: disable=too-many-return-statements
    element,
    chars_per_line: int,
) -> float:
    """Estimate the number of visual lines an element occupies."""
    try:
        from mammoth import documents
    except ImportError:
        return 1.0

    if isinstance(element, documents.Paragraph):
        # Collect text content
        text = []

        def collect_text(el):
            if isinstance(el, documents.Text):
                text.append(el.value)
            elif hasattr(el, "children"):
                for c in el.children:
                    collect_text(c)

        collect_text(element)
        full_text = "".join(text)

        if not full_text.strip():
            return 1.0

        text_lines = max(1.0, len(full_text) / chars_per_line)

        style_name = (element.style_name or "").lower()
        if "heading 1" in style_name:
            return text_lines + 2.0
        elif "heading 2" in style_name:
            return text_lines + 1.5
        elif "heading 3" in style_name:
            return text_lines + 1.0
        elif "title" in style_name:
            return text_lines + 3.0
        return text_lines

    elif isinstance(element, documents.Table):
        row_count = len(element.children)
        return max(3.0, row_count * 1.5)

    elif hasattr(element, "children"):
        total = 0.0
        for child in element.children:
            total += _estimate_element_lines(child, chars_per_line)
        return max(1.0, total)

    return 1.0


# Sentinel text used as a page-break marker inside mammoth's HTML output.
_PAGE_BREAK_MARKER = "\u0000PAGE_BREAK\u0000"


def _build_docx_transform(page_info: dict):
    """Build a transform_document function that inserts page-break markers."""
    try:
        from mammoth import documents
    except ImportError:
        return None

    lines_per_page = page_info.get("lines_per_page", 45)
    chars_per_line = page_info.get("chars_per_line", 78)

    def transform_document(document):
        new_children = []
        accumulated_lines = 0.0

        for child in document.children:
            has_explicit = _has_page_break(child)
            element_lines = _estimate_element_lines(child, chars_per_line)

            needs_break = False
            if has_explicit:
                needs_break = True
                accumulated_lines = element_lines
            elif (
                accumulated_lines > 0
                and accumulated_lines + element_lines > lines_per_page
            ):
                needs_break = True
                accumulated_lines = element_lines
            else:
                accumulated_lines += element_lines

            if needs_break:
                marker_run = documents.run(
                    children=[documents.text(_PAGE_BREAK_MARKER)],
                )
                marker_para = documents.paragraph(
                    style_id="PageBreakMarker",
                    style_name="Page Break Marker",
                    numbering=None,
                    alignment=None,
                    indent=None,
                    children=[marker_run],
                )
                new_children.append(marker_para)

            new_children.append(child)

        return document.copy(children=new_children)

    return transform_document


def _convert_docx_to_html(  # pylint: disable=R0912,R0915
    file_path: str,
) -> str:
    """Convert a .docx/.xlsx/.pptx file to HTML for preview.

    Priority: officecli (high fidelity) → existing libs (fallback).
    """
    ext = Path(file_path).suffix.lstrip(".").lower()

    # ── 优先路径：officecli 高保真渲染 ──
    if _is_officecli_available():
        html = _convert_with_officecli(file_path)
        if html:
            return html
        # officecli 失败，继续走 fallback

    if ext == "docx":
        try:
            import mammoth

            # Parse page dimensions for page-break estimation
            page_info = _get_docx_page_info(file_path)
            transform = _build_docx_transform(page_info)

            with open(file_path, "rb") as f:
                if transform:
                    result = mammoth.convert_to_html(
                        f,
                        transform_document=transform,
                    )
                else:
                    result = mammoth.convert_to_html(f)

            html: str = result.value or ""

            # Replace markers with styled page-break divs
            if _PAGE_BREAK_MARKER in html:
                html = html.replace(
                    f"<p>{_PAGE_BREAK_MARKER}</p>",
                    '<div class="docx-page-break"></div>',
                )
                # Clean up any remaining marker text
                html = html.replace(_PAGE_BREAK_MARKER, "")

            return html

        except ImportError:
            pass

        # Fallback: python-docx (basic text extraction)
        try:
            from docx import Document

            doc = Document(file_path)
            html_parts = []
            for para in doc.paragraphs:
                text = para.text.strip()
                if not text:
                    html_parts.append("<br/>")
                    continue
                style = (para.style.name or "").lower()
                if "heading 1" in style:
                    html_parts.append(f"<h1>{text}</h1>")
                elif "heading 2" in style:
                    html_parts.append(f"<h2>{text}</h2>")
                elif "heading 3" in style:
                    html_parts.append(f"<h3>{text}</h3>")
                elif "title" in style:
                    html_parts.append(
                        f"<h1 style='text-align:center'>{text}</h1>",
                    )
                else:
                    html_parts.append(f"<p>{text}</p>")
            # Tables
            for table in doc.tables:
                html_parts.append(
                    "<table border='1' style='border-collapse:collapse'>",
                )
                for row in table.rows:
                    html_parts.append("<tr>")
                    for cell in row.cells:
                        html_parts.append(f"<td>{cell.text}</td>")
                    html_parts.append("</tr>")
                html_parts.append("</table>")
            return "\n".join(html_parts)
        except ImportError as exc:
            raise HTTPException(
                status_code=500,
                detail="No docx conversion library available "  # noqa: E501
                "(mammoth or python-docx required)",
            ) from exc

    # For .doc, .xls, .ppt — try LibreOffice if available
    if ext in ("doc", "xls", "ppt", "odt", "ods", "odp"):
        raise HTTPException(
            status_code=415,
            detail=(
                f"Direct preview of .{ext} files is not supported. "
                f"Please convert to .docx/.xlsx/.pptx first."
            ),
        )

    # For .xlsx — basic table extraction
    if ext == "xlsx":
        try:
            from docx import Document  # noqa: F401
        except ImportError:
            pass
        # Try openpyxl if available
        try:
            import openpyxl

            wb = openpyxl.load_workbook(file_path, read_only=True)
            html_parts = []
            for ws in wb.worksheets:
                html_parts.append(f"<h3>Sheet: {ws.title}</h3>")
                html_parts.append(
                    "<table border='1' style='border-collapse:collapse'>",
                )
                for row in ws.iter_rows(max_row=100, values_only=True):
                    html_parts.append("<tr>")
                    for cell in row:
                        html_parts.append(
                            f"<td>{cell if cell is not None else ''}</td>",
                        )
                    html_parts.append("</tr>")
                html_parts.append("</table>")
            return "\n".join(html_parts)
        except ImportError as exc:
            raise HTTPException(
                status_code=500,
                detail="openpyxl not installed for .xlsx preview",
            ) from exc

    # For .pptx — basic slide extraction
    if ext == "pptx":
        try:
            from pptx import Presentation

            prs = Presentation(file_path)
            html_parts = []
            for i, slide in enumerate(prs.slides, 1):
                html_parts.append(f"<h3>Slide {i}</h3>")
                html_parts.append("<div>")
                for shape in slide.shapes:
                    if hasattr(shape, "text") and shape.text.strip():
                        html_parts.append(f"<p>{shape.text}</p>")
                html_parts.append("</div>")
            return "\n".join(html_parts)
        except ImportError as exc:
            raise HTTPException(
                status_code=500,
                detail="python-pptx not installed for .pptx preview",
            ) from exc

    raise HTTPException(
        status_code=415,
        detail=f"Unsupported file type: .{ext}",
    )


@router.post(
    "/convert-office",
    summary="Convert an Office document to HTML for preview",
)
async def convert_office(
    request: Request,
    body: ConvertOfficeRequest,
) -> dict:
    """Convert a .docx/.xlsx/.pptx file to HTML for in-browser preview.

    Accepts a file URL (from the binary-files endpoint) or a workspace
    file path. Uses officecli (high fidelity) when available, falling
    back to mammoth for DOCX, openpyxl for XLSX, python-pptx for PPTX.
    """
    workspace = await get_agent_for_request(request)
    coding_dir = get_coding_dir(workspace)

    target = _resolve_file_path_from_url(body.url or "", coding_dir)

    def _convert() -> tuple[str, str]:
        # Try officecli first for high-fidelity rendering
        if _is_officecli_available():
            html = _convert_with_officecli(str(target))
            if html:
                return html, "officecli"
        # Fallback to legacy conversion
        return _convert_docx_to_html(str(target)), "legacy"

    try:
        html, engine = await asyncio.to_thread(_convert)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {"html": html, "engine": engine}


@router.post(
    "/office-screenshot",
    summary="Render an Office document page as PNG screenshot",
)
async def office_screenshot(
    request: Request,
    body: OfficeViewRequest,
) -> Response:
    """Render a specific page/slide of an Office document as a PNG image.

    Uses ``officecli view <file> screenshot --page N -o <tmp>``.
    Returns the PNG file as a ``FileResponse``.

    Raises ``HTTPException(404)`` if officecli is not installed.
    """
    if not _is_officecli_available():
        raise HTTPException(
            status_code=404,
            detail="officecli is not installed. "
            "Install from: https://github.com/iOfficeAI/OfficeCLI/releases",
        )

    workspace = await get_agent_for_request(request)
    coding_dir = get_coding_dir(workspace)
    target = _resolve_file_path_from_url(body.url, coding_dir)

    tmp_path = tempfile.mktemp(suffix=".png")

    def _run_screenshot() -> subprocess.CompletedProcess:
        return subprocess.run(  # noqa: S603
            [
                _officecli_bin(),
                "view",
                str(target),
                "screenshot",
                "--page",
                str(body.page),
                "-o",
                tmp_path,
            ],
            capture_output=True,
            timeout=60,
            check=False,
        )

    try:
        result = await asyncio.to_thread(_run_screenshot)
    except subprocess.TimeoutExpired as exc:
        Path(tmp_path).unlink(missing_ok=True)
        raise HTTPException(
            status_code=504,
            detail="officecli screenshot timed out",
        ) from exc

    if result.returncode != 0 or not Path(tmp_path).exists():
        Path(tmp_path).unlink(missing_ok=True)
        stderr = result.stderr.decode(
            errors="replace",
        ) if result.stderr else ""
        raise HTTPException(
            status_code=500,
            detail=f"officecli screenshot failed: {stderr}",
        )

    # Get page count for frontend pagination (best-effort)
    page_count = _get_officecli_page_count(str(target))

    from starlette.background import BackgroundTask

    return FileResponse(
        tmp_path,
        media_type="image/png",
        filename=f"page_{body.page}.png",
        headers={"X-Total-Pages": str(page_count)} if page_count > 0 else {},
        background=BackgroundTask(lambda: Path(tmp_path).unlink(missing_ok=True)),
    )


@router.post(
    "/office-outline",
    summary="Get document outline (headings/structure)",
)
async def office_outline(
    request: Request,
    body: ConvertOfficeRequest,
) -> dict:
    """Get the outline (heading structure) of an Office document.

    Uses ``officecli view <file> outline --json``.
    """
    if not _is_officecli_available():
        raise HTTPException(
            status_code=404,
            detail="officecli is not installed.",
        )

    workspace = await get_agent_for_request(request)
    coding_dir = get_coding_dir(workspace)
    target = _resolve_file_path_from_url(body.url, coding_dir)

    def _run_outline() -> dict:
        result = subprocess.run(  # noqa: S603
            [
                _officecli_bin(),
                "view",
                str(target),
                "outline",
                "--json",
            ],
            capture_output=True,
            text=True,
            timeout=_OFFICECLI_TIMEOUT,
            check=False,
        )
        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"officecli: {result.stderr}",
            )
        try:
            return json.loads(result.stdout)
        except json.JSONDecodeError as exc:
            raise HTTPException(
                status_code=500,
                detail="officecli returned invalid JSON",
            ) from exc

    try:
        data = await asyncio.to_thread(_run_outline)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return data


@router.post(
    "/office-issues",
    summary="Detect document issues (formatting/accessibility)",
)
async def office_issues(
    request: Request,
    body: ConvertOfficeRequest,
) -> dict:
    """Detect issues in an Office document (formatting, accessibility).

    Uses ``officecli view <file> issues --json``.
    """
    if not _is_officecli_available():
        raise HTTPException(
            status_code=404,
            detail="officecli is not installed.",
        )

    workspace = await get_agent_for_request(request)
    coding_dir = get_coding_dir(workspace)
    target = _resolve_file_path_from_url(body.url, coding_dir)

    def _run_issues() -> dict:
        result = subprocess.run(  # noqa: S603
            [
                _officecli_bin(),
                "view",
                str(target),
                "issues",
                "--json",
            ],
            capture_output=True,
            text=True,
            timeout=_OFFICECLI_TIMEOUT,
            check=False,
        )
        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"officecli: {result.stderr}",
            )
        try:
            return json.loads(result.stdout)
        except json.JSONDecodeError as exc:
            raise HTTPException(
                status_code=500,
                detail="officecli returned invalid JSON",
            ) from exc

    try:
        data = await asyncio.to_thread(_run_issues)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return data


@router.get(
    "/watch",
    summary="SSE stream for workspace file changes (Coding Mode)",
)
async def watch_workspace_files(request: Request) -> StreamingResponse:
    """Server-Sent Events that emit file-change notifications.

    Each SSE payload has the form::

        {"type": "file_change", "events": [{"change": "modified", "path": "..."}]}  # noqa: E501

    A heartbeat comment (``": heartbeat"``) is sent every 30 s when idle.
    """
    workspace = await get_agent_for_request(request)
    watch_dir = get_coding_dir(workspace)

    async def event_generator():
        yield 'data: {"type": "connected"}\n\n'
        watcher = awatch(watch_dir)
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    raw_changes = await asyncio.wait_for(
                        watcher.__anext__(),
                        timeout=30.0,
                    )
                except asyncio.TimeoutError:
                    yield ": heartbeat\n\n"
                    continue
                except (
                    StopAsyncIteration,
                    asyncio.CancelledError,
                    GeneratorExit,
                ):
                    # StopAsyncIteration  – watcher stopped naturally
                    # CancelledError      – app shutdown cancelled the task
                    # GeneratorExit       – streaming response closed
                    break

                events = []
                for change_type, path in raw_changes:
                    try:
                        rel = Path(path).relative_to(watch_dir)
                    except ValueError:
                        continue
                    if _should_skip(rel.parts):
                        continue
                    change_name = (
                        "added"
                        if change_type is Change.added
                        else "deleted"
                        if change_type is Change.deleted
                        else "modified"
                    )
                    events.append(
                        {"change": change_name, "path": rel.as_posix()},
                    )

                if events:
                    payload = json.dumps(
                        {"type": "file_change", "events": events},
                        ensure_ascii=False,
                    )
                    yield f"data: {payload}\n\n"
        except (asyncio.CancelledError, GeneratorExit):
            pass  # normal during app shutdown
        finally:
            try:
                await watcher.aclose()
            except Exception:
                pass

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get(
    "/memory",
    response_model=list[MdFileInfo],
    summary="List memory files",
    description="List all memory files (uses active agent)",
)
async def list_memory_files(
    request: Request,
) -> list[MdFileInfo]:
    """List memory directory markdown files."""
    try:
        workspace = await get_agent_for_request(request)
        workspace_manager = AgentMdManager(
            str(workspace.workspace_dir),
            agent_id=workspace.agent_id,
        )
        raw_files = await asyncio.to_thread(workspace_manager.list_memory_mds)
        files = [MdFileInfo.model_validate(file) for file in raw_files]
        return files
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get(
    "/memory/{md_path:path}",
    response_model=MdFileContent,
    summary="Read a memory file",
    description="Read a memory markdown file (uses active agent)",
)
async def read_memory_file(
    md_path: str,
    request: Request,
) -> MdFileContent:
    """Read a memory directory markdown file."""
    try:
        workspace = await get_agent_for_request(request)
        workspace_manager = AgentMdManager(
            str(workspace.workspace_dir),
            agent_id=workspace.agent_id,
        )
        content = await asyncio.to_thread(
            workspace_manager.read_memory_md,
            md_path,
        )
        return MdFileContent(content=content)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.put(
    "/memory/{md_path:path}",
    response_model=dict,
    summary="Write a memory file",
    description="Create or update a memory file (uses active agent)",
)
async def write_memory_file(
    md_path: str,
    body: MdFileContent,
    request: Request,
) -> dict:
    """Write a memory directory markdown file."""
    try:
        workspace = await get_agent_for_request(request)
        workspace_manager = AgentMdManager(
            str(workspace.workspace_dir),
            agent_id=workspace.agent_id,
        )
        await asyncio.to_thread(
            workspace_manager.write_memory_md,
            md_path,
            body.content,
        )
        return {"written": True}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get(
    "/language",
    summary="Get agent language",
    description="Get the language setting for agent MD files.",
)
async def get_agent_language(request: Request) -> dict:
    """Get agent language setting for current agent."""
    workspace = await get_agent_for_request(request)
    agent_config = load_agent_config(workspace.agent_id)
    return {
        "language": agent_config.language,
        "agent_id": workspace.agent_id,
    }


@router.put(
    "/language",
    summary="Update agent language",
    description=(
        "Update the language for agent MD files. "
        "Optionally copies MD files for the new language to agent workspace."
    ),
)
async def put_agent_language(
    request: Request,
    body: dict = Body(
        ...,
        description='Language setting, e.g. {"language": "id"}',
    ),
) -> dict:
    """
    Update agent language and optionally re-copy MD files to agent workspace.
    """
    language = (body.get("language") or "").strip().lower()
    valid = SUPPORTED_AGENT_LANGUAGES
    if language not in valid:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid language '{language}'. "
                f"Must be one of: {', '.join(sorted(valid))}"
            ),
        )

    workspace = await get_agent_for_request(request)
    agent_id = workspace.agent_id

    agent_config = load_agent_config(agent_id)
    old_language = agent_config.language

    agent_config.language = language
    save_agent_config(agent_id, agent_config)

    copied_files: list[str] = []
    if old_language != language:
        copied_files = copy_workspace_md_files(
            language,
            workspace.workspace_dir,
            md_template_id=get_workspace_md_template_id(
                agent_config.template_id
                or ("qa" if agent_id == BUILTIN_QA_AGENT_ID else None),
            ),
            only_if_missing=False,
        )

    return {
        "language": language,
        "copied_files": copied_files,
        "agent_id": agent_id,
    }


@router.get(
    "/audio-mode",
    summary="Get audio mode",
    description=(
        "Get the audio handling mode for incoming voice messages. "
        'Values: "auto", "native".'
    ),
)
async def get_audio_mode() -> dict:
    """Get audio mode setting."""
    config = load_config()
    return {"audio_mode": config.agents.audio_mode}


@router.put(
    "/audio-mode",
    summary="Update audio mode",
    description=(
        "Update how incoming audio/voice messages are handled. "
        '"auto": transcribe if provider available, else file placeholder; '
        '"native": send audio directly to model (may need ffmpeg).'
    ),
)
async def put_audio_mode(
    body: dict = Body(
        ...,
        description='Audio mode, e.g. {"audio_mode": "auto"}',
    ),
) -> dict:
    """Update audio mode setting."""
    raw = body.get("audio_mode")
    audio_mode = (str(raw) if raw is not None else "").strip().lower()
    valid = {"auto", "native"}
    if audio_mode not in valid:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid audio_mode '{audio_mode}'. "
                f"Must be one of: {', '.join(sorted(valid))}"
            ),
        )
    config = load_config()
    config.agents.audio_mode = audio_mode
    save_config(config)
    return {"audio_mode": audio_mode}


@router.get(
    "/transcription-provider-type",
    summary="Get transcription provider type",
    description=(
        "Get the transcription provider type. "
        'Values: "disabled", "whisper_api", "local_whisper".'
    ),
)
async def get_transcription_provider_type() -> dict:
    """Get transcription provider type setting."""
    config = load_config()
    return {
        "transcription_provider_type": (
            config.agents.transcription_provider_type
        ),
    }


@router.put(
    "/transcription-provider-type",
    summary="Set transcription provider type",
    description=(
        "Set the transcription provider type. "
        '"disabled": no transcription; '
        '"whisper_api": remote Whisper endpoint; '
        '"local_whisper": locally installed openai-whisper.'
    ),
)
async def put_transcription_provider_type(
    body: dict = Body(
        ...,
        description=(
            "Provider type, e.g. "
            '{"transcription_provider_type": "whisper_api"}'
        ),
    ),
) -> dict:
    """Set the transcription provider type."""
    raw = body.get("transcription_provider_type")
    provider_type = (str(raw) if raw is not None else "").strip().lower()
    valid = {"disabled", "whisper_api", "local_whisper"}
    if provider_type not in valid:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid transcription_provider_type '{provider_type}'. "
                f"Must be one of: {', '.join(sorted(valid))}"
            ),
        )
    config = load_config()
    config.agents.transcription_provider_type = provider_type
    save_config(config)
    return {"transcription_provider_type": provider_type}


@router.get(
    "/local-whisper-status",
    summary="Check local whisper availability",
    description=(
        "Check whether the local whisper provider can be used. "
        "Returns availability of ffmpeg and openai-whisper."
    ),
)
async def get_local_whisper_status() -> dict:
    """Check local whisper dependencies."""
    from ...agents.utils.audio_transcription import (
        check_local_whisper_available,
    )

    return check_local_whisper_available()


@router.get(
    "/transcription-providers",
    summary="List transcription providers",
    description=(
        "List providers capable of audio transcription (Whisper API). "
        "Returns available providers and the configured selection."
    ),
)
async def get_transcription_providers() -> dict:
    """List transcription-capable providers and configured selection."""
    from ...agents.utils.audio_transcription import (
        get_configured_transcription_provider_id,
        list_transcription_providers,
    )

    return {
        "providers": list_transcription_providers(),
        "configured_provider_id": (get_configured_transcription_provider_id()),
    }


@router.put(
    "/transcription-provider",
    summary="Set transcription provider",
    description=(
        "Set the provider to use for audio transcription. "
        'Use empty string "" to unset.'
    ),
)
async def put_transcription_provider(
    body: dict = Body(
        ...,
        description=(
            'Provider ID, e.g. {"provider_id": "openai"} '
            'or {"provider_id": ""} to unset'
        ),
    ),
) -> dict:
    """Set the transcription provider."""
    provider_id = (body.get("provider_id") or "").strip()
    config = load_config()
    config.agents.transcription_provider_id = provider_id
    save_config(config)
    return {"provider_id": provider_id}


@router.post(
    "/transcribe",
    summary="Transcribe audio to text",
    description=(
        "Transcribe an uploaded audio file "
        "using the configured Whisper provider. "
        "Returns the transcribed text."
    ),
)
async def post_transcribe_audio(
    file: UploadFile = File(..., description="Audio file to transcribe"),
) -> dict:
    """Transcribe uploaded audio file using configured Whisper provider."""
    from ...agents.utils.audio_transcription import transcribe_audio

    # Check transcription is enabled
    config = load_config()
    provider_type = config.agents.transcription_provider_type
    if provider_type == "disabled":
        raise HTTPException(
            status_code=400,
            detail={
                "code": "TRANSCRIPTION_DISABLED",
                "message": (
                    "Transcription is disabled. "
                    "Configure a transcription provider in Settings."
                ),
            },
        )

    # Validate file type
    allowed_extensions = {
        ".webm",
        ".mp4",
        ".m4a",
        ".wav",
        ".mp3",
        ".ogg",
        ".flac",
    }
    suffix = (
        os.path.splitext(file.filename or "audio.webm")[1].lower() or ".webm"
    )
    if suffix not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "UNSUPPORTED_FILE_TYPE",
                "message": (
                    f"Unsupported file type: {suffix}. "
                    f"Allowed: {', '.join(sorted(allowed_extensions))}"
                ),
            },
        )

    data = await file.read()
    check_upload_size(data)

    # Save uploaded file to temp directory
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(data)
        tmp_path = tmp.name

    try:
        text = await transcribe_audio(tmp_path)
        if text is None:
            raise HTTPException(
                status_code=500,
                detail="Transcription failed. Check provider configuration.",
            )
        return {"text": text}
    finally:
        # Clean up temp file
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


@router.get(
    "/running-config",
    response_model=AgentsRunningConfig,
    summary="Get agent running config",
    description="Get running configuration for active agent",
)
async def get_agents_running_config(
    request: Request,
) -> AgentsRunningConfig:
    """Get agent running configuration."""
    workspace = await get_agent_for_request(request)
    agent_config = load_agent_config(workspace.agent_id)
    running = agent_config.running or AgentsRunningConfig()
    running.approval_level = getattr(agent_config, "approval_level", "AUTO")
    return running


@router.put(
    "/running-config",
    response_model=AgentsRunningConfig,
    summary="Update agent running config",
    description="Update running configuration for active agent",
)
async def put_agents_running_config(
    running_config: AgentsRunningConfig = Body(
        ...,
        description="Updated agent running configuration",
    ),
    request: Request = None,
) -> AgentsRunningConfig:
    """Update agent running configuration."""
    workspace = await get_agent_for_request(request)
    agent_config = load_agent_config(workspace.agent_id)

    if running_config.approval_level is not None:
        agent_config.approval_level = running_config.approval_level

    running_config.approval_level = None
    agent_config.running = running_config
    save_agent_config(workspace.agent_id, agent_config)

    schedule_agent_reload(request, workspace.agent_id)

    running_config.approval_level = agent_config.approval_level
    return running_config


@router.get(
    "/system-prompt-files",
    response_model=list[str],
    summary="Get system prompt files",
    description="Get system prompt files for active agent",
)
async def get_system_prompt_files(
    request: Request,
) -> list[str]:
    """Get list of enabled system prompt files."""
    workspace = await get_agent_for_request(request)
    agent_config = load_agent_config(workspace.agent_id)
    return agent_config.system_prompt_files or []


@router.put(
    "/system-prompt-files",
    response_model=list[str],
    summary="Update system prompt files",
    description="Update system prompt files for active agent",
)
async def put_system_prompt_files(
    files: list[str] = Body(
        ...,
        description="Markdown filenames to load into system prompt",
    ),
    request: Request = None,
) -> list[str]:
    """Update list of enabled system prompt files."""
    workspace = await get_agent_for_request(request)
    agent_config = load_agent_config(workspace.agent_id)
    agent_config.system_prompt_files = files
    save_agent_config(workspace.agent_id, agent_config)

    schedule_agent_reload(request, workspace.agent_id)

    return files


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _validate_zip_data(data: bytes, workspace_dir: Path) -> None:
    """Ensure *data* is a valid zip without path-traversal entries."""
    if not zipfile.is_zipfile(io.BytesIO(data)):
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is not a valid zip archive",
        )
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        for name in zf.namelist():
            resolved = (workspace_dir / name).resolve()
            if not str(resolved).startswith(str(workspace_dir)):
                raise HTTPException(
                    status_code=400,
                    detail=f"Zip contains unsafe path: {name}",
                )


def _extract_and_merge_zip(data: bytes, workspace_dir: Path) -> None:
    """Extract zip data and merge into workspace_dir (blocking operation)."""
    tmp_dir = None
    try:
        tmp_dir = Path(tempfile.mkdtemp(prefix="qwenpaw_upload_"))
        with zipfile.ZipFile(io.BytesIO(data)) as zf:
            zf.extractall(tmp_dir)

        top_entries = list(tmp_dir.iterdir())
        extract_root = tmp_dir
        if len(top_entries) == 1 and top_entries[0].is_dir():
            extract_root = top_entries[0]

        workspace_dir.mkdir(parents=True, exist_ok=True)

        for item in extract_root.iterdir():
            dest = workspace_dir / item.name
            if item.is_file():
                shutil.copy2(item, dest)
            else:
                if dest.exists() and dest.is_file():
                    dest.unlink()
                shutil.copytree(item, dest, dirs_exist_ok=True)
    finally:
        if tmp_dir and tmp_dir.is_dir():
            shutil.rmtree(tmp_dir, ignore_errors=True)


def _validate_and_extract_zip(data: bytes, workspace_dir: Path) -> None:
    """Validate and extract zip data (blocking operation)."""
    _validate_zip_data(data, workspace_dir)
    _extract_and_merge_zip(data, workspace_dir)


# ---------------------------------------------------------------------------
# Workspace Download/Upload Endpoints
# ---------------------------------------------------------------------------


@router.get(
    "/download",
    summary="Download workspace as zip",
    description=(
        "Package the entire agent workspace into a zip archive and stream "
        "it back as a downloadable file."
    ),
    responses={
        200: {
            "content": {"application/zip": {}},
            "description": "Zip archive of agent workspace",
        },
    },
)
async def download_workspace(request: Request):
    """Stream agent workspace as a zip file."""

    agent = await get_agent_for_request(request)
    workspace_dir = agent.workspace_dir

    if not workspace_dir.is_dir():
        raise HTTPException(
            status_code=404,
            detail=f"Workspace does not exist: {workspace_dir}",
        )

    buf = await asyncio.to_thread(_zip_directory, workspace_dir)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"qwenpaw_workspace_{agent.agent_id}_{timestamp}.zip"

    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )


@router.post(
    "/upload",
    response_model=dict,
    summary="Upload zip and merge into workspace",
    description=(
        "Upload a zip archive.  Paths present in the zip are merged into "
        "agent workspace (files overwritten, dirs merged).  Paths not in "
        "the zip are left unchanged (e.g. qwenpaw.db, runtime dirs). "
        "Download packs the entire workspace; upload only "
        "overwrites/merges zip contents."
    ),
)
async def upload_workspace(
    request: Request,
    file: UploadFile = File(
        ...,
        description="Zip archive to merge into agent workspace",
    ),
) -> dict:
    """
    Merge uploaded zip contents into agent workspace (overwrite, not clear).
    """

    if file.content_type and file.content_type not in (
        "application/zip",
        "application/x-zip-compressed",
        "application/octet-stream",
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Expected a zip file, got content-type: {file.content_type}"
            ),
        )

    agent = await get_agent_for_request(request)
    workspace_dir = agent.workspace_dir
    data = await file.read()

    try:
        await asyncio.to_thread(_validate_and_extract_zip, data, workspace_dir)
        return {"success": True}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to merge workspace: {exc}",
        ) from exc


@router.get("/commands/available")
async def get_available_commands(request: Request):
    """Return all slash commands registered for the workspace.

    Merges built-in system commands with plugin-registered ones
    so the frontend can dynamically populate the slash menu.
    """
    agent = await get_agent_for_request(request)
    registry = getattr(
        getattr(agent, "plugins", None),
        "slash_command_registry",
        None,
    )
    commands = []
    if registry is not None:
        for name in registry.names():
            match = registry.resolve(f"/{name}")
            desc = ""
            category = ""
            if match:
                spec, _ = match
                desc = spec.help_text or ""
                category = spec.category or ""
            commands.append(
                {
                    "name": name,
                    "description": desc,
                    "category": category,
                },
            )
    return ORJSONResponse({"commands": commands})
