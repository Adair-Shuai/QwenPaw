# -*- coding: utf-8 -*-
"""Model output contracts through real adapters, HTTP runs and persistence."""

import asyncio
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
    service_module = importlib.import_module(f"{package}.service")
    router_module = importlib.import_module(f"{package}.router")
    adapter = importlib.import_module(f"{package}.engine.adapter.llm_service")
    transport = SimpleNamespace(content='{"value":0}', calls=[])
    usage = {"input_tokens": 0, "output_tokens": 7, "total_tokens": 7}

    async def complete(messages, *, temperature, max_tokens):
        # The strict provider signature also protects unsupported parameters.
        transport.calls.append((messages, temperature, max_tokens))
        return {"content": transport.content, "usage": dict(usage)}

    provider = SimpleNamespace(
        enabled=True,
        get_chat_model_instance=lambda _model: complete,
    )
    manager = SimpleNamespace(
        get_active_model=lambda: SimpleNamespace(
            provider_id="structured-provider",
            model="structured-model",
        ),
        get_provider=lambda _provider: provider,
    )
    service = service_module.WorkflowService(flows_dir=tmp_path)
    service.executor.llm_service = adapter.LLMService(manager)
    app = FastAPI()
    app.include_router(router_module.build_router(service))
    with TestClient(app) as client:
        yield SimpleNamespace(
            package=package,
            service=service,
            client=client,
            transport=transport,
            usage=usage,
            service_module=service_module,
            router_module=router_module,
            adapter=adapter,
        )
    service.close(timeout=3)


def definition(schema, *, mode="json_schema"):
    return {
        "id": "structured-contract",
        "nodes": {
            "model": {
                "class_type": "LLMCallNode",
                "inputs": {
                    "prompt": "请按要求输出。Return the requested value.",
                    "system": "保留中英文字段。Keep the original field names.",
                    "response_format": mode,
                    "output_schema": schema,
                    "temperature": 0,
                    "max_tokens": 128,
                },
                "control": {"max_retries": 3, "retry_delay_sec": 0},
            },
            "content": {
                "class_type": "OutputNode",
                "inputs": {"value": ["model", 0]},
            },
            "parsed": {
                "class_type": "OutputNode",
                "inputs": {"value": ["model", 1]},
            },
        },
        "outputs": ["content", "parsed"],
        "edges": [
            {
                "source": "model",
                "target": "content",
                "source_slot": 0,
                "target_handle": "value",
            },
            {
                "source": "model",
                "target": "parsed",
                "source_slot": 1,
                "target_handle": "value",
            },
        ],
    }


def run(environment, flow, status="completed", *, inputs=None):
    current = environment.client.get(f"/flows/{flow['id']}")
    payload = dict(flow)
    if current.status_code == 200:
        payload["expected_revision"] = current.json()["revision"]
    saved = environment.client.post("/flows", json=payload)
    assert saved.status_code == 200, saved.text
    started = environment.client.post(
        f"/flows/{flow['id']}/run",
        json={"inputs": inputs or {}},
    )
    assert started.status_code == 200, started.text
    run_id = started.json()["run_id"]
    handle = environment.service.get_run(run_id)
    deadline = time.monotonic() + 6
    while not handle.is_done and time.monotonic() < deadline:
        time.sleep(0.01)
    assert handle.is_done, handle.to_dict()
    response = environment.client.get(f"/runs/{run_id}")
    assert response.status_code == 200, response.text
    record = response.json()
    assert record["status"] == status, record
    return record


def restart_record(environment, run_id):
    environment.service.close(timeout=3)
    restarted = environment.service_module.WorkflowService(
        flows_dir=environment.service.flows_dir,
    )
    app = FastAPI()
    app.include_router(environment.router_module.build_router(restarted))
    try:
        with TestClient(app) as client:
            response = client.get(f"/runs/{run_id}")
            assert response.status_code == 200, response.text
            return response.json()
    finally:
        restarted.close(timeout=3)


