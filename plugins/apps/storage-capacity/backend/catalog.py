# -*- coding: utf-8 -*-
"""Versioned engineering vocabulary, applicability rules and input contracts.

Training references are locators, not bundled private training documents.
Clause numbers are omitted unless the licensed full text was checked.
"""

VERSION = "3.0.0"
STANDARD_URL = (
    "https://std.samr.gov.cn/hb/search/stdHBDetai"
    "led?id=016FDF2BE00B8559E06397BE0A0AD220"
)
STANDARDS = [
    {
        "id": "SY/T 7686-2023",
        "name": "储气库库存评价技术规范",
        "basis": "标准名称及现行状态已核实；术语和方法范围对照培训宣贯及 UGSci 库存评价智能体，未逐条核验标准全文",
        "url": STANDARD_URL,
    },
    {
        "id": "SY/T 7642-2021",
        "name": "储气库术语",
        "basis": "培训材料引用，项目执行前核对适用版本",
    },
    {
        "id": "GB/T 17747",
        "name": "天然气压缩因子的计算",
        "basis": "SY/T 7686 培训宣贯所列引用文件；具体分册、适用条件和版本由 PVT 依据确定",
    },
    {
        "id": "SY/T 7759-2024",
        "name": "储气库天然气损耗计算与评价方法",
        "basis": "标准目录参考；损耗需独立证据，不能以库存差额直接认定",
    },
]
TERMS = [
    (
        "book_inventory",
        "库存量（账面）",
        "在指定状态下按建库基础气量与累计注采计量平衡确定的标准气体积。必须说明标准状态、计量边界及当量气处理。",
    ),
    (
        "effective_inventory",
        "有效库存量",
        "现有注采井网条件下能够动用的库存量。按评估单元计算；两点 p/Z 结果对应该采气段起始状态。",
    ),
    (
        "inactive_inventory",
        "未动用库存量",
        "同一状态、同一范围的库存量与有效库存量之差。负差值提示口径或数据问题，不能截零或作为负损耗。",
    ),
    (
        "movable_cushion",
        "可动垫气量",
        "下限运行压力所对应的有效库存量。不同于全部垫气量。",
    ),
    (
        "geological_swing",
        "地层调峰气量",
        "从指定起始压力降至下限压力可采出的气量，尚未施加井筒、地面、运行时间等约束。",
    ),
    (
        "deliverable_swing",
        "综合调峰能力",
        "同时满足地层、井筒、地面与采气期约束的可采气量。缺少产能预测时不能以地层调峰气量直接代替。",
    ),
    (
        "capacity",
        "库容量",
        "规定上限运行压力及工况下的储气量；区别于某一实际状态的库存量。",
    ),
    (
        "working_gas",
        "工作气量",
        "规定运行压力窗口内可循环注采的气量；需明确设计值、压力窗口计算值或综合能力。",
    ),
    (
        "peak_rate",
        "冲峰能力",
        "规定压力和外输条件下的最大日采气能力，单位为气量/日；不能乘以采气期替代动态调峰预测。",
    ),
    (
        "loss",
        "天然气损耗量",
        "地质、井筒、地面损耗的独立核实量。库存曲线异常只构成诊断线索。",
    ),
]
TYPES = [
    ("depleted_gas", "枯竭气藏"),
    ("water_drive", "水驱气藏"),
    ("oil_gas", "油藏／气顶油环"),
    ("aquifer", "含水层"),
    ("salt_cavern", "盐穴"),
]

# key, label, unit. No engineering defaults are silently supplied.
FIELDS = {
    "produced_gas": ("阶段采气量 Qp", "亿m³"),
    "injection_end_pressure": ("起始压力 Pin", "MPa"),
    "injection_end_z": ("起始偏差因子 Zin", "无量纲"),
    "evaluation_pressure": ("末期压力 P", "MPa"),
    "evaluation_z": ("末期偏差因子 Z", "无量纲"),
    "minimum_pressure": ("下限压力 Pmin", "MPa"),
    "minimum_z": ("下限偏差因子 Zmin", "无量纲"),
    "maximum_pressure": ("上限压力 Pmax", "MPa"),
    "maximum_z": ("上限偏差因子 Zmax", "无量纲"),
    "initial_bg": ("起始体积系数 Bg1", "m³/标准m³"),
    "final_bg": ("末期体积系数 Bg2", "m³/标准m³"),
    "water_influx": ("阶段水侵体积 We", "地层m³"),
    "water_produced": ("阶段产水量 Wp", "地面m³"),
    "water_fvf": ("水体积系数 Bw", "m³/m³"),
    "gas_volume": ("有效含气体积／净腔体积", "地层m³"),
    "temperature": ("代表温度", "K"),
    "initial_inventory": ("期初账面库存", "亿m³"),
    "injected": ("区间累计注气量", "亿m³"),
    "withdrawn": ("区间累计采气量", "亿m³"),
    "metered_loss": ("已核实区间损耗", "亿m³"),
    "equivalent_gas": ("区间液体当量气采出量", "亿m³"),
}

