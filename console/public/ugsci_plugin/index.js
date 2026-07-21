function h() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function on() {
  try {
    return h().getApiToken() || "";
  } catch {
    return "";
  }
}
function Ye(e) {
  return h().getApiUrl(e);
}
function Mt(e) {
  const t = on();
  return {
    "Content-Type": "application/json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
    ...e,
  };
}
async function te(e, t) {
  const a = await fetch(Ye(e), {
    ...t,
    headers: { ...Mt(), ...((t == null ? void 0 : t.headers) || {}) },
  });
  if (!a.ok) {
    const n = await a.text().catch(() => "");
    throw new Error(n || `HTTP ${a.status}`);
  }
  return a.status === 204 ? null : a.json();
}
async function pt() {
  const e = await te("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function nt(e) {
  return te(`/agents/${encodeURIComponent(e)}`);
}
async function lt(e) {
  return (
    (await te("/skills", {
      headers: { "X-Agent-Id": e },
    })) || []
  );
}
async function gt(e = !1) {
  return (await te(`/skills/pool${e ? "?summary=true" : ""}`)) || [];
}
async function sn(e) {
  const t = await te(`/skills/pool/${encodeURIComponent(e)}/content`);
  return (t == null ? void 0 : t.content) || "";
}
async function cn() {
  return (await te("/skills/workspaces")) || [];
}
async function mn(e) {
  return (
    (await te("/mcp", {
      headers: { "X-Agent-Id": e },
    })) || []
  );
}
async function dn(e, t) {
  return te(`/mcp/toggle/${encodeURIComponent(t)}`, {
    method: "PATCH",
    headers: { "X-Agent-Id": e },
  });
}
async function un(e, t) {
  await te(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e },
  });
}
async function pn(e, t, a) {
  return te("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ client_key: t, client: a }),
  });
}
async function gn(e, t) {
  return (
    (await te(`/mcp/tools/${encodeURIComponent(t)}`, {
      headers: { "X-Agent-Id": e },
    })) || []
  );
}
const Me = {
  background: "#0072f5",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8,
};
function Xe() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function yt(e, t) {
  const a = h();
  return a.ReactMarkdown && a.remarkGfm
    ? t.createElement(a.ReactMarkdown, { remarkPlugins: [a.remarkGfm] }, e)
    : e
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/`(.+?)`/g, "$1")
        .replace(/^#+\s*/gm, "")
        .replace(/^[-*]\s+/gm, "• ");
}
const bt = [
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
  ],
  ct = [
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
  ],
  Rt = "ugsci_custom_teams";