@pytest.mark.parametrize(
    "value",
    [
        {"中文": "你好", "count": 0, "enabled": False, "nothing": None},
        {"English": "Hello", "accent": "café 🙂"},
        {"混合 Mixed": [0, False, None, "春天 English"]},
        0,
        False,
        None,
        [0, False, None, "中文 English"],
    ],
)
def test_bilingual_structured_values_keep_both_slots_through_http_and_restart(
    environment,
    value,
):
    schema = {
        "$defs": {
            "value": {
                "type": [
                    "object",
                    "array",
                    "string",
                    "number",
                    "boolean",
                    "null",
                ],
            },
        },
        "$ref": "#/$defs/value",
    }
    content = json.dumps(value, ensure_ascii=False)
    environment.transport.content = content
    record = run(environment, definition(schema))
    assert record["outputs"] == {"content": content, "parsed": value}
    detail = record["node_details"]["model"]
    assert detail["outputs"] == [content, value]
    assert detail["metadata"]["usage"] == environment.usage
    assert detail["metadata"]["usage_scope"] == "attempt"
    assert detail["metadata"]["model"] == "structured-model"
    assert detail["metadata"]["provider"] == "structured-provider"
    assert len(environment.transport.calls) == 1
    messages, temperature, max_tokens = environment.transport.calls[0]
    assert temperature == 0 and max_tokens == 128
    assert messages[0].role == "system"
    assert (
        json.dumps(schema, ensure_ascii=False) in messages[0].content[0].text
    )
    assert "Keep the original field names." in messages[0].content[0].text
    assert (
        messages[1].content[0].text
        == definition(schema)["nodes"]["model"]["inputs"]["prompt"]
    )
    persisted = restart_record(environment, record["run_id"])
    assert persisted["outputs"] == record["outputs"]
    assert persisted["node_details"]["model"] == detail


@pytest.mark.parametrize(
    "schema, field",
    [
        ({"type": "unknown"}, "/type"),
        ({"required": "name"}, "/required"),
        ({"$ref": "https://example.invalid/schema"}, "/$ref"),
        ({"$ref": "#/$defs/missing"}, "/$ref"),
        ({"$schema": "https://example.invalid/dialect"}, "/$schema"),
        ({"$schema": []}, "/$schema"),
        (
            {
                "$defs": {
                    "entry": {"$schema": "https://example.invalid/dialect"},
                },
            },
            "output_schema",
        ),
    ],
)
def test_invalid_schema_reports_field_before_any_provider_invocation(
    environment,
    schema,
    field,
):
    flow = definition(schema)
    validation = environment.client.post("/flows/validate", json=flow)
    assert validation.status_code == 200
    checked = validation.json()
    assert checked["ok"] is False
    assert any(
        item.get("node_id") == "model"
        and item.get("field") == "inputs.output_schema"
        for item in checked["diagnostics"]
    )
    assert field in " ".join(checked["errors"])
    record = run(environment, flow, status="failed")
    assert environment.transport.calls == []
    assert "output_schema" in record["error"]


@pytest.mark.parametrize(
    "content",
    [
        '```json\n{"value":0}\n```',
        '{"value":0} {"value":1}',
        '{"value":NaN}',
        '{"value":Infinity}',
        '{"value":-Infinity}',
        '{"中文":0,"中文":1}',
        '{"timeout":0,"timeout":1}',
        '{"value":1e309}',
        '{"value":0,}',
    ],
)
def test_json_mode_rejects_non_json_or_ambiguous_responses_and_keeps_usage(
    environment,
    content,
):
    environment.transport.content = content
    record = run(environment, definition({}), status="failed")
    detail = record["node_details"]["model"]
    assert (
        detail["metadata"]["diagnostics"][0]["code"]
        == "LLM_OUTPUT_JSON_INVALID"
    )
    assert detail["metadata"]["usage"] == environment.usage
    assert detail["metadata"]["retryable"] is False
    failed = next(
        item
        for item in record["execution_history"]
        if item["node_id"] == "model"
    )
    assert failed["metadata"]["usage"] == environment.usage
    assert failed["metadata"]["model"] == "structured-model"
    assert "outputs.parsed" in detail["error"]
    assert len(environment.transport.calls) == 1
    assert not any(
        item["node_id"] in {"content", "parsed"}
        for item in record["execution_history"]
    )


@pytest.mark.parametrize(
    "field, missing",
    [
        ("统计/Mixed~", False),
        ("timeout", False),
        ("429", False),
        ("timeout", True),
    ],
)
def test_schema_mismatch_keeps_actual_usage_and_escaped_business_field_path(
    environment,
    field,
    missing,
):
    secret = "sensitive-model-value-123"
    schema = {
        "type": "object",
        "properties": {
            field: {"type": "array", "items": {"type": "integer"}},
        },
        "required": [field],
        "additionalProperties": False,
    }
    environment.transport.content = json.dumps(
        {} if missing else {field: [0, secret]},
        ensure_ascii=False,
    )
    record = run(environment, definition(schema), status="failed")
    detail = record["node_details"]["model"]
    diagnostic = detail["metadata"]["diagnostics"][0]
    escaped = field.replace("~", "~0").replace("/", "~1")
    path = f"/{escaped}" + ("" if missing else "/1")
    assert diagnostic == {
        "code": "LLM_OUTPUT_SCHEMA_MISMATCH",
        "field": "outputs.parsed" + path,
        "message": (
            "value violates required constraint"
            if missing
            else 'expected "integer"'
        ),
        "instance_path": path,
        "schema_path": (
            "/required" if missing else f"/properties/{escaped}/items/type"
        ),
    }
    assert detail["metadata"]["usage"] == environment.usage
    assert detail["metadata"]["provider"] == "structured-provider"
    assert detail["metadata"]["retryable"] is False
    assert len(environment.transport.calls) == 1
    assert secret not in json.dumps(record)
    assert not any(
        item["node_id"] in {"content", "parsed"}
        for item in record["execution_history"]
    )
    persisted = restart_record(environment, record["run_id"])
    assert persisted["node_details"]["model"]["metadata"] == detail["metadata"]
    assert persisted["execution_history"] == record["execution_history"]


