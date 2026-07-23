/**
 * UGSci frontend plugin for QwenPaw
 *
 * Transforms the QwenPaw UI into a petroleum-domain-friendly interface with
 * three core modules: Capabilities, Skills, and Experts.
 *
 * Key design: Expert display data is LINKED to real Agent data — each expert
 * card/drawer fetches the agent's actual skills, MCP clients, tools, and
 * system prompt files from the existing QwenPaw API.
 *
 * Uses window.QwenPaw plugin API for route + menu registration.
 */

// ─── Types (mirrors console/src/api/types/) ──────────────────────────────────

interface AgentSummary {
  id: string;
  name: string;
  description: string;
  workspace_dir: string;
  enabled: boolean;
  active_model?: { provider_id: string; model: string } | null;
}

interface AgentProfileConfig {
  id: string;
  name: string;
  description?: string;
  workspace_dir?: string;
  approval_level?: string;
  active_model?: { provider_id: string; model: string } | null;
  channels?: unknown;
  mcp?: unknown;
  heartbeat?: unknown;
  running?: unknown;
  llm_routing?: unknown;
  system_prompt_files?: string[];
  tools?: unknown;
  security?: unknown;
}

interface SkillSpec {
  name: string;
  description?: string;
  version_text?: string;
  content: string;
  source: string;
  enabled?: boolean;
  channels?: string[];
  tags?: string[];
  config?: Record<string, unknown>;
  last_updated?: string;
  emoji?: string;
  installed_from?: string;
}

interface PoolSkillSpec {
  name: string;
  description?: string;
  version_text?: string;
  content: string;
  source: string;
  protected: boolean;
  external?: boolean;
  external_path?: string;
  sync_status?: string;
  tags?: string[];
  emoji?: string;
  installed_from?: string;
  auto_update?: boolean;
}

interface MCPClientInfo {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  transport: "stdio" | "streamable_http" | "sse";
  url: string;
  command: string;
  args: string[];
  tools: string[] | null;
}

interface WorkspaceSkillSummary {
  agent_id: string;
  agent_name?: string;
  workspace_dir: string;
  skills: SkillSpec[];
}

/** Aggregated expert data — the VIEW layer on top of Agent data. */
interface ExpertData {
  agent: AgentSummary;
  config: AgentProfileConfig | null;
  skills: SkillSpec[];
  mcps: MCPClientInfo[];
  loading: boolean;
}

// ─── API Helpers ──────────────────────────────────────────────────────────────

function getHost() {
  const host = (window as any).QwenPaw?.host;
  if (!host) throw new Error("[ugsci] QwenPaw.host not available");
  return host as {
    React: typeof React;
    antd: any;
    antdIcons: any;
    getApiUrl: (path: string) => string;
    getApiToken: () => string;
    setSelectedAgent?: (agentId: string) => void;
    useSelectedAgent?: () => { id: string };
    ReactMarkdown?: any;
    remarkGfm?: any;
  };
}

function getToken(): string {
  try {
    return getHost().getApiToken() || "";
  } catch {
    return "";
  }
}

function apiUrl(path: string): string {
  return getHost().getApiUrl(path);
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
  return headers;
}

// ── Lightweight GET cache ─────────────────────────────────────────────────
// Prevents redundant API calls when switching between plugin pages.
// TTL is short (15s) so data stays reasonably fresh. The "刷新" button
// and detect action call clearApiCache() to force a fresh fetch.
const _apiCache = new Map<string, { data: any; ts: number }>();
const _API_CACHE_TTL = 15_000; // 15 seconds

function clearApiCache(): void {
  _apiCache.clear();
}

async function apiFetch<T>(
  path: string,
  opts?: RequestInit & { bypassCache?: boolean },
): Promise<T> {
  const method = (opts?.method || "GET").toUpperCase();
  const { bypassCache, ...fetchOpts } = (opts || {}) as RequestInit & {
    bypassCache?: boolean;
  };

  // Any mutating request (POST/PUT/DELETE/PATCH) invalidates the cache
  // so subsequent GETs fetch fresh data.
  if (method !== "GET") {
    clearApiCache();
  }

  // Cache only GET requests (unless explicitly bypassed)
  if (method === "GET" && !bypassCache) {
    const cached = _apiCache.get(path);
    if (cached && Date.now() - cached.ts < _API_CACHE_TTL) {
      return cached.data as T;
    }
  }

  const resp = await fetch(apiUrl(path), {
    ...fetchOpts,
    headers: { ...authHeaders(), ...(fetchOpts.headers || {}) },
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(text || `HTTP ${resp.status}`);
  }
  if (resp.status === 204) return null as T;
  const data = await resp.json();

  // Cache successful GET responses
  if (method === "GET") {
    _apiCache.set(path, { data, ts: Date.now() });
  }

  return data;
}

async function fetchAgents(): Promise<AgentSummary[]> {
  const data = await apiFetch<{ agents: AgentSummary[] }>("/agents");
  return data?.agents || [];
}

async function fetchAgentConfig(agentId: string): Promise<AgentProfileConfig> {
  return apiFetch<AgentProfileConfig>(`/agents/${encodeURIComponent(agentId)}`);
}

async function fetchAgentSkills(agentId: string): Promise<SkillSpec[]> {
  const data = await apiFetch<SkillSpec[]>("/skills", {
    headers: { "X-Agent-Id": agentId },
  });
  return data || [];
}

async function fetchPoolSkills(summary = false): Promise<PoolSkillSpec[]> {
  const qs = summary ? "?summary=true" : "";
  const data = await apiFetch<PoolSkillSpec[]>(`/skills/pool${qs}`);
  return data || [];
}

async function fetchPoolSkillContent(skillName: string): Promise<string> {
  const data = await apiFetch<{ name: string; content: string }>(
    `/skills/pool/${encodeURIComponent(skillName)}/content`,
  );
  return data?.content || "";
}

async function fetchWorkspaceSkills(): Promise<WorkspaceSkillSummary[]> {
  const data = await apiFetch<WorkspaceSkillSummary[]>("/skills/workspaces");
  return data || [];
}

async function fetchMCPClients(): Promise<MCPClientInfo[]> {
  const data = await apiFetch<MCPClientInfo[]>("/mcp");
  return data || [];
}

// ─── Agent-aware MCP API helpers (mirror console /mcp page) ──────────────────

/** List MCP clients for a specific agent (passes X-Agent-Id). */
async function fetchAgentMCPClientsForCapabilities(
  agentId: string,
): Promise<MCPClientInfo[]> {
  const data = await apiFetch<MCPClientInfo[]>("/mcp", {
    headers: { "X-Agent-Id": agentId },
  });
  return data || [];
}

/** Toggle an MCP client's enabled status for a specific agent. */
async function toggleMCPClientForCapabilities(
  agentId: string,
  clientKey: string,
): Promise<MCPClientInfo> {
  return apiFetch<MCPClientInfo>(
    `/mcp/toggle/${encodeURIComponent(clientKey)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": agentId },
    },
  );
}

/** Delete an MCP client for a specific agent. */
async function deleteMCPClientForCapabilities(
  agentId: string,
  clientKey: string,
): Promise<void> {
  await apiFetch(`/mcp/${encodeURIComponent(clientKey)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": agentId },
  });
}

/** Create an MCP client for a specific agent. */
async function createMCPClientForCapabilities(
  agentId: string,
  clientKey: string,
  client: Record<string, unknown>,
): Promise<MCPClientInfo> {
  return apiFetch<MCPClientInfo>("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
    body: JSON.stringify({ client_key: clientKey, client }),
  });
}

/** Update an MCP client for a specific agent. */
async function updateMCPClientForCapabilities(
  agentId: string,
  clientKey: string,
  updates: Record<string, unknown>,
): Promise<MCPClientInfo> {
  return apiFetch<MCPClientInfo>(
    `/mcp/${encodeURIComponent(clientKey)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
      body: JSON.stringify(updates),
    },
  );
}

/** List tools from a connected MCP server for a specific agent. */
async function listMCPToolsForCapabilities(
  agentId: string,
  clientKey: string,
): Promise<any[]> {
  const data = await apiFetch<any[]>(
    `/mcp/tools/${encodeURIComponent(clientKey)}`,
    { headers: { "X-Agent-Id": agentId } },
  );
  return data || [];
}

/** Parse agent config's mcp field to extract MCP client keys. */
function extractMCPKeys(mcpConfig: unknown): string[] {
  if (!mcpConfig || typeof mcpConfig !== "object") return [];
  const cfg = mcpConfig as Record<string, unknown>;
  // MCP config can be in mcpServers wrapper or direct key→config
  const servers =
    (cfg.mcpServers as Record<string, unknown>) ||
    (cfg as Record<string, unknown>);
  if (!servers || typeof servers !== "object") return [];
  return Object.keys(servers).filter((k) => k !== "mcpServers");
}

// ─── React import shim ────────────────────────────────────────────────────────

import type React from "react";

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Shared button style that matches the "新建聊天" (new chat) button:
 * solid #0072f5 fill, white text, 13px / 600 weight, no border, 8px radius.
 */
const PRIMARY_BTN_STYLE: Record<string, unknown> = {
  background: "#0072f5",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8,
};

/** Check if the sidebar is currently in simple mode. */
function isSimpleMode(): boolean {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return false;
  }
}

/**
 * Render markdown text using the host's ReactMarkdown component.
 * Falls back to plain text if ReactMarkdown is not available.
 */
function renderMarkdown(text: string, React: typeof import("react")) {
  const host = getHost();
  if (host.ReactMarkdown && host.remarkGfm) {
    return React.createElement(
      host.ReactMarkdown,
      { remarkPlugins: [host.remarkGfm] },
      text,
    );
  }
  // Fallback: strip basic markdown formatting
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/^[-*]\s+/gm, "• ");
}

// ─── MCP Templates ───────────────────────────────────────────────────────────

interface MCPTemplate {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  transport: "stdio" | "streamable_http" | "sse";
  /** stdio transport */
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
  /** http / sse transport */
  url?: string;
  headers?: Record<string, string>;
}

const MCP_TEMPLATES: MCPTemplate[] = [
  {
    id: "filesystem",
    name: "Filesystem",
    emoji: "📁",
    category: "文件系统",
    description:
      "模型上下文协议文件系统服务器，提供文件读写、目录浏览和搜索能力。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/"],
  },
  {
    id: "sqlite",
    name: "SQLite",
    emoji: "🗄️",
    category: "数据库",
    description:
      "SQLite 数据库 MCP 服务器，提供查询、表结构查看和数据操作能力。",
    transport: "stdio",
    command: "uvx",
    args: ["mcp-server-sqlite", "--db-path", "/path/to/database.db"],
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    emoji: "🐘",
    category: "数据库",
    description:
      "PostgreSQL 数据库 MCP 服务器，提供只读 SQL 查询和 schema 探索能力。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-postgres"],
    env: {
      POSTGRES_CONNECTION_STRING:
        "postgresql://user:password@localhost:5432/dbname",
    },
  },
  {
    id: "brave-search",
    name: "Brave Search",
    emoji: "🔍",
    category: "搜索",
    description:
      "Brave Search MCP 服务器，提供网络搜索和本地搜索能力。需要 Brave API Key。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-brave-search"],
    env: {
      BRAVE_API_KEY: "your-brave-api-key",
    },
  },
  {
    id: "github",
    name: "GitHub",
    emoji: "🐙",
    category: "开发工具",
    description:
      "GitHub MCP 服务器，提供仓库管理、Issue / PR 操作、代码搜索和文件操作能力。需要 GitHub Token。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    env: {
      GITHUB_PERSONAL_ACCESS_TOKEN: "your-github-token",
    },
  },
  {
    id: "gitlab",
    name: "GitLab",
    emoji: "🦊",
    category: "开发工具",
    description:
      "GitLab MCP 服务器，提供项目管理、Merge Request 操作和 CI/CD 流水线能力。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-gitlab"],
    env: {
      GITLAB_PERSONAL_ACCESS_TOKEN: "your-gitlab-token",
      GITLAB_API_URL: "https://gitlab.com/api/v4",
    },
  },
  {
    id: "fetch",
    name: "Fetch",
    emoji: "🌐",
    category: "网络工具",
    description:
      "Fetch MCP 服务器，提供 URL 内容抓取和网页转 Markdown 能力。",
    transport: "stdio",
    command: "uvx",
    args: ["mcp-server-fetch"],
  },
  {
    id: "memory",
    name: "Memory",
    emoji: "🧠",
    category: "知识管理",
    description:
      "Memory MCP 服务器，提供基于知识图谱的长期记忆存储和检索能力。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-memory"],
  },
  {
    id: "puppeteer",
    name: "Puppeteer",
    emoji: "🎭",
    category: "浏览器自动化",
    description:
      "Puppeteer MCP 服务器，提供浏览器自动化、网页截图和 PDF 生成能力。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-puppeteer"],
  },
  {
    id: "sequential-thinking",
    name: "Sequential Thinking",
    emoji: "💭",
    category: "推理增强",
    description:
      "Sequential Thinking MCP 服务器，提供结构化的逐步推理和问题分解能力。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-sequential-thinking"],
  },
  {
    id: "everart",
    name: "EverArt",
    emoji: "🎨",
    category: "AI 生成",
    description:
      "EverArt MCP 服务器，提供 AI 图像生成能力。需要 EverArt API Key。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-everart"],
    env: {
      EVERART_API_KEY: "your-everart-api-key",
    },
  },
  {
    id: "google-drive",
    name: "Google Drive",
    emoji: "📁",
    category: "云存储",
    description:
      "Google Drive MCP 服务器，提供 Google Drive 文件搜索和内容访问能力。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-google-drive"],
  },
  {
    id: "slack",
    name: "Slack",
    emoji: "💬",
    category: "通讯协作",
    description:
      "Slack MCP 服务器，提供频道消息发送、列表查看和消息搜索能力。需要 Slack Bot Token。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-slack"],
    env: {
      SLACK_BOT_TOKEN: "xoxb-your-bot-token",
      SLACK_TEAM_ID: "your-team-id",
    },
  },
  {
    id: "time",
    name: "Time",
    emoji: "⏰",
    category: "工具",
    description: "Time MCP 服务器，提供时间查询和时区转换能力。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-time"],
  },
  {
    id: "exa-search",
    name: "Exa AI Search",
    emoji: "🔬",
    category: "搜索",
    description:
      "Exa AI 学术搜索 MCP 服务器，提供实时学术论文搜索和引用获取能力。适合科研场景。",
    transport: "streamable_http",
    url: "https://mcp.exa.ai/mcp",
  },
  {
    id: "comsol-mcp",
    name: "COMSOL Multiphysics",
    emoji: "🔧",
    category: "仿真工程",
    description:
      "COMSOL Multiphysics MCP 服务器，提供有限元仿真建模、求解和结果分析能力。适合多物理场耦合仿真场景。",
    transport: "stdio",
    command: "python",
    args: ["-m", "comsol_mcp"],
  },
];

// ─── Expert Templates ───────────────────────────────────────────────────────

interface ExpertTemplate {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  systemPrompt: string;
  recommendedSkills: string[];
  approvalLevel: "AUTO" | "MANUAL";
}

const EXPERT_TEMPLATES: ExpertTemplate[] = [
  {
    id: "reservoir-engineer",
    name: "油藏工程师",
    emoji: "🛢️",
    category: "油气开发",
    description:
      "**油藏工程师** —— 擅长储量评估、物质平衡计算、递减曲线分析、油藏数值模拟方案设计。",
    systemPrompt: `# 油藏工程师

你是一位经验丰富的油藏工程师，专注于油气田开发与油藏管理。

## 核心能力
- 储量评估（容积法、物质平衡法、递减曲线法）
- 油藏数值模拟方案设计与参数优化
- 生产动态分析与产量预测
- 注水/注气开发方案设计及效果评价
- 经济评价与开发方案比选

## 工作准则
- 所有计算需给出公式推导过程和参数来源
- 引用标准时注明编号（如 SY/T 5367）
- 对不确定参数给出合理范围和敏感性分析
- 输出结果使用表格和图示说明
`,
    recommendedSkills: [],
    approvalLevel: "AUTO",
  },
  {
    id: "drilling-engineer",
    name: "钻井工程师",
    emoji: "⛏️",
    category: "钻完井",
    description:
      "**钻井工程师** —— 擅长井身结构设计、钻井液优化、套管设计、固井方案和钻井风险管理。",
    systemPrompt: `# 钻井工程师

你是一位资深钻井工程师，专注于钻井工程设计与现场技术支持。

## 核心能力
- 井身结构设计（套管程序、深度确定）
- 钻井液体系选择与性能优化
- 套管强度设计与固井方案
- 钻头选型与钻具组合优化
- 井下复杂情况处理（井漏、井喷、卡钻）
- 钻井成本估算与工期排程

## 工作准则
- 设计参数需符合 SY/T 5431 等行业标准
- 安全系数取值需说明依据
- 对复杂井段给出风险预警和应急预案
`,
    recommendedSkills: [],
    approvalLevel: "MANUAL",
  },
  {
    id: "well-logging-analyst",
    name: "测井分析师",
    emoji: "📡",
    category: "测井试油",
    description:
      "**测井分析师** —— 擅长测井曲线解释、岩性识别、孔隙度/饱和度计算和储层评价。",
    systemPrompt: `# 测井分析师

你是一位专业的测井解释工程师，精通各种测井方法的数据处理与解释。

## 核心能力
- 常规测井曲线解释（GR、SP、RT、AC、CNL、DEN）
- 岩性识别与地层划分
- 孔隙度、渗透率、饱和度参数计算
- 测井相分析与沉积相解释
- 固井质量评价（CBL/VDL）
- 测井数据质量控制与标准化

## 工作准则
- 解释结论需说明所用公式和参数取值
- 对异常曲线段给出多种可能解释
- 储层评价需综合多条曲线交叉验证
`,
    recommendedSkills: [],
    approvalLevel: "AUTO",
  },
  {
    id: "production-engineer",
    name: "采油工程师",
    emoji: "⚙️",
    category: "油气生产",
    description:
      "**采油工程师** —— 擅长举升工艺设计、注水管理、增产措施工艺设计和生产动态监测。",
    systemPrompt: `# 采油工程师

你是一位经验丰富的采油工程师，专注于油气井生产优化与工艺设计。

## 核心能力
- 人工举升工艺设计（有杆泵、电潜泵、气举）
- 注水井调配与注采对应分析
- 压裂/酸化增产措施工艺设计
- 生产动态监测与分析（产液剖面、吸水剖面）
- 井筒完整性评估与防腐防垢
- 生产管柱优化设计

## 工作准则
- 工艺设计需给出选型依据和参数计算
- 措施方案需包含预期效果和风险评估
- 引用规范时注明标准编号
`,
    recommendedSkills: [],
    approvalLevel: "AUTO",
  },
  {
    id: "geophysicist",
    name: "地球物理专家",
    emoji: "🌍",
    category: "地球物理",
    description:
      "**地球物理专家** —— 擅长地震资料解释、属性分析、反演处理和储层预测。",
    systemPrompt: `# 地球物理专家

你是一位资深的地球物理学家，专注于地震勘探与储层地球物理。

## 核心能力
- 地震资料构造解释与层位标定
- 地震属性分析与提取
- 地震反演（波阻抗反演、AVO分析）
- 储层预测与含油气性检测
- 地震地质综合解释
- 微地震监测与压裂效果评估

## 工作准则
- 解释成果需结合地质、测井等多源数据
- 对地震资料品质给出评价
- 反演结果需标定并说明不确定性
`,
    recommendedSkills: [],
    approvalLevel: "AUTO",
  },
  {
    id: "pvt-analyst",
    name: "PVT 分析师",
    emoji: "🧪",
    category: "流体性质",
    description:
      "**PVT 分析师** —— 擅长油气流体物性计算、相态分析、PVT 实验拟合和组分模型。",
    systemPrompt: `# PVT 分析师

你是一位专业的 PVT 流体性质分析工程师，精通油气藏流体相态行为。

## 核心能力
- 原油/天然气/凝析油 PVT 物性参数计算
- 流体相态分析（相图绘制、饱和压力计算）
- PVT 实验数据拟合（CCE、DL、CVD）
- 状态方程选择与组分模型建立
- 注气/注 CO2 相态模拟
- 流体物性经验公式应用与验证

## 工作准则
- 所有物性参数需注明计算方法和适用范围
- 对缺少实验数据的情况推荐经验公式并说明误差
- 组分模型需给出特征化步骤和拟合质量
`,
    recommendedSkills: [],
    approvalLevel: "AUTO",
  },
];

// ─── Expert Teams (多智能体协同) ─────────────────────────────────────────────

interface ExpertTeamMember {
  /** Agent name to match (fallback if agentId not found) */
  name: string;
  /** Role description in the team */
  role: string;
  /** Emoji avatar for the member */
  emoji: string;
}

interface ExpertTeamStep {
  /** Agent name for this step */
  agentName: string;
  /** What this step asks the agent to do */
  instruction: string;
  /** Whether to pass previous step's result as context */
  passContext: boolean;
}

interface ExpertTeam {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  /** "coordinator" | "pipeline" | "roundtable" */
  mode: "coordinator" | "pipeline" | "roundtable";
  members: ExpertTeamMember[];
  /** Coordinator agent name (for coordinator mode) */
  coordinatorName?: string;
  /** Task template with {placeholder} variables */
  taskTemplate: string;
  /** System prompt for the coordinator to orchestrate the team */
  orchestrationPrompt: string;
  /** User-defined execution steps (for pipeline mode) */
  steps?: ExpertTeamStep[];
  /** Whether this is a user-created custom team */
  custom?: boolean;
  /** Creation timestamp for custom teams */
  createdAt?: number;
}

const CUSTOM_TEAMS_STORAGE_KEY = "ugsci_custom_teams";

function loadCustomTeams(): ExpertTeam[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TEAMS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ExpertTeam[];
  } catch {
    return [];
  }
}

function saveCustomTeams(teams: ExpertTeam[]): void {
  try {
    localStorage.setItem(CUSTOM_TEAMS_STORAGE_KEY, JSON.stringify(teams));
  } catch {}
}

const EXPERT_TEAMS: ExpertTeam[] = [
  {
    id: "reservoir-eval-team",
    name: "储层评价团队",
    emoji: "🛢️",
    category: "油气勘探",
    mode: "pipeline",
    description:
      "从测井解释到储量计算的完整储层评价流程，依次调用测井分析师、地球物理专家和油藏工程师",
    members: [
      { name: "测井分析师", role: "岩性识别与孔隙度计算", emoji: "📡" },
      { name: "地球物理专家", role: "储层预测与含油气检测", emoji: "🌍" },
      { name: "油藏工程师", role: "储量评估与开发建议", emoji: "🛢️" },
    ],
    taskTemplate:
      "请对以下区块进行储层评价：\n区块名称：{区块名}\n井号：{井号}\n评价要求：依次咨询测井分析师（岩性解释和孔隙度参数）、地球物理专家（储层预测和含油气性检测）、油藏工程师（储量计算和开发建议），综合形成储层评价报告。",
    orchestrationPrompt:
      "你是一个储层评价团队的协调者。请按照以下流程依次咨询团队成员：\n1. 先用 list_agents() 查看可用专家\n2. 向测井分析师发送岩性解释和孔隙度计算请求\n3. 将测井结果传递给地球物理专家，请求储层预测\n4. 将前两步结果传递给油藏工程师，请求储量评估\n5. 综合三位专家的结果，形成统一的储层评价报告\n\n重要：每步咨询使用 chat_with_agent，传递上一步的结果作为上下文。",
  },
  {
    id: "drilling-design-team",
    name: "钻井设计团队",
    emoji: "⛏️",
    category: "钻完井",
    mode: "coordinator",
    description:
      "由钻井工程师主导，协调地球物理专家（地层预测）和采油工程师（完井方案），完成钻井工程设计",
    members: [
      { name: "钻井工程师", role: "井身结构与套管设计", emoji: "⛏️" },
      { name: "地球物理专家", role: "地层压力预测", emoji: "🌍" },
      { name: "采油工程师", role: "完井方案建议", emoji: "⚙️" },
    ],
    coordinatorName: "钻井工程师",
    taskTemplate:
      "请为以下井进行钻井工程设计：\n井名：{井名}\n设计深度：{深度}m\n设计要求：请协调地球物理专家进行地层压力预测，然后由你完成井身结构设计，最后咨询采油工程师确定完井方案。",
    orchestrationPrompt:
      "你是钻井设计团队的协调者（钻井工程师）。请按以下步骤工作：\n1. 用 list_agents() 查看可用专家\n2. 向地球物理专家发送地层压力预测请求\n3. 基于压力预测结果，完成井身结构设计和套管设计\n4. 向采油工程师发送完井方案咨询请求\n5. 综合所有结果，输出完整的钻井工程设计方案\n\n注意：每步使用 chat_with_agent 咨询，传递已获取的参数。",
  },
  {
    id: "development-plan-team",
    name: "开发方案评审团队",
    emoji: "📋",
    category: "油气开发",
    mode: "roundtable",
    description:
      "油藏工程师、钻井工程师和采油工程师独立评估同一区块的开发方案，对比不同视角后综合出最优方案",
    members: [
      { name: "油藏工程师", role: "储量与开发方式评估", emoji: "🛢️" },
      { name: "钻井工程师", role: "工程可行性评估", emoji: "⛏️" },
      { name: "采油工程师", role: "生产工艺评估", emoji: "⚙️" },
    ],
    taskTemplate:
      "请对以下区块的开发方案进行多角度评审：\n区块名称：{区块名}\n方案概述：{方案概述}\n评审要求：请分别咨询油藏工程师（储量和开发方式）、钻井工程师（工程可行性）、采油工程师（生产工艺），各自独立给出评估意见，然后对比综合形成最终建议。",
    orchestrationPrompt:
      "你是开发方案评审团队的协调者。请按以下步骤工作：\n1. 用 list_agents() 查看可用专家\n2. 分别向油藏工程师、钻井工程师、采油工程师发送同一评审请求（独立评估，不传递他人意见）\n3. 收集三位专家的独立意见后，对比分析各自观点\n4. 综合形成最终的开发方案建议，包含各专业领域的考虑\n\n重要：三位专家应独立评估，不要将一位专家的意见传递给另一位。",
  },
  {
    id: "pvt-analysis-team",
    name: "流体性质分析团队",
    emoji: "🧪",
    category: "流体性质",
    mode: "pipeline",
    description:
      "PVT分析师进行流体物性计算，地球物理专家辅助相态验证，油藏工程师完成开发方案适配",
    members: [
      { name: "PVT 分析师", role: "PVT实验拟合与物性计算", emoji: "🧪" },
      { name: "地球物理专家", role: "相态行为验证", emoji: "🌍" },
      { name: "油藏工程师", role: "开发方式适配", emoji: "🛢️" },
    ],
    taskTemplate:
      "请对以下流体样品进行PVT分析：\n样品来源：{井号}-{层位}\n实验数据：{实验数据概述}\n分析要求：依次咨询PVT分析师（物性计算和相态分析）、地球物理专家（相态验证）、油藏工程师（开发方式建议），形成完整的流体评价报告。",
    orchestrationPrompt:
      "你是流体性质分析团队的协调者。请按以下步骤工作：\n1. 用 list_agents() 查看可用专家\n2. 向PVT分析师发送流体物性计算和相态分析请求\n3. 将PVT分析结果传递给地球物理专家，请求相态行为验证\n4. 将前两步结果传递给油藏工程师，请求开发方式适配建议\n5. 综合形成完整的流体性质评价报告\n\n注意：每步使用 chat_with_agent 咨询，传递上一步的完整结果。",
  },
];

// ─── Expert Team helpers ─────────────────────────────────────────────────────

/**
 * Send a message to an agent via the console chat API.
 * This creates a streaming chat session that the console UI picks up.
 */
async function sendTeamMessage(
  agentId: string,
  messageText: string,
): Promise<void> {
  const body = {
    channel: "console",
    user_id: "default",
    session_id: `team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    input: [
      {
        role: "user",
        content: [{ type: "text", text: messageText }],
      },
    ],
  };

  await fetch(apiUrl("/console/chat"), {
    method: "POST",
    headers: {
      ...authHeaders(),
      "X-Agent-Id": agentId,
    },
    body: JSON.stringify(body),
  });
}

/**
 * Find an agent ID by name (fuzzy match).
 */
function findAgentIdByName(
  agents: AgentSummary[],
  name: string,
): string | null {
  // Exact match first
  const exact = agents.find(
    (a) => a.name === name || a.name === name.replace(/\s+/g, ""),
  );
  if (exact) return exact.id;
  // Fuzzy: name contains the search term
  const fuzzy = agents.find(
    (a) =>
      a.name.includes(name) ||
      name.includes(a.name) ||
      a.name.replace(/\s+/g, "").includes(name.replace(/\s+/g, "")),
  );
  if (fuzzy) return fuzzy.id;
  return null;
}

/**
 * Build the full orchestration message for a team task.
 * Supports both preset teams (with orchestrationPrompt) and custom teams
 * (with explicit steps).
 */
function buildTeamMessage(team: ExpertTeam): string {
  const memberList = team.members
    .map((m) => `- ${m.name}（${m.role}）`)
    .join("\n");

  // For custom teams with explicit steps, build detailed step-by-step instructions
  if (team.custom && team.steps && team.steps.length > 0) {
    const stepList = team.steps
      .map((step, i) => {
        const ctxNote = step.passContext
          ? "（传递上一步的结果作为上下文）"
          : "（独立执行，不传递上下文）";
        return `${i + 1}. 向「${step.agentName}」发送请求：${step.instruction} ${ctxNote}`;
      })
      .join("\n");

    const modeDesc =
      team.mode === "pipeline"
        ? "请按顺序依次执行以下步骤，每步使用 chat_with_agent 咨询对应专家："
        : team.mode === "roundtable"
          ? "请同时向以下专家分别发送独立请求（不传递上下文），收集所有结果后综合："
          : `你是团队协调者（${team.coordinatorName || team.members[0]?.name || ""}），请按需调用以下专家完成任务：`;

    return `${modeDesc}

---

## 团队任务

${team.taskTemplate}

---

## 执行步骤

${stepList}

---

## 团队成员

${memberList}

---

请现在开始执行团队任务。首先使用 list_agents() 确认可用专家，然后按照上述步骤依次/同时咨询各成员。每步结果请明确标注来自哪位专家。`;
  }

  // For preset teams, use the orchestration prompt
  return `${team.orchestrationPrompt}

---

## 团队任务

${team.taskTemplate}

---

## 团队成员

${memberList}

---

请现在开始执行团队任务。首先使用 list_agents() 查看可用专家，然后按照上述流程依次咨询各成员。`;
}

// ─── Team Flow Diagram (visual step display) ──────────────────────────────────

function TeamFlowDiagram({ team }: { team: ExpertTeam }) {
  const React = getHost().React;
  const { Typography, Tag } = getHost().antd;
  const { Text } = Typography;

  const modeIcons: Record<string, string> = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙",
  };
  const modeColors: Record<string, string> = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff",
  };

  const steps = team.steps || [];
  const hasSteps = steps.length > 0;

  return React.createElement(
    "div",
    {
      style: {
        padding: "12px 16px",
        background: "#fafafa",
        borderRadius: 8,
        border: "1px dashed #d9d9d9",
      },
    },
    React.createElement(
      Text,
      {
        type: "secondary",
        style: { fontSize: 12, display: "block", marginBottom: 8 },
      },
      `执行流程 (${team.mode === "pipeline" ? "流水线" : team.mode === "roundtable" ? "圆桌讨论" : "协调者模式"})`,
    ),
    // Visual flow
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: team.mode === "roundtable" ? "row" : "column",
          gap: 8,
          alignItems: team.mode === "roundtable" ? "flex-start" : "stretch",
          flexWrap: "wrap",
        },
      },
      ...(() => {
        if (hasSteps) {
          // Show explicit steps
          return steps
            .map((step, i) => {
              const member = team.members.find(
                (m) => m.name === step.agentName,
              );
              return [
                i > 0 && team.mode !== "roundtable"
                  ? React.createElement(
                      "div",
                      {
                        key: `arrow-${i}`,
                        style: {
                          textAlign: "center",
                          color: modeColors[team.mode],
                          fontSize: 14,
                        },
                      },
                      modeIcons[team.mode],
                    )
                  : null,
                React.createElement(
                  "div",
                  {
                    key: `step-${i}`,
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 10px",
                      background: "#fff",
                      borderRadius: 6,
                      border: `1px solid ${modeColors[team.mode]}33`,
                      fontSize: 12,
                      flex:
                        team.mode === "roundtable" ? "1 1 200px" : "initial",
                    },
                  },
                  React.createElement(ExpertAvatar, {
                    name: step.agentName,
                    size: 24,
                  }),
                  React.createElement(
                    "div",
                    null,
                    React.createElement(
                      Text,
                      { strong: true, style: { fontSize: 12 } },
                      step.agentName,
                    ),
                    React.createElement(
                      "div",
                      {
                        style: {
                          fontSize: 11,
                          color: "#8c8c8c",
                          maxWidth: 250,
                        },
                      },
                      step.instruction,
                    ),
                    step.passContext
                      ? React.createElement(
                          Tag,
                          {
                            color: "blue",
                            style: { fontSize: 9, marginTop: 2 },
                          },
                          "传递上下文",
                        )
                      : React.createElement(
                          Tag,
                          { style: { fontSize: 9, marginTop: 2 } },
                          "独立",
                        ),
                  ),
                ),
              ];
            })
            .flat();
        }
        // Show member-based flow
        return team.members
          .map((m, i) => [
            i > 0 && team.mode !== "roundtable"
              ? React.createElement(
                  "div",
                  {
                    key: `arrow-${i}`,
                    style: {
                      textAlign: "center",
                      color: modeColors[team.mode],
                      fontSize: 14,
                    },
                  },
                  modeIcons[team.mode],
                )
              : null,
            React.createElement(
              "div",
              {
                key: `member-${i}`,
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 10px",
                  background: "#fff",
                  borderRadius: 6,
                  border: `1px solid ${modeColors[team.mode]}33`,
                  fontSize: 12,
                  flex: team.mode === "roundtable" ? "1 1 150px" : "initial",
                },
              },
              React.createElement(ExpertAvatar, { name: m.name, size: 24 }),
              React.createElement(
                "div",
                null,
                React.createElement(
                  Text,
                  { strong: true, style: { fontSize: 12 } },
                  m.name,
                ),
                React.createElement(
                  "div",
                  { style: { fontSize: 11, color: "#8c8c8c" } },
                  m.role,
                ),
              ),
            ),
          ])
          .flat();
      })(),
    ),
  );
}

// ─── Team Builder Modal (create/edit custom teams) ───────────────────────────

