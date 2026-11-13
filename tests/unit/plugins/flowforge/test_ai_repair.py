# -*- coding: utf-8 -*-
"""Failure repair uses recorded evidence and the normal proposal lifecycle."""

# pylint: disable=protected-access
import asyncio
import copy
import importlib
import json
import time
from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from test_authoring_service import RecordingModel


@pytest.fixture(
    name="environment",
    params=["qwenpaw.plugins_bundle", "plugins.bundle"],
)
def _environment_fixture(request, tmp_path):
    package = f"{request.param}.flowforge"
    service_module = importlib.import_module(f"{package}.service")
    router_module = importlib.import_module(f"{package}.router")
    repair_module = importlib.import_module(f"{package}.repair")
    service = service_module.WorkflowService(flows_dir=tmp_path)
    app = FastAPI()
    app.include_router(router_module.build_router(service))
    with TestClient(app) as client:
        yield service, client, service_module, repair_module
    service.close(timeout=3)


def _document():
    return {
        "id": "repair-flow",
        "name": "修复验收",
        "nodes": {
            "compute": {
                "class_type": "ScriptNode",
                "label": "失败计算",
                "inputs": {
                    "source": "result = 10 / amount",
                    "inputs": {"amount": 0},
                },
            },
            "output": {
                "class_type": "OutputNode",
                "inputs": {"value": ["compute", 0]},
            },
        },
        "outputs": ["output"],
    }


def _record_failure(service, saved, **fields):
    return service._execution_repository.create(
        "repair-run",
        saved["id"],
        **{
            "agent_id": "default",
            "flow_revision": saved["revision"],
            "flow_snapshot": saved,
            "status": "failed",
            "node_statuses": {"compute": "failed"},
            "execution_history": [
                {
                    "node_id": "compute",
                    "status": "failed",
                    "error": "division by zero",
                    "metadata": {"inputs": {"amount": 0, "enabled": False}},
                },
            ],
            **fields,
        },
    )


def _body(saved, **fields):
    return {
        "prompt": "修复失败节点",
        "flow": saved,
        "selected_node_ids": ["compute"],
        "repair_run_id": "repair-run",
        "repair_node_id": "compute",
        **fields,
    }


def test_real_failure_repair_redacts_evidence_and_applies_current_draft(
    environment,
):
    service, client, _, _ = environment
    secret = "private-repair-evidence-123456"
    document = _document()
    document["nodes"]["compute"]["inputs"].update(
        source='raise ValueError("invalid amount " + api_key)',
        inputs={
            "amount": 0,
            "enabled": False,
            "nothing": None,
            "api_key": secret,
        },
    )
    saved = service.save_flow(document["id"], document)
    handle = service.start_run(saved["id"])
    deadline = time.monotonic() + 8
    while not handle.is_done and time.monotonic() < deadline:
        time.sleep(0.01)
    assert handle.is_done and handle.status.value == "failed"
    record_path = service._execution_repository.root / f"{handle.run_id}.json"
    original_bytes = record_path.read_bytes()
    draft = copy.deepcopy(saved)
    draft["description"] = "保留未保存的业务修改"
    draft["nodes"]["output"]["label"] = "新的输出名称"

    def answer(request):
        candidate = copy.deepcopy(request["current_flow"])
        candidate["nodes"]["compute"]["inputs"]["source"] = (
            "result = {'amount': amount, "
            "'enabled': enabled, 'nothing': nothing}"
        )
        return json.dumps(
            {
                "flow": candidate,
                "explanation": f"已记录失败输入。修正计算。{secret}",
            },
        )

    model = RecordingModel(answer)
    service.executor.llm_service = model
    response = client.post(
        "/authoring/proposals",
        json=_body(draft, repair_run_id=handle.run_id),
    )
    assert response.status_code == 200, response.text
    proposal = response.json()
    assert proposal["validation"]["ok"], proposal["validation"]
    sent = json.loads(model.messages[1].content)
    context = sent["repair_context"]
    assert context["run_id"] == handle.run_id
    assert context["flow_revision"] == 1
    assert context["configuration"]["inputs"]["source"].startswith("raise")
    assert context["inputs_available"] is True
    assert context["inputs"]["inputs"]["amount"] == 0
    assert context["inputs"]["inputs"]["enabled"] is False
    assert context["inputs"]["inputs"]["nothing"] is None
    assert context["outputs_available"] is False
    assert "outputs" not in context
    assert "invalid amount" in context["error"]
    assert context["events"]
    assert all(event["node_id"] == "compute" for event in context["events"])
    assert secret not in model.messages[1].content
    assert secret not in json.dumps(proposal["repair_context"])
    assert secret not in proposal["explanation"]
    assert proposal["flow"]["description"] == draft["description"]
    assert proposal["flow"]["nodes"]["output"] == draft["nodes"]["output"]
    assert service.get_flow(saved["id"]) == saved
    assert record_path.read_bytes() == original_bytes
    applied = client.post(
        f"/authoring/proposals/{proposal['proposal_id']}/apply",
        json={"expected_revision": 1},
    )
    assert applied.status_code == 200, applied.text
    assert applied.json()["revision"] == 2
    assert applied.json()["description"] == draft["description"]
    assert (
        applied.json()["nodes"]["compute"]["inputs"]["inputs"]["api_key"]
        == secret
    )
    assert record_path.read_bytes() == original_bytes


