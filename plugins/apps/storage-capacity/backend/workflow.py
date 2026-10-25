# -*- coding: utf-8 -*-
"""Engineering nodes with scoped inputs and reproducible dependencies."""

from __future__ import annotations

import copy
import math
from datetime import datetime, timezone
from statistics import mean

from .catalog import METHODS
from .methods import compute_unit, number, pvt_z, weighted_pressure
from .workbench import applicability, assess, fingerprint, recommend

NODES = [
    ("scope", "评估范围", "准备", []),
    ("data", "资料整理", "准备", []),
    ("accounting", "计量与账面库存", "准备", ["scope"]),
    ("pvt", "流体与 PVT", "分析", []),
    ("pressure", "地层压力", "分析", []),
    ("connectivity", "连通性与单元", "分析", []),
    ("methods", "特征与方法", "分析", ["connectivity"]),
    ("inventory", "有效库存", "计算", ["pressure", "pvt", "methods"]),
    ("window", "压力窗口与库容", "计算", ["inventory"]),
    ("deliverability", "注采与调峰能力", "计算", ["window"]),
    ("results", "校验与结果采用", "成果", ["accounting", "deliverability"]),
    ("report", "报告与归档", "成果", ["results"]),
]
GLOBAL = {"scope", "data", "accounting", "results", "report"}
LABELS = {k: label for k, label, _, _ in NODES}
PREFIXES = ("injection_end", "evaluation", "minimum", "maximum")


def catalog():
    return [
        {
            "id": k,
            "name": n,
            "group": g,
            "dependencies": d,
            "scope": "project" if k in GLOBAL else "unit",
        }
        for k, n, g, d in NODES
    ]


def selected(case, index):
    if (
        isinstance(index, bool)
        or not isinstance(index, int)
        or not 0 <= index < len(case.get("units", []))
    ):
        raise ValueError("请先选择有效的评估单元")
    return case["units"][index]


def inputs(case, node, index=0):
    # Each node selects only its own dependencies for invalidation.
    # pylint: disable=too-many-branches,too-many-return-statements
    """Fingerprint only actual upstream fields; edits in other units stay
    independent.
    """
    if node not in LABELS:
        raise ValueError("未知流程节点")
    if node in {"results", "report"}:
        return case
    if node == "scope":
        return {
            **{
                k: case.get(k)
                for k in (
                    "case_name",
                    "cycle_id",
                    "purpose",
                    "storage_type",
                    "rock_type",
                    "reservoir_medium",
                    "operating_stage",
                    "start_state",
                    "end_state",
                    "pressure_basis",
                    "standard",
                )
            },
            "units": [
                {k: u.get(k) for k in ("name", "method", "source")}
                for u in case.get("units", [])
            ],
        }
    if node == "data":
        return {"documents": case.get("documents", [])}
    if node == "accounting":
        return {
            k: case.get(k)
            for k in (
                "ledger",
                "book_inventory",
                "book_state",
                "sources",
                "standard",
                "cycle_id",
                "start_state",
                "end_state",
            )
        }
    unit = selected(case, index)
    p = unit.get("parameters", {})
    base = {"name": unit.get("name"), "cycle_id": case.get("cycle_id")}
    if node == "pressure":
        return {
            **base,
            "basis": case.get("pressure_basis"),
            **{
                k: unit.get(k)
                for k in (
                    "start_pressures",
                    "end_pressures",
                    "pressure_source",
                    "pressure_weight_basis",
                    "pressure_config",
                )
            },
            "states": [case.get("start_state"), case.get("end_state")],
            "adopted": {
                k: p.get(k)
                for k in ("injection_end_pressure", "evaluation_pressure")
            },
            "evidence": unit.get("evidence", {}),
        }
    if node == "pvt":
        return {
            **base,
            "pvt": unit.get("pvt"),
            "config": unit.get("pvt_config"),
            "standard": case.get("standard"),
            "parameters": {
                k: p.get(k)
                for k in (
                    "temperature",
                    *[s + t for s in PREFIXES for t in ("_pressure", "_z")],
                )
            },
            "pressure": inputs(case, "pressure", index),
        }
    if node == "connectivity":
        return {
            **base,
            "source": unit.get("source"),
            "storage_type": case.get("storage_type"),
            "connectivity": unit.get("connectivity", {}),
            "non_overlapping": case.get("non_overlapping"),
        }
    if node == "methods":
        return {
            **base,
            "storage_type": case.get("storage_type"),
            "method": unit.get("method"),
            "conditions": unit.get("conditions"),
            "source": unit.get("source"),
            "series_count": len(unit.get("series", [])),
            "connectivity": inputs(case, "connectivity", index),
        }
    subset = copy.deepcopy(unit)
    if node in {"inventory", "window"}:
        for field in (
            "schedule",
            "wells",
            "surface_limit",
            "withdrawal_days",
            "schedule_source",
            "forecast",
        ):
            subset.pop(field, None)
    if node == "inventory" and unit.get("method") != "volumetric":
        for k in (
            "minimum_pressure",
            "minimum_z",
            "maximum_pressure",
            "maximum_z",
        ):
            subset.get("parameters", {}).pop(k, None)
    return {
        "unit": subset,
        "context": {
            k: case.get(k)
            for k in (
                "cycle_id",
                "start_state",
                "end_state",
                "standard",
                "pressure_basis",
                "storage_type",
            )
        },
    }


