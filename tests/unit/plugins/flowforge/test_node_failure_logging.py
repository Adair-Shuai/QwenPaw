# -*- coding: utf-8 -*-
"""Workflow failures retain their original error through real log handlers."""

import asyncio
import copy
import importlib
import logging
import sys
from types import ModuleType, SimpleNamespace
from unittest.mock import AsyncMock

import pytest


pytestmark = pytest.mark.parametrize(
    "namespace",
    [
        "plugins.bundle.flowforge.engine",
        "qwenpaw.plugins_bundle.flowforge.engine",
    ],
)


def _module(namespace, suffix):
    return importlib.import_module(f"{namespace}.{suffix}")


@pytest.fixture(name="failure_records")
def capture_failure_records(namespace):
    """Snapshot records before ancestor handlers render/clear exceptions."""
    records = []

    class Capture(logging.Handler):
        def emit(self, record):
            snapshot = copy.copy(record)
            self.format(snapshot)
            records.append(snapshot)

    logger = logging.getLogger(namespace)
    handler = Capture()
    logger.addHandler(handler)
    try:
        yield records
    finally:
        logger.removeHandler(handler)
        handler.close()


async def test_llm_failure_returns_provider_error_and_traceback(
    namespace,
    caplog,
    failure_records,
):
    module = _module(namespace, "nodes.builtin.llm_call")
    hidden = _module(namespace, "io").HiddenHolder(
        tool_context=SimpleNamespace(
            llm_service=SimpleNamespace(
                complete=AsyncMock(
                    side_effect=RuntimeError("provider failed"),
                ),
            ),
        ),
    )
    result = await module.LLMCallNode().execute(hidden=hidden, prompt="hello")
    assert result.error == "provider failed"
    assert result.metadata["duration_ms"] >= 0
    record = next(r for r in failure_records if "llm_call_failed" in r.message)
    assert "provider failed" in record.message
    assert isinstance(record.exc_info[1], RuntimeError)
    assert "Traceback (most recent call last):" in caplog.text
    assert "RuntimeError: provider failed" in caplog.text


async def test_domain_failure_returns_adapter_error_and_traceback(
    namespace,
    caplog,
    failure_records,
):
    module = _module(namespace, "nodes.domain_model_nodes")
    registry = _module(namespace, "adapter.domain_registry")
    adapter = registry.DomainModelAdapter(
        spec=registry.DomainModelSpec(task="image", provider="unavailable"),
    )
    node = module.build_domain_model_node(adapter)()
    hidden = _module(namespace, "io").HiddenHolder(unique_id="domain")
    result = await node.execute(hidden=hidden)
    assert result.error == "Domain model adapters are not available in QwenPaw"
    assert result.metadata["node_id"] == "domain"
    record = next(
        r for r in failure_records if "domain_model_node_error" in r.message
    )
    assert isinstance(record.exc_info[1], NotImplementedError)
    assert "Traceback (most recent call last):" in caplog.text
    assert (
        "NotImplementedError: Domain model adapters are not available"
        in caplog.text
    )


@pytest.mark.parametrize("mode", ["delegate", "resume"])
async def test_agent_failure_returns_original_error_in_both_paths(
    namespace,
    mode,
    caplog,
    failure_records,
):
    module = _module(namespace, "nodes.agent_exec")

    class FailedEvents:
        def __aiter__(self):
            return self

        async def __anext__(self):
            raise RuntimeError("agent failed")

    runtime = SimpleNamespace(
        resolve=lambda _name: object(),
        delegate=AsyncMock(side_effect=RuntimeError("agent failed")),
        resume=lambda *_args, **_kwargs: FailedEvents(),
    )
    variables = {}
    if mode == "resume":
        variables["__resume__agent"] = {
            "checkpoint_id": "checkpoint",
            "answer": "yes",
        }
    hidden = _module(namespace, "io").HiddenHolder(
        unique_id="agent",
        tool_context=SimpleNamespace(agent_controller=object()),
        agent_runtime=runtime,
        workflow_state=SimpleNamespace(variables=variables, metadata={}),
    )
    result = await module.run_agent_node(
        hidden=hidden,
        agent_name="researcher",
        prompt="test",
        allowed_tools=None,
        max_turns=None,
    )
    assert result.error == "agent failed"
    assert result.metadata["agent"] == "researcher"
    if mode == "resume":
        assert result.metadata["mode"] == "resume"
    record = next(r for r in failure_records if "agent_node" in r.message)
    assert isinstance(record.exc_info[1], RuntimeError)
    assert "Traceback (most recent call last):" in caplog.text
    assert "RuntimeError: agent failed" in caplog.text


