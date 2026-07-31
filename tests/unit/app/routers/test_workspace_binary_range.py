# -*- coding: utf-8 -*-
"""Focused tests for authenticated workspace binary range responses."""

# pylint: disable=protected-access,redefined-outer-name

from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from qwenpaw.app.routers import workspace as workspace_router


@pytest.fixture
def binary_client(tmp_path, monkeypatch):
    roots = {
        "agent-a": tmp_path / "agent-a",
        "agent-b": tmp_path / "agent-b",
    }
    for root in roots.values():
        root.mkdir()

    async def get_workspace(request, agent_id=None):
        selected = agent_id or request.headers.get("X-Agent-Id", "agent-a")
        return SimpleNamespace(
            agent_id=selected,
            workspace_dir=roots[selected],
        )

    monkeypatch.setattr(
        workspace_router,
        "get_agent_for_request",
        get_workspace,
    )
    monkeypatch.setattr(
        workspace_router,
        "get_coding_dir",
        lambda workspace: workspace.workspace_dir,
    )

    app = FastAPI()
    app.include_router(workspace_router.router)
    return TestClient(app), roots


def test_binary_full_response_advertises_range_support(binary_client):
    client, roots = binary_client
    content = b"0123456789"
    (roots["agent-a"] / "clip.mp4").write_bytes(content)

    response = client.get("/workspace/binary-files/clip.mp4")

    assert response.status_code == 200
    assert response.content == content
    assert response.headers["accept-ranges"] == "bytes"
    assert response.headers["content-length"] == str(len(content))
    assert "content-range" not in response.headers


@pytest.mark.parametrize(
    ("range_header", "expected", "content_range"),
    [
        ("bytes=2-5", b"2345", "bytes 2-5/10"),
        ("bytes=7-", b"789", "bytes 7-9/10"),
        ("bytes=-3", b"789", "bytes 7-9/10"),
        ("bytes=8-99", b"89", "bytes 8-9/10"),
    ],
)
def test_binary_single_range_response(
    binary_client,
    range_header,
    expected,
    content_range,
):
    client, roots = binary_client
    (roots["agent-a"] / "clip.mp4").write_bytes(b"0123456789")

    response = client.get(
        "/workspace/binary-files/clip.mp4",
        headers={"Range": range_header},
    )

    assert response.status_code == 206
    assert response.content == expected
    assert response.headers["accept-ranges"] == "bytes"
    assert response.headers["content-range"] == content_range
    assert response.headers["content-length"] == str(len(expected))


@pytest.mark.parametrize(
    "range_header",
    [
        "items=0-1",
        "bytes=",
        "bytes=abc-def",
        "bytes=0-1,4-5",
        "bytes=8-7",
        "bytes=10-20",
        "bytes=-0",
    ],
)
def test_binary_invalid_or_unsatisfied_range_returns_416(
    binary_client,
    range_header,
):
    client, roots = binary_client
    (roots["agent-a"] / "clip.mp4").write_bytes(b"0123456789")

    response = client.get(
        "/workspace/binary-files/clip.mp4",
        headers={"Range": range_header},
    )

    assert response.status_code == 416
    assert response.headers["accept-ranges"] == "bytes"
    assert response.headers["content-range"] == "bytes */10"


def test_binary_range_uses_requested_agent_workspace(binary_client):
    client, roots = binary_client
    (roots["agent-a"] / "same.mp4").write_bytes(b"AAAA")
    (roots["agent-b"] / "same.mp4").write_bytes(b"BBBB")

    response = client.get(
        "/workspace/binary-files/same.mp4",
        headers={"X-Agent-Id": "agent-b", "Range": "bytes=1-2"},
    )

    assert response.status_code == 206
    assert response.content == b"BB"
    assert response.headers["content-range"] == "bytes 1-2/4"


def test_binary_media_query_uses_requested_agent_workspace(binary_client):
    client, roots = binary_client
    (roots["agent-a"] / "same.mp4").write_bytes(b"AAAA")
    (roots["agent-b"] / "same.mp4").write_bytes(b"BBBB")

    response = client.get(
        "/workspace/binary-files/same.mp4?agent_id=agent-b",
        headers={"Range": "bytes=1-2"},
    )

    assert response.status_code == 206
    assert response.content == b"BB"


def test_binary_size_limits_vary_by_resource_category():
    assert workspace_router._binary_file_size_limit("video/mp4") > (
        workspace_router._binary_file_size_limit("image/png")
    )
    assert workspace_router._binary_file_size_limit("application/pdf") > (
        workspace_router._BINARY_FILE_MAX_BYTES
    )
