# -*- coding: utf-8 -*-
"""Descriptive storage analysis with explicit coverage and \
operating-state gates."""

from __future__ import annotations

import math
from collections import defaultdict, Counter
from contextlib import closing
from datetime import date
from statistics import median, mean

from .store import DatasetStore, VERSION

LIMITATIONS = [
    "原表日注/采气量是每日计量量，直接求和；24h 折算量=日量×24/生产小时，仅用于同阶段工况比较。",
    "空值不补零；冲突重复排除数值；注采井号保持原名，不自动合并疑似别名。",
    "净计量变化=已记录注气量−已记录采气量；缺少期初库存、气损及完整历史，不能当作当前库存、工作气量或回收率。",
    "油压是原表井口油压；压力口径与标况未明，不换算地层压力、不进行 p/Z 库存反算。",
    "运行阶段由实际记录识别；气年度默认 4 月起，仅作分组，可调整，不表示注采周期完整。",
    "异常是筛查线索，不能确认故障。预测为同工况短期基线，不能代表设计产能或调控指令。",
]


def _rounded(value):
    return (
        round(value, 6) if value is not None and math.isfinite(value) else None
    )


def _safe_sum(values):
    values = [v for v in values if v is not None]
    return _rounded(sum(values)) if values else None


def _days(a, b):
    return (date.fromisoformat(a) - date.fromisoformat(b)).days


def _year(day: str, start_month: int) -> str:
    d = date.fromisoformat(day)
    if start_month == 1:
        return str(d.year)
    y = d.year - (d.month < start_month)
    return f"{y}-{y + 1}"


def _percentile(values, p):
    values = sorted(values)
    x = (len(values) - 1) * p
    lo = int(x)
    return values[lo] + (values[min(lo + 1, len(values) - 1)] - values[lo]) * (
        x - lo
    )


def _well_summary(history, as_of, drop_threshold):
    active = [r for r in history if r["gas"] is not None and r["gas"] > 0]
    result = {
        "facility": history[0]["facility"],
        "well": history[0]["well"],
        "mode": history[0]["mode"],
        "records": len(history),
        "active_days": len(active),
        "observed_volume": _safe_sum([r["gas"] for r in history]),
        "first_date": history[0]["day"],
        "last_date": history[-1]["day"],
        "missing_gas": sum(r["gas"] is None for r in history),
        "forecast": None,
        "forecast_reason": "当前无连续有效运行阶段",
        "rate_change_pct": None,
        "pressure_change_pct": None,
        "last_active_date": active[-1]["day"] if active else None,
    }
    # A zero, missing value or a gap breaks the comparable operating segment.
    segment = []
    for row in history:
        if (
            row["gas"] is None
            or row["gas"] <= 0
            or row["hours"] is None
            or row["hours"] <= 0
        ):
            segment = []
            continue
        if segment and _days(row["day"], segment[-1]["day"]) != 1:
            segment = []
        segment.append(row)
    flags = []
    if not segment or _days(as_of, segment[-1]["day"]) > 1:
        return result, flags
    q = [r["gas"] * 24 / r["hours"] for r in segment[-28:]]
    result["segment_days"] = len(segment)
    result["last_equivalent_24h_rate"] = _rounded(q[-1])
    if len(q) >= 14:
        before, recent = median(q[-14:-7]), median(q[-7:])
        change = (recent / before - 1) * 100 if before > 0 else None
        result["rate_change_pct"] = _rounded(change)
        p1 = [
            r["pressure"]
            for r in segment[-14:-7]
            if r["pressure"] is not None and r["pressure"] > 0
        ]
        p2 = [
            r["pressure"]
            for r in segment[-7:]
            if r["pressure"] is not None and r["pressure"] > 0
        ]
        pressure_change = (
            (median(p2) / median(p1) - 1) * 100
            if len(p1) >= 4 and len(p2) >= 4
            else None
        )
        result["pressure_change_pct"] = _rounded(pressure_change)
        if change is not None and change <= -drop_threshold:
            row = segment[-1]
            flags.append(
                {
                    "code": "operating_rate_drop",
                    "facility": row["facility"],
                    "well": row["well"],
                    "mode": row["mode"],
                    "day": row["day"],
                    "rate_change_pct": _rounded(change),
                    "pressure_change_pct": _rounded(pressure_change),
                    "source": {k: row[k] for k in ("file", "sheet", "row")},
                    "message": "同方向连续阶段内 24h 折算量下降；核查调度、气嘴、井口压力、计量与出"
                    "水，尚未确认产能损失",
                },
            )
        forecast = {
            "method": "同方向连续运行阶段末 7 日计量日量中位数，保持工况的 7 日基线",
            "horizon_days": 7,
            "daily_volume": _rounded(median([r["gas"] for r in segment[-7:]])),
            "observed_p10": _rounded(
                _percentile([r["gas"] for r in segment[-28:]], 0.1),
            ),
            "observed_p90": _rounded(
                _percentile([r["gas"] for r in segment[-28:]], 0.9),
            ),
            "range_kind": "历史日量分位范围，非预测置信区间",
            "backtest_mae": None,
        }
        result["forecast"] = forecast
        # Rolling-origin holdout: each estimate uses only earlier observations.
        if len(segment) >= 21:
            errors = []
            for i in range(len(segment) - 7, len(segment)):
                predicted = median([r["gas"] for r in segment[i - 7 : i]])
                errors.append(abs(predicted - segment[i]["gas"]))
            forecast["backtest_mae"] = _rounded(mean(errors))
        result["forecast_reason"] = "在注采方向、调度与工况保持条件下可用；未纳入地层压力和设施约束"
    return result, flags


