# UGSci 领域计算引擎架构设计

> 状态：Design Proposed  
> 适用范围：UGSci bundled plugin、QwenPaw Driver/Tool Registry、桌面内置科学计算组件  
> 目标版本：领域计算第二阶段  
> 更新日期：2026-08-09

## 1. 摘要

UGSci 将 NeqSim、测井数据处理、递减分析、PVT、物质平衡、井筒多相流等能力统一呈现在：

```text
UGSci → 工具·技能 → 引擎 → 领域计算
```

“领域计算”是面向用户的业务能力视图，不是新的执行协议或工具仓库。MCP、Python 包、Java 组件、平台内置函数和远程服务是能力的不同技术来源，同一能力可以在多个管理视图中出现，但其配置、连接、执行和授权必须始终只有一个真相来源。

本方案引入一个轻量的 **Domain Engine Registry（领域引擎注册表）**：

- QwenPaw Driver 层继续拥有 MCP 连接、进程、凭据和访问策略。
- QwenPaw Tool Registry 继续拥有 Agent 实际可调用的工具。
- UGSci Domain Engine Registry 描述领域语义、能力分类、Provider 关系、健康状态和工具关联。
- UGSci 技能描述工具的选择、组合、校验和结果解释。
- UGSci 前端只读取聚合结果，不维护引擎与工具的硬编码映射。

## 2. 背景与问题

当前 UGSci 已建立“引擎 / 工具 / 技能”信息架构，并为“领域计算”预留了页面位置，但当前实现仍为空状态。现有新增能力存在三种形态：

1. **内置 MCP**：例如 NeqSim，由桌面端捆绑 JRE 和 MCP Server JAR，启动时自动注册为 Driver。
2. **内置计算库**：例如 lasio、welly、递减分析算法，由 Python 运行时直接调用。
3. **组合工作流**：例如完整测井处理或 PVT 分析，可能同时使用文件解析、计算、绘图和报告工具。

如果直接按实现方式组织界面，会产生以下问题：

- 用户需要知道 NeqSim 是 MCP，才能找到 PVT 计算。
- Python 库名称暴露为产品概念，业务用户难以理解。
- 前端维护“某 MCP 有哪些工具”的静态映射，容易与真实运行状态不一致。
- MCP、内置工具和领域页面分别保存配置，造成双写和状态漂移。
- 技能、专家无法稳定依赖能力；底层从内置库迁移到 MCP 时会破坏上层配置。

## 3. 目标与非目标

### 3.1 目标

1. 用石油工程问题域组织领域计算能力，而不是按技术栈组织。
2. 建立引擎、Provider、工具、技能和专家之间可查询的关系。
3. 同时支持 MCP、内置 Python/Java、插件和远程服务。
4. 保证配置、生命周期、执行和权限各自只有一个所有者。
5. 新增领域引擎时主要通过后端注册完成，前端无需修改映射代码。
6. 保持现有仿真引擎、MCP、内置工具、技能与旧路由兼容。
7. 为依赖检测、健康检查、版本展示和故障定位提供统一模型。

### 3.2 非目标

- 不用 Domain Engine Registry 替换 QwenPaw Driver Registry 或 Tool Registry。
- 不在本阶段实现通用工作流编排器。
- 不允许领域引擎绕过现有工具审批、沙箱和访问控制。
- 不直接向 Agent 暴露任意 Python 包 API。
- 不把仿真软件现有文件格式和作业系统强行统一为同步函数调用。

## 4. 架构原则

### 4.1 业务分类与技术来源正交

领域分类回答“它解决什么问题”，技术来源回答“它如何实现”。两者不能合并为同一个枚举。

例如 NeqSim：

- 业务分类：流体与热力学。
- 引擎类型：领域计算。
- 技术来源：MCP。
- 运行时：Java。
- Provider：QwenPaw Driver `neqsim`。

### 4.2 引擎暴露工具，技能组合工具

```text
引擎（能力提供者）
  ↓ provides
工具（Agent 可调用接口）
  ↓ composed by
技能（选择、步骤、校验、解释）
  ↓ assigned to
专家（领域执行主体）
```

引擎不等于工具。一个引擎通常提供多个内聚操作；一个工具在任一时刻只绑定一个执行 Provider，但可以声明替代 Provider。

### 4.3 不复制所有权