function Ze() {
  try {
    const e = localStorage.getItem(Rt);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function $t(e) {
  try {
    localStorage.setItem(Rt, JSON.stringify(e));
  } catch {}
}
const yn = [
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

重要：每步咨询使用 chat_with_agent，传递上一步的结果作为上下文。`,
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

注意：每步使用 chat_with_agent 咨询，传递已获取的参数。`,
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
    taskTemplate: `请对以下区块的开发方案进行多角度评审：
区块名称：{区块名}
方案概述：{方案概述}
评审要求：请分别咨询油藏工程师（储量和开发方式）、钻井工程师（工程可行性）、采油工程师（生产工艺），各自独立给出评估意见，然后对比综合形成最终建议。`,
    orchestrationPrompt: `你是开发方案评审团队的协调者。请按以下步骤工作：
1. 用 list_agents() 查看可用专家
2. 分别向油藏工程师、钻井工程师、采油工程师发送同一评审请求（独立评估，不传递他人意见）
3. 收集三位专家的独立意见后，对比分析各自观点
4. 综合形成最终的开发方案建议，包含各专业领域的考虑

重要：三位专家应独立评估，不要将一位专家的意见传递给另一位。`,
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

注意：每步使用 chat_with_agent 咨询，传递上一步的完整结果。`,
  },
];
async function fn(e, t) {
  const a = {
    channel: "console",
    user_id: "default",
    session_id: `team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    input: [
      {
        role: "user",
        content: [{ type: "text", text: t }],
      },
    ],
  };
  await fetch(Ye("/console/chat"), {
    method: "POST",
    headers: {
      ...Mt(),
      "X-Agent-Id": e,
    },
    body: JSON.stringify(a),
  });
}
function et(e, t) {
  const a = e.find((l) => l.name === t || l.name === t.replace(/\s+/g, ""));
  if (a) return a.id;
  const n = e.find(
    (l) =>
      l.name.includes(t) ||
      t.includes(l.name) ||
      l.name.replace(/\s+/g, "").includes(t.replace(/\s+/g, "")),
  );
  return n ? n.id : null;
}
function En(e) {
  var a;
  const t = e.members.map((n) => `- ${n.name}（${n.role}）`).join(`
`);
  if (e.custom && e.steps && e.steps.length > 0) {
    const n = e.steps.map((r, o) => {
      const i = r.passContext
        ? "（传递上一步的结果作为上下文）"
        : "（独立执行，不传递上下文）";
      return `${o + 1}. 向「${r.agentName}」发送请求：${r.instruction} ${i}`;
    }).join(`
`);
    return `${
      e.mode === "pipeline"
        ? "请按顺序依次执行以下步骤，每步使用 chat_with_agent 咨询对应专家："
        : e.mode === "roundtable"
        ? "请同时向以下专家分别发送独立请求（不传递上下文），收集所有结果后综合："
        : `你是团队协调者（${
            e.coordinatorName ||
            ((a = e.members[0]) == null ? void 0 : a.name) ||
            ""
          }），请按需调用以下专家完成任务：`
    }

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
function hn({ team: e }) {
  const t = h().React,
    { Typography: a, Tag: n } = h().antd,
    { Text: l } = a,
    r = {
      pipeline: "→",
      roundtable: "⇄",
      coordinator: "⊙",
    },
    o = {
      pipeline: "#13c2c2",
      roundtable: "#722ed1",
      coordinator: "#1677ff",
    },
    i = e.steps || [],
    y = i.length > 0;
  return t.createElement(
    "div",
    {
      style: {
        padding: "12px 16px",
        background: "#fafafa",
        borderRadius: 8,
        border: "1px dashed #d9d9d9",
      },
    },
    t.createElement(
      l,
      {
        type: "secondary",
        style: { fontSize: 12, display: "block", marginBottom: 8 },
      },
      `执行流程 (${
        e.mode === "pipeline"
          ? "流水线"
          : e.mode === "roundtable"
          ? "圆桌讨论"
          : "协调者模式"
      })`,
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
          flexWrap: "wrap",
        },
      },
      ...(y
        ? i
            .map(
              (c, m) => (
                e.members.find((x) => x.name === c.agentName),
                [
                  m > 0 && e.mode !== "roundtable"
                    ? t.createElement(
                        "div",
                        {
                          key: `arrow-${m}`,
                          style: {
                            textAlign: "center",
                            color: o[e.mode],
                            fontSize: 14,
                          },
                        },
                        r[e.mode],
                      )
                    : null,
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
                        border: `1px solid ${o[e.mode]}33`,
                        fontSize: 12,
                        flex: e.mode === "roundtable" ? "1 1 200px" : "initial",
                      },
                    },
                    t.createElement(Be, {
                      name: c.agentName,
                      size: 24,
                    }),
                    t.createElement(
                      "div",
                      null,
                      t.createElement(
                        l,
                        { strong: !0, style: { fontSize: 12 } },
                        c.agentName,
                      ),
                      t.createElement(
                        "div",
                        {
                          style: {
                            fontSize: 11,
                            color: "#8c8c8c",
                            maxWidth: 250,
                          },
                        },
                        c.instruction,
                      ),
                      c.passContext
                        ? t.createElement(
                            n,
                            {
                              color: "blue",
                              style: { fontSize: 9, marginTop: 2 },
                            },
                            "传递上下文",
                          )
                        : t.createElement(
                            n,
                            { style: { fontSize: 9, marginTop: 2 } },
                            "独立",
                          ),
                    ),
                  ),
                ]
              ),
            )
            .flat()
        : e.members
            .map((c, m) => [
              m > 0 && e.mode !== "roundtable"
                ? t.createElement(
                    "div",
                    {
                      key: `arrow-${m}`,
                      style: {
                        textAlign: "center",
                        color: o[e.mode],
                        fontSize: 14,
                      },
                    },
                    r[e.mode],
                  )
                : null,
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
                    border: `1px solid ${o[e.mode]}33`,
                    fontSize: 12,
                    flex: e.mode === "roundtable" ? "1 1 150px" : "initial",
                  },
                },
                t.createElement(Be, { name: c.name, size: 24 }),
                t.createElement(
                  "div",
                  null,
                  t.createElement(
                    l,
                    { strong: !0, style: { fontSize: 12 } },
                    c.name,
                  ),
                  t.createElement(
                    "div",
                    { style: { fontSize: 11, color: "#8c8c8c" } },
                    c.role,
                  ),
                ),
              ),
            ])
            .flat()),
    ),
  );
}
function vn({ open: e, onClose: t, agents: a, editingTeam: n, onSaved: l }) {
  const r = h().React,
    { useState: o, useEffect: i, useCallback: y } = r,
    {
      Modal: c,
      Input: m,
      Button: x,
      Select: v,
      Tag: f,
      Typography: C,
      Switch: E,
      Empty: S,
      message: P,
      Divider: G,
      Steps: k,
    } = h().antd,
    {
      PlusOutlined: V,
      DeleteOutlined: b,
      SaveOutlined: T,
      ArrowRightOutlined: $,
    } = h().antdIcons || {},
    { Text: L, Paragraph: u } = C,
    [w, z] = o(""),
    [Z, A] = o("🤝"),
    [_, p] = o(""),
    [N, K] = o("pipeline"),
    [J, B] = o(""),
    [g, I] = o(""),
    [j, re] = o([]),
    [q, le] = o([]),
    [ee, H] = o(!1);
  i(() => {
    e &&
      (n
        ? (z(n.name),
          A(n.emoji),
          p(n.description),
          K(n.mode),
          B(n.coordinatorName || ""),
          I(n.taskTemplate),
          re(n.steps || []),
          le(n.members.map((X) => X.name)))
        : (z(""),
          A("🤝"),
          p(""),
          K("pipeline"),
          B(""),
          I(`请执行以下任务：
任务描述：{任务描述}`),
          re([]),
          le([])));
  }, [e, n]);
  const D = y(() => {
      if (N === "roundtable") {
        const X = q.map((me) => ({
          agentName: me,
          instruction: "请给出你的专业评估意见",
          passContext: !1,
        }));
        re(X);
      } else if (N === "pipeline") {
        const X = new Map(j.map((U) => [U.agentName, U])),
          me = q.map(
            (U) =>
              X.get(U) || {
                agentName: U,
                instruction: "请完成你的专业部分",
                passContext: !0,
              },
          );
        re(me);
      }
    }, [N, q, j]),
    O = (X) => {
      q.includes(X) || (le([...q, X]), N === "coordinator" && !J && B(X));
    },
    d = (X) => {
      le(q.filter((me) => me !== X)),
        re(j.filter((me) => me.agentName !== X)),
        J === X && B(q[0] || "");
    },
    Q = (X, me, U) => {
      const ae = [...j];
      (ae[X] = { ...ae[X], [me]: U }), re(ae);
    },
    se = () => {
      if (!w.trim()) {
        P.warning("请输入团队名称");
        return;
      }
      if (q.length < 2) {
        P.warning("至少需要选择 2 个成员");
        return;
      }
      if (!g.trim()) {
        P.warning("请输入任务模板");
        return;
      }
      if (N === "coordinator" && !J) {
        P.warning("请选择协调者");
        return;
      }
      H(!0);
      try {
        const X = q.map((ne) => {
          var pe;
          const W = a.find((de) => de.name === ne);
          return {
            name: ne,
            role:
              ((pe = W == null ? void 0 : W.description) == null
                ? void 0
                : pe.slice(0, 30)) || "团队成员",
            emoji: "",
          };
        });
        let me = j;
        (j.length === 0 || j.length !== q.length) &&
          (me = q.map((ne) => ({
            agentName: ne,
            instruction: "请完成你的专业部分",
            passContext: N === "pipeline",
          })));
        const U = {
            id: (n == null ? void 0 : n.id) || `custom-${Date.now()}`,
            name: w.trim(),
            emoji: Z,
            category: "自定义",
            description: _.trim() || `${w.trim()}（${q.length}人团队）`,
            mode: N,
            members: X,
            coordinatorName: N === "coordinator" ? J : void 0,
            taskTemplate: g.trim(),
            orchestrationPrompt: "",
            // Custom teams use steps-based instructions
            steps: me,
            custom: !0,
            createdAt: (n == null ? void 0 : n.createdAt) || Date.now(),
          },
          ae = Ze(),
          oe = ae.findIndex((ne) => ne.id === U.id);
        oe >= 0 ? (ae[oe] = U) : ae.push(U),
          $t(ae),
          P.success(n ? "团队已更新" : "团队已创建"),
          l(),
          t();
      } catch (X) {
        P.error(X.message || "保存失败");
      } finally {
        H(!1);
      }
    },
    he = a.filter((X) => !q.includes(X.name));
  return r.createElement(
    c,
    {
      open: e,
      onCancel: t,
      title: r.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        r.createElement("span", { style: { fontSize: 20 } }, n ? "✏️" : "➕"),
        r.createElement("span", null, n ? "编辑专家团" : "创建专家团"),
      ),
      width: 720,
      onOk: se,
      okText: "保存团队",
      confirmLoading: ee,
      okButtonProps: {
        icon: T ? r.createElement(T) : void 0,
      },
    },
    // Step 1: Basic info
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        L,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 },
        },
        "1. 基本信息",
      ),
      r.createElement(
        "div",
        {
          style: {
            display: "flex",
            gap: 8,
            marginBottom: 8,
            alignItems: "center",
          },
        },
        q.length > 0
          ? r.createElement(Et, {
              members: q,
              size: 36,
            })
          : null,
        r.createElement(m, {
          placeholder: "团队名称（如：储层评价团队）",
          value: w,
          onChange: (X) => z(X.target.value),
          style: { flex: 1 },
        }),
      ),
      r.createElement(m.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: _,
        onChange: (X) => p(X.target.value),
        rows: 2,
        style: { marginBottom: 8 },
      }),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        r.createElement(
          L,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式：",
        ),
        r.createElement(v, {
          value: N,
          onChange: (X) => K(X),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" },
          ],
        }),
      ),
    ),
    r.createElement(G, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        L,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 },
        },
        "2. 选择团队成员",
      ),
      // Available agents
      he.length > 0
        ? r.createElement(
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
            ...he.map((X) =>
              r.createElement(
                x,
                {
                  key: X.id,
                  size: "small",
                  icon: V ? r.createElement(V) : void 0,
                  onClick: () => O(X.name),
                },
                X.name,
              ),
            ),
          )
        : null,
      // Selected members
      q.length === 0
        ? r.createElement(S, {
            description: "请从上方添加团队成员",
            image: S.PRESENTED_IMAGE_SIMPLE,
          })
        : r.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...q.map((X) =>
              r.createElement(
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
                    border: "1px solid #d6e4ff",
                  },
                },
                r.createElement(
                  "div",
                  { style: { display: "flex", alignItems: "center", gap: 6 } },
                  r.createElement(Be, { name: X, size: 24 }),
                  r.createElement(
                    L,
                    { strong: !0, style: { fontSize: 13 } },
                    X,
                  ),
                  N === "coordinator" && J === X
                    ? r.createElement(
                        f,
                        { color: "blue", style: { fontSize: 10 } },
                        "协调者",
                      )
                    : null,
                ),
                r.createElement(
                  "div",
                  { style: { display: "flex", gap: 4 } },
                  N === "coordinator"
                    ? r.createElement(
                        x,
                        {
                          size: "small",
                          type: "link",
                          onClick: () => B(X),
                        },
                        "设为协调者",
                      )
                    : null,
                  r.createElement(
                    x,
                    {
                      size: "small",
                      type: "link",
                      danger: !0,
                      icon: b ? r.createElement(b) : void 0,
                      onClick: () => d(X),
                    },
                    "移除",
                  ),
                ),
              ),
            ),
          ),
    ),
    r.createElement(G, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    q.length > 0
      ? r.createElement(
          "div",
          { style: { marginBottom: 16 } },
          r.createElement(
            L,
            {
              strong: !0,
              style: { display: "block", marginBottom: 8, fontSize: 13 },
            },
            `3. 编排执行步骤${
              N === "roundtable"
                ? "（各步独立执行）"
                : N === "pipeline"
                ? "（依次执行，可传递上下文）"
                : "（由协调者决定调用顺序）"
            }`,
          ),
          // Auto-sync button
          r.createElement(
            x,
            {
              size: "small",
              type: "dashed",
              onClick: D,
              style: { marginBottom: 8 },
            },
            "自动生成步骤",
          ),
          // Steps list
          j.length === 0
            ? r.createElement(
                L,
                { type: "secondary", style: { fontSize: 12 } },
                "点击「自动生成步骤」或手动配置每步的指令",
              )
            : r.createElement(
                "div",
                { style: { display: "flex", flexDirection: "column", gap: 6 } },
                ...j.map((X, me) =>
                  r.createElement(
                    "div",
                    {
                      key: me,
                      style: {
                        padding: 8,
                        background: "#fff",
                        borderRadius: 6,
                        border: "1px solid #e8e8e8",
                      },
                    },
                    r.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 6,
                        },
                      },
                      N === "pipeline"
                        ? r.createElement(
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
                            `${me + 1}`,
                          )
                        : r.createElement(
                            "span",
                            { style: { fontSize: 14 } },
                            "🔀",
                          ),
                      r.createElement(
                        f,
                        { color: "blue", style: { fontSize: 11 } },
                        X.agentName,
                      ),
                      r.createElement(
                        "div",
                        { style: { flex: 1 } },
                        r.createElement(m, {
                          placeholder: "请输入该步骤的指令...",
                          value: X.instruction,
                          onChange: (U) => Q(me, "instruction", U.target.value),
                          size: "small",
                        }),
                      ),
                    ),
                    r.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          paddingLeft: 28,
                        },
                      },
                      r.createElement(E, {
                        size: "small",
                        checked: X.passContext,
                        onChange: (U) => Q(me, "passContext", U),
                      }),
                      r.createElement(
                        L,
                        { type: "secondary", style: { fontSize: 11 } },
                        X.passContext ? "传递上一步结果作为上下文" : "独立执行",
                      ),
                    ),
                  ),
                ),
              ),
        )
      : null,
    r.createElement(G, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    r.createElement(
      "div",
      null,
      r.createElement(
        L,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 },
        },
        `${q.length > 0 ? "4" : "3"}. 任务模板`,
      ),
      r.createElement(m.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: g,
        onChange: (X) => I(X.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 },
      }),
      r.createElement(
        L,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 },
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换",
      ),
    ),
  );
}
function St({ team: e, agents: t, onLaunch: a, onEdit: n, onDelete: l }) {
  var _;
  const r = h().React,
    { useState: o } = r,
    { Card: i, Tag: y, Typography: c, Button: m, Tooltip: x } = h().antd,
    {
      TeamOutlined: v,
      RocketOutlined: f,
      UserOutlined: C,
      EditOutlined: E,
      DeleteOutlined: S,
      DownOutlined: P,
      UpOutlined: G,
    } = h().antdIcons || {},
    { Text: k, Paragraph: V } = c,
    [b, T] = o(!1),
    $ = {
      coordinator: { label: "协调者模式", color: "blue" },
      pipeline: { label: "流水线模式", color: "cyan" },
      roundtable: { label: "圆桌讨论", color: "purple" },
    },
    L = $[e.mode] || $.coordinator,
    u = e.members.map((p) => {
      const N = et(t, p.name);
      return { ...p, found: !!N, agentId: N };
    }),
    w = u.filter((p) => p.found).length,
    z = w === e.members.length,
    Z = e.coordinatorName || ((_ = e.members[0]) == null ? void 0 : _.name),
    A = Z ? et(t, Z) : null;
  return r.createElement(
    i,
    {
      hoverable: !0,
      size: "small",
      style: { height: "100%", display: "flex", flexDirection: "column" },
    },
    // Header: emoji + name + mode tag + custom badge
    r.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        },
      },
      r.createElement(Et, {
        members: e.members.map((p) => p.name),
        size: 36,
      }),
      r.createElement(
        "div",
        { style: { flex: 1 } },
        r.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          r.createElement(k, { strong: !0, style: { fontSize: 14 } }, e.name),
          e.custom
            ? r.createElement(
                y,
                { color: "gold", style: { fontSize: 9 } },
                "自定义",
              )
            : null,
        ),
        r.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          r.createElement(
            y,
            { color: L.color, style: { fontSize: 10 } },
            L.label,
          ),
          r.createElement(
            y,
            { style: { fontSize: 10 } },
            `${w}/${e.members.length}`,
          ),
          z
            ? null
            : r.createElement(
                y,
                { color: "orange", style: { fontSize: 10 } },
                "缺少成员",
              ),
        ),
      ),
      // Edit/delete for custom teams
      e.custom
        ? r.createElement(
            "div",
            { style: { display: "flex", gap: 2 } },
            n
              ? r.createElement(
                  x,
                  { title: "编辑" },
                  r.createElement(m, {
                    type: "text",
                    size: "small",
                    icon: E ? r.createElement(E) : void 0,
                    onClick: (p) => {
                      p.stopPropagation(), n(e);
                    },
                  }),
                )
              : null,
            l
              ? r.createElement(
                  x,
                  { title: "删除" },
                  r.createElement(m, {
                    type: "text",
                    size: "small",
                    danger: !0,
                    icon: S ? r.createElement(S) : void 0,
                    onClick: (p) => {
                      p.stopPropagation(), l(e);
                    },
                  }),
                )
              : null,
          )
        : null,
    ),
    // Description
    r.createElement(
      V,
      {
        type: "secondary",
        style: { fontSize: 12, margin: 0, marginBottom: 10, lineHeight: 1.5 },
        ellipsis: { rows: 2 },
      },
      e.description,
    ),
    // Member avatars
    r.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 6,
          marginBottom: 10,
          flexWrap: "wrap",
        },
      },
      ...u.map((p) =>
        r.createElement(
          x,
          {
            key: p.name,
            title: `${p.name}（${p.role}）${p.found ? "" : " - 未创建"}`,
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
                background: p.found ? "#f0f5ff" : "#fff2f0",
                border: `1px solid ${p.found ? "#d6e4ff" : "#ffccc7"}`,
                fontSize: 11,
              },
            },
            r.createElement(Be, { name: p.name, size: 18 }),
            r.createElement(
              k,
              {
                style: { fontSize: 11, color: p.found ? "#1f4e8c" : "#cf1322" },
              },
              p.name,
            ),
          ),
        ),
      ),
    ),
    // Toggle flow diagram
    r.createElement(
      m,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (p) => {
          p.stopPropagation(), T(!b);
        },
        icon: b ? (G ? r.createElement(G) : "▲") : P ? r.createElement(P) : "▼",
      },
      b ? "收起流程" : "查看执行流程",
    ),
    b ? r.createElement(hn, { team: e }) : null,
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
          alignItems: "center",
        },
      },
      r.createElement(
        k,
        { type: "secondary", style: { fontSize: 11 } },
        Z ? `协调者: ${Z}` : "",
      ),
      r.createElement(
        m,
        {
          type: "primary",
          size: "small",
          icon: f ? r.createElement(f) : void 0,
          disabled: !A,
          onClick: () => a(e),
          style: Me,
        },
        "发起团队任务",
      ),
    ),
  );
}
function bn({ agents: e, onLaunch: t }) {
  const a = h().React,
    { useMemo: n, useState: l, useCallback: r, useEffect: o } = a,
    {
      Row: i,
      Col: y,
      Input: c,
      Empty: m,
      Typography: x,
      Tag: v,
      Button: f,
      Divider: C,
      message: E,
      Popconfirm: S,
    } = h().antd,
    {
      SearchOutlined: P,
      TeamOutlined: G,
      PlusOutlined: k,
      RocketOutlined: V,
    } = h().antdIcons || {},
    { Text: b } = x,
    [T, $] = l(""),
    [L, u] = l([]),
    [w, z] = l(!1),
    [Z, A] = l(null);
  o(() => {
    u(Ze());
  }, []);
  const _ = r(() => {
      u(Ze());
    }, []),
    p = r(
      (j) => {
        const q = Ze().filter((le) => le.id !== j.id);
        $t(q), u(q), E.success(`团队「${j.name}」已删除`);
      },
      [E],
    ),
    N = r((j) => {
      A(j), z(!0);
    }, []),
    K = r(() => {
      A(null), z(!0);
    }, []),
    J = n(() => [...L, ...yn], [L]),
    B = n(() => {
      if (!T.trim()) return J;
      const j = T.toLowerCase();
      return J.filter(
        (re) =>
          re.name.toLowerCase().includes(j) ||
          re.description.toLowerCase().includes(j) ||
          re.category.toLowerCase().includes(j),
      );
    }, [J, T]),
    g = B.filter((j) => j.custom),
    I = B.filter((j) => !j.custom);
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
          alignItems: "center",
        },
      },
      a.createElement(
        b,
        { style: { fontSize: 13, color: "#389e0d" } },
        "多智能体协同 — 选择预设团队或创建自定义团队，支持流水线、圆桌讨论、协调者三种编排模式。",
      ),
      a.createElement(
        f,
        {
          type: "primary",
          size: "small",
          icon: k ? a.createElement(k) : void 0,
          onClick: K,
          style: Me,
        },
        "创建专家团",
      ),
    ),
    // Search
    a.createElement(c, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: P ? a.createElement(P) : void 0,
      value: T,
      onChange: (j) => $(j.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 },
    }),
    // Custom teams section
    g.length > 0
      ? a.createElement(
          "div",
          { style: { marginBottom: 20 } },
          a.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 10,
              },
            },
            a.createElement("span", { style: { fontSize: 16 } }),
            a.createElement(
              b,
              { strong: !0, style: { fontSize: 14 } },
              `自定义团队 (${g.length})`,
            ),
          ),
          a.createElement(
            i,
            { gutter: [12, 12] },
            ...g.map((j) =>
              a.createElement(
                y,
                { key: j.id, xs: 24, sm: 12, md: 8 },
                a.createElement(St, {
                  team: j,
                  agents: e,
                  onLaunch: t,
                  onEdit: N,
                  onDelete: p,
                }),
              ),
            ),
          ),
          a.createElement(C, { style: { margin: "16px 0" } }),
        )
      : null,
    // Preset teams section
    I.length > 0
      ? a.createElement(
          "div",
          null,
          a.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 10,
              },
            },
            a.createElement("span", { style: { fontSize: 16 } }),
            a.createElement(
              b,
              { strong: !0, style: { fontSize: 14 } },
              `预设团队 (${I.length})`,
            ),
            a.createElement(
              b,
              { type: "secondary", style: { fontSize: 12 } },
              "· 行业典型工作流模板",
            ),
          ),
          a.createElement(
            i,
            { gutter: [12, 12] },
            ...I.map((j) =>
              a.createElement(
                y,
                { key: j.id, xs: 24, sm: 12, md: 8 },
                a.createElement(St, {
                  team: j,
                  agents: e,
                  onLaunch: t,
                }),
              ),
            ),
          ),
        )
      : null,
    // Empty state
    B.length === 0
      ? a.createElement(m, {
          description: "未找到匹配的专家团队，点击「创建专家团」自定义",
          image: m.PRESENTED_IMAGE_SIMPLE,
        })
      : null,
    // Team Builder Modal
    a.createElement(vn, {
      open: w,
      onClose: () => {
        z(!1), A(null);
      },
      agents: e,
      editingTeam: Z,
      onSaved: _,
    }),
  );
}
function Lt(e) {
  var a;
  const t = [];
  for (const n of e) {
    if (n.enabled === !1) continue;
    const l = (a = n.description) == null ? void 0 : a.trim();
    if (!l) continue;
    const r =
      (n.name || l).length > 20
        ? (n.name || l).substring(0, 18) + "…"
        : n.name || l;
    let o = l;
    if (
      ((o = o
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/`(.+?)`/g, "$1")
        .replace(/^#+\s*/gm, "")
        .trim()),
      /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(o)
        ? (o = `请${o}`)
        : /^(a |an |the )/i.test(o)
        ? (o = `Help me with ${o}`)
        : /[。？！.?!]$/.test(o) || (o = `帮我${o}`),
      o.length > 80 && (o = o.substring(0, 77) + "..."),
      t.push({ label: r, value: o }),
      t.length >= 4)
    )
      break;
  }
  return t;
}
async function Sn(e) {
  return (
    (await te("/workspace/files", {
      headers: { "X-Agent-Id": e },
    })) || []
  );
}
async function tt(e, t, a) {
  await te(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: a }),
  });
}
async function wt(e, t) {
  const a = await nt(e);
  (a.system_prompt_files = t),
    await te(`/agents/${encodeURIComponent(e)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(a),
    });
}
async function Bt(e, t) {
  await te("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: t,
      targets: [{ workspace_id: e }],
      overwrite: !1,
    }),
  });
}
async function wn(e, t) {
  await te(`/skills/${encodeURIComponent(t)}/enable`, {
    method: "POST",
    headers: { "X-Agent-Id": e },
  });
}
async function jt(e, t) {
  await te(`/skills/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e },
  });
}
async function xn(e, t) {
  return te("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t),
  });
}
async function Cn(e, t) {
  return te("/skills/batch-disable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t),
  });
}
async function kn(e, t) {
  return te("/skills/batch-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t),
  });
}
async function ft(e) {
  return (
    (await te("/mcp", {
      headers: { "X-Agent-Id": e },
    })) || []
  );
}
async function Dt(e, t) {
  await te(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e },
  });
}
async function Nt(e, t) {
  return te("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t),
  });
}
async function Tn(e, t) {
  return te(`/mcp/toggle/${encodeURIComponent(t)}`, {
    method: "PATCH",
    headers: { "X-Agent-Id": e },
  });
}
async function In(e, t) {
  await te(`/skills/${encodeURIComponent(t)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": e },
  });
}
function zn(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const a = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!a) return { number: 6, unit: "h" };
  const n = parseInt(a[1] || "0", 10),
    l = parseInt(a[2] || "0", 10),
    r = parseInt(a[3] || "0", 10),
    o = n * 60 + l + Math.round(r / 60);
  return o <= 0
    ? { number: 6, unit: "h" }
    : o >= 60 && o % 60 === 0
    ? { number: o / 60, unit: "h" }
    : { number: o, unit: "m" };
}
function Pn(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function _n(e) {
  return te("/config/heartbeat", {
    headers: { "X-Agent-Id": e },
  });
}
async function On(e, t) {
  return te("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t),
  });
}
async function An(e) {
  await te("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e },
  });
}
async function Mn(e) {
  return te("/workspace/running-config", {
    headers: { "X-Agent-Id": e },
  });
}
async function Rn(e, t) {
  return te("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t),
  });
}
async function $n(e) {
  return (
    (
      await te("/workspace/language", {
        headers: { "X-Agent-Id": e },
      })
    ).language || "zh"
  );
}
async function Ln(e, t) {
  await te("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t }),
  });
}
async function Bn() {
  return (await te("/config/user-timezone")).timezone || "UTC";
}
async function jn(e) {
  await te("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e }),
  });
}
async function Dn(e) {
  return (
    (await te("/workspace/system-prompt-files", {
      headers: { "X-Agent-Id": e },
    })) || []
  );
}
const xt = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function at({ title: e, subtitle: t, extra: a }) {
  const n = h().React,
    { Space: l } = h().antd;
  return n.createElement(
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
    n.createElement(
      "div",
      null,
      n.createElement(
        "h2",
        { style: { margin: 0, fontSize: 20, fontWeight: 600 } },
        e,
      ),
      t
        ? n.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 13, color: "#8c8c8c" } },
            t,
          )
        : null,
    ),
    a ? n.createElement(l, null, a) : null,
  );
}
function Ct({ items: e, max: t = 5, color: a = "blue", emptyText: n = "无" }) {
  const l = h().React,
    { Tag: r } = h().antd;
  return !e || e.length === 0
    ? l.createElement("span", { style: { fontSize: 12, color: "#bfbfbf" } }, n)
    : l.createElement(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
        ...e
          .slice(0, t)
          .map((o, i) =>
            l.createElement(
              r,
              { key: i, color: a, style: { fontSize: 11, marginRight: 0 } },
              o,
            ),
          ),
        e.length > t
          ? l.createElement(
              r,
              { style: { fontSize: 11, marginRight: 0 } },
              `+${e.length - t}`,
            )
          : null,
      );
}
function Ut({
  open: e,
  onClose: t,
  poolSkills: a,
  installedSkillNames: n,
  loading: l,
  onInstall: r,
}) {
  const o = h().React,
    { useState: i, useEffect: y, useMemo: c } = o,
    {
      Modal: m,
      Button: x,
      Empty: v,
      Spin: f,
      Input: C,
      Tag: E,
      Tooltip: S,
      Typography: P,
    } = h().antd,
    { CheckOutlined: G, SearchOutlined: k } = h().antdIcons || {},
    { Text: V } = P,
    [b, T] = i([]),
    [$, L] = i("");
  y(() => {
    e && (T([]), L(""));
  }, [e]);
  const u = c(() => {
      if (!$.trim()) return a;
      const A = $.toLowerCase();
      return a.filter((_) => {
        var p, N;
        return (
          _.name.toLowerCase().includes(A) ||
          ((p = _.description) == null
            ? void 0
            : p.toLowerCase().includes(A)) ||
          ((N = _.tags) == null
            ? void 0
            : N.some((K) => K.toLowerCase().includes(A)))
        );
      });
    }, [a, $]),
    w = u.filter((A) => !n.includes(A.name)),
    z = (A) => {
      T((_) => (_.includes(A) ? _.filter((p) => p !== A) : [..._, A]));
    },
    Z = async () => {
      b.length !== 0 && (await r(b), T([]));
    };
  return o.createElement(
    m,
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
            alignItems: "center",
          },
        },
        o.createElement(
          V,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${b.length} 个技能`,
        ),
        o.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          o.createElement(x, { onClick: t }, "取消"),
          o.createElement(
            x,
            {
              type: "primary",
              onClick: Z,
              disabled: b.length === 0,
            },
            b.length > 0 ? `添加 (${b.length})` : "添加",
          ),
        ),
      ),
    },
    // Search + bulk actions bar
    o.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 8,
          alignItems: "center",
        },
      },
      o.createElement(C, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: k ? o.createElement(k) : void 0,
        value: $,
        onChange: (A) => L(A.target.value),
        allowClear: !0,
        style: { flex: 1 },
      }),
      o.createElement(
        x,
        {
          size: "small",
          type: "primary",
          onClick: () => T(w.map((A) => A.name)),
        },
        "全选",
      ),
      o.createElement(
        x,
        {
          size: "small",
          onClick: () => T([]),
        },
        "清空",
      ),
    ),
    // Skill grid (card style matching Skill Center)
    l
      ? o.createElement(
          "div",
          { style: { textAlign: "center", padding: 40 } },
          o.createElement(f, { size: "large" }),
        )
      : u.length === 0
      ? o.createElement(v, {
          description: $ ? "未找到匹配的技能" : "技能池暂无可用技能",
          image: v.PRESENTED_IMAGE_SIMPLE,
        })
      : o.createElement(
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
          ...u.map((A) => {
            const _ = b.includes(A.name),
              p = n.includes(A.name);
            return o.createElement(
              "div",
              {
                key: A.name,
                onClick: () => !p && z(A.name),
                style: {
                  position: "relative",
                  padding: "10px 12px",
                  border: `1px solid ${_ ? "#0072f5" : "#e8e8e8"}`,
                  borderRadius: 6,
                  cursor: p ? "not-allowed" : "pointer",
                  transition: "all 0.15s ease",
                  background: _
                    ? "rgba(0, 114, 245, 0.06)"
                    : p
                    ? "#fafafa"
                    : "#fff",
                  opacity: p ? 0.5 : 1,
                  minHeight: 64,
                },
              },
              _
                ? o.createElement(
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
                    G ? o.createElement(G) : "✓",
                  )
                : null,
              p
                ? o.createElement(
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
              o.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 4,
                    paddingRight: p || _ ? 24 : 0,
                  },
                },
                o.createElement(
                  "span",
                  { style: { fontSize: 16 } },
                  A.emoji || "⚡",
                ),
                o.createElement(
                  S,
                  { title: A.name },
                  o.createElement(
                    V,
                    {
                      strong: !0,
                      style: {
                        fontSize: 13,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      },
                    },
                    A.name,
                  ),
                ),
              ),
              A.description
                ? o.createElement(
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
                    A.description,
                  )
                : null,
              A.tags && A.tags.length > 0
                ? o.createElement(
                    "div",
                    {
                      style: {
                        marginTop: 4,
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                      },
                    },
                    ...A.tags.slice(0, 2).map((N, K) =>
                      o.createElement(
                        E,
                        {
                          key: K,
                          color: "cyan",
                          style: { fontSize: 10, marginRight: 0 },
                        },
                        N,
                      ),
                    ),
                  )
                : null,
            );
          }),
        ),
  );
}
const Ke = {
    marginBottom: 4,
    fontSize: 13,
    fontWeight: 500,
    color: "rgba(0,0,0,0.85)",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  Ft = { marginBottom: 16 },
  Gt = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0 16px",
    marginBottom: 16,
  },
  Ne = {
    fontSize: 13,
    fontWeight: 600,
    color: "rgba(0,0,0,0.85)",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: "1px solid #f0f0f0",
  },
  Ht = {
    fontSize: 12,
    color: "rgba(0,0,0,0.45)",
    marginLeft: 8,
  };
function Nn({ agentId: e }) {
  const t = h().React,
    { useState: a, useEffect: n, useCallback: l } = t,
    {
      Switch: r,
      InputNumber: o,
      Select: i,
      Button: y,
      Spin: c,
      Space: m,
      Typography: x,
      message: v,
    } = h().antd,
    { PlayCircleOutlined: f, SaveOutlined: C } = h().antdIcons || {},
    { Text: E } = x,
    [S, P] = a(!0),
    [G, k] = a(!1),
    [V, b] = a(!1),
    [T, $] = a(!1),
    [L, u] = a(6),
    [w, z] = a("h"),
    [Z, A] = a("main"),
    [_, p] = a(300),
    [N, K] = a(!1),
    [J, B] = a("08:00"),
    [g, I] = a("22:00"),
    j = l(async () => {
      var D, O;
      P(!0);
      try {
        const d = await _n(e),
          Q = zn(d.every ?? "6h");
        $(d.enabled ?? !1),
          u(Q.number),
          z(Q.unit),
          A(d.target ?? "main"),
          p(d.timeoutSeconds ?? 300),
          K(!!d.activeHours),
          B(((D = d.activeHours) == null ? void 0 : D.start) ?? "08:00"),
          I(((O = d.activeHours) == null ? void 0 : O.end) ?? "22:00");
      } catch (d) {
        v.error(d.message || "加载心跳配置失败");
      } finally {
        P(!1);
      }
    }, [e]);
  n(() => {
    j();
  }, [j]);
  const re = async () => {
      k(!0);
      try {
        await On(e, {
          enabled: T,
          every: Pn({ number: L, unit: w }),
          target: Z,
          timeoutSeconds: _,
          activeHours: N && J && g ? { start: J, end: g } : void 0,
        }),
          v.success("心跳配置已保存");
      } catch (D) {
        v.error(D.message || "保存心跳配置失败");
      } finally {
        k(!1);
      }
    },
    q = async () => {
      b(!0);
      try {
        await An(e), v.success("已触发心跳检查");
      } catch (D) {
        v.error(D.message || "触发心跳失败");
      } finally {
        b(!1);
      }
    };
  if (S)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(c, { size: "large" }),
    );
  const le = (D, O, d) =>
      t.createElement(
        "div",
        { style: Ft },
        t.createElement("div", { style: Ke }, D),
        O,
        d ? t.createElement(E, { type: "secondary", style: Ht }, d) : null,
      ),
    ee = (D, O, d, Q) =>
      t.createElement(
        "div",
        { style: Gt },
        t.createElement(
          "div",
          null,
          t.createElement("div", { style: Ke }, D),
          O,
        ),
        t.createElement(
          "div",
          null,
          t.createElement("div", { style: Ke }, d),
          Q,
        ),
      ),
    { Divider: H } = h().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: Ne }, "基本设置"),
    le(
      "启用心跳",
      t.createElement(r, {
        checked: T,
        onChange: (D) => $(D),
      }),
      T ? "已启用，专家将定期自检" : "已停用",
    ),
    ee(
      "检查频率",
      t.createElement(
        m,
        null,
        t.createElement(o, {
          min: 1,
          value: L,
          onChange: (D) => u(D ?? 1),
          style: { width: "100%" },
        }),
        t.createElement(i, {
          value: w,
          onChange: (D) => z(D),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" },
          ],
        }),
      ),
      "心跳目标",
      t.createElement(i, {
        value: Z,
        onChange: (D) => A(D),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" },
        ],
      }),
    ),
    le(
      "超时时间 (秒)",
      t.createElement(o, {
        min: 1,
        max: 3600,
        value: _,
        onChange: (D) => p(D ?? 300),
        style: { width: 200 },
      }),
    ),
    // ── Section: 活跃时段 ──
    t.createElement(H, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "活跃时段"),
    le(
      "启用活跃时段限制",
      t.createElement(r, {
        checked: N,
        onChange: (D) => K(D),
      }),
      "仅在指定时段内触发心跳",
    ),
    N
      ? ee(
          "开始时间",
          t.createElement("input", {
            type: "time",
            value: J,
            onChange: (D) => B(D.target.value),
            style: {
              width: "100%",
              padding: "4px 11px",
              borderRadius: 6,
              border: "1px solid #d9d9d9",
              fontSize: 14,
            },
          }),
          "结束时间",
          t.createElement("input", {
            type: "time",
            value: g,
            onChange: (D) => I(D.target.value),
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
    t.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 16,
          gap: 8,
        },
      },
      t.createElement(
        y,
        {
          type: "primary",
          icon: C ? t.createElement(C) : void 0,
          loading: G,
          onClick: re,
          style: Me,
        },
        "保存配置",
      ),
      t.createElement(
        y,
        {
          icon: f ? t.createElement(f) : void 0,
          loading: V,
          onClick: q,
        },
        "立即执行",
      ),
    ),
  );
}
function Un({ agentId: e, onRefresh: t }) {
  const a = h().React,
    { useState: n, useEffect: l, useCallback: r } = a,
    {
      List: o,
      Tag: i,
      Switch: y,
      Button: c,
      Empty: m,
      Spin: x,
      Typography: v,
      message: f,
    } = h().antd,
    {
      PlusOutlined: C,
      ReloadOutlined: E,
      DeleteOutlined: S,
    } = h().antdIcons || {},
    { Text: P, Paragraph: G } = v,
    [k, V] = n([]),
    [b, T] = n(!0),
    [$, L] = n(!1),
    [u, w] = n([]),
    [z, Z] = n(!1),
    A = r(async () => {
      T(!0);
      try {
        const B = await lt(e);
        V(B);
      } catch (B) {
        f.error(B.message || "加载技能失败"), V([]);
      } finally {
        T(!1);
      }
    }, [e]);
  l(() => {
    A();
  }, [A]);
  const _ = async () => {
      L(!0), Z(!0);
      try {
        const B = await gt(!0);
        w(B);
      } catch (B) {
        f.error(B.message || "加载技能池失败");
      } finally {
        Z(!1);
      }
    },
    p = async (B) => {
      let g = 0,
        I = 0;
      for (const j of B)
        try {
          await Bt(e, j), g++;
        } catch {
          I++;
        }
      g > 0
        ? (f.success(`成功添加 ${g} 个技能${I > 0 ? `，${I} 个失败` : ""}`),
          A(),
          t())
        : I > 0 && f.error("添加技能失败"),
        L(!1);
    },
    N = async (B, g) => {
      try {
        g ? await wn(e, B.name) : await In(e, B.name),
          f.success(g ? "已启用" : "已停用"),
          A(),
          t();
      } catch (I) {
        f.error(I.message || "操作失败");
      }
    },
    K = async (B) => {
      try {
        await jt(e, B), f.success(`技能「${B}」已移除`), A(), t();
      } catch (g) {
        f.error(g.message || "移除技能失败");
      }
    };
  if (b)
    return a.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      a.createElement(x, { size: "large" }),
    );
  const J = k.filter((B) => B.enabled !== !1);
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
          marginBottom: 12,
        },
      },
      a.createElement(
        P,
        { strong: !0 },
        `技能列表 (${k.length}，已启用 ${J.length})`,
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          c,
          {
            size: "small",
            icon: E ? a.createElement(E) : void 0,
            onClick: A,
          },
          "刷新",
        ),
        a.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: C ? a.createElement(C) : void 0,
            onClick: _,
            style: Me,
          },
          "从技能池添加",
        ),
      ),
    ),
    k.length === 0
      ? a.createElement(m, {
          description: "该专家暂无技能",
          image: m.PRESENTED_IMAGE_SIMPLE,
        })
      : a.createElement(o, {
          dataSource: k,
          renderItem: (B) =>
            a.createElement(
              o.Item,
              {
                actions: [
                  a.createElement(y, {
                    key: "toggle",
                    size: "small",
                    checked: B.enabled !== !1,
                    onChange: (g) => N(B, g),
                  }),
                  a.createElement(
                    c,
                    {
                      key: "del",
                      type: "link",
                      size: "small",
                      danger: !0,
                      icon: S ? a.createElement(S) : void 0,
                      onClick: () => K(B.name),
                    },
                    "移除",
                  ),
                ],
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
                      marginBottom: 4,
                    },
                  },
                  B.emoji
                    ? a.createElement(
                        "span",
                        { style: { fontSize: 16 } },
                        B.emoji,
                      )
                    : null,
                  a.createElement(P, { strong: !0 }, B.name),
                  B.version_text
                    ? a.createElement(
                        i,
                        { style: { fontSize: 10 } },
                        `v${B.version_text}`,
                      )
                    : null,
                ),
                B.description
                  ? a.createElement(
                      G,
                      {
                        type: "secondary",
                        style: { fontSize: 12, margin: 0 },
                        ellipsis: { rows: 2 },
                      },
                      B.description,
                    )
                  : null,
              ),
            ),
        }),
    a.createElement(Ut, {
      open: $,
      onClose: () => L(!1),
      poolSkills: u,
      installedSkillNames: k.map((B) => B.name),
      loading: z,
      onInstall: p,
    }),
  );
}
function Fn({ agentId: e, onRefresh: t, isActive: a }) {
  const n = h().React,
    { useState: l, useEffect: r, useCallback: o } = n,
    {
      List: i,
      Tag: y,
      Button: c,
      Empty: m,
      Spin: x,
      Modal: v,
      Input: f,
      Typography: C,
      message: E,
    } = h().antd,
    {
      PlusOutlined: S,
      ReloadOutlined: P,
      DeleteOutlined: G,
    } = h().antdIcons || {},
    { Text: k, Paragraph: V } = C,
    { TextArea: b } = f,
    [T, $] = l([]),
    [L, u] = l(!0),
    [w, z] = l(!1),
    [Z, A] = l(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`),
    [_, p] = l(!1),
    N = o(async () => {
      u(!0);
      try {
        const g = await ft(e);
        $(g);
      } catch (g) {
        E.error(g.message || "加载 MCP 失败"), $([]);
      } finally {
        u(!1);
      }
    }, [e]);
  r(() => {
    N();
  }, [N]),
    r(() => {
      a && N();
    }, [a, N]);
  const K = async (g) => {
      try {
        await Tn(e, g), E.success("已切换 MCP 状态"), N(), t();
      } catch (I) {
        E.error(I.message || "切换失败");
      }
    },
    J = async (g) => {
      try {
        await Dt(e, g), E.success(`MCP「${g}」已移除`), N(), t();
      } catch (I) {
        E.error(I.message || "移除 MCP 失败");
      }
    },
    B = async () => {
      p(!0);
      try {
        const g = JSON.parse(Z),
          I = g.mcpServers || g,
          j = Object.entries(I);
        if (j.length === 0) {
          E.warning("未找到 MCP 客户端配置");
          return;
        }
        for (const [re, q] of j) {
          const le = q,
            ee = le.url ? "streamable_http" : "stdio";
          await Nt(e, {
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
              headers: le.headers || {},
            },
          });
        }
        E.success("MCP 客户端已创建"), z(!1), N(), t();
      } catch (g) {
        g instanceof SyntaxError
          ? E.error("JSON 格式错误：" + g.message)
          : E.error(g.message || "创建 MCP 失败");
      } finally {
        p(!1);
      }
    };
  return L
    ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        n.createElement(x, { size: "large" }),
      )
    : n.createElement(
        "div",
        null,
        n.createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            },
          },
          n.createElement(k, { strong: !0 }, `MCP 客户端 (${T.length})`),
          n.createElement(
            "div",
            { style: { display: "flex", gap: 8 } },
            n.createElement(
              c,
              {
                size: "small",
                icon: P ? n.createElement(P) : void 0,
                onClick: N,
              },
              "刷新",
            ),
            n.createElement(
              c,
              {
                type: "primary",
                size: "small",
                icon: S ? n.createElement(S) : void 0,
                onClick: () => z(!0),
                style: Me,
              },
              "添加 MCP",
            ),
          ),
        ),
        T.length === 0
          ? n.createElement(m, {
              description: "该专家暂无 MCP 客户端",
              image: m.PRESENTED_IMAGE_SIMPLE,
            })
          : n.createElement(i, {
              dataSource: T,
              renderItem: (g) =>
                n.createElement(
                  i.Item,
                  {
                    actions: [
                      n.createElement(
                        c,
                        {
                          key: "toggle",
                          size: "small",
                          onClick: () => K(g.key),
                        },
                        g.enabled ? "停用" : "启用",
                      ),
                      n.createElement(
                        c,
                        {
                          key: "del",
                          type: "link",
                          size: "small",
                          danger: !0,
                          icon: G ? n.createElement(G) : void 0,
                          onClick: () => J(g.key),
                        },
                        "移除",
                      ),
                    ],
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
                          marginBottom: 4,
                        },
                      },
                      n.createElement(
                        "span",
                        { style: { fontSize: 14 } },
                        "🔌",
                      ),
                      n.createElement(k, { strong: !0 }, g.name || g.key),
                      n.createElement(
                        y,
                        {
                          color: g.enabled ? "green" : "default",
                          style: { fontSize: 10 },
                        },
                        g.enabled ? "启用" : "停用",
                      ),
                      n.createElement(
                        y,
                        { color: "purple", style: { fontSize: 10 } },
                        g.transport,
                      ),
                    ),
                    g.description
                      ? n.createElement(
                          V,
                          {
                            type: "secondary",
                            style: { fontSize: 12, margin: 0 },
                            ellipsis: { rows: 2 },
                          },
                          g.description,
                        )
                      : null,
                    g.tools && g.tools.length > 0
                      ? n.createElement(
                          "div",
                          {
                            style: {
                              marginTop: 4,
                              fontSize: 11,
                              color: "#8c8c8c",
                            },
                          },
                          `提供 ${g.tools.length} 个工具`,
                        )
                      : null,
                  ),
                ),
            }),
        // Create MCP modal
        n.createElement(
          v,
          {
            open: w,
            title: "添加 MCP 客户端 (JSON)",
            onCancel: () => z(!1),
            onOk: B,
            confirmLoading: _,
            okText: "创建",
            width: 560,
          },
          n.createElement(
            "div",
            { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
            "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区：",
          ),
          n.createElement(b, {
            value: Z,
            onChange: (g) => A(g.target.value),
            rows: 12,
            style: { fontFamily: "monospace", fontSize: 12 },
          }),
        ),
      );
}
function Gn({ agentId: e }) {
  const t = h().React,
    { useState: a, useEffect: n, useCallback: l, useRef: r } = t,
    {
      Card: o,
      InputNumber: i,
      Input: y,
      Select: c,
      Switch: m,
      Button: x,
      Spin: v,
      Space: f,
      Typography: C,
      Divider: E,
      message: S,
    } = h().antd,
    { SaveOutlined: P } = h().antdIcons || {},
    { Text: G } = C,
    [k, V] = a(!0),
    [b, T] = a(!1),
    $ = r(null),
    [L, u] = a(60),
    [w, z] = a(""),
    [Z, A] = a(!0),
    [_, p] = a(30),
    [N, K] = a("zh"),
    [J, B] = a("UTC"),
    [g, I] = a(!0),
    [j, re] = a(100),
    [q, le] = a(!0),
    [ee, H] = a(3),
    [D, O] = a(1),
    [d, Q] = a(!0),
    [se, he] = a(3),
    [X, me] = a(2),
    [U, ae] = a(60),
    [oe, ne] = a(1),
    [W, pe] = a(0),
    [de, ze] = a(1),
    [Te, M] = a(0),
    [ie, ge] = a(30),
    [xe, Se] = a(50),
    [Ce, $e] = a("light"),
    [Ue, Oe] = a("scroll"),
    [Fe, Ge] = a("remelight"),
    [je, Le] = a("AUTO"),
    De = l(async () => {
      var R, ke, we, be, Ie, Re;
      V(!0);
      try {
        const [ye, Je, rt] = await Promise.all([
          Mn(e),
          $n(e).catch(() => "zh"),
          Bn().catch(() => "UTC"),
        ]);
        ($.current = ye),
          u(ye.shell_command_timeout ?? 60),
          z(ye.shell_command_executable ?? "");
        const Ve = ye.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
        A(Ve.enabled ?? !0), p(Ve.timeout_seconds ?? 30), K(Je), B(rt);
        const We = ye.loop ?? {};
        I(((R = We.iteration) == null ? void 0 : R.enabled) ?? !0),
          re(
            ((ke = We.iteration) == null ? void 0 : ke.max_iterations) ??
              ye.max_iters ??
              100,
          ),
          le(((we = We.doom_loop) == null ? void 0 : we.enabled) ?? !0),
          H(((be = We.doom_loop) == null ? void 0 : be.window_size) ?? 3),
          O(
            ((Ie = We.doom_loop) == null ? void 0 : Ie.similarity_threshold) ??
              1,
          ),
          Q(ye.llm_retry_enabled ?? !0),
          he(ye.llm_max_retries ?? 3),
          me(ye.llm_backoff_base ?? 2),
          ae(ye.llm_backoff_cap ?? 60),
          ne(ye.llm_max_concurrent ?? 1),
          pe(ye.llm_max_qpm ?? 0),
          ze(ye.llm_rate_limit_pause ?? 1),
          M(ye.llm_rate_limit_jitter ?? 0),
          ge(ye.llm_acquire_timeout ?? 30),
          Se(ye.history_max_length ?? 50),
          $e(ye.context_manager_backend ?? "light"),
          Oe(
            ((Re = ye.light_context_config) == null ? void 0 : Re.strategy) ??
              "scroll",
          ),
          Ge(ye.memory_manager_backend ?? "remelight"),
          Le(ye.approval_level ?? "AUTO");
      } catch (ye) {
        S.error(ye.message || "加载运行配置失败");
      } finally {
        V(!1);
      }
    }, [e]);
  n(() => {
    De();
  }, [De]);
  const He = async () => {
    var ke, we;
    const R = $.current;
    if (R) {
      T(!0);
      try {
        const be = {
          ...R,
          max_iters: j,
          loop: {
            ...(R.loop ?? {}),
            iteration: { enabled: g, max_iterations: j },
            doom_loop: {
              enabled: q,
              window_size: ee,
              similarity_threshold: D,
              stages:
                ((we = (ke = R.loop) == null ? void 0 : ke.doom_loop) == null
                  ? void 0
                  : we.stages) ?? [],
            },
          },
          shell_command_timeout: L,
          shell_command_executable: w,
          auto_title_config: {
            enabled: Z,
            timeout_seconds: _,
          },
          llm_retry_enabled: d,
          llm_max_retries: se,
          llm_backoff_base: X,
          llm_backoff_cap: U,
          llm_max_concurrent: oe,
          llm_max_qpm: W,
          llm_rate_limit_pause: de,
          llm_rate_limit_jitter: Te,
          llm_acquire_timeout: ie,
          history_max_length: xe,
          context_manager_backend: Ce,
          light_context_config: {
            ...(R.light_context_config ?? {}),
            strategy: Ue,
          },
          memory_manager_backend: Fe,
          approval_level: je,
        };
        await Rn(e, be),
          ($.current = be),
          N && (await Ln(e, N).catch(() => {})),
          J && (await jn(J).catch(() => {})),
          S.success("运行配置已保存");
      } catch (be) {
        S.error(be.message || "保存运行配置失败");
      } finally {
        T(!1);
      }
    }
  };
  if (k)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(v, { size: "large" }),
    );
  const Y = (R, ke, we) =>
      t.createElement(
        "div",
        { style: Ft },
        t.createElement("div", { style: Ke }, R),
        ke,
        we ? t.createElement(G, { type: "secondary", style: Ht }, we) : null,
      ),
    ce = (R, ke, we, be) =>
      t.createElement(
        "div",
        { style: Gt },
        t.createElement(
          "div",
          null,
          t.createElement("div", { style: Ke }, R),
          ke,
        ),
        t.createElement(
          "div",
          null,
          t.createElement("div", { style: Ke }, we),
          be,
        ),
      );
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    t.createElement("div", { style: Ne }, "基础设置"),
    ce(
      "Shell 命令超时 (秒)",
      t.createElement(i, {
        min: 1,
        value: L,
        onChange: (R) => u(R ?? 60),
        style: { width: "100%" },
      }),
      "Shell 可执行文件",
      t.createElement(y, {
        value: w,
        onChange: (R) => z(R.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" },
      }),
    ),
    ce(
      "语言",
      t.createElement(c, {
        value: N,
        onChange: (R) => K(R),
        style: { width: "100%" },
        options: [
          { value: "zh", label: "中文" },
          { value: "en", label: "English" },
          { value: "id", label: "Bahasa Indonesia" },
          { value: "ru", label: "Русский" },
        ],
      }),
      "时区",
      t.createElement(c, {
        value: J,
        onChange: (R) => B(R),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (R, ke) => {
          var we;
          return (
            ((we = ke == null ? void 0 : ke.label) == null
              ? void 0
              : we.toString()) || ""
          )
            .toLowerCase()
            .includes(R.toLowerCase());
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
          "Australia/Sydney",
        ].map((R) => ({ value: R, label: R })),
      }),
    ),
    ce(
      "自动生成会话标题",
      t.createElement(
        f,
        null,
        t.createElement(m, {
          checked: Z,
          onChange: (R) => A(R),
        }),
      ),
      "标题生成超时 (秒)",
      t.createElement(i, {
        min: 5,
        value: _,
        onChange: (R) => p(R ?? 30),
        style: { width: "100%" },
        disabled: !Z,
      }),
    ),
    // ── Section: 审批级别 ──
    t.createElement(E, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "审批级别"),
    Y(
      "工具执行审批",
      t.createElement(c, {
        value: je,
        onChange: (R) => Le(R),
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
    t.createElement(E, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "迭代与循环"),
    Y(
      "启用迭代限制",
      t.createElement(m, {
        checked: g,
        onChange: (R) => I(R),
      }),
      "停止 Agent 前的最大循环轮次",
    ),
    g
      ? Y(
          "最大迭代次数",
          t.createElement(i, {
            min: 1,
            max: 500,
            value: j,
            onChange: (R) => re(R ?? 100),
            style: { width: "100%" },
          }),
        )
      : null,
    Y(
      "启用重复循环保护",
      t.createElement(m, {
        checked: q,
        onChange: (R) => le(R),
      }),
      "检测并阻止重复操作循环",
    ),
    q
      ? ce(
          "检测窗口大小",
          t.createElement(i, {
            min: 2,
            max: 20,
            value: ee,
            onChange: (R) => H(R ?? 3),
            style: { width: "100%" },
          }),
          "相似度阈值",
          t.createElement(i, {
            min: 0,
            max: 1,
            step: 0.05,
            value: D,
            onChange: (R) => O(R ?? 1),
            style: { width: "100%" },
          }),
        )
      : null,
    // ── Section: LLM 重试 ──
    t.createElement(E, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "LLM 重试"),
    Y(
      "启用 LLM 重试",
      t.createElement(m, {
        checked: d,
        onChange: (R) => Q(R),
      }),
    ),
    ce(
      "最大重试次数",
      t.createElement(i, {
        min: 1,
        value: se,
        onChange: (R) => he(R ?? 3),
        style: { width: "100%" },
        disabled: !d,
      }),
      "退避基数 (秒)",
      t.createElement(i, {
        min: 0.1,
        step: 0.1,
        value: X,
        onChange: (R) => me(R ?? 2),
        style: { width: "100%" },
        disabled: !d,
      }),
    ),
    Y(
      "退避上限 (秒)",
      t.createElement(i, {
        min: 0.5,
        step: 0.5,
        value: U,
        onChange: (R) => ae(R ?? 60),
        style: { width: 200 },
        disabled: !d,
      }),
    ),
    // ── Section: LLM 限流 ──
    t.createElement(E, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "LLM 限流"),
    ce(
      "最大并发数",
      t.createElement(i, {
        min: 1,
        value: oe,
        onChange: (R) => ne(R ?? 1),
        style: { width: "100%" },
      }),
      "最大 QPM (0=不限)",
      t.createElement(i, {
        min: 0,
        step: 10,
        value: W,
        onChange: (R) => pe(R ?? 0),
        style: { width: "100%" },
      }),
    ),
    ce(
      "限流暂停时间 (秒)",
      t.createElement(i, {
        min: 1,
        step: 0.5,
        value: de,
        onChange: (R) => ze(R ?? 1),
        style: { width: "100%" },
      }),
      "限流抖动 (秒)",
      t.createElement(i, {
        min: 0,
        step: 0.5,
        value: Te,
        onChange: (R) => M(R ?? 0),
        style: { width: "100%" },
      }),
    ),
    Y(
      "获取超时 (秒)",
      t.createElement(i, {
        min: 10,
        step: 10,
        value: ie,
        onChange: (R) => ge(R ?? 30),
        style: { width: 200 },
      }),
      "应大于 限流暂停 + 抖动",
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(E, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ne }, "上下文与记忆"),
    ce(
      "上下文管理后端",
      t.createElement(c, {
        value: Ce,
        onChange: (R) => $e(R),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }],
      }),
      "上下文策略",
      t.createElement(c, {
        value: Ue,
        onChange: (R) => Oe(R),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" },
        ],
      }),
    ),
    ce(
      "记忆管理后端",
      t.createElement(c, {
        value: Fe,
        onChange: (R) => Ge(R),
        style: { width: "100%" },
        options: [
          { value: "remelight", label: "remelight" },
          { value: "adbpg", label: "adbpg" },
          { value: "none", label: "none (禁用)" },
        ],
      }),
      "历史消息最大长度",
      t.createElement(i, {
        min: 1,
        value: xe,
        onChange: (R) => Se(R ?? 50),
        style: { width: "100%" },
      }),
    ),
    // ── Save button ──
    t.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      t.createElement(
        x,
        {
          type: "primary",
          icon: P ? t.createElement(P) : void 0,
          loading: b,
          onClick: He,
          style: Me,
        },
        "保存运行配置",
      ),
    ),
  );
}
function Hn({ expert: e, open: t, onClose: a, onRefresh: n }) {
  const l = h().React,
    { useState: r, useEffect: o, useCallback: i } = l,
    { Modal: y, Tabs: c, Spin: m, Typography: x } = h().antd,
    { SettingOutlined: v } = h().antdIcons || {},
    { Text: f } = x,
    [C, E] = r([]),
    [S, P] = r(!1),
    [G, k] = r("heartbeat"),
    V = i(async () => {
      if (e) {
        P(!0);
        try {
          const L = await Dn(e.agent.id);
          E(L);
        } catch {
          E([]);
        } finally {
          P(!1);
        }
      }
    }, [e]);
  if (
    (o(() => {
      t && e && V();
    }, [t, e, V]),
    !e)
  )
    return null;
  const { agent: b } = e,
    T = () => {
      V(), n();
    },
    $ = [
      {
        key: "heartbeat",
        label: "心跳",
        children: l.createElement(Nn, {
          agentId: b.id,
        }),
      },
      {
        key: "files",
        label: "文件",
        children: S
          ? l.createElement(
              "div",
              { style: { textAlign: "center", padding: 40 } },
              l.createElement(m, { size: "large" }),
            )
          : l.createElement(Wt, {
              agentId: b.id,
              systemPromptFiles: C,
              onRefresh: T,
            }),
      },
      {
        key: "skills",
        label: `技能 (${e.skills.filter((L) => L.enabled !== !1).length})`,
        children: l.createElement(Un, {
          agentId: b.id,
          onRefresh: n,
        }),
      },
      {
        key: "mcp",
        label: `MCP (${e.mcps.length})`,
        children: l.createElement(Fn, {
          agentId: b.id,
          onRefresh: n,
          isActive: G === "mcp",
        }),
      },
      {
        key: "running",
        label: "运行配置",
        children: l.createElement(Gn, {
          agentId: b.id,
        }),
      },
    ];
  return l.createElement(
    y,
    {
      open: t,
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        v ? l.createElement(v, { style: { fontSize: 18 } }) : null,
        l.createElement("span", null, `配置 - ${b.name}`),
        l.createElement(
          f,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          b.id,
        ),
      ),
      onCancel: a,
      footer: null,
      width: 800,
      centered: !0,
      styles: {
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
          paddingTop: 0,
        },
      },
    },
    l.createElement(c, {
      items: $,
      activeKey: G,
      onChange: (L) => k(L),
      size: "small",
      tabBarStyle: { marginBottom: 16, sticky: 0 },
    }),
  );
}
function Wn({ expert: e, onClick: t, onSummon: a, onConfigure: n }) {
  const l = h().React,
    {
      Card: r,
      Tag: o,
      Badge: i,
      Typography: y,
      Spin: c,
      Button: m,
      Tooltip: x,
    } = h().antd,
    { Text: v } = y,
    { ThunderboltOutlined: f, SettingOutlined: C } = h().antdIcons || {},
    { agent: E, skills: S, mcps: P, loading: G } = e,
    k = E.enabled,
    V = S.filter(($) => $.enabled !== !1).map(($) => $.name),
    b = P.map(($) => $.name || $.key),
    T = E.active_model
      ? `${E.active_model.provider_id}/${E.active_model.model}`
      : null;
  return l.createElement(
    r,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: k ? void 0 : "#d9d9d9",
        opacity: k ? 1 : 0.7,
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
    l.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        },
      },
      l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        l.createElement(Be, { name: E.name, size: 36 }),
        l.createElement(
          "div",
          null,
          l.createElement(v, { strong: !0, style: { fontSize: 15 } }, E.name),
          l.createElement(
            "div",
            {
              style: {
                fontSize: 11,
                color: "#bfbfbf",
                fontFamily: "monospace",
              },
            },
            E.id,
          ),
        ),
      ),
      l.createElement(i, {
        status: k ? "success" : "default",
        text: k ? "启用" : "停用",
      }),
    ),
    // Description (rendered as markdown)
    E.description
      ? l.createElement(
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
          yt(E.description, l),
        )
      : l.createElement(
          "div",
          {
            style: {
              fontSize: 12,
              color: "#bfbfbf",
              marginBottom: 10,
              minHeight: 54,
              flex: "1 0 auto",
            },
          },
          "暂无描述",
        ),
    // Model info
    T
      ? l.createElement(
          "div",
          { style: { marginBottom: 8 } },
          l.createElement(
            o,
            { color: "geekblue", style: { fontSize: 11 } },
            `🤖 ${T}`,
          ),
        )
      : null,
    // Skills
    G
      ? l.createElement(c, { size: "small" })
      : l.createElement(
          "div",
          { style: { marginBottom: 6 } },
          l.createElement(
            "div",
            { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
            `技能 (${V.length})`,
          ),
          l.createElement(Ct, {
            items: V,
            max: 4,
            color: "cyan",
            emptyText: "未配置技能",
          }),
        ),
    // MCP
    !G && b.length > 0
      ? l.createElement(
          "div",
          { style: { marginTop: "auto" } },
          l.createElement(
            "div",
            { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
            `MCP (${b.length})`,
          ),
          l.createElement(Ct, {
            items: b,
            max: 3,
            color: "purple",
          }),
        )
      : null,
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
          borderTop: "1px solid #f0f0f0",
        },
      },
      // Gear icon (bottom-left) — opens configuration modal
      l.createElement(
        x,
        { title: "配置专家", placement: "top" },
        l.createElement(m, {
          type: "text",
          size: "small",
          icon: C
            ? l.createElement(C, {
                style: { fontSize: 16, color: "#8c8c8c" },
              })
            : void 0,
          onClick: ($) => {
            $.stopPropagation(), n && n();
          },
        }),
      ),
      // Summon button (bottom-right)
      l.createElement(
        m,
        {
          type: "primary",
          size: "small",
          icon: f ? l.createElement(f) : void 0,
          disabled: !k,
          onClick: ($) => {
            $.stopPropagation(), a && a();
          },
          style: Me,
        },
        "召唤专家",
      ),
    ),
  );
}
function Jn({ expert: e, open: t, onClose: a, onRefresh: n }) {
  const l = h().React,
    {
      Drawer: r,
      Descriptions: o,
      Tag: i,
      Typography: y,
      Space: c,
      Button: m,
      Empty: x,
      Tabs: v,
      List: f,
      Spin: C,
      Modal: E,
      message: S,
    } = h().antd,
    { Text: P, Paragraph: G } = y,
    {
      EditOutlined: k,
      ThunderboltOutlined: V,
      FileTextOutlined: b,
      ToolOutlined: T,
      PlusOutlined: $,
    } = h().antdIcons || {},
    [L, u] = l.useState(!1),
    [w, z] = l.useState([]),
    [Z, A] = l.useState(!1);
  if (!e) return null;
  const { agent: _, config: p, skills: N, mcps: K, loading: J } = e,
    B = N.filter((d) => d.enabled !== !1),
    g = (d) => {
      window.history.pushState({}, "", d),
        window.dispatchEvent(new PopStateEvent("popstate"));
    },
    I = l.createElement(
      "div",
      null,
      l.createElement(
        o,
        { column: 1, bordered: !0, size: "small" },
        l.createElement(o.Item, { label: "专家名称" }, _.name),
        l.createElement(
          o.Item,
          { label: "专家 ID" },
          l.createElement("code", { style: { fontSize: 12 } }, _.id),
        ),
        l.createElement(
          o.Item,
          { label: "状态" },
          l.createElement(
            i,
            { color: _.enabled ? "green" : "default" },
            _.enabled ? "启用" : "停用",
          ),
        ),
        l.createElement(
          o.Item,
          { label: "功能简介" },
          _.description ? yt(_.description, l) : "暂无描述",
        ),
        l.createElement(
          o.Item,
          { label: "使用模型" },
          _.active_model
            ? `${_.active_model.provider_id} / ${_.active_model.model}`
            : "使用全局默认模型",
        ),
        p != null && p.workspace_dir
          ? l.createElement(
              o.Item,
              { label: "工作区路径" },
              l.createElement(
                "code",
                { style: { fontSize: 11 } },
                p.workspace_dir,
              ),
            )
          : null,
        p != null && p.approval_level
          ? l.createElement(o.Item, { label: "审批级别" }, p.approval_level)
          : null,
      ),
      // System prompt files
      p != null && p.system_prompt_files && p.system_prompt_files.length > 0
        ? l.createElement(
            "div",
            { style: { marginTop: 16 } },
            l.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 8,
                },
              },
              b
                ? l.createElement(b, {
                    style: { fontSize: 14, color: "#1677ff" },
                  })
                : null,
              l.createElement(P, { strong: !0 }, "系统提示词文件"),
            ),
            l.createElement(
              c,
              { wrap: !0 },
              ...p.system_prompt_files.map((d, Q) =>
                l.createElement(
                  i,
                  {
                    key: Q,
                    icon: b ? l.createElement(b) : void 0,
                    style: { fontSize: 12 },
                  },
                  d,
                ),
              ),
            ),
          )
        : null,
    ),
    j = async () => {
      u(!0), A(!0);
      try {
        const d = await gt(!0);
        z(d);
      } catch (d) {
        S.error(d.message || "加载技能池失败");
      } finally {
        A(!1);
      }
    },
    re = async (d) => {
      let Q = 0,
        se = 0;
      for (const he of d)
        try {
          await Bt(_.id, he), Q++;
        } catch {
          se++;
        }
      Q > 0
        ? (S.success(`成功添加 ${Q} 个技能${se > 0 ? `，${se} 个失败` : ""}`),
          n())
        : se > 0 && S.error("添加技能失败"),
        u(!1);
    },
    q = async (d) => {
      try {
        await jt(_.id, d), S.success(`技能「${d}」已移除`), n();
      } catch (Q) {
        S.error(Q.message || "移除技能失败");
      }
    },
    le = async (d) => {
      try {
        await Dt(_.id, d), S.success(`MCP「${d}」已移除`), n();
      } catch (Q) {
        S.error(Q.message || "移除 MCP 失败");
      }
    },
    ee = J
      ? l.createElement(
          "div",
          { style: { textAlign: "center", padding: 40 } },
          l.createElement(C, { size: "large" }),
        )
      : l.createElement(
          "div",
          null,
          l.createElement(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              },
            },
            l.createElement(P, { strong: !0 }, `已启用技能 (${B.length})`),
            l.createElement(
              m,
              {
                type: "primary",
                size: "small",
                icon: $ ? l.createElement($) : void 0,
                onClick: j,
              },
              "从技能池添加",
            ),
          ),
          B.length === 0
            ? l.createElement(x, {
                description: "该专家暂无已启用的技能",
                image: x.PRESENTED_IMAGE_SIMPLE,
              })
            : l.createElement(f, {
                dataSource: B,
                renderItem: (d) =>
                  l.createElement(
                    f.Item,
                    {
                      actions: [
                        l.createElement(
                          m,
                          {
                            type: "link",
                            size: "small",
                            danger: !0,
                            onClick: () => q(d.name),
                          },
                          "移除",
                        ),
                      ],
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
                            marginBottom: 4,
                          },
                        },
                        d.emoji
                          ? l.createElement(
                              "span",
                              { style: { fontSize: 16 } },
                              d.emoji,
                            )
                          : null,
                        l.createElement(P, { strong: !0 }, d.name),
                        d.version_text
                          ? l.createElement(
                              i,
                              { style: { fontSize: 10 } },
                              `v${d.version_text}`,
                            )
                          : null,
                      ),
                      d.description
                        ? l.createElement(
                            G,
                            {
                              type: "secondary",
                              style: { fontSize: 12, margin: 0 },
                              ellipsis: { rows: 2 },
                            },
                            d.description,
                          )
                        : null,
                      d.tags && d.tags.length > 0
                        ? l.createElement(
                            "div",
                            { style: { marginTop: 4 } },
                            ...d.tags.map((Q, se) =>
                              l.createElement(
                                i,
                                {
                                  key: se,
                                  color: "cyan",
                                  style: { fontSize: 10 },
                                },
                                Q,
                              ),
                            ),
                          )
                        : null,
                    ),
                  ),
              }),
          // Skill Picker Modal (card-grid style, consistent with Skill Center)
          l.createElement(Ut, {
            open: L,
            onClose: () => u(!1),
            poolSkills: w,
            installedSkillNames: B.map((d) => d.name),
            loading: Z,
            onInstall: re,
          }),
        ),
    H = J
      ? l.createElement(
          "div",
          { style: { textAlign: "center", padding: 40 } },
          l.createElement(C, { size: "large" }),
        )
      : l.createElement(
          "div",
          null,
          l.createElement(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              },
            },
            l.createElement(P, { strong: !0 }, `MCP 客户端 (${K.length})`),
            l.createElement(
              m,
              {
                type: "primary",
                size: "small",
                icon: $ ? l.createElement($) : void 0,
                onClick: () => {
                  window.history.pushState({}, "", `/agents/${_.id}/mcp`),
                    window.dispatchEvent(new PopStateEvent("popstate"));
                },
              },
              "配置 MCP",
            ),
          ),
          K.length === 0
            ? l.createElement(x, {
                description:
                  "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
                image: x.PRESENTED_IMAGE_SIMPLE,
              })
            : l.createElement(f, {
                dataSource: K,
                renderItem: (d) =>
                  l.createElement(
                    f.Item,
                    {
                      actions: [
                        l.createElement(
                          m,
                          {
                            type: "link",
                            size: "small",
                            danger: !0,
                            onClick: () => le(d.key),
                          },
                          "移除",
                        ),
                      ],
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
                            marginBottom: 4,
                          },
                        },
                        l.createElement(
                          "span",
                          { style: { fontSize: 14 } },
                          "🔌",
                        ),
                        l.createElement(P, { strong: !0 }, d.name || d.key),
                        l.createElement(
                          i,
                          {
                            color: d.enabled ? "green" : "default",
                            style: { fontSize: 10 },
                          },
                          d.enabled ? "启用" : "停用",
                        ),
                        l.createElement(
                          i,
                          { color: "purple", style: { fontSize: 10 } },
                          d.transport,
                        ),
                      ),
                      d.description
                        ? l.createElement(
                            G,
                            {
                              type: "secondary",
                              style: { fontSize: 12, margin: 0 },
                              ellipsis: { rows: 2 },
                            },
                            d.description,
                          )
                        : null,
                      d.tools && d.tools.length > 0
                        ? l.createElement(
                            "div",
                            {
                              style: {
                                marginTop: 4,
                                fontSize: 11,
                                color: "#8c8c8c",
                              },
                            },
                            `提供 ${d.tools.length} 个工具`,
                          )
                        : null,
                    ),
                  ),
              }),
        ),
    D =
      p != null && p.tools
        ? l.createElement(
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
                    marginBottom: 8,
                  },
                },
                T
                  ? l.createElement(T, {
                      style: { fontSize: 14, color: "#1677ff" },
                    })
                  : null,
                l.createElement(P, { strong: !0 }, "工具配置"),
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
                    maxHeight: 300,
                  },
                },
                JSON.stringify(p.tools, null, 2),
              ),
            ),
          )
        : l.createElement(x, {
            description: "暂无工具配置",
            image: x.PRESENTED_IMAGE_SIMPLE,
          }),
    O = [
      { key: "basic", label: "基本信息", children: I },
      {
        key: "skills",
        label: `技能 (${B.length})`,
        children: ee,
      },
      {
        key: "prompts",
        label: "推荐提问",
        children: l.createElement(Kn, {
          skills: B,
          agentId: _.id,
        }),
      },
      {
        key: "knowledge",
        label: "专家记忆",
        children: l.createElement(Wt, {
          agentId: _.id,
          systemPromptFiles: (p == null ? void 0 : p.system_prompt_files) || [],
          onRefresh: () => n(),
        }),
      },
      { key: "mcp", label: `MCP (${K.length})`, children: H },
      { key: "tools", label: "工具配置", children: D },
    ];
  return l.createElement(
    r,
    {
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        l.createElement(Be, { name: _.name, size: 28 }),
        l.createElement("span", null, _.name),
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
            icon: k ? l.createElement(k) : void 0,
            onClick: () => {
              a();
              try {
                const d = h();
                d.setSelectedAgent && d.setSelectedAgent(_.id);
              } catch (d) {
                console.warn("[ugsci] Failed to set selected agent:", d);
              }
              setTimeout(() => g("/agents"), 0);
            },
          },
          "编辑专家",
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
                const d = h();
                d.setSelectedAgent && d.setSelectedAgent(_.id);
              } catch (d) {
                console.warn("[ugsci] Failed to set selected agent:", d);
              }
              setTimeout(() => g("/chat"), 0);
            },
          },
          "开始对话",
        ),
      ),
    },
    l.createElement(v, {
      items: O,
      defaultActiveKey: "basic",
    }),
  );
}
function qn({ open: e, onClose: t, onCreated: a }) {
  const n = h().React,
    { useState: l } = n,
    {
      Modal: r,
      Card: o,
      Tag: i,
      Input: y,
      Row: c,
      Col: m,
      Spin: x,
      message: v,
      Typography: f,
    } = h().antd,
    { Text: C } = f,
    { FileAddOutlined: E } = h().antdIcons || {},
    [S, P] = l(!1),
    [G, k] = l(""),
    [V, b] = l(!1),
    T = async (u, w) => {
      P(!0);
      try {
        const z = await te("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: u || "新专家",
            description: w || "",
            skill_names: [],
          }),
        });
        await tt(
          z.id,
          "AGENTS.md",
          `# ${u || "新专家"}

请在此处编写该专家的系统提示词。
`,
        ),
          v.success("专家「" + (u || "新专家") + "」创建成功"),
          b(!1),
          setTimeout(() => {
            t(), a();
          }, 0);
      } catch (z) {
        v.error(z.message || "创建专家失败");
      } finally {
        P(!1);
      }
    },
    $ = ct.filter((u) => {
      if (!G.trim()) return !0;
      const w = G.toLowerCase();
      return (
        u.name.toLowerCase().includes(w) ||
        u.description.toLowerCase().includes(w) ||
        u.category.toLowerCase().includes(w)
      );
    }),
    L = async (u) => {
      P(!0);
      try {
        const w = await te("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: u.name,
            description: u.description,
            skill_names: u.recommendedSkills,
          }),
        });
        await tt(w.id, "AGENTS.md", u.systemPrompt);
        const z = await nt(w.id);
        (z.approval_level = u.approvalLevel),
          await te(`/agents/${encodeURIComponent(w.id)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(z),
          }),
          v.success(`专家「${u.name}」创建成功`),
          t(),
          a();
      } catch (w) {
        v.error(w.message || "创建专家失败");
      } finally {
        P(!1);
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
        keyboard: !0,
      },
      n.createElement(
        "div",
        { style: { marginBottom: 16 } },
        n.createElement(y, {
          placeholder: "搜索模板名称或类别...",
          value: G,
          onChange: (u) => k(u.target.value),
          allowClear: !0,
        }),
      ),
      S
        ? n.createElement(
            "div",
            { style: { textAlign: "center", padding: 60 } },
            n.createElement(x, { size: "large" }),
            n.createElement(
              "div",
              { style: { marginTop: 12, color: "#8c8c8c" } },
              "正在创建专家...",
            ),
          )
        : n.createElement(
            c,
            { gutter: [12, 12] },
            // ── Blank template card (always first) ──
            G.trim()
              ? null
              : n.createElement(
                  m,
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
                        background: "#fafafa",
                      },
                    },
                    n.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          marginBottom: 8,
                        },
                      },
                      n.createElement(
                        "span",
                        { style: { fontSize: 28, color: "#8c8c8c" } },
                        E ? n.createElement(E) : "📝",
                      ),
                      n.createElement(
                        "div",
                        { style: { flex: 1 } },
                        n.createElement(
                          C,
                          { strong: !0, style: { fontSize: 15 } },
                          "从空白模版开始创建",
                        ),
                        n.createElement(
                          "div",
                          null,
                          n.createElement(
                            i,
                            { color: "default", style: { fontSize: 10 } },
                            "空白",
                          ),
                        ),
                      ),
                    ),
                    n.createElement(
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
                ),
            ...$.map((u) =>
              n.createElement(
                m,
                { key: u.id, xs: 24, sm: 12 },
                n.createElement(
                  o,
                  {
                    hoverable: !0,
                    size: "small",
                    onClick: () => L(u),
                    style: { cursor: "pointer", height: "100%" },
                  },
                  n.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        marginBottom: 8,
                      },
                    },
                    n.createElement(Be, {
                      name: u.name,
                      size: 40,
                    }),
                    n.createElement(
                      "div",
                      { style: { flex: 1 } },
                      n.createElement(
                        C,
                        { strong: !0, style: { fontSize: 15 } },
                        u.name,
                      ),
                      n.createElement(
                        "div",
                        null,
                        n.createElement(
                          i,
                          { color: "blue", style: { fontSize: 10 } },
                          u.category,
                        ),
                        u.approvalLevel === "MANUAL"
                          ? n.createElement(
                              i,
                              { color: "orange", style: { fontSize: 10 } },
                              "需审批",
                            )
                          : null,
                      ),
                    ),
                  ),
                  n.createElement(
                    "div",
                    {
                      style: {
                        fontSize: 12,
                        color: "#595959",
                        lineHeight: 1.5,
                      },
                    },
                    yt(u.description, n),
                  ),
                ),
              ),
            ),
          ),
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    n.createElement(Xn, {
      open: V,
      onCancel: () => b(!1),
      onCreate: T,
    }),
  );
}
function Xn({ open: e, onCancel: t, onCreate: a }) {
  const n = h().React,
    { useState: l, useEffect: r } = n,
    { Modal: o, Input: i, message: y } = h().antd,
    [c, m] = l(""),
    [x, v] = l(""),
    [f, C] = l(!1);
  return (
    r(() => {
      e && (m(""), v(""), C(!1));
    }, [e]),
    n.createElement(
      o,
      {
        open: e,
        title: "从空白模版创建专家",
        onCancel: t,
        onOk: () => {
          if (!c.trim()) {
            y.warning("请输入专家名称");
            return;
          }
          C(!0),
            Promise.resolve(a(c.trim(), x.trim())).finally(() => {
              C(!1);
            });
        },
        okText: "创建",
        cancelText: "取消",
        okButtonProps: { loading: f },
        maskClosable: !0,
        keyboard: !0,
      },
      n.createElement(
        "div",
        { style: { marginBottom: 16 } },
        n.createElement(
          "div",
          { style: { fontSize: 13, marginBottom: 6, color: "#595959" } },
          "专家名称",
        ),
        n.createElement(i, {
          placeholder: "输入专家名称",
          value: c,
          onChange: (E) => m(E.target.value),
          maxLength: 50,
        }),
      ),
      n.createElement(
        "div",
        null,
        n.createElement(
          "div",
          { style: { fontSize: 13, marginBottom: 6, color: "#595959" } },
          "专家描述（可选）",
        ),
        n.createElement(i.TextArea, {
          placeholder: "简要描述该专家的职责和能力...",
          value: x,
          onChange: (E) => v(E.target.value),
          rows: 3,
          maxLength: 200,
        }),
      ),
    )
  );
}
function Wt({ agentId: e, systemPromptFiles: t, onRefresh: a }) {
  const n = h().React,
    { useState: l, useEffect: r, useCallback: o } = n,
    {
      List: i,
      Tag: y,
      Switch: c,
      Button: m,
      Modal: x,
      Input: v,
      Spin: f,
      Empty: C,
      message: E,
      Typography: S,
    } = h().antd,
    {
      FileTextOutlined: P,
      PlusOutlined: G,
      EditOutlined: k,
      ReloadOutlined: V,
    } = h().antdIcons || {},
    { Text: b } = S,
    [T, $] = l([]),
    [L, u] = l(!0),
    [w, z] = l(t || []),
    [Z, A] = l(!1),
    [_, p] = l(null),
    [N, K] = l(""),
    [J, B] = l(""),
    [g, I] = l(!1),
    j = o(async () => {
      u(!0);
      try {
        const H = await Sn(e);
        $(H);
      } catch (H) {
        E.error(H.message || "加载记忆文件失败"), $([]);
      } finally {
        u(!1);
      }
    }, [e]);
  r(() => {
    j();
  }, [j]),
    r(() => {
      z(t || []);
    }, [t]);
  const re = async (H, D) => {
      const O = new Set(w);
      if (D) O.add(H);
      else {
        if (xt.includes(H) && H === "AGENTS.md") {
          E.warning("AGENTS.md 是核心文件，不能停用");
          return;
        }
        O.delete(H);
      }
      const d = Array.from(O);
      z(d);
      try {
        await wt(e, d), E.success(D ? "已启用记忆文件" : "已停用记忆文件"), a();
      } catch (Q) {
        E.error(Q.message || "更新失败"), z(t || []);
      }
    },
    q = async (H) => {
      try {
        const D = await te(`/workspace/files/${encodeURIComponent(H)}`, {
          headers: { "X-Agent-Id": e },
        });
        p(H), K(D.content || ""), A(!0);
      } catch (D) {
        E.error(D.message || "读取文件失败");
      }
    },
    le = () => {
      p(null), K(""), B(""), A(!0);
    },
    ee = async () => {
      const H = _ || J.trim();
      if (!H) {
        E.warning("请输入文件名");
        return;
      }
      const D = H.endsWith(".md") ? H : `${H}.md`;
      I(!0);
      try {
        if ((await tt(e, D, N), !_ && !w.includes(D))) {
          const O = [...w, D];
          z(O), await wt(e, O);
        }
        E.success("保存成功"), A(!1), j(), a();
      } catch (O) {
        E.error(O.message || "保存失败");
      } finally {
        I(!1);
      }
    };
  return L
    ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        n.createElement(f, { size: "large" }),
      )
    : n.createElement(
        "div",
        null,
        n.createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            },
          },
          n.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 6 } },
            P
              ? n.createElement(P, {
                  style: { fontSize: 14, color: "#1677ff" },
                })
              : null,
            n.createElement(b, { strong: !0 }, `记忆文件 (${T.length})`),
            n.createElement(
              b,
              { type: "secondary", style: { fontSize: 12 } },
              `· 已挂载 ${w.length} 个到专家记忆`,
            ),
          ),
          n.createElement(
            "div",
            { style: { display: "flex", gap: 8 } },
            n.createElement(
              m,
              {
                size: "small",
                icon: V ? n.createElement(V) : void 0,
                onClick: j,
              },
              "刷新",
            ),
            n.createElement(
              m,
              {
                type: "primary",
                size: "small",
                icon: G ? n.createElement(G) : void 0,
                onClick: le,
              },
              "新建记忆文件",
            ),
          ),
        ),
        T.length === 0
          ? n.createElement(C, {
              description: "暂无记忆文件，点击「新建记忆文件」添加",
              image: C.PRESENTED_IMAGE_SIMPLE,
            })
          : n.createElement(i, {
              dataSource: T,
              renderItem: (H) => {
                const D = w.includes(H.filename),
                  O = xt.includes(H.filename);
                return n.createElement(
                  i.Item,
                  {
                    actions: [
                      n.createElement(
                        m,
                        {
                          type: "link",
                          size: "small",
                          icon: k ? n.createElement(k) : void 0,
                          onClick: () => q(H.filename),
                        },
                        "编辑",
                      ),
                    ],
                  },
                  n.createElement(i.Item.Meta, {
                    avatar: n.createElement(P, {
                      style: {
                        fontSize: 20,
                        color: D ? "#1677ff" : "#bfbfbf",
                      },
                    }),
                    title: n.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        },
                      },
                      n.createElement(b, null, H.filename),
                      O
                        ? n.createElement(
                            y,
                            { color: "default", style: { fontSize: 10 } },
                            "内置",
                          )
                        : n.createElement(
                            y,
                            { color: "cyan", style: { fontSize: 10 } },
                            "记忆库",
                          ),
                    ),
                    description: n.createElement(
                      "div",
                      { style: { fontSize: 12 } },
                      `${(H.size / 1024).toFixed(1)} KB · 修改于 ${new Date(
                        H.modified_time,
                      ).toLocaleString()}`,
                    ),
                  }),
                  n.createElement(c, {
                    checked: D,
                    size: "small",
                    onChange: (d) => re(H.filename, d),
                  }),
                );
              },
            }),
        // Edit/New file modal
        n.createElement(
          x,
          {
            open: Z,
            onCancel: () => A(!1),
            title: _ ? `编辑 ${_}` : "新建记忆文件",
            width: 700,
            onOk: ee,
            confirmLoading: g,
            okText: "保存",
          },
          _
            ? null
            : n.createElement(
                "div",
                { style: { marginBottom: 12 } },
                n.createElement(v, {
                  placeholder: "文件名（如：油藏工程记忆库.md）",
                  value: J,
                  onChange: (H) => B(H.target.value),
                  addonAfter: J.endsWith(".md") ? "" : ".md",
                }),
              ),
          n.createElement(v.TextArea, {
            value: N,
            onChange: (H) => K(H.target.value),
            rows: 12,
            placeholder: `输入记忆内容（支持 Markdown 格式）...

例如：
# 某区块油藏基础参数

- 地层压力: 25 MPa
- 地层温度: 85°C
- 原油密度: 0.85 g/cm³`,
            style: { fontFamily: "monospace", fontSize: 13 },
          }),
        ),
      );
}
function Kn({ skills: e, agentId: t }) {
  const a = h().React,
    { useMemo: n } = a,
    {
      List: l,
      Tag: r,
      Typography: o,
      Empty: i,
      Button: y,
      message: c,
    } = h().antd,
    { ThunderboltOutlined: m, CopyOutlined: x } = h().antdIcons || {},
    { Text: v } = o,
    f = n(() => Lt(e), [e]),
    C = (S) => {
      try {
        const P = h();
        P.setSelectedAgent && P.setSelectedAgent(t);
      } catch {}
      try {
        sessionStorage.setItem("ugsci_pending_prompt", S.value);
      } catch {}
      window.history.pushState({}, "", "/chat"),
        window.dispatchEvent(new PopStateEvent("popstate"));
    },
    E = (S) => {
      var P;
      (P = navigator.clipboard) == null ||
        P.writeText(S.value).then(() => {
          c.success("已复制到剪贴板");
        });
    };
  return f.length === 0
    ? a.createElement(i, {
        description: "暂无推荐提问，请先为专家添加技能",
        image: i.PRESENTED_IMAGE_SIMPLE,
      })
    : a.createElement(
        "div",
        null,
        a.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 12,
            },
          },
          m
            ? a.createElement(m, {
                style: { fontSize: 14, color: "#1677ff" },
              })
            : null,
          a.createElement(v, { strong: !0 }, `推荐提问 (${f.length})`),
          a.createElement(
            v,
            { type: "secondary", style: { fontSize: 12 } },
            "· 从技能描述中自动提取",
          ),
        ),
        a.createElement(l, {
          dataSource: f,
          renderItem: (S, P) =>
            a.createElement(
              l.Item,
              {
                actions: [
                  a.createElement(
                    y,
                    {
                      type: "link",
                      size: "small",
                      icon: x ? a.createElement(x) : void 0,
                      onClick: () => E(S),
                    },
                    "复制",
                  ),
                ],
              },
              a.createElement(l.Item.Meta, {
                avatar: a.createElement(
                  r,
                  { color: "blue", style: { borderRadius: "50%" } },
                  `${P + 1}`,
                ),
                title: a.createElement(
                  "div",
                  {
                    style: {
                      cursor: "pointer",
                      color: "#1677ff",
                    },
                    onClick: () => C(S),
                  },
                  S.value,
                ),
                description: a.createElement(
                  v,
                  { type: "secondary", style: { fontSize: 12 } },
                  S.label,
                ),
              }),
            ),
        }),
      );
}
function Vn() {
  var Te;
  const e = h().React,
    { useState: t, useEffect: a, useCallback: n, useMemo: l } = e,
    {
      Spin: r,
      Empty: o,
      Input: i,
      Button: y,
      message: c,
      Row: m,
      Col: x,
      Tabs: v,
      Modal: f,
      Typography: C,
    } = h().antd,
    {
      ReloadOutlined: E,
      PlusOutlined: S,
      SearchOutlined: P,
      TeamOutlined: G,
      UserOutlined: k,
    } = h().antdIcons || {},
    { Text: V, Paragraph: b } = C,
    [T, $] = t([]),
    [L, u] = t(!0),
    [w, z] = t(!1),
    [Z, A] = t(null),
    [_, p] = t(""),
    [N, K] = t(!1),
    [J, B] = t("experts"),
    [g, I] = t(null),
    [j, re] = t(""),
    [q, le] = t(!1),
    [ee, H] = t(!1),
    [D, O] = t(null),
    [d, Q] = t([]),
    se = n(async () => {
      u(!0);
      try {
        const M = await pt(),
          ie = await Promise.all(
            M.map(async (ge) => {
              try {
                const [xe, Se, Ce] = await Promise.all([
                  nt(ge.id).catch(() => null),
                  lt(ge.id).catch(() => []),
                  ft(ge.id).catch(() => []),
                ]);
                return {
                  agent: ge,
                  config: xe,
                  skills: Se,
                  mcps: Ce,
                  loading: !1,
                };
              } catch {
                return {
                  agent: ge,
                  config: null,
                  skills: [],
                  mcps: [],
                  loading: !1,
                };
              }
            }),
          );
        $(ie), Q(M);
      } catch (M) {
        c.error(M.message || "加载专家列表失败"), $([]);
      } finally {
        u(!1);
      }
    }, []);
  a(() => {
    se();
  }, [se]),
    a(() => {
      if (D && ee) {
        const M = T.find((ie) => ie.agent.id === D.agent.id);
        M && M !== D && O(M);
      }
    }, [T, D, ee]);
  const he = n(
      async (M) => {
        var Se;
        const ie =
          M.coordinatorName || ((Se = M.members[0]) == null ? void 0 : Se.name);
        if (!ie) {
          c.error("无法确定协调者专家");
          return;
        }
        const ge = et(d, ie);
        if (!ge) {
          c.error(`未找到协调者专家「${ie}」，请先创建该专家`);
          return;
        }
        if (/\{.+?\}/.test(M.taskTemplate)) {
          re(""), I(M);
          return;
        }
        await X(M, ge, M.taskTemplate);
      },
      [d, c],
    ),
    X = n(
      async (M, ie, ge) => {
        var xe;
        le(!0);
        try {
          const Se = En(M),
            Ce = ge ? Se.replace(M.taskTemplate, ge) : Se,
            $e = h();
          $e.setSelectedAgent && $e.setSelectedAgent(ie),
            await fn(ie, Ce),
            c.success(
              `团队任务已发起，协调者：${
                M.coordinatorName ||
                ((xe = M.members[0]) == null ? void 0 : xe.name)
              }`,
            ),
            I(null),
            me("/chat");
        } catch (Se) {
          c.error(Se.message || "发起团队任务失败");
        } finally {
          le(!1);
        }
      },
      [c],
    ),
    me = (M) => {
      window.history.pushState({}, "", M),
        window.dispatchEvent(new PopStateEvent("popstate"));
    },
    U = n((M) => {
      A(M), z(!0);
    }, []),
    ae = n((M) => {
      O(M), H(!0);
    }, []),
    oe = n(
      (M) => {
        if (!M.agent.enabled) {
          c.warning(`专家「${M.agent.name}」未启用，请先启用`);
          return;
        }
        try {
          const ie = h();
          ie.setSelectedAgent && ie.setSelectedAgent(M.agent.id);
        } catch (ie) {
          console.warn("[ugsci] Failed to set selected agent:", ie);
        }
        c.success(`已召唤专家「${M.agent.name}」，正在跳转至对话...`),
          me("/chat");
      },
      [c],
    ),
    ne = l(() => {
      if (!_.trim()) return T;
      const M = _.toLowerCase();
      return T.filter((ie) => {
        var ge;
        return (
          ie.agent.name.toLowerCase().includes(M) ||
          ((ge = ie.agent.description) == null
            ? void 0
            : ge.toLowerCase().includes(M)) ||
          ie.agent.id.toLowerCase().includes(M) ||
          ie.skills.some((xe) => xe.name.toLowerCase().includes(M))
        );
      });
    }, [T, _]),
    W = T.filter((M) => M.agent.enabled).length,
    pe = T.reduce(
      (M, ie) => M + ie.skills.filter((ge) => ge.enabled !== !1).length,
      0,
    ),
    de = T.reduce((M, ie) => M + ie.mcps.length, 0),
    ze = [
      {
        key: "experts",
        label: e.createElement(
          "span",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          k ? e.createElement(k, { style: { fontSize: 14 } }) : null,
          "专家列表",
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
              value: _,
              onChange: (M) => p(M.target.value),
              allowClear: !0,
              style: { maxWidth: 400 },
            }),
          ),
          // Content
          L
            ? e.createElement(
                "div",
                { style: { textAlign: "center", padding: 60 } },
                e.createElement(r, { size: "large" }),
              )
            : ne.length === 0
            ? e.createElement(o, {
                description: _
                  ? "未找到匹配的专家"
                  : "暂无专家，点击「创建专家」添加",
              })
            : e.createElement(
                m,
                { gutter: [12, 12], align: "stretch" },
                ...ne.map((M) =>
                  e.createElement(
                    x,
                    {
                      key: M.agent.id,
                      xs: 24,
                      sm: 12,
                      md: 8,
                      lg: 6,
                      style: { display: "flex" },
                    },
                    e.createElement(Wn, {
                      expert: M,
                      onClick: () => U(M),
                      onSummon: () => oe(M),
                      onConfigure: () => ae(M),
                    }),
                  ),
                ),
              ),
        ),
      },
      {
        key: "teams",
        label: e.createElement(
          "span",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          G ? e.createElement(G, { style: { fontSize: 14 } }) : null,
          "专家团",
        ),
        children: e.createElement(bn, {
          agents: d,
          onLaunch: he,
        }),
      },
    ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(at, {
      title: "专家",
      subtitle: `共 ${T.length} 位专家（${W} 位启用）· ${pe} 个技能 · ${de} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          y,
          {
            icon: E ? e.createElement(E) : void 0,
            onClick: se,
            loading: L,
          },
          "刷新",
        ),
        e.createElement(
          y,
          {
            type: "primary",
            icon: S ? e.createElement(S) : void 0,
            onClick: () => K(!0),
            style: Me,
          },
          "创建专家",
        ),
      ),
    }),
    e.createElement(v, {
      items: ze,
      activeKey: J,
      onChange: (M) => B(M),
    }),
    // Drawer
    e.createElement(Jn, {
      expert: Z,
      open: w,
      onClose: () => z(!1),
      onRefresh: () => se(),
    }),
    // Template Modal
    e.createElement(qn, {
      open: N,
      onClose: () => K(!1),
      onCreated: () => se(),
    }),
    // Config Modal (gear icon)
    e.createElement(Hn, {
      expert: D,
      open: ee,
      onClose: () => H(!1),
      onRefresh: () => se(),
    }),
    // Team Launch Modal (for filling placeholders)
    g
      ? e.createElement(
          f,
          {
            open: !0,
            title: e.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              e.createElement(Et, {
                members: g.members.map((M) => M.name),
                size: 28,
              }),
              e.createElement("span", null, `发起团队任务 - ${g.name}`),
            ),
            onCancel: () => I(null),
            onOk: () => {
              var xe;
              const M =
                  g.coordinatorName ||
                  ((xe = g.members[0]) == null ? void 0 : xe.name),
                ie = M ? et(d, M) : null;
              if (!ie) {
                c.error("无法找到协调者专家");
                return;
              }
              let ge = g.taskTemplate;
              j.trim() && (ge = j.trim()), X(g, ie, ge);
            },
            confirmLoading: q,
            okText: "发起任务",
            width: 600,
          },
          e.createElement(
            "div",
            { style: { marginBottom: 12 } },
            e.createElement(
              V,
              {
                type: "secondary",
                style: { fontSize: 12, display: "block", marginBottom: 8 },
              },
              "任务模板（包含占位符 {参数名}，可在下方编辑替换）：",
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
                  lineHeight: 1.6,
                },
              },
              g.taskTemplate,
            ),
          ),
          e.createElement(
            "div",
            null,
            e.createElement(
              V,
              {
                type: "secondary",
                style: { fontSize: 12, display: "block", marginBottom: 8 },
              },
              "输入具体任务描述（替换上面的占位符内容）：",
            ),
            e.createElement(i.TextArea, {
              value: j,
              onChange: (M) => re(M.target.value),
              rows: 5,
              placeholder: g.taskTemplate,
              style: { fontSize: 13 },
            }),
          ),
          e.createElement(
            "div",
            {
              style: {
                marginTop: 12,
                padding: "8px 12px",
                background: "#e6f4ff",
                borderRadius: 6,
              },
            },
            e.createElement(
              V,
              { style: { fontSize: 12, color: "#0958d9" } },
              `协调者: ${
                g.coordinatorName ||
                ((Te = g.members[0]) == null ? void 0 : Te.name) ||
                "—"
              } · 成员: ${g.members.map((M) => M.name).join("、")}`,
            ),
          ),
        )
      : null,
  );
}
function Yn({ mcp: e, onClick: t, onToggle: a, onDelete: n, onViewTools: l }) {
  const r = h().React,
    { Card: o, Tag: i, Badge: y, Typography: c, Button: m } = h().antd,
    { Text: x } = c,
    {
      EyeOutlined: v,
      EyeInvisibleOutlined: f,
      DeleteOutlined: C,
      ToolOutlined: E,
    } = h().antdIcons || {},
    S = {
      stdio: "💻",
      streamable_http: "🌐",
      sse: "📡",
    };
  return (
    e.transport === "streamable_http" || e.transport,
    r.createElement(
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
          flexDirection: "column",
        },
        bodyStyle: {
          display: "flex",
          flexDirection: "column",
          height: "100%",
          flex: 1,
        },
      },
      r.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 8,
          },
        },
        r.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          r.createElement(
            "span",
            { style: { fontSize: 18 } },
            S[e.transport] || "🔌",
          ),
          r.createElement(
            x,
            { strong: !0, style: { fontSize: 14 } },
            e.name || e.key,
          ),
        ),
        r.createElement(y, {
          status: e.enabled ? "success" : "default",
          text: e.enabled ? "启用" : "停用",
        }),
      ),
      e.description
        ? r.createElement(
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
            e.description,
          )
        : r.createElement(
            "div",
            {
              style: {
                fontSize: 12,
                color: "#bfbfbf",
                marginBottom: 8,
                minHeight: 36,
                flex: "1 0 auto",
              },
            },
            "暂无描述",
          ),
      r.createElement(
        "div",
        {
          style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 },
        },
        r.createElement(
          i,
          { color: "purple", style: { fontSize: 11 } },
          e.transport,
        ),
        e.tools && e.tools.length > 0
          ? r.createElement(
              i,
              { color: "blue", style: { fontSize: 11 } },
              `${e.tools.length} 个工具`,
            )
          : r.createElement(i, { style: { fontSize: 11 } }, "全部工具"),
        e.url
          ? r.createElement(
              i,
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
              e.url,
            )
          : null,
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
            borderTop: "1px solid #f0f0f0",
          },
        },
        r.createElement(
          m,
          {
            size: "small",
            icon: E ? r.createElement(E) : void 0,
            onClick: l,
          },
          "工具",
        ),
        r.createElement(
          m,
          {
            size: "small",
            icon: e.enabled
              ? f
                ? r.createElement(f)
                : void 0
              : v
              ? r.createElement(v)
              : void 0,
            onClick: a,
          },
          e.enabled ? "禁用" : "启用",
        ),
        r.createElement(
          m,
          {
            size: "small",
            danger: !0,
            icon: C ? r.createElement(C) : void 0,
            onClick: n,
          },
          "删除",
        ),
      ),
    )
  );
}
const mt = {
    reservoir_simulation: "油藏数值模拟",
    geological_modeling: "地质建模",
    well_log_analysis: "测井分析",
    production_engineering: "采油工程",
    post_processing: "后处理与可视化",
    multiphysics: "多物理场仿真",
  },
  Jt = {
    reservoir_simulation: "🛢️",
    geological_modeling: "🏔️",
    well_log_analysis: "📡",
    production_engineering: "⚙️",
    post_processing: "📊",
    multiphysics: "🔬",
  },
  qt = /* @__PURE__ */ new Set([
    "cmg",
    "comsol",
    "tnavigator",
    "eclipse",
    "intersect",
    "visage",
  ]);
