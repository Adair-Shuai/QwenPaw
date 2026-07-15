# UGSci

> 面向石油领域的 QwenPaw 增强插件

[![Version](https://img.shields.io/badge/version-0.3.0-blue)](./plugin.json)
[![QwenPaw](https://img.shields.io/badge/QwenPaw-%E2%89%A51.1.7-green)](./plugin.json)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](#license)

UGSci 将 QwenPaw 的通用 Agent 界面重新组织为石油领域友好的 **专家 — 能力 — 技能** 三层架构，降低行业用户的使用门槛。所有展示层数据与 Agent 真实配置实时挂钩，所见即所得。

## 核心功能

### 四大模块

| 模块 | 路由 | 说明 |
|------|------|------|
| **专家中心** | `/ugsci-experts` | 将 Agent 转化为领域专家卡片，展示技能/MCP/功能简介，支持创建专家、专家团多智能体协同 |
| **能力中心** | `/ugsci-capabilities` | 以 MCP 客户端粒度展示底层工具能力；内置本地油气软件检测（CMG/Eclipse/Petrel 等 12 款） |
| **技能中心** | `/ugsci-skills` | 展示技能池全量技能，查看详情与已安装专家列表 |
| **市场** | `/ugsci-market` | 搜索技能市场并一键安装到指定 Agent；内置 6 个石油领域专家模板 |

### 数据联动

专家展示层数据与 Agent 真实数据完全挂钩：

- **技能** — `GET /api/skills`（带 `X-Agent-Id` header）获取每个 Agent 的已安装技能
- **MCP** — 从 Agent 配置的 `mcp` 字段提取 Key，与全局 MCP 列表交叉引用
- **功能简介** — 直接使用 Agent 的 `description` 字段
- **模型信息** — 显示 Agent 的 `active_model`
- **系统提示词** — 从 Agent 配置的 `system_prompt_files` 字段获取

### 专家模板

内置 6 个石油领域专家模板，一键创建并预填系统提示词、审批级别：

| 模板 | Emoji | 领域 | 审批级别 |
|------|-------|------|----------|
| 油藏工程师 | 🛢️ | 油气开发 | AUTO |
| 钻井工程师 | ⛏️ | 钻完井 | MANUAL |
| 测井分析师 | 📡 | 测井试油 | AUTO |
| 采油工程师 | ⚙️ | 油气生产 | AUTO |
| 地球物理专家 | 🌍 | 地球物理 | AUTO |
| PVT 分析师 | 🧪 | 流体性质 | AUTO |

### 专家团（多智能体协同）

内置 4 个预设专家团，支持三种编排模式：

| 团队 | 模式 | 说明 |
|------|------|------|
| 储层评价团队 | 流水线 (pipeline) | 测井→地球物理→油藏工程 依次传递结果 |
| 钻井设计团队 | 协调者 (coordinator) | 钻井工程师主导，协调地球物理与采油 |
| 开发方案评审团队 | 圆桌讨论 (roundtable) | 三位专家独立评估，对比综合 |
| 流体性质分析团队 | 流水线 (pipeline) | PVT→地球物理→油藏工程 依次传递 |

用户也可创建自定义专家团，保存于浏览器 `localStorage`。

### 本地软件检测

扫描主机系统已安装的油气仿真软件，检测结果可供 Agent 系统提示词注入：

**已知软件清单（12 款）：**

CMG Builder · CMG IMEX · CMG GEM · CMG STARS · Eclipse · Intersect · Petrel · tNavigator · Techlog · PIPESIM · OFM · CMG Results

### 导航简化

在 **Simple Mode**（极简模式）下，隐藏以下内置菜单项，保持左侧导航简洁：

| 隐藏项 | 说明 |
|--------|------|
| `core.skills` | 技能管理（移至技能中心） |
| `core.tools` | 工具管理 |
| `core.mcp` | MCP 管理（移至能力中心） |
| `core.acp` | ACP 配置 |
| `core.agent-config` | Agent 配置（可在专家中心编辑） |
| `core.agent-stats` | Agent 统计 |
| `core.skill-pool` | 技能池管理（移至技能中心） |

> Full Mode（完整模式）下所有内置菜单项保持可见，不影响原有 QwenPaw 体验。

## 内置技能

插件内置 **40+ 个技能**，在启动时自动同步到共享技能池（`source: plugin:ugsci`），用户可按需下载到任意 Agent。按类别分为：

**油气领域技能：**
`oil-gas-foundation` · `oil-gas-exploration` · `oil-gas-drilling` · `oil-gas-reservoir-production` · `oil-gas-midstream` · `oil-gas-refining` · `oil-gas-delegation` · `segy-operations` · `well-log-analysis` · `scada-timeseries` · `using-petropowers`

**数据科学 & 可视化：**
`matplotlib` · `seaborn` · `plotly` · `infographics` · `statistical-analysis` · `scikit-learn` · `statsmodels` · `shap` · `synthetic-data-generation`

**大数据 & 性能：**
`dask` · `polars` · `ray-data` · `zarr-python` · `hdf5-pde-data-loading` · `hugging-face-datasets`

**科学计算：**
`sympy` · `pymc` · `pymoo` · `multi-objective-optimization` · `simpy` · `networkx` · `geopandas` · `matlab`

**工程方法论：**
`brainstorming` · `brainstorming-gatekeeper` · `writing-plans` · `executing-plans` · `dispatching-parallel-agents` · `subagent-driven-development` · `systematic-debugging` · `test-driven-development` · `verification-before-completion` · `requesting-code-review` · `receiving-code-review` · `finishing-a-development-branch` · `using-git-worktrees` · `exploratory-data-analysis` · `writing-skills`

## 目录结构

```
ugsci/
├── plugin.json              # 插件清单（元数据、入口、版本）
├── plugin.py                # 后端入口（技能池同步 + HTTP 路由注册）
├── software_detector.py     # 本地油气软件检测引擎
├── README.md                # 本文件
├── skills/                  # 内置技能目录（每个子目录含 SKILL.md）
│   ├── oil-gas-foundation/
│   ├── segy-operations/
│   ├── matplotlib/
│   └── ...
├── ui/                      # 前端源码
│   ├── src/index.ts         # 前端入口（6800+ 行，含全部页面与组件）
│   ├── package.json
│   ├── vite.config.ts
│   └── dist/index.js        # 构建产物（ES module）
└── static/
    └── index.js             # 静态资源副本
```

## 构建

```bash
cd ui
npm install
npm run build
```

构建产物为 `ui/dist/index.js`（ES module 格式），Vite 配置将 `react` / `react-dom` 设为 external，运行时由宿主提供。

开发模式（监听变更自动构建）：

```bash
npm run dev
```

## 安装

将 `ugsci` 目录复制到 QwenPaw 工作目录的 `plugins/` 子目录下：

```bash
cp -r plugins/bundle/ugsci ~/.qwenpaw/plugins/
```

重启 QwenPaw 后端后，插件将自动加载。启动时：

1. 技能池同步钩子（`ugsci_sync_skills_to_pool`）将 `skills/` 目录同步到共享技能池
2. 软件检测 HTTP 路由注册到 `/api/ugsci/software/*`
3. 前端通过 `window.QwenPaw` API 注册 4 条路由和菜单项

## 配置参考

### plugin.json

| 字段 | 值 | 说明 |
|------|----|------|
| `id` | `ugsci` | 插件唯一标识 |
| `version` | `0.3.0` | 当前版本 |
| `type` | `general` | 插件类型 |
| `entry.frontend` | `ui/dist/index.js` | 前端入口 |
| `entry.backend` | `plugin.py` | 后端入口 |
| `qwenpaw_version.min` | `1.1.7` | 最低兼容版本 |
| `qwenpaw_version.max` | `2.1.0` | 最高兼容版本 |

### HTTP API

插件在后端注册了以下路由（前缀 `/api/ugsci/software`）：

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/detect` | 触发扫描并返回结果（含重新扫描） |
| `GET` | `/list` | 返回缓存的检测结果（无则自动触发首次扫描） |
| `POST` | `/scan-path` | 添加自定义扫描目录并重新扫描 |
| `GET` | `/summary` | 返回简洁文本摘要（用于 Agent 系统提示词注入） |
| `GET` | `/known` | 返回已知软件目录（供 UI 展示） |

## 卸载

卸载插件时，`ugsci_remove_pool_skills` 清理钩子会自动从技能池中移除 `installed_from: plugin:ugsci` 的技能条目，不影响用户手动安装的其他技能。

## 文档

完整文档位于 [`docs/`](./docs/) 目录，提供 Markdown 和 HTML 两种格式。

### HTML 文档（推荐）

在浏览器中打开 [`docs/index.html`](./docs/index.html) 即可浏览带侧边栏导航的完整文档站：

```bash
open docs/index.html
```

### Markdown 源文件

| 文档 | 说明 |
|------|------|
| [使用指南](./docs/user-guide.md) | 面向最终用户的安装、配置和日常使用指南 |
| [架构设计](./docs/architecture.md) | 插件整体架构、数据流、前端注册机制 |
| [前端开发指南](./docs/frontend.md) | 页面组件、API 调用、构建流程 |
| [后端开发指南](./docs/backend.md) | 技能池同步、软件检测、HTTP API |
| [技能列表](./docs/skills.md) | 全部内置技能的详细说明 |
| [本地软件检测](./docs/software-detection.md) | 检测引擎工作原理与扩展方法 |
| [专家团](./docs/expert-teams.md) | 多智能体协同模式与自定义团队 |

### 重新生成 HTML

```bash
cd docs
python3 build_html.py
```

## License

MIT