METHODS = [
    {
        "id": "pz",
        "name": "两点 p/Z 物质平衡",
        "mode": "calculation",
        "types": ["depleted_gas", "water_drive", "oil_gas"],
        "fields": [
            "produced_gas",
            "injection_end_pressure",
            "injection_end_z",
            "evaluation_pressure",
            "evaluation_z",
            "minimum_pressure",
            "minimum_z",
            "maximum_pressure",
            "maximum_z",
        ],
        "required": [
            "produced_gas",
            "injection_end_pressure",
            "injection_end_z",
            "evaluation_pressure",
            "evaluation_z",
        ],
        "formula": "Grm = Qp × (Pin/Zin) / (Pin/Zin − P/Z)",
        "condition": "单采气段、近似定容、气相为主；压力代表性和流体影响已核实。逐单元计算，不能用全库平均压力替代。",
        "reference": "李春培训第 137–142 页；相国寺案例第 31、44–45 页；UGSci 库存计算口径",
    },
    {
        "id": "pz_regression",
        "name": "多点 p/Z 回归",
        "mode": "calculation",
        "types": ["depleted_gas", "water_drive", "oil_gas"],
        "fields": [
            "minimum_pressure",
            "minimum_z",
            "maximum_pressure",
            "maximum_z",
        ],
        "required": [],
        "formula": "p/Z = a + b × 累采气量；Grm = −a/b",
        "condition": "同一连续采气段至少三个压力点，累采量从起点计，不能混入注气段。显示残差与 R²，不用拟合优度替代适用性判断。",
        "reference": "李春培训物质平衡与库存特征曲线；最小二乘回归为工程实现",
    },
    {
        "id": "water_mbe",
        "name": "已知水侵量的气相物质平衡",
        "mode": "calculation",
        "types": ["depleted_gas", "water_drive", "aquifer"],
        "fields": [
            "produced_gas",
            "initial_bg",
            "final_bg",
            "water_influx",
            "water_produced",
            "water_fvf",
        ],
        "required": [
            "produced_gas",
            "initial_bg",
            "final_bg",
            "water_influx",
            "water_produced",
            "water_fvf",
        ],
        "formula": "G = [Qp × Bg2 − (We − Wp × Bw)] / (Bg2 − Bg1)",
        "condition": (
            "水侵量为本采气段独立核实的地层体积。忽略岩石与束缚水压缩、溶解气和凝析效应。仅为气相定孔" "隙体积模型，不能替代复杂水驱数模。"
        ),
        "reference": "气相体积守恒推导；苏4案例第 45、93 页要求单独评价水侵与产液",
    },
    {
        "id": "volumetric",
        "name": "体积与压力窗口计算",
        "mode": "calculation",
        "types": [
            "depleted_gas",
            "water_drive",
            "oil_gas",
            "aquifer",
            "salt_cavern",
        ],
        "fields": [
            "gas_volume",
            "temperature",
            "maximum_pressure",
            "maximum_z",
            "minimum_pressure",
            "minimum_z",
        ],
        "required": [
            "gas_volume",
            "temperature",
            "maximum_pressure",
            "maximum_z",
            "minimum_pressure",
            "minimum_z",
        ],
        "formula": "Gstd = Vgas × P × Zs × Ts / (Z × T × Ps)",
        "condition": "使用绝压、绝温、明确标准状态及有效含气体积。盐穴须扣除卤水及不可用体积；不计算热瞬态、蠕变、完整性或注采能力。",
        "reference": "UGSci 压力边界库容筛选；结果标记为压力窗口筛选值",
    },
    {
        "id": "simulation",
        "name": "数值模拟成果复核",
        "mode": "external",
        "types": [t[0] for t in TYPES],
        "fields": [],
        "required": [],
        "formula": "采用已完成模拟的指标；独立计算历史拟合误差及对比偏差",
        "condition": (
            "导入真实模型版本、运行编号、输入摘要、同周期同状态成果和拟合记录。复杂水侵、油气水相态、" "干扰与滞后应优先采用经校核的模型。"
        ),
        "reference": "苏云河培训第 60–63 页；双6案例第 73–75、93–95 页",
    },
    {
        "id": "rta",
        "name": "RTA 井控成果复核",
        "mode": "external",
        "types": ["depleted_gas", "water_drive", "oil_gas"],
        "fields": [],
        "required": [],
        "formula": "按不重叠井控范围汇总已完成解释成果；独立复核拟合误差",
        "condition": "具备产量、压力历史与真实解释成果；弱井间干扰，井控范围不重叠。强干扰时转向耦合数模，不简单叠加单井库存。",
        "reference": "苏4案例第 79、81、91 页；板中北案例第 36 页；李春培训第 140、142 页",
    },
]


