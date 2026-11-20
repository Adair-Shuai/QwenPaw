# -*- coding: utf-8 -*-
"""Model boundary, transactional versioning and non-mutating AI previews."""

import asyncio
import copy
import json

# pylint: disable-next=E0611
from concurrent.futures import ThreadPoolExecutor
from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from qwenpaw.plugins_bundle.flowforge.authoring import workflow_diff
from qwenpaw.plugins_bundle.flowforge.flow_repository import (
    FlowRepository,
    RevisionConflict,
)
from qwenpaw.plugins_bundle.flowforge.router import build_router
from qwenpaw.plugins_bundle.flowforge.service import WorkflowService


def document(name="Inventory"):
    return {
        "id": "inventory",
        "name": name,
        "nodes": {
            "input": {"class_type": "InputNode", "inputs": {"name": "value"}},
            "output": {
                "class_type": "OutputNode",
                "inputs": {"value": ["input", 0]},
            },
        },
        "edges": [
            {
                "id": "input-output",
                "source": "input",
                "target": "output",
                "target_handle": "value",
            },
        ],
        "start_id": "input",
        "outputs": ["output"],
    }


class RecordingModel:
    def __init__(self, result=None):
        self.result = document() if result is None else result
        self.messages = []

    async def complete(self, **kwargs):
        self.messages = kwargs["messages"]
        result = (
            self.result(json.loads(self.messages[1].content))
            if callable(self.result)
            else self.result
        )
        if isinstance(result, Exception):
            raise result
        return SimpleNamespace(
            content=(
                result
                if isinstance(result, str)
                else json.dumps({"flow": result})
            ),
        )


@pytest.fixture(name="service")
def _service_fixture(tmp_path):
    service = WorkflowService(flows_dir=tmp_path)
    yield service
    service.close(timeout=2)


def client(service):
    app = FastAPI()
    app.include_router(build_router(service))
    return TestClient(app)


def test_model_creation_is_preview_only_and_apply_is_single_use(service):
    model = RecordingModel()
    service.executor.llm_service = model
    proposal = asyncio.run(service.create_proposal("读取库存并输出"))
    assert proposal["validation"]["ok"]
    assert service.list_flows() == []
    context = json.loads(model.messages[1].content)
    ids = {item["class_type"] for item in context["available_nodes"]}
    assert "ConditionNode" in ids and "ParallelNode" not in ids
    assert (
        "SubworkflowNode" in ids
    )  # This branch has a real nested-run service.
    saved = service.apply_proposal(proposal["proposal_id"], 0)
    assert saved["revision"] == 1
    with pytest.raises(RevisionConflict):
        service.apply_proposal(proposal["proposal_id"], 0)


def test_edit_uses_unsaved_canvas_and_rejects_stale_apply(service):
    saved = service.save_flow("inventory", document())
    draft = copy.deepcopy(saved)
    draft["name"] = "unsaved title"
    service.executor.llm_service = RecordingModel(
        lambda request: {**request["current_flow"], "description": "updated"},
    )
    proposal = asyncio.run(service.create_proposal("只修改说明", flow=draft))
    assert proposal["flow"]["name"] == "unsaved title"
    assert proposal["flow"]["id"] == "inventory"
    service.save_flow("inventory", {**saved, "name": "another editor"})
    with pytest.raises(RevisionConflict):
        service.apply_proposal(proposal["proposal_id"], 1)
    assert service.get_flow("inventory")["name"] == "another editor"


def test_unknown_nodes_remain_unappliable(service):
    flow = document()
    flow["nodes"]["output"]["class_type"] = "InventedNode"
    service.executor.llm_service = RecordingModel(flow)
    proposal = asyncio.run(service.create_proposal("执行"))
    assert not proposal["validation"]["ok"]
    with pytest.raises(ValueError, match="未通过"):
        service.apply_proposal(proposal["proposal_id"], 0)
    assert not service.list_flows()


