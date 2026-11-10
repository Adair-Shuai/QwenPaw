# -*- coding: utf-8 -*-
"""Measure MCP cold/warm catalogs with the real transport and driver handler."""
# pylint: disable=protected-access

from __future__ import annotations

import argparse
import asyncio
import json
import os
import tempfile
import time
from dataclasses import replace
from pathlib import Path

from tool_activation_server import BenchServer


async def measure(server):
    # pylint: disable=too-many-branches,too-many-statements
    from qwenpaw.drivers.capabilities import DriverInvocation
    from qwenpaw.drivers.contracts import DriverCard
    from qwenpaw.drivers.credentials.providers import NoneProvider
    from qwenpaw.drivers.handlers.mcp import MCPDriverHandler
    from qwenpaw.drivers.manager import DriverManager
    from qwenpaw.drivers.policy_types import DriverPolicy

    rows = []
    server.measurements = rows
    for delay in [0.0, 0.3, 1.0]:
        for repeat in range(3):
            name = f"transport_{delay}_{repeat}".replace(".", "_")
            server.list_delay = delay
            owner = MCPDriverHandler(
                DriverCard(
                    name=name,
                    protocol="mcp",
                    endpoint={
                        "transport": "streamable_http",
                        "url": server.url + "/mcp/" + name,
                        "http_timeout": 8,
                    },
                    policy=DriverPolicy(default_effect="allow"),
                ),
                NoneProvider(),
            )
            begin = time.perf_counter()
            await owner.init()
            connected = time.perf_counter()
            try:
                pending = [
                    asyncio.create_task(owner.list_capabilities())
                    for _ in range(16)
                ]
                await asyncio.sleep(0)
                pending[0].cancel()
                results = await asyncio.gather(
                    *pending,
                    return_exceptions=True,
                )
                cold_end = time.perf_counter()
                warm = []
                for _ in range(16):
                    started = time.perf_counter()
                    capabilities = await owner.list_capabilities()
                    warm.append(time.perf_counter() - started)
                rpc = [
                    r
                    for r in server.mcp_calls
                    if r["owner"] == name and r["method"] == "tools/list"
                ]
                successful = [r for r in results if isinstance(r, list)]
                rows.append(
                    {
                        "scenario": "cold_concurrent_then_warm",
                        "delay_s": delay,
                        "repeat": repeat,
                        "connect_s": connected - begin,
                        "cold_wait_s": cold_end - connected,
                        "cold_total_s": cold_end - begin,
                        "concurrent_waiters": 16,
                        "successful_waiters": len(successful),
                        "cancelled_waiters": sum(
                            isinstance(r, asyncio.CancelledError)
                            for r in results
                        ),
                        "list_rpc_pages": len(rpc),
                        "tools": len(capabilities),
                        "warm_seconds": warm,
                        "passed": len(successful) == 15
                        and all(len(r) == 633 for r in successful)
                        and len(rpc) == 3,
                    },
                )
                if delay == 0.3 and repeat == 0:
                    target = next(
                        c
                        for c in capabilities
                        if c.name == "bench_write_document"
                    )
                    owner.sync_runtime_metadata(
                        replace(owner.card, config={"tools": ["bench_probe"]}),
                    )
                    before = len(server.mcp_calls)
                    denied = await owner.invoke_capability(
                        DriverInvocation(
                            target.capability_id,
                            {"doc_id": "forbidden", "content": "blocked"},
                            {},
                        ),
                    )
                    rows.append(
                        {
                            "scenario": "whitelist_revoke_previous_capability",
                            "passed": denied.error_type == "tool_disabled"
                            and len(server.mcp_calls) == before,
                            "error_type": denied.error_type,
                            "tools_call_rpc": len(server.mcp_calls) - before,
                        },
                    )
            finally:
                await owner.shutdown()
    server.list_delay = 0
    server.offline = True
    owner = MCPDriverHandler(
        DriverCard(
            name="cold_offline",
            protocol="mcp",
            endpoint={
                "transport": "streamable_http",
                "url": server.url + "/mcp/cold_offline",
                "http_timeout": 2,
            },
        ),
        NoneProvider(),
    )
    started = time.perf_counter()
    await owner.init()
    failed = False
    try:
        try:
            await owner.list_capabilities()
        except Exception:
            failed = True
        elapsed = time.perf_counter() - started
        server.offline = False
        capabilities = await owner.list_capabilities()
        rows.append(
            {
                "scenario": "cold_failure_then_recovery",
                "failure_s": elapsed,
                "tools_after_recovery": len(capabilities),
                "passed": failed and len(capabilities) == 633,
            },
        )
    finally:
        await owner.shutdown()
    server.list_delay = 2.0
    for total, broken in [(12, False), (3, True)]:
        manager = DriverManager(server.root / ("manager_" + str(total)), None)
        manager.register_handler_type("mcp", MCPDriverHandler)
        owners = []
        for index in range(total):
            name = f"parallel_{total}_{index}"
            owner = manager._build_handler(
                DriverCard(
                    name=name,
                    protocol="mcp",
                    endpoint={
                        "transport": "streamable_http",
                        "url": server.url + "/mcp/" + name,
                        "http_timeout": 8,
                    },
                ),
            )
            owners.append(owner)
            if broken and index == total - 1:
                server.offline_owners.add(name)
        manager._handlers = {o.name: o for o in owners}
        started = time.perf_counter()
        try:
            # Production initializes Driver connections sequentially while
            # their catalog prefetch tasks run under the shared semaphore.
            for owner in owners:
                await owner.init()
            connected = time.perf_counter()
            capabilities = await manager.list_capabilities(kind="tool")
            elapsed = time.perf_counter() - started
            intervals = []
            for owner in owners:
                rpc = [
                    r
                    for r in server.mcp_calls
                    if r["owner"] == owner.name and r["method"] == "tools/list"
                ]
                if rpc:
                    intervals.extend(
                        [
                            (min(r["start"] for r in rpc), 1),
                            (max(r["end"] for r in rpc), -1),
                        ],
                    )
            active = maximum = 0
            for _at, delta in sorted(intervals):
                active += delta
                maximum = max(maximum, active)
            expected = (total - int(broken)) * 633
            rows.append(
                {
                    "scenario": (
                        "manager_partial_failure"
                        if broken
                        else "manager_parallel_12_servers"
                    ),
                    "servers": total,
                    "seconds": elapsed,
                    "connect_s": connected - started,
                    "catalog_wait_s": time.perf_counter() - connected,
                    "capabilities": len(capabilities),
                    "max_parallel_catalogs": maximum,
                    "passed": len(capabilities) == expected and maximum <= 8,
                },
            )
        finally:
            await asyncio.gather(*(owner.shutdown() for owner in owners))
    return rows


