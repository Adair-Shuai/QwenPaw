function I() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Ta() {
  try {
    return I().getApiToken() || "";
  } catch {
    return "";
  }
}
function nt(e) {
  return I().getApiUrl(e);
}
function Nn(e) {
  const t = Ta();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
const jt = /* @__PURE__ */ new Map(), za = 15e3;
function at() {
  jt.clear();
}
async function le(e, t) {
  const l = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: a, ...n } = t || {};
  if (l !== "GET" && at(), l === "GET" && !a) {
    const o = jt.get(e);
    if (o && Date.now() - o.ts < za)
      return o.data;
  }
  const s = await fetch(nt(e), {
    ...n,
    headers: { ...Nn(), ...n.headers || {} }
  });
  if (!s.ok) {
    const o = await s.text().catch(() => "");
    throw new Error(o || `HTTP ${s.status}`);
  }
  if (s.status === 204) return null;
  const r = await s.json();
  return l === "GET" && jt.set(e, { data: r, ts: Date.now() }), r;
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
async function Ia(e) {
  const t = await le(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Pa() {
  return await le("/skills/workspaces") || [];
}
async function Oa(e) {
  return await le("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Aa(e, t) {
  return le(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function $a(e, t) {
  await le(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Ma(e, t, l) {
  return le("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ client_key: t, client: l })
  });
}
async function Ra(e, t, l) {
  return le(
    `/mcp/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function La(e, t) {
  return await le(
    `/mcp/tools/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
async function ja(e, t) {
  return le(
    `/mcp/policy/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  );
}
async function Ba(e, t, l) {
  return le(
    `/mcp/policy/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function Ua(e) {
  return await le(
    "/mcp/access-principals",
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
async function Na(e, t, l) {
  return le(
    `/mcp/oauth/start/${encodeURIComponent(t)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function Da(e, t) {
  return le(
    `/mcp/oauth/status/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  );
}
async function Fa(e, t) {
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
function Qe() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function Xt(e, t) {
  const l = I();
  return l.ReactMarkdown && l.remarkGfm ? t.createElement(
    l.ReactMarkdown,
    { remarkPlugins: [l.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
const wn = {
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
function Ga(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, l]) => typeof l == "string" && l.length > 0);
}
const Ha = [
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
], Wa = Ha, Dn = "ugsci_custom_teams";
function bt() {
  try {
    const e = localStorage.getItem(Dn);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function Fn(e) {
  try {
    localStorage.setItem(Dn, JSON.stringify(e));
  } catch {
  }
}
const Ja = [
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
async function Xa(e, t) {
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
      ...Nn(),
      "X-Agent-Id": e
    },
    body: JSON.stringify(l)
  });
}
function St(e, t) {
  const l = e.find(
    (n) => n.name === t || n.name === t.replace(/\s+/g, "")
  );
  if (l) return l.id;
  const a = e.find(
    (n) => n.name.includes(t) || t.includes(n.name) || n.name.replace(/\s+/g, "").includes(t.replace(/\s+/g, ""))
  );
  return a ? a.id : null;
}
function Ka(e) {
  var l;
  const t = e.members.map((a) => `- ${a.name}（${a.role}）`).join(`
`);
  if (e.custom && e.steps && e.steps.length > 0) {
    const a = e.steps.map((s, r) => {
      const o = s.passContext ? "（传递上一步的结果作为上下文）" : "（独立执行，不传递上下文）";
      return `${r + 1}. 向「${s.agentName}」发送请求：${s.instruction} ${o}`;
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
function Va({ team: e }) {
  const t = I().React, { Typography: l, Tag: a } = I().antd, { Text: n } = l, s = {
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
      ...d ? o.map((i, u) => (e.members.find(
        (k) => k.name === i.agentName
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
          t.createElement(De, {
            name: i.agentName,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              n,
              { strong: !0, style: { fontSize: 12 } },
              i.agentName
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
              i.instruction
            ),
            i.passContext ? t.createElement(
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
      ])).flat() : e.members.map((i, u) => [
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
          t.createElement(De, { name: i.name, size: 24 }),
          t.createElement(
            "div",
            null,
            t.createElement(
              n,
              { strong: !0, style: { fontSize: 12 } },
              i.name
            ),
            t.createElement(
              "div",
              { style: { fontSize: 11, color: "#8c8c8c" } },
              i.role
            )
          )
        )
      ]).flat()
    )
  );
}
function qa({
  open: e,
  onClose: t,
  agents: l,
  editingTeam: a,
  onSaved: n
}) {
  const s = I().React, { useState: r, useEffect: o, useCallback: d } = s, {
    Modal: i,
    Input: u,
    Button: k,
    Select: g,
    Tag: S,
    Typography: x,
    Switch: p,
    Empty: $,
    message: M,
    Divider: J,
    Steps: R
  } = I().antd, { PlusOutlined: ee, DeleteOutlined: j, SaveOutlined: N, ArrowRightOutlined: O } = I().antdIcons || {}, { Text: _, Paragraph: T } = x, [X, D] = r(""), [A, E] = r("🤝"), [b, y] = r(""), [K, G] = r(
    "pipeline"
  ), [ae, w] = r(""), [f, v] = r(""), [C, oe] = r([]), [L, q] = r([]), [ie, B] = r(!1);
  o(() => {
    e && (a ? (D(a.name), E(a.emoji), y(a.description), G(a.mode), w(a.coordinatorName || ""), v(a.taskTemplate), oe(a.steps || []), q(a.members.map((P) => P.name))) : (D(""), E("🤝"), y(""), G("pipeline"), w(""), v(`请执行以下任务：
任务描述：{任务描述}`), oe([]), q([])));
  }, [e, a]);
  const Y = d(() => {
    if (K === "roundtable") {
      const P = L.map((se) => ({
        agentName: se,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      oe(P);
    } else if (K === "pipeline") {
      const P = new Map(C.map((de) => [de.agentName, de])), se = L.map((de) => P.get(de) || {
        agentName: de,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      oe(se);
    }
  }, [K, L, C]), re = (P) => {
    L.includes(P) || (q([...L, P]), K === "coordinator" && !ae && w(P));
  }, h = (P) => {
    q(L.filter((se) => se !== P)), oe(C.filter((se) => se.agentName !== P)), ae === P && w(L[0] || "");
  }, ne = (P, se, de) => {
    const he = [...C];
    he[P] = { ...he[P], [se]: de }, oe(he);
  }, m = () => {
    if (!X.trim()) {
      M.warning("请输入团队名称");
      return;
    }
    if (L.length < 2) {
      M.warning("至少需要选择 2 个成员");
      return;
    }
    if (!f.trim()) {
      M.warning("请输入任务模板");
      return;
    }
    if (K === "coordinator" && !ae) {
      M.warning("请选择协调者");
      return;
    }
    B(!0);
    try {
      const P = L.map(
        (ue) => {
          var W;
          const V = l.find((z) => z.name === ue);
          return {
            name: ue,
            role: ((W = V == null ? void 0 : V.description) == null ? void 0 : W.slice(0, 30)) || "团队成员",
            emoji: ""
          };
        }
      );
      let se = C;
      (C.length === 0 || C.length !== L.length) && (se = L.map((ue) => ({
        agentName: ue,
        instruction: "请完成你的专业部分",
        passContext: K === "pipeline"
      })));
      const de = {
        id: (a == null ? void 0 : a.id) || `custom-${Date.now()}`,
        name: X.trim(),
        emoji: A,
        category: "自定义",
        description: b.trim() || `${X.trim()}（${L.length}人团队）`,
        mode: K,
        members: P,
        coordinatorName: K === "coordinator" ? ae : void 0,
        taskTemplate: f.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: se,
        custom: !0,
        createdAt: (a == null ? void 0 : a.createdAt) || Date.now()
      }, he = bt(), fe = he.findIndex((ue) => ue.id === de.id);
      fe >= 0 ? he[fe] = de : he.push(de), Fn(he), M.success(a ? "团队已更新" : "团队已创建"), n(), t();
    } catch (P) {
      M.error(P.message || "保存失败");
    } finally {
      B(!1);
    }
  }, te = l.filter(
    (P) => !L.includes(P.name)
  );
  return s.createElement(
    i,
    {
      open: e,
      onCancel: t,
      title: s.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        s.createElement(
          "span",
          { style: { fontSize: 20 } },
          a ? "✏️" : "➕"
        ),
        s.createElement(
          "span",
          null,
          a ? "编辑专家团" : "创建专家团"
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
        _,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 基本信息"
      ),
      s.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        L.length > 0 ? s.createElement(Qt, {
          members: L,
          size: 36
        }) : null,
        s.createElement(u, {
          placeholder: "团队名称（如：储层评价团队）",
          value: X,
          onChange: (P) => D(P.target.value),
          style: { flex: 1 }
        })
      ),
      s.createElement(u.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: b,
        onChange: (P) => y(P.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      s.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        s.createElement(
          _,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式："
        ),
        s.createElement(g, {
          value: K,
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
    s.createElement(J, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    s.createElement(
      "div",
      { style: { marginBottom: 16 } },
      s.createElement(
        _,
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
          (P) => s.createElement(
            k,
            {
              key: P.id,
              size: "small",
              icon: ee ? s.createElement(ee) : void 0,
              onClick: () => re(P.name)
            },
            P.name
          )
        )
      ) : null,
      // Selected members
      L.length === 0 ? s.createElement($, {
        description: "请从上方添加团队成员",
        image: $.PRESENTED_IMAGE_SIMPLE
      }) : s.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...L.map(
          (P) => s.createElement(
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
            s.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 6 } },
              s.createElement(De, { name: P, size: 24 }),
              s.createElement(
                _,
                { strong: !0, style: { fontSize: 13 } },
                P
              ),
              K === "coordinator" && ae === P ? s.createElement(
                S,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            s.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              K === "coordinator" ? s.createElement(
                k,
                {
                  size: "small",
                  type: "link",
                  onClick: () => w(P)
                },
                "设为协调者"
              ) : null,
              s.createElement(
                k,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: j ? s.createElement(j) : void 0,
                  onClick: () => h(P)
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
    L.length > 0 ? s.createElement(
      "div",
      { style: { marginBottom: 16 } },
      s.createElement(
        _,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${K === "roundtable" ? "（各步独立执行）" : K === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      s.createElement(
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
      C.length === 0 ? s.createElement(
        _,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : s.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...C.map(
          (P, se) => s.createElement(
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
              K === "pipeline" ? s.createElement(
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
                S,
                { color: "blue", style: { fontSize: 11 } },
                P.agentName
              ),
              s.createElement(
                "div",
                { style: { flex: 1 } },
                s.createElement(u, {
                  placeholder: "请输入该步骤的指令...",
                  value: P.instruction,
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
                checked: P.passContext,
                onChange: (de) => ne(se, "passContext", de)
              }),
              s.createElement(
                _,
                { type: "secondary", style: { fontSize: 11 } },
                P.passContext ? "传递上一步结果作为上下文" : "独立执行"
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
        _,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${L.length > 0 ? "4" : "3"}. 任务模板`
      ),
      s.createElement(u.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: f,
        onChange: (P) => v(P.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      s.createElement(
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
function Cn({
  team: e,
  agents: t,
  onLaunch: l,
  onEdit: a,
  onDelete: n
}) {
  var b;
  const s = I().React, { useState: r } = s, { Card: o, Tag: d, Typography: i, Button: u, Tooltip: k } = I().antd, {
    TeamOutlined: g,
    RocketOutlined: S,
    UserOutlined: x,
    EditOutlined: p,
    DeleteOutlined: $,
    DownOutlined: M,
    UpOutlined: J
  } = I().antdIcons || {}, { Text: R, Paragraph: ee } = i, [j, N] = r(!1), O = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, _ = O[e.mode] || O.coordinator, T = e.members.map((y) => {
    const K = St(t, y.name);
    return { ...y, found: !!K, agentId: K };
  }), X = T.filter((y) => y.found).length, D = X === e.members.length, A = e.coordinatorName || ((b = e.members[0]) == null ? void 0 : b.name), E = A ? St(t, A) : null;
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
      s.createElement(Qt, {
        members: e.members.map((y) => y.name),
        size: 36
      }),
      s.createElement(
        "div",
        { style: { flex: 1 } },
        s.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          s.createElement(
            R,
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
            { color: _.color, style: { fontSize: 10 } },
            _.label
          ),
          s.createElement(
            d,
            { style: { fontSize: 10 } },
            `${X}/${e.members.length}`
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
        a ? s.createElement(
          k,
          { title: "编辑" },
          s.createElement(u, {
            type: "text",
            size: "small",
            icon: p ? s.createElement(p) : void 0,
            onClick: (y) => {
              y.stopPropagation(), a(e);
            }
          })
        ) : null,
        n ? s.createElement(
          k,
          { title: "删除" },
          s.createElement(u, {
            type: "text",
            size: "small",
            danger: !0,
            icon: $ ? s.createElement($) : void 0,
            onClick: (y) => {
              y.stopPropagation(), n(e);
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
      ...T.map(
        (y) => s.createElement(
          k,
          {
            key: y.name,
            title: `${y.name}（${y.role}）${y.found ? "" : " - 未创建"}`
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
                background: y.found ? "#f0f5ff" : "#fff2f0",
                border: `1px solid ${y.found ? "#d6e4ff" : "#ffccc7"}`,
                fontSize: 11
              }
            },
            s.createElement(De, { name: y.name, size: 18 }),
            s.createElement(
              R,
              {
                style: { fontSize: 11, color: y.found ? "#1f4e8c" : "#cf1322" }
              },
              y.name
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
        onClick: (y) => {
          y.stopPropagation(), N(!j);
        },
        icon: j ? J ? s.createElement(J) : "▲" : M ? s.createElement(M) : "▼"
      },
      j ? "收起流程" : "查看执行流程"
    ),
    j ? s.createElement(Va, { team: e }) : null,
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
        R,
        { type: "secondary", style: { fontSize: 11 } },
        A ? `协调者: ${A}` : ""
      ),
      s.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: S ? s.createElement(S) : void 0,
          disabled: !E,
          onClick: () => l(e),
          style: Re
        },
        "发起团队任务"
      )
    )
  );
}
function Ya({
  agents: e,
  onLaunch: t
}) {
  const l = I().React, { useMemo: a, useState: n, useCallback: s, useEffect: r } = l, {
    Row: o,
    Col: d,
    Input: i,
    Empty: u,
    Typography: k,
    Tag: g,
    Button: S,
    Divider: x,
    message: p,
    Popconfirm: $
  } = I().antd, { SearchOutlined: M, TeamOutlined: J, PlusOutlined: R, RocketOutlined: ee } = I().antdIcons || {}, { Text: j } = k, [N, O] = n(""), [_, T] = n([]), [X, D] = n(!1), [A, E] = n(null);
  r(() => {
    T(bt());
  }, []);
  const b = s(() => {
    T(bt());
  }, []), y = s(
    (C) => {
      const L = bt().filter((q) => q.id !== C.id);
      Fn(L), T(L), p.success(`团队「${C.name}」已删除`);
    },
    [p]
  ), K = s((C) => {
    E(C), D(!0);
  }, []), G = s(() => {
    E(null), D(!0);
  }, []), ae = a(() => [..._, ...Ja], [_]), w = a(() => {
    if (!N.trim()) return ae;
    const C = N.toLowerCase();
    return ae.filter(
      (oe) => oe.name.toLowerCase().includes(C) || oe.description.toLowerCase().includes(C) || oe.category.toLowerCase().includes(C)
    );
  }, [ae, N]), f = w.filter((C) => C.custom), v = w.filter((C) => !C.custom);
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
        S,
        {
          type: "primary",
          size: "small",
          icon: R ? l.createElement(R) : void 0,
          onClick: G,
          style: Re
        },
        "创建专家团"
      )
    ),
    // Search
    l.createElement(i, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: M ? l.createElement(M) : void 0,
      value: N,
      onChange: (C) => O(C.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Custom teams section
    f.length > 0 ? l.createElement(
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
          `自定义团队 (${f.length})`
        )
      ),
      l.createElement(
        o,
        { gutter: [12, 12] },
        ...f.map(
          (C) => l.createElement(
            d,
            { key: C.id, xs: 24, sm: 12, md: 8 },
            l.createElement(Cn, {
              team: C,
              agents: e,
              onLaunch: t,
              onEdit: K,
              onDelete: y
            })
          )
        )
      ),
      l.createElement(x, { style: { margin: "16px 0" } })
    ) : null,
    // Preset teams section
    v.length > 0 ? l.createElement(
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
          `预设团队 (${v.length})`
        ),
        l.createElement(
          j,
          { type: "secondary", style: { fontSize: 12 } },
          "· 行业典型工作流模板"
        )
      ),
      l.createElement(
        o,
        { gutter: [12, 12] },
        ...v.map(
          (C) => l.createElement(
            d,
            { key: C.id, xs: 24, sm: 12, md: 8 },
            l.createElement(Cn, {
              team: C,
              agents: e,
              onLaunch: t
            })
          )
        )
      )
    ) : null,
    // Empty state
    w.length === 0 ? l.createElement(u, {
      description: "未找到匹配的专家团队，点击「创建专家团」自定义",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : null,
    // Team Builder Modal
    l.createElement(qa, {
      open: X,
      onClose: () => {
        D(!1), E(null);
      },
      agents: e,
      editingTeam: A,
      onSaved: b
    })
  );
}
function Gn(e) {
  var l;
  const t = [];
  for (const a of e) {
    if (a.enabled === !1) continue;
    const n = (l = a.description) == null ? void 0 : l.trim();
    if (!n) continue;
    const s = (a.name || n).length > 20 ? (a.name || n).substring(0, 18) + "…" : a.name || n;
    let r = n;
    if (r = r.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(r) ? r = `请${r}` : /^(a |an |the )/i.test(r) ? r = `Help me with ${r}` : /[。？！.?!]$/.test(r) || (r = `帮我${r}`), r.length > 80 && (r = r.substring(0, 77) + "..."), t.push({ label: s, value: r }), t.length >= 4) break;
  }
  return t;
}
async function Qa(e) {
  return await le("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function wt(e, t, l) {
  await le(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: l })
  });
}
async function xn(e, t) {
  const l = await xt(e);
  l.system_prompt_files = t, await le(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
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
async function Hn(e, t) {
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
async function Za(e, t) {
  return le("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function el(e, t) {
  return le("/skills/batch-disable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function tl(e, t) {
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
async function Wn(e, t) {
  await le(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Bt(e, t) {
  return le("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function nl(e, t) {
  return le(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Jn(e, t) {
  await le(`/skills/${encodeURIComponent(t)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function al(e) {
  await le(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function ll(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const l = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!l) return { number: 6, unit: "h" };
  const a = parseInt(l[1] || "0", 10), n = parseInt(l[2] || "0", 10), s = parseInt(l[3] || "0", 10), r = a * 60 + n + Math.round(s / 60);
  return r <= 0 ? { number: 6, unit: "h" } : r >= 60 && r % 60 === 0 ? { number: r / 60, unit: "h" } : { number: r, unit: "m" };
}
function sl(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function ol(e) {
  return le("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function rl(e, t) {
  return le("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function il(e) {
  await le("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function cl(e) {
  return le("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function ml(e, t) {
  return le("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function dl(e) {
  return (await le("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function ul(e, t) {
  await le("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function pl() {
  return (await le("/config/user-timezone")).timezone || "UTC";
}
async function gl(e) {
  await le("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function fl(e) {
  return await le("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const kn = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function _t({
  title: e,
  subtitle: t,
  extra: l
}) {
  const a = I().React, { Space: n } = I().antd;
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
function _n({
  items: e,
  max: t = 5,
  color: l = "blue",
  emptyText: a = "无"
}) {
  const n = I().React, { Tag: s } = I().antd;
  return !e || e.length === 0 ? n.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    a
  ) : n.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (r, o) => n.createElement(
        s,
        { key: o, color: l, style: { fontSize: 11, marginRight: 0 } },
        r
      )
    ),
    e.length > t ? n.createElement(
      s,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function Xn({
  open: e,
  onClose: t,
  poolSkills: l,
  installedSkillNames: a,
  loading: n,
  onInstall: s
}) {
  const r = I().React, { useState: o, useEffect: d, useMemo: i } = r, { Modal: u, Button: k, Empty: g, Spin: S, Input: x, Tag: p, Tooltip: $, Typography: M } = I().antd, { CheckOutlined: J, SearchOutlined: R } = I().antdIcons || {}, { Text: ee } = M, [j, N] = o([]), [O, _] = o("");
  d(() => {
    e && (N([]), _(""));
  }, [e]);
  const T = i(() => {
    if (!O.trim()) return l;
    const E = O.toLowerCase();
    return l.filter(
      (b) => {
        var y, K;
        return b.name.toLowerCase().includes(E) || ((y = b.description) == null ? void 0 : y.toLowerCase().includes(E)) || ((K = b.tags) == null ? void 0 : K.some((G) => G.toLowerCase().includes(E)));
      }
    );
  }, [l, O]), X = T.filter(
    (E) => !a.includes(E.name)
  ), D = (E) => {
    N(
      (b) => b.includes(E) ? b.filter((y) => y !== E) : [...b, E]
    );
  }, A = async () => {
    j.length !== 0 && (await s(j), N([]));
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
          `已选择 ${j.length} 个技能`
        ),
        r.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          r.createElement(k, { onClick: t }, "取消"),
          r.createElement(
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
      r.createElement(x, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: R ? r.createElement(R) : void 0,
        value: O,
        onChange: (E) => _(E.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      r.createElement(
        k,
        {
          size: "small",
          type: "primary",
          onClick: () => N(X.map((E) => E.name))
        },
        "全选"
      ),
      r.createElement(
        k,
        {
          size: "small",
          onClick: () => N([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    n ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      r.createElement(S, { size: "large" })
    ) : T.length === 0 ? r.createElement(g, {
      description: O ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: g.PRESENTED_IMAGE_SIMPLE
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
      ...T.map((E) => {
        const b = j.includes(E.name), y = a.includes(E.name);
        return r.createElement(
          "div",
          {
            key: E.name,
            onClick: () => !y && D(E.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${b ? "#0072f5" : "#e8e8e8"}`,
              borderRadius: 6,
              cursor: y ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: b ? "rgba(0, 114, 245, 0.06)" : y ? "#fafafa" : "#fff",
              opacity: y ? 0.5 : 1,
              minHeight: 64
            }
          },
          b ? r.createElement(
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
          y ? r.createElement(
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
                paddingRight: y || b ? 24 : 0
              }
            },
            r.createElement(
              "span",
              { style: { fontSize: 16 } },
              E.emoji || "⚡"
            ),
            r.createElement(
              $,
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
              (K, G) => r.createElement(
                p,
                {
                  key: G,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                K
              )
            )
          ) : null
        );
      })
    )
  );
}
const Ze = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  gap: 4
}, Kn = { marginBottom: 16 }, Vn = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16
}, Ge = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(0,0,0,0.85)",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid #f0f0f0"
}, qn = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function yl({ agentId: e }) {
  const t = I().React, { useState: l, useEffect: a, useCallback: n } = t, {
    Switch: s,
    InputNumber: r,
    Select: o,
    Button: d,
    Spin: i,
    Space: u,
    Typography: k,
    message: g
  } = I().antd, { PlayCircleOutlined: S, SaveOutlined: x } = I().antdIcons || {}, { Text: p } = k, [$, M] = l(!0), [J, R] = l(!1), [ee, j] = l(!1), [N, O] = l(!1), [_, T] = l(6), [X, D] = l("h"), [A, E] = l("main"), [b, y] = l(300), [K, G] = l(!1), [ae, w] = l("08:00"), [f, v] = l("22:00"), C = n(async () => {
    var Y, re;
    M(!0);
    try {
      const h = await ol(e), ne = ll(h.every ?? "6h");
      O(h.enabled ?? !1), T(ne.number), D(ne.unit), E(h.target ?? "main"), y(h.timeoutSeconds ?? 300), G(!!h.activeHours), w(((Y = h.activeHours) == null ? void 0 : Y.start) ?? "08:00"), v(((re = h.activeHours) == null ? void 0 : re.end) ?? "22:00");
    } catch (h) {
      g.error(h.message || "加载心跳配置失败");
    } finally {
      M(!1);
    }
  }, [e]);
  a(() => {
    C();
  }, [C]);
  const oe = async () => {
    R(!0);
    try {
      await rl(e, {
        enabled: N,
        every: sl({ number: _, unit: X }),
        target: A,
        timeoutSeconds: b,
        activeHours: K && ae && f ? { start: ae, end: f } : void 0
      }), g.success("心跳配置已保存");
    } catch (Y) {
      g.error(Y.message || "保存心跳配置失败");
    } finally {
      R(!1);
    }
  }, L = async () => {
    j(!0);
    try {
      await il(e), g.success("已触发心跳检查");
    } catch (Y) {
      g.error(Y.message || "触发心跳失败");
    } finally {
      j(!1);
    }
  };
  if ($)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(i, { size: "large" })
    );
  const q = (Y, re, h) => t.createElement(
    "div",
    { style: Kn },
    t.createElement("div", { style: Ze }, Y),
    re,
    h ? t.createElement(
      p,
      { type: "secondary", style: qn },
      h
    ) : null
  ), ie = (Y, re, h, ne) => t.createElement(
    "div",
    { style: Vn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ze }, Y),
      re
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ze }, h),
      ne
    )
  ), { Divider: B } = I().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: Ge }, "基本设置"),
    q(
      "启用心跳",
      t.createElement(s, {
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
        t.createElement(r, {
          min: 1,
          value: _,
          onChange: (Y) => T(Y ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(o, {
          value: X,
          onChange: (Y) => D(Y),
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
        onChange: (Y) => E(Y),
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
      t.createElement(r, {
        min: 1,
        max: 3600,
        value: b,
        onChange: (Y) => y(Y ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(B, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ge }, "活跃时段"),
    q(
      "启用活跃时段限制",
      t.createElement(s, {
        checked: K,
        onChange: (Y) => G(Y)
      }),
      "仅在指定时段内触发心跳"
    ),
    K ? ie(
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
        value: f,
        onChange: (Y) => v(Y.target.value),
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
          icon: x ? t.createElement(x) : void 0,
          loading: J,
          onClick: oe,
          style: Re
        },
        "保存配置"
      ),
      t.createElement(
        d,
        {
          icon: S ? t.createElement(S) : void 0,
          loading: ee,
          onClick: L
        },
        "立即执行"
      )
    )
  );
}
function hl({
  agentId: e,
  onRefresh: t
}) {
  const l = I().React, { useState: a, useEffect: n, useCallback: s } = l, {
    List: r,
    Tag: o,
    Switch: d,
    Button: i,
    Empty: u,
    Spin: k,
    Typography: g,
    message: S
  } = I().antd, { PlusOutlined: x, ReloadOutlined: p, DeleteOutlined: $ } = I().antdIcons || {}, { Text: M, Paragraph: J } = g, [R, ee] = a([]), [j, N] = a(!0), [O, _] = a(!1), [T, X] = a([]), [D, A] = a(!1), E = s(async () => {
    N(!0);
    try {
      const w = await kt(e);
      ee(w);
    } catch (w) {
      S.error(w.message || "加载技能失败"), ee([]);
    } finally {
      N(!1);
    }
  }, [e]);
  n(() => {
    E();
  }, [E]);
  const b = async () => {
    _(!0), A(!0);
    try {
      const w = await Jt(!0);
      X(w);
    } catch (w) {
      S.error(w.message || "加载技能池失败");
    } finally {
      A(!1);
    }
  }, y = async (w) => {
    let f = 0, v = 0;
    for (const C of w)
      try {
        await Kt(e, C), f++;
      } catch {
        v++;
      }
    f > 0 ? (S.success(
      `成功添加 ${f} 个技能${v > 0 ? `，${v} 个失败` : ""}`
    ), E(), t()) : v > 0 && S.error("添加技能失败"), _(!1);
  }, K = async (w, f) => {
    try {
      f ? await Hn(e, w.name) : await Jn(e, w.name), S.success(f ? "已启用" : "已停用"), E(), t();
    } catch (v) {
      S.error(v.message || "操作失败");
    }
  }, G = async (w) => {
    try {
      await Vt(e, w), S.success(`技能「${w}」已移除`), E(), t();
    } catch (f) {
      S.error(f.message || "移除技能失败");
    }
  };
  if (j)
    return l.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      l.createElement(k, { size: "large" })
    );
  const ae = R.filter((w) => w.enabled !== !1);
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
        `技能列表 (${R.length}，已启用 ${ae.length})`
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        l.createElement(
          i,
          {
            size: "small",
            icon: p ? l.createElement(p) : void 0,
            onClick: () => {
              at(), E();
            }
          },
          "刷新"
        ),
        l.createElement(
          i,
          {
            type: "primary",
            size: "small",
            icon: x ? l.createElement(x) : void 0,
            onClick: b,
            style: Re
          },
          "从技能池添加"
        )
      )
    ),
    R.length === 0 ? l.createElement(u, {
      description: "该专家暂无技能",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(r, {
      dataSource: R,
      renderItem: (w) => l.createElement(
        r.Item,
        {
          actions: [
            l.createElement(d, {
              key: "toggle",
              size: "small",
              checked: w.enabled !== !1,
              onChange: (f) => K(w, f)
            }),
            l.createElement(
              i,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: $ ? l.createElement($) : void 0,
                onClick: () => G(w.name)
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
              o,
              { style: { fontSize: 10 } },
              `v${w.version_text}`
            ) : null
          ),
          w.description ? l.createElement(
            J,
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
    l.createElement(Xn, {
      open: O,
      onClose: () => _(!1),
      poolSkills: T,
      installedSkillNames: R.map((w) => w.name),
      loading: D,
      onInstall: y
    })
  );
}
function El({
  agentId: e,
  onRefresh: t,
  isActive: l
}) {
  const a = I().React, { useState: n, useEffect: s, useCallback: r } = a, {
    List: o,
    Tag: d,
    Button: i,
    Empty: u,
    Spin: k,
    Modal: g,
    Input: S,
    Typography: x,
    message: p
  } = I().antd, { PlusOutlined: $, ReloadOutlined: M, DeleteOutlined: J } = I().antdIcons || {}, { Text: R, Paragraph: ee } = x, { TextArea: j } = S, [N, O] = n([]), [_, T] = n(!0), [X, D] = n(!1), [A, E] = n(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [b, y] = n(!1), K = r(async () => {
    T(!0);
    try {
      const f = await qt(e);
      O(f);
    } catch (f) {
      p.error(f.message || "加载 MCP 失败"), O([]);
    } finally {
      T(!1);
    }
  }, [e]);
  s(() => {
    K();
  }, [K]), s(() => {
    l && K();
  }, [l, K]);
  const G = async (f) => {
    try {
      await nl(e, f), p.success("已切换 MCP 状态"), K(), t();
    } catch (v) {
      p.error(v.message || "切换失败");
    }
  }, ae = async (f) => {
    try {
      await Wn(e, f), p.success(`MCP「${f}」已移除`), K(), t();
    } catch (v) {
      p.error(v.message || "移除 MCP 失败");
    }
  }, w = async () => {
    y(!0);
    try {
      const f = JSON.parse(A), v = f.mcpServers || f, C = Object.entries(v);
      if (C.length === 0) {
        p.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [oe, L] of C) {
        const q = L, ie = q.url ? "streamable_http" : "stdio";
        await Bt(e, {
          client_key: oe,
          client: {
            name: q.name || oe,
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
      p.success("MCP 客户端已创建"), D(!1), K(), t();
    } catch (f) {
      f instanceof SyntaxError ? p.error("JSON 格式错误：" + f.message) : p.error(f.message || "创建 MCP 失败");
    } finally {
      y(!1);
    }
  };
  return _ ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(k, { size: "large" })
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
      a.createElement(R, { strong: !0 }, `MCP 客户端 (${N.length})`),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          i,
          {
            size: "small",
            icon: M ? a.createElement(M) : void 0,
            onClick: () => {
              at(), K();
            }
          },
          "刷新"
        ),
        a.createElement(
          i,
          {
            type: "primary",
            size: "small",
            icon: $ ? a.createElement($) : void 0,
            onClick: () => D(!0),
            style: Re
          },
          "添加 MCP"
        )
      )
    ),
    N.length === 0 ? a.createElement(u, {
      description: "该专家暂无 MCP 客户端",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(o, {
      dataSource: N,
      renderItem: (f) => a.createElement(
        o.Item,
        {
          actions: [
            a.createElement(
              i,
              {
                key: "toggle",
                size: "small",
                onClick: () => G(f.key)
              },
              f.enabled ? "停用" : "启用"
            ),
            a.createElement(
              i,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: J ? a.createElement(J) : void 0,
                onClick: () => ae(f.key)
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
            a.createElement(R, { strong: !0 }, f.name || f.key),
            a.createElement(
              d,
              {
                color: f.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              f.enabled ? "启用" : "停用"
            ),
            a.createElement(
              d,
              { color: "purple", style: { fontSize: 10 } },
              f.transport
            )
          ),
          f.description ? a.createElement(
            ee,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            f.description
          ) : null,
          f.tools && f.tools.length > 0 ? a.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "#8c8c8c" } },
            `提供 ${f.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    a.createElement(
      g,
      {
        open: X,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => D(!1),
        onOk: w,
        confirmLoading: b,
        okText: "创建",
        width: 560
      },
      a.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      a.createElement(j, {
        value: A,
        onChange: (f) => E(f.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function vl({ agentId: e }) {
  const t = I().React, { useState: l, useEffect: a, useCallback: n, useRef: s } = t, {
    Card: r,
    InputNumber: o,
    Input: d,
    Select: i,
    Switch: u,
    Button: k,
    Spin: g,
    Space: S,
    Typography: x,
    Divider: p,
    message: $
  } = I().antd, { SaveOutlined: M } = I().antdIcons || {}, { Text: J } = x, [R, ee] = l(!0), [j, N] = l(!1), O = s(null), [_, T] = l(60), [X, D] = l(""), [A, E] = l(!0), [b, y] = l(30), [K, G] = l("zh"), [ae, w] = l("UTC"), [f, v] = l(!0), [C, oe] = l(100), [L, q] = l(!0), [ie, B] = l(3), [Y, re] = l(1), [h, ne] = l(!0), [m, te] = l(3), [P, se] = l(2), [de, he] = l(60), [fe, ue] = l(1), [V, W] = l(0), [z, F] = l(1), [ce, H] = l(0), [pe, Ee] = l(30), [Ce, Ie] = l(50), [$e, We] = l("light"), [ut, lt] = l("scroll"), [Be, st] = l("remelight"), [pt, Ke] = l("AUTO"), Pe = n(async () => {
    var Z, xe, we, Oe, rt, it;
    ee(!0);
    try {
      const [ve, gt, It] = await Promise.all([
        cl(e),
        dl(e).catch(() => "zh"),
        pl().catch(() => "UTC")
      ]);
      O.current = ve, T(ve.shell_command_timeout ?? 60), D(ve.shell_command_executable ?? "");
      const ct = ve.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      E(ct.enabled ?? !0), y(ct.timeout_seconds ?? 30), G(gt), w(It);
      const Je = ve.loop ?? {};
      v(((Z = Je.iteration) == null ? void 0 : Z.enabled) ?? !0), oe(((xe = Je.iteration) == null ? void 0 : xe.max_iterations) ?? ve.max_iters ?? 100), q(((we = Je.doom_loop) == null ? void 0 : we.enabled) ?? !0), B(((Oe = Je.doom_loop) == null ? void 0 : Oe.window_size) ?? 3), re(((rt = Je.doom_loop) == null ? void 0 : rt.similarity_threshold) ?? 1), ne(ve.llm_retry_enabled ?? !0), te(ve.llm_max_retries ?? 3), se(ve.llm_backoff_base ?? 2), he(ve.llm_backoff_cap ?? 60), ue(ve.llm_max_concurrent ?? 1), W(ve.llm_max_qpm ?? 0), F(ve.llm_rate_limit_pause ?? 1), H(ve.llm_rate_limit_jitter ?? 0), Ee(ve.llm_acquire_timeout ?? 30), Ie(ve.history_max_length ?? 50), We(ve.context_manager_backend ?? "light"), lt(((it = ve.light_context_config) == null ? void 0 : it.strategy) ?? "scroll"), st(ve.memory_manager_backend ?? "remelight"), Ke(ve.approval_level ?? "AUTO");
    } catch (ve) {
      $.error(ve.message || "加载运行配置失败");
    } finally {
      ee(!1);
    }
  }, [e]);
  a(() => {
    Pe();
  }, [Pe]);
  const ot = async () => {
    var xe, we;
    const Z = O.current;
    if (Z) {
      N(!0);
      try {
        const Oe = {
          ...Z,
          max_iters: C,
          loop: {
            ...Z.loop ?? {},
            iteration: { enabled: f, max_iterations: C },
            doom_loop: {
              enabled: L,
              window_size: ie,
              similarity_threshold: Y,
              stages: ((we = (xe = Z.loop) == null ? void 0 : xe.doom_loop) == null ? void 0 : we.stages) ?? []
            }
          },
          shell_command_timeout: _,
          shell_command_executable: X,
          auto_title_config: {
            enabled: A,
            timeout_seconds: b
          },
          llm_retry_enabled: h,
          llm_max_retries: m,
          llm_backoff_base: P,
          llm_backoff_cap: de,
          llm_max_concurrent: fe,
          llm_max_qpm: V,
          llm_rate_limit_pause: z,
          llm_rate_limit_jitter: ce,
          llm_acquire_timeout: pe,
          history_max_length: Ce,
          context_manager_backend: $e,
          light_context_config: {
            ...Z.light_context_config ?? {},
            strategy: ut
          },
          memory_manager_backend: Be,
          approval_level: pt
        };
        await ml(e, Oe), O.current = Oe, K && await ul(e, K).catch(() => {
        }), ae && await gl(ae).catch(() => {
        }), $.success("运行配置已保存");
      } catch (Oe) {
        $.error(Oe.message || "保存运行配置失败");
      } finally {
        N(!1);
      }
    }
  };
  if (R)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(g, { size: "large" })
    );
  const Ae = (Z, xe, we) => t.createElement(
    "div",
    { style: Kn },
    t.createElement("div", { style: Ze }, Z),
    xe,
    we ? t.createElement(
      J,
      { type: "secondary", style: qn },
      we
    ) : null
  ), Te = (Z, xe, we, Oe) => t.createElement(
    "div",
    { style: Vn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ze }, Z),
      xe
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ze }, we),
      Oe
    )
  );
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    t.createElement(
      "div",
      { style: Ge },
      "基础设置"
    ),
    Te(
      "Shell 命令超时 (秒)",
      t.createElement(o, {
        min: 1,
        value: _,
        onChange: (Z) => T(Z ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(d, {
        value: X,
        onChange: (Z) => D(Z.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    Te(
      "语言",
      t.createElement(i, {
        value: K,
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
      t.createElement(i, {
        value: ae,
        onChange: (Z) => w(Z),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (Z, xe) => {
          var we;
          return (((we = xe == null ? void 0 : xe.label) == null ? void 0 : we.toString()) || "").toLowerCase().includes(Z.toLowerCase());
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
      t.createElement(S, null, t.createElement(u, {
        checked: A,
        onChange: (Z) => E(Z)
      })),
      "标题生成超时 (秒)",
      t.createElement(o, {
        min: 5,
        value: b,
        onChange: (Z) => y(Z ?? 30),
        style: { width: "100%" },
        disabled: !A
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(p, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ge }, "审批级别"),
    Ae(
      "工具执行审批",
      t.createElement(i, {
        value: pt,
        onChange: (Z) => Ke(Z),
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
    t.createElement("div", { style: Ge }, "迭代与循环"),
    Ae(
      "启用迭代限制",
      t.createElement(u, {
        checked: f,
        onChange: (Z) => v(Z)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    f ? Ae(
      "最大迭代次数",
      t.createElement(o, {
        min: 1,
        max: 500,
        value: C,
        onChange: (Z) => oe(Z ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    Ae(
      "启用重复循环保护",
      t.createElement(u, {
        checked: L,
        onChange: (Z) => q(Z)
      }),
      "检测并阻止重复操作循环"
    ),
    L ? Te(
      "检测窗口大小",
      t.createElement(o, {
        min: 2,
        max: 20,
        value: ie,
        onChange: (Z) => B(Z ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(o, {
        min: 0,
        max: 1,
        step: 0.05,
        value: Y,
        onChange: (Z) => re(Z ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(p, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ge }, "LLM 重试"),
    Ae(
      "启用 LLM 重试",
      t.createElement(u, {
        checked: h,
        onChange: (Z) => ne(Z)
      })
    ),
    Te(
      "最大重试次数",
      t.createElement(o, {
        min: 1,
        value: m,
        onChange: (Z) => te(Z ?? 3),
        style: { width: "100%" },
        disabled: !h
      }),
      "退避基数 (秒)",
      t.createElement(o, {
        min: 0.1,
        step: 0.1,
        value: P,
        onChange: (Z) => se(Z ?? 2),
        style: { width: "100%" },
        disabled: !h
      })
    ),
    Ae(
      "退避上限 (秒)",
      t.createElement(o, {
        min: 0.5,
        step: 0.5,
        value: de,
        onChange: (Z) => he(Z ?? 60),
        style: { width: 200 },
        disabled: !h
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(p, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ge }, "LLM 限流"),
    Te(
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
        value: V,
        onChange: (Z) => W(Z ?? 0),
        style: { width: "100%" }
      })
    ),
    Te(
      "限流暂停时间 (秒)",
      t.createElement(o, {
        min: 1,
        step: 0.5,
        value: z,
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
    Ae(
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
    t.createElement("div", { style: Ge }, "上下文与记忆"),
    Te(
      "上下文管理后端",
      t.createElement(i, {
        value: $e,
        onChange: (Z) => We(Z),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(i, {
        value: ut,
        onChange: (Z) => lt(Z),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    Te(
      "记忆管理后端",
      t.createElement(i, {
        value: Be,
        onChange: (Z) => st(Z),
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
        value: Ce,
        onChange: (Z) => Ie(Z ?? 50),
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
          onClick: ot,
          style: Re
        },
        "保存运行配置"
      )
    )
  );
}
function bl({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: a
}) {
  const n = I().React, { useState: s, useEffect: r, useCallback: o } = n, { Modal: d, Tabs: i, Spin: u, Typography: k } = I().antd, { SettingOutlined: g } = I().antdIcons || {}, { Text: S } = k, [x, p] = s([]), [$, M] = s(!1), [J, R] = s("heartbeat"), ee = o(async () => {
    if (e) {
      M(!0);
      try {
        const _ = await fl(e.agent.id);
        p(_);
      } catch {
        p([]);
      } finally {
        M(!1);
      }
    }
  }, [e]);
  if (r(() => {
    t && e && ee();
  }, [t, e, ee]), !e) return null;
  const { agent: j } = e, N = () => {
    ee(), a();
  }, O = [
    {
      key: "heartbeat",
      label: "心跳",
      children: n.createElement(yl, {
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
      ) : n.createElement(Yn, {
        agentId: j.id,
        systemPromptFiles: x,
        onRefresh: N
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((_) => _.enabled !== !1).length})`,
      children: n.createElement(hl, {
        agentId: j.id,
        onRefresh: a
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: n.createElement(El, {
        agentId: j.id,
        onRefresh: a,
        isActive: J === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: n.createElement(vl, {
        agentId: j.id
      })
    }
  ];
  return n.createElement(
    d,
    {
      open: t,
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        g ? n.createElement(g, { style: { fontSize: 18 } }) : null,
        n.createElement("span", null, `配置 - ${j.name}`),
        n.createElement(
          S,
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
    n.createElement(i, {
      items: O,
      activeKey: J,
      onChange: (_) => R(_),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
function Sl({
  expert: e,
  onClick: t,
  onSummon: l,
  onConfigure: a
}) {
  const n = I().React, { Card: s, Tag: r, Badge: o, Typography: d, Spin: i, Button: u, Tooltip: k } = I().antd, { Text: g } = d, { ThunderboltOutlined: S, SettingOutlined: x } = I().antdIcons || {}, { agent: p, skills: $, mcps: M, loading: J } = e, R = p.enabled, ee = $.filter((O) => O.enabled !== !1).map((O) => O.name), j = M.map((O) => O.name || O.key), N = p.active_model ? `${p.active_model.provider_id}/${p.active_model.model}` : null;
  return n.createElement(
    s,
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
        n.createElement(De, { name: p.name, size: 36 }),
        n.createElement(
          "div",
          null,
          n.createElement(
            g,
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
      n.createElement(o, {
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
        r,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${N}`
      )
    ) : null,
    // Skills
    J ? n.createElement(i, { size: "small" }) : n.createElement(
      "div",
      { style: { marginBottom: 6 } },
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${ee.length})`
      ),
      n.createElement(_n, {
        items: ee,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !J && j.length > 0 ? n.createElement(
      "div",
      { style: { marginTop: "auto" } },
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${j.length})`
      ),
      n.createElement(_n, {
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
            icon: x ? n.createElement(x, {
              style: { fontSize: 16, color: "#8c8c8c" }
            }) : void 0,
            onClick: (O) => {
              O.stopPropagation(), a && a();
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
          icon: S ? n.createElement(S) : void 0,
          disabled: !R,
          onClick: (O) => {
            O.stopPropagation(), l && l();
          },
          style: Re
        },
        "召唤专家"
      )
    )
  );
}
function wl({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: a
}) {
  const n = I().React, {
    Drawer: s,
    Descriptions: r,
    Tag: o,
    Typography: d,
    Space: i,
    Button: u,
    Empty: k,
    Tabs: g,
    List: S,
    Spin: x,
    Modal: p,
    message: $
  } = I().antd, { Text: M, Paragraph: J } = d, {
    EditOutlined: R,
    ThunderboltOutlined: ee,
    FileTextOutlined: j,
    ToolOutlined: N,
    PlusOutlined: O
  } = I().antdIcons || {}, [_, T] = n.useState(!1), [X, D] = n.useState(
    []
  ), [A, E] = n.useState(!1);
  if (!e) return null;
  const { agent: b, config: y, skills: K, mcps: G, loading: ae } = e, w = K.filter((h) => h.enabled !== !1), f = (h) => {
    window.history.pushState({}, "", h), window.dispatchEvent(new PopStateEvent("popstate"));
  }, v = n.createElement(
    "div",
    null,
    n.createElement(
      r,
      { column: 1, bordered: !0, size: "small" },
      n.createElement(r.Item, { label: "专家名称" }, b.name),
      n.createElement(
        r.Item,
        { label: "专家 ID" },
        n.createElement("code", { style: { fontSize: 12 } }, b.id)
      ),
      n.createElement(
        r.Item,
        { label: "状态" },
        n.createElement(
          o,
          { color: b.enabled ? "green" : "default" },
          b.enabled ? "启用" : "停用"
        )
      ),
      n.createElement(
        r.Item,
        { label: "功能简介" },
        b.description ? Xt(b.description, n) : "暂无描述"
      ),
      n.createElement(
        r.Item,
        { label: "使用模型" },
        b.active_model ? `${b.active_model.provider_id} / ${b.active_model.model}` : "使用全局默认模型"
      ),
      y != null && y.workspace_dir ? n.createElement(
        r.Item,
        { label: "工作区路径" },
        n.createElement(
          "code",
          { style: { fontSize: 11 } },
          y.workspace_dir
        )
      ) : null,
      y != null && y.approval_level ? n.createElement(
        r.Item,
        { label: "审批级别" },
        y.approval_level
      ) : null
    ),
    // System prompt files
    y != null && y.system_prompt_files && y.system_prompt_files.length > 0 ? n.createElement(
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
        i,
        { wrap: !0 },
        ...y.system_prompt_files.map(
          (h, ne) => n.createElement(
            o,
            {
              key: ne,
              icon: j ? n.createElement(j) : void 0,
              style: { fontSize: 12 }
            },
            h
          )
        )
      )
    ) : null
  ), C = async () => {
    T(!0), E(!0);
    try {
      const h = await Jt(!0);
      D(h);
    } catch (h) {
      $.error(h.message || "加载技能池失败");
    } finally {
      E(!1);
    }
  }, oe = async (h) => {
    let ne = 0, m = 0;
    for (const te of h)
      try {
        await Kt(b.id, te), ne++;
      } catch {
        m++;
      }
    ne > 0 ? ($.success(
      `成功添加 ${ne} 个技能${m > 0 ? `，${m} 个失败` : ""}`
    ), a()) : m > 0 && $.error("添加技能失败"), T(!1);
  }, L = async (h) => {
    try {
      await Vt(b.id, h), $.success(`技能「${h}」已移除`), a();
    } catch (ne) {
      $.error(ne.message || "移除技能失败");
    }
  }, q = async (h) => {
    try {
      await Wn(b.id, h), $.success(`MCP「${h}」已移除`), a();
    } catch (ne) {
      $.error(ne.message || "移除 MCP 失败");
    }
  }, ie = ae ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(x, { size: "large" })
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
    }) : n.createElement(S, {
      dataSource: w,
      renderItem: (h) => n.createElement(
        S.Item,
        {
          actions: [
            n.createElement(
              u,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => L(h.name)
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
            h.emoji ? n.createElement(
              "span",
              { style: { fontSize: 16 } },
              h.emoji
            ) : null,
            n.createElement(M, { strong: !0 }, h.name),
            h.version_text ? n.createElement(
              o,
              { style: { fontSize: 10 } },
              `v${h.version_text}`
            ) : null
          ),
          h.description ? n.createElement(
            J,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            h.description
          ) : null,
          h.tags && h.tags.length > 0 ? n.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...h.tags.map(
              (ne, m) => n.createElement(
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
    n.createElement(Xn, {
      open: _,
      onClose: () => T(!1),
      poolSkills: X,
      installedSkillNames: w.map((h) => h.name),
      loading: A,
      onInstall: oe
    })
  ), B = ae ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(x, { size: "large" })
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
            window.history.pushState({}, "", `/agents/${b.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    G.length === 0 ? n.createElement(k, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: k.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(S, {
      dataSource: G,
      renderItem: (h) => n.createElement(
        S.Item,
        {
          actions: [
            n.createElement(
              u,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => q(h.key)
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
              h.name || h.key
            ),
            n.createElement(
              o,
              {
                color: h.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              h.enabled ? "启用" : "停用"
            ),
            n.createElement(
              o,
              { color: "purple", style: { fontSize: 10 } },
              h.transport
            )
          ),
          h.description ? n.createElement(
            J,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            h.description
          ) : null,
          h.tools && h.tools.length > 0 ? n.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "#8c8c8c"
              }
            },
            `提供 ${h.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), Y = y != null && y.tools ? n.createElement(
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
        JSON.stringify(y.tools, null, 2)
      )
    )
  ) : n.createElement(k, {
    description: "暂无工具配置",
    image: k.PRESENTED_IMAGE_SIMPLE
  }), re = [
    { key: "basic", label: "基本信息", children: v },
    {
      key: "skills",
      label: `技能 (${w.length})`,
      children: ie
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: n.createElement(kl, {
        skills: w,
        agentId: b.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: n.createElement(Yn, {
        agentId: b.id,
        systemPromptFiles: (y == null ? void 0 : y.system_prompt_files) || [],
        onRefresh: () => a()
      })
    },
    { key: "mcp", label: `MCP (${G.length})`, children: B },
    { key: "tools", label: "工具配置", children: Y }
  ];
  return n.createElement(
    s,
    {
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        n.createElement(De, { name: b.name, size: 28 }),
        n.createElement("span", null, b.name)
      ),
      open: t,
      onClose: l,
      width: 560,
      extra: n.createElement(
        i,
        null,
        n.createElement(
          u,
          {
            size: "small",
            icon: R ? n.createElement(R) : void 0,
            onClick: () => {
              l();
              try {
                const h = I();
                h.setSelectedAgent && h.setSelectedAgent(b.id);
              } catch (h) {
                console.warn("[ugsci] Failed to set selected agent:", h);
              }
              setTimeout(() => f("/agents"), 0);
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
              l();
              try {
                const h = I();
                h.setSelectedAgent && h.setSelectedAgent(b.id);
              } catch (h) {
                console.warn("[ugsci] Failed to set selected agent:", h);
              }
              setTimeout(() => f("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    n.createElement(g, {
      items: re,
      defaultActiveKey: "basic"
    })
  );
}
function Cl({
  open: e,
  onClose: t,
  onCreated: l
}) {
  const a = I().React, { useState: n } = a, {
    Modal: s,
    Card: r,
    Tag: o,
    Input: d,
    Row: i,
    Col: u,
    Spin: k,
    message: g,
    Typography: S
  } = I().antd, { Text: x } = S, { FileAddOutlined: p } = I().antdIcons || {}, [$, M] = n(!1), [J, R] = n(""), [ee, j] = n(!1), N = async (T, X) => {
    M(!0);
    try {
      const D = await le("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: T || "新专家",
          description: X || "",
          skill_names: []
        })
      });
      await wt(
        D.id,
        "AGENTS.md",
        `# ${T || "新专家"}

请在此处编写该专家的系统提示词。
`
      ), g.success("专家「" + (T || "新专家") + "」创建成功"), j(!1), setTimeout(() => {
        t(), l();
      }, 0);
    } catch (D) {
      g.error(D.message || "创建专家失败");
    } finally {
      M(!1);
    }
  }, O = Wa.filter((T) => {
    if (!J.trim()) return !0;
    const X = J.toLowerCase();
    return T.name.toLowerCase().includes(X) || T.description.toLowerCase().includes(X) || T.category.toLowerCase().includes(X);
  }), _ = async (T) => {
    M(!0);
    try {
      const X = await le("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: T.name,
          description: T.description,
          skill_names: T.recommended_skills
        })
      });
      await wt(X.id, "AGENTS.md", T.system_prompt);
      const D = await xt(X.id);
      D.approval_level = T.approval_level, await le(`/agents/${encodeURIComponent(X.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(D)
      }), g.success(`专家「${T.name}」创建成功`), t(), l();
    } catch (X) {
      g.error(X.message || "创建专家失败");
    } finally {
      M(!1);
    }
  };
  return a.createElement(
    a.Fragment,
    null,
    a.createElement(
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
      a.createElement(
        "div",
        { style: { marginBottom: 16 } },
        a.createElement(d, {
          placeholder: "搜索模板名称或类别...",
          value: J,
          onChange: (T) => R(T.target.value),
          allowClear: !0
        })
      ),
      $ ? a.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        a.createElement(k, { size: "large" }),
        a.createElement(
          "div",
          { style: { marginTop: 12, color: "#8c8c8c" } },
          "正在创建专家..."
        )
      ) : a.createElement(
        i,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        J.trim() ? null : a.createElement(
          u,
          { xs: 24, sm: 12 },
          a.createElement(
            r,
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
                  x,
                  { strong: !0, style: { fontSize: 15 } },
                  "从空白模版开始创建"
                ),
                a.createElement(
                  "div",
                  null,
                  a.createElement(
                    o,
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
        ...O.map(
          (T) => a.createElement(
            u,
            { key: T.id, xs: 24, sm: 12 },
            a.createElement(
              r,
              {
                hoverable: !0,
                size: "small",
                onClick: () => _(T),
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
                a.createElement(De, {
                  name: T.name,
                  size: 40
                }),
                a.createElement(
                  "div",
                  { style: { flex: 1 } },
                  a.createElement(
                    x,
                    { strong: !0, style: { fontSize: 15 } },
                    T.name
                  ),
                  a.createElement(
                    "div",
                    null,
                    a.createElement(
                      o,
                      { color: "blue", style: { fontSize: 10 } },
                      T.category
                    ),
                    T.approval_level === "MANUAL" ? a.createElement(
                      o,
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
                Xt(T.description, a)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    a.createElement(xl, {
      open: ee,
      onCancel: () => j(!1),
      onCreate: N
    })
  );
}
function xl({
  open: e,
  onCancel: t,
  onCreate: l
}) {
  const a = I().React, { useState: n, useEffect: s } = a, { Modal: r, Input: o, message: d } = I().antd, [i, u] = n(""), [k, g] = n(""), [S, x] = n(!1);
  return s(() => {
    e && (u(""), g(""), x(!1));
  }, [e]), a.createElement(
    r,
    {
      open: e,
      title: "从空白模版创建专家",
      onCancel: t,
      onOk: () => {
        if (!i.trim()) {
          d.warning("请输入专家名称");
          return;
        }
        x(!0), Promise.resolve(l(i.trim(), k.trim())).finally(() => {
          x(!1);
        });
      },
      okText: "创建",
      cancelText: "取消",
      okButtonProps: { loading: S },
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
      a.createElement(o, {
        placeholder: "输入专家名称",
        value: i,
        onChange: (p) => u(p.target.value),
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
      a.createElement(o.TextArea, {
        placeholder: "简要描述该专家的职责和能力...",
        value: k,
        onChange: (p) => g(p.target.value),
        rows: 3,
        maxLength: 200
      })
    )
  );
}
function Yn({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: l
}) {
  const a = I().React, { useState: n, useEffect: s, useCallback: r } = a, {
    List: o,
    Tag: d,
    Switch: i,
    Button: u,
    Modal: k,
    Input: g,
    Spin: S,
    Empty: x,
    message: p,
    Typography: $
  } = I().antd, { FileTextOutlined: M, PlusOutlined: J, EditOutlined: R, ReloadOutlined: ee } = I().antdIcons || {}, { Text: j } = $, [N, O] = n([]), [_, T] = n(!0), [X, D] = n(
    t || []
  ), [A, E] = n(!1), [b, y] = n(null), [K, G] = n(""), [ae, w] = n(""), [f, v] = n(!1), C = r(async () => {
    T(!0);
    try {
      const B = await Qa(e);
      O(B);
    } catch (B) {
      p.error(B.message || "加载记忆文件失败"), O([]);
    } finally {
      T(!1);
    }
  }, [e]);
  s(() => {
    C();
  }, [C]), s(() => {
    D(t || []);
  }, [t]);
  const oe = async (B, Y) => {
    const re = new Set(X);
    if (Y)
      re.add(B);
    else {
      if (kn.includes(B) && B === "AGENTS.md") {
        p.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      re.delete(B);
    }
    const h = Array.from(re);
    D(h);
    try {
      await xn(e, h), p.success(Y ? "已启用记忆文件" : "已停用记忆文件"), l();
    } catch (ne) {
      p.error(ne.message || "更新失败"), D(t || []);
    }
  }, L = async (B) => {
    try {
      const Y = await le(
        `/workspace/files/${encodeURIComponent(B)}`,
        { headers: { "X-Agent-Id": e } }
      );
      y(B), G(Y.content || ""), E(!0);
    } catch (Y) {
      p.error(Y.message || "读取文件失败");
    }
  }, q = () => {
    y(null), G(""), w(""), E(!0);
  }, ie = async () => {
    const B = b || ae.trim();
    if (!B) {
      p.warning("请输入文件名");
      return;
    }
    const Y = B.endsWith(".md") ? B : `${B}.md`;
    v(!0);
    try {
      if (await wt(e, Y, K), !b && !X.includes(Y)) {
        const re = [...X, Y];
        D(re), await xn(e, re);
      }
      p.success("保存成功"), E(!1), C(), l();
    } catch (re) {
      p.error(re.message || "保存失败");
    } finally {
      v(!1);
    }
  };
  return _ ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(S, { size: "large" })
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
          `记忆文件 (${N.length})`
        ),
        a.createElement(
          j,
          { type: "secondary", style: { fontSize: 12 } },
          `· 已挂载 ${X.length} 个到专家记忆`
        )
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          u,
          {
            size: "small",
            icon: ee ? a.createElement(ee) : void 0,
            onClick: C
          },
          "刷新"
        ),
        a.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: J ? a.createElement(J) : void 0,
            onClick: q
          },
          "新建记忆文件"
        )
      )
    ),
    N.length === 0 ? a.createElement(x, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: x.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(o, {
      dataSource: N,
      renderItem: (B) => {
        const Y = X.includes(B.filename), re = kn.includes(B.filename);
        return a.createElement(
          o.Item,
          {
            actions: [
              a.createElement(
                u,
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
          a.createElement(o.Item.Meta, {
            avatar: a.createElement(M, {
              style: {
                fontSize: 20,
                color: Y ? "#1677ff" : "#bfbfbf"
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
              re ? a.createElement(
                d,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : a.createElement(
                d,
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
          a.createElement(i, {
            checked: Y,
            size: "small",
            onChange: (h) => oe(B.filename, h)
          })
        );
      }
    }),
    // Edit/New file modal
    a.createElement(
      k,
      {
        open: A,
        onCancel: () => E(!1),
        title: b ? `编辑 ${b}` : "新建记忆文件",
        width: 700,
        onOk: ie,
        confirmLoading: f,
        okText: "保存"
      },
      b ? null : a.createElement(
        "div",
        { style: { marginBottom: 12 } },
        a.createElement(g, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: ae,
          onChange: (B) => w(B.target.value),
          addonAfter: ae.endsWith(".md") ? "" : ".md"
        })
      ),
      a.createElement(g.TextArea, {
        value: K,
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
function kl({
  skills: e,
  agentId: t
}) {
  const l = I().React, { useMemo: a } = l, {
    List: n,
    Tag: s,
    Typography: r,
    Empty: o,
    Button: d,
    message: i
  } = I().antd, { ThunderboltOutlined: u, CopyOutlined: k } = I().antdIcons || {}, { Text: g } = r, S = a(() => Gn(e), [e]), x = ($) => {
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
      i.success("已复制到剪贴板");
    });
  };
  return S.length === 0 ? l.createElement(o, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: o.PRESENTED_IMAGE_SIMPLE
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
      u ? l.createElement(u, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      l.createElement(
        g,
        { strong: !0 },
        `推荐提问 (${S.length})`
      ),
      l.createElement(
        g,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    l.createElement(n, {
      dataSource: S,
      renderItem: ($, M) => l.createElement(
        n.Item,
        {
          actions: [
            l.createElement(
              d,
              {
                type: "link",
                size: "small",
                icon: k ? l.createElement(k) : void 0,
                onClick: () => p($)
              },
              "复制"
            )
          ]
        },
        l.createElement(n.Item.Meta, {
          avatar: l.createElement(
            s,
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
              onClick: () => x($)
            },
            $.value
          ),
          description: l.createElement(
            g,
            { type: "secondary", style: { fontSize: 12 } },
            $.label
          )
        })
      )
    })
  );
}
function _l() {
  var ce;
  const e = I().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: s,
    Empty: r,
    Input: o,
    Button: d,
    message: i,
    Row: u,
    Col: k,
    Tabs: g,
    Modal: S,
    Typography: x
  } = I().antd, {
    ReloadOutlined: p,
    PlusOutlined: $,
    SearchOutlined: M,
    TeamOutlined: J,
    UserOutlined: R
  } = I().antdIcons || {}, { Text: ee, Paragraph: j } = x, [N, O] = t([]), [_, T] = t(!0), [X, D] = t(!1), [A, E] = t(null), [b, y] = t(""), [K, G] = t(!1), [ae, w] = t("experts"), [f, v] = t(
    null
  ), [C, oe] = t(""), [L, q] = t(!1), [ie, B] = t(!1), [Y, re] = t(null), [h, ne] = t([]), m = a(async () => {
    T(!0);
    try {
      const H = await Wt(), pe = await Promise.all(
        H.map(async (Ee) => {
          try {
            const [Ce, Ie, $e] = await Promise.all([
              xt(Ee.id).catch(() => null),
              kt(Ee.id).catch(() => []),
              qt(Ee.id).catch(() => [])
            ]);
            return {
              agent: Ee,
              config: Ce,
              skills: Ie,
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
      i.error(H.message || "加载专家列表失败"), O([]);
    } finally {
      T(!1);
    }
  }, []);
  l(() => {
    m();
  }, [m]), l(() => {
    if (Y && ie) {
      const H = N.find(
        (pe) => pe.agent.id === Y.agent.id
      );
      H && H !== Y && re(H);
    }
  }, [N, Y, ie]);
  const te = a(
    async (H) => {
      var Ie;
      const pe = H.coordinatorName || ((Ie = H.members[0]) == null ? void 0 : Ie.name);
      if (!pe) {
        i.error("无法确定协调者专家");
        return;
      }
      const Ee = St(h, pe);
      if (!Ee) {
        i.error(`未找到协调者专家「${pe}」，请先创建该专家`);
        return;
      }
      if (/\{.+?\}/.test(H.taskTemplate)) {
        oe(""), v(H);
        return;
      }
      await P(H, Ee, H.taskTemplate);
    },
    [h, i]
  ), P = a(
    async (H, pe, Ee) => {
      var Ce;
      q(!0);
      try {
        const Ie = Ka(H), $e = Ee ? Ie.replace(H.taskTemplate, Ee) : Ie, We = I();
        We.setSelectedAgent && We.setSelectedAgent(pe), await Xa(pe, $e), i.success(
          `团队任务已发起，协调者：${H.coordinatorName || ((Ce = H.members[0]) == null ? void 0 : Ce.name)}`
        ), v(null), se("/chat");
      } catch (Ie) {
        i.error(Ie.message || "发起团队任务失败");
      } finally {
        q(!1);
      }
    },
    [i]
  ), se = (H) => {
    window.history.pushState({}, "", H), window.dispatchEvent(new PopStateEvent("popstate"));
  }, de = a((H) => {
    E(H), D(!0);
  }, []), he = a((H) => {
    re(H), B(!0);
  }, []), fe = a(
    (H) => {
      if (!H.agent.enabled) {
        i.warning(`专家「${H.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const pe = I();
        pe.setSelectedAgent && pe.setSelectedAgent(H.agent.id);
      } catch (pe) {
        console.warn("[ugsci] Failed to set selected agent:", pe);
      }
      i.success(`已召唤专家「${H.agent.name}」，正在跳转至对话...`), se("/chat");
    },
    [i]
  ), ue = n(() => {
    if (!b.trim()) return N;
    const H = b.toLowerCase();
    return N.filter(
      (pe) => {
        var Ee;
        return pe.agent.name.toLowerCase().includes(H) || ((Ee = pe.agent.description) == null ? void 0 : Ee.toLowerCase().includes(H)) || pe.agent.id.toLowerCase().includes(H) || pe.skills.some((Ce) => Ce.name.toLowerCase().includes(H));
      }
    );
  }, [N, b]), V = N.filter((H) => H.agent.enabled).length, W = N.reduce(
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
          e.createElement(o, {
            placeholder: "搜索专家名称、描述或技能...",
            prefix: M ? e.createElement(M) : void 0,
            value: b,
            onChange: (H) => y(H.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        _ ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(s, { size: "large" })
        ) : ue.length === 0 ? e.createElement(r, {
          description: b ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
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
              e.createElement(Sl, {
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
        J ? e.createElement(J, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(Ya, {
        agents: h,
        onLaunch: te
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(_t, {
      title: "专家",
      subtitle: `共 ${N.length} 位专家（${V} 位启用）· ${W} 个技能 · ${z} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          d,
          {
            icon: p ? e.createElement(p) : void 0,
            onClick: () => {
              at(), m();
            },
            loading: _
          },
          "刷新"
        ),
        e.createElement(
          d,
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
    e.createElement(g, {
      items: F,
      activeKey: ae,
      onChange: (H) => w(H)
    }),
    // Drawer
    e.createElement(wl, {
      expert: A,
      open: X,
      onClose: () => D(!1),
      onRefresh: () => m()
    }),
    // Template Modal
    e.createElement(Cl, {
      open: K,
      onClose: () => G(!1),
      onCreated: () => m()
    }),
    // Config Modal (gear icon)
    e.createElement(bl, {
      expert: Y,
      open: ie,
      onClose: () => B(!1),
      onRefresh: () => m()
    }),
    // Team Launch Modal (for filling placeholders)
    f ? e.createElement(
      S,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(Qt, {
            members: f.members.map((H) => H.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${f.name}`
          )
        ),
        onCancel: () => v(null),
        onOk: () => {
          var Ce;
          const H = f.coordinatorName || ((Ce = f.members[0]) == null ? void 0 : Ce.name), pe = H ? St(h, H) : null;
          if (!pe) {
            i.error("无法找到协调者专家");
            return;
          }
          let Ee = f.taskTemplate;
          C.trim() && (Ee = C.trim()), P(f, pe, Ee);
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
          f.taskTemplate
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
          value: C,
          onChange: (H) => oe(H.target.value),
          rows: 5,
          placeholder: f.taskTemplate,
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
          `协调者: ${f.coordinatorName || ((ce = f.members[0]) == null ? void 0 : ce.name) || "—"} · 成员: ${f.members.map((H) => H.name).join("、")}`
        )
      )
    ) : null
  );
}
const Qn = [
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
], Tl = {
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
function Xe(e) {
  return (e || "").trim() || "channel";
}
function et(e) {
  return (e || "").trim();
}
function Zn(e) {
  const t = et(e);
  return t === "" || t === "*";
}
function Tt(e) {
  return e === "user" ? "user" : "all";
}
function He(e) {
  const t = Tt(e.subject_type);
  return {
    source_type: Xe(e.source_type),
    source_value: et(e.source_value),
    subject_type: t,
    subject_value: t === "all" ? "" : (e.subject_value || "").trim(),
    effect: e.effect
  };
}
function tt(e) {
  return { tool_name: e.tool_name || "*", ...He(e) };
}
function ea(e) {
  return { tool_name: e.tool_name || "*", effect: e.effect };
}
function ta(e) {
  return [...e].map(He).sort(
    (t, l) => t.source_type.localeCompare(l.source_type) || t.source_value.localeCompare(l.source_value) || t.subject_type.localeCompare(l.subject_type) || t.subject_value.localeCompare(l.subject_value)
  );
}
function Ct(e) {
  return [...e].map(tt).sort(
    (t, l) => t.tool_name.localeCompare(l.tool_name) || t.source_type.localeCompare(l.source_type) || t.source_value.localeCompare(l.source_value) || t.subject_type.localeCompare(l.subject_type) || t.subject_value.localeCompare(l.subject_value)
  );
}
function na(e) {
  return [...e].map(ea).sort((t, l) => t.tool_name.localeCompare(l.tool_name));
}
function Fe(e) {
  return {
    default_effect: e.default_effect || "deny",
    client_overrides: ta(e.client_overrides || []),
    tool_defaults: na(e.tool_defaults || []),
    tool_overrides: Ct(e.tool_overrides || []),
    unmanaged_rules_count: e.unmanaged_rules_count || 0
  };
}
function Ue(e) {
  return [Xe(e.source_type), et(e.source_value), Tt(e.subject_type), e.subject_type === "all" ? "" : (e.subject_value || "").trim()].join("\0");
}
function Ne(e) {
  return [e.tool_name || "*", Xe(e.source_type), et(e.source_value), Tt(e.subject_type), e.subject_type === "all" ? "" : (e.subject_value || "").trim()].join("\0");
}
function zl(e, t) {
  const l = Fe(t), a = /* @__PURE__ */ new Map();
  l.tool_overrides.forEach((i) => {
    const u = tt(i), k = a.get(u.tool_name) || [];
    k.push(u), a.set(u.tool_name, k);
  });
  const n = new Map(l.tool_defaults.map((i) => [i.tool_name, ea(i)])), s = new Set(e.map((i) => i.name)), r = e.map((i) => {
    var u;
    return {
      toolName: i.name,
      description: i.description,
      inputSchema: i.input_schema,
      stale: !1,
      defaultEffect: ((u = n.get(i.name)) == null ? void 0 : u.effect) || l.default_effect,
      hasExplicitDefault: n.has(i.name),
      rules: Ct(a.get(i.name) || [])
    };
  }), o = /* @__PURE__ */ new Set([...a.keys(), ...n.keys()]), d = Array.from(o).filter((i) => i !== "*" && !s.has(i)).map((i) => {
    var u;
    return {
      toolName: i,
      description: "",
      inputSchema: {},
      stale: !0,
      defaultEffect: ((u = n.get(i)) == null ? void 0 : u.effect) || l.default_effect,
      hasExplicitDefault: n.has(i),
      rules: Ct(a.get(i) || [])
    };
  });
  return [...r, ...d];
}
function aa(e, t) {
  const l = Fe(e), a = new Set(
    t === null ? l.client_overrides.map((n) => Ue(He(n))) : l.tool_overrides.filter((n) => n.tool_name === t).map((n) => Ne(tt(n)))
  );
  for (const n of Qn) {
    const s = t === null ? Ue({ source_type: "channel", source_value: n, subject_type: "all", subject_value: "" }) : Ne({ tool_name: t, source_type: "channel", source_value: n, subject_type: "all", subject_value: "" });
    if (!a.has(s)) return n;
  }
  return "console";
}
function Il(e) {
  return Ut(e, { source_type: "channel", source_value: aa(e, null), subject_type: "all", subject_value: "", effect: "ask" });
}
function Pl(e, t) {
  return Nt(e, { tool_name: t, source_type: "channel", source_value: aa(e, t), subject_type: "all", subject_value: "", effect: "ask" });
}
function Ut(e, t, l) {
  const a = Fe(e), n = He(t), s = Ue(l || n), r = Ue(n), o = a.client_overrides.filter((d) => {
    const i = Ue(He(d));
    return i !== s && i !== r;
  });
  return o.push(n), { ...a, client_overrides: ta(o) };
}
function Nt(e, t, l) {
  const a = Fe(e), n = tt(t), s = Ne(l || n), r = Ne(n), o = a.tool_overrides.filter((d) => {
    const i = Ne(tt(d));
    return i !== s && i !== r;
  });
  return o.push(n), { ...a, tool_overrides: Ct(o) };
}
function Ol(e, t, l) {
  const a = Fe(e), n = a.tool_defaults.filter((s) => s.tool_name !== t);
  return n.push({ tool_name: t, effect: l }), { ...a, tool_defaults: na(n) };
}
function Al(e, t) {
  const l = Fe(e), a = Ue(t);
  return { ...l, client_overrides: l.client_overrides.filter((n) => Ue(He(n)) !== a) };
}
function $l(e, t) {
  const l = Fe(e), a = Ne(t);
  return { ...l, tool_overrides: l.tool_overrides.filter((n) => Ne(tt(n)) !== a) };
}
function la(e, t) {
  const l = Xe(t.source_type), a = et(t.source_value);
  if (Zn(a)) return [];
  const n = /* @__PURE__ */ new Map();
  return e.forEach((s) => {
    if (Xe(s.source_type) !== l || et(s.source_value) !== a) return;
    const r = (s.subject_value || "").trim();
    !r || n.has(r) || n.set(r, s);
  }), Array.from(n.values());
}
function Ml(e, t) {
  return la(e, t).map((l) => ({ label: l.subject_value, value: l.subject_value }));
}
function Yt(e) {
  return Xe(e.source_type) === "channel" && Zn(e.source_value) && Tt(e.subject_type) === "user" && !!(e.subject_value || "").trim();
}
function Rl(e, t) {
  const l = He(t);
  return l.subject_type === "user" && !!l.subject_value && l.subject_value !== "*" && e.some((a) => Xe(a.source_type) === l.source_type) && !Yt(l) && !la(e, l).some((a) => a.subject_value === l.subject_value);
}
function Ll(e) {
  const t = [...e.client_overrides || [], ...e.tool_overrides || []];
  for (const l of t) {
    const a = He(l);
    if (a.subject_type === "user") {
      if (!a.subject_value || a.subject_value === "*" || !a.source_value) return { reason: "missingUserValue", rule: l };
      if (Yt(a)) return { reason: "ambiguousUserSource", rule: l };
    }
  }
  return null;
}
function Tn(e, t) {
  const l = { ...e, ...t };
  return t.subject_type && (l.subject_value = ""), (t.source_type !== void 0 || t.source_value !== void 0) && t.subject_value === void 0 && l.subject_type === "user" && (l.subject_value = ""), l;
}
function Lt(e) {
  return JSON.stringify(Fe(e));
}
function jl({
  client: e,
  agentId: t,
  open: l,
  onClose: a,
  onSave: n
}) {
  const s = I().React, { useState: r, useEffect: o, useMemo: d, useCallback: i } = s, { Modal: u, Spin: k, Empty: g, Button: S, Tag: x, Segmented: p, Select: $, Input: M, AutoComplete: J, Typography: R, message: ee } = I().antd, { PlusOutlined: j, DeleteOutlined: N } = I().antdIcons || {}, { Text: O } = R, [_, T] = r(null), [X, D] = r([]), [A, E] = r([]), [b, y] = r(!1), [K, G] = r(!1), [ae, w] = r(""), [f, v] = r("");
  o(() => {
    if (!l) return;
    let m = !1;
    return (async () => {
      y(!0), D([]), E([]), w("");
      try {
        const P = await ja(t, e.key);
        if (!m) {
          const se = Fe(P);
          T(se), v(Lt(se));
        }
        try {
          const se = await Ua(t);
          m || E(se);
        } catch {
          m || E([]);
        }
        if (!e.enabled) {
          m || w("MCP 客户端未启用，无法获取工具列表");
          return;
        }
        try {
          const se = await La(t, e.key);
          m || D(se);
        } catch (se) {
          m || w((se == null ? void 0 : se.message) || "无法加载工具列表");
        }
      } catch {
        m || (T(null), v(""), w("加载访问策略失败"));
      } finally {
        m || y(!1);
      }
    })(), () => {
      m = !0;
    };
  }, [l, e.key, e.enabled, t]);
  const C = d(() => _ ? zl(X, _) : [], [X, _]), oe = d(() => !!(_ && Lt(_) !== f), [_, f]), L = (m) => Tl[m] || m, q = i((m) => {
    T((te) => te && { ...te, default_effect: m });
  }, []), ie = i((m, te) => {
    T((P) => P && Ut(P, Tn(m, te), { source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
  }, []), B = i((m, te) => {
    T((P) => P && Nt(P, Tn(m, te), { tool_name: m.tool_name, source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
  }, []), Y = i(async () => {
    if (!_) return;
    const m = Ll(_);
    if (m) {
      ee.error(m.reason === "missingUserValue" ? "用户规则缺少用户标识" : "用户来源不明确");
      return;
    }
    G(!0);
    try {
      await n(e.key, _) && (v(Lt(_)), a());
    } finally {
      G(!1);
    }
  }, [_, e.key, n, a, ee]), re = i(() => {
    if (!oe || K) {
      a();
      return;
    }
    u.confirm({
      title: "放弃修改",
      content: "确定要放弃未保存的修改吗？",
      okText: "确认",
      cancelText: "取消",
      onOk: a
    });
  }, [oe, K, a]), h = i((m, te) => {
    const P = Ml(A, m), se = Yt(m), de = Rl(A, m), he = [{ label: "所有渠道", value: "*" }, ...Qn.map((F) => ({ label: L(F), value: F }))], fe = [{ label: "所有人", value: "all" }, { label: "指定用户", value: "user" }], ue = te ? B : ie, V = (F) => {
      T(te ? (ce) => ce && Nt(ce, { ...m, effect: F }) : (ce) => ce && Ut(ce, { ...m, effect: F }));
    }, W = () => {
      T(te ? (F) => F && $l(F, { tool_name: m.tool_name, source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }) : (F) => F && Al(F, { source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
    }, z = te ? Ne(m) : Ue(m);
    return s.createElement(
      "div",
      { key: z, style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto", gap: 6, alignItems: "end", padding: "6px 0", borderBottom: "1px solid #f5f5f5" } },
      // source_type
      s.createElement(
        "div",
        null,
        s.createElement(O, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源类型"),
        s.createElement($, {
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
        m.source_type === "channel" ? s.createElement($, { size: "small", style: { width: "100%" }, value: m.source_value || "*", onChange: (F) => ue(m, { source_value: F }), options: he }) : s.createElement(M, { size: "small", placeholder: "来源标识", value: m.source_value, onChange: (F) => ue(m, { source_value: F.target.value }) })
      ),
      // subject_type
      s.createElement(
        "div",
        null,
        s.createElement(O, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "对象类型"),
        s.createElement($, { size: "small", style: { width: "100%" }, value: m.subject_type, onChange: (F) => ue(m, { subject_type: F }), options: fe })
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
            options: P,
            placeholder: P.length > 0 ? "用户 ID" : "无近期用户",
            onChange: (F) => ue(m, { subject_value: F }),
            onSelect: (F) => ue(m, { subject_value: F }),
            filterOption: (F, ce) => String((ce == null ? void 0 : ce.value) || "").toLowerCase().includes(F.toLowerCase())
          }),
          se ? s.createElement(O, { style: { fontSize: 10, color: "#fa8c16", display: "block" } }, "请先选择具体渠道") : null,
          de ? s.createElement(O, { style: { fontSize: 10, color: "#fa8c16", display: "block" } }, "未知的用户标识") : null
        ) : s.createElement(M, { size: "small", disabled: !0, value: "所有人" })
      ),
      // effect
      s.createElement(
        "div",
        null,
        s.createElement(O, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "效果"),
        s.createElement($, {
          size: "small",
          style: { width: "100%" },
          value: m.effect,
          onChange: (F) => V(F),
          options: [{ label: "允许", value: "allow" }, { label: "询问", value: "ask" }, { label: "拒绝", value: "deny" }]
        })
      ),
      // delete
      s.createElement(S, { size: "small", type: "text", icon: s.createElement(N), onClick: W, title: "删除规则" })
    );
  }, [A, ie, B]), ne = (m, te) => {
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
      open: l,
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
        s.createElement(S, { onClick: re, style: { marginRight: 8 } }, "取消"),
        s.createElement(S, { type: "primary", onClick: Y, loading: K, disabled: !_ || b }, "保存")
      )
    },
    b && !_ ? s.createElement("div", { style: { textAlign: "center", padding: 40 } }, s.createElement(k)) : _ ? s.createElement(
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
            ne(_.default_effect, q),
            s.createElement(S, { size: "small", icon: s.createElement(j), onClick: () => T((m) => m && Il(m)) }, "添加规则")
          )
        ),
        _.client_overrides.length === 0 ? s.createElement(O, { style: { fontSize: 12, color: "#999" } }, "暂无客户端级覆盖规则") : s.createElement("div", null, ..._.client_overrides.map((m) => h(m, !1)))
      ),
      // ── Error message ──
      ae ? s.createElement("div", { style: { color: "#ff4d4f", fontSize: 12, marginBottom: 8 } }, ae) : null,
      // ── Tool-level panel ──
      s.createElement(O, { strong: !0, style: { display: "block", marginBottom: 8 } }, "工具访问策略"),
      C.length === 0 ? s.createElement(g, { description: "暂无工具" }) : s.createElement(
        "div",
        null,
        ...C.map(
          (m) => s.createElement(
            "div",
            { key: m.toolName, style: { marginBottom: 12, padding: "10px 12px", background: "#fafafa", borderRadius: 6, border: "1px solid #f0f0f0" } },
            s.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 } },
              s.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 6 } },
                s.createElement(x, { color: m.stale ? "default" : "blue" }, m.toolName),
                m.stale ? s.createElement(x, { color: "orange" }, "已失效") : null
              ),
              s.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                s.createElement(O, { style: { fontSize: 12, color: "#666" } }, "默认:"),
                ne(m.defaultEffect, (te) => T((P) => P && Ol(P, m.toolName, te))),
                s.createElement(S, { size: "small", icon: s.createElement(j), onClick: () => T((te) => te && Pl(te, m.toolName)) }, "添加规则")
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
            m.rules.length === 0 ? s.createElement(O, { style: { fontSize: 12, color: "#999" } }, "暂无工具级覆盖规则") : s.createElement("div", null, ...m.rules.map((te) => h(te, !0)))
          )
        )
      )
    ) : s.createElement("div", { style: { color: "#ff4d4f" } }, "加载访问策略失败")
  );
}
function Bl({
  client: e,
  agentId: t,
  open: l,
  onClose: a,
  onAuthChanged: n
}) {
  var G, ae, w, f, v;
  const s = I().React, { useState: r, useCallback: o, useEffect: d } = s, { Modal: i, Button: u, Input: k, Typography: g, message: S } = I().antd, { Text: x } = g, [p, $] = r("idle"), [M, J] = r(""), [R, ee] = r(!1), [j, N] = r(((G = e.oauth_status) == null ? void 0 : G.client_id) || ""), [O, _] = r(((ae = e.oauth_status) == null ? void 0 : ae.scope) || ""), [T, X] = r(""), [D, A] = r("");
  d(() => {
    if (p !== "waiting") return;
    const C = setInterval(async () => {
      try {
        (await Da(t, e.key)).authorized && ($("success"), n());
      } catch {
      }
    }, 2e3);
    return () => clearInterval(C);
  }, [p, e.key, t, n]);
  const E = p === "success" || p === "idle" && ((w = e.oauth_status) == null ? void 0 : w.authorized) === !0, b = p === "idle" && ((f = e.oauth_status) == null ? void 0 : f.authorized) && e.oauth_status.expires_at > 0 && e.oauth_status.expires_at < Date.now() / 1e3, y = o(async () => {
    var C;
    if (!((C = e.url) != null && C.trim())) {
      J("缺少 URL");
      return;
    }
    $("starting"), J("");
    try {
      const oe = await Na(t, e.key, {
        url: e.url,
        scope: O,
        client_id: j,
        auth_endpoint: T,
        token_endpoint: D
      });
      $("waiting"), window.open(oe.auth_url, "_blank", "popup,width=600,height=700");
    } catch (oe) {
      $("error"), J((oe == null ? void 0 : oe.message) || "OAuth 启动失败");
    }
  }, [t, e.key, e.url, O, j, T, D]), K = o(async () => {
    $("revoking");
    try {
      await Fa(t, e.key), $("idle"), n();
    } catch {
      $("idle");
    }
  }, [t, e.key, n]);
  return s.createElement(
    i,
    {
      title: `${e.name || e.key} — OAuth 授权管理`,
      open: l,
      onCancel: a,
      footer: s.createElement("div", { style: { textAlign: "right" } }, s.createElement(u, { onClick: a }, "关闭")),
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
          { style: { fontSize: 12, padding: "2px 8px", borderRadius: 12, border: "1px solid", color: b ? "#e67e22" : E ? "#27ae60" : "#7f8c8d", borderColor: b ? "#e67e22" : E ? "#27ae60" : "#7f8c8d", background: "white" } },
          b ? "已过期" : E ? "已授权" : p === "waiting" ? "等待授权..." : p === "error" ? "授权失败" : "未授权"
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          E || b ? s.createElement(u, { size: "small", onClick: K, loading: p === "revoking" }, "撤销") : null,
          s.createElement(u, { size: "small", type: E && !b ? "default" : "primary", onClick: y, loading: p === "starting" || p === "waiting", disabled: !((v = e.url) != null && v.trim()) }, E && !b ? "重新授权" : "授权")
        )
      ),
      M ? s.createElement("p", { style: { color: "#c0392b", fontSize: 12 } }, M) : null,
      // Advanced
      s.createElement(
        "div",
        { style: { marginTop: 8, cursor: "pointer", color: "#888", fontSize: 12 }, onClick: () => ee((C) => !C) },
        R ? "收起高级设置" : "展开高级设置"
      ),
      R ? s.createElement(
        "div",
        { style: { marginTop: 8, padding: "10px 12px", background: "white", borderRadius: 6, border: "1px solid #e9ecef" } },
        s.createElement(x, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2 } }, "Client ID"),
        s.createElement(k, { size: "small", placeholder: "留空则使用动态注册", value: j, onChange: (C) => N(C.target.value) }),
        s.createElement(x, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "Scope"),
        s.createElement(k, { size: "small", placeholder: "OAuth scope", value: O, onChange: (C) => _(C.target.value) }),
        s.createElement(x, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "授权端点"),
        s.createElement(k, { size: "small", placeholder: "https://auth.example.com/authorize", value: T, onChange: (C) => X(C.target.value) }),
        s.createElement(x, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "令牌端点"),
        s.createElement(k, { size: "small", placeholder: "https://auth.example.com/token", value: D, onChange: (C) => A(C.target.value) })
      ) : null
    )
  );
}
function Ul({
  mcp: e,
  agentId: t,
  onToggle: l,
  onDelete: a,
  onUpdate: n,
  onUpdatePolicy: s,
  onRefresh: r
}) {
  const o = I().React, { useState: d } = o, { Card: i, Tag: u, Tooltip: k, Modal: g, Input: S, Button: x, Typography: p } = I().antd, { Text: $ } = p, {
    EyeOutlined: M,
    EyeInvisibleOutlined: J,
    DeleteOutlined: R,
    ToolOutlined: ee
  } = I().antdIcons || {}, [j, N] = d(!1), [O, _] = d(!1), [T, X] = d(!1), [D, A] = d(""), [E, b] = d(!1), [y, K] = d(!1), G = e.transport === "streamable_http" || e.transport === "sse", ae = G ? "Remote" : "Local", w = e.oauth_status, f = Date.now() / 1e3, v = !!(w != null && w.authorized) && w.expires_at > f, C = !!(w != null && w.authorized) && w.expires_at <= f, oe = !!w, L = () => {
    A(JSON.stringify(e, null, 2)), b(!1), N(!0);
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
      ], re = {};
      for (const ne of Y)
        ne in B && (re[ne] = B[ne]);
      await n(e.key, re) && (N(!1), b(!1));
    } catch {
      alert("JSON 格式错误");
    }
  }, ie = JSON.stringify(e, null, 2);
  return o.createElement(
    o.Fragment,
    null,
    o.createElement(
      i,
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
      o.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 } },
        o.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0 } },
          o.createElement(
            k,
            { title: e.name },
            o.createElement($, { strong: !0, style: { fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, e.name || e.key)
          ),
          o.createElement(
            "span",
            { style: { fontSize: 10, padding: "1px 6px", borderRadius: 4, background: G ? "#e6f4ff" : "#f9f0ff", color: G ? "#1677ff" : "#722ed1", flexShrink: 0 } },
            ae
          ),
          // OAuth status icons
          oe && C ? o.createElement("span", { style: { fontSize: 11, color: "#e67e22", flexShrink: 0 } }, "⚠") : null,
          oe && v ? o.createElement("span", { style: { fontSize: 11, color: "#27ae60", flexShrink: 0 } }, "✓") : null,
          oe && !v && !C ? o.createElement("span", { style: { fontSize: 11, color: "#7f8c8d", flexShrink: 0 } }, "🔒") : null
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
          x,
          {
            size: "small",
            icon: ee ? o.createElement(ee) : void 0,
            onClick: (B) => {
              B.stopPropagation(), X(!0);
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
            x,
            {
              size: "small",
              onClick: (B) => {
                B.stopPropagation(), K(!0);
              },
              style: {
                color: v ? "#27ae60" : C ? "#e67e22" : void 0,
                borderColor: v ? "#27ae60" : C ? "#e67e22" : void 0,
                background: v ? "rgba(39,174,96,0.06)" : C ? "rgba(230,126,34,0.06)" : void 0
              }
            },
            v ? "已授权" : C ? "已过期" : "授权"
          ) : null,
          o.createElement(
            x,
            {
              size: "small",
              icon: e.enabled ? J ? o.createElement(J) : void 0 : M ? o.createElement(M) : void 0,
              onClick: l
            },
            e.enabled ? "禁用" : "启用"
          ),
          o.createElement(
            x,
            {
              size: "small",
              danger: !0,
              icon: R ? o.createElement(R) : void 0,
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
    o.createElement(
      g,
      {
        title: "确认删除",
        open: O,
        onOk: () => {
          _(!1), a();
        },
        onCancel: () => _(!1),
        okText: "确认删除",
        cancelText: "取消",
        okButtonProps: { danger: !0 }
      },
      o.createElement("p", null, `确定要删除 MCP 客户端「${e.name || e.key}」吗？此操作不可撤销。`)
    ),
    // ── JSON Config Modal (click card to view/edit) ──
    o.createElement(
      g,
      {
        title: `${e.name || e.key} - 配置`,
        open: j,
        onCancel: () => {
          N(!1), b(!1);
        },
        footer: o.createElement(
          "div",
          { style: { textAlign: "right" } },
          o.createElement(x, { onClick: () => {
            N(!1), b(!1);
          }, style: { marginRight: 8 } }, "取消"),
          E ? o.createElement(x, { type: "primary", onClick: q }, "保存") : o.createElement(x, { type: "primary", onClick: () => b(!0) }, "编辑")
        ),
        width: 700
      },
      o.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "密钥类字段（如 API_KEY）可能已被后端脱敏，保存时不会覆盖脱敏值。"
      ),
      E ? o.createElement(S.TextArea, {
        value: D,
        onChange: (B) => A(B.target.value),
        autoSize: { minRows: 15, maxRows: 25 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      }) : o.createElement(
        "pre",
        { style: { backgroundColor: "#f5f5f5", padding: 16, borderRadius: 8, maxHeight: 400, overflow: "auto", fontSize: 13, fontFamily: "Monaco, Courier New, monospace" } },
        ie
      )
    ),
    // ── Access Modal (tools + access policy) ──
    o.createElement(jl, {
      client: e,
      agentId: t,
      open: T,
      onClose: () => X(!1),
      onSave: s
    }),
    // ── OAuth Modal (remote clients only) ──
    G ? o.createElement(Bl, {
      client: e,
      agentId: t,
      open: y,
      onClose: () => K(!1),
      onAuthChanged: async () => {
        await (r == null ? void 0 : r());
      }
    }) : null
  );
}
const Dt = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, sa = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, oa = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function ra(e) {
  return nt(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
function zn(e) {
  return nt(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function In(e) {
  const t = e.map(encodeURIComponent).join(",");
  return nt(`/ugsci/avatar/team/${t}`);
}
function De({
  name: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const a = I().React, [n, s] = a.useState(0), r = n === 0 ? zn(e) : `${zn(e)}?_r=${n}`;
  return a.createElement("img", {
    src: r,
    alt: e,
    onError: () => {
      n < 1 && s(n + 1);
    },
    style: { width: t, height: t, borderRadius: l, objectFit: "cover", flexShrink: 0 }
  });
}
function Qt({
  members: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const a = I().React, [n, s] = a.useState(0);
  if (!e || e.length === 0)
    return a.createElement("span", {
      style: { width: t, height: t, display: "inline-block" }
    });
  const r = e.slice(0, 5), o = n === 0 ? In(r) : `${In(r)}?_r=${n}`;
  return a.createElement("img", {
    src: o,
    alt: "team",
    onError: () => {
      n < 1 && s(n + 1);
    },
    style: { width: t, height: t, borderRadius: l, objectFit: "cover", flexShrink: 0 }
  });
}
async function Nl() {
  return le("/ugsci/engines/list");
}
async function Dl(e) {
  return le("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function Fl(e, t) {
  return le(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function Gl(e) {
  return le(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function Hl() {
  return le("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function Wl({
  engine: e,
  onClick: t
}) {
  const l = I().React, { Card: a, Tag: n, Typography: s } = I().antd, { Text: r } = s, o = e.status === "detected", d = sa[e.category] || "📦", u = oa.has(e.id) ? l.createElement("img", {
    src: ra(e.id),
    alt: e.name,
    style: { width: 24, height: 24, objectFit: "contain" }
  }) : l.createElement("span", { style: { fontSize: 20 } }, d);
  return l.createElement(
    a,
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
        u,
        l.createElement(
          "div",
          null,
          l.createElement(
            r,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          l.createElement("br"),
          l.createElement(
            r,
            { type: "secondary", style: { fontSize: 11 } },
            e.vendor || "—"
          )
        )
      ),
      l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" } },
        o ? l.createElement(
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
        r,
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
        Dt[e.category] || e.category
      ) : null,
      e.version ? l.createElement(
        n,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (k) => l.createElement(
          n,
          { key: k, color: "cyan", style: { fontSize: 10 } },
          k
        )
      )
    )
  );
}
function Jl() {
  const e = I().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: s,
    Empty: r,
    Button: o,
    message: d,
    Row: i,
    Col: u,
    Drawer: k,
    Descriptions: g,
    Tag: S,
    Typography: x,
    Modal: p,
    Input: $,
    Select: M,
    Popconfirm: J,
    Space: R
  } = I().antd, {
    ReloadOutlined: ee,
    SearchOutlined: j,
    PlusOutlined: N,
    EditOutlined: O,
    DeleteOutlined: _,
    CopyOutlined: T,
    ExperimentOutlined: X
  } = I().antdIcons || {}, { Text: D, Paragraph: A } = x, [E, b] = t([]), [y, K] = t(!0), [G, ae] = t(""), [w, f] = t(!1), [v, C] = t(null), [oe, L] = t(!1), [q, ie] = t(null), [B, Y] = t({}), [re, h] = t(!1), ne = a(async () => {
    K(!0);
    try {
      const V = await Nl();
      b(V.engines || []);
    } catch (V) {
      d.error(V.message || "加载引擎列表失败"), b([]);
    } finally {
      K(!1);
    }
  }, []);
  l(() => {
    ne();
  }, [ne]);
  const m = n(() => {
    if (!G.trim()) return E;
    const V = G.toLowerCase();
    return E.filter(
      (W) => {
        var z;
        return W.name.toLowerCase().includes(V) || W.vendor.toLowerCase().includes(V) || W.category.toLowerCase().includes(V) || ((z = W.description) == null ? void 0 : z.toLowerCase().includes(V));
      }
    );
  }, [E, G]);
  E.filter((V) => V.status === "detected").length;
  const te = a((V) => {
    navigator.clipboard.writeText(V).then(() => d.success("路径已复制")).catch(() => d.error("复制失败"));
  }, []), P = a(() => {
    ie(null), Y({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), L(!0);
  }, []), se = a((V) => {
    ie(V), Y({ ...V }), L(!0), f(!1);
  }, []), de = a(async () => {
    var V;
    if (!((V = B.name) != null && V.trim())) {
      d.warning("请输入引擎名称");
      return;
    }
    h(!0);
    try {
      q ? (await Fl(q.id, B), d.success("引擎已更新")) : (await Dl(B), d.success("引擎已添加")), L(!1), ne();
    } catch (W) {
      d.error(W.message || "保存失败");
    } finally {
      h(!1);
    }
  }, [B, q, ne]), he = a(
    async (V) => {
      try {
        await Gl(V), d.success("引擎已删除"), f(!1), ne();
      } catch (W) {
        d.error(W.message || "删除失败");
      }
    },
    [ne]
  ), fe = a(async () => {
    K(!0);
    try {
      const V = await Hl();
      b(V.engines || []), d.success("自动检测完成");
    } catch (V) {
      d.error(V.message || "检测失败");
    } finally {
      K(!1);
    }
  }, []), ue = a(
    (V, W, z) => {
      const F = B[W] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          D,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          V
        ),
        z != null && z.select ? e.createElement(M, {
          value: F || void 0,
          onChange: (ce) => Y((H) => ({ ...H, [W]: ce })),
          style: { width: "100%" },
          options: z.select.options,
          allowClear: !0,
          placeholder: `选择${V}`
        }) : z != null && z.textarea ? e.createElement($.TextArea, {
          value: F,
          onChange: (ce) => Y((H) => ({ ...H, [W]: ce.target.value })),
          rows: 3,
          placeholder: `输入${V}`
        }) : e.createElement($, {
          value: F,
          onChange: (ce) => Y((H) => ({ ...H, [W]: ce.target.value })),
          placeholder: `输入${V}`
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
        onChange: (V) => ae(V.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        o,
        {
          icon: ee ? e.createElement(ee) : void 0,
          onClick: fe,
          loading: y
        },
        "自动检测"
      ),
      e.createElement(
        o,
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
    y ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(s, {
        size: "large",
        tip: "正在加载计算引擎..."
      })
    ) : m.length === 0 ? e.createElement(r, {
      description: G ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      i,
      { gutter: [12, 12], align: "stretch" },
      ...m.map(
        (V) => e.createElement(
          u,
          {
            key: V.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Wl, {
            engine: V,
            onClick: () => {
              C(V), f(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    v ? e.createElement(
      k,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            oa.has(v.id) ? e.createElement("img", {
              src: ra(v.id),
              alt: v.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              sa[v.category] || "📦"
            )
          ),
          e.createElement("span", null, v.name)
        ),
        open: w,
        onClose: () => f(!1),
        width: 520,
        extra: e.createElement(
          R,
          null,
          e.createElement(
            o,
            {
              size: "small",
              icon: O ? e.createElement(O) : void 0,
              onClick: () => se(v)
            },
            "编辑"
          ),
          v.is_default ? null : e.createElement(
            J,
            {
              title: "确认删除此引擎？",
              description: v.name,
              onConfirm: () => he(v.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              o,
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
        g,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          g.Item,
          { label: "引擎名称" },
          v.name
        ),
        e.createElement(
          g.Item,
          { label: "厂商" },
          v.vendor || "—"
        ),
        e.createElement(
          g.Item,
          { label: "分类" },
          v.category ? Dt[v.category] || v.category : "—"
        ),
        e.createElement(
          g.Item,
          { label: "状态" },
          e.createElement(
            S,
            {
              color: v.status === "detected" ? "success" : v.status === "not_found" ? "error" : "default"
            },
            v.status === "detected" ? "✅ 已检测" : v.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          g.Item,
          { label: "版本" },
          v.version || "—"
        ),
        v.executable_path ? e.createElement(
          g.Item,
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
              v.executable_path
            ),
            e.createElement(
              o,
              {
                size: "small",
                type: "text",
                icon: T ? e.createElement(T) : void 0,
                onClick: () => te(v.executable_path)
              }
            )
          )
        ) : null,
        v.install_dir ? e.createElement(
          g.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            v.install_dir
          )
        ) : null,
        // Display detected modules with paths
        v.modules && v.modules.length > 0 ? e.createElement(
          g.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...v.modules.map(
              (V) => e.createElement(
                "div",
                {
                  key: V,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  S,
                  { color: "cyan", style: { fontSize: 11 } },
                  V
                ),
                v.module_paths && v.module_paths[V] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  v.module_paths[V]
                ) : null
              )
            )
          )
        ) : null,
        v.license_server ? e.createElement(
          g.Item,
          { label: "许可证服务器" },
          v.license_server
        ) : null,
        e.createElement(
          g.Item,
          { label: "描述" },
          v.description || "—"
        )
      ),
      // Invocation hint
      v.invocation_hint ? e.createElement(
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
          v.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        v.is_default ? e.createElement(
          S,
          { color: "blue" },
          "默认引擎"
        ) : v.is_custom ? e.createElement(
          S,
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
        open: oe,
        onOk: de,
        onCancel: () => L(!1),
        okText: q ? "保存" : "添加",
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
            options: Object.entries(Dt).map(([V, W]) => ({
              label: W,
              value: V
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
function Xl() {
  const e = I().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: s,
    Empty: r,
    Input: o,
    Button: d,
    message: i,
    Row: u,
    Col: k,
    Tabs: g,
    Modal: S
  } = I().antd, {
    ReloadOutlined: x,
    PlusOutlined: p,
    SearchOutlined: $,
    ApiOutlined: M,
    RocketOutlined: J
  } = I().antdIcons || {}, { TextArea: R } = o, j = I().useSelectedAgent, N = j ? j() : null, O = (N == null ? void 0 : N.id) || "default", [_, T] = t([]), [X, D] = t(!0), [A, E] = t(""), [b, y] = t("mcp"), [K, G] = t(!1), [ae, w] = t(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [f, v] = t(!1), C = a(async () => {
    D(!0);
    try {
      const m = await Oa(O);
      T(m);
    } catch (m) {
      i.error(m.message || "加载 MCP 列表失败"), T([]);
    } finally {
      D(!1);
    }
  }, [O]);
  l(() => {
    C();
  }, [C]);
  const oe = a(
    async (m) => {
      try {
        await Aa(O, m.key), i.success(m.enabled ? "已禁用" : "已启用"), C();
      } catch (te) {
        i.error(te.message || "切换状态失败");
      }
    },
    [O, C]
  ), L = a(async (m) => {
    try {
      await $a(O, m.key), i.success(`MCP「${m.key}」已删除`), C();
    } catch (te) {
      i.error(te.message || "删除失败");
    }
  }, [O, C]), q = a(async () => {
    v(!0);
    try {
      const m = JSON.parse(ae), te = m.mcpServers || m, P = Object.entries(te);
      if (P.length === 0) {
        i.warning("未找到 MCP 客户端配置");
        return;
      }
      let se = !0;
      for (const [de, he] of P) {
        const fe = he, ue = fe.url ? "streamable_http" : "stdio", V = {
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
          await Ma(
            O,
            de,
            V
          );
        } catch {
          se = !1;
        }
      }
      se && (i.success("MCP 客户端已创建"), G(!1), C());
    } catch (m) {
      m instanceof SyntaxError ? i.error("JSON 格式错误：" + m.message) : i.error(m.message || "创建 MCP 失败");
    } finally {
      v(!1);
    }
  }, [ae, O, C]), ie = n(() => {
    if (!A.trim()) return _;
    const m = A.toLowerCase();
    return _.filter(
      (te) => {
        var P;
        return te.name.toLowerCase().includes(m) || te.key.toLowerCase().includes(m) || ((P = te.description) == null ? void 0 : P.toLowerCase().includes(m)) || te.transport.toLowerCase().includes(m);
      }
    );
  }, [_, A]), B = _.filter((m) => m.enabled).length, Y = _.reduce((m, te) => {
    var P;
    return m + (((P = te.tools) == null ? void 0 : P.length) || 0);
  }, 0), re = (m) => {
    window.history.pushState({}, "", m), window.dispatchEvent(new PopStateEvent("popstate"));
  }, h = e.createElement(
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
        prefix: $ ? e.createElement($) : void 0,
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
          style: Re
        },
        "添加 MCP"
      ),
      e.createElement(
        d,
        {
          icon: M ? e.createElement(M) : void 0,
          onClick: () => re("/mcp")
        },
        "前往 MCP 管理"
      )
    ),
    X ? e.createElement(
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
          k,
          {
            key: m.key,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Ul, {
            mcp: m,
            agentId: O,
            onToggle: (te) => {
              te.stopPropagation(), oe(m);
            },
            onDelete: () => {
              L(m);
            },
            onUpdate: async (te, P) => {
              try {
                return await Ra(O, te, P), i.success("MCP 配置已更新"), C(), !0;
              } catch (se) {
                return i.error(se.message || "更新 MCP 失败"), !1;
              }
            },
            onUpdatePolicy: async (te, P) => {
              try {
                return await Ba(O, te, P), i.success("访问策略已保存"), C(), !0;
              } catch (se) {
                return i.error(se.message || "保存访问策略失败"), !1;
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
      children: h
    },
    {
      key: "software",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        J ? e.createElement(J, { style: { fontSize: 14 } }) : null,
        "计算引擎"
      ),
      children: e.createElement(Jl)
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
          d,
          {
            icon: x ? e.createElement(x) : void 0,
            onClick: () => {
              at(), C();
            },
            loading: X
          },
          "刷新"
        )
      )
    }),
    e.createElement(g, {
      items: ne,
      activeKey: b,
      onChange: (m) => y(m)
    }),
    // ── Create MCP Modal (mirror console /mcp JSON import) ──
    e.createElement(
      S,
      {
        title: "添加 MCP 客户端 (JSON)",
        open: K,
        onCancel: () => G(!1),
        onOk: q,
        confirmLoading: f,
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
        onChange: (m) => w(m.target.value),
        autoSize: { minRows: 12, maxRows: 20 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      })
    )
  );
}
function Kl({
  agentId: e,
  agentName: t,
  onNavigate: l
}) {
  const a = I().React, { useState: n, useEffect: s, useCallback: r } = a, {
    Spin: o,
    Empty: d,
    Button: i,
    Row: u,
    Col: k,
    Card: g,
    Tag: S,
    Checkbox: x,
    Modal: p,
    Typography: $,
    Drawer: M,
    Descriptions: J,
    message: R
  } = I().antd, {
    ReloadOutlined: ee,
    ThunderboltOutlined: j,
    SettingOutlined: N,
    CheckSquareOutlined: O,
    EyeOutlined: _,
    EyeInvisibleOutlined: T,
    DeleteOutlined: X,
    CloseOutlined: D
  } = I().antdIcons || {}, { Text: A, Paragraph: E } = $, [b, y] = n([]), [K, G] = n(!0), [ae, w] = n(!1), [f, v] = n(null), [C, oe] = n(!1), [L, q] = n(
    /* @__PURE__ */ new Set()
  ), [ie, B] = n(!1), [Y, re] = n(null), [h, ne] = n(!1), m = r(async () => {
    if (e) {
      G(!0);
      try {
        const z = await kt(e);
        y(z);
      } catch (z) {
        R.error(z.message || "加载技能失败"), y([]);
      } finally {
        G(!1);
      }
    }
  }, [e]);
  s(() => {
    m();
  }, [m]);
  const te = (z) => {
    q((F) => {
      const ce = new Set(F);
      return ce.has(z) ? ce.delete(z) : ce.add(z), ce;
    });
  }, P = () => q(/* @__PURE__ */ new Set()), se = () => q(new Set(b.map((z) => z.name))), de = () => {
    C ? (P(), oe(!1)) : oe(!0);
  }, he = async () => {
    const z = Array.from(L);
    if (z.length !== 0) {
      B(!0);
      try {
        const { results: F } = await Za(e, z), ce = Object.entries(F).filter(
          ([, pe]) => pe.success === !1
        ), H = z.length - ce.length;
        ce.length > 0 ? R.warning(
          `批量启用完成：成功 ${H} 个，失败 ${ce.length} 个`
        ) : R.success(`成功启用 ${z.length} 个技能`), P(), await m();
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
        const { results: F } = await el(e, z), ce = Object.entries(F).filter(
          ([, pe]) => pe.success === !1
        ), H = z.length - ce.length;
        ce.length > 0 ? R.warning(
          `批量停用完成：成功 ${H} 个，失败 ${ce.length} 个`
        ) : R.success(`成功停用 ${z.length} 个技能`), P(), await m();
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
          const { results: F } = await tl(e, z), ce = Object.entries(F).filter(
            ([, pe]) => pe.success === !1
          ), H = z.length - ce.length;
          ce.length > 0 ? R.warning(
            `批量删除完成：成功 ${H} 个，失败 ${ce.length} 个`
          ) : R.success(`成功删除 ${z.length} 个技能`), P(), await m();
        } catch (F) {
          R.error(F.message || "批量删除失败");
        } finally {
          B(!1);
        }
      }
    });
  }, V = async (z) => {
    ne(!0);
    try {
      z.enabled === !1 ? (await Hn(e, z.name), R.success(`已启用技能「${z.name}」`)) : (await Jn(e, z.name), R.success(`已禁用技能「${z.name}」`)), await m();
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
          await Vt(e, z.name), R.success(`已删除技能「${z.name}」`), await m();
        } catch (F) {
          R.error(F.message || "删除失败");
        } finally {
          ne(!1);
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
        A,
        { type: "secondary", style: { fontSize: 13 } },
        C ? `已选择 ${L.size} / ${b.length} 个技能` : `共 ${b.length} 个技能`
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        C ? a.createElement(
          a.Fragment,
          null,
          a.createElement(
            i,
            { size: "small", onClick: se },
            "全选"
          ),
          a.createElement(
            i,
            {
              size: "small",
              icon: D ? a.createElement(D) : void 0,
              onClick: P
            },
            "取消选择"
          ),
          a.createElement(
            i,
            {
              size: "small",
              type: "default",
              icon: _ ? a.createElement(_) : void 0,
              disabled: L.size === 0 || ie,
              loading: ie,
              onClick: he
            },
            "批量启用"
          ),
          a.createElement(
            i,
            {
              size: "small",
              danger: !0,
              icon: T ? a.createElement(T) : void 0,
              disabled: L.size === 0 || ie,
              loading: ie,
              onClick: fe
            },
            "批量停用"
          ),
          a.createElement(
            i,
            {
              size: "small",
              danger: !0,
              icon: X ? a.createElement(X) : void 0,
              disabled: L.size === 0 || ie,
              loading: ie,
              onClick: ue
            },
            `删除 (${L.size})`
          ),
          a.createElement(
            i,
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
            i,
            {
              size: "small",
              icon: O ? a.createElement(O) : void 0,
              onClick: de,
              disabled: b.length === 0
            },
            "批量管理"
          ),
          a.createElement(
            i,
            {
              icon: ee ? a.createElement(ee) : void 0,
              onClick: () => {
                at(), m();
              }
            },
            "刷新"
          )
        )
      )
    ),
    K ? a.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      a.createElement(o, { size: "large" })
    ) : b.length === 0 ? a.createElement(d, {
      description: "当前智能体未加载任何技能"
    }) : a.createElement(
      u,
      { gutter: [12, 12] },
      ...b.map(
        (z) => a.createElement(
          k,
          { key: z.name, xs: 24, sm: 12, md: 8, lg: 6 },
          a.createElement(
            g,
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
                C ? te(z.name) : (v(z), w(!0));
              },
              onMouseEnter: () => {
                C || re(z.name);
              },
              onMouseLeave: () => re(null)
            },
            C ? a.createElement(
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
              a.createElement(x, {
                checked: L.has(z.name)
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
              z.emoji ? a.createElement(
                "span",
                { style: { fontSize: 18 } },
                z.emoji
              ) : a.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              a.createElement(
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
              z.enabled === !1 ? a.createElement(
                S,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : a.createElement(
                S,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            z.description ? a.createElement(
              E,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              z.description
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
              z.version_text ? a.createElement(
                S,
                { style: { fontSize: 10 } },
                `v${z.version_text}`
              ) : null,
              ...(z.tags || []).slice(0, 3).map(
                (F, ce) => a.createElement(
                  S,
                  { key: ce, color: "blue", style: { fontSize: 10 } },
                  F
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !C && Y === z.name ? a.createElement(
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
                i,
                {
                  size: "small",
                  type: "default",
                  icon: z.enabled === !1 ? _ ? a.createElement(_) : void 0 : T ? a.createElement(T) : void 0,
                  disabled: h,
                  onClick: (F) => {
                    F.stopPropagation(), V(z);
                  }
                },
                z.enabled === !1 ? "启用" : "禁用"
              ),
              a.createElement(
                i,
                {
                  size: "small",
                  danger: !0,
                  icon: X ? a.createElement(X) : void 0,
                  disabled: h,
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
    f ? a.createElement(
      M,
      {
        title: a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          a.createElement(
            "span",
            { style: { fontSize: 18 } },
            f.emoji || "⚡"
          ),
          a.createElement("span", null, f.name)
        ),
        open: ae,
        onClose: () => w(!1),
        width: 520,
        extra: a.createElement(
          i,
          {
            type: "primary",
            size: "small",
            icon: N ? a.createElement(N) : void 0,
            onClick: () => l("/skills")
          },
          "管理技能"
        )
      },
      a.createElement(
        J,
        { column: 1, bordered: !0, size: "small" },
        a.createElement(
          J.Item,
          { label: "技能名称" },
          f.name
        ),
        a.createElement(
          J.Item,
          { label: "描述" },
          f.description || "-"
        ),
        f.version_text ? a.createElement(
          J.Item,
          { label: "版本" },
          f.version_text
        ) : null,
        a.createElement(
          J.Item,
          { label: "来源" },
          f.source || "-"
        ),
        a.createElement(
          J.Item,
          { label: "状态" },
          f.enabled === !1 ? "已禁用" : "已启用"
        ),
        f.installed_from ? a.createElement(
          J.Item,
          { label: "安装来源" },
          f.installed_from
        ) : null
      ),
      // Tags
      f.tags && f.tags.length > 0 ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          A,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        a.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...f.tags.map(
            (z, F) => a.createElement(S, { key: F, color: "blue" }, z)
          )
        )
      ) : null,
      // Skill content preview
      f.content ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          A,
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
          f.content.slice(0, 2e3) + (f.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Vl({
  poolSkills: e,
  workspaceSkills: t,
  agents: l,
  loading: a,
  onReload: n,
  agentId: s,
  agentName: r
}) {
  const o = I().React, { useState: d, useMemo: i, useCallback: u } = o, {
    Spin: k,
    Empty: g,
    Input: S,
    Button: x,
    Row: p,
    Col: $,
    Card: M,
    Tag: J,
    Typography: R,
    Drawer: ee,
    Descriptions: j,
    List: N,
    Modal: O,
    message: _
  } = I().antd, {
    ReloadOutlined: T,
    SearchOutlined: X,
    DownloadOutlined: D,
    ThunderboltOutlined: A,
    DeleteOutlined: E,
    PlusOutlined: b
  } = I().antdIcons || {}, { Text: y, Paragraph: K } = R, [G, ae] = d(""), [w, f] = d(!1), [v, C] = d(null), [oe, L] = d([]), [q, ie] = d(!1), [B, Y] = d(24), [re, h] = d(null), [ne, m] = d(!1), te = i(() => {
    if (!G.trim()) return e;
    const W = G.toLowerCase();
    return e.filter(
      (z) => {
        var F, ce;
        return z.name.toLowerCase().includes(W) || ((F = z.description) == null ? void 0 : F.toLowerCase().includes(W)) || ((ce = z.tags) == null ? void 0 : ce.some((H) => H.toLowerCase().includes(W)));
      }
    );
  }, [e, G]), P = i(
    () => te.slice(0, B),
    [te, B]
  ), se = u((W) => {
    ae(W), Y(24);
  }, []), de = u(
    (W) => {
      const z = [];
      for (const F of t)
        if (F.skills.some((ce) => ce.name === W)) {
          const ce = l.find((H) => H.id === F.agent_id);
          z.push((ce == null ? void 0 : ce.name) || F.agent_name || F.agent_id);
        }
      return z;
    },
    [t, l]
  ), he = u(
    async (W) => {
      if (C(W), L(de(W.name)), f(!0), !W.content) {
        ie(!0);
        try {
          const z = await Ia(W.name);
          C({ ...W, content: z });
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
      await Kt(s, W.name), _.success(
        `已将技能「${W.name}」加载到当前专家「${r}」`
      ), n();
    } catch (z) {
      _.error(z.message || "加载技能失败");
    } finally {
      m(!1);
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
        m(!0);
        try {
          await al(W.name), _.success(`已从技能池删除「${W.name}」`), n();
        } catch (z) {
          _.error(z.message || "删除失败");
        } finally {
          m(!1);
        }
      }
    });
  }, V = (W) => {
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
      o.createElement(S, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: X ? o.createElement(X) : void 0,
        value: G,
        onChange: (W) => se(W.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      o.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        o.createElement(
          x,
          {
            icon: T ? o.createElement(T) : void 0,
            onClick: n,
            loading: a,
            size: "small"
          },
          "刷新"
        ),
        o.createElement(
          x,
          {
            type: "primary",
            icon: D ? o.createElement(D) : void 0,
            onClick: () => V("/skill-pool"),
            size: "small",
            style: Re
          },
          "管理技能池"
        )
      )
    ),
    a ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      o.createElement(k, { size: "large" })
    ) : te.length === 0 ? o.createElement(g, {
      description: G ? "未找到匹配的技能" : "技能池为空"
    }) : o.createElement(
      o.Fragment,
      null,
      o.createElement(
        p,
        { gutter: [12, 12] },
        ...P.map(
          (W) => o.createElement(
            $,
            { key: W.name, xs: 24, sm: 12, md: 8, lg: 6 },
            o.createElement(
              M,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => he(W),
                onMouseEnter: () => h(W.name),
                onMouseLeave: () => h(null)
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
                  W.name
                ),
                W.protected ? o.createElement(
                  J,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              W.description ? o.createElement(
                K,
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
                  (z, F) => o.createElement(
                    J,
                    { key: F, color: "cyan", style: { fontSize: 10 } },
                    z
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
                  x,
                  {
                    size: "small",
                    type: "primary",
                    icon: b ? o.createElement(b) : void 0,
                    disabled: ne,
                    onClick: (z) => {
                      z.stopPropagation(), fe(W);
                    }
                  },
                  "加载到当前Agent"
                ),
                o.createElement(
                  x,
                  {
                    size: "small",
                    danger: !0,
                    icon: E ? o.createElement(E) : void 0,
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
        P.length < te.length ? o.createElement(
          "div",
          { style: { textAlign: "center", marginTop: 16 } },
          o.createElement(
            x,
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
    v ? o.createElement(
      ee,
      {
        title: o.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          o.createElement(
            "span",
            { style: { fontSize: 18 } },
            v.emoji || "⚡"
          ),
          o.createElement("span", null, v.name)
        ),
        open: w,
        onClose: () => f(!1),
        width: 520,
        extra: o.createElement(
          x,
          {
            type: "primary",
            size: "small",
            icon: A ? o.createElement(A) : void 0,
            onClick: () => V("/skills")
          },
          "管理技能"
        )
      },
      o.createElement(
        j,
        { column: 1, bordered: !0, size: "small" },
        o.createElement(
          j.Item,
          { label: "技能名称" },
          v.name
        ),
        o.createElement(
          j.Item,
          { label: "描述" },
          v.description || "-"
        ),
        v.version_text ? o.createElement(
          j.Item,
          { label: "版本" },
          v.version_text
        ) : null,
        o.createElement(
          j.Item,
          { label: "来源" },
          v.source || "-"
        ),
        o.createElement(
          j.Item,
          { label: "受保护" },
          v.protected ? "是（内置）" : "否"
        ),
        v.sync_status ? o.createElement(
          j.Item,
          { label: "同步状态" },
          v.sync_status
        ) : null,
        v.installed_from ? o.createElement(
          j.Item,
          { label: "安装来源" },
          v.installed_from
        ) : null
      ),
      // Tags
      v.tags && v.tags.length > 0 ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          y,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        o.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...v.tags.map(
            (W, z) => o.createElement(J, { key: z, color: "cyan" }, W)
          )
        )
      ) : null,
      // Installed agents
      o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          y,
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
              o.createElement(De, { name: W, size: 20 }),
              o.createElement(
                y,
                { style: { fontSize: 13 } },
                W
              )
            )
          )
        }) : o.createElement(
          y,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      q ? o.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        o.createElement(k, { size: "small" })
      ) : v.content ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          y,
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
          v.content.slice(0, 2e3) + (v.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function ql() {
  const e = I().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, { Tabs: s, message: r } = I().antd, { ThunderboltOutlined: o, AppstoreOutlined: d } = I().antdIcons || {}, u = I().useSelectedAgent, k = u ? u() : null, g = (k == null ? void 0 : k.id) || "default", [S, x] = t([]), [p, $] = t([]), [M, J] = t([]), [R, ee] = t(!0), [j, N] = t("agent-skills"), O = a(async () => {
    ee(!0);
    try {
      const [D, A, E] = await Promise.all([
        Jt(!0),
        Wt(),
        Pa()
      ]);
      $(D), x(A), J(E);
    } catch (D) {
      r.error(D.message || "加载技能列表失败"), $([]);
    } finally {
      ee(!1);
    }
  }, []);
  l(() => {
    O();
  }, [O]);
  const _ = n(() => {
    const D = S.find((A) => A.id === g);
    return (D == null ? void 0 : D.name) || g;
  }, [S, g]), T = (D) => {
    window.history.pushState({}, "", D), window.dispatchEvent(new PopStateEvent("popstate"));
  }, X = [
    {
      key: "agent-skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        o ? e.createElement(o, { style: { fontSize: 14 } }) : null,
        "当前Agent加载技能"
      ),
      children: e.createElement(Kl, {
        agentId: g,
        agentName: _,
        onNavigate: T
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
      children: e.createElement(Vl, {
        poolSkills: p,
        workspaceSkills: M,
        agents: S,
        loading: R,
        onReload: O,
        agentId: g,
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
    e.createElement(s, {
      items: X,
      activeKey: j,
      onChange: (D) => N(D)
    })
  );
}
const Ft = "ugsci.market.githubSources", Pn = "https://github.com/anthropics/skills/tree/main/skills", Yl = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", On = `${Yl}/skills`;
function je(e) {
  const t = e.replace(/^\/+/, "");
  return nt(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
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
function Ql(e) {
  var i, u;
  const t = {};
  if (e.env && e.env.length > 0)
    for (const k of e.env)
      t[k] = `your-${k.toLowerCase().replace(/_/g, "-")}`;
  const a = (e.transport || "stdio").replace(/-/g, "_");
  let n = "🔌";
  const s = (e.icon || "").toLowerCase();
  s.includes("folder") ? n = "📁" : s.includes("git") ? n = "🌿" : s.includes("github") ? n = "🐙" : s.includes("database") || s.includes("postgres") || s.includes("sqlite") ? n = "🗄️" : s.includes("search") || s.includes("brave") ? n = "🔍" : s.includes("browser") || s.includes("puppeteer") ? n = "🎭" : s.includes("memory") || s.includes("brain") ? n = "🧠" : s.includes("file") || s.includes("fetch") ? n = "🌐" : s.includes("slack") ? n = "💬" : s.includes("google") ? n = "📁" : s.includes("notion") ? n = "📝" : s.includes("jupyter") ? n = "📊" : s.includes("science") || s.includes("flask") ? n = "🔬" : s.includes("book") || s.includes("arxiv") ? n = "📚" : s.includes("patent") && (n = "📜");
  const r = e.config, o = e.config_url || (r == null ? void 0 : r.url) || "", d = e.config_headers || (r == null ? void 0 : r.headers) || {};
  return {
    id: e.id,
    name: e.name,
    emoji: n,
    iconUrl: e.icon_url ? je(e.icon_url) : void 0,
    category: e.category ? zt(e.category) : "",
    description: e.description,
    transport: a,
    command: ((i = e.config) == null ? void 0 : i.command) || "",
    args: ((u = e.config) == null ? void 0 : u.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0,
    url: o,
    headers: Object.keys(d).length > 0 ? d : void 0
  };
}
const ia = "ugsci.market.mcpSources", ca = "ugsci.market.expertSources";
function ma(e, t) {
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
function da(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function An() {
  return ma(ia, "mcp");
}
function ht(e) {
  da(ia, e);
}
function $n() {
  return ma(ca, "expert");
}
function Et(e) {
  da(ca, e);
}
function ua(e) {
  try {
    const t = new URL(e.trim()), l = t.hostname.toLowerCase();
    let a;
    if (l === "github.com" || l === "www.github.com")
      a = "github";
    else if (l === "gitee.com" || l === "www.gitee.com")
      a = "gitee";
    else
      return null;
    const n = t.pathname.split("/").filter((i) => i.length > 0);
    if (n.length < 2) return null;
    const s = decodeURIComponent(n[0]), r = decodeURIComponent(n[1]);
    let o = "main", d = "";
    return n.length >= 4 && (n[2] === "tree" || n[2] === "blob") ? (o = decodeURIComponent(n[3]), n.length > 4 && (d = n.slice(4).map(decodeURIComponent).join("/"))) : n.length > 2 && (d = n.slice(2).map(decodeURIComponent).join("/")), d = d.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: s,
      repo: r,
      ref: o || "main",
      skillsPath: d,
      label: `${s}/${r}`,
      platform: a
    };
  } catch {
    return null;
  }
}
function Gt(e, t, l, a = "github") {
  return a === "oss" ? `oss:${e}/${l || "/"}` : `${a}:${e}/${t}:${l || "/"}`;
}
function pa(e) {
  try {
    const t = new URL(e.trim()), l = t.hostname.toLowerCase(), a = l.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!a) return null;
    const n = a[1], s = `${t.protocol}//${l}`, r = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
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
function Zl() {
  try {
    const e = localStorage.getItem(Ft);
    if (!e) {
      const l = [], a = pa(On);
      a && l.push({
        id: Gt(
          a.endpoint,
          "",
          a.prefix,
          "oss"
        ),
        url: On,
        label: a.label,
        owner: a.endpoint,
        repo: "",
        ref: "",
        skillsPath: a.prefix,
        enabled: !0,
        platform: "oss"
      });
      const n = ua(Pn);
      return n && l.push({
        id: Gt(
          n.owner,
          n.repo,
          n.skillsPath,
          n.platform
        ),
        url: Pn,
        label: n.label,
        owner: n.owner,
        repo: n.repo,
        ref: n.ref,
        skillsPath: n.skillsPath,
        enabled: !0,
        platform: n.platform
      }), localStorage.setItem(Ft, JSON.stringify(l)), l;
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
function vt(e) {
  try {
    localStorage.setItem(
      Ft,
      JSON.stringify(e)
    );
  } catch {
  }
}
function es(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const l = t[1], a = {}, n = l.split(`
`);
  let s = "";
  for (const r of n) {
    const o = r.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (o) {
      s = o[1];
      let d = o[2].trim();
      (d.startsWith('"') && d.endsWith('"') || d.startsWith("'") && d.endsWith("'")) && (d = d.slice(1, -1)), s === "name" ? a.name = d : s === "description" ? a.description = d : s === "version" ? a.version = d : s === "author" && (a.author = d);
    }
  }
  return a;
}
async function ts(e) {
  const t = e.platform === "gitee", l = e.skillsPath ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/") : "", a = t ? `https://gitee.com/api/v5/repos/${e.owner}/${e.repo}/contents/${l}?ref=${encodeURIComponent(e.ref)}` : `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${l}?ref=${encodeURIComponent(e.ref)}`, n = {
    Accept: t ? "application/json" : "application/vnd.github+json"
  };
  t && e.accessToken && (n.Authorization = `token ${e.accessToken}`);
  const s = await fetch(a, {
    headers: n
  });
  if (!s.ok)
    throw new Error(
      `${t ? "Gitee" : "GitHub"} API ${s.status}: ${e.label} (${e.skillsPath || "/"})`
    );
  const r = await s.json();
  if (!Array.isArray(r)) return [];
  const o = r.filter(
    (i) => i.type === "dir" && i.name
  );
  return await Promise.all(
    o.map(async (i) => {
      const u = e.skillsPath ? e.skillsPath + "/" : "", k = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${u}${i.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${u}${i.name}/SKILL.md`, g = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${i.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${i.name}`, S = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: i.name,
        description: "",
        source_url: g,
        html_url: g,
        version: null,
        author: null
      };
      try {
        const x = {};
        t && e.accessToken && (x.Authorization = `token ${e.accessToken}`);
        const p = await fetch(k, {
          headers: x
        });
        if (!p.ok) return S;
        const $ = await p.text(), M = es($);
        return {
          ...S,
          name: M.name || i.name,
          description: M.description || "",
          version: M.version || null,
          author: M.author || null
        };
      } catch {
        return S;
      }
    })
  );
}
async function ns(e) {
  const t = pa(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: l, prefix: a } = t, n = a.split("/").map(encodeURIComponent).join("/"), s = je(`${a}/manifest.json`), r = await fetch(s);
  if (!r.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${r.status})`
    );
  const o = await r.json(), d = [];
  function i(u, k) {
    for (const g of u) {
      if (g.type === "collection" && Array.isArray(g.children)) {
        i(g.children, g.name);
        continue;
      }
      const S = g.path || g.name || "";
      if (!S) continue;
      const x = S.split("/").map(encodeURIComponent).join("/"), p = `${l}/${n}/${x}`;
      let $ = null;
      if (g.metadata) {
        const J = g.metadata.match(/version:\s*"?([\d.]+)"?/);
        J && ($ = J[1]);
      }
      const M = k ? `${e.label}/${k}` : e.label;
      d.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: M,
        name: g.name || S.split("/").pop() || S,
        description: g.description || "",
        source_url: p,
        html_url: p,
        version: $,
        author: null,
        tag: g.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(o) ? i(
    o.map(
      (u) => typeof u == "string" ? { name: u, path: u } : u
    )
  ) : o && Array.isArray(o.skills) && i(o.skills), d.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return d;
}
async function as() {
  const e = je("mcp/manifest.json"), t = await fetch(e);
  if (!t.ok)
    throw new Error(`无法获取 MCP 列表: ${t.status}`);
  const l = await t.json(), a = [], n = {};
  if (l.tag_groups && typeof l.tag_groups == "object")
    for (const [r, o] of Object.entries(l.tag_groups))
      Array.isArray(o) && (n[r] = o, a.push({
        id: r,
        label: zt(r),
        tags: o
      }));
  return { servers: (l.servers || []).map((r) => {
    let o = "";
    const d = r.tags || [];
    for (const [i, u] of Object.entries(n))
      if (u.some((k) => d.includes(k))) {
        o = i;
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
  }), categories: a };
}
async function ls() {
  const e = je("agents/manifest.json"), t = await fetch(e);
  if (!t.ok)
    throw new Error(`无法获取 Agent 列表: ${t.status}`);
  const l = await t.json(), a = [], n = {};
  if (l.tag_groups && typeof l.tag_groups == "object")
    for (const [r, o] of Object.entries(l.tag_groups))
      Array.isArray(o) && (n[r] = o, a.push({
        id: r,
        label: zt(r),
        tags: o
      }));
  return { agents: (l.agents || []).map((r) => {
    let o = "";
    const d = r.tags || [];
    for (const [i, u] of Object.entries(n))
      if (u.some((k) => d.includes(k))) {
        o = i;
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
  }), categories: a };
}
async function ss(e) {
  const t = e.filter((s) => s.enabled), l = await Promise.all(
    t.map(async (s) => {
      try {
        return { skills: s.platform === "oss" ? await ns(s) : await ts(s), error: null, label: s.label };
      } catch (r) {
        return {
          skills: [],
          error: r.message || String(r),
          label: s.label
        };
      }
    })
  ), a = [], n = [];
  for (const s of l)
    a.push(...s.skills), s.error && n.push({ label: s.label, message: s.error });
  return { skills: a, errors: n };
}
function os(e) {
  var o;
  const t = {};
  let l = "";
  const a = [], n = {}, s = {}, r = e.split(`
`);
  for (const d of r) {
    if (/^\s*#/.test(d) || /^\s*$/.test(d)) continue;
    const i = ((o = d.match(/^(\s*)/)) == null ? void 0 : o[1].length) || 0, u = d.trim();
    if (l === "args" && i >= 2 && u.startsWith("- ")) {
      a.push(u.slice(2).trim().replace(/^["']|["']$/g, ""));
      continue;
    }
    if ((l === "env" || l === "headers") && i >= 2) {
      const g = u.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
      if (g) {
        let S = g[2].trim().replace(/^["']|["']$/g, "");
        l === "env" ? n[g[1]] = S : s[g[1]] = S;
        continue;
      }
    }
    const k = u.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (k && i === 0) {
      const g = k[1];
      let S = k[2].trim().replace(/^["']|["']$/g, "");
      l = "", S === "" ? g === "args" ? l = "args" : g === "env" ? l = "env" : g === "headers" && (l = "headers") : g === "client_key" || g === "id" ? t.client_key = S : g === "name" ? t.name = S : g === "description" ? t.description = S : g === "transport" ? t.transport = S.replace(/-/g, "_") : g === "command" ? t.command = S : g === "url" ? t.url = S : g === "cwd" && (t.cwd = S);
    }
  }
  return a.length > 0 && (t.args = a), Object.keys(n).length > 0 && (t.env = n), Object.keys(s).length > 0 && (t.headers = s), t.client_key ? t : null;
}
async function rs(e) {
  const t = e.filter((s) => s.enabled && s.url);
  if (t.length === 0) return { servers: [], errors: [] };
  const l = await Promise.all(
    t.map(async (s) => {
      try {
        let r = await fetch(s.url).catch(() => null);
        if (!r || !r.ok) {
          const i = je(s.url.replace(/^https?:\/\/[^/]+\//, ""));
          r = await fetch(i);
        }
        if (!r.ok)
          throw new Error(`HTTP ${r.status}`);
        return { servers: ((await r.json()).servers || []).map((i) => ({
          id: i.id || i.name,
          name: i.name || i.id,
          description: i.description || "",
          tags: i.tags || [],
          transport: i.transport || "stdio",
          config: i.config,
          config_url: i.config_url,
          config_headers: i.config_headers,
          env: Array.isArray(i.env) ? i.env : void 0,
          source: i.source || s.label,
          icon: i.icon,
          icon_url: i.icon_url || i.icon_path || void 0,
          category: ""
        })), error: null };
      } catch (r) {
        return {
          servers: [],
          error: `${s.label}: ${r.message || String(r)}`
        };
      }
    })
  ), a = [], n = [];
  for (const s of l)
    a.push(...s.servers), s.error && n.push(s.error);
  return { servers: a, errors: n };
}
async function is(e) {
  const t = e.filter((s) => s.enabled && s.url);
  if (t.length === 0) return { agents: [], errors: [] };
  const l = await Promise.all(
    t.map(async (s) => {
      try {
        let r = await fetch(s.url).catch(() => null);
        if (!r || !r.ok) {
          const i = je(s.url.replace(/^https?:\/\/[^/]+\//, ""));
          r = await fetch(i);
        }
        if (!r.ok)
          throw new Error(`HTTP ${r.status}`);
        return { agents: ((await r.json()).agents || []).map((i) => ({
          id: i.id || i.name,
          name: i.name || i.id,
          description: i.description || "",
          path: i.path || "",
          tags: i.tags || [],
          config: i.config,
          instructions: i.instructions,
          skills_manifest: i.skills_manifest,
          drivers: i.drivers,
          category: ""
        })), error: null };
      } catch (r) {
        return {
          agents: [],
          error: `${s.label}: ${r.message || String(r)}`
        };
      }
    })
  ), a = [], n = [];
  for (const s of l)
    a.push(...s.agents), s.error && n.push(s.error);
  return { agents: a, errors: n };
}
function cs({
  open: e,
  onClose: t,
  sources: l,
  onChange: a
}) {
  const n = I().React, { useState: s } = n, {
    Modal: r,
    Input: o,
    Button: d,
    List: i,
    Tag: u,
    Switch: k,
    Typography: g,
    Tooltip: S,
    message: x
  } = I().antd, {
    PlusOutlined: p,
    DeleteOutlined: $,
    LinkOutlined: M,
    GithubOutlined: J
  } = I().antdIcons || {}, { Text: R } = g, [ee, j] = s(""), [N, O] = s(""), _ = () => {
    const A = ee.trim();
    if (!A) return;
    const E = ua(A);
    if (!E) {
      x.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const b = Gt(E.owner, E.repo, E.skillsPath, E.platform);
    if (l.some((G) => G.id === b)) {
      x.warning("该源已存在");
      return;
    }
    const y = {
      id: b,
      url: A,
      label: E.label,
      owner: E.owner,
      repo: E.repo,
      ref: E.ref,
      skillsPath: E.skillsPath,
      enabled: !0,
      platform: E.platform,
      accessToken: N.trim() || void 0
    }, K = [...l, y];
    vt(K), a(K), j(""), O(""), x.success(`已添加源: ${E.label}`);
  }, T = (A, E) => {
    const b = l.map(
      (y) => y.id === A ? { ...y, enabled: E } : y
    );
    vt(b), a(b);
  }, X = (A, E) => {
    const b = l.map(
      (y) => y.id === A ? { ...y, accessToken: E.trim() || void 0 } : y
    );
    vt(b), a(b);
  }, D = (A) => {
    const E = l.filter((b) => b.id !== A);
    vt(E), a(E), x.success("已移除源");
  };
  return n.createElement(
    r,
    {
      open: e,
      onCancel: t,
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        J ? n.createElement(J, { style: { fontSize: 18 } }) : null,
        n.createElement("span", null, "配置技能源")
      ),
      footer: n.createElement(
        d,
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
        n.createElement(o, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: ee,
          onChange: (A) => j(A.target.value),
          onPressEnter: _,
          prefix: M ? n.createElement(M) : void 0,
          style: { flex: 1 }
        }),
        n.createElement(
          d,
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
        n.createElement(o.Password, {
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
      n.createElement(R, { strong: !0 }, `已配置源 (${l.length})`)
    ),
    n.createElement(i, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: (A) => n.createElement(
        i.Item,
        {
          actions: [
            n.createElement(
              S,
              { title: A.enabled ? "点击禁用" : "点击启用" },
              n.createElement(k, {
                size: "small",
                checked: A.enabled,
                onChange: (E) => T(A.id, E)
              })
            ),
            n.createElement(
              S,
              { title: "移除此源" },
              n.createElement(
                d,
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
            n.createElement(o.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: A.accessToken || "",
              onChange: (E) => X(A.id, E.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function Mn({
  open: e,
  onClose: t,
  sources: l,
  onChange: a,
  type: n
}) {
  const s = I().React, { useState: r } = s, {
    Modal: o,
    Input: d,
    Button: i,
    List: u,
    Tag: k,
    Switch: g,
    Typography: S,
    Tooltip: x,
    message: p
  } = I().antd, {
    PlusOutlined: $,
    DeleteOutlined: M,
    LinkOutlined: J,
    ApiOutlined: R,
    UserOutlined: ee,
    ImportOutlined: j,
    ExportOutlined: N,
    CopyOutlined: O
  } = I().antdIcons || {}, { Text: _ } = S, [T, X] = r(""), [D, A] = r(""), [E, b] = r(""), [y, K] = r(!1), G = n === "mcp" ? "MCP" : "专家模板", ae = n === "mcp" ? R ? s.createElement(R, { style: { fontSize: 18 } }) : null : ee ? s.createElement(ee, { style: { fontSize: 18 } }) : null, w = () => {
    const L = T.trim(), q = D.trim();
    if (!L) return;
    const ie = q || L.slice(0, 40), B = `${n}:${L}`;
    if (l.some((h) => h.id === B)) {
      p.warning("该源已存在");
      return;
    }
    const Y = {
      id: B,
      label: ie,
      url: L,
      enabled: !0,
      type: n
    }, re = [...l, Y];
    n === "mcp" ? ht(re) : Et(re), a(re), X(""), A(""), p.success(`已添加${G}源: ${ie}`);
  }, f = (L, q) => {
    const ie = l.map(
      (B) => B.id === L ? { ...B, enabled: q } : B
    );
    n === "mcp" ? ht(ie) : Et(ie), a(ie);
  }, v = (L) => {
    const q = l.filter((ie) => ie.id !== L);
    n === "mcp" ? ht(q) : Et(q), a(q), p.success("已移除源");
  }, C = () => {
    const L = JSON.stringify(
      { type: n, sources: l },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(L), p.success(`${G}源已复制到剪贴板（${l.length} 个源）`);
    } catch {
      const q = document.createElement("textarea");
      q.value = L, document.body.appendChild(q), q.select(), document.execCommand("copy"), document.body.removeChild(q), p.success(`${G}源已复制到剪贴板（${l.length} 个源）`);
    }
  }, oe = () => {
    const L = E.trim();
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
      const Y = new Set(l.map((ne) => ne.id)), re = [];
      for (const ne of B) {
        const m = ne.id || `${n}:${ne.url}`;
        Y.has(m) || re.push({
          id: m,
          label: ne.label,
          url: ne.url,
          enabled: ne.enabled !== !1,
          type: n
        });
      }
      if (re.length === 0) {
        p.info("所有源均已存在，无新增");
        return;
      }
      const h = [...l, ...re];
      n === "mcp" ? ht(h) : Et(h), a(h), b(""), K(!1), p.success(`成功导入 ${re.length} 个${G}源`);
    } catch (q) {
      p.error(`JSON 解析失败: ${q.message || "格式错误"}`);
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
            i,
            {
              icon: N ? s.createElement(N) : void 0,
              onClick: C,
              disabled: l.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          s.createElement(
            i,
            {
              icon: j ? s.createElement(j) : void 0,
              onClick: () => K(!y),
              size: "small"
            },
            y ? "隐藏导入" : "导入JSON"
          )
        ),
        s.createElement(
          i,
          { onClick: t },
          "关闭"
        )
      ),
      width: 680
    },
    // Description
    s.createElement(
      _,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${G}源地址，支持从远程仓库或团队共享的 JSON 导入${G}配置。`
    ),
    // Import section (collapsible)
    y ? s.createElement(
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
        _,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${G}源 JSON（支持从导出的剪贴板内容粘贴）`
      ),
      s.createElement(d.TextArea, {
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
        onChange: (L) => b(L.target.value),
        autoSize: { minRows: 4, maxRows: 10 },
        style: { fontFamily: "monospace", fontSize: 12 }
      }),
      s.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8 } },
        s.createElement(
          i,
          {
            type: "primary",
            size: "small",
            onClick: oe
          },
          "导入"
        ),
        s.createElement(
          i,
          {
            size: "small",
            onClick: () => b("")
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
        onChange: (L) => A(L.target.value),
        style: { width: 200 }
      }),
      s.createElement(d, {
        placeholder: n === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: T,
        onChange: (L) => X(L.target.value),
        onPressEnter: w,
        prefix: J ? s.createElement(J) : void 0,
        style: { flex: 1 }
      }),
      s.createElement(
        i,
        {
          type: "primary",
          icon: $ ? s.createElement($) : void 0,
          onClick: w
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
        _,
        { strong: !0 },
        `已配置源 (${l.length})`
      )
    ),
    s.createElement(u, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: (L) => s.createElement(
        u.Item,
        {
          actions: [
            s.createElement(
              x,
              { title: L.enabled ? "点击禁用" : "点击启用" },
              s.createElement(g, {
                size: "small",
                checked: L.enabled,
                onChange: (q) => f(L.id, q)
              })
            ),
            s.createElement(
              x,
              { title: "移除此源" },
              s.createElement(
                i,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: M ? s.createElement(M) : void 0,
                  onClick: () => v(L.id)
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
              k,
              {
                color: n === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              L.label
            ),
            L.enabled ? null : s.createElement(
              k,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          s.createElement(
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
async function ms() {
  return le("/market/providers");
}
async function ds(e) {
  return le(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function us(e, t, l, a, n) {
  return le("/market/search", {
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
function Rn(e) {
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
async function Ln(e, t) {
  const l = { bundle_url: e };
  return t && (l.access_token = t), le("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
function ps() {
  const e = I().React, { useState: t, useEffect: l, useCallback: a, useMemo: n, useRef: s } = e, {
    Spin: r,
    Empty: o,
    Input: d,
    Button: i,
    message: u,
    Row: k,
    Col: g,
    Card: S,
    Tag: x,
    Tooltip: p,
    Typography: $,
    Select: M,
    Drawer: J,
    Descriptions: R,
    Tabs: ee,
    Badge: j,
    Progress: N,
    Modal: O
  } = I().antd, {
    ReloadOutlined: _,
    SearchOutlined: T,
    DownloadOutlined: X,
    AppstoreOutlined: D,
    ShopOutlined: A,
    CheckCircleOutlined: E,
    LoadingOutlined: b,
    UserOutlined: y,
    SettingOutlined: K,
    GithubOutlined: G,
    ApiOutlined: ae
  } = I().antdIcons || {}, { Text: w, Paragraph: f, Title: v } = $, [C, oe] = t("skills"), [L, q] = t([]), [ie, B] = t([]), [Y, re] = t([]), [h, ne] = t(""), [m, te] = t(""), [P, se] = t(!1), [de, he] = t(!1), [fe, ue] = t(
    {}
  ), [V, W] = t(null), [z, F] = t({}), [ce, H] = t([]), [pe, Ee] = t(""), [Ce, Ie] = t(""), [$e, We] = t(""), [ut, lt] = t({}), [Be, st] = t(""), [pt, Ke] = t(/* @__PURE__ */ new Set()), [Pe, ot] = t(null), [Ae, Te] = t({}), [Z, xe] = t([]), [we, Oe] = t([]), [rt, it] = t(!1), [ve, gt] = t(!1), [It, ct] = t([]), [Je, Zt] = t(!1), [ga, en] = t([]), [fa, tn] = t(!1), [nn, an] = t([]), [ln, sn] = t([]), [on, rn] = t(!1), [Ve, cn] = t(""), [mn, dn] = t([]), [un, pn] = t([]), [gn, fn] = t(!1), [qe, yn] = t(""), [Pt, hn] = t(!1), mt = s(null);
  l(() => {
    Promise.all([
      ms().catch(() => []),
      ds("zh").catch(() => []),
      Wt().catch(() => [])
    ]).then(([c, U, Q]) => {
      q(c), B(U), H(Q), Q.length > 0 && (Ee(Q[0].id), st(Q[0].id));
    });
  }, []);
  const ft = a(async (c) => {
    const U = c ?? Zl();
    if (xe(c || U), U.filter((me) => me.enabled).length === 0) {
      Oe([]);
      return;
    }
    it(!0);
    try {
      const { skills: me, errors: ge } = await ss(U);
      if (Oe(me), ge.length > 0) {
        for (const be of ge)
          console.warn(`[ugsci] GitHub source '${be.label}' error: ${be.message}`);
        u.warning(
          `部分源加载失败: ${ge.map((be) => be.label).join(", ")}`
        );
      }
    } catch (me) {
      u.error(me.message || "加载技能源失败"), Oe([]);
    } finally {
      it(!1);
    }
  }, []), dt = a(async (c, U) => {
    var Se, Le;
    rn(!0), fn(!0);
    const Q = c ?? An(), me = U ?? $n(), [ge, be, ye, _e] = await Promise.allSettled([
      as(),
      ls(),
      rs(Q),
      is(me)
    ]);
    if (ge.status === "fulfilled") {
      const ze = ge.value.servers, ke = ye.status === "fulfilled" ? ye.value.servers : [], Mt = new Set(ze.map((Me) => Me.id)), Rt = [
        ...ze,
        ...ke.filter((Me) => !Mt.has(Me.id))
      ];
      if (an(Rt), sn(ge.value.categories), ye.status === "fulfilled" && ye.value.errors.length > 0)
        for (const Me of ye.value.errors)
          console.warn(`[ugsci] Custom MCP source error: ${Me}`);
    } else
      console.warn(`[ugsci] MCP manifest error: ${((Se = ge.reason) == null ? void 0 : Se.message) || ge.reason}`), an([]), sn([]);
    if (rn(!1), be.status === "fulfilled") {
      const ze = be.value.agents, ke = _e.status === "fulfilled" ? _e.value.agents : [], Mt = new Set(ze.map((Me) => Me.id)), Rt = [
        ...ze,
        ...ke.filter((Me) => !Mt.has(Me.id))
      ];
      if (dn(Rt), pn(be.value.categories), _e.status === "fulfilled" && _e.value.errors.length > 0)
        for (const Me of _e.value.errors)
          console.warn(`[ugsci] Custom expert source error: ${Me}`);
    } else
      console.warn(`[ugsci] Agents manifest error: ${((Le = be.reason) == null ? void 0 : Le.message) || be.reason}`), dn([]), pn([]);
    fn(!1);
  }, []);
  l(() => {
    ft(), dt(), ct(An()), en($n());
  }, [ft, dt]);
  const yt = a(
    async (c, U, Q) => {
      se(!0);
      try {
        const me = await us(
          c,
          Q,
          20,
          "zh",
          U || void 0
        );
        Q === void 0 || Object.keys(Q).length === 0 ? re(me.results) : re((ye) => [...ye, ...me.results]);
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
        u.error(me.message || "搜索市场失败"), re([]);
      } finally {
        se(!1);
      }
    },
    []
  );
  l(() => (mt.current && clearTimeout(mt.current), mt.current = setTimeout(() => {
    yt(h, "", {});
  }, 400), () => {
    mt.current && clearTimeout(mt.current);
  }), [h, yt]);
  const ya = () => {
    yt(h, "", fe);
  }, En = async (c) => {
    const U = `${c.source}:${c.slug}`;
    try {
      F((me) => ({ ...me, [U]: "installing" }));
      const Q = await Ln(c.source_url);
      Q.installed ? u.success(
        `技能「${Q.name || c.name}」已安装到技能池，可在技能中心查看`
      ) : u.info(
        `技能「${Q.name || c.name}」已存在于技能池，无需重复安装`
      ), F((me) => {
        const ge = { ...me };
        return delete ge[U], ge;
      });
    } catch (Q) {
      u.error(Rn(Q) || "安装技能失败"), F((me) => {
        const ge = { ...me };
        return delete ge[U], ge;
      });
    }
  }, ha = (c) => {
    window.history.pushState({}, "", c), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Ea = async (c) => {
    const U = `github:${c.sourceId}:${c.name}`, Q = Z.find((ge) => ge.id === c.sourceId), me = (Q == null ? void 0 : Q.accessToken) || void 0;
    try {
      F((be) => ({ ...be, [U]: "installing" }));
      const ge = await Ln(c.source_url, me);
      ge.installed ? u.success(
        `技能「${ge.name || c.name}」已安装到技能池，可在技能中心查看`
      ) : u.info(
        `技能「${ge.name || c.name}」已存在于技能池，无需重复安装`
      ), F((be) => {
        const ye = { ...be };
        return delete ye[U], ye;
      });
    } catch (ge) {
      u.error(Rn(ge) || "安装技能失败"), F((be) => {
        const ye = { ...be };
        return delete ye[U], ye;
      });
    }
  }, vn = n(() => {
    const c = [], U = /* @__PURE__ */ new Set();
    for (const Q of we)
      Q.tag && !U.has(Q.tag) && (U.add(Q.tag), c.push({ id: Q.tag, label: Q.tag }));
    for (const Q of we)
      !Q.isOfficial && Q.sourceLabel && !U.has(Q.sourceLabel) && (U.add(Q.sourceLabel), c.push({ id: Q.sourceLabel, label: Q.sourceLabel }));
    return c;
  }, [we]), Ot = n(() => {
    let c = we;
    if (m && (c = c.filter(
      (U) => U.tag === m || U.sourceLabel === m
    )), h.trim()) {
      const U = h.toLowerCase();
      c = c.filter(
        (Q) => {
          var me;
          return Q.name.toLowerCase().includes(U) || ((me = Q.description) == null ? void 0 : me.toLowerCase().includes(U));
        }
      );
    }
    return c;
  }, [we, h, m]);
  L.filter((c) => c.available);
  const Ye = Y, va = e.createElement(
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
        prefix: T ? e.createElement(T) : void 0,
        value: h,
        onChange: (c) => ne(c.target.value),
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
        i,
        {
          icon: G ? e.createElement(G) : void 0,
          onClick: () => gt(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    vn.length > 0 ? e.createElement(
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
        x,
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
      ...vn.map((c) => {
        const U = we.some(
          (Q) => !Q.isOfficial && Q.sourceLabel === c.id
        );
        return e.createElement(
          x,
          {
            key: c.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: m === c.id ? U ? "blue" : "geekblue" : void 0,
            icon: U && G ? e.createElement(G) : void 0,
            onClick: () => te(
              m === c.id ? "" : c.id
            )
          },
          c.label
        );
      })
    ) : null,
    // GitHub skills section
    rt && we.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      e.createElement(r, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
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
        ...Ot.map((c) => {
          const U = `github:${c.sourceId}:${c.name}`, Q = z[U];
          return e.createElement(
            g,
            { key: U, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              S,
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
                  { title: c.name },
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
                    c.name
                  )
                )
              ),
              e.createElement(
                f,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                c.description || "暂无描述"
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
                  c.sourcePath || c.sourceLabel ? e.createElement(
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
                    c.sourcePath || c.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  c.tag ? e.createElement(
                    x,
                    { color: "geekblue", style: { fontSize: 10 } },
                    c.tag
                  ) : null,
                  c.version ? e.createElement(
                    x,
                    { style: { fontSize: 10 } },
                    `v${c.version}`
                  ) : null
                ),
                Q ? e.createElement(
                  i,
                  {
                    size: "small",
                    disabled: !0,
                    icon: b ? e.createElement(b) : void 0
                  },
                  "安装中"
                ) : e.createElement(
                  i,
                  {
                    type: "primary",
                    size: "small",
                    icon: X ? e.createElement(X) : void 0,
                    onClick: () => Ea(c)
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
    Ye.length > 0 || P ? e.createElement(
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
        `技能市场${Ye.length > 0 ? ` (${Ye.length})` : ""}`
      )
    ) : null,
    // Results grid
    P && Ye.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(r, { size: "large" })
    ) : Ye.length === 0 ? e.createElement(o, {
      description: h ? `未找到匹配「${h}」的技能` : "输入关键词搜索技能市场",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      k,
      { gutter: [12, 12] },
      ...Ye.map((c) => {
        const U = `${c.source}:${c.slug}`, Q = z[U];
        return e.createElement(
          g,
          { key: U, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            S,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => W(c)
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
              c.icon_url ? e.createElement("img", {
                src: c.icon_url,
                alt: c.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : e.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              e.createElement(
                p,
                { title: c.name },
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
                  c.name
                )
              )
            ),
            e.createElement(
              f,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              c.description || "暂无描述"
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
                  x,
                  { color: "geekblue", style: { fontSize: 10 } },
                  c.source
                ),
                c.version ? e.createElement(
                  x,
                  { style: { fontSize: 10 } },
                  `v${c.version}`
                ) : null
              ),
              Q ? e.createElement(
                i,
                {
                  size: "small",
                  disabled: !0,
                  icon: b ? e.createElement(b) : void 0
                },
                "安装中"
              ) : e.createElement(
                i,
                {
                  type: "primary",
                  size: "small",
                  icon: X ? e.createElement(X) : void 0,
                  onClick: (me) => {
                    me.stopPropagation(), En(c);
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
        i,
        { onClick: ya, loading: P },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    V ? e.createElement(
      J,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          V.icon_url ? e.createElement("img", {
            src: V.icon_url,
            alt: V.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, V.name)
        ),
        open: !0,
        onClose: () => W(null),
        width: 480,
        extra: e.createElement(
          i,
          {
            type: "primary",
            icon: X ? e.createElement(X) : void 0,
            onClick: () => {
              En(V);
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
          V.source
        ),
        e.createElement(
          R.Item,
          { label: "描述" },
          V.description || "-"
        ),
        V.version ? e.createElement(
          R.Item,
          { label: "版本" },
          V.version
        ) : null,
        V.author ? e.createElement(
          R.Item,
          { label: "作者" },
          V.author
        ) : null,
        e.createElement(
          R.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: V.source_url, target: "_blank" },
            V.source_url
          )
        )
      ),
      V.stats ? e.createElement(
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
          ...Object.entries(V.stats).map(
            ([c, U]) => e.createElement(
              "div",
              { key: c, style: { textAlign: "center" } },
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
                c
              )
            )
          )
        )
      ) : null
    ) : null
  ), At = n(() => {
    let c = mn;
    if (qe && (c = c.filter((U) => U.category === qe)), Ce.trim()) {
      const U = Ce.toLowerCase();
      c = c.filter(
        (Q) => Q.name.toLowerCase().includes(U) || Q.description.toLowerCase().includes(U) || Q.tags.some((me) => me.toLowerCase().includes(U))
      );
    }
    return c;
  }, [mn, Ce, qe]), ba = async (c) => {
    var Q;
    if (Pt) return;
    hn(!0);
    let U = null;
    try {
      let me = c.description;
      if (c.instructions)
        try {
          const _e = c.instructions.replace(/^\/+/, ""), Se = await fetch(je(_e));
          Se.ok && (me = await Se.text());
        } catch {
        }
      let ge = [];
      if (c.skills_manifest)
        try {
          const _e = c.skills_manifest.replace(/^\/+/, ""), Se = await fetch(je(_e));
          if (Se.ok) {
            const Le = await Se.json();
            Array.isArray(Le) ? ge = Le.map((ze) => typeof ze == "string" ? ze : ze.name).filter(Boolean) : Le.skills && (ge = Le.skills.map((ze) => typeof ze == "string" ? ze : ze.name).filter(Boolean));
          }
        } catch {
        }
      let be = null;
      if (c.config)
        try {
          const _e = c.config.replace(/^\/+/, ""), Se = await fetch(je(_e));
          Se.ok && (be = await Se.json());
        } catch {
        }
      const ye = await le("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: c.name,
          description: c.description,
          skill_names: ge
        })
      });
      if (U = ye.id, await wt(ye.id, "AGENTS.md", me), (Q = c.drivers) != null && Q.mcp && Array.isArray(c.drivers.mcp))
        for (const _e of c.drivers.mcp)
          try {
            const Se = _e.replace(/^\/+/, ""), Le = await fetch(je(Se));
            if (!Le.ok) continue;
            const ze = await Le.text(), ke = os(ze);
            ke && ke.client_key && await Bt(ye.id, {
              client_key: ke.client_key,
              client: {
                name: ke.name || ke.client_key,
                description: ke.description || "",
                enabled: !0,
                transport: ke.transport || "stdio",
                url: ke.url || "",
                command: ke.command || "",
                args: ke.args || [],
                env: ke.env || {},
                cwd: ke.cwd || "",
                headers: ke.headers || {}
              }
            });
          } catch (Se) {
            console.warn(
              `[ugsci] Failed to load MCP driver '${_e}': ${(Se == null ? void 0 : Se.message) || Se}`
            );
          }
      if (be)
        try {
          const Se = { ...await xt(ye.id), ...be };
          Se.name = c.name, Se.description = c.description, await le(`/agents/${encodeURIComponent(ye.id)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Se)
          });
        } catch {
        }
      u.success(`专家「${c.name}」创建成功，已跳转至专家`), ha("/ugsci-experts");
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
      hn(!1);
    }
  }, bn = a(async (c) => {
    if (c)
      try {
        const U = await qt(c);
        Ke(new Set(U.map((Q) => Q.key)));
      } catch {
        Ke(/* @__PURE__ */ new Set());
      }
  }, []);
  l(() => {
    Be && bn(Be);
  }, [Be, bn]);
  const Sa = async (c) => {
    if (!Be) {
      u.warning("请先选择目标专家");
      return;
    }
    if (Ga(c)) {
      const U = Object.entries(c.env), Q = {};
      for (const [me] of U)
        Q[me] = "";
      Te(Q), ot(c);
      return;
    }
    await Sn(c, c.env || {});
  }, Sn = async (c, U) => {
    lt((Q) => ({ ...Q, [c.id]: !0 }));
    try {
      const Q = c.id;
      await Bt(Be, {
        client_key: Q,
        client: {
          name: c.name,
          description: c.description,
          enabled: !0,
          transport: c.transport,
          url: c.url || "",
          command: c.command || "",
          args: c.args || [],
          env: U,
          cwd: c.cwd || "",
          headers: c.headers || {}
        }
      }), u.success(`MCP「${c.name}」已添加到当前专家`), Ke((me) => new Set(me).add(Q));
    } catch (Q) {
      u.error(Q.message || `添加 MCP「${c.name}」失败`);
    } finally {
      lt((Q) => ({ ...Q, [c.id]: !1 }));
    }
  }, wa = async () => {
    if (!Pe) return;
    const c = [];
    for (const [Q, me] of Object.entries(Ae))
      if (!me || !me.trim()) {
        const ge = wn[Q];
        c.push((ge == null ? void 0 : ge.label) || Q);
      }
    if (c.length > 0) {
      u.warning(`请填写以下配置项: ${c.join(", ")}`);
      return;
    }
    const U = Pe;
    ot(null), Te({}), await Sn(U, { ...Ae });
  }, $t = n(() => {
    let c = nn;
    if (Ve && (c = c.filter((U) => U.category === Ve)), $e.trim()) {
      const U = $e.toLowerCase();
      c = c.filter(
        (Q) => Q.name.toLowerCase().includes(U) || Q.description.toLowerCase().includes(U) || Q.tags.some((me) => me.toLowerCase().includes(U))
      );
    }
    return c.map(Ql);
  }, [nn, $e, Ve]), Ca = e.createElement(
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
        prefix: T ? e.createElement(T) : void 0,
        value: $e,
        onChange: (c) => We(c.target.value),
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
          value: Be,
          onChange: (c) => st(c),
          style: { minWidth: 180 },
          size: "small",
          options: ce.map((c) => ({ value: c.id, label: c.name }))
        })
      ),
      // Configure MCP source button
      e.createElement(
        i,
        {
          icon: ae ? e.createElement(ae) : void 0,
          onClick: () => Zt(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    ln.length > 0 ? e.createElement(
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
        x,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Ve === "" ? "blue" : void 0,
          onClick: () => cn("")
        },
        "全部"
      ),
      ...ln.map(
        (c) => e.createElement(
          x,
          {
            key: c.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: Ve === c.id ? "geekblue" : void 0,
            onClick: () => cn(
              Ve === c.id ? "" : c.id
            )
          },
          c.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    on && $t.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(r, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : $t.length === 0 ? e.createElement(o, {
      description: "未找到匹配的 MCP 服务器",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      k,
      { gutter: [12, 12] },
      ...$t.map(
        (c) => e.createElement(
          g,
          { key: c.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            S,
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
                c.iconUrl ? e.createElement("img", {
                  src: c.iconUrl,
                  alt: c.name,
                  style: { width: 28, height: 28, objectFit: "contain" },
                  onError: (U) => {
                    U.target.style.display = "none";
                  }
                }) : c.emoji
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  w,
                  { strong: !0, style: { fontSize: 14 } },
                  c.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  e.createElement(
                    x,
                    { color: "blue", style: { fontSize: 10 } },
                    c.category
                  ),
                  e.createElement(
                    x,
                    {
                      color: c.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    c.transport
                  ),
                  c.env && Object.keys(c.env).length > 0 ? e.createElement(
                    x,
                    { color: "orange", style: { fontSize: 10 } },
                    "需配置密钥"
                  ) : null
                )
              )
            ),
            // Description
            e.createElement(
              f,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              c.description
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
                c.transport === "stdio" ? `${c.command} ${(c.args || []).join(" ")}` : c.url || ""
              ),
              pt.has(c.id) ? e.createElement(
                i,
                { size: "small", disabled: !0 },
                "已安装"
              ) : e.createElement(
                i,
                {
                  type: "primary",
                  size: "small",
                  loading: !!ut[c.id],
                  icon: ae ? e.createElement(ae) : void 0,
                  onClick: () => Sa(c)
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
  ), xa = Pe ? e.createElement(
    O,
    {
      title: e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        e.createElement("span", { style: { fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 } }, Pe.iconUrl ? e.createElement("img", { src: Pe.iconUrl, alt: Pe.name, style: { width: 22, height: 22, objectFit: "contain" }, onError: (c) => {
          c.target.style.display = "none";
        } }) : Pe.emoji),
        e.createElement("span", null, `配置 ${Pe.name} 密钥`)
      ),
      open: !!Pe,
      onCancel: () => {
        ot(null), Te({});
      },
      onOk: wa,
      okText: "安装",
      cancelText: "取消",
      width: 520,
      destroyOnClose: !0
    },
    // Description
    e.createElement(
      w,
      { type: "secondary", style: { display: "block", marginBottom: 16, fontSize: 12 } },
      Pe.description
    ),
    ...Object.entries(Pe.env || {}).map(([c]) => {
      const U = wn[c], Q = (U == null ? void 0 : U.isSecret) !== !1;
      return e.createElement(
        "div",
        { key: c, style: { marginBottom: 16 } },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          e.createElement(
            w,
            { strong: !0, style: { fontSize: 13 } },
            (U == null ? void 0 : U.label) || c
          ),
          e.createElement(
            x,
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
        Q ? e.createElement(d.Password, {
          placeholder: `请输入 ${(U == null ? void 0 : U.label) || c}`,
          value: Ae[c] || "",
          onChange: (me) => Te((ge) => ({
            ...ge,
            [c]: me.target.value
          })),
          style: { width: "100%" }
        }) : e.createElement(d, {
          placeholder: `请输入 ${(U == null ? void 0 : U.label) || c}`,
          value: Ae[c] || "",
          onChange: (me) => Te((ge) => ({
            ...ge,
            [c]: me.target.value
          })),
          style: { width: "100%" }
        }),
        // Show env key name for reference
        e.createElement(
          w,
          { type: "secondary", style: { fontSize: 11, display: "block", marginTop: 2 } },
          `环境变量名: ${c}`
        )
      );
    })
  ) : null, ka = e.createElement(
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
        prefix: T ? e.createElement(T) : void 0,
        value: Ce,
        onChange: (c) => Ie(c.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      e.createElement(
        i,
        {
          icon: y ? e.createElement(y) : void 0,
          onClick: () => tn(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    un.length > 0 ? e.createElement(
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
        x,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: qe === "" ? "blue" : void 0,
          onClick: () => yn("")
        },
        "全部"
      ),
      ...un.map(
        (c) => e.createElement(
          x,
          {
            key: c.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: qe === c.id ? "geekblue" : void 0,
            onClick: () => yn(
              qe === c.id ? "" : c.id
            )
          },
          c.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    gn && At.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(r, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载专家模板..."))
    ) : At.length === 0 ? e.createElement(o, {
      description: "未找到匹配的专家模板",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      k,
      { gutter: [12, 12] },
      ...At.map(
        (c) => e.createElement(
          g,
          { key: c.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            S,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => ba(c)
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
              e.createElement(De, {
                name: c.name,
                size: 40
              }),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  w,
                  { strong: !0, style: { fontSize: 14 } },
                  c.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  c.category ? e.createElement(
                    x,
                    { color: "blue", style: { fontSize: 10 } },
                    zt(c.category)
                  ) : null,
                  c.tags.includes("mcp") ? e.createElement(
                    x,
                    { color: "purple", style: { fontSize: 10 } },
                    "MCP"
                  ) : null
                )
              )
            ),
            e.createElement(
              f,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              c.description
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
                c.tags.filter((U) => U !== "agent" && U !== "template" && U !== "workspace").slice(0, 3).join(" · ") || "专家模板"
              ),
              e.createElement(
                i,
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
  ), _a = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        D ? e.createElement(D, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: va
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        ae ? e.createElement(ae, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: Ca
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        y ? e.createElement(y, { style: { fontSize: 14 } }) : null,
        "专家模板"
      ),
      children: ka
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
          i,
          {
            type: "primary",
            icon: _ ? e.createElement(_) : void 0,
            onClick: () => {
              yt(h, m, {}), ft(), dt();
            },
            loading: P || rt || on || gn
          },
          "刷新"
        )
      )
    }),
    e.createElement(ee, {
      items: _a,
      activeKey: C,
      onChange: (c) => oe(c)
    }),
    // Skill source config modal
    e.createElement(cs, {
      open: ve,
      onClose: () => gt(!1),
      sources: Z,
      onChange: (c) => {
        xe(c), ft(c);
      }
    }),
    // MCP source config modal
    e.createElement(Mn, {
      open: Je,
      onClose: () => Zt(!1),
      sources: It,
      onChange: (c) => {
        ct(c), dt(c, void 0);
      },
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    xa,
    // Expert source config modal
    e.createElement(Mn, {
      open: fa,
      onClose: () => tn(!1),
      sources: ga,
      onChange: (c) => {
        en(c), dt(void 0, c);
      },
      type: "expert"
    })
  );
}
function gs() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const jn = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, Bn = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function fs() {
  const e = I(), t = e.React, { useEffect: l, useRef: a } = t, n = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, s = (n == null ? void 0 : n.id) || "default", r = a(null), o = a(null);
  return l(() => {
    if (r.current === s) return;
    r.current = s;
    const d = gs(), i = jn[d] || jn.en, u = Bn[d] || Bn.en;
    let k = !1;
    return (async () => {
      var g, S;
      try {
        const x = await kt(s);
        if (k) return;
        const p = Gn(x);
        if (o.current) {
          try {
            o.current();
          } catch {
          }
          o.current = null;
        }
        const $ = window.QwenPaw;
        (g = $ == null ? void 0 : $.chat) != null && g.welcome && (p.length > 0 ? (o.current = $.chat.welcome.set("ugsci", {
          description: i,
          prompts: p
        }), console.info(
          `[ugsci] Injected ${p.length} welcome prompts for agent "${s}"`
        )) : (o.current = $.chat.welcome.set("ugsci", {
          description: i,
          prompts: [u]
        }), console.info(
          `[ugsci] No skills for agent "${s}" — using default prompt`
        )));
      } catch (x) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${s}":`,
          x
        );
        const p = window.QwenPaw;
        if ((S = p == null ? void 0 : p.chat) != null && S.welcome && !k) {
          if (o.current) {
            try {
              o.current();
            } catch {
            }
            o.current = null;
          }
          o.current = p.chat.welcome.set("ugsci", {
            description: i,
            prompts: [u]
          });
        }
      }
    })(), () => {
      k = !0;
    };
  }, [s]), null;
}
function ys() {
  var i, u, k;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = I().React, l = "ugsci";
  (u = (i = e.chat) == null ? void 0 : i.rightHeader) != null && u.add ? (e.chat.rightHeader.add(l, t.createElement(fs), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const a = I().antdIcons || {}, n = a.UserSwitchOutlined, s = a.ToolOutlined, r = a.ThunderboltOutlined, o = a.ShopOutlined;
  e.route.add(l, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: _l
  }), e.menu.add(l, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家",
    icon: n ? t.createElement(n, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => Qe()
  }), e.route.add(l, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: Xl
  }), e.menu.add(l, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "工具",
    icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.capabilities",
    order: 6,
    visible: () => Qe()
  }), e.route.add(l, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: ql
  }), e.menu.add(l, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能",
    icon: r ? t.createElement(r, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.skills-center",
    order: 7,
    visible: () => Qe()
  }), e.route.add(l, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: ps
  }), e.menu.add(l, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 8,
    visible: () => Qe()
  }), (k = e.sidebar) != null && k.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
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
  for (const g of d) {
    try {
      const x = e.menu.snapshot("primary.agentScoped").find((p) => p.id === g);
      x && e.menu.replace(l, g, {
        ...x,
        visible: () => !Qe()
      });
    } catch {
    }
    try {
      const x = e.menu.snapshot("primary.settings").find((p) => p.id === g);
      x && e.menu.replace(l, g, {
        ...x,
        visible: () => !Qe()
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
    ys();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Ht, 500);
  }
}
var Un;
if ((Un = window.QwenPaw) != null && Un.host)
  Ht();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), Ht());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
