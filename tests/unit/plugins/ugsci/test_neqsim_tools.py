# -*- coding: utf-8 -*-
"""Contract tests for stable UGSci NeqSim tool bindings."""

# pylint: disable=protected-access

from __future__ import annotations

from types import SimpleNamespace

import pytest

from plugins.bundle.ugsci.domain.neqsim import tools
from qwenpaw.agents.builtin_mcp.neqsim import NEQSIM_CLIENT_KEY


@pytest.mark.asyncio
async def test_flash_maps_to_official_mcp_contract(monkeypatch) -> None:
    captured = {}

    async def fake_invoke(name, arguments):
        captured.update(name=name, arguments=arguments)
        return {"ok": True}

    monkeypatch.setattr(tools, "_invoke", fake_invoke)
    result = await tools.ugsci_neqsim_flash(
        {"methane": 0.9, "ethane": 0.1},
        25.0,
        50.0,
    )

    assert result == {"ok": True}
    assert captured["name"] == "runFlash"
    assert captured["arguments"]["temperatureUnit"] == "C"
    assert captured["arguments"]["pressureUnit"] == "bara"
    assert captured["arguments"]["flashType"] == "TP"
    assert (
        captured["arguments"]["components"] == '{"methane":0.9,"ethane":0.1}'
    )


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("function", "expected_tool", "expected_argument"),
    [
        (tools.ugsci_neqsim_pvt, "runPVT", "pvtJson"),
        (tools.ugsci_neqsim_process_simulate, "runProcess", "processJson"),
        (tools.ugsci_neqsim_pipeline_flow, "runPipeline", "pipelineJson"),
    ],
)
async def test_json_tools_use_official_contract(
    monkeypatch,
    function,
    expected_tool,
    expected_argument,
) -> None:
    captured = {}

    async def fake_invoke(name, arguments):
        captured.update(name=name, arguments=arguments)
        return "done"

    monkeypatch.setattr(tools, "_invoke", fake_invoke)
    assert await function({"model": "SRK"}) == "done"
    assert captured["name"] == expected_tool
    assert captured["arguments"][expected_argument] == '{"model":"SRK"}'


@pytest.mark.asyncio
async def test_phase_envelope_uses_get_phase_envelope(monkeypatch) -> None:
    captured = {}

    async def fake_invoke(name, arguments):
        captured.update(name=name, arguments=arguments)
        return "done"

    monkeypatch.setattr(tools, "_invoke", fake_invoke)
    assert await tools.ugsci_neqsim_phase_envelope({"methane": 1.0}) == "done"
    assert captured["name"] == "getPhaseEnvelope"
    assert captured["arguments"]["eos"] == "SRK"


@pytest.mark.asyncio
async def test_stable_tools_use_namespaced_builtin_driver(monkeypatch) -> None:
    captured = {}

    class Manager:
        async def list_driver_capabilities(self, name, *, kind):
            captured.update(name=name, kind=kind)
            return []

    monkeypatch.setattr(
        "qwenpaw.agents.builtin_mcp.neqsim_runtime.discover_runtime",
        lambda: SimpleNamespace(ready=True, to_dict=lambda: {}),
    )
    monkeypatch.setattr(
        tools,
        "_current_workspace",
        lambda: SimpleNamespace(driver_manager=Manager()),
    )

    result = await tools._invoke("runFlash", {})

    assert captured == {"name": NEQSIM_CLIENT_KEY, "kind": "tool"}
    assert result["error_type"] == "unsupported_operation"
