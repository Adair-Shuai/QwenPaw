# -*- coding: utf-8 -*-
"""Adapter: ``register_tool_artifact`` — file/artifact registration stub.

LeAgent's ``load_image``, ``load_mesh3d``, and ``asset_export`` nodes call
``register_tool_artifact(data, filename, content_type, session_id, user_id)``
to persist generated files as managed artifacts.

QwenPaw has a file service accessible through the workspace manager.
When a workspace is available, this adapter delegates to it; otherwise
it falls back to writing the file to a temp directory and returning
a minimal artifact dict.
"""

from __future__ import annotations

import logging
import os
import tempfile
from typing import Any

logger = logging.getLogger(__name__)

# Fallback artifact storage directory
_ARTIFACT_DIR = os.path.join(tempfile.gettempdir(), "flowforge_artifacts")


async def register_tool_artifact(
    data: bytes,
    *,
    filename: str = "artifact",
    content_type: str | None = None,
    session_id: str | None = None,
    user_id: str | None = None,
) -> dict[str, Any]:
    """Register a file as a managed artifact.

    Returns a dict with at least ``id``, ``filename``, ``content_type``,
    ``download_url``, ``preview_url``, and ``size``.
    """
    # Try QwenPaw's file service first
    try:
        artifact = await _register_via_qwenpaw(data, filename, content_type, session_id, user_id)
        if artifact is not None:
            return artifact
    except Exception:  # noqa: BLE001
        logger.debug("register_tool_artifact: QwenPaw file service unavailable", exc_info=True)

    # Fallback: write to temp dir
    return await _register_fallback(data, filename, content_type)


async def _register_via_qwenpaw(
    data: bytes,
    filename: str,
    content_type: str | None,
    session_id: str | None,
    user_id: str | None,
) -> dict[str, Any] | None:
    """Try to register via QwenPaw's file/attachment service."""
    try:
        from qwenpaw.plugins.registry import PluginRegistry

        registry = PluginRegistry()
        mgr = registry.get_workspace_manager()
        if mgr is None:
            return None

        # Try to find a file service on the workspace manager
        file_service = getattr(mgr, "file_service", None)
        if file_service is None:
            # Try to get it from the first workspace
            agents = getattr(mgr, "agents", None) or getattr(mgr, "workspaces", None)
            if agents:
                first_ws = next(iter(agents.values()))
                file_service = getattr(first_ws, "file_service", None)

        if file_service is not None and hasattr(file_service, "upload"):
            result = await file_service.upload(
                data,
                filename=filename,
                content_type=content_type or "application/octet-stream",
            )
            return {
                "id": str(getattr(result, "id", "") or ""),
                "filename": filename,
                "content_type": content_type or "application/octet-stream",
                "download_url": getattr(result, "download_url", None) or "",
                "preview_url": getattr(result, "preview_url", None) or "",
                "size": len(data),
            }
    except Exception:  # noqa: BLE001
        pass
    return None


async def _register_fallback(
    data: bytes,
    filename: str,
    content_type: str | None,
) -> dict[str, Any]:
    """Write the artifact to a temp directory as a fallback."""
    os.makedirs(_ARTIFACT_DIR, exist_ok=True)
    safe_name = os.path.basename(filename) or "artifact"
    path = os.path.join(_ARTIFACT_DIR, safe_name)
    with open(path, "wb") as f:
        f.write(data)
    return {
        "id": safe_name,
        "filename": safe_name,
        "content_type": content_type or "application/octet-stream",
        "download_url": f"file://{path}",
        "preview_url": f"file://{path}",
        "size": len(data),
    }


__all__ = ["register_tool_artifact"]
