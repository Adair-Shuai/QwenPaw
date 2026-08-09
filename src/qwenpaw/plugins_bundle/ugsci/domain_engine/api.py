# -*- coding: utf-8 -*-
"""HTTP API for domain engine catalog and dependency probing.

Routes:
    GET  /list           — List all engines with probe results
    GET  /{engine_id}    — Get a single engine with probe result
    POST /probe          — Probe all engines
    POST /{engine_id}/probe — Probe a single engine
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .catalog import get_engine, get_engine_ids, list_engines
from .dependency_probe import probe_engine, probe_engine_by_id
from .service import (
    get_engine_with_probe,
    list_engines_with_probes,
    serialize_engine_with_probe,
)


def build_domain_engine_router() -> APIRouter:
    """Build the domain engine API router."""
    router = APIRouter()

    @router.get("/list")
    def list_endpoint() -> dict[str, Any]:
        """List all domain engines with dependency probe results."""
        return {"engines": list_engines_with_probes()}

    @router.get("/{engine_id}")
    def get_endpoint(engine_id: str) -> dict[str, Any]:
        """Get a single domain engine by ID."""
        result = get_engine_with_probe(engine_id)
        if result is None:
            raise HTTPException(status_code=404, detail=f"Engine not found: {engine_id}")
        return result

    @router.post("/probe")
    def probe_all_endpoint() -> dict[str, Any]:
        """Probe dependencies for all engines."""
        results = []
        for engine in list_engines():
            try:
                probe = probe_engine(engine)
                results.append({
                    "engine_id": engine.id,
                    "overall": probe.overall,
                    "dependencies": [
                        {"name": d.name, "status": d.status, "reason": d.reason}
                        for d in probe.dependencies
                    ],
                })
            except Exception:
                results.append({
                    "engine_id": engine.id,
                    "overall": "unknown",
                    "dependencies": [],
                })
        return {"results": results}

    @router.post("/{engine_id}/probe")
    def probe_single_endpoint(engine_id: str) -> dict[str, Any]:
        """Probe dependencies for a single engine."""
        if engine_id not in get_engine_ids():
            raise HTTPException(status_code=404, detail=f"Engine not found: {engine_id}")
        probe = probe_engine_by_id(engine_id)
        if probe is None:
            raise HTTPException(status_code=404, detail=f"Engine not found: {engine_id}")
        return {
            "engine_id": probe.engine_id,
            "overall": probe.overall,
            "dependencies": [
                {"name": d.name, "status": d.status, "reason": d.reason}
                for d in probe.dependencies
            ],
        }

    return router


__all__ = ["build_domain_engine_router"]
