function E() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function nn() {
  try {
    return E().getApiToken() || "";
  } catch {
    return "";
  }
}
function Ye(e) {
  return E().getApiUrl(e);
}
function _t(e) {
  const t = nn();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
async function ee(e, t) {
  const a = await fetch(Ye(e), {
    ...t,
    headers: { ..._t(), ...(t == null ? void 0 : t.headers) || {} }
  });
  if (!a.ok) {
    const n = await a.text().catch(() => "");
    throw new Error(n || `HTTP ${a.status}`);
  }
  return a.status === 204 ? null : a.json();
}
async function dt() {
  const e = await ee("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function nt(e) {
  return ee(`/agents/${encodeURIComponent(e)}`);
}
async function ut(e) {
  return await ee("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function pt() {
  return await ee("/skills/pool") || [];
}
async function ln() {
  return await ee("/skills/workspaces") || [];
}
async function an(e) {
  return await ee("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function rn(e, t) {
  return ee(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function on(e, t) {
  await ee(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function sn(e, t, a) {
  return ee("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ client_key: t, client: a })
  });
}
async function cn(e, t) {
  return await ee(
    `/mcp/tools/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
const Ae = {
  background: "#0072f5",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8
};
function Xe() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function gt(e, t) {
  const a = E();
  return a.ReactMarkdown && a.remarkGfm ? t.createElement(
    a.ReactMarkdown,
    { remarkPlugins: [a.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
const vt = [
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
], st = [
  {
    id: "reservoir-engineer",
    name: "油藏工程师",
    emoji: "🛢️",
    category: "油气开发",
    description: "**油藏工程师** —— 擅长储量评估、物质平衡计算、递减曲线分析、油藏数值模拟方案设计。",
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
    approvalLevel: "AUTO"
  },
  {
    id: "drilling-engineer",
    name: "钻井工程师",
    emoji: "⛏️",
    category: "钻完井",
    description: "**钻井工程师** —— 擅长井身结构设计、钻井液优化、套管设计、固井方案和钻井风险管理。",
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
    approvalLevel: "MANUAL"
  },
  {
    id: "well-logging-analyst",
    name: "测井分析师",
    emoji: "📡",
    category: "测井试油",
    description: "**测井分析师** —— 擅长测井曲线解释、岩性识别、孔隙度/饱和度计算和储层评价。",
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
    approvalLevel: "AUTO"
  },
  {
    id: "production-engineer",
    name: "采油工程师",
    emoji: "⚙️",
    category: "油气生产",
    description: "**采油工程师** —— 擅长举升工艺设计、注水管理、增产措施工艺设计和生产动态监测。",
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
    approvalLevel: "AUTO"
  },
  {
    id: "geophysicist",
    name: "地球物理专家",
    emoji: "🌍",
    category: "地球物理",
    description: "**地球物理专家** —— 擅长地震资料解释、属性分析、反演处理和储层预测。",
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
    approvalLevel: "AUTO"
  },
  {
    id: "pvt-analyst",
    name: "PVT 分析师",
    emoji: "🧪",
    category: "流体性质",
    description: "**PVT 分析师** —— 擅长油气流体物性计算、相态分析、PVT 实验拟合和组分模型。",
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
    approvalLevel: "AUTO"
  }
], Ot = "ugsci_custom_teams";
function Ze() {
  try {
    const e = localStorage.getItem(Ot);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function Mt(e) {
  try {
    localStorage.setItem(Ot, JSON.stringify(e));
  } catch {
  }
}
const mn = [
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
async function dn(e, t) {
  const a = {
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
  await fetch(Ye("/console/chat"), {
    method: "POST",
    headers: {
      ..._t(),
      "X-Agent-Id": e
    },
    body: JSON.stringify(a)
  });
}
function et(e, t) {
  const a = e.find(
    (l) => l.name === t || l.name === t.replace(/\s+/g, "")
  );
  if (a) return a.id;
  const n = e.find(
    (l) => l.name.includes(t) || t.includes(l.name) || l.name.replace(/\s+/g, "").includes(t.replace(/\s+/g, ""))
  );
  return n ? n.id : null;
}
function un(e) {
  var a;
  const t = e.members.map((n) => `- ${n.name}（${n.role}）`).join(`
`);
  if (e.custom && e.steps && e.steps.length > 0) {
    const n = e.steps.map((r, s) => {
      const i = r.passContext ? "（传递上一步的结果作为上下文）" : "（独立执行，不传递上下文）";
      return `${s + 1}. 向「${r.agentName}」发送请求：${r.instruction} ${i}`;
    }).join(`
`);
    return `${e.mode === "pipeline" ? "请按顺序依次执行以下步骤，每步使用 chat_with_agent 咨询对应专家：" : e.mode === "roundtable" ? "请同时向以下专家分别发送独立请求（不传递上下文），收集所有结果后综合：" : `你是团队协调者（${e.coordinatorName || ((a = e.members[0]) == null ? void 0 : a.name) || ""}），请按需调用以下专家完成任务：`}

---

## 团队任务

${e.taskTemplate}

---

## 执行步骤

${n}

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
function pn({ team: e }) {
  const t = E().React, { Typography: a, Tag: n } = E().antd, { Text: l } = a, r = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙"
  }, s = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff"
  }, i = e.steps || [], h = i.length > 0;
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
      l,
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
      ...h ? i.map((c, m) => (e.members.find(
        (I) => I.name === c.agentName
      ), [
        m > 0 && e.mode !== "roundtable" ? t.createElement(
          "div",
          {
            key: `arrow-${m}`,
            style: {
              textAlign: "center",
              color: s[e.mode],
              fontSize: 14
            }
          },
          r[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `step-${m}`,
            style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: "#fff",
              borderRadius: 6,
              border: `1px solid ${s[e.mode]}33`,
              fontSize: 12,
              flex: e.mode === "roundtable" ? "1 1 200px" : "initial"
            }
          },
          t.createElement(Be, {
            name: c.agentName,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              l,
              { strong: !0, style: { fontSize: 12 } },
              c.agentName
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
              c.instruction
            ),
            c.passContext ? t.createElement(
              n,
              {
                color: "blue",
                style: { fontSize: 9, marginTop: 2 }
              },
              "传递上下文"
            ) : t.createElement(
              n,
              { style: { fontSize: 9, marginTop: 2 } },
              "独立"
            )
          )
        )
      ])).flat() : e.members.map((c, m) => [
        m > 0 && e.mode !== "roundtable" ? t.createElement(
          "div",
          {
            key: `arrow-${m}`,
            style: {
              textAlign: "center",
              color: s[e.mode],
              fontSize: 14
            }
          },
          r[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `member-${m}`,
            style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: "#fff",
              borderRadius: 6,
              border: `1px solid ${s[e.mode]}33`,
              fontSize: 12,
              flex: e.mode === "roundtable" ? "1 1 150px" : "initial"
            }
          },
          t.createElement(Be, { name: c.name, size: 24 }),
          t.createElement(
            "div",
            null,
            t.createElement(
              l,
              { strong: !0, style: { fontSize: 12 } },
              c.name
            ),
            t.createElement(
              "div",
              { style: { fontSize: 11, color: "#8c8c8c" } },
              c.role
            )
          )
        )
      ]).flat()
    )
  );
}
function gn({
  open: e,
  onClose: t,
  agents: a,
  editingTeam: n,
  onSaved: l
}) {
  const r = E().React, { useState: s, useEffect: i, useCallback: h } = r, {
    Modal: c,
    Input: m,
    Button: I,
    Select: v,
    Tag: f,
    Typography: D,
    Switch: b,
    Empty: A,
    message: _,
    Divider: H,
    Steps: x
  } = E().antd, { PlusOutlined: V, DeleteOutlined: L, SaveOutlined: O, ArrowRightOutlined: j } = E().antdIcons || {}, { Text: U, Paragraph: g } = D, [M, T] = s(""), [Q, C] = s("🤝"), [w, u] = s(""), [R, X] = s(
    "pipeline"
  ), [J, P] = s(""), [d, S] = s(""), [p, ne] = s([]), [F, Y] = s([]), [Z, G] = s(!1);
  i(() => {
    e && (n ? (T(n.name), C(n.emoji), u(n.description), X(n.mode), P(n.coordinatorName || ""), S(n.taskTemplate), ne(n.steps || []), Y(n.members.map((K) => K.name))) : (T(""), C("🤝"), u(""), X("pipeline"), P(""), S(`请执行以下任务：
任务描述：{任务描述}`), ne([]), Y([])));
  }, [e, n]);
  const $ = h(() => {
    if (R === "roundtable") {
      const K = F.map((ce) => ({
        agentName: ce,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      ne(K);
    } else if (R === "pipeline") {
      const K = new Map(p.map((B) => [B.agentName, B])), ce = F.map((B) => K.get(B) || {
        agentName: B,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      ne(ce);
    }
  }, [R, F, p]), le = (K) => {
    F.includes(K) || (Y([...F, K]), R === "coordinator" && !J && P(K));
  }, y = (K) => {
    Y(F.filter((ce) => ce !== K)), ne(p.filter((ce) => ce.agentName !== K)), J === K && P(F[0] || "");
  }, ae = (K, ce, B) => {
    const re = [...p];
    re[K] = { ...re[K], [ce]: B }, ne(re);
  }, ue = () => {
    if (!M.trim()) {
      _.warning("请输入团队名称");
      return;
    }
    if (F.length < 2) {
      _.warning("至少需要选择 2 个成员");
      return;
    }
    if (!d.trim()) {
      _.warning("请输入任务模板");
      return;
    }
    if (R === "coordinator" && !J) {
      _.warning("请选择协调者");
      return;
    }
    G(!0);
    try {
      const K = F.map(
        (te) => {
          var pe;
          const W = a.find((me) => me.name === te);
          return {
            name: te,
            role: ((pe = W == null ? void 0 : W.description) == null ? void 0 : pe.slice(0, 30)) || "团队成员",
            emoji: ""
          };
        }
      );
      let ce = p;
      (p.length === 0 || p.length !== F.length) && (ce = F.map((te) => ({
        agentName: te,
        instruction: "请完成你的专业部分",
        passContext: R === "pipeline"
      })));
      const B = {
        id: (n == null ? void 0 : n.id) || `custom-${Date.now()}`,
        name: M.trim(),
        emoji: Q,
        category: "自定义",
        description: w.trim() || `${M.trim()}（${F.length}人团队）`,
        mode: R,
        members: K,
        coordinatorName: R === "coordinator" ? J : void 0,
        taskTemplate: d.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: ce,
        custom: !0,
        createdAt: (n == null ? void 0 : n.createdAt) || Date.now()
      }, re = Ze(), oe = re.findIndex((te) => te.id === B.id);
      oe >= 0 ? re[oe] = B : re.push(B), Mt(re), _.success(n ? "团队已更新" : "团队已创建"), l(), t();
    } catch (K) {
      _.error(K.message || "保存失败");
    } finally {
      G(!1);
    }
  }, ve = a.filter(
    (K) => !F.includes(K.name)
  );
  return r.createElement(
    c,
    {
      open: e,
      onCancel: t,
      title: r.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        r.createElement(
          "span",
          { style: { fontSize: 20 } },
          n ? "✏️" : "➕"
        ),
        r.createElement(
          "span",
          null,
          n ? "编辑专家团" : "创建专家团"
        )
      ),
      width: 720,
      onOk: ue,
      okText: "保存团队",
      confirmLoading: Z,
      okButtonProps: {
        icon: O ? r.createElement(O) : void 0
      }
    },
    // Step 1: Basic info
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        U,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 基本信息"
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        F.length > 0 ? r.createElement(ft, {
          members: F,
          size: 36
        }) : null,
        r.createElement(m, {
          placeholder: "团队名称（如：储层评价团队）",
          value: M,
          onChange: (K) => T(K.target.value),
          style: { flex: 1 }
        })
      ),
      r.createElement(m.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: w,
        onChange: (K) => u(K.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        r.createElement(
          U,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式："
        ),
        r.createElement(v, {
          value: R,
          onChange: (K) => X(K),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" }
          ]
        })
      )
    ),
    r.createElement(H, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        U,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 选择团队成员"
      ),
      // Available agents
      ve.length > 0 ? r.createElement(
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
        ...ve.map(
          (K) => r.createElement(
            I,
            {
              key: K.id,
              size: "small",
              icon: V ? r.createElement(V) : void 0,
              onClick: () => le(K.name)
            },
            K.name
          )
        )
      ) : null,
      // Selected members
      F.length === 0 ? r.createElement(A, {
        description: "请从上方添加团队成员",
        image: A.PRESENTED_IMAGE_SIMPLE
      }) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...F.map(
          (K) => r.createElement(
            "div",
            {
              key: K,
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
            r.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 6 } },
              r.createElement(Be, { name: K, size: 24 }),
              r.createElement(
                U,
                { strong: !0, style: { fontSize: 13 } },
                K
              ),
              R === "coordinator" && J === K ? r.createElement(
                f,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              R === "coordinator" ? r.createElement(
                I,
                {
                  size: "small",
                  type: "link",
                  onClick: () => P(K)
                },
                "设为协调者"
              ) : null,
              r.createElement(
                I,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: L ? r.createElement(L) : void 0,
                  onClick: () => y(K)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    r.createElement(H, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    F.length > 0 ? r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        U,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${R === "roundtable" ? "（各步独立执行）" : R === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      r.createElement(
        I,
        {
          size: "small",
          type: "dashed",
          onClick: $,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      p.length === 0 ? r.createElement(
        U,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...p.map(
          (K, ce) => r.createElement(
            "div",
            {
              key: ce,
              style: {
                padding: 8,
                background: "#fff",
                borderRadius: 6,
                border: "1px solid #e8e8e8"
              }
            },
            r.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6
                }
              },
              R === "pipeline" ? r.createElement(
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
                `${ce + 1}`
              ) : r.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              r.createElement(
                f,
                { color: "blue", style: { fontSize: 11 } },
                K.agentName
              ),
              r.createElement(
                "div",
                { style: { flex: 1 } },
                r.createElement(m, {
                  placeholder: "请输入该步骤的指令...",
                  value: K.instruction,
                  onChange: (B) => ae(ce, "instruction", B.target.value),
                  size: "small"
                })
              )
            ),
            r.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  paddingLeft: 28
                }
              },
              r.createElement(b, {
                size: "small",
                checked: K.passContext,
                onChange: (B) => ae(ce, "passContext", B)
              }),
              r.createElement(
                U,
                { type: "secondary", style: { fontSize: 11 } },
                K.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    r.createElement(H, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    r.createElement(
      "div",
      null,
      r.createElement(
        U,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${F.length > 0 ? "4" : "3"}. 任务模板`
      ),
      r.createElement(m.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: d,
        onChange: (K) => S(K.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      r.createElement(
        U,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function bt({
  team: e,
  agents: t,
  onLaunch: a,
  onEdit: n,
  onDelete: l
}) {
  var w;
  const r = E().React, { useState: s } = r, { Card: i, Tag: h, Typography: c, Button: m, Tooltip: I } = E().antd, {
    TeamOutlined: v,
    RocketOutlined: f,
    UserOutlined: D,
    EditOutlined: b,
    DeleteOutlined: A,
    DownOutlined: _,
    UpOutlined: H
  } = E().antdIcons || {}, { Text: x, Paragraph: V } = c, [L, O] = s(!1), j = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, U = j[e.mode] || j.coordinator, g = e.members.map((u) => {
    const R = et(t, u.name);
    return { ...u, found: !!R, agentId: R };
  }), M = g.filter((u) => u.found).length, T = M === e.members.length, Q = e.coordinatorName || ((w = e.members[0]) == null ? void 0 : w.name), C = Q ? et(t, Q) : null;
  return r.createElement(
    i,
    {
      hoverable: !0,
      size: "small",
      style: { height: "100%", display: "flex", flexDirection: "column" }
    },
    // Header: emoji + name + mode tag + custom badge
    r.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10
        }
      },
      r.createElement(ft, {
        members: e.members.map((u) => u.name),
        size: 36
      }),
      r.createElement(
        "div",
        { style: { flex: 1 } },
        r.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          r.createElement(
            x,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? r.createElement(
            h,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        r.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          r.createElement(
            h,
            { color: U.color, style: { fontSize: 10 } },
            U.label
          ),
          r.createElement(
            h,
            { style: { fontSize: 10 } },
            `${M}/${e.members.length}`
          ),
          T ? null : r.createElement(
            h,
            { color: "orange", style: { fontSize: 10 } },
            "缺少成员"
          )
        )
      ),
      // Edit/delete for custom teams
      e.custom ? r.createElement(
        "div",
        { style: { display: "flex", gap: 2 } },
        n ? r.createElement(
          I,
          { title: "编辑" },
          r.createElement(m, {
            type: "text",
            size: "small",
            icon: b ? r.createElement(b) : void 0,
            onClick: (u) => {
              u.stopPropagation(), n(e);
            }
          })
        ) : null,
        l ? r.createElement(
          I,
          { title: "删除" },
          r.createElement(m, {
            type: "text",
            size: "small",
            danger: !0,
            icon: A ? r.createElement(A) : void 0,
            onClick: (u) => {
              u.stopPropagation(), l(e);
            }
          })
        ) : null
      ) : null
    ),
    // Description
    r.createElement(
      V,
      {
        type: "secondary",
        style: { fontSize: 12, margin: 0, marginBottom: 10, lineHeight: 1.5 },
        ellipsis: { rows: 2 }
      },
      e.description
    ),
    // Member avatars
    r.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 6,
          marginBottom: 10,
          flexWrap: "wrap"
        }
      },
      ...g.map(
        (u) => r.createElement(
          I,
          {
            key: u.name,
            title: `${u.name}（${u.role}）${u.found ? "" : " - 未创建"}`
          },
          r.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                borderRadius: 12,
                background: u.found ? "#f0f5ff" : "#fff2f0",
                border: `1px solid ${u.found ? "#d6e4ff" : "#ffccc7"}`,
                fontSize: 11
              }
            },
            r.createElement(Be, { name: u.name, size: 18 }),
            r.createElement(
              x,
              {
                style: { fontSize: 11, color: u.found ? "#1f4e8c" : "#cf1322" }
              },
              u.name
            )
          )
        )
      )
    ),
    // Toggle flow diagram
    r.createElement(
      m,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (u) => {
          u.stopPropagation(), O(!L);
        },
        icon: L ? H ? r.createElement(H) : "▲" : _ ? r.createElement(_) : "▼"
      },
      L ? "收起流程" : "查看执行流程"
    ),
    L ? r.createElement(pn, { team: e }) : null,
    // Footer: launch button
    r.createElement(
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
      r.createElement(
        x,
        { type: "secondary", style: { fontSize: 11 } },
        Q ? `协调者: ${Q}` : ""
      ),
      r.createElement(
        m,
        {
          type: "primary",
          size: "small",
          icon: f ? r.createElement(f) : void 0,
          disabled: !C,
          onClick: () => a(e),
          style: Ae
        },
        "发起团队任务"
      )
    )
  );
}
function yn({
  agents: e,
  onLaunch: t
}) {
  const a = E().React, { useMemo: n, useState: l, useCallback: r, useEffect: s } = a, {
    Row: i,
    Col: h,
    Input: c,
    Empty: m,
    Typography: I,
    Tag: v,
    Button: f,
    Divider: D,
    message: b,
    Popconfirm: A
  } = E().antd, { SearchOutlined: _, TeamOutlined: H, PlusOutlined: x, RocketOutlined: V } = E().antdIcons || {}, { Text: L } = I, [O, j] = l(""), [U, g] = l([]), [M, T] = l(!1), [Q, C] = l(null);
  s(() => {
    g(Ze());
  }, []);
  const w = r(() => {
    g(Ze());
  }, []), u = r(
    (p) => {
      const F = Ze().filter((Y) => Y.id !== p.id);
      Mt(F), g(F), b.success(`团队「${p.name}」已删除`);
    },
    [b]
  ), R = r((p) => {
    C(p), T(!0);
  }, []), X = r(() => {
    C(null), T(!0);
  }, []), J = n(() => [...U, ...mn], [U]), P = n(() => {
    if (!O.trim()) return J;
    const p = O.toLowerCase();
    return J.filter(
      (ne) => ne.name.toLowerCase().includes(p) || ne.description.toLowerCase().includes(p) || ne.category.toLowerCase().includes(p)
    );
  }, [J, O]), d = P.filter((p) => p.custom), S = P.filter((p) => !p.custom);
  return a.createElement(
    "div",
    null,
    // Info banner
    a.createElement(
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
      a.createElement(
        L,
        { style: { fontSize: 13, color: "#389e0d" } },
        "多智能体协同 — 选择预设团队或创建自定义团队，支持流水线、圆桌讨论、协调者三种编排模式。"
      ),
      a.createElement(
        f,
        {
          type: "primary",
          size: "small",
          icon: x ? a.createElement(x) : void 0,
          onClick: X,
          style: Ae
        },
        "创建专家团"
      )
    ),
    // Search
    a.createElement(c, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: _ ? a.createElement(_) : void 0,
      value: O,
      onChange: (p) => j(p.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Custom teams section
    d.length > 0 ? a.createElement(
      "div",
      { style: { marginBottom: 20 } },
      a.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 10
          }
        },
        a.createElement("span", { style: { fontSize: 16 } }),
        a.createElement(
          L,
          { strong: !0, style: { fontSize: 14 } },
          `自定义团队 (${d.length})`
        )
      ),
      a.createElement(
        i,
        { gutter: [12, 12] },
        ...d.map(
          (p) => a.createElement(
            h,
            { key: p.id, xs: 24, sm: 12, md: 8 },
            a.createElement(bt, {
              team: p,
              agents: e,
              onLaunch: t,
              onEdit: R,
              onDelete: u
            })
          )
        )
      ),
      a.createElement(D, { style: { margin: "16px 0" } })
    ) : null,
    // Preset teams section
    S.length > 0 ? a.createElement(
      "div",
      null,
      a.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 10
          }
        },
        a.createElement("span", { style: { fontSize: 16 } }),
        a.createElement(
          L,
          { strong: !0, style: { fontSize: 14 } },
          `预设团队 (${S.length})`
        ),
        a.createElement(
          L,
          { type: "secondary", style: { fontSize: 12 } },
          "· 行业典型工作流模板"
        )
      ),
      a.createElement(
        i,
        { gutter: [12, 12] },
        ...S.map(
          (p) => a.createElement(
            h,
            { key: p.id, xs: 24, sm: 12, md: 8 },
            a.createElement(bt, {
              team: p,
              agents: e,
              onLaunch: t
            })
          )
        )
      )
    ) : null,
    // Empty state
    P.length === 0 ? a.createElement(m, {
      description: "未找到匹配的专家团队，点击「创建专家团」自定义",
      image: m.PRESENTED_IMAGE_SIMPLE
    }) : null,
    // Team Builder Modal
    a.createElement(gn, {
      open: M,
      onClose: () => {
        T(!1), C(null);
      },
      agents: e,
      editingTeam: Q,
      onSaved: w
    })
  );
}
function fn(e) {
  var a;
  const t = [];
  for (const n of e) {
    if (n.enabled === !1) continue;
    const l = (a = n.description) == null ? void 0 : a.trim();
    if (!l) continue;
    let r = l;
    if (r = r.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(r) ? r = `请${r}` : /^(a |an |the )/i.test(r) ? r = `Help me with ${r}` : /[。？！.?!]$/.test(r) || (r = `帮我${r}`), r.length > 80 && (r = r.substring(0, 77) + "..."), t.push(r), t.length >= 4) break;
  }
  return t;
}
async function En(e) {
  return await ee("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function tt(e, t, a) {
  await ee(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: a })
  });
}
async function St(e, t) {
  const a = await nt(e);
  a.system_prompt_files = t, await ee(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(a)
  });
}
async function At(e, t) {
  await ee("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: t,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function hn(e, t) {
  await ee(`/skills/${encodeURIComponent(t)}/enable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Rt(e, t) {
  await ee(`/skills/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function vn(e, t) {
  return ee("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function bn(e, t) {
  return ee("/skills/batch-disable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Sn(e, t) {
  return ee("/skills/batch-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function yt(e) {
  return await ee("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function $t(e, t) {
  await ee(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Lt(e, t) {
  return ee("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function xn(e, t) {
  return ee(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function wn(e, t) {
  await ee(`/skills/${encodeURIComponent(t)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
function Cn(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const a = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!a) return { number: 6, unit: "h" };
  const n = parseInt(a[1] || "0", 10), l = parseInt(a[2] || "0", 10), r = parseInt(a[3] || "0", 10), s = n * 60 + l + Math.round(r / 60);
  return s <= 0 ? { number: 6, unit: "h" } : s >= 60 && s % 60 === 0 ? { number: s / 60, unit: "h" } : { number: s, unit: "m" };
}
function kn(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function Tn(e) {
  return ee("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function zn(e, t) {
  return ee("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function In(e) {
  await ee("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Pn(e) {
  return ee("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function _n(e, t) {
  return ee("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function On(e) {
  return (await ee("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function Mn(e, t) {
  await ee("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function An() {
  return (await ee("/config/user-timezone")).timezone || "UTC";
}
async function Rn(e) {
  await ee("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function $n(e) {
  return await ee("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const xt = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function lt({
  title: e,
  subtitle: t,
  extra: a
}) {
  const n = E().React, { Space: l } = E().antd;
  return n.createElement(
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
    n.createElement(
      "div",
      null,
      n.createElement(
        "h2",
        { style: { margin: 0, fontSize: 20, fontWeight: 600 } },
        e
      ),
      t ? n.createElement(
        "div",
        { style: { marginTop: 4, fontSize: 13, color: "#8c8c8c" } },
        t
      ) : null
    ),
    a ? n.createElement(l, null, a) : null
  );
}
function wt({
  items: e,
  max: t = 5,
  color: a = "blue",
  emptyText: n = "无"
}) {
  const l = E().React, { Tag: r } = E().antd;
  return !e || e.length === 0 ? l.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    n
  ) : l.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (s, i) => l.createElement(
        r,
        { key: i, color: a, style: { fontSize: 11, marginRight: 0 } },
        s
      )
    ),
    e.length > t ? l.createElement(
      r,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function Bt({
  open: e,
  onClose: t,
  poolSkills: a,
  installedSkillNames: n,
  loading: l,
  onInstall: r
}) {
  const s = E().React, { useState: i, useEffect: h, useMemo: c } = s, { Modal: m, Button: I, Empty: v, Spin: f, Input: D, Tag: b, Tooltip: A, Typography: _ } = E().antd, { CheckOutlined: H, SearchOutlined: x } = E().antdIcons || {}, { Text: V } = _, [L, O] = i([]), [j, U] = i("");
  h(() => {
    e && (O([]), U(""));
  }, [e]);
  const g = c(() => {
    if (!j.trim()) return a;
    const C = j.toLowerCase();
    return a.filter(
      (w) => {
        var u, R;
        return w.name.toLowerCase().includes(C) || ((u = w.description) == null ? void 0 : u.toLowerCase().includes(C)) || ((R = w.tags) == null ? void 0 : R.some((X) => X.toLowerCase().includes(C)));
      }
    );
  }, [a, j]), M = g.filter(
    (C) => !n.includes(C.name)
  ), T = (C) => {
    O(
      (w) => w.includes(C) ? w.filter((u) => u !== C) : [...w, C]
    );
  }, Q = async () => {
    L.length !== 0 && (await r(L), O([]));
  };
  return s.createElement(
    m,
    {
      open: e,
      onCancel: t,
      title: "从技能池选择技能",
      width: 680,
      footer: s.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }
        },
        s.createElement(
          V,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${L.length} 个技能`
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          s.createElement(I, { onClick: t }, "取消"),
          s.createElement(
            I,
            {
              type: "primary",
              onClick: Q,
              disabled: L.length === 0
            },
            L.length > 0 ? `添加 (${L.length})` : "添加"
          )
        )
      )
    },
    // Search + bulk actions bar
    s.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 8,
          alignItems: "center"
        }
      },
      s.createElement(D, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: x ? s.createElement(x) : void 0,
        value: j,
        onChange: (C) => U(C.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      s.createElement(
        I,
        {
          size: "small",
          type: "primary",
          onClick: () => O(M.map((C) => C.name))
        },
        "全选"
      ),
      s.createElement(
        I,
        {
          size: "small",
          onClick: () => O([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    l ? s.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      s.createElement(f, { size: "large" })
    ) : g.length === 0 ? s.createElement(v, {
      description: j ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: v.PRESENTED_IMAGE_SIMPLE
    }) : s.createElement(
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
      ...g.map((C) => {
        const w = L.includes(C.name), u = n.includes(C.name);
        return s.createElement(
          "div",
          {
            key: C.name,
            onClick: () => !u && T(C.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${w ? "#0072f5" : "#e8e8e8"}`,
              borderRadius: 6,
              cursor: u ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: w ? "rgba(0, 114, 245, 0.06)" : u ? "#fafafa" : "#fff",
              opacity: u ? 0.5 : 1,
              minHeight: 64
            }
          },
          w ? s.createElement(
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
            H ? s.createElement(H) : "✓"
          ) : null,
          u ? s.createElement(
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
          s.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4,
                paddingRight: u || w ? 24 : 0
              }
            },
            s.createElement(
              "span",
              { style: { fontSize: 16 } },
              C.emoji || "⚡"
            ),
            s.createElement(
              A,
              { title: C.name },
              s.createElement(
                V,
                {
                  strong: !0,
                  style: {
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                C.name
              )
            )
          ),
          C.description ? s.createElement(
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
            C.description
          ) : null,
          C.tags && C.tags.length > 0 ? s.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...C.tags.slice(0, 2).map(
              (R, X) => s.createElement(
                b,
                {
                  key: X,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                R
              )
            )
          ) : null
        );
      })
    )
  );
}
const qe = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  gap: 4
}, jt = { marginBottom: 16 }, Dt = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16
}, Ne = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(0,0,0,0.85)",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid #f0f0f0"
}, Nt = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function Ln({ agentId: e }) {
  const t = E().React, { useState: a, useEffect: n, useCallback: l } = t, {
    Switch: r,
    InputNumber: s,
    Select: i,
    Button: h,
    Spin: c,
    Space: m,
    Typography: I,
    message: v
  } = E().antd, { PlayCircleOutlined: f, SaveOutlined: D } = E().antdIcons || {}, { Text: b } = I, [A, _] = a(!0), [H, x] = a(!1), [V, L] = a(!1), [O, j] = a(!1), [U, g] = a(6), [M, T] = a("h"), [Q, C] = a("main"), [w, u] = a(300), [R, X] = a(!1), [J, P] = a("08:00"), [d, S] = a("22:00"), p = l(async () => {
    var $, le;
    _(!0);
    try {
      const y = await Tn(e), ae = Cn(y.every ?? "6h");
      j(y.enabled ?? !1), g(ae.number), T(ae.unit), C(y.target ?? "main"), u(y.timeoutSeconds ?? 300), X(!!y.activeHours), P((($ = y.activeHours) == null ? void 0 : $.start) ?? "08:00"), S(((le = y.activeHours) == null ? void 0 : le.end) ?? "22:00");
    } catch (y) {
      v.error(y.message || "加载心跳配置失败");
    } finally {
      _(!1);
    }
  }, [e]);
  n(() => {
    p();
  }, [p]);
  const ne = async () => {
    x(!0);
    try {
      await zn(e, {
        enabled: O,
        every: kn({ number: U, unit: M }),
        target: Q,
        timeoutSeconds: w,
        activeHours: R && J && d ? { start: J, end: d } : void 0
      }), v.success("心跳配置已保存");
    } catch ($) {
      v.error($.message || "保存心跳配置失败");
    } finally {
      x(!1);
    }
  }, F = async () => {
    L(!0);
    try {
      await In(e), v.success("已触发心跳检查");
    } catch ($) {
      v.error($.message || "触发心跳失败");
    } finally {
      L(!1);
    }
  };
  if (A)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(c, { size: "large" })
    );
  const Y = ($, le, y) => t.createElement(
    "div",
    { style: jt },
    t.createElement("div", { style: qe }, $),
    le,
    y ? t.createElement(
      b,
      { type: "secondary", style: Nt },
      y
    ) : null
  ), Z = ($, le, y, ae) => t.createElement(
    "div",
    { style: Dt },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: qe }, $),
      le
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: qe }, y),
      ae
    )
  ), { Divider: G } = E().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: Ne }, "基本设置"),
    Y(
      "启用心跳",
      t.createElement(r, {
        checked: O,
        onChange: ($) => j($)
      }),
      O ? "已启用，专家将定期自检" : "已停用"
    ),
    Z(
      "检查频率",
      t.createElement(
        m,
        null,
        t.createElement(s, {
          min: 1,
          value: U,
          onChange: ($) => g($ ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(i, {
          value: M,
          onChange: ($) => T($),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(i, {
        value: Q,
        onChange: ($) => C($),
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
      t.createElement(s, {
        min: 1,
        max: 3600,
        value: w,
        onChange: ($) => u($ ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(G, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "活跃时段"),
    Y(
      "启用活跃时段限制",
      t.createElement(r, {
        checked: R,
        onChange: ($) => X($)
      }),
      "仅在指定时段内触发心跳"
    ),
    R ? Z(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: J,
        onChange: ($) => P($.target.value),
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
        value: d,
        onChange: ($) => S($.target.value),
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
        h,
        {
          type: "primary",
          icon: D ? t.createElement(D) : void 0,
          loading: H,
          onClick: ne,
          style: Ae
        },
        "保存配置"
      ),
      t.createElement(
        h,
        {
          icon: f ? t.createElement(f) : void 0,
          loading: V,
          onClick: F
        },
        "立即执行"
      )
    )
  );
}
function Bn({
  agentId: e,
  onRefresh: t
}) {
  const a = E().React, { useState: n, useEffect: l, useCallback: r } = a, {
    List: s,
    Tag: i,
    Switch: h,
    Button: c,
    Empty: m,
    Spin: I,
    Typography: v,
    message: f
  } = E().antd, { PlusOutlined: D, ReloadOutlined: b, DeleteOutlined: A } = E().antdIcons || {}, { Text: _, Paragraph: H } = v, [x, V] = n([]), [L, O] = n(!0), [j, U] = n(!1), [g, M] = n([]), [T, Q] = n(!1), C = r(async () => {
    O(!0);
    try {
      const P = await ut(e);
      V(P);
    } catch (P) {
      f.error(P.message || "加载技能失败"), V([]);
    } finally {
      O(!1);
    }
  }, [e]);
  l(() => {
    C();
  }, [C]);
  const w = async () => {
    U(!0), Q(!0);
    try {
      const P = await pt();
      M(P);
    } catch (P) {
      f.error(P.message || "加载技能池失败");
    } finally {
      Q(!1);
    }
  }, u = async (P) => {
    let d = 0, S = 0;
    for (const p of P)
      try {
        await At(e, p), d++;
      } catch {
        S++;
      }
    d > 0 ? (f.success(
      `成功添加 ${d} 个技能${S > 0 ? `，${S} 个失败` : ""}`
    ), C(), t()) : S > 0 && f.error("添加技能失败"), U(!1);
  }, R = async (P, d) => {
    try {
      d ? await hn(e, P.name) : await wn(e, P.name), f.success(d ? "已启用" : "已停用"), C(), t();
    } catch (S) {
      f.error(S.message || "操作失败");
    }
  }, X = async (P) => {
    try {
      await Rt(e, P), f.success(`技能「${P}」已移除`), C(), t();
    } catch (d) {
      f.error(d.message || "移除技能失败");
    }
  };
  if (L)
    return a.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      a.createElement(I, { size: "large" })
    );
  const J = x.filter((P) => P.enabled !== !1);
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
          marginBottom: 12
        }
      },
      a.createElement(
        _,
        { strong: !0 },
        `技能列表 (${x.length}，已启用 ${J.length})`
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          c,
          {
            size: "small",
            icon: b ? a.createElement(b) : void 0,
            onClick: C
          },
          "刷新"
        ),
        a.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: D ? a.createElement(D) : void 0,
            onClick: w,
            style: Ae
          },
          "从技能池添加"
        )
      )
    ),
    x.length === 0 ? a.createElement(m, {
      description: "该专家暂无技能",
      image: m.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(s, {
      dataSource: x,
      renderItem: (P) => a.createElement(
        s.Item,
        {
          actions: [
            a.createElement(h, {
              key: "toggle",
              size: "small",
              checked: P.enabled !== !1,
              onChange: (d) => R(P, d)
            }),
            a.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: A ? a.createElement(A) : void 0,
                onClick: () => X(P.name)
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
            P.emoji ? a.createElement(
              "span",
              { style: { fontSize: 16 } },
              P.emoji
            ) : null,
            a.createElement(_, { strong: !0 }, P.name),
            P.version_text ? a.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${P.version_text}`
            ) : null
          ),
          P.description ? a.createElement(
            H,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            P.description
          ) : null
        )
      )
    }),
    a.createElement(Bt, {
      open: j,
      onClose: () => U(!1),
      poolSkills: g,
      installedSkillNames: x.map((P) => P.name),
      loading: T,
      onInstall: u
    })
  );
}
function jn({
  agentId: e,
  onRefresh: t,
  isActive: a
}) {
  const n = E().React, { useState: l, useEffect: r, useCallback: s } = n, {
    List: i,
    Tag: h,
    Button: c,
    Empty: m,
    Spin: I,
    Modal: v,
    Input: f,
    Typography: D,
    message: b
  } = E().antd, { PlusOutlined: A, ReloadOutlined: _, DeleteOutlined: H } = E().antdIcons || {}, { Text: x, Paragraph: V } = D, { TextArea: L } = f, [O, j] = l([]), [U, g] = l(!0), [M, T] = l(!1), [Q, C] = l(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [w, u] = l(!1), R = s(async () => {
    g(!0);
    try {
      const d = await yt(e);
      j(d);
    } catch (d) {
      b.error(d.message || "加载 MCP 失败"), j([]);
    } finally {
      g(!1);
    }
  }, [e]);
  r(() => {
    R();
  }, [R]), r(() => {
    a && R();
  }, [a, R]);
  const X = async (d) => {
    try {
      await xn(e, d), b.success("已切换 MCP 状态"), R(), t();
    } catch (S) {
      b.error(S.message || "切换失败");
    }
  }, J = async (d) => {
    try {
      await $t(e, d), b.success(`MCP「${d}」已移除`), R(), t();
    } catch (S) {
      b.error(S.message || "移除 MCP 失败");
    }
  }, P = async () => {
    u(!0);
    try {
      const d = JSON.parse(Q), S = d.mcpServers || d, p = Object.entries(S);
      if (p.length === 0) {
        b.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [ne, F] of p) {
        const Y = F, Z = Y.url ? "streamable_http" : "stdio";
        await Lt(e, {
          client_key: ne,
          client: {
            name: Y.name || ne,
            description: Y.description || "",
            enabled: !0,
            transport: Z,
            url: Y.url || "",
            command: Y.command || "",
            args: Y.args || [],
            env: Y.env || {},
            cwd: Y.cwd || "",
            headers: Y.headers || {}
          }
        });
      }
      b.success("MCP 客户端已创建"), T(!1), R(), t();
    } catch (d) {
      d instanceof SyntaxError ? b.error("JSON 格式错误：" + d.message) : b.error(d.message || "创建 MCP 失败");
    } finally {
      u(!1);
    }
  };
  return U ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(I, { size: "large" })
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
      n.createElement(x, { strong: !0 }, `MCP 客户端 (${O.length})`),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          c,
          {
            size: "small",
            icon: _ ? n.createElement(_) : void 0,
            onClick: R
          },
          "刷新"
        ),
        n.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: A ? n.createElement(A) : void 0,
            onClick: () => T(!0),
            style: Ae
          },
          "添加 MCP"
        )
      )
    ),
    O.length === 0 ? n.createElement(m, {
      description: "该专家暂无 MCP 客户端",
      image: m.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(i, {
      dataSource: O,
      renderItem: (d) => n.createElement(
        i.Item,
        {
          actions: [
            n.createElement(
              c,
              {
                key: "toggle",
                size: "small",
                onClick: () => X(d.key)
              },
              d.enabled ? "停用" : "启用"
            ),
            n.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: H ? n.createElement(H) : void 0,
                onClick: () => J(d.key)
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
            n.createElement("span", { style: { fontSize: 14 } }, "🔌"),
            n.createElement(x, { strong: !0 }, d.name || d.key),
            n.createElement(
              h,
              {
                color: d.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              d.enabled ? "启用" : "停用"
            ),
            n.createElement(
              h,
              { color: "purple", style: { fontSize: 10 } },
              d.transport
            )
          ),
          d.description ? n.createElement(
            V,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            d.description
          ) : null,
          d.tools && d.tools.length > 0 ? n.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "#8c8c8c" } },
            `提供 ${d.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    n.createElement(
      v,
      {
        open: M,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => T(!1),
        onOk: P,
        confirmLoading: w,
        okText: "创建",
        width: 560
      },
      n.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      n.createElement(L, {
        value: Q,
        onChange: (d) => C(d.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function Dn({ agentId: e }) {
  const t = E().React, { useState: a, useEffect: n, useCallback: l, useRef: r } = t, {
    Card: s,
    InputNumber: i,
    Input: h,
    Select: c,
    Switch: m,
    Button: I,
    Spin: v,
    Space: f,
    Typography: D,
    Divider: b,
    message: A
  } = E().antd, { SaveOutlined: _ } = E().antdIcons || {}, { Text: H } = D, [x, V] = a(!0), [L, O] = a(!1), j = r(null), [U, g] = a(60), [M, T] = a(""), [Q, C] = a(!0), [w, u] = a(30), [R, X] = a("zh"), [J, P] = a("UTC"), [d, S] = a(!0), [p, ne] = a(100), [F, Y] = a(!0), [Z, G] = a(3), [$, le] = a(1), [y, ae] = a(!0), [ue, ve] = a(3), [K, ce] = a(2), [B, re] = a(60), [oe, te] = a(1), [W, pe] = a(0), [me, Ie] = a(1), [Te, k] = a(0), [se, ge] = a(30), [we, Se] = a(50), [Ce, $e] = a("light"), [Ue, Oe] = a("scroll"), [Fe, He] = a("remelight"), [je, Le] = a("AUTO"), De = l(async () => {
    var z, ke, xe, be, ze, Re;
    V(!0);
    try {
      const [ye, Je, at] = await Promise.all([
        Pn(e),
        On(e).catch(() => "zh"),
        An().catch(() => "UTC")
      ]);
      j.current = ye, g(ye.shell_command_timeout ?? 60), T(ye.shell_command_executable ?? "");
      const Ve = ye.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      C(Ve.enabled ?? !0), u(Ve.timeout_seconds ?? 30), X(Je), P(at);
      const We = ye.loop ?? {};
      S(((z = We.iteration) == null ? void 0 : z.enabled) ?? !0), ne(((ke = We.iteration) == null ? void 0 : ke.max_iterations) ?? ye.max_iters ?? 100), Y(((xe = We.doom_loop) == null ? void 0 : xe.enabled) ?? !0), G(((be = We.doom_loop) == null ? void 0 : be.window_size) ?? 3), le(((ze = We.doom_loop) == null ? void 0 : ze.similarity_threshold) ?? 1), ae(ye.llm_retry_enabled ?? !0), ve(ye.llm_max_retries ?? 3), ce(ye.llm_backoff_base ?? 2), re(ye.llm_backoff_cap ?? 60), te(ye.llm_max_concurrent ?? 1), pe(ye.llm_max_qpm ?? 0), Ie(ye.llm_rate_limit_pause ?? 1), k(ye.llm_rate_limit_jitter ?? 0), ge(ye.llm_acquire_timeout ?? 30), Se(ye.history_max_length ?? 50), $e(ye.context_manager_backend ?? "light"), Oe(((Re = ye.light_context_config) == null ? void 0 : Re.strategy) ?? "scroll"), He(ye.memory_manager_backend ?? "remelight"), Le(ye.approval_level ?? "AUTO");
    } catch (ye) {
      A.error(ye.message || "加载运行配置失败");
    } finally {
      V(!1);
    }
  }, [e]);
  n(() => {
    De();
  }, [De]);
  const Ge = async () => {
    var ke, xe;
    const z = j.current;
    if (z) {
      O(!0);
      try {
        const be = {
          ...z,
          max_iters: p,
          loop: {
            ...z.loop ?? {},
            iteration: { enabled: d, max_iterations: p },
            doom_loop: {
              enabled: F,
              window_size: Z,
              similarity_threshold: $,
              stages: ((xe = (ke = z.loop) == null ? void 0 : ke.doom_loop) == null ? void 0 : xe.stages) ?? []
            }
          },
          shell_command_timeout: U,
          shell_command_executable: M,
          auto_title_config: {
            enabled: Q,
            timeout_seconds: w
          },
          llm_retry_enabled: y,
          llm_max_retries: ue,
          llm_backoff_base: K,
          llm_backoff_cap: B,
          llm_max_concurrent: oe,
          llm_max_qpm: W,
          llm_rate_limit_pause: me,
          llm_rate_limit_jitter: Te,
          llm_acquire_timeout: se,
          history_max_length: we,
          context_manager_backend: Ce,
          light_context_config: {
            ...z.light_context_config ?? {},
            strategy: Ue
          },
          memory_manager_backend: Fe,
          approval_level: je
        };
        await _n(e, be), j.current = be, R && await Mn(e, R).catch(() => {
        }), J && await Rn(J).catch(() => {
        }), A.success("运行配置已保存");
      } catch (be) {
        A.error(be.message || "保存运行配置失败");
      } finally {
        O(!1);
      }
    }
  };
  if (x)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(v, { size: "large" })
    );
  const q = (z, ke, xe) => t.createElement(
    "div",
    { style: jt },
    t.createElement("div", { style: qe }, z),
    ke,
    xe ? t.createElement(
      H,
      { type: "secondary", style: Nt },
      xe
    ) : null
  ), ie = (z, ke, xe, be) => t.createElement(
    "div",
    { style: Dt },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: qe }, z),
      ke
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: qe }, xe),
      be
    )
  );
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    t.createElement(
      "div",
      { style: Ne },
      "基础设置"
    ),
    ie(
      "Shell 命令超时 (秒)",
      t.createElement(i, {
        min: 1,
        value: U,
        onChange: (z) => g(z ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(h, {
        value: M,
        onChange: (z) => T(z.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    ie(
      "语言",
      t.createElement(c, {
        value: R,
        onChange: (z) => X(z),
        style: { width: "100%" },
        options: [
          { value: "zh", label: "中文" },
          { value: "en", label: "English" },
          { value: "id", label: "Bahasa Indonesia" },
          { value: "ru", label: "Русский" }
        ]
      }),
      "时区",
      t.createElement(c, {
        value: J,
        onChange: (z) => P(z),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (z, ke) => {
          var xe;
          return (((xe = ke == null ? void 0 : ke.label) == null ? void 0 : xe.toString()) || "").toLowerCase().includes(z.toLowerCase());
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
        ].map((z) => ({ value: z, label: z }))
      })
    ),
    ie(
      "自动生成会话标题",
      t.createElement(f, null, t.createElement(m, {
        checked: Q,
        onChange: (z) => C(z)
      })),
      "标题生成超时 (秒)",
      t.createElement(i, {
        min: 5,
        value: w,
        onChange: (z) => u(z ?? 30),
        style: { width: "100%" },
        disabled: !Q
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(b, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "审批级别"),
    q(
      "工具执行审批",
      t.createElement(c, {
        value: je,
        onChange: (z) => Le(z),
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
    t.createElement(b, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "迭代与循环"),
    q(
      "启用迭代限制",
      t.createElement(m, {
        checked: d,
        onChange: (z) => S(z)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    d ? q(
      "最大迭代次数",
      t.createElement(i, {
        min: 1,
        max: 500,
        value: p,
        onChange: (z) => ne(z ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    q(
      "启用重复循环保护",
      t.createElement(m, {
        checked: F,
        onChange: (z) => Y(z)
      }),
      "检测并阻止重复操作循环"
    ),
    F ? ie(
      "检测窗口大小",
      t.createElement(i, {
        min: 2,
        max: 20,
        value: Z,
        onChange: (z) => G(z ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(i, {
        min: 0,
        max: 1,
        step: 0.05,
        value: $,
        onChange: (z) => le(z ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(b, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "LLM 重试"),
    q(
      "启用 LLM 重试",
      t.createElement(m, {
        checked: y,
        onChange: (z) => ae(z)
      })
    ),
    ie(
      "最大重试次数",
      t.createElement(i, {
        min: 1,
        value: ue,
        onChange: (z) => ve(z ?? 3),
        style: { width: "100%" },
        disabled: !y
      }),
      "退避基数 (秒)",
      t.createElement(i, {
        min: 0.1,
        step: 0.1,
        value: K,
        onChange: (z) => ce(z ?? 2),
        style: { width: "100%" },
        disabled: !y
      })
    ),
    q(
      "退避上限 (秒)",
      t.createElement(i, {
        min: 0.5,
        step: 0.5,
        value: B,
        onChange: (z) => re(z ?? 60),
        style: { width: 200 },
        disabled: !y
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(b, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "LLM 限流"),
    ie(
      "最大并发数",
      t.createElement(i, {
        min: 1,
        value: oe,
        onChange: (z) => te(z ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(i, {
        min: 0,
        step: 10,
        value: W,
        onChange: (z) => pe(z ?? 0),
        style: { width: "100%" }
      })
    ),
    ie(
      "限流暂停时间 (秒)",
      t.createElement(i, {
        min: 1,
        step: 0.5,
        value: me,
        onChange: (z) => Ie(z ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(i, {
        min: 0,
        step: 0.5,
        value: Te,
        onChange: (z) => k(z ?? 0),
        style: { width: "100%" }
      })
    ),
    q(
      "获取超时 (秒)",
      t.createElement(i, {
        min: 10,
        step: 10,
        value: se,
        onChange: (z) => ge(z ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(b, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "上下文与记忆"),
    ie(
      "上下文管理后端",
      t.createElement(c, {
        value: Ce,
        onChange: (z) => $e(z),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(c, {
        value: Ue,
        onChange: (z) => Oe(z),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    ie(
      "记忆管理后端",
      t.createElement(c, {
        value: Fe,
        onChange: (z) => He(z),
        style: { width: "100%" },
        options: [
          { value: "remelight", label: "remelight" },
          { value: "adbpg", label: "adbpg" },
          { value: "none", label: "none (禁用)" }
        ]
      }),
      "历史消息最大长度",
      t.createElement(i, {
        min: 1,
        value: we,
        onChange: (z) => Se(z ?? 50),
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
          icon: _ ? t.createElement(_) : void 0,
          loading: L,
          onClick: Ge,
          style: Ae
        },
        "保存运行配置"
      )
    )
  );
}
function Nn({
  expert: e,
  open: t,
  onClose: a,
  onRefresh: n
}) {
  const l = E().React, { useState: r, useEffect: s, useCallback: i } = l, { Modal: h, Tabs: c, Spin: m, Typography: I } = E().antd, { SettingOutlined: v } = E().antdIcons || {}, { Text: f } = I, [D, b] = r([]), [A, _] = r(!1), [H, x] = r("heartbeat"), V = i(async () => {
    if (e) {
      _(!0);
      try {
        const U = await $n(e.agent.id);
        b(U);
      } catch {
        b([]);
      } finally {
        _(!1);
      }
    }
  }, [e]);
  if (s(() => {
    t && e && V();
  }, [t, e, V]), !e) return null;
  const { agent: L } = e, O = () => {
    V(), n();
  }, j = [
    {
      key: "heartbeat",
      label: "心跳",
      children: l.createElement(Ln, {
        agentId: L.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: A ? l.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        l.createElement(m, { size: "large" })
      ) : l.createElement(Ut, {
        agentId: L.id,
        systemPromptFiles: D,
        onRefresh: O
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((U) => U.enabled !== !1).length})`,
      children: l.createElement(Bn, {
        agentId: L.id,
        onRefresh: n
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: l.createElement(jn, {
        agentId: L.id,
        onRefresh: n,
        isActive: H === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: l.createElement(Dn, {
        agentId: L.id
      })
    }
  ];
  return l.createElement(
    h,
    {
      open: t,
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        v ? l.createElement(v, { style: { fontSize: 18 } }) : null,
        l.createElement("span", null, `配置 - ${L.name}`),
        l.createElement(
          f,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          L.id
        )
      ),
      onCancel: a,
      footer: null,
      width: 800,
      centered: !0,
      styles: {
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
          paddingTop: 0
        }
      }
    },
    l.createElement(c, {
      items: j,
      activeKey: H,
      onChange: (U) => x(U),
      size: "small",
      tabBarStyle: { marginBottom: 16, sticky: 0 }
    })
  );
}
function Un({
  expert: e,
  onClick: t,
  onSummon: a,
  onConfigure: n
}) {
  const l = E().React, { Card: r, Tag: s, Badge: i, Typography: h, Spin: c, Button: m, Tooltip: I } = E().antd, { Text: v } = h, { ThunderboltOutlined: f, SettingOutlined: D } = E().antdIcons || {}, { agent: b, skills: A, mcps: _, loading: H } = e, x = b.enabled, V = A.filter((j) => j.enabled !== !1).map((j) => j.name), L = _.map((j) => j.name || j.key), O = b.active_model ? `${b.active_model.provider_id}/${b.active_model.model}` : null;
  return l.createElement(
    r,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: x ? void 0 : "#d9d9d9",
        opacity: x ? 1 : 0.7,
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column"
      },
      bodyStyle: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flex: 1
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
        l.createElement(Be, { name: b.name, size: 36 }),
        l.createElement(
          "div",
          null,
          l.createElement(
            v,
            { strong: !0, style: { fontSize: 15 } },
            b.name
          ),
          l.createElement(
            "div",
            {
              style: {
                fontSize: 11,
                color: "#bfbfbf",
                fontFamily: "monospace"
              }
            },
            b.id
          )
        )
      ),
      l.createElement(i, {
        status: x ? "success" : "default",
        text: x ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    b.description ? l.createElement(
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
      gt(b.description, l)
    ) : l.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    O ? l.createElement(
      "div",
      { style: { marginBottom: 8 } },
      l.createElement(
        s,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${O}`
      )
    ) : null,
    // Skills
    H ? l.createElement(c, { size: "small" }) : l.createElement(
      "div",
      { style: { marginBottom: 6 } },
      l.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${V.length})`
      ),
      l.createElement(wt, {
        items: V,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !H && L.length > 0 ? l.createElement(
      "div",
      { style: { marginTop: "auto" } },
      l.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${L.length})`
      ),
      l.createElement(wt, {
        items: L,
        max: 3,
        color: "purple"
      })
    ) : null,
    // Bottom bar: gear icon (left) + summon button (right)
    l.createElement(
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
      l.createElement(
        I,
        { title: "配置专家", placement: "top" },
        l.createElement(
          m,
          {
            type: "text",
            size: "small",
            icon: D ? l.createElement(D, {
              style: { fontSize: 16, color: "#8c8c8c" }
            }) : void 0,
            onClick: (j) => {
              j.stopPropagation(), n && n();
            }
          }
        )
      ),
      // Summon button (bottom-right)
      l.createElement(
        m,
        {
          type: "primary",
          size: "small",
          icon: f ? l.createElement(f) : void 0,
          disabled: !x,
          onClick: (j) => {
            j.stopPropagation(), a && a();
          },
          style: Ae
        },
        "召唤专家"
      )
    )
  );
}
function Fn({
  expert: e,
  open: t,
  onClose: a,
  onRefresh: n
}) {
  const l = E().React, {
    Drawer: r,
    Descriptions: s,
    Tag: i,
    Typography: h,
    Space: c,
    Button: m,
    Empty: I,
    Tabs: v,
    List: f,
    Spin: D,
    Modal: b,
    message: A
  } = E().antd, { Text: _, Paragraph: H } = h, {
    EditOutlined: x,
    ThunderboltOutlined: V,
    FileTextOutlined: L,
    ToolOutlined: O,
    PlusOutlined: j
  } = E().antdIcons || {}, [U, g] = l.useState(!1), [M, T] = l.useState(
    []
  ), [Q, C] = l.useState(!1);
  if (!e) return null;
  const { agent: w, config: u, skills: R, mcps: X, loading: J } = e, P = R.filter((y) => y.enabled !== !1), d = (y) => {
    window.history.pushState({}, "", y), window.dispatchEvent(new PopStateEvent("popstate"));
  }, S = l.createElement(
    "div",
    null,
    l.createElement(
      s,
      { column: 1, bordered: !0, size: "small" },
      l.createElement(s.Item, { label: "专家名称" }, w.name),
      l.createElement(
        s.Item,
        { label: "专家 ID" },
        l.createElement("code", { style: { fontSize: 12 } }, w.id)
      ),
      l.createElement(
        s.Item,
        { label: "状态" },
        l.createElement(
          i,
          { color: w.enabled ? "green" : "default" },
          w.enabled ? "启用" : "停用"
        )
      ),
      l.createElement(
        s.Item,
        { label: "功能简介" },
        w.description ? gt(w.description, l) : "暂无描述"
      ),
      l.createElement(
        s.Item,
        { label: "使用模型" },
        w.active_model ? `${w.active_model.provider_id} / ${w.active_model.model}` : "使用全局默认模型"
      ),
      u != null && u.workspace_dir ? l.createElement(
        s.Item,
        { label: "工作区路径" },
        l.createElement(
          "code",
          { style: { fontSize: 11 } },
          u.workspace_dir
        )
      ) : null,
      u != null && u.approval_level ? l.createElement(
        s.Item,
        { label: "审批级别" },
        u.approval_level
      ) : null
    ),
    // System prompt files
    u != null && u.system_prompt_files && u.system_prompt_files.length > 0 ? l.createElement(
      "div",
      { style: { marginTop: 16 } },
      l.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8
          }
        },
        L ? l.createElement(L, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        l.createElement(_, { strong: !0 }, "系统提示词文件")
      ),
      l.createElement(
        c,
        { wrap: !0 },
        ...u.system_prompt_files.map(
          (y, ae) => l.createElement(
            i,
            {
              key: ae,
              icon: L ? l.createElement(L) : void 0,
              style: { fontSize: 12 }
            },
            y
          )
        )
      )
    ) : null
  ), p = async () => {
    g(!0), C(!0);
    try {
      const y = await pt();
      T(y);
    } catch (y) {
      A.error(y.message || "加载技能池失败");
    } finally {
      C(!1);
    }
  }, ne = async (y) => {
    let ae = 0, ue = 0;
    for (const ve of y)
      try {
        await At(w.id, ve), ae++;
      } catch {
        ue++;
      }
    ae > 0 ? (A.success(
      `成功添加 ${ae} 个技能${ue > 0 ? `，${ue} 个失败` : ""}`
    ), n()) : ue > 0 && A.error("添加技能失败"), g(!1);
  }, F = async (y) => {
    try {
      await Rt(w.id, y), A.success(`技能「${y}」已移除`), n();
    } catch (ae) {
      A.error(ae.message || "移除技能失败");
    }
  }, Y = async (y) => {
    try {
      await $t(w.id, y), A.success(`MCP「${y}」已移除`), n();
    } catch (ae) {
      A.error(ae.message || "移除 MCP 失败");
    }
  }, Z = J ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(D, { size: "large" })
  ) : l.createElement(
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
        _,
        { strong: !0 },
        `已启用技能 (${P.length})`
      ),
      l.createElement(
        m,
        {
          type: "primary",
          size: "small",
          icon: j ? l.createElement(j) : void 0,
          onClick: p
        },
        "从技能池添加"
      )
    ),
    P.length === 0 ? l.createElement(I, {
      description: "该专家暂无已启用的技能",
      image: I.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(f, {
      dataSource: P,
      renderItem: (y) => l.createElement(
        f.Item,
        {
          actions: [
            l.createElement(
              m,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => F(y.name)
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
            y.emoji ? l.createElement(
              "span",
              { style: { fontSize: 16 } },
              y.emoji
            ) : null,
            l.createElement(_, { strong: !0 }, y.name),
            y.version_text ? l.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${y.version_text}`
            ) : null
          ),
          y.description ? l.createElement(
            H,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            y.description
          ) : null,
          y.tags && y.tags.length > 0 ? l.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...y.tags.map(
              (ae, ue) => l.createElement(
                i,
                {
                  key: ue,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                ae
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    l.createElement(Bt, {
      open: U,
      onClose: () => g(!1),
      poolSkills: M,
      installedSkillNames: P.map((y) => y.name),
      loading: Q,
      onInstall: ne
    })
  ), G = J ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(D, { size: "large" })
  ) : l.createElement(
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
        _,
        { strong: !0 },
        `MCP 客户端 (${X.length})`
      ),
      l.createElement(
        m,
        {
          type: "primary",
          size: "small",
          icon: j ? l.createElement(j) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${w.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    X.length === 0 ? l.createElement(I, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: I.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(f, {
      dataSource: X,
      renderItem: (y) => l.createElement(
        f.Item,
        {
          actions: [
            l.createElement(
              m,
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
            l.createElement(
              "span",
              { style: { fontSize: 14 } },
              "🔌"
            ),
            l.createElement(
              _,
              { strong: !0 },
              y.name || y.key
            ),
            l.createElement(
              i,
              {
                color: y.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              y.enabled ? "启用" : "停用"
            ),
            l.createElement(
              i,
              { color: "purple", style: { fontSize: 10 } },
              y.transport
            )
          ),
          y.description ? l.createElement(
            H,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            y.description
          ) : null,
          y.tools && y.tools.length > 0 ? l.createElement(
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
  ), $ = u != null && u.tools ? l.createElement(
    "div",
    { style: { padding: 16 } },
    l.createElement(
      "div",
      { style: { marginBottom: 12 } },
      l.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8
          }
        },
        O ? l.createElement(O, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        l.createElement(_, { strong: !0 }, "工具配置")
      ),
      l.createElement(
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
        JSON.stringify(u.tools, null, 2)
      )
    )
  ) : l.createElement(I, {
    description: "暂无工具配置",
    image: I.PRESENTED_IMAGE_SIMPLE
  }), le = [
    { key: "basic", label: "基本信息", children: S },
    {
      key: "skills",
      label: `技能 (${P.length})`,
      children: Z
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: l.createElement(Wn, {
        skills: P,
        agentId: w.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: l.createElement(Ut, {
        agentId: w.id,
        systemPromptFiles: (u == null ? void 0 : u.system_prompt_files) || [],
        onRefresh: () => n()
      })
    },
    { key: "mcp", label: `MCP (${X.length})`, children: G },
    { key: "tools", label: "工具配置", children: $ }
  ];
  return l.createElement(
    r,
    {
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        l.createElement(Be, { name: w.name, size: 28 }),
        l.createElement("span", null, w.name)
      ),
      open: t,
      onClose: a,
      width: 560,
      extra: l.createElement(
        c,
        null,
        l.createElement(
          m,
          {
            size: "small",
            icon: x ? l.createElement(x) : void 0,
            onClick: () => {
              a();
              try {
                const y = E();
                y.setSelectedAgent && y.setSelectedAgent(w.id);
              } catch (y) {
                console.warn("[ugsci] Failed to set selected agent:", y);
              }
              setTimeout(() => d("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        l.createElement(
          m,
          {
            type: "primary",
            size: "small",
            icon: V ? l.createElement(V) : void 0,
            onClick: () => {
              a();
              try {
                const y = E();
                y.setSelectedAgent && y.setSelectedAgent(w.id);
              } catch (y) {
                console.warn("[ugsci] Failed to set selected agent:", y);
              }
              setTimeout(() => d("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    l.createElement(v, {
      items: le,
      defaultActiveKey: "basic"
    })
  );
}
function Hn({
  open: e,
  onClose: t,
  onCreated: a
}) {
  const n = E().React, { useState: l } = n, {
    Modal: r,
    Card: s,
    Tag: i,
    Input: h,
    Row: c,
    Col: m,
    Spin: I,
    message: v,
    Typography: f
  } = E().antd, { Text: D } = f, { FileAddOutlined: b } = E().antdIcons || {}, [A, _] = l(!1), [H, x] = l(""), [V, L] = l(!1), O = async (g, M) => {
    _(!0);
    try {
      const T = await ee("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: g || "新专家",
          description: M || "",
          skill_names: []
        })
      });
      await tt(
        T.id,
        "AGENTS.md",
        `# ${g || "新专家"}

请在此处编写该专家的系统提示词。
`
      ), v.success("专家「" + (g || "新专家") + "」创建成功"), L(!1), setTimeout(() => {
        t(), a();
      }, 0);
    } catch (T) {
      v.error(T.message || "创建专家失败");
    } finally {
      _(!1);
    }
  }, j = st.filter((g) => {
    if (!H.trim()) return !0;
    const M = H.toLowerCase();
    return g.name.toLowerCase().includes(M) || g.description.toLowerCase().includes(M) || g.category.toLowerCase().includes(M);
  }), U = async (g) => {
    _(!0);
    try {
      const M = await ee("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: g.name,
          description: g.description,
          skill_names: g.recommendedSkills
        })
      });
      await tt(M.id, "AGENTS.md", g.systemPrompt);
      const T = await nt(M.id);
      T.approval_level = g.approvalLevel, await ee(`/agents/${encodeURIComponent(M.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(T)
      }), v.success(`专家「${g.name}」创建成功`), t(), a();
    } catch (M) {
      v.error(M.message || "创建专家失败");
    } finally {
      _(!1);
    }
  };
  return n.createElement(
    n.Fragment,
    null,
    n.createElement(
      r,
      {
        open: e,
        onCancel: t,
        footer: null,
        title: "选择专家模板",
        width: 800,
        maskClosable: !0,
        keyboard: !0
      },
      n.createElement(
        "div",
        { style: { marginBottom: 16 } },
        n.createElement(h, {
          placeholder: "搜索模板名称或类别...",
          value: H,
          onChange: (g) => x(g.target.value),
          allowClear: !0
        })
      ),
      A ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        n.createElement(I, { size: "large" }),
        n.createElement(
          "div",
          { style: { marginTop: 12, color: "#8c8c8c" } },
          "正在创建专家..."
        )
      ) : n.createElement(
        c,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        H.trim() ? null : n.createElement(
          m,
          { xs: 24, sm: 12 },
          n.createElement(
            s,
            {
              hoverable: !0,
              size: "small",
              onClick: () => L(!0),
              style: {
                cursor: "pointer",
                height: "100%",
                border: "2px dashed #d9d9d9",
                background: "#fafafa"
              }
            },
            n.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 8
                }
              },
              n.createElement(
                "span",
                { style: { fontSize: 28, color: "#8c8c8c" } },
                b ? n.createElement(b) : "📝"
              ),
              n.createElement(
                "div",
                { style: { flex: 1 } },
                n.createElement(
                  D,
                  { strong: !0, style: { fontSize: 15 } },
                  "从空白模版开始创建"
                ),
                n.createElement(
                  "div",
                  null,
                  n.createElement(
                    i,
                    { color: "default", style: { fontSize: 10 } },
                    "空白"
                  )
                )
              )
            ),
            n.createElement(
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
        ...j.map(
          (g) => n.createElement(
            m,
            { key: g.id, xs: 24, sm: 12 },
            n.createElement(
              s,
              {
                hoverable: !0,
                size: "small",
                onClick: () => U(g),
                style: { cursor: "pointer", height: "100%" }
              },
              n.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 8
                  }
                },
                n.createElement(Be, {
                  name: g.name,
                  size: 40
                }),
                n.createElement(
                  "div",
                  { style: { flex: 1 } },
                  n.createElement(
                    D,
                    { strong: !0, style: { fontSize: 15 } },
                    g.name
                  ),
                  n.createElement(
                    "div",
                    null,
                    n.createElement(
                      i,
                      { color: "blue", style: { fontSize: 10 } },
                      g.category
                    ),
                    g.approvalLevel === "MANUAL" ? n.createElement(
                      i,
                      { color: "orange", style: { fontSize: 10 } },
                      "需审批"
                    ) : null
                  )
                )
              ),
              n.createElement(
                "div",
                {
                  style: {
                    fontSize: 12,
                    color: "#595959",
                    lineHeight: 1.5
                  }
                },
                gt(g.description, n)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    n.createElement(Gn, {
      open: V,
      onCancel: () => L(!1),
      onCreate: O
    })
  );
}
function Gn({
  open: e,
  onCancel: t,
  onCreate: a
}) {
  const n = E().React, { useState: l, useEffect: r } = n, { Modal: s, Input: i, message: h } = E().antd, [c, m] = l(""), [I, v] = l(""), [f, D] = l(!1);
  return r(() => {
    e && (m(""), v(""), D(!1));
  }, [e]), n.createElement(
    s,
    {
      open: e,
      title: "从空白模版创建专家",
      onCancel: t,
      onOk: () => {
        if (!c.trim()) {
          h.warning("请输入专家名称");
          return;
        }
        D(!0), Promise.resolve(a(c.trim(), I.trim())).finally(() => {
          D(!1);
        });
      },
      okText: "创建",
      cancelText: "取消",
      okButtonProps: { loading: f },
      maskClosable: !0,
      keyboard: !0
    },
    n.createElement(
      "div",
      { style: { marginBottom: 16 } },
      n.createElement(
        "div",
        { style: { fontSize: 13, marginBottom: 6, color: "#595959" } },
        "专家名称"
      ),
      n.createElement(i, {
        placeholder: "输入专家名称",
        value: c,
        onChange: (b) => m(b.target.value),
        maxLength: 50
      })
    ),
    n.createElement(
      "div",
      null,
      n.createElement(
        "div",
        { style: { fontSize: 13, marginBottom: 6, color: "#595959" } },
        "专家描述（可选）"
      ),
      n.createElement(i.TextArea, {
        placeholder: "简要描述该专家的职责和能力...",
        value: I,
        onChange: (b) => v(b.target.value),
        rows: 3,
        maxLength: 200
      })
    )
  );
}
function Ut({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: a
}) {
  const n = E().React, { useState: l, useEffect: r, useCallback: s } = n, {
    List: i,
    Tag: h,
    Switch: c,
    Button: m,
    Modal: I,
    Input: v,
    Spin: f,
    Empty: D,
    message: b,
    Typography: A
  } = E().antd, { FileTextOutlined: _, PlusOutlined: H, EditOutlined: x, ReloadOutlined: V } = E().antdIcons || {}, { Text: L } = A, [O, j] = l([]), [U, g] = l(!0), [M, T] = l(
    t || []
  ), [Q, C] = l(!1), [w, u] = l(null), [R, X] = l(""), [J, P] = l(""), [d, S] = l(!1), p = s(async () => {
    g(!0);
    try {
      const G = await En(e);
      j(G);
    } catch (G) {
      b.error(G.message || "加载记忆文件失败"), j([]);
    } finally {
      g(!1);
    }
  }, [e]);
  r(() => {
    p();
  }, [p]), r(() => {
    T(t || []);
  }, [t]);
  const ne = async (G, $) => {
    const le = new Set(M);
    if ($)
      le.add(G);
    else {
      if (xt.includes(G) && G === "AGENTS.md") {
        b.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      le.delete(G);
    }
    const y = Array.from(le);
    T(y);
    try {
      await St(e, y), b.success($ ? "已启用记忆文件" : "已停用记忆文件"), a();
    } catch (ae) {
      b.error(ae.message || "更新失败"), T(t || []);
    }
  }, F = async (G) => {
    try {
      const $ = await ee(
        `/workspace/files/${encodeURIComponent(G)}`,
        { headers: { "X-Agent-Id": e } }
      );
      u(G), X($.content || ""), C(!0);
    } catch ($) {
      b.error($.message || "读取文件失败");
    }
  }, Y = () => {
    u(null), X(""), P(""), C(!0);
  }, Z = async () => {
    const G = w || J.trim();
    if (!G) {
      b.warning("请输入文件名");
      return;
    }
    const $ = G.endsWith(".md") ? G : `${G}.md`;
    S(!0);
    try {
      if (await tt(e, $, R), !w && !M.includes($)) {
        const le = [...M, $];
        T(le), await St(e, le);
      }
      b.success("保存成功"), C(!1), p(), a();
    } catch (le) {
      b.error(le.message || "保存失败");
    } finally {
      S(!1);
    }
  };
  return U ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(f, { size: "large" })
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
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        _ ? n.createElement(_, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(
          L,
          { strong: !0 },
          `记忆文件 (${O.length})`
        ),
        n.createElement(
          L,
          { type: "secondary", style: { fontSize: 12 } },
          `· 已挂载 ${M.length} 个到专家记忆`
        )
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          m,
          {
            size: "small",
            icon: V ? n.createElement(V) : void 0,
            onClick: p
          },
          "刷新"
        ),
        n.createElement(
          m,
          {
            type: "primary",
            size: "small",
            icon: H ? n.createElement(H) : void 0,
            onClick: Y
          },
          "新建记忆文件"
        )
      )
    ),
    O.length === 0 ? n.createElement(D, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: D.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(i, {
      dataSource: O,
      renderItem: (G) => {
        const $ = M.includes(G.filename), le = xt.includes(G.filename);
        return n.createElement(
          i.Item,
          {
            actions: [
              n.createElement(
                m,
                {
                  type: "link",
                  size: "small",
                  icon: x ? n.createElement(x) : void 0,
                  onClick: () => F(G.filename)
                },
                "编辑"
              )
            ]
          },
          n.createElement(i.Item.Meta, {
            avatar: n.createElement(_, {
              style: {
                fontSize: 20,
                color: $ ? "#1677ff" : "#bfbfbf"
              }
            }),
            title: n.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              n.createElement(L, null, G.filename),
              le ? n.createElement(
                h,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : n.createElement(
                h,
                { color: "cyan", style: { fontSize: 10 } },
                "记忆库"
              )
            ),
            description: n.createElement(
              "div",
              { style: { fontSize: 12 } },
              `${(G.size / 1024).toFixed(1)} KB · 修改于 ${new Date(G.modified_time).toLocaleString()}`
            )
          }),
          n.createElement(c, {
            checked: $,
            size: "small",
            onChange: (y) => ne(G.filename, y)
          })
        );
      }
    }),
    // Edit/New file modal
    n.createElement(
      I,
      {
        open: Q,
        onCancel: () => C(!1),
        title: w ? `编辑 ${w}` : "新建记忆文件",
        width: 700,
        onOk: Z,
        confirmLoading: d,
        okText: "保存"
      },
      w ? null : n.createElement(
        "div",
        { style: { marginBottom: 12 } },
        n.createElement(v, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: J,
          onChange: (G) => P(G.target.value),
          addonAfter: J.endsWith(".md") ? "" : ".md"
        })
      ),
      n.createElement(v.TextArea, {
        value: R,
        onChange: (G) => X(G.target.value),
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
function Wn({
  skills: e,
  agentId: t
}) {
  const a = E().React, { useMemo: n } = a, {
    List: l,
    Tag: r,
    Typography: s,
    Empty: i,
    Button: h,
    message: c
  } = E().antd, { ThunderboltOutlined: m, CopyOutlined: I } = E().antdIcons || {}, { Text: v } = s, f = n(() => fn(e), [e]), D = (A) => {
    try {
      const _ = E();
      _.setSelectedAgent && _.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", A);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, b = (A) => {
    var _;
    (_ = navigator.clipboard) == null || _.writeText(A).then(() => {
      c.success("已复制到剪贴板");
    });
  };
  return f.length === 0 ? a.createElement(i, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: i.PRESENTED_IMAGE_SIMPLE
  }) : a.createElement(
    "div",
    null,
    a.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12
        }
      },
      m ? a.createElement(m, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      a.createElement(
        v,
        { strong: !0 },
        `推荐提问 (${f.length})`
      ),
      a.createElement(
        v,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    a.createElement(l, {
      dataSource: f,
      renderItem: (A, _) => a.createElement(
        l.Item,
        {
          actions: [
            a.createElement(
              h,
              {
                type: "link",
                size: "small",
                icon: I ? a.createElement(I) : void 0,
                onClick: () => b(A)
              },
              "复制"
            )
          ]
        },
        a.createElement(l.Item.Meta, {
          avatar: a.createElement(
            r,
            { color: "blue", style: { borderRadius: "50%" } },
            `${_ + 1}`
          ),
          title: a.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => D(A)
            },
            A
          ),
          description: a.createElement(
            v,
            { type: "secondary", style: { fontSize: 12 } },
            "点击直接发送给专家"
          )
        })
      )
    })
  );
}
function Jn() {
  var Te;
  const e = E().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, {
    Spin: r,
    Empty: s,
    Input: i,
    Button: h,
    message: c,
    Row: m,
    Col: I,
    Tabs: v,
    Modal: f,
    Typography: D
  } = E().antd, {
    ReloadOutlined: b,
    PlusOutlined: A,
    SearchOutlined: _,
    TeamOutlined: H,
    UserOutlined: x
  } = E().antdIcons || {}, { Text: V, Paragraph: L } = D, [O, j] = t([]), [U, g] = t(!0), [M, T] = t(!1), [Q, C] = t(null), [w, u] = t(""), [R, X] = t(!1), [J, P] = t("experts"), [d, S] = t(
    null
  ), [p, ne] = t(""), [F, Y] = t(!1), [Z, G] = t(!1), [$, le] = t(null), [y, ae] = t([]), ue = n(async () => {
    g(!0);
    try {
      const k = await dt(), se = await Promise.all(
        k.map(async (ge) => {
          try {
            const [we, Se, Ce] = await Promise.all([
              nt(ge.id).catch(() => null),
              ut(ge.id).catch(() => []),
              yt(ge.id).catch(() => [])
            ]);
            return {
              agent: ge,
              config: we,
              skills: Se,
              mcps: Ce,
              loading: !1
            };
          } catch {
            return {
              agent: ge,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      j(se), ae(k);
    } catch (k) {
      c.error(k.message || "加载专家列表失败"), j([]);
    } finally {
      g(!1);
    }
  }, []);
  a(() => {
    ue();
  }, [ue]), a(() => {
    if ($ && Z) {
      const k = O.find(
        (se) => se.agent.id === $.agent.id
      );
      k && k !== $ && le(k);
    }
  }, [O, $, Z]);
  const ve = n(
    async (k) => {
      var Se;
      const se = k.coordinatorName || ((Se = k.members[0]) == null ? void 0 : Se.name);
      if (!se) {
        c.error("无法确定协调者专家");
        return;
      }
      const ge = et(y, se);
      if (!ge) {
        c.error(`未找到协调者专家「${se}」，请先创建该专家`);
        return;
      }
      if (/\{.+?\}/.test(k.taskTemplate)) {
        ne(""), S(k);
        return;
      }
      await K(k, ge, k.taskTemplate);
    },
    [y, c]
  ), K = n(
    async (k, se, ge) => {
      var we;
      Y(!0);
      try {
        const Se = un(k), Ce = ge ? Se.replace(k.taskTemplate, ge) : Se, $e = E();
        $e.setSelectedAgent && $e.setSelectedAgent(se), await dn(se, Ce), c.success(
          `团队任务已发起，协调者：${k.coordinatorName || ((we = k.members[0]) == null ? void 0 : we.name)}`
        ), S(null), ce("/chat");
      } catch (Se) {
        c.error(Se.message || "发起团队任务失败");
      } finally {
        Y(!1);
      }
    },
    [c]
  ), ce = (k) => {
    window.history.pushState({}, "", k), window.dispatchEvent(new PopStateEvent("popstate"));
  }, B = n((k) => {
    C(k), T(!0);
  }, []), re = n((k) => {
    le(k), G(!0);
  }, []), oe = n(
    (k) => {
      if (!k.agent.enabled) {
        c.warning(`专家「${k.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const se = E();
        se.setSelectedAgent && se.setSelectedAgent(k.agent.id);
      } catch (se) {
        console.warn("[ugsci] Failed to set selected agent:", se);
      }
      c.success(`已召唤专家「${k.agent.name}」，正在跳转至对话...`), ce("/chat");
    },
    [c]
  ), te = l(() => {
    if (!w.trim()) return O;
    const k = w.toLowerCase();
    return O.filter(
      (se) => {
        var ge;
        return se.agent.name.toLowerCase().includes(k) || ((ge = se.agent.description) == null ? void 0 : ge.toLowerCase().includes(k)) || se.agent.id.toLowerCase().includes(k) || se.skills.some((we) => we.name.toLowerCase().includes(k));
      }
    );
  }, [O, w]), W = O.filter((k) => k.agent.enabled).length, pe = O.reduce(
    (k, se) => k + se.skills.filter((ge) => ge.enabled !== !1).length,
    0
  ), me = O.reduce((k, se) => k + se.mcps.length, 0), Ie = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        x ? e.createElement(x, { style: { fontSize: 14 } }) : null,
        "专家列表"
      ),
      children: e.createElement(
        "div",
        null,
        // Search bar
        e.createElement(
          "div",
          { style: { marginBottom: 16 } },
          e.createElement(i, {
            placeholder: "搜索专家名称、描述或技能...",
            prefix: _ ? e.createElement(_) : void 0,
            value: w,
            onChange: (k) => u(k.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        U ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(r, { size: "large" })
        ) : te.length === 0 ? e.createElement(s, {
          description: w ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          m,
          { gutter: [12, 12], align: "stretch" },
          ...te.map(
            (k) => e.createElement(
              I,
              {
                key: k.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(Un, {
                expert: k,
                onClick: () => B(k),
                onSummon: () => oe(k),
                onConfigure: () => re(k)
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
        H ? e.createElement(H, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(yn, {
        agents: y,
        onLaunch: ve
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(lt, {
      title: "专家",
      subtitle: `共 ${O.length} 位专家（${W} 位启用）· ${pe} 个技能 · ${me} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          h,
          {
            icon: b ? e.createElement(b) : void 0,
            onClick: ue,
            loading: U
          },
          "刷新"
        ),
        e.createElement(
          h,
          {
            type: "primary",
            icon: A ? e.createElement(A) : void 0,
            onClick: () => X(!0),
            style: Ae
          },
          "创建专家"
        )
      )
    }),
    e.createElement(v, {
      items: Ie,
      activeKey: J,
      onChange: (k) => P(k)
    }),
    // Drawer
    e.createElement(Fn, {
      expert: Q,
      open: M,
      onClose: () => T(!1),
      onRefresh: () => ue()
    }),
    // Template Modal
    e.createElement(Hn, {
      open: R,
      onClose: () => X(!1),
      onCreated: () => ue()
    }),
    // Config Modal (gear icon)
    e.createElement(Nn, {
      expert: $,
      open: Z,
      onClose: () => G(!1),
      onRefresh: () => ue()
    }),
    // Team Launch Modal (for filling placeholders)
    d ? e.createElement(
      f,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(ft, {
            members: d.members.map((k) => k.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${d.name}`
          )
        ),
        onCancel: () => S(null),
        onOk: () => {
          var we;
          const k = d.coordinatorName || ((we = d.members[0]) == null ? void 0 : we.name), se = k ? et(y, k) : null;
          if (!se) {
            c.error("无法找到协调者专家");
            return;
          }
          let ge = d.taskTemplate;
          p.trim() && (ge = p.trim()), K(d, se, ge);
        },
        confirmLoading: F,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          V,
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
          d.taskTemplate
        )
      ),
      e.createElement(
        "div",
        null,
        e.createElement(
          V,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "输入具体任务描述（替换上面的占位符内容）："
        ),
        e.createElement(i.TextArea, {
          value: p,
          onChange: (k) => ne(k.target.value),
          rows: 5,
          placeholder: d.taskTemplate,
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
          V,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${d.coordinatorName || ((Te = d.members[0]) == null ? void 0 : Te.name) || "—"} · 成员: ${d.members.map((k) => k.name).join("、")}`
        )
      )
    ) : null
  );
}
function Kn({
  mcp: e,
  onClick: t,
  onToggle: a,
  onDelete: n,
  onViewTools: l
}) {
  const r = E().React, { Card: s, Tag: i, Badge: h, Typography: c, Button: m } = E().antd, { Text: I } = c, {
    EyeOutlined: v,
    EyeInvisibleOutlined: f,
    DeleteOutlined: D,
    ToolOutlined: b
  } = E().antdIcons || {}, A = {
    stdio: "💻",
    streamable_http: "🌐",
    sse: "📡"
  };
  return e.transport === "streamable_http" || e.transport, r.createElement(
    s,
    {
      hoverable: !0,
      onClick: t,
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
      bodyStyle: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flex: 1
      }
    },
    r.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8
        }
      },
      r.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        r.createElement(
          "span",
          { style: { fontSize: 18 } },
          A[e.transport] || "🔌"
        ),
        r.createElement(
          I,
          { strong: !0, style: { fontSize: 14 } },
          e.name || e.key
        )
      ),
      r.createElement(h, {
        status: e.enabled ? "success" : "default",
        text: e.enabled ? "启用" : "停用"
      })
    ),
    e.description ? r.createElement(
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
          flex: "1 0 auto"
        }
      },
      e.description
    ) : r.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 8, minHeight: 36, flex: "1 0 auto" } },
      "暂无描述"
    ),
    r.createElement(
      "div",
      { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 } },
      r.createElement(
        i,
        { color: "purple", style: { fontSize: 11 } },
        e.transport
      ),
      e.tools && e.tools.length > 0 ? r.createElement(
        i,
        { color: "blue", style: { fontSize: 11 } },
        `${e.tools.length} 个工具`
      ) : r.createElement(i, { style: { fontSize: 11 } }, "全部工具"),
      e.url ? r.createElement(
        i,
        {
          color: "geekblue",
          style: {
            fontSize: 11,
            maxWidth: 200,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }
        },
        e.url
      ) : null
    ),
    // ── Action buttons (mirror console /mcp page) ──
    r.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 6,
          marginTop: "auto",
          paddingTop: 8,
          borderTop: "1px solid #f0f0f0"
        }
      },
      r.createElement(
        m,
        {
          size: "small",
          icon: b ? r.createElement(b) : void 0,
          onClick: l
        },
        "工具"
      ),
      r.createElement(
        m,
        {
          size: "small",
          icon: e.enabled ? f ? r.createElement(f) : void 0 : v ? r.createElement(v) : void 0,
          onClick: a
        },
        e.enabled ? "禁用" : "启用"
      ),
      r.createElement(
        m,
        {
          size: "small",
          danger: !0,
          icon: D ? r.createElement(D) : void 0,
          onClick: n
        },
        "删除"
      )
    )
  );
}
const it = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, Ft = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, Ht = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function Gt(e) {
  return Ye(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
function Ct(e) {
  return Ye(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function kt(e) {
  const t = e.map(encodeURIComponent).join(",");
  return Ye(`/ugsci/avatar/team/${t}`);
}
function Be({
  name: e,
  size: t = 32,
  borderRadius: a = "50%"
}) {
  const n = E().React, [l, r] = n.useState(0), s = l === 0 ? Ct(e) : `${Ct(e)}?_r=${l}`;
  return n.createElement("img", {
    src: s,
    alt: e,
    onError: () => {
      l < 1 && r(l + 1);
    },
    style: { width: t, height: t, borderRadius: a, objectFit: "cover", flexShrink: 0 }
  });
}
function ft({
  members: e,
  size: t = 32,
  borderRadius: a = "50%"
}) {
  const n = E().React, [l, r] = n.useState(0);
  if (!e || e.length === 0)
    return n.createElement("span", {
      style: { width: t, height: t, display: "inline-block" }
    });
  const s = e.slice(0, 5), i = l === 0 ? kt(s) : `${kt(s)}?_r=${l}`;
  return n.createElement("img", {
    src: i,
    alt: "team",
    onError: () => {
      l < 1 && r(l + 1);
    },
    style: { width: t, height: t, borderRadius: a, objectFit: "cover", flexShrink: 0 }
  });
}
async function Xn() {
  return ee("/ugsci/engines/list");
}
async function qn(e) {
  return ee("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function Vn(e, t) {
  return ee(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function Yn(e) {
  return ee(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function Qn() {
  return ee("/ugsci/engines/detect", {
    method: "POST"
  });
}
function Zn({
  engine: e,
  onClick: t
}) {
  const a = E().React, { Card: n, Tag: l, Typography: r } = E().antd, { Text: s } = r, i = e.status === "detected", h = Ft[e.category] || "📦", m = Ht.has(e.id) ? a.createElement("img", {
    src: Gt(e.id),
    alt: e.name,
    style: { width: 24, height: 24, objectFit: "contain" }
  }) : a.createElement("span", { style: { fontSize: 20 } }, h);
  return a.createElement(
    n,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        borderColor: i ? void 0 : "#d9d9d9",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column"
      },
      bodyStyle: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flex: 1
      }
    },
    a.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8
        }
      },
      a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        m,
        a.createElement(
          "div",
          null,
          a.createElement(
            s,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          a.createElement("br"),
          a.createElement(
            s,
            { type: "secondary", style: { fontSize: 11 } },
            e.vendor || "—"
          )
        )
      ),
      a.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" } },
        i ? a.createElement(
          l,
          { color: "success", style: { fontSize: 11 } },
          "✅ 已检测"
        ) : e.executable_path ? a.createElement(
          l,
          { color: "warning", style: { fontSize: 11 } },
          "⚠ 路径无效"
        ) : a.createElement(
          l,
          { style: { fontSize: 11 } },
          "🔧 待配置"
        ),
        e.is_default ? a.createElement(
          l,
          { color: "blue", style: { fontSize: 10 } },
          "默认"
        ) : e.is_custom ? a.createElement(
          l,
          { color: "purple", style: { fontSize: 10 } },
          "自定义"
        ) : null
      )
    ),
    a.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      a.createElement(
        s,
        { type: "secondary", style: { fontSize: 12 } },
        e.description || "暂无描述"
      )
    ),
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
      e.category ? a.createElement(
        l,
        { style: { fontSize: 11 } },
        it[e.category] || e.category
      ) : null,
      e.version ? a.createElement(
        l,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (I) => a.createElement(
          l,
          { key: I, color: "cyan", style: { fontSize: 10 } },
          I
        )
      )
    )
  );
}
function el() {
  const e = E().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, {
    Spin: r,
    Empty: s,
    Button: i,
    message: h,
    Row: c,
    Col: m,
    Drawer: I,
    Descriptions: v,
    Tag: f,
    Typography: D,
    Modal: b,
    Input: A,
    Select: _,
    Popconfirm: H,
    Space: x
  } = E().antd, {
    ReloadOutlined: V,
    SearchOutlined: L,
    PlusOutlined: O,
    EditOutlined: j,
    DeleteOutlined: U,
    CopyOutlined: g,
    ExperimentOutlined: M
  } = E().antdIcons || {}, { Text: T, Paragraph: Q } = D, [C, w] = t([]), [u, R] = t(!0), [X, J] = t(""), [P, d] = t(!1), [S, p] = t(null), [ne, F] = t(!1), [Y, Z] = t(null), [G, $] = t({}), [le, y] = t(!1), ae = n(async () => {
    R(!0);
    try {
      const W = await Xn();
      w(W.engines || []);
    } catch (W) {
      h.error(W.message || "加载引擎列表失败"), w([]);
    } finally {
      R(!1);
    }
  }, []);
  a(() => {
    ae();
  }, [ae]);
  const ue = l(() => {
    if (!X.trim()) return C;
    const W = X.toLowerCase();
    return C.filter(
      (pe) => {
        var me;
        return pe.name.toLowerCase().includes(W) || pe.vendor.toLowerCase().includes(W) || pe.category.toLowerCase().includes(W) || ((me = pe.description) == null ? void 0 : me.toLowerCase().includes(W));
      }
    );
  }, [C, X]);
  C.filter((W) => W.status === "detected").length;
  const ve = n((W) => {
    navigator.clipboard.writeText(W).then(() => h.success("路径已复制")).catch(() => h.error("复制失败"));
  }, []), K = n(() => {
    Z(null), $({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), F(!0);
  }, []), ce = n((W) => {
    Z(W), $({ ...W }), F(!0), d(!1);
  }, []), B = n(async () => {
    var W;
    if (!((W = G.name) != null && W.trim())) {
      h.warning("请输入引擎名称");
      return;
    }
    y(!0);
    try {
      Y ? (await Vn(Y.id, G), h.success("引擎已更新")) : (await qn(G), h.success("引擎已添加")), F(!1), ae();
    } catch (pe) {
      h.error(pe.message || "保存失败");
    } finally {
      y(!1);
    }
  }, [G, Y, ae]), re = n(
    async (W) => {
      try {
        await Yn(W), h.success("引擎已删除"), d(!1), ae();
      } catch (pe) {
        h.error(pe.message || "删除失败");
      }
    },
    [ae]
  ), oe = n(async () => {
    R(!0);
    try {
      const W = await Qn();
      w(W.engines || []), h.success("自动检测完成");
    } catch (W) {
      h.error(W.message || "检测失败");
    } finally {
      R(!1);
    }
  }, []), te = n(
    (W, pe, me) => {
      const Ie = G[pe] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          T,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          W
        ),
        me != null && me.select ? e.createElement(_, {
          value: Ie || void 0,
          onChange: (Te) => $((k) => ({ ...k, [pe]: Te })),
          style: { width: "100%" },
          options: me.select.options,
          allowClear: !0,
          placeholder: `选择${W}`
        }) : me != null && me.textarea ? e.createElement(A.TextArea, {
          value: Ie,
          onChange: (Te) => $((k) => ({ ...k, [pe]: Te.target.value })),
          rows: 3,
          placeholder: `输入${W}`
        }) : e.createElement(A, {
          value: Ie,
          onChange: (Te) => $((k) => ({ ...k, [pe]: Te.target.value })),
          placeholder: `输入${W}`
        })
      );
    },
    [G]
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
      e.createElement(A, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: L ? e.createElement(L) : void 0,
        value: X,
        onChange: (W) => J(W.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        i,
        {
          icon: V ? e.createElement(V) : void 0,
          onClick: oe,
          loading: u
        },
        "自动检测"
      ),
      e.createElement(
        i,
        {
          type: "primary",
          icon: O ? e.createElement(O) : void 0,
          onClick: K,
          style: Ae
        },
        "添加引擎"
      )
    ),
    // Content
    u ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(r, {
        size: "large",
        tip: "正在加载计算引擎..."
      })
    ) : ue.length === 0 ? e.createElement(s, {
      description: X ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      c,
      { gutter: [12, 12], align: "stretch" },
      ...ue.map(
        (W) => e.createElement(
          m,
          {
            key: W.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Zn, {
            engine: W,
            onClick: () => {
              p(W), d(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    S ? e.createElement(
      I,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            Ht.has(S.id) ? e.createElement("img", {
              src: Gt(S.id),
              alt: S.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              Ft[S.category] || "📦"
            )
          ),
          e.createElement("span", null, S.name)
        ),
        open: P,
        onClose: () => d(!1),
        width: 520,
        extra: e.createElement(
          x,
          null,
          e.createElement(
            i,
            {
              size: "small",
              icon: j ? e.createElement(j) : void 0,
              onClick: () => ce(S)
            },
            "编辑"
          ),
          S.is_default ? null : e.createElement(
            H,
            {
              title: "确认删除此引擎？",
              description: S.name,
              onConfirm: () => re(S.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              i,
              {
                size: "small",
                danger: !0,
                icon: U ? e.createElement(U) : void 0
              },
              "删除"
            )
          )
        )
      },
      e.createElement(
        v,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          v.Item,
          { label: "引擎名称" },
          S.name
        ),
        e.createElement(
          v.Item,
          { label: "厂商" },
          S.vendor || "—"
        ),
        e.createElement(
          v.Item,
          { label: "分类" },
          S.category ? it[S.category] || S.category : "—"
        ),
        e.createElement(
          v.Item,
          { label: "状态" },
          e.createElement(
            f,
            {
              color: S.status === "detected" ? "success" : S.status === "not_found" ? "error" : "default"
            },
            S.status === "detected" ? "✅ 已检测" : S.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          v.Item,
          { label: "版本" },
          S.version || "—"
        ),
        S.executable_path ? e.createElement(
          v.Item,
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
              S.executable_path
            ),
            e.createElement(
              i,
              {
                size: "small",
                type: "text",
                icon: g ? e.createElement(g) : void 0,
                onClick: () => ve(S.executable_path)
              }
            )
          )
        ) : null,
        S.install_dir ? e.createElement(
          v.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            S.install_dir
          )
        ) : null,
        // Display detected modules with paths
        S.modules && S.modules.length > 0 ? e.createElement(
          v.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...S.modules.map(
              (W) => e.createElement(
                "div",
                {
                  key: W,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  f,
                  { color: "cyan", style: { fontSize: 11 } },
                  W
                ),
                S.module_paths && S.module_paths[W] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  S.module_paths[W]
                ) : null
              )
            )
          )
        ) : null,
        S.license_server ? e.createElement(
          v.Item,
          { label: "许可证服务器" },
          S.license_server
        ) : null,
        e.createElement(
          v.Item,
          { label: "描述" },
          S.description || "—"
        )
      ),
      // Invocation hint
      S.invocation_hint ? e.createElement(
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
          T,
          { strong: !0, style: { fontSize: 13 } },
          "💡 调用方式"
        ),
        e.createElement(
          "div",
          { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
          S.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        S.is_default ? e.createElement(
          f,
          { color: "blue" },
          "默认引擎"
        ) : S.is_custom ? e.createElement(
          f,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      b,
      {
        title: Y ? "编辑引擎" : "添加计算引擎",
        open: ne,
        onOk: B,
        onCancel: () => F(!1),
        okText: Y ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: le,
        width: 560
      },
      e.createElement(
        "div",
        { style: { maxHeight: 480, overflow: "auto", paddingRight: 8 } },
        te("引擎名称 *", "name"),
        te("厂商", "vendor"),
        te("版本", "version"),
        te("可执行文件路径", "executable_path"),
        te("安装目录", "install_dir"),
        te("分类", "category", {
          select: {
            options: Object.entries(it).map(([W, pe]) => ({
              label: pe,
              value: W
            }))
          }
        }),
        te("描述", "description", { textarea: !0 }),
        te("调用方式提示", "invocation_hint", { textarea: !0 }),
        te("许可证服务器", "license_server")
      )
    )
  );
}
function tl() {
  const e = E().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, {
    Spin: r,
    Empty: s,
    Input: i,
    Button: h,
    message: c,
    Row: m,
    Col: I,
    Drawer: v,
    Descriptions: f,
    Tag: D,
    Typography: b,
    List: A,
    Tabs: _,
    Modal: H
  } = E().antd, {
    ReloadOutlined: x,
    PlusOutlined: V,
    SearchOutlined: L,
    ApiOutlined: O,
    RocketOutlined: j,
    ToolOutlined: U,
    DeleteOutlined: g,
    EyeOutlined: M,
    EyeInvisibleOutlined: T
  } = E().antdIcons || {}, { Text: Q } = b, { TextArea: C } = i, u = E().useSelectedAgent, R = u ? u() : null, X = (R == null ? void 0 : R.id) || "default", [J, P] = t([]), [d, S] = t(!0), [p, ne] = t(""), [F, Y] = t(!1), [Z, G] = t(null), [$, le] = t("mcp"), [y, ae] = t(!1), [ue, ve] = t(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [K, ce] = t(!1), [B, re] = t(!1), [oe, te] = t(null), [W, pe] = t(!1), [me, Ie] = t(null), [Te, k] = t([]), [se, ge] = t(!1), [we, Se] = t(""), Ce = n(async () => {
    S(!0);
    try {
      const q = await an(X);
      P(q);
    } catch (q) {
      c.error(q.message || "加载 MCP 列表失败"), P([]);
    } finally {
      S(!1);
    }
  }, [X]);
  a(() => {
    Ce();
  }, [Ce]);
  const $e = n(
    async (q) => {
      try {
        await rn(X, q.key), c.success(q.enabled ? "已禁用" : "已启用"), Ce();
      } catch (ie) {
        c.error(ie.message || "切换状态失败");
      }
    },
    [X, Ce]
  ), Ue = n(async () => {
    if (oe)
      try {
        await on(X, oe.key), c.success(`MCP「${oe.key}」已删除`), re(!1), te(null), Ce();
      } catch (q) {
        c.error(q.message || "删除失败");
      }
  }, [X, oe, Ce]), Oe = n(async () => {
    ce(!0);
    try {
      const q = JSON.parse(ue), ie = q.mcpServers || q, z = Object.entries(ie);
      if (z.length === 0) {
        c.warning("未找到 MCP 客户端配置");
        return;
      }
      let ke = !0;
      for (const [xe, be] of z) {
        const ze = be, Re = ze.url ? "streamable_http" : "stdio", ye = {
          name: ze.name || xe,
          description: ze.description || "",
          enabled: !0,
          transport: Re,
          url: ze.url || "",
          command: ze.command || "",
          args: ze.args || [],
          env: ze.env || {},
          cwd: ze.cwd || "",
          headers: ze.headers || {}
        };
        try {
          await sn(
            X,
            xe,
            ye
          );
        } catch {
          ke = !1;
        }
      }
      ke && (c.success("MCP 客户端已创建"), ae(!1), Ce());
    } catch (q) {
      q instanceof SyntaxError ? c.error("JSON 格式错误：" + q.message) : c.error(q.message || "创建 MCP 失败");
    } finally {
      ce(!1);
    }
  }, [ue, X, Ce]), Fe = n(
    async (q) => {
      Ie(q), pe(!0), k([]), Se(""), ge(!0);
      try {
        const ie = await cn(
          X,
          q.key
        );
        k(ie);
      } catch (ie) {
        Se(
          ie.message || "无法加载工具列表（MCP 服务可能未运行）"
        );
      } finally {
        ge(!1);
      }
    },
    [X]
  ), He = l(() => {
    if (!p.trim()) return J;
    const q = p.toLowerCase();
    return J.filter(
      (ie) => {
        var z;
        return ie.name.toLowerCase().includes(q) || ie.key.toLowerCase().includes(q) || ((z = ie.description) == null ? void 0 : z.toLowerCase().includes(q)) || ie.transport.toLowerCase().includes(q);
      }
    );
  }, [J, p]), je = J.filter((q) => q.enabled).length, Le = J.reduce((q, ie) => {
    var z;
    return q + (((z = ie.tools) == null ? void 0 : z.length) || 0);
  }, 0), De = e.createElement(
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
      e.createElement(i, {
        placeholder: "搜索能力名称、描述...",
        prefix: L ? e.createElement(L) : void 0,
        value: p,
        onChange: (q) => ne(q.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      e.createElement(
        h,
        {
          type: "primary",
          icon: V ? e.createElement(V) : void 0,
          onClick: () => ae(!0),
          style: Ae
        },
        "添加 MCP"
      )
    ),
    d ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(r, { size: "large" })
    ) : He.length === 0 ? e.createElement(s, {
      description: p ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「添加 MCP」创建"
    }) : e.createElement(
      m,
      { gutter: [12, 12], align: "stretch" },
      ...He.map(
        (q) => e.createElement(
          I,
          {
            key: q.key,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Kn, {
            mcp: q,
            onClick: () => {
              G(q), Y(!0);
            },
            onToggle: (ie) => {
              ie.stopPropagation(), $e(q);
            },
            onDelete: (ie) => {
              ie.stopPropagation(), te(q), re(!0);
            },
            onViewTools: (ie) => {
              ie.stopPropagation(), Fe(q);
            }
          })
        )
      )
    )
  ), Ge = [
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        O ? e.createElement(O, { style: { fontSize: 14 } }) : null,
        "MCP 客户端"
      ),
      children: De
    },
    {
      key: "software",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        j ? e.createElement(j, { style: { fontSize: 14 } }) : null,
        "计算引擎"
      ),
      children: e.createElement(el)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(lt, {
      title: "工具",
      subtitle: `MCP: ${J.length} 个客户端（${je} 个启用）· ${Le} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          h,
          {
            icon: x ? e.createElement(x) : void 0,
            onClick: Ce,
            loading: d
          },
          "刷新"
        )
      )
    }),
    e.createElement(_, {
      items: Ge,
      activeKey: $,
      onChange: (q) => le(q)
    }),
    // MCP Detail drawer
    Z ? e.createElement(
      v,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement("span", { style: { fontSize: 18 } }, "🔌"),
          e.createElement(
            "span",
            null,
            Z.name || Z.key
          )
        ),
        open: F,
        onClose: () => Y(!1),
        width: 480
      },
      e.createElement(
        f,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          f.Item,
          { label: "Key" },
          e.createElement(
            "code",
            { style: { fontSize: 12 } },
            Z.key
          )
        ),
        e.createElement(
          f.Item,
          { label: "名称" },
          Z.name || "-"
        ),
        e.createElement(
          f.Item,
          { label: "描述" },
          Z.description || "-"
        ),
        e.createElement(
          f.Item,
          { label: "状态" },
          e.createElement(
            D,
            { color: Z.enabled ? "green" : "default" },
            Z.enabled ? "启用" : "停用"
          )
        ),
        e.createElement(
          f.Item,
          { label: "传输方式" },
          Z.transport
        ),
        Z.url ? e.createElement(
          f.Item,
          { label: "URL" },
          Z.url
        ) : null,
        Z.command ? e.createElement(
          f.Item,
          { label: "命令" },
          e.createElement(
            "code",
            { style: { fontSize: 11 } },
            Z.command
          )
        ) : null,
        Z.args && Z.args.length > 0 ? e.createElement(
          f.Item,
          { label: "参数" },
          Z.args.join(" ")
        ) : null
      ),
      Z.tools && Z.tools.length > 0 ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          Q,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "提供的工具"
        ),
        e.createElement(A, {
          size: "small",
          dataSource: Z.tools,
          renderItem: (q) => e.createElement(
            A.Item,
            null,
            e.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              O ? e.createElement(O, {
                style: { fontSize: 12, color: "#1677ff" }
              }) : null,
              e.createElement(
                Q,
                { style: { fontSize: 12 } },
                q
              )
            )
          )
        })
      ) : e.createElement(
        "div",
        { style: { marginTop: 16, fontSize: 12, color: "#8c8c8c" } },
        "此 MCP 客户端未设置工具白名单（所有工具均可用）"
      )
    ) : null,
    // ── Create MCP Modal (mirror console /mcp JSON import) ──
    e.createElement(
      H,
      {
        title: "添加 MCP 客户端 (JSON)",
        open: y,
        onCancel: () => ae(!1),
        onOk: Oe,
        confirmLoading: K,
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
      e.createElement(C, {
        value: ue,
        onChange: (q) => ve(q.target.value),
        autoSize: { minRows: 12, maxRows: 20 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      })
    ),
    // ── Delete Confirmation Modal ──
    e.createElement(
      H,
      {
        title: "确认删除",
        open: B,
        onOk: Ue,
        onCancel: () => {
          re(!1), te(null);
        },
        okText: "确认删除",
        cancelText: "取消",
        okButtonProps: { danger: !0 }
      },
      e.createElement(
        "p",
        null,
        `确定要删除 MCP 客户端「${(oe == null ? void 0 : oe.name) || (oe == null ? void 0 : oe.key)}」吗？此操作不可撤销。`
      )
    ),
    // ── Tools Viewer Modal (mirror console /mcp tools) ──
    e.createElement(
      H,
      {
        title: me ? `${me.name || me.key} - 工具列表` : "工具列表",
        open: W,
        onCancel: () => {
          pe(!1), Ie(null);
        },
        footer: e.createElement(
          h,
          { onClick: () => pe(!1) },
          "关闭"
        ),
        width: 640
      },
      se ? e.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        e.createElement(r, { size: "large" })
      ) : we ? e.createElement(
        "div",
        { style: { color: "#ff4d4f", padding: 16 } },
        we
      ) : Te.length === 0 ? e.createElement(s, {
        description: "此 MCP 客户端暂无可用工具（可能服务未启动）"
      }) : e.createElement(A, {
        size: "small",
        dataSource: Te,
        renderItem: (q) => e.createElement(
          A.Item,
          null,
          e.createElement(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: 2
              }
            },
            e.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 6 } },
              O ? e.createElement(O, {
                style: { fontSize: 12, color: "#1677ff" }
              }) : null,
              e.createElement(
                Q,
                { strong: !0, style: { fontSize: 13 } },
                q.name || q.key
              )
            ),
            q.description ? e.createElement(
              Q,
              { type: "secondary", style: { fontSize: 12 } },
              q.description
            ) : null
          )
        )
      })
    )
  );
}
function nl({
  agentId: e,
  agentName: t,
  onNavigate: a
}) {
  const n = E().React, { useState: l, useEffect: r, useCallback: s } = n, {
    Spin: i,
    Empty: h,
    Button: c,
    Row: m,
    Col: I,
    Card: v,
    Tag: f,
    Checkbox: D,
    Modal: b,
    Typography: A,
    Drawer: _,
    Descriptions: H,
    message: x
  } = E().antd, {
    ReloadOutlined: V,
    ThunderboltOutlined: L,
    SettingOutlined: O,
    CheckSquareOutlined: j,
    EyeOutlined: U,
    EyeInvisibleOutlined: g,
    DeleteOutlined: M,
    CloseOutlined: T
  } = E().antdIcons || {}, { Text: Q, Paragraph: C } = A, [w, u] = l([]), [R, X] = l(!0), [J, P] = l(!1), [d, S] = l(null), [p, ne] = l(!1), [F, Y] = l(
    /* @__PURE__ */ new Set()
  ), [Z, G] = l(!1), $ = s(async () => {
    if (e) {
      X(!0);
      try {
        const B = await ut(e);
        u(B);
      } catch (B) {
        x.error(B.message || "加载技能失败"), u([]);
      } finally {
        X(!1);
      }
    }
  }, [e]);
  r(() => {
    $();
  }, [$]);
  const le = (B) => {
    Y((re) => {
      const oe = new Set(re);
      return oe.has(B) ? oe.delete(B) : oe.add(B), oe;
    });
  }, y = () => Y(/* @__PURE__ */ new Set()), ae = () => Y(new Set(w.map((B) => B.name))), ue = () => {
    p ? (y(), ne(!1)) : ne(!0);
  }, ve = async () => {
    const B = Array.from(F);
    if (B.length !== 0) {
      G(!0);
      try {
        const { results: re } = await vn(e, B), oe = Object.entries(re).filter(
          ([, W]) => W.success === !1
        ), te = B.length - oe.length;
        oe.length > 0 ? x.warning(
          `批量启用完成：成功 ${te} 个，失败 ${oe.length} 个`
        ) : x.success(`成功启用 ${B.length} 个技能`), y(), await $();
      } catch (re) {
        x.error(re.message || "批量启用失败");
      } finally {
        G(!1);
      }
    }
  }, K = async () => {
    const B = Array.from(F);
    if (B.length !== 0) {
      G(!0);
      try {
        const { results: re } = await bn(e, B), oe = Object.entries(re).filter(
          ([, W]) => W.success === !1
        ), te = B.length - oe.length;
        oe.length > 0 ? x.warning(
          `批量停用完成：成功 ${te} 个，失败 ${oe.length} 个`
        ) : x.success(`成功停用 ${B.length} 个技能`), y(), await $();
      } catch (re) {
        x.error(re.message || "批量停用失败");
      } finally {
        G(!1);
      }
    }
  }, ce = () => {
    const B = Array.from(F);
    B.length !== 0 && b.confirm({
      title: `确认删除 ${B.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        G(!0);
        try {
          const { results: re } = await Sn(e, B), oe = Object.entries(re).filter(
            ([, W]) => W.success === !1
          ), te = B.length - oe.length;
          oe.length > 0 ? x.warning(
            `批量删除完成：成功 ${te} 个，失败 ${oe.length} 个`
          ) : x.success(`成功删除 ${B.length} 个技能`), y(), await $();
        } catch (re) {
          x.error(re.message || "批量删除失败");
        } finally {
          G(!1);
        }
      }
    });
  };
  return n.createElement(
    "div",
    null,
    n.createElement(
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
      n.createElement(
        Q,
        { type: "secondary", style: { fontSize: 13 } },
        p ? `已选择 ${F.size} / ${w.length} 个技能` : `共 ${w.length} 个技能`
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        p ? n.createElement(
          n.Fragment,
          null,
          n.createElement(
            c,
            { size: "small", onClick: ae },
            "全选"
          ),
          n.createElement(
            c,
            {
              size: "small",
              icon: T ? n.createElement(T) : void 0,
              onClick: y
            },
            "取消选择"
          ),
          n.createElement(
            c,
            {
              size: "small",
              type: "default",
              icon: U ? n.createElement(U) : void 0,
              disabled: F.size === 0 || Z,
              loading: Z,
              onClick: ve
            },
            "批量启用"
          ),
          n.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: g ? n.createElement(g) : void 0,
              disabled: F.size === 0 || Z,
              loading: Z,
              onClick: K
            },
            "批量停用"
          ),
          n.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: M ? n.createElement(M) : void 0,
              disabled: F.size === 0 || Z,
              loading: Z,
              onClick: ce
            },
            `删除 (${F.size})`
          ),
          n.createElement(
            c,
            {
              size: "small",
              type: "primary",
              onClick: ue
            },
            "退出批量"
          )
        ) : n.createElement(
          n.Fragment,
          null,
          n.createElement(
            c,
            {
              size: "small",
              icon: j ? n.createElement(j) : void 0,
              onClick: ue,
              disabled: w.length === 0
            },
            "批量管理"
          ),
          n.createElement(
            c,
            {
              icon: V ? n.createElement(V) : void 0,
              onClick: $,
              loading: R,
              size: "small"
            },
            "刷新"
          )
        )
      )
    ),
    R ? n.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      n.createElement(i, { size: "large" })
    ) : w.length === 0 ? n.createElement(h, {
      description: "当前智能体未加载任何技能"
    }) : n.createElement(
      m,
      { gutter: [12, 12] },
      ...w.map(
        (B) => n.createElement(
          I,
          { key: B.name, xs: 24, sm: 12, md: 8, lg: 6 },
          n.createElement(
            v,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: p ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: p && F.has(B.name) ? "#0072f5" : void 0,
                borderWidth: p && F.has(B.name) ? 2 : 1
              },
              onClick: () => {
                p ? le(B.name) : (S(B), P(!0));
              }
            },
            p ? n.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (re) => {
                  re.stopPropagation(), le(B.name);
                }
              },
              n.createElement(D, {
                checked: F.has(B.name)
              })
            ) : null,
            n.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8
                }
              },
              B.emoji ? n.createElement(
                "span",
                { style: { fontSize: 18 } },
                B.emoji
              ) : n.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              n.createElement(
                Q,
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
                B.name
              ),
              B.enabled === !1 ? n.createElement(
                f,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : n.createElement(
                f,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            B.description ? n.createElement(
              C,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              B.description
            ) : null,
            n.createElement(
              "div",
              {
                style: {
                  marginTop: 8,
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap"
                }
              },
              B.version_text ? n.createElement(
                f,
                { style: { fontSize: 10 } },
                `v${B.version_text}`
              ) : null,
              ...(B.tags || []).slice(0, 3).map(
                (re, oe) => n.createElement(
                  f,
                  { key: oe, color: "blue", style: { fontSize: 10 } },
                  re
                )
              )
            )
          )
        )
      )
    ),
    // Skill detail drawer
    d ? n.createElement(
      _,
      {
        title: n.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          n.createElement(
            "span",
            { style: { fontSize: 18 } },
            d.emoji || "⚡"
          ),
          n.createElement("span", null, d.name)
        ),
        open: J,
        onClose: () => P(!1),
        width: 520,
        extra: n.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: O ? n.createElement(O) : void 0,
            onClick: () => a("/skills")
          },
          "管理技能"
        )
      },
      n.createElement(
        H,
        { column: 1, bordered: !0, size: "small" },
        n.createElement(
          H.Item,
          { label: "技能名称" },
          d.name
        ),
        n.createElement(
          H.Item,
          { label: "描述" },
          d.description || "-"
        ),
        d.version_text ? n.createElement(
          H.Item,
          { label: "版本" },
          d.version_text
        ) : null,
        n.createElement(
          H.Item,
          { label: "来源" },
          d.source || "-"
        ),
        n.createElement(
          H.Item,
          { label: "状态" },
          d.enabled === !1 ? "已禁用" : "已启用"
        ),
        d.installed_from ? n.createElement(
          H.Item,
          { label: "安装来源" },
          d.installed_from
        ) : null
      ),
      // Tags
      d.tags && d.tags.length > 0 ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          Q,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        n.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...d.tags.map(
            (B, re) => n.createElement(f, { key: re, color: "blue" }, B)
          )
        )
      ) : null,
      // Skill content preview
      d.content ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          Q,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "技能内容"
        ),
        n.createElement(
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
          d.content.slice(0, 2e3) + (d.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function ll({
  poolSkills: e,
  workspaceSkills: t,
  agents: a,
  loading: n,
  onReload: l
}) {
  const r = E().React, { useState: s, useMemo: i, useCallback: h } = r, {
    Spin: c,
    Empty: m,
    Input: I,
    Button: v,
    Row: f,
    Col: D,
    Card: b,
    Tag: A,
    Typography: _,
    Drawer: H,
    Descriptions: x,
    List: V
  } = E().antd, {
    ReloadOutlined: L,
    SearchOutlined: O,
    DownloadOutlined: j,
    ThunderboltOutlined: U
  } = E().antdIcons || {}, { Text: g, Paragraph: M } = _, [T, Q] = s(""), [C, w] = s(!1), [u, R] = s(null), [X, J] = s([]), P = i(() => {
    if (!T.trim()) return e;
    const p = T.toLowerCase();
    return e.filter(
      (ne) => {
        var F, Y;
        return ne.name.toLowerCase().includes(p) || ((F = ne.description) == null ? void 0 : F.toLowerCase().includes(p)) || ((Y = ne.tags) == null ? void 0 : Y.some((Z) => Z.toLowerCase().includes(p)));
      }
    );
  }, [e, T]), d = h(
    (p) => {
      const ne = [];
      for (const F of t)
        if (F.skills.some((Y) => Y.name === p)) {
          const Y = a.find((Z) => Z.id === F.agent_id);
          ne.push((Y == null ? void 0 : Y.name) || F.agent_name || F.agent_id);
        }
      return ne;
    },
    [t, a]
  ), S = (p) => {
    window.history.pushState({}, "", p), window.dispatchEvent(new PopStateEvent("popstate"));
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
      r.createElement(I, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: O ? r.createElement(O) : void 0,
        value: T,
        onChange: (p) => Q(p.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          v,
          {
            icon: L ? r.createElement(L) : void 0,
            onClick: l,
            loading: n,
            size: "small"
          },
          "刷新"
        ),
        r.createElement(
          v,
          {
            type: "primary",
            icon: j ? r.createElement(j) : void 0,
            onClick: () => S("/skill-pool"),
            size: "small",
            style: Ae
          },
          "管理技能池"
        )
      )
    ),
    n ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      r.createElement(c, { size: "large" })
    ) : P.length === 0 ? r.createElement(m, {
      description: T ? "未找到匹配的技能" : "技能池为空"
    }) : r.createElement(
      f,
      { gutter: [12, 12] },
      ...P.map(
        (p) => r.createElement(
          D,
          { key: p.name, xs: 24, sm: 12, md: 8, lg: 6 },
          r.createElement(
            b,
            {
              hoverable: !0,
              size: "small",
              style: { cursor: "pointer", height: "100%" },
              onClick: () => {
                R(p), J(d(p.name)), w(!0);
              }
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
              p.emoji ? r.createElement(
                "span",
                { style: { fontSize: 18 } },
                p.emoji
              ) : r.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              r.createElement(
                g,
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
                p.name
              ),
              p.protected ? r.createElement(
                A,
                { color: "gold", style: { fontSize: 10 } },
                "内置"
              ) : null
            ),
            p.description ? r.createElement(
              M,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              p.description
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
              p.version_text ? r.createElement(
                A,
                { style: { fontSize: 10 } },
                `v${p.version_text}`
              ) : null,
              ...(p.tags || []).slice(0, 3).map(
                (ne, F) => r.createElement(
                  A,
                  { key: F, color: "cyan", style: { fontSize: 10 } },
                  ne
                )
              )
            )
          )
        )
      )
    ),
    // Skill detail drawer
    u ? r.createElement(
      H,
      {
        title: r.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          r.createElement(
            "span",
            { style: { fontSize: 18 } },
            u.emoji || "⚡"
          ),
          r.createElement("span", null, u.name)
        ),
        open: C,
        onClose: () => w(!1),
        width: 520,
        extra: r.createElement(
          v,
          {
            type: "primary",
            size: "small",
            icon: U ? r.createElement(U) : void 0,
            onClick: () => S("/skills")
          },
          "管理技能"
        )
      },
      r.createElement(
        x,
        { column: 1, bordered: !0, size: "small" },
        r.createElement(
          x.Item,
          { label: "技能名称" },
          u.name
        ),
        r.createElement(
          x.Item,
          { label: "描述" },
          u.description || "-"
        ),
        u.version_text ? r.createElement(
          x.Item,
          { label: "版本" },
          u.version_text
        ) : null,
        r.createElement(
          x.Item,
          { label: "来源" },
          u.source || "-"
        ),
        r.createElement(
          x.Item,
          { label: "受保护" },
          u.protected ? "是（内置）" : "否"
        ),
        u.sync_status ? r.createElement(
          x.Item,
          { label: "同步状态" },
          u.sync_status
        ) : null,
        u.installed_from ? r.createElement(
          x.Item,
          { label: "安装来源" },
          u.installed_from
        ) : null
      ),
      // Tags
      u.tags && u.tags.length > 0 ? r.createElement(
        "div",
        { style: { marginTop: 16 } },
        r.createElement(
          g,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        r.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...u.tags.map(
            (p, ne) => r.createElement(A, { key: ne, color: "cyan" }, p)
          )
        )
      ) : null,
      // Installed agents
      r.createElement(
        "div",
        { style: { marginTop: 16 } },
        r.createElement(
          g,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${X.length})`
        ),
        X.length > 0 ? r.createElement(V, {
          size: "small",
          dataSource: X,
          renderItem: (p) => r.createElement(
            V.Item,
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
              r.createElement(Be, { name: p, size: 20 }),
              r.createElement(
                g,
                { style: { fontSize: 13 } },
                p
              )
            )
          )
        }) : r.createElement(
          g,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      )
    ) : null
  );
}
function al() {
  const e = E().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, { Tabs: r, message: s } = E().antd, { ThunderboltOutlined: i, AppstoreOutlined: h } = E().antdIcons || {}, m = E().useSelectedAgent, I = m ? m() : null, v = (I == null ? void 0 : I.id) || "default", [f, D] = t([]), [b, A] = t([]), [_, H] = t([]), [x, V] = t(!0), [L, O] = t("agent-skills"), j = n(async () => {
    V(!0);
    try {
      const [T, Q, C] = await Promise.all([
        pt(),
        dt(),
        ln()
      ]);
      A(T), D(Q), H(C);
    } catch (T) {
      s.error(T.message || "加载技能列表失败"), A([]);
    } finally {
      V(!1);
    }
  }, []);
  a(() => {
    j();
  }, [j]);
  const U = l(() => {
    const T = f.find((Q) => Q.id === v);
    return (T == null ? void 0 : T.name) || v;
  }, [f, v]), g = (T) => {
    window.history.pushState({}, "", T), window.dispatchEvent(new PopStateEvent("popstate"));
  }, M = [
    {
      key: "agent-skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        i ? e.createElement(i, { style: { fontSize: 14 } }) : null,
        "当前Agent加载技能"
      ),
      children: e.createElement(nl, {
        agentId: v,
        agentName: U,
        onNavigate: g
      })
    },
    {
      key: "skill-pool",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        h ? e.createElement(h, { style: { fontSize: 14 } }) : null,
        "技能池"
      ),
      children: e.createElement(ll, {
        poolSkills: b,
        workspaceSkills: _,
        agents: f,
        loading: x,
        onReload: j
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(lt, {
      title: "技能",
      subtitle: `技能池共 ${b.length} 个技能 · 当前智能体：${U}`
    }),
    e.createElement(r, {
      items: M,
      activeKey: L,
      onChange: (T) => O(T)
    })
  );
}
const ct = "ugsci.market.githubSources", Tt = "https://github.com/anthropics/skills/tree/main/skills";
function Wt(e) {
  try {
    const t = new URL(e.trim()), a = t.hostname.toLowerCase();
    if (a !== "github.com" && a !== "www.github.com") return null;
    const n = t.pathname.split("/").filter((h) => h.length > 0);
    if (n.length < 2) return null;
    const l = decodeURIComponent(n[0]), r = decodeURIComponent(n[1]);
    let s = "main", i = "";
    return n.length >= 4 && (n[2] === "tree" || n[2] === "blob") ? (s = decodeURIComponent(n[3]), n.length > 4 && (i = n.slice(4).map(decodeURIComponent).join("/"))) : n.length > 2 && (i = n.slice(2).map(decodeURIComponent).join("/")), i = i.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: l,
      repo: r,
      ref: s || "main",
      skillsPath: i,
      label: `${l}/${r}`
    };
  } catch {
    return null;
  }
}
function Jt(e, t, a) {
  return `${e}/${t}:${a || "/"}`;
}
function rl() {
  try {
    const e = localStorage.getItem(ct);
    if (!e) {
      const a = Wt(Tt);
      if (a) {
        const n = [
          {
            id: Jt(
              a.owner,
              a.repo,
              a.skillsPath
            ),
            url: Tt,
            label: a.label,
            owner: a.owner,
            repo: a.repo,
            ref: a.ref,
            skillsPath: a.skillsPath,
            enabled: !0
          }
        ];
        return localStorage.setItem(ct, JSON.stringify(n)), n;
      }
      return [];
    }
    const t = JSON.parse(e);
    return Array.isArray(t) ? t.filter(
      (a) => a && typeof a.id == "string" && typeof a.owner == "string" && typeof a.repo == "string"
    ) : [];
  } catch {
    return [];
  }
}
function ot(e) {
  try {
    localStorage.setItem(
      ct,
      JSON.stringify(e)
    );
  } catch {
  }
}
function ol(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const a = t[1], n = {}, l = a.split(`
`);
  let r = "";
  for (const s of l) {
    const i = s.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (i) {
      r = i[1];
      let h = i[2].trim();
      (h.startsWith('"') && h.endsWith('"') || h.startsWith("'") && h.endsWith("'")) && (h = h.slice(1, -1)), r === "name" ? n.name = h : r === "description" ? n.description = h : r === "version" ? n.version = h : r === "author" && (n.author = h);
    }
  }
  return n;
}
async function sl(e) {
  const t = e.skillsPath ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/") : "", a = `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${t}?ref=${encodeURIComponent(e.ref)}`, n = await fetch(a, {
    headers: { Accept: "application/vnd.github+json" }
  });
  if (!n.ok)
    throw new Error(
      `GitHub API ${n.status}: ${e.label} (${e.skillsPath || "/"})`
    );
  const l = await n.json();
  if (!Array.isArray(l)) return [];
  const r = l.filter(
    (i) => i.type === "dir" && i.name
  );
  return await Promise.all(
    r.map(async (i) => {
      const h = `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${e.skillsPath ? e.skillsPath + "/" : ""}${i.name}/SKILL.md`, c = `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${e.skillsPath ? e.skillsPath + "/" : ""}${i.name}`, m = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: i.name,
        description: "",
        source_url: c,
        html_url: c,
        version: null,
        author: null
      };
      try {
        const I = await fetch(h);
        if (!I.ok) return m;
        const v = await I.text(), f = ol(v);
        return {
          ...m,
          name: f.name || i.name,
          description: f.description || "",
          version: f.version || null,
          author: f.author || null
        };
      } catch {
        return m;
      }
    })
  );
}
async function il(e) {
  const t = e.filter((r) => r.enabled), a = await Promise.all(
    t.map(async (r) => {
      try {
        return { skills: await sl(r), error: null, label: r.label };
      } catch (s) {
        return {
          skills: [],
          error: s.message || String(s),
          label: r.label
        };
      }
    })
  ), n = [], l = [];
  for (const r of a)
    n.push(...r.skills), r.error && l.push({ label: r.label, message: r.error });
  return { skills: n, errors: l };
}
function cl({
  open: e,
  onClose: t,
  sources: a,
  onChange: n
}) {
  const l = E().React, { useState: r } = l, {
    Modal: s,
    Input: i,
    Button: h,
    List: c,
    Tag: m,
    Switch: I,
    Typography: v,
    Tooltip: f,
    message: D
  } = E().antd, {
    PlusOutlined: b,
    DeleteOutlined: A,
    LinkOutlined: _,
    GithubOutlined: H
  } = E().antdIcons || {}, { Text: x } = v, [V, L] = r(""), O = () => {
    const g = V.trim();
    if (!g) return;
    const M = Wt(g);
    if (!M) {
      D.error("无效的 GitHub URL，请输入类似 https://github.com/owner/repo/tree/main/skills 的链接");
      return;
    }
    const T = Jt(M.owner, M.repo, M.skillsPath);
    if (a.some((w) => w.id === T)) {
      D.warning("该源已存在");
      return;
    }
    const Q = {
      id: T,
      url: g,
      label: M.label,
      owner: M.owner,
      repo: M.repo,
      ref: M.ref,
      skillsPath: M.skillsPath,
      enabled: !0
    }, C = [...a, Q];
    ot(C), n(C), L(""), D.success(`已添加源: ${M.label}`);
  }, j = (g, M) => {
    const T = a.map(
      (Q) => Q.id === g ? { ...Q, enabled: M } : Q
    );
    ot(T), n(T);
  }, U = (g) => {
    const M = a.filter((T) => T.id !== g);
    ot(M), n(M), D.success("已移除源");
  };
  return l.createElement(
    s,
    {
      open: e,
      onCancel: t,
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        H ? l.createElement(H, { style: { fontSize: 18 } }) : null,
        l.createElement("span", null, "配置技能源")
      ),
      footer: l.createElement(
        h,
        { onClick: t },
        "关闭"
      ),
      width: 640
    },
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        x,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        l.createElement(i, {
          placeholder: "https://github.com/anthropics/skills/tree/main/skills",
          value: V,
          onChange: (g) => L(g.target.value),
          onPressEnter: O,
          prefix: _ ? l.createElement(_) : void 0,
          style: { flex: 1 }
        }),
        l.createElement(
          h,
          {
            type: "primary",
            icon: b ? l.createElement(b) : void 0,
            onClick: O
          },
          "添加"
        )
      )
    ),
    l.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      l.createElement(x, { strong: !0 }, `已配置源 (${a.length})`)
    ),
    l.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: a,
      renderItem: (g) => l.createElement(
        c.Item,
        {
          actions: [
            l.createElement(
              f,
              { title: g.enabled ? "点击禁用" : "点击启用" },
              l.createElement(I, {
                size: "small",
                checked: g.enabled,
                onChange: (M) => j(g.id, M)
              })
            ),
            l.createElement(
              f,
              { title: "移除此源" },
              l.createElement(
                h,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: A ? l.createElement(A) : void 0,
                  onClick: () => U(g.id)
                }
              )
            )
          ]
        },
        l.createElement(
          "div",
          { style: { flex: 1, minWidth: 0 } },
          l.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
            l.createElement(
              m,
              { color: "blue", style: { fontSize: 11 } },
              g.label
            ),
            g.skillsPath ? l.createElement(
              x,
              { type: "secondary", style: { fontSize: 11 } },
              `/${g.skillsPath}`
            ) : null,
            l.createElement(
              x,
              { type: "secondary", style: { fontSize: 11 } },
              `@${g.ref}`
            )
          ),
          l.createElement(
            x,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            g.url
          )
        )
      )
    })
  );
}
async function ml() {
  return ee("/market/providers");
}
async function dl(e) {
  return ee(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function ul(e, t, a, n, l) {
  return ee("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: t,
      limit: a,
      lang: n,
      category: l || void 0
    })
  });
}
async function zt(e, t, a) {
  return ee("/skills/hub/install/start", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({
      bundle_url: t,
      enable: a
    })
  });
}
async function It(e, t) {
  return ee(
    `/skills/hub/install/status/${encodeURIComponent(t)}`,
    {
      headers: { "X-Agent-Id": e }
    }
  );
}
function pl() {
  const e = E().React, { useState: t, useEffect: a, useCallback: n, useMemo: l, useRef: r } = e, {
    Spin: s,
    Empty: i,
    Input: h,
    Button: c,
    message: m,
    Row: I,
    Col: v,
    Card: f,
    Tag: D,
    Tooltip: b,
    Typography: A,
    Select: _,
    Drawer: H,
    Descriptions: x,
    Tabs: V,
    Badge: L,
    Progress: O
  } = E().antd, {
    ReloadOutlined: j,
    SearchOutlined: U,
    DownloadOutlined: g,
    AppstoreOutlined: M,
    ShopOutlined: T,
    CheckCircleOutlined: Q,
    LoadingOutlined: C,
    UserOutlined: w,
    SettingOutlined: u,
    GithubOutlined: R,
    ApiOutlined: X
  } = E().antdIcons || {}, { Text: J, Paragraph: P, Title: d } = A, [S, p] = t("skills"), [ne, F] = t([]), [Y, Z] = t([]), [G, $] = t([]), [le, y] = t(""), [ae, ue] = t(""), [ve, K] = t(!1), [ce, B] = t(!1), [re, oe] = t(
    {}
  ), [te, W] = t(null), [pe, me] = t({}), [Ie, Te] = t([]), [k, se] = t(""), [ge, we] = t(""), [Se, Ce] = t(""), [$e, Ue] = t({}), [Oe, Fe] = t(""), [He, je] = t(/* @__PURE__ */ new Set()), [Le, De] = t([]), [Ge, q] = t([]), [ie, z] = t(!1), [ke, xe] = t(!1), [be, ze] = t(""), Re = r(null);
  a(() => {
    Promise.all([
      ml().catch(() => []),
      dl("zh").catch(() => []),
      dt().catch(() => [])
    ]).then(([o, N, de]) => {
      F(o), Z(N), Te(de), de.length > 0 && (se(de[0].id), Fe(de[0].id));
    });
  }, []);
  const ye = n(async (o) => {
    const N = o ?? rl();
    if (De(o || N), N.filter((fe) => fe.enabled).length === 0) {
      q([]);
      return;
    }
    z(!0);
    try {
      const { skills: fe, errors: Pe } = await il(N);
      if (q(fe), Pe.length > 0) {
        for (const Ee of Pe)
          console.warn(`[ugsci] GitHub source '${Ee.label}' error: ${Ee.message}`);
        m.warning(
          `部分源加载失败: ${Pe.map((Ee) => Ee.label).join(", ")}`
        );
      }
    } catch (fe) {
      m.error(fe.message || "加载 GitHub 技能源失败"), q([]);
    } finally {
      z(!1);
    }
  }, []);
  a(() => {
    ye();
  }, [ye]);
  const Je = n(
    async (o, N, de) => {
      K(!0);
      try {
        const fe = await ul(
          o,
          de,
          20,
          "zh",
          N || void 0
        );
        de === void 0 || Object.keys(de).length === 0 ? $(fe.results) : $((he) => [...he, ...fe.results]);
        const Pe = Object.values(fe.by_provider || {}).some(
          (he) => he.has_more
        );
        B(Pe);
        const Ee = {};
        for (const [he, _e] of Object.entries(fe.by_provider || {}))
          Ee[he] = (de[he] || 1) + 1;
        if (oe(Ee), fe.errors.length > 0)
          for (const he of fe.errors)
            console.warn(
              `[ugsci] Market provider '${he.provider}' error: ${he.message}`
            );
      } catch (fe) {
        m.error(fe.message || "搜索市场失败"), $([]);
      } finally {
        K(!1);
      }
    },
    []
  );
  a(() => (Re.current && clearTimeout(Re.current), Re.current = setTimeout(() => {
    Je(le, ae, {});
  }, 400), () => {
    Re.current && clearTimeout(Re.current);
  }), [le, ae, Je]);
  const at = () => {
    Je(le, ae, re);
  }, Ve = async (o) => {
    var de;
    if (!k) {
      m.warning("请先选择安装目标专家");
      return;
    }
    const N = `${o.source}:${o.slug}`;
    try {
      me((Ee) => ({ ...Ee, [N]: "starting" }));
      const fe = await zt(
        k,
        o.source_url,
        !0
      );
      me((Ee) => ({ ...Ee, [N]: "installing" }));
      const Pe = 60;
      for (let Ee = 0; Ee < Pe; Ee++) {
        await new Promise((_e) => setTimeout(_e, 2e3));
        const he = await It(
          k,
          fe.task_id
        );
        if (he.status === "completed" && ((de = he.result) != null && de.installed)) {
          m.success(`技能「${he.result.name || o.name}」安装成功`), me((_e) => {
            const Me = { ..._e };
            return delete Me[N], Me;
          });
          return;
        }
        if (he.status === "failed")
          throw new Error(he.error || "安装失败");
        if (he.status === "cancelled") {
          m.info("安装已取消"), me((_e) => {
            const Me = { ..._e };
            return delete Me[N], Me;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (fe) {
      m.error(fe.message || "安装技能失败"), me((Pe) => {
        const Ee = { ...Pe };
        return delete Ee[N], Ee;
      });
    }
  }, We = (o) => {
    window.history.pushState({}, "", o), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Kt = async (o) => {
    var de;
    if (!k) {
      m.warning("请先选择安装目标专家");
      return;
    }
    const N = `github:${o.sourceId}:${o.name}`;
    try {
      me((Ee) => ({ ...Ee, [N]: "starting" }));
      const fe = await zt(
        k,
        o.source_url,
        !0
      );
      me((Ee) => ({ ...Ee, [N]: "installing" }));
      const Pe = 60;
      for (let Ee = 0; Ee < Pe; Ee++) {
        await new Promise((_e) => setTimeout(_e, 2e3));
        const he = await It(
          k,
          fe.task_id
        );
        if (he.status === "completed" && ((de = he.result) != null && de.installed)) {
          m.success(`技能「${he.result.name || o.name}」安装成功`), me((_e) => {
            const Me = { ..._e };
            return delete Me[N], Me;
          });
          return;
        }
        if (he.status === "failed")
          throw new Error(he.error || "安装失败");
        if (he.status === "cancelled") {
          m.info("安装已取消"), me((_e) => {
            const Me = { ..._e };
            return delete Me[N], Me;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (fe) {
      m.error(fe.message || "安装技能失败"), me((Pe) => {
        const Ee = { ...Pe };
        return delete Ee[N], Ee;
      });
    }
  }, rt = l(() => {
    let o = Ge;
    if (be && (o = o.filter((N) => N.sourceLabel === be)), le.trim()) {
      const N = le.toLowerCase();
      o = o.filter(
        (de) => {
          var fe;
          return de.name.toLowerCase().includes(N) || ((fe = de.description) == null ? void 0 : fe.toLowerCase().includes(N));
        }
      );
    }
    return o;
  }, [Ge, le, be]), Qe = ne.filter((o) => o.available), Ke = l(() => {
    if (!be) return G;
    const o = Qe.find(
      (N) => N.label === be
    );
    return o ? G.filter((N) => N.source === o.key) : G;
  }, [G, be, Qe]), Et = l(() => {
    const o = /* @__PURE__ */ new Set();
    return Le.filter((N) => N.enabled).forEach((N) => o.add(N.label)), Qe.forEach((N) => o.add(N.label)), Array.from(o);
  }, [Le, Qe]), Xt = e.createElement(
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
      e.createElement(h, {
        placeholder: "搜索技能市场...",
        prefix: U ? e.createElement(U) : void 0,
        value: le,
        onChange: (o) => y(o.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      Y.length > 0 ? e.createElement(_, {
        value: ae || void 0,
        onChange: (o) => ue(o || ""),
        placeholder: "全部分类",
        allowClear: !0,
        style: { minWidth: 150 },
        options: [
          { value: "", label: "全部分类" },
          ...Y.map((o) => ({ value: o.id, label: o.label }))
        ]
      }) : null,
      // Install target selector
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 4 } },
        e.createElement(
          J,
          { type: "secondary", style: { fontSize: 12 } },
          "安装到"
        ),
        e.createElement(_, {
          value: k || void 0,
          onChange: (o) => se(o),
          style: { minWidth: 140 },
          placeholder: "选择专家",
          options: Ie.map((o) => ({ value: o.id, label: o.name }))
        })
      )
    ),
    // Source filter tags (GitHub sources + market providers)
    Et.length > 0 ? e.createElement(
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
        J,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "来源筛选:"
      ),
      e.createElement(
        D,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: be === "" ? "blue" : void 0,
          onClick: () => ze("")
        },
        "全部"
      ),
      ...Et.map(
        (o) => e.createElement(
          D,
          {
            key: o,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: be === o ? "blue" : void 0,
            icon: R && Le.some((N) => N.label === o) ? e.createElement(R) : void 0,
            onClick: () => ze(
              be === o ? "" : o
            )
          },
          o
        )
      )
    ) : null,
    // GitHub skills section
    ie && Ge.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      e.createElement(s, {
        tip: "正在从 GitHub 加载技能...",
        size: "large"
      })
    ) : rt.length > 0 ? e.createElement(
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
        R ? e.createElement(R, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        e.createElement(
          J,
          { strong: !0, style: { fontSize: 13 } },
          `GitHub 技能源 (${rt.length})`
        )
      ),
      e.createElement(
        I,
        { gutter: [12, 12] },
        ...rt.map((o) => {
          const N = `github:${o.sourceId}:${o.name}`, de = pe[N];
          return e.createElement(
            v,
            { key: N, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              f,
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
                R ? e.createElement(R, {
                  style: { fontSize: 18, color: "#57606a" }
                }) : e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                e.createElement(
                  b,
                  { title: o.name },
                  e.createElement(
                    J,
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
                    o.name
                  )
                )
              ),
              e.createElement(
                P,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                o.description || "暂无描述"
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
                    D,
                    { color: "blue", style: { fontSize: 10 } },
                    o.sourceLabel
                  ),
                  o.version ? e.createElement(
                    D,
                    { style: { fontSize: 10 } },
                    `v${o.version}`
                  ) : null
                ),
                de ? e.createElement(
                  c,
                  {
                    size: "small",
                    disabled: !0,
                    icon: C ? e.createElement(C) : void 0
                  },
                  de === "starting" ? "启动中" : "安装中"
                ) : e.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: g ? e.createElement(g) : void 0,
                    onClick: () => Kt(o)
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
    Ke.length > 0 || ve ? e.createElement(
      "div",
      {
        style: {
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      T ? e.createElement(T, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      e.createElement(
        J,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${Ke.length > 0 ? ` (${Ke.length})` : ""}`
      )
    ) : null,
    // Results grid
    ve && Ke.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(s, { size: "large" })
    ) : Ke.length === 0 ? e.createElement(i, {
      description: le ? `未找到匹配「${le}」的技能` : "输入关键词搜索技能市场",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      I,
      { gutter: [12, 12] },
      ...Ke.map((o) => {
        const N = `${o.source}:${o.slug}`, de = pe[N];
        return e.createElement(
          v,
          { key: N, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            f,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => W(o)
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
              o.icon_url ? e.createElement("img", {
                src: o.icon_url,
                alt: o.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : e.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              e.createElement(
                b,
                { title: o.name },
                e.createElement(
                  J,
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
                  o.name
                )
              )
            ),
            e.createElement(
              P,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              o.description || "暂无描述"
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
                  D,
                  { color: "geekblue", style: { fontSize: 10 } },
                  o.source
                ),
                o.version ? e.createElement(
                  D,
                  { style: { fontSize: 10 } },
                  `v${o.version}`
                ) : null
              ),
              de ? e.createElement(
                c,
                {
                  size: "small",
                  disabled: !0,
                  icon: C ? e.createElement(C) : void 0
                },
                de === "starting" ? "启动中" : "安装中"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: g ? e.createElement(g) : void 0,
                  onClick: (fe) => {
                    fe.stopPropagation(), Ve(o);
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
    ce && !ve ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        c,
        { onClick: at, loading: ve },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    te ? e.createElement(
      H,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          te.icon_url ? e.createElement("img", {
            src: te.icon_url,
            alt: te.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, te.name)
        ),
        open: !0,
        onClose: () => W(null),
        width: 480,
        extra: e.createElement(
          c,
          {
            type: "primary",
            icon: g ? e.createElement(g) : void 0,
            onClick: () => {
              Ve(te);
            }
          },
          "安装到专家"
        )
      },
      e.createElement(
        x,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          x.Item,
          { label: "来源" },
          te.source
        ),
        e.createElement(
          x.Item,
          { label: "描述" },
          te.description || "-"
        ),
        te.version ? e.createElement(
          x.Item,
          { label: "版本" },
          te.version
        ) : null,
        te.author ? e.createElement(
          x.Item,
          { label: "作者" },
          te.author
        ) : null,
        e.createElement(
          x.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: te.source_url, target: "_blank" },
            te.source_url
          )
        )
      ),
      te.stats ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          J,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "统计"
        ),
        e.createElement(
          "div",
          { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
          ...Object.entries(te.stats).map(
            ([o, N]) => e.createElement(
              "div",
              { key: o, style: { textAlign: "center" } },
              e.createElement(
                "div",
                {
                  style: {
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#1677ff"
                  }
                },
                String(N)
              ),
              e.createElement(
                J,
                { type: "secondary", style: { fontSize: 11 } },
                o
              )
            )
          )
        )
      ) : null
    ) : null
  ), qt = l(() => {
    if (!ge.trim()) return st;
    const o = ge.toLowerCase();
    return st.filter(
      (N) => N.name.toLowerCase().includes(o) || N.description.toLowerCase().includes(o) || N.category.toLowerCase().includes(o)
    );
  }, [ge]), Vt = async (o) => {
    try {
      const N = await ee("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: o.name,
          description: o.description,
          skill_names: o.recommendedSkills
        })
      });
      await tt(N.id, "AGENTS.md", o.systemPrompt);
      const de = await nt(N.id);
      de.approval_level = o.approvalLevel, await ee(`/agents/${encodeURIComponent(N.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(de)
      }), m.success(`专家「${o.name}」创建成功，已跳转至专家`), We("/ugsci-experts");
    } catch (N) {
      m.error(N.message || "创建专家失败");
    }
  }, ht = n(async (o) => {
    if (o)
      try {
        const N = await yt(o);
        je(new Set(N.map((de) => de.key)));
      } catch {
        je(/* @__PURE__ */ new Set());
      }
  }, []);
  a(() => {
    Oe && ht(Oe);
  }, [Oe, ht]);
  const Yt = async (o) => {
    if (!Oe) {
      m.warning("请先选择目标专家");
      return;
    }
    Ue((N) => ({ ...N, [o.id]: !0 }));
    try {
      const N = o.id;
      await Lt(Oe, {
        client_key: N,
        client: {
          name: o.name,
          description: o.description,
          enabled: !0,
          transport: o.transport,
          url: o.url || "",
          command: o.command || "",
          args: o.args || [],
          env: o.env || {},
          cwd: o.cwd || "",
          headers: o.headers || {}
        }
      }), m.success(`MCP「${o.name}」已添加到当前专家`), je((de) => new Set(de).add(N));
    } catch (N) {
      m.error(N.message || `添加 MCP「${o.name}」失败`);
    } finally {
      Ue((N) => ({ ...N, [o.id]: !1 }));
    }
  }, Qt = l(() => {
    if (!Se.trim()) return vt;
    const o = Se.toLowerCase();
    return vt.filter(
      (N) => N.name.toLowerCase().includes(o) || N.description.toLowerCase().includes(o) || N.category.toLowerCase().includes(o)
    );
  }, [Se]), Zt = e.createElement(
    "div",
    null,
    // Info banner
    e.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          padding: "12px 16px",
          background: "linear-gradient(135deg, #f0fdf4 0%, #f0fff4 100%)",
          borderRadius: 8,
          border: "1px solid #d9f7be"
        }
      },
      e.createElement(
        J,
        { style: { fontSize: 13, color: "#135200" } },
        "从 MCP 模板库选择常用 Model Context Protocol 服务器，一键添加到当前专家。支持文件系统、数据库、搜索、开发工具等多种 MCP 服务器。"
      )
    ),
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
      e.createElement(h, {
        placeholder: "搜索 MCP 模板...",
        prefix: U ? e.createElement(U) : void 0,
        value: Se,
        onChange: (o) => Ce(o.target.value),
        allowClear: !0,
        style: { maxWidth: 300 }
      }),
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        e.createElement(
          J,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "安装到："
        ),
        e.createElement(_, {
          value: Oe,
          onChange: (o) => Fe(o),
          style: { minWidth: 180 },
          size: "small",
          options: Ie.map((o) => ({ value: o.id, label: o.name }))
        })
      )
    ),
    // MCP template cards
    e.createElement(
      I,
      { gutter: [12, 12] },
      ...Qt.map(
        (o) => e.createElement(
          v,
          { key: o.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            f,
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
                o.emoji
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  J,
                  { strong: !0, style: { fontSize: 14 } },
                  o.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  e.createElement(
                    D,
                    { color: "blue", style: { fontSize: 10 } },
                    o.category
                  ),
                  e.createElement(
                    D,
                    {
                      color: o.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    o.transport
                  ),
                  o.env && Object.keys(o.env).length > 0 ? e.createElement(
                    D,
                    { color: "orange", style: { fontSize: 10 } },
                    "需配置密钥"
                  ) : null
                )
              )
            ),
            // Description
            e.createElement(
              P,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              o.description
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
                J,
                { type: "secondary", style: { fontSize: 11 } },
                o.transport === "stdio" ? `${o.command} ${(o.args || []).join(" ")}` : o.url || ""
              ),
              He.has(o.id) ? e.createElement(
                c,
                { size: "small", disabled: !0 },
                "已安装"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  loading: !!$e[o.id],
                  icon: X ? e.createElement(X) : void 0,
                  onClick: () => Yt(o)
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
      T ? e.createElement(T, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        J,
        { type: "secondary", style: { fontSize: 12 } },
        "更多 MCP 服务器模板持续更新中，也支持通过 JSON 配置自定义添加"
      )
    )
  ), en = e.createElement(
    "div",
    null,
    e.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          padding: "12px 16px",
          background: "linear-gradient(135deg, #e8f4fd 0%, #f0f7ff 100%)",
          borderRadius: 8,
          border: "1px solid #d6e4ff"
        }
      },
      e.createElement(
        J,
        { style: { fontSize: 13, color: "#1f4e8c" } },
        "从专家模板库选择预设专家，一键创建并配置系统提示词、审批级别和推荐技能。未来将支持从远程市场获取更多行业专家模板。"
      )
    ),
    e.createElement(h, {
      placeholder: "搜索专家模板...",
      prefix: U ? e.createElement(U) : void 0,
      value: ge,
      onChange: (o) => we(o.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    e.createElement(
      I,
      { gutter: [12, 12] },
      ...qt.map(
        (o) => e.createElement(
          v,
          { key: o.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            f,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => Vt(o)
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
              e.createElement(Be, {
                name: o.name,
                size: 40
              }),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  J,
                  { strong: !0, style: { fontSize: 14 } },
                  o.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4 } },
                  e.createElement(
                    D,
                    { color: "blue", style: { fontSize: 10 } },
                    o.category
                  ),
                  o.approvalLevel === "MANUAL" ? e.createElement(
                    D,
                    { color: "orange", style: { fontSize: 10 } },
                    "需审批"
                  ) : e.createElement(
                    D,
                    { color: "green", style: { fontSize: 10 } },
                    "自动"
                  )
                )
              )
            ),
            e.createElement(
              P,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              o.description.replace(/\*\*(.+?)\*\*/g, "$1")
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
                J,
                { type: "secondary", style: { fontSize: 11 } },
                `推荐 ${o.recommendedSkills.length} 个技能`
              ),
              e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: M ? e.createElement(M) : void 0
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
      T ? e.createElement(T, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        J,
        { type: "secondary", style: { fontSize: 12 } },
        "更多专家模板持续更新中，未来将支持 OpenScience、RPA 等行业扩展"
      )
    )
  ), tn = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        M ? e.createElement(M, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: Xt
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        X ? e.createElement(X, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: Zt
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        w ? e.createElement(w, { style: { fontSize: 14 } }) : null,
        "专家模板"
      ),
      children: en
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(lt, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 创建专家模板 · 随时更新能力和专家",
      extra: e.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        e.createElement(
          c,
          {
            icon: R ? e.createElement(R) : void 0,
            onClick: () => xe(!0)
          },
          "配置源"
        ),
        e.createElement(
          c,
          {
            type: "primary",
            icon: j ? e.createElement(j) : void 0,
            onClick: () => {
              Je(le, ae, {}), ye();
            },
            loading: ve || ie
          },
          "刷新"
        )
      )
    }),
    e.createElement(V, {
      items: tn,
      activeKey: S,
      onChange: (o) => p(o)
    }),
    // Source config modal
    e.createElement(cl, {
      open: ke,
      onClose: () => xe(!1),
      sources: Le,
      onChange: (o) => {
        De(o), ye(o);
      }
    })
  );
}
function gl() {
  var c;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = E().React, a = "ugsci", n = E().antdIcons || {}, l = n.UserSwitchOutlined, r = n.ToolOutlined, s = n.ThunderboltOutlined, i = n.ShopOutlined;
  e.route.add(a, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: Jn
  }), e.menu.add(a, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家",
    icon: l ? t.createElement(l, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => Xe()
  }), e.route.add(a, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: tl
  }), e.menu.add(a, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "工具",
    icon: r ? t.createElement(r, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.capabilities",
    order: 6,
    visible: () => Xe()
  }), e.route.add(a, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: al
  }), e.menu.add(a, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能",
    icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.skills-center",
    order: 7,
    visible: () => Xe()
  }), e.route.add(a, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: pl
  }), e.menu.add(a, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: i ? t.createElement(i, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 8,
    visible: () => Xe()
  }), (c = e.sidebar) != null && c.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
    "ugsci.experts",
    "ugsci.capabilities",
    "ugsci.skills-center",
    "ugsci.market"
  ]), console.info("[ugsci] Registered 4 items for simple-mode visibility")) : console.warn(
    "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode"
  );
  const h = [
    "core.skills",
    "core.tools",
    "core.mcp",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool"
  ];
  for (const m of h) {
    try {
      const v = e.menu.snapshot("primary.agentScoped").find((f) => f.id === m);
      v && e.menu.replace(a, m, {
        ...v,
        visible: () => !Xe()
      });
    } catch {
    }
    try {
      const v = e.menu.snapshot("primary.settings").find((f) => f.id === m);
      v && e.menu.replace(a, m, {
        ...v,
        visible: () => !Xe()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active"
  );
}
function mt() {
  try {
    gl();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(mt, 500);
  }
}
var Pt;
if ((Pt = window.QwenPaw) != null && Pt.host)
  mt();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), mt());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