@pytest.mark.parametrize(
    "node_type,key",
    [("ToolCallNode", "tool"), ("ToolNode", "tool_name")],
)
def test_cannot_invent_tool_names(service, node_type, key):
    flow = document()
    flow["nodes"]["input"] = {
        "class_type": node_type,
        "inputs": {key: "magic_tool"},
    }
    service.executor.llm_service = RecordingModel(flow)
    proposal = asyncio.run(service.create_proposal("读取业务"))
    assert not proposal["validation"]["ok"]
    assert any("未启用的工具" in error for error in proposal["validation"]["errors"])


def test_offline_model_503_without_template_fallback(service):
    response = client(service).post(
        "/authoring/proposals",
        json={"prompt": "建工作流"},
    )
    assert response.status_code == 503
    assert not service.list_flows()


def test_provider_exception_does_not_expose_secret(service):
    service.executor.llm_service = RecordingModel(
        RuntimeError("api_key=private-value"),
    )
    response = client(service).post(
        "/authoring/proposals",
        json={"prompt": "建工作流"},
    )
    assert response.status_code == 503
    assert "private-value" not in response.text


@pytest.mark.parametrize(
    "reply",
    [
        "not json",
        "[]",
        '{"flow":{"nodes":[]}}',
        '{"flow":{"nodes":{"x":null}}}',
        '{"flow":{"nodes":{},"x":NaN}}',
    ],
)
def test_malformed_model_responses_are422_and_nonmutating(service, reply):
    service.executor.llm_service = RecordingModel(reply)
    response = client(service).post(
        "/authoring/proposals",
        json={"prompt": "创建"},
    )
    assert response.status_code == 422
    assert not service.list_flows()


@pytest.mark.parametrize("bad_node", [None, {"inputs": []}])
def test_malformed_canvas_is_rejected_before_model(service, bad_node):
    flow = document()
    flow["nodes"]["input"] = bad_node
    model = RecordingModel()
    service.executor.llm_service = model
    assert (
        client(service)
        .post("/authoring/proposals", json={"prompt": "修改", "flow": flow})
        .status_code
        == 422
    )
    assert model.messages == []


def test_credentials_redacted_from_model_context_and_preserved(service):
    flow = document()
    flow["metadata"] = {
        "api_key": "private-value",
        "headers": {
            "Authorization": "Bearer private-token",
            "X-API-Key": "hidden-header",
            "apiKey": "hidden-camel",
            "Cookie": "hidden-cookie",
        },
    }
    saved = service.save_flow("inventory", flow)
    model = RecordingModel(lambda request: request["current_flow"])
    service.executor.llm_service = model
    proposal = asyncio.run(service.create_proposal("保持配置", flow=saved))
    for secret in [
        "private-value",
        "private-token",
        "hidden-header",
        "hidden-camel",
        "hidden-cookie",
    ]:
        assert secret not in model.messages[1].content
    assert proposal["flow"]["metadata"]["api_key"] == "private-value"


def test_exact_parameter_diff_with_redacted_credentials():
    old = {
        "nodes": {
            "check": {"inputs": {"threshold": 3, "api_key": "old-secret"}},
        },
    }
    new = {
        "nodes": {
            "check": {"inputs": {"threshold": 5, "api_key": "new-secret"}},
        },
    }
    changes = workflow_diff(old, new)
    assert {"path": "inputs.threshold", "before": 3, "after": 5} in changes[0][
        "details"
    ]
    assert "3 → 5" in changes[0]["description"]
    assert "old-secret" not in json.dumps(
        changes,
    ) and "new-secret" not in json.dumps(changes)


