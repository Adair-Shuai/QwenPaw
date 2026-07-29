function I() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Pa() {
  try {
    return I().getApiToken() || "";
  } catch {
    return "";
  }
}
function tt(e) {
  return I().getApiUrl(e);
}
function Gn(e) {
  const t = Pa();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
const Bt = /* @__PURE__ */ new Map(), Oa = 15e3;
function nt() {
  Bt.clear();
}
async function le(e, t) {
  const s = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: l, ...n } = t || {};
  if (s !== "GET" && nt(), s === "GET" && !l) {
    const r = Bt.get(e);
    if (r && Date.now() - r.ts < Oa)
      return r.data;
  }
  const a = await fetch(tt(e), {
    ...n,
    headers: { ...Gn(), ...n.headers || {} }
  });
  if (!a.ok) {
    const r = await a.text().catch(() => "");
    throw new Error(r || `HTTP ${a.status}`);
  }
  if (a.status === 204) return null;
  const o = await a.json();
  return s === "GET" && Bt.set(e, { data: o, ts: Date.now() }), o;
}
async function Wt() {
  const e = await le("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function xt(e) {
  return le(`/agents/${encodeURIComponent(e)}`);
}
async function kt(e) {
  return await le("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Jt(e = !1) {
  return await le(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function Aa(e) {
  const t = await le(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function $a() {
  return await le("/skills/workspaces") || [];
}
async function Ma(e) {
  return await le("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Ra(e, t) {
  return le(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function La(e, t) {
  await le(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function ja(e, t, s) {
  return le("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ client_key: t, client: s })
  });
}
async function Ba(e, t, s) {
  return le(
    `/mcp/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(s)
    }
  );
}
async function Ua(e, t) {
  return await le(
    `/mcp/tools/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
async function Na(e, t) {
  return le(
    `/mcp/policy/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  );
}
async function Da(e, t, s) {
  return le(
    `/mcp/policy/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(s)
    }
  );
}
async function Fa(e) {
  return await le(
    "/mcp/access-principals",
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
async function Ga(e, t, s) {
  return le(
    `/mcp/oauth/start/${encodeURIComponent(t)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(s)
    }
  );
}
async function Ha(e, t) {
  return le(
    `/mcp/oauth/status/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  );
}
async function Wa(e, t) {
  await le(
    `/mcp/oauth/${encodeURIComponent(t)}`,
    {
      method: "DELETE",
      headers: { "X-Agent-Id": e }
    }
  );
}
const Re = {
  background: "#0072f5",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8
};
function Ye() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function Xt(e, t) {
  const s = I();
  return s.ReactMarkdown && s.remarkGfm ? t.createElement(
    s.ReactMarkdown,
    { remarkPlugins: [s.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
const xn = {
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
function Ja(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, s]) => typeof s == "string" && s.length > 0);
}
const Xa = [
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
], Ka = Xa, Hn = "ugsci_custom_teams";
function vt() {
  try {
    const e = localStorage.getItem(Hn);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function Wn(e) {
  try {
    localStorage.setItem(Hn, JSON.stringify(e));
  } catch {
  }
}
const Va = [
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
async function qa(e, t) {
  const s = {
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
  await fetch(tt("/console/chat"), {
    method: "POST",
    headers: {
      ...Gn(),
      "X-Agent-Id": e
    },
    body: JSON.stringify(s)
  });
}
function St(e, t) {
  const s = e.find(
    (n) => n.name === t || n.name === t.replace(/\s+/g, "")
  );
  if (s) return s.id;
  const l = e.find(
    (n) => n.name.includes(t) || t.includes(n.name) || n.name.replace(/\s+/g, "").includes(t.replace(/\s+/g, ""))
  );
  return l ? l.id : null;
}
function Ya(e) {
  var s;
  const t = e.members.map((l) => `- ${l.name}（${l.role}）`).join(`
`);
  if (e.custom && e.steps && e.steps.length > 0) {
    const l = e.steps.map((a, o) => {
      const r = a.passContext ? "（传递上一步的结果作为上下文）" : "（独立执行，不传递上下文）";
      return `${o + 1}. 向「${a.agentName}」发送请求：${a.instruction} ${r}`;
    }).join(`
`);
    return `${e.mode === "pipeline" ? "请按顺序依次执行以下步骤，每步使用 chat_with_agent 咨询对应专家：" : e.mode === "roundtable" ? "请同时向以下专家分别发送独立请求（不传递上下文），收集所有结果后综合：" : `你是团队协调者（${e.coordinatorName || ((s = e.members[0]) == null ? void 0 : s.name) || ""}），请按需调用以下专家完成任务：`}

---

## 团队任务

${e.taskTemplate}

---

## 执行步骤

${l}

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
function Qa({ team: e }) {
  const t = I().React, { Typography: s, Tag: l } = I().antd, { Text: n } = s, a = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙"
  }, o = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff"
  }, r = e.steps || [], c = r.length > 0;
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
      ...c ? r.map((m, u) => (e.members.find(
        (k) => k.name === m.agentName
      ), [
        u > 0 && e.mode !== "roundtable" ? t.createElement(
          "div",
          {
            key: `arrow-${u}`,
            style: {
              textAlign: "center",
              color: o[e.mode],
              fontSize: 14
            }
          },
          a[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `step-${u}`,
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
          t.createElement(Ue, {
            name: m.agentName,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              n,
              { strong: !0, style: { fontSize: 12 } },
              m.agentName
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
              m.instruction
            ),
            m.passContext ? t.createElement(
              l,
              {
                color: "blue",
                style: { fontSize: 9, marginTop: 2 }
              },
              "传递上下文"
            ) : t.createElement(
              l,
              { style: { fontSize: 9, marginTop: 2 } },
              "独立"
            )
          )
        )
      ])).flat() : e.members.map((m, u) => [
        u > 0 && e.mode !== "roundtable" ? t.createElement(
          "div",
          {
            key: `arrow-${u}`,
            style: {
              textAlign: "center",
              color: o[e.mode],
              fontSize: 14
            }
          },
          a[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `member-${u}`,
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
          t.createElement(Ue, { name: m.name, size: 24 }),
          t.createElement(
            "div",
            null,
            t.createElement(
              n,
              { strong: !0, style: { fontSize: 12 } },
              m.name
            ),
            t.createElement(
              "div",
              { style: { fontSize: 11, color: "#8c8c8c" } },
              m.role
            )
          )
        )
      ]).flat()
    )
  );
}
function Za({
  open: e,
  onClose: t,
  agents: s,
  editingTeam: l,
  onSaved: n
}) {
  const a = I().React, { useState: o, useEffect: r, useCallback: c } = a, {
    Modal: m,
    Input: u,
    Button: k,
    Select: b,
    Tag: x,
    Typography: S,
    Switch: p,
    Empty: $,
    message: M,
    Divider: V,
    Steps: R
  } = I().antd, { PlusOutlined: ee, DeleteOutlined: j, SaveOutlined: N, ArrowRightOutlined: O } = I().antdIcons || {}, { Text: _, Paragraph: T } = S, [J, D] = o(""), [A, h] = o("🤝"), [v, f] = o(""), [X, G] = o(
    "pipeline"
  ), [ae, w] = o(""), [g, E] = o(""), [C, re] = o([]), [L, q] = o([]), [ie, B] = o(!1);
  r(() => {
    e && (l ? (D(l.name), h(l.emoji), f(l.description), G(l.mode), w(l.coordinatorName || ""), E(l.taskTemplate), re(l.steps || []), q(l.members.map((P) => P.name))) : (D(""), h("🤝"), f(""), G("pipeline"), w(""), E(`请执行以下任务：
任务描述：{任务描述}`), re([]), q([])));
  }, [e, l]);
  const Y = c(() => {
    if (X === "roundtable") {
      const P = L.map((se) => ({
        agentName: se,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      re(P);
    } else if (X === "pipeline") {
      const P = new Map(C.map((de) => [de.agentName, de])), se = L.map((de) => P.get(de) || {
        agentName: de,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      re(se);
    }
  }, [X, L, C]), oe = (P) => {
    L.includes(P) || (q([...L, P]), X === "coordinator" && !ae && w(P));
  }, y = (P) => {
    q(L.filter((se) => se !== P)), re(C.filter((se) => se.agentName !== P)), ae === P && w(L[0] || "");
  }, ne = (P, se, de) => {
    const he = [...C];
    he[P] = { ...he[P], [se]: de }, re(he);
  }, d = () => {
    if (!J.trim()) {
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
    if (X === "coordinator" && !ae) {
      M.warning("请选择协调者");
      return;
    }
    B(!0);
    try {
      const P = L.map(
        (ue) => {
          var W;
          const K = s.find((z) => z.name === ue);
          return {
            name: ue,
            role: ((W = K == null ? void 0 : K.description) == null ? void 0 : W.slice(0, 30)) || "团队成员",
            emoji: ""
          };
        }
      );
      let se = C;
      (C.length === 0 || C.length !== L.length) && (se = L.map((ue) => ({
        agentName: ue,
        instruction: "请完成你的专业部分",
        passContext: X === "pipeline"
      })));
      const de = {
        id: (l == null ? void 0 : l.id) || `custom-${Date.now()}`,
        name: J.trim(),
        emoji: A,
        category: "自定义",
        description: v.trim() || `${J.trim()}（${L.length}人团队）`,
        mode: X,
        members: P,
        coordinatorName: X === "coordinator" ? ae : void 0,
        taskTemplate: g.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: se,
        custom: !0,
        createdAt: (l == null ? void 0 : l.createdAt) || Date.now()
      }, he = vt(), fe = he.findIndex((ue) => ue.id === de.id);
      fe >= 0 ? he[fe] = de : he.push(de), Wn(he), M.success(l ? "团队已更新" : "团队已创建"), n(), t();
    } catch (P) {
      M.error(P.message || "保存失败");
    } finally {
      B(!1);
    }
  }, te = s.filter(
    (P) => !L.includes(P.name)
  );
  return a.createElement(
    m,
    {
      open: e,
      onCancel: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement(
          "span",
          { style: { fontSize: 20 } },
          l ? "✏️" : "➕"
        ),
        a.createElement(
          "span",
          null,
          l ? "编辑专家团" : "创建专家团"
        )
      ),
      width: 720,
      onOk: d,
      okText: "保存团队",
      confirmLoading: ie,
      okButtonProps: {
        icon: N ? a.createElement(N) : void 0
      }
    },
    // Step 1: Basic info
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        _,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 基本信息"
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        L.length > 0 ? a.createElement(Qt, {
          members: L,
          size: 36
        }) : null,
        a.createElement(u, {
          placeholder: "团队名称（如：储层评价团队）",
          value: J,
          onChange: (P) => D(P.target.value),
          style: { flex: 1 }
        })
      ),
      a.createElement(u.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: v,
        onChange: (P) => f(P.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(
          _,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式："
        ),
        a.createElement(b, {
          value: X,
          onChange: (P) => G(P),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" }
          ]
        })
      )
    ),
    a.createElement(V, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        _,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 选择团队成员"
      ),
      // Available agents
      te.length > 0 ? a.createElement(
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
        ...te.map(
          (P) => a.createElement(
            k,
            {
              key: P.id,
              size: "small",
              icon: ee ? a.createElement(ee) : void 0,
              onClick: () => oe(P.name)
            },
            P.name
          )
        )
      ) : null,
      // Selected members
      L.length === 0 ? a.createElement($, {
        description: "请从上方添加团队成员",
        image: $.PRESENTED_IMAGE_SIMPLE
      }) : a.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...L.map(
          (P) => a.createElement(
            "div",
            {
              key: P,
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
              a.createElement(Ue, { name: P, size: 24 }),
              a.createElement(
                _,
                { strong: !0, style: { fontSize: 13 } },
                P
              ),
              X === "coordinator" && ae === P ? a.createElement(
                x,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            a.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              X === "coordinator" ? a.createElement(
                k,
                {
                  size: "small",
                  type: "link",
                  onClick: () => w(P)
                },
                "设为协调者"
              ) : null,
              a.createElement(
                k,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: j ? a.createElement(j) : void 0,
                  onClick: () => y(P)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    a.createElement(V, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    L.length > 0 ? a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        _,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${X === "roundtable" ? "（各步独立执行）" : X === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      a.createElement(
        k,
        {
          size: "small",
          type: "dashed",
          onClick: Y,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      C.length === 0 ? a.createElement(
        _,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : a.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...C.map(
          (P, se) => a.createElement(
            "div",
            {
              key: se,
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
              X === "pipeline" ? a.createElement(
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
                `${se + 1}`
              ) : a.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              a.createElement(
                x,
                { color: "blue", style: { fontSize: 11 } },
                P.agentName
              ),
              a.createElement(
                "div",
                { style: { flex: 1 } },
                a.createElement(u, {
                  placeholder: "请输入该步骤的指令...",
                  value: P.instruction,
                  onChange: (de) => ne(se, "instruction", de.target.value),
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
              a.createElement(p, {
                size: "small",
                checked: P.passContext,
                onChange: (de) => ne(se, "passContext", de)
              }),
              a.createElement(
                _,
                { type: "secondary", style: { fontSize: 11 } },
                P.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    a.createElement(V, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    a.createElement(
      "div",
      null,
      a.createElement(
        _,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${L.length > 0 ? "4" : "3"}. 任务模板`
      ),
      a.createElement(u.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: g,
        onChange: (P) => E(P.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      a.createElement(
        _,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function kn({
  team: e,
  agents: t,
  onLaunch: s,
  onEdit: l,
  onDelete: n
}) {
  var v;
  const a = I().React, { useState: o } = a, { Card: r, Tag: c, Typography: m, Button: u, Tooltip: k } = I().antd, {
    TeamOutlined: b,
    RocketOutlined: x,
    UserOutlined: S,
    EditOutlined: p,
    DeleteOutlined: $,
    DownOutlined: M,
    UpOutlined: V
  } = I().antdIcons || {}, { Text: R, Paragraph: ee } = m, [j, N] = o(!1), O = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, _ = O[e.mode] || O.coordinator, T = e.members.map((f) => {
    const X = St(t, f.name);
    return { ...f, found: !!X, agentId: X };
  }), J = T.filter((f) => f.found).length, D = J === e.members.length, A = e.coordinatorName || ((v = e.members[0]) == null ? void 0 : v.name), h = A ? St(t, A) : null;
  return a.createElement(
    r,
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
      a.createElement(Qt, {
        members: e.members.map((f) => f.name),
        size: 36
      }),
      a.createElement(
        "div",
        { style: { flex: 1 } },
        a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          a.createElement(
            R,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? a.createElement(
            c,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        a.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          a.createElement(
            c,
            { color: _.color, style: { fontSize: 10 } },
            _.label
          ),
          a.createElement(
            c,
            { style: { fontSize: 10 } },
            `${J}/${e.members.length}`
          ),
          D ? null : a.createElement(
            c,
            { color: "orange", style: { fontSize: 10 } },
            "缺少成员"
          )
        )
      ),
      // Edit/delete for custom teams
      e.custom ? a.createElement(
        "div",
        { style: { display: "flex", gap: 2 } },
        l ? a.createElement(
          k,
          { title: "编辑" },
          a.createElement(u, {
            type: "text",
            size: "small",
            icon: p ? a.createElement(p) : void 0,
            onClick: (f) => {
              f.stopPropagation(), l(e);
            }
          })
        ) : null,
        n ? a.createElement(
          k,
          { title: "删除" },
          a.createElement(u, {
            type: "text",
            size: "small",
            danger: !0,
            icon: $ ? a.createElement($) : void 0,
            onClick: (f) => {
              f.stopPropagation(), n(e);
            }
          })
        ) : null
      ) : null
    ),
    // Description
    a.createElement(
      ee,
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
      ...T.map(
        (f) => a.createElement(
          k,
          {
            key: f.name,
            title: `${f.name}（${f.role}）${f.found ? "" : " - 未创建"}`
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
                background: f.found ? "#f0f5ff" : "#fff2f0",
                border: `1px solid ${f.found ? "#d6e4ff" : "#ffccc7"}`,
                fontSize: 11
              }
            },
            a.createElement(Ue, { name: f.name, size: 18 }),
            a.createElement(
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
    a.createElement(
      u,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (f) => {
          f.stopPropagation(), N(!j);
        },
        icon: j ? V ? a.createElement(V) : "▲" : M ? a.createElement(M) : "▼"
      },
      j ? "收起流程" : "查看执行流程"
    ),
    j ? a.createElement(Qa, { team: e }) : null,
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
        R,
        { type: "secondary", style: { fontSize: 11 } },
        A ? `协调者: ${A}` : ""
      ),
      a.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: x ? a.createElement(x) : void 0,
          disabled: !h,
          onClick: () => s(e),
          style: Re
        },
        "发起团队任务"
      )
    )
  );
}
function el({
  agents: e,
  onLaunch: t
}) {
  const s = I().React, { useMemo: l, useState: n, useCallback: a, useEffect: o } = s, {
    Row: r,
    Col: c,
    Input: m,
    Empty: u,
    Typography: k,
    Tag: b,
    Button: x,
    Divider: S,
    message: p,
    Popconfirm: $
  } = I().antd, { SearchOutlined: M, TeamOutlined: V, PlusOutlined: R, RocketOutlined: ee } = I().antdIcons || {}, { Text: j } = k, [N, O] = n(""), [_, T] = n([]), [J, D] = n(!1), [A, h] = n(null);
  o(() => {
    T(vt());
  }, []);
  const v = a(() => {
    T(vt());
  }, []), f = a(
    (C) => {
      const L = vt().filter((q) => q.id !== C.id);
      Wn(L), T(L), p.success(`团队「${C.name}」已删除`);
    },
    [p]
  ), X = a((C) => {
    h(C), D(!0);
  }, []), G = a(() => {
    h(null), D(!0);
  }, []), ae = l(() => [..._, ...Va], [_]), w = l(() => {
    if (!N.trim()) return ae;
    const C = N.toLowerCase();
    return ae.filter(
      (re) => re.name.toLowerCase().includes(C) || re.description.toLowerCase().includes(C) || re.category.toLowerCase().includes(C)
    );
  }, [ae, N]), g = w.filter((C) => C.custom), E = w.filter((C) => !C.custom);
  return s.createElement(
    "div",
    null,
    // Info banner
    s.createElement(
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
      s.createElement(
        j,
        { style: { fontSize: 13, color: "#389e0d" } },
        "多智能体协同 — 选择预设团队或创建自定义团队，支持流水线、圆桌讨论、协调者三种编排模式。"
      ),
      s.createElement(
        x,
        {
          type: "primary",
          size: "small",
          icon: R ? s.createElement(R) : void 0,
          onClick: G,
          style: Re
        },
        "创建专家团"
      )
    ),
    // Search
    s.createElement(m, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: M ? s.createElement(M) : void 0,
      value: N,
      onChange: (C) => O(C.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Custom teams section
    g.length > 0 ? s.createElement(
      "div",
      { style: { marginBottom: 20 } },
      s.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 10
          }
        },
        s.createElement("span", { style: { fontSize: 16 } }),
        s.createElement(
          j,
          { strong: !0, style: { fontSize: 14 } },
          `自定义团队 (${g.length})`
        )
      ),
      s.createElement(
        r,
        { gutter: [12, 12] },
        ...g.map(
          (C) => s.createElement(
            c,
            { key: C.id, xs: 24, sm: 12, md: 8 },
            s.createElement(kn, {
              team: C,
              agents: e,
              onLaunch: t,
              onEdit: X,
              onDelete: f
            })
          )
        )
      ),
      s.createElement(S, { style: { margin: "16px 0" } })
    ) : null,
    // Preset teams section
    E.length > 0 ? s.createElement(
      "div",
      null,
      s.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 10
          }
        },
        s.createElement("span", { style: { fontSize: 16 } }),
        s.createElement(
          j,
          { strong: !0, style: { fontSize: 14 } },
          `预设团队 (${E.length})`
        ),
        s.createElement(
          j,
          { type: "secondary", style: { fontSize: 12 } },
          "· 行业典型工作流模板"
        )
      ),
      s.createElement(
        r,
        { gutter: [12, 12] },
        ...E.map(
          (C) => s.createElement(
            c,
            { key: C.id, xs: 24, sm: 12, md: 8 },
            s.createElement(kn, {
              team: C,
              agents: e,
              onLaunch: t
            })
          )
        )
      )
    ) : null,
    // Empty state
    w.length === 0 ? s.createElement(u, {
      description: "未找到匹配的专家团队，点击「创建专家团」自定义",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : null,
    // Team Builder Modal
    s.createElement(Za, {
      open: J,
      onClose: () => {
        D(!1), h(null);
      },
      agents: e,
      editingTeam: A,
      onSaved: v
    })
  );
}
function Jn(e) {
  var s;
  const t = [];
  for (const l of e) {
    if (l.enabled === !1) continue;
    const n = (s = l.description) == null ? void 0 : s.trim();
    if (!n) continue;
    const a = (l.name || n).length > 20 ? (l.name || n).substring(0, 18) + "…" : l.name || n;
    let o = n;
    if (o = o.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(o) ? o = `请${o}` : /^(a |an |the )/i.test(o) ? o = `Help me with ${o}` : /[。？！.?!]$/.test(o) || (o = `帮我${o}`), o.length > 80 && (o = o.substring(0, 77) + "..."), t.push({ label: a, value: o }), t.length >= 4) break;
  }
  return t;
}
async function tl(e) {
  return await le("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function wt(e, t, s) {
  await le(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: s })
  });
}
async function _n(e, t) {
  const s = await xt(e);
  s.system_prompt_files = t, await le(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(s)
  });
}
async function Kt(e, t) {
  await le("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: t,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function Xn(e, t) {
  await le(`/skills/${encodeURIComponent(t)}/enable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Vt(e, t) {
  await le(`/skills/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function nl(e, t) {
  return le("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function al(e, t) {
  return le("/skills/batch-disable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function ll(e, t) {
  return le("/skills/batch-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function qt(e) {
  return await le("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Kn(e, t) {
  await le(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Ut(e, t) {
  return le("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function sl(e, t) {
  return le(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Vn(e, t) {
  await le(`/skills/${encodeURIComponent(t)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function rl(e) {
  await le(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function ol(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const s = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!s) return { number: 6, unit: "h" };
  const l = parseInt(s[1] || "0", 10), n = parseInt(s[2] || "0", 10), a = parseInt(s[3] || "0", 10), o = l * 60 + n + Math.round(a / 60);
  return o <= 0 ? { number: 6, unit: "h" } : o >= 60 && o % 60 === 0 ? { number: o / 60, unit: "h" } : { number: o, unit: "m" };
}
function il(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function cl(e) {
  return le("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function ml(e, t) {
  return le("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function dl(e) {
  await le("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function ul(e) {
  return le("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function pl(e, t) {
  return le("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function gl(e) {
  return (await le("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function fl(e, t) {
  await le("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function yl() {
  return (await le("/config/user-timezone")).timezone || "UTC";
}
async function hl(e) {
  await le("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function El(e) {
  return await le("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const Tn = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function _t({
  title: e,
  subtitle: t,
  extra: s
}) {
  const l = I().React, { Space: n } = I().antd;
  return l.createElement(
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
    l.createElement(
      "div",
      null,
      l.createElement(
        "h2",
        { style: { margin: 0, fontSize: 20, fontWeight: 600 } },
        e
      ),
      t ? l.createElement(
        "div",
        { style: { marginTop: 4, fontSize: 13, color: "#8c8c8c" } },
        t
      ) : null
    ),
    s ? l.createElement(n, null, s) : null
  );
}
function zn({
  items: e,
  max: t = 5,
  color: s = "blue",
  emptyText: l = "无"
}) {
  const n = I().React, { Tag: a } = I().antd;
  return !e || e.length === 0 ? n.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    l
  ) : n.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (o, r) => n.createElement(
        a,
        { key: r, color: s, style: { fontSize: 11, marginRight: 0 } },
        o
      )
    ),
    e.length > t ? n.createElement(
      a,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function qn({
  open: e,
  onClose: t,
  poolSkills: s,
  installedSkillNames: l,
  loading: n,
  onInstall: a
}) {
  const o = I().React, { useState: r, useEffect: c, useMemo: m } = o, { Modal: u, Button: k, Empty: b, Spin: x, Input: S, Tag: p, Tooltip: $, Typography: M } = I().antd, { CheckOutlined: V, SearchOutlined: R } = I().antdIcons || {}, { Text: ee } = M, [j, N] = r([]), [O, _] = r("");
  c(() => {
    e && (N([]), _(""));
  }, [e]);
  const T = m(() => {
    if (!O.trim()) return s;
    const h = O.toLowerCase();
    return s.filter(
      (v) => {
        var f, X;
        return v.name.toLowerCase().includes(h) || ((f = v.description) == null ? void 0 : f.toLowerCase().includes(h)) || ((X = v.tags) == null ? void 0 : X.some((G) => G.toLowerCase().includes(h)));
      }
    );
  }, [s, O]), J = T.filter(
    (h) => !l.includes(h.name)
  ), D = (h) => {
    N(
      (v) => v.includes(h) ? v.filter((f) => f !== h) : [...v, h]
    );
  }, A = async () => {
    j.length !== 0 && (await a(j), N([]));
  };
  return o.createElement(
    u,
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
          ee,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${j.length} 个技能`
        ),
        o.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          o.createElement(k, { onClick: t }, "取消"),
          o.createElement(
            k,
            {
              type: "primary",
              onClick: A,
              disabled: j.length === 0
            },
            j.length > 0 ? `添加 (${j.length})` : "添加"
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
      o.createElement(S, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: R ? o.createElement(R) : void 0,
        value: O,
        onChange: (h) => _(h.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      o.createElement(
        k,
        {
          size: "small",
          type: "primary",
          onClick: () => N(J.map((h) => h.name))
        },
        "全选"
      ),
      o.createElement(
        k,
        {
          size: "small",
          onClick: () => N([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    n ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      o.createElement(x, { size: "large" })
    ) : T.length === 0 ? o.createElement(b, {
      description: O ? "未找到匹配的技能" : "技能池暂无可用技能",
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
      ...T.map((h) => {
        const v = j.includes(h.name), f = l.includes(h.name);
        return o.createElement(
          "div",
          {
            key: h.name,
            onClick: () => !f && D(h.name),
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
          v ? o.createElement(
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
            V ? o.createElement(V) : "✓"
          ) : null,
          f ? o.createElement(
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
                paddingRight: f || v ? 24 : 0
              }
            },
            o.createElement(
              "span",
              { style: { fontSize: 16 } },
              h.emoji || "⚡"
            ),
            o.createElement(
              $,
              { title: h.name },
              o.createElement(
                ee,
                {
                  strong: !0,
                  style: {
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                h.name
              )
            )
          ),
          h.description ? o.createElement(
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
            h.description
          ) : null,
          h.tags && h.tags.length > 0 ? o.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...h.tags.slice(0, 2).map(
              (X, G) => o.createElement(
                p,
                {
                  key: G,
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
const Qe = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  gap: 4
}, Yn = { marginBottom: 16 }, Qn = {
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
}, Zn = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function vl({ agentId: e }) {
  const t = I().React, { useState: s, useEffect: l, useCallback: n } = t, {
    Switch: a,
    InputNumber: o,
    Select: r,
    Button: c,
    Spin: m,
    Space: u,
    Typography: k,
    message: b
  } = I().antd, { PlayCircleOutlined: x, SaveOutlined: S } = I().antdIcons || {}, { Text: p } = k, [$, M] = s(!0), [V, R] = s(!1), [ee, j] = s(!1), [N, O] = s(!1), [_, T] = s(6), [J, D] = s("h"), [A, h] = s("main"), [v, f] = s(300), [X, G] = s(!1), [ae, w] = s("08:00"), [g, E] = s("22:00"), C = n(async () => {
    var Y, oe;
    M(!0);
    try {
      const y = await cl(e), ne = ol(y.every ?? "6h");
      O(y.enabled ?? !1), T(ne.number), D(ne.unit), h(y.target ?? "main"), f(y.timeoutSeconds ?? 300), G(!!y.activeHours), w(((Y = y.activeHours) == null ? void 0 : Y.start) ?? "08:00"), E(((oe = y.activeHours) == null ? void 0 : oe.end) ?? "22:00");
    } catch (y) {
      b.error(y.message || "加载心跳配置失败");
    } finally {
      M(!1);
    }
  }, [e]);
  l(() => {
    C();
  }, [C]);
  const re = async () => {
    R(!0);
    try {
      await ml(e, {
        enabled: N,
        every: il({ number: _, unit: J }),
        target: A,
        timeoutSeconds: v,
        activeHours: X && ae && g ? { start: ae, end: g } : void 0
      }), b.success("心跳配置已保存");
    } catch (Y) {
      b.error(Y.message || "保存心跳配置失败");
    } finally {
      R(!1);
    }
  }, L = async () => {
    j(!0);
    try {
      await dl(e), b.success("已触发心跳检查");
    } catch (Y) {
      b.error(Y.message || "触发心跳失败");
    } finally {
      j(!1);
    }
  };
  if ($)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(m, { size: "large" })
    );
  const q = (Y, oe, y) => t.createElement(
    "div",
    { style: Yn },
    t.createElement("div", { style: Qe }, Y),
    oe,
    y ? t.createElement(
      p,
      { type: "secondary", style: Zn },
      y
    ) : null
  ), ie = (Y, oe, y, ne) => t.createElement(
    "div",
    { style: Qn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Qe }, Y),
      oe
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Qe }, y),
      ne
    )
  ), { Divider: B } = I().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: De }, "基本设置"),
    q(
      "启用心跳",
      t.createElement(a, {
        checked: N,
        onChange: (Y) => O(Y)
      }),
      N ? "已启用，专家将定期自检" : "已停用"
    ),
    ie(
      "检查频率",
      t.createElement(
        u,
        null,
        t.createElement(o, {
          min: 1,
          value: _,
          onChange: (Y) => T(Y ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(r, {
          value: J,
          onChange: (Y) => D(Y),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(r, {
        value: A,
        onChange: (Y) => h(Y),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    q(
      "超时时间 (秒)",
      t.createElement(o, {
        min: 1,
        max: 3600,
        value: v,
        onChange: (Y) => f(Y ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(B, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "活跃时段"),
    q(
      "启用活跃时段限制",
      t.createElement(a, {
        checked: X,
        onChange: (Y) => G(Y)
      }),
      "仅在指定时段内触发心跳"
    ),
    X ? ie(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: ae,
        onChange: (Y) => w(Y.target.value),
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
        onChange: (Y) => E(Y.target.value),
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
        c,
        {
          type: "primary",
          icon: S ? t.createElement(S) : void 0,
          loading: V,
          onClick: re,
          style: Re
        },
        "保存配置"
      ),
      t.createElement(
        c,
        {
          icon: x ? t.createElement(x) : void 0,
          loading: ee,
          onClick: L
        },
        "立即执行"
      )
    )
  );
}
function bl({
  agentId: e,
  onRefresh: t
}) {
  const s = I().React, { useState: l, useEffect: n, useCallback: a } = s, {
    List: o,
    Tag: r,
    Switch: c,
    Button: m,
    Empty: u,
    Spin: k,
    Typography: b,
    message: x
  } = I().antd, { PlusOutlined: S, ReloadOutlined: p, DeleteOutlined: $ } = I().antdIcons || {}, { Text: M, Paragraph: V } = b, [R, ee] = l([]), [j, N] = l(!0), [O, _] = l(!1), [T, J] = l([]), [D, A] = l(!1), h = a(async () => {
    N(!0);
    try {
      const w = await kt(e);
      ee(w);
    } catch (w) {
      x.error(w.message || "加载技能失败"), ee([]);
    } finally {
      N(!1);
    }
  }, [e]);
  n(() => {
    h();
  }, [h]);
  const v = async () => {
    _(!0), A(!0);
    try {
      const w = await Jt(!0);
      J(w);
    } catch (w) {
      x.error(w.message || "加载技能池失败");
    } finally {
      A(!1);
    }
  }, f = async (w) => {
    let g = 0, E = 0;
    for (const C of w)
      try {
        await Kt(e, C), g++;
      } catch {
        E++;
      }
    g > 0 ? (x.success(
      `成功添加 ${g} 个技能${E > 0 ? `，${E} 个失败` : ""}`
    ), h(), t()) : E > 0 && x.error("添加技能失败"), _(!1);
  }, X = async (w, g) => {
    try {
      g ? await Xn(e, w.name) : await Vn(e, w.name), x.success(g ? "已启用" : "已停用"), h(), t();
    } catch (E) {
      x.error(E.message || "操作失败");
    }
  }, G = async (w) => {
    try {
      await Vt(e, w), x.success(`技能「${w}」已移除`), h(), t();
    } catch (g) {
      x.error(g.message || "移除技能失败");
    }
  };
  if (j)
    return s.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      s.createElement(k, { size: "large" })
    );
  const ae = R.filter((w) => w.enabled !== !1);
  return s.createElement(
    "div",
    null,
    s.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12
        }
      },
      s.createElement(
        M,
        { strong: !0 },
        `技能列表 (${R.length}，已启用 ${ae.length})`
      ),
      s.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        s.createElement(
          m,
          {
            size: "small",
            icon: p ? s.createElement(p) : void 0,
            onClick: () => {
              nt(), h();
            }
          },
          "刷新"
        ),
        s.createElement(
          m,
          {
            type: "primary",
            size: "small",
            icon: S ? s.createElement(S) : void 0,
            onClick: v,
            style: Re
          },
          "从技能池添加"
        )
      )
    ),
    R.length === 0 ? s.createElement(u, {
      description: "该专家暂无技能",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : s.createElement(o, {
      dataSource: R,
      renderItem: (w) => s.createElement(
        o.Item,
        {
          actions: [
            s.createElement(c, {
              key: "toggle",
              size: "small",
              checked: w.enabled !== !1,
              onChange: (g) => X(w, g)
            }),
            s.createElement(
              m,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: $ ? s.createElement($) : void 0,
                onClick: () => G(w.name)
              },
              "移除"
            )
          ]
        },
        s.createElement(
          "div",
          { style: { width: "100%" } },
          s.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4
              }
            },
            w.emoji ? s.createElement(
              "span",
              { style: { fontSize: 16 } },
              w.emoji
            ) : null,
            s.createElement(M, { strong: !0 }, w.name),
            w.version_text ? s.createElement(
              r,
              { style: { fontSize: 10 } },
              `v${w.version_text}`
            ) : null
          ),
          w.description ? s.createElement(
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
    s.createElement(qn, {
      open: O,
      onClose: () => _(!1),
      poolSkills: T,
      installedSkillNames: R.map((w) => w.name),
      loading: D,
      onInstall: f
    })
  );
}
function Sl({
  agentId: e,
  onRefresh: t,
  isActive: s
}) {
  const l = I().React, { useState: n, useEffect: a, useCallback: o } = l, {
    List: r,
    Tag: c,
    Button: m,
    Empty: u,
    Spin: k,
    Modal: b,
    Input: x,
    Typography: S,
    message: p
  } = I().antd, { PlusOutlined: $, ReloadOutlined: M, DeleteOutlined: V } = I().antdIcons || {}, { Text: R, Paragraph: ee } = S, { TextArea: j } = x, [N, O] = n([]), [_, T] = n(!0), [J, D] = n(!1), [A, h] = n(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [v, f] = n(!1), X = o(async () => {
    T(!0);
    try {
      const g = await qt(e);
      O(g);
    } catch (g) {
      p.error(g.message || "加载 MCP 失败"), O([]);
    } finally {
      T(!1);
    }
  }, [e]);
  a(() => {
    X();
  }, [X]), a(() => {
    s && X();
  }, [s, X]);
  const G = async (g) => {
    try {
      await sl(e, g), p.success("已切换 MCP 状态"), X(), t();
    } catch (E) {
      p.error(E.message || "切换失败");
    }
  }, ae = async (g) => {
    try {
      await Kn(e, g), p.success(`MCP「${g}」已移除`), X(), t();
    } catch (E) {
      p.error(E.message || "移除 MCP 失败");
    }
  }, w = async () => {
    f(!0);
    try {
      const g = JSON.parse(A), E = g.mcpServers || g, C = Object.entries(E);
      if (C.length === 0) {
        p.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [re, L] of C) {
        const q = L, ie = q.url ? "streamable_http" : "stdio";
        await Ut(e, {
          client_key: re,
          client: {
            name: q.name || re,
            description: q.description || "",
            enabled: !0,
            transport: ie,
            url: q.url || "",
            command: q.command || "",
            args: q.args || [],
            env: q.env || {},
            cwd: q.cwd || "",
            headers: q.headers || {}
          }
        });
      }
      p.success("MCP 客户端已创建"), D(!1), X(), t();
    } catch (g) {
      g instanceof SyntaxError ? p.error("JSON 格式错误：" + g.message) : p.error(g.message || "创建 MCP 失败");
    } finally {
      f(!1);
    }
  };
  return _ ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(k, { size: "large" })
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
      l.createElement(R, { strong: !0 }, `MCP 客户端 (${N.length})`),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        l.createElement(
          m,
          {
            size: "small",
            icon: M ? l.createElement(M) : void 0,
            onClick: () => {
              nt(), X();
            }
          },
          "刷新"
        ),
        l.createElement(
          m,
          {
            type: "primary",
            size: "small",
            icon: $ ? l.createElement($) : void 0,
            onClick: () => D(!0),
            style: Re
          },
          "添加 MCP"
        )
      )
    ),
    N.length === 0 ? l.createElement(u, {
      description: "该专家暂无 MCP 客户端",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(r, {
      dataSource: N,
      renderItem: (g) => l.createElement(
        r.Item,
        {
          actions: [
            l.createElement(
              m,
              {
                key: "toggle",
                size: "small",
                onClick: () => G(g.key)
              },
              g.enabled ? "停用" : "启用"
            ),
            l.createElement(
              m,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: V ? l.createElement(V) : void 0,
                onClick: () => ae(g.key)
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
            l.createElement("span", { style: { fontSize: 14 } }, "🔌"),
            l.createElement(R, { strong: !0 }, g.name || g.key),
            l.createElement(
              c,
              {
                color: g.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              g.enabled ? "启用" : "停用"
            ),
            l.createElement(
              c,
              { color: "purple", style: { fontSize: 10 } },
              g.transport
            )
          ),
          g.description ? l.createElement(
            ee,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            g.description
          ) : null,
          g.tools && g.tools.length > 0 ? l.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "#8c8c8c" } },
            `提供 ${g.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    l.createElement(
      b,
      {
        open: J,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => D(!1),
        onOk: w,
        confirmLoading: v,
        okText: "创建",
        width: 560
      },
      l.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      l.createElement(j, {
        value: A,
        onChange: (g) => h(g.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function wl({ agentId: e }) {
  const t = I().React, { useState: s, useEffect: l, useCallback: n, useRef: a } = t, {
    Card: o,
    InputNumber: r,
    Input: c,
    Select: m,
    Switch: u,
    Button: k,
    Spin: b,
    Space: x,
    Typography: S,
    Divider: p,
    message: $
  } = I().antd, { SaveOutlined: M } = I().antdIcons || {}, { Text: V } = S, [R, ee] = s(!0), [j, N] = s(!1), O = a(null), [_, T] = s(60), [J, D] = s(""), [A, h] = s(!0), [v, f] = s(30), [X, G] = s("zh"), [ae, w] = s("UTC"), [g, E] = s(!0), [C, re] = s(100), [L, q] = s(!0), [ie, B] = s(3), [Y, oe] = s(1), [y, ne] = s(!0), [d, te] = s(3), [P, se] = s(2), [de, he] = s(60), [fe, ue] = s(1), [K, W] = s(0), [z, F] = s(1), [ce, H] = s(0), [pe, Ee] = s(30), [Ce, ze] = s(50), [$e, Ge] = s("light"), [dt, at] = s("scroll"), [Le, lt] = s("remelight"), [ut, Xe] = s("AUTO"), Ie = n(async () => {
    var Z, ke, Se, Pe, rt, ot;
    ee(!0);
    try {
      const [ve, pt, It] = await Promise.all([
        ul(e),
        gl(e).catch(() => "zh"),
        yl().catch(() => "UTC")
      ]);
      O.current = ve, T(ve.shell_command_timeout ?? 60), D(ve.shell_command_executable ?? "");
      const it = ve.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      h(it.enabled ?? !0), f(it.timeout_seconds ?? 30), G(pt), w(It);
      const He = ve.loop ?? {};
      E(((Z = He.iteration) == null ? void 0 : Z.enabled) ?? !0), re(((ke = He.iteration) == null ? void 0 : ke.max_iterations) ?? ve.max_iters ?? 100), q(((Se = He.doom_loop) == null ? void 0 : Se.enabled) ?? !0), B(((Pe = He.doom_loop) == null ? void 0 : Pe.window_size) ?? 3), oe(((rt = He.doom_loop) == null ? void 0 : rt.similarity_threshold) ?? 1), ne(ve.llm_retry_enabled ?? !0), te(ve.llm_max_retries ?? 3), se(ve.llm_backoff_base ?? 2), he(ve.llm_backoff_cap ?? 60), ue(ve.llm_max_concurrent ?? 1), W(ve.llm_max_qpm ?? 0), F(ve.llm_rate_limit_pause ?? 1), H(ve.llm_rate_limit_jitter ?? 0), Ee(ve.llm_acquire_timeout ?? 30), ze(ve.history_max_length ?? 50), Ge(ve.context_manager_backend ?? "light"), at(((ot = ve.light_context_config) == null ? void 0 : ot.strategy) ?? "scroll"), lt(ve.memory_manager_backend ?? "remelight"), Xe(ve.approval_level ?? "AUTO");
    } catch (ve) {
      $.error(ve.message || "加载运行配置失败");
    } finally {
      ee(!1);
    }
  }, [e]);
  l(() => {
    Ie();
  }, [Ie]);
  const st = async () => {
    var ke, Se;
    const Z = O.current;
    if (Z) {
      N(!0);
      try {
        const Pe = {
          ...Z,
          max_iters: C,
          loop: {
            ...Z.loop ?? {},
            iteration: { enabled: g, max_iterations: C },
            doom_loop: {
              enabled: L,
              window_size: ie,
              similarity_threshold: Y,
              stages: ((Se = (ke = Z.loop) == null ? void 0 : ke.doom_loop) == null ? void 0 : Se.stages) ?? []
            }
          },
          shell_command_timeout: _,
          shell_command_executable: J,
          auto_title_config: {
            enabled: A,
            timeout_seconds: v
          },
          llm_retry_enabled: y,
          llm_max_retries: d,
          llm_backoff_base: P,
          llm_backoff_cap: de,
          llm_max_concurrent: fe,
          llm_max_qpm: K,
          llm_rate_limit_pause: z,
          llm_rate_limit_jitter: ce,
          llm_acquire_timeout: pe,
          history_max_length: Ce,
          context_manager_backend: $e,
          light_context_config: {
            ...Z.light_context_config ?? {},
            strategy: dt
          },
          memory_manager_backend: Le,
          approval_level: ut
        };
        await pl(e, Pe), O.current = Pe, X && await fl(e, X).catch(() => {
        }), ae && await hl(ae).catch(() => {
        }), $.success("运行配置已保存");
      } catch (Pe) {
        $.error(Pe.message || "保存运行配置失败");
      } finally {
        N(!1);
      }
    }
  };
  if (R)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(b, { size: "large" })
    );
  const Oe = (Z, ke, Se) => t.createElement(
    "div",
    { style: Yn },
    t.createElement("div", { style: Qe }, Z),
    ke,
    Se ? t.createElement(
      V,
      { type: "secondary", style: Zn },
      Se
    ) : null
  ), Te = (Z, ke, Se, Pe) => t.createElement(
    "div",
    { style: Qn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Qe }, Z),
      ke
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Qe }, Se),
      Pe
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
    Te(
      "Shell 命令超时 (秒)",
      t.createElement(r, {
        min: 1,
        value: _,
        onChange: (Z) => T(Z ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(c, {
        value: J,
        onChange: (Z) => D(Z.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    Te(
      "语言",
      t.createElement(m, {
        value: X,
        onChange: (Z) => G(Z),
        style: { width: "100%" },
        options: [
          { value: "zh", label: "中文" },
          { value: "en", label: "English" },
          { value: "id", label: "Bahasa Indonesia" },
          { value: "ru", label: "Русский" }
        ]
      }),
      "时区",
      t.createElement(m, {
        value: ae,
        onChange: (Z) => w(Z),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (Z, ke) => {
          var Se;
          return (((Se = ke == null ? void 0 : ke.label) == null ? void 0 : Se.toString()) || "").toLowerCase().includes(Z.toLowerCase());
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
        ].map((Z) => ({ value: Z, label: Z }))
      })
    ),
    Te(
      "自动生成会话标题",
      t.createElement(x, null, t.createElement(u, {
        checked: A,
        onChange: (Z) => h(Z)
      })),
      "标题生成超时 (秒)",
      t.createElement(r, {
        min: 5,
        value: v,
        onChange: (Z) => f(Z ?? 30),
        style: { width: "100%" },
        disabled: !A
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(p, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "审批级别"),
    Oe(
      "工具执行审批",
      t.createElement(m, {
        value: ut,
        onChange: (Z) => Xe(Z),
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
    Oe(
      "启用迭代限制",
      t.createElement(u, {
        checked: g,
        onChange: (Z) => E(Z)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    g ? Oe(
      "最大迭代次数",
      t.createElement(r, {
        min: 1,
        max: 500,
        value: C,
        onChange: (Z) => re(Z ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    Oe(
      "启用重复循环保护",
      t.createElement(u, {
        checked: L,
        onChange: (Z) => q(Z)
      }),
      "检测并阻止重复操作循环"
    ),
    L ? Te(
      "检测窗口大小",
      t.createElement(r, {
        min: 2,
        max: 20,
        value: ie,
        onChange: (Z) => B(Z ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(r, {
        min: 0,
        max: 1,
        step: 0.05,
        value: Y,
        onChange: (Z) => oe(Z ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(p, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "LLM 重试"),
    Oe(
      "启用 LLM 重试",
      t.createElement(u, {
        checked: y,
        onChange: (Z) => ne(Z)
      })
    ),
    Te(
      "最大重试次数",
      t.createElement(r, {
        min: 1,
        value: d,
        onChange: (Z) => te(Z ?? 3),
        style: { width: "100%" },
        disabled: !y
      }),
      "退避基数 (秒)",
      t.createElement(r, {
        min: 0.1,
        step: 0.1,
        value: P,
        onChange: (Z) => se(Z ?? 2),
        style: { width: "100%" },
        disabled: !y
      })
    ),
    Oe(
      "退避上限 (秒)",
      t.createElement(r, {
        min: 0.5,
        step: 0.5,
        value: de,
        onChange: (Z) => he(Z ?? 60),
        style: { width: 200 },
        disabled: !y
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(p, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "LLM 限流"),
    Te(
      "最大并发数",
      t.createElement(r, {
        min: 1,
        value: fe,
        onChange: (Z) => ue(Z ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(r, {
        min: 0,
        step: 10,
        value: K,
        onChange: (Z) => W(Z ?? 0),
        style: { width: "100%" }
      })
    ),
    Te(
      "限流暂停时间 (秒)",
      t.createElement(r, {
        min: 1,
        step: 0.5,
        value: z,
        onChange: (Z) => F(Z ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(r, {
        min: 0,
        step: 0.5,
        value: ce,
        onChange: (Z) => H(Z ?? 0),
        style: { width: "100%" }
      })
    ),
    Oe(
      "获取超时 (秒)",
      t.createElement(r, {
        min: 10,
        step: 10,
        value: pe,
        onChange: (Z) => Ee(Z ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(p, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "上下文与记忆"),
    Te(
      "上下文管理后端",
      t.createElement(m, {
        value: $e,
        onChange: (Z) => Ge(Z),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(m, {
        value: dt,
        onChange: (Z) => at(Z),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    Te(
      "记忆管理后端",
      t.createElement(m, {
        value: Le,
        onChange: (Z) => lt(Z),
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
        value: Ce,
        onChange: (Z) => ze(Z ?? 50),
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
          loading: j,
          onClick: st,
          style: Re
        },
        "保存运行配置"
      )
    )
  );
}
function Cl({
  expert: e,
  open: t,
  onClose: s,
  onRefresh: l
}) {
  const n = I().React, { useState: a, useEffect: o, useCallback: r } = n, { Modal: c, Tabs: m, Spin: u, Typography: k } = I().antd, { SettingOutlined: b } = I().antdIcons || {}, { Text: x } = k, [S, p] = a([]), [$, M] = a(!1), [V, R] = a("heartbeat"), ee = r(async () => {
    if (e) {
      M(!0);
      try {
        const _ = await El(e.agent.id);
        p(_);
      } catch {
        p([]);
      } finally {
        M(!1);
      }
    }
  }, [e]);
  if (o(() => {
    t && e && ee();
  }, [t, e, ee]), !e) return null;
  const { agent: j } = e, N = () => {
    ee(), l();
  }, O = [
    {
      key: "heartbeat",
      label: "心跳",
      children: n.createElement(vl, {
        agentId: j.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: $ ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        n.createElement(u, { size: "large" })
      ) : n.createElement(ea, {
        agentId: j.id,
        systemPromptFiles: S,
        onRefresh: N
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((_) => _.enabled !== !1).length})`,
      children: n.createElement(bl, {
        agentId: j.id,
        onRefresh: l
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: n.createElement(Sl, {
        agentId: j.id,
        onRefresh: l,
        isActive: V === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: n.createElement(wl, {
        agentId: j.id
      })
    }
  ];
  return n.createElement(
    c,
    {
      open: t,
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        b ? n.createElement(b, { style: { fontSize: 18 } }) : null,
        n.createElement("span", null, `配置 - ${j.name}`),
        n.createElement(
          x,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          j.id
        )
      ),
      onCancel: s,
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
    n.createElement(m, {
      items: O,
      activeKey: V,
      onChange: (_) => R(_),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
function xl({
  expert: e,
  onClick: t,
  onSummon: s,
  onConfigure: l
}) {
  const n = I().React, { Card: a, Tag: o, Badge: r, Typography: c, Spin: m, Button: u, Tooltip: k } = I().antd, { Text: b } = c, { ThunderboltOutlined: x, SettingOutlined: S } = I().antdIcons || {}, { agent: p, skills: $, mcps: M, loading: V } = e, R = p.enabled, ee = $.filter((O) => O.enabled !== !1).map((O) => O.name), j = M.map((O) => O.name || O.key), N = p.active_model ? `${p.active_model.provider_id}/${p.active_model.model}` : null;
  return n.createElement(
    a,
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
        n.createElement(Ue, { name: p.name, size: 36 }),
        n.createElement(
          "div",
          null,
          n.createElement(
            b,
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
      Xt(p.description, n)
    ) : n.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    N ? n.createElement(
      "div",
      { style: { marginBottom: 8 } },
      n.createElement(
        o,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${N}`
      )
    ) : null,
    // Skills
    V ? n.createElement(m, { size: "small" }) : n.createElement(
      "div",
      { style: { marginBottom: 6 } },
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${ee.length})`
      ),
      n.createElement(zn, {
        items: ee,
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
      n.createElement(zn, {
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
        k,
        { title: "配置专家", placement: "top" },
        n.createElement(
          u,
          {
            type: "text",
            size: "small",
            icon: S ? n.createElement(S, {
              style: { fontSize: 16, color: "#8c8c8c" }
            }) : void 0,
            onClick: (O) => {
              O.stopPropagation(), l && l();
            }
          }
        )
      ),
      // Summon button (bottom-right)
      n.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: x ? n.createElement(x) : void 0,
          disabled: !R,
          onClick: (O) => {
            O.stopPropagation(), s && s();
          },
          style: Re
        },
        "召唤专家"
      )
    )
  );
}
function kl({
  expert: e,
  open: t,
  onClose: s,
  onRefresh: l
}) {
  const n = I().React, {
    Drawer: a,
    Descriptions: o,
    Tag: r,
    Typography: c,
    Space: m,
    Button: u,
    Empty: k,
    Tabs: b,
    List: x,
    Spin: S,
    Modal: p,
    message: $
  } = I().antd, { Text: M, Paragraph: V } = c, {
    EditOutlined: R,
    ThunderboltOutlined: ee,
    FileTextOutlined: j,
    ToolOutlined: N,
    PlusOutlined: O
  } = I().antdIcons || {}, [_, T] = n.useState(!1), [J, D] = n.useState(
    []
  ), [A, h] = n.useState(!1);
  if (!e) return null;
  const { agent: v, config: f, skills: X, mcps: G, loading: ae } = e, w = X.filter((y) => y.enabled !== !1), g = (y) => {
    window.history.pushState({}, "", y), window.dispatchEvent(new PopStateEvent("popstate"));
  }, E = n.createElement(
    "div",
    null,
    n.createElement(
      o,
      { column: 1, bordered: !0, size: "small" },
      n.createElement(o.Item, { label: "专家名称" }, v.name),
      n.createElement(
        o.Item,
        { label: "专家 ID" },
        n.createElement("code", { style: { fontSize: 12 } }, v.id)
      ),
      n.createElement(
        o.Item,
        { label: "状态" },
        n.createElement(
          r,
          { color: v.enabled ? "green" : "default" },
          v.enabled ? "启用" : "停用"
        )
      ),
      n.createElement(
        o.Item,
        { label: "功能简介" },
        v.description ? Xt(v.description, n) : "暂无描述"
      ),
      n.createElement(
        o.Item,
        { label: "使用模型" },
        v.active_model ? `${v.active_model.provider_id} / ${v.active_model.model}` : "使用全局默认模型"
      ),
      f != null && f.workspace_dir ? n.createElement(
        o.Item,
        { label: "工作区路径" },
        n.createElement(
          "code",
          { style: { fontSize: 11 } },
          f.workspace_dir
        )
      ) : null,
      f != null && f.approval_level ? n.createElement(
        o.Item,
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
        m,
        { wrap: !0 },
        ...f.system_prompt_files.map(
          (y, ne) => n.createElement(
            r,
            {
              key: ne,
              icon: j ? n.createElement(j) : void 0,
              style: { fontSize: 12 }
            },
            y
          )
        )
      )
    ) : null
  ), C = async () => {
    T(!0), h(!0);
    try {
      const y = await Jt(!0);
      D(y);
    } catch (y) {
      $.error(y.message || "加载技能池失败");
    } finally {
      h(!1);
    }
  }, re = async (y) => {
    let ne = 0, d = 0;
    for (const te of y)
      try {
        await Kt(v.id, te), ne++;
      } catch {
        d++;
      }
    ne > 0 ? ($.success(
      `成功添加 ${ne} 个技能${d > 0 ? `，${d} 个失败` : ""}`
    ), l()) : d > 0 && $.error("添加技能失败"), T(!1);
  }, L = async (y) => {
    try {
      await Vt(v.id, y), $.success(`技能「${y}」已移除`), l();
    } catch (ne) {
      $.error(ne.message || "移除技能失败");
    }
  }, q = async (y) => {
    try {
      await Kn(v.id, y), $.success(`MCP「${y}」已移除`), l();
    } catch (ne) {
      $.error(ne.message || "移除 MCP 失败");
    }
  }, ie = ae ? n.createElement(
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
        u,
        {
          type: "primary",
          size: "small",
          icon: O ? n.createElement(O) : void 0,
          onClick: C
        },
        "从技能池添加"
      )
    ),
    w.length === 0 ? n.createElement(k, {
      description: "该专家暂无已启用的技能",
      image: k.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(x, {
      dataSource: w,
      renderItem: (y) => n.createElement(
        x.Item,
        {
          actions: [
            n.createElement(
              u,
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
              (ne, d) => n.createElement(
                r,
                {
                  key: d,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                ne
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    n.createElement(qn, {
      open: _,
      onClose: () => T(!1),
      poolSkills: J,
      installedSkillNames: w.map((y) => y.name),
      loading: A,
      onInstall: re
    })
  ), B = ae ? n.createElement(
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
        `MCP 客户端 (${G.length})`
      ),
      n.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: O ? n.createElement(O) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${v.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    G.length === 0 ? n.createElement(k, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: k.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(x, {
      dataSource: G,
      renderItem: (y) => n.createElement(
        x.Item,
        {
          actions: [
            n.createElement(
              u,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => q(y.key)
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
  ), Y = f != null && f.tools ? n.createElement(
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
        N ? n.createElement(N, {
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
  ) : n.createElement(k, {
    description: "暂无工具配置",
    image: k.PRESENTED_IMAGE_SIMPLE
  }), oe = [
    { key: "basic", label: "基本信息", children: E },
    {
      key: "skills",
      label: `技能 (${w.length})`,
      children: ie
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: n.createElement(zl, {
        skills: w,
        agentId: v.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: n.createElement(ea, {
        agentId: v.id,
        systemPromptFiles: (f == null ? void 0 : f.system_prompt_files) || [],
        onRefresh: () => l()
      })
    },
    { key: "mcp", label: `MCP (${G.length})`, children: B },
    { key: "tools", label: "工具配置", children: Y }
  ];
  return n.createElement(
    a,
    {
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        n.createElement(Ue, { name: v.name, size: 28 }),
        n.createElement("span", null, v.name)
      ),
      open: t,
      onClose: s,
      width: 560,
      extra: n.createElement(
        m,
        null,
        n.createElement(
          u,
          {
            size: "small",
            icon: R ? n.createElement(R) : void 0,
            onClick: () => {
              s();
              try {
                const y = I();
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
          u,
          {
            type: "primary",
            size: "small",
            icon: ee ? n.createElement(ee) : void 0,
            onClick: () => {
              s();
              try {
                const y = I();
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
    n.createElement(b, {
      items: oe,
      defaultActiveKey: "basic"
    })
  );
}
function _l({
  open: e,
  onClose: t,
  onCreated: s
}) {
  const l = I().React, { useState: n } = l, {
    Modal: a,
    Card: o,
    Tag: r,
    Input: c,
    Row: m,
    Col: u,
    Spin: k,
    message: b,
    Typography: x
  } = I().antd, { Text: S } = x, { FileAddOutlined: p } = I().antdIcons || {}, [$, M] = n(!1), [V, R] = n(""), [ee, j] = n(!1), N = async (T, J) => {
    M(!0);
    try {
      const D = await le("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: T || "新专家",
          description: J || "",
          skill_names: []
        })
      });
      await wt(
        D.id,
        "AGENTS.md",
        `# ${T || "新专家"}

请在此处编写该专家的系统提示词。
`
      ), b.success("专家「" + (T || "新专家") + "」创建成功"), j(!1), setTimeout(() => {
        t(), s();
      }, 0);
    } catch (D) {
      b.error(D.message || "创建专家失败");
    } finally {
      M(!1);
    }
  }, O = Ka.filter((T) => {
    if (!V.trim()) return !0;
    const J = V.toLowerCase();
    return T.name.toLowerCase().includes(J) || T.description.toLowerCase().includes(J) || T.category.toLowerCase().includes(J);
  }), _ = async (T) => {
    M(!0);
    try {
      const J = await le("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: T.name,
          description: T.description,
          skill_names: T.recommended_skills
        })
      });
      await wt(J.id, "AGENTS.md", T.system_prompt);
      const D = await xt(J.id);
      D.approval_level = T.approval_level, await le(`/agents/${encodeURIComponent(J.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(D)
      }), b.success(`专家「${T.name}」创建成功`), t(), s();
    } catch (J) {
      b.error(J.message || "创建专家失败");
    } finally {
      M(!1);
    }
  };
  return l.createElement(
    l.Fragment,
    null,
    l.createElement(
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
      l.createElement(
        "div",
        { style: { marginBottom: 16 } },
        l.createElement(c, {
          placeholder: "搜索模板名称或类别...",
          value: V,
          onChange: (T) => R(T.target.value),
          allowClear: !0
        })
      ),
      $ ? l.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        l.createElement(k, { size: "large" }),
        l.createElement(
          "div",
          { style: { marginTop: 12, color: "#8c8c8c" } },
          "正在创建专家..."
        )
      ) : l.createElement(
        m,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        V.trim() ? null : l.createElement(
          u,
          { xs: 24, sm: 12 },
          l.createElement(
            o,
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
            l.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 8
                }
              },
              l.createElement(
                "span",
                { style: { fontSize: 28, color: "#8c8c8c" } },
                p ? l.createElement(p) : "📝"
              ),
              l.createElement(
                "div",
                { style: { flex: 1 } },
                l.createElement(
                  S,
                  { strong: !0, style: { fontSize: 15 } },
                  "从空白模版开始创建"
                ),
                l.createElement(
                  "div",
                  null,
                  l.createElement(
                    r,
                    { color: "default", style: { fontSize: 10 } },
                    "空白"
                  )
                )
              )
            ),
            l.createElement(
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
        ...O.map(
          (T) => l.createElement(
            u,
            { key: T.id, xs: 24, sm: 12 },
            l.createElement(
              o,
              {
                hoverable: !0,
                size: "small",
                onClick: () => _(T),
                style: { cursor: "pointer", height: "100%" }
              },
              l.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 8
                  }
                },
                l.createElement(Ue, {
                  name: T.name,
                  size: 40
                }),
                l.createElement(
                  "div",
                  { style: { flex: 1 } },
                  l.createElement(
                    S,
                    { strong: !0, style: { fontSize: 15 } },
                    T.name
                  ),
                  l.createElement(
                    "div",
                    null,
                    l.createElement(
                      r,
                      { color: "blue", style: { fontSize: 10 } },
                      T.category
                    ),
                    T.approval_level === "MANUAL" ? l.createElement(
                      r,
                      { color: "orange", style: { fontSize: 10 } },
                      "需审批"
                    ) : null
                  )
                )
              ),
              l.createElement(
                "div",
                {
                  style: {
                    fontSize: 12,
                    color: "#595959",
                    lineHeight: 1.5
                  }
                },
                Xt(T.description, l)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    l.createElement(Tl, {
      open: ee,
      onCancel: () => j(!1),
      onCreate: N
    })
  );
}
function Tl({
  open: e,
  onCancel: t,
  onCreate: s
}) {
  const l = I().React, { useState: n, useEffect: a } = l, { Modal: o, Input: r, message: c } = I().antd, [m, u] = n(""), [k, b] = n(""), [x, S] = n(!1);
  return a(() => {
    e && (u(""), b(""), S(!1));
  }, [e]), l.createElement(
    o,
    {
      open: e,
      title: "从空白模版创建专家",
      onCancel: t,
      onOk: () => {
        if (!m.trim()) {
          c.warning("请输入专家名称");
          return;
        }
        S(!0), Promise.resolve(s(m.trim(), k.trim())).finally(() => {
          S(!1);
        });
      },
      okText: "创建",
      cancelText: "取消",
      okButtonProps: { loading: x },
      maskClosable: !0,
      keyboard: !0
    },
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        "div",
        { style: { fontSize: 13, marginBottom: 6, color: "#595959" } },
        "专家名称"
      ),
      l.createElement(r, {
        placeholder: "输入专家名称",
        value: m,
        onChange: (p) => u(p.target.value),
        maxLength: 50
      })
    ),
    l.createElement(
      "div",
      null,
      l.createElement(
        "div",
        { style: { fontSize: 13, marginBottom: 6, color: "#595959" } },
        "专家描述（可选）"
      ),
      l.createElement(r.TextArea, {
        placeholder: "简要描述该专家的职责和能力...",
        value: k,
        onChange: (p) => b(p.target.value),
        rows: 3,
        maxLength: 200
      })
    )
  );
}
function ea({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: s
}) {
  const l = I().React, { useState: n, useEffect: a, useCallback: o } = l, {
    List: r,
    Tag: c,
    Switch: m,
    Button: u,
    Modal: k,
    Input: b,
    Spin: x,
    Empty: S,
    message: p,
    Typography: $
  } = I().antd, { FileTextOutlined: M, PlusOutlined: V, EditOutlined: R, ReloadOutlined: ee } = I().antdIcons || {}, { Text: j } = $, [N, O] = n([]), [_, T] = n(!0), [J, D] = n(
    t || []
  ), [A, h] = n(!1), [v, f] = n(null), [X, G] = n(""), [ae, w] = n(""), [g, E] = n(!1), C = o(async () => {
    T(!0);
    try {
      const B = await tl(e);
      O(B);
    } catch (B) {
      p.error(B.message || "加载记忆文件失败"), O([]);
    } finally {
      T(!1);
    }
  }, [e]);
  a(() => {
    C();
  }, [C]), a(() => {
    D(t || []);
  }, [t]);
  const re = async (B, Y) => {
    const oe = new Set(J);
    if (Y)
      oe.add(B);
    else {
      if (Tn.includes(B) && B === "AGENTS.md") {
        p.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      oe.delete(B);
    }
    const y = Array.from(oe);
    D(y);
    try {
      await _n(e, y), p.success(Y ? "已启用记忆文件" : "已停用记忆文件"), s();
    } catch (ne) {
      p.error(ne.message || "更新失败"), D(t || []);
    }
  }, L = async (B) => {
    try {
      const Y = await le(
        `/workspace/files/${encodeURIComponent(B)}`,
        { headers: { "X-Agent-Id": e } }
      );
      f(B), G(Y.content || ""), h(!0);
    } catch (Y) {
      p.error(Y.message || "读取文件失败");
    }
  }, q = () => {
    f(null), G(""), w(""), h(!0);
  }, ie = async () => {
    const B = v || ae.trim();
    if (!B) {
      p.warning("请输入文件名");
      return;
    }
    const Y = B.endsWith(".md") ? B : `${B}.md`;
    E(!0);
    try {
      if (await wt(e, Y, X), !v && !J.includes(Y)) {
        const oe = [...J, Y];
        D(oe), await _n(e, oe);
      }
      p.success("保存成功"), h(!1), C(), s();
    } catch (oe) {
      p.error(oe.message || "保存失败");
    } finally {
      E(!1);
    }
  };
  return _ ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(x, { size: "large" })
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
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        M ? l.createElement(M, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        l.createElement(
          j,
          { strong: !0 },
          `记忆文件 (${N.length})`
        ),
        l.createElement(
          j,
          { type: "secondary", style: { fontSize: 12 } },
          `· 已挂载 ${J.length} 个到专家记忆`
        )
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        l.createElement(
          u,
          {
            size: "small",
            icon: ee ? l.createElement(ee) : void 0,
            onClick: C
          },
          "刷新"
        ),
        l.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: V ? l.createElement(V) : void 0,
            onClick: q
          },
          "新建记忆文件"
        )
      )
    ),
    N.length === 0 ? l.createElement(S, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: S.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(r, {
      dataSource: N,
      renderItem: (B) => {
        const Y = J.includes(B.filename), oe = Tn.includes(B.filename);
        return l.createElement(
          r.Item,
          {
            actions: [
              l.createElement(
                u,
                {
                  type: "link",
                  size: "small",
                  icon: R ? l.createElement(R) : void 0,
                  onClick: () => L(B.filename)
                },
                "编辑"
              )
            ]
          },
          l.createElement(r.Item.Meta, {
            avatar: l.createElement(M, {
              style: {
                fontSize: 20,
                color: Y ? "#1677ff" : "#bfbfbf"
              }
            }),
            title: l.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              l.createElement(j, null, B.filename),
              oe ? l.createElement(
                c,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : l.createElement(
                c,
                { color: "cyan", style: { fontSize: 10 } },
                "记忆库"
              )
            ),
            description: l.createElement(
              "div",
              { style: { fontSize: 12 } },
              `${(B.size / 1024).toFixed(1)} KB · 修改于 ${new Date(B.modified_time).toLocaleString()}`
            )
          }),
          l.createElement(m, {
            checked: Y,
            size: "small",
            onChange: (y) => re(B.filename, y)
          })
        );
      }
    }),
    // Edit/New file modal
    l.createElement(
      k,
      {
        open: A,
        onCancel: () => h(!1),
        title: v ? `编辑 ${v}` : "新建记忆文件",
        width: 700,
        onOk: ie,
        confirmLoading: g,
        okText: "保存"
      },
      v ? null : l.createElement(
        "div",
        { style: { marginBottom: 12 } },
        l.createElement(b, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: ae,
          onChange: (B) => w(B.target.value),
          addonAfter: ae.endsWith(".md") ? "" : ".md"
        })
      ),
      l.createElement(b.TextArea, {
        value: X,
        onChange: (B) => G(B.target.value),
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
function zl({
  skills: e,
  agentId: t
}) {
  const s = I().React, { useMemo: l } = s, {
    List: n,
    Tag: a,
    Typography: o,
    Empty: r,
    Button: c,
    message: m
  } = I().antd, { ThunderboltOutlined: u, CopyOutlined: k } = I().antdIcons || {}, { Text: b } = o, x = l(() => Jn(e), [e]), S = ($) => {
    try {
      const M = I();
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
      m.success("已复制到剪贴板");
    });
  };
  return x.length === 0 ? s.createElement(r, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: r.PRESENTED_IMAGE_SIMPLE
  }) : s.createElement(
    "div",
    null,
    s.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12
        }
      },
      u ? s.createElement(u, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      s.createElement(
        b,
        { strong: !0 },
        `推荐提问 (${x.length})`
      ),
      s.createElement(
        b,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    s.createElement(n, {
      dataSource: x,
      renderItem: ($, M) => s.createElement(
        n.Item,
        {
          actions: [
            s.createElement(
              c,
              {
                type: "link",
                size: "small",
                icon: k ? s.createElement(k) : void 0,
                onClick: () => p($)
              },
              "复制"
            )
          ]
        },
        s.createElement(n.Item.Meta, {
          avatar: s.createElement(
            a,
            { color: "blue", style: { borderRadius: "50%" } },
            `${M + 1}`
          ),
          title: s.createElement(
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
          description: s.createElement(
            b,
            { type: "secondary", style: { fontSize: 12 } },
            $.label
          )
        })
      )
    })
  );
}
function Il() {
  var ce;
  const e = I().React, { useState: t, useEffect: s, useCallback: l, useMemo: n } = e, {
    Spin: a,
    Empty: o,
    Input: r,
    Button: c,
    message: m,
    Row: u,
    Col: k,
    Tabs: b,
    Modal: x,
    Typography: S
  } = I().antd, {
    ReloadOutlined: p,
    PlusOutlined: $,
    SearchOutlined: M,
    TeamOutlined: V,
    UserOutlined: R
  } = I().antdIcons || {}, { Text: ee, Paragraph: j } = S, [N, O] = t([]), [_, T] = t(!0), [J, D] = t(!1), [A, h] = t(null), [v, f] = t(""), [X, G] = t(!1), [ae, w] = t("experts"), [g, E] = t(
    null
  ), [C, re] = t(""), [L, q] = t(!1), [ie, B] = t(!1), [Y, oe] = t(null), [y, ne] = t([]), d = l(async () => {
    T(!0);
    try {
      const H = await Wt(), pe = await Promise.all(
        H.map(async (Ee) => {
          try {
            const [Ce, ze, $e] = await Promise.all([
              xt(Ee.id).catch(() => null),
              kt(Ee.id).catch(() => []),
              qt(Ee.id).catch(() => [])
            ]);
            return {
              agent: Ee,
              config: Ce,
              skills: ze,
              mcps: $e,
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
      O(pe), ne(H);
    } catch (H) {
      m.error(H.message || "加载专家列表失败"), O([]);
    } finally {
      T(!1);
    }
  }, []);
  s(() => {
    d();
  }, [d]), s(() => {
    if (Y && ie) {
      const H = N.find(
        (pe) => pe.agent.id === Y.agent.id
      );
      H && H !== Y && oe(H);
    }
  }, [N, Y, ie]);
  const te = l(
    async (H) => {
      var ze;
      const pe = H.coordinatorName || ((ze = H.members[0]) == null ? void 0 : ze.name);
      if (!pe) {
        m.error("无法确定协调者专家");
        return;
      }
      const Ee = St(y, pe);
      if (!Ee) {
        m.error(`未找到协调者专家「${pe}」，请先创建该专家`);
        return;
      }
      if (/\{.+?\}/.test(H.taskTemplate)) {
        re(""), E(H);
        return;
      }
      await P(H, Ee, H.taskTemplate);
    },
    [y, m]
  ), P = l(
    async (H, pe, Ee) => {
      var Ce;
      q(!0);
      try {
        const ze = Ya(H), $e = Ee ? ze.replace(H.taskTemplate, Ee) : ze, Ge = I();
        Ge.setSelectedAgent && Ge.setSelectedAgent(pe), await qa(pe, $e), m.success(
          `团队任务已发起，协调者：${H.coordinatorName || ((Ce = H.members[0]) == null ? void 0 : Ce.name)}`
        ), E(null), se("/chat");
      } catch (ze) {
        m.error(ze.message || "发起团队任务失败");
      } finally {
        q(!1);
      }
    },
    [m]
  ), se = (H) => {
    window.history.pushState({}, "", H), window.dispatchEvent(new PopStateEvent("popstate"));
  }, de = l((H) => {
    h(H), D(!0);
  }, []), he = l((H) => {
    oe(H), B(!0);
  }, []), fe = l(
    (H) => {
      if (!H.agent.enabled) {
        m.warning(`专家「${H.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const pe = I();
        pe.setSelectedAgent && pe.setSelectedAgent(H.agent.id);
      } catch (pe) {
        console.warn("[ugsci] Failed to set selected agent:", pe);
      }
      m.success(`已召唤专家「${H.agent.name}」，正在跳转至对话...`), se("/chat");
    },
    [m]
  ), ue = n(() => {
    if (!v.trim()) return N;
    const H = v.toLowerCase();
    return N.filter(
      (pe) => {
        var Ee;
        return pe.agent.name.toLowerCase().includes(H) || ((Ee = pe.agent.description) == null ? void 0 : Ee.toLowerCase().includes(H)) || pe.agent.id.toLowerCase().includes(H) || pe.skills.some((Ce) => Ce.name.toLowerCase().includes(H));
      }
    );
  }, [N, v]), K = N.filter((H) => H.agent.enabled).length, W = N.reduce(
    (H, pe) => H + pe.skills.filter((Ee) => Ee.enabled !== !1).length,
    0
  ), z = N.reduce((H, pe) => H + pe.mcps.length, 0), F = [
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
            onChange: (H) => f(H.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        _ ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(a, { size: "large" })
        ) : ue.length === 0 ? e.createElement(o, {
          description: v ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          u,
          { gutter: [12, 12], align: "stretch" },
          ...ue.map(
            (H) => e.createElement(
              k,
              {
                key: H.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(xl, {
                expert: H,
                onClick: () => de(H),
                onSummon: () => fe(H),
                onConfigure: () => he(H)
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
      children: e.createElement(el, {
        agents: y,
        onLaunch: te
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(_t, {
      title: "专家",
      subtitle: `共 ${N.length} 位专家（${K} 位启用）· ${W} 个技能 · ${z} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          c,
          {
            icon: p ? e.createElement(p) : void 0,
            onClick: () => {
              nt(), d();
            },
            loading: _
          },
          "刷新"
        ),
        e.createElement(
          c,
          {
            type: "primary",
            icon: $ ? e.createElement($) : void 0,
            onClick: () => G(!0),
            style: Re
          },
          "创建专家"
        )
      )
    }),
    e.createElement(b, {
      items: F,
      activeKey: ae,
      onChange: (H) => w(H)
    }),
    // Drawer
    e.createElement(kl, {
      expert: A,
      open: J,
      onClose: () => D(!1),
      onRefresh: () => d()
    }),
    // Template Modal
    e.createElement(_l, {
      open: X,
      onClose: () => G(!1),
      onCreated: () => d()
    }),
    // Config Modal (gear icon)
    e.createElement(Cl, {
      expert: Y,
      open: ie,
      onClose: () => B(!1),
      onRefresh: () => d()
    }),
    // Team Launch Modal (for filling placeholders)
    g ? e.createElement(
      x,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(Qt, {
            members: g.members.map((H) => H.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${g.name}`
          )
        ),
        onCancel: () => E(null),
        onOk: () => {
          var Ce;
          const H = g.coordinatorName || ((Ce = g.members[0]) == null ? void 0 : Ce.name), pe = H ? St(y, H) : null;
          if (!pe) {
            m.error("无法找到协调者专家");
            return;
          }
          let Ee = g.taskTemplate;
          C.trim() && (Ee = C.trim()), P(g, pe, Ee);
        },
        confirmLoading: L,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          ee,
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
          ee,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "输入具体任务描述（替换上面的占位符内容）："
        ),
        e.createElement(r.TextArea, {
          value: C,
          onChange: (H) => re(H.target.value),
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
          ee,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${g.coordinatorName || ((ce = g.members[0]) == null ? void 0 : ce.name) || "—"} · 成员: ${g.members.map((H) => H.name).join("、")}`
        )
      )
    ) : null
  );
}
const ta = [
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
], Pl = {
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
function We(e) {
  return (e || "").trim() || "channel";
}
function Ze(e) {
  return (e || "").trim();
}
function na(e) {
  const t = Ze(e);
  return t === "" || t === "*";
}
function Tt(e) {
  return e === "user" ? "user" : "all";
}
function Fe(e) {
  const t = Tt(e.subject_type);
  return {
    source_type: We(e.source_type),
    source_value: Ze(e.source_value),
    subject_type: t,
    subject_value: t === "all" ? "" : (e.subject_value || "").trim(),
    effect: e.effect
  };
}
function et(e) {
  return { tool_name: e.tool_name || "*", ...Fe(e) };
}
function aa(e) {
  return { tool_name: e.tool_name || "*", effect: e.effect };
}
function la(e) {
  return [...e].map(Fe).sort(
    (t, s) => t.source_type.localeCompare(s.source_type) || t.source_value.localeCompare(s.source_value) || t.subject_type.localeCompare(s.subject_type) || t.subject_value.localeCompare(s.subject_value)
  );
}
function Ct(e) {
  return [...e].map(et).sort(
    (t, s) => t.tool_name.localeCompare(s.tool_name) || t.source_type.localeCompare(s.source_type) || t.source_value.localeCompare(s.source_value) || t.subject_type.localeCompare(s.subject_type) || t.subject_value.localeCompare(s.subject_value)
  );
}
function sa(e) {
  return [...e].map(aa).sort((t, s) => t.tool_name.localeCompare(s.tool_name));
}
function Ne(e) {
  return {
    default_effect: e.default_effect || "deny",
    client_overrides: la(e.client_overrides || []),
    tool_defaults: sa(e.tool_defaults || []),
    tool_overrides: Ct(e.tool_overrides || []),
    unmanaged_rules_count: e.unmanaged_rules_count || 0
  };
}
function je(e) {
  return [We(e.source_type), Ze(e.source_value), Tt(e.subject_type), e.subject_type === "all" ? "" : (e.subject_value || "").trim()].join("\0");
}
function Be(e) {
  return [e.tool_name || "*", We(e.source_type), Ze(e.source_value), Tt(e.subject_type), e.subject_type === "all" ? "" : (e.subject_value || "").trim()].join("\0");
}
function Ol(e, t) {
  const s = Ne(t), l = /* @__PURE__ */ new Map();
  s.tool_overrides.forEach((m) => {
    const u = et(m), k = l.get(u.tool_name) || [];
    k.push(u), l.set(u.tool_name, k);
  });
  const n = new Map(s.tool_defaults.map((m) => [m.tool_name, aa(m)])), a = new Set(e.map((m) => m.name)), o = e.map((m) => {
    var u;
    return {
      toolName: m.name,
      description: m.description,
      inputSchema: m.input_schema,
      stale: !1,
      defaultEffect: ((u = n.get(m.name)) == null ? void 0 : u.effect) || s.default_effect,
      hasExplicitDefault: n.has(m.name),
      rules: Ct(l.get(m.name) || [])
    };
  }), r = /* @__PURE__ */ new Set([...l.keys(), ...n.keys()]), c = Array.from(r).filter((m) => m !== "*" && !a.has(m)).map((m) => {
    var u;
    return {
      toolName: m,
      description: "",
      inputSchema: {},
      stale: !0,
      defaultEffect: ((u = n.get(m)) == null ? void 0 : u.effect) || s.default_effect,
      hasExplicitDefault: n.has(m),
      rules: Ct(l.get(m) || [])
    };
  });
  return [...o, ...c];
}
function ra(e, t) {
  const s = Ne(e), l = new Set(
    t === null ? s.client_overrides.map((n) => je(Fe(n))) : s.tool_overrides.filter((n) => n.tool_name === t).map((n) => Be(et(n)))
  );
  for (const n of ta) {
    const a = t === null ? je({ source_type: "channel", source_value: n, subject_type: "all", subject_value: "" }) : Be({ tool_name: t, source_type: "channel", source_value: n, subject_type: "all", subject_value: "" });
    if (!l.has(a)) return n;
  }
  return "console";
}
function Al(e) {
  return Nt(e, { source_type: "channel", source_value: ra(e, null), subject_type: "all", subject_value: "", effect: "ask" });
}
function $l(e, t) {
  return Dt(e, { tool_name: t, source_type: "channel", source_value: ra(e, t), subject_type: "all", subject_value: "", effect: "ask" });
}
function Nt(e, t, s) {
  const l = Ne(e), n = Fe(t), a = je(s || n), o = je(n), r = l.client_overrides.filter((c) => {
    const m = je(Fe(c));
    return m !== a && m !== o;
  });
  return r.push(n), { ...l, client_overrides: la(r) };
}
function Dt(e, t, s) {
  const l = Ne(e), n = et(t), a = Be(s || n), o = Be(n), r = l.tool_overrides.filter((c) => {
    const m = Be(et(c));
    return m !== a && m !== o;
  });
  return r.push(n), { ...l, tool_overrides: Ct(r) };
}
function Ml(e, t, s) {
  const l = Ne(e), n = l.tool_defaults.filter((a) => a.tool_name !== t);
  return n.push({ tool_name: t, effect: s }), { ...l, tool_defaults: sa(n) };
}
function Rl(e, t) {
  const s = Ne(e), l = je(t);
  return { ...s, client_overrides: s.client_overrides.filter((n) => je(Fe(n)) !== l) };
}
function Ll(e, t) {
  const s = Ne(e), l = Be(t);
  return { ...s, tool_overrides: s.tool_overrides.filter((n) => Be(et(n)) !== l) };
}
function oa(e, t) {
  const s = We(t.source_type), l = Ze(t.source_value);
  if (na(l)) return [];
  const n = /* @__PURE__ */ new Map();
  return e.forEach((a) => {
    if (We(a.source_type) !== s || Ze(a.source_value) !== l) return;
    const o = (a.subject_value || "").trim();
    !o || n.has(o) || n.set(o, a);
  }), Array.from(n.values());
}
function jl(e, t) {
  return oa(e, t).map((s) => ({ label: s.subject_value, value: s.subject_value }));
}
function Yt(e) {
  return We(e.source_type) === "channel" && na(e.source_value) && Tt(e.subject_type) === "user" && !!(e.subject_value || "").trim();
}
function Bl(e, t) {
  const s = Fe(t);
  return s.subject_type === "user" && !!s.subject_value && s.subject_value !== "*" && e.some((l) => We(l.source_type) === s.source_type) && !Yt(s) && !oa(e, s).some((l) => l.subject_value === s.subject_value);
}
function Ul(e) {
  const t = [...e.client_overrides || [], ...e.tool_overrides || []];
  for (const s of t) {
    const l = Fe(s);
    if (l.subject_type === "user") {
      if (!l.subject_value || l.subject_value === "*" || !l.source_value) return { reason: "missingUserValue", rule: s };
      if (Yt(l)) return { reason: "ambiguousUserSource", rule: s };
    }
  }
  return null;
}
function In(e, t) {
  const s = { ...e, ...t };
  return t.subject_type && (s.subject_value = ""), (t.source_type !== void 0 || t.source_value !== void 0) && t.subject_value === void 0 && s.subject_type === "user" && (s.subject_value = ""), s;
}
function jt(e) {
  return JSON.stringify(Ne(e));
}
function Nl({
  client: e,
  agentId: t,
  open: s,
  onClose: l,
  onSave: n
}) {
  const a = I().React, { useState: o, useEffect: r, useMemo: c, useCallback: m } = a, { Modal: u, Spin: k, Empty: b, Button: x, Tag: S, Segmented: p, Select: $, Input: M, AutoComplete: V, Typography: R, message: ee } = I().antd, { PlusOutlined: j, DeleteOutlined: N } = I().antdIcons || {}, { Text: O } = R, [_, T] = o(null), [J, D] = o([]), [A, h] = o([]), [v, f] = o(!1), [X, G] = o(!1), [ae, w] = o(""), [g, E] = o("");
  r(() => {
    if (!s) return;
    let d = !1;
    return (async () => {
      f(!0), D([]), h([]), w("");
      try {
        const P = await Na(t, e.key);
        if (!d) {
          const se = Ne(P);
          T(se), E(jt(se));
        }
        try {
          const se = await Fa(t);
          d || h(se);
        } catch {
          d || h([]);
        }
        if (!e.enabled) {
          d || w("MCP 客户端未启用，无法获取工具列表");
          return;
        }
        try {
          const se = await Ua(t, e.key);
          d || D(se);
        } catch (se) {
          d || w((se == null ? void 0 : se.message) || "无法加载工具列表");
        }
      } catch {
        d || (T(null), E(""), w("加载访问策略失败"));
      } finally {
        d || f(!1);
      }
    })(), () => {
      d = !0;
    };
  }, [s, e.key, e.enabled, t]);
  const C = c(() => _ ? Ol(J, _) : [], [J, _]), re = c(() => !!(_ && jt(_) !== g), [_, g]), L = (d) => Pl[d] || d, q = m((d) => {
    T((te) => te && { ...te, default_effect: d });
  }, []), ie = m((d, te) => {
    T((P) => P && Nt(P, In(d, te), { source_type: d.source_type, source_value: d.source_value, subject_type: d.subject_type, subject_value: d.subject_value }));
  }, []), B = m((d, te) => {
    T((P) => P && Dt(P, In(d, te), { tool_name: d.tool_name, source_type: d.source_type, source_value: d.source_value, subject_type: d.subject_type, subject_value: d.subject_value }));
  }, []), Y = m(async () => {
    if (!_) return;
    const d = Ul(_);
    if (d) {
      ee.error(d.reason === "missingUserValue" ? "用户规则缺少用户标识" : "用户来源不明确");
      return;
    }
    G(!0);
    try {
      await n(e.key, _) && (E(jt(_)), l());
    } finally {
      G(!1);
    }
  }, [_, e.key, n, l, ee]), oe = m(() => {
    if (!re || X) {
      l();
      return;
    }
    u.confirm({
      title: "放弃修改",
      content: "确定要放弃未保存的修改吗？",
      okText: "确认",
      cancelText: "取消",
      onOk: l
    });
  }, [re, X, l]), y = m((d, te) => {
    const P = jl(A, d), se = Yt(d), de = Bl(A, d), he = [{ label: "所有渠道", value: "*" }, ...ta.map((F) => ({ label: L(F), value: F }))], fe = [{ label: "所有人", value: "all" }, { label: "指定用户", value: "user" }], ue = te ? B : ie, K = (F) => {
      T(te ? (ce) => ce && Dt(ce, { ...d, effect: F }) : (ce) => ce && Nt(ce, { ...d, effect: F }));
    }, W = () => {
      T(te ? (F) => F && Ll(F, { tool_name: d.tool_name, source_type: d.source_type, source_value: d.source_value, subject_type: d.subject_type, subject_value: d.subject_value }) : (F) => F && Rl(F, { source_type: d.source_type, source_value: d.source_value, subject_type: d.subject_type, subject_value: d.subject_value }));
    }, z = te ? Be(d) : je(d);
    return a.createElement(
      "div",
      { key: z, style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto", gap: 6, alignItems: "end", padding: "6px 0", borderBottom: "1px solid #f5f5f5" } },
      // source_type
      a.createElement(
        "div",
        null,
        a.createElement(O, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源类型"),
        a.createElement($, {
          size: "small",
          style: { width: "100%" },
          value: d.source_type || "channel",
          onChange: (F) => ue(d, { source_type: F, source_value: F === "channel" ? d.source_value || "*" : d.source_value }),
          options: [{ label: "渠道", value: "channel" }, ...d.source_type && d.source_type !== "channel" ? [{ label: d.source_type, value: d.source_type }] : []]
        })
      ),
      // source_value
      a.createElement(
        "div",
        null,
        a.createElement(O, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源"),
        d.source_type === "channel" ? a.createElement($, { size: "small", style: { width: "100%" }, value: d.source_value || "*", onChange: (F) => ue(d, { source_value: F }), options: he }) : a.createElement(M, { size: "small", placeholder: "来源标识", value: d.source_value, onChange: (F) => ue(d, { source_value: F.target.value }) })
      ),
      // subject_type
      a.createElement(
        "div",
        null,
        a.createElement(O, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "对象类型"),
        a.createElement($, { size: "small", style: { width: "100%" }, value: d.subject_type, onChange: (F) => ue(d, { subject_type: F }), options: fe })
      ),
      // subject_value
      a.createElement(
        "div",
        null,
        a.createElement(O, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "对象"),
        d.subject_type === "user" ? a.createElement(
          "div",
          null,
          a.createElement(V, {
            size: "small",
            style: { width: "100%" },
            value: d.subject_value,
            options: P,
            placeholder: P.length > 0 ? "用户 ID" : "无近期用户",
            onChange: (F) => ue(d, { subject_value: F }),
            onSelect: (F) => ue(d, { subject_value: F }),
            filterOption: (F, ce) => String((ce == null ? void 0 : ce.value) || "").toLowerCase().includes(F.toLowerCase())
          }),
          se ? a.createElement(O, { style: { fontSize: 10, color: "#fa8c16", display: "block" } }, "请先选择具体渠道") : null,
          de ? a.createElement(O, { style: { fontSize: 10, color: "#fa8c16", display: "block" } }, "未知的用户标识") : null
        ) : a.createElement(M, { size: "small", disabled: !0, value: "所有人" })
      ),
      // effect
      a.createElement(
        "div",
        null,
        a.createElement(O, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "效果"),
        a.createElement($, {
          size: "small",
          style: { width: "100%" },
          value: d.effect,
          onChange: (F) => K(F),
          options: [{ label: "允许", value: "allow" }, { label: "询问", value: "ask" }, { label: "拒绝", value: "deny" }]
        })
      ),
      // delete
      a.createElement(x, { size: "small", type: "text", icon: a.createElement(N), onClick: W, title: "删除规则" })
    );
  }, [A, ie, B]), ne = (d, te) => {
    const se = {
      ask: { bg: "rgba(245,158,11,0.24)", border: "rgba(217,119,6,0.36)", text: "#8a4b00" },
      allow: { bg: "rgba(34,197,94,0.22)", border: "rgba(22,163,74,0.35)", text: "#17643a" },
      deny: { bg: "rgba(239,68,68,0.2)", border: "rgba(220,38,38,0.34)", text: "#9f1f26" }
    }[d];
    return a.createElement(p, {
      size: "small",
      value: d,
      onChange: (de) => te(de),
      style: { "--mcp-policy-segment-bg": se.bg, "--mcp-policy-segment-border": se.border, "--mcp-policy-segment-text": se.text },
      options: [{ label: "询问", value: "ask" }, { label: "允许", value: "allow" }, { label: "拒绝", value: "deny" }]
    });
  };
  return a.createElement(
    u,
    {
      title: `${e.name || e.key} - 工具与访问策略`,
      open: s,
      onCancel: oe,
      width: "min(1040px, calc(100vw - 32px))",
      styles: {
        body: {
          maxHeight: "min(520px, calc(100vh - 280px))",
          overflowY: "auto",
          overflowX: "hidden"
        }
      },
      footer: a.createElement(
        "div",
        { style: { textAlign: "right" } },
        a.createElement(x, { onClick: oe, style: { marginRight: 8 } }, "取消"),
        a.createElement(x, { type: "primary", onClick: Y, loading: X, disabled: !_ || v }, "保存")
      )
    },
    v && !_ ? a.createElement("div", { style: { textAlign: "center", padding: 40 } }, a.createElement(k)) : _ ? a.createElement(
      "div",
      null,
      // ── Client-level panel ──
      a.createElement(
        "div",
        { style: { marginBottom: 16, padding: "12px 16px", background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" } },
        a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
          a.createElement(O, { strong: !0 }, "客户端访问策略"),
          a.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 8 } },
            a.createElement(O, { style: { fontSize: 12, color: "#666" } }, "默认:"),
            ne(_.default_effect, q),
            a.createElement(x, { size: "small", icon: a.createElement(j), onClick: () => T((d) => d && Al(d)) }, "添加规则")
          )
        ),
        _.client_overrides.length === 0 ? a.createElement(O, { style: { fontSize: 12, color: "#999" } }, "暂无客户端级覆盖规则") : a.createElement("div", null, ..._.client_overrides.map((d) => y(d, !1)))
      ),
      // ── Error message ──
      ae ? a.createElement("div", { style: { color: "#ff4d4f", fontSize: 12, marginBottom: 8 } }, ae) : null,
      // ── Tool-level panel ──
      a.createElement(O, { strong: !0, style: { display: "block", marginBottom: 8 } }, "工具访问策略"),
      C.length === 0 ? a.createElement(b, { description: "暂无工具" }) : a.createElement(
        "div",
        null,
        ...C.map(
          (d) => a.createElement(
            "div",
            { key: d.toolName, style: { marginBottom: 12, padding: "10px 12px", background: "#fafafa", borderRadius: 6, border: "1px solid #f0f0f0" } },
            a.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 } },
              a.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 6 } },
                a.createElement(S, { color: d.stale ? "default" : "blue" }, d.toolName),
                d.stale ? a.createElement(S, { color: "orange" }, "已失效") : null
              ),
              a.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                a.createElement(O, { style: { fontSize: 12, color: "#666" } }, "默认:"),
                ne(d.defaultEffect, (te) => T((P) => P && Ml(P, d.toolName, te))),
                a.createElement(x, { size: "small", icon: a.createElement(j), onClick: () => T((te) => te && $l(te, d.toolName)) }, "添加规则")
              )
            ),
            // Tool schema
            d.description || d.inputSchema && Object.keys(d.inputSchema).length > 0 ? a.createElement(
              "details",
              { style: { marginBottom: 6, fontSize: 12 } },
              a.createElement("summary", { style: { cursor: "pointer", color: "#888" } }, "工具详情"),
              d.description ? a.createElement("div", { style: { padding: "4px 0", color: "#666" } }, d.description) : null,
              d.inputSchema && Object.keys(d.inputSchema).length > 0 ? a.createElement("pre", { style: { background: "#f5f5f5", padding: 8, borderRadius: 4, fontSize: 11, overflow: "auto", maxHeight: 200 } }, JSON.stringify(d.inputSchema, null, 2)) : null
            ) : null,
            // Tool rules
            d.rules.length === 0 ? a.createElement(O, { style: { fontSize: 12, color: "#999" } }, "暂无工具级覆盖规则") : a.createElement("div", null, ...d.rules.map((te) => y(te, !0)))
          )
        )
      )
    ) : a.createElement("div", { style: { color: "#ff4d4f" } }, "加载访问策略失败")
  );
}
function Dl({
  client: e,
  agentId: t,
  open: s,
  onClose: l,
  onAuthChanged: n
}) {
  var G, ae, w, g, E;
  const a = I().React, { useState: o, useCallback: r, useEffect: c } = a, { Modal: m, Button: u, Input: k, Typography: b, message: x } = I().antd, { Text: S } = b, [p, $] = o("idle"), [M, V] = o(""), [R, ee] = o(!1), [j, N] = o(((G = e.oauth_status) == null ? void 0 : G.client_id) || ""), [O, _] = o(((ae = e.oauth_status) == null ? void 0 : ae.scope) || ""), [T, J] = o(""), [D, A] = o("");
  c(() => {
    if (p !== "waiting") return;
    const C = setInterval(async () => {
      try {
        (await Ha(t, e.key)).authorized && ($("success"), n());
      } catch {
      }
    }, 2e3);
    return () => clearInterval(C);
  }, [p, e.key, t, n]);
  const h = p === "success" || p === "idle" && ((w = e.oauth_status) == null ? void 0 : w.authorized) === !0, v = p === "idle" && ((g = e.oauth_status) == null ? void 0 : g.authorized) && e.oauth_status.expires_at > 0 && e.oauth_status.expires_at < Date.now() / 1e3, f = r(async () => {
    var C;
    if (!((C = e.url) != null && C.trim())) {
      V("缺少 URL");
      return;
    }
    $("starting"), V("");
    try {
      const re = await Ga(t, e.key, {
        url: e.url,
        scope: O,
        client_id: j,
        auth_endpoint: T,
        token_endpoint: D
      });
      $("waiting"), window.open(re.auth_url, "_blank", "popup,width=600,height=700");
    } catch (re) {
      $("error"), V((re == null ? void 0 : re.message) || "OAuth 启动失败");
    }
  }, [t, e.key, e.url, O, j, T, D]), X = r(async () => {
    $("revoking");
    try {
      await Wa(t, e.key), $("idle"), n();
    } catch {
      $("idle");
    }
  }, [t, e.key, n]);
  return a.createElement(
    m,
    {
      title: `${e.name || e.key} — OAuth 授权管理`,
      open: s,
      onCancel: l,
      footer: a.createElement("div", { style: { textAlign: "right" } }, a.createElement(u, { onClick: l }, "关闭")),
      width: 560
    },
    a.createElement(
      "div",
      { style: { background: "#f8f9fa", border: "1px solid #e9ecef", borderRadius: 8, padding: "12px 14px" } },
      // Status
      a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 } },
        a.createElement(
          "span",
          { style: { fontSize: 12, padding: "2px 8px", borderRadius: 12, border: "1px solid", color: v ? "#e67e22" : h ? "#27ae60" : "#7f8c8d", borderColor: v ? "#e67e22" : h ? "#27ae60" : "#7f8c8d", background: "white" } },
          v ? "已过期" : h ? "已授权" : p === "waiting" ? "等待授权..." : p === "error" ? "授权失败" : "未授权"
        ),
        a.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          h || v ? a.createElement(u, { size: "small", onClick: X, loading: p === "revoking" }, "撤销") : null,
          a.createElement(u, { size: "small", type: h && !v ? "default" : "primary", onClick: f, loading: p === "starting" || p === "waiting", disabled: !((E = e.url) != null && E.trim()) }, h && !v ? "重新授权" : "授权")
        )
      ),
      M ? a.createElement("p", { style: { color: "#c0392b", fontSize: 12 } }, M) : null,
      // Advanced
      a.createElement(
        "div",
        { style: { marginTop: 8, cursor: "pointer", color: "#888", fontSize: 12 }, onClick: () => ee((C) => !C) },
        R ? "收起高级设置" : "展开高级设置"
      ),
      R ? a.createElement(
        "div",
        { style: { marginTop: 8, padding: "10px 12px", background: "white", borderRadius: 6, border: "1px solid #e9ecef" } },
        a.createElement(S, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2 } }, "Client ID"),
        a.createElement(k, { size: "small", placeholder: "留空则使用动态注册", value: j, onChange: (C) => N(C.target.value) }),
        a.createElement(S, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "Scope"),
        a.createElement(k, { size: "small", placeholder: "OAuth scope", value: O, onChange: (C) => _(C.target.value) }),
        a.createElement(S, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "授权端点"),
        a.createElement(k, { size: "small", placeholder: "https://auth.example.com/authorize", value: T, onChange: (C) => J(C.target.value) }),
        a.createElement(S, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "令牌端点"),
        a.createElement(k, { size: "small", placeholder: "https://auth.example.com/token", value: D, onChange: (C) => A(C.target.value) })
      ) : null
    )
  );
}
function Fl({
  mcp: e,
  agentId: t,
  onToggle: s,
  onDelete: l,
  onUpdate: n,
  onUpdatePolicy: a,
  onRefresh: o
}) {
  const r = I().React, { useState: c } = r, { Card: m, Tag: u, Tooltip: k, Modal: b, Input: x, Button: S, Typography: p } = I().antd, { Text: $ } = p, {
    EyeOutlined: M,
    EyeInvisibleOutlined: V,
    DeleteOutlined: R,
    ToolOutlined: ee
  } = I().antdIcons || {}, [j, N] = c(!1), [O, _] = c(!1), [T, J] = c(!1), [D, A] = c(""), [h, v] = c(!1), [f, X] = c(!1), G = e.transport === "streamable_http" || e.transport === "sse", ae = G ? "Remote" : "Local", w = e.oauth_status, g = Date.now() / 1e3, E = !!(w != null && w.authorized) && w.expires_at > g, C = !!(w != null && w.authorized) && w.expires_at <= g, re = !!w, L = () => {
    A(JSON.stringify(e, null, 2)), v(!1), N(!0);
  }, q = async () => {
    try {
      const B = JSON.parse(D), Y = [
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
      ], oe = {};
      for (const ne of Y)
        ne in B && (oe[ne] = B[ne]);
      await n(e.key, oe) && (N(!1), v(!1));
    } catch {
      alert("JSON 格式错误");
    }
  }, ie = JSON.stringify(e, null, 2);
  return r.createElement(
    r.Fragment,
    null,
    r.createElement(
      m,
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
            k,
            { title: e.name },
            r.createElement($, { strong: !0, style: { fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, e.name || e.key)
          ),
          r.createElement(
            "span",
            { style: { fontSize: 10, padding: "1px 6px", borderRadius: 4, background: G ? "#e6f4ff" : "#f9f0ff", color: G ? "#1677ff" : "#722ed1", flexShrink: 0 } },
            ae
          ),
          // OAuth status icons
          re && C ? r.createElement("span", { style: { fontSize: 11, color: "#e67e22", flexShrink: 0 } }, "⚠") : null,
          re && E ? r.createElement("span", { style: { fontSize: 11, color: "#27ae60", flexShrink: 0 } }, "✓") : null,
          re && !E && !C ? r.createElement("span", { style: { fontSize: 11, color: "#7f8c8d", flexShrink: 0 } }, "🔒") : null
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
            icon: ee ? r.createElement(ee) : void 0,
            onClick: (B) => {
              B.stopPropagation(), J(!0);
            },
            style: { width: "100%" }
          },
          "工具与访问策略"
        ),
        // Secondary actions: oauth (remote only) + toggle + delete
        r.createElement(
          "div",
          { style: { display: "grid", gridTemplateColumns: G ? "1fr 1fr 1fr" : "1fr 1fr", gap: 8 } },
          G ? r.createElement(
            S,
            {
              size: "small",
              onClick: (B) => {
                B.stopPropagation(), X(!0);
              },
              style: {
                color: E ? "#27ae60" : C ? "#e67e22" : void 0,
                borderColor: E ? "#27ae60" : C ? "#e67e22" : void 0,
                background: E ? "rgba(39,174,96,0.06)" : C ? "rgba(230,126,34,0.06)" : void 0
              }
            },
            E ? "已授权" : C ? "已过期" : "授权"
          ) : null,
          r.createElement(
            S,
            {
              size: "small",
              icon: e.enabled ? V ? r.createElement(V) : void 0 : M ? r.createElement(M) : void 0,
              onClick: s
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
                B.stopPropagation(), _(!0);
              }
            },
            "删除"
          )
        )
      )
    ),
    // ── Delete Confirmation Modal ──
    r.createElement(
      b,
      {
        title: "确认删除",
        open: O,
        onOk: () => {
          _(!1), l();
        },
        onCancel: () => _(!1),
        okText: "确认删除",
        cancelText: "取消",
        okButtonProps: { danger: !0 }
      },
      r.createElement("p", null, `确定要删除 MCP 客户端「${e.name || e.key}」吗？此操作不可撤销。`)
    ),
    // ── JSON Config Modal (click card to view/edit) ──
    r.createElement(
      b,
      {
        title: `${e.name || e.key} - 配置`,
        open: j,
        onCancel: () => {
          N(!1), v(!1);
        },
        footer: r.createElement(
          "div",
          { style: { textAlign: "right" } },
          r.createElement(S, { onClick: () => {
            N(!1), v(!1);
          }, style: { marginRight: 8 } }, "取消"),
          h ? r.createElement(S, { type: "primary", onClick: q }, "保存") : r.createElement(S, { type: "primary", onClick: () => v(!0) }, "编辑")
        ),
        width: 700
      },
      r.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "密钥类字段（如 API_KEY）可能已被后端脱敏，保存时不会覆盖脱敏值。"
      ),
      h ? r.createElement(x.TextArea, {
        value: D,
        onChange: (B) => A(B.target.value),
        autoSize: { minRows: 15, maxRows: 25 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      }) : r.createElement(
        "pre",
        { style: { backgroundColor: "#f5f5f5", padding: 16, borderRadius: 8, maxHeight: 400, overflow: "auto", fontSize: 13, fontFamily: "Monaco, Courier New, monospace" } },
        ie
      )
    ),
    // ── Access Modal (tools + access policy) ──
    r.createElement(Nl, {
      client: e,
      agentId: t,
      open: T,
      onClose: () => J(!1),
      onSave: a
    }),
    // ── OAuth Modal (remote clients only) ──
    G ? r.createElement(Dl, {
      client: e,
      agentId: t,
      open: f,
      onClose: () => X(!1),
      onAuthChanged: async () => {
        await (o == null ? void 0 : o());
      }
    }) : null
  );
}
const Ft = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, ia = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, ca = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function ma(e) {
  return tt(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
function Pn(e) {
  return tt(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function On(e) {
  const t = e.map(encodeURIComponent).join(",");
  return tt(`/ugsci/avatar/team/${t}`);
}
function Ue({
  name: e,
  size: t = 32,
  borderRadius: s = "50%"
}) {
  const l = I().React, [n, a] = l.useState(0), o = n === 0 ? Pn(e) : `${Pn(e)}?_r=${n}`;
  return l.createElement("img", {
    src: o,
    alt: e,
    onError: () => {
      n < 1 && a(n + 1);
    },
    style: { width: t, height: t, borderRadius: s, objectFit: "cover", flexShrink: 0 }
  });
}
function Qt({
  members: e,
  size: t = 32,
  borderRadius: s = "50%"
}) {
  const l = I().React, [n, a] = l.useState(0);
  if (!e || e.length === 0)
    return l.createElement("span", {
      style: { width: t, height: t, display: "inline-block" }
    });
  const o = e.slice(0, 5), r = n === 0 ? On(o) : `${On(o)}?_r=${n}`;
  return l.createElement("img", {
    src: r,
    alt: "team",
    onError: () => {
      n < 1 && a(n + 1);
    },
    style: { width: t, height: t, borderRadius: s, objectFit: "cover", flexShrink: 0 }
  });
}
async function Gl() {
  return le("/ugsci/engines/list");
}
async function Hl(e) {
  return le("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function Wl(e, t) {
  return le(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function Jl(e) {
  return le(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function Xl() {
  return le("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function Kl({
  engine: e,
  onClick: t
}) {
  const s = I().React, { Card: l, Tag: n, Typography: a } = I().antd, { Text: o } = a, r = e.status === "detected", c = ia[e.category] || "📦", u = ca.has(e.id) ? s.createElement("img", {
    src: ma(e.id),
    alt: e.name,
    style: { width: 24, height: 24, objectFit: "contain" }
  }) : s.createElement("span", { style: { fontSize: 20 } }, c);
  return s.createElement(
    l,
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
    s.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8
        }
      },
      s.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        u,
        s.createElement(
          "div",
          null,
          s.createElement(
            o,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          s.createElement("br"),
          s.createElement(
            o,
            { type: "secondary", style: { fontSize: 11 } },
            e.vendor || "—"
          )
        )
      ),
      s.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" } },
        r ? s.createElement(
          n,
          { color: "success", style: { fontSize: 11 } },
          "✅ 已检测"
        ) : e.executable_path ? s.createElement(
          n,
          { color: "warning", style: { fontSize: 11 } },
          "⚠ 路径无效"
        ) : s.createElement(
          n,
          { style: { fontSize: 11 } },
          "🔧 待配置"
        ),
        e.is_default ? s.createElement(
          n,
          { color: "blue", style: { fontSize: 10 } },
          "默认"
        ) : e.is_custom ? s.createElement(
          n,
          { color: "purple", style: { fontSize: 10 } },
          "自定义"
        ) : null
      )
    ),
    s.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      s.createElement(
        o,
        { type: "secondary", style: { fontSize: 12 } },
        e.description || "暂无描述"
      )
    ),
    s.createElement(
      "div",
      {
        style: {
          marginTop: 8,
          display: "flex",
          gap: 4,
          flexWrap: "wrap"
        }
      },
      e.category ? s.createElement(
        n,
        { style: { fontSize: 11 } },
        Ft[e.category] || e.category
      ) : null,
      e.version ? s.createElement(
        n,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (k) => s.createElement(
          n,
          { key: k, color: "cyan", style: { fontSize: 10 } },
          k
        )
      )
    )
  );
}
function Vl() {
  const e = I().React, { useState: t, useEffect: s, useCallback: l, useMemo: n } = e, {
    Spin: a,
    Empty: o,
    Button: r,
    message: c,
    Row: m,
    Col: u,
    Drawer: k,
    Descriptions: b,
    Tag: x,
    Typography: S,
    Modal: p,
    Input: $,
    Select: M,
    Popconfirm: V,
    Space: R
  } = I().antd, {
    ReloadOutlined: ee,
    SearchOutlined: j,
    PlusOutlined: N,
    EditOutlined: O,
    DeleteOutlined: _,
    CopyOutlined: T,
    ExperimentOutlined: J
  } = I().antdIcons || {}, { Text: D, Paragraph: A } = S, [h, v] = t([]), [f, X] = t(!0), [G, ae] = t(""), [w, g] = t(!1), [E, C] = t(null), [re, L] = t(!1), [q, ie] = t(null), [B, Y] = t({}), [oe, y] = t(!1), ne = l(async () => {
    X(!0);
    try {
      const K = await Gl();
      v(K.engines || []);
    } catch (K) {
      c.error(K.message || "加载引擎列表失败"), v([]);
    } finally {
      X(!1);
    }
  }, []);
  s(() => {
    ne();
  }, [ne]);
  const d = n(() => {
    if (!G.trim()) return h;
    const K = G.toLowerCase();
    return h.filter(
      (W) => {
        var z;
        return W.name.toLowerCase().includes(K) || W.vendor.toLowerCase().includes(K) || W.category.toLowerCase().includes(K) || ((z = W.description) == null ? void 0 : z.toLowerCase().includes(K));
      }
    );
  }, [h, G]);
  h.filter((K) => K.status === "detected").length;
  const te = l((K) => {
    navigator.clipboard.writeText(K).then(() => c.success("路径已复制")).catch(() => c.error("复制失败"));
  }, []), P = l(() => {
    ie(null), Y({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), L(!0);
  }, []), se = l((K) => {
    ie(K), Y({ ...K }), L(!0), g(!1);
  }, []), de = l(async () => {
    var K;
    if (!((K = B.name) != null && K.trim())) {
      c.warning("请输入引擎名称");
      return;
    }
    y(!0);
    try {
      q ? (await Wl(q.id, B), c.success("引擎已更新")) : (await Hl(B), c.success("引擎已添加")), L(!1), ne();
    } catch (W) {
      c.error(W.message || "保存失败");
    } finally {
      y(!1);
    }
  }, [B, q, ne]), he = l(
    async (K) => {
      try {
        await Jl(K), c.success("引擎已删除"), g(!1), ne();
      } catch (W) {
        c.error(W.message || "删除失败");
      }
    },
    [ne]
  ), fe = l(async () => {
    X(!0);
    try {
      const K = await Xl();
      v(K.engines || []), c.success("自动检测完成");
    } catch (K) {
      c.error(K.message || "检测失败");
    } finally {
      X(!1);
    }
  }, []), ue = l(
    (K, W, z) => {
      const F = B[W] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          D,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          K
        ),
        z != null && z.select ? e.createElement(M, {
          value: F || void 0,
          onChange: (ce) => Y((H) => ({ ...H, [W]: ce })),
          style: { width: "100%" },
          options: z.select.options,
          allowClear: !0,
          placeholder: `选择${K}`
        }) : z != null && z.textarea ? e.createElement($.TextArea, {
          value: F,
          onChange: (ce) => Y((H) => ({ ...H, [W]: ce.target.value })),
          rows: 3,
          placeholder: `输入${K}`
        }) : e.createElement($, {
          value: F,
          onChange: (ce) => Y((H) => ({ ...H, [W]: ce.target.value })),
          placeholder: `输入${K}`
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
        value: G,
        onChange: (K) => ae(K.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        r,
        {
          icon: ee ? e.createElement(ee) : void 0,
          onClick: fe,
          loading: f
        },
        "自动检测"
      ),
      e.createElement(
        r,
        {
          type: "primary",
          icon: N ? e.createElement(N) : void 0,
          onClick: P,
          style: Re
        },
        "添加引擎"
      )
    ),
    // Content
    f ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(a, {
        size: "large",
        tip: "正在加载计算引擎..."
      })
    ) : d.length === 0 ? e.createElement(o, {
      description: G ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      m,
      { gutter: [12, 12], align: "stretch" },
      ...d.map(
        (K) => e.createElement(
          u,
          {
            key: K.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Kl, {
            engine: K,
            onClick: () => {
              C(K), g(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    E ? e.createElement(
      k,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            ca.has(E.id) ? e.createElement("img", {
              src: ma(E.id),
              alt: E.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              ia[E.category] || "📦"
            )
          ),
          e.createElement("span", null, E.name)
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
              icon: O ? e.createElement(O) : void 0,
              onClick: () => se(E)
            },
            "编辑"
          ),
          E.is_default ? null : e.createElement(
            V,
            {
              title: "确认删除此引擎？",
              description: E.name,
              onConfirm: () => he(E.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              r,
              {
                size: "small",
                danger: !0,
                icon: _ ? e.createElement(_) : void 0
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
          E.name
        ),
        e.createElement(
          b.Item,
          { label: "厂商" },
          E.vendor || "—"
        ),
        e.createElement(
          b.Item,
          { label: "分类" },
          E.category ? Ft[E.category] || E.category : "—"
        ),
        e.createElement(
          b.Item,
          { label: "状态" },
          e.createElement(
            x,
            {
              color: E.status === "detected" ? "success" : E.status === "not_found" ? "error" : "default"
            },
            E.status === "detected" ? "✅ 已检测" : E.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          b.Item,
          { label: "版本" },
          E.version || "—"
        ),
        E.executable_path ? e.createElement(
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
              E.executable_path
            ),
            e.createElement(
              r,
              {
                size: "small",
                type: "text",
                icon: T ? e.createElement(T) : void 0,
                onClick: () => te(E.executable_path)
              }
            )
          )
        ) : null,
        E.install_dir ? e.createElement(
          b.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            E.install_dir
          )
        ) : null,
        // Display detected modules with paths
        E.modules && E.modules.length > 0 ? e.createElement(
          b.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...E.modules.map(
              (K) => e.createElement(
                "div",
                {
                  key: K,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  x,
                  { color: "cyan", style: { fontSize: 11 } },
                  K
                ),
                E.module_paths && E.module_paths[K] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  E.module_paths[K]
                ) : null
              )
            )
          )
        ) : null,
        E.license_server ? e.createElement(
          b.Item,
          { label: "许可证服务器" },
          E.license_server
        ) : null,
        e.createElement(
          b.Item,
          { label: "描述" },
          E.description || "—"
        )
      ),
      // Invocation hint
      E.invocation_hint ? e.createElement(
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
          D,
          { strong: !0, style: { fontSize: 13 } },
          "💡 调用方式"
        ),
        e.createElement(
          "div",
          { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
          E.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        E.is_default ? e.createElement(
          x,
          { color: "blue" },
          "默认引擎"
        ) : E.is_custom ? e.createElement(
          x,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      p,
      {
        title: q ? "编辑引擎" : "添加计算引擎",
        open: re,
        onOk: de,
        onCancel: () => L(!1),
        okText: q ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: oe,
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
            options: Object.entries(Ft).map(([K, W]) => ({
              label: W,
              value: K
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
function ql() {
  const e = I().React, { useState: t, useEffect: s, useCallback: l, useMemo: n } = e, {
    Spin: a,
    Empty: o,
    Input: r,
    Button: c,
    message: m,
    Row: u,
    Col: k,
    Tabs: b,
    Modal: x
  } = I().antd, {
    ReloadOutlined: S,
    PlusOutlined: p,
    SearchOutlined: $,
    ApiOutlined: M,
    RocketOutlined: V
  } = I().antdIcons || {}, { TextArea: R } = r, j = I().useSelectedAgent, N = j ? j() : null, O = (N == null ? void 0 : N.id) || "default", [_, T] = t([]), [J, D] = t(!0), [A, h] = t(""), [v, f] = t("mcp"), [X, G] = t(!1), [ae, w] = t(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [g, E] = t(!1), C = l(async () => {
    D(!0);
    try {
      const d = await Ma(O);
      T(d);
    } catch (d) {
      m.error(d.message || "加载 MCP 列表失败"), T([]);
    } finally {
      D(!1);
    }
  }, [O]);
  s(() => {
    C();
  }, [C]);
  const re = l(
    async (d) => {
      try {
        await Ra(O, d.key), m.success(d.enabled ? "已禁用" : "已启用"), C();
      } catch (te) {
        m.error(te.message || "切换状态失败");
      }
    },
    [O, C]
  ), L = l(async (d) => {
    try {
      await La(O, d.key), m.success(`MCP「${d.key}」已删除`), C();
    } catch (te) {
      m.error(te.message || "删除失败");
    }
  }, [O, C]), q = l(async () => {
    E(!0);
    try {
      const d = JSON.parse(ae), te = d.mcpServers || d, P = Object.entries(te);
      if (P.length === 0) {
        m.warning("未找到 MCP 客户端配置");
        return;
      }
      let se = !0;
      for (const [de, he] of P) {
        const fe = he, ue = fe.url ? "streamable_http" : "stdio", K = {
          name: fe.name || de,
          description: fe.description || "",
          enabled: !0,
          transport: ue,
          url: fe.url || "",
          command: fe.command || "",
          args: fe.args || [],
          env: fe.env || {},
          cwd: fe.cwd || "",
          headers: fe.headers || {}
        };
        try {
          await ja(
            O,
            de,
            K
          );
        } catch {
          se = !1;
        }
      }
      se && (m.success("MCP 客户端已创建"), G(!1), C());
    } catch (d) {
      d instanceof SyntaxError ? m.error("JSON 格式错误：" + d.message) : m.error(d.message || "创建 MCP 失败");
    } finally {
      E(!1);
    }
  }, [ae, O, C]), ie = n(() => {
    if (!A.trim()) return _;
    const d = A.toLowerCase();
    return _.filter(
      (te) => {
        var P;
        return te.name.toLowerCase().includes(d) || te.key.toLowerCase().includes(d) || ((P = te.description) == null ? void 0 : P.toLowerCase().includes(d)) || te.transport.toLowerCase().includes(d);
      }
    );
  }, [_, A]), B = _.filter((d) => d.enabled).length, Y = _.reduce((d, te) => {
    var P;
    return d + (((P = te.tools) == null ? void 0 : P.length) || 0);
  }, 0), oe = (d) => {
    window.history.pushState({}, "", d), window.dispatchEvent(new PopStateEvent("popstate"));
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
        value: A,
        onChange: (d) => h(d.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      e.createElement(
        c,
        {
          type: "primary",
          icon: p ? e.createElement(p) : void 0,
          onClick: () => G(!0),
          style: Re
        },
        "添加 MCP"
      ),
      e.createElement(
        c,
        {
          icon: M ? e.createElement(M) : void 0,
          onClick: () => oe("/mcp")
        },
        "前往 MCP 管理"
      )
    ),
    J ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(a, { size: "large" })
    ) : ie.length === 0 ? e.createElement(o, {
      description: A ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「添加 MCP」创建"
    }) : e.createElement(
      u,
      { gutter: [12, 12], align: "stretch" },
      ...ie.map(
        (d) => e.createElement(
          k,
          {
            key: d.key,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Fl, {
            mcp: d,
            agentId: O,
            onToggle: (te) => {
              te.stopPropagation(), re(d);
            },
            onDelete: () => {
              L(d);
            },
            onUpdate: async (te, P) => {
              try {
                return await Ba(O, te, P), m.success("MCP 配置已更新"), C(), !0;
              } catch (se) {
                return m.error(se.message || "更新 MCP 失败"), !1;
              }
            },
            onUpdatePolicy: async (te, P) => {
              try {
                return await Da(O, te, P), m.success("访问策略已保存"), C(), !0;
              } catch (se) {
                return m.error(se.message || "保存访问策略失败"), !1;
              }
            },
            onRefresh: async () => {
              C();
            }
          })
        )
      )
    )
  ), ne = [
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
      children: e.createElement(Vl)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(_t, {
      title: "工具",
      subtitle: `MCP: ${_.length} 个客户端（${B} 个启用）· ${Y} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          c,
          {
            icon: S ? e.createElement(S) : void 0,
            onClick: () => {
              nt(), C();
            },
            loading: J
          },
          "刷新"
        )
      )
    }),
    e.createElement(b, {
      items: ne,
      activeKey: v,
      onChange: (d) => f(d)
    }),
    // ── Create MCP Modal (mirror console /mcp JSON import) ──
    e.createElement(
      x,
      {
        title: "添加 MCP 客户端 (JSON)",
        open: X,
        onCancel: () => G(!1),
        onOk: q,
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
        value: ae,
        onChange: (d) => w(d.target.value),
        autoSize: { minRows: 12, maxRows: 20 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      })
    )
  );
}
function Yl({
  agentId: e,
  agentName: t,
  onNavigate: s
}) {
  const l = I().React, { useState: n, useEffect: a, useCallback: o } = l, {
    Spin: r,
    Empty: c,
    Button: m,
    Row: u,
    Col: k,
    Card: b,
    Tag: x,
    Checkbox: S,
    Modal: p,
    Typography: $,
    Drawer: M,
    Descriptions: V,
    message: R
  } = I().antd, {
    ReloadOutlined: ee,
    ThunderboltOutlined: j,
    SettingOutlined: N,
    CheckSquareOutlined: O,
    EyeOutlined: _,
    EyeInvisibleOutlined: T,
    DeleteOutlined: J,
    CloseOutlined: D
  } = I().antdIcons || {}, { Text: A, Paragraph: h } = $, [v, f] = n([]), [X, G] = n(!0), [ae, w] = n(!1), [g, E] = n(null), [C, re] = n(!1), [L, q] = n(
    /* @__PURE__ */ new Set()
  ), [ie, B] = n(!1), [Y, oe] = n(null), [y, ne] = n(!1), d = o(async () => {
    if (e) {
      G(!0);
      try {
        const z = await kt(e);
        f(z);
      } catch (z) {
        R.error(z.message || "加载技能失败"), f([]);
      } finally {
        G(!1);
      }
    }
  }, [e]);
  a(() => {
    d();
  }, [d]);
  const te = (z) => {
    q((F) => {
      const ce = new Set(F);
      return ce.has(z) ? ce.delete(z) : ce.add(z), ce;
    });
  }, P = () => q(/* @__PURE__ */ new Set()), se = () => q(new Set(v.map((z) => z.name))), de = () => {
    C ? (P(), re(!1)) : re(!0);
  }, he = async () => {
    const z = Array.from(L);
    if (z.length !== 0) {
      B(!0);
      try {
        const { results: F } = await nl(e, z), ce = Object.entries(F).filter(
          ([, pe]) => pe.success === !1
        ), H = z.length - ce.length;
        ce.length > 0 ? R.warning(
          `批量启用完成：成功 ${H} 个，失败 ${ce.length} 个`
        ) : R.success(`成功启用 ${z.length} 个技能`), P(), await d();
      } catch (F) {
        R.error(F.message || "批量启用失败");
      } finally {
        B(!1);
      }
    }
  }, fe = async () => {
    const z = Array.from(L);
    if (z.length !== 0) {
      B(!0);
      try {
        const { results: F } = await al(e, z), ce = Object.entries(F).filter(
          ([, pe]) => pe.success === !1
        ), H = z.length - ce.length;
        ce.length > 0 ? R.warning(
          `批量停用完成：成功 ${H} 个，失败 ${ce.length} 个`
        ) : R.success(`成功停用 ${z.length} 个技能`), P(), await d();
      } catch (F) {
        R.error(F.message || "批量停用失败");
      } finally {
        B(!1);
      }
    }
  }, ue = () => {
    const z = Array.from(L);
    z.length !== 0 && p.confirm({
      title: `确认删除 ${z.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        B(!0);
        try {
          const { results: F } = await ll(e, z), ce = Object.entries(F).filter(
            ([, pe]) => pe.success === !1
          ), H = z.length - ce.length;
          ce.length > 0 ? R.warning(
            `批量删除完成：成功 ${H} 个，失败 ${ce.length} 个`
          ) : R.success(`成功删除 ${z.length} 个技能`), P(), await d();
        } catch (F) {
          R.error(F.message || "批量删除失败");
        } finally {
          B(!1);
        }
      }
    });
  }, K = async (z) => {
    ne(!0);
    try {
      z.enabled === !1 ? (await Xn(e, z.name), R.success(`已启用技能「${z.name}」`)) : (await Vn(e, z.name), R.success(`已禁用技能「${z.name}」`)), await d();
    } catch (F) {
      R.error(F.message || "操作失败");
    } finally {
      ne(!1);
    }
  }, W = (z) => {
    p.confirm({
      title: `确认删除技能「${z.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ne(!0);
        try {
          await Vt(e, z.name), R.success(`已删除技能「${z.name}」`), await d();
        } catch (F) {
          R.error(F.message || "删除失败");
        } finally {
          ne(!1);
        }
      }
    });
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
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8
        }
      },
      l.createElement(
        A,
        { type: "secondary", style: { fontSize: 13 } },
        C ? `已选择 ${L.size} / ${v.length} 个技能` : `共 ${v.length} 个技能`
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        C ? l.createElement(
          l.Fragment,
          null,
          l.createElement(
            m,
            { size: "small", onClick: se },
            "全选"
          ),
          l.createElement(
            m,
            {
              size: "small",
              icon: D ? l.createElement(D) : void 0,
              onClick: P
            },
            "取消选择"
          ),
          l.createElement(
            m,
            {
              size: "small",
              type: "default",
              icon: _ ? l.createElement(_) : void 0,
              disabled: L.size === 0 || ie,
              loading: ie,
              onClick: he
            },
            "批量启用"
          ),
          l.createElement(
            m,
            {
              size: "small",
              danger: !0,
              icon: T ? l.createElement(T) : void 0,
              disabled: L.size === 0 || ie,
              loading: ie,
              onClick: fe
            },
            "批量停用"
          ),
          l.createElement(
            m,
            {
              size: "small",
              danger: !0,
              icon: J ? l.createElement(J) : void 0,
              disabled: L.size === 0 || ie,
              loading: ie,
              onClick: ue
            },
            `删除 (${L.size})`
          ),
          l.createElement(
            m,
            {
              size: "small",
              type: "primary",
              onClick: de
            },
            "退出批量"
          )
        ) : l.createElement(
          l.Fragment,
          null,
          l.createElement(
            m,
            {
              size: "small",
              icon: O ? l.createElement(O) : void 0,
              onClick: de,
              disabled: v.length === 0
            },
            "批量管理"
          ),
          l.createElement(
            m,
            {
              icon: ee ? l.createElement(ee) : void 0,
              onClick: () => {
                nt(), d();
              }
            },
            "刷新"
          )
        )
      )
    ),
    X ? l.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      l.createElement(r, { size: "large" })
    ) : v.length === 0 ? l.createElement(c, {
      description: "当前智能体未加载任何技能"
    }) : l.createElement(
      u,
      { gutter: [12, 12] },
      ...v.map(
        (z) => l.createElement(
          k,
          { key: z.name, xs: 24, sm: 12, md: 8, lg: 6 },
          l.createElement(
            b,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: C ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: C && L.has(z.name) ? "#0072f5" : void 0,
                borderWidth: C && L.has(z.name) ? 2 : 1
              },
              onClick: () => {
                C ? te(z.name) : (E(z), w(!0));
              },
              onMouseEnter: () => {
                C || oe(z.name);
              },
              onMouseLeave: () => oe(null)
            },
            C ? l.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (F) => {
                  F.stopPropagation(), te(z.name);
                }
              },
              l.createElement(S, {
                checked: L.has(z.name)
              })
            ) : null,
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
              z.emoji ? l.createElement(
                "span",
                { style: { fontSize: 18 } },
                z.emoji
              ) : l.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              l.createElement(
                A,
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
                z.name
              ),
              z.enabled === !1 ? l.createElement(
                x,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : l.createElement(
                x,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            z.description ? l.createElement(
              h,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              z.description
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
              z.version_text ? l.createElement(
                x,
                { style: { fontSize: 10 } },
                `v${z.version_text}`
              ) : null,
              ...(z.tags || []).slice(0, 3).map(
                (F, ce) => l.createElement(
                  x,
                  { key: ce, color: "blue", style: { fontSize: 10 } },
                  F
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !C && Y === z.name ? l.createElement(
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
              l.createElement(
                m,
                {
                  size: "small",
                  type: "default",
                  icon: z.enabled === !1 ? _ ? l.createElement(_) : void 0 : T ? l.createElement(T) : void 0,
                  disabled: y,
                  onClick: (F) => {
                    F.stopPropagation(), K(z);
                  }
                },
                z.enabled === !1 ? "启用" : "禁用"
              ),
              l.createElement(
                m,
                {
                  size: "small",
                  danger: !0,
                  icon: J ? l.createElement(J) : void 0,
                  disabled: y,
                  onClick: (F) => {
                    F.stopPropagation(), W(z);
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
    g ? l.createElement(
      M,
      {
        title: l.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          l.createElement(
            "span",
            { style: { fontSize: 18 } },
            g.emoji || "⚡"
          ),
          l.createElement("span", null, g.name)
        ),
        open: ae,
        onClose: () => w(!1),
        width: 520,
        extra: l.createElement(
          m,
          {
            type: "primary",
            size: "small",
            icon: N ? l.createElement(N) : void 0,
            onClick: () => s("/skills")
          },
          "管理技能"
        )
      },
      l.createElement(
        V,
        { column: 1, bordered: !0, size: "small" },
        l.createElement(
          V.Item,
          { label: "技能名称" },
          g.name
        ),
        l.createElement(
          V.Item,
          { label: "描述" },
          g.description || "-"
        ),
        g.version_text ? l.createElement(
          V.Item,
          { label: "版本" },
          g.version_text
        ) : null,
        l.createElement(
          V.Item,
          { label: "来源" },
          g.source || "-"
        ),
        l.createElement(
          V.Item,
          { label: "状态" },
          g.enabled === !1 ? "已禁用" : "已启用"
        ),
        g.installed_from ? l.createElement(
          V.Item,
          { label: "安装来源" },
          g.installed_from
        ) : null
      ),
      // Tags
      g.tags && g.tags.length > 0 ? l.createElement(
        "div",
        { style: { marginTop: 16 } },
        l.createElement(
          A,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        l.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...g.tags.map(
            (z, F) => l.createElement(x, { key: F, color: "blue" }, z)
          )
        )
      ) : null,
      // Skill content preview
      g.content ? l.createElement(
        "div",
        { style: { marginTop: 16 } },
        l.createElement(
          A,
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
          g.content.slice(0, 2e3) + (g.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Ql({
  poolSkills: e,
  workspaceSkills: t,
  agents: s,
  loading: l,
  onReload: n,
  agentId: a,
  agentName: o
}) {
  const r = I().React, { useState: c, useMemo: m, useCallback: u } = r, {
    Spin: k,
    Empty: b,
    Input: x,
    Button: S,
    Row: p,
    Col: $,
    Card: M,
    Tag: V,
    Typography: R,
    Drawer: ee,
    Descriptions: j,
    List: N,
    Modal: O,
    message: _
  } = I().antd, {
    ReloadOutlined: T,
    SearchOutlined: J,
    DownloadOutlined: D,
    ThunderboltOutlined: A,
    DeleteOutlined: h,
    PlusOutlined: v
  } = I().antdIcons || {}, { Text: f, Paragraph: X } = R, [G, ae] = c(""), [w, g] = c(!1), [E, C] = c(null), [re, L] = c([]), [q, ie] = c(!1), [B, Y] = c(24), [oe, y] = c(null), [ne, d] = c(!1), te = m(() => {
    if (!G.trim()) return e;
    const W = G.toLowerCase();
    return e.filter(
      (z) => {
        var F, ce;
        return z.name.toLowerCase().includes(W) || ((F = z.description) == null ? void 0 : F.toLowerCase().includes(W)) || ((ce = z.tags) == null ? void 0 : ce.some((H) => H.toLowerCase().includes(W)));
      }
    );
  }, [e, G]), P = m(
    () => te.slice(0, B),
    [te, B]
  ), se = u((W) => {
    ae(W), Y(24);
  }, []), de = u(
    (W) => {
      const z = [];
      for (const F of t)
        if (F.skills.some((ce) => ce.name === W)) {
          const ce = s.find((H) => H.id === F.agent_id);
          z.push((ce == null ? void 0 : ce.name) || F.agent_name || F.agent_id);
        }
      return z;
    },
    [t, s]
  ), he = u(
    async (W) => {
      if (C(W), L(de(W.name)), g(!0), !W.content) {
        ie(!0);
        try {
          const z = await Aa(W.name);
          C({ ...W, content: z });
        } catch {
        } finally {
          ie(!1);
        }
      }
    },
    [de]
  ), fe = async (W) => {
    d(!0);
    try {
      await Kt(a, W.name), _.success(
        `已将技能「${W.name}」加载到当前专家「${o}」`
      ), n();
    } catch (z) {
      _.error(z.message || "加载技能失败");
    } finally {
      d(!1);
    }
  }, ue = (W) => {
    if (W.protected) {
      _.warning("内置技能不可删除");
      return;
    }
    O.confirm({
      title: `确认从技能池删除「${W.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        d(!0);
        try {
          await rl(W.name), _.success(`已从技能池删除「${W.name}」`), n();
        } catch (z) {
          _.error(z.message || "删除失败");
        } finally {
          d(!1);
        }
      }
    });
  }, K = (W) => {
    window.history.pushState({}, "", W), window.dispatchEvent(new PopStateEvent("popstate"));
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
      r.createElement(x, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: J ? r.createElement(J) : void 0,
        value: G,
        onChange: (W) => se(W.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          S,
          {
            icon: T ? r.createElement(T) : void 0,
            onClick: n,
            loading: l,
            size: "small"
          },
          "刷新"
        ),
        r.createElement(
          S,
          {
            type: "primary",
            icon: D ? r.createElement(D) : void 0,
            onClick: () => K("/skill-pool"),
            size: "small",
            style: Re
          },
          "管理技能池"
        )
      )
    ),
    l ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      r.createElement(k, { size: "large" })
    ) : te.length === 0 ? r.createElement(b, {
      description: G ? "未找到匹配的技能" : "技能池为空"
    }) : r.createElement(
      r.Fragment,
      null,
      r.createElement(
        p,
        { gutter: [12, 12] },
        ...P.map(
          (W) => r.createElement(
            $,
            { key: W.name, xs: 24, sm: 12, md: 8, lg: 6 },
            r.createElement(
              M,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => he(W),
                onMouseEnter: () => y(W.name),
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
                W.emoji ? r.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  W.emoji
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
                  W.name
                ),
                W.protected ? r.createElement(
                  V,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              W.description ? r.createElement(
                X,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                W.description
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
                W.version_text ? r.createElement(
                  V,
                  { style: { fontSize: 10 } },
                  `v${W.version_text}`
                ) : null,
                ...(W.tags || []).slice(0, 3).map(
                  (z, F) => r.createElement(
                    V,
                    { key: F, color: "cyan", style: { fontSize: 10 } },
                    z
                  )
                )
              ),
              // Hover action footer
              oe === W.name ? r.createElement(
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
                    disabled: ne,
                    onClick: (z) => {
                      z.stopPropagation(), fe(W);
                    }
                  },
                  "加载到当前Agent"
                ),
                r.createElement(
                  S,
                  {
                    size: "small",
                    danger: !0,
                    icon: h ? r.createElement(h) : void 0,
                    disabled: ne || W.protected,
                    onClick: (z) => {
                      z.stopPropagation(), ue(W);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Load more button
        P.length < te.length ? r.createElement(
          "div",
          { style: { textAlign: "center", marginTop: 16 } },
          r.createElement(
            S,
            {
              onClick: () => Y((W) => W + 24),
              size: "small"
            },
            `加载更多 (剩余 ${te.length - P.length} 个)`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    E ? r.createElement(
      ee,
      {
        title: r.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          r.createElement(
            "span",
            { style: { fontSize: 18 } },
            E.emoji || "⚡"
          ),
          r.createElement("span", null, E.name)
        ),
        open: w,
        onClose: () => g(!1),
        width: 520,
        extra: r.createElement(
          S,
          {
            type: "primary",
            size: "small",
            icon: A ? r.createElement(A) : void 0,
            onClick: () => K("/skills")
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
          E.name
        ),
        r.createElement(
          j.Item,
          { label: "描述" },
          E.description || "-"
        ),
        E.version_text ? r.createElement(
          j.Item,
          { label: "版本" },
          E.version_text
        ) : null,
        r.createElement(
          j.Item,
          { label: "来源" },
          E.source || "-"
        ),
        r.createElement(
          j.Item,
          { label: "受保护" },
          E.protected ? "是（内置）" : "否"
        ),
        E.sync_status ? r.createElement(
          j.Item,
          { label: "同步状态" },
          E.sync_status
        ) : null,
        E.installed_from ? r.createElement(
          j.Item,
          { label: "安装来源" },
          E.installed_from
        ) : null
      ),
      // Tags
      E.tags && E.tags.length > 0 ? r.createElement(
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
          ...E.tags.map(
            (W, z) => r.createElement(V, { key: z, color: "cyan" }, W)
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
          `已安装此技能的专家 (${re.length})`
        ),
        re.length > 0 ? r.createElement(N, {
          size: "small",
          dataSource: re,
          renderItem: (W) => r.createElement(
            N.Item,
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
              r.createElement(Ue, { name: W, size: 20 }),
              r.createElement(
                f,
                { style: { fontSize: 13 } },
                W
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
      q ? r.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        r.createElement(k, { size: "small" })
      ) : E.content ? r.createElement(
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
          E.content.slice(0, 2e3) + (E.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Zl() {
  const e = I().React, { useState: t, useEffect: s, useCallback: l, useMemo: n } = e, { Tabs: a, message: o } = I().antd, { ThunderboltOutlined: r, AppstoreOutlined: c } = I().antdIcons || {}, u = I().useSelectedAgent, k = u ? u() : null, b = (k == null ? void 0 : k.id) || "default", [x, S] = t([]), [p, $] = t([]), [M, V] = t([]), [R, ee] = t(!0), [j, N] = t("agent-skills"), O = l(async () => {
    ee(!0);
    try {
      const [D, A, h] = await Promise.all([
        Jt(!0),
        Wt(),
        $a()
      ]);
      $(D), S(A), V(h);
    } catch (D) {
      o.error(D.message || "加载技能列表失败"), $([]);
    } finally {
      ee(!1);
    }
  }, []);
  s(() => {
    O();
  }, [O]);
  const _ = n(() => {
    const D = x.find((A) => A.id === b);
    return (D == null ? void 0 : D.name) || b;
  }, [x, b]), T = (D) => {
    window.history.pushState({}, "", D), window.dispatchEvent(new PopStateEvent("popstate"));
  }, J = [
    {
      key: "agent-skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        r ? e.createElement(r, { style: { fontSize: 14 } }) : null,
        "当前Agent加载技能"
      ),
      children: e.createElement(Yl, {
        agentId: b,
        agentName: _,
        onNavigate: T
      })
    },
    {
      key: "skill-pool",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        c ? e.createElement(c, { style: { fontSize: 14 } }) : null,
        "技能池"
      ),
      children: e.createElement(Ql, {
        poolSkills: p,
        workspaceSkills: M,
        agents: x,
        loading: R,
        onReload: O,
        agentId: b,
        agentName: _
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(_t, {
      title: "技能",
      subtitle: `技能池共 ${p.length} 个技能 · 当前智能体：${_}`
    }),
    e.createElement(a, {
      items: J,
      activeKey: j,
      onChange: (D) => N(D)
    })
  );
}
const bt = "ugsci.market.githubSources", An = "https://github.com/anthropics/skills/tree/main/skills", Zt = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", $n = `${Zt}/skills`;
function en(e) {
  const t = e.replace(/^\/+/, "");
  return tt(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
async function Je(e) {
  const t = e.replace(/^\/+/, ""), s = `${Zt}/${t}`;
  try {
    const a = await fetch(s);
    if (a.ok)
      return await a.json();
  } catch {
  }
  const l = en(t), n = await fetch(l);
  if (!n.ok)
    throw new Error(`OSS fetch failed (${n.status}): ${t}`);
  return await n.json();
}
async function Mn(e) {
  const t = e.replace(/^\/+/, ""), s = `${Zt}/${t}`;
  try {
    const a = await fetch(s);
    if (a.ok)
      return await a.text();
  } catch {
  }
  const l = en(t), n = await fetch(l);
  if (!n.ok)
    throw new Error(`OSS fetch failed (${n.status}): ${t}`);
  return await n.text();
}
function zt(e) {
  return {
    domain: "领域",
    workflow: "工作流",
    computation: "计算与数据",
    integration: "集成与工具",
    type: "类型",
    capability: "能力",
    tooling: "工具链"
  }[e] || e;
}
function es(e) {
  var m, u;
  const t = {};
  if (e.env && e.env.length > 0)
    for (const k of e.env)
      t[k] = `your-${k.toLowerCase().replace(/_/g, "-")}`;
  const l = (e.transport || "stdio").replace(/-/g, "_");
  let n = "🔌";
  const a = (e.icon || "").toLowerCase();
  a.includes("folder") ? n = "📁" : a.includes("git") ? n = "🌿" : a.includes("github") ? n = "🐙" : a.includes("database") || a.includes("postgres") || a.includes("sqlite") ? n = "🗄️" : a.includes("search") || a.includes("brave") ? n = "🔍" : a.includes("browser") || a.includes("puppeteer") ? n = "🎭" : a.includes("memory") || a.includes("brain") ? n = "🧠" : a.includes("file") || a.includes("fetch") ? n = "🌐" : a.includes("slack") ? n = "💬" : a.includes("google") ? n = "📁" : a.includes("notion") ? n = "📝" : a.includes("jupyter") ? n = "📊" : a.includes("science") || a.includes("flask") ? n = "🔬" : a.includes("book") || a.includes("arxiv") ? n = "📚" : a.includes("patent") && (n = "📜");
  const o = e.config, r = e.config_url || (o == null ? void 0 : o.url) || "", c = e.config_headers || (o == null ? void 0 : o.headers) || {};
  return {
    id: e.id,
    name: e.name,
    emoji: n,
    iconUrl: e.icon_url ? en(e.icon_url) : void 0,
    category: e.category ? zt(e.category) : "",
    description: e.description,
    transport: l,
    command: ((m = e.config) == null ? void 0 : m.command) || "",
    args: ((u = e.config) == null ? void 0 : u.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0,
    url: r,
    headers: Object.keys(c).length > 0 ? c : void 0
  };
}
const da = "ugsci.market.mcpSources", ua = "ugsci.market.expertSources";
function pa(e, t) {
  try {
    const s = localStorage.getItem(e);
    if (!s) return [];
    const l = JSON.parse(s);
    return Array.isArray(l) ? l.filter(
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
function ga(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function Rn() {
  return pa(da, "mcp");
}
function yt(e) {
  ga(da, e);
}
function Ln() {
  return pa(ua, "expert");
}
function ht(e) {
  ga(ua, e);
}
function fa(e) {
  try {
    const t = new URL(e.trim()), s = t.hostname.toLowerCase();
    let l;
    if (s === "github.com" || s === "www.github.com")
      l = "github";
    else if (s === "gitee.com" || s === "www.gitee.com")
      l = "gitee";
    else
      return null;
    const n = t.pathname.split("/").filter((m) => m.length > 0);
    if (n.length < 2) return null;
    const a = decodeURIComponent(n[0]), o = decodeURIComponent(n[1]);
    let r = "main", c = "";
    return n.length >= 4 && (n[2] === "tree" || n[2] === "blob") ? (r = decodeURIComponent(n[3]), n.length > 4 && (c = n.slice(4).map(decodeURIComponent).join("/"))) : n.length > 2 && (c = n.slice(2).map(decodeURIComponent).join("/")), c = c.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: a,
      repo: o,
      ref: r || "main",
      skillsPath: c,
      label: `${a}/${o}`,
      platform: l
    };
  } catch {
    return null;
  }
}
function Gt(e, t, s, l = "github") {
  return l === "oss" ? `oss:${e}/${s || "/"}` : `${l}:${e}/${t}:${s || "/"}`;
}
function ya(e) {
  try {
    const t = new URL(e.trim()), s = t.hostname.toLowerCase(), l = s.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!l) return null;
    const n = l[1], a = `${t.protocol}//${s}`, o = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
    return o ? {
      endpoint: a,
      prefix: o,
      label: "UGSci",
      platform: "oss"
    } : null;
  } catch {
    return null;
  }
}
function ts() {
  const e = [], t = ya($n);
  t && e.push({
    id: Gt(
      t.endpoint,
      "",
      t.prefix,
      "oss"
    ),
    url: $n,
    label: t.label,
    owner: t.endpoint,
    repo: "",
    ref: "",
    skillsPath: t.prefix,
    enabled: !0,
    platform: "oss"
  });
  const s = fa(An);
  s && e.push({
    id: Gt(
      s.owner,
      s.repo,
      s.skillsPath,
      s.platform
    ),
    url: An,
    label: s.label,
    owner: s.owner,
    repo: s.repo,
    ref: s.ref,
    skillsPath: s.skillsPath,
    enabled: !0,
    platform: s.platform
  });
  try {
    const l = localStorage.getItem(bt);
    if (!l)
      return localStorage.setItem(
        bt,
        JSON.stringify(e)
      ), e;
    const n = JSON.parse(l);
    if (!Array.isArray(n)) return e;
    const a = n.filter(
      (c) => c && typeof c.id == "string" && (typeof c.owner == "string" || c.platform === "oss")
    ).map((c) => ({
      ...c,
      platform: c.platform || "github",
      owner: c.owner || "",
      repo: c.repo || "",
      ref: c.ref || "",
      skillsPath: c.skillsPath || ""
    })), o = new Set(a.map((c) => c.id)), r = [
      ...a,
      ...e.filter((c) => !o.has(c.id))
    ];
    return localStorage.setItem(
      bt,
      JSON.stringify(r)
    ), r;
  } catch {
    return e;
  }
}
function Et(e) {
  try {
    localStorage.setItem(
      bt,
      JSON.stringify(e)
    );
  } catch {
  }
}
function ns(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const s = t[1], l = {}, n = s.split(`
`);
  let a = "";
  for (const o of n) {
    const r = o.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (r) {
      a = r[1];
      let c = r[2].trim();
      (c.startsWith('"') && c.endsWith('"') || c.startsWith("'") && c.endsWith("'")) && (c = c.slice(1, -1)), a === "name" ? l.name = c : a === "description" ? l.description = c : a === "version" ? l.version = c : a === "author" && (l.author = c);
    }
  }
  return l;
}
async function as(e) {
  const t = e.platform === "gitee", s = e.skillsPath ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/") : "", l = t ? `https://gitee.com/api/v5/repos/${e.owner}/${e.repo}/contents/${s}?ref=${encodeURIComponent(e.ref)}` : `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${s}?ref=${encodeURIComponent(e.ref)}`, n = {
    Accept: t ? "application/json" : "application/vnd.github+json"
  };
  t && e.accessToken && (n.Authorization = `token ${e.accessToken}`);
  const a = await fetch(l, {
    headers: n
  });
  if (!a.ok)
    throw new Error(
      `${t ? "Gitee" : "GitHub"} API ${a.status}: ${e.label} (${e.skillsPath || "/"})`
    );
  const o = await a.json();
  if (!Array.isArray(o)) return [];
  const r = o.filter(
    (m) => m.type === "dir" && m.name
  );
  return await Promise.all(
    r.map(async (m) => {
      const u = e.skillsPath ? e.skillsPath + "/" : "", k = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${u}${m.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${u}${m.name}/SKILL.md`, b = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${m.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${m.name}`, x = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: m.name,
        description: "",
        source_url: b,
        html_url: b,
        version: null,
        author: null
      };
      try {
        const S = {};
        t && e.accessToken && (S.Authorization = `token ${e.accessToken}`);
        const p = await fetch(k, {
          headers: S
        });
        if (!p.ok) return x;
        const $ = await p.text(), M = ns($);
        return {
          ...x,
          name: M.name || m.name,
          description: M.description || "",
          version: M.version || null,
          author: M.author || null
        };
      } catch {
        return x;
      }
    })
  );
}
async function ls(e) {
  const t = ya(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: s, prefix: l } = t, n = l.split("/").map(encodeURIComponent).join("/");
  let a;
  try {
    a = await Je(`${l}/manifest.json`);
  } catch {
    throw new Error(
      "无法获取技能列表: manifest.json (OSS fetch failed)"
    );
  }
  const o = [];
  function r(c, m) {
    for (const u of c) {
      if (u.type === "collection" && Array.isArray(u.children)) {
        r(u.children, u.name);
        continue;
      }
      const k = u.path || u.name || "";
      if (!k) continue;
      const b = k.split("/").map(encodeURIComponent).join("/"), x = `${s}/${n}/${b}`;
      let S = null;
      if (u.metadata) {
        const $ = u.metadata.match(/version:\s*"?([\d.]+)"?/);
        $ && (S = $[1]);
      }
      const p = m ? `${e.label}/${m}` : e.label;
      o.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: p,
        name: u.name || k.split("/").pop() || k,
        description: u.description || "",
        source_url: x,
        html_url: x,
        version: S,
        author: null,
        tag: u.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(a) ? r(
    a.map(
      (c) => typeof c == "string" ? { name: c, path: c } : c
    )
  ) : a && Array.isArray(a.skills) && r(a.skills), o.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return o;
}
async function ss() {
  const e = await Je("mcp/manifest.json"), t = [], s = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [n, a] of Object.entries(e.tag_groups))
      Array.isArray(a) && (s[n] = a, t.push({
        id: n,
        label: zt(n),
        tags: a
      }));
  return { servers: (e.servers || []).map((n) => {
    let a = "";
    const o = n.tags || [];
    for (const [r, c] of Object.entries(s))
      if (c.some((m) => o.includes(m))) {
        a = r;
        break;
      }
    return {
      id: n.id || n.name,
      name: n.name || n.id,
      description: n.description || "",
      tags: o,
      transport: n.transport || "stdio",
      config: n.config,
      env: Array.isArray(n.env) ? n.env : void 0,
      source: n.source,
      icon: n.icon,
      icon_url: n.icon_url || n.icon_path || void 0,
      category: a
    };
  }), categories: t };
}
async function rs() {
  const e = await Je("agents/manifest.json"), t = [], s = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [n, a] of Object.entries(e.tag_groups))
      Array.isArray(a) && (s[n] = a, t.push({
        id: n,
        label: zt(n),
        tags: a
      }));
  return { agents: (e.agents || []).map((n) => {
    let a = "";
    const o = n.tags || [];
    for (const [r, c] of Object.entries(s))
      if (c.some((m) => o.includes(m))) {
        a = r;
        break;
      }
    return {
      id: n.id || n.name,
      name: n.name || n.id,
      description: n.description || "",
      path: n.path || "",
      tags: o,
      config: n.config,
      instructions: n.instructions,
      skills_manifest: n.skills_manifest,
      drivers: n.drivers,
      category: a
    };
  }), categories: t };
}
async function os(e) {
  const t = e.filter((a) => a.enabled), s = await Promise.all(
    t.map(async (a) => {
      try {
        return { skills: a.platform === "oss" ? await ls(a) : await as(a), error: null, label: a.label };
      } catch (o) {
        return {
          skills: [],
          error: o.message || String(o),
          label: a.label
        };
      }
    })
  ), l = [], n = [];
  for (const a of s)
    l.push(...a.skills), a.error && n.push({ label: a.label, message: a.error });
  return { skills: l, errors: n };
}
function is(e) {
  var r;
  const t = {};
  let s = "";
  const l = [], n = {}, a = {}, o = e.split(`
`);
  for (const c of o) {
    if (/^\s*#/.test(c) || /^\s*$/.test(c)) continue;
    const m = ((r = c.match(/^(\s*)/)) == null ? void 0 : r[1].length) || 0, u = c.trim();
    if (s === "args" && m >= 2 && u.startsWith("- ")) {
      l.push(u.slice(2).trim().replace(/^["']|["']$/g, ""));
      continue;
    }
    if ((s === "env" || s === "headers") && m >= 2) {
      const b = u.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
      if (b) {
        let x = b[2].trim().replace(/^["']|["']$/g, "");
        s === "env" ? n[b[1]] = x : a[b[1]] = x;
        continue;
      }
    }
    const k = u.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (k && m === 0) {
      const b = k[1];
      let x = k[2].trim().replace(/^["']|["']$/g, "");
      s = "", x === "" ? b === "args" ? s = "args" : b === "env" ? s = "env" : b === "headers" && (s = "headers") : b === "client_key" || b === "id" ? t.client_key = x : b === "name" ? t.name = x : b === "description" ? t.description = x : b === "transport" ? t.transport = x.replace(/-/g, "_") : b === "command" ? t.command = x : b === "url" ? t.url = x : b === "cwd" && (t.cwd = x);
    }
  }
  return l.length > 0 && (t.args = l), Object.keys(n).length > 0 && (t.env = n), Object.keys(a).length > 0 && (t.headers = a), t.client_key ? t : null;
}
async function cs(e) {
  const t = e.filter((a) => a.enabled && a.url);
  if (t.length === 0) return { servers: [], errors: [] };
  const s = await Promise.all(
    t.map(async (a) => {
      try {
        let o;
        try {
          const c = await fetch(a.url);
          if (!c.ok) throw new Error(`HTTP ${c.status}`);
          o = await c.json();
        } catch {
          const c = a.url.replace(/^https?:\/\/[^/]+\//, "");
          o = await Je(c);
        }
        return { servers: (o.servers || []).map((c) => ({
          id: c.id || c.name,
          name: c.name || c.id,
          description: c.description || "",
          tags: c.tags || [],
          transport: c.transport || "stdio",
          config: c.config,
          config_url: c.config_url,
          config_headers: c.config_headers,
          env: Array.isArray(c.env) ? c.env : void 0,
          source: c.source || a.label,
          icon: c.icon,
          icon_url: c.icon_url || c.icon_path || void 0,
          category: ""
        })), error: null };
      } catch (o) {
        return {
          servers: [],
          error: `${a.label}: ${o.message || String(o)}`
        };
      }
    })
  ), l = [], n = [];
  for (const a of s)
    l.push(...a.servers), a.error && n.push(a.error);
  return { servers: l, errors: n };
}
async function ms(e) {
  const t = e.filter((a) => a.enabled && a.url);
  if (t.length === 0) return { agents: [], errors: [] };
  const s = await Promise.all(
    t.map(async (a) => {
      try {
        let o;
        try {
          const c = await fetch(a.url);
          if (!c.ok) throw new Error(`HTTP ${c.status}`);
          o = await c.json();
        } catch {
          const c = a.url.replace(/^https?:\/\/[^/]+\//, "");
          o = await Je(c);
        }
        return { agents: (o.agents || []).map((c) => ({
          id: c.id || c.name,
          name: c.name || c.id,
          description: c.description || "",
          path: c.path || "",
          tags: c.tags || [],
          config: c.config,
          instructions: c.instructions,
          skills_manifest: c.skills_manifest,
          drivers: c.drivers,
          category: ""
        })), error: null };
      } catch (o) {
        return {
          agents: [],
          error: `${a.label}: ${o.message || String(o)}`
        };
      }
    })
  ), l = [], n = [];
  for (const a of s)
    l.push(...a.agents), a.error && n.push(a.error);
  return { agents: l, errors: n };
}
function ds({
  open: e,
  onClose: t,
  sources: s,
  onChange: l
}) {
  const n = I().React, { useState: a } = n, {
    Modal: o,
    Input: r,
    Button: c,
    List: m,
    Tag: u,
    Switch: k,
    Typography: b,
    Tooltip: x,
    message: S
  } = I().antd, {
    PlusOutlined: p,
    DeleteOutlined: $,
    LinkOutlined: M,
    GithubOutlined: V
  } = I().antdIcons || {}, { Text: R } = b, [ee, j] = a(""), [N, O] = a(""), _ = () => {
    const A = ee.trim();
    if (!A) return;
    const h = fa(A);
    if (!h) {
      S.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const v = Gt(h.owner, h.repo, h.skillsPath, h.platform);
    if (s.some((G) => G.id === v)) {
      S.warning("该源已存在");
      return;
    }
    const f = {
      id: v,
      url: A,
      label: h.label,
      owner: h.owner,
      repo: h.repo,
      ref: h.ref,
      skillsPath: h.skillsPath,
      enabled: !0,
      platform: h.platform,
      accessToken: N.trim() || void 0
    }, X = [...s, f];
    Et(X), l(X), j(""), O(""), S.success(`已添加源: ${h.label}`);
  }, T = (A, h) => {
    const v = s.map(
      (f) => f.id === A ? { ...f, enabled: h } : f
    );
    Et(v), l(v);
  }, J = (A, h) => {
    const v = s.map(
      (f) => f.id === A ? { ...f, accessToken: h.trim() || void 0 } : f
    );
    Et(v), l(v);
  }, D = (A) => {
    const h = s.filter((v) => v.id !== A);
    Et(h), l(h), S.success("已移除源");
  };
  return n.createElement(
    o,
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
        c,
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
          value: ee,
          onChange: (A) => j(A.target.value),
          onPressEnter: _,
          prefix: M ? n.createElement(M) : void 0,
          style: { flex: 1 }
        }),
        n.createElement(
          c,
          {
            type: "primary",
            icon: p ? n.createElement(p) : void 0,
            onClick: _
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      ee.trim() && ee.trim().toLowerCase().includes("gitee.com") ? n.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        n.createElement(
          R,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        n.createElement(r.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: N,
          onChange: (A) => O(A.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    n.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      n.createElement(R, { strong: !0 }, `已配置源 (${s.length})`)
    ),
    n.createElement(m, {
      size: "small",
      bordered: !0,
      dataSource: s,
      renderItem: (A) => n.createElement(
        m.Item,
        {
          actions: [
            n.createElement(
              x,
              { title: A.enabled ? "点击禁用" : "点击启用" },
              n.createElement(k, {
                size: "small",
                checked: A.enabled,
                onChange: (h) => T(A.id, h)
              })
            ),
            n.createElement(
              x,
              { title: "移除此源" },
              n.createElement(
                c,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: $ ? n.createElement($) : void 0,
                  onClick: () => D(A.id)
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
              u,
              { color: A.platform === "gitee" ? "orange" : A.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              A.platform === "gitee" ? "Gitee" : A.platform === "oss" ? "OSS" : "GitHub"
            ),
            n.createElement(
              u,
              { style: { fontSize: 11 } },
              A.label
            ),
            A.skillsPath ? n.createElement(
              R,
              { type: "secondary", style: { fontSize: 11 } },
              `/${A.skillsPath}`
            ) : null,
            A.platform !== "oss" ? n.createElement(
              R,
              { type: "secondary", style: { fontSize: 11 } },
              `@${A.ref}`
            ) : null
          ),
          n.createElement(
            R,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            A.url
          ),
          // Gitee token input for existing Gitee sources
          A.platform === "gitee" ? n.createElement(
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
              value: A.accessToken || "",
              onChange: (h) => J(A.id, h.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function jn({
  open: e,
  onClose: t,
  sources: s,
  onChange: l,
  type: n
}) {
  const a = I().React, { useState: o } = a, {
    Modal: r,
    Input: c,
    Button: m,
    List: u,
    Tag: k,
    Switch: b,
    Typography: x,
    Tooltip: S,
    message: p
  } = I().antd, {
    PlusOutlined: $,
    DeleteOutlined: M,
    LinkOutlined: V,
    ApiOutlined: R,
    UserOutlined: ee,
    ImportOutlined: j,
    ExportOutlined: N,
    CopyOutlined: O
  } = I().antdIcons || {}, { Text: _ } = x, [T, J] = o(""), [D, A] = o(""), [h, v] = o(""), [f, X] = o(!1), G = n === "mcp" ? "MCP" : "专家模板", ae = n === "mcp" ? R ? a.createElement(R, { style: { fontSize: 18 } }) : null : ee ? a.createElement(ee, { style: { fontSize: 18 } }) : null, w = () => {
    const L = T.trim(), q = D.trim();
    if (!L) return;
    const ie = q || L.slice(0, 40), B = `${n}:${L}`;
    if (s.some((y) => y.id === B)) {
      p.warning("该源已存在");
      return;
    }
    const Y = {
      id: B,
      label: ie,
      url: L,
      enabled: !0,
      type: n
    }, oe = [...s, Y];
    n === "mcp" ? yt(oe) : ht(oe), l(oe), J(""), A(""), p.success(`已添加${G}源: ${ie}`);
  }, g = (L, q) => {
    const ie = s.map(
      (B) => B.id === L ? { ...B, enabled: q } : B
    );
    n === "mcp" ? yt(ie) : ht(ie), l(ie);
  }, E = (L) => {
    const q = s.filter((ie) => ie.id !== L);
    n === "mcp" ? yt(q) : ht(q), l(q), p.success("已移除源");
  }, C = () => {
    const L = JSON.stringify(
      { type: n, sources: s },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(L), p.success(`${G}源已复制到剪贴板（${s.length} 个源）`);
    } catch {
      const q = document.createElement("textarea");
      q.value = L, document.body.appendChild(q), q.select(), document.execCommand("copy"), document.body.removeChild(q), p.success(`${G}源已复制到剪贴板（${s.length} 个源）`);
    }
  }, re = () => {
    const L = h.trim();
    if (!L) {
      p.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const q = JSON.parse(L);
      let ie = [];
      if (Array.isArray(q))
        ie = q;
      else if (q && Array.isArray(q.sources))
        ie = q.sources;
      else if (q && typeof q == "object")
        ie = [q];
      else
        throw new Error("Invalid format");
      const B = ie.filter(
        (ne) => ne && typeof ne.url == "string" && typeof ne.label == "string"
      );
      if (B.length === 0) {
        p.error("未找到有效的源数据");
        return;
      }
      const Y = new Set(s.map((ne) => ne.id)), oe = [];
      for (const ne of B) {
        const d = ne.id || `${n}:${ne.url}`;
        Y.has(d) || oe.push({
          id: d,
          label: ne.label,
          url: ne.url,
          enabled: ne.enabled !== !1,
          type: n
        });
      }
      if (oe.length === 0) {
        p.info("所有源均已存在，无新增");
        return;
      }
      const y = [...s, ...oe];
      n === "mcp" ? yt(y) : ht(y), l(y), v(""), X(!1), p.success(`成功导入 ${oe.length} 个${G}源`);
    } catch (q) {
      p.error(`JSON 解析失败: ${q.message || "格式错误"}`);
    }
  };
  return a.createElement(
    r,
    {
      open: e,
      onCancel: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        ae,
        a.createElement("span", null, `配置${G}源`)
      ),
      footer: a.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between" } },
        a.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          a.createElement(
            m,
            {
              icon: N ? a.createElement(N) : void 0,
              onClick: C,
              disabled: s.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          a.createElement(
            m,
            {
              icon: j ? a.createElement(j) : void 0,
              onClick: () => X(!f),
              size: "small"
            },
            f ? "隐藏导入" : "导入JSON"
          )
        ),
        a.createElement(
          m,
          { onClick: t },
          "关闭"
        )
      ),
      width: 680
    },
    // Description
    a.createElement(
      _,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${G}源地址，支持从远程仓库或团队共享的 JSON 导入${G}配置。`
    ),
    // Import section (collapsible)
    f ? a.createElement(
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
      a.createElement(
        _,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${G}源 JSON（支持从导出的剪贴板内容粘贴）`
      ),
      a.createElement(c.TextArea, {
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
        value: h,
        onChange: (L) => v(L.target.value),
        autoSize: { minRows: 4, maxRows: 10 },
        style: { fontFamily: "monospace", fontSize: 12 }
      }),
      a.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8 } },
        a.createElement(
          m,
          {
            type: "primary",
            size: "small",
            onClick: re
          },
          "导入"
        ),
        a.createElement(
          m,
          {
            size: "small",
            onClick: () => v("")
          },
          "清空"
        )
      )
    ) : null,
    // Add new source
    a.createElement(
      "div",
      { style: { marginBottom: 16, display: "flex", gap: 8, alignItems: "center" } },
      a.createElement(c, {
        placeholder: "源名称（可选，如：团队MCP仓库）",
        value: D,
        onChange: (L) => A(L.target.value),
        style: { width: 200 }
      }),
      a.createElement(c, {
        placeholder: n === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: T,
        onChange: (L) => J(L.target.value),
        onPressEnter: w,
        prefix: V ? a.createElement(V) : void 0,
        style: { flex: 1 }
      }),
      a.createElement(
        m,
        {
          type: "primary",
          icon: $ ? a.createElement($) : void 0,
          onClick: w
        },
        "添加"
      )
    ),
    // Source list
    a.createElement(
      "div",
      {
        style: {
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }
      },
      a.createElement(
        _,
        { strong: !0 },
        `已配置源 (${s.length})`
      )
    ),
    a.createElement(u, {
      size: "small",
      bordered: !0,
      dataSource: s,
      renderItem: (L) => a.createElement(
        u.Item,
        {
          actions: [
            a.createElement(
              S,
              { title: L.enabled ? "点击禁用" : "点击启用" },
              a.createElement(b, {
                size: "small",
                checked: L.enabled,
                onChange: (q) => g(L.id, q)
              })
            ),
            a.createElement(
              S,
              { title: "移除此源" },
              a.createElement(
                m,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: M ? a.createElement(M) : void 0,
                  onClick: () => E(L.id)
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
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4
              }
            },
            a.createElement(
              k,
              {
                color: n === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              L.label
            ),
            L.enabled ? null : a.createElement(
              k,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          a.createElement(
            _,
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
    a.createElement(
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
      a.createElement(
        "span",
        null,
        "💡 ",
        "点击「导出到剪贴板」可复制所有源配置，分享给团队成员后粘贴到「导入JSON」即可快速配置。"
      )
    )
  );
}
async function us() {
  return le("/market/providers");
}
async function ps(e) {
  return le(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function gs(e, t, s, l, n) {
  return le("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: t,
      limit: s,
      lang: l,
      category: n || void 0
    })
  });
}
function Bn(e) {
  if (!e) return "";
  const t = e.message || String(e);
  try {
    const s = JSON.parse(t);
    if (s.detail) {
      if (typeof s.detail == "string") return s.detail;
      if (s.detail.message) return s.detail.message;
    }
  } catch {
  }
  return t;
}
async function Un(e, t) {
  const s = { bundle_url: e };
  return t && (s.access_token = t), le("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(s)
  });
}
function fs() {
  const e = I().React, { useState: t, useEffect: s, useCallback: l, useMemo: n, useRef: a } = e, {
    Spin: o,
    Empty: r,
    Input: c,
    Button: m,
    message: u,
    Row: k,
    Col: b,
    Card: x,
    Tag: S,
    Tooltip: p,
    Typography: $,
    Select: M,
    Drawer: V,
    Descriptions: R,
    Tabs: ee,
    Badge: j,
    Progress: N,
    Modal: O
  } = I().antd, {
    ReloadOutlined: _,
    SearchOutlined: T,
    DownloadOutlined: J,
    AppstoreOutlined: D,
    ShopOutlined: A,
    CheckCircleOutlined: h,
    LoadingOutlined: v,
    UserOutlined: f,
    SettingOutlined: X,
    GithubOutlined: G,
    ApiOutlined: ae
  } = I().antdIcons || {}, { Text: w, Paragraph: g, Title: E } = $, [C, re] = t("skills"), [L, q] = t([]), [ie, B] = t([]), [Y, oe] = t([]), [y, ne] = t(""), [d, te] = t(""), [P, se] = t(!1), [de, he] = t(!1), [fe, ue] = t(
    {}
  ), [K, W] = t(null), [z, F] = t({}), [ce, H] = t([]), [pe, Ee] = t(""), [Ce, ze] = t(""), [$e, Ge] = t(""), [dt, at] = t({}), [Le, lt] = t(""), [ut, Xe] = t(/* @__PURE__ */ new Set()), [Ie, st] = t(null), [Oe, Te] = t({}), [Z, ke] = t([]), [Se, Pe] = t([]), [rt, ot] = t(!1), [ve, pt] = t(!1), [It, it] = t([]), [He, tn] = t(!1), [ha, nn] = t([]), [Ea, an] = t(!1), [ln, sn] = t([]), [rn, on] = t([]), [cn, mn] = t(!1), [Ke, dn] = t(""), [un, pn] = t([]), [gn, fn] = t([]), [yn, hn] = t(!1), [Ve, En] = t(""), [Pt, vn] = t(!1), ct = a(null);
  s(() => {
    Promise.all([
      us().catch(() => []),
      ps("zh").catch(() => []),
      Wt().catch(() => [])
    ]).then(([i, U, Q]) => {
      q(i), B(U), H(Q), Q.length > 0 && (Ee(Q[0].id), lt(Q[0].id));
    });
  }, []);
  const gt = l(async (i) => {
    const U = i ?? ts();
    if (ke(i || U), U.filter((me) => me.enabled).length === 0) {
      Pe([]);
      return;
    }
    ot(!0);
    try {
      const { skills: me, errors: ge } = await os(U);
      if (Pe(me), ge.length > 0) {
        for (const be of ge)
          console.warn(`[ugsci] GitHub source '${be.label}' error: ${be.message}`);
        u.warning(
          `部分源加载失败: ${ge.map((be) => be.label).join(", ")}`
        );
      }
    } catch (me) {
      u.error(me.message || "加载技能源失败"), Pe([]);
    } finally {
      ot(!1);
    }
  }, []), mt = l(async (i, U) => {
    var xe, Ae;
    mn(!0), hn(!0);
    const Q = i ?? Rn(), me = U ?? Ln(), [ge, be, ye, _e] = await Promise.allSettled([
      ss(),
      rs(),
      cs(Q),
      ms(me)
    ]);
    if (ge.status === "fulfilled") {
      const we = ge.value.servers, Mt = ye.status === "fulfilled" ? ye.value.servers : [], Rt = new Set(we.map((Me) => Me.id)), Lt = [
        ...we,
        ...Mt.filter((Me) => !Rt.has(Me.id))
      ];
      if (sn(Lt), on(ge.value.categories), ye.status === "fulfilled" && ye.value.errors.length > 0)
        for (const Me of ye.value.errors)
          console.warn(`[ugsci] Custom MCP source error: ${Me}`);
    } else
      console.warn(`[ugsci] MCP manifest error: ${((xe = ge.reason) == null ? void 0 : xe.message) || ge.reason}`), sn([]), on([]);
    if (mn(!1), be.status === "fulfilled") {
      const we = be.value.agents, Mt = _e.status === "fulfilled" ? _e.value.agents : [], Rt = new Set(we.map((Me) => Me.id)), Lt = [
        ...we,
        ...Mt.filter((Me) => !Rt.has(Me.id))
      ];
      if (pn(Lt), fn(be.value.categories), _e.status === "fulfilled" && _e.value.errors.length > 0)
        for (const Me of _e.value.errors)
          console.warn(`[ugsci] Custom expert source error: ${Me}`);
    } else
      console.warn(`[ugsci] Agents manifest error: ${((Ae = be.reason) == null ? void 0 : Ae.message) || be.reason}`), pn([]), fn([]);
    hn(!1);
  }, []);
  s(() => {
    gt(), mt(), it(Rn()), nn(Ln());
  }, [gt, mt]);
  const ft = l(
    async (i, U, Q) => {
      se(!0);
      try {
        const me = await gs(
          i,
          Q,
          20,
          "zh",
          U || void 0
        );
        Q === void 0 || Object.keys(Q).length === 0 ? oe(me.results) : oe((ye) => [...ye, ...me.results]);
        const ge = Object.values(me.by_provider || {}).some(
          (ye) => ye.has_more
        );
        he(ge);
        const be = {};
        for (const [ye, _e] of Object.entries(me.by_provider || {}))
          be[ye] = (Q[ye] || 1) + 1;
        if (ue(be), me.errors.length > 0)
          for (const ye of me.errors)
            console.warn(
              `[ugsci] Market provider '${ye.provider}' error: ${ye.message}`
            );
      } catch (me) {
        u.error(me.message || "搜索市场失败"), oe([]);
      } finally {
        se(!1);
      }
    },
    []
  );
  s(() => (ct.current && clearTimeout(ct.current), ct.current = setTimeout(() => {
    ft(y, "", {});
  }, 400), () => {
    ct.current && clearTimeout(ct.current);
  }), [y, ft]);
  const va = () => {
    ft(y, "", fe);
  }, bn = async (i) => {
    const U = `${i.source}:${i.slug}`;
    try {
      F((me) => ({ ...me, [U]: "installing" }));
      const Q = await Un(i.source_url);
      Q.installed ? u.success(
        `技能「${Q.name || i.name}」已安装到技能池，可在技能中心查看`
      ) : u.info(
        `技能「${Q.name || i.name}」已存在于技能池，无需重复安装`
      ), F((me) => {
        const ge = { ...me };
        return delete ge[U], ge;
      });
    } catch (Q) {
      u.error(Bn(Q) || "安装技能失败"), F((me) => {
        const ge = { ...me };
        return delete ge[U], ge;
      });
    }
  }, ba = (i) => {
    window.history.pushState({}, "", i), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Sa = async (i) => {
    const U = `github:${i.sourceId}:${i.name}`, Q = Z.find((ge) => ge.id === i.sourceId), me = (Q == null ? void 0 : Q.accessToken) || void 0;
    try {
      F((be) => ({ ...be, [U]: "installing" }));
      const ge = await Un(i.source_url, me);
      ge.installed ? u.success(
        `技能「${ge.name || i.name}」已安装到技能池，可在技能中心查看`
      ) : u.info(
        `技能「${ge.name || i.name}」已存在于技能池，无需重复安装`
      ), F((be) => {
        const ye = { ...be };
        return delete ye[U], ye;
      });
    } catch (ge) {
      u.error(Bn(ge) || "安装技能失败"), F((be) => {
        const ye = { ...be };
        return delete ye[U], ye;
      });
    }
  }, Sn = n(() => {
    const i = [], U = /* @__PURE__ */ new Set();
    for (const Q of Se)
      Q.tag && !U.has(Q.tag) && (U.add(Q.tag), i.push({ id: Q.tag, label: Q.tag }));
    for (const Q of Se)
      !Q.isOfficial && Q.sourceLabel && !U.has(Q.sourceLabel) && (U.add(Q.sourceLabel), i.push({ id: Q.sourceLabel, label: Q.sourceLabel }));
    return i;
  }, [Se]), Ot = n(() => {
    let i = Se;
    if (d && (i = i.filter(
      (U) => U.tag === d || U.sourceLabel === d
    )), y.trim()) {
      const U = y.toLowerCase();
      i = i.filter(
        (Q) => {
          var me;
          return Q.name.toLowerCase().includes(U) || ((me = Q.description) == null ? void 0 : me.toLowerCase().includes(U));
        }
      );
    }
    return i;
  }, [Se, y, d]);
  L.filter((i) => i.available);
  const qe = Y, wa = e.createElement(
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
      e.createElement(c, {
        placeholder: "搜索技能市场...",
        prefix: T ? e.createElement(T) : void 0,
        value: y,
        onChange: (i) => ne(i.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      // Pool install info
      e.createElement(
        w,
        { type: "secondary", style: { fontSize: 12 } },
        "安装后进入技能池"
      ),
      // Configure skill source button
      e.createElement(
        m,
        {
          icon: G ? e.createElement(G) : void 0,
          onClick: () => pt(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    Sn.length > 0 ? e.createElement(
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
        "分类:"
      ),
      e.createElement(
        S,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: d === "" ? "blue" : void 0,
          onClick: () => te("")
        },
        "全部"
      ),
      ...Sn.map((i) => {
        const U = Se.some(
          (Q) => !Q.isOfficial && Q.sourceLabel === i.id
        );
        return e.createElement(
          S,
          {
            key: i.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: d === i.id ? U ? "blue" : "geekblue" : void 0,
            icon: U && G ? e.createElement(G) : void 0,
            onClick: () => te(
              d === i.id ? "" : i.id
            )
          },
          i.label
        );
      })
    ) : null,
    // GitHub skills section
    rt && Se.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : Ot.length > 0 ? e.createElement(
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
        G ? e.createElement(G, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        e.createElement(
          w,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${Ot.length})`
        )
      ),
      e.createElement(
        k,
        { gutter: [12, 12] },
        ...Ot.map((i) => {
          const U = `github:${i.sourceId}:${i.name}`, Q = z[U];
          return e.createElement(
            b,
            { key: U, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              x,
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
                G ? e.createElement(G, {
                  style: { fontSize: 18, color: "#57606a" }
                }) : e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                e.createElement(
                  p,
                  { title: i.name },
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
                    i.name
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
                i.description || "暂无描述"
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
                  { style: { display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" } },
                  // Show source path (e.g. "UGSci/anthropics") in bottom-left
                  i.sourcePath || i.sourceLabel ? e.createElement(
                    "span",
                    {
                      style: {
                        fontSize: 10,
                        color: "#999",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 2
                      }
                    },
                    ae ? e.createElement(ae, { style: { fontSize: 10 } }) : null,
                    i.sourcePath || i.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  i.tag ? e.createElement(
                    S,
                    { color: "geekblue", style: { fontSize: 10 } },
                    i.tag
                  ) : null,
                  i.version ? e.createElement(
                    S,
                    { style: { fontSize: 10 } },
                    `v${i.version}`
                  ) : null
                ),
                Q ? e.createElement(
                  m,
                  {
                    size: "small",
                    disabled: !0,
                    icon: v ? e.createElement(v) : void 0
                  },
                  "安装中"
                ) : e.createElement(
                  m,
                  {
                    type: "primary",
                    size: "small",
                    icon: J ? e.createElement(J) : void 0,
                    onClick: () => Sa(i)
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
    qe.length > 0 || P ? e.createElement(
      "div",
      {
        style: {
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      A ? e.createElement(A, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      e.createElement(
        w,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${qe.length > 0 ? ` (${qe.length})` : ""}`
      )
    ) : null,
    // Results grid
    P && qe.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(o, { size: "large" })
    ) : qe.length === 0 ? e.createElement(r, {
      description: y ? `未找到匹配「${y}」的技能` : "输入关键词搜索技能市场",
      image: r.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      k,
      { gutter: [12, 12] },
      ...qe.map((i) => {
        const U = `${i.source}:${i.slug}`, Q = z[U];
        return e.createElement(
          b,
          { key: U, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            x,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => W(i)
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
              i.icon_url ? e.createElement("img", {
                src: i.icon_url,
                alt: i.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : e.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              e.createElement(
                p,
                { title: i.name },
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
                  i.name
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
              i.description || "暂无描述"
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
                  i.source
                ),
                i.version ? e.createElement(
                  S,
                  { style: { fontSize: 10 } },
                  `v${i.version}`
                ) : null
              ),
              Q ? e.createElement(
                m,
                {
                  size: "small",
                  disabled: !0,
                  icon: v ? e.createElement(v) : void 0
                },
                "安装中"
              ) : e.createElement(
                m,
                {
                  type: "primary",
                  size: "small",
                  icon: J ? e.createElement(J) : void 0,
                  onClick: (me) => {
                    me.stopPropagation(), bn(i);
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
    de && !P ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        m,
        { onClick: va, loading: P },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    K ? e.createElement(
      V,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          K.icon_url ? e.createElement("img", {
            src: K.icon_url,
            alt: K.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, K.name)
        ),
        open: !0,
        onClose: () => W(null),
        width: 480,
        extra: e.createElement(
          m,
          {
            type: "primary",
            icon: J ? e.createElement(J) : void 0,
            onClick: () => {
              bn(K);
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
          K.source
        ),
        e.createElement(
          R.Item,
          { label: "描述" },
          K.description || "-"
        ),
        K.version ? e.createElement(
          R.Item,
          { label: "版本" },
          K.version
        ) : null,
        K.author ? e.createElement(
          R.Item,
          { label: "作者" },
          K.author
        ) : null,
        e.createElement(
          R.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: K.source_url, target: "_blank" },
            K.source_url
          )
        )
      ),
      K.stats ? e.createElement(
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
          ...Object.entries(K.stats).map(
            ([i, U]) => e.createElement(
              "div",
              { key: i, style: { textAlign: "center" } },
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
                w,
                { type: "secondary", style: { fontSize: 11 } },
                i
              )
            )
          )
        )
      ) : null
    ) : null
  ), At = n(() => {
    let i = un;
    if (Ve && (i = i.filter((U) => U.category === Ve)), Ce.trim()) {
      const U = Ce.toLowerCase();
      i = i.filter(
        (Q) => Q.name.toLowerCase().includes(U) || Q.description.toLowerCase().includes(U) || Q.tags.some((me) => me.toLowerCase().includes(U))
      );
    }
    return i;
  }, [un, Ce, Ve]), Ca = async (i) => {
    var Q;
    if (Pt) return;
    vn(!0);
    let U = null;
    try {
      let me = i.description;
      if (i.instructions)
        try {
          const _e = i.instructions.replace(/^\/+/, "");
          me = await Mn(_e);
        } catch {
        }
      let ge = [];
      if (i.skills_manifest)
        try {
          const _e = i.skills_manifest.replace(/^\/+/, ""), xe = await Je(_e);
          Array.isArray(xe) ? ge = xe.map((Ae) => typeof Ae == "string" ? Ae : Ae.name).filter(Boolean) : xe.skills && (ge = xe.skills.map((Ae) => typeof Ae == "string" ? Ae : Ae.name).filter(Boolean));
        } catch {
        }
      let be = null;
      if (i.config)
        try {
          const _e = i.config.replace(/^\/+/, "");
          be = await Je(_e);
        } catch {
        }
      const ye = await le("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: i.name,
          description: i.description,
          skill_names: ge
        })
      });
      if (U = ye.id, await wt(ye.id, "AGENTS.md", me), (Q = i.drivers) != null && Q.mcp && Array.isArray(i.drivers.mcp))
        for (const _e of i.drivers.mcp)
          try {
            const xe = _e.replace(/^\/+/, ""), Ae = await Mn(xe), we = is(Ae);
            we && we.client_key && await Ut(ye.id, {
              client_key: we.client_key,
              client: {
                name: we.name || we.client_key,
                description: we.description || "",
                enabled: !0,
                transport: we.transport || "stdio",
                url: we.url || "",
                command: we.command || "",
                args: we.args || [],
                env: we.env || {},
                cwd: we.cwd || "",
                headers: we.headers || {}
              }
            });
          } catch (xe) {
            console.warn(
              `[ugsci] Failed to load MCP driver '${_e}': ${(xe == null ? void 0 : xe.message) || xe}`
            );
          }
      if (be)
        try {
          const xe = { ...await xt(ye.id), ...be };
          xe.name = i.name, xe.description = i.description, await le(`/agents/${encodeURIComponent(ye.id)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(xe)
          });
        } catch {
        }
      u.success(`专家「${i.name}」创建成功，已跳转至专家`), ba("/ugsci-experts");
    } catch (me) {
      if (U)
        try {
          await le(`/agents/${encodeURIComponent(U)}`, {
            method: "DELETE"
          });
        } catch {
        }
      u.error(me.message || "创建专家失败");
    } finally {
      vn(!1);
    }
  }, wn = l(async (i) => {
    if (i)
      try {
        const U = await qt(i);
        Xe(new Set(U.map((Q) => Q.key)));
      } catch {
        Xe(/* @__PURE__ */ new Set());
      }
  }, []);
  s(() => {
    Le && wn(Le);
  }, [Le, wn]);
  const xa = async (i) => {
    if (!Le) {
      u.warning("请先选择目标专家");
      return;
    }
    if (Ja(i)) {
      const U = Object.entries(i.env), Q = {};
      for (const [me] of U)
        Q[me] = "";
      Te(Q), st(i);
      return;
    }
    await Cn(i, i.env || {});
  }, Cn = async (i, U) => {
    at((Q) => ({ ...Q, [i.id]: !0 }));
    try {
      const Q = i.id;
      await Ut(Le, {
        client_key: Q,
        client: {
          name: i.name,
          description: i.description,
          enabled: !0,
          transport: i.transport,
          url: i.url || "",
          command: i.command || "",
          args: i.args || [],
          env: U,
          cwd: i.cwd || "",
          headers: i.headers || {}
        }
      }), u.success(`MCP「${i.name}」已添加到当前专家`), Xe((me) => new Set(me).add(Q));
    } catch (Q) {
      u.error(Q.message || `添加 MCP「${i.name}」失败`);
    } finally {
      at((Q) => ({ ...Q, [i.id]: !1 }));
    }
  }, ka = async () => {
    if (!Ie) return;
    const i = [];
    for (const [Q, me] of Object.entries(Oe))
      if (!me || !me.trim()) {
        const ge = xn[Q];
        i.push((ge == null ? void 0 : ge.label) || Q);
      }
    if (i.length > 0) {
      u.warning(`请填写以下配置项: ${i.join(", ")}`);
      return;
    }
    const U = Ie;
    st(null), Te({}), await Cn(U, { ...Oe });
  }, $t = n(() => {
    let i = ln;
    if (Ke && (i = i.filter((U) => U.category === Ke)), $e.trim()) {
      const U = $e.toLowerCase();
      i = i.filter(
        (Q) => Q.name.toLowerCase().includes(U) || Q.description.toLowerCase().includes(U) || Q.tags.some((me) => me.toLowerCase().includes(U))
      );
    }
    return i.map(es);
  }, [ln, $e, Ke]), _a = e.createElement(
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
      e.createElement(c, {
        placeholder: "搜索 MCP 服务器...",
        prefix: T ? e.createElement(T) : void 0,
        value: $e,
        onChange: (i) => Ge(i.target.value),
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
          value: Le,
          onChange: (i) => lt(i),
          style: { minWidth: 180 },
          size: "small",
          options: ce.map((i) => ({ value: i.id, label: i.name }))
        })
      ),
      // Configure MCP source button
      e.createElement(
        m,
        {
          icon: ae ? e.createElement(ae) : void 0,
          onClick: () => tn(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    rn.length > 0 ? e.createElement(
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
        "分类:"
      ),
      e.createElement(
        S,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Ke === "" ? "blue" : void 0,
          onClick: () => dn("")
        },
        "全部"
      ),
      ...rn.map(
        (i) => e.createElement(
          S,
          {
            key: i.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: Ke === i.id ? "geekblue" : void 0,
            onClick: () => dn(
              Ke === i.id ? "" : i.id
            )
          },
          i.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    cn && $t.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : $t.length === 0 ? e.createElement(r, {
      description: "未找到匹配的 MCP 服务器",
      image: r.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      k,
      { gutter: [12, 12] },
      ...$t.map(
        (i) => e.createElement(
          b,
          { key: i.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            x,
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
                { style: { fontSize: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32 } },
                i.iconUrl ? e.createElement("img", {
                  src: i.iconUrl,
                  alt: i.name,
                  style: { width: 28, height: 28, objectFit: "contain" },
                  onError: (U) => {
                    U.target.style.display = "none";
                  }
                }) : i.emoji
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  w,
                  { strong: !0, style: { fontSize: 14 } },
                  i.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  e.createElement(
                    S,
                    { color: "blue", style: { fontSize: 10 } },
                    i.category
                  ),
                  e.createElement(
                    S,
                    {
                      color: i.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    i.transport
                  ),
                  i.env && Object.keys(i.env).length > 0 ? e.createElement(
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
              i.description
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
                i.transport === "stdio" ? `${i.command} ${(i.args || []).join(" ")}` : i.url || ""
              ),
              ut.has(i.id) ? e.createElement(
                m,
                { size: "small", disabled: !0 },
                "已安装"
              ) : e.createElement(
                m,
                {
                  type: "primary",
                  size: "small",
                  loading: !!dt[i.id],
                  icon: ae ? e.createElement(ae) : void 0,
                  onClick: () => xa(i)
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
      A ? e.createElement(A, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        w,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Ta = Ie ? e.createElement(
    O,
    {
      title: e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        e.createElement("span", { style: { fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 } }, Ie.iconUrl ? e.createElement("img", { src: Ie.iconUrl, alt: Ie.name, style: { width: 22, height: 22, objectFit: "contain" }, onError: (i) => {
          i.target.style.display = "none";
        } }) : Ie.emoji),
        e.createElement("span", null, `配置 ${Ie.name} 密钥`)
      ),
      open: !!Ie,
      onCancel: () => {
        st(null), Te({});
      },
      onOk: ka,
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
    ...Object.entries(Ie.env || {}).map(([i]) => {
      const U = xn[i], Q = (U == null ? void 0 : U.isSecret) !== !1;
      return e.createElement(
        "div",
        { key: i, style: { marginBottom: 16 } },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          e.createElement(
            w,
            { strong: !0, style: { fontSize: 13 } },
            (U == null ? void 0 : U.label) || i
          ),
          e.createElement(
            S,
            { color: "orange", style: { fontSize: 10 } },
            "必填"
          )
        ),
        // Help text with optional link
        U ? e.createElement(
          "div",
          { style: { marginBottom: 6, fontSize: 12, color: "#8c8c8c" } },
          U.help,
          U.link ? e.createElement(
            "a",
            {
              href: U.link,
              target: "_blank",
              rel: "noopener noreferrer",
              style: { marginLeft: 4, fontSize: 12 }
            },
            "获取方式 ↗"
          ) : null
        ) : null,
        // Input field
        Q ? e.createElement(c.Password, {
          placeholder: `请输入 ${(U == null ? void 0 : U.label) || i}`,
          value: Oe[i] || "",
          onChange: (me) => Te((ge) => ({
            ...ge,
            [i]: me.target.value
          })),
          style: { width: "100%" }
        }) : e.createElement(c, {
          placeholder: `请输入 ${(U == null ? void 0 : U.label) || i}`,
          value: Oe[i] || "",
          onChange: (me) => Te((ge) => ({
            ...ge,
            [i]: me.target.value
          })),
          style: { width: "100%" }
        }),
        // Show env key name for reference
        e.createElement(
          w,
          { type: "secondary", style: { fontSize: 11, display: "block", marginTop: 2 } },
          `环境变量名: ${i}`
        )
      );
    })
  ) : null, za = e.createElement(
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
      e.createElement(c, {
        placeholder: "搜索专家模板...",
        prefix: T ? e.createElement(T) : void 0,
        value: Ce,
        onChange: (i) => ze(i.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      e.createElement(
        m,
        {
          icon: f ? e.createElement(f) : void 0,
          onClick: () => an(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    gn.length > 0 ? e.createElement(
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
        "分类:"
      ),
      e.createElement(
        S,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Ve === "" ? "blue" : void 0,
          onClick: () => En("")
        },
        "全部"
      ),
      ...gn.map(
        (i) => e.createElement(
          S,
          {
            key: i.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: Ve === i.id ? "geekblue" : void 0,
            onClick: () => En(
              Ve === i.id ? "" : i.id
            )
          },
          i.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    yn && At.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载专家模板..."))
    ) : At.length === 0 ? e.createElement(r, {
      description: "未找到匹配的专家模板",
      image: r.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      k,
      { gutter: [12, 12] },
      ...At.map(
        (i) => e.createElement(
          b,
          { key: i.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            x,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => Ca(i)
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
              e.createElement(Ue, {
                name: i.name,
                size: 40
              }),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  w,
                  { strong: !0, style: { fontSize: 14 } },
                  i.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  i.category ? e.createElement(
                    S,
                    { color: "blue", style: { fontSize: 10 } },
                    zt(i.category)
                  ) : null,
                  i.tags.includes("mcp") ? e.createElement(
                    S,
                    { color: "purple", style: { fontSize: 10 } },
                    "MCP"
                  ) : null
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
              i.description
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
                i.tags.filter((U) => U !== "agent" && U !== "template" && U !== "workspace").slice(0, 3).join(" · ") || "专家模板"
              ),
              e.createElement(
                m,
                {
                  type: "primary",
                  size: "small",
                  loading: Pt,
                  disabled: Pt,
                  icon: D ? e.createElement(D) : void 0
                },
                "一键创建"
              )
            )
          )
        )
      )
    ),
    // Info hint
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
      A ? e.createElement(A, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        w,
        { type: "secondary", style: { fontSize: 12 } },
        "专家模板来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Ia = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        D ? e.createElement(D, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: wa
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        ae ? e.createElement(ae, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: _a
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        f ? e.createElement(f, { style: { fontSize: 14 } }) : null,
        "专家模板"
      ),
      children: za
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(_t, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 创建专家模板 · 随时更新能力和专家",
      extra: e.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        e.createElement(
          m,
          {
            type: "primary",
            icon: _ ? e.createElement(_) : void 0,
            onClick: () => {
              ft(y, d, {}), gt(), mt();
            },
            loading: P || rt || cn || yn
          },
          "刷新"
        )
      )
    }),
    e.createElement(ee, {
      items: Ia,
      activeKey: C,
      onChange: (i) => re(i)
    }),
    // Skill source config modal
    e.createElement(ds, {
      open: ve,
      onClose: () => pt(!1),
      sources: Z,
      onChange: (i) => {
        ke(i), gt(i);
      }
    }),
    // MCP source config modal
    e.createElement(jn, {
      open: He,
      onClose: () => tn(!1),
      sources: It,
      onChange: (i) => {
        it(i), mt(i, void 0);
      },
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    Ta,
    // Expert source config modal
    e.createElement(jn, {
      open: Ea,
      onClose: () => an(!1),
      sources: ha,
      onChange: (i) => {
        nn(i), mt(void 0, i);
      },
      type: "expert"
    })
  );
}
function ys() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const Nn = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, Dn = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function hs() {
  const e = I(), t = e.React, { useEffect: s, useRef: l } = t, n = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, a = (n == null ? void 0 : n.id) || "default", o = l(null), r = l(null);
  return s(() => {
    if (o.current === a) return;
    o.current = a;
    const c = ys(), m = Nn[c] || Nn.en, u = Dn[c] || Dn.en;
    let k = !1;
    return (async () => {
      var b, x;
      try {
        const S = await kt(a);
        if (k) return;
        const p = Jn(S);
        if (r.current) {
          try {
            r.current();
          } catch {
          }
          r.current = null;
        }
        const $ = window.QwenPaw;
        (b = $ == null ? void 0 : $.chat) != null && b.welcome && (p.length > 0 ? (r.current = $.chat.welcome.set("ugsci", {
          description: m,
          prompts: p
        }), console.info(
          `[ugsci] Injected ${p.length} welcome prompts for agent "${a}"`
        )) : (r.current = $.chat.welcome.set("ugsci", {
          description: m,
          prompts: [u]
        }), console.info(
          `[ugsci] No skills for agent "${a}" — using default prompt`
        )));
      } catch (S) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${a}":`,
          S
        );
        const p = window.QwenPaw;
        if ((x = p == null ? void 0 : p.chat) != null && x.welcome && !k) {
          if (r.current) {
            try {
              r.current();
            } catch {
            }
            r.current = null;
          }
          r.current = p.chat.welcome.set("ugsci", {
            description: m,
            prompts: [u]
          });
        }
      }
    })(), () => {
      k = !0;
    };
  }, [a]), null;
}
function Es() {
  var m, u, k;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = I().React, s = "ugsci";
  (u = (m = e.chat) == null ? void 0 : m.rightHeader) != null && u.add ? (e.chat.rightHeader.add(s, t.createElement(hs), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const l = I().antdIcons || {}, n = l.UserSwitchOutlined, a = l.ToolOutlined, o = l.ThunderboltOutlined, r = l.ShopOutlined;
  e.route.add(s, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: Il
  }), e.menu.add(s, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家",
    icon: n ? t.createElement(n, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => Ye()
  }), e.route.add(s, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: ql
  }), e.menu.add(s, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "工具",
    icon: a ? t.createElement(a, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.capabilities",
    order: 6,
    visible: () => Ye()
  }), e.route.add(s, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: Zl
  }), e.menu.add(s, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.skills-center",
    order: 7,
    visible: () => Ye()
  }), e.route.add(s, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: fs
  }), e.menu.add(s, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: r ? t.createElement(r, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 8,
    visible: () => Ye()
  }), (k = e.sidebar) != null && k.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
    "ugsci.experts",
    "ugsci.capabilities",
    "ugsci.skills-center",
    "ugsci.market"
  ]), console.info("[ugsci] Registered 4 items for simple-mode visibility")) : console.warn(
    "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode"
  );
  const c = [
    "core.skills",
    "core.tools",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool"
  ];
  for (const b of c) {
    try {
      const S = e.menu.snapshot("primary.agentScoped").find((p) => p.id === b);
      S && e.menu.replace(s, b, {
        ...S,
        visible: () => !Ye()
      });
    } catch {
    }
    try {
      const S = e.menu.snapshot("primary.settings").find((p) => p.id === b);
      S && e.menu.replace(s, b, {
        ...S,
        visible: () => !Ye()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active"
  );
}
function Ht() {
  try {
    Es();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Ht, 500);
  }
}
var Fn;
if ((Fn = window.QwenPaw) != null && Fn.host)
  Ht();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), Ht());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
