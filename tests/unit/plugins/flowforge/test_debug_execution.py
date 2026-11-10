# -*- coding: utf-8 -*-
"""Real manual debug runs remain isolated from saved and production flows."""

import copy
import importlib
import json
import time
from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient


@pytest.fixture(
    name="environment",
    params=["qwenpaw.plugins_bundle", "plugins.bundle"],
)
def _environment(request, tmp_path):
    package = f"{request.param}.flowforge"
    engine = importlib.import_module(f"{package}.engine")
    nodes = importlib.import_module(f"{package}.engine.nodes")
    io = importlib.import_module(f"{package}.engine.io")
    service_module = importlib.import_module(f"{package}.service")
    router_module = importlib.import_module(f"{package}.router")
    registry = nodes.NodeRegistry()
    for _, node in nodes.bootstrap().items():
        registry.register(node)
    calls = []

    class DebugEcho(nodes.WorkflowNode):
        NODE_ID = "DebugEcho"

        @classmethod
        def define_schema(cls):
            return io.Schema(
                node_id=cls.NODE_ID,
                inputs=[io.IO.Any.Input(id="value")],
                outputs=[io.IO.Any.Output(id="value")],
                not_idempotent=True,
            )

        async def execute(self, *, hidden, value):
            calls.append(hidden.unique_id)
            return io.NodeOutput(
                values=(value,),
                metadata={
                    "execution_agent_id": (hidden.extra_data or {}).get(
                        "agent_id",
                    ),
                },
            )

    class DebugPair(nodes.WorkflowNode):
        NODE_ID = "DebugPair"

        @classmethod
        def define_schema(cls):
            return io.Schema(
                node_id=cls.NODE_ID,
                inputs=[],
                outputs=[
                    io.IO.String.Output(id="text"),
                    io.IO.Array.Output(id="items"),
                ],
                not_idempotent=True,
            )

        async def execute(self, *, hidden):
            calls.append(hidden.unique_id)
            return io.NodeOutput(values=("real", [1, 2]))

    class DebugTypedInputs(nodes.WorkflowNode):
        NODE_ID = "DebugTypedInputs"

        @classmethod
        def define_schema(cls):
            return io.Schema(
                node_id=cls.NODE_ID,
                inputs=[
                    io.IO.Combo.Input(
                        id="choices",
                        choices=["en", "zh"],
                        multiselect=True,
                        default=["en"],
                    ),
                    io.IO.String.Input(id="optional", optional=True),
                ],
                outputs=[io.IO.Any.Output(id="value")],
                not_idempotent=True,
            )

        async def execute(self, *, hidden, choices, optional=None):
            calls.append(hidden.unique_id)
            return io.NodeOutput(
                values=({"choices": choices, "optional": optional},),
            )

    registry.register(DebugEcho)
    registry.register(DebugPair)
    registry.register(DebugTypedInputs)
    executor = engine.WorkflowExecutor(
        node_registry=registry,
        state_store=engine.build_workflow_state_store(tmp_path),
    )
    service = service_module.WorkflowService(
        flows_dir=tmp_path,
        executor=executor,
    )
    app = FastAPI()
    app.include_router(router_module.build_router(service))
    with TestClient(app) as client:
        yield SimpleNamespace(
            service=service,
            client=client,
            calls=calls,
            service_module=service_module,
            router_module=router_module,
            executor=executor,
        )
    service.close(timeout=3)


def wait_run(environment, run_id, status="completed"):
    handle = environment.service.get_run(run_id)
    deadline = time.monotonic() + 5
    while not handle.is_done and time.monotonic() < deadline:
        time.sleep(0.01)
    assert handle.is_done, handle.to_dict()
    response = environment.client.get(f"/runs/{run_id}")
    assert response.status_code == 200, response.text
    result = response.json()
    assert result["status"] == status, result
    return result


