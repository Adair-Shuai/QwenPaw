# -*- coding: utf-8 -*-
"""Static catalog of domain engine definitions.

This is the single source of truth for "what domain capabilities exist".
Runtime state (MCP enabled/disabled, tool on/off) is NOT stored here —
it is queried from QwenPaw's Driver and Tool systems.
"""

from __future__ import annotations

from .models import (
    DomainEngineDefinition,
    DomainOperation,
    ProviderRef,
)

# ─── Well Log Processing ──────────────────────────────────────────────────────

_WELL_LOG_ENGINE = DomainEngineDefinition(
    schema_version=1,
    id="well-log-processing",
    name="测井数据处理",
    description="读取、质量检查和导出 LAS 格式测井数据",
    domain="geology_well_logging",
    source="builtin",
    provider=ProviderRef(kind="builtin", id="ugsci-welllog-lasio"),
    operations=(
        DomainOperation(
            id="welllog.las.read",
            name="读取 LAS 文件",
            description="读取 LAS 2.0 文件并返回井信息、曲线元数据和采样摘要",
            tool_names=("ugsci_welllog_read",),
        ),
        DomainOperation(
            id="welllog.quality.validate",
            name="测井数据质量检查",
            description="检查深度单调性、重复深度、NULL 值、缺失率、非有限值和单位缺失",
            tool_names=("ugsci_welllog_validate",),
        ),
        DomainOperation(
            id="welllog.las.export",
            name="导出 LAS 文件",
            description="将 LAS 文件规范化导出为新文件",
            tool_names=("ugsci_welllog_export",),
        ),
    ),
    dependencies=("lasio",),
    tags=("well-log", "las", "petrophysics"),
)

# ─── Decline Analysis ─────────────────────────────────────────────────────────

_DECLINE_ENGINE = DomainEngineDefinition(
    schema_version=1,
    id="decline-analysis",
    name="递减分析",
    description="Arps 递减曲线拟合、产量预测和 EUR 估算",
    domain="production_engineering",
    source="builtin",
    provider=ProviderRef(kind="builtin", id="ugsci-decline-scipy"),
    operations=(
        DomainOperation(
            id="production.decline.fit",
            name="递减曲线拟合",
            description="拟合 exponential、harmonic、hyperbolic 三类 Arps 模型",
            tool_names=("ugsci_decline_fit",),
        ),
        DomainOperation(
            id="production.decline.forecast",
            name="产量预测",
            description="基于拟合参数预测未来产量",
            tool_names=("ugsci_decline_forecast",),
        ),
        DomainOperation(
            id="production.decline.eur",
            name="EUR 估算",
            description="基于时间边界或经济极限计算预计最终采收率",
            tool_names=("ugsci_decline_eur",),
        ),
    ),
    dependencies=("numpy", "scipy"),
    tags=("decline", "arps", "production", "forecast"),
)

# ─── NeqSim PVT & Fluid Thermodynamics ────────────────────────────────────────

_NEQSIM_ENGINE = DomainEngineDefinition(
    schema_version=1,
    id="neqsim",
    name="PVT 与流体热力学",
    description="基于 NeqSim 的 PVT 计算和流体相态分析",
    domain="fluid_thermodynamics",
    source="builtin",
    provider=ProviderRef(kind="driver", id="ugsci-neqsim"),
    operations=(
        DomainOperation(
            id="fluid.flash",
            name="闪蒸计算",
            description="给定组成和条件，计算相态和组成",
            tool_names=("ugsci_neqsim_flash",),
            driver_tool_names=("runFlash",),
        ),
        DomainOperation(
            id="fluid.pvt",
            name="PVT 性质",
            description="计算密度、粘度、压缩系数等流体性质",
            tool_names=("ugsci_neqsim_pvt",),
            driver_tool_names=("runPVT",),
        ),
        DomainOperation(
            id="fluid.phase_envelope",
            name="相包络线",
            description="生成相包络线图",
            tool_names=("ugsci_neqsim_phase_envelope",),
            driver_tool_names=("getPhaseEnvelope",),
        ),
        DomainOperation(
            id="process.simulation",
            name="工艺模拟",
            description="简单工艺流程模拟",
            tool_names=("ugsci_neqsim_process_simulate",),
            driver_tool_names=("runProcess",),
        ),
        DomainOperation(
            id="pipeline.flow",
            name="管道流动",
            description="管道流动计算",
            tool_names=("ugsci_neqsim_pipeline_flow",),
            driver_tool_names=("runPipeline",),
        ),
    ),
    dependencies=("java-runtime", "neqsim-mcp-server"),
    tags=("pvt", "thermodynamics", "neqsim", "fluid"),
    execution_class="external",
)


