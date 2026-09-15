# UGSci 运行中心架构设计

> 状态：架构基线 / 设计提案
> 目标：将运行中心建设为 UGSci 的基础核心能力，为仿真、库存评价、库容评估、配产配注、方案优化和批量研究提供统一运行时。

## 1. 核心定位

运行中心不是 UGSci 内部的一个“模拟任务列表”页面，而是一个可独立安装、独立升级、供多个领域插件复用的计算运行时插件（Run Runtime Plugin）。

```text
QwenPaw 平台
  ├── Run Center 插件（基础设施）
  │   ├── Run API / 状态机 / 事件总线
  │   ├── 调度器 / 队列 / 资源与许可证
  │   ├── 执行器与 Artifact / Provenance
  │   └── 运行中心侧边菜单（Simple Mode 可见）
  └── UGSci 插件（领域能力）
      ├── 储气库 / 油藏 Operation Provider
      ├── Eclipse / CMG / NeqSim Provider
      └── UGSci 专家、技能和可视化页面

UGSci 工作台通过公共契约调用 Run Center：
  └── Run Center
      ├── Run API / 状态机 / 事件总线
      ├── 调度器 / 队列 / 资源与许可证
      ├── 执行器（进程、Python、Java、远程、容器）
      ├── Artifact 与数据血缘
      ├── 检查点、恢复、重试、取消
      └── Provider Adapter
          ├── Eclipse / CMG / COMSOL / NeqSim
          ├── 库存评价 / 库容评估
          ├── 配产配注 / 方案优化
          └── 文件导入 / 质量检查 / 报告生成
```

所有长任务都应拥有同一个 `run_id`、统一状态、统一事件格式和统一产物引用。领域模块只实现计算逻辑，不自行实现队列、SSE、重试或持久化。Run Center 不依赖 UGSci；UGSci 依赖 Run Center 的稳定 API。

## 1.1 插件边界

建议插件 ID 为 `qwenpaw-run-center`，显示名称为“运行中心”。它属于平台基础设施类插件，不放入 UGSci 的发布包。

### Run Center 负责

- Run、Stage、Event、Artifact、Checkpoint、Provenance 的持久化；
- Operation Registry、队列、调度、资源租约和执行器；
- 创建、暂停、恢复、取消、重试、克隆、重启恢复；
- 统一 HTTP API、SSE 事件流和运行中心 UI；
- 通用模型版本引用、Study 执行骨架和指标索引。

### UGSci 负责

- 储气库、油藏、井筒、PVT、库存评价和库容评估的 Operation；
- Eclipse、CMG、NeqSim 等领域 Provider；
- 石油领域参数 schema、指标 schema、报告模板和专家技能；
- UGSci 专家中心、技能市场和油气 Viewer。

### 明确禁止

- Run Center 导入 UGSci 模块；
- UGSci 自建第二套任务状态或事件总线；
- 通过前端私有 API 直接修改对方数据库；
- UGSci 卸载时删除仍被 Run 引用的 Artifact 和模型版本。

## 1.2 插件协作方式

采用“声明注册 + 公共 API + 能力事件”三种机制：

1. UGSci 启动时向 Run Center 注册 Operation Descriptor 和 Provider Descriptor；
2. Run Center 只保存 descriptor，不加载领域实现，执行时通过插件路由回调；
3. UGSci 从 Run Center 查询运行、事件和产物；
4. UGSci 页面通过 `run_id` 深链接打开运行中心详情；
5. Run Center 不认识“库存评价”业务，只展示 descriptor 提供的标题、阶段和指标。

如果 Run Center 未安装，UGSci 的短时确定性工具仍可运行；所有长任务入口应显示“需要运行中心插件”，并提供安装/启用提示。

## 1.3 菜单和 Simple Mode

Run Center 注册平台菜单项 `core.run-center`，显示名称“运行中心”，图标使用队列/活动类通用图标。

- **Simple Mode**：运行中心必须显示，作为唯一长任务入口；UGSci 不再重复显示仿真任务菜单；
- **Full Mode**：运行中心显示，UGSci 可保留领域快捷入口；
- UGSci 的“启动模拟”“批量研究”“库存评价”按钮统一跳转到运行中心详情；
- 菜单项即使没有运行记录也应可打开，展示能力、队列和安装状态。

