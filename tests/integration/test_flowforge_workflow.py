# -*- coding: utf-8 -*-
"""Integration tests for the FlowForge plugin REST API + run lifecycle.

Uses FastAPI TestClient directly against a minimal app that mounts only
the FlowForge router (no full QwenPaw subprocess needed). This keeps the
tests fast and hermetic while still exercising the real HTTP layer.

Covered endpoints:
  - GET    /api/flowforge/health
  - GET    /api/flowforge/node-types
  - POST   /api/flowforge/flows
  - GET    /api/flowforge/flows
  - GET    /api/flowforge/flows/{id}
  - PUT    /api/flowforge/flows/{id}
  - DELETE /api/flowforge/flows/{id}
  - POST   /api/flowforge/flows/validate
  - POST   /api/flowforge/flows/{id}/run
  - GET    /api/flowforge/runs
  - GET    /api/flowforge/runs/{run_id}
  - POST   /api/flowforge/runs/{run_id}/cancel
  - GET    /api/flowforge/runs/{run_id}/events (SSE)
"""

from __future__ import annotations

import asyncio
import json
import time
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from plugins.bundle.flowforge.engine import WorkflowExecutor
from plugins.bundle.flowforge.router import build_router
from plugins.bundle.flowforge.service import WorkflowService


# ──────────────────────────────────────────────────────────────────────────────
# Fixtures
# ──────────────────────────────────────────────────────────────────────────────


@pytest.fixture
def flowforge_app(tmp_path: Path):
    """Build a minimal FastAPI app with only the FlowForge router mounted."""
    service = WorkflowService(
        flows_dir=tmp_path / "flows",
        executor=WorkflowExecutor(),
    )
    app = FastAPI(title="FlowForge Test")
    app.include_router(build_router(service), prefix="/api/flowforge")
    return app, service


@pytest.fixture
def client(flowforge_app):
    app, _ = flowforge_app
    return TestClient(app)


@pytest.fixture
def service(flowforge_app):
    _, svc = flowforge_app
    return svc


# ──────────────────────────────────────────────────────────────────────────────
# Health + node types
# ──────────────────────────────────────────────────────────────────────────────


