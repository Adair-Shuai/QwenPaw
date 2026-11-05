# -*- coding: utf-8 -*-
"""PawApp API router - List, manage, and serve installed PawApps.

Combines installed manifests with runtime records so failed and disabled
applications remain visible alongside successfully loaded applications.
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

import asyncio
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse

from ...plugins.browser_access import browser_prefixes
from ...plugins.registry import MemoryBackendInUseError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/pawapps", tags=["pawapps"])


def _get_apps_dir() -> Path:
    """Return the directory holding installed 'app'-type plugins.

    Apps install into the plugins directory alongside every other
    plugin; there is no separate apps directory.
    """
    from ...config.utils import get_plugins_dir

    return get_plugins_dir()


# ─── Shared helpers ────────────────────────────────────────────────────


def _is_app_manifest(manifest: Dict[str, Any]) -> bool:
    meta = manifest.get("meta")
    return manifest.get("type", manifest.get("plugin_type")) == "app" or (
        isinstance(meta, dict) and bool(meta.get("pawapp"))
    )


def _build_app_info(
    manifest: Dict[str, Any],
    fallback_id: str = "",
) -> Dict[str, Any]:
    """Build a normalised app-info dict from a manifest."""
    meta = manifest.get("meta")
    meta = meta if isinstance(meta, dict) else {}
    pawapp_meta = meta.get("pawapp")
    pawapp_meta = pawapp_meta if isinstance(pawapp_meta, dict) else {}
    return {
        "id": manifest.get("id", fallback_id),
        "name": manifest.get("name", fallback_id),
        "version": manifest.get("version", "0.0.0"),
        "description": manifest.get("description", ""),
        "description_i18n": manifest.get("description_i18n", {}) or {},
        "author": manifest.get("author", ""),
        "category": pawapp_meta.get("category", ""),
        "icon": pawapp_meta.get("icon", ""),
        "icon_url": pawapp_meta.get("icon_url", ""),
        "entry_page": pawapp_meta.get("entry_page", ""),
        "launch_scope": pawapp_meta.get(
            "launch_scope",
            "page",
        ),
        "status": "installed",
        "settings": meta.get("settings", []),
    }


# ─── Registry-based listing (preferred) ───────────────────────────────


def _get_pawapps_from_registry(
    request: Request,
) -> List[Dict[str, Any]]:
    """Query PluginRegistry for all loaded PawApp plugins."""
    registry = getattr(
        request.app.state,
        "plugin_registry",
        None,
    )
    if registry is None:
        return []

    apps: List[Dict[str, Any]] = []
    for plugin_id, manifest in registry.get_all_plugin_manifests().items():
        if not isinstance(manifest, dict):
            continue
        if not _is_app_manifest(manifest):
            continue
        apps.append(_build_app_info(manifest, plugin_id))

    return apps


# ─── Fallback: directory scanning ─────────────────────────────────────


def _load_plugin_json(
    plugin_dir: Path,
) -> Optional[Dict[str, Any]]:
    """Load ``plugin.json`` from a plugin directory."""
    manifest_path = plugin_dir / "plugin.json"
    if not manifest_path.exists():
        return None
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
            return manifest if isinstance(manifest, dict) else None
    except Exception as e:
        logger.warning(
            "Failed to load plugin.json from %s: %s",
            manifest_path,
            e,
        )
        return None


def _scan_installed_apps_fallback() -> List[Dict[str, Any]]:
    """Read installed apps, excluding backups and uninstall tombstones."""
    from ...plugins.architecture import PluginManifest
    from ...plugins.bundled import is_plugin_uninstalled, validate_plugin_id

    apps_dir = _get_apps_dir()
    if not apps_dir.exists():
        return []

    apps = []
    for item in apps_dir.iterdir():
        if item.name.startswith(".") or not item.is_dir():
            continue
        manifest = _load_plugin_json(item)
        if not manifest:
            continue
        if not _is_app_manifest(manifest):
            continue
        try:
            plugin_id = manifest.get("id", item.name)
            if not isinstance(plugin_id, str):
                continue
            normalized = PluginManifest.from_dict(
                {**manifest, "id": validate_plugin_id(plugin_id)},
            ).model_dump()
            if is_plugin_uninstalled(
                plugin_id,
                plugins_dir=apps_dir,
                plugin_dir=item,
            ):
                continue
        except ValueError:
            continue
        apps.append(_build_app_info(normalized, item.name))

    return apps


async def _installed_apps_with_runtime(
    request: Request,
) -> List[Dict[str, Any]]:
    from ...config import load_config
    from ...plugins.settings import is_plugin_enabled

    installed = await asyncio.to_thread(_scan_installed_apps_fallback)
    apps = {item["id"]: item for item in installed}
    apps.update(
        (item["id"], item) for item in _get_pawapps_from_registry(request)
    )
    loader = getattr(request.app.state, "plugin_loader", None)
    records = loader.get_all_loaded_plugins() if loader is not None else {}
    for plugin_id, record in records.items():
        manifest = record.manifest.model_dump()
        if _is_app_manifest(manifest):
            apps[plugin_id] = _build_app_info(manifest, plugin_id)

    config = await asyncio.to_thread(load_config)
    for plugin_id, app in apps.items():
        record = records.get(plugin_id)
        intent = getattr(record, "global_enabled", None)
        enabled = (
            is_plugin_enabled(config.plugins[plugin_id])
            if plugin_id in config.plugins
            else intent
            if intent is not None
            else True
        )
        status = getattr(record, "status", "pending")
        loaded = bool(
            enabled
            and getattr(record, "enabled", False)
            and status == "active",
        )
        app.update(
            enabled=enabled,
            loaded=loaded,
            status=(
                "failed"
                if status == "failed"
                else (
                    "disabled"
                    if not enabled
                    else "active"
                    if loaded
                    else "pending"
                )
            ),
            diagnostics=list(getattr(record, "diagnostics", None) or []),
        )
    return list(apps.values())


# ─── API Endpoints ────────────────────────────────────────────────────


@router.get("")
async def list_pawapps(request: Request) -> Dict[str, Any]:
    """List installed apps with independent enable and runtime state."""
    apps = await _installed_apps_with_runtime(request)
    return {"apps": apps, "total": len(apps)}


@router.get("/{app_id}")
async def get_pawapp(app_id: str, request: Request) -> Dict[str, Any]:
    """Get details of a specific PawApp."""
    apps = await _installed_apps_with_runtime(request)
    for app in apps:
        if app["id"] == app_id:
            registry = getattr(request.app.state, "plugin_registry", None)
            return {
                **app,
                "browser_prefixes": browser_prefixes(registry, app_id),
            }
    raise HTTPException(status_code=404, detail=f"PawApp '{app_id}' not found")


@router.delete("/{app_id}")
async def uninstall_pawapp(
    app_id: str,
    request: Request,
    interrupt_tasks: bool = False,
) -> Dict[str, Any]:
    """Uninstall a PawApp by deleting its directory under ~/.copaw/apps.

    Falls back to unloading a plugin-based PawApp via the plugin loader
    when no matching directory exists. A backend restart may be needed to
    fully unmount any already-mounted backend routers.
    """
    # Security: app_id must be a single, non-traversal path segment.
    if not app_id or "/" in app_id or "\\" in app_id or app_id in (".", ".."):
        raise HTTPException(status_code=400, detail="Invalid app id")

    apps_dir = _get_apps_dir()
    app_dir = apps_dir / app_id
    try:
        if app_dir.resolve().parent != apps_dir.resolve():
            raise HTTPException(status_code=400, detail="Invalid app path")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Invalid app path",
        ) from exc

    loader = getattr(request.app.state, "plugin_loader", None)
    if loader is None:
        raise HTTPException(
            status_code=503,
            detail="Plugin loader is not ready yet.",
        )
    try:
        from ...plugins.lifecycle import UnloadMode
        from ...plugins.activity import PluginBusyError
        from .plugins import memory_in_use_detail, unload_http_detail

        report = await loader.lifecycle.unload(
            app_id,
            UnloadMode.UNINSTALL,
            delete_files=True,
            **({"interrupt_tasks": True} if interrupt_tasks else {}),
        )
    except KeyError as exc:
        raise HTTPException(
            status_code=404,
            detail=f"PawApp '{app_id}' not found",
        ) from exc
    except PluginBusyError as exc:
        raise HTTPException(status_code=409, detail=exc.detail) from exc
    except MemoryBackendInUseError as exc:
        still_loaded = loader.get_loaded_plugin(app_id) is not None
        raise HTTPException(
            status_code=409,
            detail=memory_in_use_detail(
                app_id,
                exc,
                loaded=still_loaded,
                kind="PawApp",
            ),
        ) from exc
    except Exception as exc:  # noqa: BLE001
        logger.error("PawApp uninstall failed for '%s': %s", app_id, exc)
        raise HTTPException(
            status_code=500,
            detail=f"Uninstall failed: {exc}",
        ) from exc
    still_loaded = loader.get_loaded_plugin(app_id) is not None
    if not report.clean or not report.quiescent or still_loaded:
        raise HTTPException(
            status_code=409,
            detail=unload_http_detail(
                app_id,
                report,
                loaded=still_loaded,
                kind="PawApp",
            ),
        )
    return {"id": app_id, "message": f"PawApp '{app_id}' uninstalled."}


@router.get("/{app_id}/settings")
async def get_pawapp_settings(app_id: str, request: Request) -> Dict[str, Any]:
    """Get settings schema for a PawApp."""
    apps = await _installed_apps_with_runtime(request)
    for app in apps:
        if app["id"] == app_id:
            return {"app_id": app_id, "settings": app.get("settings", [])}
    raise HTTPException(status_code=404, detail=f"PawApp '{app_id}' not found")


@router.get("/{app_id}/static/{file_path:path}")
async def serve_pawapp_static(app_id: str, file_path: str):
    """Serve static files for a PawApp (frontend assets)."""
    # Security: app_id must be a single, non-traversal path segment.
    if not app_id or "/" in app_id or "\\" in app_id or app_id in (".", ".."):
        raise HTTPException(status_code=400, detail="Invalid app id")

    apps_dir = _get_apps_dir()
    app_dir = apps_dir / app_id

    # Security: verify app_dir is actually under apps_dir.
    try:
        if app_dir.resolve().parent != apps_dir.resolve():
            raise HTTPException(status_code=400, detail="Invalid app path")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Invalid app path",
        ) from exc

    if not app_dir.exists():
        raise HTTPException(
            status_code=404,
            detail=f"PawApp '{app_id}' not found",
        )

    # Security: prevent path traversal.
    # Resolve the requested file path and verify it stays inside app_dir.
    requested_path = (app_dir / file_path).resolve()

    if not requested_path.is_relative_to(app_dir.resolve()):
        raise HTTPException(
            status_code=403,
            detail="Access denied",
        )

    if not requested_path.exists() or not requested_path.is_file():
        raise HTTPException(
            status_code=404,
            detail=f"File not found: {file_path}",
        )

    return FileResponse(str(requested_path))
