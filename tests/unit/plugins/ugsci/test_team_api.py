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


@pytest.mark.parametrize(
    "invalid_fields",
    [
        {"mode": "not-a-team-mode"},
        {"members": {}},
        {"steps": "not-a-list"},
        {"version": "not-an-integer"},
        {"updated_at": -1},
    ],
)
def test_custom_team_list_isolates_invalid_record_in_valid_json_store(
    tmp_path: Path,
    monkeypatch,
    invalid_fields: dict[str, object],
) -> None:
    """One malformed record must not take the healthy team list down."""
    monkeypatch.setattr(custom_store, "_store_dir", lambda: tmp_path)
    (tmp_path / "custom_teams.json").write_text(
        json.dumps(
            {
                "healthy-team": {
                    "team_id": "healthy-team",
                    "name": "正常团队",
                    "mode": "pipeline",
                    "members": [],
                    "version": 1,
                },
                "broken-team": {
                    "team_id": "broken-team",
                    "name": "损坏团队",
                    "mode": "pipeline",
                    "members": [],
                    "version": 1,
                    **invalid_fields,
                },
            },
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    client = _client(lambda _agent_id: tmp_path)

    listed = client.get("/api/ugsci/team/custom")
    assert listed.status_code == 200
    assert [team["team_id"] for team in listed.json()] == ["healthy-team"]
    assert client.get("/api/ugsci/team/custom/broken-team").status_code == 404


def test_custom_team_write_refuses_store_with_invalid_record(
    tmp_path: Path,
    monkeypatch,
) -> None:
    """Writes must not silently drop an isolated malformed record."""
    monkeypatch.setattr(custom_store, "_store_dir", lambda: tmp_path)
    (tmp_path / "custom_teams.json").write_text(
        json.dumps(
            {
                "broken-team": {
                    "team_id": "broken-team",
                    "name": "损坏团队",
                    "members": {},
                },
            },
        ),
        encoding="utf-8",
    )
    client = _client(lambda _agent_id: tmp_path)

    response = client.post(
        "/api/ugsci/team/custom",
        json={"name": "新团队"},
    )
    assert response.status_code == 503
    assert "unreadable" in response.json()["detail"]

    delete_response = client.delete("/api/ugsci/team/custom/broken-team")
    assert delete_response.status_code == 503
    assert "unreadable" in delete_response.json()["detail"]


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


def test_custom_team_rejects_stale_concurrent_update(
    tmp_path: Path,
    monkeypatch,
) -> None:
    monkeypatch.setattr(custom_store, "_store_dir", lambda: tmp_path)
    client = _client(lambda _agent_id: tmp_path)
    payload = {
        "id": "versioned-team",
        "name": "版本保护团队",
        "members": [
            {"name": "专家甲", "role": "分析"},
            {"name": "专家乙", "role": "复核"},
        ],
    }

    assert (
        client.post("/api/ugsci/team/custom", json=payload).status_code == 200
    )
    version = client.get("/api/ugsci/team/custom/versioned-team").json()[
        "version"
    ]
    first_update = {**payload, "name": "先到的更新", "expectedVersion": version}
    assert (
        client.put(
            "/api/ugsci/team/custom/versioned-team",
            json=first_update,
        ).status_code
        == 200
    )

    stale_update = {**payload, "name": "过期窗口的更新", "expectedVersion": version}
    response = client.put(
        "/api/ugsci/team/custom/versioned-team",
        json=stale_update,
    )
    assert response.status_code == 409


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


def test_custom_team_list_recovers_from_last_good_backup(
    tmp_path: Path,
    monkeypatch,
) -> None:
    monkeypatch.setattr(custom_store, "_store_dir", lambda: tmp_path)
    client = _client(lambda _agent_id: tmp_path)
    payload = {
        "id": "backup-team",
        "name": "备份版本",
        "members": [{"name": "专家甲", "role": "分析"}],
    }
    assert (
        client.post("/api/ugsci/team/custom", json=payload).status_code == 200
    )
    payload["name"] = "当前版本"
    assert (
        client.post("/api/ugsci/team/custom", json=payload).status_code == 200
    )

    store_file = tmp_path / "custom_teams.json"
    store_file.write_text("{broken", encoding="utf-8")
    response = client.get("/api/ugsci/team/custom")

    assert response.status_code == 200
    assert response.json()[0]["name"] == "备份版本"
    assert (
        json.loads(store_file.read_text(encoding="utf-8"))["backup-team"][
            "name"
        ]
        == "备份版本"
    )


def test_custom_team_write_reports_corrupt_store_as_503(
    tmp_path: Path,
    monkeypatch,
) -> None:
    monkeypatch.setattr(custom_store, "_store_dir", lambda: tmp_path)
    store_file = tmp_path / "custom_teams.json"
    store_file.write_text("{broken", encoding="utf-8")

    response = _client(lambda _agent_id: tmp_path).post(
        "/api/ugsci/team/custom",
        json={"name": "不能覆盖"},
    )

    assert response.status_code == 503
    assert "unreadable" in response.json()["detail"]
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


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("iteration", "oops"),
        ("members", {}),
        ("task", []),
    ],
)
def test_list_team_runs_isolates_invalid_typed_state(
    tmp_path: Path,
    field: str,
    value,
) -> None:
    """One malformed run is reported without breaking the whole endpoint."""
    base = tmp_path / ".qwenpaw" / "ugsci_teams"
    invalid = base / "invalid-run"
    valid = base / "valid-run"
    invalid.mkdir(parents=True)
    valid.mkdir(parents=True)

    invalid_state = {
        "current_phase": "dispatch",
        "workflow_status": "active",
        "team_id": "invalid",
        "created_at_ns": 2,
        field: value,
    }
    valid_state = {
        "current_phase": "completed",
        "workflow_status": "completed",
        "team_id": "valid",
        "created_at_ns": 1,
    }
    (invalid / "state.json").write_text(
        json.dumps(invalid_state),
        encoding="utf-8",
    )
    (valid / "state.json").write_text(
        json.dumps(valid_state),
        encoding="utf-8",
    )

    response = _client(lambda _agent_id: tmp_path).get(
        "/api/ugsci/team/runs",
        headers={"X-Agent-Id": "agent-a"},
    )

    assert response.status_code == 200
    runs = response.json()
    invalid_run = next(
        run for run in runs if run["instance_id"] == "invalid-run"
    )
    assert invalid_run == {
        "instance_id": "invalid-run",
        "team_id": "",
        "team_name": "",
        "team_mode": "pipeline",
        "status": "unreadable",
        "current_phase": "plan",
        "iteration": 0,
        "task": "",
        "created_at_ns": 0,
        "finished_at_ns": 0,
    }
    valid_run = next(run for run in runs if run["instance_id"] == "valid-run")
    assert valid_run["team_id"] == "valid"