def chain(environment):
    return environment.service.save_flow(
        "debug-chain",
        {
            "id": "debug-chain",
            "inputs": [
                {"name": "keywords", "type": "string", "required": True},
            ],
            "nodes": {
                "source": {
                    "class_type": "DebugEcho",
                    "inputs": {"value": "${inputs.keywords}"},
                },
                "target": {
                    "class_type": "DebugEcho",
                    "label": "统计 Statistics",
                    "inputs": {"value": ["source", 0]},
                },
                "after": {
                    "class_type": "DebugEcho",
                    "inputs": {"value": ["target", 0]},
                },
                "unrelated": {
                    "class_type": "DebugEcho",
                    "inputs": {"value": "must not execute"},
                },
            },
        },
    )


def debug(environment, flow, target="target", **options):
    return environment.client.post(
        f"/flows/{flow['id']}/debug",
        headers={"X-Agent-Id": "default"},
        json={
            "mode": "node",
            "target_node_id": target,
            "expected_revision": flow["revision"],
            **options,
        },
    )


@pytest.mark.parametrize(
    "value",
    ["中文 English café 🙂", 0, False, None, [1, 2]],
)
def test_single_node_debug_reuses_slots_without_executing_upstream(
    environment,
    value,
):
    flow = chain(environment)
    original = copy.deepcopy(environment.service.get_flow(flow["id"]))
    response = debug(environment, flow, pins={"source": [value]})
    assert response.status_code == 200, response.text
    record = wait_run(environment, response.json()["run_id"])
    assert environment.calls == ["target"]
    assert record["outputs"] == {"target": value}
    assert record["debug"] == {
        "mode": "node",
        "target_node_id": "target",
        "source_revision": flow["revision"],
        "pinned_node_ids": ["source"],
    }
    assert record["node_details"]["source"]["outputs"] == [value]
    assert record["node_details"]["source"]["debug_pinned"] is True
    assert record["node_details"]["target"]["inputs"] == {"value": value}
    assert record["node_details"]["after"]["status"] == "not_executed"
    assert environment.service.get_flow(flow["id"]) == original
    assert "debug_options" not in record


def test_single_node_requires_pins_or_literal_input_before_admission(
    environment,
):
    flow = chain(environment)
    response = debug(environment, flow)
    assert response.status_code == 422
    assert "source[0]" in response.text
    assert environment.calls == []
    assert environment.service.list_runs() == []
    response = debug(
        environment,
        flow,
        node_inputs={"value": ["literal-array", 0]},
    )
    assert response.status_code == 200, response.text
    record = wait_run(environment, response.json()["run_id"])
    assert record["outputs"] == {"target": ["literal-array", 0]}
    assert environment.calls == ["target"]
    typed = environment.service.save_flow(
        "typed-input-overrides",
        {
            "id": "typed-input-overrides",
            "nodes": {
                "target": {"class_type": "DebugTypedInputs", "inputs": {}},
            },
        },
    )
    response = debug(
        environment,
        typed,
        node_inputs={"choices": ["en", "zh"], "optional": None},
    )
    assert response.status_code == 200, response.text
    record = wait_run(environment, response.json()["run_id"])
    assert record["outputs"] == {
        "target": {"choices": ["en", "zh"], "optional": None},
    }
    assert environment.calls == ["target", "target"]


def test_single_node_literal_override_replaces_nested_upstream_bindings(
    environment,
):
    flow = environment.service.save_flow(
        "nested-override",
        {
            "id": "nested-override",
            "nodes": {
                "source": {"class_type": "DebugEcho", "inputs": {}},
                "target": {
                    "class_type": "DebugEcho",
                    "inputs": {"value": {"nested": ["source", 0]}},
                },
            },
        },
    )
    response = debug(
        environment,
        flow,
        node_inputs={"value": {"nested": ["literal-array", 0]}},
    )
    assert response.status_code == 200, response.text
    record = wait_run(environment, response.json()["run_id"])
    assert environment.calls == ["target"]
    assert record["outputs"] == {
        "target": {"nested": ["literal-array", 0]},
    }


