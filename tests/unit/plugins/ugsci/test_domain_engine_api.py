# -*- coding: utf-8 -*-
"""Tests for the domain engine HTTP API."""

# pylint: disable=redefined-outer-name

from __future__ import annotations

import json

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from plugins.bundle.ugsci.domain_engine.api import build_domain_engine_router


@pytest.fixture
def client() -> TestClient:
    app = FastAPI()
    router = build_domain_engine_router()
    app.include_router(router, prefix="/api/ugsci/domain-engines")
    return TestClient(app)


class TestDomainEngineAPI:
    def test_list_returns_full_engine_catalog(
        self,
        client: TestClient,
    ) -> None:
        resp = client.get("/api/ugsci/domain-engines/list")
        assert resp.status_code == 200
        data = resp.json()
        assert "engines" in data
        assert len(data["engines"]) == 14

    def test_list_engines_have_schema_version(
        self,
        client: TestClient,
    ) -> None:
        resp = client.get("/api/ugsci/domain-engines/list")
        data = resp.json()
        for engine_data in data["engines"]:
            assert engine_data["schema_version"] == 1
            assert "engine" in engine_data
            assert "dependency_status" in engine_data
            assert "checked_at" in engine_data

    def test_get_single_engine(self, client: TestClient) -> None:
        resp = client.get("/api/ugsci/domain-engines/well-log-processing")
        assert resp.status_code == 200
        data = resp.json()
        assert data["engine"]["id"] == "well-log-processing"
        assert data["engine"]["name"] == "测井数据处理"

    def test_get_nonexistent_returns_404(self, client: TestClient) -> None:
        resp = client.get("/api/ugsci/domain-engines/nonexistent")
        assert resp.status_code == 404

    def test_probe_all(self, client: TestClient) -> None:
        resp = client.post("/api/ugsci/domain-engines/probe")
        assert resp.status_code == 200
        data = resp.json()
        assert "results" in data
        assert len(data["results"]) == 14
        for result in data["results"]:
            assert "engine_id" in result
            assert "overall" in result
            assert result["overall"] in ("available", "unavailable", "unknown")

    def test_probe_single(self, client: TestClient) -> None:
        resp = client.post("/api/ugsci/domain-engines/decline-analysis/probe")
        assert resp.status_code == 200
        data = resp.json()
        assert data["engine_id"] == "decline-analysis"
        assert "overall" in data

    def test_probe_nonexistent_returns_404(self, client: TestClient) -> None:
        resp = client.post("/api/ugsci/domain-engines/nonexistent/probe")
        assert resp.status_code == 404

    def test_api_response_no_absolute_paths(self, client: TestClient) -> None:
        """Ensure API responses don't leak absolute paths or env vars."""
        resp = client.get("/api/ugsci/domain-engines/list")
        serialized = json.dumps(resp.json())
        assert "/Users/" not in serialized
        assert "/home/" not in serialized
        # Should not contain env var values
        assert "JAVA_HOME" not in serialized

    def test_dependency_status_in_response(self, client: TestClient) -> None:
        resp = client.get("/api/ugsci/domain-engines/well-log-processing")
        data = resp.json()
        dep_status = data["dependency_status"]
        assert "overall" in dep_status
        assert "dependencies" in dep_status
        for dep in dep_status["dependencies"]:
            assert "name" in dep
            assert "status" in dep
            assert dep["status"] in ("available", "unavailable", "unknown")
            assert "install_hint" in dep
            assert "enable_hint" in dep

    def test_checked_at_is_iso_format(self, client: TestClient) -> None:
        resp = client.get("/api/ugsci/domain-engines/list")
        data = resp.json()
        for engine_data in data["engines"]:
            checked_at = engine_data["checked_at"]
            assert "T" in checked_at
            assert checked_at.endswith("Z")
