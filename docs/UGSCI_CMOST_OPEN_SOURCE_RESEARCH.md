# CMOST 能力拆解与开源方案评估

## 1. CMOST 应拆成哪些能力

CMOST 类产品的核心不是某个优化算法，而是围绕数值模拟器的研究编排层：

1. **模型与案例管理**：基准模型、版本、脚本、参数化和运行环境。
2. **实验设计（DOE）**：全因子、部分因子、随机、Latin Hypercube、空间填充设计。
3. **批量运行编排**：并行提交、队列、失败重试、许可证和资源管理。
4. **历史拟合**：观测数据、误差函数、参数更新、迭代停止条件和拟合诊断。
5. **不确定性分析**：realizations、概率分布、P10/P50/P90、预测带和风险统计。
6. **敏感性分析**：局部/全局敏感性、tornado、Sobol、响应面。
7. **代理模型**：用批量模拟结果训练快速近似模型，并检测适用域。
8. **优化**：单目标、多目标、约束优化、Pareto 前沿和候选方案验证。
9. **结果分析**：曲线、地图、方案比较、质量控制和报告。

因此应建设一个独立的“模拟器无关的 Study/Run 平台”插件，再由 UGSci 把 Eclipse、CMG、NeqSim 和储气库确定性计算作为 Provider 接入。OPM Flow 和 ResInsight 暂不进入当前范围。

## 2. 开源项目评估