def test_until_debug_executes_only_ancestors_and_stops_at_target(environment):
    flow = chain(environment)
    response = debug(
        environment,
        flow,
        mode="until",
        inputs={"keywords": "春天 spring"},
    )
    assert response.status_code == 200, response.text
    record = wait_run(environment, response.json()["run_id"])
    assert environment.calls == ["source", "target"]
    assert record["outputs"] == {"target": "春天 spring"}
    assert record["node_details"]["unrelated"]["status"] == "not_executed"


def test_until_debug_pins_cut_upstream_and_keep_multislot_array_identity(
    environment,
):
    flow = environment.service.save_flow(
        "slots",
        {
            "id": "slots",
            "nodes": {
                "pair": {"class_type": "DebugPair", "inputs": {}},
                "target": {
                    "class_type": "DebugEcho",
                    "inputs": {"value": ["pair", 1]},
                },
            },
        },
    )
    response = debug(
        environment,
        flow,
        mode="until",
        pins={"pair": ["固定 pin", [0, False, "中文 English"]]},
    )
    assert response.status_code == 200, response.text
    record = wait_run(environment, response.json()["run_id"])
    assert environment.calls == ["target"]
    assert record["outputs"]["target"] == [0, False, "中文 English"]
    assert record["node_details"]["pair"]["outputs"] == [
        "固定 pin",
        [0, False, "中文 English"],
    ]
    for invalid in (["only one"], ["text", 123], [False, []]):
        response = debug(environment, flow, pins={"pair": invalid})
        assert response.status_code == 422
        assert "debug.pins.pair" in response.text


def test_until_debug_pin_cuts_the_entire_upstream_dependency_chain(
    environment,
):
    flow = chain(environment)
    response = debug(
        environment,
        flow,
        target="after",
        mode="until",
        pins={"target": [{"文本": "中文 English", "count": 0, "flag": False}]},
    )
    assert response.status_code == 200, response.text
    record = wait_run(environment, response.json()["run_id"])
    assert environment.calls == ["after"]
    assert record["node_details"]["source"]["status"] == "not_executed"
    assert record["node_details"]["target"]["debug_pinned"] is True
    assert record["outputs"]["after"] == {
        "文本": "中文 English",
        "count": 0,
        "flag": False,
    }


def test_debug_ignores_unrelated_invalid_and_pinned_node_inputs(environment):
    flow = chain(environment)
    flow["nodes"]["source"]["inputs"] = {}
    flow["nodes"]["unrelated"] = {
        "class_type": "UnavailableOutsideDebugBoundary",
        "inputs": {"value": "${outputs.unknown}"},
    }
    flow["nodes"]["after"]["inputs"] = {}
    flow = environment.service.save_flow(flow["id"], flow)
    response = debug(environment, flow, pins={"source": ["中文 English"]})
    assert response.status_code == 200, response.text
    record = wait_run(environment, response.json()["run_id"])
    assert environment.calls == ["target"]
    assert record["outputs"] == {"target": "中文 English"}
    assert record["node_details"]["unrelated"]["status"] == "not_executed"
    assert environment.service.get_flow(flow["id"]) == flow


def test_debug_reuses_tool_output_when_source_tool_is_unavailable(environment):
    flow = chain(environment)
    flow["nodes"]["source"] = {
        "class_type": "ToolNode",
        "inputs": {"tool_name": "unavailable-tool"},
    }
    flow = environment.service.save_flow(flow["id"], flow)
    response = debug(
        environment,
        flow,
        pins={"source": [{"文本": "中文 English", "value": 0}]},
    )
    assert response.status_code == 200, response.text
    record = wait_run(environment, response.json()["run_id"])
    assert environment.calls == ["target"]
    assert record["outputs"] == {
        "target": {"文本": "中文 English", "value": 0},
    }
    response = debug(
        environment,
        flow,
        target="source",
        node_inputs={"tool_name": "unavailable-tool"},
    )
    assert response.status_code == 422
    assert "unavailable-tool" in response.text


