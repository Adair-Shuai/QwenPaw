# -*- coding: utf-8 -*-
"""Accuracy follow-up through isolated app HTTP, native SDK and MCP paths."""

import argparse
import hashlib
from pathlib import Path

from tool_activation import Benchmark, dump


def activation(name, *, absent=False):
    return {
        "name": ("hidden_" if absent else "activate_") + name,
        "prompt": "查找并激活工具 " + name + "，无需执行该工具。",
        "actions": [
            {"name": "search_tools", "arguments": {"query": name, "limit": 1}},
        ],
        "discovery_only": True,
        "expected_discovery": [] if absent else [name],
        **(
            {"expected_absent": [name]}
            if absent
            else {"expected_activation": name}
        ),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://127.0.0.1:8088")
    parser.add_argument("--output", required=True)
    parser.add_argument("--repeats", type=int, default=2)
    parser.add_argument("--live-repeats", type=int, default=2)
    parser.add_argument("--skip-native-audit", action="store_true")
    parser.add_argument(
        "--tasks",
        help="Optional comma-separated follow-up tasks",
    )
    args = parser.parse_args()
    args.isolated_app, args.visible_marker, args.smoke = True, False, False
    benchmark = Benchmark(args)
    sources = [
        Path("src/qwenpaw/runtime/tool_discovery.py"),
        Path("src/qwenpaw/app/workspace/local_workspace.py"),
        Path("plugins/bundle/qwenpaw-openui/interactions/tool.py"),
    ]
    initial_hashes = {
        str(path): hashlib.sha256(path.read_bytes()).hexdigest()
        for path in sources
    }
    classifications = []
    try:
        benchmark.setup()
        gated = {
            "materialize_skill": "removed legacy configuration",
            "qwenpaw_data_search_context": "app-private tool",
            "qwenpaw_data_list_domains": "app-private tool",
            "qwenpaw_data_explore_entity": "app-private tool",
            "qwenpaw_data_execute_sql": "app-private tool",
            "request_user_input": "requires Console UI capability",
        }
        for item in [] if args.skip_native_audit else benchmark.enabled_tools:
            if not item.get("enabled"):
                continue
            name = item["name"]
            if name == "computer_use":
                classifications.append(
                    {
                        "name": name,
                        "classification": "requires a reachable native desktop host",
                        "included_in_accuracy_denominator": False,
                    },
                )
                continue
            scenario = activation(name, absent=name in gated)
            benchmark.trial(scenario, 0)
            classifications.append(
                {
                    "name": name,
                    "classification": gated.get(name, "eligible native tool"),
                    "included_in_accuracy_denominator": True,
                },
            )
        capable = {
            "ui_capabilities": {"openui": "v1", "openui_interactions": "v1"},
        }
        benchmark.trial(
            {
                **activation("request_user_input"),
                "name": "ui_capable_activation",
                "request_context": capable,
            },
            0,
        )
        base = {
            scenario["name"]: scenario for scenario in benchmark.scenarios()
        }
        names = [
            "greeting_native",
            "read_native",
            "write_native",
            "edit_native",
            "batch_read_write",
            "mcp_greeting",
            "mcp_cloud_read",
            "mcp_mixed",
        ]
        selected = [base[name] for name in names]
        for app in ("datapaw", "qwenpaw-data"):
            selected.append(
                {
                    "name": "execute_" + app + "_dependency_status",
                    "prompt": "读取 " + app + " 的依赖健康状态。",
                    "actions": [
                        {"name": app + "_dependency_status", "arguments": {}},
                    ],
                    "expect_tools": [app + "_dependency_status"],
                    "forbidden_tools": [
                        other + "_dependency_status"
                        for other in ("datapaw", "qwenpaw-data")
                        if other != app
                    ],
                },
            )
        form = {
            "name": "ui_capable_form",
            "request_context": capable,
            "prompt": "需要确认压力参数，使用结构化输入表单让用户填写 pressure，默认 0 MPa。创建表单后结束当前回合。",
            "actions": [
                {
                    "name": "request_user_input",
                    "arguments": {
                        "kind": "form",
                        "title": "确认压力",
                        "fields": [
                            {
                                "name": "pressure",
                                "label": "压力",
                                "type": "number",
                                "default": 0,
                                "minimum": 0,
                                "unit": "MPa",
                            },
                        ],
                    },
                },
            ],
            "expect_tools": ["request_user_input"],
        }
        selected.append(form)
        if args.tasks:
            requested = set(args.tasks.split(","))
            if requested - {scenario["name"] for scenario in selected}:
                raise ValueError("Unknown follow-up task")
            selected = [
                scenario
                for scenario in selected
                if scenario["name"] in requested
            ]
        for repeat in range(args.repeats):
            for scenario in selected:
                session = benchmark.trial(scenario, repeat)
                if scenario["name"] == "ui_capable_form":
                    response = benchmark.api(
                        "GET",
                        "/openui/interactions",
                        benchmark.agents[0],
                        params={"session_id": session},
                    )
                    benchmark.checks.append(
                        {
                            "check": "scoped_form_persisted",
                            "repeat": repeat,
                            "passed": len(response.get("requests", [])) == 1,
                        },
                    )
        semantic = [
            {
                "name": "mcp_find_presentation",
                "mcp": True,
                "prompt": "在 benchdocs 的工具目录查找可以新建空白 PPTX 演示文稿的工具，只激活并告诉我工具名，不能创建文件。",
                "expect_tools": ["search_tools"],
                "expected_activation": "benchdocs__create_empty_file",
                "expect_text": "create_empty_file",
            },
            {
                "name": "mcp_find_document_reader",
                "mcp": True,
                "prompt": "在 benchdocs 的工具目录查找能读取金山云文档正文的工具，只激活并告诉我工具名，不能读取真实文件。",
                "expect_tools": ["search_tools"],
                "expected_activation": "benchdocs__read_file",
                "expect_text": "read_file",
            },
        ]
        for repeat in range(args.live_repeats):
            for scenario in selected + semantic:
                benchmark.trial(scenario, repeat, "live")
        dump(
            Path(args.output) / "native-classifications.json",
            classifications,
        )
    finally:
        dump(
            Path(args.output) / "review-source-hashes.json",
            {
                "initial": initial_hashes,
                "final": {
                    str(path): hashlib.sha256(path.read_bytes()).hexdigest()
                    for path in sources
                },
            },
        )
        benchmark.finish()


if __name__ == "__main__":
    main()
