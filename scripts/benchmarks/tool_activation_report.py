# -*- coding: utf-8 -*-
"""Build a self-contained report from raw activation benchmark measurements."""

from __future__ import annotations

import argparse
import csv
import html
import json
import statistics
from collections import defaultdict
from pathlib import Path

LABELS = {
    "greeting_native": "问候，无 MCP",
    "reasoning_native": "心算，无 MCP",
    "read_native": "本地读取",
    "write_native": "本地创建",
    "edit_native": "本地修改",
    "grep_native": "内容搜索",
    "glob_native": "文件名搜索",
    "read_write_native": "读取后写入",
    "shell_read": "终端读取",
    "units_domain": "UGSci 单位换算",
    "oil_in_place": "UGSci 储量计算",
    "genui_catalog": "GenUI 组件目录",
    "genui_guide": "GenUI 使用指南",
    "skill_loading": "按需读取技能",
    "office_document": "Word 创建、修改、读取",
    "batch_read_write": "批量读写",
    "agent_listing": "专家发现",
    "time_lookup": "时间工具",
    "web_fetch": "网页读取",
    "mcp_greeting": "MCP 已载入，问候",
    "mcp_local_read": "MCP 已载入，本地读取",
    "mcp_cloud_read": "MCP 文档读取",
    "mcp_cloud_write": "MCP 文档写入",
    "mcp_mixed": "MCP 读取后本地写入",
    "mcp_session_activate": "会话首次激活 MCP",
    "mcp_session_reuse": "同会话复用激活",
    "mcp_session_unrelated": "激活后无工具任务",
    "mcp_other_session_isolation": "另一会话隔离",
    "mcp_configured_disabled": "MCP 配置存在但停用",
    "large_project_native": "640 文件问候，无 MCP",
    "large_project_mcp": "640 文件问候，MCP 已载入",
}


def read_json(path, default=None):
    return (
        json.loads(path.read_text(encoding="utf-8"))
        if path.exists()
        else default
    )


def quantile(values, q):
    values = sorted(values)
    position = (len(values) - 1) * q
    lower = int(position)
    upper = min(lower + 1, len(values) - 1)
    return values[lower] + (values[upper] - values[lower]) * (position - lower)


def stats(records, field):
    values = [r[field] for r in records if r.get(field) is not None]
    if not values:
        return {"n": 0, "p50": None, "p95": None, "max": None}
    return {
        "n": len(values),
        "p50": statistics.median(values),
        "p95": quantile(values, 0.95),
        "max": max(values),
    }


def fmt(value):
    return (
        "—"
        if value is None
        else f"{value:.3f}"
        if isinstance(value, float)
        else str(value)
    )


def esc(value):
    return html.escape(fmt(value))


def table(headers, rows, table_id=""):
    result = f'<div class="scroll"><table id="{table_id}"><thead><tr>'
    result += (
        "".join("<th>" + esc(h) + "</th>" for h in headers)
        + "</tr></thead><tbody>"
    )
    for row in rows:
        result += (
            "<tr>"
            + "".join("<td>" + esc(cell) + "</td>" for cell in row)
            + "</tr>"
        )
    return result + "</tbody></table></div>"