def test_debug_literal_tool_overrides_use_normal_capability_validation(
    environment,
):
    def echo(value):
        environment.calls.append("tool")
        return value

    environment.executor.tool_registry = {"debug-echo": echo}
    flow = environment.service.save_flow(
        "tool-override",
        {
            "id": "tool-override",
            "nodes": {
                "target": {
                    "class_type": "ToolNode",
                    "inputs": {},
                },
            },
        },
    )
    response = debug(
        environment,
        flow,
        node_inputs={
            "tool_name": "debug-echo",
            "args": {"value": {"文本": "中文 English", "count": 0}},
        },
    )
    assert response.status_code == 200, response.text
    record = wait_run(environment, response.json()["run_id"])
    assert environment.calls == ["tool"]
    assert record["outputs"] == {
        "target": {"文本": "中文 English", "count": 0},
    }


@pytest.mark.parametrize(
    "expression",
    [
        "${outputs.source.payload}",
        "${source.payload}",
        "${vars.source_result.payload}",
    ],
)
def test_single_node_debug_requires_pins_for_template_output_dependencies(
    environment,
    expression,
):
    flow = chain(environment)
    flow["nodes"]["source"]["control"]["output"] = "source_result"
    flow["nodes"]["target"]["inputs"]["value"] = expression
    flow["edges"] = [
        edge for edge in flow["edges"] if edge["target"] != "target"
    ]
    flow = environment.service.save_flow(flow["id"], flow)
    response = debug(environment, flow)
    assert response.status_code == 422
    assert "source[0]" in response.text
    assert environment.service.list_runs() == []
    response = debug(
        environment,
        flow,
        pins={"source": [{"payload": "中文 English"}]},
    )
    assert response.status_code == 200, response.text
    record = wait_run(environment, response.json()["run_id"])
    assert environment.calls == ["target"]
    assert record["outputs"] == {"target": "中文 English"}


def test_until_debug_schedules_template_dependencies_before_target(
    environment,
):
    flow = chain(environment)
    flow["nodes"]["target"]["inputs"]["value"] = "${outputs.source}"
    flow["edges"] = [
        edge for edge in flow["edges"] if edge["target"] != "target"
    ]
    flow = environment.service.save_flow(flow["id"], flow)
    response = debug(
        environment,
        flow,
        mode="until",
        inputs={"keywords": "中文 English"},
    )
    assert response.status_code == 200, response.text
    record = wait_run(environment, response.json()["run_id"])
    assert environment.calls == ["source", "target"]
    assert record["outputs"] == {"target": "中文 English"}


@pytest.mark.parametrize("take_target", [False, True])
def test_until_debug_preserves_condition_selection_without_running_other_arm(
    environment,
    take_target,
):
    flow = environment.service.save_flow(
        "branch",
        {
            "id": "branch",
            "nodes": {
                "condition": {
                    "class_type": "ConditionNode",
                    "inputs": {},
                    "control": {
                        "conditions": [
                            {
                                "if": {
                                    "left": "${inputs.choose}",
                                    "operator": "eq",
                                    "right": True,
                                },
                                "then_node": "target",
                            },
                        ],
                        "else_node": "other",
                    },
                },
                "target": {
                    "class_type": "DebugEcho",
                    "inputs": {"value": "selected"},
                },
                "other": {
                    "class_type": "DebugEcho",
                    "inputs": {"value": "forbidden side effect"},
                },
            },
        },
    )
    response = debug(
        environment,
        flow,
        mode="until",
        inputs={"choose": take_target},
    )
    assert response.status_code == 200, response.text
    record = wait_run(environment, response.json()["run_id"])
    assert environment.calls == (["target"] if take_target else [])
    assert record["node_details"]["target"]["status"] == (
        "success" if take_target else "skipped"
    )
    assert record["node_details"]["other"]["status"] == "not_executed"
    assert record["outputs"] == ({"target": "selected"} if take_target else {})


