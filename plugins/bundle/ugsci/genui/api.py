"""HTTP API for the global UGSci GenUI feature switch."""

from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from .registration import get_genui_config
from .settings import load_settings, save_settings


class GenUiSettingsUpdate(BaseModel):
    enabled: bool


def _public_config(api=None) -> dict[str, object]:
    persisted = bool(load_settings()["enabled"])
    effective = get_genui_config(api)
    return {
        "enabled": bool(effective["enabled"]),
        "persisted_enabled": persisted,
        "overridden": bool(effective["enabled"]) != persisted,
        "channels": list(effective.get("channels", [])),
        "allow_html": bool(effective.get("allow_html", False)),
        "allow_actions": list(effective.get("allow_actions", [])),
    }


def build_genui_router(api=None) -> APIRouter:
    router = APIRouter()

    @router.get("/config")
    async def get_config() -> dict[str, object]:
        return _public_config(api)

    @router.put("/config")
    async def update_config(body: GenUiSettingsUpdate) -> dict[str, object]:
        save_settings(enabled=body.enabled)
        return _public_config(api)

    return router


__all__ = ["build_genui_router"]