def key(node, index=0):
    return node if node in GLOBAL else f"{index}:{node}"


def statuses(case, runs, index=0):
    out = []
    for item in catalog():
        node = item["id"]
        latest = runs.get(key(node, index))
        try:
            current = fingerprint(inputs(case, node, index))
            state = "ready"
            if latest:
                state = (
                    latest["status"]
                    if latest["input_hash"] == current
                    else "stale"
                )
        except ValueError:
            current, state = None, "missing"
        out.append(
            {**item, "status": state, "input_hash": current, "run": latest},
        )
    return out


def pressure(unit, case):
    config = unit.get("pressure_config", {})
    adopted = dict(unit.get("parameters", {}))
    rows_out, warnings = [], []
    for rows_key, target in [
        ("start_pressures", "injection_end_pressure"),
        ("end_pressures", "evaluation_pressure"),
    ]:
        rows = unit.get(rows_key, [])
        if not rows:
            if adopted.get(target) not in (None, ""):
                rows_out.append(
                    {
                        "状态": (
                            "起始" if rows_key == "start_pressures" else "末期"
                        ),
                        "采用压力 MPa": number(adopted[target], target),
                        "依据": unit.get("source", "直接输入，待补来源"),
                    },
                )
            continue
        if not unit.get("pressure_source") or not unit.get(
            "pressure_weight_basis",
        ):
            raise ValueError("测压加权需要测压来源和权重依据")
        normalized = []
        for row in rows:
            value = number(row.get("pressure"), "实测压力")
            if row.get("interpreted_pressure") not in (None, ""):
                if not row.get("source"):
                    raise ValueError("解释压力必须注明解释成果来源")
                value = number(row["interpreted_pressure"], "解释压力")
            elif config.get("mode") == "datum":
                # Depth increases downwards. Gradient is explicitly supplied,
                # not inferred.
                gradient = number(
                    config.get("gradient"),
                    "压力梯度 MPa/m",
                    zero=True,
                )
                datum = number(
                    config.get("datum_depth"),
                    "基准深度 m",
                    zero=True,
                )
                depth = number(row.get("depth"), "测点垂深 m", zero=True)
                value += gradient * (datum - depth)
            if config.get("reference") == "gauge":
                value += number(
                    config.get("atmospheric_pressure"),
                    "当地大气压 MPa",
                )
                if case.get("pressure_basis") != "absolute":
                    raise ValueError("表压换算后项目压力口径须选择绝对压力")
            if config.get("representation") == "p_over_z":
                raise ValueError(
                    "输入已是 p/Z，不能作为地层压力再次除以 Z；请提供原始压力",
                )
            normalized.append(
                {
                    "pressure": number(value, "处理后压力"),
                    "weight": row.get("weight"),
                },
            )
            rows_out.append(
                {
                    "状态": ("起始" if rows_key == "start_pressures" else "末期"),
                    "井": row.get("name", ""),
                    "原始压力 MPa": row.get("pressure"),
                    "采用压力 MPa": value,
                    "权重": row.get("weight"),
                    "关井天数": row.get("shut_in_days"),
                    "依据": row.get("source") or unit["pressure_source"],
                },
            )
        adopted[target] = weighted_pressure(normalized)
    values = {
        k: adopted[k]
        for k in ("injection_end_pressure", "evaluation_pressure")
        if adopted.get(k) not in (None, "")
    }
    if not values:
        raise ValueError("请录入起始或末期测压记录，或有依据的代表压力")
    warnings.append(
        "加权及深度折算不等于压力恢复解释；短关井测值不能自动认定为平衡压力。",
    )
    return {
        "values": values,
        "rows": rows_out,
        "warnings": warnings,
        "steps": [
            "采用值优先使用注明来源的解释压力；否则按选定基准处理实测值，再按明确权重汇总。",
        ],
    }


