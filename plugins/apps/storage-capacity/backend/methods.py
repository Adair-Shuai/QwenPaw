# -*- coding: utf-8 -*-
"""Pure engineering calculations. Values are never supplied by a \
language model."""
from __future__ import annotations

import math
from statistics import mean


def number(value, label, *, zero=False, signed=False):
    if isinstance(value, bool) or value in (None, ""):
        raise ValueError(f"缺少或无效：{label}")
    try:
        value = float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{label}必须为数值") from exc
    if not math.isfinite(value) or (
        not signed and (value < 0 if zero else value <= 0)
    ):
        raise ValueError(
            f"{label}必须为{'有限数' if signed else '非负有限数' if zero else '正有限数'}",
        )
    return value


def pvt_z(points, pressure):
    """Linear interpolation of supplied Z data, never extrapolation."""
    rows = sorted(
        (number(r.get("pressure"), "PVT 压力"), number(r.get("z"), "PVT Z"))
        for r in points
    )
    if len(rows) < 2 or len({r[0] for r in rows}) != len(rows):
        raise ValueError("PVT 插值至少需要两个不同压力点，重复点须先核对")
    if pressure < rows[0][0] or pressure > rows[-1][0]:
        raise ValueError("目标压力超出 PVT 表范围，禁止外推")
    for p, z in rows:
        if pressure == p:
            return z
    for (a, za), (b, zb) in zip(rows, rows[1:]):
        if a < pressure < b:
            return za + (zb - za) * (pressure - a) / (b - a)
    raise ValueError("PVT 插值未找到区间")


def weighted_pressure(rows):
    if not rows:
        raise ValueError("缺少同一评估单元、同一状态的测压资料")
    weights = [number(r.get("weight"), "测压权重", zero=True) for r in rows]
    if sum(weights) <= 0:
        raise ValueError("测压权重之和必须大于零")
    pressures = [number(r.get("pressure"), "测压值") for r in rows]
    return sum(p * w for p, w in zip(pressures, weights)) / sum(weights)


def fit_line(x, y):
    if len(x) < 3 or len(set(x)) < 3:
        raise ValueError("回归至少需要三个不同累采量点")
    xm, ym = mean(x), mean(y)
    sxx = sum((v - xm) ** 2 for v in x)
    slope = sum((a - xm) * (b - ym) for a, b in zip(x, y)) / sxx
    intercept = ym - slope * xm
    residuals = [b - (intercept + slope * a) for a, b in zip(x, y)]
    sse = sum(r * r for r in residuals)
    syy = sum((v - ym) ** 2 for v in y)
    return {
        "intercept": intercept,
        "slope": slope,
        "r_squared": 1 - sse / syy if syy else None,
        "rmse": math.sqrt(sse / len(x)),
        "residuals": residuals,
        "n": len(x),
    }


def _pz(q, pin, zin, p, z):
    a, b = pin / zin, p / z
    if a - b <= max(abs(a), abs(b), 1) * 1e-9:
        raise ValueError("起始 p/Z 必须大于末期 p/Z，且差值不能接近零")
    amplification = a / (a - b)
    if amplification > 100:
        raise ValueError("撤采比例倒数超过 100，压力差不足以支持稳定估算")
    return q * amplification, amplification


def compute_unit(unit, case):
    method = unit["method"]
    p = dict(unit.get("parameters") or {})
    warnings, steps = [], []
    output = {
        "values": {},
        "diagnostics": {},
        "warnings": warnings,
        "steps": steps,
        "basis": "computed",
        "metric_state": "start",
    }
    value = output["values"]
    if unit.get("condition_basis") == "reported":
        warnings.append("本单元沿用原报告的适用前提进行条件复算，尚未独立完成现场适用性核实，不构成已核定库存或能力结论")

    _prepare_parameters(method, unit, p, steps)
    if method == "pz":
        start_pz = _compute_pz(unit, p, output, value, warnings, steps)
    elif method == "pz_regression":
        start_pz = _compute_pz_regression(unit, output, value, warnings, steps)
    elif method == "water_mbe":
        _compute_water_mbe(p, output, value, warnings, steps)
    elif method == "volumetric":
        _compute_volumetric(case, p, output, value, warnings, steps)
    elif method in {"simulation", "rta"}:
        _compute_external(unit, case, output, value, warnings, steps)
    else:
        raise ValueError("未知算法")

    if method in {"pz", "pz_regression"}:
        _apply_pressure_window(p, value, warnings, steps, start_pz)

    _apply_withdrawal_schedule(unit, output, value, steps)

    _apply_well_deliverability(unit, case, output, value, warnings)
    for low, high in (
        ("deliverable_swing", "geological_swing"),
        ("geological_swing", "effective_inventory"),
        ("movable_cushion", "effective_inventory"),
        ("working_gas", "capacity"),
    ):
        if low in value and high in value and value[low] > value[high] + 1e-9:
            raise ValueError(f"{low} 大于 {high}，请复核成果定义、状态及计量边界")
    output["resolved_parameters"] = p
    return output


