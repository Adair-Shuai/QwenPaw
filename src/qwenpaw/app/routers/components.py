# -*- coding: utf-8 -*-
"""Explicit/manual component update endpoints."""

from __future__ import annotations

import asyncio

from fastapi import APIRouter, HTTPException

from ...components.service import configured_service
from ...components.update import ComponentUpdateError

router = APIRouter(prefix="/components", tags=["components"])


@router.get("/updates")
async def check_component_updates():
    service = configured_service()
    if service is None:
        return {"enabled": False, "updates": []}
    try:
        return {"enabled": True, "updates": await asyncio.to_thread(service.check)}
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Component update check failed: {exc}") from exc
    finally:
        service.client.close()


@router.post("/{component}/install")
async def install_component_update(component: str):
    service = configured_service()
    if service is None:
        raise HTTPException(status_code=409, detail="Component updates are not configured")
    try:
        return await asyncio.to_thread(service.install, component)
    except ComponentUpdateError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Component update failed: {exc}") from exc
    finally:
        service.client.close()