def _historical_screen(history, threshold):
    """Emit the onset of each drop within a continuous operating segment."""
    segment, flagged = [], False
    events = []
    for row in history:
        if (
            row["gas"] is None
            or row["gas"] <= 0
            or row["hours"] is None
            or row["hours"] <= 0
        ):
            segment, flagged = [], False
            continue
        if segment and _days(row["day"], segment[-1]["day"]) != 1:
            segment, flagged = [], False
        segment.append(row)
        segment = segment[-14:]
        if len(segment) < 14:
            continue
        rates = [r["gas"] * 24 / r["hours"] for r in segment]
        change = (median(rates[7:]) / median(rates[:7]) - 1) * 100
        dropping = change <= -threshold
        if dropping and not flagged:
            events.append(
                {
                    "code": "operating_rate_drop",
                    "facility": row["facility"],
                    "well": row["well"],
                    "mode": row["mode"],
                    "day": row["day"],
                    "rate_change_pct": _rounded(change),
                    "source": {k: row[k] for k in ("file", "sheet", "row")},
                    "message": "同方向连续 14 日中末 7 日运行折算量下降，需核查调度、气嘴、计量、压力与出水",
                },
            )
        flagged = dropping
    return events


# pylint: disable-next=R0912,R0915
def analyze(
    store: DatasetStore,
    dataset_id: str,
    facility: str = "",
    well: str = "",
    start: str = "",
    end: str = "",
    cycle_start_month: int = 4,
    drop_threshold_pct: float = 30,
) -> dict:
    if not 1 <= cycle_start_month <= 12:
        raise ValueError("气年度起始月份必须在 1–12")
    if not 0 < drop_threshold_pct <= 100:
        raise ValueError("下降筛查阈值必须在 (0,100]")
    for value in (start, end):
        if value:
            date.fromisoformat(value)
    if start and end and start > end:
        raise ValueError("起始日期不能晚于结束日期")
    manifest = store.manifest(dataset_id)
    clauses, args = [], []
    for field, value, operator in (
        ("facility", facility, "="),
        ("well", well, "="),
        ("day", start, ">="),
        ("day", end, "<="),
    ):
        if value:
            clauses.append(f"{field}{operator}?")
            args.append(value)
    where = " WHERE " + " AND ".join(clauses) if clauses else ""
    daily = defaultdict(list)
    histories = defaultdict(list)
    coverage = defaultdict(list)
    gas_years = defaultdict(list)
    counts = Counter()
    anomalies = []
    with closing(store.connect(dataset_id)) as db:
        for r in db.execute(
            "SELECT * FROM records"
            + where
            + " ORDER BY day,facility,well,mode",
            args,
        ):
            row = dict(r)
            counts["records"] += 1
            counts["missing_gas"] += row["gas"] is None
            if row["gas"] is not None and row["gas"] > 0 and row["hours"] == 0:
                counts["gas_without_hours"] += 1
                anomalies.append(
                    {
                        "code": "gas_without_hours",
                        "facility": row["facility"],
                        "well": row["well"],
                        "day": row["day"],
                        "mode": row["mode"],
                        "source": {
                            k: row[k] for k in ("file", "sheet", "row")
                        },
                        "message": "有气量但生产时间为 0，保留计量量，排除 24h 折算分析",
                    },
                )
            daily[(row["facility"], row["day"])].append(row)
            histories[(row["facility"], row["well"], row["mode"])].append(row)
            coverage[(row["facility"], row["mode"])].append(row)
            gas_years[
                (row["facility"], _year(row["day"], cycle_start_month))
            ].append(row)
    if not counts["records"]:
        raise ValueError("筛选范围内没有记录")
    as_of = max(key[1] for key in daily)

    def volumes(rows):
        inj = _safe_sum([r["gas"] for r in rows if r["mode"] == "injection"])
        out = _safe_sum([r["gas"] for r in rows if r["mode"] == "withdrawal"])
        return {
            "injection": inj,
            "withdrawal": out,
            "net_metered_change": (
                _rounded(inj - out)
                if inj is not None and out is not None
                else None
            ),
        }

    coverage_rows = []
    warnings = list(LIMITATIONS)
    for (name, mode), rows in sorted(coverage.items()):
        coverage_rows.append(
            {
                "facility": name,
                "mode": mode,
                "start": rows[0]["day"],
                "end": rows[-1]["day"],
                "records": len(rows),
                "missing_gas": sum(r["gas"] is None for r in rows),
                "observed_volume": _safe_sum([r["gas"] for r in rows]),
            },
        )
    for name in sorted({k[0] for k in coverage}):
        inj = coverage.get((name, "injection"))
        out = coverage.get((name, "withdrawal"))
        if not inj or not out:
            warnings.append(f"{name}：筛选范围缺少一侧注采记录，不能比较注采平衡")
        elif abs(_days(inj[-1]["day"], out[-1]["day"])) > 365:
            warnings.append(f"{name}：注采记录末期相差超过一年，年度净量不代表库存变化的完整记录")
    for source in manifest["sources"]:
        if source["xls_row_limit"]:
            warnings.append(
                f"{source['file']}/{source['sheet']}：达到 XLS 行上限，疑似导出截断",
            )

    timeline, phases = [], []
    for (name, day), rows in sorted(daily.items()):
        v = volumes(rows)
        positive_inj = (v["injection"] or 0) > 0
        positive_out = (v["withdrawal"] or 0) > 0
        state = (
            "mixed"
            if positive_inj and positive_out
            else (
                "injection"
                if positive_inj
                else (
                    "withdrawal"
                    if positive_out
                    else (
                        "zero_observed"
                        if any(r["gas"] is not None for r in rows)
                        else "unknown"
                    )
                )
            )
        )
        pressures = [
            r["pressure"]
            for r in rows
            if r["gas"] is not None
            and r["gas"] > 0
            and r["pressure"] is not None
            and r["pressure"] > 0
        ]
        timeline.append(
            {
                "facility": name,
                "day": day,
                **v,
                "state": state,
                "active_wells": len(
                    {
                        r["well"]
                        for r in rows
                        if r["gas"] is not None and r["gas"] > 0
                    },
                ),
                "wellhead_pressure_median": (
                    _rounded(median(pressures)) if pressures else None
                ),
                "water": _safe_sum(
                    [r["water"] for r in rows if r["mode"] == "withdrawal"],
                ),
            },
        )
        if (
            not phases
            or phases[-1]["facility"] != name
            or phases[-1]["state"] != state
            or _days(day, phases[-1]["end"]) != 1
        ):
            phases.append(
                {
                    "facility": name,
                    "state": state,
                    "start": day,
                    "end": day,
                    "observed_days": 1,
                    "injection": v["injection"],
                    "withdrawal": v["withdrawal"],
                },
            )
        else:
            phase = phases[-1]
            phase["end"] = day
            phase["observed_days"] += 1
            for field in ("injection", "withdrawal"):
                phase[field] = _safe_sum([phase[field], v[field]])

    monthly = defaultdict(list)
    for row in timeline:
        monthly[(row["facility"], row["day"][:7])].append(row)
    series = [
        {
            "facility": name,
            "month": month,
            "injection": _safe_sum([r["injection"] for r in rows]),
            "withdrawal": _safe_sum([r["withdrawal"] for r in rows]),
            "observed_days": len(rows),
        }
        for (name, month), rows in sorted(monthly.items())
    ]
    cycles = []
    for (name, year), rows in sorted(gas_years.items()):
        v = volumes(rows)
        water = _safe_sum(
            [
                r["water"]
                for r in rows
                if r["mode"] == "withdrawal"
                and r["gas"] is not None
                and r["gas"] > 0
            ],
        )
        paired_gas = _safe_sum(
            [
                r["gas"]
                for r in rows
                if r["mode"] == "withdrawal"
                and r["water"] is not None
                and r["gas"] is not None
                and r["gas"] > 0
            ],
        )
        cycles.append(
            {
                "facility": name,
                "gas_year": year,
                **v,
                "records": len(rows),
                "water_gas_mass_ratio": (
                    _rounded(water / paired_gas)
                    if water is not None and paired_gas
                    else None
                ),
                "ratio_unit": "t/万m³（仅气水均有记录的采气行）",
                "completeness": "未验证完整周期",
            },
        )
    wells = []
    for history in histories.values():
        summary, _ = _well_summary(history, as_of, drop_threshold_pct)
        wells.append(summary)
        anomalies.extend(_historical_screen(history, drop_threshold_pct))
    latest = [r for r in timeline if r["day"] == as_of]
    # Totals are based on original measured volumes, never operating-rate
    # normalization.
    total = {
        mode: _safe_sum(
            [
                r["gas"]
                for rows in coverage.values()
                for r in rows
                if r["mode"] == mode
            ],
        )
        for mode in ("injection", "withdrawal")
    }
    return {
        "schema_version": 1,
        "engine_version": VERSION,
        "dataset_id": dataset_id,
        "filters": {
            "facility": facility,
            "well": well,
            "start": start,
            "end": end,
        },
        "parameters": {
            "cycle_start_month": cycle_start_month,
            "drop_threshold_pct": drop_threshold_pct,
        },
        "summary": {
            "records": counts["records"],
            "facilities": len({k[0] for k in histories}),
            "wells": len({k[:2] for k in histories}),
            "start": min(k[1] for k in daily),
            "as_of": as_of,
            "missing_gas": counts["missing_gas"],
            **total,
            "anomaly_count": len(anomalies),
            "gas_without_hours_count": counts["gas_without_hours"],
        },
        "coverage": coverage_rows,
        "cycles": cycles,
        "monthly": series,
        "daily_recent": sorted(
            timeline,
            key=lambda r: (r["day"], r["facility"]),
        )[-730:],
        "phases_recent": phases[-200:],
        "latest": latest,
        "wells": sorted(
            wells,
            key=lambda r: (r["facility"], r["well"], r["mode"]),
        ),
        "anomalies": sorted(anomalies, key=lambda r: r["day"], reverse=True)[
            :100
        ],
        "quality": {
            "import_counts": manifest["quality_counts"],
            "scope": "整个数据集导入检查",
            "examples": manifest["quality_examples"],
        },
        "units": manifest["units"],
        "gas_reference_conditions": manifest["gas_reference_conditions"],
        "warnings": warnings,
        "provenance": {
            "files": manifest["files"],
            "sources": manifest["sources"],
            "volume_rule": "sum(observed daily volumes)",
            "pressure_basis": "original wellhead oil pressure",
        },
    }