def shared_deliverability(units, results, limit):
    """Integrate simultaneous piecewise rates, respecting each unit's \
remaining gas."""
    cap = number(limit, "全库共用地面处理能力")
    horizons = [number(u.get("withdrawal_days"), "统一采气期") for u in units]
    if len(set(horizons)) != 1 or any(not u.get("schedule") for u in units):
        raise ValueError("共用地面设施需要所有单元同一采气期的预测曲线，不能直接相加成果值")
    target = horizons[0]
    boundaries = sorted(
        {0.0, target}
        | {
            min(float(row["day"]), target)
            for u in units
            for row in u["schedule"]
        },
    )
    remaining = [r["values"]["geological_swing"] for r in results]
    total = 0.0
    for start, end in zip(boundaries, boundaries[1:]):
        rates = [
            min(
                next(
                    float(r["rate"])
                    for r in u["schedule"]
                    if float(r["day"]) >= end
                ),
                float(u["surface_limit"]),
            )
            / 1e4
            for u in units
        ]
        time_left = end - start
        while time_left > 1e-10:
            active = [
                q if remaining[i] > 1e-10 else 0.0 for i, q in enumerate(rates)
            ]
            demand = sum(active)
            if demand <= 0:
                break
            factor = min(1.0, cap / 1e4 / demand)
            actual = [q * factor for q in active]
            duration = min(
                [time_left]
                + [remaining[i] / q for i, q in enumerate(actual) if q > 0],
            )
            total += sum(actual) * duration
            remaining = [
                max(0.0, r - q * duration) for r, q in zip(remaining, actual)
            ]
            time_left -= duration
    return total


def _compute_pz(unit, p, output, value, warnings, steps):
    """Apply compute pz without changing calculation order."""
    q, pin, zin, pe, ze = [
        number(p.get(k), k)
        for k in (
            "produced_gas",
            "injection_end_pressure",
            "injection_end_z",
            "evaluation_pressure",
            "evaluation_z",
        )
    ]
    effective, inverse = _pz(q, pin, zin, pe, ze)
    value["effective_inventory"] = effective
    output["diagnostics"] = {
        "start_pz": pin / zin,
        "end_pz": pe / ze,
        "inverse_withdrawal_fraction": inverse,
    }
    steps.append(
        (
            f"Grm = "
            f"{q:.8g}"
            f" × ("
            f"{pin:.8g}"
            f"/"
            f"{zin:.8g}"
            f") / ("
            f"{pin:.8g}"
            f"/"
            f"{zin:.8g}"
            f" − "
            f"{pe:.8g}"
            f"/"
            f"{ze:.8g}"
            f") = "
            f"{effective:.8g}"
            f" 亿m³"
        ),
    )
    if inverse > 20:
        warnings.append("撤采比例倒数超过 20，结果对压力和 Z 因子敏感")
    start_pz = pin / zin
    for zval in (zin, ze):
        if not 0.2 <= zval <= 2:
            warnings.append("Z 因子超出宽泛工程筛选范围 [0.2, 2]，需复核")
    # User-specified one-at-a-time perturbation, not an invented
    # confidence interval.
    error = unit.get("sensitivity_percent")
    if error not in (None, ""):
        error = number(error, "敏感性扰动百分数")
        if error > 10:
            raise ValueError("敏感性扰动应不大于 10%")
        sensitivity = []
        base = [q, pin, zin, pe, ze]
        for i, label in enumerate(("Qp", "Pin", "Zin", "P", "Z")):
            values = []
            for sign in (-1, 1):
                changed = base.copy()
                changed[i] *= 1 + sign * error / 100
                try:
                    values.append(_pz(*changed)[0])
                except ValueError:
                    values.append(None)
            sensitivity.append(
                {
                    "parameter": label,
                    "minus": values[0],
                    "plus": values[1],
                },
            )
        output["sensitivity"] = {
            "percent": error,
            "rows": sensitivity,
            "label": "单因素扰动，非概率置信区间",
        }
    return start_pz


