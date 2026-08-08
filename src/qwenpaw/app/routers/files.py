# -*- coding: utf-8 -*-
from __future__ import annotations

import os
from pathlib import Path
from fastapi import APIRouter, HTTPException, Request
from starlette.responses import FileResponse

from qwenpaw.constant import WORKING_DIR
from qwenpaw.security.tool_guard.guardians.file_guardian import (
    FilePathToolGuardian,
    _normalize_path,
)

router = APIRouter(prefix="/files", tags=["files"])

_ALLOWED_ROOT: Path = WORKING_DIR.resolve()

# Reuse the FileGuard sensitive path detection for the preview endpoint.
_file_guardian = FilePathToolGuardian()


def _is_preview_outside_workspace_allowed() -> bool:
    """Check ``security.file_guard.allow_preview_outside_workspace``."""
    try:
        from qwenpaw.config import load_config

        return bool(
            load_config().security.file_guard.allow_preview_outside_workspace,
        )
    except Exception:
        return False


def _check_path(path: Path) -> str | None:
    """Return ``None`` when *path* is allowed, or an error reason string.

    When ``allow_preview_outside_workspace`` is enabled, skip the
    WORKING_DIR containment check so that console can preview files
    (e.g. media produced by tools) stored outside the workspace.
    The sensitive-file guard is **always** enforced.
    """
    resolved = path.resolve()
    # 1. Must not be a FileGuard-sensitive path.
    normalized = _normalize_path(str(resolved))
    # pylint: disable-next=protected-access
    if _file_guardian._is_sensitive(normalized):
        return "SENSITIVE_FILE_BLOCKED"
    # 2. Workspace scope check (skippable via config).
    if not _is_preview_outside_workspace_allowed():
        if not (
            resolved == _ALLOWED_ROOT or resolved.is_relative_to(_ALLOWED_ROOT)
        ):
            return "OUTSIDE_WORKSPACE"
    return None


async def _resolve_relative_path(normalized: str, request: Request) -> Path:
    """Resolve a relative file path by searching candidate directories.

    Search order:
    1. Agent workspace_dir (e.g. ``~/.qwenpaw/workspaces/default/``)
    2. Agent workspace_dir/media (uploaded files)
    3. Current session project_dir (falling back to the Agent project_dir)
    4. WORKING_DIR (fallback)

    Returns the first match that exists as a file. If none match,
    returns the workspace_dir candidate so that the caller produces
    a proper 404 rather than a confusing 403.
    """
    candidates: list[Path] = []

    # Try to get the agent workspace from the request context
    try:
        from ..agent_context import (
            get_agent_for_request,
            get_project_dir_for_request,
        )

        workspace = await get_agent_for_request(request)
        ws_dir = workspace.workspace_dir
        candidates.append(ws_dir / normalized)
        candidates.append(ws_dir / "media" / normalized)
        project_dir = await get_project_dir_for_request(
            request,
            workspace,
        )
        candidates.append(project_dir / normalized)
    except HTTPException:
        raise
    except Exception:
        pass

    # Fallback: WORKING_DIR
    candidates.append(_ALLOWED_ROOT / normalized)

    for candidate in candidates:
        try:
            resolved = candidate.resolve()
            if resolved.is_file():
                return resolved
        except (OSError, ValueError):
            continue

    # Return the first candidate (workspace_dir or WORKING_DIR) so the
    # caller emits a 404 "Not found" rather than a misleading error.
    return (
        candidates[0].resolve()
        if candidates
        else (_ALLOWED_ROOT / normalized).resolve()
    )


@router.api_route(
    "/preview/{filepath:path}",
    methods=["GET", "HEAD"],
    summary="Preview file",
)
async def preview_file(
    filepath: str,
    request: Request,
):
    """Preview file."""
    # FastAPI already URL-decodes path parameters;
    # ``filepath`` is ready to use.
    normalized = filepath

    # Normalize /C:/... to C:/... on Windows.
    if (
        len(normalized) >= 4
        and normalized[0] == "/"
        and normalized[2] == ":"
        and normalized[1].isalpha()
    ):
        normalized = normalized[1:]

    path = Path(normalized).expanduser()
    if not path.is_absolute():
        path = await _resolve_relative_path(normalized, request)
    path = path.resolve()
    reason = _check_path(path)
    if reason:
        raise HTTPException(status_code=403, detail=reason)
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Not found")

    if not os.access(path, os.R_OK):
        raise HTTPException(status_code=500, detail="Permission denied")
    return FileResponse(path, filename=path.name)
