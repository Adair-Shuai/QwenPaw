# UGSci 领域计算薄封装实施方案

> 状态：Ready for implementation  
> 面向读者：实现 Agent、评审 Agent、测试 Agent、发布 Agent  
> 依赖设计：`domain-compute-engine-architecture.md`  
> 更新日期：2026-08-09

## 1. 文档用途

本文档把 UGSci 领域计算架构拆成可执行的工程任务。实现者应当能够仅凭本文档完成代码、测试、前端集成、打包验证和文档同步，不需要自行重新设计边界。

本方案实施的是一个 **薄领域能力层**：

```text
Agent / Skill / Workflow
        ↓
UGSci 稳定领域工具（公开契约）
        ↓
Domain Service（单位、校验、结果标准化）
        ↓
Engine Port（稳定接口）
        ↓
Adapter（第三方库适配）
        ↓
lasio / scipy / NeqSim / 未来替代引擎
```

第一阶段不建设第二套 Runtime，不修改 QwenPaw 的工具调用路径，不复制 MCP 配置，不增加运行数据库。

## 2. 最终交付结果

完成后应具备以下能力：

1. “工具·技能 → 引擎 → 领域计算”展示真实领域能力。
2. 首批展示三个自有能力：
   - 测井数据处理；
   - 递减分析；
   - PVT 与流体热力学（NeqSim）。
3. Agent 可调用稳定的 UGSci 测井与递减分析工具。
4. lasio、scipy 等第三方对象和异常不会穿透公共接口。
5. NeqSim 继续通过 QwenPaw Driver/MCP 原生调用，不产生第二条执行链。
6. 更换测井或递减计算实现时，工具名、技能和前端不需要变化。
7. 单个依赖缺失只影响相应能力，不阻止 UGSci 加载。
8. Windows、macOS 的打包运行环境具有明确验证结果。

## 3. 硬性架构约束

实现过程中必须遵守以下约束。评审时任何一条不满足都应阻止合并。

### 3.1 不修改 QwenPaw core 调用链

禁止为了本功能修改：

- `AgentBuilder` 的工具装配流程；
- `DriverManager.invoke_capability()`；
- `DriverCapability` 数据结构；
- Tool Guard 或 Driver Policy；
- MCP handler 生命周期；
- 原生 MCP、Tools 页面 CRUD。

如发现必须修改 core 才能完成某一步，停止该步骤，将需求记录为后续上游能力，而不是通过读取私有字段绕过。

### 3.2 单一配置真相源

- MCP endpoint、command、env、OAuth、启停和访问策略仍由 QwenPaw Driver 管理。
- 内置工具启停仍由 QwenPaw 工具配置管理。
- UGSci Catalog 只保存领域元数据和 Provider 引用。
- 不持久化“NeqSim 当前在线”等派生状态。

### 3.3 第三方实现不得穿透

公共工具、领域服务和 API 不得返回：

- `lasio.LASFile`；
- `welly.Well`；
- `pandas.DataFrame`；
- numpy scalar/array；
- scipy result object；
- Java/NeqSim 对象；
- 第三方异常类型。

所有对象必须转换为 UGSci 自有 dataclass 或 JSON-safe 数据。

### 3.4 唯一源码目录

只修改：

```text
plugins/bundle/ugsci
```

禁止手工修改：

```text
src/qwenpaw/plugins_bundle/ugsci
```

后者是打包镜像，完成实现和前端构建后统一运行：

```bash
python scripts/sync_ugsci_bundle.py --sync
```

### 3.5 工具命名稳定且带命名空间

首批公共工具名固定为：

```text
ugsci_welllog_read
ugsci_welllog_validate
ugsci_welllog_export
ugsci_decline_fit
ugsci_decline_forecast
ugsci_decline_eur
```

不得使用 `lasio_read`、`scipy_fit` 等实现型名称。已发布工具名不得无迁移方案直接重命名。

## 4. MVP 范围

### 4.1 本轮实现

#### 测井数据处理

- LAS 2.0 常规读取；
- 井信息、曲线元数据和有限采样摘要；
- 深度单调性、重复深度、NULL、缺失率、非有限值和单位缺失检查；
- 导出为新 LAS 文件；
- lasio Adapter；
- welly 只作为后续可选 Adapter，不在 MVP 公共路径中使用。

#### 递减分析

- exponential、harmonic、hyperbolic 三类 Arps 模型；
- 指定模型拟合；
- `model=auto` 候选比较；
- 产量预测；
- 基于时间边界或经济极限的 EUR；
- numpy/scipy Adapter。