def build(output):
    # pylint: disable=line-too-long,too-many-branches,too-many-statements
    trials = [
        json.loads(line)
        for line in (output / "trials.jsonl")
        .read_text(encoding="utf-8")
        .splitlines()
        if line.strip()
    ]
    for trial in trials:
        trial["cohort"] = (
            "current"
            if trial.get("measurement_protocol_version") == 2
            else "initial"
        )
    follow_path = output / "follow-up" / "trials.jsonl"
    if follow_path.exists():
        for line in follow_path.read_text(encoding="utf-8").splitlines():
            if line.strip():
                trial = json.loads(line)
                trial["cohort"] = "clean_prompt"
                trials.append(trial)
    metadata = read_json(output / "summary.json", {})
    activation = read_json(output / "catalog-activation.json", {})
    scans = read_json(output / "file-scan.json", [])
    transport = read_json(output / "transport.json", []) + read_json(
        output / "periodic.json",
        [],
    )
    exposure = read_json(output / "catalog-exposure.json", {})
    observations = read_json(output / "supplemental-observations.json", {})
    observations.update(
        read_json(output / "follow-up" / "supplemental-observations.json", {}),
    )
    for trial in trials:
        observed = observations.get(trial["case_id"], {})
        nested = [
            call
            for tool in observed.get("tools", {}).values()
            for call in tool.get("nested_calls", [])
        ]
        trial["observed_nested_calls"] = len(nested)
        trial["observed_nested_names"] = [call["name"] for call in nested]
        trial["calls_including_observed_nested"] = trial["tool_calls"] + len(
            nested,
        )
        trial["activation_path_matches"] = not any(
            str(failure).startswith(("missing_tool:", "activation_assertion:"))
            for failure in trial["failures"]
        )
        trial["budget_limited"] = (
            "benchmark_model_request_limit" in trial["failures"]
        )
        trial["measurement_notes"] = []
        if (
            trial["cohort"] == "initial"
            and trial["scenario"] == "office_document"
            and trial["backend"] == "controlled"
        ):
            trial["measurement_notes"].append(
                "initial_driver_search_counter_defect",
            )
        if (
            trial["backend"] == "live"
            and trial["cohort"] == "initial"
            and any(
                "upstream_status" not in model and not model.get("error")
                for model in trial["model_details"]
            )
        ):
            trial["measurement_notes"].append(
                "initial_relay_ended_before_upstream_headers",
            )
    columns = list(dict.fromkeys(key for trial in trials for key in trial))
    with (output / "combined-trials.csv").open(
        "w",
        encoding="utf-8-sig",
        newline="",
    ) as handle:
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writeheader()
        for trial in trials:
            writer.writerow(
                {
                    key: (
                        json.dumps(value, ensure_ascii=False)
                        if isinstance(value, (dict, list))
                        else value
                    )
                    for key, value in trial.items()
                },
            )
    groups = defaultdict(list)
    for trial in trials:
        groups[(trial["backend"], trial["scenario"], trial["cohort"])].append(
            trial,
        )
    metrics = [
        "total_s",
        "first_event_s",
        "response_created_s",
        "response_completed_s",
        "first_thinking_s",
        "first_text_s",
        "first_model_request_s",
        "model_wall_s",
        "model_requests",
        "tool_calls",
        "search_calls",
        "mcp_calls",
        "initial_schema_bytes",
        "max_schema_bytes",
        "prompt_tokens",
        "completion_tokens",
    ]
    summaries = []
    for (backend, scenario, cohort), rows in groups.items():
        summaries.append(
            {
                "backend": backend,
                "cohort": cohort,
                "scenario": scenario,
                "n": len(rows),
                "passed_strict": sum(r["passed"] for r in rows),
                "metrics": {name: stats(rows, name) for name in metrics},
            },
        )
    tool_groups = defaultdict(list)
    for trial in trials:
        for invocation in trial.get("tool_durations_s", []):
            tool_groups[
                (trial["backend"], trial["cohort"], invocation["name"])
            ].append(
                invocation["seconds"],
            )
    tool_stats = [
        {
            "backend": backend,
            "cohort": cohort,
            "tool": tool,
            "calls": len(values),
            "p50_s": statistics.median(values),
            "p95_s": quantile(values, 0.95),
            "total_s": sum(values),
            "max_s": max(values),
        }
        for (backend, cohort, tool), values in sorted(tool_groups.items())
    ]
    with (output / "tool-calls.csv").open(
        "w",
        encoding="utf-8-sig",
        newline="",
    ) as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "backend",
                "cohort",
                "tool",
                "calls",
                "p50_s",
                "p95_s",
                "total_s",
                "max_s",
            ],
        )
        writer.writeheader()
        writer.writerows(tool_stats)
    report_data = {
        "metadata": metadata,
        "scenario_summary": summaries,
        "tool_summary": tool_stats,
        "trial_count": len(trials),
        "top_level_tool_calls": sum(trial["tool_calls"] for trial in trials),
        "observed_nested_tool_calls": sum(
            trial["observed_nested_calls"] for trial in trials
        ),
        "failure_count_strict": sum(not r["passed"] for r in trials),
        "exact_activation_count": len(activation.get("exact_activation", [])),
        "semantic_queries": activation.get("semantic_queries", []),
        "catalog_exposure": exposure,
    }
    (output / "report-data.json").write_text(
        json.dumps(report_data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    content = """<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>QwenPaw 工具激活与耗时测试</title><style>
*{box-sizing:border-box}body{font:14px/1.65 system-ui,"Microsoft Yahei",sans-serif;color:#17212b;background:#f4f6f8;margin:0}
main{max-width:1440px;margin:auto;padding:24px}section,header{background:white;padding:24px;margin-bottom:18px;border:1px solid #dfe5eb;border-radius:12px}
h1{font-size:28px;margin:0 0 10px}h2{font-size:21px;margin:0 0 14px}h3{font-size:17px}.muted{color:#586678}.scroll{overflow:auto}
table{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums}td,th{border-bottom:1px solid #e5e9ee;padding:9px 11px;text-align:left;vertical-align:top;white-space:nowrap}
th{background:#edf2f7;position:sticky;top:0}tbody tr:hover{background:#f7faff}a{color:#145cb6}code{word-break:break-all}li{margin-bottom:7px}
.cards{display:flex;gap:14px;flex-wrap:wrap}.card{min-width:140px;background:#eef4fb;padding:14px 20px;border-radius:8px}.card strong{display:block;font-size:25px}
input{padding:10px;border:1px solid #aebdcb;border-radius:6px;min-width:300px}.bad{color:#b33126}.bars{display:grid;grid-template-columns:200px 1fr 85px;gap:7px 12px;align-items:center}.bar{height:15px;background:#2369ae;border-radius:3px}.bar.controlled{background:#36a29c}
pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f4f6f8;padding:14px}details{margin-top:12px}button{padding:8px 12px;cursor:pointer}p{margin:8px 0}
</style><main><header><h1>QwenPaw 工具激活与耗时测试</h1>
<p>2026-11-10 · Windows 开发环境 · HTTP 聊天入口、原生运行时、SDK 工具执行、MCP 传输和文件追踪</p>
<p class="muted">受控模型验证本地执行链路，真实模型检验自然语言发现与任务路径。各任务与测量批次独立统计。p95 使用线性插值，2–3 次重复仅描述本次样本分布。时间单位为秒，Schema 使用标准 UTF-8 JSON 字节计量。首正文只统计实际产生正文的样本，总耗时截至 SSE 流关闭，完成事件单独记录。</p>"""
    controlled = [
        t
        for t in trials
        if t["backend"] == "controlled"
        and not t["scenario"].startswith("activate_native_")
    ]
    live = [t for t in trials if t["backend"] == "live"]
    audit = [t for t in trials if t["scenario"].startswith("activate_native_")]
    exact = activation.get("exact_activation", [])
    content += (
        '<div class="cards">'
        + "".join(
            f'<div class="card"><strong>{value}</strong>{label}</div>'
            for label, value in [
                ("受控端到端样本", len(controlled)),
                ("真实模型样本", len(live)),
                ("原生工具激活审计", len(audit)),
                ("MCP 精确激活样本", len(exact)),
                ("语义检索任务", len(activation.get("semantic_queries", []))),
            ]
        )
        + "</div><p>真实模型配置 "
        + esc(json.dumps(metadata.get("model", {}), ensure_ascii=False))
        + "</p></header>"
    )

    content += (
        "<section><h2>原生目录逐项激活</h2><p>在当前请求上下文中，启用目录条目的名称激活通过 "
        + str(sum(row["passed"] for row in audit))
        + "/"
        + str(len(audit))
        + "。逐项检查只请求发现与激活，代表性功能执行另列于任务矩阵。</p>"
    )
    failures = [row for row in audit if not row["passed"]]
    content += table(
        ["目录名称", "实际返回候选", "观测"],
        [
            [
                row["scenario"].removeprefix("activate_native_"),
                ", ".join(
                    match["name"]
                    for result in row["tool_results"]
                    for match in result.get("discovered") or []
                ),
                (
                    "存在名称映射或重名线索"
                    if "data" in row["scenario"]
                    else "需核对上下文门禁与注册状态"
                ),
            ]
            for row in failures
        ],
    )
    content += "</section>"

    content += "<section><h2>检索与激活</h2>"
    semantics = activation.get("semantic_queries", [])
    content += (
        "<p>精确名称激活 "
        + str(sum(r["activated"] for r in exact))
        + "/"
        + str(len(exact))
        + "。语义任务 Hit@1 为 "
        + str(sum(r["hit_at_1"] for r in semantics))
        + "/"
        + str(len(semantics))
        + "，Hit@5 为 "
        + str(sum(r["hit_at_5"] for r in semantics))
        + "/"
        + str(len(semantics))
        + "。</p>"
    )
    content += table(
        ["任务描述", "Hit@1", "Hit@5", "预期工具", "实际前五名"],
        [
            [
                q["query"],
                q["hit_at_1"],
                q["hit_at_5"],
                ", ".join(q["expected"]),
                ", ".join(q["matches"]),
            ]
            for q in semantics
        ],
    )
    content += "<p>目录使用现有金山 MCP 的 630 项定义。精确激活测试调用实际 DiscoveryToolkit 和 SDK 适配器。代表性文档读写通过隔离 MCP 服务的专用测试工具执行。</p></section>"

    if exposure:
        content += "<section><h2>全量与按需 Schema 暴露对照</h2>"
        rows = exposure["exposure"]
        cost_rows = []
        for mode in ["full", "lazy"]:
            selected = [row for row in rows if row["mode"] == mode]
            values = [row["seconds"] for row in selected]
            cost_rows.append(
                [
                    mode,
                    len(values),
                    selected[0]["tools"],
                    selected[0]["schema_bytes"],
                    statistics.median(values),
                    quantile(values, 0.95),
                ],
            )
        content += table(
            ["方式", "n", "工具数", "Schema 字节", "准备耗时 p50", "准备耗时 p95"],
            cost_rows,
        )
        budget = exposure["successive_activations"]
        content += (
            "<p>连续激活 40 个较大定义的工具，完整 JSON 数组按 32000 字节校验通过 "
            + str(sum(r["passed"] for r in budget))
            + "/40。边界样本为 18 个可见工具、32024 字节，数组分隔符使实际载荷超过目标 24 字节。</p>"
        )
        content += "<p>使用实际生产 MCP 映射、SDK 适配器和 Toolkit，目录含 630 项 MCP 定义。该微基准测量 Schema 装配和大小，HTTP 回合还包含原生基础工具。</p></section>"

    for backend, cohort, title in [
        ("controlled", "initial", "受控模型执行耗时，初批矩阵"),
        ("live", "initial", "真实模型耗时，初批矩阵"),
        ("controlled", "current", "受控模型执行耗时，当前协议"),
        ("live", "current", "真实模型执行耗时，当前协议"),
        ("controlled", "clean_prompt", "受控链路复测，修正版驱动"),
        ("live", "clean_prompt", "真实模型复测，无可见标记、回合内复用连接"),
    ]:
        selected = [
            r
            for r in summaries
            if r["backend"] == backend
            and r["cohort"] == cohort
            and not r["scenario"].startswith("activate_native_")
        ]
        if not selected:
            continue
        content += "<section><h2>" + title + "</h2>"
        content += table(
            [
                "任务",
                "n",
                "严格通过",
                "首响应 p50",
                "首思考 p50",
                "首正文 p50",
                "正文样本数",
                "完成事件 p50",
                "总耗时 p50",
                "总耗时 p95",
                "模型请求 p50",
                "工具 p50",
                "搜索 p50",
                "MCP p50",
                "初始 Schema KiB",
            ],
            [
                [
                    LABELS.get(r["scenario"], r["scenario"]),
                    r["n"],
                    f'{r["passed_strict"]}/{r["n"]}',
                    *[
                        r["metrics"][field]["p50"]
                        for field in [
                            "response_created_s",
                            "first_thinking_s",
                            "first_text_s",
                        ]
                    ],
                    r["metrics"]["first_text_s"]["n"],
                    r["metrics"]["response_completed_s"]["p50"],
                    r["metrics"]["total_s"]["p50"],
                    r["metrics"]["total_s"]["p95"],
                    *[
                        r["metrics"][field]["p50"]
                        for field in [
                            "model_requests",
                            "tool_calls",
                            "search_calls",
                            "mcp_calls",
                        ]
                    ],
                    (
                        r["metrics"]["initial_schema_bytes"]["p50"] / 1024
                        if r["metrics"]["initial_schema_bytes"]["p50"]
                        else None
                    ),
                ]
                for r in selected
            ],
        )
        if backend == "live" and selected:
            scale = max(r["metrics"]["total_s"]["p50"] or 0 for r in selected)
            content += '<details><summary>总耗时对比</summary><div class="bars">'
            for row in selected:
                value = row["metrics"]["total_s"]["p50"]
                content += (
                    "<span>"
                    + esc(LABELS.get(row["scenario"], row["scenario"]))
                    + f'</span><div class="bar" style="width:{value / scale * 100:.2f}%"></div><span>{value:.3f}s</span>'
                )
            content += "</div></details>"
        content += "</section>"

    content += "<section><h2>文件基线扫描</h2>"
    scan_groups = defaultdict(list)
    for row in scans:
        scan_groups[row["fixture"]].append(row)
    content += table(
        [
            "合成目录",
            "n",
            "文件数",
            "实际内容读取字节",
            "p50",
            "p95",
            "最大值",
            "扫描不完整次数",
        ],
        [
            [
                name,
                len(rows),
                rows[0]["files"],
                rows[0]["bytes_read"],
                statistics.median(r["seconds"] for r in rows),
                quantile([r["seconds"] for r in rows], 0.95),
                max(r["seconds"] for r in rows),
                sum(r["incomplete"] for r in rows),
            ]
            for name, rows in scan_groups.items()
        ],
    )
    content += "<p>使用实际 turn_files.scanner，目录刚写入后重复扫描，操作系统缓存未清空。文件扫描的内容读取字节与用户任务的 read_file 调用分别计量。large_128MiB 初批目录的总量超过预算 512 字节，5 次扫描均触发预算上限，原始警告保存在 file-scan.json。</p></section>"

    content += "<section><h2>MCP 生命周期与并发</h2>"
    checks = [dict(item) for item in metadata.get("checks", [])]
    for check in checks:
        if check.get("check") == "plugin_tool_registration_ready":
            check["check"] = "初批目录元数据就绪，实际插件稍后完成加载"
        if check.get("check") == "periodic_catalog_refresh":
            check["check"] = "恢复后 RPC 可见，包含通知影响"
    content += table(
        ["检查", "通过", "观测数据"],
        [
            [
                r.get("check", r.get("scenario")),
                r["passed"],
                json.dumps(
                    {
                        k: v
                        for k, v in r.items()
                        if k not in {"check", "scenario", "passed"}
                    },
                    ensure_ascii=False,
                ),
            ]
            for r in checks + transport
        ],
    )
    content += "</section>"
    content += "<section><h2>并发握手压力场景</h2><p>12 个客户端同时连接同一测试端点时，两次尝试分别在 3 秒与 8 秒握手期限内超时。原始日志保存在 diagnostics/transport-first-attempt.log 和 diagnostics/transport-second-attempt.log。该压力结果与生产顺序建连、并发获取目录的测试分开统计，承载瓶颈的具体位置仍需进一步定位。</p></section>"

    content += "<section><h2>逐次任务与状态维度</h2><p>支持按任务名、后端、MCP 状态或工具名筛选。</p><input id=filter placeholder=输入关键词筛选><p></p>"
    content += table(
        [
            "后端",
            "批次",
            "任务",
            "重复",
            "通过",
            "MCP 配置",
            "MCP 启用",
            "目录状态",
            "MCP 初始可见",
            "MCP 最大可见",
            "MCP 调用",
            "文件意图",
            "文件变化",
            "工具调用链",
            "总耗时",
            "失败条件",
        ],
        [
            [
                t["backend"],
                t["cohort"],
                LABELS.get(t["scenario"], t["scenario"]),
                t["repeat"],
                t["passed"],
                t["mcp_configured"],
                t["mcp_enabled"],
                t["catalog_state"],
                t["mcp_initial_visible"],
                t["mcp_max_visible"],
                t["mcp_calls"],
                t["file_intent"],
                json.dumps(t["file_changes"], ensure_ascii=False),
                " → ".join(t["tool_names"]),
                t["total_s"],
                ", ".join(
                    str(f) for f in t["failures"] + t["measurement_notes"]
                ),
            ]
            for t in trials
        ],
        "trials",
    )
    content += "</section>"

    content += "<section><h2>工具调用汇总</h2><p>工具耗时从 SSE 调用开始到结果完成，包含执行与事件传递。调用次数按顶层工具事件统计。批处理内部步骤可从会话结果恢复时单独列在 supplemental-observations.json。</p>"
    content += table(
        ["后端", "批次", "工具", "调用次数", "p50", "p95", "累计耗时", "最大值"],
        [
            [
                r[k]
                for k in [
                    "backend",
                    "cohort",
                    "tool",
                    "calls",
                    "p50_s",
                    "p95_s",
                    "total_s",
                    "max_s",
                ]
            ]
            for r in tool_stats
        ],
    )
    content += "</section><section><h2>结果口径与验证范围</h2><ul>"
    notes = [
        "严格通过同时要求指定工具路径和文件或工具结果断言。真实模型采用其他工具完成任务时，会记录 missing_tool，文件哈希变化仍保留在逐次数据中。",
        "受控 Office 初批 3 条样本受测试驱动的连续搜索计数错误影响，第三次发现被提前终止。修正版按当前动作计算连续搜索次数，初批数据保留用于审计。复测结果存放在 follow-up 目录。",
        "初批中继每步建立上游连接，并在上游连接成功前发出下游 200 响应，部分中继异常形成空流。这些样本保留在初批中，不能直接归因于应用。修正版复测采用回合内连接复用、先确认上游状态、显式错误记录，并移除模型可见的用例标记。",
        "插件启动期间目录元数据与实际可用能力存在时间差。初批 UGSci 与 GenUI 的失败保留，后续同任务成功样本分别列出。",
        "测试使用独立应用状态和合成文件。当前默认模型经回环中继调用，原始凭证保留在内存。测试进程设置 NO_PROXY，避免 Windows 系统代理转发回环请求。",
        "真实供应商的网络、排队与推理时间包含在真实模型测量中。模型输出上限为 2048 tokens，单任务上限为 8 次模型请求，触及限制的样本列为失败。",
        "工具事件跨度包含参数流式生成、执行与事件传递，MCP RPC 的起止时间单独保存在 RPC 文件。系统同时存在其他开发进程，CPU、I/O 和操作系统缓存未锁定。",
        "覆盖现有目录发现、代表任务执行、MCP 冷热目录、停用状态、会话复用、隔离、通知、故障恢复、并发以及本地读写。GUI 渲染、真实金山文档全量业务操作、桌面安装包和更新发布属于独立验收范围。",
    ]
    content += (
        "".join("<li>" + esc(note) + "</li>" for note in notes) + "</ul>"
    )
    verification = read_json(output / "verification.json", {})
    if verification:
        content += (
            "<h3>回归验证</h3><pre>"
            + esc(json.dumps(verification, ensure_ascii=False, indent=2))
            + "</pre>"
        )
    content += (
        "<h3>原始数据</h3><p>"
        + " · ".join(
            f'<a href="{name}">{name}</a>'
            for name in [
                "trials.csv",
                "trials.jsonl",
                "follow-up/trials.csv",
                "combined-trials.csv",
                "tool-calls.csv",
                "summary.json",
                "catalog-activation.json",
                "file-scan.json",
                "transport.json",
                "mcp-rpc.json",
            ]
        )
        + "</p></section>"
    )
    content += """<script>document.querySelector('#filter').addEventListener('input',e=>{const q=e.target.value.toLowerCase();for(const row of document.querySelectorAll('#trials tbody tr'))row.hidden=!row.textContent.toLowerCase().includes(q)})</script></main></html>"""
    (output / "report.html").write_text(content, encoding="utf-8")
    return report_data


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    data = build(Path(args.output).resolve())
    print(
        json.dumps(
            {
                key: data[key]
                for key in [
                    "trial_count",
                    "failure_count_strict",
                    "exact_activation_count",
                ]
            },
        ),
    )