## 2. 设计原则

1. **Run 是持久事实**：内存任务、SSE 和前端页面都只是 Run 的观察层。
2. **领域无关、能力声明**：运行中心不理解“库存”或“井网”业务，通过 Operation/Provider 契约扩展。
3. **确定性与智能体分离**：计算器产生事实，Agent 负责解释、编排和建议，不能修改计算结果。
4. **输入不可变、输出可追溯**：每次运行锁定输入快照、代码版本、Provider、单位和环境。
5. **可恢复优先**：进程重启、网络断开、Worker 崩溃和许可证暂时不可用都不能丢失 Run。
6. **安全边界内置**：工作区路径、命令、资源和权限由服务端解析，客户端只能提交引用和参数。

## 3. 统一领域模型

### 3.1 Run

```text
Run {
  run_id, project_id, parent_run_id, idempotency_key
  operation: "storage.inventory.evaluate"
  provider_id, provider_version
  status, phase, progress, priority
  input_snapshot, parameter_schema, unit_system
  requested_by, created_at, started_at, finished_at
  retry_policy, resource_request, checkpoint_ref
  result_ref, error_ref, provenance_ref
}
```

`operation` 使用稳定的反向域名命名，避免把 Python 函数名或工具名当作公共 API。一个用户动作可以创建 Run Graph：

```text
导入数据 → 数据质量检查 → 库存评价 → 库容评估 → 配产配注 → 方案优化 → 报告
```

### 3.2 Run 状态

```text
draft → queued → preparing → running → finalizing → succeeded
                         ├→ paused → queued
                         ├→ cancelling → cancelled
                         ├→ retry_wait → queued
                         └→ failed / blocked
```

状态转换只能由服务端状态机执行，并记录操作者、原因和事件序号。`blocked` 表示需要用户修复输入、依赖或许可证；不能把它伪装成普通失败。

### 3.3 Stage 与 Checkpoint

每个 Run 可包含有序或 DAG 阶段。阶段必须声明输入、输出、可重跑性和检查点策略：

```text
Stage { stage_id, operation, status, progress, attempt,
        input_refs, output_refs, checkpoint_ref, metrics, warnings }
```

库存评价可以按“读取周期数据 → 单位/口径校验 → 分层计算 → 指标汇总 → 复核包”拆分；方案优化可以按“生成方案 → 约束筛选 → 模拟评估 → 目标函数 → 排序”拆分。失败后只重跑失败阶段及其下游。

### 3.4 Artifact、Dataset 与 Provenance

运行中心统一管理三类引用：

- `DatasetRef`：原始数据或不可变输入快照；
- `ArtifactRef`：结果表、曲线、网格、日志、图表和报告；
- `ProvenanceRef`：输入指纹、单位、坐标系、Provider、软件版本、环境和审计事件。

结果不能只返回大 JSON。应返回小型摘要加 Artifact 引用，前端按需读取大文件。

## 4. 执行架构

### 4.1 Operation Contract

每个领域能力注册一个 Operation Descriptor：

```python
class Operation(Protocol):
    descriptor: OperationDescriptor
    async def validate(self, ctx, request) -> ValidationReport: ...
    async def estimate(self, ctx, request) -> ResourceEstimate: ...
    async def execute(self, ctx, request, reporter) -> OperationResult: ...
    async def resume(self, ctx, checkpoint, reporter) -> OperationResult: ...
```

Descriptor 至少包含输入/输出 JSON Schema、单位要求、是否确定性、是否支持暂停、资源类型、所需 Provider 和风险级别。这样未来新增“配产配注”只需注册 Operation，不需要修改运行中心。

### 4.2 Executor 类型

统一接口下提供四类执行器：

1. `InProcessExecutor`：轻量确定性计算；
2. `ProcessExecutor`：Eclipse、CMG、COMSOL 等本地进程；
3. `RemoteExecutor`：远程服务器、集群或 HPC；
4. `ContainerExecutor`：可复现的容器化环境。