def catalog():
    return {
        "version": VERSION,
        "standards": STANDARDS,
        "terms": [{"key": k, "name": n, "definition": d} for k, n, d in TERMS],
        "storage_types": [{"value": k, "label": v} for k, v in TYPES],
        "fields": {
            k: {"label": v[0], "unit": v[1]} for k, v in FIELDS.items()
        },
        "methods": METHODS,
    }


def new_case():
    return {
        "schema_version": 2,
        "case_name": "新建库容评估",
        "cycle_id": "",
        "purpose": "cycle",
        "storage_type": "depleted_gas",
        "rock_type": "sandstone",
        "start_state": "",
        "end_state": "",
        "pressure_basis": "",
        "standard": {
            "mode": "verified",
            "temperature": None,
            "pressure": None,
            "z": None,
            "source": "",
        },
        "design": {},
        "ledger": {},
        "book_inventory": None,
        "book_state": "start",
        "units": [],
        "documents": [],
        "sources": {},
        "history": [],
        "comparison_tolerance_percent": 5,
        "review_notes": "",
    }


def new_unit(name="评估单元 1"):
    return {
        "name": name,
        "method": "pz",
        "source": "",
        "parameters": {},
        "conditions": {
            "water_drive": "unknown",
            "fluid": "unknown",
            "pressure_representative": False,
            "closed_during_segment": False,
            "interference": "unknown",
        },
        "series": [],
        "pvt": [],
        "wells": [],
        "schedule": [],
        "external": {},
    }


def normalize_case(value):
    """Fill optional containers without inventing engineering inputs."""
    if not isinstance(value, dict) or value.get("schema_version") != 2:
        raise ValueError("请使用第 2 版评估数据格式")
    result = {**new_case(), **value}
    for key in ("standard", "design", "ledger", "sources"):
        if not isinstance(result[key], dict):
            raise ValueError(f"{key} 应为字段对象")
        result[key] = {**new_case()[key], **result[key]}
    for key in ("units", "documents", "history", "benchmarks"):
        rows = result.get(key, [])
        if (
            not isinstance(rows, list)
            or len(rows) > 10000
            or any(not isinstance(r, dict) for r in rows)
        ):
            raise ValueError(f"{key} 应为记录列表")
        result[key] = rows
    normalized = []
    for raw in result["units"]:
        unit = {**new_unit(), **raw}
        for key in ("parameters", "conditions", "external", "evidence"):
            if not isinstance(unit.get(key, {}), dict):
                raise ValueError(f"单元 {key} 应为字段对象")
            unit[key] = {**new_unit().get(key, {}), **unit.get(key, {})}
        for key in (
            "series",
            "pvt",
            "wells",
            "schedule",
            "start_pressures",
            "end_pressures",
        ):
            rows = unit.get(key, [])
            if (
                not isinstance(rows, list)
                or len(rows) > 10000
                or any(not isinstance(r, dict) for r in rows)
            ):
                raise ValueError(f"单元 {key} 应为记录列表")
            unit[key] = rows
        rows = unit["external"].get("history_match", [])
        if (
            not isinstance(rows, list)
            or len(rows) > 10000
            or any(not isinstance(r, dict) for r in rows)
        ):
            raise ValueError("历史拟合应为记录列表")
        unit["external"]["history_match"] = rows
        normalized.append(unit)
    result["units"] = normalized
    return result
