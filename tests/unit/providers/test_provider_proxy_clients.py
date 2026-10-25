# -*- coding: utf-8 -*-
"""Regression tests for proxy-aware SDK transports."""

from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import AsyncMock

import httpx
from agentscope.message import Msg

import qwenpaw.providers.adapters.anthropic as anthropic_adapter
import qwenpaw.providers.anthropic_provider as anthropic_module
import qwenpaw.providers.gemini_provider as gemini_module
import qwenpaw.providers.openai_chat_model_compat as openai_compat
import qwenpaw.providers.openai_provider as openai_module
import qwenpaw.providers.openrouter_provider as openrouter_module
from qwenpaw.providers.anthropic_provider import AnthropicProvider
from qwenpaw.providers.gemini_provider import GeminiProvider
from qwenpaw.providers.openai_provider import OpenAIProvider
from qwenpaw.providers.openrouter_provider import OpenRouterProvider


PROXY_KWARGS = {"proxy": "http://proxy.example:8080", "trust_env": False}


def _record_factory(calls, result):
    def factory(**kwargs):
        calls.append(kwargs)
        return result

    return factory


def _connection_client():
    return SimpleNamespace(
        models=SimpleNamespace(list=AsyncMock()),
        close=AsyncMock(),
    )


def _enable_proxy(monkeypatch, module) -> None:
    monkeypatch.setattr(module, "should_use_custom_http_client", lambda: True)
    monkeypatch.setattr(
        module,
        "build_httpx_proxy_kwargs",
        lambda _url: PROXY_KWARGS,
    )


async def test_openai_connection_and_chat_clients_receive_proxy(
    monkeypatch,
) -> None:
    provider = OpenAIProvider(
        id="openai",
        name="OpenAI",
        base_url="https://openai.example/v1",
        api_key="test",
    )
    _enable_proxy(monkeypatch, openai_module)
    transport = object()
    monkeypatch.setattr(
        openai_module.httpx,
        "AsyncClient",
        lambda **kw: (transport, kw),
    )
    sdk_calls = []
    monkeypatch.setattr(
        openai_module,
        "AsyncOpenAI",
        _record_factory(sdk_calls, _connection_client()),
    )

    assert await provider.check_connection() == (True, "")
    assert sdk_calls[0]["http_client"] == (transport, PROXY_KWARGS)

    model_calls = []
    monkeypatch.setattr(
        openai_compat,
        "OpenAIChatModelCompat",
        _record_factory(model_calls, None),
    )
    provider.get_chat_model_instance("gpt-4o-mini")
    assert model_calls[0]["client_kwargs"]["http_client"] == (
        transport,
        PROXY_KWARGS,
    )


async def test_openrouter_connection_and_chat_clients_receive_proxy(
    monkeypatch,
) -> None:
    provider = OpenRouterProvider(
        id="openrouter",
        name="OpenRouter",
        base_url="https://openrouter.example/v1",
        api_key="test",
    )
    _enable_proxy(monkeypatch, openrouter_module)
    transport = object()
    monkeypatch.setattr(
        openrouter_module.httpx,
        "AsyncClient",
        lambda **kw: (transport, kw),
    )
    sdk_calls = []
    monkeypatch.setattr(
        openrouter_module,
        "AsyncOpenAI",
        _record_factory(sdk_calls, _connection_client()),
    )

    assert await provider.check_connection() == (True, "")
    assert sdk_calls[0]["http_client"] == (transport, PROXY_KWARGS)

    model_calls = []
    monkeypatch.setattr(
        openai_compat,
        "OpenAIChatModelCompat",
        _record_factory(model_calls, None),
    )
    provider.get_chat_model_instance("openai/gpt-4o-mini")
    assert model_calls[0]["client_kwargs"]["http_client"] == (
        transport,
        PROXY_KWARGS,
    )


async def test_gemini_connection_and_chat_clients_receive_proxy(
    monkeypatch,
) -> None:
    provider = GeminiProvider(
        id="gemini",
        name="Gemini",
        base_url="https://generativelanguage.googleapis.com",
        api_key="test",
    )
    _enable_proxy(monkeypatch, gemini_module)
    clients = []
    transport_calls = []
    real_async_client = httpx.AsyncClient

    def make_client(**kwargs):
        transport_calls.append(kwargs)
        client = real_async_client(
            transport=httpx.MockTransport(
                lambda _request: httpx.Response(200),
            ),
        )
        clients.append(client)
        return client

    monkeypatch.setattr(gemini_module.httpx, "AsyncClient", make_client)
    sdk_calls = []

    async def list_models():
        for row in ():
            yield row

    fake_sdk = SimpleNamespace(
        aio=SimpleNamespace(
            models=SimpleNamespace(
                list=AsyncMock(return_value=list_models()),
            ),
            aclose=AsyncMock(),
        ),
    )
    monkeypatch.setattr(
        gemini_module.genai,
        "Client",
        _record_factory(sdk_calls, fake_sdk),
    )

    assert await provider.check_connection() == (True, "")
    provider.get_chat_model_instance("gemini-2.5-flash")
    assert sdk_calls[0]["http_options"].httpx_async_client is clients[0]
    assert sdk_calls[1]["http_options"].httpx_async_client is clients[1]
    assert transport_calls == [PROXY_KWARGS, PROXY_KWARGS]
    for client in clients:
        await client.aclose()


async def test_anthropic_connection_and_chat_clients_receive_proxy(
    monkeypatch,
) -> None:
    provider = AnthropicProvider(
        id="anthropic",
        name="Anthropic",
        base_url="https://anthropic.example",
        api_key="test",
    )
    _enable_proxy(monkeypatch, anthropic_module)
    _enable_proxy(monkeypatch, anthropic_adapter)
    transports = []
    sdk_calls = []
    fake_sdk = _connection_client()
    fake_sdk.messages = SimpleNamespace(
        create=AsyncMock(
            return_value=anthropic_module.anthropic.types.Message(
                id="proxy-response",
                model="claude-3-5-sonnet",
                role="assistant",
                type="message",
                content=[{"type": "text", "text": "proxy reply"}],
                stop_reason="end_turn",
                usage={"input_tokens": 1, "output_tokens": 2},
            ),
        ),
    )
    monkeypatch.setattr(
        anthropic_module.anthropic,
        "DefaultAsyncHttpxClient",
        _record_factory(transports, ("transport", PROXY_KWARGS)),
    )
    monkeypatch.setattr(
        anthropic_module.anthropic,
        "AsyncAnthropic",
        _record_factory(sdk_calls, fake_sdk),
    )

    assert await provider.check_connection() == (True, "")
    assert transports[0] == PROXY_KWARGS
    assert sdk_calls[0]["http_client"] == ("transport", PROXY_KWARGS)

    model = provider.get_chat_model_instance("claude-3-5-sonnet")
    model.stream = False
    response = await model(
        [
            Msg(
                name="user",
                content=[{"type": "text", "text": "ping"}],
                role="user",
            ),
        ],
    )
    assert response.content[0].text == "proxy reply"
    assert transports[1] == PROXY_KWARGS
    assert sdk_calls[-1]["http_client"] == ("transport", PROXY_KWARGS)
