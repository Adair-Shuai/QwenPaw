# 石油领域 Agent 平台调研与架构思考总结

> 调研与讨论时间：2026-08-08 ～ 2026-08-09
> 状态：阶段性研究总结，可作为产品架构、MVP 规划和后续技术设计的基线
> 适用项目：QwenPaw 石油勘探开发与地下储气库 Agent 平台

## 目录

- [1. 执行摘要](#1-执行摘要)
- [2. 项目背景与当前基础](#2-项目背景与当前基础)
- [3. NeqSim 资产调研](#3-neqsim-资产调研)
- [4. 核心判断：Agent 不是越多越好](#4-核心判断agent-不是越多越好)
- [5. 确定性工程工具层与 MCP 方案](#5-确定性工程工具层与-mcp-方案)
- [6. 跨行业垂直 Agent 平台调研](#6-跨行业垂直-agent-平台调研)
- [7. Cognite 的工业上下文结构](#7-cognite-的工业上下文结构)
- [8. Palantir 的工作流与动作治理结构](#8-palantir-的工作流与动作治理结构)
- [9. 面向石油领域的融合架构](#9-面向石油领域的融合架构)
- [10. 油气领域对象模型](#10-油气领域对象模型)
- [11. 地下储气库能力包](#11-地下储气库能力包)
- [12. Agent、Tool、Workflow、Action 的边界](#12-agent-tool-workflow-action-的边界)
- [13. 工程可信性与安全治理](#13-工程可信性与安全治理)
- [14. 产品化与 MVP 路线](#14-产品化与-mvp-路线)
- [15. 建议的目录和技术组织方式](#15-建议的目录和技术组织方式)
- [16. 讨论演进与关键思考记录](#16-讨论演进与关键思考记录)
- [17. 参考资料与仓库链接](#17-参考资料与仓库链接)

---

## 1. 执行摘要

本次讨论形成的总判断是：

> 石油 Agent 平台不应被设计成“拥有很多石油 Agent 的聊天机器人”，而应被设计成“油气工程对象模型 + 确定性计算工具 + 场景工作流 + Agent 编排 + 工程治理”的一体化工作台。

建议的能力分工如下：

| 层级 | 主要职责 | 推荐做法 |
|---|---|---|
| 数据与对象层 | 表示油藏、井、设施、管线、储气库及其关系 | 建立油气领域本体和统一对象模型 |
| 确定性工具层 | 执行物性、井筒、管流、设施、储层和经济计算 | 以 NeqSim MCP 为起点，继续接入其他计算引擎 |
| Agent 层 | 理解问题、提取参数、选择工具、解释结果 | 以任务和场景为入口，而不是暴露大量 Agent 名称 |
| 工作流层 | 固化专业计算顺序、依赖和检查点 | 用 DAG/Workflow 编排，避免 LLM 任意改变计算路径 |
| Action 层 | 创建场景、提交审核、发布结果、触发通知 | 采用前置条件、权限、审批、审计和回滚机制 |
| 治理层 | 保证工程结果可复现、可审查、可追责 | 保存输入、假设、版本、结果、警告和审批记录 |

外部产品中，最值得组合借鉴的是：

- **Cognite**：工业数据上下文、知识图谱、低代码 Agent 工作台。
- **Palantir**：Ontology、Action、提交条件、工作流、人工审批和运营治理。
- **Harvey**：把专家知识封装成端到端专业工作流。
- **Abridge**：围绕完整业务过程，而不是单个 Agent 功能设计产品。
- **Microsoft Security Copilot**：把 Agent 嵌入已有工具和事件处理链路。
- **GitHub Copilot cloud agent**：隔离执行、测试、版本、审查和指标闭环。
- **AlphaSense**：高质量垂直数据、证据链、逐句引用和研究到交付物的闭环。

最终建议可以概括为：

> 以 NeqSim 为第一个工程计算引擎，以油气本体为上下文底座，以工作流作为产品入口，以 Action 和审批作为治理边界，以地下储气库形成差异化能力。

---

## 2. 项目背景与当前基础

### 2.1 目标

目标是打造石油领域 Agent 平台，提供开箱即用的石油工程功能，并在以下方向深度融合：

- 石油勘探
- 地质与地球物理
- 钻井与完井
- 储层工程
- 生产工程
- 地面工艺与设施
- 流动保障
- 资产经济评价
- 地下储气库

### 2.2 当前基础

目前已经通过内置 MCP 的方式把 NeqSim 打包进软件，后续希望继续增加其他内置工具，以实现确定性计算过程。

这意味着项目已经具备“工程计算工具层”的起点，但要形成完整产品，还需要补齐：

1. 油气工程对象模型；
2. 工具注册和统一调用协议；
3. 工程工作流编排；
4. 计算结果和场景管理；
5. 工程审批、审计和版本治理；
6. 勘探开发及地下储气库专用能力。

### 2.3 NeqSim 在全生命周期中的定位

~~~text
勘探/地球物理 → 钻井 → 测井
       ↓             ↓
储层表征 → PVT/流体物性 ← NeqSim → 开发方案
       ↓             ↓
流动保障 → 工艺设施/过程模拟 ← NeqSim → 生产优化
       ↓             ↓
管道/海底 → 经济评价 → 资产决策
~~~

NeqSim 重点覆盖：

- PVT 与流体物性；
- 热力学和相态；
- 过程模拟；
- 分离、压缩和气体处理；
- 部分流动保障和设施筛选能力。

因此，NeqSim 是很好的工程能力底座，但不是完整的石油平台。

---

## 3. NeqSim 资产调研

### 3.1 NeqSim Community Agents

Equinor 公开维护的 [equinor/neqsim-community-agents](https://github.com/equinor/neqsim-community-agents) 提供了 40+ 个石油工程 Agent，按工程环节覆盖：

| 工程环节 | 代表 Agent |
|---|---|
| PVT/流体 | pvt-agent、fluid-characterization-agent、e300-fluid-agent |
| 流动保障 | flow-assurance-engineer-agent、hydrate-screening-agent、sand-erosion-agent、subsea-cooldown-agent、teg-dehydration-agent |
| 工艺设施 | process-engineer-agent、process-safety-agent、gas-treatment-agent、debottlenecking-agent |
| 管道/海底 | gas-export-pipeline-agent、pipe-route-screening-agent、subsea-layout-screening-agent |
| 生产优化 | production-optimization-agent、gas-lift-allocation-agent、artificial-lift-agent |
| 储层 | reservoir-forecasting-agent、reservoir-to-facility-screening-agent |
| 经济评价 | asset-economics-agent、concept-selection-agent |

这些资产的价值主要有三类：

1. 专业知识和工程方法；
2. 可调用的确定性计算能力；
3. 可复用的 Agent、Skill 示例和工作流样板。

### 3.2 NeqSim Community Skills

[neqsim-community-skills](https://github.com/equinor/neqsim-community-skills) 公开提供了八大技能分类：

- PVT；
- 流动保障；
- 工艺；
- 海底；
- 油田开发；
- 安全；
- 工程数据；
- 环境。

### 3.3 推荐集成方式

不建议把 40 多个 Agent 平铺到平台首页，也不建议长期直接 Fork 后大量修改。建议：

- 将 NeqSim 作为独立的领域能力包或外部依赖；
- 用平台自己的 Agent Contract 和工具协议做适配；
- 通用能力保持上游同步；
- 企业专有数据、规则、工作流和连接器放在平台侧；
- 对高价值改进尽量回馈上游；
- 对版本、依赖、许可证和测试用例做锁定。

Apache-2.0 通常允许商业集成、修改和再发布，但集成时应：

- 保留 LICENSE；
- 保留 NOTICE 和版权声明；
- 标明修改内容；
- 检查传递依赖的许可证；
- 避免使用户误认为平台是 Equinor 官方产品；
- 分开处理商标、品牌和产品命名问题。

### 3.4 NeqSim Agent 与 NeqSim Tool 的区别

建议拆分为：

- **Tool**：负责确定性计算，例如闪蒸、相态、物性、管流、分离和压缩计算。
- **Skill**：负责输入准备、参数解释和专业方法。
- **Agent**：负责理解工程任务、组织工具调用和解释结果。
- **Workflow**：负责规定多个工具的固定计算顺序。

NeqSim 的 Agent 和 Skill 可以作为首批领域资产，但平台的核心产品不应依赖 Agent 数量。

---

## 4. 核心判断：Agent 不是越多越好

### 4.1 平铺 Agent 的问题

如果把大量专业 Agent 直接暴露给用户，容易出现：

- 用户不知道应该选哪个 Agent；
- 多个 Agent 重复分析同一份数据；
- Agent 之间输入输出格式不一致；
- 大模型绕过工程工具直接给结论；
- 结果缺少版本、假设和审计信息；
- 难以进行统一的质量验证和权限控制。

### 4.2 推荐的产品抽象

~~~text
用户问题
  ↓
Agent 理解和参数提取
  ↓
工作流编译器
  ↓
确定性计算 DAG
  ↓
工具执行
  ↓
结果校验和不确定性分析
  ↓
工程解释、报告和审批
~~~

用户看到的应该是“任务”或“工作流”：

- PVT 自动质检与流体表征；
- 储层—地面一体化快速筛选；
- 地下储气库注采能力评价；
- 注采周期和气体质量预测；
- 方案筛选与经济评价。

而不是要求用户从 40 个 Agent 中手动选择。

### 4.3 重要原则

> Agent 可以提出“调用什么”，但不能替代工程工具计算；Agent 可以解释“为什么”，但不能绕过工程约束。

---

## 5. 确定性工程工具层与 MCP 方案

### 5.1 四层职责

建议平台至少分为四层：

1. **数据和对象层**：统一数据、单位、对象、关系和权限；
2. **确定性工具层**：调用 NeqSim、储层、井筒、管流、设施和经济计算；
3. **工作流层**：组织工程过程和依赖；
4. **Agent 层**：理解问题、编排工作流、解释结果。

### 5.2 Tool 分级

#### 基础计算工具

- 单位转换；
- 物性单位标准化；
- 插值和拟合；
- 曲线处理；
- 质量、能量和组分平衡；
- 不确定性传播；
- 数据质量检查；
- 参数范围和边界校验。

#### 领域计算服务

~~~text
neqsim.pvt.flash
neqsim.pvt.phase_envelope
neqsim.pvt.fluid_characterization
flow.multiphase_pressure_drop
flow.hydrate_screening
facility.separator_sizing
facility.gas_treatment
production.nodal_analysis
economics.scenario_compare
~~~

#### 场景级计算服务

~~~text
field.reservoir_to_facility_screening
ugs.injectivity_forecast
ugs.withdrawal_deliverability
ugs.cycle_simulation
ugs.gas_quality_forecast
development.concept_screening
~~~

低层 Tool 可以很多，但面向 Agent 的接口应尽量是稳定、业务化的场景接口。

### 5.3 工具统一契约

每个工具至少应描述：

~~~yaml
tool_id: ugs.withdrawal_deliverability
version: 1.0.0
domain: underground_gas_storage
risk_level: engineering_review

inputs:
  reservoir_model: artifact
  fluid_model: artifact
  wells: array
  pressure_limits: object
  operating_schedule: object

outputs:
  deliverability_curve: artifact
  pressure_profile: artifact
  constraints: array
  warnings: array
  uncertainty: object
~~~

执行结果建议统一为：

~~~json
{
  "run_id": "run-20260809-001",
  "status": "completed",
  "outputs": {},
  "warnings": [],
  "assumptions": [],
  "provenance": {
    "tool_id": "ugs.withdrawal_deliverability",
    "tool_version": "1.0.0",
    "engine_version": "neqsim-x.y.z",
    "input_hash": "...",
    "calculation_time": "..."
  }
}
~~~

### 5.4 工具必须满足的约束

- 输入严格结构化；
- 单位显式化；
- 输出结构化；
- 相同输入和版本可重复；
- 假设显式记录；
- 计算收敛性明确；
- 错误、警告和超适用范围分开；
- 大文件通过 artifact 引用；
- 计算过程支持缓存和回归测试；
- 结果带工具、引擎和数据版本。

### 5.5 MCP Tool 与 Action 的边界

~~~text
MCP Tool = calculate / query / validate
Action    = commit / publish / notify / submit / modify
~~~

NeqSim MCP 适合做 Tool。后续应增加一个更高层的 Action 层：

- 创建场景；
- 提交工程审核；
- 批准计算结果；
- 发布开发方案；
- 触发报告生成；
- 通知责任人；
- 连接外部调度或工单系统。

---

## 6. 跨行业垂直 Agent 平台调研

本节基于公开产品页和官方文档整理。共同结论是：成熟产品都把 Agent 绑定到领域数据、专业工具、固定工作流和治理机制上。

### 6.1 工业与能源：Cognite Atlas AI

官方资料：

- [Cognite Atlas AI 产品页](https://www.cognite.com/en/product/atlas)
- [Atlas AI 文档](https://docs.cognite.com/cdf/atlas_ai/)
- [Cognite Data Modeling 文档](https://docs.cognite.com/cdf/dm/)

关键做法：

- Industrial Knowledge Graph 提供工业上下文；
- 低代码 Agent Workbench；
- 预配置 Agent 模板；
- 工业专用 Skills 和 Tools；
- Agent 评估和生产发布；
- API/SDK 调用；
- 多站点、权限和治理；
- 根因分析、设备排查等任务型 Agent。

对石油平台的启示：

> 先建立油气田和储气库的上下文层，再让 Agent 在上下文中调用确定性工程工具。

### 6.2 企业运营：Palantir AIP

官方资料：

- [Palantir AIP](https://www.palantir.com/platforms/aip/)
- [Ontology Overview](https://www.palantir.com/docs/foundry/ontology/overview/)
- [Action Parameters](https://www.palantir.com/docs/foundry/action-types/parameter-overview/)
- [Submission Criteria](https://www.palantir.com/docs/foundry/action-types/submission-criteria/)

关键做法：

- Ontology 连接数据资产和现实对象；
- Object、Property、Link 表达语义；
- Action、Function 和 Side Effect 表达组织的“动力学”；
- Action 有参数、规则、提交条件、权限和审计；
- AI App、Action-Driven Logic 和 Automation；
- Workflow Builder；
- 端到端评估和发布；
- 人工操作员可以查看逻辑、审批建议和执行历史。

对石油平台的启示：

> 工程计算结果不应直接覆盖生产数据，应先形成 Scenario 或 Recommendation，再通过受治理的 Action 发布。

### 6.3 法律和专业服务：Harvey

官方资料：

- [Harvey Agents](https://www.harvey.ai/en-US/platform/agents)
- [Harvey 平台](https://www.harvey.ai/)

关键做法：

- Agent 端到端执行专业工作；
- 多 Agent 并行拆分大型任务；
- 支持定时执行；
- 支持文档、图片、视频和音频；
- 执行前预览计划、调整范围并批准；
- 每条结论有引用，每一步有日志；
- Agent Builder 封装律所自己的知识、Playbook 和偏好；
- 连接 Microsoft、文档管理系统等已有工具。

对石油平台的启示：

- 把企业工程规范和历史案例封装成可复用 Skill；
- 允许工程师先审阅工作流计划；
- 让报告和计算结果都成为可审查交付物；
- 支持后台执行长时间的工程任务。

### 6.4 医疗：Abridge

官方资料：[Abridge](https://www.abridge.com/)

关键做法：

- 不是单个问答 Agent，而是“就诊前—就诊中—就诊后”完整流程；
- 就诊前汇总病史和上下文；
- 就诊中实时捕获信息、识别护理缺口、辅助订单；
- 就诊后生成病历、编码、订单和患者摘要；
- 建立临床评价和医生在环验证；
- 深度连接医院系统和支付/收入流程；
- 按专科和护理场景扩展。

对石油平台的启示：

开发方案、注采方案和储气库运行也可以设计成全过程：

~~~text
方案前：资料汇总、数据质检、历史案例和模型准备
方案中：调用 PVT、储层、井筒、设施和经济工具
方案后：结果解释、审查清单、审批、报告和后续任务
~~~

### 6.5 网络安全：Microsoft Security Copilot

官方资料：[Microsoft Security Copilot](https://www.microsoft.com/en-us/security/business/ai-machine-learning/microsoft-security-copilot)

关键做法：

- Agent 嵌入 Defender、Entra、Intune、Purview 等现有产品；
- 用 Skills、Promptbooks 和 Agents 处理具体任务；
- 支持 Microsoft、合作伙伴和社区 Agent；
- 处理钓鱼邮件分诊、漏洞修复、告警分诊等流程；
- 以发现速度、误报减少和处置效率衡量成效；
- 通过现有安全产品和权限体系运行。

对石油平台的启示：

- Agent 应嵌入已有工程应用和数据系统；
- 可建立合作伙伴工具生态；
- 由生产、压力、温度、设施和完整性事件自动触发诊断工作流；
- 用真实工程 KPI 衡量价值，而不是只看语言回答质量。

### 6.6 金融研究：AlphaSense

官方资料：[AlphaSense](https://www.alpha-sense.com/)

关键做法：

- 高质量、垂直化、经过筛选的数据源；
- 企业内部内容与外部研究统一；
- 行业化搜索和 Deep Research；
- 逐句引用；
- 假设可追踪；
- 研究结果连接 Excel、PowerPoint、报告和决策材料；
- 从“找到信息”延伸到“完成交付物”。

对石油平台的启示：

- 计算结论要绑定数据来源和模型版本；
- 工程报告需要引用井、实验室、模型和规范；
- 结果应直接生成曲线、表格、报告和方案对比，而不是停留在聊天文本。

### 6.7 软件工程：GitHub Copilot cloud agent

官方资料：[GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-cloud-agent)

关键做法：

- Agent 先研究仓库；
- 创建实现计划；
- 在隔离环境中改代码；
- 运行测试、Lint 和其他自动检查；
- 在分支上提交；
- 通过 Pull Request 让人审查；
- 日志记录每一步；
- 可以定义前端、测试、文档等自定义 Agent；
- 用 PR 数量、合并率和合并时间衡量效果。

对石油平台的启示：

可以把工程方案管理设计成类似“工程 PR”：

~~~text
方案草稿
→ Agent 研究数据和模型
→ 生成计算计划
→ 在独立 Scenario 中运行
→ 比较结果差异
→ 工程师评论和修改
→ 审批
→ 发布正式方案
~~~

---

## 7. Cognite 的工业上下文结构

### 7.1 Cognite 结构的核心理解

Cognite 的结构可简化为：

~~~text
数据源
  ↓
数据接入和上下文化
  ↓
工业知识图谱
  ↓
AI-ready Data
  ↓
Agent Workbench
  ├── Language Models
  ├── Skills
  ├── Tools
  ├── Runtime
  └── Evaluation
  ↓
工业应用和工作流
~~~

### 7.2 数据建模的具体概念

根据 Cognite Data Modeling 官方文档，其数据建模服务包括：

- **Property graph**：用节点、边和属性表达复杂工业系统；
- **Spaces**：数据、模型和权限的边界；
- **Instances**：知识图谱中的实际节点和边；
- **Containers**：定义属性存储和结构；
- **Views**：面向查询和应用的投影；
- **Data models**：组合多个 View 形成业务模型；
- **Query/Search/Aggregation**：查询、搜索和聚合知识图谱；
- **Access control**：对图谱和数据进行权限控制；
- **Records and Streams**：处理高性能的事件、日志和历史记录。

### 7.3 工业上下文层

它会把多种数据挂到同一个工业对象上：

~~~text
设备 / 井 / 设施
├── 属性
├── 时序数据
├── 事件
├── 工单
├── 文件
├── 3D 模型
├── 工程模型
└── 关联设备和上下游关系
~~~

例如一个压缩机对象，不只是有名称和编号，还能关联：

- 压力、温度、振动时序；
- 维修工单；
- 报警事件；
- 设备手册；
- P&ID；
- 3D 模型；
- 相关管线；
- 上下游设备；
- 历史故障案例。

这样 Agent 问“为什么这台压缩机效率下降”，才有足够的上下文。

### 7.4 Atlas AI Agent 层

Cognite 文档把 Atlas AI 的 Agent 生命周期拆成：

1. 设计使用场景；
2. 选择语言模型；
3. 配置 Agent；
4. 绑定 Skills；
5. 绑定 Tools；
6. 查询工业知识图谱；
7. 创建测试案例；
8. 运行评估；
9. 发布；
10. 通过 API 或 SDK 调用。

可以抽象为：

~~~text
Agent
├── Language Model
├── Prompt / Instructions
├── Skills
├── Tools
├── CDF Knowledge Graph
├── Runtime
├── Evaluation
└── API / SDK
~~~

因此 Cognite 的 Agent 并不是“一个模型加一段提示词”，而是：

> 模型 + 工业知识图谱 + 工具 + 技能 + 评估 + 生产运行时。

### 7.5 可借鉴的油气版本

~~~text
企业数据与文件
  ├── 测井、地震、PVT、SCAL
  ├── 井、井筒、完井、生产
  ├── 压力、温度、流量时序
  ├── 设施、管线、P&ID
  ├── 储气库注采和监测
  └── 规范、报告、历史案例
          ↓
油气上下文化
          ↓
油气知识图谱 / 本体
          ↓
Agent + Skills + MCP Tools
          ↓
勘探开发和储气库工作流
~~~

### 7.6 Cognite 模式的局限

Cognite 更强调“理解工业状态和查询上下文”，但石油平台还需要额外强化：

- PVT 和过程计算；
- 储层和井筒模拟；
- 工程方案 Scenario；
- 工具结果收敛性；
- 工程审批和方案发布；
- 不确定性和安全边界。

因此，Cognite 的工业上下文适合作为参考，但不能替代石油工程计算和方案治理。

---

## 8. Palantir 的工作流与动作治理结构

### 8.1 Ontology 的两部分

Palantir 的 Ontology 可以分成：

#### Semantic layer

- Object Types；
- Properties；
- Link Types；
- Interfaces；
- Object Sets；
- Views 和应用读取模型。

#### Kinetic layer

- Action Types；
- Parameters；
- Rules；
- Functions；
- Submission Criteria；
- Side Effects；
- Notifications；
- Webhooks。

### 8.2 Action 的参考结构

~~~text
Action
├── target_object
├── parameters
├── preconditions / submission_criteria
├── business_rules
├── user_authorization
├── object_edits
├── side_effects
├── audit_log
├── metrics
└── undo_or_revert
~~~

### 8.3 油气版 Action 示例

~~~yaml
action: publish_ugs_withdrawal_plan
target: ugs_scenario

parameters:
  scenario_id: string
  reviewer_id: string

submission_criteria:
  - data_completeness >= 0.95
  - fluid_model.status == approved
  - reservoir_model.version == current
  - calculation_run.convergence == true
  - max_pressure <= approved_pressure_limit
  - integrity_risk.level <= medium
  - user.role in [reservoir_engineer, storage_engineer]

effects:
  - set scenario.status = published
  - create recommendation record
  - create audit record
  - notify responsible team
~~~

### 8.4 Action 失败也要解释

不能只返回“执行失败”，而应说明：

~~~text
无法发布该注采方案：

1. 储层模型仍为草稿版本；
2. 第 3 口井的完整性数据缺失；
3. 峰值采气压力超过批准上限 2.4 bar；
4. 流体相态计算未收敛。
~~~

这对油气领域尤其重要，因为工程师需要知道是数据问题、模型问题、计算问题还是治理规则阻止了动作。

### 8.5 Palantir 风格的石油工作流

~~~text
Agent 读取 Ontology 状态
  ↓
Agent 生成建议
  ↓
Agent 选择 Action 或 Automation
  ↓
系统检查权限和提交条件
  ↓
人工审批或自动执行
  ↓
记录执行历史和结果
~~~

---

## 9. 面向石油领域的融合架构

### 9.1 推荐总体架构

~~~text
用户 / 工程师 / 管理人员
        ↓
项目空间与任务入口
        ↓
Agent 编排与工作流编译器
        ↓
专业 Agent 层
  ├── NeqSim Agent / Skills
  ├── 勘探开发 Agent
  ├── 地下储气库 Agent
  └── 企业专有 Agent
        ↓
确定性工具运行时
  ├── NeqSim
  ├── 储层 / 井筒 / 管流 / 设施计算
  └── 经济评价 / 优化
        ↓
油气本体与知识图谱
        ↓
数据接入、时序、文件、模型和文档

旁路治理：
Agent 编排 → Action / 审批 / 权限 / 审计
Action → Scenario / CalculationRun / Recommendation
~~~

### 9.2 各层职责

#### 油气本体和上下文层

表示：

- 油藏、流体、井和设施；
- 上下游关系；
- 时序数据；
- 工程模型；
- 文档和规范；
- 方案和计算结果。

#### 确定性工具层

执行：

- PVT；
- 流体表征；
- 相态；
- 井筒产能；
- 多相管流；
- 水合物和结垢；
- 分离、压缩和气体处理；
- 储层快速预测；
- 经济评价和方案优化。

#### 工作流层

固定：

- 工具调用顺序；
- 前置数据检查；
- 中间结果依赖；
- 结果验证；
- 人工审批节点；
- 报告生成步骤。

#### Action 层

负责：

- 创建和修改 Scenario；
- 提交审核；
- 审批和发布；
- 通知责任人；
- 连接外部系统；
- 必要时回滚。

## 10. 油气领域对象模型

### 10.1 第一版核心对象

建议先控制规模，建立约 15 个核心对象：

~~~text
Asset
Field
Block
Reservoir
Fluid
Well
Wellbore
Completion
Facility
Pipeline
Compressor
StorageSite
InjectionCycle
Scenario
CalculationRun
~~~

后续再增加：

- SeismicSurvey；
- WellLog；
- CoreSample；
- SCALExperiment；
- ProductionAllocation；
- IntegrityAssessment；
- Risk；
- Recommendation；
- Approval；
- Document；
- TimeSeries；
- ModelVersion。

### 10.2 核心关系

~~~text
Asset contains Field
Field contains Reservoir
Reservoir contains Well
Well has Wellbore
Wellbore has Completion
Well connects to Facility
Facility connects to Pipeline
Pipeline connects to StorageSite
StorageSite has InjectionCycle
Scenario uses Reservoir
Scenario uses Fluid
Scenario contains operating schedule
CalculationRun evaluates Scenario
Recommendation is derived from CalculationRun
Approval governs Recommendation
~~~

### 10.3 Scenario 对象

Scenario 是开发方案和储气库方案的核心对象：

~~~yaml
Scenario:
  id: ugs-cycle-2026-01
  type: withdrawal_deliverability
  base_case: ugs-base-2026
  reservoir_model: model-rsv-003
  fluid_model: fluid-pvt-017
  wells: [well-101, well-102, well-103]
  facilities: [compressor-01, dehydration-02]
  pressure_limits:
    max_reservoir_pressure: 185.0 barg
    max_wellhead_pressure: 120.0 barg
  schedules:
    injection: artifact://schedule-injection.csv
    withdrawal: artifact://schedule-withdrawal.csv
  assumptions: []
  status: draft
~~~

### 10.4 CalculationRun 对象

所有 NeqSim 和其他仿真计算都建议生成统一的 CalculationRun：

~~~yaml
CalculationRun:
  id: run-20260809-001
  tool_id: ugs.withdrawal_deliverability
  tool_version: 1.0.0
  engine_version: neqsim-x.y.z
  scenario_id: ugs-cycle-2026-01
  input_snapshot: artifact://inputs.json
  assumptions: []
  convergence: true
  warnings: []
  outputs:
    - artifact://deliverability-curve.csv
    - artifact://pressure-profile.png
    - artifact://engineering-report.md
  created_at: 2026-08-09T00:00:00Z
~~~

---

## 11. 地下储气库能力包

NeqSim 可以覆盖地下储气库中的流体、井筒和部分地面工程，但地下储气库仍需要独立的 UGS Capability Pack。

### 11.1 储气库评价

- 储气库类型识别：枯竭油气藏、含水层、盐穴；
- 库容和工作气量；
- 垫底气量；
- 注采周期；
- 库存变化；
- 库容衰减；
- 储能有效性。

### 11.2 注采能力

- 注气能力；
- 采气能力；
- 注采井配产；
- 井口和井底压力约束；
- 高峰采气能力；
- 注采转换时间；
- 压缩机和管网能力。

### 11.3 地质和储层安全

- 储层压力管理；
- 断层再活化风险；
- 盖层和封闭性；
- 气窜和突破；
- 水侵；
- 储层非均质性；
- 循环注采后的储层响应。

### 11.4 气体质量和混合

- 工作气与垫底气混合；
- 注入气与原始地层气混合；
- 热值变化；
- 水露点和烃露点；
- 气体处理负荷；
- 氢气或其他气体混储兼容性。

### 11.5 井筒和完整性

- 注采井完整性；
- 套管和水泥环；
- 腐蚀和冲蚀；
- 温压循环；
- 井筒热力学；
- 监测和维修建议。

### 11.6 地面设施和管网

- 压缩机工况；
- 注气和采气站能力；
- 脱水和气体处理；
- 管道水合物风险；
- 进出站能力；
- 峰值工况瓶颈。

### 11.7 经济与调度

- 季节性储气经济评价；
- 战略储备经济评价；
- 气价和峰谷价差；
- 注采计划优化；
- 可靠性和可用率；
- 能耗和碳排放。

### 11.8 UGS 端到端工作流

~~~text
气体组分
  → PVT 与相态模型
  → 储层库容和压力预测
  → 注采能力评价
  → 井筒完整性校核
  → 地面设施和管网校核
  → 气体质量评价
  → 风险与经济评价
  → 注采方案和运行边界
~~~

UGS Agent 的输出不应只有“能不能注、能不能采”，还要输出：

- 约束条件；
- 适用周期；
- 风险等级；
- 不确定性范围；
- 数据和模型版本；
- 需要人工审批的事项。

---

## 12. Agent、Tool、Workflow、Action 的边界

### 12.1 定义

| 概念 | 定义 | 示例 |
|---|---|---|
| Tool | 可重复、结构化、通常无副作用的计算或查询能力 | neqsim.pvt.flash |
| Skill | 专业方法、参数准备、提示和输入组织能力 | PVT 组分表征方法 |
| Agent | 理解任务、选择能力、解释结果的智能组件 | UGS 注采评价 Agent |
| Workflow | 固定步骤、依赖和验证条件的工程流程 | 储层—地面筛选 |
| Scenario | 独立的方案假设和输入集合 | UGS 2026 冬季采气方案 |
| CalculationRun | 某次具体计算运行和结果记录 | 一次产能曲线计算 |
| Action | 修改对象、发布结果或触发外部副作用的受治理操作 | 发布注采方案 |
| Approval | 对高风险结果进行人工确认 | 储气库运行边界审批 |

### 12.2 推荐的调用链

~~~text
用户问题
→ Agent 参数提取
→ Workflow 编译
→ 数据质量检查
→ Tool 执行
→ CalculationRun
→ 约束和风险校验
→ Recommendation
→ 人工审批
→ Action 发布
~~~

### 12.3 示例：储气库采气能力评价

~~~text
用户：评价某储气库冬季峰值采气能力

Agent：识别任务和所需数据
Workflow：生成固定计算图
Tool：读取储层、井、流体和设施输入
Tool：调用 NeqSim 生成流体模型
Tool：调用井筒产能计算
Tool：调用设施和管网约束计算
Tool：生成采气曲线和压力剖面
Validator：检查收敛性、压力和完整性边界
Agent：解释限制因素和不确定性
Action：提交工程审核
~~~

---

## 13. 工程可信性与安全治理

### 13.1 结果必须可追溯

每次运行建议保存：

- 原始输入数据；
- 数据质量检查；
- Agent、Skill 和 Tool 版本；
- 计算引擎版本；
- 物性模型和参数；
- 单位和换算；
- 工程假设；
- 中间计算结果；
- 最终结论；
- 不确定性；
- 警告；
- 人工修改和审批。

### 13.2 风险等级

建议定义：

- **L0**：资料整理和格式转换，可自动执行；
- **L1**：低风险分析，可自动生成结果；
- **L2**：方案筛选，需要工程师复核；
- **L3**：影响生产或安全的建议，必须审批；
- **L4**：不能由 Agent 直接执行，只能提供分析依据。

### 13.3 不允许 Agent 直接执行的事项

- 改变注采压力；
- 调整生产配产；
- 修改井控参数；
- 改变安全联锁；
- 修改设施运行边界；
- 形成正式储量或投资决策结论；
- 直接写入 SCADA、DCS 或生产控制系统。

### 13.4 评估体系

不能只评估语言回答质量，应建立工程评估集：

- 典型 PVT 案例；
- 标准井筒案例；
- 多相管流案例；
- 水合物筛查案例；
- 历史储气库周期；
- 设施瓶颈案例；
- 已审批开发方案；
- 专家修正记录。

评价指标可以包括：

- 计算准确率；
- 收敛率；
- 单位和边界条件错误率；
- 工程师接受率；
- 方案周转时间；
- 报告生成时间；
- 误报和漏报；
- 结果复现率；
- 审批后返工率。

---

## 14. 产品化与 MVP 路线

### 14.1 MVP 不做 40 个 Agent

第一版建议只做 3～5 个端到端工作流。

#### 工作流一：PVT 自动质检与流体表征

~~~text
实验数据 / 组分
→ 数据质量检查
→ 流体分类
→ EOS / 物性模型建议
→ 相态和物性计算
→ 参数异常识别
→ 工程报告
~~~

#### 工作流二：储层—地面一体化快速筛选

~~~text
流体表征
→ 储层预测
→ 井口和管线能力
→ 工艺设施筛选
→ 流动保障
→ 经济评价
→ 方案对比
~~~

#### 工作流三：地下储气库注采能力评价

输出：

- 工作气量；
- 垫底气量；
- 注气曲线；
- 采气曲线；
- 峰值能力；
- 压力约束；
- 设施瓶颈；
- 风险清单。

#### 工作流四：注采周期与气体质量预测

重点分析：

- 库存变化；
- 气体组分变化；
- 热值和露点变化；
- 设施负荷；
- 高峰期瓶颈。

#### 工作流五：方案筛选与经济评价

对不同方案比较：

- 井数；
- 压缩机规模；
- 注采制度；
- 设施投资；
- 储层改造；
- 能耗和运行费用；
- 可靠性和可用率。

### 14.2 阶段路线

#### 阶段一：能力接入

- 建立统一 Tool Contract；
- 接入 NeqSim PVT、流动保障、管道和经济能力；
- 统一单位、输入输出和报告格式；
- 建立计算沙箱；
- 完成 3～5 个端到端工作流。

#### 阶段二：企业数据融合

- 接入实验室、井筒、生产和管网数据；
- 建立油藏、井、设施和储气库对象模型；
- 支持项目空间、权限和审计；
- 接入 OSDU、WITSML、PPDM 或已有企业数据平台。

#### 阶段三：勘探开发和 UGS 深化

- 地震和测井能力；
- 地质建模；
- 钻井和完井；
- UGS 专用工具；
- 商业模拟器连接器；
- 历史案例回归测试。

#### 阶段四：工程运行闭环

- 实时生产和监测；
- 异常预警；
- 预测性维护；
- 多方案优化；
- 审批和调度；
- 高风险操作隔离。

---

## 15. 建议的目录和技术组织方式

建议采用以下逻辑目录：

~~~text
core/
  ontology/
  units/
  validation/
  uncertainty/
  artifacts/
  provenance/

engines/
  neqsim/
  reservoir_simulator/
  wellbore_simulator/
  pipeline_simulator/
  facility_simulator/

tools/
  pvt/
  reservoir/
  drilling/
  production/
  flow_assurance/
  facilities/
  ugs/
  economics/

agents/
  subsurface/
  wells/
  production/
  facilities/
  ugs/
  economics/

workflows/
  pvt_characterization/
  reservoir_facility_screening/
  ugs_injectivity/
  ugs_withdrawal/
  ugs_cycle_design/
  concept_selection/

actions/
  scenario/
  review/
  approval/
  publication/
  notifications/

evaluations/
  golden_cases/
  regression/
  expert_review/
~~~

### 15.1 推荐的命名空间

~~~text
neqsim.pvt.flash
neqsim.pvt.characterize

oilfield.production.nodal_analysis
oilfield.flow.hydrate_screening

ugs.injectivity.forecast
ugs.withdrawal.deliverability
ugs.cycle.simulation
ugs.gas_quality.forecast
ugs.integrity.pressure_screening

scenario.create
scenario.submit_review
scenario.publish
~~~

### 15.2 三个最重要的抽象

#### OilfieldObject

统一表示油藏、井、井筒、设施、管线、储气库等实体。

#### CalculationRun

统一记录 NeqSim 和其他工程引擎的运行、输入、版本和结果。

#### EngineeringAction

统一处理发布方案、提交审核、通知责任人和连接外部系统等受治理操作。

建议形成以下链路：

~~~text
OilfieldObject
  → CalculationRun
  → Scenario
  → Recommendation
  → EngineeringAction
  → Approval
  → PublishedResult
~~~

---

## 16. 讨论演进与关键思考记录

本节保留前面讨论的思考路径，便于后续继续迭代，而不是只留下最终结论。

### 16.1 第一步：发现 NeqSim 社区 Agent 和 Skill

最初的调研发现 Equinor 公开了：

- 40+ 石油工程 Agent；
- 8 大技能分类；
- Apache-2.0 许可证；
- 覆盖 PVT、流动保障、工艺、海底、生产、储层、经济和环境。

当时的第一个问题是：是否直接把这些 Agent 全部集成进平台。

### 16.2 第二步：从“Agent 数量”转向“问题解决能力”

讨论形成的判断是：

- Agent 数量不是产品价值；
- 平级 Agent 会增加用户选择成本；
- 工程计算需要确定性工具；
- Agent 更适合做理解、编排和解释；
- 工作流比 Agent 列表更接近真实工程任务。

因此建议优先做少数高价值工作流，而不是 40 个独立入口。

### 16.3 第三步：确认 NeqSim MCP 的位置

用户已经通过内置 MCP 的方式将 NeqSim 打包进软件。讨论进一步明确：

- NeqSim MCP 是确定性工程工具层；
- MCP 负责能力暴露，不等于完整平台架构；
- 后续工具应该遵循统一的 Tool Contract；
- Agent 不应直接替代 NeqSim 的计算逻辑；
- 计算结果需要版本、输入、假设、警告和审计信息。

### 16.4 第四步：跨行业调研

跨行业调研发现，成熟垂直产品通常采取以下组合：

~~~text
领域数据基础
  + 领域对象模型
  + 专业知识和规则
  + 确定性工具
  + 固定工作流
  + 人工审批
  + 执行审计
  + 业务指标
~~~

这说明“垂直化”不是把一个通用模型再训练一次，而是重新定义：

- 模型能看到什么上下文；
- 模型能调用哪些工具；
- 计算流程如何固定；
- 哪些动作允许执行；
- 谁可以审批；
- 结果如何被验证和追责。

### 16.5 第五步：确认 Cognite 和 Palantir 的互补性

进一步研究后形成了两个互补判断：

- Cognite 提供“工业上下文”：对象、关系、时序、事件、文件、工程模型；
- Palantir 提供“运营动力学”：Action、提交条件、权限、审批、自动化、审计。

因此，对石油平台的组合方式是：

~~~text
Cognite 风格：油气知识图谱和数据上下文化
Palantir 风格：工程场景、Action、审批和结果发布
NeqSim 风格：确定性热力学和过程计算
~~~

### 16.6 第六步：进一步聚焦地下储气库

地下储气库被认为是很有差异化潜力的方向，因为它同时需要：

- 流体相态；
- 井筒和产能；
- 储层压力；
- 地面设施；
- 气体质量；
- 注采周期；
- 完整性和安全；
- 经济和调度。

它天然适合用工作流串联确定性工具，而不是依赖单一 Agent。

### 16.7 当前形成的产品定位

当前最合理的定位是：

> 面向油气勘探开发和地下储气库的工程智能工作台，以确定性计算工具为底座，以油气对象模型为上下文，以 Agent 和工作流降低专业分析门槛，以审批和审计保证工程可信性。

### 16.8 仍待验证的问题

以下问题还需要后续通过代码、数据和用户验证：

- 当前内置 MCP 的 Tool Contract 是否足够稳定；
- NeqSim 工具的粒度应该多细；
- 第一版油气本体范围；
- 是否优先接入测井、井筒、管流还是设施工具；
- UGS 第一批真实数据来源；
- 商业仿真器的连接方式和许可证边界；
- 企业数据标准采用 OSDU、WITSML、PPDM 还是内部模型；
- 工程师需要的报告和审批形式；
- Agent 结果如何与已有项目文档、模型和数据库关联。

---

## 17. 参考资料与仓库链接

### 17.1 NeqSim

- [equinor/neqsim-community-agents](https://github.com/equinor/neqsim-community-agents)
- [equinor/neqsim-community-skills](https://github.com/equinor/neqsim-community-skills)
- [NeqSim 官方项目](https://github.com/equinor/neqsim)

### 17.2 Cognite

- [Cognite Atlas AI 产品页](https://www.cognite.com/en/product/atlas)
- [Atlas AI 文档](https://docs.cognite.com/cdf/atlas_ai/)
- [Cognite Data Fusion 文档](https://docs.cognite.com/cdf)
- [Data Modeling](https://docs.cognite.com/cdf/dm/)
- [Data Modeling concepts](https://docs.cognite.com/cdf/dm/dm_concepts/)
- [Cognite 工业 Agent 资源](https://www.cognite.com/en/resources)

### 17.3 Palantir

- [Palantir AIP](https://www.palantir.com/platforms/aip/)
- [Ontology Overview](https://www.palantir.com/docs/foundry/ontology/overview/)
- [Ontology-aware applications](https://www.palantir.com/docs/foundry/ontology/applications/)
- [Action Parameters](https://www.palantir.com/docs/foundry/action-types/parameter-overview/)
- [Submission Criteria](https://www.palantir.com/docs/foundry/action-types/submission-criteria/)
- [Palantir Foundry 文档](https://www.palantir.com/docs/foundry/)

### 17.4 其他垂直 Agent 产品

- [Harvey Agents](https://www.harvey.ai/en-US/platform/agents)
- [Abridge](https://www.abridge.com/)
- [Microsoft Security Copilot](https://www.microsoft.com/en-us/security/business/ai-machine-learning/microsoft-security-copilot)
- [GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-cloud-agent)
- [AlphaSense](https://www.alpha-sense.com/)

### 17.5 仓库内相关文档

- [石油领域内置能力扩展调研](./BUILTIN_CAPABILITIES_PETROLEUM.md)
- [内置能力调研](./BUILTIN_CAPABILITIES_RESEARCH.md)
- [UGSCI 改进计划](./UGSCI_IMPROVEMENT_PLAN.md)
- [通用界面迁移评审](./GENUI_MIGRATION_REVIEW.md)

---

## 结论

目前最值得执行的下一步不是继续搜集更多 Agent，而是完成三个基础设计：

1. **统一 Tool Contract**：让 NeqSim 和后续工程引擎以同一种方式被调用和验证；
2. **油气工程对象模型**：让井、油藏、流体、设施、储气库、场景和计算结果彼此关联；
3. **工程 Workflow + Action 机制**：让计算、方案、审批、发布和审计形成闭环。

NeqSim 已经解决了“平台能够计算什么”的一部分问题。下一阶段真正决定平台上限的是：

> 这些计算围绕哪些对象运行，结果如何沉淀，哪些动作可以被允许，以及谁有权批准它们。


---

