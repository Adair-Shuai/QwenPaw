# -*- coding: utf-8 -*-
"""Execute visual variable references through the real runner and debug API."""

import asyncio
import copy
import importlib
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
    state = SimpleNamespace(
        value={
            "a.b": [
                {
                    'say"hi': "中文 English",
                    "zero": 0,
                    "enabled": False,
                    "empty": None,
                },
            ],
        },
        calls=[],
    )

    class VariableSource(nodes.WorkflowNode):
        NODE_ID = "VariableSource"

        @classmethod
        def define_schema(cls):
            return io.Schema(
                node_id=cls.NODE_ID,
                inputs=[],
                outputs=[io.IO.Any.Output(id="value")],
                not_idempotent=True,
            )

        async def execute(self, *, hidden):
            state.calls.append(hidden.unique_id)
            hidden.workflow_state.set(
                "source_result",
                copy.deepcopy(state.value),
            )
            return io.NodeOutput(values=(copy.deepcopy(state.value),))

    class VariablePair(nodes.WorkflowNode):
        NODE_ID = "VariablePair"

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
            state.calls.append(hidden.unique_id)
            return io.NodeOutput(
                values=("first 中文", [copy.deepcopy(state.value)]),
            )

    class VariableTarget(nodes.WorkflowNode):
        NODE_ID = "VariableTarget"

        @classmethod
        def define_schema(cls):
            return io.Schema(
                node_id=cls.NODE_ID,
                inputs=[io.IO.Any.Input(id="value")],
                outputs=[io.IO.Any.Output(id="value")],
                not_idempotent=True,
            )

        async def execute(self, *, hidden, value):
            state.calls.append(hidden.unique_id)
            return io.NodeOutput(values=(value,))

    registry = nodes.NodeRegistry()
    for _, node in nodes.bootstrap().items():
        registry.register(node)
    for node in (VariableSource, VariablePair, VariableTarget):
        registry.register(node)
    executor = engine.WorkflowExecutor(
        node_registry=registry,
        state_store=engine.build_workflow_state_store(tmp_path),
    )
    service_module = importlib.import_module(f"{package}.service")
    service = service_module.WorkflowService(
        flows_dir=tmp_path,
        executor=executor,
    )
    router_module = importlib.import_module(f"{package}.router")
    app = FastAPI()
    app.include_router(router_module.build_router(service))
    with TestClient(app) as client:
        yield SimpleNamespace(
            package=package,
            engine=engine,
            registry=registry,
            executor=executor,
            service=service,
            client=client,
            state=state,
        )
    service.close(timeout=3)


def document(expression, source="源.node", class_type="VariableSource"):
    # The consumer is deliberately first and has no physical data edge.
    return {
        "id": "variable-bindings",
        "nodes": {
            "target": {
                "class_type": "VariableTarget",
                "inputs": {"value": expression},
            },
            source: {
                "class_type": class_type,
                "inputs": {},
                "control": {"output": "source_result"},
            },
        },
        "outputs": ["target"],
        "edges": [],
    }


def wait_record(environment, run_id):
    handle = environment.service.get_run(run_id)
    deadline = time.monotonic() + 5
    while not handle.is_done and time.monotonic() < deadline:
        time.sleep(0.01)
    assert handle.is_done
    response = environment.client.get(f"/runs/{run_id}")
    assert response.status_code == 200, response.text
    record = response.json()
    assert record["status"] == "completed", record
    return record


@pytest.mark.parametrize(
    "expression",
    [
        '${output_slots["源.node"][0]["a.b"][0]["say\\"hi"]}',
        '${outputs["源.node"]["a.b"][0]["say\\"hi"]}',
        "${vars.source_result['a.b'][0]['say\"hi']}",
    ],
)
def test_normal_run_orders_quoted_nested_template_dependencies(
    environment,
    expression,
):
    result = asyncio.run(environment.executor.execute(document(expression)))
    assert result.status.value == "completed", result.errors
    assert result.outputs == {"target": "中文 English"}
    assert environment.state.calls == ["源.node", "target"]


@pytest.mark.parametrize(
    ("field", "expected"),
    [("zero", 0), ("enabled", False), ("empty", None)],
)
def test_nested_slots_keep_zero_false_and_null_without_coercion(
    environment,
    field,
    expected,
):
    expression = '${output_slots["源.node"][0]["a.b"][0]["' + field + '"]}'
    result = asyncio.run(environment.executor.execute(document(expression)))
    assert result.status.value == "completed", result.errors
    assert result.outputs == {"target": expected}