def _library_engine(
    *,
    engine_id: str,
    name: str,
    description: str,
    domain: str,
    dependency: str,
    operation_id: str,
    operation_name: str,
    tool_name: str,
    provider_id: str,
    tags: tuple[str, ...],
    execution_class: str = "deterministic",
) -> DomainEngineDefinition:
    """Build a UGSci capability backed by a replaceable scientific library."""
    return DomainEngineDefinition(
        schema_version=1,
        id=engine_id,
        name=name,
        description=description,
        domain=domain,
        source="builtin",
        provider=ProviderRef(kind="builtin", id=provider_id),
        operations=(
            DomainOperation(
                id=operation_id,
                name=operation_name,
                description=description,
                tool_names=(tool_name,),
            ),
        ),
        dependencies=(dependency,),
        tags=tags,
        execution_class=execution_class,
    )


_SCIENTIFIC_LIBRARY_ENGINES = (
    _library_engine(
        engine_id="sympy",
        name="符号多项式计算",
        description="符号代数、方程求解、微积分与解析推导",
        domain="scientific_computing",
        dependency="sympy",
        operation_id="math.symbolic",
        operation_name="符号计算",
        tool_name="ugsci_symbolic_polynomial_roots",
        provider_id="ugsci-symbolic-sympy",
        tags=("symbolic", "algebra", "calculus"),
    ),
    _library_engine(
        engine_id="pymc",
        name="贝叶斯参数估计",
        description="贝叶斯推断、概率模型与不确定性量化",
        domain="scientific_computing",
        dependency="pymc",
        operation_id="statistics.bayesian",
        operation_name="贝叶斯推断",
        tool_name="ugsci_bayesian_normal_estimate",
        provider_id="ugsci-bayesian-pymc",
        tags=("bayesian", "probability", "uncertainty"),
        execution_class="stochastic",
    ),
    _library_engine(
        engine_id="pymoo",
        name="多目标优化",
        description="多目标优化、约束优化与 Pareto 前沿分析",
        domain="scientific_computing",
        dependency="pymoo",
        operation_id="optimization.multi_objective",
        operation_name="多目标优化",
        tool_name="ugsci_multiobjective_quadratic",
        provider_id="ugsci-optimization-pymoo",
        tags=("optimization", "pareto", "pymoo"),
        execution_class="stochastic",
    ),
    _library_engine(
        engine_id="simpy",
        name="离散事件队列仿真",
        description="离散事件系统、资源排队与流程仿真",
        domain="scientific_computing",
        dependency="simpy",
        operation_id="simulation.discrete_event",
        operation_name="离散事件仿真",
        tool_name="ugsci_queue_simulate",
        provider_id="ugsci-queue-simpy",
        tags=("simulation", "process", "queue"),
    ),
    _library_engine(
        engine_id="networkx",
        name="图与网络分析",
        description="复杂网络、图算法、路径与连通性分析",
        domain="scientific_computing",
        dependency="networkx",
        operation_id="graph.analysis",
        operation_name="图与网络分析",
        tool_name="ugsci_graph_analyze",
        provider_id="ugsci-graph-networkx",
        tags=("graph", "network", "topology"),
    ),
    _library_engine(
        engine_id="geopandas",
        name="地理空间点集分析",
        description="地理空间数据处理、空间连接与投影转换",
        domain="data_modeling",
        dependency="geopandas",
        operation_id="geospatial.analysis",
        operation_name="地理空间分析",
        tool_name="ugsci_geospatial_points_analyze",
        provider_id="ugsci-geospatial-geopandas",
        tags=("gis", "geospatial", "mapping"),
    ),
    _library_engine(
        engine_id="scikit-learn",
        name="机器学习回归",
        description="分类、回归、聚类、预处理与模型评估",
        domain="data_modeling",
        dependency="scikit-learn",
        operation_id="machine_learning.modeling",
        operation_name="机器学习建模",
        tool_name="ugsci_ml_regression",
        provider_id="ugsci-ml-scikit-learn",
        tags=("machine-learning", "regression", "classification"),
    ),
    _library_engine(
        engine_id="statsmodels",
        name="统计回归分析",
        description="统计检验、回归分析与时间序列建模",
        domain="data_modeling",
        dependency="statsmodels",
        operation_id="statistics.modeling",
        operation_name="统计建模",
        tool_name="ugsci_statistical_regression",
        provider_id="ugsci-statistics-statsmodels",
        tags=("statistics", "regression", "time-series"),
    ),
)

# ─── Reservoir Visualization (UGSci built-in capability) ─────────────────────