function TeamBuilderModal({
  open,
  onClose,
  agents,
  editingTeam,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  agents: AgentSummary[];
  editingTeam: ExpertTeam | null;
  onSaved: () => void;
}) {
  const React = getHost().React;
  const { useState, useEffect, useCallback } = React;
  const {
    Modal,
    Input,
    Button,
    Select,
    Tag,
    Typography,
    Switch,
    Empty,
    message: antdMsg,
    Divider,
    Steps,
  } = getHost().antd;
  const { PlusOutlined, DeleteOutlined, SaveOutlined, ArrowRightOutlined } =
    getHost().antdIcons || {};
  const { Text, Paragraph } = Typography;

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🤝");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<"coordinator" | "pipeline" | "roundtable">(
    "pipeline",
  );
  const [coordinatorName, setCoordinatorName] = useState<string>("");
  const [taskTemplate, setTaskTemplate] = useState("");
  const [steps, setSteps] = useState<ExpertTeamStep[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (editingTeam) {
        setName(editingTeam.name);
        setEmoji(editingTeam.emoji);
        setDescription(editingTeam.description);
        setMode(editingTeam.mode);
        setCoordinatorName(editingTeam.coordinatorName || "");
        setTaskTemplate(editingTeam.taskTemplate);
        setSteps(editingTeam.steps || []);
        setSelectedMembers(editingTeam.members.map((m) => m.name));
      } else {
        setName("");
        setEmoji("🤝");
        setDescription("");
        setMode("pipeline");
        setCoordinatorName("");
        setTaskTemplate("请执行以下任务：\n任务描述：{任务描述}");
        setSteps([]);
        setSelectedMembers([]);
      }
    }
  }, [open, editingTeam]);

  // Sync steps when mode or members change
  const syncStepsFromMembers = useCallback(() => {
    if (mode === "roundtable") {
      // Each member gets an independent step
      const newSteps = selectedMembers.map((agentName) => ({
        agentName,
        instruction: "请给出你的专业评估意见",
        passContext: false,
      }));
      setSteps(newSteps);
    } else if (mode === "pipeline") {
      // Each member gets a sequential step
      const existing = new Map(steps.map((s) => [s.agentName, s]));
      const newSteps = selectedMembers.map((agentName) => {
        const existingStep = existing.get(agentName);
        return (
          existingStep || {
            agentName,
            instruction: "请完成你的专业部分",
            passContext: true,
          }
        );
      });
      setSteps(newSteps);
    }
  }, [mode, selectedMembers, steps]);

  const handleAddMember = (agentName: string) => {
    if (!selectedMembers.includes(agentName)) {
      setSelectedMembers([...selectedMembers, agentName]);
      // For coordinator mode, set first member as coordinator
      if (mode === "coordinator" && !coordinatorName) {
        setCoordinatorName(agentName);
      }
    }
  };

  const handleRemoveMember = (agentName: string) => {
    setSelectedMembers(selectedMembers.filter((n) => n !== agentName));
    setSteps(steps.filter((s) => s.agentName !== agentName));
    if (coordinatorName === agentName) {
      setCoordinatorName(selectedMembers[0] || "");
    }
  };

  const handleUpdateStep = (
    index: number,
    field: keyof ExpertTeamStep,
    value: any,
  ) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleSave = () => {
    if (!name.trim()) {
      antdMsg.warning("请输入团队名称");
      return;
    }
    if (selectedMembers.length < 2) {
      antdMsg.warning("至少需要选择 2 个成员");
      return;
    }
    if (!taskTemplate.trim()) {
      antdMsg.warning("请输入任务模板");
      return;
    }
    if (mode === "coordinator" && !coordinatorName) {
      antdMsg.warning("请选择协调者");
      return;
    }

    setSaving(true);
    try {
      // Build member objects from agent list
      const memberObjs: ExpertTeamMember[] = selectedMembers.map(
        (agentName) => {
          const agent = agents.find((a) => a.name === agentName);
          return {
            name: agentName,
            role: agent?.description?.slice(0, 30) || "团队成员",
            emoji: "",
          };
        },
      );

      // Sync steps if not manually set
      let finalSteps = steps;
      if (steps.length === 0 || steps.length !== selectedMembers.length) {
        finalSteps = selectedMembers.map((agentName) => ({
          agentName,
          instruction: "请完成你的专业部分",
          passContext: mode === "pipeline",
        }));
      }

      const team: ExpertTeam = {
        id: editingTeam?.id || `custom-${Date.now()}`,
        name: name.trim(),
        emoji,
        category: "自定义",
        description:
          description.trim() ||
          `${name.trim()}（${selectedMembers.length}人团队）`,
        mode,
        members: memberObjs,
        coordinatorName: mode === "coordinator" ? coordinatorName : undefined,
        taskTemplate: taskTemplate.trim(),
        orchestrationPrompt: "", // Custom teams use steps-based instructions
        steps: finalSteps,
        custom: true,
        createdAt: editingTeam?.createdAt || Date.now(),
      };

      // Save to localStorage
      const existing = loadCustomTeams();
      const idx = existing.findIndex((t) => t.id === team.id);
      if (idx >= 0) {
        existing[idx] = team;
      } else {
        existing.push(team);
      }
      saveCustomTeams(existing);

      antdMsg.success(editingTeam ? "团队已更新" : "团队已创建");
      onSaved();
      onClose();
    } catch (err: any) {
      antdMsg.error(err.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const emojiOptions = [
    "🤝",
    "🛢️",
    "⛏️",
    "📋",
    "🧪",
    "🌍",
    "📡",
    "⚙️",
    "🔬",
    "📊",
    "🏗️",
    "💡",
  ];

  const availableAgents = agents.filter(
    (a) => !selectedMembers.includes(a.name),
  );

  return React.createElement(
    Modal,
    {
      open,
      onCancel: onClose,
      title: React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        React.createElement(
          "span",
          { style: { fontSize: 20 } },
          editingTeam ? "✏️" : "➕",
        ),
        React.createElement(
          "span",
          null,
          editingTeam ? "编辑专家团" : "创建专家团",
        ),
      ),
      width: 720,
      onOk: handleSave,
      okText: "保存团队",
      confirmLoading: saving,
      okButtonProps: {
        icon: SaveOutlined ? React.createElement(SaveOutlined) : undefined,
      },
    },
    // Step 1: Basic info
    React.createElement(
      "div",
      { style: { marginBottom: 16 } },
      React.createElement(
        Text,
        {
          strong: true,
          style: { display: "block", marginBottom: 8, fontSize: 13 },
        },
        "1. 基本信息",
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        selectedMembers.length > 0
          ? React.createElement(TeamAvatar, {
              members: selectedMembers,
              size: 36,
            })
          : null,
        React.createElement(Input, {
          placeholder: "团队名称（如：储层评价团队）",
          value: name,
          onChange: (e: any) => setName(e.target.value),
          style: { flex: 1 },
        }),
      ),
      React.createElement(Input.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: description,
        onChange: (e: any) => setDescription(e.target.value),
        rows: 2,
        style: { marginBottom: 8 },
      }),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        React.createElement(
          Text,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式：",
        ),
        React.createElement(Select, {
          value: mode,
          onChange: (v: any) => setMode(v),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" },
          ],
        }),
      ),
    ),
    React.createElement(Divider, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    React.createElement(
      "div",
      { style: { marginBottom: 16 } },
      React.createElement(
        Text,
        {
          strong: true,
          style: { display: "block", marginBottom: 8, fontSize: 13 },
        },
        "2. 选择团队成员",
      ),
      // Available agents
      availableAgents.length > 0
        ? React.createElement(
            "div",
            {
              style: {
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginBottom: 8,
                padding: 8,
                background: "#f5f5f5",
                borderRadius: 6,
              },
            },
            ...availableAgents.map((agent) =>
              React.createElement(
                Button,
                {
                  key: agent.id,
                  size: "small",
                  icon: PlusOutlined
                    ? React.createElement(PlusOutlined)
                    : undefined,
                  onClick: () => handleAddMember(agent.name),
                },
                agent.name,
              ),
            ),
          )
        : null,
      // Selected members
      selectedMembers.length === 0
        ? React.createElement(Empty, {
            description: "请从上方添加团队成员",
            image: Empty.PRESENTED_IMAGE_SIMPLE,
          })
        : React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...selectedMembers.map((memberName) =>
              React.createElement(
                "div",
                {
                  key: memberName,
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 10px",
                    background: "#f0f5ff",
                    borderRadius: 6,
                    border: "1px solid #d6e4ff",
                  },
                },
                React.createElement(
                  "div",
                  { style: { display: "flex", alignItems: "center", gap: 6 } },
                  React.createElement(ExpertAvatar, { name: memberName, size: 24 }),
                  React.createElement(
                    Text,
                    { strong: true, style: { fontSize: 13 } },
                    memberName,
                  ),
                  mode === "coordinator" && coordinatorName === memberName
                    ? React.createElement(
                        Tag,
                        { color: "blue", style: { fontSize: 10 } },
                        "协调者",
                      )
                    : null,
                ),
                React.createElement(
                  "div",
                  { style: { display: "flex", gap: 4 } },
                  mode === "coordinator"
                    ? React.createElement(
                        Button,
                        {
                          size: "small",
                          type: "link",
                          onClick: () => setCoordinatorName(memberName),
                        },
                        "设为协调者",
                      )
                    : null,
                  React.createElement(
                    Button,
                    {
                      size: "small",
                      type: "link",
                      danger: true,
                      icon: DeleteOutlined
                        ? React.createElement(DeleteOutlined)
                        : undefined,
                      onClick: () => handleRemoveMember(memberName),
                    },
                    "移除",
                  ),
                ),
              ),
            ),
          ),
    ),
    React.createElement(Divider, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    selectedMembers.length > 0
      ? React.createElement(
          "div",
          { style: { marginBottom: 16 } },
          React.createElement(
            Text,
            {
              strong: true,
              style: { display: "block", marginBottom: 8, fontSize: 13 },
            },
            `3. 编排执行步骤${mode === "roundtable" ? "（各步独立执行）" : mode === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`,
          ),
          // Auto-sync button
          React.createElement(
            Button,
            {
              size: "small",
              type: "dashed",
              onClick: syncStepsFromMembers,
              style: { marginBottom: 8 },
            },
            "自动生成步骤",
          ),
          // Steps list
          steps.length === 0
            ? React.createElement(
                Text,
                { type: "secondary", style: { fontSize: 12 } },
                "点击「自动生成步骤」或手动配置每步的指令",
              )
            : React.createElement(
                "div",
                { style: { display: "flex", flexDirection: "column", gap: 6 } },
                ...steps.map((step, i) =>
                  React.createElement(
                    "div",
                    {
                      key: i,
                      style: {
                        padding: 8,
                        background: "#fff",
                        borderRadius: 6,
                        border: "1px solid #e8e8e8",
                      },
                    },
                    React.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 6,
                        },
                      },
                      mode === "pipeline"
                        ? React.createElement(
                            "div",
                            {
                              style: {
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                background: "#13c2c2",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 600,
                              },
                            },
                            `${i + 1}`,
                          )
                        : React.createElement(
                            "span",
                            { style: { fontSize: 14 } },
                            "🔀",
                          ),
                      React.createElement(
                        Tag,
                        { color: "blue", style: { fontSize: 11 } },
                        step.agentName,
                      ),
                      React.createElement(
                        "div",
                        { style: { flex: 1 } },
                        React.createElement(Input, {
                          placeholder: "请输入该步骤的指令...",
                          value: step.instruction,
                          onChange: (e: any) =>
                            handleUpdateStep(i, "instruction", e.target.value),
                          size: "small",
                        }),
                      ),
                    ),
                    React.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          paddingLeft: 28,
                        },
                      },
                      React.createElement(Switch, {
                        size: "small",
                        checked: step.passContext,
                        onChange: (v: boolean) =>
                          handleUpdateStep(i, "passContext", v),
                      }),
                      React.createElement(
                        Text,
                        { type: "secondary", style: { fontSize: 11 } },
                        step.passContext
                          ? "传递上一步结果作为上下文"
                          : "独立执行",
                      ),
                    ),
                  ),
                ),
              ),
        )
      : null,
    React.createElement(Divider, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    React.createElement(
      "div",
      null,
      React.createElement(
        Text,
        {
          strong: true,
          style: { display: "block", marginBottom: 8, fontSize: 13 },
        },
        `${selectedMembers.length > 0 ? "4" : "3"}. 任务模板`,
      ),
      React.createElement(Input.TextArea, {
        placeholder:
          "输入任务模板，可用 {参数名} 作为占位符...\n\n例如：\n请对区块 {区块名} 的井 {井号} 进行储层评价",
        value: taskTemplate,
        onChange: (e: any) => setTaskTemplate(e.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 },
      }),
      React.createElement(
        Text,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 },
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换",
      ),
    ),
  );
}

/**
 * ExpertTeamCard component — displays a team with members, mode, and launch button.
 */
function ExpertTeamCard({
  team,
  agents,
  onLaunch,
  onEdit,
  onDelete,
}: {
  team: ExpertTeam;
  agents: AgentSummary[];
  onLaunch: (team: ExpertTeam) => void;
  onEdit?: (team: ExpertTeam) => void;
  onDelete?: (team: ExpertTeam) => void;
}) {
  const React = getHost().React;
  const { useState } = React;
  const { Card, Tag, Typography, Button, Tooltip } = getHost().antd;
  const {
    TeamOutlined,
    RocketOutlined,
    UserOutlined,
    EditOutlined,
    DeleteOutlined,
    DownOutlined,
    UpOutlined,
  } = getHost().antdIcons || {};
  const { Text, Paragraph } = Typography;

  const [showFlow, setShowFlow] = useState(false);

  const modeLabels: Record<string, { label: string; color: string }> = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" },
  };
  const modeInfo = modeLabels[team.mode] || modeLabels.coordinator;

  // Check which members exist in the agent list
  const memberStatus = team.members.map((m) => {
    const agentId = findAgentIdByName(agents, m.name);
    return { ...m, found: !!agentId, agentId };
  });
  const foundCount = memberStatus.filter((m) => m.found).length;
  const allFound = foundCount === team.members.length;

  // Determine coordinator agent
  const coordinatorName = team.coordinatorName || team.members[0]?.name;
  const coordinatorAgent = coordinatorName
    ? findAgentIdByName(agents, coordinatorName)
    : null;

  return React.createElement(
    Card,
    {
      hoverable: true,
      size: "small",
      style: { height: "100%", display: "flex", flexDirection: "column" },
    },
    // Header: emoji + name + mode tag + custom badge
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        },
      },
      React.createElement(TeamAvatar, {
        members: team.members.map((m) => m.name),
        size: 36,
      }),
      React.createElement(
        "div",
        { style: { flex: 1 } },
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          React.createElement(
            Text,
            { strong: true, style: { fontSize: 14 } },
            team.name,
          ),
          team.custom
            ? React.createElement(
                Tag,
                { color: "gold", style: { fontSize: 9 } },
                "自定义",
              )
            : null,
        ),
        React.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          React.createElement(
            Tag,
            { color: modeInfo.color, style: { fontSize: 10 } },
            modeInfo.label,
          ),
          React.createElement(
            Tag,
            { style: { fontSize: 10 } },
            `${foundCount}/${team.members.length}`,
          ),
          !allFound
            ? React.createElement(
                Tag,
                { color: "orange", style: { fontSize: 10 } },
                "缺少成员",
              )
            : null,
        ),
      ),
      // Edit/delete for custom teams
      team.custom
        ? React.createElement(
            "div",
            { style: { display: "flex", gap: 2 } },
            onEdit
              ? React.createElement(
                  Tooltip,
                  { title: "编辑" },
                  React.createElement(Button, {
                    type: "text",
                    size: "small",
                    icon: EditOutlined
                      ? React.createElement(EditOutlined)
                      : undefined,
                    onClick: (e: any) => {
                      e.stopPropagation();
                      onEdit(team);
                    },
                  }),
                )
              : null,
            onDelete
              ? React.createElement(
                  Tooltip,
                  { title: "删除" },
                  React.createElement(Button, {
                    type: "text",
                    size: "small",
                    danger: true,
                    icon: DeleteOutlined
                      ? React.createElement(DeleteOutlined)
                      : undefined,
                    onClick: (e: any) => {
                      e.stopPropagation();
                      onDelete(team);
                    },
                  }),
                )
              : null,
          )
        : null,
    ),
    // Description
    React.createElement(
      Paragraph,
      {
        type: "secondary",
        style: { fontSize: 12, margin: 0, marginBottom: 10, lineHeight: 1.5 },
        ellipsis: { rows: 2 },
      },
      team.description,
    ),
    // Member avatars
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 6,
          marginBottom: 10,
          flexWrap: "wrap",
        },
      },
      ...memberStatus.map((m) =>
        React.createElement(
          Tooltip,
          {
            key: m.name,
            title: `${m.name}（${m.role}）${m.found ? "" : " - 未创建"}`,
          },
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                borderRadius: 12,
                background: m.found ? "#f0f5ff" : "#fff2f0",
                border: `1px solid ${m.found ? "#d6e4ff" : "#ffccc7"}`,
                fontSize: 11,
              },
            },
            React.createElement(ExpertAvatar, { name: m.name, size: 18 }),
            React.createElement(
              Text,
              {
                style: { fontSize: 11, color: m.found ? "#1f4e8c" : "#cf1322" },
              },
              m.name,
            ),
          ),
        ),
      ),
    ),
    // Toggle flow diagram
    React.createElement(
      Button,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (e: any) => {
          e.stopPropagation();
          setShowFlow(!showFlow);
        },
        icon: showFlow
          ? UpOutlined
            ? React.createElement(UpOutlined)
            : "▲"
          : DownOutlined
            ? React.createElement(DownOutlined)
            : "▼",
      },
      showFlow ? "收起流程" : "查看执行流程",
    ),
    showFlow ? React.createElement(TeamFlowDiagram, { team }) : null,
    // Footer: launch button
    React.createElement(
      "div",
      {
        style: {
          marginTop: "auto",
          paddingTop: 8,
          borderTop: "1px solid #f0f0f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        },
      },
      React.createElement(
        Text,
        { type: "secondary", style: { fontSize: 11 } },
        coordinatorName ? `协调者: ${coordinatorName}` : "",
      ),
      React.createElement(
        Button,
        {
          type: "primary",
          size: "small",
          icon: RocketOutlined
            ? React.createElement(RocketOutlined)
            : undefined,
          disabled: !coordinatorAgent,
          onClick: () => onLaunch(team),
          style: PRIMARY_BTN_STYLE,
        },
        "发起团队任务",
      ),
    ),
  );
}

/**
 * ExpertTeamSection — displays preset expert teams and allows launching team tasks.
 */
function ExpertTeamSection({
  agents,
  onLaunch,
}: {
  agents: AgentSummary[];
  onLaunch: (team: ExpertTeam) => void;
}) {
  const React = getHost().React;
  const { useMemo, useState, useCallback, useEffect } = React;
  const {
    Row,
    Col,
    Input,
    Empty,
    Typography,
    Tag,
    Button,
    Divider,
    message: antdMsg,
    Popconfirm,
  } = getHost().antd;
  const { SearchOutlined, TeamOutlined, PlusOutlined, RocketOutlined } =
    getHost().antdIcons || {};
  const { Text } = Typography;

  const [searchText, setSearchText] = useState("");
  const [customTeams, setCustomTeams] = useState<ExpertTeam[]>([]);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<ExpertTeam | null>(null);

  // Load custom teams from localStorage on mount
  useEffect(() => {
    setCustomTeams(loadCustomTeams());
  }, []);

  const refreshCustomTeams = useCallback(() => {
    setCustomTeams(loadCustomTeams());
  }, []);

  const handleDeleteTeam = useCallback(
    (team: ExpertTeam) => {
      const existing = loadCustomTeams();
      const filtered = existing.filter((t) => t.id !== team.id);
      saveCustomTeams(filtered);
      setCustomTeams(filtered);
      antdMsg.success(`团队「${team.name}」已删除`);
    },
    [antdMsg],
  );

  const handleEditTeam = useCallback((team: ExpertTeam) => {
    setEditingTeam(team);
    setBuilderOpen(true);
  }, []);

  const handleCreateTeam = useCallback(() => {
    setEditingTeam(null);
    setBuilderOpen(true);
  }, []);

  // Combine preset + custom teams
  const allTeams = useMemo(() => {
    return [...customTeams, ...EXPERT_TEAMS];
  }, [customTeams]);

  const filteredTeams = useMemo(() => {
    if (!searchText.trim()) return allTeams;
    const q = searchText.toLowerCase();
    return allTeams.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
    );
  }, [allTeams, searchText]);

  // Split into custom and preset for display
  const customFiltered = filteredTeams.filter((t) => t.custom);
  const presetFiltered = filteredTeams.filter((t) => !t.custom);

  return React.createElement(
    "div",
    null,
    // Info banner
    React.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          padding: "12px 16px",
          background: "linear-gradient(135deg, #f6ffed 0%, #f0fff0 100%)",
          borderRadius: 8,
          border: "1px solid #b7eb8f",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        },
      },
      React.createElement(
        Text,
        { style: { fontSize: 13, color: "#389e0d" } },
        "多智能体协同 — 选择预设团队或创建自定义团队，支持流水线、圆桌讨论、协调者三种编排模式。",
      ),
      React.createElement(
        Button,
        {
          type: "primary",
          size: "small",
          icon: PlusOutlined ? React.createElement(PlusOutlined) : undefined,
          onClick: handleCreateTeam,
          style: PRIMARY_BTN_STYLE,
        },
        "创建专家团",
      ),
    ),
    // Search
    React.createElement(Input, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: SearchOutlined ? React.createElement(SearchOutlined) : undefined,
      value: searchText,
      onChange: (e: any) => setSearchText(e.target.value),
      allowClear: true,
      style: { marginBottom: 16, maxWidth: 400 },
    }),
    // Custom teams section
    customFiltered.length > 0
      ? React.createElement(
          "div",
          { style: { marginBottom: 20 } },
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 10,
              },
            },
            React.createElement("span", { style: { fontSize: 16 } }),
            React.createElement(
              Text,
              { strong: true, style: { fontSize: 14 } },
              `自定义团队 (${customFiltered.length})`,
            ),
          ),
          React.createElement(
            Row,
            { gutter: [12, 12] },
            ...customFiltered.map((team) =>
              React.createElement(
                Col,
                { key: team.id, xs: 24, sm: 12, md: 8 },
                React.createElement(ExpertTeamCard, {
                  team,
                  agents,
                  onLaunch,
                  onEdit: handleEditTeam,
                  onDelete: handleDeleteTeam,
                }),
              ),
            ),
          ),
          React.createElement(Divider, { style: { margin: "16px 0" } }),
        )
      : null,
    // Preset teams section
    presetFiltered.length > 0
      ? React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 10,
              },
            },
            React.createElement("span", { style: { fontSize: 16 } }),
            React.createElement(
              Text,
              { strong: true, style: { fontSize: 14 } },
              `预设团队 (${presetFiltered.length})`,
            ),
            React.createElement(
              Text,
              { type: "secondary", style: { fontSize: 12 } },
              "· 行业典型工作流模板",
            ),
          ),
          React.createElement(
            Row,
            { gutter: [12, 12] },
            ...presetFiltered.map((team) =>
              React.createElement(
                Col,
                { key: team.id, xs: 24, sm: 12, md: 8 },
                React.createElement(ExpertTeamCard, {
                  team,
                  agents,
                  onLaunch,
                }),
              ),
            ),
          ),
        )
      : null,
    // Empty state
    filteredTeams.length === 0
      ? React.createElement(Empty, {
          description: "未找到匹配的专家团队，点击「创建专家团」自定义",
          image: Empty.PRESENTED_IMAGE_SIMPLE,
        })
      : null,
    // Team Builder Modal
    React.createElement(TeamBuilderModal, {
      open: builderOpen,
      onClose: () => {
        setBuilderOpen(false);
        setEditingTeam(null);
      },
      agents,
      editingTeam,
      onSaved: refreshCustomTeams,
    }),
  );
}

// ─── Preset Prompt Extraction ────────────────────────────────────────────────

/**
 * Auto-generate suggested prompts from a list of skills.
 *
 * Each enabled skill's `description` is transformed into a natural-language
 * request that the user can click to start a conversation.
 */
/** Prompt object with a visible label and the full prompt value. */
interface PromptItem {
  label: string;
  value: string;
}

function extractPromptFromSkills(skills: SkillSpec[]): PromptItem[] {
  const prompts: PromptItem[] = [];
  for (const skill of skills) {
    if (skill.enabled === false) continue;
    const desc = skill.description?.trim();
    if (!desc) continue;

    // Use skill name as the short label (fall back to truncated description)
    const label = (skill.name || desc).length > 20
      ? (skill.name || desc).substring(0, 18) + "…"
      : (skill.name || desc);

    // Transform description into a user-facing prompt
    let prompt = desc;
    // Strip markdown formatting for cleaner prompt text
    prompt = prompt
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`(.+?)`/g, "$1")
      .replace(/^#+\s*/gm, "")
      .trim();

    // Transform into a request sentence
    if (
      /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(prompt)
    ) {
      // Starts with a verb — prefix with "请"
      prompt = `请${prompt}`;
    } else if (/^(a |an |the )/i.test(prompt)) {
      // English article — leave as is
      prompt = `Help me with ${prompt}`;
    } else if (!/[。？！.?!]$/.test(prompt)) {
      // No ending punctuation — add "帮我" prefix
      prompt = `帮我${prompt}`;
    }

    // Cap length
    if (prompt.length > 80) {
      prompt = prompt.substring(0, 77) + "...";
    }

    prompts.push({ label, value: prompt });
    if (prompts.length >= 4) break;
  }
  return prompts;
}

// ─── Knowledge Base Helpers ──────────────────────────────────────────────────

interface KnowledgeFileInfo {
  filename: string;
  path: string;
  size: number;
  created_time: string;
  modified_time: string;
}

async function fetchKnowledgeFiles(
  agentId: string,
): Promise<KnowledgeFileInfo[]> {
  // Use the workspace API to list md files for this agent
  const data = await apiFetch<KnowledgeFileInfo[]>("/workspace/files", {
    headers: { "X-Agent-Id": agentId },
  });
  return data || [];
}

async function writeKnowledgeFile(
  agentId: string,
  filename: string,
  content: string,
): Promise<void> {
  await apiFetch(`/workspace/files/${encodeURIComponent(filename)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
    body: JSON.stringify({ content }),
  });
}

async function updateAgentSystemPromptFiles(
  agentId: string,
  systemPromptFiles: string[],
): Promise<void> {
  // Fetch current config, update system_prompt_files, save back
  const config = await fetchAgentConfig(agentId);
  config.system_prompt_files = systemPromptFiles;
  await apiFetch(`/agents/${encodeURIComponent(agentId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
}

// ─── Skill Management Helpers ────────────────────────────────────────────────

/** Download a skill from the pool into an agent's workspace. */
async function installSkillFromPool(
  agentId: string,
  skillName: string,
): Promise<void> {
  await apiFetch("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: skillName,
      targets: [{ workspace_id: agentId }],
      overwrite: false,
    }),
  });
}

/** Enable a skill in an agent's workspace. */
async function enableSkillForAgent(
  agentId: string,
  skillName: string,
): Promise<void> {
  await apiFetch(`/skills/${encodeURIComponent(skillName)}/enable`, {
    method: "POST",
    headers: { "X-Agent-Id": agentId },
  });
}

/** Delete a skill from an agent's workspace. */
async function deleteSkillForAgent(
  agentId: string,
  skillName: string,
): Promise<void> {
  await apiFetch(`/skills/${encodeURIComponent(skillName)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": agentId },
  });
}

// ─── Batch Skill Management Helpers ──────────────────────────────────────────

interface BatchSkillResult {
  results: Record<string, { success: boolean; reason?: string }>;
}

async function batchEnableSkillsForAgent(
  agentId: string,
  skillNames: string[],
): Promise<BatchSkillResult> {
  return apiFetch<BatchSkillResult>("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
    body: JSON.stringify(skillNames),
  });
}

async function batchDisableSkillsForAgent(
  agentId: string,
  skillNames: string[],
): Promise<BatchSkillResult> {
  return apiFetch<BatchSkillResult>("/skills/batch-disable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
    body: JSON.stringify(skillNames),
  });
}

async function batchDeleteSkillsForAgent(
  agentId: string,
  skillNames: string[],
): Promise<BatchSkillResult> {
  return apiFetch<BatchSkillResult>("/skills/batch-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
    body: JSON.stringify(skillNames),
  });
}

// ─── MCP Management Helpers ──────────────────────────────────────────────────

/** List all MCP clients for a specific agent. */
async function fetchAgentMCPClients(agentId: string): Promise<MCPClientInfo[]> {
  const data = await apiFetch<MCPClientInfo[]>("/mcp", {
    headers: { "X-Agent-Id": agentId },
  });
  return data || [];
}

/** Delete an MCP client from a specific agent. */
async function deleteMCPForAgent(
  agentId: string,
  clientKey: string,
): Promise<void> {
  await apiFetch(`/mcp/${encodeURIComponent(clientKey)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": agentId },
  });
}

/** Create an MCP client for a specific agent. */
async function createMCPForAgent(
  agentId: string,
  body: Record<string, unknown>,
): Promise<MCPClientInfo> {
  return apiFetch<MCPClientInfo>("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
    body: JSON.stringify(body),
  });
}

/** Toggle an MCP client's enabled status for a specific agent. */
async function toggleMCPForAgent(
  agentId: string,
  clientKey: string,
): Promise<MCPClientInfo> {
  return apiFetch<MCPClientInfo>(
    `/mcp/toggle/${encodeURIComponent(clientKey)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": agentId },
    },
  );
}

/** Disable a skill in an agent's workspace. */
async function disableSkillForAgent(
  agentId: string,
  skillName: string,
): Promise<void> {
  await apiFetch(`/skills/${encodeURIComponent(skillName)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": agentId },
  });
}

// ─── Heartbeat Helpers ───────────────────────────────────────────────────────

interface HeartbeatConfig {
  enabled: boolean;
  every: string;
  target: string;
  timeoutSeconds: number;
  activeHours?: { start: string; end: string } | null;
}

interface EveryParts {
  number: number;
  unit: "m" | "h";
}

function parseEvery(every: string): EveryParts {
  const s = (every || "").trim();
  if (!s) return { number: 6, unit: "h" };
  const m = s.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!m) return { number: 6, unit: "h" };
  const hours = parseInt(m[1] || "0", 10);
  const minutes = parseInt(m[2] || "0", 10);
  const seconds = parseInt(m[3] || "0", 10);
  const totalMinutes = hours * 60 + minutes + Math.round(seconds / 60);
  if (totalMinutes <= 0) return { number: 6, unit: "h" };
  if (totalMinutes >= 60 && totalMinutes % 60 === 0) {
    return { number: totalMinutes / 60, unit: "h" };
  }
  return { number: totalMinutes, unit: "m" };
}

function serializeEvery(parts: EveryParts): string {
  return parts.unit === "h" ? `${parts.number}h` : `${parts.number}m`;
}

async function fetchHeartbeatConfig(
  agentId: string,
): Promise<HeartbeatConfig> {
  return apiFetch<HeartbeatConfig>("/config/heartbeat", {
    headers: { "X-Agent-Id": agentId },
  });
}

async function updateHeartbeatConfig(
  agentId: string,
  body: HeartbeatConfig,
): Promise<HeartbeatConfig> {
  return apiFetch<HeartbeatConfig>("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
    body: JSON.stringify(body),
  });
}

async function runHeartbeatNow(agentId: string): Promise<void> {
  await apiFetch<{ started: boolean }>("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": agentId },
  });
}

// ─── Running Config Helpers ──────────────────────────────────────────────────

interface LoopIterationConfig {
  enabled?: boolean;
  max_iterations?: number;
}
interface LoopDoomLoopConfig {
  enabled?: boolean;
  window_size?: number;
  similarity_threshold?: number;
  stages?: unknown[];
}
interface LoopConfig {
  iteration?: LoopIterationConfig;
  doom_loop?: LoopDoomLoopConfig;
}
interface AutoTitleConfig {
  enabled: boolean;
  timeout_seconds: number;
}
interface LightContextConfig {
  strategy?: string;
  dialog_path?: string;
  token_count_estimate_divisor?: number;
  scroll_config?: {
    history_retention_days?: number;
  };
  [key: string]: unknown;
}
interface AgentsRunningConfig {
  max_iters: number;
  loop?: LoopConfig;
  shell_command_timeout: number;
  shell_command_executable: string;
  llm_retry_enabled: boolean;
  llm_max_retries: number;
  llm_backoff_base: number;
  llm_backoff_cap: number;
  llm_max_concurrent: number;
  llm_max_qpm: number;
  llm_rate_limit_pause: number;
  llm_rate_limit_jitter: number;
  llm_acquire_timeout: number;
  history_max_length: number;
  context_manager_backend: string;
  light_context_config?: LightContextConfig;
  memory_manager_backend: string;
  reme_light_memory_config?: unknown;
  adbpg_memory_config?: unknown;
  approval_level?: string;
  auto_title_config?: AutoTitleConfig;
  [key: string]: unknown;
}

async function fetchRunningConfig(
  agentId: string,
): Promise<AgentsRunningConfig> {
  return apiFetch<AgentsRunningConfig>("/workspace/running-config", {
    headers: { "X-Agent-Id": agentId },
  });
}

async function updateRunningConfig(
  agentId: string,
  body: AgentsRunningConfig,
): Promise<AgentsRunningConfig> {
  return apiFetch<AgentsRunningConfig>("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
    body: JSON.stringify(body),
  });
}

// ─── System Prompt Files Helpers ─────────────────────────────────────────────

// ─── Language / Timezone Helpers (agent-scoped) ───────────────────────────────

async function fetchAgentLanguage(
  agentId: string,
): Promise<string> {
  const data = await apiFetch<{ language: string }>("/workspace/language", {
    headers: { "X-Agent-Id": agentId },
  });
  return data.language || "zh";
}

async function updateAgentLanguage(
  agentId: string,
  language: string,
): Promise<void> {
  await apiFetch<{ language: string }>("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
    body: JSON.stringify({ language }),
  });
}

async function fetchUserTimezone(): Promise<string> {
  const data = await apiFetch<{ timezone: string }>("/config/user-timezone");
  return data.timezone || "UTC";
}

async function updateUserTimezone(timezone: string): Promise<void> {
  await apiFetch<{ timezone: string }>("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone }),
  });
}

async function fetchSystemPromptFiles(agentId: string): Promise<string[]> {
  const data = await apiFetch<string[]>("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": agentId },
  });
  return data || [];
}

async function updateSystemPromptFiles(
  agentId: string,
  files: string[],
): Promise<string[]> {
  return apiFetch<string[]>("/workspace/system-prompt-files", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
    body: JSON.stringify(files),
  });
}

// Default system prompt files that are always present
const DEFAULT_PROMPT_FILES = ["AGENTS.md", "SOUL.md", "PROFILE.md"];

// ─── Shared Components ────────────────────────────────────────────────────────

function PageHeader({
  title,
  subtitle,
  extra,
}: {
  title: string;
  subtitle?: string;
  extra?: React.ReactNode;
}) {
  const React = getHost().React;
  const { Space } = getHost().antd;
  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 12,
        borderBottom: "1px solid #f0f0f0",
      },
    },
    React.createElement(
      "div",
      null,
      React.createElement(
        "h2",
        { style: { margin: 0, fontSize: 20, fontWeight: 600 } },
        title,
      ),
      subtitle
        ? React.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 13, color: "#8c8c8c" } },
            subtitle,
          )
        : null,
    ),
    extra ? React.createElement(Space, null, extra) : null,
  );
}

function TagList({
  items,
  max = 5,
  color = "blue",
  emptyText = "无",
}: {
  items: string[];
  max?: number;
  color?: string;
  emptyText?: string;
}) {
  const React = getHost().React;
  const { Tag } = getHost().antd;
  if (!items || items.length === 0) {
    return React.createElement(
      "span",
      { style: { fontSize: 12, color: "#bfbfbf" } },
      emptyText,
    );
  }
  return React.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...items
      .slice(0, max)
      .map((item, i) =>
        React.createElement(
          Tag,
          { key: i, color, style: { fontSize: 11, marginRight: 0 } },
          item,
        ),
      ),
    items.length > max
      ? React.createElement(
          Tag,
          { style: { fontSize: 11, marginRight: 0 } },
          `+${items.length - max}`,
        )
      : null,
  );
}

// ─── Skill Picker Modal (card-grid style, consistent with Skill Center) ───────