def test_debug_revision_schema_and_control_pins_fail_before_any_execution(
    environment,
):
    flow = chain(environment)
    invalid_requests = [
        {"expected_revision": flow["revision"] - 1, "pins": {"source": [0]}},
        {"target_node_id": "missing"},
        {"mode": "unknown"},
        {"pins": {"target": [0]}},
        {"pins": {"missing": [0]}},
        {"node_inputs": {"__flow_dependencies": []}},
        {"node_inputs": {"unknown": 0}},
    ]
    for index, options in enumerate(invalid_requests):
        response = debug(environment, flow, **options)
        assert response.status_code == (
            409 if index == 0 else 422
        ), response.text
    assert environment.calls == []
    assert environment.service.list_runs() == []
    flow = environment.service.save_flow(
        "control",
        {
            "id": "control",
            "nodes": {
                "review": {"class_type": "HumanReviewNode", "inputs": {}},
                "target": {
                    "class_type": "OutputNode",
                    "inputs": {"value": ["review", 0]},
                },
            },
        },
    )
    response = debug(environment, flow, pins={"review": [True]})
    assert response.status_code == 422
    assert "control-flow" in response.text


def test_production_runs_ignore_debug_samples_and_keep_saved_definitions(
    environment,
):
    flow = chain(environment)
    flow["metadata"] = {"debug": {"pins": {"source": ["not production"]}}}
    flow = environment.service.save_flow(flow["id"], flow)
    response = environment.client.post(
        f"/flows/{flow['id']}/run",
        json={
            "inputs": {"keywords": "real production"},
            "pins": {"source": ["fake"]},
        },
    )
    assert response.status_code == 200
    record = wait_run(environment, response.json()["run_id"])
    assert record["trigger_type"] == "manual"
    assert "debug" not in record
    assert set(environment.calls) == {"source", "target", "after", "unrelated"}
    assert record["node_details"]["target"]["outputs"] == ["real production"]


@pytest.mark.parametrize("agent_id", ["research-zh", "research-en"])
def test_debug_execution_uses_the_request_agent_scope(environment, agent_id):
    flow = chain(environment)
    response = environment.client.post(
        f"/flows/{flow['id']}/debug",
        headers={"X-Agent-Id": agent_id},
        json={
            "mode": "node",
            "target_node_id": "target",
            "expected_revision": flow["revision"],
            "pins": {"source": ["中文 English"]},
        },
    )
    assert response.status_code == 200, response.text
    record = wait_run(environment, response.json()["run_id"])
    assert record["agent_id"] == agent_id
    assert (
        record["node_details"]["target"]["metadata"]["execution_agent_id"]
        == agent_id
    )
    assert environment.calls == ["target"]


def test_debug_admission_uses_the_validated_revision_during_concurrent_save(
    environment,
    monkeypatch,
):
    flow = chain(environment)
    original_start = environment.service.start_run

    def save_before_admission(*args, **kwargs):
        updated = copy.deepcopy(flow)
        updated["nodes"]["target"]["inputs"]["value"] = "new revision"
        updated["edges"] = [
            edge for edge in updated["edges"] if edge["target"] != "target"
        ]
        environment.service.save_flow(flow["id"], updated)
        return original_start(*args, **kwargs)

    monkeypatch.setattr(
        environment.service,
        "start_run",
        save_before_admission,
    )
    response = debug(environment, flow, pins={"source": ["captured revision"]})
    assert response.status_code == 200, response.text
    record = wait_run(environment, response.json()["run_id"])
    assert record["flow_revision"] == flow["revision"]
    assert record["debug"]["source_revision"] == flow["revision"]
    assert record["outputs"]["target"] == "captured revision"
    assert record["node_details"]["target"]["configuration"]["inputs"] == {
        "value": ["source", 0],
    }
    saved = environment.service.get_flow(flow["id"])
    assert saved["revision"] == flow["revision"] + 1
    assert saved["nodes"]["target"]["inputs"]["value"] == "new revision"


