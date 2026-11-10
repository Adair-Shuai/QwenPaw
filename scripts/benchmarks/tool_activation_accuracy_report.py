# -*- coding: utf-8 -*-
"""Build a review report without replacing any exploratory measurements."""

import argparse
import csv
import html
import json
import re
import statistics
from pathlib import Path
from xml.etree import ElementTree


def read(path, default=None):
    return (
        json.loads(path.read_text(encoding="utf-8-sig"))
        if path.exists()
        else default
    )


def table(headers, rows):
    def cell(value):
        return html.escape(
            str(round(value, 3) if isinstance(value, float) else value),
        )

    return (
        "<table><thead><tr>"
        + "".join("<th>" + cell(value) + "</th>" for value in headers)
        + "</tr></thead><tbody>"
        + "".join(
            "<tr>"
            + "".join("<td>" + cell(value) + "</td>" for value in row)
            + "</tr>"
            for row in rows
        )
        + "</tbody></table>"
    )


def tests(root):
    result = []
    for name in (
        "targeted",
        "targeted-final",
        "accuracy-final",
        "backend-fork",
        "backend-rerun",
    ):
        path = root / (name + ".xml")
        if not path.exists():
            continue
        suites = list(ElementTree.parse(path).getroot().iter("testsuite"))
        failures = [
            node.attrib
            for suite in suites
            for node in suite.findall("testcase")
            if node.find("failure") is not None
            or node.find("error") is not None
        ]
        result.append(
            {
                "name": name,
                "tests": sum(int(suite.get("tests", 0)) for suite in suites),
                "failed": sum(
                    int(suite.get("failures", 0)) + int(suite.get("errors", 0))
                    for suite in suites
                ),
                "skipped": sum(
                    int(suite.get("skipped", 0)) for suite in suites
                ),
                "seconds": sum(
                    float(suite.get("time", 0)) for suite in suites
                ),
                "failures": failures,
            },
        )
    return result


