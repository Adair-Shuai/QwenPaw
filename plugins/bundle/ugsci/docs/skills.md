# 技能列表

UGSci 插件内置 **44 个技能**，在启动时自动同步到 QwenPaw 共享技能池。每个技能是一个包含 `SKILL.md` 的目录，可能还包含 `scripts/`、`references/`、`assets/` 等辅助文件。

用户可在技能中心浏览所有技能，并按需下载到任意 Agent。

## 油气领域技能

| 技能 | 描述 |
|------|------|
| `oil-gas-foundation` | 核心行业知识：术语、角色层级、数据格式（LAS/SEG-Y/WITSML/PRODML/RESQML）、安全文化基础 |
| `oil-gas-exploration` | 油气勘探工作流指引：从区域地质到井位部署 |
| `oil-gas-drilling` | 钻井作业支持：实时钻井监控、溢流检测、卡钻分析、钻井参数优化 |
| `oil-gas-reservoir-production` | 油藏管理与生产优化工作流指引 |
| `oil-gas-midstream` | 管道运输与存储操作工作流指引 |
| `oil-gas-refining` | 炼厂操作与工艺优化工作流指引 |
| `oil-gas-delegation` | 元技能：检测软件任务并路由到合适的 petropowers 技能 |
| `segy-operations` | 使用 segyio 库读写、操作、可视化 SEG-Y 地震数据 |
| `well-log-analysis` | 使用 lasio 库读取、分析和操作 LAS 格式测井数据 |
| `scada-timeseries` | 处理实时 SCADA 数据、WITSML/PRODML 流和时序分析 |
| `using-petropowers` | 对话启动技能：建立技能发现和使用机制，要求在任何回复前调用 Skill 工具 |
| `synthetic-data-generation` | 生成逼真的合成油气数据（LAS 测井、SEG-Y 地震、岩心照片、时序数据），含物理约束 |

## 数据科学 & 可视化

| 技能 | 描述 |
|------|------|
| `matplotlib` | 底层绑图库，提供完全自定义控制，适合出版级图形和科学工作流 |
| `seaborn` | 统计可视化，快速探索分布、关系和分类比较，集成 pandas |
| `plotly` | 交互式可视化库，支持悬停、缩放、平移，适合仪表盘和演示 |
| `infographics` | [实验性] 使用 AI 创建专业信息图，支持 10 种类型和 8 种行业风格 |
| `statistical-analysis` | 引导式统计分析：检验选择、假设检查、功效分析、APA 格式报告 |
| `scikit-learn` | Python 机器学习：分类、回归、聚类、降维、模型评估、超参调优 |
| `statsmodels` | 统计模型库：OLS、GLM、混合模型、ARIMA，含详细诊断和推断 |
| `shap` | 模型可解释性：SHAP 值计算、特征重要性、SHAP 图表（瀑布/蜂群/条形/散点） |
| `exploratory-data-analysis` | 对 200+ 种科学数据格式进行综合探索性数据分析 |

## 大数据 & 性能

| 技能 | 描述 |
|------|------|
| `dask` | 分布式计算：超越内存的 pandas/NumPy 工作流，跨集群扩展 |
| `polars` | 快速内存 DataFrame 库，惰性求值、并行执行、Apache Arrow 后端 |
| `ray-data` | 可扩展 ML 数据处理：流式 CPU/GPU 执行，支持 Parquet/CSV/JSON/图像 |
| `zarr-python` | 分块 N 维数组云存储：压缩、并行 I/O、S3/GCS 集成 |
| `hdf5-pde-data-loading` | 加载 PDE 仿真数据集（PDEBench、PhiFlow、JAX-CFD）的 HDF5 模式 |
| `hugging-face-datasets` | 创建和管理 Hugging Face Hub 数据集：仓库初始化、流式更新、SQL 查询 |

## 科学计算

| 技能 | 描述 |
|------|------|
| `sympy` | 符号数学：代数求解、微积分、表达式化简、符号矩阵、物理计算 |
| `pymc` | 贝叶斯建模：分层模型、MCMC (NUTS)、变分推断、模型比较 |
| `pymoo` | 多目标优化框架：NSGA-II/III、MOEA/D、Pareto 前沿、约束处理 |
| `multi-objective-optimization` | Pareto 感知的多属性分子设计，平衡多个 ADMET 性质 |
| `simpy` | 离散事件仿真：制造系统、服务运营、网络流量、物流等 |
| `networkx` | 复杂网络和图分析：图算法、社区检测、网络拓扑可视化 |
| `geopandas` | 地理空间矢量数据处理：Shapefile、GeoJSON、空间分析、坐标变换 |
| `matlab` | MATLAB/GNU Octave 数值计算：矩阵运算、信号处理、图像处理、微分方程 |

## 工程方法论

| 技能 | 描述 |
|------|------|
| `brainstorming-gatekeeper` | 前置检查：判断创意/生成工作前是否需要头脑风暴 |
| `brainstorming` | 创意工作前的必选步骤：探索用户意图、需求和设计 |
| `writing-plans` | 多步骤任务的实现计划编写 |
| `executing-plans` | 在独立会话中执行已编写的实现计划，含审查检查点 |
| `dispatching-parallel-agents` | 2+ 个独立任务的并行派发 |
| `subagent-driven-development` | 在当前会话中执行含独立任务的实现计划 |
| `systematic-debugging` | 遇到 bug/测试失败/异常行为时的系统化调试流程 |
| `test-driven-development` | 测试驱动开发：先写测试再写实现 |
| `verification-before-completion` | 完成验证：声称完成前必须运行验证命令并确认输出 |
| `requesting-code-review` | 任务完成时的代码审查请求 |
| `receiving-code-review` | 接收代码审查反馈时的处理流程 |
| `finishing-a-development-branch` | 开发分支完成后的集成决策（合并/PR/清理） |
| `using-git-worktrees` | 需要隔离的特性开发，创建 git worktree 并智能选择目录 |
| `writing-skills` | 创建新技能、编辑现有技能或验证技能可用性 |

## 技能目录结构

每个技能是一个独立目录，包含：

```
skills/
├── segy-operations/
│   ├── SKILL.md              # 技能定义（frontmatter + 内容）
│   └── references/           # 参考资料（可选）
│       ├── tutorial_01.ipynb
│       └── ...
├── matplotlib/
│   ├── SKILL.md
│   ├── scripts/              # 可执行脚本（可选）
│   └── references/
├── oil-gas-foundation/
│   └── SKILL.md              # 纯文档技能，无附加文件
└── ...
```

### SKILL.md 格式

```markdown
---
name: skill-name
description: 简短描述，用于技能卡片展示和搜索
---

# Skill: Skill Name

详细的技术文档、代码模式、参考链接等...
```

Frontmatter 字段：

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | 是 | 技能唯一标识（与目录名一致） |
| `description` | 是 | 简短描述，显示在技能卡片上 |

正文内容可包含：技术文档、代码示例、参考链接、使用指南等。

## 添加新技能

1. 在 `skills/` 目录下创建新子目录
2. 编写 `SKILL.md` 文件
3. 重启 QwenPaw 后端，技能池同步钩子会自动将其同步到技能池
4. 用户即可在技能中心看到新技能

```bash
mkdir -p skills/my-new-skill
cat > skills/my-new-skill/SKILL.md << 'EOF'
---
name: my-new-skill
description: 新技能的简短描述
---

# Skill: My New Skill

详细的技术文档...
EOF
```
