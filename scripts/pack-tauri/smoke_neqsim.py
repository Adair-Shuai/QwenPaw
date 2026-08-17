#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Start the staged NeqSim MCP server and execute a minimal TP flash."""

from __future__ import annotations

import argparse
import asyncio
import json
import os
from pathlib import Path

from qwenpaw.drivers.handlers.mcp_stateful_client import StdIOStatefulClient

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
    client = StdIOStatefulClient(
        name="neqsim-build-smoke",
        command=str(java),
        args=[
            "-Dfile.encoding=UTF-8",
            "-Dstdout.encoding=UTF-8",
            "-Dstderr.encoding=UTF-8",
            "-Dquarkus.profile=stdio",
            "-Dquarkus.log.level=WARN",
            "-Dquarkus.banner.enabled=false",
            "-jar",
            str(jar),
        ],
        read_timeout_seconds=60,
    )
    try:
        await client.connect(timeout=60)
        tools = await client.list_tools()
        names = {tool.name for tool in tools}
        missing = sorted(REQUIRED_TOOLS - names)
        if missing:
            raise RuntimeError(
                f"NeqSim MCP server is missing required tools: {missing}",
            )
        result = await client.call_tool(
            "runFlash",
            {
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
        )
        if bool(getattr(result, "isError", False)):
            raise RuntimeError(f"NeqSim TP flash failed: {result}")
        print(
            "NeqSim smoke passed: "
            f"{len(names)} tools discovered; runFlash completed",
        )
    finally:
        await client.close(ignore_errors=False)


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