def test_multislot_array_reference_executes_using_real_output_slots(
    environment,
):
    expression = '${output_slots["pair"][1][0]["a.b"][0]["say\\"hi"]}'
    result = asyncio.run(
        environment.executor.execute(
            document(expression, "pair", "VariablePair"),
        ),
    )
    assert result.status.value == "completed", result.errors
    assert result.outputs == {"target": "中文 English"}
    assert environment.state.calls == ["pair", "target"]


def test_debug_until_and_single_node_share_nested_dependency_scope(
    environment,
):
    expression = '${output_slots["源.node"][0]["a.b"][0]["say\\"hi"]}'
    flow = environment.service.save_flow(
        "variable-bindings",
        document(expression),
    )
    body = {
        "mode": "node",
        "target_node_id": "target",
        "expected_revision": flow["revision"],
    }
    response = environment.client.post(
        "/flows/variable-bindings/debug",
        json=body,
    )
    assert response.status_code == 422, response.text
    assert environment.state.calls == []
    body["mode"] = "until"
    response = environment.client.post(
        "/flows/variable-bindings/debug",
        json=body,
    )
    assert response.status_code == 200, response.text
    record = wait_record(environment, response.json()["run_id"])
    assert record["outputs"] == {"target": "中文 English"}
    assert environment.state.calls == ["源.node", "target"]
    environment.state.calls.clear()
    body.update(
        mode="node",
        pins={"源.node": [{"a.b": [{'say"hi': "固定 Pinned"}]}]},
    )
    response = environment.client.post(
        "/flows/variable-bindings/debug",
        json=body,
    )
    assert response.status_code == 200, response.text
    record = wait_record(environment, response.json()["run_id"])
    assert record["outputs"] == {"target": "固定 Pinned"}
    assert environment.state.calls == ["target"]


def test_debug_quoted_workflow_input_remains_in_required_input_schema(
    environment,
):
    flow = environment.service.save_flow(
        "quoted-input",
        {
            "id": "quoted-input",
            "inputs": [
                {"name": "姓名.English", "type": "string", "required": True},
            ],
            "nodes": {
                "target": {
                    "class_type": "VariableTarget",
                    "inputs": {"value": '${inputs["姓名.English"]}'},
                },
            },
        },
    )
    response = environment.client.post(
        "/flows/quoted-input/debug",
        json={
            "mode": "node",
            "target_node_id": "target",
            "expected_revision": flow["revision"],
            "inputs": {"姓名.English": "张三 English"},
        },
    )
    assert response.status_code == 200, response.text
    assert wait_record(environment, response.json()["run_id"])["outputs"] == {
        "target": "张三 English",
    }


@pytest.mark.parametrize(
    "expression",
    ['${output_slots["missing"][0]}', '${output_slots["源.node"][bad]}'],
)
def test_invalid_template_references_are_rejected_before_node_execution(
    environment,
    expression,
):
    result = environment.engine.validate(
        environment.engine.load(document(expression)),
        registry=environment.registry,
    )
    assert not result.ok
    assert any(
        item["code"] == "TEMPLATE_REFERENCE_INVALID"
        for item in result.diagnostics
    )
    assert environment.state.calls == []


def test_template_dependencies_participate_in_cycle_validation(environment):
    payload = document('${output_slots["源.node"][0]}')
    payload["nodes"]["源.node"]["inputs"] = {
        "value": '${output_slots["target"][0]}',
    }
    payload["nodes"]["源.node"]["class_type"] = "VariableTarget"
    result = environment.engine.validate(
        environment.engine.load(payload),
        registry=environment.registry,
    )
    assert not result.ok
    assert any(item["code"] == "DATA_CYCLE" for item in result.diagnostics)


