# -*- coding: utf-8 -*-
"""Replay discovery before and after a review against versioned contracts."""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import importlib.util
import json
import statistics
import time
from pathlib import Path

from agentscope.state import AgentState
from tool_activation_micro import sdk_catalog_tools

from qwenpaw.runtime.tool_discovery import DiscoveryToolkit


def cases(original):
    revised = {
        "新建电子表格": ["create_empty_file"],
        "新建演示文稿": ["create_empty_file"],
        "create presentation": ["create_empty_file"],
        "读取电子表格单元格": [
            "sheet.get_range_data",
            "sheet.get_typed_value",
            "read_file",
        ],
        "read spreadsheet range values": [
            "sheet.get_range_data",
            "sheet.get_typed_value",
            "read_file",
        ],
    }
    result = []
    for item in original["semantic_queries"]:
        query = item["query"]
        expected = revised.get(query)
        result.append(
            {
                "split": "development",
                "query": query,
                "expected": (
                    ["kdocs__" + name.replace(".", "_") for name in expected]
                    if expected
                    else item["expected"]
                ),
                "original_expected": item["expected"],
                "gold_changed": expected is not None,
            },
        )
    validation = [
        ("读取云端 PDF 的全文", ["read_file"]),
        ("read pptx document content", ["read_file"]),
        ("创建空白 xlsx 文件", ["create_empty_file"]),
        ("create blank pptx", ["create_empty_file"]),
        ("create docx with content", ["create_file_with_content"]),
        ("新建空白文件夹", ["create_folder"]),
        ("search folders by path", ["search_folders"]),
        ("按文件名检索云文档", ["search_files"]),
        ("获取云文档全文评论列表", ["list_document_comments"]),
        ("读取云文档正文划选批注", ["get_file_inline_comments"]),
        ("列出文件历史版本", ["list_file_versions"]),
        ("get file version download", ["get_file_version_download"]),
        ("获取回收站文件列表", ["list_deleted_files"]),
        ("restore deleted file", ["restore_deleted_file"]),
        ("复制文件到指定位置", ["copy_file"]),
        ("批量移动文件到目录", ["move_file"]),
        ("rename file", ["rename_file"]),
        ("上传本地文件新建云文档", ["upload_new_file"]),
        ("通过上传本地文件全量覆盖已有云文档", ["upload_replace_file"]),
        ("cancel file sharing", ["cancel_share"]),
        ("获取自定义标签列表", ["list_labels"]),
        ("读取区域数据并保留单元格类型", ["sheet.get_typed_value"]),
        ("获取指定区域的数据校验规则", ["sheet.get_data_validations"]),
        ("复制工作表，不要删除", ["sheet.copy_worksheet"]),
    ]
    for query, expected in validation:
        result.append(
            {
                "split": "validation",
                "query": query,
                "expected": [
                    "kdocs__" + name.replace(".", "_") for name in expected
                ],
            },
        )
    for query in (
        "qwenpaw_data_execute_sql",
        "materialize_skill",
        "unknown__read_file",
        "kdocs__missing_action",
    ):
        result.append(
            {
                "split": "negative",
                "query": query,
                "expected": [],
                "expect_empty": True,
                "namespace": "",
            },
        )
    result.extend(
        [
            {
                "split": "negative",
                "query": "create pptx with content",
                "forbidden": ["kdocs__create_file_with_content"],
            },
            {
                "split": "negative",
                "query": "读取工作表，不要删除",
                "forbidden_operations": ["delete", "remove"],
            },
        ],
    )
    return result


