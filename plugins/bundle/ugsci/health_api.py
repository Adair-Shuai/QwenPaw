# -*- coding: utf-8 -*-
"""Unified health snapshot for UGSci routes, tools, dependencies, and engines."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter

from .domain_engine.service import list_engines_with_probes
from .engine.manager import list_engines
from .tool_manifest import load_tool_manifest

_ROUTES = (
    "/api/ugsci/team",
    "/api/ugsci/engines",
    "/api/ugsci/avatar",
    "/api/ugsci/sim",
    "/api/ugsci/domain-engines",
    "/api/ugsci/genui",
    "/api/ugsci/docs",
    "/api/ugsci/health",
)


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _dependency_snapshot(
    domain_engines: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    dependencies: dict[str, dict[str, Any]] = {}
    for item in domain_engines:
        for dependency in item.get("dependency_status", {}).get(
            "dependencies",
            [],
        ):
            name = dependency.get("name")
            if not isinstance(name, str) or not name:
                continue
            current = dependencies.get(name)
            if current is None or current.get("status") == "available":
                dependencies[name] = dependency
    return [dependencies[name] for name in sorted(dependencies)]


def build_health_snapshot(plugin_dir: Path) -> dict[str, Any]:
    """Build one read-only health response without exposing local paths."""
    manifest = json.loads((plugin_dir / "plugin.json").read_text(encoding="utf-8"))
    tool_specs = load_tool_manifest(plugin_dir)
    domain_engines = list_engines_with_probes()
    dependencies = _dependency_snapshot(domain_engines)
    simulation_engines = [
        {
            "id": engine.id,
            "name": engine.name,
            "status": engine.status,
            "version": engine.version,
            "license_status": engine.license_status,
        }
        for engine in list_engines()
    ]
    unavailable_dependencies = sum(
        dependency.get("status") == "unavailable"
        for dependency in dependencies
    )
    unknown_dependencies = sum(
        dependency.get("status") == "unknown"
        for dependency in dependencies
    )
    detected_engines = sum(
        engine["status"] == "detected" for engine in simulation_engines
    )

    return {
        "schema_version": 1,
        "plugin": {
            "id": manifest.get("id", "ugsci"),
            "name": manifest.get("name", "UGSci"),
            "version": manifest.get("version", "unknown"),
            "status": (
                "degraded"
                if unavailable_dependencies or unknown_dependencies
                else "healthy"
            ),
        },
        "checked_at": _utc_now_iso(),
        "summary": {
            "route_count": len(_ROUTES),
            "tool_count": len(tool_specs),
            "dependency_count": len(dependencies),
            "unavailable_dependency_count": unavailable_dependencies,
            "unknown_dependency_count": unknown_dependencies,
            "domain_engine_count": len(domain_engines),
            "simulation_engine_count": len(simulation_engines),
            "detected_simulation_engine_count": detected_engines,
        },
        "routes": [
            {"path": path, "status": "configured"} for path in _ROUTES
        ],
        "tools": [
            {
                "name": spec.name,
                "group": spec.group,
                "enabled_by_default": spec.enabled_by_default,
                "tool_type": spec.tool_type,
                "status": "declared",
            }
            for spec in tool_specs
        ],
        "dependencies": dependencies,
        "domain_engines": domain_engines,
        "simulation_engines": simulation_engines,
    }


def build_health_router(plugin_dir: Path) -> APIRouter:
    router = APIRouter()

    @router.get("/health")
    def health_endpoint() -> dict[str, Any]:
        return build_health_snapshot(plugin_dir)

    return router


__all__ = ["build_health_router", "build_health_snapshot"]
