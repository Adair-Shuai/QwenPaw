# -*- coding: utf-8 -*-
"""Exercise runner stage ordering through real nodes, caches and progress."""

import asyncio
import importlib
from types import SimpleNamespace

import pytest


@pytest.fixture(
    params=[
        "plugins.bundle.flowforge.engine",
        "qwenpaw.plugins_bundle.flowforge.engine",
    ],
    name="engine",
)
def engine_modules(request):
    return SimpleNamespace(
        **{
            name: importlib.import_module(f"{request.param}.{name}")
            for name in (
                "runner",
                "nodes",
                "io",
                "caching",
                "cache_provider",
                "progress",
                "errors",
            )
        },
    )


@pytest.fixture(name="make_runner")
def runner_factory(engine):
    def create(node_class):
        class Provider(engine.cache_provider.NullCacheProvider):
            def __init__(self):
                self.lookups = []
                self.stores = []

            async def on_lookup(self, key):
                self.lookups.append(key)
                return None

            async def on_store(self, key, value):
                self.stores.append((key, value))

        registry = engine.nodes.NodeRegistry()
        registry.register(node_class)
        provider = Provider()
        progress = engine.progress.ProgressRegistry("pipeline")
        runner = engine.runner.NodeRunner(
            registry=registry,
            output_cache=engine.caching.BasicCache(),
            object_cache=engine.caching.BasicCache(),
            cache_keys=engine.caching.CacheKeySetID({}),
            progress=progress,
            cache_provider=provider,
        )
        return runner, provider, progress

    return create


async def test_runner_preserves_resolution_retry_lazy_cache_and_progress(
    engine,
    make_runner,
):
    events = []
    default = {"values": []}

    class Pipeline(engine.nodes.WorkflowNode):
        NODE_ID = "Pipeline"

        @classmethod
        def define_schema(cls):
            return engine.io.Schema(
                node_id=cls.NODE_ID,
                inputs=[
                    engine.io.IO.Any_.Input(id="value"),
                    engine.io.IO.Object.Input(id="options", default=default),
                    engine.io.IO.Any_.Input(
                        id="lazy_value",
                        lazy=True,
                        optional=True,
                    ),
                ],
            )

        def __init__(self):
            self.attempts = 0
            events.append("instance")

        def fingerprint_inputs(self, **_inputs):
            events.append("fingerprint")
            return "revision-1"

        def check_lazy_status(self, **_inputs):
            events.append("lazy")
            return ["lazy_value"]

        async def execute(self, *, hidden, **inputs):
            self.attempts += 1
            events.append("execute")
            assert hidden.unique_id == "node"
            assert inputs["value"] == {"nested": 7, "literal": ["p", True]}
            assert "__flow_dependencies" not in inputs
            assert inputs["lazy_value"] is None
            if self.attempts == 1:
                raise ConnectionError("connection reset")
            inputs["options"]["values"].append("used")
            hidden.progress.update(value=1, preview="ready")
            return engine.io.NodeOutput(
                values=(7,),
                metadata={"source": "node"},
            )

    runner, provider, progress = make_runner(Pipeline)
    hidden = engine.io.HiddenHolder(progress=progress)
    definition = {
        "class_type": "Pipeline",
        "inputs": {
            "value": {"nested": ["parent", 0], "literal": ["p", True]},
            "__flow_dependencies": ["ignored", 0],
        },
        "control": {"max_retries": 2, "retry_delay_sec": 0},
    }
    result = await runner.run("node", definition, {("parent", 0): 7}, hidden)
    cached = await runner.run("node", definition, {("parent", 0): 7}, hidden)
    assert result.output.as_tuple() == (7,)
    assert result.cached is False
    assert cached.cached is True
    assert cached.output is result.output
    assert events == [
        "instance",
        "fingerprint",
        "lazy",
        "execute",
        "execute",
        "fingerprint",
    ]
    assert default == {"values": []}
    assert hidden.unique_id is None
    assert len(provider.lookups) == len(provider.stores) == 1
    assert provider.stores[0][1]["metadata"] == {"source": "node"}
    assert progress.state("node").preview == "ready"
    assert progress.state("node").metadata["retry"] == 1
    assert progress.status("node") is engine.progress.NodeStatus.CACHED
    assert [
        event.state.status.value
        for event in progress.history()
        if event.type != "progress"
    ] == [
        "running",
        "running",
        "success",
        "cached",
    ]
    before = len(progress.history())
    progress.update(preview="outside node")
    assert len(progress.history()) == before


