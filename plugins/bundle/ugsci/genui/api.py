"""HTTP API for the global UGSci GenUI feature switch."""

from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel, Field

from .registration import get_genui_config
from .settings import load_settings, save_freeform_settings, save_settings


class GenUiSettingsUpdate(BaseModel):
    enabled: bool | None = None
    freeform_enabled: bool | None = None
    freeform_max_steps: int | None = Field(default=None, ge=1, le=100)
    freeform_simplify: bool | None = None


def _public_config(api=None) -> dict[str, object]:
    settings = load_settings()
    persisted = bool(settings["enabled"])
    effective = get_genui_config(api)
    return {
        "enabled": bool(effective["enabled"]),
        "persisted_enabled": persisted,
        "overridden": bool(effective["enabled"]) != persisted,
        "channels": list(effective.get("channels", [])),
        "allow_html": bool(effective.get("allow_html", False)),
        "allow_actions": list(effective.get("allow_actions", [])),
        "freeform_enabled": bool(settings["freeform_enabled"]),
        "freeform_max_steps": int(settings["freeform_max_steps"]),
        "freeform_simplify": bool(settings["freeform_simplify"]),
    }


def build_genui_router(api=None) -> APIRouter:
    router = APIRouter()

    @router.get("/config")
    async def get_config() -> dict[str, object]:
        return _public_config(api)

    @router.put("/config")
    async def update_config(body: GenUiSettingsUpdate) -> dict[str, object]:
        if body.enabled is not None:
            save_settings(enabled=body.enabled)
        if (
            body.freeform_enabled is not None
            or body.freeform_max_steps is not None
            or body.freeform_simplify is not None
        ):
            save_freeform_settings(
                freeform_enabled=body.freeform_enabled,
                freeform_max_steps=body.freeform_max_steps,
                freeform_simplify=body.freeform_simplify,
            )
        return _public_config(api)

    return router


__all__ = ["build_genui_router"]
