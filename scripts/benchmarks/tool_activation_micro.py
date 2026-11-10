# -*- coding: utf-8 -*-
"""Exhaustive catalog activation and bounded file-scan measurements."""

from __future__ import annotations

import asyncio
import json
import time
from pathlib import Path


def sdk_catalog_tools(catalog):
    from mcp.types import Tool
    from qwenpaw.drivers.adapters.agentscope_tool import DriverCapabilityTool
    from qwenpaw.drivers.handlers.mcp import _mcp_tool_to_capability

    async def unused_invoker(_request):
        raise AssertionError(
            "Catalog benchmark must never execute business tools",
        )

    tools = []
    for item in catalog:
        tool = Tool(
            name=item["name"],
            description=item["description"],
            inputSchema=item["input_schema"],
        )
        capability = _mcp_tool_to_capability("kdocs", tool)
        tools.append(DriverCapabilityTool(capability, unused_invoker))
    return tools


async def catalog_measurements(catalog, output, repeats=3):
    # pylint: disable=line-too-long
    from agentscope.state import AgentState
    from qwenpaw.runtime.tool_discovery import DiscoveryToolkit

    tools = sdk_catalog_tools(catalog)
    toolkit = DiscoveryToolkit(tools=tools)
    initial = await toolkit.get_tool_schemas()
    rows = []
    for repeat in range(repeats):
        for tool in tools:
            state = AgentState()
            started = time.perf_counter()
            result = await toolkit.search(tool.name, "kdocs", 1, state)
            schemas = await toolkit.get_tool_schemas(
                state.tool_context.activated_groups,
            )
            elapsed = time.perf_counter() - started
            visible = [s["function"]["name"] for s in schemas]
            rows.append(
                {
                    "name": tool.name,
                    "repeat": repeat,
                    "seconds": elapsed,
                    "found_first": bool(
                        result["tools"]
                        and result["tools"][0]["name"] == tool.name,
                    ),
                    "activated": tool.name in visible,
                    "visible_count": len(visible),
                    "schema_bytes": len(
                        json.dumps(schemas, ensure_ascii=False).encode(),
                    ),
                },
            )
    queries = [
        ("读取金山云文档正文", ["read_file"]),
        ("列出我的个人云文档", ["list_my_files"]),
        ("按名称搜索云文档", ["search_files"]),
        ("新建一个 Word 文档并写入正文", ["create_file_with_content"]),
        ("新建电子表格", ["create_empty_file"]),
        ("新建演示文稿", ["create_empty_file"]),
        (
            "读取电子表格单元格",
            ["sheet.get_range_data", "sheet.get_typed_value", "read_file"],
        ),
        ("获取表格指定矩形选区的数据", ["sheet.get_range_data"]),
        ("复制工作表", ["sheet.copy_worksheet"]),
        ("修改工作表名称", ["sheet.update_worksheet"]),
        ("获取问题反馈链接", ["get_feedback_url"]),
        ("列出文件夹子项", ["list_files"]),
        ("create presentation", ["create_empty_file"]),
        (
            "read spreadsheet range values",
            ["sheet.get_range_data", "sheet.get_typed_value", "read_file"],
        ),
        ("search files by keyword", ["search_files"]),
    ]
    semantics = []
    for query, expected in queries:
        state = AgentState()
        started = time.perf_counter()
        result = await toolkit.search(query, "kdocs", 5, state)
        matches = [item["name"] for item in result["tools"]]
        targets = ["kdocs__" + item.replace(".", "_") for item in expected]
        semantics.append(
            {
                "query": query,
                "expected": targets,
                "matches": matches,
                "hit_at_1": bool(matches and matches[0] in targets),
                "hit_at_5": any(name in matches for name in targets),
                "seconds": time.perf_counter() - started,
            },
        )
    result = {
        "catalog_count": len(tools),
        "initial_count": len(initial),
        "initial_schema_bytes": len(
            json.dumps(initial, ensure_ascii=False).encode(),
        ),
        "full_schema_bytes": sum(
            len(json.dumps(t.input_schema, ensure_ascii=False).encode())
            for t in tools
        ),
        "exact_activation": rows,
        "semantic_queries": semantics,
        "semantic_gold_version": "contract-v2",
        "semantic_gold_correction": "PPT/PPTX is unsupported by create_file_with_content. Blank spreadsheets use create_empty_file. Multiple range readers are contract-compatible. Historical v1 results are retained separately.",
        "scope": "Actual catalog definitions and SDK adapter, no MCP business execution",
    }
    (output / "catalog-activation.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return result


async def exposure_measurements(catalog, output):
    from agentscope.state import AgentState
    from agentscope.tool import Toolkit
    from qwenpaw.runtime.tool_discovery import DiscoveryToolkit

    tools = sdk_catalog_tools(catalog)
    direct = Toolkit(tools=tools)
    lazy = DiscoveryToolkit(tools=tools)
    rows = []
    for repeat in range(15):
        for mode, toolkit in [("full", direct), ("lazy", lazy)]:
            started = time.perf_counter()
            schemas = await toolkit.get_tool_schemas()
            rows.append(
                {
                    "mode": mode,
                    "repeat": repeat,
                    "seconds": time.perf_counter() - started,
                    "tools": len(schemas),
                    "schema_bytes": len(
                        json.dumps(schemas, ensure_ascii=False).encode(),
                    ),
                },
            )
    state = AgentState()
    budget_rows = []
    largest = sorted(
        tools,
        key=lambda tool: len(json.dumps(tool.input_schema)),
        reverse=True,
    )[:40]
    for tool in largest:
        await lazy.search(tool.name, "kdocs", 1, state)
        schemas = await lazy.get_tool_schemas(
            state.tool_context.activated_groups,
        )
        size = len(json.dumps(schemas, ensure_ascii=False).encode())
        active_count = len(schemas) - 1
        budget_rows.append(
            {
                "name": tool.name,
                "visible_count": len(schemas),
                "schema_bytes": size,
                "passed": len(schemas) <= 24
                and (size <= 32000 or active_count == 1),
            },
        )
    result = {
        "exposure": rows,
        "successive_activations": budget_rows,
        "scope": "630 real definitions via production MCP mapper and SDK adapter; no model request",
    }
    (output / "catalog-exposure.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return result


def scan_measurements(root: Path, output: Path, repeats=5):
    from qwenpaw.turn_files.scanner import normalize_roots, scan

    rows = []
    for label, count, size in [
        ("empty", 0, 0),
        ("small_20_files", 20, 1024),
        ("many_640_files", 640, 4096),
        ("large_128MiB", 640, 209715),
    ]:
        directory = root / "scan" / label
        directory.mkdir(parents=True, exist_ok=True)
        for index in range(count):
            (directory / f"file-{index:04d}.txt").write_bytes(b"x" * size)
        for repeat in range(repeats):
            started = time.perf_counter()
            snapshot = scan(normalize_roots([("project", directory)]))
            rows.append(
                {
                    "fixture": label,
                    "repeat": repeat,
                    "seconds": time.perf_counter() - started,
                    "files": len(snapshot.files),
                    "bytes_read": snapshot.bytes_read,
                    "incomplete": snapshot.incomplete,
                    "warnings": snapshot.warnings,
                    "cache": "OS-cache-uncontrolled; fixture freshly written before first scan",
                },
            )
    (output / "file-scan.json").write_text(
        json.dumps(rows, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return rows


if __name__ == "__main__":
    import argparse
    import tempfile

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--catalog", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--exposure-only", action="store_true")
    args = parser.parse_args()
    bench_output = Path(args.output).resolve()
    bench_output.mkdir(parents=True, exist_ok=True)
    bench_catalog = json.loads(
        Path(args.catalog).read_text(encoding="utf-8"),
    )
    if args.exposure_only:
        measured = asyncio.run(
            exposure_measurements(bench_catalog, bench_output),
        )
        print(
            json.dumps(
                {
                    "exposure_samples": len(measured["exposure"]),
                    "successive_activation_checks": len(
                        measured["successive_activations"],
                    ),
                    "passed": sum(
                        row["passed"]
                        for row in measured["successive_activations"]
                    ),
                },
            ),
        )
        raise SystemExit(0)
    measured = asyncio.run(catalog_measurements(bench_catalog, bench_output))
    scanned = scan_measurements(
        Path(tempfile.mkdtemp(prefix="qwenpaw-scan-bench-")),
        bench_output,
    )
    print(
        json.dumps(
            {
                "exact": len(measured["exact_activation"]),
                "activated": sum(
                    row["activated"] for row in measured["exact_activation"]
                ),
                "semantic_hit_at_5": sum(
                    row["hit_at_5"] for row in measured["semantic_queries"]
                ),
                "semantic_queries": len(measured["semantic_queries"]),
                "scans": len(scanned),
            },
        ),
    )