def test_selected_authoring_preserves_outside_nodes_and_allows_new_nodes(
    service,
):
    saved = service.save_flow("inventory", document())

    def edit(request):
        assert request["selected_node_ids"] == ["output"]
        candidate = copy.deepcopy(request["current_flow"])
        candidate["nodes"]["output"]["label"] = "确认库存"
        candidate["nodes"]["extra"] = {
            "class_type": "InputNode",
            "inputs": {"name": "extra"},
        }
        candidate.setdefault("metadata", {}).setdefault("positions", {})[
            "extra"
        ] = {"x": 100, "y": 100}
        return candidate

    service.executor.llm_service = RecordingModel(edit)
    proposal = asyncio.run(
        service.create_proposal(
            "补充库存输入",
            flow=saved,
            selected_node_ids=["output"],
        ),
    )
    assert proposal["validation"]["ok"], proposal["validation"]
    assert service.get_flow("inventory") == saved
    applied = service.apply_proposal(proposal["proposal_id"], 1)
    assert applied["nodes"]["input"] == saved["nodes"]["input"]
    assert applied["nodes"]["output"]["label"] == "确认库存"
    assert "extra" in applied["nodes"]


@pytest.mark.parametrize(
    "outside_change",
    ["node", "name", "position", "edge"],
)
def test_selected_authoring_rejects_model_changes_outside_selection(
    service,
    outside_change,
):
    original = document()
    original["nodes"]["other"] = copy.deepcopy(original["nodes"]["output"])
    original["edges"].append(
        {
            "id": "other-edge",
            "source": "input",
            "target": "other",
            "target_handle": "value",
        },
    )
    original["metadata"] = {"positions": {"input": {"x": 1, "y": 2}}}
    saved = service.save_flow("inventory", original)

    def edit(request):
        candidate = copy.deepcopy(request["current_flow"])
        if outside_change == "node":
            candidate["nodes"]["input"]["label"] = "越界修改"
        elif outside_change == "name":
            candidate["name"] = "越界修改"
        elif outside_change == "position":
            candidate["metadata"]["positions"]["input"]["x"] = 999
        else:
            candidate["edges"] = [
                edge
                for edge in candidate["edges"]
                if edge["target"] != "other"
            ]
        return candidate

    service.executor.llm_service = RecordingModel(edit)
    proposal = asyncio.run(
        service.create_proposal(
            "仅编辑输出",
            flow=saved,
            selected_node_ids=["output"],
        ),
    )
    assert not proposal["validation"]["ok"]
    assert any("选区" in error for error in proposal["validation"]["errors"])
    with pytest.raises(ValueError, match="未通过"):
        service.apply_proposal(proposal["proposal_id"], 1)
    assert service.get_flow("inventory") == saved


@pytest.mark.parametrize(
    "selection",
    [[], ["missing"], ["input", "input"], "input"],
)
def test_authoring_rejects_invalid_selection_before_calling_model(
    service,
    selection,
):
    saved = service.save_flow("inventory", document())
    model = RecordingModel()
    service.executor.llm_service = model
    with pytest.raises(ValueError, match="选区"):
        asyncio.run(
            service.create_proposal(
                "修改",
                flow=saved,
                selected_node_ids=selection,
            ),
        )
    assert not model.messages


def test_authoring_conversation_survives_restart_and_applies_chosen_round(
    service,
    tmp_path,
):
    saved = service.save_flow("inventory", document())
    model = RecordingModel(
        lambda request: {
            **request["current_flow"],
            "description": request["instruction"],
        },
    )
    service.executor.llm_service = model
    first = asyncio.run(service.create_proposal("第一轮说明", flow=saved))
    restarted = WorkflowService(flows_dir=tmp_path)
    try:
        restarted.executor.llm_service = model
        second = asyncio.run(
            restarted.create_proposal(
                "第二轮说明",
                flow=saved,
                parent_proposal_id=first["proposal_id"],
            ),
        )
        request = json.loads(model.messages[1].content)
        assert request["current_flow"]["description"] == "第一轮说明"
        assert request["conversation"][0]["instruction"] == "第一轮说明"
        assert second["parent_proposal_id"] == first["proposal_id"]
        assert second["base_revision"] == 1
        assert not any(key.startswith("_") for key in second)
        assert restarted.get_flow("inventory") == saved
        # Either preview remains a real checkpoint until one is applied.
        chosen = restarted.apply_proposal(first["proposal_id"], 1)
        assert chosen["description"] == "第一轮说明"
        with pytest.raises(RevisionConflict):
            restarted.apply_proposal(second["proposal_id"], 1)
    finally:
        restarted.close(timeout=2)


