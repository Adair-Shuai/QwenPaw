# -*- coding: utf-8 -*-
"""Real storage, HTTP ownership and AgentScope calls for declarative Run \
views."""
from __future__ import annotations

import copy
import importlib
import json
import sqlite3
from concurrent.futures import ThreadPoolExecutor
from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from .test_run_center import (
    RunRepository,
    build_router,
    repository_module,
    _legacy_store,
)

presentation = importlib.import_module("test_run_center_runtime.presentation")


def plan():
    return {
        "version": 1,
        "task_type": "simulation",
        "layout": "tabs",
        "title": "产气与压力",
        "objective": "监测生产井趋势",
        "panels": [
            {
                "id": "curves",
                "kind": "curves",
                "options": {"series_ids": ["WGPR:WELL-A"]},
            },
            {
                "id": "pressure",
                "kind": "fields",
                "options": {"property": "PRESSURE"},
            },
        ],
    }


@pytest.fixture(name="environment")
def _environment_fixture(tmp_path, monkeypatch):
    from qwenpaw.app import agent_context
    import qwenpaw.config.utils

    monkeypatch.setattr(repository_module, "_working_dir", lambda: tmp_path)
    config = SimpleNamespace(
        agents=SimpleNamespace(
            active_agent="default",
            profiles={
                "default": SimpleNamespace(enabled=True),
                "other": SimpleNamespace(enabled=True),
                "disabled": SimpleNamespace(enabled=False),
            },
        ),
    )
    monkeypatch.setattr(agent_context, "load_config", lambda: config)
    monkeypatch.setattr(qwenpaw.config.utils, "load_config", lambda: config)
    monkeypatch.setattr(
        agent_context,
        "get_current_agent_id",
        lambda: "default",
    )
    monkeypatch.setattr(agent_context, "get_current_session_id", lambda: "")
    monkeypatch.setattr(agent_context, "get_current_user_id", lambda: "")
    repository = RunRepository(tmp_path / "run-center")
    repository.create_run(
        {
            "run_id": "native",
            "operation": "simulation.run",
            "status": "running",
            "agent_id": "default",
            "command": ["private-solver"],
            "output_dir": "private-folder",
        },
    )

    class Manager:
        async def get_agent(self, agent_id):
            return SimpleNamespace(agent_id=agent_id)

    app = FastAPI()
    app.state.multi_agent_manager = Manager()
    app.include_router(build_router(repository), prefix="/api/run-center")
    return repository, TestClient(app), tmp_path