| 数据或行为 | 唯一所有者 |
| --- | --- |
| MCP endpoint、command、env、OAuth | QwenPaw Driver |
| MCP 进程启动与协议会话 | QwenPaw Driver Runtime |
| 工具 Schema 与实际调用 | QwenPaw Tool Registry |
| 工具审批、allow/ask/deny | QwenPaw Security/Driver Policy |
| 领域名称、分类、能力标签 | UGSci Domain Engine Registry |
| 引擎与工具关联 | UGSci Registry Resolver |
| 工作流与结果解释 | UGSci Skill |
| 页面筛选与展示状态 | UGSci UI |

### 4.4 可降级、可解释

单个领域引擎启动失败不得阻止 UGSci 插件加载。前端必须区分：

- 未安装；
- 已安装但未配置；
- 已配置但 Provider 未连接；
- Provider 已连接但工具不可用；
- 可用；
- 降级可用；
- 错误。

## 5. 信息架构与领域分类

```text
工具·技能
├── 引擎
│   ├── 仿真软件
│   ├── 领域计算
│   │   ├── 流体与热力学
│   │   ├── 地质与测井
│   │   ├── 地球物理
│   │   ├── 油藏工程
│   │   ├── 钻井工程
│   │   ├── 生产工程
│   │   ├── 地面工程
│   │   └── 经济评价
│   └── 运行服务
├── 工具
│   ├── MCP 接入
│   └── 平台内置
└── 技能
    ├── 当前专家
    └── 技能库
```

建议首批映射：

| 引擎 | 一级领域 | 二级能力 | 来源 |
| --- | --- | --- | --- |
| NeqSim | 流体与热力学 | Flash、PVT、相包络、流程、管流 | MCP / Java |
| 测井数据处理 | 地质与测井 | LAS I/O、QC、重采样、曲线计算、地层评价 | Builtin / Python |
| 递减分析 | 生产工程 | Arps 拟合、模型选择、产量预测、EUR | Builtin / Python |
| 物质平衡 | 油藏工程 | 油藏/气藏物质平衡、储量估算 | Builtin 或 Plugin |

库名不作为一级卡片名称。`lasio`、`welly`、`PetroPy` 应显示在“实现与依赖”区域，而不是与“测井数据处理”并列。

## 6. 总体架构

```text
┌──────────────────────── UGSci UI ────────────────────────┐
│ DomainEngineSection                                      │
│  分类 / 搜索 / 卡片 / 详情 / 工具关联 / 问题处理          │
└───────────────────────────┬──────────────────────────────┘
                            │ GET /ugsci/domain-engines
┌───────────────────────────▼──────────────────────────────┐
│ Domain Engine Service                                    │
│  Registry + Resolver + Health Aggregator + DTO Mapper    │
└──────────────┬───────────────────┬───────────────────────┘
               │                   │
       static contributors   runtime resolvers
               │                   │
┌──────────────▼──────┐  ┌────────▼──────────┐
│ Builtin/Plugin      │  │ QwenPaw Runtime   │
│ Providers           │  │ Driver Registry   │
│ Python / Java       │  │ Tool Registry     │
└──────────────┬──────┘  │ Security Policy   │
               │         └────────┬──────────┘
               └──────────────────▼
                         Tool invocation
```

Domain Engine Service 只聚合元数据和健康信息。实际调用始终经 Tool Registry，MCP 工具始终经 Driver Runtime。

## 7. 领域模型

### 7.1 DomainEngineDescriptor

```python
@dataclass(frozen=True)
class DomainEngineDescriptor:
    schema_version: int
    id: str
    name: str
    description: str
    category: Literal["domain_compute"]
    domain: str
    subdomains: list[str]
    source: Literal["builtin", "plugin", "mcp", "remote"]
    provider: ProviderRef
    capabilities: list[CapabilityDescriptor]
    tool_bindings: list[ToolBinding]
    runtime: RuntimeDescriptor | None = None
    dependencies: list[DependencyDescriptor] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)
    icon: str | None = None
    docs_url: str | None = None
```

描述符是声明性元数据，不保存动态 status，也不复制 MCP endpoint 或凭据。

### 7.2 ProviderRef

```python
@dataclass(frozen=True)
class ProviderRef:
    kind: Literal["builtin", "driver", "plugin", "remote"]
    id: str
    protocol: Literal["python", "mcp", "http", "native"] | None = None
```

