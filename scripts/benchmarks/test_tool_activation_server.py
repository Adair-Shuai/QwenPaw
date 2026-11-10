# -*- coding: utf-8 -*-
"""Regression checks for measurement drivers before application benchmarks."""

import json

import httpx
import pytest

from tool_activation_server import BenchServer, Upstream


@pytest.fixture(name="server")
def _server(tmp_path):
    instance = BenchServer(tmp_path, [])
    instance.start()
    try:
        yield instance
    finally:
        instance.close()


def schema(name):
    return {
        "type": "function",
        "function": {
            "name": name,
            "description": name,
            "parameters": {"type": "object", "properties": {}},
        },
    }


def completion(server, messages, tools):
    with httpx.Client(trust_env=False) as client:
        response = client.post(
            server.url + "/v1/chat/completions",
            json={
                "model": "fixture",
                "messages": messages,
                "tools": tools,
                "stream": True,
            },
        )
    packets = (
        [
            json.loads(line[5:])
            for line in response.text.splitlines()
            if line.startswith("data:") and line[5:].strip() != "[DONE]"
        ]
        if response.status_code == 200
        else []
    )
    calls = [
        call
        for packet in packets
        for choice in packet["choices"]
        for call in choice.get("delta", {}).get("tool_calls", [])
    ]
    text = "".join(
        choice.get("delta", {}).get("content", "")
        for packet in packets
        for choice in packet["choices"]
    )
    return response, calls, text


def test_case_tracking_keeps_markers_out_of_windows_file_prompts(server):
    prompt = "读取 C:\\Users\\fixture\\sample.txt"
    server.active_case_id = "hidden-case"
    server.cases["hidden-case"] = {"prompt": prompt, "actions": []}
    response, _calls, text = completion(
        server,
        [{"role": "user", "content": [{"type": "text", "text": prompt}]}],
        [],
    )
    assert response.status_code == 200
    assert text == "BENCH_DONE"
    assert server.model_calls[0]["case_id"] == "hidden-case"


def test_multi_action_plan_discovers_third_tool_after_two_prior_searches(
    server,
):
    server.active_case_id = "multi-step"
    server.cases["multi-step"] = {
        "prompt": "perform three actions",
        "actions": [
            {"name": "first"},
            {"name": "second"},
            {"name": "third"},
        ],
    }
    messages = [{"role": "user", "content": "perform three actions"}]
    tools = [schema("search_tools")]
    names = []
    for _step in range(7):
        _response, calls, text = completion(server, messages, tools)
        if not calls:
            assert text == "BENCH_DONE"
            break
        call = calls[0]
        names.append(call["function"]["name"])
        if names[-1] == "search_tools":
            target = json.loads(call["function"]["arguments"])["query"]
            tools.append(schema(target))
        messages.extend(
            [
                {"role": "assistant", "tool_calls": [call]},
                {"role": "tool", "tool_call_id": call["id"], "content": "ok"},
            ],
        )
    assert names == [
        "search_tools",
        "first",
        "search_tools",
        "second",
        "search_tools",
        "third",
    ]


def test_upstream_connection_failure_returns_error_http_status(server):
    server.active_case_id = "connection-failure"
    server.cases["connection-failure"] = {"prompt": "hello", "backend": "live"}
    server.upstream = Upstream(
        "http://fixture.invalid/v1",
        "dummy",
        "fixture",
        "OpenAIChatModel",
        {},
    )

    def unavailable(_request):
        raise httpx.ConnectError("fixture connection failure")

    server.relay_clients["connection-failure"] = httpx.Client(
        transport=httpx.MockTransport(unavailable),
    )
    response, _calls, _text = completion(
        server,
        [{"role": "user", "content": "hello"}],
        [],
    )
    assert response.status_code == 502
    assert server.model_calls[0]["error"] == "relay_ConnectError"


def test_relay_honors_the_application_proxy_policy(server, monkeypatch):
    original = httpx.Client
    seen = []
    packet = {
        "choices": [
            {"index": 0, "delta": {"content": "ok"}, "finish_reason": "stop"},
        ],
    }
    payload = "data: " + json.dumps(packet) + "\n\ndata: [DONE]\n\n"

    def factory(*args, **kwargs):
        if kwargs.get("timeout") == 120:
            seen.append(kwargs["trust_env"])
            kwargs["transport"] = httpx.MockTransport(
                lambda _request: httpx.Response(200, text=payload),
            )
        return original(*args, **kwargs)

    monkeypatch.setattr(httpx, "Client", factory)
    server.active_case_id = "proxy-policy"
    server.cases["proxy-policy"] = {"prompt": "hello", "backend": "live"}
    server.upstream = Upstream(
        "http://fixture.invalid/v1",
        "dummy",
        "fixture",
        "OpenAIChatModel",
        {},
        {"trust_env": False},
    )
    response, _, text = completion(
        server,
        [{"role": "user", "content": "hello"}],
        [],
    )
    assert response.status_code == 200
    assert text == "ok"
    assert seen == [False]


@pytest.mark.parametrize("complete", [False, True])
def test_stream_completion_is_recorded(server, complete):
    server.active_case_id = "stream"
    server.cases["stream"] = {"prompt": "hello", "backend": "live"}
    server.upstream = Upstream(
        "http://fixture.invalid/v1",
        "dummy",
        "fixture",
        "OpenAIChatModel",
        {},
    )
    choice = {
        "index": 0,
        "delta": {"content": "ok"},
        "finish_reason": "stop" if complete else None,
    }
    payload = (
        "data: " + json.dumps({"choices": [choice]}) + "\n\ndata: [DONE]\n\n"
    )
    server.relay_clients["stream"] = httpx.Client(
        transport=httpx.MockTransport(
            lambda _request: httpx.Response(
                200,
                text=payload,
                headers={"content-type": "text/event-stream"},
            ),
        ),
    )
    response, _calls, text = completion(
        server,
        [{"role": "user", "content": "hello"}],
        [],
    )
    assert response.status_code == 200
    assert text == "ok"
    assert server.model_calls[0].get("error") == (
        None if complete else "upstream_missing_finish_reason"
    )