执行器必须支持心跳、优雅取消、超时、stdout/stderr 分流、资源采样和退出原因分类。

### 4.3 调度器

调度键为 `project_id + resource_pool + provider_id`，支持：

- 项目级并发额度；
- CPU、内存、GPU、磁盘和临时空间配额；
- 软件许可证槽位；
- 优先级、FIFO 和公平队列；
- 依赖 Run 完成后自动解锁；
- 预估耗时和资源不足时提前阻塞。

## 5. 储气库领域的扩展方式

运行中心不把储气库指标硬编码进状态机，而由领域 Operation 提供业务 schema。

首批建议注册：

| Operation | 典型阶段 | 输出 |
|---|---|---|
| `storage.inventory.accounting` | 注采计量校验 → 账面库存 | 账面库存、单位与边界 |
| `storage.inventory.effective` | 分层口径校验 → p/Z → 汇总 | 分层有效库存、告警 |
| `storage.inventory.evaluate` | 有效库存 → 库容符合率 → 冲峰指标 | 综合评价复核包 |
| `storage.capacity.evaluate` | 压力边界 → 孔隙体积 → 约束检查 | 工作气、垫底气、设计库容 |
| `storage.injection_allocation.optimize` | 约束建模 → 候选方案 → 目标评估 | 配注方案及约束解释 |
| `storage.production_allocation.optimize` | 峰值需求 → 井组能力 → 方案排序 | 配产方案、可行性 |
| `storage.scenario.optimize` | 参数扫描/代理模型 → 多目标排序 | Pareto 方案集 |

每个 Operation 都必须显式声明压力口径、标准状态、时间边界、层系范围和单位。库存评价的“计算建议待复核”应是结果状态，而不是 Run 的成功/失败状态；业务审批另建 Review 记录并绑定输入指纹。

## 6. 事件与实时观察

持久事件采用单调序号：

```json
{
  "seq": 42,
  "run_id": "...",
  "type": "stage.progress",
  "ts": "2026-09-05T...Z",
  "stage_id": "layer-calculation",
  "data": {"progress": 0.63, "layer": "E1-2z21"}
}
```

事件写入 SQLite/Postgres 后再广播 SSE。客户端带 `after_seq` 重连，服务端先回放缺失事件，再发送实时事件。日志、指标、警告和结果引用都使用同一事件流；SSE 断开不影响执行。

## 7. API 边界

```text
POST /api/ugsci/runs
GET  /api/ugsci/runs?project_id=&status=&operation=
GET  /api/ugsci/runs/{run_id}
GET  /api/ugsci/runs/{run_id}/events?after_seq=
POST /api/ugsci/runs/{run_id}/pause
POST /api/ugsci/runs/{run_id}/resume
POST /api/ugsci/runs/{run_id}/cancel
POST /api/ugsci/runs/{run_id}/retry
POST /api/ugsci/runs/{run_id}/clone
GET  /api/ugsci/runs/{run_id}/artifacts
GET  /api/ugsci/operations
GET  /api/ugsci/resource-pools
```

创建接口接受 `operation`、输入 Artifact 引用和参数，不接受任意本机绝对路径或任意 shell 命令。所有写操作带 `Idempotency-Key`，避免前端重试产生重复运行。

## 8. 存储与部署

第一阶段继续使用现有 SQLite `job_store`，扩展为明确的 Repository 接口；事件、阶段、Artifact、锁和检查点逐步从 JSON payload 中拆成表。单机桌面版使用 WAL；服务器版支持 PostgreSQL 和对象存储，接口不变。

建议表：`runs`、`run_stages`、`run_events`、`run_artifacts`、`run_checkpoints`、`operation_registry`、`resource_leases`、`reviews`。

## 9. 与现有代码的迁移

1. 新建 `ugsci/runtime/`：`models.py`、`repository.py`、`state_machine.py`、`events.py`、`scheduler.py`、`executors/`、`operations.py`。
2. 将现有 `job_store.py` 包装为 `SimulationJobRepository`，保留旧函数名。
3. 将可视化 `JobManager` 改为 `RunExecutor` 的适配器，保留导入 API。
4. 将 `launch_simulation` 改成创建 `simulation.run`，旧返回结构继续兼容。
5. PawApp `TaskManager` 只做 UI/SSE 观察层，通过 `run_id` 订阅，不再保存第二份任务事实。
6. 前端新增“运行中心”页面，旧仿真页、导入页和工作流页改为跳转或嵌入详情。