_PETROLEUM_CORE_ENGINE = DomainEngineDefinition(
    schema_version=1,
    id="petroleum-deterministic-core",
    name="油气确定性计算内核",
    description="可审计的单位、储量、物质平衡、黑油 PVT、IPR、节点分析和守恒检查",
    domain="reservoir_engineering",
    source="builtin",
    provider=ProviderRef(kind="builtin", id="ugsci-petroleum-core"),
    operations=(
        DomainOperation(id="units.convert", name="工程单位换算", description="显式维度约束的工程单位换算", tool_names=("ugsci_convert_units",)),
        DomainOperation(id="reservoir.volumetrics.oil_in_place", name="容积法储量", description="计算原始地质储量 OOIP", tool_names=("ugsci_volumetric_oil_in_place",)),
        DomainOperation(id="reservoir.material_balance.oil", name="油藏物质平衡", description="基于显式 PVT 和水侵项估算 OOIP", tool_names=("ugsci_oil_material_balance",)),
        DomainOperation(id="reservoir.material_balance.gas_pz", name="气藏 p/z 物质平衡", description="根据 p/z 衰竭估算 OGIP", tool_names=("ugsci_gas_material_balance",)),
        DomainOperation(id="fluid.pvt.standing_black_oil", name="本地黑油 PVT", description="Standing 泡点、溶解气油比和油体积系数", tool_names=("ugsci_black_oil_pvt",)),
        DomainOperation(id="production.ipr.vogel", name="Vogel IPR", description="构建油井流入动态关系", tool_names=("ugsci_vogel_ipr",)),
        DomainOperation(id="production.nodal_analysis", name="节点分析", description="求解 IPR/VLP 工作点", tool_names=("ugsci_nodal_analysis",)),
        DomainOperation(id="validation.conservation_check", name="质量守恒检查", description="检查库存与流量闭合误差", tool_names=("ugsci_conservation_check",)),
    ),
    dependencies=(),
    tags=("material-balance", "volumetrics", "pvt", "ipr", "nodal", "units", "audit"),
    execution_class="deterministic",
    engine_version="1.1.0",
)


_STORAGE_INVENTORY_ENGINE = DomainEngineDefinition(
    schema_version=1,
    id="storage-inventory-evaluation",
    name="储气库库存评价",
    description="账面库存、分层有效控制库存及评价指标的可审计确定性计算",
    domain="underground_gas_storage",
    source="builtin",
    provider=ProviderRef(kind="builtin", id="ugsci-storage-inventory-core"),
    operations=(
        DomainOperation(
            id="storage.inventory.accounting",
            name="账面库存量",
            description="按统一标准状态和计量边界执行注采计量平衡",
            tool_names=("ugsci_storage_inventory_accounting",),
        ),
        DomainOperation(
            id="storage.inventory.effective_controlled",
            name="有效控制库存量",
            description="按层应用p/Z采气段公式并汇总有效控制库存规模",
            tool_names=("ugsci_storage_effective_inventory",),
        ),
        DomainOperation(
            id="storage.inventory.evaluate",
            name="库存综合评价",
            description="分离账面库存、有效库存、工作气量和冲峰能力并计算符合率",
            tool_names=("ugsci_storage_inventory_evaluate",),
        ),
    ),
    dependencies=(),
    tags=("gas-storage", "inventory", "p-over-z", "deterministic", "audit"),
    execution_class="deterministic",
    engine_version="1.2.0",
)


_VISUALIZATION_ENGINE = DomainEngineDefinition(
    schema_version=1,
    id="reservoir-visualization",
    name="储层三维可视化",
    description="EGRID/ROFF 网格三维渲染、属性着色、cell 拾取和性能基准",
    domain="reservoir_engineering",
    source="builtin",
    provider=ProviderRef(kind="builtin", id="ugsci-visualization"),
    operations=(
        DomainOperation(
            id="visualization.open",
            name="打开可视化页面",
            description="加载三维查看器并显示指定数据集",
            tool_names=("open_oilgas_visualization",),
        ),
        DomainOperation(
            id="visualization.property",
            name="切换属性",
            description="切换网格属性着色（孔隙度/渗透率/岩相）",
            tool_names=("set_visualization_property",),
        ),
        DomainOperation(
            id="visualization.benchmark",
            name="性能基准",
            description="运行 FPS、帧时间和内存泄漏测试",
            tool_names=("run_visualization_benchmark",),
        ),
    ),
    dependencies=("three.js",),
    tags=("3d", "grid", "eclipse", "roff", "visualization"),
    execution_class="visualization",
)


# ─── Catalog registry ─────────────────────────────────────────────────────────

_ENGINES: tuple[DomainEngineDefinition, ...] = (
    _WELL_LOG_ENGINE,
    _DECLINE_ENGINE,
    _PETROLEUM_CORE_ENGINE,
    _STORAGE_INVENTORY_ENGINE,
    _NEQSIM_ENGINE,
    _VISUALIZATION_ENGINE,
    *_SCIENTIFIC_LIBRARY_ENGINES,
)

_ENGINES_BY_ID: dict[str, DomainEngineDefinition] = {
    e.id: e for e in _ENGINES
}


def list_engines() -> list[DomainEngineDefinition]:
    """Return all domain engine definitions."""
    return list(_ENGINES)


def get_engine(engine_id: str) -> DomainEngineDefinition | None:
    """Return a single engine by ID, or None."""
    return _ENGINES_BY_ID.get(engine_id)


def get_engine_ids() -> set[str]:
    """Return the set of all engine IDs."""
    return set(_ENGINES_BY_ID.keys())
