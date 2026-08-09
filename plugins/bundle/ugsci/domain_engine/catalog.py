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
    source="mcp",
    provider=ProviderRef(kind="driver", id="neqsim"),
    operations=(
        DomainOperation(
            id="fluid.flash",
            name="闪蒸计算",
            description="给定组成和条件，计算相态和组成",
            driver_tool_names=(),  # Populated from MCP tool discovery
        ),
        DomainOperation(
            id="fluid.pvt",
            name="PVT 性质",
            description="计算密度、粘度、压缩系数等流体性质",
            driver_tool_names=(),
        ),
        DomainOperation(
            id="fluid.phase_envelope",
            name="相包络线",
            description="生成相包络线图",
            driver_tool_names=(),
        ),
        DomainOperation(
            id="process.simulation",
            name="工艺模拟",
            description="简单工艺流程模拟",
            driver_tool_names=(),
        ),
        DomainOperation(
            id="pipeline.flow",
            name="管道流动",
            description="管道流动计算",
            driver_tool_names=(),
        ),
    ),
    dependencies=("java-runtime", "neqsim-mcp-server"),
    tags=("pvt", "thermodynamics", "neqsim", "fluid"),
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

# ─── Reservoir Visualization (oilgas-visualization plugin bridge) ─────────────

_VISUALIZATION_ENGINE = DomainEngineDefinition(
    schema_version=1,
    id="reservoir-visualization",
    name="储层三维可视化",
    description="EGRID/ROFF 网格三维渲染、属性着色、cell 拾取和性能基准",
    domain="reservoir_engineering",
    source="plugin",
    provider=ProviderRef(kind="plugin", id="oilgas-visualization"),
    operations=(
        DomainOperation(
            id="visualization.open",
            name="打开可视化页面",
            description="加载三维查看器并显示指定数据集",
            tool_names=(),  # 工具由独立插件注册
        ),
        DomainOperation(
            id="visualization.property",
            name="切换属性",
            description="切换网格属性着色（孔隙度/渗透率/岩相）",
            tool_names=(),
        ),
        DomainOperation(
            id="visualization.benchmark",
            name="性能基准",
            description="运行 FPS、帧时间和内存泄漏测试",
            tool_names=(),
        ),
    ),
    dependencies=("three.js",),
    tags=("3d", "grid", "eclipse", "roff", "visualization"),
)


# ─── Catalog registry ─────────────────────────────────────────────────────────

_ENGINES: tuple[DomainEngineDefinition, ...] = (
    _WELL_LOG_ENGINE,
    _DECLINE_ENGINE,
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
