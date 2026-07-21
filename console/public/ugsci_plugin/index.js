function h() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function xn() {
  try {
    return h().getApiToken() || "";
  } catch {
    return "";
  }
}
function Ve(e) {
  return h().getApiUrl(e);
}
function Ut(e) {
  const t = xn();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
async function ne(e, t) {
  const r = await fetch(Ve(e), {
    ...t,
    headers: { ...Ut(), ...(t == null ? void 0 : t.headers) || {} }
  });
  if (!r.ok) {
    const n = await r.text().catch(() => "");
    throw new Error(n || `HTTP ${r.status}`);
  }
  return r.status === 204 ? null : r.json();
}
async function ht() {
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
async function vt(e = !1) {
  return await ne(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function wn(e) {
  const t = await ne(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Cn() {
  return await ne("/skills/workspaces") || [];
}
async function kn(e) {
  return await ne("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Tn(e, t) {
  return ne(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function In(e, t) {
  await ne(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function zn(e, t, r) {
  return ne("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ client_key: t, client: r })
  });
}
async function Pn(e, t) {
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
function qe() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function bt(e, t) {
  const r = h();
  return r.ReactMarkdown && r.remarkGfm ? t.createElement(
    r.ReactMarkdown,
    { remarkPlugins: [r.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
const It = [
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
], gt = [
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
], Ft = "ugsci_custom_teams";
function at() {
  try {
    const e = localStorage.getItem(Ft);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function Gt(e) {
  try {
    localStorage.setItem(Ft, JSON.stringify(e));
  } catch {
  }
}
const _n = [
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
async function On(e, t) {
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
      ...Ut(),
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
function An(e) {
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
function Mn({ team: e }) {
  const t = h().React, { Typography: r, Tag: n } = h().antd, { Text: a } = r, l = {
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
function $n({
  open: e,
  onClose: t,
  agents: r,
  editingTeam: n,
  onSaved: a
}) {
  const l = h().React, { useState: o, useEffect: i, useCallback: f } = l, {
    Modal: c,
    Input: d,
    Button: k,
    Select: v,
    Tag: E,
    Typography: T,
    Switch: g,
    Empty: S,
    message: A,
    Divider: H,
    Steps: I
  } = h().antd, { PlusOutlined: V, DeleteOutlined: b, SaveOutlined: P, ArrowRightOutlined: D } = h().antdIcons || {}, { Text: $, Paragraph: u } = T, [C, _] = o(""), [te, M] = o("🤝"), [z, p] = o(""), [N, W] = o(
    "pipeline"
  ), [Q, j] = o(""), [y, O] = o(""), [U, ae] = o([]), [w, F] = o([]), [X, G] = o(!1);
  i(() => {
    e && (n ? (_(n.name), M(n.emoji), p(n.description), W(n.mode), j(n.coordinatorName || ""), O(n.taskTemplate), ae(n.steps || []), F(n.members.map((Z) => Z.name))) : (_(""), M("🤝"), p(""), W("pipeline"), j(""), O(`请执行以下任务：
任务描述：{任务描述}`), ae([]), F([])));
  }, [e, n]);
  const L = f(() => {
    if (N === "roundtable") {
      const Z = w.map((me) => ({
        agentName: me,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      ae(Z);
    } else if (N === "pipeline") {
      const Z = new Map(U.map((J) => [J.agentName, J])), me = w.map((J) => Z.get(J) || {
        agentName: J,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      ae(me);
    }
  }, [N, w, U]), x = (Z) => {
    w.includes(Z) || (F([...w, Z]), N === "coordinator" && !Q && j(Z));
  }, m = (Z) => {
    F(w.filter((me) => me !== Z)), ae(U.filter((me) => me.agentName !== Z)), Q === Z && j(w[0] || "");
  }, K = (Z, me, J) => {
    const oe = [...U];
    oe[Z] = { ...oe[Z], [me]: J }, ae(oe);
  }, re = () => {
    if (!C.trim()) {
      A.warning("请输入团队名称");
      return;
    }
    if (w.length < 2) {
      A.warning("至少需要选择 2 个成员");
      return;
    }
    if (!y.trim()) {
      A.warning("请输入任务模板");
      return;
    }
    if (N === "coordinator" && !Q) {
      A.warning("请选择协调者");
      return;
    }
    G(!0);
    try {
      const Z = w.map(
        (le) => {
          var pe;
          const Y = r.find((de) => de.name === le);
          return {
            name: le,
            role: ((pe = Y == null ? void 0 : Y.description) == null ? void 0 : pe.slice(0, 30)) || "团队成员",
            emoji: ""
          };
        }
      );
      let me = U;
      (U.length === 0 || U.length !== w.length) && (me = w.map((le) => ({
        agentName: le,
        instruction: "请完成你的专业部分",
        passContext: N === "pipeline"
      })));
      const J = {
        id: (n == null ? void 0 : n.id) || `custom-${Date.now()}`,
        name: C.trim(),
        emoji: te,
        category: "自定义",
        description: z.trim() || `${C.trim()}（${w.length}人团队）`,
        mode: N,
        members: Z,
        coordinatorName: N === "coordinator" ? Q : void 0,
        taskTemplate: y.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: me,
        custom: !0,
        createdAt: (n == null ? void 0 : n.createdAt) || Date.now()
      }, oe = at(), se = oe.findIndex((le) => le.id === J.id);
      se >= 0 ? oe[se] = J : oe.push(J), Gt(oe), A.success(n ? "团队已更新" : "团队已创建"), a(), t();
    } catch (Z) {
      A.error(Z.message || "保存失败");
    } finally {
      G(!1);
    }
  }, he = r.filter(
    (Z) => !w.includes(Z.name)
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
        icon: P ? l.createElement(P) : void 0
      }
    },
    // Step 1: Basic info
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        $,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 基本信息"
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        w.length > 0 ? l.createElement(xt, {
          members: w,
          size: 36
        }) : null,
        l.createElement(d, {
          placeholder: "团队名称（如：储层评价团队）",
          value: C,
          onChange: (Z) => _(Z.target.value),
          style: { flex: 1 }
        })
      ),
      l.createElement(d.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: z,
        onChange: (Z) => p(Z.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        l.createElement(
          $,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式："
        ),
        l.createElement(v, {
          value: N,
          onChange: (Z) => W(Z),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" }
          ]
        })
      )
    ),
    l.createElement(H, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        $,
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
          (Z) => l.createElement(
            k,
            {
              key: Z.id,
              size: "small",
              icon: V ? l.createElement(V) : void 0,
              onClick: () => x(Z.name)
            },
            Z.name
          )
        )
      ) : null,
      // Selected members
      w.length === 0 ? l.createElement(S, {
        description: "请从上方添加团队成员",
        image: S.PRESENTED_IMAGE_SIMPLE
      }) : l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...w.map(
          (Z) => l.createElement(
            "div",
            {
              key: Z,
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
              l.createElement(Le, { name: Z, size: 24 }),
              l.createElement(
                $,
                { strong: !0, style: { fontSize: 13 } },
                Z
              ),
              N === "coordinator" && Q === Z ? l.createElement(
                E,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            l.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              N === "coordinator" ? l.createElement(
                k,
                {
                  size: "small",
                  type: "link",
                  onClick: () => j(Z)
                },
                "设为协调者"
              ) : null,
              l.createElement(
                k,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: b ? l.createElement(b) : void 0,
                  onClick: () => m(Z)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    l.createElement(H, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    w.length > 0 ? l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        $,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${N === "roundtable" ? "（各步独立执行）" : N === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      l.createElement(
        k,
        {
          size: "small",
          type: "dashed",
          onClick: L,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      U.length === 0 ? l.createElement(
        $,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...U.map(
          (Z, me) => l.createElement(
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
              N === "pipeline" ? l.createElement(
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
                E,
                { color: "blue", style: { fontSize: 11 } },
                Z.agentName
              ),
              l.createElement(
                "div",
                { style: { flex: 1 } },
                l.createElement(d, {
                  placeholder: "请输入该步骤的指令...",
                  value: Z.instruction,
                  onChange: (J) => K(me, "instruction", J.target.value),
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
              l.createElement(g, {
                size: "small",
                checked: Z.passContext,
                onChange: (J) => K(me, "passContext", J)
              }),
              l.createElement(
                $,
                { type: "secondary", style: { fontSize: 11 } },
                Z.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    l.createElement(H, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    l.createElement(
      "div",
      null,
      l.createElement(
        $,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${w.length > 0 ? "4" : "3"}. 任务模板`
      ),
      l.createElement(d.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: y,
        onChange: (Z) => O(Z.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      l.createElement(
        $,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function zt({
  team: e,
  agents: t,
  onLaunch: r,
  onEdit: n,
  onDelete: a
}) {
  var z;
  const l = h().React, { useState: o } = l, { Card: i, Tag: f, Typography: c, Button: d, Tooltip: k } = h().antd, {
    TeamOutlined: v,
    RocketOutlined: E,
    UserOutlined: T,
    EditOutlined: g,
    DeleteOutlined: S,
    DownOutlined: A,
    UpOutlined: H
  } = h().antdIcons || {}, { Text: I, Paragraph: V } = c, [b, P] = o(!1), D = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, $ = D[e.mode] || D.coordinator, u = e.members.map((p) => {
    const N = rt(t, p.name);
    return { ...p, found: !!N, agentId: N };
  }), C = u.filter((p) => p.found).length, _ = C === e.members.length, te = e.coordinatorName || ((z = e.members[0]) == null ? void 0 : z.name), M = te ? rt(t, te) : null;
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
      l.createElement(xt, {
        members: e.members.map((p) => p.name),
        size: 36
      }),
      l.createElement(
        "div",
        { style: { flex: 1 } },
        l.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          l.createElement(
            I,
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
            { color: $.color, style: { fontSize: 10 } },
            $.label
          ),
          l.createElement(
            f,
            { style: { fontSize: 10 } },
            `${C}/${e.members.length}`
          ),
          _ ? null : l.createElement(
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
            icon: g ? l.createElement(g) : void 0,
            onClick: (p) => {
              p.stopPropagation(), n(e);
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
            icon: S ? l.createElement(S) : void 0,
            onClick: (p) => {
              p.stopPropagation(), a(e);
            }
          })
        ) : null
      ) : null
    ),
    // Description
    l.createElement(
      V,
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
      ...u.map(
        (p) => l.createElement(
          k,
          {
            key: p.name,
            title: `${p.name}（${p.role}）${p.found ? "" : " - 未创建"}`
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
                background: p.found ? "#f0f5ff" : "#fff2f0",
                border: `1px solid ${p.found ? "#d6e4ff" : "#ffccc7"}`,
                fontSize: 11
              }
            },
            l.createElement(Le, { name: p.name, size: 18 }),
            l.createElement(
              I,
              {
                style: { fontSize: 11, color: p.found ? "#1f4e8c" : "#cf1322" }
              },
              p.name
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
        onClick: (p) => {
          p.stopPropagation(), P(!b);
        },
        icon: b ? H ? l.createElement(H) : "▲" : A ? l.createElement(A) : "▼"
      },
      b ? "收起流程" : "查看执行流程"
    ),
    b ? l.createElement(Mn, { team: e }) : null,
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
        I,
        { type: "secondary", style: { fontSize: 11 } },
        te ? `协调者: ${te}` : ""
      ),
      l.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: E ? l.createElement(E) : void 0,
          disabled: !M,
          onClick: () => r(e),
          style: Me
        },
        "发起团队任务"
      )
    )
  );
}
function Rn({
  agents: e,
  onLaunch: t
}) {
  const r = h().React, { useMemo: n, useState: a, useCallback: l, useEffect: o } = r, {
    Row: i,
    Col: f,
    Input: c,
    Empty: d,
    Typography: k,
    Tag: v,
    Button: E,
    Divider: T,
    message: g,
    Popconfirm: S
  } = h().antd, { SearchOutlined: A, TeamOutlined: H, PlusOutlined: I, RocketOutlined: V } = h().antdIcons || {}, { Text: b } = k, [P, D] = a(""), [$, u] = a([]), [C, _] = a(!1), [te, M] = a(null);
  o(() => {
    u(at());
  }, []);
  const z = l(() => {
    u(at());
  }, []), p = l(
    (U) => {
      const w = at().filter((F) => F.id !== U.id);
      Gt(w), u(w), g.success(`团队「${U.name}」已删除`);
    },
    [g]
  ), N = l((U) => {
    M(U), _(!0);
  }, []), W = l(() => {
    M(null), _(!0);
  }, []), Q = n(() => [...$, ..._n], [$]), j = n(() => {
    if (!P.trim()) return Q;
    const U = P.toLowerCase();
    return Q.filter(
      (ae) => ae.name.toLowerCase().includes(U) || ae.description.toLowerCase().includes(U) || ae.category.toLowerCase().includes(U)
    );
  }, [Q, P]), y = j.filter((U) => U.custom), O = j.filter((U) => !U.custom);
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
        b,
        { style: { fontSize: 13, color: "#389e0d" } },
        "多智能体协同 — 选择预设团队或创建自定义团队，支持流水线、圆桌讨论、协调者三种编排模式。"
      ),
      r.createElement(
        E,
        {
          type: "primary",
          size: "small",
          icon: I ? r.createElement(I) : void 0,
          onClick: W,
          style: Me
        },
        "创建专家团"
      )
    ),
    // Search
    r.createElement(c, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: A ? r.createElement(A) : void 0,
      value: P,
      onChange: (U) => D(U.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Custom teams section
    y.length > 0 ? r.createElement(
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
          b,
          { strong: !0, style: { fontSize: 14 } },
          `自定义团队 (${y.length})`
        )
      ),
      r.createElement(
        i,
        { gutter: [12, 12] },
        ...y.map(
          (U) => r.createElement(
            f,
            { key: U.id, xs: 24, sm: 12, md: 8 },
            r.createElement(zt, {
              team: U,
              agents: e,
              onLaunch: t,
              onEdit: N,
              onDelete: p
            })
          )
        )
      ),
      r.createElement(T, { style: { margin: "16px 0" } })
    ) : null,
    // Preset teams section
    O.length > 0 ? r.createElement(
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
          b,
          { strong: !0, style: { fontSize: 14 } },
          `预设团队 (${O.length})`
        ),
        r.createElement(
          b,
          { type: "secondary", style: { fontSize: 12 } },
          "· 行业典型工作流模板"
        )
      ),
      r.createElement(
        i,
        { gutter: [12, 12] },
        ...O.map(
          (U) => r.createElement(
            f,
            { key: U.id, xs: 24, sm: 12, md: 8 },
            r.createElement(zt, {
              team: U,
              agents: e,
              onLaunch: t
            })
          )
        )
      )
    ) : null,
    // Empty state
    j.length === 0 ? r.createElement(d, {
      description: "未找到匹配的专家团队，点击「创建专家团」自定义",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : null,
    // Team Builder Modal
    r.createElement($n, {
      open: C,
      onClose: () => {
        _(!1), M(null);
      },
      agents: e,
      editingTeam: te,
      onSaved: z
    })
  );
}
function Ht(e) {
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
async function Ln(e) {
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
async function Pt(e, t) {
  const r = await st(e);
  r.system_prompt_files = t, await ne(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(r)
  });
}
async function Wt(e, t) {
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
async function Bn(e, t) {
  await ne(`/skills/${encodeURIComponent(t)}/enable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Jt(e, t) {
  await ne(`/skills/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function jn(e, t) {
  return ne("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Dn(e, t) {
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
async function St(e) {
  return await ne("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function qt(e, t) {
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
async function Un(e, t) {
  return ne(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Fn(e, t) {
  await ne(`/skills/${encodeURIComponent(t)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
function Gn(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const r = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!r) return { number: 6, unit: "h" };
  const n = parseInt(r[1] || "0", 10), a = parseInt(r[2] || "0", 10), l = parseInt(r[3] || "0", 10), o = n * 60 + a + Math.round(l / 60);
  return o <= 0 ? { number: 6, unit: "h" } : o >= 60 && o % 60 === 0 ? { number: o / 60, unit: "h" } : { number: o, unit: "m" };
}
function Hn(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function Wn(e) {
  return ne("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function Jn(e, t) {
  return ne("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function qn(e) {
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
async function Vn(e) {
  return (await ne("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function Yn(e, t) {
  await ne("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function Qn() {
  return (await ne("/config/user-timezone")).timezone || "UTC";
}
async function Zn(e) {
  await ne("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function el(e) {
  return await ne("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const _t = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function ct({
  title: e,
  subtitle: t,
  extra: r
}) {
  const n = h().React, { Space: a } = h().antd;
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
function Ot({
  items: e,
  max: t = 5,
  color: r = "blue",
  emptyText: n = "无"
}) {
  const a = h().React, { Tag: l } = h().antd;
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
  const o = h().React, { useState: i, useEffect: f, useMemo: c } = o, { Modal: d, Button: k, Empty: v, Spin: E, Input: T, Tag: g, Tooltip: S, Typography: A } = h().antd, { CheckOutlined: H, SearchOutlined: I } = h().antdIcons || {}, { Text: V } = A, [b, P] = i([]), [D, $] = i("");
  f(() => {
    e && (P([]), $(""));
  }, [e]);
  const u = c(() => {
    if (!D.trim()) return r;
    const M = D.toLowerCase();
    return r.filter(
      (z) => {
        var p, N;
        return z.name.toLowerCase().includes(M) || ((p = z.description) == null ? void 0 : p.toLowerCase().includes(M)) || ((N = z.tags) == null ? void 0 : N.some((W) => W.toLowerCase().includes(M)));
      }
    );
  }, [r, D]), C = u.filter(
    (M) => !n.includes(M.name)
  ), _ = (M) => {
    P(
      (z) => z.includes(M) ? z.filter((p) => p !== M) : [...z, M]
    );
  }, te = async () => {
    b.length !== 0 && (await l(b), P([]));
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
          V,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${b.length} 个技能`
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
              disabled: b.length === 0
            },
            b.length > 0 ? `添加 (${b.length})` : "添加"
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
      o.createElement(T, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: I ? o.createElement(I) : void 0,
        value: D,
        onChange: (M) => $(M.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      o.createElement(
        k,
        {
          size: "small",
          type: "primary",
          onClick: () => P(C.map((M) => M.name))
        },
        "全选"
      ),
      o.createElement(
        k,
        {
          size: "small",
          onClick: () => P([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    a ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      o.createElement(E, { size: "large" })
    ) : u.length === 0 ? o.createElement(v, {
      description: D ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: v.PRESENTED_IMAGE_SIMPLE
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
      ...u.map((M) => {
        const z = b.includes(M.name), p = n.includes(M.name);
        return o.createElement(
          "div",
          {
            key: M.name,
            onClick: () => !p && _(M.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${z ? "#0072f5" : "#e8e8e8"}`,
              borderRadius: 6,
              cursor: p ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: z ? "rgba(0, 114, 245, 0.06)" : p ? "#fafafa" : "#fff",
              opacity: p ? 0.5 : 1,
              minHeight: 64
            }
          },
          z ? o.createElement(
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
            H ? o.createElement(H) : "✓"
          ) : null,
          p ? o.createElement(
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
                paddingRight: p || z ? 24 : 0
              }
            },
            o.createElement(
              "span",
              { style: { fontSize: 16 } },
              M.emoji || "⚡"
            ),
            o.createElement(
              S,
              { title: M.name },
              o.createElement(
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
                M.name
              )
            )
          ),
          M.description ? o.createElement(
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
            M.description
          ) : null,
          M.tags && M.tags.length > 0 ? o.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...M.tags.slice(0, 2).map(
              (N, W) => o.createElement(
                g,
                {
                  key: W,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                N
              )
            )
          ) : null
        );
      })
    )
  );
}
const Ke = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  gap: 4
}, Vt = { marginBottom: 16 }, Yt = {
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
}, Qt = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function tl({ agentId: e }) {
  const t = h().React, { useState: r, useEffect: n, useCallback: a } = t, {
    Switch: l,
    InputNumber: o,
    Select: i,
    Button: f,
    Spin: c,
    Space: d,
    Typography: k,
    message: v
  } = h().antd, { PlayCircleOutlined: E, SaveOutlined: T } = h().antdIcons || {}, { Text: g } = k, [S, A] = r(!0), [H, I] = r(!1), [V, b] = r(!1), [P, D] = r(!1), [$, u] = r(6), [C, _] = r("h"), [te, M] = r("main"), [z, p] = r(300), [N, W] = r(!1), [Q, j] = r("08:00"), [y, O] = r("22:00"), U = a(async () => {
    var L, x;
    A(!0);
    try {
      const m = await Wn(e), K = Gn(m.every ?? "6h");
      D(m.enabled ?? !1), u(K.number), _(K.unit), M(m.target ?? "main"), p(m.timeoutSeconds ?? 300), W(!!m.activeHours), j(((L = m.activeHours) == null ? void 0 : L.start) ?? "08:00"), O(((x = m.activeHours) == null ? void 0 : x.end) ?? "22:00");
    } catch (m) {
      v.error(m.message || "加载心跳配置失败");
    } finally {
      A(!1);
    }
  }, [e]);
  n(() => {
    U();
  }, [U]);
  const ae = async () => {
    I(!0);
    try {
      await Jn(e, {
        enabled: P,
        every: Hn({ number: $, unit: C }),
        target: te,
        timeoutSeconds: z,
        activeHours: N && Q && y ? { start: Q, end: y } : void 0
      }), v.success("心跳配置已保存");
    } catch (L) {
      v.error(L.message || "保存心跳配置失败");
    } finally {
      I(!1);
    }
  }, w = async () => {
    b(!0);
    try {
      await qn(e), v.success("已触发心跳检查");
    } catch (L) {
      v.error(L.message || "触发心跳失败");
    } finally {
      b(!1);
    }
  };
  if (S)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(c, { size: "large" })
    );
  const F = (L, x, m) => t.createElement(
    "div",
    { style: Vt },
    t.createElement("div", { style: Ke }, L),
    x,
    m ? t.createElement(
      g,
      { type: "secondary", style: Qt },
      m
    ) : null
  ), X = (L, x, m, K) => t.createElement(
    "div",
    { style: Yt },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ke }, L),
      x
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ke }, m),
      K
    )
  ), { Divider: G } = h().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: Ne }, "基本设置"),
    F(
      "启用心跳",
      t.createElement(l, {
        checked: P,
        onChange: (L) => D(L)
      }),
      P ? "已启用，专家将定期自检" : "已停用"
    ),
    X(
      "检查频率",
      t.createElement(
        d,
        null,
        t.createElement(o, {
          min: 1,
          value: $,
          onChange: (L) => u(L ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(i, {
          value: C,
          onChange: (L) => _(L),
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
        onChange: (L) => M(L),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    F(
      "超时时间 (秒)",
      t.createElement(o, {
        min: 1,
        max: 3600,
        value: z,
        onChange: (L) => p(L ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(G, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "活跃时段"),
    F(
      "启用活跃时段限制",
      t.createElement(l, {
        checked: N,
        onChange: (L) => W(L)
      }),
      "仅在指定时段内触发心跳"
    ),
    N ? X(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: Q,
        onChange: (L) => j(L.target.value),
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
        value: y,
        onChange: (L) => O(L.target.value),
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
          icon: T ? t.createElement(T) : void 0,
          loading: H,
          onClick: ae,
          style: Me
        },
        "保存配置"
      ),
      t.createElement(
        f,
        {
          icon: E ? t.createElement(E) : void 0,
          loading: V,
          onClick: w
        },
        "立即执行"
      )
    )
  );
}
function nl({
  agentId: e,
  onRefresh: t
}) {
  const r = h().React, { useState: n, useEffect: a, useCallback: l } = r, {
    List: o,
    Tag: i,
    Switch: f,
    Button: c,
    Empty: d,
    Spin: k,
    Typography: v,
    message: E
  } = h().antd, { PlusOutlined: T, ReloadOutlined: g, DeleteOutlined: S } = h().antdIcons || {}, { Text: A, Paragraph: H } = v, [I, V] = n([]), [b, P] = n(!0), [D, $] = n(!1), [u, C] = n([]), [_, te] = n(!1), M = l(async () => {
    P(!0);
    try {
      const j = await it(e);
      V(j);
    } catch (j) {
      E.error(j.message || "加载技能失败"), V([]);
    } finally {
      P(!1);
    }
  }, [e]);
  a(() => {
    M();
  }, [M]);
  const z = async () => {
    $(!0), te(!0);
    try {
      const j = await vt(!0);
      C(j);
    } catch (j) {
      E.error(j.message || "加载技能池失败");
    } finally {
      te(!1);
    }
  }, p = async (j) => {
    let y = 0, O = 0;
    for (const U of j)
      try {
        await Wt(e, U), y++;
      } catch {
        O++;
      }
    y > 0 ? (E.success(
      `成功添加 ${y} 个技能${O > 0 ? `，${O} 个失败` : ""}`
    ), M(), t()) : O > 0 && E.error("添加技能失败"), $(!1);
  }, N = async (j, y) => {
    try {
      y ? await Bn(e, j.name) : await Fn(e, j.name), E.success(y ? "已启用" : "已停用"), M(), t();
    } catch (O) {
      E.error(O.message || "操作失败");
    }
  }, W = async (j) => {
    try {
      await Jt(e, j), E.success(`技能「${j}」已移除`), M(), t();
    } catch (y) {
      E.error(y.message || "移除技能失败");
    }
  };
  if (b)
    return r.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      r.createElement(k, { size: "large" })
    );
  const Q = I.filter((j) => j.enabled !== !1);
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
        A,
        { strong: !0 },
        `技能列表 (${I.length}，已启用 ${Q.length})`
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          c,
          {
            size: "small",
            icon: g ? r.createElement(g) : void 0,
            onClick: M
          },
          "刷新"
        ),
        r.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: T ? r.createElement(T) : void 0,
            onClick: z,
            style: Me
          },
          "从技能池添加"
        )
      )
    ),
    I.length === 0 ? r.createElement(d, {
      description: "该专家暂无技能",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(o, {
      dataSource: I,
      renderItem: (j) => r.createElement(
        o.Item,
        {
          actions: [
            r.createElement(f, {
              key: "toggle",
              size: "small",
              checked: j.enabled !== !1,
              onChange: (y) => N(j, y)
            }),
            r.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: S ? r.createElement(S) : void 0,
                onClick: () => W(j.name)
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
            j.emoji ? r.createElement(
              "span",
              { style: { fontSize: 16 } },
              j.emoji
            ) : null,
            r.createElement(A, { strong: !0 }, j.name),
            j.version_text ? r.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${j.version_text}`
            ) : null
          ),
          j.description ? r.createElement(
            H,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            j.description
          ) : null
        )
      )
    }),
    r.createElement(Xt, {
      open: D,
      onClose: () => $(!1),
      poolSkills: u,
      installedSkillNames: I.map((j) => j.name),
      loading: _,
      onInstall: p
    })
  );
}
function ll({
  agentId: e,
  onRefresh: t,
  isActive: r
}) {
  const n = h().React, { useState: a, useEffect: l, useCallback: o } = n, {
    List: i,
    Tag: f,
    Button: c,
    Empty: d,
    Spin: k,
    Modal: v,
    Input: E,
    Typography: T,
    message: g
  } = h().antd, { PlusOutlined: S, ReloadOutlined: A, DeleteOutlined: H } = h().antdIcons || {}, { Text: I, Paragraph: V } = T, { TextArea: b } = E, [P, D] = a([]), [$, u] = a(!0), [C, _] = a(!1), [te, M] = a(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [z, p] = a(!1), N = o(async () => {
    u(!0);
    try {
      const y = await St(e);
      D(y);
    } catch (y) {
      g.error(y.message || "加载 MCP 失败"), D([]);
    } finally {
      u(!1);
    }
  }, [e]);
  l(() => {
    N();
  }, [N]), l(() => {
    r && N();
  }, [r, N]);
  const W = async (y) => {
    try {
      await Un(e, y), g.success("已切换 MCP 状态"), N(), t();
    } catch (O) {
      g.error(O.message || "切换失败");
    }
  }, Q = async (y) => {
    try {
      await qt(e, y), g.success(`MCP「${y}」已移除`), N(), t();
    } catch (O) {
      g.error(O.message || "移除 MCP 失败");
    }
  }, j = async () => {
    p(!0);
    try {
      const y = JSON.parse(te), O = y.mcpServers || y, U = Object.entries(O);
      if (U.length === 0) {
        g.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [ae, w] of U) {
        const F = w, X = F.url ? "streamable_http" : "stdio";
        await Kt(e, {
          client_key: ae,
          client: {
            name: F.name || ae,
            description: F.description || "",
            enabled: !0,
            transport: X,
            url: F.url || "",
            command: F.command || "",
            args: F.args || [],
            env: F.env || {},
            cwd: F.cwd || "",
            headers: F.headers || {}
          }
        });
      }
      g.success("MCP 客户端已创建"), _(!1), N(), t();
    } catch (y) {
      y instanceof SyntaxError ? g.error("JSON 格式错误：" + y.message) : g.error(y.message || "创建 MCP 失败");
    } finally {
      p(!1);
    }
  };
  return $ ? n.createElement(
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
      n.createElement(I, { strong: !0 }, `MCP 客户端 (${P.length})`),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          c,
          {
            size: "small",
            icon: A ? n.createElement(A) : void 0,
            onClick: N
          },
          "刷新"
        ),
        n.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: S ? n.createElement(S) : void 0,
            onClick: () => _(!0),
            style: Me
          },
          "添加 MCP"
        )
      )
    ),
    P.length === 0 ? n.createElement(d, {
      description: "该专家暂无 MCP 客户端",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(i, {
      dataSource: P,
      renderItem: (y) => n.createElement(
        i.Item,
        {
          actions: [
            n.createElement(
              c,
              {
                key: "toggle",
                size: "small",
                onClick: () => W(y.key)
              },
              y.enabled ? "停用" : "启用"
            ),
            n.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: H ? n.createElement(H) : void 0,
                onClick: () => Q(y.key)
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
            n.createElement(I, { strong: !0 }, y.name || y.key),
            n.createElement(
              f,
              {
                color: y.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              y.enabled ? "启用" : "停用"
            ),
            n.createElement(
              f,
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
            { style: { marginTop: 4, fontSize: 11, color: "#8c8c8c" } },
            `提供 ${y.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    n.createElement(
      v,
      {
        open: C,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => _(!1),
        onOk: j,
        confirmLoading: z,
        okText: "创建",
        width: 560
      },
      n.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      n.createElement(b, {
        value: te,
        onChange: (y) => M(y.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function al({ agentId: e }) {
  const t = h().React, { useState: r, useEffect: n, useCallback: a, useRef: l } = t, {
    Card: o,
    InputNumber: i,
    Input: f,
    Select: c,
    Switch: d,
    Button: k,
    Spin: v,
    Space: E,
    Typography: T,
    Divider: g,
    message: S
  } = h().antd, { SaveOutlined: A } = h().antdIcons || {}, { Text: H } = T, [I, V] = r(!0), [b, P] = r(!1), D = l(null), [$, u] = r(60), [C, _] = r(""), [te, M] = r(!0), [z, p] = r(30), [N, W] = r("zh"), [Q, j] = r("UTC"), [y, O] = r(!0), [U, ae] = r(100), [w, F] = r(!0), [X, G] = r(3), [L, x] = r(1), [m, K] = r(!0), [re, he] = r(3), [Z, me] = r(2), [J, oe] = r(60), [se, le] = r(1), [Y, pe] = r(0), [de, ze] = r(1), [Te, R] = r(0), [ie, ge] = r(30), [we, Se] = r(50), [Ce, $e] = r("light"), [Ue, Oe] = r("scroll"), [Fe, Ge] = r("remelight"), [Be, Re] = r("AUTO"), je = a(async () => {
    var B, ke, xe, be, Ie, We;
    V(!0);
    try {
      const [ye, mt, Ye] = await Promise.all([
        Kn(e),
        Vn(e).catch(() => "zh"),
        Qn().catch(() => "UTC")
      ]);
      D.current = ye, u(ye.shell_command_timeout ?? 60), _(ye.shell_command_executable ?? "");
      const Qe = ye.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      M(Qe.enabled ?? !0), p(Qe.timeout_seconds ?? 30), W(mt), j(Ye);
      const De = ye.loop ?? {};
      O(((B = De.iteration) == null ? void 0 : B.enabled) ?? !0), ae(((ke = De.iteration) == null ? void 0 : ke.max_iterations) ?? ye.max_iters ?? 100), F(((xe = De.doom_loop) == null ? void 0 : xe.enabled) ?? !0), G(((be = De.doom_loop) == null ? void 0 : be.window_size) ?? 3), x(((Ie = De.doom_loop) == null ? void 0 : Ie.similarity_threshold) ?? 1), K(ye.llm_retry_enabled ?? !0), he(ye.llm_max_retries ?? 3), me(ye.llm_backoff_base ?? 2), oe(ye.llm_backoff_cap ?? 60), le(ye.llm_max_concurrent ?? 1), pe(ye.llm_max_qpm ?? 0), ze(ye.llm_rate_limit_pause ?? 1), R(ye.llm_rate_limit_jitter ?? 0), ge(ye.llm_acquire_timeout ?? 30), Se(ye.history_max_length ?? 50), $e(ye.context_manager_backend ?? "light"), Oe(((We = ye.light_context_config) == null ? void 0 : We.strategy) ?? "scroll"), Ge(ye.memory_manager_backend ?? "remelight"), Re(ye.approval_level ?? "AUTO");
    } catch (ye) {
      S.error(ye.message || "加载运行配置失败");
    } finally {
      V(!1);
    }
  }, [e]);
  n(() => {
    je();
  }, [je]);
  const He = async () => {
    var ke, xe;
    const B = D.current;
    if (B) {
      P(!0);
      try {
        const be = {
          ...B,
          max_iters: U,
          loop: {
            ...B.loop ?? {},
            iteration: { enabled: y, max_iterations: U },
            doom_loop: {
              enabled: w,
              window_size: X,
              similarity_threshold: L,
              stages: ((xe = (ke = B.loop) == null ? void 0 : ke.doom_loop) == null ? void 0 : xe.stages) ?? []
            }
          },
          shell_command_timeout: $,
          shell_command_executable: C,
          auto_title_config: {
            enabled: te,
            timeout_seconds: z
          },
          llm_retry_enabled: m,
          llm_max_retries: re,
          llm_backoff_base: Z,
          llm_backoff_cap: J,
          llm_max_concurrent: se,
          llm_max_qpm: Y,
          llm_rate_limit_pause: de,
          llm_rate_limit_jitter: Te,
          llm_acquire_timeout: ie,
          history_max_length: we,
          context_manager_backend: Ce,
          light_context_config: {
            ...B.light_context_config ?? {},
            strategy: Ue
          },
          memory_manager_backend: Fe,
          approval_level: Be
        };
        await Xn(e, be), D.current = be, N && await Yn(e, N).catch(() => {
        }), Q && await Zn(Q).catch(() => {
        }), S.success("运行配置已保存");
      } catch (be) {
        S.error(be.message || "保存运行配置失败");
      } finally {
        P(!1);
      }
    }
  };
  if (I)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(v, { size: "large" })
    );
  const ee = (B, ke, xe) => t.createElement(
    "div",
    { style: Vt },
    t.createElement("div", { style: Ke }, B),
    ke,
    xe ? t.createElement(
      H,
      { type: "secondary", style: Qt },
      xe
    ) : null
  ), ce = (B, ke, xe, be) => t.createElement(
    "div",
    { style: Yt },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ke }, B),
      ke
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ke }, xe),
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
        value: $,
        onChange: (B) => u(B ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(f, {
        value: C,
        onChange: (B) => _(B.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    ce(
      "语言",
      t.createElement(c, {
        value: N,
        onChange: (B) => W(B),
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
        value: Q,
        onChange: (B) => j(B),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (B, ke) => {
          var xe;
          return (((xe = ke == null ? void 0 : ke.label) == null ? void 0 : xe.toString()) || "").toLowerCase().includes(B.toLowerCase());
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
        ].map((B) => ({ value: B, label: B }))
      })
    ),
    ce(
      "自动生成会话标题",
      t.createElement(E, null, t.createElement(d, {
        checked: te,
        onChange: (B) => M(B)
      })),
      "标题生成超时 (秒)",
      t.createElement(i, {
        min: 5,
        value: z,
        onChange: (B) => p(B ?? 30),
        style: { width: "100%" },
        disabled: !te
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(g, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "审批级别"),
    ee(
      "工具执行审批",
      t.createElement(c, {
        value: Be,
        onChange: (B) => Re(B),
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
    t.createElement(g, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "迭代与循环"),
    ee(
      "启用迭代限制",
      t.createElement(d, {
        checked: y,
        onChange: (B) => O(B)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    y ? ee(
      "最大迭代次数",
      t.createElement(i, {
        min: 1,
        max: 500,
        value: U,
        onChange: (B) => ae(B ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    ee(
      "启用重复循环保护",
      t.createElement(d, {
        checked: w,
        onChange: (B) => F(B)
      }),
      "检测并阻止重复操作循环"
    ),
    w ? ce(
      "检测窗口大小",
      t.createElement(i, {
        min: 2,
        max: 20,
        value: X,
        onChange: (B) => G(B ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(i, {
        min: 0,
        max: 1,
        step: 0.05,
        value: L,
        onChange: (B) => x(B ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(g, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "LLM 重试"),
    ee(
      "启用 LLM 重试",
      t.createElement(d, {
        checked: m,
        onChange: (B) => K(B)
      })
    ),
    ce(
      "最大重试次数",
      t.createElement(i, {
        min: 1,
        value: re,
        onChange: (B) => he(B ?? 3),
        style: { width: "100%" },
        disabled: !m
      }),
      "退避基数 (秒)",
      t.createElement(i, {
        min: 0.1,
        step: 0.1,
        value: Z,
        onChange: (B) => me(B ?? 2),
        style: { width: "100%" },
        disabled: !m
      })
    ),
    ee(
      "退避上限 (秒)",
      t.createElement(i, {
        min: 0.5,
        step: 0.5,
        value: J,
        onChange: (B) => oe(B ?? 60),
        style: { width: 200 },
        disabled: !m
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(g, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "LLM 限流"),
    ce(
      "最大并发数",
      t.createElement(i, {
        min: 1,
        value: se,
        onChange: (B) => le(B ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(i, {
        min: 0,
        step: 10,
        value: Y,
        onChange: (B) => pe(B ?? 0),
        style: { width: "100%" }
      })
    ),
    ce(
      "限流暂停时间 (秒)",
      t.createElement(i, {
        min: 1,
        step: 0.5,
        value: de,
        onChange: (B) => ze(B ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(i, {
        min: 0,
        step: 0.5,
        value: Te,
        onChange: (B) => R(B ?? 0),
        style: { width: "100%" }
      })
    ),
    ee(
      "获取超时 (秒)",
      t.createElement(i, {
        min: 10,
        step: 10,
        value: ie,
        onChange: (B) => ge(B ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(g, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "上下文与记忆"),
    ce(
      "上下文管理后端",
      t.createElement(c, {
        value: Ce,
        onChange: (B) => $e(B),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(c, {
        value: Ue,
        onChange: (B) => Oe(B),
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
        onChange: (B) => Ge(B),
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
        onChange: (B) => Se(B ?? 50),
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
          icon: A ? t.createElement(A) : void 0,
          loading: b,
          onClick: He,
          style: Me
        },
        "保存运行配置"
      )
    )
  );
}
function rl({
  expert: e,
  open: t,
  onClose: r,
  onRefresh: n
}) {
  const a = h().React, { useState: l, useEffect: o, useCallback: i } = a, { Modal: f, Tabs: c, Spin: d, Typography: k } = h().antd, { SettingOutlined: v } = h().antdIcons || {}, { Text: E } = k, [T, g] = l([]), [S, A] = l(!1), [H, I] = l("heartbeat"), V = i(async () => {
    if (e) {
      A(!0);
      try {
        const $ = await el(e.agent.id);
        g($);
      } catch {
        g([]);
      } finally {
        A(!1);
      }
    }
  }, [e]);
  if (o(() => {
    t && e && V();
  }, [t, e, V]), !e) return null;
  const { agent: b } = e, P = () => {
    V(), n();
  }, D = [
    {
      key: "heartbeat",
      label: "心跳",
      children: a.createElement(tl, {
        agentId: b.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: S ? a.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        a.createElement(d, { size: "large" })
      ) : a.createElement(Zt, {
        agentId: b.id,
        systemPromptFiles: T,
        onRefresh: P
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter(($) => $.enabled !== !1).length})`,
      children: a.createElement(nl, {
        agentId: b.id,
        onRefresh: n
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: a.createElement(ll, {
        agentId: b.id,
        onRefresh: n,
        isActive: H === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: a.createElement(al, {
        agentId: b.id
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
        v ? a.createElement(v, { style: { fontSize: 18 } }) : null,
        a.createElement("span", null, `配置 - ${b.name}`),
        a.createElement(
          E,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          b.id
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
    a.createElement(c, {
      items: D,
      activeKey: H,
      onChange: ($) => I($),
      size: "small",
      tabBarStyle: { marginBottom: 16, sticky: 0 }
    })
  );
}
function ol({
  expert: e,
  onClick: t,
  onSummon: r,
  onConfigure: n
}) {
  const a = h().React, { Card: l, Tag: o, Badge: i, Typography: f, Spin: c, Button: d, Tooltip: k } = h().antd, { Text: v } = f, { ThunderboltOutlined: E, SettingOutlined: T } = h().antdIcons || {}, { agent: g, skills: S, mcps: A, loading: H } = e, I = g.enabled, V = S.filter((D) => D.enabled !== !1).map((D) => D.name), b = A.map((D) => D.name || D.key), P = g.active_model ? `${g.active_model.provider_id}/${g.active_model.model}` : null;
  return a.createElement(
    l,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: I ? void 0 : "#d9d9d9",
        opacity: I ? 1 : 0.7,
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
        a.createElement(Le, { name: g.name, size: 36 }),
        a.createElement(
          "div",
          null,
          a.createElement(
            v,
            { strong: !0, style: { fontSize: 15 } },
            g.name
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
            g.id
          )
        )
      ),
      a.createElement(i, {
        status: I ? "success" : "default",
        text: I ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    g.description ? a.createElement(
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
      bt(g.description, a)
    ) : a.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    P ? a.createElement(
      "div",
      { style: { marginBottom: 8 } },
      a.createElement(
        o,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${P}`
      )
    ) : null,
    // Skills
    H ? a.createElement(c, { size: "small" }) : a.createElement(
      "div",
      { style: { marginBottom: 6 } },
      a.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${V.length})`
      ),
      a.createElement(Ot, {
        items: V,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !H && b.length > 0 ? a.createElement(
      "div",
      { style: { marginTop: "auto" } },
      a.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${b.length})`
      ),
      a.createElement(Ot, {
        items: b,
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
            icon: T ? a.createElement(T, {
              style: { fontSize: 16, color: "#8c8c8c" }
            }) : void 0,
            onClick: (D) => {
              D.stopPropagation(), n && n();
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
          icon: E ? a.createElement(E) : void 0,
          disabled: !I,
          onClick: (D) => {
            D.stopPropagation(), r && r();
          },
          style: Me
        },
        "召唤专家"
      )
    )
  );
}
function sl({
  expert: e,
  open: t,
  onClose: r,
  onRefresh: n
}) {
  const a = h().React, {
    Drawer: l,
    Descriptions: o,
    Tag: i,
    Typography: f,
    Space: c,
    Button: d,
    Empty: k,
    Tabs: v,
    List: E,
    Spin: T,
    Modal: g,
    message: S
  } = h().antd, { Text: A, Paragraph: H } = f, {
    EditOutlined: I,
    ThunderboltOutlined: V,
    FileTextOutlined: b,
    ToolOutlined: P,
    PlusOutlined: D
  } = h().antdIcons || {}, [$, u] = a.useState(!1), [C, _] = a.useState(
    []
  ), [te, M] = a.useState(!1);
  if (!e) return null;
  const { agent: z, config: p, skills: N, mcps: W, loading: Q } = e, j = N.filter((m) => m.enabled !== !1), y = (m) => {
    window.history.pushState({}, "", m), window.dispatchEvent(new PopStateEvent("popstate"));
  }, O = a.createElement(
    "div",
    null,
    a.createElement(
      o,
      { column: 1, bordered: !0, size: "small" },
      a.createElement(o.Item, { label: "专家名称" }, z.name),
      a.createElement(
        o.Item,
        { label: "专家 ID" },
        a.createElement("code", { style: { fontSize: 12 } }, z.id)
      ),
      a.createElement(
        o.Item,
        { label: "状态" },
        a.createElement(
          i,
          { color: z.enabled ? "green" : "default" },
          z.enabled ? "启用" : "停用"
        )
      ),
      a.createElement(
        o.Item,
        { label: "功能简介" },
        z.description ? bt(z.description, a) : "暂无描述"
      ),
      a.createElement(
        o.Item,
        { label: "使用模型" },
        z.active_model ? `${z.active_model.provider_id} / ${z.active_model.model}` : "使用全局默认模型"
      ),
      p != null && p.workspace_dir ? a.createElement(
        o.Item,
        { label: "工作区路径" },
        a.createElement(
          "code",
          { style: { fontSize: 11 } },
          p.workspace_dir
        )
      ) : null,
      p != null && p.approval_level ? a.createElement(
        o.Item,
        { label: "审批级别" },
        p.approval_level
      ) : null
    ),
    // System prompt files
    p != null && p.system_prompt_files && p.system_prompt_files.length > 0 ? a.createElement(
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
        b ? a.createElement(b, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(A, { strong: !0 }, "系统提示词文件")
      ),
      a.createElement(
        c,
        { wrap: !0 },
        ...p.system_prompt_files.map(
          (m, K) => a.createElement(
            i,
            {
              key: K,
              icon: b ? a.createElement(b) : void 0,
              style: { fontSize: 12 }
            },
            m
          )
        )
      )
    ) : null
  ), U = async () => {
    u(!0), M(!0);
    try {
      const m = await vt(!0);
      _(m);
    } catch (m) {
      S.error(m.message || "加载技能池失败");
    } finally {
      M(!1);
    }
  }, ae = async (m) => {
    let K = 0, re = 0;
    for (const he of m)
      try {
        await Wt(z.id, he), K++;
      } catch {
        re++;
      }
    K > 0 ? (S.success(
      `成功添加 ${K} 个技能${re > 0 ? `，${re} 个失败` : ""}`
    ), n()) : re > 0 && S.error("添加技能失败"), u(!1);
  }, w = async (m) => {
    try {
      await Jt(z.id, m), S.success(`技能「${m}」已移除`), n();
    } catch (K) {
      S.error(K.message || "移除技能失败");
    }
  }, F = async (m) => {
    try {
      await qt(z.id, m), S.success(`MCP「${m}」已移除`), n();
    } catch (K) {
      S.error(K.message || "移除 MCP 失败");
    }
  }, X = Q ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(T, { size: "large" })
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
        A,
        { strong: !0 },
        `已启用技能 (${j.length})`
      ),
      a.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: D ? a.createElement(D) : void 0,
          onClick: U
        },
        "从技能池添加"
      )
    ),
    j.length === 0 ? a.createElement(k, {
      description: "该专家暂无已启用的技能",
      image: k.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(E, {
      dataSource: j,
      renderItem: (m) => a.createElement(
        E.Item,
        {
          actions: [
            a.createElement(
              d,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => w(m.name)
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
            a.createElement(A, { strong: !0 }, m.name),
            m.version_text ? a.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${m.version_text}`
            ) : null
          ),
          m.description ? a.createElement(
            H,
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
      open: $,
      onClose: () => u(!1),
      poolSkills: C,
      installedSkillNames: j.map((m) => m.name),
      loading: te,
      onInstall: ae
    })
  ), G = Q ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(T, { size: "large" })
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
        A,
        { strong: !0 },
        `MCP 客户端 (${W.length})`
      ),
      a.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: D ? a.createElement(D) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${z.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    W.length === 0 ? a.createElement(k, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: k.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(E, {
      dataSource: W,
      renderItem: (m) => a.createElement(
        E.Item,
        {
          actions: [
            a.createElement(
              d,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => F(m.key)
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
              A,
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
            H,
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
  ), L = p != null && p.tools ? a.createElement(
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
        P ? a.createElement(P, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(A, { strong: !0 }, "工具配置")
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
        JSON.stringify(p.tools, null, 2)
      )
    )
  ) : a.createElement(k, {
    description: "暂无工具配置",
    image: k.PRESENTED_IMAGE_SIMPLE
  }), x = [
    { key: "basic", label: "基本信息", children: O },
    {
      key: "skills",
      label: `技能 (${j.length})`,
      children: X
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: a.createElement(ml, {
        skills: j,
        agentId: z.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: a.createElement(Zt, {
        agentId: z.id,
        systemPromptFiles: (p == null ? void 0 : p.system_prompt_files) || [],
        onRefresh: () => n()
      })
    },
    { key: "mcp", label: `MCP (${W.length})`, children: G },
    { key: "tools", label: "工具配置", children: L }
  ];
  return a.createElement(
    l,
    {
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement(Le, { name: z.name, size: 28 }),
        a.createElement("span", null, z.name)
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
            icon: I ? a.createElement(I) : void 0,
            onClick: () => {
              r();
              try {
                const m = h();
                m.setSelectedAgent && m.setSelectedAgent(z.id);
              } catch (m) {
                console.warn("[ugsci] Failed to set selected agent:", m);
              }
              setTimeout(() => y("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        a.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: V ? a.createElement(V) : void 0,
            onClick: () => {
              r();
              try {
                const m = h();
                m.setSelectedAgent && m.setSelectedAgent(z.id);
              } catch (m) {
                console.warn("[ugsci] Failed to set selected agent:", m);
              }
              setTimeout(() => y("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    a.createElement(v, {
      items: x,
      defaultActiveKey: "basic"
    })
  );
}
function il({
  open: e,
  onClose: t,
  onCreated: r
}) {
  const n = h().React, { useState: a } = n, {
    Modal: l,
    Card: o,
    Tag: i,
    Input: f,
    Row: c,
    Col: d,
    Spin: k,
    message: v,
    Typography: E
  } = h().antd, { Text: T } = E, { FileAddOutlined: g } = h().antdIcons || {}, [S, A] = a(!1), [H, I] = a(""), [V, b] = a(!1), P = async (u, C) => {
    A(!0);
    try {
      const _ = await ne("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: u || "新专家",
          description: C || "",
          skill_names: []
        })
      });
      await ot(
        _.id,
        "AGENTS.md",
        `# ${u || "新专家"}

请在此处编写该专家的系统提示词。
`
      ), v.success("专家「" + (u || "新专家") + "」创建成功"), b(!1), setTimeout(() => {
        t(), r();
      }, 0);
    } catch (_) {
      v.error(_.message || "创建专家失败");
    } finally {
      A(!1);
    }
  }, D = gt.filter((u) => {
    if (!H.trim()) return !0;
    const C = H.toLowerCase();
    return u.name.toLowerCase().includes(C) || u.description.toLowerCase().includes(C) || u.category.toLowerCase().includes(C);
  }), $ = async (u) => {
    A(!0);
    try {
      const C = await ne("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: u.name,
          description: u.description,
          skill_names: u.recommendedSkills
        })
      });
      await ot(C.id, "AGENTS.md", u.systemPrompt);
      const _ = await st(C.id);
      _.approval_level = u.approvalLevel, await ne(`/agents/${encodeURIComponent(C.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(_)
      }), v.success(`专家「${u.name}」创建成功`), t(), r();
    } catch (C) {
      v.error(C.message || "创建专家失败");
    } finally {
      A(!1);
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
          value: H,
          onChange: (u) => I(u.target.value),
          allowClear: !0
        })
      ),
      S ? n.createElement(
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
        H.trim() ? null : n.createElement(
          d,
          { xs: 24, sm: 12 },
          n.createElement(
            o,
            {
              hoverable: !0,
              size: "small",
              onClick: () => b(!0),
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
                g ? n.createElement(g) : "📝"
              ),
              n.createElement(
                "div",
                { style: { flex: 1 } },
                n.createElement(
                  T,
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
          (u) => n.createElement(
            d,
            { key: u.id, xs: 24, sm: 12 },
            n.createElement(
              o,
              {
                hoverable: !0,
                size: "small",
                onClick: () => $(u),
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
                  name: u.name,
                  size: 40
                }),
                n.createElement(
                  "div",
                  { style: { flex: 1 } },
                  n.createElement(
                    T,
                    { strong: !0, style: { fontSize: 15 } },
                    u.name
                  ),
                  n.createElement(
                    "div",
                    null,
                    n.createElement(
                      i,
                      { color: "blue", style: { fontSize: 10 } },
                      u.category
                    ),
                    u.approvalLevel === "MANUAL" ? n.createElement(
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
                bt(u.description, n)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    n.createElement(cl, {
      open: V,
      onCancel: () => b(!1),
      onCreate: P
    })
  );
}
function cl({
  open: e,
  onCancel: t,
  onCreate: r
}) {
  const n = h().React, { useState: a, useEffect: l } = n, { Modal: o, Input: i, message: f } = h().antd, [c, d] = a(""), [k, v] = a(""), [E, T] = a(!1);
  return l(() => {
    e && (d(""), v(""), T(!1));
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
        T(!0), Promise.resolve(r(c.trim(), k.trim())).finally(() => {
          T(!1);
        });
      },
      okText: "创建",
      cancelText: "取消",
      okButtonProps: { loading: E },
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
        onChange: (g) => d(g.target.value),
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
        onChange: (g) => v(g.target.value),
        rows: 3,
        maxLength: 200
      })
    )
  );
}
function Zt({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: r
}) {
  const n = h().React, { useState: a, useEffect: l, useCallback: o } = n, {
    List: i,
    Tag: f,
    Switch: c,
    Button: d,
    Modal: k,
    Input: v,
    Spin: E,
    Empty: T,
    message: g,
    Typography: S
  } = h().antd, { FileTextOutlined: A, PlusOutlined: H, EditOutlined: I, ReloadOutlined: V } = h().antdIcons || {}, { Text: b } = S, [P, D] = a([]), [$, u] = a(!0), [C, _] = a(
    t || []
  ), [te, M] = a(!1), [z, p] = a(null), [N, W] = a(""), [Q, j] = a(""), [y, O] = a(!1), U = o(async () => {
    u(!0);
    try {
      const G = await Ln(e);
      D(G);
    } catch (G) {
      g.error(G.message || "加载记忆文件失败"), D([]);
    } finally {
      u(!1);
    }
  }, [e]);
  l(() => {
    U();
  }, [U]), l(() => {
    _(t || []);
  }, [t]);
  const ae = async (G, L) => {
    const x = new Set(C);
    if (L)
      x.add(G);
    else {
      if (_t.includes(G) && G === "AGENTS.md") {
        g.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      x.delete(G);
    }
    const m = Array.from(x);
    _(m);
    try {
      await Pt(e, m), g.success(L ? "已启用记忆文件" : "已停用记忆文件"), r();
    } catch (K) {
      g.error(K.message || "更新失败"), _(t || []);
    }
  }, w = async (G) => {
    try {
      const L = await ne(
        `/workspace/files/${encodeURIComponent(G)}`,
        { headers: { "X-Agent-Id": e } }
      );
      p(G), W(L.content || ""), M(!0);
    } catch (L) {
      g.error(L.message || "读取文件失败");
    }
  }, F = () => {
    p(null), W(""), j(""), M(!0);
  }, X = async () => {
    const G = z || Q.trim();
    if (!G) {
      g.warning("请输入文件名");
      return;
    }
    const L = G.endsWith(".md") ? G : `${G}.md`;
    O(!0);
    try {
      if (await ot(e, L, N), !z && !C.includes(L)) {
        const x = [...C, L];
        _(x), await Pt(e, x);
      }
      g.success("保存成功"), M(!1), U(), r();
    } catch (x) {
      g.error(x.message || "保存失败");
    } finally {
      O(!1);
    }
  };
  return $ ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(E, { size: "large" })
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
        A ? n.createElement(A, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(
          b,
          { strong: !0 },
          `记忆文件 (${P.length})`
        ),
        n.createElement(
          b,
          { type: "secondary", style: { fontSize: 12 } },
          `· 已挂载 ${C.length} 个到专家记忆`
        )
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          d,
          {
            size: "small",
            icon: V ? n.createElement(V) : void 0,
            onClick: U
          },
          "刷新"
        ),
        n.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: H ? n.createElement(H) : void 0,
            onClick: F
          },
          "新建记忆文件"
        )
      )
    ),
    P.length === 0 ? n.createElement(T, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: T.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(i, {
      dataSource: P,
      renderItem: (G) => {
        const L = C.includes(G.filename), x = _t.includes(G.filename);
        return n.createElement(
          i.Item,
          {
            actions: [
              n.createElement(
                d,
                {
                  type: "link",
                  size: "small",
                  icon: I ? n.createElement(I) : void 0,
                  onClick: () => w(G.filename)
                },
                "编辑"
              )
            ]
          },
          n.createElement(i.Item.Meta, {
            avatar: n.createElement(A, {
              style: {
                fontSize: 20,
                color: L ? "#1677ff" : "#bfbfbf"
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
              n.createElement(b, null, G.filename),
              x ? n.createElement(
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
              `${(G.size / 1024).toFixed(1)} KB · 修改于 ${new Date(G.modified_time).toLocaleString()}`
            )
          }),
          n.createElement(c, {
            checked: L,
            size: "small",
            onChange: (m) => ae(G.filename, m)
          })
        );
      }
    }),
    // Edit/New file modal
    n.createElement(
      k,
      {
        open: te,
        onCancel: () => M(!1),
        title: z ? `编辑 ${z}` : "新建记忆文件",
        width: 700,
        onOk: X,
        confirmLoading: y,
        okText: "保存"
      },
      z ? null : n.createElement(
        "div",
        { style: { marginBottom: 12 } },
        n.createElement(v, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: Q,
          onChange: (G) => j(G.target.value),
          addonAfter: Q.endsWith(".md") ? "" : ".md"
        })
      ),
      n.createElement(v.TextArea, {
        value: N,
        onChange: (G) => W(G.target.value),
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
function ml({
  skills: e,
  agentId: t
}) {
  const r = h().React, { useMemo: n } = r, {
    List: a,
    Tag: l,
    Typography: o,
    Empty: i,
    Button: f,
    message: c
  } = h().antd, { ThunderboltOutlined: d, CopyOutlined: k } = h().antdIcons || {}, { Text: v } = o, E = n(() => Ht(e), [e]), T = (S) => {
    try {
      const A = h();
      A.setSelectedAgent && A.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", S.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, g = (S) => {
    var A;
    (A = navigator.clipboard) == null || A.writeText(S.value).then(() => {
      c.success("已复制到剪贴板");
    });
  };
  return E.length === 0 ? r.createElement(i, {
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
        v,
        { strong: !0 },
        `推荐提问 (${E.length})`
      ),
      r.createElement(
        v,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    r.createElement(a, {
      dataSource: E,
      renderItem: (S, A) => r.createElement(
        a.Item,
        {
          actions: [
            r.createElement(
              f,
              {
                type: "link",
                size: "small",
                icon: k ? r.createElement(k) : void 0,
                onClick: () => g(S)
              },
              "复制"
            )
          ]
        },
        r.createElement(a.Item.Meta, {
          avatar: r.createElement(
            l,
            { color: "blue", style: { borderRadius: "50%" } },
            `${A + 1}`
          ),
          title: r.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => T(S)
            },
            S.value
          ),
          description: r.createElement(
            v,
            { type: "secondary", style: { fontSize: 12 } },
            S.label
          )
        })
      )
    })
  );
}
function dl() {
  var Te;
  const e = h().React, { useState: t, useEffect: r, useCallback: n, useMemo: a } = e, {
    Spin: l,
    Empty: o,
    Input: i,
    Button: f,
    message: c,
    Row: d,
    Col: k,
    Tabs: v,
    Modal: E,
    Typography: T
  } = h().antd, {
    ReloadOutlined: g,
    PlusOutlined: S,
    SearchOutlined: A,
    TeamOutlined: H,
    UserOutlined: I
  } = h().antdIcons || {}, { Text: V, Paragraph: b } = T, [P, D] = t([]), [$, u] = t(!0), [C, _] = t(!1), [te, M] = t(null), [z, p] = t(""), [N, W] = t(!1), [Q, j] = t("experts"), [y, O] = t(
    null
  ), [U, ae] = t(""), [w, F] = t(!1), [X, G] = t(!1), [L, x] = t(null), [m, K] = t([]), re = n(async () => {
    u(!0);
    try {
      const R = await ht(), ie = await Promise.all(
        R.map(async (ge) => {
          try {
            const [we, Se, Ce] = await Promise.all([
              st(ge.id).catch(() => null),
              it(ge.id).catch(() => []),
              St(ge.id).catch(() => [])
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
      D(ie), K(R);
    } catch (R) {
      c.error(R.message || "加载专家列表失败"), D([]);
    } finally {
      u(!1);
    }
  }, []);
  r(() => {
    re();
  }, [re]), r(() => {
    if (L && X) {
      const R = P.find(
        (ie) => ie.agent.id === L.agent.id
      );
      R && R !== L && x(R);
    }
  }, [P, L, X]);
  const he = n(
    async (R) => {
      var Se;
      const ie = R.coordinatorName || ((Se = R.members[0]) == null ? void 0 : Se.name);
      if (!ie) {
        c.error("无法确定协调者专家");
        return;
      }
      const ge = rt(m, ie);
      if (!ge) {
        c.error(`未找到协调者专家「${ie}」，请先创建该专家`);
        return;
      }
      if (/\{.+?\}/.test(R.taskTemplate)) {
        ae(""), O(R);
        return;
      }
      await Z(R, ge, R.taskTemplate);
    },
    [m, c]
  ), Z = n(
    async (R, ie, ge) => {
      var we;
      F(!0);
      try {
        const Se = An(R), Ce = ge ? Se.replace(R.taskTemplate, ge) : Se, $e = h();
        $e.setSelectedAgent && $e.setSelectedAgent(ie), await On(ie, Ce), c.success(
          `团队任务已发起，协调者：${R.coordinatorName || ((we = R.members[0]) == null ? void 0 : we.name)}`
        ), O(null), me("/chat");
      } catch (Se) {
        c.error(Se.message || "发起团队任务失败");
      } finally {
        F(!1);
      }
    },
    [c]
  ), me = (R) => {
    window.history.pushState({}, "", R), window.dispatchEvent(new PopStateEvent("popstate"));
  }, J = n((R) => {
    M(R), _(!0);
  }, []), oe = n((R) => {
    x(R), G(!0);
  }, []), se = n(
    (R) => {
      if (!R.agent.enabled) {
        c.warning(`专家「${R.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const ie = h();
        ie.setSelectedAgent && ie.setSelectedAgent(R.agent.id);
      } catch (ie) {
        console.warn("[ugsci] Failed to set selected agent:", ie);
      }
      c.success(`已召唤专家「${R.agent.name}」，正在跳转至对话...`), me("/chat");
    },
    [c]
  ), le = a(() => {
    if (!z.trim()) return P;
    const R = z.toLowerCase();
    return P.filter(
      (ie) => {
        var ge;
        return ie.agent.name.toLowerCase().includes(R) || ((ge = ie.agent.description) == null ? void 0 : ge.toLowerCase().includes(R)) || ie.agent.id.toLowerCase().includes(R) || ie.skills.some((we) => we.name.toLowerCase().includes(R));
      }
    );
  }, [P, z]), Y = P.filter((R) => R.agent.enabled).length, pe = P.reduce(
    (R, ie) => R + ie.skills.filter((ge) => ge.enabled !== !1).length,
    0
  ), de = P.reduce((R, ie) => R + ie.mcps.length, 0), ze = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        I ? e.createElement(I, { style: { fontSize: 14 } }) : null,
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
            prefix: A ? e.createElement(A) : void 0,
            value: z,
            onChange: (R) => p(R.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        $ ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(l, { size: "large" })
        ) : le.length === 0 ? e.createElement(o, {
          description: z ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          d,
          { gutter: [12, 12], align: "stretch" },
          ...le.map(
            (R) => e.createElement(
              k,
              {
                key: R.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(ol, {
                expert: R,
                onClick: () => J(R),
                onSummon: () => se(R),
                onConfigure: () => oe(R)
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
      children: e.createElement(Rn, {
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
      subtitle: `共 ${P.length} 位专家（${Y} 位启用）· ${pe} 个技能 · ${de} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          f,
          {
            icon: g ? e.createElement(g) : void 0,
            onClick: re,
            loading: $
          },
          "刷新"
        ),
        e.createElement(
          f,
          {
            type: "primary",
            icon: S ? e.createElement(S) : void 0,
            onClick: () => W(!0),
            style: Me
          },
          "创建专家"
        )
      )
    }),
    e.createElement(v, {
      items: ze,
      activeKey: Q,
      onChange: (R) => j(R)
    }),
    // Drawer
    e.createElement(sl, {
      expert: te,
      open: C,
      onClose: () => _(!1),
      onRefresh: () => re()
    }),
    // Template Modal
    e.createElement(il, {
      open: N,
      onClose: () => W(!1),
      onCreated: () => re()
    }),
    // Config Modal (gear icon)
    e.createElement(rl, {
      expert: L,
      open: X,
      onClose: () => G(!1),
      onRefresh: () => re()
    }),
    // Team Launch Modal (for filling placeholders)
    y ? e.createElement(
      E,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(xt, {
            members: y.members.map((R) => R.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${y.name}`
          )
        ),
        onCancel: () => O(null),
        onOk: () => {
          var we;
          const R = y.coordinatorName || ((we = y.members[0]) == null ? void 0 : we.name), ie = R ? rt(m, R) : null;
          if (!ie) {
            c.error("无法找到协调者专家");
            return;
          }
          let ge = y.taskTemplate;
          U.trim() && (ge = U.trim()), Z(y, ie, ge);
        },
        confirmLoading: w,
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
          y.taskTemplate
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
          value: U,
          onChange: (R) => ae(R.target.value),
          rows: 5,
          placeholder: y.taskTemplate,
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
          `协调者: ${y.coordinatorName || ((Te = y.members[0]) == null ? void 0 : Te.name) || "—"} · 成员: ${y.members.map((R) => R.name).join("、")}`
        )
      )
    ) : null
  );
}
function ul({
  mcp: e,
  onClick: t,
  onToggle: r,
  onDelete: n,
  onViewTools: a
}) {
  const l = h().React, { Card: o, Tag: i, Badge: f, Typography: c, Button: d } = h().antd, { Text: k } = c, {
    EyeOutlined: v,
    EyeInvisibleOutlined: E,
    DeleteOutlined: T,
    ToolOutlined: g
  } = h().antdIcons || {}, S = {
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
          S[e.transport] || "🔌"
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
          icon: g ? l.createElement(g) : void 0,
          onClick: a
        },
        "工具"
      ),
      l.createElement(
        d,
        {
          size: "small",
          icon: e.enabled ? E ? l.createElement(E) : void 0 : v ? l.createElement(v) : void 0,
          onClick: r
        },
        e.enabled ? "禁用" : "启用"
      ),
      l.createElement(
        d,
        {
          size: "small",
          danger: !0,
          icon: T ? l.createElement(T) : void 0,
          onClick: n
        },
        "删除"
      )
    )
  );
}
const yt = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, en = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, tn = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function nn(e) {
  return Ve(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
function At(e) {
  return Ve(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function Mt(e) {
  const t = e.map(encodeURIComponent).join(",");
  return Ve(`/ugsci/avatar/team/${t}`);
}
function Le({
  name: e,
  size: t = 32,
  borderRadius: r = "50%"
}) {
  const n = h().React, [a, l] = n.useState(0), o = a === 0 ? At(e) : `${At(e)}?_r=${a}`;
  return n.createElement("img", {
    src: o,
    alt: e,
    onError: () => {
      a < 1 && l(a + 1);
    },
    style: { width: t, height: t, borderRadius: r, objectFit: "cover", flexShrink: 0 }
  });
}
function xt({
  members: e,
  size: t = 32,
  borderRadius: r = "50%"
}) {
  const n = h().React, [a, l] = n.useState(0);
  if (!e || e.length === 0)
    return n.createElement("span", {
      style: { width: t, height: t, display: "inline-block" }
    });
  const o = e.slice(0, 5), i = a === 0 ? Mt(o) : `${Mt(o)}?_r=${a}`;
  return n.createElement("img", {
    src: i,
    alt: "team",
    onError: () => {
      a < 1 && l(a + 1);
    },
    style: { width: t, height: t, borderRadius: r, objectFit: "cover", flexShrink: 0 }
  });
}
async function pl() {
  return ne("/ugsci/engines/list");
}
async function gl(e) {
  return ne("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function yl(e, t) {
  return ne(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function fl(e) {
  return ne(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function El() {
  return ne("/ugsci/engines/detect", {
    method: "POST"
  });
}
function hl({
  engine: e,
  onClick: t
}) {
  const r = h().React, { Card: n, Tag: a, Typography: l } = h().antd, { Text: o } = l, i = e.status === "detected", f = en[e.category] || "📦", d = tn.has(e.id) ? r.createElement("img", {
    src: nn(e.id),
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
        yt[e.category] || e.category
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
function vl() {
  const e = h().React, { useState: t, useEffect: r, useCallback: n, useMemo: a } = e, {
    Spin: l,
    Empty: o,
    Button: i,
    message: f,
    Row: c,
    Col: d,
    Drawer: k,
    Descriptions: v,
    Tag: E,
    Typography: T,
    Modal: g,
    Input: S,
    Select: A,
    Popconfirm: H,
    Space: I
  } = h().antd, {
    ReloadOutlined: V,
    SearchOutlined: b,
    PlusOutlined: P,
    EditOutlined: D,
    DeleteOutlined: $,
    CopyOutlined: u,
    ExperimentOutlined: C
  } = h().antdIcons || {}, { Text: _, Paragraph: te } = T, [M, z] = t([]), [p, N] = t(!0), [W, Q] = t(""), [j, y] = t(!1), [O, U] = t(null), [ae, w] = t(!1), [F, X] = t(null), [G, L] = t({}), [x, m] = t(!1), K = n(async () => {
    N(!0);
    try {
      const Y = await pl();
      z(Y.engines || []);
    } catch (Y) {
      f.error(Y.message || "加载引擎列表失败"), z([]);
    } finally {
      N(!1);
    }
  }, []);
  r(() => {
    K();
  }, [K]);
  const re = a(() => {
    if (!W.trim()) return M;
    const Y = W.toLowerCase();
    return M.filter(
      (pe) => {
        var de;
        return pe.name.toLowerCase().includes(Y) || pe.vendor.toLowerCase().includes(Y) || pe.category.toLowerCase().includes(Y) || ((de = pe.description) == null ? void 0 : de.toLowerCase().includes(Y));
      }
    );
  }, [M, W]);
  M.filter((Y) => Y.status === "detected").length;
  const he = n((Y) => {
    navigator.clipboard.writeText(Y).then(() => f.success("路径已复制")).catch(() => f.error("复制失败"));
  }, []), Z = n(() => {
    X(null), L({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), w(!0);
  }, []), me = n((Y) => {
    X(Y), L({ ...Y }), w(!0), y(!1);
  }, []), J = n(async () => {
    var Y;
    if (!((Y = G.name) != null && Y.trim())) {
      f.warning("请输入引擎名称");
      return;
    }
    m(!0);
    try {
      F ? (await yl(F.id, G), f.success("引擎已更新")) : (await gl(G), f.success("引擎已添加")), w(!1), K();
    } catch (pe) {
      f.error(pe.message || "保存失败");
    } finally {
      m(!1);
    }
  }, [G, F, K]), oe = n(
    async (Y) => {
      try {
        await fl(Y), f.success("引擎已删除"), y(!1), K();
      } catch (pe) {
        f.error(pe.message || "删除失败");
      }
    },
    [K]
  ), se = n(async () => {
    N(!0);
    try {
      const Y = await El();
      z(Y.engines || []), f.success("自动检测完成");
    } catch (Y) {
      f.error(Y.message || "检测失败");
    } finally {
      N(!1);
    }
  }, []), le = n(
    (Y, pe, de) => {
      const ze = G[pe] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          _,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          Y
        ),
        de != null && de.select ? e.createElement(A, {
          value: ze || void 0,
          onChange: (Te) => L((R) => ({ ...R, [pe]: Te })),
          style: { width: "100%" },
          options: de.select.options,
          allowClear: !0,
          placeholder: `选择${Y}`
        }) : de != null && de.textarea ? e.createElement(S.TextArea, {
          value: ze,
          onChange: (Te) => L((R) => ({ ...R, [pe]: Te.target.value })),
          rows: 3,
          placeholder: `输入${Y}`
        }) : e.createElement(S, {
          value: ze,
          onChange: (Te) => L((R) => ({ ...R, [pe]: Te.target.value })),
          placeholder: `输入${Y}`
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
      e.createElement(S, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: b ? e.createElement(b) : void 0,
        value: W,
        onChange: (Y) => Q(Y.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        i,
        {
          icon: V ? e.createElement(V) : void 0,
          onClick: se,
          loading: p
        },
        "自动检测"
      ),
      e.createElement(
        i,
        {
          type: "primary",
          icon: P ? e.createElement(P) : void 0,
          onClick: Z,
          style: Me
        },
        "添加引擎"
      )
    ),
    // Content
    p ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(l, {
        size: "large",
        tip: "正在加载计算引擎..."
      })
    ) : re.length === 0 ? e.createElement(o, {
      description: W ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      c,
      { gutter: [12, 12], align: "stretch" },
      ...re.map(
        (Y) => e.createElement(
          d,
          {
            key: Y.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(hl, {
            engine: Y,
            onClick: () => {
              U(Y), y(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    O ? e.createElement(
      k,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            tn.has(O.id) ? e.createElement("img", {
              src: nn(O.id),
              alt: O.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              en[O.category] || "📦"
            )
          ),
          e.createElement("span", null, O.name)
        ),
        open: j,
        onClose: () => y(!1),
        width: 520,
        extra: e.createElement(
          I,
          null,
          e.createElement(
            i,
            {
              size: "small",
              icon: D ? e.createElement(D) : void 0,
              onClick: () => me(O)
            },
            "编辑"
          ),
          O.is_default ? null : e.createElement(
            H,
            {
              title: "确认删除此引擎？",
              description: O.name,
              onConfirm: () => oe(O.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              i,
              {
                size: "small",
                danger: !0,
                icon: $ ? e.createElement($) : void 0
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
          O.name
        ),
        e.createElement(
          v.Item,
          { label: "厂商" },
          O.vendor || "—"
        ),
        e.createElement(
          v.Item,
          { label: "分类" },
          O.category ? yt[O.category] || O.category : "—"
        ),
        e.createElement(
          v.Item,
          { label: "状态" },
          e.createElement(
            E,
            {
              color: O.status === "detected" ? "success" : O.status === "not_found" ? "error" : "default"
            },
            O.status === "detected" ? "✅ 已检测" : O.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          v.Item,
          { label: "版本" },
          O.version || "—"
        ),
        O.executable_path ? e.createElement(
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
              O.executable_path
            ),
            e.createElement(
              i,
              {
                size: "small",
                type: "text",
                icon: u ? e.createElement(u) : void 0,
                onClick: () => he(O.executable_path)
              }
            )
          )
        ) : null,
        O.install_dir ? e.createElement(
          v.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            O.install_dir
          )
        ) : null,
        // Display detected modules with paths
        O.modules && O.modules.length > 0 ? e.createElement(
          v.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...O.modules.map(
              (Y) => e.createElement(
                "div",
                {
                  key: Y,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  E,
                  { color: "cyan", style: { fontSize: 11 } },
                  Y
                ),
                O.module_paths && O.module_paths[Y] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  O.module_paths[Y]
                ) : null
              )
            )
          )
        ) : null,
        O.license_server ? e.createElement(
          v.Item,
          { label: "许可证服务器" },
          O.license_server
        ) : null,
        e.createElement(
          v.Item,
          { label: "描述" },
          O.description || "—"
        )
      ),
      // Invocation hint
      O.invocation_hint ? e.createElement(
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
          _,
          { strong: !0, style: { fontSize: 13 } },
          "💡 调用方式"
        ),
        e.createElement(
          "div",
          { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
          O.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        O.is_default ? e.createElement(
          E,
          { color: "blue" },
          "默认引擎"
        ) : O.is_custom ? e.createElement(
          E,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      g,
      {
        title: F ? "编辑引擎" : "添加计算引擎",
        open: ae,
        onOk: J,
        onCancel: () => w(!1),
        okText: F ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: x,
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
            options: Object.entries(yt).map(([Y, pe]) => ({
              label: pe,
              value: Y
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
function bl() {
  const e = h().React, { useState: t, useEffect: r, useCallback: n, useMemo: a } = e, {
    Spin: l,
    Empty: o,
    Input: i,
    Button: f,
    message: c,
    Row: d,
    Col: k,
    Drawer: v,
    Descriptions: E,
    Tag: T,
    Typography: g,
    List: S,
    Tabs: A,
    Modal: H
  } = h().antd, {
    ReloadOutlined: I,
    PlusOutlined: V,
    SearchOutlined: b,
    ApiOutlined: P,
    RocketOutlined: D,
    ToolOutlined: $,
    DeleteOutlined: u,
    EyeOutlined: C,
    EyeInvisibleOutlined: _
  } = h().antdIcons || {}, { Text: te } = g, { TextArea: M } = i, p = h().useSelectedAgent, N = p ? p() : null, W = (N == null ? void 0 : N.id) || "default", [Q, j] = t([]), [y, O] = t(!0), [U, ae] = t(""), [w, F] = t(!1), [X, G] = t(null), [L, x] = t("mcp"), [m, K] = t(!1), [re, he] = t(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [Z, me] = t(!1), [J, oe] = t(!1), [se, le] = t(null), [Y, pe] = t(!1), [de, ze] = t(null), [Te, R] = t([]), [ie, ge] = t(!1), [we, Se] = t(""), Ce = n(async () => {
    O(!0);
    try {
      const ee = await kn(W);
      j(ee);
    } catch (ee) {
      c.error(ee.message || "加载 MCP 列表失败"), j([]);
    } finally {
      O(!1);
    }
  }, [W]);
  r(() => {
    Ce();
  }, [Ce]);
  const $e = n(
    async (ee) => {
      try {
        await Tn(W, ee.key), c.success(ee.enabled ? "已禁用" : "已启用"), Ce();
      } catch (ce) {
        c.error(ce.message || "切换状态失败");
      }
    },
    [W, Ce]
  ), Ue = n(async () => {
    if (se)
      try {
        await In(W, se.key), c.success(`MCP「${se.key}」已删除`), oe(!1), le(null), Ce();
      } catch (ee) {
        c.error(ee.message || "删除失败");
      }
  }, [W, se, Ce]), Oe = n(async () => {
    me(!0);
    try {
      const ee = JSON.parse(re), ce = ee.mcpServers || ee, B = Object.entries(ce);
      if (B.length === 0) {
        c.warning("未找到 MCP 客户端配置");
        return;
      }
      let ke = !0;
      for (const [xe, be] of B) {
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
          await zn(
            W,
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
  }, [re, W, Ce]), Fe = n(
    async (ee) => {
      ze(ee), pe(!0), R([]), Se(""), ge(!0);
      try {
        const ce = await Pn(
          W,
          ee.key
        );
        R(ce);
      } catch (ce) {
        Se(
          ce.message || "无法加载工具列表（MCP 服务可能未运行）"
        );
      } finally {
        ge(!1);
      }
    },
    [W]
  ), Ge = a(() => {
    if (!U.trim()) return Q;
    const ee = U.toLowerCase();
    return Q.filter(
      (ce) => {
        var B;
        return ce.name.toLowerCase().includes(ee) || ce.key.toLowerCase().includes(ee) || ((B = ce.description) == null ? void 0 : B.toLowerCase().includes(ee)) || ce.transport.toLowerCase().includes(ee);
      }
    );
  }, [Q, U]), Be = Q.filter((ee) => ee.enabled).length, Re = Q.reduce((ee, ce) => {
    var B;
    return ee + (((B = ce.tools) == null ? void 0 : B.length) || 0);
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
        prefix: b ? e.createElement(b) : void 0,
        value: U,
        onChange: (ee) => ae(ee.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      e.createElement(
        f,
        {
          type: "primary",
          icon: V ? e.createElement(V) : void 0,
          onClick: () => K(!0),
          style: Me
        },
        "添加 MCP"
      )
    ),
    y ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(l, { size: "large" })
    ) : Ge.length === 0 ? e.createElement(o, {
      description: U ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「添加 MCP」创建"
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
          e.createElement(ul, {
            mcp: ee,
            onClick: () => {
              G(ee), F(!0);
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
        P ? e.createElement(P, { style: { fontSize: 14 } }) : null,
        "MCP 客户端"
      ),
      children: je
    },
    {
      key: "software",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        D ? e.createElement(D, { style: { fontSize: 14 } }) : null,
        "计算引擎"
      ),
      children: e.createElement(vl)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(ct, {
      title: "工具",
      subtitle: `MCP: ${Q.length} 个客户端（${Be} 个启用）· ${Re} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          f,
          {
            icon: I ? e.createElement(I) : void 0,
            onClick: Ce,
            loading: y
          },
          "刷新"
        )
      )
    }),
    e.createElement(A, {
      items: He,
      activeKey: L,
      onChange: (ee) => x(ee)
    }),
    // MCP Detail drawer
    X ? e.createElement(
      v,
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
        open: w,
        onClose: () => F(!1),
        width: 480
      },
      e.createElement(
        E,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          E.Item,
          { label: "Key" },
          e.createElement(
            "code",
            { style: { fontSize: 12 } },
            X.key
          )
        ),
        e.createElement(
          E.Item,
          { label: "名称" },
          X.name || "-"
        ),
        e.createElement(
          E.Item,
          { label: "描述" },
          X.description || "-"
        ),
        e.createElement(
          E.Item,
          { label: "状态" },
          e.createElement(
            T,
            { color: X.enabled ? "green" : "default" },
            X.enabled ? "启用" : "停用"
          )
        ),
        e.createElement(
          E.Item,
          { label: "传输方式" },
          X.transport
        ),
        X.url ? e.createElement(
          E.Item,
          { label: "URL" },
          X.url
        ) : null,
        X.command ? e.createElement(
          E.Item,
          { label: "命令" },
          e.createElement(
            "code",
            { style: { fontSize: 11 } },
            X.command
          )
        ) : null,
        X.args && X.args.length > 0 ? e.createElement(
          E.Item,
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
        e.createElement(S, {
          size: "small",
          dataSource: X.tools,
          renderItem: (ee) => e.createElement(
            S.Item,
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
              P ? e.createElement(P, {
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
      H,
      {
        title: "添加 MCP 客户端 (JSON)",
        open: m,
        onCancel: () => K(!1),
        onOk: Oe,
        confirmLoading: Z,
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
      e.createElement(M, {
        value: re,
        onChange: (ee) => he(ee.target.value),
        autoSize: { minRows: 12, maxRows: 20 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      })
    ),
    // ── Delete Confirmation Modal ──
    e.createElement(
      H,
      {
        title: "确认删除",
        open: J,
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
      H,
      {
        title: de ? `${de.name || de.key} - 工具列表` : "工具列表",
        open: Y,
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
      }) : e.createElement(S, {
        size: "small",
        dataSource: Te,
        renderItem: (ee) => e.createElement(
          S.Item,
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
              P ? e.createElement(P, {
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
function Sl({
  agentId: e,
  agentName: t,
  onNavigate: r
}) {
  const n = h().React, { useState: a, useEffect: l, useCallback: o } = n, {
    Spin: i,
    Empty: f,
    Button: c,
    Row: d,
    Col: k,
    Card: v,
    Tag: E,
    Checkbox: T,
    Modal: g,
    Typography: S,
    Drawer: A,
    Descriptions: H,
    message: I
  } = h().antd, {
    ReloadOutlined: V,
    ThunderboltOutlined: b,
    SettingOutlined: P,
    CheckSquareOutlined: D,
    EyeOutlined: $,
    EyeInvisibleOutlined: u,
    DeleteOutlined: C,
    CloseOutlined: _
  } = h().antdIcons || {}, { Text: te, Paragraph: M } = S, [z, p] = a([]), [N, W] = a(!0), [Q, j] = a(!1), [y, O] = a(null), [U, ae] = a(!1), [w, F] = a(
    /* @__PURE__ */ new Set()
  ), [X, G] = a(!1), L = o(async () => {
    if (e) {
      W(!0);
      try {
        const J = await it(e);
        p(J);
      } catch (J) {
        I.error(J.message || "加载技能失败"), p([]);
      } finally {
        W(!1);
      }
    }
  }, [e]);
  l(() => {
    L();
  }, [L]);
  const x = (J) => {
    F((oe) => {
      const se = new Set(oe);
      return se.has(J) ? se.delete(J) : se.add(J), se;
    });
  }, m = () => F(/* @__PURE__ */ new Set()), K = () => F(new Set(z.map((J) => J.name))), re = () => {
    U ? (m(), ae(!1)) : ae(!0);
  }, he = async () => {
    const J = Array.from(w);
    if (J.length !== 0) {
      G(!0);
      try {
        const { results: oe } = await jn(e, J), se = Object.entries(oe).filter(
          ([, Y]) => Y.success === !1
        ), le = J.length - se.length;
        se.length > 0 ? I.warning(
          `批量启用完成：成功 ${le} 个，失败 ${se.length} 个`
        ) : I.success(`成功启用 ${J.length} 个技能`), m(), await L();
      } catch (oe) {
        I.error(oe.message || "批量启用失败");
      } finally {
        G(!1);
      }
    }
  }, Z = async () => {
    const J = Array.from(w);
    if (J.length !== 0) {
      G(!0);
      try {
        const { results: oe } = await Dn(e, J), se = Object.entries(oe).filter(
          ([, Y]) => Y.success === !1
        ), le = J.length - se.length;
        se.length > 0 ? I.warning(
          `批量停用完成：成功 ${le} 个，失败 ${se.length} 个`
        ) : I.success(`成功停用 ${J.length} 个技能`), m(), await L();
      } catch (oe) {
        I.error(oe.message || "批量停用失败");
      } finally {
        G(!1);
      }
    }
  }, me = () => {
    const J = Array.from(w);
    J.length !== 0 && g.confirm({
      title: `确认删除 ${J.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        G(!0);
        try {
          const { results: oe } = await Nn(e, J), se = Object.entries(oe).filter(
            ([, Y]) => Y.success === !1
          ), le = J.length - se.length;
          se.length > 0 ? I.warning(
            `批量删除完成：成功 ${le} 个，失败 ${se.length} 个`
          ) : I.success(`成功删除 ${J.length} 个技能`), m(), await L();
        } catch (oe) {
          I.error(oe.message || "批量删除失败");
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
        te,
        { type: "secondary", style: { fontSize: 13 } },
        U ? `已选择 ${w.size} / ${z.length} 个技能` : `共 ${z.length} 个技能`
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        U ? n.createElement(
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
              icon: _ ? n.createElement(_) : void 0,
              onClick: m
            },
            "取消选择"
          ),
          n.createElement(
            c,
            {
              size: "small",
              type: "default",
              icon: $ ? n.createElement($) : void 0,
              disabled: w.size === 0 || X,
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
              icon: u ? n.createElement(u) : void 0,
              disabled: w.size === 0 || X,
              loading: X,
              onClick: Z
            },
            "批量停用"
          ),
          n.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: C ? n.createElement(C) : void 0,
              disabled: w.size === 0 || X,
              loading: X,
              onClick: me
            },
            `删除 (${w.size})`
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
              icon: D ? n.createElement(D) : void 0,
              onClick: re,
              disabled: z.length === 0
            },
            "批量管理"
          ),
          n.createElement(
            c,
            {
              icon: V ? n.createElement(V) : void 0,
              onClick: L,
              loading: N,
              size: "small"
            },
            "刷新"
          )
        )
      )
    ),
    N ? n.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      n.createElement(i, { size: "large" })
    ) : z.length === 0 ? n.createElement(f, {
      description: "当前智能体未加载任何技能"
    }) : n.createElement(
      d,
      { gutter: [12, 12] },
      ...z.map(
        (J) => n.createElement(
          k,
          { key: J.name, xs: 24, sm: 12, md: 8, lg: 6 },
          n.createElement(
            v,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: U ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: U && w.has(J.name) ? "#0072f5" : void 0,
                borderWidth: U && w.has(J.name) ? 2 : 1
              },
              onClick: () => {
                U ? x(J.name) : (O(J), j(!0));
              }
            },
            U ? n.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (oe) => {
                  oe.stopPropagation(), x(J.name);
                }
              },
              n.createElement(T, {
                checked: w.has(J.name)
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
              J.emoji ? n.createElement(
                "span",
                { style: { fontSize: 18 } },
                J.emoji
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
                J.name
              ),
              J.enabled === !1 ? n.createElement(
                E,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : n.createElement(
                E,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            J.description ? n.createElement(
              M,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              J.description
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
              J.version_text ? n.createElement(
                E,
                { style: { fontSize: 10 } },
                `v${J.version_text}`
              ) : null,
              ...(J.tags || []).slice(0, 3).map(
                (oe, se) => n.createElement(
                  E,
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
    y ? n.createElement(
      A,
      {
        title: n.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          n.createElement(
            "span",
            { style: { fontSize: 18 } },
            y.emoji || "⚡"
          ),
          n.createElement("span", null, y.name)
        ),
        open: Q,
        onClose: () => j(!1),
        width: 520,
        extra: n.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: P ? n.createElement(P) : void 0,
            onClick: () => r("/skills")
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
          y.name
        ),
        n.createElement(
          H.Item,
          { label: "描述" },
          y.description || "-"
        ),
        y.version_text ? n.createElement(
          H.Item,
          { label: "版本" },
          y.version_text
        ) : null,
        n.createElement(
          H.Item,
          { label: "来源" },
          y.source || "-"
        ),
        n.createElement(
          H.Item,
          { label: "状态" },
          y.enabled === !1 ? "已禁用" : "已启用"
        ),
        y.installed_from ? n.createElement(
          H.Item,
          { label: "安装来源" },
          y.installed_from
        ) : null
      ),
      // Tags
      y.tags && y.tags.length > 0 ? n.createElement(
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
          ...y.tags.map(
            (J, oe) => n.createElement(E, { key: oe, color: "blue" }, J)
          )
        )
      ) : null,
      // Skill content preview
      y.content ? n.createElement(
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
          y.content.slice(0, 2e3) + (y.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function xl({
  poolSkills: e,
  workspaceSkills: t,
  agents: r,
  loading: n,
  onReload: a
}) {
  const l = h().React, { useState: o, useMemo: i, useCallback: f } = l, {
    Spin: c,
    Empty: d,
    Input: k,
    Button: v,
    Row: E,
    Col: T,
    Card: g,
    Tag: S,
    Typography: A,
    Drawer: H,
    Descriptions: I,
    List: V
  } = h().antd, {
    ReloadOutlined: b,
    SearchOutlined: P,
    DownloadOutlined: D,
    ThunderboltOutlined: $
  } = h().antdIcons || {}, { Text: u, Paragraph: C } = A, [_, te] = o(""), [M, z] = o(!1), [p, N] = o(null), [W, Q] = o([]), [j, y] = o(!1), [O, U] = o(24), ae = i(() => {
    if (!_.trim()) return e;
    const x = _.toLowerCase();
    return e.filter(
      (m) => {
        var K, re;
        return m.name.toLowerCase().includes(x) || ((K = m.description) == null ? void 0 : K.toLowerCase().includes(x)) || ((re = m.tags) == null ? void 0 : re.some((he) => he.toLowerCase().includes(x)));
      }
    );
  }, [e, _]), w = i(
    () => ae.slice(0, O),
    [ae, O]
  ), F = f((x) => {
    te(x), U(24);
  }, []), X = f(
    (x) => {
      const m = [];
      for (const K of t)
        if (K.skills.some((re) => re.name === x)) {
          const re = r.find((he) => he.id === K.agent_id);
          m.push((re == null ? void 0 : re.name) || K.agent_name || K.agent_id);
        }
      return m;
    },
    [t, r]
  ), G = f(
    async (x) => {
      if (N(x), Q(X(x.name)), z(!0), !x.content) {
        y(!0);
        try {
          const m = await wn(x.name);
          N({ ...x, content: m });
        } catch {
        } finally {
          y(!1);
        }
      }
    },
    [X]
  ), L = (x) => {
    window.history.pushState({}, "", x), window.dispatchEvent(new PopStateEvent("popstate"));
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
        prefix: P ? l.createElement(P) : void 0,
        value: _,
        onChange: (x) => F(x.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        l.createElement(
          v,
          {
            icon: b ? l.createElement(b) : void 0,
            onClick: a,
            loading: n,
            size: "small"
          },
          "刷新"
        ),
        l.createElement(
          v,
          {
            type: "primary",
            icon: D ? l.createElement(D) : void 0,
            onClick: () => L("/skill-pool"),
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
      description: _ ? "未找到匹配的技能" : "技能池为空"
    }) : l.createElement(
      l.Fragment,
      null,
      l.createElement(
        E,
        { gutter: [12, 12] },
        ...w.map(
          (x) => l.createElement(
            T,
            { key: x.name, xs: 24, sm: 12, md: 8, lg: 6 },
            l.createElement(
              g,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => G(x)
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
                x.emoji ? l.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  x.emoji
                ) : l.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "⚡"
                ),
                l.createElement(
                  u,
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
                  x.name
                ),
                x.protected ? l.createElement(
                  S,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              x.description ? l.createElement(
                C,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                x.description
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
                x.version_text ? l.createElement(
                  S,
                  { style: { fontSize: 10 } },
                  `v${x.version_text}`
                ) : null,
                ...(x.tags || []).slice(0, 3).map(
                  (m, K) => l.createElement(
                    S,
                    { key: K, color: "cyan", style: { fontSize: 10 } },
                    m
                  )
                )
              )
            )
          )
        ),
        // Load more button
        w.length < ae.length ? l.createElement(
          "div",
          { style: { textAlign: "center", marginTop: 16 } },
          l.createElement(
            v,
            {
              onClick: () => U((x) => x + 24),
              size: "small"
            },
            `加载更多 (剩余 ${ae.length - w.length} 个)`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    p ? l.createElement(
      H,
      {
        title: l.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          l.createElement(
            "span",
            { style: { fontSize: 18 } },
            p.emoji || "⚡"
          ),
          l.createElement("span", null, p.name)
        ),
        open: M,
        onClose: () => z(!1),
        width: 520,
        extra: l.createElement(
          v,
          {
            type: "primary",
            size: "small",
            icon: $ ? l.createElement($) : void 0,
            onClick: () => L("/skills")
          },
          "管理技能"
        )
      },
      l.createElement(
        I,
        { column: 1, bordered: !0, size: "small" },
        l.createElement(
          I.Item,
          { label: "技能名称" },
          p.name
        ),
        l.createElement(
          I.Item,
          { label: "描述" },
          p.description || "-"
        ),
        p.version_text ? l.createElement(
          I.Item,
          { label: "版本" },
          p.version_text
        ) : null,
        l.createElement(
          I.Item,
          { label: "来源" },
          p.source || "-"
        ),
        l.createElement(
          I.Item,
          { label: "受保护" },
          p.protected ? "是（内置）" : "否"
        ),
        p.sync_status ? l.createElement(
          I.Item,
          { label: "同步状态" },
          p.sync_status
        ) : null,
        p.installed_from ? l.createElement(
          I.Item,
          { label: "安装来源" },
          p.installed_from
        ) : null
      ),
      // Tags
      p.tags && p.tags.length > 0 ? l.createElement(
        "div",
        { style: { marginTop: 16 } },
        l.createElement(
          u,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        l.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...p.tags.map(
            (x, m) => l.createElement(S, { key: m, color: "cyan" }, x)
          )
        )
      ) : null,
      // Installed agents
      l.createElement(
        "div",
        { style: { marginTop: 16 } },
        l.createElement(
          u,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${W.length})`
        ),
        W.length > 0 ? l.createElement(V, {
          size: "small",
          dataSource: W,
          renderItem: (x) => l.createElement(
            V.Item,
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
              l.createElement(Le, { name: x, size: 20 }),
              l.createElement(
                u,
                { style: { fontSize: 13 } },
                x
              )
            )
          )
        }) : l.createElement(
          u,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      j ? l.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        l.createElement(c, { size: "small" })
      ) : p.content ? l.createElement(
        "div",
        { style: { marginTop: 16 } },
        l.createElement(
          u,
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
          p.content.slice(0, 2e3) + (p.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function wl() {
  const e = h().React, { useState: t, useEffect: r, useCallback: n, useMemo: a } = e, { Tabs: l, message: o } = h().antd, { ThunderboltOutlined: i, AppstoreOutlined: f } = h().antdIcons || {}, d = h().useSelectedAgent, k = d ? d() : null, v = (k == null ? void 0 : k.id) || "default", [E, T] = t([]), [g, S] = t([]), [A, H] = t([]), [I, V] = t(!0), [b, P] = t("agent-skills"), D = n(async () => {
    V(!0);
    try {
      const [_, te, M] = await Promise.all([
        vt(!0),
        ht(),
        Cn()
      ]);
      S(_), T(te), H(M);
    } catch (_) {
      o.error(_.message || "加载技能列表失败"), S([]);
    } finally {
      V(!1);
    }
  }, []);
  r(() => {
    D();
  }, [D]);
  const $ = a(() => {
    const _ = E.find((te) => te.id === v);
    return (_ == null ? void 0 : _.name) || v;
  }, [E, v]), u = (_) => {
    window.history.pushState({}, "", _), window.dispatchEvent(new PopStateEvent("popstate"));
  }, C = [
    {
      key: "agent-skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        i ? e.createElement(i, { style: { fontSize: 14 } }) : null,
        "当前Agent加载技能"
      ),
      children: e.createElement(Sl, {
        agentId: v,
        agentName: $,
        onNavigate: u
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
      children: e.createElement(xl, {
        poolSkills: g,
        workspaceSkills: A,
        agents: E,
        loading: I,
        onReload: D
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(ct, {
      title: "技能",
      subtitle: `技能池共 ${g.length} 个技能 · 当前智能体：${$}`
    }),
    e.createElement(l, {
      items: C,
      activeKey: b,
      onChange: (_) => P(_)
    })
  );
}
const ft = "ugsci.market.githubSources", $t = "https://github.com/anthropics/skills/tree/main/skills", ln = "ugsci.market.mcpSources", an = "ugsci.market.expertSources";
function rn(e, t) {
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
function on(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function Cl() {
  return rn(ln, "mcp");
}
function nt(e) {
  on(ln, e);
}
function kl() {
  return rn(an, "expert");
}
function lt(e) {
  on(an, e);
}
function sn(e) {
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
function cn(e, t, r) {
  return `${e}/${t}:${r || "/"}`;
}
function Tl() {
  try {
    const e = localStorage.getItem(ft);
    if (!e) {
      const r = sn($t);
      if (r) {
        const n = [
          {
            id: cn(
              r.owner,
              r.repo,
              r.skillsPath
            ),
            url: $t,
            label: r.label,
            owner: r.owner,
            repo: r.repo,
            ref: r.ref,
            skillsPath: r.skillsPath,
            enabled: !0
          }
        ];
        return localStorage.setItem(ft, JSON.stringify(n)), n;
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
      ft,
      JSON.stringify(e)
    );
  } catch {
  }
}
function Il(e) {
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
async function zl(e) {
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
        const v = await k.text(), E = Il(v);
        return {
          ...d,
          name: E.name || i.name,
          description: E.description || "",
          version: E.version || null,
          author: E.author || null
        };
      } catch {
        return d;
      }
    })
  );
}
async function Pl(e) {
  const t = e.filter((l) => l.enabled), r = await Promise.all(
    t.map(async (l) => {
      try {
        return { skills: await zl(l), error: null, label: l.label };
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
function _l({
  open: e,
  onClose: t,
  sources: r,
  onChange: n
}) {
  const a = h().React, { useState: l } = a, {
    Modal: o,
    Input: i,
    Button: f,
    List: c,
    Tag: d,
    Switch: k,
    Typography: v,
    Tooltip: E,
    message: T
  } = h().antd, {
    PlusOutlined: g,
    DeleteOutlined: S,
    LinkOutlined: A,
    GithubOutlined: H
  } = h().antdIcons || {}, { Text: I } = v, [V, b] = l(""), P = () => {
    const u = V.trim();
    if (!u) return;
    const C = sn(u);
    if (!C) {
      T.error("无效的 GitHub URL，请输入类似 https://github.com/owner/repo/tree/main/skills 的链接");
      return;
    }
    const _ = cn(C.owner, C.repo, C.skillsPath);
    if (r.some((z) => z.id === _)) {
      T.warning("该源已存在");
      return;
    }
    const te = {
      id: _,
      url: u,
      label: C.label,
      owner: C.owner,
      repo: C.repo,
      ref: C.ref,
      skillsPath: C.skillsPath,
      enabled: !0
    }, M = [...r, te];
    ut(M), n(M), b(""), T.success(`已添加源: ${C.label}`);
  }, D = (u, C) => {
    const _ = r.map(
      (te) => te.id === u ? { ...te, enabled: C } : te
    );
    ut(_), n(_);
  }, $ = (u) => {
    const C = r.filter((_) => _.id !== u);
    ut(C), n(C), T.success("已移除源");
  };
  return a.createElement(
    o,
    {
      open: e,
      onCancel: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        H ? a.createElement(H, { style: { fontSize: 18 } }) : null,
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
        I,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(i, {
          placeholder: "https://github.com/anthropics/skills/tree/main/skills",
          value: V,
          onChange: (u) => b(u.target.value),
          onPressEnter: P,
          prefix: A ? a.createElement(A) : void 0,
          style: { flex: 1 }
        }),
        a.createElement(
          f,
          {
            type: "primary",
            icon: g ? a.createElement(g) : void 0,
            onClick: P
          },
          "添加"
        )
      )
    ),
    a.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      a.createElement(I, { strong: !0 }, `已配置源 (${r.length})`)
    ),
    a.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: r,
      renderItem: (u) => a.createElement(
        c.Item,
        {
          actions: [
            a.createElement(
              E,
              { title: u.enabled ? "点击禁用" : "点击启用" },
              a.createElement(k, {
                size: "small",
                checked: u.enabled,
                onChange: (C) => D(u.id, C)
              })
            ),
            a.createElement(
              E,
              { title: "移除此源" },
              a.createElement(
                f,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: S ? a.createElement(S) : void 0,
                  onClick: () => $(u.id)
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
              u.label
            ),
            u.skillsPath ? a.createElement(
              I,
              { type: "secondary", style: { fontSize: 11 } },
              `/${u.skillsPath}`
            ) : null,
            a.createElement(
              I,
              { type: "secondary", style: { fontSize: 11 } },
              `@${u.ref}`
            )
          ),
          a.createElement(
            I,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            u.url
          )
        )
      )
    })
  );
}
function Rt({
  open: e,
  onClose: t,
  sources: r,
  onChange: n,
  type: a
}) {
  const l = h().React, { useState: o } = l, {
    Modal: i,
    Input: f,
    Button: c,
    List: d,
    Tag: k,
    Switch: v,
    Typography: E,
    Tooltip: T,
    message: g
  } = h().antd, {
    PlusOutlined: S,
    DeleteOutlined: A,
    LinkOutlined: H,
    ApiOutlined: I,
    UserOutlined: V,
    ImportOutlined: b,
    ExportOutlined: P,
    CopyOutlined: D
  } = h().antdIcons || {}, { Text: $ } = E, [u, C] = o(""), [_, te] = o(""), [M, z] = o(""), [p, N] = o(!1), W = a === "mcp" ? "MCP" : "专家模板", Q = a === "mcp" ? I ? l.createElement(I, { style: { fontSize: 18 } }) : null : V ? l.createElement(V, { style: { fontSize: 18 } }) : null, j = () => {
    const w = u.trim(), F = _.trim();
    if (!w) return;
    const X = F || w.slice(0, 40), G = `${a}:${w}`;
    if (r.some((m) => m.id === G)) {
      g.warning("该源已存在");
      return;
    }
    const L = {
      id: G,
      label: X,
      url: w,
      enabled: !0,
      type: a
    }, x = [...r, L];
    a === "mcp" ? nt(x) : lt(x), n(x), C(""), te(""), g.success(`已添加${W}源: ${X}`);
  }, y = (w, F) => {
    const X = r.map(
      (G) => G.id === w ? { ...G, enabled: F } : G
    );
    a === "mcp" ? nt(X) : lt(X), n(X);
  }, O = (w) => {
    const F = r.filter((X) => X.id !== w);
    a === "mcp" ? nt(F) : lt(F), n(F), g.success("已移除源");
  }, U = () => {
    const w = JSON.stringify(
      { type: a, sources: r },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(w), g.success(`${W}源已复制到剪贴板（${r.length} 个源）`);
    } catch {
      const F = document.createElement("textarea");
      F.value = w, document.body.appendChild(F), F.select(), document.execCommand("copy"), document.body.removeChild(F), g.success(`${W}源已复制到剪贴板（${r.length} 个源）`);
    }
  }, ae = () => {
    const w = M.trim();
    if (!w) {
      g.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const F = JSON.parse(w);
      let X = [];
      if (Array.isArray(F))
        X = F;
      else if (F && Array.isArray(F.sources))
        X = F.sources;
      else if (F && typeof F == "object")
        X = [F];
      else
        throw new Error("Invalid format");
      const G = X.filter(
        (K) => K && typeof K.url == "string" && typeof K.label == "string"
      );
      if (G.length === 0) {
        g.error("未找到有效的源数据");
        return;
      }
      const L = new Set(r.map((K) => K.id)), x = [];
      for (const K of G) {
        const re = K.id || `${a}:${K.url}`;
        L.has(re) || x.push({
          id: re,
          label: K.label,
          url: K.url,
          enabled: K.enabled !== !1,
          type: a
        });
      }
      if (x.length === 0) {
        g.info("所有源均已存在，无新增");
        return;
      }
      const m = [...r, ...x];
      a === "mcp" ? nt(m) : lt(m), n(m), z(""), N(!1), g.success(`成功导入 ${x.length} 个${W}源`);
    } catch (F) {
      g.error(`JSON 解析失败: ${F.message || "格式错误"}`);
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
        Q,
        l.createElement("span", null, `配置${W}源`)
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
              icon: P ? l.createElement(P) : void 0,
              onClick: U,
              disabled: r.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          l.createElement(
            c,
            {
              icon: b ? l.createElement(b) : void 0,
              onClick: () => N(!p),
              size: "small"
            },
            p ? "隐藏导入" : "导入JSON"
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
      $,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${W}源地址，支持从远程仓库或团队共享的 JSON 导入${W}配置。`
    ),
    // Import section (collapsible)
    p ? l.createElement(
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
        $,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${W}源 JSON（支持从导出的剪贴板内容粘贴）`
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
        value: M,
        onChange: (w) => z(w.target.value),
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
            onClick: () => z("")
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
        value: _,
        onChange: (w) => te(w.target.value),
        style: { width: 200 }
      }),
      l.createElement(f, {
        placeholder: a === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: u,
        onChange: (w) => C(w.target.value),
        onPressEnter: j,
        prefix: H ? l.createElement(H) : void 0,
        style: { flex: 1 }
      }),
      l.createElement(
        c,
        {
          type: "primary",
          icon: S ? l.createElement(S) : void 0,
          onClick: j
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
        $,
        { strong: !0 },
        `已配置源 (${r.length})`
      )
    ),
    l.createElement(d, {
      size: "small",
      bordered: !0,
      dataSource: r,
      renderItem: (w) => l.createElement(
        d.Item,
        {
          actions: [
            l.createElement(
              T,
              { title: w.enabled ? "点击禁用" : "点击启用" },
              l.createElement(v, {
                size: "small",
                checked: w.enabled,
                onChange: (F) => y(w.id, F)
              })
            ),
            l.createElement(
              T,
              { title: "移除此源" },
              l.createElement(
                c,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: A ? l.createElement(A) : void 0,
                  onClick: () => O(w.id)
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
              w.label
            ),
            w.enabled ? null : l.createElement(
              k,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          l.createElement(
            $,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            w.url
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
async function Ol() {
  return ne("/market/providers");
}
async function Al(e) {
  return ne(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Ml(e, t, r, n, a) {
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
async function Lt(e, t, r) {
  return ne("/skills/hub/install/start", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({
      bundle_url: t,
      enable: r
    })
  });
}
async function Bt(e, t) {
  return ne(
    `/skills/hub/install/status/${encodeURIComponent(t)}`,
    {
      headers: { "X-Agent-Id": e }
    }
  );
}
function $l() {
  const e = h().React, { useState: t, useEffect: r, useCallback: n, useMemo: a, useRef: l } = e, {
    Spin: o,
    Empty: i,
    Input: f,
    Button: c,
    message: d,
    Row: k,
    Col: v,
    Card: E,
    Tag: T,
    Tooltip: g,
    Typography: S,
    Select: A,
    Drawer: H,
    Descriptions: I,
    Tabs: V,
    Badge: b,
    Progress: P
  } = h().antd, {
    ReloadOutlined: D,
    SearchOutlined: $,
    DownloadOutlined: u,
    AppstoreOutlined: C,
    ShopOutlined: _,
    CheckCircleOutlined: te,
    LoadingOutlined: M,
    UserOutlined: z,
    SettingOutlined: p,
    GithubOutlined: N,
    ApiOutlined: W
  } = h().antdIcons || {}, { Text: Q, Paragraph: j, Title: y } = S, [O, U] = t("skills"), [ae, w] = t([]), [F, X] = t([]), [G, L] = t([]), [x, m] = t(""), [K, re] = t(""), [he, Z] = t(!1), [me, J] = t(!1), [oe, se] = t(
    {}
  ), [le, Y] = t(null), [pe, de] = t({}), [ze, Te] = t([]), [R, ie] = t(""), [ge, we] = t(""), [Se, Ce] = t(""), [$e, Ue] = t({}), [Oe, Fe] = t(""), [Ge, Be] = t(/* @__PURE__ */ new Set()), [Re, je] = t([]), [He, ee] = t([]), [ce, B] = t(!1), [ke, xe] = t(!1), [be, Ie] = t(""), [We, ye] = t([]), [mt, Ye] = t(!1), [Qe, De] = t([]), [mn, wt] = t(!1), Xe = l(null);
  r(() => {
    Promise.all([
      Ol().catch(() => []),
      Al("zh").catch(() => []),
      ht().catch(() => [])
    ]).then(([s, q, ue]) => {
      w(s), X(q), Te(ue), ue.length > 0 && (ie(ue[0].id), Fe(ue[0].id));
    });
  }, []);
  const Ze = n(async (s) => {
    const q = s ?? Tl();
    if (je(s || q), q.filter((fe) => fe.enabled).length === 0) {
      ee([]);
      return;
    }
    B(!0);
    try {
      const { skills: fe, errors: Pe } = await Pl(q);
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
      B(!1);
    }
  }, []);
  r(() => {
    Ze(), ye(Cl()), De(kl());
  }, [Ze]);
  const et = n(
    async (s, q, ue) => {
      Z(!0);
      try {
        const fe = await Ml(
          s,
          ue,
          20,
          "zh",
          q || void 0
        );
        ue === void 0 || Object.keys(ue).length === 0 ? L(fe.results) : L((ve) => [...ve, ...fe.results]);
        const Pe = Object.values(fe.by_provider || {}).some(
          (ve) => ve.has_more
        );
        J(Pe);
        const Ee = {};
        for (const [ve, _e] of Object.entries(fe.by_provider || {}))
          Ee[ve] = (ue[ve] || 1) + 1;
        if (se(Ee), fe.errors.length > 0)
          for (const ve of fe.errors)
            console.warn(
              `[ugsci] Market provider '${ve.provider}' error: ${ve.message}`
            );
      } catch (fe) {
        d.error(fe.message || "搜索市场失败"), L([]);
      } finally {
        Z(!1);
      }
    },
    []
  );
  r(() => (Xe.current && clearTimeout(Xe.current), Xe.current = setTimeout(() => {
    et(x, K, {});
  }, 400), () => {
    Xe.current && clearTimeout(Xe.current);
  }), [x, K, et]);
  const dn = () => {
    et(x, K, oe);
  }, Ct = async (s) => {
    var ue;
    if (!R) {
      d.warning("请先选择安装目标专家");
      return;
    }
    const q = `${s.source}:${s.slug}`;
    try {
      de((Ee) => ({ ...Ee, [q]: "starting" }));
      const fe = await Lt(
        R,
        s.source_url,
        !0
      );
      de((Ee) => ({ ...Ee, [q]: "installing" }));
      const Pe = 60;
      for (let Ee = 0; Ee < Pe; Ee++) {
        await new Promise((_e) => setTimeout(_e, 2e3));
        const ve = await Bt(
          R,
          fe.task_id
        );
        if (ve.status === "completed" && ((ue = ve.result) != null && ue.installed)) {
          d.success(`技能「${ve.result.name || s.name}」安装成功`), de((_e) => {
            const Ae = { ..._e };
            return delete Ae[q], Ae;
          });
          return;
        }
        if (ve.status === "failed")
          throw new Error(ve.error || "安装失败");
        if (ve.status === "cancelled") {
          d.info("安装已取消"), de((_e) => {
            const Ae = { ..._e };
            return delete Ae[q], Ae;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (fe) {
      d.error(fe.message || "安装技能失败"), de((Pe) => {
        const Ee = { ...Pe };
        return delete Ee[q], Ee;
      });
    }
  }, un = (s) => {
    window.history.pushState({}, "", s), window.dispatchEvent(new PopStateEvent("popstate"));
  }, pn = async (s) => {
    var ue;
    if (!R) {
      d.warning("请先选择安装目标专家");
      return;
    }
    const q = `github:${s.sourceId}:${s.name}`;
    try {
      de((Ee) => ({ ...Ee, [q]: "starting" }));
      const fe = await Lt(
        R,
        s.source_url,
        !0
      );
      de((Ee) => ({ ...Ee, [q]: "installing" }));
      const Pe = 60;
      for (let Ee = 0; Ee < Pe; Ee++) {
        await new Promise((_e) => setTimeout(_e, 2e3));
        const ve = await Bt(
          R,
          fe.task_id
        );
        if (ve.status === "completed" && ((ue = ve.result) != null && ue.installed)) {
          d.success(`技能「${ve.result.name || s.name}」安装成功`), de((_e) => {
            const Ae = { ..._e };
            return delete Ae[q], Ae;
          });
          return;
        }
        if (ve.status === "failed")
          throw new Error(ve.error || "安装失败");
        if (ve.status === "cancelled") {
          d.info("安装已取消"), de((_e) => {
            const Ae = { ..._e };
            return delete Ae[q], Ae;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (fe) {
      d.error(fe.message || "安装技能失败"), de((Pe) => {
        const Ee = { ...Pe };
        return delete Ee[q], Ee;
      });
    }
  }, dt = a(() => {
    let s = He;
    if (be && (s = s.filter((q) => q.sourceLabel === be)), x.trim()) {
      const q = x.toLowerCase();
      s = s.filter(
        (ue) => {
          var fe;
          return ue.name.toLowerCase().includes(q) || ((fe = ue.description) == null ? void 0 : fe.toLowerCase().includes(q));
        }
      );
    }
    return s;
  }, [He, x, be]), tt = ae.filter((s) => s.available), Je = a(() => {
    if (!be) return G;
    const s = tt.find(
      (q) => q.label === be
    );
    return s ? G.filter((q) => q.source === s.key) : G;
  }, [G, be, tt]), kt = a(() => {
    const s = /* @__PURE__ */ new Set();
    return Re.filter((q) => q.enabled).forEach((q) => s.add(q.label)), tt.forEach((q) => s.add(q.label)), Array.from(s);
  }, [Re, tt]), gn = e.createElement(
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
        prefix: $ ? e.createElement($) : void 0,
        value: x,
        onChange: (s) => m(s.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      F.length > 0 ? e.createElement(A, {
        value: K || void 0,
        onChange: (s) => re(s || ""),
        placeholder: "全部分类",
        allowClear: !0,
        style: { minWidth: 150 },
        options: [
          { value: "", label: "全部分类" },
          ...F.map((s) => ({ value: s.id, label: s.label }))
        ]
      }) : null,
      // Install target selector
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 4 } },
        e.createElement(
          Q,
          { type: "secondary", style: { fontSize: 12 } },
          "安装到"
        ),
        e.createElement(A, {
          value: R || void 0,
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
          icon: N ? e.createElement(N) : void 0,
          onClick: () => xe(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Source filter tags (GitHub sources + market providers)
    kt.length > 0 ? e.createElement(
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
        Q,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "来源筛选:"
      ),
      e.createElement(
        T,
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
      ...kt.map(
        (s) => e.createElement(
          T,
          {
            key: s,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: be === s ? "blue" : void 0,
            icon: N && Re.some((q) => q.label === s) ? e.createElement(N) : void 0,
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
        N ? e.createElement(N, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        e.createElement(
          Q,
          { strong: !0, style: { fontSize: 13 } },
          `GitHub 技能源 (${dt.length})`
        )
      ),
      e.createElement(
        k,
        { gutter: [12, 12] },
        ...dt.map((s) => {
          const q = `github:${s.sourceId}:${s.name}`, ue = pe[q];
          return e.createElement(
            v,
            { key: q, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              E,
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
                N ? e.createElement(N, {
                  style: { fontSize: 18, color: "#57606a" }
                }) : e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                e.createElement(
                  g,
                  { title: s.name },
                  e.createElement(
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
                    s.name
                  )
                )
              ),
              e.createElement(
                j,
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
                    T,
                    { color: "blue", style: { fontSize: 10 } },
                    s.sourceLabel
                  ),
                  s.version ? e.createElement(
                    T,
                    { style: { fontSize: 10 } },
                    `v${s.version}`
                  ) : null
                ),
                ue ? e.createElement(
                  c,
                  {
                    size: "small",
                    disabled: !0,
                    icon: M ? e.createElement(M) : void 0
                  },
                  ue === "starting" ? "启动中" : "安装中"
                ) : e.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: u ? e.createElement(u) : void 0,
                    onClick: () => pn(s)
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
      _ ? e.createElement(_, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      e.createElement(
        Q,
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
      description: x ? `未找到匹配「${x}」的技能` : "输入关键词搜索技能市场",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      k,
      { gutter: [12, 12] },
      ...Je.map((s) => {
        const q = `${s.source}:${s.slug}`, ue = pe[q];
        return e.createElement(
          v,
          { key: q, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            E,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => Y(s)
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
                g,
                { title: s.name },
                e.createElement(
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
                  s.name
                )
              )
            ),
            e.createElement(
              j,
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
                  T,
                  { color: "geekblue", style: { fontSize: 10 } },
                  s.source
                ),
                s.version ? e.createElement(
                  T,
                  { style: { fontSize: 10 } },
                  `v${s.version}`
                ) : null
              ),
              ue ? e.createElement(
                c,
                {
                  size: "small",
                  disabled: !0,
                  icon: M ? e.createElement(M) : void 0
                },
                ue === "starting" ? "启动中" : "安装中"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: u ? e.createElement(u) : void 0,
                  onClick: (fe) => {
                    fe.stopPropagation(), Ct(s);
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
        { onClick: dn, loading: he },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    le ? e.createElement(
      H,
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
        onClose: () => Y(null),
        width: 480,
        extra: e.createElement(
          c,
          {
            type: "primary",
            icon: u ? e.createElement(u) : void 0,
            onClick: () => {
              Ct(le);
            }
          },
          "安装到专家"
        )
      },
      e.createElement(
        I,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          I.Item,
          { label: "来源" },
          le.source
        ),
        e.createElement(
          I.Item,
          { label: "描述" },
          le.description || "-"
        ),
        le.version ? e.createElement(
          I.Item,
          { label: "版本" },
          le.version
        ) : null,
        le.author ? e.createElement(
          I.Item,
          { label: "作者" },
          le.author
        ) : null,
        e.createElement(
          I.Item,
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
          Q,
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
            ([s, q]) => e.createElement(
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
                String(q)
              ),
              e.createElement(
                Q,
                { type: "secondary", style: { fontSize: 11 } },
                s
              )
            )
          )
        )
      ) : null
    ) : null
  ), yn = a(() => {
    if (!ge.trim()) return gt;
    const s = ge.toLowerCase();
    return gt.filter(
      (q) => q.name.toLowerCase().includes(s) || q.description.toLowerCase().includes(s) || q.category.toLowerCase().includes(s)
    );
  }, [ge]), fn = async (s) => {
    try {
      const q = await ne("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: s.name,
          description: s.description,
          skill_names: s.recommendedSkills
        })
      });
      await ot(q.id, "AGENTS.md", s.systemPrompt);
      const ue = await st(q.id);
      ue.approval_level = s.approvalLevel, await ne(`/agents/${encodeURIComponent(q.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ue)
      }), d.success(`专家「${s.name}」创建成功，已跳转至专家`), un("/ugsci-experts");
    } catch (q) {
      d.error(q.message || "创建专家失败");
    }
  }, Tt = n(async (s) => {
    if (s)
      try {
        const q = await St(s);
        Be(new Set(q.map((ue) => ue.key)));
      } catch {
        Be(/* @__PURE__ */ new Set());
      }
  }, []);
  r(() => {
    Oe && Tt(Oe);
  }, [Oe, Tt]);
  const En = async (s) => {
    if (!Oe) {
      d.warning("请先选择目标专家");
      return;
    }
    Ue((q) => ({ ...q, [s.id]: !0 }));
    try {
      const q = s.id;
      await Kt(Oe, {
        client_key: q,
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
      }), d.success(`MCP「${s.name}」已添加到当前专家`), Be((ue) => new Set(ue).add(q));
    } catch (q) {
      d.error(q.message || `添加 MCP「${s.name}」失败`);
    } finally {
      Ue((q) => ({ ...q, [s.id]: !1 }));
    }
  }, hn = a(() => {
    if (!Se.trim()) return It;
    const s = Se.toLowerCase();
    return It.filter(
      (q) => q.name.toLowerCase().includes(s) || q.description.toLowerCase().includes(s) || q.category.toLowerCase().includes(s)
    );
  }, [Se]), vn = e.createElement(
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
        prefix: $ ? e.createElement($) : void 0,
        value: Se,
        onChange: (s) => Ce(s.target.value),
        allowClear: !0,
        style: { maxWidth: 300 }
      }),
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        e.createElement(
          Q,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "安装到："
        ),
        e.createElement(A, {
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
          icon: W ? e.createElement(W) : void 0,
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
      ...hn.map(
        (s) => e.createElement(
          v,
          { key: s.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            E,
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
                  Q,
                  { strong: !0, style: { fontSize: 14 } },
                  s.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  e.createElement(
                    T,
                    { color: "blue", style: { fontSize: 10 } },
                    s.category
                  ),
                  e.createElement(
                    T,
                    {
                      color: s.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    s.transport
                  ),
                  s.env && Object.keys(s.env).length > 0 ? e.createElement(
                    T,
                    { color: "orange", style: { fontSize: 10 } },
                    "需配置密钥"
                  ) : null
                )
              )
            ),
            // Description
            e.createElement(
              j,
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
                Q,
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
                  icon: W ? e.createElement(W) : void 0,
                  onClick: () => En(s)
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
      _ ? e.createElement(_, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        Q,
        { type: "secondary", style: { fontSize: 12 } },
        "更多 MCP 服务器模板持续更新中，也支持通过 JSON 配置自定义添加"
      )
    )
  ), bn = e.createElement(
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
        prefix: $ ? e.createElement($) : void 0,
        value: ge,
        onChange: (s) => we(s.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      e.createElement(
        c,
        {
          icon: z ? e.createElement(z) : void 0,
          onClick: () => wt(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    e.createElement(
      k,
      { gutter: [12, 12] },
      ...yn.map(
        (s) => e.createElement(
          v,
          { key: s.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            E,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => fn(s)
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
                  Q,
                  { strong: !0, style: { fontSize: 14 } },
                  s.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4 } },
                  e.createElement(
                    T,
                    { color: "blue", style: { fontSize: 10 } },
                    s.category
                  ),
                  s.approvalLevel === "MANUAL" ? e.createElement(
                    T,
                    { color: "orange", style: { fontSize: 10 } },
                    "需审批"
                  ) : e.createElement(
                    T,
                    { color: "green", style: { fontSize: 10 } },
                    "自动"
                  )
                )
              )
            ),
            e.createElement(
              j,
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
                Q,
                { type: "secondary", style: { fontSize: 11 } },
                `推荐 ${s.recommendedSkills.length} 个技能`
              ),
              e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: C ? e.createElement(C) : void 0
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
      _ ? e.createElement(_, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        Q,
        { type: "secondary", style: { fontSize: 12 } },
        "更多专家模板持续更新中，未来将支持 OpenScience、RPA 等行业扩展"
      )
    )
  ), Sn = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        C ? e.createElement(C, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: gn
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        W ? e.createElement(W, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: vn
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        z ? e.createElement(z, { style: { fontSize: 14 } }) : null,
        "专家模板"
      ),
      children: bn
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
            icon: D ? e.createElement(D) : void 0,
            onClick: () => {
              et(x, K, {}), Ze();
            },
            loading: he || ce
          },
          "刷新"
        )
      )
    }),
    e.createElement(V, {
      items: Sn,
      activeKey: O,
      onChange: (s) => U(s)
    }),
    // Skill source config modal
    e.createElement(_l, {
      open: ke,
      onClose: () => xe(!1),
      sources: Re,
      onChange: (s) => {
        je(s), Ze(s);
      }
    }),
    // MCP source config modal
    e.createElement(Rt, {
      open: mt,
      onClose: () => Ye(!1),
      sources: We,
      onChange: (s) => ye(s),
      type: "mcp"
    }),
    // Expert source config modal
    e.createElement(Rt, {
      open: mn,
      onClose: () => wt(!1),
      sources: Qe,
      onChange: (s) => De(s),
      type: "expert"
    })
  );
}
function Rl() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const jt = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, Dt = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function Ll() {
  const e = h(), t = e.React, { useEffect: r, useRef: n } = t, a = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, l = (a == null ? void 0 : a.id) || "default", o = n(null), i = n(null);
  return r(() => {
    if (o.current === l) return;
    o.current = l;
    const f = Rl(), c = jt[f] || jt.en, d = Dt[f] || Dt.en;
    let k = !1;
    return (async () => {
      var v, E;
      try {
        const T = await it(l);
        if (k) return;
        const g = Ht(T);
        if (i.current) {
          try {
            i.current();
          } catch {
          }
          i.current = null;
        }
        const S = window.QwenPaw;
        (v = S == null ? void 0 : S.chat) != null && v.welcome && (g.length > 0 ? (i.current = S.chat.welcome.set("ugsci", {
          description: c,
          prompts: g
        }), console.info(
          `[ugsci] Injected ${g.length} welcome prompts for agent "${l}"`
        )) : (i.current = S.chat.welcome.set("ugsci", {
          description: c,
          prompts: [d]
        }), console.info(
          `[ugsci] No skills for agent "${l}" — using default prompt`
        )));
      } catch (T) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${l}":`,
          T
        );
        const g = window.QwenPaw;
        if ((E = g == null ? void 0 : g.chat) != null && E.welcome && !k) {
          if (i.current) {
            try {
              i.current();
            } catch {
            }
            i.current = null;
          }
          i.current = g.chat.welcome.set("ugsci", {
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
const pt = [
  { key: "default", label: "默认", icon: "", desc: "普通对话，回复即停" },
  { key: "goal", label: "Goal", icon: "", desc: "持续循环 + 自我审计" },
  { key: "mission", label: "Mission", icon: "", desc: "多Agent流水线 + 上下文隔离" }
];
function Bl(e, t) {
  var n;
  const r = (n = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value"
  )) == null ? void 0 : n.set;
  r ? r.call(e, t) : e.value = t, e.selectionStart = e.selectionEnd = t.length, e.dispatchEvent(new Event("input", { bubbles: !0 }));
}
function jl() {
  const e = h(), t = e.React, { useState: r, useEffect: n, useCallback: a, useRef: l } = t, { Dropdown: o, Button: i } = e.antd, {
    SendOutlined: f,
    CarryOutOutlined: c,
    ScheduleOutlined: d,
    DownOutlined: k
  } = e.antdIcons || {}, [v, E] = r("default"), T = l(0);
  n(() => {
    const b = () => {
      if (T.current && Date.now() < T.current)
        return;
      T.current && Date.now() >= T.current && (T.current = 0);
      const D = document.querySelector(
        '[class*="loopChip"] span'
      );
      if (D) {
        const u = (D.textContent || "").trim().match(/^\/(\S+)/);
        if (u) {
          const C = u[1];
          E((_) => _ !== C ? C : _);
          return;
        }
      }
      E(($) => $ !== "default" ? "default" : $);
    }, P = setInterval(b, 500);
    return b(), () => clearInterval(P);
  }, []);
  const g = a((b) => {
    var D;
    if (b === v) return;
    if (T.current = Date.now() + 1e3, b === "default") {
      const $ = document.querySelector('[class*="loopChip"]');
      if ($) {
        let u = $.querySelector(
          '[class*="chipClose"], [class*="chip_close"], [class*="close"]'
        );
        if (!u) {
          const C = $.querySelectorAll("svg");
          C.length > 0 && (u = C[C.length - 1]);
        }
        if (!u) {
          const C = $.querySelectorAll("*");
          C.length > 0 && (u = C[C.length - 1]);
        }
        u && u.dispatchEvent(
          new MouseEvent("click", { bubbles: !0, cancelable: !0 })
        );
      }
      E("default");
      return;
    }
    const P = (D = document.querySelector('[class*="sender"]')) == null ? void 0 : D.querySelector("textarea");
    P && (Bl(P, `__loop__${b}`), setTimeout(() => P.focus(), 100)), E(b);
  }, [v]), S = pt.map((b) => {
    const P = b.key === v;
    return {
      key: b.key,
      label: t.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 180
          }
        },
        t.createElement("span", {
          style: { fontSize: 14, display: "flex", alignItems: "center", width: 16, justifyContent: "center" }
        }, b.key === "goal" && c ? t.createElement(c, { style: { fontSize: 14 } }) : b.key === "mission" && d ? t.createElement(d, { style: { fontSize: 14 } }) : f ? t.createElement(f, { style: { fontSize: 14 } }) : null),
        t.createElement(
          "div",
          { style: { flex: 1 } },
          t.createElement(
            "div",
            { style: { fontWeight: P ? 600 : 400 } },
            b.label
          ),
          t.createElement(
            "div",
            {
              style: {
                fontSize: 11,
                color: "rgba(0,0,0,0.45)",
                marginTop: 1
              }
            },
            b.desc
          )
        ),
        P ? t.createElement("span", {
          style: { color: "#1677ff", fontSize: 12, fontWeight: 600 }
        }, "✓") : null
      )
    };
  }), A = pt.find((b) => b.key === v) || pt[0];
  let H = null;
  v === "goal" && c ? H = t.createElement(c, { style: { fontSize: 14 } }) : v === "mission" && d ? H = t.createElement(d, { style: { fontSize: 14 } }) : f ? H = t.createElement(f, { style: { fontSize: 14 } }) : H = A.icon;
  const I = t.createElement(
    i,
    {
      type: "text",
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        height: 32,
        padding: "4px 10px",
        borderRadius: 6,
        fontSize: 13,
        lineHeight: 1,
        color: v !== "default" ? "#1677ff" : "rgba(0,0,0,0.65)",
        fontWeight: v !== "default" ? 600 : 400,
        flexShrink: 0
      }
    },
    H,
    t.createElement("span", null, A.label),
    k ? t.createElement(k, { style: { fontSize: 10, opacity: 0.5 } }) : null
  ), V = {
    items: S,
    onClick: (b) => g(b.key)
  };
  return t.createElement(
    "span",
    { style: { order: -1, display: "inline-flex", alignItems: "center", flexShrink: 0 } },
    t.createElement(o, { menu: V, trigger: ["click"] }, I)
  );
}
function Dl() {
  var c, d, k, v, E;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = h().React, r = "ugsci";
  (d = (c = e.chat) == null ? void 0 : c.rightHeader) != null && d.add ? (e.chat.rightHeader.add(r, t.createElement(Ll), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  ), (v = (k = e.chat) == null ? void 0 : k.sender) != null && v.addPrefix ? (e.chat.sender.addPrefix(
    r,
    t.createElement(jl),
    { id: "ugsci.mode-selector", order: -100 }
  ), console.info("[ugsci] ModeSelector registered via sender.addPrefix")) : console.warn(
    "[ugsci] QP.chat.sender.addPrefix not available — mode selector disabled"
  );
  const n = h().antdIcons || {}, a = n.UserSwitchOutlined, l = n.ToolOutlined, o = n.ThunderboltOutlined, i = n.ShopOutlined;
  e.route.add(r, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: dl
  }), e.menu.add(r, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家",
    icon: a ? t.createElement(a, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => qe()
  }), e.route.add(r, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: bl
  }), e.menu.add(r, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "工具",
    icon: l ? t.createElement(l, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.capabilities",
    order: 6,
    visible: () => qe()
  }), e.route.add(r, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: wl
  }), e.menu.add(r, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.skills-center",
    order: 7,
    visible: () => qe()
  }), e.route.add(r, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: $l
  }), e.menu.add(r, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: i ? t.createElement(i, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 8,
    visible: () => qe()
  }), (E = e.sidebar) != null && E.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
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
  for (const T of f) {
    try {
      const S = e.menu.snapshot("primary.agentScoped").find((A) => A.id === T);
      S && e.menu.replace(r, T, {
        ...S,
        visible: () => !qe()
      });
    } catch {
    }
    try {
      const S = e.menu.snapshot("primary.settings").find((A) => A.id === T);
      S && e.menu.replace(r, T, {
        ...S,
        visible: () => !qe()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active"
  );
}
function Et() {
  try {
    Dl();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Et, 500);
  }
}
var Nt;
if ((Nt = window.QwenPaw) != null && Nt.host)
  Et();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), Et());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
