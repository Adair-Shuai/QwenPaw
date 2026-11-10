# -*- coding: utf-8 -*-
"""Generation settings and resolved model details across the real adapter."""

import asyncio
import importlib
from types import SimpleNamespace

import pytest


@pytest.fixture(
    name="package",
    params=["qwenpaw.plugins_bundle", "plugins.bundle"],
)
def _package(request):
    return f"{request.param}.flowforge"


def recording_node(package):
    module = importlib.import_module(
        f"{package}.engine.nodes.builtin.llm_call",
    )
    calls = []

    async def complete(**kwargs):
        calls.append(kwargs)
        return SimpleNamespace(
            content="中文 English",
            model="resolved-model",
            provider="resolved-provider",
            usage={"input_tokens": 0, "output_tokens": 3, "total_tokens": 3},
        )

    hidden = SimpleNamespace(
        tool_context=SimpleNamespace(
            llm_service=SimpleNamespace(complete=complete),
        ),
        workflow_state=None,
    )
    return module.LLMCallNode(), hidden, calls


def test_zero_temperature_is_preserved_and_metadata_uses_resolved_model(
    package,
):
    node, hidden, calls = recording_node(package)
    result = asyncio.run(
        node.execute(
            hidden=hidden,
            prompt="英文 English 与中文",
            system="只返回正文. Return the text only.",
            temperature=0,
            max_tokens=1,
        ),
    )
    assert result.error is None
    assert calls[0]["temperature"] == 0
    assert calls[0]["max_tokens"] == 1
    assert result.values == ("中文 English",)
    assert result.metadata["model"] == "resolved-model"
    assert result.metadata["provider"] == "resolved-provider"
    assert result.metadata["usage"]["input_tokens"] == 0
    assert result.metadata["model_source"] == "inherited"


@pytest.mark.parametrize(
    "settings",
    [{}, {"temperature": None, "max_tokens": None}],
)
def test_legacy_omitted_and_null_generation_settings_use_defaults(
    package,
    settings,
):
    node, hidden, calls = recording_node(package)
    result = asyncio.run(
        node.execute(hidden=hidden, prompt="兼容旧文档", **settings),
    )
    assert result.error is None
    assert calls[0]["temperature"] == 0.1
    assert calls[0]["max_tokens"] == 4096


@pytest.mark.parametrize(
    "settings, field",
    [
        ({"temperature": -0.1}, "temperature"),
        ({"temperature": 2.1}, "temperature"),
        ({"temperature": float("nan")}, "temperature"),
        ({"temperature": float("inf")}, "temperature"),
        ({"temperature": False}, "temperature"),
        ({"max_tokens": 0}, "max_tokens"),
        ({"max_tokens": -1}, "max_tokens"),
        ({"max_tokens": 1.5}, "max_tokens"),
        ({"max_tokens": True}, "max_tokens"),
        ({"max_tokens": 32769}, "max_tokens"),
    ],
)
def test_invalid_generation_settings_fail_before_provider_call(
    package,
    settings,
    field,
):
    node, hidden, calls = recording_node(package)
    result = asyncio.run(
        node.execute(hidden=hidden, prompt="检查参数", **settings),
    )
    assert field in result.error
    assert not calls


def test_adapter_override_and_agent_inheritance_are_reflected_in_node_metadata(
    package,
    monkeypatch,
):
    adapter = importlib.import_module(f"{package}.engine.adapter.llm_service")
    node_module = importlib.import_module(
        f"{package}.engine.nodes.builtin.llm_call",
    )
    selections = {
        "expert-a": SimpleNamespace(provider_id="first", model="first-model"),
        "expert-b": SimpleNamespace(
            provider_id="second",
            model="second-model",
        ),
    }
    monkeypatch.setattr(
        "qwenpaw.config.config.load_agent_config",
        lambda agent: SimpleNamespace(
            enabled=True,
            active_model=selections[agent],
        ),
    )
    calls = []

    def provider(name):
        def get_model(model):
            async def complete(messages, **parameters):
                calls.append((name, model, messages, parameters))
                return {
                    "content": "结果 Result",
                    "usage": {"input_tokens": 4, "output_tokens": 2},
                }

            return complete

        return SimpleNamespace(enabled=True, get_chat_model_instance=get_model)

    providers = {
        name: provider(name) for name in ["first", "second", "custom"]
    }
    manager = SimpleNamespace(
        get_active_model=lambda: SimpleNamespace(
            provider_id="first",
            model="host-default",
        ),
        get_provider=providers.get,
    )

    async def execute(agent, override=None):
        hidden = SimpleNamespace(
            tool_context=SimpleNamespace(
                llm_service=adapter.LLMService(manager, agent_id=agent),
            ),
            workflow_state=None,
        )
        return await node_module.LLMCallNode().execute(
            hidden=hidden,
            prompt="中文 English",
            model=override,
            temperature=0,
            max_tokens=1,
        )

    async def scenario():
        return await asyncio.gather(
            execute("expert-a"),
            execute("expert-b", "custom/override-model"),
        )

    inherited, overridden = asyncio.run(scenario())
    assert inherited.error is None
    assert inherited.metadata["provider"] == "first"
    assert inherited.metadata["model"] == "first-model"
    assert inherited.metadata["model_source"] == "inherited"
    assert overridden.error is None
    assert overridden.metadata["provider"] == "custom"
    assert overridden.metadata["model"] == "override-model"
    assert overridden.metadata["model_source"] == "override"
    assert overridden.metadata["usage"]["input_tokens"] == 4
    assert [call[:2] for call in calls] == [
        ("first", "first-model"),
        ("custom", "override-model"),
    ]
    assert all(call[3]["temperature"] == 0 for call in calls)
    assert selections["expert-b"].provider_id == "second"
