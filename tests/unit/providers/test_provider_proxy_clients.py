"""Regression tests for proxy-aware SDK transports."""

from __future__ import annotations

from types import SimpleNamespace

import httpx

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


def _enable_proxy(monkeypatch, module) -> None:
    monkeypatch.setattr(module, "should_use_custom_http_client", lambda: True)
    monkeypatch.setattr(
        module,
        "build_httpx_proxy_kwargs",
        lambda _url: PROXY_KWARGS,
    )


def test_openai_connection_and_chat_clients_receive_proxy(monkeypatch) -> None:
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
        lambda **kw: sdk_calls.append(kw) or kw,
    )

    provider._client()
    assert sdk_calls[0]["http_client"] == (transport, PROXY_KWARGS)

    model_calls = []
    monkeypatch.setattr(
        openai_compat,
        "OpenAIChatModelCompat",
        lambda **kw: model_calls.append(kw) or kw,
    )
    provider.get_chat_model_instance("gpt-4o-mini")
    assert model_calls[0]["client_kwargs"]["http_client"] == (
        transport,
        PROXY_KWARGS,
    )


def test_openrouter_connection_and_chat_clients_receive_proxy(monkeypatch) -> None:
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
        lambda **kw: sdk_calls.append(kw) or kw,
    )

    provider._client()
    assert sdk_calls[0]["http_client"] == (transport, PROXY_KWARGS)

    model_calls = []
    monkeypatch.setattr(
        openai_compat,
        "OpenAIChatModelCompat",
        lambda **kw: model_calls.append(kw) or kw,
    )
    provider.get_chat_model_instance("openai/gpt-4o-mini")
    assert model_calls[0]["client_kwargs"]["http_client"] == (
        transport,
        PROXY_KWARGS,
    )


async def test_gemini_connection_and_chat_clients_receive_proxy(monkeypatch) -> None:
    provider = GeminiProvider(
        id="gemini",
        name="Gemini",
        base_url="https://generativelanguage.googleapis.com",
        api_key="test",
    )
    _enable_proxy(monkeypatch, gemini_module)
    clients = []
    real_async_client = httpx.AsyncClient

    def make_client(**_kwargs):
        client = real_async_client(
            transport=httpx.MockTransport(
                lambda _request: httpx.Response(200),
            ),
        )
        clients.append(client)
        return client

    monkeypatch.setattr(gemini_module.httpx, "AsyncClient", make_client)
    sdk_calls = []
    fake_sdk = SimpleNamespace(aio=SimpleNamespace(models=SimpleNamespace()))
    monkeypatch.setattr(
        gemini_module.genai,
        "Client",
        lambda **kw: sdk_calls.append(kw) or fake_sdk,
    )

    provider._client()
    provider.get_chat_model_instance("gemini-2.5-flash")
    assert sdk_calls[0]["http_options"].httpx_async_client is clients[0]
    assert sdk_calls[1]["http_options"].httpx_async_client is clients[1]
    for client in clients:
        await client.aclose()


def test_anthropic_connection_and_chat_clients_receive_proxy(monkeypatch) -> None:
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
    monkeypatch.setattr(
        anthropic_module.anthropic,
        "DefaultAsyncHttpxClient",
        lambda **kw: transports.append(kw) or ("transport", kw),
    )
    monkeypatch.setattr(
        anthropic_module.anthropic,
        "AsyncAnthropic",
        lambda **kw: sdk_calls.append(kw) or kw,
    )

    provider._client()
    assert transports[0] == PROXY_KWARGS
    assert sdk_calls[0]["http_client"] == ("transport", PROXY_KWARGS)

    model = provider.get_chat_model_instance("claude-3-5-sonnet")
    model._get_or_create_client()
    assert transports[1] == PROXY_KWARGS
    assert sdk_calls[-1]["http_client"] == ("transport", PROXY_KWARGS)
