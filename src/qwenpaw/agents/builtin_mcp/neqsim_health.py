# -*- coding: utf-8 -*-
"""Bounded, real MCP admission check for a freshly downloaded runtime."""

from __future__ import annotations

import asyncio
import json
import math
import os
import subprocess
from typing import Any

REQUIRED_TOOLS = {
    "runFlash",
    "runPVT",
    "getPhaseEnvelope",
    "runProcess",
    "runPipeline",
}


async def _check(endpoint: dict[str, Any]) -> None:
    process = await asyncio.create_subprocess_exec(
        endpoint["command"],
        *endpoint["args"],
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.DEVNULL,
        creationflags=(subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0),
    )
    try:

        async def request(identifier, method, params):
            payload = {"jsonrpc": "2.0", "method": method, "params": params}
            if identifier is not None:
                payload["id"] = identifier
            process.stdin.write((json.dumps(payload) + "\n").encode())
            await process.stdin.drain()
            if identifier is None:
                return {}
            while True:
                line = await process.stdout.readline()
                if not line:
                    raise RuntimeError("NeqSim 服务在验证期间退出")
                message = json.loads(line)
                if message.get("id") != identifier:
                    continue
                if "error" in message:
                    raise RuntimeError("NeqSim 服务未通过调用验证")
                return message.get("result", {})

        async def validate():
            await request(
                1,
                "initialize",
                {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {},
                    "clientInfo": {
                        "name": "ugsci-runtime-check",
                        "version": "1",
                    },
                },
            )
            await request(None, "notifications/initialized", {})
            tools = await request(2, "tools/list", {})
            if not REQUIRED_TOOLS <= {
                t.get("name") for t in tools.get("tools", [])
            }:
                raise RuntimeError("NeqSim 缺少所需计算工具")
            result = await request(
                3,
                "tools/call",
                {
                    "name": "runFlash",
                    "arguments": {
                        "components": '{"methane":0.9,"ethane":0.1}',
                        "temperature": 25.0,
                        "temperatureUnit": "C",
                        "pressure": 100.0,
                        "pressureUnit": "bara",
                        "eos": "SRK",
                        "flashType": "TP",
                    },
                },
            )
            if result.get("isError") or not result.get("content"):
                raise RuntimeError("NeqSim 闪蒸计算验证失败")
            try:
                output = json.loads(
                    next(
                        item["text"]
                        for item in result["content"]
                        if item.get("type") == "text"
                    ),
                )
                density = float(output["fluid"]["properties"]["density_kgm3"])
                if (
                    output.get("status") != "success"
                    or output["flash"]["numberOfPhases"] < 1
                    or not math.isfinite(density)
                    or density <= 0
                ):
                    raise ValueError("invalid flash result")
            except (KeyError, TypeError, ValueError, StopIteration) as exc:
                raise RuntimeError("NeqSim 闪蒸计算未返回有效结果") from exc

        await asyncio.wait_for(validate(), timeout=90)
    finally:
        if process.returncode is None:
            process.kill()
        await process.wait()


def verify_runtime(endpoint: dict[str, Any]) -> None:
    (
        "Called on the installer worker, never on the application's event "
        "loop."
    )
    asyncio.run(_check(endpoint))