function SkillPickerModal({
  open,
  onClose,
  poolSkills,
  installedSkillNames,
  loading,
  onInstall,
}: {
  open: boolean;
  onClose: () => void;
  poolSkills: PoolSkillSpec[];
  installedSkillNames: string[];
  loading: boolean;
  onInstall: (skillNames: string[]) => Promise<void>;
}) {
  const React = getHost().React;
  const { useState, useEffect, useMemo } = React;
  const { Modal, Button, Empty, Spin, Input, Tag, Tooltip, Typography } =
    getHost().antd;
  const { CheckOutlined, SearchOutlined } = getHost().antdIcons || {};
  const { Text } = Typography;

  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedNames([]);
      setSearchText("");
    }
  }, [open]);

  const filteredSkills = useMemo(() => {
    if (!searchText.trim()) return poolSkills;
    const q = searchText.toLowerCase();
    return poolSkills.filter(
      (s: PoolSkillSpec) =>
        s.name.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.tags?.some((t: string) => t.toLowerCase().includes(q)),
    );
  }, [poolSkills, searchText]);

  const availableSkills = filteredSkills.filter(
    (s: PoolSkillSpec) => !installedSkillNames.includes(s.name),
  );

  const toggleSkill = (name: string) => {
    setSelectedNames((prev: string[]) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const handleConfirm = async () => {
    if (selectedNames.length === 0) return;
    await onInstall(selectedNames);
    setSelectedNames([]);
  };

  return React.createElement(
    Modal,
    {
      open,
      onCancel: onClose,
      title: "从技能池选择技能",
      width: 680,
      footer: React.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          },
        },
        React.createElement(
          Text,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${selectedNames.length} 个技能`,
        ),
        React.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          React.createElement(Button, { onClick: onClose }, "取消"),
          React.createElement(
            Button,
            {
              type: "primary",
              onClick: handleConfirm,
              disabled: selectedNames.length === 0,
            },
            selectedNames.length > 0
              ? `添加 (${selectedNames.length})`
              : "添加",
          ),
        ),
      ),
    },
    // Search + bulk actions bar
    React.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 8,
          alignItems: "center",
        },
      },
      React.createElement(Input, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: SearchOutlined
          ? React.createElement(SearchOutlined)
          : undefined,
        value: searchText,
        onChange: (e: any) => setSearchText(e.target.value),
        allowClear: true,
        style: { flex: 1 },
      }),
      React.createElement(
        Button,
        {
          size: "small",
          type: "primary",
          onClick: () => setSelectedNames(availableSkills.map((s) => s.name)),
        },
        "全选",
      ),
      React.createElement(
        Button,
        {
          size: "small",
          onClick: () => setSelectedNames([]),
        },
        "清空",
      ),
    ),
    // Skill grid (card style matching Skill Center)
    loading
      ? React.createElement(
          "div",
          { style: { textAlign: "center", padding: 40 } },
          React.createElement(Spin, { size: "large" }),
        )
      : filteredSkills.length === 0
        ? React.createElement(Empty, {
            description: searchText ? "未找到匹配的技能" : "技能池暂无可用技能",
            image: Empty.PRESENTED_IMAGE_SIMPLE,
          })
        : React.createElement(
            "div",
            {
              style: {
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(145px, 1fr))",
                gap: 8,
                maxHeight: 360,
                overflowY: "auto",
                padding: 2,
              },
            },
            ...filteredSkills.map((skill: PoolSkillSpec) => {
              const isSelected = selectedNames.includes(skill.name);
              const isInstalled = installedSkillNames.includes(skill.name);
              return React.createElement(
                "div",
                {
                  key: skill.name,
                  onClick: () => !isInstalled && toggleSkill(skill.name),
                  style: {
                    position: "relative",
                    padding: "10px 12px",
                    border: `1px solid ${isSelected ? "#0072f5" : "#e8e8e8"}`,
                    borderRadius: 6,
                    cursor: isInstalled ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease",
                    background: isSelected
                      ? "rgba(0, 114, 245, 0.06)"
                      : isInstalled
                        ? "#fafafa"
                        : "#fff",
                    opacity: isInstalled ? 0.5 : 1,
                    minHeight: 64,
                  },
                },
                isSelected
                  ? React.createElement(
                      "span",
                      {
                        style: {
                          position: "absolute",
                          top: 6,
                          right: 6,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "#0072f5",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                        },
                      },
                      CheckOutlined
                        ? React.createElement(CheckOutlined)
                        : "\u2713",
                    )
                  : null,
                isInstalled
                  ? React.createElement(
                      "span",
                      {
                        style: {
                          position: "absolute",
                          top: 6,
                          right: 8,
                          fontSize: 10,
                          color: "#bbb",
                        },
                      },
                      "已安装",
                    )
                  : null,
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 4,
                      paddingRight: isInstalled || isSelected ? 24 : 0,
                    },
                  },
                  React.createElement(
                    "span",
                    { style: { fontSize: 16 } },
                    skill.emoji || "\u26a1",
                  ),
                  React.createElement(
                    Tooltip,
                    { title: skill.name },
                    React.createElement(
                      Text,
                      {
                        strong: true,
                        style: {
                          fontSize: 13,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        },
                      },
                      skill.name,
                    ),
                  ),
                ),
                skill.description
                  ? React.createElement(
                      "div",
                      {
                        style: {
                          fontSize: 11,
                          color: "#8c8c8c",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          lineHeight: "1.4",
                        },
                      },
                      skill.description,
                    )
                  : null,
                skill.tags && skill.tags.length > 0
                  ? React.createElement(
                      "div",
                      {
                        style: {
                          marginTop: 4,
                          display: "flex",
                          gap: 2,
                          flexWrap: "wrap",
                        },
                      },
                      ...skill.tags.slice(0, 2).map((tag: string, i: number) =>
                        React.createElement(
                          Tag,
                          {
                            key: i,
                            color: "cyan",
                            style: { fontSize: 10, marginRight: 0 },
                          },
                          tag,
                        ),
                      ),
                    )
                  : null,
              );
            }),
          ),
  );
}

// ─── Expert Config Modal ─────────────────────────────────────────────────────

// ── Shared layout styles for Expert Config Modal tabs ──
// A form-like layout: label on top, control below, consistent spacing.
const CFG_LABEL_STYLE: Record<string, unknown> = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  gap: 4,
};
const CFG_ROW_STYLE: Record<string, unknown> = { marginBottom: 16 };
// Two-column grid for fields that can share a row
const CFG_GRID_2COL_STYLE: Record<string, unknown> = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16,
};
// Section card title style
const CFG_SECTION_TITLE_STYLE: Record<string, unknown> = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(0,0,0,0.85)",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid #f0f0f0",
};
// Tooltip hint text next to a control
const CFG_HINT_STYLE: Record<string, unknown> = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8,
};

/** Heartbeat configuration tab — fetches/saves /config/heartbeat with X-Agent-Id. */
function HeartbeatConfigTab({ agentId }: { agentId: string }) {
  const React = getHost().React;
  const { useState, useEffect, useCallback } = React;
  const {
    Switch,
    InputNumber,
    Select,
    Button,
    Spin,
    Space,
    Typography,
    message: antdMsg,
  } = getHost().antd;
  const { PlayCircleOutlined, SaveOutlined } = getHost().antdIcons || {};
  const { Text } = Typography;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [everyNumber, setEveryNumber] = useState(6);
  const [everyUnit, setEveryUnit] = useState<"m" | "h">("h");
  const [target, setTarget] = useState("main");
  const [timeoutSeconds, setTimeoutSeconds] = useState(300);
  const [useActiveHours, setUseActiveHours] = useState(false);
  const [activeHoursStart, setActiveHoursStart] = useState("08:00");
  const [activeHoursEnd, setActiveHoursEnd] = useState("22:00");

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchHeartbeatConfig(agentId);
      const parts = parseEvery(data.every ?? "6h");
      setEnabled(data.enabled ?? false);
      setEveryNumber(parts.number);
      setEveryUnit(parts.unit);
      setTarget(data.target ?? "main");
      setTimeoutSeconds(data.timeoutSeconds ?? 300);
      setUseActiveHours(!!data.activeHours);
      setActiveHoursStart(data.activeHours?.start ?? "08:00");
      setActiveHoursEnd(data.activeHours?.end ?? "22:00");
    } catch (err: any) {
      antdMsg.error(err.message || "加载心跳配置失败");
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateHeartbeatConfig(agentId, {
        enabled,
        every: serializeEvery({ number: everyNumber, unit: everyUnit }),
        target,
        timeoutSeconds,
        activeHours:
          useActiveHours && activeHoursStart && activeHoursEnd
            ? { start: activeHoursStart, end: activeHoursEnd }
            : undefined,
      });
      antdMsg.success("心跳配置已保存");
    } catch (err: any) {
      antdMsg.error(err.message || "保存心跳配置失败");
    } finally {
      setSaving(false);
    }
  };

  const handleRunNow = async () => {
    setRunning(true);
    try {
      await runHeartbeatNow(agentId);
      antdMsg.success("已触发心跳检查");
    } catch (err: any) {
      antdMsg.error(err.message || "触发心跳失败");
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return React.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      React.createElement(Spin, { size: "large" }),
    );
  }

  // Helper: a labelled form field row
  const field = (label: string, control: any, hint?: string) =>
    React.createElement(
      "div",
      { style: CFG_ROW_STYLE },
      React.createElement("div", { style: CFG_LABEL_STYLE }, label),
      control,
      hint
        ? React.createElement(
            Text,
            { type: "secondary", style: CFG_HINT_STYLE },
            hint,
          )
        : null,
    );

  // Helper: a 2-column row with two labelled fields
  const fieldPair = (
    label1: string,
    control1: any,
    label2: string,
    control2: any,
  ) =>
    React.createElement(
      "div",
      { style: CFG_GRID_2COL_STYLE },
      React.createElement(
        "div",
        null,
        React.createElement("div", { style: CFG_LABEL_STYLE }, label1),
        control1,
      ),
      React.createElement(
        "div",
        null,
        React.createElement("div", { style: CFG_LABEL_STYLE }, label2),
        control2,
      ),
    );

  const { Divider } = getHost().antd;

  return React.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    React.createElement("div", { style: CFG_SECTION_TITLE_STYLE }, "基本设置"),
    field(
      "启用心跳",
      React.createElement(Switch, {
        checked: enabled,
        onChange: (v: boolean) => setEnabled(v),
      }),
      enabled ? "已启用，专家将定期自检" : "已停用",
    ),
    fieldPair(
      "检查频率",
      React.createElement(
        Space,
        null,
        React.createElement(InputNumber, {
          min: 1,
          value: everyNumber,
          onChange: (v: number | null) => setEveryNumber(v ?? 1),
          style: { width: "100%" },
        }),
        React.createElement(Select, {
          value: everyUnit,
          onChange: (v: "m" | "h") => setEveryUnit(v),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" },
          ],
        }),
      ),
      "心跳目标",
      React.createElement(Select, {
        value: target,
        onChange: (v: string) => setTarget(v),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" },
        ],
      }),
    ),
    field(
      "超时时间 (秒)",
      React.createElement(InputNumber, {
        min: 1,
        max: 3600,
        value: timeoutSeconds,
        onChange: (v: number | null) => setTimeoutSeconds(v ?? 300),
        style: { width: 200 },
      }),
    ),

    // ── Section: 活跃时段 ──
    React.createElement(Divider, { style: { margin: "8px 0 16px" } }),
    React.createElement("div", { style: CFG_SECTION_TITLE_STYLE }, "活跃时段"),
    field(
      "启用活跃时段限制",
      React.createElement(Switch, {
        checked: useActiveHours,
        onChange: (v: boolean) => setUseActiveHours(v),
      }),
      "仅在指定时段内触发心跳",
    ),
    useActiveHours
      ? fieldPair(
          "开始时间",
          React.createElement("input", {
            type: "time",
            value: activeHoursStart,
            onChange: (e: any) => setActiveHoursStart(e.target.value),
            style: {
              width: "100%",
              padding: "4px 11px",
              borderRadius: 6,
              border: "1px solid #d9d9d9",
              fontSize: 14,
            },
          }),
          "结束时间",
          React.createElement("input", {
            type: "time",
            value: activeHoursEnd,
            onChange: (e: any) => setActiveHoursEnd(e.target.value),
            style: {
              width: "100%",
              padding: "4px 11px",
              borderRadius: 6,
              border: "1px solid #d9d9d9",
              fontSize: 14,
            },
          }),
        )
      : null,

    // ── Action buttons ──
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 16,
          gap: 8,
        },
      },
      React.createElement(
        Button,
        {
          type: "primary",
          icon: SaveOutlined ? React.createElement(SaveOutlined) : undefined,
          loading: saving,
          onClick: handleSave,
          style: PRIMARY_BTN_STYLE,
        },
        "保存配置",
      ),
      React.createElement(
        Button,
        {
          icon: PlayCircleOutlined
            ? React.createElement(PlayCircleOutlined)
            : undefined,
          loading: running,
          onClick: handleRunNow,
        },
        "立即执行",
      ),
    ),
  );
}

/** Skills configuration tab — list, enable/disable, add from pool, delete. */
function SkillsConfigTab({
  agentId,
  onRefresh,
}: {
  agentId: string;
  onRefresh: () => void;
}) {
  const React = getHost().React;
  const { useState, useEffect, useCallback } = React;
  const {
    List,
    Tag,
    Switch,
    Button,
    Empty,
    Spin,
    Typography,
    message: antdMsg,
  } = getHost().antd;
  const { PlusOutlined, ReloadOutlined, DeleteOutlined } =
    getHost().antdIcons || {};
  const { Text, Paragraph } = Typography;

  const [skills, setSkills] = useState<SkillSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [poolSkills, setPoolSkills] = useState<PoolSkillSpec[]>([]);
  const [poolLoading, setPoolLoading] = useState(false);

  const loadSkills = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAgentSkills(agentId);
      setSkills(data);
    } catch (err: any) {
      antdMsg.error(err.message || "加载技能失败");
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const handleOpenPicker = async () => {
    setPickerOpen(true);
    setPoolLoading(true);
    try {
      const pool = await fetchPoolSkills(true);
      setPoolSkills(pool);
    } catch (err: any) {
      antdMsg.error(err.message || "加载技能池失败");
    } finally {
      setPoolLoading(false);
    }
  };

  const handleBatchInstall = async (skillNames: string[]) => {
    let ok = 0;
    let fail = 0;
    for (const name of skillNames) {
      try {
        await installSkillFromPool(agentId, name);
        ok++;
      } catch {
        fail++;
      }
    }
    if (ok > 0) {
      antdMsg.success(
        `成功添加 ${ok} 个技能${fail > 0 ? `，${fail} 个失败` : ""}`,
      );
      loadSkills();
      onRefresh();
    } else if (fail > 0) {
      antdMsg.error("添加技能失败");
    }
    setPickerOpen(false);
  };

  const handleToggle = async (skill: SkillSpec, enable: boolean) => {
    try {
      if (enable) {
        await enableSkillForAgent(agentId, skill.name);
      } else {
        await disableSkillForAgent(agentId, skill.name);
      }
      antdMsg.success(enable ? "已启用" : "已停用");
      loadSkills();
      onRefresh();
    } catch (err: any) {
      antdMsg.error(err.message || "操作失败");
    }
  };

  const handleDelete = async (skillName: string) => {
    try {
      await deleteSkillForAgent(agentId, skillName);
      antdMsg.success(`技能「${skillName}」已移除`);
      loadSkills();
      onRefresh();
    } catch (err: any) {
      antdMsg.error(err.message || "移除技能失败");
    }
  };

  if (loading) {
    return React.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      React.createElement(Spin, { size: "large" }),
    );
  }

  const enabledSkills = skills.filter((s) => s.enabled !== false);

  return React.createElement(
    "div",
    null,
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        },
      },
      React.createElement(
        Text,
        { strong: true },
        `技能列表 (${skills.length}，已启用 ${enabledSkills.length})`,
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        React.createElement(
          Button,
          {
            size: "small",
            icon: ReloadOutlined ? React.createElement(ReloadOutlined) : undefined,
            onClick: () => { clearApiCache(); loadSkills(); },
          },
          "刷新",
        ),
        React.createElement(
          Button,
          {
            type: "primary",
            size: "small",
            icon: PlusOutlined ? React.createElement(PlusOutlined) : undefined,
            onClick: handleOpenPicker,
            style: PRIMARY_BTN_STYLE,
          },
          "从技能池添加",
        ),
      ),
    ),
    skills.length === 0
      ? React.createElement(Empty, {
          description: "该专家暂无技能",
          image: Empty.PRESENTED_IMAGE_SIMPLE,
        })
      : React.createElement(List, {
          dataSource: skills,
          renderItem: (skill: SkillSpec) =>
            React.createElement(
              List.Item,
              {
                actions: [
                  React.createElement(Switch, {
                    key: "toggle",
                    size: "small",
                    checked: skill.enabled !== false,
                    onChange: (v: boolean) => handleToggle(skill, v),
                  }),
                  React.createElement(
                    Button,
                    {
                      key: "del",
                      type: "link",
                      size: "small",
                      danger: true,
                      icon: DeleteOutlined
                        ? React.createElement(DeleteOutlined)
                        : undefined,
                      onClick: () => handleDelete(skill.name),
                    },
                    "移除",
                  ),
                ],
              },
              React.createElement(
                "div",
                { style: { width: "100%" } },
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    },
                  },
                  skill.emoji
                    ? React.createElement(
                        "span",
                        { style: { fontSize: 16 } },
                        skill.emoji,
                      )
                    : null,
                  React.createElement(Text, { strong: true }, skill.name),
                  skill.version_text
                    ? React.createElement(
                        Tag,
                        { style: { fontSize: 10 } },
                        `v${skill.version_text}`,
                      )
                    : null,
                ),
                skill.description
                  ? React.createElement(
                      Paragraph,
                      {
                        type: "secondary",
                        style: { fontSize: 12, margin: 0 },
                        ellipsis: { rows: 2 },
                      },
                      skill.description,
                    )
                  : null,
              ),
            ),
        }),
    React.createElement(SkillPickerModal, {
      open: pickerOpen,
      onClose: () => setPickerOpen(false),
      poolSkills,
      installedSkillNames: skills.map((s) => s.name),
      loading: poolLoading,
      onInstall: handleBatchInstall,
    }),
  );
}

/** MCP configuration tab — list, toggle, delete, create via JSON import. */
function MCPConfigTab({
  agentId,
  onRefresh,
  isActive,
}: {
  agentId: string;
  onRefresh: () => void;
  isActive: boolean;
}) {
  const React = getHost().React;
  const { useState, useEffect, useCallback } = React;
  const {
    List,
    Tag,
    Button,
    Empty,
    Spin,
    Modal,
    Input,
    Typography,
    message: antdMsg,
  } = getHost().antd;
  const { PlusOutlined, ReloadOutlined, DeleteOutlined } =
    getHost().antdIcons || {};
  const { Text, Paragraph } = Typography;
  const { TextArea } = Input;

  const [mcps, setMcps] = useState<MCPClientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`);
  const [creating, setCreating] = useState(false);

  const loadMCPs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAgentMCPClients(agentId);
      setMcps(data);
    } catch (err: any) {
      antdMsg.error(err.message || "加载 MCP 失败");
      setMcps([]);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    loadMCPs();
  }, [loadMCPs]);

  // Refresh MCP data when this tab becomes active so that
  // changes made externally (e.g. in the Agent MCP page) are reflected.
  useEffect(() => {
    if (isActive) {
      loadMCPs();
    }
  }, [isActive, loadMCPs]);

  const handleToggle = async (key: string) => {
    try {
      await toggleMCPForAgent(agentId, key);
      antdMsg.success("已切换 MCP 状态");
      loadMCPs();
      onRefresh();
    } catch (err: any) {
      antdMsg.error(err.message || "切换失败");
    }
  };

  const handleDelete = async (key: string) => {
    try {
      await deleteMCPForAgent(agentId, key);
      antdMsg.success(`MCP「${key}」已移除`);
      loadMCPs();
      onRefresh();
    } catch (err: any) {
      antdMsg.error(err.message || "移除 MCP 失败");
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const parsed = JSON.parse(jsonInput);
      const servers = parsed.mcpServers || parsed;
      const entries = Object.entries(servers);
      if (entries.length === 0) {
        antdMsg.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [clientKey, cfg] of entries) {
        const clientCfg = cfg as Record<string, unknown>;
        const transport = clientCfg.url
          ? "streamable_http"
          : "stdio";
        await createMCPForAgent(agentId, {
          client_key: clientKey,
          client: {
            name: (clientCfg.name as string) || clientKey,
            description: (clientCfg.description as string) || "",
            enabled: true,
            transport,
            url: (clientCfg.url as string) || "",
            command: (clientCfg.command as string) || "",
            args: clientCfg.args || [],
            env: clientCfg.env || {},
            cwd: (clientCfg.cwd as string) || "",
            headers: clientCfg.headers || {},
          },
        });
      }
      antdMsg.success("MCP 客户端已创建");
      setCreateOpen(false);
      loadMCPs();
      onRefresh();
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        antdMsg.error("JSON 格式错误：" + err.message);
      } else {
        antdMsg.error(err.message || "创建 MCP 失败");
      }
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return React.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      React.createElement(Spin, { size: "large" }),
    );
  }

  return React.createElement(
    "div",
    null,
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        },
      },
      React.createElement(Text, { strong: true }, `MCP 客户端 (${mcps.length})`),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        React.createElement(
          Button,
          {
            size: "small",
            icon: ReloadOutlined ? React.createElement(ReloadOutlined) : undefined,
            onClick: () => { clearApiCache(); loadMCPs(); },
          },
          "刷新",
        ),
        React.createElement(
          Button,
          {
            type: "primary",
            size: "small",
            icon: PlusOutlined ? React.createElement(PlusOutlined) : undefined,
            onClick: () => setCreateOpen(true),
            style: PRIMARY_BTN_STYLE,
          },
          "添加 MCP",
        ),
      ),
    ),
    mcps.length === 0
      ? React.createElement(Empty, {
          description: "该专家暂无 MCP 客户端",
          image: Empty.PRESENTED_IMAGE_SIMPLE,
        })
      : React.createElement(List, {
          dataSource: mcps,
          renderItem: (mcp: MCPClientInfo) =>
            React.createElement(
              List.Item,
              {
                actions: [
                  React.createElement(
                    Button,
                    {
                      key: "toggle",
                      size: "small",
                      onClick: () => handleToggle(mcp.key),
                    },
                    mcp.enabled ? "停用" : "启用",
                  ),
                  React.createElement(
                    Button,
                    {
                      key: "del",
                      type: "link",
                      size: "small",
                      danger: true,
                      icon: DeleteOutlined
                        ? React.createElement(DeleteOutlined)
                        : undefined,
                      onClick: () => handleDelete(mcp.key),
                    },
                    "移除",
                  ),
                ],
              },
              React.createElement(
                "div",
                { style: { width: "100%" } },
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    },
                  },
                  React.createElement("span", { style: { fontSize: 14 } }, "🔌"),
                  React.createElement(Text, { strong: true }, mcp.name || mcp.key),
                  React.createElement(
                    Tag,
                    {
                      color: mcp.enabled ? "green" : "default",
                      style: { fontSize: 10 },
                    },
                    mcp.enabled ? "启用" : "停用",
                  ),
                  React.createElement(
                    Tag,
                    { color: "purple", style: { fontSize: 10 } },
                    mcp.transport,
                  ),
                ),
                mcp.description
                  ? React.createElement(
                      Paragraph,
                      {
                        type: "secondary",
                        style: { fontSize: 12, margin: 0 },
                        ellipsis: { rows: 2 },
                      },
                      mcp.description,
                    )
                  : null,
                mcp.tools && mcp.tools.length > 0
                  ? React.createElement(
                      "div",
                      { style: { marginTop: 4, fontSize: 11, color: "#8c8c8c" } },
                      `提供 ${mcp.tools.length} 个工具`,
                    )
                  : null,
              ),
            ),
        }),
    // Create MCP modal
    React.createElement(
      Modal,
      {
        open: createOpen,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => setCreateOpen(false),
        onOk: handleCreate,
        confirmLoading: creating,
        okText: "创建",
        width: 560,
      },
      React.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区：",
      ),
      React.createElement(TextArea, {
        value: jsonInput,
        onChange: (e: any) => setJsonInput(e.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 },
      }),
    ),
  );
}

/** Running configuration tab — fetches/saves /workspace/running-config. */
function RunningConfigTab({ agentId }: { agentId: string }) {
  const React = getHost().React;
  const { useState, useEffect, useCallback, useRef } = React;
  const {
    Card,
    InputNumber,
    Input,
    Select,
    Switch,
    Button,
    Spin,
    Space,
    Typography,
    Divider,
    message: antdMsg,
  } = getHost().antd;
  const { SaveOutlined } = getHost().antdIcons || {};
  const { Text } = Typography;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const originalRef = useRef<AgentsRunningConfig | null>(null);

  // ── Basic settings ──
  const [shellTimeout, setShellTimeout] = useState(60);
  const [shellExecutable, setShellExecutable] = useState("");
  const [autoTitleEnabled, setAutoTitleEnabled] = useState(true);
  const [autoTitleTimeout, setAutoTitleTimeout] = useState(30);
  const [language, setLanguage] = useState("zh");
  const [timezone, setTimezone] = useState("UTC");

  // ── Iteration & Loop ──
  const [iterEnabled, setIterEnabled] = useState(true);
  const [maxIters, setMaxIters] = useState(100);
  const [doomLoopEnabled, setDoomLoopEnabled] = useState(true);
  const [doomWindowSize, setDoomWindowSize] = useState(3);
  const [doomSimilarity, setDoomSimilarity] = useState(1.0);

  // ── LLM Retry ──
  const [llmRetryEnabled, setLlmRetryEnabled] = useState(true);
  const [llmMaxRetries, setLlmMaxRetries] = useState(3);
  const [llmBackoffBase, setLlmBackoffBase] = useState(2);
  const [llmBackoffCap, setLlmBackoffCap] = useState(60);

  // ── LLM Rate Limiter ──
  const [llmMaxConcurrent, setLlmMaxConcurrent] = useState(1);
  const [llmMaxQpm, setLlmMaxQpm] = useState(0);
  const [llmRateLimitPause, setLlmRateLimitPause] = useState(1);
  const [llmRateLimitJitter, setLlmRateLimitJitter] = useState(0);
  const [llmAcquireTimeout, setLlmAcquireTimeout] = useState(30);

  // ── Context & Memory ──
  const [historyMaxLength, setHistoryMaxLength] = useState(50);
  const [contextBackend, setContextBackend] = useState("light");
  const [contextStrategy, setContextStrategy] = useState("scroll");
  const [memoryBackend, setMemoryBackend] = useState("remelight");

  // ── Approval ──
  const [approvalLevel, setApprovalLevel] = useState("AUTO");

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const [config, lang, tz] = await Promise.all([
        fetchRunningConfig(agentId),
        fetchAgentLanguage(agentId).catch(() => "zh"),
        fetchUserTimezone().catch(() => "UTC"),
      ]);
      originalRef.current = config;
      // Basic
      setShellTimeout(config.shell_command_timeout ?? 60);
      setShellExecutable(config.shell_command_executable ?? "");
      const atc = config.auto_title_config ?? { enabled: true, timeout_seconds: 30 };
      setAutoTitleEnabled(atc.enabled ?? true);
      setAutoTitleTimeout(atc.timeout_seconds ?? 30);
      setLanguage(lang);
      setTimezone(tz);
      // Iteration & Loop
      const loop = config.loop ?? {};
      setIterEnabled(loop.iteration?.enabled ?? true);
      setMaxIters(loop.iteration?.max_iterations ?? config.max_iters ?? 100);
      setDoomLoopEnabled(loop.doom_loop?.enabled ?? true);
      setDoomWindowSize(loop.doom_loop?.window_size ?? 3);
      setDoomSimilarity(loop.doom_loop?.similarity_threshold ?? 1.0);
      // LLM Retry
      setLlmRetryEnabled(config.llm_retry_enabled ?? true);
      setLlmMaxRetries(config.llm_max_retries ?? 3);
      setLlmBackoffBase(config.llm_backoff_base ?? 2);
      setLlmBackoffCap(config.llm_backoff_cap ?? 60);
      // LLM Rate Limiter
      setLlmMaxConcurrent(config.llm_max_concurrent ?? 1);
      setLlmMaxQpm(config.llm_max_qpm ?? 0);
      setLlmRateLimitPause(config.llm_rate_limit_pause ?? 1);
      setLlmRateLimitJitter(config.llm_rate_limit_jitter ?? 0);
      setLlmAcquireTimeout(config.llm_acquire_timeout ?? 30);
      // Context & Memory
      setHistoryMaxLength(config.history_max_length ?? 50);
      setContextBackend(config.context_manager_backend ?? "light");
      setContextStrategy(config.light_context_config?.strategy ?? "scroll");
      setMemoryBackend(config.memory_manager_backend ?? "remelight");
      // Approval
      setApprovalLevel(config.approval_level ?? "AUTO");
    } catch (err: any) {
      antdMsg.error(err.message || "加载运行配置失败");
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    const original = originalRef.current;
    if (!original) return;
    setSaving(true);
    try {
      const configToSave: AgentsRunningConfig = {
        ...original,
        max_iters: maxIters,
        loop: {
          ...(original.loop ?? {}),
          iteration: { enabled: iterEnabled, max_iterations: maxIters },
          doom_loop: {
            enabled: doomLoopEnabled,
            window_size: doomWindowSize,
            similarity_threshold: doomSimilarity,
            stages: original.loop?.doom_loop?.stages ?? [],
          },
        },
        shell_command_timeout: shellTimeout,
        shell_command_executable: shellExecutable,
        auto_title_config: {
          enabled: autoTitleEnabled,
          timeout_seconds: autoTitleTimeout,
        },
        llm_retry_enabled: llmRetryEnabled,
        llm_max_retries: llmMaxRetries,
        llm_backoff_base: llmBackoffBase,
        llm_backoff_cap: llmBackoffCap,
        llm_max_concurrent: llmMaxConcurrent,
        llm_max_qpm: llmMaxQpm,
        llm_rate_limit_pause: llmRateLimitPause,
        llm_rate_limit_jitter: llmRateLimitJitter,
        llm_acquire_timeout: llmAcquireTimeout,
        history_max_length: historyMaxLength,
        context_manager_backend: contextBackend,
        light_context_config: {
          ...(original.light_context_config ?? {}),
          strategy: contextStrategy,
        },
        memory_manager_backend: memoryBackend,
        approval_level: approvalLevel,
      };
      await updateRunningConfig(agentId, configToSave);
      originalRef.current = configToSave;

      // Also save language and timezone (separate endpoints)
      if (language) await updateAgentLanguage(agentId, language).catch(() => {});
      if (timezone) await updateUserTimezone(timezone).catch(() => {});

      antdMsg.success("运行配置已保存");
    } catch (err: any) {
      antdMsg.error(err.message || "保存运行配置失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return React.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      React.createElement(Spin, { size: "large" }),
    );
  }

  // Helper: a labelled form field row
  const field = (
    label: string,
    control: any,
    hint?: string,
  ) =>
    React.createElement(
      "div",
      { style: CFG_ROW_STYLE },
      React.createElement("div", { style: CFG_LABEL_STYLE }, label),
      control,
      hint
        ? React.createElement(
            Text,
            { type: "secondary", style: CFG_HINT_STYLE },
            hint,
          )
        : null,
    );

  // Helper: a 2-column row with two labelled fields
  const fieldPair = (
    label1: string,
    control1: any,
    label2: string,
    control2: any,
  ) =>
    React.createElement(
      "div",
      { style: CFG_GRID_2COL_STYLE },
      React.createElement(
        "div",
        null,
        React.createElement("div", { style: CFG_LABEL_STYLE }, label1),
        control1,
      ),
      React.createElement(
        "div",
        null,
        React.createElement("div", { style: CFG_LABEL_STYLE }, label2),
        control2,
      ),
    );

  return React.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    React.createElement(
      "div",
      { style: CFG_SECTION_TITLE_STYLE },
      "基础设置",
    ),
    fieldPair(
      "Shell 命令超时 (秒)",
      React.createElement(InputNumber, {
        min: 1,
        value: shellTimeout,
        onChange: (v: number | null) => setShellTimeout(v ?? 60),
        style: { width: "100%" },
      }),
      "Shell 可执行文件",
      React.createElement(Input, {
        value: shellExecutable,
        onChange: (e: any) => setShellExecutable(e.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" },
      }),
    ),
    fieldPair(
      "语言",
      React.createElement(Select, {
        value: language,
        onChange: (v: string) => setLanguage(v),
        style: { width: "100%" },
        options: [
          { value: "zh", label: "中文" },
          { value: "en", label: "English" },
          { value: "id", label: "Bahasa Indonesia" },
          { value: "ru", label: "Русский" },
        ],
      }),
      "时区",
      React.createElement(Select, {
        value: timezone,
        onChange: (v: string) => setTimezone(v),
        style: { width: "100%" },
        showSearch: true,
        filterOption: (input: string, option: any) =>
          (option?.label?.toString() || "")
            .toLowerCase()
            .includes(input.toLowerCase()),
        options: [
          "UTC",
          "Asia/Shanghai",
          "Asia/Tokyo",
          "Asia/Singapore",
          "Asia/Kolkata",
          "Europe/London",
          "Europe/Paris",
          "America/New_York",
          "America/Los_Angeles",
          "America/Chicago",
          "Australia/Sydney",
        ].map((tz) => ({ value: tz, label: tz })),
      }),
    ),
    fieldPair(
      "自动生成会话标题",
      React.createElement(Space, null, React.createElement(Switch, {
        checked: autoTitleEnabled,
        onChange: (v: boolean) => setAutoTitleEnabled(v),
      })),
      "标题生成超时 (秒)",
      React.createElement(InputNumber, {
        min: 5,
        value: autoTitleTimeout,
        onChange: (v: number | null) => setAutoTitleTimeout(v ?? 30),
        style: { width: "100%" },
        disabled: !autoTitleEnabled,
      }),
    ),

    // ── Section: 审批级别 ──
    React.createElement(Divider, { style: { margin: "8px 0 16px" } }),
    React.createElement("div", { style: CFG_SECTION_TITLE_STYLE }, "审批级别"),
    field(
      "工具执行审批",
      React.createElement(Select, {
        value: approvalLevel,
        onChange: (v: string) => setApprovalLevel(v),
        style: { width: "100%" },
        options: [
          { value: "STRICT", label: "严格 (STRICT) — 每次工具调用需审批" },
          { value: "SMART", label: "智能 (SMART) — 高风险操作需审批" },
          { value: "AUTO", label: "自动 (AUTO) — 自动执行" },
          { value: "OFF", label: "关闭 (OFF) — 无限制" },
        ],
      }),
    ),

    // ── Section: 迭代与循环 ──
    React.createElement(Divider, { style: { margin: "8px 0 16px" } }),
    React.createElement("div", { style: CFG_SECTION_TITLE_STYLE }, "迭代与循环"),
    field(
      "启用迭代限制",
      React.createElement(Switch, {
        checked: iterEnabled,
        onChange: (v: boolean) => setIterEnabled(v),
      }),
      "停止 Agent 前的最大循环轮次",
    ),
    iterEnabled
      ? field(
          "最大迭代次数",
          React.createElement(InputNumber, {
            min: 1,
            max: 500,
            value: maxIters,
            onChange: (v: number | null) => setMaxIters(v ?? 100),
            style: { width: "100%" },
          }),
        )
      : null,
    field(
      "启用重复循环保护",
      React.createElement(Switch, {
        checked: doomLoopEnabled,
        onChange: (v: boolean) => setDoomLoopEnabled(v),
      }),
      "检测并阻止重复操作循环",
    ),
    doomLoopEnabled
      ? fieldPair(
          "检测窗口大小",
          React.createElement(InputNumber, {
            min: 2,
            max: 20,
            value: doomWindowSize,
            onChange: (v: number | null) => setDoomWindowSize(v ?? 3),
            style: { width: "100%" },
          }),
          "相似度阈值",
          React.createElement(InputNumber, {
            min: 0,
            max: 1,
            step: 0.05,
            value: doomSimilarity,
            onChange: (v: number | null) => setDoomSimilarity(v ?? 1.0),
            style: { width: "100%" },
          }),
        )
      : null,

    // ── Section: LLM 重试 ──
    React.createElement(Divider, { style: { margin: "8px 0 16px" } }),
    React.createElement("div", { style: CFG_SECTION_TITLE_STYLE }, "LLM 重试"),
    field(
      "启用 LLM 重试",
      React.createElement(Switch, {
        checked: llmRetryEnabled,
        onChange: (v: boolean) => setLlmRetryEnabled(v),
      }),
    ),
    fieldPair(
      "最大重试次数",
      React.createElement(InputNumber, {
        min: 1,
        value: llmMaxRetries,
        onChange: (v: number | null) => setLlmMaxRetries(v ?? 3),
        style: { width: "100%" },
        disabled: !llmRetryEnabled,
      }),
      "退避基数 (秒)",
      React.createElement(InputNumber, {
        min: 0.1,
        step: 0.1,
        value: llmBackoffBase,
        onChange: (v: number | null) => setLlmBackoffBase(v ?? 2),
        style: { width: "100%" },
        disabled: !llmRetryEnabled,
      }),
    ),
    field(
      "退避上限 (秒)",
      React.createElement(InputNumber, {
        min: 0.5,
        step: 0.5,
        value: llmBackoffCap,
        onChange: (v: number | null) => setLlmBackoffCap(v ?? 60),
        style: { width: 200 },
        disabled: !llmRetryEnabled,
      }),
    ),

    // ── Section: LLM 限流 ──
    React.createElement(Divider, { style: { margin: "8px 0 16px" } }),
    React.createElement("div", { style: CFG_SECTION_TITLE_STYLE }, "LLM 限流"),
    fieldPair(
      "最大并发数",
      React.createElement(InputNumber, {
        min: 1,
        value: llmMaxConcurrent,
        onChange: (v: number | null) => setLlmMaxConcurrent(v ?? 1),
        style: { width: "100%" },
      }),
      "最大 QPM (0=不限)",
      React.createElement(InputNumber, {
        min: 0,
        step: 10,
        value: llmMaxQpm,
        onChange: (v: number | null) => setLlmMaxQpm(v ?? 0),
        style: { width: "100%" },
      }),
    ),
    fieldPair(
      "限流暂停时间 (秒)",
      React.createElement(InputNumber, {
        min: 1.0,
        step: 0.5,
        value: llmRateLimitPause,
        onChange: (v: number | null) => setLlmRateLimitPause(v ?? 1),
        style: { width: "100%" },
      }),
      "限流抖动 (秒)",
      React.createElement(InputNumber, {
        min: 0.0,
        step: 0.5,
        value: llmRateLimitJitter,
        onChange: (v: number | null) => setLlmRateLimitJitter(v ?? 0),
        style: { width: "100%" },
      }),
    ),
    field(
      "获取超时 (秒)",
      React.createElement(InputNumber, {
        min: 10.0,
        step: 10,
        value: llmAcquireTimeout,
        onChange: (v: number | null) => setLlmAcquireTimeout(v ?? 30),
        style: { width: 200 },
      }),
      "应大于 限流暂停 + 抖动",
    ),

    // ── Section: 上下文与记忆 ──
    React.createElement(Divider, { style: { margin: "8px 0 16px" } }),
    React.createElement("div", { style: CFG_SECTION_TITLE_STYLE }, "上下文与记忆"),
    fieldPair(
      "上下文管理后端",
      React.createElement(Select, {
        value: contextBackend,
        onChange: (v: string) => setContextBackend(v),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }],
      }),
      "上下文策略",
      React.createElement(Select, {
        value: contextStrategy,
        onChange: (v: string) => setContextStrategy(v),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" },
        ],
      }),
    ),
    fieldPair(
      "记忆管理后端",
      React.createElement(Select, {
        value: memoryBackend,
        onChange: (v: string) => setMemoryBackend(v),
        style: { width: "100%" },
        options: [
          { value: "remelight", label: "remelight" },
          { value: "adbpg", label: "adbpg" },
          { value: "none", label: "none (禁用)" },
        ],
      }),
      "历史消息最大长度",
      React.createElement(InputNumber, {
        min: 1,
        value: historyMaxLength,
        onChange: (v: number | null) => setHistoryMaxLength(v ?? 50),
        style: { width: "100%" },
      }),
    ),

    // ── Save button ──
    React.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      React.createElement(
        Button,
        {
          type: "primary",
          icon: SaveOutlined ? React.createElement(SaveOutlined) : undefined,
          loading: saving,
          onClick: handleSave,
          style: PRIMARY_BTN_STYLE,
        },
        "保存运行配置",
      ),
    ),
  );
}

