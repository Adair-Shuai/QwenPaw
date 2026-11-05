# -*- coding: utf-8 -*-
"""Unit tests for ``GET /api/healthz``."""
# pylint: disable=redefined-outer-name
from __future__ import annotations

import asyncio
import time
from unittest.mock import MagicMock

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from qwenpaw.app.routers.healthz import router as healthz_router


@pytest.fixture
def app() -> FastAPI:
    return FastAPI()


@pytest.fixture
def client(app: FastAPI) -> TestClient:
    app.include_router(healthz_router, prefix="/api")
    return TestClient(app)


class TestHealthzNotReady:
    """503 when background startup has not completed."""

    def test_returns_503_when_event_not_set(self, app, client):
        app.state.startup_ready = asyncio.Event()
        resp = client.get("/api/healthz")
        assert resp.status_code == 503
        body = resp.json()
        assert body["status"] == "starting"

    def test_returns_503_when_attr_missing(self, client):
        resp = client.get("/api/healthz")
        assert resp.status_code == 503


class TestHealthzReady:
    """200 when background startup completed."""

    def test_returns_200_with_agents(self, app, client):
        event = asyncio.Event()
        event.set()
        app.state.startup_ready = event
        app.state.startup_time = time.time() - 10

        mgr = MagicMock()
        mgr.list_loaded_agents.return_value = [
            "default",
            "qa",
        ]
        app.state.multi_agent_manager = mgr

        resp = client.get("/api/healthz")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"
        assert body["agents_loaded"] == ["default", "qa"]
        assert isinstance(body["uptime_seconds"], float)
        assert body["uptime_seconds"] >= 10

    def test_returns_200_no_manager(self, app, client):
        event = asyncio.Event()
        event.set()
        app.state.startup_ready = event
        app.state.startup_time = time.time()
        app.state.multi_agent_manager = None

        resp = client.get("/api/healthz")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"
        assert body["agents_loaded"] == []


@pytest.mark.parametrize("ready", [False, True])
def test_core_startup_failure_is_terminal_without_private_diagnostics(
    app,
    client,
    ready,
):
    app.state.startup_ready = asyncio.Event()
    if ready:
        app.state.startup_ready.set()
    app.state.startup_failed = True
    app.state.bundled_plugins_status = {"error": "private configuration"}
    response = client.get("/api/healthz")
    assert response.status_code == 500
    assert response.json() == {
        "status": "failed",
        "detail": "Core startup failed",
    }


def test_optional_plugin_failure_does_not_fail_core_readiness(app, client):
    app.state.startup_ready = asyncio.Event()
    app.state.startup_ready.set()
    app.state.bundled_plugins_status = {
        "state": "error",
        "error": "optional failed",
    }
    assert client.get("/api/healthz").status_code == 200


def test_startup_receipt_is_atomic_per_launch_and_contains_only_outcome(
    tmp_path,
    monkeypatch,
):
    import json
    from qwenpaw.app.startup_receipt import publish_startup_outcome

    receipt = tmp_path / "current-launch.json"
    monkeypatch.setenv("QWENPAW_STARTUP_RECEIPT", str(receipt))
    for status in ("starting", "restart", "starting", "failed", "ready"):
        publish_startup_outcome(status)
        assert json.loads(receipt.read_text(encoding="utf-8")) == {
            "status": status,
        }
        assert not receipt.with_suffix(".tmp").exists()
    next_launch = tmp_path / "next-launch.json"
    monkeypatch.setenv("QWENPAW_STARTUP_RECEIPT", str(next_launch))
    publish_startup_outcome("starting")
    assert json.loads(receipt.read_text(encoding="utf-8"))["status"] == "ready"
    assert (
        json.loads(next_launch.read_text(encoding="utf-8"))["status"]
        == "starting"
    )