def test_health(client):
    resp = client.get("/api/flowforge/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "flows_dir" in data


def test_node_types(client):
    resp = client.get("/api/flowforge/node-types")
    assert resp.status_code == 200
    types = resp.json()
    class_types = {t["class_type"] for t in types}
    assert {"InputNode", "OutputNode", "ToolNode", "AgentNode",
            "ConditionNode", "LLMNode", "CodeNode"}.issubset(class_types)
    for t in types:
        assert "display_name" in t
        assert "inputs_schema" in t


# ──────────────────────────────────────────────────────────────────────────────
# Flow CRUD
# ──────────────────────────────────────────────────────────────────────────────


def _linear_flow(flow_id: str = "linear") -> dict:
    return {
        "id": flow_id,
        "name": "Linear Flow",
        "description": "in → out",
        "nodes": {
            "in": {"class_type": "InputNode", "inputs": {"name": "query"}},
            "out": {"class_type": "OutputNode", "inputs": {"value": ["in", 0]}},
        },
        "outputs": ["out"],
    }


def test_create_and_get_flow(client):
    resp = client.post("/api/flowforge/flows", json=_linear_flow("f1"))
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == "f1"
    assert "in" in data["nodes"]
    assert "out" in data["nodes"]

    # GET it back
    resp = client.get("/api/flowforge/flows/f1")
    assert resp.status_code == 200
    assert resp.json()["id"] == "f1"


def test_list_flows(client):
    client.post("/api/flowforge/flows", json=_linear_flow("f2"))
    client.post("/api/flowforge/flows", json=_linear_flow("f3"))
    resp = client.get("/api/flowforge/flows")
    assert resp.status_code == 200
    ids = {f["id"] for f in resp.json()}
    assert "f2" in ids
    assert "f3" in ids


def test_update_flow(client):
    client.post("/api/flowforge/flows", json=_linear_flow("f4"))
    updated = _linear_flow("f4")
    updated["name"] = "Updated Name"
    resp = client.put("/api/flowforge/flows/f4", json=updated)
    assert resp.status_code == 200
    assert resp.json()["name"] == "Updated Name"


def test_delete_flow(client):
    client.post("/api/flowforge/flows", json=_linear_flow("f5"))
    resp = client.delete("/api/flowforge/flows/f5")
    assert resp.status_code == 200
    assert resp.json()["deleted"] is True
    # Subsequent GET should 404
    resp = client.get("/api/flowforge/flows/f5")
    assert resp.status_code == 404


def test_get_missing_flow_404(client):
    resp = client.get("/api/flowforge/flows/nonexistent")
    assert resp.status_code == 404


def test_validate_flow_endpoint(client):
    resp = client.post("/api/flowforge/flows/validate", json=_linear_flow("f6"))
    assert resp.status_code == 200
    data = resp.json()
    assert data["ok"] is True
    assert "out" in data["output_nodes"]


def test_validate_flow_with_errors(client):
    bad = {
        "id": "bad",
        "nodes": {
            "n1": {"class_type": "OutputNode", "inputs": {"value": ["ghost", 0]}},
        },
        "outputs": ["n1"],
    }
    resp = client.post("/api/flowforge/flows/validate", json=bad)
    assert resp.status_code == 200
    data = resp.json()
    assert data["ok"] is False
    assert any("ghost" in e for e in data["errors"])


# ──────────────────────────────────────────────────────────────────────────────
# Run lifecycle
# ──────────────────────────────────────────────────────────────────────────────


def test_run_linear_flow(client):
    client.post("/api/flowforge/flows", json=_linear_flow("r1"))
    resp = client.post(
        "/api/flowforge/runs/r1/run" if False else "/api/flowforge/flows/r1/run",
        json={"inputs": {"query": "hello"}},
    )
    assert resp.status_code == 200
    run_id = resp.json()["run_id"]

    # The async run completes almost instantly (no I/O). Poll for completion.
    deadline = time.time() + 5.0
    while time.time() < deadline:
        status = client.get(f"/api/flowforge/runs/{run_id}").json()
        if status["status"] in ("completed", "failed", "cancelled"):
            break
        time.sleep(0.05)
    final = client.get(f"/api/flowforge/runs/{run_id}").json()
    assert final["status"] == "completed"
    assert final["outputs"]["out"] == "hello"


def test_run_missing_flow_404(client):
    resp = client.post("/api/flowforge/flows/nonexistent/run", json={"inputs": {}})
    assert resp.status_code == 404


def test_list_runs(client):
    client.post("/api/flowforge/flows", json=_linear_flow("r2"))
    client.post("/api/flowforge/flows/r2/run", json={"inputs": {"query": "a"}})
    client.post("/api/flowforge/flows/r2/run", json={"inputs": {"query": "b"}})
    # Wait briefly for runs to register
    time.sleep(0.2)
    resp = client.get("/api/flowforge/runs")
    assert resp.status_code == 200
    runs = resp.json()
    assert len(runs) >= 2


def test_get_missing_run_404(client):
    resp = client.get("/api/flowforge/runs/nonexistent")
    assert resp.status_code == 404


def test_cancel_run(client, service):
    """Cancel a long-running run."""
    async def slow(**kw):
        await asyncio.sleep(10)
        return "never"

    # Inject the slow callable into the executor's tool registry so the
    # flow document itself stays JSON-serialisable (uses tool_name).
    service.executor.tool_registry = {"slow_tool": slow}

    slow_flow = {
        "id": "slow",
        "name": "Slow",
        "nodes": {
            "tool": {"class_type": "ToolNode", "tool_name": "slow_tool", "inputs": {}},
            "out": {"class_type": "OutputNode", "inputs": {"value": ["tool", 0]}},
        },
        "outputs": ["out"],
    }
    client.post("/api/flowforge/flows", json=slow_flow)
    resp = client.post("/api/flowforge/flows/slow/run", json={"inputs": {}})
    run_id = resp.json()["run_id"]

    # Give it a moment to start, then cancel.
    time.sleep(0.3)
    cancel_resp = client.post(f"/api/flowforge/runs/{run_id}/cancel")
    assert cancel_resp.status_code == 200


# ──────────────────────────────────────────────────────────────────────────────
# SSE event stream
# ──────────────────────────────────────────────────────────────────────────────


def test_sse_event_stream(client):
    client.post("/api/flowforge/flows", json=_linear_flow("sse1"))
    resp = client.post(
        "/api/flowforge/flows/sse1/run",
        json={"inputs": {"query": "stream"}},
    )
    run_id = resp.json()["run_id"]
    # The run completes almost instantly; SSE should at least emit the
    # replay history + a terminal event. Use a short timeout.
    with client.stream(
        "GET", f"/api/flowforge/runs/{run_id}/events",
    ) as stream:
        seen_types: list[str] = []
        deadline = time.time() + 5.0
        for line in stream.iter_lines():
            if time.time() > deadline:
                break
            if line.startswith("data: "):
                try:
                    payload = json.loads(line[6:])
                    seen_types.append(payload.get("type", ""))
                except json.JSONDecodeError:
                    pass
                if any(t.startswith("execution_") for t in seen_types):
                    break
    # We should have seen at least execution_start (replayed from history).
    assert any("execution" in t for t in seen_types)


# ──────────────────────────────────────────────────────────────────────────────
# Plugin manifest sanity
# ──────────────────────────────────────────────────────────────────────────────


def test_plugin_manifest_loads():
    import json
    from pathlib import Path

    manifest_path = (
        Path(__file__).resolve().parents[2]
        / "plugins" / "bundle" / "flowforge" / "plugin.json"
    )
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    assert data["id"] == "flowforge"
    assert data["entry"]["frontend"] == "ui/dist/index.js"
    assert data["entry"]["backend"] == "plugin.py"
    assert "workflow-engine" in data["meta"]["category"]
