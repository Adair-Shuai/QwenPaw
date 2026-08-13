# -*- coding: utf-8 -*-
"""Explicit/manual component update endpoints."""

from __future__ import annotations

import asyncio

from fastapi import APIRouter, HTTPException

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
        return {
            "enabled": True,
            "updates": await asyncio.to_thread(service.check),
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
        raise HTTPException(status_code=409, detail=str(exc)) from exc
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
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=502,
            detail=f"Component update queue failed: {exc}",
        ) from exc