def _compute_pz_regression(unit, output, value, warnings, steps):
    """Apply compute pz regression without changing calculation order."""
    rows = unit.get("series") or []
    if len(rows) > 10000:
        raise ValueError("单元回归数据不能超过 10000 点")
    if any(r.get("phase", "withdrawal") != "withdrawal" for r in rows):
        raise ValueError("p/Z 回归不能混合注气段和采气段")
    x = [number(r.get("cumulative_produced"), "累采量", zero=True) for r in rows]
    if x and (x[0] != 0 or any(b <= a for a, b in zip(x, x[1:]))):
        raise ValueError("累采量必须由本段起点零值开始并严格递增")
    y = [
        number(r.get("pressure"), "回归压力") / number(r.get("z"), "回归 Z")
        for r in rows
    ]
    fit = fit_line(x, y)
    if fit["slope"] >= 0 or fit["intercept"] <= 0:
        raise ValueError("p/Z 回归须具有负斜率和正截距")
    effective = -fit["intercept"] / fit["slope"]
    if effective <= x[-1] or effective / x[-1] > 100:
        raise ValueError("回归库存不满足采气段物质平衡或稳定性要求")
    if effective / x[-1] > 20:
        warnings.append("回归撤采比例过低，需扩大压差区间复核")
    value["effective_inventory"] = effective
    start_pz = fit["intercept"]
    output["diagnostics"] = fit
    output["plot"] = [
        {"x": a, "y": b, "fitted": fit["intercept"] + fit["slope"] * a}
        for a, b in zip(x, y)
    ]
    if fit["r_squared"] is not None and fit["r_squared"] < 0.95:
        warnings.append("R² 低于 0.95 工程提示值（非行业验收阈值），请检查压力代表性与分段")
    steps.append(
        (
            f"p/Z = "
            f"{fit['intercept']:.8g}"
            f" + ("
            f"{fit['slope']:.8g}"
            f") × 累采量；Grm = "
            f"{effective:.8g}"
            f" 亿m³"
        ),
    )
    return start_pz


def _compute_water_mbe(p, output, value, warnings, steps):
    """Apply compute water mbe without changing calculation order."""
    q = number(p.get("produced_gas"), "阶段采气量") * 1e8
    bg1, bg2 = number(p.get("initial_bg"), "Bg1"), number(
        p.get("final_bg"),
        "Bg2",
    )
    we = number(p.get("water_influx"), "阶段水侵量", zero=True)
    wp = number(p.get("water_produced"), "阶段产水量", zero=True)
    bw = number(p.get("water_fvf"), "水体积系数")
    if bg2 - bg1 <= max(bg1, bg2) * 1e-6:
        raise ValueError("末期 Bg 必须大于起始 Bg，差值不足不支持水侵修正")
    effective = (q * bg2 - (we - wp * bw)) / (bg2 - bg1) / 1e8
    if effective <= q / 1e8 or bg2 / (bg2 - bg1) > 100:
        raise ValueError("水侵修正结果与采出量不相容，或 Bg 差值过小")
    value["effective_inventory"] = effective
    output["diagnostics"] = {
        "net_water_reservoir_m3": we - wp * bw,
        "bg_depletion": bg2 - bg1,
    }
    steps.append(
        (
            f"G = ["
            f"{q:.8g}"
            f" × "
            f"{bg2:.8g}"
            f" − ("
            f"{we:.8g}"
            f" − "
            f"{wp:.8g}"
            f" × "
            f"{bw:.8g}"
            f")] / ("
            f"{bg2:.8g}"
            f" − "
            f"{bg1:.8g}"
            f") / 10⁸ = "
            f"{effective:.8g}"
            f" 亿m³"
        ),
    )
    warnings.append("气相定孔隙体积近似；本方法不求解水体模型或油气水组分传质")