async def measure_periodic(server):
    from qwenpaw.drivers.contracts import DriverCard
    from qwenpaw.drivers.credentials.providers import NoneProvider
    from qwenpaw.drivers.handlers.mcp import MCPDriverHandler

    name = "periodic_without_notifications"
    owner = MCPDriverHandler(
        DriverCard(
            name=name,
            protocol="mcp",
            endpoint={
                "transport": "streamable_http",
                "url": server.url + "/mcp/" + name,
                "http_timeout": 8,
            },
        ),
        NoneProvider(),
    )
    await owner.init()
    try:
        first = await owner.list_capabilities()
        baseline = [
            r
            for r in server.mcp_calls
            if r["owner"] == name and r["method"] == "tools/list"
        ]
        baseline_end = max(r["end"] for r in baseline)
        initial_count = len(baseline)
        started = time.perf_counter()
        refreshed = []
        while time.perf_counter() - started < 35:
            refreshed = [
                r
                for r in server.mcp_calls
                if r["owner"] == name and r["method"] == "tools/list"
            ][initial_count:]
            if len(refreshed) == 3 and all("end" in r for r in refreshed):
                break
            await asyncio.sleep(0.1)
        after = (
            min((r["start"] for r in refreshed), default=baseline_end)
            - baseline_end
        )
        return [
            {
                "scenario": name,
                "seconds_after_previous_refresh": after,
                "pages": len(refreshed),
                "tools": len(first),
                "passed": len(first) == 633
                and len(refreshed) == 3
                and 29 <= after <= 35,
            },
        ]
    finally:
        await owner.shutdown()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--catalog", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--periodic-only", action="store_true")
    args = parser.parse_args()
    os.environ["NO_PROXY"] = "127.0.0.1,localhost,::1"
    output = Path(args.output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    server = BenchServer(
        Path(tempfile.mkdtemp(prefix="qwenpaw-transport-bench-")),
        json.loads(Path(args.catalog).read_text(encoding="utf-8")),
    )
    server.start()
    try:
        rows = asyncio.run(
            measure_periodic(server)
            if args.periodic_only
            else measure(server),
        )
        result_name = "periodic" if args.periodic_only else "transport"
        (output / (result_name + ".json")).write_text(
            json.dumps(rows, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        (output / (result_name + "-rpc.json")).write_text(
            json.dumps(server.mcp_calls, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(
            json.dumps(
                {
                    "checks": len(rows),
                    "passed": sum(r["passed"] for r in rows),
                },
            ),
        )
    finally:
        if hasattr(server, "measurements"):
            (output / "transport.json").write_text(
                json.dumps(server.measurements, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            (output / "transport-rpc.json").write_text(
                json.dumps(server.mcp_calls, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
        server.close()


if __name__ == "__main__":
    main()