/**
 * Expert configuration modal with 5 tabs: Heartbeat, Files, Skills, MCP,
 * Running Config. All API calls use X-Agent-Id to target the expert's
 * workspace. The Files tab reuses the existing KnowledgeBaseTab component.
 */
function ExpertConfigModal({
  expert,
  open,
  onClose,
  onRefresh,
}: {
  expert: ExpertData | null;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const React = getHost().React;
  const { useState, useEffect, useCallback } = React;
  const { Modal, Tabs, Spin, Typography } = getHost().antd;
  const { SettingOutlined } = getHost().antdIcons || {};
  const { Text } = Typography;

  // System prompt files for the Files tab (KnowledgeBaseTab needs them as prop)
  const [promptFiles, setPromptFiles] = useState<string[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("heartbeat");

  const loadPromptFiles = useCallback(async () => {
    if (!expert) return;
    setFilesLoading(true);
    try {
      const files = await fetchSystemPromptFiles(expert.agent.id);
      setPromptFiles(files);
    } catch {
      setPromptFiles([]);
    } finally {
      setFilesLoading(false);
    }
  }, [expert]);

  useEffect(() => {
    if (open && expert) {
      loadPromptFiles();
    }
  }, [open, expert, loadPromptFiles]);

  if (!expert) return null;

  const { agent } = expert;

  const handleFilesRefresh = () => {
    loadPromptFiles();
    onRefresh();
  };

  const tabItems = [
    {
      key: "heartbeat",
      label: "心跳",
      children: React.createElement(HeartbeatConfigTab, {
        agentId: agent.id,
      }),
    },
    {
      key: "files",
      label: "文件",
      children: filesLoading
        ? React.createElement(
            "div",
            { style: { textAlign: "center", padding: 40 } },
            React.createElement(Spin, { size: "large" }),
          )
        : React.createElement(KnowledgeBaseTab, {
            agentId: agent.id,
            systemPromptFiles: promptFiles,
            onRefresh: handleFilesRefresh,
          }),
    },
    {
      key: "skills",
      label: `技能 (${expert.skills.filter((s) => s.enabled !== false).length})`,
      children: React.createElement(SkillsConfigTab, {
        agentId: agent.id,
        onRefresh,
      }),
    },
    {
      key: "mcp",
      label: `MCP (${expert.mcps.length})`,
      children: React.createElement(MCPConfigTab, {
        agentId: agent.id,
        onRefresh,
        isActive: activeTab === "mcp",
      }),
    },
    {
      key: "running",
      label: "运行配置",
      children: React.createElement(RunningConfigTab, {
        agentId: agent.id,
      }),
    },
  ];

  return React.createElement(
    Modal,
    {
      open,
      title: React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        SettingOutlined
          ? React.createElement(SettingOutlined, { style: { fontSize: 18 } })
          : null,
        React.createElement("span", null, `配置 - ${agent.name}`),
        React.createElement(
          Text,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          agent.id,
        ),
      ),
      onCancel: onClose,
      footer: null,
      width: 800,
      centered: true,
      styles: {
        body: {
          minHeight: 400,
          maxHeight: "70vh",
          overflowY: "auto",
        },
      },
    },
    React.createElement(Tabs, {
      items: tabItems,
      activeKey: activeTab,
      onChange: (k: string) => setActiveTab(k),
      size: "small",
      tabBarStyle: { marginBottom: 16 },
    }),
  );
}

// ─── Expert Center Page ───────────────────────────────────────────────────────

function ExpertCard({
  expert,
  onClick,
  onSummon,
  onConfigure,
}: {
  expert: ExpertData;
  onClick: () => void;
  onSummon?: () => void;
  onConfigure?: () => void;
}) {
  const React = getHost().React;
  const { Card, Tag, Badge, Typography, Spin, Button, Tooltip } = getHost().antd;
  const { Text } = Typography;
  const { ThunderboltOutlined, SettingOutlined } = getHost().antdIcons || {};

  const { agent, skills, mcps, loading } = expert;
  const isEnabled = agent.enabled;
  const skillNames = skills
    .filter((s) => s.enabled !== false)
    .map((s) => s.name);
  const mcpNames = mcps.map((m) => m.name || m.key);
  const modelText = agent.active_model
    ? `${agent.active_model.provider_id}/${agent.active_model.model}`
    : null;

  return React.createElement(
    Card,
    {
      hoverable: true,
      onClick,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: isEnabled ? undefined : "#d9d9d9",
        opacity: isEnabled ? 1 : 0.7,
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      },
      bodyStyle: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flex: 1,
      },
    },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        },
      },
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        React.createElement(ExpertAvatar, { name: agent.name, size: 36 }),
        React.createElement(
          "div",
          null,
          React.createElement(
            Text,
            { strong: true, style: { fontSize: 15 } },
            agent.name,
          ),
          React.createElement(
            "div",
            {
              style: {
                fontSize: 11,
                color: "#bfbfbf",
                fontFamily: "monospace",
              },
            },
            agent.id,
          ),
        ),
      ),
      React.createElement(Badge, {
        status: isEnabled ? "success" : "default",
        text: isEnabled ? "启用" : "停用",
      }),
    ),
    // Description (rendered as markdown)
    agent.description
      ? React.createElement(
          "div",
          {
            style: {
              fontSize: 12,
              color: "#595959",
              marginBottom: 10,
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: 54,
              flex: "1 0 auto",
            },
          },
          renderMarkdown(agent.description, React),
        )
      : React.createElement(
          "div",
          { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
          "暂无描述",
        ),
    // Model info
    modelText
      ? React.createElement(
          "div",
          { style: { marginBottom: 8 } },
          React.createElement(
            Tag,
            { color: "geekblue", style: { fontSize: 11 } },
            `🤖 ${modelText}`,
          ),
        )
      : null,
    // Skills
    loading
      ? React.createElement(Spin, { size: "small" })
      : React.createElement(
          "div",
          { style: { marginBottom: 6 } },
          React.createElement(
            "div",
            { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
            `技能 (${skillNames.length})`,
          ),
          React.createElement(TagList, {
            items: skillNames,
            max: 4,
            color: "cyan",
            emptyText: "未配置技能",
          }),
        ),
    // MCP
    !loading && mcpNames.length > 0
      ? React.createElement(
          "div",
          { style: { marginTop: "auto" } },
          React.createElement(
            "div",
            { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
            `MCP (${mcpNames.length})`,
          ),
          React.createElement(TagList, {
            items: mcpNames,
            max: 3,
            color: "purple",
          }),
        )
      : null,
    // Bottom bar: gear icon (left) + summon button (right)
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 10,
          paddingTop: 8,
          borderTop: "1px solid #f0f0f0",
        },
      },
      // Gear icon (bottom-left) — opens configuration modal
      React.createElement(
        Tooltip,
        { title: "配置专家", placement: "top" },
        React.createElement(
          Button,
          {
            type: "text",
            size: "small",
            icon: SettingOutlined
              ? React.createElement(SettingOutlined, {
                  style: { fontSize: 16, color: "#8c8c8c" },
                })
              : undefined,
            onClick: (e: any) => {
              e.stopPropagation();
              if (onConfigure) onConfigure();
            },
          },
        ),
      ),
      // Summon button (bottom-right)
      React.createElement(
        Button,
        {
          type: "primary",
          size: "small",
          icon: ThunderboltOutlined
            ? React.createElement(ThunderboltOutlined)
            : undefined,
          disabled: !isEnabled,
          onClick: (e: any) => {
            e.stopPropagation();
            if (onSummon) onSummon();
          },
          style: PRIMARY_BTN_STYLE,
        },
        "召唤专家",
      ),
    ),
  );
}

function ExpertDrawer({
  expert,
  open,
  onClose,
  onRefresh,
}: {
  expert: ExpertData | null;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const React = getHost().React;
  const {
    Drawer,
    Descriptions,
    Tag,
    Typography,
    Space,
    Button,
    Empty,
    Tabs,
    List,
    Spin,
    Modal,
    message: antdMsg,
  } = getHost().antd;
  const { Text, Paragraph } = Typography;
  const {
    EditOutlined,
    ThunderboltOutlined,
    FileTextOutlined,
    ToolOutlined,
    PlusOutlined,
  } = getHost().antdIcons || {};

  const [skillPickerOpen2, setSkillPickerOpen2] = React.useState(false);
  const [poolSkillsList2, setPoolSkillsList2] = React.useState<PoolSkillSpec[]>(
    [],
  );
  const [poolLoading2, setPoolLoading2] = React.useState(false);

  if (!expert) return null;

  const { agent, config, skills, mcps, loading } = expert;
  const enabledSkills = skills.filter((s) => s.enabled !== false);

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const basicInfoTab = React.createElement(
    "div",
    null,
    React.createElement(
      Descriptions,
      { column: 1, bordered: true, size: "small" },
      React.createElement(Descriptions.Item, { label: "专家名称" }, agent.name),
      React.createElement(
        Descriptions.Item,
        { label: "专家 ID" },
        React.createElement("code", { style: { fontSize: 12 } }, agent.id),
      ),
      React.createElement(
        Descriptions.Item,
        { label: "状态" },
        React.createElement(
          Tag,
          { color: agent.enabled ? "green" : "default" },
          agent.enabled ? "启用" : "停用",
        ),
      ),
      React.createElement(
        Descriptions.Item,
        { label: "功能简介" },
        agent.description
          ? renderMarkdown(agent.description, React)
          : "暂无描述",
      ),
      React.createElement(
        Descriptions.Item,
        { label: "使用模型" },
        agent.active_model
          ? `${agent.active_model.provider_id} / ${agent.active_model.model}`
          : "使用全局默认模型",
      ),
      config?.workspace_dir
        ? React.createElement(
            Descriptions.Item,
            { label: "工作区路径" },
            React.createElement(
              "code",
              { style: { fontSize: 11 } },
              config.workspace_dir,
            ),
          )
        : null,
      config?.approval_level
        ? React.createElement(
            Descriptions.Item,
            { label: "审批级别" },
            config.approval_level,
          )
        : null,
    ),
    // System prompt files
    config?.system_prompt_files && config.system_prompt_files.length > 0
      ? React.createElement(
          "div",
          { style: { marginTop: 16 } },
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
              },
            },
            FileTextOutlined
              ? React.createElement(FileTextOutlined, {
                  style: { fontSize: 14, color: "#1677ff" },
                })
              : null,
            React.createElement(Text, { strong: true }, "系统提示词文件"),
          ),
          React.createElement(
            Space,
            { wrap: true },
            ...config.system_prompt_files.map((file, i) =>
              React.createElement(
                Tag,
                {
                  key: i,
                  icon: FileTextOutlined
                    ? React.createElement(FileTextOutlined)
                    : undefined,
                  style: { fontSize: 12 },
                },
                file,
              ),
            ),
          ),
        )
      : null,
  );

  const handleOpenSkillPicker = async () => {
    setSkillPickerOpen2(true);
    setPoolLoading2(true);
    try {
      const pool = await fetchPoolSkills(true);
      setPoolSkillsList2(pool);
    } catch (err: any) {
      antdMsg.error(err.message || "加载技能池失败");
    } finally {
      setPoolLoading2(false);
    }
  };

  const handleBatchInstallSkills = async (skillNames: string[]) => {
    let successCount = 0;
    let failCount = 0;
    for (const skillName of skillNames) {
      try {
        await installSkillFromPool(agent.id, skillName);
        successCount++;
      } catch {
        failCount++;
      }
    }
    if (successCount > 0) {
      antdMsg.success(
        `成功添加 ${successCount} 个技能${failCount > 0 ? `，${failCount} 个失败` : ""}`,
      );
      onRefresh();
    } else if (failCount > 0) {
      antdMsg.error("添加技能失败");
    }
    setSkillPickerOpen2(false);
  };

  const handleRemoveSkill = async (skillName: string) => {
    try {
      await deleteSkillForAgent(agent.id, skillName);
      antdMsg.success(`技能「${skillName}」已移除`);
      onRefresh();
    } catch (err: any) {
      antdMsg.error(err.message || "移除技能失败");
    }
  };

  const handleRemoveMCP = async (clientKey: string) => {
    try {
      await deleteMCPForAgent(agent.id, clientKey);
      antdMsg.success(`MCP「${clientKey}」已移除`);
      onRefresh();
    } catch (err: any) {
      antdMsg.error(err.message || "移除 MCP 失败");
    }
  };

  const skillsTab = loading
    ? React.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        React.createElement(Spin, { size: "large" }),
      )
    : React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            },
          },
          React.createElement(
            Text,
            { strong: true },
            `已启用技能 (${enabledSkills.length})`,
          ),
          React.createElement(
            Button,
            {
              type: "primary",
              size: "small",
              icon: PlusOutlined
                ? React.createElement(PlusOutlined)
                : undefined,
              onClick: handleOpenSkillPicker,
            },
            "从技能池添加",
          ),
        ),
        enabledSkills.length === 0
          ? React.createElement(Empty, {
              description: "该专家暂无已启用的技能",
              image: Empty.PRESENTED_IMAGE_SIMPLE,
            })
          : React.createElement(List, {
              dataSource: enabledSkills,
              renderItem: (skill: SkillSpec) =>
                React.createElement(
                  List.Item,
                  {
                    actions: [
                      React.createElement(
                        Button,
                        {
                          type: "link",
                          size: "small",
                          danger: true,
                          onClick: () => handleRemoveSkill(skill.name),
                        },
                        "移除",
                      ),
                    ],
                  },
                  React.createElement(
                    "div",
                    { style: { width: "100%" } },
                    React.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                        },
                      },
                      skill.emoji
                        ? React.createElement(
                            "span",
                            { style: { fontSize: 16 } },
                            skill.emoji,
                          )
                        : null,
                      React.createElement(Text, { strong: true }, skill.name),
                      skill.version_text
                        ? React.createElement(
                            Tag,
                            { style: { fontSize: 10 } },
                            `v${skill.version_text}`,
                          )
                        : null,
                    ),
                    skill.description
                      ? React.createElement(
                          Paragraph,
                          {
                            type: "secondary",
                            style: { fontSize: 12, margin: 0 },
                            ellipsis: { rows: 2 },
                          },
                          skill.description,
                        )
                      : null,
                    skill.tags && skill.tags.length > 0
                      ? React.createElement(
                          "div",
                          { style: { marginTop: 4 } },
                          ...skill.tags.map((tag, i) =>
                            React.createElement(
                              Tag,
                              {
                                key: i,
                                color: "cyan",
                                style: { fontSize: 10 },
                              },
                              tag,
                            ),
                          ),
                        )
                      : null,
                  ),
                ),
            }),
        // Skill Picker Modal (card-grid style, consistent with Skill Center)
        React.createElement(SkillPickerModal, {
          open: skillPickerOpen2,
          onClose: () => setSkillPickerOpen2(false),
          poolSkills: poolSkillsList2,
          installedSkillNames: enabledSkills.map((s: SkillSpec) => s.name),
          loading: poolLoading2,
          onInstall: handleBatchInstallSkills,
        }),
      );

  const mcpTab = loading
    ? React.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        React.createElement(Spin, { size: "large" }),
      )
    : React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            },
          },
          React.createElement(
            Text,
            { strong: true },
            `MCP 客户端 (${mcps.length})`,
          ),
          React.createElement(
            Button,
            {
              type: "primary",
              size: "small",
              icon: PlusOutlined
                ? React.createElement(PlusOutlined)
                : undefined,
              onClick: () => {
                window.history.pushState({}, "", `/agents/${agent.id}/mcp`);
                window.dispatchEvent(new PopStateEvent("popstate"));
              },
            },
            "配置 MCP",
          ),
        ),
        mcps.length === 0
          ? React.createElement(Empty, {
              description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
              image: Empty.PRESENTED_IMAGE_SIMPLE,
            })
          : React.createElement(List, {
              dataSource: mcps,
              renderItem: (mcp: MCPClientInfo) =>
                React.createElement(
                  List.Item,
                  {
                    actions: [
                      React.createElement(
                        Button,
                        {
                          type: "link",
                          size: "small",
                          danger: true,
                          onClick: () => handleRemoveMCP(mcp.key),
                        },
                        "移除",
                      ),
                    ],
                  },
                  React.createElement(
                    "div",
                    { style: { width: "100%" } },
                    React.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                        },
                      },
                      React.createElement(
                        "span",
                        { style: { fontSize: 14 } },
                        "🔌",
                      ),
                      React.createElement(
                        Text,
                        { strong: true },
                        mcp.name || mcp.key,
                      ),
                      React.createElement(
                        Tag,
                        {
                          color: mcp.enabled ? "green" : "default",
                          style: { fontSize: 10 },
                        },
                        mcp.enabled ? "启用" : "停用",
                      ),
                      React.createElement(
                        Tag,
                        { color: "purple", style: { fontSize: 10 } },
                        mcp.transport,
                      ),
                    ),
                    mcp.description
                      ? React.createElement(
                          Paragraph,
                          {
                            type: "secondary",
                            style: { fontSize: 12, margin: 0 },
                            ellipsis: { rows: 2 },
                          },
                          mcp.description,
                        )
                      : null,
                    mcp.tools && mcp.tools.length > 0
                      ? React.createElement(
                          "div",
                          {
                            style: {
                              marginTop: 4,
                              fontSize: 11,
                              color: "#8c8c8c",
                            },
                          },
                          `提供 ${mcp.tools.length} 个工具`,
                        )
                      : null,
                  ),
                ),
            }),
      );

  const toolsTab = config?.tools
    ? React.createElement(
        "div",
        { style: { padding: 16 } },
        React.createElement(
          "div",
          { style: { marginBottom: 12 } },
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
              },
            },
            ToolOutlined
              ? React.createElement(ToolOutlined, {
                  style: { fontSize: 14, color: "#1677ff" },
                })
              : null,
            React.createElement(Text, { strong: true }, "工具配置"),
          ),
          React.createElement(
            "pre",
            {
              style: {
                background: "#fafafa",
                padding: 12,
                borderRadius: 6,
                fontSize: 12,
                overflow: "auto",
                maxHeight: 300,
              },
            },
            JSON.stringify(config.tools, null, 2),
          ),
        ),
      )
    : React.createElement(Empty, {
        description: "暂无工具配置",
        image: Empty.PRESENTED_IMAGE_SIMPLE,
      });

  const tabItems = [
    { key: "basic", label: "基本信息", children: basicInfoTab },
    {
      key: "skills",
      label: `技能 (${enabledSkills.length})`,
      children: skillsTab,
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: React.createElement(PresetPromptsTab, {
        skills: enabledSkills,
        agentId: agent.id,
      }),
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: React.createElement(KnowledgeBaseTab, {
        agentId: agent.id,
        systemPromptFiles: config?.system_prompt_files || [],
        onRefresh: () => onRefresh(),
      }),
    },
    { key: "mcp", label: `MCP (${mcps.length})`, children: mcpTab },
    { key: "tools", label: "工具配置", children: toolsTab },
  ];

  return React.createElement(
    Drawer,
    {
      title: React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        React.createElement(ExpertAvatar, { name: agent.name, size: 28 }),
        React.createElement("span", null, agent.name),
      ),
      open,
      onClose,
      width: 560,
      extra: React.createElement(
        Space,
        null,
        React.createElement(
          Button,
          {
            size: "small",
            icon: EditOutlined ? React.createElement(EditOutlined) : undefined,
            onClick: () => {
              // Close the drawer first to avoid React unmount conflicts
              onClose();
              // Set the selected agent so /agents page knows which to edit
              try {
                const host = getHost();
                if (host.setSelectedAgent) {
                  host.setSelectedAgent(agent.id);
                }
              } catch (err) {
                console.warn("[ugsci] Failed to set selected agent:", err);
              }
              // Defer navigation to allow React to process state updates
              setTimeout(() => navigateTo("/agents"), 0);
            },
          },
          "编辑专家",
        ),
        React.createElement(
          Button,
          {
            type: "primary",
            size: "small",
            icon: ThunderboltOutlined
              ? React.createElement(ThunderboltOutlined)
              : undefined,
            onClick: () => {
              // Close the drawer first to avoid React unmount conflicts
              onClose();
              // Set this agent as selected via the host store API
              try {
                const host = getHost();
                if (host.setSelectedAgent) {
                  host.setSelectedAgent(agent.id);
                }
              } catch (err) {
                console.warn("[ugsci] Failed to set selected agent:", err);
              }
              // Defer navigation to allow React to process state updates
              setTimeout(() => navigateTo("/chat"), 0);
            },
          },
          "开始对话",
        ),
      ),
    },
    React.createElement(Tabs, {
      items: tabItems,
      defaultActiveKey: "basic",
    }),
  );
}

// ─── Expert Template Modal ───────────────────────────────────────────────────

function ExpertTemplateModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const React = getHost().React;
  const { useState } = React;
  const {
    Modal,
    Card,
    Tag,
    Input,
    Row,
    Col,
    Spin,
    message: antdMsg,
    Typography,
  } = getHost().antd;
  const { Text } = Typography;
  const { FileAddOutlined } = getHost().antdIcons || {};
  const [creating, setCreating] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [blankModalOpen, setBlankModalOpen] = useState(false);

  const handleCreateBlank = async (name: string, description: string) => {
    setCreating(true);
    try {
      const agentRef = await apiFetch<{ id: string }>("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "新专家",
          description: description || "",
          skill_names: [],
        }),
      });

      // Write a minimal AGENTS.md
      await writeKnowledgeFile(
        agentRef.id,
        "AGENTS.md",
        `# ${name || "新专家"}\n\n请在此处编写该专家的系统提示词。\n`,
      );

      antdMsg.success("专家「" + (name || "新专家") + "」创建成功");
      setBlankModalOpen(false);
      // Defer closing the outer modal to avoid simultaneous closing race condition
      // when BlankExpertModal and ExpertTemplateModal try to close at the same time
      setTimeout(() => {
        onClose();
        onCreated();
      }, 0);
    } catch (err: any) {
      antdMsg.error(err.message || "创建专家失败");
    } finally {
      setCreating(false);
    }
  };

  const filteredTemplates = EXPERT_TEMPLATES.filter((t) => {
    if (!searchText.trim()) return true;
    const q = searchText.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  });

  const handleSelectTemplate = async (template: ExpertTemplate) => {
    setCreating(true);
    try {
      // 1. Create agent via POST /api/agents
      const agentRef = await apiFetch<{ id: string }>("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          skill_names: template.recommendedSkills,
        }),
      });

      // 2. Write AGENTS.md with template system prompt
      await writeKnowledgeFile(agentRef.id, "AGENTS.md", template.systemPrompt);

      // 3. Update agent config with approval level
      const config = await fetchAgentConfig(agentRef.id);
      config.approval_level = template.approvalLevel;
      await apiFetch(`/agents/${encodeURIComponent(agentRef.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      antdMsg.success(`专家「${template.name}」创建成功`);
      onClose();
      onCreated();
    } catch (err: any) {
      antdMsg.error(err.message || "创建专家失败");
    } finally {
      setCreating(false);
    }
  };

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
    Modal,
    {
      open,
      onCancel: onClose,
      footer: null,
      title: "选择专家模板",
      width: 800,
      maskClosable: true,
      keyboard: true,
    },
    React.createElement(
      "div",
      { style: { marginBottom: 16 } },
      React.createElement(Input, {
        placeholder: "搜索模板名称或类别...",
        value: searchText,
        onChange: (e: any) => setSearchText(e.target.value),
        allowClear: true,
      }),
    ),
    creating
      ? React.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          React.createElement(Spin, { size: "large" }),
          React.createElement(
            "div",
            { style: { marginTop: 12, color: "#8c8c8c" } },
            "正在创建专家...",
          ),
        )
      : React.createElement(
          Row,
          { gutter: [12, 12] },
          // ── Blank template card (always first) ──
          !searchText.trim()
            ? React.createElement(
                Col,
                { xs: 24, sm: 12 },
                React.createElement(
                  Card,
                  {
                    hoverable: true,
                    size: "small",
                    onClick: () => setBlankModalOpen(true),
                    style: {
                      cursor: "pointer",
                      height: "100%",
                      border: "2px dashed #d9d9d9",
                      background: "#fafafa",
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        marginBottom: 8,
                      },
                    },
                    React.createElement(
                      "span",
                      { style: { fontSize: 28, color: "#8c8c8c" } },
                      FileAddOutlined
                        ? React.createElement(FileAddOutlined)
                        : "📝",
                    ),
                    React.createElement(
                      "div",
                      { style: { flex: 1 } },
                      React.createElement(
                        Text,
                        { strong: true, style: { fontSize: 15 } },
                        "从空白模版开始创建",
                      ),
                      React.createElement(
                        "div",
                        null,
                        React.createElement(
                          Tag,
                          { color: "default", style: { fontSize: 10 } },
                          "空白",
                        ),
                      ),
                    ),
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        fontSize: 12,
                        color: "#595959",
                        lineHeight: 1.5,
                      },
                    },
                    "创建一个全新的专家，不使用任何预设模板。创建后可自行配置系统提示词、技能和 MCP 客户端。",
                  ),
                ),
              )
            : null,
          ...filteredTemplates.map((template) =>
            React.createElement(
              Col,
              { key: template.id, xs: 24, sm: 12 },
              React.createElement(
                Card,
                {
                  hoverable: true,
                  size: "small",
                  onClick: () => handleSelectTemplate(template),
                  style: { cursor: "pointer", height: "100%" },
                },
                React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      marginBottom: 8,
                    },
                  },
                  React.createElement(ExpertAvatar, {
                    name: template.name,
                    size: 40,
                  }),
                  React.createElement(
                    "div",
                    { style: { flex: 1 } },
                    React.createElement(
                      Text,
                      { strong: true, style: { fontSize: 15 } },
                      template.name,
                    ),
                    React.createElement(
                      "div",
                      null,
                      React.createElement(
                        Tag,
                        { color: "blue", style: { fontSize: 10 } },
                        template.category,
                      ),
                      template.approvalLevel === "MANUAL"
                        ? React.createElement(
                            Tag,
                            { color: "orange", style: { fontSize: 10 } },
                            "需审批",
                          )
                        : null,
                    ),
                  ),
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 12,
                      color: "#595959",
                      lineHeight: 1.5,
                    },
                  },
                  renderMarkdown(template.description, React),
                ),
              ),
            ),
          ),
        ),
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    React.createElement(BlankExpertModal, {
      open: blankModalOpen,
      onCancel: () => setBlankModalOpen(false),
      onCreate: handleCreateBlank,
    }),
  );
}

// ─── Blank Expert Creation Modal ─────────────────────────────────────────────

function BlankExpertModal({
  open,
  onCancel,
  onCreate,
}: {
  open: boolean;
  onCancel: () => void;
  onCreate: (name: string, description: string) => Promise<void> | void;
}) {
  const React = getHost().React;
  const { useState, useEffect } = React;
  const { Modal, Input, message: antdMsg } = getHost().antd;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form fields whenever the modal is opened
  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setLoading(false);
    }
  }, [open]);

  return React.createElement(
    Modal,
    {
      open,
      title: "从空白模版创建专家",
      onCancel,
      onOk: () => {
        if (!name.trim()) {
          antdMsg.warning("请输入专家名称");
          return;
        }
        setLoading(true);
        // Fire-and-forget: do NOT return the Promise so antd
        // doesn't set its internal okButtonLoading state which
        // can prevent the modal from closing when open becomes false.
        //
        // IMPORTANT: Use okButtonProps.loading instead of confirmLoading.
        // In Ant Design 5.x, Modal's handleCancel checks `confirmLoading`
        // and blocks closing (returns early) when it is true.  Using
        // okButtonProps.loading shows the spinner on the OK button without
        // preventing the user from closing the modal via X / Cancel / mask / ESC.
        Promise.resolve(onCreate(name.trim(), description.trim())).finally(() => {
          setLoading(false);
        });
      },
      okText: "创建",
      cancelText: "取消",
      okButtonProps: { loading: loading },
      maskClosable: true,
      keyboard: true,
    },
    React.createElement(
      "div",
      { style: { marginBottom: 16 } },
      React.createElement(
        "div",
        { style: { fontSize: 13, marginBottom: 6, color: "#595959" } },
        "专家名称",
      ),
      React.createElement(Input, {
        placeholder: "输入专家名称",
        value: name,
        onChange: (e: any) => setName(e.target.value),
        maxLength: 50,
      }),
    ),
    React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { style: { fontSize: 13, marginBottom: 6, color: "#595959" } },
        "专家描述（可选）",
      ),
      React.createElement(Input.TextArea, {
        placeholder: "简要描述该专家的职责和能力...",
        value: description,
        onChange: (e: any) => setDescription(e.target.value),
        rows: 3,
        maxLength: 200,
      }),
    ),
  );
}

// ─── Knowledge Base Tab ──────────────────────────────────────────────────────

function KnowledgeBaseTab({
  agentId,
  systemPromptFiles,
  onRefresh,
}: {
  agentId: string;
  systemPromptFiles: string[];
  onRefresh: () => void;
}) {
  const React = getHost().React;
  const { useState, useEffect, useCallback } = React;
  const {
    List,
    Tag,
    Switch,
    Button,
    Modal,
    Input,
    Spin,
    Empty,
    message: antdMsg,
    Typography,
  } = getHost().antd;
  const { FileTextOutlined, PlusOutlined, EditOutlined, ReloadOutlined } =
    getHost().antdIcons || {};
  const { Text } = Typography;

  const [files, setFiles] = useState<KnowledgeFileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [enabledFiles, setEnabledFiles] = useState<string[]>(
    systemPromptFiles || [],
  );
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [saving, setSaving] = useState(false);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchKnowledgeFiles(agentId);
      setFiles(data);
    } catch (err: any) {
      antdMsg.error(err.message || "加载记忆文件失败");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    setEnabledFiles(systemPromptFiles || []);
  }, [systemPromptFiles]);

  const handleToggleFile = async (filename: string, enabled: boolean) => {
    const current = new Set(enabledFiles);
    if (enabled) {
      current.add(filename);
    } else {
      // Don't allow disabling AGENTS.md
      if (DEFAULT_PROMPT_FILES.includes(filename) && filename === "AGENTS.md") {
        antdMsg.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      current.delete(filename);
    }
    const newList = Array.from(current);
    setEnabledFiles(newList);
    try {
      await updateAgentSystemPromptFiles(agentId, newList);
      antdMsg.success(enabled ? "已启用记忆文件" : "已停用记忆文件");
      onRefresh();
    } catch (err: any) {
      antdMsg.error(err.message || "更新失败");
      // Revert
      setEnabledFiles(systemPromptFiles || []);
    }
  };

  const handleEditFile = async (filename: string) => {
    try {
      const content = await apiFetch<{ content: string }>(
        `/workspace/files/${encodeURIComponent(filename)}`,
        { headers: { "X-Agent-Id": agentId } },
      );
      setEditingFile(filename);
      setEditContent(content.content || "");
      setEditModalOpen(true);
    } catch (err: any) {
      antdMsg.error(err.message || "读取文件失败");
    }
  };

  const handleNewFile = () => {
    setEditingFile(null);
    setEditContent("");
    setNewFileName("");
    setEditModalOpen(true);
  };

  const handleSaveFile = async () => {
    const filename = editingFile || newFileName.trim();
    if (!filename) {
      antdMsg.warning("请输入文件名");
      return;
    }
    const finalName = filename.endsWith(".md") ? filename : `${filename}.md`;
    setSaving(true);
    try {
      await writeKnowledgeFile(agentId, finalName, editContent);
      // Auto-enable the new file in system_prompt_files
      if (!editingFile && !enabledFiles.includes(finalName)) {
        const newList = [...enabledFiles, finalName];
        setEnabledFiles(newList);
        await updateAgentSystemPromptFiles(agentId, newList);
      }
      antdMsg.success("保存成功");
      setEditModalOpen(false);
      loadFiles();
      onRefresh();
    } catch (err: any) {
      antdMsg.error(err.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return React.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      React.createElement(Spin, { size: "large" }),
    );
  }

  return React.createElement(
    "div",
    null,
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        },
      },
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        FileTextOutlined
          ? React.createElement(FileTextOutlined, {
              style: { fontSize: 14, color: "#1677ff" },
            })
          : null,
        React.createElement(
          Text,
          { strong: true },
          `记忆文件 (${files.length})`,
        ),
        React.createElement(
          Text,
          { type: "secondary", style: { fontSize: 12 } },
          `· 已挂载 ${enabledFiles.length} 个到专家记忆`,
        ),
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        React.createElement(
          Button,
          {
            size: "small",
            icon: ReloadOutlined
              ? React.createElement(ReloadOutlined)
              : undefined,
            onClick: loadFiles,
          },
          "刷新",
        ),
        React.createElement(
          Button,
          {
            type: "primary",
            size: "small",
            icon: PlusOutlined ? React.createElement(PlusOutlined) : undefined,
            onClick: handleNewFile,
          },
          "新建记忆文件",
        ),
      ),
    ),
    files.length === 0
      ? React.createElement(Empty, {
          description: "暂无记忆文件，点击「新建记忆文件」添加",
          image: Empty.PRESENTED_IMAGE_SIMPLE,
        })
      : React.createElement(List, {
          dataSource: files,
          renderItem: (file: KnowledgeFileInfo) => {
            const isEnabled = enabledFiles.includes(file.filename);
            const isDefault = DEFAULT_PROMPT_FILES.includes(file.filename);
            return React.createElement(
              List.Item,
              {
                actions: [
                  React.createElement(
                    Button,
                    {
                      type: "link",
                      size: "small",
                      icon: EditOutlined
                        ? React.createElement(EditOutlined)
                        : undefined,
                      onClick: () => handleEditFile(file.filename),
                    },
                    "编辑",
                  ),
                ],
              },
              React.createElement(List.Item.Meta, {
                avatar: React.createElement(FileTextOutlined, {
                  style: {
                    fontSize: 20,
                    color: isEnabled ? "#1677ff" : "#bfbfbf",
                  },
                }),
                title: React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    },
                  },
                  React.createElement(Text, null, file.filename),
                  isDefault
                    ? React.createElement(
                        Tag,
                        { color: "default", style: { fontSize: 10 } },
                        "内置",
                      )
                    : React.createElement(
                        Tag,
                        { color: "cyan", style: { fontSize: 10 } },
                        "记忆库",
                      ),
                ),
                description: React.createElement(
                  "div",
                  { style: { fontSize: 12 } },
                  `${(file.size / 1024).toFixed(1)} KB · 修改于 ${new Date(file.modified_time).toLocaleString()}`,
                ),
              }),
              React.createElement(Switch, {
                checked: isEnabled,
                size: "small",
                onChange: (checked: boolean) =>
                  handleToggleFile(file.filename, checked),
              }),
            );
          },
        }),
    // Edit/New file modal
    React.createElement(
      Modal,
      {
        open: editModalOpen,
        onCancel: () => setEditModalOpen(false),
        title: editingFile ? `编辑 ${editingFile}` : "新建记忆文件",
        width: 700,
        onOk: handleSaveFile,
        confirmLoading: saving,
        okText: "保存",
      },
      !editingFile
        ? React.createElement(
            "div",
            { style: { marginBottom: 12 } },
            React.createElement(Input, {
              placeholder: "文件名（如：油藏工程记忆库.md）",
              value: newFileName,
              onChange: (e: any) => setNewFileName(e.target.value),
              addonAfter: !newFileName.endsWith(".md") ? ".md" : "",
            }),
          )
        : null,
      React.createElement(Input.TextArea, {
        value: editContent,
        onChange: (e: any) => setEditContent(e.target.value),
        rows: 12,
        placeholder:
          "输入记忆内容（支持 Markdown 格式）...\n\n例如：\n# 某区块油藏基础参数\n\n- 地层压力: 25 MPa\n- 地层温度: 85°C\n- 原油密度: 0.85 g/cm³",
        style: { fontFamily: "monospace", fontSize: 13 },
      }),
    ),
  );
}

// ─── Preset Prompts Tab ──────────────────────────────────────────────────────

function PresetPromptsTab({
  skills,
  agentId,
}: {
  skills: SkillSpec[];
  agentId: string;
}) {
  const React = getHost().React;
  const { useMemo } = React;
  const {
    List,
    Tag,
    Typography,
    Empty,
    Button,
    message: antdMsg,
  } = getHost().antd;
  const { ThunderboltOutlined, CopyOutlined } = getHost().antdIcons || {};
  const { Text } = Typography;

  const prompts = useMemo(() => extractPromptFromSkills(skills), [skills]);

  const handleUsePrompt = (prompt: PromptItem) => {
    try {
      const host = getHost();
      if (host.setSelectedAgent) {
        host.setSelectedAgent(agentId);
      }
    } catch {}
    // Store the prompt for the chat page to pick up
    try {
      sessionStorage.setItem("ugsci_pending_prompt", prompt.value);
    } catch {}
    window.history.pushState({}, "", "/chat");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleCopy = (prompt: PromptItem) => {
    navigator.clipboard?.writeText(prompt.value).then(() => {
      antdMsg.success("已复制到剪贴板");
    });
  };

  if (prompts.length === 0) {
    return React.createElement(Empty, {
      description: "暂无推荐提问，请先为专家添加技能",
      image: Empty.PRESENTED_IMAGE_SIMPLE,
    });
  }

  return React.createElement(
    "div",
    null,
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12,
        },
      },
      ThunderboltOutlined
        ? React.createElement(ThunderboltOutlined, {
            style: { fontSize: 14, color: "#1677ff" },
          })
        : null,
      React.createElement(
        Text,
        { strong: true },
        `推荐提问 (${prompts.length})`,
      ),
      React.createElement(
        Text,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取",
      ),
    ),
    React.createElement(List, {
      dataSource: prompts,
      renderItem: (prompt: PromptItem, index: number) =>
        React.createElement(
          List.Item,
          {
            actions: [
              React.createElement(
                Button,
                {
                  type: "link",
                  size: "small",
                  icon: CopyOutlined
                    ? React.createElement(CopyOutlined)
                    : undefined,
                  onClick: () => handleCopy(prompt),
                },
                "复制",
              ),
            ],
          },
          React.createElement(List.Item.Meta, {
            avatar: React.createElement(
              Tag,
              { color: "blue", style: { borderRadius: "50%" } },
              `${index + 1}`,
            ),
            title: React.createElement(
              "div",
              {
                style: {
                  cursor: "pointer",
                  color: "#1677ff",
                },
                onClick: () => handleUsePrompt(prompt),
              },
              prompt.value,
            ),
            description: React.createElement(
              Text,
              { type: "secondary", style: { fontSize: 12 } },
              prompt.label,
            ),
          }),
        ),
    }),
  );
}

function ExpertCenterPage() {
  const React = getHost().React;
  const { useState, useEffect, useCallback, useMemo } = React;
  const {
    Spin,
    Empty,
    Input,
    Button,
    message: antdMsg,
    Row,
    Col,
    Tabs,
    Modal,
    Typography,
  } = getHost().antd;
  const {
    ReloadOutlined,
    PlusOutlined,
    SearchOutlined,
    TeamOutlined,
    UserOutlined,
  } = getHost().antdIcons || {};
  const { Text, Paragraph } = Typography;

  const [experts, setExperts] = useState<ExpertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeExpert, setActiveExpert] = useState<ExpertData | null>(null);
  const [searchText, setSearchText] = useState("");
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("experts");
  const [teamLaunchModal, setTeamLaunchModal] = useState<ExpertTeam | null>(
    null,
  );
  const [teamLaunchInput, setTeamLaunchInput] = useState("");
  const [teamLaunching, setTeamLaunching] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configExpert, setConfigExpert] = useState<ExpertData | null>(null);

  // Cache the raw agent list for team matching
  const [rawAgents, setRawAgents] = useState<AgentSummary[]>([]);

  const loadExperts = useCallback(async () => {
    setLoading(true);
    try {
      const agents = await fetchAgents();

      // Fetch detailed data for each agent in parallel
      const expertDataList: ExpertData[] = await Promise.all(
        agents.map(async (agent): Promise<ExpertData> => {
          try {
            const [config, skills, agentMCPs] = await Promise.all([
              fetchAgentConfig(agent.id).catch(() => null),
              fetchAgentSkills(agent.id).catch(() => [] as SkillSpec[]),
              fetchAgentMCPClients(agent.id).catch(() => [] as MCPClientInfo[]),
            ]);

            return {
              agent,
              config,
              skills,
              mcps: agentMCPs,
              loading: false,
            };
          } catch {
            return {
              agent,
              config: null,
              skills: [],
              mcps: [],
              loading: false,
            };
          }
        }),
      );

      setExperts(expertDataList);
      setRawAgents(agents);
    } catch (err: any) {
      antdMsg.error(err.message || "加载专家列表失败");
      setExperts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExperts();
  }, [loadExperts]);

  // Sync configExpert with the refreshed experts list so tab labels
  // (skill count, MCP count) stay in sync after edits inside the modal.
  useEffect(() => {
    if (configExpert && configModalOpen) {
      const updated = experts.find(
        (e) => e.agent.id === configExpert.agent.id,
      );
      if (updated && updated !== configExpert) {
        setConfigExpert(updated);
      }
    }
  }, [experts, configExpert, configModalOpen]);

  const handleLaunchTeam = useCallback(
    async (team: ExpertTeam) => {
      // Find coordinator agent
      const coordinatorName = team.coordinatorName || team.members[0]?.name;
      if (!coordinatorName) {
        antdMsg.error("无法确定协调者专家");
        return;
      }
      const coordinatorId = findAgentIdByName(rawAgents, coordinatorName);
      if (!coordinatorId) {
        antdMsg.error(`未找到协调者专家「${coordinatorName}」，请先创建该专家`);
        return;
      }
      // Check if task template has placeholders
      const hasPlaceholders = /\{.+?\}/.test(team.taskTemplate);
      if (hasPlaceholders) {
        // Open modal for user to fill in placeholders
        setTeamLaunchInput("");
        setTeamLaunchModal(team);
        return;
      }
      // No placeholders — launch directly
      await doLaunchTeam(team, coordinatorId, team.taskTemplate);
    },
    [rawAgents, antdMsg],
  );

  const doLaunchTeam = useCallback(
    async (team: ExpertTeam, coordinatorId: string, taskText: string) => {
      setTeamLaunching(true);
      try {
        const fullMessage = buildTeamMessage(team);
        // Replace template placeholders with user input if provided
        const finalMessage = taskText
          ? fullMessage.replace(team.taskTemplate, taskText)
          : fullMessage;

        // Set coordinator as selected agent
        const host = getHost();
        if (host.setSelectedAgent) {
          host.setSelectedAgent(coordinatorId);
        }

        // Send the message via console chat API
        await sendTeamMessage(coordinatorId, finalMessage);

        antdMsg.success(
          `团队任务已发起，协调者：${team.coordinatorName || team.members[0]?.name}`,
        );
        setTeamLaunchModal(null);

        // Navigate to chat page
        navigateToExpert("/chat");
      } catch (err: any) {
        antdMsg.error(err.message || "发起团队任务失败");
      } finally {
        setTeamLaunching(false);
      }
    },
    [antdMsg],
  );

  const navigateToExpert = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleCardClick = useCallback((expert: ExpertData) => {
    setActiveExpert(expert);
    setDrawerOpen(true);
  }, []);

  const handleConfigureExpert = useCallback((expert: ExpertData) => {
    setConfigExpert(expert);
    setConfigModalOpen(true);
  }, []);

  const handleSummonExpert = useCallback(
    (expert: ExpertData) => {
      if (!expert.agent.enabled) {
        antdMsg.warning(`专家「${expert.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const host = getHost();
        if (host.setSelectedAgent) {
          host.setSelectedAgent(expert.agent.id);
        }
      } catch (err) {
        console.warn("[ugsci] Failed to set selected agent:", err);
      }
      antdMsg.success(`已召唤专家「${expert.agent.name}」，正在跳转至对话...`);
      navigateToExpert("/chat");
    },
    [antdMsg],
  );

  const filteredExperts = useMemo(() => {
    if (!searchText.trim()) return experts;
    const q = searchText.toLowerCase();
    return experts.filter(
      (e) =>
        e.agent.name.toLowerCase().includes(q) ||
        e.agent.description?.toLowerCase().includes(q) ||
        e.agent.id.toLowerCase().includes(q) ||
        e.skills.some((s) => s.name.toLowerCase().includes(q)),
    );
  }, [experts, searchText]);

  const enabledCount = experts.filter((e) => e.agent.enabled).length;
  const totalSkills = experts.reduce(
    (sum, e) => sum + e.skills.filter((s) => s.enabled !== false).length,
    0,
  );
  const totalMCPs = experts.reduce((sum, e) => sum + e.mcps.length, 0);

  const tabItems = [
    {
      key: "experts",
      label: React.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        UserOutlined
          ? React.createElement(UserOutlined, { style: { fontSize: 14 } })
          : null,
        "专家列表",
      ),
      children: React.createElement(
        "div",
        null,
        // Search bar
        React.createElement(
          "div",
          { style: { marginBottom: 16 } },
          React.createElement(Input, {
            placeholder: "搜索专家名称、描述或技能...",
            prefix: SearchOutlined
              ? React.createElement(SearchOutlined)
              : undefined,
            value: searchText,
            onChange: (e: any) => setSearchText(e.target.value),
            allowClear: true,
            style: { maxWidth: 400 },
          }),
        ),
        // Content
        loading
          ? React.createElement(
              "div",
              { style: { textAlign: "center", padding: 60 } },
              React.createElement(Spin, { size: "large" }),
            )
          : filteredExperts.length === 0
            ? React.createElement(Empty, {
                description: searchText
                  ? "未找到匹配的专家"
                  : "暂无专家，点击「创建专家」添加",
              })
            : React.createElement(
                Row,
                { gutter: [12, 12], align: "stretch" },
                ...filteredExperts.map((expert) =>
                  React.createElement(
                    Col,
                    {
                      key: expert.agent.id,
                      xs: 24,
                      sm: 12,
                      md: 8,
                      lg: 6,
                      style: { display: "flex" },
                    },
                    React.createElement(ExpertCard, {
                      expert,
                      onClick: () => handleCardClick(expert),
                      onSummon: () => handleSummonExpert(expert),
                      onConfigure: () => handleConfigureExpert(expert),
                    }),
                  ),
                ),
              ),
      ),
    },
    {
      key: "teams",
      label: React.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        TeamOutlined
          ? React.createElement(TeamOutlined, { style: { fontSize: 14 } })
          : null,
        "专家团",
      ),
      children: React.createElement(ExpertTeamSection, {
        agents: rawAgents,
        onLaunch: handleLaunchTeam,
      }),
    },
  ];

  return React.createElement(
    "div",
    { style: { padding: 24 } },
    React.createElement(PageHeader, {
      title: "专家",
      subtitle: `共 ${experts.length} 位专家（${enabledCount} 位启用）· ${totalSkills} 个技能 · ${totalMCPs} 个 MCP 客户端`,
      extra: React.createElement(
        React.Fragment,
        null,
        React.createElement(
          Button,
          {
            icon: ReloadOutlined
              ? React.createElement(ReloadOutlined)
              : undefined,
            onClick: () => { clearApiCache(); loadExperts(); },
            loading,
          },
          "刷新",
        ),
        React.createElement(
          Button,
          {
            type: "primary",
            icon: PlusOutlined ? React.createElement(PlusOutlined) : undefined,
            onClick: () => setTemplateModalOpen(true),
            style: PRIMARY_BTN_STYLE,
          },
          "创建专家",
        ),
      ),
    }),
    React.createElement(Tabs, {
      items: tabItems,
      activeKey: activeTab,
      onChange: (k: string) => setActiveTab(k),
    }),
    // Drawer
    React.createElement(ExpertDrawer, {
      expert: activeExpert,
      open: drawerOpen,
      onClose: () => setDrawerOpen(false),
      onRefresh: () => loadExperts(),
    }),
    // Template Modal
    React.createElement(ExpertTemplateModal, {
      open: templateModalOpen,
      onClose: () => setTemplateModalOpen(false),
      onCreated: () => loadExperts(),
    }),
    // Config Modal (gear icon)
    React.createElement(ExpertConfigModal, {
      expert: configExpert,
      open: configModalOpen,
      onClose: () => setConfigModalOpen(false),
      onRefresh: () => loadExperts(),
    }),
    // Team Launch Modal (for filling placeholders)
    teamLaunchModal
      ? React.createElement(
          Modal,
          {
            open: true,
            title: React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              React.createElement(TeamAvatar, {
                members: teamLaunchModal.members.map((m) => m.name),
                size: 28,
              }),
              React.createElement(
                "span",
                null,
                `发起团队任务 - ${teamLaunchModal.name}`,
              ),
            ),
            onCancel: () => setTeamLaunchModal(null),
            onOk: () => {
              const coordinatorName =
                teamLaunchModal.coordinatorName ||
                teamLaunchModal.members[0]?.name;
              const coordinatorId = coordinatorName
                ? findAgentIdByName(rawAgents, coordinatorName)
                : null;
              if (!coordinatorId) {
                antdMsg.error("无法找到协调者专家");
                return;
              }
              // Build final task text, replacing placeholders with user input
              let taskText = teamLaunchModal.taskTemplate;
              if (teamLaunchInput.trim()) {
                // User provided free-form input — use as-is for the task description
                taskText = teamLaunchInput.trim();
              }
              doLaunchTeam(teamLaunchModal, coordinatorId, taskText);
            },
            confirmLoading: teamLaunching,
            okText: "发起任务",
            width: 600,
          },
          React.createElement(
            "div",
            { style: { marginBottom: 12 } },
            React.createElement(
              Text,
              {
                type: "secondary",
                style: { fontSize: 12, display: "block", marginBottom: 8 },
              },
              "任务模板（包含占位符 {参数名}，可在下方编辑替换）：",
            ),
            React.createElement(
              "div",
              {
                style: {
                  padding: 12,
                  background: "#f5f5f5",
                  borderRadius: 6,
                  fontSize: 12,
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                },
              },
              teamLaunchModal.taskTemplate,
            ),
          ),
          React.createElement(
            "div",
            null,
            React.createElement(
              Text,
              {
                type: "secondary",
                style: { fontSize: 12, display: "block", marginBottom: 8 },
              },
              "输入具体任务描述（替换上面的占位符内容）：",
            ),
            React.createElement(Input.TextArea, {
              value: teamLaunchInput,
              onChange: (e: any) => setTeamLaunchInput(e.target.value),
              rows: 5,
              placeholder: teamLaunchModal.taskTemplate,
              style: { fontSize: 13 },
            }),
          ),
          React.createElement(
            "div",
            {
              style: {
                marginTop: 12,
                padding: "8px 12px",
                background: "#e6f4ff",
                borderRadius: 6,
              },
            },
            React.createElement(
              Text,
              { style: { fontSize: 12, color: "#0958d9" } },
              `协调者: ${teamLaunchModal.coordinatorName || teamLaunchModal.members[0]?.name || "—"} · 成员: ${teamLaunchModal.members.map((m) => m.name).join("、")}`,
            ),
          ),
        )
      : null,
  );
}

// ─── Capability Center Page ───────────────────────────────────────────────────

function CapabilityCard({
  mcp,
  onClick,
  onToggle,
  onDelete,
  onViewTools,
}: {
  mcp: MCPClientInfo;
  onClick: () => void;
  onToggle: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onViewTools: (e: React.MouseEvent) => void;
}) {
  const React = getHost().React;
  const { Card, Tag, Badge, Typography, Button } = getHost().antd;
  const { Text } = Typography;
  const {
    EyeOutlined,
    EyeInvisibleOutlined,
    DeleteOutlined,
    ToolOutlined,
  } = getHost().antdIcons || {};

  const transportIcons: Record<string, string> = {
    stdio: "💻",
    streamable_http: "🌐",
    sse: "📡",
  };

  const isRemote =
    mcp.transport === "streamable_http" || mcp.transport === "sse";

  return React.createElement(
    Card,
    {
      hoverable: true,
      onClick,
      size: "small",
      style: {
        cursor: "pointer",
        borderColor: mcp.enabled ? undefined : "#d9d9d9",
        opacity: mcp.enabled ? 1 : 0.7,
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      },
      bodyStyle: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flex: 1,
      },
    },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        },
      },
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        React.createElement(
          "span",
          { style: { fontSize: 18 } },
          transportIcons[mcp.transport] || "🔌",
        ),
        React.createElement(
          Text,
          { strong: true, style: { fontSize: 14 } },
          mcp.name || mcp.key,
        ),
      ),
      React.createElement(Badge, {
        status: mcp.enabled ? "success" : "default",
        text: mcp.enabled ? "启用" : "停用",
      }),
    ),
    mcp.description
      ? React.createElement(
          "div",
          {
            style: {
              fontSize: 12,
              color: "#595959",
              marginBottom: 8,
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: 36,
              flex: "1 0 auto",
            },
          },
          mcp.description,
        )
      : React.createElement(
          "div",
          { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 8, minHeight: 36, flex: "1 0 auto" } },
          "暂无描述",
        ),
    React.createElement(
      "div",
      { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 } },
      React.createElement(
        Tag,
        { color: "purple", style: { fontSize: 11 } },
        mcp.transport,
      ),
      mcp.tools && mcp.tools.length > 0
        ? React.createElement(
            Tag,
            { color: "blue", style: { fontSize: 11 } },
            `${mcp.tools.length} 个工具`,
          )
        : React.createElement(Tag, { style: { fontSize: 11 } }, "全部工具"),
      mcp.url
        ? React.createElement(
            Tag,
            {
              color: "geekblue",
              style: {
                fontSize: 11,
                maxWidth: 200,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              },
            },
            mcp.url,
          )
        : null,
    ),
    // ── Action buttons (mirror console /mcp page) ──
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 6,
          marginTop: "auto",
          paddingTop: 8,
          borderTop: "1px solid #f0f0f0",
        },
      },
      React.createElement(
        Button,
        {
          size: "small",
          icon: ToolOutlined ? React.createElement(ToolOutlined) : undefined,
          onClick: onViewTools,
        },
        "工具",
      ),
      React.createElement(
        Button,
        {
          size: "small",
          icon: mcp.enabled
            ? EyeInvisibleOutlined
              ? React.createElement(EyeInvisibleOutlined)
              : undefined
            : EyeOutlined
              ? React.createElement(EyeOutlined)
              : undefined,
          onClick: onToggle,
        },
        mcp.enabled ? "禁用" : "启用",
      ),
      React.createElement(
        Button,
        {
          size: "small",
          danger: true,
          icon: DeleteOutlined ? React.createElement(DeleteOutlined) : undefined,
          onClick: onDelete,
        },
        "删除",
      ),
    ),
  );
}

// ─── Computation Engine Types & Helpers ───────────────────────────────────────

interface EngineInfo {
  id: string;
  name: string;
  vendor: string;
  version: string;
  executable_path: string;
  install_dir: string;
  category: string;
  description: string;
  invocation_hint: string;
  license_server: string;
  extra_paths: string[];
  status: "configured" | "detected" | "not_found" | "error";
  is_default: boolean;
  is_custom: boolean;
  // Detected sub-modules (e.g. CMG IMEX/GEM/STARS/Builder/Results)
  modules?: string[];
  // Map of module name → executable path
  module_paths?: Record<string, string>;
}

const CATEGORY_LABELS: Record<string, string> = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真",
};

const CATEGORY_ICONS: Record<string, string> = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬",
};

// Engine IDs that have custom PNG icons in engine/icons/
const ENGINE_ICON_IDS = new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect","visage"]);

function getEngineIconUrl(engineId: string): string {
  return apiUrl(`/ugsci/engines/icon/${encodeURIComponent(engineId)}`);
}

// ─── Expert Avatar (DiceBear) ────────────────────────────────────────────────

/** Build the URL for an avatar PNG (cached / online-fetched / default fallback). */
function getExpertAvatarUrl(seed: string): string {
  return apiUrl(`/ugsci/avatar/${encodeURIComponent(seed)}`);
}

/** Build the URL for a composed team avatar PNG from member names. */
function getTeamAvatarUrl(memberNames: string[]): string {
  const joined = memberNames.map(encodeURIComponent).join(",");
  return apiUrl(`/ugsci/avatar/team/${joined}`);
}

/**
 * ExpertAvatar — renders a PNG avatar for the given expert name.
 *
 * The backend serves from local cache, falling back to the DiceBear
 * online API, then to Default.png.  If the <img> itself errors, we
 * retry once with a cache-busting query param before giving up.
 */
function ExpertAvatar({
  name,
  size = 32,
  borderRadius = "50%",
}: {
  name: string;
  size?: number;
  borderRadius?: string | number;
}) {
  const React = getHost().React;
  const [retry, setRetry] = React.useState(0);

  const src = retry === 0
    ? getExpertAvatarUrl(name)
    : `${getExpertAvatarUrl(name)}?_r=${retry}`;

  return React.createElement("img", {
    src,
    alt: name,
    onError: () => {
      // Retry once with cache-busting; after that the backend
      // itself will have returned Default.png so stop retrying.
      if (retry < 1) setRetry(retry + 1);
    },
    style: { width: size, height: size, borderRadius, objectFit: "cover", flexShrink: 0 },
  });
}

/**
 * TeamAvatar — renders a composed team avatar from member names.
 * Takes first 5 members for composition.
 */
function TeamAvatar({
  members,
  size = 32,
  borderRadius = "50%",
}: {
  members: string[];
  size?: number;
  borderRadius?: string | number;
}) {
  const React = getHost().React;
  const [retry, setRetry] = React.useState(0);

  if (!members || members.length === 0) {
    return React.createElement("span", {
      style: { width: size, height: size, display: "inline-block" },
    });
  }

  const names = members.slice(0, 5);
  const src = retry === 0
    ? getTeamAvatarUrl(names)
    : `${getTeamAvatarUrl(names)}?_r=${retry}`;

  return React.createElement("img", {
    src,
    alt: "team",
    onError: () => {
      if (retry < 1) setRetry(retry + 1);
    },
    style: { width: size, height: size, borderRadius, objectFit: "cover", flexShrink: 0 },
  });
}

async function fetchEngines(): Promise<{ engines: EngineInfo[] }> {
  return apiFetch<{ engines: EngineInfo[] }>("/ugsci/engines/list");
}

async function fetchEngine(engineId: string): Promise<EngineInfo> {
  return apiFetch<EngineInfo>(`/ugsci/engines/${encodeURIComponent(engineId)}`);
}