def test_debug_record_and_redaction_survive_restart_without_changing_history(
    environment,
):
    flow = chain(environment)
    secret = "private-debug-key-1234"
    response = debug(
        environment,
        flow,
        node_inputs={
            "value": {
                "api_key": secret,
                "echo": secret,
                "文本": "中文 English",
            },
        },
    )
    assert response.status_code == 200, response.text
    run_id = response.json()["run_id"]
    public = wait_run(environment, run_id)
    assert secret not in json.dumps(public)
    assert secret not in environment.client.get(f"/runs/{run_id}/events").text
    assert (
        environment.service.get_run_record(run_id)["outputs"]["target"][
            "api_key"
        ]
        == secret
    )
    original = environment.service.get_flow(flow["id"])
    environment.service.close(timeout=3)
    restarted = environment.service_module.WorkflowService(
        flows_dir=environment.service.flows_dir,
    )
    try:
        app = FastAPI()
        app.include_router(environment.router_module.build_router(restarted))
        with TestClient(app) as client:
            record = client.get(f"/runs/{run_id}").json()
            assert secret not in json.dumps(record)
            assert record["debug"] == public["debug"]
            assert record["node_details"] == public["node_details"]
            assert record["node_details"]["target"]["configuration"][
                "inputs"
            ] == {"value": ["source", 0]}
            assert restarted.get_flow(flow["id"]) == original
    finally:
        restarted.close(timeout=3)


def test_debug_cancellation_uses_normal_lifecycle_and_leaves_no_active_runner(
    environment,
):
    flow = environment.service.save_flow(
        "cancel-debug",
        {
            "id": "cancel-debug",
            "nodes": {
                "wait": {"class_type": "WaitNode", "inputs": {"seconds": 60}},
            },
        },
    )
    response = debug(environment, flow, target="wait")
    assert response.status_code == 200, response.text
    run_id = response.json()["run_id"]
    cancelled = environment.client.post(f"/runs/{run_id}/cancel")
    assert cancelled.status_code == 200
    record = wait_run(environment, run_id, status="cancelled")
    assert record["debug"]["target_node_id"] == "wait"
    assert environment.executor.resource_snapshot()["active_runs"] == 0


def test_debug_review_resume_after_restart_keeps_execution_limit(
    environment,
):
    flow = environment.service.save_flow(
        "review-debug",
        {
            "id": "review-debug",
            "nodes": {
                "review": {
                    "class_type": "HumanReviewNode",
                    "inputs": {
                        "reviewer": "reviewer",
                        "review_prompt": "请确认 Please review",
                    },
                    "control": {"next": "after"},
                },
                "after": {
                    "class_type": "OutputNode",
                    "inputs": {"value": "outside debug limit"},
                },
            },
        },
    )
    response = debug(environment, flow, target="review", mode="until")
    assert response.status_code == 200, response.text
    run_id = response.json()["run_id"]
    paused = wait_run(environment, run_id, status="waiting_human")
    environment.service.close(timeout=3)
    restarted = environment.service_module.WorkflowService(
        flows_dir=environment.service.flows_dir,
    )
    try:
        app = FastAPI()
        app.include_router(environment.router_module.build_router(restarted))
        with TestClient(app) as client:
            response = client.post(
                f"/runs/{run_id}/resume",
                json={
                    "inputs": {"approved": True, "comments": "同意 Approved"},
                },
            )
            assert response.status_code == 200, response.text
            run = response.json()["run_id"]
            handle = restarted.get_run(run)
            deadline = time.monotonic() + 5
            while not handle.is_done and time.monotonic() < deadline:
                time.sleep(0.01)
            assert handle.is_done
            result = client.get(f"/runs/{run}").json()
            assert result["status"] == "completed", result
            assert result["debug"] == paused["debug"]
            assert result["node_details"]["after"]["status"] == "not_executed"
            assert result["outputs"]["review"]["approved"] is True
            assert result["outputs"]["review"]["comments"] == "同意 Approved"
    finally:
        restarted.close(timeout=3)


def test_old_records_do_not_invent_resolved_inputs(environment):
    inspect = importlib.import_module(
        environment.service_module.__package__ + ".inspection",
    )
    result = inspect.node_details(
        {
            "execution_history": [
                {"node_id": "n", "status": "completed", "output": [0]},
            ],
        },
        {
            "nodes": {
                "n": {
                    "class_type": "OutputNode",
                    "inputs": {"value": "${unknown}"},
                },
            },
        },
    )
    assert result["n"]["inputs_available"] is False
    assert "inputs" not in result["n"]