@pytest.mark.parametrize("fails", [False, True])
async def test_hot_reload_delivers_change_and_logs_result(
    namespace,
    fails,
    tmp_path,
    monkeypatch,
    caplog,
    failure_records,
):
    module = _module(namespace, "nodes.hot_reload")
    handlers = []
    observer = SimpleNamespace(
        schedule=lambda handler, *_args, **_kwargs: handlers.append(handler),
        start=lambda: None,
        stop=lambda: None,
        join=lambda: None,
    )
    events = ModuleType("watchdog.events")
    events.FileSystemEventHandler = type("FileSystemEventHandler", (), {})
    observers = ModuleType("watchdog.observers")
    observers.Observer = lambda: observer
    monkeypatch.setitem(sys.modules, "watchdog", ModuleType("watchdog"))
    monkeypatch.setitem(sys.modules, "watchdog.events", events)
    monkeypatch.setitem(sys.modules, "watchdog.observers", observers)
    registry = module.NodeRegistry()
    loaded = asyncio.Event()

    async def load_directory(path, actual_registry, *, run_prestartup):
        assert path == tmp_path
        assert actual_registry is registry
        assert run_prestartup is False
        loaded.set()
        if fails:
            raise RuntimeError("pack failed")

    monkeypatch.setattr(module, "load_directory", load_directory)
    caplog.set_level(logging.INFO)
    reloader = module.HotReloader(tmp_path, registry=registry, debounce_sec=0)
    try:
        reloader.start(asyncio.get_running_loop())
        handlers[0].on_any_event(
            SimpleNamespace(
                is_directory=False,
                src_path=str(tmp_path / "node.py"),
            ),
        )
        await asyncio.wait_for(loaded.wait(), 5)
    finally:
        reloader.stop()
    event = "hot_reload_failed" if fails else "hot_reload_applied"
    record = next(r for r in failure_records if event in r.message)
    assert "node.py" in record.message
    if fails:
        assert isinstance(record.exc_info[1], RuntimeError)
        assert "Traceback (most recent call last):" in caplog.text
        assert "RuntimeError: pack failed" in caplog.text


@pytest.mark.parametrize(
    ("io_type", "factory"),
    [
        ("INT", "Int"),
        ("FLOAT", "Float"),
        ("BOOLEAN", "Boolean"),
        ("COMBO", "Combo"),
        ("FILE", "File"),
        ("OBJECT", "Object"),
        ("STRING", "String"),
        ("UNKNOWN", "String"),
    ],
)
def test_domain_parameter_schema_keeps_all_input_types(
    namespace,
    io_type,
    factory,
):
    module = _module(namespace, "nodes.domain_model_nodes")
    registry = _module(namespace, "adapter.domain_registry")
    adapter = registry.DomainModelAdapter(
        spec=registry.DomainModelSpec(
            task="schema",
            provider="typed",
            params=[registry.DomainParam(id="value", io_type=io_type)],
        ),
    )
    node = module.build_domain_model_node(adapter)
    field = node.get_schema().inputs[0]
    assert isinstance(
        field,
        getattr(_module(namespace, "io").IO, factory).Input,
    )
    assert field.id == "value"
    assert field.optional is True
