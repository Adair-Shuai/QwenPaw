# UGSci

> 面向石油领域的 QwenPaw 增强插件

[![Version](https://img.shields.io/badge/version-0.3.0-blue)](./plugin.json)
[![QwenPaw](https://img.shields.io/badge/QwenPaw-%E2%89%A52.1.0-green)](./plugin.json)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](#license)

UGSci 将 QwenPaw 的通用 Agent 界面重新组织为石油领域友好的 **专家 — 工具/引擎 — 技能** 分层架构，降低行业用户的使用门槛。所有展示层数据与 Agent 真实配置实时挂钩，所见即所得。

## 核心功能

### 三大模块

| 模块 | 路由 | 说明 |
|------|------|------|
| **专家·协作** | `/ugsci-experts` | 将 Agent 转化为领域专家卡片，展示技能/MCP/功能简介，支持创建专家、专家团多智能体协同 |
| **工具·技能** | `/ugsci-tools-skills` | 统一管理 MCP 与内置工具、仿真/领域/运行服务引擎、当前专家技能与技能库；完整嵌入原生 MCP、工具与 ACP 管理 |
| **市场** | `/ugsci-market` | 搜索技能市场并一键安装到指定 Agent；内置 6 个石油领域专家模板 |

旧路由 `/ugsci-capabilities` 与 `/ugsci-skills` 保持兼容，分别打开统一页面的工具、技能视图。

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

用户也可创建自定义专家团。团队定义以 QwenPaw 工作区后端存储为唯一来源；浏览器 `localStorage` 只用于旧版本迁移和离线缓存。编辑请求携带后端版本号，版本过期时返回冲突，避免多窗口相互覆盖。

插件工具采用 `plugin.json` 的 `meta.tools` 作为唯一目录（当前包含 GenUI、仿真和领域工具）；运行时代码只提供同名实现绑定。启动同步、工具中心展示和运行时注册都读取这份目录，声明与实现不一致时会显式报错。

### 本地软件检测

扫描主机系统已安装的油气仿真软件，检测结果可供 Agent 系统提示词注入：

**已知软件清单（12 款）：**

CMG Builder · CMG IMEX · CMG GEM · CMG STARS · Eclipse · Intersect · Petrel · tNavigator · Techlog · PIPESIM · OFM · CMG Results

### 导航简化

在 **Simple Mode**（极简模式）下，隐藏以下内置菜单项，保持左侧导航简洁：

| 隐藏项 | 说明 |
|--------|------|
| `core.skills` | 技能管理（统一入口位于工具·技能） |
| `core.tools` | 内置工具管理（原生功能嵌入工具·技能） |
| `core.mcp` | MCP 管理（原生功能嵌入工具·技能） |
| `core.acp` | ACP 配置（原生功能作为引擎运行服务嵌入工具·技能） |
| `core.agent-config` | Agent 配置（可在专家中心编辑） |
| `core.agent-stats` | Agent 统计 |
| `core.skill-pool` | 技能池管理（统一入口位于工具·技能） |

原生 `/mcp` 路由保持可用；统一页直接复用同一个 `MCPPage`，不维护独立 MCP 管理链路。

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
├── plugin.py                # 轻量后端入口（仅负责能力注册）
├── avatar.py                # 头像缓存、组合与 HTTP 路由
├── sim_api.py               # 仿真任务状态与 SSE 路由
├── skill_pool.py            # 技能池安装/卸载生命周期
├── engine/                  # 仿真引擎检测、配置、API 与运行工具
├── README.md                # 本文件
├── skills/                  # 内置技能目录（每个子目录含 SKILL.md）
│   ├── oil-gas-foundation/
│   ├── segy-operations/
│   ├── matplotlib/
│   └── ...
├── ui/                      # 前端源码
│   ├── src/index.ts         # 前端注册及页面装配入口
│   ├── src/core/            # Host 与 HTTP 运行时
│   ├── src/components/      # 可复用视图组件
│   ├── src/team/            # 专家团模型、状态和 API 客户端
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
2. 引擎管理与软件检测 HTTP 路由注册到 `/api/ugsci/engines/*`
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
| `qwenpaw_version.min` | `2.1.0` | 最低兼容版本 |
| `qwenpaw_version.max` | `2.2.0` | 最高兼容版本（右开区间） |

### HTTP API

插件在后端注册了以下路由（前缀 `/api/ugsci/engines`）：

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/detect` | 触发扫描并返回结果（带 5 分钟缓存） |
| `POST` | `/detect/refresh` | 忽略缓存并立即重新扫描 |
| `GET` | `/list` | 返回已配置的引擎列表 |
| `GET` | `/summary` | 返回简洁文本摘要（用于 Agent 系统提示词注入） |
| `GET` | `/icon/{engine_id}` | 返回引擎图标 |

另有统一能力健康接口 `GET /api/ugsci/health`，一次返回插件版本、已配置路由、24 个工具、领域依赖探测、领域引擎状态和仿真引擎状态。依赖缺失时响应会附带安装和启用提示。

自定义专家团存储发生 JSON 损坏时，插件会先将损坏文件隔离为带时间戳的 `.corrupt-*` 文件，再从 `.bak` 备份恢复；没有可用备份时也会保持 API 可用，等待用户重新保存团队。

## 卸载

卸载插件时，`ugsci_remove_pool_skills` 清理钩子会自动从技能池中移除 `installed_from: plugin:ugsci` 的技能条目，不影响用户手动安装的其他技能。

## 文档

完整文档位于 [`docs/`](./docs/) 目录，提供 Markdown 和 HTML 两种格式。

### HTML 文档（推荐）

安装运行后，右上角 **文档资料 → 使用教程** 会打开离线地址
`/api/ugsci/docs/`。发布包中的 HTML、CSS 和截图位于 `static/docs/`，无需联网。

源码开发时也可以直接打开 [`docs/user-manual.html`](./docs/user-manual.html)：

```bash
open docs/user-manual.html
```

### Markdown 源文件

| 文档 | 说明 |
|------|------|
| [零基础使用手册](./docs/user-manual.md) | 基于 QwenPaw 官方文档站并配有真实界面截图、可复制示例和故障排查 |
| [使用指南](./docs/user-guide.md) | 面向最终用户的安装、配置和日常使用指南 |
| [架构设计](./docs/architecture.md) | 插件整体架构、数据流、前端注册机制 |
| [前端开发指南](./docs/frontend.md) | 页面组件、API 调用、构建流程 |
| [后端开发指南](./docs/backend.md) | 技能池同步、软件检测、HTTP API |
| [技能列表](./docs/skills.md) | 全部内置技能的详细说明 |
| [本地软件检测](./docs/software-detection.md) | 检测引擎工作原理与扩展方法 |
| [专家团](./docs/expert-teams.md) | 多智能体协同模式与自定义团队 |

### 重新生成 HTML

```bash
python3 plugins/bundle/ugsci/docs/build_html.py
```

## License

MIT