async function addEngine(data: Partial<EngineInfo>): Promise<EngineInfo> {
  return apiFetch<EngineInfo>("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function updateEngine(
  engineId: string,
  data: Partial<EngineInfo>,
): Promise<EngineInfo> {
  return apiFetch<EngineInfo>(`/ugsci/engines/${encodeURIComponent(engineId)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

async function deleteEngine(engineId: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(
    `/ugsci/engines/${encodeURIComponent(engineId)}`,
    { method: "DELETE" },
  );
}

async function detectEngines(): Promise<{ engines: EngineInfo[] }> {
  return apiFetch<{ engines: EngineInfo[] }>("/ugsci/engines/detect/refresh", {
    method: "POST",
  });
}

// ─── Engine Card ──────────────────────────────────────────────────────────────

function EngineCard({
  engine,
  onClick,
}: {
  engine: EngineInfo;
  onClick: () => void;
}) {
  const React = getHost().React;
  const { Card, Tag, Typography } = getHost().antd;
  const { Text } = Typography;

  const isDetected = engine.status === "detected";
  const icon = CATEGORY_ICONS[engine.category] || "📦";
  const hasCustomIcon = ENGINE_ICON_IDS.has(engine.id);
  const iconElement = hasCustomIcon
    ? React.createElement("img", {
        src: getEngineIconUrl(engine.id),
        alt: engine.name,
        style: { width: 24, height: 24, objectFit: "contain" },
      })
    : React.createElement("span", { style: { fontSize: 20 } }, icon);

  return React.createElement(
    Card,
    {
      hoverable: true,
      onClick,
      size: "small",
      style: {
        cursor: "pointer",
        borderColor: isDetected ? undefined : "#d9d9d9",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      },
      bodyStyle: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flex: 1,
      },
    },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        },
      },
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        iconElement,
        React.createElement(
          "div",
          null,
          React.createElement(
            Text,
            { strong: true, style: { fontSize: 14 } },
            engine.name,
          ),
          React.createElement("br"),
          React.createElement(
            Text,
            { type: "secondary", style: { fontSize: 11 } },
            engine.vendor || "—",
          ),
        ),
      ),
      React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" } },
        isDetected
          ? React.createElement(
              Tag,
              { color: "success", style: { fontSize: 11 } },
              "✅ 已检测",
            )
          : engine.executable_path
            ? React.createElement(
                Tag,
                { color: "warning", style: { fontSize: 11 } },
                "⚠ 路径无效",
              )
            : React.createElement(
                Tag,
                { style: { fontSize: 11 } },
                "🔧 待配置",
              ),
        engine.is_default
          ? React.createElement(
              Tag,
              { color: "blue", style: { fontSize: 10 } },
              "默认",
            )
          : engine.is_custom
            ? React.createElement(
                Tag,
                { color: "purple", style: { fontSize: 10 } },
                "自定义",
              )
            : null,
      ),
    ),
    React.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      React.createElement(
        Text,
        { type: "secondary", style: { fontSize: 12 } },
        engine.description || "暂无描述",
      ),
    ),
    React.createElement(
      "div",
      {
        style: {
          marginTop: 8,
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
        },
      },
      engine.category
        ? React.createElement(
            Tag,
            { style: { fontSize: 11 } },
            CATEGORY_LABELS[engine.category] || engine.category,
          )
        : null,
      engine.version
        ? React.createElement(
            Tag,
            { color: "blue", style: { fontSize: 11 } },
            `v${engine.version}`,
          )
        : null,
      // Display detected modules (e.g. IMEX, GEM, STARS)
      ...(engine.modules || []).map((mod) =>
        React.createElement(
          Tag,
          { key: mod, color: "cyan", style: { fontSize: 10 } },
          mod,
        ),
      ),
    ),
  );
}

// ─── Engine Section ───────────────────────────────────────────────────────────

function EngineSection() {
  const React = getHost().React;
  const { useState, useEffect, useCallback, useMemo } = React;
  const {
    Spin,
    Empty,
    Button,
    message: antdMsg,
    Row,
    Col,
    Drawer,
    Descriptions,
    Tag,
    Typography,
    Modal,
    Input,
    Select,
    Popconfirm,
    Space,
  } = getHost().antd;
  const {
    ReloadOutlined,
    SearchOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    CopyOutlined,
    ExperimentOutlined,
  } = getHost().antdIcons || {};
  const { Text, Paragraph } = Typography;

  const [engines, setEngines] = useState<EngineInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeEngine, setActiveEngine] = useState<EngineInfo | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEngine, setEditingEngine] = useState<EngineInfo | null>(null);
  const [formData, setFormData] = useState<Partial<EngineInfo>>({});
  const [saving, setSaving] = useState(false);

  const loadEngines = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchEngines();
      setEngines(data.engines || []);
    } catch (err: any) {
      antdMsg.error(err.message || "加载引擎列表失败");
      setEngines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEngines();
  }, [loadEngines]);

  const filteredEngines = useMemo(() => {
    if (!searchText.trim()) return engines;
    const q = searchText.toLowerCase();
    return engines.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.vendor.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q),
    );
  }, [engines, searchText]);

  const detectedCount = engines.filter((e) => e.status === "detected").length;

  const handleCopyPath = useCallback((path: string) => {
    navigator.clipboard
      .writeText(path)
      .then(() => antdMsg.success("路径已复制"))
      .catch(() => antdMsg.error("复制失败"));
  }, []);

  const openAddModal = useCallback(() => {
    setEditingEngine(null);
    setFormData({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: "",
    });
    setEditModalOpen(true);
  }, []);

  const openEditModal = useCallback((engine: EngineInfo) => {
    setEditingEngine(engine);
    setFormData({ ...engine });
    setEditModalOpen(true);
    setDrawerOpen(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData.name?.trim()) {
      antdMsg.warning("请输入引擎名称");
      return;
    }
    setSaving(true);
    try {
      if (editingEngine) {
        await updateEngine(editingEngine.id, formData);
        antdMsg.success("引擎已更新");
      } else {
        await addEngine(formData);
        antdMsg.success("引擎已添加");
      }
      setEditModalOpen(false);
      loadEngines();
    } catch (err: any) {
      antdMsg.error(err.message || "保存失败");
    } finally {
      setSaving(false);
    }
  }, [formData, editingEngine, loadEngines]);

  const handleDelete = useCallback(
    async (engineId: string) => {
      try {
        await deleteEngine(engineId);
        antdMsg.success("引擎已删除");
        setDrawerOpen(false);
        loadEngines();
      } catch (err: any) {
        antdMsg.error(err.message || "删除失败");
      }
    },
    [loadEngines],
  );

  const handleDetect = useCallback(async () => {
    setLoading(true);
    try {
      const data = await detectEngines();
      setEngines(data.engines || []);
      antdMsg.success("自动检测完成");
    } catch (err: any) {
      antdMsg.error(err.message || "检测失败");
    } finally {
      setLoading(false);
    }
  }, []);

  // Form field helper
  const formField = useCallback(
    (label: string, key: keyof EngineInfo, opts?: { textarea?: boolean; select?: { options: { label: string; value: string }[] } }) => {
      const value = (formData[key] as string) || "";
      return React.createElement(
        "div",
        { style: { marginBottom: 12 } },
        React.createElement(
          Text,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          label,
        ),
        opts?.select
          ? React.createElement(Select, {
              value: value || undefined,
              onChange: (v: string) =>
                setFormData((prev: any) => ({ ...prev, [key]: v })),
              style: { width: "100%" },
              options: opts.select.options,
              allowClear: true,
              placeholder: `选择${label}`,
            })
          : opts?.textarea
            ? React.createElement(Input.TextArea, {
                value,
                onChange: (e: any) =>
                  setFormData((prev: any) => ({ ...prev, [key]: e.target.value })),
                rows: 3,
                placeholder: `输入${label}`,
              })
            : React.createElement(Input, {
                value,
                onChange: (e: any) =>
                  setFormData((prev: any) => ({ ...prev, [key]: e.target.value })),
                placeholder: `输入${label}`,
              }),
      );
    },
    [formData],
  );

  return React.createElement(
    "div",
    null,
    // Action bar
    React.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        },
      },
      React.createElement(Input, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: SearchOutlined
          ? React.createElement(SearchOutlined)
          : undefined,
        value: searchText,
        onChange: (e: any) => setSearchText(e.target.value),
        allowClear: true,
        style: { maxWidth: 280 },
      }),
      React.createElement(
        Button,
        {
          icon: ReloadOutlined
            ? React.createElement(ReloadOutlined)
            : undefined,
          onClick: handleDetect,
          loading,
        },
        "自动检测",
      ),
      React.createElement(
        Button,
        {
          type: "primary",
          icon: PlusOutlined
            ? React.createElement(PlusOutlined)
            : undefined,
          onClick: openAddModal,
          style: PRIMARY_BTN_STYLE,
        },
        "添加引擎",
      ),
    ),
    // Content
    loading
      ? React.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          React.createElement(Spin, {
            size: "large",
            tip: "正在加载计算引擎...",
          }),
        )
      : filteredEngines.length === 0
        ? React.createElement(Empty, {
            description: searchText ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始",
          })
        : React.createElement(
            Row,
            { gutter: [12, 12], align: "stretch" },
            ...filteredEngines.map((engine) =>
              React.createElement(
                Col,
                {
                  key: engine.id,
                  xs: 24,
                  sm: 12,
                  md: 8,
                  lg: 6,
                  style: { display: "flex" },
                },
                React.createElement(EngineCard, {
                  engine,
                  onClick: () => {
                    setActiveEngine(engine);
                    setDrawerOpen(true);
                  },
                }),
              ),
            ),
          ),
    // Detail drawer
    activeEngine
      ? React.createElement(
          Drawer,
          {
            title: React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              React.createElement(
                "span",
                { style: { display: "flex", alignItems: "center" } },
                ENGINE_ICON_IDS.has(activeEngine.id)
                  ? React.createElement("img", {
                      src: getEngineIconUrl(activeEngine.id),
                      alt: activeEngine.name,
                      style: { width: 20, height: 20, objectFit: "contain" },
                    })
                  : React.createElement(
                      "span",
                      { style: { fontSize: 18 } },
                      CATEGORY_ICONS[activeEngine.category] || "📦",
                    ),
              ),
              React.createElement("span", null, activeEngine.name),
            ),
            open: drawerOpen,
            onClose: () => setDrawerOpen(false),
            width: 520,
            extra: React.createElement(
              Space,
              null,
              React.createElement(
                Button,
                {
                  size: "small",
                  icon: EditOutlined
                    ? React.createElement(EditOutlined)
                    : undefined,
                  onClick: () => openEditModal(activeEngine),
                },
                "编辑",
              ),
              !activeEngine.is_default
                ? React.createElement(
                    Popconfirm,
                    {
                      title: "确认删除此引擎？",
                      description: activeEngine.name,
                      onConfirm: () => handleDelete(activeEngine.id),
                      okText: "删除",
                      cancelText: "取消",
                      okButtonProps: { danger: true },
                    },
                    React.createElement(
                      Button,
                      {
                        size: "small",
                        danger: true,
                        icon: DeleteOutlined
                          ? React.createElement(DeleteOutlined)
                          : undefined,
                      },
                      "删除",
                    ),
                  )
                : null,
            ),
          },
          React.createElement(
            Descriptions,
            { column: 1, bordered: true, size: "small" },
            React.createElement(
              Descriptions.Item,
              { label: "引擎名称" },
              activeEngine.name,
            ),
            React.createElement(
              Descriptions.Item,
              { label: "厂商" },
              activeEngine.vendor || "—",
            ),
            React.createElement(
              Descriptions.Item,
              { label: "分类" },
              activeEngine.category
                ? CATEGORY_LABELS[activeEngine.category] || activeEngine.category
                : "—",
            ),
            React.createElement(
              Descriptions.Item,
              { label: "状态" },
              React.createElement(
                Tag,
                {
                  color:
                    activeEngine.status === "detected"
                      ? "success"
                      : activeEngine.status === "not_found"
                        ? "error"
                        : "default",
                },
                activeEngine.status === "detected"
                  ? "✅ 已检测"
                  : activeEngine.status === "not_found"
                    ? "❌ 路径无效"
                    : "🔧 待配置",
              ),
            ),
            React.createElement(
              Descriptions.Item,
              { label: "版本" },
              activeEngine.version || "—",
            ),
            activeEngine.executable_path
              ? React.createElement(
                  Descriptions.Item,
                  { label: "可执行文件" },
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      },
                    },
                    React.createElement(
                      "code",
                      {
                        style: {
                          fontSize: 12,
                          wordBreak: "break-all",
                        },
                      },
                      activeEngine.executable_path,
                    ),
                    React.createElement(
                      Button,
                      {
                        size: "small",
                        type: "text",
                        icon: CopyOutlined
                          ? React.createElement(CopyOutlined)
                          : undefined,
                        onClick: () =>
                          handleCopyPath(activeEngine.executable_path),
                      },
                    ),
                  ),
                )
              : null,
            activeEngine.install_dir
              ? React.createElement(
                  Descriptions.Item,
                  { label: "安装目录" },
                  React.createElement(
                    "code",
                    { style: { fontSize: 12, wordBreak: "break-all" } },
                    activeEngine.install_dir,
                  ),
                )
              : null,
            // Display detected modules with paths
            activeEngine.modules && activeEngine.modules.length > 0
              ? React.createElement(
                  Descriptions.Item,
                  { label: "已检测模块" },
                  React.createElement(
                    "div",
                    { style: { display: "flex", flexDirection: "column", gap: 4 } },
                    ...activeEngine.modules.map((mod) =>
                      React.createElement(
                        "div",
                        {
                          key: mod,
                          style: { display: "flex", alignItems: "center", gap: 8 },
                        },
                        React.createElement(
                          Tag,
                          { color: "cyan", style: { fontSize: 11 } },
                          mod,
                        ),
                        activeEngine.module_paths && activeEngine.module_paths[mod]
                          ? React.createElement(
                              "code",
                              { style: { fontSize: 11, wordBreak: "break-all" } },
                              activeEngine.module_paths[mod],
                            )
                          : null,
                      ),
                    ),
                  ),
                )
              : null,
            activeEngine.license_server
              ? React.createElement(
                  Descriptions.Item,
                  { label: "许可证服务器" },
                  activeEngine.license_server,
                )
              : null,
            React.createElement(
              Descriptions.Item,
              { label: "描述" },
              activeEngine.description || "—",
            ),
          ),
          // Invocation hint
          activeEngine.invocation_hint
            ? React.createElement(
                "div",
                {
                  style: {
                    marginTop: 16,
                    padding: 12,
                    background: "#e6f4ff",
                    borderRadius: 8,
                  },
                },
                React.createElement(
                  Text,
                  { strong: true, style: { fontSize: 13 } },
                  "💡 调用方式",
                ),
                React.createElement(
                  "div",
                  { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
                  activeEngine.invocation_hint,
                ),
              )
            : null,
          // Type badge
          React.createElement(
            "div",
            { style: { marginTop: 12 } },
            activeEngine.is_default
              ? React.createElement(
                  Tag,
                  { color: "blue" },
                  "默认引擎",
                )
              : activeEngine.is_custom
                ? React.createElement(
                    Tag,
                    { color: "purple" },
                    "自定义引擎",
                  )
                : null,
          ),
        )
      : null,
    // Add/Edit modal
    React.createElement(
      Modal,
      {
        title: editingEngine ? "编辑引擎" : "添加计算引擎",
        open: editModalOpen,
        onOk: handleSave,
        onCancel: () => setEditModalOpen(false),
        okText: editingEngine ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: saving,
        width: 560,
      },
      React.createElement(
        "div",
        { style: { maxHeight: 480, overflow: "auto", paddingRight: 8 } },
        formField("引擎名称 *", "name"),
        formField("厂商", "vendor"),
        formField("版本", "version"),
        formField("可执行文件路径", "executable_path"),
        formField("安装目录", "install_dir"),
        formField("分类", "category", {
          select: {
            options: Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
              label,
              value,
            })),
          },
        }),
        formField("描述", "description", { textarea: true }),
        formField("调用方式提示", "invocation_hint", { textarea: true }),
        formField("许可证服务器", "license_server"),
      ),
    ),
  );
}

// ─── Capability Center Page (with tabs) ───────────────────────────────────────

function CapabilityCenterPage() {
  const React = getHost().React;
  const { useState, useEffect, useCallback, useMemo } = React;
  const {
    Spin,
    Empty,
    Input,
    Button,
    message: antdMsg,
    Row,
    Col,
    Drawer,
    Descriptions,
    Tag,
    Typography,
    List,
    Tabs,
    Modal,
  } = getHost().antd;
  const {
    ReloadOutlined,
    PlusOutlined,
    SearchOutlined,
    ApiOutlined,
    RocketOutlined,
    ToolOutlined,
    DeleteOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
  } = getHost().antdIcons || {};
  const { Text } = Typography;
  const { TextArea } = Input;

  // ── Agent context (mirror console /mcp page) ──
  const host = getHost();
  const useSelectedAgent = host.useSelectedAgent;
  const selectedAgentInfo = useSelectedAgent ? useSelectedAgent() : null;
  const currentAgentId = selectedAgentInfo?.id || "default";

  const [mcps, setMcps] = useState<MCPClientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeMCP, setActiveMCP] = useState<MCPClientInfo | null>(null);
  const [activeTab, setActiveTab] = useState("mcp");

  // ── Create modal state (mirror console /mcp create) ──
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createJson, setCreateJson] = useState(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`);
  const [creating, setCreating] = useState(false);

  // ── Delete modal state ──
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MCPClientInfo | null>(null);

  // ── Tools viewer modal state (mirror console /mcp tools) ──
  const [toolsModalOpen, setToolsModalOpen] = useState(false);
  const [toolsTarget, setToolsTarget] = useState<MCPClientInfo | null>(null);
  const [toolsList, setToolsList] = useState<any[]>([]);
  const [toolsLoading, setToolsLoading] = useState(false);
  const [toolsError, setToolsError] = useState("");

  const loadMCPs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAgentMCPClientsForCapabilities(currentAgentId);
      setMcps(data);
    } catch (err: any) {
      antdMsg.error(err.message || "加载 MCP 列表失败");
      setMcps([]);
    } finally {
      setLoading(false);
    }
  }, [currentAgentId]);

  useEffect(() => {
    loadMCPs();
  }, [loadMCPs]);

  // ── MCP CRUD handlers (mirror console /mcp page) ──
  const handleToggle = useCallback(
    async (mcp: MCPClientInfo) => {
      try {
        await toggleMCPClientForCapabilities(currentAgentId, mcp.key);
        antdMsg.success(mcp.enabled ? "已禁用" : "已启用");
        loadMCPs();
      } catch (err: any) {
        antdMsg.error(err.message || "切换状态失败");
      }
    },
    [currentAgentId, loadMCPs],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMCPClientForCapabilities(currentAgentId, deleteTarget.key);
      antdMsg.success(`MCP「${deleteTarget.key}」已删除`);
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      loadMCPs();
    } catch (err: any) {
      antdMsg.error(err.message || "删除失败");
    }
  }, [currentAgentId, deleteTarget, loadMCPs]);

  const handleCreate = useCallback(async () => {
    setCreating(true);
    try {
      const parsed = JSON.parse(createJson);
      const servers = parsed.mcpServers || parsed;
      const entries = Object.entries(servers);
      if (entries.length === 0) {
        antdMsg.warning("未找到 MCP 客户端配置");
        return;
      }
      let allSuccess = true;
      for (const [clientKey, cfg] of entries) {
        const clientCfg = cfg as Record<string, unknown>;
        const transport = clientCfg.url
          ? "streamable_http"
          : "stdio";
        const clientData = {
          name: (clientCfg.name as string) || clientKey,
          description: (clientCfg.description as string) || "",
          enabled: true,
          transport,
          url: (clientCfg.url as string) || "",
          command: (clientCfg.command as string) || "",
          args: clientCfg.args || [],
          env: clientCfg.env || {},
          cwd: (clientCfg.cwd as string) || "",
          headers: clientCfg.headers || {},
        };
        try {
          await createMCPClientForCapabilities(
            currentAgentId,
            clientKey,
            clientData,
          );
        } catch {
          allSuccess = false;
        }
      }
      if (allSuccess) {
        antdMsg.success("MCP 客户端已创建");
        setCreateModalOpen(false);
        loadMCPs();
      }
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        antdMsg.error("JSON 格式错误：" + err.message);
      } else {
        antdMsg.error(err.message || "创建 MCP 失败");
      }
    } finally {
      setCreating(false);
    }
  }, [createJson, currentAgentId, loadMCPs]);

  const handleViewTools = useCallback(
    async (mcp: MCPClientInfo) => {
      setToolsTarget(mcp);
      setToolsModalOpen(true);
      setToolsList([]);
      setToolsError("");
      setToolsLoading(true);
      try {
        const tools = await listMCPToolsForCapabilities(
          currentAgentId,
          mcp.key,
        );
        setToolsList(tools);
      } catch (err: any) {
        setToolsError(
          err.message || "无法加载工具列表（MCP 服务可能未运行）",
        );
      } finally {
        setToolsLoading(false);
      }
    },
    [currentAgentId],
  );

  const filteredMCPs = useMemo(() => {
    if (!searchText.trim()) return mcps;
    const q = searchText.toLowerCase();
    return mcps.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.key.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.transport.toLowerCase().includes(q),
    );
  }, [mcps, searchText]);

  const enabledCount = mcps.filter((m) => m.enabled).length;
  const totalTools = mcps.reduce((sum, m) => sum + (m.tools?.length || 0), 0);

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  // ── MCP Tab Content ──
  const mcpTabContent = React.createElement(
    React.Fragment,
    null,
    React.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
        },
      },
      React.createElement(Input, {
        placeholder: "搜索能力名称、描述...",
        prefix: SearchOutlined
          ? React.createElement(SearchOutlined)
          : undefined,
        value: searchText,
        onChange: (e: any) => setSearchText(e.target.value),
        allowClear: true,
        style: { maxWidth: 400 },
      }),
      React.createElement(
        Button,
        {
          type: "primary",
          icon: PlusOutlined ? React.createElement(PlusOutlined) : undefined,
          onClick: () => setCreateModalOpen(true),
          style: PRIMARY_BTN_STYLE,
        },
        "添加 MCP",
      ),
    ),
    loading
      ? React.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          React.createElement(Spin, { size: "large" }),
        )
      : filteredMCPs.length === 0
        ? React.createElement(Empty, {
            description: searchText
              ? "未找到匹配的能力"
              : "暂无 MCP 客户端，点击「添加 MCP」创建",
          })
        : React.createElement(
            Row,
            { gutter: [12, 12], align: "stretch" },
            ...filteredMCPs.map((mcp) =>
              React.createElement(
                Col,
                {
                  key: mcp.key,
                  xs: 24,
                  sm: 12,
                  md: 8,
                  lg: 6,
                  style: { display: "flex" },
                },
                React.createElement(CapabilityCard, {
                  mcp,
                  onClick: () => {
                    setActiveMCP(mcp);
                    setDrawerOpen(true);
                  },
                  onToggle: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleToggle(mcp);
                  },
                  onDelete: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    setDeleteTarget(mcp);
                    setDeleteModalOpen(true);
                  },
                  onViewTools: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleViewTools(mcp);
                  },
                }),
              ),
            ),
          ),
  );

  const tabItems = [
    {
      key: "mcp",
      label: React.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        ApiOutlined
          ? React.createElement(ApiOutlined, { style: { fontSize: 14 } })
          : null,
        "MCP 客户端",
      ),
      children: mcpTabContent,
    },
    {
      key: "software",
      label: React.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        RocketOutlined
          ? React.createElement(RocketOutlined, { style: { fontSize: 14 } })
          : null,
        "计算引擎",
      ),
      children: React.createElement(EngineSection),
    },
  ];

  return React.createElement(
    "div",
    { style: { padding: 24 } },
    React.createElement(PageHeader, {
      title: "工具",
      subtitle: `MCP: ${mcps.length} 个客户端（${enabledCount} 个启用）· ${totalTools} 个工具`,
      extra: React.createElement(
        React.Fragment,
        null,
        React.createElement(
          Button,
          {
            icon: ReloadOutlined
              ? React.createElement(ReloadOutlined)
              : undefined,
            onClick: () => { clearApiCache(); loadMCPs(); },
            loading,
          },
          "刷新",
        ),
      ),
    }),
    React.createElement(Tabs, {
      items: tabItems,
      activeKey: activeTab,
      onChange: (k: string) => setActiveTab(k),
    }),
    // MCP Detail drawer
    activeMCP
      ? React.createElement(
          Drawer,
          {
            title: React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              React.createElement("span", { style: { fontSize: 18 } }, "🔌"),
              React.createElement(
                "span",
                null,
                activeMCP.name || activeMCP.key,
              ),
            ),
            open: drawerOpen,
            onClose: () => setDrawerOpen(false),
            width: 480,
          },
          React.createElement(
            Descriptions,
            { column: 1, bordered: true, size: "small" },
            React.createElement(
              Descriptions.Item,
              { label: "Key" },
              React.createElement(
                "code",
                { style: { fontSize: 12 } },
                activeMCP.key,
              ),
            ),
            React.createElement(
              Descriptions.Item,
              { label: "名称" },
              activeMCP.name || "-",
            ),
            React.createElement(
              Descriptions.Item,
              { label: "描述" },
              activeMCP.description || "-",
            ),
            React.createElement(
              Descriptions.Item,
              { label: "状态" },
              React.createElement(
                Tag,
                { color: activeMCP.enabled ? "green" : "default" },
                activeMCP.enabled ? "启用" : "停用",
              ),
            ),
            React.createElement(
              Descriptions.Item,
              { label: "传输方式" },
              activeMCP.transport,
            ),
            activeMCP.url
              ? React.createElement(
                  Descriptions.Item,
                  { label: "URL" },
                  activeMCP.url,
                )
              : null,
            activeMCP.command
              ? React.createElement(
                  Descriptions.Item,
                  { label: "命令" },
                  React.createElement(
                    "code",
                    { style: { fontSize: 11 } },
                    activeMCP.command,
                  ),
                )
              : null,
            activeMCP.args && activeMCP.args.length > 0
              ? React.createElement(
                  Descriptions.Item,
                  { label: "参数" },
                  activeMCP.args.join(" "),
                )
              : null,
          ),
          activeMCP.tools && activeMCP.tools.length > 0
            ? React.createElement(
                "div",
                { style: { marginTop: 16 } },
                React.createElement(
                  Text,
                  {
                    strong: true,
                    style: { display: "block", marginBottom: 8 },
                  },
                  "提供的工具",
                ),
                React.createElement(List, {
                  size: "small",
                  dataSource: activeMCP.tools,
                  renderItem: (tool: string) =>
                    React.createElement(
                      List.Item,
                      null,
                      React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          },
                        },
                        ApiOutlined
                          ? React.createElement(ApiOutlined, {
                              style: { fontSize: 12, color: "#1677ff" },
                            })
                          : null,
                        React.createElement(
                          Text,
                          { style: { fontSize: 12 } },
                          tool,
                        ),
                      ),
                    ),
                }),
              )
            : React.createElement(
                "div",
                { style: { marginTop: 16, fontSize: 12, color: "#8c8c8c" } },
                "此 MCP 客户端未设置工具白名单（所有工具均可用）",
              ),
        )
      : null,
    // ── Create MCP Modal (mirror console /mcp JSON import) ──
    React.createElement(
      Modal,
      {
        title: "添加 MCP 客户端 (JSON)",
        open: createModalOpen,
        onCancel: () => setCreateModalOpen(false),
        onOk: handleCreate,
        confirmLoading: creating,
        okText: "创建",
        cancelText: "取消",
        width: 700,
      },
      React.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "支持格式: ",
        React.createElement("code", null, '{ "mcpServers": { "key": {...} } }'),
        " 或 ",
        React.createElement("code", null, '{ "key": {...} }'),
      ),
      React.createElement(TextArea, {
        value: createJson,
        onChange: (e: any) => setCreateJson(e.target.value),
        autoSize: { minRows: 12, maxRows: 20 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 },
      }),
    ),
    // ── Delete Confirmation Modal ──
    React.createElement(
      Modal,
      {
        title: "确认删除",
        open: deleteModalOpen,
        onOk: handleDelete,
        onCancel: () => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        },
        okText: "确认删除",
        cancelText: "取消",
        okButtonProps: { danger: true },
      },
      React.createElement(
        "p",
        null,
        `确定要删除 MCP 客户端「${deleteTarget?.name || deleteTarget?.key}」吗？此操作不可撤销。`,
      ),
    ),
    // ── Tools Viewer Modal (mirror console /mcp tools) ──
    React.createElement(
      Modal,
      {
        title: toolsTarget
          ? `${toolsTarget.name || toolsTarget.key} - 工具列表`
          : "工具列表",
        open: toolsModalOpen,
        onCancel: () => {
          setToolsModalOpen(false);
          setToolsTarget(null);
        },
        footer: React.createElement(
          Button,
          { onClick: () => setToolsModalOpen(false) },
          "关闭",
        ),
        width: 640,
      },
      toolsLoading
        ? React.createElement(
            "div",
            { style: { textAlign: "center", padding: 40 } },
            React.createElement(Spin, { size: "large" }),
          )
        : toolsError
          ? React.createElement(
              "div",
              { style: { color: "#ff4d4f", padding: 16 } },
              toolsError,
            )
          : toolsList.length === 0
            ? React.createElement(Empty, {
                description: "此 MCP 客户端暂无可用工具（可能服务未启动）",
              })
            : React.createElement(List, {
                size: "small",
                dataSource: toolsList,
                renderItem: (tool: any) =>
                  React.createElement(
                    List.Item,
                    null,
                    React.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        },
                      },
                      React.createElement(
                        "div",
                        { style: { display: "flex", alignItems: "center", gap: 6 } },
                        ApiOutlined
                          ? React.createElement(ApiOutlined, {
                              style: { fontSize: 12, color: "#1677ff" },
                            })
                          : null,
                        React.createElement(
                          Text,
                          { strong: true, style: { fontSize: 13 } },
                          tool.name || tool.key,
                        ),
                      ),
                      tool.description
                        ? React.createElement(
                            Text,
                            { type: "secondary", style: { fontSize: 12 } },
                            tool.description,
                          )
                        : null,
                    ),
                  ),
              }),
    ),
  );
}

// ─── Skill Center Page ────────────────────────────────────────────────────────

/** Skills loaded by the currently selected agent (Tab 1). */
function CurrentAgentSkillsTab({
  agentId,
  agentName,
  onNavigate,
}: {
  agentId: string;
  agentName: string;
  onNavigate: (path: string) => void;
}) {
  const React = getHost().React;
  const { useState, useEffect, useCallback } = React;
  const {
    Spin,
    Empty,
    Button,
    Row,
    Col,
    Card,
    Tag,
    Checkbox,
    Modal,
    Typography,
    Drawer,
    Descriptions,
    message: antdMsg,
  } = getHost().antd;
  const {
    ReloadOutlined,
    ThunderboltOutlined,
    SettingOutlined,
    CheckSquareOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    DeleteOutlined,
    CloseOutlined,
  } = getHost().antdIcons || {};
  const { Text, Paragraph } = Typography;

  const [skills, setSkills] = useState<SkillSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSkill, setActiveSkill] = useState<SkillSpec | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(
    new Set(),
  );
  const [batchLoading, setBatchLoading] = useState(false);

  const loadSkills = useCallback(async () => {
    if (!agentId) return;
    setLoading(true);
    try {
      const data = await fetchAgentSkills(agentId);
      setSkills(data);
    } catch (err: any) {
      antdMsg.error(err.message || "加载技能失败");
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  // ── Batch helpers ─────────────────────────────────────────────────────────
  const toggleSelect = (name: string) => {
    setSelectedSkills((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const clearSelection = () => setSelectedSkills(new Set());

  const selectAll = () =>
    setSelectedSkills(new Set(skills.map((s) => s.name)));

  const toggleBatchMode = () => {
    if (batchMode) {
      clearSelection();
      setBatchMode(false);
    } else {
      setBatchMode(true);
    }
  };

  const handleBatchEnable = async () => {
    const names = Array.from(selectedSkills);
    if (names.length === 0) return;
    setBatchLoading(true);
    try {
      const { results } = await batchEnableSkillsForAgent(agentId, names);
      const failed = Object.entries(results).filter(
        ([, r]) => r.success === false,
      );
      const succeeded = names.length - failed.length;
      if (failed.length > 0) {
        antdMsg.warning(
          `批量启用完成：成功 ${succeeded} 个，失败 ${failed.length} 个`,
        );
      } else {
        antdMsg.success(`成功启用 ${names.length} 个技能`);
      }
      clearSelection();
      await loadSkills();
    } catch (err: any) {
      antdMsg.error(err.message || "批量启用失败");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleBatchDisable = async () => {
    const names = Array.from(selectedSkills);
    if (names.length === 0) return;
    setBatchLoading(true);
    try {
      const { results } = await batchDisableSkillsForAgent(agentId, names);
      const failed = Object.entries(results).filter(
        ([, r]) => r.success === false,
      );
      const succeeded = names.length - failed.length;
      if (failed.length > 0) {
        antdMsg.warning(
          `批量停用完成：成功 ${succeeded} 个，失败 ${failed.length} 个`,
        );
      } else {
        antdMsg.success(`成功停用 ${names.length} 个技能`);
      }
      clearSelection();
      await loadSkills();
    } catch (err: any) {
      antdMsg.error(err.message || "批量停用失败");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleBatchDelete = () => {
    const names = Array.from(selectedSkills);
    if (names.length === 0) return;
    Modal.confirm({
      title: `确认删除 ${names.length} 个技能？`,
      content:
        "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: async () => {
        setBatchLoading(true);
        try {
          const { results } = await batchDeleteSkillsForAgent(agentId, names);
          const failed = Object.entries(results).filter(
            ([, r]) => r.success === false,
          );
          const succeeded = names.length - failed.length;
          if (failed.length > 0) {
            antdMsg.warning(
              `批量删除完成：成功 ${succeeded} 个，失败 ${failed.length} 个`,
            );
          } else {
            antdMsg.success(`成功删除 ${names.length} 个技能`);
          }
          clearSelection();
          await loadSkills();
        } catch (err: any) {
          antdMsg.error(err.message || "批量删除失败");
        } finally {
          setBatchLoading(false);
        }
      },
    });
  };

  return React.createElement(
    "div",
    null,
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8,
        },
      },
      React.createElement(
        Text,
        { type: "secondary", style: { fontSize: 13 } },
        batchMode
          ? `已选择 ${selectedSkills.size} / ${skills.length} 个技能`
          : `共 ${skills.length} 个技能`,
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        batchMode
          ? React.createElement(
              React.Fragment,
              null,
              React.createElement(
                Button,
                { size: "small", onClick: selectAll },
                "全选",
              ),
              React.createElement(
                Button,
                {
                  size: "small",
                  icon: CloseOutlined
                    ? React.createElement(CloseOutlined)
                    : undefined,
                  onClick: clearSelection,
                },
                "取消选择",
              ),
              React.createElement(
                Button,
                {
                  size: "small",
                  type: "default",
                  icon: EyeOutlined
                    ? React.createElement(EyeOutlined)
                    : undefined,
                  disabled: selectedSkills.size === 0 || batchLoading,
                  loading: batchLoading,
                  onClick: handleBatchEnable,
                },
                "批量启用",
              ),
              React.createElement(
                Button,
                {
                  size: "small",
                  danger: true,
                  icon: EyeInvisibleOutlined
                    ? React.createElement(EyeInvisibleOutlined)
                    : undefined,
                  disabled: selectedSkills.size === 0 || batchLoading,
                  loading: batchLoading,
                  onClick: handleBatchDisable,
                },
                "批量停用",
              ),
              React.createElement(
                Button,
                {
                  size: "small",
                  danger: true,
                  icon: DeleteOutlined
                    ? React.createElement(DeleteOutlined)
                    : undefined,
                  disabled: selectedSkills.size === 0 || batchLoading,
                  loading: batchLoading,
                  onClick: handleBatchDelete,
                },
                `删除 (${selectedSkills.size})`,
              ),
              React.createElement(
                Button,
                {
                  size: "small",
                  type: "primary",
                  onClick: toggleBatchMode,
                },
                "退出批量",
              ),
            )
          : React.createElement(
              React.Fragment,
              null,
              React.createElement(
                Button,
                {
                  size: "small",
                  icon: CheckSquareOutlined
                    ? React.createElement(CheckSquareOutlined)
                    : undefined,
                  onClick: toggleBatchMode,
                  disabled: skills.length === 0,
                },
                "批量管理",
              ),
              React.createElement(
                Button,
                {
                  icon: ReloadOutlined
                    ? React.createElement(ReloadOutlined)
                    : undefined,
                  onClick: () => { clearApiCache(); loadSkills(); },
                },
                "刷新",
              ),
            ),
      ),
    ),
    loading
      ? React.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          React.createElement(Spin, { size: "large" }),
        )
      : skills.length === 0
        ? React.createElement(Empty, {
            description: "当前智能体未加载任何技能",
          })
        : React.createElement(
            Row,
            { gutter: [12, 12] },
            ...skills.map((skill) =>
              React.createElement(
                Col,
                { key: skill.name, xs: 24, sm: 12, md: 8, lg: 6 },
                React.createElement(
                  Card,
                  {
                    hoverable: true,
                    size: "small",
                    style: {
                      cursor: batchMode ? "default" : "pointer",
                      height: "100%",
                      position: "relative",
                      borderColor:
                        batchMode && selectedSkills.has(skill.name)
                          ? "#0072f5"
                          : undefined,
                      borderWidth:
                        batchMode && selectedSkills.has(skill.name)
                          ? 2
                          : 1,
                    },
                    onClick: () => {
                      if (batchMode) {
                        toggleSelect(skill.name);
                      } else {
                        setActiveSkill(skill);
                        setDrawerOpen(true);
                      }
                    },
                  },
                  batchMode
                    ? React.createElement(
                        "div",
                        {
                          style: {
                            position: "absolute",
                            top: 8,
                            right: 8,
                            zIndex: 1,
                          },
                          onClick: (e: any) => {
                            e.stopPropagation();
                            toggleSelect(skill.name);
                          },
                        },
                        React.createElement(Checkbox, {
                          checked: selectedSkills.has(skill.name),
                        }),
                      )
                    : null,
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      },
                    },
                    skill.emoji
                      ? React.createElement(
                          "span",
                          { style: { fontSize: 18 } },
                          skill.emoji,
                        )
                      : React.createElement(
                          "span",
                          { style: { fontSize: 18 } },
                          "⚡",
                        ),
                    React.createElement(
                      Text,
                      {
                        strong: true,
                        style: {
                          fontSize: 13,
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        },
                      },
                      skill.name,
                    ),
                    skill.enabled === false
                      ? React.createElement(
                          Tag,
                          { color: "default", style: { fontSize: 10 } },
                          "已禁用",
                        )
                      : React.createElement(
                          Tag,
                          { color: "green", style: { fontSize: 10 } },
                          "已启用",
                        ),
                  ),
                  skill.description
                    ? React.createElement(
                        Paragraph,
                        {
                          type: "secondary",
                          style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                          ellipsis: { rows: 2 },
                        },
                        skill.description,
                      )
                    : null,
                  React.createElement(
                    "div",
                    {
                      style: {
                        marginTop: 8,
                        display: "flex",
                        gap: 4,
                        flexWrap: "wrap",
                      },
                    },
                    skill.version_text
                      ? React.createElement(
                          Tag,
                          { style: { fontSize: 10 } },
                          `v${skill.version_text}`,
                        )
                      : null,
                    ...(skill.tags || [])
                      .slice(0, 3)
                      .map((tag, i) =>
                        React.createElement(
                          Tag,
                          { key: i, color: "blue", style: { fontSize: 10 } },
                          tag,
                        ),
                      ),
                  ),
                ),
              ),
            ),
          ),
    // Skill detail drawer
    activeSkill
      ? React.createElement(
          Drawer,
          {
            title: React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              React.createElement(
                "span",
                { style: { fontSize: 18 } },
                activeSkill.emoji || "⚡",
              ),
              React.createElement("span", null, activeSkill.name),
            ),
            open: drawerOpen,
            onClose: () => setDrawerOpen(false),
            width: 520,
            extra: React.createElement(
              Button,
              {
                type: "primary",
                size: "small",
                icon: SettingOutlined
                  ? React.createElement(SettingOutlined)
                  : undefined,
                onClick: () => onNavigate("/skills"),
              },
              "管理技能",
            ),
          },
          React.createElement(
            Descriptions,
            { column: 1, bordered: true, size: "small" },
            React.createElement(
              Descriptions.Item,
              { label: "技能名称" },
              activeSkill.name,
            ),
            React.createElement(
              Descriptions.Item,
              { label: "描述" },
              activeSkill.description || "-",
            ),
            activeSkill.version_text
              ? React.createElement(
                  Descriptions.Item,
                  { label: "版本" },
                  activeSkill.version_text,
                )
              : null,
            React.createElement(
              Descriptions.Item,
              { label: "来源" },
              activeSkill.source || "-",
            ),
            React.createElement(
              Descriptions.Item,
              { label: "状态" },
              activeSkill.enabled === false ? "已禁用" : "已启用",
            ),
            activeSkill.installed_from
              ? React.createElement(
                  Descriptions.Item,
                  { label: "安装来源" },
                  activeSkill.installed_from,
                )
              : null,
          ),
          // Tags
          activeSkill.tags && activeSkill.tags.length > 0
            ? React.createElement(
                "div",
                { style: { marginTop: 16 } },
                React.createElement(
                  Text,
                  {
                    strong: true,
                    style: { display: "block", marginBottom: 8 },
                  },
                  "标签",
                ),
                React.createElement(
                  "div",
                  { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
                  ...activeSkill.tags.map((tag, i) =>
                    React.createElement(Tag, { key: i, color: "blue" }, tag),
                  ),
                ),
              )
            : null,
          // Skill content preview
          activeSkill.content
            ? React.createElement(
                "div",
                { style: { marginTop: 16 } },
                React.createElement(
                  Text,
                  {
                    strong: true,
                    style: { display: "block", marginBottom: 8 },
                  },
                  "技能内容",
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      maxHeight: 300,
                      overflow: "auto",
                      padding: 12,
                      background: "#f5f5f5",
                      borderRadius: 6,
                      fontSize: 12,
                      whiteSpace: "pre-wrap",
                    },
                  },
                  activeSkill.content.slice(0, 2000) +
                    (activeSkill.content.length > 2000
                      ? "\n\n... (内容已截断)"
                      : ""),
                ),
              )
            : null,
        )
      : null,
  );
}

/** Skill pool tab — the original skill center content (Tab 2). */
function SkillPoolTab({
  poolSkills,
  workspaceSkills,
  agents,
  loading,
  onReload,
}: {
  poolSkills: PoolSkillSpec[];
  workspaceSkills: WorkspaceSkillSummary[];
  agents: AgentSummary[];
  loading: boolean;
  onReload: () => void;
}) {
  const React = getHost().React;
  const { useState, useMemo, useCallback } = React;
  const {
    Spin,
    Empty,
    Input,
    Button,
    Row,
    Col,
    Card,
    Tag,
    Typography,
    Drawer,
    Descriptions,
    List,
  } = getHost().antd;
  const {
    ReloadOutlined,
    SearchOutlined,
    DownloadOutlined,
    ThunderboltOutlined,
  } = getHost().antdIcons || {};
  const { Text, Paragraph } = Typography;

  const [searchText, setSearchText] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSkill, setActiveSkill] = useState<PoolSkillSpec | null>(null);
  const [installedAgents, setInstalledAgents] = useState<string[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(24);

  const filteredSkills = useMemo(() => {
    if (!searchText.trim()) return poolSkills;
    const q = searchText.toLowerCase();
    return poolSkills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.tags?.some((t) => t.toLowerCase().includes(q)),
    );
  }, [poolSkills, searchText]);

  const visibleSkills = useMemo(
    () => filteredSkills.slice(0, displayCount),
    [filteredSkills, displayCount],
  );

  const handleSearchChange = useCallback((val: string) => {
    setSearchText(val);
    setDisplayCount(24);
  }, []);

  const computeInstalledAgents = useCallback(
    (skillName: string): string[] => {
      const result: string[] = [];
      for (const ws of workspaceSkills) {
        if (ws.skills.some((s) => s.name === skillName)) {
          const agent = agents.find((a) => a.id === ws.agent_id);
          result.push(agent?.name || ws.agent_name || ws.agent_id);
        }
      }
      return result;
    },
    [workspaceSkills, agents],
  );

  const handleCardClick = useCallback(
    async (skill: PoolSkillSpec) => {
      setActiveSkill(skill);
      setInstalledAgents(computeInstalledAgents(skill.name));
      setDrawerOpen(true);
      // Lazy-load full content if not already present
      if (!skill.content) {
        setContentLoading(true);
        try {
          const content = await fetchPoolSkillContent(skill.name);
          setActiveSkill({ ...skill, content });
        } catch {
          // keep empty content on error
        } finally {
          setContentLoading(false);
        }
      }
    },
    [computeInstalledAgents],
  );

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return React.createElement(
    "div",
    null,
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        },
      },
      React.createElement(Input, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: SearchOutlined
          ? React.createElement(SearchOutlined)
          : undefined,
        value: searchText,
        onChange: (e: any) => handleSearchChange(e.target.value),
        allowClear: true,
        style: { maxWidth: 400 },
      }),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        React.createElement(
          Button,
          {
            icon: ReloadOutlined
              ? React.createElement(ReloadOutlined)
              : undefined,
            onClick: onReload,
            loading,
            size: "small",
          },
          "刷新",
        ),
        React.createElement(
          Button,
          {
            type: "primary",
            icon: DownloadOutlined
              ? React.createElement(DownloadOutlined)
              : undefined,
            onClick: () => navigateTo("/skill-pool"),
            size: "small",
            style: PRIMARY_BTN_STYLE,
          },
          "管理技能池",
        ),
      ),
    ),
    loading
      ? React.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          React.createElement(Spin, { size: "large" }),
        )
      : filteredSkills.length === 0
        ? React.createElement(Empty, {
            description: searchText ? "未找到匹配的技能" : "技能池为空",
          })
        : React.createElement(
            React.Fragment,
            null,
            React.createElement(
              Row,
              { gutter: [12, 12] },
              ...visibleSkills.map((skill) =>
                React.createElement(
                  Col,
                  { key: skill.name, xs: 24, sm: 12, md: 8, lg: 6 },
                  React.createElement(
                    Card,
                    {
                      hoverable: true,
                      size: "small",
                      style: { cursor: "pointer", height: "100%" },
                      onClick: () => handleCardClick(skill),
                    },
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      },
                    },
                    skill.emoji
                      ? React.createElement(
                          "span",
                          { style: { fontSize: 18 } },
                          skill.emoji,
                        )
                      : React.createElement(
                          "span",
                          { style: { fontSize: 18 } },
                          "⚡",
                        ),
                    React.createElement(
                      Text,
                      {
                        strong: true,
                        style: {
                          fontSize: 13,
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        },
                      },
                      skill.name,
                    ),
                    skill.protected
                      ? React.createElement(
                          Tag,
                          { color: "gold", style: { fontSize: 10 } },
                          "内置",
                        )
                      : null,
                  ),
                  skill.description
                    ? React.createElement(
                        Paragraph,
                        {
                          type: "secondary",
                          style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                          ellipsis: { rows: 2 },
                        },
                        skill.description,
                      )
                    : null,
                  React.createElement(
                    "div",
                    {
                      style: {
                        marginTop: 8,
                        display: "flex",
                        gap: 4,
                        flexWrap: "wrap",
                      },
                    },
                    skill.version_text
                      ? React.createElement(
                          Tag,
                          { style: { fontSize: 10 } },
                          `v${skill.version_text}`,
                        )
                      : null,
                    ...(skill.tags || [])
                      .slice(0, 3)
                      .map((tag, i) =>
                        React.createElement(
                          Tag,
                          { key: i, color: "cyan", style: { fontSize: 10 } },
                          tag,
                        ),
                      ),
                  ),
                ),
              ),
            ),
            // Load more button
            visibleSkills.length < filteredSkills.length
              ? React.createElement(
                  "div",
                  { style: { textAlign: "center", marginTop: 16 } },
                  React.createElement(
                    Button,
                    {
                      onClick: () => setDisplayCount((c: number) => c + 24),
                      size: "small",
                    },
                    `加载更多 (剩余 ${filteredSkills.length - visibleSkills.length} 个)`,
                  ),
                )
              : null,
          ),
        ),
    // Skill detail drawer
    activeSkill
      ? React.createElement(
          Drawer,
          {
            title: React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              React.createElement(
                "span",
                { style: { fontSize: 18 } },
                activeSkill.emoji || "⚡",
              ),
              React.createElement("span", null, activeSkill.name),
            ),
            open: drawerOpen,
            onClose: () => setDrawerOpen(false),
            width: 520,
            extra: React.createElement(
              Button,
              {
                type: "primary",
                size: "small",
                icon: ThunderboltOutlined
                  ? React.createElement(ThunderboltOutlined)
                  : undefined,
                onClick: () => navigateTo("/skills"),
              },
              "管理技能",
            ),
          },
          React.createElement(
            Descriptions,
            { column: 1, bordered: true, size: "small" },
            React.createElement(
              Descriptions.Item,
              { label: "技能名称" },
              activeSkill.name,
            ),
            React.createElement(
              Descriptions.Item,
              { label: "描述" },
              activeSkill.description || "-",
            ),
            activeSkill.version_text
              ? React.createElement(
                  Descriptions.Item,
                  { label: "版本" },
                  activeSkill.version_text,
                )
              : null,
            React.createElement(
              Descriptions.Item,
              { label: "来源" },
              activeSkill.source || "-",
            ),
            React.createElement(
              Descriptions.Item,
              { label: "受保护" },
              activeSkill.protected ? "是（内置）" : "否",
            ),
            activeSkill.sync_status
              ? React.createElement(
                  Descriptions.Item,
                  { label: "同步状态" },
                  activeSkill.sync_status,
                )
              : null,
            activeSkill.installed_from
              ? React.createElement(
                  Descriptions.Item,
                  { label: "安装来源" },
                  activeSkill.installed_from,
                )
              : null,
          ),
          // Tags
          activeSkill.tags && activeSkill.tags.length > 0
            ? React.createElement(
                "div",
                { style: { marginTop: 16 } },
                React.createElement(
                  Text,
                  {
                    strong: true,
                    style: { display: "block", marginBottom: 8 },
                  },
                  "标签",
                ),
                React.createElement(
                  "div",
                  { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
                  ...activeSkill.tags.map((tag, i) =>
                    React.createElement(Tag, { key: i, color: "cyan" }, tag),
                  ),
                ),
              )
            : null,
          // Installed agents
          React.createElement(
            "div",
            { style: { marginTop: 16 } },
            React.createElement(
              Text,
              { strong: true, style: { display: "block", marginBottom: 8 } },
              `已安装此技能的专家 (${installedAgents.length})`,
            ),
            installedAgents.length > 0
              ? React.createElement(List, {
                  size: "small",
                  dataSource: installedAgents,
                  renderItem: (agentName: string) =>
                    React.createElement(
                      List.Item,
                      null,
                      React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          },
                        },
                        React.createElement(ExpertAvatar, { name: agentName, size: 20 }),
                        React.createElement(
                          Text,
                          { style: { fontSize: 13 } },
                          agentName,
                        ),
                      ),
                    ),
                })
              : React.createElement(
                  Text,
                  { type: "secondary", style: { fontSize: 12 } },
                  "暂无专家安装此技能",
                ),
          ),
          // Skill content preview (lazy-loaded)
          contentLoading
            ? React.createElement(
                "div",
                { style: { marginTop: 16, textAlign: "center" } },
                React.createElement(Spin, { size: "small" }),
              )
            : activeSkill.content
              ? React.createElement(
                  "div",
                  { style: { marginTop: 16 } },
                  React.createElement(
                    Text,
                    {
                      strong: true,
                      style: { display: "block", marginBottom: 8 },
                    },
                    "技能内容",
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        maxHeight: 300,
                        overflow: "auto",
                        padding: 12,
                        background: "#f5f5f5",
                        borderRadius: 6,
                        fontSize: 12,
                        whiteSpace: "pre-wrap",
                      },
                    },
                    activeSkill.content.slice(0, 2000) +
                      (activeSkill.content.length > 2000
                        ? "\n\n... (内容已截断)"
                        : ""),
                  ),
                )
              : null,
        )
      : null,
  );
}

