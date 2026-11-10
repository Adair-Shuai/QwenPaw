# -*- coding: utf-8 -*-
"""Recorded wall-clock timing, retries and response-usage inspection."""

import asyncio
import importlib
import time

from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest


@pytest.fixture(
    name="analytics_environment",
    params=["qwenpaw.plugins_bundle", "plugins.bundle"],
)
def _analytics_environment(request, tmp_path):
    package = f"{request.param}.flowforge"
    service_module = importlib.import_module(f"{package}.service")
    router_module = importlib.import_module(f"{package}.router")
    nodes = importlib.import_module(f"{package}.engine.nodes")
    io = importlib.import_module(f"{package}.engine.io")
    service = service_module.WorkflowService(flows_dir=tmp_path)

    class AnalyticsLLM(nodes.WorkflowNode):
        NODE_ID = "AnalyticsLLM"

        @classmethod
        def define_schema(cls):
            return io.Schema(
                node_id=cls.NODE_ID,
                inputs=[io.IO.Boolean.Input(id="retry", default=False)],
                outputs=[io.IO.String.Output(id="text")],
            )

        async def execute(self, *, hidden, retry=False):
            # pylint: disable=unused-argument
            self.calls = getattr(self, "calls", 0) + 1
            if retry and self.calls == 1:
                raise TimeoutError("retry this actual attempt")
            await asyncio.sleep(0.005)
            return io.NodeOutput(
                values=("中文 English",),
                metadata={
                    "model": "actual-model",
                    "provider": "actual-provider",
                    "usage": {
                        "input_tokens": 0,
                        "output_tokens": 3,
                        "total_tokens": 3,
                    },
                },
            )

    service.executor.node_registry.register(AnalyticsLLM)
    app = FastAPI()
    app.include_router(router_module.build_router(service))
    with TestClient(app) as client:
        yield service, client, package
    service.close(timeout=3)


def finished_record(service, client, flow_id):
    handle = service.start_run(flow_id)
    deadline = time.monotonic() + 5
    while not handle.is_done and time.monotonic() < deadline:
        time.sleep(0.01)
    assert handle.is_done, handle.to_dict()
    response = client.get(f"/runs/{handle.run_id}")
    assert response.status_code == 200
    return response.json()


def test_real_run_records_wall_clock_timing_and_explicit_retry_count(
    analytics_environment,
):
    service, client, _ = analytics_environment
    service.save_flow(
        "analytics-retry",
        {
            "id": "analytics-retry",
            "nodes": {
                "model": {
                    "class_type": "AnalyticsLLM",
                    "inputs": {"retry": True},
                    "control": {"max_retries": 1, "retry_delay_sec": 0},
                },
            },
        },
    )
    earliest = int(time.time() * 1000)
    record = finished_record(service, client, "analytics-retry")
    latest = int(time.time() * 1000)
    assert record["status"] == "completed", record
    detail = record["node_details"]["model"]
    assert earliest <= detail["started_at_ms"] <= detail["finished_at_ms"]
    assert detail["finished_at_ms"] <= latest
    assert detail["retry_count"] == 1
    assert len(detail["timeline"]) == 1
    assert detail["timeline"][0]["retry_count"] == 1
    assert sum(event["type"] == "executing" for event in record["events"]) == 2
    assert detail["usage_summary"]["input_tokens"] == 0
    assert detail["usage_summary"]["output_tokens"] == 3
    assert detail["usage_summary"]["recorded_executions"] == 1


def test_cached_run_keeps_original_output_without_rebilling_response_usage(
    analytics_environment,
):
    service, _, package = analytics_environment
    runner_module = importlib.import_module(f"{package}.engine.runner")
    caching = importlib.import_module(f"{package}.engine.caching")
    progress_module = importlib.import_module(f"{package}.engine.progress")
    io = importlib.import_module(f"{package}.engine.io")
    inspection = importlib.import_module(f"{package}.inspection")
    progress = progress_module.ProgressRegistry("analytics-cache")
    runner = runner_module.NodeRunner(
        registry=service.executor.node_registry,
        output_cache=caching.BasicCache(),
        object_cache=caching.BasicCache(),
        cache_keys=caching.CacheKeySetID({}),
        progress=progress,
    )
    definition = {"class_type": "AnalyticsLLM", "inputs": {}}

    async def execute_twice():
        hidden = io.HiddenHolder(progress=progress)
        original = await runner.run("model", definition, {}, hidden)
        cached = await runner.run("model", definition, {}, hidden)
        return original, cached

    original, cached = asyncio.run(execute_twice())
    assert cached.cached is True
    assert original.output.as_tuple() == cached.output.as_tuple()
    details = inspection.node_details(
        {
            "node_statuses": progress.node_statuses(),
            "events": [event.to_dict() for event in progress.history()],
            "execution_history": [
                {
                    "node_id": "model",
                    "status": "completed",
                    "metadata": {
                        **result.output.metadata,
                        "cache_hit": result.cached,
                    },
                    "output": result.output.as_tuple(),
                }
                for result in (original, cached)
            ],
        },
        {"nodes": {"model": definition}},
    )
    detail = details["model"]
    assert detail["status"] == "cached"
    assert detail["metadata"]["cache_hit"] is True
    assert detail["usage_summary"]["recorded_executions"] == 1
    assert detail["usage_summary"]["total_tokens"] == 3
    assert "started_at_ms" not in detail
    assert len(detail["timeline"]) == 2
    assert "started_at_ms" not in detail["timeline"][1]


def test_legacy_inspection_preserves_unknown_times_and_sums_recorded_usage(
    analytics_environment,
):
    _, _, package = analytics_environment
    inspection = importlib.import_module(f"{package}.inspection")
    snapshot = {"nodes": {"model": {"class_type": "LLMCallNode"}}}
    history = [
        {
            "node_id": "model",
            "status": "completed",
            "duration_ms": 25,
            "metadata": {
                "usage": {"prompt_tokens": 0, "completion_tokens": 3},
            },
        },
        {
            "node_id": "model",
            "status": "completed",
            "metadata": {"cache_hit": True, "usage": {"total_tokens": 999}},
        },
        {
            "node_id": "model",
            "status": "completed",
            "metadata": {"usage": {"input_tokens": 2, "output_tokens": 0}},
        },
        {
            "node_id": "model",
            "status": "failed",
            "error": "missing usage",
            "duration_ms": 0,
            "metadata": {"duration_ms": 17},
        },
    ]
    details = inspection.node_details(
        {"execution_history": history, "node_statuses": {"model": "failed"}},
        snapshot,
    )
    detail = details["model"]
    assert "started_at_ms" not in detail
    assert "timeline" not in detail
    assert "retry_count" not in detail
    assert detail["usage_summary"] == {
        "input_tokens": 2,
        "output_tokens": 3,
        "total_tokens": 5,
        "recorded_executions": 2,
        "executions": 3,
        "incomplete": True,
    }
    assert detail["error"] == "missing usage"
    assert detail["duration_ms"] == 17
    assert detail["metadata"] == {"duration_ms": 17}
    assert "usage_summary" not in history[0]
