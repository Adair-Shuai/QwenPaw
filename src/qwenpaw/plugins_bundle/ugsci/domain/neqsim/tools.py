# -*- coding: utf-8 -*-
"""Stable UGSci tool contracts backed by the built-in NeqSim MCP Driver."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def _json_argument(value: Any) -> str:
    if isinstance(value, str):
        return value
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def _current_workspace() -> Any | None:
    from qwenpaw.config.context import get_current_workspace_dir
    from qwenpaw.plugins.registry import PluginRegistry

    manager = PluginRegistry().get_workspace_manager()
    if manager is None:
        return None
    workspaces = getattr(manager, "agents", getattr(manager, "workspaces", {}))
    current_dir = get_current_workspace_dir()
    if current_dir is not None:
        resolved = Path(current_dir).resolve()
        for workspace in workspaces.values():
            if Path(workspace.workspace_dir).resolve() == resolved:
                return workspace
    if len(workspaces) == 1:
        return next(iter(workspaces.values()))
    return None


def _request_context() -> dict[str, str]:
    session_id = ""
    try:
        from qwenpaw.app.agent_context import get_current_session_id

        session_id = str(get_current_session_id() or "")
    except Exception:
        pass
    if not session_id:
        try:
            from qwenpaw.config.context import get_current_session_id

            session_id = str(get_current_session_id() or "")
        except Exception:
            pass
    return {"session_id": session_id} if session_id else {}


async def _invoke(tool_name: str, arguments: dict[str, Any]) -> Any:
    try:
        from qwenpaw.agents.builtin_mcp.neqsim import NEQSIM_CLIENT_KEY
        from qwenpaw.agents.builtin_mcp.neqsim_runtime import discover_runtime
        from qwenpaw.drivers.capabilities import DriverInvocation
    except Exception as exc:
        return {
            "ok": False,
            "error_type": "runtime_unavailable",
            "message": f"NeqSim integration is not available: {exc}",
        }

    status = discover_runtime()
    if not status.ready:
        return {
            "ok": False,
            "error_type": "dependency_unavailable",
            "message": "NeqSim 内置能力已注册，但运行环境尚未安装完整。",
            "runtime": status.to_dict(),
        }

    workspace = _current_workspace()
    manager = getattr(workspace, "driver_manager", None) if workspace else None
    if manager is None:
        return {
            "ok": False,
            "error_type": "workspace_unavailable",
            "message": "无法定位当前工作区的 NeqSim Driver。",
        }

    try:
        capabilities = await manager.list_driver_capabilities(
            NEQSIM_CLIENT_KEY,
            kind="tool",
        )
    except Exception as exc:
        return {
            "ok": False,
            "error_type": "driver_unavailable",
            "message": str(exc),
            "runtime": status.to_dict(),
        }
    capability = next((item for item in capabilities if item.name == tool_name), None)
    if capability is None:
        return {
            "ok": False,
            "error_type": "unsupported_operation",
            "message": f"当前 NeqSim MCP Server 未提供必需工具 {tool_name}。",
            "discovered_tools": [item.name for item in capabilities],
        }

    result = await manager.invoke_capability(
        DriverInvocation(
            capability_id=capability.capability_id,
            payload=arguments,
            request_context=_request_context(),
        ),
    )
    if result.ok:
        return result.value
    return {
        "ok": False,
        "error_type": result.error_type or "execution_error",
        "message": result.message,
        "metadata": dict(result.metadata or {}),
    }


async def ugsci_neqsim_flash(
    components: dict[str, float],
    temperature: float,
    pressure: float,
    temperature_unit: str = "C",
    pressure_unit: str = "bara",
    eos: str = "SRK",
    flash_type: str = "TP",
) -> Any:
    """Run an exact NeqSim ``runFlash`` calculation."""
    return await _invoke(
        "runFlash",
        {
            "components": _json_argument(components),
            "temperature": temperature,
            "temperatureUnit": temperature_unit,
            "pressure": pressure,
            "pressureUnit": pressure_unit,
            "eos": eos,
            "flashType": flash_type,
        },
    )


async def ugsci_neqsim_pvt(specification: dict[str, Any] | str) -> Any:
    """Run an exact NeqSim ``runPVT`` laboratory experiment."""
    return await _invoke("runPVT", {"pvtJson": _json_argument(specification)})


async def ugsci_neqsim_phase_envelope(
    components: dict[str, float],
    eos: str = "SRK",
) -> Any:
    """Run an exact NeqSim ``getPhaseEnvelope`` calculation."""
    return await _invoke(
        "getPhaseEnvelope",
        {"components": _json_argument(components), "eos": eos},
    )


async def ugsci_neqsim_process_simulate(process: dict[str, Any] | str) -> Any:
    """Run an exact NeqSim ``runProcess`` flowsheet simulation."""
    return await _invoke("runProcess", {"processJson": _json_argument(process)})


async def ugsci_neqsim_pipeline_flow(specification: dict[str, Any] | str) -> Any:
    """Run an exact NeqSim ``runPipeline`` multiphase-flow calculation."""
    return await _invoke(
        "runPipeline",
        {"pipelineJson": _json_argument(specification)},
    )