function SkillCenterPage() {
  const React = getHost().React;
  const { useState, useEffect, useCallback, useMemo } = React;
  const { Tabs, message: antdMsg } = getHost().antd;
  const { ThunderboltOutlined, AppstoreOutlined } =
    getHost().antdIcons || {};

  // Track the currently selected agent via the host hook
  const host = getHost();
  const useSelectedAgent = host.useSelectedAgent;
  const selectedAgentInfo = useSelectedAgent ? useSelectedAgent() : null;
  const currentAgentId = selectedAgentInfo?.id || "default";

  // Also fetch agent list to resolve names
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [poolSkills, setPoolSkills] = useState<PoolSkillSpec[]>([]);
  const [workspaceSkills, setWorkspaceSkills] = useState<
    WorkspaceSkillSummary[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("agent-skills");

  const loadPoolData = useCallback(async () => {
    setLoading(true);
    try {
      const [pool, agentList, wsSkills] = await Promise.all([
        fetchPoolSkills(true),
        fetchAgents(),
        fetchWorkspaceSkills(),
      ]);
      setPoolSkills(pool);
      setAgents(agentList);
      setWorkspaceSkills(wsSkills);
    } catch (err: any) {
      antdMsg.error(err.message || "加载技能列表失败");
      setPoolSkills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPoolData();
  }, [loadPoolData]);

  const currentAgentName = useMemo(() => {
    const agent = agents.find((a) => a.id === currentAgentId);
    return agent?.name || currentAgentId;
  }, [agents, currentAgentId]);

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const tabItems = [
    {
      key: "agent-skills",
      label: React.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        ThunderboltOutlined
          ? React.createElement(ThunderboltOutlined, { style: { fontSize: 14 } })
          : null,
        "当前Agent加载技能",
      ),
      children: React.createElement(CurrentAgentSkillsTab, {
        agentId: currentAgentId,
        agentName: currentAgentName,
        onNavigate: navigateTo,
      }),
    },
    {
      key: "skill-pool",
      label: React.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        AppstoreOutlined
          ? React.createElement(AppstoreOutlined, { style: { fontSize: 14 } })
          : null,
        "技能池",
      ),
      children: React.createElement(SkillPoolTab, {
        poolSkills,
        workspaceSkills,
        agents,
        loading,
        onReload: loadPoolData,
      }),
    },
  ];

  return React.createElement(
    "div",
    { style: { padding: 24 } },
    React.createElement(PageHeader, {
      title: "技能",
      subtitle: `技能池共 ${poolSkills.length} 个技能 · 当前智能体：${currentAgentName}`,
    }),
    React.createElement(Tabs, {
      items: tabItems,
      activeKey: activeTab,
      onChange: (k: string) => setActiveTab(k),
    }),
  );
}

// ─── Marketplace Page ────────────────────────────────────────────────────────

interface MarketResult {
  source: string;
  slug: string;
  name: string;
  description: string | null;
  source_url: string;
  version: string | null;
  author: string | null;
  icon_url: string | null;
  stats: Record<string, string | number> | null;
}

// ─── GitHub Skill Source: types & helpers ────────────────────────────────────

interface GitHubSkillSource {
  id: string;
  url: string;
  label: string;
  owner: string;
  repo: string;
  ref: string;
  skillsPath: string;
  enabled: boolean;
}

interface GitHubSkill {
  sourceId: string;
  sourceLabel: string;
  name: string;
  description: string;
  source_url: string;
  html_url: string;
  version: string | null;
  author: string | null;
}

const UGSCI_GITHUB_SOURCES_KEY = "ugsci.market.githubSources";
const DEFAULT_GITHUB_SOURCE_URL =
  "https://github.com/anthropics/skills/tree/main/skills";

// ─── MCP / Expert Source: types & helpers ─────────────────────────────────────

interface GenericSource {
  id: string;
  label: string;
  url: string;
  enabled: boolean;
  type: "mcp" | "expert";
}

const UGSCI_MCP_SOURCES_KEY = "ugsci.market.mcpSources";
const UGSCI_EXPERT_SOURCES_KEY = "ugsci.market.expertSources";

function loadGenericSources(
  storageKey: string,
  type: "mcp" | "expert",
): GenericSource[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s: any) =>
        s &&
        typeof s.id === "string" &&
        typeof s.label === "string" &&
        typeof s.url === "string",
    ).map((s: any) => ({
      id: s.id,
      label: s.label,
      url: s.url,
      enabled: s.enabled !== false,
      type,
    }));
  } catch {
    return [];
  }
}

function saveGenericSources(
  storageKey: string,
  sources: GenericSource[],
): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(sources));
  } catch {}
}

function loadMcpSources(): GenericSource[] {
  return loadGenericSources(UGSCI_MCP_SOURCES_KEY, "mcp");
}

function saveMcpSources(sources: GenericSource[]): void {
  saveGenericSources(UGSCI_MCP_SOURCES_KEY, sources);
}

function loadExpertSources(): GenericSource[] {
  return loadGenericSources(UGSCI_EXPERT_SOURCES_KEY, "expert");
}

function saveExpertSources(sources: GenericSource[]): void {
  saveGenericSources(UGSCI_EXPERT_SOURCES_KEY, sources);
}

function _parseGitHubSkillSourceUrl(
  raw: string,
): {
  owner: string;
  repo: string;
  ref: string;
  skillsPath: string;
  label: string;
} | null {
  try {
    const url = new URL(raw.trim());
    const host = url.hostname.toLowerCase();
    if (host !== "github.com" && host !== "www.github.com") return null;
    const parts = url.pathname.split("/").filter((p) => p.length > 0);
    if (parts.length < 2) return null;
    const owner = decodeURIComponent(parts[0]);
    const repo = decodeURIComponent(parts[1]);
    let ref = "main";
    let skillsPath = "";
    if (parts.length >= 4 && (parts[2] === "tree" || parts[2] === "blob")) {
      ref = decodeURIComponent(parts[3]);
      if (parts.length > 4) {
        skillsPath = parts.slice(4).map(decodeURIComponent).join("/");
      }
    } else if (parts.length > 2) {
      skillsPath = parts.slice(2).map(decodeURIComponent).join("/");
    }
    skillsPath = skillsPath.replace(/\/+$/, "").replace(/^\/+/, "");
    return {
      owner,
      repo,
      ref: ref || "main",
      skillsPath,
      label: `${owner}/${repo}`,
    };
  } catch {
    return null;
  }
}

function _githubSourceId(owner: string, repo: string, skillsPath: string): string {
  return `${owner}/${repo}:${skillsPath || "/"}`;
}

function loadGithubSources(): GitHubSkillSource[] {
  try {
    const raw = localStorage.getItem(UGSCI_GITHUB_SOURCES_KEY);
    if (!raw) {
      // Seed with default source
      const parsed = _parseGitHubSkillSourceUrl(DEFAULT_GITHUB_SOURCE_URL);
      if (parsed) {
        const seed: GitHubSkillSource[] = [
          {
            id: _githubSourceId(
              parsed.owner,
              parsed.repo,
              parsed.skillsPath,
            ),
            url: DEFAULT_GITHUB_SOURCE_URL,
            label: parsed.label,
            owner: parsed.owner,
            repo: parsed.repo,
            ref: parsed.ref,
            skillsPath: parsed.skillsPath,
            enabled: true,
          },
        ];
        localStorage.setItem(UGSCI_GITHUB_SOURCES_KEY, JSON.stringify(seed));
        return seed;
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s: any) =>
        s &&
        typeof s.id === "string" &&
        typeof s.owner === "string" &&
        typeof s.repo === "string",
    );
  } catch {
    return [];
  }
}

function saveGithubSources(sources: GitHubSkillSource[]): void {
  try {
    localStorage.setItem(
      UGSCI_GITHUB_SOURCES_KEY,
      JSON.stringify(sources),
    );
  } catch {
    /* ignore */
  }
}

function _parseSkillFrontmatter(content: string): {
  name?: string;
  description?: string;
  version?: string;
  author?: string;
} {
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!fmMatch) return {};
  const fm = fmMatch[1];
  const result: {
    name?: string;
    description?: string;
    version?: string;
    author?: string;
  } = {};
  // Simple YAML key extraction (avoid pulling in a YAML lib in plugin bundle)
  const lines = fm.split("\n");
  let currentKey = "";
  for (const line of lines) {
    const kvMatch = line.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      let val = kvMatch[2].trim();
      // Strip surrounding quotes
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (currentKey === "name") result.name = val;
      else if (currentKey === "description") result.description = val;
      else if (currentKey === "version") result.version = val;
      else if (currentKey === "author") result.author = val;
    }
  }
  return result;
}

async function fetchGitHubSourceSkills(
  source: GitHubSkillSource,
): Promise<GitHubSkill[]> {
  // 1. List directory contents via GitHub Contents API
  const encodedPath = source.skillsPath
    ? encodeURIComponent(source.skillsPath).replace(/%2F/g, "/")
    : "";
  const listUrl = `https://api.github.com/repos/${source.owner}/${source.repo}/contents/${encodedPath}?ref=${encodeURIComponent(source.ref)}`;
  const listResp = await fetch(listUrl, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!listResp.ok) {
    throw new Error(
      `GitHub API ${listResp.status}: ${source.label} (${source.skillsPath || "/"})`,
    );
  }
  const items = (await listResp.json()) as any[];
  if (!Array.isArray(items)) return [];
  // Filter directories (skill folders)
  const dirs = items.filter(
    (item) => item.type === "dir" && item.name,
  );

  // 2. Fetch SKILL.md for each dir in parallel (raw URLs, CORS-safe, no rate limit)
  const skills = await Promise.all(
    dirs.map(async (dir) => {
      const rawUrl = `https://raw.githubusercontent.com/${source.owner}/${source.repo}/${source.ref}/${source.skillsPath ? source.skillsPath + "/" : ""}${dir.name}/SKILL.md`;
      const htmlUrl = `https://github.com/${source.owner}/${source.repo}/tree/${source.ref}/${source.skillsPath ? source.skillsPath + "/" : ""}${dir.name}`;
      const fallbackSkill: GitHubSkill = {
        sourceId: source.id,
        sourceLabel: source.label,
        name: dir.name,
        description: "",
        source_url: htmlUrl,
        html_url: htmlUrl,
        version: null,
        author: null,
      };
      try {
        const mdResp = await fetch(rawUrl);
        if (!mdResp.ok) return fallbackSkill;
        const mdContent = await mdResp.text();
        const fm = _parseSkillFrontmatter(mdContent);
        return {
          ...fallbackSkill,
          name: fm.name || dir.name,
          description: fm.description || "",
          version: fm.version || null,
          author: fm.author || null,
        };
      } catch {
        return fallbackSkill;
      }
    }),
  );
  return skills;
}

async function fetchAllGitHubSkills(
  sources: GitHubSkillSource[],
): Promise<{ skills: GitHubSkill[]; errors: { label: string; message: string }[] }> {
  const enabled = sources.filter((s) => s.enabled);
  const results = await Promise.all(
    enabled.map(async (s) => {
      try {
        const skills = await fetchGitHubSourceSkills(s);
        return { skills, error: null as string | null, label: s.label };
      } catch (e: any) {
        return {
          skills: [] as GitHubSkill[],
          error: e.message || String(e),
          label: s.label,
        };
      }
    }),
  );
  const allSkills: GitHubSkill[] = [];
  const errors: { label: string; message: string }[] = [];
  for (const r of results) {
    allSkills.push(...r.skills);
    if (r.error) errors.push({ label: r.label, message: r.error });
  }
  return { skills: allSkills, errors };
}

// ─── Source Config Modal: manage GitHub skill sources ─────────────────────────

function SourceConfigModal({
  open,
  onClose,
  sources,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  sources: GitHubSkillSource[];
  onChange: (sources: GitHubSkillSource[]) => void;
}) {
  const React = getHost().React;
  const { useState } = React;
  const {
    Modal,
    Input,
    Button,
    List,
    Tag,
    Switch,
    Typography,
    Tooltip,
    message: antdMsg,
  } = getHost().antd;
  const {
    PlusOutlined,
    DeleteOutlined,
    LinkOutlined,
    GithubOutlined,
  } = getHost().antdIcons || {};
  const { Text } = Typography;

  const [newUrl, setNewUrl] = useState("");

  const handleAdd = () => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    const parsed = _parseGitHubSkillSourceUrl(trimmed);
    if (!parsed) {
      antdMsg.error("无效的 GitHub URL，请输入类似 https://github.com/owner/repo/tree/main/skills 的链接");
      return;
    }
    const id = _githubSourceId(parsed.owner, parsed.repo, parsed.skillsPath);
    if (sources.some((s) => s.id === id)) {
      antdMsg.warning("该源已存在");
      return;
    }
    const newSource: GitHubSkillSource = {
      id,
      url: trimmed,
      label: parsed.label,
      owner: parsed.owner,
      repo: parsed.repo,
      ref: parsed.ref,
      skillsPath: parsed.skillsPath,
      enabled: true,
    };
    const next = [...sources, newSource];
    saveGithubSources(next);
    onChange(next);
    setNewUrl("");
    antdMsg.success(`已添加源: ${parsed.label}`);
  };

  const handleToggle = (id: string, enabled: boolean) => {
    const next = sources.map((s) =>
      s.id === id ? { ...s, enabled } : s,
    );
    saveGithubSources(next);
    onChange(next);
  };

  const handleDelete = (id: string) => {
    const next = sources.filter((s) => s.id !== id);
    saveGithubSources(next);
    onChange(next);
    antdMsg.success("已移除源");
  };

  return React.createElement(
    Modal,
    {
      open,
      onCancel: onClose,
      title: React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        GithubOutlined
          ? React.createElement(GithubOutlined, { style: { fontSize: 18 } })
          : null,
        React.createElement("span", null, "配置技能源"),
      ),
      footer: React.createElement(
        Button,
        { onClick: onClose },
        "关闭",
      ),
      width: 640,
    },
    React.createElement(
      "div",
      { style: { marginBottom: 16 } },
      React.createElement(
        Text,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式：",
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        React.createElement(Input, {
          placeholder: "https://github.com/anthropics/skills/tree/main/skills",
          value: newUrl,
          onChange: (e: any) => setNewUrl(e.target.value),
          onPressEnter: handleAdd,
          prefix: LinkOutlined ? React.createElement(LinkOutlined) : undefined,
          style: { flex: 1 },
        }),
        React.createElement(
          Button,
          {
            type: "primary",
            icon: PlusOutlined ? React.createElement(PlusOutlined) : undefined,
            onClick: handleAdd,
          },
          "添加",
        ),
      ),
    ),
    React.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      React.createElement(Text, { strong: true }, `已配置源 (${sources.length})`),
    ),
    React.createElement(List, {
      size: "small",
      bordered: true,
      dataSource: sources,
      renderItem: (source: GitHubSkillSource) =>
        React.createElement(
          List.Item,
          {
            actions: [
              React.createElement(
                Tooltip,
                { title: source.enabled ? "点击禁用" : "点击启用" },
                React.createElement(Switch, {
                  size: "small",
                  checked: source.enabled,
                  onChange: (v: boolean) => handleToggle(source.id, v),
                }),
              ),
              React.createElement(
                Tooltip,
                { title: "移除此源" },
                React.createElement(
                  Button,
                  {
                    size: "small",
                    type: "text",
                    danger: true,
                    icon: DeleteOutlined
                      ? React.createElement(DeleteOutlined)
                      : undefined,
                    onClick: () => handleDelete(source.id),
                  },
                ),
              ),
            ],
          },
          React.createElement(
            "div",
            { style: { flex: 1, minWidth: 0 } },
            React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
              React.createElement(
                Tag,
                { color: "blue", style: { fontSize: 11 } },
                source.label,
              ),
              source.skillsPath
                ? React.createElement(
                    Text,
                    { type: "secondary", style: { fontSize: 11 } },
                    `/${source.skillsPath}`,
                  )
                : null,
              React.createElement(
                Text,
                { type: "secondary", style: { fontSize: 11 } },
                `@${source.ref}`,
              ),
            ),
            React.createElement(
              Text,
              {
                type: "secondary",
                style: { fontSize: 11, wordBreak: "break-all" },
              },
              source.url,
            ),
          ),
        ),
    }),
  );
}

// ─── Generic Source Config Modal: for MCP / Expert sources ──────────────────