function Xt(e) {
  return Ye(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
function kt(e) {
  return Ye(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function Tt(e) {
  const t = e.map(encodeURIComponent).join(",");
  return Ye(`/ugsci/avatar/team/${t}`);
}
function Be({ name: e, size: t = 32, borderRadius: a = "50%" }) {
  const n = h().React,
    [l, r] = n.useState(0),
    o = l === 0 ? kt(e) : `${kt(e)}?_r=${l}`;
  return n.createElement("img", {
    src: o,
    alt: e,
    onError: () => {
      l < 1 && r(l + 1);
    },
    style: {
      width: t,
      height: t,
      borderRadius: a,
      objectFit: "cover",
      flexShrink: 0,
    },
  });
}
function Et({ members: e, size: t = 32, borderRadius: a = "50%" }) {
  const n = h().React,
    [l, r] = n.useState(0);
  if (!e || e.length === 0)
    return n.createElement("span", {
      style: { width: t, height: t, display: "inline-block" },
    });
  const o = e.slice(0, 5),
    i = l === 0 ? Tt(o) : `${Tt(o)}?_r=${l}`;
  return n.createElement("img", {
    src: i,
    alt: "team",
    onError: () => {
      l < 1 && r(l + 1);
    },
    style: {
      width: t,
      height: t,
      borderRadius: a,
      objectFit: "cover",
      flexShrink: 0,
    },
  });
}
async function Qn() {
  return te("/ugsci/engines/list");
}
async function Zn(e) {
  return te("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e),
  });
}
async function el(e, t) {
  return te(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t),
  });
}
async function tl(e) {
  return te(`/ugsci/engines/${encodeURIComponent(e)}`, { method: "DELETE" });
}
async function nl() {
  return te("/ugsci/engines/detect", {
    method: "POST",
  });
}
function ll({ engine: e, onClick: t }) {
  const a = h().React,
    { Card: n, Tag: l, Typography: r } = h().antd,
    { Text: o } = r,
    i = e.status === "detected",
    y = Jt[e.category] || "📦",
    m = qt.has(e.id)
      ? a.createElement("img", {
          src: Xt(e.id),
          alt: e.name,
          style: { width: 24, height: 24, objectFit: "contain" },
        })
      : a.createElement("span", { style: { fontSize: 20 } }, y);
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
        flexDirection: "column",
      },
      bodyStyle: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flex: 1,
      },
    },
    a.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        },
      },
      a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        m,
        a.createElement(
          "div",
          null,
          a.createElement(o, { strong: !0, style: { fontSize: 14 } }, e.name),
          a.createElement("br"),
          a.createElement(
            o,
            { type: "secondary", style: { fontSize: 11 } },
            e.vendor || "—",
          ),
        ),
      ),
      a.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: 4,
            alignItems: "flex-end",
          },
        },
        i
          ? a.createElement(
              l,
              { color: "success", style: { fontSize: 11 } },
              "✅ 已检测",
            )
          : e.executable_path
          ? a.createElement(
              l,
              { color: "warning", style: { fontSize: 11 } },
              "⚠ 路径无效",
            )
          : a.createElement(l, { style: { fontSize: 11 } }, "🔧 待配置"),
        e.is_default
          ? a.createElement(
              l,
              { color: "blue", style: { fontSize: 10 } },
              "默认",
            )
          : e.is_custom
          ? a.createElement(
              l,
              { color: "purple", style: { fontSize: 10 } },
              "自定义",
            )
          : null,
      ),
    ),
    a.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      a.createElement(
        o,
        { type: "secondary", style: { fontSize: 12 } },
        e.description || "暂无描述",
      ),
    ),
    a.createElement(
      "div",
      {
        style: {
          marginTop: 8,
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
        },
      },
      e.category
        ? a.createElement(
            l,
            { style: { fontSize: 11 } },
            mt[e.category] || e.category,
          )
        : null,
      e.version
        ? a.createElement(
            l,
            { color: "blue", style: { fontSize: 11 } },
            `v${e.version}`,
          )
        : null,
      ...(e.modules || []).map((x) =>
        a.createElement(
          l,
          { key: x, color: "cyan", style: { fontSize: 10 } },
          x,
        ),
      ),
    ),
  );
}
function al() {
  const e = h().React,
    { useState: t, useEffect: a, useCallback: n, useMemo: l } = e,
    {
      Spin: r,
      Empty: o,
      Button: i,
      message: y,
      Row: c,
      Col: m,
      Drawer: x,
      Descriptions: v,
      Tag: f,
      Typography: C,
      Modal: E,
      Input: S,
      Select: P,
      Popconfirm: G,
      Space: k,
    } = h().antd,
    {
      ReloadOutlined: V,
      SearchOutlined: b,
      PlusOutlined: T,
      EditOutlined: $,
      DeleteOutlined: L,
      CopyOutlined: u,
      ExperimentOutlined: w,
    } = h().antdIcons || {},
    { Text: z, Paragraph: Z } = C,
    [A, _] = t([]),
    [p, N] = t(!0),
    [K, J] = t(""),
    [B, g] = t(!1),
    [I, j] = t(null),
    [re, q] = t(!1),
    [le, ee] = t(null),
    [H, D] = t({}),
    [O, d] = t(!1),
    Q = n(async () => {
      N(!0);
      try {
        const W = await Qn();
        _(W.engines || []);
      } catch (W) {
        y.error(W.message || "加载引擎列表失败"), _([]);
      } finally {
        N(!1);
      }
    }, []);
  a(() => {
    Q();
  }, [Q]);
  const se = l(() => {
    if (!K.trim()) return A;
    const W = K.toLowerCase();
    return A.filter((pe) => {
      var de;
      return (
        pe.name.toLowerCase().includes(W) ||
        pe.vendor.toLowerCase().includes(W) ||
        pe.category.toLowerCase().includes(W) ||
        ((de = pe.description) == null ? void 0 : de.toLowerCase().includes(W))
      );
    });
  }, [A, K]);
  A.filter((W) => W.status === "detected").length;
  const he = n((W) => {
      navigator.clipboard
        .writeText(W)
        .then(() => y.success("路径已复制"))
        .catch(() => y.error("复制失败"));
    }, []),
    X = n(() => {
      ee(null),
        D({
          name: "",
          vendor: "",
          version: "",
          executable_path: "",
          category: "",
          description: "",
          invocation_hint: "",
        }),
        q(!0);
    }, []),
    me = n((W) => {
      ee(W), D({ ...W }), q(!0), g(!1);
    }, []),
    U = n(async () => {
      var W;
      if (!((W = H.name) != null && W.trim())) {
        y.warning("请输入引擎名称");
        return;
      }
      d(!0);
      try {
        le
          ? (await el(le.id, H), y.success("引擎已更新"))
          : (await Zn(H), y.success("引擎已添加")),
          q(!1),
          Q();
      } catch (pe) {
        y.error(pe.message || "保存失败");
      } finally {
        d(!1);
      }
    }, [H, le, Q]),
    ae = n(
      async (W) => {
        try {
          await tl(W), y.success("引擎已删除"), g(!1), Q();
        } catch (pe) {
          y.error(pe.message || "删除失败");
        }
      },
      [Q],
    ),
    oe = n(async () => {
      N(!0);
      try {
        const W = await nl();
        _(W.engines || []), y.success("自动检测完成");
      } catch (W) {
        y.error(W.message || "检测失败");
      } finally {
        N(!1);
      }
    }, []),
    ne = n(
      (W, pe, de) => {
        const ze = H[pe] || "";
        return e.createElement(
          "div",
          { style: { marginBottom: 12 } },
          e.createElement(
            z,
            { style: { fontSize: 13, display: "block", marginBottom: 4 } },
            W,
          ),
          de != null && de.select
            ? e.createElement(P, {
                value: ze || void 0,
                onChange: (Te) => D((M) => ({ ...M, [pe]: Te })),
                style: { width: "100%" },
                options: de.select.options,
                allowClear: !0,
                placeholder: `选择${W}`,
              })
            : de != null && de.textarea
            ? e.createElement(S.TextArea, {
                value: ze,
                onChange: (Te) => D((M) => ({ ...M, [pe]: Te.target.value })),
                rows: 3,
                placeholder: `输入${W}`,
              })
            : e.createElement(S, {
                value: ze,
                onChange: (Te) => D((M) => ({ ...M, [pe]: Te.target.value })),
                placeholder: `输入${W}`,
              }),
        );
      },
      [H],
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
          flexWrap: "wrap",
        },
      },
      e.createElement(S, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: b ? e.createElement(b) : void 0,
        value: K,
        onChange: (W) => J(W.target.value),
        allowClear: !0,
        style: { maxWidth: 280 },
      }),
      e.createElement(
        i,
        {
          icon: V ? e.createElement(V) : void 0,
          onClick: oe,
          loading: p,
        },
        "自动检测",
      ),
      e.createElement(
        i,
        {
          type: "primary",
          icon: T ? e.createElement(T) : void 0,
          onClick: X,
          style: Me,
        },
        "添加引擎",
      ),
    ),
    // Content
    p
      ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(r, {
            size: "large",
            tip: "正在加载计算引擎...",
          }),
        )
      : se.length === 0
      ? e.createElement(o, {
          description: K ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始",
        })
      : e.createElement(
          c,
          { gutter: [12, 12], align: "stretch" },
          ...se.map((W) =>
            e.createElement(
              m,
              {
                key: W.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" },
              },
              e.createElement(ll, {
                engine: W,
                onClick: () => {
                  j(W), g(!0);
                },
              }),
            ),
          ),
        ),
    // Detail drawer
    I
      ? e.createElement(
          x,
          {
            title: e.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              e.createElement(
                "span",
                { style: { display: "flex", alignItems: "center" } },
                qt.has(I.id)
                  ? e.createElement("img", {
                      src: Xt(I.id),
                      alt: I.name,
                      style: { width: 20, height: 20, objectFit: "contain" },
                    })
                  : e.createElement(
                      "span",
                      { style: { fontSize: 18 } },
                      Jt[I.category] || "📦",
                    ),
              ),
              e.createElement("span", null, I.name),
            ),
            open: B,
            onClose: () => g(!1),
            width: 520,
            extra: e.createElement(
              k,
              null,
              e.createElement(
                i,
                {
                  size: "small",
                  icon: $ ? e.createElement($) : void 0,
                  onClick: () => me(I),
                },
                "编辑",
              ),
              I.is_default
                ? null
                : e.createElement(
                    G,
                    {
                      title: "确认删除此引擎？",
                      description: I.name,
                      onConfirm: () => ae(I.id),
                      okText: "删除",
                      cancelText: "取消",
                      okButtonProps: { danger: !0 },
                    },
                    e.createElement(
                      i,
                      {
                        size: "small",
                        danger: !0,
                        icon: L ? e.createElement(L) : void 0,
                      },
                      "删除",
                    ),
                  ),
            ),
          },
          e.createElement(
            v,
            { column: 1, bordered: !0, size: "small" },
            e.createElement(v.Item, { label: "引擎名称" }, I.name),
            e.createElement(v.Item, { label: "厂商" }, I.vendor || "—"),
            e.createElement(
              v.Item,
              { label: "分类" },
              I.category ? mt[I.category] || I.category : "—",
            ),
            e.createElement(
              v.Item,
              { label: "状态" },
              e.createElement(
                f,
                {
                  color:
                    I.status === "detected"
                      ? "success"
                      : I.status === "not_found"
                      ? "error"
                      : "default",
                },
                I.status === "detected"
                  ? "✅ 已检测"
                  : I.status === "not_found"
                  ? "❌ 路径无效"
                  : "🔧 待配置",
              ),
            ),
            e.createElement(v.Item, { label: "版本" }, I.version || "—"),
            I.executable_path
              ? e.createElement(
                  v.Item,
                  { label: "可执行文件" },
                  e.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      },
                    },
                    e.createElement(
                      "code",
                      {
                        style: {
                          fontSize: 12,
                          wordBreak: "break-all",
                        },
                      },
                      I.executable_path,
                    ),
                    e.createElement(i, {
                      size: "small",
                      type: "text",
                      icon: u ? e.createElement(u) : void 0,
                      onClick: () => he(I.executable_path),
                    }),
                  ),
                )
              : null,
            I.install_dir
              ? e.createElement(
                  v.Item,
                  { label: "安装目录" },
                  e.createElement(
                    "code",
                    { style: { fontSize: 12, wordBreak: "break-all" } },
                    I.install_dir,
                  ),
                )
              : null,
            // Display detected modules with paths
            I.modules && I.modules.length > 0
              ? e.createElement(
                  v.Item,
                  { label: "已检测模块" },
                  e.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      },
                    },
                    ...I.modules.map((W) =>
                      e.createElement(
                        "div",
                        {
                          key: W,
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          },
                        },
                        e.createElement(
                          f,
                          { color: "cyan", style: { fontSize: 11 } },
                          W,
                        ),
                        I.module_paths && I.module_paths[W]
                          ? e.createElement(
                              "code",
                              {
                                style: { fontSize: 11, wordBreak: "break-all" },
                              },
                              I.module_paths[W],
                            )
                          : null,
                      ),
                    ),
                  ),
                )
              : null,
            I.license_server
              ? e.createElement(
                  v.Item,
                  { label: "许可证服务器" },
                  I.license_server,
                )
              : null,
            e.createElement(v.Item, { label: "描述" }, I.description || "—"),
          ),
          // Invocation hint
          I.invocation_hint
            ? e.createElement(
                "div",
                {
                  style: {
                    marginTop: 16,
                    padding: 12,
                    background: "#e6f4ff",
                    borderRadius: 8,
                  },
                },
                e.createElement(
                  z,
                  { strong: !0, style: { fontSize: 13 } },
                  "💡 调用方式",
                ),
                e.createElement(
                  "div",
                  { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
                  I.invocation_hint,
                ),
              )
            : null,
          // Type badge
          e.createElement(
            "div",
            { style: { marginTop: 12 } },
            I.is_default
              ? e.createElement(f, { color: "blue" }, "默认引擎")
              : I.is_custom
              ? e.createElement(f, { color: "purple" }, "自定义引擎")
              : null,
          ),
        )
      : null,
    // Add/Edit modal
    e.createElement(
      E,
      {
        title: le ? "编辑引擎" : "添加计算引擎",
        open: re,
        onOk: U,
        onCancel: () => q(!1),
        okText: le ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: O,
        width: 560,
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
            options: Object.entries(mt).map(([W, pe]) => ({
              label: pe,
              value: W,
            })),
          },
        }),
        ne("描述", "description", { textarea: !0 }),
        ne("调用方式提示", "invocation_hint", { textarea: !0 }),
        ne("许可证服务器", "license_server"),
      ),
    ),
  );
}
function rl() {
  const e = h().React,
    { useState: t, useEffect: a, useCallback: n, useMemo: l } = e,
    {
      Spin: r,
      Empty: o,
      Input: i,
      Button: y,
      message: c,
      Row: m,
      Col: x,
      Drawer: v,
      Descriptions: f,
      Tag: C,
      Typography: E,
      List: S,
      Tabs: P,
      Modal: G,
    } = h().antd,
    {
      ReloadOutlined: k,
      PlusOutlined: V,
      SearchOutlined: b,
      ApiOutlined: T,
      RocketOutlined: $,
      ToolOutlined: L,
      DeleteOutlined: u,
      EyeOutlined: w,
      EyeInvisibleOutlined: z,
    } = h().antdIcons || {},
    { Text: Z } = E,
    { TextArea: A } = i,
    p = h().useSelectedAgent,
    N = p ? p() : null,
    K = (N == null ? void 0 : N.id) || "default",
    [J, B] = t([]),
    [g, I] = t(!0),
    [j, re] = t(""),
    [q, le] = t(!1),
    [ee, H] = t(null),
    [D, O] = t("mcp"),
    [d, Q] = t(!1),
    [se, he] = t(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`),
    [X, me] = t(!1),
    [U, ae] = t(!1),
    [oe, ne] = t(null),
    [W, pe] = t(!1),
    [de, ze] = t(null),
    [Te, M] = t([]),
    [ie, ge] = t(!1),
    [xe, Se] = t(""),
    Ce = n(async () => {
      I(!0);
      try {
        const Y = await mn(K);
        B(Y);
      } catch (Y) {
        c.error(Y.message || "加载 MCP 列表失败"), B([]);
      } finally {
        I(!1);
      }
    }, [K]);
  a(() => {
    Ce();
  }, [Ce]);
  const $e = n(
      async (Y) => {
        try {
          await dn(K, Y.key), c.success(Y.enabled ? "已禁用" : "已启用"), Ce();
        } catch (ce) {
          c.error(ce.message || "切换状态失败");
        }
      },
      [K, Ce],
    ),
    Ue = n(async () => {
      if (oe)
        try {
          await un(K, oe.key),
            c.success(`MCP「${oe.key}」已删除`),
            ae(!1),
            ne(null),
            Ce();
        } catch (Y) {
          c.error(Y.message || "删除失败");
        }
    }, [K, oe, Ce]),
    Oe = n(async () => {
      me(!0);
      try {
        const Y = JSON.parse(se),
          ce = Y.mcpServers || Y,
          R = Object.entries(ce);
        if (R.length === 0) {
          c.warning("未找到 MCP 客户端配置");
          return;
        }
        let ke = !0;
        for (const [we, be] of R) {
          const Ie = be,
            Re = Ie.url ? "streamable_http" : "stdio",
            ye = {
              name: Ie.name || we,
              description: Ie.description || "",
              enabled: !0,
              transport: Re,
              url: Ie.url || "",
              command: Ie.command || "",
              args: Ie.args || [],
              env: Ie.env || {},
              cwd: Ie.cwd || "",
              headers: Ie.headers || {},
            };
          try {
            await pn(K, we, ye);
          } catch {
            ke = !1;
          }
        }
        ke && (c.success("MCP 客户端已创建"), Q(!1), Ce());
      } catch (Y) {
        Y instanceof SyntaxError
          ? c.error("JSON 格式错误：" + Y.message)
          : c.error(Y.message || "创建 MCP 失败");
      } finally {
        me(!1);
      }
    }, [se, K, Ce]),
    Fe = n(
      async (Y) => {
        ze(Y), pe(!0), M([]), Se(""), ge(!0);
        try {
          const ce = await gn(K, Y.key);
          M(ce);
        } catch (ce) {
          Se(ce.message || "无法加载工具列表（MCP 服务可能未运行）");
        } finally {
          ge(!1);
        }
      },
      [K],
    ),
    Ge = l(() => {
      if (!j.trim()) return J;
      const Y = j.toLowerCase();
      return J.filter((ce) => {
        var R;
        return (
          ce.name.toLowerCase().includes(Y) ||
          ce.key.toLowerCase().includes(Y) ||
          ((R = ce.description) == null
            ? void 0
            : R.toLowerCase().includes(Y)) ||
          ce.transport.toLowerCase().includes(Y)
        );
      });
    }, [J, j]),
    je = J.filter((Y) => Y.enabled).length,
    Le = J.reduce((Y, ce) => {
      var R;
      return Y + (((R = ce.tools) == null ? void 0 : R.length) || 0);
    }, 0),
    De = e.createElement(
      e.Fragment,
      null,
      e.createElement(
        "div",
        {
          style: {
            marginBottom: 16,
            display: "flex",
            gap: 8,
            alignItems: "center",
          },
        },
        e.createElement(i, {
          placeholder: "搜索能力名称、描述...",
          prefix: b ? e.createElement(b) : void 0,
          value: j,
          onChange: (Y) => re(Y.target.value),
          allowClear: !0,
          style: { maxWidth: 400 },
        }),
        e.createElement(
          y,
          {
            type: "primary",
            icon: V ? e.createElement(V) : void 0,
            onClick: () => Q(!0),
            style: Me,
          },
          "添加 MCP",
        ),
      ),
      g
        ? e.createElement(
            "div",
            { style: { textAlign: "center", padding: 60 } },
            e.createElement(r, { size: "large" }),
          )
        : Ge.length === 0
        ? e.createElement(o, {
            description: j
              ? "未找到匹配的能力"
              : "暂无 MCP 客户端，点击「添加 MCP」创建",
          })
        : e.createElement(
            m,
            { gutter: [12, 12], align: "stretch" },
            ...Ge.map((Y) =>
              e.createElement(
                x,
                {
                  key: Y.key,
                  xs: 24,
                  sm: 12,
                  md: 8,
                  lg: 6,
                  style: { display: "flex" },
                },
                e.createElement(Yn, {
                  mcp: Y,
                  onClick: () => {
                    H(Y), le(!0);
                  },
                  onToggle: (ce) => {
                    ce.stopPropagation(), $e(Y);
                  },
                  onDelete: (ce) => {
                    ce.stopPropagation(), ne(Y), ae(!0);
                  },
                  onViewTools: (ce) => {
                    ce.stopPropagation(), Fe(Y);
                  },
                }),
              ),
            ),
          ),
    ),
    He = [
      {
        key: "mcp",
        label: e.createElement(
          "span",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          T ? e.createElement(T, { style: { fontSize: 14 } }) : null,
          "MCP 客户端",
        ),
        children: De,
      },
      {
        key: "software",
        label: e.createElement(
          "span",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          $ ? e.createElement($, { style: { fontSize: 14 } }) : null,
          "计算引擎",
        ),
        children: e.createElement(al),
      },
    ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(at, {
      title: "工具",
      subtitle: `MCP: ${J.length} 个客户端（${je} 个启用）· ${Le} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          y,
          {
            icon: k ? e.createElement(k) : void 0,
            onClick: Ce,
            loading: g,
          },
          "刷新",
        ),
      ),
    }),
    e.createElement(P, {
      items: He,
      activeKey: D,
      onChange: (Y) => O(Y),
    }),
    // MCP Detail drawer
    ee
      ? e.createElement(
          v,
          {
            title: e.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              e.createElement("span", { style: { fontSize: 18 } }, "🔌"),
              e.createElement("span", null, ee.name || ee.key),
            ),
            open: q,
            onClose: () => le(!1),
            width: 480,
          },
          e.createElement(
            f,
            { column: 1, bordered: !0, size: "small" },
            e.createElement(
              f.Item,
              { label: "Key" },
              e.createElement("code", { style: { fontSize: 12 } }, ee.key),
            ),
            e.createElement(f.Item, { label: "名称" }, ee.name || "-"),
            e.createElement(f.Item, { label: "描述" }, ee.description || "-"),
            e.createElement(
              f.Item,
              { label: "状态" },
              e.createElement(
                C,
                { color: ee.enabled ? "green" : "default" },
                ee.enabled ? "启用" : "停用",
              ),
            ),
            e.createElement(f.Item, { label: "传输方式" }, ee.transport),
            ee.url ? e.createElement(f.Item, { label: "URL" }, ee.url) : null,
            ee.command
              ? e.createElement(
                  f.Item,
                  { label: "命令" },
                  e.createElement(
                    "code",
                    { style: { fontSize: 11 } },
                    ee.command,
                  ),
                )
              : null,
            ee.args && ee.args.length > 0
              ? e.createElement(f.Item, { label: "参数" }, ee.args.join(" "))
              : null,
          ),
          ee.tools && ee.tools.length > 0
            ? e.createElement(
                "div",
                { style: { marginTop: 16 } },
                e.createElement(
                  Z,
                  {
                    strong: !0,
                    style: { display: "block", marginBottom: 8 },
                  },
                  "提供的工具",
                ),
                e.createElement(S, {
                  size: "small",
                  dataSource: ee.tools,
                  renderItem: (Y) =>
                    e.createElement(
                      S.Item,
                      null,
                      e.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          },
                        },
                        T
                          ? e.createElement(T, {
                              style: { fontSize: 12, color: "#1677ff" },
                            })
                          : null,
                        e.createElement(Z, { style: { fontSize: 12 } }, Y),
                      ),
                    ),
                }),
              )
            : e.createElement(
                "div",
                { style: { marginTop: 16, fontSize: 12, color: "#8c8c8c" } },
                "此 MCP 客户端未设置工具白名单（所有工具均可用）",
              ),
        )
      : null,
    // ── Create MCP Modal (mirror console /mcp JSON import) ──
    e.createElement(
      G,
      {
        title: "添加 MCP 客户端 (JSON)",
        open: d,
        onCancel: () => Q(!1),
        onOk: Oe,
        confirmLoading: X,
        okText: "创建",
        cancelText: "取消",
        width: 700,
      },
      e.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "支持格式: ",
        e.createElement("code", null, '{ "mcpServers": { "key": {...} } }'),
        " 或 ",
        e.createElement("code", null, '{ "key": {...} }'),
      ),
      e.createElement(A, {
        value: se,
        onChange: (Y) => he(Y.target.value),
        autoSize: { minRows: 12, maxRows: 20 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 },
      }),
    ),
    // ── Delete Confirmation Modal ──
    e.createElement(
      G,
      {
        title: "确认删除",
        open: U,
        onOk: Ue,
        onCancel: () => {
          ae(!1), ne(null);
        },
        okText: "确认删除",
        cancelText: "取消",
        okButtonProps: { danger: !0 },
      },
      e.createElement(
        "p",
        null,
        `确定要删除 MCP 客户端「${
          (oe == null ? void 0 : oe.name) || (oe == null ? void 0 : oe.key)
        }」吗？此操作不可撤销。`,
      ),
    ),
    // ── Tools Viewer Modal (mirror console /mcp tools) ──
    e.createElement(
      G,
      {
        title: de ? `${de.name || de.key} - 工具列表` : "工具列表",
        open: W,
        onCancel: () => {
          pe(!1), ze(null);
        },
        footer: e.createElement(y, { onClick: () => pe(!1) }, "关闭"),
        width: 640,
      },
      ie
        ? e.createElement(
            "div",
            { style: { textAlign: "center", padding: 40 } },
            e.createElement(r, { size: "large" }),
          )
        : xe
        ? e.createElement(
            "div",
            { style: { color: "#ff4d4f", padding: 16 } },
            xe,
          )
        : Te.length === 0
        ? e.createElement(o, {
            description: "此 MCP 客户端暂无可用工具（可能服务未启动）",
          })
        : e.createElement(S, {
            size: "small",
            dataSource: Te,
            renderItem: (Y) =>
              e.createElement(
                S.Item,
                null,
                e.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    },
                  },
                  e.createElement(
                    "div",
                    {
                      style: { display: "flex", alignItems: "center", gap: 6 },
                    },
                    T
                      ? e.createElement(T, {
                          style: { fontSize: 12, color: "#1677ff" },
                        })
                      : null,
                    e.createElement(
                      Z,
                      { strong: !0, style: { fontSize: 13 } },
                      Y.name || Y.key,
                    ),
                  ),
                  Y.description
                    ? e.createElement(
                        Z,
                        { type: "secondary", style: { fontSize: 12 } },
                        Y.description,
                      )
                    : null,
                ),
              ),
          }),
    ),
  );
}
function ol({ agentId: e, agentName: t, onNavigate: a }) {
  const n = h().React,
    { useState: l, useEffect: r, useCallback: o } = n,
    {
      Spin: i,
      Empty: y,
      Button: c,
      Row: m,
      Col: x,
      Card: v,
      Tag: f,
      Checkbox: C,
      Modal: E,
      Typography: S,
      Drawer: P,
      Descriptions: G,
      message: k,
    } = h().antd,
    {
      ReloadOutlined: V,
      ThunderboltOutlined: b,
      SettingOutlined: T,
      CheckSquareOutlined: $,
      EyeOutlined: L,
      EyeInvisibleOutlined: u,
      DeleteOutlined: w,
      CloseOutlined: z,
    } = h().antdIcons || {},
    { Text: Z, Paragraph: A } = S,
    [_, p] = l([]),
    [N, K] = l(!0),
    [J, B] = l(!1),
    [g, I] = l(null),
    [j, re] = l(!1),
    [q, le] = l(/* @__PURE__ */ new Set()),
    [ee, H] = l(!1),
    D = o(async () => {
      if (e) {
        K(!0);
        try {
          const U = await lt(e);
          p(U);
        } catch (U) {
          k.error(U.message || "加载技能失败"), p([]);
        } finally {
          K(!1);
        }
      }
    }, [e]);
  r(() => {
    D();
  }, [D]);
  const O = (U) => {
      le((ae) => {
        const oe = new Set(ae);
        return oe.has(U) ? oe.delete(U) : oe.add(U), oe;
      });
    },
    d = () => le(/* @__PURE__ */ new Set()),
    Q = () => le(new Set(_.map((U) => U.name))),
    se = () => {
      j ? (d(), re(!1)) : re(!0);
    },
    he = async () => {
      const U = Array.from(q);
      if (U.length !== 0) {
        H(!0);
        try {
          const { results: ae } = await xn(e, U),
            oe = Object.entries(ae).filter(([, W]) => W.success === !1),
            ne = U.length - oe.length;
          oe.length > 0
            ? k.warning(`批量启用完成：成功 ${ne} 个，失败 ${oe.length} 个`)
            : k.success(`成功启用 ${U.length} 个技能`),
            d(),
            await D();
        } catch (ae) {
          k.error(ae.message || "批量启用失败");
        } finally {
          H(!1);
        }
      }
    },
    X = async () => {
      const U = Array.from(q);
      if (U.length !== 0) {
        H(!0);
        try {
          const { results: ae } = await Cn(e, U),
            oe = Object.entries(ae).filter(([, W]) => W.success === !1),
            ne = U.length - oe.length;
          oe.length > 0
            ? k.warning(`批量停用完成：成功 ${ne} 个，失败 ${oe.length} 个`)
            : k.success(`成功停用 ${U.length} 个技能`),
            d(),
            await D();
        } catch (ae) {
          k.error(ae.message || "批量停用失败");
        } finally {
          H(!1);
        }
      }
    },
    me = () => {
      const U = Array.from(q);
      U.length !== 0 &&
        E.confirm({
          title: `确认删除 ${U.length} 个技能？`,
          content:
            "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
          okText: "确认删除",
          cancelText: "取消",
          okButtonProps: { danger: !0 },
          onOk: async () => {
            H(!0);
            try {
              const { results: ae } = await kn(e, U),
                oe = Object.entries(ae).filter(([, W]) => W.success === !1),
                ne = U.length - oe.length;
              oe.length > 0
                ? k.warning(`批量删除完成：成功 ${ne} 个，失败 ${oe.length} 个`)
                : k.success(`成功删除 ${U.length} 个技能`),
                d(),
                await D();
            } catch (ae) {
              k.error(ae.message || "批量删除失败");
            } finally {
              H(!1);
            }
          },
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
          gap: 8,
        },
      },
      n.createElement(
        Z,
        { type: "secondary", style: { fontSize: 13 } },
        j ? `已选择 ${q.size} / ${_.length} 个技能` : `共 ${_.length} 个技能`,
      ),
      n.createElement(
        "div",
        {
          style: {
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          },
        },
        j
          ? n.createElement(
              n.Fragment,
              null,
              n.createElement(c, { size: "small", onClick: Q }, "全选"),
              n.createElement(
                c,
                {
                  size: "small",
                  icon: z ? n.createElement(z) : void 0,
                  onClick: d,
                },
                "取消选择",
              ),
              n.createElement(
                c,
                {
                  size: "small",
                  type: "default",
                  icon: L ? n.createElement(L) : void 0,
                  disabled: q.size === 0 || ee,
                  loading: ee,
                  onClick: he,
                },
                "批量启用",
              ),
              n.createElement(
                c,
                {
                  size: "small",
                  danger: !0,
                  icon: u ? n.createElement(u) : void 0,
                  disabled: q.size === 0 || ee,
                  loading: ee,
                  onClick: X,
                },
                "批量停用",
              ),
              n.createElement(
                c,
                {
                  size: "small",
                  danger: !0,
                  icon: w ? n.createElement(w) : void 0,
                  disabled: q.size === 0 || ee,
                  loading: ee,
                  onClick: me,
                },
                `删除 (${q.size})`,
              ),
              n.createElement(
                c,
                {
                  size: "small",
                  type: "primary",
                  onClick: se,
                },
                "退出批量",
              ),
            )
          : n.createElement(
              n.Fragment,
              null,
              n.createElement(
                c,
                {
                  size: "small",
                  icon: $ ? n.createElement($) : void 0,
                  onClick: se,
                  disabled: _.length === 0,
                },
                "批量管理",
              ),
              n.createElement(
                c,
                {
                  icon: V ? n.createElement(V) : void 0,
                  onClick: D,
                  loading: N,
                  size: "small",
                },
                "刷新",
              ),
            ),
      ),
    ),
    N
      ? n.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          n.createElement(i, { size: "large" }),
        )
      : _.length === 0
      ? n.createElement(y, {
          description: "当前智能体未加载任何技能",
        })
      : n.createElement(
          m,
          { gutter: [12, 12] },
          ..._.map((U) =>
            n.createElement(
              x,
              { key: U.name, xs: 24, sm: 12, md: 8, lg: 6 },
              n.createElement(
                v,
                {
                  hoverable: !0,
                  size: "small",
                  style: {
                    cursor: j ? "default" : "pointer",
                    height: "100%",
                    position: "relative",
                    borderColor: j && q.has(U.name) ? "#0072f5" : void 0,
                    borderWidth: j && q.has(U.name) ? 2 : 1,
                  },
                  onClick: () => {
                    j ? O(U.name) : (I(U), B(!0));
                  },
                },
                j
                  ? n.createElement(
                      "div",
                      {
                        style: {
                          position: "absolute",
                          top: 8,
                          right: 8,
                          zIndex: 1,
                        },
                        onClick: (ae) => {
                          ae.stopPropagation(), O(U.name);
                        },
                      },
                      n.createElement(C, {
                        checked: q.has(U.name),
                      }),
                    )
                  : null,
                n.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    },
                  },
                  U.emoji
                    ? n.createElement(
                        "span",
                        { style: { fontSize: 18 } },
                        U.emoji,
                      )
                    : n.createElement(
                        "span",
                        { style: { fontSize: 18 } },
                        "⚡",
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
                        whiteSpace: "nowrap",
                      },
                    },
                    U.name,
                  ),
                  U.enabled === !1
                    ? n.createElement(
                        f,
                        { color: "default", style: { fontSize: 10 } },
                        "已禁用",
                      )
                    : n.createElement(
                        f,
                        { color: "green", style: { fontSize: 10 } },
                        "已启用",
                      ),
                ),
                U.description
                  ? n.createElement(
                      A,
                      {
                        type: "secondary",
                        style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                        ellipsis: { rows: 2 },
                      },
                      U.description,
                    )
                  : null,
                n.createElement(
                  "div",
                  {
                    style: {
                      marginTop: 8,
                      display: "flex",
                      gap: 4,
                      flexWrap: "wrap",
                    },
                  },
                  U.version_text
                    ? n.createElement(
                        f,
                        { style: { fontSize: 10 } },
                        `v${U.version_text}`,
                      )
                    : null,
                  ...(U.tags || [])
                    .slice(0, 3)
                    .map((ae, oe) =>
                      n.createElement(
                        f,
                        { key: oe, color: "blue", style: { fontSize: 10 } },
                        ae,
                      ),
                    ),
                ),
              ),
            ),
          ),
        ),
    // Skill detail drawer
    g
      ? n.createElement(
          P,
          {
            title: n.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              n.createElement(
                "span",
                { style: { fontSize: 18 } },
                g.emoji || "⚡",
              ),
              n.createElement("span", null, g.name),
            ),
            open: J,
            onClose: () => B(!1),
            width: 520,
            extra: n.createElement(
              c,
              {
                type: "primary",
                size: "small",
                icon: T ? n.createElement(T) : void 0,
                onClick: () => a("/skills"),
              },
              "管理技能",
            ),
          },
          n.createElement(
            G,
            { column: 1, bordered: !0, size: "small" },
            n.createElement(G.Item, { label: "技能名称" }, g.name),
            n.createElement(G.Item, { label: "描述" }, g.description || "-"),
            g.version_text
              ? n.createElement(G.Item, { label: "版本" }, g.version_text)
              : null,
            n.createElement(G.Item, { label: "来源" }, g.source || "-"),
            n.createElement(
              G.Item,
              { label: "状态" },
              g.enabled === !1 ? "已禁用" : "已启用",
            ),
            g.installed_from
              ? n.createElement(G.Item, { label: "安装来源" }, g.installed_from)
              : null,
          ),
          // Tags
          g.tags && g.tags.length > 0
            ? n.createElement(
                "div",
                { style: { marginTop: 16 } },
                n.createElement(
                  Z,
                  {
                    strong: !0,
                    style: { display: "block", marginBottom: 8 },
                  },
                  "标签",
                ),
                n.createElement(
                  "div",
                  { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
                  ...g.tags.map((U, ae) =>
                    n.createElement(f, { key: ae, color: "blue" }, U),
                  ),
                ),
              )
            : null,
          // Skill content preview
          g.content
            ? n.createElement(
                "div",
                { style: { marginTop: 16 } },
                n.createElement(
                  Z,
                  {
                    strong: !0,
                    style: { display: "block", marginBottom: 8 },
                  },
                  "技能内容",
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
                      whiteSpace: "pre-wrap",
                    },
                  },
                  g.content.slice(0, 2e3) +
                    (g.content.length > 2e3
                      ? `

... (内容已截断)`
                      : ""),
                ),
              )
            : null,
        )
      : null,
  );
}
function sl({
  poolSkills: e,
  workspaceSkills: t,
  agents: a,
  loading: n,
  onReload: l,
}) {
  const r = h().React,
    { useState: o, useMemo: i, useCallback: y } = r,
    {
      Spin: c,
      Empty: m,
      Input: x,
      Button: v,
      Row: f,
      Col: C,
      Card: E,
      Tag: S,
      Typography: P,
      Drawer: G,
      Descriptions: k,
      List: V,
    } = h().antd,
    {
      ReloadOutlined: b,
      SearchOutlined: T,
      DownloadOutlined: $,
      ThunderboltOutlined: L,
    } = h().antdIcons || {},
    { Text: u, Paragraph: w } = P,
    [z, Z] = o(""),
    [A, _] = o(!1),
    [p, N] = o(null),
    [K, J] = o([]),
    [B, g] = o(!1),
    [I, j] = o(24),
    re = i(() => {
      if (!z.trim()) return e;
      const O = z.toLowerCase();
      return e.filter((d) => {
        var Q, se;
        return (
          d.name.toLowerCase().includes(O) ||
          ((Q = d.description) == null
            ? void 0
            : Q.toLowerCase().includes(O)) ||
          ((se = d.tags) == null
            ? void 0
            : se.some((he) => he.toLowerCase().includes(O)))
        );
      });
    }, [e, z]),
    q = i(() => re.slice(0, I), [re, I]),
    le = y((O) => {
      Z(O), j(24);
    }, []),
    ee = y(
      (O) => {
        const d = [];
        for (const Q of t)
          if (Q.skills.some((se) => se.name === O)) {
            const se = a.find((he) => he.id === Q.agent_id);
            d.push(
              (se == null ? void 0 : se.name) || Q.agent_name || Q.agent_id,
            );
          }
        return d;
      },
      [t, a],
    ),
    H = y(
      async (O) => {
        if ((N(O), J(ee(O.name)), _(!0), !O.content)) {
          g(!0);
          try {
            const d = await sn(O.name);
            N({ ...O, content: d });
          } catch {
          } finally {
            g(!1);
          }
        }
      },
      [ee],
    ),
    D = (O) => {
      window.history.pushState({}, "", O),
        window.dispatchEvent(new PopStateEvent("popstate"));
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
          marginBottom: 16,
        },
      },
      r.createElement(x, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: T ? r.createElement(T) : void 0,
        value: z,
        onChange: (O) => le(O.target.value),
        allowClear: !0,
        style: { maxWidth: 400 },
      }),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          v,
          {
            icon: b ? r.createElement(b) : void 0,
            onClick: l,
            loading: n,
            size: "small",
          },
          "刷新",
        ),
        r.createElement(
          v,
          {
            type: "primary",
            icon: $ ? r.createElement($) : void 0,
            onClick: () => D("/skill-pool"),
            size: "small",
            style: Me,
          },
          "管理技能池",
        ),
      ),
    ),
    n
      ? r.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          r.createElement(c, { size: "large" }),
        )
      : re.length === 0
      ? r.createElement(m, {
          description: z ? "未找到匹配的技能" : "技能池为空",
        })
      : r.createElement(
          r.Fragment,
          null,
          r.createElement(
            f,
            { gutter: [12, 12] },
            ...q.map((O) =>
              r.createElement(
                C,
                { key: O.name, xs: 24, sm: 12, md: 8, lg: 6 },
                r.createElement(
                  E,
                  {
                    hoverable: !0,
                    size: "small",
                    style: { cursor: "pointer", height: "100%" },
                    onClick: () => H(O),
                  },
                  r.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      },
                    },
                    O.emoji
                      ? r.createElement(
                          "span",
                          { style: { fontSize: 18 } },
                          O.emoji,
                        )
                      : r.createElement(
                          "span",
                          { style: { fontSize: 18 } },
                          "⚡",
                        ),
                    r.createElement(
                      u,
                      {
                        strong: !0,
                        style: {
                          fontSize: 13,
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        },
                      },
                      O.name,
                    ),
                    O.protected
                      ? r.createElement(
                          S,
                          { color: "gold", style: { fontSize: 10 } },
                          "内置",
                        )
                      : null,
                  ),
                  O.description
                    ? r.createElement(
                        w,
                        {
                          type: "secondary",
                          style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                          ellipsis: { rows: 2 },
                        },
                        O.description,
                      )
                    : null,
                  r.createElement(
                    "div",
                    {
                      style: {
                        marginTop: 8,
                        display: "flex",
                        gap: 4,
                        flexWrap: "wrap",
                      },
                    },
                    O.version_text
                      ? r.createElement(
                          S,
                          { style: { fontSize: 10 } },
                          `v${O.version_text}`,
                        )
                      : null,
                    ...(O.tags || [])
                      .slice(0, 3)
                      .map((d, Q) =>
                        r.createElement(
                          S,
                          { key: Q, color: "cyan", style: { fontSize: 10 } },
                          d,
                        ),
                      ),
                  ),
                ),
              ),
            ),
            // Load more button
            q.length < re.length
              ? r.createElement(
                  "div",
                  { style: { textAlign: "center", marginTop: 16 } },
                  r.createElement(
                    v,
                    {
                      onClick: () => j((O) => O + 24),
                      size: "small",
                    },
                    `加载更多 (剩余 ${re.length - q.length} 个)`,
                  ),
                )
              : null,
          ),
        ),
    // Skill detail drawer
    p
      ? r.createElement(
          G,
          {
            title: r.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              r.createElement(
                "span",
                { style: { fontSize: 18 } },
                p.emoji || "⚡",
              ),
              r.createElement("span", null, p.name),
            ),
            open: A,
            onClose: () => _(!1),
            width: 520,
            extra: r.createElement(
              v,
              {
                type: "primary",
                size: "small",
                icon: L ? r.createElement(L) : void 0,
                onClick: () => D("/skills"),
              },
              "管理技能",
            ),
          },
          r.createElement(
            k,
            { column: 1, bordered: !0, size: "small" },
            r.createElement(k.Item, { label: "技能名称" }, p.name),
            r.createElement(k.Item, { label: "描述" }, p.description || "-"),
            p.version_text
              ? r.createElement(k.Item, { label: "版本" }, p.version_text)
              : null,
            r.createElement(k.Item, { label: "来源" }, p.source || "-"),
            r.createElement(
              k.Item,
              { label: "受保护" },
              p.protected ? "是（内置）" : "否",
            ),
            p.sync_status
              ? r.createElement(k.Item, { label: "同步状态" }, p.sync_status)
              : null,
            p.installed_from
              ? r.createElement(k.Item, { label: "安装来源" }, p.installed_from)
              : null,
          ),
          // Tags
          p.tags && p.tags.length > 0
            ? r.createElement(
                "div",
                { style: { marginTop: 16 } },
                r.createElement(
                  u,
                  {
                    strong: !0,
                    style: { display: "block", marginBottom: 8 },
                  },
                  "标签",
                ),
                r.createElement(
                  "div",
                  { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
                  ...p.tags.map((O, d) =>
                    r.createElement(S, { key: d, color: "cyan" }, O),
                  ),
                ),
              )
            : null,
          // Installed agents
          r.createElement(
            "div",
            { style: { marginTop: 16 } },
            r.createElement(
              u,
              { strong: !0, style: { display: "block", marginBottom: 8 } },
              `已安装此技能的专家 (${K.length})`,
            ),
            K.length > 0
              ? r.createElement(V, {
                  size: "small",
                  dataSource: K,
                  renderItem: (O) =>
                    r.createElement(
                      V.Item,
                      null,
                      r.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          },
                        },
                        r.createElement(Be, { name: O, size: 20 }),
                        r.createElement(u, { style: { fontSize: 13 } }, O),
                      ),
                    ),
                })
              : r.createElement(
                  u,
                  { type: "secondary", style: { fontSize: 12 } },
                  "暂无专家安装此技能",
                ),
          ),
          // Skill content preview (lazy-loaded)
          B
            ? r.createElement(
                "div",
                { style: { marginTop: 16, textAlign: "center" } },
                r.createElement(c, { size: "small" }),
              )
            : p.content
            ? r.createElement(
                "div",
                { style: { marginTop: 16 } },
                r.createElement(
                  u,
                  {
                    strong: !0,
                    style: { display: "block", marginBottom: 8 },
                  },
                  "技能内容",
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
                      whiteSpace: "pre-wrap",
                    },
                  },
                  p.content.slice(0, 2e3) +
                    (p.content.length > 2e3
                      ? `

... (内容已截断)`
                      : ""),
                ),
              )
            : null,
        )
      : null,
  );
}
function il() {
  const e = h().React,
    { useState: t, useEffect: a, useCallback: n, useMemo: l } = e,
    { Tabs: r, message: o } = h().antd,
    { ThunderboltOutlined: i, AppstoreOutlined: y } = h().antdIcons || {},
    m = h().useSelectedAgent,
    x = m ? m() : null,
    v = (x == null ? void 0 : x.id) || "default",
    [f, C] = t([]),
    [E, S] = t([]),
    [P, G] = t([]),
    [k, V] = t(!0),
    [b, T] = t("agent-skills"),
    $ = n(async () => {
      V(!0);
      try {
        const [z, Z, A] = await Promise.all([gt(!0), pt(), cn()]);
        S(z), C(Z), G(A);
      } catch (z) {
        o.error(z.message || "加载技能列表失败"), S([]);
      } finally {
        V(!1);
      }
    }, []);
  a(() => {
    $();
  }, [$]);
  const L = l(() => {
      const z = f.find((Z) => Z.id === v);
      return (z == null ? void 0 : z.name) || v;
    }, [f, v]),
    u = (z) => {
      window.history.pushState({}, "", z),
        window.dispatchEvent(new PopStateEvent("popstate"));
    },
    w = [
      {
        key: "agent-skills",
        label: e.createElement(
          "span",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          i ? e.createElement(i, { style: { fontSize: 14 } }) : null,
          "当前Agent加载技能",
        ),
        children: e.createElement(ol, {
          agentId: v,
          agentName: L,
          onNavigate: u,
        }),
      },
      {
        key: "skill-pool",
        label: e.createElement(
          "span",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          y ? e.createElement(y, { style: { fontSize: 14 } }) : null,
          "技能池",
        ),
        children: e.createElement(sl, {
          poolSkills: E,
          workspaceSkills: P,
          agents: f,
          loading: k,
          onReload: $,
        }),
      },
    ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(at, {
      title: "技能",
      subtitle: `技能池共 ${E.length} 个技能 · 当前智能体：${L}`,
    }),
    e.createElement(r, {
      items: w,
      activeKey: b,
      onChange: (z) => T(z),
    }),
  );
}
const dt = "ugsci.market.githubSources",
  It = "https://github.com/anthropics/skills/tree/main/skills";