def test_http_plan_persists_without_changing_run_and_projects_true_binding_ids(
    environment,
):
    repository, client, root = environment
    database = root / "ugsci/simulation-results/results.sqlite3"
    database.parent.mkdir(parents=True)
    with sqlite3.connect(database) as conn:
        conn.execute(
            "CREATE TABLE results (run_id TEXT PRIMARY KEY, "
            "revision INTEGER, payload TEXT)",
        )
        conn.execute(
            "INSERT INTO results VALUES (?, ?, ?)",
            (
                "native",
                7,
                json.dumps(
                    {
                        "series": [
                            {
                                "id": "WGPR:WELL-A",
                                "label": "WGPR",
                                "unit": "SM3/D",
                                "well": "WELL-A",
                                "points": [{"time": 1, "value": 123456789}],
                            },
                        ],
                        "metrics": [
                            {
                                "id": "current_step",
                                "label": "报告步",
                                "unit": None,
                                "points": [],
                            },
                        ],
                        "fields": {"datasets": [{"properties": ["PRESSURE"]}]},
                    },
                ),
            ),
        )
    before = repository.get_run("native")
    with sqlite3.connect(repository.database) as conn:
        before_changes = conn.execute(
            "SELECT COUNT(*) FROM run_presentation_events",
        ).fetchone()[0]
    result_bytes = database.read_bytes()
    initial = client.get("/api/run-center/runs/native/presentation")
    assert initial.status_code == 200
    data = initial.json()
    assert data["plan"] is None and data["revision"] == 0
    assert data["context"]["bindings"]["series"] == [
        {
            "id": "WGPR:WELL-A",
            "label": "WGPR",
            "unit": "SM3/D",
            "well": "WELL-A",
        },
    ]
    assert data["context"]["bindings"]["properties"] == ["PRESSURE"]
    assert "123456789" not in initial.text and "private-" not in initial.text
    assert database.read_bytes() == result_bytes
    with sqlite3.connect(repository.database) as conn:
        assert (
            conn.execute(
                "SELECT COUNT(*) FROM run_presentation_events",
            ).fetchone()[0]
            == before_changes
        )
    stored = client.put(
        "/api/run-center/runs/native/presentation",
        json={"plan": plan(), "expected_revision": 0},
    )
    assert stored.status_code == 200 and stored.json()["revision"] == 1
    assert stored.json()["event"]["type"] == "run.presentation.updated"
    after = repository.get_run("native")
    # A nonterminal display event advances observable freshness only.
    assert {k: v for k, v in after.items() if k != "updated_at"} == {
        k: v for k, v in before.items() if k != "updated_at"
    }
    assert (
        repository.list_events("native")[-1]["type"]
        == "run.presentation.updated"
    )
    reloaded = RunRepository(root / "run-center")
    saved = presentation.PresentationStore(reloaded).get(
        reloaded.get_run("native"),
    )
    assert saved["plan"] == plan() and saved["revision"] == 1
    assert (
        client.put(
            "/api/run-center/runs/native/presentation",
            json={"plan": plan(), "expected_revision": 0},
        ).status_code
        == 409
    )


def test_terminal_legacy_plans_keep_events_and_execution(
    environment,
):
    repository, client, root = environment
    repository.transition("native", "succeeded")
    run_before = repository.get_run("native")
    events_before = repository.list_events("native")
    _legacy_store(root, payload={"status": "completed", "agent_id": "default"})
    legacy_db = root / "ugsci/jobs.sqlite3"
    legacy_bytes = legacy_db.read_bytes()
    assert (
        client.put(
            "/api/run-center/runs/native/presentation",
            json={"plan": plan()},
        ).status_code
        == 200
    )
    legacy = client.put(
        "/api/run-center/runs/ugsci:legacy-1/presentation",
        json={"plan": plan()},
    )
    assert (
        legacy.status_code == 200
        and legacy.json()["run_id"] == "ugsci:legacy-1"
    )
    assert (
        client.get("/api/run-center/runs/legacy-1/presentation").json()[
            "revision"
        ]
        == 1
    )
    assert repository.get_run("native") == run_before
    assert repository.list_events("native") == events_before
    assert legacy_db.read_bytes() == legacy_bytes
    with sqlite3.connect(repository.database) as conn:
        assert (
            conn.execute(
                "SELECT COUNT(*) FROM run_presentation_events",
            ).fetchone()[0]
            == 2
        )


def test_http_ownership_checks_host_agent_and_legacy_owner(
    environment,
):
    repository, client, root = environment
    repository.create_run(
        {"run_id": "other-run", "operation": "analysis", "agent_id": "other"},
    )
    repository.create_run({"run_id": "unowned", "operation": "analysis"})
    _legacy_store(root, payload={"status": "completed", "agent_id": "other"})
    for method in (
        client.get,
        lambda url, **kwargs: client.put(url, json={"plan": plan()}, **kwargs),
    ):
        assert (
            method(
                "/api/run-center/runs/native/presentation",
                headers={"X-Agent-Id": "fake"},
            ).status_code
            == 404
        )
        assert (
            method(
                "/api/run-center/runs/native/presentation",
                headers={"X-Agent-Id": "disabled"},
            ).status_code
            == 403
        )
        assert (
            method(
                "/api/run-center/runs/native/presentation",
                headers={"X-Agent-Id": "other"},
            ).status_code
            == 404
        )
        assert (
            method("/api/run-center/runs/other-run/presentation").status_code
            == 404
        )
        assert (
            method(
                "/api/run-center/runs/ugsci:legacy-1/presentation",
            ).status_code
            == 404
        )
        assert (
            method(
                "/api/run-center/runs/unowned/presentation",
                headers={"X-Agent-Id": "other"},
            ).status_code
            == 404
        )
        assert (
            method("/api/run-center/runs/missing/presentation").status_code
            == 404
        )
    assert (
        client.get(
            "/api/run-center/runs/ugsci:legacy-1/presentation",
            headers={"X-Agent-Id": "other"},
        ).status_code
        == 200
    )
    assert (
        client.get("/api/run-center/runs/unowned/presentation").status_code
        == 200
    )