def resolved(unit, case, include_window=True):
    u = copy.deepcopy(unit)
    p = u.setdefault("parameters", {})
    if not include_window and u.get("method") != "volumetric":
        for prefix in ("minimum", "maximum"):
            p.pop(prefix + "_pressure", None)
            p.pop(prefix + "_z", None)
    if u.get("start_pressures") or u.get("end_pressures"):
        p.update(pressure(u, case)["values"])
        u["start_pressures"], u["end_pressures"] = [], []
    cfg = u.get("pvt_config", {})
    if cfg.get("representation") == "p_over_z":
        raise ValueError(
            "资料已经是 p/Z，请在压力节点核对原始压力，避免重复除以 Z",
        )
    if u.get("pvt_config", {}).get("mode") == "table" and not u.get("pvt"):
        raise ValueError("已选择实验表插值，请提供 PVT 实验表")
    if u.get("pvt"):
        if (
            cfg.get("temperature")
            and p.get("temperature")
            and abs(float(cfg["temperature"]) - float(p["temperature"])) > 0.01
        ):
            raise ValueError(
                "PVT 表温度与评价温度不同，不能用一维压力插值替代温度修正",
            )
        mode = cfg.get("mode", "missing")
        for prefix in PREFIXES:
            pk, zk = prefix + "_pressure", prefix + "_z"
            if p.get(pk) not in (None, "") and (
                mode == "table" or p.get(zk) in (None, "")
            ):
                p[zk] = pvt_z(u["pvt"], number(p[pk], pk))
    std = case.get("standard", {})
    temp = p.get("temperature") or cfg.get("temperature")
    if (
        temp
        and std.get("mode") != "reported"
        and case.get("pressure_basis") == "absolute"
        and all(std.get(k) for k in ("temperature", "pressure", "z"))
    ):
        for prefix, bg_key in (
            ("injection_end", "initial_bg"),
            ("evaluation", "final_bg"),
        ):
            pr, z = p.get(prefix + "_pressure"), p.get(prefix + "_z")
            if (
                pr not in (None, "")
                and z not in (None, "")
                and (cfg.get("mode") == "table" or p.get(bg_key) in (None, ""))
            ):
                p[bg_key] = (
                    number(z, "Z")
                    * number(temp, "温度 K")
                    * number(std["pressure"], "标准压力")
                    / (
                        number(pr, "压力 MPa")
                        * number(std["z"], "标准Z")
                        * number(std["temperature"], "标准温度")
                    )
                )
    return u


