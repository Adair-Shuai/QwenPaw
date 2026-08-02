# 前端开发指南

## 开发环境

### 前置条件

- Node.js ≥ 18
- npm 或其他包管理器
- QwenPaw 运行环境（用于调试）

### 初始化

```bash
cd ui
npm install
```

### 开发模式

```bash
npm run dev
```

Vite 以 `--watch` 模式运行，文件变更后自动重新构建到 `ui/dist/index.js`。在 QwenPaw 运行时刷新浏览器即可看到最新改动。

### 生产构建

```bash
npm run build
```

产物为 `ui/dist/index.js`（ES module），体积约 6800+ 行（未压缩）。

## 源码结构

```
ui/
├── src/
│   └── index.ts          # 单文件入口，包含全部代码
├── package.json
├── tsconfig.json
├── vite.config.ts
└── dist/
    └── index.js           # 构建产物
```

### 为什么是单文件？

UGSci 前端采用 **单文件架构**（`src/index.ts`），所有类型定义、API 调用、页面组件、注册逻辑都在一个文件中。原因：

1. **插件沙箱** — QwenPaw 插件前端作为 ES module 加载，单文件减少了模块解析开销
2. **自包含** — 不依赖额外的 chunk 或资源文件，部署简单
3. **宿主共享** — React/AntD 由宿主提供，无需打包

## 核心概念

### 宿主 API 获取

所有与 QwenPaw 宿主的交互都通过 `getHost()` 函数：

```typescript
function getHost() {
  const host = (window as any).QwenPaw?.host;
  if (!host) throw new Error("[ugsci] QwenPaw.host not available");
  return host;
}
```

宿主提供的能力：

| 属性 | 类型 | 说明 |
|------|------|------|
| `React` | `typeof React` | React 运行时 |
| `antd` | `any` | Ant Design 组件库 |
| `antdIcons` | `any` | Ant Design 图标库 |
| `getApiUrl(path)` | `function` | 拼接完整 API URL |
| `getApiToken()` | `function` | 获取认证 token |
| `setSelectedAgent(id)` | `function` | 设置当前选中 Agent |
| `ReactMarkdown` | `any` | Markdown 渲染器 |
| `remarkGfm` | `any` | GFM 插件 |

### API 调用封装

```typescript
// 统一的 fetch 封装，自动注入认证头
async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const resp = await fetch(apiUrl(path), {
    ...opts,
    headers: { ...authHeaders(), ...(opts?.headers || {}) },
  });
  if (!resp.ok) throw new Error(text || `HTTP ${resp.status}`);
  return resp.json();
}
```

### Simple Mode 检测

```typescript
function isSimpleMode(): boolean {
  return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
}
```

菜单项的 `visible` 回调使用此函数控制可见性。

## 页面组件

### ExpertCenterPage（专家中心）

**文件位置**：`index.ts` ~L3911

**Tab 结构**：
1. `experts` — 专家列表
2. `teams` — 专家团

**专家列表功能**：
- 加载所有 Agent 及其配置、技能、MCP（并行请求）
- 卡片展示：emoji、名称、描述、技能数、MCP 数
- 点击卡片打开 Drawer，展示完整配置
- 「召唤专家」按钮：设置选中 Agent 并跳转至聊天页
- 「创建专家」按钮：打开模板选择弹窗

**专家团功能**：
- 展示预设团队和自定义团队
- 团队卡片：emoji、名称、模式标签、成员状态（已找到/缺少）
- 点击「发起任务」：如有占位符 `{参数名}` 则弹窗让用户输入，否则直接发送
- 通过 `POST /api/console/chat` 发送编排消息给协调者 Agent

### ToolsSkillsCenterPage（工具·技能）

**文件位置**：`ui/src/capability/ToolsSkillsCenterPage.ts`

**一级 Tab 结构**：
1. `tools` — MCP 接入、平台内置工具
2. `engines` — 仿真软件、领域计算、运行服务
3. `skills` — 当前专家技能、技能池

**原生功能嵌入**：
- MCP 直接异步加载 QwenPaw 原生 `MCPPage`，保留 Provider 托管服务、JSON/表单创建、OAuth、访问策略和 CRUD
- 平台内置工具直接异步加载原生 `ToolsPage`
- 运行服务直接异步加载原生 `ACPPage`
- 宿主只开放固定页面白名单；UGSci 不复制这些页面的 API、状态或业务规则

**引擎与技能**：
- 仿真软件复用 `EngineSection`，支持检测、搜索、查看、添加、编辑和删除
- 领域计算保留注册位，用于后续接入 PVT、气藏工程等计算内核
- 技能复用 `SkillCenterPage`，嵌入模式下继续维护当前专家技能和技能池

### SkillCenterPage（技能中心）

**文件位置**：`index.ts` ~L5407

**功能**：
- 加载技能池（`GET /api/skills/pool`）、Agent 列表、workspace 技能
- 技能卡片：emoji、名称、描述、版本、标签
- 点击卡片打开 Drawer，展示详情和已安装专家列表
- 「管理技能池」跳转至 `/skill-pool`

### MarketplacePage（市场）

**文件位置**：`index.ts` ~L5892

