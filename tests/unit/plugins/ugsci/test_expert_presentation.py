# -*- coding: utf-8 -*-
"""Real HTTP and storage regression for display-only expert metadata."""

import importlib.util
import json
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[4]


@pytest.fixture(
    params=["plugins/bundle/ugsci", "src/qwenpaw/plugins_bundle/ugsci"],
)
def setup(request, tmp_path, monkeypatch):
    spec = importlib.util.spec_from_file_location(
        "expert_presentation_under_test",
        ROOT / request.param / "expert_presentation.py",
    )
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    workspaces = {key: tmp_path / key for key in ["a", "b"]}
    for workspace in workspaces.values():
        workspace.mkdir()
        (workspace / "PROFILE.md").write_text("原有角色提示词", encoding="utf-8")
        (workspace / "agent.json").write_text(
            '{"name":"original"}',
            encoding="utf-8",
        )
    from qwenpaw.config import utils as config_utils

    config_path = tmp_path / "config.json"
    config_path.write_text(
        json.dumps(
            {
                "agents": {
                    "profiles": {
                        key: {
                            "id": key,
                            "name": key,
                            "workspace_dir": str(workspace),
                        }
                        for key, workspace in workspaces.items()
                    },
                },
            },
        ),
        encoding="utf-8",
    )
    monkeypatch.setattr(config_utils, "get_config_path", lambda: config_path)
    monkeypatch.setattr(config_utils, "_config_cache", None)
    monkeypatch.setattr(config_utils, "_config_mtime", None)
    app = FastAPI()
    app.include_router(
        module.build_expert_presentation_router(),
        prefix="/experts",
    )
    return TestClient(app), workspaces


def test_display_metadata_roundtrip_preserves_prompts_and_agent_isolation(
    setup,
):
    client, workspaces = setup
    initial = client.get("/experts/a/presentation").json()
    assert initial["revision"] == 0
    edited = {
        **initial,
        "display_name": "库存评价",
        "category": "油气工程",
        "summary": "检查资料与计算结果",
    }
    result = client.put("/experts/a/presentation", json=edited)
    assert result.status_code == 200
    assert result.json()["revision"] == 1
    assert client.get("/experts/a/presentation").json() == result.json()
    assert client.get("/experts/b/presentation").json() == initial
    saved = json.loads(
        (workspaces["a"] / "ugsci/expert-card.json").read_text("utf-8"),
    )
    assert saved == result.json()
    assert (workspaces["a"] / "PROFILE.md").read_text("utf-8") == "原有角色提示词"
    assert (workspaces["a"] / "agent.json").read_text(
        "utf-8",
    ) == '{"name":"original"}'


def test_display_metadata_rejects_stale_invalid_and_unknown_updates(setup):
    client, workspaces = setup
    body = client.get("/experts/a/presentation").json()
    with ThreadPoolExecutor(2) as pool:
        responses = list(
            pool.map(
                lambda _: client.put("/experts/a/presentation", json=body),
                range(2),
            ),
        )
    assert sorted(r.status_code for r in responses) == [200, 409], [
        (r.status_code, r.text) for r in responses
    ]
    snapshot = (workspaces["a"] / "ugsci/expert-card.json").read_bytes()
    assert (
        client.put(
            "/experts/a/presentation",
            json={**body, "category": "不存在"},
        ).status_code
        == 422
    )
    assert (
        client.put(
            "/experts/a/presentation",
            json={**body, "summary": "x" * 181},
        ).status_code
        == 422
    )
    assert (
        client.put(
            "/experts/a/presentation",
            json={**body, "tools": {}},
        ).status_code
        == 422
    )
    assert (
        client.put("/experts/missing/presentation", json=body).status_code
        == 404
    )
    assert (
        workspaces["a"] / "ugsci/expert-card.json"
    ).read_bytes() == snapshot


def test_display_metadata_corruption_is_not_silently_overwritten(setup):
    client, workspaces = setup
    path = workspaces["a"] / "ugsci/expert-card.json"
    path.parent.mkdir()
    path.write_text("broken-json", encoding="utf-8")
    assert client.get("/experts/a/presentation").status_code == 500
    assert (
        client.put("/experts/a/presentation", json={"revision": 0}).status_code
        == 500
    )
    assert path.read_text("utf-8") == "broken-json"