示例：

```json
{
  "kind": "driver",
  "id": "neqsim",
  "protocol": "mcp"
}
```

### 7.3 CapabilityDescriptor

能力标识采用稳定、与实现无关的命名：

```python
@dataclass(frozen=True)
class CapabilityDescriptor:
    id: str                 # fluid.flash, production.decline.fit
    name: str
    description: str = ""
    input_artifacts: list[str] = field(default_factory=list)
    output_artifacts: list[str] = field(default_factory=list)
```

能力 ID 是技能和推荐系统的稳定依赖；技能优先声明需要的 capability，而不是直接绑定某个库。

### 7.4 ToolBinding

```python
@dataclass(frozen=True)
class ToolBinding:
    capability_id: str
    tool_name: str | None = None
    discovery: ToolDiscovery | None = None
    required: bool = True
    aliases: list[str] = field(default_factory=list)
```

MCP Server 的工具名可能随版本变化，允许通过发现规则匹配：

```python
@dataclass(frozen=True)
class ToolDiscovery:
    provider_id: str
    name_patterns: list[str]
    required_schema_fields: list[str] = field(default_factory=list)
```

规则必须确定性解析。若匹配到多个工具，状态标记为 `ambiguous`，不得静默选择。

### 7.5 RuntimeDescriptor 与 DependencyDescriptor

```python
@dataclass(frozen=True)
class RuntimeDescriptor:
    type: Literal["python", "java", "native", "remote"]
    isolation: Literal["in_process", "subprocess", "driver", "remote"]
    bundled: bool = False

@dataclass(frozen=True)
class DependencyDescriptor:
    id: str
    kind: Literal["python_package", "java_runtime", "binary", "driver"]
    version_spec: str = ""
    optional: bool = False
```

### 7.6 动态状态

```python
class EngineAvailability(str, Enum):
    AVAILABLE = "available"
    DEGRADED = "degraded"
    UNCONFIGURED = "unconfigured"
    UNAVAILABLE = "unavailable"
    ERROR = "error"

@dataclass
class DomainEngineStatus:
    availability: EngineAvailability
    provider_status: str
    dependency_status: dict[str, str]
    tools: list[ResolvedTool]
    checked_at: datetime
    message: str = ""
    actions: list[RemediationAction] = field(default_factory=list)
```

状态由 Resolver 运行时计算，不写回静态描述符。

## 8. 注册机制

### 8.1 Contributor 模型

领域引擎由 Contributor 提供，避免一个全局文件持续膨胀：

```python
class DomainEngineContributor(Protocol):
    def descriptors(self) -> Iterable[DomainEngineDescriptor]: ...

    async def probe(
        self,
        descriptor: DomainEngineDescriptor,
        context: ProbeContext,
    ) -> ProviderProbeResult: ...
```

首批 Contributor：

- `NeqSimContributor`：引用 `driver:neqsim`，不负责创建或修改 Driver。
- `WellLogContributor`：检查 UGSci 内置 Python 依赖并注册测井工具。
- `DeclineAnalysisContributor`：检查算法模块并注册递减分析工具。

### 8.2 注册时序

```text
QwenPaw startup
  1. 创建 DriverManager
  2. 自动注册 bundled MCP（例如 neqsim）
  3. 建立 Tool Registry / 加载 MCP tools
  4. 加载 UGSci plugin
  5. UGSci 注册领域引擎 descriptors 和内置工具
  6. 首次 API 查询时 Resolver 聚合实际状态
```

UGSci 不假设第 2、3 步一定成功。Driver 暂不可用时，NeqSim 描述符仍可显示，但状态为不可用并提供修复入口。

### 8.3 冲突规则

- `engine.id` 在 Registry 内全局唯一。
- 同一插件重复注册相同且内容一致的 descriptor：幂等成功。
- 不同来源注册相同 `engine.id`：拒绝后注册者并记录错误。
- 工具名冲突：不覆盖 Tool Registry 中已有工具。
- capability 可由多个引擎提供；通过优先级和健康状态生成候选列表。
- Provider 不可用时不得伪造工具可用状态。

## 9. 内置库封装规范

### 9.1 不暴露任意库 API

内置库必须通过稳定、领域化的工具包装器暴露。禁止提供类似以下接口：

```text
call_python_library(package, function, args)
```

