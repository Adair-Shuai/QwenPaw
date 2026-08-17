#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Start NeqSim through MCP stdio and execute a minimal TP flash."""

from __future__ import annotations

import argparse
import asyncio
import json
import os
from pathlib import Path

REQUIRED_TOOLS = {
    "runFlash",
    "runPVT",
    "getPhaseEnvelope",
    "runProcess",
    "runPipeline",
}


def _java_name() -> str:
    return "java.exe" if os.name == "nt" else "java"


def _resolve_java(resource_dir: Path) -> Path:
    runtime = resource_dir / "java-runtime"
    for candidate in (
        runtime / "bin" / _java_name(),
        runtime / "Contents" / "Home" / "bin" / _java_name(),
    ):
        if candidate.is_file():
            return candidate.resolve()
    for candidate in runtime.rglob(_java_name()):
        if candidate.parent.name == "bin" and candidate.is_file():
            return candidate.resolve()
    raise SystemExit(f"staged Java runtime not found under {runtime}")


async def _smoke(java: Path, jar: Path) -> None:
    process = await asyncio.create_subprocess_exec(
        str(java),
        "-Dfile.encoding=UTF-8",
        "-Dstdout.encoding=UTF-8",
        "-Dstderr.encoding=UTF-8",
        "-Dquarkus.profile=stdio",
        "-Dquarkus.log.level=WARN",
        "-Dquarkus.banner.enabled=false",
        "-jar",
        str(jar),
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.DEVNULL,
    )
    try:
        request_id = 0

        async def notify(method: str, params: dict | None = None) -> None:
            payload = {"jsonrpc": "2.0", "method": method}
            if params is not None:
                payload["params"] = params
            assert process.stdin is not None
            process.stdin.write((json.dumps(payload) + "\n").encode())
            await process.stdin.drain()

        async def request(method: str, params: dict | None = None) -> dict:
            nonlocal request_id
            request_id += 1
            payload = {"jsonrpc": "2.0", "id": request_id, "method": method}
            if params is not None:
                payload["params"] = params
            assert process.stdin is not None and process.stdout is not None
            process.stdin.write((json.dumps(payload) + "\n").encode())
            await process.stdin.drain()
            while True:
                line = await asyncio.wait_for(process.stdout.readline(), 60)
                if not line:
                    raise RuntimeError("NeqSim MCP server closed its stdout")
                message = json.loads(line)
                if message.get("id") == request_id:
                    if "error" in message:
                        raise RuntimeError(
                            f"MCP request failed: {message['error']}",
                        )
                    return message.get("result", {})

        await request(
            "initialize",
            {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "ugsci-build-smoke", "version": "1"},
            },
        )
        await notify("notifications/initialized")
        tools_result = await request("tools/list")
        names = {item.get("name") for item in tools_result.get("tools", [])}
        missing = sorted(REQUIRED_TOOLS - names)
        if missing:
            raise RuntimeError(
                f"NeqSim MCP server is missing required tools: {missing}",
            )
        result = await request(
            "tools/call",
            {
                "name": "runFlash",
                "arguments": {
                    "components": json.dumps(
                        {"methane": 0.9, "ethane": 0.1},
                        separators=(",", ":"),
                    ),
                    "temperature": 25.0,
                    "temperatureUnit": "C",
                    "pressure": 100.0,
                    "pressureUnit": "bara",
                    "eos": "SRK",
                    "flashType": "TP",
                },
            },
        )
        if result.get("isError"):
            raise RuntimeError(f"NeqSim TP flash failed: {result}")
        print(
            "NeqSim smoke passed: "
            f"{len(names)} tools discovered; runFlash completed",
        )
    finally:
        if process.returncode is None:
            process.terminate()
            await process.wait()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--resource-dir", type=Path)
    parser.add_argument("--java", type=Path)
    parser.add_argument("--jar", type=Path)
    args = parser.parse_args()

    if args.resource_dir:
        resource_dir = args.resource_dir.expanduser().resolve()
        java = args.java or _resolve_java(resource_dir)
        jar = args.jar or resource_dir / "neqsim" / "neqsim-mcp-server.jar"
    else:
        if not args.java or not args.jar:
            parser.error("provide --resource-dir or both --java and --jar")
        java = args.java
        jar = args.jar
    java = java.expanduser().resolve()
    jar = jar.expanduser().resolve()
    if not java.is_file():
        raise SystemExit(f"Java executable not found: {java}")
    if not jar.is_file():
        raise SystemExit(f"NeqSim JAR not found: {jar}")
    asyncio.run(_smoke(java, jar))


if __name__ == "__main__":
    main()