def _compute_volumetric(case, p, output, value, warnings, steps):
    """Apply compute volumetric without changing calculation order."""
    vol, temp, pmax, zmax, pmin, zmin = [
        number(p.get(k), k)
        for k in (
            "gas_volume",
            "temperature",
            "maximum_pressure",
            "maximum_z",
            "minimum_pressure",
            "minimum_z",
        )
    ]
    std = case["standard"]
    factor = (
        vol
        * number(std.get("z"), "标准状态 Z")
        * number(std.get("temperature"), "标准温度")
        / temp
        / number(std.get("pressure"), "标准压力")
        / 1e8
    )
    if pmax <= pmin or pmax / zmax <= pmin / zmin:
        raise ValueError("上限压力及 p/Z 必须高于下限")
    value.update(
        capacity=factor * pmax / zmax,
        cushion=factor * pmin / zmin,
        working_gas=factor * (pmax / zmax - pmin / zmin),
    )
    output["metric_state"] = "pressure_window"
    steps.append(
        (
            f"标准状态系数 = "
            f"{factor:.8g}"
            f"；上限气量 "
            f"{value['capacity']:.8g}"
            f"，下限气量 "
            f"{value['cushion']:.8g}"
            f" 亿m³"
        ),
    )
    warnings.append("体积与压力窗口筛选值，尚未验证热力学瞬态、地应力及井筒地面注采约束")


def _compute_external(unit, case, output, value, warnings, steps):
    """Apply compute external without changing calculation order."""
    ext = unit.get("external") or {}
    for key in (
        "software",
        "model_version",
        "run_id",
        "input_reference",
        "source",
        "state",
    ):
        if not str(ext.get(key) or "").strip():
            raise ValueError(f"外部成果缺少 {key}")
    if (
        ext.get("cycle_id") != case["cycle_id"]
        or ext.get("state") != case["start_state"]
    ):
        raise ValueError("外部成果周期／状态与本次评估起始状态不一致")
    if ext.get("gas_volume_unit") != "1e8_sm3" or any(
        (ext.get("standard") or {}).get(k) != case["standard"].get(k)
        for k in ("pressure", "temperature", "z")
    ):
        raise ValueError("外部成果气量单位／标准状态不一致，须显式转换后导入")
    for key in (
        "effective_inventory",
        "geological_swing",
        "deliverable_swing",
        "movable_cushion",
        "capacity",
        "working_gas",
    ):
        if ext.get(key) not in (None, ""):
            value[key] = number(ext[key], key, zero=True)
    if not value:
        raise ValueError("外部成果没有可用指标")
    fit = ext.get("history_match") or []
    if len(fit) < 3:
        raise ValueError("外部成果至少需三组同指标、同单位的历史拟合观测／模拟值")
    if not ext.get("match_metric") or not ext.get("match_unit"):
        raise ValueError("历史拟合须注明指标和单位")
    observed = [number(r.get("observed"), "观测值", zero=True) for r in fit]
    simulated = [number(r.get("simulated"), "模拟值", zero=True) for r in fit]
    if not any(observed):
        raise ValueError("历史拟合观测值不能全部为零")
    residual = [b - a for a, b in zip(observed, simulated)]
    output["diagnostics"] = {
        "rmse": math.sqrt(mean([r * r for r in residual])),
        "mae": mean([abs(r) for r in residual]),
        "n": len(fit),
        "metric": ext["match_metric"],
        "unit": ext["match_unit"],
    }
    output["basis"] = "external_result"
    warnings.append("采用外部解释／模拟成果，本工作台只完成一致性、汇总及误差复核，未重新运行该模拟器")
    steps.append(
        (
            f"来源 "
            f"{ext['software']}"
            f"，模型 "
            f"{ext['model_version']}"
            f"，运行 "
            f"{ext['run_id']}"
        ),
    )


def _apply_pressure_window(p, value, warnings, steps, start_pz):
    """Apply apply pressure window without changing calculation order."""
    for key in ("minimum_pressure", "minimum_z"):
        if p.get(key) not in (None, ""):
            number(p[key], key)
    if p.get("minimum_pressure") not in (None, "") and p.get(
        "minimum_z",
    ) not in (None, ""):
        lower = number(p["minimum_pressure"], "下限压力") / number(
            p["minimum_z"],
            "下限 Z",
        )
        if lower >= start_pz:
            raise ValueError("下限 p/Z 必须小于采气段起始 p/Z")
        value["movable_cushion"] = (
            value["effective_inventory"] * lower / start_pz
        )
        value["geological_swing"] = (
            value["effective_inventory"] - value["movable_cushion"]
        )
        if p.get("maximum_pressure") not in (None, "") and p.get(
            "maximum_z",
        ) not in (None, ""):
            upper = number(p["maximum_pressure"], "上限压力") / number(
                p["maximum_z"],
                "上限 Z",
            )
            if upper < start_pz or upper <= lower:
                raise ValueError("上限 p/Z 不得低于当前起始状态，且必须高于下限")
            value["effective_capacity"] = (
                value["effective_inventory"] * upper / start_pz
            )
            value["working_gas"] = (
                value["effective_capacity"] - value["movable_cushion"]
            )
        steps.append(
            (
                f"可动垫气 = Grm × (Pmin/Zmin)/(Pin/Zin) = "
                f"{value['movable_cushion']:.8g}"
                f" 亿m³"
            ),
        )
    else:
        warnings.append("缺少下限压力或对应 Z 因子，未计算可动垫气与地层调峰气量")