这类接口难以治理、难以校验，也会把依赖版本细节泄漏给技能和 Agent。

### 9.2 工具粒度

工具应对应一个可验证的业务操作：输入 Schema 稳定、输出可解释、失败可恢复。

测井首批建议：

| 工具 | 职责 |
| --- | --- |
| `read_las_file` | 读取头信息、井信息与曲线元数据 |
| `validate_log_curves` | 深度、单位、缺失、重复和异常值 QC |
| `resample_log_curves` | 深度对齐和重采样 |
| `calculate_petrophysics` | 根据显式参数执行地层评价计算 |
| `export_las_file` | 输出 LAS 并保留必要元数据 |
| `summarize_well_log` | 生成结构化统计摘要，不替代专业解释 |

递减分析首批建议：

| 工具 | 职责 |
| --- | --- |
| `fit_decline_curve` | 拟合 exponential/harmonic/hyperbolic 等模型 |
| `compare_decline_models` | 使用统一指标比较候选模型 |
| `forecast_production` | 基于已确认模型预测产量 |
| `calculate_eur` | 在经济极限和时间边界下计算 EUR |

### 9.3 输入输出约定

- 文件输入使用 workspace 相对路径或受控 artifact 引用。
- 数值必须携带单位；内部可规范化为 SI，但响应必须声明输出单位。
- 时间序列必须声明日期、频率、时区和缺失值策略。
- 工具返回结构化 JSON；图表、报告和文件通过 artifact 引用附加。
- 结果包含 `engine_id`、`engine_version`、`method`、`assumptions` 和 `warnings`。
- 不确定性、拟合区间和外推边界不得只存在于自然语言中。

## 10. NeqSim 集成设计

现有 `ensure_neqsim_driver_registered()` 继续负责：

- 判断桌面 JRE/JAR 是否存在；
- 创建并持久化 `neqsim` DriverCard；
- 启动 MCP stdio Server；
- 保留用户对策略、工具白名单和显示名的修改。

UGSci 新增 `NeqSimContributor`，只声明：

```yaml
schema_version: 1
id: neqsim
name: NeqSim
category: domain_compute
domain: fluid_thermodynamics
subdomains: [pvt, phase_equilibrium, process, pipeline]
source: mcp
provider:
  kind: driver
  id: neqsim
  protocol: mcp
runtime:
  type: java
  isolation: driver
  bundled: true
capabilities:
  - fluid.flash
  - fluid.pvt
  - fluid.phase_envelope
  - process.simulation
  - pipeline.flow
```

Resolver 按以下顺序确定状态：

1. DriverCard 是否存在。
2. Driver 是否 enabled。
3. MCP handler 是否连接成功。
4. Tool Registry 是否发现匹配工具。
5. 当前 Agent 策略是否允许或可审批调用。

领域页面中的“配置”动作跳转或打开原生 MCP 管理页，不创建 UGSci 自有的 NeqSim 配置表单。

## 11. 测井数据处理集成设计

测井能力作为一个产品级引擎 `well-log-processing` 展示，底层依赖可分层：

```text
业务工具包装层
├── LAS I/O adapter          → lasio
├── Well/Curve model adapter → welly（可选）
├── Petrophysics adapter     → PetroPy 或 UGSci 实现（可选）
└── Numerical primitives     → numpy/scipy/pandas
```

设计要求：

- `lasio` 作为核心 I/O 依赖；其他依赖缺失时允许降级。
- 单个可选依赖缺失不应使所有 LAS 读取能力不可用。
- 每项 capability 单独计算 availability。
- 地层评价公式必须记录参数来源和适用条件。
- 原始文件默认只读；导出到新文件，不原地覆盖。
- 对异常 LAS 文件的容错修复必须在结果中列出。

## 12. 递减分析集成设计

递减分析作为 `decline-analysis` 引擎展示。算法实现与工作流解释分离：

- 引擎负责清洗后的时间序列拟合、指标计算和预测。
- 技能负责判断分析区间、异常生产制度、模型适用性和结果解释。
- Agent 不得仅以最高拟合优度自动选定最终模型。

标准结果至少包含：

