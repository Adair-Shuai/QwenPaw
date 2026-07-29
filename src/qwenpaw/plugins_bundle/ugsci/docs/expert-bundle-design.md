# UGSci 专家包（Expert Bundle）系统设计文档

> **版本**: 1.0  
> **日期**: 2026-07-25  
> **作者**: UGSci Team  
> **状态**: 设计阶段

---

## 目录

- [1. 背景与目标](#1-背景与目标)
- [2. 现状分析](#2-现状分析)
- [3. 整体架构](#3-整体架构)
- [4. 数据结构设计](#4-数据结构设计)
- [5. 头像系统设计](#5-头像系统设计)
- [6. 技能推荐设计](#6-技能推荐设计)
- [7. 附件与知识库接口](#7-附件与知识库接口)
- [8. MCP 接口预留](#8-mcp-接口预留)
- [9. 记忆接口预留](#9-记忆接口预留)
- [10. 远程专家包加载](#10-远程专家包加载)
- [11. 一键创建流程](#11-一键创建流程)
- [12. 市场源协议](#12-市场源协议)
- [13. 6 个内置专家包定义](#13-6-个内置专家包定义)
- [14. 实施路线图](#14-实施路线图)

---

## 1. 背景与目标

### 1.1 背景

UGSci 插件已有一个「专家市场」Tab，提供 6 个预设专家模板（油藏工程师、钻井工程师、测井分析师、采油工程师、地球物理专家、PVT 分析师）。但当前模板仅包含系统提示词和审批级别，**技能推荐为空**，且**未集成 MCP、知识库、记忆等能力**。

### 1.2 目标

将专家模板升级为「专家包」（Expert Bundle），实现：

| 目标 | 描述 |
|------|------|
| **开箱即用** | 用户一键创建专家，自动配置好提示词、技能、知识库等 |
| **接口预留** | 为 MCP、记忆、知识库等后续能力留好扩展接口 |
| **技能填充** | 每个专家根据领域匹配真实技能 |
| **头像升级** | 不用 emoji，使用现有 DiceBear PNG 头像系统 |
| **远程市场** | 支持从远程 URL 加载专家包定义 |

### 1.3 设计原则

1. **渐进式**：当前只实现提示词 + 技能，后续可逐步接入 MCP / 知识库 / 记忆
2. **兼容性**：新的 `ExpertBundle` 结构向后兼容旧 `ExpertTemplate`
3. **可分发**：一个专家包 = 一个 JSON 文件，可通过 URL 分享

---

## 2. 现状分析

### 2.1 当前专家模板结构

```typescript
// 当前: src/qwenpaw/plugins_bundle/ugsci/ui/src/index.ts:592
interface ExpertTemplate {
  id: string;
  name: string;
  emoji: string;              // ← 将废弃，改用 avatar
  category: string;
  description: string;
  systemPrompt: string;
  recommendedSkills: string[]; // ← 全部为空 []
  approvalLevel: "AUTO" | "MANUAL";
}
```

### 2.2 当前头像系统

头像使用 **DiceBear notionists** 风格，基于专家名称生成 PNG：

```
前端: ExpertAvatar({ name: "油藏工程师", size: 40 })
  → img src = /api/ugsci/avatar/油藏工程师
  → 后端 _get_or_fetch_avatar_png(seed="油藏工程师")
    → 本地缓存 ~/.qwenpaw/workspaces/default/resource/Avatar_xxx.png
    → 若无缓存: 从 https://api.dicebear.com/9.x/notionists/png?seed=油藏工程师 拉取
    → 若网络失败: 返回 ui/Default.png
```

**关键点**：头像的 seed 是专家名称。因此专家包只需声明 `name`，头像自动通过 `/ugsci/avatar/{name}` 获取。如果需要自定义头像，可通过 `avatar_url` 字段覆盖。

### 2.3 当前创建流程

```
handleSelectTemplate(template)
  ├── POST /api/agents (name, description, skill_names)
  ├── PUT /workspace/files/AGENTS.md (systemPrompt)
  └── PUT /api/agents/{id} (approval_level)
```

仅 3 步，缺少技能安装、MCP 配置、知识库写入等步骤。

### 2.4 可用技能清单

UGSci 插件 `skills/` 目录下共 50 个技能，油气领域相关核心技能：

| 技能名 | 领域 | 说明 |
|--------|------|------|
| `oil-gas-foundation` | 基础 | 油气行业基础知识 |
| `oil-gas-exploration` | 勘探 | 勘探流程与数据 |
| `oil-gas-drilling` | 钻井 | 钻井工程知识 |
| `oil-gas-reservoir-production` | 油藏生产 | 油藏开发与生产 |
| `oil-gas-midstream` | 中游 | 管道运输与存储 |
| `oil-gas-refining` | 下游 | 炼油与化工 |
| `well-log-analysis` | 测井 | 测井曲线解释 |
| `segy-operations` | 地球物理 | SEG-Y 地震数据处理 |
| `reservoir-simulation-workflow` | 油藏模拟 | 数值模拟工作流 |
| `history-matching` | 油藏工程 | 历史拟合 |
| `convergence-diagnosis` | 油藏模拟 | 收敛性诊断 |
| `scada-timeseries` | 生产 | SCADA 时序数据分析 |
| `using-petropowers` | 油气工具 | PetroPowers 集成 |

通用数据科学技能：

| 技能名 | 说明 |
|--------|------|
| `matplotlib` | 绘图 |
| `plotly` | 交互式图表 |
| `seaborn` | 统计可视化 |
| `statistical-analysis` | 统计分析 |
| `exploratory-data-analysis` | 探索性数据分析 |
| `sensitivity-analysis` | 敏感性分析 |
| `multi-objective-optimization` | 多目标优化 |
| `pymoo` | 优化框架 |
| `pymc` | 贝叶斯推断 |
| `scikit-learn` | 机器学习 |
| `shap` | 模型可解释性 |
| `statsmodels` | 统计模型 |
| `sympy` | 符号计算 |
| `geopandas` | 空间数据 |
| `polars` | 大数据处理 |
| `dask` | 分布式计算 |
| `hdf5-pde-data-loading` | HDF5 数据加载 |
| `networkx` | 网络分析 |
| `simpy` | 离散事件仿真 |
| `synthetic-data-generation` | 合成数据生成 |

---

## 3. 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      专家包市场                               │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ 内置专家包   │  │ 远程专家包   │  │ 企业内网专家包       │ │
│  │ (代码内置)   │  │ (URL fetch) │  │ (GitLab/Gitea)      │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                    │            │
│         └────────────────┼────────────────────┘            │
│                          ▼                                  │
│              ┌───────────────────────┐                      │
│              │  ExpertBundle 统一结构  │                      │
│              │  (manifest.json)      │                      │
│              └───────────┬───────────┘                      │
├──────────────────────────┼──────────────────────────────────┤
│                          ▼                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              一键创建流程 (7 步)                        │ │
│  │                                                       │ │
│  │  Step 1: 创建 Agent (POST /api/agents)                │ │
│  │  Step 2: 写入提示词文件 (AGENTS.md / SOUL.md / ...)   │ │
│  │  Step 3: 写入知识库文件 (standards/ *.md)             │ │
│  │  Step 4: 更新配置 (system_prompt_files, approval)     │ │
│  │  Step 5: 下载+启用技能 (skills/pool/download)         │ │
│  │  Step 6: 配置 MCP 客户端 (POST /api/mcp/clients)      │ │
│  │  Step 7: 注入预设记忆 (POST /memory/proactive/add)    │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. 数据结构设计

### 4.1 ExpertBundle 主结构

```typescript
/**
 * 专家包 — 一个完整的、可分发的专家定义。
 *
 * 一个专家包包含创建一个开箱即用的专家所需的所有信息：
 * 提示词、技能、知识库文件、MCP 客户端配置、预设记忆等。
 *
 * 分发方式：单个 JSON 文件，可通过 URL 分享。
 * 加载方式：内置 / 远程 URL / 企业 Git 仓库。
 */
interface ExpertBundle {
  // ── 元信息 ──────────────────────────────────────
  /** 全局唯一标识，如 "reservoir-engineer" */
  id: string;
  /** 专家显示名称，如 "油藏工程师" */
  name: string;
  /** 专家分类，如 "油气开发" */
  category: string;
  /** 一句话描述（支持 Markdown） */
  description: string;
  /** 专家包版本，语义化版本号，如 "1.0.0" */
  version: string;
  /** 作者或组织 */
  author: string;
  /** 标签，用于市场搜索和筛选 */
  tags: string[];

  // ── 头像 ──────────────────────────────────────
  /**
   * 头像种子。若不设置，默认使用 name 作为种子。
   * 系统通过 /ugsci/avatar/{avatar_seed} 获取 DiceBear PNG。
   */
  avatar_seed?: string;
  /**
   * 自定义头像 URL（可选）。若设置，优先于 avatar_seed 使用。
   * 支持 data: URL（base64 内嵌）或 https: URL。
   */
  avatar_url?: string;

  // ── 提示词层 ──────────────────────────────────
  /** 系统提示词，写入 AGENTS.md（必填） */
  system_prompt: string;
  /** 灵魂设定，写入 SOUL.md（可选，定义专家性格/价值观/语气） */
  soul_prompt?: string;
  /** 专家档案，写入 PROFILE.md（可选，定义履历/擅长领域/限制） */
  profile_prompt?: string;

  // ── 技能层 ──────────────────────────────────
  /** 推荐技能列表（skill name 数组，从 skill pool 下载并启用） */
  recommended_skills: string[];

  // ── 知识库层（接口预留，当前可不填） ────────────
  /** 附加知识库文件，写入 workspace 的 knowledge/ 目录 */
  knowledge_files?: KnowledgeFile[];

  // ── MCP 层（接口预留，当前可不填） ──────────────
  /** 自动配置的 MCP 客户端 */
  mcp_clients?: MCPClientConfig[];

  // ── 记忆层（接口预留，当前可不填） ──────────────
  /** 预设记忆条目，创建后自动注入 */
  memory_seeds?: MemorySeed[];

  // ── 行为配置 ──────────────────────────────────
  /** 审批级别：AUTO（自动执行）或 MANUAL（需人工审批） */
  approval_level: "AUTO" | "MANUAL";
  /** 推荐模型配置（可选） */
  model_config?: {
    provider_id?: string;
    model?: string;
  };
  /** 欢迎消息（可选，覆盖默认欢迎语） */
  welcome_message?: string;
}
```

### 4.2 知识库文件结构

```typescript
/**
 * 知识库文件 — 附加到专家 workspace 的文档。
 *
 * 用途：行业规范、案例模板、检查清单、数据字典等。
 * 存储：写入 workspace/files/{filename}
 * 启用：若 enabled=true，自动加入 system_prompt_files 列表。
 */
interface KnowledgeFile {
  /** 文件路径（相对 workspace），如 "standards/SY-T-5367.md" */
  filename: string;
  /** 文件内容（文本） */
  content: string;
  /** 是否自动加入 system_prompt_files（默认 false） */
  enabled?: boolean;
  /** 文件描述（仅用于市场展示） */
  description?: string;
}
```

### 4.3 MCP 客户端配置结构

```typescript
/**
 * MCP 客户端配置 — 创建专家时自动配置的 MCP 连接。
 *
 * 结构与现有 POST /api/mcp/clients 请求体一致。
 */
interface MCPClientConfig {
  /** 客户端唯一 key */
  client_key: string;
  /** 显示名称 */
  name: string;
  /** 描述 */
  description: string;
  /** 传输类型 */
  transport: "stdio" | "streamable_http" | "sse";
  /** stdio: 启动命令 */
  command?: string;
  /** stdio: 命令参数 */
  args?: string[];
  /** stdio: 环境变量 */
  env?: Record<string, string>;
  /** stdio: 工作目录 */
  cwd?: string;
  /** http/sse: 服务端 URL */
  url?: string;
  /** http/sse: 请求头 */
  headers?: Record<string, string>;
  /** 工具白名单（null = 加载全部工具） */
  tools?: string[] | null;
}
```

### 4.4 记忆种子结构

```typescript
/**
 * 记忆种子 — 创建专家时预设的记忆条目。
 *
 * 用途：专家经验、操作规范、常见陷阱提醒等。
 * 这些记忆会在专家创建后自动注入，让专家"一出生就具备经验"。
 */
interface MemorySeed {
  /** 记忆类型 */
  type: "proactive" | "episodic";
  /** 记忆内容 */
  content: string;
  /** 元数据（可选） */
  metadata?: Record<string, any>;
}
```

---

## 5. 头像系统设计

### 5.1 当前机制

```
ExpertAvatar({ name: "油藏工程师" })
  → GET /api/ugsci/avatar/油藏工程师
  → 后端: _get_or_fetch_avatar_png("油藏工程师")
    → 缓存: ~/.qwenpaw/workspaces/default/resource/Avatar_xxx.png
    → 在线: https://api.dicebear.com/9.x/notionists/png?seed=油藏工程师
    → 兜底: ui/Default.png
```

### 5.2 专家包头像策略

专家包**不使用 emoji**，而是通过以下优先级确定头像：

```
1. avatar_url（自定义 URL，支持 data: / https:）
2. avatar_seed（DiceBear 种子，默认 = name）
3. name（兜底，作为 DiceBear 种子）
```

前端渲染逻辑：

```typescript
function getBundleAvatarUrl(bundle: ExpertBundle): string {
  // 优先级 1: 自定义头像 URL
  if (bundle.avatar_url) {
    return bundle.avatar_url;
  }
  // 优先级 2/3: DiceBear（使用 avatar_seed 或 name 作为种子）
  const seed = bundle.avatar_seed || bundle.name;
  return apiUrl(`/ugsci/avatar/${encodeURIComponent(seed)}`);
}
```

### 5.3 内置专家包头像

6 个内置专家保持现有 DiceBear 头像不变（seed = 专家名称），因为：

1. DiceBear notionists 风格已经为每个专家生成了独特的 PNG 头像
2. 头像已在后端启动时预加载到本地缓存（`_prewarm_avatar_cache`）
3. 前端 `ExpertAvatar` 组件已稳定运行

**远程专家包**可以通过 `avatar_url` 提供自定义头像（如 base64 内嵌的 PNG 或 CDN URL）。

### 5.4 头像附件

对于需要附带头像图片文件的场景（如离线环境），专家包 JSON 可使用 `data:` URL 内嵌头像：

```json
{
  "avatar_url": "data:image/png;base64,iVBORw0KGgo..."
}
```

---

## 6. 技能推荐设计

### 6.1 匹配原则

为每个专家推荐技能时遵循以下原则：

1. **领域核心技能**：与专家领域直接对应的油气技能（必选）
2. **通用工具技能**：绘图、统计分析等数据科学技能（按需选择 2-3 个）
3. **协作技能**：多智能体协作相关技能（可选）
4. **数量控制**：总推荐 5-8 个，不宜过多导致 Prompt 过长

### 6.2 技能推荐映射

| 专家 | 推荐技能 | 理由 |
|------|----------|------|
| **油藏工程师** | `oil-gas-foundation` | 行业基础 |
| | `oil-gas-reservoir-production` | 油藏开发与生产核心 |
| | `reservoir-simulation-workflow` | 数值模拟工作流 |
| | `history-matching` | 历史拟合 |
| | `convergence-diagnosis` | 模拟收敛诊断 |
| | `matplotlib` | 绘图制表 |
| | `statistical-analysis` | 统计分析 |
| | `sensitivity-analysis` | 参数敏感性分析 |
| **钻井工程师** | `oil-gas-foundation` | 行业基础 |
| | `oil-gas-drilling` | 钻井工程核心 |
| | `oil-gas-reservoir-production` | 地层压力与完井 |
| | `matplotlib` | 绘图 |
| | `statistical-analysis` | 统计分析 |
| | `systematic-debugging` | 井下复杂情况排查 |
| **测井分析师** | `oil-gas-foundation` | 行业基础 |
| | `well-log-analysis` | 测井解释核心 |
| | `oil-gas-exploration` | 勘探背景知识 |
| | `exploratory-data-analysis` | 曲线数据探索 |
| | `matplotlib` | 测井曲线绘图 |
| | `statistical-analysis` | 统计分析 |
| | `scikit-learn` | 岩性识别（机器学习） |
| **采油工程师** | `oil-gas-foundation` | 行业基础 |
| | `oil-gas-reservoir-production` | 生产动态核心 |
| | `scada-timeseries` | SCADA 生产数据 |
| | `matplotlib` | 生产曲线绘图 |
| | `statistical-analysis` | 生产统计 |
| | `sensitivity-analysis` | 措施效果分析 |
| | `multi-objective-optimization` | 注采优化 |
| **地球物理专家** | `oil-gas-foundation` | 行业基础 |
| | `oil-gas-exploration` | 勘探核心 |
| | `segy-operations` | SEG-Y 地震数据处理 |
| | `matplotlib` | 地震属性绘图 |
| | `statistical-analysis` | 统计分析 |
| | `exploratory-data-analysis` | 数据探索 |
| | `scikit-learn` | 储层预测（机器学习） |
| **PVT 分析师** | `oil-gas-foundation` | 行业基础 |
| | `oil-gas-reservoir-production` | 流体物性核心 |
| | `matplotlib` | 相图绘制 |
| | `statistical-analysis` | 实验数据拟合 |
| | `sensitivity-analysis` | 参数敏感性 |
| | `sympy` | 符号计算（状态方程） |
| | `pymoo` | 组分模型优化 |

---

## 7. 附件与知识库接口

### 7.1 附件概念

每个专家包可携带以下类型的「附件」：

| 附件类型 | 字段 | 当前状态 | 说明 |
|----------|------|----------|------|
| **提示词文件** | `system_prompt` / `soul_prompt` / `profile_prompt` | ✅ 本期实现 | 写入 workspace 的 AGENTS.md / SOUL.md / PROFILE.md |
| **知识库文件** | `knowledge_files[]` | 🔲 接口预留 | 行业规范、案例模板、检查清单等 |
| **技能配置** | `recommended_skills[]` | ✅ 本期实现 | 从 skill pool 下载并启用 |
| **MCP 客户端** | `mcp_clients[]` | 🔲 接口预留 | 自动配置的 MCP 连接 |
| **预设记忆** | `memory_seeds[]` | 🔲 接口预留 | 专家经验注入 |
| **头像文件** | `avatar_url` / `avatar_seed` | ✅ 本期实现 | DiceBear PNG 或自定义图片 |

### 7.2 知识库文件存储结构

创建专家后，workspace 中的文件结构：

```
~/.qwenpaw/workspaces/{agent_id}/
├── files/
│   ├── AGENTS.md                    ← system_prompt
│   ├── SOUL.md                      ← soul_prompt (可选)
│   ├── PROFILE.md                   ← profile_prompt (可选)
│   ├── standards/
│   │   ├── SY-T-5367.md             ← knowledge_files
│   │   └── SY-T-5431.md
│   ├── templates/
│   │   └── history-matching-checklist.md
│   └── references/
│       └── eclipse-keywords.md
├── skills/
│   ├── reservoir-simulation-workflow/
│   │   └── SKILL.md
│   ├── history-matching/
│   │   └── SKILL.md
│   └── ...
├── config.yaml                      ← agent config
└── memory/                          ← memory_seeds (未来)
```

### 7.3 知识库文件启用机制

并非所有知识库文件都需要自动加载到 Prompt 中：

- `enabled: true` → 自动加入 `system_prompt_files`，作为系统提示词的一部分
- `enabled: false` → 仅写入文件，用户可在专家配置中手动启用

示例：
```json
{
  "knowledge_files": [
    {
      "filename": "standards/SY-T-5367.md",
      "content": "# SY/T 5367-2010 油藏工程计算规范\n...",
      "enabled": true,
      "description": "油藏储量计算行业标准"
    },
    {
      "filename": "templates/history-matching-checklist.md",
      "content": "# 历史拟合检查清单\n...",
      "enabled": false,
      "description": "历史拟合工作检查清单，按需启用"
    }
  ]
}
```

---

## 8. MCP 接口预留

### 8.1 设计思路

MCP 客户端配置与现有 `POST /api/mcp/clients` 接口完全对齐，创建专家时批量调用。

### 8.2 示例（未来使用）

```json
{
  "mcp_clients": [
    {
      "client_key": "eclipse-mcp",
      "name": "Eclipse 模拟器",
      "description": "Schlumberger Eclipse 油藏模拟器连接",
      "transport": "stdio",
      "command": "python",
      "args": ["-m", "eclipse_mcp_server"],
      "tools": ["eclipse_run", "eclipse_get_progress", "eclipse_read_summary"]
    },
    {
      "client_key": "filesystem",
      "name": "文件系统",
      "description": "提供文件读写能力",
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/"]
    }
  ]
}
```

### 8.3 安装时序

```
for each mcp in bundle.mcp_clients:
  POST /api/mcp/clients
    body: { client_key, client: { ...mcp } }
    header: X-Agent-Id = {agent_id}
```

---

## 9. 记忆接口预留

### 9.1 设计思路

预设记忆让专家「一出生就具备经验」。例如油藏工程师创建时就「知道」历史拟合应先拟合全区压力再拟合单井。

### 9.2 示例（未来使用）

```json
{
  "memory_seeds": [
    {
      "type": "proactive",
      "content": "历史拟合时，优先拟合全区压力和产油量，再拟合单井指标",
      "metadata": { "category": "best-practice" }
    },
    {
      "type": "proactive",
      "content": "Eclipse DATA 文件中关键字对大小写不敏感，但建议统一使用大写",
      "metadata": { "category": "tip" }
    }
  ]
}
```

---

## 10. 远程专家包加载

### 10.1 加载流程

```
用户在市场页面配置专家源 URL
  → 前端 fetch(url) 获取 JSON
  → 解析为 ExpertBundle[]
  → 展示在「专家模板」Tab
  → 用户点击「一键创建」
  → 执行 7 步创建流程
```

### 10.2 专家源 JSON 格式

远程专家源返回的 JSON 支持两种格式：

**格式 A：单个专家包**
```json
{
  "id": "reservoir-engineer-pro",
  "name": "高级油藏工程师",
  "version": "1.0.0",
  ...
}
```

**格式 B：专家包集合（推荐）**
```json
{
  "version": "1.0",
  "bundles": [
    { "id": "reservoir-engineer-pro", "name": "高级油藏工程师", ... },
    { "id": "drilling-engineer-pro", "name": "高级钻井工程师", ... }
  ]
}
```

### 10.3 专家源配置 UI

复用现有的 `GenericSourceConfigModal`（`type: "expert"`），用户可：

- 添加远程 URL（指向专家包 JSON）
- 启用/禁用某个源
- 导入/导出源配置 JSON（团队共享）

---

## 11. 一键创建流程

### 11.1 完整流程（7 步）

```typescript
async function installExpertBundle(bundle: ExpertBundle): Promise<string> {
  // ── Step 1: 创建 Agent ──
  const agentRef = await apiFetch("/agents", {
    method: "POST",
    body: JSON.stringify({
      name: bundle.name,
      description: bundle.description,
      skill_names: bundle.recommended_skills,  // 同时传入技能名
    }),
  });
  const agentId = agentRef.id;

  // ── Step 2: 写入提示词文件 ──
  await writeKnowledgeFile(agentId, "AGENTS.md", bundle.system_prompt);
  if (bundle.soul_prompt) {
    await writeKnowledgeFile(agentId, "SOUL.md", bundle.soul_prompt);
  }
  if (bundle.profile_prompt) {
    await writeKnowledgeFile(agentId, "PROFILE.md", bundle.profile_prompt);
  }

  // ── Step 3: 写入知识库文件（接口预留，当前可跳过） ──
  const promptFiles = ["AGENTS.md"];
  if (bundle.soul_prompt) promptFiles.push("SOUL.md");
  if (bundle.profile_prompt) promptFiles.push("PROFILE.md");

  for (const kf of bundle.knowledge_files || []) {
    await writeKnowledgeFile(agentId, kf.filename, kf.content);
    if (kf.enabled) promptFiles.push(kf.filename);
  }

  // ── Step 4: 更新 Agent 配置 ──
  const config = await fetchAgentConfig(agentId);
  config.system_prompt_files = promptFiles;
  config.approval_level = bundle.approval_level;
  if (bundle.model_config) {
    config.active_model = bundle.model_config;
  }
  await apiFetch(`/agents/${agentId}`, {
    method: "PUT",
    body: JSON.stringify(config),
  });

  // ── Step 5: 下载并启用技能 ──
  // 技能已在 Step 1 通过 skill_names 传入，此处确保启用
  if (bundle.recommended_skills.length > 0) {
    await apiFetch("/skills/batch-enable", {
      method: "POST",
      headers: { "X-Agent-Id": agentId },
      body: JSON.stringify({ skill_names: bundle.recommended_skills }),
    });
  }

  // ── Step 6: 配置 MCP 客户端（接口预留，当前可跳过） ──
  for (const mcp of bundle.mcp_clients || []) {
    await createMCPForAgent(agentId, {
      client_key: mcp.client_key,
      client: {
        name: mcp.name,
        description: mcp.description,
        enabled: true,
        transport: mcp.transport,
        command: mcp.command || "",
        args: mcp.args || [],
        env: mcp.env || {},
        url: mcp.url || "",
        headers: mcp.headers || {},
        tools: mcp.tools,
      },
    });
  }

  // ── Step 7: 注入预设记忆（接口预留，当前可跳过） ──
  for (const seed of bundle.memory_seeds || []) {
    await apiFetch("/memory/proactive/add", {
      method: "POST",
      headers: { "X-Agent-Id": agentId },
      body: JSON.stringify({
        type: seed.type,
        content: seed.content,
        metadata: seed.metadata,
      }),
    });
  }

  return agentId;
}
```

### 11.2 错误处理策略

| 步骤 | 失败处理 |
|------|---------|
| Step 1 (创建 Agent) | 直接报错，不继续 |
| Step 2 (写提示词) | 报错，提示用户手动编辑 |
| Step 3 (知识库) | 跳过该文件，记录警告 |
| Step 4 (更新配置) | 报错，提示用户手动配置 |
| Step 5 (启用技能) | 跳过失败的技能，记录警告 |
| Step 6 (MCP) | 跳过该 MCP，记录警告 |
| Step 7 (记忆) | 跳过，记录警告 |

**核心原则**：提示词和技能必须成功，其他步骤失败不阻塞创建。

### 11.3 进度展示

创建过程中展示进度条：

```
正在创建专家「油藏工程师」...
✅ 创建 Agent
✅ 写入提示词 (AGENTS.md, SOUL.md)
✅ 写入知识库 (3 个文件)
✅ 更新配置
⏳ 启用技能 (5/8)
⬜ 配置 MCP 客户端
⬜ 注入预设记忆
```

---

## 12. 市场源协议

### 12.1 市场源 JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["version", "bundles"],
  "properties": {
    "version": { "type": "string", "description": "市场源协议版本" },
    "bundles": {
      "type": "array",
      "items": { "$ref": "#/definitions/ExpertBundle" }
    }
  },
  "definitions": {
    "ExpertBundle": {
      "type": "object",
      "required": ["id", "name", "category", "description", "version", "author", "system_prompt", "recommended_skills", "approval_level"],
      "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "category": { "type": "string" },
        "description": { "type": "string" },
        "version": { "type": "string" },
        "author": { "type": "string" },
        "tags": { "type": "array", "items": { "type": "string" } },
        "avatar_seed": { "type": "string" },
        "avatar_url": { "type": "string" },
        "system_prompt": { "type": "string" },
        "soul_prompt": { "type": "string" },
        "profile_prompt": { "type": "string" },
        "recommended_skills": { "type": "array", "items": { "type": "string" } },
        "knowledge_files": { "type": "array", "items": { "$ref": "#/definitions/KnowledgeFile" } },
        "mcp_clients": { "type": "array", "items": { "$ref": "#/definitions/MCPClientConfig" } },
        "memory_seeds": { "type": "array", "items": { "$ref": "#/definitions/MemorySeed" } },
        "approval_level": { "type": "string", "enum": ["AUTO", "MANUAL"] },
        "model_config": { "type": "object" },
        "welcome_message": { "type": "string" }
      }
    }
  }
}
```

### 12.2 市场源 URL 示例

```
https://raw.githubusercontent.com/ugsci-team/expert-bundles/main/bundles.json
```

或企业内网：

```
https://gitlab.internal.petrocompany.com/oil-gas/expert-bundles/-/raw/main/bundles.json
```

### 12.3 市场源缓存

- 前端每次打开市场页面时 fetch 远程源
- fetch 结果缓存在内存（非 localStorage），刷新页面重新获取
- fetch 失败时展示内置专家包 + 已缓存的远程专家包
- 支持手动刷新按钮重新拉取

---

## 13. 6 个内置专家包定义

以下是 6 个内置专家包的完整定义。**当前阶段**只实现 `system_prompt` + `recommended_skills` + `approval_level`，其他字段为接口预留（标注 `// 未来`）。

### 13.1 油藏工程师

```json
{
  "id": "reservoir-engineer",
  "name": "油藏工程师",
  "category": "油气开发",
  "description": "**油藏工程师** —— 擅长储量评估、物质平衡计算、递减曲线分析、油藏数值模拟方案设计。",
  "version": "1.0.0",
  "author": "UGSci Team",
  "tags": ["油藏", "数值模拟", "储量评估", "历史拟合"],
  "avatar_seed": "油藏工程师",
  "system_prompt": "# 油藏工程师\n\n你是一位经验丰富的油藏工程师，专注于油气田开发与油藏管理。\n\n## 核心能力\n- 储量评估（容积法、物质平衡法、递减曲线法）\n- 油藏数值模拟方案设计与参数优化\n- 生产动态分析与产量预测\n- 注水/注气开发方案设计及效果评价\n- 经济评价与开发方案比选\n\n## 工作准则\n- 所有计算需给出公式推导过程和参数来源\n- 引用标准时注明编号（如 SY/T 5367）\n- 对不确定参数给出合理范围和敏感性分析\n- 输出结果使用表格和图示说明",
  "recommended_skills": [
    "oil-gas-foundation",
    "oil-gas-reservoir-production",
    "reservoir-simulation-workflow",
    "history-matching",
    "convergence-diagnosis",
    "matplotlib",
    "statistical-analysis",
    "sensitivity-analysis"
  ],
  "approval_level": "AUTO",
  "knowledge_files": [],
  "mcp_clients": [],
  "memory_seeds": []
}
```

### 13.2 钻井工程师

```json
{
  "id": "drilling-engineer",
  "name": "钻井工程师",
  "category": "钻完井",
  "description": "**钻井工程师** —— 擅长井身结构设计、钻井液优化、套管设计、固井方案和钻井风险管理。",
  "version": "1.0.0",
  "author": "UGSci Team",
  "tags": ["钻井", "套管设计", "钻井液", "固井"],
  "avatar_seed": "钻井工程师",
  "system_prompt": "# 钻井工程师\n\n你是一位资深钻井工程师，专注于钻井工程设计与现场技术支持。\n\n## 核心能力\n- 井身结构设计（套管程序、深度确定）\n- 钻井液体系选择与性能优化\n- 套管强度设计与固井方案\n- 钻头选型与钻具组合优化\n- 井下复杂情况处理（井漏、井喷、卡钻）\n- 钻井成本估算与工期排程\n\n## 工作准则\n- 设计参数需符合 SY/T 5431 等行业标准\n- 安全系数取值需说明依据\n- 对复杂井段给出风险预警和应急预案",
  "recommended_skills": [
    "oil-gas-foundation",
    "oil-gas-drilling",
    "oil-gas-reservoir-production",
    "matplotlib",
    "statistical-analysis",
    "systematic-debugging"
  ],
  "approval_level": "MANUAL",
  "knowledge_files": [],
  "mcp_clients": [],
  "memory_seeds": []
}
```

### 13.3 测井分析师

```json
{
  "id": "well-logging-analyst",
  "name": "测井分析师",
  "category": "测井试油",
  "description": "**测井分析师** —— 擅长测井曲线解释、岩性识别、孔隙度/饱和度计算和储层评价。",
  "version": "1.0.0",
  "author": "UGSci Team",
  "tags": ["测井", "岩性识别", "储层评价", "孔隙度"],
  "avatar_seed": "测井分析师",
  "system_prompt": "# 测井分析师\n\n你是一位专业的测井解释工程师，精通各种测井方法的数据处理与解释。\n\n## 核心能力\n- 常规测井曲线解释（GR、SP、RT、AC、CNL、DEN）\n- 岩性识别与地层划分\n- 孔隙度、渗透率、饱和度参数计算\n- 测井相分析与沉积相解释\n- 固井质量评价（CBL/VDL）\n- 测井数据质量控制与标准化\n\n## 工作准则\n- 解释结论需说明所用公式和参数取值\n- 对异常曲线段给出多种可能解释\n- 储层评价需综合多条曲线交叉验证",
  "recommended_skills": [
    "oil-gas-foundation",
    "well-log-analysis",
    "oil-gas-exploration",
    "exploratory-data-analysis",
    "matplotlib",
    "statistical-analysis",
    "scikit-learn"
  ],
  "approval_level": "AUTO",
  "knowledge_files": [],
  "mcp_clients": [],
  "memory_seeds": []
}
```

### 13.4 采油工程师

```json
{
  "id": "production-engineer",
  "name": "采油工程师",
  "category": "油气生产",
  "description": "**采油工程师** —— 擅长举升工艺设计、注水管理、增产措施工艺设计和生产动态监测。",
  "version": "1.0.0",
  "author": "UGSci Team",
  "tags": ["采油", "举升工艺", "注水", "压裂酸化"],
  "avatar_seed": "采油工程师",
  "system_prompt": "# 采油工程师\n\n你是一位经验丰富的采油工程师，专注于油气井生产优化与工艺设计。\n\n## 核心能力\n- 人工举升工艺设计（有杆泵、电潜泵、气举）\n- 注水井调配与注采对应分析\n- 压裂/酸化增产措施工艺设计\n- 生产动态监测与分析（产液剖面、吸水剖面）\n- 井筒完整性评估与防腐防垢\n- 生产管柱优化设计\n\n## 工作准则\n- 工艺设计需给出选型依据和参数计算\n- 措施方案需包含预期效果和风险评估\n- 引用规范时注明标准编号",
  "recommended_skills": [
    "oil-gas-foundation",
    "oil-gas-reservoir-production",
    "scada-timeseries",
    "matplotlib",
    "statistical-analysis",
    "sensitivity-analysis",
    "multi-objective-optimization"
  ],
  "approval_level": "AUTO",
  "knowledge_files": [],
  "mcp_clients": [],
  "memory_seeds": []
}
```

### 13.5 地球物理专家

```json
{
  "id": "geophysicist",
  "name": "地球物理专家",
  "category": "地球物理",
  "description": "**地球物理专家** —— 擅长地震资料解释、属性分析、反演处理和储层预测。",
  "version": "1.0.0",
  "author": "UGSci Team",
  "tags": ["地球物理", "地震", "反演", "储层预测"],
  "avatar_seed": "地球物理专家",
  "system_prompt": "# 地球物理专家\n\n你是一位资深的地球物理学家，专注于地震勘探与储层地球物理。\n\n## 核心能力\n- 地震资料构造解释与层位标定\n- 地震属性分析与提取\n- 地震反演（波阻抗反演、AVO分析）\n- 储层预测与含油气性检测\n- 地震地质综合解释\n- 微地震监测与压裂效果评估\n\n## 工作准则\n- 解释成果需结合地质、测井等多源数据\n- 对地震资料品质给出评价\n- 反演结果需标定并说明不确定性",
  "recommended_skills": [
    "oil-gas-foundation",
    "oil-gas-exploration",
    "segy-operations",
    "matplotlib",
    "statistical-analysis",
    "exploratory-data-analysis",
    "scikit-learn"
  ],
  "approval_level": "AUTO",
  "knowledge_files": [],
  "mcp_clients": [],
  "memory_seeds": []
}
```

### 13.6 PVT 分析师

```json
{
  "id": "pvt-analyst",
  "name": "PVT 分析师",
  "category": "流体性质",
  "description": "**PVT 分析师** —— 擅长油气流体物性计算、相态分析、PVT 实验拟合和组分模型。",
  "version": "1.0.0",
  "author": "UGSci Team",
  "tags": ["PVT", "相态分析", "流体物性", "状态方程"],
  "avatar_seed": "PVT 分析师",
  "system_prompt": "# PVT 分析师\n\n你是一位专业的 PVT 流体性质分析工程师，精通油气藏流体相态行为。\n\n## 核心能力\n- 原油/天然气/凝析油 PVT 物性参数计算\n- 流体相态分析（相图绘制、饱和压力计算）\n- PVT 实验数据拟合（CCE、DL、CVD）\n- 状态方程选择与组分模型建立\n- 注气/注 CO2 相态模拟\n- 流体物性经验公式应用与验证\n\n## 工作准则\n- 所有物性参数需注明计算方法和适用范围\n- 对缺少实验数据的情况推荐经验公式并说明误差\n- 组分模型需给出特征化步骤和拟合质量",
  "recommended_skills": [
    "oil-gas-foundation",
    "oil-gas-reservoir-production",
    "matplotlib",
    "statistical-analysis",
    "sensitivity-analysis",
    "sympy",
    "pymoo"
  ],
  "approval_level": "AUTO",
  "knowledge_files": [],
  "mcp_clients": [],
  "memory_seeds": []
}
```

---

## 14. 实施路线图

### 14.1 分期实施

| 阶段 | 内容 | 状态 |
|------|------|------|
| **Phase 1（本期）** | 升级 ExpertTemplate → ExpertBundle 数据结构；填充 recommended_skills；更新头像（移除 emoji，使用 ExpertAvatar） | 🔨 进行中 |
| **Phase 2** | 实现远程专家包 fetch 逻辑；市场源 UI 展示远程专家包 | ⬜ 待实施 |
| **Phase 3** | 实现 knowledge_files 写入和 system_prompt_files 更新 | ⬜ 待实施 |
| **Phase 4** | 实现 mcp_clients 自动配置 | ⬜ 待实施 |
| **Phase 5** | 实现 memory_seeds 注入 | ⬜ 待实施 |
| **Phase 6** | 专家包导出（将已配置好的专家导出为 Bundle JSON 分享） | ⬜ 待实施 |

### 14.2 Phase 1 具体改动

#### 代码改动清单

| 文件 | 改动 | 说明 |
|------|------|------|
| `ugsci/ui/src/index.ts` | 升级 `ExpertTemplate` 接口为 `ExpertBundle` | 新增 version, author, tags, avatar_seed, avatar_url, knowledge_files, mcp_clients, memory_seeds 字段 |
| `ugsci/ui/src/index.ts` | 更新 `EXPERT_TEMPLATES` 数组 | 填充 recommended_skills，移除 emoji 字段，新增预留字段（空数组） |
| `ugsci/ui/src/index.ts` | 更新 `handleSelectTemplate` / `handleQuickCreateExpert` | 使用 ExpertAvatar 替代 emoji；技能推荐传入真实 skill 名 |
| `ugsci/ui/src/index.ts` | 更新专家模板卡片渲染 | 使用 `ExpertAvatar({ name: bundle.name })` 替代 emoji 显示 |
| `ugsci/plugin.py` | 更新 `_PRESET_EXPERT_NAMES` | 确保头像预加载列表与专家名称一致（当前已一致） |

#### 不需要改动的部分

- `ExpertAvatar` 组件：已支持按 name 渲染 DiceBear PNG，无需修改
- 后端头像路由：`/ugsci/avatar/{seed}` 已稳定运行，无需修改
- `writeKnowledgeFile` 函数：已支持任意文件名写入，无需修改
- `createMCPForAgent` 函数：已存在，Phase 4 时直接调用
- 技能安装 API：`/skills/batch-enable` 已存在，直接调用

### 14.3 兼容性说明

- 旧的 `ExpertTemplate` 接口字段（`emoji`, `systemPrompt`, `recommendedSkills`, `approvalLevel`）在新结构中映射为 `avatar_seed`(弃用 emoji), `system_prompt`, `recommended_skills`, `approval_level`
- 前端渲染时对旧字段做兼容处理（`bundle.emoji || bundle.avatar_seed`）
- 后端无需改动

---

## 附录 A: 市场源 JSON 完整示例

以下是一个完整的市场源 JSON 文件示例，可供准备市场源时参考：

```json
{
  "version": "1.0",
  "bundles": [
    {
      "id": "reservoir-engineer",
      "name": "油藏工程师",
      "category": "油气开发",
      "description": "**油藏工程师** —— 擅长储量评估、物质平衡计算、递减曲线分析、油藏数值模拟方案设计。",
      "version": "1.0.0",
      "author": "UGSci Team",
      "tags": ["油藏", "数值模拟", "储量评估"],
      "avatar_seed": "油藏工程师",
      "system_prompt": "# 油藏工程师\n\n你是一位经验丰富的油藏工程师...",
      "recommended_skills": [
        "oil-gas-foundation",
        "oil-gas-reservoir-production",
        "reservoir-simulation-workflow",
        "history-matching",
        "convergence-diagnosis",
        "matplotlib",
        "statistical-analysis",
        "sensitivity-analysis"
      ],
      "knowledge_files": [],
      "mcp_clients": [],
      "memory_seeds": [],
      "approval_level": "AUTO"
    },
    {
      "id": "reservoir-engineer-pro",
      "name": "高级油藏工程师",
      "category": "油气开发",
      "description": "集成 Eclipse 模拟器、历史拟合技能、行业规范知识库的完整油藏工程专家。",
      "version": "2.0.0",
      "author": "UGSci Team",
      "tags": ["油藏", "Eclipse", "历史拟合", "高级"],
      "avatar_url": "data:image/png;base64,iVBORw0KGgo...",
      "system_prompt": "# 高级油藏工程师\n\n你是一位集成模拟器能力的资深油藏工程师...",
      "soul_prompt": "# 专家性格\n严谨、数据驱动、注重不确定性分析...",
      "profile_prompt": "# 专家档案\n擅长: 黑油模型、组分模型、历史拟合...",
      "recommended_skills": [
        "oil-gas-foundation",
        "oil-gas-reservoir-production",
        "reservoir-simulation-workflow",
        "history-matching",
        "convergence-diagnosis",
        "matplotlib",
        "statistical-analysis",
        "sensitivity-analysis",
        "exploratory-data-analysis",
        "multi-objective-optimization"
      ],
      "knowledge_files": [
        {
          "filename": "standards/SY-T-5367.md",
          "content": "# SY/T 5367-2010 油藏工程计算规范\n\n## 1. 范围\n...",
          "enabled": true,
          "description": "油藏储量计算行业标准"
        },
        {
          "filename": "templates/history-matching-checklist.md",
          "content": "# 历史拟合检查清单\n\n## 全区拟合\n- [ ] 全区压力拟合...",
          "enabled": true,
          "description": "历史拟合工作检查清单"
        }
      ],
      "mcp_clients": [
        {
          "client_key": "eclipse-mcp",
          "name": "Eclipse 模拟器",
          "description": "Schlumberger Eclipse 油藏模拟器连接",
          "transport": "stdio",
          "command": "python",
          "args": ["-m", "eclipse_mcp_server"],
          "tools": ["eclipse_run", "eclipse_get_progress", "eclipse_read_summary"]
        }
      ],
      "memory_seeds": [
        {
          "type": "proactive",
          "content": "历史拟合时，优先拟合全区压力和产油量，再拟合单井指标",
          "metadata": { "category": "best-practice" }
        },
        {
          "type": "proactive",
          "content": "Eclipse DATA 文件中关键字对大小写不敏感，但建议统一使用大写",
          "metadata": { "category": "tip" }
        }
      ],
      "approval_level": "MANUAL",
      "model_config": {
        "provider_id": "dashscope",
        "model": "qwen-max"
      },
      "welcome_message": "您好，我是高级油藏工程师。我可以帮您进行储量评估、数值模拟方案设计和历史拟合分析。请描述您的需求。"
    }
  ]
}
```

---

## 附录 B: 技能名称速查表

以下是 UGSci 插件中所有可用技能的名称，供准备市场源时参考：

### 油气领域技能

| 技能名 | 说明 |
|--------|------|
| `oil-gas-foundation` | 油气行业基础知识 |
| `oil-gas-exploration` | 勘探流程与数据 |
| `oil-gas-drilling` | 钻井工程知识 |
| `oil-gas-reservoir-production` | 油藏开发与生产 |
| `oil-gas-midstream` | 管道运输与存储 |
| `oil-gas-refining` | 炼油与化工 |
| `oil-gas-delegation` | 油气任务委派 |
| `well-log-analysis` | 测井曲线解释 |
| `segy-operations` | SEG-Y 地震数据处理 |
| `reservoir-simulation-workflow` | 油藏数值模拟工作流 |
| `history-matching` | 历史拟合 |
| `convergence-diagnosis` | 模拟收敛性诊断 |
| `scada-timeseries` | SCADA 时序数据分析 |
| `using-petropowers` | PetroPowers 集成 |
| `hdf5-pde-data-loading` | HDF5 PDE 数据加载 |

### 数据科学技能

| 技能名 | 说明 |
|--------|------|
| `matplotlib` | 绘图 |
| `plotly` | 交互式图表 |
| `seaborn` | 统计可视化 |
| `statistical-analysis` | 统计分析 |
| `exploratory-data-analysis` | 探索性数据分析 |
| `sensitivity-analysis` | 敏感性分析 |
| `multi-objective-optimization` | 多目标优化 |
| `pymoo` | 优化框架 |
| `pymc` | 贝叶斯推断 |
| `scikit-learn` | 机器学习 |
| `shap` | 模型可解释性 |
| `statsmodels` | 统计模型 |
| `sympy` | 符号计算 |
| `geopandas` | 空间数据 |
| `polars` | 大数据处理 |
| `dask` | 分布式计算 |
| `networkx` | 网络分析 |
| `simpy` | 离散事件仿真 |
| `synthetic-data-generation` | 合成数据生成 |
| `zarr-python` | Zarr 数组存储 |
| `ray-data` | Ray 分布式数据 |
| `hugging-face-datasets` | HuggingFace 数据集 |
| `infographics` | 信息图制作 |
| `matlab` | MATLAB 集成 |

### 软件工程技能

| 技能名 | 说明 |
|--------|------|
| `brainstorming` | 头脑风暴 |
| `brainstorming-gatekeeper` | 头脑风暴守门员 |
| `dispatching-parallel-agents` | 并行 Agent 调度 |
| `executing-plans` | 计划执行 |
| `finishing-a-development-branch` | 完成开发分支 |
| `receiving-code-review` | 接收代码评审 |
| `requesting-code-review` | 请求代码评审 |
| `subagent-driven-development` | 子 Agent 驱动开发 |
| `systematic-debugging` | 系统化调试 |
| `test-driven-development` | 测试驱动开发 |
| `using-git-worktrees` | Git Worktree 使用 |
| `verification-before-completion` | 完成前验证 |
| `writing-plans` | 编写计划 |
| `writing-skills` | 编写技能 |