#### NeqSim

- Catalog 定义；
- 映射到 `driver:neqsim`；
- 前端通过现有 `/mcp` 和 `/mcp/tools/{key}` 获取状态和工具；
- 配置操作进入原生 MCP 页面；
- 不新增 `ugsci_pvt_*` 包装工具。

#### 领域计算页面

- 按领域分组；
- 搜索；
- 来源、状态、操作数量和工具数量；
- 详情抽屉；
- 刷新；
- 原生配置入口。

### 4.2 明确不做

- 运行记录数据库；
- Provider 自动故障切换；
- 用户自定义领域引擎 CRUD；
- 自动安装 Python 包；
- 模糊工具名匹配；
- 通用科学工作流调度器；
- SimPEG 反演任务执行；
- xtgeo 大模型数据处理；
- pvtlib 与 NeqSim 自动切换；
- 直接修改原始 LAS 文件。

## 5. 目标目录结构

```text
plugins/bundle/ugsci/
├── domain/
│   ├── __init__.py
│   ├── common/
│   │   ├── __init__.py
│   │   ├── errors.py
│   │   ├── result.py
│   │   └── serialization.py
│   ├── well_log/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── ports.py
│   │   ├── service.py
│   │   ├── tools.py
│   │   └── adapters/
│   │       ├── __init__.py
│   │       └── lasio_adapter.py
│   └── decline/
│       ├── __init__.py
│       ├── models.py
│       ├── ports.py
│       ├── service.py
│       ├── tools.py
│       └── adapters/
│           ├── __init__.py
│           └── scipy_arps.py
├── domain_engine/
│   ├── __init__.py
│   ├── api.py
│   ├── catalog.py
│   ├── models.py
│   ├── service.py
│   └── dependency_probe.py
└── ui/src/domain-engine/
    ├── DomainEngineSection.ts
    ├── DomainEngineCard.ts
    ├── DomainEngineDetail.ts
    ├── domainEngineApi.ts
    ├── runtimeStatus.ts
    └── types.ts
```

测试目录：

```text
tests/unit/plugins/ugsci/
├── test_domain_common.py
├── test_domain_well_log.py
├── test_domain_decline.py
├── test_domain_engine_catalog.py
├── test_domain_engine_api.py
└── fixtures/
    ├── minimal_valid.las
    ├── nulls_and_duplicates.las
    ├── malformed_header.las
    └── decline_hyperbolic.json
```

## 6. 公共契约

### 6.1 错误模型

文件：`domain/common/errors.py`

```python
class DomainErrorCode(str, Enum):
    INVALID_INPUT = "invalid_input"
    FILE_NOT_FOUND = "file_not_found"
    UNSUPPORTED_FORMAT = "unsupported_format"
    DEPENDENCY_UNAVAILABLE = "dependency_unavailable"
    ENGINE_UNAVAILABLE = "engine_unavailable"
    UNSUPPORTED_OPERATION = "unsupported_operation"
    CALCULATION_FAILED = "calculation_failed"
    NON_CONVERGENT = "non_convergent"
    INVALID_RESULT = "invalid_result"


class DomainError(Exception):
    code: DomainErrorCode
    message: str
    details: dict[str, Any]
    retryable: bool
```

要求：

- Adapter 捕获第三方异常并转换为 `DomainError`。
- `details` 不包含 stack trace、环境变量和敏感绝对路径。
- 未知异常在工具边界统一转成 `calculation_failed`，同时后端日志保留 traceback。

### 6.2 结果信封

文件：`domain/common/result.py`

```python
@dataclass
class DomainResult:
    schema_version: int
    engine_id: str
    provider_id: str
    operation: str
    method: str
    result: dict[str, Any]
    units: dict[str, str]
    metrics: dict[str, float | int | str | None]
    assumptions: list[str]
    warnings: list[str]
    artifacts: list[ArtifactRef]
```

`ArtifactRef` 最少包含：

```python
@dataclass
class ArtifactRef:
    path: str
    media_type: str
    description: str
```

序列化要求：

- 不允许 NaN、Infinity 和 numpy scalar；
- 时间使用 ISO 8601 字符串；
- key 使用 snake_case；
- JSON 序列化失败视为 `invalid_result`；
- `schema_version` MVP 固定为 `1`。

### 6.3 Tool 返回

领域工具应返回 AgentScope `ToolChunk`，但 `agentscope` import 放在工具函数内部，保持模块导入轻量：