```json
{
  "engine_id": "decline-analysis",
  "model": "hyperbolic",
  "parameters": {"qi": 120.0, "di": 0.18, "b": 0.7},
  "units": {"qi": "m3/d", "di": "1/year"},
  "fit_window": {"start": "2022-01-01", "end": "2025-12-01"},
  "metrics": {"rmse": 3.4, "aic": 214.8},
  "forecast": {"economic_limit": 2.0, "eur": 152000.0},
  "assumptions": [],
  "warnings": []
}
```

## 13. API 设计

建议新增独立路由 `/api/ugsci/domain-engines`，暂不复用现有仿真软件 CRUD。原因是仿真软件以可执行文件检测和人工配置为中心，而领域引擎以声明注册、Provider 解析和依赖健康为中心，生命周期不同。

### 13.1 查询列表

```http
GET /api/ugsci/domain-engines?domain=production_engineering&status=available
X-Agent-Id: <agent-id>
```

```json
{
  "schema_version": 1,
  "engines": [
    {
      "id": "decline-analysis",
      "name": "递减分析",
      "domain": "production_engineering",
      "source": "builtin",
      "availability": "available",
      "capability_count": 4,
      "available_tool_count": 4,
      "warnings": []
    }
  ]
}
```

### 13.2 查询详情

```http
GET /api/ugsci/domain-engines/{engine_id}
X-Agent-Id: <agent-id>
```

返回 descriptor、动态状态、能力、已解析工具、依赖和 remediation actions。

### 13.3 刷新健康状态

```http
POST /api/ugsci/domain-engines/{engine_id}/probe
X-Agent-Id: <agent-id>
```

该操作只检查状态，不安装依赖、不启用 Driver、不改变安全策略。

### 13.4 查询关系

```http
GET /api/ugsci/domain-engines/{engine_id}/tools
GET /api/ugsci/domain-engines/by-capability/{capability_id}
```

首阶段可以将工具关系直接包含在详情响应中，独立端点留作跨类型搜索和推荐系统使用。

### 13.5 错误模型

```json
{
  "error": {
    "code": "provider_unavailable",
    "message": "NeqSim MCP 服务未连接",
    "engine_id": "neqsim",
    "provider_id": "neqsim",
    "retryable": true,
    "actions": [
      {"type": "open_mcp", "label": "打开 MCP 配置", "target": "neqsim"}
    ]
  }
}
```

## 14. 前端设计

将当前静态 `DomainComputeSection` 替换为独立模块：

```text
ui/src/domain-engine/
├── DomainEngineSection.ts
├── DomainEngineCard.ts
├── DomainEngineDetail.ts
├── DomainEngineFilters.ts
├── domainEngineApi.ts
└── types.ts
```

### 14.1 列表页

每张卡片展示：

- 业务名称和领域分类；
- 可用状态；
- 来源标签：内置 / MCP / 插件 / 远程；
- 可用工具数和能力数；
- 版本或运行时；
- 一条最重要的错误或警告。

默认按领域分组，支持搜索名称、能力和工具。不要默认展示 Python 包列表。

### 14.2 详情抽屉

详情分为：

1. 概览：描述、来源、版本、运行时和状态。
2. 能力：业务能力及可用性。
3. 工具：真实 Tool Registry 名称、启用状态和访问策略摘要。
4. 实现与依赖：MCP Driver、Python 包、Java Runtime 等技术信息。
5. 问题处理：刷新检测、打开 MCP、打开内置工具等安全导航动作。

### 14.3 多视图一致性

- NeqSim 在 MCP 页被停用后，领域卡片下一次刷新显示“不可用”。
- 领域卡片的“配置”进入原生 MCP 页，不提供第二套开关。
- 内置工具被禁用后，对应 capability 显示降级或不可用。
- 切换当前专家时清理领域引擎状态缓存，并携带新的 `X-Agent-Id` 查询。

## 15. 缓存与并发

- descriptor 注册表常驻内存，插件注册完成后视为只读。
- 动态 probe 结果按 `(agent_id, engine_id)` 缓存，建议 TTL 30 秒。
- 列表请求不得为每个引擎串行启动昂贵进程；Provider probe 应并发且有超时。
- MCP 详情优先读取已有 Driver/Tool 状态，不为展示页面主动重启 Server。
- `POST /probe` 可绕过缓存，但同一 key 使用 single-flight，避免重复探测。
- Driver、Tool 或 Agent 切换事件可主动失效相关缓存。

## 16. 安全与治理