@pytest.mark.parametrize("change", ["agent", "draft", "selection", "expired"])
def test_authoring_conversation_rejects_changed_scope_before_model(
    service,
    change,
):
    saved = service.save_flow("inventory", document())
    model = RecordingModel(lambda request: request["current_flow"])
    service.executor.llm_service = model
    first = asyncio.run(service.create_proposal("原始对话", flow=saved))
    model.messages = []
    payload = {"flow": saved, "parent_proposal_id": first["proposal_id"]}
    if change == "agent":
        payload["scope_agent_id"] = "other"
    elif change == "draft":
        payload["flow"] = {**saved, "description": "新草稿"}
    elif change == "selection":
        payload["selected_node_ids"] = ["output"]
    else:
        payload["parent_proposal_id"] = "missing"
    with pytest.raises(RevisionConflict):
        asyncio.run(service.create_proposal("继续修改", **payload))
    assert not model.messages


def test_authoring_router_carries_selection_and_parent_proposal(service):
    saved = service.save_flow("inventory", document())
    service.executor.llm_service = RecordingModel(
        lambda request: request["current_flow"],
    )
    api = client(service)
    first = api.post(
        "/authoring/proposals",
        json={
            "prompt": "第一轮",
            "flow": saved,
            "selected_node_ids": ["output"],
        },
    )
    assert first.status_code == 200, first.text
    second = api.post(
        "/authoring/proposals",
        json={
            "prompt": "第二轮",
            "flow": saved,
            "selected_node_ids": ["output"],
            "parent_proposal_id": first.json()["proposal_id"],
        },
    )
    assert second.status_code == 200, second.text
    assert second.json()["parent_proposal_id"] == first.json()["proposal_id"]
    assert (
        json.loads(service.executor.llm_service.messages[1].content)[
            "conversation"
        ][0]["instruction"]
        == "第一轮"
    )


def test_api_revision_guard_and_restore_creates_new_version(service):
    api = client(service)
    first = api.post("/flows", json=document())
    assert first.status_code == 200 and first.json()["revision"] == 1
    assert (
        api.put("/flows/inventory", json=document("stale")).status_code == 409
    )
    second = api.put(
        "/flows/inventory",
        json={**first.json(), "name": "changed"},
    )
    assert second.status_code == 200 and second.json()["revision"] == 2
    restored = api.post(
        "/flows/inventory/versions/1/restore",
        json={"expected_revision": 2},
    )
    assert restored.status_code == 200 and restored.json()["revision"] == 3
    assert restored.json()["name"] == "Inventory"
    assert [
        item["revision"]
        for item in api.get("/flows/inventory/versions").json()
    ] == [3, 2, 1]


def test_two_repositories_have_atomic_compare_and_swap(tmp_path):
    first, second = FlowRepository(tmp_path), FlowRepository(tmp_path)
    first.save("inventory", document(), 0)

    def update(repo):
        try:
            return repo.save("inventory", document("edit"), 1)["revision"]
        except RevisionConflict:
            return "conflict"

    with ThreadPoolExecutor(2) as pool:
        outcomes = list(pool.map(update, [first, second]))
    assert sorted(outcomes, key=str) == [2, "conflict"]
    assert len(first.versions("inventory")) == 2


def test_json_migration_preserves_originals_and_deletion_does_not_resurrect(
    tmp_path,
):
    source = tmp_path / "legacy.json"
    source.write_text(json.dumps(document()), encoding="utf-8")
    repo = FlowRepository(tmp_path)
    assert repo.get("inventory")["revision"] == 1 and source.exists()
    repo.delete("inventory")
    assert FlowRepository(tmp_path).get("inventory") is None


