function E() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Sn() {
  try {
    return E().getApiToken() || "";
  } catch {
    return "";
  }
}
function Ve(e) {
  return E().getApiUrl(e);
}
function Dt(e) {
  const t = Sn();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
async function ne(e, t) {
  const r = await fetch(Ve(e), {
    ...t,
    headers: { ...Dt(), ...(t == null ? void 0 : t.headers) || {} }
  });
  if (!r.ok) {
    const n = await r.text().catch(() => "");
    throw new Error(n || `HTTP ${r.status}`);
  }
  return r.status === 204 ? null : r.json();
}
async function Et() {
  const e = await ne("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function st(e) {
  return ne(`/agents/${encodeURIComponent(e)}`);
}
async function it(e) {
  return await ne("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function ht(e = !1) {
  return await ne(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function xn(e) {
  const t = await ne(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function wn() {
  return await ne("/skills/workspaces") || [];
}
async function Cn(e) {
  return await ne("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function kn(e, t) {
  return ne(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Tn(e, t) {
  await ne(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function In(e, t, r) {
  return ne("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ client_key: t, client: r })
  });
}
async function zn(e, t) {
  return await ne(
    `/mcp/tools/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
const Me = {
  background: "#0072f5",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8
};
function Ke() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function vt(e, t) {
  const r = E();
  return r.ReactMarkdown && r.remarkGfm ? t.createElement(
    r.ReactMarkdown,
    { remarkPlugins: [r.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
const Tt = [
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
], pt = [
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
], Ut = "ugsci_custom_teams";
function at() {
  try {
    const e = localStorage.getItem(Ut);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function Ft(e) {
  try {
    localStorage.setItem(Ut, JSON.stringify(e));
  } catch {
  }
}
const Pn = [
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
async function _n(e, t) {
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
  await fetch(Ve("/console/chat"), {
    method: "POST",
    headers: {
      ...Dt(),
      "X-Agent-Id": e
    },
    body: JSON.stringify(r)
  });
}
function rt(e, t) {
  const r = e.find(
    (a) => a.name === t || a.name === t.replace(/\s+/g, "")
  );
  if (r) return r.id;
  const n = e.find(
    (a) => a.name.includes(t) || t.includes(a.name) || a.name.replace(/\s+/g, "").includes(t.replace(/\s+/g, ""))
  );
  return n ? n.id : null;
}
function On(e) {
  var r;
  const t = e.members.map((n) => `- ${n.name}（${n.role}）`).join(`
`);
  if (e.custom && e.steps && e.steps.length > 0) {
    const n = e.steps.map((l, o) => {
      const i = l.passContext ? "（传递上一步的结果作为上下文）" : "（独立执行，不传递上下文）";
      return `${o + 1}. 向「${l.agentName}」发送请求：${l.instruction} ${i}`;
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
function An({ team: e }) {
  const t = E().React, { Typography: r, Tag: n } = E().antd, { Text: a } = r, l = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙"
  }, o = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff"
  }, i = e.steps || [], f = i.length > 0;
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
      a,
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
      ...f ? i.map((c, d) => (e.members.find(
        (k) => k.name === c.agentName
      ), [
        d > 0 && e.mode !== "roundtable" ? t.createElement(
          "div",
          {
            key: `arrow-${d}`,
            style: {
              textAlign: "center",
              color: o[e.mode],
              fontSize: 14
            }
          },
          l[e.mode]
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
              border: `1px solid ${o[e.mode]}33`,
              fontSize: 12,
              flex: e.mode === "roundtable" ? "1 1 200px" : "initial"
            }
          },
          t.createElement(Le, {
            name: c.agentName,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              a,
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
              color: o[e.mode],
              fontSize: 14
            }
          },
          l[e.mode]
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
              border: `1px solid ${o[e.mode]}33`,
              fontSize: 12,
              flex: e.mode === "roundtable" ? "1 1 150px" : "initial"
            }
          },
          t.createElement(Le, { name: c.name, size: 24 }),
          t.createElement(
            "div",
            null,
            t.createElement(
              a,
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
function Mn({
  open: e,
  onClose: t,
  agents: r,
  editingTeam: n,
  onSaved: a
}) {
  const l = E().React, { useState: o, useEffect: i, useCallback: f } = l, {
    Modal: c,
    Input: d,
    Button: k,
    Select: b,
    Tag: h,
    Typography: P,
    Switch: p,
    Empty: I,
    message: M,
    Divider: q,
    Steps: w
  } = E().antd, { PlusOutlined: Z, DeleteOutlined: N, SaveOutlined: $, ArrowRightOutlined: G } = E().antdIcons || {}, { Text: F, Paragraph: y } = P, [R, z] = o(""), [te, T] = o("🤝"), [x, u] = o(""), [B, H] = o(
    "pipeline"
  ), [Y, L] = o(""), [g, C] = o(""), [j, ae] = o([]), [S, D] = o([]), [X, U] = o(!1);
  i(() => {
    e && (n ? (z(n.name), T(n.emoji), u(n.description), H(n.mode), L(n.coordinatorName || ""), C(n.taskTemplate), ae(n.steps || []), D(n.members.map((Q) => Q.name))) : (z(""), T("🤝"), u(""), H("pipeline"), L(""), C(`请执行以下任务：
任务描述：{任务描述}`), ae([]), D([])));
  }, [e, n]);
  const O = f(() => {
    if (B === "roundtable") {
      const Q = S.map((me) => ({
        agentName: me,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      ae(Q);
    } else if (B === "pipeline") {
      const Q = new Map(j.map((W) => [W.agentName, W])), me = S.map((W) => Q.get(W) || {
        agentName: W,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      ae(me);
    }
  }, [B, S, j]), v = (Q) => {
    S.includes(Q) || (D([...S, Q]), B === "coordinator" && !Y && L(Q));
  }, m = (Q) => {
    D(S.filter((me) => me !== Q)), ae(j.filter((me) => me.agentName !== Q)), Y === Q && L(S[0] || "");
  }, K = (Q, me, W) => {
    const oe = [...j];
    oe[Q] = { ...oe[Q], [me]: W }, ae(oe);
  }, re = () => {
    if (!R.trim()) {
      M.warning("请输入团队名称");
      return;
    }
    if (S.length < 2) {
      M.warning("至少需要选择 2 个成员");
      return;
    }
    if (!g.trim()) {
      M.warning("请输入任务模板");
      return;
    }
    if (B === "coordinator" && !Y) {
      M.warning("请选择协调者");
      return;
    }
    U(!0);
    try {
      const Q = S.map(
        (le) => {
          var pe;
          const V = r.find((de) => de.name === le);
          return {
            name: le,
            role: ((pe = V == null ? void 0 : V.description) == null ? void 0 : pe.slice(0, 30)) || "团队成员",
            emoji: ""
          };
        }
      );
      let me = j;
      (j.length === 0 || j.length !== S.length) && (me = S.map((le) => ({
        agentName: le,
        instruction: "请完成你的专业部分",
        passContext: B === "pipeline"
      })));
      const W = {
        id: (n == null ? void 0 : n.id) || `custom-${Date.now()}`,
        name: R.trim(),
        emoji: te,
        category: "自定义",
        description: x.trim() || `${R.trim()}（${S.length}人团队）`,
        mode: B,
        members: Q,
        coordinatorName: B === "coordinator" ? Y : void 0,
        taskTemplate: g.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: me,
        custom: !0,
        createdAt: (n == null ? void 0 : n.createdAt) || Date.now()
      }, oe = at(), se = oe.findIndex((le) => le.id === W.id);
      se >= 0 ? oe[se] = W : oe.push(W), Ft(oe), M.success(n ? "团队已更新" : "团队已创建"), a(), t();
    } catch (Q) {
      M.error(Q.message || "保存失败");
    } finally {
      U(!1);
    }
  }, he = r.filter(
    (Q) => !S.includes(Q.name)
  );
  return l.createElement(
    c,
    {
      open: e,
      onCancel: t,
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        l.createElement(
          "span",
          { style: { fontSize: 20 } },
          n ? "✏️" : "➕"
        ),
        l.createElement(
          "span",
          null,
          n ? "编辑专家团" : "创建专家团"
        )
      ),
      width: 720,
      onOk: re,
      okText: "保存团队",
      confirmLoading: X,
      okButtonProps: {
        icon: $ ? l.createElement($) : void 0
      }
    },
    // Step 1: Basic info
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        F,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 基本信息"
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        S.length > 0 ? l.createElement(St, {
          members: S,
          size: 36
        }) : null,
        l.createElement(d, {
          placeholder: "团队名称（如：储层评价团队）",
          value: R,
          onChange: (Q) => z(Q.target.value),
          style: { flex: 1 }
        })
      ),
      l.createElement(d.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: x,
        onChange: (Q) => u(Q.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        l.createElement(
          F,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式："
        ),
        l.createElement(b, {
          value: B,
          onChange: (Q) => H(Q),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" }
          ]
        })
      )
    ),
    l.createElement(q, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        F,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 选择团队成员"
      ),
      // Available agents
      he.length > 0 ? l.createElement(
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
          (Q) => l.createElement(
            k,
            {
              key: Q.id,
              size: "small",
              icon: Z ? l.createElement(Z) : void 0,
              onClick: () => v(Q.name)
            },
            Q.name
          )
        )
      ) : null,
      // Selected members
      S.length === 0 ? l.createElement(I, {
        description: "请从上方添加团队成员",
        image: I.PRESENTED_IMAGE_SIMPLE
      }) : l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...S.map(
          (Q) => l.createElement(
            "div",
            {
              key: Q,
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
            l.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 6 } },
              l.createElement(Le, { name: Q, size: 24 }),
              l.createElement(
                F,
                { strong: !0, style: { fontSize: 13 } },
                Q
              ),
              B === "coordinator" && Y === Q ? l.createElement(
                h,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            l.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              B === "coordinator" ? l.createElement(
                k,
                {
                  size: "small",
                  type: "link",
                  onClick: () => L(Q)
                },
                "设为协调者"
              ) : null,
              l.createElement(
                k,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: N ? l.createElement(N) : void 0,
                  onClick: () => m(Q)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    l.createElement(q, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    S.length > 0 ? l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        F,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${B === "roundtable" ? "（各步独立执行）" : B === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      l.createElement(
        k,
        {
          size: "small",
          type: "dashed",
          onClick: O,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      j.length === 0 ? l.createElement(
        F,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...j.map(
          (Q, me) => l.createElement(
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
            l.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6
                }
              },
              B === "pipeline" ? l.createElement(
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
              ) : l.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              l.createElement(
                h,
                { color: "blue", style: { fontSize: 11 } },
                Q.agentName
              ),
              l.createElement(
                "div",
                { style: { flex: 1 } },
                l.createElement(d, {
                  placeholder: "请输入该步骤的指令...",
                  value: Q.instruction,
                  onChange: (W) => K(me, "instruction", W.target.value),
                  size: "small"
                })
              )
            ),
            l.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  paddingLeft: 28
                }
              },
              l.createElement(p, {
                size: "small",
                checked: Q.passContext,
                onChange: (W) => K(me, "passContext", W)
              }),
              l.createElement(
                F,
                { type: "secondary", style: { fontSize: 11 } },
                Q.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    l.createElement(q, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    l.createElement(
      "div",
      null,
      l.createElement(
        F,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${S.length > 0 ? "4" : "3"}. 任务模板`
      ),
      l.createElement(d.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: g,
        onChange: (Q) => C(Q.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      l.createElement(
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
function It({
  team: e,
  agents: t,
  onLaunch: r,
  onEdit: n,
  onDelete: a
}) {
  var x;
  const l = E().React, { useState: o } = l, { Card: i, Tag: f, Typography: c, Button: d, Tooltip: k } = E().antd, {
    TeamOutlined: b,
    RocketOutlined: h,
    UserOutlined: P,
    EditOutlined: p,
    DeleteOutlined: I,
    DownOutlined: M,
    UpOutlined: q
  } = E().antdIcons || {}, { Text: w, Paragraph: Z } = c, [N, $] = o(!1), G = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, F = G[e.mode] || G.coordinator, y = e.members.map((u) => {
    const B = rt(t, u.name);
    return { ...u, found: !!B, agentId: B };
  }), R = y.filter((u) => u.found).length, z = R === e.members.length, te = e.coordinatorName || ((x = e.members[0]) == null ? void 0 : x.name), T = te ? rt(t, te) : null;
  return l.createElement(
    i,
    {
      hoverable: !0,
      size: "small",
      style: { height: "100%", display: "flex", flexDirection: "column" }
    },
    // Header: emoji + name + mode tag + custom badge
    l.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10
        }
      },
      l.createElement(St, {
        members: e.members.map((u) => u.name),
        size: 36
      }),
      l.createElement(
        "div",
        { style: { flex: 1 } },
        l.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          l.createElement(
            w,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? l.createElement(
            f,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        l.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          l.createElement(
            f,
            { color: F.color, style: { fontSize: 10 } },
            F.label
          ),
          l.createElement(
            f,
            { style: { fontSize: 10 } },
            `${R}/${e.members.length}`
          ),
          z ? null : l.createElement(
            f,
            { color: "orange", style: { fontSize: 10 } },
            "缺少成员"
          )
        )
      ),
      // Edit/delete for custom teams
      e.custom ? l.createElement(
        "div",
        { style: { display: "flex", gap: 2 } },
        n ? l.createElement(
          k,
          { title: "编辑" },
          l.createElement(d, {
            type: "text",
            size: "small",
            icon: p ? l.createElement(p) : void 0,
            onClick: (u) => {
              u.stopPropagation(), n(e);
            }
          })
        ) : null,
        a ? l.createElement(
          k,
          { title: "删除" },
          l.createElement(d, {
            type: "text",
            size: "small",
            danger: !0,
            icon: I ? l.createElement(I) : void 0,
            onClick: (u) => {
              u.stopPropagation(), a(e);
            }
          })
        ) : null
      ) : null
    ),
    // Description
    l.createElement(
      Z,
      {
        type: "secondary",
        style: { fontSize: 12, margin: 0, marginBottom: 10, lineHeight: 1.5 },
        ellipsis: { rows: 2 }
      },
      e.description
    ),
    // Member avatars
    l.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 6,
          marginBottom: 10,
          flexWrap: "wrap"
        }
      },
      ...y.map(
        (u) => l.createElement(
          k,
          {
            key: u.name,
            title: `${u.name}（${u.role}）${u.found ? "" : " - 未创建"}`
          },
          l.createElement(
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
            l.createElement(Le, { name: u.name, size: 18 }),
            l.createElement(
              w,
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
    l.createElement(
      d,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (u) => {
          u.stopPropagation(), $(!N);
        },
        icon: N ? q ? l.createElement(q) : "▲" : M ? l.createElement(M) : "▼"
      },
      N ? "收起流程" : "查看执行流程"
    ),
    N ? l.createElement(An, { team: e }) : null,
    // Footer: launch button
    l.createElement(
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
      l.createElement(
        w,
        { type: "secondary", style: { fontSize: 11 } },
        te ? `协调者: ${te}` : ""
      ),
      l.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: h ? l.createElement(h) : void 0,
          disabled: !T,
          onClick: () => r(e),
          style: Me
        },
        "发起团队任务"
      )
    )
  );
}
function $n({
  agents: e,
  onLaunch: t
}) {
  const r = E().React, { useMemo: n, useState: a, useCallback: l, useEffect: o } = r, {
    Row: i,
    Col: f,
    Input: c,
    Empty: d,
    Typography: k,
    Tag: b,
    Button: h,
    Divider: P,
    message: p,
    Popconfirm: I
  } = E().antd, { SearchOutlined: M, TeamOutlined: q, PlusOutlined: w, RocketOutlined: Z } = E().antdIcons || {}, { Text: N } = k, [$, G] = a(""), [F, y] = a([]), [R, z] = a(!1), [te, T] = a(null);
  o(() => {
    y(at());
  }, []);
  const x = l(() => {
    y(at());
  }, []), u = l(
    (j) => {
      const S = at().filter((D) => D.id !== j.id);
      Ft(S), y(S), p.success(`团队「${j.name}」已删除`);
    },
    [p]
  ), B = l((j) => {
    T(j), z(!0);
  }, []), H = l(() => {
    T(null), z(!0);
  }, []), Y = n(() => [...F, ...Pn], [F]), L = n(() => {
    if (!$.trim()) return Y;
    const j = $.toLowerCase();
    return Y.filter(
      (ae) => ae.name.toLowerCase().includes(j) || ae.description.toLowerCase().includes(j) || ae.category.toLowerCase().includes(j)
    );
  }, [Y, $]), g = L.filter((j) => j.custom), C = L.filter((j) => !j.custom);
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
        N,
        { style: { fontSize: 13, color: "#389e0d" } },
        "多智能体协同 — 选择预设团队或创建自定义团队，支持流水线、圆桌讨论、协调者三种编排模式。"
      ),
      r.createElement(
        h,
        {
          type: "primary",
          size: "small",
          icon: w ? r.createElement(w) : void 0,
          onClick: H,
          style: Me
        },
        "创建专家团"
      )
    ),
    // Search
    r.createElement(c, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: M ? r.createElement(M) : void 0,
      value: $,
      onChange: (j) => G(j.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Custom teams section
    g.length > 0 ? r.createElement(
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
          N,
          { strong: !0, style: { fontSize: 14 } },
          `自定义团队 (${g.length})`
        )
      ),
      r.createElement(
        i,
        { gutter: [12, 12] },
        ...g.map(
          (j) => r.createElement(
            f,
            { key: j.id, xs: 24, sm: 12, md: 8 },
            r.createElement(It, {
              team: j,
              agents: e,
              onLaunch: t,
              onEdit: B,
              onDelete: u
            })
          )
        )
      ),
      r.createElement(P, { style: { margin: "16px 0" } })
    ) : null,
    // Preset teams section
    C.length > 0 ? r.createElement(
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
          N,
          { strong: !0, style: { fontSize: 14 } },
          `预设团队 (${C.length})`
        ),
        r.createElement(
          N,
          { type: "secondary", style: { fontSize: 12 } },
          "· 行业典型工作流模板"
        )
      ),
      r.createElement(
        i,
        { gutter: [12, 12] },
        ...C.map(
          (j) => r.createElement(
            f,
            { key: j.id, xs: 24, sm: 12, md: 8 },
            r.createElement(It, {
              team: j,
              agents: e,
              onLaunch: t
            })
          )
        )
      )
    ) : null,
    // Empty state
    L.length === 0 ? r.createElement(d, {
      description: "未找到匹配的专家团队，点击「创建专家团」自定义",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : null,
    // Team Builder Modal
    r.createElement(Mn, {
      open: R,
      onClose: () => {
        z(!1), T(null);
      },
      agents: e,
      editingTeam: te,
      onSaved: x
    })
  );
}
function Gt(e) {
  var r;
  const t = [];
  for (const n of e) {
    if (n.enabled === !1) continue;
    const a = (r = n.description) == null ? void 0 : r.trim();
    if (!a) continue;
    const l = (n.name || a).length > 20 ? (n.name || a).substring(0, 18) + "…" : n.name || a;
    let o = a;
    if (o = o.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(o) ? o = `请${o}` : /^(a |an |the )/i.test(o) ? o = `Help me with ${o}` : /[。？！.?!]$/.test(o) || (o = `帮我${o}`), o.length > 80 && (o = o.substring(0, 77) + "..."), t.push({ label: l, value: o }), t.length >= 4) break;
  }
  return t;
}
async function Rn(e) {
  return await ne("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function ot(e, t, r) {
  await ne(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: r })
  });
}
async function zt(e, t) {
  const r = await st(e);
  r.system_prompt_files = t, await ne(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(r)
  });
}
async function Ht(e, t) {
  await ne("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: t,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function Ln(e, t) {
  await ne(`/skills/${encodeURIComponent(t)}/enable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Wt(e, t) {
  await ne(`/skills/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Bn(e, t) {
  return ne("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function jn(e, t) {
  return ne("/skills/batch-disable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Nn(e, t) {
  return ne("/skills/batch-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function bt(e) {
  return await ne("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Jt(e, t) {
  await ne(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Kt(e, t) {
  return ne("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Dn(e, t) {
  return ne(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Un(e, t) {
  await ne(`/skills/${encodeURIComponent(t)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
function Fn(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const r = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!r) return { number: 6, unit: "h" };
  const n = parseInt(r[1] || "0", 10), a = parseInt(r[2] || "0", 10), l = parseInt(r[3] || "0", 10), o = n * 60 + a + Math.round(l / 60);
  return o <= 0 ? { number: 6, unit: "h" } : o >= 60 && o % 60 === 0 ? { number: o / 60, unit: "h" } : { number: o, unit: "m" };
}
function Gn(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function Hn(e) {
  return ne("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function Wn(e, t) {
  return ne("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Jn(e) {
  await ne("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Kn(e) {
  return ne("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function Xn(e, t) {
  return ne("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function qn(e) {
  return (await ne("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function Vn(e, t) {
  await ne("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function Yn() {
  return (await ne("/config/user-timezone")).timezone || "UTC";
}
async function Qn(e) {
  await ne("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function Zn(e) {
  return await ne("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const Pt = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function ct({
  title: e,
  subtitle: t,
  extra: r
}) {
  const n = E().React, { Space: a } = E().antd;
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
    r ? n.createElement(a, null, r) : null
  );
}
function _t({
  items: e,
  max: t = 5,
  color: r = "blue",
  emptyText: n = "无"
}) {
  const a = E().React, { Tag: l } = E().antd;
  return !e || e.length === 0 ? a.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    n
  ) : a.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (o, i) => a.createElement(
        l,
        { key: i, color: r, style: { fontSize: 11, marginRight: 0 } },
        o
      )
    ),
    e.length > t ? a.createElement(
      l,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function Xt({
  open: e,
  onClose: t,
  poolSkills: r,
  installedSkillNames: n,
  loading: a,
  onInstall: l
}) {
  const o = E().React, { useState: i, useEffect: f, useMemo: c } = o, { Modal: d, Button: k, Empty: b, Spin: h, Input: P, Tag: p, Tooltip: I, Typography: M } = E().antd, { CheckOutlined: q, SearchOutlined: w } = E().antdIcons || {}, { Text: Z } = M, [N, $] = i([]), [G, F] = i("");
  f(() => {
    e && ($([]), F(""));
  }, [e]);
  const y = c(() => {
    if (!G.trim()) return r;
    const T = G.toLowerCase();
    return r.filter(
      (x) => {
        var u, B;
        return x.name.toLowerCase().includes(T) || ((u = x.description) == null ? void 0 : u.toLowerCase().includes(T)) || ((B = x.tags) == null ? void 0 : B.some((H) => H.toLowerCase().includes(T)));
      }
    );
  }, [r, G]), R = y.filter(
    (T) => !n.includes(T.name)
  ), z = (T) => {
    $(
      (x) => x.includes(T) ? x.filter((u) => u !== T) : [...x, T]
    );
  }, te = async () => {
    N.length !== 0 && (await l(N), $([]));
  };
  return o.createElement(
    d,
    {
      open: e,
      onCancel: t,
      title: "从技能池选择技能",
      width: 680,
      footer: o.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }
        },
        o.createElement(
          Z,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${N.length} 个技能`
        ),
        o.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          o.createElement(k, { onClick: t }, "取消"),
          o.createElement(
            k,
            {
              type: "primary",
              onClick: te,
              disabled: N.length === 0
            },
            N.length > 0 ? `添加 (${N.length})` : "添加"
          )
        )
      )
    },
    // Search + bulk actions bar
    o.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 8,
          alignItems: "center"
        }
      },
      o.createElement(P, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: w ? o.createElement(w) : void 0,
        value: G,
        onChange: (T) => F(T.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      o.createElement(
        k,
        {
          size: "small",
          type: "primary",
          onClick: () => $(R.map((T) => T.name))
        },
        "全选"
      ),
      o.createElement(
        k,
        {
          size: "small",
          onClick: () => $([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    a ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      o.createElement(h, { size: "large" })
    ) : y.length === 0 ? o.createElement(b, {
      description: G ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: b.PRESENTED_IMAGE_SIMPLE
    }) : o.createElement(
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
      ...y.map((T) => {
        const x = N.includes(T.name), u = n.includes(T.name);
        return o.createElement(
          "div",
          {
            key: T.name,
            onClick: () => !u && z(T.name),
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
          x ? o.createElement(
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
            q ? o.createElement(q) : "✓"
          ) : null,
          u ? o.createElement(
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
          o.createElement(
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
            o.createElement(
              "span",
              { style: { fontSize: 16 } },
              T.emoji || "⚡"
            ),
            o.createElement(
              I,
              { title: T.name },
              o.createElement(
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
                T.name
              )
            )
          ),
          T.description ? o.createElement(
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
            T.description
          ) : null,
          T.tags && T.tags.length > 0 ? o.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...T.tags.slice(0, 2).map(
              (B, H) => o.createElement(
                p,
                {
                  key: H,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                B
              )
            )
          ) : null
        );
      })
    )
  );
}
const Xe = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  gap: 4
}, qt = { marginBottom: 16 }, Vt = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16
}, De = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(0,0,0,0.85)",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid #f0f0f0"
}, Yt = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function el({ agentId: e }) {
  const t = E().React, { useState: r, useEffect: n, useCallback: a } = t, {
    Switch: l,
    InputNumber: o,
    Select: i,
    Button: f,
    Spin: c,
    Space: d,
    Typography: k,
    message: b
  } = E().antd, { PlayCircleOutlined: h, SaveOutlined: P } = E().antdIcons || {}, { Text: p } = k, [I, M] = r(!0), [q, w] = r(!1), [Z, N] = r(!1), [$, G] = r(!1), [F, y] = r(6), [R, z] = r("h"), [te, T] = r("main"), [x, u] = r(300), [B, H] = r(!1), [Y, L] = r("08:00"), [g, C] = r("22:00"), j = a(async () => {
    var O, v;
    M(!0);
    try {
      const m = await Hn(e), K = Fn(m.every ?? "6h");
      G(m.enabled ?? !1), y(K.number), z(K.unit), T(m.target ?? "main"), u(m.timeoutSeconds ?? 300), H(!!m.activeHours), L(((O = m.activeHours) == null ? void 0 : O.start) ?? "08:00"), C(((v = m.activeHours) == null ? void 0 : v.end) ?? "22:00");
    } catch (m) {
      b.error(m.message || "加载心跳配置失败");
    } finally {
      M(!1);
    }
  }, [e]);
  n(() => {
    j();
  }, [j]);
  const ae = async () => {
    w(!0);
    try {
      await Wn(e, {
        enabled: $,
        every: Gn({ number: F, unit: R }),
        target: te,
        timeoutSeconds: x,
        activeHours: B && Y && g ? { start: Y, end: g } : void 0
      }), b.success("心跳配置已保存");
    } catch (O) {
      b.error(O.message || "保存心跳配置失败");
    } finally {
      w(!1);
    }
  }, S = async () => {
    N(!0);
    try {
      await Jn(e), b.success("已触发心跳检查");
    } catch (O) {
      b.error(O.message || "触发心跳失败");
    } finally {
      N(!1);
    }
  };
  if (I)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(c, { size: "large" })
    );
  const D = (O, v, m) => t.createElement(
    "div",
    { style: qt },
    t.createElement("div", { style: Xe }, O),
    v,
    m ? t.createElement(
      p,
      { type: "secondary", style: Yt },
      m
    ) : null
  ), X = (O, v, m, K) => t.createElement(
    "div",
    { style: Vt },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Xe }, O),
      v
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Xe }, m),
      K
    )
  ), { Divider: U } = E().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: De }, "基本设置"),
    D(
      "启用心跳",
      t.createElement(l, {
        checked: $,
        onChange: (O) => G(O)
      }),
      $ ? "已启用，专家将定期自检" : "已停用"
    ),
    X(
      "检查频率",
      t.createElement(
        d,
        null,
        t.createElement(o, {
          min: 1,
          value: F,
          onChange: (O) => y(O ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(i, {
          value: R,
          onChange: (O) => z(O),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(i, {
        value: te,
        onChange: (O) => T(O),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    D(
      "超时时间 (秒)",
      t.createElement(o, {
        min: 1,
        max: 3600,
        value: x,
        onChange: (O) => u(O ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(U, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "活跃时段"),
    D(
      "启用活跃时段限制",
      t.createElement(l, {
        checked: B,
        onChange: (O) => H(O)
      }),
      "仅在指定时段内触发心跳"
    ),
    B ? X(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: Y,
        onChange: (O) => L(O.target.value),
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
        onChange: (O) => C(O.target.value),
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
        f,
        {
          type: "primary",
          icon: P ? t.createElement(P) : void 0,
          loading: q,
          onClick: ae,
          style: Me
        },
        "保存配置"
      ),
      t.createElement(
        f,
        {
          icon: h ? t.createElement(h) : void 0,
          loading: Z,
          onClick: S
        },
        "立即执行"
      )
    )
  );
}
function tl({
  agentId: e,
  onRefresh: t
}) {
  const r = E().React, { useState: n, useEffect: a, useCallback: l } = r, {
    List: o,
    Tag: i,
    Switch: f,
    Button: c,
    Empty: d,
    Spin: k,
    Typography: b,
    message: h
  } = E().antd, { PlusOutlined: P, ReloadOutlined: p, DeleteOutlined: I } = E().antdIcons || {}, { Text: M, Paragraph: q } = b, [w, Z] = n([]), [N, $] = n(!0), [G, F] = n(!1), [y, R] = n([]), [z, te] = n(!1), T = l(async () => {
    $(!0);
    try {
      const L = await it(e);
      Z(L);
    } catch (L) {
      h.error(L.message || "加载技能失败"), Z([]);
    } finally {
      $(!1);
    }
  }, [e]);
  a(() => {
    T();
  }, [T]);
  const x = async () => {
    F(!0), te(!0);
    try {
      const L = await ht(!0);
      R(L);
    } catch (L) {
      h.error(L.message || "加载技能池失败");
    } finally {
      te(!1);
    }
  }, u = async (L) => {
    let g = 0, C = 0;
    for (const j of L)
      try {
        await Ht(e, j), g++;
      } catch {
        C++;
      }
    g > 0 ? (h.success(
      `成功添加 ${g} 个技能${C > 0 ? `，${C} 个失败` : ""}`
    ), T(), t()) : C > 0 && h.error("添加技能失败"), F(!1);
  }, B = async (L, g) => {
    try {
      g ? await Ln(e, L.name) : await Un(e, L.name), h.success(g ? "已启用" : "已停用"), T(), t();
    } catch (C) {
      h.error(C.message || "操作失败");
    }
  }, H = async (L) => {
    try {
      await Wt(e, L), h.success(`技能「${L}」已移除`), T(), t();
    } catch (g) {
      h.error(g.message || "移除技能失败");
    }
  };
  if (N)
    return r.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      r.createElement(k, { size: "large" })
    );
  const Y = w.filter((L) => L.enabled !== !1);
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
        M,
        { strong: !0 },
        `技能列表 (${w.length}，已启用 ${Y.length})`
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          c,
          {
            size: "small",
            icon: p ? r.createElement(p) : void 0,
            onClick: T
          },
          "刷新"
        ),
        r.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: P ? r.createElement(P) : void 0,
            onClick: x,
            style: Me
          },
          "从技能池添加"
        )
      )
    ),
    w.length === 0 ? r.createElement(d, {
      description: "该专家暂无技能",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(o, {
      dataSource: w,
      renderItem: (L) => r.createElement(
        o.Item,
        {
          actions: [
            r.createElement(f, {
              key: "toggle",
              size: "small",
              checked: L.enabled !== !1,
              onChange: (g) => B(L, g)
            }),
            r.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: I ? r.createElement(I) : void 0,
                onClick: () => H(L.name)
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
            L.emoji ? r.createElement(
              "span",
              { style: { fontSize: 16 } },
              L.emoji
            ) : null,
            r.createElement(M, { strong: !0 }, L.name),
            L.version_text ? r.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${L.version_text}`
            ) : null
          ),
          L.description ? r.createElement(
            q,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            L.description
          ) : null
        )
      )
    }),
    r.createElement(Xt, {
      open: G,
      onClose: () => F(!1),
      poolSkills: y,
      installedSkillNames: w.map((L) => L.name),
      loading: z,
      onInstall: u
    })
  );
}
function nl({
  agentId: e,
  onRefresh: t,
  isActive: r
}) {
  const n = E().React, { useState: a, useEffect: l, useCallback: o } = n, {
    List: i,
    Tag: f,
    Button: c,
    Empty: d,
    Spin: k,
    Modal: b,
    Input: h,
    Typography: P,
    message: p
  } = E().antd, { PlusOutlined: I, ReloadOutlined: M, DeleteOutlined: q } = E().antdIcons || {}, { Text: w, Paragraph: Z } = P, { TextArea: N } = h, [$, G] = a([]), [F, y] = a(!0), [R, z] = a(!1), [te, T] = a(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [x, u] = a(!1), B = o(async () => {
    y(!0);
    try {
      const g = await bt(e);
      G(g);
    } catch (g) {
      p.error(g.message || "加载 MCP 失败"), G([]);
    } finally {
      y(!1);
    }
  }, [e]);
  l(() => {
    B();
  }, [B]), l(() => {
    r && B();
  }, [r, B]);
  const H = async (g) => {
    try {
      await Dn(e, g), p.success("已切换 MCP 状态"), B(), t();
    } catch (C) {
      p.error(C.message || "切换失败");
    }
  }, Y = async (g) => {
    try {
      await Jt(e, g), p.success(`MCP「${g}」已移除`), B(), t();
    } catch (C) {
      p.error(C.message || "移除 MCP 失败");
    }
  }, L = async () => {
    u(!0);
    try {
      const g = JSON.parse(te), C = g.mcpServers || g, j = Object.entries(C);
      if (j.length === 0) {
        p.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [ae, S] of j) {
        const D = S, X = D.url ? "streamable_http" : "stdio";
        await Kt(e, {
          client_key: ae,
          client: {
            name: D.name || ae,
            description: D.description || "",
            enabled: !0,
            transport: X,
            url: D.url || "",
            command: D.command || "",
            args: D.args || [],
            env: D.env || {},
            cwd: D.cwd || "",
            headers: D.headers || {}
          }
        });
      }
      p.success("MCP 客户端已创建"), z(!1), B(), t();
    } catch (g) {
      g instanceof SyntaxError ? p.error("JSON 格式错误：" + g.message) : p.error(g.message || "创建 MCP 失败");
    } finally {
      u(!1);
    }
  };
  return F ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(k, { size: "large" })
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
      n.createElement(w, { strong: !0 }, `MCP 客户端 (${$.length})`),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          c,
          {
            size: "small",
            icon: M ? n.createElement(M) : void 0,
            onClick: B
          },
          "刷新"
        ),
        n.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: I ? n.createElement(I) : void 0,
            onClick: () => z(!0),
            style: Me
          },
          "添加 MCP"
        )
      )
    ),
    $.length === 0 ? n.createElement(d, {
      description: "该专家暂无 MCP 客户端",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(i, {
      dataSource: $,
      renderItem: (g) => n.createElement(
        i.Item,
        {
          actions: [
            n.createElement(
              c,
              {
                key: "toggle",
                size: "small",
                onClick: () => H(g.key)
              },
              g.enabled ? "停用" : "启用"
            ),
            n.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: q ? n.createElement(q) : void 0,
                onClick: () => Y(g.key)
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
            n.createElement(w, { strong: !0 }, g.name || g.key),
            n.createElement(
              f,
              {
                color: g.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              g.enabled ? "启用" : "停用"
            ),
            n.createElement(
              f,
              { color: "purple", style: { fontSize: 10 } },
              g.transport
            )
          ),
          g.description ? n.createElement(
            Z,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            g.description
          ) : null,
          g.tools && g.tools.length > 0 ? n.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "#8c8c8c" } },
            `提供 ${g.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    n.createElement(
      b,
      {
        open: R,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => z(!1),
        onOk: L,
        confirmLoading: x,
        okText: "创建",
        width: 560
      },
      n.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      n.createElement(N, {
        value: te,
        onChange: (g) => T(g.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function ll({ agentId: e }) {
  const t = E().React, { useState: r, useEffect: n, useCallback: a, useRef: l } = t, {
    Card: o,
    InputNumber: i,
    Input: f,
    Select: c,
    Switch: d,
    Button: k,
    Spin: b,
    Space: h,
    Typography: P,
    Divider: p,
    message: I
  } = E().antd, { SaveOutlined: M } = E().antdIcons || {}, { Text: q } = P, [w, Z] = r(!0), [N, $] = r(!1), G = l(null), [F, y] = r(60), [R, z] = r(""), [te, T] = r(!0), [x, u] = r(30), [B, H] = r("zh"), [Y, L] = r("UTC"), [g, C] = r(!0), [j, ae] = r(100), [S, D] = r(!0), [X, U] = r(3), [O, v] = r(1), [m, K] = r(!0), [re, he] = r(3), [Q, me] = r(2), [W, oe] = r(60), [se, le] = r(1), [V, pe] = r(0), [de, ze] = r(1), [Te, _] = r(0), [ie, ge] = r(30), [we, Se] = r(50), [Ce, $e] = r("light"), [Ue, Oe] = r("scroll"), [Fe, Ge] = r("remelight"), [Be, Re] = r("AUTO"), je = a(async () => {
    var A, ke, xe, be, Ie, We;
    Z(!0);
    try {
      const [ye, mt, Ye] = await Promise.all([
        Kn(e),
        qn(e).catch(() => "zh"),
        Yn().catch(() => "UTC")
      ]);
      G.current = ye, y(ye.shell_command_timeout ?? 60), z(ye.shell_command_executable ?? "");
      const Qe = ye.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      T(Qe.enabled ?? !0), u(Qe.timeout_seconds ?? 30), H(mt), L(Ye);
      const Ne = ye.loop ?? {};
      C(((A = Ne.iteration) == null ? void 0 : A.enabled) ?? !0), ae(((ke = Ne.iteration) == null ? void 0 : ke.max_iterations) ?? ye.max_iters ?? 100), D(((xe = Ne.doom_loop) == null ? void 0 : xe.enabled) ?? !0), U(((be = Ne.doom_loop) == null ? void 0 : be.window_size) ?? 3), v(((Ie = Ne.doom_loop) == null ? void 0 : Ie.similarity_threshold) ?? 1), K(ye.llm_retry_enabled ?? !0), he(ye.llm_max_retries ?? 3), me(ye.llm_backoff_base ?? 2), oe(ye.llm_backoff_cap ?? 60), le(ye.llm_max_concurrent ?? 1), pe(ye.llm_max_qpm ?? 0), ze(ye.llm_rate_limit_pause ?? 1), _(ye.llm_rate_limit_jitter ?? 0), ge(ye.llm_acquire_timeout ?? 30), Se(ye.history_max_length ?? 50), $e(ye.context_manager_backend ?? "light"), Oe(((We = ye.light_context_config) == null ? void 0 : We.strategy) ?? "scroll"), Ge(ye.memory_manager_backend ?? "remelight"), Re(ye.approval_level ?? "AUTO");
    } catch (ye) {
      I.error(ye.message || "加载运行配置失败");
    } finally {
      Z(!1);
    }
  }, [e]);
  n(() => {
    je();
  }, [je]);
  const He = async () => {
    var ke, xe;
    const A = G.current;
    if (A) {
      $(!0);
      try {
        const be = {
          ...A,
          max_iters: j,
          loop: {
            ...A.loop ?? {},
            iteration: { enabled: g, max_iterations: j },
            doom_loop: {
              enabled: S,
              window_size: X,
              similarity_threshold: O,
              stages: ((xe = (ke = A.loop) == null ? void 0 : ke.doom_loop) == null ? void 0 : xe.stages) ?? []
            }
          },
          shell_command_timeout: F,
          shell_command_executable: R,
          auto_title_config: {
            enabled: te,
            timeout_seconds: x
          },
          llm_retry_enabled: m,
          llm_max_retries: re,
          llm_backoff_base: Q,
          llm_backoff_cap: W,
          llm_max_concurrent: se,
          llm_max_qpm: V,
          llm_rate_limit_pause: de,
          llm_rate_limit_jitter: Te,
          llm_acquire_timeout: ie,
          history_max_length: we,
          context_manager_backend: Ce,
          light_context_config: {
            ...A.light_context_config ?? {},
            strategy: Ue
          },
          memory_manager_backend: Fe,
          approval_level: Be
        };
        await Xn(e, be), G.current = be, B && await Vn(e, B).catch(() => {
        }), Y && await Qn(Y).catch(() => {
        }), I.success("运行配置已保存");
      } catch (be) {
        I.error(be.message || "保存运行配置失败");
      } finally {
        $(!1);
      }
    }
  };
  if (w)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(b, { size: "large" })
    );
  const ee = (A, ke, xe) => t.createElement(
    "div",
    { style: qt },
    t.createElement("div", { style: Xe }, A),
    ke,
    xe ? t.createElement(
      q,
      { type: "secondary", style: Yt },
      xe
    ) : null
  ), ce = (A, ke, xe, be) => t.createElement(
    "div",
    { style: Vt },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Xe }, A),
      ke
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Xe }, xe),
      be
    )
  );
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    t.createElement(
      "div",
      { style: De },
      "基础设置"
    ),
    ce(
      "Shell 命令超时 (秒)",
      t.createElement(i, {
        min: 1,
        value: F,
        onChange: (A) => y(A ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(f, {
        value: R,
        onChange: (A) => z(A.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    ce(
      "语言",
      t.createElement(c, {
        value: B,
        onChange: (A) => H(A),
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
        value: Y,
        onChange: (A) => L(A),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (A, ke) => {
          var xe;
          return (((xe = ke == null ? void 0 : ke.label) == null ? void 0 : xe.toString()) || "").toLowerCase().includes(A.toLowerCase());
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
        ].map((A) => ({ value: A, label: A }))
      })
    ),
    ce(
      "自动生成会话标题",
      t.createElement(h, null, t.createElement(d, {
        checked: te,
        onChange: (A) => T(A)
      })),
      "标题生成超时 (秒)",
      t.createElement(i, {
        min: 5,
        value: x,
        onChange: (A) => u(A ?? 30),
        style: { width: "100%" },
        disabled: !te
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(p, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "审批级别"),
    ee(
      "工具执行审批",
      t.createElement(c, {
        value: Be,
        onChange: (A) => Re(A),
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
    t.createElement("div", { style: De }, "迭代与循环"),
    ee(
      "启用迭代限制",
      t.createElement(d, {
        checked: g,
        onChange: (A) => C(A)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    g ? ee(
      "最大迭代次数",
      t.createElement(i, {
        min: 1,
        max: 500,
        value: j,
        onChange: (A) => ae(A ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    ee(
      "启用重复循环保护",
      t.createElement(d, {
        checked: S,
        onChange: (A) => D(A)
      }),
      "检测并阻止重复操作循环"
    ),
    S ? ce(
      "检测窗口大小",
      t.createElement(i, {
        min: 2,
        max: 20,
        value: X,
        onChange: (A) => U(A ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(i, {
        min: 0,
        max: 1,
        step: 0.05,
        value: O,
        onChange: (A) => v(A ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(p, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "LLM 重试"),
    ee(
      "启用 LLM 重试",
      t.createElement(d, {
        checked: m,
        onChange: (A) => K(A)
      })
    ),
    ce(
      "最大重试次数",
      t.createElement(i, {
        min: 1,
        value: re,
        onChange: (A) => he(A ?? 3),
        style: { width: "100%" },
        disabled: !m
      }),
      "退避基数 (秒)",
      t.createElement(i, {
        min: 0.1,
        step: 0.1,
        value: Q,
        onChange: (A) => me(A ?? 2),
        style: { width: "100%" },
        disabled: !m
      })
    ),
    ee(
      "退避上限 (秒)",
      t.createElement(i, {
        min: 0.5,
        step: 0.5,
        value: W,
        onChange: (A) => oe(A ?? 60),
        style: { width: 200 },
        disabled: !m
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(p, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "LLM 限流"),
    ce(
      "最大并发数",
      t.createElement(i, {
        min: 1,
        value: se,
        onChange: (A) => le(A ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(i, {
        min: 0,
        step: 10,
        value: V,
        onChange: (A) => pe(A ?? 0),
        style: { width: "100%" }
      })
    ),
    ce(
      "限流暂停时间 (秒)",
      t.createElement(i, {
        min: 1,
        step: 0.5,
        value: de,
        onChange: (A) => ze(A ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(i, {
        min: 0,
        step: 0.5,
        value: Te,
        onChange: (A) => _(A ?? 0),
        style: { width: "100%" }
      })
    ),
    ee(
      "获取超时 (秒)",
      t.createElement(i, {
        min: 10,
        step: 10,
        value: ie,
        onChange: (A) => ge(A ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(p, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "上下文与记忆"),
    ce(
      "上下文管理后端",
      t.createElement(c, {
        value: Ce,
        onChange: (A) => $e(A),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(c, {
        value: Ue,
        onChange: (A) => Oe(A),
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
        onChange: (A) => Ge(A),
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
        onChange: (A) => Se(A ?? 50),
        style: { width: "100%" }
      })
    ),
    // ── Save button ──
    t.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      t.createElement(
        k,
        {
          type: "primary",
          icon: M ? t.createElement(M) : void 0,
          loading: N,
          onClick: He,
          style: Me
        },
        "保存运行配置"
      )
    )
  );
}
function al({
  expert: e,
  open: t,
  onClose: r,
  onRefresh: n
}) {
  const a = E().React, { useState: l, useEffect: o, useCallback: i } = a, { Modal: f, Tabs: c, Spin: d, Typography: k } = E().antd, { SettingOutlined: b } = E().antdIcons || {}, { Text: h } = k, [P, p] = l([]), [I, M] = l(!1), [q, w] = l("heartbeat"), Z = i(async () => {
    if (e) {
      M(!0);
      try {
        const F = await Zn(e.agent.id);
        p(F);
      } catch {
        p([]);
      } finally {
        M(!1);
      }
    }
  }, [e]);
  if (o(() => {
    t && e && Z();
  }, [t, e, Z]), !e) return null;
  const { agent: N } = e, $ = () => {
    Z(), n();
  }, G = [
    {
      key: "heartbeat",
      label: "心跳",
      children: a.createElement(el, {
        agentId: N.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: I ? a.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        a.createElement(d, { size: "large" })
      ) : a.createElement(Qt, {
        agentId: N.id,
        systemPromptFiles: P,
        onRefresh: $
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((F) => F.enabled !== !1).length})`,
      children: a.createElement(tl, {
        agentId: N.id,
        onRefresh: n
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: a.createElement(nl, {
        agentId: N.id,
        onRefresh: n,
        isActive: q === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: a.createElement(ll, {
        agentId: N.id
      })
    }
  ];
  return a.createElement(
    f,
    {
      open: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        b ? a.createElement(b, { style: { fontSize: 18 } }) : null,
        a.createElement("span", null, `配置 - ${N.name}`),
        a.createElement(
          h,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          N.id
        )
      ),
      onCancel: r,
      footer: null,
      width: 800,
      centered: !0,
      styles: {
        body: {
          minHeight: 400,
          maxHeight: "70vh",
          overflowY: "auto"
        }
      }
    },
    a.createElement(c, {
      items: G,
      activeKey: q,
      onChange: (F) => w(F),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
function rl({
  expert: e,
  onClick: t,
  onSummon: r,
  onConfigure: n
}) {
  const a = E().React, { Card: l, Tag: o, Badge: i, Typography: f, Spin: c, Button: d, Tooltip: k } = E().antd, { Text: b } = f, { ThunderboltOutlined: h, SettingOutlined: P } = E().antdIcons || {}, { agent: p, skills: I, mcps: M, loading: q } = e, w = p.enabled, Z = I.filter((G) => G.enabled !== !1).map((G) => G.name), N = M.map((G) => G.name || G.key), $ = p.active_model ? `${p.active_model.provider_id}/${p.active_model.model}` : null;
  return a.createElement(
    l,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: w ? void 0 : "#d9d9d9",
        opacity: w ? 1 : 0.7,
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
        a.createElement(Le, { name: p.name, size: 36 }),
        a.createElement(
          "div",
          null,
          a.createElement(
            b,
            { strong: !0, style: { fontSize: 15 } },
            p.name
          ),
          a.createElement(
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
      a.createElement(i, {
        status: w ? "success" : "default",
        text: w ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    p.description ? a.createElement(
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
      vt(p.description, a)
    ) : a.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    $ ? a.createElement(
      "div",
      { style: { marginBottom: 8 } },
      a.createElement(
        o,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${$}`
      )
    ) : null,
    // Skills
    q ? a.createElement(c, { size: "small" }) : a.createElement(
      "div",
      { style: { marginBottom: 6 } },
      a.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${Z.length})`
      ),
      a.createElement(_t, {
        items: Z,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !q && N.length > 0 ? a.createElement(
      "div",
      { style: { marginTop: "auto" } },
      a.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${N.length})`
      ),
      a.createElement(_t, {
        items: N,
        max: 3,
        color: "purple"
      })
    ) : null,
    // Bottom bar: gear icon (left) + summon button (right)
    a.createElement(
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
      a.createElement(
        k,
        { title: "配置专家", placement: "top" },
        a.createElement(
          d,
          {
            type: "text",
            size: "small",
            icon: P ? a.createElement(P, {
              style: { fontSize: 16, color: "#8c8c8c" }
            }) : void 0,
            onClick: (G) => {
              G.stopPropagation(), n && n();
            }
          }
        )
      ),
      // Summon button (bottom-right)
      a.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: h ? a.createElement(h) : void 0,
          disabled: !w,
          onClick: (G) => {
            G.stopPropagation(), r && r();
          },
          style: Me
        },
        "召唤专家"
      )
    )
  );
}
function ol({
  expert: e,
  open: t,
  onClose: r,
  onRefresh: n
}) {
  const a = E().React, {
    Drawer: l,
    Descriptions: o,
    Tag: i,
    Typography: f,
    Space: c,
    Button: d,
    Empty: k,
    Tabs: b,
    List: h,
    Spin: P,
    Modal: p,
    message: I
  } = E().antd, { Text: M, Paragraph: q } = f, {
    EditOutlined: w,
    ThunderboltOutlined: Z,
    FileTextOutlined: N,
    ToolOutlined: $,
    PlusOutlined: G
  } = E().antdIcons || {}, [F, y] = a.useState(!1), [R, z] = a.useState(
    []
  ), [te, T] = a.useState(!1);
  if (!e) return null;
  const { agent: x, config: u, skills: B, mcps: H, loading: Y } = e, L = B.filter((m) => m.enabled !== !1), g = (m) => {
    window.history.pushState({}, "", m), window.dispatchEvent(new PopStateEvent("popstate"));
  }, C = a.createElement(
    "div",
    null,
    a.createElement(
      o,
      { column: 1, bordered: !0, size: "small" },
      a.createElement(o.Item, { label: "专家名称" }, x.name),
      a.createElement(
        o.Item,
        { label: "专家 ID" },
        a.createElement("code", { style: { fontSize: 12 } }, x.id)
      ),
      a.createElement(
        o.Item,
        { label: "状态" },
        a.createElement(
          i,
          { color: x.enabled ? "green" : "default" },
          x.enabled ? "启用" : "停用"
        )
      ),
      a.createElement(
        o.Item,
        { label: "功能简介" },
        x.description ? vt(x.description, a) : "暂无描述"
      ),
      a.createElement(
        o.Item,
        { label: "使用模型" },
        x.active_model ? `${x.active_model.provider_id} / ${x.active_model.model}` : "使用全局默认模型"
      ),
      u != null && u.workspace_dir ? a.createElement(
        o.Item,
        { label: "工作区路径" },
        a.createElement(
          "code",
          { style: { fontSize: 11 } },
          u.workspace_dir
        )
      ) : null,
      u != null && u.approval_level ? a.createElement(
        o.Item,
        { label: "审批级别" },
        u.approval_level
      ) : null
    ),
    // System prompt files
    u != null && u.system_prompt_files && u.system_prompt_files.length > 0 ? a.createElement(
      "div",
      { style: { marginTop: 16 } },
      a.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8
          }
        },
        N ? a.createElement(N, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(M, { strong: !0 }, "系统提示词文件")
      ),
      a.createElement(
        c,
        { wrap: !0 },
        ...u.system_prompt_files.map(
          (m, K) => a.createElement(
            i,
            {
              key: K,
              icon: N ? a.createElement(N) : void 0,
              style: { fontSize: 12 }
            },
            m
          )
        )
      )
    ) : null
  ), j = async () => {
    y(!0), T(!0);
    try {
      const m = await ht(!0);
      z(m);
    } catch (m) {
      I.error(m.message || "加载技能池失败");
    } finally {
      T(!1);
    }
  }, ae = async (m) => {
    let K = 0, re = 0;
    for (const he of m)
      try {
        await Ht(x.id, he), K++;
      } catch {
        re++;
      }
    K > 0 ? (I.success(
      `成功添加 ${K} 个技能${re > 0 ? `，${re} 个失败` : ""}`
    ), n()) : re > 0 && I.error("添加技能失败"), y(!1);
  }, S = async (m) => {
    try {
      await Wt(x.id, m), I.success(`技能「${m}」已移除`), n();
    } catch (K) {
      I.error(K.message || "移除技能失败");
    }
  }, D = async (m) => {
    try {
      await Jt(x.id, m), I.success(`MCP「${m}」已移除`), n();
    } catch (K) {
      I.error(K.message || "移除 MCP 失败");
    }
  }, X = Y ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(P, { size: "large" })
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
        M,
        { strong: !0 },
        `已启用技能 (${L.length})`
      ),
      a.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: G ? a.createElement(G) : void 0,
          onClick: j
        },
        "从技能池添加"
      )
    ),
    L.length === 0 ? a.createElement(k, {
      description: "该专家暂无已启用的技能",
      image: k.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(h, {
      dataSource: L,
      renderItem: (m) => a.createElement(
        h.Item,
        {
          actions: [
            a.createElement(
              d,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => S(m.name)
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
            m.emoji ? a.createElement(
              "span",
              { style: { fontSize: 16 } },
              m.emoji
            ) : null,
            a.createElement(M, { strong: !0 }, m.name),
            m.version_text ? a.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${m.version_text}`
            ) : null
          ),
          m.description ? a.createElement(
            q,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            m.description
          ) : null,
          m.tags && m.tags.length > 0 ? a.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...m.tags.map(
              (K, re) => a.createElement(
                i,
                {
                  key: re,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                K
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    a.createElement(Xt, {
      open: F,
      onClose: () => y(!1),
      poolSkills: R,
      installedSkillNames: L.map((m) => m.name),
      loading: te,
      onInstall: ae
    })
  ), U = Y ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(P, { size: "large" })
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
        M,
        { strong: !0 },
        `MCP 客户端 (${H.length})`
      ),
      a.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: G ? a.createElement(G) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${x.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    H.length === 0 ? a.createElement(k, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: k.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(h, {
      dataSource: H,
      renderItem: (m) => a.createElement(
        h.Item,
        {
          actions: [
            a.createElement(
              d,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => D(m.key)
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
            a.createElement(
              "span",
              { style: { fontSize: 14 } },
              "🔌"
            ),
            a.createElement(
              M,
              { strong: !0 },
              m.name || m.key
            ),
            a.createElement(
              i,
              {
                color: m.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              m.enabled ? "启用" : "停用"
            ),
            a.createElement(
              i,
              { color: "purple", style: { fontSize: 10 } },
              m.transport
            )
          ),
          m.description ? a.createElement(
            q,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            m.description
          ) : null,
          m.tools && m.tools.length > 0 ? a.createElement(
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
  ), O = u != null && u.tools ? a.createElement(
    "div",
    { style: { padding: 16 } },
    a.createElement(
      "div",
      { style: { marginBottom: 12 } },
      a.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8
          }
        },
        $ ? a.createElement($, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(M, { strong: !0 }, "工具配置")
      ),
      a.createElement(
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
  ) : a.createElement(k, {
    description: "暂无工具配置",
    image: k.PRESENTED_IMAGE_SIMPLE
  }), v = [
    { key: "basic", label: "基本信息", children: C },
    {
      key: "skills",
      label: `技能 (${L.length})`,
      children: X
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: a.createElement(cl, {
        skills: L,
        agentId: x.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: a.createElement(Qt, {
        agentId: x.id,
        systemPromptFiles: (u == null ? void 0 : u.system_prompt_files) || [],
        onRefresh: () => n()
      })
    },
    { key: "mcp", label: `MCP (${H.length})`, children: U },
    { key: "tools", label: "工具配置", children: O }
  ];
  return a.createElement(
    l,
    {
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement(Le, { name: x.name, size: 28 }),
        a.createElement("span", null, x.name)
      ),
      open: t,
      onClose: r,
      width: 560,
      extra: a.createElement(
        c,
        null,
        a.createElement(
          d,
          {
            size: "small",
            icon: w ? a.createElement(w) : void 0,
            onClick: () => {
              r();
              try {
                const m = E();
                m.setSelectedAgent && m.setSelectedAgent(x.id);
              } catch (m) {
                console.warn("[ugsci] Failed to set selected agent:", m);
              }
              setTimeout(() => g("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        a.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: Z ? a.createElement(Z) : void 0,
            onClick: () => {
              r();
              try {
                const m = E();
                m.setSelectedAgent && m.setSelectedAgent(x.id);
              } catch (m) {
                console.warn("[ugsci] Failed to set selected agent:", m);
              }
              setTimeout(() => g("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    a.createElement(b, {
      items: v,
      defaultActiveKey: "basic"
    })
  );
}
function sl({
  open: e,
  onClose: t,
  onCreated: r
}) {
  const n = E().React, { useState: a } = n, {
    Modal: l,
    Card: o,
    Tag: i,
    Input: f,
    Row: c,
    Col: d,
    Spin: k,
    message: b,
    Typography: h
  } = E().antd, { Text: P } = h, { FileAddOutlined: p } = E().antdIcons || {}, [I, M] = a(!1), [q, w] = a(""), [Z, N] = a(!1), $ = async (y, R) => {
    M(!0);
    try {
      const z = await ne("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: y || "新专家",
          description: R || "",
          skill_names: []
        })
      });
      await ot(
        z.id,
        "AGENTS.md",
        `# ${y || "新专家"}

请在此处编写该专家的系统提示词。
`
      ), b.success("专家「" + (y || "新专家") + "」创建成功"), N(!1), setTimeout(() => {
        t(), r();
      }, 0);
    } catch (z) {
      b.error(z.message || "创建专家失败");
    } finally {
      M(!1);
    }
  }, G = pt.filter((y) => {
    if (!q.trim()) return !0;
    const R = q.toLowerCase();
    return y.name.toLowerCase().includes(R) || y.description.toLowerCase().includes(R) || y.category.toLowerCase().includes(R);
  }), F = async (y) => {
    M(!0);
    try {
      const R = await ne("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: y.name,
          description: y.description,
          skill_names: y.recommendedSkills
        })
      });
      await ot(R.id, "AGENTS.md", y.systemPrompt);
      const z = await st(R.id);
      z.approval_level = y.approvalLevel, await ne(`/agents/${encodeURIComponent(R.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(z)
      }), b.success(`专家「${y.name}」创建成功`), t(), r();
    } catch (R) {
      b.error(R.message || "创建专家失败");
    } finally {
      M(!1);
    }
  };
  return n.createElement(
    n.Fragment,
    null,
    n.createElement(
      l,
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
        n.createElement(f, {
          placeholder: "搜索模板名称或类别...",
          value: q,
          onChange: (y) => w(y.target.value),
          allowClear: !0
        })
      ),
      I ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        n.createElement(k, { size: "large" }),
        n.createElement(
          "div",
          { style: { marginTop: 12, color: "#8c8c8c" } },
          "正在创建专家..."
        )
      ) : n.createElement(
        c,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        q.trim() ? null : n.createElement(
          d,
          { xs: 24, sm: 12 },
          n.createElement(
            o,
            {
              hoverable: !0,
              size: "small",
              onClick: () => N(!0),
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
                p ? n.createElement(p) : "📝"
              ),
              n.createElement(
                "div",
                { style: { flex: 1 } },
                n.createElement(
                  P,
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
        ...G.map(
          (y) => n.createElement(
            d,
            { key: y.id, xs: 24, sm: 12 },
            n.createElement(
              o,
              {
                hoverable: !0,
                size: "small",
                onClick: () => F(y),
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
                n.createElement(Le, {
                  name: y.name,
                  size: 40
                }),
                n.createElement(
                  "div",
                  { style: { flex: 1 } },
                  n.createElement(
                    P,
                    { strong: !0, style: { fontSize: 15 } },
                    y.name
                  ),
                  n.createElement(
                    "div",
                    null,
                    n.createElement(
                      i,
                      { color: "blue", style: { fontSize: 10 } },
                      y.category
                    ),
                    y.approvalLevel === "MANUAL" ? n.createElement(
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
                vt(y.description, n)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    n.createElement(il, {
      open: Z,
      onCancel: () => N(!1),
      onCreate: $
    })
  );
}
function il({
  open: e,
  onCancel: t,
  onCreate: r
}) {
  const n = E().React, { useState: a, useEffect: l } = n, { Modal: o, Input: i, message: f } = E().antd, [c, d] = a(""), [k, b] = a(""), [h, P] = a(!1);
  return l(() => {
    e && (d(""), b(""), P(!1));
  }, [e]), n.createElement(
    o,
    {
      open: e,
      title: "从空白模版创建专家",
      onCancel: t,
      onOk: () => {
        if (!c.trim()) {
          f.warning("请输入专家名称");
          return;
        }
        P(!0), Promise.resolve(r(c.trim(), k.trim())).finally(() => {
          P(!1);
        });
      },
      okText: "创建",
      cancelText: "取消",
      okButtonProps: { loading: h },
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
        onChange: (p) => d(p.target.value),
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
        value: k,
        onChange: (p) => b(p.target.value),
        rows: 3,
        maxLength: 200
      })
    )
  );
}
function Qt({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: r
}) {
  const n = E().React, { useState: a, useEffect: l, useCallback: o } = n, {
    List: i,
    Tag: f,
    Switch: c,
    Button: d,
    Modal: k,
    Input: b,
    Spin: h,
    Empty: P,
    message: p,
    Typography: I
  } = E().antd, { FileTextOutlined: M, PlusOutlined: q, EditOutlined: w, ReloadOutlined: Z } = E().antdIcons || {}, { Text: N } = I, [$, G] = a([]), [F, y] = a(!0), [R, z] = a(
    t || []
  ), [te, T] = a(!1), [x, u] = a(null), [B, H] = a(""), [Y, L] = a(""), [g, C] = a(!1), j = o(async () => {
    y(!0);
    try {
      const U = await Rn(e);
      G(U);
    } catch (U) {
      p.error(U.message || "加载记忆文件失败"), G([]);
    } finally {
      y(!1);
    }
  }, [e]);
  l(() => {
    j();
  }, [j]), l(() => {
    z(t || []);
  }, [t]);
  const ae = async (U, O) => {
    const v = new Set(R);
    if (O)
      v.add(U);
    else {
      if (Pt.includes(U) && U === "AGENTS.md") {
        p.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      v.delete(U);
    }
    const m = Array.from(v);
    z(m);
    try {
      await zt(e, m), p.success(O ? "已启用记忆文件" : "已停用记忆文件"), r();
    } catch (K) {
      p.error(K.message || "更新失败"), z(t || []);
    }
  }, S = async (U) => {
    try {
      const O = await ne(
        `/workspace/files/${encodeURIComponent(U)}`,
        { headers: { "X-Agent-Id": e } }
      );
      u(U), H(O.content || ""), T(!0);
    } catch (O) {
      p.error(O.message || "读取文件失败");
    }
  }, D = () => {
    u(null), H(""), L(""), T(!0);
  }, X = async () => {
    const U = x || Y.trim();
    if (!U) {
      p.warning("请输入文件名");
      return;
    }
    const O = U.endsWith(".md") ? U : `${U}.md`;
    C(!0);
    try {
      if (await ot(e, O, B), !x && !R.includes(O)) {
        const v = [...R, O];
        z(v), await zt(e, v);
      }
      p.success("保存成功"), T(!1), j(), r();
    } catch (v) {
      p.error(v.message || "保存失败");
    } finally {
      C(!1);
    }
  };
  return F ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(h, { size: "large" })
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
        M ? n.createElement(M, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(
          N,
          { strong: !0 },
          `记忆文件 (${$.length})`
        ),
        n.createElement(
          N,
          { type: "secondary", style: { fontSize: 12 } },
          `· 已挂载 ${R.length} 个到专家记忆`
        )
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          d,
          {
            size: "small",
            icon: Z ? n.createElement(Z) : void 0,
            onClick: j
          },
          "刷新"
        ),
        n.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: q ? n.createElement(q) : void 0,
            onClick: D
          },
          "新建记忆文件"
        )
      )
    ),
    $.length === 0 ? n.createElement(P, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: P.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(i, {
      dataSource: $,
      renderItem: (U) => {
        const O = R.includes(U.filename), v = Pt.includes(U.filename);
        return n.createElement(
          i.Item,
          {
            actions: [
              n.createElement(
                d,
                {
                  type: "link",
                  size: "small",
                  icon: w ? n.createElement(w) : void 0,
                  onClick: () => S(U.filename)
                },
                "编辑"
              )
            ]
          },
          n.createElement(i.Item.Meta, {
            avatar: n.createElement(M, {
              style: {
                fontSize: 20,
                color: O ? "#1677ff" : "#bfbfbf"
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
              n.createElement(N, null, U.filename),
              v ? n.createElement(
                f,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : n.createElement(
                f,
                { color: "cyan", style: { fontSize: 10 } },
                "记忆库"
              )
            ),
            description: n.createElement(
              "div",
              { style: { fontSize: 12 } },
              `${(U.size / 1024).toFixed(1)} KB · 修改于 ${new Date(U.modified_time).toLocaleString()}`
            )
          }),
          n.createElement(c, {
            checked: O,
            size: "small",
            onChange: (m) => ae(U.filename, m)
          })
        );
      }
    }),
    // Edit/New file modal
    n.createElement(
      k,
      {
        open: te,
        onCancel: () => T(!1),
        title: x ? `编辑 ${x}` : "新建记忆文件",
        width: 700,
        onOk: X,
        confirmLoading: g,
        okText: "保存"
      },
      x ? null : n.createElement(
        "div",
        { style: { marginBottom: 12 } },
        n.createElement(b, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: Y,
          onChange: (U) => L(U.target.value),
          addonAfter: Y.endsWith(".md") ? "" : ".md"
        })
      ),
      n.createElement(b.TextArea, {
        value: B,
        onChange: (U) => H(U.target.value),
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
function cl({
  skills: e,
  agentId: t
}) {
  const r = E().React, { useMemo: n } = r, {
    List: a,
    Tag: l,
    Typography: o,
    Empty: i,
    Button: f,
    message: c
  } = E().antd, { ThunderboltOutlined: d, CopyOutlined: k } = E().antdIcons || {}, { Text: b } = o, h = n(() => Gt(e), [e]), P = (I) => {
    try {
      const M = E();
      M.setSelectedAgent && M.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", I.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, p = (I) => {
    var M;
    (M = navigator.clipboard) == null || M.writeText(I.value).then(() => {
      c.success("已复制到剪贴板");
    });
  };
  return h.length === 0 ? r.createElement(i, {
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
        b,
        { strong: !0 },
        `推荐提问 (${h.length})`
      ),
      r.createElement(
        b,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    r.createElement(a, {
      dataSource: h,
      renderItem: (I, M) => r.createElement(
        a.Item,
        {
          actions: [
            r.createElement(
              f,
              {
                type: "link",
                size: "small",
                icon: k ? r.createElement(k) : void 0,
                onClick: () => p(I)
              },
              "复制"
            )
          ]
        },
        r.createElement(a.Item.Meta, {
          avatar: r.createElement(
            l,
            { color: "blue", style: { borderRadius: "50%" } },
            `${M + 1}`
          ),
          title: r.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => P(I)
            },
            I.value
          ),
          description: r.createElement(
            b,
            { type: "secondary", style: { fontSize: 12 } },
            I.label
          )
        })
      )
    })
  );
}
function ml() {
  var Te;
  const e = E().React, { useState: t, useEffect: r, useCallback: n, useMemo: a } = e, {
    Spin: l,
    Empty: o,
    Input: i,
    Button: f,
    message: c,
    Row: d,
    Col: k,
    Tabs: b,
    Modal: h,
    Typography: P
  } = E().antd, {
    ReloadOutlined: p,
    PlusOutlined: I,
    SearchOutlined: M,
    TeamOutlined: q,
    UserOutlined: w
  } = E().antdIcons || {}, { Text: Z, Paragraph: N } = P, [$, G] = t([]), [F, y] = t(!0), [R, z] = t(!1), [te, T] = t(null), [x, u] = t(""), [B, H] = t(!1), [Y, L] = t("experts"), [g, C] = t(
    null
  ), [j, ae] = t(""), [S, D] = t(!1), [X, U] = t(!1), [O, v] = t(null), [m, K] = t([]), re = n(async () => {
    y(!0);
    try {
      const _ = await Et(), ie = await Promise.all(
        _.map(async (ge) => {
          try {
            const [we, Se, Ce] = await Promise.all([
              st(ge.id).catch(() => null),
              it(ge.id).catch(() => []),
              bt(ge.id).catch(() => [])
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
      G(ie), K(_);
    } catch (_) {
      c.error(_.message || "加载专家列表失败"), G([]);
    } finally {
      y(!1);
    }
  }, []);
  r(() => {
    re();
  }, [re]), r(() => {
    if (O && X) {
      const _ = $.find(
        (ie) => ie.agent.id === O.agent.id
      );
      _ && _ !== O && v(_);
    }
  }, [$, O, X]);
  const he = n(
    async (_) => {
      var Se;
      const ie = _.coordinatorName || ((Se = _.members[0]) == null ? void 0 : Se.name);
      if (!ie) {
        c.error("无法确定协调者专家");
        return;
      }
      const ge = rt(m, ie);
      if (!ge) {
        c.error(`未找到协调者专家「${ie}」，请先创建该专家`);
        return;
      }
      if (/\{.+?\}/.test(_.taskTemplate)) {
        ae(""), C(_);
        return;
      }
      await Q(_, ge, _.taskTemplate);
    },
    [m, c]
  ), Q = n(
    async (_, ie, ge) => {
      var we;
      D(!0);
      try {
        const Se = On(_), Ce = ge ? Se.replace(_.taskTemplate, ge) : Se, $e = E();
        $e.setSelectedAgent && $e.setSelectedAgent(ie), await _n(ie, Ce), c.success(
          `团队任务已发起，协调者：${_.coordinatorName || ((we = _.members[0]) == null ? void 0 : we.name)}`
        ), C(null), me("/chat");
      } catch (Se) {
        c.error(Se.message || "发起团队任务失败");
      } finally {
        D(!1);
      }
    },
    [c]
  ), me = (_) => {
    window.history.pushState({}, "", _), window.dispatchEvent(new PopStateEvent("popstate"));
  }, W = n((_) => {
    T(_), z(!0);
  }, []), oe = n((_) => {
    v(_), U(!0);
  }, []), se = n(
    (_) => {
      if (!_.agent.enabled) {
        c.warning(`专家「${_.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const ie = E();
        ie.setSelectedAgent && ie.setSelectedAgent(_.agent.id);
      } catch (ie) {
        console.warn("[ugsci] Failed to set selected agent:", ie);
      }
      c.success(`已召唤专家「${_.agent.name}」，正在跳转至对话...`), me("/chat");
    },
    [c]
  ), le = a(() => {
    if (!x.trim()) return $;
    const _ = x.toLowerCase();
    return $.filter(
      (ie) => {
        var ge;
        return ie.agent.name.toLowerCase().includes(_) || ((ge = ie.agent.description) == null ? void 0 : ge.toLowerCase().includes(_)) || ie.agent.id.toLowerCase().includes(_) || ie.skills.some((we) => we.name.toLowerCase().includes(_));
      }
    );
  }, [$, x]), V = $.filter((_) => _.agent.enabled).length, pe = $.reduce(
    (_, ie) => _ + ie.skills.filter((ge) => ge.enabled !== !1).length,
    0
  ), de = $.reduce((_, ie) => _ + ie.mcps.length, 0), ze = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        w ? e.createElement(w, { style: { fontSize: 14 } }) : null,
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
            prefix: M ? e.createElement(M) : void 0,
            value: x,
            onChange: (_) => u(_.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        F ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(l, { size: "large" })
        ) : le.length === 0 ? e.createElement(o, {
          description: x ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          d,
          { gutter: [12, 12], align: "stretch" },
          ...le.map(
            (_) => e.createElement(
              k,
              {
                key: _.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(rl, {
                expert: _,
                onClick: () => W(_),
                onSummon: () => se(_),
                onConfigure: () => oe(_)
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
        q ? e.createElement(q, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement($n, {
        agents: m,
        onLaunch: he
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(ct, {
      title: "专家",
      subtitle: `共 ${$.length} 位专家（${V} 位启用）· ${pe} 个技能 · ${de} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          f,
          {
            icon: p ? e.createElement(p) : void 0,
            onClick: re,
            loading: F
          },
          "刷新"
        ),
        e.createElement(
          f,
          {
            type: "primary",
            icon: I ? e.createElement(I) : void 0,
            onClick: () => H(!0),
            style: Me
          },
          "创建专家"
        )
      )
    }),
    e.createElement(b, {
      items: ze,
      activeKey: Y,
      onChange: (_) => L(_)
    }),
    // Drawer
    e.createElement(ol, {
      expert: te,
      open: R,
      onClose: () => z(!1),
      onRefresh: () => re()
    }),
    // Template Modal
    e.createElement(sl, {
      open: B,
      onClose: () => H(!1),
      onCreated: () => re()
    }),
    // Config Modal (gear icon)
    e.createElement(al, {
      expert: O,
      open: X,
      onClose: () => U(!1),
      onRefresh: () => re()
    }),
    // Team Launch Modal (for filling placeholders)
    g ? e.createElement(
      h,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(St, {
            members: g.members.map((_) => _.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${g.name}`
          )
        ),
        onCancel: () => C(null),
        onOk: () => {
          var we;
          const _ = g.coordinatorName || ((we = g.members[0]) == null ? void 0 : we.name), ie = _ ? rt(m, _) : null;
          if (!ie) {
            c.error("无法找到协调者专家");
            return;
          }
          let ge = g.taskTemplate;
          j.trim() && (ge = j.trim()), Q(g, ie, ge);
        },
        confirmLoading: S,
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
        e.createElement(i.TextArea, {
          value: j,
          onChange: (_) => ae(_.target.value),
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
          `协调者: ${g.coordinatorName || ((Te = g.members[0]) == null ? void 0 : Te.name) || "—"} · 成员: ${g.members.map((_) => _.name).join("、")}`
        )
      )
    ) : null
  );
}
function dl({
  mcp: e,
  onClick: t,
  onToggle: r,
  onDelete: n,
  onViewTools: a
}) {
  const l = E().React, { Card: o, Tag: i, Badge: f, Typography: c, Button: d } = E().antd, { Text: k } = c, {
    EyeOutlined: b,
    EyeInvisibleOutlined: h,
    DeleteOutlined: P,
    ToolOutlined: p
  } = E().antdIcons || {}, I = {
    stdio: "💻",
    streamable_http: "🌐",
    sse: "📡"
  };
  return e.transport === "streamable_http" || e.transport, l.createElement(
    o,
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
        l.createElement(
          "span",
          { style: { fontSize: 18 } },
          I[e.transport] || "🔌"
        ),
        l.createElement(
          k,
          { strong: !0, style: { fontSize: 14 } },
          e.name || e.key
        )
      ),
      l.createElement(f, {
        status: e.enabled ? "success" : "default",
        text: e.enabled ? "启用" : "停用"
      })
    ),
    e.description ? l.createElement(
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
    ) : l.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 8, minHeight: 36, flex: "1 0 auto" } },
      "暂无描述"
    ),
    l.createElement(
      "div",
      { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 } },
      l.createElement(
        i,
        { color: "purple", style: { fontSize: 11 } },
        e.transport
      ),
      e.tools && e.tools.length > 0 ? l.createElement(
        i,
        { color: "blue", style: { fontSize: 11 } },
        `${e.tools.length} 个工具`
      ) : l.createElement(i, { style: { fontSize: 11 } }, "全部工具"),
      e.url ? l.createElement(
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
    l.createElement(
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
      l.createElement(
        d,
        {
          size: "small",
          icon: p ? l.createElement(p) : void 0,
          onClick: a
        },
        "工具"
      ),
      l.createElement(
        d,
        {
          size: "small",
          icon: e.enabled ? h ? l.createElement(h) : void 0 : b ? l.createElement(b) : void 0,
          onClick: r
        },
        e.enabled ? "禁用" : "启用"
      ),
      l.createElement(
        d,
        {
          size: "small",
          danger: !0,
          icon: P ? l.createElement(P) : void 0,
          onClick: n
        },
        "删除"
      )
    )
  );
}
const gt = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, Zt = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, en = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function tn(e) {
  return Ve(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
function Ot(e) {
  return Ve(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function At(e) {
  const t = e.map(encodeURIComponent).join(",");
  return Ve(`/ugsci/avatar/team/${t}`);
}
function Le({
  name: e,
  size: t = 32,
  borderRadius: r = "50%"
}) {
  const n = E().React, [a, l] = n.useState(0), o = a === 0 ? Ot(e) : `${Ot(e)}?_r=${a}`;
  return n.createElement("img", {
    src: o,
    alt: e,
    onError: () => {
      a < 1 && l(a + 1);
    },
    style: { width: t, height: t, borderRadius: r, objectFit: "cover", flexShrink: 0 }
  });
}
function St({
  members: e,
  size: t = 32,
  borderRadius: r = "50%"
}) {
  const n = E().React, [a, l] = n.useState(0);
  if (!e || e.length === 0)
    return n.createElement("span", {
      style: { width: t, height: t, display: "inline-block" }
    });
  const o = e.slice(0, 5), i = a === 0 ? At(o) : `${At(o)}?_r=${a}`;
  return n.createElement("img", {
    src: i,
    alt: "team",
    onError: () => {
      a < 1 && l(a + 1);
    },
    style: { width: t, height: t, borderRadius: r, objectFit: "cover", flexShrink: 0 }
  });
}
async function ul() {
  return ne("/ugsci/engines/list");
}
async function pl(e) {
  return ne("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function gl(e, t) {
  return ne(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function yl(e) {
  return ne(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function fl() {
  return ne("/ugsci/engines/detect", {
    method: "POST"
  });
}
function El({
  engine: e,
  onClick: t
}) {
  const r = E().React, { Card: n, Tag: a, Typography: l } = E().antd, { Text: o } = l, i = e.status === "detected", f = Zt[e.category] || "📦", d = en.has(e.id) ? r.createElement("img", {
    src: tn(e.id),
    alt: e.name,
    style: { width: 24, height: 24, objectFit: "contain" }
  }) : r.createElement("span", { style: { fontSize: 20 } }, f);
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
            o,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          r.createElement("br"),
          r.createElement(
            o,
            { type: "secondary", style: { fontSize: 11 } },
            e.vendor || "—"
          )
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" } },
        i ? r.createElement(
          a,
          { color: "success", style: { fontSize: 11 } },
          "✅ 已检测"
        ) : e.executable_path ? r.createElement(
          a,
          { color: "warning", style: { fontSize: 11 } },
          "⚠ 路径无效"
        ) : r.createElement(
          a,
          { style: { fontSize: 11 } },
          "🔧 待配置"
        ),
        e.is_default ? r.createElement(
          a,
          { color: "blue", style: { fontSize: 10 } },
          "默认"
        ) : e.is_custom ? r.createElement(
          a,
          { color: "purple", style: { fontSize: 10 } },
          "自定义"
        ) : null
      )
    ),
    r.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      r.createElement(
        o,
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
        a,
        { style: { fontSize: 11 } },
        gt[e.category] || e.category
      ) : null,
      e.version ? r.createElement(
        a,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (k) => r.createElement(
          a,
          { key: k, color: "cyan", style: { fontSize: 10 } },
          k
        )
      )
    )
  );
}
function hl() {
  const e = E().React, { useState: t, useEffect: r, useCallback: n, useMemo: a } = e, {
    Spin: l,
    Empty: o,
    Button: i,
    message: f,
    Row: c,
    Col: d,
    Drawer: k,
    Descriptions: b,
    Tag: h,
    Typography: P,
    Modal: p,
    Input: I,
    Select: M,
    Popconfirm: q,
    Space: w
  } = E().antd, {
    ReloadOutlined: Z,
    SearchOutlined: N,
    PlusOutlined: $,
    EditOutlined: G,
    DeleteOutlined: F,
    CopyOutlined: y,
    ExperimentOutlined: R
  } = E().antdIcons || {}, { Text: z, Paragraph: te } = P, [T, x] = t([]), [u, B] = t(!0), [H, Y] = t(""), [L, g] = t(!1), [C, j] = t(null), [ae, S] = t(!1), [D, X] = t(null), [U, O] = t({}), [v, m] = t(!1), K = n(async () => {
    B(!0);
    try {
      const V = await ul();
      x(V.engines || []);
    } catch (V) {
      f.error(V.message || "加载引擎列表失败"), x([]);
    } finally {
      B(!1);
    }
  }, []);
  r(() => {
    K();
  }, [K]);
  const re = a(() => {
    if (!H.trim()) return T;
    const V = H.toLowerCase();
    return T.filter(
      (pe) => {
        var de;
        return pe.name.toLowerCase().includes(V) || pe.vendor.toLowerCase().includes(V) || pe.category.toLowerCase().includes(V) || ((de = pe.description) == null ? void 0 : de.toLowerCase().includes(V));
      }
    );
  }, [T, H]);
  T.filter((V) => V.status === "detected").length;
  const he = n((V) => {
    navigator.clipboard.writeText(V).then(() => f.success("路径已复制")).catch(() => f.error("复制失败"));
  }, []), Q = n(() => {
    X(null), O({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), S(!0);
  }, []), me = n((V) => {
    X(V), O({ ...V }), S(!0), g(!1);
  }, []), W = n(async () => {
    var V;
    if (!((V = U.name) != null && V.trim())) {
      f.warning("请输入引擎名称");
      return;
    }
    m(!0);
    try {
      D ? (await gl(D.id, U), f.success("引擎已更新")) : (await pl(U), f.success("引擎已添加")), S(!1), K();
    } catch (pe) {
      f.error(pe.message || "保存失败");
    } finally {
      m(!1);
    }
  }, [U, D, K]), oe = n(
    async (V) => {
      try {
        await yl(V), f.success("引擎已删除"), g(!1), K();
      } catch (pe) {
        f.error(pe.message || "删除失败");
      }
    },
    [K]
  ), se = n(async () => {
    B(!0);
    try {
      const V = await fl();
      x(V.engines || []), f.success("自动检测完成");
    } catch (V) {
      f.error(V.message || "检测失败");
    } finally {
      B(!1);
    }
  }, []), le = n(
    (V, pe, de) => {
      const ze = U[pe] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          z,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          V
        ),
        de != null && de.select ? e.createElement(M, {
          value: ze || void 0,
          onChange: (Te) => O((_) => ({ ..._, [pe]: Te })),
          style: { width: "100%" },
          options: de.select.options,
          allowClear: !0,
          placeholder: `选择${V}`
        }) : de != null && de.textarea ? e.createElement(I.TextArea, {
          value: ze,
          onChange: (Te) => O((_) => ({ ..._, [pe]: Te.target.value })),
          rows: 3,
          placeholder: `输入${V}`
        }) : e.createElement(I, {
          value: ze,
          onChange: (Te) => O((_) => ({ ..._, [pe]: Te.target.value })),
          placeholder: `输入${V}`
        })
      );
    },
    [U]
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
      e.createElement(I, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: N ? e.createElement(N) : void 0,
        value: H,
        onChange: (V) => Y(V.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        i,
        {
          icon: Z ? e.createElement(Z) : void 0,
          onClick: se,
          loading: u
        },
        "自动检测"
      ),
      e.createElement(
        i,
        {
          type: "primary",
          icon: $ ? e.createElement($) : void 0,
          onClick: Q,
          style: Me
        },
        "添加引擎"
      )
    ),
    // Content
    u ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(l, {
        size: "large",
        tip: "正在加载计算引擎..."
      })
    ) : re.length === 0 ? e.createElement(o, {
      description: H ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      c,
      { gutter: [12, 12], align: "stretch" },
      ...re.map(
        (V) => e.createElement(
          d,
          {
            key: V.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(El, {
            engine: V,
            onClick: () => {
              j(V), g(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    C ? e.createElement(
      k,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            en.has(C.id) ? e.createElement("img", {
              src: tn(C.id),
              alt: C.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              Zt[C.category] || "📦"
            )
          ),
          e.createElement("span", null, C.name)
        ),
        open: L,
        onClose: () => g(!1),
        width: 520,
        extra: e.createElement(
          w,
          null,
          e.createElement(
            i,
            {
              size: "small",
              icon: G ? e.createElement(G) : void 0,
              onClick: () => me(C)
            },
            "编辑"
          ),
          C.is_default ? null : e.createElement(
            q,
            {
              title: "确认删除此引擎？",
              description: C.name,
              onConfirm: () => oe(C.id),
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
        b,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          b.Item,
          { label: "引擎名称" },
          C.name
        ),
        e.createElement(
          b.Item,
          { label: "厂商" },
          C.vendor || "—"
        ),
        e.createElement(
          b.Item,
          { label: "分类" },
          C.category ? gt[C.category] || C.category : "—"
        ),
        e.createElement(
          b.Item,
          { label: "状态" },
          e.createElement(
            h,
            {
              color: C.status === "detected" ? "success" : C.status === "not_found" ? "error" : "default"
            },
            C.status === "detected" ? "✅ 已检测" : C.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          b.Item,
          { label: "版本" },
          C.version || "—"
        ),
        C.executable_path ? e.createElement(
          b.Item,
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
              C.executable_path
            ),
            e.createElement(
              i,
              {
                size: "small",
                type: "text",
                icon: y ? e.createElement(y) : void 0,
                onClick: () => he(C.executable_path)
              }
            )
          )
        ) : null,
        C.install_dir ? e.createElement(
          b.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            C.install_dir
          )
        ) : null,
        // Display detected modules with paths
        C.modules && C.modules.length > 0 ? e.createElement(
          b.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...C.modules.map(
              (V) => e.createElement(
                "div",
                {
                  key: V,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  h,
                  { color: "cyan", style: { fontSize: 11 } },
                  V
                ),
                C.module_paths && C.module_paths[V] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  C.module_paths[V]
                ) : null
              )
            )
          )
        ) : null,
        C.license_server ? e.createElement(
          b.Item,
          { label: "许可证服务器" },
          C.license_server
        ) : null,
        e.createElement(
          b.Item,
          { label: "描述" },
          C.description || "—"
        )
      ),
      // Invocation hint
      C.invocation_hint ? e.createElement(
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
          z,
          { strong: !0, style: { fontSize: 13 } },
          "💡 调用方式"
        ),
        e.createElement(
          "div",
          { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
          C.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        C.is_default ? e.createElement(
          h,
          { color: "blue" },
          "默认引擎"
        ) : C.is_custom ? e.createElement(
          h,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      p,
      {
        title: D ? "编辑引擎" : "添加计算引擎",
        open: ae,
        onOk: W,
        onCancel: () => S(!1),
        okText: D ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: v,
        width: 560
      },
      e.createElement(
        "div",
        { style: { maxHeight: 480, overflow: "auto", paddingRight: 8 } },
        le("引擎名称 *", "name"),
        le("厂商", "vendor"),
        le("版本", "version"),
        le("可执行文件路径", "executable_path"),
        le("安装目录", "install_dir"),
        le("分类", "category", {
          select: {
            options: Object.entries(gt).map(([V, pe]) => ({
              label: pe,
              value: V
            }))
          }
        }),
        le("描述", "description", { textarea: !0 }),
        le("调用方式提示", "invocation_hint", { textarea: !0 }),
        le("许可证服务器", "license_server")
      )
    )
  );
}
function vl() {
  const e = E().React, { useState: t, useEffect: r, useCallback: n, useMemo: a } = e, {
    Spin: l,
    Empty: o,
    Input: i,
    Button: f,
    message: c,
    Row: d,
    Col: k,
    Drawer: b,
    Descriptions: h,
    Tag: P,
    Typography: p,
    List: I,
    Tabs: M,
    Modal: q
  } = E().antd, {
    ReloadOutlined: w,
    PlusOutlined: Z,
    SearchOutlined: N,
    ApiOutlined: $,
    RocketOutlined: G,
    ToolOutlined: F,
    DeleteOutlined: y,
    EyeOutlined: R,
    EyeInvisibleOutlined: z
  } = E().antdIcons || {}, { Text: te } = p, { TextArea: T } = i, u = E().useSelectedAgent, B = u ? u() : null, H = (B == null ? void 0 : B.id) || "default", [Y, L] = t([]), [g, C] = t(!0), [j, ae] = t(""), [S, D] = t(!1), [X, U] = t(null), [O, v] = t("mcp"), [m, K] = t(!1), [re, he] = t(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [Q, me] = t(!1), [W, oe] = t(!1), [se, le] = t(null), [V, pe] = t(!1), [de, ze] = t(null), [Te, _] = t([]), [ie, ge] = t(!1), [we, Se] = t(""), Ce = n(async () => {
    C(!0);
    try {
      const ee = await Cn(H);
      L(ee);
    } catch (ee) {
      c.error(ee.message || "加载 MCP 列表失败"), L([]);
    } finally {
      C(!1);
    }
  }, [H]);
  r(() => {
    Ce();
  }, [Ce]);
  const $e = n(
    async (ee) => {
      try {
        await kn(H, ee.key), c.success(ee.enabled ? "已禁用" : "已启用"), Ce();
      } catch (ce) {
        c.error(ce.message || "切换状态失败");
      }
    },
    [H, Ce]
  ), Ue = n(async () => {
    if (se)
      try {
        await Tn(H, se.key), c.success(`MCP「${se.key}」已删除`), oe(!1), le(null), Ce();
      } catch (ee) {
        c.error(ee.message || "删除失败");
      }
  }, [H, se, Ce]), Oe = n(async () => {
    me(!0);
    try {
      const ee = JSON.parse(re), ce = ee.mcpServers || ee, A = Object.entries(ce);
      if (A.length === 0) {
        c.warning("未找到 MCP 客户端配置");
        return;
      }
      let ke = !0;
      for (const [xe, be] of A) {
        const Ie = be, We = Ie.url ? "streamable_http" : "stdio", ye = {
          name: Ie.name || xe,
          description: Ie.description || "",
          enabled: !0,
          transport: We,
          url: Ie.url || "",
          command: Ie.command || "",
          args: Ie.args || [],
          env: Ie.env || {},
          cwd: Ie.cwd || "",
          headers: Ie.headers || {}
        };
        try {
          await In(
            H,
            xe,
            ye
          );
        } catch {
          ke = !1;
        }
      }
      ke && (c.success("MCP 客户端已创建"), K(!1), Ce());
    } catch (ee) {
      ee instanceof SyntaxError ? c.error("JSON 格式错误：" + ee.message) : c.error(ee.message || "创建 MCP 失败");
    } finally {
      me(!1);
    }
  }, [re, H, Ce]), Fe = n(
    async (ee) => {
      ze(ee), pe(!0), _([]), Se(""), ge(!0);
      try {
        const ce = await zn(
          H,
          ee.key
        );
        _(ce);
      } catch (ce) {
        Se(
          ce.message || "无法加载工具列表（MCP 服务可能未运行）"
        );
      } finally {
        ge(!1);
      }
    },
    [H]
  ), Ge = a(() => {
    if (!j.trim()) return Y;
    const ee = j.toLowerCase();
    return Y.filter(
      (ce) => {
        var A;
        return ce.name.toLowerCase().includes(ee) || ce.key.toLowerCase().includes(ee) || ((A = ce.description) == null ? void 0 : A.toLowerCase().includes(ee)) || ce.transport.toLowerCase().includes(ee);
      }
    );
  }, [Y, j]), Be = Y.filter((ee) => ee.enabled).length, Re = Y.reduce((ee, ce) => {
    var A;
    return ee + (((A = ce.tools) == null ? void 0 : A.length) || 0);
  }, 0), je = e.createElement(
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
        prefix: N ? e.createElement(N) : void 0,
        value: j,
        onChange: (ee) => ae(ee.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      e.createElement(
        f,
        {
          type: "primary",
          icon: Z ? e.createElement(Z) : void 0,
          onClick: () => K(!0),
          style: Me
        },
        "添加 MCP"
      )
    ),
    g ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(l, { size: "large" })
    ) : Ge.length === 0 ? e.createElement(o, {
      description: j ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「添加 MCP」创建"
    }) : e.createElement(
      d,
      { gutter: [12, 12], align: "stretch" },
      ...Ge.map(
        (ee) => e.createElement(
          k,
          {
            key: ee.key,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(dl, {
            mcp: ee,
            onClick: () => {
              U(ee), D(!0);
            },
            onToggle: (ce) => {
              ce.stopPropagation(), $e(ee);
            },
            onDelete: (ce) => {
              ce.stopPropagation(), le(ee), oe(!0);
            },
            onViewTools: (ce) => {
              ce.stopPropagation(), Fe(ee);
            }
          })
        )
      )
    )
  ), He = [
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        $ ? e.createElement($, { style: { fontSize: 14 } }) : null,
        "MCP 客户端"
      ),
      children: je
    },
    {
      key: "software",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        G ? e.createElement(G, { style: { fontSize: 14 } }) : null,
        "计算引擎"
      ),
      children: e.createElement(hl)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(ct, {
      title: "工具",
      subtitle: `MCP: ${Y.length} 个客户端（${Be} 个启用）· ${Re} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          f,
          {
            icon: w ? e.createElement(w) : void 0,
            onClick: Ce,
            loading: g
          },
          "刷新"
        )
      )
    }),
    e.createElement(M, {
      items: He,
      activeKey: O,
      onChange: (ee) => v(ee)
    }),
    // MCP Detail drawer
    X ? e.createElement(
      b,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement("span", { style: { fontSize: 18 } }, "🔌"),
          e.createElement(
            "span",
            null,
            X.name || X.key
          )
        ),
        open: S,
        onClose: () => D(!1),
        width: 480
      },
      e.createElement(
        h,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          h.Item,
          { label: "Key" },
          e.createElement(
            "code",
            { style: { fontSize: 12 } },
            X.key
          )
        ),
        e.createElement(
          h.Item,
          { label: "名称" },
          X.name || "-"
        ),
        e.createElement(
          h.Item,
          { label: "描述" },
          X.description || "-"
        ),
        e.createElement(
          h.Item,
          { label: "状态" },
          e.createElement(
            P,
            { color: X.enabled ? "green" : "default" },
            X.enabled ? "启用" : "停用"
          )
        ),
        e.createElement(
          h.Item,
          { label: "传输方式" },
          X.transport
        ),
        X.url ? e.createElement(
          h.Item,
          { label: "URL" },
          X.url
        ) : null,
        X.command ? e.createElement(
          h.Item,
          { label: "命令" },
          e.createElement(
            "code",
            { style: { fontSize: 11 } },
            X.command
          )
        ) : null,
        X.args && X.args.length > 0 ? e.createElement(
          h.Item,
          { label: "参数" },
          X.args.join(" ")
        ) : null
      ),
      X.tools && X.tools.length > 0 ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          te,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "提供的工具"
        ),
        e.createElement(I, {
          size: "small",
          dataSource: X.tools,
          renderItem: (ee) => e.createElement(
            I.Item,
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
              $ ? e.createElement($, {
                style: { fontSize: 12, color: "#1677ff" }
              }) : null,
              e.createElement(
                te,
                { style: { fontSize: 12 } },
                ee
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
      q,
      {
        title: "添加 MCP 客户端 (JSON)",
        open: m,
        onCancel: () => K(!1),
        onOk: Oe,
        confirmLoading: Q,
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
      e.createElement(T, {
        value: re,
        onChange: (ee) => he(ee.target.value),
        autoSize: { minRows: 12, maxRows: 20 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      })
    ),
    // ── Delete Confirmation Modal ──
    e.createElement(
      q,
      {
        title: "确认删除",
        open: W,
        onOk: Ue,
        onCancel: () => {
          oe(!1), le(null);
        },
        okText: "确认删除",
        cancelText: "取消",
        okButtonProps: { danger: !0 }
      },
      e.createElement(
        "p",
        null,
        `确定要删除 MCP 客户端「${(se == null ? void 0 : se.name) || (se == null ? void 0 : se.key)}」吗？此操作不可撤销。`
      )
    ),
    // ── Tools Viewer Modal (mirror console /mcp tools) ──
    e.createElement(
      q,
      {
        title: de ? `${de.name || de.key} - 工具列表` : "工具列表",
        open: V,
        onCancel: () => {
          pe(!1), ze(null);
        },
        footer: e.createElement(
          f,
          { onClick: () => pe(!1) },
          "关闭"
        ),
        width: 640
      },
      ie ? e.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        e.createElement(l, { size: "large" })
      ) : we ? e.createElement(
        "div",
        { style: { color: "#ff4d4f", padding: 16 } },
        we
      ) : Te.length === 0 ? e.createElement(o, {
        description: "此 MCP 客户端暂无可用工具（可能服务未启动）"
      }) : e.createElement(I, {
        size: "small",
        dataSource: Te,
        renderItem: (ee) => e.createElement(
          I.Item,
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
              $ ? e.createElement($, {
                style: { fontSize: 12, color: "#1677ff" }
              }) : null,
              e.createElement(
                te,
                { strong: !0, style: { fontSize: 13 } },
                ee.name || ee.key
              )
            ),
            ee.description ? e.createElement(
              te,
              { type: "secondary", style: { fontSize: 12 } },
              ee.description
            ) : null
          )
        )
      })
    )
  );
}
function bl({
  agentId: e,
  agentName: t,
  onNavigate: r
}) {
  const n = E().React, { useState: a, useEffect: l, useCallback: o } = n, {
    Spin: i,
    Empty: f,
    Button: c,
    Row: d,
    Col: k,
    Card: b,
    Tag: h,
    Checkbox: P,
    Modal: p,
    Typography: I,
    Drawer: M,
    Descriptions: q,
    message: w
  } = E().antd, {
    ReloadOutlined: Z,
    ThunderboltOutlined: N,
    SettingOutlined: $,
    CheckSquareOutlined: G,
    EyeOutlined: F,
    EyeInvisibleOutlined: y,
    DeleteOutlined: R,
    CloseOutlined: z
  } = E().antdIcons || {}, { Text: te, Paragraph: T } = I, [x, u] = a([]), [B, H] = a(!0), [Y, L] = a(!1), [g, C] = a(null), [j, ae] = a(!1), [S, D] = a(
    /* @__PURE__ */ new Set()
  ), [X, U] = a(!1), O = o(async () => {
    if (e) {
      H(!0);
      try {
        const W = await it(e);
        u(W);
      } catch (W) {
        w.error(W.message || "加载技能失败"), u([]);
      } finally {
        H(!1);
      }
    }
  }, [e]);
  l(() => {
    O();
  }, [O]);
  const v = (W) => {
    D((oe) => {
      const se = new Set(oe);
      return se.has(W) ? se.delete(W) : se.add(W), se;
    });
  }, m = () => D(/* @__PURE__ */ new Set()), K = () => D(new Set(x.map((W) => W.name))), re = () => {
    j ? (m(), ae(!1)) : ae(!0);
  }, he = async () => {
    const W = Array.from(S);
    if (W.length !== 0) {
      U(!0);
      try {
        const { results: oe } = await Bn(e, W), se = Object.entries(oe).filter(
          ([, V]) => V.success === !1
        ), le = W.length - se.length;
        se.length > 0 ? w.warning(
          `批量启用完成：成功 ${le} 个，失败 ${se.length} 个`
        ) : w.success(`成功启用 ${W.length} 个技能`), m(), await O();
      } catch (oe) {
        w.error(oe.message || "批量启用失败");
      } finally {
        U(!1);
      }
    }
  }, Q = async () => {
    const W = Array.from(S);
    if (W.length !== 0) {
      U(!0);
      try {
        const { results: oe } = await jn(e, W), se = Object.entries(oe).filter(
          ([, V]) => V.success === !1
        ), le = W.length - se.length;
        se.length > 0 ? w.warning(
          `批量停用完成：成功 ${le} 个，失败 ${se.length} 个`
        ) : w.success(`成功停用 ${W.length} 个技能`), m(), await O();
      } catch (oe) {
        w.error(oe.message || "批量停用失败");
      } finally {
        U(!1);
      }
    }
  }, me = () => {
    const W = Array.from(S);
    W.length !== 0 && p.confirm({
      title: `确认删除 ${W.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        U(!0);
        try {
          const { results: oe } = await Nn(e, W), se = Object.entries(oe).filter(
            ([, V]) => V.success === !1
          ), le = W.length - se.length;
          se.length > 0 ? w.warning(
            `批量删除完成：成功 ${le} 个，失败 ${se.length} 个`
          ) : w.success(`成功删除 ${W.length} 个技能`), m(), await O();
        } catch (oe) {
          w.error(oe.message || "批量删除失败");
        } finally {
          U(!1);
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
        te,
        { type: "secondary", style: { fontSize: 13 } },
        j ? `已选择 ${S.size} / ${x.length} 个技能` : `共 ${x.length} 个技能`
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        j ? n.createElement(
          n.Fragment,
          null,
          n.createElement(
            c,
            { size: "small", onClick: K },
            "全选"
          ),
          n.createElement(
            c,
            {
              size: "small",
              icon: z ? n.createElement(z) : void 0,
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
              disabled: S.size === 0 || X,
              loading: X,
              onClick: he
            },
            "批量启用"
          ),
          n.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: y ? n.createElement(y) : void 0,
              disabled: S.size === 0 || X,
              loading: X,
              onClick: Q
            },
            "批量停用"
          ),
          n.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: R ? n.createElement(R) : void 0,
              disabled: S.size === 0 || X,
              loading: X,
              onClick: me
            },
            `删除 (${S.size})`
          ),
          n.createElement(
            c,
            {
              size: "small",
              type: "primary",
              onClick: re
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
              icon: G ? n.createElement(G) : void 0,
              onClick: re,
              disabled: x.length === 0
            },
            "批量管理"
          ),
          n.createElement(
            c,
            {
              icon: Z ? n.createElement(Z) : void 0,
              onClick: O,
              loading: B,
              size: "small"
            },
            "刷新"
          )
        )
      )
    ),
    B ? n.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      n.createElement(i, { size: "large" })
    ) : x.length === 0 ? n.createElement(f, {
      description: "当前智能体未加载任何技能"
    }) : n.createElement(
      d,
      { gutter: [12, 12] },
      ...x.map(
        (W) => n.createElement(
          k,
          { key: W.name, xs: 24, sm: 12, md: 8, lg: 6 },
          n.createElement(
            b,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: j ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: j && S.has(W.name) ? "#0072f5" : void 0,
                borderWidth: j && S.has(W.name) ? 2 : 1
              },
              onClick: () => {
                j ? v(W.name) : (C(W), L(!0));
              }
            },
            j ? n.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (oe) => {
                  oe.stopPropagation(), v(W.name);
                }
              },
              n.createElement(P, {
                checked: S.has(W.name)
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
              W.emoji ? n.createElement(
                "span",
                { style: { fontSize: 18 } },
                W.emoji
              ) : n.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              n.createElement(
                te,
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
                W.name
              ),
              W.enabled === !1 ? n.createElement(
                h,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : n.createElement(
                h,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            W.description ? n.createElement(
              T,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              W.description
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
              W.version_text ? n.createElement(
                h,
                { style: { fontSize: 10 } },
                `v${W.version_text}`
              ) : null,
              ...(W.tags || []).slice(0, 3).map(
                (oe, se) => n.createElement(
                  h,
                  { key: se, color: "blue", style: { fontSize: 10 } },
                  oe
                )
              )
            )
          )
        )
      )
    ),
    // Skill detail drawer
    g ? n.createElement(
      M,
      {
        title: n.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          n.createElement(
            "span",
            { style: { fontSize: 18 } },
            g.emoji || "⚡"
          ),
          n.createElement("span", null, g.name)
        ),
        open: Y,
        onClose: () => L(!1),
        width: 520,
        extra: n.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: $ ? n.createElement($) : void 0,
            onClick: () => r("/skills")
          },
          "管理技能"
        )
      },
      n.createElement(
        q,
        { column: 1, bordered: !0, size: "small" },
        n.createElement(
          q.Item,
          { label: "技能名称" },
          g.name
        ),
        n.createElement(
          q.Item,
          { label: "描述" },
          g.description || "-"
        ),
        g.version_text ? n.createElement(
          q.Item,
          { label: "版本" },
          g.version_text
        ) : null,
        n.createElement(
          q.Item,
          { label: "来源" },
          g.source || "-"
        ),
        n.createElement(
          q.Item,
          { label: "状态" },
          g.enabled === !1 ? "已禁用" : "已启用"
        ),
        g.installed_from ? n.createElement(
          q.Item,
          { label: "安装来源" },
          g.installed_from
        ) : null
      ),
      // Tags
      g.tags && g.tags.length > 0 ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          te,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        n.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...g.tags.map(
            (W, oe) => n.createElement(h, { key: oe, color: "blue" }, W)
          )
        )
      ) : null,
      // Skill content preview
      g.content ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          te,
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
          g.content.slice(0, 2e3) + (g.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Sl({
  poolSkills: e,
  workspaceSkills: t,
  agents: r,
  loading: n,
  onReload: a
}) {
  const l = E().React, { useState: o, useMemo: i, useCallback: f } = l, {
    Spin: c,
    Empty: d,
    Input: k,
    Button: b,
    Row: h,
    Col: P,
    Card: p,
    Tag: I,
    Typography: M,
    Drawer: q,
    Descriptions: w,
    List: Z
  } = E().antd, {
    ReloadOutlined: N,
    SearchOutlined: $,
    DownloadOutlined: G,
    ThunderboltOutlined: F
  } = E().antdIcons || {}, { Text: y, Paragraph: R } = M, [z, te] = o(""), [T, x] = o(!1), [u, B] = o(null), [H, Y] = o([]), [L, g] = o(!1), [C, j] = o(24), ae = i(() => {
    if (!z.trim()) return e;
    const v = z.toLowerCase();
    return e.filter(
      (m) => {
        var K, re;
        return m.name.toLowerCase().includes(v) || ((K = m.description) == null ? void 0 : K.toLowerCase().includes(v)) || ((re = m.tags) == null ? void 0 : re.some((he) => he.toLowerCase().includes(v)));
      }
    );
  }, [e, z]), S = i(
    () => ae.slice(0, C),
    [ae, C]
  ), D = f((v) => {
    te(v), j(24);
  }, []), X = f(
    (v) => {
      const m = [];
      for (const K of t)
        if (K.skills.some((re) => re.name === v)) {
          const re = r.find((he) => he.id === K.agent_id);
          m.push((re == null ? void 0 : re.name) || K.agent_name || K.agent_id);
        }
      return m;
    },
    [t, r]
  ), U = f(
    async (v) => {
      if (B(v), Y(X(v.name)), x(!0), !v.content) {
        g(!0);
        try {
          const m = await xn(v.name);
          B({ ...v, content: m });
        } catch {
        } finally {
          g(!1);
        }
      }
    },
    [X]
  ), O = (v) => {
    window.history.pushState({}, "", v), window.dispatchEvent(new PopStateEvent("popstate"));
  };
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
          marginBottom: 16
        }
      },
      l.createElement(k, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: $ ? l.createElement($) : void 0,
        value: z,
        onChange: (v) => D(v.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        l.createElement(
          b,
          {
            icon: N ? l.createElement(N) : void 0,
            onClick: a,
            loading: n,
            size: "small"
          },
          "刷新"
        ),
        l.createElement(
          b,
          {
            type: "primary",
            icon: G ? l.createElement(G) : void 0,
            onClick: () => O("/skill-pool"),
            size: "small",
            style: Me
          },
          "管理技能池"
        )
      )
    ),
    n ? l.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      l.createElement(c, { size: "large" })
    ) : ae.length === 0 ? l.createElement(d, {
      description: z ? "未找到匹配的技能" : "技能池为空"
    }) : l.createElement(
      l.Fragment,
      null,
      l.createElement(
        h,
        { gutter: [12, 12] },
        ...S.map(
          (v) => l.createElement(
            P,
            { key: v.name, xs: 24, sm: 12, md: 8, lg: 6 },
            l.createElement(
              p,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => U(v)
              },
              l.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8
                  }
                },
                v.emoji ? l.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  v.emoji
                ) : l.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "⚡"
                ),
                l.createElement(
                  y,
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
                  v.name
                ),
                v.protected ? l.createElement(
                  I,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              v.description ? l.createElement(
                R,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                v.description
              ) : null,
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
                v.version_text ? l.createElement(
                  I,
                  { style: { fontSize: 10 } },
                  `v${v.version_text}`
                ) : null,
                ...(v.tags || []).slice(0, 3).map(
                  (m, K) => l.createElement(
                    I,
                    { key: K, color: "cyan", style: { fontSize: 10 } },
                    m
                  )
                )
              )
            )
          )
        ),
        // Load more button
        S.length < ae.length ? l.createElement(
          "div",
          { style: { textAlign: "center", marginTop: 16 } },
          l.createElement(
            b,
            {
              onClick: () => j((v) => v + 24),
              size: "small"
            },
            `加载更多 (剩余 ${ae.length - S.length} 个)`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    u ? l.createElement(
      q,
      {
        title: l.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          l.createElement(
            "span",
            { style: { fontSize: 18 } },
            u.emoji || "⚡"
          ),
          l.createElement("span", null, u.name)
        ),
        open: T,
        onClose: () => x(!1),
        width: 520,
        extra: l.createElement(
          b,
          {
            type: "primary",
            size: "small",
            icon: F ? l.createElement(F) : void 0,
            onClick: () => O("/skills")
          },
          "管理技能"
        )
      },
      l.createElement(
        w,
        { column: 1, bordered: !0, size: "small" },
        l.createElement(
          w.Item,
          { label: "技能名称" },
          u.name
        ),
        l.createElement(
          w.Item,
          { label: "描述" },
          u.description || "-"
        ),
        u.version_text ? l.createElement(
          w.Item,
          { label: "版本" },
          u.version_text
        ) : null,
        l.createElement(
          w.Item,
          { label: "来源" },
          u.source || "-"
        ),
        l.createElement(
          w.Item,
          { label: "受保护" },
          u.protected ? "是（内置）" : "否"
        ),
        u.sync_status ? l.createElement(
          w.Item,
          { label: "同步状态" },
          u.sync_status
        ) : null,
        u.installed_from ? l.createElement(
          w.Item,
          { label: "安装来源" },
          u.installed_from
        ) : null
      ),
      // Tags
      u.tags && u.tags.length > 0 ? l.createElement(
        "div",
        { style: { marginTop: 16 } },
        l.createElement(
          y,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        l.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...u.tags.map(
            (v, m) => l.createElement(I, { key: m, color: "cyan" }, v)
          )
        )
      ) : null,
      // Installed agents
      l.createElement(
        "div",
        { style: { marginTop: 16 } },
        l.createElement(
          y,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${H.length})`
        ),
        H.length > 0 ? l.createElement(Z, {
          size: "small",
          dataSource: H,
          renderItem: (v) => l.createElement(
            Z.Item,
            null,
            l.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              l.createElement(Le, { name: v, size: 20 }),
              l.createElement(
                y,
                { style: { fontSize: 13 } },
                v
              )
            )
          )
        }) : l.createElement(
          y,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      L ? l.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        l.createElement(c, { size: "small" })
      ) : u.content ? l.createElement(
        "div",
        { style: { marginTop: 16 } },
        l.createElement(
          y,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "技能内容"
        ),
        l.createElement(
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
function xl() {
  const e = E().React, { useState: t, useEffect: r, useCallback: n, useMemo: a } = e, { Tabs: l, message: o } = E().antd, { ThunderboltOutlined: i, AppstoreOutlined: f } = E().antdIcons || {}, d = E().useSelectedAgent, k = d ? d() : null, b = (k == null ? void 0 : k.id) || "default", [h, P] = t([]), [p, I] = t([]), [M, q] = t([]), [w, Z] = t(!0), [N, $] = t("agent-skills"), G = n(async () => {
    Z(!0);
    try {
      const [z, te, T] = await Promise.all([
        ht(!0),
        Et(),
        wn()
      ]);
      I(z), P(te), q(T);
    } catch (z) {
      o.error(z.message || "加载技能列表失败"), I([]);
    } finally {
      Z(!1);
    }
  }, []);
  r(() => {
    G();
  }, [G]);
  const F = a(() => {
    const z = h.find((te) => te.id === b);
    return (z == null ? void 0 : z.name) || b;
  }, [h, b]), y = (z) => {
    window.history.pushState({}, "", z), window.dispatchEvent(new PopStateEvent("popstate"));
  }, R = [
    {
      key: "agent-skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        i ? e.createElement(i, { style: { fontSize: 14 } }) : null,
        "当前Agent加载技能"
      ),
      children: e.createElement(bl, {
        agentId: b,
        agentName: F,
        onNavigate: y
      })
    },
    {
      key: "skill-pool",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        f ? e.createElement(f, { style: { fontSize: 14 } }) : null,
        "技能池"
      ),
      children: e.createElement(Sl, {
        poolSkills: p,
        workspaceSkills: M,
        agents: h,
        loading: w,
        onReload: G
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(ct, {
      title: "技能",
      subtitle: `技能池共 ${p.length} 个技能 · 当前智能体：${F}`
    }),
    e.createElement(l, {
      items: R,
      activeKey: N,
      onChange: (z) => $(z)
    })
  );
}
const yt = "ugsci.market.githubSources", Mt = "https://github.com/anthropics/skills/tree/main/skills", nn = "ugsci.market.mcpSources", ln = "ugsci.market.expertSources";
function an(e, t) {
  try {
    const r = localStorage.getItem(e);
    if (!r) return [];
    const n = JSON.parse(r);
    return Array.isArray(n) ? n.filter(
      (a) => a && typeof a.id == "string" && typeof a.label == "string" && typeof a.url == "string"
    ).map((a) => ({
      id: a.id,
      label: a.label,
      url: a.url,
      enabled: a.enabled !== !1,
      type: t
    })) : [];
  } catch {
    return [];
  }
}
function rn(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function wl() {
  return an(nn, "mcp");
}
function nt(e) {
  rn(nn, e);
}
function Cl() {
  return an(ln, "expert");
}
function lt(e) {
  rn(ln, e);
}
function on(e) {
  try {
    const t = new URL(e.trim()), r = t.hostname.toLowerCase();
    if (r !== "github.com" && r !== "www.github.com") return null;
    const n = t.pathname.split("/").filter((f) => f.length > 0);
    if (n.length < 2) return null;
    const a = decodeURIComponent(n[0]), l = decodeURIComponent(n[1]);
    let o = "main", i = "";
    return n.length >= 4 && (n[2] === "tree" || n[2] === "blob") ? (o = decodeURIComponent(n[3]), n.length > 4 && (i = n.slice(4).map(decodeURIComponent).join("/"))) : n.length > 2 && (i = n.slice(2).map(decodeURIComponent).join("/")), i = i.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: a,
      repo: l,
      ref: o || "main",
      skillsPath: i,
      label: `${a}/${l}`
    };
  } catch {
    return null;
  }
}
function sn(e, t, r) {
  return `${e}/${t}:${r || "/"}`;
}
function kl() {
  try {
    const e = localStorage.getItem(yt);
    if (!e) {
      const r = on(Mt);
      if (r) {
        const n = [
          {
            id: sn(
              r.owner,
              r.repo,
              r.skillsPath
            ),
            url: Mt,
            label: r.label,
            owner: r.owner,
            repo: r.repo,
            ref: r.ref,
            skillsPath: r.skillsPath,
            enabled: !0
          }
        ];
        return localStorage.setItem(yt, JSON.stringify(n)), n;
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
function ut(e) {
  try {
    localStorage.setItem(
      yt,
      JSON.stringify(e)
    );
  } catch {
  }
}
function Tl(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const r = t[1], n = {}, a = r.split(`
`);
  let l = "";
  for (const o of a) {
    const i = o.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (i) {
      l = i[1];
      let f = i[2].trim();
      (f.startsWith('"') && f.endsWith('"') || f.startsWith("'") && f.endsWith("'")) && (f = f.slice(1, -1)), l === "name" ? n.name = f : l === "description" ? n.description = f : l === "version" ? n.version = f : l === "author" && (n.author = f);
    }
  }
  return n;
}
async function Il(e) {
  const t = e.skillsPath ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/") : "", r = `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${t}?ref=${encodeURIComponent(e.ref)}`, n = await fetch(r, {
    headers: { Accept: "application/vnd.github+json" }
  });
  if (!n.ok)
    throw new Error(
      `GitHub API ${n.status}: ${e.label} (${e.skillsPath || "/"})`
    );
  const a = await n.json();
  if (!Array.isArray(a)) return [];
  const l = a.filter(
    (i) => i.type === "dir" && i.name
  );
  return await Promise.all(
    l.map(async (i) => {
      const f = `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${e.skillsPath ? e.skillsPath + "/" : ""}${i.name}/SKILL.md`, c = `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${e.skillsPath ? e.skillsPath + "/" : ""}${i.name}`, d = {
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
        const k = await fetch(f);
        if (!k.ok) return d;
        const b = await k.text(), h = Tl(b);
        return {
          ...d,
          name: h.name || i.name,
          description: h.description || "",
          version: h.version || null,
          author: h.author || null
        };
      } catch {
        return d;
      }
    })
  );
}
async function zl(e) {
  const t = e.filter((l) => l.enabled), r = await Promise.all(
    t.map(async (l) => {
      try {
        return { skills: await Il(l), error: null, label: l.label };
      } catch (o) {
        return {
          skills: [],
          error: o.message || String(o),
          label: l.label
        };
      }
    })
  ), n = [], a = [];
  for (const l of r)
    n.push(...l.skills), l.error && a.push({ label: l.label, message: l.error });
  return { skills: n, errors: a };
}
function Pl({
  open: e,
  onClose: t,
  sources: r,
  onChange: n
}) {
  const a = E().React, { useState: l } = a, {
    Modal: o,
    Input: i,
    Button: f,
    List: c,
    Tag: d,
    Switch: k,
    Typography: b,
    Tooltip: h,
    message: P
  } = E().antd, {
    PlusOutlined: p,
    DeleteOutlined: I,
    LinkOutlined: M,
    GithubOutlined: q
  } = E().antdIcons || {}, { Text: w } = b, [Z, N] = l(""), $ = () => {
    const y = Z.trim();
    if (!y) return;
    const R = on(y);
    if (!R) {
      P.error("无效的 GitHub URL，请输入类似 https://github.com/owner/repo/tree/main/skills 的链接");
      return;
    }
    const z = sn(R.owner, R.repo, R.skillsPath);
    if (r.some((x) => x.id === z)) {
      P.warning("该源已存在");
      return;
    }
    const te = {
      id: z,
      url: y,
      label: R.label,
      owner: R.owner,
      repo: R.repo,
      ref: R.ref,
      skillsPath: R.skillsPath,
      enabled: !0
    }, T = [...r, te];
    ut(T), n(T), N(""), P.success(`已添加源: ${R.label}`);
  }, G = (y, R) => {
    const z = r.map(
      (te) => te.id === y ? { ...te, enabled: R } : te
    );
    ut(z), n(z);
  }, F = (y) => {
    const R = r.filter((z) => z.id !== y);
    ut(R), n(R), P.success("已移除源");
  };
  return a.createElement(
    o,
    {
      open: e,
      onCancel: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        q ? a.createElement(q, { style: { fontSize: 18 } }) : null,
        a.createElement("span", null, "配置技能源")
      ),
      footer: a.createElement(
        f,
        { onClick: t },
        "关闭"
      ),
      width: 640
    },
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        w,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(i, {
          placeholder: "https://github.com/anthropics/skills/tree/main/skills",
          value: Z,
          onChange: (y) => N(y.target.value),
          onPressEnter: $,
          prefix: M ? a.createElement(M) : void 0,
          style: { flex: 1 }
        }),
        a.createElement(
          f,
          {
            type: "primary",
            icon: p ? a.createElement(p) : void 0,
            onClick: $
          },
          "添加"
        )
      )
    ),
    a.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      a.createElement(w, { strong: !0 }, `已配置源 (${r.length})`)
    ),
    a.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: r,
      renderItem: (y) => a.createElement(
        c.Item,
        {
          actions: [
            a.createElement(
              h,
              { title: y.enabled ? "点击禁用" : "点击启用" },
              a.createElement(k, {
                size: "small",
                checked: y.enabled,
                onChange: (R) => G(y.id, R)
              })
            ),
            a.createElement(
              h,
              { title: "移除此源" },
              a.createElement(
                f,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: I ? a.createElement(I) : void 0,
                  onClick: () => F(y.id)
                }
              )
            )
          ]
        },
        a.createElement(
          "div",
          { style: { flex: 1, minWidth: 0 } },
          a.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
            a.createElement(
              d,
              { color: "blue", style: { fontSize: 11 } },
              y.label
            ),
            y.skillsPath ? a.createElement(
              w,
              { type: "secondary", style: { fontSize: 11 } },
              `/${y.skillsPath}`
            ) : null,
            a.createElement(
              w,
              { type: "secondary", style: { fontSize: 11 } },
              `@${y.ref}`
            )
          ),
          a.createElement(
            w,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            y.url
          )
        )
      )
    })
  );
}
function $t({
  open: e,
  onClose: t,
  sources: r,
  onChange: n,
  type: a
}) {
  const l = E().React, { useState: o } = l, {
    Modal: i,
    Input: f,
    Button: c,
    List: d,
    Tag: k,
    Switch: b,
    Typography: h,
    Tooltip: P,
    message: p
  } = E().antd, {
    PlusOutlined: I,
    DeleteOutlined: M,
    LinkOutlined: q,
    ApiOutlined: w,
    UserOutlined: Z,
    ImportOutlined: N,
    ExportOutlined: $,
    CopyOutlined: G
  } = E().antdIcons || {}, { Text: F } = h, [y, R] = o(""), [z, te] = o(""), [T, x] = o(""), [u, B] = o(!1), H = a === "mcp" ? "MCP" : "专家模板", Y = a === "mcp" ? w ? l.createElement(w, { style: { fontSize: 18 } }) : null : Z ? l.createElement(Z, { style: { fontSize: 18 } }) : null, L = () => {
    const S = y.trim(), D = z.trim();
    if (!S) return;
    const X = D || S.slice(0, 40), U = `${a}:${S}`;
    if (r.some((m) => m.id === U)) {
      p.warning("该源已存在");
      return;
    }
    const O = {
      id: U,
      label: X,
      url: S,
      enabled: !0,
      type: a
    }, v = [...r, O];
    a === "mcp" ? nt(v) : lt(v), n(v), R(""), te(""), p.success(`已添加${H}源: ${X}`);
  }, g = (S, D) => {
    const X = r.map(
      (U) => U.id === S ? { ...U, enabled: D } : U
    );
    a === "mcp" ? nt(X) : lt(X), n(X);
  }, C = (S) => {
    const D = r.filter((X) => X.id !== S);
    a === "mcp" ? nt(D) : lt(D), n(D), p.success("已移除源");
  }, j = () => {
    const S = JSON.stringify(
      { type: a, sources: r },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(S), p.success(`${H}源已复制到剪贴板（${r.length} 个源）`);
    } catch {
      const D = document.createElement("textarea");
      D.value = S, document.body.appendChild(D), D.select(), document.execCommand("copy"), document.body.removeChild(D), p.success(`${H}源已复制到剪贴板（${r.length} 个源）`);
    }
  }, ae = () => {
    const S = T.trim();
    if (!S) {
      p.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const D = JSON.parse(S);
      let X = [];
      if (Array.isArray(D))
        X = D;
      else if (D && Array.isArray(D.sources))
        X = D.sources;
      else if (D && typeof D == "object")
        X = [D];
      else
        throw new Error("Invalid format");
      const U = X.filter(
        (K) => K && typeof K.url == "string" && typeof K.label == "string"
      );
      if (U.length === 0) {
        p.error("未找到有效的源数据");
        return;
      }
      const O = new Set(r.map((K) => K.id)), v = [];
      for (const K of U) {
        const re = K.id || `${a}:${K.url}`;
        O.has(re) || v.push({
          id: re,
          label: K.label,
          url: K.url,
          enabled: K.enabled !== !1,
          type: a
        });
      }
      if (v.length === 0) {
        p.info("所有源均已存在，无新增");
        return;
      }
      const m = [...r, ...v];
      a === "mcp" ? nt(m) : lt(m), n(m), x(""), B(!1), p.success(`成功导入 ${v.length} 个${H}源`);
    } catch (D) {
      p.error(`JSON 解析失败: ${D.message || "格式错误"}`);
    }
  };
  return l.createElement(
    i,
    {
      open: e,
      onCancel: t,
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        Y,
        l.createElement("span", null, `配置${H}源`)
      ),
      footer: l.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between" } },
        l.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          l.createElement(
            c,
            {
              icon: $ ? l.createElement($) : void 0,
              onClick: j,
              disabled: r.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          l.createElement(
            c,
            {
              icon: N ? l.createElement(N) : void 0,
              onClick: () => B(!u),
              size: "small"
            },
            u ? "隐藏导入" : "导入JSON"
          )
        ),
        l.createElement(
          c,
          { onClick: t },
          "关闭"
        )
      ),
      width: 680
    },
    // Description
    l.createElement(
      F,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${H}源地址，支持从远程仓库或团队共享的 JSON 导入${H}配置。`
    ),
    // Import section (collapsible)
    u ? l.createElement(
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
      l.createElement(
        F,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${H}源 JSON（支持从导出的剪贴板内容粘贴）`
      ),
      l.createElement(f.TextArea, {
        placeholder: a === "mcp" ? `{
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
        value: T,
        onChange: (S) => x(S.target.value),
        autoSize: { minRows: 4, maxRows: 10 },
        style: { fontFamily: "monospace", fontSize: 12 }
      }),
      l.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8 } },
        l.createElement(
          c,
          {
            type: "primary",
            size: "small",
            onClick: ae
          },
          "导入"
        ),
        l.createElement(
          c,
          {
            size: "small",
            onClick: () => x("")
          },
          "清空"
        )
      )
    ) : null,
    // Add new source
    l.createElement(
      "div",
      { style: { marginBottom: 16, display: "flex", gap: 8, alignItems: "center" } },
      l.createElement(f, {
        placeholder: "源名称（可选，如：团队MCP仓库）",
        value: z,
        onChange: (S) => te(S.target.value),
        style: { width: 200 }
      }),
      l.createElement(f, {
        placeholder: a === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: y,
        onChange: (S) => R(S.target.value),
        onPressEnter: L,
        prefix: q ? l.createElement(q) : void 0,
        style: { flex: 1 }
      }),
      l.createElement(
        c,
        {
          type: "primary",
          icon: I ? l.createElement(I) : void 0,
          onClick: L
        },
        "添加"
      )
    ),
    // Source list
    l.createElement(
      "div",
      {
        style: {
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }
      },
      l.createElement(
        F,
        { strong: !0 },
        `已配置源 (${r.length})`
      )
    ),
    l.createElement(d, {
      size: "small",
      bordered: !0,
      dataSource: r,
      renderItem: (S) => l.createElement(
        d.Item,
        {
          actions: [
            l.createElement(
              P,
              { title: S.enabled ? "点击禁用" : "点击启用" },
              l.createElement(b, {
                size: "small",
                checked: S.enabled,
                onChange: (D) => g(S.id, D)
              })
            ),
            l.createElement(
              P,
              { title: "移除此源" },
              l.createElement(
                c,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: M ? l.createElement(M) : void 0,
                  onClick: () => C(S.id)
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
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4
              }
            },
            l.createElement(
              k,
              {
                color: a === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              S.label
            ),
            S.enabled ? null : l.createElement(
              k,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          l.createElement(
            F,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            S.url
          )
        )
      )
    }),
    // Share hint
    l.createElement(
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
      l.createElement(
        "span",
        null,
        "💡 ",
        "点击「导出到剪贴板」可复制所有源配置，分享给团队成员后粘贴到「导入JSON」即可快速配置。"
      )
    )
  );
}
async function _l() {
  return ne("/market/providers");
}
async function Ol(e) {
  return ne(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Al(e, t, r, n, a) {
  return ne("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: t,
      limit: r,
      lang: n,
      category: a || void 0
    })
  });
}
async function Rt(e, t, r) {
  return ne("/skills/hub/install/start", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({
      bundle_url: t,
      enable: r
    })
  });
}
async function Lt(e, t) {
  return ne(
    `/skills/hub/install/status/${encodeURIComponent(t)}`,
    {
      headers: { "X-Agent-Id": e }
    }
  );
}
function Ml() {
  const e = E().React, { useState: t, useEffect: r, useCallback: n, useMemo: a, useRef: l } = e, {
    Spin: o,
    Empty: i,
    Input: f,
    Button: c,
    message: d,
    Row: k,
    Col: b,
    Card: h,
    Tag: P,
    Tooltip: p,
    Typography: I,
    Select: M,
    Drawer: q,
    Descriptions: w,
    Tabs: Z,
    Badge: N,
    Progress: $
  } = E().antd, {
    ReloadOutlined: G,
    SearchOutlined: F,
    DownloadOutlined: y,
    AppstoreOutlined: R,
    ShopOutlined: z,
    CheckCircleOutlined: te,
    LoadingOutlined: T,
    UserOutlined: x,
    SettingOutlined: u,
    GithubOutlined: B,
    ApiOutlined: H
  } = E().antdIcons || {}, { Text: Y, Paragraph: L, Title: g } = I, [C, j] = t("skills"), [ae, S] = t([]), [D, X] = t([]), [U, O] = t([]), [v, m] = t(""), [K, re] = t(""), [he, Q] = t(!1), [me, W] = t(!1), [oe, se] = t(
    {}
  ), [le, V] = t(null), [pe, de] = t({}), [ze, Te] = t([]), [_, ie] = t(""), [ge, we] = t(""), [Se, Ce] = t(""), [$e, Ue] = t({}), [Oe, Fe] = t(""), [Ge, Be] = t(/* @__PURE__ */ new Set()), [Re, je] = t([]), [He, ee] = t([]), [ce, A] = t(!1), [ke, xe] = t(!1), [be, Ie] = t(""), [We, ye] = t([]), [mt, Ye] = t(!1), [Qe, Ne] = t([]), [cn, xt] = t(!1), qe = l(null);
  r(() => {
    Promise.all([
      _l().catch(() => []),
      Ol("zh").catch(() => []),
      Et().catch(() => [])
    ]).then(([s, J, ue]) => {
      S(s), X(J), Te(ue), ue.length > 0 && (ie(ue[0].id), Fe(ue[0].id));
    });
  }, []);
  const Ze = n(async (s) => {
    const J = s ?? kl();
    if (je(s || J), J.filter((fe) => fe.enabled).length === 0) {
      ee([]);
      return;
    }
    A(!0);
    try {
      const { skills: fe, errors: Pe } = await zl(J);
      if (ee(fe), Pe.length > 0) {
        for (const Ee of Pe)
          console.warn(`[ugsci] GitHub source '${Ee.label}' error: ${Ee.message}`);
        d.warning(
          `部分源加载失败: ${Pe.map((Ee) => Ee.label).join(", ")}`
        );
      }
    } catch (fe) {
      d.error(fe.message || "加载 GitHub 技能源失败"), ee([]);
    } finally {
      A(!1);
    }
  }, []);
  r(() => {
    Ze(), ye(wl()), Ne(Cl());
  }, [Ze]);
  const et = n(
    async (s, J, ue) => {
      Q(!0);
      try {
        const fe = await Al(
          s,
          ue,
          20,
          "zh",
          J || void 0
        );
        ue === void 0 || Object.keys(ue).length === 0 ? O(fe.results) : O((ve) => [...ve, ...fe.results]);
        const Pe = Object.values(fe.by_provider || {}).some(
          (ve) => ve.has_more
        );
        W(Pe);
        const Ee = {};
        for (const [ve, _e] of Object.entries(fe.by_provider || {}))
          Ee[ve] = (ue[ve] || 1) + 1;
        if (se(Ee), fe.errors.length > 0)
          for (const ve of fe.errors)
            console.warn(
              `[ugsci] Market provider '${ve.provider}' error: ${ve.message}`
            );
      } catch (fe) {
        d.error(fe.message || "搜索市场失败"), O([]);
      } finally {
        Q(!1);
      }
    },
    []
  );
  r(() => (qe.current && clearTimeout(qe.current), qe.current = setTimeout(() => {
    et(v, K, {});
  }, 400), () => {
    qe.current && clearTimeout(qe.current);
  }), [v, K, et]);
  const mn = () => {
    et(v, K, oe);
  }, wt = async (s) => {
    var ue;
    if (!_) {
      d.warning("请先选择安装目标专家");
      return;
    }
    const J = `${s.source}:${s.slug}`;
    try {
      de((Ee) => ({ ...Ee, [J]: "starting" }));
      const fe = await Rt(
        _,
        s.source_url,
        !0
      );
      de((Ee) => ({ ...Ee, [J]: "installing" }));
      const Pe = 60;
      for (let Ee = 0; Ee < Pe; Ee++) {
        await new Promise((_e) => setTimeout(_e, 2e3));
        const ve = await Lt(
          _,
          fe.task_id
        );
        if (ve.status === "completed" && ((ue = ve.result) != null && ue.installed)) {
          d.success(`技能「${ve.result.name || s.name}」安装成功`), de((_e) => {
            const Ae = { ..._e };
            return delete Ae[J], Ae;
          });
          return;
        }
        if (ve.status === "failed")
          throw new Error(ve.error || "安装失败");
        if (ve.status === "cancelled") {
          d.info("安装已取消"), de((_e) => {
            const Ae = { ..._e };
            return delete Ae[J], Ae;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (fe) {
      d.error(fe.message || "安装技能失败"), de((Pe) => {
        const Ee = { ...Pe };
        return delete Ee[J], Ee;
      });
    }
  }, dn = (s) => {
    window.history.pushState({}, "", s), window.dispatchEvent(new PopStateEvent("popstate"));
  }, un = async (s) => {
    var ue;
    if (!_) {
      d.warning("请先选择安装目标专家");
      return;
    }
    const J = `github:${s.sourceId}:${s.name}`;
    try {
      de((Ee) => ({ ...Ee, [J]: "starting" }));
      const fe = await Rt(
        _,
        s.source_url,
        !0
      );
      de((Ee) => ({ ...Ee, [J]: "installing" }));
      const Pe = 60;
      for (let Ee = 0; Ee < Pe; Ee++) {
        await new Promise((_e) => setTimeout(_e, 2e3));
        const ve = await Lt(
          _,
          fe.task_id
        );
        if (ve.status === "completed" && ((ue = ve.result) != null && ue.installed)) {
          d.success(`技能「${ve.result.name || s.name}」安装成功`), de((_e) => {
            const Ae = { ..._e };
            return delete Ae[J], Ae;
          });
          return;
        }
        if (ve.status === "failed")
          throw new Error(ve.error || "安装失败");
        if (ve.status === "cancelled") {
          d.info("安装已取消"), de((_e) => {
            const Ae = { ..._e };
            return delete Ae[J], Ae;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (fe) {
      d.error(fe.message || "安装技能失败"), de((Pe) => {
        const Ee = { ...Pe };
        return delete Ee[J], Ee;
      });
    }
  }, dt = a(() => {
    let s = He;
    if (be && (s = s.filter((J) => J.sourceLabel === be)), v.trim()) {
      const J = v.toLowerCase();
      s = s.filter(
        (ue) => {
          var fe;
          return ue.name.toLowerCase().includes(J) || ((fe = ue.description) == null ? void 0 : fe.toLowerCase().includes(J));
        }
      );
    }
    return s;
  }, [He, v, be]), tt = ae.filter((s) => s.available), Je = a(() => {
    if (!be) return U;
    const s = tt.find(
      (J) => J.label === be
    );
    return s ? U.filter((J) => J.source === s.key) : U;
  }, [U, be, tt]), Ct = a(() => {
    const s = /* @__PURE__ */ new Set();
    return Re.filter((J) => J.enabled).forEach((J) => s.add(J.label)), tt.forEach((J) => s.add(J.label)), Array.from(s);
  }, [Re, tt]), pn = e.createElement(
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
      e.createElement(f, {
        placeholder: "搜索技能市场...",
        prefix: F ? e.createElement(F) : void 0,
        value: v,
        onChange: (s) => m(s.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      D.length > 0 ? e.createElement(M, {
        value: K || void 0,
        onChange: (s) => re(s || ""),
        placeholder: "全部分类",
        allowClear: !0,
        style: { minWidth: 150 },
        options: [
          { value: "", label: "全部分类" },
          ...D.map((s) => ({ value: s.id, label: s.label }))
        ]
      }) : null,
      // Install target selector
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 4 } },
        e.createElement(
          Y,
          { type: "secondary", style: { fontSize: 12 } },
          "安装到"
        ),
        e.createElement(M, {
          value: _ || void 0,
          onChange: (s) => ie(s),
          style: { minWidth: 140 },
          placeholder: "选择专家",
          options: ze.map((s) => ({ value: s.id, label: s.name }))
        })
      ),
      // Configure skill source button
      e.createElement(
        c,
        {
          icon: B ? e.createElement(B) : void 0,
          onClick: () => xe(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Source filter tags (GitHub sources + market providers)
    Ct.length > 0 ? e.createElement(
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
        Y,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "来源筛选:"
      ),
      e.createElement(
        P,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: be === "" ? "blue" : void 0,
          onClick: () => Ie("")
        },
        "全部"
      ),
      ...Ct.map(
        (s) => e.createElement(
          P,
          {
            key: s,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: be === s ? "blue" : void 0,
            icon: B && Re.some((J) => J.label === s) ? e.createElement(B) : void 0,
            onClick: () => Ie(
              be === s ? "" : s
            )
          },
          s
        )
      )
    ) : null,
    // GitHub skills section
    ce && He.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      e.createElement(o, {
        tip: "正在从 GitHub 加载技能...",
        size: "large"
      })
    ) : dt.length > 0 ? e.createElement(
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
        B ? e.createElement(B, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        e.createElement(
          Y,
          { strong: !0, style: { fontSize: 13 } },
          `GitHub 技能源 (${dt.length})`
        )
      ),
      e.createElement(
        k,
        { gutter: [12, 12] },
        ...dt.map((s) => {
          const J = `github:${s.sourceId}:${s.name}`, ue = pe[J];
          return e.createElement(
            b,
            { key: J, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              h,
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
                B ? e.createElement(B, {
                  style: { fontSize: 18, color: "#57606a" }
                }) : e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                e.createElement(
                  p,
                  { title: s.name },
                  e.createElement(
                    Y,
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
                    s.name
                  )
                )
              ),
              e.createElement(
                L,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                s.description || "暂无描述"
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
                    P,
                    { color: "blue", style: { fontSize: 10 } },
                    s.sourceLabel
                  ),
                  s.version ? e.createElement(
                    P,
                    { style: { fontSize: 10 } },
                    `v${s.version}`
                  ) : null
                ),
                ue ? e.createElement(
                  c,
                  {
                    size: "small",
                    disabled: !0,
                    icon: T ? e.createElement(T) : void 0
                  },
                  ue === "starting" ? "启动中" : "安装中"
                ) : e.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: y ? e.createElement(y) : void 0,
                    onClick: () => un(s)
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
    Je.length > 0 || he ? e.createElement(
      "div",
      {
        style: {
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      z ? e.createElement(z, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      e.createElement(
        Y,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${Je.length > 0 ? ` (${Je.length})` : ""}`
      )
    ) : null,
    // Results grid
    he && Je.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(o, { size: "large" })
    ) : Je.length === 0 ? e.createElement(i, {
      description: v ? `未找到匹配「${v}」的技能` : "输入关键词搜索技能市场",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      k,
      { gutter: [12, 12] },
      ...Je.map((s) => {
        const J = `${s.source}:${s.slug}`, ue = pe[J];
        return e.createElement(
          b,
          { key: J, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            h,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => V(s)
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
              s.icon_url ? e.createElement("img", {
                src: s.icon_url,
                alt: s.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : e.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              e.createElement(
                p,
                { title: s.name },
                e.createElement(
                  Y,
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
                  s.name
                )
              )
            ),
            e.createElement(
              L,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              s.description || "暂无描述"
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
                  P,
                  { color: "geekblue", style: { fontSize: 10 } },
                  s.source
                ),
                s.version ? e.createElement(
                  P,
                  { style: { fontSize: 10 } },
                  `v${s.version}`
                ) : null
              ),
              ue ? e.createElement(
                c,
                {
                  size: "small",
                  disabled: !0,
                  icon: T ? e.createElement(T) : void 0
                },
                ue === "starting" ? "启动中" : "安装中"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: y ? e.createElement(y) : void 0,
                  onClick: (fe) => {
                    fe.stopPropagation(), wt(s);
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
        { onClick: mn, loading: he },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    le ? e.createElement(
      q,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          le.icon_url ? e.createElement("img", {
            src: le.icon_url,
            alt: le.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, le.name)
        ),
        open: !0,
        onClose: () => V(null),
        width: 480,
        extra: e.createElement(
          c,
          {
            type: "primary",
            icon: y ? e.createElement(y) : void 0,
            onClick: () => {
              wt(le);
            }
          },
          "安装到专家"
        )
      },
      e.createElement(
        w,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          w.Item,
          { label: "来源" },
          le.source
        ),
        e.createElement(
          w.Item,
          { label: "描述" },
          le.description || "-"
        ),
        le.version ? e.createElement(
          w.Item,
          { label: "版本" },
          le.version
        ) : null,
        le.author ? e.createElement(
          w.Item,
          { label: "作者" },
          le.author
        ) : null,
        e.createElement(
          w.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: le.source_url, target: "_blank" },
            le.source_url
          )
        )
      ),
      le.stats ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          Y,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "统计"
        ),
        e.createElement(
          "div",
          { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
          ...Object.entries(le.stats).map(
            ([s, J]) => e.createElement(
              "div",
              { key: s, style: { textAlign: "center" } },
              e.createElement(
                "div",
                {
                  style: {
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#1677ff"
                  }
                },
                String(J)
              ),
              e.createElement(
                Y,
                { type: "secondary", style: { fontSize: 11 } },
                s
              )
            )
          )
        )
      ) : null
    ) : null
  ), gn = a(() => {
    if (!ge.trim()) return pt;
    const s = ge.toLowerCase();
    return pt.filter(
      (J) => J.name.toLowerCase().includes(s) || J.description.toLowerCase().includes(s) || J.category.toLowerCase().includes(s)
    );
  }, [ge]), yn = async (s) => {
    try {
      const J = await ne("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: s.name,
          description: s.description,
          skill_names: s.recommendedSkills
        })
      });
      await ot(J.id, "AGENTS.md", s.systemPrompt);
      const ue = await st(J.id);
      ue.approval_level = s.approvalLevel, await ne(`/agents/${encodeURIComponent(J.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ue)
      }), d.success(`专家「${s.name}」创建成功，已跳转至专家`), dn("/ugsci-experts");
    } catch (J) {
      d.error(J.message || "创建专家失败");
    }
  }, kt = n(async (s) => {
    if (s)
      try {
        const J = await bt(s);
        Be(new Set(J.map((ue) => ue.key)));
      } catch {
        Be(/* @__PURE__ */ new Set());
      }
  }, []);
  r(() => {
    Oe && kt(Oe);
  }, [Oe, kt]);
  const fn = async (s) => {
    if (!Oe) {
      d.warning("请先选择目标专家");
      return;
    }
    Ue((J) => ({ ...J, [s.id]: !0 }));
    try {
      const J = s.id;
      await Kt(Oe, {
        client_key: J,
        client: {
          name: s.name,
          description: s.description,
          enabled: !0,
          transport: s.transport,
          url: s.url || "",
          command: s.command || "",
          args: s.args || [],
          env: s.env || {},
          cwd: s.cwd || "",
          headers: s.headers || {}
        }
      }), d.success(`MCP「${s.name}」已添加到当前专家`), Be((ue) => new Set(ue).add(J));
    } catch (J) {
      d.error(J.message || `添加 MCP「${s.name}」失败`);
    } finally {
      Ue((J) => ({ ...J, [s.id]: !1 }));
    }
  }, En = a(() => {
    if (!Se.trim()) return Tt;
    const s = Se.toLowerCase();
    return Tt.filter(
      (J) => J.name.toLowerCase().includes(s) || J.description.toLowerCase().includes(s) || J.category.toLowerCase().includes(s)
    );
  }, [Se]), hn = e.createElement(
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
      e.createElement(f, {
        placeholder: "搜索 MCP 模板...",
        prefix: F ? e.createElement(F) : void 0,
        value: Se,
        onChange: (s) => Ce(s.target.value),
        allowClear: !0,
        style: { maxWidth: 300 }
      }),
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        e.createElement(
          Y,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "安装到："
        ),
        e.createElement(M, {
          value: Oe,
          onChange: (s) => Fe(s),
          style: { minWidth: 180 },
          size: "small",
          options: ze.map((s) => ({ value: s.id, label: s.name }))
        })
      ),
      // Configure MCP source button
      e.createElement(
        c,
        {
          icon: H ? e.createElement(H) : void 0,
          onClick: () => Ye(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // MCP template cards
    e.createElement(
      k,
      { gutter: [12, 12] },
      ...En.map(
        (s) => e.createElement(
          b,
          { key: s.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            h,
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
                s.emoji
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  Y,
                  { strong: !0, style: { fontSize: 14 } },
                  s.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  e.createElement(
                    P,
                    { color: "blue", style: { fontSize: 10 } },
                    s.category
                  ),
                  e.createElement(
                    P,
                    {
                      color: s.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    s.transport
                  ),
                  s.env && Object.keys(s.env).length > 0 ? e.createElement(
                    P,
                    { color: "orange", style: { fontSize: 10 } },
                    "需配置密钥"
                  ) : null
                )
              )
            ),
            // Description
            e.createElement(
              L,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              s.description
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
                Y,
                { type: "secondary", style: { fontSize: 11 } },
                s.transport === "stdio" ? `${s.command} ${(s.args || []).join(" ")}` : s.url || ""
              ),
              Ge.has(s.id) ? e.createElement(
                c,
                { size: "small", disabled: !0 },
                "已安装"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  loading: !!$e[s.id],
                  icon: H ? e.createElement(H) : void 0,
                  onClick: () => fn(s)
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
      z ? e.createElement(z, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        Y,
        { type: "secondary", style: { fontSize: 12 } },
        "更多 MCP 服务器模板持续更新中，也支持通过 JSON 配置自定义添加"
      )
    )
  ), vn = e.createElement(
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
      e.createElement(f, {
        placeholder: "搜索专家模板...",
        prefix: F ? e.createElement(F) : void 0,
        value: ge,
        onChange: (s) => we(s.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      e.createElement(
        c,
        {
          icon: x ? e.createElement(x) : void 0,
          onClick: () => xt(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    e.createElement(
      k,
      { gutter: [12, 12] },
      ...gn.map(
        (s) => e.createElement(
          b,
          { key: s.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            h,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => yn(s)
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
              e.createElement(Le, {
                name: s.name,
                size: 40
              }),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  Y,
                  { strong: !0, style: { fontSize: 14 } },
                  s.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4 } },
                  e.createElement(
                    P,
                    { color: "blue", style: { fontSize: 10 } },
                    s.category
                  ),
                  s.approvalLevel === "MANUAL" ? e.createElement(
                    P,
                    { color: "orange", style: { fontSize: 10 } },
                    "需审批"
                  ) : e.createElement(
                    P,
                    { color: "green", style: { fontSize: 10 } },
                    "自动"
                  )
                )
              )
            ),
            e.createElement(
              L,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              s.description.replace(/\*\*(.+?)\*\*/g, "$1")
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
                Y,
                { type: "secondary", style: { fontSize: 11 } },
                `推荐 ${s.recommendedSkills.length} 个技能`
              ),
              e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: R ? e.createElement(R) : void 0
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
      z ? e.createElement(z, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        Y,
        { type: "secondary", style: { fontSize: 12 } },
        "更多专家模板持续更新中，未来将支持 OpenScience、RPA 等行业扩展"
      )
    )
  ), bn = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        R ? e.createElement(R, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: pn
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        H ? e.createElement(H, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: hn
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        x ? e.createElement(x, { style: { fontSize: 14 } }) : null,
        "专家模板"
      ),
      children: vn
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(ct, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 创建专家模板 · 随时更新能力和专家",
      extra: e.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        e.createElement(
          c,
          {
            type: "primary",
            icon: G ? e.createElement(G) : void 0,
            onClick: () => {
              et(v, K, {}), Ze();
            },
            loading: he || ce
          },
          "刷新"
        )
      )
    }),
    e.createElement(Z, {
      items: bn,
      activeKey: C,
      onChange: (s) => j(s)
    }),
    // Skill source config modal
    e.createElement(Pl, {
      open: ke,
      onClose: () => xe(!1),
      sources: Re,
      onChange: (s) => {
        je(s), Ze(s);
      }
    }),
    // MCP source config modal
    e.createElement($t, {
      open: mt,
      onClose: () => Ye(!1),
      sources: We,
      onChange: (s) => ye(s),
      type: "mcp"
    }),
    // Expert source config modal
    e.createElement($t, {
      open: cn,
      onClose: () => xt(!1),
      sources: Qe,
      onChange: (s) => Ne(s),
      type: "expert"
    })
  );
}
function $l() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const Bt = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, jt = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function Rl() {
  const e = E(), t = e.React, { useEffect: r, useRef: n } = t, a = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, l = (a == null ? void 0 : a.id) || "default", o = n(null), i = n(null);
  return r(() => {
    if (o.current === l) return;
    o.current = l;
    const f = $l(), c = Bt[f] || Bt.en, d = jt[f] || jt.en;
    let k = !1;
    return (async () => {
      var b, h;
      try {
        const P = await it(l);
        if (k) return;
        const p = Gt(P);
        if (i.current) {
          try {
            i.current();
          } catch {
          }
          i.current = null;
        }
        const I = window.QwenPaw;
        (b = I == null ? void 0 : I.chat) != null && b.welcome && (p.length > 0 ? (i.current = I.chat.welcome.set("ugsci", {
          description: c,
          prompts: p
        }), console.info(
          `[ugsci] Injected ${p.length} welcome prompts for agent "${l}"`
        )) : (i.current = I.chat.welcome.set("ugsci", {
          description: c,
          prompts: [d]
        }), console.info(
          `[ugsci] No skills for agent "${l}" — using default prompt`
        )));
      } catch (P) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${l}":`,
          P
        );
        const p = window.QwenPaw;
        if ((h = p == null ? void 0 : p.chat) != null && h.welcome && !k) {
          if (i.current) {
            try {
              i.current();
            } catch {
            }
            i.current = null;
          }
          i.current = p.chat.welcome.set("ugsci", {
            description: c,
            prompts: [d]
          });
        }
      }
    })(), () => {
      k = !0;
    };
  }, [l]), null;
}
function Ll() {
  var c, d, k;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = E().React, r = "ugsci";
  (d = (c = e.chat) == null ? void 0 : c.rightHeader) != null && d.add ? (e.chat.rightHeader.add(r, t.createElement(Rl), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const n = E().antdIcons || {}, a = n.UserSwitchOutlined, l = n.ToolOutlined, o = n.ThunderboltOutlined, i = n.ShopOutlined;
  e.route.add(r, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: ml
  }), e.menu.add(r, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家",
    icon: a ? t.createElement(a, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => Ke()
  }), e.route.add(r, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: vl
  }), e.menu.add(r, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "工具",
    icon: l ? t.createElement(l, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.capabilities",
    order: 6,
    visible: () => Ke()
  }), e.route.add(r, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: xl
  }), e.menu.add(r, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.skills-center",
    order: 7,
    visible: () => Ke()
  }), e.route.add(r, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: Ml
  }), e.menu.add(r, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: i ? t.createElement(i, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 8,
    visible: () => Ke()
  }), (k = e.sidebar) != null && k.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
    "ugsci.experts",
    "ugsci.capabilities",
    "ugsci.skills-center",
    "ugsci.market"
  ]), console.info("[ugsci] Registered 4 items for simple-mode visibility")) : console.warn(
    "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode"
  );
  const f = [
    "core.skills",
    "core.tools",
    "core.mcp",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool"
  ];
  for (const b of f) {
    try {
      const P = e.menu.snapshot("primary.agentScoped").find((p) => p.id === b);
      P && e.menu.replace(r, b, {
        ...P,
        visible: () => !Ke()
      });
    } catch {
    }
    try {
      const P = e.menu.snapshot("primary.settings").find((p) => p.id === b);
      P && e.menu.replace(r, b, {
        ...P,
        visible: () => !Ke()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active"
  );
}
function ft() {
  try {
    Ll();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(ft, 500);
  }
}
var Nt;
if ((Nt = window.QwenPaw) != null && Nt.host)
  ft();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), ft());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