1. Registry 不保存 token、密码、env 值和 OAuth 凭据。
2. 列表/详情 API 对敏感路径和环境变量进行脱敏。
3. 所有计算仍经过 Tool Registry 和现有审批机制。
4. Probe 必须只读；不得静默安装依赖或修改用户配置。
5. 内置工具文件访问必须受 workspace 与沙箱约束。
6. 远程 Provider 必须复用 QwenPaw 的凭据和网络治理能力。
7. 输出记录引擎版本、方法、单位、假设和警告，保证科学可追溯性。
8. 计算结果不因前端展示需要而成为第二份执行真相。

## 17. 可观测性

统一记录以下事件：

- `domain_engine.registered`
- `domain_engine.registration_conflict`
- `domain_engine.probe_started`
- `domain_engine.probe_completed`
- `domain_engine.tool_binding_missing`
- `domain_engine.tool_binding_ambiguous`
- `domain_engine.invocation`（只记录工具与状态，不记录敏感输入）

建议指标：

- probe 成功率与耗时；
- 各状态引擎数量；
- capability 可用率；
- 工具绑定失败数；
- Provider 启动失败数；
- 按引擎统计的调用成功率和耗时。

## 18. 持久化与版本

领域引擎 descriptor 由代码或插件 manifest 声明，不作为用户 CRUD 配置写入现有 `ugsci/engines/*.json`。

用户可配置内容仍保存在其原所有者：

- MCP/Driver 配置：QwenPaw Driver store。
- 内置工具启停：QwenPaw 工具配置。
- 技能安装和启用：skill pool / workspace。
- 仿真软件可执行文件配置：现有 UGSci engine store。

所有 descriptor 和 API 响应包含 `schema_version`。读取方必须忽略未知字段；破坏性字段变更才增加主版本。

## 19. 与现有仿真引擎的边界

短期保留两套内部模型：

- `EngineInfo`：仿真软件检测、路径、许可证、模块和作业启动。
- `DomainEngineDescriptor`：领域内核声明、Provider、依赖、能力和工具关联。

二者在 UI 中同属“引擎”，但不应为了表面统一而立刻合并。后续可抽取共同的只读 `EngineView`：

```typescript
interface EngineView {
  id: string;
  name: string;
  kind: "simulator" | "domain_compute" | "runtime";
  source: string;
  status: string;
  description: string;
  providedTools: ToolReference[];
}
```

该 View 只服务于统一发现，不取代各自的领域模型和管理 API。

## 20. 实施计划

### M0：契约与骨架

- 新增领域模型、Registry、Contributor 和 Resolver 接口。
- 新增只读列表、详情与 probe API。
- 建立冲突检测、缓存和错误模型。
- 前端替换空状态，能展示 mock/builtin descriptor。

### M1：首批三类引擎

- NeqSim Contributor 对接现有 `neqsim` Driver。
- 测井数据处理 Contributor 与稳定工具包装器。
- 递减分析 Contributor 与稳定工具包装器。
- 完成依赖探测、工具绑定和详情展示。

### M2：技能与专家关系

- 技能声明 `required_capabilities` 与 `optional_capabilities`。
- 专家页展示已装配能力和缺失依赖。
- 根据可用 Provider 为技能解析工具候选。

### M3：统一发现

- 工具、引擎、技能跨类型搜索。
- 展示“引擎提供工具—技能依赖能力—专家装配技能”关系。
- 增加最近使用、推荐和故障处理入口。

## 21. 迁移方案

1. 保持 `/ugsci/engines/*` 及 `EngineSection` 行为不变。
2. 新增 `/ugsci/domain-engines/*`，不修改已有仿真记录格式。
3. 将 `DomainComputeSection` 的空状态替换为新列表组件。
4. NeqSim 继续由 core 的 builtin MCP 模块注册；UGSci 只增加引用它的 Contributor。
5. 为测井和递减分析先注册领域工具，再注册 descriptor，避免页面显示“可用”但工具不存在。
6. 若领域模块关闭或 UGSci 被卸载，注销 descriptor 与插件工具；不得删除用户 Driver 配置。
7. 保留 MCP、Tools、ACP 原生页面以及旧 UGSci 路由。

## 22. 测试策略

### 22.1 单元测试