def main():
    # pylint: disable=line-too-long,too-many-branches,too-many-statements
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    root = Path(args.output).resolve()
    replay = read(root / "acceptance/discovery-replay.json")
    exposure = read(root / "acceptance/catalog-exposure.json")
    rows = []
    for cohort in (
        "http",
        "http-final",
        "http-current",
        "http-overview",
        "http-acceptance",
    ):
        path = root / cohort / "trials.jsonl"
        if path.exists():
            rows.extend(
                {"cohort": cohort, **json.loads(line)}
                for line in path.read_text(encoding="utf-8").splitlines()
                if line
            )
    for row in rows:
        row["original_passed"] = row["passed"]
        row["mcp_activated"] = bool(row.get("mcp_max_visible"))
        row["failure_categories"] = sorted(
            {
                (
                    "connection"
                    if failure.startswith("relay_")
                    else (
                        "tool_path"
                        if failure.startswith("missing_tool:")
                        else "artifact"
                        if "assertion" in failure
                        else "other"
                    )
                )
                for failure in row["failures"]
            },
        )
        if row["scenario"].startswith("execute_") and row["scenario"].endswith(
            "_dependency_status",
        ):
            expected = row["scenario"][len("execute_") :]
            extra = [
                name
                for name in row["tool_names"]
                if name.endswith("_dependency_status") and name != expected
            ]
            row["call_accuracy_passed"] = not extra
            if extra:
                row["passed"] = False
                row["failures"] = row["failures"] + [
                    "extra_app_status_call:" + name for name in extra
                ]
                row["failure_categories"] = sorted(
                    set(row["failure_categories"]) | {"extra_app_call"},
                )
    fields = [
        "cohort",
        "case_id",
        "scenario",
        "backend",
        "repeat",
        "mcp_configured",
        "mcp_enabled",
        "mcp_activated",
        "mcp_initial_visible",
        "mcp_max_visible",
        "session_reused",
        "file_intent",
        "passed",
        "original_passed",
        "call_accuracy_passed",
        "total_s",
        "first_text_s",
        "response_created_s",
        "tool_calls",
        "search_calls",
        "mcp_calls",
        "native_calls",
        "initial_schema_bytes",
        "max_schema_bytes",
        "file_read_calls",
        "file_mutation_calls",
        "tool_names",
        "file_changes",
        "failures",
        "failure_categories",
    ]
    with (root / "http-trials.csv").open(
        "w",
        newline="",
        encoding="utf-8-sig",
    ) as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=fields,
            extrasaction="ignore",
        )
        writer.writeheader()
        for row in rows:
            writer.writerow(
                {
                    key: (
                        json.dumps(row.get(key), ensure_ascii=False)
                        if isinstance(row.get(key), (list, dict))
                        else row.get(key)
                    )
                    for key in fields
                },
            )
    calls = [
        {
            "cohort": row["cohort"],
            "case_id": row["case_id"],
            "scenario": row["scenario"],
            "backend": row["backend"],
            "level": "top_level",
            **call,
        }
        for row in rows
        for call in row["tool_durations_s"]
    ]
    nested_count = 0
    by_case = {row["case_id"]: row for row in rows}
    for cohort in (
        "http",
        "http-final",
        "http-current",
        "http-overview",
        "http-acceptance",
    ):
        observations = read(
            root / cohort / "supplemental-observations.json",
            {},
        )
        for case_id, observation in observations.items():
            if case_id not in by_case:
                continue
            row = by_case[case_id]
            for tool in observation["tools"].values():
                for nested in tool["nested_calls"]:
                    calls.append(
                        {
                            "cohort": cohort,
                            "case_id": case_id,
                            "scenario": row["scenario"],
                            "backend": row["backend"],
                            "level": "nested",
                            "name": nested["name"],
                            "seconds": None,
                        },
                    )
                    nested_count += 1
    with (root / "tool-calls.csv").open(
        "w",
        newline="",
        encoding="utf-8-sig",
    ) as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "cohort",
                "case_id",
                "scenario",
                "backend",
                "level",
                "name",
                "seconds",
            ],
        )
        writer.writeheader()
        writer.writerows(calls)
    test_data = tests(root)
    network = read(root / "network-diagnostics.json", {})
    data = {
        "replay_summary": replay["summary"],
        "raw_identity_passed": sum(
            row["passed"] for row in replay["raw_identity"]
        ),
        "raw_identity_count": len(replay["raw_identity"]),
        "source_unchanged": replay["source_unchanged_during_run"],
        "schema_budgets": exposure["successive_activations"],
        "http_trials": len(rows),
        "http_passed": sum(row["passed"] for row in rows),
        "top_level_tool_calls": len(calls) - nested_count,
        "nested_tool_calls": nested_count,
        "tests": test_data,
        "network": network,
        "failures": [
            {
                key: row[key]
                for key in ("cohort", "scenario", "backend", "failures")
            }
            for row in rows
            if not row["passed"]
        ],
    }
    (root / "review-data.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    content = """<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>工具发现效率与准确性复盘</title><style>body{font:15px/1.65 system-ui,sans-serif;color:#152229;background:#f7f9fa;margin:0}main{max-width:1200px;margin:auto;padding:28px}h1{font-size:29px}h2{margin-top:32px;font-size:21px}table{border-collapse:collapse;width:100%;background:white;margin:14px 0;font-size:13px}td,th{border:1px solid #dce3e7;text-align:left;padding:7px;vertical-align:top}th{background:#eaf0f3;position:sticky;top:0}code,pre{font-family:ui-monospace,monospace;font-size:12px}pre{white-space:pre-wrap;word-break:break-word;background:white;padding:16px}a{color:#096175}input{padding:9px;width:350px;max-width:90%}.note{border-left:4px solid #c48e32;background:#fff7e8;padding:12px 18px}li{margin:7px 0}</style><main><h1>工具发现效率与准确性复盘</h1><p>2026-11-10 · Windows 开发环境 · 历史原始结果保留</p>
<h2>已修复的问题</h2><ul>
<li>运行时使用注册表中的公开名称包装工具，修复 DataPaw 与 qwenpaw-data 共 4 个依赖工具的闭包重名覆盖，同时保留函数参数契约和治理身份。</li>
<li>精确函数名查询禁止词片段替代其他应用工具。已覆盖大小写、MCP 点号名称、命名空间和相近服务器名。自然语言搜索补充操作与资源语义，并避免把不支持的文件格式当作能力。</li>
<li>Schema 预算包含完整 JSON 数组开销。选择较大的工具时回收可选基础工具，单个超出预算的 Schema 保留显式激活例外。</li>
<li>首轮提示列出当前请求可用的外部命名空间与原生工具前缀，子任务白名单过滤后才生成概览。</li><li>超过 24 项的目录直接进入延迟曝光路径，省去为判断小目录而生成全量 Schema 的开销。测试约束首次曝光及精确激活只生成基础工具和目标工具的 Schema。</li>
<li>OpenUI 的 on_acting 参数名改为 SDK 实际传入的 agent。新增测试经过真实 Agent 执行入口和作用域存储，覆盖表单创建及能力标记缺失、通道、子任务和定时任务限制。仓库与已安装插件后端文件同步。</li></ul>
<h2>上轮统计修正</h2><div class="note">上轮 11 个未激活名称中，4 个属于真实公开名称故障，4 个是应用私有工具，1 个需要前端能力标记，1 个依赖原生桌面宿主，1 个是已移除的旧配置。两条演示文稿测试的目标工具标错了，真实契约说明 create_file_with_content 不支持 PPT/PPTX，应使用 create_empty_file。空白表格和通用区域读取的可接受工具也按参数契约修订。本报告使用同一套修正后的预期对比前后实现。</div>
<h2>本地发现与 Schema 曝光</h2><p>原 15 条用于开发，扩展 24 条在首次验证后暴露并修复了动作词与资源映射缺口，现作为回归集。6 条反例覆盖不存在的函数、应用私有名称、不支持的格式和明确禁止的动作。这里的准确率描述这些固定用例。</p>"""
    content += table(
        [
            "实现",
            "任务组",
            "唯一用例",
            "首选命中",
            "前五命中",
            "检查通过",
            "中位耗时 ms",
        ],
        [
            [
                row["version"],
                row["split"],
                row["unique_cases"],
                row["hit_at_1"],
                row["hit_at_5"],
                row["passed"],
                row["median_seconds"] * 1000,
            ]
            for row in replay["summary"]
        ],
    )
    content += (
        f"<p>共保留 {len(rows)} 条 HTTP 样本，"
        f"{len(calls) - nested_count} 次顶层调用和 {nested_count} 次批处理内调用。"
        "各阶段的首次失败与口径修正保留在逐项 CSV 中。</p>"
    )
    content += f"<p>原始名称及带命名空间名称检索 {data['raw_identity_passed']}/{data['raw_identity_count']}。每个公开名称的激活另有 630 × 3 次样本。Schema 连续激活预算检查 {sum(row['passed'] for row in exposure['successive_activations'])}/{len(exposure['successive_activations'])}。运行期间源码哈希一致为 {data['source_unchanged']}。</p>"
    content += "<h2>HTTP 任务、用时与工具调用</h2><p>http 包含原生目录审计与首次探索。http-final 复测了常规任务、MCP 和 OpenUI。http-current 加入两个应用真实依赖状态调用。http-overview 复测外部命名空间概览，http-acceptance 复测最终的原生工具前缀和依赖状态检索。每组重复次数列在样本数中，真实模型使用 deepseek-v4-flash。MCP 的 630 个真实定义用于检索和曝光，业务读写只执行自有测试服务。</p><p>开发机同时执行固定回归，CPU、磁盘和缓存负载未控制。跨轮绝对耗时仅作为现场记录。本地效率比较使用同轮交错运行。工具耗时从首个工具名事件至结果结束，包含参数流传输。原始目标工具路径失败与内容／文件断言失败分别分类，替代工具完成的样本保留原路径检查结果。批处理的嵌套调用另见会话观察文件。</p><input id='filter' placeholder='按任务、模型类型或测试轮次筛选'>"
    grouped = {}
    for row in rows:
        grouped.setdefault(
            (row["cohort"], row["backend"], row["scenario"]),
            [],
        ).append(
            row,
        )
    timings = []
    for key, group in grouped.items():
        text_times = [
            row["first_text_s"]
            for row in group
            if row["first_text_s"] is not None
        ]
        timings.append(
            [
                *key,
                len(group),
                sum(row["passed"] for row in group),
                statistics.median(text_times) if text_times else "",
                statistics.median(row["total_s"] for row in group),
                sum(row["tool_calls"] for row in group),
                sum(row["search_calls"] for row in group),
                sum(row["mcp_calls"] for row in group),
                group[0]["file_intent"],
            ],
        )
    content += (
        '<section id="timings">'
        + table(
            [
                "轮次",
                "模型",
                "任务",
                "n",
                "通过",
                "首正文 p50 s",
                "总用时 p50 s",
                "工具调用",
                "发现调用",
                "MCP 调用",
                "文件任务",
            ],
            timings,
        )
        + "</section>"
    )
    content += "<h2>固定回归</h2>" + table(
        ["测试组", "总数", "失败", "条件跳过", "用时 s"],
        [
            [
                item["name"],
                item["tests"],
                item["failed"],
                item["skipped"],
                item["seconds"],
            ]
            for item in test_data
        ],
    )
    for name in (
        "frontend-fork",
        "frontend-rerun",
        "frontend-typescript",
        "driver-final",
    ):
        path = root / (name + ".log")
        if path.exists():
            lines = re.sub(
                r"\x1b\[[0-9;]*m",
                "",
                path.read_text(encoding="utf-8", errors="replace"),
            ).splitlines()
            summary = [
                line
                for line in lines
                if re.search(
                    r"Test Files|Tests\s+\d|passed.* in |Duration",
                    line,
                )
            ]
            exit_path = root / (name + ".exit")
            content += (
                "<p>"
                + html.escape(
                    name
                    + " · "
                    + (" / ".join(summary[-3:]) or "见原始日志")
                    + " · 退出码 "
                    + (
                        exit_path.read_text().strip()
                        if exit_path.exists()
                        else "见日志或仍在运行"
                    ),
                )
                + "</p>"
            )
    content += "<h2>连接诊断</h2><p>6 次交错流式请求保留当前 auto 代理设置。auto 路径出现 TLS EOF，direct 的 3 次均成功。样本量为每种模式 3 次，用户网络配置未更改。完整 HTTP 成功率保留所有连接错误和中途恢复的错误，连接失败与工具选错分别记录。</p>"
    content += table(
        ["网络模式", "重复", "通过", "HTTP", "用时 s", "异常链"],
        [
            [
                row["mode"],
                row["repeat"],
                row["passed"],
                row.get("http_status", ""),
                row["seconds"],
                " → ".join(
                    item["type"] for item in row.get("exception_chain", [])
                ),
            ]
            for row in network.get("rows", [])
        ],
    )
    content += "<h2>仍待处理与验证范围</h2><ul><li>大目录回合前文件快照仍会阻塞首次正文，上轮 640 文件场景约增加 7–9 秒。后续调整需保护文件修改前状态及交付归属。</li><li>观察到模型查询 qwenpaw-data 时额外调用 DataPaw 状态工具的样本。已增加命名空间概览和应用身份提示，并把额外跨应用调用纳入精度失败统计。工具绑定、权限校验与模型规划精度分别验证。</li><li>代理路径存在 TLS 建连失败。真实模型执行仍有偶发连接错误，当前数据无法给出线上任务全部成功的结论。</li><li>四个应用私有数据工具在应用页面中的正向业务执行仍需专门验收，主聊天中的隐藏与禁止跨应用替代已验证。</li><li>Windows 并发目录发布曾出现 WinError 5，定向复跑通过，偶发共享句柄拒绝尚需稳定性处理。</li><li>上轮 Word 复杂任务出现过参数错误和基准 8 轮请求上限，本轮未将该失败路径列为已修复。</li><li>原生桌面宿主的实际桌面操作、630 个第三方 MCP 的真实业务操作以及 CodeMode 的完整隔离子进程组合尚未作为本轮端到端验收。CodeMode 的公开名称映射和内层权限拒绝已补测。</li><li>固定回归中的失败、复跑和运行时间均保留。前端全量启动时为 167 套，结束后的固定清单校验为 172 套。完整回归执行期间有后续检索优化，最终源码另有精确检索、预算和针对性测试记录。验证使用独立实例，主服务重启后载入本次修改。</li></ul>"
    content += (
        "<h2>失败记录</h2><pre>"
        + html.escape(
            json.dumps(
                {
                    "http_failures": data["failures"],
                    "backend_failures": [
                        item for item in test_data if item["failures"]
                    ],
                },
                ensure_ascii=False,
                indent=2,
            ),
        )
        + "</pre>"
    )
    links = [
        "review-data.json",
        "http-trials.csv",
        "tool-calls.csv",
        "acceptance/discovery-replay.json",
        "acceptance/semantic-corpus.json",
        "acceptance/catalog-exposure.json",
        "http/native-classifications.json",
        "http-current/review-source-hashes.json",
        "network-diagnostics.json",
        "targeted.log",
        "accuracy-final.log",
        "backend-fork.log",
        "frontend-fork.log",
        "frontend-rerun.log",
        "frontend-typescript.log",
    ]
    content += (
        "<h2>可核对材料</h2><ul>"
        + "".join(
            '<li><a href="' + name + '">' + name + "</a></li>"
            for name in links
        )
        + "</ul><script>document.getElementById('filter').addEventListener('input', e => {const q=e.target.value.toLowerCase();document.querySelectorAll('#timings tbody tr').forEach(row=>row.hidden=!row.textContent.toLowerCase().includes(q))})</script></main></html>"
    )
    (root / "report.html").write_text(content, encoding="utf-8")
    print(
        json.dumps(
            {
                "http_trials": len(rows),
                "tool_calls": len(calls),
                "report": str(root / "report.html"),
            },
            ensure_ascii=False,
        ),
    )


if __name__ == "__main__":
    main()