@pytest.mark.parametrize("mode", [None, "text", "json_schema"])
def test_llm_pin_slots_follow_effective_text_or_schema_mode(environment, mode):
    inputs = {"prompt": "unused"}
    if mode is not None:
        inputs["response_format"] = mode
    if mode == "json_schema":
        inputs["output_schema"] = {"type": "object"}
    payload = document('${output_slots["model"][0]}', "model")
    payload["nodes"]["model"] = {"class_type": "LLMCallNode", "inputs": inputs}
    payload["revision"] = 1
    debugging = importlib.import_module(f"{environment.package}.debugging")
    slots = (
        ["content", {"字段": "value"}] if mode == "json_schema" else ["content"]
    )
    plan = debugging.prepare_debug_plan(
        payload,
        environment.registry,
        mode="node",
        target_node_id="target",
        expected_revision=1,
        pins={"model": slots},
    )
    assert plan["pins"] == {"model": slots}
    bad_slots = ["content"] if mode == "json_schema" else ["content", {}]
    with pytest.raises(ValueError, match="output slots"):
        debugging.prepare_debug_plan(
            payload,
            environment.registry,
            mode="node",
            target_node_id="target",
            expected_revision=1,
            pins={"model": bad_slots},
        )


def test_template_context_preserves_legacy_outputs_and_stable_slots(
    environment,
):
    types = importlib.import_module(f"{environment.package}.engine.types")
    state = types.WorkflowState(
        workflow_id="legacy",
        inputs={"output_slots": "business input"},
    )
    state.outputs = {
        "text": ["中文 English"],
        "array": [[1, 2]],
        "pair": ["first", {"字段": False}],
    }
    assert state.resolve_template("${outputs.text}") == "中文 English"
    assert state.resolve_template('${output_slots["text"][0]}') == "中文 English"
    assert state.resolve_template('${output_slots["array"][0][1]}') == 2
    assert state.resolve_template('${output_slots["pair"][1]["字段"]}') is False
    assert state.resolve_template("${inputs.output_slots}") == "business input"
    state.inputs["O'Brien"] = "legacy apostrophe"
    state.outputs["braces"] = [{"a}b": "quoted brace"}]
    assert state.resolve_template("${inputs.O'Brien}") == "legacy apostrophe"
    assert (
        state.resolve_template('${output_slots["braces"][0]["a}b"]}')
        == "quoted brace"
    )
    state.outputs["braces"][0].update(
        {'say"hi': "quoted", "😀": True, "empty": None},
    )
    assert (
        state.resolve_template(r"${output_slots['braces'][0]['say\"hi']}")
        == "quoted"
    )
    assert (
        state.resolve_template(r'${output_slots["braces"][0]["\ud83d\ude00"]}')
        is True
    )
    assert (
        state.resolve_template('${output_slots[ "braces" ][0][ "a}b" ]}')
        == "quoted brace"
    )
    assert state.get("output_slots.braces.0.empty", "fallback") is None
    for expression in (
        '${output_slots["missing"][0]}',
        '${output_slots["braces"][1]}',
        '${output_slots["braces"][0]["missing"]}',
        r"${output_slots['braces'][0]['\x41']}",
    ):
        with pytest.raises(ValueError):
            state.resolve_template(expression)
    assert (
        state.resolve_template("prefix ${missing.value}")
        == "prefix ${missing.value}"
    )


def test_text_model_stable_slot_zero_runs_without_changing_legacy_single_output(  # noqa: E501
    environment,
):
    class TextModel:
        async def complete(self, **_kwargs):
            return SimpleNamespace(
                content="模型原文 English",
                model="test-model",
                provider="fixture",
            )

    environment.executor.llm_service = TextModel()
    payload = document('${output_slots["model"][0]}', "model")
    payload["nodes"]["model"] = {
        "class_type": "LLMCallNode",
        "inputs": {"prompt": "hello"},
    }
    result = asyncio.run(environment.executor.execute(payload))
    assert result.status.value == "completed", result.errors
    assert result.outputs == {"target": "模型原文 English"}
    history = {item.node_id: item for item in result.execution_history}
    assert history["model"].output == ("模型原文 English",)


def test_debug_until_resolves_multislot_array_values(environment):
    expression = '${output_slots["pair"][1][0]["a.b"][0]["say\\"hi"]}'
    flow = environment.service.save_flow(
        "variable-bindings",
        document(expression, "pair", "VariablePair"),
    )
    response = environment.client.post(
        "/flows/variable-bindings/debug",
        json={
            "mode": "until",
            "target_node_id": "target",
            "expected_revision": flow["revision"],
        },
    )
    assert response.status_code == 200, response.text
    assert wait_record(environment, response.json()["run_id"])["outputs"] == {
        "target": "中文 English",
    }
    assert environment.state.calls == ["pair", "target"]