def _apply_withdrawal_schedule(unit, output, value, steps):
    """Apply apply withdrawal schedule without changing calculation order."""
    schedule = unit.get("schedule") or []
    if schedule:
        if "geological_swing" not in value:
            raise ValueError("采气预测曲线需配合地层调峰气量")
        target = number(unit.get("withdrawal_days"), "方案采气期天数")
        elapsed = 0.0
        integral = 0.0
        for row in schedule:
            day = number(row.get("day"), "预测区间结束日")
            if day <= elapsed:
                raise ValueError("预测区间结束日必须严格递增")
            rate = number(row.get("rate"), "区间平均日采气量", zero=True)
            cap = number(unit.get("surface_limit"), "地面处理能力")
            integral += (
                min(rate, cap)
                * max(0, min(day, target) - min(elapsed, target))
                / 1e4
            )
            elapsed = day
        if elapsed < target or not unit.get("schedule_source"):
            raise ValueError("预测曲线需覆盖完整采气期并注明预测依据")
        value["deliverable_swing"] = min(value["geological_swing"], integral)
        output["diagnostics"]["schedule_integral"] = integral
        steps.append(
            f"逐段积分日采气量并施加地面限额，{target:g} 天可采 {integral:.8g} 亿m³，与地层调峰气量取小值",
        )


def _apply_well_deliverability(unit, case, output, value, warnings):
    """Apply apply well deliverability without changing calculation order."""
    wells = unit.get("wells") or []
    if wells:
        if case.get("pressure_basis") != "absolute":
            raise ValueError("二项式产能使用绝对压力；先独立核实转换，不能用视地层压力直接代入")
        rates = []
        for row in wells:
            a, b = number(row.get("a"), "产能系数 A", zero=True), number(
                row.get("b"),
                "产能系数 B",
                zero=True,
            )
            pr, pwf = number(row.get("reservoir_pressure"), "地层压力"), number(
                row.get("bottomhole_pressure"),
                "井底流压",
            )
            if pr <= pwf or a + b == 0:
                raise ValueError("二项式产能计算需地层压力大于井底流压，且 A、B 不同时为零")
            delta = pr * pr - pwf * pwf
            rate = (
                2 * delta / (a + math.sqrt(a * a + 4 * b * delta))
                if b
                else delta / a
            )
            rates.append({"name": row.get("name", "井"), "rate": rate})
        surface = number(unit.get("surface_limit"), "地面处理能力")
        value["peak_rate"] = min(sum(r["rate"] for r in rates), surface)
        output["well_results"] = rates
        warnings.append("冲峰为给定井底流压的二项式产能筛选；系数气量单位须为万m³/d。需用井筒／管网核实外输边界")


def _prepare_parameters(method, unit, p, steps):
    """Apply prepare parameters without changing calculation order."""
    if method == "pz":
        for key, target in (
            ("start_pressures", "injection_end_pressure"),
            ("end_pressures", "evaluation_pressure"),
        ):
            if unit.get(key):
                if not unit.get("pressure_source") or not unit.get(
                    "pressure_weight_basis",
                ):
                    raise ValueError("加权测压需要记录同一状态、权重依据及测压资料来源")
                p[target] = weighted_pressure(unit[key])
                steps.append(
                    (
                        f"{target}"
                        f" = Σ(压力×权重)/Σ权重 = "
                        f"{p[target]:.8g}"
                        f" MPa；权重依据："
                        f"{unit['pressure_weight_basis']}"
                        f"；"
                        f"{unit['pressure_source']}"
                    ),
                )

    # Z is interpolated only on an explicitly requested basis from this
    # unit's PVT table.
    for prefix in ("injection_end", "evaluation", "minimum", "maximum"):
        pressure_key, z_key = prefix + "_pressure", prefix + "_z"
        if (
            p.get(z_key) in (None, "")
            and p.get(pressure_key) not in (None, "")
            and unit.get("pvt")
        ):
            p[z_key] = pvt_z(
                unit["pvt"],
                number(p[pressure_key], pressure_key),
            )
            steps.append(f"{z_key} = {p[z_key]:.8g}，由本单元 PVT 表线性插值")