```python
async def ugsci_decline_fit(...) -> Any:
    from agentscope.tool import ToolChunk

    try:
        result = service.fit(...)
        return ToolChunk(content=[...json text...])
    except DomainError as exc:
        return ToolChunk(content=[...structured error text...])
```

如项目已有公共 ToolChunk 辅助函数可直接复用；不得为了领域工具修改 AgentScope adapter。

## 7. 测井领域设计

### 7.1 自有模型

文件：`domain/well_log/models.py`

至少定义：

```python
@dataclass
class WellMetadata:
    well_name: str = ""
    uwi: str = ""
    field: str = ""
    company: str = ""
    start_depth: float | None = None
    stop_depth: float | None = None
    step: float | None = None
    depth_unit: str = ""


@dataclass
class LogCurve:
    mnemonic: str
    unit: str
    description: str
    values: list[float | None]


@dataclass
class WellLogDataset:
    metadata: WellMetadata
    depth_mnemonic: str
    depth: list[float | None]
    curves: list[LogCurve]
    source_path: str
    null_value: float | None
    warnings: list[str]
```

为了避免大文件直接进入模型上下文，公共读取工具默认不返回所有曲线值。Service 层支持完整 Dataset，Tool 层默认返回：

- metadata；
- 曲线清单；
- 每条曲线 count/null_count/min/max/mean；
- 开头和结尾有限样本；
- QC warnings。

工具参数提供 `sample_rows`，默认 20，上限 200。

### 7.2 Port

文件：`domain/well_log/ports.py`

```python
class WellLogEngine(Protocol):
    provider_id: str

    def dependency_status(self) -> DependencyStatus: ...
    def read(self, request: WellLogReadRequest) -> WellLogDataset: ...
    def export(self, request: WellLogExportRequest) -> ArtifactRef: ...
```

`validate` 属于 UGSci 领域规则，优先放在 Service，而不是 Adapter。这样更换 lasio 后 QC 结果保持一致。

### 7.3 LasioAdapter

文件：`domain/well_log/adapters/lasio_adapter.py`

要求：

1. `import lasio` 只能出现在延迟加载函数或 Adapter 初始化路径。
2. 缺失依赖转换为 `dependency_unavailable`。
3. 读取时支持显式 encoding；未指定时使用 lasio 默认策略。
4. NULL 和非有限值转换为 `None`。
5. numpy 数据转换为 Python float/list。
6. 原始 header error 需要转为 warning 或标准错误。
7. 导出必须写新文件；如果输入路径与输出路径解析后相同，拒绝执行。
8. Adapter 不生成 Agent 文本，只返回自有模型。

### 7.4 WellLogService

文件：`domain/well_log/service.py`

职责：

- 限制扩展名为 `.las`；
- 调用 Adapter；
- 深度单调性检查；
- 重复深度检查；
- NULL/非有限值统计；
- 单位缺失检查；
- 空曲线检查；
- 构造 JSON-safe summary；
- 导出前验证目标路径与覆盖规则。

MVP 不做岩性解释、饱和度计算和自动曲线修复。

### 7.5 工具签名

文件：`domain/well_log/tools.py`

建议签名：

```python
async def ugsci_welllog_read(
    path: str,
    encoding: str = "",
    sample_rows: int = 20,
) -> Any: ...


async def ugsci_welllog_validate(
    path: str,
    encoding: str = "",
) -> Any: ...


async def ugsci_welllog_export(
    input_path: str,
    output_path: str,
    encoding: str = "utf-8",
) -> Any: ...
```

`ugsci_welllog_export` MVP 只做安全重写和规范化输出，不提供任意曲线表达式执行。

## 8. 递减分析领域设计

### 8.1 数学约定

内部统一使用相对时间 `t >= 0`，时间单位在请求中显式声明。Arps 公式：

```text
exponential: q(t) = qi * exp(-di * t)
harmonic:    q(t) = qi / (1 + di * t)
hyperbolic:  q(t) = qi / (1 + b * di * t)^(1/b)
```

参数约束：

- `qi > 0`；
- `di > 0`；
- exponential 固定 `b = 0`；
- harmonic 固定 `b = 1`；
- hyperbolic MVP 限制 `0 < b < 1`；
- rate 必须非负；
- 至少 4 个有效数据点；
- 时间严格递增，重复点由 Service 根据明确策略处理。

### 8.2 自有模型

文件：`domain/decline/models.py`

至少定义：

