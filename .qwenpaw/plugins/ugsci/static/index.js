function T() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function na() {
  try {
    return T().getApiToken() || "";
  } catch {
    return "";
  }
}
function nt(e) {
  return T().getApiUrl(e);
}
function mn(e) {
  const t = na();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
const wt = /* @__PURE__ */ new Map(), aa = 15e3;
function Xe() {
  wt.clear();
}
async function ae(e, t) {
  const l = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: a, ...n } = t || {};
  if (l !== "GET" && Xe(), l === "GET" && !a) {
    const r = wt.get(e);
    if (r && Date.now() - r.ts < aa)
      return r.data;
  }
  const o = await fetch(nt(e), {
    ...n,
    headers: { ...mn(), ...n.headers || {} }
  });
  if (!o.ok) {
    const r = await o.text().catch(() => "");
    throw new Error(r || `HTTP ${o.status}`);
  }
  if (o.status === 204) return null;
  const i = await o.json();
  return l === "GET" && wt.set(e, { data: i, ts: Date.now() }), i;
}
async function Pt() {
  const e = await ae("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function yt(e) {
  return ae(`/agents/${encodeURIComponent(e)}`);
}
async function Et(e) {
  return await ae("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Ot(e = !1) {
  return await ae(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function la(e) {
  const t = await ae(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function oa() {
  return await ae("/skills/workspaces") || [];
}
async function ra(e) {
  return await ae("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function sa(e, t) {
  return ae(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function ia(e, t) {
  await ae(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function ca(e, t, l) {
  return ae("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ client_key: t, client: l })
  });
}
async function ma(e, t, l) {
  return ae(
    `/mcp/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function da(e, t) {
  return await ae(
    `/mcp/tools/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
async function ua(e, t) {
  return ae(
    `/mcp/policy/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  );
}
async function pa(e, t, l) {
  return ae(
    `/mcp/policy/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function ga(e) {
  return await ae(
    "/mcp/access-principals",
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
async function fa(e, t, l) {
  return ae(
    `/mcp/oauth/start/${encodeURIComponent(t)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function ya(e, t) {
  return ae(
    `/mcp/oauth/status/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  );
}
async function Ea(e, t) {
  await ae(
    `/mcp/oauth/${encodeURIComponent(t)}`,
    {
      method: "DELETE",
      headers: { "X-Agent-Id": e }
    }
  );
}
const Oe = {
  background: "#0072f5",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8
};
function He() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function At(e, t) {
  const l = T();
  return l.ReactMarkdown && l.remarkGfm ? t.createElement(
    l.ReactMarkdown,
    { remarkPlugins: [l.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
const Wt = [
  {
    id: "filesystem",
    name: "Filesystem",
    emoji: "📁",
    category: "文件系统",
    description: "模型上下文协议文件系统服务器，提供文件读写、目录浏览和搜索能力。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/"]
  },
  {
    id: "sqlite",
    name: "SQLite",
    emoji: "🗄️",
    category: "数据库",
    description: "SQLite 数据库 MCP 服务器，提供查询、表结构查看和数据操作能力。",
    transport: "stdio",
    command: "uvx",
    args: ["mcp-server-sqlite", "--db-path", "/path/to/database.db"]
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    emoji: "🐘",
    category: "数据库",
    description: "PostgreSQL 数据库 MCP 服务器，提供只读 SQL 查询和 schema 探索能力。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-postgres"],
    env: {
      POSTGRES_CONNECTION_STRING: "postgresql://user:password@localhost:5432/dbname"
    }
  },
  {
    id: "brave-search",
    name: "Brave Search",
    emoji: "🔍",
    category: "搜索",
    description: "Brave Search MCP 服务器，提供网络搜索和本地搜索能力。需要 Brave API Key。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-brave-search"],
    env: {
      BRAVE_API_KEY: "your-brave-api-key"
    }
  },
  {
    id: "github",
    name: "GitHub",
    emoji: "🐙",
    category: "开发工具",
    description: "GitHub MCP 服务器，提供仓库管理、Issue / PR 操作、代码搜索和文件操作能力。需要 GitHub Token。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    env: {
      GITHUB_PERSONAL_ACCESS_TOKEN: "your-github-token"
    }
  },
  {
    id: "gitlab",
    name: "GitLab",
    emoji: "🦊",
    category: "开发工具",
    description: "GitLab MCP 服务器，提供项目管理、Merge Request 操作和 CI/CD 流水线能力。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-gitlab"],
    env: {
      GITLAB_PERSONAL_ACCESS_TOKEN: "your-gitlab-token",
      GITLAB_API_URL: "https://gitlab.com/api/v4"
    }
  },
  {
    id: "fetch",
    name: "Fetch",
    emoji: "🌐",
    category: "网络工具",
    description: "Fetch MCP 服务器，提供 URL 内容抓取和网页转 Markdown 能力。",
    transport: "stdio",
    command: "uvx",
    args: ["mcp-server-fetch"]
  },
  {
    id: "memory",
    name: "Memory",
    emoji: "🧠",
    category: "知识管理",
    description: "Memory MCP 服务器，提供基于知识图谱的长期记忆存储和检索能力。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-memory"]
  },
  {
    id: "puppeteer",
    name: "Puppeteer",
    emoji: "🎭",
    category: "浏览器自动化",
    description: "Puppeteer MCP 服务器，提供浏览器自动化、网页截图和 PDF 生成能力。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-puppeteer"]
  },
  {
    id: "sequential-thinking",
    name: "Sequential Thinking",
    emoji: "💭",
    category: "推理增强",
    description: "Sequential Thinking MCP 服务器，提供结构化的逐步推理和问题分解能力。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-sequential-thinking"]
  },
  {
    id: "everart",
    name: "EverArt",
    emoji: "🎨",
    category: "AI 生成",
    description: "EverArt MCP 服务器，提供 AI 图像生成能力。需要 EverArt API Key。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-everart"],
    env: {
      EVERART_API_KEY: "your-everart-api-key"
    }
  },
  {
    id: "google-drive",
    name: "Google Drive",
    emoji: "📁",
    category: "云存储",
    description: "Google Drive MCP 服务器，提供 Google Drive 文件搜索和内容访问能力。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-google-drive"]
  },
  {
    id: "slack",
    name: "Slack",
    emoji: "💬",
    category: "通讯协作",
    description: "Slack MCP 服务器，提供频道消息发送、列表查看和消息搜索能力。需要 Slack Bot Token。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-slack"],
    env: {
      SLACK_BOT_TOKEN: "xoxb-your-bot-token",
      SLACK_TEAM_ID: "your-team-id"
    }
  },
  {
    id: "time",
    name: "Time",
    emoji: "⏰",
    category: "工具",
    description: "Time MCP 服务器，提供时间查询和时区转换能力。",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-time"]
  },
  {
    id: "exa-search",
    name: "Exa AI Search",
    emoji: "🔬",
    category: "搜索",
    description: "Exa AI 学术搜索 MCP 服务器，提供实时学术论文搜索和引用获取能力。适合科研场景。",
    transport: "streamable_http",
    url: "https://mcp.exa.ai/mcp"
  },
  {
    id: "comsol-mcp",
    name: "COMSOL Multiphysics",
    emoji: "🔧",
    category: "仿真工程",
    description: "COMSOL Multiphysics MCP 服务器，提供有限元仿真建模、求解和结果分析能力。适合多物理场耦合仿真场景。",
    transport: "stdio",
    command: "python",
    args: ["-m", "comsol_mcp"]
  }
], Kt = {
  BRAVE_API_KEY: {
    label: "Brave API Key",
    help: "在 Brave Search API 官网注册获取",
    link: "https://brave.com/search/api/",
    isSecret: !0
  },
  GITHUB_PERSONAL_ACCESS_TOKEN: {
    label: "GitHub Personal Access Token",
    help: "GitHub Settings → Developer settings → Personal access tokens",
    link: "https://github.com/settings/tokens",
    isSecret: !0
  },
  GITLAB_PERSONAL_ACCESS_TOKEN: {
    label: "GitLab Personal Access Token",
    help: "GitLab User Settings → Access Tokens",
    link: "https://gitlab.com/-/user_settings/personal_access_tokens",
    isSecret: !0
  },
  GITLAB_API_URL: {
    label: "GitLab API URL",
    help: "默认为 https://gitlab.com/api/v4，自建实例请修改",
    isSecret: !1
  },
  EVERART_API_KEY: {
    label: "EverArt API Key",
    help: "在 EverArt 官网获取 API Key",
    link: "https://everart.ai/",
    isSecret: !0
  },
  SLACK_BOT_TOKEN: {
    label: "Slack Bot Token",
    help: "以 xoxb- 开头，在 Slack App 设置中获取",
    link: "https://api.slack.com/apps",
    isSecret: !0
  },
  SLACK_TEAM_ID: {
    label: "Slack Team ID",
    help: "在 Slack 工作区设置中查看 Team ID",
    isSecret: !1
  },
  POSTGRES_CONNECTION_STRING: {
    label: "PostgreSQL 连接串",
    help: "格式: postgresql://user:password@host:port/dbname",
    isSecret: !0
  }
};
function ha(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, l]) => typeof l == "string" && l.length > 0);
}
const va = [
  {
    id: "reservoir-engineer",
    name: "油藏工程师",
    category: "油气开发",
    description: "**油藏工程师** —— 擅长储量评估、物质平衡计算、递减曲线分析、油藏数值模拟方案设计。",
    version: "1.0.0",
    author: "UGSci Team",
    tags: ["油藏", "数值模拟", "储量评估", "历史拟合"],
    avatar_seed: "油藏工程师",
    system_prompt: `# 油藏工程师

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
    recommended_skills: [
      "oil-gas-foundation",
      "oil-gas-reservoir-production",
      "reservoir-simulation-workflow",
      "history-matching",
      "convergence-diagnosis",
      "matplotlib",
      "statistical-analysis",
      "sensitivity-analysis"
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "AUTO"
  },
  {
    id: "drilling-engineer",
    name: "钻井工程师",
    category: "钻完井",
    description: "**钻井工程师** —— 擅长井身结构设计、钻井液优化、套管设计、固井方案和钻井风险管理。",
    version: "1.0.0",
    author: "UGSci Team",
    tags: ["钻井", "套管设计", "钻井液", "固井"],
    avatar_seed: "钻井工程师",
    system_prompt: `# 钻井工程师

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
    recommended_skills: [
      "oil-gas-foundation",
      "oil-gas-drilling",
      "oil-gas-reservoir-production",
      "matplotlib",
      "statistical-analysis",
      "systematic-debugging"
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "MANUAL"
  },
  {
    id: "well-logging-analyst",
    name: "测井分析师",
    category: "测井试油",
    description: "**测井分析师** —— 擅长测井曲线解释、岩性识别、孔隙度/饱和度计算和储层评价。",
    version: "1.0.0",
    author: "UGSci Team",
    tags: ["测井", "岩性识别", "储层评价", "孔隙度"],
    avatar_seed: "测井分析师",
    system_prompt: `# 测井分析师

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
    recommended_skills: [
      "oil-gas-foundation",
      "well-log-analysis",
      "oil-gas-exploration",
      "exploratory-data-analysis",
      "matplotlib",
      "statistical-analysis",
      "scikit-learn"
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "AUTO"
  },
  {
    id: "production-engineer",
    name: "采油工程师",
    category: "油气生产",
    description: "**采油工程师** —— 擅长举升工艺设计、注水管理、增产措施工艺设计和生产动态监测。",
    version: "1.0.0",
    author: "UGSci Team",
    tags: ["采油", "举升工艺", "注水", "压裂酸化"],
    avatar_seed: "采油工程师",
    system_prompt: `# 采油工程师

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
    recommended_skills: [
      "oil-gas-foundation",
      "oil-gas-reservoir-production",
      "scada-timeseries",
      "matplotlib",
      "statistical-analysis",
      "sensitivity-analysis",
      "multi-objective-optimization"
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "AUTO"
  },
  {
    id: "geophysicist",
    name: "地球物理专家",
    category: "地球物理",
    description: "**地球物理专家** —— 擅长地震资料解释、属性分析、反演处理和储层预测。",
    version: "1.0.0",
    author: "UGSci Team",
    tags: ["地球物理", "地震", "反演", "储层预测"],
    avatar_seed: "地球物理专家",
    system_prompt: `# 地球物理专家

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
    recommended_skills: [
      "oil-gas-foundation",
      "oil-gas-exploration",
      "segy-operations",
      "matplotlib",
      "statistical-analysis",
      "exploratory-data-analysis",
      "scikit-learn"
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "AUTO"
  },
  {
    id: "pvt-analyst",
    name: "PVT 分析师",
    category: "流体性质",
    description: "**PVT 分析师** —— 擅长油气流体物性计算、相态分析、PVT 实验拟合和组分模型。",
    version: "1.0.0",
    author: "UGSci Team",
    tags: ["PVT", "相态分析", "流体物性", "状态方程"],
    avatar_seed: "PVT 分析师",
    system_prompt: `# PVT 分析师

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
    recommended_skills: [
      "oil-gas-foundation",
      "oil-gas-reservoir-production",
      "matplotlib",
      "statistical-analysis",
      "sensitivity-analysis",
      "sympy",
      "pymoo"
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "AUTO"
  }
], xt = va, dn = "ugsci_custom_teams";
function ut() {
  try {
    const e = localStorage.getItem(dn);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function un(e) {
  try {
    localStorage.setItem(dn, JSON.stringify(e));
  } catch {
  }
}
const ba = [
  {
    id: "reservoir-eval-team",
    name: "储层评价团队",
    emoji: "🛢️",
    category: "油气勘探",
    mode: "pipeline",
    description: "从测井解释到储量计算的完整储层评价流程，依次调用测井分析师、地球物理专家和油藏工程师",
    members: [
      { name: "测井分析师", role: "岩性识别与孔隙度计算", emoji: "📡" },
      { name: "地球物理专家", role: "储层预测与含油气检测", emoji: "🌍" },
      { name: "油藏工程师", role: "储量评估与开发建议", emoji: "🛢️" }
    ],
    taskTemplate: `请对以下区块进行储层评价：
区块名称：{区块名}
井号：{井号}
评价要求：依次咨询测井分析师（岩性解释和孔隙度参数）、地球物理专家（储层预测和含油气性检测）、油藏工程师（储量计算和开发建议），综合形成储层评价报告。`,
    orchestrationPrompt: `你是一个储层评价团队的协调者。请按照以下流程依次咨询团队成员：
1. 先用 list_agents() 查看可用专家
2. 向测井分析师发送岩性解释和孔隙度计算请求
3. 将测井结果传递给地球物理专家，请求储层预测
4. 将前两步结果传递给油藏工程师，请求储量评估
5. 综合三位专家的结果，形成统一的储层评价报告

重要：每步咨询使用 chat_with_agent，传递上一步的结果作为上下文。`
  },
  {
    id: "drilling-design-team",
    name: "钻井设计团队",
    emoji: "⛏️",
    category: "钻完井",
    mode: "coordinator",
    description: "由钻井工程师主导，协调地球物理专家（地层预测）和采油工程师（完井方案），完成钻井工程设计",
    members: [
      { name: "钻井工程师", role: "井身结构与套管设计", emoji: "⛏️" },
      { name: "地球物理专家", role: "地层压力预测", emoji: "🌍" },
      { name: "采油工程师", role: "完井方案建议", emoji: "⚙️" }
    ],
    coordinatorName: "钻井工程师",
    taskTemplate: `请为以下井进行钻井工程设计：
井名：{井名}
设计深度：{深度}m
设计要求：请协调地球物理专家进行地层压力预测，然后由你完成井身结构设计，最后咨询采油工程师确定完井方案。`,
    orchestrationPrompt: `你是钻井设计团队的协调者（钻井工程师）。请按以下步骤工作：
1. 用 list_agents() 查看可用专家
2. 向地球物理专家发送地层压力预测请求
3. 基于压力预测结果，完成井身结构设计和套管设计
4. 向采油工程师发送完井方案咨询请求
5. 综合所有结果，输出完整的钻井工程设计方案

注意：每步使用 chat_with_agent 咨询，传递已获取的参数。`
  },
  {
    id: "development-plan-team",
    name: "开发方案评审团队",
    emoji: "📋",
    category: "油气开发",
    mode: "roundtable",
    description: "油藏工程师、钻井工程师和采油工程师独立评估同一区块的开发方案，对比不同视角后综合出最优方案",
    members: [
      { name: "油藏工程师", role: "储量与开发方式评估", emoji: "🛢️" },
      { name: "钻井工程师", role: "工程可行性评估", emoji: "⛏️" },
      { name: "采油工程师", role: "生产工艺评估", emoji: "⚙️" }
    ],
    taskTemplate: `请对以下区块的开发方案进行多角度评审：
区块名称：{区块名}
方案概述：{方案概述}
评审要求：请分别咨询油藏工程师（储量和开发方式）、钻井工程师（工程可行性）、采油工程师（生产工艺），各自独立给出评估意见，然后对比综合形成最终建议。`,
    orchestrationPrompt: `你是开发方案评审团队的协调者。请按以下步骤工作：
1. 用 list_agents() 查看可用专家
2. 分别向油藏工程师、钻井工程师、采油工程师发送同一评审请求（独立评估，不传递他人意见）
3. 收集三位专家的独立意见后，对比分析各自观点
4. 综合形成最终的开发方案建议，包含各专业领域的考虑

重要：三位专家应独立评估，不要将一位专家的意见传递给另一位。`
  },
  {
    id: "pvt-analysis-team",
    name: "流体性质分析团队",
    emoji: "🧪",
    category: "流体性质",
    mode: "pipeline",
    description: "PVT分析师进行流体物性计算，地球物理专家辅助相态验证，油藏工程师完成开发方案适配",
    members: [
      { name: "PVT 分析师", role: "PVT实验拟合与物性计算", emoji: "🧪" },
      { name: "地球物理专家", role: "相态行为验证", emoji: "🌍" },
      { name: "油藏工程师", role: "开发方式适配", emoji: "🛢️" }
    ],
    taskTemplate: `请对以下流体样品进行PVT分析：
样品来源：{井号}-{层位}
实验数据：{实验数据概述}
分析要求：依次咨询PVT分析师（物性计算和相态分析）、地球物理专家（相态验证）、油藏工程师（开发方式建议），形成完整的流体评价报告。`,
    orchestrationPrompt: `你是流体性质分析团队的协调者。请按以下步骤工作：
1. 用 list_agents() 查看可用专家
2. 向PVT分析师发送流体物性计算和相态分析请求
3. 将PVT分析结果传递给地球物理专家，请求相态行为验证
4. 将前两步结果传递给油藏工程师，请求开发方式适配建议
5. 综合形成完整的流体性质评价报告

注意：每步使用 chat_with_agent 咨询，传递上一步的完整结果。`
  }
];
async function Sa(e, t) {
  const l = {
    channel: "console",
    user_id: "default",
    session_id: `team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    input: [
      {
        role: "user",
        content: [{ type: "text", text: t }]
      }
    ]
  };
  await fetch(nt("/console/chat"), {
    method: "POST",
    headers: {
      ...mn(),
      "X-Agent-Id": e
    },
    body: JSON.stringify(l)
  });
}
function pt(e, t) {
  const l = e.find(
    (n) => n.name === t || n.name === t.replace(/\s+/g, "")
  );
  if (l) return l.id;
  const a = e.find(
    (n) => n.name.includes(t) || t.includes(n.name) || n.name.replace(/\s+/g, "").includes(t.replace(/\s+/g, ""))
  );
  return a ? a.id : null;
}
function wa(e) {
  var l;
  const t = e.members.map((a) => `- ${a.name}（${a.role}）`).join(`
`);
  if (e.custom && e.steps && e.steps.length > 0) {
    const a = e.steps.map((o, i) => {
      const r = o.passContext ? "（传递上一步的结果作为上下文）" : "（独立执行，不传递上下文）";
      return `${i + 1}. 向「${o.agentName}」发送请求：${o.instruction} ${r}`;
    }).join(`
`);
    return `${e.mode === "pipeline" ? "请按顺序依次执行以下步骤，每步使用 chat_with_agent 咨询对应专家：" : e.mode === "roundtable" ? "请同时向以下专家分别发送独立请求（不传递上下文），收集所有结果后综合：" : `你是团队协调者（${e.coordinatorName || ((l = e.members[0]) == null ? void 0 : l.name) || ""}），请按需调用以下专家完成任务：`}

---

## 团队任务

${e.taskTemplate}

---

## 执行步骤

${a}

---

## 团队成员

${t}

---

请现在开始执行团队任务。首先使用 list_agents() 确认可用专家，然后按照上述步骤依次/同时咨询各成员。每步结果请明确标注来自哪位专家。`;
  }
  return `${e.orchestrationPrompt}

---

## 团队任务

${e.taskTemplate}

---

## 团队成员

${t}

---

请现在开始执行团队任务。首先使用 list_agents() 查看可用专家，然后按照上述流程依次咨询各成员。`;
}
function xa({ team: e }) {
  const t = T().React, { Typography: l, Tag: a } = T().antd, { Text: n } = l, o = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙"
  }, i = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff"
  }, r = e.steps || [], u = r.length > 0;
  return t.createElement(
    "div",
    {
      style: {
        padding: "12px 16px",
        background: "#fafafa",
        borderRadius: 8,
        border: "1px dashed #d9d9d9"
      }
    },
    t.createElement(
      n,
      {
        type: "secondary",
        style: { fontSize: 12, display: "block", marginBottom: 8 }
      },
      `执行流程 (${e.mode === "pipeline" ? "流水线" : e.mode === "roundtable" ? "圆桌讨论" : "协调者模式"})`
    ),
    // Visual flow
    t.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: e.mode === "roundtable" ? "row" : "column",
          gap: 8,
          alignItems: e.mode === "roundtable" ? "flex-start" : "stretch",
          flexWrap: "wrap"
        }
      },
      ...u ? r.map((s, d) => (e.members.find(
        (I) => I.name === s.agentName
      ), [
        d > 0 && e.mode !== "roundtable" ? t.createElement(
          "div",
          {
            key: `arrow-${d}`,
            style: {
              textAlign: "center",
              color: i[e.mode],
              fontSize: 14
            }
          },
          o[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `step-${d}`,
            style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: "#fff",
              borderRadius: 6,
              border: `1px solid ${i[e.mode]}33`,
              fontSize: 12,
              flex: e.mode === "roundtable" ? "1 1 200px" : "initial"
            }
          },
          t.createElement(Re, {
            name: s.agentName,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              n,
              { strong: !0, style: { fontSize: 12 } },
              s.agentName
            ),
            t.createElement(
              "div",
              {
                style: {
                  fontSize: 11,
                  color: "#8c8c8c",
                  maxWidth: 250
                }
              },
              s.instruction
            ),
            s.passContext ? t.createElement(
              a,
              {
                color: "blue",
                style: { fontSize: 9, marginTop: 2 }
              },
              "传递上下文"
            ) : t.createElement(
              a,
              { style: { fontSize: 9, marginTop: 2 } },
              "独立"
            )
          )
        )
      ])).flat() : e.members.map((s, d) => [
        d > 0 && e.mode !== "roundtable" ? t.createElement(
          "div",
          {
            key: `arrow-${d}`,
            style: {
              textAlign: "center",
              color: i[e.mode],
              fontSize: 14
            }
          },
          o[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `member-${d}`,
            style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: "#fff",
              borderRadius: 6,
              border: `1px solid ${i[e.mode]}33`,
              fontSize: 12,
              flex: e.mode === "roundtable" ? "1 1 150px" : "initial"
            }
          },
          t.createElement(Re, { name: s.name, size: 24 }),
          t.createElement(
            "div",
            null,
            t.createElement(
              n,
              { strong: !0, style: { fontSize: 12 } },
              s.name
            ),
            t.createElement(
              "div",
              { style: { fontSize: 11, color: "#8c8c8c" } },
              s.role
            )
          )
        )
      ]).flat()
    )
  );
}
function Ca({
  open: e,
  onClose: t,
  agents: l,
  editingTeam: a,
  onSaved: n
}) {
  const o = T().React, { useState: i, useEffect: r, useCallback: u } = o, {
    Modal: s,
    Input: d,
    Button: I,
    Select: A,
    Tag: _,
    Typography: S,
    Switch: p,
    Empty: $,
    message: M,
    Divider: V,
    Steps: R
  } = T().antd, { PlusOutlined: Z, DeleteOutlined: j, SaveOutlined: U, ArrowRightOutlined: P } = T().antdIcons || {}, { Text: x, Paragraph: C } = S, [K, N] = i(""), [O, E] = i("🤝"), [v, f] = i(""), [X, F] = i(
    "pipeline"
  ), [ne, w] = i(""), [g, h] = i(""), [b, oe] = i([]), [L, Y] = i([]), [re, B] = i(!1);
  r(() => {
    e && (a ? (N(a.name), E(a.emoji), f(a.description), F(a.mode), w(a.coordinatorName || ""), h(a.taskTemplate), oe(a.steps || []), Y(a.members.map((z) => z.name))) : (N(""), E("🤝"), f(""), F("pipeline"), w(""), h(`请执行以下任务：
任务描述：{任务描述}`), oe([]), Y([])));
  }, [e, a]);
  const W = u(() => {
    if (X === "roundtable") {
      const z = L.map((le) => ({
        agentName: le,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      oe(z);
    } else if (X === "pipeline") {
      const z = new Map(b.map((de) => [de.agentName, de])), le = L.map((de) => z.get(de) || {
        agentName: de,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      oe(le);
    }
  }, [X, L, b]), se = (z) => {
    L.includes(z) || (Y([...L, z]), X === "coordinator" && !ne && w(z));
  }, y = (z) => {
    Y(L.filter((le) => le !== z)), oe(b.filter((le) => le.agentName !== z)), ne === z && w(L[0] || "");
  }, te = (z, le, de) => {
    const fe = [...b];
    fe[z] = { ...fe[z], [le]: de }, oe(fe);
  }, c = () => {
    if (!K.trim()) {
      M.warning("请输入团队名称");
      return;
    }
    if (L.length < 2) {
      M.warning("至少需要选择 2 个成员");
      return;
    }
    if (!g.trim()) {
      M.warning("请输入任务模板");
      return;
    }
    if (X === "coordinator" && !ne) {
      M.warning("请选择协调者");
      return;
    }
    B(!0);
    try {
      const z = L.map(
        (ue) => {
          var J;
          const q = l.find((k) => k.name === ue);
          return {
            name: ue,
            role: ((J = q == null ? void 0 : q.description) == null ? void 0 : J.slice(0, 30)) || "团队成员",
            emoji: ""
          };
        }
      );
      let le = b;
      (b.length === 0 || b.length !== L.length) && (le = L.map((ue) => ({
        agentName: ue,
        instruction: "请完成你的专业部分",
        passContext: X === "pipeline"
      })));
      const de = {
        id: (a == null ? void 0 : a.id) || `custom-${Date.now()}`,
        name: K.trim(),
        emoji: O,
        category: "自定义",
        description: v.trim() || `${K.trim()}（${L.length}人团队）`,
        mode: X,
        members: z,
        coordinatorName: X === "coordinator" ? ne : void 0,
        taskTemplate: g.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: le,
        custom: !0,
        createdAt: (a == null ? void 0 : a.createdAt) || Date.now()
      }, fe = ut(), ge = fe.findIndex((ue) => ue.id === de.id);
      ge >= 0 ? fe[ge] = de : fe.push(de), un(fe), M.success(a ? "团队已更新" : "团队已创建"), n(), t();
    } catch (z) {
      M.error(z.message || "保存失败");
    } finally {
      B(!1);
    }
  }, ee = l.filter(
    (z) => !L.includes(z.name)
  );
  return o.createElement(
    s,
    {
      open: e,
      onCancel: t,
      title: o.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        o.createElement(
          "span",
          { style: { fontSize: 20 } },
          a ? "✏️" : "➕"
        ),
        o.createElement(
          "span",
          null,
          a ? "编辑专家团" : "创建专家团"
        )
      ),
      width: 720,
      onOk: c,
      okText: "保存团队",
      confirmLoading: re,
      okButtonProps: {
        icon: U ? o.createElement(U) : void 0
      }
    },
    // Step 1: Basic info
    o.createElement(
      "div",
      { style: { marginBottom: 16 } },
      o.createElement(
        x,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 基本信息"
      ),
      o.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        L.length > 0 ? o.createElement(jt, {
          members: L,
          size: 36
        }) : null,
        o.createElement(d, {
          placeholder: "团队名称（如：储层评价团队）",
          value: K,
          onChange: (z) => N(z.target.value),
          style: { flex: 1 }
        })
      ),
      o.createElement(d.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: v,
        onChange: (z) => f(z.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      o.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        o.createElement(
          x,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式："
        ),
        o.createElement(A, {
          value: X,
          onChange: (z) => F(z),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" }
          ]
        })
      )
    ),
    o.createElement(V, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    o.createElement(
      "div",
      { style: { marginBottom: 16 } },
      o.createElement(
        x,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 选择团队成员"
      ),
      // Available agents
      ee.length > 0 ? o.createElement(
        "div",
        {
          style: {
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 8,
            padding: 8,
            background: "#f5f5f5",
            borderRadius: 6
          }
        },
        ...ee.map(
          (z) => o.createElement(
            I,
            {
              key: z.id,
              size: "small",
              icon: Z ? o.createElement(Z) : void 0,
              onClick: () => se(z.name)
            },
            z.name
          )
        )
      ) : null,
      // Selected members
      L.length === 0 ? o.createElement($, {
        description: "请从上方添加团队成员",
        image: $.PRESENTED_IMAGE_SIMPLE
      }) : o.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...L.map(
          (z) => o.createElement(
            "div",
            {
              key: z,
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 10px",
                background: "#f0f5ff",
                borderRadius: 6,
                border: "1px solid #d6e4ff"
              }
            },
            o.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 6 } },
              o.createElement(Re, { name: z, size: 24 }),
              o.createElement(
                x,
                { strong: !0, style: { fontSize: 13 } },
                z
              ),
              X === "coordinator" && ne === z ? o.createElement(
                _,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            o.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              X === "coordinator" ? o.createElement(
                I,
                {
                  size: "small",
                  type: "link",
                  onClick: () => w(z)
                },
                "设为协调者"
              ) : null,
              o.createElement(
                I,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: j ? o.createElement(j) : void 0,
                  onClick: () => y(z)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    o.createElement(V, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    L.length > 0 ? o.createElement(
      "div",
      { style: { marginBottom: 16 } },
      o.createElement(
        x,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${X === "roundtable" ? "（各步独立执行）" : X === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      o.createElement(
        I,
        {
          size: "small",
          type: "dashed",
          onClick: W,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      b.length === 0 ? o.createElement(
        x,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : o.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...b.map(
          (z, le) => o.createElement(
            "div",
            {
              key: le,
              style: {
                padding: 8,
                background: "#fff",
                borderRadius: 6,
                border: "1px solid #e8e8e8"
              }
            },
            o.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6
                }
              },
              X === "pipeline" ? o.createElement(
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
                    fontWeight: 600
                  }
                },
                `${le + 1}`
              ) : o.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              o.createElement(
                _,
                { color: "blue", style: { fontSize: 11 } },
                z.agentName
              ),
              o.createElement(
                "div",
                { style: { flex: 1 } },
                o.createElement(d, {
                  placeholder: "请输入该步骤的指令...",
                  value: z.instruction,
                  onChange: (de) => te(le, "instruction", de.target.value),
                  size: "small"
                })
              )
            ),
            o.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  paddingLeft: 28
                }
              },
              o.createElement(p, {
                size: "small",
                checked: z.passContext,
                onChange: (de) => te(le, "passContext", de)
              }),
              o.createElement(
                x,
                { type: "secondary", style: { fontSize: 11 } },
                z.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    o.createElement(V, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    o.createElement(
      "div",
      null,
      o.createElement(
        x,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${L.length > 0 ? "4" : "3"}. 任务模板`
      ),
      o.createElement(d.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: g,
        onChange: (z) => h(z.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      o.createElement(
        x,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function Xt({
  team: e,
  agents: t,
  onLaunch: l,
  onEdit: a,
  onDelete: n
}) {
  var v;
  const o = T().React, { useState: i } = o, { Card: r, Tag: u, Typography: s, Button: d, Tooltip: I } = T().antd, {
    TeamOutlined: A,
    RocketOutlined: _,
    UserOutlined: S,
    EditOutlined: p,
    DeleteOutlined: $,
    DownOutlined: M,
    UpOutlined: V
  } = T().antdIcons || {}, { Text: R, Paragraph: Z } = s, [j, U] = i(!1), P = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, x = P[e.mode] || P.coordinator, C = e.members.map((f) => {
    const X = pt(t, f.name);
    return { ...f, found: !!X, agentId: X };
  }), K = C.filter((f) => f.found).length, N = K === e.members.length, O = e.coordinatorName || ((v = e.members[0]) == null ? void 0 : v.name), E = O ? pt(t, O) : null;
  return o.createElement(
    r,
    {
      hoverable: !0,
      size: "small",
      style: { height: "100%", display: "flex", flexDirection: "column" }
    },
    // Header: emoji + name + mode tag + custom badge
    o.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10
        }
      },
      o.createElement(jt, {
        members: e.members.map((f) => f.name),
        size: 36
      }),
      o.createElement(
        "div",
        { style: { flex: 1 } },
        o.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          o.createElement(
            R,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? o.createElement(
            u,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        o.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          o.createElement(
            u,
            { color: x.color, style: { fontSize: 10 } },
            x.label
          ),
          o.createElement(
            u,
            { style: { fontSize: 10 } },
            `${K}/${e.members.length}`
          ),
          N ? null : o.createElement(
            u,
            { color: "orange", style: { fontSize: 10 } },
            "缺少成员"
          )
        )
      ),
      // Edit/delete for custom teams
      e.custom ? o.createElement(
        "div",
        { style: { display: "flex", gap: 2 } },
        a ? o.createElement(
          I,
          { title: "编辑" },
          o.createElement(d, {
            type: "text",
            size: "small",
            icon: p ? o.createElement(p) : void 0,
            onClick: (f) => {
              f.stopPropagation(), a(e);
            }
          })
        ) : null,
        n ? o.createElement(
          I,
          { title: "删除" },
          o.createElement(d, {
            type: "text",
            size: "small",
            danger: !0,
            icon: $ ? o.createElement($) : void 0,
            onClick: (f) => {
              f.stopPropagation(), n(e);
            }
          })
        ) : null
      ) : null
    ),
    // Description
    o.createElement(
      Z,
      {
        type: "secondary",
        style: { fontSize: 12, margin: 0, marginBottom: 10, lineHeight: 1.5 },
        ellipsis: { rows: 2 }
      },
      e.description
    ),
    // Member avatars
    o.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 6,
          marginBottom: 10,
          flexWrap: "wrap"
        }
      },
      ...C.map(
        (f) => o.createElement(
          I,
          {
            key: f.name,
            title: `${f.name}（${f.role}）${f.found ? "" : " - 未创建"}`
          },
          o.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                borderRadius: 12,
                background: f.found ? "#f0f5ff" : "#fff2f0",
                border: `1px solid ${f.found ? "#d6e4ff" : "#ffccc7"}`,
                fontSize: 11
              }
            },
            o.createElement(Re, { name: f.name, size: 18 }),
            o.createElement(
              R,
              {
                style: { fontSize: 11, color: f.found ? "#1f4e8c" : "#cf1322" }
              },
              f.name
            )
          )
        )
      )
    ),
    // Toggle flow diagram
    o.createElement(
      d,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (f) => {
          f.stopPropagation(), U(!j);
        },
        icon: j ? V ? o.createElement(V) : "▲" : M ? o.createElement(M) : "▼"
      },
      j ? "收起流程" : "查看执行流程"
    ),
    j ? o.createElement(xa, { team: e }) : null,
    // Footer: launch button
    o.createElement(
      "div",
      {
        style: {
          marginTop: "auto",
          paddingTop: 8,
          borderTop: "1px solid #f0f0f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }
      },
      o.createElement(
        R,
        { type: "secondary", style: { fontSize: 11 } },
        O ? `协调者: ${O}` : ""
      ),
      o.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: _ ? o.createElement(_) : void 0,
          disabled: !E,
          onClick: () => l(e),
          style: Oe
        },
        "发起团队任务"
      )
    )
  );
}
function ka({
  agents: e,
  onLaunch: t
}) {
  const l = T().React, { useMemo: a, useState: n, useCallback: o, useEffect: i } = l, {
    Row: r,
    Col: u,
    Input: s,
    Empty: d,
    Typography: I,
    Tag: A,
    Button: _,
    Divider: S,
    message: p,
    Popconfirm: $
  } = T().antd, { SearchOutlined: M, TeamOutlined: V, PlusOutlined: R, RocketOutlined: Z } = T().antdIcons || {}, { Text: j } = I, [U, P] = n(""), [x, C] = n([]), [K, N] = n(!1), [O, E] = n(null);
  i(() => {
    C(ut());
  }, []);
  const v = o(() => {
    C(ut());
  }, []), f = o(
    (b) => {
      const L = ut().filter((Y) => Y.id !== b.id);
      un(L), C(L), p.success(`团队「${b.name}」已删除`);
    },
    [p]
  ), X = o((b) => {
    E(b), N(!0);
  }, []), F = o(() => {
    E(null), N(!0);
  }, []), ne = a(() => [...x, ...ba], [x]), w = a(() => {
    if (!U.trim()) return ne;
    const b = U.toLowerCase();
    return ne.filter(
      (oe) => oe.name.toLowerCase().includes(b) || oe.description.toLowerCase().includes(b) || oe.category.toLowerCase().includes(b)
    );
  }, [ne, U]), g = w.filter((b) => b.custom), h = w.filter((b) => !b.custom);
  return l.createElement(
    "div",
    null,
    // Info banner
    l.createElement(
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
          alignItems: "center"
        }
      },
      l.createElement(
        j,
        { style: { fontSize: 13, color: "#389e0d" } },
        "多智能体协同 — 选择预设团队或创建自定义团队，支持流水线、圆桌讨论、协调者三种编排模式。"
      ),
      l.createElement(
        _,
        {
          type: "primary",
          size: "small",
          icon: R ? l.createElement(R) : void 0,
          onClick: F,
          style: Oe
        },
        "创建专家团"
      )
    ),
    // Search
    l.createElement(s, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: M ? l.createElement(M) : void 0,
      value: U,
      onChange: (b) => P(b.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Custom teams section
    g.length > 0 ? l.createElement(
      "div",
      { style: { marginBottom: 20 } },
      l.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 10
          }
        },
        l.createElement("span", { style: { fontSize: 16 } }),
        l.createElement(
          j,
          { strong: !0, style: { fontSize: 14 } },
          `自定义团队 (${g.length})`
        )
      ),
      l.createElement(
        r,
        { gutter: [12, 12] },
        ...g.map(
          (b) => l.createElement(
            u,
            { key: b.id, xs: 24, sm: 12, md: 8 },
            l.createElement(Xt, {
              team: b,
              agents: e,
              onLaunch: t,
              onEdit: X,
              onDelete: f
            })
          )
        )
      ),
      l.createElement(S, { style: { margin: "16px 0" } })
    ) : null,
    // Preset teams section
    h.length > 0 ? l.createElement(
      "div",
      null,
      l.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 10
          }
        },
        l.createElement("span", { style: { fontSize: 16 } }),
        l.createElement(
          j,
          { strong: !0, style: { fontSize: 14 } },
          `预设团队 (${h.length})`
        ),
        l.createElement(
          j,
          { type: "secondary", style: { fontSize: 12 } },
          "· 行业典型工作流模板"
        )
      ),
      l.createElement(
        r,
        { gutter: [12, 12] },
        ...h.map(
          (b) => l.createElement(
            u,
            { key: b.id, xs: 24, sm: 12, md: 8 },
            l.createElement(Xt, {
              team: b,
              agents: e,
              onLaunch: t
            })
          )
        )
      )
    ) : null,
    // Empty state
    w.length === 0 ? l.createElement(d, {
      description: "未找到匹配的专家团队，点击「创建专家团」自定义",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : null,
    // Team Builder Modal
    l.createElement(Ca, {
      open: K,
      onClose: () => {
        N(!1), E(null);
      },
      agents: e,
      editingTeam: O,
      onSaved: v
    })
  );
}
function pn(e) {
  var l;
  const t = [];
  for (const a of e) {
    if (a.enabled === !1) continue;
    const n = (l = a.description) == null ? void 0 : l.trim();
    if (!n) continue;
    const o = (a.name || n).length > 20 ? (a.name || n).substring(0, 18) + "…" : a.name || n;
    let i = n;
    if (i = i.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(i) ? i = `请${i}` : /^(a |an |the )/i.test(i) ? i = `Help me with ${i}` : /[。？！.?!]$/.test(i) || (i = `帮我${i}`), i.length > 80 && (i = i.substring(0, 77) + "..."), t.push({ label: o, value: i }), t.length >= 4) break;
  }
  return t;
}
async function _a(e) {
  return await ae("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function gt(e, t, l) {
  await ae(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: l })
  });
}
async function qt(e, t) {
  const l = await yt(e);
  l.system_prompt_files = t, await ae(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
async function Mt(e, t) {
  await ae("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: t,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function gn(e, t) {
  await ae(`/skills/${encodeURIComponent(t)}/enable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function $t(e, t) {
  await ae(`/skills/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Ta(e, t) {
  return ae("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function za(e, t) {
  return ae("/skills/batch-disable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Ia(e, t) {
  return ae("/skills/batch-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Rt(e) {
  return await ae("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function fn(e, t) {
  await ae(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function yn(e, t) {
  return ae("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Pa(e, t) {
  return ae(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function En(e, t) {
  await ae(`/skills/${encodeURIComponent(t)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Oa(e) {
  await ae(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function Aa(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const l = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!l) return { number: 6, unit: "h" };
  const a = parseInt(l[1] || "0", 10), n = parseInt(l[2] || "0", 10), o = parseInt(l[3] || "0", 10), i = a * 60 + n + Math.round(o / 60);
  return i <= 0 ? { number: 6, unit: "h" } : i >= 60 && i % 60 === 0 ? { number: i / 60, unit: "h" } : { number: i, unit: "m" };
}
function Ma(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function $a(e) {
  return ae("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function Ra(e, t) {
  return ae("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function La(e) {
  await ae("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function ja(e) {
  return ae("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function Ba(e, t) {
  return ae("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Ua(e) {
  return (await ae("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function Na(e, t) {
  await ae("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function Da() {
  return (await ae("/config/user-timezone")).timezone || "UTC";
}
async function Fa(e) {
  await ae("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function Ga(e) {
  return await ae("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const Vt = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function ht({
  title: e,
  subtitle: t,
  extra: l
}) {
  const a = T().React, { Space: n } = T().antd;
  return a.createElement(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 12,
        borderBottom: "1px solid #f0f0f0"
      }
    },
    a.createElement(
      "div",
      null,
      a.createElement(
        "h2",
        { style: { margin: 0, fontSize: 20, fontWeight: 600 } },
        e
      ),
      t ? a.createElement(
        "div",
        { style: { marginTop: 4, fontSize: 13, color: "#8c8c8c" } },
        t
      ) : null
    ),
    l ? a.createElement(n, null, l) : null
  );
}
function Yt({
  items: e,
  max: t = 5,
  color: l = "blue",
  emptyText: a = "无"
}) {
  const n = T().React, { Tag: o } = T().antd;
  return !e || e.length === 0 ? n.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    a
  ) : n.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (i, r) => n.createElement(
        o,
        { key: r, color: l, style: { fontSize: 11, marginRight: 0 } },
        i
      )
    ),
    e.length > t ? n.createElement(
      o,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function hn({
  open: e,
  onClose: t,
  poolSkills: l,
  installedSkillNames: a,
  loading: n,
  onInstall: o
}) {
  const i = T().React, { useState: r, useEffect: u, useMemo: s } = i, { Modal: d, Button: I, Empty: A, Spin: _, Input: S, Tag: p, Tooltip: $, Typography: M } = T().antd, { CheckOutlined: V, SearchOutlined: R } = T().antdIcons || {}, { Text: Z } = M, [j, U] = r([]), [P, x] = r("");
  u(() => {
    e && (U([]), x(""));
  }, [e]);
  const C = s(() => {
    if (!P.trim()) return l;
    const E = P.toLowerCase();
    return l.filter(
      (v) => {
        var f, X;
        return v.name.toLowerCase().includes(E) || ((f = v.description) == null ? void 0 : f.toLowerCase().includes(E)) || ((X = v.tags) == null ? void 0 : X.some((F) => F.toLowerCase().includes(E)));
      }
    );
  }, [l, P]), K = C.filter(
    (E) => !a.includes(E.name)
  ), N = (E) => {
    U(
      (v) => v.includes(E) ? v.filter((f) => f !== E) : [...v, E]
    );
  }, O = async () => {
    j.length !== 0 && (await o(j), U([]));
  };
  return i.createElement(
    d,
    {
      open: e,
      onCancel: t,
      title: "从技能池选择技能",
      width: 680,
      footer: i.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }
        },
        i.createElement(
          Z,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${j.length} 个技能`
        ),
        i.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          i.createElement(I, { onClick: t }, "取消"),
          i.createElement(
            I,
            {
              type: "primary",
              onClick: O,
              disabled: j.length === 0
            },
            j.length > 0 ? `添加 (${j.length})` : "添加"
          )
        )
      )
    },
    // Search + bulk actions bar
    i.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 8,
          alignItems: "center"
        }
      },
      i.createElement(S, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: R ? i.createElement(R) : void 0,
        value: P,
        onChange: (E) => x(E.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      i.createElement(
        I,
        {
          size: "small",
          type: "primary",
          onClick: () => U(K.map((E) => E.name))
        },
        "全选"
      ),
      i.createElement(
        I,
        {
          size: "small",
          onClick: () => U([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    n ? i.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      i.createElement(_, { size: "large" })
    ) : C.length === 0 ? i.createElement(A, {
      description: P ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: A.PRESENTED_IMAGE_SIMPLE
    }) : i.createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(145px, 1fr))",
          gap: 8,
          maxHeight: 360,
          overflowY: "auto",
          padding: 2
        }
      },
      ...C.map((E) => {
        const v = j.includes(E.name), f = a.includes(E.name);
        return i.createElement(
          "div",
          {
            key: E.name,
            onClick: () => !f && N(E.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${v ? "#0072f5" : "#e8e8e8"}`,
              borderRadius: 6,
              cursor: f ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: v ? "rgba(0, 114, 245, 0.06)" : f ? "#fafafa" : "#fff",
              opacity: f ? 0.5 : 1,
              minHeight: 64
            }
          },
          v ? i.createElement(
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
                fontSize: 10
              }
            },
            V ? i.createElement(V) : "✓"
          ) : null,
          f ? i.createElement(
            "span",
            {
              style: {
                position: "absolute",
                top: 6,
                right: 8,
                fontSize: 10,
                color: "#bbb"
              }
            },
            "已安装"
          ) : null,
          i.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4,
                paddingRight: f || v ? 24 : 0
              }
            },
            i.createElement(
              "span",
              { style: { fontSize: 16 } },
              E.emoji || "⚡"
            ),
            i.createElement(
              $,
              { title: E.name },
              i.createElement(
                Z,
                {
                  strong: !0,
                  style: {
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                E.name
              )
            )
          ),
          E.description ? i.createElement(
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
                lineHeight: "1.4"
              }
            },
            E.description
          ) : null,
          E.tags && E.tags.length > 0 ? i.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...E.tags.slice(0, 2).map(
              (X, F) => i.createElement(
                p,
                {
                  key: F,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                X
              )
            )
          ) : null
        );
      })
    )
  );
}
const Je = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  gap: 4
}, vn = { marginBottom: 16 }, bn = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16
}, je = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(0,0,0,0.85)",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid #f0f0f0"
}, Sn = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function Ha({ agentId: e }) {
  const t = T().React, { useState: l, useEffect: a, useCallback: n } = t, {
    Switch: o,
    InputNumber: i,
    Select: r,
    Button: u,
    Spin: s,
    Space: d,
    Typography: I,
    message: A
  } = T().antd, { PlayCircleOutlined: _, SaveOutlined: S } = T().antdIcons || {}, { Text: p } = I, [$, M] = l(!0), [V, R] = l(!1), [Z, j] = l(!1), [U, P] = l(!1), [x, C] = l(6), [K, N] = l("h"), [O, E] = l("main"), [v, f] = l(300), [X, F] = l(!1), [ne, w] = l("08:00"), [g, h] = l("22:00"), b = n(async () => {
    var W, se;
    M(!0);
    try {
      const y = await $a(e), te = Aa(y.every ?? "6h");
      P(y.enabled ?? !1), C(te.number), N(te.unit), E(y.target ?? "main"), f(y.timeoutSeconds ?? 300), F(!!y.activeHours), w(((W = y.activeHours) == null ? void 0 : W.start) ?? "08:00"), h(((se = y.activeHours) == null ? void 0 : se.end) ?? "22:00");
    } catch (y) {
      A.error(y.message || "加载心跳配置失败");
    } finally {
      M(!1);
    }
  }, [e]);
  a(() => {
    b();
  }, [b]);
  const oe = async () => {
    R(!0);
    try {
      await Ra(e, {
        enabled: U,
        every: Ma({ number: x, unit: K }),
        target: O,
        timeoutSeconds: v,
        activeHours: X && ne && g ? { start: ne, end: g } : void 0
      }), A.success("心跳配置已保存");
    } catch (W) {
      A.error(W.message || "保存心跳配置失败");
    } finally {
      R(!1);
    }
  }, L = async () => {
    j(!0);
    try {
      await La(e), A.success("已触发心跳检查");
    } catch (W) {
      A.error(W.message || "触发心跳失败");
    } finally {
      j(!1);
    }
  };
  if ($)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(s, { size: "large" })
    );
  const Y = (W, se, y) => t.createElement(
    "div",
    { style: vn },
    t.createElement("div", { style: Je }, W),
    se,
    y ? t.createElement(
      p,
      { type: "secondary", style: Sn },
      y
    ) : null
  ), re = (W, se, y, te) => t.createElement(
    "div",
    { style: bn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Je }, W),
      se
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Je }, y),
      te
    )
  ), { Divider: B } = T().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: je }, "基本设置"),
    Y(
      "启用心跳",
      t.createElement(o, {
        checked: U,
        onChange: (W) => P(W)
      }),
      U ? "已启用，专家将定期自检" : "已停用"
    ),
    re(
      "检查频率",
      t.createElement(
        d,
        null,
        t.createElement(i, {
          min: 1,
          value: x,
          onChange: (W) => C(W ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(r, {
          value: K,
          onChange: (W) => N(W),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(r, {
        value: O,
        onChange: (W) => E(W),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    Y(
      "超时时间 (秒)",
      t.createElement(i, {
        min: 1,
        max: 3600,
        value: v,
        onChange: (W) => f(W ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(B, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: je }, "活跃时段"),
    Y(
      "启用活跃时段限制",
      t.createElement(o, {
        checked: X,
        onChange: (W) => F(W)
      }),
      "仅在指定时段内触发心跳"
    ),
    X ? re(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: ne,
        onChange: (W) => w(W.target.value),
        style: {
          width: "100%",
          padding: "4px 11px",
          borderRadius: 6,
          border: "1px solid #d9d9d9",
          fontSize: 14
        }
      }),
      "结束时间",
      t.createElement("input", {
        type: "time",
        value: g,
        onChange: (W) => h(W.target.value),
        style: {
          width: "100%",
          padding: "4px 11px",
          borderRadius: 6,
          border: "1px solid #d9d9d9",
          fontSize: 14
        }
      })
    ) : null,
    // ── Action buttons ──
    t.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 16,
          gap: 8
        }
      },
      t.createElement(
        u,
        {
          type: "primary",
          icon: S ? t.createElement(S) : void 0,
          loading: V,
          onClick: oe,
          style: Oe
        },
        "保存配置"
      ),
      t.createElement(
        u,
        {
          icon: _ ? t.createElement(_) : void 0,
          loading: Z,
          onClick: L
        },
        "立即执行"
      )
    )
  );
}
function Ja({
  agentId: e,
  onRefresh: t
}) {
  const l = T().React, { useState: a, useEffect: n, useCallback: o } = l, {
    List: i,
    Tag: r,
    Switch: u,
    Button: s,
    Empty: d,
    Spin: I,
    Typography: A,
    message: _
  } = T().antd, { PlusOutlined: S, ReloadOutlined: p, DeleteOutlined: $ } = T().antdIcons || {}, { Text: M, Paragraph: V } = A, [R, Z] = a([]), [j, U] = a(!0), [P, x] = a(!1), [C, K] = a([]), [N, O] = a(!1), E = o(async () => {
    U(!0);
    try {
      const w = await Et(e);
      Z(w);
    } catch (w) {
      _.error(w.message || "加载技能失败"), Z([]);
    } finally {
      U(!1);
    }
  }, [e]);
  n(() => {
    E();
  }, [E]);
  const v = async () => {
    x(!0), O(!0);
    try {
      const w = await Ot(!0);
      K(w);
    } catch (w) {
      _.error(w.message || "加载技能池失败");
    } finally {
      O(!1);
    }
  }, f = async (w) => {
    let g = 0, h = 0;
    for (const b of w)
      try {
        await Mt(e, b), g++;
      } catch {
        h++;
      }
    g > 0 ? (_.success(
      `成功添加 ${g} 个技能${h > 0 ? `，${h} 个失败` : ""}`
    ), E(), t()) : h > 0 && _.error("添加技能失败"), x(!1);
  }, X = async (w, g) => {
    try {
      g ? await gn(e, w.name) : await En(e, w.name), _.success(g ? "已启用" : "已停用"), E(), t();
    } catch (h) {
      _.error(h.message || "操作失败");
    }
  }, F = async (w) => {
    try {
      await $t(e, w), _.success(`技能「${w}」已移除`), E(), t();
    } catch (g) {
      _.error(g.message || "移除技能失败");
    }
  };
  if (j)
    return l.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      l.createElement(I, { size: "large" })
    );
  const ne = R.filter((w) => w.enabled !== !1);
  return l.createElement(
    "div",
    null,
    l.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12
        }
      },
      l.createElement(
        M,
        { strong: !0 },
        `技能列表 (${R.length}，已启用 ${ne.length})`
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        l.createElement(
          s,
          {
            size: "small",
            icon: p ? l.createElement(p) : void 0,
            onClick: () => {
              Xe(), E();
            }
          },
          "刷新"
        ),
        l.createElement(
          s,
          {
            type: "primary",
            size: "small",
            icon: S ? l.createElement(S) : void 0,
            onClick: v,
            style: Oe
          },
          "从技能池添加"
        )
      )
    ),
    R.length === 0 ? l.createElement(d, {
      description: "该专家暂无技能",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(i, {
      dataSource: R,
      renderItem: (w) => l.createElement(
        i.Item,
        {
          actions: [
            l.createElement(u, {
              key: "toggle",
              size: "small",
              checked: w.enabled !== !1,
              onChange: (g) => X(w, g)
            }),
            l.createElement(
              s,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: $ ? l.createElement($) : void 0,
                onClick: () => F(w.name)
              },
              "移除"
            )
          ]
        },
        l.createElement(
          "div",
          { style: { width: "100%" } },
          l.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4
              }
            },
            w.emoji ? l.createElement(
              "span",
              { style: { fontSize: 16 } },
              w.emoji
            ) : null,
            l.createElement(M, { strong: !0 }, w.name),
            w.version_text ? l.createElement(
              r,
              { style: { fontSize: 10 } },
              `v${w.version_text}`
            ) : null
          ),
          w.description ? l.createElement(
            V,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            w.description
          ) : null
        )
      )
    }),
    l.createElement(hn, {
      open: P,
      onClose: () => x(!1),
      poolSkills: C,
      installedSkillNames: R.map((w) => w.name),
      loading: N,
      onInstall: f
    })
  );
}
function Wa({
  agentId: e,
  onRefresh: t,
  isActive: l
}) {
  const a = T().React, { useState: n, useEffect: o, useCallback: i } = a, {
    List: r,
    Tag: u,
    Button: s,
    Empty: d,
    Spin: I,
    Modal: A,
    Input: _,
    Typography: S,
    message: p
  } = T().antd, { PlusOutlined: $, ReloadOutlined: M, DeleteOutlined: V } = T().antdIcons || {}, { Text: R, Paragraph: Z } = S, { TextArea: j } = _, [U, P] = n([]), [x, C] = n(!0), [K, N] = n(!1), [O, E] = n(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [v, f] = n(!1), X = i(async () => {
    C(!0);
    try {
      const g = await Rt(e);
      P(g);
    } catch (g) {
      p.error(g.message || "加载 MCP 失败"), P([]);
    } finally {
      C(!1);
    }
  }, [e]);
  o(() => {
    X();
  }, [X]), o(() => {
    l && X();
  }, [l, X]);
  const F = async (g) => {
    try {
      await Pa(e, g), p.success("已切换 MCP 状态"), X(), t();
    } catch (h) {
      p.error(h.message || "切换失败");
    }
  }, ne = async (g) => {
    try {
      await fn(e, g), p.success(`MCP「${g}」已移除`), X(), t();
    } catch (h) {
      p.error(h.message || "移除 MCP 失败");
    }
  }, w = async () => {
    f(!0);
    try {
      const g = JSON.parse(O), h = g.mcpServers || g, b = Object.entries(h);
      if (b.length === 0) {
        p.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [oe, L] of b) {
        const Y = L, re = Y.url ? "streamable_http" : "stdio";
        await yn(e, {
          client_key: oe,
          client: {
            name: Y.name || oe,
            description: Y.description || "",
            enabled: !0,
            transport: re,
            url: Y.url || "",
            command: Y.command || "",
            args: Y.args || [],
            env: Y.env || {},
            cwd: Y.cwd || "",
            headers: Y.headers || {}
          }
        });
      }
      p.success("MCP 客户端已创建"), N(!1), X(), t();
    } catch (g) {
      g instanceof SyntaxError ? p.error("JSON 格式错误：" + g.message) : p.error(g.message || "创建 MCP 失败");
    } finally {
      f(!1);
    }
  };
  return x ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(I, { size: "large" })
  ) : a.createElement(
    "div",
    null,
    a.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12
        }
      },
      a.createElement(R, { strong: !0 }, `MCP 客户端 (${U.length})`),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          s,
          {
            size: "small",
            icon: M ? a.createElement(M) : void 0,
            onClick: () => {
              Xe(), X();
            }
          },
          "刷新"
        ),
        a.createElement(
          s,
          {
            type: "primary",
            size: "small",
            icon: $ ? a.createElement($) : void 0,
            onClick: () => N(!0),
            style: Oe
          },
          "添加 MCP"
        )
      )
    ),
    U.length === 0 ? a.createElement(d, {
      description: "该专家暂无 MCP 客户端",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(r, {
      dataSource: U,
      renderItem: (g) => a.createElement(
        r.Item,
        {
          actions: [
            a.createElement(
              s,
              {
                key: "toggle",
                size: "small",
                onClick: () => F(g.key)
              },
              g.enabled ? "停用" : "启用"
            ),
            a.createElement(
              s,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: V ? a.createElement(V) : void 0,
                onClick: () => ne(g.key)
              },
              "移除"
            )
          ]
        },
        a.createElement(
          "div",
          { style: { width: "100%" } },
          a.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4
              }
            },
            a.createElement("span", { style: { fontSize: 14 } }, "🔌"),
            a.createElement(R, { strong: !0 }, g.name || g.key),
            a.createElement(
              u,
              {
                color: g.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              g.enabled ? "启用" : "停用"
            ),
            a.createElement(
              u,
              { color: "purple", style: { fontSize: 10 } },
              g.transport
            )
          ),
          g.description ? a.createElement(
            Z,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            g.description
          ) : null,
          g.tools && g.tools.length > 0 ? a.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "#8c8c8c" } },
            `提供 ${g.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    a.createElement(
      A,
      {
        open: K,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => N(!1),
        onOk: w,
        confirmLoading: v,
        okText: "创建",
        width: 560
      },
      a.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      a.createElement(j, {
        value: O,
        onChange: (g) => E(g.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function Ka({ agentId: e }) {
  const t = T().React, { useState: l, useEffect: a, useCallback: n, useRef: o } = t, {
    Card: i,
    InputNumber: r,
    Input: u,
    Select: s,
    Switch: d,
    Button: I,
    Spin: A,
    Space: _,
    Typography: S,
    Divider: p,
    message: $
  } = T().antd, { SaveOutlined: M } = T().antdIcons || {}, { Text: V } = S, [R, Z] = l(!0), [j, U] = l(!1), P = o(null), [x, C] = l(60), [K, N] = l(""), [O, E] = l(!0), [v, f] = l(30), [X, F] = l("zh"), [ne, w] = l("UTC"), [g, h] = l(!0), [b, oe] = l(100), [L, Y] = l(!0), [re, B] = l(3), [W, se] = l(1), [y, te] = l(!0), [c, ee] = l(3), [z, le] = l(2), [de, fe] = l(60), [ge, ue] = l(1), [q, J] = l(0), [k, D] = l(1), [ie, G] = l(0), [pe, Ee] = l(30), [ve, Ce] = l(50), [ze, Ue] = l("light"), [at, qe] = l("scroll"), [Ae, Ve] = l("remelight"), [lt, Fe] = l("AUTO"), Ie = n(async () => {
    var Q, be, Se, ke, Qe, Ze;
    Z(!0);
    try {
      const [he, ot, Pe] = await Promise.all([
        ja(e),
        Ua(e).catch(() => "zh"),
        Da().catch(() => "UTC")
      ]);
      P.current = he, C(he.shell_command_timeout ?? 60), N(he.shell_command_executable ?? "");
      const et = he.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      E(et.enabled ?? !0), f(et.timeout_seconds ?? 30), F(ot), w(Pe);
      const Ne = he.loop ?? {};
      h(((Q = Ne.iteration) == null ? void 0 : Q.enabled) ?? !0), oe(((be = Ne.iteration) == null ? void 0 : be.max_iterations) ?? he.max_iters ?? 100), Y(((Se = Ne.doom_loop) == null ? void 0 : Se.enabled) ?? !0), B(((ke = Ne.doom_loop) == null ? void 0 : ke.window_size) ?? 3), se(((Qe = Ne.doom_loop) == null ? void 0 : Qe.similarity_threshold) ?? 1), te(he.llm_retry_enabled ?? !0), ee(he.llm_max_retries ?? 3), le(he.llm_backoff_base ?? 2), fe(he.llm_backoff_cap ?? 60), ue(he.llm_max_concurrent ?? 1), J(he.llm_max_qpm ?? 0), D(he.llm_rate_limit_pause ?? 1), G(he.llm_rate_limit_jitter ?? 0), Ee(he.llm_acquire_timeout ?? 30), Ce(he.history_max_length ?? 50), Ue(he.context_manager_backend ?? "light"), qe(((Ze = he.light_context_config) == null ? void 0 : Ze.strategy) ?? "scroll"), Ve(he.memory_manager_backend ?? "remelight"), Fe(he.approval_level ?? "AUTO");
    } catch (he) {
      $.error(he.message || "加载运行配置失败");
    } finally {
      Z(!1);
    }
  }, [e]);
  a(() => {
    Ie();
  }, [Ie]);
  const Ye = async () => {
    var be, Se;
    const Q = P.current;
    if (Q) {
      U(!0);
      try {
        const ke = {
          ...Q,
          max_iters: b,
          loop: {
            ...Q.loop ?? {},
            iteration: { enabled: g, max_iterations: b },
            doom_loop: {
              enabled: L,
              window_size: re,
              similarity_threshold: W,
              stages: ((Se = (be = Q.loop) == null ? void 0 : be.doom_loop) == null ? void 0 : Se.stages) ?? []
            }
          },
          shell_command_timeout: x,
          shell_command_executable: K,
          auto_title_config: {
            enabled: O,
            timeout_seconds: v
          },
          llm_retry_enabled: y,
          llm_max_retries: c,
          llm_backoff_base: z,
          llm_backoff_cap: de,
          llm_max_concurrent: ge,
          llm_max_qpm: q,
          llm_rate_limit_pause: k,
          llm_rate_limit_jitter: ie,
          llm_acquire_timeout: pe,
          history_max_length: ve,
          context_manager_backend: ze,
          light_context_config: {
            ...Q.light_context_config ?? {},
            strategy: at
          },
          memory_manager_backend: Ae,
          approval_level: lt
        };
        await Ba(e, ke), P.current = ke, X && await Na(e, X).catch(() => {
        }), ne && await Fa(ne).catch(() => {
        }), $.success("运行配置已保存");
      } catch (ke) {
        $.error(ke.message || "保存运行配置失败");
      } finally {
        U(!1);
      }
    }
  };
  if (R)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(A, { size: "large" })
    );
  const Te = (Q, be, Se) => t.createElement(
    "div",
    { style: vn },
    t.createElement("div", { style: Je }, Q),
    be,
    Se ? t.createElement(
      V,
      { type: "secondary", style: Sn },
      Se
    ) : null
  ), we = (Q, be, Se, ke) => t.createElement(
    "div",
    { style: bn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Je }, Q),
      be
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Je }, Se),
      ke
    )
  );
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    t.createElement(
      "div",
      { style: je },
      "基础设置"
    ),
    we(
      "Shell 命令超时 (秒)",
      t.createElement(r, {
        min: 1,
        value: x,
        onChange: (Q) => C(Q ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(u, {
        value: K,
        onChange: (Q) => N(Q.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    we(
      "语言",
      t.createElement(s, {
        value: X,
        onChange: (Q) => F(Q),
        style: { width: "100%" },
        options: [
          { value: "zh", label: "中文" },
          { value: "en", label: "English" },
          { value: "id", label: "Bahasa Indonesia" },
          { value: "ru", label: "Русский" }
        ]
      }),
      "时区",
      t.createElement(s, {
        value: ne,
        onChange: (Q) => w(Q),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (Q, be) => {
          var Se;
          return (((Se = be == null ? void 0 : be.label) == null ? void 0 : Se.toString()) || "").toLowerCase().includes(Q.toLowerCase());
        },
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
          "Australia/Sydney"
        ].map((Q) => ({ value: Q, label: Q }))
      })
    ),
    we(
      "自动生成会话标题",
      t.createElement(_, null, t.createElement(d, {
        checked: O,
        onChange: (Q) => E(Q)
      })),
      "标题生成超时 (秒)",
      t.createElement(r, {
        min: 5,
        value: v,
        onChange: (Q) => f(Q ?? 30),
        style: { width: "100%" },
        disabled: !O
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(p, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: je }, "审批级别"),
    Te(
      "工具执行审批",
      t.createElement(s, {
        value: lt,
        onChange: (Q) => Fe(Q),
        style: { width: "100%" },
        options: [
          { value: "STRICT", label: "严格 (STRICT) — 每次工具调用需审批" },
          { value: "SMART", label: "智能 (SMART) — 高风险操作需审批" },
          { value: "AUTO", label: "自动 (AUTO) — 自动执行" },
          { value: "OFF", label: "关闭 (OFF) — 无限制" }
        ]
      })
    ),
    // ── Section: 迭代与循环 ──
    t.createElement(p, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: je }, "迭代与循环"),
    Te(
      "启用迭代限制",
      t.createElement(d, {
        checked: g,
        onChange: (Q) => h(Q)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    g ? Te(
      "最大迭代次数",
      t.createElement(r, {
        min: 1,
        max: 500,
        value: b,
        onChange: (Q) => oe(Q ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    Te(
      "启用重复循环保护",
      t.createElement(d, {
        checked: L,
        onChange: (Q) => Y(Q)
      }),
      "检测并阻止重复操作循环"
    ),
    L ? we(
      "检测窗口大小",
      t.createElement(r, {
        min: 2,
        max: 20,
        value: re,
        onChange: (Q) => B(Q ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(r, {
        min: 0,
        max: 1,
        step: 0.05,
        value: W,
        onChange: (Q) => se(Q ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(p, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: je }, "LLM 重试"),
    Te(
      "启用 LLM 重试",
      t.createElement(d, {
        checked: y,
        onChange: (Q) => te(Q)
      })
    ),
    we(
      "最大重试次数",
      t.createElement(r, {
        min: 1,
        value: c,
        onChange: (Q) => ee(Q ?? 3),
        style: { width: "100%" },
        disabled: !y
      }),
      "退避基数 (秒)",
      t.createElement(r, {
        min: 0.1,
        step: 0.1,
        value: z,
        onChange: (Q) => le(Q ?? 2),
        style: { width: "100%" },
        disabled: !y
      })
    ),
    Te(
      "退避上限 (秒)",
      t.createElement(r, {
        min: 0.5,
        step: 0.5,
        value: de,
        onChange: (Q) => fe(Q ?? 60),
        style: { width: 200 },
        disabled: !y
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(p, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: je }, "LLM 限流"),
    we(
      "最大并发数",
      t.createElement(r, {
        min: 1,
        value: ge,
        onChange: (Q) => ue(Q ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(r, {
        min: 0,
        step: 10,
        value: q,
        onChange: (Q) => J(Q ?? 0),
        style: { width: "100%" }
      })
    ),
    we(
      "限流暂停时间 (秒)",
      t.createElement(r, {
        min: 1,
        step: 0.5,
        value: k,
        onChange: (Q) => D(Q ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(r, {
        min: 0,
        step: 0.5,
        value: ie,
        onChange: (Q) => G(Q ?? 0),
        style: { width: "100%" }
      })
    ),
    Te(
      "获取超时 (秒)",
      t.createElement(r, {
        min: 10,
        step: 10,
        value: pe,
        onChange: (Q) => Ee(Q ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(p, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: je }, "上下文与记忆"),
    we(
      "上下文管理后端",
      t.createElement(s, {
        value: ze,
        onChange: (Q) => Ue(Q),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(s, {
        value: at,
        onChange: (Q) => qe(Q),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    we(
      "记忆管理后端",
      t.createElement(s, {
        value: Ae,
        onChange: (Q) => Ve(Q),
        style: { width: "100%" },
        options: [
          { value: "remelight", label: "remelight" },
          { value: "adbpg", label: "adbpg" },
          { value: "none", label: "none (禁用)" }
        ]
      }),
      "历史消息最大长度",
      t.createElement(r, {
        min: 1,
        value: ve,
        onChange: (Q) => Ce(Q ?? 50),
        style: { width: "100%" }
      })
    ),
    // ── Save button ──
    t.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      t.createElement(
        I,
        {
          type: "primary",
          icon: M ? t.createElement(M) : void 0,
          loading: j,
          onClick: Ye,
          style: Oe
        },
        "保存运行配置"
      )
    )
  );
}
function Xa({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: a
}) {
  const n = T().React, { useState: o, useEffect: i, useCallback: r } = n, { Modal: u, Tabs: s, Spin: d, Typography: I } = T().antd, { SettingOutlined: A } = T().antdIcons || {}, { Text: _ } = I, [S, p] = o([]), [$, M] = o(!1), [V, R] = o("heartbeat"), Z = r(async () => {
    if (e) {
      M(!0);
      try {
        const x = await Ga(e.agent.id);
        p(x);
      } catch {
        p([]);
      } finally {
        M(!1);
      }
    }
  }, [e]);
  if (i(() => {
    t && e && Z();
  }, [t, e, Z]), !e) return null;
  const { agent: j } = e, U = () => {
    Z(), a();
  }, P = [
    {
      key: "heartbeat",
      label: "心跳",
      children: n.createElement(Ha, {
        agentId: j.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: $ ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        n.createElement(d, { size: "large" })
      ) : n.createElement(wn, {
        agentId: j.id,
        systemPromptFiles: S,
        onRefresh: U
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((x) => x.enabled !== !1).length})`,
      children: n.createElement(Ja, {
        agentId: j.id,
        onRefresh: a
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: n.createElement(Wa, {
        agentId: j.id,
        onRefresh: a,
        isActive: V === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: n.createElement(Ka, {
        agentId: j.id
      })
    }
  ];
  return n.createElement(
    u,
    {
      open: t,
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        A ? n.createElement(A, { style: { fontSize: 18 } }) : null,
        n.createElement("span", null, `配置 - ${j.name}`),
        n.createElement(
          _,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          j.id
        )
      ),
      onCancel: l,
      footer: null,
      width: 800,
      centered: !0,
      styles: {
        body: {
          height: "min(520px, calc(100vh - 280px))",
          overflowY: "auto",
          overflowX: "hidden"
        }
      }
    },
    n.createElement(s, {
      items: P,
      activeKey: V,
      onChange: (x) => R(x),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
function qa({
  expert: e,
  onClick: t,
  onSummon: l,
  onConfigure: a
}) {
  const n = T().React, { Card: o, Tag: i, Badge: r, Typography: u, Spin: s, Button: d, Tooltip: I } = T().antd, { Text: A } = u, { ThunderboltOutlined: _, SettingOutlined: S } = T().antdIcons || {}, { agent: p, skills: $, mcps: M, loading: V } = e, R = p.enabled, Z = $.filter((P) => P.enabled !== !1).map((P) => P.name), j = M.map((P) => P.name || P.key), U = p.active_model ? `${p.active_model.provider_id}/${p.active_model.model}` : null;
  return n.createElement(
    o,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: R ? void 0 : "#d9d9d9",
        opacity: R ? 1 : 0.7,
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column"
      },
      styles: {
        body: {
          display: "flex",
          flexDirection: "column",
          height: "100%",
          flex: 1
        }
      }
    },
    n.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8
        }
      },
      n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        n.createElement(Re, { name: p.name, size: 36 }),
        n.createElement(
          "div",
          null,
          n.createElement(
            A,
            { strong: !0, style: { fontSize: 15 } },
            p.name
          ),
          n.createElement(
            "div",
            {
              style: {
                fontSize: 11,
                color: "#bfbfbf",
                fontFamily: "monospace"
              }
            },
            p.id
          )
        )
      ),
      n.createElement(r, {
        status: R ? "success" : "default",
        text: R ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    p.description ? n.createElement(
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
          flex: "1 0 auto"
        }
      },
      At(p.description, n)
    ) : n.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    U ? n.createElement(
      "div",
      { style: { marginBottom: 8 } },
      n.createElement(
        i,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${U}`
      )
    ) : null,
    // Skills
    V ? n.createElement(s, { size: "small" }) : n.createElement(
      "div",
      { style: { marginBottom: 6 } },
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${Z.length})`
      ),
      n.createElement(Yt, {
        items: Z,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !V && j.length > 0 ? n.createElement(
      "div",
      { style: { marginTop: "auto" } },
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${j.length})`
      ),
      n.createElement(Yt, {
        items: j,
        max: 3,
        color: "purple"
      })
    ) : null,
    // Bottom bar: gear icon (left) + summon button (right)
    n.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 10,
          paddingTop: 8,
          borderTop: "1px solid #f0f0f0"
        }
      },
      // Gear icon (bottom-left) — opens configuration modal
      n.createElement(
        I,
        { title: "配置专家", placement: "top" },
        n.createElement(
          d,
          {
            type: "text",
            size: "small",
            icon: S ? n.createElement(S, {
              style: { fontSize: 16, color: "#8c8c8c" }
            }) : void 0,
            onClick: (P) => {
              P.stopPropagation(), a && a();
            }
          }
        )
      ),
      // Summon button (bottom-right)
      n.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: _ ? n.createElement(_) : void 0,
          disabled: !R,
          onClick: (P) => {
            P.stopPropagation(), l && l();
          },
          style: Oe
        },
        "召唤专家"
      )
    )
  );
}
function Va({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: a
}) {
  const n = T().React, {
    Drawer: o,
    Descriptions: i,
    Tag: r,
    Typography: u,
    Space: s,
    Button: d,
    Empty: I,
    Tabs: A,
    List: _,
    Spin: S,
    Modal: p,
    message: $
  } = T().antd, { Text: M, Paragraph: V } = u, {
    EditOutlined: R,
    ThunderboltOutlined: Z,
    FileTextOutlined: j,
    ToolOutlined: U,
    PlusOutlined: P
  } = T().antdIcons || {}, [x, C] = n.useState(!1), [K, N] = n.useState(
    []
  ), [O, E] = n.useState(!1);
  if (!e) return null;
  const { agent: v, config: f, skills: X, mcps: F, loading: ne } = e, w = X.filter((y) => y.enabled !== !1), g = (y) => {
    window.history.pushState({}, "", y), window.dispatchEvent(new PopStateEvent("popstate"));
  }, h = n.createElement(
    "div",
    null,
    n.createElement(
      i,
      { column: 1, bordered: !0, size: "small" },
      n.createElement(i.Item, { label: "专家名称" }, v.name),
      n.createElement(
        i.Item,
        { label: "专家 ID" },
        n.createElement("code", { style: { fontSize: 12 } }, v.id)
      ),
      n.createElement(
        i.Item,
        { label: "状态" },
        n.createElement(
          r,
          { color: v.enabled ? "green" : "default" },
          v.enabled ? "启用" : "停用"
        )
      ),
      n.createElement(
        i.Item,
        { label: "功能简介" },
        v.description ? At(v.description, n) : "暂无描述"
      ),
      n.createElement(
        i.Item,
        { label: "使用模型" },
        v.active_model ? `${v.active_model.provider_id} / ${v.active_model.model}` : "使用全局默认模型"
      ),
      f != null && f.workspace_dir ? n.createElement(
        i.Item,
        { label: "工作区路径" },
        n.createElement(
          "code",
          { style: { fontSize: 11 } },
          f.workspace_dir
        )
      ) : null,
      f != null && f.approval_level ? n.createElement(
        i.Item,
        { label: "审批级别" },
        f.approval_level
      ) : null
    ),
    // System prompt files
    f != null && f.system_prompt_files && f.system_prompt_files.length > 0 ? n.createElement(
      "div",
      { style: { marginTop: 16 } },
      n.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8
          }
        },
        j ? n.createElement(j, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(M, { strong: !0 }, "系统提示词文件")
      ),
      n.createElement(
        s,
        { wrap: !0 },
        ...f.system_prompt_files.map(
          (y, te) => n.createElement(
            r,
            {
              key: te,
              icon: j ? n.createElement(j) : void 0,
              style: { fontSize: 12 }
            },
            y
          )
        )
      )
    ) : null
  ), b = async () => {
    C(!0), E(!0);
    try {
      const y = await Ot(!0);
      N(y);
    } catch (y) {
      $.error(y.message || "加载技能池失败");
    } finally {
      E(!1);
    }
  }, oe = async (y) => {
    let te = 0, c = 0;
    for (const ee of y)
      try {
        await Mt(v.id, ee), te++;
      } catch {
        c++;
      }
    te > 0 ? ($.success(
      `成功添加 ${te} 个技能${c > 0 ? `，${c} 个失败` : ""}`
    ), a()) : c > 0 && $.error("添加技能失败"), C(!1);
  }, L = async (y) => {
    try {
      await $t(v.id, y), $.success(`技能「${y}」已移除`), a();
    } catch (te) {
      $.error(te.message || "移除技能失败");
    }
  }, Y = async (y) => {
    try {
      await fn(v.id, y), $.success(`MCP「${y}」已移除`), a();
    } catch (te) {
      $.error(te.message || "移除 MCP 失败");
    }
  }, re = ne ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(S, { size: "large" })
  ) : n.createElement(
    "div",
    null,
    n.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12
        }
      },
      n.createElement(
        M,
        { strong: !0 },
        `已启用技能 (${w.length})`
      ),
      n.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: P ? n.createElement(P) : void 0,
          onClick: b
        },
        "从技能池添加"
      )
    ),
    w.length === 0 ? n.createElement(I, {
      description: "该专家暂无已启用的技能",
      image: I.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(_, {
      dataSource: w,
      renderItem: (y) => n.createElement(
        _.Item,
        {
          actions: [
            n.createElement(
              d,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => L(y.name)
              },
              "移除"
            )
          ]
        },
        n.createElement(
          "div",
          { style: { width: "100%" } },
          n.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4
              }
            },
            y.emoji ? n.createElement(
              "span",
              { style: { fontSize: 16 } },
              y.emoji
            ) : null,
            n.createElement(M, { strong: !0 }, y.name),
            y.version_text ? n.createElement(
              r,
              { style: { fontSize: 10 } },
              `v${y.version_text}`
            ) : null
          ),
          y.description ? n.createElement(
            V,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            y.description
          ) : null,
          y.tags && y.tags.length > 0 ? n.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...y.tags.map(
              (te, c) => n.createElement(
                r,
                {
                  key: c,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                te
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    n.createElement(hn, {
      open: x,
      onClose: () => C(!1),
      poolSkills: K,
      installedSkillNames: w.map((y) => y.name),
      loading: O,
      onInstall: oe
    })
  ), B = ne ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(S, { size: "large" })
  ) : n.createElement(
    "div",
    null,
    n.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12
        }
      },
      n.createElement(
        M,
        { strong: !0 },
        `MCP 客户端 (${F.length})`
      ),
      n.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: P ? n.createElement(P) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${v.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    F.length === 0 ? n.createElement(I, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: I.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(_, {
      dataSource: F,
      renderItem: (y) => n.createElement(
        _.Item,
        {
          actions: [
            n.createElement(
              d,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => Y(y.key)
              },
              "移除"
            )
          ]
        },
        n.createElement(
          "div",
          { style: { width: "100%" } },
          n.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4
              }
            },
            n.createElement(
              "span",
              { style: { fontSize: 14 } },
              "🔌"
            ),
            n.createElement(
              M,
              { strong: !0 },
              y.name || y.key
            ),
            n.createElement(
              r,
              {
                color: y.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              y.enabled ? "启用" : "停用"
            ),
            n.createElement(
              r,
              { color: "purple", style: { fontSize: 10 } },
              y.transport
            )
          ),
          y.description ? n.createElement(
            V,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            y.description
          ) : null,
          y.tools && y.tools.length > 0 ? n.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "#8c8c8c"
              }
            },
            `提供 ${y.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), W = f != null && f.tools ? n.createElement(
    "div",
    { style: { padding: 16 } },
    n.createElement(
      "div",
      { style: { marginBottom: 12 } },
      n.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8
          }
        },
        U ? n.createElement(U, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(M, { strong: !0 }, "工具配置")
      ),
      n.createElement(
        "pre",
        {
          style: {
            background: "#fafafa",
            padding: 12,
            borderRadius: 6,
            fontSize: 12,
            overflow: "auto",
            maxHeight: 300
          }
        },
        JSON.stringify(f.tools, null, 2)
      )
    )
  ) : n.createElement(I, {
    description: "暂无工具配置",
    image: I.PRESENTED_IMAGE_SIMPLE
  }), se = [
    { key: "basic", label: "基本信息", children: h },
    {
      key: "skills",
      label: `技能 (${w.length})`,
      children: re
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: n.createElement(Za, {
        skills: w,
        agentId: v.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: n.createElement(wn, {
        agentId: v.id,
        systemPromptFiles: (f == null ? void 0 : f.system_prompt_files) || [],
        onRefresh: () => a()
      })
    },
    { key: "mcp", label: `MCP (${F.length})`, children: B },
    { key: "tools", label: "工具配置", children: W }
  ];
  return n.createElement(
    o,
    {
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        n.createElement(Re, { name: v.name, size: 28 }),
        n.createElement("span", null, v.name)
      ),
      open: t,
      onClose: l,
      width: 560,
      extra: n.createElement(
        s,
        null,
        n.createElement(
          d,
          {
            size: "small",
            icon: R ? n.createElement(R) : void 0,
            onClick: () => {
              l();
              try {
                const y = T();
                y.setSelectedAgent && y.setSelectedAgent(v.id);
              } catch (y) {
                console.warn("[ugsci] Failed to set selected agent:", y);
              }
              setTimeout(() => g("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        n.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: Z ? n.createElement(Z) : void 0,
            onClick: () => {
              l();
              try {
                const y = T();
                y.setSelectedAgent && y.setSelectedAgent(v.id);
              } catch (y) {
                console.warn("[ugsci] Failed to set selected agent:", y);
              }
              setTimeout(() => g("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    n.createElement(A, {
      items: se,
      defaultActiveKey: "basic"
    })
  );
}
function Ya({
  open: e,
  onClose: t,
  onCreated: l
}) {
  const a = T().React, { useState: n } = a, {
    Modal: o,
    Card: i,
    Tag: r,
    Input: u,
    Row: s,
    Col: d,
    Spin: I,
    message: A,
    Typography: _
  } = T().antd, { Text: S } = _, { FileAddOutlined: p } = T().antdIcons || {}, [$, M] = n(!1), [V, R] = n(""), [Z, j] = n(!1), U = async (C, K) => {
    M(!0);
    try {
      const N = await ae("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: C || "新专家",
          description: K || "",
          skill_names: []
        })
      });
      await gt(
        N.id,
        "AGENTS.md",
        `# ${C || "新专家"}

请在此处编写该专家的系统提示词。
`
      ), A.success("专家「" + (C || "新专家") + "」创建成功"), j(!1), setTimeout(() => {
        t(), l();
      }, 0);
    } catch (N) {
      A.error(N.message || "创建专家失败");
    } finally {
      M(!1);
    }
  }, P = xt.filter((C) => {
    if (!V.trim()) return !0;
    const K = V.toLowerCase();
    return C.name.toLowerCase().includes(K) || C.description.toLowerCase().includes(K) || C.category.toLowerCase().includes(K);
  }), x = async (C) => {
    M(!0);
    try {
      const K = await ae("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: C.name,
          description: C.description,
          skill_names: C.recommended_skills
        })
      });
      await gt(K.id, "AGENTS.md", C.system_prompt);
      const N = await yt(K.id);
      N.approval_level = C.approval_level, await ae(`/agents/${encodeURIComponent(K.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(N)
      }), A.success(`专家「${C.name}」创建成功`), t(), l();
    } catch (K) {
      A.error(K.message || "创建专家失败");
    } finally {
      M(!1);
    }
  };
  return a.createElement(
    a.Fragment,
    null,
    a.createElement(
      o,
      {
        open: e,
        onCancel: t,
        footer: null,
        title: "选择专家模板",
        width: 800,
        maskClosable: !0,
        keyboard: !0
      },
      a.createElement(
        "div",
        { style: { marginBottom: 16 } },
        a.createElement(u, {
          placeholder: "搜索模板名称或类别...",
          value: V,
          onChange: (C) => R(C.target.value),
          allowClear: !0
        })
      ),
      $ ? a.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        a.createElement(I, { size: "large" }),
        a.createElement(
          "div",
          { style: { marginTop: 12, color: "#8c8c8c" } },
          "正在创建专家..."
        )
      ) : a.createElement(
        s,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        V.trim() ? null : a.createElement(
          d,
          { xs: 24, sm: 12 },
          a.createElement(
            i,
            {
              hoverable: !0,
              size: "small",
              onClick: () => j(!0),
              style: {
                cursor: "pointer",
                height: "100%",
                border: "2px dashed #d9d9d9",
                background: "#fafafa"
              }
            },
            a.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 8
                }
              },
              a.createElement(
                "span",
                { style: { fontSize: 28, color: "#8c8c8c" } },
                p ? a.createElement(p) : "📝"
              ),
              a.createElement(
                "div",
                { style: { flex: 1 } },
                a.createElement(
                  S,
                  { strong: !0, style: { fontSize: 15 } },
                  "从空白模版开始创建"
                ),
                a.createElement(
                  "div",
                  null,
                  a.createElement(
                    r,
                    { color: "default", style: { fontSize: 10 } },
                    "空白"
                  )
                )
              )
            ),
            a.createElement(
              "div",
              {
                style: {
                  fontSize: 12,
                  color: "#595959",
                  lineHeight: 1.5
                }
              },
              "创建一个全新的专家，不使用任何预设模板。创建后可自行配置系统提示词、技能和 MCP 客户端。"
            )
          )
        ),
        ...P.map(
          (C) => a.createElement(
            d,
            { key: C.id, xs: 24, sm: 12 },
            a.createElement(
              i,
              {
                hoverable: !0,
                size: "small",
                onClick: () => x(C),
                style: { cursor: "pointer", height: "100%" }
              },
              a.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 8
                  }
                },
                a.createElement(Re, {
                  name: C.name,
                  size: 40
                }),
                a.createElement(
                  "div",
                  { style: { flex: 1 } },
                  a.createElement(
                    S,
                    { strong: !0, style: { fontSize: 15 } },
                    C.name
                  ),
                  a.createElement(
                    "div",
                    null,
                    a.createElement(
                      r,
                      { color: "blue", style: { fontSize: 10 } },
                      C.category
                    ),
                    C.approval_level === "MANUAL" ? a.createElement(
                      r,
                      { color: "orange", style: { fontSize: 10 } },
                      "需审批"
                    ) : null
                  )
                )
              ),
              a.createElement(
                "div",
                {
                  style: {
                    fontSize: 12,
                    color: "#595959",
                    lineHeight: 1.5
                  }
                },
                At(C.description, a)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    a.createElement(Qa, {
      open: Z,
      onCancel: () => j(!1),
      onCreate: U
    })
  );
}
function Qa({
  open: e,
  onCancel: t,
  onCreate: l
}) {
  const a = T().React, { useState: n, useEffect: o } = a, { Modal: i, Input: r, message: u } = T().antd, [s, d] = n(""), [I, A] = n(""), [_, S] = n(!1);
  return o(() => {
    e && (d(""), A(""), S(!1));
  }, [e]), a.createElement(
    i,
    {
      open: e,
      title: "从空白模版创建专家",
      onCancel: t,
      onOk: () => {
        if (!s.trim()) {
          u.warning("请输入专家名称");
          return;
        }
        S(!0), Promise.resolve(l(s.trim(), I.trim())).finally(() => {
          S(!1);
        });
      },
      okText: "创建",
      cancelText: "取消",
      okButtonProps: { loading: _ },
      maskClosable: !0,
      keyboard: !0
    },
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        "div",
        { style: { fontSize: 13, marginBottom: 6, color: "#595959" } },
        "专家名称"
      ),
      a.createElement(r, {
        placeholder: "输入专家名称",
        value: s,
        onChange: (p) => d(p.target.value),
        maxLength: 50
      })
    ),
    a.createElement(
      "div",
      null,
      a.createElement(
        "div",
        { style: { fontSize: 13, marginBottom: 6, color: "#595959" } },
        "专家描述（可选）"
      ),
      a.createElement(r.TextArea, {
        placeholder: "简要描述该专家的职责和能力...",
        value: I,
        onChange: (p) => A(p.target.value),
        rows: 3,
        maxLength: 200
      })
    )
  );
}
function wn({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: l
}) {
  const a = T().React, { useState: n, useEffect: o, useCallback: i } = a, {
    List: r,
    Tag: u,
    Switch: s,
    Button: d,
    Modal: I,
    Input: A,
    Spin: _,
    Empty: S,
    message: p,
    Typography: $
  } = T().antd, { FileTextOutlined: M, PlusOutlined: V, EditOutlined: R, ReloadOutlined: Z } = T().antdIcons || {}, { Text: j } = $, [U, P] = n([]), [x, C] = n(!0), [K, N] = n(
    t || []
  ), [O, E] = n(!1), [v, f] = n(null), [X, F] = n(""), [ne, w] = n(""), [g, h] = n(!1), b = i(async () => {
    C(!0);
    try {
      const B = await _a(e);
      P(B);
    } catch (B) {
      p.error(B.message || "加载记忆文件失败"), P([]);
    } finally {
      C(!1);
    }
  }, [e]);
  o(() => {
    b();
  }, [b]), o(() => {
    N(t || []);
  }, [t]);
  const oe = async (B, W) => {
    const se = new Set(K);
    if (W)
      se.add(B);
    else {
      if (Vt.includes(B) && B === "AGENTS.md") {
        p.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      se.delete(B);
    }
    const y = Array.from(se);
    N(y);
    try {
      await qt(e, y), p.success(W ? "已启用记忆文件" : "已停用记忆文件"), l();
    } catch (te) {
      p.error(te.message || "更新失败"), N(t || []);
    }
  }, L = async (B) => {
    try {
      const W = await ae(
        `/workspace/files/${encodeURIComponent(B)}`,
        { headers: { "X-Agent-Id": e } }
      );
      f(B), F(W.content || ""), E(!0);
    } catch (W) {
      p.error(W.message || "读取文件失败");
    }
  }, Y = () => {
    f(null), F(""), w(""), E(!0);
  }, re = async () => {
    const B = v || ne.trim();
    if (!B) {
      p.warning("请输入文件名");
      return;
    }
    const W = B.endsWith(".md") ? B : `${B}.md`;
    h(!0);
    try {
      if (await gt(e, W, X), !v && !K.includes(W)) {
        const se = [...K, W];
        N(se), await qt(e, se);
      }
      p.success("保存成功"), E(!1), b(), l();
    } catch (se) {
      p.error(se.message || "保存失败");
    } finally {
      h(!1);
    }
  };
  return x ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(_, { size: "large" })
  ) : a.createElement(
    "div",
    null,
    a.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12
        }
      },
      a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        M ? a.createElement(M, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(
          j,
          { strong: !0 },
          `记忆文件 (${U.length})`
        ),
        a.createElement(
          j,
          { type: "secondary", style: { fontSize: 12 } },
          `· 已挂载 ${K.length} 个到专家记忆`
        )
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          d,
          {
            size: "small",
            icon: Z ? a.createElement(Z) : void 0,
            onClick: b
          },
          "刷新"
        ),
        a.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: V ? a.createElement(V) : void 0,
            onClick: Y
          },
          "新建记忆文件"
        )
      )
    ),
    U.length === 0 ? a.createElement(S, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: S.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(r, {
      dataSource: U,
      renderItem: (B) => {
        const W = K.includes(B.filename), se = Vt.includes(B.filename);
        return a.createElement(
          r.Item,
          {
            actions: [
              a.createElement(
                d,
                {
                  type: "link",
                  size: "small",
                  icon: R ? a.createElement(R) : void 0,
                  onClick: () => L(B.filename)
                },
                "编辑"
              )
            ]
          },
          a.createElement(r.Item.Meta, {
            avatar: a.createElement(M, {
              style: {
                fontSize: 20,
                color: W ? "#1677ff" : "#bfbfbf"
              }
            }),
            title: a.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              a.createElement(j, null, B.filename),
              se ? a.createElement(
                u,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : a.createElement(
                u,
                { color: "cyan", style: { fontSize: 10 } },
                "记忆库"
              )
            ),
            description: a.createElement(
              "div",
              { style: { fontSize: 12 } },
              `${(B.size / 1024).toFixed(1)} KB · 修改于 ${new Date(B.modified_time).toLocaleString()}`
            )
          }),
          a.createElement(s, {
            checked: W,
            size: "small",
            onChange: (y) => oe(B.filename, y)
          })
        );
      }
    }),
    // Edit/New file modal
    a.createElement(
      I,
      {
        open: O,
        onCancel: () => E(!1),
        title: v ? `编辑 ${v}` : "新建记忆文件",
        width: 700,
        onOk: re,
        confirmLoading: g,
        okText: "保存"
      },
      v ? null : a.createElement(
        "div",
        { style: { marginBottom: 12 } },
        a.createElement(A, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: ne,
          onChange: (B) => w(B.target.value),
          addonAfter: ne.endsWith(".md") ? "" : ".md"
        })
      ),
      a.createElement(A.TextArea, {
        value: X,
        onChange: (B) => F(B.target.value),
        rows: 12,
        placeholder: `输入记忆内容（支持 Markdown 格式）...

例如：
# 某区块油藏基础参数

- 地层压力: 25 MPa
- 地层温度: 85°C
- 原油密度: 0.85 g/cm³`,
        style: { fontFamily: "monospace", fontSize: 13 }
      })
    )
  );
}
function Za({
  skills: e,
  agentId: t
}) {
  const l = T().React, { useMemo: a } = l, {
    List: n,
    Tag: o,
    Typography: i,
    Empty: r,
    Button: u,
    message: s
  } = T().antd, { ThunderboltOutlined: d, CopyOutlined: I } = T().antdIcons || {}, { Text: A } = i, _ = a(() => pn(e), [e]), S = ($) => {
    try {
      const M = T();
      M.setSelectedAgent && M.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", $.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, p = ($) => {
    var M;
    (M = navigator.clipboard) == null || M.writeText($.value).then(() => {
      s.success("已复制到剪贴板");
    });
  };
  return _.length === 0 ? l.createElement(r, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: r.PRESENTED_IMAGE_SIMPLE
  }) : l.createElement(
    "div",
    null,
    l.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12
        }
      },
      d ? l.createElement(d, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      l.createElement(
        A,
        { strong: !0 },
        `推荐提问 (${_.length})`
      ),
      l.createElement(
        A,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    l.createElement(n, {
      dataSource: _,
      renderItem: ($, M) => l.createElement(
        n.Item,
        {
          actions: [
            l.createElement(
              u,
              {
                type: "link",
                size: "small",
                icon: I ? l.createElement(I) : void 0,
                onClick: () => p($)
              },
              "复制"
            )
          ]
        },
        l.createElement(n.Item.Meta, {
          avatar: l.createElement(
            o,
            { color: "blue", style: { borderRadius: "50%" } },
            `${M + 1}`
          ),
          title: l.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => S($)
            },
            $.value
          ),
          description: l.createElement(
            A,
            { type: "secondary", style: { fontSize: 12 } },
            $.label
          )
        })
      )
    })
  );
}
function el() {
  var ie;
  const e = T().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: o,
    Empty: i,
    Input: r,
    Button: u,
    message: s,
    Row: d,
    Col: I,
    Tabs: A,
    Modal: _,
    Typography: S
  } = T().antd, {
    ReloadOutlined: p,
    PlusOutlined: $,
    SearchOutlined: M,
    TeamOutlined: V,
    UserOutlined: R
  } = T().antdIcons || {}, { Text: Z, Paragraph: j } = S, [U, P] = t([]), [x, C] = t(!0), [K, N] = t(!1), [O, E] = t(null), [v, f] = t(""), [X, F] = t(!1), [ne, w] = t("experts"), [g, h] = t(
    null
  ), [b, oe] = t(""), [L, Y] = t(!1), [re, B] = t(!1), [W, se] = t(null), [y, te] = t([]), c = a(async () => {
    C(!0);
    try {
      const G = await Pt(), pe = await Promise.all(
        G.map(async (Ee) => {
          try {
            const [ve, Ce, ze] = await Promise.all([
              yt(Ee.id).catch(() => null),
              Et(Ee.id).catch(() => []),
              Rt(Ee.id).catch(() => [])
            ]);
            return {
              agent: Ee,
              config: ve,
              skills: Ce,
              mcps: ze,
              loading: !1
            };
          } catch {
            return {
              agent: Ee,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      P(pe), te(G);
    } catch (G) {
      s.error(G.message || "加载专家列表失败"), P([]);
    } finally {
      C(!1);
    }
  }, []);
  l(() => {
    c();
  }, [c]), l(() => {
    if (W && re) {
      const G = U.find(
        (pe) => pe.agent.id === W.agent.id
      );
      G && G !== W && se(G);
    }
  }, [U, W, re]);
  const ee = a(
    async (G) => {
      var Ce;
      const pe = G.coordinatorName || ((Ce = G.members[0]) == null ? void 0 : Ce.name);
      if (!pe) {
        s.error("无法确定协调者专家");
        return;
      }
      const Ee = pt(y, pe);
      if (!Ee) {
        s.error(`未找到协调者专家「${pe}」，请先创建该专家`);
        return;
      }
      if (/\{.+?\}/.test(G.taskTemplate)) {
        oe(""), h(G);
        return;
      }
      await z(G, Ee, G.taskTemplate);
    },
    [y, s]
  ), z = a(
    async (G, pe, Ee) => {
      var ve;
      Y(!0);
      try {
        const Ce = wa(G), ze = Ee ? Ce.replace(G.taskTemplate, Ee) : Ce, Ue = T();
        Ue.setSelectedAgent && Ue.setSelectedAgent(pe), await Sa(pe, ze), s.success(
          `团队任务已发起，协调者：${G.coordinatorName || ((ve = G.members[0]) == null ? void 0 : ve.name)}`
        ), h(null), le("/chat");
      } catch (Ce) {
        s.error(Ce.message || "发起团队任务失败");
      } finally {
        Y(!1);
      }
    },
    [s]
  ), le = (G) => {
    window.history.pushState({}, "", G), window.dispatchEvent(new PopStateEvent("popstate"));
  }, de = a((G) => {
    E(G), N(!0);
  }, []), fe = a((G) => {
    se(G), B(!0);
  }, []), ge = a(
    (G) => {
      if (!G.agent.enabled) {
        s.warning(`专家「${G.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const pe = T();
        pe.setSelectedAgent && pe.setSelectedAgent(G.agent.id);
      } catch (pe) {
        console.warn("[ugsci] Failed to set selected agent:", pe);
      }
      s.success(`已召唤专家「${G.agent.name}」，正在跳转至对话...`), le("/chat");
    },
    [s]
  ), ue = n(() => {
    if (!v.trim()) return U;
    const G = v.toLowerCase();
    return U.filter(
      (pe) => {
        var Ee;
        return pe.agent.name.toLowerCase().includes(G) || ((Ee = pe.agent.description) == null ? void 0 : Ee.toLowerCase().includes(G)) || pe.agent.id.toLowerCase().includes(G) || pe.skills.some((ve) => ve.name.toLowerCase().includes(G));
      }
    );
  }, [U, v]), q = U.filter((G) => G.agent.enabled).length, J = U.reduce(
    (G, pe) => G + pe.skills.filter((Ee) => Ee.enabled !== !1).length,
    0
  ), k = U.reduce((G, pe) => G + pe.mcps.length, 0), D = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        R ? e.createElement(R, { style: { fontSize: 14 } }) : null,
        "专家列表"
      ),
      children: e.createElement(
        "div",
        null,
        // Search bar
        e.createElement(
          "div",
          { style: { marginBottom: 16 } },
          e.createElement(r, {
            placeholder: "搜索专家名称、描述或技能...",
            prefix: M ? e.createElement(M) : void 0,
            value: v,
            onChange: (G) => f(G.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        x ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(o, { size: "large" })
        ) : ue.length === 0 ? e.createElement(i, {
          description: v ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          d,
          { gutter: [12, 12], align: "stretch" },
          ...ue.map(
            (G) => e.createElement(
              I,
              {
                key: G.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(qa, {
                expert: G,
                onClick: () => de(G),
                onSummon: () => ge(G),
                onConfigure: () => fe(G)
              })
            )
          )
        )
      )
    },
    {
      key: "teams",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        V ? e.createElement(V, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(ka, {
        agents: y,
        onLaunch: ee
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(ht, {
      title: "专家",
      subtitle: `共 ${U.length} 位专家（${q} 位启用）· ${J} 个技能 · ${k} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          u,
          {
            icon: p ? e.createElement(p) : void 0,
            onClick: () => {
              Xe(), c();
            },
            loading: x
          },
          "刷新"
        ),
        e.createElement(
          u,
          {
            type: "primary",
            icon: $ ? e.createElement($) : void 0,
            onClick: () => F(!0),
            style: Oe
          },
          "创建专家"
        )
      )
    }),
    e.createElement(A, {
      items: D,
      activeKey: ne,
      onChange: (G) => w(G)
    }),
    // Drawer
    e.createElement(Va, {
      expert: O,
      open: K,
      onClose: () => N(!1),
      onRefresh: () => c()
    }),
    // Template Modal
    e.createElement(Ya, {
      open: X,
      onClose: () => F(!1),
      onCreated: () => c()
    }),
    // Config Modal (gear icon)
    e.createElement(Xa, {
      expert: W,
      open: re,
      onClose: () => B(!1),
      onRefresh: () => c()
    }),
    // Team Launch Modal (for filling placeholders)
    g ? e.createElement(
      _,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(jt, {
            members: g.members.map((G) => G.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${g.name}`
          )
        ),
        onCancel: () => h(null),
        onOk: () => {
          var ve;
          const G = g.coordinatorName || ((ve = g.members[0]) == null ? void 0 : ve.name), pe = G ? pt(y, G) : null;
          if (!pe) {
            s.error("无法找到协调者专家");
            return;
          }
          let Ee = g.taskTemplate;
          b.trim() && (Ee = b.trim()), z(g, pe, Ee);
        },
        confirmLoading: L,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          Z,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "任务模板（包含占位符 {参数名}，可在下方编辑替换）："
        ),
        e.createElement(
          "div",
          {
            style: {
              padding: 12,
              background: "#f5f5f5",
              borderRadius: 6,
              fontSize: 12,
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              lineHeight: 1.6
            }
          },
          g.taskTemplate
        )
      ),
      e.createElement(
        "div",
        null,
        e.createElement(
          Z,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "输入具体任务描述（替换上面的占位符内容）："
        ),
        e.createElement(r.TextArea, {
          value: b,
          onChange: (G) => oe(G.target.value),
          rows: 5,
          placeholder: g.taskTemplate,
          style: { fontSize: 13 }
        })
      ),
      e.createElement(
        "div",
        {
          style: {
            marginTop: 12,
            padding: "8px 12px",
            background: "#e6f4ff",
            borderRadius: 6
          }
        },
        e.createElement(
          Z,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${g.coordinatorName || ((ie = g.members[0]) == null ? void 0 : ie.name) || "—"} · 成员: ${g.members.map((G) => G.name).join("、")}`
        )
      )
    ) : null
  );
}
const xn = [
  "console",
  "dingtalk",
  "feishu",
  "wechat",
  "wecom",
  "discord",
  "telegram",
  "qq",
  "imessage",
  "mattermost",
  "matrix",
  "onebot",
  "mqtt",
  "voice",
  "sip",
  "xiaoyi"
], tl = {
  console: "Console",
  dingtalk: "DingTalk",
  feishu: "Feishu",
  wechat: "WeChat",
  wecom: "WeCom",
  discord: "Discord",
  telegram: "Telegram",
  qq: "QQ",
  imessage: "iMessage",
  mattermost: "Mattermost",
  matrix: "Matrix",
  onebot: "OneBot",
  mqtt: "MQTT",
  voice: "Voice",
  sip: "SIP",
  xiaoyi: "XiaoYi"
};
function De(e) {
  return (e || "").trim() || "channel";
}
function We(e) {
  return (e || "").trim();
}
function Cn(e) {
  const t = We(e);
  return t === "" || t === "*";
}
function vt(e) {
  return e === "user" ? "user" : "all";
}
function Be(e) {
  const t = vt(e.subject_type);
  return {
    source_type: De(e.source_type),
    source_value: We(e.source_value),
    subject_type: t,
    subject_value: t === "all" ? "" : (e.subject_value || "").trim(),
    effect: e.effect
  };
}
function Ke(e) {
  return { tool_name: e.tool_name || "*", ...Be(e) };
}
function kn(e) {
  return { tool_name: e.tool_name || "*", effect: e.effect };
}
function _n(e) {
  return [...e].map(Be).sort(
    (t, l) => t.source_type.localeCompare(l.source_type) || t.source_value.localeCompare(l.source_value) || t.subject_type.localeCompare(l.subject_type) || t.subject_value.localeCompare(l.subject_value)
  );
}
function ft(e) {
  return [...e].map(Ke).sort(
    (t, l) => t.tool_name.localeCompare(l.tool_name) || t.source_type.localeCompare(l.source_type) || t.source_value.localeCompare(l.source_value) || t.subject_type.localeCompare(l.subject_type) || t.subject_value.localeCompare(l.subject_value)
  );
}
function Tn(e) {
  return [...e].map(kn).sort((t, l) => t.tool_name.localeCompare(l.tool_name));
}
function Le(e) {
  return {
    default_effect: e.default_effect || "deny",
    client_overrides: _n(e.client_overrides || []),
    tool_defaults: Tn(e.tool_defaults || []),
    tool_overrides: ft(e.tool_overrides || []),
    unmanaged_rules_count: e.unmanaged_rules_count || 0
  };
}
function Me(e) {
  return [De(e.source_type), We(e.source_value), vt(e.subject_type), e.subject_type === "all" ? "" : (e.subject_value || "").trim()].join("\0");
}
function $e(e) {
  return [e.tool_name || "*", De(e.source_type), We(e.source_value), vt(e.subject_type), e.subject_type === "all" ? "" : (e.subject_value || "").trim()].join("\0");
}
function nl(e, t) {
  const l = Le(t), a = /* @__PURE__ */ new Map();
  l.tool_overrides.forEach((s) => {
    const d = Ke(s), I = a.get(d.tool_name) || [];
    I.push(d), a.set(d.tool_name, I);
  });
  const n = new Map(l.tool_defaults.map((s) => [s.tool_name, kn(s)])), o = new Set(e.map((s) => s.name)), i = e.map((s) => {
    var d;
    return {
      toolName: s.name,
      description: s.description,
      inputSchema: s.input_schema,
      stale: !1,
      defaultEffect: ((d = n.get(s.name)) == null ? void 0 : d.effect) || l.default_effect,
      hasExplicitDefault: n.has(s.name),
      rules: ft(a.get(s.name) || [])
    };
  }), r = /* @__PURE__ */ new Set([...a.keys(), ...n.keys()]), u = Array.from(r).filter((s) => s !== "*" && !o.has(s)).map((s) => {
    var d;
    return {
      toolName: s,
      description: "",
      inputSchema: {},
      stale: !0,
      defaultEffect: ((d = n.get(s)) == null ? void 0 : d.effect) || l.default_effect,
      hasExplicitDefault: n.has(s),
      rules: ft(a.get(s) || [])
    };
  });
  return [...i, ...u];
}
function zn(e, t) {
  const l = Le(e), a = new Set(
    t === null ? l.client_overrides.map((n) => Me(Be(n))) : l.tool_overrides.filter((n) => n.tool_name === t).map((n) => $e(Ke(n)))
  );
  for (const n of xn) {
    const o = t === null ? Me({ source_type: "channel", source_value: n, subject_type: "all", subject_value: "" }) : $e({ tool_name: t, source_type: "channel", source_value: n, subject_type: "all", subject_value: "" });
    if (!a.has(o)) return n;
  }
  return "console";
}
function al(e) {
  return Ct(e, { source_type: "channel", source_value: zn(e, null), subject_type: "all", subject_value: "", effect: "ask" });
}
function ll(e, t) {
  return kt(e, { tool_name: t, source_type: "channel", source_value: zn(e, t), subject_type: "all", subject_value: "", effect: "ask" });
}
function Ct(e, t, l) {
  const a = Le(e), n = Be(t), o = Me(l || n), i = Me(n), r = a.client_overrides.filter((u) => {
    const s = Me(Be(u));
    return s !== o && s !== i;
  });
  return r.push(n), { ...a, client_overrides: _n(r) };
}
function kt(e, t, l) {
  const a = Le(e), n = Ke(t), o = $e(l || n), i = $e(n), r = a.tool_overrides.filter((u) => {
    const s = $e(Ke(u));
    return s !== o && s !== i;
  });
  return r.push(n), { ...a, tool_overrides: ft(r) };
}
function ol(e, t, l) {
  const a = Le(e), n = a.tool_defaults.filter((o) => o.tool_name !== t);
  return n.push({ tool_name: t, effect: l }), { ...a, tool_defaults: Tn(n) };
}
function rl(e, t) {
  const l = Le(e), a = Me(t);
  return { ...l, client_overrides: l.client_overrides.filter((n) => Me(Be(n)) !== a) };
}
function sl(e, t) {
  const l = Le(e), a = $e(t);
  return { ...l, tool_overrides: l.tool_overrides.filter((n) => $e(Ke(n)) !== a) };
}
function In(e, t) {
  const l = De(t.source_type), a = We(t.source_value);
  if (Cn(a)) return [];
  const n = /* @__PURE__ */ new Map();
  return e.forEach((o) => {
    if (De(o.source_type) !== l || We(o.source_value) !== a) return;
    const i = (o.subject_value || "").trim();
    !i || n.has(i) || n.set(i, o);
  }), Array.from(n.values());
}
function il(e, t) {
  return In(e, t).map((l) => ({ label: l.subject_value, value: l.subject_value }));
}
function Lt(e) {
  return De(e.source_type) === "channel" && Cn(e.source_value) && vt(e.subject_type) === "user" && !!(e.subject_value || "").trim();
}
function cl(e, t) {
  const l = Be(t);
  return l.subject_type === "user" && !!l.subject_value && l.subject_value !== "*" && e.some((a) => De(a.source_type) === l.source_type) && !Lt(l) && !In(e, l).some((a) => a.subject_value === l.subject_value);
}
function ml(e) {
  const t = [...e.client_overrides || [], ...e.tool_overrides || []];
  for (const l of t) {
    const a = Be(l);
    if (a.subject_type === "user") {
      if (!a.subject_value || a.subject_value === "*" || !a.source_value) return { reason: "missingUserValue", rule: l };
      if (Lt(a)) return { reason: "ambiguousUserSource", rule: l };
    }
  }
  return null;
}
function Qt(e, t) {
  const l = { ...e, ...t };
  return t.subject_type && (l.subject_value = ""), (t.source_type !== void 0 || t.source_value !== void 0) && t.subject_value === void 0 && l.subject_type === "user" && (l.subject_value = ""), l;
}
function St(e) {
  return JSON.stringify(Le(e));
}
function dl({
  client: e,
  agentId: t,
  open: l,
  onClose: a,
  onSave: n
}) {
  const o = T().React, { useState: i, useEffect: r, useMemo: u, useCallback: s } = o, { Modal: d, Spin: I, Empty: A, Button: _, Tag: S, Segmented: p, Select: $, Input: M, AutoComplete: V, Typography: R, message: Z } = T().antd, { PlusOutlined: j, DeleteOutlined: U } = T().antdIcons || {}, { Text: P } = R, [x, C] = i(null), [K, N] = i([]), [O, E] = i([]), [v, f] = i(!1), [X, F] = i(!1), [ne, w] = i(""), [g, h] = i("");
  r(() => {
    if (!l) return;
    let c = !1;
    return (async () => {
      f(!0), N([]), E([]), w("");
      try {
        const z = await ua(t, e.key);
        if (!c) {
          const le = Le(z);
          C(le), h(St(le));
        }
        try {
          const le = await ga(t);
          c || E(le);
        } catch {
          c || E([]);
        }
        if (!e.enabled) {
          c || w("MCP 客户端未启用，无法获取工具列表");
          return;
        }
        try {
          const le = await da(t, e.key);
          c || N(le);
        } catch (le) {
          c || w((le == null ? void 0 : le.message) || "无法加载工具列表");
        }
      } catch {
        c || (C(null), h(""), w("加载访问策略失败"));
      } finally {
        c || f(!1);
      }
    })(), () => {
      c = !0;
    };
  }, [l, e.key, e.enabled, t]);
  const b = u(() => x ? nl(K, x) : [], [K, x]), oe = u(() => !!(x && St(x) !== g), [x, g]), L = (c) => tl[c] || c, Y = s((c) => {
    C((ee) => ee && { ...ee, default_effect: c });
  }, []), re = s((c, ee) => {
    C((z) => z && Ct(z, Qt(c, ee), { source_type: c.source_type, source_value: c.source_value, subject_type: c.subject_type, subject_value: c.subject_value }));
  }, []), B = s((c, ee) => {
    C((z) => z && kt(z, Qt(c, ee), { tool_name: c.tool_name, source_type: c.source_type, source_value: c.source_value, subject_type: c.subject_type, subject_value: c.subject_value }));
  }, []), W = s(async () => {
    if (!x) return;
    const c = ml(x);
    if (c) {
      Z.error(c.reason === "missingUserValue" ? "用户规则缺少用户标识" : "用户来源不明确");
      return;
    }
    F(!0);
    try {
      await n(e.key, x) && (h(St(x)), a());
    } finally {
      F(!1);
    }
  }, [x, e.key, n, a, Z]), se = s(() => {
    if (!oe || X) {
      a();
      return;
    }
    d.confirm({
      title: "放弃修改",
      content: "确定要放弃未保存的修改吗？",
      okText: "确认",
      cancelText: "取消",
      onOk: a
    });
  }, [oe, X, a]), y = s((c, ee) => {
    const z = il(O, c), le = Lt(c), de = cl(O, c), fe = [{ label: "所有渠道", value: "*" }, ...xn.map((D) => ({ label: L(D), value: D }))], ge = [{ label: "所有人", value: "all" }, { label: "指定用户", value: "user" }], ue = ee ? B : re, q = (D) => {
      C(ee ? (ie) => ie && kt(ie, { ...c, effect: D }) : (ie) => ie && Ct(ie, { ...c, effect: D }));
    }, J = () => {
      C(ee ? (D) => D && sl(D, { tool_name: c.tool_name, source_type: c.source_type, source_value: c.source_value, subject_type: c.subject_type, subject_value: c.subject_value }) : (D) => D && rl(D, { source_type: c.source_type, source_value: c.source_value, subject_type: c.subject_type, subject_value: c.subject_value }));
    }, k = ee ? $e(c) : Me(c);
    return o.createElement(
      "div",
      { key: k, style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto", gap: 6, alignItems: "end", padding: "6px 0", borderBottom: "1px solid #f5f5f5" } },
      // source_type
      o.createElement(
        "div",
        null,
        o.createElement(P, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源类型"),
        o.createElement($, {
          size: "small",
          style: { width: "100%" },
          value: c.source_type || "channel",
          onChange: (D) => ue(c, { source_type: D, source_value: D === "channel" ? c.source_value || "*" : c.source_value }),
          options: [{ label: "渠道", value: "channel" }, ...c.source_type && c.source_type !== "channel" ? [{ label: c.source_type, value: c.source_type }] : []]
        })
      ),
      // source_value
      o.createElement(
        "div",
        null,
        o.createElement(P, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源"),
        c.source_type === "channel" ? o.createElement($, { size: "small", style: { width: "100%" }, value: c.source_value || "*", onChange: (D) => ue(c, { source_value: D }), options: fe }) : o.createElement(M, { size: "small", placeholder: "来源标识", value: c.source_value, onChange: (D) => ue(c, { source_value: D.target.value }) })
      ),
      // subject_type
      o.createElement(
        "div",
        null,
        o.createElement(P, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "对象类型"),
        o.createElement($, { size: "small", style: { width: "100%" }, value: c.subject_type, onChange: (D) => ue(c, { subject_type: D }), options: ge })
      ),
      // subject_value
      o.createElement(
        "div",
        null,
        o.createElement(P, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "对象"),
        c.subject_type === "user" ? o.createElement(
          "div",
          null,
          o.createElement(V, {
            size: "small",
            style: { width: "100%" },
            value: c.subject_value,
            options: z,
            placeholder: z.length > 0 ? "用户 ID" : "无近期用户",
            onChange: (D) => ue(c, { subject_value: D }),
            onSelect: (D) => ue(c, { subject_value: D }),
            filterOption: (D, ie) => String((ie == null ? void 0 : ie.value) || "").toLowerCase().includes(D.toLowerCase())
          }),
          le ? o.createElement(P, { style: { fontSize: 10, color: "#fa8c16", display: "block" } }, "请先选择具体渠道") : null,
          de ? o.createElement(P, { style: { fontSize: 10, color: "#fa8c16", display: "block" } }, "未知的用户标识") : null
        ) : o.createElement(M, { size: "small", disabled: !0, value: "所有人" })
      ),
      // effect
      o.createElement(
        "div",
        null,
        o.createElement(P, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "效果"),
        o.createElement($, {
          size: "small",
          style: { width: "100%" },
          value: c.effect,
          onChange: (D) => q(D),
          options: [{ label: "允许", value: "allow" }, { label: "询问", value: "ask" }, { label: "拒绝", value: "deny" }]
        })
      ),
      // delete
      o.createElement(_, { size: "small", type: "text", icon: o.createElement(U), onClick: J, title: "删除规则" })
    );
  }, [O, re, B]), te = (c, ee) => {
    const le = {
      ask: { bg: "rgba(245,158,11,0.24)", border: "rgba(217,119,6,0.36)", text: "#8a4b00" },
      allow: { bg: "rgba(34,197,94,0.22)", border: "rgba(22,163,74,0.35)", text: "#17643a" },
      deny: { bg: "rgba(239,68,68,0.2)", border: "rgba(220,38,38,0.34)", text: "#9f1f26" }
    }[c];
    return o.createElement(p, {
      size: "small",
      value: c,
      onChange: (de) => ee(de),
      style: { "--mcp-policy-segment-bg": le.bg, "--mcp-policy-segment-border": le.border, "--mcp-policy-segment-text": le.text },
      options: [{ label: "询问", value: "ask" }, { label: "允许", value: "allow" }, { label: "拒绝", value: "deny" }]
    });
  };
  return o.createElement(
    d,
    {
      title: `${e.name || e.key} - 工具与访问策略`,
      open: l,
      onCancel: se,
      width: "min(1040px, calc(100vw - 32px))",
      styles: {
        body: {
          maxHeight: "min(520px, calc(100vh - 280px))",
          overflowY: "auto",
          overflowX: "hidden"
        }
      },
      footer: o.createElement(
        "div",
        { style: { textAlign: "right" } },
        o.createElement(_, { onClick: se, style: { marginRight: 8 } }, "取消"),
        o.createElement(_, { type: "primary", onClick: W, loading: X, disabled: !x || v }, "保存")
      )
    },
    v && !x ? o.createElement("div", { style: { textAlign: "center", padding: 40 } }, o.createElement(I)) : x ? o.createElement(
      "div",
      null,
      // ── Client-level panel ──
      o.createElement(
        "div",
        { style: { marginBottom: 16, padding: "12px 16px", background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" } },
        o.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
          o.createElement(P, { strong: !0 }, "客户端访问策略"),
          o.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 8 } },
            o.createElement(P, { style: { fontSize: 12, color: "#666" } }, "默认:"),
            te(x.default_effect, Y),
            o.createElement(_, { size: "small", icon: o.createElement(j), onClick: () => C((c) => c && al(c)) }, "添加规则")
          )
        ),
        x.client_overrides.length === 0 ? o.createElement(P, { style: { fontSize: 12, color: "#999" } }, "暂无客户端级覆盖规则") : o.createElement("div", null, ...x.client_overrides.map((c) => y(c, !1)))
      ),
      // ── Error message ──
      ne ? o.createElement("div", { style: { color: "#ff4d4f", fontSize: 12, marginBottom: 8 } }, ne) : null,
      // ── Tool-level panel ──
      o.createElement(P, { strong: !0, style: { display: "block", marginBottom: 8 } }, "工具访问策略"),
      b.length === 0 ? o.createElement(A, { description: "暂无工具" }) : o.createElement(
        "div",
        null,
        ...b.map(
          (c) => o.createElement(
            "div",
            { key: c.toolName, style: { marginBottom: 12, padding: "10px 12px", background: "#fafafa", borderRadius: 6, border: "1px solid #f0f0f0" } },
            o.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 } },
              o.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 6 } },
                o.createElement(S, { color: c.stale ? "default" : "blue" }, c.toolName),
                c.stale ? o.createElement(S, { color: "orange" }, "已失效") : null
              ),
              o.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                o.createElement(P, { style: { fontSize: 12, color: "#666" } }, "默认:"),
                te(c.defaultEffect, (ee) => C((z) => z && ol(z, c.toolName, ee))),
                o.createElement(_, { size: "small", icon: o.createElement(j), onClick: () => C((ee) => ee && ll(ee, c.toolName)) }, "添加规则")
              )
            ),
            // Tool schema
            c.description || c.inputSchema && Object.keys(c.inputSchema).length > 0 ? o.createElement(
              "details",
              { style: { marginBottom: 6, fontSize: 12 } },
              o.createElement("summary", { style: { cursor: "pointer", color: "#888" } }, "工具详情"),
              c.description ? o.createElement("div", { style: { padding: "4px 0", color: "#666" } }, c.description) : null,
              c.inputSchema && Object.keys(c.inputSchema).length > 0 ? o.createElement("pre", { style: { background: "#f5f5f5", padding: 8, borderRadius: 4, fontSize: 11, overflow: "auto", maxHeight: 200 } }, JSON.stringify(c.inputSchema, null, 2)) : null
            ) : null,
            // Tool rules
            c.rules.length === 0 ? o.createElement(P, { style: { fontSize: 12, color: "#999" } }, "暂无工具级覆盖规则") : o.createElement("div", null, ...c.rules.map((ee) => y(ee, !0)))
          )
        )
      )
    ) : o.createElement("div", { style: { color: "#ff4d4f" } }, "加载访问策略失败")
  );
}
function ul({
  client: e,
  agentId: t,
  open: l,
  onClose: a,
  onAuthChanged: n
}) {
  var F, ne, w, g, h;
  const o = T().React, { useState: i, useCallback: r, useEffect: u } = o, { Modal: s, Button: d, Input: I, Typography: A, message: _ } = T().antd, { Text: S } = A, [p, $] = i("idle"), [M, V] = i(""), [R, Z] = i(!1), [j, U] = i(((F = e.oauth_status) == null ? void 0 : F.client_id) || ""), [P, x] = i(((ne = e.oauth_status) == null ? void 0 : ne.scope) || ""), [C, K] = i(""), [N, O] = i("");
  u(() => {
    if (p !== "waiting") return;
    const b = setInterval(async () => {
      try {
        (await ya(t, e.key)).authorized && ($("success"), n());
      } catch {
      }
    }, 2e3);
    return () => clearInterval(b);
  }, [p, e.key, t, n]);
  const E = p === "success" || p === "idle" && ((w = e.oauth_status) == null ? void 0 : w.authorized) === !0, v = p === "idle" && ((g = e.oauth_status) == null ? void 0 : g.authorized) && e.oauth_status.expires_at > 0 && e.oauth_status.expires_at < Date.now() / 1e3, f = r(async () => {
    var b;
    if (!((b = e.url) != null && b.trim())) {
      V("缺少 URL");
      return;
    }
    $("starting"), V("");
    try {
      const oe = await fa(t, e.key, {
        url: e.url,
        scope: P,
        client_id: j,
        auth_endpoint: C,
        token_endpoint: N
      });
      $("waiting"), window.open(oe.auth_url, "_blank", "popup,width=600,height=700");
    } catch (oe) {
      $("error"), V((oe == null ? void 0 : oe.message) || "OAuth 启动失败");
    }
  }, [t, e.key, e.url, P, j, C, N]), X = r(async () => {
    $("revoking");
    try {
      await Ea(t, e.key), $("idle"), n();
    } catch {
      $("idle");
    }
  }, [t, e.key, n]);
  return o.createElement(
    s,
    {
      title: `${e.name || e.key} — OAuth 授权管理`,
      open: l,
      onCancel: a,
      footer: o.createElement("div", { style: { textAlign: "right" } }, o.createElement(d, { onClick: a }, "关闭")),
      width: 560
    },
    o.createElement(
      "div",
      { style: { background: "#f8f9fa", border: "1px solid #e9ecef", borderRadius: 8, padding: "12px 14px" } },
      // Status
      o.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 } },
        o.createElement(
          "span",
          { style: { fontSize: 12, padding: "2px 8px", borderRadius: 12, border: "1px solid", color: v ? "#e67e22" : E ? "#27ae60" : "#7f8c8d", borderColor: v ? "#e67e22" : E ? "#27ae60" : "#7f8c8d", background: "white" } },
          v ? "已过期" : E ? "已授权" : p === "waiting" ? "等待授权..." : p === "error" ? "授权失败" : "未授权"
        ),
        o.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          E || v ? o.createElement(d, { size: "small", onClick: X, loading: p === "revoking" }, "撤销") : null,
          o.createElement(d, { size: "small", type: E && !v ? "default" : "primary", onClick: f, loading: p === "starting" || p === "waiting", disabled: !((h = e.url) != null && h.trim()) }, E && !v ? "重新授权" : "授权")
        )
      ),
      M ? o.createElement("p", { style: { color: "#c0392b", fontSize: 12 } }, M) : null,
      // Advanced
      o.createElement(
        "div",
        { style: { marginTop: 8, cursor: "pointer", color: "#888", fontSize: 12 }, onClick: () => Z((b) => !b) },
        R ? "收起高级设置" : "展开高级设置"
      ),
      R ? o.createElement(
        "div",
        { style: { marginTop: 8, padding: "10px 12px", background: "white", borderRadius: 6, border: "1px solid #e9ecef" } },
        o.createElement(S, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2 } }, "Client ID"),
        o.createElement(I, { size: "small", placeholder: "留空则使用动态注册", value: j, onChange: (b) => U(b.target.value) }),
        o.createElement(S, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "Scope"),
        o.createElement(I, { size: "small", placeholder: "OAuth scope", value: P, onChange: (b) => x(b.target.value) }),
        o.createElement(S, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "授权端点"),
        o.createElement(I, { size: "small", placeholder: "https://auth.example.com/authorize", value: C, onChange: (b) => K(b.target.value) }),
        o.createElement(S, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "令牌端点"),
        o.createElement(I, { size: "small", placeholder: "https://auth.example.com/token", value: N, onChange: (b) => O(b.target.value) })
      ) : null
    )
  );
}
function pl({
  mcp: e,
  agentId: t,
  onToggle: l,
  onDelete: a,
  onUpdate: n,
  onUpdatePolicy: o,
  onRefresh: i
}) {
  const r = T().React, { useState: u } = r, { Card: s, Tag: d, Tooltip: I, Modal: A, Input: _, Button: S, Typography: p } = T().antd, { Text: $ } = p, {
    EyeOutlined: M,
    EyeInvisibleOutlined: V,
    DeleteOutlined: R,
    ToolOutlined: Z
  } = T().antdIcons || {}, [j, U] = u(!1), [P, x] = u(!1), [C, K] = u(!1), [N, O] = u(""), [E, v] = u(!1), [f, X] = u(!1), F = e.transport === "streamable_http" || e.transport === "sse", ne = F ? "Remote" : "Local", w = e.oauth_status, g = Date.now() / 1e3, h = !!(w != null && w.authorized) && w.expires_at > g, b = !!(w != null && w.authorized) && w.expires_at <= g, oe = !!w, L = () => {
    O(JSON.stringify(e, null, 2)), v(!1), U(!0);
  }, Y = async () => {
    try {
      const B = JSON.parse(N), W = [
        "name",
        "description",
        "command",
        "enabled",
        "transport",
        "url",
        "headers",
        "args",
        "env",
        "cwd"
      ], se = {};
      for (const te of W)
        te in B && (se[te] = B[te]);
      await n(e.key, se) && (U(!1), v(!1));
    } catch {
      alert("JSON 格式错误");
    }
  }, re = JSON.stringify(e, null, 2);
  return r.createElement(
    r.Fragment,
    null,
    r.createElement(
      s,
      {
        hoverable: !0,
        onClick: L,
        size: "small",
        style: {
          cursor: "pointer",
          borderColor: e.enabled ? void 0 : "#d9d9d9",
          opacity: e.enabled ? 1 : 0.7,
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column"
        },
        styles: {
          body: {
            display: "flex",
            flexDirection: "column",
            height: "100%",
            flex: 1
          }
        }
      },
      // ── Header: name + type badge + oauth icons + status ──
      r.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 } },
        r.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0 } },
          r.createElement(
            I,
            { title: e.name },
            r.createElement($, { strong: !0, style: { fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, e.name || e.key)
          ),
          r.createElement(
            "span",
            { style: { fontSize: 10, padding: "1px 6px", borderRadius: 4, background: F ? "#e6f4ff" : "#f9f0ff", color: F ? "#1677ff" : "#722ed1", flexShrink: 0 } },
            ne
          ),
          // OAuth status icons
          oe && b ? r.createElement("span", { style: { fontSize: 11, color: "#e67e22", flexShrink: 0 } }, "⚠") : null,
          oe && h ? r.createElement("span", { style: { fontSize: 11, color: "#27ae60", flexShrink: 0 } }, "✓") : null,
          oe && !h && !b ? r.createElement("span", { style: { fontSize: 11, color: "#7f8c8d", flexShrink: 0 } }, "🔒") : null
        ),
        r.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, flexShrink: 0 } },
          r.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: e.enabled ? "#52c41a" : "#d9d9d9" } }),
          e.enabled ? "启用" : "停用"
        )
      ),
      // ── Description ──
      r.createElement(
        "p",
        { style: { fontSize: 12, color: "#666", margin: "6px 0 8px", lineHeight: 1.6, minHeight: 36, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } },
        e.description || "-"
      ),
      // ── Footer: tools button + secondary actions ──
      r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8, marginTop: "auto", paddingTop: 12, borderTop: "1px solid #f0f0f0" } },
        // Tools button
        r.createElement(
          S,
          {
            size: "small",
            icon: Z ? r.createElement(Z) : void 0,
            onClick: (B) => {
              B.stopPropagation(), K(!0);
            },
            style: { width: "100%" }
          },
          "工具与访问策略"
        ),
        // Secondary actions: oauth (remote only) + toggle + delete
        r.createElement(
          "div",
          { style: { display: "grid", gridTemplateColumns: F ? "1fr 1fr 1fr" : "1fr 1fr", gap: 8 } },
          F ? r.createElement(
            S,
            {
              size: "small",
              onClick: (B) => {
                B.stopPropagation(), X(!0);
              },
              style: {
                color: h ? "#27ae60" : b ? "#e67e22" : void 0,
                borderColor: h ? "#27ae60" : b ? "#e67e22" : void 0,
                background: h ? "rgba(39,174,96,0.06)" : b ? "rgba(230,126,34,0.06)" : void 0
              }
            },
            h ? "已授权" : b ? "已过期" : "授权"
          ) : null,
          r.createElement(
            S,
            {
              size: "small",
              icon: e.enabled ? V ? r.createElement(V) : void 0 : M ? r.createElement(M) : void 0,
              onClick: l
            },
            e.enabled ? "禁用" : "启用"
          ),
          r.createElement(
            S,
            {
              size: "small",
              danger: !0,
              icon: R ? r.createElement(R) : void 0,
              onClick: (B) => {
                B.stopPropagation(), x(!0);
              }
            },
            "删除"
          )
        )
      )
    ),
    // ── Delete Confirmation Modal ──
    r.createElement(
      A,
      {
        title: "确认删除",
        open: P,
        onOk: () => {
          x(!1), a();
        },
        onCancel: () => x(!1),
        okText: "确认删除",
        cancelText: "取消",
        okButtonProps: { danger: !0 }
      },
      r.createElement("p", null, `确定要删除 MCP 客户端「${e.name || e.key}」吗？此操作不可撤销。`)
    ),
    // ── JSON Config Modal (click card to view/edit) ──
    r.createElement(
      A,
      {
        title: `${e.name || e.key} - 配置`,
        open: j,
        onCancel: () => {
          U(!1), v(!1);
        },
        footer: r.createElement(
          "div",
          { style: { textAlign: "right" } },
          r.createElement(S, { onClick: () => {
            U(!1), v(!1);
          }, style: { marginRight: 8 } }, "取消"),
          E ? r.createElement(S, { type: "primary", onClick: Y }, "保存") : r.createElement(S, { type: "primary", onClick: () => v(!0) }, "编辑")
        ),
        width: 700
      },
      r.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "密钥类字段（如 API_KEY）可能已被后端脱敏，保存时不会覆盖脱敏值。"
      ),
      E ? r.createElement(_.TextArea, {
        value: N,
        onChange: (B) => O(B.target.value),
        autoSize: { minRows: 15, maxRows: 25 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      }) : r.createElement(
        "pre",
        { style: { backgroundColor: "#f5f5f5", padding: 16, borderRadius: 8, maxHeight: 400, overflow: "auto", fontSize: 13, fontFamily: "Monaco, Courier New, monospace" } },
        re
      )
    ),
    // ── Access Modal (tools + access policy) ──
    r.createElement(dl, {
      client: e,
      agentId: t,
      open: C,
      onClose: () => K(!1),
      onSave: o
    }),
    // ── OAuth Modal (remote clients only) ──
    F ? r.createElement(ul, {
      client: e,
      agentId: t,
      open: f,
      onClose: () => X(!1),
      onAuthChanged: async () => {
        await (i == null ? void 0 : i());
      }
    }) : null
  );
}
const _t = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, Pn = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, On = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function An(e) {
  return nt(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
function Zt(e) {
  return nt(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function en(e) {
  const t = e.map(encodeURIComponent).join(",");
  return nt(`/ugsci/avatar/team/${t}`);
}
function Re({
  name: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const a = T().React, [n, o] = a.useState(0), i = n === 0 ? Zt(e) : `${Zt(e)}?_r=${n}`;
  return a.createElement("img", {
    src: i,
    alt: e,
    onError: () => {
      n < 1 && o(n + 1);
    },
    style: { width: t, height: t, borderRadius: l, objectFit: "cover", flexShrink: 0 }
  });
}
function jt({
  members: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const a = T().React, [n, o] = a.useState(0);
  if (!e || e.length === 0)
    return a.createElement("span", {
      style: { width: t, height: t, display: "inline-block" }
    });
  const i = e.slice(0, 5), r = n === 0 ? en(i) : `${en(i)}?_r=${n}`;
  return a.createElement("img", {
    src: r,
    alt: "team",
    onError: () => {
      n < 1 && o(n + 1);
    },
    style: { width: t, height: t, borderRadius: l, objectFit: "cover", flexShrink: 0 }
  });
}
async function gl() {
  return ae("/ugsci/engines/list");
}
async function fl(e) {
  return ae("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function yl(e, t) {
  return ae(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function El(e) {
  return ae(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function hl() {
  return ae("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function vl({
  engine: e,
  onClick: t
}) {
  const l = T().React, { Card: a, Tag: n, Typography: o } = T().antd, { Text: i } = o, r = e.status === "detected", u = Pn[e.category] || "📦", d = On.has(e.id) ? l.createElement("img", {
    src: An(e.id),
    alt: e.name,
    style: { width: 24, height: 24, objectFit: "contain" }
  }) : l.createElement("span", { style: { fontSize: 20 } }, u);
  return l.createElement(
    a,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        borderColor: r ? void 0 : "#d9d9d9",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column"
      },
      styles: {
        body: {
          display: "flex",
          flexDirection: "column",
          height: "100%",
          flex: 1
        }
      }
    },
    l.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8
        }
      },
      l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        d,
        l.createElement(
          "div",
          null,
          l.createElement(
            i,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          l.createElement("br"),
          l.createElement(
            i,
            { type: "secondary", style: { fontSize: 11 } },
            e.vendor || "—"
          )
        )
      ),
      l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" } },
        r ? l.createElement(
          n,
          { color: "success", style: { fontSize: 11 } },
          "✅ 已检测"
        ) : e.executable_path ? l.createElement(
          n,
          { color: "warning", style: { fontSize: 11 } },
          "⚠ 路径无效"
        ) : l.createElement(
          n,
          { style: { fontSize: 11 } },
          "🔧 待配置"
        ),
        e.is_default ? l.createElement(
          n,
          { color: "blue", style: { fontSize: 10 } },
          "默认"
        ) : e.is_custom ? l.createElement(
          n,
          { color: "purple", style: { fontSize: 10 } },
          "自定义"
        ) : null
      )
    ),
    l.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      l.createElement(
        i,
        { type: "secondary", style: { fontSize: 12 } },
        e.description || "暂无描述"
      )
    ),
    l.createElement(
      "div",
      {
        style: {
          marginTop: 8,
          display: "flex",
          gap: 4,
          flexWrap: "wrap"
        }
      },
      e.category ? l.createElement(
        n,
        { style: { fontSize: 11 } },
        _t[e.category] || e.category
      ) : null,
      e.version ? l.createElement(
        n,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (I) => l.createElement(
          n,
          { key: I, color: "cyan", style: { fontSize: 10 } },
          I
        )
      )
    )
  );
}
function bl() {
  const e = T().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: o,
    Empty: i,
    Button: r,
    message: u,
    Row: s,
    Col: d,
    Drawer: I,
    Descriptions: A,
    Tag: _,
    Typography: S,
    Modal: p,
    Input: $,
    Select: M,
    Popconfirm: V,
    Space: R
  } = T().antd, {
    ReloadOutlined: Z,
    SearchOutlined: j,
    PlusOutlined: U,
    EditOutlined: P,
    DeleteOutlined: x,
    CopyOutlined: C,
    ExperimentOutlined: K
  } = T().antdIcons || {}, { Text: N, Paragraph: O } = S, [E, v] = t([]), [f, X] = t(!0), [F, ne] = t(""), [w, g] = t(!1), [h, b] = t(null), [oe, L] = t(!1), [Y, re] = t(null), [B, W] = t({}), [se, y] = t(!1), te = a(async () => {
    X(!0);
    try {
      const q = await gl();
      v(q.engines || []);
    } catch (q) {
      u.error(q.message || "加载引擎列表失败"), v([]);
    } finally {
      X(!1);
    }
  }, []);
  l(() => {
    te();
  }, [te]);
  const c = n(() => {
    if (!F.trim()) return E;
    const q = F.toLowerCase();
    return E.filter(
      (J) => {
        var k;
        return J.name.toLowerCase().includes(q) || J.vendor.toLowerCase().includes(q) || J.category.toLowerCase().includes(q) || ((k = J.description) == null ? void 0 : k.toLowerCase().includes(q));
      }
    );
  }, [E, F]);
  E.filter((q) => q.status === "detected").length;
  const ee = a((q) => {
    navigator.clipboard.writeText(q).then(() => u.success("路径已复制")).catch(() => u.error("复制失败"));
  }, []), z = a(() => {
    re(null), W({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), L(!0);
  }, []), le = a((q) => {
    re(q), W({ ...q }), L(!0), g(!1);
  }, []), de = a(async () => {
    var q;
    if (!((q = B.name) != null && q.trim())) {
      u.warning("请输入引擎名称");
      return;
    }
    y(!0);
    try {
      Y ? (await yl(Y.id, B), u.success("引擎已更新")) : (await fl(B), u.success("引擎已添加")), L(!1), te();
    } catch (J) {
      u.error(J.message || "保存失败");
    } finally {
      y(!1);
    }
  }, [B, Y, te]), fe = a(
    async (q) => {
      try {
        await El(q), u.success("引擎已删除"), g(!1), te();
      } catch (J) {
        u.error(J.message || "删除失败");
      }
    },
    [te]
  ), ge = a(async () => {
    X(!0);
    try {
      const q = await hl();
      v(q.engines || []), u.success("自动检测完成");
    } catch (q) {
      u.error(q.message || "检测失败");
    } finally {
      X(!1);
    }
  }, []), ue = a(
    (q, J, k) => {
      const D = B[J] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          N,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          q
        ),
        k != null && k.select ? e.createElement(M, {
          value: D || void 0,
          onChange: (ie) => W((G) => ({ ...G, [J]: ie })),
          style: { width: "100%" },
          options: k.select.options,
          allowClear: !0,
          placeholder: `选择${q}`
        }) : k != null && k.textarea ? e.createElement($.TextArea, {
          value: D,
          onChange: (ie) => W((G) => ({ ...G, [J]: ie.target.value })),
          rows: 3,
          placeholder: `输入${q}`
        }) : e.createElement($, {
          value: D,
          onChange: (ie) => W((G) => ({ ...G, [J]: ie.target.value })),
          placeholder: `输入${q}`
        })
      );
    },
    [B]
  );
  return e.createElement(
    "div",
    null,
    // Action bar
    e.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap"
        }
      },
      e.createElement($, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: j ? e.createElement(j) : void 0,
        value: F,
        onChange: (q) => ne(q.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        r,
        {
          icon: Z ? e.createElement(Z) : void 0,
          onClick: ge,
          loading: f
        },
        "自动检测"
      ),
      e.createElement(
        r,
        {
          type: "primary",
          icon: U ? e.createElement(U) : void 0,
          onClick: z,
          style: Oe
        },
        "添加引擎"
      )
    ),
    // Content
    f ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(o, {
        size: "large",
        tip: "正在加载计算引擎..."
      })
    ) : c.length === 0 ? e.createElement(i, {
      description: F ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      s,
      { gutter: [12, 12], align: "stretch" },
      ...c.map(
        (q) => e.createElement(
          d,
          {
            key: q.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(vl, {
            engine: q,
            onClick: () => {
              b(q), g(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    h ? e.createElement(
      I,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            On.has(h.id) ? e.createElement("img", {
              src: An(h.id),
              alt: h.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              Pn[h.category] || "📦"
            )
          ),
          e.createElement("span", null, h.name)
        ),
        open: w,
        onClose: () => g(!1),
        width: 520,
        extra: e.createElement(
          R,
          null,
          e.createElement(
            r,
            {
              size: "small",
              icon: P ? e.createElement(P) : void 0,
              onClick: () => le(h)
            },
            "编辑"
          ),
          h.is_default ? null : e.createElement(
            V,
            {
              title: "确认删除此引擎？",
              description: h.name,
              onConfirm: () => fe(h.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              r,
              {
                size: "small",
                danger: !0,
                icon: x ? e.createElement(x) : void 0
              },
              "删除"
            )
          )
        )
      },
      e.createElement(
        A,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          A.Item,
          { label: "引擎名称" },
          h.name
        ),
        e.createElement(
          A.Item,
          { label: "厂商" },
          h.vendor || "—"
        ),
        e.createElement(
          A.Item,
          { label: "分类" },
          h.category ? _t[h.category] || h.category : "—"
        ),
        e.createElement(
          A.Item,
          { label: "状态" },
          e.createElement(
            _,
            {
              color: h.status === "detected" ? "success" : h.status === "not_found" ? "error" : "default"
            },
            h.status === "detected" ? "✅ 已检测" : h.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          A.Item,
          { label: "版本" },
          h.version || "—"
        ),
        h.executable_path ? e.createElement(
          A.Item,
          { label: "可执行文件" },
          e.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 8
              }
            },
            e.createElement(
              "code",
              {
                style: {
                  fontSize: 12,
                  wordBreak: "break-all"
                }
              },
              h.executable_path
            ),
            e.createElement(
              r,
              {
                size: "small",
                type: "text",
                icon: C ? e.createElement(C) : void 0,
                onClick: () => ee(h.executable_path)
              }
            )
          )
        ) : null,
        h.install_dir ? e.createElement(
          A.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            h.install_dir
          )
        ) : null,
        // Display detected modules with paths
        h.modules && h.modules.length > 0 ? e.createElement(
          A.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...h.modules.map(
              (q) => e.createElement(
                "div",
                {
                  key: q,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  _,
                  { color: "cyan", style: { fontSize: 11 } },
                  q
                ),
                h.module_paths && h.module_paths[q] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  h.module_paths[q]
                ) : null
              )
            )
          )
        ) : null,
        h.license_server ? e.createElement(
          A.Item,
          { label: "许可证服务器" },
          h.license_server
        ) : null,
        e.createElement(
          A.Item,
          { label: "描述" },
          h.description || "—"
        )
      ),
      // Invocation hint
      h.invocation_hint ? e.createElement(
        "div",
        {
          style: {
            marginTop: 16,
            padding: 12,
            background: "#e6f4ff",
            borderRadius: 8
          }
        },
        e.createElement(
          N,
          { strong: !0, style: { fontSize: 13 } },
          "💡 调用方式"
        ),
        e.createElement(
          "div",
          { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
          h.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        h.is_default ? e.createElement(
          _,
          { color: "blue" },
          "默认引擎"
        ) : h.is_custom ? e.createElement(
          _,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      p,
      {
        title: Y ? "编辑引擎" : "添加计算引擎",
        open: oe,
        onOk: de,
        onCancel: () => L(!1),
        okText: Y ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: se,
        width: 560
      },
      e.createElement(
        "div",
        { style: { maxHeight: 480, overflow: "auto", paddingRight: 8 } },
        ue("引擎名称 *", "name"),
        ue("厂商", "vendor"),
        ue("版本", "version"),
        ue("可执行文件路径", "executable_path"),
        ue("安装目录", "install_dir"),
        ue("分类", "category", {
          select: {
            options: Object.entries(_t).map(([q, J]) => ({
              label: J,
              value: q
            }))
          }
        }),
        ue("描述", "description", { textarea: !0 }),
        ue("调用方式提示", "invocation_hint", { textarea: !0 }),
        ue("许可证服务器", "license_server")
      )
    )
  );
}
function Sl() {
  const e = T().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: o,
    Empty: i,
    Input: r,
    Button: u,
    message: s,
    Row: d,
    Col: I,
    Tabs: A,
    Modal: _
  } = T().antd, {
    ReloadOutlined: S,
    PlusOutlined: p,
    SearchOutlined: $,
    ApiOutlined: M,
    RocketOutlined: V
  } = T().antdIcons || {}, { TextArea: R } = r, j = T().useSelectedAgent, U = j ? j() : null, P = (U == null ? void 0 : U.id) || "default", [x, C] = t([]), [K, N] = t(!0), [O, E] = t(""), [v, f] = t("mcp"), [X, F] = t(!1), [ne, w] = t(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [g, h] = t(!1), b = a(async () => {
    N(!0);
    try {
      const c = await ra(P);
      C(c);
    } catch (c) {
      s.error(c.message || "加载 MCP 列表失败"), C([]);
    } finally {
      N(!1);
    }
  }, [P]);
  l(() => {
    b();
  }, [b]);
  const oe = a(
    async (c) => {
      try {
        await sa(P, c.key), s.success(c.enabled ? "已禁用" : "已启用"), b();
      } catch (ee) {
        s.error(ee.message || "切换状态失败");
      }
    },
    [P, b]
  ), L = a(async (c) => {
    try {
      await ia(P, c.key), s.success(`MCP「${c.key}」已删除`), b();
    } catch (ee) {
      s.error(ee.message || "删除失败");
    }
  }, [P, b]), Y = a(async () => {
    h(!0);
    try {
      const c = JSON.parse(ne), ee = c.mcpServers || c, z = Object.entries(ee);
      if (z.length === 0) {
        s.warning("未找到 MCP 客户端配置");
        return;
      }
      let le = !0;
      for (const [de, fe] of z) {
        const ge = fe, ue = ge.url ? "streamable_http" : "stdio", q = {
          name: ge.name || de,
          description: ge.description || "",
          enabled: !0,
          transport: ue,
          url: ge.url || "",
          command: ge.command || "",
          args: ge.args || [],
          env: ge.env || {},
          cwd: ge.cwd || "",
          headers: ge.headers || {}
        };
        try {
          await ca(
            P,
            de,
            q
          );
        } catch {
          le = !1;
        }
      }
      le && (s.success("MCP 客户端已创建"), F(!1), b());
    } catch (c) {
      c instanceof SyntaxError ? s.error("JSON 格式错误：" + c.message) : s.error(c.message || "创建 MCP 失败");
    } finally {
      h(!1);
    }
  }, [ne, P, b]), re = n(() => {
    if (!O.trim()) return x;
    const c = O.toLowerCase();
    return x.filter(
      (ee) => {
        var z;
        return ee.name.toLowerCase().includes(c) || ee.key.toLowerCase().includes(c) || ((z = ee.description) == null ? void 0 : z.toLowerCase().includes(c)) || ee.transport.toLowerCase().includes(c);
      }
    );
  }, [x, O]), B = x.filter((c) => c.enabled).length, W = x.reduce((c, ee) => {
    var z;
    return c + (((z = ee.tools) == null ? void 0 : z.length) || 0);
  }, 0), se = (c) => {
    window.history.pushState({}, "", c), window.dispatchEvent(new PopStateEvent("popstate"));
  }, y = e.createElement(
    e.Fragment,
    null,
    e.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "center"
        }
      },
      e.createElement(r, {
        placeholder: "搜索能力名称、描述...",
        prefix: $ ? e.createElement($) : void 0,
        value: O,
        onChange: (c) => E(c.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      e.createElement(
        u,
        {
          type: "primary",
          icon: p ? e.createElement(p) : void 0,
          onClick: () => F(!0),
          style: Oe
        },
        "添加 MCP"
      ),
      e.createElement(
        u,
        {
          icon: M ? e.createElement(M) : void 0,
          onClick: () => se("/mcp")
        },
        "前往 MCP 管理"
      )
    ),
    K ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(o, { size: "large" })
    ) : re.length === 0 ? e.createElement(i, {
      description: O ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「添加 MCP」创建"
    }) : e.createElement(
      d,
      { gutter: [12, 12], align: "stretch" },
      ...re.map(
        (c) => e.createElement(
          I,
          {
            key: c.key,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(pl, {
            mcp: c,
            agentId: P,
            onToggle: (ee) => {
              ee.stopPropagation(), oe(c);
            },
            onDelete: () => {
              L(c);
            },
            onUpdate: async (ee, z) => {
              try {
                return await ma(P, ee, z), s.success("MCP 配置已更新"), b(), !0;
              } catch (le) {
                return s.error(le.message || "更新 MCP 失败"), !1;
              }
            },
            onUpdatePolicy: async (ee, z) => {
              try {
                return await pa(P, ee, z), s.success("访问策略已保存"), b(), !0;
              } catch (le) {
                return s.error(le.message || "保存访问策略失败"), !1;
              }
            },
            onRefresh: async () => {
              b();
            }
          })
        )
      )
    )
  ), te = [
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        M ? e.createElement(M, { style: { fontSize: 14 } }) : null,
        "MCP 客户端"
      ),
      children: y
    },
    {
      key: "software",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        V ? e.createElement(V, { style: { fontSize: 14 } }) : null,
        "计算引擎"
      ),
      children: e.createElement(bl)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(ht, {
      title: "工具",
      subtitle: `MCP: ${x.length} 个客户端（${B} 个启用）· ${W} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          u,
          {
            icon: S ? e.createElement(S) : void 0,
            onClick: () => {
              Xe(), b();
            },
            loading: K
          },
          "刷新"
        )
      )
    }),
    e.createElement(A, {
      items: te,
      activeKey: v,
      onChange: (c) => f(c)
    }),
    // ── Create MCP Modal (mirror console /mcp JSON import) ──
    e.createElement(
      _,
      {
        title: "添加 MCP 客户端 (JSON)",
        open: X,
        onCancel: () => F(!1),
        onOk: Y,
        confirmLoading: g,
        okText: "创建",
        cancelText: "取消",
        width: 700
      },
      e.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "支持格式: ",
        e.createElement("code", null, '{ "mcpServers": { "key": {...} } }'),
        " 或 ",
        e.createElement("code", null, '{ "key": {...} }')
      ),
      e.createElement(R, {
        value: ne,
        onChange: (c) => w(c.target.value),
        autoSize: { minRows: 12, maxRows: 20 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      })
    )
  );
}
function wl({
  agentId: e,
  agentName: t,
  onNavigate: l
}) {
  const a = T().React, { useState: n, useEffect: o, useCallback: i } = a, {
    Spin: r,
    Empty: u,
    Button: s,
    Row: d,
    Col: I,
    Card: A,
    Tag: _,
    Checkbox: S,
    Modal: p,
    Typography: $,
    Drawer: M,
    Descriptions: V,
    message: R
  } = T().antd, {
    ReloadOutlined: Z,
    ThunderboltOutlined: j,
    SettingOutlined: U,
    CheckSquareOutlined: P,
    EyeOutlined: x,
    EyeInvisibleOutlined: C,
    DeleteOutlined: K,
    CloseOutlined: N
  } = T().antdIcons || {}, { Text: O, Paragraph: E } = $, [v, f] = n([]), [X, F] = n(!0), [ne, w] = n(!1), [g, h] = n(null), [b, oe] = n(!1), [L, Y] = n(
    /* @__PURE__ */ new Set()
  ), [re, B] = n(!1), [W, se] = n(null), [y, te] = n(!1), c = i(async () => {
    if (e) {
      F(!0);
      try {
        const k = await Et(e);
        f(k);
      } catch (k) {
        R.error(k.message || "加载技能失败"), f([]);
      } finally {
        F(!1);
      }
    }
  }, [e]);
  o(() => {
    c();
  }, [c]);
  const ee = (k) => {
    Y((D) => {
      const ie = new Set(D);
      return ie.has(k) ? ie.delete(k) : ie.add(k), ie;
    });
  }, z = () => Y(/* @__PURE__ */ new Set()), le = () => Y(new Set(v.map((k) => k.name))), de = () => {
    b ? (z(), oe(!1)) : oe(!0);
  }, fe = async () => {
    const k = Array.from(L);
    if (k.length !== 0) {
      B(!0);
      try {
        const { results: D } = await Ta(e, k), ie = Object.entries(D).filter(
          ([, pe]) => pe.success === !1
        ), G = k.length - ie.length;
        ie.length > 0 ? R.warning(
          `批量启用完成：成功 ${G} 个，失败 ${ie.length} 个`
        ) : R.success(`成功启用 ${k.length} 个技能`), z(), await c();
      } catch (D) {
        R.error(D.message || "批量启用失败");
      } finally {
        B(!1);
      }
    }
  }, ge = async () => {
    const k = Array.from(L);
    if (k.length !== 0) {
      B(!0);
      try {
        const { results: D } = await za(e, k), ie = Object.entries(D).filter(
          ([, pe]) => pe.success === !1
        ), G = k.length - ie.length;
        ie.length > 0 ? R.warning(
          `批量停用完成：成功 ${G} 个，失败 ${ie.length} 个`
        ) : R.success(`成功停用 ${k.length} 个技能`), z(), await c();
      } catch (D) {
        R.error(D.message || "批量停用失败");
      } finally {
        B(!1);
      }
    }
  }, ue = () => {
    const k = Array.from(L);
    k.length !== 0 && p.confirm({
      title: `确认删除 ${k.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        B(!0);
        try {
          const { results: D } = await Ia(e, k), ie = Object.entries(D).filter(
            ([, pe]) => pe.success === !1
          ), G = k.length - ie.length;
          ie.length > 0 ? R.warning(
            `批量删除完成：成功 ${G} 个，失败 ${ie.length} 个`
          ) : R.success(`成功删除 ${k.length} 个技能`), z(), await c();
        } catch (D) {
          R.error(D.message || "批量删除失败");
        } finally {
          B(!1);
        }
      }
    });
  }, q = async (k) => {
    te(!0);
    try {
      k.enabled === !1 ? (await gn(e, k.name), R.success(`已启用技能「${k.name}」`)) : (await En(e, k.name), R.success(`已禁用技能「${k.name}」`)), await c();
    } catch (D) {
      R.error(D.message || "操作失败");
    } finally {
      te(!1);
    }
  }, J = (k) => {
    p.confirm({
      title: `确认删除技能「${k.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        te(!0);
        try {
          await $t(e, k.name), R.success(`已删除技能「${k.name}」`), await c();
        } catch (D) {
          R.error(D.message || "删除失败");
        } finally {
          te(!1);
        }
      }
    });
  };
  return a.createElement(
    "div",
    null,
    a.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8
        }
      },
      a.createElement(
        O,
        { type: "secondary", style: { fontSize: 13 } },
        b ? `已选择 ${L.size} / ${v.length} 个技能` : `共 ${v.length} 个技能`
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        b ? a.createElement(
          a.Fragment,
          null,
          a.createElement(
            s,
            { size: "small", onClick: le },
            "全选"
          ),
          a.createElement(
            s,
            {
              size: "small",
              icon: N ? a.createElement(N) : void 0,
              onClick: z
            },
            "取消选择"
          ),
          a.createElement(
            s,
            {
              size: "small",
              type: "default",
              icon: x ? a.createElement(x) : void 0,
              disabled: L.size === 0 || re,
              loading: re,
              onClick: fe
            },
            "批量启用"
          ),
          a.createElement(
            s,
            {
              size: "small",
              danger: !0,
              icon: C ? a.createElement(C) : void 0,
              disabled: L.size === 0 || re,
              loading: re,
              onClick: ge
            },
            "批量停用"
          ),
          a.createElement(
            s,
            {
              size: "small",
              danger: !0,
              icon: K ? a.createElement(K) : void 0,
              disabled: L.size === 0 || re,
              loading: re,
              onClick: ue
            },
            `删除 (${L.size})`
          ),
          a.createElement(
            s,
            {
              size: "small",
              type: "primary",
              onClick: de
            },
            "退出批量"
          )
        ) : a.createElement(
          a.Fragment,
          null,
          a.createElement(
            s,
            {
              size: "small",
              icon: P ? a.createElement(P) : void 0,
              onClick: de,
              disabled: v.length === 0
            },
            "批量管理"
          ),
          a.createElement(
            s,
            {
              icon: Z ? a.createElement(Z) : void 0,
              onClick: () => {
                Xe(), c();
              }
            },
            "刷新"
          )
        )
      )
    ),
    X ? a.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      a.createElement(r, { size: "large" })
    ) : v.length === 0 ? a.createElement(u, {
      description: "当前智能体未加载任何技能"
    }) : a.createElement(
      d,
      { gutter: [12, 12] },
      ...v.map(
        (k) => a.createElement(
          I,
          { key: k.name, xs: 24, sm: 12, md: 8, lg: 6 },
          a.createElement(
            A,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: b ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: b && L.has(k.name) ? "#0072f5" : void 0,
                borderWidth: b && L.has(k.name) ? 2 : 1
              },
              onClick: () => {
                b ? ee(k.name) : (h(k), w(!0));
              },
              onMouseEnter: () => {
                b || se(k.name);
              },
              onMouseLeave: () => se(null)
            },
            b ? a.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (D) => {
                  D.stopPropagation(), ee(k.name);
                }
              },
              a.createElement(S, {
                checked: L.has(k.name)
              })
            ) : null,
            a.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8
                }
              },
              k.emoji ? a.createElement(
                "span",
                { style: { fontSize: 18 } },
                k.emoji
              ) : a.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              a.createElement(
                O,
                {
                  strong: !0,
                  style: {
                    fontSize: 13,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                k.name
              ),
              k.enabled === !1 ? a.createElement(
                _,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : a.createElement(
                _,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            k.description ? a.createElement(
              E,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              k.description
            ) : null,
            a.createElement(
              "div",
              {
                style: {
                  marginTop: 8,
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap"
                }
              },
              k.version_text ? a.createElement(
                _,
                { style: { fontSize: 10 } },
                `v${k.version_text}`
              ) : null,
              ...(k.tags || []).slice(0, 3).map(
                (D, ie) => a.createElement(
                  _,
                  { key: ie, color: "blue", style: { fontSize: 10 } },
                  D
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !b && W === k.name ? a.createElement(
              "div",
              {
                style: {
                  marginTop: 8,
                  paddingTop: 8,
                  borderTop: "1px solid #f0f0f0",
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end"
                }
              },
              a.createElement(
                s,
                {
                  size: "small",
                  type: "default",
                  icon: k.enabled === !1 ? x ? a.createElement(x) : void 0 : C ? a.createElement(C) : void 0,
                  disabled: y,
                  onClick: (D) => {
                    D.stopPropagation(), q(k);
                  }
                },
                k.enabled === !1 ? "启用" : "禁用"
              ),
              a.createElement(
                s,
                {
                  size: "small",
                  danger: !0,
                  icon: K ? a.createElement(K) : void 0,
                  disabled: y,
                  onClick: (D) => {
                    D.stopPropagation(), J(k);
                  }
                },
                "删除"
              )
            ) : null
          )
        )
      )
    ),
    // Skill detail drawer
    g ? a.createElement(
      M,
      {
        title: a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          a.createElement(
            "span",
            { style: { fontSize: 18 } },
            g.emoji || "⚡"
          ),
          a.createElement("span", null, g.name)
        ),
        open: ne,
        onClose: () => w(!1),
        width: 520,
        extra: a.createElement(
          s,
          {
            type: "primary",
            size: "small",
            icon: U ? a.createElement(U) : void 0,
            onClick: () => l("/skills")
          },
          "管理技能"
        )
      },
      a.createElement(
        V,
        { column: 1, bordered: !0, size: "small" },
        a.createElement(
          V.Item,
          { label: "技能名称" },
          g.name
        ),
        a.createElement(
          V.Item,
          { label: "描述" },
          g.description || "-"
        ),
        g.version_text ? a.createElement(
          V.Item,
          { label: "版本" },
          g.version_text
        ) : null,
        a.createElement(
          V.Item,
          { label: "来源" },
          g.source || "-"
        ),
        a.createElement(
          V.Item,
          { label: "状态" },
          g.enabled === !1 ? "已禁用" : "已启用"
        ),
        g.installed_from ? a.createElement(
          V.Item,
          { label: "安装来源" },
          g.installed_from
        ) : null
      ),
      // Tags
      g.tags && g.tags.length > 0 ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          O,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        a.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...g.tags.map(
            (k, D) => a.createElement(_, { key: D, color: "blue" }, k)
          )
        )
      ) : null,
      // Skill content preview
      g.content ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          O,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "技能内容"
        ),
        a.createElement(
          "div",
          {
            style: {
              maxHeight: 300,
              overflow: "auto",
              padding: 12,
              background: "#f5f5f5",
              borderRadius: 6,
              fontSize: 12,
              whiteSpace: "pre-wrap"
            }
          },
          g.content.slice(0, 2e3) + (g.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function xl({
  poolSkills: e,
  workspaceSkills: t,
  agents: l,
  loading: a,
  onReload: n,
  agentId: o,
  agentName: i
}) {
  const r = T().React, { useState: u, useMemo: s, useCallback: d } = r, {
    Spin: I,
    Empty: A,
    Input: _,
    Button: S,
    Row: p,
    Col: $,
    Card: M,
    Tag: V,
    Typography: R,
    Drawer: Z,
    Descriptions: j,
    List: U,
    Modal: P,
    message: x
  } = T().antd, {
    ReloadOutlined: C,
    SearchOutlined: K,
    DownloadOutlined: N,
    ThunderboltOutlined: O,
    DeleteOutlined: E,
    PlusOutlined: v
  } = T().antdIcons || {}, { Text: f, Paragraph: X } = R, [F, ne] = u(""), [w, g] = u(!1), [h, b] = u(null), [oe, L] = u([]), [Y, re] = u(!1), [B, W] = u(24), [se, y] = u(null), [te, c] = u(!1), ee = s(() => {
    if (!F.trim()) return e;
    const J = F.toLowerCase();
    return e.filter(
      (k) => {
        var D, ie;
        return k.name.toLowerCase().includes(J) || ((D = k.description) == null ? void 0 : D.toLowerCase().includes(J)) || ((ie = k.tags) == null ? void 0 : ie.some((G) => G.toLowerCase().includes(J)));
      }
    );
  }, [e, F]), z = s(
    () => ee.slice(0, B),
    [ee, B]
  ), le = d((J) => {
    ne(J), W(24);
  }, []), de = d(
    (J) => {
      const k = [];
      for (const D of t)
        if (D.skills.some((ie) => ie.name === J)) {
          const ie = l.find((G) => G.id === D.agent_id);
          k.push((ie == null ? void 0 : ie.name) || D.agent_name || D.agent_id);
        }
      return k;
    },
    [t, l]
  ), fe = d(
    async (J) => {
      if (b(J), L(de(J.name)), g(!0), !J.content) {
        re(!0);
        try {
          const k = await la(J.name);
          b({ ...J, content: k });
        } catch {
        } finally {
          re(!1);
        }
      }
    },
    [de]
  ), ge = async (J) => {
    c(!0);
    try {
      await Mt(o, J.name), x.success(
        `已将技能「${J.name}」加载到当前专家「${i}」`
      ), n();
    } catch (k) {
      x.error(k.message || "加载技能失败");
    } finally {
      c(!1);
    }
  }, ue = (J) => {
    if (J.protected) {
      x.warning("内置技能不可删除");
      return;
    }
    P.confirm({
      title: `确认从技能池删除「${J.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        c(!0);
        try {
          await Oa(J.name), x.success(`已从技能池删除「${J.name}」`), n();
        } catch (k) {
          x.error(k.message || "删除失败");
        } finally {
          c(!1);
        }
      }
    });
  }, q = (J) => {
    window.history.pushState({}, "", J), window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return r.createElement(
    "div",
    null,
    r.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16
        }
      },
      r.createElement(_, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: K ? r.createElement(K) : void 0,
        value: F,
        onChange: (J) => le(J.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          S,
          {
            icon: C ? r.createElement(C) : void 0,
            onClick: n,
            loading: a,
            size: "small"
          },
          "刷新"
        ),
        r.createElement(
          S,
          {
            type: "primary",
            icon: N ? r.createElement(N) : void 0,
            onClick: () => q("/skill-pool"),
            size: "small",
            style: Oe
          },
          "管理技能池"
        )
      )
    ),
    a ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      r.createElement(I, { size: "large" })
    ) : ee.length === 0 ? r.createElement(A, {
      description: F ? "未找到匹配的技能" : "技能池为空"
    }) : r.createElement(
      r.Fragment,
      null,
      r.createElement(
        p,
        { gutter: [12, 12] },
        ...z.map(
          (J) => r.createElement(
            $,
            { key: J.name, xs: 24, sm: 12, md: 8, lg: 6 },
            r.createElement(
              M,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => fe(J),
                onMouseEnter: () => y(J.name),
                onMouseLeave: () => y(null)
              },
              r.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8
                  }
                },
                J.emoji ? r.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  J.emoji
                ) : r.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "⚡"
                ),
                r.createElement(
                  f,
                  {
                    strong: !0,
                    style: {
                      fontSize: 13,
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }
                  },
                  J.name
                ),
                J.protected ? r.createElement(
                  V,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              J.description ? r.createElement(
                X,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                J.description
              ) : null,
              r.createElement(
                "div",
                {
                  style: {
                    marginTop: 8,
                    display: "flex",
                    gap: 4,
                    flexWrap: "wrap"
                  }
                },
                J.version_text ? r.createElement(
                  V,
                  { style: { fontSize: 10 } },
                  `v${J.version_text}`
                ) : null,
                ...(J.tags || []).slice(0, 3).map(
                  (k, D) => r.createElement(
                    V,
                    { key: D, color: "cyan", style: { fontSize: 10 } },
                    k
                  )
                )
              ),
              // Hover action footer
              se === J.name ? r.createElement(
                "div",
                {
                  style: {
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: "1px solid #f0f0f0",
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end"
                  }
                },
                r.createElement(
                  S,
                  {
                    size: "small",
                    type: "primary",
                    icon: v ? r.createElement(v) : void 0,
                    disabled: te,
                    onClick: (k) => {
                      k.stopPropagation(), ge(J);
                    }
                  },
                  "加载到当前Agent"
                ),
                r.createElement(
                  S,
                  {
                    size: "small",
                    danger: !0,
                    icon: E ? r.createElement(E) : void 0,
                    disabled: te || J.protected,
                    onClick: (k) => {
                      k.stopPropagation(), ue(J);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Load more button
        z.length < ee.length ? r.createElement(
          "div",
          { style: { textAlign: "center", marginTop: 16 } },
          r.createElement(
            S,
            {
              onClick: () => W((J) => J + 24),
              size: "small"
            },
            `加载更多 (剩余 ${ee.length - z.length} 个)`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    h ? r.createElement(
      Z,
      {
        title: r.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          r.createElement(
            "span",
            { style: { fontSize: 18 } },
            h.emoji || "⚡"
          ),
          r.createElement("span", null, h.name)
        ),
        open: w,
        onClose: () => g(!1),
        width: 520,
        extra: r.createElement(
          S,
          {
            type: "primary",
            size: "small",
            icon: O ? r.createElement(O) : void 0,
            onClick: () => q("/skills")
          },
          "管理技能"
        )
      },
      r.createElement(
        j,
        { column: 1, bordered: !0, size: "small" },
        r.createElement(
          j.Item,
          { label: "技能名称" },
          h.name
        ),
        r.createElement(
          j.Item,
          { label: "描述" },
          h.description || "-"
        ),
        h.version_text ? r.createElement(
          j.Item,
          { label: "版本" },
          h.version_text
        ) : null,
        r.createElement(
          j.Item,
          { label: "来源" },
          h.source || "-"
        ),
        r.createElement(
          j.Item,
          { label: "受保护" },
          h.protected ? "是（内置）" : "否"
        ),
        h.sync_status ? r.createElement(
          j.Item,
          { label: "同步状态" },
          h.sync_status
        ) : null,
        h.installed_from ? r.createElement(
          j.Item,
          { label: "安装来源" },
          h.installed_from
        ) : null
      ),
      // Tags
      h.tags && h.tags.length > 0 ? r.createElement(
        "div",
        { style: { marginTop: 16 } },
        r.createElement(
          f,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        r.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...h.tags.map(
            (J, k) => r.createElement(V, { key: k, color: "cyan" }, J)
          )
        )
      ) : null,
      // Installed agents
      r.createElement(
        "div",
        { style: { marginTop: 16 } },
        r.createElement(
          f,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${oe.length})`
        ),
        oe.length > 0 ? r.createElement(U, {
          size: "small",
          dataSource: oe,
          renderItem: (J) => r.createElement(
            U.Item,
            null,
            r.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              r.createElement(Re, { name: J, size: 20 }),
              r.createElement(
                f,
                { style: { fontSize: 13 } },
                J
              )
            )
          )
        }) : r.createElement(
          f,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      Y ? r.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        r.createElement(I, { size: "small" })
      ) : h.content ? r.createElement(
        "div",
        { style: { marginTop: 16 } },
        r.createElement(
          f,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "技能内容"
        ),
        r.createElement(
          "div",
          {
            style: {
              maxHeight: 300,
              overflow: "auto",
              padding: 12,
              background: "#f5f5f5",
              borderRadius: 6,
              fontSize: 12,
              whiteSpace: "pre-wrap"
            }
          },
          h.content.slice(0, 2e3) + (h.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Cl() {
  const e = T().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, { Tabs: o, message: i } = T().antd, { ThunderboltOutlined: r, AppstoreOutlined: u } = T().antdIcons || {}, d = T().useSelectedAgent, I = d ? d() : null, A = (I == null ? void 0 : I.id) || "default", [_, S] = t([]), [p, $] = t([]), [M, V] = t([]), [R, Z] = t(!0), [j, U] = t("agent-skills"), P = a(async () => {
    Z(!0);
    try {
      const [N, O, E] = await Promise.all([
        Ot(!0),
        Pt(),
        oa()
      ]);
      $(N), S(O), V(E);
    } catch (N) {
      i.error(N.message || "加载技能列表失败"), $([]);
    } finally {
      Z(!1);
    }
  }, []);
  l(() => {
    P();
  }, [P]);
  const x = n(() => {
    const N = _.find((O) => O.id === A);
    return (N == null ? void 0 : N.name) || A;
  }, [_, A]), C = (N) => {
    window.history.pushState({}, "", N), window.dispatchEvent(new PopStateEvent("popstate"));
  }, K = [
    {
      key: "agent-skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        r ? e.createElement(r, { style: { fontSize: 14 } }) : null,
        "当前Agent加载技能"
      ),
      children: e.createElement(wl, {
        agentId: A,
        agentName: x,
        onNavigate: C
      })
    },
    {
      key: "skill-pool",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        u ? e.createElement(u, { style: { fontSize: 14 } }) : null,
        "技能池"
      ),
      children: e.createElement(xl, {
        poolSkills: p,
        workspaceSkills: M,
        agents: _,
        loading: R,
        onReload: P,
        agentId: A,
        agentName: x
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(ht, {
      title: "技能",
      subtitle: `技能池共 ${p.length} 个技能 · 当前智能体：${x}`
    }),
    e.createElement(o, {
      items: K,
      activeKey: j,
      onChange: (N) => U(N)
    })
  );
}
const Tt = "ugsci.market.githubSources", tn = "https://github.com/anthropics/skills/tree/main/skills", nn = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com/skills", Mn = "ugsci.market.mcpSources", $n = "ugsci.market.expertSources";
function Rn(e, t) {
  try {
    const l = localStorage.getItem(e);
    if (!l) return [];
    const a = JSON.parse(l);
    return Array.isArray(a) ? a.filter(
      (n) => n && typeof n.id == "string" && typeof n.label == "string" && typeof n.url == "string"
    ).map((n) => ({
      id: n.id,
      label: n.label,
      url: n.url,
      enabled: n.enabled !== !1,
      type: t
    })) : [];
  } catch {
    return [];
  }
}
function Ln(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function kl() {
  return Rn(Mn, "mcp");
}
function ct(e) {
  Ln(Mn, e);
}
function _l() {
  return Rn($n, "expert");
}
function mt(e) {
  Ln($n, e);
}
function jn(e) {
  try {
    const t = new URL(e.trim()), l = t.hostname.toLowerCase();
    let a;
    if (l === "github.com" || l === "www.github.com")
      a = "github";
    else if (l === "gitee.com" || l === "www.gitee.com")
      a = "gitee";
    else
      return null;
    const n = t.pathname.split("/").filter((s) => s.length > 0);
    if (n.length < 2) return null;
    const o = decodeURIComponent(n[0]), i = decodeURIComponent(n[1]);
    let r = "main", u = "";
    return n.length >= 4 && (n[2] === "tree" || n[2] === "blob") ? (r = decodeURIComponent(n[3]), n.length > 4 && (u = n.slice(4).map(decodeURIComponent).join("/"))) : n.length > 2 && (u = n.slice(2).map(decodeURIComponent).join("/")), u = u.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: o,
      repo: i,
      ref: r || "main",
      skillsPath: u,
      label: `${o}/${i}`,
      platform: a
    };
  } catch {
    return null;
  }
}
function zt(e, t, l, a = "github") {
  return a === "oss" ? `oss:${e}/${l || "/"}` : `${a}:${e}/${t}:${l || "/"}`;
}
function Bn(e) {
  try {
    const t = new URL(e.trim()), l = t.hostname.toLowerCase(), a = l.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!a) return null;
    const n = a[1], o = `${t.protocol}//${l}`, i = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
    return i ? {
      endpoint: o,
      prefix: i,
      label: `OSS: ${i.split("/").pop() || n}`,
      platform: "oss"
    } : null;
  } catch {
    return null;
  }
}
function Tl() {
  try {
    const e = localStorage.getItem(Tt);
    if (!e) {
      const l = [], a = Bn(nn);
      a && l.push({
        id: zt(
          a.endpoint,
          "",
          a.prefix,
          "oss"
        ),
        url: nn,
        label: a.label,
        owner: a.endpoint,
        repo: "",
        ref: "",
        skillsPath: a.prefix,
        enabled: !0,
        platform: "oss"
      });
      const n = jn(tn);
      return n && l.push({
        id: zt(
          n.owner,
          n.repo,
          n.skillsPath,
          n.platform
        ),
        url: tn,
        label: n.label,
        owner: n.owner,
        repo: n.repo,
        ref: n.ref,
        skillsPath: n.skillsPath,
        enabled: !0,
        platform: n.platform
      }), localStorage.setItem(Tt, JSON.stringify(l)), l;
    }
    const t = JSON.parse(e);
    return Array.isArray(t) ? t.filter(
      (l) => l && typeof l.id == "string" && (typeof l.owner == "string" || l.platform === "oss")
    ).map((l) => ({
      ...l,
      platform: l.platform || "github",
      owner: l.owner || "",
      repo: l.repo || "",
      ref: l.ref || "",
      skillsPath: l.skillsPath || ""
    })) : [];
  } catch {
    return [];
  }
}
function dt(e) {
  try {
    localStorage.setItem(
      Tt,
      JSON.stringify(e)
    );
  } catch {
  }
}
function Un(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const l = t[1], a = {}, n = l.split(`
`);
  let o = "";
  for (const i of n) {
    const r = i.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (r) {
      o = r[1];
      let u = r[2].trim();
      (u.startsWith('"') && u.endsWith('"') || u.startsWith("'") && u.endsWith("'")) && (u = u.slice(1, -1)), o === "name" ? a.name = u : o === "description" ? a.description = u : o === "version" ? a.version = u : o === "author" && (a.author = u);
    }
  }
  return a;
}
async function zl(e) {
  const t = e.platform === "gitee", l = e.skillsPath ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/") : "", a = t ? `https://gitee.com/api/v5/repos/${e.owner}/${e.repo}/contents/${l}?ref=${encodeURIComponent(e.ref)}` : `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${l}?ref=${encodeURIComponent(e.ref)}`, n = {
    Accept: t ? "application/json" : "application/vnd.github+json"
  };
  t && e.accessToken && (n.Authorization = `token ${e.accessToken}`);
  const o = await fetch(a, {
    headers: n
  });
  if (!o.ok)
    throw new Error(
      `${t ? "Gitee" : "GitHub"} API ${o.status}: ${e.label} (${e.skillsPath || "/"})`
    );
  const i = await o.json();
  if (!Array.isArray(i)) return [];
  const r = i.filter(
    (s) => s.type === "dir" && s.name
  );
  return await Promise.all(
    r.map(async (s) => {
      const d = e.skillsPath ? e.skillsPath + "/" : "", I = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${d}${s.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${d}${s.name}/SKILL.md`, A = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${d}${s.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${d}${s.name}`, _ = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: s.name,
        description: "",
        source_url: A,
        html_url: A,
        version: null,
        author: null
      };
      try {
        const S = {};
        t && e.accessToken && (S.Authorization = `token ${e.accessToken}`);
        const p = await fetch(I, {
          headers: S
        });
        if (!p.ok) return _;
        const $ = await p.text(), M = Un($);
        return {
          ..._,
          name: M.name || s.name,
          description: M.description || "",
          version: M.version || null,
          author: M.author || null
        };
      } catch {
        return _;
      }
    })
  );
}
async function Il(e) {
  const t = Bn(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: l, prefix: a } = t, n = a.split("/").map(encodeURIComponent).join("/");
  let o = [];
  try {
    const r = `${l}/?prefix=${encodeURIComponent(a + "/")}&delimiter=/&max-keys=1000`, u = await fetch(r, {
      headers: { Accept: "application/xml, */*" }
    });
    if (u.ok) {
      const s = await u.text(), A = new DOMParser().parseFromString(s, "application/xml").getElementsByTagName("CommonPrefixes");
      for (let _ = 0; _ < A.length; _++) {
        const S = A[_].getElementsByTagName("Prefix")[0];
        if (S && S.textContent) {
          const $ = S.textContent.replace(/\/+$/, "").split("/"), M = $[$.length - 1];
          M && o.push(M);
        }
      }
    }
  } catch {
  }
  if (o.length === 0) {
    const r = `${l}/${n}/manifest.json`;
    try {
      const u = await fetch(r);
      if (u.ok) {
        const s = await u.json();
        Array.isArray(s) ? o = s.filter((d) => typeof d == "string" && d) : s && Array.isArray(s.skills) && (o = s.skills.map((d) => typeof d == "string" ? d : (d == null ? void 0 : d.path) || (d == null ? void 0 : d.name) || (d == null ? void 0 : d.folder) || "").filter((d) => d));
      }
    } catch {
    }
  }
  if (o.length === 0)
    throw new Error(
      `无法获取 OSS 技能列表。请检查 ${e.url} 是否可访问。`
    );
  return await Promise.all(
    o.map(async (r) => {
      const u = `${l}/${n}/${encodeURIComponent(r)}/SKILL.md`, s = `${l}/${n}/${encodeURIComponent(r)}`, d = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: r,
        description: "",
        source_url: s,
        html_url: s,
        version: null,
        author: null
      };
      try {
        const I = await fetch(u);
        if (!I.ok) return d;
        const A = await I.text(), _ = Un(A);
        return {
          ...d,
          name: _.name || r,
          description: _.description || "",
          version: _.version || null,
          author: _.author || null
        };
      } catch {
        return d;
      }
    })
  );
}
async function Pl(e) {
  const t = e.filter((o) => o.enabled), l = await Promise.all(
    t.map(async (o) => {
      try {
        return { skills: o.platform === "oss" ? await Il(o) : await zl(o), error: null, label: o.label };
      } catch (i) {
        return {
          skills: [],
          error: i.message || String(i),
          label: o.label
        };
      }
    })
  ), a = [], n = [];
  for (const o of l)
    a.push(...o.skills), o.error && n.push({ label: o.label, message: o.error });
  return { skills: a, errors: n };
}
function Ol({
  open: e,
  onClose: t,
  sources: l,
  onChange: a
}) {
  const n = T().React, { useState: o } = n, {
    Modal: i,
    Input: r,
    Button: u,
    List: s,
    Tag: d,
    Switch: I,
    Typography: A,
    Tooltip: _,
    message: S
  } = T().antd, {
    PlusOutlined: p,
    DeleteOutlined: $,
    LinkOutlined: M,
    GithubOutlined: V
  } = T().antdIcons || {}, { Text: R } = A, [Z, j] = o(""), [U, P] = o(""), x = () => {
    const O = Z.trim();
    if (!O) return;
    const E = jn(O);
    if (!E) {
      S.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const v = zt(E.owner, E.repo, E.skillsPath, E.platform);
    if (l.some((F) => F.id === v)) {
      S.warning("该源已存在");
      return;
    }
    const f = {
      id: v,
      url: O,
      label: E.label,
      owner: E.owner,
      repo: E.repo,
      ref: E.ref,
      skillsPath: E.skillsPath,
      enabled: !0,
      platform: E.platform,
      accessToken: U.trim() || void 0
    }, X = [...l, f];
    dt(X), a(X), j(""), P(""), S.success(`已添加源: ${E.label}`);
  }, C = (O, E) => {
    const v = l.map(
      (f) => f.id === O ? { ...f, enabled: E } : f
    );
    dt(v), a(v);
  }, K = (O, E) => {
    const v = l.map(
      (f) => f.id === O ? { ...f, accessToken: E.trim() || void 0 } : f
    );
    dt(v), a(v);
  }, N = (O) => {
    const E = l.filter((v) => v.id !== O);
    dt(E), a(E), S.success("已移除源");
  };
  return n.createElement(
    i,
    {
      open: e,
      onCancel: t,
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        V ? n.createElement(V, { style: { fontSize: 18 } }) : null,
        n.createElement("span", null, "配置技能源")
      ),
      footer: n.createElement(
        u,
        { onClick: t },
        "关闭"
      ),
      width: 640
    },
    n.createElement(
      "div",
      { style: { marginBottom: 16 } },
      n.createElement(
        R,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        n.createElement(r, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: Z,
          onChange: (O) => j(O.target.value),
          onPressEnter: x,
          prefix: M ? n.createElement(M) : void 0,
          style: { flex: 1 }
        }),
        n.createElement(
          u,
          {
            type: "primary",
            icon: p ? n.createElement(p) : void 0,
            onClick: x
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      Z.trim() && Z.trim().toLowerCase().includes("gitee.com") ? n.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        n.createElement(
          R,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        n.createElement(r.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: U,
          onChange: (O) => P(O.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    n.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      n.createElement(R, { strong: !0 }, `已配置源 (${l.length})`)
    ),
    n.createElement(s, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: (O) => n.createElement(
        s.Item,
        {
          actions: [
            n.createElement(
              _,
              { title: O.enabled ? "点击禁用" : "点击启用" },
              n.createElement(I, {
                size: "small",
                checked: O.enabled,
                onChange: (E) => C(O.id, E)
              })
            ),
            n.createElement(
              _,
              { title: "移除此源" },
              n.createElement(
                u,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: $ ? n.createElement($) : void 0,
                  onClick: () => N(O.id)
                }
              )
            )
          ]
        },
        n.createElement(
          "div",
          { style: { flex: 1, minWidth: 0 } },
          n.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
            n.createElement(
              d,
              { color: O.platform === "gitee" ? "orange" : O.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              O.platform === "gitee" ? "Gitee" : O.platform === "oss" ? "OSS" : "GitHub"
            ),
            n.createElement(
              d,
              { style: { fontSize: 11 } },
              O.label
            ),
            O.skillsPath ? n.createElement(
              R,
              { type: "secondary", style: { fontSize: 11 } },
              `/${O.skillsPath}`
            ) : null,
            O.platform !== "oss" ? n.createElement(
              R,
              { type: "secondary", style: { fontSize: 11 } },
              `@${O.ref}`
            ) : null
          ),
          n.createElement(
            R,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            O.url
          ),
          // Gitee token input for existing Gitee sources
          O.platform === "gitee" ? n.createElement(
            "div",
            { style: { marginTop: 6, display: "flex", gap: 6, alignItems: "center" } },
            n.createElement(
              R,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            n.createElement(r.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: O.accessToken || "",
              onChange: (E) => K(O.id, E.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function an({
  open: e,
  onClose: t,
  sources: l,
  onChange: a,
  type: n
}) {
  const o = T().React, { useState: i } = o, {
    Modal: r,
    Input: u,
    Button: s,
    List: d,
    Tag: I,
    Switch: A,
    Typography: _,
    Tooltip: S,
    message: p
  } = T().antd, {
    PlusOutlined: $,
    DeleteOutlined: M,
    LinkOutlined: V,
    ApiOutlined: R,
    UserOutlined: Z,
    ImportOutlined: j,
    ExportOutlined: U,
    CopyOutlined: P
  } = T().antdIcons || {}, { Text: x } = _, [C, K] = i(""), [N, O] = i(""), [E, v] = i(""), [f, X] = i(!1), F = n === "mcp" ? "MCP" : "专家模板", ne = n === "mcp" ? R ? o.createElement(R, { style: { fontSize: 18 } }) : null : Z ? o.createElement(Z, { style: { fontSize: 18 } }) : null, w = () => {
    const L = C.trim(), Y = N.trim();
    if (!L) return;
    const re = Y || L.slice(0, 40), B = `${n}:${L}`;
    if (l.some((y) => y.id === B)) {
      p.warning("该源已存在");
      return;
    }
    const W = {
      id: B,
      label: re,
      url: L,
      enabled: !0,
      type: n
    }, se = [...l, W];
    n === "mcp" ? ct(se) : mt(se), a(se), K(""), O(""), p.success(`已添加${F}源: ${re}`);
  }, g = (L, Y) => {
    const re = l.map(
      (B) => B.id === L ? { ...B, enabled: Y } : B
    );
    n === "mcp" ? ct(re) : mt(re), a(re);
  }, h = (L) => {
    const Y = l.filter((re) => re.id !== L);
    n === "mcp" ? ct(Y) : mt(Y), a(Y), p.success("已移除源");
  }, b = () => {
    const L = JSON.stringify(
      { type: n, sources: l },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(L), p.success(`${F}源已复制到剪贴板（${l.length} 个源）`);
    } catch {
      const Y = document.createElement("textarea");
      Y.value = L, document.body.appendChild(Y), Y.select(), document.execCommand("copy"), document.body.removeChild(Y), p.success(`${F}源已复制到剪贴板（${l.length} 个源）`);
    }
  }, oe = () => {
    const L = E.trim();
    if (!L) {
      p.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const Y = JSON.parse(L);
      let re = [];
      if (Array.isArray(Y))
        re = Y;
      else if (Y && Array.isArray(Y.sources))
        re = Y.sources;
      else if (Y && typeof Y == "object")
        re = [Y];
      else
        throw new Error("Invalid format");
      const B = re.filter(
        (te) => te && typeof te.url == "string" && typeof te.label == "string"
      );
      if (B.length === 0) {
        p.error("未找到有效的源数据");
        return;
      }
      const W = new Set(l.map((te) => te.id)), se = [];
      for (const te of B) {
        const c = te.id || `${n}:${te.url}`;
        W.has(c) || se.push({
          id: c,
          label: te.label,
          url: te.url,
          enabled: te.enabled !== !1,
          type: n
        });
      }
      if (se.length === 0) {
        p.info("所有源均已存在，无新增");
        return;
      }
      const y = [...l, ...se];
      n === "mcp" ? ct(y) : mt(y), a(y), v(""), X(!1), p.success(`成功导入 ${se.length} 个${F}源`);
    } catch (Y) {
      p.error(`JSON 解析失败: ${Y.message || "格式错误"}`);
    }
  };
  return o.createElement(
    r,
    {
      open: e,
      onCancel: t,
      title: o.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        ne,
        o.createElement("span", null, `配置${F}源`)
      ),
      footer: o.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between" } },
        o.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          o.createElement(
            s,
            {
              icon: U ? o.createElement(U) : void 0,
              onClick: b,
              disabled: l.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          o.createElement(
            s,
            {
              icon: j ? o.createElement(j) : void 0,
              onClick: () => X(!f),
              size: "small"
            },
            f ? "隐藏导入" : "导入JSON"
          )
        ),
        o.createElement(
          s,
          { onClick: t },
          "关闭"
        )
      ),
      width: 680
    },
    // Description
    o.createElement(
      x,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${F}源地址，支持从远程仓库或团队共享的 JSON 导入${F}配置。`
    ),
    // Import section (collapsible)
    f ? o.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          padding: 12,
          background: "#fafafa",
          borderRadius: 8,
          border: "1px solid #f0f0f0"
        }
      },
      o.createElement(
        x,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${F}源 JSON（支持从导出的剪贴板内容粘贴）`
      ),
      o.createElement(u.TextArea, {
        placeholder: n === "mcp" ? `{
  "type": "mcp",
  "sources": [
    { "label": "团队MCP", "url": "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" }
  ]
}` : `{
  "type": "expert",
  "sources": [
    { "label": "团队专家库", "url": "https://raw.githubusercontent.com/team/expert-registry/main/experts.json" }
  ]
}`,
        value: E,
        onChange: (L) => v(L.target.value),
        autoSize: { minRows: 4, maxRows: 10 },
        style: { fontFamily: "monospace", fontSize: 12 }
      }),
      o.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8 } },
        o.createElement(
          s,
          {
            type: "primary",
            size: "small",
            onClick: oe
          },
          "导入"
        ),
        o.createElement(
          s,
          {
            size: "small",
            onClick: () => v("")
          },
          "清空"
        )
      )
    ) : null,
    // Add new source
    o.createElement(
      "div",
      { style: { marginBottom: 16, display: "flex", gap: 8, alignItems: "center" } },
      o.createElement(u, {
        placeholder: "源名称（可选，如：团队MCP仓库）",
        value: N,
        onChange: (L) => O(L.target.value),
        style: { width: 200 }
      }),
      o.createElement(u, {
        placeholder: n === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: C,
        onChange: (L) => K(L.target.value),
        onPressEnter: w,
        prefix: V ? o.createElement(V) : void 0,
        style: { flex: 1 }
      }),
      o.createElement(
        s,
        {
          type: "primary",
          icon: $ ? o.createElement($) : void 0,
          onClick: w
        },
        "添加"
      )
    ),
    // Source list
    o.createElement(
      "div",
      {
        style: {
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }
      },
      o.createElement(
        x,
        { strong: !0 },
        `已配置源 (${l.length})`
      )
    ),
    o.createElement(d, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: (L) => o.createElement(
        d.Item,
        {
          actions: [
            o.createElement(
              S,
              { title: L.enabled ? "点击禁用" : "点击启用" },
              o.createElement(A, {
                size: "small",
                checked: L.enabled,
                onChange: (Y) => g(L.id, Y)
              })
            ),
            o.createElement(
              S,
              { title: "移除此源" },
              o.createElement(
                s,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: M ? o.createElement(M) : void 0,
                  onClick: () => h(L.id)
                }
              )
            )
          ]
        },
        o.createElement(
          "div",
          { style: { flex: 1, minWidth: 0 } },
          o.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4
              }
            },
            o.createElement(
              I,
              {
                color: n === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              L.label
            ),
            L.enabled ? null : o.createElement(
              I,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          o.createElement(
            x,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            L.url
          )
        )
      )
    }),
    // Share hint
    o.createElement(
      "div",
      {
        style: {
          marginTop: 12,
          padding: "8px 12px",
          background: "#e6f4ff",
          borderRadius: 6,
          fontSize: 12,
          color: "#1677ff"
        }
      },
      o.createElement(
        "span",
        null,
        "💡 ",
        "点击「导出到剪贴板」可复制所有源配置，分享给团队成员后粘贴到「导入JSON」即可快速配置。"
      )
    )
  );
}
async function Al() {
  return ae("/market/providers");
}
async function Ml(e) {
  return ae(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function $l(e, t, l, a, n) {
  return ae("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: t,
      limit: l,
      lang: a,
      category: n || void 0
    })
  });
}
function ln(e) {
  if (!e) return "";
  const t = e.message || String(e);
  try {
    const l = JSON.parse(t);
    if (l.detail) {
      if (typeof l.detail == "string") return l.detail;
      if (l.detail.message) return l.detail.message;
    }
  } catch {
  }
  return t;
}
async function on(e, t) {
  const l = { bundle_url: e };
  return t && (l.access_token = t), ae("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
function Rl() {
  const e = T().React, { useState: t, useEffect: l, useCallback: a, useMemo: n, useRef: o } = e, {
    Spin: i,
    Empty: r,
    Input: u,
    Button: s,
    message: d,
    Row: I,
    Col: A,
    Card: _,
    Tag: S,
    Tooltip: p,
    Typography: $,
    Select: M,
    Drawer: V,
    Descriptions: R,
    Tabs: Z,
    Badge: j,
    Progress: U,
    Modal: P
  } = T().antd, {
    ReloadOutlined: x,
    SearchOutlined: C,
    DownloadOutlined: K,
    AppstoreOutlined: N,
    ShopOutlined: O,
    CheckCircleOutlined: E,
    LoadingOutlined: v,
    UserOutlined: f,
    SettingOutlined: X,
    GithubOutlined: F,
    ApiOutlined: ne
  } = T().antdIcons || {}, { Text: w, Paragraph: g, Title: h } = $, [b, oe] = t("skills"), [L, Y] = t([]), [re, B] = t([]), [W, se] = t([]), [y, te] = t(""), [c, ee] = t(""), [z, le] = t(!1), [de, fe] = t(!1), [ge, ue] = t(
    {}
  ), [q, J] = t(null), [k, D] = t({}), [ie, G] = t([]), [pe, Ee] = t(""), [ve, Ce] = t(""), [ze, Ue] = t(""), [at, qe] = t({}), [Ae, Ve] = t(""), [lt, Fe] = t(/* @__PURE__ */ new Set()), [Ie, Ye] = t(null), [Te, we] = t({}), [Q, be] = t([]), [Se, ke] = t([]), [Qe, Ze] = t(!1), [he, ot] = t(!1), [Pe, et] = t(""), [Ne, Bt] = t([]), [Nn, Ut] = t(!1), [Dn, Nt] = t([]), [Fn, Dt] = t(!1), tt = o(null);
  l(() => {
    Promise.all([
      Al().catch(() => []),
      Ml("zh").catch(() => []),
      Pt().catch(() => [])
    ]).then(([m, H, ce]) => {
      Y(m), B(H), G(ce), ce.length > 0 && (Ee(ce[0].id), Ve(ce[0].id));
    });
  }, []);
  const rt = a(async (m) => {
    const H = m ?? Tl();
    if (be(m || H), H.filter((me) => me.enabled).length === 0) {
      ke([]);
      return;
    }
    Ze(!0);
    try {
      const { skills: me, errors: ye } = await Pl(H);
      if (ke(me), ye.length > 0) {
        for (const _e of ye)
          console.warn(`[ugsci] GitHub source '${_e.label}' error: ${_e.message}`);
        d.warning(
          `部分源加载失败: ${ye.map((_e) => _e.label).join(", ")}`
        );
      }
    } catch (me) {
      d.error(me.message || "加载技能源失败"), ke([]);
    } finally {
      Ze(!1);
    }
  }, []);
  l(() => {
    rt(), Bt(kl()), Nt(_l());
  }, [rt]);
  const st = a(
    async (m, H, ce) => {
      le(!0);
      try {
        const me = await $l(
          m,
          ce,
          20,
          "zh",
          H || void 0
        );
        ce === void 0 || Object.keys(ce).length === 0 ? se(me.results) : se((xe) => [...xe, ...me.results]);
        const ye = Object.values(me.by_provider || {}).some(
          (xe) => xe.has_more
        );
        fe(ye);
        const _e = {};
        for (const [xe, Ul] of Object.entries(me.by_provider || {}))
          _e[xe] = (ce[xe] || 1) + 1;
        if (ue(_e), me.errors.length > 0)
          for (const xe of me.errors)
            console.warn(
              `[ugsci] Market provider '${xe.provider}' error: ${xe.message}`
            );
      } catch (me) {
        d.error(me.message || "搜索市场失败"), se([]);
      } finally {
        le(!1);
      }
    },
    []
  );
  l(() => (tt.current && clearTimeout(tt.current), tt.current = setTimeout(() => {
    st(y, c, {});
  }, 400), () => {
    tt.current && clearTimeout(tt.current);
  }), [y, c, st]);
  const Gn = () => {
    st(y, c, ge);
  }, Ft = async (m) => {
    const H = `${m.source}:${m.slug}`;
    try {
      D((me) => ({ ...me, [H]: "installing" }));
      const ce = await on(m.source_url);
      ce.installed && d.success(
        `技能「${ce.name || m.name}」已安装到技能池，可在技能中心查看`
      ), D((me) => {
        const ye = { ...me };
        return delete ye[H], ye;
      });
    } catch (ce) {
      d.error(ln(ce) || "安装技能失败"), D((me) => {
        const ye = { ...me };
        return delete ye[H], ye;
      });
    }
  }, Hn = (m) => {
    window.history.pushState({}, "", m), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Jn = async (m) => {
    const H = `github:${m.sourceId}:${m.name}`, ce = Q.find((ye) => ye.id === m.sourceId), me = (ce == null ? void 0 : ce.accessToken) || void 0;
    try {
      D((_e) => ({ ..._e, [H]: "installing" }));
      const ye = await on(m.source_url, me);
      ye.installed && d.success(
        `技能「${ye.name || m.name}」已安装到技能池，可在技能中心查看`
      ), D((_e) => {
        const xe = { ..._e };
        return delete xe[H], xe;
      });
    } catch (ye) {
      d.error(ln(ye) || "安装技能失败"), D((_e) => {
        const xe = { ..._e };
        return delete xe[H], xe;
      });
    }
  }, bt = n(() => {
    let m = Se;
    if (Pe && (m = m.filter((H) => H.sourceLabel === Pe)), y.trim()) {
      const H = y.toLowerCase();
      m = m.filter(
        (ce) => {
          var me;
          return ce.name.toLowerCase().includes(H) || ((me = ce.description) == null ? void 0 : me.toLowerCase().includes(H));
        }
      );
    }
    return m;
  }, [Se, y, Pe]), it = L.filter((m) => m.available), Ge = n(() => {
    if (!Pe) return W;
    const m = it.find(
      (H) => H.label === Pe
    );
    return m ? W.filter((H) => H.source === m.key) : W;
  }, [W, Pe, it]), Gt = n(() => {
    const m = /* @__PURE__ */ new Set();
    return Q.filter((H) => H.enabled).forEach((H) => m.add(H.label)), it.forEach((H) => m.add(H.label)), Array.from(m);
  }, [Q, it]), Wn = e.createElement(
    "div",
    null,
    // Top bar: search + filters + install target
    e.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap"
        }
      },
      e.createElement(u, {
        placeholder: "搜索技能市场...",
        prefix: C ? e.createElement(C) : void 0,
        value: y,
        onChange: (m) => te(m.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      re.length > 0 ? e.createElement(M, {
        value: c || void 0,
        onChange: (m) => ee(m || ""),
        placeholder: "全部分类",
        allowClear: !0,
        style: { minWidth: 150 },
        options: [
          { value: "", label: "全部分类" },
          ...re.map((m) => ({ value: m.id, label: m.label }))
        ]
      }) : null,
      // Pool install info
      e.createElement(
        w,
        { type: "secondary", style: { fontSize: 12 } },
        "安装后进入技能池"
      ),
      // Configure skill source button
      e.createElement(
        s,
        {
          icon: F ? e.createElement(F) : void 0,
          onClick: () => ot(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Source filter tags (GitHub sources + market providers)
    Gt.length > 0 ? e.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          alignItems: "center"
        }
      },
      e.createElement(
        w,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "来源筛选:"
      ),
      e.createElement(
        S,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: Pe === "" ? "blue" : void 0,
          onClick: () => et("")
        },
        "全部"
      ),
      ...Gt.map((m) => {
        const H = Q.find((me) => me.label === m), ce = (H == null ? void 0 : H.platform) === "oss";
        return e.createElement(
          S,
          {
            key: m,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: Pe === m ? ce ? "green" : "blue" : void 0,
            icon: ce ? ne ? e.createElement(ne) : void 0 : F && H ? e.createElement(F) : void 0,
            onClick: () => et(
              Pe === m ? "" : m
            )
          },
          m
        );
      })
    ) : null,
    // GitHub skills section
    Qe && Se.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      e.createElement(i, {
        tip: "正在加载技能...",
        size: "large"
      })
    ) : bt.length > 0 ? e.createElement(
      "div",
      { style: { marginBottom: 20 } },
      e.createElement(
        "div",
        {
          style: {
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 6
          }
        },
        F ? e.createElement(F, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        e.createElement(
          w,
          { strong: !0, style: { fontSize: 13 } },
          `技能源 (${bt.length})`
        )
      ),
      e.createElement(
        I,
        { gutter: [12, 12] },
        ...bt.map((m) => {
          const H = `github:${m.sourceId}:${m.name}`, ce = k[H];
          return e.createElement(
            A,
            { key: H, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              _,
              {
                hoverable: !0,
                size: "small",
                style: { height: "100%" }
              },
              e.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8
                  }
                },
                F ? e.createElement(F, {
                  style: { fontSize: 18, color: "#57606a" }
                }) : e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                e.createElement(
                  p,
                  { title: m.name },
                  e.createElement(
                    w,
                    {
                      strong: !0,
                      style: {
                        fontSize: 13,
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }
                    },
                    m.name
                  )
                )
              ),
              e.createElement(
                g,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                m.description || "暂无描述"
              ),
              e.createElement(
                "div",
                {
                  style: {
                    marginTop: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }
                },
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, flexWrap: "wrap" } },
                  e.createElement(
                    S,
                    { color: "blue", style: { fontSize: 10 } },
                    m.sourceLabel
                  ),
                  m.version ? e.createElement(
                    S,
                    { style: { fontSize: 10 } },
                    `v${m.version}`
                  ) : null
                ),
                ce ? e.createElement(
                  s,
                  {
                    size: "small",
                    disabled: !0,
                    icon: v ? e.createElement(v) : void 0
                  },
                  "安装中"
                ) : e.createElement(
                  s,
                  {
                    type: "primary",
                    size: "small",
                    icon: K ? e.createElement(K) : void 0,
                    onClick: () => Jn(m)
                  },
                  "安装"
                )
              )
            )
          );
        })
      )
    ) : null,
    // Market results section title
    Ge.length > 0 || z ? e.createElement(
      "div",
      {
        style: {
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      O ? e.createElement(O, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      e.createElement(
        w,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${Ge.length > 0 ? ` (${Ge.length})` : ""}`
      )
    ) : null,
    // Results grid
    z && Ge.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(i, { size: "large" })
    ) : Ge.length === 0 ? e.createElement(r, {
      description: y ? `未找到匹配「${y}」的技能` : "输入关键词搜索技能市场",
      image: r.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      I,
      { gutter: [12, 12] },
      ...Ge.map((m) => {
        const H = `${m.source}:${m.slug}`, ce = k[H];
        return e.createElement(
          A,
          { key: H, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            _,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => J(m)
            },
            e.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8
                }
              },
              m.icon_url ? e.createElement("img", {
                src: m.icon_url,
                alt: m.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : e.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              e.createElement(
                p,
                { title: m.name },
                e.createElement(
                  w,
                  {
                    strong: !0,
                    style: {
                      fontSize: 13,
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }
                  },
                  m.name
                )
              )
            ),
            e.createElement(
              g,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              m.description || "暂无描述"
            ),
            e.createElement(
              "div",
              {
                style: {
                  marginTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }
              },
              e.createElement(
                "div",
                { style: { display: "flex", gap: 4 } },
                e.createElement(
                  S,
                  { color: "geekblue", style: { fontSize: 10 } },
                  m.source
                ),
                m.version ? e.createElement(
                  S,
                  { style: { fontSize: 10 } },
                  `v${m.version}`
                ) : null
              ),
              ce ? e.createElement(
                s,
                {
                  size: "small",
                  disabled: !0,
                  icon: v ? e.createElement(v) : void 0
                },
                "安装中"
              ) : e.createElement(
                s,
                {
                  type: "primary",
                  size: "small",
                  icon: K ? e.createElement(K) : void 0,
                  onClick: (me) => {
                    me.stopPropagation(), Ft(m);
                  }
                },
                "安装"
              )
            )
          )
        );
      })
    ),
    // Load more button
    de && !z ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        s,
        { onClick: Gn, loading: z },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    q ? e.createElement(
      V,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          q.icon_url ? e.createElement("img", {
            src: q.icon_url,
            alt: q.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, q.name)
        ),
        open: !0,
        onClose: () => J(null),
        width: 480,
        extra: e.createElement(
          s,
          {
            type: "primary",
            icon: K ? e.createElement(K) : void 0,
            onClick: () => {
              Ft(q);
            }
          },
          "安装到技能池"
        )
      },
      e.createElement(
        R,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          R.Item,
          { label: "来源" },
          q.source
        ),
        e.createElement(
          R.Item,
          { label: "描述" },
          q.description || "-"
        ),
        q.version ? e.createElement(
          R.Item,
          { label: "版本" },
          q.version
        ) : null,
        q.author ? e.createElement(
          R.Item,
          { label: "作者" },
          q.author
        ) : null,
        e.createElement(
          R.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: q.source_url, target: "_blank" },
            q.source_url
          )
        )
      ),
      q.stats ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          w,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "统计"
        ),
        e.createElement(
          "div",
          { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
          ...Object.entries(q.stats).map(
            ([m, H]) => e.createElement(
              "div",
              { key: m, style: { textAlign: "center" } },
              e.createElement(
                "div",
                {
                  style: {
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#1677ff"
                  }
                },
                String(H)
              ),
              e.createElement(
                w,
                { type: "secondary", style: { fontSize: 11 } },
                m
              )
            )
          )
        )
      ) : null
    ) : null
  ), Kn = n(() => {
    if (!ve.trim()) return xt;
    const m = ve.toLowerCase();
    return xt.filter(
      (H) => H.name.toLowerCase().includes(m) || H.description.toLowerCase().includes(m) || H.category.toLowerCase().includes(m)
    );
  }, [ve]), Xn = async (m) => {
    try {
      const H = await ae("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: m.name,
          description: m.description,
          skill_names: m.recommended_skills
        })
      });
      await gt(H.id, "AGENTS.md", m.system_prompt);
      const ce = await yt(H.id);
      ce.approval_level = m.approval_level, await ae(`/agents/${encodeURIComponent(H.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ce)
      }), d.success(`专家「${m.name}」创建成功，已跳转至专家`), Hn("/ugsci-experts");
    } catch (H) {
      d.error(H.message || "创建专家失败");
    }
  }, Ht = a(async (m) => {
    if (m)
      try {
        const H = await Rt(m);
        Fe(new Set(H.map((ce) => ce.key)));
      } catch {
        Fe(/* @__PURE__ */ new Set());
      }
  }, []);
  l(() => {
    Ae && Ht(Ae);
  }, [Ae, Ht]);
  const qn = async (m) => {
    if (!Ae) {
      d.warning("请先选择目标专家");
      return;
    }
    if (ha(m)) {
      const H = Object.entries(m.env), ce = {};
      for (const [me] of H)
        ce[me] = "";
      we(ce), Ye(m);
      return;
    }
    await Jt(m, m.env || {});
  }, Jt = async (m, H) => {
    qe((ce) => ({ ...ce, [m.id]: !0 }));
    try {
      const ce = m.id;
      await yn(Ae, {
        client_key: ce,
        client: {
          name: m.name,
          description: m.description,
          enabled: !0,
          transport: m.transport,
          url: m.url || "",
          command: m.command || "",
          args: m.args || [],
          env: H,
          cwd: m.cwd || "",
          headers: m.headers || {}
        }
      }), d.success(`MCP「${m.name}」已添加到当前专家`), Fe((me) => new Set(me).add(ce));
    } catch (ce) {
      d.error(ce.message || `添加 MCP「${m.name}」失败`);
    } finally {
      qe((ce) => ({ ...ce, [m.id]: !1 }));
    }
  }, Vn = async () => {
    if (!Ie) return;
    const m = [];
    for (const [ce, me] of Object.entries(Te))
      if (!me || !me.trim()) {
        const ye = Kt[ce];
        m.push((ye == null ? void 0 : ye.label) || ce);
      }
    if (m.length > 0) {
      d.warning(`请填写以下配置项: ${m.join(", ")}`);
      return;
    }
    const H = Ie;
    Ye(null), we({}), await Jt(H, { ...Te });
  }, Yn = n(() => {
    if (!ze.trim()) return Wt;
    const m = ze.toLowerCase();
    return Wt.filter(
      (H) => H.name.toLowerCase().includes(m) || H.description.toLowerCase().includes(m) || H.category.toLowerCase().includes(m)
    );
  }, [ze]), Qn = e.createElement(
    "div",
    null,
    // Search + agent selector
    e.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center"
        }
      },
      e.createElement(u, {
        placeholder: "搜索 MCP 模板...",
        prefix: C ? e.createElement(C) : void 0,
        value: ze,
        onChange: (m) => Ue(m.target.value),
        allowClear: !0,
        style: { maxWidth: 300 }
      }),
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        e.createElement(
          w,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "安装到："
        ),
        e.createElement(M, {
          value: Ae,
          onChange: (m) => Ve(m),
          style: { minWidth: 180 },
          size: "small",
          options: ie.map((m) => ({ value: m.id, label: m.name }))
        })
      ),
      // Configure MCP source button
      e.createElement(
        s,
        {
          icon: ne ? e.createElement(ne) : void 0,
          onClick: () => Ut(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // MCP template cards
    e.createElement(
      I,
      { gutter: [12, 12] },
      ...Yn.map(
        (m) => e.createElement(
          A,
          { key: m.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            _,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%" }
            },
            // Header: emoji + name + tags
            e.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 8
                }
              },
              e.createElement(
                "span",
                { style: { fontSize: 28 } },
                m.emoji
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  w,
                  { strong: !0, style: { fontSize: 14 } },
                  m.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  e.createElement(
                    S,
                    { color: "blue", style: { fontSize: 10 } },
                    m.category
                  ),
                  e.createElement(
                    S,
                    {
                      color: m.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    m.transport
                  ),
                  m.env && Object.keys(m.env).length > 0 ? e.createElement(
                    S,
                    { color: "orange", style: { fontSize: 10 } },
                    "需配置密钥"
                  ) : null
                )
              )
            ),
            // Description
            e.createElement(
              g,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              m.description
            ),
            // Footer: config preview + install button
            e.createElement(
              "div",
              {
                style: {
                  marginTop: 10,
                  paddingTop: 8,
                  borderTop: "1px solid #f0f0f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }
              },
              e.createElement(
                w,
                { type: "secondary", style: { fontSize: 11 } },
                m.transport === "stdio" ? `${m.command} ${(m.args || []).join(" ")}` : m.url || ""
              ),
              lt.has(m.id) ? e.createElement(
                s,
                { size: "small", disabled: !0 },
                "已安装"
              ) : e.createElement(
                s,
                {
                  type: "primary",
                  size: "small",
                  loading: !!at[m.id],
                  icon: ne ? e.createElement(ne) : void 0,
                  onClick: () => qn(m)
                },
                "安装"
              )
            )
          )
        )
      )
    ),
    // Future expansion hint
    e.createElement(
      "div",
      {
        style: {
          marginTop: 20,
          padding: 16,
          textAlign: "center",
          border: "1px dashed #d9d9d9",
          borderRadius: 8,
          background: "#fafafa"
        }
      },
      O ? e.createElement(O, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        w,
        { type: "secondary", style: { fontSize: 12 } },
        "更多 MCP 服务器模板持续更新中，也支持通过 JSON 配置自定义添加"
      )
    )
  ), Zn = Ie ? e.createElement(
    P,
    {
      title: e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        e.createElement("span", { style: { fontSize: 20 } }, Ie.emoji),
        e.createElement("span", null, `配置 ${Ie.name} 密钥`)
      ),
      open: !!Ie,
      onCancel: () => {
        Ye(null), we({});
      },
      onOk: Vn,
      okText: "安装",
      cancelText: "取消",
      width: 520,
      destroyOnClose: !0
    },
    // Description
    e.createElement(
      w,
      { type: "secondary", style: { display: "block", marginBottom: 16, fontSize: 12 } },
      Ie.description
    ),
    ...Object.entries(Ie.env || {}).map(([m]) => {
      const H = Kt[m], ce = (H == null ? void 0 : H.isSecret) !== !1;
      return e.createElement(
        "div",
        { key: m, style: { marginBottom: 16 } },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          e.createElement(
            w,
            { strong: !0, style: { fontSize: 13 } },
            (H == null ? void 0 : H.label) || m
          ),
          e.createElement(
            S,
            { color: "orange", style: { fontSize: 10 } },
            "必填"
          )
        ),
        // Help text with optional link
        H ? e.createElement(
          "div",
          { style: { marginBottom: 6, fontSize: 12, color: "#8c8c8c" } },
          H.help,
          H.link ? e.createElement(
            "a",
            {
              href: H.link,
              target: "_blank",
              rel: "noopener noreferrer",
              style: { marginLeft: 4, fontSize: 12 }
            },
            "获取方式 ↗"
          ) : null
        ) : null,
        // Input field
        ce ? e.createElement(u.Password, {
          placeholder: `请输入 ${(H == null ? void 0 : H.label) || m}`,
          value: Te[m] || "",
          onChange: (me) => we((ye) => ({
            ...ye,
            [m]: me.target.value
          })),
          style: { width: "100%" }
        }) : e.createElement(u, {
          placeholder: `请输入 ${(H == null ? void 0 : H.label) || m}`,
          value: Te[m] || "",
          onChange: (me) => we((ye) => ({
            ...ye,
            [m]: me.target.value
          })),
          style: { width: "100%" }
        }),
        // Show env key name for reference
        e.createElement(
          w,
          { type: "secondary", style: { fontSize: 11, display: "block", marginTop: 2 } },
          `环境变量名: ${m}`
        )
      );
    })
  ) : null, ea = e.createElement(
    "div",
    null,
    e.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap"
        }
      },
      e.createElement(u, {
        placeholder: "搜索专家模板...",
        prefix: C ? e.createElement(C) : void 0,
        value: ve,
        onChange: (m) => Ce(m.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      e.createElement(
        s,
        {
          icon: f ? e.createElement(f) : void 0,
          onClick: () => Dt(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    e.createElement(
      I,
      { gutter: [12, 12] },
      ...Kn.map(
        (m) => e.createElement(
          A,
          { key: m.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            _,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => Xn(m)
            },
            e.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 8
                }
              },
              e.createElement(Re, {
                name: m.name,
                size: 40
              }),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  w,
                  { strong: !0, style: { fontSize: 14 } },
                  m.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4 } },
                  e.createElement(
                    S,
                    { color: "blue", style: { fontSize: 10 } },
                    m.category
                  ),
                  m.approval_level === "MANUAL" ? e.createElement(
                    S,
                    { color: "orange", style: { fontSize: 10 } },
                    "需审批"
                  ) : e.createElement(
                    S,
                    { color: "green", style: { fontSize: 10 } },
                    "自动"
                  )
                )
              )
            ),
            e.createElement(
              g,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              m.description.replace(/\*\*(.+?)\*\*/g, "$1")
            ),
            e.createElement(
              "div",
              {
                style: {
                  marginTop: 10,
                  paddingTop: 8,
                  borderTop: "1px solid #f0f0f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }
              },
              e.createElement(
                w,
                { type: "secondary", style: { fontSize: 11 } },
                `推荐 ${m.recommended_skills.length} 个技能`
              ),
              e.createElement(
                s,
                {
                  type: "primary",
                  size: "small",
                  icon: N ? e.createElement(N) : void 0
                },
                "一键创建"
              )
            )
          )
        )
      )
    ),
    // Future expansion hint
    e.createElement(
      "div",
      {
        style: {
          marginTop: 20,
          padding: 16,
          textAlign: "center",
          border: "1px dashed #d9d9d9",
          borderRadius: 8,
          background: "#fafafa"
        }
      },
      O ? e.createElement(O, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        w,
        { type: "secondary", style: { fontSize: 12 } },
        "更多专家模板持续更新中，未来将支持 OpenScience、RPA 等行业扩展"
      )
    )
  ), ta = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        N ? e.createElement(N, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: Wn
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        ne ? e.createElement(ne, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: Qn
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        f ? e.createElement(f, { style: { fontSize: 14 } }) : null,
        "专家模板"
      ),
      children: ea
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(ht, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 创建专家模板 · 随时更新能力和专家",
      extra: e.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        e.createElement(
          s,
          {
            type: "primary",
            icon: x ? e.createElement(x) : void 0,
            onClick: () => {
              st(y, c, {}), rt();
            },
            loading: z || Qe
          },
          "刷新"
        )
      )
    }),
    e.createElement(Z, {
      items: ta,
      activeKey: b,
      onChange: (m) => oe(m)
    }),
    // Skill source config modal
    e.createElement(Ol, {
      open: he,
      onClose: () => ot(!1),
      sources: Q,
      onChange: (m) => {
        be(m), rt(m);
      }
    }),
    // MCP source config modal
    e.createElement(an, {
      open: Nn,
      onClose: () => Ut(!1),
      sources: Ne,
      onChange: (m) => Bt(m),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    Zn,
    // Expert source config modal
    e.createElement(an, {
      open: Fn,
      onClose: () => Dt(!1),
      sources: Dn,
      onChange: (m) => Nt(m),
      type: "expert"
    })
  );
}
function Ll() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const rn = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, sn = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function jl() {
  const e = T(), t = e.React, { useEffect: l, useRef: a } = t, n = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, o = (n == null ? void 0 : n.id) || "default", i = a(null), r = a(null);
  return l(() => {
    if (i.current === o) return;
    i.current = o;
    const u = Ll(), s = rn[u] || rn.en, d = sn[u] || sn.en;
    let I = !1;
    return (async () => {
      var A, _;
      try {
        const S = await Et(o);
        if (I) return;
        const p = pn(S);
        if (r.current) {
          try {
            r.current();
          } catch {
          }
          r.current = null;
        }
        const $ = window.QwenPaw;
        (A = $ == null ? void 0 : $.chat) != null && A.welcome && (p.length > 0 ? (r.current = $.chat.welcome.set("ugsci", {
          description: s,
          prompts: p
        }), console.info(
          `[ugsci] Injected ${p.length} welcome prompts for agent "${o}"`
        )) : (r.current = $.chat.welcome.set("ugsci", {
          description: s,
          prompts: [d]
        }), console.info(
          `[ugsci] No skills for agent "${o}" — using default prompt`
        )));
      } catch (S) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${o}":`,
          S
        );
        const p = window.QwenPaw;
        if ((_ = p == null ? void 0 : p.chat) != null && _.welcome && !I) {
          if (r.current) {
            try {
              r.current();
            } catch {
            }
            r.current = null;
          }
          r.current = p.chat.welcome.set("ugsci", {
            description: s,
            prompts: [d]
          });
        }
      }
    })(), () => {
      I = !0;
    };
  }, [o]), null;
}
function Bl() {
  var s, d, I;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = T().React, l = "ugsci";
  (d = (s = e.chat) == null ? void 0 : s.rightHeader) != null && d.add ? (e.chat.rightHeader.add(l, t.createElement(jl), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const a = T().antdIcons || {}, n = a.UserSwitchOutlined, o = a.ToolOutlined, i = a.ThunderboltOutlined, r = a.ShopOutlined;
  e.route.add(l, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: el
  }), e.menu.add(l, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家",
    icon: n ? t.createElement(n, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => He()
  }), e.route.add(l, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: Sl
  }), e.menu.add(l, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "工具",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.capabilities",
    order: 6,
    visible: () => He()
  }), e.route.add(l, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: Cl
  }), e.menu.add(l, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能",
    icon: i ? t.createElement(i, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.skills-center",
    order: 7,
    visible: () => He()
  }), e.route.add(l, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: Rl
  }), e.menu.add(l, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: r ? t.createElement(r, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 8,
    visible: () => He()
  }), (I = e.sidebar) != null && I.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
    "ugsci.experts",
    "ugsci.capabilities",
    "ugsci.skills-center",
    "ugsci.market"
  ]), console.info("[ugsci] Registered 4 items for simple-mode visibility")) : console.warn(
    "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode"
  );
  const u = [
    "core.skills",
    "core.tools",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool"
  ];
  for (const A of u) {
    try {
      const S = e.menu.snapshot("primary.agentScoped").find((p) => p.id === A);
      S && e.menu.replace(l, A, {
        ...S,
        visible: () => !He()
      });
    } catch {
    }
    try {
      const S = e.menu.snapshot("primary.settings").find((p) => p.id === A);
      S && e.menu.replace(l, A, {
        ...S,
        visible: () => !He()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active"
  );
}
function It() {
  try {
    Bl();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(It, 500);
  }
}
var cn;
if ((cn = window.QwenPaw) != null && cn.host)
  It();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), It());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