def test_required_field_location_and_local_draft_seven_references(environment):
    schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "definitions": {"count": {"type": "integer"}},
        "properties": {
            "$ref": {"type": "string"},
            "数量": {"$ref": "#/definitions/count"},
        },
        "required": ["$ref", "数量"],
        "examples": [{"$ref": "https://ordinary-business-data.invalid"}],
    }
    value = {"$ref": "https://ordinary-value.invalid", "数量": 0}
    environment.transport.content = json.dumps(value, ensure_ascii=False)
    record = run(environment, definition(schema))
    assert record["outputs"]["parsed"] == value
    environment.transport.content = json.dumps({"$ref": "business value"})
    failed = run(environment, definition(schema), status="failed")
    diagnostic = failed["node_details"]["model"]["metadata"]["diagnostics"][0]
    assert diagnostic["instance_path"] == "/数量"
    assert diagnostic["schema_path"] == "/required"


def test_local_anchors_support_recursive_and_nullable_contracts(environment):
    schema = {
        "$id": "urn:flowforge:tree",
        "$defs": {
            "entry": {
                "$anchor": "entry",
                "type": ["object", "null"],
                "properties": {
                    "value": {"type": "integer"},
                    "child": {"$ref": "#entry"},
                },
            },
        },
        "$ref": "#entry",
    }
    value = {"value": 0, "child": {"value": 0, "child": None}}
    environment.transport.content = json.dumps(value)
    record = run(environment, definition(schema))
    assert record["outputs"]["parsed"] == value
    assert len(environment.transport.calls) == 1


def test_legacy_text_response_and_content_alias_keep_existing_behavior(
    environment,
):
    node_module = importlib.import_module(
        f"{environment.package}.engine.nodes.builtin.llm_call",
    )
    types = importlib.import_module(f"{environment.package}.engine.types")
    io = importlib.import_module(f"{environment.package}.engine.io")
    state = types.WorkflowState(workflow_id="legacy", inputs={"name": "世界"})
    environment.transport.content = "原有正文 Original text"
    node = node_module.LLMCallNode()
    output = asyncio.run(
        node.execute(
            hidden=io.HiddenHolder(
                workflow_state=state,
                tool_context=SimpleNamespace(
                    llm_service=environment.service.executor.llm_service,
                ),
            ),
            prompt="Hello ${inputs.name}",
            system="帮助 ${inputs.name}",
            output="legacy_alias",
        ),
    )
    assert output.error is None
    assert output.values == ("原有正文 Original text",)
    assert state.get("legacy_alias") == "原有正文 Original text"
    messages, temperature, max_tokens = environment.transport.calls[0]
    assert [(m.role, m.content[0].text) for m in messages] == [
        ("system", "帮助 世界"),
        ("user", "Hello 世界"),
    ]
    assert (temperature, max_tokens) == (0.1, 4096)
    assert output.metadata["usage"] == environment.usage
    schema = node.get_schema()
    assert [(field.id, field.get_io_type()) for field in schema.outputs] == [
        ("content", "STRING"),
        ("parsed", "*"),
    ]
    assert schema.get_input("output_schema").as_dict()["type"] == "OBJECT"


def test_text_mode_rejects_parsed_binding_before_execution(environment):
    flow = definition({}, mode="text")
    validation = environment.client.post("/flows/validate", json=flow)
    assert validation.status_code == 200
    checked = validation.json()
    assert checked["ok"] is False
    assert any(
        item["code"] == "OUTPUT_SLOT_UNAVAILABLE"
        and item.get("node_id") == "parsed"
        for item in checked["diagnostics"]
    )
    record = run(environment, flow, status="failed")
    assert "parsed" in record["error"]
    assert environment.transport.calls == []
    assert record["execution_history"] == []