@pytest.mark.parametrize(
    "mode",
    ["sentinel", "not_idempotent", "control_flow"],
)
async def test_runner_keeps_cache_bypass_and_legacy_output_normalization(
    engine,
    make_runner,
    mode,
):
    calls = []

    class Uncached(engine.nodes.WorkflowNode):
        NODE_ID = "Uncached"

        @classmethod
        def define_schema(cls):
            return engine.io.Schema(
                node_id=cls.NODE_ID,
                not_idempotent=mode == "not_idempotent",
                control_flow=mode == "control_flow",
            )

        def fingerprint_inputs(self, **_inputs):
            return engine.io.Contract.NOT_CACHEABLE

        async def execute(self, *, hidden, **_inputs):
            calls.append(hidden.unique_id)
            return (42,)

    runner, provider, progress = make_runner(Uncached)
    for _ in range(2):
        result = await runner.run(
            "node",
            {"class_type": "Uncached"},
            {},
            engine.io.HiddenHolder(),
        )
        assert result.output.as_tuple() == (42,)
        assert result.cached is False
    assert calls == ["node", "node"]
    assert provider.lookups == provider.stores == []
    assert progress.status("node") is engine.progress.NodeStatus.SUCCESS


@pytest.mark.parametrize(
    "mode",
    ["blocked", "expand_forbidden", "expand_allowed"],
)
async def test_runner_keeps_expansion_guard_and_blocked_cache_rules(
    engine,
    make_runner,
    mode,
):
    definition = {"class_type": "FinalState"}

    class FinalState(engine.nodes.WorkflowNode):
        NODE_ID = "FinalState"

        @classmethod
        def define_schema(cls):
            return engine.io.Schema(
                node_id=cls.NODE_ID,
                enable_expand=mode == "expand_allowed",
            )

        async def execute(self, *, hidden, **_inputs):
            assert hidden.unique_id == "node"
            if mode == "blocked":
                return engine.io.NodeOutput(block_execution="approval")
            if mode == "expand_forbidden":
                definition["class_type"] = "ChangedDuringExecution"
            return engine.io.NodeOutput(expand={"child": {}})

    runner, provider, progress = make_runner(FinalState)
    call = runner.run(
        "node",
        definition,
        {},
        engine.io.HiddenHolder(),
    )
    if mode == "expand_forbidden":
        with pytest.raises(
            engine.errors.WorkflowEngineError,
            match=r"\(FinalState\).*enable_expand",
        ):
            await call
        assert provider.stores == []
    else:
        result = await call
        assert result.error is None
        if mode == "blocked":
            assert (
                progress.status("node") is engine.progress.NodeStatus.BLOCKED
            )
            assert progress.state("node").metadata["tag"] == "approval"
            assert provider.stores == []
        else:
            assert result.output.expand == {"child": {}}
            assert len(provider.stores) == 1


async def test_runner_cancellation_propagates_without_retry_or_cache_write(
    engine,
    make_runner,
):
    entered = asyncio.Event()
    stopped = asyncio.Event()
    attempts = []

    class Waiting(engine.nodes.WorkflowNode):
        NODE_ID = "Waiting"

        @classmethod
        def define_schema(cls):
            return engine.io.Schema(node_id=cls.NODE_ID)

        async def execute(self, *, hidden, **_inputs):
            attempts.append(hidden.unique_id)
            entered.set()
            try:
                await asyncio.Event().wait()
            finally:
                stopped.set()

    runner, provider, _ = make_runner(Waiting)
    task = asyncio.create_task(
        runner.run(
            "node",
            {"class_type": "Waiting", "control": {"max_retries": 3}},
            {},
            engine.io.HiddenHolder(),
        ),
    )
    try:
        await asyncio.wait_for(entered.wait(), 2)
        task.cancel()
        with pytest.raises(asyncio.CancelledError):
            await task
        assert stopped.is_set()
        assert attempts == ["node"]
        assert provider.stores == []
    finally:
        task.cancel()
        await asyncio.gather(task, return_exceptions=True)
