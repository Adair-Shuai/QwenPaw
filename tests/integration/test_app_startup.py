# -*- coding: utf-8 -*-
"""Integration smoke tests for app startup and console."""
from __future__ import annotations

import pytest


@pytest.mark.integration
@pytest.mark.p0
def test_api_version_ok(app_server) -> None:
    """Test purpose:
    - Verify the basic version endpoint is available after startup, as the
      minimum readiness signal for integration tests.

    Test flow:
    1. Request the version endpoint.
    2. Assert status code is 200.
    3. Assert the response contains a non-empty string version.

    API endpoints:
    - GET /api/version
    """
    response = app_server.api_request("GET", "/api/version")
    assert response.status_code == 200, app_server.logs_tail()
    payload = response.json()
    assert "version" in payload
    assert isinstance(payload["version"], str)
    assert payload["version"].strip()


@pytest.mark.integration
@pytest.mark.p0
def test_startup_status_is_public_and_structured(app_server) -> None:
    """The desktop splash must receive real, machine-readable progress."""
    response = app_server.api_request("GET", "/api/startup/status")
    assert response.status_code == 200, app_server.logs_tail()
    payload = response.json()
    assert isinstance(payload["ready"], bool)
    assert isinstance(payload["stage"], str)
    assert isinstance(payload["message"], str)
    assert 0 <= payload["progress"] <= 100
    assert payload["elapsed_seconds"] >= 0


@pytest.mark.integration
@pytest.mark.p1
def test_console_entry_or_fallback_ok(app_server) -> None:
    """Test purpose:
    - Verify the console entry returns predictable behavior across build
      variants (either a working HTML page or an explicit fallback).

    Test flow:
    1. Request /console/.
    2. If status is 200, assert HTML content-type and HTML body markers.
    3. If status is 404, request / and assert a clear JSON fallback message.

    API endpoints:
    - GET /console/
    - GET /
    """
    response = app_server.api_request("GET", "/console/")
    if response.status_code == 200:
        content_type = response.headers.get("content-type", "").lower()
        assert "text/html" in content_type
        body = response.text
        assert body.strip()
        assert "<!doctype html>" in body.lower() or "<html" in body.lower()
        return

    # Source installs without prebuilt frontend currently return 404 at
    # /console/. In this case, "/" should still expose a clear fallback
    # message instead of crashing.
    assert response.status_code == 404, app_server.logs_tail()
    root_response = app_server.api_request("GET", "/")
    assert root_response.status_code == 200, app_server.logs_tail()
    fallback = root_response.json()
    assert "message" in fallback
    assert "web console is not available" in fallback["message"]
