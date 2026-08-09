# -*- coding: utf-8 -*-
"""Domain engine service — combines catalog definitions with probe results."""

from __future__ import annotations

import datetime
from typing import Any

from .catalog import get_engine, list_engines
from .dependency_probe import EngineProbeResult, probe_engine
from .models import DomainEngineDefinition


def _utc_now_iso() -> str:
    """Return current UTC time in ISO 8601 format."""
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def serialize_engine_with_probe(
    engine: DomainEngineDefinition,
    probe_result: EngineProbeResult | None = None,
) -> dict[str, Any]:
    """Serialize an engine definition with its dependency probe result."""
    if probe_result is None:
        probe_result = probe_engine(engine)

    return {
        "schema_version": 1,
        "engine": engine.to_dict(),
        "dependency_status": {
            "overall": probe_result.overall,
            "dependencies": [
                {
                    "name": d.name,
                    "status": d.status,
                    "reason": d.reason,
                }
                for d in probe_result.dependencies
            ],
        },
        "checked_at": _utc_now_iso(),
    }


def list_engines_with_probes() -> list[dict[str, Any]]:
    """List all engines with their dependency probe results."""
    results: list[dict[str, Any]] = []
    for engine in list_engines():
        try:
            results.append(serialize_engine_with_probe(engine))
        except Exception:
            # A single engine failure should not block others
            results.append({
                "schema_version": 1,
                "engine": engine.to_dict(),
                "dependency_status": {"overall": "unknown", "dependencies": []},
                "checked_at": _utc_now_iso(),
            })
    return results


def get_engine_with_probe(engine_id: str) -> dict[str, Any] | None:
    """Get a single engine with its dependency probe result."""
    engine = get_engine(engine_id)
    if engine is None:
        return None
    return serialize_engine_with_probe(engine)