def test_resume_claim_is_exclusive_and_failed_admission_can_release(tmp_path):
    first, second = FlowRepository(tmp_path), FlowRepository(tmp_path)
    first.claim_resume("parent", "child")
    with pytest.raises(RevisionConflict):
        second.claim_resume("parent", "duplicate")
    second.release_resume("parent", "wrong-child")
    with pytest.raises(RevisionConflict):
        second.claim_resume("parent", "duplicate")
    first.release_resume("parent", "child")
    second.claim_resume("parent", "retry")


def test_inactive_parallel_node_is_not_appliable(service):
    flow = document()
    flow["nodes"]["input"] = {"class_type": "ParallelNode", "inputs": {}}
    service.executor.llm_service = RecordingModel(flow)
    proposal = asyncio.run(service.create_proposal("并行执行"))
    assert not proposal["validation"]["ok"]
    assert any("当前不可用" in error for error in proposal["validation"]["errors"])


def test_tool_removal_between_propose_and_apply_is_rechecked(service):
    flow = document()
    flow["nodes"]["input"] = {
        "class_type": "ToolNode",
        "inputs": {"tool_name": "read_inventory", "args": {}},
    }
    service.executor.tool_registry = {"read_inventory": lambda: 1}
    service.executor.llm_service = RecordingModel(flow)
    proposal = asyncio.run(service.create_proposal("读取库存"))
    assert proposal["validation"]["ok"]
    service.executor.tool_registry.clear()
    with pytest.raises(ValueError, match="未启用的工具"):
        service.apply_proposal(proposal["proposal_id"], 0)
    assert not service.list_flows()


def _wait(handle):
    import time

    deadline = time.monotonic() + 3
    while not handle.is_done and time.monotonic() < deadline:
        time.sleep(0.01)
    assert handle.is_done
    return handle.to_dict()


def test_failed_resume_admission_releases_claim_and_marker(
    service,
    monkeypatch,
):
    service.save_flow(
        "review",
        {
            "id": "review",
            "nodes": {
                "review": {
                    "class_type": "HumanReviewNode",
                    "inputs": {"reviewer": "owner"},
                },
            },
            "outputs": ["review"],
        },
    )
    original = service.start_run("review")
    assert _wait(original)["status"] == "waiting_human"

    def fail(*args, **kwargs):
        raise OSError("test unavailable disk")

    with monkeypatch.context() as failure:
        failure.setattr(service, "_submit_run", fail)
        with pytest.raises(OSError):
            service.resume_run(original.run_id, {"approved": True})
        assert not service.get_run_record(original.run_id).get(
            "resumed_by_run_id",
        )
    assert (
        _wait(service.resume_run(original.run_id, {"approved": True}))[
            "status"
        ]
        == "completed"
    )


def test_failed_resume_preparation_releases_claim_before_any_node_work(
    service,
    monkeypatch,
):
    service.save_flow(
        "review",
        {
            "id": "review",
            "nodes": {
                "review": {
                    "class_type": "HumanReviewNode",
                    "inputs": {"reviewer": "owner"},
                },
            },
            "outputs": ["review"],
        },
    )
    original = service.start_run("review")
    _wait(original)
    resume = service.executor.resume

    async def fail(*args, **kwargs):
        raise ValueError("test snapshot temporary unavailable")

    monkeypatch.setattr(service.executor, "resume", fail)
    failed = service.resume_run(original.run_id, {"approved": True})
    assert _wait(failed)["status"] == "failed"
    assert not service.get_run_record(original.run_id).get("resumed_by_run_id")
    monkeypatch.setattr(service.executor, "resume", resume)
    assert (
        _wait(service.resume_run(original.run_id, {"approved": True}))[
            "status"
        ]
        == "completed"
    )


def test_authoring_diff_distinguishes_boolean_and_zero():
    changes = workflow_diff(
        {"nodes": {"node": {"inputs": {"value": False}}}},
        {"nodes": {"node": {"inputs": {"value": 0}}}},
    )
    assert changes[0]["kind"] == "modified"
    assert changes[0]["details"][0]["before"] is False
    assert type(changes[0]["details"][0]["after"]) is int