def pvt(unit, case):
    u = resolved(unit, case)
    p, rows, values = u["parameters"], [], {}
    cfg = u.get("pvt_config", {})
    for prefix in PREFIXES:
        pk, zk = prefix + "_pressure", prefix + "_z"
        if p.get(pk) in (None, "") or p.get(zk) in (None, ""):
            continue
        pr, z = number(p[pk], pk), number(p[zk], zk)
        values[zk] = z
        row = {
            "状态": {
                "injection_end": "起始",
                "evaluation": "末期",
                "minimum": "下限",
                "maximum": "上限",
            }[prefix],
            "压力 MPa": pr,
            "Z": z,
        }
        std = case.get("standard", {})
        temp = p.get("temperature") or cfg.get("temperature")
        if (
            temp
            and std.get("mode") != "reported"
            and all(std.get(k) for k in ("temperature", "pressure", "z"))
            and case.get("pressure_basis") == "absolute"
        ):
            bg = (
                z
                * number(temp, "温度 K")
                * number(std["pressure"], "标准压力")
                / (
                    pr
                    * number(std["z"], "标准Z")
                    * number(std["temperature"], "标准温度")
                )
            )
            row["Bg 地层m³/标准m³"] = bg
            if prefix in ("injection_end", "evaluation"):
                values[
                    "initial_bg" if prefix == "injection_end" else "final_bg"
                ] = bg
        rows.append(row)
    if not rows:
        raise ValueError(
            "请提供目标压力及 Z，或目标压力和覆盖该压力的实验 PVT 表",
        )
    return {
        "values": values,
        "rows": rows,
        "steps": [
            "实验表在已知压力范围内分段线性插值；Bg = Z·T·Ps / (P·Zs·Ts)。",
        ],
        "warnings": [
            "本节点完成实验 PVT 表插值与状态体积换算；组分相态需导入真实 EOS/实验成果，不用对话估算 Z。",
            "PVT 表须对应相同样品、组成和温度。",
        ],
    }


def connectivity(unit, case):
    if case.get("storage_type") == "salt_cavern":
        return {
            "status": "not_applicable",
            "values": {},
            "steps": ["盐穴按独立腔体划分，使用腔体几何、温压及完整性资料。"],
        }
    config = unit.get("connectivity", {})
    rows = config.get("series", [])
    if not config.get("source"):
        raise ValueError("请填写连通性资料来源、井对和测试/运行时段")
    if len(rows) < 5:
        raise ValueError(
            "压力响应诊断至少需要 5 个等间隔同步观测点；结论可另填入地质与试井解释栏",
        )
    times = [number(r.get("time"), "相对时间", zero=True) for r in rows]
    dt = times[1] - times[0]
    if dt <= 0 or any(
        abs(b - a - dt) > 1e-6 * max(dt, 1) for a, b in zip(times, times[1:])
    ):
        raise ValueError(
            "请先将两组序列对齐为严格递增、等间隔的同步时间点，缺测不能当零",
        )
    x = [number(r.get("x"), "井 A 压力") for r in rows]
    y = [number(r.get("y"), "井 B 压力") for r in rows]
    if config.get("difference", True):
        x, y = [b - a for a, b in zip(x, x[1:])], [
            b - a for a, b in zip(y, y[1:])
        ]
    max_lag = min(
        int(number(config.get("max_lag", 2), "最大滞后点数", zero=True)),
        len(x) - 3,
        30,
    )
    out = []
    for lag in range(-max_lag, max_lag + 1):
        a, b = (
            (x[-lag:], y[:lag])
            if lag < 0
            else (x[:-lag], y[lag:])
            if lag
            else (x, y)
        )
        am, bm = mean(a), mean(b)
        denominator = math.sqrt(
            sum((v - am) ** 2 for v in a) * sum((v - bm) ** 2 for v in b),
        )
        out.append(
            {
                "滞后时间": lag * dt,
                "相关系数": (
                    sum((v - am) * (w - bm) for v, w in zip(a, b))
                    / denominator
                    if denominator
                    else None
                ),
                "样本数": len(a),
            },
        )
    valid = [r for r in out if r["相关系数"] is not None]
    if not valid:
        raise ValueError(
            "序列变化量无方差，无法计算相关性；请补充有效响应观测",
        )
    best = max(valid, key=lambda r: abs(r["相关系数"]))
    return {
        "values": {
            "response_correlation": best["相关系数"],
            "response_lag": best["滞后时间"],
        },
        "rows": out,
        "steps": [
            "对同步压力序列计算指定滞后下的 Pearson 相关系数。"
            + ("已先作一阶差分。" if config.get("difference", True) else "使用原始序列。"),
            "分区解释：" + (config.get("interpretation") or "尚未采用分区结论"),
        ],
        "warnings": [
            "相关性只是响应证据；共同注采制度也会产生相关，不能单独认定水力连通或自动合并单元。",
        ],
    }