```python
class DeclineModel(str, Enum):
    AUTO = "auto"
    EXPONENTIAL = "exponential"
    HARMONIC = "harmonic"
    HYPERBOLIC = "hyperbolic"


@dataclass
class ProductionPoint:
    time: float
    rate: float


@dataclass
class DeclineFitRequest:
    points: list[ProductionPoint]
    time_unit: str
    rate_unit: str
    model: DeclineModel


@dataclass
class DeclineFit:
    model: DeclineModel
    qi: float
    di: float
    b: float | None
    rmse: float
    mae: float
    r_squared: float
    aic: float | None
    fit_start: float
    fit_end: float
```

### 8.3 Port

文件：`domain/decline/ports.py`

```python
class DeclineEngine(Protocol):
    provider_id: str

    def dependency_status(self) -> DependencyStatus: ...
    def fit(self, request: DeclineFitRequest) -> list[DeclineFit]: ...
    def rates(self, fit: DeclineFit, times: list[float]) -> list[float]: ...
    def cumulative(self, fit: DeclineFit, start: float, end: float) -> float: ...
```

### 8.4 ScipyArpsAdapter

文件：`domain/decline/adapters/scipy_arps.py`

要求：

- numpy/scipy 延迟 import；
- 使用有界拟合；
- 对每个候选模型独立捕获不收敛；
- 一个模型失败不阻止其他候选模型；
- 所有 numpy 值转换为 Python float；
- 不在 Adapter 中自动选择最佳模型；
- 不生成自然语言解释。

### 8.5 DeclineAnalysisService

文件：`domain/decline/service.py`

职责：

- 输入点校验和排序；
- 处理重复时间；
- 保持零产量点的策略显式；
- 计算候选模型指标；
- `model=auto` 时按 AIC、RMSE 和物理约束形成推荐，但保留所有成功候选；
- 预测范围校验；
- 经济极限求交；
- 生成 assumptions 和 warnings；
- 返回标准 `DomainResult`。

`auto` 结果必须标注“推荐模型”，不能宣称“唯一正确模型”。

### 8.6 工具签名

```python
async def ugsci_decline_fit(
    time: list[float],
    rate: list[float],
    time_unit: str,
    rate_unit: str,
    model: str = "auto",
) -> Any: ...


async def ugsci_decline_forecast(
    model: str,
    qi: float,
    di: float,
    b: float | None,
    forecast_time: list[float],
    time_unit: str,
    rate_unit: str,
) -> Any: ...


async def ugsci_decline_eur(
    model: str,
    qi: float,
    di: float,
    b: float | None,
    time_unit: str,
    rate_unit: str,
    forecast_end: float | None = None,
    economic_limit: float | None = None,
) -> Any: ...
```

EUR 必须至少提供 `forecast_end` 或 `economic_limit`；两者均为空时拒绝调用。

## 9. 领域引擎 Catalog

### 9.1 数据模型

文件：`domain_engine/models.py`

第一版保持简单：

```python
@dataclass(frozen=True)
class DomainOperation:
    id: str
    name: str
    description: str
    tool_names: tuple[str, ...] = ()
    driver_tool_names: tuple[str, ...] = ()


@dataclass(frozen=True)
class ProviderRef:
    kind: Literal["builtin", "driver"]
    id: str


@dataclass(frozen=True)
class DomainEngineDefinition:
    schema_version: int
    id: str
    name: str
    description: str
    domain: str
    source: Literal["builtin", "mcp"]
    provider: ProviderRef
    operations: tuple[DomainOperation, ...]
    dependencies: tuple[str, ...] = ()
    tags: tuple[str, ...] = ()
```

第一版不增加 `EngineInstance` 持久化模型。当前 Agent 的状态是派生视图。

### 9.2 固定定义

文件：`domain_engine/catalog.py`

#### well-log-processing

```yaml
id: well-log-processing
name: 测井数据处理
domain: geology_well_logging
source: builtin
provider: {kind: builtin, id: ugsci-welllog-lasio}
dependencies: [lasio]
operations:
  - welllog.las.read
  - welllog.quality.validate
  - welllog.las.export
```

#### decline-analysis

```yaml
id: decline-analysis
name: 递减分析
domain: production_engineering
source: builtin
provider: {kind: builtin, id: ugsci-decline-scipy}
dependencies: [numpy, scipy]
operations:
  - production.decline.fit
  - production.decline.forecast
  - production.decline.eur
```

#### neqsim

```yaml
id: neqsim
name: PVT 与流体热力学
domain: fluid_thermodynamics
source: mcp
provider: {kind: driver, id: neqsim}
dependencies: [java-runtime, neqsim-mcp-server]
operations:
  - fluid.flash
  - fluid.pvt
  - fluid.phase_envelope
  - process.simulation
  - pipeline.flow
```