def test_native_simulation_scope_maps_source_and_allows_new_chat(
    environment,
    monkeypatch,
):
    from qwenpaw.app import agent_context

    repository, client, root = environment
    repository.create_run(
        {
            "run_id": "bridged",
            "source_run_id": "source-job",
            "operation": "simulation.run",
        },
    )
    _legacy_store(
        root,
        job_id="source-job",
        payload={
            "status": "running",
            "agent_id": "other",
            "session_id": "session-a",
        },
    )
    assert (
        client.get("/api/run-center/runs/bridged/presentation").status_code
        == 404
    )
    assert (
        client.get(
            "/api/run-center/runs/bridged/presentation",
            headers={"X-Agent-Id": "other"},
        ).status_code
        == 200
    )
    monkeypatch.setattr(
        agent_context,
        "get_current_session_id",
        lambda: "session-b",
    )
    assert (
        client.get(
            "/api/run-center/runs/bridged/presentation",
            headers={"X-Agent-Id": "other"},
        ).status_code
        == 200
    )


def test_native_simulator_legacy_alias_shares_one_presentation_identity(
    environment,
):
    repository, client, root = environment
    run_id = "sim_123456789abc"
    repository.create_run(
        {
            "run_id": run_id,
            "operation": "simulation.run",
            "agent_id": "default",
        },
    )
    _legacy_store(
        root,
        job_id=run_id,
        payload={"status": "running", "agent_id": "default"},
    )
    native = f"/api/run-center/runs/{run_id}/presentation"
    alias = f"/api/run-center/runs/ugsci:{run_id}/presentation"
    saved = client.put(native, json={"plan": plan(), "expected_revision": 0})
    assert saved.status_code == 200 and saved.json()["run_id"] == run_id
    from_alias = client.get(alias).json()
    assert (
        from_alias["run_id"] == run_id
        and from_alias["revision"] == 1
        and from_alias["plan"] == plan()
    )
    revised = plan()
    revised["title"] = "跨入口保持同一个方案"
    changed = client.put(alias, json={"plan": revised, "expected_revision": 1})
    assert changed.status_code == 200 and changed.json()["run_id"] == run_id
    from_native = client.get(native).json()
    assert from_native["revision"] == 2 and from_native["plan"] == revised
    assert (
        presentation.owned_run(repository, f"ugsci:{run_id}", "default")[
            "run_id"
        ]
        == run_id
    )
    with sqlite3.connect(repository.database) as conn:
        assert conn.execute(
            "SELECT run_id, revision FROM run_presentations",
        ).fetchall() == [(run_id, 2)]


@pytest.mark.parametrize(
    "mutation",
    [
        lambda p: p.update(extra="injected"),
        lambda p: p.update(version=True),
        lambda p: p.update(title="<script>alert(1)</script>"),
        lambda p: p.update(title="https://example.com"),
        lambda p: p.update(objective="x" * 1001),
        lambda p: p.update(panels=[]),
        lambda p: p["panels"].append(copy.deepcopy(p["panels"][0])),
        lambda p: p["panels"][0].update(kind="html"),
        lambda p: p["panels"][0].update(values=[123]),
        lambda p: p["panels"][0].update(options={"metric_ids": ["x"]}),
        lambda p: p["panels"][0].update(
            options={"series_ids": ["file:///secret"]},
        ),
        lambda p: p["panels"][0].update(options={"series_ids": [123]}),
        lambda p: p["panels"][0].update(options={"series_ids": ["x"] * 33}),
    ],
)
def test_invalid_plans_fail_before_any_write(environment, mutation):
    repository, client, _ = environment
    invalid = plan()
    mutation(invalid)
    response = client.put(
        "/api/run-center/runs/native/presentation",
        json={"plan": invalid},
    )
    assert response.status_code == 422
    assert (
        client.get("/api/run-center/runs/native/presentation").json()[
            "revision"
        ]
        == 0
    )