function Kt(e) {
  try {
    const t = new URL(e.trim()),
      a = t.hostname.toLowerCase();
    if (a !== "github.com" && a !== "www.github.com") return null;
    const n = t.pathname.split("/").filter((y) => y.length > 0);
    if (n.length < 2) return null;
    const l = decodeURIComponent(n[0]),
      r = decodeURIComponent(n[1]);
    let o = "main",
      i = "";
    return (
      n.length >= 4 && (n[2] === "tree" || n[2] === "blob")
        ? ((o = decodeURIComponent(n[3])),
          n.length > 4 && (i = n.slice(4).map(decodeURIComponent).join("/")))
        : n.length > 2 && (i = n.slice(2).map(decodeURIComponent).join("/")),
      (i = i.replace(/\/+$/, "").replace(/^\/+/, "")),
      {
        owner: l,
        repo: r,
        ref: o || "main",
        skillsPath: i,
        label: `${l}/${r}`,
      }
    );
  } catch {
    return null;
  }
}
function Vt(e, t, a) {
  return `${e}/${t}:${a || "/"}`;
}
function cl() {
  try {
    const e = localStorage.getItem(dt);
    if (!e) {
      const a = Kt(It);
      if (a) {
        const n = [
          {
            id: Vt(a.owner, a.repo, a.skillsPath),
            url: It,
            label: a.label,
            owner: a.owner,
            repo: a.repo,
            ref: a.ref,
            skillsPath: a.skillsPath,
            enabled: !0,
          },
        ];
        return localStorage.setItem(dt, JSON.stringify(n)), n;
      }
      return [];
    }
    const t = JSON.parse(e);
    return Array.isArray(t)
      ? t.filter(
          (a) =>
            a &&
            typeof a.id == "string" &&
            typeof a.owner == "string" &&
            typeof a.repo == "string",
        )
      : [];
  } catch {
    return [];
  }
}
function st(e) {
  try {
    localStorage.setItem(dt, JSON.stringify(e));
  } catch {}
}
function ml(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const a = t[1],
    n = {},
    l = a.split(`
`);
  let r = "";
  for (const o of l) {
    const i = o.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (i) {
      r = i[1];
      let y = i[2].trim();
      ((y.startsWith('"') && y.endsWith('"')) ||
        (y.startsWith("'") && y.endsWith("'"))) &&
        (y = y.slice(1, -1)),
        r === "name"
          ? (n.name = y)
          : r === "description"
          ? (n.description = y)
          : r === "version"
          ? (n.version = y)
          : r === "author" && (n.author = y);
    }
  }
  return n;
}
async function dl(e) {
  const t = e.skillsPath
      ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/")
      : "",
    a = `https://api.github.com/repos/${e.owner}/${
      e.repo
    }/contents/${t}?ref=${encodeURIComponent(e.ref)}`,
    n = await fetch(a, {
      headers: { Accept: "application/vnd.github+json" },
    });
  if (!n.ok)
    throw new Error(
      `GitHub API ${n.status}: ${e.label} (${e.skillsPath || "/"})`,
    );
  const l = await n.json();
  if (!Array.isArray(l)) return [];
  const r = l.filter((i) => i.type === "dir" && i.name);
  return await Promise.all(
    r.map(async (i) => {
      const y = `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${
          e.ref
        }/${e.skillsPath ? e.skillsPath + "/" : ""}${i.name}/SKILL.md`,
        c = `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${
          e.skillsPath ? e.skillsPath + "/" : ""
        }${i.name}`,
        m = {
          sourceId: e.id,
          sourceLabel: e.label,
          name: i.name,
          description: "",
          source_url: c,
          html_url: c,
          version: null,
          author: null,
        };
      try {
        const x = await fetch(y);
        if (!x.ok) return m;
        const v = await x.text(),
          f = ml(v);
        return {
          ...m,
          name: f.name || i.name,
          description: f.description || "",
          version: f.version || null,
          author: f.author || null,
        };
      } catch {
        return m;
      }
    }),
  );
}
async function ul(e) {
  const t = e.filter((r) => r.enabled),
    a = await Promise.all(
      t.map(async (r) => {
        try {
          return { skills: await dl(r), error: null, label: r.label };
        } catch (o) {
          return {
            skills: [],
            error: o.message || String(o),
            label: r.label,
          };
        }
      }),
    ),
    n = [],
    l = [];
  for (const r of a)
    n.push(...r.skills),
      r.error && l.push({ label: r.label, message: r.error });
  return { skills: n, errors: l };
}
function pl({ open: e, onClose: t, sources: a, onChange: n }) {
  const l = h().React,
    { useState: r } = l,
    {
      Modal: o,
      Input: i,
      Button: y,
      List: c,
      Tag: m,
      Switch: x,
      Typography: v,
      Tooltip: f,
      message: C,
    } = h().antd,
    {
      PlusOutlined: E,
      DeleteOutlined: S,
      LinkOutlined: P,
      GithubOutlined: G,
    } = h().antdIcons || {},
    { Text: k } = v,
    [V, b] = r(""),
    T = () => {
      const u = V.trim();
      if (!u) return;
      const w = Kt(u);
      if (!w) {
        C.error(
          "无效的 GitHub URL，请输入类似 https://github.com/owner/repo/tree/main/skills 的链接",
        );
        return;
      }
      const z = Vt(w.owner, w.repo, w.skillsPath);
      if (a.some((_) => _.id === z)) {
        C.warning("该源已存在");
        return;
      }
      const Z = {
          id: z,
          url: u,
          label: w.label,
          owner: w.owner,
          repo: w.repo,
          ref: w.ref,
          skillsPath: w.skillsPath,
          enabled: !0,
        },
        A = [...a, Z];
      st(A), n(A), b(""), C.success(`已添加源: ${w.label}`);
    },
    $ = (u, w) => {
      const z = a.map((Z) => (Z.id === u ? { ...Z, enabled: w } : Z));
      st(z), n(z);
    },
    L = (u) => {
      const w = a.filter((z) => z.id !== u);
      st(w), n(w), C.success("已移除源");
    };
  return l.createElement(
    o,
    {
      open: e,
      onCancel: t,
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        G ? l.createElement(G, { style: { fontSize: 18 } }) : null,
        l.createElement("span", null, "配置技能源"),
      ),
      footer: l.createElement(y, { onClick: t }, "关闭"),
      width: 640,
    },
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        k,
        {
          type: "secondary",
          style: { fontSize: 12, display: "block", marginBottom: 8 },
        },
        "添加 GitHub 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式：",
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        l.createElement(i, {
          placeholder: "https://github.com/anthropics/skills/tree/main/skills",
          value: V,
          onChange: (u) => b(u.target.value),
          onPressEnter: T,
          prefix: P ? l.createElement(P) : void 0,
          style: { flex: 1 },
        }),
        l.createElement(
          y,
          {
            type: "primary",
            icon: E ? l.createElement(E) : void 0,
            onClick: T,
          },
          "添加",
        ),
      ),
    ),
    l.createElement(
      "div",
      {
        style: {
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        },
      },
      l.createElement(k, { strong: !0 }, `已配置源 (${a.length})`),
    ),
    l.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: a,
      renderItem: (u) =>
        l.createElement(
          c.Item,
          {
            actions: [
              l.createElement(
                f,
                { title: u.enabled ? "点击禁用" : "点击启用" },
                l.createElement(x, {
                  size: "small",
                  checked: u.enabled,
                  onChange: (w) => $(u.id, w),
                }),
              ),
              l.createElement(
                f,
                { title: "移除此源" },
                l.createElement(y, {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: S ? l.createElement(S) : void 0,
                  onClick: () => L(u.id),
                }),
              ),
            ],
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
                  marginBottom: 4,
                },
              },
              l.createElement(
                m,
                { color: "blue", style: { fontSize: 11 } },
                u.label,
              ),
              u.skillsPath
                ? l.createElement(
                    k,
                    { type: "secondary", style: { fontSize: 11 } },
                    `/${u.skillsPath}`,
                  )
                : null,
              l.createElement(
                k,
                { type: "secondary", style: { fontSize: 11 } },
                `@${u.ref}`,
              ),
            ),
            l.createElement(
              k,
              {
                type: "secondary",
                style: { fontSize: 11, wordBreak: "break-all" },
              },
              u.url,
            ),
          ),
        ),
    }),
  );
}
async function gl() {
  return te("/market/providers");
}
async function yl(e) {
  return te(`/market/categories?lang=${encodeURIComponent(e)}`);
}
async function fl(e, t, a, n, l) {
  return te("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: t,
      limit: a,
      lang: n,
      category: l || void 0,
    }),
  });
}
async function zt(e, t, a) {
  return te("/skills/hub/install/start", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({
      bundle_url: t,
      enable: a,
    }),
  });
}
async function Pt(e, t) {
  return te(`/skills/hub/install/status/${encodeURIComponent(t)}`, {
    headers: { "X-Agent-Id": e },
  });
}
function El() {
  const e = h().React,
    { useState: t, useEffect: a, useCallback: n, useMemo: l, useRef: r } = e,
    {
      Spin: o,
      Empty: i,
      Input: y,
      Button: c,
      message: m,
      Row: x,
      Col: v,
      Card: f,
      Tag: C,
      Tooltip: E,
      Typography: S,
      Select: P,
      Drawer: G,
      Descriptions: k,
      Tabs: V,
      Badge: b,
      Progress: T,
    } = h().antd,
    {
      ReloadOutlined: $,
      SearchOutlined: L,
      DownloadOutlined: u,
      AppstoreOutlined: w,
      ShopOutlined: z,
      CheckCircleOutlined: Z,
      LoadingOutlined: A,
      UserOutlined: _,
      SettingOutlined: p,
      GithubOutlined: N,
      ApiOutlined: K,
    } = h().antdIcons || {},
    { Text: J, Paragraph: B, Title: g } = S,
    [I, j] = t("skills"),
    [re, q] = t([]),
    [le, ee] = t([]),
    [H, D] = t([]),
    [O, d] = t(""),
    [Q, se] = t(""),
    [he, X] = t(!1),
    [me, U] = t(!1),
    [ae, oe] = t({}),
    [ne, W] = t(null),
    [pe, de] = t({}),
    [ze, Te] = t([]),
    [M, ie] = t(""),
    [ge, xe] = t(""),
    [Se, Ce] = t(""),
    [$e, Ue] = t({}),
    [Oe, Fe] = t(""),
    [Ge, je] = t(/* @__PURE__ */ new Set()),
    [Le, De] = t([]),
    [He, Y] = t([]),
    [ce, R] = t(!1),
    [ke, we] = t(!1),
    [be, Ie] = t(""),
    Re = r(null);
  a(() => {
    Promise.all([
      gl().catch(() => []),
      yl("zh").catch(() => []),
      pt().catch(() => []),
    ]).then(([s, F, ue]) => {
      q(s), ee(F), Te(ue), ue.length > 0 && (ie(ue[0].id), Fe(ue[0].id));
    });
  }, []);
  const ye = n(async (s) => {
    const F = s ?? cl();
    if ((De(s || F), F.filter((fe) => fe.enabled).length === 0)) {
      Y([]);
      return;
    }
    R(!0);
    try {
      const { skills: fe, errors: Pe } = await ul(F);
      if ((Y(fe), Pe.length > 0)) {
        for (const Ee of Pe)
          console.warn(
            `[ugsci] GitHub source '${Ee.label}' error: ${Ee.message}`,
          );
        m.warning(`部分源加载失败: ${Pe.map((Ee) => Ee.label).join(", ")}`);
      }
    } catch (fe) {
      m.error(fe.message || "加载 GitHub 技能源失败"), Y([]);
    } finally {
      R(!1);
    }
  }, []);
  a(() => {
    ye();
  }, [ye]);
  const Je = n(async (s, F, ue) => {
    X(!0);
    try {
      const fe = await fl(s, ue, 20, "zh", F || void 0);
      ue === void 0 || Object.keys(ue).length === 0
        ? D(fe.results)
        : D((ve) => [...ve, ...fe.results]);
      const Pe = Object.values(fe.by_provider || {}).some((ve) => ve.has_more);
      U(Pe);
      const Ee = {};
      for (const [ve, _e] of Object.entries(fe.by_provider || {}))
        Ee[ve] = (ue[ve] || 1) + 1;
      if ((oe(Ee), fe.errors.length > 0))
        for (const ve of fe.errors)
          console.warn(
            `[ugsci] Market provider '${ve.provider}' error: ${ve.message}`,
          );
    } catch (fe) {
      m.error(fe.message || "搜索市场失败"), D([]);
    } finally {
      X(!1);
    }
  }, []);
  a(
    () => (
      Re.current && clearTimeout(Re.current),
      (Re.current = setTimeout(() => {
        Je(O, Q, {});
      }, 400)),
      () => {
        Re.current && clearTimeout(Re.current);
      }
    ),
    [O, Q, Je],
  );
  const rt = () => {
      Je(O, Q, ae);
    },
    Ve = async (s) => {
      var ue;
      if (!M) {
        m.warning("请先选择安装目标专家");
        return;
      }
      const F = `${s.source}:${s.slug}`;
      try {
        de((Ee) => ({ ...Ee, [F]: "starting" }));
        const fe = await zt(M, s.source_url, !0);
        de((Ee) => ({ ...Ee, [F]: "installing" }));
        const Pe = 60;
        for (let Ee = 0; Ee < Pe; Ee++) {
          await new Promise((_e) => setTimeout(_e, 2e3));
          const ve = await Pt(M, fe.task_id);
          if (
            ve.status === "completed" &&
            (ue = ve.result) != null &&
            ue.installed
          ) {
            m.success(`技能「${ve.result.name || s.name}」安装成功`),
              de((_e) => {
                const Ae = { ..._e };
                return delete Ae[F], Ae;
              });
            return;
          }
          if (ve.status === "failed") throw new Error(ve.error || "安装失败");
          if (ve.status === "cancelled") {
            m.info("安装已取消"),
              de((_e) => {
                const Ae = { ..._e };
                return delete Ae[F], Ae;
              });
            return;
          }
        }
        throw new Error("安装超时");
      } catch (fe) {
        m.error(fe.message || "安装技能失败"),
          de((Pe) => {
            const Ee = { ...Pe };
            return delete Ee[F], Ee;
          });
      }
    },
    We = (s) => {
      window.history.pushState({}, "", s),
        window.dispatchEvent(new PopStateEvent("popstate"));
    },
    Yt = async (s) => {
      var ue;
      if (!M) {
        m.warning("请先选择安装目标专家");
        return;
      }
      const F = `github:${s.sourceId}:${s.name}`;
      try {
        de((Ee) => ({ ...Ee, [F]: "starting" }));
        const fe = await zt(M, s.source_url, !0);
        de((Ee) => ({ ...Ee, [F]: "installing" }));
        const Pe = 60;
        for (let Ee = 0; Ee < Pe; Ee++) {
          await new Promise((_e) => setTimeout(_e, 2e3));
          const ve = await Pt(M, fe.task_id);
          if (
            ve.status === "completed" &&
            (ue = ve.result) != null &&
            ue.installed
          ) {
            m.success(`技能「${ve.result.name || s.name}」安装成功`),
              de((_e) => {
                const Ae = { ..._e };
                return delete Ae[F], Ae;
              });
            return;
          }
          if (ve.status === "failed") throw new Error(ve.error || "安装失败");
          if (ve.status === "cancelled") {
            m.info("安装已取消"),
              de((_e) => {
                const Ae = { ..._e };
                return delete Ae[F], Ae;
              });
            return;
          }
        }
        throw new Error("安装超时");
      } catch (fe) {
        m.error(fe.message || "安装技能失败"),
          de((Pe) => {
            const Ee = { ...Pe };
            return delete Ee[F], Ee;
          });
      }
    },
    ot = l(() => {
      let s = He;
      if ((be && (s = s.filter((F) => F.sourceLabel === be)), O.trim())) {
        const F = O.toLowerCase();
        s = s.filter((ue) => {
          var fe;
          return (
            ue.name.toLowerCase().includes(F) ||
            ((fe = ue.description) == null
              ? void 0
              : fe.toLowerCase().includes(F))
          );
        });
      }
      return s;
    }, [He, O, be]),
    Qe = re.filter((s) => s.available),
    qe = l(() => {
      if (!be) return H;
      const s = Qe.find((F) => F.label === be);
      return s ? H.filter((F) => F.source === s.key) : H;
    }, [H, be, Qe]),
    ht = l(() => {
      const s = /* @__PURE__ */ new Set();
      return (
        Le.filter((F) => F.enabled).forEach((F) => s.add(F.label)),
        Qe.forEach((F) => s.add(F.label)),
        Array.from(s)
      );
    }, [Le, Qe]),
    Qt = e.createElement(
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
            flexWrap: "wrap",
          },
        },
        e.createElement(y, {
          placeholder: "搜索技能市场...",
          prefix: L ? e.createElement(L) : void 0,
          value: O,
          onChange: (s) => d(s.target.value),
          allowClear: !0,
          style: { flex: 1, minWidth: 200, maxWidth: 400 },
        }),
        le.length > 0
          ? e.createElement(P, {
              value: Q || void 0,
              onChange: (s) => se(s || ""),
              placeholder: "全部分类",
              allowClear: !0,
              style: { minWidth: 150 },
              options: [
                { value: "", label: "全部分类" },
                ...le.map((s) => ({ value: s.id, label: s.label })),
              ],
            })
          : null,
        // Install target selector
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 4 } },
          e.createElement(
            J,
            { type: "secondary", style: { fontSize: 12 } },
            "安装到",
          ),
          e.createElement(P, {
            value: M || void 0,
            onChange: (s) => ie(s),
            style: { minWidth: 140 },
            placeholder: "选择专家",
            options: ze.map((s) => ({ value: s.id, label: s.name })),
          }),
        ),
      ),
      // Source filter tags (GitHub sources + market providers)
      ht.length > 0
        ? e.createElement(
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
            e.createElement(
              J,
              { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
              "来源筛选:",
            ),
            e.createElement(
              C,
              {
                style: {
                  fontSize: 11,
                  cursor: "pointer",
                  borderRadius: 12,
                },
                color: be === "" ? "blue" : void 0,
                onClick: () => Ie(""),
              },
              "全部",
            ),
            ...ht.map((s) =>
              e.createElement(
                C,
                {
                  key: s,
                  style: {
                    fontSize: 11,
                    cursor: "pointer",
                    borderRadius: 12,
                  },
                  color: be === s ? "blue" : void 0,
                  icon:
                    N && Le.some((F) => F.label === s)
                      ? e.createElement(N)
                      : void 0,
                  onClick: () => Ie(be === s ? "" : s),
                },
                s,
              ),
            ),
          )
        : null,
      // GitHub skills section
      ce && He.length === 0
        ? e.createElement(
            "div",
            { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
            e.createElement(o, {
              tip: "正在从 GitHub 加载技能...",
              size: "large",
            }),
          )
        : ot.length > 0
        ? e.createElement(
            "div",
            { style: { marginBottom: 20 } },
            e.createElement(
              "div",
              {
                style: {
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                },
              },
              N
                ? e.createElement(N, {
                    style: { fontSize: 14, color: "#1677ff" },
                  })
                : null,
              e.createElement(
                J,
                { strong: !0, style: { fontSize: 13 } },
                `GitHub 技能源 (${ot.length})`,
              ),
            ),
            e.createElement(
              x,
              { gutter: [12, 12] },
              ...ot.map((s) => {
                const F = `github:${s.sourceId}:${s.name}`,
                  ue = pe[F];
                return e.createElement(
                  v,
                  { key: F, xs: 24, sm: 12, md: 8, lg: 6 },
                  e.createElement(
                    f,
                    {
                      hoverable: !0,
                      size: "small",
                      style: { height: "100%" },
                    },
                    e.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 8,
                        },
                      },
                      N
                        ? e.createElement(N, {
                            style: { fontSize: 18, color: "#57606a" },
                          })
                        : e.createElement(
                            "span",
                            { style: { fontSize: 18 } },
                            "📦",
                          ),
                      e.createElement(
                        E,
                        { title: s.name },
                        e.createElement(
                          J,
                          {
                            strong: !0,
                            style: {
                              fontSize: 13,
                              flex: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            },
                          },
                          s.name,
                        ),
                      ),
                    ),
                    e.createElement(
                      B,
                      {
                        type: "secondary",
                        style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                        ellipsis: { rows: 2 },
                      },
                      s.description || "暂无描述",
                    ),
                    e.createElement(
                      "div",
                      {
                        style: {
                          marginTop: 8,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        },
                      },
                      e.createElement(
                        "div",
                        {
                          style: { display: "flex", gap: 4, flexWrap: "wrap" },
                        },
                        e.createElement(
                          C,
                          { color: "blue", style: { fontSize: 10 } },
                          s.sourceLabel,
                        ),
                        s.version
                          ? e.createElement(
                              C,
                              { style: { fontSize: 10 } },
                              `v${s.version}`,
                            )
                          : null,
                      ),
                      ue
                        ? e.createElement(
                            c,
                            {
                              size: "small",
                              disabled: !0,
                              icon: A ? e.createElement(A) : void 0,
                            },
                            ue === "starting" ? "启动中" : "安装中",
                          )
                        : e.createElement(
                            c,
                            {
                              type: "primary",
                              size: "small",
                              icon: u ? e.createElement(u) : void 0,
                              onClick: () => Yt(s),
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
      qe.length > 0 || he
        ? e.createElement(
            "div",
            {
              style: {
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
              },
            },
            z
              ? e.createElement(z, {
                  style: { fontSize: 14, color: "#1677ff" },
                })
              : null,
            e.createElement(
              J,
              { strong: !0, style: { fontSize: 13 } },
              `技能市场${qe.length > 0 ? ` (${qe.length})` : ""}`,
            ),
          )
        : null,
      // Results grid
      he && qe.length === 0
        ? e.createElement(
            "div",
            { style: { textAlign: "center", padding: 60 } },
            e.createElement(o, { size: "large" }),
          )
        : qe.length === 0
        ? e.createElement(i, {
            description: O
              ? `未找到匹配「${O}」的技能`
              : "输入关键词搜索技能市场",
            image: i.PRESENTED_IMAGE_SIMPLE,
          })
        : e.createElement(
            x,
            { gutter: [12, 12] },
            ...qe.map((s) => {
              const F = `${s.source}:${s.slug}`,
                ue = pe[F];
              return e.createElement(
                v,
                { key: F, xs: 24, sm: 12, md: 8, lg: 6 },
                e.createElement(
                  f,
                  {
                    hoverable: !0,
                    size: "small",
                    style: { height: "100%", cursor: "pointer" },
                    onClick: () => W(s),
                  },
                  e.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      },
                    },
                    s.icon_url
                      ? e.createElement("img", {
                          src: s.icon_url,
                          alt: s.name,
                          style: { width: 24, height: 24, borderRadius: 4 },
                        })
                      : e.createElement(
                          "span",
                          { style: { fontSize: 18 } },
                          "📦",
                        ),
                    e.createElement(
                      E,
                      { title: s.name },
                      e.createElement(
                        J,
                        {
                          strong: !0,
                          style: {
                            fontSize: 13,
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          },
                        },
                        s.name,
                      ),
                    ),
                  ),
                  e.createElement(
                    B,
                    {
                      type: "secondary",
                      style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                      ellipsis: { rows: 2 },
                    },
                    s.description || "暂无描述",
                  ),
                  e.createElement(
                    "div",
                    {
                      style: {
                        marginTop: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      },
                    },
                    e.createElement(
                      "div",
                      { style: { display: "flex", gap: 4 } },
                      e.createElement(
                        C,
                        { color: "geekblue", style: { fontSize: 10 } },
                        s.source,
                      ),
                      s.version
                        ? e.createElement(
                            C,
                            { style: { fontSize: 10 } },
                            `v${s.version}`,
                          )
                        : null,
                    ),
                    ue
                      ? e.createElement(
                          c,
                          {
                            size: "small",
                            disabled: !0,
                            icon: A ? e.createElement(A) : void 0,
                          },
                          ue === "starting" ? "启动中" : "安装中",
                        )
                      : e.createElement(
                          c,
                          {
                            type: "primary",
                            size: "small",
                            icon: u ? e.createElement(u) : void 0,
                            onClick: (fe) => {
                              fe.stopPropagation(), Ve(s);
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
      me && !he
        ? e.createElement(
            "div",
            { style: { textAlign: "center", marginTop: 16 } },
            e.createElement(c, { onClick: rt, loading: he }, "加载更多"),
          )
        : null,
      // Detail Drawer
      ne
        ? e.createElement(
            G,
            {
              title: e.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                ne.icon_url
                  ? e.createElement("img", {
                      src: ne.icon_url,
                      alt: ne.name,
                      style: { width: 28, height: 28, borderRadius: 4 },
                    })
                  : e.createElement("span", { style: { fontSize: 20 } }, "📦"),
                e.createElement("span", null, ne.name),
              ),
              open: !0,
              onClose: () => W(null),
              width: 480,
              extra: e.createElement(
                c,
                {
                  type: "primary",
                  icon: u ? e.createElement(u) : void 0,
                  onClick: () => {
                    Ve(ne);
                  },
                },
                "安装到专家",
              ),
            },
            e.createElement(
              k,
              { column: 1, bordered: !0, size: "small" },
              e.createElement(k.Item, { label: "来源" }, ne.source),
              e.createElement(k.Item, { label: "描述" }, ne.description || "-"),
              ne.version
                ? e.createElement(k.Item, { label: "版本" }, ne.version)
                : null,
              ne.author
                ? e.createElement(k.Item, { label: "作者" }, ne.author)
                : null,
              e.createElement(
                k.Item,
                { label: "来源链接" },
                e.createElement(
                  "a",
                  { href: ne.source_url, target: "_blank" },
                  ne.source_url,
                ),
              ),
            ),
            ne.stats
              ? e.createElement(
                  "div",
                  { style: { marginTop: 16 } },
                  e.createElement(
                    J,
                    {
                      strong: !0,
                      style: { display: "block", marginBottom: 8 },
                    },
                    "统计",
                  ),
                  e.createElement(
                    "div",
                    { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
                    ...Object.entries(ne.stats).map(([s, F]) =>
                      e.createElement(
                        "div",
                        { key: s, style: { textAlign: "center" } },
                        e.createElement(
                          "div",
                          {
                            style: {
                              fontSize: 18,
                              fontWeight: 600,
                              color: "#1677ff",
                            },
                          },
                          String(F),
                        ),
                        e.createElement(
                          J,
                          { type: "secondary", style: { fontSize: 11 } },
                          s,
                        ),
                      ),
                    ),
                  ),
                )
              : null,
          )
        : null,
    ),
    Zt = l(() => {
      if (!ge.trim()) return ct;
      const s = ge.toLowerCase();
      return ct.filter(
        (F) =>
          F.name.toLowerCase().includes(s) ||
          F.description.toLowerCase().includes(s) ||
          F.category.toLowerCase().includes(s),
      );
    }, [ge]),
    en = async (s) => {
      try {
        const F = await te("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: s.name,
            description: s.description,
            skill_names: s.recommendedSkills,
          }),
        });
        await tt(F.id, "AGENTS.md", s.systemPrompt);
        const ue = await nt(F.id);
        (ue.approval_level = s.approvalLevel),
          await te(`/agents/${encodeURIComponent(F.id)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ue),
          }),
          m.success(`专家「${s.name}」创建成功，已跳转至专家`),
          We("/ugsci-experts");
      } catch (F) {
        m.error(F.message || "创建专家失败");
      }
    },
    vt = n(async (s) => {
      if (s)
        try {
          const F = await ft(s);
          je(new Set(F.map((ue) => ue.key)));
        } catch {
          je(/* @__PURE__ */ new Set());
        }
    }, []);
  a(() => {
    Oe && vt(Oe);
  }, [Oe, vt]);
  const tn = async (s) => {
      if (!Oe) {
        m.warning("请先选择目标专家");
        return;
      }
      Ue((F) => ({ ...F, [s.id]: !0 }));
      try {
        const F = s.id;
        await Nt(Oe, {
          client_key: F,
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
            headers: s.headers || {},
          },
        }),
          m.success(`MCP「${s.name}」已添加到当前专家`),
          je((ue) => new Set(ue).add(F));
      } catch (F) {
        m.error(F.message || `添加 MCP「${s.name}」失败`);
      } finally {
        Ue((F) => ({ ...F, [s.id]: !1 }));
      }
    },
    nn = l(() => {
      if (!Se.trim()) return bt;
      const s = Se.toLowerCase();
      return bt.filter(
        (F) =>
          F.name.toLowerCase().includes(s) ||
          F.description.toLowerCase().includes(s) ||
          F.category.toLowerCase().includes(s),
      );
    }, [Se]),
    ln = e.createElement(
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
            border: "1px solid #d9f7be",
          },
        },
        e.createElement(
          J,
          { style: { fontSize: 13, color: "#135200" } },
          "从 MCP 模板库选择常用 Model Context Protocol 服务器，一键添加到当前专家。支持文件系统、数据库、搜索、开发工具等多种 MCP 服务器。",
        ),
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
            alignItems: "center",
          },
        },
        e.createElement(y, {
          placeholder: "搜索 MCP 模板...",
          prefix: L ? e.createElement(L) : void 0,
          value: Se,
          onChange: (s) => Ce(s.target.value),
          allowClear: !0,
          style: { maxWidth: 300 },
        }),
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          e.createElement(
            J,
            {
              type: "secondary",
              style: { fontSize: 12, whiteSpace: "nowrap" },
            },
            "安装到：",
          ),
          e.createElement(P, {
            value: Oe,
            onChange: (s) => Fe(s),
            style: { minWidth: 180 },
            size: "small",
            options: ze.map((s) => ({ value: s.id, label: s.name })),
          }),
        ),
      ),
      // MCP template cards
      e.createElement(
        x,
        { gutter: [12, 12] },
        ...nn.map((s) =>
          e.createElement(
            v,
            { key: s.id, xs: 24, sm: 12, md: 8 },
            e.createElement(
              f,
              {
                hoverable: !0,
                size: "small",
                style: { height: "100%" },
              },
              // Header: emoji + name + tags
              e.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 8,
                  },
                },
                e.createElement("span", { style: { fontSize: 28 } }, s.emoji),
                e.createElement(
                  "div",
                  { style: { flex: 1 } },
                  e.createElement(
                    J,
                    { strong: !0, style: { fontSize: 14 } },
                    s.name,
                  ),
                  e.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        gap: 4,
                        marginTop: 4,
                        flexWrap: "wrap",
                      },
                    },
                    e.createElement(
                      C,
                      { color: "blue", style: { fontSize: 10 } },
                      s.category,
                    ),
                    e.createElement(
                      C,
                      {
                        color: s.transport === "stdio" ? "purple" : "cyan",
                        style: { fontSize: 10 },
                      },
                      s.transport,
                    ),
                    s.env && Object.keys(s.env).length > 0
                      ? e.createElement(
                          C,
                          { color: "orange", style: { fontSize: 10 } },
                          "需配置密钥",
                        )
                      : null,
                  ),
                ),
              ),
              // Description
              e.createElement(
                B,
                {
                  type: "secondary",
                  style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                  ellipsis: { rows: 3 },
                },
                s.description,
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
                    alignItems: "center",
                  },
                },
                e.createElement(
                  J,
                  { type: "secondary", style: { fontSize: 11 } },
                  s.transport === "stdio"
                    ? `${s.command} ${(s.args || []).join(" ")}`
                    : s.url || "",
                ),
                Ge.has(s.id)
                  ? e.createElement(
                      c,
                      { size: "small", disabled: !0 },
                      "已安装",
                    )
                  : e.createElement(
                      c,
                      {
                        type: "primary",
                        size: "small",
                        loading: !!$e[s.id],
                        icon: K ? e.createElement(K) : void 0,
                        onClick: () => tn(s),
                      },
                      "安装",
                    ),
              ),
            ),
          ),
        ),
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
            background: "#fafafa",
          },
        },
        z
          ? e.createElement(z, {
              style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 },
            })
          : null,
        e.createElement(
          J,
          { type: "secondary", style: { fontSize: 12 } },
          "更多 MCP 服务器模板持续更新中，也支持通过 JSON 配置自定义添加",
        ),
      ),
    ),
    an = e.createElement(
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
            border: "1px solid #d6e4ff",
          },
        },
        e.createElement(
          J,
          { style: { fontSize: 13, color: "#1f4e8c" } },
          "从专家模板库选择预设专家，一键创建并配置系统提示词、审批级别和推荐技能。未来将支持从远程市场获取更多行业专家模板。",
        ),
      ),
      e.createElement(y, {
        placeholder: "搜索专家模板...",
        prefix: L ? e.createElement(L) : void 0,
        value: ge,
        onChange: (s) => xe(s.target.value),
        allowClear: !0,
        style: { marginBottom: 16, maxWidth: 400 },
      }),
      e.createElement(
        x,
        { gutter: [12, 12] },
        ...Zt.map((s) =>
          e.createElement(
            v,
            { key: s.id, xs: 24, sm: 12, md: 8 },
            e.createElement(
              f,
              {
                hoverable: !0,
                size: "small",
                style: { height: "100%", cursor: "pointer" },
                onClick: () => en(s),
              },
              e.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 8,
                  },
                },
                e.createElement(Be, {
                  name: s.name,
                  size: 40,
                }),
                e.createElement(
                  "div",
                  { style: { flex: 1 } },
                  e.createElement(
                    J,
                    { strong: !0, style: { fontSize: 14 } },
                    s.name,
                  ),
                  e.createElement(
                    "div",
                    { style: { display: "flex", gap: 4, marginTop: 4 } },
                    e.createElement(
                      C,
                      { color: "blue", style: { fontSize: 10 } },
                      s.category,
                    ),
                    s.approvalLevel === "MANUAL"
                      ? e.createElement(
                          C,
                          { color: "orange", style: { fontSize: 10 } },
                          "需审批",
                        )
                      : e.createElement(
                          C,
                          { color: "green", style: { fontSize: 10 } },
                          "自动",
                        ),
                  ),
                ),
              ),
              e.createElement(
                B,
                {
                  type: "secondary",
                  style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                  ellipsis: { rows: 3 },
                },
                s.description.replace(/\*\*(.+?)\*\*/g, "$1"),
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
                    alignItems: "center",
                  },
                },
                e.createElement(
                  J,
                  { type: "secondary", style: { fontSize: 11 } },
                  `推荐 ${s.recommendedSkills.length} 个技能`,
                ),
                e.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: w ? e.createElement(w) : void 0,
                  },
                  "一键创建",
                ),
              ),
            ),
          ),
        ),
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
            background: "#fafafa",
          },
        },
        z
          ? e.createElement(z, {
              style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 },
            })
          : null,
        e.createElement(
          J,
          { type: "secondary", style: { fontSize: 12 } },
          "更多专家模板持续更新中，未来将支持 OpenScience、RPA 等行业扩展",
        ),
      ),
    ),
    rn = [
      {
        key: "skills",
        label: e.createElement(
          "span",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          w ? e.createElement(w, { style: { fontSize: 14 } }) : null,
          "技能市场",
        ),
        children: Qt,
      },
      {
        key: "mcp",
        label: e.createElement(
          "span",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          K ? e.createElement(K, { style: { fontSize: 14 } }) : null,
          "MCP 市场",
        ),
        children: ln,
      },
      {
        key: "experts",
        label: e.createElement(
          "span",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          _ ? e.createElement(_, { style: { fontSize: 14 } }) : null,
          "专家模板",
        ),
        children: an,
      },
    ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(at, {
      title: "市场",
      subtitle:
        "浏览技能市场 · 选择 MCP 服务器 · 创建专家模板 · 随时更新能力和专家",
      extra: e.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        e.createElement(
          c,
          {
            icon: N ? e.createElement(N) : void 0,
            onClick: () => we(!0),
          },
          "配置源",
        ),
        e.createElement(
          c,
          {
            type: "primary",
            icon: $ ? e.createElement($) : void 0,
            onClick: () => {
              Je(O, Q, {}), ye();
            },
            loading: he || ce,
          },
          "刷新",
        ),
      ),
    }),
    e.createElement(V, {
      items: rn,
      activeKey: I,
      onChange: (s) => j(s),
    }),
    // Source config modal
    e.createElement(pl, {
      open: ke,
      onClose: () => we(!1),
      sources: Le,
      onChange: (s) => {
        De(s), ye(s);
      },
    }),
  );
}
function hl() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {}
  return (
    ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] ||
    "en"
  );
}
const _t = {
    zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
    en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
    ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
    ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
    vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
    id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya.",
  },
  Ot = {
    zh: {
      label: "能告诉我你都能做点什么吗？",
      value: "能告诉我你都能做点什么吗",
    },
    en: {
      label: "Can you tell me what you can do?",
      value: "Can you tell me what you can do?",
    },
    ja: {
      label: "あなたができることを教えてください",
      value: "あなたができることを教えてください",
    },
    ru: {
      label: "Расскажи, что ты умеешь делать?",
      value: "Расскажи, что ты умеешь делать?",
    },
    vi: {
      label: "Bạn có thể cho tôi biết bạn làm được gì không?",
      value: "Bạn có thể cho tôi biết bạn làm được gì không?",
    },
    id: {
      label: "Bisa cerita apa saja yang bisa Anda lakukan?",
      value: "Bisa cerita apa saja yang bisa Anda lakukan?",
    },
  };
function vl() {
  const e = h(),
    t = e.React,
    { useEffect: a, useRef: n } = t,
    l = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" },
    r = (l == null ? void 0 : l.id) || "default",
    o = n(null),
    i = n(null);
  return (
    a(() => {
      if (o.current === r) return;
      o.current = r;
      const y = hl(),
        c = _t[y] || _t.en,
        m = Ot[y] || Ot.en;
      let x = !1;
      return (
        (async () => {
          var v, f;
          try {
            const C = await lt(r);
            if (x) return;
            const E = Lt(C);
            if (i.current) {
              try {
                i.current();
              } catch {}
              i.current = null;
            }
            const S = window.QwenPaw;
            (v = S == null ? void 0 : S.chat) != null &&
              v.welcome &&
              (E.length > 0
                ? ((i.current = S.chat.welcome.set("ugsci", {
                    description: c,
                    prompts: E,
                  })),
                  console.info(
                    `[ugsci] Injected ${E.length} welcome prompts for agent "${r}"`,
                  ))
                : ((i.current = S.chat.welcome.set("ugsci", {
                    description: c,
                    prompts: [m],
                  })),
                  console.info(
                    `[ugsci] No skills for agent "${r}" — using default prompt`,
                  )));
          } catch (C) {
            console.warn(
              `[ugsci] Failed to inject welcome prompts for agent "${r}":`,
              C,
            );
            const E = window.QwenPaw;
            if ((f = E == null ? void 0 : E.chat) != null && f.welcome && !x) {
              if (i.current) {
                try {
                  i.current();
                } catch {}
                i.current = null;
              }
              i.current = E.chat.welcome.set("ugsci", {
                description: c,
                prompts: [m],
              });
            }
          }
        })(),
        () => {
          x = !0;
        }
      );
    }, [r]),
    null
  );
}
const it = [
  { key: "default", label: "默认", icon: "", desc: "普通对话，回复即停" },
  { key: "goal", label: "Goal", icon: "", desc: "持续循环 + 自我审计" },
  {
    key: "mission",
    label: "Mission",
    icon: "",
    desc: "多Agent流水线 + 上下文隔离",
  },
];
function bl(e, t) {
  var n;
  const a =
    (n = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value",
    )) == null
      ? void 0
      : n.set;
  a ? a.call(e, t) : (e.value = t),
    (e.selectionStart = e.selectionEnd = t.length),
    e.dispatchEvent(new Event("input", { bubbles: !0 }));
}
function Sl() {
  const e = h(),
    t = e.React,
    { useState: a, useEffect: n, useCallback: l, useRef: r } = t,
    { Dropdown: o, Button: i } = e.antd,
    {
      SendOutlined: y,
      CarryOutOutlined: c,
      ScheduleOutlined: m,
      DownOutlined: x,
    } = e.antdIcons || {},
    [v, f] = a("default"),
    C = r(0);
  n(() => {
    const b = () => {
        if (C.current && Date.now() < C.current) return;
        C.current && Date.now() >= C.current && (C.current = 0);
        const $ = document.querySelector('[class*="loopChip"] span');
        if ($) {
          const u = ($.textContent || "").trim().match(/^\/(\S+)/);
          if (u) {
            const w = u[1];
            f((z) => (z !== w ? w : z));
            return;
          }
        }
        f((L) => (L !== "default" ? "default" : L));
      },
      T = setInterval(b, 500);
    return b(), () => clearInterval(T);
  }, []);
  const E = l(
      (b) => {
        var $;
        if (b === v) return;
        if (((C.current = Date.now() + 1e3), b === "default")) {
          const L = document.querySelector('[class*="loopChip"]');
          if (L) {
            let u = L.querySelector(
              '[class*="chipClose"], [class*="chip_close"], [class*="close"]',
            );
            if (!u) {
              const w = L.querySelectorAll("svg");
              w.length > 0 && (u = w[w.length - 1]);
            }
            if (!u) {
              const w = L.querySelectorAll("*");
              w.length > 0 && (u = w[w.length - 1]);
            }
            u &&
              u.dispatchEvent(
                new MouseEvent("click", { bubbles: !0, cancelable: !0 }),
              );
          }
          f("default");
          return;
        }
        const T =
          ($ = document.querySelector('[class*="sender"]')) == null
            ? void 0
            : $.querySelector("textarea");
        T && (bl(T, `__loop__${b}`), setTimeout(() => T.focus(), 100)), f(b);
      },
      [v],
    ),
    S = it.map((b) => {
      const T = b.key === v;
      return {
        key: b.key,
        label: t.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 180,
            },
          },
          t.createElement(
            "span",
            {
              style: {
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                width: 16,
                justifyContent: "center",
              },
            },
            b.key === "goal" && c
              ? t.createElement(c, { style: { fontSize: 14 } })
              : b.key === "mission" && m
              ? t.createElement(m, { style: { fontSize: 14 } })
              : y
              ? t.createElement(y, { style: { fontSize: 14 } })
              : null,
          ),
          t.createElement(
            "div",
            { style: { flex: 1 } },
            t.createElement(
              "div",
              { style: { fontWeight: T ? 600 : 400 } },
              b.label,
            ),
            t.createElement(
              "div",
              {
                style: {
                  fontSize: 11,
                  color: "rgba(0,0,0,0.45)",
                  marginTop: 1,
                },
              },
              b.desc,
            ),
          ),
          T
            ? t.createElement(
                "span",
                {
                  style: { color: "#1677ff", fontSize: 12, fontWeight: 600 },
                },
                "✓",
              )
            : null,
        ),
      };
    }),
    P = it.find((b) => b.key === v) || it[0];
  let G = null;
  v === "goal" && c
    ? (G = t.createElement(c, { style: { fontSize: 14 } }))
    : v === "mission" && m
    ? (G = t.createElement(m, { style: { fontSize: 14 } }))
    : y
    ? (G = t.createElement(y, { style: { fontSize: 14 } }))
    : (G = P.icon);
  const k = t.createElement(
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
          flexShrink: 0,
        },
      },
      G,
      t.createElement("span", null, P.label),
      x ? t.createElement(x, { style: { fontSize: 10, opacity: 0.5 } }) : null,
    ),
    V = {
      items: S,
      onClick: (b) => E(b.key),
    };
  return t.createElement(
    "span",
    {
      style: {
        order: -1,
        display: "inline-flex",
        alignItems: "center",
        flexShrink: 0,
      },
    },
    t.createElement(o, { menu: V, trigger: ["click"] }, k),
  );
}
function wl() {
  var c, m, x, v, f;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled",
    );
    return;
  }
  const t = h().React,
    a = "ugsci";
  (m = (c = e.chat) == null ? void 0 : c.rightHeader) != null && m.add
    ? (e.chat.rightHeader.add(a, t.createElement(vl), {
        id: "ugsci.welcome-injector",
        order: -1,
        // render before other right-header items (invisible anyway)
      }),
      console.info("[ugsci] WelcomePromptsInjector registered via rightHeader"))
    : console.warn(
        "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled",
      ),
    (v = (x = e.chat) == null ? void 0 : x.sender) != null && v.addPrefix
      ? (e.chat.sender.addPrefix(a, t.createElement(Sl), {
          id: "ugsci.mode-selector",
          order: -100,
        }),
        console.info("[ugsci] ModeSelector registered via sender.addPrefix"))
      : console.warn(
          "[ugsci] QP.chat.sender.addPrefix not available — mode selector disabled",
        );
  const n = h().antdIcons || {},
    l = n.UserSwitchOutlined,
    r = n.ToolOutlined,
    o = n.ThunderboltOutlined,
    i = n.ShopOutlined;
  e.route.add(a, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: Vn,
  }),
    e.menu.add(a, {
      id: "ugsci.experts",
      location: "primary.agentScoped",
      label: () => "专家",
      icon: l ? t.createElement(l, { style: { fontSize: 16 } }) : void 0,
      route: "ugsci.experts",
      order: 5,
      visible: () => Xe(),
    }),
    e.route.add(a, {
      id: "ugsci.capabilities",
      path: "/ugsci-capabilities",
      component: rl,
    }),
    e.menu.add(a, {
      id: "ugsci.capabilities",
      location: "primary.agentScoped",
      label: () => "工具",
      icon: r ? t.createElement(r, { style: { fontSize: 16 } }) : void 0,
      route: "ugsci.capabilities",
      order: 6,
      visible: () => Xe(),
    }),
    e.route.add(a, {
      id: "ugsci.skills-center",
      path: "/ugsci-skills",
      component: il,
    }),
    e.menu.add(a, {
      id: "ugsci.skills-center",
      location: "primary.agentScoped",
      label: () => "技能",
      icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
      route: "ugsci.skills-center",
      order: 7,
      visible: () => Xe(),
    }),
    e.route.add(a, {
      id: "ugsci.market",
      path: "/ugsci-market",
      component: El,
    }),
    e.menu.add(a, {
      id: "ugsci.market",
      location: "primary.agentScoped",
      label: () => "市场",
      icon: i ? t.createElement(i, { style: { fontSize: 16 } }) : void 0,
      route: "ugsci.market",
      order: 8,
      visible: () => Xe(),
    }),
    (f = e.sidebar) != null && f.registerSimpleModeItems
      ? (e.sidebar.registerSimpleModeItems([
          "ugsci.experts",
          "ugsci.capabilities",
          "ugsci.skills-center",
          "ugsci.market",
        ]),
        console.info("[ugsci] Registered 4 items for simple-mode visibility"))
      : console.warn(
          "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode",
        );
  const y = [
    "core.skills",
    "core.tools",
    "core.mcp",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool",
  ];
  for (const C of y) {
    try {
      const S = e.menu.snapshot("primary.agentScoped").find((P) => P.id === C);
      S &&
        e.menu.replace(a, C, {
          ...S,
          visible: () => !Xe(),
        });
    } catch {}
    try {
      const S = e.menu.snapshot("primary.settings").find((P) => P.id === C);
      S &&
        e.menu.replace(a, C, {
          ...S,
          visible: () => !Xe(),
        });
    } catch {}
  }
  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active",
  );
}
function ut() {
  try {
    wl();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(ut, 500);
  }
}
var At;
if ((At = window.QwenPaw) != null && At.host) ut();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), ut());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