NeqSim 的 `driver_tool_names` 必须根据实际 MCP Server 返回工具清单建立精确映射。不要根据中文显示名或正则表达式猜测。

### 9.3 依赖探测

文件：`domain_engine/dependency_probe.py`

只读探测：

- Python 包：`importlib.util.find_spec()`，必要时读取 package metadata；
- NeqSim：检查桌面环境变量指向的 JRE/JAR 是否存在；
- 禁止 probe 时 import SimPEG 等重型模块；
- 禁止下载或安装；
- 返回 `available | unavailable | unknown` 和非敏感原因。

### 9.4 后端 API

文件：`domain_engine/api.py`

路由前缀：

```text
/api/ugsci/domain-engines
```

MVP 端点：

```http
GET /list
GET /{engine_id}
POST /probe
POST /{engine_id}/probe
```

返回静态定义和本地依赖状态。MCP 的 enabled、工具清单和策略不由该 API 复制；前端使用现有 Agent-scoped `/api/mcp` 和 `/api/mcp/tools/{key}` 聚合。

API 响应必须包含：

```json
{
  "schema_version": 1,
  "engine": {},
  "dependency_status": {},
  "checked_at": "2026-08-09T00:00:00Z"
}
```

## 10. Plugin 注册

修改：`plugins/bundle/ugsci/plugin.py`

### 10.1 新增 Router

在 `UGSciPlugin.register()` 中注册：

```python
self._register_router(
    api,
    build_domain_engine_router,
    "/ugsci/domain-engines",
    "ugsci-domain-engines",
    "domain engine catalog",
)
```

Router 注册失败只记录错误，不影响其他 UGSci 模块。

### 10.2 新增工具

新增独立方法 `_register_domain_tools(api)`，不要继续扩大 `_register_simulation_tools()`。

注册参数：

| 工具 | enabled | tool_type | target_param |
| --- | --- | --- | --- |
| `ugsci_welllog_read` | `False` | `file` | `path` |
| `ugsci_welllog_validate` | `False` | `file` | `path` |
| `ugsci_welllog_export` | `False` | `file` | `output_path` |
| `ugsci_decline_fit` | `False` | `internal` | `""` |
| `ugsci_decline_forecast` | `False` | `internal` | `""` |
| `ugsci_decline_eur` | `False` | `internal` | `""` |

工具默认关闭，用户按 Agent 启用。不得因它们是内置科学计算而绕过工具治理。

### 10.3 导入隔离

`plugin.py` 注册工具时可以 import 工具模块，但工具模块顶层不得 import lasio/numpy/scipy。这样缺少可选依赖时插件仍可完成注册并在调用时返回明确错误。

## 11. 前端实施

### 11.1 替换静态空状态

修改：`ui/src/capability/ToolsSkillsCenterPage.ts`

删除本文件中的静态 `DomainComputeSection()`，改为导入：

```typescript
import { DomainEngineSection } from "../domain-engine/DomainEngineSection";
```

其余顶层 Tab、旧路由和原生页面嵌入逻辑保持不变。

### 11.2 类型

文件：`ui/src/domain-engine/types.ts`

类型必须镜像 API DTO，不直接复用仿真 `EngineInfo`：

```typescript
export interface DomainEngineDefinition { ... }
export interface DomainOperation { ... }
export interface DependencyStatus { ... }
export interface DomainEngineView { ... }
```

`DomainEngineView` 是前端派生类型，可包含：

- definition；
- dependency status；
- MCP client status；
- discovered tool count；
- effective availability。

### 11.3 状态聚合

文件：`ui/src/domain-engine/runtimeStatus.ts`

规则：

#### builtin

- 依赖可用：`available`；
- 必需依赖缺失：`unavailable`；
- 后端 probe 失败：`unknown`。

工具是否启用由用户进入“平台内置”查看。第一版若缺少稳定的工具状态公开 API，不通过读取私有配置猜测，卡片显示“依赖可用，需在平台内置中启用工具”。

#### mcp

- `/mcp` 中找不到 provider：`unavailable`；
- 存在但 disabled：`unconfigured`；
- enabled 且 `/mcp/tools/{key}` 成功并存在工具：`available`；
- enabled 但工具查询失败：`error`；
- provider key 必须精确匹配 `neqsim`。

所有 MCP 请求携带当前 `X-Agent-Id`。

### 11.4 页面行为

列表页：

- 默认按领域分组；
- 支持按名称、操作、tag 搜索；
- 显示来源和状态；
- 显示操作数、已发现工具数；
- 单张卡片失败不影响其他卡片。