@pytest.mark.parametrize(
    "problem,expected",
    [
        ("missing_run", 404),
        ("different_agent", 422),
        ("different_flow", 422),
        ("missing_observation", 422),
        ("successful_node", 422),
        ("deleted_node", 422),
        ("missing_run_id", 422),
        ("missing_node_id", 422),
    ],
)
def test_repair_rejects_invalid_sources_before_model(
    environment,
    problem,
    expected,
):
    service, client, _, _ = environment
    saved = service.save_flow("repair-flow", _document())
    record = _record_failure(service, saved)
    body = _body(copy.deepcopy(saved))
    if problem == "missing_run":
        body["repair_run_id"] = "missing-run"
    elif problem == "different_agent":
        service._execution_repository.update(
            record["run_id"],
            agent_id="other",
        )
        body["agent_id"] = "other"
    elif problem == "different_flow":
        service._execution_repository.update(record["run_id"], flow_id="other")
    elif problem == "missing_observation":
        service._execution_repository.update(
            record["run_id"],
            flow_snapshot={},
            node_statuses={},
            execution_history=[],
        )
    elif problem == "successful_node":
        service._execution_repository.update(
            record["run_id"],
            node_statuses={"compute": "success"},
        )
    elif problem == "deleted_node":
        del body["flow"]["nodes"]["compute"]
        body["selected_node_ids"] = None
    elif problem == "missing_run_id":
        del body["repair_run_id"]
    elif problem == "missing_node_id":
        del body["repair_node_id"]
    model = RecordingModel()
    service.executor.llm_service = model
    response = client.post(
        "/authoring/proposals",
        json=body,
        headers={"X-Agent-Id": "default"},
    )
    assert response.status_code == expected, response.text
    assert not model.messages
    assert service.get_flow(saved["id"]) == saved


def test_repair_context_survives_followups_and_rejects_another_source(
    environment,
):
    service, client, _, _ = environment
    saved = service.save_flow("repair-flow", _document())
    _record_failure(service, saved)
    model = RecordingModel(lambda request: request["current_flow"])
    service.executor.llm_service = model
    first = client.post("/authoring/proposals", json=_body(saved)).json()
    original_context = first["repair_context"]
    service._execution_repository.update(
        "repair-run",
        execution_history=[],
        events=[],
    )
    followup = _body(saved, parent_proposal_id=first["proposal_id"])
    followup.pop("repair_run_id")
    followup.pop("repair_node_id")
    second = client.post("/authoring/proposals", json=followup)
    assert second.status_code == 200, second.text
    assert second.json()["repair_context"] == original_context
    assert json.loads(model.messages[1].content)["repair_context"] == (
        original_context
    )
    changed = client.post(
        "/authoring/proposals",
        json={
            **followup,
            "repair_run_id": "other",
            "repair_node_id": "compute",
        },
    )
    assert changed.status_code == 409


def test_repair_bounds_recorded_data_and_preserves_missing_observations(
    environment,
):
    service, client, _, _ = environment
    saved = service.save_flow("repair-flow", _document())
    large = "中文-data-" * 16000
    _record_failure(
        service,
        saved,
        execution_history=[],
        outputs={"compute": "workflow output alias"},
        events=[
            {
                "type": "node_error",
                "node_id": "compute",
                "state": {"status": "failed", "error": large},
            }
            for _ in range(60)
        ],
    )
    model = RecordingModel(lambda request: request["current_flow"])
    service.executor.llm_service = model
    result = client.post("/authoring/proposals", json=_body(saved))
    assert result.status_code == 200, result.text
    context = result.json()["repair_context"]
    assert context["inputs_available"] is False
    assert context["outputs_available"] is False
    assert "inputs" not in context and "outputs" not in context
    assert context["error"]["truncated"] is True
    assert context["error"]["original_json_chars"] > 100000
    assert len(context["events"]) == 30
    assert len(json.dumps(context, ensure_ascii=False)) < 100000
    assert "workflow output alias" not in json.dumps(context)


@pytest.mark.parametrize("output", [0, False, None, []])
def test_repair_preserves_recorded_falsy_outputs(environment, output):
    service, _, _, module = environment
    saved = service.save_flow("repair-flow", _document())

    async def record(_run_id):
        return {
            "flow_id": saved["id"],
            "agent_id": "default",
            "node_statuses": {"compute": "timeout"},
            "node_details": {
                "compute": {
                    "outputs": output,
                    "inputs_available": True,
                    "inputs": {"amount": 0, "enabled": False},
                },
            },
        }

    context = asyncio.run(
        module.build_repair_context(
            SimpleNamespace(get_public_run_record=record),
            saved,
            "default",
            "legacy-run",
            "compute",
        ),
    )
    assert context["outputs_available"] is True
    assert context["outputs"] == output
    assert type(context["outputs"]) is type(output)
    assert context["inputs"]["amount"] == 0
    assert context["inputs"]["enabled"] is False
