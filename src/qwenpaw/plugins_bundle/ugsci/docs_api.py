# -*- coding: utf-8 -*-
"""Offline UGSci user documentation routes.

The generated documentation is package data under ``static/docs``. Serving it
through the host API keeps the desktop, wheel, PyInstaller and development
installations on the same URL and avoids fragile ``file://`` paths.
"""

from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse


def build_docs_router(plugin_dir: Path) -> APIRouter:
    """Return a safe static-file router for the generated manual."""
    root = (plugin_dir / "static" / "docs").resolve()
    router = APIRouter()

    def resolve(relative: str) -> Path:
        candidate = (root / relative).resolve()
        try:
            candidate.relative_to(root)
        except ValueError as exc:
            raise HTTPException(status_code=404, detail="Documentation file not found") from exc
        if not candidate.is_file():
            raise HTTPException(status_code=404, detail="Documentation file not found")
        return candidate

    @router.get("/", include_in_schema=False)
    def documentation_index() -> FileResponse:
        return FileResponse(
            resolve("index.html"),
            media_type="text/html; charset=utf-8",
            headers={"Cache-Control": "no-cache"},
        )

    @router.get("/{asset_path:path}", include_in_schema=False)
    def documentation_asset(asset_path: str) -> FileResponse:
        path = resolve(asset_path)
        media_type = None
        if path.suffix.lower() == ".css":
            media_type = "text/css; charset=utf-8"
        elif path.suffix.lower() == ".html":
            media_type = "text/html; charset=utf-8"
        return FileResponse(path, media_type=media_type)

    return router


__all__ = ["build_docs_router"]
