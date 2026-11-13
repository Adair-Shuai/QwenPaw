# -*- coding: utf-8 -*-
"""Explicit/manual component update endpoints."""

from __future__ import annotations

import asyncio

from fastapi import APIRouter, HTTPException, Request

from ...components.service import (
    configured_service,
    queue_all_component_updates,
    queue_component_update,
)
from ...components.update import ComponentUpdateError

router = APIRouter(prefix="/components", tags=["components"])


@router.get("/updates")
async def check_component_updates():
    service = configured_service()
    if service is None:
        return {"enabled": False, "updates": []}
    try:
        updates = await asyncio.to_thread(service.check)
        return {
            "enabled": True,
            "updates": updates,
            "compatible_desktop_version": getattr(
                service,
                "compatible_desktop_version",
                None,
            ),
        }
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=502,
            detail=f"Component update check failed: {exc}",
        ) from exc
    finally:
        service.client.close()


@router.post("/updates/install")
async def install_all_component_updates():
    """Queue all available managed updates for the next safe startup."""
    try:
        return await asyncio.to_thread(queue_all_component_updates)
    except ComponentUpdateError as exc:
        raise HTTPException(
            status_code=409,
            detail={"reason": exc.reason, "message": str(exc)},
        ) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=502,
            detail=f"Component update queue failed: {exc}",
        ) from exc


@router.post("/{component}/install")
async def install_component_update(component: str):
    # Component data may be actively mutated by a loaded plugin.  Until the
    # runtime lifecycle can unload/reload a plugin around the whole snapshot,
    # only the pre-PluginLoader startup path may replace component files.
    try:
        return await asyncio.to_thread(queue_component_update, component)
    except ComponentUpdateError as exc:
        raise HTTPException(
            status_code=409,
            detail={"reason": exc.reason, "message": str(exc)},
        ) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=502,
            detail=f"Component update queue failed: {exc}",
        ) from exc


@router.post("/{component}/update")
async def update_plugin_component(component: str, request: Request):
    """Hot-load compatible plugins, downloading the rest for restart."""
    from ...components.runtime_updates import update_component
    from ...plugins.dependency_upgrade import DependencyUpgradeRequired

    try:
        return await update_component(
            component, getattr(request.app.state, "plugin_loader", None),
        )
    except DependencyUpgradeRequired as exc:
        return {
            "component": component,
            "queued": False,
            "dependency_operation": exc.operation,
        }
    except ComponentUpdateError as exc:
        raise HTTPException(
            status_code=409, detail={"reason": exc.reason, "message": str(exc)},
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502, detail=f"Plugin update failed: {exc}",
        ) from exc