- descriptor Schema 校验和版本兼容。
- Registry 幂等、ID 冲突与注销。
- ToolBinding 精确匹配、缺失和歧义。
- capability 按 required/optional 聚合状态。
- Provider/Dependency 状态到 EngineAvailability 的映射。
- 缓存按 Agent 隔离和失效。

### 22.2 集成测试

- NeqSim Driver 存在、禁用、连接失败、工具缺失等状态。
- 内置库部分依赖缺失时测井引擎降级可用。
- 内置工具禁用后 capability 状态同步。
- UGSci 卸载后 descriptor 和插件工具消失，但 Driver 配置保留。
- 同名工具已由其他插件注册时不覆盖。

### 22.3 前端测试

- 分类、搜索、状态和来源标签。
- Agent 切换后重新查询且无缓存串用。
- NeqSim 配置动作正确进入 MCP 管理视图。
- 空列表、部分失败和 API 整体失败的不同展示。
- 详情中的工具数量与 API 一致。

### 22.4 科学计算回归

- 使用固定 LAS 样例验证读取、单位和缺失值处理。
- 使用合成 Arps 数据验证参数恢复与 EUR。
- 使用固定 NeqSim case 验证 flash/PVT 结果容差。
- 每个算法记录参考数据、允许误差、依赖版本和单位。

## 23. 验收标准

1. “领域计算”页面真实展示已注册引擎，不再依赖前端静态列表。
2. NeqSim 同时可在 MCP 管理页和领域计算页发现，配置只有 Driver 一份。
3. 测井与递减分析以业务能力名称展示，不直接以 Python 包名展示。
4. 每个引擎详情能追溯到实际 Provider、工具、版本和依赖。
5. 页面显示的工具可用性与当前 Agent 的 Tool Registry 一致。
6. 任一 Provider 失败不影响 UGSci 其他模块启动。
7. 工具调用继续经过现有审批、沙箱和访问策略。
8. 切换 Agent 后状态与权限不会串用。
9. UGSci 卸载不会删除用户自行配置的 MCP Driver。
10. 仿真引擎现有检测、配置和作业功能无回归。

## 24. 架构决策记录

### ADR-001：领域计算是业务视图，不是工具来源

**决定**：使用 `category=domain_compute` 与 `source=builtin|plugin|mcp|remote` 两个正交维度。  
**原因**：用户按问题寻找能力，平台按来源管理生命周期。  
**后果**：同一能力可同时出现在领域页和 MCP/工具管理页。

### ADR-002：不复用仿真 EngineInfo 作为领域引擎模型

**决定**：首阶段新增 `DomainEngineDescriptor`。  
**原因**：现有模型以 executable、install_dir、license_server 为中心，不适合 MCP 和 Python 包。  
**后果**：短期双模型，长期通过只读 `EngineView` 聚合。

### ADR-003：执行真相保留在 Driver/Tool Registry

**决定**：UGSci Registry 不直接执行 MCP，也不复制工具 Schema。  
**原因**：避免绕过安全策略并消除状态双写。  
**后果**：领域状态依赖 Resolver 查询 QwenPaw 运行时。

### ADR-004：技能依赖 capability，而非库名

**决定**：技能逐步声明稳定 capability ID。  
**原因**：底层 Provider 可替换，技能工作流仍保持稳定。  
**后果**：需要 capability 到工具的确定性解析和缺失提示。

## 25. 建议目录结构

```text
plugins/bundle/ugsci/
├── domain_engine/
│   ├── __init__.py
│   ├── api.py
│   ├── models.py
│   ├── registry.py
│   ├── resolver.py
│   ├── health.py
│   └── contributors/
│       ├── __init__.py
│       ├── neqsim.py
│       ├── well_log.py
│       └── decline_analysis.py
├── domain_tools/
│   ├── well_log/
│   │   ├── adapters.py
│   │   ├── models.py
│   │   └── tools.py
│   └── decline/
│       ├── models.py
│       ├── algorithms.py
│       └── tools.py
└── ui/src/domain-engine/
    ├── DomainEngineSection.ts
    ├── DomainEngineCard.ts
    ├── DomainEngineDetail.ts
    ├── DomainEngineFilters.ts
    ├── domainEngineApi.ts
    └── types.ts
```

`domain_tools` 存放稳定的业务工具包装器；第三方库适配器留在各子域内部。`domain_engine` 只负责注册、解析和聚合，不承载具体科学算法。