详情抽屉：

- 概览；
- 领域操作；
- 对应工具；
- 实现与依赖；
- 问题处理动作。

动作：

- MCP Provider：导航到 `/mcp` 或嵌入页的 MCP Tab；
- builtin Provider：切换到统一页 `?tab=tools` 下的平台内置 Tab；
- 刷新：重新请求 Catalog、probe 和 MCP 工具。

禁止在领域页面新增独立启停开关。

## 12. 技能迁移

修改：

- `skills/well-log-analysis/SKILL.md`
- `skills/oil-gas-reservoir-production/SKILL.md`

### 12.1 测井技能

将默认工作流从“让 Agent 自己写 Python 并 import lasio”改为：

1. 优先使用 `ugsci_welllog_read`；
2. 使用 `ugsci_welllog_validate` 做 QC；
3. 只有稳定工具不满足任务时才建议编写自定义脚本；
4. 解释结果时引用 UGSci 输出中的 warnings、units 和 assumptions。

保留 lasio 作为实现背景或高级参考，但不作为 Agent 默认调用方式。

### 12.2 递减技能

将默认 scipy 示例降为高级参考，默认流程改为：

1. 检查时间、产量、单位和分析区间；
2. 调用 `ugsci_decline_fit`；
3. 比较所有候选而非只读推荐模型；
4. 明确预测边界后调用 forecast/EUR；
5. 报告拟合指标、假设、不确定性和警告。

## 13. 分阶段任务清单

以下任务编号用于分派给其他 Agent。一个 Agent 只应处理明确列出的文件，避免并行编辑冲突。

### G0：运行环境基线

**目标**：确认依赖在开发环境和桌面打包后端中的实际可用性。

**修改文件**：

- 新增 `docs/domain-compute-runtime-baseline.md`；
- 必要时新增只读诊断脚本到 `scripts/pack-tauri/`。

**执行内容**：

1. 记录 macOS/Windows 构建脚本中的包清单。
2. 在实际后端解释器中验证 `find_spec` 和 import。
3. 记录 lasio、numpy、scipy、welly 的版本。
4. 验证 NeqSim JRE/JAR 环境变量和文件。
5. 确认插件工具运行进程使用哪个 Python 环境。

**完成条件**：

- 明确 lasio/scipy 是否可被插件工具进程 import；
- 若某平台不可用，先修复打包或将该 Provider 标为 unavailable；
- 不通过运行时 pip 安装规避问题。

### G1：公共模型与错误

**依赖**：无。  
**可并行**：不可与修改相同公共文件的任务并行。

**新增文件**：

- `domain/common/errors.py`
- `domain/common/result.py`
- `domain/common/serialization.py`
- `tests/unit/plugins/ugsci/test_domain_common.py`

**测试要求**：

- numpy scalar/array 转换；
- NaN/Infinity 拒绝或转换；
- DomainError 序列化；
- ArtifactRef JSON；
- 第三方异常不出现在用户结果中。

**完成条件**：公共测试通过，模块导入不依赖 lasio/scipy。

### G2：测井薄封装

**依赖**：G0、G1。  
**可与 G3 并行**：是。

**新增文件**：`domain/well_log/**`、测井 fixture 和测试。

**实现顺序**：

1. 先写 models 和 Port 测试。
2. 使用 FakeWellLogEngine 测 Service，不依赖 lasio。
3. 实现 LasioAdapter。
4. 添加 fixture 集成测试。
5. 实现三个工具函数。

**关键测试**：

- 合法 LAS；
- NULL；
- 重复和非单调深度；
- 缺失单位；
- 异常 header；
- 依赖缺失；
- 禁止原地覆盖；
- sample_rows 上限；
- 输出中没有 numpy 和 lasio 对象。

### G3：递减分析薄封装

**依赖**：G0、G1。  
**可与 G2 并行**：是。

**新增文件**：`domain/decline/**`、合成数据 fixture 和测试。

**实现顺序**：

1. 先实现纯公式和模型验证。
2. 使用合成数据验证参数恢复。
3. 实现 ScipyArpsAdapter。
4. 实现 Service 的候选比较。
5. 实现 forecast 和 EUR。
6. 实现三个工具函数。

**关键测试**：

- 三类模型固定参数结果；
- hyperbolic 参数恢复容差；
- 非法负产量；
- 重复时间；
- 不收敛候选不影响其他候选；
- auto 保留全部成功候选；
- EUR 缺少边界时拒绝；
- 经济极限已经高于初始产量时的错误；
- 输出无 numpy 类型。

### G4：Catalog 与 API