def inventory(unit, case, window=False):
    u = resolved(unit, case, include_window=window)
    u["schedule"], u["wells"] = [], []
    if u.get("method") == "auto":
        raise ValueError("请在特征与方法节点采用有依据的主评估方法")
    errors = applicability(u, case)
    if case.get("pressure_basis") not in {
        "absolute",
        "report_defined",
        "apparent_formation",
    }:
        errors.append("请明确项目压力口径")
    if (
        not case.get("cycle_id")
        or not case.get("start_state")
        or not case.get("end_state")
    ):
        errors.append("请填写周期、起始和末期状态")
    std = case.get("standard", {})
    if not std.get("source"):
        errors.append("请填写气量标准状态依据")
    if std.get("mode") != "reported":
        for k in ("pressure", "temperature", "z"):
            try:
                number(std.get(k), "标准状态 " + k)
            except ValueError as exc:
                errors.append(str(exc))
    elif u.get("method") not in {"pz", "pz_regression", "water_mbe"}:
        errors.append("该方法需要核实气量标准温压")
    if errors:
        raise ValueError("；".join(errors))
    result = compute_unit(u, case)
    if not window:
        result["warnings"] = [
            w
            for w in result.get("warnings", [])
            if w != "缺少下限压力或对应 Z 因子，未计算可动垫气与地层调峰气量"
        ]
    if window and not any(
        k in result["values"] for k in ("working_gas", "geological_swing")
    ):
        raise ValueError(
            "当前方法尚无压力窗口成果；请补充下限压力和物性，或导入同口径的模拟窗口成果",
        )
    return result


def dynamic_forecast(unit, case):
    """Couple daily material balance to calibrated binomial well curves."""
    if unit.get("method") != "pz" or case.get("pressure_basis") != "absolute":
        raise ValueError(
            "日步长耦合预测目前适用于绝压口径的定容干气两点 p/Z 模型；其他模型请导入专业预测曲线",
        )
    u = resolved(unit, case)
    base = inventory(u, case, window=True)
    p, cfg = u["parameters"], u.get("forecast", {})
    days = number(u.get("withdrawal_days"), "采气期天数")
    if days > 3660:
        raise ValueError("预测期限不得超过 3660 天")
    limit = number(u.get("surface_limit"), "地面处理限额")
    if not u.get("schedule_source") or not u.get("wells"):
        raise ValueError("请补充井产能系数、井底流压及预测边界依据")
    if cfg.get("boundary_verified") is not True:
        raise ValueError(
            "请核实井底流压由井筒与外输条件确定，以及 A/B 的流量单位为万m³/d",
        )
    if not u.get("pvt") or u.get("pvt_config", {}).get("mode") != "table":
        raise ValueError("耦合预测需选择实验表插值，PVT 表覆盖下限至起始压力")
    low, high = number(p.get("minimum_pressure"), "下限压力"), number(
        p.get("injection_end_pressure"),
        "起始压力",
    )
    # Require monotonically increasing p/Z over every knot in the actual
    # pressure window.
    knots = sorted(
        {
            low,
            high,
            *[
                float(r["pressure"])
                for r in u["pvt"]
                if low < float(r["pressure"]) < high
            ],
        },
    )
    ratios = [v / pvt_z(u["pvt"], v) for v in knots]
    if any(b <= a for a, b in zip(ratios, ratios[1:])):
        raise ValueError("压力窗口内 p/Z 必须严格递增，不能反演非单调物性表")
    total = base["values"]["effective_inventory"]
    start_ratio = high / p["injection_end_z"]
    remaining, cumulative, elapsed = total, 0.0, 0.0
    rows = []
    while elapsed < days:
        dt = min(1.0, days - elapsed)
        rate = 0.0
        for well in u["wells"]:
            a, b = number(well.get("a"), "A", zero=True), number(
                well.get("b"),
                "B",
                zero=True,
            )
            pwf = number(well.get("bottomhole_pressure"), "井底流压")
            if a + b <= 0:
                raise ValueError("A、B 不可同时为零")
            delta = max(0.0, high * high - pwf * pwf)
            rate += (
                2 * delta / (a + math.sqrt(a * a + 4 * b * delta))
                if delta and b
                else delta / a
                if a
                else 0.0
            )
        rate = min(rate, limit)
        gas = min(
            rate * dt / 1e4,
            max(0.0, base["values"]["geological_swing"] - cumulative),
        )
        remaining -= gas
        cumulative += gas
        target = start_ratio * remaining / total
        left, right = low, high
        for _ in range(55):
            mid = (left + right) / 2
            if mid / pvt_z(u["pvt"], mid) < target:
                left = mid
            else:
                right = mid
        high = (left + right) / 2
        elapsed += dt
        rows.append(
            {
                "日": elapsed,
                "日均量 万m³/d": gas / dt * 1e4,
                "剩余有效库存 亿m³": remaining,
                "末期压力 MPa": high,
                "累计采气 亿m³": cumulative,
            },
        )
    return {
        "values": {
            "deliverable_swing": cumulative,
            "peak_rate": max(r["日均量 万m³/d"] for r in rows),
        },
        "rows": rows,
        "steps": [
            "按不大于 1 天步长计算二项式井产能，施加地面限额与剩余可采气量，更新库存后反演 p/Z 得到下一步压力。",
        ],
        "warnings": [
            "筛选模型：等温、定容干气、固定经核实的井底流压；未求解井筒管网瞬态或调度优化。",
        ],
    }