function GenericSourceConfigModal({
  open,
  onClose,
  sources,
  onChange,
  type,
}: {
  open: boolean;
  onClose: () => void;
  sources: GenericSource[];
  onChange: (sources: GenericSource[]) => void;
  type: "mcp" | "expert";
}) {
  const React = getHost().React;
  const { useState } = React;
  const {
    Modal,
    Input,
    Button,
    List,
    Tag,
    Switch,
    Typography,
    Tooltip,
    message: antdMsg,
  } = getHost().antd;
  const {
    PlusOutlined,
    DeleteOutlined,
    LinkOutlined,
    ApiOutlined,
    UserOutlined,
    ImportOutlined,
    ExportOutlined,
    CopyOutlined,
  } = getHost().antdIcons || {};
  const { Text } = Typography;

  const [newUrl, setNewUrl] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);

  const typeLabel = type === "mcp" ? "MCP" : "专家模板";
  const typeIcon =
    type === "mcp"
      ? ApiOutlined
        ? React.createElement(ApiOutlined, { style: { fontSize: 18 } })
        : null
      : UserOutlined
        ? React.createElement(UserOutlined, { style: { fontSize: 18 } })
        : null;

  const handleAdd = () => {
    const trimmedUrl = newUrl.trim();
    const trimmedLabel = newLabel.trim();
    if (!trimmedUrl) return;
    const label = trimmedLabel || trimmedUrl.slice(0, 40);
    const id = `${type}:${trimmedUrl}`;
    if (sources.some((s) => s.id === id)) {
      antdMsg.warning("该源已存在");
      return;
    }
    const newSource: GenericSource = {
      id,
      label,
      url: trimmedUrl,
      enabled: true,
      type,
    };
    const next = [...sources, newSource];
    if (type === "mcp") saveMcpSources(next);
    else saveExpertSources(next);
    onChange(next);
    setNewUrl("");
    setNewLabel("");
    antdMsg.success(`已添加${typeLabel}源: ${label}`);
  };

  const handleToggle = (id: string, enabled: boolean) => {
    const next = sources.map((s) =>
      s.id === id ? { ...s, enabled } : s,
    );
    if (type === "mcp") saveMcpSources(next);
    else saveExpertSources(next);
    onChange(next);
  };

  const handleDelete = (id: string) => {
    const next = sources.filter((s) => s.id !== id);
    if (type === "mcp") saveMcpSources(next);
    else saveExpertSources(next);
    onChange(next);
    antdMsg.success("已移除源");
  };

  const handleExport = () => {
    const exportData = JSON.stringify(
      { type, sources },
      null,
      2,
    );
    try {
      navigator.clipboard.writeText(exportData);
      antdMsg.success(`${typeLabel}源已复制到剪贴板（${sources.length} 个源）`);
    } catch {
      // Fallback: create a temporary textarea
      const textarea = document.createElement("textarea");
      textarea.value = exportData;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      antdMsg.success(`${typeLabel}源已复制到剪贴板（${sources.length} 个源）`);
    }
  };

  const handleImport = () => {
    const trimmed = importText.trim();
    if (!trimmed) {
      antdMsg.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const data = JSON.parse(trimmed);
      let importedSources: GenericSource[] = [];

      // Accept either { type, sources: [...] } or raw [...]
      if (Array.isArray(data)) {
        importedSources = data;
      } else if (data && Array.isArray(data.sources)) {
        importedSources = data.sources;
      } else if (data && typeof data === "object") {
        // Single source object
        importedSources = [data];
      } else {
        throw new Error("Invalid format");
      }

      const valid = importedSources.filter(
        (s: any) =>
          s &&
          typeof s.url === "string" &&
          typeof s.label === "string",
      );

      if (valid.length === 0) {
        antdMsg.error("未找到有效的源数据");
        return;
      }

      // Merge with existing (deduplicate by id)
      const existingIds = new Set(sources.map((s) => s.id));
      const toAdd: GenericSource[] = [];
      for (const s of valid) {
        const id = s.id || `${type}:${s.url}`;
        if (!existingIds.has(id)) {
          toAdd.push({
            id,
            label: s.label,
            url: s.url,
            enabled: s.enabled !== false,
            type,
          });
        }
      }

      if (toAdd.length === 0) {
        antdMsg.info("所有源均已存在，无新增");
        return;
      }

      const next = [...sources, ...toAdd];
      if (type === "mcp") saveMcpSources(next);
      else saveExpertSources(next);
      onChange(next);
      setImportText("");
      setShowImport(false);
      antdMsg.success(`成功导入 ${toAdd.length} 个${typeLabel}源`);
    } catch (err: any) {
      antdMsg.error(`JSON 解析失败: ${err.message || "格式错误"}`);
    }
  };

  return React.createElement(
    Modal,
    {
      open,
      onCancel: onClose,
      title: React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        typeIcon,
        React.createElement("span", null, `配置${typeLabel}源`),
      ),
      footer: React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between" } },
        React.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          React.createElement(
            Button,
            {
              icon: ExportOutlined
                ? React.createElement(ExportOutlined)
                : undefined,
              onClick: handleExport,
              disabled: sources.length === 0,
              size: "small",
            },
            "导出到剪贴板",
          ),
          React.createElement(
            Button,
            {
              icon: ImportOutlined
                ? React.createElement(ImportOutlined)
                : undefined,
              onClick: () => setShowImport(!showImport),
              size: "small",
            },
            showImport ? "隐藏导入" : "导入JSON",
          ),
        ),
        React.createElement(
          Button,
          { onClick: onClose },
          "关闭",
        ),
      ),
      width: 680,
    },
    // Description
    React.createElement(
      Text,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${typeLabel}源地址，支持从远程仓库或团队共享的 JSON 导入${typeLabel}配置。`,
    ),
    // Import section (collapsible)
    showImport
      ? React.createElement(
          "div",
          {
            style: {
              marginBottom: 16,
              padding: 12,
              background: "#fafafa",
              borderRadius: 8,
              border: "1px solid #f0f0f0",
            },
          },
          React.createElement(
            Text,
            { strong: true, style: { fontSize: 12, display: "block", marginBottom: 8 } },
            `粘贴${typeLabel}源 JSON（支持从导出的剪贴板内容粘贴）`,
          ),
          React.createElement(Input.TextArea, {
            placeholder:
              type === "mcp"
                ? '{\n  "type": "mcp",\n  "sources": [\n    { "label": "团队MCP", "url": "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" }\n  ]\n}'
                : '{\n  "type": "expert",\n  "sources": [\n    { "label": "团队专家库", "url": "https://raw.githubusercontent.com/team/expert-registry/main/experts.json" }\n  ]\n}',
            value: importText,
            onChange: (e: any) => setImportText(e.target.value),
            autoSize: { minRows: 4, maxRows: 10 },
            style: { fontFamily: "monospace", fontSize: 12 },
          }),
          React.createElement(
            "div",
            { style: { marginTop: 8, display: "flex", gap: 8 } },
            React.createElement(
              Button,
              {
                type: "primary",
                size: "small",
                onClick: handleImport,
              },
              "导入",
            ),
            React.createElement(
              Button,
              {
                size: "small",
                onClick: () => setImportText(""),
              },
              "清空",
            ),
          ),
        )
      : null,
    // Add new source
    React.createElement(
      "div",
      { style: { marginBottom: 16, display: "flex", gap: 8, alignItems: "center" } },
      React.createElement(Input, {
        placeholder: "源名称（可选，如：团队MCP仓库）",
        value: newLabel,
        onChange: (e: any) => setNewLabel(e.target.value),
        style: { width: 200 },
      }),
      React.createElement(Input, {
        placeholder:
          type === "mcp"
            ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json"
            : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: newUrl,
        onChange: (e: any) => setNewUrl(e.target.value),
        onPressEnter: handleAdd,
        prefix: LinkOutlined ? React.createElement(LinkOutlined) : undefined,
        style: { flex: 1 },
      }),
      React.createElement(
        Button,
        {
          type: "primary",
          icon: PlusOutlined ? React.createElement(PlusOutlined) : undefined,
          onClick: handleAdd,
        },
        "添加",
      ),
    ),
    // Source list
    React.createElement(
      "div",
      {
        style: {
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        },
      },
      React.createElement(
        Text,
        { strong: true },
        `已配置源 (${sources.length})`,
      ),
    ),
    React.createElement(List, {
      size: "small",
      bordered: true,
      dataSource: sources,
      renderItem: (source: GenericSource) =>
        React.createElement(
          List.Item,
          {
            actions: [
              React.createElement(
                Tooltip,
                { title: source.enabled ? "点击禁用" : "点击启用" },
                React.createElement(Switch, {
                  size: "small",
                  checked: source.enabled,
                  onChange: (v: boolean) => handleToggle(source.id, v),
                }),
              ),
              React.createElement(
                Tooltip,
                { title: "移除此源" },
                React.createElement(
                  Button,
                  {
                    size: "small",
                    type: "text",
                    danger: true,
                    icon: DeleteOutlined
                      ? React.createElement(DeleteOutlined)
                      : undefined,
                    onClick: () => handleDelete(source.id),
                  },
                ),
              ),
            ],
          },
          React.createElement(
            "div",
            { style: { flex: 1, minWidth: 0 } },
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                },
              },
              React.createElement(
                Tag,
                {
                  color: type === "mcp" ? "purple" : "blue",
                  style: { fontSize: 11 },
                },
                source.label,
              ),
              !source.enabled
                ? React.createElement(
                    Tag,
                    { style: { fontSize: 10 } },
                    "已禁用",
                  )
                : null,
            ),
            React.createElement(
              Text,
              {
                type: "secondary",
                style: { fontSize: 11, wordBreak: "break-all" },
              },
              source.url,
            ),
          ),
        ),
    }),
    // Share hint
    React.createElement(
      "div",
      {
        style: {
          marginTop: 12,
          padding: "8px 12px",
          background: "#e6f4ff",
          borderRadius: 6,
          fontSize: 12,
          color: "#1677ff",
        },
      },
      React.createElement(
        "span",
        null,
        "💡 ",
        `点击「导出到剪贴板」可复制所有源配置，分享给团队成员后粘贴到「导入JSON」即可快速配置。`,
      ),
    ),
  );
}

interface MarketSearchResponse {
  results: MarketResult[];
  errors: { provider: string; message: string }[];
  by_provider: Record<string, { has_more: boolean; total: number }>;
}

interface MarketProviderInfo {
  key: string;
  label: string;
  available: boolean;
  reason: string | null;
  supports_browse: boolean;
}

interface MarketCategory {
  id: string;
  label: string;
}

async function fetchMarketProviders(): Promise<MarketProviderInfo[]> {
  return apiFetch<MarketProviderInfo[]>("/market/providers");
}

async function fetchMarketCategories(lang: string): Promise<MarketCategory[]> {
  return apiFetch<MarketCategory[]>(
    `/market/categories?lang=${encodeURIComponent(lang)}`,
  );
}

async function searchMarket(
  query: string,
  providerPages: Record<string, number>,
  limit: number,
  lang: string,
  category?: string,
): Promise<MarketSearchResponse> {
  return apiFetch<MarketSearchResponse>("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      provider_pages: providerPages,
      limit,
      lang,
      category: category || undefined,
    }),
  });
}

async function startHubInstall(
  agentId: string,
  bundleUrl: string,
  enable: boolean,
): Promise<{ task_id: string }> {
  return apiFetch<{ task_id: string }>("/skills/hub/install/start", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": agentId },
    body: JSON.stringify({
      bundle_url: bundleUrl,
      enable,
    }),
  });
}

async function pollHubInstallStatus(
  agentId: string,
  taskId: string,
): Promise<any> {
  return apiFetch<any>(
    `/skills/hub/install/status/${encodeURIComponent(taskId)}`,
    {
      headers: { "X-Agent-Id": agentId },
    },
  );
}

function MarketplacePage() {
  const React = getHost().React;
  const { useState, useEffect, useCallback, useMemo, useRef } = React;
  const {
    Spin,
    Empty,
    Input,
    Button,
    message: antdMsg,
    Row,
    Col,
    Card,
    Tag,
    Tooltip,
    Typography,
    Select,
    Drawer,
    Descriptions,
    Tabs,
    Badge,
    Progress,
  } = getHost().antd;
  const {
    ReloadOutlined,
    SearchOutlined,
    DownloadOutlined,
    AppstoreOutlined,
    ShopOutlined,
    CheckCircleOutlined,
    LoadingOutlined,
    UserOutlined,
    SettingOutlined,
    GithubOutlined,
    ApiOutlined,
  } = getHost().antdIcons || {};
  const { Text, Paragraph, Title } = Typography;

  // Tab: 'skills' | 'mcp' | 'experts'
  const [activeTab, setActiveTab] = useState("skills");

  // Skill market state
  const [providers, setProviders] = useState<MarketProviderInfo[]>([]);
  const [categories, setCategories] = useState<MarketCategory[]>([]);
  const [results, setResults] = useState<MarketResult[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [providerPages, setProviderPages] = useState<Record<string, number>>(
    {},
  );
  const [detailItem, setDetailItem] = useState<MarketResult | null>(null);
  const [installing, setInstalling] = useState<Record<string, string>>({});

  // Agent list for install target selection
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [installTargetAgent, setInstallTargetAgent] = useState<string>("");

  // Expert templates state
  const [expertSearchText, setExpertSearchText] = useState("");

  // MCP market state
  const [mcpSearchText, setMcpSearchText] = useState("");
  const [mcpInstalling, setMcpInstalling] = useState<Record<string, boolean>>({});
  const [mcpInstallTargetAgent, setMcpInstallTargetAgent] = useState<string>("");
  const [existingMcpKeys, setExistingMcpKeys] = useState<Set<string>>(new Set());

  // GitHub skill sources state
  const [githubSources, setGithubSources] = useState<GitHubSkillSource[]>([]);
  const [githubSkills, setGithubSkills] = useState<GitHubSkill[]>([]);
  const [githubLoading, setGithubLoading] = useState(false);
  const [sourceConfigOpen, setSourceConfigOpen] = useState(false);
  const [selectedSourceFilter, setSelectedSourceFilter] = useState("");

  // MCP sources state
  const [mcpSources, setMcpSources] = useState<GenericSource[]>([]);
  const [mcpSourceConfigOpen, setMcpSourceConfigOpen] = useState(false);

  // Expert sources state
  const [expertSources, setExpertSources] = useState<GenericSource[]>([]);
  const [expertSourceConfigOpen, setExpertSourceConfigOpen] = useState(false);

  const searchTimerRef = useRef<any>(null);

  // Load providers and categories on mount
  useEffect(() => {
    Promise.all([
      fetchMarketProviders().catch(() => []),
      fetchMarketCategories("zh").catch(() => []),
      fetchAgents().catch(() => []),
    ]).then(([provs, cats, agentList]) => {
      setProviders(provs);
      setCategories(cats);
      setAgents(agentList);
      if (agentList.length > 0) {
        setInstallTargetAgent(agentList[0].id);
        setMcpInstallTargetAgent(agentList[0].id);
      }
    });
  }, []);

  // Load GitHub sources from localStorage on mount, then fetch skills
  const loadGithubSkills = useCallback(async (sources?: GitHubSkillSource[]) => {
    const srcs = sources ?? loadGithubSources();
    if (sources) setGithubSources(sources);
    else setGithubSources(srcs);
    const enabled = srcs.filter((s) => s.enabled);
    if (enabled.length === 0) {
      setGithubSkills([]);
      return;
    }
    setGithubLoading(true);
    try {
      const { skills, errors } = await fetchAllGitHubSkills(srcs);
      setGithubSkills(skills);
      if (errors.length > 0) {
        for (const err of errors) {
          console.warn(`[ugsci] GitHub source '${err.label}' error: ${err.message}`);
        }
        antdMsg.warning(
          `部分源加载失败: ${errors.map((e) => e.label).join(", ")}`,
        );
      }
    } catch (err: any) {
      antdMsg.error(err.message || "加载 GitHub 技能源失败");
      setGithubSkills([]);
    } finally {
      setGithubLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGithubSkills();
    // Load MCP and Expert sources from localStorage
    setMcpSources(loadMcpSources());
    setExpertSources(loadExpertSources());
  }, [loadGithubSkills]);

  const doSearch = useCallback(
    async (query: string, category: string, pages: Record<string, number>) => {
      setLoading(true);
      try {
        const resp = await searchMarket(
          query,
          pages,
          20,
          "zh",
          category || undefined,
        );
        if (pages === undefined || Object.keys(pages).length === 0) {
          setResults(resp.results);
        } else {
          setResults((prev: MarketResult[]) => [...prev, ...resp.results]);
        }
        const anyHasMore = Object.values(resp.by_provider || {}).some(
          (p: any) => p.has_more,
        );
        setHasMore(anyHasMore);
        // Update provider pages for next load-more
        const newPages: Record<string, number> = {};
        for (const [key, info] of Object.entries(resp.by_provider || {})) {
          newPages[key] = (pages[key] || 1) + 1;
        }
        setProviderPages(newPages);
        if (resp.errors.length > 0) {
          for (const err of resp.errors) {
            console.warn(
              `[ugsci] Market provider '${err.provider}' error: ${err.message}`,
            );
          }
        }
      } catch (err: any) {
        antdMsg.error(err.message || "搜索市场失败");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Debounced search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      doSearch(searchText, selectedCategory, {});
    }, 400);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchText, selectedCategory, doSearch]);

  const handleLoadMore = () => {
    doSearch(searchText, selectedCategory, providerPages);
  };

  const handleInstallSkill = async (item: MarketResult) => {
    if (!installTargetAgent) {
      antdMsg.warning("请先选择安装目标专家");
      return;
    }
    const itemKey = `${item.source}:${item.slug}`;
    try {
      setInstalling((prev: any) => ({ ...prev, [itemKey]: "starting" }));
      const task = await startHubInstall(
        installTargetAgent,
        item.source_url,
        true,
      );
      setInstalling((prev: any) => ({ ...prev, [itemKey]: "installing" }));

      // Poll for completion
      const maxPolls = 60;
      for (let i = 0; i < maxPolls; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const status = await pollHubInstallStatus(
          installTargetAgent,
          task.task_id,
        );
        if (status.status === "completed" && status.result?.installed) {
          antdMsg.success(`技能「${status.result.name || item.name}」安装成功`);
          setInstalling((prev: any) => {
            const next = { ...prev };
            delete next[itemKey];
            return next;
          });
          return;
        }
        if (status.status === "failed") {
          throw new Error(status.error || "安装失败");
        }
        if (status.status === "cancelled") {
          antdMsg.info("安装已取消");
          setInstalling((prev: any) => {
            const next = { ...prev };
            delete next[itemKey];
            return next;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (err: any) {
      antdMsg.error(err.message || "安装技能失败");
      setInstalling((prev: any) => {
        const next = { ...prev };
        delete next[itemKey];
        return next;
      });
    }
  };

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleInstallGithubSkill = async (skill: GitHubSkill) => {
    if (!installTargetAgent) {
      antdMsg.warning("请先选择安装目标专家");
      return;
    }
    const itemKey = `github:${skill.sourceId}:${skill.name}`;
    try {
      setInstalling((prev: any) => ({ ...prev, [itemKey]: "starting" }));
      const task = await startHubInstall(
        installTargetAgent,
        skill.source_url,
        true,
      );
      setInstalling((prev: any) => ({ ...prev, [itemKey]: "installing" }));

      const maxPolls = 60;
      for (let i = 0; i < maxPolls; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const status = await pollHubInstallStatus(
          installTargetAgent,
          task.task_id,
        );
        if (status.status === "completed" && status.result?.installed) {
          antdMsg.success(`技能「${status.result.name || skill.name}」安装成功`);
          setInstalling((prev: any) => {
            const next = { ...prev };
            delete next[itemKey];
            return next;
          });
          return;
        }
        if (status.status === "failed") {
          throw new Error(status.error || "安装失败");
        }
        if (status.status === "cancelled") {
          antdMsg.info("安装已取消");
          setInstalling((prev: any) => {
            const next = { ...prev };
            delete next[itemKey];
            return next;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (err: any) {
      antdMsg.error(err.message || "安装技能失败");
      setInstalling((prev: any) => {
        const next = { ...prev };
        delete next[itemKey];
        return next;
      });
    }
  };

  // Filtered GitHub skills based on search text and source filter
  const filteredGithubSkills = useMemo(() => {
    let filtered = githubSkills;
    if (selectedSourceFilter) {
      filtered = filtered.filter((s) => s.sourceLabel === selectedSourceFilter);
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [githubSkills, searchText, selectedSourceFilter]);

  // Available providers
  const availableProviders = providers.filter((p) => p.available);

  // Filtered market results based on source filter
  const filteredResults = useMemo(() => {
    if (!selectedSourceFilter) return results;
    // Find the provider key matching the selected label
    const provider = availableProviders.find(
      (p) => p.label === selectedSourceFilter,
    );
    if (!provider) return results;
    return results.filter((r) => r.source === provider.key);
  }, [results, selectedSourceFilter, availableProviders]);

  // All source labels for the filter dropdown
  const allSourceLabels = useMemo(() => {
    const labels = new Set<string>();
    githubSources.filter((s) => s.enabled).forEach((s) => labels.add(s.label));
    availableProviders.forEach((p) => labels.add(p.label));
    return Array.from(labels);
  }, [githubSources, availableProviders]);

  // Skill Market Tab
  const skillsMarketTab = React.createElement(
    "div",
    null,
    // Top bar: search + filters + install target
    React.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        },
      },
      React.createElement(Input, {
        placeholder: "搜索技能市场...",
        prefix: SearchOutlined
          ? React.createElement(SearchOutlined)
          : undefined,
        value: searchText,
        onChange: (e: any) => setSearchText(e.target.value),
        allowClear: true,
        style: { flex: 1, minWidth: 200, maxWidth: 400 },
      }),
      categories.length > 0
        ? React.createElement(Select, {
            value: selectedCategory || undefined,
            onChange: (v: string) => setSelectedCategory(v || ""),
            placeholder: "全部分类",
            allowClear: true,
            style: { minWidth: 150 },
            options: [
              { value: "", label: "全部分类" },
              ...categories.map((c) => ({ value: c.id, label: c.label })),
            ],
          })
        : null,
      // Install target selector
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 4 } },
        React.createElement(
          Text,
          { type: "secondary", style: { fontSize: 12 } },
          "安装到",
        ),
        React.createElement(Select, {
          value: installTargetAgent || undefined,
          onChange: (v: string) => setInstallTargetAgent(v),
          style: { minWidth: 140 },
          placeholder: "选择专家",
          options: agents.map((a) => ({ value: a.id, label: a.name })),
        }),
      ),
      // Configure skill source button
      React.createElement(
        Button,
        {
          icon: GithubOutlined
            ? React.createElement(GithubOutlined)
            : undefined,
          onClick: () => setSourceConfigOpen(true),
          size: "small",
        },
        "配置技能源",
      ),
    ),
    // Source filter tags (GitHub sources + market providers)
    allSourceLabels.length > 0
      ? React.createElement(
          "div",
          {
            style: {
              marginBottom: 12,
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              alignItems: "center",
            },
          },
          React.createElement(
            Text,
            { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
            "来源筛选:",
          ),
          React.createElement(
            Tag,
            {
              style: {
                fontSize: 11,
                cursor: "pointer",
                borderRadius: 12,
              },
              color: selectedSourceFilter === "" ? "blue" : undefined,
              onClick: () => setSelectedSourceFilter(""),
            },
            "全部",
          ),
          ...allSourceLabels.map((label) =>
            React.createElement(
              Tag,
              {
                key: label,
                style: {
                  fontSize: 11,
                  cursor: "pointer",
                  borderRadius: 12,
                },
                color: selectedSourceFilter === label ? "blue" : undefined,
                icon: GithubOutlined && githubSources.some((s) => s.label === label)
                  ? React.createElement(GithubOutlined)
                  : undefined,
                onClick: () =>
                  setSelectedSourceFilter(
                    selectedSourceFilter === label ? "" : label,
                  ),
              },
              label,
            ),
          ),
        )
      : null,
    // GitHub skills section
    githubLoading && githubSkills.length === 0
      ? React.createElement(
          "div",
          { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
          React.createElement(Spin, {
            tip: "正在从 GitHub 加载技能...",
            size: "large",
          }),
        )
      : filteredGithubSkills.length > 0
        ? React.createElement(
            "div",
            { style: { marginBottom: 20 } },
            React.createElement(
              "div",
              {
                style: {
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                },
              },
              GithubOutlined
                ? React.createElement(GithubOutlined, {
                    style: { fontSize: 14, color: "#1677ff" },
                  })
                : null,
              React.createElement(
                Text,
                { strong: true, style: { fontSize: 13 } },
                `GitHub 技能源 (${filteredGithubSkills.length})`,
              ),
            ),
            React.createElement(
              Row,
              { gutter: [12, 12] },
              ...filteredGithubSkills.map((skill) => {
                const itemKey = `github:${skill.sourceId}:${skill.name}`;
                const installState = installing[itemKey];
                return React.createElement(
                  Col,
                  { key: itemKey, xs: 24, sm: 12, md: 8, lg: 6 },
                  React.createElement(
                    Card,
                    {
                      hoverable: true,
                      size: "small",
                      style: { height: "100%" },
                    },
                    React.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 8,
                        },
                      },
                      GithubOutlined
                        ? React.createElement(GithubOutlined, {
                            style: { fontSize: 18, color: "#57606a" },
                          })
                        : React.createElement(
                            "span",
                            { style: { fontSize: 18 } },
                            "📦",
                          ),
                      React.createElement(
                        Tooltip,
                        { title: skill.name },
                        React.createElement(
                          Text,
                          {
                            strong: true,
                            style: {
                              fontSize: 13,
                              flex: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            },
                          },
                          skill.name,
                        ),
                      ),
                    ),
                    React.createElement(
                      Paragraph,
                      {
                        type: "secondary",
                        style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                        ellipsis: { rows: 2 },
                      },
                      skill.description || "暂无描述",
                    ),
                    React.createElement(
                      "div",
                      {
                        style: {
                          marginTop: 8,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        },
                      },
                      React.createElement(
                        "div",
                        { style: { display: "flex", gap: 4, flexWrap: "wrap" } },
                        React.createElement(
                          Tag,
                          { color: "blue", style: { fontSize: 10 } },
                          skill.sourceLabel,
                        ),
                        skill.version
                          ? React.createElement(
                              Tag,
                              { style: { fontSize: 10 } },
                              `v${skill.version}`,
                            )
                          : null,
                      ),
                      installState
                        ? React.createElement(
                            Button,
                            {
                              size: "small",
                              disabled: true,
                              icon: LoadingOutlined
                                ? React.createElement(LoadingOutlined)
                                : undefined,
                            },
                            installState === "starting" ? "启动中" : "安装中",
                          )
                        : React.createElement(
                            Button,
                            {
                              type: "primary",
                              size: "small",
                              icon: DownloadOutlined
                                ? React.createElement(DownloadOutlined)
                                : undefined,
                              onClick: () => handleInstallGithubSkill(skill),
                            },
                            "安装",
                          ),
                    ),
                  ),
                );
              }),
            ),
          )
        : null,
    // Market results section title
    filteredResults.length > 0 || loading
      ? React.createElement(
          "div",
          {
            style: {
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            },
          },
          ShopOutlined
            ? React.createElement(ShopOutlined, {
                style: { fontSize: 14, color: "#1677ff" },
              })
            : null,
          React.createElement(
            Text,
            { strong: true, style: { fontSize: 13 } },
            `技能市场${filteredResults.length > 0 ? ` (${filteredResults.length})` : ""}`,
          ),
        )
      : null,
    // Results grid
    loading && filteredResults.length === 0
      ? React.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          React.createElement(Spin, { size: "large" }),
        )
      : filteredResults.length === 0
        ? React.createElement(Empty, {
            description: searchText
              ? `未找到匹配「${searchText}」的技能`
              : "输入关键词搜索技能市场",
            image: Empty.PRESENTED_IMAGE_SIMPLE,
          })
        : React.createElement(
            Row,
            { gutter: [12, 12] },
            ...filteredResults.map((item) => {
              const itemKey = `${item.source}:${item.slug}`;
              const installState = installing[itemKey];
              return React.createElement(
                Col,
                { key: itemKey, xs: 24, sm: 12, md: 8, lg: 6 },
                React.createElement(
                  Card,
                  {
                    hoverable: true,
                    size: "small",
                    style: { height: "100%", cursor: "pointer" },
                    onClick: () => setDetailItem(item),
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      },
                    },
                    item.icon_url
                      ? React.createElement("img", {
                          src: item.icon_url,
                          alt: item.name,
                          style: { width: 24, height: 24, borderRadius: 4 },
                        })
                      : React.createElement(
                          "span",
                          { style: { fontSize: 18 } },
                          "📦",
                        ),
                    React.createElement(
                      Tooltip,
                      { title: item.name },
                      React.createElement(
                        Text,
                        {
                          strong: true,
                          style: {
                            fontSize: 13,
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          },
                        },
                        item.name,
                      ),
                    ),
                  ),
                  React.createElement(
                    Paragraph,
                    {
                      type: "secondary",
                      style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                      ellipsis: { rows: 2 },
                    },
                    item.description || "暂无描述",
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        marginTop: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      },
                    },
                    React.createElement(
                      "div",
                      { style: { display: "flex", gap: 4 } },
                      React.createElement(
                        Tag,
                        { color: "geekblue", style: { fontSize: 10 } },
                        item.source,
                      ),
                      item.version
                        ? React.createElement(
                            Tag,
                            { style: { fontSize: 10 } },
                            `v${item.version}`,
                          )
                        : null,
                    ),
                    installState
                      ? React.createElement(
                          Button,
                          {
                            size: "small",
                            disabled: true,
                            icon: LoadingOutlined
                              ? React.createElement(LoadingOutlined)
                              : undefined,
                          },
                          installState === "starting" ? "启动中" : "安装中",
                        )
                      : React.createElement(
                          Button,
                          {
                            type: "primary",
                            size: "small",
                            icon: DownloadOutlined
                              ? React.createElement(DownloadOutlined)
                              : undefined,
                            onClick: (e: any) => {
                              e.stopPropagation();
                              handleInstallSkill(item);
                            },
                          },
                          "安装",
                        ),
                  ),
                ),
              );
            }),
          ),
    // Load more button
    hasMore && !loading
      ? React.createElement(
          "div",
          { style: { textAlign: "center", marginTop: 16 } },
          React.createElement(
            Button,
            { onClick: handleLoadMore, loading },
            "加载更多",
          ),
        )
      : null,
    // Detail Drawer
    detailItem
      ? React.createElement(
          Drawer,
          {
            title: React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              detailItem.icon_url
                ? React.createElement("img", {
                    src: detailItem.icon_url,
                    alt: detailItem.name,
                    style: { width: 28, height: 28, borderRadius: 4 },
                  })
                : React.createElement(
                    "span",
                    { style: { fontSize: 20 } },
                    "📦",
                  ),
              React.createElement("span", null, detailItem.name),
            ),
            open: true,
            onClose: () => setDetailItem(null),
            width: 480,
            extra: React.createElement(
              Button,
              {
                type: "primary",
                icon: DownloadOutlined
                  ? React.createElement(DownloadOutlined)
                  : undefined,
                onClick: () => {
                  handleInstallSkill(detailItem);
                },
              },
              "安装到专家",
            ),
          },
          React.createElement(
            Descriptions,
            { column: 1, bordered: true, size: "small" },
            React.createElement(
              Descriptions.Item,
              { label: "来源" },
              detailItem.source,
            ),
            React.createElement(
              Descriptions.Item,
              { label: "描述" },
              detailItem.description || "-",
            ),
            detailItem.version
              ? React.createElement(
                  Descriptions.Item,
                  { label: "版本" },
                  detailItem.version,
                )
              : null,
            detailItem.author
              ? React.createElement(
                  Descriptions.Item,
                  { label: "作者" },
                  detailItem.author,
                )
              : null,
            React.createElement(
              Descriptions.Item,
              { label: "来源链接" },
              React.createElement(
                "a",
                { href: detailItem.source_url, target: "_blank" },
                detailItem.source_url,
              ),
            ),
          ),
          detailItem.stats
            ? React.createElement(
                "div",
                { style: { marginTop: 16 } },
                React.createElement(
                  Text,
                  {
                    strong: true,
                    style: { display: "block", marginBottom: 8 },
                  },
                  "统计",
                ),
                React.createElement(
                  "div",
                  { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
                  ...Object.entries(detailItem.stats).map(([key, value]) =>
                    React.createElement(
                      "div",
                      { key, style: { textAlign: "center" } },
                      React.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 18,
                            fontWeight: 600,
                            color: "#1677ff",
                          },
                        },
                        String(value),
                      ),
                      React.createElement(
                        Text,
                        { type: "secondary", style: { fontSize: 11 } },
                        key,
                      ),
                    ),
                  ),
                ),
              )
            : null,
        )
      : null,
  );

  // Expert Templates Tab
  const filteredTemplates = useMemo(() => {
    if (!expertSearchText.trim()) return EXPERT_TEMPLATES;
    const q = expertSearchText.toLowerCase();
    return EXPERT_TEMPLATES.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
    );
  }, [expertSearchText]);

  const handleQuickCreateExpert = async (template: ExpertTemplate) => {
    try {
      const agentRef = await apiFetch<{ id: string }>("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          skill_names: template.recommendedSkills,
        }),
      });
      await writeKnowledgeFile(agentRef.id, "AGENTS.md", template.systemPrompt);
      const config = await fetchAgentConfig(agentRef.id);
      config.approval_level = template.approvalLevel;
      await apiFetch(`/agents/${encodeURIComponent(agentRef.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      antdMsg.success(`专家「${template.name}」创建成功，已跳转至专家`);
      navigateTo("/ugsci-experts");
    } catch (err: any) {
      antdMsg.error(err.message || "创建专家失败");
    }
  };

  // ── MCP Market: load existing MCP keys when target agent changes ──
  const loadExistingMcpKeys = useCallback(async (agentId: string) => {
    if (!agentId) return;
    try {
      const data = await fetchAgentMCPClients(agentId);
      setExistingMcpKeys(new Set(data.map((m) => m.key)));
    } catch {
      setExistingMcpKeys(new Set());
    }
  }, []);

  useEffect(() => {
    if (mcpInstallTargetAgent) {
      loadExistingMcpKeys(mcpInstallTargetAgent);
    }
  }, [mcpInstallTargetAgent, loadExistingMcpKeys]);

  // ── MCP Market: install handler ──
  const handleInstallMcp = async (template: MCPTemplate) => {
    if (!mcpInstallTargetAgent) {
      antdMsg.warning("请先选择目标专家");
      return;
    }
    setMcpInstalling((prev) => ({ ...prev, [template.id]: true }));
    try {
      const clientKey = template.id;
      await createMCPForAgent(mcpInstallTargetAgent, {
        client_key: clientKey,
        client: {
          name: template.name,
          description: template.description,
          enabled: true,
          transport: template.transport,
          url: template.url || "",
          command: template.command || "",
          args: template.args || [],
          env: template.env || {},
          cwd: template.cwd || "",
          headers: template.headers || {},
        },
      });
      antdMsg.success(`MCP「${template.name}」已添加到当前专家`);
      setExistingMcpKeys((prev) => new Set(prev).add(clientKey));
    } catch (err: any) {
      antdMsg.error(err.message || `添加 MCP「${template.name}」失败`);
    } finally {
      setMcpInstalling((prev) => ({ ...prev, [template.id]: false }));
    }
  };

  // ── MCP Market: filtered templates ──
  const filteredMcpTemplates = useMemo(() => {
    if (!mcpSearchText.trim()) return MCP_TEMPLATES;
    const q = mcpSearchText.toLowerCase();
    return MCP_TEMPLATES.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
    );
  }, [mcpSearchText]);

  const mcpMarketTab = React.createElement(
    "div",
    null,
    // Search + agent selector
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        },
      },
      React.createElement(Input, {
        placeholder: "搜索 MCP 模板...",
        prefix: SearchOutlined ? React.createElement(SearchOutlined) : undefined,
        value: mcpSearchText,
        onChange: (e: any) => setMcpSearchText(e.target.value),
        allowClear: true,
        style: { maxWidth: 300 },
      }),
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        React.createElement(
          Text,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "安装到：",
        ),
        React.createElement(Select, {
          value: mcpInstallTargetAgent,
          onChange: (v: string) => setMcpInstallTargetAgent(v),
          style: { minWidth: 180 },
          size: "small",
          options: agents.map((a) => ({ value: a.id, label: a.name })),
        }),
      ),
      // Configure MCP source button
      React.createElement(
        Button,
        {
          icon: ApiOutlined ? React.createElement(ApiOutlined) : undefined,
          onClick: () => setMcpSourceConfigOpen(true),
          size: "small",
        },
        "配置 MCP 源",
      ),
    ),
    // MCP template cards
    React.createElement(
      Row,
      { gutter: [12, 12] },
      ...filteredMcpTemplates.map((template) =>
        React.createElement(
          Col,
          { key: template.id, xs: 24, sm: 12, md: 8 },
          React.createElement(
            Card,
            {
              hoverable: true,
              size: "small",
              style: { height: "100%" },
            },
            // Header: emoji + name + tags
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 8,
                },
              },
              React.createElement(
                "span",
                { style: { fontSize: 28 } },
                template.emoji,
              ),
              React.createElement(
                "div",
                { style: { flex: 1 } },
                React.createElement(
                  Text,
                  { strong: true, style: { fontSize: 14 } },
                  template.name,
                ),
                React.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  React.createElement(
                    Tag,
                    { color: "blue", style: { fontSize: 10 } },
                    template.category,
                  ),
                  React.createElement(
                    Tag,
                    {
                      color: template.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 },
                    },
                    template.transport,
                  ),
                  template.env && Object.keys(template.env).length > 0
                    ? React.createElement(
                        Tag,
                        { color: "orange", style: { fontSize: 10 } },
                        "需配置密钥",
                      )
                    : null,
                ),
              ),
            ),
            // Description
            React.createElement(
              Paragraph,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 },
              },
              template.description,
            ),
            // Footer: config preview + install button
            React.createElement(
              "div",
              {
                style: {
                  marginTop: 10,
                  paddingTop: 8,
                  borderTop: "1px solid #f0f0f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                },
              },
              React.createElement(
                Text,
                { type: "secondary", style: { fontSize: 11 } },
                template.transport === "stdio"
                  ? `${template.command} ${(template.args || []).join(" ")}`
                  : template.url || "",
              ),
              existingMcpKeys.has(template.id)
                ? React.createElement(
                    Button,
                    { size: "small", disabled: true },
                    "已安装",
                  )
                : React.createElement(
                    Button,
                    {
                      type: "primary",
                      size: "small",
                      loading: !!mcpInstalling[template.id],
                      icon: ApiOutlined
                        ? React.createElement(ApiOutlined)
                        : undefined,
                      onClick: () => handleInstallMcp(template),
                    },
                    "安装",
                  ),
            ),
          ),
        ),
      ),
    ),
    // Future expansion hint
    React.createElement(
      "div",
      {
        style: {
          marginTop: 20,
          padding: 16,
          textAlign: "center",
          border: "1px dashed #d9d9d9",
          borderRadius: 8,
          background: "#fafafa",
        },
      },
      ShopOutlined
        ? React.createElement(ShopOutlined, {
            style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 },
          })
        : null,
      React.createElement(
        Text,
        { type: "secondary", style: { fontSize: 12 } },
        "更多 MCP 服务器模板持续更新中，也支持通过 JSON 配置自定义添加",
      ),
    ),
  );

  const expertsMarketTab = React.createElement(
    "div",
    null,
    React.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        },
      },
      React.createElement(Input, {
        placeholder: "搜索专家模板...",
        prefix: SearchOutlined ? React.createElement(SearchOutlined) : undefined,
        value: expertSearchText,
        onChange: (e: any) => setExpertSearchText(e.target.value),
        allowClear: true,
        style: { maxWidth: 400, flex: 1, minWidth: 200 },
      }),
      React.createElement(
        Button,
        {
          icon: UserOutlined ? React.createElement(UserOutlined) : undefined,
          onClick: () => setExpertSourceConfigOpen(true),
          size: "small",
        },
        "配置专家源",
      ),
    ),
    React.createElement(
      Row,
      { gutter: [12, 12] },
      ...filteredTemplates.map((template) =>
        React.createElement(
          Col,
          { key: template.id, xs: 24, sm: 12, md: 8 },
          React.createElement(
            Card,
            {
              hoverable: true,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => handleQuickCreateExpert(template),
            },
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 8,
                },
              },
              React.createElement(ExpertAvatar, {
                name: template.name,
                size: 40,
              }),
              React.createElement(
                "div",
                { style: { flex: 1 } },
                React.createElement(
                  Text,
                  { strong: true, style: { fontSize: 14 } },
                  template.name,
                ),
                React.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4 } },
                  React.createElement(
                    Tag,
                    { color: "blue", style: { fontSize: 10 } },
                    template.category,
                  ),
                  template.approvalLevel === "MANUAL"
                    ? React.createElement(
                        Tag,
                        { color: "orange", style: { fontSize: 10 } },
                        "需审批",
                      )
                    : React.createElement(
                        Tag,
                        { color: "green", style: { fontSize: 10 } },
                        "自动",
                      ),
                ),
              ),
            ),
            React.createElement(
              Paragraph,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 },
              },
              template.description.replace(/\*\*(.+?)\*\*/g, "$1"),
            ),
            React.createElement(
              "div",
              {
                style: {
                  marginTop: 10,
                  paddingTop: 8,
                  borderTop: "1px solid #f0f0f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                },
              },
              React.createElement(
                Text,
                { type: "secondary", style: { fontSize: 11 } },
                `推荐 ${template.recommendedSkills.length} 个技能`,
              ),
              React.createElement(
                Button,
                {
                  type: "primary",
                  size: "small",
                  icon: AppstoreOutlined
                    ? React.createElement(AppstoreOutlined)
                    : undefined,
                },
                "一键创建",
              ),
            ),
          ),
        ),
      ),
    ),
    // Future expansion hint
    React.createElement(
      "div",
      {
        style: {
          marginTop: 20,
          padding: 16,
          textAlign: "center",
          border: "1px dashed #d9d9d9",
          borderRadius: 8,
          background: "#fafafa",
        },
      },
      ShopOutlined
        ? React.createElement(ShopOutlined, {
            style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 },
          })
        : null,
      React.createElement(
        Text,
        { type: "secondary", style: { fontSize: 12 } },
        "更多专家模板持续更新中，未来将支持 OpenScience、RPA 等行业扩展",
      ),
    ),
  );

  const tabItems = [
    {
      key: "skills",
      label: React.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        AppstoreOutlined
          ? React.createElement(AppstoreOutlined, { style: { fontSize: 14 } })
          : null,
        "技能市场",
      ),
      children: skillsMarketTab,
    },
    {
      key: "mcp",
      label: React.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        ApiOutlined
          ? React.createElement(ApiOutlined, { style: { fontSize: 14 } })
          : null,
        "MCP 市场",
      ),
      children: mcpMarketTab,
    },
    {
      key: "experts",
      label: React.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        UserOutlined
          ? React.createElement(UserOutlined, { style: { fontSize: 14 } })
          : null,
        "专家模板",
      ),
      children: expertsMarketTab,
    },
  ];

  return React.createElement(
    "div",
    { style: { padding: 24 } },
    React.createElement(PageHeader, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 创建专家模板 · 随时更新能力和专家",
      extra: React.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        React.createElement(
          Button,
          {
            type: "primary",
            icon: ReloadOutlined
              ? React.createElement(ReloadOutlined)
              : undefined,
            onClick: () => {
              doSearch(searchText, selectedCategory, {});
              loadGithubSkills();
            },
            loading: loading || githubLoading,
          },
          "刷新",
        ),
      ),
    }),
    React.createElement(Tabs, {
      items: tabItems,
      activeKey: activeTab,
      onChange: (k: string) => setActiveTab(k),
    }),
    // Skill source config modal
    React.createElement(SourceConfigModal, {
      open: sourceConfigOpen,
      onClose: () => setSourceConfigOpen(false),
      sources: githubSources,
      onChange: (next: GitHubSkillSource[]) => {
        setGithubSources(next);
        loadGithubSkills(next);
      },
    }),
    // MCP source config modal
    React.createElement(GenericSourceConfigModal, {
      open: mcpSourceConfigOpen,
      onClose: () => setMcpSourceConfigOpen(false),
      sources: mcpSources,
      onChange: (next: GenericSource[]) => setMcpSources(next),
      type: "mcp",
    }),
    // Expert source config modal
    React.createElement(GenericSourceConfigModal, {
      open: expertSourceConfigOpen,
      onClose: () => setExpertSourceConfigOpen(false),
      sources: expertSources,
      onChange: (next: GenericSource[]) => setExpertSources(next),
      type: "expert",
    }),
  );
}

// ─── Welcome Prompts Injector ─────────────────────────────────────────────────
//
// A hidden React component registered via QP.chat.rightHeader.add() that
// stays mounted for the lifetime of the chat page.  It uses the host hook
// useSelectedAgent() to react to agent switches, fetches the agent's skills,
// and calls QP.chat.welcome.set() to:
//   1. Always set the UGSci-branded description.
//   2. When the agent has skills, inject { label, value } prompts derived
//      from those skills.
//   3. When the agent has no skills (or fetch fails), fall back to the
//      default prompt "能告诉我你都能做点什么吗".

/** Detect the current UI language (zh / en / ja / ru / vi / id). */
function detectLocale(): string {
  try {
    const stored = localStorage.getItem("language") || "";
    if (stored) return stored.split("-")[0];
  } catch {}
  const nav = (typeof navigator !== "undefined" ? navigator.language : "") || "";
  return nav.split("-")[0] || "en";
}

/** UGSci welcome description per locale. */
const UGSCI_DESCRIPTIONS: Record<string, string> = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya.",
};

/** Default prompt per locale (shown when agent has no skills). */
const UGSCI_DEFAULT_PROMPT: Record<string, { label: string; value: string }> = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" },
};

function WelcomePromptsInjector() {
  const host = getHost();
  const React = host.React;
  const { useEffect, useRef } = React;

  // useSelectedAgent() is a host hook that returns { id: string }.
  // It re-renders this component whenever the selected agent changes.
  const agentInfo = host.useSelectedAgent ? host.useSelectedAgent() : { id: "default" };
  const agentId = agentInfo?.id || "default";

  // Keep track of the last injected agent so we don't re-fetch unnecessarily.
  const lastInjectedRef = useRef<string | null>(null);
  // Keep the disposable returned by welcome.set() so we can clean up.
  const disposableRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (lastInjectedRef.current === agentId) return;
    lastInjectedRef.current = agentId;

    const locale = detectLocale();
    const description = UGSCI_DESCRIPTIONS[locale] || UGSCI_DESCRIPTIONS.en;
    const defaultPrompt = UGSCI_DEFAULT_PROMPT[locale] || UGSCI_DEFAULT_PROMPT.en;

    let cancelled = false;

    (async () => {
      try {
        const skills = await fetchAgentSkills(agentId);
        if (cancelled) return;

        const promptItems = extractPromptFromSkills(skills);

        // Dispose the previous registration before setting a new one.
        if (disposableRef.current) {
          try { disposableRef.current(); } catch {}
          disposableRef.current = null;
        }

        const QP = (window as any).QwenPaw;
        if (QP?.chat?.welcome) {
          if (promptItems.length > 0) {
            // Agent has skills — inject skill-derived prompts + UGSci description.
            disposableRef.current = QP.chat.welcome.set("ugsci", {
              description,
              prompts: promptItems,
            });
            console.info(
              `[ugsci] Injected ${promptItems.length} welcome prompts for agent "${agentId}"`,
            );
          } else {
            // No skills — use default prompt + UGSci description.
            disposableRef.current = QP.chat.welcome.set("ugsci", {
              description,
              prompts: [defaultPrompt],
            });
            console.info(
              `[ugsci] No skills for agent "${agentId}" — using default prompt`,
            );
          }
        }
      } catch (err) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${agentId}":`,
          err,
        );
        // On error, still set the description + default prompt.
        const QP = (window as any).QwenPaw;
        if (QP?.chat?.welcome && !cancelled) {
          if (disposableRef.current) {
            try { disposableRef.current(); } catch {}
            disposableRef.current = null;
          }
          disposableRef.current = QP.chat.welcome.set("ugsci", {
            description,
            prompts: [defaultPrompt],
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [agentId]);

  // Render nothing — this component exists only for its side effect.
  return null;
}

// ─── Plugin Registration ──────────────────────────────────────────────────────

function buildPlugin() {
  const QP = (window as any).QwenPaw;
  if (!QP?.menu || !QP?.route) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled",
    );
    return;
  }

  const React = getHost().React;
  const PLUGIN_ID = "ugsci";

  // ── Register Welcome Prompts Injector ────────────────────────────────
  // Register a hidden component in the rightHeader slot so it stays mounted
  // for the lifetime of the chat page and can react to agent switches.
  if (QP.chat?.rightHeader?.add) {
    QP.chat.rightHeader.add(PLUGIN_ID, React.createElement(WelcomePromptsInjector), {
      id: "ugsci.welcome-injector",
      order: -1, // render before other right-header items (invisible anyway)
    });
    console.info("[ugsci] WelcomePromptsInjector registered via rightHeader");
  } else {
    console.warn(
      "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled",
    );
  }

  // ── Register Routes + Menu Items ─────────────────────────────────────
  // Use the new QwenPaw.route.add / QwenPaw.menu.add API so items appear
  // in the agent-scoped section, not under plugins-group.

  const antdIcons = getHost().antdIcons || {};
  const UserSwitchOutlined = antdIcons.UserSwitchOutlined;
  const ToolOutlined = antdIcons.ToolOutlined;
  const ThunderboltOutlined = antdIcons.ThunderboltOutlined;
  const ShopOutlined = antdIcons.ShopOutlined;

  // Expert Center
  QP.route.add(PLUGIN_ID, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: ExpertCenterPage,
  });

  QP.menu.add(PLUGIN_ID, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家",
    icon: UserSwitchOutlined
      ? React.createElement(UserSwitchOutlined, { style: { fontSize: 16 } })
      : undefined,
    route: "ugsci.experts",
    order: 5,
    visible: () => isSimpleMode(),
  });

  // Capability Center → Tools
  QP.route.add(PLUGIN_ID, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: CapabilityCenterPage,
  });

  QP.menu.add(PLUGIN_ID, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "工具",
    icon: ToolOutlined
      ? React.createElement(ToolOutlined, { style: { fontSize: 16 } })
      : undefined,
    route: "ugsci.capabilities",
    order: 6,
    visible: () => isSimpleMode(),
  });

  // Skill Center → Skills
  QP.route.add(PLUGIN_ID, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: SkillCenterPage,
  });

  QP.menu.add(PLUGIN_ID, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能",
    icon: ThunderboltOutlined
      ? React.createElement(ThunderboltOutlined, { style: { fontSize: 16 } })
      : undefined,
    route: "ugsci.skills-center",
    order: 7,
    visible: () => isSimpleMode(),
  });

  // Marketplace
  QP.route.add(PLUGIN_ID, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: MarketplacePage,
  });

  QP.menu.add(PLUGIN_ID, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: ShopOutlined
      ? React.createElement(ShopOutlined, { style: { fontSize: 16 } })
      : undefined,
    route: "ugsci.market",
    order: 8,
    visible: () => isSimpleMode(),
  });

  // ── Register for Simple Mode ─────────────────────────────────────────
  // Register the center + marketplace IDs so they remain visible when the
  // user switches the sidebar to "simple" mode.
  if (QP.sidebar?.registerSimpleModeItems) {
    QP.sidebar.registerSimpleModeItems([
      "ugsci.experts",
      "ugsci.capabilities",
      "ugsci.skills-center",
      "ugsci.market",
    ]);
    console.info("[ugsci] Registered 4 items for simple-mode visibility");
  } else {
    console.warn(
      "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode",
    );
  }

  // ── Simplify Navigation (Simple Mode only) ────────────────────────────
  // In simple mode, hide these built-in items because the three UGSci
  // centers provide a simpler, domain-focused alternative.
  // In full mode, ALL built-in items remain visible (original QwenPaw).
  // Items are hidden (not removed) via menu.replace with visible callback.

  const hideItems = [
    "core.skills",
    "core.tools",
    "core.mcp",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool",
  ];

  for (const itemId of hideItems) {
    // Try agent-scoped location
    try {
      const snapshot = QP.menu.snapshot("primary.agentScoped");
      const existing = snapshot.find((i: any) => i.id === itemId);
      if (existing) {
        QP.menu.replace(PLUGIN_ID, itemId, {
          ...existing,
          visible: () => !isSimpleMode(),
        });
      }
    } catch {}
    // Also try settings location (for skill-pool)
    try {
      const snapshot = QP.menu.snapshot("primary.settings");
      const existing = snapshot.find((i: any) => i.id === itemId);
      if (existing) {
        QP.menu.replace(PLUGIN_ID, itemId, {
          ...existing,
          visible: () => !isSimpleMode(),
        });
      }
    } catch {}
  }

  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active",
  );
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

function tryBuildPlugin() {
  try {
    buildPlugin();
  } catch (err) {
    console.error("[ugsci] Failed to build plugin:", err);
    setTimeout(tryBuildPlugin, 500);
  }
}

// Wait for host to be ready
if ((window as any).QwenPaw?.host) {
  tryBuildPlugin();
} else {
  const interval = setInterval(() => {
    if ((window as any).QwenPaw?.host) {
      clearInterval(interval);
      tryBuildPlugin();
    }
  }, 200);
  setTimeout(() => clearInterval(interval), 10000);
}
