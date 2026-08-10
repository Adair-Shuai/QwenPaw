# -*- coding: utf-8 -*-
"""Tests for the unified UGSci capability health endpoint."""

from __future__ import annotations

from pathlib import Path
from types import SimpleNamespace

from fastapi import FastAPI
from fastapi.testclient import TestClient

from plugins.bundle.ugsci import health_api


def test_health_endpoint_returns_complete_capability_snapshot(
    monkeypatch,
) -> None:
    plugin_dir = Path(health_api.__file__).parent
    monkeypatch.setattr(
        health_api,
        "list_engines_with_probes",
        lambda: [
            {
                "schema_version": 1,
                "engine": {"id": "well-log-processing", "name": "测井数据处理"},
                "dependency_status": {
                    "overall": "unavailable",
                    "dependencies": [
                        {
                            "name": "lasio",
                            "status": "unavailable",
                            "reason": "Package 'lasio' not found",
                            "install_hint": "python -m pip install lasio",
                            "enable_hint": "安装后重新检测",
                        },
                    ],
                },
                "checked_at": "2026-08-10T00:00:00Z",
            },
        ],
    )
    monkeypatch.setattr(
        health_api,
        "list_engines",
        lambda: [
            SimpleNamespace(
                id="eclipse",
                name="Eclipse",
                status="detected",
                version="2025.1",
                license_status="ok",
            ),
        ],
    )
    app = FastAPI()
    app.include_router(
        health_api.build_health_router(plugin_dir),
        prefix="/api/ugsci",
    )

    response = TestClient(app).get("/api/ugsci/health")

    assert response.status_code == 200
    data = response.json()
    assert data["plugin"]["id"] == "ugsci"
    assert data["plugin"]["version"]
    assert data["plugin"]["status"] == "degraded"
    assert data["summary"]["tool_count"] == 37
    assert data["summary"]["route_count"] >= 8
    assert data["summary"]["detected_simulation_engine_count"] == 1
    assert data["dependencies"][0]["install_hint"]
    assert {tool["group"] for tool in data["tools"]} == {
        "domain",
        "genui",
        "simulation",
        "visualization",
    }
    assert not any(
        key in str(data)
        for key in ("executable_path", "install_dir", "module_paths")
    )