def execute(case, node, index=0):
    # Dispatch the registered engineering nodes through one snapshot boundary.
    # pylint: disable=too-many-branches,too-many-statements
    digest = fingerprint(inputs(case, node, index))
    result = {
        "node": node,
        "name": LABELS[node],
        "unit_index": None if node in GLOBAL else index,
        "input_hash": digest,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "calculated",
        "values": {},
        "rows": [],
        "steps": [],
        "warnings": [],
        "errors": [],
    }
    # Retain plotted source data with the immutable calculation snapshot.
    project_keys = (
        "case_name",
        "cycle_id",
        "storage_type",
        "pressure_basis",
        "start_state",
        "end_state",
        "standard",
    )
    project = {k: copy.deepcopy(case.get(k)) for k in project_keys}
    if node == "scope":
        project["units"] = [
            {k: u.get(k) for k in ("name", "method", "source")}
            for u in case.get("units", [])
        ]
    if node == "data":
        project["documents"] = copy.deepcopy(case.get("documents", []))
    if node == "accounting":
        project.update(
            {
                k: copy.deepcopy(case.get(k))
                for k in ("ledger", "book_inventory")
            },
        )
    if node in {"results", "report"}:
        project["history"] = copy.deepcopy(case.get("history", []))
        project["documents"] = [
            {"name": d.get("name")} for d in case.get("documents", [])
        ]
    result["chart_context"] = {
        "project": project,
        "unit": (
            copy.deepcopy(selected(case, index))
            if node not in GLOBAL
            else None
        ),
    }
    try:
        u = selected(case, index) if node not in GLOBAL else None
        if node == "scope":
            missing = [
                label
                for k, label in [
                    ("case_name", "名称"),
                    ("cycle_id", "周期"),
                    ("start_state", "起始状态"),
                    ("end_state", "末期状态"),
                ]
                if not case.get(k)
            ]
            if missing:
                raise ValueError("请填写：" + "、".join(missing))
            result["steps"] = [
                "评估边界已登记；物性和方法节点分别检查自身条件。",
            ]
        elif node == "data":
            result["rows"] = [
                {
                    "文件": d["name"],
                    "表格": len(d.get("tables", [])),
                    "文本段": len(d.get("pages", [])),
                    "状态": d.get("status"),
                }
                for d in case.get("documents", [])
            ]
            result["steps"] = [
                "文件提取完成不代表字段已经采用；在资料映射或评估助手中查看填写记录。",
            ]
        elif node == "accounting":
            ledger = case.get("ledger", {})
            if case.get("book_inventory") not in (None, ""):
                if not case.get("sources", {}).get("book_inventory"):
                    raise ValueError("直接采用账面库存需要计量依据")
                value = number(case["book_inventory"], "账面库存", zero=True)
            else:
                if not ledger.get("source"):
                    raise ValueError("请填写计量区间及来源")
                vals = {
                    k: number(ledger.get(k), k, zero=True)
                    for k in (
                        "initial_inventory",
                        "injected",
                        "withdrawn",
                        "metered_loss",
                        "equivalent_gas",
                    )
                }
                value = (
                    vals["initial_inventory"]
                    + vals["injected"]
                    - vals["withdrawn"]
                    - vals["metered_loss"]
                    - vals["equivalent_gas"]
                )
                if value < 0:
                    raise ValueError("账面库存为负，请检查计量边界与重复扣减")
            result["values"] = {"book_inventory": value}
            result["steps"] = [
                "期初库存 + 注气 − 采气 − 独立核实损耗 − 未重复计入的液体当量气。",
            ]
        elif node == "pvt":
            result.update(pvt(u, case))
        elif node == "pressure":
            result.update(pressure(u, case))
        elif node == "connectivity":
            result.update(connectivity(u, case))
        elif node == "methods":
            rec = recommend(u, case)
            result["recommendation"] = rec
            result["rows"] = [
                {
                    "方法": m["name"],
                    "适用检查": "；".join(
                        applicability({**u, "method": m["id"]}, case),
                    )
                    or "已声明条件满足；运行时继续检查参数",
                }
                for m in METHODS
            ]
            result["steps"] = [rec["reason"]]
            if u.get("method") == "auto":
                result["status"] = "review"
                result["warnings"] = [
                    "推荐为候选方法，请查看依据后采用；资料缺失不视为复杂机理已证实。",
                ]
        elif node in {"inventory", "window"}:
            result.update(inventory(u, case, window=node == "window"))
        elif node == "deliverability":
            if u.get("forecast", {}).get("mode") == "dynamic":
                result.update(dynamic_forecast(u, case))
            else:
                inventory(u, case, window=True)
                output = compute_unit(resolved(u, case), case)
                if not any(
                    k in output["values"]
                    for k in ("deliverable_swing", "peak_rate")
                ):
                    raise ValueError(
                        "请补充有依据的预测曲线或二项式产能，或选择日步长耦合预测",
                    )
                result.update(output)
        elif node in {"results", "report"}:
            evaluation = evaluate(case)
            result["rows"] = [
                {"指标": m["label"], "值": m["value"], "单位": m["unit"]}
                for m in evaluation["metrics"]
            ]
            result["warnings"] = [
                c["detail"]
                for c in evaluation["checks"]
                if c["status"] != "passed"
            ]
            result["status"] = (
                "calculated"
                if evaluation["status"] == "calculated"
                else "review"
            )
            result["steps"] = [evaluation["summary"]]
    except (
        ValueError,
        KeyError,
        TypeError,
        ZeroDivisionError,
        OverflowError,
    ) as exc:
        result["status"] = "blocked"
        result["errors"] = [str(exc)]
    return result