## 10. 分阶段实施

### M0：契约和只读中心

建立 Run/Stage/Event/Artifact 模型、Operation Registry 和统一查询 API；把现有仿真 Job、导入 Job 映射成只读 Run。

### M1：统一执行与控制

接入创建、取消、重试、克隆、SSE 回放、服务重启恢复和资源心跳；先覆盖 `launch_simulation` 与文件导入。

### M2：确定性储气库计算

接入库存评价、库容评估和复核包导出；每个结果自动生成 provenance 和 replay token。

### M3：队列与方案优化

增加配产配注、批量场景、参数扫描、多目标优化、项目配额和许可证调度。

### M4：远程运行与生产化

接入远程/HPC/容器执行器、PostgreSQL、对象存储、团队权限和运行成本统计。

## 11. 验收标准

- QwenPaw 重启后，运行中的 Run 可恢复或明确变为 `blocked`，没有“幽灵任务”；
- SSE 断线重连后事件不丢、不重复，结果可继续读取；
- 同一 `Idempotency-Key` 不会创建两个 Run；
- 取消不会被迟到的 Worker 覆盖为成功；
- 任一储气库结果可追溯到输入指纹、单位、层系、压力口径、Provider 和代码版本；
- 失败时能区分输入错误、依赖缺失、许可证错误、超时、进程崩溃和系统资源不足；
- 新增一个领域 Operation 不需要修改运行中心状态机和前端核心代码。

## 12. 模型资产与版本管理

运行中心必须区分 **模型（Model）**、**模型版本（ModelVersion）** 和 **运行（Run）**：

```text
Model（一个油藏/储气库/井网模型）
  ├── v1：基准模型
  ├── v2：更新地质参数
  └── v3：调整井控策略
       └── Run / Study / Report
```

模型版本是不可变快照，不能在原版本上直接覆盖。每个版本应包含：

- 主控脚本、输入 deck、配置文件和依赖清单；
- 文件清单、SHA-256 指纹和目录结构；
- 网格、岩石物性、PVT、井控、边界条件等结构化参数；
- 使用的软件、Provider、版本和许可证要求；
- 创建人、创建时间、变更说明和父版本；
- 验证状态、质量检查报告和适用范围；
- 可运行平台及资源需求。

建议模型仓库采用“内容寻址 Artifact + 元数据数据库”设计。大文件放对象存储或工作区文件系统，数据库只保存版本清单和引用。支持：

- 创建版本、分支、标签和发布；
- 两个版本的 deck/参数/结果 diff；
- 从任意历史版本复制研究；
- 版本冻结和审批；
- 模型版本与 Run、Study、报告双向追溯；
- 基准案例（golden case）回归运行。

脚本管理也属于模型资产的一部分。脚本必须经过语法检查、依赖检查、干跑验证和输入 schema 校验后，才允许提交运行。运行时使用锁定的脚本快照，避免用户修改文件后导致运行结果无法复现。

## 13. Study：类似 CMOST 的研究试验层

在 Model 和 Run 之间增加 `Study`。Study 表示一个工程问题，而不是一次计算：

```text
Study
  ├── 基准模型版本
  ├── 参数空间与约束
  ├── 目标函数
  ├── 实验设计（DOE）
  ├── 候选方案 / realizations
  ├── 批量 Run
  ├── 代理模型
  └── 比较、敏感性和推荐结果
```

Study 类型建议包括：

- `scenario_compare`：多方案并排比较；
- `sensitivity`：单因素、局部、全局敏感性；
- `uncertainty`：随机变量、Monte Carlo、P10/P50/P90；
- `history_match`：历史拟合和参数校准；
- `optimization`：约束下的单目标或多目标优化；
- `forecast`：多 realizations 预测和风险带。

Study 自身也要版本化。修改参数范围、目标函数、约束或模型版本后生成新的 Study revision，旧结果保持可读。