def markdown_report(result: dict) -> str:
    s = result["summary"]

    def fmt(n):
        return "缺测" if n is None else f"{n:,.3f}"

    def cell(value):
        return str(value).replace("|", "\\|").replace("\n", " ")

    lines = [
        "# 储气库生产动态分析报告",
        "",
        f"数据集：{result['dataset_id']}  ·  引擎：{result['engine_version']}",
        f"筛选："
        f"{cell(result['filters']['facility'] or '全部储气库')}"
        f" / "
        f"{cell(result['filters']['well'] or '全部井')}"
        f"；气年度 "
        f"{result['parameters']['cycle_start_month']}"
        f" 月起；下降筛查阈值 "
        f"{result['parameters']['drop_threshold_pct']}"
        f"%。",
        f"记录范围：{s['start']} 至 {s['as_of']}（数据日期，不代表今日实时工况）",
        f"{s['facilities']}"
        f" 座库 / "
        f"{s['wells']}"
        f" 个原始井号 / "
        f"{s['records']:,}"
        f" 条日记录；气量缺测 "
        f"{s['missing_gas']:,}"
        f" 条。",
        "",
        f"已记录注气总量："
        f"{fmt(s['injection'])}"
        f" 万m³；已记录采气总量："
        f"{fmt(s['withdrawal'])}"
        f" 万m³。",
        "",
        "## 数据覆盖",
        "",
        "| 库 | 方向 | 起始 | 截止 | 日记录 | 缺测气量 |",
        "|---|---|---|---|---:|---:|",
    ]
    for r in result["coverage"]:
        lines.append(
            f"| "
            f"{cell(r['facility'])}"
            f" | "
            f"{('注气' if r['mode'] == 'injection' else '采气')}"
            f" | "
            f"{r['start']}"
            f" | "
            f"{r['end']}"
            f" | "
            f"{r['records']}"
            f" | "
            f"{r['missing_gas']}"
            f" |",
        )
    lines += [
        "",
        "## 气年度动态（最近 30 个库年度；万m³；未验证完整周期）",
        "",
        "| 库 | 气年度 | 注气 | 采气 | 净计量变化 |",
        "|---|---|---:|---:|---:|",
    ]
    for r in sorted(
        result["cycles"],
        key=lambda c: (c["gas_year"], c["facility"]),
    )[-30:]:
        lines.append(
            f"| "
            f"{cell(r['facility'])}"
            f" | "
            f"{r['gas_year']}"
            f" | "
            f"{fmt(r['injection'])}"
            f" | "
            f"{fmt(r['withdrawal'])}"
            f" | "
            f"{fmt(r['net_metered_change'])}"
            f" |",
        )
    lines += [
        "",
        "## 优先复核线索",
        "",
        f"共 {s['anomaly_count']} 项筛查线索，本报告展示最近 20 项；可按库、井或日期进一步筛选复核。",
        "",
    ]
    if not result["anomalies"]:
        lines.append("本筛选范围未触发已配置的筛查规则；不等于已排除全部问题。")
    for r in result["anomalies"][:20]:
        source = r["source"]
        lines.append(
            f"- "
            f"{r['day']}"
            f" "
            f"{r['facility']}"
            f"/"
            f"{r['well']}"
            f"："
            f"{r['message']}"
            f"（"
            f"{source['file']}"
            f" / "
            f"{source['sheet']}"
            f" / 第 "
            f"{source['row']}"
            f" 行）",
        )
    lines += ["", "## 短期基线", ""]
    forecasts = [r for r in result["wells"] if r["forecast"]]
    if not forecasts:
        lines.append("当前筛选截止日缺少连续有效运行阶段，未生成短期预测。")
    for r in forecasts:
        f = r["forecast"]
        lines.append(
            f"- "
            f"{r['facility']}"
            f"/"
            f"{r['well']}"
            f"（"
            f"{r['mode']}"
            f"）：条件性 7 日基线 "
            f"{fmt(f['daily_volume'])}"
            f" 万m³/日；滚动回测 MAE "
            f"{fmt(f['backtest_mae'])}"
            f" 万m³/日。",
        )
    lines += ["", "## 分析口径与限制", ""] + ["- " + w for w in result["warnings"]]
    lines += ["", "## 数据指纹", ""]
    lines += [
        f"- {p['file']}：SHA-256 `{p['sha256']}`"
        for p in result["provenance"]["files"]
    ]
    lines += [
        "",
        "定义参考：[EIA 储气库基础概念](https://www.eia.gov/naturalgas/st"
        "orage/basics/)；不采用美国季节规则推断本项目运行周期。",
        "",
    ]
    return "\n".join(lines)