def evaluate(case):
    """Use resolved report inputs and retain original evidence
    snapshot.
    """
    prepared = copy.deepcopy(case)
    prep_errors = []
    for i, unit in enumerate(case.get("units", [])):
        try:
            u = resolved(unit, case)
            if unit.get("forecast", {}).get("mode") == "dynamic":
                forecast = dynamic_forecast(unit, case)
                u["schedule"] = [
                    {"day": r["日"], "rate": r["日均量 万m³/d"]}
                    for r in forecast["rows"]
                ]
                u["wells"] = [
                    {
                        **well,
                        "reservoir_pressure": u["parameters"][
                            "injection_end_pressure"
                        ],
                    }
                    for well in u.get("wells", [])
                ]
            prepared["units"][i] = u
        except (ValueError, TypeError, KeyError, OverflowError) as exc:
            # Do not fall back to uncorrected inputs after a failed
            # transformation.
            prepared["units"][i]["method"] = "invalid_inputs"
            prep_errors.append(
                {
                    "label": unit.get("name", str(i)),
                    "status": "error",
                    "detail": str(exc),
                },
            )
    result = assess(prepared)
    result["case"] = copy.deepcopy(case)
    result["fingerprint"] = fingerprint(case)
    result["checks"].extend(prep_errors)
    return result