**依赖**：G1；G2/G3 的工具名已经冻结。  
**可并行**：可在工具实现期间编写，但合并前必须用真实名称校验。

**新增文件**：`domain_engine/**`、Catalog/API 测试。

**关键测试**：

- 三个 engine ID 唯一；
- operation ID 唯一；
- builtin tool refs 均在预期清单；
- NeqSim provider 精确为 `driver:neqsim`；
- 依赖缺失不抛出模块导入错误；
- list/detail/404/probe API；
- API JSON 不包含绝对依赖路径和环境变量。

### G5：Plugin 注册

**依赖**：G2、G3、G4。  
**修改文件**：`plugin.py` 和插件注册测试。

**要求**：

- 注册新 Router；
- 注册六个工具；
- 单个领域工具注册失败不影响其他工具；
- 更新 `RecordingPluginApi` 断言；
- 原有六个仿真工具断言保持通过。

### G6：领域计算 UI

**依赖**：G4 API 契约。  
**可并行**：可使用固定 fixture 开发。

**新增文件**：`ui/src/domain-engine/**`。  
**修改文件**：`ToolsSkillsCenterPage.ts`。

**要求**：

- 不修改原生 MCP/Tools 页面；
- 当前 Agent 切换后重新获取 MCP 数据；
- MCP 失败不影响 builtin 卡片；
- URL Tab 兼容；
- TypeScript 不使用 `any` 逃避 API 类型。

### G7：技能迁移

**依赖**：公共工具签名冻结。  
**修改文件**：两个技能文件。

**要求**：

- 默认优先 UGSci 工具；
- 不删除必要的科学背景和适用性说明；
- 不让技能引用不存在的工具；
- 工具关闭时给出“在工具·技能中启用”的处理方式。

### G8：打包、同步与端到端验证

**依赖**：G0-G7。

**执行内容**：

1. 后端测试；
2. 前端 typecheck/build；
3. 同步 bundled mirror；
4. bundle drift 检查；
5. 桌面环境 smoke test；
6. 检查安装包体积变化；
7. 记录依赖许可证。

**完成条件**：见第 17 节发布门槛。

## 14. Agent 分工建议

最多并行安排如下：

```text
Agent A: G1 公共契约 → G4 Catalog/API
Agent B: G2 测井薄封装
Agent C: G3 递减分析
Agent D: G6 前端（等待 G4 契约冻结）
```

主协调 Agent 负责：

- G0 基线确认；
- 冻结工具名和 API Schema；
- G5 Plugin 注册；
- G7 技能迁移；
- G8 集成验证；
- 处理跨任务冲突。

并行规则：

- G2、G3 不得同时编辑 `plugin.py`；
- G6 不得修改 backend DTO 以迁就 UI；
- 子 Agent 不运行 bundle sync，最终由主 Agent统一执行；
- 每个 Agent 必须报告新增文件、测试命令和未解决风险。

## 15. 测试命令

实现 Agent 应根据修改范围运行最小测试；合并 Agent 运行完整集合。

### 15.1 Python 单元测试

```bash
pytest -q tests/unit/plugins/ugsci/test_domain_common.py
pytest -q tests/unit/plugins/ugsci/test_domain_well_log.py
pytest -q tests/unit/plugins/ugsci/test_domain_decline.py
pytest -q tests/unit/plugins/ugsci/test_domain_engine_catalog.py
pytest -q tests/unit/plugins/ugsci/test_domain_engine_api.py
pytest -q tests/unit/plugins/ugsci/test_plugin_registration.py
```

完整 UGSci：

```bash
pytest -q tests/unit/plugins/ugsci
```

### 15.2 前端

```bash
cd plugins/bundle/ugsci/ui
npm run typecheck
npm run build
```

### 15.3 镜像同步

```bash
python scripts/sync_ugsci_bundle.py --sync
python scripts/sync_ugsci_bundle.py --check
```

### 15.4 静态检查

使用仓库现有 Python lint/typecheck 命令；至少执行：

```bash
git diff --check
```

## 16. 科学计算验收数据

### 16.1 测井

fixture 必须为可提交的小型、无敏感信息数据。至少覆盖：

- 3 条曲线；
- 明确 NULL 值；
- 深度单位；
- 一个缺失单位曲线；
- 重复深度 fixture；
- 非单调深度 fixture。

断言不能只比较文本，应比较结构化字段和统计值。

### 16.2 递减

使用代码生成后固化的合成数据：

```text
qi = 1000
di = 0.12 / month
b  = 0.6
t  = 0..36 month
```

至少验证：

