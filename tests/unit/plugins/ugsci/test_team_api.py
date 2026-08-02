# -*- coding: utf-8 -*-
"""Tests for the UGSci expert-team HTTP boundary."""

from __future__ import annotations

import json
import os
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from plugins.bundle.ugsci.team.api import build_team_router
from plugins.bundle.ugsci.team import custom_store


def _client(resolver) -> TestClient:
    app = FastAPI()
    app.include_router(
        build_team_router(resolver),
        prefix="/api/ugsci/team",
    )
    return TestClient(app)


def test_state_requires_agent_header(tmp_path: Path) -> None:
    client = _client(lambda _agent_id: tmp_path)

    response = client.get("/api/ugsci/team/state")

    assert response.status_code == 400
    assert response.json()["detail"] == "X-Agent-Id header is required"


def test_state_rejects_unknown_agent() -> None:
    client = _client(lambda _agent_id: None)

    response = client.get(
        "/api/ugsci/team/state",
        headers={"X-Agent-Id": "missing"},
    )

    assert response.status_code == 404


def test_state_uses_server_resolved_workspace_and_hides_path(
    tmp_path: Path,
) -> None:
    instance = (
        tmp_path
        / ".qwenpaw"
        / "ugsci_teams"
        / "reservoir-20260730-120000-abcdef"
    )
    instance.mkdir(parents=True)
    (instance / "state.json").write_text(
        json.dumps(
            {
                "current_phase": "dispatch",
                "team_id": "reservoir",
            },
        ),
        encoding="utf-8",
    )
    resolved_agent_ids: list[str] = []

    def resolver(agent_id: str) -> Path:
        resolved_agent_ids.append(agent_id)
        return tmp_path

    client = _client(resolver)
    response = client.get(
        "/api/ugsci/team/state",
        params={"workspace_dir": "/etc"},
        headers={"X-Agent-Id": "agent-a"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert resolved_agent_ids == ["agent-a"]
    assert payload["active"] is True
    assert payload["status"] == "active"
    assert payload["instance_id"] == instance.name
    assert "instance_dir" not in payload
    assert str(tmp_path) not in response.text


def test_invalid_latest_state_is_reported_without_falling_back(
    tmp_path: Path,
) -> None:
    base = tmp_path / ".qwenpaw" / "ugsci_teams"
    older = base / "team-20260729-120000-aaaaaa"
    latest = base / "team-20260730-120000-bbbbbb"
    older.mkdir(parents=True)
    latest.mkdir()
    (older / "state.json").write_text(
        '{"current_phase": "dispatch"}',
        encoding="utf-8",
    )
    (latest / "state.json").write_text("{invalid", encoding="utf-8")
    os.utime(older / "state.json", (100, 100))
    os.utime(latest / "state.json", (200, 200))
    client = _client(lambda _agent_id: tmp_path)

    response = client.get(
        "/api/ugsci/team/state",
        headers={"X-Agent-Id": "agent-a"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "active": False,
        "status": "unreadable",
        "state": {},
        "instance_id": latest.name,
        "error": "state_json_invalid",
    }


def test_latest_state_is_selected_by_time_not_team_name(
    tmp_path: Path,
) -> None:
    base = tmp_path / ".qwenpaw" / "ugsci_teams"
    older = base / "z-team-20260729-120000-aaaaaa"
    latest = base / "a-team-20260730-120000-bbbbbb"
    older.mkdir(parents=True)
    latest.mkdir()
    older_state = older / "state.json"
    latest_state = latest / "state.json"
    older_state.write_text('{"current_phase": "plan"}', encoding="utf-8")
    latest_state.write_text(
        '{"current_phase": "dispatch"}',
        encoding="utf-8",
    )
    os.utime(older_state, (100, 100))
    os.utime(latest_state, (200, 200))
    client = _client(lambda _agent_id: tmp_path)

    response = client.get(
        "/api/ugsci/team/state",
        headers={"X-Agent-Id": "agent-a"},
    )

    assert response.status_code == 200
    assert response.json()["instance_id"] == latest.name


def test_completed_latest_state_never_falls_back_to_older_active(
    tmp_path: Path,
) -> None:
    base = tmp_path / ".qwenpaw" / "ugsci_teams"
    older = base / "old-team"
    latest = base / "new-team"
    older.mkdir(parents=True)
    latest.mkdir()
    (older / "state.json").write_text(
        '{"current_phase":"dispatch","workflow_status":"active"}',
        encoding="utf-8",
    )
    (latest / "state.json").write_text(
        '{"current_phase":"completed","workflow_status":"completed"}',
        encoding="utf-8",
    )
    os.utime(older / "state.json", (100, 100))
    os.utime(latest / "state.json", (200, 200))

    response = _client(lambda _agent_id: tmp_path).get(
        "/api/ugsci/team/state",
        headers={"X-Agent-Id": "agent-a"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "completed"
    assert response.json()["instance_id"] == latest.name


def test_non_object_state_is_reported_as_unreadable(tmp_path: Path) -> None:
    instance = tmp_path / ".qwenpaw" / "ugsci_teams" / "team"
    instance.mkdir(parents=True)
    (instance / "state.json").write_text("[]", encoding="utf-8")

    response = _client(lambda _agent_id: tmp_path).get(
        "/api/ugsci/team/state",
        headers={"X-Agent-Id": "agent-a"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "unreadable"
    assert response.json()["error"] == "state_json_invalid"


def test_explicit_termination_takes_precedence_over_completed_phase(
    tmp_path: Path,
) -> None:
    instance = tmp_path / ".qwenpaw" / "ugsci_teams" / "team"
    instance.mkdir(parents=True)
    (instance / "state.json").write_text(
        json.dumps(
            {
                "current_phase": "completed",
                "workflow_status": "terminated",
                "termination_reason": "conversation_reset",
            },
        ),
        encoding="utf-8",
    )

    response = _client(lambda _agent_id: tmp_path).get(
        "/api/ugsci/team/state",
        headers={"X-Agent-Id": "agent-a"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "terminated"


def test_preset_and_role_responses_have_stable_shape(tmp_path: Path) -> None:
    client = _client(lambda _agent_id: tmp_path)

    teams = client.get("/api/ugsci/team/preset-teams")
    roles = client.get("/api/ugsci/team/roles")

    assert teams.status_code == 200
    assert teams.json()["teams"][0]["id"]
    assert teams.json()["teams"][0]["orchestrationPrompt"]
    assert roles.status_code == 200
    assert {"key", "display_name", "allowed_tools", "skills", "prompt"} <= (
        roles.json()["roles"][0].keys()
    )


def test_custom_team_crud_uses_stable_id_and_complete_definition(
    tmp_path: Path,
    monkeypatch,
) -> None:
    monkeypatch.setattr(custom_store, "_store_dir", lambda: tmp_path)
    client = _client(lambda _agent_id: tmp_path)
    payload = {
        "id": "stable-team",
        "name": "储气库联合研判",
        "description": "Stored on the backend",
        "emoji": "🧪",
        "category": "科研验证",
        "mode": "debate",
        "members": [
            {
                "name": "油藏工程师",
                "role": "油藏分析",
                "agentId": "agent-reservoir",
                "roleKey": "reservoir-engineer",
                "bindingMode": "fixed",
            },
            {
                "name": "完整性评审",
                "role": "风险审查",
                "roleKey": "domain-reviewer",
                "bindingMode": "temporary",
            },
        ],
        "taskTemplate": "评价 {储气库} 的运行风险",
        "successCriteria": "风险均有证据支持",
    }

    created = client.post("/api/ugsci/team/custom", json=payload)
    assert created.status_code == 200
    assert created.json()["team_id"] == "stable-team"

    listed = client.get("/api/ugsci/team/custom")
    assert listed.status_code == 200
    assert listed.json()[0]["description"] == "Stored on the backend"
    assert listed.json()[0]["emoji"] == "🧪"
    assert listed.json()[0]["category"] == "科研验证"
    assert listed.json()[0]["members"][0]["agentId"] == "agent-reservoir"
    assert listed.json()[0]["members"][1]["bindingMode"] == "temporary"

    payload["name"] = "储气库联合研判（更新）"
    updated = client.put("/api/ugsci/team/custom/stable-team", json=payload)
    assert updated.status_code == 200
    detail = client.get("/api/ugsci/team/custom/stable-team")
    assert detail.json()["name"] == "储气库联合研判（更新）"

    deleted = client.delete("/api/ugsci/team/custom/stable-team")
    assert deleted.status_code == 204
    assert client.get("/api/ugsci/team/custom/stable-team").status_code == 404


def test_custom_team_generated_ids_do_not_collide(
    tmp_path: Path,
    monkeypatch,
) -> None:
    monkeypatch.setattr(custom_store, "_store_dir", lambda: tmp_path)
    client = _client(lambda _agent_id: tmp_path)
    payload = {
        "name": "同名专家团",
        "members": [
            {"name": "专家甲", "role": "分析"},
            {"name": "专家乙", "role": "复核"},
        ],
    }

    first = client.post("/api/ugsci/team/custom", json=payload)
    second = client.post("/api/ugsci/team/custom", json=payload)

    assert first.status_code == second.status_code == 200
    assert first.json()["team_id"] != second.json()["team_id"]


def test_custom_team_rejects_unknown_role_key(tmp_path: Path) -> None:
    response = _client(lambda _agent_id: tmp_path).post(
        "/api/ugsci/team/custom",
        json={
            "name": "越权角色测试",
            "members": [
                {
                    "name": "未知专家",
                    "role": "未知角色",
                    "roleKey": "unrestricted-mystery-role",
                },
            ],
        },
    )

    assert response.status_code == 422


def test_corrupt_custom_team_store_is_not_silently_overwritten(
    tmp_path: Path,
    monkeypatch,
) -> None:
    monkeypatch.setattr(custom_store, "_store_dir", lambda: tmp_path)
    store_file = tmp_path / "custom_teams.json"
    store_file.write_text("{broken", encoding="utf-8")

    with pytest.raises(RuntimeError, match="unreadable"):
        custom_store.save_custom_team({"name": "不能覆盖"})

    assert store_file.read_text(encoding="utf-8") == "{broken"


def test_list_team_runs_returns_newest_first(tmp_path: Path) -> None:
    base = tmp_path / ".qwenpaw" / "ugsci_teams"
    for index, status in enumerate(("completed", "active"), start=1):
        instance = base / f"run-{index}"
        instance.mkdir(parents=True)
        (instance / "state.json").write_text(
            json.dumps(
                {
                    "current_phase": "dispatch"
                    if status == "active"
                    else "completed",
                    "workflow_status": status,
                    "team_id": f"team-{index}",
                    "team_name": f"团队 {index}",
                    "team_mode": "pipeline",
                    "task": "测试任务",
                    "created_at_ns": index,
                },
            ),
            encoding="utf-8",
        )

    response = _client(lambda _agent_id: tmp_path).get(
        "/api/ugsci/team/runs",
        headers={"X-Agent-Id": "agent-a"},
    )

    assert response.status_code == 200
    assert [run["team_id"] for run in response.json()] == ["team-2", "team-1"]
