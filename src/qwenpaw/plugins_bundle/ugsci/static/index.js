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
async function te(e, t) {
  const r = await fetch(Ye(e), {
    ...t,
    headers: { ..._t(), ...(t == null ? void 0 : t.headers) || {} }
  });
  if (!r.ok) {
    const n = await r.text().catch(() => "");
    throw new Error(n || `HTTP ${r.status}`);
  }
  return r.status === 204 ? null : r.json();
}
async function dt() {
  const e = await te("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function nt(e) {
  return te(`/agents/${encodeURIComponent(e)}`);
}
async function ut(e) {
  return await te("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function pt(e = !1) {
  return await te(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function ln(e) {
  const t = await te(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function an() {
  return await te("/skills/workspaces") || [];
}
async function rn(e) {
  return await te("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function on(e, t) {
  return te(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function sn(e, t) {
  await te(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function cn(e, t, r) {
  return te("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ client_key: t, client: r })
  });
}
async function mn(e, t) {
  return await te(
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
  const r = E();
  return r.ReactMarkdown && r.remarkGfm ? t.createElement(
    r.ReactMarkdown,
    { remarkPlugins: [r.remarkGfm] },
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
const dn = [
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
async function un(e, t) {
  const r = {
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
    body: JSON.stringify(r)
  });
}
function et(e, t) {
  const r = e.find(
    (l) => l.name === t || l.name === t.replace(/\s+/g, "")
  );
  if (r) return r.id;
  const n = e.find(
    (l) => l.name.includes(t) || t.includes(l.name) || l.name.replace(/\s+/g, "").includes(t.replace(/\s+/g, ""))
  );
  return n ? n.id : null;
}
function pn(e) {
  var r;
  const t = e.members.map((n) => `- ${n.name}（${n.role}）`).join(`
`);
  if (e.custom && e.steps && e.steps.length > 0) {
    const n = e.steps.map((a, s) => {
      const i = a.passContext ? "（传递上一步的结果作为上下文）" : "（独立执行，不传递上下文）";
      return `${s + 1}. 向「${a.agentName}」发送请求：${a.instruction} ${i}`;
    }).join(`
`);
    return `${e.mode === "pipeline" ? "请按顺序依次执行以下步骤，每步使用 chat_with_agent 咨询对应专家：" : e.mode === "roundtable" ? "请同时向以下专家分别发送独立请求（不传递上下文），收集所有结果后综合：" : `你是团队协调者（${e.coordinatorName || ((r = e.members[0]) == null ? void 0 : r.name) || ""}），请按需调用以下专家完成任务：`}

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
function gn({ team: e }) {
  const t = E().React, { Typography: r, Tag: n } = E().antd, { Text: l } = r, a = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙"
  }, s = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff"
  }, i = e.steps || [], y = i.length > 0;
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
      ...y ? i.map((c, d) => (e.members.find(
        (I) => I.name === c.agentName
      ), [
        d > 0 && e.mode !== "roundtable" ? t.createElement(
          "div",
          {
            key: `arrow-${d}`,
            style: {
              textAlign: "center",
              color: s[e.mode],
              fontSize: 14
            }
          },
          a[e.mode]
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
      ])).flat() : e.members.map((c, d) => [
        d > 0 && e.mode !== "roundtable" ? t.createElement(
          "div",
          {
            key: `arrow-${d}`,
            style: {
              textAlign: "center",
              color: s[e.mode],
              fontSize: 14
            }
          },
          a[e.mode]
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
function yn({
  open: e,
  onClose: t,
  agents: r,
  editingTeam: n,
  onSaved: l
}) {
  const a = E().React, { useState: s, useEffect: i, useCallback: y } = a, {
    Modal: c,
    Input: d,
    Button: I,
    Select: h,
    Tag: f,
    Typography: N,
    Switch: v,
    Empty: L,
    message: P,
    Divider: G,
    Steps: S
  } = E().antd, { PlusOutlined: Y, DeleteOutlined: B, SaveOutlined: _, ArrowRightOutlined: D } = E().antdIcons || {}, { Text: F, Paragraph: g } = N, [O, T] = s(""), [Z, C] = s("🤝"), [x, u] = s(""), [R, q] = s(
    "pipeline"
  ), [J, M] = s(""), [p, b] = s(""), [A, re] = s([]), [K, le] = s([]), [ee, H] = s(!1);
  i(() => {
    e && (n ? (T(n.name), C(n.emoji), u(n.description), q(n.mode), M(n.coordinatorName || ""), b(n.taskTemplate), re(n.steps || []), le(n.members.map((X) => X.name))) : (T(""), C("🤝"), u(""), q("pipeline"), M(""), b(`请执行以下任务：
任务描述：{任务描述}`), re([]), le([])));
  }, [e, n]);
  const $ = y(() => {
    if (R === "roundtable") {
      const X = K.map((me) => ({
        agentName: me,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      re(X);
    } else if (R === "pipeline") {
      const X = new Map(A.map((j) => [j.agentName, j])), me = K.map((j) => X.get(j) || {
        agentName: j,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      re(me);
    }
  }, [R, K, A]), w = (X) => {
    K.includes(X) || (le([...K, X]), R === "coordinator" && !J && M(X));
  }, m = (X) => {
    le(K.filter((me) => me !== X)), re(A.filter((me) => me.agentName !== X)), J === X && M(K[0] || "");
  }, Q = (X, me, j) => {
    const ae = [...A];
    ae[X] = { ...ae[X], [me]: j }, re(ae);
  }, se = () => {
    if (!O.trim()) {
      P.warning("请输入团队名称");
      return;
    }
    if (K.length < 2) {
      P.warning("至少需要选择 2 个成员");
      return;
    }
    if (!p.trim()) {
      P.warning("请输入任务模板");
      return;
    }
    if (R === "coordinator" && !J) {
      P.warning("请选择协调者");
      return;
    }
    H(!0);
    try {
      const X = K.map(
        (ne) => {
          var pe;
          const W = r.find((de) => de.name === ne);
          return {
            name: ne,
            role: ((pe = W == null ? void 0 : W.description) == null ? void 0 : pe.slice(0, 30)) || "团队成员",
            emoji: ""
          };
        }
      );
      let me = A;
      (A.length === 0 || A.length !== K.length) && (me = K.map((ne) => ({
        agentName: ne,
        instruction: "请完成你的专业部分",
        passContext: R === "pipeline"
      })));
      const j = {
        id: (n == null ? void 0 : n.id) || `custom-${Date.now()}`,
        name: O.trim(),
        emoji: Z,
        category: "自定义",
        description: x.trim() || `${O.trim()}（${K.length}人团队）`,
        mode: R,
        members: X,
        coordinatorName: R === "coordinator" ? J : void 0,
        taskTemplate: p.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: me,
        custom: !0,
        createdAt: (n == null ? void 0 : n.createdAt) || Date.now()
      }, ae = Ze(), oe = ae.findIndex((ne) => ne.id === j.id);
      oe >= 0 ? ae[oe] = j : ae.push(j), Mt(ae), P.success(n ? "团队已更新" : "团队已创建"), l(), t();
    } catch (X) {
      P.error(X.message || "保存失败");
    } finally {
      H(!1);
    }
  }, he = r.filter(
    (X) => !K.includes(X.name)
  );
  return a.createElement(
    c,
    {
      open: e,
      onCancel: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement(
          "span",
          { style: { fontSize: 20 } },
          n ? "✏️" : "➕"
        ),
        a.createElement(
          "span",
          null,
          n ? "编辑专家团" : "创建专家团"
        )
      ),
      width: 720,
      onOk: se,
      okText: "保存团队",
      confirmLoading: ee,
      okButtonProps: {
        icon: _ ? a.createElement(_) : void 0
      }
    },
    // Step 1: Basic info
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        F,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 基本信息"
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        K.length > 0 ? a.createElement(ft, {
          members: K,
          size: 36
        }) : null,
        a.createElement(d, {
          placeholder: "团队名称（如：储层评价团队）",
          value: O,
          onChange: (X) => T(X.target.value),
          style: { flex: 1 }
        })
      ),
      a.createElement(d.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: x,
        onChange: (X) => u(X.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(
          F,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式："
        ),
        a.createElement(h, {
          value: R,
          onChange: (X) => q(X),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" }
          ]
        })
      )
    ),
    a.createElement(G, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        F,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 选择团队成员"
      ),
      // Available agents
      he.length > 0 ? a.createElement(
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
        ...he.map(
          (X) => a.createElement(
            I,
            {
              key: X.id,
              size: "small",
              icon: Y ? a.createElement(Y) : void 0,
              onClick: () => w(X.name)
            },
            X.name
          )
        )
      ) : null,
      // Selected members
      K.length === 0 ? a.createElement(L, {
        description: "请从上方添加团队成员",
        image: L.PRESENTED_IMAGE_SIMPLE
      }) : a.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...K.map(
          (X) => a.createElement(
            "div",
            {
              key: X,
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
            a.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 6 } },
              a.createElement(Be, { name: X, size: 24 }),
              a.createElement(
                F,
                { strong: !0, style: { fontSize: 13 } },
                X
              ),
              R === "coordinator" && J === X ? a.createElement(
                f,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            a.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              R === "coordinator" ? a.createElement(
                I,
                {
                  size: "small",
                  type: "link",
                  onClick: () => M(X)
                },
                "设为协调者"
              ) : null,
              a.createElement(
                I,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: B ? a.createElement(B) : void 0,
                  onClick: () => m(X)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    a.createElement(G, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    K.length > 0 ? a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        F,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${R === "roundtable" ? "（各步独立执行）" : R === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      a.createElement(
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
      A.length === 0 ? a.createElement(
        F,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : a.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...A.map(
          (X, me) => a.createElement(
            "div",
            {
              key: me,
              style: {
                padding: 8,
                background: "#fff",
                borderRadius: 6,
                border: "1px solid #e8e8e8"
              }
            },
            a.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6
                }
              },
              R === "pipeline" ? a.createElement(
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
                `${me + 1}`
              ) : a.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              a.createElement(
                f,
                { color: "blue", style: { fontSize: 11 } },
                X.agentName
              ),
              a.createElement(
                "div",
                { style: { flex: 1 } },
                a.createElement(d, {
                  placeholder: "请输入该步骤的指令...",
                  value: X.instruction,
                  onChange: (j) => Q(me, "instruction", j.target.value),
                  size: "small"
                })
              )
            ),
            a.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  paddingLeft: 28
                }
              },
              a.createElement(v, {
                size: "small",
                checked: X.passContext,
                onChange: (j) => Q(me, "passContext", j)
              }),
              a.createElement(
                F,
                { type: "secondary", style: { fontSize: 11 } },
                X.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    a.createElement(G, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    a.createElement(
      "div",
      null,
      a.createElement(
        F,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${K.length > 0 ? "4" : "3"}. 任务模板`
      ),
      a.createElement(d.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: p,
        onChange: (X) => b(X.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      a.createElement(
        F,
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
  onLaunch: r,
  onEdit: n,
  onDelete: l
}) {
  var x;
  const a = E().React, { useState: s } = a, { Card: i, Tag: y, Typography: c, Button: d, Tooltip: I } = E().antd, {
    TeamOutlined: h,
    RocketOutlined: f,
    UserOutlined: N,
    EditOutlined: v,
    DeleteOutlined: L,
    DownOutlined: P,
    UpOutlined: G
  } = E().antdIcons || {}, { Text: S, Paragraph: Y } = c, [B, _] = s(!1), D = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, F = D[e.mode] || D.coordinator, g = e.members.map((u) => {
    const R = et(t, u.name);
    return { ...u, found: !!R, agentId: R };
  }), O = g.filter((u) => u.found).length, T = O === e.members.length, Z = e.coordinatorName || ((x = e.members[0]) == null ? void 0 : x.name), C = Z ? et(t, Z) : null;
  return a.createElement(
    i,
    {
      hoverable: !0,
      size: "small",
      style: { height: "100%", display: "flex", flexDirection: "column" }
    },
    // Header: emoji + name + mode tag + custom badge
    a.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10
        }
      },
      a.createElement(ft, {
        members: e.members.map((u) => u.name),
        size: 36
      }),
      a.createElement(
        "div",
        { style: { flex: 1 } },
        a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          a.createElement(
            S,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? a.createElement(
            y,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        a.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          a.createElement(
            y,
            { color: F.color, style: { fontSize: 10 } },
            F.label
          ),
          a.createElement(
            y,
            { style: { fontSize: 10 } },
            `${O}/${e.members.length}`
          ),
          T ? null : a.createElement(
            y,
            { color: "orange", style: { fontSize: 10 } },
            "缺少成员"
          )
        )
      ),
      // Edit/delete for custom teams
      e.custom ? a.createElement(
        "div",
        { style: { display: "flex", gap: 2 } },
        n ? a.createElement(
          I,
          { title: "编辑" },
          a.createElement(d, {
            type: "text",
            size: "small",
            icon: v ? a.createElement(v) : void 0,
            onClick: (u) => {
              u.stopPropagation(), n(e);
            }
          })
        ) : null,
        l ? a.createElement(
          I,
          { title: "删除" },
          a.createElement(d, {
            type: "text",
            size: "small",
            danger: !0,
            icon: L ? a.createElement(L) : void 0,
            onClick: (u) => {
              u.stopPropagation(), l(e);
            }
          })
        ) : null
      ) : null
    ),
    // Description
    a.createElement(
      Y,
      {
        type: "secondary",
        style: { fontSize: 12, margin: 0, marginBottom: 10, lineHeight: 1.5 },
        ellipsis: { rows: 2 }
      },
      e.description
    ),
    // Member avatars
    a.createElement(
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
        (u) => a.createElement(
          I,
          {
            key: u.name,
            title: `${u.name}（${u.role}）${u.found ? "" : " - 未创建"}`
          },
          a.createElement(
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
            a.createElement(Be, { name: u.name, size: 18 }),
            a.createElement(
              S,
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
    a.createElement(
      d,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (u) => {
          u.stopPropagation(), _(!B);
        },
        icon: B ? G ? a.createElement(G) : "▲" : P ? a.createElement(P) : "▼"
      },
      B ? "收起流程" : "查看执行流程"
    ),
    B ? a.createElement(gn, { team: e }) : null,
    // Footer: launch button
    a.createElement(
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
      a.createElement(
        S,
        { type: "secondary", style: { fontSize: 11 } },
        Z ? `协调者: ${Z}` : ""
      ),
      a.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: f ? a.createElement(f) : void 0,
          disabled: !C,
          onClick: () => r(e),
          style: Ae
        },
        "发起团队任务"
      )
    )
  );
}
function fn({
  agents: e,
  onLaunch: t
}) {
  const r = E().React, { useMemo: n, useState: l, useCallback: a, useEffect: s } = r, {
    Row: i,
    Col: y,
    Input: c,
    Empty: d,
    Typography: I,
    Tag: h,
    Button: f,
    Divider: N,
    message: v,
    Popconfirm: L
  } = E().antd, { SearchOutlined: P, TeamOutlined: G, PlusOutlined: S, RocketOutlined: Y } = E().antdIcons || {}, { Text: B } = I, [_, D] = l(""), [F, g] = l([]), [O, T] = l(!1), [Z, C] = l(null);
  s(() => {
    g(Ze());
  }, []);
  const x = a(() => {
    g(Ze());
  }, []), u = a(
    (A) => {
      const K = Ze().filter((le) => le.id !== A.id);
      Mt(K), g(K), v.success(`团队「${A.name}」已删除`);
    },
    [v]
  ), R = a((A) => {
    C(A), T(!0);
  }, []), q = a(() => {
    C(null), T(!0);
  }, []), J = n(() => [...F, ...dn], [F]), M = n(() => {
    if (!_.trim()) return J;
    const A = _.toLowerCase();
    return J.filter(
      (re) => re.name.toLowerCase().includes(A) || re.description.toLowerCase().includes(A) || re.category.toLowerCase().includes(A)
    );
  }, [J, _]), p = M.filter((A) => A.custom), b = M.filter((A) => !A.custom);
  return r.createElement(
    "div",
    null,
    // Info banner
    r.createElement(
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
      r.createElement(
        B,
        { style: { fontSize: 13, color: "#389e0d" } },
        "多智能体协同 — 选择预设团队或创建自定义团队，支持流水线、圆桌讨论、协调者三种编排模式。"
      ),
      r.createElement(
        f,
        {
          type: "primary",
          size: "small",
          icon: S ? r.createElement(S) : void 0,
          onClick: q,
          style: Ae
        },
        "创建专家团"
      )
    ),
    // Search
    r.createElement(c, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: P ? r.createElement(P) : void 0,
      value: _,
      onChange: (A) => D(A.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Custom teams section
    p.length > 0 ? r.createElement(
      "div",
      { style: { marginBottom: 20 } },
      r.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 10
          }
        },
        r.createElement("span", { style: { fontSize: 16 } }),
        r.createElement(
          B,
          { strong: !0, style: { fontSize: 14 } },
          `自定义团队 (${p.length})`
        )
      ),
      r.createElement(
        i,
        { gutter: [12, 12] },
        ...p.map(
          (A) => r.createElement(
            y,
            { key: A.id, xs: 24, sm: 12, md: 8 },
            r.createElement(bt, {
              team: A,
              agents: e,
              onLaunch: t,
              onEdit: R,
              onDelete: u
            })
          )
        )
      ),
      r.createElement(N, { style: { margin: "16px 0" } })
    ) : null,
    // Preset teams section
    b.length > 0 ? r.createElement(
      "div",
      null,
      r.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 10
          }
        },
        r.createElement("span", { style: { fontSize: 16 } }),
        r.createElement(
          B,
          { strong: !0, style: { fontSize: 14 } },
          `预设团队 (${b.length})`
        ),
        r.createElement(
          B,
          { type: "secondary", style: { fontSize: 12 } },
          "· 行业典型工作流模板"
        )
      ),
      r.createElement(
        i,
        { gutter: [12, 12] },
        ...b.map(
          (A) => r.createElement(
            y,
            { key: A.id, xs: 24, sm: 12, md: 8 },
            r.createElement(bt, {
              team: A,
              agents: e,
              onLaunch: t
            })
          )
        )
      )
    ) : null,
    // Empty state
    M.length === 0 ? r.createElement(d, {
      description: "未找到匹配的专家团队，点击「创建专家团」自定义",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : null,
    // Team Builder Modal
    r.createElement(yn, {
      open: O,
      onClose: () => {
        T(!1), C(null);
      },
      agents: e,
      editingTeam: Z,
      onSaved: x
    })
  );
}
function En(e) {
  var r;
  const t = [];
  for (const n of e) {
    if (n.enabled === !1) continue;
    const l = (r = n.description) == null ? void 0 : r.trim();
    if (!l) continue;
    let a = l;
    if (a = a.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(a) ? a = `请${a}` : /^(a |an |the )/i.test(a) ? a = `Help me with ${a}` : /[。？！.?!]$/.test(a) || (a = `帮我${a}`), a.length > 80 && (a = a.substring(0, 77) + "..."), t.push(a), t.length >= 4) break;
  }
  return t;
}
async function hn(e) {
  return await te("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function tt(e, t, r) {
  await te(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: r })
  });
}
async function St(e, t) {
  const r = await nt(e);
  r.system_prompt_files = t, await te(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(r)
  });
}
async function At(e, t) {
  await te("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: t,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function vn(e, t) {
  await te(`/skills/${encodeURIComponent(t)}/enable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function $t(e, t) {
  await te(`/skills/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function bn(e, t) {
  return te("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Sn(e, t) {
  return te("/skills/batch-disable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function xn(e, t) {
  return te("/skills/batch-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function yt(e) {
  return await te("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Rt(e, t) {
  await te(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Lt(e, t) {
  return te("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function wn(e, t) {
  return te(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Cn(e, t) {
  await te(`/skills/${encodeURIComponent(t)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
function kn(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const r = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!r) return { number: 6, unit: "h" };
  const n = parseInt(r[1] || "0", 10), l = parseInt(r[2] || "0", 10), a = parseInt(r[3] || "0", 10), s = n * 60 + l + Math.round(a / 60);
  return s <= 0 ? { number: 6, unit: "h" } : s >= 60 && s % 60 === 0 ? { number: s / 60, unit: "h" } : { number: s, unit: "m" };
}
function Tn(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function zn(e) {
  return te("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function In(e, t) {
  return te("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Pn(e) {
  await te("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function _n(e) {
  return te("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function On(e, t) {
  return te("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Mn(e) {
  return (await te("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function An(e, t) {
  await te("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function $n() {
  return (await te("/config/user-timezone")).timezone || "UTC";
}
async function Rn(e) {
  await te("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function Ln(e) {
  return await te("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const xt = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function lt({
  title: e,
  subtitle: t,
  extra: r
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
    r ? n.createElement(l, null, r) : null
  );
}
function wt({
  items: e,
  max: t = 5,
  color: r = "blue",
  emptyText: n = "无"
}) {
  const l = E().React, { Tag: a } = E().antd;
  return !e || e.length === 0 ? l.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    n
  ) : l.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (s, i) => l.createElement(
        a,
        { key: i, color: r, style: { fontSize: 11, marginRight: 0 } },
        s
      )
    ),
    e.length > t ? l.createElement(
      a,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function Bt({
  open: e,
  onClose: t,
  poolSkills: r,
  installedSkillNames: n,
  loading: l,
  onInstall: a
}) {
  const s = E().React, { useState: i, useEffect: y, useMemo: c } = s, { Modal: d, Button: I, Empty: h, Spin: f, Input: N, Tag: v, Tooltip: L, Typography: P } = E().antd, { CheckOutlined: G, SearchOutlined: S } = E().antdIcons || {}, { Text: Y } = P, [B, _] = i([]), [D, F] = i("");
  y(() => {
    e && (_([]), F(""));
  }, [e]);
  const g = c(() => {
    if (!D.trim()) return r;
    const C = D.toLowerCase();
    return r.filter(
      (x) => {
        var u, R;
        return x.name.toLowerCase().includes(C) || ((u = x.description) == null ? void 0 : u.toLowerCase().includes(C)) || ((R = x.tags) == null ? void 0 : R.some((q) => q.toLowerCase().includes(C)));
      }
    );
  }, [r, D]), O = g.filter(
    (C) => !n.includes(C.name)
  ), T = (C) => {
    _(
      (x) => x.includes(C) ? x.filter((u) => u !== C) : [...x, C]
    );
  }, Z = async () => {
    B.length !== 0 && (await a(B), _([]));
  };
  return s.createElement(
    d,
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
          Y,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${B.length} 个技能`
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          s.createElement(I, { onClick: t }, "取消"),
          s.createElement(
            I,
            {
              type: "primary",
              onClick: Z,
              disabled: B.length === 0
            },
            B.length > 0 ? `添加 (${B.length})` : "添加"
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
      s.createElement(N, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: S ? s.createElement(S) : void 0,
        value: D,
        onChange: (C) => F(C.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      s.createElement(
        I,
        {
          size: "small",
          type: "primary",
          onClick: () => _(O.map((C) => C.name))
        },
        "全选"
      ),
      s.createElement(
        I,
        {
          size: "small",
          onClick: () => _([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    l ? s.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      s.createElement(f, { size: "large" })
    ) : g.length === 0 ? s.createElement(h, {
      description: D ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: h.PRESENTED_IMAGE_SIMPLE
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
        const x = B.includes(C.name), u = n.includes(C.name);
        return s.createElement(
          "div",
          {
            key: C.name,
            onClick: () => !u && T(C.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${x ? "#0072f5" : "#e8e8e8"}`,
              borderRadius: 6,
              cursor: u ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: x ? "rgba(0, 114, 245, 0.06)" : u ? "#fafafa" : "#fff",
              opacity: u ? 0.5 : 1,
              minHeight: 64
            }
          },
          x ? s.createElement(
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
            G ? s.createElement(G) : "✓"
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
                paddingRight: u || x ? 24 : 0
              }
            },
            s.createElement(
              "span",
              { style: { fontSize: 16 } },
              C.emoji || "⚡"
            ),
            s.createElement(
              L,
              { title: C.name },
              s.createElement(
                Y,
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
              (R, q) => s.createElement(
                v,
                {
                  key: q,
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
function Bn({ agentId: e }) {
  const t = E().React, { useState: r, useEffect: n, useCallback: l } = t, {
    Switch: a,
    InputNumber: s,
    Select: i,
    Button: y,
    Spin: c,
    Space: d,
    Typography: I,
    message: h
  } = E().antd, { PlayCircleOutlined: f, SaveOutlined: N } = E().antdIcons || {}, { Text: v } = I, [L, P] = r(!0), [G, S] = r(!1), [Y, B] = r(!1), [_, D] = r(!1), [F, g] = r(6), [O, T] = r("h"), [Z, C] = r("main"), [x, u] = r(300), [R, q] = r(!1), [J, M] = r("08:00"), [p, b] = r("22:00"), A = l(async () => {
    var $, w;
    P(!0);
    try {
      const m = await zn(e), Q = kn(m.every ?? "6h");
      D(m.enabled ?? !1), g(Q.number), T(Q.unit), C(m.target ?? "main"), u(m.timeoutSeconds ?? 300), q(!!m.activeHours), M((($ = m.activeHours) == null ? void 0 : $.start) ?? "08:00"), b(((w = m.activeHours) == null ? void 0 : w.end) ?? "22:00");
    } catch (m) {
      h.error(m.message || "加载心跳配置失败");
    } finally {
      P(!1);
    }
  }, [e]);
  n(() => {
    A();
  }, [A]);
  const re = async () => {
    S(!0);
    try {
      await In(e, {
        enabled: _,
        every: Tn({ number: F, unit: O }),
        target: Z,
        timeoutSeconds: x,
        activeHours: R && J && p ? { start: J, end: p } : void 0
      }), h.success("心跳配置已保存");
    } catch ($) {
      h.error($.message || "保存心跳配置失败");
    } finally {
      S(!1);
    }
  }, K = async () => {
    B(!0);
    try {
      await Pn(e), h.success("已触发心跳检查");
    } catch ($) {
      h.error($.message || "触发心跳失败");
    } finally {
      B(!1);
    }
  };
  if (L)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(c, { size: "large" })
    );
  const le = ($, w, m) => t.createElement(
    "div",
    { style: jt },
    t.createElement("div", { style: qe }, $),
    w,
    m ? t.createElement(
      v,
      { type: "secondary", style: Nt },
      m
    ) : null
  ), ee = ($, w, m, Q) => t.createElement(
    "div",
    { style: Dt },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: qe }, $),
      w
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: qe }, m),
      Q
    )
  ), { Divider: H } = E().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: Ne }, "基本设置"),
    le(
      "启用心跳",
      t.createElement(a, {
        checked: _,
        onChange: ($) => D($)
      }),
      _ ? "已启用，专家将定期自检" : "已停用"
    ),
    ee(
      "检查频率",
      t.createElement(
        d,
        null,
        t.createElement(s, {
          min: 1,
          value: F,
          onChange: ($) => g($ ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(i, {
          value: O,
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
        value: Z,
        onChange: ($) => C($),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    le(
      "超时时间 (秒)",
      t.createElement(s, {
        min: 1,
        max: 3600,
        value: x,
        onChange: ($) => u($ ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(H, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "活跃时段"),
    le(
      "启用活跃时段限制",
      t.createElement(a, {
        checked: R,
        onChange: ($) => q($)
      }),
      "仅在指定时段内触发心跳"
    ),
    R ? ee(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: J,
        onChange: ($) => M($.target.value),
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
        value: p,
        onChange: ($) => b($.target.value),
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
        y,
        {
          type: "primary",
          icon: N ? t.createElement(N) : void 0,
          loading: G,
          onClick: re,
          style: Ae
        },
        "保存配置"
      ),
      t.createElement(
        y,
        {
          icon: f ? t.createElement(f) : void 0,
          loading: Y,
          onClick: K
        },
        "立即执行"
      )
    )
  );
}
function jn({
  agentId: e,
  onRefresh: t
}) {
  const r = E().React, { useState: n, useEffect: l, useCallback: a } = r, {
    List: s,
    Tag: i,
    Switch: y,
    Button: c,
    Empty: d,
    Spin: I,
    Typography: h,
    message: f
  } = E().antd, { PlusOutlined: N, ReloadOutlined: v, DeleteOutlined: L } = E().antdIcons || {}, { Text: P, Paragraph: G } = h, [S, Y] = n([]), [B, _] = n(!0), [D, F] = n(!1), [g, O] = n([]), [T, Z] = n(!1), C = a(async () => {
    _(!0);
    try {
      const M = await ut(e);
      Y(M);
    } catch (M) {
      f.error(M.message || "加载技能失败"), Y([]);
    } finally {
      _(!1);
    }
  }, [e]);
  l(() => {
    C();
  }, [C]);
  const x = async () => {
    F(!0), Z(!0);
    try {
      const M = await pt(!0);
      O(M);
    } catch (M) {
      f.error(M.message || "加载技能池失败");
    } finally {
      Z(!1);
    }
  }, u = async (M) => {
    let p = 0, b = 0;
    for (const A of M)
      try {
        await At(e, A), p++;
      } catch {
        b++;
      }
    p > 0 ? (f.success(
      `成功添加 ${p} 个技能${b > 0 ? `，${b} 个失败` : ""}`
    ), C(), t()) : b > 0 && f.error("添加技能失败"), F(!1);
  }, R = async (M, p) => {
    try {
      p ? await vn(e, M.name) : await Cn(e, M.name), f.success(p ? "已启用" : "已停用"), C(), t();
    } catch (b) {
      f.error(b.message || "操作失败");
    }
  }, q = async (M) => {
    try {
      await $t(e, M), f.success(`技能「${M}」已移除`), C(), t();
    } catch (p) {
      f.error(p.message || "移除技能失败");
    }
  };
  if (B)
    return r.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      r.createElement(I, { size: "large" })
    );
  const J = S.filter((M) => M.enabled !== !1);
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
          marginBottom: 12
        }
      },
      r.createElement(
        P,
        { strong: !0 },
        `技能列表 (${S.length}，已启用 ${J.length})`
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          c,
          {
            size: "small",
            icon: v ? r.createElement(v) : void 0,
            onClick: C
          },
          "刷新"
        ),
        r.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: N ? r.createElement(N) : void 0,
            onClick: x,
            style: Ae
          },
          "从技能池添加"
        )
      )
    ),
    S.length === 0 ? r.createElement(d, {
      description: "该专家暂无技能",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(s, {
      dataSource: S,
      renderItem: (M) => r.createElement(
        s.Item,
        {
          actions: [
            r.createElement(y, {
              key: "toggle",
              size: "small",
              checked: M.enabled !== !1,
              onChange: (p) => R(M, p)
            }),
            r.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: L ? r.createElement(L) : void 0,
                onClick: () => q(M.name)
              },
              "移除"
            )
          ]
        },
        r.createElement(
          "div",
          { style: { width: "100%" } },
          r.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4
              }
            },
            M.emoji ? r.createElement(
              "span",
              { style: { fontSize: 16 } },
              M.emoji
            ) : null,
            r.createElement(P, { strong: !0 }, M.name),
            M.version_text ? r.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${M.version_text}`
            ) : null
          ),
          M.description ? r.createElement(
            G,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            M.description
          ) : null
        )
      )
    }),
    r.createElement(Bt, {
      open: D,
      onClose: () => F(!1),
      poolSkills: g,
      installedSkillNames: S.map((M) => M.name),
      loading: T,
      onInstall: u
    })
  );
}
function Dn({
  agentId: e,
  onRefresh: t,
  isActive: r
}) {
  const n = E().React, { useState: l, useEffect: a, useCallback: s } = n, {
    List: i,
    Tag: y,
    Button: c,
    Empty: d,
    Spin: I,
    Modal: h,
    Input: f,
    Typography: N,
    message: v
  } = E().antd, { PlusOutlined: L, ReloadOutlined: P, DeleteOutlined: G } = E().antdIcons || {}, { Text: S, Paragraph: Y } = N, { TextArea: B } = f, [_, D] = l([]), [F, g] = l(!0), [O, T] = l(!1), [Z, C] = l(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [x, u] = l(!1), R = s(async () => {
    g(!0);
    try {
      const p = await yt(e);
      D(p);
    } catch (p) {
      v.error(p.message || "加载 MCP 失败"), D([]);
    } finally {
      g(!1);
    }
  }, [e]);
  a(() => {
    R();
  }, [R]), a(() => {
    r && R();
  }, [r, R]);
  const q = async (p) => {
    try {
      await wn(e, p), v.success("已切换 MCP 状态"), R(), t();
    } catch (b) {
      v.error(b.message || "切换失败");
    }
  }, J = async (p) => {
    try {
      await Rt(e, p), v.success(`MCP「${p}」已移除`), R(), t();
    } catch (b) {
      v.error(b.message || "移除 MCP 失败");
    }
  }, M = async () => {
    u(!0);
    try {
      const p = JSON.parse(Z), b = p.mcpServers || p, A = Object.entries(b);
      if (A.length === 0) {
        v.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [re, K] of A) {
        const le = K, ee = le.url ? "streamable_http" : "stdio";
        await Lt(e, {
          client_key: re,
          client: {
            name: le.name || re,
            description: le.description || "",
            enabled: !0,
            transport: ee,
            url: le.url || "",
            command: le.command || "",
            args: le.args || [],
            env: le.env || {},
            cwd: le.cwd || "",
            headers: le.headers || {}
          }
        });
      }
      v.success("MCP 客户端已创建"), T(!1), R(), t();
    } catch (p) {
      p instanceof SyntaxError ? v.error("JSON 格式错误：" + p.message) : v.error(p.message || "创建 MCP 失败");
    } finally {
      u(!1);
    }
  };
  return F ? n.createElement(
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
      n.createElement(S, { strong: !0 }, `MCP 客户端 (${_.length})`),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          c,
          {
            size: "small",
            icon: P ? n.createElement(P) : void 0,
            onClick: R
          },
          "刷新"
        ),
        n.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: L ? n.createElement(L) : void 0,
            onClick: () => T(!0),
            style: Ae
          },
          "添加 MCP"
        )
      )
    ),
    _.length === 0 ? n.createElement(d, {
      description: "该专家暂无 MCP 客户端",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(i, {
      dataSource: _,
      renderItem: (p) => n.createElement(
        i.Item,
        {
          actions: [
            n.createElement(
              c,
              {
                key: "toggle",
                size: "small",
                onClick: () => q(p.key)
              },
              p.enabled ? "停用" : "启用"
            ),
            n.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: G ? n.createElement(G) : void 0,
                onClick: () => J(p.key)
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
            n.createElement(S, { strong: !0 }, p.name || p.key),
            n.createElement(
              y,
              {
                color: p.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              p.enabled ? "启用" : "停用"
            ),
            n.createElement(
              y,
              { color: "purple", style: { fontSize: 10 } },
              p.transport
            )
          ),
          p.description ? n.createElement(
            Y,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            p.description
          ) : null,
          p.tools && p.tools.length > 0 ? n.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "#8c8c8c" } },
            `提供 ${p.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    n.createElement(
      h,
      {
        open: O,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => T(!1),
        onOk: M,
        confirmLoading: x,
        okText: "创建",
        width: 560
      },
      n.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      n.createElement(B, {
        value: Z,
        onChange: (p) => C(p.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function Nn({ agentId: e }) {
  const t = E().React, { useState: r, useEffect: n, useCallback: l, useRef: a } = t, {
    Card: s,
    InputNumber: i,
    Input: y,
    Select: c,
    Switch: d,
    Button: I,
    Spin: h,
    Space: f,
    Typography: N,
    Divider: v,
    message: L
  } = E().antd, { SaveOutlined: P } = E().antdIcons || {}, { Text: G } = N, [S, Y] = r(!0), [B, _] = r(!1), D = a(null), [F, g] = r(60), [O, T] = r(""), [Z, C] = r(!0), [x, u] = r(30), [R, q] = r("zh"), [J, M] = r("UTC"), [p, b] = r(!0), [A, re] = r(100), [K, le] = r(!0), [ee, H] = r(3), [$, w] = r(1), [m, Q] = r(!0), [se, he] = r(3), [X, me] = r(2), [j, ae] = r(60), [oe, ne] = r(1), [W, pe] = r(0), [de, Ie] = r(1), [Te, k] = r(0), [ie, ge] = r(30), [we, Se] = r(50), [Ce, Re] = r("light"), [Ue, Oe] = r("scroll"), [Fe, He] = r("remelight"), [je, Le] = r("AUTO"), De = l(async () => {
    var z, ke, xe, be, ze, $e;
    Y(!0);
    try {
      const [ye, Je, at] = await Promise.all([
        _n(e),
        Mn(e).catch(() => "zh"),
        $n().catch(() => "UTC")
      ]);
      D.current = ye, g(ye.shell_command_timeout ?? 60), T(ye.shell_command_executable ?? "");
      const Ve = ye.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      C(Ve.enabled ?? !0), u(Ve.timeout_seconds ?? 30), q(Je), M(at);
      const We = ye.loop ?? {};
      b(((z = We.iteration) == null ? void 0 : z.enabled) ?? !0), re(((ke = We.iteration) == null ? void 0 : ke.max_iterations) ?? ye.max_iters ?? 100), le(((xe = We.doom_loop) == null ? void 0 : xe.enabled) ?? !0), H(((be = We.doom_loop) == null ? void 0 : be.window_size) ?? 3), w(((ze = We.doom_loop) == null ? void 0 : ze.similarity_threshold) ?? 1), Q(ye.llm_retry_enabled ?? !0), he(ye.llm_max_retries ?? 3), me(ye.llm_backoff_base ?? 2), ae(ye.llm_backoff_cap ?? 60), ne(ye.llm_max_concurrent ?? 1), pe(ye.llm_max_qpm ?? 0), Ie(ye.llm_rate_limit_pause ?? 1), k(ye.llm_rate_limit_jitter ?? 0), ge(ye.llm_acquire_timeout ?? 30), Se(ye.history_max_length ?? 50), Re(ye.context_manager_backend ?? "light"), Oe((($e = ye.light_context_config) == null ? void 0 : $e.strategy) ?? "scroll"), He(ye.memory_manager_backend ?? "remelight"), Le(ye.approval_level ?? "AUTO");
    } catch (ye) {
      L.error(ye.message || "加载运行配置失败");
    } finally {
      Y(!1);
    }
  }, [e]);
  n(() => {
    De();
  }, [De]);
  const Ge = async () => {
    var ke, xe;
    const z = D.current;
    if (z) {
      _(!0);
      try {
        const be = {
          ...z,
          max_iters: A,
          loop: {
            ...z.loop ?? {},
            iteration: { enabled: p, max_iterations: A },
            doom_loop: {
              enabled: K,
              window_size: ee,
              similarity_threshold: $,
              stages: ((xe = (ke = z.loop) == null ? void 0 : ke.doom_loop) == null ? void 0 : xe.stages) ?? []
            }
          },
          shell_command_timeout: F,
          shell_command_executable: O,
          auto_title_config: {
            enabled: Z,
            timeout_seconds: x
          },
          llm_retry_enabled: m,
          llm_max_retries: se,
          llm_backoff_base: X,
          llm_backoff_cap: j,
          llm_max_concurrent: oe,
          llm_max_qpm: W,
          llm_rate_limit_pause: de,
          llm_rate_limit_jitter: Te,
          llm_acquire_timeout: ie,
          history_max_length: we,
          context_manager_backend: Ce,
          light_context_config: {
            ...z.light_context_config ?? {},
            strategy: Ue
          },
          memory_manager_backend: Fe,
          approval_level: je
        };
        await On(e, be), D.current = be, R && await An(e, R).catch(() => {
        }), J && await Rn(J).catch(() => {
        }), L.success("运行配置已保存");
      } catch (be) {
        L.error(be.message || "保存运行配置失败");
      } finally {
        _(!1);
      }
    }
  };
  if (S)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(h, { size: "large" })
    );
  const V = (z, ke, xe) => t.createElement(
    "div",
    { style: jt },
    t.createElement("div", { style: qe }, z),
    ke,
    xe ? t.createElement(
      G,
      { type: "secondary", style: Nt },
      xe
    ) : null
  ), ce = (z, ke, xe, be) => t.createElement(
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
    ce(
      "Shell 命令超时 (秒)",
      t.createElement(i, {
        min: 1,
        value: F,
        onChange: (z) => g(z ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(y, {
        value: O,
        onChange: (z) => T(z.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    ce(
      "语言",
      t.createElement(c, {
        value: R,
        onChange: (z) => q(z),
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
        onChange: (z) => M(z),
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
    ce(
      "自动生成会话标题",
      t.createElement(f, null, t.createElement(d, {
        checked: Z,
        onChange: (z) => C(z)
      })),
      "标题生成超时 (秒)",
      t.createElement(i, {
        min: 5,
        value: x,
        onChange: (z) => u(z ?? 30),
        style: { width: "100%" },
        disabled: !Z
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(v, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "审批级别"),
    V(
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
    t.createElement(v, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "迭代与循环"),
    V(
      "启用迭代限制",
      t.createElement(d, {
        checked: p,
        onChange: (z) => b(z)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    p ? V(
      "最大迭代次数",
      t.createElement(i, {
        min: 1,
        max: 500,
        value: A,
        onChange: (z) => re(z ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    V(
      "启用重复循环保护",
      t.createElement(d, {
        checked: K,
        onChange: (z) => le(z)
      }),
      "检测并阻止重复操作循环"
    ),
    K ? ce(
      "检测窗口大小",
      t.createElement(i, {
        min: 2,
        max: 20,
        value: ee,
        onChange: (z) => H(z ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(i, {
        min: 0,
        max: 1,
        step: 0.05,
        value: $,
        onChange: (z) => w(z ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(v, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "LLM 重试"),
    V(
      "启用 LLM 重试",
      t.createElement(d, {
        checked: m,
        onChange: (z) => Q(z)
      })
    ),
    ce(
      "最大重试次数",
      t.createElement(i, {
        min: 1,
        value: se,
        onChange: (z) => he(z ?? 3),
        style: { width: "100%" },
        disabled: !m
      }),
      "退避基数 (秒)",
      t.createElement(i, {
        min: 0.1,
        step: 0.1,
        value: X,
        onChange: (z) => me(z ?? 2),
        style: { width: "100%" },
        disabled: !m
      })
    ),
    V(
      "退避上限 (秒)",
      t.createElement(i, {
        min: 0.5,
        step: 0.5,
        value: j,
        onChange: (z) => ae(z ?? 60),
        style: { width: 200 },
        disabled: !m
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(v, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "LLM 限流"),
    ce(
      "最大并发数",
      t.createElement(i, {
        min: 1,
        value: oe,
        onChange: (z) => ne(z ?? 1),
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
    ce(
      "限流暂停时间 (秒)",
      t.createElement(i, {
        min: 1,
        step: 0.5,
        value: de,
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
    V(
      "获取超时 (秒)",
      t.createElement(i, {
        min: 10,
        step: 10,
        value: ie,
        onChange: (z) => ge(z ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(v, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "上下文与记忆"),
    ce(
      "上下文管理后端",
      t.createElement(c, {
        value: Ce,
        onChange: (z) => Re(z),
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
    ce(
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
          icon: P ? t.createElement(P) : void 0,
          loading: B,
          onClick: Ge,
          style: Ae
        },
        "保存运行配置"
      )
    )
  );
}
function Un({
  expert: e,
  open: t,
  onClose: r,
  onRefresh: n
}) {
  const l = E().React, { useState: a, useEffect: s, useCallback: i } = l, { Modal: y, Tabs: c, Spin: d, Typography: I } = E().antd, { SettingOutlined: h } = E().antdIcons || {}, { Text: f } = I, [N, v] = a([]), [L, P] = a(!1), [G, S] = a("heartbeat"), Y = i(async () => {
    if (e) {
      P(!0);
      try {
        const F = await Ln(e.agent.id);
        v(F);
      } catch {
        v([]);
      } finally {
        P(!1);
      }
    }
  }, [e]);
  if (s(() => {
    t && e && Y();
  }, [t, e, Y]), !e) return null;
  const { agent: B } = e, _ = () => {
    Y(), n();
  }, D = [
    {
      key: "heartbeat",
      label: "心跳",
      children: l.createElement(Bn, {
        agentId: B.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: L ? l.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        l.createElement(d, { size: "large" })
      ) : l.createElement(Ut, {
        agentId: B.id,
        systemPromptFiles: N,
        onRefresh: _
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((F) => F.enabled !== !1).length})`,
      children: l.createElement(jn, {
        agentId: B.id,
        onRefresh: n
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: l.createElement(Dn, {
        agentId: B.id,
        onRefresh: n,
        isActive: G === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: l.createElement(Nn, {
        agentId: B.id
      })
    }
  ];
  return l.createElement(
    y,
    {
      open: t,
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        h ? l.createElement(h, { style: { fontSize: 18 } }) : null,
        l.createElement("span", null, `配置 - ${B.name}`),
        l.createElement(
          f,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          B.id
        )
      ),
      onCancel: r,
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
      items: D,
      activeKey: G,
      onChange: (F) => S(F),
      size: "small",
      tabBarStyle: { marginBottom: 16, sticky: 0 }
    })
  );
}
function Fn({
  expert: e,
  onClick: t,
  onSummon: r,
  onConfigure: n
}) {
  const l = E().React, { Card: a, Tag: s, Badge: i, Typography: y, Spin: c, Button: d, Tooltip: I } = E().antd, { Text: h } = y, { ThunderboltOutlined: f, SettingOutlined: N } = E().antdIcons || {}, { agent: v, skills: L, mcps: P, loading: G } = e, S = v.enabled, Y = L.filter((D) => D.enabled !== !1).map((D) => D.name), B = P.map((D) => D.name || D.key), _ = v.active_model ? `${v.active_model.provider_id}/${v.active_model.model}` : null;
  return l.createElement(
    a,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: S ? void 0 : "#d9d9d9",
        opacity: S ? 1 : 0.7,
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
        l.createElement(Be, { name: v.name, size: 36 }),
        l.createElement(
          "div",
          null,
          l.createElement(
            h,
            { strong: !0, style: { fontSize: 15 } },
            v.name
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
            v.id
          )
        )
      ),
      l.createElement(i, {
        status: S ? "success" : "default",
        text: S ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    v.description ? l.createElement(
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
      gt(v.description, l)
    ) : l.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    _ ? l.createElement(
      "div",
      { style: { marginBottom: 8 } },
      l.createElement(
        s,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${_}`
      )
    ) : null,
    // Skills
    G ? l.createElement(c, { size: "small" }) : l.createElement(
      "div",
      { style: { marginBottom: 6 } },
      l.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${Y.length})`
      ),
      l.createElement(wt, {
        items: Y,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !G && B.length > 0 ? l.createElement(
      "div",
      { style: { marginTop: "auto" } },
      l.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${B.length})`
      ),
      l.createElement(wt, {
        items: B,
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
          d,
          {
            type: "text",
            size: "small",
            icon: N ? l.createElement(N, {
              style: { fontSize: 16, color: "#8c8c8c" }
            }) : void 0,
            onClick: (D) => {
              D.stopPropagation(), n && n();
            }
          }
        )
      ),
      // Summon button (bottom-right)
      l.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: f ? l.createElement(f) : void 0,
          disabled: !S,
          onClick: (D) => {
            D.stopPropagation(), r && r();
          },
          style: Ae
        },
        "召唤专家"
      )
    )
  );
}
function Hn({
  expert: e,
  open: t,
  onClose: r,
  onRefresh: n
}) {
  const l = E().React, {
    Drawer: a,
    Descriptions: s,
    Tag: i,
    Typography: y,
    Space: c,
    Button: d,
    Empty: I,
    Tabs: h,
    List: f,
    Spin: N,
    Modal: v,
    message: L
  } = E().antd, { Text: P, Paragraph: G } = y, {
    EditOutlined: S,
    ThunderboltOutlined: Y,
    FileTextOutlined: B,
    ToolOutlined: _,
    PlusOutlined: D
  } = E().antdIcons || {}, [F, g] = l.useState(!1), [O, T] = l.useState(
    []
  ), [Z, C] = l.useState(!1);
  if (!e) return null;
  const { agent: x, config: u, skills: R, mcps: q, loading: J } = e, M = R.filter((m) => m.enabled !== !1), p = (m) => {
    window.history.pushState({}, "", m), window.dispatchEvent(new PopStateEvent("popstate"));
  }, b = l.createElement(
    "div",
    null,
    l.createElement(
      s,
      { column: 1, bordered: !0, size: "small" },
      l.createElement(s.Item, { label: "专家名称" }, x.name),
      l.createElement(
        s.Item,
        { label: "专家 ID" },
        l.createElement("code", { style: { fontSize: 12 } }, x.id)
      ),
      l.createElement(
        s.Item,
        { label: "状态" },
        l.createElement(
          i,
          { color: x.enabled ? "green" : "default" },
          x.enabled ? "启用" : "停用"
        )
      ),
      l.createElement(
        s.Item,
        { label: "功能简介" },
        x.description ? gt(x.description, l) : "暂无描述"
      ),
      l.createElement(
        s.Item,
        { label: "使用模型" },
        x.active_model ? `${x.active_model.provider_id} / ${x.active_model.model}` : "使用全局默认模型"
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
        B ? l.createElement(B, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        l.createElement(P, { strong: !0 }, "系统提示词文件")
      ),
      l.createElement(
        c,
        { wrap: !0 },
        ...u.system_prompt_files.map(
          (m, Q) => l.createElement(
            i,
            {
              key: Q,
              icon: B ? l.createElement(B) : void 0,
              style: { fontSize: 12 }
            },
            m
          )
        )
      )
    ) : null
  ), A = async () => {
    g(!0), C(!0);
    try {
      const m = await pt(!0);
      T(m);
    } catch (m) {
      L.error(m.message || "加载技能池失败");
    } finally {
      C(!1);
    }
  }, re = async (m) => {
    let Q = 0, se = 0;
    for (const he of m)
      try {
        await At(x.id, he), Q++;
      } catch {
        se++;
      }
    Q > 0 ? (L.success(
      `成功添加 ${Q} 个技能${se > 0 ? `，${se} 个失败` : ""}`
    ), n()) : se > 0 && L.error("添加技能失败"), g(!1);
  }, K = async (m) => {
    try {
      await $t(x.id, m), L.success(`技能「${m}」已移除`), n();
    } catch (Q) {
      L.error(Q.message || "移除技能失败");
    }
  }, le = async (m) => {
    try {
      await Rt(x.id, m), L.success(`MCP「${m}」已移除`), n();
    } catch (Q) {
      L.error(Q.message || "移除 MCP 失败");
    }
  }, ee = J ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(N, { size: "large" })
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
        P,
        { strong: !0 },
        `已启用技能 (${M.length})`
      ),
      l.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: D ? l.createElement(D) : void 0,
          onClick: A
        },
        "从技能池添加"
      )
    ),
    M.length === 0 ? l.createElement(I, {
      description: "该专家暂无已启用的技能",
      image: I.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(f, {
      dataSource: M,
      renderItem: (m) => l.createElement(
        f.Item,
        {
          actions: [
            l.createElement(
              d,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => K(m.name)
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
            m.emoji ? l.createElement(
              "span",
              { style: { fontSize: 16 } },
              m.emoji
            ) : null,
            l.createElement(P, { strong: !0 }, m.name),
            m.version_text ? l.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${m.version_text}`
            ) : null
          ),
          m.description ? l.createElement(
            G,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            m.description
          ) : null,
          m.tags && m.tags.length > 0 ? l.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...m.tags.map(
              (Q, se) => l.createElement(
                i,
                {
                  key: se,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                Q
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    l.createElement(Bt, {
      open: F,
      onClose: () => g(!1),
      poolSkills: O,
      installedSkillNames: M.map((m) => m.name),
      loading: Z,
      onInstall: re
    })
  ), H = J ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(N, { size: "large" })
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
        P,
        { strong: !0 },
        `MCP 客户端 (${q.length})`
      ),
      l.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: D ? l.createElement(D) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${x.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    q.length === 0 ? l.createElement(I, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: I.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(f, {
      dataSource: q,
      renderItem: (m) => l.createElement(
        f.Item,
        {
          actions: [
            l.createElement(
              d,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => le(m.key)
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
              P,
              { strong: !0 },
              m.name || m.key
            ),
            l.createElement(
              i,
              {
                color: m.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              m.enabled ? "启用" : "停用"
            ),
            l.createElement(
              i,
              { color: "purple", style: { fontSize: 10 } },
              m.transport
            )
          ),
          m.description ? l.createElement(
            G,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            m.description
          ) : null,
          m.tools && m.tools.length > 0 ? l.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "#8c8c8c"
              }
            },
            `提供 ${m.tools.length} 个工具`
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
        _ ? l.createElement(_, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        l.createElement(P, { strong: !0 }, "工具配置")
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
  }), w = [
    { key: "basic", label: "基本信息", children: b },
    {
      key: "skills",
      label: `技能 (${M.length})`,
      children: ee
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: l.createElement(Jn, {
        skills: M,
        agentId: x.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: l.createElement(Ut, {
        agentId: x.id,
        systemPromptFiles: (u == null ? void 0 : u.system_prompt_files) || [],
        onRefresh: () => n()
      })
    },
    { key: "mcp", label: `MCP (${q.length})`, children: H },
    { key: "tools", label: "工具配置", children: $ }
  ];
  return l.createElement(
    a,
    {
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        l.createElement(Be, { name: x.name, size: 28 }),
        l.createElement("span", null, x.name)
      ),
      open: t,
      onClose: r,
      width: 560,
      extra: l.createElement(
        c,
        null,
        l.createElement(
          d,
          {
            size: "small",
            icon: S ? l.createElement(S) : void 0,
            onClick: () => {
              r();
              try {
                const m = E();
                m.setSelectedAgent && m.setSelectedAgent(x.id);
              } catch (m) {
                console.warn("[ugsci] Failed to set selected agent:", m);
              }
              setTimeout(() => p("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        l.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: Y ? l.createElement(Y) : void 0,
            onClick: () => {
              r();
              try {
                const m = E();
                m.setSelectedAgent && m.setSelectedAgent(x.id);
              } catch (m) {
                console.warn("[ugsci] Failed to set selected agent:", m);
              }
              setTimeout(() => p("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    l.createElement(h, {
      items: w,
      defaultActiveKey: "basic"
    })
  );
}
function Gn({
  open: e,
  onClose: t,
  onCreated: r
}) {
  const n = E().React, { useState: l } = n, {
    Modal: a,
    Card: s,
    Tag: i,
    Input: y,
    Row: c,
    Col: d,
    Spin: I,
    message: h,
    Typography: f
  } = E().antd, { Text: N } = f, { FileAddOutlined: v } = E().antdIcons || {}, [L, P] = l(!1), [G, S] = l(""), [Y, B] = l(!1), _ = async (g, O) => {
    P(!0);
    try {
      const T = await te("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: g || "新专家",
          description: O || "",
          skill_names: []
        })
      });
      await tt(
        T.id,
        "AGENTS.md",
        `# ${g || "新专家"}

请在此处编写该专家的系统提示词。
`
      ), h.success("专家「" + (g || "新专家") + "」创建成功"), B(!1), setTimeout(() => {
        t(), r();
      }, 0);
    } catch (T) {
      h.error(T.message || "创建专家失败");
    } finally {
      P(!1);
    }
  }, D = st.filter((g) => {
    if (!G.trim()) return !0;
    const O = G.toLowerCase();
    return g.name.toLowerCase().includes(O) || g.description.toLowerCase().includes(O) || g.category.toLowerCase().includes(O);
  }), F = async (g) => {
    P(!0);
    try {
      const O = await te("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: g.name,
          description: g.description,
          skill_names: g.recommendedSkills
        })
      });
      await tt(O.id, "AGENTS.md", g.systemPrompt);
      const T = await nt(O.id);
      T.approval_level = g.approvalLevel, await te(`/agents/${encodeURIComponent(O.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(T)
      }), h.success(`专家「${g.name}」创建成功`), t(), r();
    } catch (O) {
      h.error(O.message || "创建专家失败");
    } finally {
      P(!1);
    }
  };
  return n.createElement(
    n.Fragment,
    null,
    n.createElement(
      a,
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
        n.createElement(y, {
          placeholder: "搜索模板名称或类别...",
          value: G,
          onChange: (g) => S(g.target.value),
          allowClear: !0
        })
      ),
      L ? n.createElement(
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
        G.trim() ? null : n.createElement(
          d,
          { xs: 24, sm: 12 },
          n.createElement(
            s,
            {
              hoverable: !0,
              size: "small",
              onClick: () => B(!0),
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
                v ? n.createElement(v) : "📝"
              ),
              n.createElement(
                "div",
                { style: { flex: 1 } },
                n.createElement(
                  N,
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
        ...D.map(
          (g) => n.createElement(
            d,
            { key: g.id, xs: 24, sm: 12 },
            n.createElement(
              s,
              {
                hoverable: !0,
                size: "small",
                onClick: () => F(g),
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
                    N,
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
    n.createElement(Wn, {
      open: Y,
      onCancel: () => B(!1),
      onCreate: _
    })
  );
}
function Wn({
  open: e,
  onCancel: t,
  onCreate: r
}) {
  const n = E().React, { useState: l, useEffect: a } = n, { Modal: s, Input: i, message: y } = E().antd, [c, d] = l(""), [I, h] = l(""), [f, N] = l(!1);
  return a(() => {
    e && (d(""), h(""), N(!1));
  }, [e]), n.createElement(
    s,
    {
      open: e,
      title: "从空白模版创建专家",
      onCancel: t,
      onOk: () => {
        if (!c.trim()) {
          y.warning("请输入专家名称");
          return;
        }
        N(!0), Promise.resolve(r(c.trim(), I.trim())).finally(() => {
          N(!1);
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
        onChange: (v) => d(v.target.value),
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
        onChange: (v) => h(v.target.value),
        rows: 3,
        maxLength: 200
      })
    )
  );
}
function Ut({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: r
}) {
  const n = E().React, { useState: l, useEffect: a, useCallback: s } = n, {
    List: i,
    Tag: y,
    Switch: c,
    Button: d,
    Modal: I,
    Input: h,
    Spin: f,
    Empty: N,
    message: v,
    Typography: L
  } = E().antd, { FileTextOutlined: P, PlusOutlined: G, EditOutlined: S, ReloadOutlined: Y } = E().antdIcons || {}, { Text: B } = L, [_, D] = l([]), [F, g] = l(!0), [O, T] = l(
    t || []
  ), [Z, C] = l(!1), [x, u] = l(null), [R, q] = l(""), [J, M] = l(""), [p, b] = l(!1), A = s(async () => {
    g(!0);
    try {
      const H = await hn(e);
      D(H);
    } catch (H) {
      v.error(H.message || "加载记忆文件失败"), D([]);
    } finally {
      g(!1);
    }
  }, [e]);
  a(() => {
    A();
  }, [A]), a(() => {
    T(t || []);
  }, [t]);
  const re = async (H, $) => {
    const w = new Set(O);
    if ($)
      w.add(H);
    else {
      if (xt.includes(H) && H === "AGENTS.md") {
        v.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      w.delete(H);
    }
    const m = Array.from(w);
    T(m);
    try {
      await St(e, m), v.success($ ? "已启用记忆文件" : "已停用记忆文件"), r();
    } catch (Q) {
      v.error(Q.message || "更新失败"), T(t || []);
    }
  }, K = async (H) => {
    try {
      const $ = await te(
        `/workspace/files/${encodeURIComponent(H)}`,
        { headers: { "X-Agent-Id": e } }
      );
      u(H), q($.content || ""), C(!0);
    } catch ($) {
      v.error($.message || "读取文件失败");
    }
  }, le = () => {
    u(null), q(""), M(""), C(!0);
  }, ee = async () => {
    const H = x || J.trim();
    if (!H) {
      v.warning("请输入文件名");
      return;
    }
    const $ = H.endsWith(".md") ? H : `${H}.md`;
    b(!0);
    try {
      if (await tt(e, $, R), !x && !O.includes($)) {
        const w = [...O, $];
        T(w), await St(e, w);
      }
      v.success("保存成功"), C(!1), A(), r();
    } catch (w) {
      v.error(w.message || "保存失败");
    } finally {
      b(!1);
    }
  };
  return F ? n.createElement(
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
        P ? n.createElement(P, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(
          B,
          { strong: !0 },
          `记忆文件 (${_.length})`
        ),
        n.createElement(
          B,
          { type: "secondary", style: { fontSize: 12 } },
          `· 已挂载 ${O.length} 个到专家记忆`
        )
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          d,
          {
            size: "small",
            icon: Y ? n.createElement(Y) : void 0,
            onClick: A
          },
          "刷新"
        ),
        n.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: G ? n.createElement(G) : void 0,
            onClick: le
          },
          "新建记忆文件"
        )
      )
    ),
    _.length === 0 ? n.createElement(N, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: N.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(i, {
      dataSource: _,
      renderItem: (H) => {
        const $ = O.includes(H.filename), w = xt.includes(H.filename);
        return n.createElement(
          i.Item,
          {
            actions: [
              n.createElement(
                d,
                {
                  type: "link",
                  size: "small",
                  icon: S ? n.createElement(S) : void 0,
                  onClick: () => K(H.filename)
                },
                "编辑"
              )
            ]
          },
          n.createElement(i.Item.Meta, {
            avatar: n.createElement(P, {
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
              n.createElement(B, null, H.filename),
              w ? n.createElement(
                y,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : n.createElement(
                y,
                { color: "cyan", style: { fontSize: 10 } },
                "记忆库"
              )
            ),
            description: n.createElement(
              "div",
              { style: { fontSize: 12 } },
              `${(H.size / 1024).toFixed(1)} KB · 修改于 ${new Date(H.modified_time).toLocaleString()}`
            )
          }),
          n.createElement(c, {
            checked: $,
            size: "small",
            onChange: (m) => re(H.filename, m)
          })
        );
      }
    }),
    // Edit/New file modal
    n.createElement(
      I,
      {
        open: Z,
        onCancel: () => C(!1),
        title: x ? `编辑 ${x}` : "新建记忆文件",
        width: 700,
        onOk: ee,
        confirmLoading: p,
        okText: "保存"
      },
      x ? null : n.createElement(
        "div",
        { style: { marginBottom: 12 } },
        n.createElement(h, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: J,
          onChange: (H) => M(H.target.value),
          addonAfter: J.endsWith(".md") ? "" : ".md"
        })
      ),
      n.createElement(h.TextArea, {
        value: R,
        onChange: (H) => q(H.target.value),
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
function Jn({
  skills: e,
  agentId: t
}) {
  const r = E().React, { useMemo: n } = r, {
    List: l,
    Tag: a,
    Typography: s,
    Empty: i,
    Button: y,
    message: c
  } = E().antd, { ThunderboltOutlined: d, CopyOutlined: I } = E().antdIcons || {}, { Text: h } = s, f = n(() => En(e), [e]), N = (L) => {
    try {
      const P = E();
      P.setSelectedAgent && P.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", L);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, v = (L) => {
    var P;
    (P = navigator.clipboard) == null || P.writeText(L).then(() => {
      c.success("已复制到剪贴板");
    });
  };
  return f.length === 0 ? r.createElement(i, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: i.PRESENTED_IMAGE_SIMPLE
  }) : r.createElement(
    "div",
    null,
    r.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12
        }
      },
      d ? r.createElement(d, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      r.createElement(
        h,
        { strong: !0 },
        `推荐提问 (${f.length})`
      ),
      r.createElement(
        h,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    r.createElement(l, {
      dataSource: f,
      renderItem: (L, P) => r.createElement(
        l.Item,
        {
          actions: [
            r.createElement(
              y,
              {
                type: "link",
                size: "small",
                icon: I ? r.createElement(I) : void 0,
                onClick: () => v(L)
              },
              "复制"
            )
          ]
        },
        r.createElement(l.Item.Meta, {
          avatar: r.createElement(
            a,
            { color: "blue", style: { borderRadius: "50%" } },
            `${P + 1}`
          ),
          title: r.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => N(L)
            },
            L
          ),
          description: r.createElement(
            h,
            { type: "secondary", style: { fontSize: 12 } },
            "点击直接发送给专家"
          )
        })
      )
    })
  );
}
function Kn() {
  var Te;
  const e = E().React, { useState: t, useEffect: r, useCallback: n, useMemo: l } = e, {
    Spin: a,
    Empty: s,
    Input: i,
    Button: y,
    message: c,
    Row: d,
    Col: I,
    Tabs: h,
    Modal: f,
    Typography: N
  } = E().antd, {
    ReloadOutlined: v,
    PlusOutlined: L,
    SearchOutlined: P,
    TeamOutlined: G,
    UserOutlined: S
  } = E().antdIcons || {}, { Text: Y, Paragraph: B } = N, [_, D] = t([]), [F, g] = t(!0), [O, T] = t(!1), [Z, C] = t(null), [x, u] = t(""), [R, q] = t(!1), [J, M] = t("experts"), [p, b] = t(
    null
  ), [A, re] = t(""), [K, le] = t(!1), [ee, H] = t(!1), [$, w] = t(null), [m, Q] = t([]), se = n(async () => {
    g(!0);
    try {
      const k = await dt(), ie = await Promise.all(
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
      D(ie), Q(k);
    } catch (k) {
      c.error(k.message || "加载专家列表失败"), D([]);
    } finally {
      g(!1);
    }
  }, []);
  r(() => {
    se();
  }, [se]), r(() => {
    if ($ && ee) {
      const k = _.find(
        (ie) => ie.agent.id === $.agent.id
      );
      k && k !== $ && w(k);
    }
  }, [_, $, ee]);
  const he = n(
    async (k) => {
      var Se;
      const ie = k.coordinatorName || ((Se = k.members[0]) == null ? void 0 : Se.name);
      if (!ie) {
        c.error("无法确定协调者专家");
        return;
      }
      const ge = et(m, ie);
      if (!ge) {
        c.error(`未找到协调者专家「${ie}」，请先创建该专家`);
        return;
      }
      if (/\{.+?\}/.test(k.taskTemplate)) {
        re(""), b(k);
        return;
      }
      await X(k, ge, k.taskTemplate);
    },
    [m, c]
  ), X = n(
    async (k, ie, ge) => {
      var we;
      le(!0);
      try {
        const Se = pn(k), Ce = ge ? Se.replace(k.taskTemplate, ge) : Se, Re = E();
        Re.setSelectedAgent && Re.setSelectedAgent(ie), await un(ie, Ce), c.success(
          `团队任务已发起，协调者：${k.coordinatorName || ((we = k.members[0]) == null ? void 0 : we.name)}`
        ), b(null), me("/chat");
      } catch (Se) {
        c.error(Se.message || "发起团队任务失败");
      } finally {
        le(!1);
      }
    },
    [c]
  ), me = (k) => {
    window.history.pushState({}, "", k), window.dispatchEvent(new PopStateEvent("popstate"));
  }, j = n((k) => {
    C(k), T(!0);
  }, []), ae = n((k) => {
    w(k), H(!0);
  }, []), oe = n(
    (k) => {
      if (!k.agent.enabled) {
        c.warning(`专家「${k.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const ie = E();
        ie.setSelectedAgent && ie.setSelectedAgent(k.agent.id);
      } catch (ie) {
        console.warn("[ugsci] Failed to set selected agent:", ie);
      }
      c.success(`已召唤专家「${k.agent.name}」，正在跳转至对话...`), me("/chat");
    },
    [c]
  ), ne = l(() => {
    if (!x.trim()) return _;
    const k = x.toLowerCase();
    return _.filter(
      (ie) => {
        var ge;
        return ie.agent.name.toLowerCase().includes(k) || ((ge = ie.agent.description) == null ? void 0 : ge.toLowerCase().includes(k)) || ie.agent.id.toLowerCase().includes(k) || ie.skills.some((we) => we.name.toLowerCase().includes(k));
      }
    );
  }, [_, x]), W = _.filter((k) => k.agent.enabled).length, pe = _.reduce(
    (k, ie) => k + ie.skills.filter((ge) => ge.enabled !== !1).length,
    0
  ), de = _.reduce((k, ie) => k + ie.mcps.length, 0), Ie = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        S ? e.createElement(S, { style: { fontSize: 14 } }) : null,
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
            prefix: P ? e.createElement(P) : void 0,
            value: x,
            onChange: (k) => u(k.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        F ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(a, { size: "large" })
        ) : ne.length === 0 ? e.createElement(s, {
          description: x ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          d,
          { gutter: [12, 12], align: "stretch" },
          ...ne.map(
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
              e.createElement(Fn, {
                expert: k,
                onClick: () => j(k),
                onSummon: () => oe(k),
                onConfigure: () => ae(k)
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
        G ? e.createElement(G, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(fn, {
        agents: m,
        onLaunch: he
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(lt, {
      title: "专家",
      subtitle: `共 ${_.length} 位专家（${W} 位启用）· ${pe} 个技能 · ${de} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          y,
          {
            icon: v ? e.createElement(v) : void 0,
            onClick: se,
            loading: F
          },
          "刷新"
        ),
        e.createElement(
          y,
          {
            type: "primary",
            icon: L ? e.createElement(L) : void 0,
            onClick: () => q(!0),
            style: Ae
          },
          "创建专家"
        )
      )
    }),
    e.createElement(h, {
      items: Ie,
      activeKey: J,
      onChange: (k) => M(k)
    }),
    // Drawer
    e.createElement(Hn, {
      expert: Z,
      open: O,
      onClose: () => T(!1),
      onRefresh: () => se()
    }),
    // Template Modal
    e.createElement(Gn, {
      open: R,
      onClose: () => q(!1),
      onCreated: () => se()
    }),
    // Config Modal (gear icon)
    e.createElement(Un, {
      expert: $,
      open: ee,
      onClose: () => H(!1),
      onRefresh: () => se()
    }),
    // Team Launch Modal (for filling placeholders)
    p ? e.createElement(
      f,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(ft, {
            members: p.members.map((k) => k.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${p.name}`
          )
        ),
        onCancel: () => b(null),
        onOk: () => {
          var we;
          const k = p.coordinatorName || ((we = p.members[0]) == null ? void 0 : we.name), ie = k ? et(m, k) : null;
          if (!ie) {
            c.error("无法找到协调者专家");
            return;
          }
          let ge = p.taskTemplate;
          A.trim() && (ge = A.trim()), X(p, ie, ge);
        },
        confirmLoading: K,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          Y,
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
          p.taskTemplate
        )
      ),
      e.createElement(
        "div",
        null,
        e.createElement(
          Y,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "输入具体任务描述（替换上面的占位符内容）："
        ),
        e.createElement(i.TextArea, {
          value: A,
          onChange: (k) => re(k.target.value),
          rows: 5,
          placeholder: p.taskTemplate,
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
          Y,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${p.coordinatorName || ((Te = p.members[0]) == null ? void 0 : Te.name) || "—"} · 成员: ${p.members.map((k) => k.name).join("、")}`
        )
      )
    ) : null
  );
}
function Xn({
  mcp: e,
  onClick: t,
  onToggle: r,
  onDelete: n,
  onViewTools: l
}) {
  const a = E().React, { Card: s, Tag: i, Badge: y, Typography: c, Button: d } = E().antd, { Text: I } = c, {
    EyeOutlined: h,
    EyeInvisibleOutlined: f,
    DeleteOutlined: N,
    ToolOutlined: v
  } = E().antdIcons || {}, L = {
    stdio: "💻",
    streamable_http: "🌐",
    sse: "📡"
  };
  return e.transport === "streamable_http" || e.transport, a.createElement(
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
        a.createElement(
          "span",
          { style: { fontSize: 18 } },
          L[e.transport] || "🔌"
        ),
        a.createElement(
          I,
          { strong: !0, style: { fontSize: 14 } },
          e.name || e.key
        )
      ),
      a.createElement(y, {
        status: e.enabled ? "success" : "default",
        text: e.enabled ? "启用" : "停用"
      })
    ),
    e.description ? a.createElement(
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
    ) : a.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 8, minHeight: 36, flex: "1 0 auto" } },
      "暂无描述"
    ),
    a.createElement(
      "div",
      { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 } },
      a.createElement(
        i,
        { color: "purple", style: { fontSize: 11 } },
        e.transport
      ),
      e.tools && e.tools.length > 0 ? a.createElement(
        i,
        { color: "blue", style: { fontSize: 11 } },
        `${e.tools.length} 个工具`
      ) : a.createElement(i, { style: { fontSize: 11 } }, "全部工具"),
      e.url ? a.createElement(
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
    a.createElement(
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
      a.createElement(
        d,
        {
          size: "small",
          icon: v ? a.createElement(v) : void 0,
          onClick: l
        },
        "工具"
      ),
      a.createElement(
        d,
        {
          size: "small",
          icon: e.enabled ? f ? a.createElement(f) : void 0 : h ? a.createElement(h) : void 0,
          onClick: r
        },
        e.enabled ? "禁用" : "启用"
      ),
      a.createElement(
        d,
        {
          size: "small",
          danger: !0,
          icon: N ? a.createElement(N) : void 0,
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
  borderRadius: r = "50%"
}) {
  const n = E().React, [l, a] = n.useState(0), s = l === 0 ? Ct(e) : `${Ct(e)}?_r=${l}`;
  return n.createElement("img", {
    src: s,
    alt: e,
    onError: () => {
      l < 1 && a(l + 1);
    },
    style: { width: t, height: t, borderRadius: r, objectFit: "cover", flexShrink: 0 }
  });
}
function ft({
  members: e,
  size: t = 32,
  borderRadius: r = "50%"
}) {
  const n = E().React, [l, a] = n.useState(0);
  if (!e || e.length === 0)
    return n.createElement("span", {
      style: { width: t, height: t, display: "inline-block" }
    });
  const s = e.slice(0, 5), i = l === 0 ? kt(s) : `${kt(s)}?_r=${l}`;
  return n.createElement("img", {
    src: i,
    alt: "team",
    onError: () => {
      l < 1 && a(l + 1);
    },
    style: { width: t, height: t, borderRadius: r, objectFit: "cover", flexShrink: 0 }
  });
}
async function qn() {
  return te("/ugsci/engines/list");
}
async function Vn(e) {
  return te("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function Yn(e, t) {
  return te(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function Qn(e) {
  return te(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function Zn() {
  return te("/ugsci/engines/detect", {
    method: "POST"
  });
}
function el({
  engine: e,
  onClick: t
}) {
  const r = E().React, { Card: n, Tag: l, Typography: a } = E().antd, { Text: s } = a, i = e.status === "detected", y = Ft[e.category] || "📦", d = Ht.has(e.id) ? r.createElement("img", {
    src: Gt(e.id),
    alt: e.name,
    style: { width: 24, height: 24, objectFit: "contain" }
  }) : r.createElement("span", { style: { fontSize: 20 } }, y);
  return r.createElement(
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
        d,
        r.createElement(
          "div",
          null,
          r.createElement(
            s,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          r.createElement("br"),
          r.createElement(
            s,
            { type: "secondary", style: { fontSize: 11 } },
            e.vendor || "—"
          )
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" } },
        i ? r.createElement(
          l,
          { color: "success", style: { fontSize: 11 } },
          "✅ 已检测"
        ) : e.executable_path ? r.createElement(
          l,
          { color: "warning", style: { fontSize: 11 } },
          "⚠ 路径无效"
        ) : r.createElement(
          l,
          { style: { fontSize: 11 } },
          "🔧 待配置"
        ),
        e.is_default ? r.createElement(
          l,
          { color: "blue", style: { fontSize: 10 } },
          "默认"
        ) : e.is_custom ? r.createElement(
          l,
          { color: "purple", style: { fontSize: 10 } },
          "自定义"
        ) : null
      )
    ),
    r.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      r.createElement(
        s,
        { type: "secondary", style: { fontSize: 12 } },
        e.description || "暂无描述"
      )
    ),
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
      e.category ? r.createElement(
        l,
        { style: { fontSize: 11 } },
        it[e.category] || e.category
      ) : null,
      e.version ? r.createElement(
        l,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (I) => r.createElement(
          l,
          { key: I, color: "cyan", style: { fontSize: 10 } },
          I
        )
      )
    )
  );
}
function tl() {
  const e = E().React, { useState: t, useEffect: r, useCallback: n, useMemo: l } = e, {
    Spin: a,
    Empty: s,
    Button: i,
    message: y,
    Row: c,
    Col: d,
    Drawer: I,
    Descriptions: h,
    Tag: f,
    Typography: N,
    Modal: v,
    Input: L,
    Select: P,
    Popconfirm: G,
    Space: S
  } = E().antd, {
    ReloadOutlined: Y,
    SearchOutlined: B,
    PlusOutlined: _,
    EditOutlined: D,
    DeleteOutlined: F,
    CopyOutlined: g,
    ExperimentOutlined: O
  } = E().antdIcons || {}, { Text: T, Paragraph: Z } = N, [C, x] = t([]), [u, R] = t(!0), [q, J] = t(""), [M, p] = t(!1), [b, A] = t(null), [re, K] = t(!1), [le, ee] = t(null), [H, $] = t({}), [w, m] = t(!1), Q = n(async () => {
    R(!0);
    try {
      const W = await qn();
      x(W.engines || []);
    } catch (W) {
      y.error(W.message || "加载引擎列表失败"), x([]);
    } finally {
      R(!1);
    }
  }, []);
  r(() => {
    Q();
  }, [Q]);
  const se = l(() => {
    if (!q.trim()) return C;
    const W = q.toLowerCase();
    return C.filter(
      (pe) => {
        var de;
        return pe.name.toLowerCase().includes(W) || pe.vendor.toLowerCase().includes(W) || pe.category.toLowerCase().includes(W) || ((de = pe.description) == null ? void 0 : de.toLowerCase().includes(W));
      }
    );
  }, [C, q]);
  C.filter((W) => W.status === "detected").length;
  const he = n((W) => {
    navigator.clipboard.writeText(W).then(() => y.success("路径已复制")).catch(() => y.error("复制失败"));
  }, []), X = n(() => {
    ee(null), $({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), K(!0);
  }, []), me = n((W) => {
    ee(W), $({ ...W }), K(!0), p(!1);
  }, []), j = n(async () => {
    var W;
    if (!((W = H.name) != null && W.trim())) {
      y.warning("请输入引擎名称");
      return;
    }
    m(!0);
    try {
      le ? (await Yn(le.id, H), y.success("引擎已更新")) : (await Vn(H), y.success("引擎已添加")), K(!1), Q();
    } catch (pe) {
      y.error(pe.message || "保存失败");
    } finally {
      m(!1);
    }
  }, [H, le, Q]), ae = n(
    async (W) => {
      try {
        await Qn(W), y.success("引擎已删除"), p(!1), Q();
      } catch (pe) {
        y.error(pe.message || "删除失败");
      }
    },
    [Q]
  ), oe = n(async () => {
    R(!0);
    try {
      const W = await Zn();
      x(W.engines || []), y.success("自动检测完成");
    } catch (W) {
      y.error(W.message || "检测失败");
    } finally {
      R(!1);
    }
  }, []), ne = n(
    (W, pe, de) => {
      const Ie = H[pe] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          T,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          W
        ),
        de != null && de.select ? e.createElement(P, {
          value: Ie || void 0,
          onChange: (Te) => $((k) => ({ ...k, [pe]: Te })),
          style: { width: "100%" },
          options: de.select.options,
          allowClear: !0,
          placeholder: `选择${W}`
        }) : de != null && de.textarea ? e.createElement(L.TextArea, {
          value: Ie,
          onChange: (Te) => $((k) => ({ ...k, [pe]: Te.target.value })),
          rows: 3,
          placeholder: `输入${W}`
        }) : e.createElement(L, {
          value: Ie,
          onChange: (Te) => $((k) => ({ ...k, [pe]: Te.target.value })),
          placeholder: `输入${W}`
        })
      );
    },
    [H]
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
      e.createElement(L, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: B ? e.createElement(B) : void 0,
        value: q,
        onChange: (W) => J(W.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        i,
        {
          icon: Y ? e.createElement(Y) : void 0,
          onClick: oe,
          loading: u
        },
        "自动检测"
      ),
      e.createElement(
        i,
        {
          type: "primary",
          icon: _ ? e.createElement(_) : void 0,
          onClick: X,
          style: Ae
        },
        "添加引擎"
      )
    ),
    // Content
    u ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(a, {
        size: "large",
        tip: "正在加载计算引擎..."
      })
    ) : se.length === 0 ? e.createElement(s, {
      description: q ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      c,
      { gutter: [12, 12], align: "stretch" },
      ...se.map(
        (W) => e.createElement(
          d,
          {
            key: W.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(el, {
            engine: W,
            onClick: () => {
              A(W), p(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    b ? e.createElement(
      I,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            Ht.has(b.id) ? e.createElement("img", {
              src: Gt(b.id),
              alt: b.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              Ft[b.category] || "📦"
            )
          ),
          e.createElement("span", null, b.name)
        ),
        open: M,
        onClose: () => p(!1),
        width: 520,
        extra: e.createElement(
          S,
          null,
          e.createElement(
            i,
            {
              size: "small",
              icon: D ? e.createElement(D) : void 0,
              onClick: () => me(b)
            },
            "编辑"
          ),
          b.is_default ? null : e.createElement(
            G,
            {
              title: "确认删除此引擎？",
              description: b.name,
              onConfirm: () => ae(b.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              i,
              {
                size: "small",
                danger: !0,
                icon: F ? e.createElement(F) : void 0
              },
              "删除"
            )
          )
        )
      },
      e.createElement(
        h,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          h.Item,
          { label: "引擎名称" },
          b.name
        ),
        e.createElement(
          h.Item,
          { label: "厂商" },
          b.vendor || "—"
        ),
        e.createElement(
          h.Item,
          { label: "分类" },
          b.category ? it[b.category] || b.category : "—"
        ),
        e.createElement(
          h.Item,
          { label: "状态" },
          e.createElement(
            f,
            {
              color: b.status === "detected" ? "success" : b.status === "not_found" ? "error" : "default"
            },
            b.status === "detected" ? "✅ 已检测" : b.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          h.Item,
          { label: "版本" },
          b.version || "—"
        ),
        b.executable_path ? e.createElement(
          h.Item,
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
              b.executable_path
            ),
            e.createElement(
              i,
              {
                size: "small",
                type: "text",
                icon: g ? e.createElement(g) : void 0,
                onClick: () => he(b.executable_path)
              }
            )
          )
        ) : null,
        b.install_dir ? e.createElement(
          h.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            b.install_dir
          )
        ) : null,
        // Display detected modules with paths
        b.modules && b.modules.length > 0 ? e.createElement(
          h.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...b.modules.map(
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
                b.module_paths && b.module_paths[W] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  b.module_paths[W]
                ) : null
              )
            )
          )
        ) : null,
        b.license_server ? e.createElement(
          h.Item,
          { label: "许可证服务器" },
          b.license_server
        ) : null,
        e.createElement(
          h.Item,
          { label: "描述" },
          b.description || "—"
        )
      ),
      // Invocation hint
      b.invocation_hint ? e.createElement(
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
          b.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        b.is_default ? e.createElement(
          f,
          { color: "blue" },
          "默认引擎"
        ) : b.is_custom ? e.createElement(
          f,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      v,
      {
        title: le ? "编辑引擎" : "添加计算引擎",
        open: re,
        onOk: j,
        onCancel: () => K(!1),
        okText: le ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: w,
        width: 560
      },
      e.createElement(
        "div",
        { style: { maxHeight: 480, overflow: "auto", paddingRight: 8 } },
        ne("引擎名称 *", "name"),
        ne("厂商", "vendor"),
        ne("版本", "version"),
        ne("可执行文件路径", "executable_path"),
        ne("安装目录", "install_dir"),
        ne("分类", "category", {
          select: {
            options: Object.entries(it).map(([W, pe]) => ({
              label: pe,
              value: W
            }))
          }
        }),
        ne("描述", "description", { textarea: !0 }),
        ne("调用方式提示", "invocation_hint", { textarea: !0 }),
        ne("许可证服务器", "license_server")
      )
    )
  );
}
function nl() {
  const e = E().React, { useState: t, useEffect: r, useCallback: n, useMemo: l } = e, {
    Spin: a,
    Empty: s,
    Input: i,
    Button: y,
    message: c,
    Row: d,
    Col: I,
    Drawer: h,
    Descriptions: f,
    Tag: N,
    Typography: v,
    List: L,
    Tabs: P,
    Modal: G
  } = E().antd, {
    ReloadOutlined: S,
    PlusOutlined: Y,
    SearchOutlined: B,
    ApiOutlined: _,
    RocketOutlined: D,
    ToolOutlined: F,
    DeleteOutlined: g,
    EyeOutlined: O,
    EyeInvisibleOutlined: T
  } = E().antdIcons || {}, { Text: Z } = v, { TextArea: C } = i, u = E().useSelectedAgent, R = u ? u() : null, q = (R == null ? void 0 : R.id) || "default", [J, M] = t([]), [p, b] = t(!0), [A, re] = t(""), [K, le] = t(!1), [ee, H] = t(null), [$, w] = t("mcp"), [m, Q] = t(!1), [se, he] = t(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [X, me] = t(!1), [j, ae] = t(!1), [oe, ne] = t(null), [W, pe] = t(!1), [de, Ie] = t(null), [Te, k] = t([]), [ie, ge] = t(!1), [we, Se] = t(""), Ce = n(async () => {
    b(!0);
    try {
      const V = await rn(q);
      M(V);
    } catch (V) {
      c.error(V.message || "加载 MCP 列表失败"), M([]);
    } finally {
      b(!1);
    }
  }, [q]);
  r(() => {
    Ce();
  }, [Ce]);
  const Re = n(
    async (V) => {
      try {
        await on(q, V.key), c.success(V.enabled ? "已禁用" : "已启用"), Ce();
      } catch (ce) {
        c.error(ce.message || "切换状态失败");
      }
    },
    [q, Ce]
  ), Ue = n(async () => {
    if (oe)
      try {
        await sn(q, oe.key), c.success(`MCP「${oe.key}」已删除`), ae(!1), ne(null), Ce();
      } catch (V) {
        c.error(V.message || "删除失败");
      }
  }, [q, oe, Ce]), Oe = n(async () => {
    me(!0);
    try {
      const V = JSON.parse(se), ce = V.mcpServers || V, z = Object.entries(ce);
      if (z.length === 0) {
        c.warning("未找到 MCP 客户端配置");
        return;
      }
      let ke = !0;
      for (const [xe, be] of z) {
        const ze = be, $e = ze.url ? "streamable_http" : "stdio", ye = {
          name: ze.name || xe,
          description: ze.description || "",
          enabled: !0,
          transport: $e,
          url: ze.url || "",
          command: ze.command || "",
          args: ze.args || [],
          env: ze.env || {},
          cwd: ze.cwd || "",
          headers: ze.headers || {}
        };
        try {
          await cn(
            q,
            xe,
            ye
          );
        } catch {
          ke = !1;
        }
      }
      ke && (c.success("MCP 客户端已创建"), Q(!1), Ce());
    } catch (V) {
      V instanceof SyntaxError ? c.error("JSON 格式错误：" + V.message) : c.error(V.message || "创建 MCP 失败");
    } finally {
      me(!1);
    }
  }, [se, q, Ce]), Fe = n(
    async (V) => {
      Ie(V), pe(!0), k([]), Se(""), ge(!0);
      try {
        const ce = await mn(
          q,
          V.key
        );
        k(ce);
      } catch (ce) {
        Se(
          ce.message || "无法加载工具列表（MCP 服务可能未运行）"
        );
      } finally {
        ge(!1);
      }
    },
    [q]
  ), He = l(() => {
    if (!A.trim()) return J;
    const V = A.toLowerCase();
    return J.filter(
      (ce) => {
        var z;
        return ce.name.toLowerCase().includes(V) || ce.key.toLowerCase().includes(V) || ((z = ce.description) == null ? void 0 : z.toLowerCase().includes(V)) || ce.transport.toLowerCase().includes(V);
      }
    );
  }, [J, A]), je = J.filter((V) => V.enabled).length, Le = J.reduce((V, ce) => {
    var z;
    return V + (((z = ce.tools) == null ? void 0 : z.length) || 0);
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
        prefix: B ? e.createElement(B) : void 0,
        value: A,
        onChange: (V) => re(V.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      e.createElement(
        y,
        {
          type: "primary",
          icon: Y ? e.createElement(Y) : void 0,
          onClick: () => Q(!0),
          style: Ae
        },
        "添加 MCP"
      )
    ),
    p ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(a, { size: "large" })
    ) : He.length === 0 ? e.createElement(s, {
      description: A ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「添加 MCP」创建"
    }) : e.createElement(
      d,
      { gutter: [12, 12], align: "stretch" },
      ...He.map(
        (V) => e.createElement(
          I,
          {
            key: V.key,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Xn, {
            mcp: V,
            onClick: () => {
              H(V), le(!0);
            },
            onToggle: (ce) => {
              ce.stopPropagation(), Re(V);
            },
            onDelete: (ce) => {
              ce.stopPropagation(), ne(V), ae(!0);
            },
            onViewTools: (ce) => {
              ce.stopPropagation(), Fe(V);
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
        _ ? e.createElement(_, { style: { fontSize: 14 } }) : null,
        "MCP 客户端"
      ),
      children: De
    },
    {
      key: "software",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        D ? e.createElement(D, { style: { fontSize: 14 } }) : null,
        "计算引擎"
      ),
      children: e.createElement(tl)
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
          y,
          {
            icon: S ? e.createElement(S) : void 0,
            onClick: Ce,
            loading: p
          },
          "刷新"
        )
      )
    }),
    e.createElement(P, {
      items: Ge,
      activeKey: $,
      onChange: (V) => w(V)
    }),
    // MCP Detail drawer
    ee ? e.createElement(
      h,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement("span", { style: { fontSize: 18 } }, "🔌"),
          e.createElement(
            "span",
            null,
            ee.name || ee.key
          )
        ),
        open: K,
        onClose: () => le(!1),
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
            ee.key
          )
        ),
        e.createElement(
          f.Item,
          { label: "名称" },
          ee.name || "-"
        ),
        e.createElement(
          f.Item,
          { label: "描述" },
          ee.description || "-"
        ),
        e.createElement(
          f.Item,
          { label: "状态" },
          e.createElement(
            N,
            { color: ee.enabled ? "green" : "default" },
            ee.enabled ? "启用" : "停用"
          )
        ),
        e.createElement(
          f.Item,
          { label: "传输方式" },
          ee.transport
        ),
        ee.url ? e.createElement(
          f.Item,
          { label: "URL" },
          ee.url
        ) : null,
        ee.command ? e.createElement(
          f.Item,
          { label: "命令" },
          e.createElement(
            "code",
            { style: { fontSize: 11 } },
            ee.command
          )
        ) : null,
        ee.args && ee.args.length > 0 ? e.createElement(
          f.Item,
          { label: "参数" },
          ee.args.join(" ")
        ) : null
      ),
      ee.tools && ee.tools.length > 0 ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          Z,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "提供的工具"
        ),
        e.createElement(L, {
          size: "small",
          dataSource: ee.tools,
          renderItem: (V) => e.createElement(
            L.Item,
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
              _ ? e.createElement(_, {
                style: { fontSize: 12, color: "#1677ff" }
              }) : null,
              e.createElement(
                Z,
                { style: { fontSize: 12 } },
                V
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
      G,
      {
        title: "添加 MCP 客户端 (JSON)",
        open: m,
        onCancel: () => Q(!1),
        onOk: Oe,
        confirmLoading: X,
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
        value: se,
        onChange: (V) => he(V.target.value),
        autoSize: { minRows: 12, maxRows: 20 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      })
    ),
    // ── Delete Confirmation Modal ──
    e.createElement(
      G,
      {
        title: "确认删除",
        open: j,
        onOk: Ue,
        onCancel: () => {
          ae(!1), ne(null);
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
      G,
      {
        title: de ? `${de.name || de.key} - 工具列表` : "工具列表",
        open: W,
        onCancel: () => {
          pe(!1), Ie(null);
        },
        footer: e.createElement(
          y,
          { onClick: () => pe(!1) },
          "关闭"
        ),
        width: 640
      },
      ie ? e.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        e.createElement(a, { size: "large" })
      ) : we ? e.createElement(
        "div",
        { style: { color: "#ff4d4f", padding: 16 } },
        we
      ) : Te.length === 0 ? e.createElement(s, {
        description: "此 MCP 客户端暂无可用工具（可能服务未启动）"
      }) : e.createElement(L, {
        size: "small",
        dataSource: Te,
        renderItem: (V) => e.createElement(
          L.Item,
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
              _ ? e.createElement(_, {
                style: { fontSize: 12, color: "#1677ff" }
              }) : null,
              e.createElement(
                Z,
                { strong: !0, style: { fontSize: 13 } },
                V.name || V.key
              )
            ),
            V.description ? e.createElement(
              Z,
              { type: "secondary", style: { fontSize: 12 } },
              V.description
            ) : null
          )
        )
      })
    )
  );
}
function ll({
  agentId: e,
  agentName: t,
  onNavigate: r
}) {
  const n = E().React, { useState: l, useEffect: a, useCallback: s } = n, {
    Spin: i,
    Empty: y,
    Button: c,
    Row: d,
    Col: I,
    Card: h,
    Tag: f,
    Checkbox: N,
    Modal: v,
    Typography: L,
    Drawer: P,
    Descriptions: G,
    message: S
  } = E().antd, {
    ReloadOutlined: Y,
    ThunderboltOutlined: B,
    SettingOutlined: _,
    CheckSquareOutlined: D,
    EyeOutlined: F,
    EyeInvisibleOutlined: g,
    DeleteOutlined: O,
    CloseOutlined: T
  } = E().antdIcons || {}, { Text: Z, Paragraph: C } = L, [x, u] = l([]), [R, q] = l(!0), [J, M] = l(!1), [p, b] = l(null), [A, re] = l(!1), [K, le] = l(
    /* @__PURE__ */ new Set()
  ), [ee, H] = l(!1), $ = s(async () => {
    if (e) {
      q(!0);
      try {
        const j = await ut(e);
        u(j);
      } catch (j) {
        S.error(j.message || "加载技能失败"), u([]);
      } finally {
        q(!1);
      }
    }
  }, [e]);
  a(() => {
    $();
  }, [$]);
  const w = (j) => {
    le((ae) => {
      const oe = new Set(ae);
      return oe.has(j) ? oe.delete(j) : oe.add(j), oe;
    });
  }, m = () => le(/* @__PURE__ */ new Set()), Q = () => le(new Set(x.map((j) => j.name))), se = () => {
    A ? (m(), re(!1)) : re(!0);
  }, he = async () => {
    const j = Array.from(K);
    if (j.length !== 0) {
      H(!0);
      try {
        const { results: ae } = await bn(e, j), oe = Object.entries(ae).filter(
          ([, W]) => W.success === !1
        ), ne = j.length - oe.length;
        oe.length > 0 ? S.warning(
          `批量启用完成：成功 ${ne} 个，失败 ${oe.length} 个`
        ) : S.success(`成功启用 ${j.length} 个技能`), m(), await $();
      } catch (ae) {
        S.error(ae.message || "批量启用失败");
      } finally {
        H(!1);
      }
    }
  }, X = async () => {
    const j = Array.from(K);
    if (j.length !== 0) {
      H(!0);
      try {
        const { results: ae } = await Sn(e, j), oe = Object.entries(ae).filter(
          ([, W]) => W.success === !1
        ), ne = j.length - oe.length;
        oe.length > 0 ? S.warning(
          `批量停用完成：成功 ${ne} 个，失败 ${oe.length} 个`
        ) : S.success(`成功停用 ${j.length} 个技能`), m(), await $();
      } catch (ae) {
        S.error(ae.message || "批量停用失败");
      } finally {
        H(!1);
      }
    }
  }, me = () => {
    const j = Array.from(K);
    j.length !== 0 && v.confirm({
      title: `确认删除 ${j.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        H(!0);
        try {
          const { results: ae } = await xn(e, j), oe = Object.entries(ae).filter(
            ([, W]) => W.success === !1
          ), ne = j.length - oe.length;
          oe.length > 0 ? S.warning(
            `批量删除完成：成功 ${ne} 个，失败 ${oe.length} 个`
          ) : S.success(`成功删除 ${j.length} 个技能`), m(), await $();
        } catch (ae) {
          S.error(ae.message || "批量删除失败");
        } finally {
          H(!1);
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
        Z,
        { type: "secondary", style: { fontSize: 13 } },
        A ? `已选择 ${K.size} / ${x.length} 个技能` : `共 ${x.length} 个技能`
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        A ? n.createElement(
          n.Fragment,
          null,
          n.createElement(
            c,
            { size: "small", onClick: Q },
            "全选"
          ),
          n.createElement(
            c,
            {
              size: "small",
              icon: T ? n.createElement(T) : void 0,
              onClick: m
            },
            "取消选择"
          ),
          n.createElement(
            c,
            {
              size: "small",
              type: "default",
              icon: F ? n.createElement(F) : void 0,
              disabled: K.size === 0 || ee,
              loading: ee,
              onClick: he
            },
            "批量启用"
          ),
          n.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: g ? n.createElement(g) : void 0,
              disabled: K.size === 0 || ee,
              loading: ee,
              onClick: X
            },
            "批量停用"
          ),
          n.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: O ? n.createElement(O) : void 0,
              disabled: K.size === 0 || ee,
              loading: ee,
              onClick: me
            },
            `删除 (${K.size})`
          ),
          n.createElement(
            c,
            {
              size: "small",
              type: "primary",
              onClick: se
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
              icon: D ? n.createElement(D) : void 0,
              onClick: se,
              disabled: x.length === 0
            },
            "批量管理"
          ),
          n.createElement(
            c,
            {
              icon: Y ? n.createElement(Y) : void 0,
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
    ) : x.length === 0 ? n.createElement(y, {
      description: "当前智能体未加载任何技能"
    }) : n.createElement(
      d,
      { gutter: [12, 12] },
      ...x.map(
        (j) => n.createElement(
          I,
          { key: j.name, xs: 24, sm: 12, md: 8, lg: 6 },
          n.createElement(
            h,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: A ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: A && K.has(j.name) ? "#0072f5" : void 0,
                borderWidth: A && K.has(j.name) ? 2 : 1
              },
              onClick: () => {
                A ? w(j.name) : (b(j), M(!0));
              }
            },
            A ? n.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (ae) => {
                  ae.stopPropagation(), w(j.name);
                }
              },
              n.createElement(N, {
                checked: K.has(j.name)
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
              j.emoji ? n.createElement(
                "span",
                { style: { fontSize: 18 } },
                j.emoji
              ) : n.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              n.createElement(
                Z,
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
                j.name
              ),
              j.enabled === !1 ? n.createElement(
                f,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : n.createElement(
                f,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            j.description ? n.createElement(
              C,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              j.description
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
              j.version_text ? n.createElement(
                f,
                { style: { fontSize: 10 } },
                `v${j.version_text}`
              ) : null,
              ...(j.tags || []).slice(0, 3).map(
                (ae, oe) => n.createElement(
                  f,
                  { key: oe, color: "blue", style: { fontSize: 10 } },
                  ae
                )
              )
            )
          )
        )
      )
    ),
    // Skill detail drawer
    p ? n.createElement(
      P,
      {
        title: n.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          n.createElement(
            "span",
            { style: { fontSize: 18 } },
            p.emoji || "⚡"
          ),
          n.createElement("span", null, p.name)
        ),
        open: J,
        onClose: () => M(!1),
        width: 520,
        extra: n.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: _ ? n.createElement(_) : void 0,
            onClick: () => r("/skills")
          },
          "管理技能"
        )
      },
      n.createElement(
        G,
        { column: 1, bordered: !0, size: "small" },
        n.createElement(
          G.Item,
          { label: "技能名称" },
          p.name
        ),
        n.createElement(
          G.Item,
          { label: "描述" },
          p.description || "-"
        ),
        p.version_text ? n.createElement(
          G.Item,
          { label: "版本" },
          p.version_text
        ) : null,
        n.createElement(
          G.Item,
          { label: "来源" },
          p.source || "-"
        ),
        n.createElement(
          G.Item,
          { label: "状态" },
          p.enabled === !1 ? "已禁用" : "已启用"
        ),
        p.installed_from ? n.createElement(
          G.Item,
          { label: "安装来源" },
          p.installed_from
        ) : null
      ),
      // Tags
      p.tags && p.tags.length > 0 ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          Z,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        n.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...p.tags.map(
            (j, ae) => n.createElement(f, { key: ae, color: "blue" }, j)
          )
        )
      ) : null,
      // Skill content preview
      p.content ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          Z,
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
          p.content.slice(0, 2e3) + (p.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function al({
  poolSkills: e,
  workspaceSkills: t,
  agents: r,
  loading: n,
  onReload: l
}) {
  const a = E().React, { useState: s, useMemo: i, useCallback: y } = a, {
    Spin: c,
    Empty: d,
    Input: I,
    Button: h,
    Row: f,
    Col: N,
    Card: v,
    Tag: L,
    Typography: P,
    Drawer: G,
    Descriptions: S,
    List: Y
  } = E().antd, {
    ReloadOutlined: B,
    SearchOutlined: _,
    DownloadOutlined: D,
    ThunderboltOutlined: F
  } = E().antdIcons || {}, { Text: g, Paragraph: O } = P, [T, Z] = s(""), [C, x] = s(!1), [u, R] = s(null), [q, J] = s([]), [M, p] = s(!1), [b, A] = s(24), re = i(() => {
    if (!T.trim()) return e;
    const w = T.toLowerCase();
    return e.filter(
      (m) => {
        var Q, se;
        return m.name.toLowerCase().includes(w) || ((Q = m.description) == null ? void 0 : Q.toLowerCase().includes(w)) || ((se = m.tags) == null ? void 0 : se.some((he) => he.toLowerCase().includes(w)));
      }
    );
  }, [e, T]), K = i(
    () => re.slice(0, b),
    [re, b]
  ), le = y((w) => {
    Z(w), A(24);
  }, []), ee = y(
    (w) => {
      const m = [];
      for (const Q of t)
        if (Q.skills.some((se) => se.name === w)) {
          const se = r.find((he) => he.id === Q.agent_id);
          m.push((se == null ? void 0 : se.name) || Q.agent_name || Q.agent_id);
        }
      return m;
    },
    [t, r]
  ), H = y(
    async (w) => {
      if (R(w), J(ee(w.name)), x(!0), !w.content) {
        p(!0);
        try {
          const m = await ln(w.name);
          R({ ...w, content: m });
        } catch {
        } finally {
          p(!1);
        }
      }
    },
    [ee]
  ), $ = (w) => {
    window.history.pushState({}, "", w), window.dispatchEvent(new PopStateEvent("popstate"));
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
          marginBottom: 16
        }
      },
      a.createElement(I, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: _ ? a.createElement(_) : void 0,
        value: T,
        onChange: (w) => le(w.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          h,
          {
            icon: B ? a.createElement(B) : void 0,
            onClick: l,
            loading: n,
            size: "small"
          },
          "刷新"
        ),
        a.createElement(
          h,
          {
            type: "primary",
            icon: D ? a.createElement(D) : void 0,
            onClick: () => $("/skill-pool"),
            size: "small",
            style: Ae
          },
          "管理技能池"
        )
      )
    ),
    n ? a.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      a.createElement(c, { size: "large" })
    ) : re.length === 0 ? a.createElement(d, {
      description: T ? "未找到匹配的技能" : "技能池为空"
    }) : a.createElement(
      a.Fragment,
      null,
      a.createElement(
        f,
        { gutter: [12, 12] },
        ...K.map(
          (w) => a.createElement(
            N,
            { key: w.name, xs: 24, sm: 12, md: 8, lg: 6 },
            a.createElement(
              v,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => H(w)
              },
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
                w.emoji ? a.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  w.emoji
                ) : a.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "⚡"
                ),
                a.createElement(
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
                  w.name
                ),
                w.protected ? a.createElement(
                  L,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              w.description ? a.createElement(
                O,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                w.description
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
                w.version_text ? a.createElement(
                  L,
                  { style: { fontSize: 10 } },
                  `v${w.version_text}`
                ) : null,
                ...(w.tags || []).slice(0, 3).map(
                  (m, Q) => a.createElement(
                    L,
                    { key: Q, color: "cyan", style: { fontSize: 10 } },
                    m
                  )
                )
              )
            )
          )
        ),
        // Load more button
        K.length < re.length ? a.createElement(
          "div",
          { style: { textAlign: "center", marginTop: 16 } },
          a.createElement(
            h,
            {
              onClick: () => A((w) => w + 24),
              size: "small"
            },
            `加载更多 (剩余 ${re.length - K.length} 个)`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    u ? a.createElement(
      G,
      {
        title: a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          a.createElement(
            "span",
            { style: { fontSize: 18 } },
            u.emoji || "⚡"
          ),
          a.createElement("span", null, u.name)
        ),
        open: C,
        onClose: () => x(!1),
        width: 520,
        extra: a.createElement(
          h,
          {
            type: "primary",
            size: "small",
            icon: F ? a.createElement(F) : void 0,
            onClick: () => $("/skills")
          },
          "管理技能"
        )
      },
      a.createElement(
        S,
        { column: 1, bordered: !0, size: "small" },
        a.createElement(
          S.Item,
          { label: "技能名称" },
          u.name
        ),
        a.createElement(
          S.Item,
          { label: "描述" },
          u.description || "-"
        ),
        u.version_text ? a.createElement(
          S.Item,
          { label: "版本" },
          u.version_text
        ) : null,
        a.createElement(
          S.Item,
          { label: "来源" },
          u.source || "-"
        ),
        a.createElement(
          S.Item,
          { label: "受保护" },
          u.protected ? "是（内置）" : "否"
        ),
        u.sync_status ? a.createElement(
          S.Item,
          { label: "同步状态" },
          u.sync_status
        ) : null,
        u.installed_from ? a.createElement(
          S.Item,
          { label: "安装来源" },
          u.installed_from
        ) : null
      ),
      // Tags
      u.tags && u.tags.length > 0 ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          g,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        a.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...u.tags.map(
            (w, m) => a.createElement(L, { key: m, color: "cyan" }, w)
          )
        )
      ) : null,
      // Installed agents
      a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          g,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${q.length})`
        ),
        q.length > 0 ? a.createElement(Y, {
          size: "small",
          dataSource: q,
          renderItem: (w) => a.createElement(
            Y.Item,
            null,
            a.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              a.createElement(Be, { name: w, size: 20 }),
              a.createElement(
                g,
                { style: { fontSize: 13 } },
                w
              )
            )
          )
        }) : a.createElement(
          g,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      M ? a.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        a.createElement(c, { size: "small" })
      ) : u.content ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          g,
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
          u.content.slice(0, 2e3) + (u.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function rl() {
  const e = E().React, { useState: t, useEffect: r, useCallback: n, useMemo: l } = e, { Tabs: a, message: s } = E().antd, { ThunderboltOutlined: i, AppstoreOutlined: y } = E().antdIcons || {}, d = E().useSelectedAgent, I = d ? d() : null, h = (I == null ? void 0 : I.id) || "default", [f, N] = t([]), [v, L] = t([]), [P, G] = t([]), [S, Y] = t(!0), [B, _] = t("agent-skills"), D = n(async () => {
    Y(!0);
    try {
      const [T, Z, C] = await Promise.all([
        pt(!0),
        dt(),
        an()
      ]);
      L(T), N(Z), G(C);
    } catch (T) {
      s.error(T.message || "加载技能列表失败"), L([]);
    } finally {
      Y(!1);
    }
  }, []);
  r(() => {
    D();
  }, [D]);
  const F = l(() => {
    const T = f.find((Z) => Z.id === h);
    return (T == null ? void 0 : T.name) || h;
  }, [f, h]), g = (T) => {
    window.history.pushState({}, "", T), window.dispatchEvent(new PopStateEvent("popstate"));
  }, O = [
    {
      key: "agent-skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        i ? e.createElement(i, { style: { fontSize: 14 } }) : null,
        "当前Agent加载技能"
      ),
      children: e.createElement(ll, {
        agentId: h,
        agentName: F,
        onNavigate: g
      })
    },
    {
      key: "skill-pool",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        y ? e.createElement(y, { style: { fontSize: 14 } }) : null,
        "技能池"
      ),
      children: e.createElement(al, {
        poolSkills: v,
        workspaceSkills: P,
        agents: f,
        loading: S,
        onReload: D
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(lt, {
      title: "技能",
      subtitle: `技能池共 ${v.length} 个技能 · 当前智能体：${F}`
    }),
    e.createElement(a, {
      items: O,
      activeKey: B,
      onChange: (T) => _(T)
    })
  );
}
const ct = "ugsci.market.githubSources", Tt = "https://github.com/anthropics/skills/tree/main/skills";
function Wt(e) {
  try {
    const t = new URL(e.trim()), r = t.hostname.toLowerCase();
    if (r !== "github.com" && r !== "www.github.com") return null;
    const n = t.pathname.split("/").filter((y) => y.length > 0);
    if (n.length < 2) return null;
    const l = decodeURIComponent(n[0]), a = decodeURIComponent(n[1]);
    let s = "main", i = "";
    return n.length >= 4 && (n[2] === "tree" || n[2] === "blob") ? (s = decodeURIComponent(n[3]), n.length > 4 && (i = n.slice(4).map(decodeURIComponent).join("/"))) : n.length > 2 && (i = n.slice(2).map(decodeURIComponent).join("/")), i = i.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: l,
      repo: a,
      ref: s || "main",
      skillsPath: i,
      label: `${l}/${a}`
    };
  } catch {
    return null;
  }
}
function Jt(e, t, r) {
  return `${e}/${t}:${r || "/"}`;
}
function ol() {
  try {
    const e = localStorage.getItem(ct);
    if (!e) {
      const r = Wt(Tt);
      if (r) {
        const n = [
          {
            id: Jt(
              r.owner,
              r.repo,
              r.skillsPath
            ),
            url: Tt,
            label: r.label,
            owner: r.owner,
            repo: r.repo,
            ref: r.ref,
            skillsPath: r.skillsPath,
            enabled: !0
          }
        ];
        return localStorage.setItem(ct, JSON.stringify(n)), n;
      }
      return [];
    }
    const t = JSON.parse(e);
    return Array.isArray(t) ? t.filter(
      (r) => r && typeof r.id == "string" && typeof r.owner == "string" && typeof r.repo == "string"
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
function sl(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const r = t[1], n = {}, l = r.split(`
`);
  let a = "";
  for (const s of l) {
    const i = s.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (i) {
      a = i[1];
      let y = i[2].trim();
      (y.startsWith('"') && y.endsWith('"') || y.startsWith("'") && y.endsWith("'")) && (y = y.slice(1, -1)), a === "name" ? n.name = y : a === "description" ? n.description = y : a === "version" ? n.version = y : a === "author" && (n.author = y);
    }
  }
  return n;
}
async function il(e) {
  const t = e.skillsPath ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/") : "", r = `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${t}?ref=${encodeURIComponent(e.ref)}`, n = await fetch(r, {
    headers: { Accept: "application/vnd.github+json" }
  });
  if (!n.ok)
    throw new Error(
      `GitHub API ${n.status}: ${e.label} (${e.skillsPath || "/"})`
    );
  const l = await n.json();
  if (!Array.isArray(l)) return [];
  const a = l.filter(
    (i) => i.type === "dir" && i.name
  );
  return await Promise.all(
    a.map(async (i) => {
      const y = `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${e.skillsPath ? e.skillsPath + "/" : ""}${i.name}/SKILL.md`, c = `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${e.skillsPath ? e.skillsPath + "/" : ""}${i.name}`, d = {
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
        const I = await fetch(y);
        if (!I.ok) return d;
        const h = await I.text(), f = sl(h);
        return {
          ...d,
          name: f.name || i.name,
          description: f.description || "",
          version: f.version || null,
          author: f.author || null
        };
      } catch {
        return d;
      }
    })
  );
}
async function cl(e) {
  const t = e.filter((a) => a.enabled), r = await Promise.all(
    t.map(async (a) => {
      try {
        return { skills: await il(a), error: null, label: a.label };
      } catch (s) {
        return {
          skills: [],
          error: s.message || String(s),
          label: a.label
        };
      }
    })
  ), n = [], l = [];
  for (const a of r)
    n.push(...a.skills), a.error && l.push({ label: a.label, message: a.error });
  return { skills: n, errors: l };
}
function ml({
  open: e,
  onClose: t,
  sources: r,
  onChange: n
}) {
  const l = E().React, { useState: a } = l, {
    Modal: s,
    Input: i,
    Button: y,
    List: c,
    Tag: d,
    Switch: I,
    Typography: h,
    Tooltip: f,
    message: N
  } = E().antd, {
    PlusOutlined: v,
    DeleteOutlined: L,
    LinkOutlined: P,
    GithubOutlined: G
  } = E().antdIcons || {}, { Text: S } = h, [Y, B] = a(""), _ = () => {
    const g = Y.trim();
    if (!g) return;
    const O = Wt(g);
    if (!O) {
      N.error("无效的 GitHub URL，请输入类似 https://github.com/owner/repo/tree/main/skills 的链接");
      return;
    }
    const T = Jt(O.owner, O.repo, O.skillsPath);
    if (r.some((x) => x.id === T)) {
      N.warning("该源已存在");
      return;
    }
    const Z = {
      id: T,
      url: g,
      label: O.label,
      owner: O.owner,
      repo: O.repo,
      ref: O.ref,
      skillsPath: O.skillsPath,
      enabled: !0
    }, C = [...r, Z];
    ot(C), n(C), B(""), N.success(`已添加源: ${O.label}`);
  }, D = (g, O) => {
    const T = r.map(
      (Z) => Z.id === g ? { ...Z, enabled: O } : Z
    );
    ot(T), n(T);
  }, F = (g) => {
    const O = r.filter((T) => T.id !== g);
    ot(O), n(O), N.success("已移除源");
  };
  return l.createElement(
    s,
    {
      open: e,
      onCancel: t,
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        G ? l.createElement(G, { style: { fontSize: 18 } }) : null,
        l.createElement("span", null, "配置技能源")
      ),
      footer: l.createElement(
        y,
        { onClick: t },
        "关闭"
      ),
      width: 640
    },
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        S,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        l.createElement(i, {
          placeholder: "https://github.com/anthropics/skills/tree/main/skills",
          value: Y,
          onChange: (g) => B(g.target.value),
          onPressEnter: _,
          prefix: P ? l.createElement(P) : void 0,
          style: { flex: 1 }
        }),
        l.createElement(
          y,
          {
            type: "primary",
            icon: v ? l.createElement(v) : void 0,
            onClick: _
          },
          "添加"
        )
      )
    ),
    l.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      l.createElement(S, { strong: !0 }, `已配置源 (${r.length})`)
    ),
    l.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: r,
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
                onChange: (O) => D(g.id, O)
              })
            ),
            l.createElement(
              f,
              { title: "移除此源" },
              l.createElement(
                y,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: L ? l.createElement(L) : void 0,
                  onClick: () => F(g.id)
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
              d,
              { color: "blue", style: { fontSize: 11 } },
              g.label
            ),
            g.skillsPath ? l.createElement(
              S,
              { type: "secondary", style: { fontSize: 11 } },
              `/${g.skillsPath}`
            ) : null,
            l.createElement(
              S,
              { type: "secondary", style: { fontSize: 11 } },
              `@${g.ref}`
            )
          ),
          l.createElement(
            S,
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
async function dl() {
  return te("/market/providers");
}
async function ul(e) {
  return te(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function pl(e, t, r, n, l) {
  return te("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: t,
      limit: r,
      lang: n,
      category: l || void 0
    })
  });
}
async function zt(e, t, r) {
  return te("/skills/hub/install/start", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({
      bundle_url: t,
      enable: r
    })
  });
}
async function It(e, t) {
  return te(
    `/skills/hub/install/status/${encodeURIComponent(t)}`,
    {
      headers: { "X-Agent-Id": e }
    }
  );
}
function gl() {
  const e = E().React, { useState: t, useEffect: r, useCallback: n, useMemo: l, useRef: a } = e, {
    Spin: s,
    Empty: i,
    Input: y,
    Button: c,
    message: d,
    Row: I,
    Col: h,
    Card: f,
    Tag: N,
    Tooltip: v,
    Typography: L,
    Select: P,
    Drawer: G,
    Descriptions: S,
    Tabs: Y,
    Badge: B,
    Progress: _
  } = E().antd, {
    ReloadOutlined: D,
    SearchOutlined: F,
    DownloadOutlined: g,
    AppstoreOutlined: O,
    ShopOutlined: T,
    CheckCircleOutlined: Z,
    LoadingOutlined: C,
    UserOutlined: x,
    SettingOutlined: u,
    GithubOutlined: R,
    ApiOutlined: q
  } = E().antdIcons || {}, { Text: J, Paragraph: M, Title: p } = L, [b, A] = t("skills"), [re, K] = t([]), [le, ee] = t([]), [H, $] = t([]), [w, m] = t(""), [Q, se] = t(""), [he, X] = t(!1), [me, j] = t(!1), [ae, oe] = t(
    {}
  ), [ne, W] = t(null), [pe, de] = t({}), [Ie, Te] = t([]), [k, ie] = t(""), [ge, we] = t(""), [Se, Ce] = t(""), [Re, Ue] = t({}), [Oe, Fe] = t(""), [He, je] = t(/* @__PURE__ */ new Set()), [Le, De] = t([]), [Ge, V] = t([]), [ce, z] = t(!1), [ke, xe] = t(!1), [be, ze] = t(""), $e = a(null);
  r(() => {
    Promise.all([
      dl().catch(() => []),
      ul("zh").catch(() => []),
      dt().catch(() => [])
    ]).then(([o, U, ue]) => {
      K(o), ee(U), Te(ue), ue.length > 0 && (ie(ue[0].id), Fe(ue[0].id));
    });
  }, []);
  const ye = n(async (o) => {
    const U = o ?? ol();
    if (De(o || U), U.filter((fe) => fe.enabled).length === 0) {
      V([]);
      return;
    }
    z(!0);
    try {
      const { skills: fe, errors: Pe } = await cl(U);
      if (V(fe), Pe.length > 0) {
        for (const Ee of Pe)
          console.warn(`[ugsci] GitHub source '${Ee.label}' error: ${Ee.message}`);
        d.warning(
          `部分源加载失败: ${Pe.map((Ee) => Ee.label).join(", ")}`
        );
      }
    } catch (fe) {
      d.error(fe.message || "加载 GitHub 技能源失败"), V([]);
    } finally {
      z(!1);
    }
  }, []);
  r(() => {
    ye();
  }, [ye]);
  const Je = n(
    async (o, U, ue) => {
      X(!0);
      try {
        const fe = await pl(
          o,
          ue,
          20,
          "zh",
          U || void 0
        );
        ue === void 0 || Object.keys(ue).length === 0 ? $(fe.results) : $((ve) => [...ve, ...fe.results]);
        const Pe = Object.values(fe.by_provider || {}).some(
          (ve) => ve.has_more
        );
        j(Pe);
        const Ee = {};
        for (const [ve, _e] of Object.entries(fe.by_provider || {}))
          Ee[ve] = (ue[ve] || 1) + 1;
        if (oe(Ee), fe.errors.length > 0)
          for (const ve of fe.errors)
            console.warn(
              `[ugsci] Market provider '${ve.provider}' error: ${ve.message}`
            );
      } catch (fe) {
        d.error(fe.message || "搜索市场失败"), $([]);
      } finally {
        X(!1);
      }
    },
    []
  );
  r(() => ($e.current && clearTimeout($e.current), $e.current = setTimeout(() => {
    Je(w, Q, {});
  }, 400), () => {
    $e.current && clearTimeout($e.current);
  }), [w, Q, Je]);
  const at = () => {
    Je(w, Q, ae);
  }, Ve = async (o) => {
    var ue;
    if (!k) {
      d.warning("请先选择安装目标专家");
      return;
    }
    const U = `${o.source}:${o.slug}`;
    try {
      de((Ee) => ({ ...Ee, [U]: "starting" }));
      const fe = await zt(
        k,
        o.source_url,
        !0
      );
      de((Ee) => ({ ...Ee, [U]: "installing" }));
      const Pe = 60;
      for (let Ee = 0; Ee < Pe; Ee++) {
        await new Promise((_e) => setTimeout(_e, 2e3));
        const ve = await It(
          k,
          fe.task_id
        );
        if (ve.status === "completed" && ((ue = ve.result) != null && ue.installed)) {
          d.success(`技能「${ve.result.name || o.name}」安装成功`), de((_e) => {
            const Me = { ..._e };
            return delete Me[U], Me;
          });
          return;
        }
        if (ve.status === "failed")
          throw new Error(ve.error || "安装失败");
        if (ve.status === "cancelled") {
          d.info("安装已取消"), de((_e) => {
            const Me = { ..._e };
            return delete Me[U], Me;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (fe) {
      d.error(fe.message || "安装技能失败"), de((Pe) => {
        const Ee = { ...Pe };
        return delete Ee[U], Ee;
      });
    }
  }, We = (o) => {
    window.history.pushState({}, "", o), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Kt = async (o) => {
    var ue;
    if (!k) {
      d.warning("请先选择安装目标专家");
      return;
    }
    const U = `github:${o.sourceId}:${o.name}`;
    try {
      de((Ee) => ({ ...Ee, [U]: "starting" }));
      const fe = await zt(
        k,
        o.source_url,
        !0
      );
      de((Ee) => ({ ...Ee, [U]: "installing" }));
      const Pe = 60;
      for (let Ee = 0; Ee < Pe; Ee++) {
        await new Promise((_e) => setTimeout(_e, 2e3));
        const ve = await It(
          k,
          fe.task_id
        );
        if (ve.status === "completed" && ((ue = ve.result) != null && ue.installed)) {
          d.success(`技能「${ve.result.name || o.name}」安装成功`), de((_e) => {
            const Me = { ..._e };
            return delete Me[U], Me;
          });
          return;
        }
        if (ve.status === "failed")
          throw new Error(ve.error || "安装失败");
        if (ve.status === "cancelled") {
          d.info("安装已取消"), de((_e) => {
            const Me = { ..._e };
            return delete Me[U], Me;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (fe) {
      d.error(fe.message || "安装技能失败"), de((Pe) => {
        const Ee = { ...Pe };
        return delete Ee[U], Ee;
      });
    }
  }, rt = l(() => {
    let o = Ge;
    if (be && (o = o.filter((U) => U.sourceLabel === be)), w.trim()) {
      const U = w.toLowerCase();
      o = o.filter(
        (ue) => {
          var fe;
          return ue.name.toLowerCase().includes(U) || ((fe = ue.description) == null ? void 0 : fe.toLowerCase().includes(U));
        }
      );
    }
    return o;
  }, [Ge, w, be]), Qe = re.filter((o) => o.available), Ke = l(() => {
    if (!be) return H;
    const o = Qe.find(
      (U) => U.label === be
    );
    return o ? H.filter((U) => U.source === o.key) : H;
  }, [H, be, Qe]), Et = l(() => {
    const o = /* @__PURE__ */ new Set();
    return Le.filter((U) => U.enabled).forEach((U) => o.add(U.label)), Qe.forEach((U) => o.add(U.label)), Array.from(o);
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
      e.createElement(y, {
        placeholder: "搜索技能市场...",
        prefix: F ? e.createElement(F) : void 0,
        value: w,
        onChange: (o) => m(o.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      le.length > 0 ? e.createElement(P, {
        value: Q || void 0,
        onChange: (o) => se(o || ""),
        placeholder: "全部分类",
        allowClear: !0,
        style: { minWidth: 150 },
        options: [
          { value: "", label: "全部分类" },
          ...le.map((o) => ({ value: o.id, label: o.label }))
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
        e.createElement(P, {
          value: k || void 0,
          onChange: (o) => ie(o),
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
        N,
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
          N,
          {
            key: o,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: be === o ? "blue" : void 0,
            icon: R && Le.some((U) => U.label === o) ? e.createElement(R) : void 0,
            onClick: () => ze(
              be === o ? "" : o
            )
          },
          o
        )
      )
    ) : null,
    // GitHub skills section
    ce && Ge.length === 0 ? e.createElement(
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
          const U = `github:${o.sourceId}:${o.name}`, ue = pe[U];
          return e.createElement(
            h,
            { key: U, xs: 24, sm: 12, md: 8, lg: 6 },
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
                  v,
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
                M,
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
                    N,
                    { color: "blue", style: { fontSize: 10 } },
                    o.sourceLabel
                  ),
                  o.version ? e.createElement(
                    N,
                    { style: { fontSize: 10 } },
                    `v${o.version}`
                  ) : null
                ),
                ue ? e.createElement(
                  c,
                  {
                    size: "small",
                    disabled: !0,
                    icon: C ? e.createElement(C) : void 0
                  },
                  ue === "starting" ? "启动中" : "安装中"
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
    Ke.length > 0 || he ? e.createElement(
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
    he && Ke.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(s, { size: "large" })
    ) : Ke.length === 0 ? e.createElement(i, {
      description: w ? `未找到匹配「${w}」的技能` : "输入关键词搜索技能市场",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      I,
      { gutter: [12, 12] },
      ...Ke.map((o) => {
        const U = `${o.source}:${o.slug}`, ue = pe[U];
        return e.createElement(
          h,
          { key: U, xs: 24, sm: 12, md: 8, lg: 6 },
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
                v,
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
              M,
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
                  N,
                  { color: "geekblue", style: { fontSize: 10 } },
                  o.source
                ),
                o.version ? e.createElement(
                  N,
                  { style: { fontSize: 10 } },
                  `v${o.version}`
                ) : null
              ),
              ue ? e.createElement(
                c,
                {
                  size: "small",
                  disabled: !0,
                  icon: C ? e.createElement(C) : void 0
                },
                ue === "starting" ? "启动中" : "安装中"
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
    me && !he ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        c,
        { onClick: at, loading: he },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    ne ? e.createElement(
      G,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          ne.icon_url ? e.createElement("img", {
            src: ne.icon_url,
            alt: ne.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, ne.name)
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
              Ve(ne);
            }
          },
          "安装到专家"
        )
      },
      e.createElement(
        S,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          S.Item,
          { label: "来源" },
          ne.source
        ),
        e.createElement(
          S.Item,
          { label: "描述" },
          ne.description || "-"
        ),
        ne.version ? e.createElement(
          S.Item,
          { label: "版本" },
          ne.version
        ) : null,
        ne.author ? e.createElement(
          S.Item,
          { label: "作者" },
          ne.author
        ) : null,
        e.createElement(
          S.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: ne.source_url, target: "_blank" },
            ne.source_url
          )
        )
      ),
      ne.stats ? e.createElement(
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
          ...Object.entries(ne.stats).map(
            ([o, U]) => e.createElement(
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
                String(U)
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
      (U) => U.name.toLowerCase().includes(o) || U.description.toLowerCase().includes(o) || U.category.toLowerCase().includes(o)
    );
  }, [ge]), Vt = async (o) => {
    try {
      const U = await te("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: o.name,
          description: o.description,
          skill_names: o.recommendedSkills
        })
      });
      await tt(U.id, "AGENTS.md", o.systemPrompt);
      const ue = await nt(U.id);
      ue.approval_level = o.approvalLevel, await te(`/agents/${encodeURIComponent(U.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ue)
      }), d.success(`专家「${o.name}」创建成功，已跳转至专家`), We("/ugsci-experts");
    } catch (U) {
      d.error(U.message || "创建专家失败");
    }
  }, ht = n(async (o) => {
    if (o)
      try {
        const U = await yt(o);
        je(new Set(U.map((ue) => ue.key)));
      } catch {
        je(/* @__PURE__ */ new Set());
      }
  }, []);
  r(() => {
    Oe && ht(Oe);
  }, [Oe, ht]);
  const Yt = async (o) => {
    if (!Oe) {
      d.warning("请先选择目标专家");
      return;
    }
    Ue((U) => ({ ...U, [o.id]: !0 }));
    try {
      const U = o.id;
      await Lt(Oe, {
        client_key: U,
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
      }), d.success(`MCP「${o.name}」已添加到当前专家`), je((ue) => new Set(ue).add(U));
    } catch (U) {
      d.error(U.message || `添加 MCP「${o.name}」失败`);
    } finally {
      Ue((U) => ({ ...U, [o.id]: !1 }));
    }
  }, Qt = l(() => {
    if (!Se.trim()) return vt;
    const o = Se.toLowerCase();
    return vt.filter(
      (U) => U.name.toLowerCase().includes(o) || U.description.toLowerCase().includes(o) || U.category.toLowerCase().includes(o)
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
      e.createElement(y, {
        placeholder: "搜索 MCP 模板...",
        prefix: F ? e.createElement(F) : void 0,
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
        e.createElement(P, {
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
          h,
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
                    N,
                    { color: "blue", style: { fontSize: 10 } },
                    o.category
                  ),
                  e.createElement(
                    N,
                    {
                      color: o.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    o.transport
                  ),
                  o.env && Object.keys(o.env).length > 0 ? e.createElement(
                    N,
                    { color: "orange", style: { fontSize: 10 } },
                    "需配置密钥"
                  ) : null
                )
              )
            ),
            // Description
            e.createElement(
              M,
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
                  loading: !!Re[o.id],
                  icon: q ? e.createElement(q) : void 0,
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
    e.createElement(y, {
      placeholder: "搜索专家模板...",
      prefix: F ? e.createElement(F) : void 0,
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
          h,
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
                    N,
                    { color: "blue", style: { fontSize: 10 } },
                    o.category
                  ),
                  o.approvalLevel === "MANUAL" ? e.createElement(
                    N,
                    { color: "orange", style: { fontSize: 10 } },
                    "需审批"
                  ) : e.createElement(
                    N,
                    { color: "green", style: { fontSize: 10 } },
                    "自动"
                  )
                )
              )
            ),
            e.createElement(
              M,
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
                  icon: O ? e.createElement(O) : void 0
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
        O ? e.createElement(O, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: Xt
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        q ? e.createElement(q, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: Zt
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        x ? e.createElement(x, { style: { fontSize: 14 } }) : null,
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
            icon: D ? e.createElement(D) : void 0,
            onClick: () => {
              Je(w, Q, {}), ye();
            },
            loading: he || ce
          },
          "刷新"
        )
      )
    }),
    e.createElement(Y, {
      items: tn,
      activeKey: b,
      onChange: (o) => A(o)
    }),
    // Source config modal
    e.createElement(ml, {
      open: ke,
      onClose: () => xe(!1),
      sources: Le,
      onChange: (o) => {
        De(o), ye(o);
      }
    })
  );
}
function yl() {
  var c;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = E().React, r = "ugsci", n = E().antdIcons || {}, l = n.UserSwitchOutlined, a = n.ToolOutlined, s = n.ThunderboltOutlined, i = n.ShopOutlined;
  e.route.add(r, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: Kn
  }), e.menu.add(r, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家",
    icon: l ? t.createElement(l, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => Xe()
  }), e.route.add(r, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: nl
  }), e.menu.add(r, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "工具",
    icon: a ? t.createElement(a, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.capabilities",
    order: 6,
    visible: () => Xe()
  }), e.route.add(r, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: rl
  }), e.menu.add(r, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能",
    icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.skills-center",
    order: 7,
    visible: () => Xe()
  }), e.route.add(r, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: gl
  }), e.menu.add(r, {
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
  const y = [
    "core.skills",
    "core.tools",
    "core.mcp",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool"
  ];
  for (const d of y) {
    try {
      const h = e.menu.snapshot("primary.agentScoped").find((f) => f.id === d);
      h && e.menu.replace(r, d, {
        ...h,
        visible: () => !Xe()
      });
    } catch {
    }
    try {
      const h = e.menu.snapshot("primary.settings").find((f) => f.id === d);
      h && e.menu.replace(r, d, {
        ...h,
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
    yl();
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