- 无噪声参数恢复；
- 固定种子轻噪声参数恢复；
- 预测曲线单调不增；
- 累计产量非负且随时间增加；
- 允许误差在测试中显式写出，禁止仅用 snapshot 文本测试。

## 17. 发布门槛

以下条件全部满足才允许交付：

### 功能

- 领域计算页显示三个引擎；
- builtin 与 MCP 来源展示正确；
- 六个 UGSci 工具在平台内置工具页可见；
- 工具默认关闭；
- 启用后 Agent 能完成最小测井和递减任务；
- NeqSim 仍由原 MCP Driver 调用。

### 边界

- 没有修改 QwenPaw core Driver/Tool 调用路径；
- 没有 UGSci 自有 MCP 配置副本；
- 没有从 UGSci import DriverManager 私有成员；
- 没有第三方对象出现在 API/Tool Result；
- 没有运行时自动 pip 安装。

### 质量

- UGSci 单元测试通过；
- 前端 typecheck/build 通过；
- bundle sync check 通过；
- `git diff --check` 通过；
- macOS/Windows 至少完成依赖 probe；
- golden-data 测试通过；
- 插件卸载后六个工具被正常注销；
- 插件缺少 lasio/scipy 时仍可加载。

## 18. 回滚方案

领域计算功能必须可独立回滚，不影响仿真、专家团、技能池和 GenUI。

回滚顺序：

1. `ToolsSkillsCenterPage` 恢复领域计算空状态。
2. 停止注册 `/ugsci/domain-engines` Router。
3. 停止注册六个领域工具。
4. 删除 `domain/` 和 `domain_engine/` 模块。
5. 恢复技能中对工具的强引用。
6. 重建 UI 并同步 bundle mirror。

回滚不得：

- 删除用户 MCP Driver；
- 删除用户工作区文件；
- 修改原有仿真引擎配置；
- 删除技能池中与本功能无关的技能。

## 19. 后续扩展模板

MVP 完成后，每个新领域能力按以下流程接入：

1. 定义 UGSci 业务名称和 `DomainOperation`。
2. 定义自有 Request/Result DTO。
3. 定义 Engine Port。
4. 使用 Fake Engine 完成 Service 测试。
5. 编写第三方 Adapter。
6. 添加稳定、命名空间化的工具。
7. 将 Definition 加入 Catalog。
8. 更新领域技能。
9. 增加 golden-data 测试。
10. 验证桌面打包依赖。

建议后续顺序：

| 优先级 | 自有能力 | 首选实现 | 说明 |
| --- | --- | --- | --- |
| P1 | DLIS 数据读取 | dlisio | 归入测井数据处理，不单独暴露库名 |
| P1 | 地震与岩石物理计算 | bruges | 先选择少量稳定业务操作 |
| P1 | 地质网格/井轨迹/表面处理 | xtgeo | 大文件结果使用 artifact，不进入上下文 |
| P2 | PVT 轻量计算 | pvtlib | 与 NeqSim 形成不同 Provider，暂不自动切换 |
| P2 | 地球物理反演 | SimPEG | 应采用异步作业模型，不能套用同步小工具 |
| P2 | 高级测井对象模型 | welly | 仅在确有跨井/项目能力需求时增加 Adapter |

注意：新增库不等于新增引擎卡片。多个库共同实现一个自有能力时，应作为同一领域引擎的 Adapter 或子能力存在。

## 20. 实现者提交说明模板

每个实现 Agent 完成任务后按以下格式报告：

```text
任务编号：Gx

完成内容：
- ...

修改文件：
- ...

公共契约变化：
- 无 / 具体变化

运行测试：
- 命令
- 结果

已知限制：
- ...

未修改确认：
- 未修改 QwenPaw core 调用链
- 未修改 src/qwenpaw/plugins_bundle/ugsci 镜像
- 未引入运行时自动安装
```

## 21. 第一阶段完成后的架构状态

第一阶段完成后，系统应保持以下简单边界：

```text
UGSci Catalog       负责“有什么领域能力”
UGSci Domain Tool   负责“Agent 如何稳定调用自有能力”
UGSci Service       负责“领域规则、单位、校验和标准结果”
UGSci Adapter       负责“如何调用第三方库”
QwenPaw Tool/Driver 负责“执行、权限和生命周期”
Skill               负责“何时调用、如何组合和解释”
```

不在第一阶段解决的问题保持显式未解决，不通过临时私有 API、重复配置或前端硬编码掩盖。这个边界是后续低成本替换引擎、扩展科学能力和合并上游版本的基础。