## 14. 参数、方案和实验设计

参数不能只以自由 JSON 保存，应有类型化定义：

```text
Parameter {
  key, label, unit, type, baseline
  lower, upper, distribution
  correlation_group, mutable_scope
  constraints, source, description
}
```

`mutable_scope` 用于限制参数只能作用于某个层系、井组、时间段或 deck 关键字。所有参数写入前执行单位、范围、相关性和业务约束检查。

实验设计引擎至少支持：

- 全因子、部分因子和 Latin Hypercube；
- Sobol 序列和随机采样；
- 分层/相关变量采样；
- 试验点去重和断点续跑；
- 失败 realization 隔离，不阻塞整批研究；
- 批量运行预算和并发控制。

每个 realization 都是一个可追溯的子 Run，记录参数快照、随机种子、父 Study 和输出指标。

## 15. 不确定性与敏感性分析

运行中心不直接解释工程含义，而负责生成可复现的统计结果：

- P10/P50/P90、均值、标准差、置信区间；
- 生产曲线、库存、压力、冲峰能力等指标的概率带；
- Morris、Sobol、Permutation、基于回归的敏感性；
- tornado 图、蜘蛛图、散点矩阵和参数-目标响应面；
- 参数相关性、失效比例和数据覆盖度；
- 结果按模型版本、方案、层系和时间段切片。

不确定性结果必须区分“输入分布导致的范围”和“模型误差导致的范围”，并显示样本量、随机种子、收敛情况和失败样本。样本不足时返回警告，不生成看似精确的百分位数。

## 16. 多方案比较与决策分析

新增统一的 Comparison 服务，将不同 ModelVersion、Study 或方案的结果映射到同一指标 schema：

```text
Metric { key, label, value, unit, time_basis, uncertainty, provenance }
```

支持：

- 基准方案与候选方案对比；
- 井组、层系、周期和全库多个维度对比；
- 绝对差、相对差和达标率；
- 目标函数、约束违规和运行成本并排显示；
- 方案排名、Pareto 前沿和人工标记；
- 直接生成带证据引用的工程比较报告。

比较服务不应只比较最终数值，还要比较输入差异、运行状态、失败样本、假设和数据缺口。

## 17. 历史拟合、代理模型和优化闭环

参考 CMOST 类产品的思路，但保持 UGSci 的开放 Provider 架构：

```text
历史数据 → 质量检查 → 基准运行 → 参数化 → DOE 批量运行
        → 误差计算 → 敏感性筛选 → 代理模型
        → 优化/历史拟合 → 候选验证运行 → 方案比较与推荐
```

代理模型应作为可选 Study 阶段，而不是替代真实模拟。每个代理模型记录训练数据版本、特征、算法、误差指标和适用域；超出适用域必须回退真实运行。

优化器通过统一接口接入，可支持遗传算法、贝叶斯优化、NSGA-II 和约束优化。目标函数与约束必须声明单位、方向、惩罚策略和业务解释。优化输出只能标记为“候选建议”，不能自动写入生产模型或自动批准配产配注方案。

## 18. 对运行中心 UI 的补充

运行中心建议分为四个视图：

1. **运行**：队列、进度、日志、资源、取消、重试和恢复；
2. **模型**：模型版本、脚本、参数、diff、标签和验证状态；
3. **研究**：Study、DOE、realization、敏感性、不确定性和优化；
4. **比较**：方案对比、Pareto、指标趋势、证据和报告。

用户从模型版本发起运行，从 Study 发起批量运行，从比较页面回到具体 realization 和 Artifact。四个视图共享 `run_id`、`model_version_id`、`study_id` 和 `artifact_id`，避免页面之间出现第二套状态。

## 19. 新增核心表

在原有表基础上增加：

`models`、`model_versions`、`model_files`、`model_parameters`、`studies`、`study_revisions`、`parameter_sets`、`design_points`、`realizations`、`metrics`、`comparisons`、`surrogate_models`、`reviews`。

这些表都应带 `project_id`、版本号、创建者、时间戳和 provenance 引用。删除采用软删除；已被 Run 或报告引用的版本禁止物理删除。