def load_baseline(path):
    spec = importlib.util.spec_from_file_location(
        "review_baseline_discovery",
        path,
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.DiscoveryToolkit


def summarize(rows):
    result = []
    for version in ("baseline", "review"):
        for split in ("development", "validation", "negative", "exact"):
            group = [
                row
                for row in rows
                if row["version"] == version and row["split"] == split
            ]
            first = [row for row in group if row.get("repeat", 0) == 0]
            result.append(
                {
                    "version": version,
                    "split": split,
                    "samples": len(group),
                    "unique_cases": len(first),
                    "hit_at_1": sum(
                        row.get("hit_at_1", False) for row in first
                    ),
                    "hit_at_5": sum(
                        row.get("hit_at_5", False) for row in first
                    ),
                    "passed": sum(row["passed"] for row in first),
                    "median_seconds": statistics.median(
                        row["seconds"] for row in group
                    ),
                },
            )
    return result


async def run(args):
    # pylint: disable=line-too-long,too-many-statements
    output = Path(args.output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    target = output / "discovery-replay.json"
    if target.exists():
        raise ValueError("Use a fresh review output directory")
    source_path = Path("src/qwenpaw/runtime/tool_discovery.py")
    source_sha = hashlib.sha256(source_path.read_bytes()).hexdigest()
    catalog = json.loads(Path(args.catalog).read_text(encoding="utf-8"))
    original = json.loads(Path(args.original).read_text(encoding="utf-8"))
    corpus = cases(original)
    known = {tool.name for tool in sdk_catalog_tools(catalog)}
    assert all(set(case.get("expected", [])) <= known for case in corpus)
    (output / "semantic-corpus.json").write_text(
        json.dumps(
            {
                "gold_version": "contract-v2",
                "cases": corpus,
                "reason": "Presentation creation requires create_empty_file. Blank spreadsheet creation has no supplied cell data. Typed/range/file readers are accepted for general range queries.",
                "split_policy": "The original 15 queries informed ranking development. The 24 expansion queries were fixed before their first run, which exposed move/upload/cancel vocabulary gaps. The final expansion replay is a regression check after fixing those gaps, not an independent holdout. Six negative queries audit unsupported names, formats and actions.",
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    types = {
        "baseline": load_baseline(args.baseline),
        "review": DiscoveryToolkit,
    }
    toolkits = {
        name: cls(tools=sdk_catalog_tools(catalog))
        for name, cls in types.items()
    }
    rows = []
    for repeat in range(args.repeats):
        for case in corpus:
            for version in (
                ("baseline", "review")
                if repeat % 2 == 0
                else ("review", "baseline")
            ):
                toolkit, state = toolkits[version], AgentState()
                started = time.perf_counter()
                found = await toolkit.search(
                    case["query"],
                    case.get("namespace", "kdocs"),
                    5,
                    state,
                )
                matches = [item["name"] for item in found["tools"]]
                elapsed = time.perf_counter() - started
                expected = case.get("expected", [])
                hit1 = bool(matches and matches[0] in expected)
                hit5 = bool(set(matches) & set(expected))
                forbidden = bool(set(matches) & set(case.get("forbidden", [])))
                forbidden |= any(
                    operation in name.split("_")
                    for operation in case.get("forbidden_operations", [])
                    for name in matches
                )
                passed = not forbidden
                if case.get("expect_empty"):
                    passed &= not matches
                elif expected:
                    passed &= hit5
                rows.append(
                    {
                        "version": version,
                        "repeat": repeat,
                        "split": case["split"],
                        "query": case["query"],
                        "matches": matches,
                        "expected": expected,
                        "hit_at_1": hit1,
                        "hit_at_5": hit5,
                        "passed": passed,
                        "seconds": elapsed,
                    },
                )
    for repeat in range(3):
        for name in sorted(known):
            for version, toolkit in toolkits.items():
                state = AgentState()
                started = time.perf_counter()
                found = await toolkit.search(name, "kdocs", 1, state)
                schemas = await toolkit.get_tool_schemas(
                    state.tool_context.activated_groups,
                )
                elapsed = time.perf_counter() - started
                visible = [schema["function"]["name"] for schema in schemas]
                matches = [item["name"] for item in found["tools"]]
                size = len(json.dumps(schemas, ensure_ascii=False).encode())
                success = matches == [name] and name in visible
                rows.append(
                    {
                        "version": version,
                        "split": "exact",
                        "repeat": repeat,
                        "query": name,
                        "matches": matches,
                        "hit_at_1": success,
                        "hit_at_5": success,
                        "passed": success,
                        "seconds": elapsed,
                        "schema_bytes": size,
                        "visible_count": len(schemas),
                    },
                )
    raw_rows = []
    for item in catalog:
        expected = "kdocs__" + item["name"].replace(".", "_")
        for query in (item["name"], "kdocs__" + item["name"]):
            toolkit, state = toolkits["review"], AgentState()
            started = time.perf_counter()
            found = await toolkit.search(query, "kdocs", 1, state)
            matches = [tool["name"] for tool in found["tools"]]
            raw_rows.append(
                {
                    "query": query,
                    "expected": expected,
                    "matches": matches,
                    "passed": matches == [expected],
                    "seconds": time.perf_counter() - started,
                },
            )
    payload = {
        "summary": summarize(rows),
        "rows": rows,
        "raw_identity": raw_rows,
        "catalog_count": len(known),
        "baseline_sha256": hashlib.sha256(
            Path(args.baseline).read_bytes(),
        ).hexdigest(),
        "review_sha256": source_sha,
        "source_unchanged_during_run": source_sha
        == hashlib.sha256(source_path.read_bytes()).hexdigest(),
        "scope": "Actual 630 MCP contracts via production SDK adapter. Metadata activation only. No cloud business operations. Development-host timing includes other host activity.",
    }
    target.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(
        json.dumps(payload["summary"], ensure_ascii=False, indent=2),
        flush=True,
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--catalog", required=True)
    parser.add_argument("--original", required=True)
    parser.add_argument("--baseline", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--repeats", type=int, default=5)
    asyncio.run(run(parser.parse_args()))