def test_real_concurrent_expected_revision_is_atomic(environment):
    repository, _, _ = environment
    store = presentation.PresentationStore(repository)
    run = repository.get_run("native")

    def save(_):
        try:
            return store.put(
                run,
                plan(),
                expected_revision=0,
                agent_id="default",
            )["revision"]
        except presentation.RevisionConflict:
            return "conflict"

    with ThreadPoolExecutor(max_workers=2) as executor:
        values = list(executor.map(save, range(2)))
    assert sorted(map(str, values)) == ["1", "conflict"]
    with sqlite3.connect(repository.database) as conn:
        assert (
            conn.execute(
                "SELECT COUNT(*) FROM run_presentation_events",
            ).fetchone()[0]
            == 1
        )


def test_literal_binding_names_allow_spaces_and_slashes(environment):
    _, client, _ = environment
    selected = plan()
    selected["panels"][0]["options"]["series_ids"] = ["oil rate/WELL A"]
    selected["panels"][1]["options"]["property"] = "pressure / reservoir"
    response = client.put(
        "/api/run-center/runs/native/presentation",
        json={"plan": selected},
    )
    assert response.status_code == 200
    assert response.json()["plan"] == selected


def test_result_stage_bindings_exclude_values_and_private_paths(
    environment,
):
    repository, client, _ = environment
    repository.create_run(
        {
            "run_id": "analysis",
            "operation": "analysis",
            "agent_id": "default",
            "stages": [
                {
                    "stage_id": "fit",
                    "operation": "fit",
                    "metrics": {
                        "loss": {"value": 0.123456789, "label": "拟合误差"},
                        "iterations": 20,
                        "invalid": None,
                    },
                },
            ],
        },
    )
    repository.append_event(
        "analysis",
        "result.ready",
        {"metrics": {"old": 1}},
    )
    repository.append_event(
        "analysis",
        "run.status_changed",
        {
            "result": {
                "metrics": [
                    {"id": "score", "value": 0.987654321, "unit": None},
                    None,
                    {"id": "bad", "value": "fake"},
                ],
                "series": [
                    {
                        "id": "residual / group A",
                        "points": [{"time": 0, "value": 87654321}],
                        "unit": "Pa",
                    },
                    None,
                ],
                "table": {
                    "columns": [
                        "case",
                        {"key": "score", "label": "Score"},
                        None,
                    ],
                    "rows": [["a", 987654321]],
                    "source": "C:/private/secret.csv",
                },
            },
        },
    )
    response = client.get("/api/run-center/runs/analysis/presentation")
    assert response.status_code == 200
    bindings = response.json()["context"]["bindings"]
    assert {item["id"] for item in bindings["metrics"]} == {
        "stage:fit:loss",
        "stage:fit:iterations",
        "score",
    }
    assert bindings["metrics"][0]["unit"] is None
    assert bindings["series"][0]["id"] == "residual / group A"
    assert bindings["tables"][0]["columns"] == [
        {"key": "case", "label": "case"},
        {"key": "score", "label": "Score"},
    ]
    assert not any(
        secret in response.text
        for secret in (
            "0.123456789",
            "0.987654321",
            "87654321",
            "private",
            "rows",
            "points",
        )
    )


