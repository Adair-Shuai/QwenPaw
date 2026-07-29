function T() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function va() {
  try {
    return T().getApiToken() || "";
  } catch {
    return "";
  }
}
function Ye(e) {
  return T().getApiUrl(e);
}
function On(e) {
  const t = va();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
const It = /* @__PURE__ */ new Map(), ba = 15e3;
function Qe() {
  It.clear();
}
async function le(e, t) {
  const a = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: n, ...l } = t || {};
  if (a !== "GET" && Qe(), a === "GET" && !n) {
    const o = It.get(e);
    if (o && Date.now() - o.ts < ba)
      return o.data;
  }
  const s = await fetch(Ye(e), {
    ...l,
    headers: { ...On(), ...l.headers || {} }
  });
  if (!s.ok) {
    const o = await s.text().catch(() => "");
    throw new Error(o || `HTTP ${s.status}`);
  }
  if (s.status === 204) return null;
  const r = await s.json();
  return a === "GET" && It.set(e, { data: r, ts: Date.now() }), r;
}
async function Lt() {
  const e = await le("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function jt(e) {
  return le(`/agents/${encodeURIComponent(e)}`);
}
async function ht(e) {
  return await le("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Bt(e = !1) {
  return await le(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function Sa(e) {
  const t = await le(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function wa() {
  return await le("/skills/workspaces") || [];
}
async function Ca(e) {
  return await le("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function xa(e, t) {
  return le(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function ka(e, t) {
  await le(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function _a(e, t, a) {
  return le("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ client_key: t, client: a })
  });
}
async function Ta(e, t, a) {
  return le(
    `/mcp/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(a)
    }
  );
}
async function za(e, t) {
  return await le(
    `/mcp/tools/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
async function Ia(e, t) {
  return le(
    `/mcp/policy/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  );
}
async function Pa(e, t, a) {
  return le(
    `/mcp/policy/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(a)
    }
  );
}
async function Oa(e) {
  return await le(
    "/mcp/access-principals",
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
async function Aa(e, t, a) {
  return le(
    `/mcp/oauth/start/${encodeURIComponent(t)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(a)
    }
  );
}
async function Ma(e, t) {
  return le(
    `/mcp/oauth/status/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  );
}
async function $a(e, t) {
  await le(
    `/mcp/oauth/${encodeURIComponent(t)}`,
    {
      method: "DELETE",
      headers: { "X-Agent-Id": e }
    }
  );
}
const Pe = {
  background: "#0072f5",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8
};
function Je() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function Ut(e, t) {
  const a = T();
  return a.ReactMarkdown && a.remarkGfm ? t.createElement(
    a.ReactMarkdown,
    { remarkPlugins: [a.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
const fn = {
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
function Ra(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, a]) => typeof a == "string" && a.length > 0);
}
const La = [
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
], ja = La, An = "ugsci_custom_teams";
function gt() {
  try {
    const e = localStorage.getItem(An);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function Mn(e) {
  try {
    localStorage.setItem(An, JSON.stringify(e));
  } catch {
  }
}
const Ba = [
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
async function Ua(e, t) {
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
      ...On(),
      "X-Agent-Id": e
    },
    body: JSON.stringify(a)
  });
}
function ft(e, t) {
  const a = e.find(
    (l) => l.name === t || l.name === t.replace(/\s+/g, "")
  );
  if (a) return a.id;
  const n = e.find(
    (l) => l.name.includes(t) || t.includes(l.name) || l.name.replace(/\s+/g, "").includes(t.replace(/\s+/g, ""))
  );
  return n ? n.id : null;
}
function Na(e) {
  var a;
  const t = e.members.map((n) => `- ${n.name}（${n.role}）`).join(`
`);
  if (e.custom && e.steps && e.steps.length > 0) {
    const n = e.steps.map((s, r) => {
      const o = s.passContext ? "（传递上一步的结果作为上下文）" : "（独立执行，不传递上下文）";
      return `${r + 1}. 向「${s.agentName}」发送请求：${s.instruction} ${o}`;
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
function Da({ team: e }) {
  const t = T().React, { Typography: a, Tag: n } = T().antd, { Text: l } = a, s = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙"
  }, r = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff"
  }, o = e.steps || [], d = o.length > 0;
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
      ...d ? o.map((c, u) => (e.members.find(
        (z) => z.name === c.agentName
      ), [
        u > 0 && e.mode !== "roundtable" ? t.createElement(
          "div",
          {
            key: `arrow-${u}`,
            style: {
              textAlign: "center",
              color: r[e.mode],
              fontSize: 14
            }
          },
          s[e.mode]
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
              border: `1px solid ${r[e.mode]}33`,
              fontSize: 12,
              flex: e.mode === "roundtable" ? "1 1 200px" : "initial"
            }
          },
          t.createElement($e, {
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
      ])).flat() : e.members.map((c, u) => [
        u > 0 && e.mode !== "roundtable" ? t.createElement(
          "div",
          {
            key: `arrow-${u}`,
            style: {
              textAlign: "center",
              color: r[e.mode],
              fontSize: 14
            }
          },
          s[e.mode]
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
              border: `1px solid ${r[e.mode]}33`,
              fontSize: 12,
              flex: e.mode === "roundtable" ? "1 1 150px" : "initial"
            }
          },
          t.createElement($e, { name: c.name, size: 24 }),
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
function Fa({
  open: e,
  onClose: t,
  agents: a,
  editingTeam: n,
  onSaved: l
}) {
  const s = T().React, { useState: r, useEffect: o, useCallback: d } = s, {
    Modal: c,
    Input: u,
    Button: z,
    Select: C,
    Tag: P,
    Typography: w,
    Switch: p,
    Empty: M,
    message: $,
    Divider: J,
    Steps: L
  } = T().antd, { PlusOutlined: ee, DeleteOutlined: B, SaveOutlined: N, ArrowRightOutlined: O } = T().antdIcons || {}, { Text: x, Paragraph: k } = w, [V, D] = r(""), [A, E] = r("🤝"), [v, f] = r(""), [q, G] = r(
    "pipeline"
  ), [ae, b] = r(""), [g, h] = r(""), [S, oe] = r([]), [j, Q] = r([]), [ie, U] = r(!1);
  o(() => {
    e && (n ? (D(n.name), E(n.emoji), f(n.description), G(n.mode), b(n.coordinatorName || ""), h(n.taskTemplate), oe(n.steps || []), Q(n.members.map((I) => I.name))) : (D(""), E("🤝"), f(""), G("pipeline"), b(""), h(`请执行以下任务：
任务描述：{任务描述}`), oe([]), Q([])));
  }, [e, n]);
  const X = d(() => {
    if (q === "roundtable") {
      const I = j.map((se) => ({
        agentName: se,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      oe(I);
    } else if (q === "pipeline") {
      const I = new Map(S.map((de) => [de.agentName, de])), se = j.map((de) => I.get(de) || {
        agentName: de,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      oe(se);
    }
  }, [q, j, S]), re = (I) => {
    j.includes(I) || (Q([...j, I]), q === "coordinator" && !ae && b(I));
  }, y = (I) => {
    Q(j.filter((se) => se !== I)), oe(S.filter((se) => se.agentName !== I)), ae === I && b(j[0] || "");
  }, ne = (I, se, de) => {
    const ye = [...S];
    ye[I] = { ...ye[I], [se]: de }, oe(ye);
  }, m = () => {
    if (!V.trim()) {
      $.warning("请输入团队名称");
      return;
    }
    if (j.length < 2) {
      $.warning("至少需要选择 2 个成员");
      return;
    }
    if (!g.trim()) {
      $.warning("请输入任务模板");
      return;
    }
    if (q === "coordinator" && !ae) {
      $.warning("请选择协调者");
      return;
    }
    U(!0);
    try {
      const I = j.map(
        (ue) => {
          var W;
          const Y = a.find((_) => _.name === ue);
          return {
            name: ue,
            role: ((W = Y == null ? void 0 : Y.description) == null ? void 0 : W.slice(0, 30)) || "团队成员",
            emoji: ""
          };
        }
      );
      let se = S;
      (S.length === 0 || S.length !== j.length) && (se = j.map((ue) => ({
        agentName: ue,
        instruction: "请完成你的专业部分",
        passContext: q === "pipeline"
      })));
      const de = {
        id: (n == null ? void 0 : n.id) || `custom-${Date.now()}`,
        name: V.trim(),
        emoji: A,
        category: "自定义",
        description: v.trim() || `${V.trim()}（${j.length}人团队）`,
        mode: q,
        members: I,
        coordinatorName: q === "coordinator" ? ae : void 0,
        taskTemplate: g.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: se,
        custom: !0,
        createdAt: (n == null ? void 0 : n.createdAt) || Date.now()
      }, ye = gt(), fe = ye.findIndex((ue) => ue.id === de.id);
      fe >= 0 ? ye[fe] = de : ye.push(de), Mn(ye), $.success(n ? "团队已更新" : "团队已创建"), l(), t();
    } catch (I) {
      $.error(I.message || "保存失败");
    } finally {
      U(!1);
    }
  }, te = a.filter(
    (I) => !j.includes(I.name)
  );
  return s.createElement(
    c,
    {
      open: e,
      onCancel: t,
      title: s.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        s.createElement(
          "span",
          { style: { fontSize: 20 } },
          n ? "✏️" : "➕"
        ),
        s.createElement(
          "span",
          null,
          n ? "编辑专家团" : "创建专家团"
        )
      ),
      width: 720,
      onOk: m,
      okText: "保存团队",
      confirmLoading: ie,
      okButtonProps: {
        icon: N ? s.createElement(N) : void 0
      }
    },
    // Step 1: Basic info
    s.createElement(
      "div",
      { style: { marginBottom: 16 } },
      s.createElement(
        x,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 基本信息"
      ),
      s.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        j.length > 0 ? s.createElement(Ht, {
          members: j,
          size: 36
        }) : null,
        s.createElement(u, {
          placeholder: "团队名称（如：储层评价团队）",
          value: V,
          onChange: (I) => D(I.target.value),
          style: { flex: 1 }
        })
      ),
      s.createElement(u.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: v,
        onChange: (I) => f(I.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      s.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        s.createElement(
          x,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式："
        ),
        s.createElement(C, {
          value: q,
          onChange: (I) => G(I),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" }
          ]
        })
      )
    ),
    s.createElement(J, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    s.createElement(
      "div",
      { style: { marginBottom: 16 } },
      s.createElement(
        x,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 选择团队成员"
      ),
      // Available agents
      te.length > 0 ? s.createElement(
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
          (I) => s.createElement(
            z,
            {
              key: I.id,
              size: "small",
              icon: ee ? s.createElement(ee) : void 0,
              onClick: () => re(I.name)
            },
            I.name
          )
        )
      ) : null,
      // Selected members
      j.length === 0 ? s.createElement(M, {
        description: "请从上方添加团队成员",
        image: M.PRESENTED_IMAGE_SIMPLE
      }) : s.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...j.map(
          (I) => s.createElement(
            "div",
            {
              key: I,
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
            s.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 6 } },
              s.createElement($e, { name: I, size: 24 }),
              s.createElement(
                x,
                { strong: !0, style: { fontSize: 13 } },
                I
              ),
              q === "coordinator" && ae === I ? s.createElement(
                P,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            s.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              q === "coordinator" ? s.createElement(
                z,
                {
                  size: "small",
                  type: "link",
                  onClick: () => b(I)
                },
                "设为协调者"
              ) : null,
              s.createElement(
                z,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: B ? s.createElement(B) : void 0,
                  onClick: () => y(I)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    s.createElement(J, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    j.length > 0 ? s.createElement(
      "div",
      { style: { marginBottom: 16 } },
      s.createElement(
        x,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${q === "roundtable" ? "（各步独立执行）" : q === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      s.createElement(
        z,
        {
          size: "small",
          type: "dashed",
          onClick: X,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      S.length === 0 ? s.createElement(
        x,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : s.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...S.map(
          (I, se) => s.createElement(
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
            s.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6
                }
              },
              q === "pipeline" ? s.createElement(
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
              ) : s.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              s.createElement(
                P,
                { color: "blue", style: { fontSize: 11 } },
                I.agentName
              ),
              s.createElement(
                "div",
                { style: { flex: 1 } },
                s.createElement(u, {
                  placeholder: "请输入该步骤的指令...",
                  value: I.instruction,
                  onChange: (de) => ne(se, "instruction", de.target.value),
                  size: "small"
                })
              )
            ),
            s.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  paddingLeft: 28
                }
              },
              s.createElement(p, {
                size: "small",
                checked: I.passContext,
                onChange: (de) => ne(se, "passContext", de)
              }),
              s.createElement(
                x,
                { type: "secondary", style: { fontSize: 11 } },
                I.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    s.createElement(J, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    s.createElement(
      "div",
      null,
      s.createElement(
        x,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${j.length > 0 ? "4" : "3"}. 任务模板`
      ),
      s.createElement(u.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: g,
        onChange: (I) => h(I.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      s.createElement(
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
function yn({
  team: e,
  agents: t,
  onLaunch: a,
  onEdit: n,
  onDelete: l
}) {
  var v;
  const s = T().React, { useState: r } = s, { Card: o, Tag: d, Typography: c, Button: u, Tooltip: z } = T().antd, {
    TeamOutlined: C,
    RocketOutlined: P,
    UserOutlined: w,
    EditOutlined: p,
    DeleteOutlined: M,
    DownOutlined: $,
    UpOutlined: J
  } = T().antdIcons || {}, { Text: L, Paragraph: ee } = c, [B, N] = r(!1), O = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, x = O[e.mode] || O.coordinator, k = e.members.map((f) => {
    const q = ft(t, f.name);
    return { ...f, found: !!q, agentId: q };
  }), V = k.filter((f) => f.found).length, D = V === e.members.length, A = e.coordinatorName || ((v = e.members[0]) == null ? void 0 : v.name), E = A ? ft(t, A) : null;
  return s.createElement(
    o,
    {
      hoverable: !0,
      size: "small",
      style: { height: "100%", display: "flex", flexDirection: "column" }
    },
    // Header: emoji + name + mode tag + custom badge
    s.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10
        }
      },
      s.createElement(Ht, {
        members: e.members.map((f) => f.name),
        size: 36
      }),
      s.createElement(
        "div",
        { style: { flex: 1 } },
        s.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          s.createElement(
            L,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? s.createElement(
            d,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          s.createElement(
            d,
            { color: x.color, style: { fontSize: 10 } },
            x.label
          ),
          s.createElement(
            d,
            { style: { fontSize: 10 } },
            `${V}/${e.members.length}`
          ),
          D ? null : s.createElement(
            d,
            { color: "orange", style: { fontSize: 10 } },
            "缺少成员"
          )
        )
      ),
      // Edit/delete for custom teams
      e.custom ? s.createElement(
        "div",
        { style: { display: "flex", gap: 2 } },
        n ? s.createElement(
          z,
          { title: "编辑" },
          s.createElement(u, {
            type: "text",
            size: "small",
            icon: p ? s.createElement(p) : void 0,
            onClick: (f) => {
              f.stopPropagation(), n(e);
            }
          })
        ) : null,
        l ? s.createElement(
          z,
          { title: "删除" },
          s.createElement(u, {
            type: "text",
            size: "small",
            danger: !0,
            icon: M ? s.createElement(M) : void 0,
            onClick: (f) => {
              f.stopPropagation(), l(e);
            }
          })
        ) : null
      ) : null
    ),
    // Description
    s.createElement(
      ee,
      {
        type: "secondary",
        style: { fontSize: 12, margin: 0, marginBottom: 10, lineHeight: 1.5 },
        ellipsis: { rows: 2 }
      },
      e.description
    ),
    // Member avatars
    s.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 6,
          marginBottom: 10,
          flexWrap: "wrap"
        }
      },
      ...k.map(
        (f) => s.createElement(
          z,
          {
            key: f.name,
            title: `${f.name}（${f.role}）${f.found ? "" : " - 未创建"}`
          },
          s.createElement(
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
            s.createElement($e, { name: f.name, size: 18 }),
            s.createElement(
              L,
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
    s.createElement(
      u,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (f) => {
          f.stopPropagation(), N(!B);
        },
        icon: B ? J ? s.createElement(J) : "▲" : $ ? s.createElement($) : "▼"
      },
      B ? "收起流程" : "查看执行流程"
    ),
    B ? s.createElement(Da, { team: e }) : null,
    // Footer: launch button
    s.createElement(
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
      s.createElement(
        L,
        { type: "secondary", style: { fontSize: 11 } },
        A ? `协调者: ${A}` : ""
      ),
      s.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: P ? s.createElement(P) : void 0,
          disabled: !E,
          onClick: () => a(e),
          style: Pe
        },
        "发起团队任务"
      )
    )
  );
}
function Ga({
  agents: e,
  onLaunch: t
}) {
  const a = T().React, { useMemo: n, useState: l, useCallback: s, useEffect: r } = a, {
    Row: o,
    Col: d,
    Input: c,
    Empty: u,
    Typography: z,
    Tag: C,
    Button: P,
    Divider: w,
    message: p,
    Popconfirm: M
  } = T().antd, { SearchOutlined: $, TeamOutlined: J, PlusOutlined: L, RocketOutlined: ee } = T().antdIcons || {}, { Text: B } = z, [N, O] = l(""), [x, k] = l([]), [V, D] = l(!1), [A, E] = l(null);
  r(() => {
    k(gt());
  }, []);
  const v = s(() => {
    k(gt());
  }, []), f = s(
    (S) => {
      const j = gt().filter((Q) => Q.id !== S.id);
      Mn(j), k(j), p.success(`团队「${S.name}」已删除`);
    },
    [p]
  ), q = s((S) => {
    E(S), D(!0);
  }, []), G = s(() => {
    E(null), D(!0);
  }, []), ae = n(() => [...x, ...Ba], [x]), b = n(() => {
    if (!N.trim()) return ae;
    const S = N.toLowerCase();
    return ae.filter(
      (oe) => oe.name.toLowerCase().includes(S) || oe.description.toLowerCase().includes(S) || oe.category.toLowerCase().includes(S)
    );
  }, [ae, N]), g = b.filter((S) => S.custom), h = b.filter((S) => !S.custom);
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
        B,
        { style: { fontSize: 13, color: "#389e0d" } },
        "多智能体协同 — 选择预设团队或创建自定义团队，支持流水线、圆桌讨论、协调者三种编排模式。"
      ),
      a.createElement(
        P,
        {
          type: "primary",
          size: "small",
          icon: L ? a.createElement(L) : void 0,
          onClick: G,
          style: Pe
        },
        "创建专家团"
      )
    ),
    // Search
    a.createElement(c, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: $ ? a.createElement($) : void 0,
      value: N,
      onChange: (S) => O(S.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Custom teams section
    g.length > 0 ? a.createElement(
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
          B,
          { strong: !0, style: { fontSize: 14 } },
          `自定义团队 (${g.length})`
        )
      ),
      a.createElement(
        o,
        { gutter: [12, 12] },
        ...g.map(
          (S) => a.createElement(
            d,
            { key: S.id, xs: 24, sm: 12, md: 8 },
            a.createElement(yn, {
              team: S,
              agents: e,
              onLaunch: t,
              onEdit: q,
              onDelete: f
            })
          )
        )
      ),
      a.createElement(w, { style: { margin: "16px 0" } })
    ) : null,
    // Preset teams section
    h.length > 0 ? a.createElement(
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
          B,
          { strong: !0, style: { fontSize: 14 } },
          `预设团队 (${h.length})`
        ),
        a.createElement(
          B,
          { type: "secondary", style: { fontSize: 12 } },
          "· 行业典型工作流模板"
        )
      ),
      a.createElement(
        o,
        { gutter: [12, 12] },
        ...h.map(
          (S) => a.createElement(
            d,
            { key: S.id, xs: 24, sm: 12, md: 8 },
            a.createElement(yn, {
              team: S,
              agents: e,
              onLaunch: t
            })
          )
        )
      )
    ) : null,
    // Empty state
    b.length === 0 ? a.createElement(u, {
      description: "未找到匹配的专家团队，点击「创建专家团」自定义",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : null,
    // Team Builder Modal
    a.createElement(Fa, {
      open: V,
      onClose: () => {
        D(!1), E(null);
      },
      agents: e,
      editingTeam: A,
      onSaved: v
    })
  );
}
function $n(e) {
  var a;
  const t = [];
  for (const n of e) {
    if (n.enabled === !1) continue;
    const l = (a = n.description) == null ? void 0 : a.trim();
    if (!l) continue;
    const s = (n.name || l).length > 20 ? (n.name || l).substring(0, 18) + "…" : n.name || l;
    let r = l;
    if (r = r.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(r) ? r = `请${r}` : /^(a |an |the )/i.test(r) ? r = `Help me with ${r}` : /[。？！.?!]$/.test(r) || (r = `帮我${r}`), r.length > 80 && (r = r.substring(0, 77) + "..."), t.push({ label: s, value: r }), t.length >= 4) break;
  }
  return t;
}
async function Ha(e) {
  return await le("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function yt(e, t, a) {
  await le(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: a })
  });
}
async function En(e, t) {
  const a = await jt(e);
  a.system_prompt_files = t, await le(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(a)
  });
}
async function Nt(e, t) {
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
async function Rn(e, t) {
  await le(`/skills/${encodeURIComponent(t)}/enable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Dt(e, t) {
  await le(`/skills/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Wa(e, t) {
  return le("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Ja(e, t) {
  return le("/skills/batch-disable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Xa(e, t) {
  return le("/skills/batch-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Ft(e) {
  return await le("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Ln(e, t) {
  await le(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function jn(e, t) {
  return le("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Ka(e, t) {
  return le(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Bn(e, t) {
  await le(`/skills/${encodeURIComponent(t)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Va(e) {
  await le(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function qa(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const a = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!a) return { number: 6, unit: "h" };
  const n = parseInt(a[1] || "0", 10), l = parseInt(a[2] || "0", 10), s = parseInt(a[3] || "0", 10), r = n * 60 + l + Math.round(s / 60);
  return r <= 0 ? { number: 6, unit: "h" } : r >= 60 && r % 60 === 0 ? { number: r / 60, unit: "h" } : { number: r, unit: "m" };
}
function Ya(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function Qa(e) {
  return le("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function Za(e, t) {
  return le("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function el(e) {
  await le("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function tl(e) {
  return le("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function nl(e, t) {
  return le("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function al(e) {
  return (await le("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function ll(e, t) {
  await le("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function sl() {
  return (await le("/config/user-timezone")).timezone || "UTC";
}
async function ol(e) {
  await le("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function rl(e) {
  return await le("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const hn = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function vt({
  title: e,
  subtitle: t,
  extra: a
}) {
  const n = T().React, { Space: l } = T().antd;
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
function vn({
  items: e,
  max: t = 5,
  color: a = "blue",
  emptyText: n = "无"
}) {
  const l = T().React, { Tag: s } = T().antd;
  return !e || e.length === 0 ? l.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    n
  ) : l.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (r, o) => l.createElement(
        s,
        { key: o, color: a, style: { fontSize: 11, marginRight: 0 } },
        r
      )
    ),
    e.length > t ? l.createElement(
      s,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function Un({
  open: e,
  onClose: t,
  poolSkills: a,
  installedSkillNames: n,
  loading: l,
  onInstall: s
}) {
  const r = T().React, { useState: o, useEffect: d, useMemo: c } = r, { Modal: u, Button: z, Empty: C, Spin: P, Input: w, Tag: p, Tooltip: M, Typography: $ } = T().antd, { CheckOutlined: J, SearchOutlined: L } = T().antdIcons || {}, { Text: ee } = $, [B, N] = o([]), [O, x] = o("");
  d(() => {
    e && (N([]), x(""));
  }, [e]);
  const k = c(() => {
    if (!O.trim()) return a;
    const E = O.toLowerCase();
    return a.filter(
      (v) => {
        var f, q;
        return v.name.toLowerCase().includes(E) || ((f = v.description) == null ? void 0 : f.toLowerCase().includes(E)) || ((q = v.tags) == null ? void 0 : q.some((G) => G.toLowerCase().includes(E)));
      }
    );
  }, [a, O]), V = k.filter(
    (E) => !n.includes(E.name)
  ), D = (E) => {
    N(
      (v) => v.includes(E) ? v.filter((f) => f !== E) : [...v, E]
    );
  }, A = async () => {
    B.length !== 0 && (await s(B), N([]));
  };
  return r.createElement(
    u,
    {
      open: e,
      onCancel: t,
      title: "从技能池选择技能",
      width: 680,
      footer: r.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }
        },
        r.createElement(
          ee,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${B.length} 个技能`
        ),
        r.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          r.createElement(z, { onClick: t }, "取消"),
          r.createElement(
            z,
            {
              type: "primary",
              onClick: A,
              disabled: B.length === 0
            },
            B.length > 0 ? `添加 (${B.length})` : "添加"
          )
        )
      )
    },
    // Search + bulk actions bar
    r.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 8,
          alignItems: "center"
        }
      },
      r.createElement(w, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: L ? r.createElement(L) : void 0,
        value: O,
        onChange: (E) => x(E.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      r.createElement(
        z,
        {
          size: "small",
          type: "primary",
          onClick: () => N(V.map((E) => E.name))
        },
        "全选"
      ),
      r.createElement(
        z,
        {
          size: "small",
          onClick: () => N([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    l ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      r.createElement(P, { size: "large" })
    ) : k.length === 0 ? r.createElement(C, {
      description: O ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: C.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(
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
      ...k.map((E) => {
        const v = B.includes(E.name), f = n.includes(E.name);
        return r.createElement(
          "div",
          {
            key: E.name,
            onClick: () => !f && D(E.name),
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
          v ? r.createElement(
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
            J ? r.createElement(J) : "✓"
          ) : null,
          f ? r.createElement(
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
          r.createElement(
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
            r.createElement(
              "span",
              { style: { fontSize: 16 } },
              E.emoji || "⚡"
            ),
            r.createElement(
              M,
              { title: E.name },
              r.createElement(
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
                E.name
              )
            )
          ),
          E.description ? r.createElement(
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
          E.tags && E.tags.length > 0 ? r.createElement(
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
              (q, G) => r.createElement(
                p,
                {
                  key: G,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                q
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
}, Nn = { marginBottom: 16 }, Dn = {
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
}, Fn = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function il({ agentId: e }) {
  const t = T().React, { useState: a, useEffect: n, useCallback: l } = t, {
    Switch: s,
    InputNumber: r,
    Select: o,
    Button: d,
    Spin: c,
    Space: u,
    Typography: z,
    message: C
  } = T().antd, { PlayCircleOutlined: P, SaveOutlined: w } = T().antdIcons || {}, { Text: p } = z, [M, $] = a(!0), [J, L] = a(!1), [ee, B] = a(!1), [N, O] = a(!1), [x, k] = a(6), [V, D] = a("h"), [A, E] = a("main"), [v, f] = a(300), [q, G] = a(!1), [ae, b] = a("08:00"), [g, h] = a("22:00"), S = l(async () => {
    var X, re;
    $(!0);
    try {
      const y = await Qa(e), ne = qa(y.every ?? "6h");
      O(y.enabled ?? !1), k(ne.number), D(ne.unit), E(y.target ?? "main"), f(y.timeoutSeconds ?? 300), G(!!y.activeHours), b(((X = y.activeHours) == null ? void 0 : X.start) ?? "08:00"), h(((re = y.activeHours) == null ? void 0 : re.end) ?? "22:00");
    } catch (y) {
      C.error(y.message || "加载心跳配置失败");
    } finally {
      $(!1);
    }
  }, [e]);
  n(() => {
    S();
  }, [S]);
  const oe = async () => {
    L(!0);
    try {
      await Za(e, {
        enabled: N,
        every: Ya({ number: x, unit: V }),
        target: A,
        timeoutSeconds: v,
        activeHours: q && ae && g ? { start: ae, end: g } : void 0
      }), C.success("心跳配置已保存");
    } catch (X) {
      C.error(X.message || "保存心跳配置失败");
    } finally {
      L(!1);
    }
  }, j = async () => {
    B(!0);
    try {
      await el(e), C.success("已触发心跳检查");
    } catch (X) {
      C.error(X.message || "触发心跳失败");
    } finally {
      B(!1);
    }
  };
  if (M)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(c, { size: "large" })
    );
  const Q = (X, re, y) => t.createElement(
    "div",
    { style: Nn },
    t.createElement("div", { style: Xe }, X),
    re,
    y ? t.createElement(
      p,
      { type: "secondary", style: Fn },
      y
    ) : null
  ), ie = (X, re, y, ne) => t.createElement(
    "div",
    { style: Dn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Xe }, X),
      re
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Xe }, y),
      ne
    )
  ), { Divider: U } = T().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: je }, "基本设置"),
    Q(
      "启用心跳",
      t.createElement(s, {
        checked: N,
        onChange: (X) => O(X)
      }),
      N ? "已启用，专家将定期自检" : "已停用"
    ),
    ie(
      "检查频率",
      t.createElement(
        u,
        null,
        t.createElement(r, {
          min: 1,
          value: x,
          onChange: (X) => k(X ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(o, {
          value: V,
          onChange: (X) => D(X),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(o, {
        value: A,
        onChange: (X) => E(X),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    Q(
      "超时时间 (秒)",
      t.createElement(r, {
        min: 1,
        max: 3600,
        value: v,
        onChange: (X) => f(X ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(U, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: je }, "活跃时段"),
    Q(
      "启用活跃时段限制",
      t.createElement(s, {
        checked: q,
        onChange: (X) => G(X)
      }),
      "仅在指定时段内触发心跳"
    ),
    q ? ie(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: ae,
        onChange: (X) => b(X.target.value),
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
        onChange: (X) => h(X.target.value),
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
        d,
        {
          type: "primary",
          icon: w ? t.createElement(w) : void 0,
          loading: J,
          onClick: oe,
          style: Pe
        },
        "保存配置"
      ),
      t.createElement(
        d,
        {
          icon: P ? t.createElement(P) : void 0,
          loading: ee,
          onClick: j
        },
        "立即执行"
      )
    )
  );
}
function cl({
  agentId: e,
  onRefresh: t
}) {
  const a = T().React, { useState: n, useEffect: l, useCallback: s } = a, {
    List: r,
    Tag: o,
    Switch: d,
    Button: c,
    Empty: u,
    Spin: z,
    Typography: C,
    message: P
  } = T().antd, { PlusOutlined: w, ReloadOutlined: p, DeleteOutlined: M } = T().antdIcons || {}, { Text: $, Paragraph: J } = C, [L, ee] = n([]), [B, N] = n(!0), [O, x] = n(!1), [k, V] = n([]), [D, A] = n(!1), E = s(async () => {
    N(!0);
    try {
      const b = await ht(e);
      ee(b);
    } catch (b) {
      P.error(b.message || "加载技能失败"), ee([]);
    } finally {
      N(!1);
    }
  }, [e]);
  l(() => {
    E();
  }, [E]);
  const v = async () => {
    x(!0), A(!0);
    try {
      const b = await Bt(!0);
      V(b);
    } catch (b) {
      P.error(b.message || "加载技能池失败");
    } finally {
      A(!1);
    }
  }, f = async (b) => {
    let g = 0, h = 0;
    for (const S of b)
      try {
        await Nt(e, S), g++;
      } catch {
        h++;
      }
    g > 0 ? (P.success(
      `成功添加 ${g} 个技能${h > 0 ? `，${h} 个失败` : ""}`
    ), E(), t()) : h > 0 && P.error("添加技能失败"), x(!1);
  }, q = async (b, g) => {
    try {
      g ? await Rn(e, b.name) : await Bn(e, b.name), P.success(g ? "已启用" : "已停用"), E(), t();
    } catch (h) {
      P.error(h.message || "操作失败");
    }
  }, G = async (b) => {
    try {
      await Dt(e, b), P.success(`技能「${b}」已移除`), E(), t();
    } catch (g) {
      P.error(g.message || "移除技能失败");
    }
  };
  if (B)
    return a.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      a.createElement(z, { size: "large" })
    );
  const ae = L.filter((b) => b.enabled !== !1);
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
        $,
        { strong: !0 },
        `技能列表 (${L.length}，已启用 ${ae.length})`
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          c,
          {
            size: "small",
            icon: p ? a.createElement(p) : void 0,
            onClick: () => {
              Qe(), E();
            }
          },
          "刷新"
        ),
        a.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: w ? a.createElement(w) : void 0,
            onClick: v,
            style: Pe
          },
          "从技能池添加"
        )
      )
    ),
    L.length === 0 ? a.createElement(u, {
      description: "该专家暂无技能",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(r, {
      dataSource: L,
      renderItem: (b) => a.createElement(
        r.Item,
        {
          actions: [
            a.createElement(d, {
              key: "toggle",
              size: "small",
              checked: b.enabled !== !1,
              onChange: (g) => q(b, g)
            }),
            a.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: M ? a.createElement(M) : void 0,
                onClick: () => G(b.name)
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
            b.emoji ? a.createElement(
              "span",
              { style: { fontSize: 16 } },
              b.emoji
            ) : null,
            a.createElement($, { strong: !0 }, b.name),
            b.version_text ? a.createElement(
              o,
              { style: { fontSize: 10 } },
              `v${b.version_text}`
            ) : null
          ),
          b.description ? a.createElement(
            J,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            b.description
          ) : null
        )
      )
    }),
    a.createElement(Un, {
      open: O,
      onClose: () => x(!1),
      poolSkills: k,
      installedSkillNames: L.map((b) => b.name),
      loading: D,
      onInstall: f
    })
  );
}
function ml({
  agentId: e,
  onRefresh: t,
  isActive: a
}) {
  const n = T().React, { useState: l, useEffect: s, useCallback: r } = n, {
    List: o,
    Tag: d,
    Button: c,
    Empty: u,
    Spin: z,
    Modal: C,
    Input: P,
    Typography: w,
    message: p
  } = T().antd, { PlusOutlined: M, ReloadOutlined: $, DeleteOutlined: J } = T().antdIcons || {}, { Text: L, Paragraph: ee } = w, { TextArea: B } = P, [N, O] = l([]), [x, k] = l(!0), [V, D] = l(!1), [A, E] = l(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [v, f] = l(!1), q = r(async () => {
    k(!0);
    try {
      const g = await Ft(e);
      O(g);
    } catch (g) {
      p.error(g.message || "加载 MCP 失败"), O([]);
    } finally {
      k(!1);
    }
  }, [e]);
  s(() => {
    q();
  }, [q]), s(() => {
    a && q();
  }, [a, q]);
  const G = async (g) => {
    try {
      await Ka(e, g), p.success("已切换 MCP 状态"), q(), t();
    } catch (h) {
      p.error(h.message || "切换失败");
    }
  }, ae = async (g) => {
    try {
      await Ln(e, g), p.success(`MCP「${g}」已移除`), q(), t();
    } catch (h) {
      p.error(h.message || "移除 MCP 失败");
    }
  }, b = async () => {
    f(!0);
    try {
      const g = JSON.parse(A), h = g.mcpServers || g, S = Object.entries(h);
      if (S.length === 0) {
        p.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [oe, j] of S) {
        const Q = j, ie = Q.url ? "streamable_http" : "stdio";
        await jn(e, {
          client_key: oe,
          client: {
            name: Q.name || oe,
            description: Q.description || "",
            enabled: !0,
            transport: ie,
            url: Q.url || "",
            command: Q.command || "",
            args: Q.args || [],
            env: Q.env || {},
            cwd: Q.cwd || "",
            headers: Q.headers || {}
          }
        });
      }
      p.success("MCP 客户端已创建"), D(!1), q(), t();
    } catch (g) {
      g instanceof SyntaxError ? p.error("JSON 格式错误：" + g.message) : p.error(g.message || "创建 MCP 失败");
    } finally {
      f(!1);
    }
  };
  return x ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(z, { size: "large" })
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
      n.createElement(L, { strong: !0 }, `MCP 客户端 (${N.length})`),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          c,
          {
            size: "small",
            icon: $ ? n.createElement($) : void 0,
            onClick: () => {
              Qe(), q();
            }
          },
          "刷新"
        ),
        n.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: M ? n.createElement(M) : void 0,
            onClick: () => D(!0),
            style: Pe
          },
          "添加 MCP"
        )
      )
    ),
    N.length === 0 ? n.createElement(u, {
      description: "该专家暂无 MCP 客户端",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(o, {
      dataSource: N,
      renderItem: (g) => n.createElement(
        o.Item,
        {
          actions: [
            n.createElement(
              c,
              {
                key: "toggle",
                size: "small",
                onClick: () => G(g.key)
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
                icon: J ? n.createElement(J) : void 0,
                onClick: () => ae(g.key)
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
            n.createElement(L, { strong: !0 }, g.name || g.key),
            n.createElement(
              d,
              {
                color: g.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              g.enabled ? "启用" : "停用"
            ),
            n.createElement(
              d,
              { color: "purple", style: { fontSize: 10 } },
              g.transport
            )
          ),
          g.description ? n.createElement(
            ee,
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
      C,
      {
        open: V,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => D(!1),
        onOk: b,
        confirmLoading: v,
        okText: "创建",
        width: 560
      },
      n.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      n.createElement(B, {
        value: A,
        onChange: (g) => E(g.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function dl({ agentId: e }) {
  const t = T().React, { useState: a, useEffect: n, useCallback: l, useRef: s } = t, {
    Card: r,
    InputNumber: o,
    Input: d,
    Select: c,
    Switch: u,
    Button: z,
    Spin: C,
    Space: P,
    Typography: w,
    Divider: p,
    message: M
  } = T().antd, { SaveOutlined: $ } = T().antdIcons || {}, { Text: J } = w, [L, ee] = a(!0), [B, N] = a(!1), O = s(null), [x, k] = a(60), [V, D] = a(""), [A, E] = a(!0), [v, f] = a(30), [q, G] = a("zh"), [ae, b] = a("UTC"), [g, h] = a(!0), [S, oe] = a(100), [j, Q] = a(!0), [ie, U] = a(3), [X, re] = a(1), [y, ne] = a(!0), [m, te] = a(3), [I, se] = a(2), [de, ye] = a(60), [fe, ue] = a(1), [Y, W] = a(0), [_, F] = a(1), [ce, H] = a(0), [pe, Ee] = a(30), [we, ke] = a(50), [Ie, Ue] = a("light"), [ot, Ze] = a("scroll"), [Oe, et] = a("remelight"), [rt, Fe] = a("AUTO"), _e = l(async () => {
    var Z, Ce, ve, Te, nt, at;
    ee(!0);
    try {
      const [he, it, wt] = await Promise.all([
        tl(e),
        al(e).catch(() => "zh"),
        sl().catch(() => "UTC")
      ]);
      O.current = he, k(he.shell_command_timeout ?? 60), D(he.shell_command_executable ?? "");
      const lt = he.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      E(lt.enabled ?? !0), f(lt.timeout_seconds ?? 30), G(it), b(wt);
      const Ne = he.loop ?? {};
      h(((Z = Ne.iteration) == null ? void 0 : Z.enabled) ?? !0), oe(((Ce = Ne.iteration) == null ? void 0 : Ce.max_iterations) ?? he.max_iters ?? 100), Q(((ve = Ne.doom_loop) == null ? void 0 : ve.enabled) ?? !0), U(((Te = Ne.doom_loop) == null ? void 0 : Te.window_size) ?? 3), re(((nt = Ne.doom_loop) == null ? void 0 : nt.similarity_threshold) ?? 1), ne(he.llm_retry_enabled ?? !0), te(he.llm_max_retries ?? 3), se(he.llm_backoff_base ?? 2), ye(he.llm_backoff_cap ?? 60), ue(he.llm_max_concurrent ?? 1), W(he.llm_max_qpm ?? 0), F(he.llm_rate_limit_pause ?? 1), H(he.llm_rate_limit_jitter ?? 0), Ee(he.llm_acquire_timeout ?? 30), ke(he.history_max_length ?? 50), Ue(he.context_manager_backend ?? "light"), Ze(((at = he.light_context_config) == null ? void 0 : at.strategy) ?? "scroll"), et(he.memory_manager_backend ?? "remelight"), Fe(he.approval_level ?? "AUTO");
    } catch (he) {
      M.error(he.message || "加载运行配置失败");
    } finally {
      ee(!1);
    }
  }, [e]);
  n(() => {
    _e();
  }, [_e]);
  const tt = async () => {
    var Ce, ve;
    const Z = O.current;
    if (Z) {
      N(!0);
      try {
        const Te = {
          ...Z,
          max_iters: S,
          loop: {
            ...Z.loop ?? {},
            iteration: { enabled: g, max_iterations: S },
            doom_loop: {
              enabled: j,
              window_size: ie,
              similarity_threshold: X,
              stages: ((ve = (Ce = Z.loop) == null ? void 0 : Ce.doom_loop) == null ? void 0 : ve.stages) ?? []
            }
          },
          shell_command_timeout: x,
          shell_command_executable: V,
          auto_title_config: {
            enabled: A,
            timeout_seconds: v
          },
          llm_retry_enabled: y,
          llm_max_retries: m,
          llm_backoff_base: I,
          llm_backoff_cap: de,
          llm_max_concurrent: fe,
          llm_max_qpm: Y,
          llm_rate_limit_pause: _,
          llm_rate_limit_jitter: ce,
          llm_acquire_timeout: pe,
          history_max_length: we,
          context_manager_backend: Ie,
          light_context_config: {
            ...Z.light_context_config ?? {},
            strategy: ot
          },
          memory_manager_backend: Oe,
          approval_level: rt
        };
        await nl(e, Te), O.current = Te, q && await ll(e, q).catch(() => {
        }), ae && await ol(ae).catch(() => {
        }), M.success("运行配置已保存");
      } catch (Te) {
        M.error(Te.message || "保存运行配置失败");
      } finally {
        N(!1);
      }
    }
  };
  if (L)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(C, { size: "large" })
    );
  const ze = (Z, Ce, ve) => t.createElement(
    "div",
    { style: Nn },
    t.createElement("div", { style: Xe }, Z),
    Ce,
    ve ? t.createElement(
      J,
      { type: "secondary", style: Fn },
      ve
    ) : null
  ), xe = (Z, Ce, ve, Te) => t.createElement(
    "div",
    { style: Dn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Xe }, Z),
      Ce
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Xe }, ve),
      Te
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
    xe(
      "Shell 命令超时 (秒)",
      t.createElement(o, {
        min: 1,
        value: x,
        onChange: (Z) => k(Z ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(d, {
        value: V,
        onChange: (Z) => D(Z.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    xe(
      "语言",
      t.createElement(c, {
        value: q,
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
      t.createElement(c, {
        value: ae,
        onChange: (Z) => b(Z),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (Z, Ce) => {
          var ve;
          return (((ve = Ce == null ? void 0 : Ce.label) == null ? void 0 : ve.toString()) || "").toLowerCase().includes(Z.toLowerCase());
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
    xe(
      "自动生成会话标题",
      t.createElement(P, null, t.createElement(u, {
        checked: A,
        onChange: (Z) => E(Z)
      })),
      "标题生成超时 (秒)",
      t.createElement(o, {
        min: 5,
        value: v,
        onChange: (Z) => f(Z ?? 30),
        style: { width: "100%" },
        disabled: !A
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(p, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: je }, "审批级别"),
    ze(
      "工具执行审批",
      t.createElement(c, {
        value: rt,
        onChange: (Z) => Fe(Z),
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
    ze(
      "启用迭代限制",
      t.createElement(u, {
        checked: g,
        onChange: (Z) => h(Z)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    g ? ze(
      "最大迭代次数",
      t.createElement(o, {
        min: 1,
        max: 500,
        value: S,
        onChange: (Z) => oe(Z ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    ze(
      "启用重复循环保护",
      t.createElement(u, {
        checked: j,
        onChange: (Z) => Q(Z)
      }),
      "检测并阻止重复操作循环"
    ),
    j ? xe(
      "检测窗口大小",
      t.createElement(o, {
        min: 2,
        max: 20,
        value: ie,
        onChange: (Z) => U(Z ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(o, {
        min: 0,
        max: 1,
        step: 0.05,
        value: X,
        onChange: (Z) => re(Z ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(p, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: je }, "LLM 重试"),
    ze(
      "启用 LLM 重试",
      t.createElement(u, {
        checked: y,
        onChange: (Z) => ne(Z)
      })
    ),
    xe(
      "最大重试次数",
      t.createElement(o, {
        min: 1,
        value: m,
        onChange: (Z) => te(Z ?? 3),
        style: { width: "100%" },
        disabled: !y
      }),
      "退避基数 (秒)",
      t.createElement(o, {
        min: 0.1,
        step: 0.1,
        value: I,
        onChange: (Z) => se(Z ?? 2),
        style: { width: "100%" },
        disabled: !y
      })
    ),
    ze(
      "退避上限 (秒)",
      t.createElement(o, {
        min: 0.5,
        step: 0.5,
        value: de,
        onChange: (Z) => ye(Z ?? 60),
        style: { width: 200 },
        disabled: !y
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(p, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: je }, "LLM 限流"),
    xe(
      "最大并发数",
      t.createElement(o, {
        min: 1,
        value: fe,
        onChange: (Z) => ue(Z ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(o, {
        min: 0,
        step: 10,
        value: Y,
        onChange: (Z) => W(Z ?? 0),
        style: { width: "100%" }
      })
    ),
    xe(
      "限流暂停时间 (秒)",
      t.createElement(o, {
        min: 1,
        step: 0.5,
        value: _,
        onChange: (Z) => F(Z ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(o, {
        min: 0,
        step: 0.5,
        value: ce,
        onChange: (Z) => H(Z ?? 0),
        style: { width: "100%" }
      })
    ),
    ze(
      "获取超时 (秒)",
      t.createElement(o, {
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
    t.createElement("div", { style: je }, "上下文与记忆"),
    xe(
      "上下文管理后端",
      t.createElement(c, {
        value: Ie,
        onChange: (Z) => Ue(Z),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(c, {
        value: ot,
        onChange: (Z) => Ze(Z),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    xe(
      "记忆管理后端",
      t.createElement(c, {
        value: Oe,
        onChange: (Z) => et(Z),
        style: { width: "100%" },
        options: [
          { value: "remelight", label: "remelight" },
          { value: "adbpg", label: "adbpg" },
          { value: "none", label: "none (禁用)" }
        ]
      }),
      "历史消息最大长度",
      t.createElement(o, {
        min: 1,
        value: we,
        onChange: (Z) => ke(Z ?? 50),
        style: { width: "100%" }
      })
    ),
    // ── Save button ──
    t.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      t.createElement(
        z,
        {
          type: "primary",
          icon: $ ? t.createElement($) : void 0,
          loading: B,
          onClick: tt,
          style: Pe
        },
        "保存运行配置"
      )
    )
  );
}
function ul({
  expert: e,
  open: t,
  onClose: a,
  onRefresh: n
}) {
  const l = T().React, { useState: s, useEffect: r, useCallback: o } = l, { Modal: d, Tabs: c, Spin: u, Typography: z } = T().antd, { SettingOutlined: C } = T().antdIcons || {}, { Text: P } = z, [w, p] = s([]), [M, $] = s(!1), [J, L] = s("heartbeat"), ee = o(async () => {
    if (e) {
      $(!0);
      try {
        const x = await rl(e.agent.id);
        p(x);
      } catch {
        p([]);
      } finally {
        $(!1);
      }
    }
  }, [e]);
  if (r(() => {
    t && e && ee();
  }, [t, e, ee]), !e) return null;
  const { agent: B } = e, N = () => {
    ee(), n();
  }, O = [
    {
      key: "heartbeat",
      label: "心跳",
      children: l.createElement(il, {
        agentId: B.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: M ? l.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        l.createElement(u, { size: "large" })
      ) : l.createElement(Gn, {
        agentId: B.id,
        systemPromptFiles: w,
        onRefresh: N
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((x) => x.enabled !== !1).length})`,
      children: l.createElement(cl, {
        agentId: B.id,
        onRefresh: n
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: l.createElement(ml, {
        agentId: B.id,
        onRefresh: n,
        isActive: J === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: l.createElement(dl, {
        agentId: B.id
      })
    }
  ];
  return l.createElement(
    d,
    {
      open: t,
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        C ? l.createElement(C, { style: { fontSize: 18 } }) : null,
        l.createElement("span", null, `配置 - ${B.name}`),
        l.createElement(
          P,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          B.id
        )
      ),
      onCancel: a,
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
    l.createElement(c, {
      items: O,
      activeKey: J,
      onChange: (x) => L(x),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
function pl({
  expert: e,
  onClick: t,
  onSummon: a,
  onConfigure: n
}) {
  const l = T().React, { Card: s, Tag: r, Badge: o, Typography: d, Spin: c, Button: u, Tooltip: z } = T().antd, { Text: C } = d, { ThunderboltOutlined: P, SettingOutlined: w } = T().antdIcons || {}, { agent: p, skills: M, mcps: $, loading: J } = e, L = p.enabled, ee = M.filter((O) => O.enabled !== !1).map((O) => O.name), B = $.map((O) => O.name || O.key), N = p.active_model ? `${p.active_model.provider_id}/${p.active_model.model}` : null;
  return l.createElement(
    s,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: L ? void 0 : "#d9d9d9",
        opacity: L ? 1 : 0.7,
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
        l.createElement($e, { name: p.name, size: 36 }),
        l.createElement(
          "div",
          null,
          l.createElement(
            C,
            { strong: !0, style: { fontSize: 15 } },
            p.name
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
            p.id
          )
        )
      ),
      l.createElement(o, {
        status: L ? "success" : "default",
        text: L ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    p.description ? l.createElement(
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
      Ut(p.description, l)
    ) : l.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    N ? l.createElement(
      "div",
      { style: { marginBottom: 8 } },
      l.createElement(
        r,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${N}`
      )
    ) : null,
    // Skills
    J ? l.createElement(c, { size: "small" }) : l.createElement(
      "div",
      { style: { marginBottom: 6 } },
      l.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${ee.length})`
      ),
      l.createElement(vn, {
        items: ee,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !J && B.length > 0 ? l.createElement(
      "div",
      { style: { marginTop: "auto" } },
      l.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${B.length})`
      ),
      l.createElement(vn, {
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
        z,
        { title: "配置专家", placement: "top" },
        l.createElement(
          u,
          {
            type: "text",
            size: "small",
            icon: w ? l.createElement(w, {
              style: { fontSize: 16, color: "#8c8c8c" }
            }) : void 0,
            onClick: (O) => {
              O.stopPropagation(), n && n();
            }
          }
        )
      ),
      // Summon button (bottom-right)
      l.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: P ? l.createElement(P) : void 0,
          disabled: !L,
          onClick: (O) => {
            O.stopPropagation(), a && a();
          },
          style: Pe
        },
        "召唤专家"
      )
    )
  );
}
function gl({
  expert: e,
  open: t,
  onClose: a,
  onRefresh: n
}) {
  const l = T().React, {
    Drawer: s,
    Descriptions: r,
    Tag: o,
    Typography: d,
    Space: c,
    Button: u,
    Empty: z,
    Tabs: C,
    List: P,
    Spin: w,
    Modal: p,
    message: M
  } = T().antd, { Text: $, Paragraph: J } = d, {
    EditOutlined: L,
    ThunderboltOutlined: ee,
    FileTextOutlined: B,
    ToolOutlined: N,
    PlusOutlined: O
  } = T().antdIcons || {}, [x, k] = l.useState(!1), [V, D] = l.useState(
    []
  ), [A, E] = l.useState(!1);
  if (!e) return null;
  const { agent: v, config: f, skills: q, mcps: G, loading: ae } = e, b = q.filter((y) => y.enabled !== !1), g = (y) => {
    window.history.pushState({}, "", y), window.dispatchEvent(new PopStateEvent("popstate"));
  }, h = l.createElement(
    "div",
    null,
    l.createElement(
      r,
      { column: 1, bordered: !0, size: "small" },
      l.createElement(r.Item, { label: "专家名称" }, v.name),
      l.createElement(
        r.Item,
        { label: "专家 ID" },
        l.createElement("code", { style: { fontSize: 12 } }, v.id)
      ),
      l.createElement(
        r.Item,
        { label: "状态" },
        l.createElement(
          o,
          { color: v.enabled ? "green" : "default" },
          v.enabled ? "启用" : "停用"
        )
      ),
      l.createElement(
        r.Item,
        { label: "功能简介" },
        v.description ? Ut(v.description, l) : "暂无描述"
      ),
      l.createElement(
        r.Item,
        { label: "使用模型" },
        v.active_model ? `${v.active_model.provider_id} / ${v.active_model.model}` : "使用全局默认模型"
      ),
      f != null && f.workspace_dir ? l.createElement(
        r.Item,
        { label: "工作区路径" },
        l.createElement(
          "code",
          { style: { fontSize: 11 } },
          f.workspace_dir
        )
      ) : null,
      f != null && f.approval_level ? l.createElement(
        r.Item,
        { label: "审批级别" },
        f.approval_level
      ) : null
    ),
    // System prompt files
    f != null && f.system_prompt_files && f.system_prompt_files.length > 0 ? l.createElement(
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
        l.createElement($, { strong: !0 }, "系统提示词文件")
      ),
      l.createElement(
        c,
        { wrap: !0 },
        ...f.system_prompt_files.map(
          (y, ne) => l.createElement(
            o,
            {
              key: ne,
              icon: B ? l.createElement(B) : void 0,
              style: { fontSize: 12 }
            },
            y
          )
        )
      )
    ) : null
  ), S = async () => {
    k(!0), E(!0);
    try {
      const y = await Bt(!0);
      D(y);
    } catch (y) {
      M.error(y.message || "加载技能池失败");
    } finally {
      E(!1);
    }
  }, oe = async (y) => {
    let ne = 0, m = 0;
    for (const te of y)
      try {
        await Nt(v.id, te), ne++;
      } catch {
        m++;
      }
    ne > 0 ? (M.success(
      `成功添加 ${ne} 个技能${m > 0 ? `，${m} 个失败` : ""}`
    ), n()) : m > 0 && M.error("添加技能失败"), k(!1);
  }, j = async (y) => {
    try {
      await Dt(v.id, y), M.success(`技能「${y}」已移除`), n();
    } catch (ne) {
      M.error(ne.message || "移除技能失败");
    }
  }, Q = async (y) => {
    try {
      await Ln(v.id, y), M.success(`MCP「${y}」已移除`), n();
    } catch (ne) {
      M.error(ne.message || "移除 MCP 失败");
    }
  }, ie = ae ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(w, { size: "large" })
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
        $,
        { strong: !0 },
        `已启用技能 (${b.length})`
      ),
      l.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: O ? l.createElement(O) : void 0,
          onClick: S
        },
        "从技能池添加"
      )
    ),
    b.length === 0 ? l.createElement(z, {
      description: "该专家暂无已启用的技能",
      image: z.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(P, {
      dataSource: b,
      renderItem: (y) => l.createElement(
        P.Item,
        {
          actions: [
            l.createElement(
              u,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => j(y.name)
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
            l.createElement($, { strong: !0 }, y.name),
            y.version_text ? l.createElement(
              o,
              { style: { fontSize: 10 } },
              `v${y.version_text}`
            ) : null
          ),
          y.description ? l.createElement(
            J,
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
              (ne, m) => l.createElement(
                o,
                {
                  key: m,
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
    l.createElement(Un, {
      open: x,
      onClose: () => k(!1),
      poolSkills: V,
      installedSkillNames: b.map((y) => y.name),
      loading: A,
      onInstall: oe
    })
  ), U = ae ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(w, { size: "large" })
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
        $,
        { strong: !0 },
        `MCP 客户端 (${G.length})`
      ),
      l.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: O ? l.createElement(O) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${v.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    G.length === 0 ? l.createElement(z, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: z.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(P, {
      dataSource: G,
      renderItem: (y) => l.createElement(
        P.Item,
        {
          actions: [
            l.createElement(
              u,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => Q(y.key)
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
              $,
              { strong: !0 },
              y.name || y.key
            ),
            l.createElement(
              o,
              {
                color: y.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              y.enabled ? "启用" : "停用"
            ),
            l.createElement(
              o,
              { color: "purple", style: { fontSize: 10 } },
              y.transport
            )
          ),
          y.description ? l.createElement(
            J,
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
  ), X = f != null && f.tools ? l.createElement(
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
        N ? l.createElement(N, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        l.createElement($, { strong: !0 }, "工具配置")
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
        JSON.stringify(f.tools, null, 2)
      )
    )
  ) : l.createElement(z, {
    description: "暂无工具配置",
    image: z.PRESENTED_IMAGE_SIMPLE
  }), re = [
    { key: "basic", label: "基本信息", children: h },
    {
      key: "skills",
      label: `技能 (${b.length})`,
      children: ie
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: l.createElement(El, {
        skills: b,
        agentId: v.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: l.createElement(Gn, {
        agentId: v.id,
        systemPromptFiles: (f == null ? void 0 : f.system_prompt_files) || [],
        onRefresh: () => n()
      })
    },
    { key: "mcp", label: `MCP (${G.length})`, children: U },
    { key: "tools", label: "工具配置", children: X }
  ];
  return l.createElement(
    s,
    {
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        l.createElement($e, { name: v.name, size: 28 }),
        l.createElement("span", null, v.name)
      ),
      open: t,
      onClose: a,
      width: 560,
      extra: l.createElement(
        c,
        null,
        l.createElement(
          u,
          {
            size: "small",
            icon: L ? l.createElement(L) : void 0,
            onClick: () => {
              a();
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
        l.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: ee ? l.createElement(ee) : void 0,
            onClick: () => {
              a();
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
    l.createElement(C, {
      items: re,
      defaultActiveKey: "basic"
    })
  );
}
function fl({
  open: e,
  onClose: t,
  onCreated: a
}) {
  const n = T().React, { useState: l } = n, {
    Modal: s,
    Card: r,
    Tag: o,
    Input: d,
    Row: c,
    Col: u,
    Spin: z,
    message: C,
    Typography: P
  } = T().antd, { Text: w } = P, { FileAddOutlined: p } = T().antdIcons || {}, [M, $] = l(!1), [J, L] = l(""), [ee, B] = l(!1), N = async (k, V) => {
    $(!0);
    try {
      const D = await le("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: k || "新专家",
          description: V || "",
          skill_names: []
        })
      });
      await yt(
        D.id,
        "AGENTS.md",
        `# ${k || "新专家"}

请在此处编写该专家的系统提示词。
`
      ), C.success("专家「" + (k || "新专家") + "」创建成功"), B(!1), setTimeout(() => {
        t(), a();
      }, 0);
    } catch (D) {
      C.error(D.message || "创建专家失败");
    } finally {
      $(!1);
    }
  }, O = ja.filter((k) => {
    if (!J.trim()) return !0;
    const V = J.toLowerCase();
    return k.name.toLowerCase().includes(V) || k.description.toLowerCase().includes(V) || k.category.toLowerCase().includes(V);
  }), x = async (k) => {
    $(!0);
    try {
      const V = await le("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: k.name,
          description: k.description,
          skill_names: k.recommended_skills
        })
      });
      await yt(V.id, "AGENTS.md", k.system_prompt);
      const D = await jt(V.id);
      D.approval_level = k.approval_level, await le(`/agents/${encodeURIComponent(V.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(D)
      }), C.success(`专家「${k.name}」创建成功`), t(), a();
    } catch (V) {
      C.error(V.message || "创建专家失败");
    } finally {
      $(!1);
    }
  };
  return n.createElement(
    n.Fragment,
    null,
    n.createElement(
      s,
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
        n.createElement(d, {
          placeholder: "搜索模板名称或类别...",
          value: J,
          onChange: (k) => L(k.target.value),
          allowClear: !0
        })
      ),
      M ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        n.createElement(z, { size: "large" }),
        n.createElement(
          "div",
          { style: { marginTop: 12, color: "#8c8c8c" } },
          "正在创建专家..."
        )
      ) : n.createElement(
        c,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        J.trim() ? null : n.createElement(
          u,
          { xs: 24, sm: 12 },
          n.createElement(
            r,
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
                p ? n.createElement(p) : "📝"
              ),
              n.createElement(
                "div",
                { style: { flex: 1 } },
                n.createElement(
                  w,
                  { strong: !0, style: { fontSize: 15 } },
                  "从空白模版开始创建"
                ),
                n.createElement(
                  "div",
                  null,
                  n.createElement(
                    o,
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
        ...O.map(
          (k) => n.createElement(
            u,
            { key: k.id, xs: 24, sm: 12 },
            n.createElement(
              r,
              {
                hoverable: !0,
                size: "small",
                onClick: () => x(k),
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
                n.createElement($e, {
                  name: k.name,
                  size: 40
                }),
                n.createElement(
                  "div",
                  { style: { flex: 1 } },
                  n.createElement(
                    w,
                    { strong: !0, style: { fontSize: 15 } },
                    k.name
                  ),
                  n.createElement(
                    "div",
                    null,
                    n.createElement(
                      o,
                      { color: "blue", style: { fontSize: 10 } },
                      k.category
                    ),
                    k.approval_level === "MANUAL" ? n.createElement(
                      o,
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
                Ut(k.description, n)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    n.createElement(yl, {
      open: ee,
      onCancel: () => B(!1),
      onCreate: N
    })
  );
}
function yl({
  open: e,
  onCancel: t,
  onCreate: a
}) {
  const n = T().React, { useState: l, useEffect: s } = n, { Modal: r, Input: o, message: d } = T().antd, [c, u] = l(""), [z, C] = l(""), [P, w] = l(!1);
  return s(() => {
    e && (u(""), C(""), w(!1));
  }, [e]), n.createElement(
    r,
    {
      open: e,
      title: "从空白模版创建专家",
      onCancel: t,
      onOk: () => {
        if (!c.trim()) {
          d.warning("请输入专家名称");
          return;
        }
        w(!0), Promise.resolve(a(c.trim(), z.trim())).finally(() => {
          w(!1);
        });
      },
      okText: "创建",
      cancelText: "取消",
      okButtonProps: { loading: P },
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
      n.createElement(o, {
        placeholder: "输入专家名称",
        value: c,
        onChange: (p) => u(p.target.value),
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
      n.createElement(o.TextArea, {
        placeholder: "简要描述该专家的职责和能力...",
        value: z,
        onChange: (p) => C(p.target.value),
        rows: 3,
        maxLength: 200
      })
    )
  );
}
function Gn({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: a
}) {
  const n = T().React, { useState: l, useEffect: s, useCallback: r } = n, {
    List: o,
    Tag: d,
    Switch: c,
    Button: u,
    Modal: z,
    Input: C,
    Spin: P,
    Empty: w,
    message: p,
    Typography: M
  } = T().antd, { FileTextOutlined: $, PlusOutlined: J, EditOutlined: L, ReloadOutlined: ee } = T().antdIcons || {}, { Text: B } = M, [N, O] = l([]), [x, k] = l(!0), [V, D] = l(
    t || []
  ), [A, E] = l(!1), [v, f] = l(null), [q, G] = l(""), [ae, b] = l(""), [g, h] = l(!1), S = r(async () => {
    k(!0);
    try {
      const U = await Ha(e);
      O(U);
    } catch (U) {
      p.error(U.message || "加载记忆文件失败"), O([]);
    } finally {
      k(!1);
    }
  }, [e]);
  s(() => {
    S();
  }, [S]), s(() => {
    D(t || []);
  }, [t]);
  const oe = async (U, X) => {
    const re = new Set(V);
    if (X)
      re.add(U);
    else {
      if (hn.includes(U) && U === "AGENTS.md") {
        p.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      re.delete(U);
    }
    const y = Array.from(re);
    D(y);
    try {
      await En(e, y), p.success(X ? "已启用记忆文件" : "已停用记忆文件"), a();
    } catch (ne) {
      p.error(ne.message || "更新失败"), D(t || []);
    }
  }, j = async (U) => {
    try {
      const X = await le(
        `/workspace/files/${encodeURIComponent(U)}`,
        { headers: { "X-Agent-Id": e } }
      );
      f(U), G(X.content || ""), E(!0);
    } catch (X) {
      p.error(X.message || "读取文件失败");
    }
  }, Q = () => {
    f(null), G(""), b(""), E(!0);
  }, ie = async () => {
    const U = v || ae.trim();
    if (!U) {
      p.warning("请输入文件名");
      return;
    }
    const X = U.endsWith(".md") ? U : `${U}.md`;
    h(!0);
    try {
      if (await yt(e, X, q), !v && !V.includes(X)) {
        const re = [...V, X];
        D(re), await En(e, re);
      }
      p.success("保存成功"), E(!1), S(), a();
    } catch (re) {
      p.error(re.message || "保存失败");
    } finally {
      h(!1);
    }
  };
  return x ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(P, { size: "large" })
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
        $ ? n.createElement($, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(
          B,
          { strong: !0 },
          `记忆文件 (${N.length})`
        ),
        n.createElement(
          B,
          { type: "secondary", style: { fontSize: 12 } },
          `· 已挂载 ${V.length} 个到专家记忆`
        )
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          u,
          {
            size: "small",
            icon: ee ? n.createElement(ee) : void 0,
            onClick: S
          },
          "刷新"
        ),
        n.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: J ? n.createElement(J) : void 0,
            onClick: Q
          },
          "新建记忆文件"
        )
      )
    ),
    N.length === 0 ? n.createElement(w, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: w.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(o, {
      dataSource: N,
      renderItem: (U) => {
        const X = V.includes(U.filename), re = hn.includes(U.filename);
        return n.createElement(
          o.Item,
          {
            actions: [
              n.createElement(
                u,
                {
                  type: "link",
                  size: "small",
                  icon: L ? n.createElement(L) : void 0,
                  onClick: () => j(U.filename)
                },
                "编辑"
              )
            ]
          },
          n.createElement(o.Item.Meta, {
            avatar: n.createElement($, {
              style: {
                fontSize: 20,
                color: X ? "#1677ff" : "#bfbfbf"
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
              n.createElement(B, null, U.filename),
              re ? n.createElement(
                d,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : n.createElement(
                d,
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
            checked: X,
            size: "small",
            onChange: (y) => oe(U.filename, y)
          })
        );
      }
    }),
    // Edit/New file modal
    n.createElement(
      z,
      {
        open: A,
        onCancel: () => E(!1),
        title: v ? `编辑 ${v}` : "新建记忆文件",
        width: 700,
        onOk: ie,
        confirmLoading: g,
        okText: "保存"
      },
      v ? null : n.createElement(
        "div",
        { style: { marginBottom: 12 } },
        n.createElement(C, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: ae,
          onChange: (U) => b(U.target.value),
          addonAfter: ae.endsWith(".md") ? "" : ".md"
        })
      ),
      n.createElement(C.TextArea, {
        value: q,
        onChange: (U) => G(U.target.value),
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
function El({
  skills: e,
  agentId: t
}) {
  const a = T().React, { useMemo: n } = a, {
    List: l,
    Tag: s,
    Typography: r,
    Empty: o,
    Button: d,
    message: c
  } = T().antd, { ThunderboltOutlined: u, CopyOutlined: z } = T().antdIcons || {}, { Text: C } = r, P = n(() => $n(e), [e]), w = (M) => {
    try {
      const $ = T();
      $.setSelectedAgent && $.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", M.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, p = (M) => {
    var $;
    ($ = navigator.clipboard) == null || $.writeText(M.value).then(() => {
      c.success("已复制到剪贴板");
    });
  };
  return P.length === 0 ? a.createElement(o, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: o.PRESENTED_IMAGE_SIMPLE
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
      u ? a.createElement(u, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      a.createElement(
        C,
        { strong: !0 },
        `推荐提问 (${P.length})`
      ),
      a.createElement(
        C,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    a.createElement(l, {
      dataSource: P,
      renderItem: (M, $) => a.createElement(
        l.Item,
        {
          actions: [
            a.createElement(
              d,
              {
                type: "link",
                size: "small",
                icon: z ? a.createElement(z) : void 0,
                onClick: () => p(M)
              },
              "复制"
            )
          ]
        },
        a.createElement(l.Item.Meta, {
          avatar: a.createElement(
            s,
            { color: "blue", style: { borderRadius: "50%" } },
            `${$ + 1}`
          ),
          title: a.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => w(M)
            },
            M.value
          ),
          description: a.createElement(
            C,
            { type: "secondary", style: { fontSize: 12 } },
            M.label
          )
        })
      )
    })
  );
}
function hl() {
  var ce;
  const e = T().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, {
    Spin: s,
    Empty: r,
    Input: o,
    Button: d,
    message: c,
    Row: u,
    Col: z,
    Tabs: C,
    Modal: P,
    Typography: w
  } = T().antd, {
    ReloadOutlined: p,
    PlusOutlined: M,
    SearchOutlined: $,
    TeamOutlined: J,
    UserOutlined: L
  } = T().antdIcons || {}, { Text: ee, Paragraph: B } = w, [N, O] = t([]), [x, k] = t(!0), [V, D] = t(!1), [A, E] = t(null), [v, f] = t(""), [q, G] = t(!1), [ae, b] = t("experts"), [g, h] = t(
    null
  ), [S, oe] = t(""), [j, Q] = t(!1), [ie, U] = t(!1), [X, re] = t(null), [y, ne] = t([]), m = n(async () => {
    k(!0);
    try {
      const H = await Lt(), pe = await Promise.all(
        H.map(async (Ee) => {
          try {
            const [we, ke, Ie] = await Promise.all([
              jt(Ee.id).catch(() => null),
              ht(Ee.id).catch(() => []),
              Ft(Ee.id).catch(() => [])
            ]);
            return {
              agent: Ee,
              config: we,
              skills: ke,
              mcps: Ie,
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
      c.error(H.message || "加载专家列表失败"), O([]);
    } finally {
      k(!1);
    }
  }, []);
  a(() => {
    m();
  }, [m]), a(() => {
    if (X && ie) {
      const H = N.find(
        (pe) => pe.agent.id === X.agent.id
      );
      H && H !== X && re(H);
    }
  }, [N, X, ie]);
  const te = n(
    async (H) => {
      var ke;
      const pe = H.coordinatorName || ((ke = H.members[0]) == null ? void 0 : ke.name);
      if (!pe) {
        c.error("无法确定协调者专家");
        return;
      }
      const Ee = ft(y, pe);
      if (!Ee) {
        c.error(`未找到协调者专家「${pe}」，请先创建该专家`);
        return;
      }
      if (/\{.+?\}/.test(H.taskTemplate)) {
        oe(""), h(H);
        return;
      }
      await I(H, Ee, H.taskTemplate);
    },
    [y, c]
  ), I = n(
    async (H, pe, Ee) => {
      var we;
      Q(!0);
      try {
        const ke = Na(H), Ie = Ee ? ke.replace(H.taskTemplate, Ee) : ke, Ue = T();
        Ue.setSelectedAgent && Ue.setSelectedAgent(pe), await Ua(pe, Ie), c.success(
          `团队任务已发起，协调者：${H.coordinatorName || ((we = H.members[0]) == null ? void 0 : we.name)}`
        ), h(null), se("/chat");
      } catch (ke) {
        c.error(ke.message || "发起团队任务失败");
      } finally {
        Q(!1);
      }
    },
    [c]
  ), se = (H) => {
    window.history.pushState({}, "", H), window.dispatchEvent(new PopStateEvent("popstate"));
  }, de = n((H) => {
    E(H), D(!0);
  }, []), ye = n((H) => {
    re(H), U(!0);
  }, []), fe = n(
    (H) => {
      if (!H.agent.enabled) {
        c.warning(`专家「${H.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const pe = T();
        pe.setSelectedAgent && pe.setSelectedAgent(H.agent.id);
      } catch (pe) {
        console.warn("[ugsci] Failed to set selected agent:", pe);
      }
      c.success(`已召唤专家「${H.agent.name}」，正在跳转至对话...`), se("/chat");
    },
    [c]
  ), ue = l(() => {
    if (!v.trim()) return N;
    const H = v.toLowerCase();
    return N.filter(
      (pe) => {
        var Ee;
        return pe.agent.name.toLowerCase().includes(H) || ((Ee = pe.agent.description) == null ? void 0 : Ee.toLowerCase().includes(H)) || pe.agent.id.toLowerCase().includes(H) || pe.skills.some((we) => we.name.toLowerCase().includes(H));
      }
    );
  }, [N, v]), Y = N.filter((H) => H.agent.enabled).length, W = N.reduce(
    (H, pe) => H + pe.skills.filter((Ee) => Ee.enabled !== !1).length,
    0
  ), _ = N.reduce((H, pe) => H + pe.mcps.length, 0), F = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        L ? e.createElement(L, { style: { fontSize: 14 } }) : null,
        "专家列表"
      ),
      children: e.createElement(
        "div",
        null,
        // Search bar
        e.createElement(
          "div",
          { style: { marginBottom: 16 } },
          e.createElement(o, {
            placeholder: "搜索专家名称、描述或技能...",
            prefix: $ ? e.createElement($) : void 0,
            value: v,
            onChange: (H) => f(H.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        x ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(s, { size: "large" })
        ) : ue.length === 0 ? e.createElement(r, {
          description: v ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          u,
          { gutter: [12, 12], align: "stretch" },
          ...ue.map(
            (H) => e.createElement(
              z,
              {
                key: H.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(pl, {
                expert: H,
                onClick: () => de(H),
                onSummon: () => fe(H),
                onConfigure: () => ye(H)
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
        J ? e.createElement(J, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(Ga, {
        agents: y,
        onLaunch: te
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(vt, {
      title: "专家",
      subtitle: `共 ${N.length} 位专家（${Y} 位启用）· ${W} 个技能 · ${_} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          d,
          {
            icon: p ? e.createElement(p) : void 0,
            onClick: () => {
              Qe(), m();
            },
            loading: x
          },
          "刷新"
        ),
        e.createElement(
          d,
          {
            type: "primary",
            icon: M ? e.createElement(M) : void 0,
            onClick: () => G(!0),
            style: Pe
          },
          "创建专家"
        )
      )
    }),
    e.createElement(C, {
      items: F,
      activeKey: ae,
      onChange: (H) => b(H)
    }),
    // Drawer
    e.createElement(gl, {
      expert: A,
      open: V,
      onClose: () => D(!1),
      onRefresh: () => m()
    }),
    // Template Modal
    e.createElement(fl, {
      open: q,
      onClose: () => G(!1),
      onCreated: () => m()
    }),
    // Config Modal (gear icon)
    e.createElement(ul, {
      expert: X,
      open: ie,
      onClose: () => U(!1),
      onRefresh: () => m()
    }),
    // Team Launch Modal (for filling placeholders)
    g ? e.createElement(
      P,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(Ht, {
            members: g.members.map((H) => H.name),
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
          var we;
          const H = g.coordinatorName || ((we = g.members[0]) == null ? void 0 : we.name), pe = H ? ft(y, H) : null;
          if (!pe) {
            c.error("无法找到协调者专家");
            return;
          }
          let Ee = g.taskTemplate;
          S.trim() && (Ee = S.trim()), I(g, pe, Ee);
        },
        confirmLoading: j,
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
        e.createElement(o.TextArea, {
          value: S,
          onChange: (H) => oe(H.target.value),
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
const Hn = [
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
], vl = {
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
function Ke(e) {
  return (e || "").trim();
}
function Wn(e) {
  const t = Ke(e);
  return t === "" || t === "*";
}
function bt(e) {
  return e === "user" ? "user" : "all";
}
function Be(e) {
  const t = bt(e.subject_type);
  return {
    source_type: De(e.source_type),
    source_value: Ke(e.source_value),
    subject_type: t,
    subject_value: t === "all" ? "" : (e.subject_value || "").trim(),
    effect: e.effect
  };
}
function Ve(e) {
  return { tool_name: e.tool_name || "*", ...Be(e) };
}
function Jn(e) {
  return { tool_name: e.tool_name || "*", effect: e.effect };
}
function Xn(e) {
  return [...e].map(Be).sort(
    (t, a) => t.source_type.localeCompare(a.source_type) || t.source_value.localeCompare(a.source_value) || t.subject_type.localeCompare(a.subject_type) || t.subject_value.localeCompare(a.subject_value)
  );
}
function Et(e) {
  return [...e].map(Ve).sort(
    (t, a) => t.tool_name.localeCompare(a.tool_name) || t.source_type.localeCompare(a.source_type) || t.source_value.localeCompare(a.source_value) || t.subject_type.localeCompare(a.subject_type) || t.subject_value.localeCompare(a.subject_value)
  );
}
function Kn(e) {
  return [...e].map(Jn).sort((t, a) => t.tool_name.localeCompare(a.tool_name));
}
function Re(e) {
  return {
    default_effect: e.default_effect || "deny",
    client_overrides: Xn(e.client_overrides || []),
    tool_defaults: Kn(e.tool_defaults || []),
    tool_overrides: Et(e.tool_overrides || []),
    unmanaged_rules_count: e.unmanaged_rules_count || 0
  };
}
function Ae(e) {
  return [De(e.source_type), Ke(e.source_value), bt(e.subject_type), e.subject_type === "all" ? "" : (e.subject_value || "").trim()].join("\0");
}
function Me(e) {
  return [e.tool_name || "*", De(e.source_type), Ke(e.source_value), bt(e.subject_type), e.subject_type === "all" ? "" : (e.subject_value || "").trim()].join("\0");
}
function bl(e, t) {
  const a = Re(t), n = /* @__PURE__ */ new Map();
  a.tool_overrides.forEach((c) => {
    const u = Ve(c), z = n.get(u.tool_name) || [];
    z.push(u), n.set(u.tool_name, z);
  });
  const l = new Map(a.tool_defaults.map((c) => [c.tool_name, Jn(c)])), s = new Set(e.map((c) => c.name)), r = e.map((c) => {
    var u;
    return {
      toolName: c.name,
      description: c.description,
      inputSchema: c.input_schema,
      stale: !1,
      defaultEffect: ((u = l.get(c.name)) == null ? void 0 : u.effect) || a.default_effect,
      hasExplicitDefault: l.has(c.name),
      rules: Et(n.get(c.name) || [])
    };
  }), o = /* @__PURE__ */ new Set([...n.keys(), ...l.keys()]), d = Array.from(o).filter((c) => c !== "*" && !s.has(c)).map((c) => {
    var u;
    return {
      toolName: c,
      description: "",
      inputSchema: {},
      stale: !0,
      defaultEffect: ((u = l.get(c)) == null ? void 0 : u.effect) || a.default_effect,
      hasExplicitDefault: l.has(c),
      rules: Et(n.get(c) || [])
    };
  });
  return [...r, ...d];
}
function Vn(e, t) {
  const a = Re(e), n = new Set(
    t === null ? a.client_overrides.map((l) => Ae(Be(l))) : a.tool_overrides.filter((l) => l.tool_name === t).map((l) => Me(Ve(l)))
  );
  for (const l of Hn) {
    const s = t === null ? Ae({ source_type: "channel", source_value: l, subject_type: "all", subject_value: "" }) : Me({ tool_name: t, source_type: "channel", source_value: l, subject_type: "all", subject_value: "" });
    if (!n.has(s)) return l;
  }
  return "console";
}
function Sl(e) {
  return Pt(e, { source_type: "channel", source_value: Vn(e, null), subject_type: "all", subject_value: "", effect: "ask" });
}
function wl(e, t) {
  return Ot(e, { tool_name: t, source_type: "channel", source_value: Vn(e, t), subject_type: "all", subject_value: "", effect: "ask" });
}
function Pt(e, t, a) {
  const n = Re(e), l = Be(t), s = Ae(a || l), r = Ae(l), o = n.client_overrides.filter((d) => {
    const c = Ae(Be(d));
    return c !== s && c !== r;
  });
  return o.push(l), { ...n, client_overrides: Xn(o) };
}
function Ot(e, t, a) {
  const n = Re(e), l = Ve(t), s = Me(a || l), r = Me(l), o = n.tool_overrides.filter((d) => {
    const c = Me(Ve(d));
    return c !== s && c !== r;
  });
  return o.push(l), { ...n, tool_overrides: Et(o) };
}
function Cl(e, t, a) {
  const n = Re(e), l = n.tool_defaults.filter((s) => s.tool_name !== t);
  return l.push({ tool_name: t, effect: a }), { ...n, tool_defaults: Kn(l) };
}
function xl(e, t) {
  const a = Re(e), n = Ae(t);
  return { ...a, client_overrides: a.client_overrides.filter((l) => Ae(Be(l)) !== n) };
}
function kl(e, t) {
  const a = Re(e), n = Me(t);
  return { ...a, tool_overrides: a.tool_overrides.filter((l) => Me(Ve(l)) !== n) };
}
function qn(e, t) {
  const a = De(t.source_type), n = Ke(t.source_value);
  if (Wn(n)) return [];
  const l = /* @__PURE__ */ new Map();
  return e.forEach((s) => {
    if (De(s.source_type) !== a || Ke(s.source_value) !== n) return;
    const r = (s.subject_value || "").trim();
    !r || l.has(r) || l.set(r, s);
  }), Array.from(l.values());
}
function _l(e, t) {
  return qn(e, t).map((a) => ({ label: a.subject_value, value: a.subject_value }));
}
function Gt(e) {
  return De(e.source_type) === "channel" && Wn(e.source_value) && bt(e.subject_type) === "user" && !!(e.subject_value || "").trim();
}
function Tl(e, t) {
  const a = Be(t);
  return a.subject_type === "user" && !!a.subject_value && a.subject_value !== "*" && e.some((n) => De(n.source_type) === a.source_type) && !Gt(a) && !qn(e, a).some((n) => n.subject_value === a.subject_value);
}
function zl(e) {
  const t = [...e.client_overrides || [], ...e.tool_overrides || []];
  for (const a of t) {
    const n = Be(a);
    if (n.subject_type === "user") {
      if (!n.subject_value || n.subject_value === "*" || !n.source_value) return { reason: "missingUserValue", rule: a };
      if (Gt(n)) return { reason: "ambiguousUserSource", rule: a };
    }
  }
  return null;
}
function bn(e, t) {
  const a = { ...e, ...t };
  return t.subject_type && (a.subject_value = ""), (t.source_type !== void 0 || t.source_value !== void 0) && t.subject_value === void 0 && a.subject_type === "user" && (a.subject_value = ""), a;
}
function zt(e) {
  return JSON.stringify(Re(e));
}
function Il({
  client: e,
  agentId: t,
  open: a,
  onClose: n,
  onSave: l
}) {
  const s = T().React, { useState: r, useEffect: o, useMemo: d, useCallback: c } = s, { Modal: u, Spin: z, Empty: C, Button: P, Tag: w, Segmented: p, Select: M, Input: $, AutoComplete: J, Typography: L, message: ee } = T().antd, { PlusOutlined: B, DeleteOutlined: N } = T().antdIcons || {}, { Text: O } = L, [x, k] = r(null), [V, D] = r([]), [A, E] = r([]), [v, f] = r(!1), [q, G] = r(!1), [ae, b] = r(""), [g, h] = r("");
  o(() => {
    if (!a) return;
    let m = !1;
    return (async () => {
      f(!0), D([]), E([]), b("");
      try {
        const I = await Ia(t, e.key);
        if (!m) {
          const se = Re(I);
          k(se), h(zt(se));
        }
        try {
          const se = await Oa(t);
          m || E(se);
        } catch {
          m || E([]);
        }
        if (!e.enabled) {
          m || b("MCP 客户端未启用，无法获取工具列表");
          return;
        }
        try {
          const se = await za(t, e.key);
          m || D(se);
        } catch (se) {
          m || b((se == null ? void 0 : se.message) || "无法加载工具列表");
        }
      } catch {
        m || (k(null), h(""), b("加载访问策略失败"));
      } finally {
        m || f(!1);
      }
    })(), () => {
      m = !0;
    };
  }, [a, e.key, e.enabled, t]);
  const S = d(() => x ? bl(V, x) : [], [V, x]), oe = d(() => !!(x && zt(x) !== g), [x, g]), j = (m) => vl[m] || m, Q = c((m) => {
    k((te) => te && { ...te, default_effect: m });
  }, []), ie = c((m, te) => {
    k((I) => I && Pt(I, bn(m, te), { source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
  }, []), U = c((m, te) => {
    k((I) => I && Ot(I, bn(m, te), { tool_name: m.tool_name, source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
  }, []), X = c(async () => {
    if (!x) return;
    const m = zl(x);
    if (m) {
      ee.error(m.reason === "missingUserValue" ? "用户规则缺少用户标识" : "用户来源不明确");
      return;
    }
    G(!0);
    try {
      await l(e.key, x) && (h(zt(x)), n());
    } finally {
      G(!1);
    }
  }, [x, e.key, l, n, ee]), re = c(() => {
    if (!oe || q) {
      n();
      return;
    }
    u.confirm({
      title: "放弃修改",
      content: "确定要放弃未保存的修改吗？",
      okText: "确认",
      cancelText: "取消",
      onOk: n
    });
  }, [oe, q, n]), y = c((m, te) => {
    const I = _l(A, m), se = Gt(m), de = Tl(A, m), ye = [{ label: "所有渠道", value: "*" }, ...Hn.map((F) => ({ label: j(F), value: F }))], fe = [{ label: "所有人", value: "all" }, { label: "指定用户", value: "user" }], ue = te ? U : ie, Y = (F) => {
      k(te ? (ce) => ce && Ot(ce, { ...m, effect: F }) : (ce) => ce && Pt(ce, { ...m, effect: F }));
    }, W = () => {
      k(te ? (F) => F && kl(F, { tool_name: m.tool_name, source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }) : (F) => F && xl(F, { source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
    }, _ = te ? Me(m) : Ae(m);
    return s.createElement(
      "div",
      { key: _, style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto", gap: 6, alignItems: "end", padding: "6px 0", borderBottom: "1px solid #f5f5f5" } },
      // source_type
      s.createElement(
        "div",
        null,
        s.createElement(O, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源类型"),
        s.createElement(M, {
          size: "small",
          style: { width: "100%" },
          value: m.source_type || "channel",
          onChange: (F) => ue(m, { source_type: F, source_value: F === "channel" ? m.source_value || "*" : m.source_value }),
          options: [{ label: "渠道", value: "channel" }, ...m.source_type && m.source_type !== "channel" ? [{ label: m.source_type, value: m.source_type }] : []]
        })
      ),
      // source_value
      s.createElement(
        "div",
        null,
        s.createElement(O, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源"),
        m.source_type === "channel" ? s.createElement(M, { size: "small", style: { width: "100%" }, value: m.source_value || "*", onChange: (F) => ue(m, { source_value: F }), options: ye }) : s.createElement($, { size: "small", placeholder: "来源标识", value: m.source_value, onChange: (F) => ue(m, { source_value: F.target.value }) })
      ),
      // subject_type
      s.createElement(
        "div",
        null,
        s.createElement(O, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "对象类型"),
        s.createElement(M, { size: "small", style: { width: "100%" }, value: m.subject_type, onChange: (F) => ue(m, { subject_type: F }), options: fe })
      ),
      // subject_value
      s.createElement(
        "div",
        null,
        s.createElement(O, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "对象"),
        m.subject_type === "user" ? s.createElement(
          "div",
          null,
          s.createElement(J, {
            size: "small",
            style: { width: "100%" },
            value: m.subject_value,
            options: I,
            placeholder: I.length > 0 ? "用户 ID" : "无近期用户",
            onChange: (F) => ue(m, { subject_value: F }),
            onSelect: (F) => ue(m, { subject_value: F }),
            filterOption: (F, ce) => String((ce == null ? void 0 : ce.value) || "").toLowerCase().includes(F.toLowerCase())
          }),
          se ? s.createElement(O, { style: { fontSize: 10, color: "#fa8c16", display: "block" } }, "请先选择具体渠道") : null,
          de ? s.createElement(O, { style: { fontSize: 10, color: "#fa8c16", display: "block" } }, "未知的用户标识") : null
        ) : s.createElement($, { size: "small", disabled: !0, value: "所有人" })
      ),
      // effect
      s.createElement(
        "div",
        null,
        s.createElement(O, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "效果"),
        s.createElement(M, {
          size: "small",
          style: { width: "100%" },
          value: m.effect,
          onChange: (F) => Y(F),
          options: [{ label: "允许", value: "allow" }, { label: "询问", value: "ask" }, { label: "拒绝", value: "deny" }]
        })
      ),
      // delete
      s.createElement(P, { size: "small", type: "text", icon: s.createElement(N), onClick: W, title: "删除规则" })
    );
  }, [A, ie, U]), ne = (m, te) => {
    const se = {
      ask: { bg: "rgba(245,158,11,0.24)", border: "rgba(217,119,6,0.36)", text: "#8a4b00" },
      allow: { bg: "rgba(34,197,94,0.22)", border: "rgba(22,163,74,0.35)", text: "#17643a" },
      deny: { bg: "rgba(239,68,68,0.2)", border: "rgba(220,38,38,0.34)", text: "#9f1f26" }
    }[m];
    return s.createElement(p, {
      size: "small",
      value: m,
      onChange: (de) => te(de),
      style: { "--mcp-policy-segment-bg": se.bg, "--mcp-policy-segment-border": se.border, "--mcp-policy-segment-text": se.text },
      options: [{ label: "询问", value: "ask" }, { label: "允许", value: "allow" }, { label: "拒绝", value: "deny" }]
    });
  };
  return s.createElement(
    u,
    {
      title: `${e.name || e.key} - 工具与访问策略`,
      open: a,
      onCancel: re,
      width: "min(1040px, calc(100vw - 32px))",
      styles: {
        body: {
          maxHeight: "min(520px, calc(100vh - 280px))",
          overflowY: "auto",
          overflowX: "hidden"
        }
      },
      footer: s.createElement(
        "div",
        { style: { textAlign: "right" } },
        s.createElement(P, { onClick: re, style: { marginRight: 8 } }, "取消"),
        s.createElement(P, { type: "primary", onClick: X, loading: q, disabled: !x || v }, "保存")
      )
    },
    v && !x ? s.createElement("div", { style: { textAlign: "center", padding: 40 } }, s.createElement(z)) : x ? s.createElement(
      "div",
      null,
      // ── Client-level panel ──
      s.createElement(
        "div",
        { style: { marginBottom: 16, padding: "12px 16px", background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" } },
        s.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
          s.createElement(O, { strong: !0 }, "客户端访问策略"),
          s.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 8 } },
            s.createElement(O, { style: { fontSize: 12, color: "#666" } }, "默认:"),
            ne(x.default_effect, Q),
            s.createElement(P, { size: "small", icon: s.createElement(B), onClick: () => k((m) => m && Sl(m)) }, "添加规则")
          )
        ),
        x.client_overrides.length === 0 ? s.createElement(O, { style: { fontSize: 12, color: "#999" } }, "暂无客户端级覆盖规则") : s.createElement("div", null, ...x.client_overrides.map((m) => y(m, !1)))
      ),
      // ── Error message ──
      ae ? s.createElement("div", { style: { color: "#ff4d4f", fontSize: 12, marginBottom: 8 } }, ae) : null,
      // ── Tool-level panel ──
      s.createElement(O, { strong: !0, style: { display: "block", marginBottom: 8 } }, "工具访问策略"),
      S.length === 0 ? s.createElement(C, { description: "暂无工具" }) : s.createElement(
        "div",
        null,
        ...S.map(
          (m) => s.createElement(
            "div",
            { key: m.toolName, style: { marginBottom: 12, padding: "10px 12px", background: "#fafafa", borderRadius: 6, border: "1px solid #f0f0f0" } },
            s.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 } },
              s.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 6 } },
                s.createElement(w, { color: m.stale ? "default" : "blue" }, m.toolName),
                m.stale ? s.createElement(w, { color: "orange" }, "已失效") : null
              ),
              s.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                s.createElement(O, { style: { fontSize: 12, color: "#666" } }, "默认:"),
                ne(m.defaultEffect, (te) => k((I) => I && Cl(I, m.toolName, te))),
                s.createElement(P, { size: "small", icon: s.createElement(B), onClick: () => k((te) => te && wl(te, m.toolName)) }, "添加规则")
              )
            ),
            // Tool schema
            m.description || m.inputSchema && Object.keys(m.inputSchema).length > 0 ? s.createElement(
              "details",
              { style: { marginBottom: 6, fontSize: 12 } },
              s.createElement("summary", { style: { cursor: "pointer", color: "#888" } }, "工具详情"),
              m.description ? s.createElement("div", { style: { padding: "4px 0", color: "#666" } }, m.description) : null,
              m.inputSchema && Object.keys(m.inputSchema).length > 0 ? s.createElement("pre", { style: { background: "#f5f5f5", padding: 8, borderRadius: 4, fontSize: 11, overflow: "auto", maxHeight: 200 } }, JSON.stringify(m.inputSchema, null, 2)) : null
            ) : null,
            // Tool rules
            m.rules.length === 0 ? s.createElement(O, { style: { fontSize: 12, color: "#999" } }, "暂无工具级覆盖规则") : s.createElement("div", null, ...m.rules.map((te) => y(te, !0)))
          )
        )
      )
    ) : s.createElement("div", { style: { color: "#ff4d4f" } }, "加载访问策略失败")
  );
}
function Pl({
  client: e,
  agentId: t,
  open: a,
  onClose: n,
  onAuthChanged: l
}) {
  var G, ae, b, g, h;
  const s = T().React, { useState: r, useCallback: o, useEffect: d } = s, { Modal: c, Button: u, Input: z, Typography: C, message: P } = T().antd, { Text: w } = C, [p, M] = r("idle"), [$, J] = r(""), [L, ee] = r(!1), [B, N] = r(((G = e.oauth_status) == null ? void 0 : G.client_id) || ""), [O, x] = r(((ae = e.oauth_status) == null ? void 0 : ae.scope) || ""), [k, V] = r(""), [D, A] = r("");
  d(() => {
    if (p !== "waiting") return;
    const S = setInterval(async () => {
      try {
        (await Ma(t, e.key)).authorized && (M("success"), l());
      } catch {
      }
    }, 2e3);
    return () => clearInterval(S);
  }, [p, e.key, t, l]);
  const E = p === "success" || p === "idle" && ((b = e.oauth_status) == null ? void 0 : b.authorized) === !0, v = p === "idle" && ((g = e.oauth_status) == null ? void 0 : g.authorized) && e.oauth_status.expires_at > 0 && e.oauth_status.expires_at < Date.now() / 1e3, f = o(async () => {
    var S;
    if (!((S = e.url) != null && S.trim())) {
      J("缺少 URL");
      return;
    }
    M("starting"), J("");
    try {
      const oe = await Aa(t, e.key, {
        url: e.url,
        scope: O,
        client_id: B,
        auth_endpoint: k,
        token_endpoint: D
      });
      M("waiting"), window.open(oe.auth_url, "_blank", "popup,width=600,height=700");
    } catch (oe) {
      M("error"), J((oe == null ? void 0 : oe.message) || "OAuth 启动失败");
    }
  }, [t, e.key, e.url, O, B, k, D]), q = o(async () => {
    M("revoking");
    try {
      await $a(t, e.key), M("idle"), l();
    } catch {
      M("idle");
    }
  }, [t, e.key, l]);
  return s.createElement(
    c,
    {
      title: `${e.name || e.key} — OAuth 授权管理`,
      open: a,
      onCancel: n,
      footer: s.createElement("div", { style: { textAlign: "right" } }, s.createElement(u, { onClick: n }, "关闭")),
      width: 560
    },
    s.createElement(
      "div",
      { style: { background: "#f8f9fa", border: "1px solid #e9ecef", borderRadius: 8, padding: "12px 14px" } },
      // Status
      s.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 } },
        s.createElement(
          "span",
          { style: { fontSize: 12, padding: "2px 8px", borderRadius: 12, border: "1px solid", color: v ? "#e67e22" : E ? "#27ae60" : "#7f8c8d", borderColor: v ? "#e67e22" : E ? "#27ae60" : "#7f8c8d", background: "white" } },
          v ? "已过期" : E ? "已授权" : p === "waiting" ? "等待授权..." : p === "error" ? "授权失败" : "未授权"
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          E || v ? s.createElement(u, { size: "small", onClick: q, loading: p === "revoking" }, "撤销") : null,
          s.createElement(u, { size: "small", type: E && !v ? "default" : "primary", onClick: f, loading: p === "starting" || p === "waiting", disabled: !((h = e.url) != null && h.trim()) }, E && !v ? "重新授权" : "授权")
        )
      ),
      $ ? s.createElement("p", { style: { color: "#c0392b", fontSize: 12 } }, $) : null,
      // Advanced
      s.createElement(
        "div",
        { style: { marginTop: 8, cursor: "pointer", color: "#888", fontSize: 12 }, onClick: () => ee((S) => !S) },
        L ? "收起高级设置" : "展开高级设置"
      ),
      L ? s.createElement(
        "div",
        { style: { marginTop: 8, padding: "10px 12px", background: "white", borderRadius: 6, border: "1px solid #e9ecef" } },
        s.createElement(w, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2 } }, "Client ID"),
        s.createElement(z, { size: "small", placeholder: "留空则使用动态注册", value: B, onChange: (S) => N(S.target.value) }),
        s.createElement(w, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "Scope"),
        s.createElement(z, { size: "small", placeholder: "OAuth scope", value: O, onChange: (S) => x(S.target.value) }),
        s.createElement(w, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "授权端点"),
        s.createElement(z, { size: "small", placeholder: "https://auth.example.com/authorize", value: k, onChange: (S) => V(S.target.value) }),
        s.createElement(w, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "令牌端点"),
        s.createElement(z, { size: "small", placeholder: "https://auth.example.com/token", value: D, onChange: (S) => A(S.target.value) })
      ) : null
    )
  );
}
function Ol({
  mcp: e,
  agentId: t,
  onToggle: a,
  onDelete: n,
  onUpdate: l,
  onUpdatePolicy: s,
  onRefresh: r
}) {
  const o = T().React, { useState: d } = o, { Card: c, Tag: u, Tooltip: z, Modal: C, Input: P, Button: w, Typography: p } = T().antd, { Text: M } = p, {
    EyeOutlined: $,
    EyeInvisibleOutlined: J,
    DeleteOutlined: L,
    ToolOutlined: ee
  } = T().antdIcons || {}, [B, N] = d(!1), [O, x] = d(!1), [k, V] = d(!1), [D, A] = d(""), [E, v] = d(!1), [f, q] = d(!1), G = e.transport === "streamable_http" || e.transport === "sse", ae = G ? "Remote" : "Local", b = e.oauth_status, g = Date.now() / 1e3, h = !!(b != null && b.authorized) && b.expires_at > g, S = !!(b != null && b.authorized) && b.expires_at <= g, oe = !!b, j = () => {
    A(JSON.stringify(e, null, 2)), v(!1), N(!0);
  }, Q = async () => {
    try {
      const U = JSON.parse(D), X = [
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
      ], re = {};
      for (const ne of X)
        ne in U && (re[ne] = U[ne]);
      await l(e.key, re) && (N(!1), v(!1));
    } catch {
      alert("JSON 格式错误");
    }
  }, ie = JSON.stringify(e, null, 2);
  return o.createElement(
    o.Fragment,
    null,
    o.createElement(
      c,
      {
        hoverable: !0,
        onClick: j,
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
      o.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 } },
        o.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0 } },
          o.createElement(
            z,
            { title: e.name },
            o.createElement(M, { strong: !0, style: { fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, e.name || e.key)
          ),
          o.createElement(
            "span",
            { style: { fontSize: 10, padding: "1px 6px", borderRadius: 4, background: G ? "#e6f4ff" : "#f9f0ff", color: G ? "#1677ff" : "#722ed1", flexShrink: 0 } },
            ae
          ),
          // OAuth status icons
          oe && S ? o.createElement("span", { style: { fontSize: 11, color: "#e67e22", flexShrink: 0 } }, "⚠") : null,
          oe && h ? o.createElement("span", { style: { fontSize: 11, color: "#27ae60", flexShrink: 0 } }, "✓") : null,
          oe && !h && !S ? o.createElement("span", { style: { fontSize: 11, color: "#7f8c8d", flexShrink: 0 } }, "🔒") : null
        ),
        o.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, flexShrink: 0 } },
          o.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: e.enabled ? "#52c41a" : "#d9d9d9" } }),
          e.enabled ? "启用" : "停用"
        )
      ),
      // ── Description ──
      o.createElement(
        "p",
        { style: { fontSize: 12, color: "#666", margin: "6px 0 8px", lineHeight: 1.6, minHeight: 36, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } },
        e.description || "-"
      ),
      // ── Footer: tools button + secondary actions ──
      o.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8, marginTop: "auto", paddingTop: 12, borderTop: "1px solid #f0f0f0" } },
        // Tools button
        o.createElement(
          w,
          {
            size: "small",
            icon: ee ? o.createElement(ee) : void 0,
            onClick: (U) => {
              U.stopPropagation(), V(!0);
            },
            style: { width: "100%" }
          },
          "工具与访问策略"
        ),
        // Secondary actions: oauth (remote only) + toggle + delete
        o.createElement(
          "div",
          { style: { display: "grid", gridTemplateColumns: G ? "1fr 1fr 1fr" : "1fr 1fr", gap: 8 } },
          G ? o.createElement(
            w,
            {
              size: "small",
              onClick: (U) => {
                U.stopPropagation(), q(!0);
              },
              style: {
                color: h ? "#27ae60" : S ? "#e67e22" : void 0,
                borderColor: h ? "#27ae60" : S ? "#e67e22" : void 0,
                background: h ? "rgba(39,174,96,0.06)" : S ? "rgba(230,126,34,0.06)" : void 0
              }
            },
            h ? "已授权" : S ? "已过期" : "授权"
          ) : null,
          o.createElement(
            w,
            {
              size: "small",
              icon: e.enabled ? J ? o.createElement(J) : void 0 : $ ? o.createElement($) : void 0,
              onClick: a
            },
            e.enabled ? "禁用" : "启用"
          ),
          o.createElement(
            w,
            {
              size: "small",
              danger: !0,
              icon: L ? o.createElement(L) : void 0,
              onClick: (U) => {
                U.stopPropagation(), x(!0);
              }
            },
            "删除"
          )
        )
      )
    ),
    // ── Delete Confirmation Modal ──
    o.createElement(
      C,
      {
        title: "确认删除",
        open: O,
        onOk: () => {
          x(!1), n();
        },
        onCancel: () => x(!1),
        okText: "确认删除",
        cancelText: "取消",
        okButtonProps: { danger: !0 }
      },
      o.createElement("p", null, `确定要删除 MCP 客户端「${e.name || e.key}」吗？此操作不可撤销。`)
    ),
    // ── JSON Config Modal (click card to view/edit) ──
    o.createElement(
      C,
      {
        title: `${e.name || e.key} - 配置`,
        open: B,
        onCancel: () => {
          N(!1), v(!1);
        },
        footer: o.createElement(
          "div",
          { style: { textAlign: "right" } },
          o.createElement(w, { onClick: () => {
            N(!1), v(!1);
          }, style: { marginRight: 8 } }, "取消"),
          E ? o.createElement(w, { type: "primary", onClick: Q }, "保存") : o.createElement(w, { type: "primary", onClick: () => v(!0) }, "编辑")
        ),
        width: 700
      },
      o.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "密钥类字段（如 API_KEY）可能已被后端脱敏，保存时不会覆盖脱敏值。"
      ),
      E ? o.createElement(P.TextArea, {
        value: D,
        onChange: (U) => A(U.target.value),
        autoSize: { minRows: 15, maxRows: 25 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      }) : o.createElement(
        "pre",
        { style: { backgroundColor: "#f5f5f5", padding: 16, borderRadius: 8, maxHeight: 400, overflow: "auto", fontSize: 13, fontFamily: "Monaco, Courier New, monospace" } },
        ie
      )
    ),
    // ── Access Modal (tools + access policy) ──
    o.createElement(Il, {
      client: e,
      agentId: t,
      open: k,
      onClose: () => V(!1),
      onSave: s
    }),
    // ── OAuth Modal (remote clients only) ──
    G ? o.createElement(Pl, {
      client: e,
      agentId: t,
      open: f,
      onClose: () => q(!1),
      onAuthChanged: async () => {
        await (r == null ? void 0 : r());
      }
    }) : null
  );
}
const At = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, Yn = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, Qn = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function Zn(e) {
  return Ye(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
function Sn(e) {
  return Ye(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function wn(e) {
  const t = e.map(encodeURIComponent).join(",");
  return Ye(`/ugsci/avatar/team/${t}`);
}
function $e({
  name: e,
  size: t = 32,
  borderRadius: a = "50%"
}) {
  const n = T().React, [l, s] = n.useState(0), r = l === 0 ? Sn(e) : `${Sn(e)}?_r=${l}`;
  return n.createElement("img", {
    src: r,
    alt: e,
    onError: () => {
      l < 1 && s(l + 1);
    },
    style: { width: t, height: t, borderRadius: a, objectFit: "cover", flexShrink: 0 }
  });
}
function Ht({
  members: e,
  size: t = 32,
  borderRadius: a = "50%"
}) {
  const n = T().React, [l, s] = n.useState(0);
  if (!e || e.length === 0)
    return n.createElement("span", {
      style: { width: t, height: t, display: "inline-block" }
    });
  const r = e.slice(0, 5), o = l === 0 ? wn(r) : `${wn(r)}?_r=${l}`;
  return n.createElement("img", {
    src: o,
    alt: "team",
    onError: () => {
      l < 1 && s(l + 1);
    },
    style: { width: t, height: t, borderRadius: a, objectFit: "cover", flexShrink: 0 }
  });
}
async function Al() {
  return le("/ugsci/engines/list");
}
async function Ml(e) {
  return le("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function $l(e, t) {
  return le(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function Rl(e) {
  return le(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function Ll() {
  return le("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function jl({
  engine: e,
  onClick: t
}) {
  const a = T().React, { Card: n, Tag: l, Typography: s } = T().antd, { Text: r } = s, o = e.status === "detected", d = Yn[e.category] || "📦", u = Qn.has(e.id) ? a.createElement("img", {
    src: Zn(e.id),
    alt: e.name,
    style: { width: 24, height: 24, objectFit: "contain" }
  }) : a.createElement("span", { style: { fontSize: 20 } }, d);
  return a.createElement(
    n,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        borderColor: o ? void 0 : "#d9d9d9",
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
        u,
        a.createElement(
          "div",
          null,
          a.createElement(
            r,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          a.createElement("br"),
          a.createElement(
            r,
            { type: "secondary", style: { fontSize: 11 } },
            e.vendor || "—"
          )
        )
      ),
      a.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" } },
        o ? a.createElement(
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
        r,
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
        At[e.category] || e.category
      ) : null,
      e.version ? a.createElement(
        l,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (z) => a.createElement(
          l,
          { key: z, color: "cyan", style: { fontSize: 10 } },
          z
        )
      )
    )
  );
}
function Bl() {
  const e = T().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, {
    Spin: s,
    Empty: r,
    Button: o,
    message: d,
    Row: c,
    Col: u,
    Drawer: z,
    Descriptions: C,
    Tag: P,
    Typography: w,
    Modal: p,
    Input: M,
    Select: $,
    Popconfirm: J,
    Space: L
  } = T().antd, {
    ReloadOutlined: ee,
    SearchOutlined: B,
    PlusOutlined: N,
    EditOutlined: O,
    DeleteOutlined: x,
    CopyOutlined: k,
    ExperimentOutlined: V
  } = T().antdIcons || {}, { Text: D, Paragraph: A } = w, [E, v] = t([]), [f, q] = t(!0), [G, ae] = t(""), [b, g] = t(!1), [h, S] = t(null), [oe, j] = t(!1), [Q, ie] = t(null), [U, X] = t({}), [re, y] = t(!1), ne = n(async () => {
    q(!0);
    try {
      const Y = await Al();
      v(Y.engines || []);
    } catch (Y) {
      d.error(Y.message || "加载引擎列表失败"), v([]);
    } finally {
      q(!1);
    }
  }, []);
  a(() => {
    ne();
  }, [ne]);
  const m = l(() => {
    if (!G.trim()) return E;
    const Y = G.toLowerCase();
    return E.filter(
      (W) => {
        var _;
        return W.name.toLowerCase().includes(Y) || W.vendor.toLowerCase().includes(Y) || W.category.toLowerCase().includes(Y) || ((_ = W.description) == null ? void 0 : _.toLowerCase().includes(Y));
      }
    );
  }, [E, G]);
  E.filter((Y) => Y.status === "detected").length;
  const te = n((Y) => {
    navigator.clipboard.writeText(Y).then(() => d.success("路径已复制")).catch(() => d.error("复制失败"));
  }, []), I = n(() => {
    ie(null), X({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), j(!0);
  }, []), se = n((Y) => {
    ie(Y), X({ ...Y }), j(!0), g(!1);
  }, []), de = n(async () => {
    var Y;
    if (!((Y = U.name) != null && Y.trim())) {
      d.warning("请输入引擎名称");
      return;
    }
    y(!0);
    try {
      Q ? (await $l(Q.id, U), d.success("引擎已更新")) : (await Ml(U), d.success("引擎已添加")), j(!1), ne();
    } catch (W) {
      d.error(W.message || "保存失败");
    } finally {
      y(!1);
    }
  }, [U, Q, ne]), ye = n(
    async (Y) => {
      try {
        await Rl(Y), d.success("引擎已删除"), g(!1), ne();
      } catch (W) {
        d.error(W.message || "删除失败");
      }
    },
    [ne]
  ), fe = n(async () => {
    q(!0);
    try {
      const Y = await Ll();
      v(Y.engines || []), d.success("自动检测完成");
    } catch (Y) {
      d.error(Y.message || "检测失败");
    } finally {
      q(!1);
    }
  }, []), ue = n(
    (Y, W, _) => {
      const F = U[W] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          D,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          Y
        ),
        _ != null && _.select ? e.createElement($, {
          value: F || void 0,
          onChange: (ce) => X((H) => ({ ...H, [W]: ce })),
          style: { width: "100%" },
          options: _.select.options,
          allowClear: !0,
          placeholder: `选择${Y}`
        }) : _ != null && _.textarea ? e.createElement(M.TextArea, {
          value: F,
          onChange: (ce) => X((H) => ({ ...H, [W]: ce.target.value })),
          rows: 3,
          placeholder: `输入${Y}`
        }) : e.createElement(M, {
          value: F,
          onChange: (ce) => X((H) => ({ ...H, [W]: ce.target.value })),
          placeholder: `输入${Y}`
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
      e.createElement(M, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: B ? e.createElement(B) : void 0,
        value: G,
        onChange: (Y) => ae(Y.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        o,
        {
          icon: ee ? e.createElement(ee) : void 0,
          onClick: fe,
          loading: f
        },
        "自动检测"
      ),
      e.createElement(
        o,
        {
          type: "primary",
          icon: N ? e.createElement(N) : void 0,
          onClick: I,
          style: Pe
        },
        "添加引擎"
      )
    ),
    // Content
    f ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(s, {
        size: "large",
        tip: "正在加载计算引擎..."
      })
    ) : m.length === 0 ? e.createElement(r, {
      description: G ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      c,
      { gutter: [12, 12], align: "stretch" },
      ...m.map(
        (Y) => e.createElement(
          u,
          {
            key: Y.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(jl, {
            engine: Y,
            onClick: () => {
              S(Y), g(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    h ? e.createElement(
      z,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            Qn.has(h.id) ? e.createElement("img", {
              src: Zn(h.id),
              alt: h.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              Yn[h.category] || "📦"
            )
          ),
          e.createElement("span", null, h.name)
        ),
        open: b,
        onClose: () => g(!1),
        width: 520,
        extra: e.createElement(
          L,
          null,
          e.createElement(
            o,
            {
              size: "small",
              icon: O ? e.createElement(O) : void 0,
              onClick: () => se(h)
            },
            "编辑"
          ),
          h.is_default ? null : e.createElement(
            J,
            {
              title: "确认删除此引擎？",
              description: h.name,
              onConfirm: () => ye(h.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              o,
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
        C,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          C.Item,
          { label: "引擎名称" },
          h.name
        ),
        e.createElement(
          C.Item,
          { label: "厂商" },
          h.vendor || "—"
        ),
        e.createElement(
          C.Item,
          { label: "分类" },
          h.category ? At[h.category] || h.category : "—"
        ),
        e.createElement(
          C.Item,
          { label: "状态" },
          e.createElement(
            P,
            {
              color: h.status === "detected" ? "success" : h.status === "not_found" ? "error" : "default"
            },
            h.status === "detected" ? "✅ 已检测" : h.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          C.Item,
          { label: "版本" },
          h.version || "—"
        ),
        h.executable_path ? e.createElement(
          C.Item,
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
              o,
              {
                size: "small",
                type: "text",
                icon: k ? e.createElement(k) : void 0,
                onClick: () => te(h.executable_path)
              }
            )
          )
        ) : null,
        h.install_dir ? e.createElement(
          C.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            h.install_dir
          )
        ) : null,
        // Display detected modules with paths
        h.modules && h.modules.length > 0 ? e.createElement(
          C.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...h.modules.map(
              (Y) => e.createElement(
                "div",
                {
                  key: Y,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  P,
                  { color: "cyan", style: { fontSize: 11 } },
                  Y
                ),
                h.module_paths && h.module_paths[Y] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  h.module_paths[Y]
                ) : null
              )
            )
          )
        ) : null,
        h.license_server ? e.createElement(
          C.Item,
          { label: "许可证服务器" },
          h.license_server
        ) : null,
        e.createElement(
          C.Item,
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
          D,
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
          P,
          { color: "blue" },
          "默认引擎"
        ) : h.is_custom ? e.createElement(
          P,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      p,
      {
        title: Q ? "编辑引擎" : "添加计算引擎",
        open: oe,
        onOk: de,
        onCancel: () => j(!1),
        okText: Q ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: re,
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
            options: Object.entries(At).map(([Y, W]) => ({
              label: W,
              value: Y
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
function Ul() {
  const e = T().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, {
    Spin: s,
    Empty: r,
    Input: o,
    Button: d,
    message: c,
    Row: u,
    Col: z,
    Tabs: C,
    Modal: P
  } = T().antd, {
    ReloadOutlined: w,
    PlusOutlined: p,
    SearchOutlined: M,
    ApiOutlined: $,
    RocketOutlined: J
  } = T().antdIcons || {}, { TextArea: L } = o, B = T().useSelectedAgent, N = B ? B() : null, O = (N == null ? void 0 : N.id) || "default", [x, k] = t([]), [V, D] = t(!0), [A, E] = t(""), [v, f] = t("mcp"), [q, G] = t(!1), [ae, b] = t(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [g, h] = t(!1), S = n(async () => {
    D(!0);
    try {
      const m = await Ca(O);
      k(m);
    } catch (m) {
      c.error(m.message || "加载 MCP 列表失败"), k([]);
    } finally {
      D(!1);
    }
  }, [O]);
  a(() => {
    S();
  }, [S]);
  const oe = n(
    async (m) => {
      try {
        await xa(O, m.key), c.success(m.enabled ? "已禁用" : "已启用"), S();
      } catch (te) {
        c.error(te.message || "切换状态失败");
      }
    },
    [O, S]
  ), j = n(async (m) => {
    try {
      await ka(O, m.key), c.success(`MCP「${m.key}」已删除`), S();
    } catch (te) {
      c.error(te.message || "删除失败");
    }
  }, [O, S]), Q = n(async () => {
    h(!0);
    try {
      const m = JSON.parse(ae), te = m.mcpServers || m, I = Object.entries(te);
      if (I.length === 0) {
        c.warning("未找到 MCP 客户端配置");
        return;
      }
      let se = !0;
      for (const [de, ye] of I) {
        const fe = ye, ue = fe.url ? "streamable_http" : "stdio", Y = {
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
          await _a(
            O,
            de,
            Y
          );
        } catch {
          se = !1;
        }
      }
      se && (c.success("MCP 客户端已创建"), G(!1), S());
    } catch (m) {
      m instanceof SyntaxError ? c.error("JSON 格式错误：" + m.message) : c.error(m.message || "创建 MCP 失败");
    } finally {
      h(!1);
    }
  }, [ae, O, S]), ie = l(() => {
    if (!A.trim()) return x;
    const m = A.toLowerCase();
    return x.filter(
      (te) => {
        var I;
        return te.name.toLowerCase().includes(m) || te.key.toLowerCase().includes(m) || ((I = te.description) == null ? void 0 : I.toLowerCase().includes(m)) || te.transport.toLowerCase().includes(m);
      }
    );
  }, [x, A]), U = x.filter((m) => m.enabled).length, X = x.reduce((m, te) => {
    var I;
    return m + (((I = te.tools) == null ? void 0 : I.length) || 0);
  }, 0), re = (m) => {
    window.history.pushState({}, "", m), window.dispatchEvent(new PopStateEvent("popstate"));
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
      e.createElement(o, {
        placeholder: "搜索能力名称、描述...",
        prefix: M ? e.createElement(M) : void 0,
        value: A,
        onChange: (m) => E(m.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      e.createElement(
        d,
        {
          type: "primary",
          icon: p ? e.createElement(p) : void 0,
          onClick: () => G(!0),
          style: Pe
        },
        "添加 MCP"
      ),
      e.createElement(
        d,
        {
          icon: $ ? e.createElement($) : void 0,
          onClick: () => re("/mcp")
        },
        "前往 MCP 管理"
      )
    ),
    V ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(s, { size: "large" })
    ) : ie.length === 0 ? e.createElement(r, {
      description: A ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「添加 MCP」创建"
    }) : e.createElement(
      u,
      { gutter: [12, 12], align: "stretch" },
      ...ie.map(
        (m) => e.createElement(
          z,
          {
            key: m.key,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Ol, {
            mcp: m,
            agentId: O,
            onToggle: (te) => {
              te.stopPropagation(), oe(m);
            },
            onDelete: () => {
              j(m);
            },
            onUpdate: async (te, I) => {
              try {
                return await Ta(O, te, I), c.success("MCP 配置已更新"), S(), !0;
              } catch (se) {
                return c.error(se.message || "更新 MCP 失败"), !1;
              }
            },
            onUpdatePolicy: async (te, I) => {
              try {
                return await Pa(O, te, I), c.success("访问策略已保存"), S(), !0;
              } catch (se) {
                return c.error(se.message || "保存访问策略失败"), !1;
              }
            },
            onRefresh: async () => {
              S();
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
        $ ? e.createElement($, { style: { fontSize: 14 } }) : null,
        "MCP 客户端"
      ),
      children: y
    },
    {
      key: "software",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        J ? e.createElement(J, { style: { fontSize: 14 } }) : null,
        "计算引擎"
      ),
      children: e.createElement(Bl)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(vt, {
      title: "工具",
      subtitle: `MCP: ${x.length} 个客户端（${U} 个启用）· ${X} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          d,
          {
            icon: w ? e.createElement(w) : void 0,
            onClick: () => {
              Qe(), S();
            },
            loading: V
          },
          "刷新"
        )
      )
    }),
    e.createElement(C, {
      items: ne,
      activeKey: v,
      onChange: (m) => f(m)
    }),
    // ── Create MCP Modal (mirror console /mcp JSON import) ──
    e.createElement(
      P,
      {
        title: "添加 MCP 客户端 (JSON)",
        open: q,
        onCancel: () => G(!1),
        onOk: Q,
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
      e.createElement(L, {
        value: ae,
        onChange: (m) => b(m.target.value),
        autoSize: { minRows: 12, maxRows: 20 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      })
    )
  );
}
function Nl({
  agentId: e,
  agentName: t,
  onNavigate: a
}) {
  const n = T().React, { useState: l, useEffect: s, useCallback: r } = n, {
    Spin: o,
    Empty: d,
    Button: c,
    Row: u,
    Col: z,
    Card: C,
    Tag: P,
    Checkbox: w,
    Modal: p,
    Typography: M,
    Drawer: $,
    Descriptions: J,
    message: L
  } = T().antd, {
    ReloadOutlined: ee,
    ThunderboltOutlined: B,
    SettingOutlined: N,
    CheckSquareOutlined: O,
    EyeOutlined: x,
    EyeInvisibleOutlined: k,
    DeleteOutlined: V,
    CloseOutlined: D
  } = T().antdIcons || {}, { Text: A, Paragraph: E } = M, [v, f] = l([]), [q, G] = l(!0), [ae, b] = l(!1), [g, h] = l(null), [S, oe] = l(!1), [j, Q] = l(
    /* @__PURE__ */ new Set()
  ), [ie, U] = l(!1), [X, re] = l(null), [y, ne] = l(!1), m = r(async () => {
    if (e) {
      G(!0);
      try {
        const _ = await ht(e);
        f(_);
      } catch (_) {
        L.error(_.message || "加载技能失败"), f([]);
      } finally {
        G(!1);
      }
    }
  }, [e]);
  s(() => {
    m();
  }, [m]);
  const te = (_) => {
    Q((F) => {
      const ce = new Set(F);
      return ce.has(_) ? ce.delete(_) : ce.add(_), ce;
    });
  }, I = () => Q(/* @__PURE__ */ new Set()), se = () => Q(new Set(v.map((_) => _.name))), de = () => {
    S ? (I(), oe(!1)) : oe(!0);
  }, ye = async () => {
    const _ = Array.from(j);
    if (_.length !== 0) {
      U(!0);
      try {
        const { results: F } = await Wa(e, _), ce = Object.entries(F).filter(
          ([, pe]) => pe.success === !1
        ), H = _.length - ce.length;
        ce.length > 0 ? L.warning(
          `批量启用完成：成功 ${H} 个，失败 ${ce.length} 个`
        ) : L.success(`成功启用 ${_.length} 个技能`), I(), await m();
      } catch (F) {
        L.error(F.message || "批量启用失败");
      } finally {
        U(!1);
      }
    }
  }, fe = async () => {
    const _ = Array.from(j);
    if (_.length !== 0) {
      U(!0);
      try {
        const { results: F } = await Ja(e, _), ce = Object.entries(F).filter(
          ([, pe]) => pe.success === !1
        ), H = _.length - ce.length;
        ce.length > 0 ? L.warning(
          `批量停用完成：成功 ${H} 个，失败 ${ce.length} 个`
        ) : L.success(`成功停用 ${_.length} 个技能`), I(), await m();
      } catch (F) {
        L.error(F.message || "批量停用失败");
      } finally {
        U(!1);
      }
    }
  }, ue = () => {
    const _ = Array.from(j);
    _.length !== 0 && p.confirm({
      title: `确认删除 ${_.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        U(!0);
        try {
          const { results: F } = await Xa(e, _), ce = Object.entries(F).filter(
            ([, pe]) => pe.success === !1
          ), H = _.length - ce.length;
          ce.length > 0 ? L.warning(
            `批量删除完成：成功 ${H} 个，失败 ${ce.length} 个`
          ) : L.success(`成功删除 ${_.length} 个技能`), I(), await m();
        } catch (F) {
          L.error(F.message || "批量删除失败");
        } finally {
          U(!1);
        }
      }
    });
  }, Y = async (_) => {
    ne(!0);
    try {
      _.enabled === !1 ? (await Rn(e, _.name), L.success(`已启用技能「${_.name}」`)) : (await Bn(e, _.name), L.success(`已禁用技能「${_.name}」`)), await m();
    } catch (F) {
      L.error(F.message || "操作失败");
    } finally {
      ne(!1);
    }
  }, W = (_) => {
    p.confirm({
      title: `确认删除技能「${_.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ne(!0);
        try {
          await Dt(e, _.name), L.success(`已删除技能「${_.name}」`), await m();
        } catch (F) {
          L.error(F.message || "删除失败");
        } finally {
          ne(!1);
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
        A,
        { type: "secondary", style: { fontSize: 13 } },
        S ? `已选择 ${j.size} / ${v.length} 个技能` : `共 ${v.length} 个技能`
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        S ? n.createElement(
          n.Fragment,
          null,
          n.createElement(
            c,
            { size: "small", onClick: se },
            "全选"
          ),
          n.createElement(
            c,
            {
              size: "small",
              icon: D ? n.createElement(D) : void 0,
              onClick: I
            },
            "取消选择"
          ),
          n.createElement(
            c,
            {
              size: "small",
              type: "default",
              icon: x ? n.createElement(x) : void 0,
              disabled: j.size === 0 || ie,
              loading: ie,
              onClick: ye
            },
            "批量启用"
          ),
          n.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: k ? n.createElement(k) : void 0,
              disabled: j.size === 0 || ie,
              loading: ie,
              onClick: fe
            },
            "批量停用"
          ),
          n.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: V ? n.createElement(V) : void 0,
              disabled: j.size === 0 || ie,
              loading: ie,
              onClick: ue
            },
            `删除 (${j.size})`
          ),
          n.createElement(
            c,
            {
              size: "small",
              type: "primary",
              onClick: de
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
              icon: O ? n.createElement(O) : void 0,
              onClick: de,
              disabled: v.length === 0
            },
            "批量管理"
          ),
          n.createElement(
            c,
            {
              icon: ee ? n.createElement(ee) : void 0,
              onClick: () => {
                Qe(), m();
              }
            },
            "刷新"
          )
        )
      )
    ),
    q ? n.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      n.createElement(o, { size: "large" })
    ) : v.length === 0 ? n.createElement(d, {
      description: "当前智能体未加载任何技能"
    }) : n.createElement(
      u,
      { gutter: [12, 12] },
      ...v.map(
        (_) => n.createElement(
          z,
          { key: _.name, xs: 24, sm: 12, md: 8, lg: 6 },
          n.createElement(
            C,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: S ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: S && j.has(_.name) ? "#0072f5" : void 0,
                borderWidth: S && j.has(_.name) ? 2 : 1
              },
              onClick: () => {
                S ? te(_.name) : (h(_), b(!0));
              },
              onMouseEnter: () => {
                S || re(_.name);
              },
              onMouseLeave: () => re(null)
            },
            S ? n.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (F) => {
                  F.stopPropagation(), te(_.name);
                }
              },
              n.createElement(w, {
                checked: j.has(_.name)
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
              _.emoji ? n.createElement(
                "span",
                { style: { fontSize: 18 } },
                _.emoji
              ) : n.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              n.createElement(
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
                _.name
              ),
              _.enabled === !1 ? n.createElement(
                P,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : n.createElement(
                P,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            _.description ? n.createElement(
              E,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              _.description
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
              _.version_text ? n.createElement(
                P,
                { style: { fontSize: 10 } },
                `v${_.version_text}`
              ) : null,
              ...(_.tags || []).slice(0, 3).map(
                (F, ce) => n.createElement(
                  P,
                  { key: ce, color: "blue", style: { fontSize: 10 } },
                  F
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !S && X === _.name ? n.createElement(
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
              n.createElement(
                c,
                {
                  size: "small",
                  type: "default",
                  icon: _.enabled === !1 ? x ? n.createElement(x) : void 0 : k ? n.createElement(k) : void 0,
                  disabled: y,
                  onClick: (F) => {
                    F.stopPropagation(), Y(_);
                  }
                },
                _.enabled === !1 ? "启用" : "禁用"
              ),
              n.createElement(
                c,
                {
                  size: "small",
                  danger: !0,
                  icon: V ? n.createElement(V) : void 0,
                  disabled: y,
                  onClick: (F) => {
                    F.stopPropagation(), W(_);
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
    g ? n.createElement(
      $,
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
        open: ae,
        onClose: () => b(!1),
        width: 520,
        extra: n.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: N ? n.createElement(N) : void 0,
            onClick: () => a("/skills")
          },
          "管理技能"
        )
      },
      n.createElement(
        J,
        { column: 1, bordered: !0, size: "small" },
        n.createElement(
          J.Item,
          { label: "技能名称" },
          g.name
        ),
        n.createElement(
          J.Item,
          { label: "描述" },
          g.description || "-"
        ),
        g.version_text ? n.createElement(
          J.Item,
          { label: "版本" },
          g.version_text
        ) : null,
        n.createElement(
          J.Item,
          { label: "来源" },
          g.source || "-"
        ),
        n.createElement(
          J.Item,
          { label: "状态" },
          g.enabled === !1 ? "已禁用" : "已启用"
        ),
        g.installed_from ? n.createElement(
          J.Item,
          { label: "安装来源" },
          g.installed_from
        ) : null
      ),
      // Tags
      g.tags && g.tags.length > 0 ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          A,
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
            (_, F) => n.createElement(P, { key: F, color: "blue" }, _)
          )
        )
      ) : null,
      // Skill content preview
      g.content ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          A,
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
function Dl({
  poolSkills: e,
  workspaceSkills: t,
  agents: a,
  loading: n,
  onReload: l,
  agentId: s,
  agentName: r
}) {
  const o = T().React, { useState: d, useMemo: c, useCallback: u } = o, {
    Spin: z,
    Empty: C,
    Input: P,
    Button: w,
    Row: p,
    Col: M,
    Card: $,
    Tag: J,
    Typography: L,
    Drawer: ee,
    Descriptions: B,
    List: N,
    Modal: O,
    message: x
  } = T().antd, {
    ReloadOutlined: k,
    SearchOutlined: V,
    DownloadOutlined: D,
    ThunderboltOutlined: A,
    DeleteOutlined: E,
    PlusOutlined: v
  } = T().antdIcons || {}, { Text: f, Paragraph: q } = L, [G, ae] = d(""), [b, g] = d(!1), [h, S] = d(null), [oe, j] = d([]), [Q, ie] = d(!1), [U, X] = d(24), [re, y] = d(null), [ne, m] = d(!1), te = c(() => {
    if (!G.trim()) return e;
    const W = G.toLowerCase();
    return e.filter(
      (_) => {
        var F, ce;
        return _.name.toLowerCase().includes(W) || ((F = _.description) == null ? void 0 : F.toLowerCase().includes(W)) || ((ce = _.tags) == null ? void 0 : ce.some((H) => H.toLowerCase().includes(W)));
      }
    );
  }, [e, G]), I = c(
    () => te.slice(0, U),
    [te, U]
  ), se = u((W) => {
    ae(W), X(24);
  }, []), de = u(
    (W) => {
      const _ = [];
      for (const F of t)
        if (F.skills.some((ce) => ce.name === W)) {
          const ce = a.find((H) => H.id === F.agent_id);
          _.push((ce == null ? void 0 : ce.name) || F.agent_name || F.agent_id);
        }
      return _;
    },
    [t, a]
  ), ye = u(
    async (W) => {
      if (S(W), j(de(W.name)), g(!0), !W.content) {
        ie(!0);
        try {
          const _ = await Sa(W.name);
          S({ ...W, content: _ });
        } catch {
        } finally {
          ie(!1);
        }
      }
    },
    [de]
  ), fe = async (W) => {
    m(!0);
    try {
      await Nt(s, W.name), x.success(
        `已将技能「${W.name}」加载到当前专家「${r}」`
      ), l();
    } catch (_) {
      x.error(_.message || "加载技能失败");
    } finally {
      m(!1);
    }
  }, ue = (W) => {
    if (W.protected) {
      x.warning("内置技能不可删除");
      return;
    }
    O.confirm({
      title: `确认从技能池删除「${W.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        m(!0);
        try {
          await Va(W.name), x.success(`已从技能池删除「${W.name}」`), l();
        } catch (_) {
          x.error(_.message || "删除失败");
        } finally {
          m(!1);
        }
      }
    });
  }, Y = (W) => {
    window.history.pushState({}, "", W), window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return o.createElement(
    "div",
    null,
    o.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16
        }
      },
      o.createElement(P, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: V ? o.createElement(V) : void 0,
        value: G,
        onChange: (W) => se(W.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      o.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        o.createElement(
          w,
          {
            icon: k ? o.createElement(k) : void 0,
            onClick: l,
            loading: n,
            size: "small"
          },
          "刷新"
        ),
        o.createElement(
          w,
          {
            type: "primary",
            icon: D ? o.createElement(D) : void 0,
            onClick: () => Y("/skill-pool"),
            size: "small",
            style: Pe
          },
          "管理技能池"
        )
      )
    ),
    n ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      o.createElement(z, { size: "large" })
    ) : te.length === 0 ? o.createElement(C, {
      description: G ? "未找到匹配的技能" : "技能池为空"
    }) : o.createElement(
      o.Fragment,
      null,
      o.createElement(
        p,
        { gutter: [12, 12] },
        ...I.map(
          (W) => o.createElement(
            M,
            { key: W.name, xs: 24, sm: 12, md: 8, lg: 6 },
            o.createElement(
              $,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => ye(W),
                onMouseEnter: () => y(W.name),
                onMouseLeave: () => y(null)
              },
              o.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8
                  }
                },
                W.emoji ? o.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  W.emoji
                ) : o.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "⚡"
                ),
                o.createElement(
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
                W.protected ? o.createElement(
                  J,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              W.description ? o.createElement(
                q,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                W.description
              ) : null,
              o.createElement(
                "div",
                {
                  style: {
                    marginTop: 8,
                    display: "flex",
                    gap: 4,
                    flexWrap: "wrap"
                  }
                },
                W.version_text ? o.createElement(
                  J,
                  { style: { fontSize: 10 } },
                  `v${W.version_text}`
                ) : null,
                ...(W.tags || []).slice(0, 3).map(
                  (_, F) => o.createElement(
                    J,
                    { key: F, color: "cyan", style: { fontSize: 10 } },
                    _
                  )
                )
              ),
              // Hover action footer
              re === W.name ? o.createElement(
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
                o.createElement(
                  w,
                  {
                    size: "small",
                    type: "primary",
                    icon: v ? o.createElement(v) : void 0,
                    disabled: ne,
                    onClick: (_) => {
                      _.stopPropagation(), fe(W);
                    }
                  },
                  "加载到当前Agent"
                ),
                o.createElement(
                  w,
                  {
                    size: "small",
                    danger: !0,
                    icon: E ? o.createElement(E) : void 0,
                    disabled: ne || W.protected,
                    onClick: (_) => {
                      _.stopPropagation(), ue(W);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Load more button
        I.length < te.length ? o.createElement(
          "div",
          { style: { textAlign: "center", marginTop: 16 } },
          o.createElement(
            w,
            {
              onClick: () => X((W) => W + 24),
              size: "small"
            },
            `加载更多 (剩余 ${te.length - I.length} 个)`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    h ? o.createElement(
      ee,
      {
        title: o.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          o.createElement(
            "span",
            { style: { fontSize: 18 } },
            h.emoji || "⚡"
          ),
          o.createElement("span", null, h.name)
        ),
        open: b,
        onClose: () => g(!1),
        width: 520,
        extra: o.createElement(
          w,
          {
            type: "primary",
            size: "small",
            icon: A ? o.createElement(A) : void 0,
            onClick: () => Y("/skills")
          },
          "管理技能"
        )
      },
      o.createElement(
        B,
        { column: 1, bordered: !0, size: "small" },
        o.createElement(
          B.Item,
          { label: "技能名称" },
          h.name
        ),
        o.createElement(
          B.Item,
          { label: "描述" },
          h.description || "-"
        ),
        h.version_text ? o.createElement(
          B.Item,
          { label: "版本" },
          h.version_text
        ) : null,
        o.createElement(
          B.Item,
          { label: "来源" },
          h.source || "-"
        ),
        o.createElement(
          B.Item,
          { label: "受保护" },
          h.protected ? "是（内置）" : "否"
        ),
        h.sync_status ? o.createElement(
          B.Item,
          { label: "同步状态" },
          h.sync_status
        ) : null,
        h.installed_from ? o.createElement(
          B.Item,
          { label: "安装来源" },
          h.installed_from
        ) : null
      ),
      // Tags
      h.tags && h.tags.length > 0 ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          f,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        o.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...h.tags.map(
            (W, _) => o.createElement(J, { key: _, color: "cyan" }, W)
          )
        )
      ) : null,
      // Installed agents
      o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          f,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${oe.length})`
        ),
        oe.length > 0 ? o.createElement(N, {
          size: "small",
          dataSource: oe,
          renderItem: (W) => o.createElement(
            N.Item,
            null,
            o.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              o.createElement($e, { name: W, size: 20 }),
              o.createElement(
                f,
                { style: { fontSize: 13 } },
                W
              )
            )
          )
        }) : o.createElement(
          f,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      Q ? o.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        o.createElement(z, { size: "small" })
      ) : h.content ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          f,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "技能内容"
        ),
        o.createElement(
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
function Fl() {
  const e = T().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, { Tabs: s, message: r } = T().antd, { ThunderboltOutlined: o, AppstoreOutlined: d } = T().antdIcons || {}, u = T().useSelectedAgent, z = u ? u() : null, C = (z == null ? void 0 : z.id) || "default", [P, w] = t([]), [p, M] = t([]), [$, J] = t([]), [L, ee] = t(!0), [B, N] = t("agent-skills"), O = n(async () => {
    ee(!0);
    try {
      const [D, A, E] = await Promise.all([
        Bt(!0),
        Lt(),
        wa()
      ]);
      M(D), w(A), J(E);
    } catch (D) {
      r.error(D.message || "加载技能列表失败"), M([]);
    } finally {
      ee(!1);
    }
  }, []);
  a(() => {
    O();
  }, [O]);
  const x = l(() => {
    const D = P.find((A) => A.id === C);
    return (D == null ? void 0 : D.name) || C;
  }, [P, C]), k = (D) => {
    window.history.pushState({}, "", D), window.dispatchEvent(new PopStateEvent("popstate"));
  }, V = [
    {
      key: "agent-skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        o ? e.createElement(o, { style: { fontSize: 14 } }) : null,
        "当前Agent加载技能"
      ),
      children: e.createElement(Nl, {
        agentId: C,
        agentName: x,
        onNavigate: k
      })
    },
    {
      key: "skill-pool",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        d ? e.createElement(d, { style: { fontSize: 14 } }) : null,
        "技能池"
      ),
      children: e.createElement(Dl, {
        poolSkills: p,
        workspaceSkills: $,
        agents: P,
        loading: L,
        onReload: O,
        agentId: C,
        agentName: x
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(vt, {
      title: "技能",
      subtitle: `技能池共 ${p.length} 个技能 · 当前智能体：${x}`
    }),
    e.createElement(s, {
      items: V,
      activeKey: B,
      onChange: (D) => N(D)
    })
  );
}
const Mt = "ugsci.market.githubSources", Cn = "https://github.com/anthropics/skills/tree/main/skills", Gl = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", xn = `${Gl}/skills`;
function qe(e) {
  const t = e.replace(/^\/+/, "");
  return Ye(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
function St(e) {
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
function Hl(e) {
  var l, s;
  const t = {};
  if (e.env && e.env.length > 0)
    for (const r of e.env)
      t[r] = `your-${r.toLowerCase().replace(/_/g, "-")}`;
  let a = "🔌";
  const n = (e.icon || "").toLowerCase();
  return n.includes("folder") ? a = "📁" : n.includes("git") ? a = "🌿" : n.includes("github") ? a = "🐙" : n.includes("database") || n.includes("postgres") || n.includes("sqlite") ? a = "🗄️" : n.includes("search") || n.includes("brave") ? a = "🔍" : n.includes("browser") || n.includes("puppeteer") ? a = "🎭" : n.includes("memory") || n.includes("brain") ? a = "🧠" : n.includes("file") || n.includes("fetch") ? a = "🌐" : n.includes("slack") ? a = "💬" : n.includes("google") ? a = "📁" : n.includes("notion") ? a = "📝" : n.includes("jupyter") ? a = "📊" : n.includes("science") || n.includes("flask") ? a = "🔬" : n.includes("book") || n.includes("arxiv") ? a = "📚" : n.includes("patent") && (a = "📜"), {
    id: e.id,
    name: e.name,
    emoji: a,
    iconUrl: e.icon_url ? qe(e.icon_url) : void 0,
    category: e.category ? St(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((l = e.config) == null ? void 0 : l.command) || "",
    args: ((s = e.config) == null ? void 0 : s.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const ea = "ugsci.market.mcpSources", ta = "ugsci.market.expertSources";
function na(e, t) {
  try {
    const a = localStorage.getItem(e);
    if (!a) return [];
    const n = JSON.parse(a);
    return Array.isArray(n) ? n.filter(
      (l) => l && typeof l.id == "string" && typeof l.label == "string" && typeof l.url == "string"
    ).map((l) => ({
      id: l.id,
      label: l.label,
      url: l.url,
      enabled: l.enabled !== !1,
      type: t
    })) : [];
  } catch {
    return [];
  }
}
function aa(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function Wl() {
  return na(ea, "mcp");
}
function dt(e) {
  aa(ea, e);
}
function Jl() {
  return na(ta, "expert");
}
function ut(e) {
  aa(ta, e);
}
function la(e) {
  try {
    const t = new URL(e.trim()), a = t.hostname.toLowerCase();
    let n;
    if (a === "github.com" || a === "www.github.com")
      n = "github";
    else if (a === "gitee.com" || a === "www.gitee.com")
      n = "gitee";
    else
      return null;
    const l = t.pathname.split("/").filter((c) => c.length > 0);
    if (l.length < 2) return null;
    const s = decodeURIComponent(l[0]), r = decodeURIComponent(l[1]);
    let o = "main", d = "";
    return l.length >= 4 && (l[2] === "tree" || l[2] === "blob") ? (o = decodeURIComponent(l[3]), l.length > 4 && (d = l.slice(4).map(decodeURIComponent).join("/"))) : l.length > 2 && (d = l.slice(2).map(decodeURIComponent).join("/")), d = d.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: s,
      repo: r,
      ref: o || "main",
      skillsPath: d,
      label: `${s}/${r}`,
      platform: n
    };
  } catch {
    return null;
  }
}
function $t(e, t, a, n = "github") {
  return n === "oss" ? `oss:${e}/${a || "/"}` : `${n}:${e}/${t}:${a || "/"}`;
}
function sa(e) {
  try {
    const t = new URL(e.trim()), a = t.hostname.toLowerCase(), n = a.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!n) return null;
    const l = n[1], s = `${t.protocol}//${a}`, r = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
    return r ? {
      endpoint: s,
      prefix: r,
      label: "UGSci",
      platform: "oss"
    } : null;
  } catch {
    return null;
  }
}
function Xl() {
  try {
    const e = localStorage.getItem(Mt);
    if (!e) {
      const a = [], n = sa(xn);
      n && a.push({
        id: $t(
          n.endpoint,
          "",
          n.prefix,
          "oss"
        ),
        url: xn,
        label: n.label,
        owner: n.endpoint,
        repo: "",
        ref: "",
        skillsPath: n.prefix,
        enabled: !0,
        platform: "oss"
      });
      const l = la(Cn);
      return l && a.push({
        id: $t(
          l.owner,
          l.repo,
          l.skillsPath,
          l.platform
        ),
        url: Cn,
        label: l.label,
        owner: l.owner,
        repo: l.repo,
        ref: l.ref,
        skillsPath: l.skillsPath,
        enabled: !0,
        platform: l.platform
      }), localStorage.setItem(Mt, JSON.stringify(a)), a;
    }
    const t = JSON.parse(e);
    return Array.isArray(t) ? t.filter(
      (a) => a && typeof a.id == "string" && (typeof a.owner == "string" || a.platform === "oss")
    ).map((a) => ({
      ...a,
      platform: a.platform || "github",
      owner: a.owner || "",
      repo: a.repo || "",
      ref: a.ref || "",
      skillsPath: a.skillsPath || ""
    })) : [];
  } catch {
    return [];
  }
}
function pt(e) {
  try {
    localStorage.setItem(
      Mt,
      JSON.stringify(e)
    );
  } catch {
  }
}
function Kl(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const a = t[1], n = {}, l = a.split(`
`);
  let s = "";
  for (const r of l) {
    const o = r.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (o) {
      s = o[1];
      let d = o[2].trim();
      (d.startsWith('"') && d.endsWith('"') || d.startsWith("'") && d.endsWith("'")) && (d = d.slice(1, -1)), s === "name" ? n.name = d : s === "description" ? n.description = d : s === "version" ? n.version = d : s === "author" && (n.author = d);
    }
  }
  return n;
}
async function Vl(e) {
  const t = e.platform === "gitee", a = e.skillsPath ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/") : "", n = t ? `https://gitee.com/api/v5/repos/${e.owner}/${e.repo}/contents/${a}?ref=${encodeURIComponent(e.ref)}` : `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${a}?ref=${encodeURIComponent(e.ref)}`, l = {
    Accept: t ? "application/json" : "application/vnd.github+json"
  };
  t && e.accessToken && (l.Authorization = `token ${e.accessToken}`);
  const s = await fetch(n, {
    headers: l
  });
  if (!s.ok)
    throw new Error(
      `${t ? "Gitee" : "GitHub"} API ${s.status}: ${e.label} (${e.skillsPath || "/"})`
    );
  const r = await s.json();
  if (!Array.isArray(r)) return [];
  const o = r.filter(
    (c) => c.type === "dir" && c.name
  );
  return await Promise.all(
    o.map(async (c) => {
      const u = e.skillsPath ? e.skillsPath + "/" : "", z = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${u}${c.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${u}${c.name}/SKILL.md`, C = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${c.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${c.name}`, P = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: c.name,
        description: "",
        source_url: C,
        html_url: C,
        version: null,
        author: null
      };
      try {
        const w = {};
        t && e.accessToken && (w.Authorization = `token ${e.accessToken}`);
        const p = await fetch(z, {
          headers: w
        });
        if (!p.ok) return P;
        const M = await p.text(), $ = Kl(M);
        return {
          ...P,
          name: $.name || c.name,
          description: $.description || "",
          version: $.version || null,
          author: $.author || null
        };
      } catch {
        return P;
      }
    })
  );
}
async function ql(e) {
  const t = sa(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: a, prefix: n } = t, l = n.split("/").map(encodeURIComponent).join("/"), s = qe(`${l}/manifest.json`), r = await fetch(s);
  if (!r.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${r.status})`
    );
  const o = await r.json(), d = [];
  function c(u, z) {
    for (const C of u) {
      if (C.type === "collection" && Array.isArray(C.children)) {
        c(C.children, C.name);
        continue;
      }
      const P = C.path || C.name || "";
      if (!P) continue;
      const w = P.split("/").map(encodeURIComponent).join("/"), p = `${a}/${l}/${w}`;
      let M = null;
      if (C.metadata) {
        const J = C.metadata.match(/version:\s*"?([\d.]+)"?/);
        J && (M = J[1]);
      }
      const $ = z ? `${e.label}/${z}` : e.label;
      d.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: $,
        name: C.name || P.split("/").pop() || P,
        description: C.description || "",
        source_url: p,
        html_url: p,
        version: M,
        author: null,
        tag: C.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(o) ? c(
    o.map(
      (u) => typeof u == "string" ? { name: u, path: u } : u
    )
  ) : o && Array.isArray(o.skills) && c(o.skills), d.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return d;
}
async function Yl() {
  const e = qe("mcp/manifest.json"), t = await fetch(e);
  if (!t.ok)
    throw new Error(`无法获取 MCP 列表: ${t.status}`);
  const a = await t.json(), n = [], l = {};
  if (a.tag_groups && typeof a.tag_groups == "object")
    for (const [r, o] of Object.entries(a.tag_groups))
      Array.isArray(o) && (l[r] = o, n.push({
        id: r,
        label: St(r),
        tags: o
      }));
  return { servers: (a.servers || []).map((r) => {
    let o = "";
    const d = r.tags || [];
    for (const [c, u] of Object.entries(l))
      if (u.some((z) => d.includes(z))) {
        o = c;
        break;
      }
    return {
      id: r.id || r.name,
      name: r.name || r.id,
      description: r.description || "",
      tags: d,
      transport: r.transport || "stdio",
      config: r.config,
      env: Array.isArray(r.env) ? r.env : void 0,
      source: r.source,
      icon: r.icon,
      icon_url: r.icon_url || r.icon_path || void 0,
      category: o
    };
  }), categories: n };
}
async function Ql() {
  const e = qe("agents/manifest.json"), t = await fetch(e);
  if (!t.ok)
    throw new Error(`无法获取 Agent 列表: ${t.status}`);
  const a = await t.json(), n = [], l = {};
  if (a.tag_groups && typeof a.tag_groups == "object")
    for (const [r, o] of Object.entries(a.tag_groups))
      Array.isArray(o) && (l[r] = o, n.push({
        id: r,
        label: St(r),
        tags: o
      }));
  return { agents: (a.agents || []).map((r) => {
    let o = "";
    const d = r.tags || [];
    for (const [c, u] of Object.entries(l))
      if (u.some((z) => d.includes(z))) {
        o = c;
        break;
      }
    return {
      id: r.id || r.name,
      name: r.name || r.id,
      description: r.description || "",
      path: r.path || "",
      tags: d,
      config: r.config,
      instructions: r.instructions,
      skills_manifest: r.skills_manifest,
      drivers: r.drivers,
      category: o
    };
  }), categories: n };
}
async function Zl(e) {
  const t = e.filter((s) => s.enabled), a = await Promise.all(
    t.map(async (s) => {
      try {
        return { skills: s.platform === "oss" ? await ql(s) : await Vl(s), error: null, label: s.label };
      } catch (r) {
        return {
          skills: [],
          error: r.message || String(r),
          label: s.label
        };
      }
    })
  ), n = [], l = [];
  for (const s of a)
    n.push(...s.skills), s.error && l.push({ label: s.label, message: s.error });
  return { skills: n, errors: l };
}
function es({
  open: e,
  onClose: t,
  sources: a,
  onChange: n
}) {
  const l = T().React, { useState: s } = l, {
    Modal: r,
    Input: o,
    Button: d,
    List: c,
    Tag: u,
    Switch: z,
    Typography: C,
    Tooltip: P,
    message: w
  } = T().antd, {
    PlusOutlined: p,
    DeleteOutlined: M,
    LinkOutlined: $,
    GithubOutlined: J
  } = T().antdIcons || {}, { Text: L } = C, [ee, B] = s(""), [N, O] = s(""), x = () => {
    const A = ee.trim();
    if (!A) return;
    const E = la(A);
    if (!E) {
      w.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const v = $t(E.owner, E.repo, E.skillsPath, E.platform);
    if (a.some((G) => G.id === v)) {
      w.warning("该源已存在");
      return;
    }
    const f = {
      id: v,
      url: A,
      label: E.label,
      owner: E.owner,
      repo: E.repo,
      ref: E.ref,
      skillsPath: E.skillsPath,
      enabled: !0,
      platform: E.platform,
      accessToken: N.trim() || void 0
    }, q = [...a, f];
    pt(q), n(q), B(""), O(""), w.success(`已添加源: ${E.label}`);
  }, k = (A, E) => {
    const v = a.map(
      (f) => f.id === A ? { ...f, enabled: E } : f
    );
    pt(v), n(v);
  }, V = (A, E) => {
    const v = a.map(
      (f) => f.id === A ? { ...f, accessToken: E.trim() || void 0 } : f
    );
    pt(v), n(v);
  }, D = (A) => {
    const E = a.filter((v) => v.id !== A);
    pt(E), n(E), w.success("已移除源");
  };
  return l.createElement(
    r,
    {
      open: e,
      onCancel: t,
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        J ? l.createElement(J, { style: { fontSize: 18 } }) : null,
        l.createElement("span", null, "配置技能源")
      ),
      footer: l.createElement(
        d,
        { onClick: t },
        "关闭"
      ),
      width: 640
    },
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        L,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        l.createElement(o, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: ee,
          onChange: (A) => B(A.target.value),
          onPressEnter: x,
          prefix: $ ? l.createElement($) : void 0,
          style: { flex: 1 }
        }),
        l.createElement(
          d,
          {
            type: "primary",
            icon: p ? l.createElement(p) : void 0,
            onClick: x
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      ee.trim() && ee.trim().toLowerCase().includes("gitee.com") ? l.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        l.createElement(
          L,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        l.createElement(o.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: N,
          onChange: (A) => O(A.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    l.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      l.createElement(L, { strong: !0 }, `已配置源 (${a.length})`)
    ),
    l.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: a,
      renderItem: (A) => l.createElement(
        c.Item,
        {
          actions: [
            l.createElement(
              P,
              { title: A.enabled ? "点击禁用" : "点击启用" },
              l.createElement(z, {
                size: "small",
                checked: A.enabled,
                onChange: (E) => k(A.id, E)
              })
            ),
            l.createElement(
              P,
              { title: "移除此源" },
              l.createElement(
                d,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: M ? l.createElement(M) : void 0,
                  onClick: () => D(A.id)
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
              u,
              { color: A.platform === "gitee" ? "orange" : A.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              A.platform === "gitee" ? "Gitee" : A.platform === "oss" ? "OSS" : "GitHub"
            ),
            l.createElement(
              u,
              { style: { fontSize: 11 } },
              A.label
            ),
            A.skillsPath ? l.createElement(
              L,
              { type: "secondary", style: { fontSize: 11 } },
              `/${A.skillsPath}`
            ) : null,
            A.platform !== "oss" ? l.createElement(
              L,
              { type: "secondary", style: { fontSize: 11 } },
              `@${A.ref}`
            ) : null
          ),
          l.createElement(
            L,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            A.url
          ),
          // Gitee token input for existing Gitee sources
          A.platform === "gitee" ? l.createElement(
            "div",
            { style: { marginTop: 6, display: "flex", gap: 6, alignItems: "center" } },
            l.createElement(
              L,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            l.createElement(o.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: A.accessToken || "",
              onChange: (E) => V(A.id, E.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function kn({
  open: e,
  onClose: t,
  sources: a,
  onChange: n,
  type: l
}) {
  const s = T().React, { useState: r } = s, {
    Modal: o,
    Input: d,
    Button: c,
    List: u,
    Tag: z,
    Switch: C,
    Typography: P,
    Tooltip: w,
    message: p
  } = T().antd, {
    PlusOutlined: M,
    DeleteOutlined: $,
    LinkOutlined: J,
    ApiOutlined: L,
    UserOutlined: ee,
    ImportOutlined: B,
    ExportOutlined: N,
    CopyOutlined: O
  } = T().antdIcons || {}, { Text: x } = P, [k, V] = r(""), [D, A] = r(""), [E, v] = r(""), [f, q] = r(!1), G = l === "mcp" ? "MCP" : "专家模板", ae = l === "mcp" ? L ? s.createElement(L, { style: { fontSize: 18 } }) : null : ee ? s.createElement(ee, { style: { fontSize: 18 } }) : null, b = () => {
    const j = k.trim(), Q = D.trim();
    if (!j) return;
    const ie = Q || j.slice(0, 40), U = `${l}:${j}`;
    if (a.some((y) => y.id === U)) {
      p.warning("该源已存在");
      return;
    }
    const X = {
      id: U,
      label: ie,
      url: j,
      enabled: !0,
      type: l
    }, re = [...a, X];
    l === "mcp" ? dt(re) : ut(re), n(re), V(""), A(""), p.success(`已添加${G}源: ${ie}`);
  }, g = (j, Q) => {
    const ie = a.map(
      (U) => U.id === j ? { ...U, enabled: Q } : U
    );
    l === "mcp" ? dt(ie) : ut(ie), n(ie);
  }, h = (j) => {
    const Q = a.filter((ie) => ie.id !== j);
    l === "mcp" ? dt(Q) : ut(Q), n(Q), p.success("已移除源");
  }, S = () => {
    const j = JSON.stringify(
      { type: l, sources: a },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(j), p.success(`${G}源已复制到剪贴板（${a.length} 个源）`);
    } catch {
      const Q = document.createElement("textarea");
      Q.value = j, document.body.appendChild(Q), Q.select(), document.execCommand("copy"), document.body.removeChild(Q), p.success(`${G}源已复制到剪贴板（${a.length} 个源）`);
    }
  }, oe = () => {
    const j = E.trim();
    if (!j) {
      p.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const Q = JSON.parse(j);
      let ie = [];
      if (Array.isArray(Q))
        ie = Q;
      else if (Q && Array.isArray(Q.sources))
        ie = Q.sources;
      else if (Q && typeof Q == "object")
        ie = [Q];
      else
        throw new Error("Invalid format");
      const U = ie.filter(
        (ne) => ne && typeof ne.url == "string" && typeof ne.label == "string"
      );
      if (U.length === 0) {
        p.error("未找到有效的源数据");
        return;
      }
      const X = new Set(a.map((ne) => ne.id)), re = [];
      for (const ne of U) {
        const m = ne.id || `${l}:${ne.url}`;
        X.has(m) || re.push({
          id: m,
          label: ne.label,
          url: ne.url,
          enabled: ne.enabled !== !1,
          type: l
        });
      }
      if (re.length === 0) {
        p.info("所有源均已存在，无新增");
        return;
      }
      const y = [...a, ...re];
      l === "mcp" ? dt(y) : ut(y), n(y), v(""), q(!1), p.success(`成功导入 ${re.length} 个${G}源`);
    } catch (Q) {
      p.error(`JSON 解析失败: ${Q.message || "格式错误"}`);
    }
  };
  return s.createElement(
    o,
    {
      open: e,
      onCancel: t,
      title: s.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        ae,
        s.createElement("span", null, `配置${G}源`)
      ),
      footer: s.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between" } },
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          s.createElement(
            c,
            {
              icon: N ? s.createElement(N) : void 0,
              onClick: S,
              disabled: a.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          s.createElement(
            c,
            {
              icon: B ? s.createElement(B) : void 0,
              onClick: () => q(!f),
              size: "small"
            },
            f ? "隐藏导入" : "导入JSON"
          )
        ),
        s.createElement(
          c,
          { onClick: t },
          "关闭"
        )
      ),
      width: 680
    },
    // Description
    s.createElement(
      x,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${G}源地址，支持从远程仓库或团队共享的 JSON 导入${G}配置。`
    ),
    // Import section (collapsible)
    f ? s.createElement(
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
      s.createElement(
        x,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${G}源 JSON（支持从导出的剪贴板内容粘贴）`
      ),
      s.createElement(d.TextArea, {
        placeholder: l === "mcp" ? `{
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
        onChange: (j) => v(j.target.value),
        autoSize: { minRows: 4, maxRows: 10 },
        style: { fontFamily: "monospace", fontSize: 12 }
      }),
      s.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8 } },
        s.createElement(
          c,
          {
            type: "primary",
            size: "small",
            onClick: oe
          },
          "导入"
        ),
        s.createElement(
          c,
          {
            size: "small",
            onClick: () => v("")
          },
          "清空"
        )
      )
    ) : null,
    // Add new source
    s.createElement(
      "div",
      { style: { marginBottom: 16, display: "flex", gap: 8, alignItems: "center" } },
      s.createElement(d, {
        placeholder: "源名称（可选，如：团队MCP仓库）",
        value: D,
        onChange: (j) => A(j.target.value),
        style: { width: 200 }
      }),
      s.createElement(d, {
        placeholder: l === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: k,
        onChange: (j) => V(j.target.value),
        onPressEnter: b,
        prefix: J ? s.createElement(J) : void 0,
        style: { flex: 1 }
      }),
      s.createElement(
        c,
        {
          type: "primary",
          icon: M ? s.createElement(M) : void 0,
          onClick: b
        },
        "添加"
      )
    ),
    // Source list
    s.createElement(
      "div",
      {
        style: {
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }
      },
      s.createElement(
        x,
        { strong: !0 },
        `已配置源 (${a.length})`
      )
    ),
    s.createElement(u, {
      size: "small",
      bordered: !0,
      dataSource: a,
      renderItem: (j) => s.createElement(
        u.Item,
        {
          actions: [
            s.createElement(
              w,
              { title: j.enabled ? "点击禁用" : "点击启用" },
              s.createElement(C, {
                size: "small",
                checked: j.enabled,
                onChange: (Q) => g(j.id, Q)
              })
            ),
            s.createElement(
              w,
              { title: "移除此源" },
              s.createElement(
                c,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: $ ? s.createElement($) : void 0,
                  onClick: () => h(j.id)
                }
              )
            )
          ]
        },
        s.createElement(
          "div",
          { style: { flex: 1, minWidth: 0 } },
          s.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4
              }
            },
            s.createElement(
              z,
              {
                color: l === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              j.label
            ),
            j.enabled ? null : s.createElement(
              z,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          s.createElement(
            x,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            j.url
          )
        )
      )
    }),
    // Share hint
    s.createElement(
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
      s.createElement(
        "span",
        null,
        "💡 ",
        "点击「导出到剪贴板」可复制所有源配置，分享给团队成员后粘贴到「导入JSON」即可快速配置。"
      )
    )
  );
}
async function ts() {
  return le("/market/providers");
}
async function ns(e) {
  return le(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function as(e, t, a, n, l) {
  return le("/market/search", {
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
function _n(e) {
  if (!e) return "";
  const t = e.message || String(e);
  try {
    const a = JSON.parse(t);
    if (a.detail) {
      if (typeof a.detail == "string") return a.detail;
      if (a.detail.message) return a.detail.message;
    }
  } catch {
  }
  return t;
}
async function Tn(e, t) {
  const a = { bundle_url: e };
  return t && (a.access_token = t), le("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(a)
  });
}
function ls() {
  const e = T().React, { useState: t, useEffect: a, useCallback: n, useMemo: l, useRef: s } = e, {
    Spin: r,
    Empty: o,
    Input: d,
    Button: c,
    message: u,
    Row: z,
    Col: C,
    Card: P,
    Tag: w,
    Tooltip: p,
    Typography: M,
    Select: $,
    Drawer: J,
    Descriptions: L,
    Tabs: ee,
    Badge: B,
    Progress: N,
    Modal: O
  } = T().antd, {
    ReloadOutlined: x,
    SearchOutlined: k,
    DownloadOutlined: V,
    AppstoreOutlined: D,
    ShopOutlined: A,
    CheckCircleOutlined: E,
    LoadingOutlined: v,
    UserOutlined: f,
    SettingOutlined: q,
    GithubOutlined: G,
    ApiOutlined: ae
  } = T().antdIcons || {}, { Text: b, Paragraph: g, Title: h } = M, [S, oe] = t("skills"), [j, Q] = t([]), [ie, U] = t([]), [X, re] = t([]), [y, ne] = t(""), [m, te] = t(""), [I, se] = t(!1), [de, ye] = t(!1), [fe, ue] = t(
    {}
  ), [Y, W] = t(null), [_, F] = t({}), [ce, H] = t([]), [pe, Ee] = t(""), [we, ke] = t(""), [Ie, Ue] = t(""), [ot, Ze] = t({}), [Oe, et] = t(""), [rt, Fe] = t(/* @__PURE__ */ new Set()), [_e, tt] = t(null), [ze, xe] = t({}), [Z, Ce] = t([]), [ve, Te] = t([]), [nt, at] = t(!1), [he, it] = t(!1), [wt, lt] = t([]), [Ne, Wt] = t(!1), [oa, Jt] = t([]), [ra, Xt] = t(!1), [Kt, Vt] = t([]), [qt, Yt] = t([]), [Qt, Zt] = t(!1), [Ge, en] = t(""), [tn, nn] = t([]), [an, ln] = t([]), [sn, on] = t(!1), [He, rn] = t(""), [Ct, cn] = t(!1), st = s(null);
  a(() => {
    Promise.all([
      ts().catch(() => []),
      ns("zh").catch(() => []),
      Lt().catch(() => [])
    ]).then(([i, R, K]) => {
      Q(i), U(R), H(K), K.length > 0 && (Ee(K[0].id), et(K[0].id));
    });
  }, []);
  const ct = n(async (i) => {
    const R = i ?? Xl();
    if (Ce(i || R), R.filter((me) => me.enabled).length === 0) {
      Te([]);
      return;
    }
    at(!0);
    try {
      const { skills: me, errors: ge } = await Zl(R);
      if (Te(me), ge.length > 0) {
        for (const Se of ge)
          console.warn(`[ugsci] GitHub source '${Se.label}' error: ${Se.message}`);
        u.warning(
          `部分源加载失败: ${ge.map((Se) => Se.label).join(", ")}`
        );
      }
    } catch (me) {
      u.error(me.message || "加载技能源失败"), Te([]);
    } finally {
      at(!1);
    }
  }, []), xt = n(async () => {
    var K, me;
    Zt(!0), on(!0);
    const [i, R] = await Promise.allSettled([
      Yl(),
      Ql()
    ]);
    i.status === "fulfilled" ? (Vt(i.value.servers), Yt(i.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((K = i.reason) == null ? void 0 : K.message) || i.reason}`), Vt([]), Yt([])), Zt(!1), R.status === "fulfilled" ? (nn(R.value.agents), ln(R.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((me = R.reason) == null ? void 0 : me.message) || R.reason}`), nn([]), ln([])), on(!1);
  }, []);
  a(() => {
    ct(), xt(), lt(Wl()), Jt(Jl());
  }, [ct, xt]);
  const mt = n(
    async (i, R, K) => {
      se(!0);
      try {
        const me = await as(
          i,
          K,
          20,
          "zh",
          R || void 0
        );
        K === void 0 || Object.keys(K).length === 0 ? re(me.results) : re((be) => [...be, ...me.results]);
        const ge = Object.values(me.by_provider || {}).some(
          (be) => be.has_more
        );
        ye(ge);
        const Se = {};
        for (const [be, Le] of Object.entries(me.by_provider || {}))
          Se[be] = (K[be] || 1) + 1;
        if (ue(Se), me.errors.length > 0)
          for (const be of me.errors)
            console.warn(
              `[ugsci] Market provider '${be.provider}' error: ${be.message}`
            );
      } catch (me) {
        u.error(me.message || "搜索市场失败"), re([]);
      } finally {
        se(!1);
      }
    },
    []
  );
  a(() => (st.current && clearTimeout(st.current), st.current = setTimeout(() => {
    mt(y, m, {});
  }, 400), () => {
    st.current && clearTimeout(st.current);
  }), [y, m, mt]);
  const ia = () => {
    mt(y, m, fe);
  }, mn = async (i) => {
    const R = `${i.source}:${i.slug}`;
    try {
      F((me) => ({ ...me, [R]: "installing" }));
      const K = await Tn(i.source_url);
      K.installed && u.success(
        `技能「${K.name || i.name}」已安装到技能池，可在技能中心查看`
      ), F((me) => {
        const ge = { ...me };
        return delete ge[R], ge;
      });
    } catch (K) {
      u.error(_n(K) || "安装技能失败"), F((me) => {
        const ge = { ...me };
        return delete ge[R], ge;
      });
    }
  }, ca = (i) => {
    window.history.pushState({}, "", i), window.dispatchEvent(new PopStateEvent("popstate"));
  }, ma = async (i) => {
    const R = `github:${i.sourceId}:${i.name}`, K = Z.find((ge) => ge.id === i.sourceId), me = (K == null ? void 0 : K.accessToken) || void 0;
    try {
      F((Se) => ({ ...Se, [R]: "installing" }));
      const ge = await Tn(i.source_url, me);
      ge.installed && u.success(
        `技能「${ge.name || i.name}」已安装到技能池，可在技能中心查看`
      ), F((Se) => {
        const be = { ...Se };
        return delete be[R], be;
      });
    } catch (ge) {
      u.error(_n(ge) || "安装技能失败"), F((Se) => {
        const be = { ...Se };
        return delete be[R], be;
      });
    }
  }, dn = l(() => {
    const i = [], R = /* @__PURE__ */ new Set();
    for (const K of ve)
      K.tag && !R.has(K.tag) && (R.add(K.tag), i.push({ id: K.tag, label: K.tag }));
    for (const K of ve)
      !K.isOfficial && K.sourceLabel && !R.has(K.sourceLabel) && (R.add(K.sourceLabel), i.push({ id: K.sourceLabel, label: K.sourceLabel }));
    return i;
  }, [ve]), kt = l(() => {
    let i = ve;
    if (m && (i = i.filter(
      (R) => R.tag === m || R.sourceLabel === m
    )), y.trim()) {
      const R = y.toLowerCase();
      i = i.filter(
        (K) => {
          var me;
          return K.name.toLowerCase().includes(R) || ((me = K.description) == null ? void 0 : me.toLowerCase().includes(R));
        }
      );
    }
    return i;
  }, [ve, y, m]), un = j.filter((i) => i.available), We = l(() => m ? X.filter((i) => {
    const R = un.find((K) => K.key === i.source);
    return (R == null ? void 0 : R.label) === m;
  }) : X, [X, m, un]), da = e.createElement(
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
      e.createElement(d, {
        placeholder: "搜索技能市场...",
        prefix: k ? e.createElement(k) : void 0,
        value: y,
        onChange: (i) => ne(i.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      // Pool install info
      e.createElement(
        b,
        { type: "secondary", style: { fontSize: 12 } },
        "安装后进入技能池"
      ),
      // Configure skill source button
      e.createElement(
        c,
        {
          icon: G ? e.createElement(G) : void 0,
          onClick: () => it(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    dn.length > 0 ? e.createElement(
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
        b,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        w,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: m === "" ? "blue" : void 0,
          onClick: () => te("")
        },
        "全部"
      ),
      ...dn.map((i) => {
        const R = ve.some(
          (K) => !K.isOfficial && K.sourceLabel === i.id
        );
        return e.createElement(
          w,
          {
            key: i.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: m === i.id ? R ? "blue" : "geekblue" : void 0,
            icon: R && G ? e.createElement(G) : void 0,
            onClick: () => te(
              m === i.id ? "" : i.id
            )
          },
          i.label
        );
      })
    ) : null,
    // GitHub skills section
    nt && ve.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      e.createElement(r, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : kt.length > 0 ? e.createElement(
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
          b,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${kt.length})`
        )
      ),
      e.createElement(
        z,
        { gutter: [12, 12] },
        ...kt.map((i) => {
          const R = `github:${i.sourceId}:${i.name}`, K = _[R];
          return e.createElement(
            C,
            { key: R, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              P,
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
                    b,
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
                    w,
                    { color: "geekblue", style: { fontSize: 10 } },
                    i.tag
                  ) : null,
                  i.version ? e.createElement(
                    w,
                    { style: { fontSize: 10 } },
                    `v${i.version}`
                  ) : null
                ),
                K ? e.createElement(
                  c,
                  {
                    size: "small",
                    disabled: !0,
                    icon: v ? e.createElement(v) : void 0
                  },
                  "安装中"
                ) : e.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: V ? e.createElement(V) : void 0,
                    onClick: () => ma(i)
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
    We.length > 0 || I ? e.createElement(
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
        b,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${We.length > 0 ? ` (${We.length})` : ""}`
      )
    ) : null,
    // Results grid
    I && We.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(r, { size: "large" })
    ) : We.length === 0 ? e.createElement(o, {
      description: y ? `未找到匹配「${y}」的技能` : "输入关键词搜索技能市场",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      z,
      { gutter: [12, 12] },
      ...We.map((i) => {
        const R = `${i.source}:${i.slug}`, K = _[R];
        return e.createElement(
          C,
          { key: R, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            P,
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
                  b,
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
                  w,
                  { color: "geekblue", style: { fontSize: 10 } },
                  i.source
                ),
                i.version ? e.createElement(
                  w,
                  { style: { fontSize: 10 } },
                  `v${i.version}`
                ) : null
              ),
              K ? e.createElement(
                c,
                {
                  size: "small",
                  disabled: !0,
                  icon: v ? e.createElement(v) : void 0
                },
                "安装中"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: V ? e.createElement(V) : void 0,
                  onClick: (me) => {
                    me.stopPropagation(), mn(i);
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
    de && !I ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        c,
        { onClick: ia, loading: I },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    Y ? e.createElement(
      J,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          Y.icon_url ? e.createElement("img", {
            src: Y.icon_url,
            alt: Y.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, Y.name)
        ),
        open: !0,
        onClose: () => W(null),
        width: 480,
        extra: e.createElement(
          c,
          {
            type: "primary",
            icon: V ? e.createElement(V) : void 0,
            onClick: () => {
              mn(Y);
            }
          },
          "安装到技能池"
        )
      },
      e.createElement(
        L,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          L.Item,
          { label: "来源" },
          Y.source
        ),
        e.createElement(
          L.Item,
          { label: "描述" },
          Y.description || "-"
        ),
        Y.version ? e.createElement(
          L.Item,
          { label: "版本" },
          Y.version
        ) : null,
        Y.author ? e.createElement(
          L.Item,
          { label: "作者" },
          Y.author
        ) : null,
        e.createElement(
          L.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: Y.source_url, target: "_blank" },
            Y.source_url
          )
        )
      ),
      Y.stats ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          b,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "统计"
        ),
        e.createElement(
          "div",
          { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
          ...Object.entries(Y.stats).map(
            ([i, R]) => e.createElement(
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
                String(R)
              ),
              e.createElement(
                b,
                { type: "secondary", style: { fontSize: 11 } },
                i
              )
            )
          )
        )
      ) : null
    ) : null
  ), _t = l(() => {
    let i = tn;
    if (He && (i = i.filter((R) => R.category === He)), we.trim()) {
      const R = we.toLowerCase();
      i = i.filter(
        (K) => K.name.toLowerCase().includes(R) || K.description.toLowerCase().includes(R) || K.tags.some((me) => me.toLowerCase().includes(R))
      );
    }
    return i;
  }, [tn, we, He]), ua = async (i) => {
    if (!Ct) {
      cn(!0);
      try {
        let R = i.description;
        if (i.instructions)
          try {
            const ge = i.instructions.replace(/^\/+/, ""), Se = await fetch(qe(ge));
            Se.ok && (R = await Se.text());
          } catch {
          }
        let K = [];
        if (i.skills_manifest)
          try {
            const ge = i.skills_manifest.replace(/^\/+/, ""), Se = await fetch(qe(ge));
            if (Se.ok) {
              const be = await Se.json();
              Array.isArray(be) ? K = be.map((Le) => typeof Le == "string" ? Le : Le.name).filter(Boolean) : be.skills && (K = be.skills.map((Le) => typeof Le == "string" ? Le : Le.name).filter(Boolean));
            }
          } catch {
          }
        const me = await le("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: i.name,
            description: i.description,
            skill_names: K
          })
        });
        await yt(me.id, "AGENTS.md", R), u.success(`专家「${i.name}」创建成功，已跳转至专家`), ca("/ugsci-experts");
      } catch (R) {
        u.error(R.message || "创建专家失败");
      } finally {
        cn(!1);
      }
    }
  }, pn = n(async (i) => {
    if (i)
      try {
        const R = await Ft(i);
        Fe(new Set(R.map((K) => K.key)));
      } catch {
        Fe(/* @__PURE__ */ new Set());
      }
  }, []);
  a(() => {
    Oe && pn(Oe);
  }, [Oe, pn]);
  const pa = async (i) => {
    if (!Oe) {
      u.warning("请先选择目标专家");
      return;
    }
    if (Ra(i)) {
      const R = Object.entries(i.env), K = {};
      for (const [me] of R)
        K[me] = "";
      xe(K), tt(i);
      return;
    }
    await gn(i, i.env || {});
  }, gn = async (i, R) => {
    Ze((K) => ({ ...K, [i.id]: !0 }));
    try {
      const K = i.id;
      await jn(Oe, {
        client_key: K,
        client: {
          name: i.name,
          description: i.description,
          enabled: !0,
          transport: i.transport,
          url: i.url || "",
          command: i.command || "",
          args: i.args || [],
          env: R,
          cwd: i.cwd || "",
          headers: i.headers || {}
        }
      }), u.success(`MCP「${i.name}」已添加到当前专家`), Fe((me) => new Set(me).add(K));
    } catch (K) {
      u.error(K.message || `添加 MCP「${i.name}」失败`);
    } finally {
      Ze((K) => ({ ...K, [i.id]: !1 }));
    }
  }, ga = async () => {
    if (!_e) return;
    const i = [];
    for (const [K, me] of Object.entries(ze))
      if (!me || !me.trim()) {
        const ge = fn[K];
        i.push((ge == null ? void 0 : ge.label) || K);
      }
    if (i.length > 0) {
      u.warning(`请填写以下配置项: ${i.join(", ")}`);
      return;
    }
    const R = _e;
    tt(null), xe({}), await gn(R, { ...ze });
  }, Tt = l(() => {
    let i = Kt;
    if (Ge && (i = i.filter((R) => R.category === Ge)), Ie.trim()) {
      const R = Ie.toLowerCase();
      i = i.filter(
        (K) => K.name.toLowerCase().includes(R) || K.description.toLowerCase().includes(R) || K.tags.some((me) => me.toLowerCase().includes(R))
      );
    }
    return i.map(Hl);
  }, [Kt, Ie, Ge]), fa = e.createElement(
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
      e.createElement(d, {
        placeholder: "搜索 MCP 服务器...",
        prefix: k ? e.createElement(k) : void 0,
        value: Ie,
        onChange: (i) => Ue(i.target.value),
        allowClear: !0,
        style: { maxWidth: 300 }
      }),
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        e.createElement(
          b,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "安装到："
        ),
        e.createElement($, {
          value: Oe,
          onChange: (i) => et(i),
          style: { minWidth: 180 },
          size: "small",
          options: ce.map((i) => ({ value: i.id, label: i.name }))
        })
      ),
      // Configure MCP source button
      e.createElement(
        c,
        {
          icon: ae ? e.createElement(ae) : void 0,
          onClick: () => Wt(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    qt.length > 0 ? e.createElement(
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
        b,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        w,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Ge === "" ? "blue" : void 0,
          onClick: () => en("")
        },
        "全部"
      ),
      ...qt.map(
        (i) => e.createElement(
          w,
          {
            key: i.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: Ge === i.id ? "geekblue" : void 0,
            onClick: () => en(
              Ge === i.id ? "" : i.id
            )
          },
          i.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    Qt && Tt.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(r, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : Tt.length === 0 ? e.createElement(o, {
      description: "未找到匹配的 MCP 服务器",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      z,
      { gutter: [12, 12] },
      ...Tt.map(
        (i) => e.createElement(
          C,
          { key: i.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            P,
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
                  onError: (R) => {
                    R.target.style.display = "none";
                  }
                }) : i.emoji
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  b,
                  { strong: !0, style: { fontSize: 14 } },
                  i.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  e.createElement(
                    w,
                    { color: "blue", style: { fontSize: 10 } },
                    i.category
                  ),
                  e.createElement(
                    w,
                    {
                      color: i.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    i.transport
                  ),
                  i.env && Object.keys(i.env).length > 0 ? e.createElement(
                    w,
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
                b,
                { type: "secondary", style: { fontSize: 11 } },
                i.transport === "stdio" ? `${i.command} ${(i.args || []).join(" ")}` : i.url || ""
              ),
              rt.has(i.id) ? e.createElement(
                c,
                { size: "small", disabled: !0 },
                "已安装"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  loading: !!ot[i.id],
                  icon: ae ? e.createElement(ae) : void 0,
                  onClick: () => pa(i)
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
        b,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ), ya = _e ? e.createElement(
    O,
    {
      title: e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        e.createElement("span", { style: { fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 } }, _e.iconUrl ? e.createElement("img", { src: _e.iconUrl, alt: _e.name, style: { width: 22, height: 22, objectFit: "contain" }, onError: (i) => {
          i.target.style.display = "none";
        } }) : _e.emoji),
        e.createElement("span", null, `配置 ${_e.name} 密钥`)
      ),
      open: !!_e,
      onCancel: () => {
        tt(null), xe({});
      },
      onOk: ga,
      okText: "安装",
      cancelText: "取消",
      width: 520,
      destroyOnClose: !0
    },
    // Description
    e.createElement(
      b,
      { type: "secondary", style: { display: "block", marginBottom: 16, fontSize: 12 } },
      _e.description
    ),
    ...Object.entries(_e.env || {}).map(([i]) => {
      const R = fn[i], K = (R == null ? void 0 : R.isSecret) !== !1;
      return e.createElement(
        "div",
        { key: i, style: { marginBottom: 16 } },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          e.createElement(
            b,
            { strong: !0, style: { fontSize: 13 } },
            (R == null ? void 0 : R.label) || i
          ),
          e.createElement(
            w,
            { color: "orange", style: { fontSize: 10 } },
            "必填"
          )
        ),
        // Help text with optional link
        R ? e.createElement(
          "div",
          { style: { marginBottom: 6, fontSize: 12, color: "#8c8c8c" } },
          R.help,
          R.link ? e.createElement(
            "a",
            {
              href: R.link,
              target: "_blank",
              rel: "noopener noreferrer",
              style: { marginLeft: 4, fontSize: 12 }
            },
            "获取方式 ↗"
          ) : null
        ) : null,
        // Input field
        K ? e.createElement(d.Password, {
          placeholder: `请输入 ${(R == null ? void 0 : R.label) || i}`,
          value: ze[i] || "",
          onChange: (me) => xe((ge) => ({
            ...ge,
            [i]: me.target.value
          })),
          style: { width: "100%" }
        }) : e.createElement(d, {
          placeholder: `请输入 ${(R == null ? void 0 : R.label) || i}`,
          value: ze[i] || "",
          onChange: (me) => xe((ge) => ({
            ...ge,
            [i]: me.target.value
          })),
          style: { width: "100%" }
        }),
        // Show env key name for reference
        e.createElement(
          b,
          { type: "secondary", style: { fontSize: 11, display: "block", marginTop: 2 } },
          `环境变量名: ${i}`
        )
      );
    })
  ) : null, Ea = e.createElement(
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
      e.createElement(d, {
        placeholder: "搜索专家模板...",
        prefix: k ? e.createElement(k) : void 0,
        value: we,
        onChange: (i) => ke(i.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      e.createElement(
        c,
        {
          icon: f ? e.createElement(f) : void 0,
          onClick: () => Xt(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    an.length > 0 ? e.createElement(
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
        b,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        w,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: He === "" ? "blue" : void 0,
          onClick: () => rn("")
        },
        "全部"
      ),
      ...an.map(
        (i) => e.createElement(
          w,
          {
            key: i.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: He === i.id ? "geekblue" : void 0,
            onClick: () => rn(
              He === i.id ? "" : i.id
            )
          },
          i.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    sn && _t.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(r, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载专家模板..."))
    ) : _t.length === 0 ? e.createElement(o, {
      description: "未找到匹配的专家模板",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      z,
      { gutter: [12, 12] },
      ..._t.map(
        (i) => e.createElement(
          C,
          { key: i.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            P,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => ua(i)
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
              e.createElement($e, {
                name: i.name,
                size: 40
              }),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  b,
                  { strong: !0, style: { fontSize: 14 } },
                  i.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  i.category ? e.createElement(
                    w,
                    { color: "blue", style: { fontSize: 10 } },
                    St(i.category)
                  ) : null,
                  i.tags.includes("mcp") ? e.createElement(
                    w,
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
                b,
                { type: "secondary", style: { fontSize: 11 } },
                i.tags.filter((R) => R !== "agent" && R !== "template" && R !== "workspace").slice(0, 3).join(" · ") || "专家模板"
              ),
              e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  loading: Ct,
                  disabled: Ct,
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
        b,
        { type: "secondary", style: { fontSize: 12 } },
        "专家模板来自 UGSci 官方源，自动同步更新"
      )
    )
  ), ha = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        D ? e.createElement(D, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: da
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        ae ? e.createElement(ae, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: fa
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        f ? e.createElement(f, { style: { fontSize: 14 } }) : null,
        "专家模板"
      ),
      children: Ea
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(vt, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 创建专家模板 · 随时更新能力和专家",
      extra: e.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        e.createElement(
          c,
          {
            type: "primary",
            icon: x ? e.createElement(x) : void 0,
            onClick: () => {
              mt(y, m, {}), ct(), xt();
            },
            loading: I || nt || Qt || sn
          },
          "刷新"
        )
      )
    }),
    e.createElement(ee, {
      items: ha,
      activeKey: S,
      onChange: (i) => oe(i)
    }),
    // Skill source config modal
    e.createElement(es, {
      open: he,
      onClose: () => it(!1),
      sources: Z,
      onChange: (i) => {
        Ce(i), ct(i);
      }
    }),
    // MCP source config modal
    e.createElement(kn, {
      open: Ne,
      onClose: () => Wt(!1),
      sources: wt,
      onChange: (i) => lt(i),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    ya,
    // Expert source config modal
    e.createElement(kn, {
      open: ra,
      onClose: () => Xt(!1),
      sources: oa,
      onChange: (i) => Jt(i),
      type: "expert"
    })
  );
}
function ss() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const zn = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, In = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function os() {
  const e = T(), t = e.React, { useEffect: a, useRef: n } = t, l = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, s = (l == null ? void 0 : l.id) || "default", r = n(null), o = n(null);
  return a(() => {
    if (r.current === s) return;
    r.current = s;
    const d = ss(), c = zn[d] || zn.en, u = In[d] || In.en;
    let z = !1;
    return (async () => {
      var C, P;
      try {
        const w = await ht(s);
        if (z) return;
        const p = $n(w);
        if (o.current) {
          try {
            o.current();
          } catch {
          }
          o.current = null;
        }
        const M = window.QwenPaw;
        (C = M == null ? void 0 : M.chat) != null && C.welcome && (p.length > 0 ? (o.current = M.chat.welcome.set("ugsci", {
          description: c,
          prompts: p
        }), console.info(
          `[ugsci] Injected ${p.length} welcome prompts for agent "${s}"`
        )) : (o.current = M.chat.welcome.set("ugsci", {
          description: c,
          prompts: [u]
        }), console.info(
          `[ugsci] No skills for agent "${s}" — using default prompt`
        )));
      } catch (w) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${s}":`,
          w
        );
        const p = window.QwenPaw;
        if ((P = p == null ? void 0 : p.chat) != null && P.welcome && !z) {
          if (o.current) {
            try {
              o.current();
            } catch {
            }
            o.current = null;
          }
          o.current = p.chat.welcome.set("ugsci", {
            description: c,
            prompts: [u]
          });
        }
      }
    })(), () => {
      z = !0;
    };
  }, [s]), null;
}
function rs() {
  var c, u, z;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = T().React, a = "ugsci";
  (u = (c = e.chat) == null ? void 0 : c.rightHeader) != null && u.add ? (e.chat.rightHeader.add(a, t.createElement(os), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const n = T().antdIcons || {}, l = n.UserSwitchOutlined, s = n.ToolOutlined, r = n.ThunderboltOutlined, o = n.ShopOutlined;
  e.route.add(a, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: hl
  }), e.menu.add(a, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家",
    icon: l ? t.createElement(l, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => Je()
  }), e.route.add(a, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: Ul
  }), e.menu.add(a, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "工具",
    icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.capabilities",
    order: 6,
    visible: () => Je()
  }), e.route.add(a, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: Fl
  }), e.menu.add(a, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能",
    icon: r ? t.createElement(r, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.skills-center",
    order: 7,
    visible: () => Je()
  }), e.route.add(a, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: ls
  }), e.menu.add(a, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 8,
    visible: () => Je()
  }), (z = e.sidebar) != null && z.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
    "ugsci.experts",
    "ugsci.capabilities",
    "ugsci.skills-center",
    "ugsci.market"
  ]), console.info("[ugsci] Registered 4 items for simple-mode visibility")) : console.warn(
    "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode"
  );
  const d = [
    "core.skills",
    "core.tools",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool"
  ];
  for (const C of d) {
    try {
      const w = e.menu.snapshot("primary.agentScoped").find((p) => p.id === C);
      w && e.menu.replace(a, C, {
        ...w,
        visible: () => !Je()
      });
    } catch {
    }
    try {
      const w = e.menu.snapshot("primary.settings").find((p) => p.id === C);
      w && e.menu.replace(a, C, {
        ...w,
        visible: () => !Je()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active"
  );
}
function Rt() {
  try {
    rs();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Rt, 500);
  }
}
var Pn;
if ((Pn = window.QwenPaw) != null && Pn.host)
  Rt();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), Rt());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
