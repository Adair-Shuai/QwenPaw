# -*- coding: utf-8 -*-
"""HTTP API for UGSci computation-engine management."""

from __future__ import annotations

import json
import threading
import time
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field


class EngineRequest(BaseModel):
    """Request body for creating or updating an engine."""

    name: str = ""
    vendor: str = ""
    version: str = ""
    executable_path: str = ""
    install_dir: str = ""
    category: str = ""
    description: str = ""
    invocation_hint: str = ""
    license_server: str = ""
    extra_paths: list[str] = Field(default_factory=list)
    modules: list[str] = Field(default_factory=list)
    module_paths: dict[str, str] = Field(default_factory=dict)


def build_engine_router(plugin_dir: Path) -> APIRouter:
    """Build the engine router, including its detection-result cache."""
    router = APIRouter()
    cache_ttl = 300
    detect_cache: dict[str, Any] = {
        "data": None,
        "ts": 0.0,
        "lock": threading.Lock(),
    }

    def invalidate_detect_cache() -> None:
        with detect_cache["lock"]:
            detect_cache["data"] = None
            detect_cache["ts"] = 0.0

    @router.get("/list")
    def list_engines_endpoint() -> dict[str, Any]:
        from . import engines_to_list, list_engines

        return {"engines": engines_to_list(list_engines())}

    @router.get("/summary")
    def capability_summary_endpoint() -> dict[str, str]:
        from . import build_capability_summary, list_engines

        return {"summary": build_capability_summary(list_engines())}

    @router.post("/detect")
    def detect_engines_endpoint() -> dict[str, Any]:
        from . import detect_engines, engines_to_list

        now = time.time()
        cached = detect_cache["data"]
        if cached is not None and now - detect_cache["ts"] < cache_ttl:
            return {"engines": cached}

        with detect_cache["lock"]:
            cached = detect_cache["data"]
            if cached is not None and time.time() - detect_cache["ts"] < cache_ttl:
                return {"engines": cached}
            result = {"engines": engines_to_list(detect_engines())}
            detect_cache["data"] = result["engines"]
            detect_cache["ts"] = time.time()
            return result

    @router.post("/detect/refresh")
    def detect_engines_refresh_endpoint() -> dict[str, Any]:
        from . import detect_engines, engines_to_list

        with detect_cache["lock"]:
            result = {"engines": engines_to_list(detect_engines())}
            detect_cache["data"] = result["engines"]
            detect_cache["ts"] = time.time()
            return result

    @router.get("/icon/{engine_id}")
    def get_engine_icon(engine_id: str):
        icon_dir = plugin_dir / "engine" / "icons"
        sub_product = ""
        engine_json = plugin_dir / "engines" / f"{engine_id}.json"
        if engine_json.is_file():
            try:
                data = json.loads(engine_json.read_text(encoding="utf-8"))
                sub_product = data.get("extra_info", {}).get("sub_product", "") or ""
            except (OSError, UnicodeDecodeError, json.JSONDecodeError):
                pass

        candidates: list[str] = []
        if sub_product:
            candidates.extend(
                [
                    f"{sub_product}_icon.png",
                    f"{sub_product}_icon.jpg",
                    f"{sub_product}.png",
                ],
            )
            product_prefix = sub_product.split("_")[0]
            if product_prefix and product_prefix != sub_product:
                candidates.extend(
                    [
                        f"{product_prefix}_icon.png",
                        f"{product_prefix}_icon.jpg",
                        f"{product_prefix}.png",
                        f"{product_prefix.capitalize()}_icon.png",
                        f"{product_prefix.lower()}_icon.png",
                    ],
                )

        candidates.extend(
            [
                f"{engine_id}_icon.png",
                f"{engine_id}_icon.jpg",
                f"{engine_id}.png",
                f"{engine_id.capitalize()}_icon.png",
                f"{engine_id.capitalize()}_icon.jpg",
                f"{engine_id.upper()}_icon.png",
                f"{engine_id.upper()}_icon.jpg",
            ],
        )
        for name in dict.fromkeys(candidates):
            icon_path = icon_dir / name
            if icon_path.is_file():
                media_type = (
                    "image/jpeg"
                    if icon_path.suffix.lower() in {".jpg", ".jpeg"}
                    else "image/png"
                )
                return FileResponse(
                    str(icon_path),
                    media_type=media_type,
                    headers={"Cache-Control": "public, max-age=86400"},
                )
        raise HTTPException(status_code=404, detail="Icon not found")

    @router.get("/{engine_id}")
    def get_engine_endpoint(engine_id: str) -> dict[str, Any]:
        from . import get_engine, to_dict

        engine = get_engine(engine_id)
        if engine is None:
            raise HTTPException(status_code=404, detail="Engine not found")
        return to_dict(engine)

    @router.post("/")
    def add_engine_endpoint(body: EngineRequest) -> dict[str, Any]:
        from . import add_engine, to_dict

        try:
            engine = add_engine(body.model_dump())
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        invalidate_detect_cache()
        return to_dict(engine)

    @router.put("/{engine_id}")
    def update_engine_endpoint(
        engine_id: str,
        body: EngineRequest,
    ) -> dict[str, Any]:
        from . import to_dict, update_engine

        try:
            engine = update_engine(engine_id, body.model_dump())
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        invalidate_detect_cache()
        return to_dict(engine)

    @router.delete("/{engine_id}")
    def delete_engine_endpoint(engine_id: str) -> dict[str, Any]:
        from . import delete_engine

        try:
            success = delete_engine(engine_id)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        invalidate_detect_cache()
        return {"success": success}

    return router


__all__ = ["EngineRequest", "build_engine_router"]