def test_generic_metadata_limits_skip_oversized_and_deep_results(environment):
    repository, client, _ = environment
    repository.create_run(
        {"run_id": "deep", "operation": "analysis", "agent_id": "default"},
    )
    repository.append_event("deep", "result.ready", {"metrics": {"old": 1}})
    deep = {"metrics": {"hidden": 5}}
    for _ in range(15):
        deep = {"nested": deep}
    repository.append_event("deep", "result.ready", deep)
    response = client.get("/api/run-center/runs/deep/presentation")
    assert (
        response.status_code == 200
        and response.json()["context"]["bindings"]["metrics"] == []
    )
    repository.append_event(
        "deep",
        "result.ready",
        {
            "metrics": {"huge": 5},
            "untrusted": "x" * (presentation.MAX_CONTEXT_BYTES + 1),
        },
    )
    response = client.get("/api/run-center/runs/deep/presentation")
    assert (
        response.status_code == 200
        and response.json()["context"]["bindings"]["metrics"] == []
    )


def test_result_ready_preserves_outer_bindings_with_nested_result(environment):
    repository, client, _ = environment
    repository.create_run(
        {"run_id": "envelope", "operation": "analysis", "agent_id": "default"},
    )
    repository.append_event(
        "envelope",
        "result.ready",
        {
            "metrics": {
                "rate": {"value": 123456.789, "label": "Envelope rate"},
            },
            "units": {"rate": "SM3/D"},
            "series": [
                {
                    "id": "outer-series",
                    "unit": "Pa",
                    "points": [{"time": 0, "value": 654321.987}],
                },
            ],
            "result": {
                "metrics": {"hidden-inner": 999999},
                "series": [
                    {
                        "id": "inner-series",
                        "points": [{"time": 0, "value": 888888}],
                    },
                ],
                "table": {
                    "columns": ["case", "rate"],
                    "rows": [["A", 777777]],
                },
            },
        },
    )
    response = client.get("/api/run-center/runs/envelope/presentation")
    assert response.status_code == 200
    bindings = response.json()["context"]["bindings"]
    assert bindings["metrics"] == [
        {"id": "rate", "label": "Envelope rate", "unit": "SM3/D"},
    ]
    assert [item["id"] for item in bindings["series"]] == ["outer-series"]
    assert [column["key"] for column in bindings["tables"][0]["columns"]] == [
        "case",
        "rate",
    ]
    assert not any(
        value in response.text
        for value in ("123456.789", "654321.987", "999999", "888888", "777777")
    )


@pytest.mark.asyncio
async def test_agent_tools_register_real_sdk_schemas_and_persist_through_calls(
    environment,
    monkeypatch,
):
    from agentscope.tool import FunctionTool, Toolkit
    from qwenpaw.app import agent_context

    repository, _, _ = environment
    registered = {}
    prompts = []
    presentation.register_presentation_tools(
        SimpleNamespace(
            register_tool=lambda **kwargs: registered.update(
                {kwargs["tool_name"]: kwargs},
            ),
            register_prompt_section=lambda **kwargs: prompts.append(kwargs),
        ),
        repository,
    )
    assert set(registered) == {"get_run_presentation", "set_run_presentation"}
    toolkit = Toolkit()
    for registration in registered.values():
        assert (
            registration["enabled"] and registration["tool_type"] == "internal"
        )
        await toolkit.add_tool(FunctionTool(registration["tool_func"]))
    schemas = await toolkit.get_tool_schemas()
    assert len(schemas) == 2 and "expected_revision" in json.dumps(schemas)
    read_tool = await toolkit.get_tool("get_run_presentation")
    write_tool = await toolkit.get_tool("set_run_presentation")
    read = await read_tool.call(run_id="native")
    read_payload = json.loads(read.content[0].text)
    assert read_payload["ok"] and read_payload["catalog"]
    write = await write_tool.call(
        run_id="native",
        plan=plan(),
        expected_revision=0,
    )
    assert json.loads(write.content[0].text)["revision"] == 1
    monkeypatch.setattr(agent_context, "get_current_agent_id", lambda: "other")
    denied = await read_tool.call(run_id="native")
    assert json.loads(denied.content[0].text) == {
        "ok": False,
        "kind": "run_presentation",
        "error": "Run not found",
    }
    assert "Never invent" in prompts[0]["provider"](None)