**Tab 结构**：
1. `skills` — 技能市场
2. `experts` — 专家模板

**技能市场功能**：
- 搜索栏 + 分类筛选
- 调用 `POST /api/market/search` 搜索远程技能
- 卡片展示：名称、描述、来源、版本、作者
- 点击卡片打开 Drawer，选择目标 Agent 一键安装
- 安装进度通过轮询 `GET /api/skills/hub/install/status/{taskId}` 跟踪

**专家模板功能**：
- 展示内置 6 个石油领域专家模板
- 点击卡片一键创建 Agent（调用 `POST /api/agents`）

## 组件层级

```
buildPlugin()
├── ExpertCenterPage
│   ├── PageHeader
│   ├── Tabs
│   │   ├── 专家列表 Tab
│   │   │   ├── Input.Search
│   │   │   └── Row > Col > ExpertCard
│   │   │       └── (点击) → ExpertDrawer
│   │   └── 专家团 Tab
│   │       └── ExpertTeamSection
│   │           ├── Input.Search
│   │           ├── Row > Col > ExpertTeamCard (custom)
│   │           └── Row > Col > ExpertTeamCard (preset)
│   ├── ExpertTemplateModal (创建专家)
│   └── TeamLaunchModal (发起团队任务)
│
├── ToolsSkillsCenterPage
│   ├── PageHeader
│   └── Tabs
│       ├── 工具 Tab
│       │   ├── HostBuiltinPage(MCPPage)
│       │   └── HostBuiltinPage(ToolsPage)
│       ├── 引擎 Tab
│       │   ├── EngineSection
│       │   ├── DomainComputeSection
│       │   └── HostBuiltinPage(ACPPage)
│       └── 技能 Tab
│           └── SkillCenterPage(embedded)
│
├── SkillCenterPage
│   ├── PageHeader
│   ├── Input.Search
│   └── Row > Col > SkillCard
│       └── (点击) → Drawer (含已安装专家列表)
│
└── MarketplacePage
    ├── PageHeader
    └── Tabs
        ├── Skills Market Tab
        │   ├── Input.Search + Select (分类)
        │   └── Row > Col > MarketSkillCard
        │       └── (点击) → Drawer (安装到 Agent)
        └── Experts Template Tab
            ├── Input.Search
            └── Row > Col > ExpertTemplateCard
```

## 专家模板定义

专家模板是纯数据结构，定义在 `index.ts` 的 `EXPERT_TEMPLATES` 数组中：

```typescript
interface ExpertTemplate {
  id: string;              // 模板 ID
  name: string;            // 显示名称
  emoji: string;           // Emoji 图标
  category: string;        // 分类
  description: string;     // **Markdown** 格式的描述
  systemPrompt: string;   // 系统提示词（完整 Markdown 文档）
  recommendedSkills: string[];  // 推荐技能（当前为空，预留）
  approvalLevel: "AUTO" | "MANUAL";  // 审批级别
}
```

### 添加新专家模板

在 `EXPERT_TEMPLATES` 数组中添加新对象即可：

```typescript
{
  id: "facility-engineer",
  name: "地面工程师",
  emoji: "🏭",
  category: "地面工程",
  description: "**地面工程师** —— 擅长油气集输、处理厂工艺设计。",
  systemPrompt: `# 地面工程师\n\n你是一位资深地面工程师...`,
  recommendedSkills: [],
  approvalLevel: "AUTO",
},
```

## 专家团定义

预设专家团由后端 `team/presets.py` 统一定义，前端通过
`GET /api/ugsci/team/preset-teams` 获取：

```typescript
interface ExpertTeam {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  mode: "coordinator" | "pipeline" | "roundtable";
  members: ExpertTeamMember[];
  coordinatorName?: string;      // 协调者模式专用
  taskTemplate: string;          // 任务模板（支持 {占位符}）
  orchestrationPrompt: string;   // 编排指令
  steps?: ExpertTeamStep[];      // 流水线步骤
  custom?: boolean;              // 是否用户自定义
  createdAt?: number;
}
```

### 三种编排模式

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| `pipeline` | 流水线 — 步骤依次执行，上一步结果传递给下一步 | 有明确先后顺序的工作流 |
| `coordinator` | 协调者 — 由协调者 Agent 主导，按需咨询其他专家 | 需要综合判断的复杂任务 |
| `roundtable` | 圆桌讨论 — 各专家独立评估，不传递他人意见，最后综合 | 需要多视角对比的评审 |

### 添加新专家团

在 `team/presets.py` 的 `PRESET_UGSCI_TEAMS` 中添加新对象。成员的
`name` 字段会通过 `findAgentIdByName()` 与实际 Agent 进行模糊匹配。

## 调试技巧

1. **查看注册日志**：浏览器控制台搜索 `[ugsci]`
2. **检查 Simple Mode**：`localStorage.getItem("qwenpaw_sidebar_mode")`
3. **手动切换模式**：`localStorage.setItem("qwenpaw_sidebar_mode", "simple")` 然后刷新
4. **检查技能池同步**：后端日志搜索 `[ugsci]` 或 `plugin.ugsci`
5. **测试软件检测 API**：`curl http://localhost:8000/api/ugsci/software/detect`