| 项目 | 能力 | 适合 UGSci 的位置 | 判断 |
|---|---|---|---|
| OPM Flow | 黑油/组分油藏模拟器、并行运行 | 远期模拟 Provider | 当前明确延期，不进入安装包 |
| ResInsight | 油藏结果查看、分析、脚本接口 | 远期结果分析 Provider | 当前明确延期，不进入安装包 |
| [ERT](https://github.com/equinor/ert) | Ensemble-based reservoir tool、历史拟合、不确定性、迭代工作流 | 历史拟合与 ensemble Provider | 石油领域最值得优先研究的参考实现 |
| [MRST](https://www.sintef.no/projectweb/mrst/) | MATLAB 油藏模拟研究工具箱 | 算法验证、教学和研究适配器 | 可作为研究 Provider，需考虑 MATLAB 运行时 |
| [Dakota](https://github.com/snl-dakota/dakota) | DOE、UQ、敏感性、优化、代理模型、并行实验 | 通用 Study Engine | 能力完整，适合作为可选后端 |
| [OpenMDAO](https://github.com/OpenMDAO/OpenMDAO) | 多学科设计、组件图、梯度/优化 | 复杂耦合优化 | 适合后期配产配注与地面系统耦合 |
| [SALib](https://github.com/SALib/SALib) | Sobol、Morris、FAST 等敏感性 | Sensitivity Provider | 轻量、成熟，建议直接采用 |
| [UQpy](https://github.com/SURGroup/UQpy) | 概率建模、采样、可靠性、不确定性 | Uncertainty Provider | 适合 Python 原生 Study |
| [SMT](https://github.com/SMTorg/smt) | 代理模型、采样、响应面 | Surrogate Provider | 适合批量模拟后的快速近似 |
| [pymoo](https://github.com/anyoptimization/pymoo) | NSGA-II、NSGA-III、约束和多目标优化 | Optimization Provider | 建议作为第一批优化后端 |
| [Optuna](https://github.com/optuna/optuna) | 黑盒调参、剪枝、分布式试验 | 单目标/参数优化 | 适合快速原型和代理模型优化 |
| [BoTorch](https://github.com/pytorch/botorch) | 贝叶斯优化、主动学习、多目标 | 高代价模拟优化 | 适合后期高成本实验设计 |
| [DVC](https://github.com/iterative/dvc) | 数据/模型版本和可复现实验 | Model/Artifact 版本层 | 可借鉴思想，核心元数据仍应由 UGSci 管理 |
| [MLflow](https://github.com/mlflow/mlflow) | 实验、参数、指标、模型登记 | Study 运行记录 | 可作为可选外部集成，不作为领域事实库 |

## 3. 推荐的组合，而不是全量引入

### 第一阶段（UGSci 原生）

- `SALib`：敏感性分析；
- `pymoo`：多目标、约束优化；
- `scipy.stats` + 自有采样层：分布和 Monte Carlo；
- `SMT`：代理模型；
- 现有 SQLite Run Repository：运行、事件、Artifact 和审计。

这些组件依赖轻、Python 兼容性好，适合桌面版和内置插件。

### 第二阶段（石油领域增强）

- ERT：ensemble、历史拟合和不确定性工作流；
- OPM Flow：开源模拟器 Provider；
- ResInsight：结果分析和脚本自动化；
- MRST：研究算法和教学案例。

它们都通过 `SimulationProvider` / `StudyProvider` 接入，不直接修改 Run Center 状态机。

### 第三阶段（高成本优化与生产化）

- BoTorch：代理模型主动学习和贝叶斯优化；
- Dakota：跨语言、跨模拟器的 DOE/UQ/优化后端；
- OpenMDAO：地质—油藏—地面多学科耦合；
- Dask/Ray：大规模 realization 并行。

## 4. ERT 值得重点借鉴的设计

ERT 对 UGSci 最有价值的不是界面，而是以下抽象：

- 一个基准模型派生大量 ensemble realization；
- 参数、观测数据、误差函数和工作流显式声明；
- 每个 realization 独立运行，失败样本可隔离；
- 通过迭代更新参数，而不是直接覆盖基准模型；
- 运行结果、日志和参数都能追溯；
- 工作流节点可以暂停、重启和继续。

UGSci 可采用兼容思想的 `Study + Realization + ForwardModel + Objective` 模型，但不应直接复制 ERT 的配置格式，以免被某一种模拟器绑定。

## 5. CMOST 能力在 UGSci 中的最终落点

```text
ModelVersion
  └── StudyRevision
      ├── ParameterSpace / Constraints
      ├── DesignOfExperiment
      ├── Realizations
      │   └── Run → Artifact / Metrics
      ├── SensitivityAnalysis
      ├── UncertaintyAnalysis
      ├── SurrogateModel
      ├── Optimization
      └── Comparison / Review / Report
```

商业模拟器和未来开源模拟器的差异只存在于 `ForwardModel Provider`。DOE、队列、检查点、指标、统计、比较和审计全部由独立 Run Center 提供；UGSci 只提供领域 Operation 和 Provider。

## 6. 采用边界

- 不把 CMOST、ERT、Dakota 或任何单一项目作为 Run Center 或 UGSci 的核心依赖；
- 不把代理模型输出直接当作最终工程结论，必须用真实模拟验证候选方案；
- 不允许优化器绕过单位、层系、压力口径和时间边界校验；
- 不允许批量运行直接覆盖基准模型；
- 不允许结果只保存为图表，必须保留结构化指标和 provenance；
- 商业模拟器的输入、许可证和运行日志继续由 Provider 隔离管理。

## 7. 结论与落地顺序

最现实的轻量路线是：

1. 先在独立 Run Center 插件中实现 `Study`、`ParameterSpace`、`Realization`、模型版本和指标比较；
2. 接入 `SALib`、`pymoo`、`SMT`，形成敏感性—不确定性—优化闭环；
3. 优先用现有 Eclipse/CMG/NeqSim Provider 做真实模拟，暂不引入大型开源模拟器；
4. 研究 ERT 的 ensemble 和历史拟合思想，先实现兼容的轻量 Study 接口；
5. 将 OPM Flow、ResInsight、Dakota、BoTorch、OpenMDAO 和 Ray/Dask 列为远期可选 Provider，不进入当前安装包和核心依赖。

## 8. 插件化后的最终分层

```text
QwenPaw
  ├── qwenpaw-run-center（独立基础插件）
  │   ├── Run Runtime
  │   ├── Model Registry
  │   ├── Study Engine
  │   ├── DOE/UQ/Sensitivity/Surrogate/Optimization
  │   ├── Queue/Scheduler/Executor
  │   └── 运行中心菜单与页面
  └── ugsci（领域插件）
      ├── Storage / Reservoir Operations
      ├── Eclipse / CMG / NeqSim Providers
      ├── Domain metrics and reports
      └── Expert / Skill / Viewer
```

Run Center 的公共契约建议拆成一个极轻量的 `run_center_contracts` 包或内置协议文件，只包含 JSON Schema、事件类型和客户端，不携带 SciPy、SALib、pymoo 或 SMT。研究依赖按 Study Provider lazy import。

## 9. 独立插件的发布和兼容

- Run Center 使用独立版本，例如 `0.x`，拥有自己的变更日志和迁移脚本；
- UGSci manifest 声明 `qwenpaw-run-center >= x.y` 为可选/推荐依赖；
- Operation Descriptor 带 `contract_version`，Run Center 对不兼容版本拒绝注册；
- Run Center 升级不得改变已完成 Run 的结果 schema；
- UGSci 可以独立升级领域 Provider，历史 Run 仍引用原 Provider 版本；
- Simple Mode 的菜单由 Run Center 自己注册，UGSci 只注册领域菜单。

## 10. 调整后的实施顺序

### R0：独立插件骨架

建立 `qwenpaw-run-center` manifest、菜单、健康检查、公共契约、只读 Run API 和空状态页面。

### R1：统一现有任务

把 UGSci `job_store`、可视化导入 Job 和 PawApp Task 映射到 Run Center；保留旧 API 兼容层。

### R2：轻量 Study 能力

实现 ModelVersion、Study、Realization、DOE、指标和方案比较；接入 SciPy、SALib、pymoo、SMT。

### R3：UGSci 储气库 Provider

将库存评价、库容评估、配产配注和方案优化注册为 UGSci Operation；结果统一回到 Run Center。

### R4：历史拟合与工程闭环

接入 ERT 的 ensemble/历史拟合思想，增加代理模型、候选方案验证和复核报告；仍不引入 OPM Flow 和 ResInsight。

### R5：远期外部 Provider

未来需要时再以可选插件接入 OPM Flow、ResInsight、Dakota、BoTorch、OpenMDAO 或 Ray/Dask。

## 11. 轻量版第一期详细方案

### 11.1 依赖边界

第一期只增加适合桌面部署的 Python 依赖：

- `SALib`：敏感性分析；
- `pymoo`：多目标和约束优化；
- `SMT`：代理模型；
- `scipy`：采样、统计和基础优化；
- 可选 `pandas`/`numpy`：结构化指标计算。

不引入 OPM、ResInsight、Dakota、OpenMDAO、Ray 或大型数据库。每个依赖都采用 lazy import，缺失时只禁用相应 Study 类型，不能阻止 UGSci 启动。

### 11.2 推荐目录

```text
ugsci/
  runtime/
    models.py             # Run、Stage、Event、Artifact
    repository.py         # SQLite/Postgres 抽象
    scheduler.py          # 队列、并发、资源租约
  model_registry/
    models.py             # Model、ModelVersion、ModelFile
    service.py            # 快照、diff、标签、冻结
  study/
    models.py             # Study、Revision、Parameter、Realization
    design.py             # DOE 与采样
    metrics.py            # 统一指标 schema
    compare.py            # 方案比较
    providers/
      uncertainty.py
      sensitivity.py
      surrogate.py
      optimization.py
  providers/
    forward_model.py      # Eclipse/CMG/NeqSim/确定性计算适配
```

### 11.3 Study 最小数据模型

```text
Study {
  study_id, project_id, model_version_id, revision
  type, status, objective_schema, constraint_schema
  parameter_space_ref, design_ref, budget, created_by
}

Realization {
  realization_id, study_id, sequence, seed
  parameter_values, run_id, status, metrics, failure_reason
}
```

`StudyRevision` 一旦产生运行就不可变。修改基准模型、参数范围、目标函数或约束时创建新 revision，不覆盖旧结果。

### 11.4 第一批 Study 类型

1. `scenario_compare`：手工定义 2—20 个方案，统一运行并比较；
2. `uncertainty`：输入分布 + Latin Hypercube/Monte Carlo + P10/P50/P90；
3. `sensitivity`：Morris/Sobol + tornado 和参数排名；
4. `optimization`：pymoo 约束优化 + 候选方案真实模拟验证；
5. `history_match_lite`：观测曲线、加权误差、参数迭代和拟合对比。

第一期不做自动地质建模、不做大型代理服务、不做跨机器分布式调度。

### 11.5 Forward Model 适配要求

所有模拟器或确定性计算都实现同一接口：

```python
class ForwardModel(Protocol):
    async def validate(self, model_version, parameters) -> ValidationReport: ...
    async def run(self, model_version, parameters, reporter) -> RunResult: ...
    def extract_metrics(self, artifacts) -> list[Metric]: ...
```

`run()` 只能使用模型版本快照和参数快照。它不能直接读取用户当前正在编辑的文件，也不能修改基准模型目录。

### 11.6 储气库首批指标

统一指标键建议包括：

- `effective_inventory`：有效库存量；
- `book_inventory`：账面库存量；
- `capacity_compliance`：库容符合率；
- `working_gas`：工作气量；
- `peak_daily_rate`：冲峰能力；
- `pressure_deviation`：压力偏差；
- `material_balance_error`：物质平衡误差；
- `history_match_rmse`：历史拟合 RMSE；
- `constraint_violation`：约束违规量；
- `run_cost`：运行耗时和资源成本。

每项指标必须带单位、时间边界、层系范围、统计方法和 provenance。

### 11.7 UI 最小闭环

第一期页面只需要四个核心区域：

- **模型**：版本、脚本、参数、diff、验证和冻结；
- **研究**：Study 创建、参数空间、实验设计和预算；
- **运行**：realization 队列、进度、日志、失败重试；
- **结果**：指标表、方案比较、敏感性图、不确定性分布和报告导出。

操作路径应保持为：

```text
选择模型版本 → 创建 Study → 定义参数/约束
→ 生成实验点 → 批量运行 → 查看指标
→ 敏感性/不确定性 → 优化候选 → 真实模拟验证 → 导出报告
```

### 11.8 第一阶段验收

- 同一模型版本和 Study revision 可完整复现；
- 批量运行中单个 realization 失败不会丢失其他结果；
- 中断后能从未完成 realization 继续；
- P10/P50/P90 能显示样本量、随机种子和失败比例；
- 敏感性分析能回指具体参数和模型版本；
- 优化器输出的每个候选方案都能链接到真实验证 Run；
- 结果比较能同时展示数值、单位、约束、假设和数据缺口；
- 缺少 SALib/pymoo/SMT 时，基础运行中心和确定性计算仍可用。

