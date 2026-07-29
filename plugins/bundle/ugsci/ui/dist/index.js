function T() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function ba() {
  try {
    return T().getApiToken() || "";
  } catch {
    return "";
  }
}
function at(e) {
  return T().getApiUrl(e);
}
function zn(e) {
  const t = ba();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
const zt = /* @__PURE__ */ new Map(), Sa = 15e3;
function Ke() {
  zt.clear();
}
async function le(e, t) {
  const a = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: n, ...l } = t || {};
  if (a !== "GET" && Ke(), a === "GET" && !n) {
    const s = zt.get(e);
    if (s && Date.now() - s.ts < Sa)
      return s.data;
  }
  const o = await fetch(at(e), {
    ...l,
    headers: { ...zn(), ...l.headers || {} }
  });
  if (!o.ok) {
    const s = await o.text().catch(() => "");
    throw new Error(s || `HTTP ${o.status}`);
  }
  if (o.status === 204) return null;
  const r = await o.json();
  return a === "GET" && zt.set(e, { data: r, ts: Date.now() }), r;
}
async function Rt() {
  const e = await le("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Lt(e) {
  return le(`/agents/${encodeURIComponent(e)}`);
}
async function vt(e) {
  return await le("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function jt(e = !1) {
  return await le(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function wa(e) {
  const t = await le(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Ca() {
  return await le("/skills/workspaces") || [];
}
async function xa(e) {
  return await le("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function ka(e, t) {
  return le(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function _a(e, t) {
  await le(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Ta(e, t, a) {
  return le("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ client_key: t, client: a })
  });
}
async function za(e, t, a) {
  return le(
    `/mcp/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(a)
    }
  );
}
async function Ia(e, t) {
  return await le(
    `/mcp/tools/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
async function Pa(e, t) {
  return le(
    `/mcp/policy/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  );
}
async function Oa(e, t, a) {
  return le(
    `/mcp/policy/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(a)
    }
  );
}
async function Aa(e) {
  return await le(
    "/mcp/access-principals",
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
async function Ma(e, t, a) {
  return le(
    `/mcp/oauth/start/${encodeURIComponent(t)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(a)
    }
  );
}
async function $a(e, t) {
  return le(
    `/mcp/oauth/status/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  );
}
async function Ra(e, t) {
  await le(
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
function Bt(e, t) {
  const a = T();
  return a.ReactMarkdown && a.remarkGfm ? t.createElement(
    a.ReactMarkdown,
    { remarkPlugins: [a.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
const un = {
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
function La(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, a]) => typeof a == "string" && a.length > 0);
}
const ja = [
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
], Ba = ja, In = "ugsci_custom_teams";
function ft() {
  try {
    const e = localStorage.getItem(In);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function Pn(e) {
  try {
    localStorage.setItem(In, JSON.stringify(e));
  } catch {
  }
}
const Ua = [
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
async function Na(e, t) {
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
  await fetch(at("/console/chat"), {
    method: "POST",
    headers: {
      ...zn(),
      "X-Agent-Id": e
    },
    body: JSON.stringify(a)
  });
}
function yt(e, t) {
  const a = e.find(
    (l) => l.name === t || l.name === t.replace(/\s+/g, "")
  );
  if (a) return a.id;
  const n = e.find(
    (l) => l.name.includes(t) || t.includes(l.name) || l.name.replace(/\s+/g, "").includes(t.replace(/\s+/g, ""))
  );
  return n ? n.id : null;
}
function Da(e) {
  var a;
  const t = e.members.map((n) => `- ${n.name}（${n.role}）`).join(`
`);
  if (e.custom && e.steps && e.steps.length > 0) {
    const n = e.steps.map((o, r) => {
      const s = o.passContext ? "（传递上一步的结果作为上下文）" : "（独立执行，不传递上下文）";
      return `${r + 1}. 向「${o.agentName}」发送请求：${o.instruction} ${s}`;
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
function Fa({ team: e }) {
  const t = T().React, { Typography: a, Tag: n } = T().antd, { Text: l } = a, o = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙"
  }, r = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff"
  }, s = e.steps || [], d = s.length > 0;
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
      ...d ? s.map((c, u) => (e.members.find(
        (S) => S.name === c.agentName
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
          o[e.mode]
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
          t.createElement(Re, {
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
          o[e.mode]
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
          t.createElement(Re, { name: c.name, size: 24 }),
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
function Ga({
  open: e,
  onClose: t,
  agents: a,
  editingTeam: n,
  onSaved: l
}) {
  const o = T().React, { useState: r, useEffect: s, useCallback: d } = o, {
    Modal: c,
    Input: u,
    Button: S,
    Select: O,
    Tag: A,
    Typography: C,
    Switch: p,
    Empty: M,
    message: $,
    Divider: q,
    Steps: L
  } = T().antd, { PlusOutlined: Z, DeleteOutlined: B, SaveOutlined: N, ArrowRightOutlined: I } = T().antdIcons || {}, { Text: x, Paragraph: k } = C, [X, D] = r(""), [P, E] = r("🤝"), [v, f] = r(""), [K, G] = r(
    "pipeline"
  ), [ae, w] = r(""), [g, h] = r(""), [b, se] = r([]), [j, Y] = r([]), [ie, U] = r(!1);
  s(() => {
    e && (n ? (D(n.name), E(n.emoji), f(n.description), G(n.mode), w(n.coordinatorName || ""), h(n.taskTemplate), se(n.steps || []), Y(n.members.map((z) => z.name))) : (D(""), E("🤝"), f(""), G("pipeline"), w(""), h(`请执行以下任务：
任务描述：{任务描述}`), se([]), Y([])));
  }, [e, n]);
  const J = d(() => {
    if (K === "roundtable") {
      const z = j.map((oe) => ({
        agentName: oe,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      se(z);
    } else if (K === "pipeline") {
      const z = new Map(b.map((de) => [de.agentName, de])), oe = j.map((de) => z.get(de) || {
        agentName: de,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      se(oe);
    }
  }, [K, j, b]), re = (z) => {
    j.includes(z) || (Y([...j, z]), K === "coordinator" && !ae && w(z));
  }, y = (z) => {
    Y(j.filter((oe) => oe !== z)), se(b.filter((oe) => oe.agentName !== z)), ae === z && w(j[0] || "");
  }, te = (z, oe, de) => {
    const ye = [...b];
    ye[z] = { ...ye[z], [oe]: de }, se(ye);
  }, m = () => {
    if (!X.trim()) {
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
    if (K === "coordinator" && !ae) {
      $.warning("请选择协调者");
      return;
    }
    U(!0);
    try {
      const z = j.map(
        (ue) => {
          var W;
          const V = a.find((_) => _.name === ue);
          return {
            name: ue,
            role: ((W = V == null ? void 0 : V.description) == null ? void 0 : W.slice(0, 30)) || "团队成员",
            emoji: ""
          };
        }
      );
      let oe = b;
      (b.length === 0 || b.length !== j.length) && (oe = j.map((ue) => ({
        agentName: ue,
        instruction: "请完成你的专业部分",
        passContext: K === "pipeline"
      })));
      const de = {
        id: (n == null ? void 0 : n.id) || `custom-${Date.now()}`,
        name: X.trim(),
        emoji: P,
        category: "自定义",
        description: v.trim() || `${X.trim()}（${j.length}人团队）`,
        mode: K,
        members: z,
        coordinatorName: K === "coordinator" ? ae : void 0,
        taskTemplate: g.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: oe,
        custom: !0,
        createdAt: (n == null ? void 0 : n.createdAt) || Date.now()
      }, ye = ft(), fe = ye.findIndex((ue) => ue.id === de.id);
      fe >= 0 ? ye[fe] = de : ye.push(de), Pn(ye), $.success(n ? "团队已更新" : "团队已创建"), l(), t();
    } catch (z) {
      $.error(z.message || "保存失败");
    } finally {
      U(!1);
    }
  }, ee = a.filter(
    (z) => !j.includes(z.name)
  );
  return o.createElement(
    c,
    {
      open: e,
      onCancel: t,
      title: o.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        o.createElement(
          "span",
          { style: { fontSize: 20 } },
          n ? "✏️" : "➕"
        ),
        o.createElement(
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
        icon: N ? o.createElement(N) : void 0
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
        j.length > 0 ? o.createElement(Gt, {
          members: j,
          size: 36
        }) : null,
        o.createElement(u, {
          placeholder: "团队名称（如：储层评价团队）",
          value: X,
          onChange: (z) => D(z.target.value),
          style: { flex: 1 }
        })
      ),
      o.createElement(u.TextArea, {
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
        o.createElement(O, {
          value: K,
          onChange: (z) => G(z),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" }
          ]
        })
      )
    ),
    o.createElement(q, { style: { margin: "12px 0" } }),
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
            S,
            {
              key: z.id,
              size: "small",
              icon: Z ? o.createElement(Z) : void 0,
              onClick: () => re(z.name)
            },
            z.name
          )
        )
      ) : null,
      // Selected members
      j.length === 0 ? o.createElement(M, {
        description: "请从上方添加团队成员",
        image: M.PRESENTED_IMAGE_SIMPLE
      }) : o.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...j.map(
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
              K === "coordinator" && ae === z ? o.createElement(
                A,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            o.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              K === "coordinator" ? o.createElement(
                S,
                {
                  size: "small",
                  type: "link",
                  onClick: () => w(z)
                },
                "设为协调者"
              ) : null,
              o.createElement(
                S,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: B ? o.createElement(B) : void 0,
                  onClick: () => y(z)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    o.createElement(q, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    j.length > 0 ? o.createElement(
      "div",
      { style: { marginBottom: 16 } },
      o.createElement(
        x,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${K === "roundtable" ? "（各步独立执行）" : K === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      o.createElement(
        S,
        {
          size: "small",
          type: "dashed",
          onClick: J,
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
          (z, oe) => o.createElement(
            "div",
            {
              key: oe,
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
              K === "pipeline" ? o.createElement(
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
                `${oe + 1}`
              ) : o.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              o.createElement(
                A,
                { color: "blue", style: { fontSize: 11 } },
                z.agentName
              ),
              o.createElement(
                "div",
                { style: { flex: 1 } },
                o.createElement(u, {
                  placeholder: "请输入该步骤的指令...",
                  value: z.instruction,
                  onChange: (de) => te(oe, "instruction", de.target.value),
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
                onChange: (de) => te(oe, "passContext", de)
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
    o.createElement(q, { style: { margin: "12px 0" } }),
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
        `${j.length > 0 ? "4" : "3"}. 任务模板`
      ),
      o.createElement(u.TextArea, {
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
function pn({
  team: e,
  agents: t,
  onLaunch: a,
  onEdit: n,
  onDelete: l
}) {
  var v;
  const o = T().React, { useState: r } = o, { Card: s, Tag: d, Typography: c, Button: u, Tooltip: S } = T().antd, {
    TeamOutlined: O,
    RocketOutlined: A,
    UserOutlined: C,
    EditOutlined: p,
    DeleteOutlined: M,
    DownOutlined: $,
    UpOutlined: q
  } = T().antdIcons || {}, { Text: L, Paragraph: Z } = c, [B, N] = r(!1), I = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, x = I[e.mode] || I.coordinator, k = e.members.map((f) => {
    const K = yt(t, f.name);
    return { ...f, found: !!K, agentId: K };
  }), X = k.filter((f) => f.found).length, D = X === e.members.length, P = e.coordinatorName || ((v = e.members[0]) == null ? void 0 : v.name), E = P ? yt(t, P) : null;
  return o.createElement(
    s,
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
      o.createElement(Gt, {
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
            L,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? o.createElement(
            d,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        o.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          o.createElement(
            d,
            { color: x.color, style: { fontSize: 10 } },
            x.label
          ),
          o.createElement(
            d,
            { style: { fontSize: 10 } },
            `${X}/${e.members.length}`
          ),
          D ? null : o.createElement(
            d,
            { color: "orange", style: { fontSize: 10 } },
            "缺少成员"
          )
        )
      ),
      // Edit/delete for custom teams
      e.custom ? o.createElement(
        "div",
        { style: { display: "flex", gap: 2 } },
        n ? o.createElement(
          S,
          { title: "编辑" },
          o.createElement(u, {
            type: "text",
            size: "small",
            icon: p ? o.createElement(p) : void 0,
            onClick: (f) => {
              f.stopPropagation(), n(e);
            }
          })
        ) : null,
        l ? o.createElement(
          S,
          { title: "删除" },
          o.createElement(u, {
            type: "text",
            size: "small",
            danger: !0,
            icon: M ? o.createElement(M) : void 0,
            onClick: (f) => {
              f.stopPropagation(), l(e);
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
      ...k.map(
        (f) => o.createElement(
          S,
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
    o.createElement(
      u,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (f) => {
          f.stopPropagation(), N(!B);
        },
        icon: B ? q ? o.createElement(q) : "▲" : $ ? o.createElement($) : "▼"
      },
      B ? "收起流程" : "查看执行流程"
    ),
    B ? o.createElement(Fa, { team: e }) : null,
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
        L,
        { type: "secondary", style: { fontSize: 11 } },
        P ? `协调者: ${P}` : ""
      ),
      o.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: A ? o.createElement(A) : void 0,
          disabled: !E,
          onClick: () => a(e),
          style: Oe
        },
        "发起团队任务"
      )
    )
  );
}
function Ha({
  agents: e,
  onLaunch: t
}) {
  const a = T().React, { useMemo: n, useState: l, useCallback: o, useEffect: r } = a, {
    Row: s,
    Col: d,
    Input: c,
    Empty: u,
    Typography: S,
    Tag: O,
    Button: A,
    Divider: C,
    message: p,
    Popconfirm: M
  } = T().antd, { SearchOutlined: $, TeamOutlined: q, PlusOutlined: L, RocketOutlined: Z } = T().antdIcons || {}, { Text: B } = S, [N, I] = l(""), [x, k] = l([]), [X, D] = l(!1), [P, E] = l(null);
  r(() => {
    k(ft());
  }, []);
  const v = o(() => {
    k(ft());
  }, []), f = o(
    (b) => {
      const j = ft().filter((Y) => Y.id !== b.id);
      Pn(j), k(j), p.success(`团队「${b.name}」已删除`);
    },
    [p]
  ), K = o((b) => {
    E(b), D(!0);
  }, []), G = o(() => {
    E(null), D(!0);
  }, []), ae = n(() => [...x, ...Ua], [x]), w = n(() => {
    if (!N.trim()) return ae;
    const b = N.toLowerCase();
    return ae.filter(
      (se) => se.name.toLowerCase().includes(b) || se.description.toLowerCase().includes(b) || se.category.toLowerCase().includes(b)
    );
  }, [ae, N]), g = w.filter((b) => b.custom), h = w.filter((b) => !b.custom);
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
        A,
        {
          type: "primary",
          size: "small",
          icon: L ? a.createElement(L) : void 0,
          onClick: G,
          style: Oe
        },
        "创建专家团"
      )
    ),
    // Search
    a.createElement(c, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: $ ? a.createElement($) : void 0,
      value: N,
      onChange: (b) => I(b.target.value),
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
        s,
        { gutter: [12, 12] },
        ...g.map(
          (b) => a.createElement(
            d,
            { key: b.id, xs: 24, sm: 12, md: 8 },
            a.createElement(pn, {
              team: b,
              agents: e,
              onLaunch: t,
              onEdit: K,
              onDelete: f
            })
          )
        )
      ),
      a.createElement(C, { style: { margin: "16px 0" } })
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
        s,
        { gutter: [12, 12] },
        ...h.map(
          (b) => a.createElement(
            d,
            { key: b.id, xs: 24, sm: 12, md: 8 },
            a.createElement(pn, {
              team: b,
              agents: e,
              onLaunch: t
            })
          )
        )
      )
    ) : null,
    // Empty state
    w.length === 0 ? a.createElement(u, {
      description: "未找到匹配的专家团队，点击「创建专家团」自定义",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : null,
    // Team Builder Modal
    a.createElement(Ga, {
      open: X,
      onClose: () => {
        D(!1), E(null);
      },
      agents: e,
      editingTeam: P,
      onSaved: v
    })
  );
}
function On(e) {
  var a;
  const t = [];
  for (const n of e) {
    if (n.enabled === !1) continue;
    const l = (a = n.description) == null ? void 0 : a.trim();
    if (!l) continue;
    const o = (n.name || l).length > 20 ? (n.name || l).substring(0, 18) + "…" : n.name || l;
    let r = l;
    if (r = r.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(r) ? r = `请${r}` : /^(a |an |the )/i.test(r) ? r = `Help me with ${r}` : /[。？！.?!]$/.test(r) || (r = `帮我${r}`), r.length > 80 && (r = r.substring(0, 77) + "..."), t.push({ label: o, value: r }), t.length >= 4) break;
  }
  return t;
}
async function Wa(e) {
  return await le("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Et(e, t, a) {
  await le(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: a })
  });
}
async function gn(e, t) {
  const a = await Lt(e);
  a.system_prompt_files = t, await le(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(a)
  });
}
async function Ut(e, t) {
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
async function An(e, t) {
  await le(`/skills/${encodeURIComponent(t)}/enable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Nt(e, t) {
  await le(`/skills/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Ja(e, t) {
  return le("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Xa(e, t) {
  return le("/skills/batch-disable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Ka(e, t) {
  return le("/skills/batch-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Dt(e) {
  return await le("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Mn(e, t) {
  await le(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function $n(e, t) {
  return le("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Va(e, t) {
  return le(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Rn(e, t) {
  await le(`/skills/${encodeURIComponent(t)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function qa(e) {
  await le(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function Ya(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const a = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!a) return { number: 6, unit: "h" };
  const n = parseInt(a[1] || "0", 10), l = parseInt(a[2] || "0", 10), o = parseInt(a[3] || "0", 10), r = n * 60 + l + Math.round(o / 60);
  return r <= 0 ? { number: 6, unit: "h" } : r >= 60 && r % 60 === 0 ? { number: r / 60, unit: "h" } : { number: r, unit: "m" };
}
function Qa(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function Za(e) {
  return le("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function el(e, t) {
  return le("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function tl(e) {
  await le("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function nl(e) {
  return le("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function al(e, t) {
  return le("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function ll(e) {
  return (await le("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function ol(e, t) {
  await le("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function sl() {
  return (await le("/config/user-timezone")).timezone || "UTC";
}
async function rl(e) {
  await le("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function il(e) {
  return await le("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const fn = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function bt({
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
function yn({
  items: e,
  max: t = 5,
  color: a = "blue",
  emptyText: n = "无"
}) {
  const l = T().React, { Tag: o } = T().antd;
  return !e || e.length === 0 ? l.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    n
  ) : l.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (r, s) => l.createElement(
        o,
        { key: s, color: a, style: { fontSize: 11, marginRight: 0 } },
        r
      )
    ),
    e.length > t ? l.createElement(
      o,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function Ln({
  open: e,
  onClose: t,
  poolSkills: a,
  installedSkillNames: n,
  loading: l,
  onInstall: o
}) {
  const r = T().React, { useState: s, useEffect: d, useMemo: c } = r, { Modal: u, Button: S, Empty: O, Spin: A, Input: C, Tag: p, Tooltip: M, Typography: $ } = T().antd, { CheckOutlined: q, SearchOutlined: L } = T().antdIcons || {}, { Text: Z } = $, [B, N] = s([]), [I, x] = s("");
  d(() => {
    e && (N([]), x(""));
  }, [e]);
  const k = c(() => {
    if (!I.trim()) return a;
    const E = I.toLowerCase();
    return a.filter(
      (v) => {
        var f, K;
        return v.name.toLowerCase().includes(E) || ((f = v.description) == null ? void 0 : f.toLowerCase().includes(E)) || ((K = v.tags) == null ? void 0 : K.some((G) => G.toLowerCase().includes(E)));
      }
    );
  }, [a, I]), X = k.filter(
    (E) => !n.includes(E.name)
  ), D = (E) => {
    N(
      (v) => v.includes(E) ? v.filter((f) => f !== E) : [...v, E]
    );
  }, P = async () => {
    B.length !== 0 && (await o(B), N([]));
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
          Z,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${B.length} 个技能`
        ),
        r.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          r.createElement(S, { onClick: t }, "取消"),
          r.createElement(
            S,
            {
              type: "primary",
              onClick: P,
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
      r.createElement(C, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: L ? r.createElement(L) : void 0,
        value: I,
        onChange: (E) => x(E.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      r.createElement(
        S,
        {
          size: "small",
          type: "primary",
          onClick: () => N(X.map((E) => E.name))
        },
        "全选"
      ),
      r.createElement(
        S,
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
      r.createElement(A, { size: "large" })
    ) : k.length === 0 ? r.createElement(O, {
      description: I ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: O.PRESENTED_IMAGE_SIMPLE
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
            q ? r.createElement(q) : "✓"
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
const We = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  gap: 4
}, jn = { marginBottom: 16 }, Bn = {
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
}, Un = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function cl({ agentId: e }) {
  const t = T().React, { useState: a, useEffect: n, useCallback: l } = t, {
    Switch: o,
    InputNumber: r,
    Select: s,
    Button: d,
    Spin: c,
    Space: u,
    Typography: S,
    message: O
  } = T().antd, { PlayCircleOutlined: A, SaveOutlined: C } = T().antdIcons || {}, { Text: p } = S, [M, $] = a(!0), [q, L] = a(!1), [Z, B] = a(!1), [N, I] = a(!1), [x, k] = a(6), [X, D] = a("h"), [P, E] = a("main"), [v, f] = a(300), [K, G] = a(!1), [ae, w] = a("08:00"), [g, h] = a("22:00"), b = l(async () => {
    var J, re;
    $(!0);
    try {
      const y = await Za(e), te = Ya(y.every ?? "6h");
      I(y.enabled ?? !1), k(te.number), D(te.unit), E(y.target ?? "main"), f(y.timeoutSeconds ?? 300), G(!!y.activeHours), w(((J = y.activeHours) == null ? void 0 : J.start) ?? "08:00"), h(((re = y.activeHours) == null ? void 0 : re.end) ?? "22:00");
    } catch (y) {
      O.error(y.message || "加载心跳配置失败");
    } finally {
      $(!1);
    }
  }, [e]);
  n(() => {
    b();
  }, [b]);
  const se = async () => {
    L(!0);
    try {
      await el(e, {
        enabled: N,
        every: Qa({ number: x, unit: X }),
        target: P,
        timeoutSeconds: v,
        activeHours: K && ae && g ? { start: ae, end: g } : void 0
      }), O.success("心跳配置已保存");
    } catch (J) {
      O.error(J.message || "保存心跳配置失败");
    } finally {
      L(!1);
    }
  }, j = async () => {
    B(!0);
    try {
      await tl(e), O.success("已触发心跳检查");
    } catch (J) {
      O.error(J.message || "触发心跳失败");
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
  const Y = (J, re, y) => t.createElement(
    "div",
    { style: jn },
    t.createElement("div", { style: We }, J),
    re,
    y ? t.createElement(
      p,
      { type: "secondary", style: Un },
      y
    ) : null
  ), ie = (J, re, y, te) => t.createElement(
    "div",
    { style: Bn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: We }, J),
      re
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: We }, y),
      te
    )
  ), { Divider: U } = T().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: je }, "基本设置"),
    Y(
      "启用心跳",
      t.createElement(o, {
        checked: N,
        onChange: (J) => I(J)
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
          onChange: (J) => k(J ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(s, {
          value: X,
          onChange: (J) => D(J),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(s, {
        value: P,
        onChange: (J) => E(J),
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
      t.createElement(r, {
        min: 1,
        max: 3600,
        value: v,
        onChange: (J) => f(J ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(U, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: je }, "活跃时段"),
    Y(
      "启用活跃时段限制",
      t.createElement(o, {
        checked: K,
        onChange: (J) => G(J)
      }),
      "仅在指定时段内触发心跳"
    ),
    K ? ie(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: ae,
        onChange: (J) => w(J.target.value),
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
        onChange: (J) => h(J.target.value),
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
          icon: C ? t.createElement(C) : void 0,
          loading: q,
          onClick: se,
          style: Oe
        },
        "保存配置"
      ),
      t.createElement(
        d,
        {
          icon: A ? t.createElement(A) : void 0,
          loading: Z,
          onClick: j
        },
        "立即执行"
      )
    )
  );
}
function ml({
  agentId: e,
  onRefresh: t
}) {
  const a = T().React, { useState: n, useEffect: l, useCallback: o } = a, {
    List: r,
    Tag: s,
    Switch: d,
    Button: c,
    Empty: u,
    Spin: S,
    Typography: O,
    message: A
  } = T().antd, { PlusOutlined: C, ReloadOutlined: p, DeleteOutlined: M } = T().antdIcons || {}, { Text: $, Paragraph: q } = O, [L, Z] = n([]), [B, N] = n(!0), [I, x] = n(!1), [k, X] = n([]), [D, P] = n(!1), E = o(async () => {
    N(!0);
    try {
      const w = await vt(e);
      Z(w);
    } catch (w) {
      A.error(w.message || "加载技能失败"), Z([]);
    } finally {
      N(!1);
    }
  }, [e]);
  l(() => {
    E();
  }, [E]);
  const v = async () => {
    x(!0), P(!0);
    try {
      const w = await jt(!0);
      X(w);
    } catch (w) {
      A.error(w.message || "加载技能池失败");
    } finally {
      P(!1);
    }
  }, f = async (w) => {
    let g = 0, h = 0;
    for (const b of w)
      try {
        await Ut(e, b), g++;
      } catch {
        h++;
      }
    g > 0 ? (A.success(
      `成功添加 ${g} 个技能${h > 0 ? `，${h} 个失败` : ""}`
    ), E(), t()) : h > 0 && A.error("添加技能失败"), x(!1);
  }, K = async (w, g) => {
    try {
      g ? await An(e, w.name) : await Rn(e, w.name), A.success(g ? "已启用" : "已停用"), E(), t();
    } catch (h) {
      A.error(h.message || "操作失败");
    }
  }, G = async (w) => {
    try {
      await Nt(e, w), A.success(`技能「${w}」已移除`), E(), t();
    } catch (g) {
      A.error(g.message || "移除技能失败");
    }
  };
  if (B)
    return a.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      a.createElement(S, { size: "large" })
    );
  const ae = L.filter((w) => w.enabled !== !1);
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
              Ke(), E();
            }
          },
          "刷新"
        ),
        a.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: C ? a.createElement(C) : void 0,
            onClick: v,
            style: Oe
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
      renderItem: (w) => a.createElement(
        r.Item,
        {
          actions: [
            a.createElement(d, {
              key: "toggle",
              size: "small",
              checked: w.enabled !== !1,
              onChange: (g) => K(w, g)
            }),
            a.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: M ? a.createElement(M) : void 0,
                onClick: () => G(w.name)
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
            w.emoji ? a.createElement(
              "span",
              { style: { fontSize: 16 } },
              w.emoji
            ) : null,
            a.createElement($, { strong: !0 }, w.name),
            w.version_text ? a.createElement(
              s,
              { style: { fontSize: 10 } },
              `v${w.version_text}`
            ) : null
          ),
          w.description ? a.createElement(
            q,
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
    a.createElement(Ln, {
      open: I,
      onClose: () => x(!1),
      poolSkills: k,
      installedSkillNames: L.map((w) => w.name),
      loading: D,
      onInstall: f
    })
  );
}
function dl({
  agentId: e,
  onRefresh: t,
  isActive: a
}) {
  const n = T().React, { useState: l, useEffect: o, useCallback: r } = n, {
    List: s,
    Tag: d,
    Button: c,
    Empty: u,
    Spin: S,
    Modal: O,
    Input: A,
    Typography: C,
    message: p
  } = T().antd, { PlusOutlined: M, ReloadOutlined: $, DeleteOutlined: q } = T().antdIcons || {}, { Text: L, Paragraph: Z } = C, { TextArea: B } = A, [N, I] = l([]), [x, k] = l(!0), [X, D] = l(!1), [P, E] = l(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [v, f] = l(!1), K = r(async () => {
    k(!0);
    try {
      const g = await Dt(e);
      I(g);
    } catch (g) {
      p.error(g.message || "加载 MCP 失败"), I([]);
    } finally {
      k(!1);
    }
  }, [e]);
  o(() => {
    K();
  }, [K]), o(() => {
    a && K();
  }, [a, K]);
  const G = async (g) => {
    try {
      await Va(e, g), p.success("已切换 MCP 状态"), K(), t();
    } catch (h) {
      p.error(h.message || "切换失败");
    }
  }, ae = async (g) => {
    try {
      await Mn(e, g), p.success(`MCP「${g}」已移除`), K(), t();
    } catch (h) {
      p.error(h.message || "移除 MCP 失败");
    }
  }, w = async () => {
    f(!0);
    try {
      const g = JSON.parse(P), h = g.mcpServers || g, b = Object.entries(h);
      if (b.length === 0) {
        p.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [se, j] of b) {
        const Y = j, ie = Y.url ? "streamable_http" : "stdio";
        await $n(e, {
          client_key: se,
          client: {
            name: Y.name || se,
            description: Y.description || "",
            enabled: !0,
            transport: ie,
            url: Y.url || "",
            command: Y.command || "",
            args: Y.args || [],
            env: Y.env || {},
            cwd: Y.cwd || "",
            headers: Y.headers || {}
          }
        });
      }
      p.success("MCP 客户端已创建"), D(!1), K(), t();
    } catch (g) {
      g instanceof SyntaxError ? p.error("JSON 格式错误：" + g.message) : p.error(g.message || "创建 MCP 失败");
    } finally {
      f(!1);
    }
  };
  return x ? n.createElement(
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
              Ke(), K();
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
            style: Oe
          },
          "添加 MCP"
        )
      )
    ),
    N.length === 0 ? n.createElement(u, {
      description: "该专家暂无 MCP 客户端",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(s, {
      dataSource: N,
      renderItem: (g) => n.createElement(
        s.Item,
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
                icon: q ? n.createElement(q) : void 0,
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
      O,
      {
        open: X,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => D(!1),
        onOk: w,
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
        value: P,
        onChange: (g) => E(g.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function ul({ agentId: e }) {
  const t = T().React, { useState: a, useEffect: n, useCallback: l, useRef: o } = t, {
    Card: r,
    InputNumber: s,
    Input: d,
    Select: c,
    Switch: u,
    Button: S,
    Spin: O,
    Space: A,
    Typography: C,
    Divider: p,
    message: M
  } = T().antd, { SaveOutlined: $ } = T().antdIcons || {}, { Text: q } = C, [L, Z] = a(!0), [B, N] = a(!1), I = o(null), [x, k] = a(60), [X, D] = a(""), [P, E] = a(!0), [v, f] = a(30), [K, G] = a("zh"), [ae, w] = a("UTC"), [g, h] = a(!0), [b, se] = a(100), [j, Y] = a(!0), [ie, U] = a(3), [J, re] = a(1), [y, te] = a(!0), [m, ee] = a(3), [z, oe] = a(2), [de, ye] = a(60), [fe, ue] = a(1), [V, W] = a(0), [_, F] = a(1), [ce, H] = a(0), [pe, Ee] = a(30), [be, ke] = a(50), [ze, Ue] = a("light"), [lt, Ve] = a("scroll"), [Ae, qe] = a("remelight"), [ot, Fe] = a("AUTO"), Ie = l(async () => {
    var Q, we, Ce, _e, Qe, Ze;
    Z(!0);
    try {
      const [he, st, Pe] = await Promise.all([
        nl(e),
        ll(e).catch(() => "zh"),
        sl().catch(() => "UTC")
      ]);
      I.current = he, k(he.shell_command_timeout ?? 60), D(he.shell_command_executable ?? "");
      const et = he.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      E(et.enabled ?? !0), f(et.timeout_seconds ?? 30), G(st), w(Pe);
      const Ne = he.loop ?? {};
      h(((Q = Ne.iteration) == null ? void 0 : Q.enabled) ?? !0), se(((we = Ne.iteration) == null ? void 0 : we.max_iterations) ?? he.max_iters ?? 100), Y(((Ce = Ne.doom_loop) == null ? void 0 : Ce.enabled) ?? !0), U(((_e = Ne.doom_loop) == null ? void 0 : _e.window_size) ?? 3), re(((Qe = Ne.doom_loop) == null ? void 0 : Qe.similarity_threshold) ?? 1), te(he.llm_retry_enabled ?? !0), ee(he.llm_max_retries ?? 3), oe(he.llm_backoff_base ?? 2), ye(he.llm_backoff_cap ?? 60), ue(he.llm_max_concurrent ?? 1), W(he.llm_max_qpm ?? 0), F(he.llm_rate_limit_pause ?? 1), H(he.llm_rate_limit_jitter ?? 0), Ee(he.llm_acquire_timeout ?? 30), ke(he.history_max_length ?? 50), Ue(he.context_manager_backend ?? "light"), Ve(((Ze = he.light_context_config) == null ? void 0 : Ze.strategy) ?? "scroll"), qe(he.memory_manager_backend ?? "remelight"), Fe(he.approval_level ?? "AUTO");
    } catch (he) {
      M.error(he.message || "加载运行配置失败");
    } finally {
      Z(!1);
    }
  }, [e]);
  n(() => {
    Ie();
  }, [Ie]);
  const Ye = async () => {
    var we, Ce;
    const Q = I.current;
    if (Q) {
      N(!0);
      try {
        const _e = {
          ...Q,
          max_iters: b,
          loop: {
            ...Q.loop ?? {},
            iteration: { enabled: g, max_iterations: b },
            doom_loop: {
              enabled: j,
              window_size: ie,
              similarity_threshold: J,
              stages: ((Ce = (we = Q.loop) == null ? void 0 : we.doom_loop) == null ? void 0 : Ce.stages) ?? []
            }
          },
          shell_command_timeout: x,
          shell_command_executable: X,
          auto_title_config: {
            enabled: P,
            timeout_seconds: v
          },
          llm_retry_enabled: y,
          llm_max_retries: m,
          llm_backoff_base: z,
          llm_backoff_cap: de,
          llm_max_concurrent: fe,
          llm_max_qpm: V,
          llm_rate_limit_pause: _,
          llm_rate_limit_jitter: ce,
          llm_acquire_timeout: pe,
          history_max_length: be,
          context_manager_backend: ze,
          light_context_config: {
            ...Q.light_context_config ?? {},
            strategy: lt
          },
          memory_manager_backend: Ae,
          approval_level: ot
        };
        await al(e, _e), I.current = _e, K && await ol(e, K).catch(() => {
        }), ae && await rl(ae).catch(() => {
        }), M.success("运行配置已保存");
      } catch (_e) {
        M.error(_e.message || "保存运行配置失败");
      } finally {
        N(!1);
      }
    }
  };
  if (L)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(O, { size: "large" })
    );
  const Te = (Q, we, Ce) => t.createElement(
    "div",
    { style: jn },
    t.createElement("div", { style: We }, Q),
    we,
    Ce ? t.createElement(
      q,
      { type: "secondary", style: Un },
      Ce
    ) : null
  ), xe = (Q, we, Ce, _e) => t.createElement(
    "div",
    { style: Bn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: We }, Q),
      we
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: We }, Ce),
      _e
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
      t.createElement(s, {
        min: 1,
        value: x,
        onChange: (Q) => k(Q ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(d, {
        value: X,
        onChange: (Q) => D(Q.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    xe(
      "语言",
      t.createElement(c, {
        value: K,
        onChange: (Q) => G(Q),
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
        onChange: (Q) => w(Q),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (Q, we) => {
          var Ce;
          return (((Ce = we == null ? void 0 : we.label) == null ? void 0 : Ce.toString()) || "").toLowerCase().includes(Q.toLowerCase());
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
    xe(
      "自动生成会话标题",
      t.createElement(A, null, t.createElement(u, {
        checked: P,
        onChange: (Q) => E(Q)
      })),
      "标题生成超时 (秒)",
      t.createElement(s, {
        min: 5,
        value: v,
        onChange: (Q) => f(Q ?? 30),
        style: { width: "100%" },
        disabled: !P
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(p, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: je }, "审批级别"),
    Te(
      "工具执行审批",
      t.createElement(c, {
        value: ot,
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
      t.createElement(u, {
        checked: g,
        onChange: (Q) => h(Q)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    g ? Te(
      "最大迭代次数",
      t.createElement(s, {
        min: 1,
        max: 500,
        value: b,
        onChange: (Q) => se(Q ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    Te(
      "启用重复循环保护",
      t.createElement(u, {
        checked: j,
        onChange: (Q) => Y(Q)
      }),
      "检测并阻止重复操作循环"
    ),
    j ? xe(
      "检测窗口大小",
      t.createElement(s, {
        min: 2,
        max: 20,
        value: ie,
        onChange: (Q) => U(Q ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(s, {
        min: 0,
        max: 1,
        step: 0.05,
        value: J,
        onChange: (Q) => re(Q ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(p, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: je }, "LLM 重试"),
    Te(
      "启用 LLM 重试",
      t.createElement(u, {
        checked: y,
        onChange: (Q) => te(Q)
      })
    ),
    xe(
      "最大重试次数",
      t.createElement(s, {
        min: 1,
        value: m,
        onChange: (Q) => ee(Q ?? 3),
        style: { width: "100%" },
        disabled: !y
      }),
      "退避基数 (秒)",
      t.createElement(s, {
        min: 0.1,
        step: 0.1,
        value: z,
        onChange: (Q) => oe(Q ?? 2),
        style: { width: "100%" },
        disabled: !y
      })
    ),
    Te(
      "退避上限 (秒)",
      t.createElement(s, {
        min: 0.5,
        step: 0.5,
        value: de,
        onChange: (Q) => ye(Q ?? 60),
        style: { width: 200 },
        disabled: !y
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(p, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: je }, "LLM 限流"),
    xe(
      "最大并发数",
      t.createElement(s, {
        min: 1,
        value: fe,
        onChange: (Q) => ue(Q ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(s, {
        min: 0,
        step: 10,
        value: V,
        onChange: (Q) => W(Q ?? 0),
        style: { width: "100%" }
      })
    ),
    xe(
      "限流暂停时间 (秒)",
      t.createElement(s, {
        min: 1,
        step: 0.5,
        value: _,
        onChange: (Q) => F(Q ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(s, {
        min: 0,
        step: 0.5,
        value: ce,
        onChange: (Q) => H(Q ?? 0),
        style: { width: "100%" }
      })
    ),
    Te(
      "获取超时 (秒)",
      t.createElement(s, {
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
    xe(
      "上下文管理后端",
      t.createElement(c, {
        value: ze,
        onChange: (Q) => Ue(Q),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(c, {
        value: lt,
        onChange: (Q) => Ve(Q),
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
        value: Ae,
        onChange: (Q) => qe(Q),
        style: { width: "100%" },
        options: [
          { value: "remelight", label: "remelight" },
          { value: "adbpg", label: "adbpg" },
          { value: "none", label: "none (禁用)" }
        ]
      }),
      "历史消息最大长度",
      t.createElement(s, {
        min: 1,
        value: be,
        onChange: (Q) => ke(Q ?? 50),
        style: { width: "100%" }
      })
    ),
    // ── Save button ──
    t.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      t.createElement(
        S,
        {
          type: "primary",
          icon: $ ? t.createElement($) : void 0,
          loading: B,
          onClick: Ye,
          style: Oe
        },
        "保存运行配置"
      )
    )
  );
}
function pl({
  expert: e,
  open: t,
  onClose: a,
  onRefresh: n
}) {
  const l = T().React, { useState: o, useEffect: r, useCallback: s } = l, { Modal: d, Tabs: c, Spin: u, Typography: S } = T().antd, { SettingOutlined: O } = T().antdIcons || {}, { Text: A } = S, [C, p] = o([]), [M, $] = o(!1), [q, L] = o("heartbeat"), Z = s(async () => {
    if (e) {
      $(!0);
      try {
        const x = await il(e.agent.id);
        p(x);
      } catch {
        p([]);
      } finally {
        $(!1);
      }
    }
  }, [e]);
  if (r(() => {
    t && e && Z();
  }, [t, e, Z]), !e) return null;
  const { agent: B } = e, N = () => {
    Z(), n();
  }, I = [
    {
      key: "heartbeat",
      label: "心跳",
      children: l.createElement(cl, {
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
      ) : l.createElement(Nn, {
        agentId: B.id,
        systemPromptFiles: C,
        onRefresh: N
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((x) => x.enabled !== !1).length})`,
      children: l.createElement(ml, {
        agentId: B.id,
        onRefresh: n
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: l.createElement(dl, {
        agentId: B.id,
        onRefresh: n,
        isActive: q === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: l.createElement(ul, {
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
        O ? l.createElement(O, { style: { fontSize: 18 } }) : null,
        l.createElement("span", null, `配置 - ${B.name}`),
        l.createElement(
          A,
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
      items: I,
      activeKey: q,
      onChange: (x) => L(x),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
function gl({
  expert: e,
  onClick: t,
  onSummon: a,
  onConfigure: n
}) {
  const l = T().React, { Card: o, Tag: r, Badge: s, Typography: d, Spin: c, Button: u, Tooltip: S } = T().antd, { Text: O } = d, { ThunderboltOutlined: A, SettingOutlined: C } = T().antdIcons || {}, { agent: p, skills: M, mcps: $, loading: q } = e, L = p.enabled, Z = M.filter((I) => I.enabled !== !1).map((I) => I.name), B = $.map((I) => I.name || I.key), N = p.active_model ? `${p.active_model.provider_id}/${p.active_model.model}` : null;
  return l.createElement(
    o,
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
        l.createElement(Re, { name: p.name, size: 36 }),
        l.createElement(
          "div",
          null,
          l.createElement(
            O,
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
      l.createElement(s, {
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
      Bt(p.description, l)
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
    q ? l.createElement(c, { size: "small" }) : l.createElement(
      "div",
      { style: { marginBottom: 6 } },
      l.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${Z.length})`
      ),
      l.createElement(yn, {
        items: Z,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !q && B.length > 0 ? l.createElement(
      "div",
      { style: { marginTop: "auto" } },
      l.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${B.length})`
      ),
      l.createElement(yn, {
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
        S,
        { title: "配置专家", placement: "top" },
        l.createElement(
          u,
          {
            type: "text",
            size: "small",
            icon: C ? l.createElement(C, {
              style: { fontSize: 16, color: "#8c8c8c" }
            }) : void 0,
            onClick: (I) => {
              I.stopPropagation(), n && n();
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
          icon: A ? l.createElement(A) : void 0,
          disabled: !L,
          onClick: (I) => {
            I.stopPropagation(), a && a();
          },
          style: Oe
        },
        "召唤专家"
      )
    )
  );
}
function fl({
  expert: e,
  open: t,
  onClose: a,
  onRefresh: n
}) {
  const l = T().React, {
    Drawer: o,
    Descriptions: r,
    Tag: s,
    Typography: d,
    Space: c,
    Button: u,
    Empty: S,
    Tabs: O,
    List: A,
    Spin: C,
    Modal: p,
    message: M
  } = T().antd, { Text: $, Paragraph: q } = d, {
    EditOutlined: L,
    ThunderboltOutlined: Z,
    FileTextOutlined: B,
    ToolOutlined: N,
    PlusOutlined: I
  } = T().antdIcons || {}, [x, k] = l.useState(!1), [X, D] = l.useState(
    []
  ), [P, E] = l.useState(!1);
  if (!e) return null;
  const { agent: v, config: f, skills: K, mcps: G, loading: ae } = e, w = K.filter((y) => y.enabled !== !1), g = (y) => {
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
          s,
          { color: v.enabled ? "green" : "default" },
          v.enabled ? "启用" : "停用"
        )
      ),
      l.createElement(
        r.Item,
        { label: "功能简介" },
        v.description ? Bt(v.description, l) : "暂无描述"
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
          (y, te) => l.createElement(
            s,
            {
              key: te,
              icon: B ? l.createElement(B) : void 0,
              style: { fontSize: 12 }
            },
            y
          )
        )
      )
    ) : null
  ), b = async () => {
    k(!0), E(!0);
    try {
      const y = await jt(!0);
      D(y);
    } catch (y) {
      M.error(y.message || "加载技能池失败");
    } finally {
      E(!1);
    }
  }, se = async (y) => {
    let te = 0, m = 0;
    for (const ee of y)
      try {
        await Ut(v.id, ee), te++;
      } catch {
        m++;
      }
    te > 0 ? (M.success(
      `成功添加 ${te} 个技能${m > 0 ? `，${m} 个失败` : ""}`
    ), n()) : m > 0 && M.error("添加技能失败"), k(!1);
  }, j = async (y) => {
    try {
      await Nt(v.id, y), M.success(`技能「${y}」已移除`), n();
    } catch (te) {
      M.error(te.message || "移除技能失败");
    }
  }, Y = async (y) => {
    try {
      await Mn(v.id, y), M.success(`MCP「${y}」已移除`), n();
    } catch (te) {
      M.error(te.message || "移除 MCP 失败");
    }
  }, ie = ae ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(C, { size: "large" })
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
        `已启用技能 (${w.length})`
      ),
      l.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: I ? l.createElement(I) : void 0,
          onClick: b
        },
        "从技能池添加"
      )
    ),
    w.length === 0 ? l.createElement(S, {
      description: "该专家暂无已启用的技能",
      image: S.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(A, {
      dataSource: w,
      renderItem: (y) => l.createElement(
        A.Item,
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
              s,
              { style: { fontSize: 10 } },
              `v${y.version_text}`
            ) : null
          ),
          y.description ? l.createElement(
            q,
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
              (te, m) => l.createElement(
                s,
                {
                  key: m,
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
    l.createElement(Ln, {
      open: x,
      onClose: () => k(!1),
      poolSkills: X,
      installedSkillNames: w.map((y) => y.name),
      loading: P,
      onInstall: se
    })
  ), U = ae ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(C, { size: "large" })
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
          icon: I ? l.createElement(I) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${v.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    G.length === 0 ? l.createElement(S, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: S.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(A, {
      dataSource: G,
      renderItem: (y) => l.createElement(
        A.Item,
        {
          actions: [
            l.createElement(
              u,
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
              $,
              { strong: !0 },
              y.name || y.key
            ),
            l.createElement(
              s,
              {
                color: y.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              y.enabled ? "启用" : "停用"
            ),
            l.createElement(
              s,
              { color: "purple", style: { fontSize: 10 } },
              y.transport
            )
          ),
          y.description ? l.createElement(
            q,
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
  ), J = f != null && f.tools ? l.createElement(
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
  ) : l.createElement(S, {
    description: "暂无工具配置",
    image: S.PRESENTED_IMAGE_SIMPLE
  }), re = [
    { key: "basic", label: "基本信息", children: h },
    {
      key: "skills",
      label: `技能 (${w.length})`,
      children: ie
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: l.createElement(hl, {
        skills: w,
        agentId: v.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: l.createElement(Nn, {
        agentId: v.id,
        systemPromptFiles: (f == null ? void 0 : f.system_prompt_files) || [],
        onRefresh: () => n()
      })
    },
    { key: "mcp", label: `MCP (${G.length})`, children: U },
    { key: "tools", label: "工具配置", children: J }
  ];
  return l.createElement(
    o,
    {
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        l.createElement(Re, { name: v.name, size: 28 }),
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
            icon: Z ? l.createElement(Z) : void 0,
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
    l.createElement(O, {
      items: re,
      defaultActiveKey: "basic"
    })
  );
}
function yl({
  open: e,
  onClose: t,
  onCreated: a
}) {
  const n = T().React, { useState: l } = n, {
    Modal: o,
    Card: r,
    Tag: s,
    Input: d,
    Row: c,
    Col: u,
    Spin: S,
    message: O,
    Typography: A
  } = T().antd, { Text: C } = A, { FileAddOutlined: p } = T().antdIcons || {}, [M, $] = l(!1), [q, L] = l(""), [Z, B] = l(!1), N = async (k, X) => {
    $(!0);
    try {
      const D = await le("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: k || "新专家",
          description: X || "",
          skill_names: []
        })
      });
      await Et(
        D.id,
        "AGENTS.md",
        `# ${k || "新专家"}

请在此处编写该专家的系统提示词。
`
      ), O.success("专家「" + (k || "新专家") + "」创建成功"), B(!1), setTimeout(() => {
        t(), a();
      }, 0);
    } catch (D) {
      O.error(D.message || "创建专家失败");
    } finally {
      $(!1);
    }
  }, I = Ba.filter((k) => {
    if (!q.trim()) return !0;
    const X = q.toLowerCase();
    return k.name.toLowerCase().includes(X) || k.description.toLowerCase().includes(X) || k.category.toLowerCase().includes(X);
  }), x = async (k) => {
    $(!0);
    try {
      const X = await le("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: k.name,
          description: k.description,
          skill_names: k.recommended_skills
        })
      });
      await Et(X.id, "AGENTS.md", k.system_prompt);
      const D = await Lt(X.id);
      D.approval_level = k.approval_level, await le(`/agents/${encodeURIComponent(X.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(D)
      }), O.success(`专家「${k.name}」创建成功`), t(), a();
    } catch (X) {
      O.error(X.message || "创建专家失败");
    } finally {
      $(!1);
    }
  };
  return n.createElement(
    n.Fragment,
    null,
    n.createElement(
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
      n.createElement(
        "div",
        { style: { marginBottom: 16 } },
        n.createElement(d, {
          placeholder: "搜索模板名称或类别...",
          value: q,
          onChange: (k) => L(k.target.value),
          allowClear: !0
        })
      ),
      M ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        n.createElement(S, { size: "large" }),
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
                  C,
                  { strong: !0, style: { fontSize: 15 } },
                  "从空白模版开始创建"
                ),
                n.createElement(
                  "div",
                  null,
                  n.createElement(
                    s,
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
        ...I.map(
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
                n.createElement(Re, {
                  name: k.name,
                  size: 40
                }),
                n.createElement(
                  "div",
                  { style: { flex: 1 } },
                  n.createElement(
                    C,
                    { strong: !0, style: { fontSize: 15 } },
                    k.name
                  ),
                  n.createElement(
                    "div",
                    null,
                    n.createElement(
                      s,
                      { color: "blue", style: { fontSize: 10 } },
                      k.category
                    ),
                    k.approval_level === "MANUAL" ? n.createElement(
                      s,
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
                Bt(k.description, n)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    n.createElement(El, {
      open: Z,
      onCancel: () => B(!1),
      onCreate: N
    })
  );
}
function El({
  open: e,
  onCancel: t,
  onCreate: a
}) {
  const n = T().React, { useState: l, useEffect: o } = n, { Modal: r, Input: s, message: d } = T().antd, [c, u] = l(""), [S, O] = l(""), [A, C] = l(!1);
  return o(() => {
    e && (u(""), O(""), C(!1));
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
        C(!0), Promise.resolve(a(c.trim(), S.trim())).finally(() => {
          C(!1);
        });
      },
      okText: "创建",
      cancelText: "取消",
      okButtonProps: { loading: A },
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
      n.createElement(s, {
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
      n.createElement(s.TextArea, {
        placeholder: "简要描述该专家的职责和能力...",
        value: S,
        onChange: (p) => O(p.target.value),
        rows: 3,
        maxLength: 200
      })
    )
  );
}
function Nn({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: a
}) {
  const n = T().React, { useState: l, useEffect: o, useCallback: r } = n, {
    List: s,
    Tag: d,
    Switch: c,
    Button: u,
    Modal: S,
    Input: O,
    Spin: A,
    Empty: C,
    message: p,
    Typography: M
  } = T().antd, { FileTextOutlined: $, PlusOutlined: q, EditOutlined: L, ReloadOutlined: Z } = T().antdIcons || {}, { Text: B } = M, [N, I] = l([]), [x, k] = l(!0), [X, D] = l(
    t || []
  ), [P, E] = l(!1), [v, f] = l(null), [K, G] = l(""), [ae, w] = l(""), [g, h] = l(!1), b = r(async () => {
    k(!0);
    try {
      const U = await Wa(e);
      I(U);
    } catch (U) {
      p.error(U.message || "加载记忆文件失败"), I([]);
    } finally {
      k(!1);
    }
  }, [e]);
  o(() => {
    b();
  }, [b]), o(() => {
    D(t || []);
  }, [t]);
  const se = async (U, J) => {
    const re = new Set(X);
    if (J)
      re.add(U);
    else {
      if (fn.includes(U) && U === "AGENTS.md") {
        p.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      re.delete(U);
    }
    const y = Array.from(re);
    D(y);
    try {
      await gn(e, y), p.success(J ? "已启用记忆文件" : "已停用记忆文件"), a();
    } catch (te) {
      p.error(te.message || "更新失败"), D(t || []);
    }
  }, j = async (U) => {
    try {
      const J = await le(
        `/workspace/files/${encodeURIComponent(U)}`,
        { headers: { "X-Agent-Id": e } }
      );
      f(U), G(J.content || ""), E(!0);
    } catch (J) {
      p.error(J.message || "读取文件失败");
    }
  }, Y = () => {
    f(null), G(""), w(""), E(!0);
  }, ie = async () => {
    const U = v || ae.trim();
    if (!U) {
      p.warning("请输入文件名");
      return;
    }
    const J = U.endsWith(".md") ? U : `${U}.md`;
    h(!0);
    try {
      if (await Et(e, J, K), !v && !X.includes(J)) {
        const re = [...X, J];
        D(re), await gn(e, re);
      }
      p.success("保存成功"), E(!1), b(), a();
    } catch (re) {
      p.error(re.message || "保存失败");
    } finally {
      h(!1);
    }
  };
  return x ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(A, { size: "large" })
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
          `· 已挂载 ${X.length} 个到专家记忆`
        )
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          u,
          {
            size: "small",
            icon: Z ? n.createElement(Z) : void 0,
            onClick: b
          },
          "刷新"
        ),
        n.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: q ? n.createElement(q) : void 0,
            onClick: Y
          },
          "新建记忆文件"
        )
      )
    ),
    N.length === 0 ? n.createElement(C, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: C.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(s, {
      dataSource: N,
      renderItem: (U) => {
        const J = X.includes(U.filename), re = fn.includes(U.filename);
        return n.createElement(
          s.Item,
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
          n.createElement(s.Item.Meta, {
            avatar: n.createElement($, {
              style: {
                fontSize: 20,
                color: J ? "#1677ff" : "#bfbfbf"
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
            checked: J,
            size: "small",
            onChange: (y) => se(U.filename, y)
          })
        );
      }
    }),
    // Edit/New file modal
    n.createElement(
      S,
      {
        open: P,
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
        n.createElement(O, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: ae,
          onChange: (U) => w(U.target.value),
          addonAfter: ae.endsWith(".md") ? "" : ".md"
        })
      ),
      n.createElement(O.TextArea, {
        value: K,
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
function hl({
  skills: e,
  agentId: t
}) {
  const a = T().React, { useMemo: n } = a, {
    List: l,
    Tag: o,
    Typography: r,
    Empty: s,
    Button: d,
    message: c
  } = T().antd, { ThunderboltOutlined: u, CopyOutlined: S } = T().antdIcons || {}, { Text: O } = r, A = n(() => On(e), [e]), C = (M) => {
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
  return A.length === 0 ? a.createElement(s, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: s.PRESENTED_IMAGE_SIMPLE
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
        O,
        { strong: !0 },
        `推荐提问 (${A.length})`
      ),
      a.createElement(
        O,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    a.createElement(l, {
      dataSource: A,
      renderItem: (M, $) => a.createElement(
        l.Item,
        {
          actions: [
            a.createElement(
              d,
              {
                type: "link",
                size: "small",
                icon: S ? a.createElement(S) : void 0,
                onClick: () => p(M)
              },
              "复制"
            )
          ]
        },
        a.createElement(l.Item.Meta, {
          avatar: a.createElement(
            o,
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
              onClick: () => C(M)
            },
            M.value
          ),
          description: a.createElement(
            O,
            { type: "secondary", style: { fontSize: 12 } },
            M.label
          )
        })
      )
    })
  );
}
function vl() {
  var ce;
  const e = T().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, {
    Spin: o,
    Empty: r,
    Input: s,
    Button: d,
    message: c,
    Row: u,
    Col: S,
    Tabs: O,
    Modal: A,
    Typography: C
  } = T().antd, {
    ReloadOutlined: p,
    PlusOutlined: M,
    SearchOutlined: $,
    TeamOutlined: q,
    UserOutlined: L
  } = T().antdIcons || {}, { Text: Z, Paragraph: B } = C, [N, I] = t([]), [x, k] = t(!0), [X, D] = t(!1), [P, E] = t(null), [v, f] = t(""), [K, G] = t(!1), [ae, w] = t("experts"), [g, h] = t(
    null
  ), [b, se] = t(""), [j, Y] = t(!1), [ie, U] = t(!1), [J, re] = t(null), [y, te] = t([]), m = n(async () => {
    k(!0);
    try {
      const H = await Rt(), pe = await Promise.all(
        H.map(async (Ee) => {
          try {
            const [be, ke, ze] = await Promise.all([
              Lt(Ee.id).catch(() => null),
              vt(Ee.id).catch(() => []),
              Dt(Ee.id).catch(() => [])
            ]);
            return {
              agent: Ee,
              config: be,
              skills: ke,
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
      I(pe), te(H);
    } catch (H) {
      c.error(H.message || "加载专家列表失败"), I([]);
    } finally {
      k(!1);
    }
  }, []);
  a(() => {
    m();
  }, [m]), a(() => {
    if (J && ie) {
      const H = N.find(
        (pe) => pe.agent.id === J.agent.id
      );
      H && H !== J && re(H);
    }
  }, [N, J, ie]);
  const ee = n(
    async (H) => {
      var ke;
      const pe = H.coordinatorName || ((ke = H.members[0]) == null ? void 0 : ke.name);
      if (!pe) {
        c.error("无法确定协调者专家");
        return;
      }
      const Ee = yt(y, pe);
      if (!Ee) {
        c.error(`未找到协调者专家「${pe}」，请先创建该专家`);
        return;
      }
      if (/\{.+?\}/.test(H.taskTemplate)) {
        se(""), h(H);
        return;
      }
      await z(H, Ee, H.taskTemplate);
    },
    [y, c]
  ), z = n(
    async (H, pe, Ee) => {
      var be;
      Y(!0);
      try {
        const ke = Da(H), ze = Ee ? ke.replace(H.taskTemplate, Ee) : ke, Ue = T();
        Ue.setSelectedAgent && Ue.setSelectedAgent(pe), await Na(pe, ze), c.success(
          `团队任务已发起，协调者：${H.coordinatorName || ((be = H.members[0]) == null ? void 0 : be.name)}`
        ), h(null), oe("/chat");
      } catch (ke) {
        c.error(ke.message || "发起团队任务失败");
      } finally {
        Y(!1);
      }
    },
    [c]
  ), oe = (H) => {
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
      c.success(`已召唤专家「${H.agent.name}」，正在跳转至对话...`), oe("/chat");
    },
    [c]
  ), ue = l(() => {
    if (!v.trim()) return N;
    const H = v.toLowerCase();
    return N.filter(
      (pe) => {
        var Ee;
        return pe.agent.name.toLowerCase().includes(H) || ((Ee = pe.agent.description) == null ? void 0 : Ee.toLowerCase().includes(H)) || pe.agent.id.toLowerCase().includes(H) || pe.skills.some((be) => be.name.toLowerCase().includes(H));
      }
    );
  }, [N, v]), V = N.filter((H) => H.agent.enabled).length, W = N.reduce(
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
          e.createElement(s, {
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
          e.createElement(o, { size: "large" })
        ) : ue.length === 0 ? e.createElement(r, {
          description: v ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          u,
          { gutter: [12, 12], align: "stretch" },
          ...ue.map(
            (H) => e.createElement(
              S,
              {
                key: H.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(gl, {
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
        q ? e.createElement(q, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(Ha, {
        agents: y,
        onLaunch: ee
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(bt, {
      title: "专家",
      subtitle: `共 ${N.length} 位专家（${V} 位启用）· ${W} 个技能 · ${_} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          d,
          {
            icon: p ? e.createElement(p) : void 0,
            onClick: () => {
              Ke(), m();
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
            style: Oe
          },
          "创建专家"
        )
      )
    }),
    e.createElement(O, {
      items: F,
      activeKey: ae,
      onChange: (H) => w(H)
    }),
    // Drawer
    e.createElement(fl, {
      expert: P,
      open: X,
      onClose: () => D(!1),
      onRefresh: () => m()
    }),
    // Template Modal
    e.createElement(yl, {
      open: K,
      onClose: () => G(!1),
      onCreated: () => m()
    }),
    // Config Modal (gear icon)
    e.createElement(pl, {
      expert: J,
      open: ie,
      onClose: () => U(!1),
      onRefresh: () => m()
    }),
    // Team Launch Modal (for filling placeholders)
    g ? e.createElement(
      A,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(Gt, {
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
          var be;
          const H = g.coordinatorName || ((be = g.members[0]) == null ? void 0 : be.name), pe = H ? yt(y, H) : null;
          if (!pe) {
            c.error("无法找到协调者专家");
            return;
          }
          let Ee = g.taskTemplate;
          b.trim() && (Ee = b.trim()), z(g, pe, Ee);
        },
        confirmLoading: j,
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
        e.createElement(s.TextArea, {
          value: b,
          onChange: (H) => se(H.target.value),
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
          `协调者: ${g.coordinatorName || ((ce = g.members[0]) == null ? void 0 : ce.name) || "—"} · 成员: ${g.members.map((H) => H.name).join("、")}`
        )
      )
    ) : null
  );
}
const Dn = [
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
], bl = {
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
function Je(e) {
  return (e || "").trim();
}
function Fn(e) {
  const t = Je(e);
  return t === "" || t === "*";
}
function St(e) {
  return e === "user" ? "user" : "all";
}
function Be(e) {
  const t = St(e.subject_type);
  return {
    source_type: De(e.source_type),
    source_value: Je(e.source_value),
    subject_type: t,
    subject_value: t === "all" ? "" : (e.subject_value || "").trim(),
    effect: e.effect
  };
}
function Xe(e) {
  return { tool_name: e.tool_name || "*", ...Be(e) };
}
function Gn(e) {
  return { tool_name: e.tool_name || "*", effect: e.effect };
}
function Hn(e) {
  return [...e].map(Be).sort(
    (t, a) => t.source_type.localeCompare(a.source_type) || t.source_value.localeCompare(a.source_value) || t.subject_type.localeCompare(a.subject_type) || t.subject_value.localeCompare(a.subject_value)
  );
}
function ht(e) {
  return [...e].map(Xe).sort(
    (t, a) => t.tool_name.localeCompare(a.tool_name) || t.source_type.localeCompare(a.source_type) || t.source_value.localeCompare(a.source_value) || t.subject_type.localeCompare(a.subject_type) || t.subject_value.localeCompare(a.subject_value)
  );
}
function Wn(e) {
  return [...e].map(Gn).sort((t, a) => t.tool_name.localeCompare(a.tool_name));
}
function Le(e) {
  return {
    default_effect: e.default_effect || "deny",
    client_overrides: Hn(e.client_overrides || []),
    tool_defaults: Wn(e.tool_defaults || []),
    tool_overrides: ht(e.tool_overrides || []),
    unmanaged_rules_count: e.unmanaged_rules_count || 0
  };
}
function Me(e) {
  return [De(e.source_type), Je(e.source_value), St(e.subject_type), e.subject_type === "all" ? "" : (e.subject_value || "").trim()].join("\0");
}
function $e(e) {
  return [e.tool_name || "*", De(e.source_type), Je(e.source_value), St(e.subject_type), e.subject_type === "all" ? "" : (e.subject_value || "").trim()].join("\0");
}
function Sl(e, t) {
  const a = Le(t), n = /* @__PURE__ */ new Map();
  a.tool_overrides.forEach((c) => {
    const u = Xe(c), S = n.get(u.tool_name) || [];
    S.push(u), n.set(u.tool_name, S);
  });
  const l = new Map(a.tool_defaults.map((c) => [c.tool_name, Gn(c)])), o = new Set(e.map((c) => c.name)), r = e.map((c) => {
    var u;
    return {
      toolName: c.name,
      description: c.description,
      inputSchema: c.input_schema,
      stale: !1,
      defaultEffect: ((u = l.get(c.name)) == null ? void 0 : u.effect) || a.default_effect,
      hasExplicitDefault: l.has(c.name),
      rules: ht(n.get(c.name) || [])
    };
  }), s = /* @__PURE__ */ new Set([...n.keys(), ...l.keys()]), d = Array.from(s).filter((c) => c !== "*" && !o.has(c)).map((c) => {
    var u;
    return {
      toolName: c,
      description: "",
      inputSchema: {},
      stale: !0,
      defaultEffect: ((u = l.get(c)) == null ? void 0 : u.effect) || a.default_effect,
      hasExplicitDefault: l.has(c),
      rules: ht(n.get(c) || [])
    };
  });
  return [...r, ...d];
}
function Jn(e, t) {
  const a = Le(e), n = new Set(
    t === null ? a.client_overrides.map((l) => Me(Be(l))) : a.tool_overrides.filter((l) => l.tool_name === t).map((l) => $e(Xe(l)))
  );
  for (const l of Dn) {
    const o = t === null ? Me({ source_type: "channel", source_value: l, subject_type: "all", subject_value: "" }) : $e({ tool_name: t, source_type: "channel", source_value: l, subject_type: "all", subject_value: "" });
    if (!n.has(o)) return l;
  }
  return "console";
}
function wl(e) {
  return It(e, { source_type: "channel", source_value: Jn(e, null), subject_type: "all", subject_value: "", effect: "ask" });
}
function Cl(e, t) {
  return Pt(e, { tool_name: t, source_type: "channel", source_value: Jn(e, t), subject_type: "all", subject_value: "", effect: "ask" });
}
function It(e, t, a) {
  const n = Le(e), l = Be(t), o = Me(a || l), r = Me(l), s = n.client_overrides.filter((d) => {
    const c = Me(Be(d));
    return c !== o && c !== r;
  });
  return s.push(l), { ...n, client_overrides: Hn(s) };
}
function Pt(e, t, a) {
  const n = Le(e), l = Xe(t), o = $e(a || l), r = $e(l), s = n.tool_overrides.filter((d) => {
    const c = $e(Xe(d));
    return c !== o && c !== r;
  });
  return s.push(l), { ...n, tool_overrides: ht(s) };
}
function xl(e, t, a) {
  const n = Le(e), l = n.tool_defaults.filter((o) => o.tool_name !== t);
  return l.push({ tool_name: t, effect: a }), { ...n, tool_defaults: Wn(l) };
}
function kl(e, t) {
  const a = Le(e), n = Me(t);
  return { ...a, client_overrides: a.client_overrides.filter((l) => Me(Be(l)) !== n) };
}
function _l(e, t) {
  const a = Le(e), n = $e(t);
  return { ...a, tool_overrides: a.tool_overrides.filter((l) => $e(Xe(l)) !== n) };
}
function Xn(e, t) {
  const a = De(t.source_type), n = Je(t.source_value);
  if (Fn(n)) return [];
  const l = /* @__PURE__ */ new Map();
  return e.forEach((o) => {
    if (De(o.source_type) !== a || Je(o.source_value) !== n) return;
    const r = (o.subject_value || "").trim();
    !r || l.has(r) || l.set(r, o);
  }), Array.from(l.values());
}
function Tl(e, t) {
  return Xn(e, t).map((a) => ({ label: a.subject_value, value: a.subject_value }));
}
function Ft(e) {
  return De(e.source_type) === "channel" && Fn(e.source_value) && St(e.subject_type) === "user" && !!(e.subject_value || "").trim();
}
function zl(e, t) {
  const a = Be(t);
  return a.subject_type === "user" && !!a.subject_value && a.subject_value !== "*" && e.some((n) => De(n.source_type) === a.source_type) && !Ft(a) && !Xn(e, a).some((n) => n.subject_value === a.subject_value);
}
function Il(e) {
  const t = [...e.client_overrides || [], ...e.tool_overrides || []];
  for (const a of t) {
    const n = Be(a);
    if (n.subject_type === "user") {
      if (!n.subject_value || n.subject_value === "*" || !n.source_value) return { reason: "missingUserValue", rule: a };
      if (Ft(n)) return { reason: "ambiguousUserSource", rule: a };
    }
  }
  return null;
}
function En(e, t) {
  const a = { ...e, ...t };
  return t.subject_type && (a.subject_value = ""), (t.source_type !== void 0 || t.source_value !== void 0) && t.subject_value === void 0 && a.subject_type === "user" && (a.subject_value = ""), a;
}
function Tt(e) {
  return JSON.stringify(Le(e));
}
function Pl({
  client: e,
  agentId: t,
  open: a,
  onClose: n,
  onSave: l
}) {
  const o = T().React, { useState: r, useEffect: s, useMemo: d, useCallback: c } = o, { Modal: u, Spin: S, Empty: O, Button: A, Tag: C, Segmented: p, Select: M, Input: $, AutoComplete: q, Typography: L, message: Z } = T().antd, { PlusOutlined: B, DeleteOutlined: N } = T().antdIcons || {}, { Text: I } = L, [x, k] = r(null), [X, D] = r([]), [P, E] = r([]), [v, f] = r(!1), [K, G] = r(!1), [ae, w] = r(""), [g, h] = r("");
  s(() => {
    if (!a) return;
    let m = !1;
    return (async () => {
      f(!0), D([]), E([]), w("");
      try {
        const z = await Pa(t, e.key);
        if (!m) {
          const oe = Le(z);
          k(oe), h(Tt(oe));
        }
        try {
          const oe = await Aa(t);
          m || E(oe);
        } catch {
          m || E([]);
        }
        if (!e.enabled) {
          m || w("MCP 客户端未启用，无法获取工具列表");
          return;
        }
        try {
          const oe = await Ia(t, e.key);
          m || D(oe);
        } catch (oe) {
          m || w((oe == null ? void 0 : oe.message) || "无法加载工具列表");
        }
      } catch {
        m || (k(null), h(""), w("加载访问策略失败"));
      } finally {
        m || f(!1);
      }
    })(), () => {
      m = !0;
    };
  }, [a, e.key, e.enabled, t]);
  const b = d(() => x ? Sl(X, x) : [], [X, x]), se = d(() => !!(x && Tt(x) !== g), [x, g]), j = (m) => bl[m] || m, Y = c((m) => {
    k((ee) => ee && { ...ee, default_effect: m });
  }, []), ie = c((m, ee) => {
    k((z) => z && It(z, En(m, ee), { source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
  }, []), U = c((m, ee) => {
    k((z) => z && Pt(z, En(m, ee), { tool_name: m.tool_name, source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
  }, []), J = c(async () => {
    if (!x) return;
    const m = Il(x);
    if (m) {
      Z.error(m.reason === "missingUserValue" ? "用户规则缺少用户标识" : "用户来源不明确");
      return;
    }
    G(!0);
    try {
      await l(e.key, x) && (h(Tt(x)), n());
    } finally {
      G(!1);
    }
  }, [x, e.key, l, n, Z]), re = c(() => {
    if (!se || K) {
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
  }, [se, K, n]), y = c((m, ee) => {
    const z = Tl(P, m), oe = Ft(m), de = zl(P, m), ye = [{ label: "所有渠道", value: "*" }, ...Dn.map((F) => ({ label: j(F), value: F }))], fe = [{ label: "所有人", value: "all" }, { label: "指定用户", value: "user" }], ue = ee ? U : ie, V = (F) => {
      k(ee ? (ce) => ce && Pt(ce, { ...m, effect: F }) : (ce) => ce && It(ce, { ...m, effect: F }));
    }, W = () => {
      k(ee ? (F) => F && _l(F, { tool_name: m.tool_name, source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }) : (F) => F && kl(F, { source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
    }, _ = ee ? $e(m) : Me(m);
    return o.createElement(
      "div",
      { key: _, style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto", gap: 6, alignItems: "end", padding: "6px 0", borderBottom: "1px solid #f5f5f5" } },
      // source_type
      o.createElement(
        "div",
        null,
        o.createElement(I, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源类型"),
        o.createElement(M, {
          size: "small",
          style: { width: "100%" },
          value: m.source_type || "channel",
          onChange: (F) => ue(m, { source_type: F, source_value: F === "channel" ? m.source_value || "*" : m.source_value }),
          options: [{ label: "渠道", value: "channel" }, ...m.source_type && m.source_type !== "channel" ? [{ label: m.source_type, value: m.source_type }] : []]
        })
      ),
      // source_value
      o.createElement(
        "div",
        null,
        o.createElement(I, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源"),
        m.source_type === "channel" ? o.createElement(M, { size: "small", style: { width: "100%" }, value: m.source_value || "*", onChange: (F) => ue(m, { source_value: F }), options: ye }) : o.createElement($, { size: "small", placeholder: "来源标识", value: m.source_value, onChange: (F) => ue(m, { source_value: F.target.value }) })
      ),
      // subject_type
      o.createElement(
        "div",
        null,
        o.createElement(I, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "对象类型"),
        o.createElement(M, { size: "small", style: { width: "100%" }, value: m.subject_type, onChange: (F) => ue(m, { subject_type: F }), options: fe })
      ),
      // subject_value
      o.createElement(
        "div",
        null,
        o.createElement(I, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "对象"),
        m.subject_type === "user" ? o.createElement(
          "div",
          null,
          o.createElement(q, {
            size: "small",
            style: { width: "100%" },
            value: m.subject_value,
            options: z,
            placeholder: z.length > 0 ? "用户 ID" : "无近期用户",
            onChange: (F) => ue(m, { subject_value: F }),
            onSelect: (F) => ue(m, { subject_value: F }),
            filterOption: (F, ce) => String((ce == null ? void 0 : ce.value) || "").toLowerCase().includes(F.toLowerCase())
          }),
          oe ? o.createElement(I, { style: { fontSize: 10, color: "#fa8c16", display: "block" } }, "请先选择具体渠道") : null,
          de ? o.createElement(I, { style: { fontSize: 10, color: "#fa8c16", display: "block" } }, "未知的用户标识") : null
        ) : o.createElement($, { size: "small", disabled: !0, value: "所有人" })
      ),
      // effect
      o.createElement(
        "div",
        null,
        o.createElement(I, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "效果"),
        o.createElement(M, {
          size: "small",
          style: { width: "100%" },
          value: m.effect,
          onChange: (F) => V(F),
          options: [{ label: "允许", value: "allow" }, { label: "询问", value: "ask" }, { label: "拒绝", value: "deny" }]
        })
      ),
      // delete
      o.createElement(A, { size: "small", type: "text", icon: o.createElement(N), onClick: W, title: "删除规则" })
    );
  }, [P, ie, U]), te = (m, ee) => {
    const oe = {
      ask: { bg: "rgba(245,158,11,0.24)", border: "rgba(217,119,6,0.36)", text: "#8a4b00" },
      allow: { bg: "rgba(34,197,94,0.22)", border: "rgba(22,163,74,0.35)", text: "#17643a" },
      deny: { bg: "rgba(239,68,68,0.2)", border: "rgba(220,38,38,0.34)", text: "#9f1f26" }
    }[m];
    return o.createElement(p, {
      size: "small",
      value: m,
      onChange: (de) => ee(de),
      style: { "--mcp-policy-segment-bg": oe.bg, "--mcp-policy-segment-border": oe.border, "--mcp-policy-segment-text": oe.text },
      options: [{ label: "询问", value: "ask" }, { label: "允许", value: "allow" }, { label: "拒绝", value: "deny" }]
    });
  };
  return o.createElement(
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
      footer: o.createElement(
        "div",
        { style: { textAlign: "right" } },
        o.createElement(A, { onClick: re, style: { marginRight: 8 } }, "取消"),
        o.createElement(A, { type: "primary", onClick: J, loading: K, disabled: !x || v }, "保存")
      )
    },
    v && !x ? o.createElement("div", { style: { textAlign: "center", padding: 40 } }, o.createElement(S)) : x ? o.createElement(
      "div",
      null,
      // ── Client-level panel ──
      o.createElement(
        "div",
        { style: { marginBottom: 16, padding: "12px 16px", background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" } },
        o.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
          o.createElement(I, { strong: !0 }, "客户端访问策略"),
          o.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 8 } },
            o.createElement(I, { style: { fontSize: 12, color: "#666" } }, "默认:"),
            te(x.default_effect, Y),
            o.createElement(A, { size: "small", icon: o.createElement(B), onClick: () => k((m) => m && wl(m)) }, "添加规则")
          )
        ),
        x.client_overrides.length === 0 ? o.createElement(I, { style: { fontSize: 12, color: "#999" } }, "暂无客户端级覆盖规则") : o.createElement("div", null, ...x.client_overrides.map((m) => y(m, !1)))
      ),
      // ── Error message ──
      ae ? o.createElement("div", { style: { color: "#ff4d4f", fontSize: 12, marginBottom: 8 } }, ae) : null,
      // ── Tool-level panel ──
      o.createElement(I, { strong: !0, style: { display: "block", marginBottom: 8 } }, "工具访问策略"),
      b.length === 0 ? o.createElement(O, { description: "暂无工具" }) : o.createElement(
        "div",
        null,
        ...b.map(
          (m) => o.createElement(
            "div",
            { key: m.toolName, style: { marginBottom: 12, padding: "10px 12px", background: "#fafafa", borderRadius: 6, border: "1px solid #f0f0f0" } },
            o.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 } },
              o.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 6 } },
                o.createElement(C, { color: m.stale ? "default" : "blue" }, m.toolName),
                m.stale ? o.createElement(C, { color: "orange" }, "已失效") : null
              ),
              o.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                o.createElement(I, { style: { fontSize: 12, color: "#666" } }, "默认:"),
                te(m.defaultEffect, (ee) => k((z) => z && xl(z, m.toolName, ee))),
                o.createElement(A, { size: "small", icon: o.createElement(B), onClick: () => k((ee) => ee && Cl(ee, m.toolName)) }, "添加规则")
              )
            ),
            // Tool schema
            m.description || m.inputSchema && Object.keys(m.inputSchema).length > 0 ? o.createElement(
              "details",
              { style: { marginBottom: 6, fontSize: 12 } },
              o.createElement("summary", { style: { cursor: "pointer", color: "#888" } }, "工具详情"),
              m.description ? o.createElement("div", { style: { padding: "4px 0", color: "#666" } }, m.description) : null,
              m.inputSchema && Object.keys(m.inputSchema).length > 0 ? o.createElement("pre", { style: { background: "#f5f5f5", padding: 8, borderRadius: 4, fontSize: 11, overflow: "auto", maxHeight: 200 } }, JSON.stringify(m.inputSchema, null, 2)) : null
            ) : null,
            // Tool rules
            m.rules.length === 0 ? o.createElement(I, { style: { fontSize: 12, color: "#999" } }, "暂无工具级覆盖规则") : o.createElement("div", null, ...m.rules.map((ee) => y(ee, !0)))
          )
        )
      )
    ) : o.createElement("div", { style: { color: "#ff4d4f" } }, "加载访问策略失败")
  );
}
function Ol({
  client: e,
  agentId: t,
  open: a,
  onClose: n,
  onAuthChanged: l
}) {
  var G, ae, w, g, h;
  const o = T().React, { useState: r, useCallback: s, useEffect: d } = o, { Modal: c, Button: u, Input: S, Typography: O, message: A } = T().antd, { Text: C } = O, [p, M] = r("idle"), [$, q] = r(""), [L, Z] = r(!1), [B, N] = r(((G = e.oauth_status) == null ? void 0 : G.client_id) || ""), [I, x] = r(((ae = e.oauth_status) == null ? void 0 : ae.scope) || ""), [k, X] = r(""), [D, P] = r("");
  d(() => {
    if (p !== "waiting") return;
    const b = setInterval(async () => {
      try {
        (await $a(t, e.key)).authorized && (M("success"), l());
      } catch {
      }
    }, 2e3);
    return () => clearInterval(b);
  }, [p, e.key, t, l]);
  const E = p === "success" || p === "idle" && ((w = e.oauth_status) == null ? void 0 : w.authorized) === !0, v = p === "idle" && ((g = e.oauth_status) == null ? void 0 : g.authorized) && e.oauth_status.expires_at > 0 && e.oauth_status.expires_at < Date.now() / 1e3, f = s(async () => {
    var b;
    if (!((b = e.url) != null && b.trim())) {
      q("缺少 URL");
      return;
    }
    M("starting"), q("");
    try {
      const se = await Ma(t, e.key, {
        url: e.url,
        scope: I,
        client_id: B,
        auth_endpoint: k,
        token_endpoint: D
      });
      M("waiting"), window.open(se.auth_url, "_blank", "popup,width=600,height=700");
    } catch (se) {
      M("error"), q((se == null ? void 0 : se.message) || "OAuth 启动失败");
    }
  }, [t, e.key, e.url, I, B, k, D]), K = s(async () => {
    M("revoking");
    try {
      await Ra(t, e.key), M("idle"), l();
    } catch {
      M("idle");
    }
  }, [t, e.key, l]);
  return o.createElement(
    c,
    {
      title: `${e.name || e.key} — OAuth 授权管理`,
      open: a,
      onCancel: n,
      footer: o.createElement("div", { style: { textAlign: "right" } }, o.createElement(u, { onClick: n }, "关闭")),
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
          E || v ? o.createElement(u, { size: "small", onClick: K, loading: p === "revoking" }, "撤销") : null,
          o.createElement(u, { size: "small", type: E && !v ? "default" : "primary", onClick: f, loading: p === "starting" || p === "waiting", disabled: !((h = e.url) != null && h.trim()) }, E && !v ? "重新授权" : "授权")
        )
      ),
      $ ? o.createElement("p", { style: { color: "#c0392b", fontSize: 12 } }, $) : null,
      // Advanced
      o.createElement(
        "div",
        { style: { marginTop: 8, cursor: "pointer", color: "#888", fontSize: 12 }, onClick: () => Z((b) => !b) },
        L ? "收起高级设置" : "展开高级设置"
      ),
      L ? o.createElement(
        "div",
        { style: { marginTop: 8, padding: "10px 12px", background: "white", borderRadius: 6, border: "1px solid #e9ecef" } },
        o.createElement(C, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2 } }, "Client ID"),
        o.createElement(S, { size: "small", placeholder: "留空则使用动态注册", value: B, onChange: (b) => N(b.target.value) }),
        o.createElement(C, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "Scope"),
        o.createElement(S, { size: "small", placeholder: "OAuth scope", value: I, onChange: (b) => x(b.target.value) }),
        o.createElement(C, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "授权端点"),
        o.createElement(S, { size: "small", placeholder: "https://auth.example.com/authorize", value: k, onChange: (b) => X(b.target.value) }),
        o.createElement(C, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "令牌端点"),
        o.createElement(S, { size: "small", placeholder: "https://auth.example.com/token", value: D, onChange: (b) => P(b.target.value) })
      ) : null
    )
  );
}
function Al({
  mcp: e,
  agentId: t,
  onToggle: a,
  onDelete: n,
  onUpdate: l,
  onUpdatePolicy: o,
  onRefresh: r
}) {
  const s = T().React, { useState: d } = s, { Card: c, Tag: u, Tooltip: S, Modal: O, Input: A, Button: C, Typography: p } = T().antd, { Text: M } = p, {
    EyeOutlined: $,
    EyeInvisibleOutlined: q,
    DeleteOutlined: L,
    ToolOutlined: Z
  } = T().antdIcons || {}, [B, N] = d(!1), [I, x] = d(!1), [k, X] = d(!1), [D, P] = d(""), [E, v] = d(!1), [f, K] = d(!1), G = e.transport === "streamable_http" || e.transport === "sse", ae = G ? "Remote" : "Local", w = e.oauth_status, g = Date.now() / 1e3, h = !!(w != null && w.authorized) && w.expires_at > g, b = !!(w != null && w.authorized) && w.expires_at <= g, se = !!w, j = () => {
    P(JSON.stringify(e, null, 2)), v(!1), N(!0);
  }, Y = async () => {
    try {
      const U = JSON.parse(D), J = [
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
      for (const te of J)
        te in U && (re[te] = U[te]);
      await l(e.key, re) && (N(!1), v(!1));
    } catch {
      alert("JSON 格式错误");
    }
  }, ie = JSON.stringify(e, null, 2);
  return s.createElement(
    s.Fragment,
    null,
    s.createElement(
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
      s.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 } },
        s.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0 } },
          s.createElement(
            S,
            { title: e.name },
            s.createElement(M, { strong: !0, style: { fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, e.name || e.key)
          ),
          s.createElement(
            "span",
            { style: { fontSize: 10, padding: "1px 6px", borderRadius: 4, background: G ? "#e6f4ff" : "#f9f0ff", color: G ? "#1677ff" : "#722ed1", flexShrink: 0 } },
            ae
          ),
          // OAuth status icons
          se && b ? s.createElement("span", { style: { fontSize: 11, color: "#e67e22", flexShrink: 0 } }, "⚠") : null,
          se && h ? s.createElement("span", { style: { fontSize: 11, color: "#27ae60", flexShrink: 0 } }, "✓") : null,
          se && !h && !b ? s.createElement("span", { style: { fontSize: 11, color: "#7f8c8d", flexShrink: 0 } }, "🔒") : null
        ),
        s.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, flexShrink: 0 } },
          s.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: e.enabled ? "#52c41a" : "#d9d9d9" } }),
          e.enabled ? "启用" : "停用"
        )
      ),
      // ── Description ──
      s.createElement(
        "p",
        { style: { fontSize: 12, color: "#666", margin: "6px 0 8px", lineHeight: 1.6, minHeight: 36, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } },
        e.description || "-"
      ),
      // ── Footer: tools button + secondary actions ──
      s.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8, marginTop: "auto", paddingTop: 12, borderTop: "1px solid #f0f0f0" } },
        // Tools button
        s.createElement(
          C,
          {
            size: "small",
            icon: Z ? s.createElement(Z) : void 0,
            onClick: (U) => {
              U.stopPropagation(), X(!0);
            },
            style: { width: "100%" }
          },
          "工具与访问策略"
        ),
        // Secondary actions: oauth (remote only) + toggle + delete
        s.createElement(
          "div",
          { style: { display: "grid", gridTemplateColumns: G ? "1fr 1fr 1fr" : "1fr 1fr", gap: 8 } },
          G ? s.createElement(
            C,
            {
              size: "small",
              onClick: (U) => {
                U.stopPropagation(), K(!0);
              },
              style: {
                color: h ? "#27ae60" : b ? "#e67e22" : void 0,
                borderColor: h ? "#27ae60" : b ? "#e67e22" : void 0,
                background: h ? "rgba(39,174,96,0.06)" : b ? "rgba(230,126,34,0.06)" : void 0
              }
            },
            h ? "已授权" : b ? "已过期" : "授权"
          ) : null,
          s.createElement(
            C,
            {
              size: "small",
              icon: e.enabled ? q ? s.createElement(q) : void 0 : $ ? s.createElement($) : void 0,
              onClick: a
            },
            e.enabled ? "禁用" : "启用"
          ),
          s.createElement(
            C,
            {
              size: "small",
              danger: !0,
              icon: L ? s.createElement(L) : void 0,
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
    s.createElement(
      O,
      {
        title: "确认删除",
        open: I,
        onOk: () => {
          x(!1), n();
        },
        onCancel: () => x(!1),
        okText: "确认删除",
        cancelText: "取消",
        okButtonProps: { danger: !0 }
      },
      s.createElement("p", null, `确定要删除 MCP 客户端「${e.name || e.key}」吗？此操作不可撤销。`)
    ),
    // ── JSON Config Modal (click card to view/edit) ──
    s.createElement(
      O,
      {
        title: `${e.name || e.key} - 配置`,
        open: B,
        onCancel: () => {
          N(!1), v(!1);
        },
        footer: s.createElement(
          "div",
          { style: { textAlign: "right" } },
          s.createElement(C, { onClick: () => {
            N(!1), v(!1);
          }, style: { marginRight: 8 } }, "取消"),
          E ? s.createElement(C, { type: "primary", onClick: Y }, "保存") : s.createElement(C, { type: "primary", onClick: () => v(!0) }, "编辑")
        ),
        width: 700
      },
      s.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "密钥类字段（如 API_KEY）可能已被后端脱敏，保存时不会覆盖脱敏值。"
      ),
      E ? s.createElement(A.TextArea, {
        value: D,
        onChange: (U) => P(U.target.value),
        autoSize: { minRows: 15, maxRows: 25 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      }) : s.createElement(
        "pre",
        { style: { backgroundColor: "#f5f5f5", padding: 16, borderRadius: 8, maxHeight: 400, overflow: "auto", fontSize: 13, fontFamily: "Monaco, Courier New, monospace" } },
        ie
      )
    ),
    // ── Access Modal (tools + access policy) ──
    s.createElement(Pl, {
      client: e,
      agentId: t,
      open: k,
      onClose: () => X(!1),
      onSave: o
    }),
    // ── OAuth Modal (remote clients only) ──
    G ? s.createElement(Ol, {
      client: e,
      agentId: t,
      open: f,
      onClose: () => K(!1),
      onAuthChanged: async () => {
        await (r == null ? void 0 : r());
      }
    }) : null
  );
}
const Ot = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, Kn = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, Vn = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function qn(e) {
  return at(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
function hn(e) {
  return at(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function vn(e) {
  const t = e.map(encodeURIComponent).join(",");
  return at(`/ugsci/avatar/team/${t}`);
}
function Re({
  name: e,
  size: t = 32,
  borderRadius: a = "50%"
}) {
  const n = T().React, [l, o] = n.useState(0), r = l === 0 ? hn(e) : `${hn(e)}?_r=${l}`;
  return n.createElement("img", {
    src: r,
    alt: e,
    onError: () => {
      l < 1 && o(l + 1);
    },
    style: { width: t, height: t, borderRadius: a, objectFit: "cover", flexShrink: 0 }
  });
}
function Gt({
  members: e,
  size: t = 32,
  borderRadius: a = "50%"
}) {
  const n = T().React, [l, o] = n.useState(0);
  if (!e || e.length === 0)
    return n.createElement("span", {
      style: { width: t, height: t, display: "inline-block" }
    });
  const r = e.slice(0, 5), s = l === 0 ? vn(r) : `${vn(r)}?_r=${l}`;
  return n.createElement("img", {
    src: s,
    alt: "team",
    onError: () => {
      l < 1 && o(l + 1);
    },
    style: { width: t, height: t, borderRadius: a, objectFit: "cover", flexShrink: 0 }
  });
}
async function Ml() {
  return le("/ugsci/engines/list");
}
async function $l(e) {
  return le("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function Rl(e, t) {
  return le(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function Ll(e) {
  return le(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function jl() {
  return le("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function Bl({
  engine: e,
  onClick: t
}) {
  const a = T().React, { Card: n, Tag: l, Typography: o } = T().antd, { Text: r } = o, s = e.status === "detected", d = Kn[e.category] || "📦", u = Vn.has(e.id) ? a.createElement("img", {
    src: qn(e.id),
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
        borderColor: s ? void 0 : "#d9d9d9",
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
        s ? a.createElement(
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
        Ot[e.category] || e.category
      ) : null,
      e.version ? a.createElement(
        l,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (S) => a.createElement(
          l,
          { key: S, color: "cyan", style: { fontSize: 10 } },
          S
        )
      )
    )
  );
}
function Ul() {
  const e = T().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, {
    Spin: o,
    Empty: r,
    Button: s,
    message: d,
    Row: c,
    Col: u,
    Drawer: S,
    Descriptions: O,
    Tag: A,
    Typography: C,
    Modal: p,
    Input: M,
    Select: $,
    Popconfirm: q,
    Space: L
  } = T().antd, {
    ReloadOutlined: Z,
    SearchOutlined: B,
    PlusOutlined: N,
    EditOutlined: I,
    DeleteOutlined: x,
    CopyOutlined: k,
    ExperimentOutlined: X
  } = T().antdIcons || {}, { Text: D, Paragraph: P } = C, [E, v] = t([]), [f, K] = t(!0), [G, ae] = t(""), [w, g] = t(!1), [h, b] = t(null), [se, j] = t(!1), [Y, ie] = t(null), [U, J] = t({}), [re, y] = t(!1), te = n(async () => {
    K(!0);
    try {
      const V = await Ml();
      v(V.engines || []);
    } catch (V) {
      d.error(V.message || "加载引擎列表失败"), v([]);
    } finally {
      K(!1);
    }
  }, []);
  a(() => {
    te();
  }, [te]);
  const m = l(() => {
    if (!G.trim()) return E;
    const V = G.toLowerCase();
    return E.filter(
      (W) => {
        var _;
        return W.name.toLowerCase().includes(V) || W.vendor.toLowerCase().includes(V) || W.category.toLowerCase().includes(V) || ((_ = W.description) == null ? void 0 : _.toLowerCase().includes(V));
      }
    );
  }, [E, G]);
  E.filter((V) => V.status === "detected").length;
  const ee = n((V) => {
    navigator.clipboard.writeText(V).then(() => d.success("路径已复制")).catch(() => d.error("复制失败"));
  }, []), z = n(() => {
    ie(null), J({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), j(!0);
  }, []), oe = n((V) => {
    ie(V), J({ ...V }), j(!0), g(!1);
  }, []), de = n(async () => {
    var V;
    if (!((V = U.name) != null && V.trim())) {
      d.warning("请输入引擎名称");
      return;
    }
    y(!0);
    try {
      Y ? (await Rl(Y.id, U), d.success("引擎已更新")) : (await $l(U), d.success("引擎已添加")), j(!1), te();
    } catch (W) {
      d.error(W.message || "保存失败");
    } finally {
      y(!1);
    }
  }, [U, Y, te]), ye = n(
    async (V) => {
      try {
        await Ll(V), d.success("引擎已删除"), g(!1), te();
      } catch (W) {
        d.error(W.message || "删除失败");
      }
    },
    [te]
  ), fe = n(async () => {
    K(!0);
    try {
      const V = await jl();
      v(V.engines || []), d.success("自动检测完成");
    } catch (V) {
      d.error(V.message || "检测失败");
    } finally {
      K(!1);
    }
  }, []), ue = n(
    (V, W, _) => {
      const F = U[W] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          D,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          V
        ),
        _ != null && _.select ? e.createElement($, {
          value: F || void 0,
          onChange: (ce) => J((H) => ({ ...H, [W]: ce })),
          style: { width: "100%" },
          options: _.select.options,
          allowClear: !0,
          placeholder: `选择${V}`
        }) : _ != null && _.textarea ? e.createElement(M.TextArea, {
          value: F,
          onChange: (ce) => J((H) => ({ ...H, [W]: ce.target.value })),
          rows: 3,
          placeholder: `输入${V}`
        }) : e.createElement(M, {
          value: F,
          onChange: (ce) => J((H) => ({ ...H, [W]: ce.target.value })),
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
      e.createElement(M, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: B ? e.createElement(B) : void 0,
        value: G,
        onChange: (V) => ae(V.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        s,
        {
          icon: Z ? e.createElement(Z) : void 0,
          onClick: fe,
          loading: f
        },
        "自动检测"
      ),
      e.createElement(
        s,
        {
          type: "primary",
          icon: N ? e.createElement(N) : void 0,
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
    ) : m.length === 0 ? e.createElement(r, {
      description: G ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      c,
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
          e.createElement(Bl, {
            engine: V,
            onClick: () => {
              b(V), g(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    h ? e.createElement(
      S,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            Vn.has(h.id) ? e.createElement("img", {
              src: qn(h.id),
              alt: h.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              Kn[h.category] || "📦"
            )
          ),
          e.createElement("span", null, h.name)
        ),
        open: w,
        onClose: () => g(!1),
        width: 520,
        extra: e.createElement(
          L,
          null,
          e.createElement(
            s,
            {
              size: "small",
              icon: I ? e.createElement(I) : void 0,
              onClick: () => oe(h)
            },
            "编辑"
          ),
          h.is_default ? null : e.createElement(
            q,
            {
              title: "确认删除此引擎？",
              description: h.name,
              onConfirm: () => ye(h.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              s,
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
        O,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          O.Item,
          { label: "引擎名称" },
          h.name
        ),
        e.createElement(
          O.Item,
          { label: "厂商" },
          h.vendor || "—"
        ),
        e.createElement(
          O.Item,
          { label: "分类" },
          h.category ? Ot[h.category] || h.category : "—"
        ),
        e.createElement(
          O.Item,
          { label: "状态" },
          e.createElement(
            A,
            {
              color: h.status === "detected" ? "success" : h.status === "not_found" ? "error" : "default"
            },
            h.status === "detected" ? "✅ 已检测" : h.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          O.Item,
          { label: "版本" },
          h.version || "—"
        ),
        h.executable_path ? e.createElement(
          O.Item,
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
              s,
              {
                size: "small",
                type: "text",
                icon: k ? e.createElement(k) : void 0,
                onClick: () => ee(h.executable_path)
              }
            )
          )
        ) : null,
        h.install_dir ? e.createElement(
          O.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            h.install_dir
          )
        ) : null,
        // Display detected modules with paths
        h.modules && h.modules.length > 0 ? e.createElement(
          O.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...h.modules.map(
              (V) => e.createElement(
                "div",
                {
                  key: V,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  A,
                  { color: "cyan", style: { fontSize: 11 } },
                  V
                ),
                h.module_paths && h.module_paths[V] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  h.module_paths[V]
                ) : null
              )
            )
          )
        ) : null,
        h.license_server ? e.createElement(
          O.Item,
          { label: "许可证服务器" },
          h.license_server
        ) : null,
        e.createElement(
          O.Item,
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
          A,
          { color: "blue" },
          "默认引擎"
        ) : h.is_custom ? e.createElement(
          A,
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
        open: se,
        onOk: de,
        onCancel: () => j(!1),
        okText: Y ? "保存" : "添加",
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
            options: Object.entries(Ot).map(([V, W]) => ({
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
function Nl() {
  const e = T().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, {
    Spin: o,
    Empty: r,
    Input: s,
    Button: d,
    message: c,
    Row: u,
    Col: S,
    Tabs: O,
    Modal: A
  } = T().antd, {
    ReloadOutlined: C,
    PlusOutlined: p,
    SearchOutlined: M,
    ApiOutlined: $,
    RocketOutlined: q
  } = T().antdIcons || {}, { TextArea: L } = s, B = T().useSelectedAgent, N = B ? B() : null, I = (N == null ? void 0 : N.id) || "default", [x, k] = t([]), [X, D] = t(!0), [P, E] = t(""), [v, f] = t("mcp"), [K, G] = t(!1), [ae, w] = t(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [g, h] = t(!1), b = n(async () => {
    D(!0);
    try {
      const m = await xa(I);
      k(m);
    } catch (m) {
      c.error(m.message || "加载 MCP 列表失败"), k([]);
    } finally {
      D(!1);
    }
  }, [I]);
  a(() => {
    b();
  }, [b]);
  const se = n(
    async (m) => {
      try {
        await ka(I, m.key), c.success(m.enabled ? "已禁用" : "已启用"), b();
      } catch (ee) {
        c.error(ee.message || "切换状态失败");
      }
    },
    [I, b]
  ), j = n(async (m) => {
    try {
      await _a(I, m.key), c.success(`MCP「${m.key}」已删除`), b();
    } catch (ee) {
      c.error(ee.message || "删除失败");
    }
  }, [I, b]), Y = n(async () => {
    h(!0);
    try {
      const m = JSON.parse(ae), ee = m.mcpServers || m, z = Object.entries(ee);
      if (z.length === 0) {
        c.warning("未找到 MCP 客户端配置");
        return;
      }
      let oe = !0;
      for (const [de, ye] of z) {
        const fe = ye, ue = fe.url ? "streamable_http" : "stdio", V = {
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
          await Ta(
            I,
            de,
            V
          );
        } catch {
          oe = !1;
        }
      }
      oe && (c.success("MCP 客户端已创建"), G(!1), b());
    } catch (m) {
      m instanceof SyntaxError ? c.error("JSON 格式错误：" + m.message) : c.error(m.message || "创建 MCP 失败");
    } finally {
      h(!1);
    }
  }, [ae, I, b]), ie = l(() => {
    if (!P.trim()) return x;
    const m = P.toLowerCase();
    return x.filter(
      (ee) => {
        var z;
        return ee.name.toLowerCase().includes(m) || ee.key.toLowerCase().includes(m) || ((z = ee.description) == null ? void 0 : z.toLowerCase().includes(m)) || ee.transport.toLowerCase().includes(m);
      }
    );
  }, [x, P]), U = x.filter((m) => m.enabled).length, J = x.reduce((m, ee) => {
    var z;
    return m + (((z = ee.tools) == null ? void 0 : z.length) || 0);
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
      e.createElement(s, {
        placeholder: "搜索能力名称、描述...",
        prefix: M ? e.createElement(M) : void 0,
        value: P,
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
          style: Oe
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
    X ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(o, { size: "large" })
    ) : ie.length === 0 ? e.createElement(r, {
      description: P ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「添加 MCP」创建"
    }) : e.createElement(
      u,
      { gutter: [12, 12], align: "stretch" },
      ...ie.map(
        (m) => e.createElement(
          S,
          {
            key: m.key,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Al, {
            mcp: m,
            agentId: I,
            onToggle: (ee) => {
              ee.stopPropagation(), se(m);
            },
            onDelete: () => {
              j(m);
            },
            onUpdate: async (ee, z) => {
              try {
                return await za(I, ee, z), c.success("MCP 配置已更新"), b(), !0;
              } catch (oe) {
                return c.error(oe.message || "更新 MCP 失败"), !1;
              }
            },
            onUpdatePolicy: async (ee, z) => {
              try {
                return await Oa(I, ee, z), c.success("访问策略已保存"), b(), !0;
              } catch (oe) {
                return c.error(oe.message || "保存访问策略失败"), !1;
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
        q ? e.createElement(q, { style: { fontSize: 14 } }) : null,
        "计算引擎"
      ),
      children: e.createElement(Ul)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(bt, {
      title: "工具",
      subtitle: `MCP: ${x.length} 个客户端（${U} 个启用）· ${J} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          d,
          {
            icon: C ? e.createElement(C) : void 0,
            onClick: () => {
              Ke(), b();
            },
            loading: X
          },
          "刷新"
        )
      )
    }),
    e.createElement(O, {
      items: te,
      activeKey: v,
      onChange: (m) => f(m)
    }),
    // ── Create MCP Modal (mirror console /mcp JSON import) ──
    e.createElement(
      A,
      {
        title: "添加 MCP 客户端 (JSON)",
        open: K,
        onCancel: () => G(!1),
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
      e.createElement(L, {
        value: ae,
        onChange: (m) => w(m.target.value),
        autoSize: { minRows: 12, maxRows: 20 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      })
    )
  );
}
function Dl({
  agentId: e,
  agentName: t,
  onNavigate: a
}) {
  const n = T().React, { useState: l, useEffect: o, useCallback: r } = n, {
    Spin: s,
    Empty: d,
    Button: c,
    Row: u,
    Col: S,
    Card: O,
    Tag: A,
    Checkbox: C,
    Modal: p,
    Typography: M,
    Drawer: $,
    Descriptions: q,
    message: L
  } = T().antd, {
    ReloadOutlined: Z,
    ThunderboltOutlined: B,
    SettingOutlined: N,
    CheckSquareOutlined: I,
    EyeOutlined: x,
    EyeInvisibleOutlined: k,
    DeleteOutlined: X,
    CloseOutlined: D
  } = T().antdIcons || {}, { Text: P, Paragraph: E } = M, [v, f] = l([]), [K, G] = l(!0), [ae, w] = l(!1), [g, h] = l(null), [b, se] = l(!1), [j, Y] = l(
    /* @__PURE__ */ new Set()
  ), [ie, U] = l(!1), [J, re] = l(null), [y, te] = l(!1), m = r(async () => {
    if (e) {
      G(!0);
      try {
        const _ = await vt(e);
        f(_);
      } catch (_) {
        L.error(_.message || "加载技能失败"), f([]);
      } finally {
        G(!1);
      }
    }
  }, [e]);
  o(() => {
    m();
  }, [m]);
  const ee = (_) => {
    Y((F) => {
      const ce = new Set(F);
      return ce.has(_) ? ce.delete(_) : ce.add(_), ce;
    });
  }, z = () => Y(/* @__PURE__ */ new Set()), oe = () => Y(new Set(v.map((_) => _.name))), de = () => {
    b ? (z(), se(!1)) : se(!0);
  }, ye = async () => {
    const _ = Array.from(j);
    if (_.length !== 0) {
      U(!0);
      try {
        const { results: F } = await Ja(e, _), ce = Object.entries(F).filter(
          ([, pe]) => pe.success === !1
        ), H = _.length - ce.length;
        ce.length > 0 ? L.warning(
          `批量启用完成：成功 ${H} 个，失败 ${ce.length} 个`
        ) : L.success(`成功启用 ${_.length} 个技能`), z(), await m();
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
        const { results: F } = await Xa(e, _), ce = Object.entries(F).filter(
          ([, pe]) => pe.success === !1
        ), H = _.length - ce.length;
        ce.length > 0 ? L.warning(
          `批量停用完成：成功 ${H} 个，失败 ${ce.length} 个`
        ) : L.success(`成功停用 ${_.length} 个技能`), z(), await m();
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
          const { results: F } = await Ka(e, _), ce = Object.entries(F).filter(
            ([, pe]) => pe.success === !1
          ), H = _.length - ce.length;
          ce.length > 0 ? L.warning(
            `批量删除完成：成功 ${H} 个，失败 ${ce.length} 个`
          ) : L.success(`成功删除 ${_.length} 个技能`), z(), await m();
        } catch (F) {
          L.error(F.message || "批量删除失败");
        } finally {
          U(!1);
        }
      }
    });
  }, V = async (_) => {
    te(!0);
    try {
      _.enabled === !1 ? (await An(e, _.name), L.success(`已启用技能「${_.name}」`)) : (await Rn(e, _.name), L.success(`已禁用技能「${_.name}」`)), await m();
    } catch (F) {
      L.error(F.message || "操作失败");
    } finally {
      te(!1);
    }
  }, W = (_) => {
    p.confirm({
      title: `确认删除技能「${_.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        te(!0);
        try {
          await Nt(e, _.name), L.success(`已删除技能「${_.name}」`), await m();
        } catch (F) {
          L.error(F.message || "删除失败");
        } finally {
          te(!1);
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
        P,
        { type: "secondary", style: { fontSize: 13 } },
        b ? `已选择 ${j.size} / ${v.length} 个技能` : `共 ${v.length} 个技能`
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        b ? n.createElement(
          n.Fragment,
          null,
          n.createElement(
            c,
            { size: "small", onClick: oe },
            "全选"
          ),
          n.createElement(
            c,
            {
              size: "small",
              icon: D ? n.createElement(D) : void 0,
              onClick: z
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
              icon: X ? n.createElement(X) : void 0,
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
              icon: I ? n.createElement(I) : void 0,
              onClick: de,
              disabled: v.length === 0
            },
            "批量管理"
          ),
          n.createElement(
            c,
            {
              icon: Z ? n.createElement(Z) : void 0,
              onClick: () => {
                Ke(), m();
              }
            },
            "刷新"
          )
        )
      )
    ),
    K ? n.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      n.createElement(s, { size: "large" })
    ) : v.length === 0 ? n.createElement(d, {
      description: "当前智能体未加载任何技能"
    }) : n.createElement(
      u,
      { gutter: [12, 12] },
      ...v.map(
        (_) => n.createElement(
          S,
          { key: _.name, xs: 24, sm: 12, md: 8, lg: 6 },
          n.createElement(
            O,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: b ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: b && j.has(_.name) ? "#0072f5" : void 0,
                borderWidth: b && j.has(_.name) ? 2 : 1
              },
              onClick: () => {
                b ? ee(_.name) : (h(_), w(!0));
              },
              onMouseEnter: () => {
                b || re(_.name);
              },
              onMouseLeave: () => re(null)
            },
            b ? n.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (F) => {
                  F.stopPropagation(), ee(_.name);
                }
              },
              n.createElement(C, {
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
                P,
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
                A,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : n.createElement(
                A,
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
                A,
                { style: { fontSize: 10 } },
                `v${_.version_text}`
              ) : null,
              ...(_.tags || []).slice(0, 3).map(
                (F, ce) => n.createElement(
                  A,
                  { key: ce, color: "blue", style: { fontSize: 10 } },
                  F
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !b && J === _.name ? n.createElement(
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
                    F.stopPropagation(), V(_);
                  }
                },
                _.enabled === !1 ? "启用" : "禁用"
              ),
              n.createElement(
                c,
                {
                  size: "small",
                  danger: !0,
                  icon: X ? n.createElement(X) : void 0,
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
        onClose: () => w(!1),
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
          P,
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
            (_, F) => n.createElement(A, { key: F, color: "blue" }, _)
          )
        )
      ) : null,
      // Skill content preview
      g.content ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          P,
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
function Fl({
  poolSkills: e,
  workspaceSkills: t,
  agents: a,
  loading: n,
  onReload: l,
  agentId: o,
  agentName: r
}) {
  const s = T().React, { useState: d, useMemo: c, useCallback: u } = s, {
    Spin: S,
    Empty: O,
    Input: A,
    Button: C,
    Row: p,
    Col: M,
    Card: $,
    Tag: q,
    Typography: L,
    Drawer: Z,
    Descriptions: B,
    List: N,
    Modal: I,
    message: x
  } = T().antd, {
    ReloadOutlined: k,
    SearchOutlined: X,
    DownloadOutlined: D,
    ThunderboltOutlined: P,
    DeleteOutlined: E,
    PlusOutlined: v
  } = T().antdIcons || {}, { Text: f, Paragraph: K } = L, [G, ae] = d(""), [w, g] = d(!1), [h, b] = d(null), [se, j] = d([]), [Y, ie] = d(!1), [U, J] = d(24), [re, y] = d(null), [te, m] = d(!1), ee = c(() => {
    if (!G.trim()) return e;
    const W = G.toLowerCase();
    return e.filter(
      (_) => {
        var F, ce;
        return _.name.toLowerCase().includes(W) || ((F = _.description) == null ? void 0 : F.toLowerCase().includes(W)) || ((ce = _.tags) == null ? void 0 : ce.some((H) => H.toLowerCase().includes(W)));
      }
    );
  }, [e, G]), z = c(
    () => ee.slice(0, U),
    [ee, U]
  ), oe = u((W) => {
    ae(W), J(24);
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
      if (b(W), j(de(W.name)), g(!0), !W.content) {
        ie(!0);
        try {
          const _ = await wa(W.name);
          b({ ...W, content: _ });
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
      await Ut(o, W.name), x.success(
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
    I.confirm({
      title: `确认从技能池删除「${W.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        m(!0);
        try {
          await qa(W.name), x.success(`已从技能池删除「${W.name}」`), l();
        } catch (_) {
          x.error(_.message || "删除失败");
        } finally {
          m(!1);
        }
      }
    });
  }, V = (W) => {
    window.history.pushState({}, "", W), window.dispatchEvent(new PopStateEvent("popstate"));
  };
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
          marginBottom: 16
        }
      },
      s.createElement(A, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: X ? s.createElement(X) : void 0,
        value: G,
        onChange: (W) => oe(W.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      s.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        s.createElement(
          C,
          {
            icon: k ? s.createElement(k) : void 0,
            onClick: l,
            loading: n,
            size: "small"
          },
          "刷新"
        ),
        s.createElement(
          C,
          {
            type: "primary",
            icon: D ? s.createElement(D) : void 0,
            onClick: () => V("/skill-pool"),
            size: "small",
            style: Oe
          },
          "管理技能池"
        )
      )
    ),
    n ? s.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      s.createElement(S, { size: "large" })
    ) : ee.length === 0 ? s.createElement(O, {
      description: G ? "未找到匹配的技能" : "技能池为空"
    }) : s.createElement(
      s.Fragment,
      null,
      s.createElement(
        p,
        { gutter: [12, 12] },
        ...z.map(
          (W) => s.createElement(
            M,
            { key: W.name, xs: 24, sm: 12, md: 8, lg: 6 },
            s.createElement(
              $,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => ye(W),
                onMouseEnter: () => y(W.name),
                onMouseLeave: () => y(null)
              },
              s.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8
                  }
                },
                W.emoji ? s.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  W.emoji
                ) : s.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "⚡"
                ),
                s.createElement(
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
                W.protected ? s.createElement(
                  q,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              W.description ? s.createElement(
                K,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                W.description
              ) : null,
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
                W.version_text ? s.createElement(
                  q,
                  { style: { fontSize: 10 } },
                  `v${W.version_text}`
                ) : null,
                ...(W.tags || []).slice(0, 3).map(
                  (_, F) => s.createElement(
                    q,
                    { key: F, color: "cyan", style: { fontSize: 10 } },
                    _
                  )
                )
              ),
              // Hover action footer
              re === W.name ? s.createElement(
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
                s.createElement(
                  C,
                  {
                    size: "small",
                    type: "primary",
                    icon: v ? s.createElement(v) : void 0,
                    disabled: te,
                    onClick: (_) => {
                      _.stopPropagation(), fe(W);
                    }
                  },
                  "加载到当前Agent"
                ),
                s.createElement(
                  C,
                  {
                    size: "small",
                    danger: !0,
                    icon: E ? s.createElement(E) : void 0,
                    disabled: te || W.protected,
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
        z.length < ee.length ? s.createElement(
          "div",
          { style: { textAlign: "center", marginTop: 16 } },
          s.createElement(
            C,
            {
              onClick: () => J((W) => W + 24),
              size: "small"
            },
            `加载更多 (剩余 ${ee.length - z.length} 个)`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    h ? s.createElement(
      Z,
      {
        title: s.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          s.createElement(
            "span",
            { style: { fontSize: 18 } },
            h.emoji || "⚡"
          ),
          s.createElement("span", null, h.name)
        ),
        open: w,
        onClose: () => g(!1),
        width: 520,
        extra: s.createElement(
          C,
          {
            type: "primary",
            size: "small",
            icon: P ? s.createElement(P) : void 0,
            onClick: () => V("/skills")
          },
          "管理技能"
        )
      },
      s.createElement(
        B,
        { column: 1, bordered: !0, size: "small" },
        s.createElement(
          B.Item,
          { label: "技能名称" },
          h.name
        ),
        s.createElement(
          B.Item,
          { label: "描述" },
          h.description || "-"
        ),
        h.version_text ? s.createElement(
          B.Item,
          { label: "版本" },
          h.version_text
        ) : null,
        s.createElement(
          B.Item,
          { label: "来源" },
          h.source || "-"
        ),
        s.createElement(
          B.Item,
          { label: "受保护" },
          h.protected ? "是（内置）" : "否"
        ),
        h.sync_status ? s.createElement(
          B.Item,
          { label: "同步状态" },
          h.sync_status
        ) : null,
        h.installed_from ? s.createElement(
          B.Item,
          { label: "安装来源" },
          h.installed_from
        ) : null
      ),
      // Tags
      h.tags && h.tags.length > 0 ? s.createElement(
        "div",
        { style: { marginTop: 16 } },
        s.createElement(
          f,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        s.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...h.tags.map(
            (W, _) => s.createElement(q, { key: _, color: "cyan" }, W)
          )
        )
      ) : null,
      // Installed agents
      s.createElement(
        "div",
        { style: { marginTop: 16 } },
        s.createElement(
          f,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${se.length})`
        ),
        se.length > 0 ? s.createElement(N, {
          size: "small",
          dataSource: se,
          renderItem: (W) => s.createElement(
            N.Item,
            null,
            s.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              s.createElement(Re, { name: W, size: 20 }),
              s.createElement(
                f,
                { style: { fontSize: 13 } },
                W
              )
            )
          )
        }) : s.createElement(
          f,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      Y ? s.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        s.createElement(S, { size: "small" })
      ) : h.content ? s.createElement(
        "div",
        { style: { marginTop: 16 } },
        s.createElement(
          f,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "技能内容"
        ),
        s.createElement(
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
function Gl() {
  const e = T().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, { Tabs: o, message: r } = T().antd, { ThunderboltOutlined: s, AppstoreOutlined: d } = T().antdIcons || {}, u = T().useSelectedAgent, S = u ? u() : null, O = (S == null ? void 0 : S.id) || "default", [A, C] = t([]), [p, M] = t([]), [$, q] = t([]), [L, Z] = t(!0), [B, N] = t("agent-skills"), I = n(async () => {
    Z(!0);
    try {
      const [D, P, E] = await Promise.all([
        jt(!0),
        Rt(),
        Ca()
      ]);
      M(D), C(P), q(E);
    } catch (D) {
      r.error(D.message || "加载技能列表失败"), M([]);
    } finally {
      Z(!1);
    }
  }, []);
  a(() => {
    I();
  }, [I]);
  const x = l(() => {
    const D = A.find((P) => P.id === O);
    return (D == null ? void 0 : D.name) || O;
  }, [A, O]), k = (D) => {
    window.history.pushState({}, "", D), window.dispatchEvent(new PopStateEvent("popstate"));
  }, X = [
    {
      key: "agent-skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        s ? e.createElement(s, { style: { fontSize: 14 } }) : null,
        "当前Agent加载技能"
      ),
      children: e.createElement(Dl, {
        agentId: O,
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
      children: e.createElement(Fl, {
        poolSkills: p,
        workspaceSkills: $,
        agents: A,
        loading: L,
        onReload: I,
        agentId: O,
        agentName: x
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(bt, {
      title: "技能",
      subtitle: `技能池共 ${p.length} 个技能 · 当前智能体：${x}`
    }),
    e.createElement(o, {
      items: X,
      activeKey: B,
      onChange: (D) => N(D)
    })
  );
}
const At = "ugsci.market.githubSources", bn = "https://github.com/anthropics/skills/tree/main/skills", nt = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", Sn = `${nt}/skills`;
function wt(e) {
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
  var l, o;
  const t = {};
  if (e.env && e.env.length > 0)
    for (const r of e.env)
      t[r] = "";
  let a = "🔌";
  const n = (e.icon || "").toLowerCase();
  return n.includes("folder") ? a = "📁" : n.includes("git") ? a = "🌿" : n.includes("github") ? a = "🐙" : n.includes("database") || n.includes("postgres") || n.includes("sqlite") ? a = "🗄️" : n.includes("search") || n.includes("brave") ? a = "🔍" : n.includes("browser") || n.includes("puppeteer") ? a = "🎭" : n.includes("memory") || n.includes("brain") ? a = "🧠" : n.includes("file") || n.includes("fetch") ? a = "🌐" : n.includes("slack") ? a = "💬" : n.includes("google") ? a = "📁" : n.includes("notion") ? a = "📝" : n.includes("jupyter") ? a = "📊" : n.includes("science") || n.includes("flask") ? a = "🔬" : n.includes("book") || n.includes("arxiv") ? a = "📚" : n.includes("patent") && (a = "📜"), {
    id: e.id,
    name: e.name,
    emoji: a,
    category: e.category ? wt(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((l = e.config) == null ? void 0 : l.command) || "",
    args: ((o = e.config) == null ? void 0 : o.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const Yn = "ugsci.market.mcpSources", Qn = "ugsci.market.expertSources";
function Zn(e, t) {
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
function ea(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function Wl() {
  return Zn(Yn, "mcp");
}
function ut(e) {
  ea(Yn, e);
}
function Jl() {
  return Zn(Qn, "expert");
}
function pt(e) {
  ea(Qn, e);
}
function ta(e) {
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
    const o = decodeURIComponent(l[0]), r = decodeURIComponent(l[1]);
    let s = "main", d = "";
    return l.length >= 4 && (l[2] === "tree" || l[2] === "blob") ? (s = decodeURIComponent(l[3]), l.length > 4 && (d = l.slice(4).map(decodeURIComponent).join("/"))) : l.length > 2 && (d = l.slice(2).map(decodeURIComponent).join("/")), d = d.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: o,
      repo: r,
      ref: s || "main",
      skillsPath: d,
      label: `${o}/${r}`,
      platform: n
    };
  } catch {
    return null;
  }
}
function Mt(e, t, a, n = "github") {
  return n === "oss" ? `oss:${e}/${a || "/"}` : `${n}:${e}/${t}:${a || "/"}`;
}
function na(e) {
  try {
    const t = new URL(e.trim()), a = t.hostname.toLowerCase(), n = a.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!n) return null;
    const l = n[1], o = `${t.protocol}//${a}`, r = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
    return r ? {
      endpoint: o,
      prefix: r,
      label: "UGSci 官方",
      platform: "oss"
    } : null;
  } catch {
    return null;
  }
}
function Xl() {
  try {
    const e = localStorage.getItem(At);
    if (!e) {
      const a = [], n = na(Sn);
      n && a.push({
        id: Mt(
          n.endpoint,
          "",
          n.prefix,
          "oss"
        ),
        url: Sn,
        label: n.label,
        owner: n.endpoint,
        repo: "",
        ref: "",
        skillsPath: n.prefix,
        enabled: !0,
        platform: "oss"
      });
      const l = ta(bn);
      return l && a.push({
        id: Mt(
          l.owner,
          l.repo,
          l.skillsPath,
          l.platform
        ),
        url: bn,
        label: l.label,
        owner: l.owner,
        repo: l.repo,
        ref: l.ref,
        skillsPath: l.skillsPath,
        enabled: !0,
        platform: l.platform
      }), localStorage.setItem(At, JSON.stringify(a)), a;
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
function gt(e) {
  try {
    localStorage.setItem(
      At,
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
  let o = "";
  for (const r of l) {
    const s = r.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (s) {
      o = s[1];
      let d = s[2].trim();
      (d.startsWith('"') && d.endsWith('"') || d.startsWith("'") && d.endsWith("'")) && (d = d.slice(1, -1)), o === "name" ? n.name = d : o === "description" ? n.description = d : o === "version" ? n.version = d : o === "author" && (n.author = d);
    }
  }
  return n;
}
async function Vl(e) {
  const t = e.platform === "gitee", a = e.skillsPath ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/") : "", n = t ? `https://gitee.com/api/v5/repos/${e.owner}/${e.repo}/contents/${a}?ref=${encodeURIComponent(e.ref)}` : `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${a}?ref=${encodeURIComponent(e.ref)}`, l = {
    Accept: t ? "application/json" : "application/vnd.github+json"
  };
  t && e.accessToken && (l.Authorization = `token ${e.accessToken}`);
  const o = await fetch(n, {
    headers: l
  });
  if (!o.ok)
    throw new Error(
      `${t ? "Gitee" : "GitHub"} API ${o.status}: ${e.label} (${e.skillsPath || "/"})`
    );
  const r = await o.json();
  if (!Array.isArray(r)) return [];
  const s = r.filter(
    (c) => c.type === "dir" && c.name
  );
  return await Promise.all(
    s.map(async (c) => {
      const u = e.skillsPath ? e.skillsPath + "/" : "", S = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${u}${c.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${u}${c.name}/SKILL.md`, O = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${c.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${c.name}`, A = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: c.name,
        description: "",
        source_url: O,
        html_url: O,
        version: null,
        author: null
      };
      try {
        const C = {};
        t && e.accessToken && (C.Authorization = `token ${e.accessToken}`);
        const p = await fetch(S, {
          headers: C
        });
        if (!p.ok) return A;
        const M = await p.text(), $ = Kl(M);
        return {
          ...A,
          name: $.name || c.name,
          description: $.description || "",
          version: $.version || null,
          author: $.author || null
        };
      } catch {
        return A;
      }
    })
  );
}
async function ql(e) {
  const t = na(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: a, prefix: n } = t, l = n.split("/").map(encodeURIComponent).join("/"), o = `${a}/${l}/manifest.json`, r = await fetch(o);
  if (!r.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${r.status})`
    );
  const s = await r.json(), d = [];
  function c(u) {
    for (const S of u) {
      if (S.type === "collection" && Array.isArray(S.children)) {
        c(S.children);
        continue;
      }
      const O = S.path || S.name || "";
      if (!O) continue;
      const A = O.split("/").map(encodeURIComponent).join("/"), C = `${a}/${l}/${A}`;
      let p = null;
      if (S.metadata) {
        const M = S.metadata.match(/version:\s*"?([\d.]+)"?/);
        M && (p = M[1]);
      }
      d.push({
        sourceId: e.id,
        sourceLabel: e.label,
        name: S.name || O.split("/").pop() || O,
        description: S.description || "",
        source_url: C,
        html_url: C,
        version: p,
        author: null,
        tag: S.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(s) ? c(
    s.map(
      (u) => typeof u == "string" ? { name: u, path: u } : u
    )
  ) : s && Array.isArray(s.skills) && c(s.skills), d.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return d;
}
async function Yl() {
  const e = `${nt}/mcp/manifest.json`, t = await fetch(e);
  if (!t.ok)
    throw new Error(`无法获取 MCP 列表: ${t.status}`);
  const a = await t.json(), n = [], l = {};
  if (a.tag_groups && typeof a.tag_groups == "object")
    for (const [r, s] of Object.entries(a.tag_groups))
      Array.isArray(s) && (l[r] = s, n.push({
        id: r,
        label: wt(r),
        tags: s
      }));
  return { servers: (a.servers || []).map((r) => {
    let s = "";
    const d = r.tags || [];
    for (const [c, u] of Object.entries(l))
      if (u.some((S) => d.includes(S))) {
        s = c;
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
      category: s
    };
  }), categories: n };
}
async function Ql() {
  const e = `${nt}/agents/manifest.json`, t = await fetch(e);
  if (!t.ok)
    throw new Error(`无法获取 Agent 列表: ${t.status}`);
  const a = await t.json(), n = [], l = {};
  if (a.tag_groups && typeof a.tag_groups == "object")
    for (const [r, s] of Object.entries(a.tag_groups))
      Array.isArray(s) && (l[r] = s, n.push({
        id: r,
        label: wt(r),
        tags: s
      }));
  return { agents: (a.agents || []).map((r) => {
    let s = "";
    const d = r.tags || [];
    for (const [c, u] of Object.entries(l))
      if (u.some((S) => d.includes(S))) {
        s = c;
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
      category: s
    };
  }), categories: n };
}
function Zl(e) {
  const t = /* @__PURE__ */ new Set();
  for (const a of e)
    a.tag && t.add(a.tag);
  return Array.from(t).map((a) => ({ id: a, label: a }));
}
async function eo(e) {
  const t = e.filter((o) => o.enabled), a = await Promise.all(
    t.map(async (o) => {
      try {
        return { skills: o.platform === "oss" ? await ql(o) : await Vl(o), error: null, label: o.label };
      } catch (r) {
        return {
          skills: [],
          error: r.message || String(r),
          label: o.label
        };
      }
    })
  ), n = [], l = [];
  for (const o of a)
    n.push(...o.skills), o.error && l.push({ label: o.label, message: o.error });
  return { skills: n, errors: l };
}
function to({
  open: e,
  onClose: t,
  sources: a,
  onChange: n
}) {
  const l = T().React, { useState: o } = l, {
    Modal: r,
    Input: s,
    Button: d,
    List: c,
    Tag: u,
    Switch: S,
    Typography: O,
    Tooltip: A,
    message: C
  } = T().antd, {
    PlusOutlined: p,
    DeleteOutlined: M,
    LinkOutlined: $,
    GithubOutlined: q
  } = T().antdIcons || {}, { Text: L } = O, [Z, B] = o(""), [N, I] = o(""), x = () => {
    const P = Z.trim();
    if (!P) return;
    const E = ta(P);
    if (!E) {
      C.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const v = Mt(E.owner, E.repo, E.skillsPath, E.platform);
    if (a.some((G) => G.id === v)) {
      C.warning("该源已存在");
      return;
    }
    const f = {
      id: v,
      url: P,
      label: E.label,
      owner: E.owner,
      repo: E.repo,
      ref: E.ref,
      skillsPath: E.skillsPath,
      enabled: !0,
      platform: E.platform,
      accessToken: N.trim() || void 0
    }, K = [...a, f];
    gt(K), n(K), B(""), I(""), C.success(`已添加源: ${E.label}`);
  }, k = (P, E) => {
    const v = a.map(
      (f) => f.id === P ? { ...f, enabled: E } : f
    );
    gt(v), n(v);
  }, X = (P, E) => {
    const v = a.map(
      (f) => f.id === P ? { ...f, accessToken: E.trim() || void 0 } : f
    );
    gt(v), n(v);
  }, D = (P) => {
    const E = a.filter((v) => v.id !== P);
    gt(E), n(E), C.success("已移除源");
  };
  return l.createElement(
    r,
    {
      open: e,
      onCancel: t,
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        q ? l.createElement(q, { style: { fontSize: 18 } }) : null,
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
        l.createElement(s, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: Z,
          onChange: (P) => B(P.target.value),
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
      Z.trim() && Z.trim().toLowerCase().includes("gitee.com") ? l.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        l.createElement(
          L,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        l.createElement(s.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: N,
          onChange: (P) => I(P.target.value),
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
      renderItem: (P) => l.createElement(
        c.Item,
        {
          actions: [
            l.createElement(
              A,
              { title: P.enabled ? "点击禁用" : "点击启用" },
              l.createElement(S, {
                size: "small",
                checked: P.enabled,
                onChange: (E) => k(P.id, E)
              })
            ),
            l.createElement(
              A,
              { title: "移除此源" },
              l.createElement(
                d,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: M ? l.createElement(M) : void 0,
                  onClick: () => D(P.id)
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
              { color: P.platform === "gitee" ? "orange" : P.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              P.platform === "gitee" ? "Gitee" : P.platform === "oss" ? "OSS" : "GitHub"
            ),
            l.createElement(
              u,
              { style: { fontSize: 11 } },
              P.label
            ),
            P.skillsPath ? l.createElement(
              L,
              { type: "secondary", style: { fontSize: 11 } },
              `/${P.skillsPath}`
            ) : null,
            P.platform !== "oss" ? l.createElement(
              L,
              { type: "secondary", style: { fontSize: 11 } },
              `@${P.ref}`
            ) : null
          ),
          l.createElement(
            L,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            P.url
          ),
          // Gitee token input for existing Gitee sources
          P.platform === "gitee" ? l.createElement(
            "div",
            { style: { marginTop: 6, display: "flex", gap: 6, alignItems: "center" } },
            l.createElement(
              L,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            l.createElement(s.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: P.accessToken || "",
              onChange: (E) => X(P.id, E.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function wn({
  open: e,
  onClose: t,
  sources: a,
  onChange: n,
  type: l
}) {
  const o = T().React, { useState: r } = o, {
    Modal: s,
    Input: d,
    Button: c,
    List: u,
    Tag: S,
    Switch: O,
    Typography: A,
    Tooltip: C,
    message: p
  } = T().antd, {
    PlusOutlined: M,
    DeleteOutlined: $,
    LinkOutlined: q,
    ApiOutlined: L,
    UserOutlined: Z,
    ImportOutlined: B,
    ExportOutlined: N,
    CopyOutlined: I
  } = T().antdIcons || {}, { Text: x } = A, [k, X] = r(""), [D, P] = r(""), [E, v] = r(""), [f, K] = r(!1), G = l === "mcp" ? "MCP" : "专家模板", ae = l === "mcp" ? L ? o.createElement(L, { style: { fontSize: 18 } }) : null : Z ? o.createElement(Z, { style: { fontSize: 18 } }) : null, w = () => {
    const j = k.trim(), Y = D.trim();
    if (!j) return;
    const ie = Y || j.slice(0, 40), U = `${l}:${j}`;
    if (a.some((y) => y.id === U)) {
      p.warning("该源已存在");
      return;
    }
    const J = {
      id: U,
      label: ie,
      url: j,
      enabled: !0,
      type: l
    }, re = [...a, J];
    l === "mcp" ? ut(re) : pt(re), n(re), X(""), P(""), p.success(`已添加${G}源: ${ie}`);
  }, g = (j, Y) => {
    const ie = a.map(
      (U) => U.id === j ? { ...U, enabled: Y } : U
    );
    l === "mcp" ? ut(ie) : pt(ie), n(ie);
  }, h = (j) => {
    const Y = a.filter((ie) => ie.id !== j);
    l === "mcp" ? ut(Y) : pt(Y), n(Y), p.success("已移除源");
  }, b = () => {
    const j = JSON.stringify(
      { type: l, sources: a },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(j), p.success(`${G}源已复制到剪贴板（${a.length} 个源）`);
    } catch {
      const Y = document.createElement("textarea");
      Y.value = j, document.body.appendChild(Y), Y.select(), document.execCommand("copy"), document.body.removeChild(Y), p.success(`${G}源已复制到剪贴板（${a.length} 个源）`);
    }
  }, se = () => {
    const j = E.trim();
    if (!j) {
      p.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const Y = JSON.parse(j);
      let ie = [];
      if (Array.isArray(Y))
        ie = Y;
      else if (Y && Array.isArray(Y.sources))
        ie = Y.sources;
      else if (Y && typeof Y == "object")
        ie = [Y];
      else
        throw new Error("Invalid format");
      const U = ie.filter(
        (te) => te && typeof te.url == "string" && typeof te.label == "string"
      );
      if (U.length === 0) {
        p.error("未找到有效的源数据");
        return;
      }
      const J = new Set(a.map((te) => te.id)), re = [];
      for (const te of U) {
        const m = te.id || `${l}:${te.url}`;
        J.has(m) || re.push({
          id: m,
          label: te.label,
          url: te.url,
          enabled: te.enabled !== !1,
          type: l
        });
      }
      if (re.length === 0) {
        p.info("所有源均已存在，无新增");
        return;
      }
      const y = [...a, ...re];
      l === "mcp" ? ut(y) : pt(y), n(y), v(""), K(!1), p.success(`成功导入 ${re.length} 个${G}源`);
    } catch (Y) {
      p.error(`JSON 解析失败: ${Y.message || "格式错误"}`);
    }
  };
  return o.createElement(
    s,
    {
      open: e,
      onCancel: t,
      title: o.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        ae,
        o.createElement("span", null, `配置${G}源`)
      ),
      footer: o.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between" } },
        o.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          o.createElement(
            c,
            {
              icon: N ? o.createElement(N) : void 0,
              onClick: b,
              disabled: a.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          o.createElement(
            c,
            {
              icon: B ? o.createElement(B) : void 0,
              onClick: () => K(!f),
              size: "small"
            },
            f ? "隐藏导入" : "导入JSON"
          )
        ),
        o.createElement(
          c,
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
      `配置${G}源地址，支持从远程仓库或团队共享的 JSON 导入${G}配置。`
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
        `粘贴${G}源 JSON（支持从导出的剪贴板内容粘贴）`
      ),
      o.createElement(d.TextArea, {
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
      o.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8 } },
        o.createElement(
          c,
          {
            type: "primary",
            size: "small",
            onClick: se
          },
          "导入"
        ),
        o.createElement(
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
    o.createElement(
      "div",
      { style: { marginBottom: 16, display: "flex", gap: 8, alignItems: "center" } },
      o.createElement(d, {
        placeholder: "源名称（可选，如：团队MCP仓库）",
        value: D,
        onChange: (j) => P(j.target.value),
        style: { width: 200 }
      }),
      o.createElement(d, {
        placeholder: l === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: k,
        onChange: (j) => X(j.target.value),
        onPressEnter: w,
        prefix: q ? o.createElement(q) : void 0,
        style: { flex: 1 }
      }),
      o.createElement(
        c,
        {
          type: "primary",
          icon: M ? o.createElement(M) : void 0,
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
        `已配置源 (${a.length})`
      )
    ),
    o.createElement(u, {
      size: "small",
      bordered: !0,
      dataSource: a,
      renderItem: (j) => o.createElement(
        u.Item,
        {
          actions: [
            o.createElement(
              C,
              { title: j.enabled ? "点击禁用" : "点击启用" },
              o.createElement(O, {
                size: "small",
                checked: j.enabled,
                onChange: (Y) => g(j.id, Y)
              })
            ),
            o.createElement(
              C,
              { title: "移除此源" },
              o.createElement(
                c,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: $ ? o.createElement($) : void 0,
                  onClick: () => h(j.id)
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
              S,
              {
                color: l === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              j.label
            ),
            j.enabled ? null : o.createElement(
              S,
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
            j.url
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
async function no() {
  return le("/market/providers");
}
async function ao(e) {
  return le(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function lo(e, t, a, n, l) {
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
function Cn(e) {
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
async function xn(e, t) {
  const a = { bundle_url: e };
  return t && (a.access_token = t), le("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(a)
  });
}
function oo() {
  const e = T().React, { useState: t, useEffect: a, useCallback: n, useMemo: l, useRef: o } = e, {
    Spin: r,
    Empty: s,
    Input: d,
    Button: c,
    message: u,
    Row: S,
    Col: O,
    Card: A,
    Tag: C,
    Tooltip: p,
    Typography: M,
    Select: $,
    Drawer: q,
    Descriptions: L,
    Tabs: Z,
    Badge: B,
    Progress: N,
    Modal: I
  } = T().antd, {
    ReloadOutlined: x,
    SearchOutlined: k,
    DownloadOutlined: X,
    AppstoreOutlined: D,
    ShopOutlined: P,
    CheckCircleOutlined: E,
    LoadingOutlined: v,
    UserOutlined: f,
    SettingOutlined: K,
    GithubOutlined: G,
    ApiOutlined: ae
  } = T().antdIcons || {}, { Text: w, Paragraph: g, Title: h } = M, [b, se] = t("skills"), [j, Y] = t([]), [ie, U] = t([]), [J, re] = t([]), [y, te] = t(""), [m, ee] = t(""), [z, oe] = t(!1), [de, ye] = t(!1), [fe, ue] = t(
    {}
  ), [V, W] = t(null), [_, F] = t({}), [ce, H] = t([]), [pe, Ee] = t(""), [be, ke] = t(""), [ze, Ue] = t(""), [lt, Ve] = t({}), [Ae, qe] = t(""), [ot, Fe] = t(/* @__PURE__ */ new Set()), [Ie, Ye] = t(null), [Te, xe] = t({}), [Q, we] = t([]), [Ce, _e] = t([]), [Qe, Ze] = t(!1), [he, st] = t(!1), [Pe, et] = t(""), [Ne, Ht] = t([]), [aa, Wt] = t(!1), [la, Jt] = t([]), [oa, Xt] = t(!1), [Kt, Vt] = t([]), [qt, Yt] = t([]), [Qt, Zt] = t(!1), [rt, sa] = t(""), [en, tn] = t([]), [nn, an] = t([]), [ln, on] = t(!1), [it, ra] = t(""), [sn, ia] = t([]), tt = o(null);
  a(() => {
    Promise.all([
      no().catch(() => []),
      ao("zh").catch(() => []),
      Rt().catch(() => [])
    ]).then(([i, R, ne]) => {
      Y(i), U(R), H(ne), ne.length > 0 && (Ee(ne[0].id), qe(ne[0].id));
    });
  }, []);
  const ct = n(async (i) => {
    const R = i ?? Xl();
    if (we(i || R), R.filter((me) => me.enabled).length === 0) {
      _e([]);
      return;
    }
    Ze(!0);
    try {
      const { skills: me, errors: ge } = await eo(R);
      if (_e(me), ia(Zl(me)), ge.length > 0) {
        for (const Se of ge)
          console.warn(`[ugsci] GitHub source '${Se.label}' error: ${Se.message}`);
        u.warning(
          `部分源加载失败: ${ge.map((Se) => Se.label).join(", ")}`
        );
      }
    } catch (me) {
      u.error(me.message || "加载技能源失败"), _e([]);
    } finally {
      Ze(!1);
    }
  }, []), Ct = n(async () => {
    Zt(!0);
    try {
      const { servers: i, categories: R } = await Yl();
      Vt(i), Yt(R);
    } catch (i) {
      console.warn(`[ugsci] MCP manifest error: ${i.message}`), Vt([]), Yt([]);
    } finally {
      Zt(!1);
    }
    on(!0);
    try {
      const { agents: i, categories: R } = await Ql();
      tn(i), an(R);
    } catch (i) {
      console.warn(`[ugsci] Agents manifest error: ${i.message}`), tn([]), an([]);
    } finally {
      on(!1);
    }
  }, []);
  a(() => {
    ct(), Ct(), Ht(Wl()), Jt(Jl());
  }, [ct, Ct]);
  const mt = n(
    async (i, R, ne) => {
      oe(!0);
      try {
        const me = await lo(
          i,
          ne,
          20,
          "zh",
          R || void 0
        );
        ne === void 0 || Object.keys(ne).length === 0 ? re(me.results) : re((ve) => [...ve, ...me.results]);
        const ge = Object.values(me.by_provider || {}).some(
          (ve) => ve.has_more
        );
        ye(ge);
        const Se = {};
        for (const [ve, co] of Object.entries(me.by_provider || {}))
          Se[ve] = (ne[ve] || 1) + 1;
        if (ue(Se), me.errors.length > 0)
          for (const ve of me.errors)
            console.warn(
              `[ugsci] Market provider '${ve.provider}' error: ${ve.message}`
            );
      } catch (me) {
        u.error(me.message || "搜索市场失败"), re([]);
      } finally {
        oe(!1);
      }
    },
    []
  );
  a(() => (tt.current && clearTimeout(tt.current), tt.current = setTimeout(() => {
    mt(y, m, {});
  }, 400), () => {
    tt.current && clearTimeout(tt.current);
  }), [y, m, mt]);
  const ca = () => {
    mt(y, m, fe);
  }, rn = async (i) => {
    const R = `${i.source}:${i.slug}`;
    try {
      F((me) => ({ ...me, [R]: "installing" }));
      const ne = await xn(i.source_url);
      ne.installed && u.success(
        `技能「${ne.name || i.name}」已安装到技能池，可在技能中心查看`
      ), F((me) => {
        const ge = { ...me };
        return delete ge[R], ge;
      });
    } catch (ne) {
      u.error(Cn(ne) || "安装技能失败"), F((me) => {
        const ge = { ...me };
        return delete ge[R], ge;
      });
    }
  }, ma = (i) => {
    window.history.pushState({}, "", i), window.dispatchEvent(new PopStateEvent("popstate"));
  }, da = async (i) => {
    const R = `github:${i.sourceId}:${i.name}`, ne = Q.find((ge) => ge.id === i.sourceId), me = (ne == null ? void 0 : ne.accessToken) || void 0;
    try {
      F((Se) => ({ ...Se, [R]: "installing" }));
      const ge = await xn(i.source_url, me);
      ge.installed && u.success(
        `技能「${ge.name || i.name}」已安装到技能池，可在技能中心查看`
      ), F((Se) => {
        const ve = { ...Se };
        return delete ve[R], ve;
      });
    } catch (ge) {
      u.error(Cn(ge) || "安装技能失败"), F((Se) => {
        const ve = { ...Se };
        return delete ve[R], ve;
      });
    }
  }, xt = l(() => {
    let i = Ce;
    if (Pe && (i = i.filter((R) => R.sourceLabel === Pe)), m && (i = i.filter((R) => R.tag === m)), y.trim()) {
      const R = y.toLowerCase();
      i = i.filter(
        (ne) => {
          var me;
          return ne.name.toLowerCase().includes(R) || ((me = ne.description) == null ? void 0 : me.toLowerCase().includes(R));
        }
      );
    }
    return i;
  }, [Ce, y, Pe, m]), dt = j.filter((i) => i.available), Ge = l(() => {
    if (!Pe) return J;
    const i = dt.find(
      (R) => R.label === Pe
    );
    return i ? J.filter((R) => R.source === i.key) : J;
  }, [J, Pe, dt]), cn = l(() => {
    const i = /* @__PURE__ */ new Set();
    return Q.filter((R) => R.enabled).forEach((R) => i.add(R.label)), dt.forEach((R) => i.add(R.label)), Array.from(i);
  }, [Q, dt]), ua = e.createElement(
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
        onChange: (i) => te(i.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      sn.length > 0 ? e.createElement($, {
        value: m || void 0,
        onChange: (i) => ee(i || ""),
        placeholder: "全部分类",
        allowClear: !0,
        style: { minWidth: 150 },
        options: [
          { value: "", label: "全部分类" },
          ...sn.map((i) => ({ value: i.id, label: i.label }))
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
        c,
        {
          icon: G ? e.createElement(G) : void 0,
          onClick: () => st(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Source filter tags (GitHub sources + market providers)
    cn.length > 0 ? e.createElement(
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
        C,
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
      ...cn.map((i) => {
        const R = Q.find((me) => me.label === i), ne = (R == null ? void 0 : R.platform) === "oss";
        return e.createElement(
          C,
          {
            key: i,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: Pe === i ? ne ? "green" : "blue" : void 0,
            icon: ne ? ae ? e.createElement(ae) : void 0 : G && R ? e.createElement(G) : void 0,
            onClick: () => et(
              Pe === i ? "" : i
            )
          },
          i
        );
      })
    ) : null,
    // GitHub skills section
    Qe && Ce.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      e.createElement(r, {
        tip: "正在加载技能...",
        size: "large"
      })
    ) : xt.length > 0 ? e.createElement(
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
          `技能源 (${xt.length})`
        )
      ),
      e.createElement(
        S,
        { gutter: [12, 12] },
        ...xt.map((i) => {
          const R = `github:${i.sourceId}:${i.name}`, ne = _[R];
          return e.createElement(
            O,
            { key: R, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              A,
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
                  { style: { display: "flex", gap: 4, flexWrap: "wrap" } },
                  // Official OSS skills: show tag as category, no source label
                  i.isOfficial ? i.tag ? e.createElement(
                    C,
                    { color: "geekblue", style: { fontSize: 10 } },
                    i.tag
                  ) : null : e.createElement(
                    C,
                    { color: "blue", style: { fontSize: 10 } },
                    i.sourceLabel
                  ),
                  i.version ? e.createElement(
                    C,
                    { style: { fontSize: 10 } },
                    `v${i.version}`
                  ) : null
                ),
                ne ? e.createElement(
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
                    icon: X ? e.createElement(X) : void 0,
                    onClick: () => da(i)
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
      P ? e.createElement(P, {
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
      e.createElement(r, { size: "large" })
    ) : Ge.length === 0 ? e.createElement(s, {
      description: y ? `未找到匹配「${y}」的技能` : "输入关键词搜索技能市场",
      image: s.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      S,
      { gutter: [12, 12] },
      ...Ge.map((i) => {
        const R = `${i.source}:${i.slug}`, ne = _[R];
        return e.createElement(
          O,
          { key: R, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            A,
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
                  C,
                  { color: "geekblue", style: { fontSize: 10 } },
                  i.source
                ),
                i.version ? e.createElement(
                  C,
                  { style: { fontSize: 10 } },
                  `v${i.version}`
                ) : null
              ),
              ne ? e.createElement(
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
                  icon: X ? e.createElement(X) : void 0,
                  onClick: (me) => {
                    me.stopPropagation(), rn(i);
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
        c,
        { onClick: ca, loading: z },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    V ? e.createElement(
      q,
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
          c,
          {
            type: "primary",
            icon: X ? e.createElement(X) : void 0,
            onClick: () => {
              rn(V);
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
          V.source
        ),
        e.createElement(
          L.Item,
          { label: "描述" },
          V.description || "-"
        ),
        V.version ? e.createElement(
          L.Item,
          { label: "版本" },
          V.version
        ) : null,
        V.author ? e.createElement(
          L.Item,
          { label: "作者" },
          V.author
        ) : null,
        e.createElement(
          L.Item,
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
                w,
                { type: "secondary", style: { fontSize: 11 } },
                i
              )
            )
          )
        )
      ) : null
    ) : null
  ), kt = l(() => {
    let i = en;
    if (it && (i = i.filter((R) => R.category === it)), be.trim()) {
      const R = be.toLowerCase();
      i = i.filter(
        (ne) => ne.name.toLowerCase().includes(R) || ne.description.toLowerCase().includes(R) || ne.tags.some((me) => me.toLowerCase().includes(R))
      );
    }
    return i;
  }, [en, be, it]), pa = async (i) => {
    try {
      let R = i.description;
      if (i.instructions)
        try {
          const ge = await fetch(`${nt}/${i.instructions}`);
          ge.ok && (R = await ge.text());
        } catch {
        }
      let ne = [];
      if (i.skills_manifest)
        try {
          const ge = await fetch(`${nt}/${i.skills_manifest}`);
          if (ge.ok) {
            const Se = await ge.json();
            Array.isArray(Se) ? ne = Se.map((ve) => typeof ve == "string" ? ve : ve.name).filter(Boolean) : Se.skills && (ne = Se.skills.map((ve) => typeof ve == "string" ? ve : ve.name).filter(Boolean));
          }
        } catch {
        }
      const me = await le("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: i.name,
          description: i.description,
          skill_names: ne
        })
      });
      await Et(me.id, "AGENTS.md", R), u.success(`专家「${i.name}」创建成功，已跳转至专家`), ma("/ugsci-experts");
    } catch (R) {
      u.error(R.message || "创建专家失败");
    }
  }, mn = n(async (i) => {
    if (i)
      try {
        const R = await Dt(i);
        Fe(new Set(R.map((ne) => ne.key)));
      } catch {
        Fe(/* @__PURE__ */ new Set());
      }
  }, []);
  a(() => {
    Ae && mn(Ae);
  }, [Ae, mn]);
  const ga = async (i) => {
    if (!Ae) {
      u.warning("请先选择目标专家");
      return;
    }
    if (La(i)) {
      const R = Object.entries(i.env), ne = {};
      for (const [me] of R)
        ne[me] = "";
      xe(ne), Ye(i);
      return;
    }
    await dn(i, i.env || {});
  }, dn = async (i, R) => {
    Ve((ne) => ({ ...ne, [i.id]: !0 }));
    try {
      const ne = i.id;
      await $n(Ae, {
        client_key: ne,
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
      }), u.success(`MCP「${i.name}」已添加到当前专家`), Fe((me) => new Set(me).add(ne));
    } catch (ne) {
      u.error(ne.message || `添加 MCP「${i.name}」失败`);
    } finally {
      Ve((ne) => ({ ...ne, [i.id]: !1 }));
    }
  }, fa = async () => {
    if (!Ie) return;
    const i = [];
    for (const [ne, me] of Object.entries(Te))
      if (!me || !me.trim()) {
        const ge = un[ne];
        i.push((ge == null ? void 0 : ge.label) || ne);
      }
    if (i.length > 0) {
      u.warning(`请填写以下配置项: ${i.join(", ")}`);
      return;
    }
    const R = Ie;
    Ye(null), xe({}), await dn(R, { ...Te });
  }, _t = l(() => {
    let i = Kt;
    if (rt && (i = i.filter((R) => R.category === rt)), ze.trim()) {
      const R = ze.toLowerCase();
      i = i.filter(
        (ne) => ne.name.toLowerCase().includes(R) || ne.description.toLowerCase().includes(R) || ne.tags.some((me) => me.toLowerCase().includes(R))
      );
    }
    return i.map(Hl);
  }, [Kt, ze, rt]), ya = e.createElement(
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
        value: ze,
        onChange: (i) => Ue(i.target.value),
        allowClear: !0,
        style: { maxWidth: 300 }
      }),
      qt.length > 0 ? e.createElement($, {
        value: rt || void 0,
        onChange: (i) => sa(i || ""),
        placeholder: "全部分类",
        allowClear: !0,
        style: { minWidth: 150 },
        options: [
          { value: "", label: "全部分类" },
          ...qt.map((i) => ({ value: i.id, label: i.label }))
        ]
      }) : null,
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        e.createElement(
          w,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "安装到："
        ),
        e.createElement($, {
          value: Ae,
          onChange: (i) => qe(i),
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
    // MCP server cards (dynamic from OSS)
    Qt && _t.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(r, { tip: "正在加载 MCP 服务器...", size: "large" })
    ) : _t.length === 0 ? e.createElement(s, {
      description: "未找到匹配的 MCP 服务器",
      image: s.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      S,
      { gutter: [12, 12] },
      ..._t.map(
        (i) => e.createElement(
          O,
          { key: i.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            A,
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
                i.emoji
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
                    C,
                    { color: "blue", style: { fontSize: 10 } },
                    i.category
                  ),
                  e.createElement(
                    C,
                    {
                      color: i.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    i.transport
                  ),
                  i.env && Object.keys(i.env).length > 0 ? e.createElement(
                    C,
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
              ot.has(i.id) ? e.createElement(
                c,
                { size: "small", disabled: !0 },
                "已安装"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  loading: !!lt[i.id],
                  icon: ae ? e.createElement(ae) : void 0,
                  onClick: () => ga(i)
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
      P ? e.createElement(P, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        w,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Ea = Ie ? e.createElement(
    I,
    {
      title: e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        e.createElement("span", { style: { fontSize: 20 } }, Ie.emoji),
        e.createElement("span", null, `配置 ${Ie.name} 密钥`)
      ),
      open: !!Ie,
      onCancel: () => {
        Ye(null), xe({});
      },
      onOk: fa,
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
      const R = un[i], ne = (R == null ? void 0 : R.isSecret) !== !1;
      return e.createElement(
        "div",
        { key: i, style: { marginBottom: 16 } },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          e.createElement(
            w,
            { strong: !0, style: { fontSize: 13 } },
            (R == null ? void 0 : R.label) || i
          ),
          e.createElement(
            C,
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
        ne ? e.createElement(d.Password, {
          placeholder: `请输入 ${(R == null ? void 0 : R.label) || i}`,
          value: Te[i] || "",
          onChange: (me) => xe((ge) => ({
            ...ge,
            [i]: me.target.value
          })),
          style: { width: "100%" }
        }) : e.createElement(d, {
          placeholder: `请输入 ${(R == null ? void 0 : R.label) || i}`,
          value: Te[i] || "",
          onChange: (me) => xe((ge) => ({
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
  ) : null, ha = e.createElement(
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
        value: be,
        onChange: (i) => ke(i.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      nn.length > 0 ? e.createElement($, {
        value: it || void 0,
        onChange: (i) => ra(i || ""),
        placeholder: "全部分类",
        allowClear: !0,
        style: { minWidth: 150 },
        options: [
          { value: "", label: "全部分类" },
          ...nn.map((i) => ({ value: i.id, label: i.label }))
        ]
      }) : null,
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
    // Agent cards (dynamic from OSS)
    ln && kt.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(r, { tip: "正在加载专家模板...", size: "large" })
    ) : kt.length === 0 ? e.createElement(s, {
      description: "未找到匹配的专家模板",
      image: s.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      S,
      { gutter: [12, 12] },
      ...kt.map(
        (i) => e.createElement(
          O,
          { key: i.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            A,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => pa(i)
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
                    C,
                    { color: "blue", style: { fontSize: 10 } },
                    wt(i.category)
                  ) : null,
                  i.tags.includes("mcp") ? e.createElement(
                    C,
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
                i.tags.filter((R) => R !== "agent" && R !== "template" && R !== "workspace").slice(0, 3).join(" · ") || "专家模板"
              ),
              e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
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
      P ? e.createElement(P, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        w,
        { type: "secondary", style: { fontSize: 12 } },
        "专家模板来自 UGSci 官方源，自动同步更新"
      )
    )
  ), va = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        D ? e.createElement(D, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: ua
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        ae ? e.createElement(ae, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: ya
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        f ? e.createElement(f, { style: { fontSize: 14 } }) : null,
        "专家模板"
      ),
      children: ha
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(bt, {
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
              mt(y, m, {}), ct(), Ct();
            },
            loading: z || Qe || Qt || ln
          },
          "刷新"
        )
      )
    }),
    e.createElement(Z, {
      items: va,
      activeKey: b,
      onChange: (i) => se(i)
    }),
    // Skill source config modal
    e.createElement(to, {
      open: he,
      onClose: () => st(!1),
      sources: Q,
      onChange: (i) => {
        we(i), ct(i);
      }
    }),
    // MCP source config modal
    e.createElement(wn, {
      open: aa,
      onClose: () => Wt(!1),
      sources: Ne,
      onChange: (i) => Ht(i),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    Ea,
    // Expert source config modal
    e.createElement(wn, {
      open: oa,
      onClose: () => Xt(!1),
      sources: la,
      onChange: (i) => Jt(i),
      type: "expert"
    })
  );
}
function so() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const kn = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, _n = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function ro() {
  const e = T(), t = e.React, { useEffect: a, useRef: n } = t, l = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, o = (l == null ? void 0 : l.id) || "default", r = n(null), s = n(null);
  return a(() => {
    if (r.current === o) return;
    r.current = o;
    const d = so(), c = kn[d] || kn.en, u = _n[d] || _n.en;
    let S = !1;
    return (async () => {
      var O, A;
      try {
        const C = await vt(o);
        if (S) return;
        const p = On(C);
        if (s.current) {
          try {
            s.current();
          } catch {
          }
          s.current = null;
        }
        const M = window.QwenPaw;
        (O = M == null ? void 0 : M.chat) != null && O.welcome && (p.length > 0 ? (s.current = M.chat.welcome.set("ugsci", {
          description: c,
          prompts: p
        }), console.info(
          `[ugsci] Injected ${p.length} welcome prompts for agent "${o}"`
        )) : (s.current = M.chat.welcome.set("ugsci", {
          description: c,
          prompts: [u]
        }), console.info(
          `[ugsci] No skills for agent "${o}" — using default prompt`
        )));
      } catch (C) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${o}":`,
          C
        );
        const p = window.QwenPaw;
        if ((A = p == null ? void 0 : p.chat) != null && A.welcome && !S) {
          if (s.current) {
            try {
              s.current();
            } catch {
            }
            s.current = null;
          }
          s.current = p.chat.welcome.set("ugsci", {
            description: c,
            prompts: [u]
          });
        }
      }
    })(), () => {
      S = !0;
    };
  }, [o]), null;
}
function io() {
  var c, u, S;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = T().React, a = "ugsci";
  (u = (c = e.chat) == null ? void 0 : c.rightHeader) != null && u.add ? (e.chat.rightHeader.add(a, t.createElement(ro), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const n = T().antdIcons || {}, l = n.UserSwitchOutlined, o = n.ToolOutlined, r = n.ThunderboltOutlined, s = n.ShopOutlined;
  e.route.add(a, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: vl
  }), e.menu.add(a, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家",
    icon: l ? t.createElement(l, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => He()
  }), e.route.add(a, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: Nl
  }), e.menu.add(a, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "工具",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.capabilities",
    order: 6,
    visible: () => He()
  }), e.route.add(a, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: Gl
  }), e.menu.add(a, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能",
    icon: r ? t.createElement(r, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.skills-center",
    order: 7,
    visible: () => He()
  }), e.route.add(a, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: oo
  }), e.menu.add(a, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 8,
    visible: () => He()
  }), (S = e.sidebar) != null && S.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
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
  for (const O of d) {
    try {
      const C = e.menu.snapshot("primary.agentScoped").find((p) => p.id === O);
      C && e.menu.replace(a, O, {
        ...C,
        visible: () => !He()
      });
    } catch {
    }
    try {
      const C = e.menu.snapshot("primary.settings").find((p) => p.id === O);
      C && e.menu.replace(a, O, {
        ...C,
        visible: () => !He()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active"
  );
}
function $t() {
  try {
    io();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout($t, 500);
  }
}
var Tn;
if ((Tn = window.QwenPaw) != null && Tn.host)
  $t();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), $t());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