@pytest.mark.parametrize("binding", ["link", "template"])
@pytest.mark.parametrize("mode", [None, "text", "json_schema"])
def test_dynamic_output_mode_distinguishes_unavailable_slot_and_explicit_null(
    environment,
    binding,
    mode,
):
    flow = definition({"type": "null"})
    flow["inputs"] = [{"name": "format", "type": "string", "default": "text"}]
    flow["nodes"]["model"]["inputs"]["response_format"] = "${inputs.format}"
    if binding == "template":
        flow["nodes"]["parsed"]["inputs"][
            "value"
        ] = '${output_slots["model"][1]}'
        flow["edges"] = [
            edge for edge in flow["edges"] if edge["target"] != "parsed"
        ]
    environment.transport.content = "null"
    expected_status = "completed" if mode == "json_schema" else "failed"
    record = run(
        environment,
        flow,
        status=expected_status,
        inputs={} if mode is None else {"format": mode},
    )
    assert len(environment.transport.calls) == 1
    if mode == "json_schema":
        assert record["outputs"]["parsed"] is None
        assert record["node_details"]["model"]["outputs"] == ["null", None]
    else:
        assert "parsed" not in record["outputs"]
        message = record["node_details"]["parsed"]["error"].lower()
        assert (
            "unavailable" in message
            if binding == "link"
            else "missing output_slots path" in message
        )
        assert not any(
            item["node_id"] == "parsed" and item["status"] == "completed"
            for item in record["execution_history"]
        )


@pytest.mark.parametrize(
    "schema, value",
    [
        ({"enum": ["text", 0]}, 0),
        ({"const": ["model", 0]}, ["model", 0]),
        (
            {
                "const": {
                    "literal": "${outputs.missing}",
                    "samples": ["源.node", 0],
                },
            },
            {"literal": "${outputs.missing}", "samples": ["源.node", 0]},
        ),
    ],
)
def test_literal_schema_values_are_not_workflow_links_or_expressions(
    environment,
    schema,
    value,
):
    flow = definition(schema)
    validation = environment.client.post("/flows/validate", json=flow)
    assert validation.status_code == 200
    assert validation.json()["ok"] is True, validation.json()
    environment.transport.content = json.dumps(value, ensure_ascii=False)
    record = run(environment, flow)
    assert record["outputs"]["parsed"] == value
    assert record["node_details"]["model"]["inputs"]["output_schema"] == schema


@pytest.mark.parametrize("binding", ["input_expression", "source_link"])
def test_schema_whole_field_bindings_keep_real_dependencies(
    environment,
    binding,
):
    schema = {"enum": ["text", 0]}
    flow = definition({})
    flow["inputs"] = [{"name": "contract", "type": "object", "required": True}]
    if binding == "input_expression":
        flow["nodes"]["model"]["inputs"][
            "output_schema"
        ] = "${inputs.contract}"
    else:
        flow["nodes"]["contract"] = {
            "class_type": "InputNode",
            "inputs": {"name": "contract"},
        }
        flow["nodes"]["model"]["inputs"]["output_schema"] = ["contract", 0]
        flow["edges"].append(
            {
                "source": "contract",
                "target": "model",
                "source_slot": 0,
                "target_handle": "output_schema",
            },
        )
    environment.transport.content = "0"
    record = run(environment, flow, inputs={"contract": schema})
    assert record["outputs"]["parsed"] == 0
    assert record["node_details"]["model"]["inputs"]["output_schema"] == schema


def test_host_stream_is_accumulated_once_before_structured_validation(
    environment,
):
    from agentscope.message import TextBlock
    from agentscope.model import ChatResponse, ChatUsage
    from test_llm_adapter import HostProtocolModel

    async def transport():
        yield ChatResponse(
            content=[TextBlock(id="json", text='{"数量":')],
            is_last=False,
        )
        yield ChatResponse(
            content=[TextBlock(id="json", text="0}")],
            is_last=False,
        )
        yield ChatResponse(
            content=[],
            is_last=False,
            usage=ChatUsage(input_tokens=0, output_tokens=4, time=0.1),
        )

    model = HostProtocolModel(transport)
    manager = SimpleNamespace(
        get_active_model=lambda: SimpleNamespace(
            provider_id="stream-provider",
            model="fixture-model",
        ),
        get_provider=lambda _: SimpleNamespace(
            enabled=True,
            get_chat_model_instance=lambda _: model,
        ),
    )
    environment.service.executor.llm_service = environment.adapter.LLMService(
        manager,
    )
    record = run(
        environment,
        definition({"type": "object", "required": ["数量"]}),
    )
    assert record["outputs"]["parsed"] == {"数量": 0}
    assert record["outputs"]["content"] == '{"数量":0}'
    assert (
        record["node_details"]["model"]["metadata"]["usage"]["output_tokens"]
        == 4
    )
    assert model.calls == 1
